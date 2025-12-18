import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Wand2,
  Bug,
  MessageSquare,
  Code2,
  Lightbulb,
  Send,
  Loader2,
  Copy,
  FileCode,
  Sparkles
} from "lucide-react";

const translations = {
  ar: {
    title: "مساعد AI Copilot",
    subtitle: "مساعدك الذكي للبرمجة - يكمل الكود ويشرحه ويصلح الأخطاء",
    autocomplete: "إكمال تلقائي",
    explain: "شرح الكود",
    fix: "إصلاح الأخطاء",
    chat: "محادثة",
    inputPlaceholder: "الصق الكود هنا أو اكتب سؤالك...",
    generate: "توليد",
    generating: "جاري التوليد...",
    copy: "نسخ",
    copied: "تم النسخ!",
    suggestions: "اقتراحات",
    result: "النتيجة"
  },
  en: {
    title: "AI Copilot Assistant",
    subtitle: "Your intelligent coding assistant - autocomplete, explain, and fix code",
    autocomplete: "Autocomplete",
    explain: "Explain Code",
    fix: "Fix Errors",
    chat: "Chat",
    inputPlaceholder: "Paste your code here or type your question...",
    generate: "Generate",
    generating: "Generating...",
    copy: "Copy",
    copied: "Copied!",
    suggestions: "Suggestions",
    result: "Result"
  }
};

export default function AICopilot() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("autocomplete");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/copilot/generate", { input, action: activeTab });
      if (!response || !response.success) {
        throw new Error(response?.error || "Generation failed");
      }
      return response;
    },
    onSuccess: (data: any) => {
      setResult(data.result || "");
      toast({ title: language === "ar" ? "تم التوليد بنجاح" : "Generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل التوليد" : "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  const quickActions = [
    { label: language === "ar" ? "أكمل هذه الدالة" : "Complete this function", icon: Wand2 },
    { label: language === "ar" ? "اشرح هذا الكود" : "Explain this code", icon: Lightbulb },
    { label: language === "ar" ? "أصلح الأخطاء" : "Fix the errors", icon: Bug },
    { label: language === "ar" ? "حسّن الأداء" : "Optimize performance", icon: Sparkles },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-copilot-title">
          <Brain className="h-8 w-8 text-violet-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="autocomplete" data-testid="tab-autocomplete">
                  <Wand2 className="h-4 w-4 mr-1" />
                  {t.autocomplete}
                </TabsTrigger>
                <TabsTrigger value="explain" data-testid="tab-explain">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {t.explain}
                </TabsTrigger>
                <TabsTrigger value="fix" data-testid="tab-fix">
                  <Bug className="h-4 w-4 mr-1" />
                  {t.fix}
                </TabsTrigger>
                <TabsTrigger value="chat" data-testid="tab-chat">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {t.chat}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              data-testid="textarea-copilot-input"
            />
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => setInput(input + "\n// " + action.label)}
                  data-testid={`button-quick-${idx}`}
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => generateMutation.mutate()}
              disabled={!input || generateMutation.isPending}
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t.generate}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                {t.result}
              </CardTitle>
              {result && (
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result)} data-testid="button-copy-result">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <ScrollArea className="h-96">
                <pre className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {result}
                </pre>
              </ScrollArea>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileCode className="h-16 w-16 mx-auto mb-4" />
                  <p>{language === "ar" ? "أدخل الكود واضغط توليد" : "Enter code and click Generate"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
