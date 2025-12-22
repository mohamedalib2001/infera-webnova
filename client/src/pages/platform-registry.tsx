import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Crown, 
  Building2,
  Network,
  Server,
  Shield,
  ShieldCheck,
  Key,
  KeyRound,
  FileKey,
  Link,
  Link2,
  Unlink,
  Globe,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  Settings,
  Eye,
  Trash2,
  Edit,
  ArrowRight,
  BarChart3,
  Layers,
  GitBranch,
  Lock,
  Unlock,
  Clock,
  ExternalLink
} from "lucide-react";
import type { InferaPlatform, PlatformLink, PlatformService, PlatformCertificate } from "@shared/schema";

const translations = {
  ar: {
    title: "سجل منصات انفرا انجن",
    subtitle: "إدارة منظومة المنصات السيادية (+30 منصة)",
    tabs: {
      platforms: "المنصات",
      links: "روابط المنصات",
      services: "الخدمات",
      certificates: "الشهادات",
      stats: "الإحصائيات"
    },
    platforms: {
      title: "سجل المنصات",
      description: "جميع منصات مجموعة انفرا انجن",
      add: "إضافة منصة",
      init: "تهيئة WebNova",
      name: "اسم المنصة",
      code: "رمز المنصة",
      type: "نوع المنصة",
      sovereignty: "مستوى السيادة",
      status: "الحالة",
      version: "الإصدار",
      central: "مركزية",
      sovereign: "سيادية",
      builder: "بانية",
      commercial: "تجارية",
      root: "جذرية",
      platform: "منصة",
      tenant: "مستأجر",
      user: "مستخدم",
      active: "نشطة",
      inactive: "غير نشطة",
      maintenance: "صيانة",
      deprecated: "متوقفة",
      systemPlatform: "منصة نظام"
    },
    links: {
      title: "روابط المنصات",
      description: "إدارة العلاقات بين المنصات",
      add: "إضافة رابط",
      source: "المنصة المصدر",
      target: "المنصة الهدف",
      type: "نوع الرابط",
      parent_child: "أب - ابن",
      peer: "نظير",
      service_provider: "مزود خدمة",
      federation: "اتحاد",
      mirror: "مرآة",
      activate: "تفعيل",
      deactivate: "إلغاء التفعيل"
    },
    services: {
      title: "خدمات المنصات",
      description: "الخدمات المقدمة بين المنصات",
      add: "إضافة خدمة",
      platform: "المنصة",
      kind: "نوع الخدمة",
      api: "API",
      database: "قاعدة بيانات",
      storage: "تخزين",
      compute: "حوسبة",
      ai: "ذكاء اصطناعي",
      messaging: "رسائل"
    },
    certificates: {
      title: "شهادات المنصات",
      description: "هرمية الشهادات وسلطة التصديق",
      add: "إصدار شهادة",
      revoke: "إلغاء الشهادة",
      hierarchy: "المستوى الهرمي",
      root_ca: "Root CA (المالك)",
      platform_ca: "Platform CA",
      service_cert: "شهادة خدمة",
      user_cert: "شهادة مستخدم",
      serialNumber: "الرقم التسلسلي",
      validFrom: "صالحة من",
      validUntil: "صالحة حتى",
      revoked: "ملغاة",
      valid: "صالحة",
      expired: "منتهية"
    },
    stats: {
      title: "إحصائيات المنظومة",
      totalPlatforms: "إجمالي المنصات",
      activePlatforms: "المنصات النشطة",
      totalLinks: "إجمالي الروابط",
      activeLinks: "الروابط النشطة",
      totalServices: "إجمالي الخدمات",
      activeServices: "الخدمات النشطة",
      totalCertificates: "إجمالي الشهادات",
      validCertificates: "الشهادات الصالحة",
      byType: "حسب النوع",
      byHierarchy: "حسب المستوى"
    },
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ",
      noData: "لا توجد بيانات",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      refresh: "تحديث"
    }
  },
  en: {
    title: "INFERA Engine Platform Registry",
    subtitle: "Manage sovereign platform ecosystem (+30 platforms)",
    tabs: {
      platforms: "Platforms",
      links: "Platform Links",
      services: "Services",
      certificates: "Certificates",
      stats: "Statistics"
    },
    platforms: {
      title: "Platform Registry",
      description: "All INFERA Engine group platforms",
      add: "Add Platform",
      init: "Initialize WebNova",
      name: "Platform Name",
      code: "Platform Code",
      type: "Platform Type",
      sovereignty: "Sovereignty Tier",
      status: "Status",
      version: "Version",
      central: "Central",
      sovereign: "Sovereign",
      builder: "Builder",
      commercial: "Commercial",
      root: "Root",
      platform: "Platform",
      tenant: "Tenant",
      user: "User",
      active: "Active",
      inactive: "Inactive",
      maintenance: "Maintenance",
      deprecated: "Deprecated",
      systemPlatform: "System Platform"
    },
    links: {
      title: "Platform Links",
      description: "Manage relationships between platforms",
      add: "Add Link",
      source: "Source Platform",
      target: "Target Platform",
      type: "Link Type",
      parent_child: "Parent-Child",
      peer: "Peer",
      service_provider: "Service Provider",
      federation: "Federation",
      mirror: "Mirror",
      activate: "Activate",
      deactivate: "Deactivate"
    },
    services: {
      title: "Platform Services",
      description: "Services provided between platforms",
      add: "Add Service",
      platform: "Platform",
      kind: "Service Kind",
      api: "API",
      database: "Database",
      storage: "Storage",
      compute: "Compute",
      ai: "AI",
      messaging: "Messaging"
    },
    certificates: {
      title: "Platform Certificates",
      description: "Certificate hierarchy and authority",
      add: "Issue Certificate",
      revoke: "Revoke Certificate",
      hierarchy: "Hierarchy Level",
      root_ca: "Root CA (Owner)",
      platform_ca: "Platform CA",
      service_cert: "Service Certificate",
      user_cert: "User Certificate",
      serialNumber: "Serial Number",
      validFrom: "Valid From",
      validUntil: "Valid Until",
      revoked: "Revoked",
      valid: "Valid",
      expired: "Expired"
    },
    stats: {
      title: "Ecosystem Statistics",
      totalPlatforms: "Total Platforms",
      activePlatforms: "Active Platforms",
      totalLinks: "Total Links",
      activeLinks: "Active Links",
      totalServices: "Total Services",
      activeServices: "Active Services",
      totalCertificates: "Total Certificates",
      validCertificates: "Valid Certificates",
      byType: "By Type",
      byHierarchy: "By Hierarchy"
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      noData: "No data available",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      refresh: "Refresh"
    }
  }
};

