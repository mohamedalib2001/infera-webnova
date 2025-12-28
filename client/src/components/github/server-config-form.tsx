import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Server, Upload, Plug, Terminal, Loader2, Check, X, Clock, ArrowRight, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { formatDistanceToNow } from "date-fns";

interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: "password" | "key";
  deployPath: string;
  postDeployCommand?: string;
  isActive: boolean;
  lastDeployAt: string | null;
  hasPassword: boolean;
  hasPrivateKey: boolean;
}

interface ServerDeployEntry {
  id: string;
  serverName: string;
  host: string;
  status: "pending" | "in_progress" | "success" | "failed";
  filesUploaded: number;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  durationMs: number | null;
}

interface SyncSettings {
  owner: string;
  repo: string;
  branch: string;
}

interface ServerConfigFormProps {
  currentSyncSettings: SyncSettings | null;
}

export function ServerConfigForm({ currentSyncSettings }: ServerConfigFormProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  
  const [serverName, setServerName] = useState("");
  const [serverHost, setServerHost] = useState("");
  const [serverPort, setServerPort] = useState("22");
  const [serverUsername, setServerUsername] = useState("");
  const [serverAuthType, setServerAuthType] = useState<"password" | "key">("password");
  const [serverPassword, setServerPassword] = useState("");
  const [serverPrivateKey, setServerPrivateKey] = useState("");
  const [serverDeployPath, setServerDeployPath] = useState("");
  const [serverPostCommand, setServerPostCommand] = useState("");

  const { data: serverConfigData } = useQuery<{ success: boolean; config: ServerConfig | null }>({
    queryKey: ["/api/github/server/config"],
  });

  const { data: serverHistoryData, isLoading: historyLoading } = useQuery<{ success: boolean; history: ServerDeployEntry[] }>({
    queryKey: ["/api/github/server/history"],
    refetchInterval: 5000,
  });

  const serverConfig = serverConfigData?.config;
  const serverHistory = serverHistoryData?.history || [];

  useEffect(() => {
    if (serverConfig) {
      setServerName(serverConfig.name || "");
      setServerHost(serverConfig.host || "");
      setServerPort(String(serverConfig.port || 22));
      setServerUsername(serverConfig.username || "");
      setServerAuthType(serverConfig.authType || "password");
      setServerDeployPath(serverConfig.deployPath || "");
      setServerPostCommand(serverConfig.postDeployCommand || "");
    }
  }, [serverConfig]);

  const saveServerConfig = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/github/server/config", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/server/config"] });
      toast({
        title: isRtl ? "تم الحفظ" : "Saved",
        description: isRtl ? "تم حفظ إعدادات الخادم" : "Server configuration saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/github/server/test");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? (isRtl ? "نجاح" : "Success") : (isRtl ? "فشل" : "Failed"),
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const deployToServer = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/github/server/deploy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/server/history"] });
      toast({
        title: isRtl ? "بدأ النشر" : "Deployment Started",
        description: isRtl ? "جاري النشر إلى الخادم" : "Deploying to server...",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    saveServerConfig.mutate({
      name: serverName,
      host: serverHost,
      port: parseInt(serverPort),
      username: serverUsername,
      authType: serverAuthType,
      password: serverAuthType === "password" ? serverPassword : undefined,
      privateKey: serverAuthType === "key" ? serverPrivateKey : undefined,
      deployPath: serverDeployPath,
      postDeployCommand: serverPostCommand,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="h-4 w-4 text-green-600" /></div>;
      case "failed":
        return <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center"><X className="h-4 w-4 text-red-600" /></div>;
      case "in_progress":
        return <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center"><Loader2 className="h-4 w-4 text-blue-600 animate-spin" /></div>;
      default:
        return <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center"><Clock className="h-4 w-4 text-yellow-600" /></div>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {isRtl ? "نشر الخادم الخارجي" : "External Server Deployment"}
          </CardTitle>
          <CardDescription>
            {isRtl ? "نشر إلى خادم عبر SSH/SFTP" : "Deploy to server via SSH/SFTP"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" data-testid="button-manage-profiles">
          <Settings className="h-4 w-4 mr-2" />
          {isRtl ? "إدارة الملفات" : "Manage Profiles"}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configuration">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration" data-testid="tab-server-config">
              <Settings className="h-4 w-4 mr-2" />
              {isRtl ? "الإعدادات" : "Configuration"}
            </TabsTrigger>
            <TabsTrigger value="deploy" data-testid="tab-server-deploy">
              <Upload className="h-4 w-4 mr-2" />
              {isRtl ? "النشر" : "Deploy"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server-name">{isRtl ? "اسم الخادم" : "Server Name"}</Label>
                <Input
                  id="server-name"
                  placeholder="Production Server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  data-testid="input-server-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server-host">{isRtl ? "العنوان" : "Host"}</Label>
                <Input
                  id="server-host"
                  placeholder="192.168.1.100"
                  value={serverHost}
                  onChange={(e) => setServerHost(e.target.value)}
                  data-testid="input-server-host"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="server-port">{isRtl ? "المنفذ" : "Port"}</Label>
                <Input
                  id="server-port"
                  placeholder="22"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                  data-testid="input-server-port"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server-username">{isRtl ? "اسم المستخدم" : "Username"}</Label>
                <Input
                  id="server-username"
                  placeholder="root"
                  value={serverUsername}
                  onChange={(e) => setServerUsername(e.target.value)}
                  data-testid="input-server-username"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>{isRtl ? "طريقة المصادقة" : "Authentication Method"}</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="authType"
                    value="password"
                    checked={serverAuthType === "password"}
                    onChange={() => setServerAuthType("password")}
                    className="accent-primary"
                    data-testid="radio-auth-password"
                  />
                  <span className="text-sm">{isRtl ? "كلمة المرور" : "Password"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="authType"
                    value="key"
                    checked={serverAuthType === "key"}
                    onChange={() => setServerAuthType("key")}
                    className="accent-primary"
                    data-testid="radio-auth-key"
                  />
                  <span className="text-sm">{isRtl ? "مفتاح SSH" : "SSH Private Key"}</span>
                </label>
              </div>
            </div>
            
            {serverAuthType === "password" ? (
              <div className="space-y-2">
                <Label htmlFor="server-password">{isRtl ? "كلمة المرور" : "Password"}</Label>
                <Input
                  id="server-password"
                  type="password"
                  placeholder="********"
                  value={serverPassword}
                  onChange={(e) => setServerPassword(e.target.value)}
                  data-testid="input-server-password"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="server-private-key">{isRtl ? "المفتاح الخاص" : "Private Key (PEM format)"}</Label>
                <Textarea
                  id="server-private-key"
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                  value={serverPrivateKey}
                  onChange={(e) => setServerPrivateKey(e.target.value)}
                  className="font-mono text-xs min-h-[120px]"
                  data-testid="input-server-private-key"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="deploy-path">{isRtl ? "مسار النشر" : "Deploy Path"}</Label>
              <Input
                id="deploy-path"
                placeholder="/var/www/html"
                value={serverDeployPath}
                onChange={(e) => setServerDeployPath(e.target.value)}
                data-testid="input-deploy-path"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-command">{isRtl ? "أمر ما بعد النشر" : "Post-Deploy Command"}</Label>
              <Input
                id="post-command"
                placeholder="systemctl restart nginx"
                value={serverPostCommand}
                onChange={(e) => setServerPostCommand(e.target.value)}
                data-testid="input-post-command"
              />
              <p className="text-xs text-muted-foreground">
                {isRtl ? "أمر يتم تنفيذه بعد النشر" : "Command to run after deployment"}
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleSaveConfig} disabled={saveServerConfig.isPending} data-testid="button-save-server">
                {saveServerConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isRtl ? "حفظ الإعدادات" : "Save Configuration"}
              </Button>
              <Button variant="outline" onClick={() => testConnection.mutate()} disabled={testConnection.isPending || !serverConfig} data-testid="button-test-server">
                {testConnection.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plug className="h-4 w-4 mr-2" />}
                {isRtl ? "اختبار الاتصال" : "Test Connection"}
              </Button>
            </div>
            
            {serverConfig && (
              <div className="p-3 rounded-md bg-muted/50 mt-4">
                <p className="text-sm font-medium">{isRtl ? "الخادم الحالي" : "Current Configuration"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {serverConfig.name} ({serverConfig.host}:{serverConfig.port})
                </p>
                <div className="flex gap-2 mt-2">
                  {serverConfig.hasPassword && <Badge variant="secondary">{isRtl ? "كلمة مرور" : "Password"}</Badge>}
                  {serverConfig.hasPrivateKey && <Badge variant="secondary">{isRtl ? "مفتاح SSH" : "SSH Key"}</Badge>}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="deploy" className="space-y-4 mt-4">
            {currentSyncSettings && serverConfig ? (
              <>
                <div className="p-4 rounded-md bg-muted/50">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{isRtl ? "المصدر" : "Source"}</p>
                      <p className="font-medium text-sm">{currentSyncSettings.owner}/{currentSyncSettings.repo}</p>
                      <Badge variant="outline" className="mt-1">{currentSyncSettings.branch}</Badge>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{isRtl ? "الهدف" : "Target"}</p>
                      <p className="font-medium text-sm">{serverConfig.host}</p>
                      <Badge variant="outline" className="mt-1">{serverConfig.deployPath}</Badge>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => deployToServer.mutate()}
                  disabled={deployToServer.isPending}
                  data-testid="button-deploy-to-server"
                >
                  {deployToServer.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isRtl ? "نشر إلى الخادم" : "Deploy to Server"}
                </Button>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">{isRtl ? "عمليات النشر الأخيرة" : "Recent Deployments"}</p>
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {historyLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : serverHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {isRtl ? "لا توجد عمليات نشر" : "No deployments yet"}
                      </p>
                    ) : (
                      serverHistory.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 p-2 rounded-md bg-background" data-testid={`server-deploy-${entry.id}`}>
                          <div className="mt-0.5">{getStatusIcon(entry.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{entry.serverName}</span>
                              <Badge variant={entry.status === "success" ? "default" : entry.status === "failed" ? "destructive" : "secondary"} className="text-xs">
                                {entry.filesUploaded} files
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.startedAt), { addSuffix: true })}
                              {entry.durationMs && ` • ${(entry.durationMs / 1000).toFixed(1)}s`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{isRtl ? "يرجى تكوين الخادم أولاً" : "Please configure server first"}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}