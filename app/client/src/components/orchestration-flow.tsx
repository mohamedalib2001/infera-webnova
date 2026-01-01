import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  FileCode,
  Rocket,
  Shield,
  Activity,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export type OrchestrationStep =
  | "analyzing"
  | "planning"
  | "generating"
  | "deploying"
  | "monitoring"
  | "completed"
  | "failed";

interface OrchestrationFlowProps {
  currentStep: OrchestrationStep;
  progress: number;
  logs?: Array<{ timestamp: Date; message: string; level: string }>;
}

const steps: { key: OrchestrationStep; icon: typeof Brain; color: string }[] = [
  { key: "analyzing", icon: Brain, color: "text-violet-500" },
  { key: "planning", icon: FileCode, color: "text-blue-500" },
  { key: "generating", icon: Rocket, color: "text-emerald-500" },
  { key: "deploying", icon: Shield, color: "text-amber-500" },
  { key: "monitoring", icon: Activity, color: "text-rose-500" },
];

export function OrchestrationFlow({ currentStep, progress, logs = [] }: OrchestrationFlowProps) {
  const { t, language } = useLanguage();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStepStatus = (stepKey: OrchestrationStep): "pending" | "active" | "completed" | "failed" => {
    if (currentStep === "failed") {
      const currentIndex = steps.findIndex((s) => s.key === stepKey);
      const failedIndex = steps.findIndex((s) => s.key === "monitoring"); // Assume failure at monitoring
      if (currentIndex < failedIndex) return "completed";
      if (currentIndex === failedIndex) return "failed";
      return "pending";
    }

    if (currentStep === "completed") return "completed";

    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const stepIndex = steps.findIndex((s) => s.key === stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getStepLabel = (key: OrchestrationStep): string => {
    const labels: Record<OrchestrationStep, Record<"ar" | "en", string>> = {
      analyzing: { ar: "تحليل المتطلبات", en: "Analyzing Requirements" },
      planning: { ar: "تخطيط البنية المعمارية", en: "Planning Architecture" },
      generating: { ar: "توليد الكود السيادي", en: "Generating Sovereign Code" },
      deploying: { ar: "نشر وتشغيل المنصة", en: "Deploying Platform" },
      monitoring: { ar: "بدء المراقبة الذاتية", en: "Starting Autonomous Monitoring" },
      completed: { ar: "اكتمل", en: "Completed" },
      failed: { ar: "فشل", en: "Failed" },
    };
    return labels[key][language];
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {language === "ar" ? "تقدم التنسيق" : "Orchestration Progress"}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(animatedProgress)}%</span>
          </div>
          <Progress value={animatedProgress} className="h-2" />
        </div>

        <div className="relative">
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-border" />

          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step.key);

              return (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${
                        status === "completed"
                          ? "bg-green-500"
                          : status === "active"
                          ? "bg-violet-500 animate-pulse"
                          : status === "failed"
                          ? "bg-red-500"
                          : "bg-muted"
                      }
                    `}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : status === "active" ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : status === "failed" ? (
                      <AlertCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Icon className={`h-6 w-6 ${status === "pending" ? "text-muted-foreground" : "text-white"}`} />
                    )}
                  </div>
                  <span
                    className={`
                      text-xs mt-2 text-center max-w-20
                      ${status === "active" ? "font-medium text-foreground" : "text-muted-foreground"}
                    `}
                  >
                    {getStepLabel(step.key)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {logs.length > 0 && (
          <div className="mt-6 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {logs.slice(-5).map((log, i) => (
                <div
                  key={i}
                  className={`text-xs flex items-start gap-2 ${
                    log.level === "error" ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep !== "completed" && currentStep !== "failed" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t(`orchestration.${currentStep}`)}</span>
          </div>
        )}

        {currentStep === "completed" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {language === "ar"
                ? "تم إنشاء المنصة السيادية بنجاح!"
                : "Sovereign platform created successfully!"}
            </span>
          </div>
        )}

        {currentStep === "failed" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>
              {language === "ar" ? "فشل في إنشاء المنصة. حاول مرة أخرى." : "Failed to create platform. Please try again."}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
