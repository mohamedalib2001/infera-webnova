import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAIWebSocket } from "@/hooks/use-ai-websocket";
import type { ConversationMessage, SovereignConversation } from "../utils/ide-types";

export function useNovaChat(workspaceId: string, isOwner: boolean, isRtl: boolean) {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // Use streamingText from aiWs hook instead of local state
  const [localMessages, setLocalMessages] = useState<ConversationMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const isCreatingConversationRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect WebSocket - always connect for owners, use streamingText from hook
  const aiWs = useAIWebSocket(isOwner);

  const { data: conversations, isLoading: loadingConversations } = useQuery<SovereignConversation[]>({
    queryKey: ["/api/sovereign-core/conversations", workspaceId],
    enabled: isOwner,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<ConversationMessage[]>({
    queryKey: ["/api/sovereign-core/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation && isOwner,
  });

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (selectedConversation) return selectedConversation;
    if (isCreatingConversationRef.current) return null;

    isCreatingConversationRef.current = true;

    try {
      const title = isRtl
        ? `جلسة ${new Date().toLocaleDateString("ar-SA")} ${new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`
        : `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

      const data = await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });

      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-core/conversations"] });
      isCreatingConversationRef.current = false;
      return data.id;
    } catch (err) {
      isCreatingConversationRef.current = false;
      return null;
    }
  }, [selectedConversation, workspaceId, isRtl]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const userMsg = newMessage.trim();
    setNewMessage("");

    const convId = await ensureConversation();
    if (!convId) {
      toast({
        title: isRtl ? "فشل الحفظ" : "Save Failed",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ConversationMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMessage]);

    try {
      setIsProcessing(true);

      const response = await aiWs.sendMessage(userMsg, isRtl ? "ar" : "en", convId);

      const aiMessage: ConversationMessage = {
        id: `local-ai-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, aiMessage]);
      setIsProcessing(false);

      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-core/conversations", convId, "messages"] });
      setTimeout(() => setLocalMessages([]), 500);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل الاتصال بالذكاء الاصطناعي" : "AI connection failed",
        variant: "destructive",
      });
    }
  }, [newMessage, ensureConversation, aiWs, isRtl, toast]);

  const allMessages = [...(messages || []), ...localMessages];

  return {
    selectedConversation,
    setSelectedConversation,
    newMessage,
    setNewMessage,
    isProcessing,
    streamingMessage: aiWs.streamingText,
    localMessages,
    setLocalMessages,
    pendingMessage,
    setPendingMessage,
    messagesEndRef,
    aiWs,
    conversations,
    loadingConversations,
    messages: allMessages,
    loadingMessages,
    handleSendMessage,
    ensureConversation,
  };
}
