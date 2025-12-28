import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, Brain, Sparkles, Code, Eye, Play, 
  CheckCircle, Loader2, Terminal, Globe, Database,
  GitBranch, Rocket, FileCode, Server, RefreshCw,
  Smartphone, Monitor, Tablet, ExternalLink, Copy,
  ChevronRight, Zap, Shield, Activity
} from "lucide-react";

interface BuildMessage {
  id: string;
  role: 'user' | 'nova' | 'system';
  content: string;
  timestamp: Date;
  status?: 'thinking' | 'building' | 'complete' | 'error';
  buildProgress?: BuildProgress;
}

interface BuildProgress {
  currentStep: string;
  currentStepAr: string;
  steps: BuildStep[];
  previewUrl?: string;
  githubUrl?: string;
}

interface BuildStep {
  id: string;
  name: string;
  nameAr: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  details?: string;
}

export default function PlatformBuilderPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<BuildMessage[]>([
    {
      id: 'welcome',
      role: 'nova',
      content: language === 'ar' 
        ? 'مرحباً! أنا Nova. صف لي المنصة التي تريد بناءها وسأقوم بإنشائها لك فوراً.\n\nمثال: "أنشئ متجر إلكتروني مع منتجات، سلة شراء، ودفع إلكتروني"'
        : 'Hello! I am Nova. Describe the platform you want to build and I will create it for you instantly.\n\nExample: "Create an e-commerce store with products, cart, and payment system"',
      timestamp: new Date(),
      status: 'complete'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [activeTab, setActiveTab] = useState('preview');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateBuild = async (description: string) => {
    const hasArabic = /[\u0600-\u06FF]/.test(description);
    const lang = hasArabic ? 'ar' : language;
    
    const steps: BuildStep[] = [
      { id: 's1', name: 'Analyzing requirements', nameAr: 'تحليل المتطلبات', status: 'pending' },
      { id: 's2', name: 'Creating project structure', nameAr: 'إنشاء هيكل المشروع', status: 'pending' },
      { id: 's3', name: 'Generating database schema', nameAr: 'توليد مخطط قاعدة البيانات', status: 'pending' },
      { id: 's4', name: 'Building frontend (React)', nameAr: 'بناء الواجهة (React)', status: 'pending' },
      { id: 's5', name: 'Building backend (Node.js)', nameAr: 'بناء الخادم (Node.js)', status: 'pending' },
      { id: 's6', name: 'Deploying to server', nameAr: 'نشر على السيرفر', status: 'pending' },
    ];
    
    setBuildSteps(steps);
    setActiveTab('build');
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBuildSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < i ? 'complete' : idx === i ? 'active' : 'pending'
      })));
      
      const stepMessage: BuildMessage = {
        id: `step-${i}`,
        role: 'system',
        content: lang === 'ar' ? `✓ ${steps[i].nameAr}` : `✓ ${steps[i].name}`,
        timestamp: new Date(),
        status: 'building'
      };
      setMessages(prev => [...prev, stepMessage]);
    }
    
    setBuildSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
    
    const projectName = description.toLowerCase().includes('متجر') || description.toLowerCase().includes('store') 
      ? 'ecommerce-platform' 
      : description.toLowerCase().includes('مدونة') || description.toLowerCase().includes('blog')
      ? 'blog-platform'
      : 'custom-platform';
    
    const mockPreviewUrl = `https://${projectName}.infera.dev`;
    setPreviewUrl(mockPreviewUrl);
    setActiveTab('preview');
    
    setGeneratedCode(`// ${projectName} - Generated by Nova AI
// Frontend: React + Tailwind CSS
// Backend: Node.js + Express
// Database: PostgreSQL

import express from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';

const app = express();

// API Routes
app.get('/api/products', async (req, res) => {
  const products = await db.select().from(products);
  res.json(products);
});

// ... More generated code
`);
    
    return {
      success: true,
      previewUrl: mockPreviewUrl,
      githubUrl: `https://github.com/infera/${projectName}`,
      projectName
    };
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isBuilding) return;
    
    const hasArabic = /[\u0600-\u06FF]/.test(content);
    const lang = hasArabic ? 'ar' : language;
    
    const userMessage: BuildMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsBuilding(true);
    
    const thinkingMessage: BuildMessage = {
      id: (Date.now() + 1).toString(),
      role: 'nova',
      content: lang === 'ar' ? 'جاري تحليل طلبك وبدء البناء...' : 'Analyzing your request and starting build...',
      timestamp: new Date(),
      status: 'thinking',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const result = await simulateBuild(content);
      
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const completionMessage: BuildMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: lang === 'ar' 
          ? `✅ تم بناء المنصة بنجاح!\n\n🔗 رابط المعاينة: ${result.previewUrl}\n📦 GitHub: ${result.githubUrl}\n\nيمكنك الآن إضافة ميزات جديدة أو تعديل المنصة.`
          : `✅ Platform built successfully!\n\n🔗 Preview URL: ${result.previewUrl}\n📦 GitHub: ${result.githubUrl}\n\nYou can now add new features or modify the platform.`,
        timestamp: new Date(),
        status: 'complete',
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      toast({
        title: lang === 'ar' ? 'تم البناء بنجاح' : 'Build Complete',
        description: lang === 'ar' ? 'منصتك جاهزة للمعاينة' : 'Your platform is ready for preview',
      });
      
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const errorMessage: BuildMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: lang === 'ar' 
          ? 'عذراً، حدث خطأ أثناء البناء. حاول مرة أخرى.'
          : 'Sorry, an error occurred during build. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBuilding(false);
    }
  }, [isBuilding, language, toast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full';
    }
  };

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <div className={`flex h-screen bg-background ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`w-[450px] flex flex-col border-${isRTL ? 'l' : 'r'} border-border bg-card/50`}>
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Nova AI Builder</h2>
              <p className="text-xs text-muted-foreground">{t('Ready to build', 'جاهز للبناء')}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? (isRTL ? 'flex-row-reverse' : '') : ''}`}
                >
                  {message.role !== 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${message.role === 'system' ? 'bg-blue-500/20 text-blue-500' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                        {message.role === 'system' ? <Terminal className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`rounded-lg p-3 max-w-[90%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.role === 'system'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm'
                        : 'bg-muted'
                    }`}>
                      {message.status === 'thinking' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{message.content}</span>
                        </div>
                      )}
                      {message.status !== 'thinking' && (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-card/80">
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { icon: Rocket, label: t('E-commerce', 'متجر'), prompt: t('Create an e-commerce store with products, cart, and payments', 'أنشئ متجر إلكتروني مع منتجات وسلة شراء ودفع') },
              { icon: FileCode, label: t('Blog', 'مدونة'), prompt: t('Create a blog with posts, categories, and comments', 'أنشئ مدونة مع مقالات وتصنيفات وتعليقات') },
              { icon: Globe, label: t('Portfolio', 'ملف شخصي'), prompt: t('Create a portfolio website', 'أنشئ موقع ملف شخصي') },
            ].map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(example.prompt)}
                className="text-xs gap-1"
                data-testid={`button-example-${idx}`}
              >
                <example.icon className="w-3 h-3" />
                {example.label}
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('Describe the platform you want to build...', 'صف المنصة التي تريد بناءها...')}
              className="resize-none pr-12 min-h-[80px]"
              disabled={isBuilding}
              data-testid="input-chat"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isBuilding}
              className={`absolute ${isRTL ? 'left-2' : 'right-2'} bottom-2`}
              data-testid="button-send"
            >
              {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-muted/30">
        <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-[300px] grid-cols-3">
              <TabsTrigger value="preview" className="gap-1" data-testid="tab-preview">
                <Eye className="w-4 h-4" />
                {t('Preview', 'معاينة')}
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1" data-testid="tab-code">
                <Code className="w-4 h-4" />
                {t('Code', 'الكود')}
              </TabsTrigger>
              <TabsTrigger value="build" className="gap-1" data-testid="tab-build">
                <Activity className="w-4 h-4" />
                {t('Build', 'البناء')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('desktop')}
                data-testid="button-device-desktop"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('tablet')}
                data-testid="button-device-tablet"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewDevice('mobile')}
                data-testid="button-device-mobile"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            {previewUrl && (
              <Button variant="outline" size="sm" className="gap-1" data-testid="button-open-preview">
                <ExternalLink className="w-3 h-3" />
                {t('Open', 'فتح')}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {activeTab === 'preview' && (
            <div className="h-full flex items-center justify-center">
              {previewUrl ? (
                <div className={`${getDeviceWidth()} h-full bg-white dark:bg-zinc-900 rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300`}>
                  <div className="h-8 bg-muted/50 border-b border-border flex items-center gap-2 px-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-background rounded px-2 py-0.5 text-xs text-muted-foreground text-center">
                        {previewUrl}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="h-[calc(100%-2rem)] bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Rocket className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{t('Platform Preview', 'معاينة المنصة')}</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {t('Your platform is being generated. The preview will appear here once ready.', 'يتم توليد منصتك. ستظهر المعاينة هنا عند الجاهزية.')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('Live Preview', 'المعاينة الحية')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {t('Describe your platform in the chat and watch it come to life here in real-time.', 'صف منصتك في المحادثة وشاهدها تتشكل هنا بشكل حي.')}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="gap-1">
                      <Database className="w-3 h-3" />
                      PostgreSQL
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Server className="w-3 h-3" />
                      Node.js
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Code className="w-3 h-3" />
                      React
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'code' && (
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="h-10 bg-muted/50 border-b border-border flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">generated-code.ts</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 h-7" data-testid="button-copy-code">
                    <Copy className="w-3 h-3" />
                    {t('Copy', 'نسخ')}
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-2.5rem)]">
                  <pre className="p-4 text-sm font-mono text-foreground/90">
                    {generatedCode || t('// Code will appear here after build', '// سيظهر الكود هنا بعد البناء')}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'build' && (
            <Card className="h-full">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t('Build Progress', 'تقدم البناء')}
                </h3>
                
                {buildSteps.length > 0 ? (
                  <div className="space-y-3">
                    {buildSteps.map((step, idx) => (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          step.status === 'active' ? 'border-primary bg-primary/5' :
                          step.status === 'complete' ? 'border-green-500/30 bg-green-500/5' :
                          'border-border bg-muted/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === 'active' ? 'bg-primary text-primary-foreground' :
                          step.status === 'complete' ? 'bg-green-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {step.status === 'active' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : step.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">{idx + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${step.status === 'complete' ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {language === 'ar' ? step.nameAr : step.name}
                          </p>
                        </div>
                        {step.status === 'complete' && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                            {t('Done', 'تم')}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('Build steps will appear here', 'ستظهر خطوات البناء هنا')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {previewUrl && (
          <div className="p-3 border-t border-border bg-card/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t('Deployed', 'تم النشر')}
                </Badge>
                <span className="text-sm text-muted-foreground">{previewUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-github">
                  <GitBranch className="w-3 h-3" />
                  GitHub
                </Button>
                <Button size="sm" className="gap-1" data-testid="button-publish">
                  <Globe className="w-3 h-3" />
                  {t('Publish', 'نشر')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
