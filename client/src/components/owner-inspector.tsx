import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { 
  Eye, EyeOff, Copy, Check, Code, FileCode, Calendar, Target, 
  Layers, Route, AlertTriangle, CheckCircle2, Info, Crosshair
} from "lucide-react";

// Element metadata interface
interface ElementMetadata {
  testId: string;
  tagName: string;
  className: string;
  textContent: string;
  boundingRect: DOMRect;
  path: string[];
  attributes: Record<string, string>;
  componentStack?: string;
  hasErrors?: boolean;
  errorMessages?: string[];
}

// Inspector context
interface InspectorContextType {
  isEnabled: boolean;
  toggleInspector: () => void;
  hoveredElement: ElementMetadata | null;
  selectedElement: ElementMetadata | null;
  setSelectedElement: (el: ElementMetadata | null) => void;
  isTooltipHovered: boolean;
  setIsTooltipHovered: (val: boolean) => void;
}

const InspectorContext = createContext<InspectorContextType | null>(null);

export function useInspector() {
  const context = useContext(InspectorContext);
  if (!context) {
    throw new Error("useInspector must be used within InspectorProvider");
  }
  return context;
}

// Helper to get element path
function getElementPath(element: HTMLElement): string[] {
  const path: string[] = [];
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    let identifier = current.tagName.toLowerCase();
    
    if (current.id) {
      identifier += `#${current.id}`;
    } else if (current.getAttribute("data-testid")) {
      identifier += `[data-testid="${current.getAttribute("data-testid")}"]`;
    } else if (current.className && typeof current.className === 'string') {
      const firstClass = current.className.split(" ")[0];
      if (firstClass) identifier += `.${firstClass}`;
    }
    
    path.unshift(identifier);
    current = current.parentElement;
  }
  
  return path;
}

// Helper to get all attributes
function getElementAttributes(element: HTMLElement): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const attr of element.attributes) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

// Helper to detect if element has error state
function detectElementErrors(element: HTMLElement): { hasErrors: boolean; messages: string[] } {
  const messages: string[] = [];
  
  // Check for aria-invalid
  if (element.getAttribute("aria-invalid") === "true") {
    messages.push("Element has aria-invalid=true");
  }
  
  // Check for error classes
  if (element.className.includes("error") || element.className.includes("destructive")) {
    messages.push("Element has error/destructive styling");
  }
  
  // Check for disabled state
  if (element.hasAttribute("disabled")) {
    messages.push("Element is disabled");
  }
  
  return { hasErrors: messages.length > 0, messages };
}

