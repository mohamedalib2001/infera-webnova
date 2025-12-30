import { useState } from 'react';
import { 
  Terminal, FileCode, FileJson, Copy, Download, ChevronUp, ChevronDown,
  Check, Loader2, Play, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface BottomConsoleProps {
  language: 'en' | 'ar';
  logs: LogEntry[];
  dockerCompose: string;
  kubernetesYaml: string;
  terraformCode: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExport: (type: 'docker' | 'k8s' | 'terraform') => void;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export function BottomConsole({
  language,
  logs,
  dockerCompose,
  kubernetesYaml,
  terraformCode,
  isExpanded,
  onToggleExpand,
  onExport,
}: BottomConsoleProps) {
  const [activeTab, setActiveTab] = useState('logs');
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleCopy = async (content: string, type: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(type);
    toast({
      title: t('Copied!', 'تم النسخ!'),
      description: t('Code copied to clipboard', 'تم نسخ الكود'),
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-cyan-400';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'warn': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'success': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className={`bg-card/50 backdrop-blur-xl border-t border-border/50 transition-all duration-300 ${isExpanded ? 'h-64' : 'h-10'}`}>
      <div className="flex items-center justify-between px-4 h-10 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={onToggleExpand}
            data-testid="button-toggle-console"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-7 bg-transparent gap-1">
              <TabsTrigger value="logs" className="h-6 text-xs px-3 data-[state=active]:bg-muted">
                <Terminal className="w-3 h-3 mr-1" />
                {t('Logs', 'السجلات')}
                {logs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs px-1">
                    {logs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="docker" className="h-6 text-xs px-3 data-[state=active]:bg-muted">
                <FileCode className="w-3 h-3 mr-1" />
                Docker
              </TabsTrigger>
              <TabsTrigger value="k8s" className="h-6 text-xs px-3 data-[state=active]:bg-muted">
                <FileCode className="w-3 h-3 mr-1" />
                K8s
              </TabsTrigger>
              <TabsTrigger value="terraform" className="h-6 text-xs px-3 data-[state=active]:bg-muted">
                <FileCode className="w-3 h-3 mr-1" />
                Terraform
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          {activeTab !== 'logs' && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs gap-1"
                onClick={() => handleCopy(
                  activeTab === 'docker' ? dockerCompose : 
                  activeTab === 'k8s' ? kubernetesYaml : terraformCode,
                  activeTab
                )}
                data-testid="button-copy-code"
              >
                {copied === activeTab ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {t('Copy', 'نسخ')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs gap-1"
                onClick={() => onExport(activeTab as 'docker' | 'k8s' | 'terraform')}
                data-testid="button-export-code"
              >
                <Download className="w-3 h-3" />
                {t('Export', 'تصدير')}
              </Button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="h-[calc(100%-2.5rem)]">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="logs" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-xs space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground">{t('No logs yet...', 'لا توجد سجلات بعد...')}</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-muted-foreground shrink-0">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <Badge variant="outline" className={`shrink-0 text-xs ${getLevelBadge(log.level)}`}>
                          {log.level}
                        </Badge>
                        <span className={getLevelColor(log.level)}>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="docker" className="h-full m-0">
              <ScrollArea className="h-full">
                <pre className="p-4 font-mono text-xs text-cyan-300">
                  {dockerCompose || t('# Docker Compose will be generated here', '# سيتم توليد Docker Compose هنا')}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="k8s" className="h-full m-0">
              <ScrollArea className="h-full">
                <pre className="p-4 font-mono text-xs text-purple-300">
                  {kubernetesYaml || t('# Kubernetes YAML will be generated here', '# سيتم توليد Kubernetes YAML هنا')}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="terraform" className="h-full m-0">
              <ScrollArea className="h-full">
                <pre className="p-4 font-mono text-xs text-green-300">
                  {terraformCode || t('# Terraform code will be generated here', '# سيتم توليد كود Terraform هنا')}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
