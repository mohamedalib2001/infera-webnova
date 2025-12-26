import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Brain, Sparkles, Target, Activity, Zap, Shield, Lock,
  Eye, Settings, Play, Pause, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, Clock, TrendingUp, BarChart3,
  Lightbulb, Bot, Cpu, Network, Database, Server,
  GitBranch, Workflow, Layers, Scale, Gavel, FileText,
  Crown, Radio, ArrowUpRight, ArrowDownRight, Timer,
  Gauge, PieChart, LineChart, AreaChart, AlertOctagon,
  Plus, Trash2
} from "lucide-react";

interface AIPolicy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  status: 'active' | 'inactive' | 'pending' | 'enforcing';
  autonomyLevel: number;
  lastEnforced?: string;
  enforcementCount: number;
  affectedResources: number;
}

interface AIDecision {
  id: string;
  type: string;
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'proposed' | 'approved' | 'rejected' | 'executed' | 'rolled_back';
  confidence: number;
  timestamp: string;
  affectedSystems: string[];
}

interface SimulationResult {
  id: string;
  policyId: string;
  scenarioName: string;
  scenarioNameAr: string;
  outcome: 'positive' | 'negative' | 'neutral';
  impactScore: number;
  risks: string[];
  benefits: string[];
  recommendation: string;
  recommendationAr: string;
}

