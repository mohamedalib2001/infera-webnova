import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  Clock,
  Settings,
  Shield,
  Bot,
  Server,
  BarChart3,
  DollarSign,
  Users,
  FileCode,
  Layout,
  Zap,
  Crown,
  Command,
  ArrowRight,
  Keyboard,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NavigationResource {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  path: string;
  icon: string;
  category: string;
  requiredRole: string;
  keywords: string[];
  keywordsAr: string[];
  isEnabled: boolean;
  priority: number;
}

interface NavigationShortcut {
  id: string;
  name: string;
  keyCombination: string;
  action: string;
  targetPath: string;
}

interface CommandPaletteData {
  resources: NavigationResource[];
  shortcuts: NavigationShortcut[];
  favorites: NavigationResource[];
  recents: NavigationResource[];
  byCategory: Record<string, NavigationResource[]>;
  categories: string[];
  userPreferences: Record<string, unknown>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  shield: Shield,
  bot: Bot,
  server: Server,
  barChart3: BarChart3,
  dollarSign: DollarSign,
  users: Users,
  fileCode: FileCode,
  layout: Layout,
  zap: Zap,
  settings: Settings,
  search: Search,
};

const categoryLabels: Record<string, { en: string; ar: string; icon: React.ComponentType<{ className?: string }> }> = {
  sovereign: { en: "Sovereign Control", ar: "التحكم السيادي", icon: Crown },
  ai: { en: "AI Management", ar: "إدارة الذكاء الاصطناعي", icon: Bot },
  infrastructure: { en: "Infrastructure", ar: "البنية التحتية", icon: Server },
  analytics: { en: "Analytics", ar: "التحليلات", icon: BarChart3 },
  security: { en: "Security", ar: "الأمان", icon: Shield },
  finance: { en: "Finance", ar: "المالية", icon: DollarSign },
  development: { en: "Development", ar: "التطوير", icon: FileCode },
  admin: { en: "Administration", ar: "الإدارة", icon: Settings },
};

interface CommandPaletteProps {
  language?: "en" | "ar";
}

export function CommandPalette({ language = "en" }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<CommandPaletteData>({
    queryKey: [`/api/navigation/command-palette?language=${language}`],
    enabled: open,
    staleTime: 30000,
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<NavigationResource[]>({
    queryKey: [`/api/navigation/search?q=${encodeURIComponent(searchQuery)}&language=${language}`],
    enabled: open && searchQuery.length > 0,
    staleTime: 5000,
  });

  const trackVisit = useMutation({
    mutationFn: async ({ path, resourceId }: { path: string; resourceId?: string }) => {
      return apiRequest("POST", "/api/navigation/track-visit", { path, resourceId });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (resourceId: string) => {
      return apiRequest("POST", "/api/navigation/toggle-favorite", { resourceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation/command-palette"] });
    },
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (resource: NavigationResource) => {
      trackVisit.mutate({ path: resource.path, resourceId: resource.id });
      navigate(resource.path);
      setOpen(false);
      setSearchQuery("");
    },
    [navigate, trackVisit]
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent, resourceId: string) => {
      e.stopPropagation();
      toggleFavorite.mutate(resourceId);
    },
    [toggleFavorite]
  );

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Zap;
    return <Icon className="h-4 w-4" />;
  };

  const getTitle = (resource: NavigationResource) => {
    return language === "ar" ? resource.titleAr : resource.title;
  };

  const getDescription = (resource: NavigationResource) => {
    return language === "ar" ? resource.descriptionAr : resource.description;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categoryLabels[category];
    return cat ? (language === "ar" ? cat.ar : cat.en) : category;
  };

  const favoriteIds = data?.favorites?.map((f) => f.id) || [];

  const filteredResources = searchResults || [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-md border border-input bg-background hover-elevate"
        data-testid="button-command-palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">
          {language === "ar" ? "بحث سريع..." : "Quick search..."}
        </span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={language === "ar" ? "ابحث عن أي شيء..." : "Search anything..."}
          value={searchQuery}
          onValueChange={setSearchQuery}
          data-testid="input-command-search"
        />
        <CommandList className="max-h-[400px]">
          {(isLoading || isSearching) && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </div>
          )}

          {!isLoading && !isSearching && (
            <>
              <CommandEmpty>
                {language === "ar" ? "لا توجد نتائج" : "No results found."}
              </CommandEmpty>

              {searchQuery ? (
                <CommandGroup heading={language === "ar" ? "نتائج البحث" : "Search Results"}>
                  {filteredResources.map((resource) => (
                    <CommandItem
                      key={resource.id}
                      value={getTitle(resource)}
                      onSelect={() => handleSelect(resource)}
                      className="flex items-center justify-between gap-2"
                      data-testid={`item-search-result-${resource.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-muted">
                          {getIcon(resource.icon)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{getTitle(resource)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getDescription(resource)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(resource.category)}
                        </Badge>
                        <button
                          onClick={(e) => handleFavorite(e, resource.id)}
                          className="p-1 rounded hover-elevate"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              favoriteIds.includes(resource.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <>
                  {data?.recents && data.recents.length > 0 && (
                    <>
                      <CommandGroup heading={language === "ar" ? "الأخيرة" : "Recent"}>
                        {data.recents.map((resource) => (
                          <CommandItem
                            key={`recent-${resource.id}`}
                            value={`recent-${getTitle(resource)}`}
                            onSelect={() => handleSelect(resource)}
                            className="flex items-center gap-3"
                            data-testid={`item-recent-${resource.id}`}
                          >
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{getTitle(resource)}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {data?.favorites && data.favorites.length > 0 && (
                    <>
                      <CommandGroup heading={language === "ar" ? "المفضلة" : "Favorites"}>
                        {data.favorites.map((resource) => (
                          <CommandItem
                            key={`fav-${resource.id}`}
                            value={`fav-${getTitle(resource)}`}
                            onSelect={() => handleSelect(resource)}
                            className="flex items-center gap-3"
                            data-testid={`item-favorite-${resource.id}`}
                          >
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{getTitle(resource)}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator />
                    </>
                  )}

                  {data?.categories?.map((category) => (
                    <CommandGroup
                      key={category}
                      heading={getCategoryLabel(category)}
                    >
                      {data.byCategory?.[category]?.slice(0, 5).map((resource) => (
                        <CommandItem
                          key={resource.id}
                          value={getTitle(resource)}
                          onSelect={() => handleSelect(resource)}
                          className="flex items-center justify-between gap-2"
                          data-testid={`item-nav-${resource.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-muted">
                              {getIcon(resource.icon)}
                            </div>
                            <span>{getTitle(resource)}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}

              <CommandSeparator />
              <CommandGroup heading={language === "ar" ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    <span>{language === "ar" ? "فتح لوحة الأوامر" : "Open Command Palette"}</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
                    <Command className="inline h-3 w-3" /> + K
                  </kbd>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>{language === "ar" ? "التنقل بين النتائج" : "Navigate Results"}</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">↑↓</kbd>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>{language === "ar" ? "تحديد" : "Select"}</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">Enter</kbd>
                </div>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
