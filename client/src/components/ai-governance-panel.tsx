/**
 * INFERA WebNova - AI Governance Panel
 * لوحة التحكم في الذكاء الاصطناعي
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Plus,
  Loader2,
  Activity,
  Lock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  BarChart3,
  History,
  Gauge,
  AlertOctagon
} from "lucide-react";

interface AIGovernancePanelProps {
  language?: "en" | "ar";
  isOwner?: boolean;
}

export function AIGovernancePanel({ language = "en", isOwner = false }: AIGovernancePanelProps) {
  const { toast } = useToast();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState("guardrails");
  const [showNewGuardrail, setShowNewGuardrail] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [resolveType, setResolveType] = useState<string>("approval");
  const [resolveNotes, setResolveNotes] = useState("");

  const [newGuardrail, setNewGuardrail] = useState({
    name: "", nameAr: "", category: "action", description: "", descriptionAr: "",
    condition: "", conditionAr: "", severity: "warn", enabled: true
  });

  const { data: guardrailsData } = useQuery({ queryKey: ["/api/ai-governance/guardrails"] });
  const { data: decisionsData } = useQuery({ queryKey: ["/api/ai-governance/decisions"] });
  const { data: interventionsData } = useQuery({ queryKey: ["/api/ai-governance/interventions"] });
  const { data: policiesData } = useQuery({ queryKey: ["/api/ai-governance/policies"] });
  const { data: statsData } = useQuery({ queryKey: ["/api/ai-governance/stats"] });
  const { data: categoriesData } = useQuery({ queryKey: ["/api/ai-governance/config/categories"] });
  const { data: severitiesData } = useQuery({ queryKey: ["/api/ai-governance/config/severities"] });

  const createGuardrailMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/ai-governance/guardrails", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "تم الإنشاء" : "Created", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/guardrails"] });
      setShowNewGuardrail(false);
      setNewGuardrail({ name: "", nameAr: "", category: "action", description: "", descriptionAr: "", condition: "", conditionAr: "", severity: "warn", enabled: true });
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const toggleGuardrailMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/ai-governance/guardrails/${id}`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/guardrails"] });
    }
  });

  const deleteGuardrailMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/ai-governance/guardrails/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: isAr ? "تم الحذف" : "Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/guardrails"] });
    }
  });

  const resolveInterventionMutation = useMutation({
    mutationFn: async ({ id, type, notes }: { id: string; type: string; notes: string }) => {
      const response = await apiRequest("POST", `/api/ai-governance/interventions/${id}/resolve`, { type, notes });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "تم الحل" : "Resolved", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/interventions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/decisions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-governance/stats"] });
      setShowResolveDialog(false);
      setSelectedIntervention(null);
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const guardrails = guardrailsData?.data || [];
  const decisions = decisionsData?.data || [];
  const interventions = interventionsData?.data || [];
  const policies = policiesData?.data || [];
  const stats = statsData?.data || {};
  const categories = categoriesData?.data || [];
  const severities = severitiesData?.data || [];

  const pendingInterventions = interventions.filter((i: any) => i.status === 'pending');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "block": return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "warn": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "log": return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "auto-approved": return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "approved": return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "escalated": return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "rejected": return "bg-red-500/20 text-red-700 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "high": return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      default: return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 dark:text-red-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    if (score >= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const handleResolve = () => {
    if (!selectedIntervention) return;
    resolveInterventionMutation.mutate({
      id: selectedIntervention.id,
      type: resolveType,
      notes: resolveNotes
    });
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-panel-title">
              {isAr ? "نظام التحكم في الذكاء الاصطناعي" : "AI Governance System"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "الحواجز وسجل القرارات والتدخل البشري" : "Guardrails, decision log, and human-in-the-loop"}
            </p>
          </div>
        </div>
        {pendingInterventions.length > 0 && (
          <Badge variant="destructive" className="gap-1" data-testid="badge-pending-count">
            <AlertOctagon className="w-3 h-3" />
            {pendingInterventions.length} {isAr ? "تدخلات معلقة" : "pending interventions"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold" data-testid="text-total-decisions">{stats.totalDecisions || 0}</div>
            <p className="text-sm text-muted-foreground">{isAr ? "إجمالي القرارات" : "Total Decisions"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="text-auto-approved">{stats.autoApproved || 0}</div>
            <p className="text-sm text-muted-foreground">{isAr ? "موافقة تلقائية" : "Auto Approved"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-600" data-testid="text-human-reviewed">{stats.humanReviewed || 0}</div>
            <p className="text-sm text-muted-foreground">{isAr ? "مراجعة بشرية" : "Human Reviewed"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <div className={`text-2xl font-bold ${getRiskColor(stats.averageRiskScore || 0)}`} data-testid="text-avg-risk">{stats.averageRiskScore || 0}</div>
            <p className="text-sm text-muted-foreground">{isAr ? "متوسط المخاطر" : "Avg Risk Score"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="guardrails" className="gap-2" data-testid="tab-guardrails">
            <ShieldAlert className="w-4 h-4" />
            {isAr ? "الحواجز" : "Guardrails"}
          </TabsTrigger>
          <TabsTrigger value="decisions" className="gap-2" data-testid="tab-decisions">
            <FileText className="w-4 h-4" />
            {isAr ? "القرارات" : "Decisions"}
          </TabsTrigger>
          <TabsTrigger value="interventions" className="gap-2" data-testid="tab-interventions">
            <User className="w-4 h-4" />
            {isAr ? "التدخلات" : "Interventions"}
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2" data-testid="tab-policies">
            <Lock className="w-4 h-4" />
            {isAr ? "السياسات" : "Policies"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guardrails" className="space-y-4">
          <div className="flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button onClick={() => setShowNewGuardrail(true)} disabled={!isOwner} data-testid="button-new-guardrail">
                    <Plus className="w-4 h-4 me-2" />
                    {isAr ? "حاجز جديد" : "New Guardrail"}
                  </Button>
                </span>
              </TooltipTrigger>
              {!isOwner && <TooltipContent>{isAr ? "صلاحية المالك مطلوبة" : "Owner access required"}</TooltipContent>}
            </Tooltip>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {guardrails.map((g: any) => (
                <Card key={g.id} className={g.enabled ? "" : "opacity-60"}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {g.severity === 'block' ? <ShieldX className="w-5 h-5 text-red-500" /> : g.severity === 'warn' ? <ShieldAlert className="w-5 h-5 text-yellow-500" /> : <ShieldCheck className="w-5 h-5 text-blue-500" />}
                        <div>
                          <h4 className="font-medium" data-testid={`text-guardrail-name-${g.id}`}>{isAr ? g.nameAr : g.name}</h4>
                          <p className="text-sm text-muted-foreground">{isAr ? g.descriptionAr : g.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(g.severity)} data-testid={`badge-guardrail-severity-${g.id}`}>
                          {g.severity}
                        </Badge>
                        <Badge variant="outline" data-testid={`badge-guardrail-category-${g.id}`}>
                          {g.category}
                        </Badge>
                        <Switch checked={g.enabled} onCheckedChange={(enabled) => isOwner && toggleGuardrailMutation.mutate({ id: g.id, enabled })} disabled={!isOwner} data-testid={`switch-guardrail-${g.id}`} />
                        {isOwner && (
                          <Button size="icon" variant="ghost" onClick={() => deleteGuardrailMutation.mutate(g.id)} data-testid={`button-delete-guardrail-${g.id}`}>
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1">
                      <code>{isAr ? g.conditionAr : g.condition}</code>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          {decisions.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{isAr ? "لا توجد قرارات مسجلة" : "No decisions logged"}</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {decisions.map((d: any) => (
                  <Card key={d.id} className="hover-elevate">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <div>
                          <h4 className="font-medium" data-testid={`text-decision-action-${d.id}`}>{isAr ? d.actionAr : d.action}</h4>
                          <p className="text-sm text-muted-foreground">{d.userId} - {new Date(d.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(d.status)} data-testid={`badge-decision-status-${d.id}`}>
                            {d.status}
                          </Badge>
                          <span className={`font-bold ${getRiskColor(d.riskScore)}`} data-testid={`text-decision-risk-${d.id}`}>
                            {d.riskScore}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{isAr ? d.reasoningAr : d.reasoning}</p>
                      {d.guardrailsTriggered.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {d.guardrailsTriggered.map((gId: string) => (
                            <Badge key={gId} variant="outline" className="text-xs" data-testid={`badge-triggered-${d.id}-${gId}`}>
                              {gId}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {d.humanReview && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">{isAr ? "مراجعة بشرية:" : "Human Review:"}</span> {d.humanReview.type} by {d.humanReview.resolvedBy}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          {interventions.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{isAr ? "لا توجد تدخلات" : "No interventions"}</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {interventions.map((i: any) => (
                  <Card key={i.id} className={i.status === 'pending' ? "border-yellow-500/50" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <div>
                          <h4 className="font-medium" data-testid={`text-intervention-action-${i.id}`}>{i.originalAction}</h4>
                          <p className="text-sm text-muted-foreground">{isAr ? i.reasonAr : i.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(i.priority)} data-testid={`badge-intervention-priority-${i.id}`}>
                            {i.priority}
                          </Badge>
                          <Badge className={getStatusColor(i.status)} data-testid={`badge-intervention-status-${i.id}`}>
                            {i.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{isAr ? "طلب:" : "Requested:"} {new Date(i.requestedAt).toLocaleString()}</span>
                        {i.status === 'pending' && (
                          <span className="text-yellow-600">{isAr ? "ينتهي:" : "Expires:"} {new Date(i.expiresAt).toLocaleString()}</span>
                        )}
                      </div>
                      {i.status === 'pending' && isOwner && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => { setSelectedIntervention(i); setResolveType('approval'); setShowResolveDialog(true); }} data-testid={`button-approve-${i.id}`}>
                            <ThumbsUp className="w-4 h-4 me-1" />
                            {isAr ? "موافقة" : "Approve"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedIntervention(i); setResolveType('rejection'); setShowResolveDialog(true); }} data-testid={`button-reject-${i.id}`}>
                            <ThumbsDown className="w-4 h-4 me-1" />
                            {isAr ? "رفض" : "Reject"}
                          </Button>
                        </div>
                      )}
                      {i.resolvedBy && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium">{isAr ? "تم الحل:" : "Resolved:"}</span> {i.type} by {i.resolvedBy}
                          {i.notes && <p className="mt-1">{i.notes}</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {policies.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div>
                        <h4 className="font-medium" data-testid={`text-policy-name-${p.id}`}>{isAr ? p.nameAr : p.name}</h4>
                        <p className="text-sm text-muted-foreground">{isAr ? p.descriptionAr : p.description}</p>
                      </div>
                      <Badge variant={p.enabled ? "default" : "secondary"} data-testid={`badge-policy-status-${p.id}`}>
                        {p.enabled ? (isAr ? "مفعّل" : "Enabled") : (isAr ? "معطّل" : "Disabled")}
                      </Badge>
                    </div>
                    <div className="space-y-1 mt-2">
                      {p.rules.map((r: any) => (
                        <div key={r.id} className="text-sm bg-muted/50 rounded px-2 py-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{r.action}</Badge>
                          <code className="text-xs">{r.condition}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewGuardrail} onOpenChange={setShowNewGuardrail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? "حاجز جديد" : "New Guardrail"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
                <Input value={newGuardrail.name} onChange={(e) => setNewGuardrail({...newGuardrail, name: e.target.value})} data-testid="input-guardrail-name" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
                <Input value={newGuardrail.nameAr} onChange={(e) => setNewGuardrail({...newGuardrail, nameAr: e.target.value})} data-testid="input-guardrail-name-ar" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? "الفئة" : "Category"}</Label>
                <Select value={newGuardrail.category} onValueChange={(v) => setNewGuardrail({...newGuardrail, category: v})}>
                  <SelectTrigger data-testid="select-guardrail-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{isAr ? c.nameAr : c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? "الشدة" : "Severity"}</Label>
                <Select value={newGuardrail.severity} onValueChange={(v) => setNewGuardrail({...newGuardrail, severity: v})}>
                  <SelectTrigger data-testid="select-guardrail-severity"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {severities.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الوصف" : "Description"}</Label>
              <Textarea value={newGuardrail.description} onChange={(e) => setNewGuardrail({...newGuardrail, description: e.target.value})} data-testid="textarea-guardrail-description" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الشرط" : "Condition"}</Label>
              <Input value={newGuardrail.condition} onChange={(e) => setNewGuardrail({...newGuardrail, condition: e.target.value})} placeholder="action.type === 'delete'" data-testid="input-guardrail-condition" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGuardrail(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={() => createGuardrailMutation.mutate(newGuardrail)} disabled={createGuardrailMutation.isPending} data-testid="button-create-guardrail">
              {createGuardrailMutation.isPending && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {isAr ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? "حل التدخل" : "Resolve Intervention"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isAr ? "نوع الحل" : "Resolution Type"}</Label>
              <Select value={resolveType} onValueChange={setResolveType}>
                <SelectTrigger data-testid="select-resolve-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">{isAr ? "موافقة" : "Approve"}</SelectItem>
                  <SelectItem value="rejection">{isAr ? "رفض" : "Reject"}</SelectItem>
                  <SelectItem value="modification">{isAr ? "تعديل" : "Modify"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
              <Textarea value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} placeholder={isAr ? "سبب القرار..." : "Reason for decision..."} data-testid="textarea-resolve-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleResolve} disabled={resolveInterventionMutation.isPending} data-testid="button-confirm-resolve">
              {resolveInterventionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin me-2" />}
              {isAr ? "تأكيد" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
