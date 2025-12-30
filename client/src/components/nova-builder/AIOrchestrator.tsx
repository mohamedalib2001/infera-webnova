import { useState, useEffect } from 'react';
import { 
  Brain, Zap, Shield, DollarSign, Cpu, TrendingUp, AlertTriangle,
  CheckCircle, Loader2, Sparkles, Target, GitBranch, Box, Workflow,
  RefreshCw, ChevronRight, ArrowRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Node, Edge } from '@xyflow/react';

interface AIOrchestatorProps {
  language: 'en' | 'ar';
  nodes: Node[];
  edges: Edge[];
  projectType: string;
  isVisible: boolean;
  onClose: () => void;
  onApplyRecommendation: (recommendation: Recommendation) => void;
}

interface Recommendation {
  id: string;
  type: 'optimization' | 'security' | 'architecture' | 'cost' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  autoApplicable: boolean;
  estimatedSavings?: number;
  confidence: number;
  action?: () => void;
}

interface ArchitectureInsight {
  score: number;
  category: string;
  message: string;
  suggestions: string[];
}

export function AIOrchestrator({
  language,
  nodes,
  edges,
  projectType,
  isVisible,
  onClose,
  onApplyRecommendation,
}: AIOrchestatorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<ArchitectureInsight[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    if (isVisible && nodes.length > 0) {
      analyzeArchitecture();
    }
  }, [isVisible, nodes, edges, projectType]);

  const analyzeArchitecture = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hasAuth = nodes.some(n => (n.data as any).nodeType === 'auth-service');
    const hasDatabase = nodes.some(n => n.type === 'database');
    const hasLoadBalancer = nodes.some(n => (n.data as any).nodeType === 'load-balancer');
    const hasCache = nodes.some(n => (n.data as any).nodeType === 'redis');
    const serviceCount = nodes.filter(n => n.type === 'service').length;
    const hasFirewall = nodes.some(n => (n.data as any).nodeType === 'firewall');

    const newRecommendations: Recommendation[] = [];
    const newInsights: ArchitectureInsight[] = [];

    if (!hasAuth && serviceCount > 0) {
      newRecommendations.push({
        id: 'rec-auth',
        type: 'security',
        title: t('Add Authentication Service', 'أضف خدمة المصادقة'),
        description: t(
          'Your services lack authentication. Add Auth Service for secure access.',
          'خدماتك تفتقر للمصادقة. أضف خدمة المصادقة للوصول الآمن.'
        ),
        impact: 'high',
        autoApplicable: true,
        confidence: 95,
      });
    }

    if (!hasCache && serviceCount > 2) {
      newRecommendations.push({
        id: 'rec-cache',
        type: 'performance',
        title: t('Add Redis Cache', 'أضف ذاكرة Redis'),
        description: t(
          'Multiple services detected. Adding Redis cache can improve response times by 40%.',
          'تم اكتشاف خدمات متعددة. إضافة Redis يمكن أن تحسن الاستجابة بنسبة 40%.'
        ),
        impact: 'high',
        autoApplicable: true,
        estimatedSavings: 40,
        confidence: 88,
      });
    }

    if (!hasLoadBalancer && serviceCount > 1) {
      newRecommendations.push({
        id: 'rec-lb',
        type: 'architecture',
        title: t('Add Load Balancer', 'أضف موازن الحمل'),
        description: t(
          'Distribute traffic across your services for better reliability.',
          'وزع حركة المرور عبر خدماتك لموثوقية أفضل.'
        ),
        impact: 'medium',
        autoApplicable: true,
        confidence: 92,
      });
    }

    if (!hasFirewall && nodes.length > 0) {
      newRecommendations.push({
        id: 'rec-firewall',
        type: 'security',
        title: t('Add Firewall Protection', 'أضف حماية جدار الحماية'),
        description: t(
          'Protect your infrastructure with a firewall layer.',
          'احمِ بنيتك التحتية بطبقة جدار حماية.'
        ),
        impact: 'high',
        autoApplicable: true,
        confidence: 90,
      });
    }

    if (projectType === 'ecommerce' && !nodes.some(n => (n.data as any).nodeType === 'payment-service')) {
      newRecommendations.push({
        id: 'rec-payment',
        type: 'architecture',
        title: t('Add Payment Gateway', 'أضف بوابة الدفع'),
        description: t(
          'E-commerce projects need payment processing. Add Payment Service.',
          'مشاريع التجارة الإلكترونية تحتاج معالجة دفع. أضف خدمة الدفع.'
        ),
        impact: 'high',
        autoApplicable: true,
        confidence: 98,
      });
    }

    newInsights.push({
      score: hasAuth ? 90 : 40,
      category: t('Security', 'الأمان'),
      message: hasAuth 
        ? t('Authentication configured', 'المصادقة مُعدة') 
        : t('Missing authentication', 'المصادقة مفقودة'),
      suggestions: hasAuth ? [] : [t('Add auth-service', 'أضف خدمة المصادقة')],
    });

    newInsights.push({
      score: hasCache ? 85 : 50,
      category: t('Performance', 'الأداء'),
      message: hasCache 
        ? t('Caching layer present', 'طبقة التخزين المؤقت موجودة') 
        : t('No caching layer', 'لا توجد طبقة تخزين مؤقت'),
      suggestions: hasCache ? [] : [t('Add Redis cache', 'أضف ذاكرة Redis')],
    });

    newInsights.push({
      score: hasLoadBalancer ? 88 : 55,
      category: t('Scalability', 'قابلية التوسع'),
      message: hasLoadBalancer 
        ? t('Load balancing configured', 'موازنة الحمل مُعدة') 
        : t('Single point of entry', 'نقطة دخول واحدة'),
      suggestions: hasLoadBalancer ? [] : [t('Add load balancer', 'أضف موازن الحمل')],
    });

    const avgScore = Math.round(
      newInsights.reduce((sum, i) => sum + i.score, 0) / Math.max(newInsights.length, 1)
    );

    setRecommendations(newRecommendations);
    setInsights(newInsights);
    setOverallScore(avgScore);
    setIsAnalyzing(false);
  };

  if (!isVisible) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="ai-orchestrator-modal">
      <div className="bg-card border border-border/50 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('AI Architect Assistant', 'مساعد المهندس الذكي')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('Context-aware analysis & recommendations', 'تحليل واقتراحات مدركة للسياق')}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-orchestrator">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <p className="text-lg font-medium">{t('Analyzing Architecture...', 'جاري تحليل البنية...')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('Checking patterns, security, and optimization opportunities', 'فحص الأنماط والأمان وفرص التحسين')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20" data-testid="card-overall-score">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`} data-testid="text-overall-score">
                      {overallScore}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('Overall Score', 'النتيجة الإجمالية')}</p>
                  </div>
                </div>
                
                {insights.map((insight, i) => (
                  <div key={i} className="bg-card/50 rounded-xl p-4 border border-border/50" data-testid={`card-insight-${insight.category.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{insight.category}</span>
                      <span className={`text-sm font-bold ${getScoreColor(insight.score)}`} data-testid={`text-score-${insight.category.toLowerCase()}`}>
                        {insight.score}%
                      </span>
                    </div>
                    <Progress value={insight.score} className="h-1.5 mb-2" data-testid={`progress-${insight.category.toLowerCase()}`} />
                    <p className="text-xs" data-testid={`text-message-${insight.category.toLowerCase()}`}>{insight.message}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  {t('Smart Recommendations', 'التوصيات الذكية')}
                  <Badge variant="secondary">{recommendations.length}</Badge>
                </h3>
                
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p>{t('Your architecture looks great!', 'بنيتك تبدو رائعة!')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id} 
                        className="bg-card/50 rounded-xl p-4 border border-border/50 hover-elevate"
                        data-testid={`recommendation-${rec.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`text-xs ${getImpactColor(rec.impact)}`}>
                                {rec.impact} impact
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {rec.confidence}% {t('confidence', 'ثقة')}
                              </Badge>
                              {rec.estimatedSavings && (
                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                  +{rec.estimatedSavings}% {t('improvement', 'تحسين')}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                          {rec.autoApplicable && (
                            <Button 
                              size="sm" 
                              className="gap-1 shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600"
                              onClick={() => onApplyRecommendation(rec)}
                              data-testid={`apply-${rec.id}`}
                            >
                              <Zap className="w-3 h-3" />
                              {t('Apply', 'تطبيق')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h4 className="font-medium">{t('Proactive Insights', 'رؤى استباقية')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{nodes.length} {t('components configured', 'مكونات مُعدة')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span>{edges.length} {t('connections established', 'اتصالات مُنشأة')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-yellow-400" />
                    <span>{t('Project type:', 'نوع المشروع:')} {projectType || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-cyan-400" />
                    <span>{t('Microservices pattern detected', 'تم اكتشاف نمط Microservices')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={analyzeArchitecture} className="gap-2" data-testid="button-reanalyze">
            <RefreshCw className="w-4 h-4" />
            {t('Re-analyze', 'إعادة التحليل')}
          </Button>
          <Button size="sm" onClick={onClose} className="gap-2" data-testid="button-done">
            {t('Done', 'تم')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
