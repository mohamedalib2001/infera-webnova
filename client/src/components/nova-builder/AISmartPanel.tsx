import { useState } from 'react';
import { 
  Bot, Zap, Shield, DollarSign, AlertTriangle, CheckCircle, 
  Loader2, ChevronRight, Lightbulb, TrendingUp, Lock, Server,
  RefreshCw, Send, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface AISmartPanelProps {
  language: 'en' | 'ar';
  suggestions: AISuggestion[];
  costEstimate: CostEstimate | null;
  securityIssues: SecurityIssue[];
  isAnalyzing: boolean;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onAskAI: (question: string) => void;
}

interface AISuggestion {
  id: string;
  type: 'optimization' | 'security' | 'scalability' | 'cost';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  autoApply?: boolean;
}

interface CostEstimate {
  monthly: number;
  breakdown: { name: string; cost: number }[];
  savings?: { amount: number; suggestion: string };
}

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fix?: string;
}

export function AISmartPanel({
  language,
  suggestions,
  costEstimate,
  securityIssues,
  isAnalyzing,
  onApplySuggestion,
  onAskAI,
}: AISmartPanelProps) {
  const [question, setQuestion] = useState('');
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleAskAI = () => {
    if (question.trim()) {
      onAskAI(question);
      setQuestion('');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="w-80 bg-card/50 backdrop-blur-xl border-l border-border/50 flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-sm">{t('Nova AI', 'نوفا AI')}</span>
            {isAnalyzing && (
              <Badge variant="secondary" className="ml-2 gap-1 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('Analyzing', 'جاري التحليل')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {costEstimate && (
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  {t('Cost Estimate', 'تقدير التكلفة')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  ${costEstimate.monthly.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <div className="mt-3 space-y-2">
                  {costEstimate.breakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span>${item.cost}</span>
                    </div>
                  ))}
                </div>
                {costEstimate.savings && (
                  <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      {t('Save', 'وفر')} ${costEstimate.savings.amount}/mo
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{costEstimate.savings.suggestion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {securityIssues.length > 0 && (
            <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  {t('Security Issues', 'مشاكل الأمان')}
                  <Badge variant="destructive" className="ml-auto">
                    {securityIssues.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {securityIssues.map((issue) => (
                  <div key={issue.id} className="p-2 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </Badge>
                      <span className="text-xs font-medium">{issue.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                    {issue.fix && (
                      <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1">
                        <Zap className="w-3 h-3" />
                        {t('Auto Fix', 'إصلاح تلقائي')}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {suggestions.length > 0 && (
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  {t('AI Suggestions', 'اقتراحات الذكاء')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-2 rounded-lg bg-background/50 border border-border/50 hover-elevate cursor-pointer" onClick={() => onApplySuggestion(suggestion)}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} impact
                      </Badge>
                      <span className="text-xs font-medium">{suggestion.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {t('Apply', 'تطبيق')}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!isAnalyzing && suggestions.length === 0 && securityIssues.length === 0 && !costEstimate && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('Build your architecture and click Analyze to get AI insights', 'ابنِ البنية ثم اضغط تحليل للحصول على رؤى الذكاء')}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('Ask Nova anything...', 'اسأل نوفا أي شيء...')}
            className="min-h-[80px] pr-12 resize-none bg-background/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskAI();
              }
            }}
            data-testid="input-ask-ai"
          />
          <Button 
            size="icon" 
            className="absolute bottom-2 right-2 h-8 w-8 bg-gradient-to-r from-cyan-500 to-blue-600"
            onClick={handleAskAI}
            disabled={!question.trim()}
            data-testid="button-send-ai"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
