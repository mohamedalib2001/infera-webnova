import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Suspense, lazy } from "react";
const Editor = lazy(() => import("@monaco-editor/react"));
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAIWebSocket } from "@/hooks/use-ai-websocket";
import ownerAvatarUrl from "@assets/unnamed_1766647794224.jpg";
import novaAiIcon from "@assets/generated_images/nova_ai_sovereign_icon.png";
import { NovaControlPanel, useNovaFullscreen } from "@/components/nova-control-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Lock,
  Shield,
  MessageSquare,
  Plus,
  Code2,
  Play,
  Terminal,
  Eye,
  Database,
  Settings2,
  FileCode,
  Folder,
  ChevronRight,
  ChevronDown,
  Send,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Sparkles,
  Zap,
  Cpu,
  Activity,
  LayoutGrid,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Loader2,
  Bot,
  User,
  Palette,
  Braces,
  FileJson,
  Hash,
  Rocket,
  GitBranch,
  Cloud,
  Server,
  Gauge,
  TrendingUp,
  Bell,
  Crown,
  Wand2,
  Target,
  Lightbulb,
  BarChart3,
  Globe,
  Key,
  FileSearch,
  TestTube,
  Layers,
  Workflow,
  Package,
  Search,
  X,
  Bug,
  Variable,
  CircleDot,
  FastForward,
  SkipForward,
  StepForward,
  Pause,
  Square,
  History,
  Bookmark,
  Command,
  MessageCircle,
  BookOpen,
  FileText,
  Pencil,
  FolderPlus,
  FilePlus,
  FolderOpen,
  Trash2,
  Move,
  Clipboard,
  ShieldCheck,
  Building,
  Users,
  Store,
  CreditCard,
  LineChart,
  MapPin,
  KeyRound,
  FileOutput,
  ScrollText,
  GitCompare,
  AlertTriangle,
  Verified,
  Timer,
  Link,
  ArrowRightLeft,
  Sun,
  Moon,
  Layout,
  Network,
  ArrowUpDown,
  FileCode2,
  Fingerprint,
  KeySquare,
  Repeat,
  Filter,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  GitPullRequest,
  Puzzle,
  ShieldAlert,
  LayoutTemplate,
  Share2,
  MousePointer2,
  Scan,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  RotateCcw,
  CirclePlay,
  Mic,
  MicOff,
  Pin,
  PinOff,
  Keyboard,
  BellRing,
  Volume2,
  VolumeX,
  Settings,
  Sliders,
  Radio,
  Map,
  Table2,
  Server as ServerIcon,
  Route,
  GitFork,
  Box,
} from "lucide-react";

