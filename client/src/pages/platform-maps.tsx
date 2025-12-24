import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  Network, Server, Database, FileCode, Layers, Box, 
  ChevronRight, ChevronDown, Folder, File, Component,
  Link2, ArrowRight, Zap, Shield, Globe, Code,
  RefreshCw, Search, Filter, Download, Eye, Cpu,
  HardDrive, Activity, GitBranch, Package, Settings
} from "lucide-react";

interface MapNode {
  id: string;
  name: string;
  nameAr?: string;
  type: string;
  status?: string;
  children?: MapNode[];
  connections?: string[];
  metadata?: Record<string, any>;
}

interface ServiceNode {
  id: string;
  name: string;
  path: string;
  methods: string[];
  dependencies: string[];
  isInternal: boolean;
}

export default function PlatformMaps() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [activeTab, setActiveTab] = useState("infrastructure");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const t = {
    title: language === "ar" ? "خرائط المنصة" : "Platform Maps",
    subtitle: language === "ar" 
      ? "خرائط شاملة للبنية التحتية والصفحات والخدمات والأكواد" 
      : "Comprehensive maps of infrastructure, pages, services, and code",
    infrastructure: language === "ar" ? "البنية التحتية" : "Infrastructure",
    pages: language === "ar" ? "الصفحات" : "Pages",
    services: language === "ar" ? "الخدمات" : "Services",
    relationships: language === "ar" ? "العلاقات" : "Relationships",
    code: language === "ar" ? "الأكواد" : "Code",
    database: language === "ar" ? "قاعدة البيانات" : "Database",
    refresh: language === "ar" ? "تحديث" : "Refresh",
    export: language === "ar" ? "تصدير" : "Export",
    servers: language === "ar" ? "السيرفرات" : "Servers",
    providers: language === "ar" ? "المزودين" : "Providers",
    deployments: language === "ar" ? "النشرات" : "Deployments",
    components: language === "ar" ? "المكونات" : "Components",
    routes: language === "ar" ? "المسارات" : "Routes",
    tables: language === "ar" ? "الجداول" : "Tables",
    files: language === "ar" ? "الملفات" : "Files",
    dependencies: language === "ar" ? "الاعتمادات" : "Dependencies",
    active: language === "ar" ? "نشط" : "Active",
    inactive: language === "ar" ? "غير نشط" : "Inactive",
    loading: language === "ar" ? "جاري التحميل..." : "Loading...",
    noData: language === "ar" ? "لا توجد بيانات" : "No data available",
    totalPages: language === "ar" ? "إجمالي الصفحات" : "Total Pages",
    totalRoutes: language === "ar" ? "إجمالي المسارات" : "Total Routes",
    totalTables: language === "ar" ? "إجمالي الجداول" : "Total Tables",
    totalFiles: language === "ar" ? "إجمالي الملفات" : "Total Files",
    aiContext: language === "ar" ? "سياق AI" : "AI Context",
    aiContextDesc: language === "ar" 
      ? "هذه الخرائط تُغذي المساعدين السياديين و INFERA Agent بفهم كامل للمنصة"
      : "These maps feed Sovereign Assistants & INFERA Agent with full platform understanding",
  };

  // Infrastructure data
  const infrastructureMap: MapNode[] = [
    {
      id: "providers",
      name: "Cloud Providers",
      nameAr: "مزودي السحابة",
      type: "category",
      children: [
        { id: "hetzner", name: "Hetzner Cloud", type: "provider", status: "active", metadata: { servers: 3, regions: ["eu-central", "us-east"] } },
        { id: "aws", name: "Amazon Web Services", type: "provider", status: "inactive", metadata: { servers: 0 } },
        { id: "gcp", name: "Google Cloud", type: "provider", status: "inactive", metadata: { servers: 0 } },
      ]
    },
    {
      id: "servers",
      name: "Active Servers",
      nameAr: "السيرفرات النشطة",
      type: "category",
      children: [
        { id: "srv-1", name: "webnova-prod-01", type: "server", status: "running", metadata: { cpu: 4, ram: 8, purpose: "production" } },
        { id: "srv-2", name: "webnova-staging", type: "server", status: "running", metadata: { cpu: 2, ram: 4, purpose: "staging" } },
      ]
    },
    {
      id: "databases",
      name: "Databases",
      nameAr: "قواعد البيانات",
      type: "category",
      children: [
        { id: "db-main", name: "PostgreSQL Main", type: "database", status: "connected", metadata: { tables: 150, size: "2.3GB" } },
      ]
    },
  ];

  // Pages map from actual routes
  const pagesMap: MapNode[] = [
    {
      id: "public",
      name: "Public Pages",
      nameAr: "الصفحات العامة",
      type: "category",
      children: [
        { id: "landing", name: "Landing", type: "page", metadata: { path: "/" } },
        { id: "auth", name: "Authentication", type: "page", metadata: { path: "/auth" } },
        { id: "pricing", name: "Pricing", type: "page", metadata: { path: "/pricing" } },
        { id: "support", name: "Support", type: "page", metadata: { path: "/support" } },
      ]
    },
    {
      id: "dashboard",
      name: "Dashboard Pages",
      nameAr: "صفحات لوحة التحكم",
      type: "category",
      children: [
        { id: "home", name: "Home", type: "page", metadata: { path: "/" } },
        { id: "projects", name: "Projects", type: "page", metadata: { path: "/projects" } },
        { id: "builder", name: "Builder", type: "page", metadata: { path: "/builder" } },
        { id: "templates", name: "Templates", type: "page", metadata: { path: "/templates" } },
        { id: "analytics", name: "Analytics", type: "page", metadata: { path: "/analytics" } },
      ]
    },
    {
      id: "owner",
      name: "Owner Pages",
      nameAr: "صفحات المالك",
      type: "category",
      children: [
        { id: "owner-dashboard", name: "Owner Dashboard", type: "page", metadata: { path: "/owner" } },
        { id: "infrastructure", name: "Infrastructure", type: "page", metadata: { path: "/owner/infrastructure" } },
        { id: "ai-sovereignty", name: "AI Sovereignty", type: "page", metadata: { path: "/owner/ai-sovereignty" } },
        { id: "control-center", name: "Control Center", type: "page", metadata: { path: "/owner/control-center" } },
        { id: "platform-maps", name: "Platform Maps", type: "page", metadata: { path: "/owner/platform-maps" } },
      ]
    },
    {
      id: "sovereign",
      name: "Sovereign Pages",
      nameAr: "الصفحات السيادية",
      type: "category",
      children: [
        { id: "sovereign-chat", name: "Sovereign Chat", type: "page", metadata: { path: "/sovereign-chat" } },
        { id: "command-center", name: "Command Center", type: "page", metadata: { path: "/sovereign/command-center" } },
        { id: "ai-governance", name: "AI Governance", type: "page", metadata: { path: "/sovereign/ai-governance" } },
      ]
    },
  ];

  // Services map (API endpoints)
  const servicesMap: ServiceNode[] = [
    { id: "auth", name: "Authentication API", path: "/api/auth/*", methods: ["POST", "GET"], dependencies: ["users", "sessions"], isInternal: false },
    { id: "projects", name: "Projects API", path: "/api/projects/*", methods: ["GET", "POST", "PATCH", "DELETE"], dependencies: ["storage"], isInternal: false },
    { id: "ownership", name: "Ownership API", path: "/api/ownership/*", methods: ["GET", "POST", "PATCH"], dependencies: ["platformOwnerships"], isInternal: false },
    { id: "franchise", name: "Franchise API", path: "/api/franchise/*", methods: ["GET", "POST", "PATCH"], dependencies: ["franchiseLicenses"], isInternal: false },
    { id: "contracts", name: "Contracts API", path: "/api/contracts/*", methods: ["GET", "POST"], dependencies: ["digitalContracts", "legalClauses"], isInternal: false },
    { id: "nova", name: "Nova AI API", path: "/api/nova/*", methods: ["POST", "GET"], dependencies: ["anthropic", "conversations"], isInternal: true },
    { id: "sovereign", name: "Sovereign API", path: "/api/sovereign/*", methods: ["GET", "POST"], dependencies: ["sovereignAssistants"], isInternal: true },
    { id: "platform", name: "Platform API", path: "/api/platform/*", methods: ["GET", "POST", "PATCH"], dependencies: ["runtime", "terminal"], isInternal: true },
    { id: "stripe", name: "Stripe Integration", path: "/api/stripe/*", methods: ["POST", "GET"], dependencies: ["stripe-sdk"], isInternal: false },
  ];

  // Database tables
  const databaseTables = [
    { name: "users", columns: 15, rows: "~500", category: "auth" },
    { name: "projects", columns: 18, rows: "~1000", category: "core" },
    { name: "platform_ownerships", columns: 14, rows: "~50", category: "ownership" },
    { name: "franchise_licenses", columns: 20, rows: "~100", category: "ownership" },
    { name: "digital_contracts", columns: 35, rows: "~200", category: "ownership" },
    { name: "sovereign_assistants", columns: 25, rows: "5", category: "ai" },
    { name: "conversations", columns: 12, rows: "~5000", category: "ai" },
    { name: "infrastructure_servers", columns: 30, rows: "~10", category: "infra" },
    { name: "deployments", columns: 20, rows: "~100", category: "infra" },
    { name: "subscriptions", columns: 15, rows: "~200", category: "billing" },
  ];

  // Code structure
  const codeStructure: MapNode[] = [
    {
      id: "client",
      name: "client/",
      type: "folder",
      children: [
        { id: "src", name: "src/", type: "folder", children: [
          { id: "pages", name: "pages/ (90+ files)", type: "folder", metadata: { count: 90 } },
          { id: "components", name: "components/ (50+ files)", type: "folder", metadata: { count: 50 } },
          { id: "hooks", name: "hooks/ (15+ files)", type: "folder", metadata: { count: 15 } },
          { id: "lib", name: "lib/ (10+ files)", type: "folder", metadata: { count: 10 } },
        ]},
      ]
    },
    {
      id: "server",
      name: "server/",
      type: "folder",
      children: [
        { id: "routes", name: "routes.ts", type: "file", metadata: { lines: 3000 } },
        { id: "storage", name: "storage.ts", type: "file", metadata: { lines: 500 } },
        { id: "ownership-routes", name: "ownership-routes.ts", type: "file", metadata: { lines: 800 } },
        { id: "nova-routes", name: "nova-routes.ts", type: "file", metadata: { lines: 600 } },
        { id: "platform-routes", name: "platform-routes.ts", type: "file", metadata: { lines: 1500 } },
      ]
    },
    {
      id: "shared",
      name: "shared/",
      type: "folder",
      children: [
        { id: "schema", name: "schema.ts (15000+ lines)", type: "file", metadata: { lines: 15000, tables: 150 } },
      ]
    },
  ];

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: MapNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    const getIcon = () => {
      switch (node.type) {
        case "provider": return <Globe className="w-4 h-4 text-blue-500" />;
        case "server": return <Server className="w-4 h-4 text-green-500" />;
        case "database": return <Database className="w-4 h-4 text-purple-500" />;
        case "page": return <FileCode className="w-4 h-4 text-orange-500" />;
        case "folder": return <Folder className="w-4 h-4 text-yellow-500" />;
        case "file": return <File className="w-4 h-4 text-gray-500" />;
        case "category": return <Box className="w-4 h-4 text-cyan-500" />;
        default: return <Component className="w-4 h-4" />;
      }
    };

    return (
      <div key={node.id} style={{ marginInlineStart: depth * 16 }}>
        <div 
          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover-elevate ${hasChildren ? 'font-medium' : ''}`}
          onClick={() => hasChildren && toggleNode(node.id)}
          data-testid={`node-${node.id}`}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="w-4" />
          )}
          {getIcon()}
          <span>{isRTL && node.nameAr ? node.nameAr : node.name}</span>
          {node.status && (
            <Badge variant={node.status === "active" || node.status === "running" || node.status === "connected" ? "default" : "secondary"} className="text-xs">
              {node.status}
            </Badge>
          )}
          {node.metadata?.path && (
            <Badge variant="outline" className="text-xs">{node.metadata.path}</Badge>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="border-s ms-3 ps-2">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-background p-4 md:p-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" data-testid="text-platform-maps-title">
              <Network className="w-8 h-8 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-refresh-maps">
              <RefreshCw className="w-4 h-4 me-1" />
              {t.refresh}
            </Button>
            <Button variant="outline" size="sm" data-testid="button-export-maps">
              <Download className="w-4 h-4 me-1" />
              {t.export}
            </Button>
          </div>
        </div>

        {/* AI Context Info */}
        <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-violet-500/20">
                <Cpu className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-violet-700 dark:text-violet-300">{t.aiContext}</h3>
                <p className="text-sm text-muted-foreground">{t.aiContextDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileCode className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">90+</div>
              <div className="text-sm text-muted-foreground">{t.totalPages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">{t.totalRoutes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-muted-foreground">{t.totalTables}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Code className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-muted-foreground">{t.totalFiles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="infrastructure" className="gap-1" data-testid="tab-infrastructure">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">{t.infrastructure}</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-1" data-testid="tab-pages">
              <FileCode className="w-4 h-4" />
              <span className="hidden sm:inline">{t.pages}</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1" data-testid="tab-services">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">{t.services}</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-1" data-testid="tab-database">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">{t.database}</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1" data-testid="tab-code">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">{t.code}</span>
            </TabsTrigger>
          </TabsList>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {t.infrastructure}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "خريطة البنية التحتية للمنصة" : "Platform infrastructure map"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {infrastructureMap.map(node => renderNode(node))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  {t.pages}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "خريطة جميع صفحات المنصة ومساراتها" : "Map of all platform pages and their routes"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {pagesMap.map(node => renderNode(node))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t.services}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "خريطة الخدمات و API endpoints" : "Services and API endpoints map"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicesMap.map(service => (
                    <div key={service.id} className="p-4 rounded-lg border" data-testid={`service-${service.id}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${service.isInternal ? 'text-purple-500' : 'text-blue-500'}`} />
                            <span className="font-medium">{service.name}</span>
                            {service.isInternal && <Badge variant="secondary" className="text-xs">Internal</Badge>}
                          </div>
                          <code className="text-sm text-muted-foreground">{service.path}</code>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.methods.map(method => (
                            <Badge key={method} variant="outline" className="text-xs">{method}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">{language === "ar" ? "يعتمد على:" : "Depends on:"}</span>
                        {service.dependencies.map(dep => (
                          <Badge key={dep} variant="secondary" className="text-xs">{dep}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t.database}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "خريطة جداول قاعدة البيانات" : "Database tables map"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {databaseTables.map(table => (
                    <div key={table.name} className="p-3 rounded-lg border flex items-center justify-between" data-testid={`table-${table.name}`}>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {table.columns} {language === "ar" ? "عمود" : "columns"} | {table.rows} {language === "ar" ? "صف" : "rows"}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">{table.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {t.code}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "خريطة هيكل الأكواد" : "Code structure map"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {codeStructure.map(node => renderNode(node))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Relationships Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              {t.relationships}
            </CardTitle>
            <CardDescription>
              {language === "ar" ? "العلاقات بين المكونات المختلفة" : "Relationships between different components"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileCode className="w-5 h-5 text-orange-500" />
                  <ArrowRight className="w-4 h-4" />
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm">{language === "ar" ? "الصفحات تستدعي الخدمات" : "Pages call Services"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <ArrowRight className="w-4 h-4" />
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm">{language === "ar" ? "الخدمات تتصل بقاعدة البيانات" : "Services connect to Database"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-violet-500" />
                  <ArrowRight className="w-4 h-4" />
                  <Server className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm">{language === "ar" ? "AI يتحكم في البنية التحتية" : "AI controls Infrastructure"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
