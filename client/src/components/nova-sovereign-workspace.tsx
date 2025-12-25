/**
 * Nova AI Sovereign Workspace Component
 * واجهة نوفا السيادية لمساحة العمل
 * 
 * Sovereign Decision Governor - Not Just an Assistant
 * حاكم القرارات السيادي - ليس مجرد مساعد
 */

import { useState, useCallback } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Crown, 
  Shield, 
  Target, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Send, 
  Loader2,
  FileText,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Building2,
  Play,
  Pause,
  RotateCcw,
  History,
  Settings,
  Users,
  Database,
  Cloud,
  Code2,
  Scale,
  BookOpen,
  Briefcase,
  ShoppingCart,
  TrendingUp,
  GraduationCap,
  Hotel,
  Cpu,
  Laptop,
  BarChart3,
  Boxes,
  FileUser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  INFERA_PLATFORMS_REGISTRY, 
  type InferaPlatform,
  getPlatformsByTier,
  getNovaEnabledPlatforms 
} from "@/lib/infera-platforms-registry";

// Nova AI Execution Step Type
interface ExecutionStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "awaiting_approval";
  progress: number;
  requiresApproval: boolean;
  approvalLevel: "owner" | "sovereign" | "standard";
  timestamp?: Date;
  result?: string;
  resultAr?: string;
}

// Nova AI Decision Type
interface NovaDecision {
  id: string;
  type: "analysis" | "recommendation" | "action" | "governance";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  platform: InferaPlatform;
  steps: ExecutionStep[];
  status: "draft" | "pending_approval" | "approved" | "executing" | "completed" | "rejected";
  createdAt: Date;
  approvedBy?: string;
  executedAt?: Date;
}

// Platform Icon Mapping
const platformIconMap: Record<string, typeof Brain> = {
  Crown, Brain, Shield, Zap, Cloud, Users, Scale, Target, 
  ShoppingCart, GraduationCap, Hotel, Clock, BookOpen, FileText,
  Laptop, Boxes, FileUser, Briefcase, BarChart3, Database, Cpu, TrendingUp
};

function getPlatformIcon(iconName: string) {
  return platformIconMap[iconName] || Brain;
}

interface NovaSovereignWorkspaceProps {
  isOwner: boolean;
  onClose?: () => void;
}

