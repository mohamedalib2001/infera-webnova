import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Eye, 
  Search, 
  Code, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Play,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  FileCode,
  Gauge,
  Lock,
  Accessibility,
  Globe
} from "lucide-react";
import type { SmartSuggestion, CodeAnalysisSession } from "@shared/schema";

const translations = {
  ar: {
    title: "الاقتراحات الذكية",
    subtitle: "تحليل الكود واقتراح التحسينات تلقائياً",
    tabs: {
      suggestions: "الاقتراحات",
      history: "التاريخ",
      rules: "القواعد"
    },
    analyze: "تحليل الكود",
    analyzing: "جاري التحليل...",
    noSuggestions: "لا توجد اقتراحات حالياً",
    runAnalysis: "شغّل التحليل",
    apply: "تطبيق",
    reject: "رفض",
    defer: "تأجيل",
    applied: "مُطبّق",
    rejected: "مرفوض",
    pending: "قيد الانتظار",
    scores: {
      overall: "النتيجة الإجمالية",
      performance: "الأداء",
      security: "الأمان",
      accessibility: "إمكانية الوصول",
      seo: "تحسين محركات البحث",
      codeQuality: "جودة الكود"
    },
    priority: {
      critical: "حرج",
      high: "عالي",
      medium: "متوسط",
      low: "منخفض",
      info: "معلومة"
    },
    type: {
      performance: "أداء",
      security: "أمان",
      accessibility: "إمكانية الوصول",
      seo: "SEO",
      best_practice: "أفضل الممارسات",
      code_quality: "جودة الكود",
      ux: "تجربة المستخدم",
      optimization: "تحسين"
    },
    analysisType: {
      full: "تحليل شامل",
      quick: "تحليل سريع",
      security: "تحليل أمني",
      performance: "تحليل الأداء"
    },
    selectProject: "اختر مشروعاً",
    rejectReason: "سبب الرفض",
    confirmReject: "تأكيد الرفض",
    rate: "قيّم الاقتراح",
    feedback: "ملاحظاتك",
    submitFeedback: "إرسال التقييم",
    viewCode: "عرض الكود",
    autoApply: "تطبيق تلقائي متاح",
    estimatedEffort: "الجهد المقدر",
    expectedImpact: "التأثير المتوقع"
  },
  en: {
    title: "Smart Suggestions",
    subtitle: "Analyze code and suggest improvements automatically",
    tabs: {
      suggestions: "Suggestions",
      history: "History",
      rules: "Rules"
    },
    analyze: "Analyze Code",
    analyzing: "Analyzing...",
    noSuggestions: "No suggestions available",
    runAnalysis: "Run Analysis",
    apply: "Apply",
    reject: "Reject",
    defer: "Defer",
    applied: "Applied",
    rejected: "Rejected",
    pending: "Pending",
    scores: {
      overall: "Overall Score",
      performance: "Performance",
      security: "Security",
      accessibility: "Accessibility",
      seo: "SEO",
      codeQuality: "Code Quality"
    },
    priority: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info"
    },
    type: {
      performance: "Performance",
      security: "Security",
      accessibility: "Accessibility",
      seo: "SEO",
      best_practice: "Best Practice",
      code_quality: "Code Quality",
      ux: "UX",
      optimization: "Optimization"
    },
    analysisType: {
      full: "Full Analysis",
      quick: "Quick Analysis",
      security: "Security Analysis",
      performance: "Performance Analysis"
    },
    selectProject: "Select a project",
    rejectReason: "Rejection reason",
    confirmReject: "Confirm Rejection",
    rate: "Rate Suggestion",
    feedback: "Your feedback",
    submitFeedback: "Submit Feedback",
    viewCode: "View Code",
    autoApply: "Auto-apply available",
    estimatedEffort: "Estimated Effort",
    expectedImpact: "Expected Impact"
  }
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  info: "bg-gray-500"
};

const typeIcons: Record<string, any> = {
  performance: Zap,
  security: Shield,
  accessibility: Accessibility,
  seo: Globe,
  best_practice: Lightbulb,
  code_quality: Code,
  ux: Eye,
  optimization: TrendingUp
};

