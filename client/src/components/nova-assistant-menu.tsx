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
  status: string;
  capabilities: string[];
}

const assistantIcons: Record<string, any> = {
  strategic: Crown,
  security: Shield,
  development: Code,
  data: Database,
  global: Globe,
  performance: Zap,
  intelligence: Brain,
  deployment: Rocket,
  operations: Settings,
  documentation: FileText,
  collaboration: Users,
  analytics: BarChart,
  compliance: Lock,
  infrastructure: Server,
  default: Bot,
};

const assistantColors: Record<string, string> = {
  strategic: "from-amber-500 to-yellow-600",
  security: "from-red-500 to-rose-600",
  development: "from-blue-500 to-indigo-600",
  data: "from-emerald-500 to-green-600",
  global: "from-cyan-500 to-teal-600",
  performance: "from-orange-500 to-amber-600",
  intelligence: "from-purple-500 to-violet-600",
  deployment: "from-pink-500 to-rose-600",
  operations: "from-slate-500 to-gray-600",
  documentation: "from-sky-500 to-blue-600",
  collaboration: "from-indigo-500 to-purple-600",
  analytics: "from-teal-500 to-cyan-600",
  compliance: "from-rose-500 to-red-600",
  infrastructure: "from-gray-500 to-slate-600",
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

const defaultAssistants: SovereignAssistant[] = [
  {
    id: "nova-main",
    name: "Nova AI",
    nameAr: "نوفا الذكي",
    description: "Main AI assistant for platform building",
    descriptionAr: "المساعد الرئيسي لبناء المنصات",
    type: "intelligence",
    status: "active",
    capabilities: ["code_generation", "platform_building", "conversation"],
  },
  {
    id: "strategic-advisor",
    name: "Strategic Advisor",
    nameAr: "المستشار الاستراتيجي",
    description: "Business strategy and planning",
    descriptionAr: "الاستراتيجية والتخطيط",
    type: "strategic",
    status: "active",
    capabilities: ["strategy", "planning", "consulting"],
  },
  {
    id: "security-guardian",
    name: "Security Guardian",
    nameAr: "حارس الأمان",
    description: "Security analysis and protection",
    descriptionAr: "تحليل الأمان والحماية",
    type: "security",
    status: "active",
    capabilities: ["security", "audit", "protection"],
  },
  {
    id: "dev-architect",
    name: "Dev Architect",
    nameAr: "مهندس التطوير",
    description: "Technical architecture and development",
    descriptionAr: "الهندسة التقنية والتطوير",
    type: "development",
    status: "active",
    capabilities: ["architecture", "development", "code_review"],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    nameAr: "محلل البيانات",
    description: "Data analysis and insights",
    descriptionAr: "تحليل البيانات والرؤى",
    type: "data",
    status: "active",
    capabilities: ["analytics", "reporting", "insights"],
  },
  {
    id: "compliance-officer",
    name: "Compliance Officer",
    nameAr: "مسؤول الامتثال",
    description: "Regulatory compliance and governance",
    descriptionAr: "الامتثال التنظيمي والحوكمة",
    type: "compliance",
    status: "active",
    capabilities: ["compliance", "governance", "regulations"],
  },
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

  const assistants = serverAssistants?.length ? serverAssistants : defaultAssistants;

  const handleSelectAssistant = (assistantId: string) => {
    setIsOpen(false);
    setLocation(`/nova?assistant=${assistantId}`);
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
                    const Icon = assistantIcons[assistant.type] || assistantIcons.default;
                    const gradientClass = assistantColors[assistant.type] || assistantColors.default;
                    
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
                              {assistant.status === "active" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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
