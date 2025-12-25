import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Loader2,
  Network,
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  Palette,
  Braces,
  FileJson,
} from "lucide-react";
import type { SovereignConversation, GroupPlatform, CodeFile } from "../utils/ide-types";

interface LeftNavigationPaneProps {
  isRtl: boolean;
  conversations: SovereignConversation[] | undefined;
  loadingConversations: boolean;
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  groupPlatforms: GroupPlatform[];
  selectedPlatformId: string | null;
  onPlatformSelect: (id: string) => void;
  codeFiles: CodeFile[];
  activeFileIndex: number;
  setActiveFileIndex: (index: number) => void;
  onCreateConversation: (title: string) => void;
}

export function LeftNavigationPane({
  isRtl,
  conversations,
  loadingConversations,
  selectedConversation,
  setSelectedConversation,
  groupPlatforms,
  selectedPlatformId,
  onPlatformSelect,
  codeFiles,
  activeFileIndex,
  setActiveFileIndex,
  onCreateConversation,
}: LeftNavigationPaneProps) {
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root", "src"]));

  const text = {
    conversations: isRtl ? "المحادثات" : "Conversations",
    newConversation: isRtl ? "محادثة جديدة" : "New Conversation",
    conversationTitle: isRtl ? "عنوان المحادثة" : "Conversation Title",
    create: isRtl ? "إنشاء" : "Create",
    cancel: isRtl ? "إلغاء" : "Cancel",
    noConversations: isRtl ? "لا توجد محادثات" : "No conversations",
    startConversation: isRtl ? "ابدأ محادثة جديدة" : "Start a new conversation",
    files: isRtl ? "الملفات" : "Files",
    messages: isRtl ? "رسالة" : "messages",
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "html": return <FileCode className="h-3.5 w-3.5 text-orange-500" />;
      case "css": return <Palette className="h-3.5 w-3.5 text-blue-500" />;
      case "javascript": return <Braces className="h-3.5 w-3.5 text-yellow-500" />;
      case "json": return <FileJson className="h-3.5 w-3.5 text-green-500" />;
      default: return <FileCode className="h-3.5 w-3.5" />;
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folder)) next.delete(folder);
      else next.add(folder);
      return next;
    });
  };

  const handleCreate = () => {
    if (newConversationTitle.trim()) {
      onCreateConversation(newConversationTitle.trim());
      setNewConversationTitle("");
      setShowNewConversationDialog(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-2 border-b">
        <Select value={selectedPlatformId || "webnova"} onValueChange={onPlatformSelect}>
          <SelectTrigger className="h-8 text-xs bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border-cyan-500/30" data-testid="select-platform-nav">
            <Network className="w-3 h-3 mr-1.5 text-cyan-400" />
            <SelectValue placeholder={isRtl ? "اختر المنصة" : "Select Platform"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webnova" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span>WebNova</span>
                <Badge variant="outline" className="text-[9px] h-4 border-violet-500/30 text-violet-400">ROOT</Badge>
              </div>
            </SelectItem>
            {groupPlatforms.length > 0 && <Separator className="my-1" />}
            {groupPlatforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${platform.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                  <span>{isRtl && platform.nameAr ? platform.nameAr : platform.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{text.conversations}</span>
          <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6" data-testid="button-new-conversation">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{text.newConversation}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={text.conversationTitle}
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                  data-testid="input-conversation-title"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>{text.cancel}</Button>
                  <Button onClick={handleCreate} disabled={!newConversationTitle.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    {text.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations?.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">{text.noConversations}</p>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setShowNewConversationDialog(true)}>
                {text.startConversation}
              </Button>
            </div>
          ) : (
            conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                  selectedConversation === conv.id ? "bg-violet-500/20 text-violet-300" : "hover:bg-muted"
                }`}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {conv.messageCount} {text.messages}
                </div>
              </button>
            ))
          )}
        </div>

        <Separator className="my-2" />

        <div className="p-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">{text.files}</p>
          <div className="space-y-0.5">
            <button
              onClick={() => toggleFolder("root")}
              className="w-full flex items-center gap-1 p-1 rounded text-xs hover:bg-muted"
            >
              {expandedFolders.has("root") ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <Folder className="h-3.5 w-3.5 text-amber-500" />
              <span>project</span>
            </button>
            {expandedFolders.has("root") && codeFiles.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full flex items-center gap-1.5 p-1 pl-6 rounded text-xs transition-colors ${
                  activeFileIndex === idx ? "bg-violet-500/20 text-violet-300" : "hover:bg-muted"
                }`}
                data-testid={`file-${file.name}`}
              >
                {getFileIcon(file.language)}
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
