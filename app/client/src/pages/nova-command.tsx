import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Zap, Send, Bot, Activity, Shield, Globe,
  Code, Eye, Play, Clock, CheckCircle, AlertTriangle, TrendingUp,
  Cpu, Database, Server, Users, Gauge, BarChart3, Terminal,
  Loader2, ArrowRight, Rocket, Wand2, Command, Layers, Target,
  MessageSquare, FileCode, Settings, Lock, Workflow, GitBranch,
  PanelLeftClose, PanelLeft, ChevronRight, Star, Lightbulb
} from "lucide-react";

interface NovaMessage {
  id: string;
  role: 'user' | 'nova';
  content: string;
  timestamp: Date;
  intent?: string;
  actions?: NovaAction[];
  codePreview?: string;
  status?: 'thinking' | 'building' | 'complete' | 'error';
}

interface NovaAction {
  id: string;
  label: string;
  labelAr: string;
  icon: string;
  type: 'navigate' | 'execute' | 'preview' | 'confirm';
  payload?: any;
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'alert' | 'metric' | 'tip';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  priority: 'low' | 'medium' | 'high';
  action?: NovaAction;
}

interface BuildStep {
  id: string;
  name: string;
  nameAr: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  progress?: number;
  output?: string;
}

const quickIntents = [
  { id: 'build', icon: Rocket, label: { en: 'Build Platform', ar: 'بناء منصة' }, prompt: { en: 'I want to build a new platform', ar: 'أريد بناء منصة جديدة' } },
  { id: 'analyze', icon: BarChart3, label: { en: 'Analyze Data', ar: 'تحليل البيانات' }, prompt: { en: 'Analyze my platform data', ar: 'حلل بيانات منصتي' } },
  { id: 'secure', icon: Shield, label: { en: 'Security Check', ar: 'فحص أمني' }, prompt: { en: 'Run security audit', ar: 'قم بفحص أمني' } },
  { id: 'optimize', icon: Zap, label: { en: 'Optimize', ar: 'تحسين' }, prompt: { en: 'Optimize my platform performance', ar: 'حسّن أداء منصتي' } },
  { id: 'deploy', icon: Globe, label: { en: 'Deploy', ar: 'نشر' }, prompt: { en: 'Deploy my platform', ar: 'انشر منصتي' } },
  { id: 'assist', icon: Bot, label: { en: 'Get Help', ar: 'مساعدة' }, prompt: { en: 'I need help with', ar: 'أحتاج مساعدة في' } },
];

const aiCapabilities = [
  { icon: Code, label: { en: 'Code Generation', ar: 'توليد الكود' }, status: 'active' },
  { icon: Brain, label: { en: 'Intent Analysis', ar: 'تحليل النية' }, status: 'active' },
  { icon: Shield, label: { en: 'Security Scan', ar: 'فحص أمني' }, status: 'active' },
  { icon: Workflow, label: { en: 'Automation', ar: 'أتمتة' }, status: 'active' },
  { icon: Database, label: { en: 'Data Processing', ar: 'معالجة البيانات' }, status: 'active' },
  { icon: Globe, label: { en: 'Deployment', ar: 'نشر' }, status: 'ready' },
];

