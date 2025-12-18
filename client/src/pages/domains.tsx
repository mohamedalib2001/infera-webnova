import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "lucide-react";

const translations = {
  ar: {
    title: "إدارة النطاقات",
    subtitle: "ربط نطاقاتك الخاصة بمنصتك",
    addDomain: "إضافة نطاق",
    hostname: "اسم النطاق",
    hostnamePlaceholder: "example.com",
    status: "الحالة",
    sslStatus: "حالة SSL",
    actions: "الإجراءات",
    verify: "تحقق",
    delete: "حذف",
    noDomains: "لا توجد نطاقات مضافة",
    noDomainsDesc: "أضف نطاقك الأول لربطه بمنصتك",
    addDomainTitle: "إضافة نطاق جديد",
    addDomainDesc: "أدخل اسم النطاق الذي تريد ربطه",
    cancel: "إلغاء",
    add: "إضافة",
    verificationRequired: "مطلوب التحقق",
    verificationInstructions: "أضف سجل DNS التالي للتحقق من ملكية النطاق:",
    recordType: "نوع السجل",
    recordName: "الاسم",
    recordValue: "القيمة",
    copied: "تم النسخ",
    copyToClipboard: "نسخ",
    statuses: {
      pending: "معلق",
      verifying: "قيد التحقق",
      verified: "تم التحقق",
      ssl_pending: "SSL معلق",
      ssl_issued: "SSL صادر",
      active: "نشط",
      error: "خطأ",
    },
    sslStatuses: {
      none: "غير مفعل",
      pending: "معلق",
      active: "نشط",
      error: "خطأ",
    },
    errors: {
      domainExists: "هذا النطاق مضاف مسبقاً",
      invalidDomain: "صيغة النطاق غير صحيحة",
      quotaExceeded: "تجاوزت الحد الأقصى للنطاقات",
      verificationFailed: "فشل التحقق من النطاق",
      generic: "حدث خطأ، حاول مرة أخرى",
    },
    quotaInfo: "النطاقات المستخدمة",
    loginRequired: "يجب تسجيل الدخول لإدارة النطاقات",
  },
  en: {
    title: "Domain Management",
    subtitle: "Connect your custom domains to your platform",
    addDomain: "Add Domain",
    hostname: "Domain Name",
    hostnamePlaceholder: "example.com",
    status: "Status",
    sslStatus: "SSL Status",
    actions: "Actions",
    verify: "Verify",
    delete: "Delete",
    noDomains: "No domains added",
    noDomainsDesc: "Add your first domain to connect it to your platform",
    addDomainTitle: "Add New Domain",
    addDomainDesc: "Enter the domain name you want to connect",
    cancel: "Cancel",
    add: "Add",
    verificationRequired: "Verification Required",
    verificationInstructions: "Add the following DNS record to verify domain ownership:",
    recordType: "Record Type",
    recordName: "Name",
    recordValue: "Value",
    copied: "Copied",
    copyToClipboard: "Copy",
    statuses: {
      pending: "Pending",
      verifying: "Verifying",
      verified: "Verified",
      ssl_pending: "SSL Pending",
      ssl_issued: "SSL Issued",
      active: "Active",
      error: "Error",
    },
    sslStatuses: {
      none: "None",
      pending: "Pending",
      active: "Active",
      error: "Error",
    },
    errors: {
      domainExists: "This domain already exists",
      invalidDomain: "Invalid domain format",
      quotaExceeded: "Domain quota exceeded",
      verificationFailed: "Domain verification failed",
      generic: "An error occurred, please try again",
    },
    quotaInfo: "Domains used",
    loginRequired: "Please login to manage domains",
  },
};

interface Domain {
  id: number;
  hostname: string;
  status: string;
  sslStatus: string;
  verificationToken?: string;
  createdAt: string;
}

interface DomainQuota {
  maxDomains: number;
  usedDomains: number;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
    case 'verified':
    case 'ssl_issued':
      return 'default';
    case 'pending':
    case 'verifying':
    case 'ssl_pending':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
    case 'verified':
    case 'ssl_issued':
      return CheckCircle2;
    case 'pending':
    case 'verifying':
    case 'ssl_pending':
      return Clock;
    case 'error':
      return XCircle;
    default:
      return AlertCircle;
  }
}

