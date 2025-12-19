import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Globe, 
  Plus, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Copy,
  RefreshCw,
  Trash2,
  ExternalLink,
  Info,
  Search,
  Settings,
  Link2,
  FileText,
  Server,
  Edit,
  Save,
  X,
} from "lucide-react";

const translations = {
  ar: {
    title: "إدارة النطاقات",
    subtitle: "تسجيل وإدارة نطاقاتك عبر Namecheap",
    tabs: {
      domains: "النطاقات",
      dns: "سجلات DNS",
      links: "ربط المنصات",
    },
    checkDomain: "فحص التوفر",
    registerDomain: "تسجيل نطاق جديد",
    importDomains: "استيراد نطاقاتي",
    importing: "جاري الاستيراد...",
    domainName: "اسم النطاق",
    domainPlaceholder: "example.com",
    status: "الحالة",
    expiryDate: "تاريخ الانتهاء",
    actions: "الإجراءات",
    noDomains: "لا توجد نطاقات مسجلة",
    noDomainsDesc: "قم بتسجيل نطاقك الأول عبر Namecheap",
    available: "متاح للتسجيل",
    unavailable: "غير متاح",
    price: "السعر",
    years: "سنوات",
    register: "تسجيل",
    renew: "تجديد",
    cancel: "إلغاء",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",
    dnsRecords: "سجلات DNS",
    recordType: "النوع",
    host: "المضيف",
    value: "القيمة",
    ttl: "TTL",
    addRecord: "إضافة سجل",
    platformLink: "ربط بمنصة",
    selectPlatform: "اختر منصة",
    linkType: "نوع الربط",
    primary: "أساسي",
    alias: "بديل",
    subdomain: "نطاق فرعي",
    subdomainPrefix: "بادئة النطاق الفرعي",
    link: "ربط",
    unlink: "إلغاء الربط",
    linkedPlatforms: "المنصات المربوطة",
    noLinkedPlatforms: "لا توجد منصات مربوطة",
    configStatus: "حالة التكوين",
    configured: "مُعَد",
    notConfigured: "غير مُعَد",
    configureFirst: "يرجى تكوين بيانات اعتماد Namecheap أولاً",
    checkingAvailability: "جاري الفحص...",
    registering: "جاري التسجيل...",
    renewalPrice: "سعر التجديد",
    autoRenew: "تجديد تلقائي",
    copied: "تم النسخ",
    loginRequired: "يجب تسجيل الدخول لإدارة النطاقات",
    ownerOnly: "هذه الميزة متاحة لمالك المنصة فقط",
    success: {
      registered: "تم تسجيل النطاق بنجاح",
      renewed: "تم تجديد النطاق بنجاح",
      dnsUpdated: "تم تحديث سجلات DNS",
      linked: "تم ربط النطاق بالمنصة",
      unlinked: "تم إلغاء ربط النطاق",
    },
    errors: {
      checkFailed: "فشل في فحص توفر النطاق",
      registerFailed: "فشل في تسجيل النطاق",
      renewFailed: "فشل في تجديد النطاق",
      dnsFailed: "فشل في تحديث سجلات DNS",
      linkFailed: "فشل في ربط النطاق",
      generic: "حدث خطأ، حاول مرة أخرى",
    },
    statuses: {
      active: "نشط",
      expired: "منتهي",
      pending: "معلق",
      locked: "مقفل",
    },
    settings: {
      title: "إعدادات Namecheap",
      apiUser: "اسم مستخدم API",
      apiKey: "مفتاح API",
      clientIp: "عنوان IP المسموح",
      sandbox: "وضع الاختبار",
      serverIp: "عنوان IP الخادم الحالي",
      detectIp: "كشف IP تلقائي",
      saveConfig: "حفظ الإعدادات",
      testConnection: "اختبار الاتصال",
      balance: "الرصيد",
      configSuccess: "تم تكوين Namecheap بنجاح",
      configError: "فشل في تكوين Namecheap",
      ipNote: "يجب إضافة هذا العنوان في قائمة IP المسموحة في Namecheap",
      detecting: "جاري الكشف...",
    },
  },
  en: {
    title: "Domain Management",
    subtitle: "Register and manage your domains via Namecheap",
    tabs: {
      domains: "Domains",
      dns: "DNS Records",
      links: "Platform Links",
    },
    checkDomain: "Check Availability",
    registerDomain: "Register New Domain",
    importDomains: "Import My Domains",
    importing: "Importing...",
    domainName: "Domain Name",
    domainPlaceholder: "example.com",
    status: "Status",
    expiryDate: "Expiry Date",
    actions: "Actions",
    noDomains: "No domains registered",
    noDomainsDesc: "Register your first domain via Namecheap",
    available: "Available for registration",
    unavailable: "Not available",
    price: "Price",
    years: "years",
    register: "Register",
    renew: "Renew",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    dnsRecords: "DNS Records",
    recordType: "Type",
    host: "Host",
    value: "Value",
    ttl: "TTL",
    addRecord: "Add Record",
    platformLink: "Link to Platform",
    selectPlatform: "Select Platform",
    linkType: "Link Type",
    primary: "Primary",
    alias: "Alias",
    subdomain: "Subdomain",
    subdomainPrefix: "Subdomain Prefix",
    link: "Link",
    unlink: "Unlink",
    linkedPlatforms: "Linked Platforms",
    noLinkedPlatforms: "No linked platforms",
    configStatus: "Config Status",
    configured: "Configured",
    notConfigured: "Not Configured",
    configureFirst: "Please configure Namecheap credentials first",
    checkingAvailability: "Checking...",
    registering: "Registering...",
    renewalPrice: "Renewal Price",
    autoRenew: "Auto Renew",
    copied: "Copied",
    loginRequired: "Please login to manage domains",
    ownerOnly: "This feature is only available to platform owners",
    success: {
      registered: "Domain registered successfully",
      renewed: "Domain renewed successfully",
      dnsUpdated: "DNS records updated",
      linked: "Domain linked to platform",
      unlinked: "Domain unlinked",
    },
    errors: {
      checkFailed: "Failed to check domain availability",
      registerFailed: "Failed to register domain",
      renewFailed: "Failed to renew domain",
      dnsFailed: "Failed to update DNS records",
      linkFailed: "Failed to link domain",
      generic: "An error occurred, please try again",
    },
    statuses: {
      active: "Active",
      expired: "Expired",
      pending: "Pending",
      locked: "Locked",
    },
    settings: {
      title: "Namecheap Settings",
      apiUser: "API Username",
      apiKey: "API Key",
      clientIp: "Allowed IP Address",
      sandbox: "Sandbox Mode",
      serverIp: "Current Server IP",
      detectIp: "Auto-detect IP",
      saveConfig: "Save Settings",
      testConnection: "Test Connection",
      balance: "Balance",
      configSuccess: "Namecheap configured successfully",
      configError: "Failed to configure Namecheap",
      ipNote: "Add this IP address to the whitelist in your Namecheap account",
      detecting: "Detecting...",
    },
  },
};

