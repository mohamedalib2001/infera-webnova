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
  ShoppingCart,
  CreditCard
} from "lucide-react";
import type { MarketplaceItem, MarketplaceInstallation } from "@shared/schema";

const translations = {
  ar: {
    title: "سوق الإضافات والقوالب",
    subtitle: "اكتشف قوالب وإضافات من المجتمع لتسريع مشاريعك",
    templates: "قوالب",
    extensions: "إضافات",
    popular: "الأكثر شعبية",
    search: "بحث...",
    install: "تثبيت",
    installed: "مثبّت",
    uninstall: "إلغاء التثبيت",
    downloads: "تحميل",
    rating: "تقييم",
    by: "بواسطة",
    free: "مجاني",
    premium: "مدفوع",
    categories: "التصنيفات",
    all: "الكل",
    installing: "جاري التثبيت...",
    uninstalling: "جاري الإلغاء...",
    noResults: "لم يتم العثور على نتائج",
    version: "الإصدار"
  },
  en: {
    title: "Extensions & Templates Marketplace",
    subtitle: "Discover community templates and extensions to accelerate your projects",
    templates: "Templates",
    extensions: "Extensions",
    popular: "Popular",
    search: "Search...",
    install: "Install",
    installed: "Installed",
    uninstall: "Uninstall",
    downloads: "downloads",
    rating: "rating",
    by: "by",
    free: "Free",
    premium: "Premium",
    categories: "Categories",
    all: "All",
    installing: "Installing...",
    uninstalling: "Uninstalling...",
    noResults: "No results found",
    version: "Version"
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

export default function Marketplace() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: items = [], isLoading: loadingItems } = useQuery<MarketplaceItem[]>({
    queryKey: ['/api/marketplace/items', activeTab, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("type", activeTab.replace("s", ""));
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
      const response = await apiRequest('POST', `/api/marketplace/install/${itemId}`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(language === 'ar' ? error.errorAr : error.error);
      }
      return response.json();
    },
    onSuccess: (data) => {
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
      const response = await apiRequest('DELETE', `/api/marketplace/uninstall/${itemId}`, {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(language === 'ar' ? error.errorAr : error.error);
      }
      return response.json();
    },
    onSuccess: (data) => {
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

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-marketplace-title">
          <Store className="h-8 w-8 text-pink-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
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
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">{t.all}</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <LayoutTemplate className={`h-4 w-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
              {t.templates}
            </TabsTrigger>
            <TabsTrigger value="extensions" data-testid="tab-extensions">
              <Puzzle className={`h-4 w-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
              {t.extensions}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            data-testid={`button-category-${cat}`}
          >
            {categoryLabels[cat]?.[language as 'en' | 'ar'] || cat}
          </Button>
        ))}
      </div>

      {loadingItems ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isInstalled = installedItemIds.has(item.id);
            const isInstalling = installMutation.isPending && installMutation.variables === item.id;
            const isUninstalling = uninstallMutation.isPending && uninstallMutation.variables === item.id;
            
            return (
              <Card key={item.id} className="hover-elevate" data-testid={`card-item-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        {item.type === 'template' ? (
                          <LayoutTemplate className="h-6 w-6 text-primary" />
                        ) : (
                          <Puzzle className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg truncate">{getItemName(item)}</CardTitle>
                        <p className="text-sm text-muted-foreground">{t.by} {item.author}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {item.isPremium ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {item.price ? `$${(item.price / 100).toFixed(0)}` : t.premium}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {t.free}
                        </Badge>
                      )}
                      {isInstalled && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <Check className="h-3 w-3 mr-1" />
                          {t.installed}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{getItemDescription(item)}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {item.downloads?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {item.rating?.toFixed(1) || '0.0'}
                    </span>
                    {item.version && (
                      <span className="text-xs">v{item.version}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  {isInstalled ? (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => uninstallMutation.mutate(item.id)}
                      disabled={isUninstalling}
                      data-testid={`button-uninstall-${item.id}`}
                    >
                      {isUninstalling ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.uninstalling}</>
                      ) : (
                        <><Trash2 className="h-4 w-4 mr-2" />{t.uninstall}</>
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
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.installing}</>
                      ) : (
                        <><Download className="h-4 w-4 mr-2" />{t.install}</>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!loadingItems && items.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.noResults}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
