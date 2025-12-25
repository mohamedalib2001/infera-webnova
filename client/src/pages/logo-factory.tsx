import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Download, 
  Eye, 
  RefreshCw, 
  Shield, 
  Hexagon, 
  Circle, 
  Layers,
  Cpu,
  Network,
  Sparkles,
  FileType,
  Palette,
  CheckCircle2,
  XCircle,
  Crown,
  Link2,
  Zap,
  Target,
  Lock,
  Brain,
  Wand2,
  Grid3X3,
  LayoutGrid,
  Star,
  Copy,
  Save,
  Settings2,
  Lightbulb,
  TrendingUp,
  Box,
  Gem
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllPlatformsForBinding, 
  bindAllVariantsToPlatform,
  getPlatformLogoState,
  checkGlobalCompliance,
  type PlatformLogoState
} from "@/lib/logo-binding-engine";
import { useLogoSyncDialog, LogoSyncResultDialog } from "@/components/logo-sync-result-dialog";
import {
  composeAdvancedSVG,
  createIconComposition,
  ICON_CATEGORIES,
  ICON_STYLES,
  SOVEREIGN_COLORS,
  type IconCategory,
  type IconStyle,
  type IconComposition
} from "@/lib/ai-icon-composer";

type ColorKey = keyof typeof SOVEREIGN_COLORS.primary;

interface AIRecommendation {
  style: IconStyle;
  color: ColorKey;
  score: number;
  reason: string;
  reasonAr: string;
}

function generateAIRecommendations(category: IconCategory): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  
  const categoryStyleMap: Record<IconCategory, { styles: IconStyle[]; colors: ColorKey[] }> = {
    sovereignty: { styles: ['quantum', 'crystalline', 'geometric'], colors: ['quantumPurple', 'royalMagenta', 'sovereignBlue'] },
    intelligence: { styles: ['neural', 'quantum', 'layered'], colors: ['neuralCyan', 'quantumPurple', 'sovereignBlue'] },
    security: { styles: ['crystalline', 'geometric', 'minimal'], colors: ['deepEmerald', 'sovereignBlue', 'crimsonRed'] },
    commerce: { styles: ['geometric', 'layered', 'minimal'], colors: ['signalGold', 'deepEmerald', 'sovereignBlue'] },
    connectivity: { styles: ['neural', 'organic', 'layered'], colors: ['neuralCyan', 'sovereignBlue', 'quantumPurple'] },
    analytics: { styles: ['layered', 'geometric', 'neural'], colors: ['sovereignBlue', 'neuralCyan', 'quantumPurple'] },
    infrastructure: { styles: ['geometric', 'crystalline', 'minimal'], colors: ['sovereignBlue', 'deepEmerald', 'signalGold'] },
    governance: { styles: ['crystalline', 'geometric', 'quantum'], colors: ['royalMagenta', 'quantumPurple', 'sovereignBlue'] }
  };
  
  const mapping = categoryStyleMap[category];
  const reasons: Record<string, { en: string; ar: string }> = {
    'quantum-quantumPurple': { en: 'Maximum sovereign authority', ar: 'أقصى سلطة سيادية' },
    'neural-neuralCyan': { en: 'Optimal AI representation', ar: 'تمثيل ذكاء أمثل' },
    'crystalline-deepEmerald': { en: 'Strong security symbolism', ar: 'رمزية أمان قوية' },
    'geometric-signalGold': { en: 'Professional commerce look', ar: 'مظهر تجاري احترافي' },
    'layered-sovereignBlue': { en: 'Depth and trust', ar: 'عمق وثقة' }
  };
  
  mapping.styles.forEach((style, i) => {
    const color = mapping.colors[i];
    const key = `${style}-${color}`;
    const reason = reasons[key] || { en: 'AI recommended', ar: 'موصى به' };
    recommendations.push({
      style,
      color,
      score: 95 - i * 8 + Math.floor(Math.random() * 5),
      reason: reason.en,
      reasonAr: reason.ar
    });
  });
  
  return recommendations.slice(0, 6);
}