interface NamecheapConfig {
  configured: boolean;
  apiUser?: string;
  clientIp?: string;
  sandbox?: boolean;
  keyPrefix?: string;
  status?: string;
}

interface Domain {
  id: number;
  domainName: string;
  status: string;
  expirationDate?: string;
  isAutoRenew?: boolean;
  whoisGuard?: boolean;
  isLocked?: boolean;
  nameservers?: string;
  registrationDate?: string;
}

interface DnsRecord {
  id: number;
  domainId: number;
  recordType: string;
  hostName: string;
  address: string;
  ttl: number;
  mxPref?: number;
  isActive?: boolean;
}

interface PlatformLink {
  id: number;
  domainId: number;
  platformId: number;
  linkType: string;
  subdomain?: string;
  isActive: boolean;
}

interface AvailabilityResult {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
}

interface DomainProvider {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  logo: string;
  website: string;
  status: 'active' | 'configured' | 'inactive' | 'coming_soon';
  tier: number;
  capabilities: {
    domainRegistration: boolean;
    domainTransfer: boolean;
    dnsManagement: boolean;
    whoisPrivacy: boolean;
    autoRenew: boolean;
    bulkOperations: boolean;
    apiAvailable: boolean;
  };
  isConfigured: boolean;
  isAvailable: boolean;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return CheckCircle2;
    case 'pending':
      return Clock;
    case 'expired':
      return XCircle;
    case 'locked':
      return Shield;
    default:
      return AlertCircle;
  }
}

