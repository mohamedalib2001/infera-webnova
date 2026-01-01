/**
 * Intelligence Tab - تبويب الذكاء التشغيلي
 * Lazy loaded - يحمل عند فتحه فقط
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Shield, Zap, TrendingUp, RefreshCw } from "lucide-react";
import type { PageAnalysis } from "../engine/sovereignAnalyzer";
import { useLanguage } from "@/hooks/use-language";

interface IntelligenceTabProps {
  analysis: PageAnalysis | null;
  isAnalyzing: boolean;
}

export function IntelligenceTab({ analysis, isAnalyzing }: IntelligenceTabProps) {
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

  const { intelligence } = analysis;

  const classificationColors = {
    sovereign: 'bg-green-500',
    'semi-sovereign': 'bg-yellow-500',
    dependent: 'bg-red-500',
  };

  const classificationLabels = {
    sovereign: { en: 'Sovereign', ar: 'سيادي' },
    'semi-sovereign': { en: 'Semi-Sovereign', ar: 'شبه سيادي' },
    dependent: { en: 'Dependent', ar: 'تابع' },
  };

  const intelligenceItems = [
    {
      icon: Shield,
      labelEn: 'Operational Independence',
      labelAr: 'الاستقلال التشغيلي',
      value: intelligence.operationalIndependence,
      descEn: 'Ability to function without external dependencies',
      descAr: 'القدرة على العمل بدون اعتماديات خارجية',
    },
    {
      icon: Zap,
      labelEn: 'Adaptability',
      labelAr: 'القابلية للتكيف',
      value: intelligence.adaptability,
      descEn: 'Response to changes and user actions',
      descAr: 'الاستجابة للتغييرات وأفعال المستخدم',
    },
    {
      icon: Brain,
      labelEn: 'Resource Awareness',
      labelAr: 'الوعي بالموارد',
      value: intelligence.resourceAwareness,
      descEn: 'Efficient use of system resources',
      descAr: 'الاستخدام الفعال لموارد النظام',
    },
    {
      icon: TrendingUp,
      labelEn: 'Self Optimization',
      labelAr: 'التحسين الذاتي',
      value: intelligence.selfOptimization,
      descEn: 'Ability to scale and optimize',
      descAr: 'القدرة على التوسع والتحسين',
    },
  ];

  const avgScore = Math.round(
    (intelligence.operationalIndependence +
      intelligence.adaptability +
      intelligence.resourceAwareness +
      intelligence.selfOptimization) / 4
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold">{isAr ? 'تقييم الذكاء التشغيلي' : 'Intelligence Assessment'}</h3>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'تحليل استقلالية وذكاء الصفحة' : 'Page independence and intelligence analysis'}
          </p>
        </div>
        <Badge className={classificationColors[intelligence.classification]}>
          {isAr 
            ? classificationLabels[intelligence.classification].ar 
            : classificationLabels[intelligence.classification].en
          }
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold mb-2">{avgScore}%</div>
          <div className="text-sm text-muted-foreground">
            {isAr ? 'معدل الذكاء السيادي' : 'Sovereign Intelligence Score'}
          </div>
          <Progress value={avgScore} className="mt-4 h-3" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {intelligenceItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {isAr ? item.labelAr : item.labelEn}
                    </span>
                    <span className="text-sm font-mono">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default IntelligenceTab;
