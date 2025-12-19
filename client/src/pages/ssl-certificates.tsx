import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  Trash2,
  Link2,
  Lock,
  Unlock,
  Calendar,
  Globe,
  Server,
  Upload,
  Download,
  FileKey,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Activity
} from "lucide-react";

const translations = {
  ar: {
    title: "شهادات SSL",
    subtitle: "إدارة شهادات الأمان لنطاقاتك ومنصاتك",
    addCertificate: "إضافة شهادة",
    uploadCertificate: "رفع شهادة",
    generateCertificate: "إنشاء شهادة",
    noCertificates: "لا توجد شهادات",
    noCertificatesDesc: "ابدأ بإضافة شهادة SSL لتأمين نطاقاتك",
    certificate: "الشهادة",
    domain: "النطاق",
    status: "الحالة",
    provider: "المزود",
    expiresAt: "ينتهي في",
    issuedAt: "صدرت في",
    autoRenew: "تجديد تلقائي",
    actions: "الإجراءات",
    activate: "تفعيل",
    deactivate: "إلغاء التفعيل",
    renew: "تجديد",
    delete: "حذف",
    view: "عرض",
    statusLabels: {
      pending: "قيد الانتظار",
      issuing: "جاري الإصدار",
      issued: "صادرة",
      renewing: "جاري التجديد",
      expired: "منتهية",
      error: "خطأ",
      active: "نشطة"
    },
    providers: {
      letsencrypt: "Let's Encrypt",
      namecheap: "Namecheap",
      cloudflare: "Cloudflare",
      custom: "شهادة مخصصة"
    },
    uploadForm: {
      title: "رفع شهادة SSL",
      description: "ارفع شهادتك الخاصة من Namecheap أو أي مزود آخر",
      hostname: "اسم النطاق",
      hostnamePlaceholder: "example.com",
      provider: "مزود الشهادة",
      certificateChain: "سلسلة الشهادة (Certificate Chain)",
      certificatePlaceholder: "الصق محتوى ملف .crt أو .pem هنا",
      privateKey: "المفتاح الخاص (Private Key)",
      privateKeyPlaceholder: "الصق محتوى ملف .key هنا",
      upload: "رفع الشهادة",
      uploading: "جاري الرفع..."
    },
    generateForm: {
      title: "إنشاء شهادة SSL مجانية",
      description: "سيتم إنشاء شهادة مجانية من Let's Encrypt",
      selectDomain: "اختر النطاق",
      generate: "إنشاء شهادة",
      generating: "جاري الإنشاء..."
    },
    linkForm: {
      title: "ربط الشهادة بمنصة",
      selectPlatform: "اختر المنصة",
      link: "ربط",
      linking: "جاري الربط..."
    },
    confirmDelete: "هل أنت متأكد من حذف هذه الشهادة؟",
    success: {
      uploaded: "تم رفع الشهادة بنجاح",
      generated: "تم إنشاء طلب الشهادة بنجاح",
      renewed: "تم تجديد الشهادة بنجاح",
      deleted: "تم حذف الشهادة بنجاح",
      linked: "تم ربط الشهادة بنجاح"
    },
    errors: {
      uploadFailed: "فشل رفع الشهادة",
      generateFailed: "فشل إنشاء الشهادة",
      renewFailed: "فشل تجديد الشهادة",
      deleteFailed: "فشل حذف الشهادة"
    },
    daysRemaining: "يوم متبقي",
    expired: "منتهية",
    linkedPlatforms: "المنصات المرتبطة",
    certificateDetails: "تفاصيل الشهادة",
    securityInfo: "معلومات الأمان",
    validFrom: "صالحة من",
    validTo: "صالحة إلى",
    issuer: "الجهة المصدرة",
    serialNumber: "الرقم التسلسلي",
    fingerprint: "البصمة",
    keyType: "نوع المفتاح",
    keySize: "حجم المفتاح"
  },
  en: {
    title: "SSL Certificates",
    subtitle: "Manage security certificates for your domains and platforms",
    addCertificate: "Add Certificate",
    uploadCertificate: "Upload Certificate",
    generateCertificate: "Generate Certificate",
    noCertificates: "No Certificates",
    noCertificatesDesc: "Start by adding an SSL certificate to secure your domains",
    certificate: "Certificate",
    domain: "Domain",
    status: "Status",
    provider: "Provider",
    expiresAt: "Expires At",
    issuedAt: "Issued At",
    autoRenew: "Auto Renew",
    actions: "Actions",
    activate: "Activate",
    deactivate: "Deactivate",
    renew: "Renew",
    delete: "Delete",
    view: "View",
    statusLabels: {
      pending: "Pending",
      issuing: "Issuing",
      issued: "Issued",
      renewing: "Renewing",
      expired: "Expired",
      error: "Error",
      active: "Active"
    },
    providers: {
      letsencrypt: "Let's Encrypt",
      namecheap: "Namecheap",
      cloudflare: "Cloudflare",
      custom: "Custom Certificate"
    },
    uploadForm: {
      title: "Upload SSL Certificate",
      description: "Upload your own certificate from Namecheap or any other provider",
      hostname: "Domain Name",
      hostnamePlaceholder: "example.com",
      provider: "Certificate Provider",
      certificateChain: "Certificate Chain",
      certificatePlaceholder: "Paste your .crt or .pem file content here",
      privateKey: "Private Key",
      privateKeyPlaceholder: "Paste your .key file content here",
      upload: "Upload Certificate",
      uploading: "Uploading..."
    },
    generateForm: {
      title: "Generate Free SSL Certificate",
      description: "A free certificate will be generated from Let's Encrypt",
      selectDomain: "Select Domain",
      generate: "Generate Certificate",
      generating: "Generating..."
    },
    linkForm: {
      title: "Link Certificate to Platform",
      selectPlatform: "Select Platform",
      link: "Link",
      linking: "Linking..."
    },
    confirmDelete: "Are you sure you want to delete this certificate?",
    success: {
      uploaded: "Certificate uploaded successfully",
      generated: "Certificate request created successfully",
      renewed: "Certificate renewed successfully",
      deleted: "Certificate deleted successfully",
      linked: "Certificate linked successfully"
    },
    errors: {
      uploadFailed: "Failed to upload certificate",
      generateFailed: "Failed to generate certificate",
      renewFailed: "Failed to renew certificate",
      deleteFailed: "Failed to delete certificate"
    },
    daysRemaining: "days remaining",
    expired: "Expired",
    linkedPlatforms: "Linked Platforms",
    certificateDetails: "Certificate Details",
    securityInfo: "Security Info",
    validFrom: "Valid From",
    validTo: "Valid To",
    issuer: "Issuer",
    serialNumber: "Serial Number",
    fingerprint: "Fingerprint",
    keyType: "Key Type",
    keySize: "Key Size"
  }
};

