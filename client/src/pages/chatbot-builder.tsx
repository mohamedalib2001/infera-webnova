import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Bot, MessageSquare, Settings, Palette, Code, Play, 
  Save, Copy, Sparkles, Globe, Zap, Brain, Loader2,
  Plus, Trash2, GripVertical, ChevronRight
} from "lucide-react";
import { Link, Redirect } from "wouter";
import type { Chatbot } from "@shared/schema";

interface ChatbotConfig {
  name: string;
  nameAr: string;
  welcomeMessage: string;
  welcomeMessageAr: string;
  systemPrompt: string;
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  model: string;
  temperature: number;
  maxTokens: number;
  suggestedQuestions: string[];
  isActive: boolean;
}

const defaultConfig: ChatbotConfig = {
  name: "AI Assistant",
  nameAr: "المساعد الذكي",
  welcomeMessage: "Hi! How can I help you today?",
  welcomeMessageAr: "مرحباً! كيف يمكنني مساعدتك اليوم؟",
  systemPrompt: "You are a helpful assistant for this sovereign platform. Answer questions clearly and concisely.",
  primaryColor: "#8B5CF6",
  position: "bottom-right",
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 1000,
  suggestedQuestions: ["What services do you offer?", "How can I contact support?", "Tell me about pricing"],
  isActive: true,
};