export default function SmartSuggestions() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("full");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SmartSuggestion | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const { data: projectsData } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery<{ success: boolean; suggestions: SmartSuggestion[] }>({
    queryKey: ["/api/suggestions", selectedProject],
    enabled: !!selectedProject,
  });
  const suggestions = suggestionsData?.suggestions || [];

  const { data: sessionsData } = useQuery<{ success: boolean; sessions: CodeAnalysisSession[] }>({
    queryKey: ["/api/suggestions/sessions", selectedProject],
    enabled: !!selectedProject,
  });
  const sessions = sessionsData?.sessions || [];

  const latestSession = sessions[0];

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/suggestions/analyze`, {
        projectId: selectedProject,
        analysisType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions/sessions"] });
      toast({
        title: language === "ar" ? "تم بدء التحليل" : "Analysis started",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشل بدء التحليل" : "Failed to start analysis",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      return apiRequest("POST", `/api/suggestions/${suggestionId}/apply`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: language === "ar" ? "تم تطبيق الاقتراح" : "Suggestion applied",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest("POST", `/api/suggestions/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      setShowRejectDialog(false);
      setRejectReason("");
      toast({
        title: language === "ar" ? "تم رفض الاقتراح" : "Suggestion rejected",
      });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async ({ id, rating, feedback }: { id: string; rating: number; feedback: string }) => {
      return apiRequest("POST", `/api/suggestions/${id}/rate`, { rating, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      setShowRateDialog(false);
      setRating(0);
      setFeedback("");
      toast({
        title: language === "ar" ? "شكراً على تقييمك" : "Thanks for your feedback",
      });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const appliedSuggestions = suggestions.filter(s => s.status === "applied");
  const rejectedSuggestions = suggestions.filter(s => s.status === "rejected");

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-smart-suggestions-title">
          <Sparkles className="h-8 w-8 text-violet-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64" data-testid="select-project">
            <SelectValue placeholder={t.selectProject} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-48" data-testid="select-analysis-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">{t.analysisType.full}</SelectItem>
            <SelectItem value="quick">{t.analysisType.quick}</SelectItem>
            <SelectItem value="security">{t.analysisType.security}</SelectItem>
            <SelectItem value="performance">{t.analysisType.performance}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={!selectedProject || analyzeMutation.isPending}
          data-testid="button-analyze"
        >
          {analyzeMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {t.analyze}
            </>
          )}
        </Button>
      </div>

      {latestSession && latestSession.status === "completed" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Gauge className="h-6 w-6 mx-auto mb-2 text-violet-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.overallScore || 0)}`}>
                {latestSession.overallScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.overall}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.performanceScore || 0)}`}>
                {latestSession.performanceScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.performance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.securityScore || 0)}`}>
                {latestSession.securityScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.security}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Accessibility className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.accessibilityScore || 0)}`}>
                {latestSession.accessibilityScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.accessibility}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.seoScore || 0)}`}>
                {latestSession.seoScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.seo}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Code className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className={`text-2xl font-bold ${getScoreColor(latestSession.codeQualityScore || 0)}`}>
                {latestSession.codeQualityScore}%
              </div>
              <p className="text-xs text-muted-foreground">{t.scores.codeQuality}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suggestions" data-testid="tab-suggestions">
            {t.tabs.suggestions}
            {pendingSuggestions.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingSuggestions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            {t.tabs.history}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          {!selectedProject ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.selectProject}</p>
              </CardContent>
            </Card>
          ) : suggestionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : pendingSuggestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">{t.noSuggestions}</p>
                <Button className="mt-4" onClick={() => analyzeMutation.mutate()}>
                  {t.runAnalysis}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {pendingSuggestions.map((suggestion) => {
                  const TypeIcon = typeIcons[suggestion.type] || Lightbulb;
                  return (
                    <Card key={suggestion.id} className="hover-elevate" data-testid={`card-suggestion-${suggestion.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${priorityColors[suggestion.priority]} bg-opacity-20`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {language === "ar" ? suggestion.titleAr : suggestion.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {t.type[suggestion.type as keyof typeof t.type] || suggestion.type}
                                </Badge>
                                <Badge className={`${priorityColors[suggestion.priority]} text-white text-xs`}>
                                  {t.priority[suggestion.priority as keyof typeof t.priority]}
                                </Badge>
                                {suggestion.canAutoApply && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {t.autoApply}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => applyMutation.mutate(suggestion.id)}
                              disabled={applyMutation.isPending}
                              data-testid={`button-apply-${suggestion.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t.apply}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedSuggestion(suggestion);
                                setShowRejectDialog(true);
                              }}
                              data-testid={`button-reject-${suggestion.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {t.reject}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {language === "ar" ? suggestion.descriptionAr : suggestion.description}
                        </p>
                        
                        {suggestion.affectedCode && (
                          <div className="bg-muted p-3 rounded-md mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileCode className="h-4 w-4" />
                              <span className="text-sm font-medium">{suggestion.affectedFile}</span>
                              {suggestion.lineNumber && (
                                <span className="text-xs text-muted-foreground">
                                  Line {suggestion.lineNumber}
                                </span>
                              )}
                            </div>
                            <pre className="text-xs overflow-x-auto">
                              <code>{suggestion.affectedCode}</code>
                            </pre>
                          </div>
                        )}

                        {suggestion.suggestedFix && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                              {language === "ar" ? "الحل المقترح:" : "Suggested Fix:"}
                            </p>
                            <p className="text-sm">
                              {language === "ar" ? suggestion.suggestedFixAr : suggestion.suggestedFix}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          {suggestion.estimatedEffort && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {t.estimatedEffort}: {suggestion.estimatedEffort}
                            </span>
                          )}
                          {suggestion.expectedImpact && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              {language === "ar" ? suggestion.expectedImpactAr : suggestion.expectedImpact}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {t.applied} ({appliedSuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {appliedSuggestions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">
                          {language === "ar" ? s.titleAr : s.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.appliedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedSuggestion(s);
                          setShowRateDialog(true);
                        }}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  {t.rejected} ({rejectedSuggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {rejectedSuggestions.map((s) => (
                    <div key={s.id} className="py-2 border-b last:border-0">
                      <p className="font-medium text-sm">
                        {language === "ar" ? s.titleAr : s.title}
                      </p>
                      {s.rejectedReason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.rejectedReason}
                        </p>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmReject}</DialogTitle>
            <DialogDescription>
              {selectedSuggestion && (language === "ar" ? selectedSuggestion.titleAr : selectedSuggestion.title)}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t.rejectReason}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSuggestion) {
                  rejectMutation.mutate({ id: selectedSuggestion.id, reason: rejectReason });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {t.reject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rate}</DialogTitle>
            <DialogDescription>
              {selectedSuggestion && (language === "ar" ? selectedSuggestion.titleAr : selectedSuggestion.title)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                size="icon"
                variant={rating >= star ? "default" : "outline"}
                onClick={() => setRating(star)}
              >
                <Star className={`h-5 w-5 ${rating >= star ? "fill-current" : ""}`} />
              </Button>
            ))}
          </div>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t.feedback}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (selectedSuggestion && rating > 0) {
                  rateMutation.mutate({ id: selectedSuggestion.id, rating, feedback });
                }
              }}
              disabled={rateMutation.isPending || rating === 0}
            >
              {t.submitFeedback}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
