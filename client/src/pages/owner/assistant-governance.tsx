import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Network, 
  MessageSquare, 
  History, 
  Shield, 
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  ArrowRight,
  Link2,
  Unlink,
  UserPlus,
  Clock,
  AlertTriangle,
  Bot,
  Brain
} from "lucide-react";

interface AssistantRelationship {
  id: string;
  sourceAssistantId: string;
  targetAssistantId: string;
  relationshipType: string;
  trustScore: number;
  canDelegate: boolean;
  canSupervise: boolean;
  sharedCapabilities: string[];
  restrictedCapabilities: string[];
  isEnabled: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssistantConversation {
  id: string;
  relationshipId: string;
  senderAssistantId: string;
  receiverAssistantId: string;
  messageType: string;
  content: string;
  metadata?: any;
  isRead: boolean;
  isProcessed: boolean;
  createdAt: string;
}

interface AssistantWorkgroup {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  description?: string;
  memberAssistantIds: string[];
  leadAssistantId?: string;
  purpose?: string;
  sharedGoals?: string[];
  communicationRules?: any;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface PermissionAudit {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  previousState?: any;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
}

interface GovernanceSummary {
  summary: {
    totalCapabilities: number;
    enabledCapabilities: number;
    totalRelationships: number;
    enabledRelationships: number;
    totalWorkgroups: number;
    activeWorkgroups: number;
    recentAuditActions: number;
  };
  capabilities: any[];
  relationships: AssistantRelationship[];
  workgroups: AssistantWorkgroup[];
  recentAudits: PermissionAudit[];
}

const RELATIONSHIP_TYPES = [
  { value: "supervisor", label: "Supervisor", labelAr: "مشرف", description: "Can oversee and guide the target assistant" },
  { value: "peer", label: "Peer", labelAr: "نظير", description: "Equal collaboration level" },
  { value: "subordinate", label: "Subordinate", labelAr: "تابع", description: "Reports to the source assistant" },
  { value: "specialist", label: "Specialist", labelAr: "متخصص", description: "Expert in specific domain" },
  { value: "collaborator", label: "Collaborator", labelAr: "متعاون", description: "Works together on shared goals" },
];

const MESSAGE_TYPES = [
  { value: "instruction", label: "Instruction", labelAr: "تعليمات" },
  { value: "query", label: "Query", labelAr: "استفسار" },
  { value: "response", label: "Response", labelAr: "رد" },
  { value: "delegation", label: "Delegation", labelAr: "تفويض" },
  { value: "notification", label: "Notification", labelAr: "إشعار" },
  { value: "status_update", label: "Status Update", labelAr: "تحديث الحالة" },
];

const CAPABILITY_OPTIONS = [
  "CODE_GENERATE", "CODE_EDIT", "CODE_DELETE", "CODE_REFACTOR", "CODE_ANALYZE",
  "FILE_READ", "FILE_WRITE", "FILE_DELETE", "FILE_MOVE",
  "API_CALL_INTERNAL", "API_CALL_EXTERNAL", "WEBHOOK_SEND",
  "DB_READ", "DB_WRITE", "DB_DELETE", "DB_SCHEMA_MODIFY",
  "DEPLOY_PREVIEW", "DEPLOY_PRODUCTION", "ROLLBACK",
  "AI_AUTONOMOUS_ACTION", "AI_CHAIN_COMMANDS", "AI_SPAWN_AGENTS"
];

export default function AssistantGovernancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false);
  const [showWorkgroupDialog, setShowWorkgroupDialog] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<AssistantRelationship | null>(null);
  const [editingWorkgroup, setEditingWorkgroup] = useState<AssistantWorkgroup | null>(null);

  const [newRelationship, setNewRelationship] = useState({
    sourceAssistantId: "",
    targetAssistantId: "",
    relationshipType: "peer",
    trustScore: 50,
    canDelegate: false,
    canSupervise: false,
    sharedCapabilities: [] as string[],
    restrictedCapabilities: [] as string[],
  });

  const [newWorkgroup, setNewWorkgroup] = useState({
    code: "",
    nameEn: "",
    nameAr: "",
    description: "",
    memberAssistantIds: [] as string[],
    leadAssistantId: "",
    purpose: "",
  });

