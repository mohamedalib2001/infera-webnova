import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Store, 
  Search,
  Download,
  Star,
  Package,
  LayoutTemplate,
  Puzzle,
  Check,
  Trash2,
  Loader2,
  CreditCard,
  Bot,
  Shield,
  Zap,
  BarChart3,
  Headphones,
  PenTool,
  Globe,
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react";
import type { MarketplaceItem, MarketplaceInstallation } from "@shared/schema";

const translations = {
  ar: {
    title: "سوق الإضافات والقوالب",
    subtitle: "اكتشف قوالب وإضافات من المجتمع لتسريع مشاريعك",
    templates: "قوالب",
    extensions: "إضافات",
    services: "خدمات AI",
    popular: "الأكثر شعبية",
    search: "بحث...",
    install: "تثبيت",
    activate: "تفعيل",
    installed: "مثبّت",
    active: "نشط",
    uninstall: "إلغاء التثبيت",
    downloads: "تحميل",
    rating: "تقييم",
    by: "بواسطة",
    free: "مجاني",
    premium: "مدفوع",
    subscription: "اشتراك",
    usageBased: "حسب الاستخدام",
    categories: "التصنيفات",
    all: "الكل",
    installing: "جاري التثبيت...",
    uninstalling: "جاري الإلغاء...",
    noResults: "لم يتم العثور على نتائج",
    version: "الإصدار",
    perMonth: "/شهر",
    startingAt: "يبدأ من",
    features: "الميزات",
    viewDetails: "عرض التفاصيل"
  },
  en: {
    title: "Extensions & Templates Marketplace",
    subtitle: "Discover community templates and extensions to accelerate your projects",
    templates: "Templates",
    extensions: "Extensions",
    services: "AI Services",
    popular: "Popular",
    search: "Search...",
    install: "Install",
    activate: "Activate",
    installed: "Installed",
    active: "Active",
    uninstall: "Uninstall",
    downloads: "downloads",
    rating: "rating",
    by: "by",
    free: "Free",
    premium: "Premium",
    subscription: "Subscription",
    usageBased: "Usage-based",
    categories: "Categories",
    all: "All",
    installing: "Installing...",
    uninstalling: "Uninstalling...",
    noResults: "No results found",
    version: "Version",
    perMonth: "/mo",
    startingAt: "Starting at",
    features: "Features",
    viewDetails: "View Details"
  }
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  all: { en: "All", ar: "الكل" },
  ecommerce: { en: "E-commerce", ar: "تجارة إلكترونية" },
  admin: { en: "Admin", ar: "لوحة تحكم" },
  auth: { en: "Auth", ar: "مصادقة" },
  payment: { en: "Payment", ar: "دفع" },
  blog: { en: "Blog", ar: "مدونة" },
  ai: { en: "AI", ar: "ذكاء اصطناعي" }
};

const iconMap: Record<string, typeof Bot> = {
  bot: Bot,
  shield: Shield,
  chart: BarChart3,
  credit: CreditCard,
  headphones: Headphones,
  pen: PenTool,
  search: Globe,
  store: Package,
  file: LayoutTemplate,
  zap: Zap
};

