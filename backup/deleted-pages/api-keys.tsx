import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Key, Plus, Copy, Eye, EyeOff, RefreshCw, Trash2, Shield, Clock, Activity, Webhook, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const translations = {
  en: {
    title: "API Keys Management",
    subtitle: "Create and manage API keys for external integrations",
    createKey: "Create API Key",
    keyName: "Key Name",
    keyNamePlaceholder: "My API Key",
    description: "Description",
    descriptionPlaceholder: "Used for...",
    scopes: "Permissions (Scopes)",
    selectScopes: "Select at least one scope",
    rateLimitTier: "Rate Limit Tier",
    expiresIn: "Expires In",
    never: "Never",
    days30: "30 Days",
    days90: "90 Days",
    days365: "1 Year",
    create: "Create",
    cancel: "Cancel",
    keyCreated: "API Key Created",
    keyCreatedDesc: "This key will only be shown once. Copy it now!",
    copyKey: "Copy Key",
    keyCopied: "Key copied to clipboard",
    yourKeys: "Your API Keys",
    noKeys: "No API keys yet",
    noKeysDesc: "Create your first API key to get started",
    prefix: "Prefix",
    lastUsed: "Last Used",
    usage: "Usage",
    status: "Status",
    active: "Active",
    revoked: "Revoked",
    expired: "Expired",
    rotate: "Rotate",
    revoke: "Revoke",
    revokeConfirm: "Are you sure you want to revoke this key?",
    revokeDesc: "This action cannot be undone. Any applications using this key will stop working.",
    rotateConfirm: "Rotate this key?",
    rotateDesc: "This will generate a new key and revoke the old one.",
    webhooks: "Webhooks",
    webhooksDesc: "Receive real-time notifications for events",
    createWebhook: "Create Webhook",
    webhookUrl: "Webhook URL",
    webhookEvents: "Events",
    auditLogs: "Audit Logs",
    auditLogsDesc: "Track all API key activities",
    rateLimits: "Rate Limits",
    rateLimitsDesc: "View rate limit policies",
    requestsPerMin: "requests/minute",
    requestsPerHour: "requests/hour",
    requestsPerDay: "requests/day",
    configuration: "Configuration",
    maxKeys: "Maximum Keys",
    keyRotation: "Required Key Rotation",
    days: "days",
    save: "Save",
    secretWarning: "Store this secret securely. It will not be shown again!",
    neverUsed: "Never",
    createdAt: "Created",
    expiresAt: "Expires",
  },
  ar: {
    title: "إدارة مفاتيح API",
    subtitle: "إنشاء وإدارة مفاتيح API للتكاملات الخارجية",
    createKey: "إنشاء مفتاح API",
    keyName: "اسم المفتاح",
    keyNamePlaceholder: "مفتاح API الخاص بي",
    description: "الوصف",
    descriptionPlaceholder: "يستخدم لـ...",
    scopes: "الصلاحيات",
    selectScopes: "اختر صلاحية واحدة على الأقل",
    rateLimitTier: "مستوى حد الاستخدام",
    expiresIn: "ينتهي خلال",
    never: "أبداً",
    days30: "30 يوم",
    days90: "90 يوم",
    days365: "سنة",
    create: "إنشاء",
    cancel: "إلغاء",
    keyCreated: "تم إنشاء مفتاح API",
    keyCreatedDesc: "سيتم عرض هذا المفتاح مرة واحدة فقط. انسخه الآن!",
    copyKey: "نسخ المفتاح",
    keyCopied: "تم نسخ المفتاح",
    yourKeys: "مفاتيحك",
    noKeys: "لا توجد مفاتيح بعد",
    noKeysDesc: "أنشئ أول مفتاح API للبدء",
    prefix: "البادئة",
    lastUsed: "آخر استخدام",
    usage: "الاستخدام",
    status: "الحالة",
    active: "نشط",
    revoked: "ملغي",
    expired: "منتهي",
    rotate: "تدوير",
    revoke: "إلغاء",
    revokeConfirm: "هل أنت متأكد من إلغاء هذا المفتاح؟",
    revokeDesc: "لا يمكن التراجع عن هذا الإجراء. ستتوقف أي تطبيقات تستخدم هذا المفتاح عن العمل.",
    rotateConfirm: "تدوير هذا المفتاح؟",
    rotateDesc: "سيتم إنشاء مفتاح جديد وإلغاء القديم.",
    webhooks: "Webhooks",
    webhooksDesc: "استقبال إشعارات فورية للأحداث",
    createWebhook: "إنشاء Webhook",
    webhookUrl: "رابط Webhook",
    webhookEvents: "الأحداث",
    auditLogs: "سجلات التدقيق",
    auditLogsDesc: "تتبع جميع أنشطة مفاتيح API",
    rateLimits: "حدود الاستخدام",
    rateLimitsDesc: "عرض سياسات حدود الاستخدام",
    requestsPerMin: "طلب/دقيقة",
    requestsPerHour: "طلب/ساعة",
    requestsPerDay: "طلب/يوم",
    configuration: "الإعدادات",
    maxKeys: "الحد الأقصى للمفاتيح",
    keyRotation: "تدوير المفاتيح المطلوب",
    days: "يوم",
    save: "حفظ",
    secretWarning: "احفظ هذا السر بأمان. لن يتم عرضه مرة أخرى!",
    neverUsed: "لم يستخدم",
    createdAt: "تاريخ الإنشاء",
    expiresAt: "تاريخ الانتهاء",
  }
};

