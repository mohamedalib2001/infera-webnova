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
}

export interface UseAIWebSocketReturn extends AIWebSocketState {
  sendMessage: (message: string, language?: "ar" | "en") => Promise<string>;
  executeCode: (code: string, language: "nodejs" | "python" | "typescript" | "shell") => Promise<any>;
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
  });

  const generateRequestId = () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case AIMessageType.CONNECTED:
          setState(prev => ({ ...prev, connectionId: data.connectionId }));
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
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/ai`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        console.log("[AI WebSocket] Connected");
      };
      
      wsRef.current.onmessage = handleMessage;
      
      wsRef.current.onclose = () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isAuthenticated: false,
          connectionId: null,
        }));
        console.log("[AI WebSocket] Disconnected");
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

  const sendMessage = useCallback(async (message: string, language: "ar" | "en" = "ar"): Promise<string> => {
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
        context: { language },
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

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
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
    connect,
    disconnect,
  };
}