export default function NovaCommandPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { branding } = usePlatformBranding();
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [codePreview, setCodePreview] = useState<string>('');
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [aiPulse, setAiPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: stats } = useQuery<{
    totalPlatforms: number;
    livePlatforms: number;
    aiOperations: number;
    securityScore: number;
  }>({
    queryKey: ['/api/nova/command/stats'],
    refetchInterval: 30000,
  });

  const { data: insights = [] } = useQuery<AIInsight[]>({
    queryKey: ['/api/nova/command/insights'],
    refetchInterval: 60000,
  });

  const { data: realtimeMetrics } = useQuery<{
    cpuUsage: number;
    memoryUsage: number;
    activeConnections: number;
    requestsPerMinute: number;
  }>({
    queryKey: ['/api/nova/command/metrics'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;
    
    const userMessage: NovaMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    const thinkingMessage: NovaMessage = {
      id: (Date.now() + 1).toString(),
      role: 'nova',
      content: language === 'ar' ? 'جاري التحليل...' : 'Analyzing...',
      timestamp: new Date(),
      status: 'thinking',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const data = await apiRequest('POST', '/api/nova/command/chat', { 
        message: content, 
        context: { language, userId: user?.id } 
      });
      
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const novaResponse: NovaMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: data.response || (language === 'ar' ? 'تم معالجة طلبك' : 'Your request has been processed'),
        timestamp: new Date(),
        intent: data.intent,
        actions: data.actions,
        codePreview: data.codePreview,
        status: 'complete',
      };
      
      setMessages(prev => [...prev, novaResponse]);
      
      if (data.codePreview) {
        setCodePreview(data.codePreview);
        setShowCodePanel(true);
      }
      
      if (data.buildSteps) {
        setBuildSteps(data.buildSteps);
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const errorMessage: NovaMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. حاول مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, language, user?.id]);

  const handleQuickIntent = useCallback((intent: typeof quickIntents[0]) => {
    setActiveIntent(intent.id);
    const prompt = language === 'ar' ? intent.prompt.ar : intent.prompt.en;
    sendMessage(prompt);
  }, [language, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  const dynamicStats = useMemo(() => [
    { 
      icon: Layers, 
      label: { en: 'Total Platforms', ar: 'إجمالي المنصات' },
      value: stats?.totalPlatforms ?? 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      icon: Globe, 
      label: { en: 'Live', ar: 'مباشر' },
      value: stats?.livePlatforms ?? 0,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      icon: Brain, 
      label: { en: 'AI Operations', ar: 'عمليات AI' },
      value: stats?.aiOperations ?? 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      icon: Shield, 
      label: { en: 'Security', ar: 'الأمان' },
      value: `${stats?.securityScore ?? 100}%`,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
  ], [stats]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-4 p-4 overflow-hidden`}>
          
          <div className="w-80 flex flex-col gap-4 flex-shrink-0">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`relative p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 ${aiPulse ? 'animate-pulse' : ''}`}>
                    <Brain className="h-6 w-6 text-white" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-ping" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {language === 'ar' ? 'Nova AI' : 'Nova AI'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'نشط ومستعد' : 'Active & Ready'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {aiCapabilities.slice(0, 6).map((cap, idx) => (
                    <div 
                      key={idx}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 hover-elevate cursor-pointer"
                      data-testid={`ai-capability-${idx}`}
                    >
                      <cap.icon className={`h-4 w-4 ${cap.status === 'active' ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] text-center text-muted-foreground">
                        {language === 'ar' ? cap.label.ar : cap.label.en}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 overflow-hidden">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {language === 'ar' ? 'اقتراحات ذكية' : 'Smart Suggestions'}
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-48px)]">
                <div className="p-3 space-y-2">
                  {quickIntents.map((intent) => (
                    <Button
                      key={intent.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-3 hover-elevate"
                      onClick={() => handleQuickIntent(intent)}
                      disabled={isProcessing}
                      data-testid={`quick-intent-${intent.id}`}
                    >
                      <div className={`p-2 rounded-lg ${activeIntent === intent.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <intent.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm">
                        {language === 'ar' ? intent.label.ar : intent.label.en}
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''} ms-auto opacity-50`} />
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <div className="flex-1 flex flex-col min-w-0 gap-4">
            <div className="grid grid-cols-4 gap-3">
              {dynamicStats.map((stat, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar' ? stat.label.ar : stat.label.en}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-2 border-primary/10">
              <CardHeader className="py-3 px-4 border-b bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="relative">
                      <Command className="h-4 w-4 text-primary" />
                      {isProcessing && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {language === 'ar' ? 'مركز أوامر Nova' : 'Nova Command Center'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {isProcessing 
                        ? (language === 'ar' ? 'يعالج...' : 'Processing...') 
                        : (language === 'ar' ? 'جاهز' : 'Ready')}
                    </Badge>
                    {showCodePanel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCodePanel(false)}
                        data-testid="toggle-code-panel"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 mb-4 ${aiPulse ? 'animate-pulse' : ''}`}>
                        <Sparkles className="h-12 w-12 text-violet-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {language === 'ar' ? 'مرحباً، أنا Nova' : 'Hello, I\'m Nova'}
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md">
                        {language === 'ar' 
                          ? 'أنا مساعدك الذكي لبناء المنصات. اسألني أي شيء أو اختر من الاقتراحات الذكية.'
                          : 'I\'m your AI assistant for building platforms. Ask me anything or choose from smart suggestions.'}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={message.role === 'nova' 
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' 
                            : 'bg-primary text-primary-foreground'}>
                            {message.role === 'nova' 
                              ? <Sparkles className="h-4 w-4" /> 
                              : user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[75%] ${message.role === 'user' ? 'text-end' : 'text-start'}`}>
                          <div className={`rounded-2xl p-4 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : message.status === 'error'
                                ? 'bg-destructive/10 border border-destructive/20'
                                : 'bg-muted/50 border border-border'
                          }`}>
                            {message.status === 'thinking' ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">{message.content}</span>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap" dir={isRTL ? 'rtl' : 'ltr'}>
                                {message.content}
                              </p>
                            )}
                            
                            {message.actions && message.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                                {message.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    data-testid={`action-${action.id}`}
                                  >
                                    {language === 'ar' ? action.labelAr : action.label}
                                    <ArrowRight className={`h-3 w-3 ms-1 ${isRTL ? 'rotate-180' : ''}`} />
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block px-2">
                            {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t bg-muted/30">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'ar' ? 'اكتب أمرك هنا... (Enter للإرسال)' : 'Type your command here... (Enter to send)'}
                    className="min-h-[50px] max-h-[120px] resize-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                    disabled={isProcessing}
                    data-testid="nova-command-input"
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isProcessing}
                    className="h-[50px] w-[50px] bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    data-testid="send-command-button"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="w-72 flex flex-col gap-4 flex-shrink-0">
            <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  {language === 'ar' ? 'المقاييس الحية' : 'Live Metrics'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Cpu className="h-3 w-3" />
                      CPU
                    </span>
                    <span className="text-sm font-medium">{realtimeMetrics?.cpuUsage ?? 0}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${realtimeMetrics?.cpuUsage ?? 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Server className="h-3 w-3" />
                      {language === 'ar' ? 'الذاكرة' : 'Memory'}
                    </span>
                    <span className="text-sm font-medium">{realtimeMetrics?.memoryUsage ?? 0}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${realtimeMetrics?.memoryUsage ?? 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <Users className="h-4 w-4 mx-auto text-violet-500 mb-1" />
                    <p className="text-lg font-bold">{realtimeMetrics?.activeConnections ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'ar' ? 'اتصالات' : 'Connections'}
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-background/50">
                    <Gauge className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                    <p className="text-lg font-bold">{realtimeMetrics?.requestsPerMinute ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'ar' ? 'طلب/د' : 'Req/min'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 overflow-hidden">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-blue-500" />
                  {language === 'ar' ? 'سجل البناء' : 'Build Log'}
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-48px)]">
                <div className="p-3 space-y-2">
                  {buildSteps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">
                        {language === 'ar' ? 'لا توجد عمليات بناء' : 'No build operations'}
                      </p>
                    </div>
                  ) : (
                    buildSteps.map((step, idx) => (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          step.status === 'active' ? 'bg-blue-500/10' :
                          step.status === 'complete' ? 'bg-green-500/10' :
                          step.status === 'error' ? 'bg-red-500/10' :
                          'bg-muted/50'
                        }`}
                      >
                        {step.status === 'active' ? (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        ) : step.status === 'complete' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : step.status === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs flex-1">
                          {language === 'ar' ? step.nameAr : step.name}
                        </span>
                        {step.progress !== undefined && (
                          <span className="text-xs text-muted-foreground">{step.progress}%</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>

            {showCodePanel && codePreview && (
              <Card className="h-48 overflow-hidden">
                <CardHeader className="py-2 px-3 border-b">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <FileCode className="h-3 w-3" />
                    {language === 'ar' ? 'معاينة الكود' : 'Code Preview'}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="h-[calc(100%-32px)]">
                  <pre className="p-3 text-xs font-mono text-muted-foreground">
                    {codePreview}
                  </pre>
                </ScrollArea>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