export default function ChatbotBuilder() {
  const { language, isRtl } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [testMessages, setTestMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [newQuestion, setNewQuestion] = useState("");

  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  const { data: chatbots, isLoading: chatbotsLoading } = useQuery<Chatbot[]>({
    queryKey: ["/api/chatbots"],
    enabled: isAuthenticated,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ChatbotConfig) => {
      return apiRequest("POST", "/api/chatbots", data);
    },
    onSuccess: () => {
      toast({ title: tr("تم حفظ الروبوت بنجاح", "Chatbot saved successfully") });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbots"] });
    },
    onError: () => {
      toast({ title: tr("فشل في حفظ الروبوت", "Failed to save chatbot"), variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chatbots/test", {
        message,
        systemPrompt: config.systemPrompt,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setTestMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: () => {
      toast({ title: tr("فشل في اختبار الروبوت", "Failed to test chatbot"), variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const handleSendTest = () => {
    if (!testMessage.trim()) return;
    setTestMessages(prev => [...prev, { role: "user", content: testMessage }]);
    testMutation.mutate(testMessage);
    setTestMessage("");
  };

  const addSuggestedQuestion = () => {
    if (newQuestion.trim()) {
      setConfig(prev => ({
        ...prev,
        suggestedQuestions: [...prev.suggestedQuestions, newQuestion.trim()],
      }));
      setNewQuestion("");
    }
  };

  const removeSuggestedQuestion = (index: number) => {
    setConfig(prev => ({
      ...prev,
      suggestedQuestions: prev.suggestedQuestions.filter((_, i) => i !== index),
    }));
  };

  const generateEmbedCode = () => {
    return `<script src="https://webnova.infera.ai/chatbot.js" data-chatbot-id="YOUR_CHATBOT_ID"></script>`;
  };

  const colorOptions = [
    { value: "#8B5CF6", label: tr("بنفسجي", "Purple") },
    { value: "#3B82F6", label: tr("أزرق", "Blue") },
    { value: "#10B981", label: tr("أخضر", "Green") },
    { value: "#F59E0B", label: tr("برتقالي", "Orange") },
    { value: "#EF4444", label: tr("أحمر", "Red") },
    { value: "#EC4899", label: tr("وردي", "Pink") },
  ];

  const modelOptions = [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  ];

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="chatbot-title">
            {tr("منشئ الروبوتات الذكية", "AI Chatbot Builder")}
          </h1>
          <p className="text-muted-foreground">
            {tr("أنشئ روبوت محادثة ذكي لمنصتك", "Create an AI chatbot for your platform")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {tr("أساسي", "Basic")}
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Brain className="h-4 w-4" />
                {tr("الذكاء", "AI")}
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                {tr("المظهر", "Appearance")}
              </TabsTrigger>
              <TabsTrigger value="embed" className="gap-2">
                <Code className="h-4 w-4" />
                {tr("التضمين", "Embed")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>{tr("الإعدادات الأساسية", "Basic Settings")}</CardTitle>
                  <CardDescription>
                    {tr("تكوين الاسم والرسائل الترحيبية", "Configure name and welcome messages")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tr("الاسم (إنجليزي)", "Name (English)")}</Label>
                      <Input
                        value={config.name}
                        onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="AI Assistant"
                        data-testid="input-chatbot-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tr("الاسم (عربي)", "Name (Arabic)")}</Label>
                      <Input
                        value={config.nameAr}
                        onChange={(e) => setConfig(prev => ({ ...prev, nameAr: e.target.value }))}
                        placeholder="المساعد الذكي"
                        dir="rtl"
                        data-testid="input-chatbot-name-ar"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tr("رسالة الترحيب (إنجليزي)", "Welcome Message (English)")}</Label>
                      <Textarea
                        value={config.welcomeMessage}
                        onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        placeholder="Hi! How can I help you today?"
                        data-testid="input-welcome-message"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tr("رسالة الترحيب (عربي)", "Welcome Message (Arabic)")}</Label>
                      <Textarea
                        value={config.welcomeMessageAr}
                        onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessageAr: e.target.value }))}
                        placeholder="مرحباً! كيف يمكنني مساعدتك اليوم؟"
                        dir="rtl"
                        data-testid="input-welcome-message-ar"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>{tr("الأسئلة المقترحة", "Suggested Questions")}</Label>
                    <div className="space-y-2">
                      {config.suggestedQuestions.map((q, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 text-sm">{q}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSuggestedQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder={tr("أضف سؤالاً جديداً...", "Add a new question...")}
                        onKeyDown={(e) => e.key === "Enter" && addSuggestedQuestion()}
                      />
                      <Button variant="outline" onClick={addSuggestedQuestion}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {tr("إعدادات الذكاء الاصطناعي", "AI Settings")}
                  </CardTitle>
                  <CardDescription>
                    {tr("تخصيص سلوك وقدرات الروبوت", "Customize the chatbot behavior and capabilities")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{tr("تعليمات النظام", "System Prompt")}</Label>
                    <Textarea
                      value={config.systemPrompt}
                      onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="You are a helpful assistant..."
                      rows={5}
                      data-testid="input-system-prompt"
                    />
                    <p className="text-xs text-muted-foreground">
                      {tr(
                        "هذه التعليمات تحدد شخصية الروبوت وكيفية تصرفه",
                        "These instructions define the chatbot's personality and behavior"
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{tr("نموذج AI", "AI Model")}</Label>
                      <Select
                        value={config.model}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
                      >
                        <SelectTrigger data-testid="select-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {modelOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{tr("الحد الأقصى للرموز", "Max Tokens")}</Label>
                      <Input
                        type="number"
                        value={config.maxTokens}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        min={100}
                        max={4000}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{tr("درجة الإبداعية", "Temperature")}: {config.temperature}</Label>
                    </div>
                    <Slider
                      value={[config.temperature]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, temperature: value }))}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{tr("دقيق", "Precise")}</span>
                      <span>{tr("متوازن", "Balanced")}</span>
                      <span>{tr("إبداعي", "Creative")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>{tr("مظهر الروبوت", "Chatbot Appearance")}</CardTitle>
                  <CardDescription>
                    {tr("تخصيص ألوان وموقع الروبوت", "Customize colors and position")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>{tr("اللون الرئيسي", "Primary Color")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setConfig(prev => ({ ...prev, primaryColor: color.value }))}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            config.primaryColor === color.value ? "border-foreground scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                      <Input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 p-0 border-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{tr("موقع الروبوت", "Widget Position")}</Label>
                    <Select
                      value={config.position}
                      onValueChange={(value: "bottom-right" | "bottom-left") => 
                        setConfig(prev => ({ ...prev, position: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">
                          {tr("أسفل اليمين", "Bottom Right")}
                        </SelectItem>
                        <SelectItem value="bottom-left">
                          {tr("أسفل اليسار", "Bottom Left")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{tr("تفعيل الروبوت", "Enable Chatbot")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {tr("إظهار الروبوت للزوار", "Show chatbot to visitors")}
                      </p>
                    </div>
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="embed">
              <Card>
                <CardHeader>
                  <CardTitle>{tr("كود التضمين", "Embed Code")}</CardTitle>
                  <CardDescription>
                    {tr("انسخ هذا الكود وأضفه لمنصتك", "Copy this code and add it to your platform")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 end-2"
                      onClick={() => {
                        navigator.clipboard.writeText(generateEmbedCode());
                        toast({ title: tr("تم النسخ", "Copied!") });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {tr("كيفية الإضافة", "How to Add")}
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>{tr("انسخ الكود أعلاه", "Copy the code above")}</li>
                      <li>{tr("أضفه قبل علامة </body> في منصتك", "Add it before the </body> tag in your platform")}</li>
                      <li>{tr("استبدل YOUR_CHATBOT_ID بمعرف الروبوت", "Replace YOUR_CHATBOT_ID with your chatbot ID")}</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfig(defaultConfig)}
            >
              {tr("إعادة تعيين", "Reset")}
            </Button>
            <Button
              onClick={() => saveMutation.mutate(config)}
              disabled={saveMutation.isPending}
              data-testid="button-save-chatbot"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 me-2" />
              )}
              {tr("حفظ الروبوت", "Save Chatbot")}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  {tr("اختبار الروبوت", "Test Chatbot")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestMessages([])}
                >
                  {tr("مسح", "Clear")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="h-[400px] rounded-lg border flex flex-col"
                style={{ "--chatbot-color": config.primaryColor } as React.CSSProperties}
              >
                <div 
                  className="p-3 text-white rounded-t-lg flex items-center gap-2"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <Bot className="h-5 w-5" />
                  <span className="font-medium">
                    {language === "ar" ? config.nameAr : config.name}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">
                        {language === "ar" ? config.welcomeMessageAr : config.welcomeMessage}
                      </p>
                    </div>
                  </div>

                  {testMessages.map((msg, index) => (
                    <div key={index} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "assistant" && (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div 
                        className={`rounded-lg p-3 max-w-[80%] ${
                          msg.role === "user" 
                            ? "text-white" 
                            : "bg-muted"
                        }`}
                        style={msg.role === "user" ? { backgroundColor: config.primaryColor } : {}}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {testMutation.isPending && (
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder={tr("اكتب رسالة...", "Type a message...")}
                      onKeyDown={(e) => e.key === "Enter" && handleSendTest()}
                      disabled={testMutation.isPending}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendTest}
                      disabled={testMutation.isPending || !testMessage.trim()}
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
