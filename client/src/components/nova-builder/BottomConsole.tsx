import { useState, useEffect } from 'react';
import { 
  Terminal, FileCode, FileJson, Copy, Download, ChevronUp, ChevronDown,
  Check, Loader2, Play, RefreshCw, Rocket, Server, Key, FolderGit, 
  GitBranch, Settings2, CheckCircle, XCircle, Clock, Eye, Wifi, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface DeploySettings {
  serverHost: string;
  sshPort: string;
  sshUser: string;
  repositoryPath: string;
  deployPath: string;
  privateKey: string;
  postDeployCommand: string;
  restartService: boolean;
  serviceName: string;
}

interface DeployHistoryEntry {
  id: string;
  date: Date;
  status: 'success' | 'failed' | 'in_progress';
  type: 'quick' | 'direct';
  details: string;
  duration?: number;
}

const DEFAULT_DEPLOY_SETTINGS: DeploySettings = {
  serverHost: '',
  sshPort: '22',
  sshUser: 'root',
  repositoryPath: '',
  deployPath: '/var/www/app',
  privateKey: '',
  postDeployCommand: 'npm install && npm run build',
  restartService: false,
  serviceName: ''
};

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

  // Deploy State - NOTE: Private key is NOT persisted for security
  const [deploySettings, setDeploySettings] = useState<DeploySettings>(() => {
    const saved = localStorage.getItem('infera_deploy_settings_safe');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Never restore private key from storage for security
      return { ...parsed, privateKey: '' };
    }
    return DEFAULT_DEPLOY_SETTINGS;
  });
  const [deployHistory, setDeployHistory] = useState<DeployHistoryEntry[]>(() => {
    const saved = localStorage.getItem('infera_deploy_history');
    if (saved) {
      return JSON.parse(saved).map((h: any) => ({
        ...h,
        date: new Date(h.date),
        // Redact sensitive details in history
        details: h.status === 'success' ? 'Deployment completed' : 'Deployment failed'
      }));
    }
    return [];
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'testing' | 'deploying' | 'success' | 'error'>('idle');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<DeployHistoryEntry | null>(null);
  const [lastSuccessfulDeploy, setLastSuccessfulDeploy] = useState<Date | null>(() => {
    const history = localStorage.getItem('infera_deploy_history');
    if (history) {
      const entries = JSON.parse(history);
      const success = entries.find((h: any) => h.status === 'success');
      return success ? new Date(success.date) : null;
    }
    return null;
  });

  // Save deploy settings to localStorage (excluding private key for security)
  useEffect(() => {
    const safeSettings = { ...deploySettings, privateKey: '' };
    localStorage.setItem('infera_deploy_settings_safe', JSON.stringify(safeSettings));
  }, [deploySettings]);

  // Save deploy history to localStorage (redact sensitive details before saving)
  useEffect(() => {
    const redactedHistory = deployHistory.map(entry => ({
      ...entry,
      details: entry.status === 'success' ? 'Deployment completed' : 
               entry.status === 'failed' ? 'Deployment failed' : entry.details
    }));
    localStorage.setItem('infera_deploy_history', JSON.stringify(redactedHistory));
    const success = deployHistory.find(h => h.status === 'success');
    if (success) setLastSuccessfulDeploy(success.date);
  }, [deployHistory]);

  const updateDeploySettings = (key: keyof DeploySettings, value: string | boolean) => {
    setDeploySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast({
      title: t('Settings Saved', 'تم حفظ الإعدادات'),
      description: t('Deploy settings saved successfully', 'تم حفظ إعدادات النشر بنجاح'),
    });
  };

  const handleTestConnection = async () => {
    if (!deploySettings.serverHost || !deploySettings.privateKey) {
      toast({
        title: t('Missing Fields', 'حقول مفقودة'),
        description: t('Server host and private key are required', 'عنوان السيرفر والمفتاح الخاص مطلوبان'),
        variant: 'destructive',
      });
      return;
    }

    setDeployStatus('testing');
    try {
      const response = await fetch('/api/deploy/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: deploySettings.serverHost,
          port: parseInt(deploySettings.sshPort) || 22,
          username: deploySettings.sshUser,
          privateKey: deploySettings.privateKey,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDeployStatus('success');
        toast({
          title: t('Connection Successful', 'تم الاتصال بنجاح'),
          description: t('SSH connection test passed', 'نجح اختبار اتصال SSH'),
        });
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      setDeployStatus('error');
      toast({
        title: t('Connection Failed', 'فشل الاتصال'),
        description: error instanceof Error ? error.message : t('Could not connect to server', 'تعذر الاتصال بالسيرفر'),
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setDeployStatus('idle'), 3000);
    }
  };

  const handleDeploy = async (type: 'quick' | 'direct') => {
    if (!deploySettings.serverHost || !deploySettings.privateKey || !deploySettings.deployPath) {
      toast({
        title: t('Missing Fields', 'حقول مفقودة'),
        description: t('Please fill all required fields', 'يرجى ملء جميع الحقول المطلوبة'),
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);
    setDeployStatus('deploying');
    const startTime = Date.now();

    const newEntry: DeployHistoryEntry = {
      id: `deploy-${Date.now()}`,
      date: new Date(),
      status: 'in_progress',
      type,
      details: type === 'quick' 
        ? t('Pulling latest from repository and deploying...', 'جلب آخر نسخة من المستودع والنشر...')
        : t('Direct deployment in progress...', 'جاري النشر المباشر...'),
    };

    setDeployHistory(prev => [newEntry, ...prev.slice(0, 4)]);

    try {
      const response = await fetch('/api/deploy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverHost: deploySettings.serverHost,
          sshPort: parseInt(deploySettings.sshPort) || 22,
          sshUser: deploySettings.sshUser,
          repositoryPath: deploySettings.repositoryPath,
          deployPath: deploySettings.deployPath,
          privateKey: deploySettings.privateKey,
          postDeployCommand: deploySettings.postDeployCommand,
          restartService: deploySettings.restartService,
          serviceName: deploySettings.serviceName,
          type,
        }),
      });

      const result = await response.json();
      const duration = Date.now() - startTime;

      if (result.success) {
        setDeployStatus('success');
        setDeployHistory(prev => prev.map(entry => 
          entry.id === newEntry.id 
            ? { ...entry, status: 'success' as const, details: result.message || t('Deployment completed successfully', 'تم النشر بنجاح'), duration }
            : entry
        ));
        toast({
          title: t('Deployment Successful', 'تم النشر بنجاح'),
          description: t('Your application has been deployed', 'تم نشر تطبيقك'),
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setDeployStatus('error');
      setDeployHistory(prev => prev.map(entry => 
        entry.id === newEntry.id 
          ? { ...entry, status: 'failed' as const, details: error instanceof Error ? error.message : t('Deployment failed', 'فشل النشر'), duration }
          : entry
      ));
      toast({
        title: t('Deployment Failed', 'فشل النشر'),
        description: error instanceof Error ? error.message : t('Could not deploy to server', 'تعذر النشر على السيرفر'),
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
      setTimeout(() => setDeployStatus('idle'), 3000);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

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
              <TabsTrigger value="deploy" className="h-6 text-xs px-3 data-[state=active]:bg-muted">
                <Rocket className="w-3 h-3 mr-1" />
                {t('Deploy', 'النشر')}
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

            <TabsContent value="deploy" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Deploy Settings Card */}
                  <Card className="lg:col-span-2 bg-card/80 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-blue-400" />
                        {t('Deploy Settings', 'إعدادات النشر')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t('Server Host', 'عنوان السيرفر')}</Label>
                          <div className="relative">
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={deploySettings.serverHost}
                              onChange={(e) => updateDeploySettings('serverHost', e.target.value)}
                              placeholder="91.96.168.125"
                              className="pl-9 text-xs"
                              data-testid="input-server-host"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('SSH Port', 'منفذ SSH')}</Label>
                          <Input
                            value={deploySettings.sshPort}
                            onChange={(e) => updateDeploySettings('sshPort', e.target.value)}
                            placeholder="22"
                            className="text-xs"
                            data-testid="input-ssh-port"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('SSH User', 'مستخدم SSH')}</Label>
                          <Input
                            value={deploySettings.sshUser}
                            onChange={(e) => updateDeploySettings('sshUser', e.target.value)}
                            placeholder="root"
                            className="text-xs"
                            data-testid="input-ssh-user"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">{t('Repository Path', 'رابط المستودع')}</Label>
                          <div className="relative">
                            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={deploySettings.repositoryPath}
                              onChange={(e) => updateDeploySettings('repositoryPath', e.target.value)}
                              placeholder="https://github.com/user/repo.git"
                              className="pl-9 text-xs"
                              data-testid="input-repository-path"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t('Deploy Path', 'مسار النشر')}</Label>
                          <div className="relative">
                            <FolderGit className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={deploySettings.deployPath}
                              onChange={(e) => updateDeploySettings('deployPath', e.target.value)}
                              placeholder="/var/www/app"
                              className="pl-9 text-xs"
                              data-testid="input-deploy-path"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">{t('Private Key', 'المفتاح الخاص SSH')}</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Textarea
                            value={deploySettings.privateKey}
                            onChange={(e) => updateDeploySettings('privateKey', e.target.value)}
                            placeholder="-----BEGIN RSA PRIVATE KEY-----"
                            className="pl-9 text-xs font-mono min-h-[80px]"
                            data-testid="input-private-key"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">{t('Post Deploy Command', 'أمر ما بعد النشر')}</Label>
                        <Input
                          value={deploySettings.postDeployCommand}
                          onChange={(e) => updateDeploySettings('postDeployCommand', e.target.value)}
                          placeholder="npm install && npm run build"
                          className="text-xs font-mono"
                          data-testid="input-post-deploy-command"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={deploySettings.restartService}
                            onCheckedChange={(checked) => updateDeploySettings('restartService', checked)}
                            data-testid="switch-restart-service"
                          />
                          <Label className="text-xs">{t('Restart Service', 'إعادة تشغيل الخدمة')}</Label>
                        </div>
                        {deploySettings.restartService && (
                          <div className="flex-1">
                            <Input
                              value={deploySettings.serviceName}
                              onChange={(e) => updateDeploySettings('serviceName', e.target.value)}
                              placeholder={t('Service name', 'اسم الخدمة')}
                              className="text-xs"
                              data-testid="input-service-name"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveSettings}
                          className="gap-2"
                          data-testid="button-save-deploy-settings"
                        >
                          <Check className="w-3 h-3" />
                          {t('Save Settings', 'حفظ إعدادات النشر')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleTestConnection}
                          disabled={deployStatus === 'testing'}
                          className="gap-2"
                          data-testid="button-test-connection"
                        >
                          {deployStatus === 'testing' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : deployStatus === 'success' ? (
                            <Wifi className="w-3 h-3 text-green-400" />
                          ) : deployStatus === 'error' ? (
                            <WifiOff className="w-3 h-3 text-red-400" />
                          ) : (
                            <Wifi className="w-3 h-3" />
                          )}
                          {t('Test SSH Connection', 'اختبار اتصال SSH')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deploy Action Card */}
                  <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-cyan-400" />
                        {t('Deploy Actions', 'تنفيذ النشر')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {deploySettings.serverHost && deploySettings.deployPath && (
                        <div className="text-xs text-muted-foreground p-2 rounded bg-background/50">
                          <div className="flex items-center gap-2">
                            <Server className="w-3 h-3" />
                            <span>{deploySettings.serverHost}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FolderGit className="w-3 h-3" />
                            <span>{deploySettings.deployPath}</span>
                          </div>
                        </div>
                      )}

                      {lastSuccessfulDeploy && (
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {t('Last successful:', 'آخر نشر ناجح:')} {lastSuccessfulDeploy.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
                          disabled={isDeploying || !deploySettings.serverHost}
                          onClick={() => handleDeploy('quick')}
                          data-testid="button-quick-deploy"
                        >
                          {isDeploying && deployStatus === 'deploying' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <GitBranch className="w-4 h-4" />
                          )}
                          {t('Quick Deploy', 'نشر سريع')}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          {t('Pulls latest from repository', 'يجلب آخر نسخة من المستودع')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          disabled={isDeploying || !deploySettings.serverHost}
                          onClick={() => handleDeploy('direct')}
                          data-testid="button-direct-deploy"
                        >
                          {isDeploying && deployStatus === 'deploying' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                          {t('Direct Deploy', 'نشر مباشر')}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          {t('Deploys without pulling', 'ينشر بدون جلب جديد')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deploy History */}
                  <Card className="lg:col-span-3 bg-card/80 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        {t('Deploy History', 'سجل النشر')}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {deployHistory.length} / 5
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deployHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          {t('No deployments yet', 'لا توجد عمليات نشر بعد')}
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  {t('Date', 'التاريخ')}
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  {t('Type', 'النوع')}
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  {t('Status', 'الحالة')}
                                </th>
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                                  {t('Duration', 'المدة')}
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-muted-foreground">
                                  {t('Actions', 'الإجراءات')}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {deployHistory.map((entry) => (
                                <tr key={entry.id} className="border-b border-border/30">
                                  <td className="py-2 px-2">
                                    {entry.date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                  </td>
                                  <td className="py-2 px-2">
                                    <Badge variant="outline" className="text-xs">
                                      {entry.type === 'quick' ? t('Quick', 'سريع') : t('Direct', 'مباشر')}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        entry.status === 'success' 
                                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                          : entry.status === 'failed'
                                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                      }`}
                                    >
                                      {entry.status === 'success' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {entry.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                      {entry.status === 'in_progress' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                      {entry.status === 'success' ? t('Success', 'نجاح') : 
                                       entry.status === 'failed' ? t('Failed', 'فشل') : 
                                       t('In Progress', 'جاري')}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-2 text-muted-foreground">
                                    {entry.duration ? formatDuration(entry.duration) : '-'}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs gap-1"
                                      onClick={() => {
                                        setSelectedHistoryEntry(entry);
                                        setShowDetailsDialog(true);
                                      }}
                                      data-testid={`button-view-details-${entry.id}`}
                                    >
                                      <Eye className="w-3 h-3" />
                                      {t('Details', 'التفاصيل')}
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Deploy Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedHistoryEntry?.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
              {selectedHistoryEntry?.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
              {selectedHistoryEntry?.status === 'in_progress' && <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />}
              {t('Deployment Details', 'تفاصيل النشر')}
            </DialogTitle>
            <DialogDescription>
              {selectedHistoryEntry?.date.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">{t('Type', 'النوع')}</Label>
                <p>{selectedHistoryEntry?.type === 'quick' ? t('Quick Deploy', 'نشر سريع') : t('Direct Deploy', 'نشر مباشر')}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t('Duration', 'المدة')}</Label>
                <p>{selectedHistoryEntry?.duration ? formatDuration(selectedHistoryEntry.duration) : '-'}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t('Details', 'التفاصيل')}</Label>
              <div className="p-3 mt-1 rounded bg-muted/50 text-sm font-mono">
                {selectedHistoryEntry?.details}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
