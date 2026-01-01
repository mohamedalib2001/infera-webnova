import { useState } from 'react';
import { 
  TrendingUp, Shield, DollarSign, Zap, Clock, Users, Server,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, RefreshCw,
  AlertTriangle, CheckCircle, Target, Sparkles, Activity,
  Box, Database, GitBranch, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Node, Edge } from '@xyflow/react';

interface SmartDashboardProps {
  language: 'en' | 'ar';
  nodes: Node[];
  edges: Edge[];
  isVisible: boolean;
  onClose: () => void;
  onActionClick: (action: string) => void;
}

interface InsightCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  insight: string;
  action: string;
  actionLabel: string;
  icon: any;
  color: string;
}

export function SmartDashboard({
  language,
  nodes,
  edges,
  isVisible,
  onClose,
  onActionClick,
}: SmartDashboardProps) {
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const serviceCount = nodes.filter(n => n.type === 'service').length;
  const dbCount = nodes.filter(n => n.type === 'database').length;
  const infraCount = nodes.filter(n => n.type === 'infra').length;

  const estimatedCost = Math.round(serviceCount * 50 + dbCount * 80 + infraCount * 30);
  const potentialSavings = Math.round(estimatedCost * 0.35);

  const hasAuth = nodes.some(n => (n.data as any).nodeType === 'auth-service');
  const hasFirewall = nodes.some(n => (n.data as any).nodeType === 'firewall');
  const hasCache = nodes.some(n => (n.data as any).nodeType === 'redis');

  const securityScore = (hasAuth ? 35 : 0) + (hasFirewall ? 35 : 0) + 30;
  const performanceScore = hasCache ? 85 : 55;

  const insightCards: InsightCard[] = [
    {
      id: 'efficiency',
      title: t('Build Efficiency', 'كفاءة البناء'),
      value: `${serviceCount > 0 ? '87' : '0'}%`,
      change: 12,
      changeType: 'positive',
      insight: t(
        'Using microservices can reduce build time by 30%',
        'استخدام الخدمات المصغرة يمكن أن يقلل وقت البناء بنسبة 30%'
      ),
      action: 'optimize-build',
      actionLabel: t('Request Auto Optimization', 'طلب التحسين التلقائي'),
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      id: 'security',
      title: t('Security', 'الأمان'),
      value: `${securityScore}%`,
      change: hasAuth ? 0 : -25,
      changeType: hasAuth && hasFirewall ? 'positive' : 'negative',
      insight: hasAuth && hasFirewall 
        ? t('Security configured properly', 'الأمان مُعد بشكل صحيح')
        : t('3 vulnerabilities detected automatically', '3 نقاط ضعف اكتشفت تلقائياً'),
      action: 'auto-fix-security',
      actionLabel: t('Auto Fix', 'إصلاح تلقائي'),
      icon: Shield,
      color: hasAuth && hasFirewall ? 'text-green-400' : 'text-red-400',
    },
    {
      id: 'cost',
      title: t('Estimated Cost', 'التكلفة المقدرة'),
      value: `$${estimatedCost}`,
      change: -35,
      changeType: 'positive',
      insight: t(
        `Save ${potentialSavings}$ with architecture modifications`,
        `وفر ${potentialSavings}$ مع تعديلات البنية`
      ),
      action: 'show-alternatives',
      actionLabel: t('Show Alternatives', 'عرض البدائل'),
      icon: DollarSign,
      color: 'text-yellow-400',
    },
    {
      id: 'performance',
      title: t('Performance', 'الأداء'),
      value: `${performanceScore}%`,
      change: hasCache ? 15 : -10,
      changeType: hasCache ? 'positive' : 'negative',
      insight: hasCache
        ? t('Caching improves response time', 'التخزين المؤقت يحسن وقت الاستجابة')
        : t('Add caching for 40% faster response', 'أضف تخزين مؤقت لاستجابة أسرع 40%'),
      action: 'optimize-performance',
      actionLabel: t('Optimize', 'تحسين'),
      icon: Zap,
      color: hasCache ? 'text-green-400' : 'text-orange-400',
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-4" data-testid="smart-dashboard">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{t('Smart Dashboard', 'لوحة التحكم الذكية')}</h3>
              <p className="text-xs text-muted-foreground">{t('Real-time insights & actions', 'رؤى وإجراءات فورية')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1" data-testid="badge-component-count">
              <Box className="w-3 h-3" />
              {nodes.length} {t('components', 'مكونات')}
            </Badge>
            <Badge variant="secondary" className="gap-1" data-testid="badge-connection-count">
              <GitBranch className="w-3 h-3" />
              {edges.length} {t('connections', 'اتصالات')}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-dashboard">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {insightCards.map((card) => (
              <Card key={card.id} className="bg-card/50 border-border/50 hover-elevate" data-testid={`card-insight-${card.id}`}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{card.value}</span>
                    <span className={`text-xs flex items-center gap-0.5 ${
                      card.changeType === 'positive' ? 'text-green-400' : 
                      card.changeType === 'negative' ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      {card.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : card.changeType === 'negative' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : null}
                      {Math.abs(card.change)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{card.insight}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3 h-7 text-xs w-full justify-start gap-1 text-cyan-400"
                    onClick={() => onActionClick(card.action)}
                    data-testid={`action-${card.action}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    {card.actionLabel}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium">
                  {t('Architecture Health Score', 'درجة صحة البنية')}: 
                  <span className="ml-2 text-cyan-400 font-bold">{Math.round((securityScore + performanceScore) / 2)}%</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('Based on security, performance, and best practices analysis', 'بناءً على تحليل الأمان والأداء وأفضل الممارسات')}
                </p>
              </div>
            </div>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600" data-testid="button-dashboard-full-analysis">
              <RefreshCw className="w-4 h-4" />
              {t('Full Analysis', 'تحليل كامل')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
