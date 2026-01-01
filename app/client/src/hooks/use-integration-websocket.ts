import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SessionUpdateEvent {
  type: string;
  sessionId: string;
  event: string;
  data: any;
  timestamp: string;
}

export function useIntegrationWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (isCleaningUpRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/integrations`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[Integration WS] Connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SessionUpdateEvent;

          if (data.type === "session_update") {
            queryClient.invalidateQueries({ queryKey: ["/api/owner/integrations/sessions"] });

            if (data.event === "session_activated") {
              toast({
                title: "Session Activated",
                description: `${data.data.partnerDisplayName || data.data.partnerName} session is now active`,
              });
            } else if (data.event === "session_deactivated") {
              toast({
                title: "Session Deactivated",
                description: `${data.data.partnerDisplayName || data.data.partnerName} session has been deactivated`,
              });
            } else if (data.event === "session_created") {
              toast({
                title: "Session Created",
                description: `New session created for ${data.data.partnerDisplayName || data.data.partnerName}`,
              });
            }
          }
        } catch (error) {
          console.error("[Integration WS] Parse error:", error);
        }
      };

      ws.onclose = () => {
        console.log("[Integration WS] Disconnected");
        wsRef.current = null;
        if (!isCleaningUpRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error("[Integration WS] Error:", error);
      };
    } catch (error) {
      console.error("[Integration WS] Connection error:", error);
      if (!isCleaningUpRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    }
  }, [queryClient, toast]);

  const disconnect = useCallback(() => {
    isCleaningUpRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    isCleaningUpRef.current = false;
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    connect,
    disconnect,
  };
}