interface SSLCertificate {
  id: string;
  domainId: string;
  hostname: string;
  provider: string;
  challengeType: string;
  status: string;
  issuedAt?: string;
  expiresAt?: string;
  autoRenew: boolean;
  lastError?: string;
  lastErrorAr?: string;
  createdAt: string;
  linkedPlatforms?: string[];
}

interface CustomDomain {
  id: string;
  hostname: string;
  status: string;
  sslStatus: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  issuing: "bg-blue-500",
  issued: "bg-green-500",
  renewing: "bg-blue-500",
  expired: "bg-red-500",
  error: "bg-red-500",
  active: "bg-green-500"
};

const statusIcons: Record<string, typeof CheckCircle> = {
  pending: Clock,
  issuing: RefreshCw,
  issued: CheckCircle,
  renewing: RefreshCw,
  expired: XCircle,
  error: AlertTriangle,
  active: ShieldCheck
};

export default function SSLCertificates() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<SSLCertificate | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    hostname: "",
    provider: "namecheap",
    certificateChain: "",
    privateKey: ""
  });

  const [selectedDomainForGenerate, setSelectedDomainForGenerate] = useState("");

  const { data: certificatesData, isLoading } = useQuery<{ success: boolean; certificates: SSLCertificate[] }>({
    queryKey: ["/api/ssl/certificates"],
    queryFn: async () => {
      const res = await fetch("/api/ssl/certificates");
      if (!res.ok) {
        return { success: false, certificates: [] };
      }
      return res.json();
    }
  });
  const certificates = certificatesData?.certificates || [];

  const { data: domainsData } = useQuery<{ success: boolean; domains: CustomDomain[] }>({
    queryKey: ["/api/domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains");
      if (!res.ok) {
        return { success: false, domains: [] };
      }
      return res.json();
    }
  });
  const domains = domainsData?.domains || [];

  const uploadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ssl/certificates/upload", uploadForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl/certificates"] });
      setShowUploadDialog(false);
      setUploadForm({ hostname: "", provider: "namecheap", certificateChain: "", privateKey: "" });
      toast({ title: t.success.uploaded });
    },
    onError: () => {
      toast({ title: t.errors.uploadFailed, variant: "destructive" });
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ssl/certificates/generate", { domainId: selectedDomainForGenerate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl/certificates"] });
      setShowGenerateDialog(false);
      setSelectedDomainForGenerate("");
      toast({ title: t.success.generated });
    },
    onError: () => {
      toast({ title: t.errors.generateFailed, variant: "destructive" });
    }
  });

  const renewMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      return apiRequest("POST", `/api/ssl/certificates/${certificateId}/renew`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl/certificates"] });
      toast({ title: t.success.renewed });
    },
    onError: () => {
      toast({ title: t.errors.renewFailed, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      return apiRequest("DELETE", `/api/ssl/certificates/${certificateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl/certificates"] });
      setShowDeleteDialog(false);
      setSelectedCertificate(null);
      toast({ title: t.success.deleted });
    },
    onError: () => {
      toast({ title: t.errors.deleteFailed, variant: "destructive" });
    }
  });

  const toggleAutoRenewMutation = useMutation({
    mutationFn: async ({ id, autoRenew }: { id: string; autoRenew: boolean }) => {
      return apiRequest("PATCH", `/api/ssl/certificates/${id}`, { autoRenew });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl/certificates"] });
    }
  });

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
    const StatusIcon = statusIcons[status] || Clock;
    const statusLabel = t.statusLabels[status as keyof typeof t.statusLabels] || status;
    return (
      <Badge variant="secondary" className={`${statusColors[status] || "bg-gray-500"} text-white`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusLabel}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-ssl-title">
            <Shield className="h-8 w-8 text-green-500" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-generate-ssl">
                <Lock className="h-4 w-4 mr-2" />
                {t.generateCertificate}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.generateForm.title}</DialogTitle>
                <DialogDescription>{t.generateForm.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t.generateForm.selectDomain}</Label>
                  <Select value={selectedDomainForGenerate} onValueChange={setSelectedDomainForGenerate}>
                    <SelectTrigger data-testid="select-domain-generate">
                      <SelectValue placeholder={t.generateForm.selectDomain} />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {domain.hostname}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => generateMutation.mutate()}
                  disabled={!selectedDomainForGenerate || generateMutation.isPending}
                  data-testid="button-confirm-generate"
                >
                  {generateMutation.isPending ? t.generateForm.generating : t.generateForm.generate}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload-ssl">
                <Upload className="h-4 w-4 mr-2" />
                {t.uploadCertificate}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.uploadForm.title}</DialogTitle>
                <DialogDescription>{t.uploadForm.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.uploadForm.hostname}</Label>
                    <Input
                      placeholder={t.uploadForm.hostnamePlaceholder}
                      value={uploadForm.hostname}
                      onChange={(e) => setUploadForm(f => ({ ...f, hostname: e.target.value }))}
                      data-testid="input-ssl-hostname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.uploadForm.provider}</Label>
                    <Select 
                      value={uploadForm.provider} 
                      onValueChange={(v) => setUploadForm(f => ({ ...f, provider: v }))}
                    >
                      <SelectTrigger data-testid="select-ssl-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="namecheap">{t.providers.namecheap}</SelectItem>
                        <SelectItem value="cloudflare">{t.providers.cloudflare}</SelectItem>
                        <SelectItem value="letsencrypt">{t.providers.letsencrypt}</SelectItem>
                        <SelectItem value="custom">{t.providers.custom}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileKey className="h-4 w-4" />
                    {t.uploadForm.certificateChain}
                  </Label>
                  <Textarea
                    placeholder={t.uploadForm.certificatePlaceholder}
                    value={uploadForm.certificateChain}
                    onChange={(e) => setUploadForm(f => ({ ...f, certificateChain: e.target.value }))}
                    className="font-mono text-sm min-h-[150px]"
                    data-testid="input-ssl-certificate"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    {t.uploadForm.privateKey}
                  </Label>
                  <Textarea
                    placeholder={t.uploadForm.privateKeyPlaceholder}
                    value={uploadForm.privateKey}
                    onChange={(e) => setUploadForm(f => ({ ...f, privateKey: e.target.value }))}
                    className="font-mono text-sm min-h-[150px]"
                    data-testid="input-ssl-privatekey"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => uploadMutation.mutate()}
                  disabled={!uploadForm.hostname || !uploadForm.certificateChain || !uploadForm.privateKey || uploadMutation.isPending}
                  data-testid="button-confirm-upload"
                >
                  {uploadMutation.isPending ? t.uploadForm.uploading : t.uploadForm.upload}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.noCertificates}</h3>
            <p className="text-muted-foreground mb-6">{t.noCertificatesDesc}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                {t.generateCertificate}
              </Button>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                {t.uploadCertificate}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certificates.map((cert) => {
            const daysRemaining = getDaysRemaining(cert.expiresAt);
            const isExpired = daysRemaining !== null && daysRemaining <= 0;
            const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
            
            return (
              <Card key={cert.id} className={isExpired ? "border-red-500" : isExpiringSoon ? "border-yellow-500" : ""}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isExpired ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"}`}>
                      {isExpired ? (
                        <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                      ) : (
                        <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {cert.hostname}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{t.providers[cert.provider as keyof typeof t.providers] || cert.provider}</Badge>
                        {getStatusBadge(cert.status)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Switch
                        checked={cert.autoRenew}
                        onCheckedChange={(checked) => toggleAutoRenewMutation.mutate({ id: cert.id, autoRenew: checked })}
                        data-testid={`switch-autorenew-${cert.id}`}
                      />
                      <span>{t.autoRenew}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">{t.issuedAt}</p>
                        <p className="font-medium">
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">{t.expiresAt}</p>
                        <p className={`font-medium ${isExpired ? "text-red-500" : isExpiringSoon ? "text-yellow-500" : ""}`}>
                          {cert.expiresAt ? new Date(cert.expiresAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">{language === 'ar' ? 'الوقت المتبقي' : 'Time Remaining'}</p>
                        <p className={`font-medium ${isExpired ? "text-red-500" : isExpiringSoon ? "text-yellow-500" : "text-green-500"}`}>
                          {daysRemaining !== null ? (
                            isExpired ? t.expired : `${daysRemaining} ${t.daysRemaining}`
                          ) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">{t.linkedPlatforms}</p>
                        <p className="font-medium">{cert.linkedPlatforms?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  {(cert.lastError || cert.lastErrorAr) && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-400 text-sm">
                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                      {language === 'ar' ? cert.lastErrorAr : cert.lastError}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => renewMutation.mutate(cert.id)}
                    disabled={renewMutation.isPending}
                    data-testid={`button-renew-${cert.id}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t.renew}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedCertificate(cert);
                      setShowDeleteDialog(true);
                    }}
                    data-testid={`button-delete-${cert.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t.delete}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.delete}</DialogTitle>
            <DialogDescription>{t.confirmDelete}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCertificate && deleteMutation.mutate(selectedCertificate.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') : t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
