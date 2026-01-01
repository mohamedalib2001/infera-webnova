import { useState, useEffect } from 'react';
import { 
  Lightbulb, X, Zap, Shield, Database, Users, CreditCard,
  AlertTriangle, CheckCircle, TrendingUp, Clock, Sparkles,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Node } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProactiveIntelligenceProps {
  language: 'en' | 'ar';
  nodes: Node[];
  projectType: string;
  onSuggestionApply: (suggestionType: string, nodeData: any) => void;
  onDismiss: (id: string) => void;
}

interface ProactiveSuggestion {
  id: string;
  type: 'feature' | 'security' | 'optimization' | 'warning';
  title: string;
  description: string;
  icon: any;
  color: string;
  nodeType?: string;
  priority: 'high' | 'medium' | 'low';
  autoApply?: boolean;
}

export function ProactiveIntelligence({
  language,
  nodes,
  projectType,
  onSuggestionApply,
  onDismiss,
}: ProactiveIntelligenceProps) {
  const [suggestions, setSuggestions] = useState<ProactiveSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    const newSuggestions: ProactiveSuggestion[] = [];
    
    const hasAuth = nodes.some(n => (n.data as any).nodeType === 'auth-service');
    const hasPayment = nodes.some(n => (n.data as any).nodeType === 'payment-service');
    const hasNotification = nodes.some(n => (n.data as any).nodeType === 'notification-service');
    const hasAnalytics = nodes.some(n => (n.data as any).nodeType === 'analytics-service');
    const hasDatabase = nodes.some(n => n.type === 'database');
    const serviceCount = nodes.filter(n => n.type === 'service').length;

    if (hasAuth && !nodes.some(n => (n.data as any).label?.includes('2FA'))) {
      newSuggestions.push({
        id: 'suggest-2fa',
        type: 'security',
        title: t('Add Two-Factor Authentication', 'إضافة المصادقة الثنائية'),
        description: t(
          'I see you added authentication. Would you like to add 2FA for extra security?',
          'أرى أنك أضفت المصادقة. هل تريد إضافة 2FA لأمان إضافي؟'
        ),
        icon: Shield,
        color: 'text-green-400',
        nodeType: '2fa-service',
        priority: 'high',
        autoApply: true,
      });
    }

    if (hasPayment && !hasNotification) {
      newSuggestions.push({
        id: 'suggest-notification',
        type: 'feature',
        title: t('Add Payment Notifications', 'إضافة إشعارات الدفع'),
        description: t(
          'Payment service detected. Add notifications to alert users about transactions.',
          'تم اكتشاف خدمة الدفع. أضف إشعارات لتنبيه المستخدمين بالمعاملات.'
        ),
        icon: Lightbulb,
        color: 'text-yellow-400',
        nodeType: 'notification-service',
        priority: 'medium',
        autoApply: true,
      });
    }

    if (serviceCount >= 3 && !hasAnalytics) {
      newSuggestions.push({
        id: 'suggest-analytics',
        type: 'optimization',
        title: t('Add Analytics Service', 'إضافة خدمة التحليلات'),
        description: t(
          'Multiple services detected. Analytics will help you monitor and optimize performance.',
          'تم اكتشاف خدمات متعددة. التحليلات ستساعدك في مراقبة وتحسين الأداء.'
        ),
        icon: TrendingUp,
        color: 'text-cyan-400',
        nodeType: 'analytics-service',
        priority: 'medium',
        autoApply: true,
      });
    }

    if (serviceCount >= 2 && !hasDatabase) {
      newSuggestions.push({
        id: 'suggest-database',
        type: 'warning',
        title: t('No Database Detected', 'لم يتم اكتشاف قاعدة بيانات'),
        description: t(
          'Your services will need data persistence. Add a database to store data.',
          'خدماتك ستحتاج لتخزين البيانات. أضف قاعدة بيانات لحفظ البيانات.'
        ),
        icon: Database,
        color: 'text-orange-400',
        nodeType: 'postgresql',
        priority: 'high',
        autoApply: true,
      });
    }

    if (projectType === 'ecommerce') {
      if (!hasPayment) {
        newSuggestions.push({
          id: 'suggest-payment-ecommerce',
          type: 'feature',
          title: t('E-commerce needs payments', 'التجارة الإلكترونية تحتاج دفع'),
          description: t(
            'E-commerce project detected. Add payment gateway for transactions.',
            'تم اكتشاف مشروع تجارة إلكترونية. أضف بوابة دفع للمعاملات.'
          ),
          icon: CreditCard,
          color: 'text-purple-400',
          nodeType: 'payment-service',
          priority: 'high',
          autoApply: true,
        });
      }

      if (!nodes.some(n => (n.data as any).nodeType === 'user-service')) {
        newSuggestions.push({
          id: 'suggest-users-ecommerce',
          type: 'feature',
          title: t('Add User Management', 'إضافة إدارة المستخدمين'),
          description: t(
            'E-commerce needs user accounts for orders and history.',
            'التجارة الإلكترونية تحتاج حسابات مستخدمين للطلبات والتاريخ.'
          ),
          icon: Users,
          color: 'text-blue-400',
          nodeType: 'user-service',
          priority: 'medium',
          autoApply: true,
        });
      }
    }

    if (projectType === 'saas') {
      if (!nodes.some(n => (n.data as any).label?.includes('Multi-Tenant'))) {
        newSuggestions.push({
          id: 'suggest-multitenancy',
          type: 'feature',
          title: t('Enable Multi-Tenancy', 'تفعيل تعدد المستأجرين'),
          description: t(
            'SaaS projects benefit from multi-tenant architecture.',
            'مشاريع SaaS تستفيد من بنية تعدد المستأجرين.'
          ),
          icon: Users,
          color: 'text-indigo-400',
          priority: 'high',
          autoApply: false,
        });
      }
    }

    const filtered = newSuggestions.filter(s => !dismissed.has(s.id));
    setSuggestions(filtered);
  }, [nodes, projectType, dismissed, t]);

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    onDismiss(id);
  };

  const handleApply = (suggestion: ProactiveSuggestion) => {
    if (suggestion.nodeType) {
      onSuggestionApply(suggestion.nodeType, {
        label: suggestion.title.replace('Add ', '').replace('إضافة ', ''),
        color: suggestion.color.replace('text-', 'bg-').replace('-400', '-500'),
      });
    }
    handleDismiss(suggestion.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      default: return 'border-blue-500/50 bg-blue-500/5';
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 w-80 space-y-2" data-testid="proactive-intelligence">
      <AnimatePresence>
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-card/95 backdrop-blur-xl border rounded-xl p-4 shadow-xl ${getPriorityColor(suggestion.priority)}`}
            data-testid={`suggestion-${suggestion.id}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center shrink-0`}>
                <suggestion.icon className={`w-4 h-4 ${suggestion.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{suggestion.title}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDismiss(suggestion.id)}
                    data-testid={`dismiss-${suggestion.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>
                <div className="flex items-center gap-2">
                  {suggestion.autoApply && (
                    <Button 
                      size="sm" 
                      className="h-7 text-xs gap-1 flex-1"
                      onClick={() => handleApply(suggestion)}
                      data-testid={`apply-${suggestion.id}`}
                    >
                      <Zap className="w-3 h-3" />
                      {t('Add Now', 'أضف الآن')}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => handleDismiss(suggestion.id)}
                    data-testid={`button-later-${suggestion.id}`}
                  >
                    {t('Later', 'لاحقاً')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {suggestions.length > 3 && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs" data-testid="badge-more-suggestions">
            +{suggestions.length - 3} {t('more suggestions', 'اقتراحات أخرى')}
          </Badge>
        </div>
      )}
    </div>
  );
}
