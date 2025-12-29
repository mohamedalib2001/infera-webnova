import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Undo2, 
  Sparkles, 
  Shield, 
  Zap, 
  Database,
  Check,
  AlertTriangle,
  History,
  Wand2,
  RefreshCw
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SmartCustomizationPanelProps {
  architecture: any;
  onArchitectureChange: (arch: any) => void;
  language?: "ar" | "en";
}

interface CommandResult {
  success: boolean;
  action: string;
  actionAr: string;
  changes: Array<{
    type: string;
    target: string;
    path: string;
    description: string;
    descriptionAr: string;
  }>;
  updatedArchitecture: any;
  explanation: string;
  explanationAr: string;
}

interface Suggestion {
  id: string;
  type: string;
  priority: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  command: string;
  autoApply: boolean;
}

export function SmartCustomizationPanel({ 
  architecture, 
  onArchitectureChange,
  language = "ar" 
}: SmartCustomizationPanelProps) {
  const [command, setCommand] = useState("");
  const { toast } = useToast();
  const isArabic = language === "ar";

  const historyQuery = useQuery<{ history: CommandResult[] }>({
    queryKey: ["/api/customization/history"]
  });
  const history = historyQuery.data?.history || [];

  const processCommand = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await apiRequest("POST", "/api/customization/command", {
        command: cmd,
        architecture
      });
      return res.json();
    },
    onSuccess: (result: CommandResult) => {
      if (result.success) {
        onArchitectureChange(result.updatedArchitecture);
        queryClient.invalidateQueries({ queryKey: ["/api/customization/history"] });
        toast({
          title: isArabic ? "تم التنفيذ" : "Executed",
          description: isArabic ? result.actionAr : result.action
        });
      } else {
        toast({
          title: isArabic ? "فشل" : "Failed",
          description: isArabic ? result.explanationAr : result.explanation,
          variant: "destructive"
        });
      }
      setCommand("");
    }
  });

  const getSuggestions = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customization/suggestions", { architecture });
      return res.json();
    }
  });

  const applyDeepModification = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", "/api/customization/deep-modify", {
        modification: { type },
        architecture
      });
      return res.json();
    },
    onSuccess: (result: CommandResult) => {
      if (result.success) {
        onArchitectureChange(result.updatedArchitecture);
        queryClient.invalidateQueries({ queryKey: ["/api/customization/history"] });
        toast({
          title: isArabic ? "تم التعديل العميق" : "Deep Modification Applied",
          description: isArabic ? result.actionAr : result.action
        });
      }
    }
  });

  const undoCommand = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customization/undo", {});
      return res.json();
    },
    onSuccess: (result) => {
      if (result.currentArchitecture) {
        onArchitectureChange(result.currentArchitecture);
        queryClient.invalidateQueries({ queryKey: ["/api/customization/history"] });
        toast({
          title: isArabic ? "تم التراجع" : "Undone",
          description: isArabic ? "تم التراجع عن آخر تعديل" : "Last change reverted"
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      processCommand.mutate(command.trim());
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    processCommand.mutate(suggestion.command);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security": return <Shield className="w-4 h-4" />;
      case "performance": return <Zap className="w-4 h-4" />;
      case "data-integrity": return <Database className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const quickCommands = [
    { label: isArabic ? "أضف حقل تاريخ" : "Add date field", command: "أضف حقل تاريخ الإنشاء لجميع الكيانات" },
    { label: isArabic ? "أضف صلاحيات" : "Add permissions", command: "أضف صلاحيات القراءة والكتابة للمستخدمين" },
    { label: isArabic ? "أضف تحقق" : "Add validation", command: "أضف تحقق من صحة البريد الإلكتروني" },
    { label: isArabic ? "أضف علاقة" : "Add relation", command: "أضف علاقة بين المستخدم والطلبات" }
  ];

  const deepModifications = [
    { type: "secure", label: isArabic ? "تأمين البنية" : "Secure Architecture", icon: Shield },
    { type: "optimize", label: isArabic ? "تحسين الأداء" : "Optimize Performance", icon: Zap },
    { type: "normalize", label: isArabic ? "تطبيع البيانات" : "Normalize Data", icon: Database },
    { type: "restructure", label: isArabic ? "إعادة الهيكلة" : "Restructure", icon: RefreshCw }
  ];

  return (
    <Card className="h-full flex flex-col" data-testid="smart-customization-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          {isArabic ? "محرك التخصيص الذكي" : "Smart Customization Engine"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={isArabic ? 'اكتب أمرًا... مثل: "أضف حقل تاريخ هنا"' : 'Type a command... e.g., "Add date field here"'}
            className="flex-1"
            dir={isArabic ? "rtl" : "ltr"}
            data-testid="input-command"
          />
          <Button 
            type="submit" 
            disabled={!command.trim() || processCommand.isPending}
            data-testid="button-execute-command"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => undoCommand.mutate()}
            disabled={history.length === 0 || undoCommand.isPending}
            data-testid="button-undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {quickCommands.map((qc, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setCommand(qc.command)}
              data-testid={`button-quick-command-${i}`}
            >
              {qc.label}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="modifications" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="modifications" data-testid="tab-modifications">
              {isArabic ? "تعديلات عميقة" : "Deep Mods"}
            </TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">
              {isArabic ? "مقترحات" : "Suggestions"}
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              {isArabic ? "السجل" : "History"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modifications" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 gap-3 p-1">
                {deepModifications.map((mod) => (
                  <Card 
                    key={mod.type} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => applyDeepModification.mutate(mod.type)}
                    data-testid={`card-modification-${mod.type}`}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                      <mod.icon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm font-medium">{mod.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions" className="flex-1 overflow-hidden">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => getSuggestions.mutate()}
                disabled={getSuggestions.isPending}
                data-testid="button-generate-suggestions"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {isArabic ? "توليد مقترحات" : "Generate"}
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <div className="space-y-2 p-1">
                {getSuggestions.data?.suggestions?.map((suggestion: Suggestion) => (
                  <Card key={suggestion.id} className="p-3" data-testid={`card-suggestion-${suggestion.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.type)}
                        <span className="font-medium text-sm">
                          {isArabic ? suggestion.titleAr : suggestion.title}
                        </span>
                      </div>
                      <Badge variant={getPriorityColor(suggestion.priority) as any}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? suggestion.descriptionAr : suggestion.description}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => applySuggestion(suggestion)}
                      data-testid={`button-apply-suggestion-${suggestion.id}`}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      {isArabic ? "تطبيق" : "Apply"}
                    </Button>
                  </Card>
                ))}
                {!getSuggestions.data?.suggestions?.length && (
                  <div className="text-center text-muted-foreground py-8">
                    {isArabic ? "اضغط توليد للحصول على مقترحات" : "Click Generate for suggestions"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-1">
                {history.map((item, i) => (
                  <Card key={i} className="p-3" data-testid={`card-history-${i}`}>
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium">
                        {isArabic ? item.actionAr : item.action}
                      </span>
                    </div>
                    {item.changes.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.changes.slice(0, 3).map((change, j) => (
                          <div key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px]">{change.type}</Badge>
                            {isArabic ? change.descriptionAr : change.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
                {history.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {isArabic ? "لا يوجد سجل" : "No history yet"}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
