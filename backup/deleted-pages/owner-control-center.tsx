import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, Key, FileText, Users, Settings, Building, Palette, 
  Clock, Calendar, DollarSign, CheckCircle, XCircle, AlertTriangle,
  Plus, Send, Download, Eye, Edit, Trash2, RefreshCw, Lock
} from "lucide-react";

// ==================== مركز تحكم المالك ====================
// Owner Control Center - Platform Ownership & Franchise Licensing

const translations = {
  en: {
    title: "Owner Control Center",
    subtitle: "Manage platform ownership, licenses, and contracts",
    myPlatforms: "My Platforms",
    licenses: "Licenses",
    contracts: "Contracts",
    branding: "Branding",
    settings: "Settings",
    registerPlatform: "Register Platform",
    issueLicense: "Issue License",
    generateContract: "Generate Contract",
    noPlatforms: "No registered platforms",
    noLicenses: "No licenses issued",
    noContracts: "No contracts",
    active: "Active",
    pending: "Pending",
    expired: "Expired",
    suspended: "Suspended",
    personal: "Personal",
    commercial: "Commercial",
    enterprise: "Enterprise",
    usageRights: "Usage Rights",
    sale: "Sale",
    franchise: "Franchise",
    whiteLabel: "White Label",
    selectProject: "Select Project",
    licenseeEmail: "Licensee Email",
    licenseType: "License Type",
    startDate: "Start Date",
    expiryDate: "Expiry Date",
    price: "Price",
    revenueShare: "Revenue Share %",
    allowWhiteLabel: "Allow White Label",
    allowBrandingChanges: "Allow Branding Changes",
    allowReselling: "Allow Reselling",
    contractType: "Contract Type",
    buyerEmail: "Buyer Email",
    totalValue: "Total Value",
    ownerRetainsIP: "Owner Retains IP",
    nonCompetePeriod: "Non-Compete Period (months)",
    postSaleShare: "Post-Sale Revenue Share %",
    useSameName: "Use Same Name",
    useDifferentName: "Use Different Name",
    allowModifications: "Allow Modifications",
    send: "Send",
    sign: "Sign",
    view: "View",
    activate: "Activate",
    suspend: "Suspend",
    renew: "Renew",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    registrationNumber: "Registration #",
    licenseNumber: "License #",
    contractNumber: "Contract #",
    owner: "Owner",
    licensee: "Licensee",
    buyer: "Buyer",
    seller: "Seller",
    signedBySeller: "Signed by Seller",
    signedByBuyer: "Signed by Buyer",
    awaitingSignature: "Awaiting Signature",
    uploadLogo: "Upload Logo",
    uploadFavicon: "Upload Favicon",
    brandColors: "Brand Colors",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    accentColor: "Accent Color",
  },
  ar: {
    title: "مركز تحكم المالك",
    subtitle: "إدارة ملكية المنصة والتراخيص والعقود",
    myPlatforms: "منصاتي",
    licenses: "التراخيص",
    contracts: "العقود",
    branding: "الهوية البصرية",
    settings: "الإعدادات",
    registerPlatform: "تسجيل منصة",
    issueLicense: "إصدار ترخيص",
    generateContract: "إنشاء عقد",
    noPlatforms: "لا توجد منصات مسجلة",
    noLicenses: "لا توجد تراخيص",
    noContracts: "لا توجد عقود",
    active: "نشط",
    pending: "معلق",
    expired: "منتهي",
    suspended: "موقوف",
    personal: "شخصي",
    commercial: "تجاري",
    enterprise: "مؤسسي",
    usageRights: "حق الانتفاع",
    sale: "بيع",
    franchise: "فرانشايز",
    whiteLabel: "علامة بيضاء",
    selectProject: "اختر المشروع",
    licenseeEmail: "بريد المرخص له",
    licenseType: "نوع الترخيص",
    startDate: "تاريخ البدء",
    expiryDate: "تاريخ الانتهاء",
    price: "السعر",
    revenueShare: "نسبة المشاركة في الإيرادات %",
    allowWhiteLabel: "السماح بالعلامة البيضاء",
    allowBrandingChanges: "السماح بتغيير الهوية",
    allowReselling: "السماح بإعادة البيع",
    contractType: "نوع العقد",
    buyerEmail: "بريد المشتري",
    totalValue: "القيمة الإجمالية",
    ownerRetainsIP: "المالك يحتفظ بالملكية الفكرية",
    nonCompetePeriod: "فترة عدم المنافسة (أشهر)",
    postSaleShare: "نسبة الإيرادات بعد البيع %",
    useSameName: "استخدام نفس الاسم",
    useDifferentName: "استخدام اسم مختلف",
    allowModifications: "السماح بالتعديلات",
    send: "إرسال",
    sign: "توقيع",
    view: "عرض",
    activate: "تفعيل",
    suspend: "إيقاف",
    renew: "تجديد",
    cancel: "إلغاء",
    confirm: "تأكيد",
    save: "حفظ",
    registrationNumber: "رقم التسجيل",
    licenseNumber: "رقم الترخيص",
    contractNumber: "رقم العقد",
    owner: "المالك",
    licensee: "المرخص له",
    buyer: "المشتري",
    seller: "البائع",
    signedBySeller: "موقع من البائع",
    signedByBuyer: "موقع من المشتري",
    awaitingSignature: "بانتظار التوقيع",
    uploadLogo: "رفع الشعار",
    uploadFavicon: "رفع الأيقونة",
    brandColors: "ألوان العلامة",
    primaryColor: "اللون الأساسي",
    secondaryColor: "اللون الثانوي",
    accentColor: "لون التمييز",
  }
};

