import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Search,
  Download,
  Star,
  Package,
  LayoutTemplate,
  Puzzle,
  Users,
  TrendingUp,
  Filter,
  Heart
} from "lucide-react";

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
    downloads: "تحميل",
    rating: "تقييم",
    by: "بواسطة",
    free: "مجاني",
    premium: "مدفوع",
    categories: "التصنيفات",
    all: "الكل"
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
    downloads: "downloads",
    rating: "rating",
    by: "by",
    free: "Free",
    premium: "Premium",
    categories: "Categories",
    all: "All"
  }
};

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  category: string;
  type: "template" | "extension";
  isPremium: boolean;
  installed: boolean;
  icon: string;
}

const mockItems: MarketplaceItem[] = [
  { id: "1", name: "E-commerce Starter", description: "Complete e-commerce template with cart and checkout", author: "WebDev Pro", downloads: 12500, rating: 4.8, category: "ecommerce", type: "template", isPremium: false, installed: false, icon: "store" },
  { id: "2", name: "Dashboard Pro", description: "Admin dashboard with charts and analytics", author: "UI Masters", downloads: 8900, rating: 4.9, category: "admin", type: "template", isPremium: true, installed: false, icon: "chart" },
  { id: "3", name: "Auth Kit", description: "Complete authentication with OAuth providers", author: "Security First", downloads: 15600, rating: 4.7, category: "auth", type: "extension", isPremium: false, installed: true, icon: "shield" },
  { id: "4", name: "Payment Gateway", description: "Stripe & PayPal integration ready", author: "FinTech Dev", downloads: 9200, rating: 4.6, category: "payment", type: "extension", isPremium: true, installed: false, icon: "credit" },
  { id: "5", name: "Blog Platform", description: "Full-featured blog with CMS", author: "Content Creators", downloads: 7800, rating: 4.5, category: "blog", type: "template", isPremium: false, installed: false, icon: "file" },
  { id: "6", name: "AI Chat Widget", description: "Embeddable AI chatbot for support", author: "AI Solutions", downloads: 6400, rating: 4.4, category: "ai", type: "extension", isPremium: true, installed: false, icon: "bot" },
];

export default function Marketplace() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || item.type === activeTab.replace("s", "");
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesTab && matchesCategory;
  });

  const categories = ["all", "ecommerce", "admin", "auth", "payment", "blog", "ai"];

  const handleInstall = (item: MarketplaceItem) => {
    toast({ title: language === "ar" ? `تم تثبيت ${item.name}` : `${item.name} installed` });
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-marketplace-search"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">{t.all}</TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <LayoutTemplate className="h-4 w-4 mr-1" />
              {t.templates}
            </TabsTrigger>
            <TabsTrigger value="extensions" data-testid="tab-extensions">
              <Puzzle className="h-4 w-4 mr-1" />
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
            {cat === "all" ? t.all : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover-elevate" data-testid={`card-item-${item.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.by} {item.author}</p>
                  </div>
                </div>
                {item.isPremium ? (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    {t.premium}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{t.free}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {item.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {item.rating}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={item.installed ? "outline" : "default"}
                onClick={() => handleInstall(item)}
                disabled={item.installed}
                data-testid={`button-install-${item.id}`}
              >
                {item.installed ? (
                  <><Heart className="h-4 w-4 mr-2" />{t.installed}</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />{t.install}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "لم يتم العثور على نتائج" : "No results found"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
