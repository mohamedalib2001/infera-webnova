import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Activity, 
  Database, 
  Cpu, 
  HardDrive, 
  Server,
  Search,
  Plus,
  RefreshCw,
  Clock,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";
import { DocLinkButton } from "@/components/doc-link-button";

interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  byImportance: Record<string, number>;
  recentActivity: number;
}

interface PlatformSnapshot {
  systemMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: number;
  };
  applicationMetrics: {
    activeUsers: number;
    activeSessions: number;
    requestsPerMinute: number;
    averageLatency: number;
    errorRate: number;
  };
  serviceHealth: Array<{
    name: string;
    status: "healthy" | "degraded" | "down";
    lastCheck: string;
    responseTime?: number;
  }>;
  overallHealth: string;
}

interface Memory {
  id: string;
  memoryType: string;
  title: string;
  content: string;
  importance: string;
  createdAt: string;
}

export default function NovaAIDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryType, setNewMemoryType] = useState("insight");
  const [newMemoryImportance, setNewMemoryImportance] = useState("medium");

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<{
    dashboard: {
      memory: MemoryStats;
      platform: PlatformSnapshot;
      recentMemories: Memory[];
    };
  }>({
    queryKey: ["/api/nova/dashboard"],
  });

  const { data: searchResults, refetch: refetchSearch } = useQuery<{
    memories: Array<Memory & { similarity: number }>;
  }>({
    queryKey: ["/api/nova/memory/search", searchQuery],
    enabled: searchQuery.length > 2,
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; memoryType: string; importance: string }) => {
      return apiRequest("/api/nova/memory", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/dashboard"] });
      setNewMemoryTitle("");
      setNewMemoryContent("");
    },
  });

  const captureSnapshotMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/nova/platform/snapshot", { method: "GET" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/dashboard"] });
    },
  });

  const handleSearch = () => {
    if (searchQuery.length > 2) {
      refetchSearch();
    }
  };

  const handleCreateMemory = () => {
    if (newMemoryTitle && newMemoryContent) {
      createMemoryMutation.mutate({
        title: newMemoryTitle,
        content: newMemoryContent,
        memoryType: newMemoryType,
        importance: newMemoryImportance,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getImportanceBadge = (importance: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={variants[importance] || "secondary"}>{importance}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      conversation: <MessageSquare className="h-3 w-3" />,
      decision: <Zap className="h-3 w-3" />,
      learning: <Brain className="h-3 w-3" />,
      insight: <Lightbulb className="h-3 w-3" />,
      context: <Database className="h-3 w-3" />,
    };
    return (
      <Badge variant="outline" className="gap-1">
        {icons[type]}
        {type}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading Nova AI Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboard?.dashboard?.memory;
  const platform = dashboard?.dashboard?.platform;
  const recentMemories = dashboard?.dashboard?.recentMemories || [];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            لوحة تحكم Nova AI
            <DocLinkButton pageId="nova-ai-dashboard" />
          </h1>
          <p className="text-muted-foreground mt-1">
            نظام الذاكرة والمراقبة والسياق لـ Nova AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetchDashboard()}
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button 
            onClick={() => captureSnapshotMutation.mutate()}
            disabled={captureSnapshotMutation.isPending}
            data-testid="button-capture-snapshot"
          >
            <Activity className="h-4 w-4 ml-2" />
            التقاط حالة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-memories">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الذاكرة</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMemories || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentActivity || 0} في الساعة الأخيرة
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cpu-usage">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">استخدام المعالج</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform?.systemMetrics?.cpuUsage || 0}%</div>
            <Progress value={platform?.systemMetrics?.cpuUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-memory-usage">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">استخدام الذاكرة</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platform?.systemMetrics?.memoryUsage || 0}%</div>
            <Progress value={platform?.systemMetrics?.memoryUsage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card data-testid="card-system-health">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">صحة النظام</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(platform?.overallHealth || "healthy")}
              <span className="text-2xl font-bold capitalize">
                {platform?.overallHealth === "healthy" ? "سليم" : 
                 platform?.overallHealth === "degraded" ? "متأثر" : "معطل"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              وقت التشغيل: {formatUptime(platform?.systemMetrics?.uptime || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="memory" data-testid="tab-memory">
            <Database className="h-4 w-4 ml-2" />
            الذاكرة
          </TabsTrigger>
          <TabsTrigger value="search" data-testid="tab-search">
            <Search className="h-4 w-4 ml-2" />
            البحث
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Server className="h-4 w-4 ml-2" />
            الخدمات
          </TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">
            <Plus className="h-4 w-4 ml-2" />
            إنشاء ذاكرة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الأنواع</CardTitle>
                <CardDescription>أنواع الذاكرة المخزنة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      {getTypeBadge(type)}
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                  {Object.keys(stats?.byType || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      لا توجد ذاكرة مخزنة بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الأهمية</CardTitle>
                <CardDescription>مستويات أهمية الذاكرة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byImportance || {}).map(([importance, count]) => (
                    <div key={importance} className="flex items-center justify-between">
                      {getImportanceBadge(importance)}
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                  {Object.keys(stats?.byImportance || {}).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      لا توجد بيانات
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>أحدث الذاكرة</CardTitle>
              <CardDescription>آخر 10 ذكريات مخزنة</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentMemories.map((memory) => (
                    <div 
                      key={memory.id} 
                      className="p-3 rounded-lg border bg-card"
                      data-testid={`memory-item-${memory.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium">{memory.title}</h4>
                        <div className="flex gap-1">
                          {getTypeBadge(memory.memoryType)}
                          {getImportanceBadge(memory.importance)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {memory.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleString("ar-SA")}
                      </div>
                    </div>
                  ))}
                  {recentMemories.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      لا توجد ذاكرة مخزنة بعد. أنشئ أول ذاكرة!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>البحث في الذاكرة</CardTitle>
              <CardDescription>ابحث عن ذكريات مرتبطة بموضوع معين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ابحث عن..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  data-testid="input-search-memory"
                />
                <Button onClick={handleSearch} data-testid="button-search">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {searchResults?.memories?.map((memory) => (
                    <div 
                      key={memory.id} 
                      className="p-3 rounded-lg border bg-card"
                      data-testid={`search-result-${memory.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium">{memory.title}</h4>
                        <Badge variant="outline">
                          {Math.round(memory.similarity * 100)}% تطابق
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {memory.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {getTypeBadge(memory.memoryType)}
                        {getImportanceBadge(memory.importance)}
                      </div>
                    </div>
                  ))}
                  {searchQuery.length > 2 && searchResults?.memories?.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      لا توجد نتائج للبحث "{searchQuery}"
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>حالة الخدمات</CardTitle>
              <CardDescription>مراقبة صحة خدمات المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platform?.serviceHealth?.map((service) => (
                  <div 
                    key={service.name} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                    data-testid={`service-${service.name}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {service.responseTime && (
                        <span>{service.responseTime}ms</span>
                      )}
                      <span>{new Date(service.lastCheck).toLocaleTimeString("ar-SA")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">المستخدمين النشطين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platform?.applicationMetrics?.activeUsers || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">الطلبات/دقيقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platform?.applicationMetrics?.requestsPerMinute || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">معدل الخطأ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {platform?.applicationMetrics?.errorRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء ذاكرة جديدة</CardTitle>
              <CardDescription>أضف معلومة جديدة لذاكرة Nova AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع</label>
                  <Select value={newMemoryType} onValueChange={setNewMemoryType}>
                    <SelectTrigger data-testid="select-memory-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insight">رؤية</SelectItem>
                      <SelectItem value="learning">تعلم</SelectItem>
                      <SelectItem value="decision">قرار</SelectItem>
                      <SelectItem value="context">سياق</SelectItem>
                      <SelectItem value="preference">تفضيل</SelectItem>
                      <SelectItem value="pattern">نمط</SelectItem>
                      <SelectItem value="correction">تصحيح</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الأهمية</label>
                  <Select value={newMemoryImportance} onValueChange={setNewMemoryImportance}>
                    <SelectTrigger data-testid="select-memory-importance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">حرجة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input
                  placeholder="عنوان الذاكرة..."
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  data-testid="input-memory-title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">المحتوى</label>
                <Textarea
                  placeholder="محتوى الذاكرة..."
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  rows={4}
                  data-testid="input-memory-content"
                />
              </div>

              <Button 
                onClick={handleCreateMemory}
                disabled={!newMemoryTitle || !newMemoryContent || createMemoryMutation.isPending}
                className="w-full"
                data-testid="button-create-memory"
              >
                <Plus className="h-4 w-4 ml-2" />
                {createMemoryMutation.isPending ? "جاري الحفظ..." : "حفظ الذاكرة"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
