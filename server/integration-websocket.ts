import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Socket } from "net";
import { getSession } from "./replitAuth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

enum MessageType {
  CONNECTED = "connected",
  SESSION_UPDATE = "session_update",
  SESSION_ACTIVATED = "session_activated",
  SESSION_DEACTIVATED = "session_deactivated",
  SESSION_CREATED = "session_created",
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
  ERROR = "error",
  PING = "ping",
  PONG = "pong",
  AUTH_FAILED = "auth_failed",
}

interface ConnectionState {
  id: string;
  userId: string;
  subscribedSessions: Set<string>;
  connectedAt: Date;
  lastActivity: Date;
}

const connections: Map<string, { ws: WebSocket; state: ConnectionState }> = new Map();

function generateConnectionId(): string {
  return `ws-int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function sendMessage(ws: WebSocket, message: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

const sessionMiddleware = getSession();

async function authenticateWebSocket(req: IncomingMessage): Promise<{ userId: string; isOwner: boolean } | null> {
  return new Promise((resolve) => {
    const mockRes = {
      setHeader: () => {},
      writeHead: () => {},
      end: () => {},
    } as any;

    sessionMiddleware(req as any, mockRes, async () => {
      try {
        const session = (req as any).session;
        if (!session) {
          resolve(null);
          return;
        }

        const userId = session.passport?.user?.claims?.sub || session.userId;
        if (!userId) {
          resolve(null);
          return;
        }

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) {
          resolve(null);
          return;
        }

        const isOwner = user.role === "owner" || user.role === "admin" || user.role === "sovereign";
        resolve({ userId, isOwner });
      } catch (error) {
        console.error("[Integration WS] Auth error:", error);
        resolve(null);
      }
    });
  });
}

export function broadcastSessionUpdate(sessionId: string, event: string, data: any): void {
  connections.forEach(({ ws, state }) => {
    if (state.subscribedSessions.has(sessionId) || state.subscribedSessions.has("*")) {
      sendMessage(ws, {
        type: MessageType.SESSION_UPDATE,
        sessionId,
        event,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  });
}

export function broadcastToAll(event: string, data: any): void {
  connections.forEach(({ ws }) => {
    sendMessage(ws, {
      type: event as MessageType,
      data,
      timestamp: new Date().toISOString(),
    });
  });
}

export function initializeIntegrationWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ 
    server, 
    path: "/ws/integrations",
    verifyClient: async (info, callback) => {
      const auth = await authenticateWebSocket(info.req);
      if (!auth || !auth.isOwner) {
        callback(false, 401, "Unauthorized");
        return;
      }
      (info.req as any).authUser = auth;
      callback(true);
    },
  });

  wss.on("connection", (ws, req) => {
    const authUser = (req as any).authUser;
    if (!authUser) {
      sendMessage(ws, {
        type: MessageType.AUTH_FAILED,
        error: "Authentication required",
        errorAr: "التحقق مطلوب",
      });
      ws.close();
      return;
    }

    const connectionId = generateConnectionId();
    const state: ConnectionState = {
      id: connectionId,
      userId: authUser.userId,
      subscribedSessions: new Set(["*"]),
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    connections.set(connectionId, { ws, state });

    sendMessage(ws, {
      type: MessageType.CONNECTED,
      connectionId,
      message: "Connected to Integration WebSocket",
      messageAr: "متصل بخدمة WebSocket للتكاملات",
    });

    ws.on("message", (rawData) => {
      try {
        state.lastActivity = new Date();
        const data = JSON.parse(rawData.toString());

        switch (data.type) {
          case MessageType.PING:
            sendMessage(ws, { type: MessageType.PONG, timestamp: new Date().toISOString() });
            break;

          case MessageType.SUBSCRIBE:
            if (data.sessionId) {
              state.subscribedSessions.add(data.sessionId);
              sendMessage(ws, {
                type: "subscribed",
                sessionId: data.sessionId,
              });
            }
            break;

          case MessageType.UNSUBSCRIBE:
            if (data.sessionId) {
              state.subscribedSessions.delete(data.sessionId);
              sendMessage(ws, {
                type: "unsubscribed",
                sessionId: data.sessionId,
              });
            }
            break;

          default:
            sendMessage(ws, {
              type: MessageType.ERROR,
              error: "Unknown message type",
              errorAr: "نوع رسالة غير معروف",
            });
        }
      } catch (error) {
        sendMessage(ws, {
          type: MessageType.ERROR,
          error: "Invalid message format",
          errorAr: "تنسيق رسالة غير صالح",
        });
      }
    });

    ws.on("close", () => {
      connections.delete(connectionId);
    });

    ws.on("error", () => {
      connections.delete(connectionId);
    });
  });

  console.log("[Integration WebSocket] WebSocket service initialized on /ws/integrations");
  return wss;
}
