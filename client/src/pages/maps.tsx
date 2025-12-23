import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Navigation,
  Layers,
  Globe,
  Search,
  Plus,
  Settings,
  Zap,
  Building2,
  Route,
  Compass,
  Map,
  Target,
  Crosshair,
} from "lucide-react";

export default function MapsPage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const t = {
    title: language === "ar" ? "الخرائط" : "Maps",
    subtitle: language === "ar" ? "إدارة وعرض الخرائط التفاعلية" : "Manage and display interactive maps",
    search: language === "ar" ? "ابحث عن موقع..." : "Search for a location...",
    myMaps: language === "ar" ? "خرائطي" : "My Maps",
    explore: language === "ar" ? "استكشاف" : "Explore",
    settings: language === "ar" ? "الإعدادات" : "Settings",
    createMap: language === "ar" ? "إنشاء خريطة" : "Create Map",
    recentLocations: language === "ar" ? "المواقع الأخيرة" : "Recent Locations",
    mapProviders: language === "ar" ? "مزودي الخرائط" : "Map Providers",
    googleMaps: language === "ar" ? "خرائط جوجل" : "Google Maps",
    openStreetMap: language === "ar" ? "خريطة الشارع المفتوح" : "OpenStreetMap",
    mapbox: language === "ar" ? "ماب بوكس" : "Mapbox",
    features: language === "ar" ? "الميزات" : "Features",
    routing: language === "ar" ? "التوجيه" : "Routing",
    geocoding: language === "ar" ? "تحديد المواقع" : "Geocoding",
    markers: language === "ar" ? "العلامات" : "Markers",
    layers: language === "ar" ? "الطبقات" : "Layers",
    noMaps: language === "ar" ? "لا توجد خرائط بعد" : "No maps yet",
    noMapsDesc: language === "ar" ? "أنشئ خريطتك الأولى للبدء" : "Create your first map to get started",
  };

  const mapProviders = [
    { id: "google", name: t.googleMaps, icon: Globe, status: "active", color: "text-red-500" },
    { id: "osm", name: t.openStreetMap, icon: Map, status: "active", color: "text-green-500" },
    { id: "mapbox", name: t.mapbox, icon: Layers, status: "inactive", color: "text-blue-500" },
  ];

  const features = [
    { id: "routing", name: t.routing, icon: Route, enabled: true },
    { id: "geocoding", name: t.geocoding, icon: Target, enabled: true },
    { id: "markers", name: t.markers, icon: MapPin, enabled: true },
    { id: "layers", name: t.layers, icon: Layers, enabled: false },
  ];

  const recentLocations = [
    { name: language === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia", coords: "24.7136, 46.6753" },
    { name: language === "ar" ? "دبي، الإمارات" : "Dubai, UAE", coords: "25.2048, 55.2708" },
    { name: language === "ar" ? "القاهرة، مصر" : "Cairo, Egypt", coords: "30.0444, 31.2357" },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-maps-title">
              <MapPin className="w-6 h-6 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
          </div>
          <Button data-testid="button-create-map">
            <Plus className="w-4 h-4 me-2" />
            {t.createMap}
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            className="ps-10"
            data-testid="input-map-search"
          />
        </div>

        <Tabs defaultValue="maps" className="space-y-4">
          <TabsList>
            <TabsTrigger value="maps" data-testid="tab-my-maps">
              <Map className="w-4 h-4 me-1" />
              {t.myMaps}
            </TabsTrigger>
            <TabsTrigger value="explore" data-testid="tab-explore">
              <Compass className="w-4 h-4 me-1" />
              {t.explore}
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-map-settings">
              <Settings className="w-4 h-4 me-1" />
              {t.settings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-dashed border-2 hover-elevate cursor-pointer" data-testid="card-add-map">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">{t.createMap}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.noMapsDesc}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  {t.recentLocations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentLocations.map((loc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                      data-testid={`location-${i}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.coords}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" data-testid={`button-locate-${i}`}>
                        <Crosshair className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">
                      {language === "ar" ? "خريطة تفاعلية ستظهر هنا" : "Interactive map will appear here"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.mapProviders}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "إدارة مزودي خدمات الخرائط" : "Manage map service providers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mapProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      data-testid={`provider-${provider.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <provider.icon className={`w-5 h-5 ${provider.color}`} />
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      <Badge variant={provider.status === "active" ? "default" : "secondary"}>
                        {provider.status === "active" 
                          ? (language === "ar" ? "نشط" : "Active")
                          : (language === "ar" ? "غير نشط" : "Inactive")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.features}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-4 rounded-lg border text-center ${
                        feature.enabled ? "bg-primary/5 border-primary/20" : "opacity-50"
                      }`}
                      data-testid={`feature-${feature.id}`}
                    >
                      <feature.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">{feature.name}</p>
                      <Badge variant={feature.enabled ? "default" : "secondary"} className="mt-2 text-xs">
                        {feature.enabled 
                          ? (language === "ar" ? "مفعّل" : "Enabled")
                          : (language === "ar" ? "معطّل" : "Disabled")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