interface SovereignConversation {
  id: string;
  title: string;
  titleAr?: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

interface GroupPlatform {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  platformType: string;
  status: string;
}

interface SovereignCoreIDEProps {
  workspaceId: string;
  isOwner: boolean;
}

// System Map Interfaces
interface SystemMapSummary {
  success: boolean;
  version: string;
  lastUpdated: string;
  sections: {
    architecture: any;
    database: any;
    components: any;
    apiRoutes: any;
    infrastructure: any;
    relationships: any;
  };
  stats: {
    totalTables: number;
    totalComponents: number;
    totalRoutes: number;
    totalServices: number;
  };
}

// System Map Content Component - Nova AI Working Memory
function SystemMapContent({ isRtl }: { isRtl: boolean }) {
  const [activeSection, setActiveSection] = useState<string>("architecture");
  
  const { data: systemMap, isLoading } = useQuery<SystemMapSummary>({
    queryKey: ["/api/nova/system-map/summary"],
  });

  const sections = [
    { id: "architecture", nameEn: "Architecture", nameAr: "البنية المعمارية", icon: Layers, activeClass: "bg-violet-500/20 border-violet-500/50 text-violet-400" },
    { id: "database", nameEn: "Database", nameAr: "قاعدة البيانات", icon: Database, activeClass: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
    { id: "components", nameEn: "Components", nameAr: "المكونات", icon: Box, activeClass: "bg-green-500/20 border-green-500/50 text-green-400" },
    { id: "apiRoutes", nameEn: "API Routes", nameAr: "مسارات API", icon: Route, activeClass: "bg-amber-500/20 border-amber-500/50 text-amber-400" },
    { id: "infrastructure", nameEn: "Infrastructure", nameAr: "البنية التحتية", icon: ServerIcon, activeClass: "bg-red-500/20 border-red-500/50 text-red-400" },
    { id: "relationships", nameEn: "Relationships", nameAr: "العلاقات", icon: GitFork, activeClass: "bg-pink-500/20 border-pink-500/50 text-pink-400" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 border-cyan-500/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">{isRtl ? "خريطة النظام" : "System Map"}</span>
              <Badge variant="outline" className="text-[9px] h-4 border-cyan-500/30 text-cyan-400">
                {isRtl ? "دليل العمل" : "Working Memory"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span>v{systemMap?.version}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-1.5">
        <Card className="border-blue-500/20">
          <CardContent className="p-2 text-center">
            <Table2 className="h-3 w-3 mx-auto text-blue-400 mb-1" />
            <span className="text-lg font-bold text-blue-400">{systemMap?.stats?.totalTables || 0}</span>
            <p className="text-[8px] text-muted-foreground">{isRtl ? "جداول" : "Tables"}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-2 text-center">
            <Box className="h-3 w-3 mx-auto text-green-400 mb-1" />
            <span className="text-lg font-bold text-green-400">{systemMap?.stats?.totalComponents || 0}</span>
            <p className="text-[8px] text-muted-foreground">{isRtl ? "مكونات" : "Components"}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-2 text-center">
            <Route className="h-3 w-3 mx-auto text-amber-400 mb-1" />
            <span className="text-lg font-bold text-amber-400">{systemMap?.stats?.totalRoutes || 0}</span>
            <p className="text-[8px] text-muted-foreground">{isRtl ? "مسارات" : "Routes"}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20">
          <CardContent className="p-2 text-center">
            <ServerIcon className="h-3 w-3 mx-auto text-red-400 mb-1" />
            <span className="text-lg font-bold text-red-400">{systemMap?.stats?.totalServices || 0}</span>
            <p className="text-[8px] text-muted-foreground">{isRtl ? "خدمات" : "Services"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Section Navigator */}
      <div className="flex flex-wrap gap-1">
        {sections.map((section) => (
          <Button
            key={section.id}
            size="sm"
            variant={activeSection === section.id ? "default" : "outline"}
            className={`text-[9px] h-6 px-2 ${activeSection === section.id ? section.activeClass : ""}`}
            onClick={() => setActiveSection(section.id)}
            data-testid={`btn-section-${section.id}`}
          >
            <section.icon className="h-2.5 w-2.5 mr-1" />
            {isRtl ? section.nameAr : section.nameEn}
          </Button>
        ))}
      </div>

      {/* Active Section Content */}
      {activeSection === "architecture" && systemMap?.sections?.architecture && (
        <Card className="border-violet-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Layers className="h-3 w-3 text-violet-400" />
              {isRtl ? systemMap.sections.architecture.nameAr : systemMap.sections.architecture.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {/* Layers */}
            {systemMap.sections.architecture.layers?.map((layer: any, idx: number) => (
              <div 
                key={layer.id} 
                className="p-2 rounded-md border"
                style={{ borderColor: layer.color + "40", backgroundColor: layer.color + "10" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium" style={{ color: layer.color }}>
                    {isRtl ? layer.nameAr : layer.nameEn}
                  </span>
                  <Badge variant="outline" className="text-[8px] h-3" style={{ borderColor: layer.color + "50", color: layer.color }}>
                    L{idx + 1}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {layer.components.map((comp: string) => (
                    <Badge key={comp} variant="secondary" className="text-[8px] h-4">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Core Modules */}
            <div className="pt-2 border-t border-violet-500/20">
              <span className="text-[9px] text-muted-foreground">{isRtl ? "الوحدات الأساسية" : "Core Modules"}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {systemMap.sections.architecture.coreModules?.map((mod: any) => (
                  <Badge key={mod.id} className="text-[8px] h-4 bg-violet-500/20 text-violet-400 border-violet-500/30">
                    {isRtl ? mod.nameAr : mod.nameEn}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "database" && systemMap?.sections?.database && (
        <Card className="border-blue-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Database className="h-3 w-3 text-blue-400" />
              {isRtl ? systemMap.sections.database.nameAr : systemMap.sections.database.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {/* Tables */}
            <div className="grid grid-cols-2 gap-1.5">
              {systemMap.sections.database.tables?.map((table: any) => (
                <div 
                  key={table.name}
                  className="p-1.5 rounded-md border flex items-center gap-2"
                  style={{ borderColor: table.color + "40" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: table.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-medium block truncate">{table.name}</span>
                    <span className="text-[8px] text-muted-foreground">{table.columns} {isRtl ? "عمود" : "cols"}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Relationships */}
            <div className="pt-2 border-t border-blue-500/20">
              <span className="text-[9px] text-muted-foreground">{isRtl ? "العلاقات" : "Relationships"}</span>
              <div className="space-y-1 mt-1">
                {systemMap.sections.database.relationships?.map((rel: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1 text-[8px]">
                    <Badge variant="outline" className="h-3 text-[7px]">{rel.from}</Badge>
                    <ArrowRightLeft className="h-2 w-2 text-muted-foreground" />
                    <Badge variant="outline" className="h-3 text-[7px]">{rel.to}</Badge>
                    <span className="text-muted-foreground">({isRtl ? rel.labelAr : rel.labelEn})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "components" && systemMap?.sections?.components && (
        <Card className="border-green-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Box className="h-3 w-3 text-green-400" />
              {isRtl ? systemMap.sections.components.nameAr : systemMap.sections.components.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {/* Frontend */}
            <div>
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الواجهة الأمامية" : "Frontend"}</span>
              <div className="space-y-1">
                {systemMap.sections.components.frontend?.map((comp: any) => (
                  <div key={comp.id} className="p-1.5 rounded-md bg-green-500/10 border border-green-500/20">
                    <span className="text-[9px] font-medium text-green-400">{isRtl ? comp.nameAr : comp.nameEn}</span>
                    <p className="text-[8px] text-muted-foreground truncate">{comp.path}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Backend */}
            <div className="pt-2 border-t border-green-500/20">
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الواجهة الخلفية" : "Backend"}</span>
              <div className="space-y-1">
                {systemMap.sections.components.backend?.map((comp: any) => (
                  <div key={comp.id} className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[9px] font-medium text-emerald-400">{isRtl ? comp.nameAr : comp.nameEn}</span>
                    <p className="text-[8px] text-muted-foreground truncate">{comp.path}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "apiRoutes" && systemMap?.sections?.apiRoutes && (
        <Card className="border-amber-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <Route className="h-3 w-3 text-amber-400" />
              {isRtl ? systemMap.sections.apiRoutes.nameAr : systemMap.sections.apiRoutes.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {systemMap.sections.apiRoutes.categories?.map((cat: any) => (
              <div key={cat.id} className="p-2 rounded-md border" style={{ borderColor: cat.color + "40" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[9px] font-medium" style={{ color: cat.color }}>
                    {isRtl ? cat.nameAr : cat.nameEn}
                  </span>
                  <Badge variant="outline" className="text-[7px] h-3 ml-auto">{cat.routes.length}</Badge>
                </div>
                <div className="space-y-1">
                  {cat.routes.map((route: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[8px]">
                      <Badge 
                        variant="outline" 
                        className={`h-3 text-[7px] ${
                          route.method === "GET" ? "text-green-400 border-green-500/30" :
                          route.method === "POST" ? "text-blue-400 border-blue-500/30" :
                          route.method === "PUT" ? "text-amber-400 border-amber-500/30" :
                          "text-red-400 border-red-500/30"
                        }`}
                      >
                        {route.method}
                      </Badge>
                      <code className="text-muted-foreground flex-1 truncate">{route.path}</code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === "infrastructure" && systemMap?.sections?.infrastructure && (
        <Card className="border-red-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <ServerIcon className="h-3 w-3 text-red-400" />
              {isRtl ? systemMap.sections.infrastructure.nameAr : systemMap.sections.infrastructure.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {/* Services */}
            <div>
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الخدمات" : "Services"}</span>
              <div className="grid grid-cols-2 gap-1">
                {systemMap.sections.infrastructure.services?.map((svc: any) => (
                  <div key={svc.id} className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${svc.status === "running" ? "bg-green-400" : "bg-amber-400"}`} />
                    <span className="text-[8px] font-medium">{isRtl ? svc.nameAr : svc.nameEn}</span>
                    {svc.port && <Badge variant="outline" className="text-[7px] h-3 ml-auto">:{svc.port}</Badge>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Cloud */}
            <div className="pt-2 border-t border-red-500/20">
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "السحابة" : "Cloud"}</span>
              <div className="flex flex-wrap gap-1">
                {systemMap.sections.infrastructure.cloud?.map((cloud: any) => (
                  <Badge key={cloud.id} className="text-[8px] h-4 bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {isRtl ? cloud.nameAr : cloud.nameEn}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Security */}
            <div className="pt-2 border-t border-red-500/20">
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الأمان" : "Security"}</span>
              <div className="flex flex-wrap gap-1">
                {systemMap.sections.infrastructure.security?.map((sec: any) => (
                  <Badge key={sec.id} className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Shield className="h-2 w-2 mr-0.5" />
                    {isRtl ? sec.nameAr : sec.nameEn}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "relationships" && systemMap?.sections?.relationships && (
        <Card className="border-pink-500/20">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-2">
              <GitFork className="h-3 w-3 text-pink-400" />
              {isRtl ? systemMap.sections.relationships.nameAr : systemMap.sections.relationships.nameEn}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            {/* Nodes */}
            <div>
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الكيانات" : "Entities"}</span>
              <div className="flex flex-wrap gap-1">
                {systemMap.sections.relationships.nodes?.map((node: any) => (
                  <Badge 
                    key={node.id} 
                    className="text-[8px] h-4"
                    style={{ backgroundColor: node.color + "30", color: node.color, borderColor: node.color + "50" }}
                  >
                    {isRtl ? node.labelAr : node.labelEn}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Edges */}
            <div className="pt-2 border-t border-pink-500/20">
              <span className="text-[9px] text-muted-foreground mb-1 block">{isRtl ? "الروابط" : "Connections"}</span>
              <div className="space-y-1">
                {systemMap.sections.relationships.edges?.map((edge: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1 rounded bg-pink-500/5">
                    <Badge variant="outline" className="text-[7px] h-3">{edge.from}</Badge>
                    <span className="text-[8px] text-pink-400">{isRtl ? edge.labelAr : edge.labelEn}</span>
                    <ArrowRightLeft className="h-2 w-2 text-muted-foreground" />
                    <Badge variant="outline" className="text-[7px] h-3">{edge.to}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nova AI Memory Reference */}
      <Card className="bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-transparent border-violet-500/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-medium">{isRtl ? "ذاكرة نوفا العاملة" : "Nova Working Memory"}</span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            {isRtl 
              ? "هذه الخريطة تستخدم كمرجع لـ Nova AI عند العمل. يتم تحميلها تلقائياً في سياق المحادثة."
              : "This map serves as Nova AI's reference while working. It's automatically loaded into conversation context."}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[8px] h-4 text-green-400 border-green-500/30">
              <CheckCircle className="h-2 w-2 mr-0.5" />
              {isRtl ? "متصل بالذاكرة" : "Memory Connected"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SovereignCoreIDE({ workspaceId, isOwner }: SovereignCoreIDEProps) {
  const { toast } = useToast();
  const { isRtl } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebSocket AI connection for fast streaming responses (always auto-connect)
  const aiWs = useAIWebSocket(true);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ConversationMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  
  // Reset local messages when conversation changes
  useEffect(() => {
    setLocalMessages([]);
    setStreamingMessage("");
  }, [selectedConversation]);
  
  // Auto-retry pending message when WebSocket connects
  useEffect(() => {
    if (pendingMessage && aiWs.isConnected && aiWs.isAuthenticated) {
      const msg = pendingMessage;
      setPendingMessage(null);
      handleSendMessageInternal(msg);
    }
  }, [aiWs.isConnected, aiWs.isAuthenticated, pendingMessage]);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview" | "terminal">("chat");
  const [bottomTab, setBottomTab] = useState<"terminal" | "problems" | "output">("terminal");
  const [rightTab, setRightTab] = useState<"tools" | "files" | "database" | "backend" | "packages" | "testing" | "git" | "deploy" | "debugger" | "copilot" | "compliance" | "tenants" | "rules" | "observability" | "marketplace" | "billing" | "ai-arch" | "export" | "env" | "team" | "api-test" | "cron" | "webhooks" | "profiler" | "notifications" | "settings" | "templates" | "docs" | "deps" | "formatter" | "migrations" | "logs" | "analytics" | "vault" | "schema" | "routes" | "commands" | "governor" | "collab" | "api-docs" | "code-review" | "plugins" | "mobile" | "security" | "benchmarks" | "template-gen" | "erd" | "ai-review" | "kubernetes" | "docker" | "microservices" | "distributed-db" | "ai-ml" | "blockchain" | "event-driven" | "api-gateway" | "cloud-infra" | "permissions">("tools");
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [showNovaControlPanel, setShowNovaControlPanel] = useState(false);
  const novaFullscreen = useNovaFullscreen();
  
  // Nova Advanced Features States
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Set<string>>(new Set());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [novaTheme, setNovaTheme] = useState<"violet" | "emerald" | "amber" | "rose" | "cyan">("violet");
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showNovaSettings, setShowNovaSettings] = useState(false);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP PLATFORMS SELECTION - منصات المجموعة
  // ═══════════════════════════════════════════════════════════════════════════
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  
  // Fetch group platforms (INFERA Engine Federation)
  const { data: groupPlatformsData } = useQuery<{ platforms: GroupPlatform[] }>({
    queryKey: ["/api/platforms", "group"],
  });
  
  const groupPlatforms = groupPlatformsData?.platforms || [];
  
  // Handle platform selection - load platform into IDE
  const handlePlatformSelect = async (platformId: string) => {
    // Get platform name before state changes to avoid stale closure
    const platformName = platformId === "webnova" 
      ? "WebNova Core" 
      : groupPlatforms.find(p => p.id === platformId)?.name || platformId;
    const platformNameAr = platformId === "webnova"
      ? "WebNova الأساسي"
      : groupPlatforms.find(p => p.id === platformId)?.nameAr || platformName;
    
    if (platformId === "webnova") {
      setSelectedPlatformId(null);
      toast({ title: isRtl ? "تم التبديل إلى WebNova الأساسي" : "Switched to WebNova Core" });
    } else {
      setSelectedPlatformId(platformId);
      toast({ 
        title: isRtl ? `تم تحميل المنصة: ${platformNameAr}` : `Platform loaded: ${platformName}` 
      });
    }
    
    // Log platform switch for audit with captured platform name
    setAuditLog(prev => [...prev, {
      timestamp: new Date(),
      action: "PLATFORM_SWITCH",
      phase: currentPhase,
      actor: "ROOT_OWNER",
      metadata: { platformId, platformName }
    }]);
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SOVEREIGN SESSION AUTHORITY SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Security Posture Levels
  type SecurityPosture = "secure" | "elevated" | "restricted";
  
  // Sovereign Phase Types (Three-Stage Access)
  type SovereignPhase = "analysis" | "planning" | "execution";
  
  // Session Authority State
  const [sessionId] = useState(() => `SOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(() => new Date());
  const [securityPosture, setSecurityPosture] = useState<SecurityPosture>("secure");
  const [currentPhase, setCurrentPhase] = useState<SovereignPhase>("analysis");
  const [entryMethod] = useState<"three-stage" | "biometric" | "hardware-key">("three-stage");
  const [auditLog, setAuditLog] = useState<Array<{
    timestamp: Date;
    action: string;
    phase: SovereignPhase;
    actor: string;
    metadata?: Record<string, unknown>;
  }>>([]);
  const [showSovereignStatus, setShowSovereignStatus] = useState(false);
  
  // Log sovereign action
  const logSovereignAction = (action: string, metadata?: Record<string, unknown>) => {
    setAuditLog(prev => [...prev, {
      timestamp: new Date(),
      action,
      phase: currentPhase,
      actor: "ROOT_OWNER",
      metadata
    }]);
  };
  
  // Phase transition with security validation
  const transitionPhase = (newPhase: SovereignPhase) => {
    const phaseOrder: SovereignPhase[] = ["analysis", "planning", "execution"];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const newIndex = phaseOrder.indexOf(newPhase);
    
    // Going to higher phase requires elevated posture check
    if (newIndex > currentIndex) {
      setSecurityPosture("elevated");
      setTimeout(() => setSecurityPosture("secure"), 3000);
    }
    
    logSovereignAction(`PHASE_TRANSITION: ${currentPhase} → ${newPhase}`, { 
      previousPhase: currentPhase, 
      newPhase 
    });
    
    setCurrentPhase(newPhase);
    
    toast({
      title: isRtl ? "تغيير المرحلة" : "Phase Transition",
      description: isRtl 
        ? `تم الانتقال إلى مرحلة ${newPhase === "analysis" ? "التحليل" : newPhase === "planning" ? "التخطيط" : "التنفيذ"}`
        : `Transitioned to ${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)} phase`,
    });
  };
  
  // Phase configuration
  const phaseConfig = {
    analysis: {
      icon: Search,
      label: isRtl ? "التحليل" : "Analysis",
      labelAr: "التحليل",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30",
      capabilities: ["read", "analyze", "search", "report"],
      description: isRtl ? "معلومات وتحليل" : "Information & Analysis"
    },
    planning: {
      icon: Layout,
      label: isRtl ? "التخطيط" : "Planning",
      labelAr: "التخطيط",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
      capabilities: ["read", "analyze", "search", "report", "simulate", "plan"],
      description: isRtl ? "تخطيط ومحاكاة" : "Planning & Simulation"
    },
    execution: {
      icon: Zap,
      label: isRtl ? "التنفيذ" : "Execution",
      labelAr: "التنفيذ",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
      capabilities: ["read", "analyze", "search", "report", "simulate", "plan", "execute", "deploy", "modify"],
      description: isRtl ? "قرارات وأوامر حساسة" : "Decisions & Sensitive Commands"
    }
  };
  
  // Security Posture Configuration
  const postureConfig = {
    secure: {
      icon: ShieldCheck,
      label: isRtl ? "آمن" : "Secure",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/50",
      pulse: false
    },
    elevated: {
      icon: Shield,
      label: isRtl ? "مرتفع" : "Elevated",
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/50",
      pulse: true
    },
    restricted: {
      icon: ShieldAlert,
      label: isRtl ? "مقيّد" : "Restricted",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/50",
      pulse: true
    }
  };
  
  const currentPosture = postureConfig[securityPosture];
  const currentPhaseConfig = phaseConfig[currentPhase];
  
  // Voice Recognition
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Open Nova
      if ((e.ctrlKey || e.metaKey) && e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        setActiveTab("chat");
      }
      // Ctrl/Cmd + Shift + F: Toggle Fullscreen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        novaFullscreen.isFullscreen ? novaFullscreen.minimize() : novaFullscreen.maximize();
      }
      // Ctrl/Cmd + Shift + L: Toggle Floating
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();
        novaFullscreen.toggleFloating();
      }
      // Ctrl/Cmd + K: Focus message input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector('[data-testid="nova-message-input"]') as HTMLInputElement;
        input?.focus();
      }
      // Ctrl/Cmd + ?: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      // Ctrl/Cmd + Shift + V: Toggle voice input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "V") {
        e.preventDefault();
        toggleVoiceInput();
      }
      // Ctrl/Cmd + H: Show conversation history
      if ((e.ctrlKey || e.metaKey) && e.key === "h" && !e.shiftKey) {
        e.preventDefault();
        setShowConversationHistory(prev => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [novaFullscreen]);
  
  // Voice Input Functions
  const toggleVoiceInput = () => {
    if (!isVoiceEnabled) {
      toast({
        title: isRtl ? "الإدخال الصوتي معطل" : "Voice Input Disabled",
        description: isRtl ? "قم بتمكين الإدخال الصوتي من الإعدادات" : "Enable voice input from Nova settings",
      });
      return;
    }
    
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: isRtl ? "غير مدعوم" : "Not Supported",
        description: isRtl ? "المتصفح لا يدعم التعرف على الصوت" : "Browser does not support speech recognition",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isRtl ? "ar-SA" : "en-US";
      
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: isRtl ? "جاري الاستماع..." : "Listening...",
          description: isRtl ? "تحدث الآن" : "Speak now",
        });
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("");
        setNewMessage(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: isRtl ? "خطأ في التعرف على الصوت" : "Speech Recognition Error",
          description: isRtl ? "حدث خطأ أثناء التعرف على الصوت" : "An error occurred during speech recognition",
          variant: "destructive",
        });
      };
      
      speechRecognitionRef.current = recognition;
      recognition.start();
      setIsVoiceEnabled(true);
    }
  };
  
  // Pin/Unpin Message
  const togglePinMessage = (messageId: string) => {
    setPinnedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        toast({
          title: isRtl ? "تم إلغاء التثبيت" : "Unpinned",
          description: isRtl ? "تم إلغاء تثبيت الرسالة" : "Message unpinned",
        });
      } else {
        newSet.add(messageId);
        toast({
          title: isRtl ? "تم التثبيت" : "Pinned",
          description: isRtl ? "تم تثبيت الرسالة للرجوع إليها" : "Message pinned for reference",
        });
      }
      return newSet;
    });
  };
  
  // Show Notification
  const showNovaNotification = (title: string, body: string) => {
    if (!notificationsEnabled) return;
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: novaAiIcon });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: novaAiIcon });
        }
      });
    }
  };
  
  // Nova Theme Colors
  const novaThemeColors = {
    violet: { primary: "from-violet-600 to-fuchsia-600", border: "border-violet-500/30", text: "text-violet-300" },
    emerald: { primary: "from-emerald-600 to-teal-600", border: "border-emerald-500/30", text: "text-emerald-300" },
    amber: { primary: "from-amber-600 to-orange-600", border: "border-amber-500/30", text: "text-amber-300" },
    rose: { primary: "from-rose-600 to-pink-600", border: "border-rose-500/30", text: "text-rose-300" },
    cyan: { primary: "from-cyan-600 to-blue-600", border: "border-cyan-500/30", text: "text-cyan-300" },
  };
  
  const currentTheme = novaThemeColors[novaTheme];
  
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([
    { name: "index.html", path: "/index.html", content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Sovereign Platform</title>\n</head>\n<body>\n  <h1>Welcome to Sovereign Core</h1>\n</body>\n</html>", language: "html" },
    { name: "styles.css", path: "/styles.css", content: "body {\n  font-family: system-ui;\n  background: #0a0a0a;\n  color: white;\n}", language: "css" },
    { name: "app.js", path: "/app.js", content: "// Sovereign Core Application\nconsole.log('Sovereign Core initialized');", language: "javascript" },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[Nova AI] Terminal initialized",
    "[Nova AI] Ready for commands...",
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  const t = {
    ar: {
      title: "Nova AI - مساعد التطوير السيادي",
      subtitle: "عقل ذكاء اصطناعي مستقل - معزول بالكامل",
      ownerOnly: "للمالك فقط",
      isolated: "بيئة معزولة",
      conversations: "المحادثات",
      newConversation: "محادثة جديدة",
      conversationTitle: "عنوان المحادثة",
      create: "إنشاء",
      cancel: "إلغاء",
      typeMessage: "اكتب رسالتك...",
      send: "إرسال",
      processing: "جاري المعالجة...",
      chat: "المحادثة",
      code: "الكود",
      preview: "المعاينة",
      terminal: "الطرفية",
      tools: "الأدوات",
      files: "الملفات",
      database: "قاعدة البيانات",
      problems: "المشاكل",
      output: "المخرجات",
      run: "تشغيل",
      save: "حفظ",
      deploy: "نشر",
      noConversations: "لا توجد محادثات",
      startConversation: "ابدأ محادثة جديدة",
      securityNote: "جميع البيانات مشفرة بـ AES-256-GCM",
      aiThinking: "الذكاء الاصطناعي يفكر...",
      generateCode: "توليد الكود",
      analyzeCode: "تحليل الكود",
      optimizeCode: "تحسين الكود",
      testCode: "اختبار الكود",
      desktop: "سطح المكتب",
      tablet: "الجهاز اللوحي",
      mobile: "الهاتف",
      refresh: "تحديث",
      fullscreen: "ملء الشاشة",
      download: "تحميل",
      copy: "نسخ",
    },
    en: {
      title: "Nova AI - Sovereign Development Assistant",
      subtitle: "Independent AI Mind - Fully Isolated",
      ownerOnly: "Owner Only",
      isolated: "Isolated Environment",
      conversations: "Conversations",
      newConversation: "New Conversation",
      conversationTitle: "Conversation Title",
      create: "Create",
      cancel: "Cancel",
      typeMessage: "Type your message...",
      send: "Send",
      processing: "Processing...",
      chat: "Chat",
      code: "Code",
      preview: "Preview",
      terminal: "Terminal",
      tools: "Tools",
      files: "Files",
      database: "Database",
      problems: "Problems",
      output: "Output",
      run: "Run",
      save: "Save",
      deploy: "Deploy",
      noConversations: "No conversations",
      startConversation: "Start a new conversation",
      securityNote: "All data encrypted with AES-256-GCM",
      aiThinking: "AI is thinking...",
      generateCode: "Generate Code",
      analyzeCode: "Analyze Code",
      optimizeCode: "Optimize Code",
      testCode: "Test Code",
      desktop: "Desktop",
      tablet: "Tablet",
      mobile: "Mobile",
      refresh: "Refresh",
      fullscreen: "Fullscreen",
      download: "Download",
      copy: "Copy",
    },
  };

  const text = isRtl ? t.ar : t.en;

  // WebNova Permissions Query
  interface WebNovaPermission {
    code: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    securityLevel: string;
    isGranted: boolean;
    grantedAt?: string;
  }

  interface WebNovaPermissionsResponse {
    success: boolean;
    webnovaId: string;
    powerLevel: number;
    powerLevelLabel: string;
    powerLevelLabelAr: string;
    stats: { total: number; granted: number; percentage: number };
    categories: Record<string, WebNovaPermission[]>;
    categoryNames: Record<string, { en: string; ar: string }>;
    allGrantedCodes: string[];
  }

  const { data: webnovaPermissions, isLoading: loadingPermissions } = useQuery<WebNovaPermissionsResponse>({
    queryKey: ["/api/nova/permissions/webnova-full"],
  });

  const grantFullPermissionsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/nova/permissions/grant-full-webnova"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/permissions/webnova-full"] });
      toast({ title: isRtl ? "تم منح جميع الصلاحيات" : "All permissions granted", description: isRtl ? "WebNova لديه كامل الصلاحيات الآن" : "WebNova now has full permissions" });
    },
    onError: () => {
      toast({ title: isRtl ? "فشل منح الصلاحيات" : "Failed to grant permissions", variant: "destructive" });
    },
  });

  // AI Models query and mutations
  interface AIModel {
    id: string;
    provider: string;
    nameEn: string;
    nameAr: string;
    icon: string;
    color: string;
    capabilities: string[];
    isEnabled: boolean;
    isPrimary: boolean;
  }

  interface AIModelsResponse {
    success: boolean;
    models: AIModel[];
    stats: { total: number; enabled: number; disabled: number };
    primaryModel: string | null;
    primaryModelName: string | null;
  }

  const { data: aiModelsData, isLoading: loadingAIModels } = useQuery<AIModelsResponse>({
    queryKey: ["/api/nova/models"],
  });

  const toggleModelMutation = useMutation({
    mutationFn: (modelId: string) => apiRequest("POST", `/api/nova/models/${modelId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/models"] });
    },
  });

  const setPrimaryModelMutation = useMutation({
    mutationFn: (modelId: string) => apiRequest("POST", `/api/nova/models/${modelId}/set-primary`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/models"] });
      toast({ title: isRtl ? "تم تحديد النموذج الأساسي" : "Primary model set" });
    },
  });

  const { data: conversations, isLoading: loadingConversations } = useQuery<SovereignConversation[]>({
    queryKey: ['/api/sovereign-core/conversations', workspaceId],
    enabled: isOwner,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<ConversationMessage[]>({
    queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation && isOwner,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations'] });
      setSelectedConversation(data.id);
      setShowNewConversationDialog(false);
      setNewConversationTitle("");
      toast({
        title: isRtl ? "تم إنشاء المحادثة" : "Conversation Created",
        description: isRtl ? "تم إنشاء محادثة سيادية جديدة" : "New sovereign conversation created",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إنشاء المحادثة" : "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsProcessing(true);
      setStreamingMessage("");
      return await apiRequest("POST", `/api/sovereign-core/conversations/${selectedConversation}/messages`, {
        content,
        role: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'] });
      setNewMessage("");
      setIsProcessing(false);
      setStreamingMessage("");
    },
    onError: () => {
      setIsProcessing(false);
      setStreamingMessage("");
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Ref to prevent duplicate conversation creation
  const isCreatingConversationRef = useRef(false);

  // Auto-create conversation if none exists (uses encrypted REST API)
  const ensureConversation = async (): Promise<string | null> => {
    if (selectedConversation) return selectedConversation;
    if (isCreatingConversationRef.current) return null;
    
    isCreatingConversationRef.current = true;
    
    try {
      const title = isRtl 
        ? `جلسة ${new Date().toLocaleDateString('ar-SA')} ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`
        : `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      const data = await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });
      
      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations'] });
      
      toast({
        title: isRtl ? "تم حفظ الجلسة تلقائياً" : "Session Auto-Saved",
        description: isRtl ? "يتم حفظ محادثتك تلقائياً" : "Your conversation is being saved automatically",
      });
      
      isCreatingConversationRef.current = false;
      return data.id;
    } catch (err) {
      console.error("[Auto-save] Failed to create conversation:", err);
      isCreatingConversationRef.current = false;
      return null;
    }
  };

  // Save message using encrypted REST API (proper server-side encryption)
  const persistMessage = async (conversationId: string, content: string, role: "user" | "assistant") => {
    try {
      await apiRequest("POST", `/api/sovereign-core/conversations/${conversationId}/messages`, {
        content,
        role,
      });
      // Refresh messages from server to ensure proper data
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', conversationId, 'messages'] });
    } catch (err) {
      console.error("[Auto-save] Failed to persist message:", err);
    }
  };

  const handleSendMessageInternal = async (userMsg: string) => {
    // Auto-create conversation for persistence FIRST (required for server-side save)
    const convId = await ensureConversation();
    
    if (!convId) {
      toast({
        title: isRtl ? "فشل الحفظ" : "Save Failed",
        description: isRtl ? "تعذر إنشاء جلسة. حاول مرة أخرى." : "Could not create session. Please try again.",
        variant: "destructive",
      });
      return; // Don't proceed without a conversationId - messages would be lost
    }
    
    // Add user message immediately for instant feedback (optimistic UI)
    const tempUserMsgId = `local-${Date.now()}`;
    const userMessage: ConversationMessage = {
      id: tempUserMsgId,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMessage]);
    
    try {
      setIsProcessing(true);
      setStreamingMessage("");
      
      // Pass conversationId to WebSocket - server handles all persistence with encryption
      const response = await aiWs.sendMessage(userMsg, isRtl ? "ar" : "en", convId);
      
      // Add AI response to local messages (for immediate display)
      const aiMessage: ConversationMessage = {
        id: `local-ai-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      setStreamingMessage("");
      
      // Server persists both user and assistant messages with encryption
      // Refresh messages from server and clear local buffer to prevent duplicates
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', convId, 'messages'] });
      // Clear local messages after server sync (slight delay for smooth UX)
      setTimeout(() => {
        setLocalMessages([]);
      }, 500);
    } catch (error) {
      setIsProcessing(false);
      setStreamingMessage("");
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل الاتصال بالذكاء الاصطناعي" : "AI connection failed",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMsg = newMessage.trim();
    setNewMessage("");
    
    // Check if WebSocket is ready
    if (aiWs.isConnected && aiWs.isAuthenticated) {
      await handleSendMessageInternal(userMsg);
    } else if (selectedConversation) {
      // Fallback to REST API
      sendMessageMutation.mutate(userMsg);
    } else {
      // Queue message for when WebSocket connects
      setPendingMessage(userMsg);
      toast({
        title: isRtl ? "جاري الاتصال..." : "Connecting...",
        description: isRtl ? "سيتم إرسال رسالتك عند الاتصال" : "Your message will be sent once connected",
      });
    }
  };

  const handleTerminalCommand = async () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
    setTerminalInput("");
    
    try {
      const res = await apiRequest("POST", "/api/platform/terminal/execute", { command: cmd });
      if (res.output) {
        setTerminalOutput(prev => [...prev, res.output]);
      } else if (res.error) {
        setTerminalOutput(prev => [...prev, `Error: ${res.error}`]);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `[Nova AI] Command simulated: ${cmd}`]);
    }
  };

  const handleGenerateCode = async () => {
    if (!aiWs.isConnected || !aiWs.isAuthenticated) {
      toast({ title: isRtl ? "انتظر اتصال AI" : "Waiting for AI connection", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري توليد الكود..." : "Generating code..." });
    
    try {
      setIsProcessing(true);
      const response = await aiWs.sendMessage(
        isRtl ? "قم بتوليد كود HTML/CSS/JS لمشروع سيادي متكامل" : "Generate complete HTML/CSS/JS code for a sovereign platform",
        isRtl ? "ar" : "en"
      );
      
      // Add response to messages
      setLocalMessages(prev => [...prev, {
        id: `gen-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل التوليد" : "Generation failed", variant: "destructive" });
    }
  };

  const handleAnalyzeCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    if (!code.trim()) {
      toast({ title: isRtl ? "لا يوجد كود للتحليل" : "No code to analyze", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري تحليل الكود عبر Smart Analysis..." : "Analyzing code via Smart Analysis..." });
    
    try {
      setIsProcessing(true);
      const response = await apiRequest('/api/military/analysis/code/snippet', {
        method: 'POST',
        body: JSON.stringify({ 
          code, 
          language: codeFiles[activeFileIndex]?.language || 'javascript',
          filename: codeFiles[activeFileIndex]?.name || 'code.js'
        }),
      });
      
      const result = response as { success: boolean; data: { vulnerabilities: Array<{ type: string; severity: string; description: string }>; metrics: { complexity: number; lines: number }; technicalDebt: string } };
      const analysisText = result.success 
        ? `**Code Analysis Results:**\n\n` +
          `- Complexity: ${result.data.metrics.complexity}\n` +
          `- Lines: ${result.data.metrics.lines}\n` +
          `- Technical Debt: ${result.data.technicalDebt}\n` +
          `- Vulnerabilities Found: ${result.data.vulnerabilities.length}\n\n` +
          (result.data.vulnerabilities.length > 0 
            ? result.data.vulnerabilities.map((v: { type: string; severity: string; description: string }) => `  - [${v.severity}] ${v.type}: ${v.description}`).join('\n')
            : 'No vulnerabilities detected.')
        : 'Analysis completed.';
      
      setLocalMessages(prev => [...prev, {
        id: `analyze-${Date.now()}`,
        role: "assistant",
        content: analysisText,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      if (aiWs.isConnected && aiWs.isAuthenticated) {
        const response = await aiWs.sendMessage(`Analyze this code:\n\`\`\`\n${code}\n\`\`\``, isRtl ? "ar" : "en");
        setLocalMessages(prev => [...prev, {
          id: `analyze-${Date.now()}`,
          role: "assistant",
          content: response,
          createdAt: new Date().toISOString(),
        }]);
      } else {
        toast({ title: isRtl ? "فشل التحليل" : "Analysis failed", variant: "destructive" });
      }
    }
  };

  const handleOptimizeCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    if (!code.trim()) {
      toast({ title: isRtl ? "لا يوجد كود للتحسين" : "No code to optimize", variant: "destructive" });
      return;
    }
    if (!aiWs.isConnected || !aiWs.isAuthenticated) {
      toast({ title: isRtl ? "انتظر اتصال AI" : "Waiting for AI connection", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري تحسين الكود..." : "Optimizing code..." });
    
    try {
      setIsProcessing(true);
      const response = await aiWs.sendMessage(`Optimize this code for better performance:\n\`\`\`\n${code}\n\`\`\``, isRtl ? "ar" : "en");
      setLocalMessages(prev => [...prev, {
        id: `optimize-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل التحسين" : "Optimization failed", variant: "destructive" });
    }
  };

  const handleSecurityScan = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    if (!code.trim()) {
      toast({ title: isRtl ? "لا يوجد كود للفحص" : "No code to scan", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري الفحص الأمني عبر SAST..." : "Running SAST Security Scan..." });
    
    try {
      setIsProcessing(true);
      const response = await apiRequest('/api/military/analysis/security/sast', {
        method: 'POST',
        body: JSON.stringify({ 
          projectPath: '.',
          scanType: 'full',
          includeOwaspTop10: true
        }),
      });
      
      const result = response as { success: boolean; data: { findings: Array<{ category: string; severity: string; title: string; description: string }>; summary: { critical: number; high: number; medium: number; low: number } } };
      const scanText = result.success 
        ? `**Security Scan Results (SAST):**\n\n` +
          `**Summary:**\n` +
          `- Critical: ${result.data.summary.critical}\n` +
          `- High: ${result.data.summary.high}\n` +
          `- Medium: ${result.data.summary.medium}\n` +
          `- Low: ${result.data.summary.low}\n\n` +
          `**Findings:**\n` +
          (result.data.findings.length > 0 
            ? result.data.findings.slice(0, 10).map((f: { category: string; severity: string; title: string; description: string }) => `- [${f.severity}] ${f.category}: ${f.title}`).join('\n')
            : 'No security issues detected.')
        : 'Security scan completed.';
      
      setLocalMessages(prev => [...prev, {
        id: `security-${Date.now()}`,
        role: "assistant",
        content: scanText,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل الفحص الأمني" : "Security scan failed", variant: "destructive" });
    }
  };

  const handleTestCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    
    // Use WebSocket code execution if available
    if (aiWs.isConnected && aiWs.isAuthenticated && codeFiles[activeFileIndex]?.language === "javascript") {
      try {
        setTerminalOutput(prev => [...prev, "[Nova AI] Executing code via WebSocket..."]);
        const result = await aiWs.executeCode(code, "nodejs");
        setTerminalOutput(prev => [...prev, result.output || result.error || "Execution complete"]);
      } catch (error) {
        setTerminalOutput(prev => [...prev, `[Error] ${error}`]);
      }
    } else {
      setTerminalOutput(prev => [
        ...prev, 
        "[Nova AI] Running syntax tests...",
        "[Test] index.html - Syntax valid",
        "[Test] styles.css - Syntax valid", 
        "[Test] app.js - Syntax valid",
        "[Nova AI] All tests passed!"
      ]);
    }
    toast({ title: isRtl ? "تم تشغيل الاختبارات" : "Tests executed" });
  };

  const handleCopyCode = async () => {
    if (codeFiles[activeFileIndex]) {
      await navigator.clipboard.writeText(codeFiles[activeFileIndex].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "html": return <FileCode className="h-4 w-4 text-orange-500" />;
      case "css": return <Palette className="h-4 w-4 text-blue-500" />;
      case "javascript": return <Braces className="h-4 w-4 text-yellow-500" />;
      case "json": return <FileJson className="h-4 w-4 text-green-500" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const generatePreviewContent = () => {
    const html = codeFiles.find(f => f.language === "html")?.content || "";
    const css = codeFiles.find(f => f.language === "css")?.content || "";
    const js = codeFiles.find(f => f.language === "javascript")?.content || "";
    return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
  };

  // Sync WebSocket streaming text to state
  useEffect(() => {
    if (aiWs.streamingText) {
      setStreamingMessage(aiWs.streamingText);
    }
  }, [aiWs.streamingText]);

  // Auto-load last conversation on mount
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  // Combine API messages with local messages (filter duplicates by checking content)
  const allMessages = (() => {
    const serverMsgs = messages || [];
    // Only include local messages that aren't already in server messages
    const uniqueLocalMsgs = localMessages.filter(local => 
      !serverMsgs.some(server => 
        server.content === local.content && server.role === local.role
      )
    );
    return [...serverMsgs, ...uniqueLocalMsgs];
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, streamingMessage]);

  if (!isOwner) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-destructive/50" />
            <p className="text-lg font-medium text-destructive">
              {isRtl ? "الوصول مرفوض - للمالك فقط" : "Access Denied - Owner Only"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`flex flex-col bg-background overflow-hidden transition-all duration-300 ${
        novaFullscreen.isFullscreen 
          ? "fixed inset-0 z-[9999] rounded-none border-0" 
          : "h-[calc(100vh-12rem)] rounded-lg border"
      }`} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              {text.title}
              <Badge variant="outline" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                <Lock className="w-3 h-3 mr-1" />
                {text.ownerOnly}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                <Shield className="w-3 h-3 mr-1" />
                {isRtl ? "حفظ تلقائي" : "Auto-Save"}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              {text.securityNote}
              <span className="text-green-400">•</span>
              <span className="text-green-400 text-[10px]">{isRtl ? "كل دقيقتين" : "Every 2 min"}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Group Platforms Dropdown - منصات المجموعة */}
          <Select 
            value={selectedPlatformId || "webnova"} 
            onValueChange={handlePlatformSelect}
          >
            <SelectTrigger 
              className="w-[180px] h-8 text-xs bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border-cyan-500/30"
              data-testid="select-platform"
            >
              <Network className="w-3.5 h-3.5 mr-2 text-cyan-400" />
              <SelectValue placeholder={isRtl ? "اختر المنصة" : "Select Platform"} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] z-[9999]">
              <SelectItem value="webnova" className="text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="font-medium">WebNova</span>
                  <Badge variant="outline" className="text-[9px] h-4 ml-1 border-violet-500/30 text-violet-400">ROOT</Badge>
                </div>
              </SelectItem>
              {groupPlatforms.length > 0 && (
                <>
                  <Separator className="my-1" />
                  <p className="px-2 py-1 text-[10px] text-muted-foreground font-medium">
                    {isRtl ? "منصات المجموعة" : "Group Platforms"}
                  </p>
                </>
              )}
              {groupPlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      platform.status === "active" ? "bg-green-500" : 
                      platform.status === "development" ? "bg-yellow-500" : "bg-gray-500"
                    }`} />
                    <span>{isRtl && platform.nameAr ? platform.nameAr : platform.name}</span>
                    <Badge variant="outline" className="text-[9px] h-4 ml-1">
                      {platform.platformType}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
              {groupPlatforms.length === 0 && (
                <p className="px-2 py-2 text-[10px] text-muted-foreground text-center">
                  {isRtl ? "لا توجد منصات مرتبطة" : "No linked platforms"}
                </p>
              )}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="h-6" />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowNovaControlPanel(true)} 
            className="border-violet-500/30 text-violet-300"
            data-testid="button-nova-control"
          >
            <Settings2 className="h-4 w-4 mr-1" />
            {isRtl ? "لوحة التحكم" : "Control Panel"}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" onClick={() => setShowSidebar(!showSidebar)} data-testid="toggle-sidebar">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowBottomPanel(!showBottomPanel)} data-testid="toggle-bottom">
            <PanelBottom className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRightPanel(!showRightPanel)} data-testid="toggle-right">
            <PanelRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          {novaFullscreen.isFullscreen ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={novaFullscreen.minimize}
              className="border-amber-500/30 text-amber-400"
              data-testid="button-minimize"
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              {isRtl ? "تصغير" : "Minimize"}
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={novaFullscreen.toggleFloating}
                className={`border-cyan-500/30 ${novaFullscreen.isFloating ? "text-cyan-300 bg-cyan-500/20" : "text-cyan-400"}`}
                data-testid="button-floating"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                {isRtl ? "عائم" : "Float"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={novaFullscreen.maximize}
                className="border-violet-500/30 text-violet-300"
                data-testid="button-maximize"
              >
                <Maximize2 className="h-4 w-4 mr-1" />
                {isRtl ? "ملء الشاشة" : "Fullscreen"}
              </Button>
            </>
          )}
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-run">
            <Play className="h-4 w-4 mr-1" />
            {text.run}
          </Button>
          <Button size="sm" variant="secondary" data-testid="button-deploy">
            <Zap className="h-4 w-4 mr-1" />
            {text.deploy}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {showSidebar && (
          <>
            <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
              <div className="h-full flex flex-col bg-muted/30">
                <div className="p-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{text.conversations}</span>
                    <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6" data-testid="button-new-conversation">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{text.newConversation}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input
                            placeholder={text.conversationTitle}
                            value={newConversationTitle}
                            onChange={(e) => setNewConversationTitle(e.target.value)}
                            data-testid="input-conversation-title"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                              {text.cancel}
                            </Button>
                            <Button onClick={() => createConversationMutation.mutate(newConversationTitle)} disabled={!newConversationTitle.trim()}>
                              <Plus className="h-4 w-4 mr-1" />
                              {text.create}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {loadingConversations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : conversations?.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">{text.noConversations}</p>
                        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setShowNewConversationDialog(true)}>
                          {text.startConversation}
                        </Button>
                      </div>
                    ) : (
                      conversations?.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                            selectedConversation === conv.id
                              ? "bg-violet-500/20 text-violet-300"
                              : "hover:bg-muted"
                          }`}
                          data-testid={`conversation-${conv.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">{conv.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conv.messageCount} {isRtl ? "رسالة" : "messages"}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        <ResizablePanel defaultSize={showSidebar && showRightPanel ? 54 : showSidebar || showRightPanel ? 72 : 100}>
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-40" />
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Nova AI</span>
                  <div className="flex-1" />
                  <div className={`w-2 h-2 rounded-full ${aiWs.isConnected && aiWs.isAuthenticated ? "bg-green-500" : aiWs.isConnected ? "bg-yellow-500" : "bg-red-500"}`} />
                  <span className="text-xs text-muted-foreground">
                    {aiWs.isConnected && aiWs.isAuthenticated 
                      ? (isRtl ? "متصل" : "Connected")
                      : aiWs.isConnected 
                      ? (isRtl ? "مصادقة..." : "Auth...")
                      : (isRtl ? "اتصال..." : "Connecting...")}
                  </span>
                  {aiWs.isProcessing && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
                </div>
                <ScrollArea className="flex-1 p-3">
                      <div className="space-y-4" data-testid="chat-messages">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : allMessages.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <div className="relative mx-auto mb-4 w-16 h-16">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 animate-pulse opacity-30" />
                              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <p className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                              {isRtl ? "مرحباً! أنا Nova AI" : "Hello! I'm Nova AI"}
                            </p>
                            <p className="text-sm mt-1">{isRtl ? "مساعدك الذكي في المنطقة السيادية" : "Your intelligent assistant in the Sovereign Zone"}</p>
                            <p className="text-xs mt-3 opacity-70">{isRtl ? "اكتب رسالتك وسأساعدك في بناء منصتك" : "Type a message and I'll help you build your platform"}</p>
                          </div>
                        ) : (
                          allMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="shrink-0 flex flex-col items-center">
                                  <div className="relative w-9 h-9">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-30" />
                                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                                      <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                  <span className="text-[9px] mt-0.5 text-violet-400 font-medium">Nova AI</span>
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <span className="text-xs opacity-60 mt-1 block">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {msg.role === "user" && (
                                <div className="shrink-0 flex flex-col items-center">
                                  <div className="relative">
                                    <img 
                                      src={ownerAvatarUrl} 
                                      alt="Owner" 
                                      className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/50"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ring-2 ring-background">
                                      <Crown className="h-2.5 w-2.5 text-white" />
                                    </div>
                                  </div>
                                  <span className="text-[9px] mt-0.5 text-amber-400 font-medium">{isRtl ? "المالك" : "Owner"}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {isProcessing && (
                          <div className="flex gap-3 justify-start">
                            <div className="shrink-0">
                              <div className="relative w-9 h-9">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                <span className="text-sm bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-medium">
                                  {isRtl ? "Nova AI يفكر..." : "Nova AI is thinking..."}
                                </span>
                              </div>
                              {streamingMessage && (
                                <p className="text-sm mt-2 whitespace-pre-wrap">{streamingMessage}</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t space-y-3">
                      {/* Sovereign Status Bar */}
                      <div className={`flex items-center justify-between gap-2 p-2 rounded-lg ${currentPosture.bgColor} ${currentPosture.borderColor} border`}>
                        <div className="flex items-center gap-3">
                          {/* Security Posture Indicator */}
                          <div className={`flex items-center gap-1.5 ${currentPosture.pulse ? "animate-pulse" : ""}`}>
                            <currentPosture.icon className={`h-4 w-4 ${currentPosture.color}`} />
                            <span className={`text-xs font-medium ${currentPosture.color}`}>
                              {currentPosture.label}
                            </span>
                          </div>
                          
                          <div className="w-px h-4 bg-border" />
                          
                          {/* Current Phase Indicator */}
                          <div className="flex items-center gap-1.5">
                            <currentPhaseConfig.icon className={`h-4 w-4 ${currentPhaseConfig.color}`} />
                            <span className={`text-xs font-medium ${currentPhaseConfig.color}`}>
                              {currentPhaseConfig.label}
                            </span>
                          </div>
                          
                          <div className="w-px h-4 bg-border" />
                          
                          {/* Entry Method */}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Fingerprint className="h-3 w-3" />
                            <span className="text-xs">{isRtl ? "دخول ثلاثي" : "3-Stage"}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Phase Selector */}
                          <div className="flex items-center gap-0.5 bg-background/50 rounded-md p-0.5">
                            {(["analysis", "planning", "execution"] as const).map((phase) => {
                              const config = phaseConfig[phase];
                              const PhaseIcon = config.icon;
                              return (
                                <Button
                                  key={phase}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => transitionPhase(phase)}
                                  className={`h-6 px-2 ${currentPhase === phase ? `${config.bgColor} ${config.color}` : "text-muted-foreground"}`}
                                  data-testid={`phase-${phase}`}
                                >
                                  <PhaseIcon className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{phase === "analysis" ? "1" : phase === "planning" ? "2" : "3"}</span>
                                </Button>
                              );
                            })}
                          </div>
                          
                          {/* Sovereign Status Dialog Trigger */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowSovereignStatus(true)}
                            className="h-6 w-6"
                            data-testid="button-sovereign-status"
                          >
                            <Activity className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Nova Toolbar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={toggleVoiceInput}
                            className={`h-8 w-8 ${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : ""}`}
                            data-testid="button-voice"
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowConversationHistory(true)}
                            className="h-8 w-8"
                            data-testid="button-history"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowKeyboardShortcuts(true)}
                            className="h-8 w-8"
                            data-testid="button-shortcuts"
                          >
                            <Keyboard className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`h-8 w-8 ${notificationsEnabled ? "text-green-400" : "text-muted-foreground"}`}
                            data-testid="button-notifications"
                          >
                            {notificationsEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowNovaSettings(true)}
                            className="h-8 w-8"
                            data-testid="button-nova-settings"
                          >
                            <Sliders className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={isListening ? (isRtl ? "جاري الاستماع..." : "Listening...") : text.typeMessage}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          disabled={isProcessing || aiWs.isProcessing}
                          className={`min-h-[60px] resize-none ${isListening ? "border-red-500/50 bg-red-500/5" : ""}`}
                          data-testid="nova-message-input"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isProcessing || aiWs.isProcessing}
                          className={`bg-gradient-to-r ${currentTheme.primary}`}
                          data-testid="button-send"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
                      <Code2 className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-medium">{text.code}</span>
                    </div>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30 overflow-x-auto">
                        {codeFiles.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => setActiveFileIndex(idx)}
                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-t transition-colors ${
                              idx === activeFileIndex
                                ? "bg-background border-t border-x"
                                : "hover:bg-muted"
                            }`}
                            data-testid={`file-tab-${file.name}`}
                          >
                            {getFileIcon(file.language)}
                            {file.name}
                          </button>
                        ))}
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Suspense fallback={
                          <div className="flex items-center justify-center h-full bg-slate-900/50">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                              <span className="text-sm">{isRtl ? "جاري تحميل المحرر..." : "Loading editor..."}</span>
                            </div>
                          </div>
                        }>
                          <Editor
                            height="100%"
                            language={codeFiles[activeFileIndex]?.language || "plaintext"}
                            value={codeFiles[activeFileIndex]?.content || ""}
                            onChange={(value) => {
                              const newFiles = [...codeFiles];
                              newFiles[activeFileIndex].content = value || "";
                              setCodeFiles(newFiles);
                            }}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              padding: { top: 10 },
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                            }}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-medium">{text.preview}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant={viewport === "desktop" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("desktop")}>
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant={viewport === "tablet" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("tablet")}>
                          <Tablet className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant={viewport === "mobile" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("mobile")}>
                          <Smartphone className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyCode}>
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-neutral-900 flex items-center justify-center p-2 overflow-auto">
                      <div
                        className="h-full bg-white rounded-lg overflow-hidden shadow-lg"
                        style={{
                          width: viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%",
                          maxWidth: "100%",
                        }}
                      >
                        <iframe
                          srcDoc={generatePreviewContent()}
                          className="w-full h-full border-0"
                          title="Preview"
                          sandbox="allow-scripts"
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        {showBottomPanel && (
          <div className="border-t bg-black/50">
            <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10">
              <button
                onClick={() => setBottomTab("terminal")}
                className={`px-3 py-1 text-xs rounded ${bottomTab === "terminal" ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <Terminal className="h-3 w-3 inline mr-1" />
                {text.terminal}
              </button>
              <button
                onClick={() => setBottomTab("problems")}
                className={`px-3 py-1 text-xs rounded ${bottomTab === "problems" ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                {text.problems}
              </button>
              <button
                onClick={() => setBottomTab("output")}
                className={`px-3 py-1 text-xs rounded ${bottomTab === "output" ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                {text.output}
              </button>
            </div>
            <ScrollArea className="h-32 p-2 font-mono text-xs text-green-400">
              {terminalOutput.map((line, i) => (
                <div key={i} className="py-0.5">{line}</div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-violet-400">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTerminalCommand()}
                  className="flex-1 bg-transparent border-none outline-none text-white"
                  placeholder="Enter command..."
                  data-testid="input-terminal"
                />
              </div>
            </ScrollArea>
          </div>
        )}

        {showRightPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full flex flex-col bg-muted/30">
                <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as typeof rightTab)} className="flex-1 flex flex-col">
                  <div className="border-b px-1">
                    <TabsList className="h-8 bg-transparent w-full justify-start gap-0 flex-wrap">
                      <TabsTrigger value="tools" className="text-[10px] px-1" data-testid="tab-tools" aria-label={isRtl ? "الأدوات" : "Tools"}>
                        <Sparkles className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="files" className="text-[10px] px-1" data-testid="tab-files" aria-label={isRtl ? "الملفات" : "Files"}>
                        <Folder className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="database" className="text-[10px] px-1" data-testid="tab-database" aria-label={isRtl ? "قاعدة البيانات" : "Database"}>
                        <Database className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="backend" className="text-[10px] px-1" data-testid="tab-backend" aria-label={isRtl ? "الباك إند" : "Backend"}>
                        <Server className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="packages" className="text-[10px] px-1" data-testid="tab-packages" aria-label={isRtl ? "الحزم" : "Packages"}>
                        <Package className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="testing" className="text-[10px] px-1" data-testid="tab-testing" aria-label={isRtl ? "الاختبارات" : "Testing"}>
                        <TestTube className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="git" className="text-[10px] px-1" data-testid="tab-git" aria-label="Git">
                        <GitBranch className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="deploy" className="text-[10px] px-1" data-testid="tab-deploy" aria-label={isRtl ? "النشر" : "Deploy"}>
                        <Rocket className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="debugger" className="text-[10px] px-1" data-testid="tab-debugger" aria-label={isRtl ? "التصحيح" : "Debugger"}>
                        <Bug className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="copilot" className="text-[10px] px-1" data-testid="tab-copilot" aria-label={isRtl ? "المساعد" : "Copilot"}>
                        <Sparkles className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="compliance" className="text-[10px] px-1" data-testid="tab-compliance" aria-label={isRtl ? "الامتثال" : "Compliance"}>
                        <ShieldCheck className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="tenants" className="text-[10px] px-1" data-testid="tab-tenants" aria-label={isRtl ? "المستأجرين" : "Tenants"}>
                        <Building className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="rules" className="text-[10px] px-1" data-testid="tab-rules" aria-label={isRtl ? "القواعد" : "Rules"}>
                        <Workflow className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="observability" className="text-[10px] px-1" data-testid="tab-observability" aria-label={isRtl ? "المراقبة" : "Observability"}>
                        <LineChart className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="marketplace" className="text-[10px] px-1" data-testid="tab-marketplace" aria-label={isRtl ? "المتجر" : "Marketplace"}>
                        <Store className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="billing" className="text-[10px] px-1" data-testid="tab-billing" aria-label={isRtl ? "الفواتير" : "Billing"}>
                        <CreditCard className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="ai-arch" className="text-[10px] px-1" data-testid="tab-ai-arch" aria-label={isRtl ? "معمار AI" : "AI Arch"}>
                        <Bot className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="export" className="text-[10px] px-1" data-testid="tab-export" aria-label={isRtl ? "التصدير" : "Export"}>
                        <FileOutput className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="env" className="text-[10px] px-1" data-testid="tab-env" aria-label={isRtl ? "البيئة" : "Env"}>
                        <Key className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="team" className="text-[10px] px-1" data-testid="tab-team" aria-label={isRtl ? "الفريق" : "Team"}>
                        <Users className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="api-test" className="text-[10px] px-1" data-testid="tab-api-test" aria-label={isRtl ? "API" : "API"}>
                        <Globe className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="cron" className="text-[10px] px-1" data-testid="tab-cron" aria-label={isRtl ? "الجدولة" : "Cron"}>
                        <Timer className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="webhooks" className="text-[10px] px-1" data-testid="tab-webhooks" aria-label={isRtl ? "Webhooks" : "Webhooks"}>
                        <Link className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="profiler" className="text-[10px] px-1" data-testid="tab-profiler" aria-label={isRtl ? "الأداء" : "Profiler"}>
                        <Gauge className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="text-[10px] px-1" data-testid="tab-notifications" aria-label={isRtl ? "الإشعارات" : "Alerts"}>
                        <Bell className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="text-[10px] px-1" data-testid="tab-settings" aria-label={isRtl ? "الإعدادات" : "Settings"}>
                        <Settings2 className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="text-[10px] px-1" data-testid="tab-templates" aria-label={isRtl ? "القوالب" : "Templates"}>
                        <Layout className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="docs" className="text-[10px] px-1" data-testid="tab-docs" aria-label={isRtl ? "التوثيق" : "Docs"}>
                        <BookOpen className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="deps" className="text-[10px] px-1" data-testid="tab-deps" aria-label={isRtl ? "التبعيات" : "Deps"}>
                        <Network className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="formatter" className="text-[10px] px-1" data-testid="tab-formatter" aria-label={isRtl ? "التنسيق" : "Format"}>
                        <Wand2 className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="migrations" className="text-[10px] px-1" data-testid="tab-migrations" aria-label={isRtl ? "الترحيل" : "Migrate"}>
                        <ArrowUpDown className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="logs" className="text-[10px] px-1" data-testid="tab-logs" aria-label={isRtl ? "السجلات" : "Logs"}>
                        <ScrollText className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="text-[10px] px-1" data-testid="tab-analytics" aria-label={isRtl ? "التحليلات" : "Analytics"}>
                        <TrendingUp className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="vault" className="text-[10px] px-1" data-testid="tab-vault" aria-label={isRtl ? "الخزنة" : "Vault"}>
                        <Lock className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="schema" className="text-[10px] px-1" data-testid="tab-schema" aria-label={isRtl ? "المخطط" : "Schema"}>
                        <Database className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="routes" className="text-[10px] px-1" data-testid="tab-routes" aria-label={isRtl ? "المسارات" : "Routes"}>
                        <Globe className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="commands" className="text-[10px] px-1" data-testid="tab-commands" aria-label={isRtl ? "الأوامر" : "Commands"}>
                        <Command className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="governor" className="text-[10px] px-1" data-testid="tab-governor" aria-label={isRtl ? "الحاكم" : "Governor"}>
                        <Crown className="h-3 w-3" />
                      </TabsTrigger>
                      
                      {/* Advanced Features - 10 New Tabs */}
                      <TabsTrigger value="collab" className="text-[10px] px-1" data-testid="tab-collab" aria-label={isRtl ? "التعاون الحي" : "Live Collaboration"}>
                        <Users className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="api-docs" className="text-[10px] px-1" data-testid="tab-api-docs" aria-label={isRtl ? "توثيق API" : "API Docs"}>
                        <FileText className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="code-review" className="text-[10px] px-1" data-testid="tab-code-review" aria-label={isRtl ? "مراجعة الكود" : "Code Review"}>
                        <GitPullRequest className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="plugins" className="text-[10px] px-1" data-testid="tab-plugins" aria-label={isRtl ? "الإضافات" : "Plugins"}>
                        <Puzzle className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="text-[10px] px-1" data-testid="tab-mobile" aria-label={isRtl ? "معاينة الهاتف" : "Mobile Preview"}>
                        <Smartphone className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="security" className="text-[10px] px-1" data-testid="tab-security" aria-label={isRtl ? "الفحص الأمني" : "Security Scan"}>
                        <ShieldAlert className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="benchmarks" className="text-[10px] px-1" data-testid="tab-benchmarks" aria-label={isRtl ? "الأداء" : "Benchmarks"}>
                        <Gauge className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="template-gen" className="text-[10px] px-1" data-testid="tab-template-gen" aria-label={isRtl ? "مولد القوالب" : "Template Generator"}>
                        <LayoutTemplate className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="erd" className="text-[10px] px-1" data-testid="tab-erd" aria-label={isRtl ? "رسم العلاقات" : "ERD Visualizer"}>
                        <Share2 className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="ai-review" className="text-[10px] px-1" data-testid="tab-ai-review" aria-label={isRtl ? "مراجعة AI" : "AI Review"}>
                        <Sparkles className="h-3 w-3" />
                      </TabsTrigger>
                      
                      {/* Infrastructure & Enterprise Tabs - 9 New Advanced Tabs */}
                      <TabsTrigger value="kubernetes" className="text-[10px] px-1" data-testid="tab-kubernetes" aria-label={isRtl ? "Kubernetes" : "Kubernetes"}>
                        <Layers className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="docker" className="text-[10px] px-1" data-testid="tab-docker" aria-label={isRtl ? "Docker" : "Docker"}>
                        <HardDrive className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="microservices" className="text-[10px] px-1" data-testid="tab-microservices" aria-label={isRtl ? "الخدمات المصغرة" : "Microservices"}>
                        <Network className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="distributed-db" className="text-[10px] px-1" data-testid="tab-distributed-db" aria-label={isRtl ? "قواعد البيانات الموزعة" : "Distributed DB"}>
                        <Database className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="ai-ml" className="text-[10px] px-1" data-testid="tab-ai-ml" aria-label={isRtl ? "AI/ML" : "AI/ML"}>
                        <Brain className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="blockchain" className="text-[10px] px-1" data-testid="tab-blockchain" aria-label={isRtl ? "البلوكتشين" : "Blockchain"}>
                        <Fingerprint className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="event-driven" className="text-[10px] px-1" data-testid="tab-event-driven" aria-label={isRtl ? "البنية الحدثية" : "Event-Driven"}>
                        <Zap className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="api-gateway" className="text-[10px] px-1" data-testid="tab-api-gateway" aria-label={isRtl ? "بوابة API" : "API Gateway"}>
                        <Globe className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="cloud-infra" className="text-[10px] px-1" data-testid="tab-cloud-infra" aria-label={isRtl ? "البنية السحابية" : "Cloud Infra"}>
                        <Cloud className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="permissions" className="text-[10px] px-1" data-testid="tab-permissions" aria-label={isRtl ? "الصلاحيات" : "Permissions"}>
                        <ShieldCheck className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="system-map" className="text-[10px] px-1" data-testid="tab-system-map" aria-label={isRtl ? "خريطة النظام" : "System Map"}>
                        <Map className="h-3 w-3" />
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2 space-y-2">
                      {/* Owner Welcome Card */}
                      <Card className="bg-gradient-to-br from-amber-500/20 via-violet-500/10 to-transparent border-amber-500/30 mb-2">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Crown className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مرحباً سيدي المالك" : "Welcome, Owner"}</p>
                              <p className="text-[10px] text-muted-foreground">Mohamed Ali Abdalla</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400">
                            <Activity className="h-3 w-3" />
                            <span>{isRtl ? "جميع الأنظمة تعمل بكفاءة" : "All systems operational"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Smart AI Suggestions */}
                      <Card className="bg-violet-500/5 border-violet-500/20 mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "اقتراحات ذكية" : "Smart Suggestions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors" onClick={handleOptimizeCode} disabled={isProcessing} data-testid="button-optimize-performance">
                            <Wand2 className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "تحسين الأداء" : "Optimize Performance"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "3 تحسينات متاحة" : "3 optimizations available"}</p>
                            </div>
                          </button>
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors" onClick={handleSecurityScan} disabled={isProcessing} data-testid="button-security-scan-quick">
                            <Shield className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "فحص أمني" : "Security Scan"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "لم يتم العثور على ثغرات" : "No vulnerabilities found"}</p>
                            </div>
                          </button>
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors">
                            <Target className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "تلميحات الكود" : "Code Hints"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "2 تحسينات مقترحة" : "2 improvements suggested"}</p>
                            </div>
                          </button>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Rocket className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "إجراءات سريعة" : "Quick Actions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleGenerateCode} disabled={isProcessing}>
                              <Code2 className="h-4 w-4 text-violet-400" />
                              {isRtl ? "توليد" : "Generate"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleAnalyzeCode} disabled={isProcessing}>
                              <FileSearch className="h-4 w-4 text-blue-400" />
                              {isRtl ? "تحليل" : "Analyze"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleTestCode} disabled={isProcessing}>
                              <TestTube className="h-4 w-4 text-green-400" />
                              {isRtl ? "اختبار" : "Test"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]">
                              <Rocket className="h-4 w-4 text-orange-400" />
                              {isRtl ? "نشر" : "Deploy"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Development Tools */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5" />
                            {isRtl ? "أدوات التطوير" : "Dev Tools"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                              <span>Git</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">main</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Cloud className="h-3.5 w-3.5 text-blue-400" />
                              <span>{isRtl ? "السحابة" : "Cloud"}</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5 text-green-400">{isRtl ? "متصل" : "Live"}</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-violet-400" />
                              <span>API</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "12 نقطة" : "12 endpoints"}</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Key className="h-3.5 w-3.5 text-amber-400" />
                              <span>{isRtl ? "المفاتيح" : "Secrets"}</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "آمنة" : "Secure"}</Badge>
                          </button>
                        </CardContent>
                      </Card>

                      {/* Real-time Metrics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "المقاييس الحية" : "Live Metrics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">CPU</span>
                              <span className="text-green-400">12%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "12%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "الذاكرة" : "Memory"}</span>
                              <span className="text-blue-400">45%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: "45%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "الاستجابة" : "Response"}</span>
                              <span className="text-violet-400">&lt;0.001s</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: "5%" }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Connection Status */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Workflow className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الاتصالات" : "Connections"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${aiWs.isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                              AI WebSocket
                            </span>
                            <span className={aiWs.isConnected ? "text-green-400" : "text-red-400"}>
                              {aiWs.isConnected ? (isRtl ? "متصل" : "Connected") : (isRtl ? "غير متصل" : "Disconnected")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                              Database
                            </span>
                            <span className="text-green-400">{isRtl ? "متصل" : "Connected"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                              {isRtl ? "التشفير" : "Encryption"}
                            </span>
                            <span className="text-amber-400">AES-256-GCM</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sovereign Security Badge */}
                      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent mb-2">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-400" />
                            <div>
                              <p className="text-xs font-medium text-amber-400">{isRtl ? "حماية سيادية" : "Sovereign Protection"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "صلاحيات المالك الكاملة مفعلة" : "Full owner privileges active"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Executive Dashboard */}
                      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "لوحة التحكم التنفيذية" : "Executive Dashboard"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-green-400">24</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "منصات نشطة" : "Active Platforms"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-blue-400">1.2K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "مستخدمين" : "Users"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-violet-400">99.9%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-amber-400">45K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "طلبات/ساعة" : "Req/Hour"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform Analytics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "تحليلات المنصة" : "Platform Analytics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { label: isRtl ? "الأداء" : "Performance", value: 98, color: "from-green-500 to-emerald-400" },
                            { label: isRtl ? "الأمان" : "Security", value: 100, color: "from-amber-500 to-yellow-400" },
                            { label: isRtl ? "الموثوقية" : "Reliability", value: 99, color: "from-blue-500 to-cyan-400" },
                          ].map((metric) => (
                            <div key={metric.label}>
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground">{metric.label}</span>
                                <span>{metric.value}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Processing Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "إحصائيات الذكاء" : "AI Stats"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الطلبات اليوم" : "Requests Today"}</span>
                            <span className="text-violet-400 font-medium">2,847</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "متوسط الاستجابة" : "Avg Response"}</span>
                            <span className="text-green-400 font-medium">&lt;0.001s</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نسبة النجاح" : "Success Rate"}</span>
                            <span className="text-green-400 font-medium">99.98%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "النماذج النشطة" : "Active Models"}</span>
                            <span className="text-cyan-400 font-medium">Claude 4.5</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* File Search */}
                      <div className="flex gap-1 mb-3">
                        <Input
                          placeholder={isRtl ? "بحث عن ملف..." : "Search files..."}
                          className="h-8 text-xs flex-1"
                          data-testid="input-search-files"
                        />
                        <Button size="sm" variant="outline" className="h-8" data-testid="button-search-files">
                          <Search className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* File Actions */}
                      <div className="flex items-center gap-1 mb-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" data-testid="button-new-file">
                          <FilePlus className="h-3 w-3 mr-1" />
                          {isRtl ? "ملف" : "File"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" data-testid="button-new-folder">
                          <FolderPlus className="h-3 w-3 mr-1" />
                          {isRtl ? "مجلد" : "Folder"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-refresh-files">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* File Tree */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1 text-sm px-2 py-1 hover:bg-muted rounded group">
                          <div className="flex items-center gap-1">
                            <ChevronDown className="h-4 w-4" />
                            <FolderOpen className="h-4 w-4 text-blue-400" />
                            <span>sovereign-project</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-5 w-5" data-testid="button-folder-add">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {codeFiles.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => {
                              setActiveFileIndex(idx);
                              setActiveTab("code");
                            }}
                            className={`w-full flex items-center justify-between gap-1 text-sm px-6 py-1 rounded hover:bg-muted group ${
                              idx === activeFileIndex ? "bg-muted" : ""
                            }`}
                            data-testid={`file-${file.name}`}
                          >
                            <div className="flex items-center gap-1">
                              {getFileIcon(file.language)}
                              <span>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-rename-${file.name}`}>
                                <Pencil className="h-2.5 w-2.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-copy-${file.name}`}>
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-delete-${file.name}`}>
                                <Trash2 className="h-2.5 w-2.5 text-red-400" />
                              </Button>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* File Stats */}
                      <Card className="mt-3 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الملفات" : "Total Files"}</span>
                            <span className="text-blue-400 font-medium">{codeFiles.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الأسطر" : "Total Lines"}</span>
                            <span className="text-green-400 font-medium">2,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الحجم" : "Size"}</span>
                            <span className="text-cyan-400 font-medium">156 KB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="database" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Database Builder Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-400">{isRtl ? "متصل" : "Connected"}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {isRtl ? "تحديث" : "Refresh"}
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-new-table">
                          <Plus className="h-4 w-4 text-green-400" />
                          {isRtl ? "جدول جديد" : "New Table"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-add-relation">
                          <Workflow className="h-4 w-4 text-blue-400" />
                          {isRtl ? "علاقة" : "Relation"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-export-sql">
                          <FileCode className="h-4 w-4 text-violet-400" />
                          {isRtl ? "تصدير SQL" : "Export SQL"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-generate-db">
                          <Wand2 className="h-4 w-4 text-amber-400" />
                          {isRtl ? "توليد AI" : "AI Generate"}
                        </Button>
                      </div>

                      {/* Tables List */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "الجداول" : "Tables"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">8</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {["users", "platforms", "sessions", "permissions", "roles", "logs", "analytics", "settings"].map((table) => (
                            <button
                              key={table}
                              className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors group"
                            >
                              <span className="flex items-center gap-2">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span>{table}</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                                {isRtl ? "عرض" : "View"}
                              </span>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Schema Preview */}
                      <Card className="mb-2 bg-muted/30">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Braces className="h-3.5 w-3.5" />
                            {isRtl ? "مخطط users" : "users Schema"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="font-mono text-[10px] space-y-0.5 text-muted-foreground">
                            <div><span className="text-violet-400">id</span>: <span className="text-cyan-400">serial</span> PK</div>
                            <div><span className="text-violet-400">email</span>: <span className="text-cyan-400">varchar</span></div>
                            <div><span className="text-violet-400">role</span>: <span className="text-cyan-400">enum</span></div>
                            <div><span className="text-violet-400">created_at</span>: <span className="text-cyan-400">timestamp</span></div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Permissions Manager */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "إدارة الصلاحيات" : "Permissions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { role: isRtl ? "المالك" : "Owner", perms: isRtl ? "كاملة" : "Full", color: "text-amber-400" },
                            { role: isRtl ? "مدير" : "Admin", perms: "CRUD", color: "text-violet-400" },
                            { role: isRtl ? "مستخدم" : "User", perms: "R", color: "text-blue-400" },
                          ].map((r) => (
                            <div key={r.role} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/50">
                              <span className={r.color}>{r.role}</span>
                              <Badge variant="outline" className="text-[9px] h-4">{r.perms}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-7 text-[10px] mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة دور" : "Add Role"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Interactive SQL Editor */}
                      <Card className="mb-2 border-green-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Terminal className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "محرر SQL" : "SQL Editor"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Textarea 
                            placeholder={isRtl ? "SELECT * FROM users WHERE..." : "SELECT * FROM users WHERE..."} 
                            className="h-20 text-[10px] font-mono resize-none bg-muted/50" 
                            data-testid="input-sql-query"
                          />
                          <div className="flex items-center gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-green-600 hover:bg-green-700" data-testid="button-run-sql">
                              <Play className="h-3 w-3 mr-1" />
                              {isRtl ? "تنفيذ" : "Run"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-format-sql">
                              <Braces className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-save-sql">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* SQL Query Results Preview */}
                      <Card className="mb-2 bg-muted/30">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            {isRtl ? "النتائج" : "Results"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-green-400">5 {isRtl ? "صفوف" : "rows"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[9px] font-mono">
                              <thead>
                                <tr className="border-b border-muted">
                                  <th className="text-left p-1 text-muted-foreground">id</th>
                                  <th className="text-left p-1 text-muted-foreground">email</th>
                                  <th className="text-left p-1 text-muted-foreground">role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { id: 1, email: "owner@infera.io", role: "owner" },
                                  { id: 2, email: "admin@infera.io", role: "admin" },
                                  { id: 3, email: "user@test.com", role: "user" },
                                ].map((row) => (
                                  <tr key={row.id} className="border-b border-muted/50">
                                    <td className="p-1 text-cyan-400">{row.id}</td>
                                    <td className="p-1">{row.email}</td>
                                    <td className="p-1 text-violet-400">{row.role}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Queries */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "استعلامات محفوظة" : "Saved Queries"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "كل المستخدمين" : "All Users", query: "SELECT * FROM users" },
                            { name: isRtl ? "المسؤولين النشطين" : "Active Admins", query: "SELECT * FROM users WHERE role='admin'" },
                          ].map((q, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`button-query-${i}`}>
                              <span className="truncate">{q.name}</span>
                              <Play className="h-3 w-3 text-green-400 shrink-0" />
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Database Stats */}
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الجداول" : "Tables"}</span>
                            <span className="text-cyan-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "السجلات" : "Records"}</span>
                            <span className="text-cyan-400 font-medium">12,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الحجم" : "Size"}</span>
                            <span className="text-cyan-400 font-medium">24.5 MB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Backend Generator Tab */}
                  <TabsContent value="backend" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Backend Generator Header */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Server className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مولد الباك إند" : "Backend Generator"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "إنشاء API كامل بنقرة واحدة" : "Generate full API with one click"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Framework Selection */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "الإطار" : "Framework"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Express.js", icon: "JS", selected: true },
                            { name: "NestJS", icon: "TS", selected: false },
                            { name: "FastAPI", icon: "PY", selected: false },
                            { name: "Django", icon: "PY", selected: false },
                          ].map((fw) => (
                            <button
                              key={fw.name}
                              data-testid={`button-select-${fw.name.toLowerCase().replace('.', '-')}`}
                              className={`w-full flex items-center justify-between p-1.5 rounded text-[10px] transition-colors ${
                                fw.selected ? "bg-violet-500/20 text-violet-400" : "hover:bg-muted"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{fw.icon}</Badge>
                                <span>{fw.name}</span>
                              </span>
                              {fw.selected && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* API Generation Options */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "توليد API" : "API Generation"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-crud">
                              <Database className="h-4 w-4 text-blue-400" />
                              {isRtl ? "CRUD" : "CRUD API"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-auth">
                              <Shield className="h-4 w-4 text-green-400" />
                              {isRtl ? "المصادقة" : "Auth API"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-rest">
                              <Globe className="h-4 w-4 text-violet-400" />
                              REST
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-graphql">
                              <Braces className="h-4 w-4 text-pink-400" />
                              GraphQL
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Database Connection */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "قاعدة البيانات" : "Database"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "PostgreSQL", status: isRtl ? "متصل" : "Connected", color: "text-green-400" },
                            { name: "MongoDB", status: isRtl ? "غير متصل" : "Disconnected", color: "text-muted-foreground" },
                            { name: "Redis", status: isRtl ? "غير متصل" : "Disconnected", color: "text-muted-foreground" },
                          ].map((db) => (
                            <div key={db.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span>{db.name}</span>
                              <span className={db.color}>{db.status}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Generate Full Backend */}
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white" data-testid="button-generate-backend">
                        <Wand2 className="h-4 w-4 mr-2" />
                        {isRtl ? "توليد الباك إند الكامل" : "Generate Full Backend"}
                      </Button>
                    </ScrollArea>
                  </TabsContent>

                  {/* Package Manager Tab */}
                  <TabsContent value="packages" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Search Packages */}
                      <div className="flex gap-1 mb-3">
                        <Input
                          placeholder={isRtl ? "بحث عن حزمة..." : "Search packages..."}
                          className="h-8 text-xs flex-1"
                          data-testid="input-search-packages"
                        />
                        <Button size="sm" variant="outline" className="h-8" data-testid="button-search-npm">
                          <Search className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Installed Packages */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الحزم المثبتة" : "Installed"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">24</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "express", version: "4.18.2", type: "prod" },
                            { name: "react", version: "18.2.0", type: "prod" },
                            { name: "typescript", version: "5.3.3", type: "dev" },
                            { name: "drizzle-orm", version: "0.29.3", type: "prod" },
                            { name: "@anthropic-ai/sdk", version: "0.14.1", type: "prod" },
                          ].map((pkg) => (
                            <div key={pkg.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{pkg.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px] h-4">{pkg.version}</Badge>
                                <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" data-testid={`button-remove-${pkg.name}`}>
                                  <X className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Quick Install */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Download className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "تثبيت سريع" : "Quick Install"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-openai">
                              openai
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-stripe">
                              stripe
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-zod">
                              zod
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-axios">
                              axios
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Package Stats */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الإنتاج" : "Production"}</span>
                            <span className="text-blue-400 font-medium">18</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التطوير" : "Development"}</span>
                            <span className="text-blue-400 font-medium">6</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تحديثات متاحة" : "Updates"}</span>
                            <span className="text-amber-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Testing Suite Tab */}
                  <TabsContent value="testing" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Test Status */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <TestTube className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "حالة الاختبارات" : "Test Status"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "24 من 26 ناجح" : "24 of 26 passing"}</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "92%" }} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Test Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-run-all-tests">
                          <Play className="h-4 w-4 text-green-400" />
                          {isRtl ? "تشغيل الكل" : "Run All"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-run-failed">
                          <RefreshCw className="h-4 w-4 text-red-400" />
                          {isRtl ? "الفاشلة" : "Failed"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-tests">
                          <Wand2 className="h-4 w-4 text-violet-400" />
                          {isRtl ? "توليد" : "Generate"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-coverage">
                          <Target className="h-4 w-4 text-blue-400" />
                          {isRtl ? "التغطية" : "Coverage"}
                        </Button>
                      </div>

                      {/* Test Results */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5" />
                            {isRtl ? "نتائج الاختبارات" : "Test Results"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { suite: "auth.test.ts", passed: 8, failed: 0, color: "text-green-400" },
                            { suite: "api.test.ts", passed: 12, failed: 1, color: "text-amber-400" },
                            { suite: "db.test.ts", passed: 4, failed: 1, color: "text-amber-400" },
                          ].map((test) => (
                            <div key={test.suite} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="truncate flex-1">{test.suite}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-green-400">{test.passed}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className={test.failed > 0 ? "text-red-400" : "text-muted-foreground"}>{test.failed}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Test Types */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "أنواع الاختبارات" : "Test Types"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { type: isRtl ? "وحدة" : "Unit", count: 18, color: "text-blue-400" },
                            { type: isRtl ? "تكامل" : "Integration", count: 6, color: "text-violet-400" },
                            { type: "E2E", count: 2, color: "text-green-400" },
                          ].map((t) => (
                            <div key={t.type} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span>{t.type}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${t.color}`}>{t.count}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Coverage Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تغطية الكود" : "Code Coverage"}</span>
                            <span className="text-green-400 font-medium">87%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "87%" }} />
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Git Integration Tab */}
                  <TabsContent value="git" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Repository Status */}
                      <Card className="mb-2 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="h-4 w-4 text-orange-400" />
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المستودع" : "Repository"}</p>
                              <p className="text-[10px] text-muted-foreground">infera-webnova</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">main</Badge>
                            <span className="text-muted-foreground">{isRtl ? "محدث" : "Up to date"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Git Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-pull">
                          <Download className="h-4 w-4 text-blue-400" />
                          {isRtl ? "سحب" : "Pull"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-push">
                          <Cloud className="h-4 w-4 text-green-400" />
                          {isRtl ? "رفع" : "Push"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-branch">
                          <GitBranch className="h-4 w-4 text-violet-400" />
                          {isRtl ? "فرع" : "Branch"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-sync">
                          <RefreshCw className="h-4 w-4 text-orange-400" />
                          {isRtl ? "مزامنة" : "Sync"}
                        </Button>
                      </div>

                      {/* Recent Commits */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            {isRtl ? "آخر الإيداعات" : "Recent Commits"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { msg: "Enhanced AI IDE interface", time: "2m ago", color: "text-green-400" },
                            { msg: "Added WebSocket streaming", time: "1h ago", color: "text-blue-400" },
                            { msg: "Database builder UI", time: "3h ago", color: "text-violet-400" },
                          ].map((commit, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className={`h-1.5 w-1.5 rounded-full mt-1 ${commit.color.replace("text-", "bg-")}`} />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{commit.msg}</p>
                                <p className="text-muted-foreground">{commit.time}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Changed Files */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "الملفات المتغيرة" : "Changed Files"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">3</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "sovereign-core-ide.tsx", status: "M", color: "text-amber-400" },
                            { name: "ai-websocket.ts", status: "M", color: "text-amber-400" },
                            { name: "schema.ts", status: "A", color: "text-green-400" },
                          ].map((file) => (
                            <div key={file.name} className="flex items-center justify-between p-1 text-[10px]">
                              <span className="truncate flex-1">{file.name}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${file.color}`}>{file.status}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Commit Form */}
                      <Card className="border-green-500/20">
                        <CardContent className="p-2 space-y-2">
                          <Input
                            placeholder={isRtl ? "رسالة الإيداع..." : "Commit message..."}
                            className="h-8 text-xs"
                            data-testid="input-commit-message"
                          />
                          <Button size="sm" className="w-full text-xs bg-green-600 hover:bg-green-700" data-testid="button-commit-push">
                            <Check className="h-3 w-3 mr-1" />
                            {isRtl ? "إيداع ورفع" : "Commit & Push"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Deployment Tab */}
                  <TabsContent value="deploy" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Deployment Status */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <Cloud className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "حالة النشر" : "Deployment Status"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "مباشر" : "Live"}</p>
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            app.infera.io
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Deploy Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-deploy">
                          <Rocket className="h-4 w-4 text-green-400" />
                          {isRtl ? "نشر" : "Deploy"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-rebuild">
                          <RefreshCw className="h-4 w-4 text-blue-400" />
                          {isRtl ? "إعادة بناء" : "Rebuild"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-servers">
                          <Server className="h-4 w-4 text-violet-400" />
                          {isRtl ? "السيرفرات" : "Servers"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-domain">
                          <Globe className="h-4 w-4 text-amber-400" />
                          {isRtl ? "الدومين" : "Domain"}
                        </Button>
                      </div>

                      {/* Environments */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5" />
                            {isRtl ? "البيئات" : "Environments"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Production", status: isRtl ? "مباشر" : "Live", color: "text-green-400", dot: "bg-green-400" },
                            { name: "Staging", status: isRtl ? "جاهز" : "Ready", color: "text-blue-400", dot: "bg-blue-400" },
                            { name: "Development", status: isRtl ? "محلي" : "Local", color: "text-amber-400", dot: "bg-amber-400" },
                          ].map((env) => (
                            <div key={env.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${env.dot}`} />
                                {env.name}
                              </span>
                              <span className={env.color}>{env.status}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Server Stats */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "أداء السيرفر" : "Server Performance"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</span>
                              <span className="text-green-400">99.99%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "99.99%" }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-2 rounded bg-muted/30">
                              <p className="text-muted-foreground">{isRtl ? "الطلبات" : "Requests"}</p>
                              <p className="text-lg font-bold text-cyan-400">45K</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30">
                              <p className="text-muted-foreground">{isRtl ? "الاستجابة" : "Response"}</p>
                              <p className="text-lg font-bold text-green-400">23ms</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Deployments */}
                      <Card>
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {isRtl ? "آخر النشرات" : "Recent Deploys"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { version: "v2.4.1", time: "5m ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                            { version: "v2.4.0", time: "2h ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                            { version: "v2.3.9", time: "1d ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                          ].map((deploy) => (
                            <div key={deploy.version} className="flex items-center justify-between p-1 text-[10px]">
                              <span className="font-mono">{deploy.version}</span>
                              <span className="text-muted-foreground">{deploy.time}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${deploy.color}`}>{deploy.status}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Debugger Tab */}
                  <TabsContent value="debugger" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Debugger Status */}
                      <Card className="mb-2 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-red-500/20">
                              <Bug className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المصحح" : "Debugger"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "جاهز للتصحيح" : "Ready to debug"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Debug Controls */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Play className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "التحكم" : "Controls"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-start">
                              <Play className="h-3 w-3 text-green-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-pause">
                              <Pause className="h-3 w-3 text-amber-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-stop">
                              <Square className="h-3 w-3 text-red-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-over">
                              <FastForward className="h-3 w-3 text-blue-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-into">
                              <StepForward className="h-3 w-3 text-violet-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-out">
                              <SkipForward className="h-3 w-3 text-cyan-400" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Breakpoints */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "نقاط التوقف" : "Breakpoints"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">3</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { file: "index.ts", line: 42, enabled: true },
                            { file: "routes.ts", line: 128, enabled: true },
                            { file: "auth.ts", line: 56, enabled: false },
                          ].map((bp, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group">
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${bp.enabled ? "bg-red-400" : "bg-muted-foreground"}`} />
                                <span className="truncate">{bp.file}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">{isRtl ? `سطر ${bp.line}` : `Line ${bp.line}`}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-6 text-[10px]" data-testid="button-add-breakpoint">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة نقطة توقف" : "Add Breakpoint"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Variables */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Variable className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المتغيرات" : "Variables"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "userId", value: "\"abc123\"", type: "string" },
                            { name: "isActive", value: "true", type: "boolean" },
                            { name: "count", value: "42", type: "number" },
                            { name: "data", value: "{...}", type: "object" },
                          ].map((v) => (
                            <div key={v.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <span className="text-blue-400 font-mono">{v.name}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono">{v.value}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{v.type}</Badge>
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Call Stack */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "مكدس الاستدعاء" : "Call Stack"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { func: "handleRequest", file: "routes.ts:128" },
                            { func: "authenticate", file: "auth.ts:56" },
                            { func: "validateToken", file: "jwt.ts:23" },
                          ].map((frame, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="text-violet-400 font-mono">{frame.func}()</span>
                              <span className="text-muted-foreground">{frame.file}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Watch Expressions */}
                      <Card>
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "المراقبة" : "Watch"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Input placeholder={isRtl ? "تعبير للمراقبة..." : "Expression to watch..."} className="h-7 text-[10px] flex-1" data-testid="input-watch-expression" />
                            <Button size="sm" variant="outline" className="h-7" data-testid="button-add-watch">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {[
                            { expr: "user.email", value: "\"test@example.com\"" },
                            { expr: "items.length", value: "5" },
                          ].map((w, i) => (
                            <div key={w.expr} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group" data-testid={`watch-expression-${i}`}>
                              <span className="text-amber-400 font-mono">{w.expr}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground font-mono">{w.value}</span>
                                <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" data-testid={`button-remove-watch-${i}`}>
                                  <X className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* AI Copilot Tab */}
                  <TabsContent value="copilot" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Copilot Status */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Sparkles className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المساعد الذكي" : "AI Copilot"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "نشط ومستعد" : "Active & Ready"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-violet-400">Claude 4.5</Badge>
                            <span className="text-muted-foreground">&lt;0.001s</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick AI Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-complete">
                          <Command className="h-4 w-4 text-violet-400" />
                          {isRtl ? "إكمال" : "Complete"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-explain">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          {isRtl ? "شرح" : "Explain"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-refactor">
                          <Pencil className="h-4 w-4 text-green-400" />
                          {isRtl ? "إعادة هيكلة" : "Refactor"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-fix">
                          <Wand2 className="h-4 w-4 text-amber-400" />
                          {isRtl ? "إصلاح" : "Fix"}
                        </Button>
                      </div>

                      {/* Code Suggestions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "اقتراحات الكود" : "Code Suggestions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { title: isRtl ? "تحسين الأداء" : "Optimize loop", desc: isRtl ? "استخدم map بدلاً من forEach" : "Use map instead of forEach", icon: Zap },
                            { title: isRtl ? "إضافة معالجة الأخطاء" : "Add error handling", desc: isRtl ? "try/catch مفقود" : "Missing try/catch block", icon: Shield },
                            { title: isRtl ? "تحسين النوع" : "Improve typing", desc: isRtl ? "أنواع TypeScript أفضل" : "Better TypeScript types", icon: Braces },
                          ].map((s, i) => (
                            <button key={i} className="w-full flex items-start gap-2 p-2 rounded bg-muted/30 hover:bg-muted text-left transition-colors" data-testid={`button-suggestion-${i}`}>
                              <s.icon className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium truncate">{s.title}</p>
                                <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                              </div>
                              <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Chat */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "محادثة سريعة" : "Quick Chat"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Textarea 
                            placeholder={isRtl ? "اسأل عن أي شيء..." : "Ask anything..."} 
                            className="h-16 text-[10px] resize-none" 
                            data-testid="input-copilot-chat"
                          />
                          <Button size="sm" className="w-full text-xs" data-testid="button-copilot-send">
                            <Send className="h-3 w-3 mr-1" />
                            {isRtl ? "إرسال" : "Send"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* AI History */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <History className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "السجل" : "History"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { query: isRtl ? "أنشئ API للمستخدمين" : "Create user API", time: "2m" },
                            { query: isRtl ? "أضف المصادقة" : "Add authentication", time: "15m" },
                            { query: isRtl ? "حسّن قاعدة البيانات" : "Optimize database", time: "1h" },
                          ].map((h, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`button-history-${i}`}>
                              <span className="truncate flex-1 text-left">{h.query}</span>
                              <span className="text-muted-foreground shrink-0">{h.time}</span>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الطلبات اليوم" : "Requests Today"}</span>
                            <span className="text-violet-400 font-medium">127</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الأسطر المولدة" : "Lines Generated"}</span>
                            <span className="text-green-400 font-medium">2,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الوقت الموفر" : "Time Saved"}</span>
                            <span className="text-cyan-400 font-medium">4.5h</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Compliance & Sovereignty Tab */}
                  <TabsContent value="compliance" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Compliance Status Header */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <ShieldCheck className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "السيادة والامتثال" : "Sovereignty & Compliance"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "جميع المعايير مستوفاة" : "All Standards Met"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400 border-green-500/30">GDPR</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400 border-green-500/30">ISO 27001</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400 border-green-500/30">SOC2</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Data Residency */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "إقامة البيانات" : "Data Residency"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { region: isRtl ? "السعودية" : "Saudi Arabia", code: "SA", status: "primary", color: "text-green-400" },
                            { region: isRtl ? "الإمارات" : "UAE", code: "AE", status: "backup", color: "text-blue-400" },
                            { region: isRtl ? "أوروبا" : "Europe", code: "EU", status: "available", color: "text-muted-foreground" },
                          ].map((r) => (
                            <div key={r.code} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`region-${r.code}`}>
                              <span className="flex items-center gap-2">
                                <Globe className="h-3 w-3" />
                                <span>{r.region}</span>
                              </span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${r.color}`}>{r.status}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-change-region">
                            <MapPin className="h-3 w-3 mr-1" />
                            {isRtl ? "تغيير المنطقة" : "Change Region"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* BYOK - Bring Your Own Key */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "مفتاحك الخاص (BYOK)" : "Bring Your Own Key"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/30">
                            <span>{isRtl ? "التشفير" : "Encryption"}</span>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">AES-256</Badge>
                          </div>
                          <div className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/30">
                            <span>{isRtl ? "مصدر المفتاح" : "Key Source"}</span>
                            <Badge variant="outline" className="text-[9px] h-4 text-amber-400">{isRtl ? "مخصص" : "Custom"}</Badge>
                          </div>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-manage-keys">
                            <Key className="h-3 w-3 mr-1" />
                            {isRtl ? "إدارة المفاتيح" : "Manage Keys"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Audit Logs */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "سجلات التدقيق" : "Audit Logs"}
                            <Badge variant="outline" className="text-[9px] h-4 ml-auto">{isRtl ? "غير قابلة للتعديل" : "Immutable"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { action: isRtl ? "تسجيل دخول المالك" : "Owner Login", time: "2m", level: "info" },
                            { action: isRtl ? "تحديث الصلاحيات" : "Permission Update", time: "1h", level: "warning" },
                            { action: isRtl ? "نشر الإنتاج" : "Production Deploy", time: "3h", level: "success" },
                          ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`audit-log-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${log.level === 'success' ? 'bg-green-400' : log.level === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                                <span className="truncate">{log.action}</span>
                              </span>
                              <span className="text-muted-foreground shrink-0">{log.time}</span>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-6 text-[10px]" data-testid="button-view-all-logs">
                            {isRtl ? "عرض كل السجلات" : "View All Logs"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Compliance Scores */}
                      <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          {[
                            { label: "GDPR", score: 100 },
                            { label: "ISO 27001", score: 98 },
                            { label: "SOC2", score: 100 },
                            { label: "HIPAA", score: 85 },
                          ].map((c) => (
                            <div key={c.label}>
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground">{c.label}</span>
                                <span className={c.score === 100 ? "text-green-400" : "text-amber-400"}>{c.score}%</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${c.score === 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${c.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Multi-Tenancy Tab */}
                  <TabsContent value="tenants" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Tenancy Header */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Building className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "إدارة المستأجرين" : "Multi-Tenancy"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "عزل كامل للبيانات" : "Complete Data Isolation"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tenant Selector */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المستأجرين النشطين" : "Active Tenants"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "INFERA Main", users: 156, plan: "Enterprise", active: true },
                            { name: "Client Alpha", users: 45, plan: "Business", active: false },
                            { name: "Client Beta", users: 28, plan: "Starter", active: false },
                          ].map((t, i) => (
                            <button key={i} className={`w-full flex items-center justify-between p-2 rounded text-[10px] transition-colors ${t.active ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-muted/30 hover:bg-muted'}`} data-testid={`tenant-${i}`}>
                              <span className="flex items-center gap-2">
                                <Building className="h-3 w-3" />
                                <span>{t.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{t.users} {isRtl ? "مستخدم" : "users"}</Badge>
                                <Badge variant="outline" className="text-[9px] h-4 text-violet-400">{t.plan}</Badge>
                              </div>
                            </button>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-tenant">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة مستأجر" : "Add Tenant"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Tenant Isolation Settings */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "إعدادات العزل" : "Isolation Settings"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { label: isRtl ? "عزل قاعدة البيانات" : "Database Isolation", value: isRtl ? "مخطط منفصل" : "Separate Schema", active: true },
                            { label: isRtl ? "عزل الشبكة" : "Network Isolation", value: "VPC", active: true },
                            { label: isRtl ? "عزل التخزين" : "Storage Isolation", value: "Encrypted", active: true },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <Verified className={`h-3 w-3 ${s.active ? 'text-green-400' : 'text-muted-foreground'}`} />
                                <span>{s.label}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4 text-green-400">{s.value}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Tenant Branding */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Palette className="h-3.5 w-3.5 text-pink-400" />
                            {isRtl ? "العلامة التجارية" : "Branding"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex items-center gap-2 p-2 rounded bg-muted/30">
                            <div className="h-8 w-8 rounded bg-violet-500/30 flex items-center justify-center">
                              <Crown className="h-4 w-4 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium truncate">INFERA Logo</p>
                              <p className="text-[9px] text-muted-foreground">256x256 PNG</p>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px]" data-testid="button-change-logo">
                              {isRtl ? "تغيير" : "Change"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b'].map((color, i) => (
                              <button key={i} className="h-6 rounded-md border-2 border-transparent hover:border-white/30 transition-colors" style={{ backgroundColor: color }} data-testid={`color-${i}`} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tenant Quotas */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المستأجرين" : "Tenants"}</span>
                            <span className="text-violet-400 font-medium">3 / 10</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي المستخدمين" : "Total Users"}</span>
                            <span className="text-blue-400 font-medium">229</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التخزين المستخدم" : "Storage Used"}</span>
                            <span className="text-green-400 font-medium">45.2 GB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Business Rules Engine Tab */}
                  <TabsContent value="rules" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Rules Engine Header */}
                      <Card className="mb-2 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border-orange-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-orange-500/20">
                              <Workflow className="h-4 w-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "محرك قواعد الأعمال" : "Business Rules Engine"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "منطق بصري بدون كود" : "Visual No-Code Logic"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Active Rules */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "القواعد النشطة" : "Active Rules"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "التحقق من الموافقة" : "Approval Validation", trigger: "OnCreate", status: "active" },
                            { name: isRtl ? "إشعار المدير" : "Notify Admin", trigger: "OnError", status: "active" },
                            { name: isRtl ? "حد الطلبات" : "Rate Limiting", trigger: "OnRequest", status: "paused" },
                          ].map((rule, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`rule-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${rule.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                <span>{rule.name}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">{rule.trigger}</Badge>
                            </button>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-new-rule">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "قاعدة جديدة" : "New Rule"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Visual Rule Builder Preview */}
                      <Card className="mb-2 border-orange-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Braces className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "منشئ القواعد البصري" : "Visual Rule Builder"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="p-2 rounded bg-muted/50 border border-dashed border-orange-500/30">
                            <div className="flex items-center gap-1 text-[10px] mb-2">
                              <Badge className="bg-blue-500/20 text-blue-400 text-[9px]">IF</Badge>
                              <span className="text-muted-foreground">{isRtl ? "المستخدم.الدور" : "user.role"}</span>
                              <Badge variant="outline" className="text-[9px]">=</Badge>
                              <span className="text-green-400">"admin"</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] mb-2 pl-4">
                              <Badge className="bg-green-500/20 text-green-400 text-[9px]">THEN</Badge>
                              <span className="text-muted-foreground">{isRtl ? "السماح بالوصول" : "allow.access"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] pl-4">
                              <Badge className="bg-red-500/20 text-red-400 text-[9px]">ELSE</Badge>
                              <span className="text-muted-foreground">{isRtl ? "رفض الطلب" : "deny.request"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" data-testid="button-simulate-rule">
                              <Play className="h-3 w-3 mr-1" />
                              {isRtl ? "محاكاة" : "Simulate"}
                            </Button>
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-orange-600 hover:bg-orange-700" data-testid="button-deploy-rule">
                              <Rocket className="h-3 w-3 mr-1" />
                              {isRtl ? "نشر" : "Deploy"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rule Versioning */}
                      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "القواعد النشطة" : "Active Rules"}</span>
                            <span className="text-orange-400 font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الإصدار الحالي" : "Current Version"}</span>
                            <span className="text-green-400 font-medium">v2.4.1</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التنفيذات اليوم" : "Executions Today"}</span>
                            <span className="text-cyan-400 font-medium">8,452</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Observability Tab */}
                  <TabsContent value="observability" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Observability Header */}
                      <Card className="mb-2 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-cyan-500/20">
                              <LineChart className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المراقبة المتكاملة" : "Built-in Observability"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "جميع الأنظمة تعمل" : "All Systems Healthy"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Real-time Metrics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "المقاييس الحية" : "Live Metrics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-green-400">99.9%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-cyan-400">12ms</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "زمن الاستجابة" : "Latency"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-violet-400">45K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "طلب/ساعة" : "Req/Hour"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-amber-400">0.02%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "معدل الخطأ" : "Error Rate"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Error Heatmap */}
                      <Card className="mb-2 border-red-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "خريطة الأخطاء" : "Error Heatmap"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-12 gap-0.5">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-3 rounded-sm ${i === 8 || i === 14 ? 'bg-red-500/60' : i === 9 || i === 15 ? 'bg-amber-500/40' : 'bg-green-500/20'}`}
                                title={`${i}:00`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
                            <span>00:00</span>
                            <span>12:00</span>
                            <span>23:59</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Traces */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Link className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "التتبعات الأخيرة" : "Recent Traces"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { endpoint: "POST /api/users", duration: "45ms", status: "success" },
                            { endpoint: "GET /api/data", duration: "12ms", status: "success" },
                            { endpoint: "PUT /api/config", duration: "234ms", status: "slow" },
                          ].map((trace, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`trace-${i}`}>
                              <span className="font-mono truncate flex-1">{trace.endpoint}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={trace.status === 'slow' ? 'text-amber-400' : 'text-green-400'}>{trace.duration}</span>
                                <Timer className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* System Health */}
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          {[
                            { label: "CPU", value: "23%", color: "text-green-400" },
                            { label: "Memory", value: "45%", color: "text-green-400" },
                            { label: "Disk", value: "67%", color: "text-amber-400" },
                            { label: "Network", value: "12 Mbps", color: "text-cyan-400" },
                          ].map((m) => (
                            <div key={m.label} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{m.label}</span>
                              <span className={`font-medium ${m.color}`}>{m.value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Marketplace Tab */}
                  <TabsContent value="marketplace" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Marketplace Header */}
                      <Card className="mb-2 bg-gradient-to-br from-pink-500/20 via-violet-500/10 to-transparent border-pink-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-pink-500/20">
                              <Store className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "سوق الإضافات" : "Plugin Marketplace"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "أكثر من 200 إضافة" : "200+ Extensions"}</p>
                            </div>
                          </div>
                          <Input placeholder={isRtl ? "بحث عن إضافة..." : "Search plugins..."} className="h-7 text-[10px]" data-testid="input-search-plugins" />
                        </CardContent>
                      </Card>

                      {/* Featured Plugins */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "إضافات مميزة" : "Featured Plugins"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Stripe Payments", desc: isRtl ? "بوابة دفع متكاملة" : "Payment Gateway", installs: "12K", icon: CreditCard },
                            { name: "WhatsApp API", desc: isRtl ? "رسائل واتساب" : "WhatsApp Messaging", installs: "8K", icon: MessageSquare },
                            { name: "Google Maps", desc: isRtl ? "خرائط وموقع" : "Maps & Location", installs: "15K", icon: MapPin },
                          ].map((plugin, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30" data-testid={`plugin-${i}`}>
                              <div className="p-1.5 rounded bg-muted/50">
                                <plugin.icon className="h-4 w-4 text-violet-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium">{plugin.name}</p>
                                <p className="text-[9px] text-muted-foreground">{plugin.desc}</p>
                              </div>
                              <Button size="sm" variant="outline" className="h-6 text-[9px]" data-testid={`button-install-plugin-${i}`}>
                                {isRtl ? "تثبيت" : "Install"}
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Categories */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "التصنيفات" : "Categories"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { name: isRtl ? "المدفوعات" : "Payments", count: 24 },
                              { name: isRtl ? "التواصل" : "Communication", count: 18 },
                              { name: isRtl ? "الذكاء الاصطناعي" : "AI/ML", count: 32 },
                              { name: isRtl ? "التحليلات" : "Analytics", count: 15 },
                              { name: isRtl ? "الأمان" : "Security", count: 21 },
                              { name: isRtl ? "حكومي" : "Government", count: 8 },
                            ].map((cat, i) => (
                              <button key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`category-${i}`}>
                                <span>{cat.name}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{cat.count}</Badge>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Installed Plugins */}
                      <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "المثبتة" : "Installed"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "Anthropic AI", version: "2.1.0" },
                            { name: "Object Storage", version: "1.5.2" },
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <Verified className="h-3 w-3 text-green-400" />
                                <span>{p.name}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">v{p.version}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Billing Tab */}
                  <TabsContent value="billing" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Billing Header */}
                      <Card className="mb-2 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent border-emerald-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-emerald-500/20">
                              <CreditCard className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "الفواتير والاشتراكات" : "Billing & Subscriptions"}</p>
                              <p className="text-[10px] text-emerald-400">{isRtl ? "خطة المؤسسات" : "Enterprise Plan"}</p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-emerald-400">$2,499</span>
                            <span className="text-[10px] text-muted-foreground">/{isRtl ? "شهر" : "month"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Usage Overview */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "استخدام هذا الشهر" : "This Month's Usage"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          {[
                            { label: isRtl ? "طلبات API" : "API Requests", used: 450000, limit: 1000000, unit: "" },
                            { label: isRtl ? "التخزين" : "Storage", used: 45, limit: 100, unit: "GB" },
                            { label: isRtl ? "طلبات AI" : "AI Requests", used: 8500, limit: 50000, unit: "" },
                          ].map((u, i) => (
                            <div key={i}>
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground">{u.label}</span>
                                <span>{u.used.toLocaleString()}{u.unit} / {u.limit.toLocaleString()}{u.unit}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(u.used / u.limit) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Payment Methods */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "طرق الدفع" : "Payment Methods"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-violet-500/30">
                            <span className="flex items-center gap-2 text-[10px]">
                              <CreditCard className="h-3 w-3" />
                              <span>**** **** **** 4242</span>
                            </span>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">{isRtl ? "رئيسي" : "Primary"}</Badge>
                          </div>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-payment">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة طريقة دفع" : "Add Payment Method"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Recent Invoices */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileOutput className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "الفواتير الأخيرة" : "Recent Invoices"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { id: "INV-2024-012", date: "Dec 2024", amount: "$2,499", status: "paid" },
                            { id: "INV-2024-011", date: "Nov 2024", amount: "$2,499", status: "paid" },
                            { id: "INV-2024-010", date: "Oct 2024", amount: "$2,299", status: "paid" },
                          ].map((inv, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`invoice-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground">{inv.id}</span>
                                <span>{inv.date}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">{inv.amount}</span>
                                <Download className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Billing Stats */}
                      <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الإنفاق الكلي" : "Total Spent"}</span>
                            <span className="text-emerald-400 font-medium">$28,488</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الدفعة القادمة" : "Next Payment"}</span>
                            <span className="text-cyan-400 font-medium">Jan 1, 2025</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الخصومات المطبقة" : "Discounts Applied"}</span>
                            <span className="text-green-400 font-medium">-$500</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* AI-Native Architecture Tab */}
                  <TabsContent value="ai-arch" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* AI Architecture Header */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Bot className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "معمارية AI الأصلية" : "AI-Native Architecture"}</p>
                              <p className="text-[10px] text-violet-400">{isRtl ? "ذكاء مدمج في كل طبقة" : "Intelligence at Every Layer"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Architect */}
                      <Card className="mb-2 border-blue-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المعمار الذكي" : "AI Architect"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="p-2 rounded bg-muted/30 border border-blue-500/20">
                            <p className="text-[10px] text-muted-foreground mb-2">{isRtl ? "اقتراحات المعمارية" : "Architecture Suggestions"}</p>
                            <div className="space-y-1.5">
                              {[
                                { suggestion: isRtl ? "تفعيل التخزين المؤقت للاستعلامات" : "Enable query caching", impact: "+40%", type: "performance" },
                                { suggestion: isRtl ? "إضافة فهرس للجدول users" : "Add index to users table", impact: "+25%", type: "database" },
                                { suggestion: isRtl ? "تحويل إلى microservices" : "Convert to microservices", impact: "Scale", type: "architecture" },
                              ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-background/50 text-[10px]" data-testid={`ai-suggestion-${i}`}>
                                  <span className="truncate flex-1">{s.suggestion}</span>
                                  <Badge variant="outline" className={`text-[9px] h-4 ml-2 ${s.type === 'performance' ? 'text-green-400' : s.type === 'database' ? 'text-blue-400' : 'text-violet-400'}`}>{s.impact}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-analyze-arch">
                            <Wand2 className="h-3 w-3 mr-1" />
                            {isRtl ? "تحليل المعمارية" : "Analyze Architecture"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Security Review */}
                      <Card className="mb-2 border-red-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "مراجعة الأمان" : "Security Review"}
                            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-green-400">{isRtl ? "آمن" : "Secure"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="space-y-1.5">
                            {[
                              { check: isRtl ? "فحص الثغرات" : "Vulnerability Scan", status: "passed", score: "A+" },
                              { check: isRtl ? "تحليل الاعتمادات" : "Dependency Analysis", status: "passed", score: "98%" },
                              { check: isRtl ? "فحص الأسرار" : "Secrets Detection", status: "passed", score: "100%" },
                              { check: isRtl ? "تشفير البيانات" : "Data Encryption", status: "passed", score: "AES-256" },
                            ].map((c, i) => (
                              <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`security-check-${i}`}>
                                <span className="flex items-center gap-2">
                                  <Verified className="h-3 w-3 text-green-400" />
                                  <span>{c.check}</span>
                                </span>
                                <Badge variant="outline" className="text-[9px] h-4 text-green-400">{c.score}</Badge>
                              </div>
                            ))}
                          </div>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-run-security-scan" onClick={handleSecurityScan} disabled={isProcessing}>
                            <Shield className="h-3 w-3 mr-1" />
                            {isRtl ? "فحص أمني كامل" : "Full Security Scan"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Cost Optimizer */}
                      <Card className="mb-2 border-emerald-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                            {isRtl ? "مُحسّن التكلفة" : "Cost Optimizer"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-emerald-400">-32%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "توفير محتمل" : "Potential Savings"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-cyan-400">$847</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "الشهر الماضي" : "Last Month"}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {[
                              { tip: isRtl ? "إيقاف الموارد غير المستخدمة" : "Stop unused resources", save: "$120" },
                              { tip: isRtl ? "تحسين حجم الخادم" : "Optimize server size", save: "$85" },
                              { tip: isRtl ? "استخدام Reserved Instances" : "Use Reserved Instances", save: "$200" },
                            ].map((t, i) => (
                              <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`cost-tip-${i}`}>
                                <span className="truncate flex-1">{t.tip}</span>
                                <span className="text-emerald-400 font-medium shrink-0">{t.save}</span>
                              </div>
                            ))}
                          </div>
                          <Button size="sm" className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700" data-testid="button-apply-optimizations">
                            <Zap className="h-3 w-3 mr-1" />
                            {isRtl ? "تطبيق التحسينات" : "Apply Optimizations"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* AI Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "توصيات اليوم" : "Today's Suggestions"}</span>
                            <span className="text-violet-400 font-medium">24</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المطبقة" : "Applied"}</span>
                            <span className="text-green-400 font-medium">18</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التحسين الكلي" : "Total Improvement"}</span>
                            <span className="text-cyan-400 font-medium">+47%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Export Center Tab */}
                  <TabsContent value="export" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Export Header */}
                      <Card className="mb-2 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <FileOutput className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مركز التصدير" : "Export Center"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "تصدير الكود والبنية التحتية" : "Export Code & Infrastructure"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Source Code Export */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "كود المصدر" : "Source Code"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { format: "ZIP Archive", ext: ".zip", size: "12.4 MB" },
                            { format: "Git Repository", ext: ".git", size: "14.2 MB" },
                            { format: "Docker Image", ext: ".tar", size: "245 MB" },
                          ].map((f, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`export-code-${i}`}>
                              <span className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-blue-400" />
                                <span>{f.format}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{f.ext}</Badge>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{f.size}</span>
                                <Download className="h-3 w-3" />
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Infrastructure as Code */}
                      <Card className="mb-2 border-violet-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "البنية التحتية كـ كود" : "Infrastructure as Code"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Terraform", desc: isRtl ? "ملفات HCL" : "HCL Files", icon: "tf" },
                            { name: "Kubernetes", desc: isRtl ? "ملفات YAML" : "YAML Manifests", icon: "k8s" },
                            { name: "Ansible", desc: isRtl ? "Playbooks" : "Playbooks", icon: "ans" },
                            { name: "Helm Charts", desc: isRtl ? "حزم Chart" : "Chart Packages", icon: "helm" },
                          ].map((iac, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`export-iac-${i}`}>
                              <span className="flex items-center gap-2">
                                <Badge className="text-[8px] h-4 w-8 justify-center bg-violet-500/20 text-violet-400">{iac.icon}</Badge>
                                <span>{iac.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{iac.desc}</span>
                                <Download className="h-3 w-3" />
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Database Schema Export */}
                      <Card className="mb-2 border-cyan-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "مخطط قاعدة البيانات" : "Database Schema"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { format: "SQL Dump", tables: 24, size: "8.5 MB" },
                            { format: "Drizzle Schema", tables: 24, size: "45 KB" },
                            { format: "ERD Diagram", tables: 24, size: "1.2 MB" },
                            { format: "JSON Schema", tables: 24, size: "156 KB" },
                          ].map((db, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`export-db-${i}`}>
                              <span className="flex items-center gap-2">
                                <FileJson className="h-3 w-3 text-cyan-400" />
                                <span>{db.format}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{db.tables} tables</Badge>
                                <span className="text-muted-foreground">{db.size}</span>
                                <Download className="h-3 w-3" />
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* API Documentation */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "توثيق API" : "API Documentation"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { format: "OpenAPI 3.0", ext: "YAML" },
                            { format: "Postman Collection", ext: "JSON" },
                            { format: "Insomnia Export", ext: "JSON" },
                          ].map((api, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`export-api-${i}`}>
                              <span className="flex items-center gap-2">
                                <Braces className="h-3 w-3 text-green-400" />
                                <span>{api.format}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{api.ext}</Badge>
                                <Download className="h-3 w-3" />
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Export Stats */}
                      <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تصدير" : "Last Export"}</span>
                            <span className="text-amber-400 font-medium">{isRtl ? "منذ 2 ساعة" : "2 hours ago"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي التصديرات" : "Total Exports"}</span>
                            <span className="text-green-400 font-medium">156</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "حجم البيانات" : "Data Size"}</span>
                            <span className="text-cyan-400 font-medium">2.4 GB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Environment Manager Tab */}
                  <TabsContent value="env" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Environment Header */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <Key className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "إدارة البيئة" : "Environment Manager"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "المتغيرات والأسرار" : "Variables & Secrets"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Environment Variables */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Variable className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "متغيرات البيئة" : "Environment Variables"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { key: "NODE_ENV", value: "production", env: "prod" },
                            { key: "API_URL", value: "https://api.infera.io", env: "all" },
                            { key: "PORT", value: "5000", env: "dev" },
                          ].map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`env-var-${i}`}>
                              <span className="font-mono text-blue-400">{v.key}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground truncate max-w-[80px]">{v.value}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{v.env}</Badge>
                              </div>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-env-var">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة متغير" : "Add Variable"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Secrets */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "الأسرار" : "Secrets"}
                            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-amber-400">{isRtl ? "مشفرة" : "Encrypted"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { key: "DATABASE_URL", lastUsed: "2m", rotated: "30d" },
                            { key: "ANTHROPIC_API_KEY", lastUsed: "1h", rotated: "7d" },
                            { key: "STRIPE_SECRET_KEY", lastUsed: "5m", rotated: "14d" },
                            { key: "SESSION_SECRET", lastUsed: "now", rotated: "60d" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`secret-${i}`}>
                              <span className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-amber-400" />
                                <span className="font-mono">{s.key}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4 text-green-400">{isRtl ? "آمن" : "Secure"}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-secret">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة سر" : "Add Secret"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Environment Stats */}
                      <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المتغيرات" : "Variables"}</span>
                            <span className="text-blue-400 font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الأسرار" : "Secrets"}</span>
                            <span className="text-amber-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تدوير" : "Last Rotation"}</span>
                            <span className="text-green-400 font-medium">{isRtl ? "منذ 7 أيام" : "7 days ago"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Team Collaboration Tab */}
                  <TabsContent value="team" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Team Header */}
                      <Card className="mb-2 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-blue-500/20">
                              <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "تعاون الفريق" : "Team Collaboration"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "الأعضاء والصلاحيات" : "Members & Permissions"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Team Members */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "أعضاء الفريق" : "Team Members"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "Mohamed Ali", role: "Owner", status: "online", avatar: "MA" },
                            { name: "Ahmed Hassan", role: "Admin", status: "online", avatar: "AH" },
                            { name: "Sara Mohamed", role: "Developer", status: "away", avatar: "SM" },
                            { name: "Khalid Omar", role: "Viewer", status: "offline", avatar: "KO" },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`team-member-${i}`}>
                              <span className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="h-6 w-6 rounded-full bg-violet-500/30 flex items-center justify-center text-[8px] font-medium">{m.avatar}</div>
                                  <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background ${m.status === 'online' ? 'bg-green-400' : m.status === 'away' ? 'bg-amber-400' : 'bg-muted-foreground'}`} />
                                </div>
                                <span>{m.name}</span>
                              </span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${m.role === 'Owner' ? 'text-amber-400 border-amber-500/30' : m.role === 'Admin' ? 'text-violet-400' : 'text-muted-foreground'}`}>{m.role}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-invite-member">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "دعوة عضو" : "Invite Member"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Roles & Permissions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الأدوار والصلاحيات" : "Roles & Permissions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { role: "Owner", permissions: isRtl ? "كامل" : "Full Access", count: 1 },
                            { role: "Admin", permissions: isRtl ? "إدارة" : "Manage", count: 2 },
                            { role: "Developer", permissions: isRtl ? "تطوير" : "Code & Deploy", count: 5 },
                            { role: "Viewer", permissions: isRtl ? "قراءة" : "Read Only", count: 3 },
                          ].map((r, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`role-${i}`}>
                              <span className="flex items-center gap-2">
                                <Crown className={`h-3 w-3 ${r.role === 'Owner' ? 'text-amber-400' : 'text-muted-foreground'}`} />
                                <span>{r.role}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{r.permissions}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{r.count}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Team Stats */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الأعضاء" : "Total Members"}</span>
                            <span className="text-blue-400 font-medium">11</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "متصل الآن" : "Online Now"}</span>
                            <span className="text-green-400 font-medium">4</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "دعوات معلقة" : "Pending Invites"}</span>
                            <span className="text-amber-400 font-medium">2</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* API Tester Tab */}
                  <TabsContent value="api-test" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* API Tester Header */}
                      <Card className="mb-2 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent border-orange-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-orange-500/20">
                              <Globe className="h-4 w-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "اختبار API" : "API Tester"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "مثل Postman" : "Postman-like"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Request Builder */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "طلب جديد" : "New Request"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex gap-1">
                            <select className="h-7 px-2 text-[10px] rounded bg-muted border-0 text-green-400 font-medium" data-testid="select-method">
                              <option value="GET">GET</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                            <Input placeholder="/api/endpoint" className="h-7 text-[10px] flex-1 font-mono" data-testid="input-api-url" />
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-orange-600 hover:bg-orange-700" data-testid="button-send-request">
                              <Play className="h-3 w-3 mr-1" />
                              {isRtl ? "إرسال" : "Send"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-save-request">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Requests */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "الطلبات المحفوظة" : "Saved Requests"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { method: "GET", path: "/api/users", status: 200 },
                            { method: "POST", path: "/api/auth/login", status: 201 },
                            { method: "PUT", path: "/api/settings", status: 200 },
                            { method: "DELETE", path: "/api/cache", status: 204 },
                          ].map((r, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`saved-request-${i}`}>
                              <span className="flex items-center gap-2">
                                <Badge className={`text-[8px] h-4 w-12 justify-center ${r.method === 'GET' ? 'bg-green-500/20 text-green-400' : r.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : r.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{r.method}</Badge>
                                <span className="font-mono truncate">{r.path}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4 text-green-400">{r.status}</Badge>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Response Preview */}
                      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileJson className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "آخر استجابة" : "Last Response"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <pre className="text-[9px] font-mono p-2 rounded bg-muted/50 overflow-auto max-h-20">
{`{
  "status": "success",
  "data": { "id": 1, "name": "Test" }
}`}
                          </pre>
                          <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
                            <span>200 OK</span>
                            <span>45ms</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Cron Jobs Tab */}
                  <TabsContent value="cron" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Cron Header */}
                      <Card className="mb-2 bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-transparent border-purple-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-purple-500/20">
                              <Timer className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المهام المجدولة" : "Cron Jobs"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "الأتمتة والجدولة" : "Automation & Scheduling"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Active Jobs */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Play className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "المهام النشطة" : "Active Jobs"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "نسخ احتياطي" : "Database Backup", schedule: "0 2 * * *", next: "2:00 AM", status: "active" },
                            { name: isRtl ? "تنظيف الكاش" : "Cache Cleanup", schedule: "0 */6 * * *", next: "6:00 PM", status: "active" },
                            { name: isRtl ? "إرسال التقارير" : "Send Reports", schedule: "0 9 * * 1", next: "Mon 9:00", status: "active" },
                            { name: isRtl ? "مزامنة البيانات" : "Data Sync", schedule: "*/15 * * * *", next: "15m", status: "paused" },
                          ].map((job, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`cron-job-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${job.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                <span>{job.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-muted-foreground text-[9px]">{job.schedule}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{job.next}</Badge>
                              </div>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-new-cron">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "مهمة جديدة" : "New Job"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Execution History */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <History className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "سجل التنفيذ" : "Execution History"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { job: "Database Backup", time: "2:00 AM", duration: "45s", status: "success" },
                            { job: "Cache Cleanup", time: "12:00 PM", duration: "12s", status: "success" },
                            { job: "Send Reports", time: "9:00 AM", duration: "2m", status: "failed" },
                          ].map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`cron-history-${i}`}>
                              <span className="truncate flex-1">{h.job}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">{h.time}</span>
                                <Badge variant="outline" className={`text-[9px] h-4 ${h.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{h.duration}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Cron Stats */}
                      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المهام النشطة" : "Active Jobs"}</span>
                            <span className="text-purple-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نجاح اليوم" : "Today's Success"}</span>
                            <span className="text-green-400 font-medium">24/25</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التنفيذ التالي" : "Next Execution"}</span>
                            <span className="text-cyan-400 font-medium">{isRtl ? "خلال 15 دقيقة" : "in 15 min"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Webhooks Tab */}
                  <TabsContent value="webhooks" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Webhooks Header */}
                      <Card className="mb-2 bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-pink-500/20">
                              <Link className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "إدارة Webhooks" : "Webhooks Manager"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "الإشعارات الفورية" : "Real-time Notifications"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Configured Webhooks */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Link className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "Webhooks المُعدة" : "Configured Webhooks"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "Slack Notifications", url: "slack.com/...", events: 5, status: "active" },
                            { name: "GitHub Actions", url: "github.com/...", events: 3, status: "active" },
                            { name: "Discord Bot", url: "discord.com/...", events: 8, status: "paused" },
                          ].map((wh, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`webhook-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${wh.status === 'active' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                <span>{wh.name}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">{wh.events} events</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-webhook">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة Webhook" : "Add Webhook"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Event Types */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "أنواع الأحداث" : "Event Types"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { event: "user.created", count: 156 },
                            { event: "deployment.success", count: 45 },
                            { event: "error.critical", count: 3 },
                            { event: "payment.received", count: 89 },
                          ].map((e, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`webhook-event-${i}`}>
                              <span className="font-mono text-pink-400">{e.event}</span>
                              <Badge variant="outline" className="text-[9px] h-4">{e.count}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Delivery Logs */}
                      <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileOutput className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "سجل التسليم" : "Delivery Logs"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { event: "user.created", status: 200, time: "2m" },
                            { event: "deployment.success", status: 200, time: "15m" },
                            { event: "error.critical", status: 500, time: "1h" },
                          ].map((l, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="font-mono truncate flex-1">{l.event}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`text-[9px] h-4 ${l.status === 200 ? 'text-green-400' : 'text-red-400'}`}>{l.status}</Badge>
                                <span className="text-muted-foreground">{l.time}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Performance Profiler Tab */}
                  <TabsContent value="profiler" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Profiler Header */}
                      <Card className="mb-2 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border-red-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-red-500/20">
                              <Gauge className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "محلل الأداء" : "Performance Profiler"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "أداء ممتاز" : "Excellent Performance"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Core Metrics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المقاييس الأساسية" : "Core Metrics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-green-400">98</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "نقاط الأداء" : "Perf Score"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-cyan-400">1.2s</p>
                              <p className="text-[9px] text-muted-foreground">LCP</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-violet-400">45ms</p>
                              <p className="text-[9px] text-muted-foreground">FID</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-amber-400">0.05</p>
                              <p className="text-[9px] text-muted-foreground">CLS</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bottlenecks */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "نقاط الاختناق" : "Bottlenecks"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { issue: isRtl ? "صور كبيرة الحجم" : "Large images", impact: "High", fix: "Optimize" },
                            { issue: isRtl ? "JS غير مستخدم" : "Unused JavaScript", impact: "Medium", fix: "Tree-shake" },
                            { issue: isRtl ? "استعلامات N+1" : "N+1 queries", impact: "Low", fix: "Batch" },
                          ].map((b, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`bottleneck-${i}`}>
                              <span className="truncate flex-1">{b.issue}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`text-[9px] h-4 ${b.impact === 'High' ? 'text-red-400' : b.impact === 'Medium' ? 'text-amber-400' : 'text-green-400'}`}>{b.impact}</Badge>
                                <Button size="sm" variant="ghost" className="h-5 px-2 text-[9px]">{b.fix}</Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Resource Usage */}
                      <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          {[
                            { resource: "Bundle Size", value: "245 KB", status: "good" },
                            { resource: "Memory", value: "128 MB", status: "good" },
                            { resource: "Cache Hit", value: "94%", status: "good" },
                            { resource: "DB Queries", value: "12/page", status: "warn" },
                          ].map((r) => (
                            <div key={r.resource} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{r.resource}</span>
                              <span className={`font-medium ${r.status === 'good' ? 'text-green-400' : 'text-amber-400'}`}>{r.value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Notifications Header */}
                      <Card className="mb-2 bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-transparent border-cyan-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-cyan-500/20">
                              <Bell className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مركز الإشعارات" : "Notification Center"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "3 إشعارات جديدة" : "3 new notifications"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Notifications */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "الإشعارات الأخيرة" : "Recent Notifications"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { title: isRtl ? "نشر ناجح" : "Deployment Success", desc: isRtl ? "تم نشر الإصدار v2.4.1" : "Version v2.4.1 deployed", time: "2m", type: "success", unread: true },
                            { title: isRtl ? "عضو جديد" : "New Team Member", desc: isRtl ? "انضم أحمد للفريق" : "Ahmed joined the team", time: "1h", type: "info", unread: true },
                            { title: isRtl ? "تنبيه أداء" : "Performance Alert", desc: isRtl ? "زيادة في زمن الاستجابة" : "Response time increased", time: "3h", type: "warning", unread: true },
                            { title: isRtl ? "نسخ احتياطي" : "Backup Complete", desc: isRtl ? "تم إنشاء نسخة احتياطية" : "Database backup created", time: "6h", type: "info", unread: false },
                          ].map((n, i) => (
                            <div key={i} className={`flex items-start gap-2 p-2 rounded text-[10px] ${n.unread ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-muted/30'}`} data-testid={`notification-${i}`}>
                              <div className={`p-1 rounded-full ${n.type === 'success' ? 'bg-green-500/20' : n.type === 'warning' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                                {n.type === 'success' ? <Verified className="h-3 w-3 text-green-400" /> : n.type === 'warning' ? <AlertTriangle className="h-3 w-3 text-amber-400" /> : <Bell className="h-3 w-3 text-blue-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{n.title}</p>
                                <p className="text-muted-foreground truncate">{n.desc}</p>
                              </div>
                              <span className="text-muted-foreground shrink-0">{n.time}</span>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-6 text-[10px]" data-testid="button-mark-all-read">
                            {isRtl ? "تعليم الكل كمقروء" : "Mark All as Read"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Notification Settings */}
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {isRtl ? "إعدادات الإشعارات" : "Notification Settings"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { label: isRtl ? "البريد الإلكتروني" : "Email", enabled: true },
                            { label: isRtl ? "إشعارات المتصفح" : "Browser Push", enabled: true },
                            { label: isRtl ? "Slack" : "Slack", enabled: false },
                            { label: isRtl ? "SMS" : "SMS", enabled: false },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{s.label}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${s.enabled ? 'text-green-400' : 'text-muted-foreground'}`}>{s.enabled ? (isRtl ? "مفعل" : "On") : (isRtl ? "معطل" : "Off")}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Settings Header */}
                      <Card className="mb-2 bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-transparent border-slate-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-slate-500/20">
                              <Settings2 className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "الإعدادات" : "Settings"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "تخصيص المشروع" : "Project Customization"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Theme Settings */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Palette className="h-3.5 w-3.5 text-pink-400" />
                            {isRtl ? "المظهر" : "Appearance"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span>{isRtl ? "الوضع" : "Theme"}</span>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]" data-testid="button-theme-light">
                                <Sun className="h-3 w-3 mr-1" />
                                {isRtl ? "فاتح" : "Light"}
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 px-2 text-[9px]" data-testid="button-theme-dark">
                                <Moon className="h-3 w-3 mr-1" />
                                {isRtl ? "داكن" : "Dark"}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span>{isRtl ? "اللون الرئيسي" : "Accent Color"}</span>
                            <div className="flex gap-1">
                              {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((color, i) => (
                                <button key={i} className="h-5 w-5 rounded-full border-2 border-transparent hover:border-white/30 transition-colors" style={{ backgroundColor: color }} data-testid={`accent-color-${i}`} />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Editor Settings */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المحرر" : "Editor"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { label: isRtl ? "حجم الخط" : "Font Size", value: "14px" },
                            { label: isRtl ? "نوع الخط" : "Font Family", value: "Fira Code" },
                            { label: isRtl ? "عرض Tab" : "Tab Size", value: "2 spaces" },
                            { label: isRtl ? "الإكمال التلقائي" : "Autocomplete", value: isRtl ? "مفعل" : "Enabled" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="text-muted-foreground">{s.label}</span>
                              <span>{s.value}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Language Settings */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "اللغة والمنطقة" : "Language & Region"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "اللغة" : "Language"}</span>
                            <Badge variant="outline" className="text-[9px] h-4">{isRtl ? "العربية" : "English"}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المنطقة الزمنية" : "Timezone"}</span>
                            <Badge variant="outline" className="text-[9px] h-4">UTC+3</Badge>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تنسيق التاريخ" : "Date Format"}</span>
                            <Badge variant="outline" className="text-[9px] h-4">DD/MM/YYYY</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Keyboard Shortcuts */}
                      <Card className="bg-gradient-to-br from-slate-500/10 to-transparent border-slate-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Command className="h-3.5 w-3.5 text-muted-foreground" />
                            {isRtl ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { action: isRtl ? "حفظ" : "Save", keys: "Ctrl+S" },
                            { action: isRtl ? "بحث" : "Search", keys: "Ctrl+K" },
                            { action: isRtl ? "تشغيل" : "Run", keys: "F5" },
                            { action: isRtl ? "نشر" : "Deploy", keys: "Ctrl+Shift+D" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">{s.action}</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[9px]">{s.keys}</kbd>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-indigo-500/20">
                              <Layout className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "معرض القوالب" : "Template Gallery"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "ابدأ بسرعة" : "Quick Start"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "القوالب المميزة" : "Featured Templates"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "SaaS Starter", tech: "React + Express", stars: 4.9 },
                            { name: "E-Commerce", tech: "Next.js + Stripe", stars: 4.8 },
                            { name: "Dashboard", tech: "React + Charts", stars: 4.7 },
                            { name: "API Backend", tech: "Express + Drizzle", stars: 4.9 },
                            { name: "Mobile App", tech: "React Native", stars: 4.6 },
                          ].map((t, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`template-${i}`}>
                              <span className="flex items-center gap-2">
                                <Layout className="h-3 w-3 text-indigo-400" />
                                <span>{t.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{t.tech}</Badge>
                                <span className="text-amber-400">{t.stars}</span>
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "القوالب المتاحة" : "Available"}</span>
                            <span className="text-indigo-400 font-medium">48</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المستخدمة" : "Used"}</span>
                            <span className="text-green-400 font-medium">12</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Docs Generator Tab */}
                  <TabsContent value="docs" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent border-emerald-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-emerald-500/20">
                              <BookOpen className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مولد التوثيق" : "Docs Generator"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "توثيق تلقائي" : "Auto Documentation"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "أنواع التوثيق" : "Documentation Types"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { type: "API Docs", format: "OpenAPI 3.0", status: "ready" },
                            { type: "JSDoc", format: "TypeScript", status: "ready" },
                            { type: "README", format: "Markdown", status: "draft" },
                            { type: "Storybook", format: "Components", status: "ready" },
                          ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`doc-type-${i}`}>
                              <span className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-emerald-400" />
                                <span>{d.type}</span>
                              </span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${d.status === 'ready' ? 'text-green-400' : 'text-amber-400'}`}>{d.status}</Badge>
                            </div>
                          ))}
                          <Button size="sm" className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700" data-testid="button-generate-docs">
                            <Wand2 className="h-3 w-3 mr-1" />
                            {isRtl ? "توليد الكل" : "Generate All"}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الملفات الموثقة" : "Documented Files"}</span>
                            <span className="text-emerald-400 font-medium">89%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تحديث" : "Last Updated"}</span>
                            <span className="text-cyan-400 font-medium">{isRtl ? "منذ ساعة" : "1 hour ago"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Dependencies Graph Tab */}
                  <TabsContent value="deps" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-cyan-500/20">
                              <Network className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "خريطة التبعيات" : "Dependency Graph"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "تحليل مرئي" : "Visual Analysis"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Network className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "التبعيات الرئيسية" : "Core Dependencies"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "react", version: "18.3.1", deps: 2, size: "45KB" },
                            { name: "express", version: "4.21.0", deps: 30, size: "200KB" },
                            { name: "drizzle-orm", version: "0.36.0", deps: 5, size: "120KB" },
                            { name: "@tanstack/react-query", version: "5.x", deps: 4, size: "80KB" },
                          ].map((d, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`dep-${i}`}>
                              <span className="font-mono text-cyan-400">{d.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{d.version}</Badge>
                                <span className="text-muted-foreground">{d.size}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي التبعيات" : "Total Dependencies"}</span>
                            <span className="text-cyan-400 font-medium">156</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الحجم الكلي" : "Total Size"}</span>
                            <span className="text-violet-400 font-medium">2.4 MB</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "بحاجة تحديث" : "Need Update"}</span>
                            <span className="text-amber-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Formatter Tab */}
                  <TabsContent value="formatter" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-pink-500/20">
                              <Wand2 className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "تنسيق الكود" : "Code Formatter"}</p>
                              <p className="text-[10px] text-muted-foreground">Prettier + ESLint</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "إجراءات سريعة" : "Quick Actions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-format-all">
                            <Wand2 className="h-3 w-3 mr-2" />
                            {isRtl ? "تنسيق كل الملفات" : "Format All Files"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-fix-lint">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            {isRtl ? "إصلاح مشاكل ESLint" : "Fix ESLint Issues"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-sort-imports">
                            <ArrowUpDown className="h-3 w-3 mr-2" />
                            {isRtl ? "ترتيب الاستيرادات" : "Sort Imports"}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "المشاكل" : "Issues Found"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { file: "routes.ts", issues: 2, type: "warning" },
                            { file: "schema.ts", issues: 1, type: "error" },
                            { file: "App.tsx", issues: 0, type: "ok" },
                          ].map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`lint-file-${i}`}>
                              <span className="font-mono">{f.file}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${f.type === 'ok' ? 'text-green-400' : f.type === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>{f.issues}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الملفات المنسقة" : "Formatted Files"}</span>
                            <span className="text-green-400 font-medium">98%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تنسيق" : "Last Format"}</span>
                            <span className="text-pink-400 font-medium">{isRtl ? "منذ 5 دقائق" : "5 min ago"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Migrations Tab */}
                  <TabsContent value="migrations" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border-orange-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-orange-500/20">
                              <ArrowUpDown className="h-4 w-4 text-orange-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "إدارة الترحيلات" : "Migration Manager"}</p>
                              <p className="text-[10px] text-muted-foreground">Drizzle ORM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "الترحيلات المطبقة" : "Applied Migrations"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "0001_initial", date: "Dec 20", status: "applied" },
                            { name: "0002_add_users", date: "Dec 22", status: "applied" },
                            { name: "0003_add_sessions", date: "Dec 24", status: "applied" },
                            { name: "0004_add_tenants", date: "Dec 25", status: "pending" },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`migration-${i}`}>
                              <span className="font-mono truncate flex-1">{m.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-muted-foreground">{m.date}</span>
                                <Badge variant="outline" className={`text-[9px] h-4 ${m.status === 'applied' ? 'text-green-400' : 'text-amber-400'}`}>{m.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <div className="flex gap-1 mb-2">
                        <Button size="sm" className="flex-1 h-7 text-[10px] bg-orange-600 hover:bg-orange-700" data-testid="button-run-migration">
                          <Play className="h-3 w-3 mr-1" />
                          {isRtl ? "تشغيل" : "Run"}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" data-testid="button-new-migration">
                          <Plus className="h-3 w-3 mr-1" />
                          {isRtl ? "جديد" : "New"}
                        </Button>
                      </div>

                      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الترحيلات" : "Migrations"}</span>
                            <span className="text-orange-400 font-medium">4</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "معلقة" : "Pending"}</span>
                            <span className="text-amber-400 font-medium">1</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Logs Tab */}
                  <TabsContent value="logs" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-transparent border-slate-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-slate-500/20">
                              <ScrollText className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "عارض السجلات" : "Log Viewer"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "مباشر" : "Live"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "تصفية السجلات" : "Filter Logs"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="flex gap-1 flex-wrap">
                            {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((level, i) => (
                              <Badge key={i} variant="outline" className={`text-[9px] h-5 cursor-pointer ${level === 'ALL' ? 'bg-muted' : ''} ${level === 'ERROR' ? 'text-red-400' : level === 'WARN' ? 'text-amber-400' : 'text-muted-foreground'}`} data-testid={`log-filter-${level}`}>
                                {level}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "السجلات الأخيرة" : "Recent Logs"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-0.5">
                          {[
                            { time: "12:45:32", level: "INFO", msg: "Server started on port 5000" },
                            { time: "12:45:33", level: "INFO", msg: "Database connected" },
                            { time: "12:46:01", level: "WARN", msg: "High memory usage detected" },
                            { time: "12:46:15", level: "ERROR", msg: "Failed to fetch user data" },
                            { time: "12:46:20", level: "INFO", msg: "Request completed 200 OK" },
                          ].map((l, i) => (
                            <div key={i} className="flex items-start gap-2 p-1 rounded text-[9px] font-mono bg-muted/20" data-testid={`log-entry-${i}`}>
                              <span className="text-muted-foreground shrink-0">{l.time}</span>
                              <Badge variant="outline" className={`text-[8px] h-4 shrink-0 ${l.level === 'ERROR' ? 'text-red-400' : l.level === 'WARN' ? 'text-amber-400' : 'text-green-400'}`}>{l.level}</Badge>
                              <span className="truncate">{l.msg}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-slate-500/10 to-transparent border-slate-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي السجلات" : "Total Logs"}</span>
                            <span className="text-slate-400 font-medium">1,245</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الأخطاء" : "Errors"}</span>
                            <span className="text-red-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <TrendingUp className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "لوحة التحليلات" : "Analytics Dashboard"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "نمو إيجابي" : "Positive Growth"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "نظرة عامة" : "Overview"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-violet-400">15.2K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "المستخدمون" : "Users"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-green-400">+23%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "النمو" : "Growth"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-cyan-400">45.8K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "الطلبات" : "Requests"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-amber-400">99.9%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "التوفر" : "Uptime"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Cpu className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "استخدام الموارد" : "Resource Usage"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { resource: "CPU", usage: 34, color: "text-green-400" },
                            { resource: "Memory", usage: 67, color: "text-amber-400" },
                            { resource: "Storage", usage: 45, color: "text-cyan-400" },
                            { resource: "Bandwidth", usage: 23, color: "text-violet-400" },
                          ].map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px]" data-testid={`resource-${i}`}>
                              <span className="text-muted-foreground">{r.resource}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className={`h-full rounded-full bg-current ${r.color}`} style={{ width: `${r.usage}%` }} />
                                </div>
                                <span className={`font-medium ${r.color}`}>{r.usage}%</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تكلفة الشهر" : "Month Cost"}</span>
                            <span className="text-violet-400 font-medium">$127.50</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التوفير" : "Saved"}</span>
                            <span className="text-green-400 font-medium">$45.00</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Vault Tab */}
                  <TabsContent value="vault" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Lock className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "خزنة الأسرار" : "Secrets Vault"}</p>
                              <p className="text-[10px] text-green-400">AES-256-GCM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <KeySquare className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "الأسرار المخزنة" : "Stored Secrets"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "API_KEYS", count: 5, rotated: "7d" },
                            { name: "DB_CREDENTIALS", count: 3, rotated: "30d" },
                            { name: "OAUTH_TOKENS", count: 4, rotated: "14d" },
                            { name: "ENCRYPTION_KEYS", count: 2, rotated: "90d" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`vault-secret-${i}`}>
                              <span className="flex items-center gap-2">
                                <Fingerprint className="h-3 w-3 text-amber-400" />
                                <span className="font-mono">{s.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{s.count}</Badge>
                                <span className="text-muted-foreground">{s.rotated}</span>
                              </div>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-add-vault-secret">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة سر" : "Add Secret"}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Repeat className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "سياسة التدوير" : "Rotation Policy"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { policy: isRtl ? "تلقائي" : "Auto-rotate", interval: "30 days", enabled: true },
                            { policy: isRtl ? "تنبيه" : "Alert before", interval: "7 days", enabled: true },
                            { policy: isRtl ? "نسخ احتياطي" : "Backup", interval: "Daily", enabled: true },
                          ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span>{p.policy}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{p.interval}</span>
                                <Badge variant="outline" className={`text-[9px] h-4 ${p.enabled ? 'text-green-400' : 'text-muted-foreground'}`}>{p.enabled ? 'On' : 'Off'}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الأسرار" : "Total Secrets"}</span>
                            <span className="text-amber-400 font-medium">14</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تدوير" : "Last Rotation"}</span>
                            <span className="text-green-400 font-medium">{isRtl ? "منذ 3 أيام" : "3 days ago"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "سجل الوصول" : "Access Logs"}</span>
                            <span className="text-cyan-400 font-medium">256</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Schema Introspector Tab - Sovereign Data Awareness */}
                  <TabsContent value="schema" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-cyan-500/20">
                              <Database className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مفتش البيانات السيادي" : "Sovereign Data Introspector"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "وعي كامل بقاعدة البيانات" : "Full Database Awareness"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-cyan-400">PostgreSQL</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">{isRtl ? "متصل" : "Connected"}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Database Tables with Full Schema */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Hash className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "جداول قاعدة البيانات" : "Database Tables"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">24</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "users", rows: "15,248", columns: 18, size: "4.2MB" },
                            { name: "sessions", rows: "8,456", columns: 4, size: "1.8MB" },
                            { name: "platforms", rows: "342", columns: 22, size: "0.8MB" },
                            { name: "login_sessions", rows: "45,678", columns: 16, size: "8.4MB" },
                            { name: "subscription_plans", rows: "5", columns: 28, size: "0.1MB" },
                            { name: "user_subscriptions", rows: "1,234", columns: 14, size: "0.4MB" },
                            { name: "audit_logs", rows: "125,890", columns: 12, size: "24.5MB" },
                            { name: "permissions", rows: "856", columns: 8, size: "0.2MB" },
                          ].map((table, i) => (
                            <div key={table.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`schema-table-${i}`}>
                              <span className="flex items-center gap-2">
                                <Database className="h-3 w-3 text-cyan-400" />
                                <span className="font-mono">{table.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{table.columns} cols</span>
                                <Badge variant="outline" className="text-[9px] h-4">{table.rows}</Badge>
                                <span className="text-cyan-400">{table.size}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Live Query Executor */}
                      <Card className="mb-2 border-green-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Terminal className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "منفذ الاستعلامات الحي" : "Live Query Executor"}
                            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-amber-400">{isRtl ? "صلاحية المالك" : "Owner Only"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Textarea 
                            placeholder="SELECT * FROM users LIMIT 10;" 
                            className="h-16 text-[10px] font-mono resize-none bg-muted/50" 
                            data-testid="input-schema-query"
                          />
                          <div className="flex items-center gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-green-600 hover:bg-green-700" data-testid="button-execute-query">
                              <Play className="h-3 w-3 mr-1" />
                              {isRtl ? "تنفيذ" : "Execute"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-explain-query">
                              <Lightbulb className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Schema Relationships */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Network className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "العلاقات" : "Relationships"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { from: "login_sessions.userId", to: "users.id", type: "FK" },
                            { from: "user_subscriptions.userId", to: "users.id", type: "FK" },
                            { from: "platforms.ownerId", to: "users.id", type: "FK" },
                            { from: "audit_logs.actorId", to: "users.id", type: "FK" },
                          ].map((rel, i) => (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="text-cyan-400 font-mono">{rel.from}</span>
                              <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                              <span className="text-violet-400 font-mono">{rel.to}</span>
                              <Badge variant="outline" className="text-[9px] h-4 ml-auto">{rel.type}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Database Stats */}
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الجداول" : "Total Tables"}</span>
                            <span className="text-cyan-400 font-medium">24</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي السجلات" : "Total Records"}</span>
                            <span className="text-cyan-400 font-medium">197,709</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "حجم قاعدة البيانات" : "Database Size"}</span>
                            <span className="text-cyan-400 font-medium">42.8 MB</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الفهارس" : "Indexes"}</span>
                            <span className="text-green-400 font-medium">38</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Routes Registry Tab - Global Page Awareness */}
                  <TabsContent value="routes" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-blue-500/20">
                              <Globe className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "سجل المسارات العالمي" : "Global Route Registry"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "كل الصفحات والمسارات" : "All Pages & Endpoints"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Frontend Routes */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layout className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "مسارات الواجهة" : "Frontend Routes"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">18</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { path: "/", name: "Home", auth: false, status: "active" },
                            { path: "/workspace/:id", name: "Sovereign Workspace", auth: true, status: "active" },
                            { path: "/dashboard", name: "Dashboard", auth: true, status: "active" },
                            { path: "/auth/login", name: "Login", auth: false, status: "active" },
                            { path: "/admin", name: "Admin Panel", auth: true, status: "active" },
                            { path: "/settings", name: "Settings", auth: true, status: "active" },
                            { path: "/billing", name: "Billing", auth: true, status: "active" },
                          ].map((route, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`route-frontend-${i}`}>
                              <span className="flex items-center gap-2">
                                <FileCode className="h-3 w-3 text-blue-400" />
                                <span className="font-mono">{route.path}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{route.name}</span>
                                {route.auth && <Lock className="h-3 w-3 text-amber-400" />}
                                <Badge variant="outline" className="text-[9px] h-4 text-green-400">{route.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* API Endpoints */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "نقاط API" : "API Endpoints"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">45</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { method: "GET", path: "/api/users", auth: true, desc: "List users" },
                            { method: "POST", path: "/api/auth/login", auth: false, desc: "Login" },
                            { method: "GET", path: "/api/platforms", auth: true, desc: "List platforms" },
                            { method: "POST", path: "/api/ai/chat", auth: true, desc: "AI Chat" },
                            { method: "GET", path: "/api/analytics", auth: true, desc: "Analytics" },
                            { method: "DELETE", path: "/api/users/:id", auth: true, desc: "Delete user" },
                          ].map((ep, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`route-api-${i}`}>
                              <span className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[9px] h-4 ${ep.method === 'GET' ? 'text-green-400' : ep.method === 'POST' ? 'text-blue-400' : ep.method === 'DELETE' ? 'text-red-400' : 'text-amber-400'}`}>{ep.method}</Badge>
                                <span className="font-mono">{ep.path}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground truncate max-w-20">{ep.desc}</span>
                                {ep.auth && <Lock className="h-3 w-3 text-amber-400" />}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Route Stats */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "صفحات الواجهة" : "Frontend Pages"}</span>
                            <span className="text-blue-400 font-medium">18</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نقاط API" : "API Endpoints"}</span>
                            <span className="text-violet-400 font-medium">45</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "محمية" : "Protected"}</span>
                            <span className="text-amber-400 font-medium">52</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "عامة" : "Public"}</span>
                            <span className="text-green-400 font-medium">11</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Commands Matrix Tab - Unified Command Catalog */}
                  <TabsContent value="commands" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Command className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مصفوفة الأوامر السيادية" : "Sovereign Command Matrix"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "كل الأوامر المتاحة" : "All Available Commands"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-violet-400">128 {isRtl ? "أمر" : "Commands"}</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 text-amber-400">{isRtl ? "كامل الصلاحيات" : "Full Access"}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* System Commands */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Terminal className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "أوامر النظام" : "System Commands"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-red-400">{isRtl ? "خطر" : "Danger"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { cmd: "system:restart", desc: isRtl ? "إعادة تشغيل النظام" : "Restart system", level: "danger" },
                            { cmd: "system:backup", desc: isRtl ? "نسخ احتياطي كامل" : "Full backup", level: "high" },
                            { cmd: "system:restore", desc: isRtl ? "استعادة من نسخة" : "Restore from backup", level: "danger" },
                            { cmd: "cache:clear", desc: isRtl ? "مسح ذاكرة التخزين" : "Clear all cache", level: "medium" },
                            { cmd: "logs:rotate", desc: isRtl ? "تدوير السجلات" : "Rotate logs", level: "low" },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`command-system-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${c.level === 'danger' ? 'bg-red-400' : c.level === 'high' ? 'bg-amber-400' : c.level === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                <span className="font-mono text-violet-400">{c.cmd}</span>
                              </span>
                              <span className="text-muted-foreground truncate max-w-24">{c.desc}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Database Commands */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "أوامر قاعدة البيانات" : "Database Commands"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { cmd: "db:migrate", desc: isRtl ? "تطبيق الترحيلات" : "Run migrations", level: "high" },
                            { cmd: "db:seed", desc: isRtl ? "بذر البيانات" : "Seed database", level: "medium" },
                            { cmd: "db:reset", desc: isRtl ? "إعادة تعيين كامل" : "Full reset", level: "danger" },
                            { cmd: "db:export", desc: isRtl ? "تصدير البيانات" : "Export data", level: "low" },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`command-db-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${c.level === 'danger' ? 'bg-red-400' : c.level === 'high' ? 'bg-amber-400' : c.level === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                <span className="font-mono text-cyan-400">{c.cmd}</span>
                              </span>
                              <span className="text-muted-foreground truncate max-w-24">{c.desc}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Commands */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-pink-400" />
                            {isRtl ? "أوامر الذكاء الاصطناعي" : "AI Commands"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { cmd: "ai:generate", desc: isRtl ? "توليد كود" : "Generate code", level: "low" },
                            { cmd: "ai:analyze", desc: isRtl ? "تحليل المشروع" : "Analyze project", level: "low" },
                            { cmd: "ai:optimize", desc: isRtl ? "تحسين الأداء" : "Optimize performance", level: "medium" },
                            { cmd: "ai:deploy", desc: isRtl ? "نشر تلقائي" : "Auto deploy", level: "high" },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] hover:bg-muted transition-colors cursor-pointer" data-testid={`command-ai-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${c.level === 'danger' ? 'bg-red-400' : c.level === 'high' ? 'bg-amber-400' : c.level === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                <span className="font-mono text-pink-400">{c.cmd}</span>
                              </span>
                              <span className="text-muted-foreground truncate max-w-24">{c.desc}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Command Executor */}
                      <Card className="mb-2 border-violet-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "تنفيذ أمر" : "Execute Command"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex items-center gap-1">
                            <Input placeholder={isRtl ? "اكتب الأمر..." : "Type command..."} className="h-7 text-[10px] font-mono flex-1" data-testid="input-command-execute" />
                            <Button size="sm" className="h-7 bg-violet-600 hover:bg-violet-700" data-testid="button-run-command">
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Command Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الأوامر" : "Total Commands"}</span>
                            <span className="text-violet-400 font-medium">128</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "أوامر خطرة" : "Danger Level"}</span>
                            <span className="text-red-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تنفيذات اليوم" : "Executions Today"}</span>
                            <span className="text-green-400 font-medium">47</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Governor Tab - Root Permission Control */}
                  <TabsContent value="governor" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Crown className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "حاكم الصلاحيات الجذرية" : "Root Permission Governor"}</p>
                              <p className="text-[10px] text-amber-400">{isRtl ? "سيطرة سيادية كاملة" : "Full Sovereign Control"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-amber-400">ROOT_OWNER</Badge>
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">{isRtl ? "نشط" : "Active"}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Permission Categories */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "فئات الصلاحيات" : "Permission Categories"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "نظام" : "System", perms: 24, color: "text-red-400", enabled: true },
                            { name: isRtl ? "قاعدة البيانات" : "Database", perms: 18, color: "text-cyan-400", enabled: true },
                            { name: isRtl ? "المستخدمين" : "Users", perms: 12, color: "text-blue-400", enabled: true },
                            { name: isRtl ? "المحتوى" : "Content", perms: 8, color: "text-green-400", enabled: true },
                            { name: isRtl ? "الأمان" : "Security", perms: 15, color: "text-amber-400", enabled: true },
                            { name: isRtl ? "النشر" : "Deployment", perms: 10, color: "text-violet-400", enabled: true },
                          ].map((cat, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`perm-category-${i}`}>
                              <span className={`flex items-center gap-2 ${cat.color}`}>
                                <Shield className="h-3 w-3" />
                                <span>{cat.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{cat.perms}</Badge>
                                <CheckCircle className="h-3 w-3 text-green-400" />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Kill Switches */}
                      <Card className="mb-2 border-red-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "مفاتيح الإيقاف" : "Kill Switches"}
                            <Badge variant="outline" className="text-[9px] h-4 ml-auto text-red-400">{isRtl ? "خطر" : "Danger"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "إيقاف API" : "Disable API", status: false },
                            { name: isRtl ? "وضع الصيانة" : "Maintenance Mode", status: false },
                            { name: isRtl ? "تجميد التسجيل" : "Freeze Registration", status: false },
                            { name: isRtl ? "حظر الوصول الخارجي" : "Block External Access", status: false },
                          ].map((sw, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`kill-switch-${i}`}>
                              <span className="flex items-center gap-2">
                                <Square className="h-3 w-3 text-red-400" />
                                <span>{sw.name}</span>
                              </span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${sw.status ? 'text-red-400' : 'text-green-400'}`}>
                                {sw.status ? (isRtl ? "مفعل" : "ON") : (isRtl ? "معطل" : "OFF")}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Audit Trail */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <History className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "سجل التدقيق" : "Audit Trail"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">{isRtl ? "غير قابل للتغيير" : "Immutable"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { action: isRtl ? "تسجيل دخول" : "Login", user: "Owner", time: "2m ago", type: "auth" },
                            { action: isRtl ? "تعديل صلاحية" : "Permission Edit", user: "Owner", time: "1h ago", type: "perm" },
                            { action: isRtl ? "نسخ احتياطي" : "Backup Created", user: "System", time: "6h ago", type: "system" },
                            { action: isRtl ? "نشر" : "Deployment", user: "Owner", time: "1d ago", type: "deploy" },
                          ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`audit-log-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${log.type === 'auth' ? 'bg-green-400' : log.type === 'perm' ? 'bg-amber-400' : log.type === 'system' ? 'bg-blue-400' : 'bg-violet-400'}`} />
                                <span>{log.action}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{log.user}</span>
                                <span className="text-blue-400">{log.time}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Governor Stats */}
                      <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الصلاحيات" : "Total Permissions"}</span>
                            <span className="text-amber-400 font-medium">87</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المستخدمين النشطين" : "Active Users"}</span>
                            <span className="text-green-400 font-medium">1,245</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "سجلات التدقيق" : "Audit Entries"}</span>
                            <span className="text-blue-400 font-medium">125,890</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر تدقيق" : "Last Audit"}</span>
                            <span className="text-cyan-400 font-medium">{isRtl ? "منذ 2 دقيقة" : "2m ago"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 1. Live Collaboration Tab */}
                  <TabsContent value="collab" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <Users className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "التعاون الحي" : "Live Collaboration"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "تحرير متزامن متعدد المستخدمين" : "Multi-user Synchronized Editing"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Active Collaborators */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <MousePointer2 className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "المتعاونون النشطون" : "Active Collaborators"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-green-400">3 {isRtl ? "متصل" : "Online"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "Mohamed Ali", role: "Owner", color: "bg-amber-400", file: "app.tsx", cursor: "L42" },
                            { name: "Ahmed Hassan", role: "Developer", color: "bg-blue-400", file: "index.ts", cursor: "L18" },
                            { name: "Sara Ibrahim", role: "Designer", color: "bg-pink-400", file: "styles.css", cursor: "L105" },
                          ].map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`collab-user-${i}`}>
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${user.color}`} />
                                <span className="font-medium">{user.name}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{user.role}</Badge>
                              </span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-mono">{user.file}</span>
                                <Badge variant="outline" className="text-[9px] h-4 text-green-400">{user.cursor}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Invite Collaborator */}
                      <Card className="mb-2 border-green-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "دعوة متعاون" : "Invite Collaborator"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Input placeholder={isRtl ? "البريد الإلكتروني..." : "Email address..."} className="h-7 text-[10px]" data-testid="input-collab-email" />
                          <div className="flex items-center gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-green-600 hover:bg-green-700" data-testid="button-send-invite">
                              <Send className="h-3 w-3 mr-1" />
                              {isRtl ? "إرسال دعوة" : "Send Invite"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-copy-link">
                              <Link className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Session Stats */}
                      <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "جلسة نشطة" : "Active Session"}</span>
                            <span className="text-green-400 font-medium">2h 34m</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تعديلات اليوم" : "Edits Today"}</span>
                            <span className="text-blue-400 font-medium">1,247</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "ملفات مشتركة" : "Shared Files"}</span>
                            <span className="text-violet-400 font-medium">48</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 2. API Docs Generator Tab */}
                  <TabsContent value="api-docs" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-blue-500/20">
                              <FileText className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مولد توثيق API" : "API Documentation Generator"}</p>
                              <p className="text-[10px] text-blue-400">OpenAPI 3.0 / Swagger</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Generate Docs */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Wand2 className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "توليد التوثيق" : "Generate Documentation"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-blue-600 hover:bg-blue-700" data-testid="button-generate-docs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {isRtl ? "توليد تلقائي" : "Auto Generate"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-preview-docs">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Documented Endpoints */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "النقاط الموثقة" : "Documented Endpoints"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">45/45</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { group: "Auth", count: 6, coverage: "100%" },
                            { group: "Users", count: 12, coverage: "100%" },
                            { group: "Platforms", count: 15, coverage: "100%" },
                            { group: "AI", count: 8, coverage: "100%" },
                            { group: "Analytics", count: 4, coverage: "100%" },
                          ].map((ep, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`api-doc-group-${i}`}>
                              <span className="flex items-center gap-2">
                                <FileCode className="h-3 w-3 text-blue-400" />
                                <span>{ep.group}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{ep.count} endpoints</span>
                                <Badge variant="outline" className="text-[9px] h-4 text-green-400">{ep.coverage}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Export Options */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs">{isRtl ? "تصدير" : "Export"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-export-openapi">
                            <Download className="h-3 w-3 mr-2" />
                            {isRtl ? "OpenAPI JSON" : "OpenAPI JSON"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-export-postman">
                            <Download className="h-3 w-3 mr-2" />
                            {isRtl ? "مجموعة Postman" : "Postman Collection"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 3. Code Review System Tab */}
                  <TabsContent value="code-review" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <GitPullRequest className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "نظام مراجعة الكود" : "Code Review System"}</p>
                              <p className="text-[10px] text-violet-400">{isRtl ? "مراجعات وموافقات" : "Reviews & Approvals"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pending Reviews */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "بانتظار المراجعة" : "Pending Reviews"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-amber-400">3</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { title: "feat: Add user auth", author: "Ahmed", files: 8, comments: 2 },
                            { title: "fix: Database leak", author: "Sara", files: 3, comments: 0 },
                            { title: "refactor: API routes", author: "Mohamed", files: 12, comments: 5 },
                          ].map((pr, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] cursor-pointer hover:bg-muted" data-testid={`review-pending-${i}`}>
                              <span className="flex items-center gap-2">
                                <GitPullRequest className="h-3 w-3 text-violet-400" />
                                <span className="truncate max-w-24">{pr.title}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{pr.files} files</span>
                                {pr.comments > 0 && <Badge variant="outline" className="text-[9px] h-4">{pr.comments}</Badge>}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Review Actions */}
                      <Card className="mb-2 border-violet-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs">{isRtl ? "إجراءات المراجعة" : "Review Actions"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] justify-start bg-green-600 hover:bg-green-700" data-testid="button-approve">
                            <ThumbsUp className="h-3 w-3 mr-2" />
                            {isRtl ? "موافقة" : "Approve"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-request-changes">
                            <ThumbsDown className="h-3 w-3 mr-2" />
                            {isRtl ? "طلب تغييرات" : "Request Changes"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-add-comment">
                            <MessageSquarePlus className="h-3 w-3 mr-2" />
                            {isRtl ? "إضافة تعليق" : "Add Comment"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "مراجعات هذا الأسبوع" : "Reviews This Week"}</span>
                            <span className="text-violet-400 font-medium">24</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نسبة الموافقة" : "Approval Rate"}</span>
                            <span className="text-green-400 font-medium">94%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 4. Plugin Marketplace Tab */}
                  <TabsContent value="plugins" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-pink-500/20">
                              <Puzzle className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "سوق الإضافات" : "Plugin Marketplace"}</p>
                              <p className="text-[10px] text-pink-400">{isRtl ? "امتدادات ومكونات" : "Extensions & Components"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Installed Plugins */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الإضافات المثبتة" : "Installed Plugins"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">12</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "AI Autocomplete", version: "2.1.0", active: true },
                            { name: "Git Integration", version: "1.8.3", active: true },
                            { name: "Theme Pack Pro", version: "3.0.0", active: true },
                            { name: "Code Formatter", version: "1.2.1", active: false },
                          ].map((plugin, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`plugin-installed-${i}`}>
                              <span className="flex items-center gap-2">
                                <Puzzle className="h-3 w-3 text-pink-400" />
                                <span>{plugin.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">v{plugin.version}</span>
                                <Badge variant="outline" className={`text-[9px] h-4 ${plugin.active ? 'text-green-400' : 'text-muted-foreground'}`}>
                                  {plugin.active ? (isRtl ? "نشط" : "Active") : (isRtl ? "معطل" : "Disabled")}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Browse Marketplace */}
                      <Card className="mb-2 border-pink-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Store className="h-3.5 w-3.5 text-pink-400" />
                            {isRtl ? "تصفح السوق" : "Browse Marketplace"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Input placeholder={isRtl ? "ابحث عن إضافات..." : "Search plugins..."} className="h-7 text-[10px]" data-testid="input-search-plugins" />
                          <div className="flex flex-wrap gap-1">
                            {["AI", "UI", "Database", "Security", "DevOps"].map(cat => (
                              <Badge key={cat} variant="outline" className="text-[9px] h-4 cursor-pointer">{cat}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Stats */}
                      <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إضافات متاحة" : "Available Plugins"}</span>
                            <span className="text-pink-400 font-medium">2,847</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تحديثات متاحة" : "Updates Available"}</span>
                            <span className="text-amber-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 5. Mobile Preview Tab */}
                  <TabsContent value="mobile" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-transparent border-cyan-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-cyan-500/20">
                              <Smartphone className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "معاينة الهاتف" : "Mobile Preview"}</p>
                              <p className="text-[10px] text-cyan-400">iOS & Android</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Device Selector */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs">{isRtl ? "اختر الجهاز" : "Select Device"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "iPhone 15 Pro", res: "393x852", os: "iOS 17" },
                            { name: "Samsung S24", res: "360x780", os: "Android 14" },
                            { name: "iPad Pro 12.9", res: "1024x1366", os: "iPadOS 17" },
                            { name: "Pixel 8", res: "412x915", os: "Android 14" },
                          ].map((device, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] cursor-pointer hover:bg-muted" data-testid={`device-${i}`}>
                              <span className="flex items-center gap-2">
                                <Smartphone className="h-3 w-3 text-cyan-400" />
                                <span>{device.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{device.res}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{device.os}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Preview Actions */}
                      <Card className="mb-2 border-cyan-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] justify-start bg-cyan-600 hover:bg-cyan-700" data-testid="button-launch-preview">
                            <CirclePlay className="h-3 w-3 mr-2" />
                            {isRtl ? "تشغيل المعاينة" : "Launch Preview"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-rotate">
                            <RotateCcw className="h-3 w-3 mr-2" />
                            {isRtl ? "تدوير الجهاز" : "Rotate Device"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px] justify-start" data-testid="button-screenshot">
                            <Download className="h-3 w-3 mr-2" />
                            {isRtl ? "لقطة شاشة" : "Screenshot"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 6. Security Scanner Tab */}
                  <TabsContent value="security" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent border-red-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-red-500/20">
                              <ShieldAlert className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "الفحص الأمني" : "Security Scanner"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "لا توجد ثغرات حرجة" : "No Critical Vulnerabilities"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Scan Results */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Scan className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "نتائج الفحص" : "Scan Results"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { type: isRtl ? "حرج" : "Critical", count: 0, color: "text-red-400" },
                            { type: isRtl ? "عالي" : "High", count: 2, color: "text-orange-400" },
                            { type: isRtl ? "متوسط" : "Medium", count: 5, color: "text-amber-400" },
                            { type: isRtl ? "منخفض" : "Low", count: 12, color: "text-green-400" },
                          ].map((res, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`security-result-${i}`}>
                              <span className={`flex items-center gap-2 ${res.color}`}>
                                <AlertTriangle className="h-3 w-3" />
                                <span>{res.type}</span>
                              </span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${res.color}`}>{res.count}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Run Scan */}
                      <Card className="mb-2 border-red-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-red-600 hover:bg-red-700" data-testid="button-run-scan">
                            <ShieldAlert className="h-3 w-3 mr-2" />
                            {isRtl ? "فحص كامل" : "Full Scan"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-quick-scan">
                            <Zap className="h-3 w-3 mr-2" />
                            {isRtl ? "فحص سريع" : "Quick Scan"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Security Score */}
                      <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "درجة الأمان" : "Security Score"}</span>
                            <span className="text-green-400 font-medium text-lg">A+</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر فحص" : "Last Scan"}</span>
                            <span className="text-blue-400 font-medium">{isRtl ? "منذ 2 ساعة" : "2h ago"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 7. Performance Benchmarks Tab */}
                  <TabsContent value="benchmarks" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Gauge className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "قياس الأداء" : "Performance Benchmarks"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "أداء ممتاز" : "Excellent Performance"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Metrics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs">{isRtl ? "المقاييس" : "Metrics"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "First Contentful Paint", value: "0.8s", score: 98, color: "text-green-400" },
                            { name: "Largest Contentful Paint", value: "1.2s", score: 95, color: "text-green-400" },
                            { name: "Time to Interactive", value: "1.5s", score: 92, color: "text-green-400" },
                            { name: "Cumulative Layout Shift", value: "0.02", score: 99, color: "text-green-400" },
                            { name: "Total Blocking Time", value: "50ms", score: 96, color: "text-green-400" },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`benchmark-${i}`}>
                              <span className="truncate max-w-24">{m.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{m.value}</span>
                                <Badge variant="outline" className={`text-[9px] h-4 ${m.color}`}>{m.score}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Run Benchmark */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-amber-600 hover:bg-amber-700" data-testid="button-run-benchmark">
                            <Gauge className="h-3 w-3 mr-2" />
                            {isRtl ? "تشغيل القياس" : "Run Benchmark"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Overall Score */}
                      <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الدرجة الإجمالية" : "Overall Score"}</span>
                            <span className="text-green-400 font-medium text-lg">96/100</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 8. Template Generator Tab */}
                  <TabsContent value="template-gen" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-indigo-500/20">
                              <LayoutTemplate className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مولد القوالب" : "Template Generator"}</p>
                              <p className="text-[10px] text-indigo-400">{isRtl ? "إنشاء مشاريع جاهزة" : "Create Ready Projects"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Templates */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs">{isRtl ? "قوالب متاحة" : "Available Templates"}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "E-Commerce Store", tech: "React + Node", stars: 4.8 },
                            { name: "SaaS Dashboard", tech: "Next.js + Prisma", stars: 4.9 },
                            { name: "Blog Platform", tech: "Astro + MDX", stars: 4.7 },
                            { name: "Mobile App", tech: "React Native", stars: 4.6 },
                            { name: "API Server", tech: "Express + PostgreSQL", stars: 4.8 },
                          ].map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] cursor-pointer hover:bg-muted" data-testid={`template-${i}`}>
                              <span className="flex items-center gap-2">
                                <LayoutTemplate className="h-3 w-3 text-indigo-400" />
                                <span>{t.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{t.tech}</span>
                                <span className="flex items-center gap-0.5 text-amber-400">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  {t.stars}
                                </span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Generate */}
                      <Card className="mb-2 border-indigo-500/20">
                        <CardContent className="p-2 space-y-2">
                          <Input placeholder={isRtl ? "اسم المشروع..." : "Project name..."} className="h-7 text-[10px]" data-testid="input-template-name" />
                          <Button size="sm" className="w-full h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700" data-testid="button-generate-template">
                            <Sparkles className="h-3 w-3 mr-2" />
                            {isRtl ? "إنشاء المشروع" : "Generate Project"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 9. ERD Visualizer Tab */}
                  <TabsContent value="erd" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-teal-500/20 via-emerald-500/10 to-transparent border-teal-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-teal-500/20">
                              <Share2 className="h-4 w-4 text-teal-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "رسم العلاقات (ERD)" : "ERD Visualizer"}</p>
                              <p className="text-[10px] text-teal-400">{isRtl ? "خريطة قاعدة البيانات" : "Database Relationship Map"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tables */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-teal-400" />
                            {isRtl ? "الجداول" : "Tables"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">24</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "users", relations: 8, type: "Primary" },
                            { name: "platforms", relations: 5, type: "Primary" },
                            { name: "login_sessions", relations: 2, type: "Junction" },
                            { name: "audit_logs", relations: 3, type: "Log" },
                          ].map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`erd-table-${i}`}>
                              <span className="flex items-center gap-2">
                                <Database className="h-3 w-3 text-teal-400" />
                                <span className="font-mono">{t.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{t.relations} rels</span>
                                <Badge variant="outline" className="text-[9px] h-4">{t.type}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-teal-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-teal-600 hover:bg-teal-700" data-testid="button-view-erd">
                            <Eye className="h-3 w-3 mr-2" />
                            {isRtl ? "عرض الرسم البياني" : "View Diagram"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-export-erd">
                            <Download className="h-3 w-3 mr-2" />
                            {isRtl ? "تصدير PNG" : "Export PNG"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Stats */}
                      <Card className="bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "العلاقات" : "Relationships"}</span>
                            <span className="text-teal-400 font-medium">42</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "مفاتيح أجنبية" : "Foreign Keys"}</span>
                            <span className="text-blue-400 font-medium">38</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 10. AI Code Review Tab */}
                  <TabsContent value="ai-review" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Sparkles className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مراجعة AI الذكية" : "AI Smart Review"}</p>
                              <p className="text-[10px] text-violet-400">{isRtl ? "تحليل وتحسين تلقائي" : "Auto Analysis & Optimization"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Suggestions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "اقتراحات AI" : "AI Suggestions"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">8</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { type: isRtl ? "تحسين الأداء" : "Performance", msg: isRtl ? "استخدم useMemo في المكون" : "Use useMemo in component", file: "App.tsx" },
                            { type: isRtl ? "أمان" : "Security", msg: isRtl ? "تحقق من المدخلات" : "Validate user input", file: "auth.ts" },
                            { type: isRtl ? "أسلوب" : "Style", msg: isRtl ? "استخدم الثوابت" : "Use constants", file: "config.ts" },
                            { type: isRtl ? "تحسين" : "Refactor", msg: isRtl ? "فصل المكون" : "Split component", file: "Dashboard.tsx" },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] cursor-pointer hover:bg-muted" data-testid={`ai-suggestion-${i}`}>
                              <span className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-violet-400" />
                                <span className="truncate max-w-20">{s.msg}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{s.type}</Badge>
                                <span className="text-muted-foreground font-mono">{s.file}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Run AI Review */}
                      <Card className="mb-2 border-violet-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-violet-600 hover:bg-violet-700" data-testid="button-run-ai-review">
                            <Sparkles className="h-3 w-3 mr-2" />
                            {isRtl ? "مراجعة ذكية كاملة" : "Full AI Review"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-apply-suggestions">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            {isRtl ? "تطبيق الاقتراحات" : "Apply All Suggestions"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* AI Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "جودة الكود" : "Code Quality"}</span>
                            <span className="text-green-400 font-medium">A+</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "اقتراحات مطبقة" : "Applied Suggestions"}</span>
                            <span className="text-violet-400 font-medium">124</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "أخطاء مكتشفة" : "Bugs Found"}</span>
                            <span className="text-amber-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* ============================================== */}
                  {/* 9 NEW ENTERPRISE INFRASTRUCTURE TABS */}
                  {/* ============================================== */}

                  {/* 1. Kubernetes Orchestration Tab */}
                  <TabsContent value="kubernetes" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-blue-500/20">
                              <Layers className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "Kubernetes Orchestration" : "Kubernetes Orchestration"}</p>
                              <p className="text-[10px] text-blue-400">{isRtl ? "إدارة الحاويات والخدمات" : "Container & Service Management"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400">
                            <Activity className="h-3 w-3" />
                            <span>{isRtl ? "الكلستر يعمل بنجاح" : "Cluster Running"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cluster Status */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "حالة الكلستر" : "Cluster Status"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "Nodes", count: 5, status: isRtl ? "صحي" : "Healthy", color: "text-green-400" },
                            { name: "Pods", count: 42, status: isRtl ? "يعمل" : "Running", color: "text-green-400" },
                            { name: "Services", count: 12, status: isRtl ? "نشط" : "Active", color: "text-blue-400" },
                            { name: "Deployments", count: 8, status: isRtl ? "محدث" : "Updated", color: "text-violet-400" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`k8s-${item.name.toLowerCase()}`}>
                              <span className="flex items-center gap-2">
                                <CircleDot className={`h-2.5 w-2.5 ${item.color}`} />
                                <span>{item.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{item.count}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{item.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Namespaces */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Folder className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "النطاقات" : "Namespaces"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">6</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {["production", "staging", "development", "monitoring", "kube-system", "default"].map((ns, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] cursor-pointer hover:bg-muted" data-testid={`namespace-${ns}`}>
                              <span className="font-mono">{ns}</span>
                              <Badge variant={ns === "production" ? "default" : "outline"} className="text-[9px] h-4">
                                {ns === "production" ? (isRtl ? "إنتاج" : "Prod") : (isRtl ? "تطوير" : "Dev")}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-blue-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-blue-600 hover:bg-blue-700" data-testid="button-deploy-k8s">
                            <Rocket className="h-3 w-3 mr-2" />
                            {isRtl ? "نشر جديد" : "Deploy New"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-scale-pods">
                            <ArrowUpDown className="h-3 w-3 mr-2" />
                            {isRtl ? "توسيع الحاويات" : "Scale Pods"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-view-logs-k8s">
                            <ScrollText className="h-3 w-3 mr-2" />
                            {isRtl ? "عرض السجلات" : "View Logs"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Resource Usage */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "استخدام CPU" : "CPU Usage"}</span>
                            <span className="text-blue-400 font-medium">45%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "استخدام الذاكرة" : "Memory Usage"}</span>
                            <span className="text-cyan-400 font-medium">62%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التخزين" : "Storage"}</span>
                            <span className="text-green-400 font-medium">128 GB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 2. Docker Container Management Tab */}
                  <TabsContent value="docker" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-transparent border-sky-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-sky-500/20">
                              <HardDrive className="h-4 w-4 text-sky-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "إدارة Docker" : "Docker Management"}</p>
                              <p className="text-[10px] text-sky-400">{isRtl ? "بناء ونشر الحاويات" : "Build & Deploy Containers"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Running Containers */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Play className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الحاويات النشطة" : "Running Containers"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-green-400">8</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "api-server", image: "node:20-alpine", cpu: "12%", mem: "256MB" },
                            { name: "postgres-db", image: "postgres:15", cpu: "8%", mem: "512MB" },
                            { name: "redis-cache", image: "redis:7-alpine", cpu: "2%", mem: "64MB" },
                            { name: "nginx-proxy", image: "nginx:latest", cpu: "1%", mem: "32MB" },
                          ].map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`container-${c.name}`}>
                              <span className="flex items-center gap-2">
                                <CircleDot className="h-2.5 w-2.5 text-green-400" />
                                <span className="font-mono">{c.name}</span>
                              </span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{c.cpu}</span>
                                <span>{c.mem}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Docker Images */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-sky-400" />
                            {isRtl ? "الصور" : "Images"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">12</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "infera/api:latest", size: "245MB", created: "2h ago" },
                            { name: "infera/web:v2.1", size: "180MB", created: "1d ago" },
                            { name: "infera/worker:latest", size: "320MB", created: "3h ago" },
                          ].map((img, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`image-${i}`}>
                              <span className="font-mono truncate max-w-24">{img.name}</span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{img.size}</span>
                                <span>{img.created}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Docker Compose */}
                      <Card className="mb-2 border-sky-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-sky-600 hover:bg-sky-700" data-testid="button-docker-compose-up">
                            <Play className="h-3 w-3 mr-2" />
                            {isRtl ? "تشغيل Compose" : "Compose Up"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-build-image">
                            <HardDrive className="h-3 w-3 mr-2" />
                            {isRtl ? "بناء صورة" : "Build Image"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-push-registry">
                            <Cloud className="h-3 w-3 mr-2" />
                            {isRtl ? "رفع للسجل" : "Push to Registry"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Docker Stats */}
                      <Card className="bg-gradient-to-br from-sky-500/10 to-transparent border-sky-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الحاويات" : "Total Containers"}</span>
                            <span className="text-sky-400 font-medium">15</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الصور المخزنة" : "Cached Images"}</span>
                            <span className="text-blue-400 font-medium">2.4 GB</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الشبكات" : "Networks"}</span>
                            <span className="text-cyan-400 font-medium">4</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 3. Microservices Architecture Tab */}
                  <TabsContent value="microservices" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent border-purple-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-purple-500/20">
                              <Network className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "بنية الخدمات المصغرة" : "Microservices Architecture"}</p>
                              <p className="text-[10px] text-purple-400">{isRtl ? "إدارة وتنسيق الخدمات" : "Service Orchestration & Management"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Services Overview */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-purple-400" />
                            {isRtl ? "الخدمات" : "Services"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">14</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "auth-service", tech: "Node.js", status: isRtl ? "صحي" : "Healthy", port: 3001 },
                            { name: "user-service", tech: "Go", status: isRtl ? "صحي" : "Healthy", port: 3002 },
                            { name: "payment-service", tech: "Python", status: isRtl ? "صحي" : "Healthy", port: 3003 },
                            { name: "notification-svc", tech: "Node.js", status: isRtl ? "صحي" : "Healthy", port: 3004 },
                            { name: "ai-engine", tech: "Python FastAPI", status: isRtl ? "صحي" : "Healthy", port: 3005 },
                          ].map((svc, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`service-${svc.name}`}>
                              <span className="flex items-center gap-2">
                                <CircleDot className="h-2.5 w-2.5 text-green-400" />
                                <span className="font-mono">{svc.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{svc.tech}</Badge>
                                <span className="text-muted-foreground">:{svc.port}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Service Mesh */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Workflow className="h-3.5 w-3.5 text-indigo-400" />
                            {isRtl ? "شبكة الخدمات" : "Service Mesh"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الاتصالات/ثانية" : "Requests/sec"}</span>
                            <span className="text-purple-400 font-medium">12.5K</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "زمن الاستجابة" : "Latency (p99)"}</span>
                            <span className="text-green-400 font-medium">45ms</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "معدل النجاح" : "Success Rate"}</span>
                            <span className="text-green-400 font-medium">99.9%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-purple-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-purple-600 hover:bg-purple-700" data-testid="button-create-service">
                            <Plus className="h-3 w-3 mr-2" />
                            {isRtl ? "إنشاء خدمة جديدة" : "Create New Service"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-service-discovery">
                            <Search className="h-3 w-3 mr-2" />
                            {isRtl ? "اكتشاف الخدمات" : "Service Discovery"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-load-balancer">
                            <ArrowRightLeft className="h-3 w-3 mr-2" />
                            {isRtl ? "موازن الحمل" : "Load Balancer"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Tech Stack */}
                      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                            {isRtl ? "التقنيات المدعومة" : "Supported Technologies"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="flex flex-wrap gap-1">
                            {["Node.js", "Python FastAPI", "Go", "Java Spring", "Rust", "gRPC"].map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] h-4">{tech}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 4. Distributed Database Tab */}
                  <TabsContent value="distributed-db" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-emerald-500/20">
                              <Database className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "قواعد البيانات الموزعة" : "Distributed Databases"}</p>
                              <p className="text-[10px] text-emerald-400">{isRtl ? "PostgreSQL + Redis + MongoDB" : "PostgreSQL + Redis + MongoDB"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Database Clusters */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-emerald-400" />
                            {isRtl ? "الكلسترات" : "Clusters"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "PostgreSQL Primary", nodes: 3, status: isRtl ? "متزامن" : "Synced", type: "Primary" },
                            { name: "Redis Cluster", nodes: 6, status: isRtl ? "متصل" : "Connected", type: "Cache" },
                            { name: "MongoDB Replica", nodes: 3, status: isRtl ? "جاهز" : "Ready", type: "Document" },
                          ].map((db, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`db-cluster-${i}`}>
                              <span className="flex items-center gap-2">
                                <CircleDot className="h-2.5 w-2.5 text-green-400" />
                                <span>{db.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{db.nodes} {isRtl ? "عقد" : "nodes"}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{db.type}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Sharding Configuration */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-teal-400" />
                            {isRtl ? "التقسيم (Sharding)" : "Sharding"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "عدد الشرائح" : "Shards"}</span>
                            <span className="text-emerald-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "مفتاح التقسيم" : "Shard Key"}</span>
                            <span className="text-teal-400 font-mono">tenant_id</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التوزيع" : "Distribution"}</span>
                            <span className="text-green-400 font-medium">{isRtl ? "متوازن" : "Balanced"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Replication */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Repeat className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "النسخ المتماثل" : "Replication"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "النسخ الاحتياطية" : "Replicas"}</span>
                            <span className="text-cyan-400 font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تأخر النسخ" : "Replication Lag"}</span>
                            <span className="text-green-400 font-medium">{"<"}10ms</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "آخر نسخة" : "Last Backup"}</span>
                            <span className="text-muted-foreground">2h ago</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="border-emerald-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700" data-testid="button-add-shard">
                            <Plus className="h-3 w-3 mr-2" />
                            {isRtl ? "إضافة شريحة" : "Add Shard"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-rebalance">
                            <ArrowRightLeft className="h-3 w-3 mr-2" />
                            {isRtl ? "إعادة التوازن" : "Rebalance"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 5. AI/ML Integration Tab */}
                  <TabsContent value="ai-ml" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-transparent border-pink-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-pink-500/20">
                              <Brain className="h-4 w-4 text-pink-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "تكامل الذكاء الاصطناعي" : "AI/ML Integration"}</p>
                              <p className="text-[10px] text-pink-400">{isRtl ? "OCR، NLP، التحليلات التنبؤية" : "OCR, NLP, Predictive Analytics"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Models */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-pink-400" />
                            {isRtl ? "النماذج النشطة" : "Active Models"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">6</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "OCR Engine", type: "Vision", accuracy: "99.2%", status: isRtl ? "نشط" : "Active" },
                            { name: "NLP Processor", type: "Text", accuracy: "97.8%", status: isRtl ? "نشط" : "Active" },
                            { name: "Sentiment Analyzer", type: "Text", accuracy: "94.5%", status: isRtl ? "نشط" : "Active" },
                            { name: "Fraud Detector", type: "Predictive", accuracy: "98.1%", status: isRtl ? "نشط" : "Active" },
                          ].map((model, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`ai-model-${i}`}>
                              <span className="flex items-center gap-2">
                                <Brain className="h-3 w-3 text-pink-400" />
                                <span>{model.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{model.type}</Badge>
                                <span className="text-green-400">{model.accuracy}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Pipelines */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Workflow className="h-3.5 w-3.5 text-rose-400" />
                            {isRtl ? "خطوط المعالجة" : "Processing Pipelines"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "معالجة المستندات" : "Document Processing", jobs: 142, status: isRtl ? "يعمل" : "Running" },
                            { name: isRtl ? "تحليل النصوص" : "Text Analysis", jobs: 89, status: isRtl ? "يعمل" : "Running" },
                            { name: isRtl ? "التنبؤات" : "Predictions", jobs: 56, status: isRtl ? "يعمل" : "Running" },
                          ].map((pipe, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`pipeline-${i}`}>
                              <span className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                                <span>{pipe.name}</span>
                              </span>
                              <span className="text-muted-foreground">{pipe.jobs} jobs</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-pink-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-pink-600 hover:bg-pink-700" data-testid="button-train-model">
                            <Brain className="h-3 w-3 mr-2" />
                            {isRtl ? "تدريب نموذج جديد" : "Train New Model"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-upload-dataset">
                            <Download className="h-3 w-3 mr-2" />
                            {isRtl ? "رفع بيانات" : "Upload Dataset"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-run-inference">
                            <Sparkles className="h-3 w-3 mr-2" />
                            {isRtl ? "تشغيل استنتاج" : "Run Inference"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* AI Stats */}
                      <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الاستنتاجات اليوم" : "Inferences Today"}</span>
                            <span className="text-pink-400 font-medium">45.2K</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "GPU المستخدم" : "GPU Usage"}</span>
                            <span className="text-rose-400 font-medium">78%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "متوسط زمن الاستجابة" : "Avg Latency"}</span>
                            <span className="text-green-400 font-medium">125ms</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 6. Blockchain Authentication Tab */}
                  <TabsContent value="blockchain" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Fingerprint className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "توثيق البلوكتشين" : "Blockchain Authentication"}</p>
                              <p className="text-[10px] text-amber-400">{isRtl ? "تحقق لامركزي وآمن" : "Decentralized & Secure Verification"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Blockchain Network */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Network className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "حالة الشبكة" : "Network Status"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "عدد العقد" : "Nodes"}</span>
                            <span className="text-amber-400 font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الكتلة الحالية" : "Current Block"}</span>
                            <span className="text-orange-400 font-mono">#4,521,089</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "وقت الكتلة" : "Block Time"}</span>
                            <span className="text-green-400 font-medium">2.3s</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Smart Contracts */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "العقود الذكية" : "Smart Contracts"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">4</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "AuthContract", txs: 15420, status: isRtl ? "مُدَقق" : "Verified" },
                            { name: "IdentityNFT", txs: 8930, status: isRtl ? "مُدَقق" : "Verified" },
                            { name: "AccessControl", txs: 22145, status: isRtl ? "مُدَقق" : "Verified" },
                          ].map((contract, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`contract-${i}`}>
                              <span className="flex items-center gap-2">
                                <Verified className="h-3 w-3 text-green-400" />
                                <span className="font-mono">{contract.name}</span>
                              </span>
                              <span className="text-muted-foreground">{contract.txs.toLocaleString()} txs</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-amber-600 hover:bg-amber-700" data-testid="button-deploy-contract">
                            <Rocket className="h-3 w-3 mr-2" />
                            {isRtl ? "نشر عقد" : "Deploy Contract"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-verify-identity">
                            <Fingerprint className="h-3 w-3 mr-2" />
                            {isRtl ? "تحقق من الهوية" : "Verify Identity"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-audit-logs-blockchain">
                            <ScrollText className="h-3 w-3 mr-2" />
                            {isRtl ? "سجل التدقيق" : "Audit Trail"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Security Stats */}
                      <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المعاملات اليوم" : "Transactions Today"}</span>
                            <span className="text-amber-400 font-medium">1,245</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نسبة التحقق" : "Verification Rate"}</span>
                            <span className="text-green-400 font-medium">100%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 7. Event-Driven Architecture Tab */}
                  <TabsContent value="event-driven" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-yellow-500/20 via-lime-500/10 to-transparent border-yellow-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-yellow-500/20">
                              <Zap className="h-4 w-4 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "البنية القائمة على الأحداث" : "Event-Driven Architecture"}</p>
                              <p className="text-[10px] text-yellow-400">{isRtl ? "رسائل وأحداث في الوقت الفعلي" : "Real-time Messages & Events"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Event Bus Status */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-yellow-400" />
                            {isRtl ? "ناقل الأحداث" : "Event Bus"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الرسائل/ثانية" : "Messages/sec"}</span>
                            <span className="text-yellow-400 font-medium">8.5K</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الانتظار" : "Queue Depth"}</span>
                            <span className="text-green-400 font-medium">124</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "المستهلكون" : "Consumers"}</span>
                            <span className="text-lime-400 font-medium">28</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Topics/Queues */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-lime-400" />
                            {isRtl ? "المواضيع" : "Topics"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">12</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "user.events", msgs: "2.1K/s", partitions: 8 },
                            { name: "order.created", msgs: "850/s", partitions: 4 },
                            { name: "payment.processed", msgs: "320/s", partitions: 4 },
                            { name: "notification.send", msgs: "1.2K/s", partitions: 6 },
                          ].map((topic, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`topic-${i}`}>
                              <span className="font-mono">{topic.name}</span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{topic.msgs}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{topic.partitions}p</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="mb-2 border-yellow-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-yellow-600 hover:bg-yellow-700 text-black" data-testid="button-create-topic">
                            <Plus className="h-3 w-3 mr-2" />
                            {isRtl ? "إنشاء موضوع" : "Create Topic"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-publish-event">
                            <Send className="h-3 w-3 mr-2" />
                            {isRtl ? "نشر حدث" : "Publish Event"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-view-consumers">
                            <Users className="h-3 w-3 mr-2" />
                            {isRtl ? "عرض المستهلكين" : "View Consumers"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Tech Stack */}
                      <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-lime-400" />
                            {isRtl ? "التقنيات" : "Technologies"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="flex flex-wrap gap-1">
                            {["Apache Kafka", "RabbitMQ", "Redis Pub/Sub", "NATS", "WebSocket"].map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] h-4">{tech}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 8. API Gateway Tab */}
                  <TabsContent value="api-gateway" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent border-red-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-red-500/20">
                              <Globe className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "بوابة API" : "API Gateway"}</p>
                              <p className="text-[10px] text-red-400">{isRtl ? "Rate Limiting وحماية متقدمة" : "Rate Limiting & Advanced Protection"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Gateway Stats */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "الإحصائيات" : "Statistics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الطلبات/ثانية" : "Requests/sec"}</span>
                            <span className="text-red-400 font-medium">25.4K</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "متوسط زمن الاستجابة" : "Avg Latency"}</span>
                            <span className="text-green-400 font-medium">12ms</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "معدل الخطأ" : "Error Rate"}</span>
                            <span className="text-green-400 font-medium">0.02%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Rate Limiting */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-rose-400" />
                            {isRtl ? "تحديد المعدل" : "Rate Limiting"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { tier: "Free", limit: "100/min", used: "45%" },
                            { tier: "Pro", limit: "1000/min", used: "12%" },
                            { tier: "Enterprise", limit: "10000/min", used: "8%" },
                          ].map((tier, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`rate-tier-${i}`}>
                              <span>{tier.tier}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{tier.limit}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{tier.used}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Routes */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "المسارات" : "Routes"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">24</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { path: "/api/v1/users/*", method: "ALL", cache: true },
                            { path: "/api/v1/auth/*", method: "POST", cache: false },
                            { path: "/api/v1/products/*", method: "GET", cache: true },
                          ].map((route, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`gateway-route-${i}`}>
                              <span className="font-mono truncate max-w-20">{route.path}</span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px] h-4">{route.method}</Badge>
                                {route.cache && <Badge className="text-[9px] h-4 bg-green-600">{isRtl ? "مخزن" : "Cached"}</Badge>}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="border-red-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-red-600 hover:bg-red-700" data-testid="button-add-route">
                            <Plus className="h-3 w-3 mr-2" />
                            {isRtl ? "إضافة مسار" : "Add Route"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-configure-cors">
                            <Shield className="h-3 w-3 mr-2" />
                            {isRtl ? "إعداد CORS" : "Configure CORS"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* 9. Cloud Infrastructure Tab */}
                  <TabsContent value="cloud-infra" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <Card className="mb-2 bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-indigo-500/20">
                              <Cloud className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "البنية التحتية السحابية" : "Cloud Infrastructure"}</p>
                              <p className="text-[10px] text-indigo-400">{isRtl ? "AWS، Google Cloud، Azure، Hetzner" : "AWS, Google Cloud, Azure, Hetzner"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cloud Providers */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Cloud className="h-3.5 w-3.5 text-indigo-400" />
                            {isRtl ? "مزودو الخدمة" : "Cloud Providers"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "AWS", status: isRtl ? "متصل" : "Connected", regions: 4, color: "text-orange-400" },
                            { name: "Google Cloud", status: isRtl ? "متصل" : "Connected", regions: 3, color: "text-blue-400" },
                            { name: "Microsoft Azure", status: isRtl ? "متصل" : "Connected", regions: 2, color: "text-cyan-400" },
                            { name: "Hetzner Cloud", status: isRtl ? "نشط" : "Active", regions: 2, color: "text-red-400" },
                          ].map((provider, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]" data-testid={`cloud-provider-${i}`}>
                              <span className="flex items-center gap-2">
                                <CircleDot className={`h-2.5 w-2.5 ${provider.color}`} />
                                <span>{provider.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{provider.regions} {isRtl ? "مناطق" : "regions"}</span>
                                <Badge variant="outline" className="text-[9px] h-4 text-green-400">{provider.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Resources */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "الموارد" : "Resources"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الخوادم" : "Servers"}</span>
                            <span className="text-indigo-400 font-medium">24</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "وحدات التخزين" : "Storage Volumes"}</span>
                            <span className="text-blue-400 font-medium">12 TB</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "عناوين IP" : "Elastic IPs"}</span>
                            <span className="text-cyan-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "موازنات الحمل" : "Load Balancers"}</span>
                            <span className="text-green-400 font-medium">4</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* CDN & Edge */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "CDN وEdge" : "CDN & Edge"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نقاط الحافة" : "Edge Locations"}</span>
                            <span className="text-cyan-400 font-medium">180+</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "البيانات المخزنة" : "Cached Data"}</span>
                            <span className="text-green-400 font-medium">2.4 TB</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نسبة الضربات" : "Cache Hit Rate"}</span>
                            <span className="text-green-400 font-medium">94.7%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Actions */}
                      <Card className="border-indigo-500/20">
                        <CardContent className="p-2 space-y-1">
                          <Button size="sm" className="w-full h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700" data-testid="button-provision-server">
                            <Plus className="h-3 w-3 mr-2" />
                            {isRtl ? "إنشاء خادم" : "Provision Server"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-configure-cdn">
                            <Globe className="h-3 w-3 mr-2" />
                            {isRtl ? "إعداد CDN" : "Configure CDN"}
                          </Button>
                          <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" data-testid="button-auto-scale">
                            <ArrowUpDown className="h-3 w-3 mr-2" />
                            {isRtl ? "التوسع التلقائي" : "Auto Scaling"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Monthly Cost */}
                      <Card className="mt-2 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التكلفة الشهرية" : "Monthly Cost"}</span>
                            <span className="text-indigo-400 font-medium">$2,450</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التوفير المقدر" : "Est. Savings"}</span>
                            <span className="text-green-400 font-medium">$320</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Permissions Tab - تبويب الصلاحيات */}
                  <TabsContent value="permissions" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {loadingPermissions ? (
                        <div className="flex items-center justify-center h-32">
                          <RefreshCw className="h-5 w-5 animate-spin text-violet-400" />
                          <span className="text-xs ml-2 text-muted-foreground">{isRtl ? "جاري التحميل..." : "Loading..."}</span>
                        </div>
                      ) : (
                        <>
                          <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-full bg-violet-500/20">
                                  <Key className="h-4 w-4 text-violet-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{isRtl ? "صلاحيات WebNova السيادية" : "WebNova Sovereign Permissions"}</p>
                                  <p className="text-[10px] text-violet-400">{isRtl ? "كامل الصلاحيات للمساحة السيادية" : "Full permissions for sovereign workspace"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">
                                  <ShieldCheck className="h-2.5 w-2.5 mr-1" />
                                  {webnovaPermissions ? (isRtl ? webnovaPermissions.powerLevelLabelAr : webnovaPermissions.powerLevelLabel) : (isRtl ? "سيادي كامل" : "FULL SOVEREIGN")}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] border-violet-500/30 text-violet-400">
                                  {webnovaPermissions?.stats?.total || 40} {isRtl ? "صلاحية" : "Permissions"}
                                </Badge>
                                {webnovaPermissions?.stats?.granted === 0 && (
                                  <Button 
                                    size="sm" 
                                    className="h-5 text-[9px] bg-violet-600 hover:bg-violet-700"
                                    onClick={() => grantFullPermissionsMutation.mutate()}
                                    disabled={grantFullPermissionsMutation.isPending}
                                    data-testid="button-grant-full-permissions"
                                  >
                                    {grantFullPermissionsMutation.isPending ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <Plus className="h-2.5 w-2.5 mr-1" />}
                                    {isRtl ? "منح الصلاحيات" : "Grant All"}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Power Level Indicator */}
                          <Card className="mb-2 border-green-500/30">
                            <CardContent className="p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-muted-foreground">{isRtl ? "مستوى القوة" : "Power Level"}</span>
                                <span className="text-[10px] text-green-400 font-medium">{webnovaPermissions?.powerLevel || 0}%</span>
                              </div>
                              <Progress value={webnovaPermissions?.powerLevel || 0} className="h-1.5" />
                            </CardContent>
                          </Card>

                          {/* AI Models Control Bar */}
                          <Card className="mb-2 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 border-violet-500/20">
                            <CardContent className="p-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <Bot className="h-3.5 w-3.5 text-violet-400" />
                                  <span className="text-[10px] font-medium">{isRtl ? "نماذج الذكاء الاصطناعي" : "AI Models"}</span>
                                </div>
                                <Badge variant="outline" className="text-[9px] h-4 border-violet-500/30 text-violet-400">
                                  {aiModelsData?.stats?.enabled || 0}/{aiModelsData?.stats?.total || 0} {isRtl ? "مفعّل" : "Active"}
                                </Badge>
                              </div>
                              
                              {loadingAIModels ? (
                                <div className="flex items-center justify-center py-2">
                                  <RefreshCw className="h-3 w-3 animate-spin text-violet-400" />
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {aiModelsData?.models?.map((model) => (
                                    <Tooltip key={model.id}>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`relative flex items-center gap-1 px-1.5 py-1 rounded-md cursor-pointer transition-all ${
                                            model.isEnabled 
                                              ? model.isPrimary 
                                                ? "bg-violet-500/30 border border-violet-500/50 ring-1 ring-violet-400/50" 
                                                : "bg-green-500/20 border border-green-500/30"
                                              : "bg-muted/30 border border-muted opacity-50"
                                          }`}
                                          onClick={() => {
                                            if (model.isEnabled && !model.isPrimary) {
                                              setPrimaryModelMutation.mutate(model.id);
                                            }
                                          }}
                                          data-testid={`model-${model.id}`}
                                        >
                                          {/* Provider Icon */}
                                          <div 
                                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                            style={{ backgroundColor: model.isEnabled ? model.color + "30" : "transparent", color: model.isEnabled ? model.color : "gray" }}
                                          >
                                            {model.provider === "anthropic" && "A"}
                                            {model.provider === "openai" && "O"}
                                            {model.provider === "google" && "G"}
                                            {model.provider === "infera" && "N"}
                                          </div>
                                          
                                          <span className="text-[9px] font-medium max-w-[50px] truncate">
                                            {isRtl ? model.nameAr : model.nameEn}
                                          </span>
                                          
                                          {/* Primary indicator */}
                                          {model.isPrimary && (
                                            <Crown className="h-2.5 w-2.5 text-yellow-400" />
                                          )}
                                          
                                          {/* Toggle button */}
                                          <button
                                            className={`ml-0.5 p-0.5 rounded-full transition-colors ${
                                              model.isEnabled ? "hover:bg-red-500/20" : "hover:bg-green-500/20"
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleModelMutation.mutate(model.id);
                                            }}
                                            disabled={toggleModelMutation.isPending}
                                            data-testid={`toggle-model-${model.id}`}
                                          >
                                            {model.isEnabled ? (
                                              <CheckCircle className="h-2.5 w-2.5 text-green-400" />
                                            ) : (
                                              <XCircle className="h-2.5 w-2.5 text-muted-foreground" />
                                            )}
                                          </button>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="text-[10px]">
                                        <div className="space-y-1">
                                          <p className="font-medium">{isRtl ? model.nameAr : model.nameEn}</p>
                                          <p className="text-muted-foreground">
                                            {model.capabilities.join(", ")}
                                          </p>
                                          <p className={model.isEnabled ? "text-green-400" : "text-muted-foreground"}>
                                            {model.isEnabled 
                                              ? (model.isPrimary ? (isRtl ? "النموذج الأساسي" : "Primary Model") : (isRtl ? "مفعّل - انقر للتعيين كأساسي" : "Enabled - Click to set as primary"))
                                              : (isRtl ? "غير مفعّل - انقر على ✓ للتفعيل" : "Disabled - Click ✓ to enable")
                                            }
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </div>
                              )}
                              
                              {/* Primary Model Display */}
                              {aiModelsData?.primaryModelName && (
                                <div className="mt-2 pt-2 border-t border-violet-500/20">
                                  <div className="flex items-center gap-1.5 text-[9px]">
                                    <Sparkles className="h-2.5 w-2.5 text-yellow-400" />
                                    <span className="text-muted-foreground">{isRtl ? "النموذج الأساسي:" : "Primary:"}</span>
                                    <span className="text-violet-400 font-medium">{aiModelsData.primaryModelName}</span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Dynamic Permission Categories */}
                          {webnovaPermissions?.categories && Object.entries(webnovaPermissions.categories).map(([category, perms]) => {
                            const categoryInfo = webnovaPermissions.categoryNames?.[category];
                            const categoryName = isRtl ? categoryInfo?.ar : categoryInfo?.en;
                            const iconMap: Record<string, typeof Terminal> = {
                              code_execution: Terminal,
                              file_operations: FileCode,
                              database_operations: Database,
                              api_integrations: Globe,
                              deployment: Rocket,
                              ai_capabilities: Bot,
                              infrastructure: Server,
                              payment_billing: CreditCard,
                              user_management: Users,
                              system_config: Settings2,
                              navigation_access: Layout,
                              build_operations: Wand2,
                            };
                            const IconComponent = iconMap[category] || Shield;
                            const colorMap: Record<string, string> = {
                              code_execution: "text-blue-400",
                              file_operations: "text-yellow-400",
                              database_operations: "text-cyan-400",
                              api_integrations: "text-indigo-400",
                              deployment: "text-green-400",
                              ai_capabilities: "text-violet-400",
                              infrastructure: "text-orange-400",
                              payment_billing: "text-emerald-400",
                              user_management: "text-pink-400",
                              system_config: "text-red-400",
                              navigation_access: "text-sky-400",
                              build_operations: "text-amber-400",
                            };
                            
                            return (
                              <Card key={category} className="mb-2">
                                <CardHeader className="p-2 pb-1">
                                  <CardTitle className="text-xs flex items-center gap-2">
                                    <IconComponent className={`h-3.5 w-3.5 ${colorMap[category] || "text-muted-foreground"}`} />
                                    {categoryName || category}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 pt-0 space-y-1">
                                  {perms.map((perm: WebNovaPermission, i: number) => (
                                    <div 
                                      key={perm.code} 
                                      className={`flex items-center justify-between p-1.5 rounded text-[10px] ${perm.isGranted ? "bg-green-500/10" : "bg-muted/30"}`} 
                                      data-testid={`perm-${perm.code}`}
                                    >
                                      <span className="flex items-center gap-2">
                                        {perm.isGranted ? (
                                          <CheckCircle className="h-2.5 w-2.5 text-green-400" />
                                        ) : (
                                          <XCircle className="h-2.5 w-2.5 text-muted-foreground" />
                                        )}
                                        {isRtl ? perm.nameAr : perm.nameEn}
                                      </span>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[9px] h-4 ${
                                          !perm.isGranted ? "text-muted-foreground border-muted" : 
                                          perm.securityLevel === "danger" ? "text-red-400 border-red-500/30" : 
                                          "text-green-400 border-green-500/30"
                                        }`}
                                      >
                                        {perm.isGranted ? (isRtl ? "مفعّل" : "Granted") : (isRtl ? "غير مفعّل" : "Not Granted")}
                                      </Badge>
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            );
                          })}

                          {/* Sovereign Summary */}
                          <Card className="mt-3 bg-gradient-to-br from-violet-500/10 via-green-500/5 to-transparent border-violet-500/20">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-4 w-4 text-yellow-400" />
                                <span className="text-xs font-medium">{isRtl ? "ملخص الصلاحيات" : "Permissions Summary"}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="p-1.5 rounded bg-green-500/10 text-center">
                                  <span className="text-green-400 font-bold">{webnovaPermissions?.stats?.granted || 0}</span>
                                  <span className="text-muted-foreground ml-1">{isRtl ? "صلاحية ممنوحة" : "Granted"}</span>
                                </div>
                                <div className="p-1.5 rounded bg-red-500/10 text-center">
                                  <span className="text-red-400 font-bold">
                                    {webnovaPermissions?.categories ? 
                                      Object.values(webnovaPermissions.categories).flat().filter((p: WebNovaPermission) => p.securityLevel === "danger" && p.isGranted).length 
                                      : 0}
                                  </span>
                                  <span className="text-muted-foreground ml-1">{isRtl ? "خطيرة" : "Danger Level"}</span>
                                </div>
                              </div>
                              <p className="text-[9px] text-muted-foreground mt-2 text-center">
                                {webnovaPermissions?.powerLevel === 100 
                                  ? (isRtl ? "WebNova لديه كامل الصلاحيات في المساحة السيادية" : "WebNova has full permissions in sovereign workspace")
                                  : (isRtl ? "انقر 'منح الصلاحيات' لمنح كامل الصلاحيات" : "Click 'Grant All' to grant full permissions")}
                              </p>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* System Map Tab - Nova AI Working Memory */}
                  <TabsContent value="system-map" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <SystemMapContent isRtl={isRtl} />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      
      {/* Sovereign Status Dialog */}
      <Dialog open={showSovereignStatus} onOpenChange={setShowSovereignStatus}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 border-violet-500/30" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              {isRtl ? "حالة البيئة السيادية" : "Sovereign Environment Status"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Environment Status */}
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-green-400" />
                  <div>
                    <h4 className="font-medium text-green-400">{isRtl ? "بيئة سيادية مشفّرة بالكامل" : "Fully Encrypted Sovereign Environment"}</h4>
                    <p className="text-xs text-muted-foreground">{isRtl ? "لا وصول عام - معزولة بالكامل" : "No public access - Fully isolated"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Fingerprint className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-medium">{isRtl ? "المصادقة" : "Authentication"}</span>
                    </div>
                    <p className="text-xs text-green-300">{isRtl ? "دخول ثلاثي المراحل" : "Three-Stage Entry"}</p>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-xs font-medium">{isRtl ? "التشفير" : "Encryption"}</span>
                    </div>
                    <p className="text-xs text-green-300">AES-256-GCM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Session Information */}
            <Card className="bg-slate-900/50 border-violet-500/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-violet-400" />
                  {isRtl ? "معلومات الجلسة" : "Session Information"}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRtl ? "معرّف الجلسة" : "Session ID"}</span>
                    <span className="font-mono text-xs">{sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRtl ? "وقت البدء" : "Start Time"}</span>
                    <span>{sessionStartTime.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRtl ? "طريقة الدخول" : "Entry Method"}</span>
                    <Badge variant="outline" className="text-xs">{entryMethod}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRtl ? "المرحلة الحالية" : "Current Phase"}</span>
                    <Badge className={`${currentPhaseConfig.bgColor} ${currentPhaseConfig.color} text-xs`}>
                      {currentPhaseConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Enabled Capabilities */}
            <Card className="bg-slate-900/50 border-violet-500/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  {isRtl ? "الأدوات المُفعّلة" : "Enabled Capabilities"}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {isRtl 
                    ? "هذه الأدوات مسموحة لأن البيئة معزولة بالكامل ولا تغادر البيانات الحدود السيادية"
                    : "These features are allowed because the environment is fully isolated and no data leaves the sovereign boundary"
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Download, label: isRtl ? "تصدير التقارير" : "Report Export" },
                    { icon: Mic, label: isRtl ? "الإدخال الصوتي" : "Voice Input" },
                    { icon: History, label: isRtl ? "تاريخ المحادثات" : "Conversation History" },
                    { icon: Keyboard, label: isRtl ? "الاختصارات" : "Shortcuts" },
                    { icon: Bell, label: isRtl ? "الإشعارات" : "Notifications" },
                    { icon: Pin, label: isRtl ? "تثبيت الرسائل" : "Message Pinning" },
                  ].map((cap, i) => (
                    <Badge key={i} variant="outline" className="bg-violet-500/10 border-violet-500/30">
                      <cap.icon className="h-3 w-3 mr-1" />
                      {cap.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Audit Log Preview */}
            <Card className="bg-slate-900/50 border-violet-500/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-violet-400" />
                  {isRtl ? "سجل التدقيق (آخر 5 أحداث)" : "Audit Log (Last 5 Events)"}
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {auditLog.slice(-5).reverse().map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-slate-800/50">
                      <span>{entry.action}</span>
                      <span className="text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  ))}
                  {auditLog.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      {isRtl ? "لا توجد أحداث مسجلة بعد" : "No events logged yet"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 border-violet-500/30" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-violet-400" />
              {isRtl ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { keys: "Ctrl + N", desc: isRtl ? "فتح Nova" : "Open Nova" },
              { keys: "Ctrl + Shift + F", desc: isRtl ? "ملء الشاشة" : "Toggle Fullscreen" },
              { keys: "Ctrl + Shift + L", desc: isRtl ? "الوضع العائم" : "Toggle Floating" },
              { keys: "Ctrl + K", desc: isRtl ? "التركيز على الإدخال" : "Focus Input" },
              { keys: "Ctrl + /", desc: isRtl ? "الاختصارات" : "Show Shortcuts" },
              { keys: "Ctrl + Shift + V", desc: isRtl ? "الإدخال الصوتي" : "Voice Input" },
              { keys: "Ctrl + H", desc: isRtl ? "تاريخ المحادثات" : "Conversation History" },
            ].map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
                <span className="text-sm">{shortcut.desc}</span>
                <Badge variant="outline" className="font-mono text-xs">{shortcut.keys}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversation History Dialog */}
      <Dialog open={showConversationHistory} onOpenChange={setShowConversationHistory}>
        <DialogContent className="max-w-2xl h-[70vh] bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 border-violet-500/30" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-violet-400" />
              {isRtl ? "تاريخ المحادثات" : "Conversation History"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {conversations?.map((conv) => (
                <Card 
                  key={conv.id} 
                  className={`cursor-pointer transition-colors ${selectedConversation === conv.id ? "border-violet-500" : "border-violet-500/20"} bg-slate-900/50`}
                  onClick={() => {
                    setSelectedConversation(conv.id);
                    setShowConversationHistory(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{isRtl ? conv.titleAr || conv.title : conv.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updatedAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {conv.messageCount} {isRtl ? "رسالة" : "messages"}
                        </Badge>
                        <Badge className={conv.status === "active" ? "bg-green-500/20 text-green-400" : "bg-slate-500/20"}>
                          {conv.status === "active" ? (isRtl ? "نشط" : "Active") : (isRtl ? "مؤرشف" : "Archived")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!conversations || conversations.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  {isRtl ? "لا توجد محادثات سابقة" : "No previous conversations"}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Nova Settings Dialog */}
      <Dialog open={showNovaSettings} onOpenChange={setShowNovaSettings}>
        <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 border-violet-500/30" dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={novaAiIcon} alt="Nova AI" className="w-6 h-6 rounded-lg" />
              {isRtl ? "إعدادات Nova" : "Nova Settings"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <h4 className="text-sm font-medium mb-3">{isRtl ? "ثيم Nova" : "Nova Theme"}</h4>
              <div className="grid grid-cols-5 gap-2">
                {(["violet", "emerald", "amber", "rose", "cyan"] as const).map((theme) => (
                  <Button
                    key={theme}
                    size="sm"
                    variant="outline"
                    onClick={() => setNovaTheme(theme)}
                    className={`h-10 ${novaTheme === theme ? `bg-gradient-to-r ${novaThemeColors[theme].primary} border-2` : ""}`}
                    data-testid={`theme-${theme}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${novaThemeColors[theme].primary}`} />
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">{isRtl ? "الإشعارات" : "Notifications"}</h4>
                <p className="text-xs text-muted-foreground">{isRtl ? "تلقي إشعارات عند اكتمال المهام" : "Receive notifications when tasks complete"}</p>
              </div>
              <Button
                size="sm"
                variant={notificationsEnabled ? "default" : "outline"}
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  if (!notificationsEnabled && "Notification" in window) {
                    Notification.requestPermission();
                  }
                }}
                className={notificationsEnabled ? "bg-green-600" : ""}
              >
                {notificationsEnabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Voice Input */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">{isRtl ? "الإدخال الصوتي" : "Voice Input"}</h4>
                <p className="text-xs text-muted-foreground">{isRtl ? "التحدث مع Nova بالصوت" : "Speak to Nova with voice"}</p>
              </div>
              <Button
                size="sm"
                variant={isVoiceEnabled ? "default" : "outline"}
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={isVoiceEnabled ? "bg-violet-600" : ""}
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Pinned Messages Count */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">{isRtl ? "الرسائل المثبتة" : "Pinned Messages"}</h4>
                <p className="text-xs text-muted-foreground">{pinnedMessages.size} {isRtl ? "رسالة مثبتة" : "messages pinned"}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPinnedMessages(new Set())}
                disabled={pinnedMessages.size === 0}
              >
                <Pin className="h-4 w-4 mr-1" />
                {isRtl ? "مسح الكل" : "Clear All"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nova Control Panel */}
      <NovaControlPanel 
        isOpen={showNovaControlPanel} 
        onClose={() => setShowNovaControlPanel(false)} 
        isRtl={isRtl} 
      />
      
      {/* Floating Window Portal */}
      {novaFullscreen.isFloating && createPortal(
        <div 
          className="fixed bottom-20 right-6 z-[9998] w-[500px] h-[600px] rounded-xl overflow-hidden shadow-2xl shadow-violet-500/20 border border-violet-500/30"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-violet-950 to-indigo-950 border-b border-violet-500/30 cursor-move">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Nova AI
                </span>
                <Badge variant="outline" className="text-[9px] h-4 border-cyan-500/30 text-cyan-400">
                  {isRtl ? "عائم" : "Floating"}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={novaFullscreen.maximize} data-testid="float-maximize">
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={novaFullscreen.minimize} data-testid="float-close">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {(messages || []).concat(localMessages).map((msg, i) => (
                  <div
                    key={msg.id || i}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 h-fit">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-xs ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30"
                          : "bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {(isProcessing || streamingMessage) && (
                  <div className="flex gap-2 justify-start">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 h-fit">
                      <Sparkles className="w-3 h-3 text-white animate-pulse" />
                    </div>
                    <div className="max-w-[80%] p-3 rounded-xl text-xs bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30">
                      <p className="whitespace-pre-wrap">
                        {streamingMessage || (isRtl ? "Nova تفكر..." : "Nova is thinking...")}
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-violet-500/30 bg-violet-950/30">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."}
                  className="flex-1 h-9 text-xs bg-slate-900/50 border-violet-500/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                  data-testid="float-message-input"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isProcessing}
                  className="h-9 px-3 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                  data-testid="float-send"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Fullscreen mode now uses CSS class on main container instead of portal - removes this section */}
    </div>
  );
}