function downloadSVG(svg: string, filename: string) {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LogoFactory() {
  const { toast } = useToast();
  const { dialogProps, showSyncResult, createSyncResult } = useLogoSyncDialog();
  
  const [selectedCategory, setSelectedCategory] = useState<IconCategory>('sovereignty');
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>('quantum');
  const [selectedColor, setSelectedColor] = useState<ColorKey>('quantumPurple');
  const [platformName, setPlatformName] = useState('infera-webnova');
  const [targetPlatformId, setTargetPlatformId] = useState<string>('infera-webnova');
  
  const [generatedIcons, setGeneratedIcons] = useState<IconComposition[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [platformLogoState, setPlatformLogoState] = useState<PlatformLogoState | null>(null);
  const [complianceStats, setComplianceStats] = useState<ReturnType<typeof checkGlobalCompliance> | null>(null);
  
  const availablePlatforms = useMemo(() => getAllPlatformsForBinding(), []);
  
  const aiRecommendations = useMemo(() => 
    generateAIRecommendations(selectedCategory), 
    [selectedCategory]
  );
  
  const currentSVG = useMemo(() => 
    composeAdvancedSVG(selectedCategory, selectedStyle, SOVEREIGN_COLORS.primary[selectedColor], 512),
    [selectedCategory, selectedStyle, selectedColor]
  );
  
  useEffect(() => {
    if (targetPlatformId) {
      setPlatformLogoState(getPlatformLogoState(targetPlatformId));
    }
    setComplianceStats(checkGlobalCompliance());
  }, [targetPlatformId]);
  
  const applyRecommendation = useCallback((rec: AIRecommendation) => {
    setSelectedStyle(rec.style);
    setSelectedColor(rec.color);
    toast({
      title: "AI Recommendation Applied | تم تطبيق التوصية",
      description: `${rec.reason} | ${rec.reasonAr}`
    });
  }, [toast]);
  
  const generateBatch = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const newIcons: IconComposition[] = [];
      Object.keys(ICON_STYLES).forEach(style => {
        const icon = createIconComposition(
          selectedCategory,
          style as IconStyle,
          SOVEREIGN_COLORS.primary[selectedColor],
          `${platformName}-${style}`
        );
        newIcons.push(icon);
      });
      setGeneratedIcons(prev => [...newIcons, ...prev].slice(0, 50));
      setIsGenerating(false);
      toast({
        title: "Batch Generated | تم توليد الدفعة",
        description: `${newIcons.length} icons created | تم إنشاء ${newIcons.length} أيقونة`
      });
    }, 800);
  }, [selectedCategory, selectedColor, platformName, toast]);
  
  const syncToPlatform = useCallback(() => {
    if (!targetPlatformId) return;
    
    setIsSyncing(true);
    setTimeout(() => {
      const result = bindAllVariantsToPlatform(
        targetPlatformId,
        currentSVG,
        selectedColor,
        platformName
      );
      
      setIsSyncing(false);
      
      if (result.success) {
        setPlatformLogoState(getPlatformLogoState(targetPlatformId));
        setComplianceStats(checkGlobalCompliance());
        
        const platform = availablePlatforms.find(p => p.id === targetPlatformId);
        const syncResult = createSyncResult(
          targetPlatformId,
          platform?.name || targetPlatformId,
          result.versions,
          currentSVG,
          platform?.nameAr
        );
        showSyncResult(syncResult);
      } else {
        toast({
          title: "Sync Failed | فشل المزامنة",
          description: result.message,
          variant: "destructive"
        });
      }
    }, 500);
  }, [targetPlatformId, currentSVG, selectedColor, platformName, availablePlatforms, createSyncResult, showSyncResult, toast]);
  
  const saveToGallery = useCallback(() => {
    const icon = createIconComposition(
      selectedCategory,
      selectedStyle,
      SOVEREIGN_COLORS.primary[selectedColor],
      platformName
    );
    setGeneratedIcons(prev => [icon, ...prev].slice(0, 50));
    toast({
      title: "Saved to Gallery | تم الحفظ",
      description: "Icon added to your collection | تمت إضافة الأيقونة"
    });
  }, [selectedCategory, selectedStyle, selectedColor, platformName, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  INFERA Logo Forge
                  <Badge variant="outline" className="text-[10px]">AI-Powered</Badge>
                </h1>
                <p className="text-xs text-muted-foreground">
                  مصنع الهوية البصرية السيادي | Sovereign Visual Identity Factory
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {complianceStats && (
                <Badge variant={complianceStats.compliant === complianceStats.totalPlatforms ? "default" : "secondary"}>
                  {complianceStats.compliant}/{complianceStats.totalPlatforms} Synced
                </Badge>
              )}
              
              <Select value={targetPlatformId} onValueChange={setTargetPlatformId}>
                <SelectTrigger className="w-[200px]" data-testid="select-target-platform">
                  <SelectValue placeholder="Target Platform" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <span className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {platform.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={syncToPlatform}
                disabled={!targetPlatformId || isSyncing}
                className="gap-2"
                data-testid="button-sync-to-platform"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Bind & Sync
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-4 border-r overflow-y-auto">
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-cyan-500" />
                      AI Recommendations | توصيات الذكاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <button
                        key={`${rec.style}-${rec.color}`}
                        onClick={() => applyRecommendation(rec)}
                        className={`w-full p-3 rounded-lg border text-left transition-all hover-elevate ${
                          selectedStyle === rec.style && selectedColor === rec.color
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50'
                        }`}
                        data-testid={`button-recommendation-${i}`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: SOVEREIGN_COLORS.primary[rec.color] + '20' }}
                          >
                            <div 
                              className="w-6 h-6 rounded"
                              style={{ backgroundColor: SOVEREIGN_COLORS.primary[rec.color] }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">{rec.style}</span>
                              <Badge variant="secondary" className="text-[9px]">{rec.score}%</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {rec.reason} | {rec.reasonAr}
                            </p>
                          </div>
                          {i === 0 && (
                            <Star className="h-4 w-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Configuration | الإعدادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Platform Name | اسم المنصة</Label>
                      <Input
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="infera-platform"
                        data-testid="input-platform-name"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Category | الفئة</Label>
                      <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as IconCategory)}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ICON_CATEGORIES).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <span>{cat.name}</span>
                                <span className="text-muted-foreground text-xs">| {cat.nameAr}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Style | النمط</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ICON_STYLES).map(([key, style]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedStyle(key as IconStyle)}
                            className={`p-2 rounded-md border text-left transition-all ${
                              selectedStyle === key
                                ? 'border-primary bg-primary/10'
                                : 'border-border/50 hover-elevate'
                            }`}
                            data-testid={`button-style-${key}`}
                          >
                            <div className="text-xs font-medium">{style.name}</div>
                            <div className="text-[10px] text-muted-foreground">{style.nameAr}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Color | اللون</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(SOVEREIGN_COLORS.primary).map(([key, hex]) => (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedColor(key as ColorKey)}
                                className={`aspect-square rounded-md border-2 transition-all ${
                                  selectedColor === key ? 'border-foreground scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: hex }}
                                data-testid={`button-color-${key}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-purple-500" />
                      Quick Actions | إجراءات سريعة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={generateBatch} 
                      disabled={isGenerating}
                      className="w-full gap-2"
                      variant="outline"
                      data-testid="button-generate-batch"
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <LayoutGrid className="h-4 w-4" />
                      )}
                      Generate All Styles | توليد كل الأنماط
                    </Button>
                    
                    <Button 
                      onClick={saveToGallery}
                      className="w-full gap-2"
                      variant="outline"
                      data-testid="button-save-gallery"
                    >
                      <Save className="h-4 w-4" />
                      Save to Gallery | حفظ في المعرض
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="col-span-5 bg-[#050510] flex flex-col">
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
                  <div 
                    className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/80 p-8 backdrop-blur"
                    dangerouslySetInnerHTML={{ __html: currentSVG }}
                    style={{ width: 320, height: 320 }}
                  />
                </div>
              </div>
              
              <div className="border-t border-white/10 p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-medium text-white/80">Size Variants | أحجام متعددة</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">
                      {ICON_CATEGORIES[selectedCategory].name}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/60">
                      {ICON_STYLES[selectedStyle].name}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-end justify-center gap-6">
                  {[128, 64, 48, 32, 24, 16].map(size => (
                    <div key={size} className="flex flex-col items-center gap-2">
                      <div 
                        className="rounded bg-[#0A0A0A] p-1 border border-white/10"
                        dangerouslySetInnerHTML={{ 
                          __html: composeAdvancedSVG(selectedCategory, selectedStyle, SOVEREIGN_COLORS.primary[selectedColor], size)
                        }}
                        style={{ width: size + 8, height: size + 8 }}
                      />
                      <span className="text-[10px] text-white/50">{size}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="col-span-3 border-l overflow-y-auto">
              <div className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export | تصدير
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {['SVG', 'PNG 1024', 'PNG 512', 'PNG 256', 'PNG 128', 'PNG 64'].map(format => (
                        <div key={format} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                          <FileType className="h-3 w-3 text-muted-foreground" />
                          <span>{format}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => downloadSVG(currentSVG, `${platformName}-logo.svg`)}
                      className="w-full gap-2"
                      data-testid="button-download-svg"
                    >
                      <Download className="h-4 w-4" />
                      Download All Formats
                    </Button>
                  </CardContent>
                </Card>
                
                {platformLogoState && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Sync Status | حالة المزامنة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Platform</span>
                        <span>{platformLogoState.platformName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={platformLogoState.complianceStatus === 'compliant' ? 'default' : 'secondary'}>
                          {platformLogoState.complianceStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span>{platformLogoState.lastSync > 0 ? new Date(platformLogoState.lastSync).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {generatedIcons.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Gallery | المعرض ({generatedIcons.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="grid grid-cols-3 gap-2">
                          {generatedIcons.map((icon) => (
                            <Tooltip key={icon.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => downloadSVG(icon.svg, `${icon.name}.svg`)}
                                  className="aspect-square rounded-lg bg-[#0A0A0A] p-2 border border-border/30 hover-elevate"
                                  data-testid={`button-gallery-icon-${icon.id}`}
                                >
                                  <div 
                                    dangerouslySetInnerHTML={{ 
                                      __html: icon.svg.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="100%"')
                                    }}
                                    className="w-full h-full"
                                  />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{icon.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Guidelines | الإرشادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="allowed">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="allowed" className="text-xs" data-testid="tab-allowed">
                          Allowed
                        </TabsTrigger>
                        <TabsTrigger value="forbidden" className="text-xs" data-testid="tab-forbidden">
                          Forbidden
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="allowed" className="mt-3 space-y-1">
                        {['Abstract symbols', 'Neural patterns', 'Geometric forms', 'Minimal cores'].map(item => (
                          <div key={item} className="flex items-center gap-2 text-[10px] text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="forbidden" className="mt-3 space-y-1">
                        {['Cartoon styles', 'Emojis', 'Human figures', 'Generic icons'].map(item => (
                          <div key={item} className="flex items-center gap-2 text-[10px] text-destructive">
                            <XCircle className="h-3 w-3" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LogoSyncResultDialog {...dialogProps} />
    </div>
  );
}
