import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Layout, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { DocLinkButton } from "@/components/doc-link-button";

interface Template {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  category: string;
  isPremium: boolean;
  accentColor?: string;
}

export default function Templates() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const t = {
    ar: {
      title: "القوالب",
      subtitle: "ابدأ مشروعك من قالب جاهز",
      search: "بحث في القوالب...",
      use: "استخدام",
      premium: "مميز",
      free: "مجاني",
      noTemplates: "لا توجد قوالب",
    },
    en: {
      title: "Templates",
      subtitle: "Start your project from a ready template",
      search: "Search templates...",
      use: "Use",
      premium: "Premium",
      free: "Free",
      noTemplates: "No templates available",
    },
  };

  const txt = t[language];

  const filteredTemplates = templates?.filter((tpl) => {
    const name = isRtl && tpl.nameAr ? tpl.nameAr : tpl.name;
    const desc = isRtl && tpl.descriptionAr ? tpl.descriptionAr : tpl.description;
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || desc?.toLowerCase().includes(query);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-templates-title">
            {txt.title}
          </h1>
          <DocLinkButton pageId="templates" />
        </div>
        <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
        <Input
          placeholder={txt.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={isRtl ? "pr-10" : "pl-10"}
          data-testid="input-search-templates"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: template.accentColor || "#6366f1" }}
                    >
                      <Layout className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg">
                      {isRtl && template.nameAr ? template.nameAr : template.name}
                    </CardTitle>
                  </div>
                  <Badge variant={template.isPremium ? "default" : "secondary"}>
                    {template.isPremium ? (
                      <><Sparkles className="h-3 w-3 mr-1" />{txt.premium}</>
                    ) : txt.free}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {isRtl && template.descriptionAr ? template.descriptionAr : template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="mb-3">{template.category}</Badge>
                <Link href={`/user-builder?template=${template.id}`}>
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-use-${template.id}`}>
                    {txt.use}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">{txt.noTemplates}</h3>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
