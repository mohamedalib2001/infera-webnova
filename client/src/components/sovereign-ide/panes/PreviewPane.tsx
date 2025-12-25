import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  ExternalLink,
  Eye,
  Code2,
} from "lucide-react";
import type { Viewport } from "../utils/ide-types";

interface PreviewPaneProps {
  isRtl: boolean;
  previewContent: string;
  viewport: Viewport;
  setViewport: (v: Viewport) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function PreviewPane({
  isRtl,
  previewContent,
  viewport,
  setViewport,
  isFullscreen,
  onToggleFullscreen,
}: PreviewPaneProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewportWidths: Record<Viewport, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const viewportLabels = {
    desktop: { en: "Desktop", ar: "سطح المكتب", width: "1920px" },
    tablet: { en: "Tablet", ar: "الجهاز اللوحي", width: "768px" },
    mobile: { en: "Mobile", ar: "الهاتف", width: "375px" },
  };

  const text = {
    preview: isRtl ? "المعاينة" : "Preview",
    live: isRtl ? "مباشر" : "Live",
    refresh: isRtl ? "تحديث" : "Refresh",
    fullscreen: isRtl ? "ملء الشاشة" : "Fullscreen",
    openInNew: isRtl ? "فتح في نافذة جديدة" : "Open in new tab",
    viewSource: isRtl ? "عرض المصدر" : "View Source",
  };

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.close();
      }
    }
  }, [previewContent, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-medium">{text.preview}</span>
          <Badge variant="outline" className="text-[9px] h-4 text-green-400 border-green-500/30">
            {text.live}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center border rounded-md overflow-hidden mr-2">
            {(["desktop", "tablet", "mobile"] as Viewport[]).map((v) => (
              <Tooltip key={v}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewport(v)}
                    className={`p-1.5 transition-colors ${
                      viewport === v ? "bg-violet-500/20 text-violet-400" : "hover:bg-muted text-muted-foreground"
                    }`}
                    data-testid={`viewport-${v}`}
                  >
                    {v === "desktop" && <Monitor className="h-3.5 w-3.5" />}
                    {v === "tablet" && <Tablet className="h-3.5 w-3.5" />}
                    {v === "mobile" && <Smartphone className="h-3.5 w-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isRtl ? viewportLabels[v].ar : viewportLabels[v].en} ({viewportLabels[v].width})
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowCode(!showCode)} data-testid="button-toggle-source">
                <Code2 className={`h-3.5 w-3.5 ${showCode ? "text-violet-400" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.viewSource}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRefresh} data-testid="button-refresh-preview">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.refresh}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleOpenInNewTab} data-testid="button-open-new-tab">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.openInNew}</TooltipContent>
          </Tooltip>

          {onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onToggleFullscreen} data-testid="button-fullscreen-preview">
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{text.fullscreen}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/10 p-4 overflow-auto">
        <div
          className="bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300"
          style={{ width: viewportWidths[viewport], maxWidth: "100%", height: "100%" }}
        >
          <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-muted rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center truncate">
                localhost:5000
              </div>
            </div>
          </div>

          {showCode ? (
            <pre className="p-4 text-xs font-mono overflow-auto h-full bg-slate-950 text-slate-300">
              {previewContent}
            </pre>
          ) : (
            <iframe
              ref={iframeRef}
              key={refreshKey}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
              data-testid="preview-iframe"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1 text-[10px] text-muted-foreground border-t bg-muted/20">
        <span>{isRtl ? viewportLabels[viewport].ar : viewportLabels[viewport].en}</span>
        <span>{viewportLabels[viewport].width}</span>
      </div>
    </div>
  );
}
