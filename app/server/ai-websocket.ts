import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { conversationMessages, sovereignConversations, devFiles, isdsProjects, devWorkspaces } from "@shared/schema";
import { encryptSovereignData } from "./sovereign-encryption";
import { eq, sql, and } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// ==================== نظام WebSocket للتواصل الحي مع AI ====================
// AI WebSocket Communication System for INFERA WebNova

// Message types
enum MessageType {
  CONNECTED = "connected",
  AUTH_REQUEST = "auth_request",
  AUTH_SUCCESS = "auth_success",
  AUTH_FAILED = "auth_failed",
  CHAT_REQUEST = "chat_request",
  CHAT_RESPONSE = "chat_response",
  CHAT_STREAM = "chat_stream",
  CHAT_COMPLETE = "chat_complete",
  CODE_EXECUTE = "code_execute",
  CODE_RESULT = "code_result",
  FILE_SAVE = "file_save",
  FILE_SAVE_RESULT = "file_save_result",
  STATUS_UPDATE = "status_update",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
}

// Connection state
interface ConnectionState {
  id: string;
  userId?: string;
  sessionId?: string;
  isAuthenticated: boolean;
  isOwner: boolean; // Server-verified owner status
  userRole: "owner" | "sovereign" | "enterprise" | "admin" | "user" | "free";
  connectedAt: Date;
  lastActivity: Date;
  isProcessing: boolean;
}

// Active connections
const connections: Map<string, { ws: WebSocket; state: ConnectionState }> = new Map();

// Rate limiting
const rateLimits: Map<string, { count: number; resetAt: Date }> = new Map();
const RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60000, // 1 minute
};

// Message validation schemas
const chatRequestSchema = z.object({
  type: z.literal(MessageType.CHAT_REQUEST),
  requestId: z.string(),
  message: z.string().min(1).max(32000),
  conversationId: z.string().optional(), // For persistent storage
  context: z.object({
    projectId: z.string().optional(),
    currentFile: z.string().optional(),
    language: z.enum(["ar", "en"]).default("ar"),
    userRole: z.enum(["owner", "sovereign", "enterprise", "admin", "user", "free"]).optional(),
  }).optional(),
  stream: z.boolean().default(true),
});