export default function Marketplace() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const typeMap: Record<string, string> = {
    templates: 'template',
    extensions: 'extension',
    services: 'service'
  };

  const { data: items = [], isLoading: loadingItems } = useQuery<MarketplaceItem[]>({
    queryKey: ['/api/marketplace/items', activeTab, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== "all") {
        const mappedType = typeMap[activeTab];
        if (mappedType) params.set("type", mappedType);
      }
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) params.set("search", trimmedSearch);
      const res = await fetch(`/api/marketplace/items?${params}`);
      if (!res.ok) {
        throw new Error('Failed to fetch items');
      }
      return res.json();
    }
  });

  const { data: installations = [] } = useQuery<{ installation: MarketplaceInstallation; item: MarketplaceItem }[]>({
    queryKey: ['/api/marketplace/installations']
  });

  const installedItemIds = new Set(installations.map(i => i.installation.itemId));

  const installMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest('POST', `/api/marketplace/install/${itemId}`, {});
    },
    onSuccess: (data: any) => {
      toast({ 
        title: language === 'ar' ? data.messageAr : data.message,
        description: language === 'ar' ? 'الآن يمكنك استخدامه في مشاريعك' : 'You can now use it in your projects'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/installations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    }
  });

  const uninstallMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest('DELETE', `/api/marketplace/uninstall/${itemId}`, {});
    },
    onSuccess: (data: any) => {
      toast({ 
        title: language === 'ar' ? data.messageAr : data.message 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/installations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/items'] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    }
  });

  const categories = ["all", "ecommerce", "admin", "auth", "payment", "blog", "ai"];

  const getItemName = (item: MarketplaceItem) => {
    return language === 'ar' && item.nameAr ? item.nameAr : item.name;
  };

  const getItemDescription = (item: MarketplaceItem) => {
    return language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description;
  };

  const getItemIcon = (item: MarketplaceItem) => {
    const iconKey = (item as any).icon || 'package';
    return iconMap[iconKey] || Package;
  };

  const formatPrice = (item: MarketplaceItem) => {
    if (!item.isPremium) return t.free;
    const price = item.price ? (item.price / 100) : 0;
    const pricingModel = (item as any).pricingModel;
    if (pricingModel === 'subscription') {
      return `$${price}${t.perMonth}`;
    } else if (pricingModel === 'usage') {
      return `${t.startingAt} $${price}`;
    }
    return `$${price}`;
  };

  const getPricingBadge = (item: MarketplaceItem) => {
    const pricingModel = (item as any).pricingModel;
    if (!item.isPremium) {
      return (
        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">
          {t.free}
        </Badge>
      );
    }
    if (pricingModel === 'subscription') {
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
          <Clock className="w-3 h-3 mr-1" />
          {t.subscription}
        </Badge>
      );
    }
    if (pricingModel === 'usage') {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
          <TrendingUp className="w-3 h-3 mr-1" />
          {t.usageBased}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
        <CreditCard className="w-3 h-3 mr-1" />
        {t.premium}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    if (type === 'service') return language === 'ar' ? 'خدمة AI' : 'AI Service';
    if (type === 'template') return t.templates;
    return t.extensions;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"} data-testid="page-marketplace">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-marketplace-title">
                {t.title}
              </h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={isRtl ? 'pr-10' : 'pl-10'}
              data-testid="input-marketplace-search"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" data-testid="tab-all">{t.all}</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">
                <LayoutTemplate className="w-4 h-4 mr-1.5" />
                {t.templates}
              </TabsTrigger>
              <TabsTrigger value="extensions" data-testid="tab-extensions">
                <Puzzle className="w-4 h-4 mr-1.5" />
                {t.extensions}
              </TabsTrigger>
              <TabsTrigger value="services" data-testid="tab-services">
                <Sparkles className="w-4 h-4 mr-1.5" />
                {t.services}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="gap-1.5"
              data-testid={`button-category-${cat}`}
            >
              {cat === 'ai' && <Bot className="w-3.5 h-3.5" />}
              {categoryLabels[cat]?.[language as 'en' | 'ar'] || cat}
            </Button>
          ))}
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-xl bg-muted mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t.noResults}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isInstalled = installedItemIds.has(item.id);
              const isInstalling = installMutation.isPending && installMutation.variables === item.id;
              const isUninstalling = uninstallMutation.isPending && uninstallMutation.variables === item.id;
              const ItemIcon = getItemIcon(item);
              const isAIService = item.type === 'service' || item.category === 'ai';
              
              return (
                <Card 
                  key={item.id} 
                  className={`border-border/60 flex flex-col ${isAIService ? 'ring-1 ring-primary/20' : ''}`}
                  data-testid={`card-item-${item.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                          isAIService 
                            ? 'bg-gradient-to-br from-primary/20 to-purple-500/20' 
                            : 'bg-muted'
                        }`}>
                          <ItemIcon className={`w-5 h-5 ${isAIService ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base font-medium leading-tight">
                            {getItemName(item)}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t.by} {item.author}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getPricingBadge(item)}
                        {isInstalled && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-[10px]">
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                            {item.type === 'service' ? t.active : t.installed}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {getItemDescription(item)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        {item.downloads?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        {item.rating?.toFixed(1) || '0.0'}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>

                    {item.isPremium && (
                      <div className="text-lg font-semibold text-foreground">
                        {formatPrice(item)}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="pt-0 gap-2">
                    {isInstalled ? (
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => uninstallMutation.mutate(item.id)}
                        disabled={isUninstalling}
                        data-testid={`button-uninstall-${item.id}`}
                      >
                        {isUninstalling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.uninstalling}
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t.uninstall}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => installMutation.mutate(item.id)}
                        disabled={isInstalling}
                        data-testid={`button-install-${item.id}`}
                      >
                        {isInstalling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.installing}
                          </>
                        ) : (
                          <>
                            {item.type === 'service' ? (
                              <Zap className="w-4 h-4 mr-2" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            {item.type === 'service' ? t.activate : t.install}
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
