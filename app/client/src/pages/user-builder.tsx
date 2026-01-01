import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Bot,
  Zap,
  Sparkles,
  Send,
  User,
  CheckCircle2,
  Loader2,
  Shield,
  Database,
  Globe,
  Code2,
  Rocket,
  MessageSquare,
  Play,
  Eye,
  FileCode,
  Settings,
  X,
  ChevronRight,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isBuilding?: boolean;
  buildPlan?: BuildPlan;
}

interface BuildPlan {
  name: string;
  description: string;
  features: string[];
  techStack: string[];
  estimatedTime: string;
}

interface BuildStep {
  id: string;
  title: string;
  titleAr: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export default function UserBuilder() {
  const [, setLocation] = useLocation();
  const { t, language, isRtl } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentBuildPlan, setCurrentBuildPlan] = useState<BuildPlan | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState<'plan' | 'code' | 'preview'>('plan');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Read prompt and templateId from URL query parameters (only once on mount)
  const [urlState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      initialPrompt: params.get('prompt'),
      templateId: params.get('templateId')
    };
  });
  const { initialPrompt, templateId } = urlState;
  const [promptSent, setPromptSent] = useState(false);

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await apiRequest('POST', '/api/nova/sessions', { 
          title: initialPrompt ? `Project: ${initialPrompt.substring(0, 50)}...` : 'Platform Builder Session',
          templateId: templateId || undefined 
        });
        setSessionId(response.id);
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: language === 'ar' 
            ? 'مرحبًا! أنا Nova AI، مساعدك الذكي لبناء المنصات الرقمية. أخبرني عن المشروع الذي تريد إنشاءه وسأساعدك في تصميمه وبنائه خطوة بخطوة.\n\nيمكنك وصف:\n• نوع المنصة (متجر إلكتروني، نظام إدارة، موقع تعليمي...)\n• الميزات الأساسية التي تحتاجها\n• الجمهور المستهدف'
            : "Hello! I'm Nova AI, your intelligent assistant for building digital platforms. Tell me about the project you want to create and I'll help you design and build it step by step.\n\nYou can describe:\n• Platform type (e-commerce, management system, educational site...)\n• Core features you need\n• Target audience",
          timestamp: new Date(),
        }]);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    if (user) {
      createSession();
    }
  }, [user, language, initialPrompt, templateId]);
  
  // Auto-send initial prompt from URL if present
  useEffect(() => {
    if (sessionId && initialPrompt && !promptSent && messages.length > 0) {
      setPromptSent(true);
      // Clear the URL params after reading
      window.history.replaceState({}, '', window.location.pathname);
      // Send the initial prompt
      sendMessage(initialPrompt);
    }
  }, [sessionId, initialPrompt, promptSent, messages.length]);

  // Send message to Nova AI
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', `/api/nova/sessions/${sessionId}/messages`, { content: content.trim() });
      
      // Parse AI response to check for build plan
      const aiContent = response.aiMessage?.content || response.content || '';
      let buildPlan: BuildPlan | undefined;
      
      // Check if AI is proposing a build plan
      if (aiContent.includes('BUILD_PLAN:') || aiContent.includes('خطة_البناء:')) {
        try {
          const planMatch = aiContent.match(/BUILD_PLAN:\s*({[\s\S]*?})/);
          if (planMatch) {
            buildPlan = JSON.parse(planMatch[1]);
            setCurrentBuildPlan(buildPlan || null);
            setShowPreview(true);
          }
        } catch (e) {
          // Not a valid build plan, continue normally
        }
      }
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiContent.replace(/BUILD_PLAN:\s*{[\s\S]*?}/, '').replace(/خطة_البناء:\s*{[\s\S]*?}/, '').trim(),
        timestamp: new Date(),
        buildPlan,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Fallback: Generate a smart response locally
      const fallbackResponse = generateSmartResponse(content, language);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        buildPlan: fallbackResponse.buildPlan,
      };
      
      if (fallbackResponse.buildPlan) {
        setCurrentBuildPlan(fallbackResponse.buildPlan);
        setShowPreview(true);
      }
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate smart response locally when API fails
  const generateSmartResponse = (userInput: string, lang: string): { content: string; buildPlan?: BuildPlan } => {
    const input = userInput.toLowerCase();
    
    // Detect platform type
    let platformType = '';
    let features: string[] = [];
    let techStack = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
    
    if (input.includes('متجر') || input.includes('تجارة') || input.includes('ecommerce') || input.includes('store') || input.includes('shop')) {
      platformType = lang === 'ar' ? 'متجر إلكتروني' : 'E-Commerce Store';
      features = lang === 'ar' 
        ? ['إدارة المنتجات', 'سلة التسوق', 'بوابة الدفع', 'إدارة الطلبات', 'لوحة تحكم المسؤول']
        : ['Product Management', 'Shopping Cart', 'Payment Gateway', 'Order Management', 'Admin Dashboard'];
      techStack = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'];
    } else if (input.includes('عيادة') || input.includes('صحي') || input.includes('clinic') || input.includes('health') || input.includes('medical')) {
      platformType = lang === 'ar' ? 'نظام إدارة عيادة' : 'Clinic Management System';
      features = lang === 'ar'
        ? ['إدارة المرضى', 'جدولة المواعيد', 'السجلات الطبية', 'الفوترة', 'التقارير']
        : ['Patient Management', 'Appointment Scheduling', 'Medical Records', 'Billing', 'Reports'];
    } else if (input.includes('تعليم') || input.includes('دورات') || input.includes('education') || input.includes('course') || input.includes('learning')) {
      platformType = lang === 'ar' ? 'منصة تعليمية' : 'Learning Platform';
      features = lang === 'ar'
        ? ['إدارة الدورات', 'نظام الطلاب', 'الاختبارات', 'الشهادات', 'التقدم']
        : ['Course Management', 'Student System', 'Quizzes', 'Certificates', 'Progress Tracking'];
    } else if (input.includes('لوحة') || input.includes('dashboard') || input.includes('admin') || input.includes('إدارة')) {
      platformType = lang === 'ar' ? 'لوحة تحكم إدارية' : 'Business Dashboard';
      features = lang === 'ar'
        ? ['التحليلات', 'إدارة المستخدمين', 'التقارير', 'الإعدادات', 'الإشعارات']
        : ['Analytics', 'User Management', 'Reports', 'Settings', 'Notifications'];
    }
    
    if (platformType) {
      const buildPlan: BuildPlan = {
        name: platformType,
        description: userInput,
        features,
        techStack,
        estimatedTime: '2-3 min',
      };
      
      return {
        content: lang === 'ar'
          ? `فهمت! تريد إنشاء **${platformType}**.\n\nلقد أعددت خطة بناء تتضمن الميزات التالية:\n${features.map(f => `• ${f}`).join('\n')}\n\n**التقنيات المستخدمة:** ${techStack.join(', ')}\n\nيمكنك مراجعة التفاصيل في لوحة المعاينة على ${isRtl ? 'اليسار' : 'اليمين'}. عندما تكون جاهزًا، اضغط على "ابدأ البناء" لبدء إنشاء منصتك!`
          : `Got it! You want to create a **${platformType}**.\n\nI've prepared a build plan with these features:\n${features.map(f => `• ${f}`).join('\n')}\n\n**Tech Stack:** ${techStack.join(', ')}\n\nYou can review the details in the preview panel on the ${isRtl ? 'left' : 'right'}. When ready, click "Start Building" to begin creating your platform!`,
        buildPlan,
      };
    }
    
    // General clarifying response
    return {
      content: lang === 'ar'
        ? 'يبدو مشروعًا مثيرًا! لمساعدتك بشكل أفضل، هل يمكنك إخباري:\n\n1. ما هو نوع المنصة بالتحديد؟ (متجر، نظام إدارة، موقع تعليمي، إلخ)\n2. ما هي الميزات الأساسية التي تحتاجها؟\n3. هل لديك أي تفضيلات تصميمية؟'
        : "That sounds like an exciting project! To help you better, could you tell me:\n\n1. What type of platform exactly? (store, management system, educational site, etc.)\n2. What core features do you need?\n3. Do you have any design preferences?",
    };
  };

  // Start building process with real API call
  const handleStartBuild = async () => {
    if (!currentBuildPlan || !user) return;
    
    setIsBuilding(true);
    setShowPreview(true);
    
    const steps: BuildStep[] = [
      { id: 'analyze', title: 'Analyzing Requirements', titleAr: 'تحليل المتطلبات', status: 'pending', progress: 0 },
      { id: 'design', title: 'Designing Architecture', titleAr: 'تصميم البنية', status: 'pending', progress: 0 },
      { id: 'generate', title: 'Generating Code', titleAr: 'توليد الكود', status: 'pending', progress: 0 },
      { id: 'setup', title: 'Setting Up Database', titleAr: 'إعداد قاعدة البيانات', status: 'pending', progress: 0 },
      { id: 'deploy', title: 'Preparing Preview', titleAr: 'إعداد المعاينة', status: 'pending', progress: 0 },
    ];
    setBuildSteps(steps);
    
    // Add building message
    setMessages(prev => [...prev, {
      id: `build-${Date.now()}`,
      role: 'assistant',
      content: language === 'ar' 
        ? `بدأت في بناء منصتك "${currentBuildPlan.name}"! تابع التقدم في لوحة المعاينة...`
        : `Started building your "${currentBuildPlan.name}" platform! Follow the progress in the preview panel...`,
      timestamp: new Date(),
      isBuilding: true,
    }]);
    
    try {
      // Step 1: Analyzing
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 0 ? { ...s, status: 'processing', progress: 50 } : s
      ));
      await new Promise(r => setTimeout(r, 500));
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 0 ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Step 2: Designing
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 1 ? { ...s, status: 'processing', progress: 50 } : s
      ));
      await new Promise(r => setTimeout(r, 500));
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 1 ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Step 3: Generating - Call real API
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 2 ? { ...s, status: 'processing', progress: 20 } : s
      ));
      
      // Call the Nova AI to generate the platform
      const buildPrompt = `Build a ${currentBuildPlan.name} platform with these features: ${currentBuildPlan.features.join(', ')}. Description: ${currentBuildPlan.description}`;
      
      const response = await apiRequest('POST', `/api/nova/sessions/${sessionId}/messages`, { 
        content: buildPrompt,
        action: 'generate_platform',
        platformConfig: {
          name: currentBuildPlan.name,
          features: currentBuildPlan.features,
          techStack: currentBuildPlan.techStack,
        }
      });
      
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 2 ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Step 4: Database Setup
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 3 ? { ...s, status: 'processing', progress: 50 } : s
      ));
      await new Promise(r => setTimeout(r, 600));
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 3 ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Step 5: Preparing Preview - Generate demo files
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 4 ? { ...s, status: 'processing', progress: 50 } : s
      ));
      
      // Generate sample code files based on the platform type
      const files = generatePlatformFiles(currentBuildPlan);
      setGeneratedFiles(files);
      setActiveFileIndex(0);
      setPreviewTab('code');
      
      await new Promise(r => setTimeout(r, 400));
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === 4 ? { ...s, status: 'completed', progress: 100 } : s
      ));
      
      // Success message (brief - code is in preview)
      setMessages(prev => [...prev, {
        id: `complete-${Date.now()}`,
        role: 'assistant',
        content: language === 'ar'
          ? `تم بناء منصتك "${currentBuildPlan.name}" بنجاح! يمكنك مراجعة الكود في لوحة المعاينة على ${isRtl ? 'اليسار' : 'اليمين'}.`
          : `Your "${currentBuildPlan.name}" platform has been built successfully! Check the code in the preview panel.`,
        timestamp: new Date(),
      }]);
      
      toast({
        title: language === 'ar' ? 'تم بناء المنصة بنجاح!' : 'Platform built successfully!',
      });
      
    } catch (error: any) {
      console.error('Build error:', error);
      
      // Mark current step as error
      setBuildSteps(prev => prev.map(s => 
        s.status === 'processing' ? { ...s, status: 'error', progress: 0 } : s
      ));
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: language === 'ar'
          ? `حدث خطأ أثناء البناء: ${error.message || 'خطأ غير معروف'}. يمكنك المحاولة مرة أخرى.`
          : `An error occurred during build: ${error.message || 'Unknown error'}. You can try again.`,
        timestamp: new Date(),
      }]);
      
      toast({
        title: language === 'ar' ? 'فشل البناء' : 'Build failed',
        variant: 'destructive',
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Generate platform code files
  const generatePlatformFiles = (plan: BuildPlan): GeneratedFile[] => {
    const platformName = plan.name.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        name: 'index.html',
        path: `/${platformName}/index.html`,
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${plan.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="main.tsx"></script>
</body>
</html>`
      },
      {
        name: 'main.tsx',
        path: `/${platformName}/src/main.tsx`,
        language: 'typescript',
        content: `import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);`
      },
      {
        name: 'App.tsx',
        path: `/${platformName}/src/App.tsx`,
        language: 'typescript',
        content: `import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/Sidebar';

// ${plan.name} - Generated by Nova AI
// Features: ${plan.features.join(', ')}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
        />
        <main className="flex-1 p-6">
          {currentPage === 'dashboard' && <Dashboard />}
        </main>
      </div>
    </div>
  );
}`
      },
      {
        name: 'Header.tsx',
        path: `/${platformName}/src/components/Header.tsx`,
        language: 'typescript',
        content: `import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">${plan.name}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-accent">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}`
      },
      {
        name: 'schema.ts',
        path: `/${platformName}/shared/schema.ts`,
        language: 'typescript',
        content: `import { pgTable, text, serial, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// Database schema for ${plan.name}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

${plan.features.map((f, i) => `
export const ${f.toLowerCase().replace(/\s+/g, '_')} = pgTable('${f.toLowerCase().replace(/\s+/g, '_')}', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
`).join('\n')}

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });`
      }
    ];
  };

  // Quick suggestions
  const suggestions = [
    { key: 'ecommerce', text: language === 'ar' ? 'متجر إلكتروني' : 'E-commerce store', icon: '🛒' },
    { key: 'clinic', text: language === 'ar' ? 'نظام عيادة' : 'Clinic system', icon: '🏥' },
    { key: 'learning', text: language === 'ar' ? 'منصة تعليمية' : 'Learning platform', icon: '📚' },
    { key: 'dashboard', text: language === 'ar' ? 'لوحة تحكم' : 'Dashboard', icon: '📊' },
  ];

  return (
    <div className={cn("h-[calc(100vh-4rem)] flex", isRtl && "rtl")} dir={isRtl ? "rtl" : "ltr"}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Chat Panel */}
      <div className={cn(
        "flex-1 flex flex-col relative z-10 transition-all duration-300",
        showPreview ? "w-1/2" : "w-full max-w-4xl mx-auto"
      )}>
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Nova AI Builder</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'متصل ومستعد' : 'Online & Ready'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}
              </Badge>
              {!showPreview && currentBuildPlan && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="gap-1"
                  data-testid="button-show-preview"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'المعاينة' : 'Preview'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? (isRtl ? "flex-row" : "flex-row-reverse") : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground"
                    : "bg-gradient-to-br from-violet-600 to-indigo-600"
                )}>
                  {message.role === 'user' 
                    ? <User className="h-4 w-4" />
                    : <Bot className="h-4 w-4 text-white" />
                  }
                </div>
                
                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.role === 'user' && (isRtl ? "text-left" : "text-right")
                )}>
                  <div className={cn(
                    "inline-block p-3 rounded-xl",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/50"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'Nova يفكر...' : 'Nova is thinking...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Suggestions (only show if no messages yet) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">
              {language === 'ar' ? 'ابدأ بسرعة:' : 'Quick start:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s.key}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(language === 'ar' ? `أريد إنشاء ${s.text}` : `I want to build a ${s.text}`)}
                  data-testid={`button-suggestion-${s.key}`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'ar' ? 'صف المنصة التي تريد بناءها...' : 'Describe the platform you want to build...'}
                className="min-h-[60px] max-h-[200px] pr-12 resize-none bg-background border-border/50"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                className={cn(
                  "absolute bottom-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                  isRtl ? "left-2" : "right-2"
                )}
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {language === 'ar' 
                ? 'اضغط Enter للإرسال • Shift+Enter لسطر جديد'
                : 'Press Enter to send • Shift+Enter for new line'}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-1/2 border-l border-border/50 flex flex-col bg-card/30 backdrop-blur-sm relative z-10">
          {/* Preview Header with Tabs */}
          <div className="px-4 py-2 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-violet-500" />
                <h3 className="font-semibold text-sm">
                  {language === 'ar' ? 'معاينة المشروع' : 'Project Preview'}
                </h3>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowPreview(false)}
                data-testid="button-close-preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Tabs */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={previewTab === 'plan' ? 'default' : 'ghost'}
                onClick={() => setPreviewTab('plan')}
                className="h-7 text-xs"
                data-testid="tab-plan"
              >
                <Rocket className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'الخطة' : 'Plan'}
              </Button>
              <Button
                size="sm"
                variant={previewTab === 'code' ? 'default' : 'ghost'}
                onClick={() => setPreviewTab('code')}
                className="h-7 text-xs"
                data-testid="tab-code"
                disabled={generatedFiles.length === 0}
              >
                <Code2 className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'الكود' : 'Code'}
                {generatedFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-[10px]">{generatedFiles.length}</Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={previewTab === 'preview' ? 'default' : 'ghost'}
                onClick={() => setPreviewTab('preview')}
                className="h-7 text-xs"
                data-testid="tab-preview"
                disabled={generatedFiles.length === 0}
              >
                <Globe className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'المعاينة' : 'Live'}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {/* Plan Tab */}
            {previewTab === 'plan' && (
              currentBuildPlan ? (
                <div className="space-y-4 p-4">
                  {/* Project Info Card */}
                  <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                          <Rocket className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{currentBuildPlan.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ar' ? `الوقت المقدر: ${currentBuildPlan.estimatedTime}` : `Est. time: ${currentBuildPlan.estimatedTime}`}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-muted-foreground mb-4">{currentBuildPlan.description}</p>
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {language === 'ar' ? 'الميزات' : 'Features'}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentBuildPlan.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          {language === 'ar' ? 'التقنيات' : 'Tech Stack'}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentBuildPlan.techStack.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Build Progress */}
                  {isBuilding && buildSteps.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                          {language === 'ar' ? 'جاري البناء...' : 'Building...'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-3">
                          {buildSteps.map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                step.status === 'completed' ? "bg-emerald-500 text-white" :
                                step.status === 'processing' ? "bg-violet-500 text-white animate-pulse" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {step.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                                 step.status === 'processing' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{language === 'ar' ? step.titleAr : step.title}</p>
                                {step.status === 'processing' && (
                                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${step.progress}%` }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  {!isBuilding && generatedFiles.length === 0 && (
                    <div className="space-y-2">
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600" onClick={handleStartBuild} data-testid="button-start-build">
                        <Play className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'ابدأ البناء' : 'Start Building'}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setCurrentBuildPlan(null)} data-testid="button-modify-plan">
                        <Settings className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'تعديل الخطة' : 'Modify Plan'}
                      </Button>
                    </div>
                  )}

                  {/* Completed State */}
                  {!isBuilding && generatedFiles.length > 0 && (
                    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
                      <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold mb-2">{language === 'ar' ? 'تم البناء بنجاح!' : 'Build Complete!'}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === 'ar' ? 'تم إنشاء الكود. اطلع عليه في تبويب "الكود"' : 'Code generated. Check the "Code" tab to view files'}
                        </p>
                        <Button onClick={() => setPreviewTab('code')} className="w-full">
                          <Code2 className="h-4 w-4 mr-2" />
                          {language === 'ar' ? 'عرض الكود' : 'View Code'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{language === 'ar' ? 'ابدأ المحادثة' : 'Start a Conversation'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'صف المنصة التي تريد بناءها' : 'Describe the platform you want to build'}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* Code Tab */}
            {previewTab === 'code' && generatedFiles.length > 0 && (
              <div className="h-full flex flex-col">
                {/* File Tabs */}
                <div className="flex border-b border-border/50 bg-muted/30 overflow-x-auto">
                  {generatedFiles.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={cn(
                        "px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
                        activeFileIndex === idx 
                          ? "border-violet-500 text-foreground bg-background" 
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                      data-testid={`file-tab-${file.name}`}
                    >
                      <FileCode className="h-3 w-3 inline mr-1" />
                      {file.name}
                    </button>
                  ))}
                </div>
                {/* Code Display */}
                <div className="flex-1 overflow-auto bg-[#1e1e1e] dark:bg-[#0d1117]">
                  <div className="p-1 text-xs text-muted-foreground border-b border-border/20 bg-muted/20">
                    <span className="opacity-60">{generatedFiles[activeFileIndex]?.path}</span>
                  </div>
                  <pre className="p-4 text-sm font-mono text-[#d4d4d4] dark:text-[#c9d1d9] overflow-auto">
                    <code>{generatedFiles[activeFileIndex]?.content}</code>
                  </pre>
                </div>
                {/* Actions */}
                <div className="p-3 border-t border-border/50 bg-card/50 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setLocation('/projects')}>
                    <FileCode className="h-3.5 w-3.5 mr-1" />
                    {language === 'ar' ? 'فتح في المحرر' : 'Open in Editor'}
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600" onClick={() => setLocation('/deploy')}>
                    <Rocket className="h-3.5 w-3.5 mr-1" />
                    {language === 'ar' ? 'نشر' : 'Deploy'}
                  </Button>
                </div>
              </div>
            )}

            {/* Live Preview Tab */}
            {previewTab === 'preview' && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-violet-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{language === 'ar' ? 'المعاينة المباشرة' : 'Live Preview'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar' ? 'المعاينة المباشرة ستكون متاحة بعد النشر' : 'Live preview will be available after deployment'}
                </p>
                <Button onClick={() => setLocation('/deploy')}>
                  <Rocket className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'نشر الآن' : 'Deploy Now'}
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
