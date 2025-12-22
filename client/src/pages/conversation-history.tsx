import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  MessageSquare, Trash2, Search, Calendar, 
  ArrowLeft, Loader2, MessageCircle, ExternalLink,
  Clock, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SovereignConversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function ConversationHistory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRtl, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const { data: conversations = [], isLoading, refetch } = useQuery<SovereignConversation[]>({
    queryKey: ["/api/conversations"],
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: isRtl ? "تم حذف المحادثة" : "Conversation deleted",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل حذف المحادثة" : "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/conversations");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setDeleteAllOpen(false);
      toast({
        title: isRtl ? "تم حذف جميع المحادثات" : "All conversations deleted",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل حذف المحادثات" : "Failed to delete conversations",
        variant: "destructive",
      });
    },
  });

  const filteredConversations = conversations.filter((conv) => {
    const title = isRtl && conv.titleAr ? conv.titleAr : conv.title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return formatDistanceToNow(d, { 
      addSuffix: true, 
      locale: isRtl ? ar : enUS 
    });
  };

  const handleResumeConversation = (conversationId: string) => {
    setLocation(`/builder?conversation=${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/builder")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">
                {isRtl ? "سجل المحادثات" : "Conversation History"}
              </h1>
            </div>
          </div>

          {conversations.length > 0 && (
            <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  data-testid="button-delete-all"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isRtl ? "حذف الكل" : "Delete All"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {isRtl ? "تأكيد الحذف" : "Confirm Deletion"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRtl 
                      ? "هل أنت متأكد من حذف جميع المحادثات؟ هذا الإجراء لا يمكن التراجع عنه."
                      : "Are you sure you want to delete all conversations? This action cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete-all">
                    {isRtl ? "إلغاء" : "Cancel"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAllMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-delete-all"
                  >
                    {deleteAllMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      isRtl ? "حذف الكل" : "Delete All"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRtl ? "البحث في المحادثات..." : "Search conversations..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-conversations"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchQuery
                  ? (isRtl ? "لا توجد نتائج" : "No results found")
                  : (isRtl ? "لا توجد محادثات" : "No conversations yet")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRtl 
                  ? "ابدأ محادثة جديدة في Builder"
                  : "Start a new conversation in Builder"}
              </p>
              <Button 
                className="mt-4"
                onClick={() => setLocation("/builder")}
                data-testid="button-start-conversation"
              >
                {isRtl ? "ابدأ محادثة" : "Start Conversation"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3">
              {filteredConversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="hover-elevate transition-all cursor-pointer group"
                  data-testid={`card-conversation-${conversation.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => handleResumeConversation(conversation.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                          <h3 className="font-medium truncate">
                            {isRtl && conversation.titleAr 
                              ? conversation.titleAr 
                              : conversation.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(conversation.updatedAt)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {conversation.messageCount} {isRtl ? "رسالة" : "messages"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResumeConversation(conversation.id)}
                          data-testid={`button-resume-${conversation.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {isRtl ? "استئناف" : "Resume"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              data-testid={`button-delete-${conversation.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {isRtl ? "حذف المحادثة" : "Delete Conversation"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isRtl 
                                  ? "هل أنت متأكد من حذف هذه المحادثة؟"
                                  : "Are you sure you want to delete this conversation?"}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {isRtl ? "إلغاء" : "Cancel"}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteConversationMutation.mutate(conversation.id)}
                                className="bg-destructive text-destructive-foreground"
                                data-testid={`button-confirm-delete-${conversation.id}`}
                              >
                                {isRtl ? "حذف" : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
