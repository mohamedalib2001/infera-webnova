import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Paperclip, 
  MessageSquare, 
  BarChart3, 
  ArrowUp, 
  Loader2,
  X,
  FileImage,
  FileText,
  File,
  Wand2,
  Code,
  Layout
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
  content?: string;
}

interface ChatInputProps {
  onSend: (message: string, attachments?: AttachedFile[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  language?: "ar" | "en";
}

export function ChatInput({ 
  onSend, 
  isLoading = false, 
  placeholder = "Ask AI to create your website...",
  language = "en"
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [chatMode, setChatMode] = useState<"chat" | "generate">("generate");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const t = {
    ar: {
      newProject: "مشروع جديد",
      newWebsite: "موقع ويب جديد",
      newLanding: "صفحة هبوط",
      newPortfolio: "معرض أعمال",
      newEcommerce: "متجر إلكتروني",
      attach: "إرفاق ملف",
      attachImage: "إرفاق صورة",
      attachFile: "إرفاق ملف",
      pasteUrl: "لصق رابط",
      chatMode: "وضع المحادثة",
      generateMode: "وضع التوليد",
      stats: "الإحصائيات",
      projectsCreated: "المشاريع المنشأة",
      totalGenerations: "إجمالي التوليدات",
      avgTime: "متوسط الوقت",
      close: "إغلاق",
      removeFile: "إزالة الملف",
      noStats: "لا توجد إحصائيات بعد",
      fileAdded: "تم إضافة الملف",
      fileRemoved: "تم إزالة الملف",
    },
    en: {
      newProject: "New Project",
      newWebsite: "New Website",
      newLanding: "Landing Page",
      newPortfolio: "Portfolio",
      newEcommerce: "E-commerce Store",
      attach: "Attach File",
      attachImage: "Attach Image",
      attachFile: "Attach File",
      pasteUrl: "Paste URL",
      chatMode: "Chat Mode",
      generateMode: "Generate Mode",
      stats: "Statistics",
      projectsCreated: "Projects Created",
      totalGenerations: "Total Generations",
      avgTime: "Average Time",
      close: "Close",
      removeFile: "Remove file",
      noStats: "No statistics yet",
      fileAdded: "File added",
      fileRemoved: "File removed",
    },
  };

  const txt = t[language];

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const newFile: AttachedFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          size: file.size,
        };

        if (file.type.startsWith("image/")) {
          newFile.preview = event.target?.result as string;
        } else if (file.type.startsWith("text/") || file.name.endsWith(".json") || file.name.endsWith(".md")) {
          newFile.content = event.target?.result as string;
        }

        setAttachments(prev => [...prev, newFile]);
        toast({
          title: txt.fileAdded,
          description: file.name,
        });
      };

      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(f => f.id !== id));
    toast({
      title: txt.fileRemoved,
    });
  };

  const handleNewProject = (type: string) => {
    const prompts: Record<string, { ar: string; en: string }> = {
      website: { ar: "أنشئ موقع ويب احترافي", en: "Create a professional website" },
      landing: { ar: "أنشئ صفحة هبوط جذابة", en: "Create an attractive landing page" },
      portfolio: { ar: "أنشئ معرض أعمال شخصي", en: "Create a personal portfolio" },
      ecommerce: { ar: "أنشئ متجر إلكتروني", en: "Create an e-commerce store" },
    };
    const prompt = prompts[type]?.[language] || prompts.website[language];
    setLocation(`/builder?prompt=${encodeURIComponent(prompt)}`);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-4 w-4" />;
    if (type.startsWith("text/")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />

      <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg">
        {attachments.length > 0 && (
          <div className="px-4 pt-4">
            <ScrollArea className="max-h-24">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-1 px-3 py-2 bg-muted/50 rounded-lg border border-border/50 group max-w-[200px]"
                  >
                    <div className="flex items-center gap-2">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.name} 
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        getFileIcon(file.type)
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => removeAttachment(file.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {file.content && (
                      <div className="text-xs text-muted-foreground bg-background/50 rounded p-1.5 max-h-16 overflow-hidden">
                        <pre className="whitespace-pre-wrap break-all line-clamp-3">{file.content.substring(0, 200)}{file.content.length > 200 ? '...' : ''}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-[150px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
            disabled={isLoading}
            data-testid="input-chat-message"
          />
        </div>
        
        <div className="flex items-center justify-between px-4 pb-4 gap-2">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  data-testid="button-add-new"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>{txt.newProject}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNewProject("website")}>
                  <Layout className="h-4 w-4 mr-2" />
                  {txt.newWebsite}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewProject("landing")}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  {txt.newLanding}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewProject("portfolio")}>
                  <Code className="h-4 w-4 mr-2" />
                  {txt.newPortfolio}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewProject("ecommerce")}>
                  <Layout className="h-4 w-4 mr-2" />
                  {txt.newEcommerce}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  data-testid="button-attach"
                >
                  <Paperclip className="h-5 w-5" />
                  {attachments.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {attachments.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>{txt.attach}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFileSelect("image/*")}>
                  <FileImage className="h-4 w-4 mr-2" />
                  {txt.attachImage}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileSelect(".txt,.json,.md,.html,.css,.js,.ts,.tsx")}>
                  <FileText className="h-4 w-4 mr-2" />
                  {txt.attachFile}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={chatMode === "chat" ? "default" : "outline"}
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setChatMode(chatMode === "chat" ? "generate" : "chat")}
              data-testid="button-chat-mode"
            >
              <MessageSquare className="h-4 w-4" />
              {chatMode === "chat" ? txt.chatMode : txt.generateMode}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setShowStatsDialog(true)}
              data-testid="button-analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {txt.stats}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" ? "إحصائيات استخدام المنصة" : "Platform usage statistics"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground mt-1">{txt.projectsCreated}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">45</p>
              <p className="text-xs text-muted-foreground mt-1">{txt.totalGenerations}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">32s</p>
              <p className="text-xs text-muted-foreground mt-1">{txt.avgTime}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowStatsDialog(false)} className="w-full">
            {txt.close}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