export function NovaSovereignWorkspace({ isOwner, onClose }: NovaSovereignWorkspaceProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { toast } = useToast();
  
  // State
  const [selectedPlatform, setSelectedPlatform] = useState<InferaPlatform | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<NovaDecision | null>(null);
  const [executionHistory, setExecutionHistory] = useState<NovaDecision[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingStep, setPendingStep] = useState<ExecutionStep | null>(null);
  const [activeTab, setActiveTab] = useState("workspace");
  
  // Get Nova-enabled platforms grouped by tier
  const novaPlatforms = getNovaEnabledPlatforms();
  const rootPlatforms = getPlatformsByTier("root").filter(p => p.aiCapabilities.hasNovaIntegration);
  const sovereignPlatforms = getPlatformsByTier("sovereign").filter(p => p.aiCapabilities.hasNovaIntegration);
  const enterprisePlatforms = getPlatformsByTier("enterprise").filter(p => p.aiCapabilities.hasNovaIntegration);
  const standardPlatforms = getPlatformsByTier("standard").filter(p => p.aiCapabilities.hasNovaIntegration);
  
  // Handle platform selection
  const handlePlatformSelect = useCallback((platformId: string) => {
    const platform = INFERA_PLATFORMS_REGISTRY.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platform);
      setCurrentDecision(null);
      toast({
        title: isAr ? "تم اختيار المنصة" : "Platform Selected",
        description: isAr ? platform.nameAr : platform.name,
      });
    }
  }, [isAr, toast]);
  
  // Generate execution steps based on input
  const generateExecutionSteps = useCallback((input: string, platform: InferaPlatform): ExecutionStep[] => {
    const baseSteps: ExecutionStep[] = [
      {
        id: "step-1",
        title: "Input Analysis",
        titleAr: "تحليل المدخلات",
        description: "Analyzing request context and requirements",
        descriptionAr: "تحليل سياق الطلب والمتطلبات",
        status: "pending",
        progress: 0,
        requiresApproval: false,
        approvalLevel: "standard"
      },
      {
        id: "step-2",
        title: "Platform Validation",
        titleAr: "التحقق من المنصة",
        description: `Validating compatibility with ${platform.name}`,
        descriptionAr: `التحقق من التوافق مع ${platform.nameAr}`,
        status: "pending",
        progress: 0,
        requiresApproval: false,
        approvalLevel: "standard"
      },
      {
        id: "step-3",
        title: "Security Assessment",
        titleAr: "تقييم الأمان",
        description: "Evaluating security implications and risks",
        descriptionAr: "تقييم الآثار الأمنية والمخاطر",
        status: "pending",
        progress: 0,
        requiresApproval: platform.tier === "sovereign" || platform.tier === "root",
        approvalLevel: platform.tier === "root" ? "owner" : "sovereign"
      },
      {
        id: "step-4",
        title: "Decision Formulation",
        titleAr: "صياغة القرار",
        description: "Formulating governance decision and action plan",
        descriptionAr: "صياغة قرار الحوكمة وخطة العمل",
        status: "pending",
        progress: 0,
        requiresApproval: true,
        approvalLevel: "owner"
      },
      {
        id: "step-5",
        title: "Execution Authorization",
        titleAr: "تفويض التنفيذ",
        description: "Owner authorization required before execution",
        descriptionAr: "مطلوب تفويض المالك قبل التنفيذ",
        status: "pending",
        progress: 0,
        requiresApproval: true,
        approvalLevel: "owner"
      }
    ];
    
    return baseSteps;
  }, []);
  
  // Process user request
  const handleProcessRequest = useCallback(async () => {
    if (!userInput.trim() || !selectedPlatform) {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "يرجى اختيار منصة وإدخال طلب" : "Please select a platform and enter a request",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Generate execution steps
    const steps = generateExecutionSteps(userInput, selectedPlatform);
    
    const newDecision: NovaDecision = {
      id: `decision-${Date.now()}`,
      type: "governance",
      title: userInput.substring(0, 50) + (userInput.length > 50 ? "..." : ""),
      titleAr: userInput.substring(0, 50) + (userInput.length > 50 ? "..." : ""),
      description: userInput,
      descriptionAr: userInput,
      platform: selectedPlatform,
      steps,
      status: "pending_approval",
      createdAt: new Date()
    };
    
    setCurrentDecision(newDecision);
    
    // Simulate step-by-step processing
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update step to in_progress
      setCurrentDecision(prev => {
        if (!prev) return prev;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { ...updatedSteps[i], status: "in_progress", progress: 0 };
        return { ...prev, steps: updatedSteps };
      });
      
      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setCurrentDecision(prev => {
          if (!prev) return prev;
          const updatedSteps = [...prev.steps];
          updatedSteps[i] = { ...updatedSteps[i], progress: p };
          return { ...prev, steps: updatedSteps };
        });
      }
      
      // Check if approval is required
      if (step.requiresApproval) {
        setCurrentDecision(prev => {
          if (!prev) return prev;
          const updatedSteps = [...prev.steps];
          updatedSteps[i] = { 
            ...updatedSteps[i], 
            status: "awaiting_approval", 
            progress: 100 
          };
          return { ...prev, steps: updatedSteps };
        });
        
        setPendingStep(step);
        setShowApprovalDialog(true);
        setIsProcessing(false);
        return;
      }
      
      // Mark step as completed
      setCurrentDecision(prev => {
        if (!prev) return prev;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { 
          ...updatedSteps[i], 
          status: "completed", 
          progress: 100,
          timestamp: new Date(),
          result: `Step completed successfully`,
          resultAr: `اكتملت الخطوة بنجاح`
        };
        return { ...prev, steps: updatedSteps };
      });
    }
    
    setIsProcessing(false);
  }, [userInput, selectedPlatform, isAr, toast, generateExecutionSteps]);
  
  // Handle step approval
  const handleApproveStep = useCallback(() => {
    if (!pendingStep || !currentDecision) return;
    
    const stepIndex = currentDecision.steps.findIndex(s => s.id === pendingStep.id);
    if (stepIndex === -1) return;
    
    setCurrentDecision(prev => {
      if (!prev) return prev;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = { 
        ...updatedSteps[stepIndex], 
        status: "completed", 
        progress: 100,
        timestamp: new Date(),
        result: `Approved by Owner`,
        resultAr: `تمت الموافقة من المالك`
      };
      return { ...prev, steps: updatedSteps };
    });
    
    setShowApprovalDialog(false);
    setPendingStep(null);
    
    toast({
      title: isAr ? "تمت الموافقة" : "Approved",
      description: isAr ? pendingStep.titleAr : pendingStep.title,
    });
    
    // Continue processing remaining steps
    setIsProcessing(true);
    // In a real implementation, this would continue the execution
    setTimeout(() => setIsProcessing(false), 1000);
  }, [pendingStep, currentDecision, isAr, toast]);
  
  // Handle step rejection
  const handleRejectStep = useCallback(() => {
    if (!pendingStep || !currentDecision) return;
    
    const stepIndex = currentDecision.steps.findIndex(s => s.id === pendingStep.id);
    if (stepIndex === -1) return;
    
    setCurrentDecision(prev => {
      if (!prev) return prev;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = { 
        ...updatedSteps[stepIndex], 
        status: "failed", 
        progress: 100,
        timestamp: new Date(),
        result: `Rejected by Owner`,
        resultAr: `تم الرفض من المالك`
      };
      return { ...prev, status: "rejected", steps: updatedSteps };
    });
    
    setShowApprovalDialog(false);
    setPendingStep(null);
    
    toast({
      title: isAr ? "تم الرفض" : "Rejected",
      description: isAr ? pendingStep.titleAr : pendingStep.title,
      variant: "destructive"
    });
  }, [pendingStep, currentDecision, isAr, toast]);
  
  // Render platform selector
  const renderPlatformSelector = () => (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        {isAr ? "اختر منصة INFERA" : "Select INFERA Platform"}
      </Label>
      <Select 
        value={selectedPlatform?.id || ""} 
        onValueChange={handlePlatformSelect}
      >
        <SelectTrigger className="w-full" data-testid="select-platform">
          <SelectValue placeholder={isAr ? "اختر منصة..." : "Select platform..."} />
        </SelectTrigger>
        <SelectContent>
          {/* Root Platforms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {isAr ? "المنصات الجذرية" : "Root Platforms"}
          </div>
          {rootPlatforms.map(platform => {
            const Icon = getPlatformIcon(platform.icon);
            return (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-amber-500" />
                  <span>{isAr ? platform.nameAr : platform.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500">
                    ROOT
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
          
          <Separator className="my-1" />
          
          {/* Sovereign Platforms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {isAr ? "المنصات السيادية" : "Sovereign Platforms"}
          </div>
          {sovereignPlatforms.map(platform => {
            const Icon = getPlatformIcon(platform.icon);
            return (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-purple-500" />
                  <span>{isAr ? platform.nameAr : platform.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-500">
                    SOV
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
          
          <Separator className="my-1" />
          
          {/* Enterprise Platforms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {isAr ? "منصات المؤسسات" : "Enterprise Platforms"}
          </div>
          {enterprisePlatforms.map(platform => {
            const Icon = getPlatformIcon(platform.icon);
            return (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-blue-500" />
                  <span>{isAr ? platform.nameAr : platform.name}</span>
                  <Badge variant="outline" className="text-[10px]">ENT</Badge>
                </div>
              </SelectItem>
            );
          })}
          
          <Separator className="my-1" />
          
          {/* Standard Platforms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            {isAr ? "المنصات القياسية" : "Standard Platforms"}
          </div>
          {standardPlatforms.map(platform => {
            const Icon = getPlatformIcon(platform.icon);
            return (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{isAr ? platform.nameAr : platform.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Selected Platform Info */}
      {selectedPlatform && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = getPlatformIcon(selectedPlatform.icon);
                return <Icon className="h-8 w-8 text-primary" />;
              })()}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">
                    {isAr ? selectedPlatform.nameAr : selectedPlatform.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    {selectedPlatform.shortCode}
                  </Badge>
                  <Badge 
                    variant={selectedPlatform.tier === "root" ? "default" : "secondary"}
                    className={cn(
                      "text-[10px]",
                      selectedPlatform.tier === "root" && "bg-amber-500 text-black",
                      selectedPlatform.tier === "sovereign" && "bg-purple-500"
                    )}
                  >
                    {selectedPlatform.tier.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? selectedPlatform.descriptionAr : selectedPlatform.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(isAr ? selectedPlatform.capabilitiesAr : selectedPlatform.capabilities).slice(0, 3).map((cap, i) => (
                    <Badge key={i} variant="outline" className="text-[9px]">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  // Render execution steps
  const renderExecutionSteps = () => {
    if (!currentDecision) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">
            {isAr ? "خطوات التنفيذ" : "Execution Steps"}
          </h4>
          <Badge variant={currentDecision.status === "completed" ? "default" : "secondary"}>
            {currentDecision.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
        
        <div className="space-y-2">
          {currentDecision.steps.map((step, index) => (
            <Card 
              key={step.id} 
              className={cn(
                "transition-all",
                step.status === "in_progress" && "border-primary ring-1 ring-primary/20",
                step.status === "awaiting_approval" && "border-amber-500 ring-1 ring-amber-500/20",
                step.status === "completed" && "border-green-500/50",
                step.status === "failed" && "border-destructive/50"
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
                    step.status === "pending" && "bg-muted text-muted-foreground",
                    step.status === "in_progress" && "bg-primary/20 text-primary",
                    step.status === "awaiting_approval" && "bg-amber-500/20 text-amber-500",
                    step.status === "completed" && "bg-green-500/20 text-green-500",
                    step.status === "failed" && "bg-destructive/20 text-destructive"
                  )}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : step.status === "failed" ? (
                      <XCircle className="h-4 w-4" />
                    ) : step.status === "awaiting_approval" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : step.status === "in_progress" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h5 className="font-medium text-sm">
                        {isAr ? step.titleAr : step.title}
                      </h5>
                      {step.requiresApproval && (
                        <Badge variant="outline" className="text-[9px] gap-1">
                          <Lock className="h-3 w-3" />
                          {step.approvalLevel.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? step.descriptionAr : step.description}
                    </p>
                    
                    {step.status === "in_progress" && (
                      <Progress value={step.progress} className="h-1.5 mt-2" />
                    )}
                    
                    {step.result && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {isAr ? step.resultAr : step.result}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", isAr && "rtl")}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary" />
            <Crown className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Nova AI
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500">
                {isAr ? "حاكم القرارات" : "Decision Governor"}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr 
                ? "ليس مجرد مساعد - بل حاكم سيادي للقرارات" 
                : "Not Just an Assistant - Sovereign Decision Governor"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            {isAr ? "متصل كمالك" : "Connected as Owner"}
          </Badge>
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="workspace" className="gap-2">
            <Target className="h-4 w-4" />
            {isAr ? "مساحة العمل" : "Workspace"}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            {isAr ? "السجل" : "History"}
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Shield className="h-4 w-4" />
            {isAr ? "الحوكمة" : "Governance"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workspace" className="flex-1 flex flex-col p-4 gap-4">
          {/* Platform Selection */}
          {renderPlatformSelector()}
          
          <Separator />
          
          {/* Input Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {isAr ? "أدخل طلبك أو قرارك" : "Enter Your Request or Decision"}
            </Label>
            <Textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isAr 
                ? "اكتب طلبك هنا... سيتم تحليله وتنفيذه خطوة بخطوة مع موافقتك" 
                : "Write your request here... It will be analyzed and executed step by step with your approval"}
              className="min-h-[100px] resize-none"
              disabled={!selectedPlatform || isProcessing}
              data-testid="input-nova-request"
            />
            <Button 
              onClick={handleProcessRequest}
              disabled={!selectedPlatform || !userInput.trim() || isProcessing}
              className="w-full gap-2"
              data-testid="button-process-request"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isAr ? "جاري المعالجة..." : "Processing..."}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {isAr ? "معالجة الطلب" : "Process Request"}
                </>
              )}
            </Button>
          </div>
          
          {/* Execution Steps */}
          {currentDecision && (
            <>
              <Separator />
              <ScrollArea className="flex-1">
                {renderExecutionSteps()}
              </ScrollArea>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="flex-1 p-4">
          <div className="text-center text-muted-foreground py-8">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{isAr ? "لا يوجد سجل قرارات بعد" : "No decision history yet"}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="governance" className="flex-1 p-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>{isAr ? "سلطة المالك الجذرية" : "Owner Root Authority"}</AlertTitle>
            <AlertDescription>
              {isAr 
                ? "أنت تمتلك السيطرة الكاملة. يمكنك إيقاف أي نموذج، تعطيل أي قرار، وتجاوز أي سياسة." 
                : "You have complete control. You can stop any model, disable any decision, and override any policy."}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  {isAr ? "مفتاح الإيقاف" : "Kill Switch"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button variant="destructive" size="sm" className="w-full gap-2" disabled>
                  <Pause className="h-4 w-4" />
                  {isAr ? "إيقاف الكل" : "Stop All"}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                  {isAr ? "التراجع" : "Rollback"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                  <RotateCcw className="h-4 w-4" />
                  {isAr ? "استعادة" : "Restore"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {isAr ? "مطلوب موافقة المالك" : "Owner Approval Required"}
            </DialogTitle>
            <DialogDescription>
              {isAr 
                ? "هذه الخطوة تتطلب موافقتك قبل المتابعة" 
                : "This step requires your approval before proceeding"}
            </DialogDescription>
          </DialogHeader>
          
          {pendingStep && (
            <div className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>{isAr ? pendingStep.titleAr : pendingStep.title}</AlertTitle>
                <AlertDescription>
                  {isAr ? pendingStep.descriptionAr : pendingStep.description}
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {pendingStep.approvalLevel.toUpperCase()}
                </Badge>
                <span>
                  {isAr ? "مستوى الموافقة المطلوب" : "Required approval level"}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleRejectStep}
              data-testid="button-reject-step"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {isAr ? "رفض" : "Reject"}
            </Button>
            <Button 
              onClick={handleApproveStep}
              data-testid="button-approve-step"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isAr ? "موافقة" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