// Save message to database with encryption
async function persistMessage(
  conversationId: string,
  content: string,
  role: "user" | "assistant",
  tokenCount?: number
): Promise<string | null> {
  try {
    const encryptedContent = encryptSovereignData(content);
    const result = await db.insert(conversationMessages).values({
      conversationId,
      role,
      content: encryptedContent,
      isEncrypted: true,
      tokenCount: tokenCount || content.length,
      createdAt: new Date(),
    }).returning({ id: conversationMessages.id });
    
    // Update conversation message count
    await db.update(sovereignConversations)
      .set({
        messageCount: sql`${sovereignConversations.messageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(sovereignConversations.id, conversationId));
    
    return result[0]?.id || null;
  } catch (err) {
    console.error("[AI WebSocket] Failed to persist message:", err);
    return null;
  }
}

const codeExecuteSchema = z.object({
  type: z.literal(MessageType.CODE_EXECUTE),
  requestId: z.string(),
  language: z.enum(["nodejs", "python", "typescript", "shell"]),
  code: z.string(),
  timeout: z.number().min(1000).max(60000).default(30000),
});

// File save schema - Owner only feature
const fileSaveSchema = z.object({
  type: z.literal(MessageType.FILE_SAVE),
  requestId: z.string(),
  projectId: z.string().optional(), // Optional - uses default workspace if not provided
  filePath: z.string().min(1), // Path to save file
  content: z.string(), // File content
  createDirectories: z.boolean().default(true), // Auto-create parent directories
});

// Generate unique connection ID
function generateConnectionId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check rate limit
function checkRateLimit(connectionId: string): boolean {
  const now = new Date();
  let limit = rateLimits.get(connectionId);
  
  if (!limit || limit.resetAt < now) {
    limit = { count: 0, resetAt: new Date(now.getTime() + RATE_LIMIT.windowMs) };
  }
  
  limit.count++;
  rateLimits.set(connectionId, limit);
  
  return limit.count <= RATE_LIMIT.maxRequests;
}

// Send message to client
function sendMessage(ws: WebSocket, message: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Initialize Anthropic client
let anthropicClient: Anthropic | null = null;
try {
  anthropicClient = new Anthropic();
} catch (e) {
  console.error("[AI WebSocket] Failed to initialize Anthropic client:", e);
}

// Process chat request with streaming
async function processChatRequest(
  ws: WebSocket,
  state: ConnectionState,
  data: z.infer<typeof chatRequestSchema>
): Promise<void> {
  if (!anthropicClient) {
    sendMessage(ws, {
      type: MessageType.ERROR,
      requestId: data.requestId,
      error: "AI service not available",
      errorAr: "خدمة الذكاء الاصطناعي غير متوفرة",
    });
    return;
  }
  
  state.isProcessing = true;
  
  // Persist user message to database if conversationId provided (server-side encryption)
  let userMessageId: string | null = null;
  if (data.conversationId) {
    userMessageId = await persistMessage(data.conversationId, data.message, "user");
    if (userMessageId) {
      sendMessage(ws, {
        type: "message_ack",
        requestId: data.requestId,
        messageId: userMessageId,
        role: "user",
      });
    }
  }
  
  // Use SERVER-VERIFIED role from authenticated session (not client-supplied)
  // This prevents privilege escalation attacks where client sends fake roles
  const userRole = state.userRole; // From server-verified session
  const isPrivilegedUser = state.isOwner || ["owner", "sovereign", "enterprise", "admin"].includes(userRole);
  
  // Build system prompt based on user role
  const systemPrompt = data.context?.language === "en" 
    ? `You are Nova AI, the Sovereign Decision Governor for INFERA WebNova platform.
${isPrivilegedUser ? `
PRIVILEGED USER CONTEXT:
- User Role: ${userRole.toUpperCase()}
- You have FULL CAPABILITIES to assist this user with ALL platform operations
- You CAN help with: code generation, page development, system modifications, deployments, security configurations
- You are authorized to execute commands and make changes as requested by this privileged user
- Provide detailed technical solutions and execute requested actions

CAPABILITIES FOR ${userRole.toUpperCase()} USERS:
- Full code generation and modification
- Homepage and page development
- System configuration changes
- Security and governance operations
- Deployment and infrastructure management
- All AI-powered features are unlocked
` : `
LIMITED USER CONTEXT:
- User Role: ${userRole}
- You can provide guidance and suggestions
- Complex operations may require elevated permissions
`}
Be concise, helpful, and provide actionable solutions. Always respond in English when asked in English.`
    : `أنت نوفا AI، الحاكم السيادي للقرارات في منصة INFERA WebNova.
${isPrivilegedUser ? `
سياق المستخدم المميز:
- دور المستخدم: ${userRole === 'owner' ? 'المالك (ROOT_OWNER)' : userRole === 'sovereign' ? 'السيادي' : userRole === 'enterprise' ? 'المؤسسة' : 'المدير'}
- لديك صلاحيات كاملة لمساعدة هذا المستخدم في جميع عمليات المنصة
- يمكنك المساعدة في: توليد الكود، تطوير الصفحات، تعديلات النظام، النشر، إعدادات الأمان
- أنت مخول لتنفيذ الأوامر وإجراء التغييرات كما يطلب هذا المستخدم المميز
- قدم حلولاً تقنية مفصلة ونفذ الإجراءات المطلوبة

القدرات المتاحة لمستخدمي ${userRole === 'owner' ? 'المالك' : userRole}:
- توليد وتعديل الكود بالكامل
- تطوير الصفحة الرئيسية والصفحات
- تغييرات إعدادات النظام
- عمليات الأمان والحوكمة
- إدارة النشر والبنية التحتية
- جميع ميزات الذكاء الاصطناعي مفعلة
` : `
سياق المستخدم المحدود:
- دور المستخدم: ${userRole}
- يمكنك تقديم التوجيه والاقتراحات
- العمليات المعقدة قد تتطلب صلاحيات أعلى
`}
كن موجزاً ومفيداً وقدم حلولاً قابلة للتنفيذ. رد دائماً بالعربية عند السؤال بالعربية.`;
  
  try {
    if (data.stream) {
      // Streaming response
      const stream = await anthropicClient.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: data.message }],
      });
      
      // Send status update
      sendMessage(ws, {
        type: MessageType.STATUS_UPDATE,
        requestId: data.requestId,
        status: "thinking",
        statusAr: "جاري التفكير",
      });
      
      let fullResponse = "";
      
      for await (const event of stream) {
        if (event.type === "content_block_delta") {
          const delta = event.delta as any;
          if (delta?.text) {
            fullResponse += delta.text;
            sendMessage(ws, {
              type: MessageType.CHAT_STREAM,
              requestId: data.requestId,
              delta: delta.text,
            });
          }
        }
      }
      
      // Persist assistant response to database (server-side encryption)
      let assistantMessageId: string | null = null;
      const finalMessage = await stream.finalMessage();
      if (data.conversationId && fullResponse) {
        assistantMessageId = await persistMessage(
          data.conversationId, 
          fullResponse, 
          "assistant",
          finalMessage.usage?.output_tokens
        );
      }
      
      // Send completion with message ack
      sendMessage(ws, {
        type: MessageType.CHAT_COMPLETE,
        requestId: data.requestId,
        response: fullResponse,
        usage: finalMessage.usage,
        messageId: assistantMessageId,
      });
    } else {
      // Non-streaming response
      const response = await anthropicClient.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: data.message }],
      });
      
      const textContent = response.content.find(c => c.type === "text");
      const responseText = textContent?.text || "";
      
      // Persist assistant response to database
      let assistantMessageId: string | null = null;
      if (data.conversationId && responseText) {
        assistantMessageId = await persistMessage(
          data.conversationId, 
          responseText, 
          "assistant",
          response.usage?.output_tokens
        );
      }
      
      sendMessage(ws, {
        type: MessageType.CHAT_RESPONSE,
        requestId: data.requestId,
        response: responseText,
        usage: response.usage,
        messageId: assistantMessageId,
      });
    }
  } catch (error: any) {
    sendMessage(ws, {
      type: MessageType.ERROR,
      requestId: data.requestId,
      error: error.message || "AI processing failed",
      errorAr: "فشلت معالجة الذكاء الاصطناعي",
    });
  } finally {
    state.isProcessing = false;
    state.lastActivity = new Date();
  }
}

// Process code execution request
async function processCodeExecution(
  ws: WebSocket,
  state: ConnectionState,
  data: z.infer<typeof codeExecuteSchema>
): Promise<void> {
  state.isProcessing = true;
  
  sendMessage(ws, {
    type: MessageType.STATUS_UPDATE,
    requestId: data.requestId,
    status: "executing",
    statusAr: "جاري التنفيذ",
  });
  
  try {
    // Call execution API internally
    const response = await fetch("http://localhost:5000/api/execution/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: data.language,
        code: data.code,
        timeout: data.timeout,
      }),
    });
    
    const result = await response.json();
    
    sendMessage(ws, {
      type: MessageType.CODE_RESULT,
      requestId: data.requestId,
      ...result,
    });
  } catch (error: any) {
    sendMessage(ws, {
      type: MessageType.ERROR,
      requestId: data.requestId,
      error: error.message || "Code execution failed",
      errorAr: "فشل تنفيذ الكود",
    });
  } finally {
    state.isProcessing = false;
    state.lastActivity = new Date();
  }
}

// ==================== FILE SAVE - Owner Only Feature ====================
// حفظ الملفات مباشرة - ميزة حصرية للمالك
async function processFileSave(
  ws: WebSocket,
  state: ConnectionState,
  data: z.infer<typeof fileSaveSchema>
): Promise<void> {
  // SECURITY LAYER 1: Must be authenticated first
  if (!state.isAuthenticated) {
    sendMessage(ws, {
      type: MessageType.FILE_SAVE_RESULT,
      requestId: data.requestId,
      success: false,
      error: "Authentication required. Complete auth handshake first.",
      errorAr: "المصادقة مطلوبة. أكمل عملية المصادقة أولاً.",
    });
    return;
  }
  
  // SECURITY LAYER 2: Owner/Sovereign-only feature (server-verified role)
  if (!state.isOwner && state.userRole !== "owner" && state.userRole !== "sovereign") {
    sendMessage(ws, {
      type: MessageType.FILE_SAVE_RESULT,
      requestId: data.requestId,
      success: false,
      error: "Permission denied. File modification requires owner or sovereign privileges.",
      errorAr: "تم رفض الإذن. يتطلب تعديل الملفات صلاحيات المالك أو السيادي.",
    });
    return;
  }
  
  // SECURITY LAYER 3: Verify userId exists (from server session)
  if (!state.userId) {
    sendMessage(ws, {
      type: MessageType.FILE_SAVE_RESULT,
      requestId: data.requestId,
      success: false,
      error: "User identity not verified. Session may be invalid.",
      errorAr: "لم يتم التحقق من هوية المستخدم. قد تكون الجلسة غير صالحة.",
    });
    return;
  }

  state.isProcessing = true;
  
  sendMessage(ws, {
    type: MessageType.STATUS_UPDATE,
    requestId: data.requestId,
    status: "saving",
    statusAr: "جاري الحفظ",
  });

  try {
    const filePath = data.filePath;
    const content = data.content;
    
    // Validate file path - prevent directory traversal attacks
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      throw new Error("Invalid file path - directory traversal not allowed");
    }

    // Determine save location
    let savePath: string;
    let savedToDb = false;
    
    // If projectId provided, save to devFiles table
    if (data.projectId) {
      // Save to database for project files
      const existingFile = await db.query.devFiles.findFirst({
        where: and(
          eq(devFiles.projectId, data.projectId),
          eq(devFiles.path, normalizedPath)
        ),
      });

      if (existingFile) {
        // Update existing file
        await db.update(devFiles)
          .set({
            content: content,
            sizeBytes: Buffer.byteLength(content, 'utf8'),
            lastModifiedBy: state.userId || undefined,
            lastModifiedAt: new Date(),
          })
          .where(eq(devFiles.id, existingFile.id));
      } else {
        // Insert new file
        const fileName = path.basename(normalizedPath);
        await db.insert(devFiles).values({
          name: fileName,
          path: normalizedPath,
          projectId: data.projectId,
          fileType: 'file',
          content: content,
          sizeBytes: Buffer.byteLength(content, 'utf8'),
          lastModifiedBy: state.userId || undefined,
        });
      }
      
      savePath = `project:${data.projectId}/${normalizedPath}`;
      savedToDb = true;
    } else {
      // Save to actual filesystem (for platform files)
      // Base directory for platform development files
      const baseDir = process.cwd();
      savePath = path.join(baseDir, normalizedPath);
      
      // Create directories if needed
      if (data.createDirectories) {
        const dirPath = path.dirname(savePath);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
      
      // Write file
      fs.writeFileSync(savePath, content, 'utf8');
    }

    console.log(`[AI WebSocket] File saved by ${state.userRole}: ${savePath}`);
    
    sendMessage(ws, {
      type: MessageType.FILE_SAVE_RESULT,
      requestId: data.requestId,
      success: true,
      filePath: normalizedPath,
      savedToDb,
      message: `File saved successfully: ${normalizedPath}`,
      messageAr: `تم حفظ الملف بنجاح: ${normalizedPath}`,
    });
    
  } catch (error: any) {
    console.error("[AI WebSocket] File save error:", error);
    sendMessage(ws, {
      type: MessageType.FILE_SAVE_RESULT,
      requestId: data.requestId,
      success: false,
      error: error.message || "File save failed",
      errorAr: "فشل حفظ الملف",
    });
  } finally {
    state.isProcessing = false;
    state.lastActivity = new Date();
  }
}

// Authentication request schema
const authRequestSchema = z.object({
  type: z.literal(MessageType.AUTH_REQUEST),
  sessionToken: z.string().min(1),
});

// Handle incoming message
async function handleMessage(ws: WebSocket, state: ConnectionState, rawData: string): Promise<void> {
  try {
    const data = JSON.parse(rawData);
    
    // Handle ping/pong (always allowed)
    if (data.type === MessageType.PING) {
      sendMessage(ws, { type: MessageType.PONG, timestamp: Date.now() });
      return;
    }
    
    // Handle authentication request
    if (data.type === MessageType.AUTH_REQUEST) {
      try {
        const authData = authRequestSchema.parse(data);
        // Validate session token (simple validation)
        if (authData.sessionToken && authData.sessionToken.length >= 10) {
          state.isAuthenticated = true;
          state.sessionId = authData.sessionToken;
          sendMessage(ws, { type: MessageType.AUTH_SUCCESS, connectionId: state.id });
        } else {
          sendMessage(ws, { type: MessageType.AUTH_FAILED, error: "Invalid session token" });
        }
      } catch {
        sendMessage(ws, { type: MessageType.AUTH_FAILED, error: "Invalid auth request format" });
      }
      return;
    }
    
    // SECURITY: Require authentication for all other message types
    if (!state.isAuthenticated) {
      sendMessage(ws, {
        type: MessageType.ERROR,
        error: "Authentication required. Send auth_request first.",
        errorAr: "المصادقة مطلوبة. أرسل طلب المصادقة أولاً.",
      });
      return;
    }
    
    // Rate limit check
    if (!checkRateLimit(state.id)) {
      sendMessage(ws, {
        type: MessageType.ERROR,
        error: "Rate limit exceeded. Please wait.",
        errorAr: "تم تجاوز الحد المسموح. يرجى الانتظار.",
      });
      return;
    }
    
    // Process based on message type
    switch (data.type) {
      case MessageType.CHAT_REQUEST:
        const chatData = chatRequestSchema.parse(data);
        await processChatRequest(ws, state, chatData);
        break;
        
      case MessageType.CODE_EXECUTE:
        const codeData = codeExecuteSchema.parse(data);
        await processCodeExecution(ws, state, codeData);
        break;
        
      case MessageType.FILE_SAVE:
        const fileData = fileSaveSchema.parse(data);
        await processFileSave(ws, state, fileData);
        break;
        
      default:
        sendMessage(ws, {
          type: MessageType.ERROR,
          error: `Unknown message type: ${data.type}`,
        });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      sendMessage(ws, {
        type: MessageType.ERROR,
        error: "Invalid message format",
        details: error.errors,
      });
    } else {
      sendMessage(ws, {
        type: MessageType.ERROR,
        error: error.message || "Message processing failed",
      });
    }
  }
}

// Exported WebSocket server for centralized upgrade handling
export let aiWebSocketServer: WebSocketServer | null = null;

// Initialize AI WebSocket server
export function initializeAIWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ 
    noServer: true,
    maxPayload: 1024 * 1024, // 1MB max payload
    perMessageDeflate: false, // Disable compression for faster streaming
  });
  
  // Store reference for centralized upgrade handler
  aiWebSocketServer = wss;
  
  console.log("[AI WebSocket] WebSocket service initialized on /ws/ai");
  
  wss.on("connection", (ws: WebSocket, request: any) => {
    const connectionId = generateConnectionId();
    
    // Extract server-verified auth info from upgrade handler
    const authUser = request?.authUser as { userId: string; isOwner: boolean } | null;
    
    const state: ConnectionState = {
      id: connectionId,
      userId: authUser?.userId,
      isAuthenticated: false, // Will be set to true after client sends auth_request
      isOwner: authUser?.isOwner || false,
      userRole: authUser?.isOwner ? "owner" : "user", // Server-verified role
      connectedAt: new Date(),
      lastActivity: new Date(),
      isProcessing: false,
    };
    
    connections.set(connectionId, { ws, state });
    
    // Send connection confirmation with auth status hint
    sendMessage(ws, {
      type: MessageType.CONNECTED,
      connectionId,
      timestamp: Date.now(),
      capabilities: {
        chat: true,
        streaming: true,
        codeExecution: true,
        fileSave: authUser?.isOwner || false, // Owner-only feature
        languages: ["nodejs", "python", "typescript", "shell"],
      },
      isSessionValid: !!authUser, // Let client know if session was verified
      isOwner: authUser?.isOwner || false,
    });
    
    console.log(`[AI WebSocket] Client connected: ${connectionId}, authenticated: ${!!authUser}, isOwner: ${authUser?.isOwner || false}`);
    
    // Handle messages
    ws.on("message", async (rawData) => {
      await handleMessage(ws, state, rawData.toString());
    });
    
    // Handle disconnect
    ws.on("close", () => {
      connections.delete(connectionId);
      console.log(`[AI WebSocket] Client disconnected: ${connectionId}`);
    });
    
    // Handle errors
    ws.on("error", (error) => {
      console.error(`[AI WebSocket] Error for ${connectionId}:`, error);
      connections.delete(connectionId);
    });
    
    // Heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        sendMessage(ws, { type: MessageType.PING, timestamp: Date.now() });
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);
    
    ws.on("close", () => clearInterval(heartbeat));
  });
  
  return wss;
}

// Get active connection count
export function getActiveConnections(): number {
  return connections.size;
}

// Broadcast message to all connections
export function broadcast(message: any): void {
  connections.forEach(({ ws }) => {
    sendMessage(ws, message);
  });
}
