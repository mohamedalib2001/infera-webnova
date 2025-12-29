/**
 * INFERA WebNova - Governance Core Panel
 * لوحة نواة الحوكمة واتخاذ القرار
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Scale, 
  Users, 
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Settings,
  Lock,
  Unlock
} from "lucide-react";

interface Policy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: string;
  targetRoles: string[];
  actions: string[];
  effect: string;
  conditions: any[];
  restrictions?: string[];
  requiredApprovals?: string[];
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PendingApproval {
  id: string;
  context: {
    actor: { email: string; role: string };
    action: string;
    resource: string;
    sector: string;
    timestamp: string;
  };
}

interface AuditLog {
  id: string;
  decisionId: string;
  actor: { email: string; role: string };
  decision: { result: string; reason: string; reasonAr: string };
  timestamp: string;
}

const SECTORS = ['all', 'financial', 'healthcare', 'government', 'education', 'enterprise', 'general'];
const ROLES = ['root_owner', 'owner', 'developer', 'operator', 'user', 'guest'];
const ACTIONS = ['build', 'deploy', 'modify', 'delete', 'access', 'configure', 'export', 'import'];
const EFFECTS = ['allow', 'deny', 'restrict', 'require_approval'];

export default function GovernanceCorePanel() {
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // New policy form
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    sector: 'all',
    targetRoles: [] as string[],
    actions: [] as string[],
    effect: 'allow',
    priority: 500,
    enabled: true
  });

  // Test evaluation form
  const [testActor, setTestActor] = useState({ email: '', role: 'developer' });
  const [testAction, setTestAction] = useState('build');
  const [testSector, setTestSector] = useState('general');
  const [testResource, setTestResource] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const statsQuery = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/governance/stats"]
  });

  const policiesQuery = useQuery<{ success: boolean; data: Policy[] }>({
    queryKey: ["/api/governance/policies"]
  });

  const pendingQuery = useQuery<{ success: boolean; data: PendingApproval[] }>({
    queryKey: ["/api/governance/approvals/pending"]
  });

  const auditQuery = useQuery<{ success: boolean; data: AuditLog[] }>({
    queryKey: ["/api/governance/audit-logs"]
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/governance/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/governance/policies"] });
    queryClient.invalidateQueries({ queryKey: ["/api/governance/approvals/pending"] });
    queryClient.invalidateQueries({ queryKey: ["/api/governance/audit-logs"] });
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.name || newPolicy.targetRoles.length === 0 || newPolicy.actions.length === 0) {
      toast({ title: "Missing Info | معلومات ناقصة", description: "Fill all required fields", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiRequest("POST", "/api/governance/policies", newPolicy);
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        setNewPolicy({ name: '', nameAr: '', description: '', descriptionAr: '', sector: 'all', targetRoles: [], actions: [], effect: 'allow', priority: 500, enabled: true });
        toast({ title: "Created | تم الإنشاء", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePolicy = async (id: string, enabled: boolean) => {
    try {
      const response = await apiRequest("PATCH", `/api/governance/policies/${id}`, { enabled });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: enabled ? "Enabled | مفعّل" : "Disabled | معطّل", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      const response = await apiRequest("DELETE", `/api/governance/policies/${id}`, {});
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        setSelectedPolicy(null);
        toast({ title: "Deleted | تم الحذف", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await apiRequest("POST", `/api/governance/approvals/${id}/approve`, {});
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Approved | تمت الموافقة", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await apiRequest("POST", `/api/governance/approvals/${id}/reject`, {
        reason: "Rejected by administrator",
        reasonAr: "مرفوض من قبل المسؤول"
      });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Rejected | تم الرفض", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const handleTestEvaluation = async () => {
    if (!testResource) {
      toast({ title: "Missing Resource | مورد مفقود", variant: "destructive" });
      return;
    }

    try {
      // Use simulateRole to test decisions for different roles (server constructs actor from templates)
      const response = await apiRequest("POST", "/api/governance/evaluate", {
        simulateRole: testActor.role,
        action: testAction,
        resource: testResource,
        resourceType: 'platform',
        sector: testSector,
        organizationId: 'default'
      });
      const data = await response.json();
      if (data.success) {
        setEvaluationResult(data.data);
      }
    } catch (error: any) {
      toast({ title: "Evaluation Failed | فشل التقييم", description: error.message, variant: "destructive" });
    }
  };

  const stats = statsQuery.data?.data;
  const policies = policiesQuery.data?.data || [];
  const pending = pendingQuery.data?.data || [];
  const auditLogs = auditQuery.data?.data || [];

  const getEffectBadge = (effect: string) => {
    switch (effect) {
      case 'allow': return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Allow</Badge>;
      case 'deny': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Deny</Badge>;
      case 'restrict': return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Restrict</Badge>;
      case 'require_approval': return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Approval</Badge>;
      default: return <Badge variant="outline">{effect}</Badge>;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'allowed': return <Badge className="bg-green-500">Allowed</Badge>;
      case 'denied': return <Badge variant="destructive">Denied</Badge>;
      case 'restricted': return <Badge variant="secondary">Restricted</Badge>;
      case 'pending_approval': return <Badge variant="outline">Pending</Badge>;
      default: return <Badge variant="outline">{result}</Badge>;
    }
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4" data-testid="governance-core-panel">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Governance Core
            <span className="text-muted-foreground text-lg">| نواة الحوكمة</span>
          </h2>
          <p className="text-muted-foreground">
            Smart governance engine, policy management, and permission separation
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => invalidateAll()} data-testid="button-refresh-governance">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card data-testid="card-total-policies">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalPolicies}</div>
              <p className="text-sm text-muted-foreground">Policies | سياسات</p>
            </CardContent>
          </Card>
          <Card data-testid="card-enabled-policies">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.enabledPolicies}</div>
              <p className="text-sm text-muted-foreground">Enabled | مفعّل</p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-decisions">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalDecisions}</div>
              <p className="text-sm text-muted-foreground">Decisions | قرارات</p>
            </CardContent>
          </Card>
          <Card data-testid="card-pending-approvals">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-sm text-muted-foreground">Pending | معلّق</p>
            </CardContent>
          </Card>
          <Card data-testid="card-audit-logs">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.auditLogsCount}</div>
              <p className="text-sm text-muted-foreground">Audit Logs | سجلات</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="policies" className="flex-1">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="policies" data-testid="tab-policies">
            <Scale className="w-4 h-4 mr-1" />Policies
          </TabsTrigger>
          <TabsTrigger value="approvals" data-testid="tab-approvals">
            <Clock className="w-4 h-4 mr-1" />Approvals
          </TabsTrigger>
          <TabsTrigger value="evaluate" data-testid="tab-evaluate">
            <FileCheck className="w-4 h-4 mr-1" />Test
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Eye className="w-4 h-4 mr-1" />Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Policy | إنشاء سياسة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Policy Name" value={newPolicy.name} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} data-testid="input-policy-name" />
                    <Input placeholder="الاسم بالعربي" dir="rtl" value={newPolicy.nameAr} onChange={e => setNewPolicy({...newPolicy, nameAr: e.target.value})} data-testid="input-policy-name-ar" />
                  </div>
                  
                  <Select value={newPolicy.sector} onValueChange={v => setNewPolicy({...newPolicy, sector: v})}>
                    <SelectTrigger data-testid="select-policy-sector"><SelectValue placeholder="Sector" /></SelectTrigger>
                    <SelectContent>
                      {SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <div>
                    <label className="text-sm font-medium">Target Roles | الأدوار المستهدفة</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ROLES.map(role => (
                        <Badge key={role} variant={newPolicy.targetRoles.includes(role) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayItem(newPolicy.targetRoles, role, (arr) => setNewPolicy({...newPolicy, targetRoles: arr}))} data-testid={`badge-role-${role}`}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Actions | الإجراءات</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ACTIONS.map(action => (
                        <Badge key={action} variant={newPolicy.actions.includes(action) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleArrayItem(newPolicy.actions, action, (arr) => setNewPolicy({...newPolicy, actions: arr}))} data-testid={`badge-action-${action}`}>
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Select value={newPolicy.effect} onValueChange={v => setNewPolicy({...newPolicy, effect: v})}>
                      <SelectTrigger className="w-40" data-testid="select-policy-effect"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EFFECTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Priority" value={newPolicy.priority} onChange={e => setNewPolicy({...newPolicy, priority: parseInt(e.target.value) || 500})} className="w-24" data-testid="input-policy-priority" />
                  </div>

                  <Button onClick={handleCreatePolicy} disabled={isCreating} className="w-full" data-testid="button-create-policy">
                    {isCreating ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Policy | إنشاء سياسة
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Policies | السياسات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {policies.map(policy => (
                        <div key={policy.id} className={`p-3 rounded-md border cursor-pointer hover-elevate ${selectedPolicy?.id === policy.id ? 'border-primary bg-accent' : ''}`} onClick={() => setSelectedPolicy(policy)} data-testid={`policy-item-${policy.id}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {policy.enabled ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                              <span className="font-medium truncate">{policy.name}</span>
                            </div>
                            {getEffectBadge(policy.effect)}
                          </div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <Badge variant="outline" size="sm">{policy.sector}</Badge>
                            <Badge variant="secondary" size="sm">P:{policy.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {selectedPolicy && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedPolicy.name}</CardTitle>
                    <div className="flex gap-2 items-center">
                      <Switch checked={selectedPolicy.enabled} onCheckedChange={(v) => handleTogglePolicy(selectedPolicy.id, v)} data-testid="switch-policy-enabled" />
                      <Button variant="destructive" size="icon" onClick={() => handleDeletePolicy(selectedPolicy.id)} data-testid="button-delete-policy">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription dir="rtl">{selectedPolicy.nameAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-muted-foreground">{selectedPolicy.description}</p>
                        <p className="text-muted-foreground" dir="rtl">{selectedPolicy.descriptionAr}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium">Sector | القطاع</label>
                        <Badge variant="outline" className="ml-2">{selectedPolicy.sector}</Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Target Roles | الأدوار</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPolicy.targetRoles.map(role => (
                            <Badge key={role} variant="secondary">{role}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Actions | الإجراءات</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPolicy.actions.map(action => (
                            <Badge key={action}>{action}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Effect | التأثير</label>
                        <div className="mt-1">{getEffectBadge(selectedPolicy.effect)}</div>
                      </div>
                      {selectedPolicy.restrictions && selectedPolicy.restrictions.length > 0 && (
                        <div>
                          <label className="text-sm font-medium">Restrictions | القيود</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPolicy.restrictions.map((r, i) => (
                              <Badge key={i} variant="outline">{r}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        <p>Priority: {selectedPolicy.priority}</p>
                        <p>Created: {new Date(selectedPolicy.createdAt).toLocaleString()}</p>
                        <p>Updated: {new Date(selectedPolicy.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Approvals | الموافقات المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {pending.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending approvals | لا توجد موافقات معلقة</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map(item => (
                      <div key={item.id} className="p-4 border rounded-md" data-testid={`approval-item-${item.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.context.actor.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.context.action} on {item.context.resource}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline">{item.context.sector}</Badge>
                              <Badge variant="secondary">{item.context.actor.role}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(item.id)} data-testid={`button-approve-${item.id}`}>
                              <CheckCircle className="w-4 h-4 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)} data-testid={`button-reject-${item.id}`}>
                              <XCircle className="w-4 h-4 mr-1" />Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Test Evaluation | اختبار التقييم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Actor Email" value={testActor.email} onChange={e => setTestActor({...testActor, email: e.target.value})} data-testid="input-test-email" />
                  <Select value={testActor.role} onValueChange={v => setTestActor({...testActor, role: v})}>
                    <SelectTrigger data-testid="select-test-role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={testAction} onValueChange={setTestAction}>
                    <SelectTrigger data-testid="select-test-action"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={testSector} onValueChange={setTestSector}>
                    <SelectTrigger data-testid="select-test-sector"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECTORS.filter(s => s !== 'all').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Resource (e.g., platform-123)" value={testResource} onChange={e => setTestResource(e.target.value)} data-testid="input-test-resource" />
                <Button onClick={handleTestEvaluation} className="w-full" data-testid="button-test-evaluate">
                  <FileCheck className="w-4 h-4 mr-1" />
                  Evaluate | تقييم
                </Button>
              </CardContent>
            </Card>

            {evaluationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Evaluation Result | نتيجة التقييم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Decision:</span>
                      {getResultBadge(evaluationResult.result)}
                    </div>
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-muted-foreground">{evaluationResult.reason}</p>
                      <p className="text-muted-foreground" dir="rtl">{evaluationResult.reasonAr}</p>
                    </div>
                    {evaluationResult.appliedPolicies?.length > 0 && (
                      <div>
                        <span className="font-medium">Applied Policies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluationResult.appliedPolicies.map((p: string, i: number) => (
                            <Badge key={i} variant="outline">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {evaluationResult.restrictions?.length > 0 && (
                      <div>
                        <span className="font-medium">Restrictions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {evaluationResult.restrictions.map((r: string, i: number) => (
                            <Badge key={i} variant="secondary">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Audit Logs | سجلات المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-3 border rounded-md" data-testid={`audit-log-${log.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.actor.email}</span>
                          <Badge variant="outline" size="sm">{log.actor.role}</Badge>
                        </div>
                        {getResultBadge(log.decision.result)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.decision.reason}</p>
                      <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No audit logs | لا توجد سجلات</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