export default function DomainsPage() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const t = translations[language];
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const { data: domains = [], isLoading } = useQuery<Domain[]>({
    queryKey: ['/api/custom-domains'],
    enabled: isAuthenticated,
  });

  const { data: quota } = useQuery<DomainQuota>({
    queryKey: ['/api/domain-quotas', user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  const addDomainMutation = useMutation({
    mutationFn: async (hostname: string) => {
      return apiRequest('POST', '/api/custom-domains', { hostname });
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم إضافة النطاق' : 'Domain added successfully' });
      setShowAddDialog(false);
      setNewDomain("");
      queryClient.invalidateQueries({ queryKey: ['/api/custom-domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/domain-quotas'] });
    },
    onError: (error: any) => {
      const message = error?.message || t.errors.generic;
      toast({ title: message, variant: 'destructive' });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/custom-domains/${id}`);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم حذف النطاق' : 'Domain deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-domains'] });
      queryClient.invalidateQueries({ queryKey: ['/api/domain-quotas'] });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/custom-domains/${id}/verify`);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم إرسال طلب التحقق' : 'Verification initiated' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-domains'] });
    },
    onError: () => {
      toast({ title: t.errors.verificationFailed, variant: 'destructive' });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t.loginRequired}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {quota && (
            <Badge variant="outline" className="text-sm">
              {t.quotaInfo}: {quota.usedDomains} / {quota.maxDomains}
            </Badge>
          )}
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-domain">
                <Plus className="w-4 h-4 mr-2" />
                {t.addDomain}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addDomainTitle}</DialogTitle>
                <DialogDescription>{t.addDomainDesc}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="domain">{t.hostname}</Label>
                <Input
                  id="domain"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder={t.hostnamePlaceholder}
                  data-testid="input-domain"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  {t.cancel}
                </Button>
                <Button 
                  onClick={() => addDomainMutation.mutate(newDomain)}
                  disabled={!newDomain || addDomainMutation.isPending}
                  data-testid="button-confirm-add"
                >
                  {addDomainMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.add}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
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
            <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-domain">
              <Plus className="w-4 h-4 mr-2" />
              {t.addDomain}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => {
            const StatusIcon = getStatusIcon(domain.status);
            const SslIcon = getStatusIcon(domain.sslStatus);
            
            return (
              <Card key={domain.id} data-testid={`domain-card-${domain.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {domain.hostname}
                          <a 
                            href={`https://${domain.hostname}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground"
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
                          <Badge variant={getStatusBadgeVariant(domain.sslStatus)} className="text-xs gap-1">
                            <Shield className="w-3 h-3" />
                            SSL: {t.sslStatuses[domain.sslStatus as keyof typeof t.sslStatuses] || domain.sslStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(domain.status === 'pending' || domain.status === 'verifying') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDomain(domain)}
                          data-testid={`button-verify-${domain.id}`}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {t.verify}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteDomainMutation.mutate(domain.id)}
                        disabled={deleteDomainMutation.isPending}
                        data-testid={`button-delete-${domain.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedDomain && (
        <Dialog open={!!selectedDomain} onOpenChange={() => setSelectedDomain(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.verificationRequired}</DialogTitle>
              <DialogDescription>
                {t.verificationInstructions}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t.recordType}</span>
                  <code className="bg-background px-2 py-1 rounded text-sm">TXT</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t.recordName}</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm">_infera-verify</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard('_infera-verify')}
                      data-testid="button-copy-record-name"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t.recordValue}</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-2 py-1 rounded text-sm text-xs max-w-[200px] truncate">
                      {selectedDomain.verificationToken || `infera-verify-${selectedDomain.id}`}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(selectedDomain.verificationToken || `infera-verify-${selectedDomain.id}`)}
                      data-testid="button-copy-record-value"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDomain(null)} data-testid="button-cancel-verify">
                {t.cancel}
              </Button>
              <Button 
                onClick={() => {
                  verifyDomainMutation.mutate(selectedDomain.id);
                  setSelectedDomain(null);
                }}
                data-testid="button-confirm-verify"
              >
                {t.verify}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
