/**
 * INFERA WebNova - Architectural Knowledge Management Panel
 * لوحة نظام إدارة المعرفة المعمارية
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BookOpen,
  Plus,
  Search,
  GitCompare,
  Lightbulb,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Scale,
  Layers,
  History,
  Tag,
  ArrowRight
} from "lucide-react";

interface ArchitecturalKnowledgePanelProps {
  language?: "en" | "ar";
  isOwner?: boolean;
}

export function ArchitecturalKnowledgePanel({ language = "en", isOwner = false }: ArchitecturalKnowledgePanelProps) {
  const { toast } = useToast();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState("decisions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showNewDecisionDialog, setShowNewDecisionDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showSuggestDialog, setShowSuggestDialog] = useState(false);

  const [newDecision, setNewDecision] = useState({
    title: "", titleAr: "", category: "api", status: "proposed",
    context: "", contextAr: "", decision: "", decisionAr: "",
    rationale: "", rationaleAr: "", priority: "medium", tags: ""
  });

  const [constraints, setConstraints] = useState({
    teamSize: 5, maxDays: 90, users: 10000, latency: 200
  });

  const [compareDesigns, setCompareDesigns] = useState([
    { id: "d1", name: "", nameAr: "", description: "", descriptionAr: "", patterns: [], technologies: [] },
    { id: "d2", name: "", nameAr: "", description: "", descriptionAr: "", patterns: [], technologies: [] }
  ]);

  const [compareCriteria] = useState([
    { id: "c1", name: "Scalability", nameAr: "قابلية التوسع", weight: 0.25, description: "Ability to scale", descriptionAr: "القدرة على التوسع" },
    { id: "c2", name: "Maintainability", nameAr: "قابلية الصيانة", weight: 0.25, description: "Ease of maintenance", descriptionAr: "سهولة الصيانة" },
    { id: "c3", name: "Performance", nameAr: "الأداء", weight: 0.25, description: "Speed and efficiency", descriptionAr: "السرعة والكفاءة" },
    { id: "c4", name: "Cost", nameAr: "التكلفة", weight: 0.25, description: "Development and operational cost", descriptionAr: "تكلفة التطوير والتشغيل" }
  ]);

  const [compareScores, setCompareScores] = useState<{ [key: string]: { [key: string]: number } }>({
    d1: { c1: 5, c2: 5, c3: 5, c4: 5 },
    d2: { c1: 5, c2: 5, c3: 5, c4: 5 }
  });

  const { data: configData } = useQuery({
    queryKey: ["/api/architecture-knowledge/config"]
  });

  const { data: decisionsData, isLoading: decisionsLoading } = useQuery({
    queryKey: ["/api/architecture-knowledge/decisions", selectedCategory, selectedStatus]
  });

  const { data: patternsData } = useQuery({
    queryKey: ["/api/architecture-knowledge/patterns"]
  });

  const { data: comparisonsData } = useQuery({
    queryKey: ["/api/architecture-knowledge/comparisons"]
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/architecture-knowledge/decisions/search", { query });
      return response.json();
    }
  });

  const createDecisionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/architecture-knowledge/decisions", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "تم تسجيل القرار" : "Decision Recorded", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/architecture-knowledge/decisions"] });
      setShowNewDecisionDialog(false);
      setNewDecision({ title: "", titleAr: "", category: "api", status: "proposed", context: "", contextAr: "", decision: "", decisionAr: "", rationale: "", rationaleAr: "", priority: "medium", tags: "" });
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const compareDesignsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/architecture-knowledge/compare", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: isAr ? "تمت المقارنة" : "Comparison Complete", description: data.message });
      queryClient.invalidateQueries({ queryKey: ["/api/architecture-knowledge/comparisons"] });
      setShowCompareDialog(false);
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const suggestMutation = useMutation({
    mutationFn: async (constraints: any) => {
      const response = await apiRequest("POST", "/api/architecture-knowledge/suggest", constraints);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: isAr ? "تم توليد الاقتراحات" : "Suggestions Generated" });
    },
    onError: (error: any) => {
      toast({ title: isAr ? "خطأ" : "Error", description: error.message, variant: "destructive" });
    }
  });

  const config = configData?.data;
  const decisions = searchMutation.data?.data || decisionsData?.data || [];
  const patterns = patternsData?.data || [];
  const comparisons = comparisonsData?.data || [];
  const suggestions = suggestMutation.data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "rejected": return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "proposed": return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "superseded": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "deprecated": return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "proposed": return <Clock className="w-4 h-4" />;
      case "superseded": return <History className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleCreateDecision = () => {
    createDecisionMutation.mutate({
      ...newDecision,
      tags: newDecision.tags.split(",").map(t => t.trim()).filter(Boolean),
      consequences: [],
      consequencesAr: [],
      constraints: [],
      constraintsAr: [],
      alternatives: [],
      relatedDecisions: []
    });
  };

  const handleCompare = () => {
    if (!compareDesigns[0].name || !compareDesigns[1].name) {
      toast({ title: isAr ? "خطأ" : "Error", description: isAr ? "أدخل أسماء التصاميم" : "Enter design names", variant: "destructive" });
      return;
    }
    compareDesignsMutation.mutate({
      title: `${compareDesigns[0].name} vs ${compareDesigns[1].name}`,
      titleAr: `${compareDesigns[0].nameAr || compareDesigns[0].name} مقابل ${compareDesigns[1].nameAr || compareDesigns[1].name}`,
      designs: compareDesigns,
      criteria: compareCriteria,
      scores: compareScores
    });
  };

  const handleSuggest = () => {
    suggestMutation.mutate({
      team: { size: constraints.teamSize },
      timeline: { maxDays: constraints.maxDays },
      scale: { users: constraints.users },
      performance: { latency: constraints.latency }
    });
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-panel-title">
              {isAr ? "نظام إدارة المعرفة المعمارية" : "Architectural Knowledge Management"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "حفظ قرارات التصميم ومقارنة البدائل" : "Preserve design decisions and compare alternatives"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Dialog open={showNewDecisionDialog} onOpenChange={setShowNewDecisionDialog}>
            <DialogTrigger asChild>
              <Button disabled={!isOwner} data-testid="button-new-decision" title={!isOwner ? (isAr ? "صلاحية المالك مطلوبة" : "Owner access required") : ""}>
                <Plus className="w-4 h-4 me-2" />
                {isAr ? "قرار جديد" : "New Decision"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isAr ? "تسجيل قرار معماري جديد" : "Record New Architectural Decision"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "العنوان (إنجليزي)" : "Title (English)"}</Label>
                    <Input value={newDecision.title} onChange={(e) => setNewDecision(p => ({ ...p, title: e.target.value }))} data-testid="input-decision-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "العنوان (عربي)" : "Title (Arabic)"}</Label>
                    <Input value={newDecision.titleAr} onChange={(e) => setNewDecision(p => ({ ...p, titleAr: e.target.value }))} data-testid="input-decision-title-ar" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "الفئة" : "Category"}</Label>
                    <Select value={newDecision.category} onValueChange={(v) => setNewDecision(p => ({ ...p, category: v }))}>
                      <SelectTrigger data-testid="select-decision-category"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {config?.categories?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{isAr ? c.nameAr : c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "الحالة" : "Status"}</Label>
                    <Select value={newDecision.status} onValueChange={(v) => setNewDecision(p => ({ ...p, status: v }))}>
                      <SelectTrigger data-testid="select-decision-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {config?.statuses?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "الأولوية" : "Priority"}</Label>
                    <Select value={newDecision.priority} onValueChange={(v) => setNewDecision(p => ({ ...p, priority: v }))}>
                      <SelectTrigger data-testid="select-decision-priority"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {config?.priorities?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{isAr ? p.nameAr : p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "السياق" : "Context"}</Label>
                  <Textarea value={newDecision.context} onChange={(e) => setNewDecision(p => ({ ...p, context: e.target.value }))} placeholder={isAr ? "ما المشكلة التي نحاول حلها؟" : "What problem are we trying to solve?"} data-testid="textarea-decision-context" />
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "القرار" : "Decision"}</Label>
                  <Textarea value={newDecision.decision} onChange={(e) => setNewDecision(p => ({ ...p, decision: e.target.value }))} placeholder={isAr ? "ما هو القرار المتخذ؟" : "What is the decision?"} data-testid="textarea-decision-decision" />
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "المبررات" : "Rationale"}</Label>
                  <Textarea value={newDecision.rationale} onChange={(e) => setNewDecision(p => ({ ...p, rationale: e.target.value }))} placeholder={isAr ? "لماذا اتخذنا هذا القرار؟" : "Why did we make this decision?"} data-testid="textarea-decision-rationale" />
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "الوسوم (مفصولة بفاصلة)" : "Tags (comma-separated)"}</Label>
                  <Input value={newDecision.tags} onChange={(e) => setNewDecision(p => ({ ...p, tags: e.target.value }))} placeholder="api, security, performance" data-testid="input-decision-tags" />
                </div>

                <Button onClick={handleCreateDecision} disabled={createDecisionMutation.isPending} className="w-full" data-testid="button-save-decision">
                  {createDecisionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <CheckCircle className="w-4 h-4 me-2" />}
                  {isAr ? "حفظ القرار" : "Save Decision"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!isOwner} data-testid="button-compare-designs" title={!isOwner ? (isAr ? "صلاحية المالك مطلوبة" : "Owner access required") : ""}>
                <GitCompare className="w-4 h-4 me-2" />
                {isAr ? "مقارنة تصاميم" : "Compare Designs"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isAr ? "مقارنة تصاميم معمارية" : "Compare Architectural Designs"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {compareDesigns.map((design, idx) => (
                    <Card key={design.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{isAr ? `التصميم ${idx + 1}` : `Design ${idx + 1}`}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input placeholder={isAr ? "اسم التصميم" : "Design name"} value={design.name} onChange={(e) => { const newDesigns = [...compareDesigns]; newDesigns[idx].name = e.target.value; setCompareDesigns(newDesigns); }} data-testid={`input-design-${idx}-name`} />
                        <Textarea placeholder={isAr ? "وصف مختصر" : "Brief description"} value={design.description} onChange={(e) => { const newDesigns = [...compareDesigns]; newDesigns[idx].description = e.target.value; setCompareDesigns(newDesigns); }} className="h-20" data-testid={`textarea-design-${idx}-desc`} />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{isAr ? "التقييم (1-10)" : "Scoring (1-10)"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {compareCriteria.map((criterion) => (
                        <div key={criterion.id} className="space-y-2">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-medium text-sm">{isAr ? criterion.nameAr : criterion.name}</span>
                            <Badge variant="outline" data-testid={`badge-criterion-weight-${criterion.id}`}>{(criterion.weight * 100).toFixed(0)}%</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {compareDesigns.map((design, idx) => (
                              <div key={design.id} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-12">{isAr ? `تصميم ${idx + 1}` : `D${idx + 1}`}</span>
                                <Slider min={1} max={10} step={1} value={[compareScores[design.id]?.[criterion.id] || 5]} onValueChange={(v) => { setCompareScores(prev => ({ ...prev, [design.id]: { ...prev[design.id], [criterion.id]: v[0] } })); }} className="flex-1" data-testid={`slider-score-${design.id}-${criterion.id}`} />
                                <span className="text-sm font-medium w-6 text-center" data-testid={`text-score-${design.id}-${criterion.id}`}>{compareScores[design.id]?.[criterion.id] || 5}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleCompare} disabled={compareDesignsMutation.isPending} className="w-full" data-testid="button-run-comparison">
                  {compareDesignsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Scale className="w-4 h-4 me-2" />}
                  {isAr ? "قارن التصاميم" : "Compare Designs"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!isOwner} data-testid="button-suggest-alternatives" title={!isOwner ? (isAr ? "صلاحية المالك مطلوبة" : "Owner access required") : ""}>
                <Lightbulb className="w-4 h-4 me-2" />
                {isAr ? "اقتراح بدائل" : "Suggest Alternatives"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isAr ? "اقتراح بدائل معمارية حسب القيود" : "Suggest Alternatives Based on Constraints"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isAr ? "حجم الفريق" : "Team Size"}: {constraints.teamSize}</Label>
                    <Slider min={1} max={50} value={[constraints.teamSize]} onValueChange={(v) => setConstraints(p => ({ ...p, teamSize: v[0] }))} data-testid="slider-team-size" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "المدة (أيام)" : "Timeline (days)"}: {constraints.maxDays}</Label>
                    <Slider min={30} max={365} value={[constraints.maxDays]} onValueChange={(v) => setConstraints(p => ({ ...p, maxDays: v[0] }))} data-testid="slider-max-days" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "المستخدمين المتوقعين" : "Expected Users"}: {constraints.users.toLocaleString()}</Label>
                    <Slider min={100} max={1000000} step={1000} value={[constraints.users]} onValueChange={(v) => setConstraints(p => ({ ...p, users: v[0] }))} data-testid="slider-users" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? "التأخير المقبول (ms)" : "Latency Target (ms)"}: {constraints.latency}</Label>
                    <Slider min={10} max={1000} value={[constraints.latency]} onValueChange={(v) => setConstraints(p => ({ ...p, latency: v[0] }))} data-testid="slider-latency" />
                  </div>
                </div>

                <Button onClick={handleSuggest} disabled={suggestMutation.isPending} className="w-full" data-testid="button-generate-suggestions">
                  {suggestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : <Lightbulb className="w-4 h-4 me-2" />}
                  {isAr ? "توليد الاقتراحات" : "Generate Suggestions"}
                </Button>

                {suggestions.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {suggestions.map((s: any, i: number) => (
                        <Card key={i}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-medium" data-testid={`text-suggestion-name-${i}`}>{isAr ? s.pattern.nameAr : s.pattern.name}</h4>
                                <p className="text-sm text-muted-foreground">{isAr ? s.pattern.descriptionAr : s.pattern.description}</p>
                              </div>
                              <Badge className={s.score >= 7 ? "bg-green-500/20 text-green-700" : s.score >= 5 ? "bg-yellow-500/20 text-yellow-700" : "bg-red-500/20 text-red-700"} data-testid={`badge-suggestion-score-${i}`}>
                                {s.score}/10
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground italic" data-testid={`text-suggestion-rec-${i}`}>{isAr ? s.recommendationAr : s.recommendation}</p>
                            {s.matchedConstraints.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {s.matchedConstraints.map((m: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-xs"><CheckCircle className="w-3 h-3 me-1" />{m}</Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="decisions" className="gap-2" data-testid="tab-decisions">
            <FileText className="w-4 h-4" />
            {isAr ? "القرارات" : "Decisions"}
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2" data-testid="tab-patterns">
            <Layers className="w-4 h-4" />
            {isAr ? "الأنماط" : "Patterns"}
          </TabsTrigger>
          <TabsTrigger value="comparisons" className="gap-2" data-testid="tab-comparisons">
            <GitCompare className="w-4 h-4" />
            {isAr ? "المقارنات" : "Comparisons"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder={isAr ? "بحث في القرارات..." : "Search decisions..."} className="ps-9" data-testid="input-search-decisions" />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]" data-testid="select-filter-category"><SelectValue placeholder={isAr ? "الفئة" : "Category"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
                    {config?.categories?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{isAr ? c.nameAr : c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-status"><SelectValue placeholder={isAr ? "الحالة" : "Status"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
                    {config?.statuses?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{isAr ? s.nameAr : s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} disabled={searchMutation.isPending} data-testid="button-search">
                  {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {decisionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : decisions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isAr ? "لا توجد قرارات مسجلة بعد" : "No decisions recorded yet"}</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {decisions.map((d: any) => (
                      <Card key={d.id} className="hover-elevate">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium" data-testid={`text-decision-title-${d.id}`}>{isAr ? d.titleAr : d.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{isAr ? d.decisionAr : d.decision}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={getStatusColor(d.status)} data-testid={`badge-decision-status-${d.id}`}>
                                {getStatusIcon(d.status)}
                                <span className="ms-1">{config?.statuses?.find((s: any) => s.id === d.status)?.[isAr ? "nameAr" : "name"] || d.status}</span>
                              </Badge>
                              <Badge variant="outline" className="text-xs" data-testid={`badge-decision-category-${d.id}`}>{config?.categories?.find((c: any) => c.id === d.category)?.[isAr ? "nameAr" : "name"] || d.category}</Badge>
                            </div>
                          </div>
                          {d.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {d.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs"><Tag className="w-3 h-3 me-1" />{tag}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-muted-foreground">
                            <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                            <Button variant="ghost" size="sm" data-testid={`button-view-decision-${d.id}`}>
                              {isAr ? "عرض التفاصيل" : "View Details"}
                              <ChevronRight className="w-4 h-4 ms-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((p: any) => (
              <Card key={p.id} className="hover-elevate">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base" data-testid={`text-pattern-name-${p.id}`}>{isAr ? p.nameAr : p.name}</CardTitle>
                  <CardDescription>{isAr ? p.descriptionAr : p.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">{isAr ? "حالات الاستخدام" : "Use Cases"}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(isAr ? p.useCasesAr : p.useCases).slice(0, 3).map((uc: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{uc}</Badge>
                        ))}
                      </div>
                    </div>
                    {p.tradeoffs?.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">{isAr ? "المقايضات" : "Tradeoffs"}</span>
                        <div className="mt-1 text-xs">
                          {p.tradeoffs.slice(0, 2).map((t: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="font-medium">{isAr ? t.aspectAr : t.aspect}:</span>
                              <span className="text-green-600">+{isAr ? t.positiveAr?.substring(0, 20) : t.positive?.substring(0, 20)}...</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          {comparisons.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <GitCompare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{isAr ? "لا توجد مقارنات بعد" : "No comparisons yet"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comparisons.map((c: any) => (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base" data-testid={`text-comparison-title-${c.id}`}>{isAr ? c.titleAr : c.title}</CardTitle>
                      <Badge variant="outline">{new Date(c.createdAt).toLocaleDateString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      {c.designs.map((d: any, i: number) => (
                        <div key={d.id} className="flex items-center gap-2">
                          <Badge variant={d.id === c.winner ? "default" : "secondary"} data-testid={`badge-comparison-design-${c.id}-${i}`}>
                            {d.id === c.winner && <CheckCircle className="w-3 h-3 me-1" />}
                            {isAr ? d.nameAr : d.name}
                          </Badge>
                          {i < c.designs.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`text-comparison-rec-${c.id}`}>{isAr ? c.recommendationAr : c.recommendation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