export default function DomainsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const t = translations[language];
  
  const [activeTab, setActiveTab] = useState("domains");
  const [searchDomain, setSearchDomain] = useState("");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityResult | null>(null);
  const [years, setYears] = useState(1);
  const [showDnsDialog, setShowDnsDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [newDnsRecord, setNewDnsRecord] = useState({ recordType: "A", hostName: "@", address: "", ttl: 1800 });
  const [linkFormData, setLinkFormData] = useState({ platformId: "", linkType: "primary", subdomain: "" });
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [namecheapSettings, setNamecheapSettings] = useState({
    apiUser: "",
    apiKey: "",
    clientIp: "",
    sandbox: false,
    permissions: "",
    storage: "database",
  });
  const [detectedIp, setDetectedIp] = useState<string | null>(null);
  const [isDetectingIp, setIsDetectingIp] = useState(false);

  const { data: configStatus, refetch: refetchConfigStatus } = useQuery<{ configured: boolean }>({
    queryKey: ['/api/domains/config-status'],
    enabled: isAuthenticated,
  });

  const { data: namecheapConfig } = useQuery<NamecheapConfig>({
    queryKey: ['/api/domains/config'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/domains/config');
      return res.json();
    },
  });

  // Load saved config into form when available
  useEffect(() => {
    if (namecheapConfig && namecheapConfig.configured) {
      setNamecheapSettings(prev => ({
        ...prev,
        apiUser: namecheapConfig.apiUser || '',
        clientIp: namecheapConfig.clientIp || '',
        sandbox: namecheapConfig.sandbox || false,
        // apiKey is not loaded from server for security - leave empty
      }));
    }
  }, [namecheapConfig]);

  const detectServerIp = async () => {
    setIsDetectingIp(true);
    try {
      const res = await fetch('/api/domains/server-ip');
      const data = await res.json();
      if (data.success && data.ip) {
        setDetectedIp(data.ip);
        setNamecheapSettings(prev => ({ ...prev, clientIp: data.ip }));
      }
    } catch (error) {
      console.error('Failed to detect IP:', error);
    } finally {
      setIsDetectingIp(false);
    }
  };

  const saveConfigMutation = useMutation({
    mutationFn: async (config: typeof namecheapSettings) => {
      const response = await apiRequest('POST', '/api/domains/config', config);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ 
          title: t.settings.configSuccess,
          description: data.balance ? `${t.settings.balance}: $${data.balance} ${data.currency}` : undefined
        });
        setShowSettingsDialog(false);
        refetchConfigStatus();
        queryClient.invalidateQueries({ queryKey: ['/api/domains/config'] });
      } else {
        toast({ 
          title: t.settings.configError, 
          description: data.error,
          variant: 'destructive' 
        });
      }
    },
    onError: () => {
      toast({ title: t.settings.configError, variant: 'destructive' });
    },
  });

  const { data: domains = [], isLoading: domainsLoading } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    enabled: isAuthenticated && configStatus?.configured,
    queryFn: async () => {
      const res = await fetch('/api/domains', { credentials: 'include' });
      const data = await res.json();
      return data.domains || [];
    },
  });

  const { data: dnsRecords = [], isLoading: dnsLoading } = useQuery<DnsRecord[]>({
    queryKey: ['/api/domains', selectedDomain?.id, 'dns'],
    enabled: isAuthenticated && !!selectedDomain?.id,
    queryFn: async () => {
      const res = await fetch(`/api/domains/${selectedDomain?.id}/dns`, { credentials: 'include' });
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: platformLinks = [] } = useQuery<PlatformLink[]>({
    queryKey: ['/api/domains', selectedDomain?.id, 'links'],
    enabled: isAuthenticated && !!selectedDomain?.id,
    queryFn: async () => {
      const res = await fetch(`/api/domains/${selectedDomain?.id}/platform-links`, { credentials: 'include' });
      const data = await res.json();
      return data.links || [];
    },
  });

  const { data: platformsData } = useQuery<{ platforms: { id: string; name: string; nameAr: string | null; slug: string; status: string }[]; total: number }>({
    queryKey: ['/api/platforms'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/platforms', { credentials: 'include' });
      return res.json();
    },
  });
  const platformsList = platformsData?.platforms || [];

  const { data: providersData } = useQuery<{ providers: DomainProvider[]; total: number; active: number }>({
    queryKey: ['/api/domains/providers'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/domains/providers', { credentials: 'include' });
      return res.json();
    },
  });

  const cleanDomainName = (domain: string): string => {
    return domain.toLowerCase().trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '');
  };

  const checkAvailabilityMutation = useMutation({
    mutationFn: async (domain: string) => {
      const cleanedDomain = cleanDomainName(domain);
      setSearchDomain(cleanedDomain);
      const response = await apiRequest('POST', '/api/domains/check-availability', { domains: [cleanedDomain] });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.domains && data.domains.length > 0) {
        const result = data.domains[0];
        setAvailabilityResult({
          domain: result.domain || result.Domain,
          available: result.available ?? result.Available,
          price: result.price || result.PremiumRegistrationPrice,
          currency: result.currency || 'USD',
        });
      }
    },
    onError: () => {
      toast({ title: t.errors.checkFailed, variant: 'destructive' });
    },
  });

  const registerDomainMutation = useMutation({
    mutationFn: async ({ domainName, years }: { domainName: string; years: number }) => {
      const cleanedDomain = cleanDomainName(domainName);
      const response = await apiRequest('POST', '/api/domains/register', { domainName: cleanedDomain, years });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: t.success.registered });
        setShowRegisterDialog(false);
        setSearchDomain("");
        setAvailabilityResult(null);
        queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      } else {
        toast({ 
          title: t.errors.registerFailed, 
          description: data.errorAr || data.error,
          variant: 'destructive' 
        });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: t.errors.registerFailed, 
        description: language === 'ar' ? 'فشل التسجيل - تحقق من رصيد الحساب' : 'Registration failed - check account balance',
        variant: 'destructive' 
      });
    },
  });

  const renewDomainMutation = useMutation({
    mutationFn: async ({ domainId, years }: { domainId: number; years: number }) => {
      return apiRequest('POST', `/api/domains/${domainId}/renew`, { years });
    },
    onSuccess: () => {
      toast({ title: t.success.renewed });
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
    onError: () => {
      toast({ title: t.errors.renewFailed, variant: 'destructive' });
    },
  });

  const importDomainsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/domains/import');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        let msg: string;
        if (data.imported > 0 && data.skipped > 0) {
          msg = language === 'ar' 
            ? `تم استيراد ${data.imported} نطاق جديد، وتحديث ${data.skipped} نطاق موجود`
            : `Imported ${data.imported} new domains, updated ${data.skipped} existing`;
        } else if (data.imported > 0) {
          msg = language === 'ar' 
            ? `تم استيراد ${data.imported} نطاق بنجاح`
            : `Successfully imported ${data.imported} domains`;
        } else if (data.skipped > 0) {
          msg = language === 'ar' 
            ? `تم تحديث ${data.skipped} نطاق (كلها موجودة مسبقاً)`
            : `Updated ${data.skipped} domains (all already existed)`;
        } else {
          msg = language === 'ar' 
            ? 'لا توجد نطاقات في حساب Namecheap'
            : 'No domains found in Namecheap account';
        }
        toast({ title: msg });
        queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
      } else {
        toast({ 
          title: language === 'ar' ? 'فشل الاستيراد' : 'Import failed', 
          description: data.errorAr || data.error,
          variant: 'destructive' 
        });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: language === 'ar' ? 'فشل استيراد النطاقات' : 'Failed to import domains',
        variant: 'destructive' 
      });
    },
  });

  const addDnsRecordMutation = useMutation({
    mutationFn: async (record: typeof newDnsRecord & { domainId: number }) => {
      return apiRequest('POST', `/api/domains/${record.domainId}/dns`, record);
    },
    onSuccess: () => {
      toast({ title: t.success.dnsUpdated });
      setNewDnsRecord({ recordType: "A", hostName: "@", address: "", ttl: 1800 });
      queryClient.invalidateQueries({ queryKey: ['/api/domains', selectedDomain?.id, 'dns'] });
    },
    onError: () => {
      toast({ title: t.errors.dnsFailed, variant: 'destructive' });
    },
  });

  const deleteDnsRecordMutation = useMutation({
    mutationFn: async ({ domainId, recordId }: { domainId: number; recordId: number }) => {
      return apiRequest('DELETE', `/api/domains/${domainId}/dns/${recordId}`);
    },
    onSuccess: () => {
      toast({ title: t.success.dnsUpdated });
      queryClient.invalidateQueries({ queryKey: ['/api/domains', selectedDomain?.id, 'dns'] });
    },
  });

  const linkPlatformMutation = useMutation({
    mutationFn: async (data: { domainId: string; platformId: string; linkType: string; subdomain?: string }) => {
      return apiRequest('POST', `/api/domains/${data.domainId}/link-platform`, data);
    },
    onSuccess: () => {
      toast({ title: t.success.linked });
      setShowLinkDialog(false);
      setLinkFormData({ platformId: "", linkType: "primary", subdomain: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/domains', selectedDomain?.id, 'links'] });
    },
    onError: () => {
      toast({ title: t.errors.linkFailed, variant: 'destructive' });
    },
  });

  const unlinkPlatformMutation = useMutation({
    mutationFn: async (linkId: number) => {
      return apiRequest('DELETE', `/api/domains/link/${linkId}`);
    },
    onSuccess: () => {
      toast({ title: t.success.unlinked });
      queryClient.invalidateQueries({ queryKey: ['/api/domains', selectedDomain?.id, 'links'] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t.loginRequired}</AlertTitle>
        </Alert>
      </div>
    );
  }

  // Settings form component to avoid duplication
  const SettingsForm = ({ showExisting = false }: { showExisting?: boolean }) => (
    <div className="space-y-4">
      {showExisting && namecheapConfig?.configured && (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>
            {language === 'ar' ? 'الإعدادات الحالية' : 'Current settings'}: {namecheapConfig.apiUser} ({namecheapConfig.keyPrefix})
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label>{t.settings.apiUser}</Label>
        <Input
          value={namecheapSettings.apiUser || (showExisting ? namecheapConfig?.apiUser || '' : '')}
          onChange={(e) => setNamecheapSettings(prev => ({ ...prev, apiUser: e.target.value }))}
          placeholder="your_username"
          data-testid="input-api-user"
        />
      </div>
      <div className="space-y-2">
        <Label>{t.settings.apiKey}</Label>
        <Input
          type="password"
          value={namecheapSettings.apiKey}
          onChange={(e) => setNamecheapSettings(prev => ({ ...prev, apiKey: e.target.value }))}
          placeholder={showExisting && namecheapConfig?.keyPrefix ? namecheapConfig.keyPrefix : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
          data-testid="input-api-key"
        />
        {showExisting && namecheapConfig?.keyPrefix && !namecheapSettings.apiKey && (
          <p className="text-xs text-muted-foreground">
            {language === 'ar' ? 'اترك فارغاً للإبقاء على المفتاح الحالي' : 'Leave empty to keep current key'}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>{t.settings.clientIp}</Label>
        <div className="flex gap-2">
          <Input
            value={namecheapSettings.clientIp || (showExisting ? namecheapConfig?.clientIp || '' : '')}
            onChange={(e) => setNamecheapSettings(prev => ({ ...prev, clientIp: e.target.value }))}
            placeholder="xxx.xxx.xxx.xxx"
            data-testid="input-client-ip"
          />
          <Button 
            variant="outline" 
            onClick={detectServerIp}
            disabled={isDetectingIp}
            data-testid="button-detect-ip"
          >
            {isDetectingIp ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              t.settings.detectIp
            )}
          </Button>
        </div>
        {detectedIp && (
          <Alert className="mt-2">
            <Info className="w-4 h-4" />
            <AlertDescription>
              {t.settings.ipNote}: <code className="bg-muted px-1 rounded">{detectedIp}</code>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="sandbox"
          checked={namecheapSettings.sandbox}
          onChange={(e) => setNamecheapSettings(prev => ({ ...prev, sandbox: e.target.checked }))}
          className="rounded border-gray-300"
          data-testid="checkbox-sandbox"
        />
        <Label htmlFor="sandbox">{t.settings.sandbox}</Label>
      </div>
      <div className="space-y-2">
        <Label>{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</Label>
        <Input
          value={namecheapSettings.permissions || ''}
          onChange={(e) => setNamecheapSettings(prev => ({ ...prev, permissions: e.target.value }))}
          placeholder={language === 'ar' ? 'مثال: domains,dns,ssl' : 'e.g., domains,dns,ssl'}
          data-testid="input-permissions"
        />
        <p className="text-xs text-muted-foreground">
          {language === 'ar' ? 'الصلاحيات المفعلة في حساب Namecheap API' : 'Permissions enabled in your Namecheap API account'}
        </p>
      </div>
      <div className="space-y-2">
        <Label>{language === 'ar' ? 'طريقة التخزين' : 'Storage'}</Label>
        <Select 
          value={namecheapSettings.storage || 'database'} 
          onValueChange={(value) => setNamecheapSettings(prev => ({ ...prev, storage: value }))}
        >
          <SelectTrigger data-testid="select-storage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="database">{language === 'ar' ? 'قاعدة البيانات (مشفر)' : 'Database (Encrypted)'}</SelectItem>
            <SelectItem value="env">{language === 'ar' ? 'متغيرات البيئة' : 'Environment Variables'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (configStatus && !configStatus.configured) {
    return (
      <div className="container max-w-6xl py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t.settings.title}
            </CardTitle>
            <CardDescription>{t.configureFirst}</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => saveConfigMutation.mutate(namecheapSettings)}
              disabled={!namecheapSettings.apiUser || !namecheapSettings.apiKey || !namecheapSettings.clientIp || saveConfigMutation.isPending}
              data-testid="button-save-config"
            >
              {saveConfigMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t.settings.saveConfig}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={configStatus?.configured ? "default" : "destructive"} className="gap-1">
            <Settings className="w-3 h-3" />
            {configStatus?.configured ? t.configured : t.notConfigured}
          </Badge>
          
          <Button 
            variant="outline"
            onClick={() => importDomainsMutation.mutate()}
            disabled={importDomainsMutation.isPending || !configStatus?.configured}
            data-testid="button-import-domains"
          >
            {importDomainsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {importDomainsMutation.isPending ? t.importing : t.importDomains}
          </Button>
          
          <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-register-domain">
                <Plus className="w-4 h-4 mr-2" />
                {t.registerDomain}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t.registerDomain}</DialogTitle>
                <DialogDescription>{t.checkDomain}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    placeholder={t.domainPlaceholder}
                    data-testid="input-search-domain"
                  />
                  <Button
                    onClick={() => checkAvailabilityMutation.mutate(searchDomain)}
                    disabled={!searchDomain || checkAvailabilityMutation.isPending}
                    data-testid="button-check-availability"
                  >
                    {checkAvailabilityMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {availabilityResult && (
                  <Card className={availabilityResult.available ? "border-green-500" : "border-destructive"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {availabilityResult.available ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span className="font-medium">{availabilityResult.domain}</span>
                        </div>
                        <Badge variant={availabilityResult.available ? "default" : "destructive"}>
                          {availabilityResult.available ? t.available : t.unavailable}
                        </Badge>
                      </div>
                      {availabilityResult.available && availabilityResult.price && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.price}:</span>
                          <span className="font-medium">
                            ${availabilityResult.price} / {t.years}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {availabilityResult?.available && (
                  <div className="space-y-2">
                    <Label>{t.years}</Label>
                    <Select value={years.toString()} onValueChange={(v) => setYears(parseInt(v))}>
                      <SelectTrigger data-testid="select-years">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 10].map((y) => (
                          <SelectItem key={y} value={y.toString()}>{y} {t.years}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
                  {t.cancel}
                </Button>
                {availabilityResult?.available && (
                  <Button
                    onClick={() => registerDomainMutation.mutate({ domainName: searchDomain, years })}
                    disabled={registerDomainMutation.isPending}
                    data-testid="button-confirm-register"
                  >
                    {registerDomainMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {t.register}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="domains" data-testid="tab-domains">
            <Globe className="w-4 h-4 mr-2" />
            {t.tabs.domains}
          </TabsTrigger>
          <TabsTrigger value="dns" disabled={!selectedDomain} data-testid="tab-dns">
            <Server className="w-4 h-4 mr-2" />
            {t.tabs.dns}
          </TabsTrigger>
          <TabsTrigger value="links" disabled={!selectedDomain} data-testid="tab-links">
            <Link2 className="w-4 h-4 mr-2" />
            {t.tabs.links}
          </TabsTrigger>
          <TabsTrigger value="providers" data-testid="tab-providers">
            <Settings className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'المزودين' : 'Providers'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4 mt-4">
          {domainsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : domains.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t.noDomains}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.noDomainsDesc}</p>
                <Button onClick={() => setShowRegisterDialog(true)} data-testid="button-add-first-domain">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.registerDomain}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => {
                const StatusIcon = getStatusIcon(domain.status);
                const isSelected = selectedDomain?.id === domain.id;
                
                return (
                  <Card 
                    key={domain.id} 
                    className={`cursor-pointer transition-colors ${isSelected ? 'border-primary' : ''}`}
                    onClick={() => setSelectedDomain(domain)}
                    data-testid={`domain-card-${domain.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {domain.domainName}
                              <a 
                                href={`https://${domain.domainName}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`link-domain-${domain.id}`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getStatusBadgeVariant(domain.status)} className="text-xs gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {t.statuses[domain.status as keyof typeof t.statuses] || domain.status}
                              </Badge>
                              {domain.isLocked && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Shield className="w-3 h-3" />
                                  {t.statuses.locked}
                                </Badge>
                              )}
                              {domain.isAutoRenew && (
                                <Badge variant="secondary" className="text-xs">
                                  {t.autoRenew}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {domain.expirationDate && (
                            <div className="text-sm text-muted-foreground">
                              <span>{t.expiryDate}: </span>
                              <span className="font-medium">
                                {new Date(domain.expirationDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => renewDomainMutation.mutate({ domainId: domain.id, years: 1 })}
                              disabled={renewDomainMutation.isPending}
                              data-testid={`button-renew-${domain.id}`}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              {t.renew}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dns" className="space-y-4 mt-4">
          {selectedDomain && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{t.dnsRecords}</CardTitle>
                      <CardDescription>{selectedDomain.domainName}</CardDescription>
                    </div>
                    <Dialog open={showDnsDialog} onOpenChange={setShowDnsDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-dns">
                          <Plus className="w-4 h-4 mr-2" />
                          {t.addRecord}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.addRecord}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>{t.recordType}</Label>
                            <Select 
                              value={newDnsRecord.recordType} 
                              onValueChange={(v) => setNewDnsRecord({ ...newDnsRecord, recordType: v })}
                            >
                              <SelectTrigger data-testid="select-record-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'].map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.host}</Label>
                            <Input
                              value={newDnsRecord.hostName}
                              onChange={(e) => setNewDnsRecord({ ...newDnsRecord, hostName: e.target.value })}
                              placeholder="@"
                              data-testid="input-dns-host"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t.value}</Label>
                            <Input
                              value={newDnsRecord.address}
                              onChange={(e) => setNewDnsRecord({ ...newDnsRecord, address: e.target.value })}
                              placeholder="192.168.1.1"
                              data-testid="input-dns-value"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t.ttl}</Label>
                            <Select 
                              value={newDnsRecord.ttl.toString()} 
                              onValueChange={(v) => setNewDnsRecord({ ...newDnsRecord, ttl: parseInt(v) })}
                            >
                              <SelectTrigger data-testid="select-ttl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[300, 600, 1800, 3600, 14400, 86400].map((ttl) => (
                                  <SelectItem key={ttl} value={ttl.toString()}>{ttl}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowDnsDialog(false)}>
                            {t.cancel}
                          </Button>
                          <Button
                            onClick={() => addDnsRecordMutation.mutate({ 
                              ...newDnsRecord, 
                              domainId: selectedDomain.id 
                            })}
                            disabled={!newDnsRecord.address || addDnsRecordMutation.isPending}
                            data-testid="button-save-dns"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {t.save}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {dnsLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : dnsRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>{language === 'ar' ? 'لا توجد سجلات DNS' : 'No DNS records'}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.recordType}</TableHead>
                          <TableHead>{t.host}</TableHead>
                          <TableHead>{t.value}</TableHead>
                          <TableHead>{t.ttl}</TableHead>
                          <TableHead>{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dnsRecords.map((record) => (
                          <TableRow key={record.id} data-testid={`dns-record-${record.id}`}>
                            <TableCell>
                              <Badge variant="outline">{record.recordType}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{record.hostName}</TableCell>
                            <TableCell className="font-mono text-sm max-w-[200px] truncate">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{record.address}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(record.address)}
                                  data-testid={`button-copy-${record.id}`}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{record.ttl}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDnsRecordMutation.mutate({ 
                                  domainId: selectedDomain.id, 
                                  recordId: record.id 
                                })}
                                data-testid={`button-delete-dns-${record.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-4">
          {selectedDomain && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{t.linkedPlatforms}</CardTitle>
                    <CardDescription>{selectedDomain.domainName}</CardDescription>
                  </div>
                  <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-link-platform">
                        <Link2 className="w-4 h-4 mr-2" />
                        {t.platformLink}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.platformLink}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t.selectPlatform}</Label>
                          <Select 
                            value={linkFormData.platformId} 
                            onValueChange={(v) => setLinkFormData({ ...linkFormData, platformId: v })}
                          >
                            <SelectTrigger data-testid="select-platform">
                              <SelectValue placeholder={t.selectPlatform} />
                            </SelectTrigger>
                            <SelectContent>
                              {platformsList.length === 0 ? (
                                <SelectItem value="none" disabled>{language === 'ar' ? 'لا توجد منصات' : 'No platforms available'}</SelectItem>
                              ) : (
                                platformsList.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {language === 'ar' && p.nameAr ? p.nameAr : p.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.linkType}</Label>
                          <Select 
                            value={linkFormData.linkType} 
                            onValueChange={(v) => setLinkFormData({ ...linkFormData, linkType: v })}
                          >
                            <SelectTrigger data-testid="select-link-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">{t.primary}</SelectItem>
                              <SelectItem value="alias">{t.alias}</SelectItem>
                              <SelectItem value="subdomain">{t.subdomain}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {linkFormData.linkType === 'subdomain' && (
                          <div className="space-y-2">
                            <Label>{t.subdomainPrefix}</Label>
                            <Input
                              value={linkFormData.subdomain}
                              onChange={(e) => setLinkFormData({ ...linkFormData, subdomain: e.target.value })}
                              placeholder="app"
                              data-testid="input-subdomain"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                          {t.cancel}
                        </Button>
                        <Button
                          onClick={() => linkPlatformMutation.mutate({
                            domainId: selectedDomain.id,
                            platformId: linkFormData.platformId,
                            linkType: linkFormData.linkType,
                            subdomain: linkFormData.subdomain || undefined,
                          })}
                          disabled={!linkFormData.platformId || linkFormData.platformId === 'none' || linkPlatformMutation.isPending}
                          data-testid="button-confirm-link"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          {t.link}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {platformLinks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="w-8 h-8 mx-auto mb-2" />
                    <p>{t.noLinkedPlatforms}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {platformLinks.map((link) => (
                      <div 
                        key={link.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        data-testid={`platform-link-${link.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Server className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{`Platform #${link.platformId}`}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{link.linkType}</Badge>
                              {link.subdomain && (
                                <span className="text-xs text-muted-foreground">
                                  {link.subdomain}.{selectedDomain.domainName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unlinkPlatformMutation.mutate(link.id)}
                          data-testid={`button-unlink-${link.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t.unlink}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {language === 'ar' ? 'مزودي خدمات النطاقات' : 'Domain Service Providers'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? `${providersData?.total || 0} مزود متاح - ${providersData?.active || 0} مفعل`
                  : `${providersData?.total || 0} providers available - ${providersData?.active || 0} active`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providersData?.providers?.map((provider) => {
                  const providerColors: Record<string, { bg: string; border: string; icon: string }> = {
                    namecheap: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'text-orange-500' },
                    godaddy: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-500' },
                    cloudflare: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500' },
                    squarespace: { bg: 'bg-neutral-500/10', border: 'border-neutral-500/30', icon: 'text-neutral-400' },
                    dynadot: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-500' },
                    porkbun: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: 'text-pink-500' },
                    hover: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: 'text-cyan-500' },
                    ionos: { bg: 'bg-blue-600/10', border: 'border-blue-600/30', icon: 'text-blue-600' },
                    gandi: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', icon: 'text-teal-500' },
                    enom: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: 'text-indigo-500' },
                    opensrs: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-500' },
                    namecom: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500' },
                    registercom: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', icon: 'text-sky-500' },
                    networksolutions: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-500' },
                  };
                  const colors = providerColors[provider.id] || { bg: 'bg-primary/10', border: 'border-primary/30', icon: 'text-primary' };
                  
                  return (
                    <div 
                      key={provider.id}
                    className={`p-4 rounded-lg border transition-all hover-elevate ${colors.bg} ${colors.border} ${
                      provider.isConfigured ? 'ring-2 ring-primary/20' : ''
                    }`}
                    data-testid={`provider-card-${provider.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-background/80 ${colors.icon}`}>
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {language === 'ar' ? provider.nameAr : provider.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={provider.isConfigured ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {provider.isConfigured 
                                ? (language === 'ar' ? 'مفعل' : 'Active')
                                : (language === 'ar' ? 'متاح' : 'Available')
                              }
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Tier {provider.tier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {provider.capabilities.domainRegistration && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'تسجيل' : 'Register'}
                        </Badge>
                      )}
                      {provider.capabilities.domainTransfer && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'نقل' : 'Transfer'}
                        </Badge>
                      )}
                      {provider.capabilities.dnsManagement && (
                        <Badge variant="outline" className="text-xs">
                          DNS
                        </Badge>
                      )}
                      {provider.capabilities.whoisPrivacy && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'خصوصية' : 'Privacy'}
                        </Badge>
                      )}
                      {provider.capabilities.autoRenew && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'تجديد تلقائي' : 'Auto-Renew'}
                        </Badge>
                      )}
                      {provider.capabilities.bulkOperations && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' ? 'عمليات جماعية' : 'Bulk Ops'}
                        </Badge>
                      )}
                      {provider.capabilities.apiAvailable && (
                        <Badge variant="outline" className="text-xs">
                          API
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <a 
                        href={provider.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {language === 'ar' ? 'الموقع' : 'Website'}
                      </a>
                      {provider.id === 'namecheap' && !provider.isConfigured && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setActiveTab('domains')}
                          data-testid="button-configure-namecheap"
                        >
                          {language === 'ar' ? 'إعداد' : 'Configure'}
                        </Button>
                      )}
                      {provider.isConfigured && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
