import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Search,
  Layers,
  Code,
  FileCode,
  Plus,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle2,
  LayoutTemplate,
  Puzzle,
  Wand2,
  Package,
  TrendingUp
} from "lucide-react";

interface TemplateMatch {
  template: any;
  type: 'project' | 'pattern' | 'component';
  score: number;
  reason: string;
  reasonAr: string;
}

interface TemplateBankStats {
  totalComponents: number;
  totalPatterns: number;
  totalTemplates: number;
  mostUsedComponents: any[];
  mostUsedPatterns: any[];
  componentsByType: Record<string, number>;
  patternsBySector: Record<string, number>;
}

export function TemplateBankPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patterns");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TemplateMatch[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [assembleFeatures, setAssembleFeatures] = useState("");
  const [assembleName, setAssembleName] = useState("");
  const [assembleSector, setAssembleSector] = useState("");
  const [isAssembling, setIsAssembling] = useState(false);

  const statsQuery = useQuery<{ success: boolean; data: TemplateBankStats }>({
    queryKey: ["/api/template-bank/stats"]
  });

  const patternsQuery = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/template-bank/patterns"]
  });

  const componentsQuery = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/template-bank/components"],
  });

  const handlePatternSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await apiRequest("POST", "/api/template-bank/patterns/search", {
        query: searchQuery,
        limit: 10
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
        queryClient.invalidateQueries({ queryKey: ["/api/template-bank/stats"] });
        toast({ title: "Search Complete", description: `Found ${data.data.length} matching patterns` });
      } else {
        toast({ title: "Search Failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Search Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleComponentSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await apiRequest("POST", "/api/template-bank/components/search", {
        query: searchQuery,
        type: selectedType || undefined,
        limit: 10
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
        queryClient.invalidateQueries({ queryKey: ["/api/template-bank/stats"] });
        toast({ title: "Search Complete", description: `Found ${data.data.length} matching components` });
      } else {
        toast({ title: "Search Failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Search Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssemble = async () => {
    if (!assembleName.trim() || !assembleSector.trim() || !assembleFeatures.trim()) {
      toast({ title: "Missing Fields", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    setIsAssembling(true);
    try {
      const features = assembleFeatures.split("\n").filter(f => f.trim());
      const response = await apiRequest("POST", "/api/template-bank/assemble", {
        projectIds: [],
        name: assembleName,
        sector: assembleSector,
        features
      });
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/template-bank/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/template-bank/patterns"] });
        queryClient.invalidateQueries({ queryKey: ["/api/template-bank/components"] });
        toast({ 
          title: "Assembly Complete", 
          description: `Assembled ${data.data.components.length} components and ${data.data.patterns.length} patterns` 
        });
        setSelectedItem(data.data);
      } else {
        toast({ title: "Assembly Failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Assembly Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsAssembling(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Code copied to clipboard" });
  };

  const stats = statsQuery.data?.data;
  const patterns = patternsQuery.data?.data || [];
  const components = componentsQuery.data?.data || [];

  return (
    <div className="flex flex-col h-full gap-4 p-4" data-testid="template-bank-panel">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6" />
            Smart Template Bank
            <span className="text-muted-foreground text-lg">| حافظة القوالب الذكية</span>
          </h2>
          <p className="text-muted-foreground">
            Intelligent pattern matching and component assembly
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            statsQuery.refetch();
            patternsQuery.refetch();
            componentsQuery.refetch();
          }}
          data-testid="button-refresh-templates"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalPatterns}</div>
                <div className="text-sm text-muted-foreground">Patterns | أنماط</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Puzzle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalComponents}</div>
                <div className="text-sm text-muted-foreground">Components | مكونات</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <Package className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalTemplates}</div>
                <div className="text-sm text-muted-foreground">Templates | قوالب</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stats.mostUsedPatterns[0]?.usageCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Top Usage | أعلى استخدام</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns" data-testid="tab-patterns">
            <Layers className="w-4 h-4 mr-2" />
            Patterns | أنماط
          </TabsTrigger>
          <TabsTrigger value="components" data-testid="tab-components">
            <Code className="w-4 h-4 mr-2" />
            Components | مكونات
          </TabsTrigger>
          <TabsTrigger value="search" data-testid="tab-search">
            <Search className="w-4 h-4 mr-2" />
            Search | بحث
          </TabsTrigger>
          <TabsTrigger value="assemble" data-testid="tab-assemble">
            <Wand2 className="w-4 h-4 mr-2" />
            Assemble | تجميع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="flex-1 mt-4">
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern: any) => (
                <Card key={pattern.id} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg">{pattern.name}</CardTitle>
                      <Badge variant="secondary">{pattern.sector}</Badge>
                    </div>
                    <CardDescription>{pattern.nameAr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pattern.matchKeywords?.slice(0, 5).map((kw: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Used {pattern.usageCount} times
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" data-testid={`button-view-pattern-${pattern.id}`}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{pattern.name} | {pattern.nameAr}</DialogTitle>
                            <DialogDescription>{pattern.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Structure</h4>
                              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                                {JSON.stringify(pattern.structure, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Examples</h4>
                              <div className="flex flex-wrap gap-2">
                                {pattern.examples?.map((ex: string, i: number) => (
                                  <Badge key={i} variant="secondary">{ex}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="components" className="flex-1 mt-4">
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {components.map((comp: any) => (
                <Card key={comp.id} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        {comp.name}
                      </CardTitle>
                      <Badge>{comp.type}</Badge>
                    </div>
                    <CardDescription>{comp.nameAr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {comp.tags?.slice(0, 4).map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {comp.language} | {comp.dependencies?.length || 0} deps
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" data-testid={`button-view-component-${comp.id}`}>
                            View Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{comp.name}</DialogTitle>
                            <DialogDescription>{comp.category} - {comp.language}</DialogDescription>
                          </DialogHeader>
                          <div className="relative">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2"
                              onClick={() => copyCode(comp.code)}
                              data-testid="button-copy-code"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px]">
                              <code>{comp.code}</code>
                            </pre>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Dependencies</h4>
                            <div className="flex flex-wrap gap-2">
                              {comp.dependencies?.map((dep: string, i: number) => (
                                <Badge key={i} variant="secondary">{dep}</Badge>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="flex-1 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Search | البحث بالذكاء الاصطناعي
              </CardTitle>
              <CardDescription>
                Describe what you need and find matching patterns and components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your requirements... | صف متطلباتك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePatternSearch()}
                  data-testid="input-search-query"
                />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="logic">Logic</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handlePatternSearch} disabled={isSearching} data-testid="button-search">
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {searchResults.map((match, i) => (
                    <Card key={i} className="hover-elevate">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={match.type === 'pattern' ? 'default' : 'secondary'}>
                                {match.type}
                              </Badge>
                              <span className="font-medium">{match.template.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{match.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Score: {match.score}
                            </Badge>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Enter a description to search for patterns and components
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assemble" className="flex-1 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Smart Assembly | التجميع الذكي
              </CardTitle>
              <CardDescription>
                Describe features to automatically assemble matching components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Name | اسم المشروع</label>
                  <Input
                    placeholder="My Project"
                    value={assembleName}
                    onChange={(e) => setAssembleName(e.target.value)}
                    data-testid="input-assemble-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector | القطاع</label>
                  <Select value={assembleSector} onValueChange={setAssembleSector}>
                    <SelectTrigger data-testid="select-assemble-sector">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General | عام</SelectItem>
                      <SelectItem value="ecommerce">E-commerce | تجارة إلكترونية</SelectItem>
                      <SelectItem value="healthcare">Healthcare | صحة</SelectItem>
                      <SelectItem value="financial">Financial | مالي</SelectItem>
                      <SelectItem value="education">Education | تعليم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Features (one per line) | الميزات</label>
                <Textarea
                  placeholder="User authentication&#10;Shopping cart&#10;Payment processing&#10;Order management"
                  value={assembleFeatures}
                  onChange={(e) => setAssembleFeatures(e.target.value)}
                  rows={5}
                  data-testid="input-assemble-features"
                />
              </div>
              <Button 
                onClick={handleAssemble} 
                disabled={isAssembling}
                className="w-full"
                data-testid="button-assemble"
              >
                {isAssembling ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Assemble Components | تجميع المكونات
              </Button>

              {selectedItem?.assembled && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Assembly Result | نتيجة التجميع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Patterns:</span>
                        {selectedItem.patterns?.map((p: any) => (
                          <Badge key={p.id} variant="secondary">{p.name}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">Components:</span>
                        {selectedItem.components?.map((c: any) => (
                          <Badge key={c.id} variant="outline">{c.name}</Badge>
                        ))}
                      </div>
                      <div>
                        <span className="font-medium">Dependencies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedItem.assembled?.dependencies?.map((d: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TemplateBankPanel;
