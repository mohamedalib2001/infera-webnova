import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, RefreshCw, Smartphone, Tablet, Monitor,
  Lightbulb, AlertTriangle, Shield, Zap, 
  Accessibility, Code, Check, Loader2, Maximize2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PreviewState {
  id: string;
  html: string;
  css: string;
  javascript: string;
  data: any;
  timestamp: number;
}

interface Suggestion {
  type: string;
  priority: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  code?: string;
  autoFix?: boolean;
}

interface Metrics {
  complexity: number;
  accessibility: number;
  performance: number;
  security: number;
}

interface InstantPreviewPanelProps {
  architecture?: any;
  onSuggestionApply?: (suggestion: Suggestion) => void;
}

export function InstantPreviewPanel({ architecture, onSuggestionApply }: InstantPreviewPanelProps) {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const generatePreview = useMutation({
    mutationFn: async (arch: any) => {
      const res = await apiRequest("POST", "/api/preview/generate", { architecture: arch });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPreview(data.data);
        toast({ title: "تم توليد المعاينة", description: "يمكنك الآن رؤية النتيجة" });
      }
    }
  });

  const analyzeCode = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/preview/analyze", { code, type: "full" });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSuggestions(data.data.suggestions || []);
        setMetrics(data.data.metrics || null);
      }
    }
  });

  useEffect(() => {
    if (architecture) {
      generatePreview.mutate(architecture);
    }
  }, [architecture]);

  useEffect(() => {
    if (preview?.html && iframeRef.current) {
      const fullHtml = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; script-src 'unsafe-inline' https://cdn.tailwindcss.com;">
  <style>${preview.css || ""}</style>
</head>
<body>
  ${preview.html}
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      iframeRef.current.src = blobUrl;
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [preview]);

  const handleAnalyze = () => {
    if (preview?.html) {
      analyzeCode.mutate(preview.html);
    }
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance": return <Zap className="w-4 h-4" />;
      case "security": return <Shield className="w-4 h-4" />;
      case "accessibility": return <Accessibility className="w-4 h-4" />;
      case "ux": return <Eye className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`} dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-semibold" data-testid="text-preview-title">المعاينة الفورية</h3>
          {preview && (
            <Badge variant="secondary" className="text-xs">
              {new Date(preview.timestamp).toLocaleTimeString("ar")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              size="icon"
              variant={viewport === "mobile" ? "default" : "ghost"}
              onClick={() => setViewport("mobile")}
              data-testid="button-viewport-mobile"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={viewport === "tablet" ? "default" : "ghost"}
              onClick={() => setViewport("tablet")}
              data-testid="button-viewport-tablet"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={viewport === "desktop" ? "default" : "ghost"}
              onClick={() => setViewport("desktop")}
              data-testid="button-viewport-desktop"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => architecture && generatePreview.mutate(architecture)}
            disabled={generatePreview.isPending}
            data-testid="button-refresh-preview"
          >
            {generatePreview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <Card className="lg:col-span-2 flex flex-col">
          <CardContent className="flex-1 p-2">
            <div 
              className="h-full bg-muted rounded-md overflow-hidden flex items-center justify-center"
              style={{ minHeight: "400px" }}
            >
              {preview ? (
                <iframe
                  ref={iframeRef}
                  className="bg-white rounded border transition-all duration-300"
                  style={{ 
                    width: getViewportWidth(), 
                    height: "100%",
                    maxWidth: "100%"
                  }}
                  sandbox="allow-scripts"
                  title="Live Preview"
                  data-testid="iframe-preview"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  {generatePreview.isPending ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span>جاري توليد المعاينة...</span>
                    </div>
                  ) : (
                    <span>لا توجد معاينة بعد</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              مقترحات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="suggestions" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="suggestions" data-testid="tab-suggestions">
                  الاقتراحات
                  {suggestions.length > 0 && (
                    <Badge variant="secondary" className="mr-1 text-xs">{suggestions.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="metrics" data-testid="tab-metrics">المقاييس</TabsTrigger>
              </TabsList>

              <div className="mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={!preview || analyzeCode.isPending}
                  data-testid="button-analyze"
                >
                  {analyzeCode.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Zap className="w-4 h-4 ml-2" />}
                  تحليل وتحسين
                </Button>
              </div>

              <TabsContent value="suggestions" className="flex-1 mt-2">
                <ScrollArea className="h-[280px]">
                  {suggestions.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {suggestions.map((s, i) => (
                        <div key={i} className="p-3 border rounded-md bg-card">
                          <div className="flex items-start gap-2 mb-2">
                            {getTypeIcon(s.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{s.titleAr || s.title}</span>
                                <Badge variant={getPriorityColor(s.priority) as any} className="text-xs">
                                  {s.priority === "high" ? "عالي" : s.priority === "medium" ? "متوسط" : "منخفض"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{s.descriptionAr || s.description}</p>
                            </div>
                          </div>
                          {s.autoFix && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full mt-2"
                              onClick={() => onSuggestionApply?.(s)}
                              data-testid={`button-apply-suggestion-${i}`}
                            >
                              <Check className="w-3 h-3 ml-1" />
                              تطبيق تلقائي
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      اضغط على "تحليل وتحسين" للحصول على اقتراحات
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="metrics" className="flex-1 mt-2">
                <ScrollArea className="h-[280px]">
                  {metrics ? (
                    <div className="flex flex-col gap-4">
                      <MetricBar label="الأداء" labelEn="Performance" value={metrics.performance} icon={<Zap className="w-4 h-4" />} />
                      <MetricBar label="الأمان" labelEn="Security" value={metrics.security} icon={<Shield className="w-4 h-4" />} />
                      <MetricBar label="سهولة الوصول" labelEn="Accessibility" value={metrics.accessibility} icon={<Accessibility className="w-4 h-4" />} />
                      <MetricBar label="تعقيد الكود" labelEn="Complexity" value={100 - metrics.complexity} icon={<Code className="w-4 h-4" />} inverted />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      قم بتحليل الكود لعرض المقاييس
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricBar({ label, labelEn, value, icon, inverted }: { 
  label: string; 
  labelEn: string; 
  value: number; 
  icon: React.ReactNode;
  inverted?: boolean;
}) {
  const getColor = (v: number) => {
    if (inverted) v = 100 - v;
    if (v >= 80) return "bg-green-500";
    if (v >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
