import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { conversationMessages, sovereignConversations } from "@shared/schema";
import { encryptSovereignData } from "./sovereign-encryption";
import { eq, sql } from "drizzle-orm";

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
  
  const systemPrompt = data.context?.language === "en" 
    ? `You are WebNova AI, an intelligent assistant for the INFERA WebNova platform. 
       You help developers build digital platforms, write code, debug issues, and deploy applications.
       Be concise, helpful, and provide actionable solutions.`
    : `أنت نوفا AI، المساعد الذكي لمنصة INFERA WebNova.
       تساعد المطورين في بناء المنصات الرقمية، كتابة الكود، تصحيح الأخطاء، ونشر التطبيقات.
       كن موجزاً ومفيداً وقدم حلولاً قابلة للتنفيذ.`;
  
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

// Initialize AI WebSocket server
export function initializeAIWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws/ai",
    maxPayload: 1024 * 1024, // 1MB max payload
    perMessageDeflate: false, // Disable compression for faster streaming
  });
  
  console.log("[AI WebSocket] WebSocket service initialized on /ws/ai");
  
  wss.on("connection", (ws: WebSocket) => {
    const connectionId = generateConnectionId();
    const state: ConnectionState = {
      id: connectionId,
      isAuthenticated: false,
      connectedAt: new Date(),
      lastActivity: new Date(),
      isProcessing: false,
    };
    
    connections.set(connectionId, { ws, state });
    
    // Send connection confirmation
    sendMessage(ws, {
      type: MessageType.CONNECTED,
      connectionId,
      timestamp: Date.now(),
      capabilities: {
        chat: true,
        streaming: true,
        codeExecution: true,
        languages: ["nodejs", "python", "typescript", "shell"],
      },
    });
    
    console.log(`[AI WebSocket] Client connected: ${connectionId}`);
    
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