  const { data: governanceSummary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery<GovernanceSummary>({
    queryKey: ["/api/assistant/governance-summary"],
  });

  const { data: relationships = [], isLoading: loadingRelationships } = useQuery<AssistantRelationship[]>({
    queryKey: ["/api/assistant/relationships"],
  });

  const { data: workgroups = [], isLoading: loadingWorkgroups } = useQuery<AssistantWorkgroup[]>({
    queryKey: ["/api/assistant/workgroups"],
  });

  const { data: conversations = [], isLoading: loadingConversations } = useQuery<AssistantConversation[]>({
    queryKey: ["/api/assistant/conversations"],
  });

  const { data: audits = [], isLoading: loadingAudits } = useQuery<PermissionAudit[]>({
    queryKey: ["/api/assistant/audit"],
  });

  const createRelationshipMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assistant/relationships", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/relationships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Relationship Created", description: "Assistant relationship has been created successfully." });
      setShowRelationshipDialog(false);
      resetRelationshipForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create relationship.", variant: "destructive" });
    },
  });

  const updateRelationshipMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/assistant/relationships/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/relationships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Relationship Updated", description: "Assistant relationship has been updated." });
      setShowRelationshipDialog(false);
      setEditingRelationship(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update relationship.", variant: "destructive" });
    },
  });

  const toggleRelationshipMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const res = await apiRequest("POST", `/api/assistant/relationships/${id}/toggle`, { isEnabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/relationships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Relationship Toggled", description: "Relationship status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to toggle relationship.", variant: "destructive" });
    },
  });

  const deleteRelationshipMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assistant/relationships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/relationships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Relationship Deleted", description: "Relationship has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete relationship.", variant: "destructive" });
    },
  });

  const createWorkgroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assistant/workgroups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/workgroups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Workgroup Created", description: "Workgroup has been created successfully." });
      setShowWorkgroupDialog(false);
      resetWorkgroupForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create workgroup.", variant: "destructive" });
    },
  });

  const updateWorkgroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/assistant/workgroups/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/workgroups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Workgroup Updated", description: "Workgroup has been updated." });
      setShowWorkgroupDialog(false);
      setEditingWorkgroup(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update workgroup.", variant: "destructive" });
    },
  });

  const toggleWorkgroupMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("POST", `/api/assistant/workgroups/${id}/toggle`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/workgroups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Workgroup Toggled", description: "Workgroup status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to toggle workgroup.", variant: "destructive" });
    },
  });

  const deleteWorkgroupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assistant/workgroups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/workgroups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assistant/governance-summary"] });
      toast({ title: "Workgroup Deleted", description: "Workgroup has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete workgroup.", variant: "destructive" });
    },
  });

  const resetRelationshipForm = () => {
    setNewRelationship({
      sourceAssistantId: "",
      targetAssistantId: "",
      relationshipType: "peer",
      trustScore: 50,
      canDelegate: false,
      canSupervise: false,
      sharedCapabilities: [],
      restrictedCapabilities: [],
    });
  };

  const resetWorkgroupForm = () => {
    setNewWorkgroup({
      code: "",
      nameEn: "",
      nameAr: "",
      description: "",
      memberAssistantIds: [],
      leadAssistantId: "",
      purpose: "",
    });
  };

  const handleEditRelationship = (relationship: AssistantRelationship) => {
    setEditingRelationship(relationship);
    setNewRelationship({
      sourceAssistantId: relationship.sourceAssistantId,
      targetAssistantId: relationship.targetAssistantId,
      relationshipType: relationship.relationshipType,
      trustScore: relationship.trustScore,
      canDelegate: relationship.canDelegate,
      canSupervise: relationship.canSupervise,
      sharedCapabilities: relationship.sharedCapabilities || [],
      restrictedCapabilities: relationship.restrictedCapabilities || [],
    });
    setShowRelationshipDialog(true);
  };

  const handleEditWorkgroup = (workgroup: AssistantWorkgroup) => {
    setEditingWorkgroup(workgroup);
    setNewWorkgroup({
      code: workgroup.code,
      nameEn: workgroup.nameEn,
      nameAr: workgroup.nameAr,
      description: workgroup.description || "",
      memberAssistantIds: workgroup.memberAssistantIds || [],
      leadAssistantId: workgroup.leadAssistantId || "",
      purpose: workgroup.purpose || "",
    });
    setShowWorkgroupDialog(true);
  };

  const handleSaveRelationship = () => {
    if (editingRelationship) {
      updateRelationshipMutation.mutate({ id: editingRelationship.id, data: newRelationship });
    } else {
      createRelationshipMutation.mutate(newRelationship);
    }
  };

  const handleSaveWorkgroup = () => {
    if (editingWorkgroup) {
      updateWorkgroupMutation.mutate({ id: editingWorkgroup.id, data: newWorkgroup });
    } else {
      createWorkgroupMutation.mutate(newWorkgroup);
    }
  };

  const getRelationshipTypeInfo = (type: string) => {
    return RELATIONSHIP_TYPES.find(t => t.value === type) || RELATIONSHIP_TYPES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Network className="h-8 w-8 text-primary" />
            AI Assistant Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            Sovereign control over AI assistant relationships, collaboration, and permissions
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetchSummary()}
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {governanceSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Capabilities</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-capabilities-count">
                {governanceSummary.summary.enabledCapabilities}/{governanceSummary.summary.totalCapabilities}
              </div>
              <p className="text-xs text-muted-foreground">Enabled capabilities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relationships</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-relationships-count">
                {governanceSummary.summary.enabledRelationships}/{governanceSummary.summary.totalRelationships}
              </div>
              <p className="text-xs text-muted-foreground">Active relationships</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workgroups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-workgroups-count">
                {governanceSummary.summary.activeWorkgroups}/{governanceSummary.summary.totalWorkgroups}
              </div>
              <p className="text-xs text-muted-foreground">Active workgroups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Audits</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-audits-count">
                {governanceSummary.summary.recentAuditActions}
              </div>
              <p className="text-xs text-muted-foreground">Actions tracked</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-[600px]">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="relationships" data-testid="tab-relationships">
            <Link2 className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="workgroups" data-testid="tab-workgroups">
            <Users className="h-4 w-4 mr-2" />
            Workgroups
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <History className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Recent Relationships
                </CardTitle>
                <CardDescription>Latest assistant collaboration links</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {loadingRelationships ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : relationships.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No relationships defined</div>
                  ) : (
                    <div className="space-y-3">
                      {relationships.slice(0, 5).map((rel) => (
                        <div 
                          key={rel.id} 
                          className="flex items-center justify-between gap-2 p-3 rounded-md border"
                          data-testid={`card-relationship-${rel.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={rel.isEnabled ? "default" : "secondary"}>
                              {getRelationshipTypeInfo(rel.relationshipType).label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Trust: {rel.trustScore}%
                            </span>
                          </div>
                          <Switch
                            checked={rel.isEnabled}
                            onCheckedChange={(checked) => 
                              toggleRelationshipMutation.mutate({ id: rel.id, isEnabled: checked })
                            }
                            data-testid={`switch-relationship-${rel.id}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Workgroups
                </CardTitle>
                <CardDescription>Team collaboration groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {loadingWorkgroups ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : workgroups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No workgroups defined</div>
                  ) : (
                    <div className="space-y-3">
                      {workgroups.slice(0, 5).map((group) => (
                        <div 
                          key={group.id} 
                          className="flex items-center justify-between gap-2 p-3 rounded-md border"
                          data-testid={`card-workgroup-${group.id}`}
                        >
                          <div>
                            <div className="font-medium">{group.nameEn}</div>
                            <div className="text-sm text-muted-foreground">
                              {group.memberAssistantIds?.length || 0} members
                            </div>
                          </div>
                          <Switch
                            checked={group.isActive}
                            onCheckedChange={(checked) => 
                              toggleWorkgroupMutation.mutate({ id: group.id, isActive: checked })
                            }
                            data-testid={`switch-workgroup-${group.id}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Permission Changes
              </CardTitle>
              <CardDescription>Immutable audit trail of all governance actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {loadingAudits ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : audits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No audit records</div>
                ) : (
                  <div className="space-y-2">
                    {audits.slice(0, 10).map((audit) => (
                      <div 
                        key={audit.id} 
                        className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                        data-testid={`row-audit-${audit.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {audit.action}
                          </Badge>
                          <span className="text-sm">{audit.entityType}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(audit.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Assistant Relationships</h2>
            <Button onClick={() => { resetRelationshipForm(); setEditingRelationship(null); setShowRelationshipDialog(true); }} data-testid="button-add-relationship">
              <Plus className="h-4 w-4 mr-2" />
              Add Relationship
            </Button>
          </div>

          {loadingRelationships ? (
            <div className="text-center py-8 text-muted-foreground">Loading relationships...</div>
          ) : relationships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Relationships Defined</h3>
                <p className="text-muted-foreground mb-4">Create relationships between AI assistants to enable collaboration</p>
                <Button onClick={() => setShowRelationshipDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Relationship
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {relationships.map((rel) => (
                <Card key={rel.id} data-testid={`card-relationship-detail-${rel.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge variant={rel.isEnabled ? "default" : "secondary"}>
                          {getRelationshipTypeInfo(rel.relationshipType).label}
                        </Badge>
                      </CardTitle>
                      <Switch
                        checked={rel.isEnabled}
                        onCheckedChange={(checked) => 
                          toggleRelationshipMutation.mutate({ id: rel.id, isEnabled: checked })
                        }
                      />
                    </div>
                    <CardDescription>
                      {rel.sourceAssistantId} <ArrowRight className="h-3 w-3 inline" /> {rel.targetAssistantId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trust Score</span>
                      <Badge variant="outline">{rel.trustScore}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Can Delegate</span>
                      {rel.canDelegate ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Can Supervise</span>
                      {rel.canSupervise ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    {rel.sharedCapabilities && rel.sharedCapabilities.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Shared: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rel.sharedCapabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                          ))}
                          {rel.sharedCapabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{rel.sharedCapabilities.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditRelationship(rel)} data-testid={`button-edit-relationship-${rel.id}`}>
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" data-testid={`button-delete-relationship-${rel.id}`}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Relationship?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this relationship and disable collaboration between these assistants.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRelationshipMutation.mutate(rel.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workgroups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Assistant Workgroups</h2>
            <Button onClick={() => { resetWorkgroupForm(); setEditingWorkgroup(null); setShowWorkgroupDialog(true); }} data-testid="button-add-workgroup">
              <Plus className="h-4 w-4 mr-2" />
              Create Workgroup
            </Button>
          </div>

          {loadingWorkgroups ? (
            <div className="text-center py-8 text-muted-foreground">Loading workgroups...</div>
          ) : workgroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Workgroups Defined</h3>
                <p className="text-muted-foreground mb-4">Create workgroups to enable team collaboration between AI assistants</p>
                <Button onClick={() => setShowWorkgroupDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Workgroup
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workgroups.map((group) => (
                <Card key={group.id} data-testid={`card-workgroup-detail-${group.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{group.nameEn}</CardTitle>
                      <Switch
                        checked={group.isActive}
                        onCheckedChange={(checked) => 
                          toggleWorkgroupMutation.mutate({ id: group.id, isActive: checked })
                        }
                      />
                    </div>
                    <CardDescription>{group.nameAr}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{group.description || group.purpose}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <Badge variant="outline">{group.memberAssistantIds?.length || 0}</Badge>
                    </div>
                    {group.leadAssistantId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lead</span>
                        <Badge>{group.leadAssistantId}</Badge>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditWorkgroup(group)} data-testid={`button-edit-workgroup-${group.id}`}>
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" data-testid={`button-delete-workgroup-${group.id}`}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Workgroup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this workgroup and disable team collaboration for its members.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteWorkgroupMutation.mutate(group.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <h2 className="text-xl font-semibold">Permission Audit Log</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Immutable Audit Trail
              </CardTitle>
              <CardDescription>All permission changes are permanently logged for compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {loadingAudits ? (
                  <div className="text-center py-8 text-muted-foreground">Loading audit log...</div>
                ) : audits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No audit records found</div>
                ) : (
                  <div className="space-y-2">
                    {audits.map((audit) => (
                      <div 
                        key={audit.id} 
                        className="p-4 rounded-md border"
                        data-testid={`row-audit-detail-${audit.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge>{audit.action}</Badge>
                            <Badge variant="outline">{audit.entityType}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(audit.createdAt)}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><span className="text-muted-foreground">Entity ID:</span> {audit.entityId}</div>
                          <div><span className="text-muted-foreground">Performed By:</span> {audit.performedBy}</div>
                          {audit.ipAddress && <div><span className="text-muted-foreground">IP:</span> {audit.ipAddress}</div>}
                          {audit.changes && (
                            <div>
                              <span className="text-muted-foreground">Changes:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(audit.changes, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRelationshipDialog} onOpenChange={setShowRelationshipDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRelationship ? "Edit Relationship" : "Create Relationship"}</DialogTitle>
            <DialogDescription>
              Define a collaboration relationship between AI assistants
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceAssistant">Source Assistant ID</Label>
                <Input
                  id="sourceAssistant"
                  value={newRelationship.sourceAssistantId}
                  onChange={(e) => setNewRelationship({ ...newRelationship, sourceAssistantId: e.target.value })}
                  placeholder="e.g., assistant-1"
                  data-testid="input-source-assistant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAssistant">Target Assistant ID</Label>
                <Input
                  id="targetAssistant"
                  value={newRelationship.targetAssistantId}
                  onChange={(e) => setNewRelationship({ ...newRelationship, targetAssistantId: e.target.value })}
                  placeholder="e.g., assistant-2"
                  data-testid="input-target-assistant"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationshipType">Relationship Type</Label>
              <Select
                value={newRelationship.relationshipType}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, relationshipType: value })}
              >
                <SelectTrigger data-testid="select-relationship-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trust Score: {newRelationship.trustScore}%</Label>
              <Slider
                value={[newRelationship.trustScore]}
                onValueChange={(value) => setNewRelationship({ ...newRelationship, trustScore: value[0] })}
                min={0}
                max={100}
                step={5}
                data-testid="slider-trust-score"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="canDelegate"
                  checked={newRelationship.canDelegate}
                  onCheckedChange={(checked) => setNewRelationship({ ...newRelationship, canDelegate: checked })}
                  data-testid="switch-can-delegate"
                />
                <Label htmlFor="canDelegate">Can Delegate Tasks</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="canSupervise"
                  checked={newRelationship.canSupervise}
                  onCheckedChange={(checked) => setNewRelationship({ ...newRelationship, canSupervise: checked })}
                  data-testid="switch-can-supervise"
                />
                <Label htmlFor="canSupervise">Can Supervise</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Shared Capabilities</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                {CAPABILITY_OPTIONS.map((cap) => (
                  <Badge
                    key={cap}
                    variant={newRelationship.sharedCapabilities.includes(cap) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = newRelationship.sharedCapabilities;
                      const updated = current.includes(cap)
                        ? current.filter((c) => c !== cap)
                        : [...current, cap];
                      setNewRelationship({ ...newRelationship, sharedCapabilities: updated });
                    }}
                    data-testid={`badge-shared-${cap}`}
                  >
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelationshipDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRelationship}
              disabled={!newRelationship.sourceAssistantId || !newRelationship.targetAssistantId}
              data-testid="button-save-relationship"
            >
              {editingRelationship ? "Update" : "Create"} Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkgroupDialog} onOpenChange={setShowWorkgroupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorkgroup ? "Edit Workgroup" : "Create Workgroup"}</DialogTitle>
            <DialogDescription>
              Define a team collaboration group for AI assistants
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workgroupCode">Workgroup Code</Label>
                <Input
                  id="workgroupCode"
                  value={newWorkgroup.code}
                  onChange={(e) => setNewWorkgroup({ ...newWorkgroup, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  placeholder="e.g., DEV_TEAM"
                  data-testid="input-workgroup-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workgroupLead">Lead Assistant ID</Label>
                <Input
                  id="workgroupLead"
                  value={newWorkgroup.leadAssistantId}
                  onChange={(e) => setNewWorkgroup({ ...newWorkgroup, leadAssistantId: e.target.value })}
                  placeholder="e.g., senior-assistant"
                  data-testid="input-workgroup-lead"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  value={newWorkgroup.nameEn}
                  onChange={(e) => setNewWorkgroup({ ...newWorkgroup, nameEn: e.target.value })}
                  placeholder="Development Team"
                  data-testid="input-workgroup-name-en"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  value={newWorkgroup.nameAr}
                  onChange={(e) => setNewWorkgroup({ ...newWorkgroup, nameAr: e.target.value })}
                  placeholder="فريق التطوير"
                  dir="rtl"
                  data-testid="input-workgroup-name-ar"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newWorkgroup.description}
                onChange={(e) => setNewWorkgroup({ ...newWorkgroup, description: e.target.value })}
                placeholder="Describe the purpose and goals of this workgroup..."
                data-testid="input-workgroup-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={newWorkgroup.purpose}
                onChange={(e) => setNewWorkgroup({ ...newWorkgroup, purpose: e.target.value })}
                placeholder="e.g., Code development and review"
                data-testid="input-workgroup-purpose"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkgroupDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveWorkgroup}
              disabled={!newWorkgroup.code || !newWorkgroup.nameEn}
              data-testid="button-save-workgroup"
            >
              {editingWorkgroup ? "Update" : "Create"} Workgroup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
