import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface TerminalMessage {
  type: 'connected' | 'output' | 'error' | 'done' | 'clear';
  sessionId?: string;
  message?: string;
  data?: string;
  code?: number;
}

interface CommandResult {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
}

interface UseWebSocketTerminalOptions {
  projectId: string | null;
  onOutput?: (data: string) => void;
  onError?: (message: string) => void;
  onConnected?: (sessionId: string) => void;
}

export function useWebSocketTerminal(options: UseWebSocketTerminalOptions) {
  const { projectId, onOutput, onError, onConnected } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<CommandResult[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (!projectId || wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);

    try {
      const tokenResponse = await apiRequest('POST', '/api/owner/isds/terminal/token', {
        projectId,
      });
      const { token } = tokenResponse as { token: string };

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/terminal?projectId=${projectId}&token=${token}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: TerminalMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'connected':
              setSessionId(message.sessionId || null);
              onConnected?.(message.sessionId || '');
              if (message.message) {
                setHistory((prev) => [
                  ...prev,
                  {
                    id: `sys_${Date.now()}`,
                    command: '',
                    output: message.message || '',
                    exitCode: 0,
                    timestamp: new Date(),
                  },
                ]);
              }
              break;

            case 'output':
              if (message.data) {
                onOutput?.(message.data);
                setHistory((prev) => {
                  const lastItem = prev[prev.length - 1];
                  if (lastItem && lastItem.exitCode === -1) {
                    return [
                      ...prev.slice(0, -1),
                      { ...lastItem, output: lastItem.output + message.data },
                    ];
                  }
                  return prev;
                });
              }
              break;

            case 'error':
              if (message.data || message.message) {
                const errorMsg = message.data || message.message || '';
                onError?.(errorMsg);
                setHistory((prev) => {
                  const lastItem = prev[prev.length - 1];
                  if (lastItem && lastItem.exitCode === -1) {
                    return [
                      ...prev.slice(0, -1),
                      { ...lastItem, output: lastItem.output + '\n' + errorMsg },
                    ];
                  }
                  return prev;
                });
              }
              break;

            case 'done':
              setHistory((prev) => {
                const lastItem = prev[prev.length - 1];
                if (lastItem && lastItem.exitCode === -1) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastItem, exitCode: message.code ?? 0 },
                  ];
                }
                return prev;
              });
              break;

            case 'clear':
              setHistory([]);
              break;
          }
        } catch (e) {
          console.error('[Terminal] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (projectId) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('[Terminal] WebSocket error:', error);
        setIsConnecting(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[Terminal] Connection error:', error);
      setIsConnecting(false);
      onError?.('Failed to connect to terminal');
    }
  }, [projectId, onOutput, onError, onConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setSessionId(null);
  }, []);

  const sendCommand = useCallback(
    (command: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        onError?.('Terminal not connected');
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          id: `cmd_${Date.now()}`,
          command,
          output: '',
          exitCode: -1,
          timestamp: new Date(),
        },
      ]);

      wsRef.current.send(JSON.stringify({ type: 'command', data: command }));
    },
    [onError]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    if (projectId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sessionId,
    history,
    sendCommand,
    clearHistory,
    connect,
    disconnect,
  };
}
