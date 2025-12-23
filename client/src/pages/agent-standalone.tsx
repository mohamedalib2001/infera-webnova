import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2
} from "lucide-react";

interface AgentStatus {
  status: string;
  agent: string;
  version: string;
  port: number;
  uptime: number;
}

export default function AgentStandalone() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkAgentStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agent/health");
      if (res.ok) {
        const data = await res.json();
        setAgentStatus(data);
        setError(null);
      } else {
        setError("Agent غير متاح");
        setAgentStatus(null);
      }
    } catch (err) {
      setError("فشل الاتصال بالـ Agent");
      setAgentStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAgentStatus();
    const interval = setInterval(checkAgentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}س ${minutes}د`;
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">INFERA Agent</h1>
          {agentStatus ? (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {agentStatus.status}
            </Badge>
          ) : error ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              غير متصل
            </Badge>
          ) : null}
        </div>
        
        <div className="flex items-center gap-2">
          {agentStatus && (
            <span className="text-sm text-muted-foreground">
              وقت التشغيل: {formatUptime(agentStatus.uptime)}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={checkAgentStatus}
            disabled={isLoading}
            data-testid="button-refresh-agent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen-agent"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/api/agent/', '_blank')}
            className="gap-1"
            data-testid="button-open-agent-external"
          >
            <ExternalLink className="h-3 w-3" />
            فتح في نافذة جديدة
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">{error}</p>
            <Button onClick={checkAgentStatus} data-testid="button-retry-agent">
              إعادة المحاولة
            </Button>
          </div>
        ) : (
          <iframe
            src="/api/agent/"
            className="w-full h-full border-0"
            title="INFERA Agent Dashboard"
            data-testid="iframe-agent-dashboard"
          />
        )}
      </div>
    </div>
  );
}