export default function PlatformRegistry() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("platforms");

  const { data: platforms, isLoading: platformsLoading, refetch: refetchPlatforms } = useQuery<InferaPlatform[]>({
    queryKey: ['/api/platform-linking/platforms']
  });

  const { data: links, isLoading: linksLoading, refetch: refetchLinks } = useQuery<PlatformLink[]>({
    queryKey: ['/api/platform-linking/links']
  });

  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useQuery<PlatformService[]>({
    queryKey: ['/api/platform-linking/services']
  });

  const { data: certificates, isLoading: certificatesLoading, refetch: refetchCertificates } = useQuery<PlatformCertificate[]>({
    queryKey: ['/api/platform-linking/certificates']
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/platform-linking/stats']
  });

  const initMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/platform-linking/init'),
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم التهيئة" : "Initialized",
        description: language === 'ar' ? "تم تهيئة WebNova كمنصة جذرية" : "WebNova initialized as root platform"
      });
      refetchPlatforms();
      refetchStats();
    },
    onError: () => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في التهيئة" : "Initialization failed",
        variant: "destructive"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" data-testid="badge-status-active"><CheckCircle className="w-3 h-3 mr-1" />{t.platforms.active}</Badge>;
      case 'inactive':
        return <Badge variant="secondary" data-testid="badge-status-inactive"><XCircle className="w-3 h-3 mr-1" />{t.platforms.inactive}</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" data-testid="badge-status-maintenance"><Clock className="w-3 h-3 mr-1" />{t.platforms.maintenance}</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-status-default">{status}</Badge>;
    }
  };

  const getPlatformTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      central: t.platforms.central,
      sovereign: t.platforms.sovereign,
      builder: t.platforms.builder,
      commercial: t.platforms.commercial
    };
    const colors: Record<string, string> = {
      central: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      sovereign: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      builder: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      commercial: "bg-green-500/10 text-green-500 border-green-500/20"
    };
    return <Badge className={colors[type] || ""} data-testid={`badge-type-${type}`}>{typeLabels[type] || type}</Badge>;
  };

  const getSovereigntyBadge = (tier: string) => {
    const tierLabels: Record<string, string> = {
      root: t.platforms.root,
      platform: t.platforms.platform,
      tenant: t.platforms.tenant,
      user: t.platforms.user
    };
    const icons: Record<string, typeof Crown> = {
      root: Crown,
      platform: Building2,
      tenant: Layers,
      user: Shield
    };
    const Icon = icons[tier] || Shield;
    return (
      <Badge variant="outline" className="gap-1" data-testid={`badge-sovereignty-${tier}`}>
        <Icon className="w-3 h-3" />
        {tierLabels[tier] || tier}
      </Badge>
    );
  };

  const getCertificateStatusBadge = (cert: PlatformCertificate) => {
    if (cert.isRevoked) {
      return <Badge variant="destructive" data-testid="badge-cert-revoked"><XCircle className="w-3 h-3 mr-1" />{t.certificates.revoked}</Badge>;
    }
    if (new Date(cert.validUntil) < new Date()) {
      return <Badge variant="secondary" data-testid="badge-cert-expired"><AlertCircle className="w-3 h-3 mr-1" />{t.certificates.expired}</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-500 border-green-500/20" data-testid="badge-cert-valid"><CheckCircle className="w-3 h-3 mr-1" />{t.certificates.valid}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Network className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t.title}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { refetchPlatforms(); refetchLinks(); refetchServices(); refetchCertificates(); refetchStats(); }} data-testid="button-refresh-all">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.common.refresh}
            </Button>
            <Button onClick={() => initMutation.mutate()} disabled={initMutation.isPending} data-testid="button-init-webnova">
              <Crown className="w-4 h-4 mr-2" />
              {t.platforms.init}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 gap-1" data-testid="tabs-platform-registry">
            <TabsTrigger value="platforms" className="gap-2" data-testid="tab-platforms">
              <Building2 className="w-4 h-4" />
              {t.tabs.platforms}
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2" data-testid="tab-links">
              <Link className="w-4 h-4" />
              {t.tabs.links}
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2" data-testid="tab-services">
              <Server className="w-4 h-4" />
              {t.tabs.services}
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2" data-testid="tab-certificates">
              <FileKey className="w-4 h-4" />
              {t.tabs.certificates}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2" data-testid="tab-stats">
              <BarChart3 className="w-4 h-4" />
              {t.tabs.stats}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <div>
                  <CardTitle data-testid="text-platforms-title">{t.platforms.title}</CardTitle>
                  <CardDescription data-testid="text-platforms-desc">{t.platforms.description}</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-platform">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.platforms.add}
                </Button>
              </CardHeader>
              <CardContent>
                {platformsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
                ) : !platforms?.length ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.noData}</div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {platforms.map((platform) => (
                        <div key={platform.id} className="p-4 rounded-lg border bg-card hover-elevate" data-testid={`card-platform-${platform.id}`}>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{language === 'ar' ? (platform.nameAr || platform.name) : platform.name}</h3>
                                {platform.isSystemPlatform && (
                                  <Badge variant="outline" className="gap-1 text-primary border-primary/30">
                                    <Lock className="w-3 h-3" />
                                    {t.platforms.systemPlatform}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' ? (platform.descriptionAr || platform.description) : platform.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary">{platform.code}</Badge>
                                {getPlatformTypeBadge(platform.platformType)}
                                {getSovereigntyBadge(platform.sovereigntyTier)}
                                {getStatusBadge(platform.status)}
                                {platform.version && <Badge variant="outline">v{platform.version}</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" data-testid={`button-view-platform-${platform.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" data-testid={`button-edit-platform-${platform.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!platform.isSystemPlatform && (
                                <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-delete-platform-${platform.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <div>
                  <CardTitle data-testid="text-links-title">{t.links.title}</CardTitle>
                  <CardDescription data-testid="text-links-desc">{t.links.description}</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-link">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.links.add}
                </Button>
              </CardHeader>
              <CardContent>
                {linksLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
                ) : !links?.length ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.noData}</div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {links.map((link) => (
                        <div key={link.id} className="p-4 rounded-lg border bg-card hover-elevate" data-testid={`card-link-${link.id}`}>
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{link.sourcePlatformId.slice(0, 8)}...</Badge>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline">{link.targetPlatformId.slice(0, 8)}...</Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge>{link.linkType}</Badge>
                              {link.isActive ? (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                  <Link2 className="w-3 h-3 mr-1" />
                                  {t.platforms.active}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Unlink className="w-3 h-3 mr-1" />
                                  {t.platforms.inactive}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {link.isActive ? (
                                <Button size="sm" variant="outline" data-testid={`button-deactivate-link-${link.id}`}>
                                  {t.links.deactivate}
                                </Button>
                              ) : (
                                <Button size="sm" data-testid={`button-activate-link-${link.id}`}>
                                  {t.links.activate}
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-delete-link-${link.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <div>
                  <CardTitle data-testid="text-services-title">{t.services.title}</CardTitle>
                  <CardDescription data-testid="text-services-desc">{t.services.description}</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-service">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.services.add}
                </Button>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
                ) : !services?.length ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.noData}</div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {services.map((service) => (
                        <div key={service.id} className="p-4 rounded-lg border bg-card hover-elevate" data-testid={`card-service-${service.id}`}>
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                              <h4 className="font-medium">{service.serviceName}</h4>
                              <p className="text-sm text-muted-foreground">{service.platformId.slice(0, 8)}...</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{service.serviceKind}</Badge>
                              {getStatusBadge(service.status)}
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" data-testid={`button-edit-service-${service.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-delete-service-${service.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <div>
                  <CardTitle data-testid="text-certs-title">{t.certificates.title}</CardTitle>
                  <CardDescription data-testid="text-certs-desc">{t.certificates.description}</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-certificate">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.certificates.add}
                </Button>
              </CardHeader>
              <CardContent>
                {certificatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.loading}</div>
                ) : !certificates?.length ? (
                  <div className="text-center py-8 text-muted-foreground">{t.common.noData}</div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="p-4 rounded-lg border bg-card hover-elevate" data-testid={`card-cert-${cert.id}`}>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileKey className="w-5 h-5 text-primary" />
                                <h4 className="font-medium">{cert.commonName}</h4>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{t.certificates.serialNumber}: {cert.serialNumber}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">
                                  {t.certificates[cert.hierarchyRole as keyof typeof t.certificates] || cert.hierarchyRole}
                                </Badge>
                                {getCertificateStatusBadge(cert)}
                                {cert.isOwnerCertificate && (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t.certificates.validFrom}: {new Date(cert.validFrom).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - 
                                {t.certificates.validUntil}: {new Date(cert.validUntil).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" data-testid={`button-view-cert-${cert.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!cert.isRevoked && (
                                <Button size="icon" variant="ghost" className="text-destructive" data-testid={`button-revoke-cert-${cert.id}`}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.totalPlatforms}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="stat-total-platforms">{(stats as any)?.totalPlatforms || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.stats.activePlatforms}: {(stats as any)?.activePlatforms || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.totalLinks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="stat-total-links">{(stats as any)?.totalLinks || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.stats.activeLinks}: {(stats as any)?.activeLinks || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.totalServices}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="stat-total-services">{(stats as any)?.totalServices || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.stats.activeServices}: {(stats as any)?.activeServices || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t.stats.totalCertificates}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="stat-total-certs">{(stats as any)?.totalCertificates || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.stats.validCertificates}: {(stats as any)?.validCertificates || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.stats.byType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>{t.platforms.central}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.platformsByType?.central || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{t.platforms.sovereign}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.platformsByType?.sovereign || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>{t.platforms.builder}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.platformsByType?.builder || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>{t.platforms.commercial}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.platformsByType?.commercial || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.stats.byHierarchy}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>{t.certificates.root_ca}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.certificatesByHierarchy?.root_ca || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span>{t.certificates.platform_ca}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.certificatesByHierarchy?.platform_ca || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-green-500" />
                        <span>{t.certificates.service_cert}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.certificatesByHierarchy?.service_cert || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>{t.certificates.user_cert}</span>
                      </div>
                      <span className="font-medium">{(stats as any)?.certificatesByHierarchy?.user_cert || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
