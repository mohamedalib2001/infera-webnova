import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  Brain,
  Sparkles,
  Crown,
  MessageSquare,
  Settings2,
  Maximize2,
  Command,
  Zap,
  Shield,
  Target,
} from "lucide-react";

export function NovaFloatingButton() {
  const { isRtl } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  const isOwner = user?.role === "owner" || user?.role === "admin";

  const t = {
    ar: {
      novaAI: "Nova AI",
      sovereignCore: "العقل السيادي",
      openChat: "فتح المحادثة",
      fullscreen: "وضع ملء الشاشة",
      controlPanel: "لوحة التحكم",
      capabilities: "القدرات السيادية",
      commands: "الأوامر السريعة",
      ownerOnly: "للمالك فقط",
    },
    en: {
      novaAI: "Nova AI",
      sovereignCore: "Sovereign Intelligence Core",
      openChat: "Open Chat",
      fullscreen: "Fullscreen Mode",
      controlPanel: "Control Panel",
      capabilities: "Sovereign Capabilities",
      commands: "Quick Commands",
      ownerOnly: "Owner Only",
    },
  };

  const text = isRtl ? t.ar : t.en;

  return (
    <div className="fixed bottom-6 right-6 z-[9998]" dir={isRtl ? "rtl" : "ltr"}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-lg shadow-violet-500/30 border-2 border-violet-400/30"
            data-testid="button-nova-floating"
          >
            <div className="relative">
              <Brain className="h-7 w-7 text-white" />
              <Sparkles className="h-3 w-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={isRtl ? "start" : "end"} 
          className="w-64 bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900 border-violet-500/30"
        >
          <div className="px-3 py-2 border-b border-violet-500/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {text.novaAI}
                </h4>
                <p className="text-[10px] text-violet-300/70">{text.sovereignCore}</p>
              </div>
              {isOwner && (
                <Crown className="w-4 h-4 text-amber-400 ml-auto" />
              )}
            </div>
          </div>

          <div className="p-1">
            <DropdownMenuItem 
              onClick={() => setLocation("/sovereign-chat")}
              className="gap-2 cursor-pointer"
              data-testid="menu-nova-chat"
            >
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>{text.openChat}</span>
            </DropdownMenuItem>

            {isOwner && (
              <>
                <DropdownMenuItem 
                  onClick={() => setLocation("/owner/control-center")}
                  className="gap-2 cursor-pointer"
                  data-testid="menu-nova-fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-violet-400" />
                  <span>{text.fullscreen}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-violet-500/20" />

                <DropdownMenuItem 
                  onClick={() => setLocation("/owner/ai-capability-control")}
                  className="gap-2 cursor-pointer"
                  data-testid="menu-nova-capabilities"
                >
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>{text.capabilities}</span>
                  <Badge variant="outline" className="ml-auto text-[9px] h-4 border-amber-500/30 text-amber-400">
                    {text.ownerOnly}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => setLocation("/owner/nova-permissions")}
                  className="gap-2 cursor-pointer"
                  data-testid="menu-nova-control"
                >
                  <Settings2 className="w-4 h-4 text-blue-400" />
                  <span>{text.controlPanel}</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="bg-violet-500/20" />

            <DropdownMenuItem 
              onClick={() => {
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
              className="gap-2 cursor-pointer"
              data-testid="menu-nova-commands"
            >
              <Command className="w-4 h-4 text-muted-foreground" />
              <span>{text.commands}</span>
              <Badge variant="outline" className="ml-auto text-[9px] h-4">
                Cmd+K
              </Badge>
            </DropdownMenuItem>
          </div>

          <div className="px-3 py-2 border-t border-violet-500/20 bg-violet-950/30">
            <div className="flex items-center gap-2 text-[10px] text-violet-300/50">
              <Zap className="w-3 h-3" />
              <span>{isRtl ? "مشغّل بواسطة Claude AI" : "Powered by Claude AI"}</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
