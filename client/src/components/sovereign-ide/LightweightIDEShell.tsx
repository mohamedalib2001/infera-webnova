import { useState, Suspense, lazy } from "react";
import { Loader2, Brain, Shield, Sparkles, Code2, Play } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SovereignCoreIDE = lazy(() => 
  import("@/components/sovereign-core-ide").then(mod => ({ default: mod.SovereignCoreIDE }))
);

interface LightweightIDEShellProps {
  workspaceId: string;
  isOwner: boolean;
}

function LoadingScreen({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="h-[700px] w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center rounded-lg">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse opacity-30" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isRtl ? "جاري تحميل بيئة التطوير..." : "Loading Development Environment..."}
        </p>
      </div>
    </div>
  );
}

function LaunchScreen({ isRtl, onLaunch }: { isRtl: boolean; onLaunch: () => void }) {
  return (
    <div className="h-[700px] w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center rounded-lg border border-violet-500/20">
      <Card className="max-w-lg bg-slate-900/80 border-violet-500/30">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            {isRtl ? "بيئة التطوير السيادية" : "Sovereign Core IDE"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-sm text-muted-foreground">
            {isRtl 
              ? "بيئة تطوير متكاملة مع ذكاء اصطناعي سيادي لبناء منصات رقمية على مستوى عالمي"
              : "Full-featured IDE with Sovereign AI for building world-class digital platforms"}
          </p>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Code2 className="h-5 w-5 mx-auto mb-1 text-violet-400" />
              <span className="text-muted-foreground">{isRtl ? "محرر كود" : "Code Editor"}</span>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <span className="text-muted-foreground">{isRtl ? "أمان عسكري" : "Military Security"}</span>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-cyan-400" />
              <span className="text-muted-foreground">{isRtl ? "نوفا AI" : "Nova AI"}</span>
            </div>
          </div>
          
          <Button 
            onClick={onLaunch}
            size="lg"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
            data-testid="button-launch-ide"
          >
            <Play className="h-5 w-5 mr-2" />
            {isRtl ? "إطلاق بيئة التطوير" : "Launch IDE"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function LightweightIDEShell({ workspaceId, isOwner }: LightweightIDEShellProps) {
  const { isRtl } = useLanguage();
  const [launched, setLaunched] = useState(false);

  if (!launched) {
    return <LaunchScreen isRtl={isRtl} onLaunch={() => setLaunched(true)} />;
  }

  return (
    <Suspense fallback={<LoadingScreen isRtl={isRtl} />}>
      <SovereignCoreIDE workspaceId={workspaceId} isOwner={isOwner} />
    </Suspense>
  );
}