// Provider component
export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<ElementMetadata | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementMetadata | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Only allow for owner
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";
  
  const toggleInspector = useCallback(() => {
    if (!isOwner) return;
    setIsEnabled(prev => !prev);
  }, [isOwner]);
  
  // Global event handlers
  useEffect(() => {
    if (!isEnabled || !isOwner) return;
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === document.body) return;
      
      // Cancel any pending hide
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      // Find nearest element with data-testid
      let current: HTMLElement | null = target;
      while (current && !current.getAttribute("data-testid") && current !== document.body) {
        current = current.parentElement;
      }
      
      if (current && current.getAttribute("data-testid")) {
        const testId = current.getAttribute("data-testid") || "";
        
        // Skip inspector's own controls to prevent interference
        if (testId.startsWith("button-inspector") || testId === "button-copy-testid") {
          setHoveredElement(null);
          return;
        }
        const { hasErrors, messages } = detectElementErrors(current);
        
        setHoveredElement({
          testId: current.getAttribute("data-testid") || "",
          tagName: current.tagName.toLowerCase(),
          className: current.className,
          textContent: current.textContent?.slice(0, 100) || "",
          boundingRect: current.getBoundingClientRect(),
          path: getElementPath(current),
          attributes: getElementAttributes(current),
          hasErrors,
          errorMessages: messages,
        });
      }
    };
    
    const handleMouseOut = () => {
      // Delay hiding to allow moving to tooltip
      hideTimeoutRef.current = setTimeout(() => {
        if (!isTooltipHovered) {
          setHoveredElement(null);
        }
      }, 300);
    };
    
    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Find nearest element with data-testid
      let current: HTMLElement | null = target;
      while (current && !current.getAttribute("data-testid") && current !== document.body) {
        current = current.parentElement;
      }
      
      if (current && current.getAttribute("data-testid")) {
        e.preventDefault();
        e.stopPropagation();
        
        const { hasErrors, messages } = detectElementErrors(current);
        
        setSelectedElement({
          testId: current.getAttribute("data-testid") || "",
          tagName: current.tagName.toLowerCase(),
          className: current.className,
          textContent: current.textContent?.slice(0, 200) || "",
          boundingRect: current.getBoundingClientRect(),
          path: getElementPath(current),
          attributes: getElementAttributes(current),
          hasErrors,
          errorMessages: messages,
        });
      }
    };
    
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    document.addEventListener("dblclick", handleDoubleClick, true);
    
    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
      document.removeEventListener("dblclick", handleDoubleClick, true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isEnabled, isOwner, isTooltipHovered]);
  
  // Keyboard shortcut (Ctrl+Shift+I)
  useEffect(() => {
    if (!isOwner) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        toggleInspector();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOwner, toggleInspector]);
  
  if (!isOwner) {
    return <>{children}</>;
  }
  
  return (
    <InspectorContext.Provider value={{ 
      isEnabled, 
      toggleInspector, 
      hoveredElement, 
      selectedElement,
      setSelectedElement,
      isTooltipHovered,
      setIsTooltipHovered
    }}>
      {children}
      {isEnabled && <InspectorOverlay />}
      <ElementDetailsDialog />
    </InspectorContext.Provider>
  );
}

// Overlay component showing hover tooltip
function InspectorOverlay() {
  const { hoveredElement, setIsTooltipHovered } = useInspector();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyTestId = async () => {
    if (!hoveredElement) return;
    await navigator.clipboard.writeText(hoveredElement.testId);
    setCopied(true);
    toast({ title: "Copied!", description: hoveredElement.testId });
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!hoveredElement) return null;
  
  const { boundingRect, testId, tagName, hasErrors } = hoveredElement;
  
  return (
    <>
      {/* Highlight box */}
      <div
        className="fixed pointer-events-none border-2 border-primary bg-primary/10 z-[9999] transition-all duration-100"
        style={{
          top: boundingRect.top + window.scrollY,
          left: boundingRect.left + window.scrollX,
          width: boundingRect.width,
          height: boundingRect.height,
        }}
      />
      
      {/* Tooltip - fixed position at bottom-right corner to avoid interference */}
      <div
        className="fixed z-[10000] bg-popover border rounded-md shadow-lg p-2 max-w-md"
        style={{
          bottom: 16,
          right: 16,
        }}
        onMouseEnter={() => setIsTooltipHovered(true)}
        onMouseLeave={() => setIsTooltipHovered(false)}
      >
        <div className="flex items-center gap-2">
          <Badge variant={hasErrors ? "destructive" : "secondary"} className="font-mono text-xs">
            {testId}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tagName}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              copyTestId();
            }}
            data-testid="button-copy-testid"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Double-click for details | Ctrl+Shift+I to toggle
        </p>
      </div>
    </>
  );
}

