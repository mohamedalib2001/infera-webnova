import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  AlertTriangle,
  ShoppingCart,
  Link2,
  Shield,
  Info,
  Sparkles,
} from "lucide-react";

const translations = {
  ar: {
    title: "البحث عن نطاق",
    subtitle: "ابحث عن نطاقك المثالي واربطه بمنصتك",
    searchTab: "البحث",
    myDomainsTab: "نطاقاتي",
    connectTab: "ربط النطاقات",
    searchPlaceholder: "ابحث عن نطاق (مثال: mywebsite)",
    searchButton: "بحث",
    searching: "جاري البحث...",
    available: "متاح",
    unavailable: "غير متاح",
    price: "السعر",
    perYear: "/ سنة",
    buyNow: "شراء الآن",
    providers: "المزودين المتاحين",
    disclaimer: "تنبيه مهم",
    disclaimerText: "عند الضغط على زر الشراء، سيتم تحويلك إلى موقع المزود الخارجي لإتمام عملية الشراء. منصة INFERA غير مسؤولة عن أي معاملات مالية أو عمليات شراء تتم على المواقع الخارجية.",
    noResults: "لم يتم العثور على نتائج",
    noResultsDesc: "جرب البحث باسم نطاق مختلف",
    popularExtensions: "الامتدادات الشائعة",
    connectDomain: "ربط نطاق",
    connectDesc: "اربط نطاقك الموجود بمنصتك على INFERA",
    domainName: "اسم النطاق",
    platform: "المنصة",
    selectPlatform: "اختر المنصة",
    connect: "ربط",
    dnsInstructions: "تعليمات DNS",
    dnsDesc: "أضف السجلات التالية في لوحة تحكم نطاقك",
    copied: "تم النسخ",
    copy: "نسخ",
    myConnectedDomains: "نطاقاتي المربوطة",
    noConnectedDomains: "لا توجد نطاقات مربوطة",
    noConnectedDomainsDesc: "ابحث عن نطاق واشتريه، ثم اربطه بمنصتك",
    status: "الحالة",
    active: "نشط",
    pending: "قيد الانتظار",
    verified: "موثق",
  },
  en: {
    title: "Domain Search",
    subtitle: "Find your perfect domain and connect it to your platform",
    searchTab: "Search",
    myDomainsTab: "My Domains",
    connectTab: "Connect Domains",
    searchPlaceholder: "Search for a domain (e.g., mywebsite)",
    searchButton: "Search",
    searching: "Searching...",
    available: "Available",
    unavailable: "Unavailable",
    price: "Price",
    perYear: "/ year",
    buyNow: "Buy Now",
    providers: "Available Providers",
    disclaimer: "Important Notice",
    disclaimerText: "When you click the Buy button, you will be redirected to the external provider's website to complete your purchase. INFERA platform is not responsible for any financial transactions or purchases made on external websites.",
    noResults: "No results found",
    noResultsDesc: "Try searching with a different domain name",
    popularExtensions: "Popular Extensions",
    connectDomain: "Connect Domain",
    connectDesc: "Connect your existing domain to your INFERA platform",
    domainName: "Domain Name",
    platform: "Platform",
    selectPlatform: "Select Platform",
    connect: "Connect",
    dnsInstructions: "DNS Instructions",
    dnsDesc: "Add the following records in your domain control panel",
    copied: "Copied",
    copy: "Copy",
    myConnectedDomains: "My Connected Domains",
    noConnectedDomains: "No connected domains",
    noConnectedDomainsDesc: "Search for a domain and buy it, then connect it to your platform",
    status: "Status",
    active: "Active",
    pending: "Pending",
    verified: "Verified",
  }
};

interface DomainResult {
  domain: string;
  available: boolean;
  price?: number;
  currency?: string;
  providers: {
    name: string;
    price: number;
    currency: string;
    url: string;
    logo?: string;
  }[];
}

const domainProviders = [
  { name: "Namecheap", baseUrl: "https://www.namecheap.com/domains/registration/results/?domain=", logo: "NC" },
  { name: "GoDaddy", baseUrl: "https://www.godaddy.com/domainsearch/find?domainToCheck=", logo: "GD" },
  { name: "Google Domains", baseUrl: "https://domains.google.com/registrar/search?searchTerm=", logo: "G" },
  { name: "Cloudflare", baseUrl: "https://dash.cloudflare.com/?to=/:account/registrar/domain?search=", logo: "CF" },
  { name: "Porkbun", baseUrl: "https://porkbun.com/checkout/search?q=", logo: "PB" },
];

const popularExtensions = [".com", ".net", ".org", ".io", ".co", ".dev", ".app", ".ai"];