export default function OwnerControlCenter() {
  const [lang, setLang] = useState<"en" | "ar">("ar");
  const t = translations[lang];
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("platforms");
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [selectedOwnership, setSelectedOwnership] = useState<string | null>(null);
  
  // Form states
  const [licenseForm, setLicenseForm] = useState({
    licenseeEmail: "",
    licenseType: "personal",
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: "",
    licensePrice: 0,
    revenueSharePercentage: 0,
    allowWhiteLabel: false,
    allowBrandingChanges: false,
    allowReselling: false,
  });
  
  const [contractForm, setContractForm] = useState({
    contractType: "usage_rights",
    buyerEmail: "",
    totalValue: 0,
    ownerRetainsIP: true,
    nonCompetePeriodMonths: 12,
    revenueSharePostSale: 5,
    usageSameName: false,
    usageDifferentName: true,
    usageModificationAllowed: false,
  });
  
  // Fetch data
  const { data: ownerships, isLoading: loadingOwnerships } = useQuery({
    queryKey: ['/api/ownership/my-platforms'],
    staleTime: 60000,
  });
  
  const { data: myLicenses, isLoading: loadingLicenses } = useQuery({
    queryKey: ['/api/franchise/my-licenses'],
    staleTime: 60000,
  });
  
  const { data: myContracts, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/contracts/my-contracts'],
    staleTime: 60000,
  });
  
  // Mutations
  const issueLicenseMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/franchise/license/issue', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "License issued successfully", description: "تم إصدار الترخيص بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/franchise'] });
      setShowLicenseDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  
  const generateContractMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/contracts/generate', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Contract generated", description: "تم إنشاء العقد بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/contracts/my-contracts'] });
      setShowContractDialog(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      expired: { variant: "destructive", icon: XCircle },
      suspended: { variant: "destructive", icon: AlertTriangle },
      draft: { variant: "outline", icon: Edit },
      pending_signature: { variant: "secondary", icon: Send },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };
  
  const handleIssueLicense = () => {
    if (!selectedOwnership) {
      toast({ title: "Select a platform first", variant: "destructive" });
      return;
    }
    issueLicenseMutation.mutate({
      ownershipId: selectedOwnership,
      ...licenseForm,
    });
  };
  
  const handleGenerateContract = async () => {
    if (!selectedOwnership) {
      toast({ title: "Select a platform first", variant: "destructive" });
      return;
    }
    
    // Find buyer by email first
    generateContractMutation.mutate({
      ownershipId: selectedOwnership,
      buyerId: contractForm.buyerEmail, // Will be resolved server-side
      ...contractForm,
    });
  };
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Shield className="w-8 h-8 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              data-testid="button-toggle-language"
            >
              {lang === "ar" ? "English" : "العربية"}
            </Button>
          </div>
        </div>
        
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-xl">
            <TabsTrigger value="platforms" className="gap-1" data-testid="tab-platforms">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">{t.myPlatforms}</span>
            </TabsTrigger>
            <TabsTrigger value="licenses" className="gap-1" data-testid="tab-licenses">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">{t.licenses}</span>
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1" data-testid="tab-contracts">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t.contracts}</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-1" data-testid="tab-branding">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t.branding}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.settings}</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-4">
            <div className="flex justify-end">
              <Button data-testid="button-register-platform">
                <Plus className="w-4 h-4 mr-2" />
                {t.registerPlatform}
              </Button>
            </div>
            
            {loadingOwnerships ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (ownerships as any)?.ownerships?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(ownerships as any).ownerships.map((item: any) => (
                  <Card 
                    key={item.ownership.id} 
                    className={`cursor-pointer transition-all ${selectedOwnership === item.ownership.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedOwnership(item.ownership.id)}
                    data-testid={`card-platform-${item.ownership.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{item.project?.name || 'Unknown'}</CardTitle>
                          <CardDescription>{item.ownership.registrationNumber}</CardDescription>
                        </div>
                        {getStatusBadge(item.ownership.isActive ? 'active' : 'suspended')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.owner}:</span>
                        <span>{item.ownership.ownershipPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registered:</span>
                        <span>{new Date(item.ownership.registeredAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setShowLicenseDialog(true); }}
                        data-testid={`button-issue-license-${item.ownership.id}`}
                      >
                        <Key className="w-4 h-4 mr-1" />
                        {t.issueLicense}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); setShowContractDialog(true); }}
                        data-testid={`button-generate-contract-${item.ownership.id}`}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {t.generateContract}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noPlatforms}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Licenses Tab */}
          <TabsContent value="licenses" className="space-y-4">
            {loadingLicenses ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (myLicenses as any)?.licenses?.length > 0 ? (
              <div className="space-y-4">
                {(myLicenses as any).licenses.map((item: any) => (
                  <Card key={item.license.id} data-testid={`card-license-${item.license.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            {item.license.licenseNumber}
                          </CardTitle>
                          <CardDescription>{item.project?.name || 'Platform'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.license.licenseType}</Badge>
                          {getStatusBadge(item.license.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">{t.startDate}</span>
                          <span>{new Date(item.license.startDate).toLocaleDateString()}</span>
                        </div>
                        {item.license.expiryDate && (
                          <div>
                            <span className="text-muted-foreground block">{t.expiryDate}</span>
                            <span>{new Date(item.license.expiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground block">{t.price}</span>
                          <span>{item.license.licensePrice} {item.license.currency}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">{t.revenueShare}</span>
                          <span>{item.license.revenueSharePercentage}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {item.license.allowWhiteLabel && <Badge variant="secondary">White Label</Badge>}
                      {item.license.allowBrandingChanges && <Badge variant="secondary">Branding</Badge>}
                      {item.license.allowReselling && <Badge variant="secondary">Reselling</Badge>}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noLicenses}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            {loadingContracts ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (myContracts as any)?.contracts?.length > 0 ? (
              <div className="space-y-4">
                {(myContracts as any).contracts.map((contract: any) => (
                  <Card key={contract.id} data-testid={`card-contract-${contract.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {contract.contractNumber}
                          </CardTitle>
                          <CardDescription>{contract.titleAr || contract.titleEn}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{contract.contractType}</Badge>
                          {getStatusBadge(contract.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">{t.totalValue}</span>
                          <span>{contract.totalValue} {contract.currency}</span>
                        </div>
                        {contract.effectiveDate && (
                          <div>
                            <span className="text-muted-foreground block">{t.startDate}</span>
                            <span>{new Date(contract.effectiveDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground block">{t.signedBySeller}</span>
                          <span>{contract.sellerSignedAt ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">{t.signedByBuyer}</span>
                          <span>{contract.buyerSignedAt ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-view-contract-${contract.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        {t.view}
                      </Button>
                      {contract.status === 'pending_signature' && (
                        <Button size="sm" data-testid={`button-sign-contract-${contract.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          {t.sign}
                        </Button>
                      )}
                      {contract.status === 'draft' && (
                        <Button size="sm" data-testid={`button-send-contract-${contract.id}`}>
                          <Send className="w-4 h-4 mr-1" />
                          {t.send}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noContracts}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t.branding}
                </CardTitle>
                <CardDescription>
                  {lang === "ar" ? "إدارة الهوية البصرية للمنصة (مشفرة)" : "Manage platform branding assets (encrypted)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.uploadLogo}</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "اسحب وأفلت أو انقر للرفع" : "Drag & drop or click to upload"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.uploadFavicon}</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {lang === "ar" ? "اسحب وأفلت أو انقر للرفع" : "Drag & drop or click to upload"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">{t.brandColors}</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t.primaryColor}</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-9 p-1" defaultValue="#3b82f6" data-testid="input-primary-color" />
                        <Input placeholder="#3b82f6" className="flex-1" data-testid="input-primary-color-hex" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.secondaryColor}</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-9 p-1" defaultValue="#64748b" data-testid="input-secondary-color" />
                        <Input placeholder="#64748b" className="flex-1" data-testid="input-secondary-color-hex" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.accentColor}</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-9 p-1" defaultValue="#f59e0b" data-testid="input-accent-color" />
                        <Input placeholder="#f59e0b" className="flex-1" data-testid="input-accent-color-hex" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button data-testid="button-save-branding">
                  {t.save}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.settings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{lang === "ar" ? "تفعيل التجديد التلقائي" : "Enable Auto-Renewal"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ar" ? "تجديد التراخيص تلقائياً قبل انتهائها" : "Automatically renew licenses before expiry"}
                    </p>
                  </div>
                  <Switch data-testid="switch-auto-renewal" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{lang === "ar" ? "إشعارات البريد الإلكتروني" : "Email Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ar" ? "تلقي إشعارات عند تغييرات التراخيص والعقود" : "Receive notifications for license and contract changes"}
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email-notifications" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Issue License Dialog */}
        <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                {t.issueLicense}
              </DialogTitle>
              <DialogDescription>
                {lang === "ar" ? "إصدار ترخيص جديد للمنصة" : "Issue a new license for the platform"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.licenseeEmail}</Label>
                <Input 
                  type="email" 
                  value={licenseForm.licenseeEmail}
                  onChange={(e) => setLicenseForm({...licenseForm, licenseeEmail: e.target.value})}
                  data-testid="input-licensee-email"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.licenseType}</Label>
                <Select value={licenseForm.licenseType} onValueChange={(v) => setLicenseForm({...licenseForm, licenseType: v})}>
                  <SelectTrigger data-testid="select-license-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">{t.personal}</SelectItem>
                    <SelectItem value="commercial">{t.commercial}</SelectItem>
                    <SelectItem value="enterprise">{t.enterprise}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.startDate}</Label>
                  <Input 
                    type="date" 
                    value={licenseForm.startDate}
                    onChange={(e) => setLicenseForm({...licenseForm, startDate: e.target.value})}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.expiryDate}</Label>
                  <Input 
                    type="date" 
                    value={licenseForm.expiryDate}
                    onChange={(e) => setLicenseForm({...licenseForm, expiryDate: e.target.value})}
                    data-testid="input-expiry-date"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.price} (SAR)</Label>
                  <Input 
                    type="number" 
                    value={licenseForm.licensePrice}
                    onChange={(e) => setLicenseForm({...licenseForm, licensePrice: parseFloat(e.target.value) || 0})}
                    data-testid="input-license-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.revenueShare}</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={licenseForm.revenueSharePercentage}
                    onChange={(e) => setLicenseForm({...licenseForm, revenueSharePercentage: parseFloat(e.target.value) || 0})}
                    data-testid="input-revenue-share"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t.allowWhiteLabel}</Label>
                  <Switch 
                    checked={licenseForm.allowWhiteLabel}
                    onCheckedChange={(v) => setLicenseForm({...licenseForm, allowWhiteLabel: v})}
                    data-testid="switch-allow-whitelabel"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t.allowBrandingChanges}</Label>
                  <Switch 
                    checked={licenseForm.allowBrandingChanges}
                    onCheckedChange={(v) => setLicenseForm({...licenseForm, allowBrandingChanges: v})}
                    data-testid="switch-allow-branding"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t.allowReselling}</Label>
                  <Switch 
                    checked={licenseForm.allowReselling}
                    onCheckedChange={(v) => setLicenseForm({...licenseForm, allowReselling: v})}
                    data-testid="switch-allow-reselling"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowLicenseDialog(false)} data-testid="button-cancel-license">
                {t.cancel}
              </Button>
              <Button onClick={handleIssueLicense} disabled={issueLicenseMutation.isPending} data-testid="button-confirm-license">
                {issueLicenseMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Generate Contract Dialog */}
        <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.generateContract}
              </DialogTitle>
              <DialogDescription>
                {lang === "ar" ? "إنشاء عقد رقمي جديد مع بنود قانونية" : "Generate a new digital contract with legal clauses"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.contractType}</Label>
                <Select value={contractForm.contractType} onValueChange={(v) => setContractForm({...contractForm, contractType: v})}>
                  <SelectTrigger data-testid="select-contract-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage_rights">{t.usageRights}</SelectItem>
                    <SelectItem value="sale">{t.sale}</SelectItem>
                    <SelectItem value="franchise">{t.franchise}</SelectItem>
                    <SelectItem value="white_label">{t.whiteLabel}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.buyerEmail}</Label>
                <Input 
                  type="email" 
                  value={contractForm.buyerEmail}
                  onChange={(e) => setContractForm({...contractForm, buyerEmail: e.target.value})}
                  data-testid="input-buyer-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.totalValue} (SAR)</Label>
                  <Input 
                    type="number" 
                    value={contractForm.totalValue}
                    onChange={(e) => setContractForm({...contractForm, totalValue: parseFloat(e.target.value) || 0})}
                    data-testid="input-contract-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.nonCompetePeriod}</Label>
                  <Input 
                    type="number" 
                    value={contractForm.nonCompetePeriodMonths}
                    onChange={(e) => setContractForm({...contractForm, nonCompetePeriodMonths: parseInt(e.target.value) || 0})}
                    data-testid="input-non-compete"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.postSaleShare}</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={contractForm.revenueSharePostSale}
                  onChange={(e) => setContractForm({...contractForm, revenueSharePostSale: parseFloat(e.target.value) || 0})}
                  data-testid="input-post-sale-share"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t.ownerRetainsIP}</Label>
                  <Switch 
                    checked={contractForm.ownerRetainsIP}
                    onCheckedChange={(v) => setContractForm({...contractForm, ownerRetainsIP: v})}
                    data-testid="switch-retain-ip"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t.useSameName}</Label>
                  <Switch 
                    checked={contractForm.usageSameName}
                    onCheckedChange={(v) => setContractForm({...contractForm, usageSameName: v})}
                    data-testid="switch-same-name"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t.useDifferentName}</Label>
                  <Switch 
                    checked={contractForm.usageDifferentName}
                    onCheckedChange={(v) => setContractForm({...contractForm, usageDifferentName: v})}
                    data-testid="switch-different-name"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t.allowModifications}</Label>
                  <Switch 
                    checked={contractForm.usageModificationAllowed}
                    onCheckedChange={(v) => setContractForm({...contractForm, usageModificationAllowed: v})}
                    data-testid="switch-allow-mods"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowContractDialog(false)} data-testid="button-cancel-contract">
                {t.cancel}
              </Button>
              <Button onClick={handleGenerateContract} disabled={generateContractMutation.isPending} data-testid="button-confirm-contract">
                {generateContractMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                {t.confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
