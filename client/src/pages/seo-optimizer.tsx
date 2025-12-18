import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, Globe, FileText, Image, Link, CheckCircle2, 
  XCircle, AlertCircle, Sparkles, Loader2, RefreshCw,
  TrendingUp, BarChart3, Target
} from "lucide-react";
import { Redirect } from "wouter";

interface SEOAnalysis {
  score: number;
  title: { status: "good" | "warning" | "error"; message: string; suggestion?: string };
  description: { status: "good" | "warning" | "error"; message: string; suggestion?: string };
  headings: { status: "good" | "warning" | "error"; message: string; count: { h1: number; h2: number; h3: number } };
  images: { status: "good" | "warning" | "error"; message: string; withAlt: number; withoutAlt: number };
  links: { status: "good" | "warning" | "error"; message: string; internal: number; external: number };
  keywords: string[];
  suggestions: string[];
}

export default function SEOOptimizer() {
  const { language, isRtl } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  const analyzeMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/seo/analyze", { content });
      return res.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({ title: tr("تم تحليل SEO بنجاح", "SEO analysis completed") });
    },
    onError: () => {
      toast({ title: tr("فشل في تحليل SEO", "SEO analysis failed"), variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { content: string; type: string }) => {
      const res = await apiRequest("POST", "/api/seo/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: tr("تم إنشاء المحتوى", "Content generated") });
      return data;
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const handleAnalyze = () => {
    if (htmlContent.trim()) {
      analyzeMutation.mutate(htmlContent);
    }
  };

  const getStatusIcon = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-amber-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  // Mock analysis for demo
  const mockAnalysis: SEOAnalysis = {
    score: 72,
    title: { 
      status: "good", 
      message: tr("عنوان المنصة موجود وبطول مناسب", "Platform title exists with appropriate length"),
      suggestion: undefined
    },
    description: { 
      status: "warning", 
      message: tr("الوصف قصير جداً", "Description is too short"),
      suggestion: tr("يُنصح بإضافة وصف أطول (150-160 حرف)", "Consider adding a longer description (150-160 characters)")
    },
    headings: { 
      status: "good", 
      message: tr("هيكل العناوين جيد", "Heading structure is good"),
      count: { h1: 1, h2: 3, h3: 5 }
    },
    images: { 
      status: "error", 
      message: tr("بعض الصور بدون نص بديل", "Some images missing alt text"),
      withAlt: 8, withoutAlt: 3
    },
    links: { 
      status: "good", 
      message: tr("الروابط منظمة بشكل جيد", "Links are well organized"),
      internal: 12, external: 4
    },
    keywords: ["sovereign platform", "AI", "منصات سيادية", "ذكاء اصطناعي"],
    suggestions: [
      tr("أضف وصفاً meta أطول للمنصة", "Add a longer meta description for the platform"),
      tr("أضف نصاً بديلاً للصور الناقصة", "Add alt text to missing images"),
      tr("حسّن سرعة تحميل المنصة", "Improve platform loading speed"),
      tr("أضف structured data للمحتوى", "Add structured data markup"),
    ],
  };

  const displayAnalysis = analysis || (analyzeMutation.isSuccess ? mockAnalysis : null);

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <Search className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="seo-title">
            {tr("محسّن SEO بالذكاء الاصطناعي", "AI SEO Optimizer")}
          </h1>
          <p className="text-muted-foreground">
            {tr("حلل وحسّن منصتك السيادية لمحركات البحث", "Analyze and optimize your sovereign platform for search engines")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tr("تحليل المحتوى", "Content Analysis")}</CardTitle>
              <CardDescription>
                {tr("أدخل كود HTML لتحليل SEO", "Enter HTML code for SEO analysis")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{tr("كود HTML", "HTML Code")}</Label>
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder={tr("الصق كود HTML هنا...", "Paste HTML code here...")}
                  rows={10}
                  className="font-mono text-sm"
                  data-testid="input-html-content"
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!htmlContent.trim() || analyzeMutation.isPending}
                className="w-full"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Search className="h-4 w-4 me-2" />
                )}
                {tr("تحليل SEO", "Analyze SEO")}
              </Button>
            </CardContent>
          </Card>

          {displayAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span>{tr("نتائج التحليل", "Analysis Results")}</span>
                  <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getScoreColor(displayAnalysis.score)} text-white font-bold`}>
                    {displayAnalysis.score}/100
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(displayAnalysis.title.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{tr("عنوان المنصة", "Platform Title")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{displayAnalysis.title.message}</p>
                      {displayAnalysis.title.suggestion && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{displayAnalysis.title.suggestion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(displayAnalysis.description.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">{tr("الوصف", "Meta Description")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{displayAnalysis.description.message}</p>
                      {displayAnalysis.description.suggestion && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{displayAnalysis.description.suggestion}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(displayAnalysis.headings.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">{tr("العناوين", "Headings")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{displayAnalysis.headings.message}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">H1: {displayAnalysis.headings.count.h1}</Badge>
                        <Badge variant="outline">H2: {displayAnalysis.headings.count.h2}</Badge>
                        <Badge variant="outline">H3: {displayAnalysis.headings.count.h3}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(displayAnalysis.images.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span className="font-medium">{tr("الصور", "Images")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{displayAnalysis.images.message}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="default">{tr("مع Alt", "With Alt")}: {displayAnalysis.images.withAlt}</Badge>
                        <Badge variant="destructive">{tr("بدون Alt", "Without Alt")}: {displayAnalysis.images.withoutAlt}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(displayAnalysis.links.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <span className="font-medium">{tr("الروابط", "Links")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{displayAnalysis.links.message}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{tr("داخلية", "Internal")}: {displayAnalysis.links.internal}</Badge>
                        <Badge variant="outline">{tr("خارجية", "External")}: {displayAnalysis.links.external}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {displayAnalysis && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {tr("الكلمات المفتاحية", "Keywords")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {displayAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {tr("اقتراحات التحسين", "Improvement Suggestions")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {displayAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {tr("توليد محتوى AI", "AI Content Generation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => generateMutation.mutate({ content: htmlContent, type: "title" })}
                    disabled={generateMutation.isPending}
                  >
                    <FileText className="h-4 w-4 me-2" />
                    {tr("توليد عنوان محسّن", "Generate optimized title")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => generateMutation.mutate({ content: htmlContent, type: "description" })}
                    disabled={generateMutation.isPending}
                  >
                    <Globe className="h-4 w-4 me-2" />
                    {tr("توليد وصف meta", "Generate meta description")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => generateMutation.mutate({ content: htmlContent, type: "keywords" })}
                    disabled={generateMutation.isPending}
                  >
                    <Target className="h-4 w-4 me-2" />
                    {tr("توليد كلمات مفتاحية", "Generate keywords")}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
