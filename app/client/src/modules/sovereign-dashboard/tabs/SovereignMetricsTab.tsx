/**
 * Sovereign Metrics Tab - تبويب المؤشرات السيادية
 * Lazy loaded - يحمل عند فتحه فقط
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, AlertTriangle, HelpCircle, RefreshCw } from "lucide-react";
import type { PageAnalysis, SovereignMetric } from "../engine/sovereignAnalyzer";
import { useLanguage } from "@/hooks/use-language";

interface SovereignMetricsTabProps {
  analysis: PageAnalysis | null;
  isAnalyzing: boolean;
}

const statusIcons = {
  complete: CheckCircle,
  analyzing: Clock,
  pending: AlertTriangle,
  unavailable: HelpCircle,
};

const statusColors = {
  complete: 'text-green-500',
  analyzing: 'text-blue-500',
  pending: 'text-yellow-500',
  unavailable: 'text-muted-foreground',
};

export function SovereignMetricsTab({ analysis, isAnalyzing }: SovereignMetricsTabProps) {
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

  const getMetricColor = (value: number | null): string => {
    if (value === null) return 'bg-muted';
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderMetricCard = (metric: SovereignMetric) => {
    const StatusIcon = statusIcons[metric.status];
    
    return (
      <Card key={metric.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                {isAr ? metric.nameAr : metric.nameEn}
              </h4>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <StatusIcon className={`w-4 h-4 ${statusColors[metric.status]}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {metric.status === 'complete' && (isAr ? 'مكتمل' : 'Complete')}
                  {metric.status === 'analyzing' && (isAr ? 'قيد التحليل' : 'Analyzing')}
                  {metric.status === 'pending' && (isAr ? 'في الانتظار' : 'Pending')}
                  {metric.status === 'unavailable' && (isAr ? 'غير متاح' : 'Unavailable')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr ? 'المصدر:' : 'Source:'} {metric.source}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {metric.value !== null ? (
            <>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold">{metric.value}%</span>
                <span className="text-xs text-muted-foreground">/ {metric.maxValue}</span>
              </div>
              <Progress 
                value={metric.value} 
                className={`h-2 ${getMetricColor(metric.value)}`} 
              />
            </>
          ) : (
            <div className="py-3 text-center">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {isAr ? 'قيد التحليل' : 'Analyzing'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {isAr ? 'يعتمد على:' : 'Depends on:'} {metric.dependencies.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const completedMetrics = analysis.sovereignMetrics.filter(m => m.status === 'complete');
  const avgScore = completedMetrics.length > 0
    ? Math.round(completedMetrics.reduce((sum, m) => sum + (m.value || 0), 0) / completedMetrics.length)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold">{isAr ? 'مؤشرات الذكاء السيادي' : 'Sovereign Intelligence Metrics'}</h3>
          <p className="text-sm text-muted-foreground">
            {completedMetrics.length}/{analysis.sovereignMetrics.length} {isAr ? 'مكتمل' : 'complete'}
          </p>
        </div>
        {avgScore !== null && (
          <Badge className={avgScore >= 70 ? 'bg-green-500' : avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
            {isAr ? 'المتوسط:' : 'Avg:'} {avgScore}%
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.sovereignMetrics.map(renderMetricCard)}
      </div>
    </div>
  );
}

export default SovereignMetricsTab;