export default function AIGovernanceEngine() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<AIPolicy | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [globalAutonomy, setGlobalAutonomy] = useState(75);
  const [autoEnforce, setAutoEnforce] = useState(true);
  const [humanInLoop, setHumanInLoop] = useState(true);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyNameAr, setNewPolicyNameAr] = useState("");
  const [newPolicyDescription, setNewPolicyDescription] = useState("");
  const [newPolicyCategory, setNewPolicyCategory] = useState("security");

  // Fetch real policies from database
  const { data: policiesData, isLoading: policiesLoading, refetch: refetchPolicies } = useQuery<{ policies: AIPolicy[], stats: { totalCalls: number, totalTokens: number } }>({
    queryKey: ["/api/sovereign/ai-policies"],
  });
  
  // Fetch real decisions from API
  const { data: decisionsData } = useQuery<{ decisions: AIDecision[] }>({
    queryKey: ["/api/sovereign/decisions"],
  });

  const policies = policiesData?.policies || [];
  const decisions = decisionsData?.decisions || [];
  const stats = policiesData?.stats || { totalCalls: 0, totalTokens: 0 };

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: any) => {
      return await apiRequest("POST", "/api/sovereign/ai-policies", policyData);
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم إنشاء السياسة" : "Policy Created",
        description: language === "ar" ? "تم إنشاء سياسة AI جديدة بنجاح" : "New AI policy created successfully"
      });
      refetchPolicies();
      setShowCreateDialog(false);
      setNewPolicyName("");
      setNewPolicyNameAr("");
      setNewPolicyDescription("");
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في إنشاء السياسة" : "Failed to create policy",
        variant: "destructive"
      });
    }
  });

  // Toggle policy mutation
  const togglePolicyMutation = useMutation({
    mutationFn: async (policyId: string) => {
      return await apiRequest("POST", `/api/sovereign/ai-policies/${policyId}/toggle`);
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم تحديث السياسة" : "Policy Updated",
        description: language === "ar" ? "تم تغيير حالة السياسة" : "Policy status changed"
      });
      refetchPolicies();
    }
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: async (policyId: string) => {
      return await apiRequest("DELETE", `/api/sovereign/ai-policies/${policyId}`);
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم حذف السياسة" : "Policy Deleted",
        description: language === "ar" ? "تم حذف السياسة بنجاح" : "Policy deleted successfully"
      });
      refetchPolicies();
      setSelectedPolicy(null);
    }
  });

  const handleCreatePolicy = () => {
    if (!newPolicyName.trim()) return;
    createPolicyMutation.mutate({
      name: newPolicyName,
      nameAr: newPolicyNameAr || newPolicyName,
      description: newPolicyDescription,
      descriptionAr: newPolicyDescription,
      policyType: "ALLOW",
      scope: newPolicyCategory,
      priority: 50,
      isActive: true,
      requiresHumanReview: humanInLoop,
    });
  };

  const categoryColors: Record<string, string> = {
    security: "text-red-500 bg-red-500/10 border-red-500/30",
    infrastructure: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    finance: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    compliance: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  };

  const impactColors: Record<string, string> = {
    low: "text-emerald-500 border-emerald-500/30",
    medium: "text-yellow-500 border-yellow-500/30",
    high: "text-orange-500 border-orange-500/30",
    critical: "text-red-500 border-red-500/30",
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-600",
    inactive: "bg-slate-600",
    pending: "bg-amber-600",
    enforcing: "bg-blue-600",
    proposed: "bg-purple-600",
    approved: "bg-emerald-600",
    rejected: "bg-red-600",
    executed: "bg-blue-600",
    rolled_back: "bg-orange-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
                <Brain className="w-7 h-7 text-violet-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-ai-governance-title">
                  {language === "ar" ? "محرك الحوكمة بالذكاء الاصطناعي" : "AI Governance Engine"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "قرارات ذكية وتنفيذ تلقائي" : "Intelligent Decisions & Autonomous Enforcement"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Radio className="w-3 h-3 text-violet-500 animate-pulse" />
                  <span className="text-xs text-slate-300">{language === "ar" ? "نشط" : "ACTIVE"}</span>
                </div>
                <Badge variant="outline" className="text-violet-500 border-violet-500/30 bg-violet-500/5">
                  <Brain className="w-3 h-3 mr-1" />
                  {language === "ar" ? "استقلالية" : "AUTONOMY"}: {globalAutonomy}%
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
            <CardContent className="p-3 text-center">
              <Brain className="w-5 h-5 text-violet-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-violet-500">{policies.filter(p => p.status === 'active').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "سياسات نشطة" : "Active Policies"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">{decisions.filter(d => d.status === 'executed').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "تم التنفيذ" : "Executed"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{decisions.filter(d => d.status === 'proposed').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "بانتظار الموافقة" : "Pending"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">97%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "دقة القرارات" : "Decision Accuracy"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800/50 flex flex-col bg-slate-900/30">
            <div className="p-4 border-b border-slate-800/50">
              <h3 className="text-sm font-medium text-white mb-3">
                {language === "ar" ? "إعدادات الاستقلالية" : "Autonomy Settings"}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-400">{language === "ar" ? "مستوى الاستقلالية العام" : "Global Autonomy Level"}</Label>
                    <span className="text-xs text-violet-500">{globalAutonomy}%</span>
                  </div>
                  <Slider 
                    value={[globalAutonomy]} 
                    onValueChange={(v) => setGlobalAutonomy(v[0])} 
                    max={100} 
                    step={5}
                    className="w-full"
                    data-testid="slider-global-autonomy"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-400">{language === "ar" ? "التنفيذ التلقائي" : "Auto-Enforcement"}</Label>
                  <Switch checked={autoEnforce} onCheckedChange={setAutoEnforce} data-testid="switch-auto-enforce" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-400">{language === "ar" ? "إشراك بشري" : "Human-in-Loop"}</Label>
                  <Switch checked={humanInLoop} onCheckedChange={setHumanInLoop} data-testid="switch-human-loop" />
                </div>
              </div>
            </div>
            
            <div className="p-3 border-b border-slate-800/50">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-white">
                  {language === "ar" ? "سياسات AI" : "AI Policies"}
                </h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowCreateDialog(true)}
                  data-testid="button-create-policy"
                  className="text-violet-500"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {policies.map((policy) => (
                  <button
                    key={policy.id}
                    onClick={() => setSelectedPolicy(policy)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                      selectedPolicy?.id === policy.id 
                        ? "bg-violet-500/10 border border-violet-500/30" 
                        : "bg-slate-800/30 border border-transparent"
                    }`}
                    data-testid={`button-policy-${policy.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {language === "ar" ? policy.nameAr : policy.name}
                      </span>
                      <Badge className={`text-[9px] ${statusColors[policy.status]}`}>
                        {policy.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[9px] ${categoryColors[policy.category]}`}>
                        {policy.category}
                      </Badge>
                      <span className="text-[10px] text-slate-500">{policy.autonomyLevel}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {selectedPolicy ? (
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Brain className="w-5 h-5 text-violet-500" />
                          {language === "ar" ? selectedPolicy.nameAr : selectedPolicy.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                          {language === "ar" ? selectedPolicy.descriptionAr : selectedPolicy.description}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusColors[selectedPolicy.status]}`}>
                        {selectedPolicy.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <Gauge className="w-5 h-5 text-violet-500 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedPolicy.autonomyLevel}%</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "مستوى الاستقلالية" : "Autonomy Level"}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <Zap className="w-5 h-5 text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedPolicy.enforcementCount}</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "مرات التنفيذ" : "Enforcements"}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <Layers className="w-5 h-5 text-blue-500 mb-2" />
                        <p className="text-2xl font-bold text-white">{selectedPolicy.affectedResources}</p>
                        <p className="text-xs text-slate-400">{language === "ar" ? "الموارد المتأثرة" : "Affected Resources"}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-violet-600" data-testid="button-simulate-policy">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {language === "ar" ? "محاكاة التأثير" : "Simulate Impact"}
                      </Button>
                      {selectedPolicy.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          className="border-amber-500/30 text-amber-500" 
                          onClick={() => togglePolicyMutation.mutate(selectedPolicy.id)}
                          disabled={togglePolicyMutation.isPending}
                          data-testid="button-pause-policy"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          {language === "ar" ? "إيقاف" : "Pause"}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="border-emerald-500/30 text-emerald-500"
                          onClick={() => togglePolicyMutation.mutate(selectedPolicy.id)}
                          disabled={togglePolicyMutation.isPending}
                          data-testid="button-activate-policy"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تفعيل" : "Activate"}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-red-500/30 text-red-500"
                        onClick={() => deletePolicyMutation.mutate(selectedPolicy.id)}
                        disabled={deletePolicyMutation.isPending}
                        data-testid="button-delete-policy"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      {language === "ar" ? "القرارات الأخيرة" : "Recent Decisions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {decisions.map((decision) => (
                          <div 
                            key={decision.id}
                            className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {decision.status === 'executed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                 decision.status === 'proposed' ? <Clock className="w-4 h-4 text-amber-500" /> :
                                 <XCircle className="w-4 h-4 text-red-500" />}
                                <span className="text-sm font-medium text-white">
                                  {language === "ar" ? decision.actionAr : decision.action}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[9px] ${impactColors[decision.impact]}`}>
                                  {decision.impact.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] text-violet-500 border-violet-500/30">
                                  {decision.confidence}%
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">
                              {language === "ar" ? decision.reasonAr : decision.reason}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {decision.affectedSystems.map((sys, i) => (
                                  <Badge key={i} variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                    {sys}
                                  </Badge>
                                ))}
                              </div>
                              {decision.status === 'proposed' && (
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-6 text-xs bg-emerald-600" data-testid={`button-approve-decision-${decision.id}`}>
                                    {language === "ar" ? "موافقة" : "Approve"}
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 text-xs border-red-500/30 text-red-500" data-testid={`button-reject-decision-${decision.id}`}>
                                    {language === "ar" ? "رفض" : "Reject"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="p-4 rounded-full bg-slate-800/50 inline-block mb-4">
                    <Brain className="w-12 h-12 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {language === "ar" ? "اختر سياسة" : "Select a Policy"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {language === "ar" ? "اختر سياسة AI لعرض التفاصيل والإجراءات" : "Choose an AI policy to view details and actions"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {language === "ar" ? "إنشاء سياسة AI جديدة" : "Create New AI Policy"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {language === "ar" ? "أضف سياسة جديدة لحوكمة الذكاء الاصطناعي" : "Add a new AI governance policy"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "اسم السياسة (English)" : "Policy Name (English)"}</Label>
              <Input 
                value={newPolicyName}
                onChange={(e) => setNewPolicyName(e.target.value)}
                placeholder="e.g., Data Encryption Policy"
                className="bg-slate-800 border-slate-600 text-white"
                data-testid="input-policy-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "اسم السياسة (عربي)" : "Policy Name (Arabic)"}</Label>
              <Input 
                value={newPolicyNameAr}
                onChange={(e) => setNewPolicyNameAr(e.target.value)}
                placeholder="مثال: سياسة تشفير البيانات"
                className="bg-slate-800 border-slate-600 text-white"
                dir="rtl"
                data-testid="input-policy-name-ar"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "الوصف" : "Description"}</Label>
              <Input 
                value={newPolicyDescription}
                onChange={(e) => setNewPolicyDescription(e.target.value)}
                placeholder={language === "ar" ? "وصف السياسة..." : "Policy description..."}
                className="bg-slate-800 border-slate-600 text-white"
                data-testid="input-policy-description"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">{language === "ar" ? "الفئة" : "Category"}</Label>
              <Select value={newPolicyCategory} onValueChange={setNewPolicyCategory}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="select-policy-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="security">{language === "ar" ? "الأمان" : "Security"}</SelectItem>
                  <SelectItem value="infrastructure">{language === "ar" ? "البنية التحتية" : "Infrastructure"}</SelectItem>
                  <SelectItem value="finance">{language === "ar" ? "المالية" : "Finance"}</SelectItem>
                  <SelectItem value="compliance">{language === "ar" ? "الامتثال" : "Compliance"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="border-slate-600 text-slate-300"
              data-testid="button-cancel-create"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={handleCreatePolicy}
              disabled={!newPolicyName.trim() || createPolicyMutation.isPending}
              className="bg-violet-600"
              data-testid="button-confirm-create"
            >
              {createPolicyMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                language === "ar" ? "إنشاء" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
