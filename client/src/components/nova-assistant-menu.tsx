/**
 * Nova Assistant Menu - قائمة المساعدين السياديين
 * Professional holographic dropdown for sovereign assistant selection
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Bot,
  Crown,
  Shield,
  Code,
  Database,
  Globe,
  Zap,
  Brain,
  Rocket,
  Settings,
  FileText,
  Users,
  BarChart,
  Lock,
  Server,
  Loader2,
  TrendingUp,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SovereignAssistant {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: string;
  avatar?: string;
  isActive?: boolean;
  isAutonomous?: boolean;
  capabilities: string[];
}

// Map avatar field from database to Lucide icons
const avatarIcons: Record<string, any> = {
  brain: Brain,
  building: Building,
  shield: Shield,
  lock: Lock,
  "trending-up": TrendingUp,
  crown: Crown,
  code: Code,
  database: Database,
  globe: Globe,
  zap: Zap,
  rocket: Rocket,
  settings: Settings,
  "file-text": FileText,
  users: Users,
  "bar-chart": BarChart,
  server: Server,
  default: Bot,
};

// Map sovereign assistant types to gradient colors
const typeColors: Record<string, string> = {
  ai_governor: "from-purple-500 to-violet-600",
  platform_architect: "from-blue-500 to-indigo-600",
  operations_commander: "from-orange-500 to-amber-600",
  security_guardian: "from-emerald-500 to-green-600",
  growth_strategist: "from-pink-500 to-rose-600",
  default: "from-primary to-primary/80",
};

const translations = {
  ar: {
    title: "المساعدون السياديون",
    subtitle: "اختر المساعد للمحادثة",
    noAssistants: "لا توجد مساعدين متاحين",
    loading: "جاري التحميل...",
    startChat: "بدء المحادثة",
    active: "نشط",
    nova: "Nova AI",
  },
  en: {
    title: "Sovereign Assistants",
    subtitle: "Select assistant to chat with",
    noAssistants: "No assistants available",
    loading: "Loading...",
    startChat: "Start Chat",
    active: "Active",
    nova: "Nova AI",
  },
};

// Sovereign assistant order for consistent display
const sovereignOrder = [
  "ai_governor",
  "platform_architect", 
  "operations_commander",
  "security_guardian",
  "growth_strategist",
];

export function NovaAssistantMenu() {
  const { isSovereign, isAuthenticated } = useAuth();
  const { isRtl } = useLanguage();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const t = isRtl ? translations.ar : translations.en;

  const { data: serverAssistants, isLoading } = useQuery<SovereignAssistant[]>({
    queryKey: ["/api/owner/sovereign-assistants"],
    enabled: isAuthenticated && isSovereign,
  });

  if (!isAuthenticated || !isSovereign) return null;

  // Filter active assistants and sort by sovereign order
  const assistants = (serverAssistants || [])
    .filter(a => a.isActive !== false)
    .sort((a, b) => {
      const indexA = sovereignOrder.indexOf(a.type);
      const indexB = sovereignOrder.indexOf(b.type);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

  const handleSelectAssistant = (assistantId: string) => {
    setIsOpen(false);
    setLocation(`/sovereign-chat?assistant=${assistantId}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group"
          data-testid="button-nova-menu"
        >
          <div className="absolute inset-0 rounded-md overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-purple-500/30 to-cyan-500/30 rounded-md animate-pulse" />
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-purple-400/20 to-amber-400/20 rounded-lg blur-md"
              style={{
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div 
              className="absolute -inset-2 bg-gradient-to-r from-cyan-400/10 via-amber-400/10 to-purple-400/10 rounded-xl blur-lg"
              style={{
                animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                animationDelay: "0.5s",
              }}
            />
          </div>
          <div className="relative z-10 w-5 h-5 flex items-center justify-center">
            <Crown className="w-4 h-4 text-amber-500 absolute animate-pulse" style={{ animationDuration: "1.5s" }} />
            <Sparkles className="w-3 h-3 text-purple-400 absolute -top-0.5 -right-0.5 animate-ping" style={{ animationDuration: "2s" }} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRtl ? "start" : "end"}
        className={cn(
          "w-80 p-0 overflow-hidden",
          "bg-background/95 backdrop-blur-xl",
          "border border-primary/20",
          "shadow-2xl shadow-primary/10"
        )}
        sideOffset={8}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-cyan-500/5" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="relative p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg blur-md opacity-50" />
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{t.title}</h3>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                AI
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-[320px]">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ms-2 text-sm text-muted-foreground">{t.loading}</span>
                </div>
              ) : assistants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t.noAssistants}</p>
                </div>
              ) : (
                <AnimatePresence>
                  {assistants.map((assistant, index) => {
                    const Icon = avatarIcons[assistant.avatar || "default"] || avatarIcons.default;
                    const gradientClass = typeColors[assistant.type] || typeColors.default;
                    
                    return (
                      <motion.div
                        key={assistant.id}
                        initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <DropdownMenuItem
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                            "hover:bg-primary/5 focus:bg-primary/5",
                            "transition-all duration-200",
                            "group/item"
                          )}
                          onClick={() => handleSelectAssistant(assistant.id)}
                          data-testid={`menu-item-assistant-${assistant.id}`}
                        >
                          <div className="relative shrink-0">
                            <div className={cn(
                              "absolute inset-0 rounded-lg blur-md opacity-0 group-hover/item:opacity-50 transition-opacity",
                              `bg-gradient-to-r ${gradientClass}`
                            )} />
                            <div className={cn(
                              "relative w-10 h-10 rounded-lg flex items-center justify-center",
                              `bg-gradient-to-r ${gradientClass}`
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {isRtl ? assistant.nameAr : assistant.name}
                              </span>
                              {assistant.isActive !== false && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                              {assistant.isAutonomous && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-500/10 text-amber-500 border-amber-500/30">
                                  {isRtl ? "ذاتي" : "Auto"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {isRtl ? assistant.descriptionAr : assistant.description}
                            </p>
                          </div>
                          <Sparkles className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                        </DropdownMenuItem>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