const scopeGroups = {
  platform: ['platform.read', 'platform.write', 'platform.delete'],
  domains: ['domains.read', 'domains.manage'],
  ai: ['ai.invoke', 'ai.manage'],
  billing: ['billing.read', 'billing.manage'],
  projects: ['projects.read', 'projects.write', 'projects.delete'],
  analytics: ['analytics.read', 'analytics.export'],
};

export default function ApiKeysPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const dateLocale = language === 'ar' ? ar : enUS;
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; plainTextKey: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null);
  const [rotateKeyId, setRotateKeyId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopes: [] as string[],
    rateLimitTier: 'basic',
    expiresInDays: 0,
  });
  
  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ['/api/api-keys'],
  });
  
  const { data: scopesData } = useQuery({
    queryKey: ['/api/api-keys/scopes'],
  });
  
  const { data: webhooksData } = useQuery({
    queryKey: ['/api/api-keys/webhooks'],
  });
  
  const { data: auditLogsData } = useQuery({
    queryKey: ['/api/api-keys/audit-logs'],
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/api-keys', data);
      return res.json();
    },
    onSuccess: (data) => {
      setNewKeyData({ key: data.key, plainTextKey: data.plainTextKey });
      setShowCreateDialog(false);
      setShowKeyDialog(true);
      setFormData({ name: '', description: '', scopes: [], rateLimitTier: 'basic', expiresInDays: 0 });
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });
  
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      setRevokeKeyId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({ title: language === 'ar' ? 'تم إلغاء المفتاح' : 'Key revoked' });
    },
  });
  
  const rotateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/api-keys/${id}/rotate`);
      return res.json();
    },
    onSuccess: (data) => {
      setRotateKeyId(null);
      setNewKeyData({ key: data.newKey, plainTextKey: data.plainTextKey });
      setShowKeyDialog(true);
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
    },
  });
  
  const handleScopeToggle = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope) 
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }));
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.keyCopied });
  };
  
  const keys = (keysData as any)?.keys || [];
  const webhooks = (webhooksData as any)?.webhooks || [];
  const auditLogs = (auditLogsData as any)?.logs || [];
  
  return (
    <div className="p-6 space-y-6" data-testid="page-api-keys">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-title">
            <Key className="h-6 w-6" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-key">
              <Plus className="h-4 w-4 mr-2" />
              {t.createKey}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.createKey}</DialogTitle>
              <DialogDescription>{t.selectScopes}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.keyName}</Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder={t.keyNamePlaceholder}
                  data-testid="input-key-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Input 
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder={t.descriptionPlaceholder}
                  data-testid="input-key-description"
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t.scopes}</Label>
                <ScrollArea className="h-48 border rounded-md p-3">
                  {Object.entries(scopeGroups).map(([group, scopes]) => (
                    <div key={group} className="mb-3">
                      <div className="font-medium text-sm capitalize mb-2">{group}</div>
                      <div className="space-y-1">
                        {scopes.map(scope => (
                          <div key={scope} className="flex items-center gap-2">
                            <Checkbox 
                              id={scope}
                              checked={formData.scopes.includes(scope)}
                              onCheckedChange={() => handleScopeToggle(scope)}
                              data-testid={`checkbox-scope-${scope}`}
                            />
                            <label htmlFor={scope} className="text-sm cursor-pointer">{scope}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.rateLimitTier}</Label>
                  <Select 
                    value={formData.rateLimitTier}
                    onValueChange={v => setFormData(p => ({ ...p, rateLimitTier: v }))}
                  >
                    <SelectTrigger data-testid="select-rate-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>{t.expiresIn}</Label>
                  <Select 
                    value={String(formData.expiresInDays)}
                    onValueChange={v => setFormData(p => ({ ...p, expiresInDays: parseInt(v) }))}
                  >
                    <SelectTrigger data-testid="select-expiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t.never}</SelectItem>
                      <SelectItem value="30">{t.days30}</SelectItem>
                      <SelectItem value="90">{t.days90}</SelectItem>
                      <SelectItem value="365">{t.days365}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t.cancel}
              </Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.name || formData.scopes.length === 0 || createMutation.isPending}
                data-testid="button-confirm-create"
              >
                {t.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t.keyCreated}
            </DialogTitle>
            <DialogDescription className="text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t.keyCreatedDesc}
            </DialogDescription>
          </DialogHeader>
          
          {newKeyData && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md font-mono text-sm break-all relative">
                {showKey ? newKeyData.plainTextKey : '••••••••••••••••••••••••••••••••'}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(newKeyData.plainTextKey)}
                    data-testid="button-copy-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{t.secretWarning}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => { setShowKeyDialog(false); setNewKeyData(null); setShowKey(false); }}>
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys" className="gap-2" data-testid="tab-keys">
            <Key className="h-4 w-4" />
            {t.yourKeys}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2" data-testid="tab-webhooks">
            <Webhook className="h-4 w-4" />
            {t.webhooks}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit">
            <FileText className="h-4 w-4" />
            {t.auditLogs}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="mt-4">
          {keysLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : keys.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">{t.noKeys}</h3>
                <p className="text-muted-foreground mb-4">{t.noKeysDesc}</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.createKey}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {keys.map((key: any) => (
                <Card key={key.id} data-testid={`card-key-${key.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{key.name}</span>
                          <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                            {key.status === 'active' ? t.active : key.status === 'revoked' ? t.revoked : t.expired}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{key.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="font-mono bg-muted px-2 py-0.5 rounded">
                            {key.prefix}...{key.lastFourChars}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.lastUsed}: {key.lastUsedAt ? format(new Date(key.lastUsedAt), 'PPp', { locale: dateLocale }) : t.neverUsed}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {t.usage}: {key.usageCount || 0}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {key.scopes?.slice(0, 5).map((scope: string) => (
                            <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                          ))}
                          {key.scopes?.length > 5 && (
                            <Badge variant="outline" className="text-xs">+{key.scopes.length - 5}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {key.status === 'active' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setRotateKeyId(key.id)}
                            data-testid={`button-rotate-${key.id}`}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t.rotate}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setRevokeKeyId(key.id)}
                            data-testid={`button-revoke-${key.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t.revoke}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                {t.webhooks}
              </CardTitle>
              <CardDescription>{t.webhooksDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webhooks configured</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.createWebhook}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((wh: any) => (
                    <div key={wh.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{wh.name}</div>
                        <div className="text-sm text-muted-foreground">{wh.url}</div>
                        <div className="flex gap-1 mt-1">
                          {wh.events?.map((e: string) => (
                            <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant={wh.isActive ? 'default' : 'secondary'}>
                        {wh.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.auditLogs}
              </CardTitle>
              <CardDescription>{t.auditLogsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs yet</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {auditLogs.map((log: any) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-md text-sm">
                        <Shield className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-muted-foreground">
                              {format(new Date(log.timestamp), 'PPp', { locale: dateLocale })}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-muted-foreground mt-1">{JSON.stringify(log.details)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={!!revokeKeyId} onOpenChange={() => setRevokeKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.revokeConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.revokeDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => revokeKeyId && revokeMutation.mutate(revokeKeyId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-revoke"
            >
              {t.revoke}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!rotateKeyId} onOpenChange={() => setRotateKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.rotateConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.rotateDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => rotateKeyId && rotateMutation.mutate(rotateKeyId)}
              data-testid="button-confirm-rotate"
            >
              {t.rotate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
