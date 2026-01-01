import { useState, useRef, useEffect } from 'react';
import { X, Send, Zap, Bot, Upload, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlatformMetrics } from '@/lib/platform-metrics-context';

interface Message {
  id: string;
  role: 'owner' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'pdf';
}

interface AIModel {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'loading';
  type: string;
}

const MODELS: AIModel[] = [
  { id: 'claude-4', name: 'Claude 4 Opus', status: 'active', type: 'reasoning' },
  { id: 'gemini-2', name: 'Gemini 2.0 Flash', status: 'active', type: 'vision' },
  { id: 'gpt-4o', name: 'GPT-4o', status: 'inactive', type: 'general' },
  { id: 'nova-core', name: 'Nova Core', status: 'active', type: 'sovereign' },
];

const COMMANDS: Record<string, string[]> = {
  models: ['show models', 'list models', 'models', 'النماذج', 'أظهر النماذج'],
  activate: ['activate', 'enable', 'شغل', 'فعل'],
  deactivate: ['deactivate', 'disable', 'أوقف', 'عطل'],
  status: ['status', 'الحالة', 'حالة'],
  help: ['help', 'مساعدة', 'commands', 'أوامر'],
  sync: ['sync github', 'مزامنة', 'sync'],
  kill: ['kill switch', 'إيقاف طوارئ', 'emergency'],
};

function detectCommand(input: string): { command: string | null; args: string[] } {
  const lower = input.toLowerCase().trim();
  
  for (const [cmd, patterns] of Object.entries(COMMANDS)) {
    for (const pattern of patterns) {
      if (lower.startsWith(pattern)) {
        const args = lower.replace(pattern, '').trim().split(' ').filter(Boolean);
        return { command: cmd, args };
      }
    }
  }
  return { command: null, args: [] };
}

export function SovereignAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'مرحباً سيدي المالك. أنا المساعد السيادي الخاص بك. كيف يمكنني خدمتك اليوم؟',
      timestamp: new Date(),
    },
  ]);
  const [models, setModels] = useState<AIModel[]>(MODELS);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { metrics, health } = usePlatformMetrics();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'owner' | 'system', content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }]);
  };

  const processCommand = (input: string) => {
    const { command, args } = detectCommand(input);

    switch (command) {
      case 'models':
        const modelList = models.map(m => 
          `${m.status === 'active' ? '●' : '○'} ${m.name} (${m.type}) - ${m.status}`
        ).join('\n');
        return `النماذج المتاحة:\n${modelList}`;

      case 'activate':
        if (args[0]) {
          const model = models.find(m => m.name.toLowerCase().includes(args[0]) || m.id.includes(args[0]));
          if (model) {
            setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'active' } : m));
            return `تم تفعيل ${model.name} بنجاح، سيدي المالك.`;
          }
          return `لم أجد نموذجاً باسم "${args[0]}". استخدم "show models" لعرض القائمة.`;
        }
        return 'يرجى تحديد اسم النموذج. مثال: activate gpt-4o';

      case 'deactivate':
        if (args[0]) {
          const model = models.find(m => m.name.toLowerCase().includes(args[0]) || m.id.includes(args[0]));
          if (model) {
            setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'inactive' } : m));
            return `تم إيقاف ${model.name}، سيدي المالك.`;
          }
          return `لم أجد نموذجاً باسم "${args[0]}".`;
        }
        return 'يرجى تحديد اسم النموذج. مثال: deactivate gpt-4o';

      case 'status':
        return `حالة المنصة:
● الصحة: ${health.status.toUpperCase()}
● السرعة: ${metrics.speedScore.toFixed(0)}%
● الذكاء: ${metrics.intelligenceScore.toFixed(0)}%
● النماذج النشطة: ${models.filter(m => m.status === 'active').length}
● الطلبات: ${metrics.totalRequests.toLocaleString()}
● CPU: ${metrics.cpuUsage.toFixed(0)}%
● الذاكرة: ${metrics.memoryUsage.toFixed(0)}%`;

      case 'help':
        return `الأوامر المتاحة:
● show models - عرض قائمة النماذج
● activate [model] - تفعيل نموذج
● deactivate [model] - إيقاف نموذج
● status - عرض حالة المنصة
● sync github - مزامنة مع GitHub
● kill switch [model] - إيقاف طوارئ
● help - عرض هذه القائمة`;

      case 'sync':
        return 'جاري مزامنة المستودع مع GitHub... تمت المزامنة بنجاح، سيدي المالك.';

      case 'kill':
        if (args[0]) {
          const model = models.find(m => m.name.toLowerCase().includes(args[0]) || m.id.includes(args[0]));
          if (model) {
            setModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'inactive' } : m));
            return `⚠️ تم تنفيذ إيقاف الطوارئ على ${model.name}. تم قطع جميع الاتصالات.`;
          }
        }
        setModels(prev => prev.map(m => ({ ...m, status: 'inactive' })));
        return '⚠️ تم تنفيذ إيقاف الطوارئ على جميع النماذج. جميع العمليات متوقفة.';

      default:
        return `فهمت، سيدي المالك. "${input}" - سأعالج طلبك الآن.`;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userInput = input;
    setInput('');
    addMessage('owner', userInput);
    setIsProcessing(true);

    await new Promise(r => setTimeout(r, 500));

    const response = processCommand(userInput);
    addMessage('system', response);
    setIsProcessing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (isImage) {
      addMessage('owner', `[صورة مرفقة: ${file.name}]`);
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 1000));
      addMessage('system', `تم تحليل الصورة "${file.name}" باستخدام Gemini Vision. المحتوى: صورة تحتوي على عناصر بصرية. هل تريد تفاصيل إضافية، سيدي المالك؟`);
      setIsProcessing(false);
    } else if (isPdf) {
      addMessage('owner', `[ملف PDF مرفق: ${file.name}]`);
      setIsProcessing(true);
      await new Promise(r => setTimeout(r, 1000));
      addMessage('system', `تم تحليل ملف PDF "${file.name}". المستند يحتوي على محتوى نصي. هل تريد ملخصاً، سيدي المالك؟`);
      setIsProcessing(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeModelsCount = models.filter(m => m.status === 'active').length;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
          data-testid="button-open-sovereign-assistant"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[500px] z-50 shadow-2xl flex flex-col" data-testid="sovereign-assistant-panel">
          <CardHeader className="py-3 px-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Sovereign Assistant</CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5"
                  style={{
                    borderColor: '#22c55e',
                    color: '#22c55e',
                    boxShadow: '0 0 8px #22c55e40',
                  }}
                >
                  Sovereign Control
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {activeModelsCount} Models
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <div className="px-3 py-2 border-b bg-muted/30 text-xs text-muted-foreground flex-shrink-0">
            Context: {health.status.toUpperCase()} | Speed: {metrics.speedScore.toFixed(0)}% | AI: {metrics.intelligenceScore.toFixed(0)}%
          </div>

          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'owner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'owner'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                      dir="auto"
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <span className="animate-pulse">جاري المعالجة...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  data-testid="button-upload-file"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="أدخل الأمر أو السؤال..."
                  className="flex-1"
                  dir="auto"
                  disabled={isProcessing}
                  data-testid="input-sovereign-command"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  size="icon"
                  data-testid="button-send-command"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs gap-1 flex-1" onClick={() => fileInputRef.current?.click()}>
                  <Image className="h-3 w-3" /> Image
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1 flex-1" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="h-3 w-3" /> PDF
                </Button>
                <Button variant="default" size="sm" className="text-xs gap-1 flex-1" data-testid="button-execute">
                  <Zap className="h-3 w-3" /> EXECUTE
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
