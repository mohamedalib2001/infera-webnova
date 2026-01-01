import { useState, useEffect, useRef, useCallback } from "react";

// نظام WebSocket للتواصل السريع مع AI
// WebSocket system for fast AI communication

export enum AIMessageType {
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

export interface AIWebSocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  isProcessing: boolean;
  streamingText: string;
  lastResponse: string;
  error: string | null;
  connectionId: string | null;
  isOwner: boolean;
  canSaveFiles: boolean;
}

export type UserRole = "owner" | "sovereign" | "enterprise" | "admin" | "user" | "free";

export interface FileSaveResult {
  success: boolean;
  filePath: string;
  savedToDb?: boolean;
  message?: string;
  messageAr?: string;
  error?: string;
  errorAr?: string;
}

export interface UseAIWebSocketReturn extends AIWebSocketState {
  sendMessage: (message: string, language?: "ar" | "en", conversationId?: string, userRole?: UserRole) => Promise<string>;
  executeCode: (code: string, language: "nodejs" | "python" | "typescript" | "shell") => Promise<any>;
  saveFile: (filePath: string, content: string, projectId?: string) => Promise<FileSaveResult>;
  connect: () => void;
  disconnect: () => void;
}

export function useAIWebSocket(autoConnect: boolean = true): UseAIWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const requestsRef = useRef<Map<string, { resolve: (value: any) => void; reject: (error: any) => void }>>(new Map());
  const streamingRef = useRef<string>("");
  
  const [state, setState] = useState<AIWebSocketState>({
    isConnected: false,
    isAuthenticated: false,
    isProcessing: false,
    streamingText: "",
    lastResponse: "",
    error: null,
    connectionId: null,
    isOwner: false,
    canSaveFiles: false,
  });

  const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case AIMessageType.CONNECTED:
          setState(prev => ({ 
            ...prev, 
            connectionId: data.connectionId,
            isOwner: data.isOwner || false,
            canSaveFiles: data.capabilities?.fileSave || false,
          }));
          // Auto-authenticate with session token
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
            wsRef.current.send(JSON.stringify({
              type: AIMessageType.AUTH_REQUEST,
              sessionToken,
            }));
          }
          break;
          
        case AIMessageType.AUTH_SUCCESS:
          setState(prev => ({ ...prev, isAuthenticated: true, error: null }));
          break;
          
        case AIMessageType.AUTH_FAILED:
          setState(prev => ({ ...prev, isAuthenticated: false, error: data.error }));
          break;
          
        case AIMessageType.STATUS_UPDATE:
          setState(prev => ({ ...prev, isProcessing: true }));
          break;
          
        case AIMessageType.CHAT_STREAM:
          streamingRef.current += data.delta;
          setState(prev => ({ ...prev, streamingText: streamingRef.current }));
          break;
          
        case AIMessageType.CHAT_COMPLETE:
          const fullResponse = data.response;
          setState(prev => ({ 
            ...prev, 
            isProcessing: false, 
            streamingText: "",
            lastResponse: fullResponse,
          }));
          streamingRef.current = "";
          // Resolve the promise for this request
          const completeHandler = requestsRef.current.get(data.requestId);
          if (completeHandler) {
            completeHandler.resolve(fullResponse);
            requestsRef.current.delete(data.requestId);
          }
          break;
          
        case AIMessageType.CHAT_RESPONSE:
          setState(prev => ({ 
            ...prev, 
            isProcessing: false,
            lastResponse: data.response,
          }));
          const responseHandler = requestsRef.current.get(data.requestId);
          if (responseHandler) {
            responseHandler.resolve(data.response);
            requestsRef.current.delete(data.requestId);
          }
          break;
          
        case AIMessageType.CODE_RESULT:
          setState(prev => ({ ...prev, isProcessing: false }));
          const codeHandler = requestsRef.current.get(data.requestId);
          if (codeHandler) {
            codeHandler.resolve(data);
            requestsRef.current.delete(data.requestId);
          }
          break;
          
        case AIMessageType.FILE_SAVE_RESULT:
          setState(prev => ({ ...prev, isProcessing: false }));
          const fileHandler = requestsRef.current.get(data.requestId);
          if (fileHandler) {
            fileHandler.resolve({
              success: data.success,
              filePath: data.filePath,
              savedToDb: data.savedToDb,
              message: data.message,
              messageAr: data.messageAr,
              error: data.error,
              errorAr: data.errorAr,
            });
            requestsRef.current.delete(data.requestId);
          }
          break;
          
        case AIMessageType.ERROR:
          setState(prev => ({ ...prev, isProcessing: false, error: data.error || data.errorAr }));
          const errorHandler = requestsRef.current.get(data.requestId);
          if (errorHandler) {
            errorHandler.reject(new Error(data.error || data.errorAr));
            requestsRef.current.delete(data.requestId);
          }
          break;
          
        case AIMessageType.PONG:
          // Heartbeat response received
          break;
      }
    } catch (err) {
      console.error("[AI WebSocket] Failed to parse message:", err);
    }
  }, []);

  const connect = useCallback(() => {
    console.log("[AI WebSocket] Connect called, current state:", wsRef.current?.readyState);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[AI WebSocket] Already connected, skipping");
      return;
    }
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/ai`;
    console.log("[AI WebSocket] Connecting to:", wsUrl);
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        console.log("[AI WebSocket] Connected successfully!");
      };
      
      wsRef.current.onmessage = handleMessage;
      
      wsRef.current.onclose = (event) => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isAuthenticated: false,
          connectionId: null,
        }));
        console.log("[AI WebSocket] Disconnected, code:", event.code, "reason:", event.reason);
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (autoConnect) connect();
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error("[AI WebSocket] Error:", error);
        setState(prev => ({ ...prev, error: "Connection error" }));
      };
    } catch (err) {
      console.error("[AI WebSocket] Failed to connect:", err);
      setState(prev => ({ ...prev, error: "Failed to connect" }));
    }
  }, [handleMessage, autoConnect]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (
    message: string, 
    language: "ar" | "en" = "ar",
    conversationId?: string,
    userRole?: UserRole
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }
      
      if (!state.isAuthenticated) {
        reject(new Error("Not authenticated"));
        return;
      }
      
      const requestId = generateRequestId();
      streamingRef.current = "";
      setState(prev => ({ ...prev, isProcessing: true, streamingText: "", error: null }));
      
      requestsRef.current.set(requestId, { resolve, reject });
      
      wsRef.current.send(JSON.stringify({
        type: AIMessageType.CHAT_REQUEST,
        requestId,
        message,
        conversationId, // Pass conversationId for server-side persistence
        context: { language, userRole: userRole || "user" },
        stream: true,
      }));
      
      // Timeout after 2 minutes
      setTimeout(() => {
        if (requestsRef.current.has(requestId)) {
          requestsRef.current.delete(requestId);
          reject(new Error("Request timeout"));
          setState(prev => ({ ...prev, isProcessing: false, error: "Request timeout" }));
        }
      }, 120000);
    });
  }, [state.isAuthenticated]);

  const executeCode = useCallback(async (
    code: string, 
    language: "nodejs" | "python" | "typescript" | "shell"
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }
      
      if (!state.isAuthenticated) {
        reject(new Error("Not authenticated"));
        return;
      }
      
      const requestId = generateRequestId();
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      requestsRef.current.set(requestId, { resolve, reject });
      
      wsRef.current.send(JSON.stringify({
        type: AIMessageType.CODE_EXECUTE,
        requestId,
        language,
        code,
        timeout: 30000,
      }));
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (requestsRef.current.has(requestId)) {
          requestsRef.current.delete(requestId);
          reject(new Error("Execution timeout"));
          setState(prev => ({ ...prev, isProcessing: false, error: "Execution timeout" }));
        }
      }, 60000);
    });
  }, [state.isAuthenticated]);

  // Save file - Owner only feature
  // حفظ الملفات - ميزة حصرية للمالك
  const saveFile = useCallback(async (
    filePath: string,
    content: string,
    projectId?: string
  ): Promise<FileSaveResult> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"));
        return;
      }
      
      if (!state.isAuthenticated) {
        reject(new Error("Not authenticated"));
        return;
      }
      
      if (!state.canSaveFiles) {
        resolve({
          success: false,
          filePath,
          error: "Permission denied - file save requires owner privileges",
          errorAr: "تم رفض الإذن - يتطلب حفظ الملفات صلاحيات المالك",
        });
        return;
      }
      
      const requestId = generateRequestId();
      setState(prev => ({ ...prev, isProcessing: true, error: null }));
      
      requestsRef.current.set(requestId, { resolve, reject });
      
      wsRef.current.send(JSON.stringify({
        type: AIMessageType.FILE_SAVE,
        requestId,
        filePath,
        content,
        projectId,
        createDirectories: true,
      }));
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (requestsRef.current.has(requestId)) {
          requestsRef.current.delete(requestId);
          resolve({
            success: false,
            filePath,
            error: "File save timeout",
            errorAr: "انتهت مهلة حفظ الملف",
          });
          setState(prev => ({ ...prev, isProcessing: false, error: "File save timeout" }));
        }
      }, 30000);
    });
  }, [state.isAuthenticated, state.canSaveFiles]);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    console.log("[AI WebSocket] useEffect triggered, autoConnect:", autoConnect);
    if (autoConnect) {
      connect();
    }
    
    return () => {
      console.log("[AI WebSocket] Cleanup, closing connection");
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  return {
    ...state,
    sendMessage,
    executeCode,
    saveFile,
    connect,
    disconnect,
  };
}
