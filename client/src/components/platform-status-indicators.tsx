import { useState } from 'react';
import { Activity, Heart, Brain, AlertTriangle, Copy, Check } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlatformMetrics, type PlatformHealth } from '@/lib/platform-metrics-context';

const STATUS_COLORS = {
  optimal: '#ffffff',
  good: '#a3e635',
  warning: '#fbbf24',
  danger: '#f97316',
  critical: '#ef4444',
};

const SPEED_COLORS = {
  excellent: '#10b981',
  good: '#22c55e',
  average: '#fbbf24',
  slow: '#f97316',
  critical: '#ef4444',
};

const INTEL_COLORS = {
  genius: '#a855f7',
  advanced: '#3b82f6',
  standard: '#06b6d4',
  basic: '#14b8a6',
  minimal: '#6b7280',
};

function getSpeedColor(score: number): string {
  if (score >= 90) return SPEED_COLORS.excellent;
  if (score >= 75) return SPEED_COLORS.good;
  if (score >= 50) return SPEED_COLORS.average;
  if (score >= 30) return SPEED_COLORS.slow;
  return SPEED_COLORS.critical;
}

function getIntelColor(score: number): string {
  if (score >= 90) return INTEL_COLORS.genius;
  if (score >= 75) return INTEL_COLORS.advanced;
  if (score >= 60) return INTEL_COLORS.standard;
  if (score >= 40) return INTEL_COLORS.basic;
  return INTEL_COLORS.minimal;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1" data-testid={`button-copy-${label}`}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy Report'}
    </Button>
  );
}

function HealthIndicator({ health }: { health: PlatformHealth }) {
  const color = STATUS_COLORS[health.status];
  const isCritical = health.status === 'critical';

  const glowStyle = {
    color,
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
    filter: `drop-shadow(0 0 16px ${color}) drop-shadow(0 0 24px ${color})`,
    animation: isCritical ? 'holoFlicker 0.5s infinite' : 'holoPulse 2s infinite',
  };

  const report = `Platform Health Report
Status: ${health.status.toUpperCase()}
Issues: ${health.issues.length}
${health.issues.map(i => `- ${i.message}: ${i.value}% (threshold: ${i.threshold}%)`).join('\n')}`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-pointer" style={glowStyle} data-testid="indicator-health">
          <span className="text-xs font-bold tracking-wide">HEALTH</span>
          <Activity className="h-4 w-4" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Platform Health</h4>
            <Badge variant={health.isHealthy ? 'default' : 'destructive'}>
              {health.status.toUpperCase()}
            </Badge>
          </div>
          {health.issues.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Detected Issues:</p>
              {health.issues.map(issue => (
                <div key={issue.id} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>{issue.message}: {issue.value.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All systems operational</p>
          )}
          <CopyButton text={report} label="health" />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function HeartIndicator({ speed, requests, responseTime }: { speed: number; requests: number; responseTime: number }) {
  const color = getSpeedColor(speed);

  const report = `Speed Report
Score: ${speed.toFixed(0)}%
Total Requests: ${requests.toLocaleString()}
Avg Response: ${responseTime.toFixed(0)}ms`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="cursor-pointer"
          style={{
            color,
            filter: `drop-shadow(0 0 8px ${color})`,
            animation: 'heartbeat 1.5s infinite',
          }}
          data-testid="indicator-speed"
        >
          <Heart className="h-5 w-5 fill-current" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="center">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Platform Speed</h4>
            <Badge style={{ backgroundColor: color, color: '#000' }}>{speed.toFixed(0)}%</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Requests</p>
              <p className="font-medium">{requests.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Response</p>
              <p className="font-medium">{responseTime.toFixed(0)}ms</p>
            </div>
          </div>
          <CopyButton text={report} label="speed" />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function BrainIndicator({ intel, models, cpu, memory }: { intel: number; models: number; cpu: number; memory: number }) {
  const color = getIntelColor(intel);

  const report = `Intelligence Report
Score: ${intel.toFixed(0)}%
Active Models: ${models}
CPU Usage: ${cpu.toFixed(0)}%
Memory Usage: ${memory.toFixed(0)}%`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className="cursor-pointer"
          style={{
            color,
            filter: `drop-shadow(0 0 8px ${color})`,
            animation: 'brainPulse 3s infinite',
          }}
          data-testid="indicator-intelligence"
        >
          <Brain className="h-5 w-5" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">AI Intelligence</h4>
            <Badge style={{ backgroundColor: color, color: '#fff' }}>{intel.toFixed(0)}%</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Active Models</p>
              <p className="font-medium">{models}</p>
            </div>
            <div>
              <p className="text-muted-foreground">CPU</p>
              <p className="font-medium">{cpu.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Memory</p>
              <p className="font-medium">{memory.toFixed(0)}%</p>
            </div>
          </div>
          <CopyButton text={report} label="intel" />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function PlatformStatusIndicators() {
  const { metrics, health } = usePlatformMetrics();

  return (
    <>
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          15% { transform: scale(1.15); opacity: 0.9; }
          30% { transform: scale(1); opacity: 1; }
          45% { transform: scale(1.1); opacity: 0.95; }
          60% { transform: scale(1); opacity: 1; }
        }
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes holoPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes holoFlicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.02); }
          75% { opacity: 0.5; transform: scale(0.98); }
        }
      `}</style>
      <div className="flex items-center gap-4" data-testid="platform-status-indicators">
        <HealthIndicator health={health} />
        <HeartIndicator
          speed={metrics.speedScore}
          requests={metrics.totalRequests}
          responseTime={metrics.avgResponseTime}
        />
        <BrainIndicator
          intel={metrics.intelligenceScore}
          models={metrics.activeModels}
          cpu={metrics.cpuUsage}
          memory={metrics.memoryUsage}
        />
      </div>
    </>
  );
}
