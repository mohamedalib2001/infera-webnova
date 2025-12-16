import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Tablet, Smartphone, RefreshCw, Maximize2, Copy, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodePreviewProps {
  html: string;
  css: string;
  js: string;
  onRefresh?: () => void;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; icon: React.ReactNode }> = {
  desktop: { width: "100%", icon: <Monitor className="h-4 w-4" /> },
  tablet: { width: "768px", icon: <Tablet className="h-4 w-4" /> },
  mobile: { width: "375px", icon: <Smartphone className="h-4 w-4" /> },
};

export function CodePreview({ html, css, js, onRefresh }: CodePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "html" | "css" | "js">("preview");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

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
              {html || css || js ? (
                <iframe
                  srcDoc={generatePreviewContent()}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts"
                  data-testid="iframe-preview"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Your website preview will appear here</p>
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
