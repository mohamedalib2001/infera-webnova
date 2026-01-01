/**
 * Structure Tab - تبويب البنية
 * Lazy loaded - يحمل عند فتحه فقط
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Code, FileCode, Image, Link2, RefreshCw } from "lucide-react";
import type { PageAnalysis } from "../engine/sovereignAnalyzer";
import { useLanguage } from "@/hooks/use-language";

interface StructureTabProps {
  analysis: PageAnalysis | null;
  isAnalyzing: boolean;
}

export function StructureTab({ analysis, isAnalyzing }: StructureTabProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        {isAr ? 'قيد التحليل – يعتمد على اكتمال الصفحة' : 'Analyzing - depends on page completion'}
      </div>
    );
  }

  const { metrics, structure } = analysis;

  const complexityColors = {
    low: 'bg-green-500/10 text-green-500 border-green-500/30',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    high: 'bg-red-500/10 text-red-500 border-red-500/30',
  };

  const structureItems = [
    {
      icon: Boxes,
      labelEn: 'Component Count',
      labelAr: 'عدد المكونات',
      value: metrics.componentCount,
    },
    {
      icon: Link2,
      labelEn: 'Interactive Elements',
      labelAr: 'العناصر التفاعلية',
      value: metrics.interactiveElements,
    },
    {
      icon: Code,
      labelEn: 'Scripts',
      labelAr: 'السكريبتات',
      value: metrics.scriptCount,
    },
    {
      icon: FileCode,
      labelEn: 'Styles',
      labelAr: 'الأنماط',
      value: metrics.styleCount,
    },
    {
      icon: Image,
      labelEn: 'Images',
      labelAr: 'الصور',
      value: metrics.imageCount,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold">{isAr ? 'بنية الصفحة' : 'Page Structure'}</h3>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'تحليل مكونات وموارد الصفحة' : 'Page components and resources analysis'}
          </p>
        </div>
        <Badge className={complexityColors[structure.stateComplexity]}>
          {structure.stateComplexity === 'low' && (isAr ? 'تعقيد منخفض' : 'Low Complexity')}
          {structure.stateComplexity === 'medium' && (isAr ? 'تعقيد متوسط' : 'Medium Complexity')}
          {structure.stateComplexity === 'high' && (isAr ? 'تعقيد عالي' : 'High Complexity')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {structureItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <item.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">
                {isAr ? item.labelAr : item.labelEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{isAr ? 'تفاصيل البنية' : 'Structure Details'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'شجرة المكونات' : 'Component Tree'}
            </span>
            <span className="font-mono">{structure.componentTree}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'الاعتماديات' : 'Dependencies'}
            </span>
            <span className="font-mono">{structure.dependencyCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'الاعتماديات الخارجية' : 'External Dependencies'}
            </span>
            <span className="font-mono">{structure.externalDependencies}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'إجمالي الموارد' : 'Total Resources'}
            </span>
            <span className="font-mono">{metrics.resourceCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'استدعاءات API' : 'API Calls'}
            </span>
            <span className="font-mono">{metrics.apiCallCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StructureTab;
