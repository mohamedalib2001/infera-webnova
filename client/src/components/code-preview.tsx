import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Tablet, Smartphone, RefreshCw, Maximize2, Copy, Check, Download, Sparkles, Code2, Palette, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface CodePreviewProps {
  html: string;
  css: string;
  js: string;
  onRefresh?: () => void;
  isGenerating?: boolean;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; icon: React.ReactNode }> = {
  desktop: { width: "100%", icon: <Monitor className="h-4 w-4" /> },
  tablet: { width: "768px", icon: <Tablet className="h-4 w-4" /> },
  mobile: { width: "375px", icon: <Smartphone className="h-4 w-4" /> },
};

const generationStages = [
  { id: "planning", icon: Sparkles, labelEn: "Planning your website...", labelAr: "جاري التخطيط لموقعك..." },
  { id: "designing", icon: Palette, labelEn: "Designing the layout...", labelAr: "جاري تصميم التخطيط..." },
  { id: "coding", icon: Code2, labelEn: "Writing the code...", labelAr: "جاري كتابة الكود..." },
  { id: "optimizing", icon: Zap, labelEn: "Optimizing for performance...", labelAr: "جاري تحسين الأداء..." },
  { id: "finishing", icon: CheckCircle2, labelEn: "Finishing touches...", labelAr: "اللمسات النهائية..." },
];

export function CodePreview({ html, css, js, onRefresh, isGenerating = false }: CodePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "html" | "css" | "js">("preview");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const { toast } = useToast();
  const { isRtl } = useLanguage();
  
  useEffect(() => {
    if (isGenerating) {
      setCurrentStage(0);
      const interval = setInterval(() => {
        setCurrentStage(prev => (prev + 1) % generationStages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);
  
  console.log("CodePreview render - html:", html?.length || 0, "css:", css?.length || 0, "js:", js?.length || 0);

  const generatePreviewContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const fullCode = generatePreviewContent();
    const blob = new Blob([fullCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded successfully!" });
  };

  const CodeBlock = ({ code, language }: { code: string; language: string }) => (
    <div className="relative h-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={() => copyToClipboard(code)}
        data-testid={`button-copy-${language}`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="h-full overflow-auto bg-muted/50 rounded-lg p-4 text-sm font-mono">
        <code>{code || `// No ${language.toUpperCase()} code yet`}</code>
      </pre>
    </div>
  );

  return (
    <div className={`flex flex-col h-full bg-card rounded-lg border ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b gap-2 flex-wrap">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
            <TabsTrigger value="html" data-testid="tab-html">HTML</TabsTrigger>
            <TabsTrigger value="css" data-testid="tab-css">CSS</TabsTrigger>
            <TabsTrigger value="js" data-testid="tab-js">JS</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-1">
          {activeTab === "preview" && (
            <>
              {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => (
                <Button
                  key={size}
                  variant={viewport === size ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewport(size)}
                  data-testid={`button-viewport-${size}`}
                >
                  {viewportSizes[size].icon}
                </Button>
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                data-testid="button-refresh-preview"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadCode}
            data-testid="button-download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {activeTab === "preview" ? (
          <div
            className="h-full flex items-start justify-center overflow-auto bg-white dark:bg-gray-900 rounded-lg"
            style={{ padding: viewport !== "desktop" ? "1rem" : 0 }}
          >
            <div
              className="h-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{ width: viewportSizes[viewport].width, maxWidth: "100%" }}
            >
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-8 p-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-spin" style={{ animationDuration: "3s" }}>
                        {(() => {
                          const StageIcon = generationStages[currentStage].icon;
                          return <StageIcon className="w-8 h-8 text-primary-foreground" />;
                        })()}
                      </div>
                    </div>
                    <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
                  </div>
                  
                  <div className="text-center space-y-3">
                    <p className="text-lg font-medium text-foreground animate-pulse">
                      {isRtl ? generationStages[currentStage].labelAr : generationStages[currentStage].labelEn}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {generationStages.map((stage, idx) => (
                        <div
                          key={stage.id}
                          className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            idx === currentStage 
                              ? "bg-primary w-6" 
                              : idx < currentStage 
                                ? "bg-primary/60" 
                                : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRtl ? "يرجى الانتظار بينما نقوم بإنشاء موقعك الاحترافي" : "Please wait while we create your professional website"}
                    </p>
                  </div>
                </div>
              ) : html || css || js ? (
                <iframe
                  srcDoc={generatePreviewContent()}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts"
                  data-testid="iframe-preview"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>{isRtl ? "ستظهر معاينة موقعك هنا" : "Your website preview will appear here"}</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "html" ? (
          <CodeBlock code={html} language="html" />
        ) : activeTab === "css" ? (
          <CodeBlock code={css} language="css" />
        ) : (
          <CodeBlock code={js} language="js" />
        )}
      </div>
    </div>
  );
}
