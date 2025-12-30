/**
 * Future Evolution Panel | لوحة التطور المستقبلي
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, TrendingUp, Lightbulb, Map, Sparkles, ThumbsUp, ThumbsDown,
  Check, X, ArrowUp, ArrowDown, Minus, Target, Zap, Shield, RefreshCw,
  Calendar, Clock, Users, BarChart3, AlertTriangle, ChevronRight
} from "lucide-react";

interface UsagePattern {
  id: string;
  feature: string;
  featureAr: string;
  usageCount: number;
  uniqueUsers: number;
  growthRate: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface FutureRequirement {
  id: string;
  title: string;
  titleAr: string;
  category: string;
  priority: string;
  confidence: number;
  votes: number;
  status: string;
}

interface ExpansionSuggestion {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  priority: string;
  complexity: string;
  expectedROI: number;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface RoadmapItem {
  id: string;
  title: string;
  titleAr: string;
  quarter: string;
  year: number;
  category: string;
  status: string;
  progress: number;
}

interface SmartRoadmap {
  id: string;
  platformName: string;
  vision: string;
  visionAr: string;
  currentPhase: string;
  items: RoadmapItem[];
  metrics: {
    totalItems: number;
    completed: number;
    inProgress: number;
    proposed: number;
  };
}

interface TechnologyTrend {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  maturityLevel: string;
  adoptionRate: number;
  relevanceScore: number;
  recommendedAction: string;
}

interface EvolutionInsight {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  confidence: number;
  impact: string;
  actionable: boolean;
}

interface Stats {
  patterns: { total: number; rising: number; declining: number };
  requirements: { total: number; proposed: number; approved: number; avgConfidence: number };
  suggestions: { total: number; accepted: number; rejected: number; totalROI: number };
  roadmaps: { total: number; items: number; completed: number; onTrack: number };
  trends: { total: number; toAdopt: number; toWatch: number };
  insights: { total: number; critical: number; actionable: number };
}

const trendIcons = {
  rising: <ArrowUp className="w-4 h-4 text-green-500" />,
  stable: <Minus className="w-4 h-4 text-yellow-500" />,
  declining: <ArrowDown className="w-4 h-4 text-red-500" />
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500",
  high: "bg-orange-500/10 text-orange-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  low: "bg-blue-500/10 text-blue-500",
  "nice-to-have": "bg-gray-500/10 text-gray-500"
};

const statusColors: Record<string, string> = {
  proposed: "bg-blue-500/10 text-blue-500",
  approved: "bg-green-500/10 text-green-500",
  in_progress: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-600/10 text-green-600",
  rejected: "bg-red-500/10 text-red-500",
  deferred: "bg-gray-500/10 text-gray-500"
};

const actionColors: Record<string, string> = {
  adopt: "bg-green-500/10 text-green-500",
  evaluate: "bg-yellow-500/10 text-yellow-500",
  watch: "bg-blue-500/10 text-blue-500",
  ignore: "bg-gray-500/10 text-gray-500"
};

export function FutureEvolutionPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: statsData, isLoading } = useQuery<{ data: Stats }>({
    queryKey: ["/api/evolution/stats"]
  });

  const { data: usageData } = useQuery<{ data: UsagePattern[] }>({
    queryKey: ["/api/evolution/usage"]
  });

  const { data: requirementsData } = useQuery<{ data: FutureRequirement[] }>({
    queryKey: ["/api/evolution/requirements"]
  });

  const { data: suggestionsData } = useQuery<{ data: ExpansionSuggestion[] }>({
    queryKey: ["/api/evolution/suggestions"]
  });

  const { data: roadmapsData } = useQuery<{ data: SmartRoadmap[] }>({
    queryKey: ["/api/evolution/roadmaps"]
  });

  const { data: trendsData } = useQuery<{ data: TechnologyTrend[] }>({
    queryKey: ["/api/evolution/trends"]
  });

  const { data: insightsData } = useQuery<{ data: EvolutionInsight[] }>({
    queryKey: ["/api/evolution/insights"]
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      apiRequest("POST", `/api/evolution/requirements/${id}/vote`, { direction }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/evolution/requirements"] })
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/evolution/suggestions/${id}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/evolution/suggestions"] })
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/evolution/suggestions/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/evolution/suggestions"] })
  });

  const stats = statsData?.data;
  const usage = usageData?.data || [];
  const requirements = requirementsData?.data || [];
  const suggestions = suggestionsData?.data || [];
  const roadmaps = roadmapsData?.data || [];
  const trends = trendsData?.data || [];
  const insights = insightsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="future-evolution-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Future Evolution Engine
          </h2>
          <p className="text-muted-foreground">محرك التطور المستقبلي للمنصات</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-3 h-3" />
            {stats?.patterns.rising || 0} Rising
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Lightbulb className="w-3 h-3" />
            {stats?.suggestions.total || 0} Suggestions
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.patterns.total || 0}</p>
                <p className="text-xs text-muted-foreground">Usage Patterns | أنماط الاستخدام</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.requirements.avgConfidence || 0}%</p>
                <p className="text-xs text-muted-foreground">Avg Confidence | متوسط الثقة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.suggestions.totalROI || 0}%</p>
                <p className="text-xs text-muted-foreground">Expected ROI | العائد المتوقع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Map className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.roadmaps.items || 0}</p>
                <p className="text-xs text-muted-foreground">Roadmap Items | عناصر الخارطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Sparkles className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" data-testid="tab-usage">
            <BarChart3 className="w-4 h-4 mr-1" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="requirements" data-testid="tab-requirements">
            <Target className="w-4 h-4 mr-1" />
            Requirements
          </TabsTrigger>
          <TabsTrigger value="suggestions" data-testid="tab-suggestions">
            <Lightbulb className="w-4 h-4 mr-1" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="roadmap" data-testid="tab-roadmap">
            <Map className="w-4 h-4 mr-1" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="w-4 h-4 mr-1" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights | الرؤى الذكية</CardTitle>
              <CardDescription>Automatically generated insights from usage analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-2 rounded-lg ${
                      insight.impact === 'critical' ? 'bg-red-500/10' :
                      insight.impact === 'high' ? 'bg-orange-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      {insight.impact === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.titleAr}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{insight.type}</Badge>
                        <span className="text-xs text-muted-foreground">{insight.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rising Features</CardTitle>
              </CardHeader>
              <CardContent>
                {usage.filter(u => u.trend === 'rising').slice(0, 3).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-1">
                    <span className="text-sm truncate">{u.feature}</span>
                    <Badge variant="outline" className="text-xs gap-1">
                      <ArrowUp className="w-3 h-3 text-green-500" />
                      {u.growthRate}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {requirements.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-1">
                    <span className="text-sm truncate">{r.title}</span>
                    <Badge className={priorityColors[r.priority]} variant="outline">
                      {r.confidence}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tech Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {trends.filter(t => t.recommendedAction === 'adopt').slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1">
                    <span className="text-sm truncate">{t.name}</span>
                    <Badge className={actionColors[t.recommendedAction]} variant="outline">
                      {t.recommendedAction}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {usage.map((pattern) => (
                <Card key={pattern.id} data-testid={`usage-${pattern.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {trendIcons[pattern.trend]}
                        <div>
                          <h4 className="font-medium">{pattern.feature}</h4>
                          <p className="text-sm text-muted-foreground">{pattern.featureAr}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{pattern.usageCount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Uses</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{pattern.uniqueUsers.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Users</p>
                        </div>
                        <Badge variant={pattern.trend === 'rising' ? 'default' : 'outline'}>
                          {pattern.growthRate > 0 ? '+' : ''}{pattern.growthRate}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requirements" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {requirements.map((req) => (
                <Card key={req.id} data-testid={`requirement-${req.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{req.title}</h4>
                          <Badge className={priorityColors[req.priority]}>{req.priority}</Badge>
                          <Badge className={statusColors[req.status]}>{req.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{req.titleAr}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{req.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Confidence: {req.confidence}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => voteMutation.mutate({ id: req.id, direction: 'up' })}
                            data-testid={`vote-up-${req.id}`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-medium">{req.votes}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => voteMutation.mutate({ id: req.id, direction: 'down' })}
                            data-testid={`vote-down-${req.id}`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} data-testid={`suggestion-${suggestion.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge className={priorityColors[suggestion.priority]}>{suggestion.priority}</Badge>
                          <Badge variant="outline">{suggestion.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.titleAr}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            Complexity: <strong>{suggestion.complexity}</strong>
                          </span>
                          <span className="text-sm text-green-600">
                            ROI: <strong>{suggestion.expectedROI}%</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {suggestion.acceptedAt ? (
                          <Badge className="bg-green-500/10 text-green-500 gap-1">
                            <Check className="w-3 h-3" /> Accepted
                          </Badge>
                        ) : suggestion.rejectedAt ? (
                          <Badge className="bg-red-500/10 text-red-500 gap-1">
                            <X className="w-3 h-3" /> Rejected
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acceptMutation.mutate(suggestion.id)}
                              data-testid={`accept-${suggestion.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => rejectMutation.mutate(suggestion.id)}
                              data-testid={`reject-${suggestion.id}`}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-4">
          {roadmaps.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Map className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">No Roadmaps</p>
                <p className="text-sm text-muted-foreground">لا توجد خرائط طريق</p>
              </CardContent>
            </Card>
          ) : (
            roadmaps.map((roadmap) => (
              <Card key={roadmap.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{roadmap.platformName}</CardTitle>
                      <CardDescription>{roadmap.vision}</CardDescription>
                    </div>
                    <Badge variant="outline">{roadmap.currentPhase}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Overview */}
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>{roadmap.metrics.completed} Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>{roadmap.metrics.inProgress} In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span>{roadmap.metrics.proposed} Proposed</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                      const quarterItems = roadmap.items.filter(i => i.quarter === quarter);
                      if (quarterItems.length === 0) return null;

                      return (
                        <div key={quarter} className="border-l-2 border-muted pl-4 ml-2">
                          <h4 className="font-medium mb-2">{quarter} {roadmap.items[0]?.year}</h4>
                          <div className="space-y-2">
                            {quarterItems.map((item) => (
                              <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                              >
                                <div className={`w-2 h-2 rounded-full ${
                                  item.status === 'completed' ? 'bg-green-500' :
                                  item.status === 'in_progress' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.category}</p>
                                </div>
                                {item.status === 'in_progress' && (
                                  <div className="w-20">
                                    <Progress value={item.progress} className="h-1" />
                                    <p className="text-xs text-center mt-1">{item.progress}%</p>
                                  </div>
                                )}
                                <Badge className={statusColors[item.status]} variant="outline">
                                  {item.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {trends.map((trend) => (
              <Card key={trend.id} data-testid={`trend-${trend.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.name}</CardTitle>
                    <Badge className={actionColors[trend.recommendedAction]}>
                      {trend.recommendedAction}
                    </Badge>
                  </div>
                  <CardDescription>{trend.nameAr}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{trend.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maturity:</span>
                    <span className="font-medium capitalize">{trend.maturityLevel}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Adoption Rate</span>
                      <span>{trend.adoptionRate}%</span>
                    </div>
                    <Progress value={trend.adoptionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Relevance Score</span>
                      <span>{trend.relevanceScore}%</span>
                    </div>
                    <Progress value={trend.relevanceScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FutureEvolutionPanel;
