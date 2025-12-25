/**
 * INFERA AI Shape Recommendation Component
 * Displays AI-recommended shapes as clickable cards with hover explanations
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, 
  Sparkles, 
  CheckCircle, 
  Lightbulb,
  Shield,
  Target,
  Zap,
  Lock,
  Crosshair,
  Info
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { 
  getShapeRecommendations, 
  type ShapeRecommendation,
  type ShapeCategory
} from "@/lib/ai-shape-recommendation-engine";

interface AIShapeRecommendationsProps {
  platformType: string;
  selectedPattern: string;
  accentColor: string;
  selectedShape: ShapeCategory | null;
  onSelectShape: (shape: ShapeRecommendation) => void;
  disabled?: boolean;
}

const emphasisIcons: Record<string, typeof Shield> = {
  control: Target,
  intelligence: Brain,
  stability: Shield,
  autonomy: Zap,
  security: Lock,
  precision: Crosshair
};

const emphasisLabels: Record<string, { en: string; ar: string }> = {
  control: { en: "Control", ar: "تحكم" },
  intelligence: { en: "Intelligence", ar: "ذكاء" },
  stability: { en: "Stability", ar: "استقرار" },
  autonomy: { en: "Autonomy", ar: "استقلالية" },
  security: { en: "Security", ar: "أمان" },
  precision: { en: "Precision", ar: "دقة" }
};

export function AIShapeRecommendations({
  platformType,
  selectedPattern,
  accentColor,
  selectedShape,
  onSelectShape,
  disabled = false
}: AIShapeRecommendationsProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recommendations = useMemo(() => {
    return getShapeRecommendations(platformType, selectedPattern, accentColor, showAdvanced);
  }, [platformType, selectedPattern, accentColor, showAdvanced]);

  useEffect(() => {
    setIsAnalyzing(true);
    const timer = setTimeout(() => setIsAnalyzing(false), 300);
    return () => clearTimeout(timer);
  }, [platformType, selectedPattern]);

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {isAr ? "توصيات الأشكال الذكية" : "AI Shape Recommendations"}
                <Badge variant="secondary" className="text-[10px]">
                  {isAr ? "مُوصى به" : "AI-Guided"}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr 
                  ? "الذكاء الاصطناعي يقترح • أنت تختار" 
                  : "AI recommends • You decide"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="advanced-shapes"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
                disabled={disabled}
                data-testid="switch-advanced-shapes"
              />
              <Label htmlFor="advanced-shapes" className="text-xs cursor-pointer">
                {isAr ? "أشكال متقدمة" : "Advanced Shapes"}
              </Label>
            </div>
            
            {isAnalyzing && (
              <Badge variant="outline" className="animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                {isAr ? "تحليل..." : "Analyzing..."}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-2">
            {recommendations.map((shape, index) => {
              const isSelected = selectedShape === shape.category;
              const EmphasisIcon = emphasisIcons[shape.emphasis] || Lightbulb;
              const emphasisLabel = emphasisLabels[shape.emphasis];
              
              return (
                <Tooltip key={shape.id} delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Card
                      className={`
                        relative cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? "ring-2 ring-primary border-primary bg-primary/10" 
                          : "hover-elevate border-border/50"}
                        ${disabled ? "opacity-50 pointer-events-none" : ""}
                      `}
                      onClick={() => !disabled && onSelectShape(shape)}
                      data-testid={`shape-card-${shape.category}`}
                    >
                      {index === 0 && (
                        <Badge 
                          className="absolute -top-2 -right-2 text-[9px] px-1.5 bg-amber-500 text-black z-10"
                        >
                          {isAr ? "الأفضل" : "TOP"}
                        </Badge>
                      )}
                      
                      {isSelected && (
                        <div className="absolute top-1 left-1 z-10">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <CardContent className="p-2 flex flex-col items-center gap-2">
                        <div 
                          className="w-full aspect-square rounded-md overflow-hidden border border-border/30"
                          dangerouslySetInnerHTML={{ __html: shape.svgPreview }}
                        />
                        
                        <div className="text-center w-full">
                          <p className="text-xs font-medium truncate">
                            {isAr ? shape.nameAr : shape.nameEn}
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <EmphasisIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {isAr ? emphasisLabel.ar : emphasisLabel.en}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full flex items-center justify-between px-1">
                          <Badge 
                            variant={shape.complexityLevel === "advanced" ? "secondary" : "outline"} 
                            className="text-[8px] px-1"
                          >
                            {shape.complexityLevel === "basic" 
                              ? (isAr ? "أساسي" : "Basic")
                              : shape.complexityLevel === "intermediate"
                              ? (isAr ? "متوسط" : "Mid")
                              : (isAr ? "متقدم" : "Adv")}
                          </Badge>
                          <span className="text-[10px] font-mono text-primary">
                            {shape.confidence}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  
                  <TooltipContent 
                    side="bottom" 
                    className="max-w-xs p-3 bg-popover border"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">
                          {isAr ? "لماذا هذا الشكل؟" : "Why this shape?"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? shape.reasonAr : shape.reasonEn}
                      </p>
                      <div className="pt-1 border-t text-[10px] text-muted-foreground">
                        {isAr ? shape.descriptionAr : shape.descriptionEn}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </ScrollArea>
        
        {!selectedShape && (
          <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-md flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {isAr 
                ? "يجب اختيار شكل قبل التصدير - اختيارك يحدد الهوية البصرية النهائية"
                : "Shape selection is mandatory - Your choice defines the final visual identity"}
            </p>
          </div>
        )}
        
        {selectedShape && (
          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {isAr 
                ? `تم اختيار: ${recommendations.find(r => r.category === selectedShape)?.nameAr || selectedShape}`
                : `Selected: ${recommendations.find(r => r.category === selectedShape)?.nameEn || selectedShape}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
