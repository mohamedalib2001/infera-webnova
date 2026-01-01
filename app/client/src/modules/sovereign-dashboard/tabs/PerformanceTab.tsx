/**
 * Performance Tab - تبويب الأداء
 * Lazy loaded - يحمل عند فتحه فقط
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Clock, Zap, RefreshCw, Activity } from "lucide-react";
import type { PageAnalysis } from "../engine/sovereignAnalyzer";
import { useLanguage } from "@/hooks/use-language";

interface PerformanceTabProps {
  analysis: PageAnalysis | null;
  isAnalyzing: boolean;
}

export function PerformanceTab({ analysis, isAnalyzing }: PerformanceTabProps) {
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

  const { metrics, performance: perf } = analysis;

  const gradeColors: Record<string, string> = {
    'A': 'bg-green-500',
    'B': 'bg-blue-500',
    'C': 'bg-yellow-500',
    'D': 'bg-orange-500',
    'F': 'bg-red-500',
  };

  const metricItems = [
    {
      icon: Clock,
      labelEn: 'Load Time',
      labelAr: 'وقت التحميل',
      value: `${Math.round(metrics.loadTime)}ms`,
      score: perf.loadSpeed,
    },
    {
      icon: Zap,
      labelEn: 'Time To Interactive',
      labelAr: 'وقت التفاعل',
      value: `${Math.round(metrics.timeToInteractive)}ms`,
      score: perf.interactivity,
    },
    {
      icon: RefreshCw,
      labelEn: 'Re-renders',
      labelAr: 'إعادة التصيير',
      value: metrics.reRenderCount.toString(),
      score: perf.stability,
    },
    {
      icon: Activity,
      labelEn: 'Resource Efficiency',
      labelAr: 'كفاءة الموارد',
      value: `${metrics.resourceCount} resources`,
      score: perf.resourceEfficiency,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${gradeColors[perf.grade]} flex items-center justify-center`}>
            <span className="text-white text-xl font-bold">{perf.grade}</span>
          </div>
          <div>
            <h3 className="font-semibold">{isAr ? 'التقييم العام' : 'Overall Grade'}</h3>
            <p className="text-sm text-muted-foreground">{perf.overall}%</p>
          </div>
        </div>
        {isAnalyzing && (
          <Badge variant="outline" className="gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {isAr ? 'جاري التحليل' : 'Analyzing'}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metricItems.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </div>
                <span className="text-sm font-mono">{item.value}</span>
              </div>
              <Progress value={item.score} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {Math.round(item.score)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            {isAr ? 'تفاصيل التوقيت' : 'Timing Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'First Contentful Paint' : 'First Contentful Paint'}
            </span>
            <span className="font-mono">{Math.round(metrics.firstContentfulPaint)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'Largest Contentful Paint' : 'Largest Contentful Paint'}
            </span>
            <span className="font-mono">{Math.round(metrics.largestContentfulPaint)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {isAr ? 'DOM Content Loaded' : 'DOM Content Loaded'}
            </span>
            <span className="font-mono">{Math.round(metrics.domContentLoaded)}ms</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceTab;