// Details dialog component
function ElementDetailsDialog() {
  const { selectedElement, setSelectedElement } = useInspector();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const t = {
    title: language === "ar" ? "تفاصيل العنصر" : "Element Details",
    testId: language === "ar" ? "المعرّف التعريفي" : "Test ID",
    tagName: language === "ar" ? "نوع العنصر" : "Element Type",
    path: language === "ar" ? "المسار" : "Path",
    attributes: language === "ar" ? "السمات" : "Attributes",
    content: language === "ar" ? "المحتوى" : "Content",
    status: language === "ar" ? "الحالة" : "Status",
    healthy: language === "ar" ? "سليم" : "Healthy",
    hasIssues: language === "ar" ? "يوجد خلل" : "Has Issues",
    howToAccess: language === "ar" ? "كيفية الوصول" : "How to Access",
    copyAll: language === "ar" ? "نسخ الكل" : "Copy All",
    close: language === "ar" ? "إغلاق" : "Close",
    copied: language === "ar" ? "تم النسخ" : "Copied!",
    replitAccess: language === "ar" ? "الوصول عبر Replit" : "Replit Access",
    novaAccess: language === "ar" ? "الوصول عبر Nova" : "Nova Access",
  };
  
  const copyAllDetails = async () => {
    if (!selectedElement) return;
    
    const details = `
=== Element Details ===
Test ID: ${selectedElement.testId}
Tag: ${selectedElement.tagName}
Path: ${selectedElement.path.join(" > ")}
Status: ${selectedElement.hasErrors ? "Has Issues" : "Healthy"}
${selectedElement.errorMessages?.length ? `Issues: ${selectedElement.errorMessages.join(", ")}` : ""}

=== Attributes ===
${Object.entries(selectedElement.attributes).map(([k, v]) => `${k}: ${v}`).join("\n")}

=== Content Preview ===
${selectedElement.textContent}

=== Access Instructions ===
Replit: Search for data-testid="${selectedElement.testId}" in client/src/
Nova: "Find the element with testid ${selectedElement.testId}"
    `.trim();
    
    await navigator.clipboard.writeText(details);
    toast({ title: t.copied, description: selectedElement.testId });
  };
  
  if (!selectedElement) return null;
  
  return (
    <Dialog open={!!selectedElement} onOpenChange={(open) => !open && setSelectedElement(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {selectedElement.testId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Test ID */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.testId}</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {selectedElement.testId}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Element Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.tagName}</span>
                </div>
                <p className="mt-2 font-mono text-sm">{selectedElement.tagName}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {selectedElement.hasErrors ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium">{t.status}</span>
                </div>
                <Badge 
                  variant={selectedElement.hasErrors ? "destructive" : "default"}
                  className="mt-2"
                >
                  {selectedElement.hasErrors ? t.hasIssues : t.healthy}
                </Badge>
                {selectedElement.errorMessages?.map((msg, i) => (
                  <p key={i} className="text-xs text-destructive mt-1">{msg}</p>
                ))}
              </CardContent>
            </Card>
          </div>
          
          {/* Path */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.path}</span>
              </div>
              <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                {selectedElement.path.join(" > ")}
              </div>
            </CardContent>
          </Card>
          
          {/* How to Access */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.howToAccess}</span>
              </div>
              <div className="space-y-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium text-muted-foreground">{t.replitAccess}</p>
                  <code className="text-xs">grep -r 'data-testid="{selectedElement.testId}"' client/src/</code>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs font-medium text-muted-foreground">{t.novaAccess}</p>
                  <code className="text-xs">"Find the element with testid {selectedElement.testId}"</code>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Attributes */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.attributes}</span>
              </div>
              <div className="bg-muted p-2 rounded max-h-32 overflow-y-auto">
                {Object.entries(selectedElement.attributes).map(([key, value]) => (
                  <div key={key} className="text-xs font-mono">
                    <span className="text-primary">{key}</span>=
                    <span className="text-muted-foreground">"{value.slice(0, 100)}"</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Content Preview */}
          {selectedElement.textContent && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.content}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedElement.textContent}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setSelectedElement(null)}>
            {t.close}
          </Button>
          <Button onClick={copyAllDetails} className="gap-2">
            <Copy className="h-4 w-4" />
            {t.copyAll}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Toggle button for header
export function InspectorToggle() {
  const { user } = useAuth();
  const { language } = useLanguage();
  
  // Only show for owner
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";
  if (!isOwner) return null;
  
  const context = useContext(InspectorContext);
  if (!context) return null;
  
  const { isEnabled, toggleInspector } = context;
  
  return (
    <Button
      variant={isEnabled ? "default" : "ghost"}
      size="icon"
      onClick={toggleInspector}
      title={language === "ar" ? "فحص العناصر (Ctrl+Shift+I)" : "Inspect Elements (Ctrl+Shift+I)"}
      data-testid="button-inspector-toggle"
    >
      {isEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );
}