export default function DomainSearch() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = translations[language];
  const isRTL = language === "ar";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate search - in production this would call domain availability APIs
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cleanQuery = searchQuery.replace(/\s+/g, '').toLowerCase();
    const results: DomainResult[] = popularExtensions.map(ext => {
      const domain = cleanQuery.includes('.') ? cleanQuery : `${cleanQuery}${ext}`;
      const available = Math.random() > 0.3; // Simulate availability
      
      return {
        domain,
        available,
        price: available ? Math.floor(Math.random() * 50) + 10 : undefined,
        currency: "USD",
        providers: domainProviders.map(p => ({
          name: p.name,
          price: Math.floor(Math.random() * 30) + 8,
          currency: "USD",
          url: `${p.baseUrl}${domain}`,
          logo: p.logo,
        })),
      };
    });
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleBuyClick = (providerUrl: string, providerName: string) => {
    toast({
      title: t.disclaimer,
      description: t.disclaimerText,
      variant: "default",
    });
    
    // Open provider in new tab
    window.open(providerUrl, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t.copied,
      description: text,
    });
  };

  return (
    <div className={`min-h-screen bg-background p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">{t.disclaimer}</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {t.disclaimerText}
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" data-testid="tab-search">
              <Search className="h-4 w-4 mr-2" />
              {t.searchTab}
            </TabsTrigger>
            <TabsTrigger value="my-domains" data-testid="tab-my-domains">
              <Globe className="h-4 w-4 mr-2" />
              {t.myDomainsTab}
            </TabsTrigger>
            <TabsTrigger value="connect" data-testid="tab-connect">
              <Link2 className="h-4 w-4 mr-2" />
              {t.connectTab}
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Box */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                      data-testid="input-domain-search"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    data-testid="button-search"
                  >
                    {isSearching ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin mr-2" />
                        {t.searching}
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        {t.searchButton}
                      </>
                    )}
                  </Button>
                </div>

                {/* Popular Extensions */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">{t.popularExtensions}:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularExtensions.map((ext) => (
                      <Badge 
                        key={ext} 
                        variant="outline" 
                        className="cursor-pointer hover-elevate"
                        onClick={() => setSearchQuery(prev => {
                          const base = prev.replace(/\.[a-z]+$/i, '');
                          return base + ext;
                        })}
                      >
                        {ext}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : hasSearched && searchResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">{t.noResults}</h3>
                  <p className="text-muted-foreground">{t.noResultsDesc}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.domain} className={result.available ? "" : "opacity-60"}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${result.available ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {result.available ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold" data-testid={`domain-${result.domain}`}>
                              {result.domain}
                            </h3>
                            <Badge variant={result.available ? "default" : "secondary"}>
                              {result.available ? t.available : t.unavailable}
                            </Badge>
                          </div>
                        </div>
                        
                        {result.available && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {result.providers.slice(0, 3).map((provider) => (
                              <Button
                                key={provider.name}
                                variant="outline"
                                size="sm"
                                onClick={() => handleBuyClick(provider.url, provider.name)}
                                data-testid={`button-buy-${result.domain}-${provider.name}`}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                {provider.name}
                                <span className="ml-1 text-green-600 dark:text-green-400">
                                  ${provider.price}
                                </span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {result.available && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-2">{t.providers}:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.providers.map((provider) => (
                              <Button
                                key={provider.name}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBuyClick(provider.url, provider.name)}
                                className="text-xs"
                              >
                                <span className="font-bold mr-1">{provider.logo}</span>
                                {provider.name}: ${provider.price}{t.perYear}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Domains Tab */}
          <TabsContent value="my-domains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t.myConnectedDomains}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">{t.noConnectedDomains}</h3>
                  <p className="text-muted-foreground">{t.noConnectedDomainsDesc}</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("search")}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {t.searchButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connect Domain Tab */}
          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  {t.connectDomain}
                </CardTitle>
                <CardDescription>{t.connectDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.domainName}</label>
                  <Input 
                    placeholder="mydomain.com"
                    data-testid="input-connect-domain"
                  />
                </div>
                
                <Button className="w-full" data-testid="button-connect-domain">
                  <Link2 className="h-4 w-4 mr-2" />
                  {t.connect}
                </Button>
              </CardContent>
            </Card>

            {/* DNS Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  {t.dnsInstructions}
                </CardTitle>
                <CardDescription>{t.dnsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span>A Record: @ → 76.76.21.21</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard("76.76.21.21")}
                    >
                      {t.copy}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CNAME: www → cname.infera.io</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard("cname.infera.io")}
                    >
                      {t.copy}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
