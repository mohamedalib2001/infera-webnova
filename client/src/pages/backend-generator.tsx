import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Server, 
  Database,
  Code2,
  FileCode,
  Terminal,
  Copy,
  Download,
  CheckCircle,
  Loader2,
  Shield,
  Zap,
  Package,
  Settings,
  FileText,
  FolderTree,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  Check,
  X,
  Play,
  Clock
} from "lucide-react";

const translations = {
  ar: {
    title: "مولّد الباك إند الذكي",
    subtitle: "محرك توليد باك إند ذكي يفهم احتياجاتك ويبني أنظمة كاملة",
    projectName: "اسم المشروع",
    description: "وصف المشروع",
    descriptionPlaceholder: "صف نظامك بالتفصيل... مثال: نظام إدارة مدرسة يشمل الطلاب والمعلمين والحضور والدرجات",
    framework: "إطار العمل",
    database: "قاعدة البيانات",
    language: "لغة البرمجة",
    features: "الميزات",
    authentication: "المصادقة (JWT)",
    apiStyle: "نمط API",
    generate: "توليد الباك إند",
    generating: "جاري التوليد...",
    files: "الملفات المولّدة",
    dependencies: "التبعيات",
    setup: "أوامر الإعداد",
    envVars: "متغيرات البيئة",
    documentation: "التوثيق",
    copy: "نسخ",
    copied: "تم النسخ!",
    downloadAll: "تحميل الكل",
    success: "تم توليد الباك إند بنجاح!",
    featuresList: {
      crud: "عمليات CRUD أساسية",
      validation: "التحقق من البيانات",
      errorHandling: "معالجة الأخطاء",
      logging: "تسجيل السجلات",
      rateLimit: "تحديد معدل الطلبات",
      caching: "التخزين المؤقت",
      fileUpload: "رفع الملفات",
      email: "إرسال البريد"
    },
    preview: "معاينة مباشرة",
    architecture: "الهيكلية",
    folderStructure: "بنية الملفات",
    securityScore: "نقاط الأمان",
    productionReadiness: "جاهزية الإنتاج",
    enabledModules: "الوحدات المفعّلة",
    warnings: "تحذيرات",
    suggestions: "اقتراحات",
    generationLog: "سجل التوليد",
    readinessChecklist: "قائمة التحقق",
    notReady: "غير جاهز",
    development: "تطوير",
    staging: "اختبار",
    production: "إنتاج",
    cleanArchitecture: "Clean Architecture",
    modularMonolith: "Modular Monolith",
    microservices: "Microservices",
    addSuggestion: "إضافة",
  },
  en: {
    title: "Intelligent Backend Generator",
    subtitle: "Smart backend engine that understands your needs and builds complete systems",
    projectName: "Project Name",
    description: "Project Description",
    descriptionPlaceholder: "Describe your system in detail... Example: School management system with students, teachers, attendance, and grades",
    framework: "Framework",
    database: "Database",
    language: "Language",
    features: "Features",
    authentication: "Authentication (JWT)",
    apiStyle: "API Style",
    generate: "Generate Backend",
    generating: "Generating...",
    files: "Generated Files",
    dependencies: "Dependencies",
    setup: "Setup Commands",
    envVars: "Environment Variables",
    documentation: "Documentation",
    copy: "Copy",
    copied: "Copied!",
    downloadAll: "Download All",
    success: "Backend generated successfully!",
    featuresList: {
      crud: "Basic CRUD Operations",
      validation: "Data Validation",
      errorHandling: "Error Handling",
      logging: "Logging",
      rateLimit: "Rate Limiting",
      caching: "Caching",
      fileUpload: "File Upload",
      email: "Email Sending"
    },
    preview: "Live Preview",
    architecture: "Architecture",
    folderStructure: "Folder Structure",
    securityScore: "Security Score",
    productionReadiness: "Production Readiness",
    enabledModules: "Enabled Modules",
    warnings: "Warnings",
    suggestions: "Suggestions",
    generationLog: "Generation Log",
    readinessChecklist: "Readiness Checklist",
    notReady: "Not Ready",
    development: "Development",
    staging: "Staging",
    production: "Production",
    cleanArchitecture: "Clean Architecture",
    modularMonolith: "Modular Monolith",
    microservices: "Microservices",
    addSuggestion: "Add",
  }
};

interface FolderNode {
  name: string;
  type: "file" | "folder";
  children?: FolderNode[];
  description?: string;
}

interface ArchitecturePreview {
  folderStructure: FolderNode[];
  architecture: {
    pattern: string;
    reason: string;
    recommendedModules: string[];
    securityLevel: string;
    scalabilityNeeds: string;
  };
  inferredEntities: { name: string }[];
  enabledModules: string[];
  securityScore: number;
  productionReadiness: {
    score: number;
    status: string;
    checklist: { item: string; passed: boolean }[];
  };
  warnings: { type: string; message: string; messageAr: string }[];
  suggestions: { feature: string; reason: string; reasonAr: string }[];
}

interface GeneratedFile {
  path: string;
  content: string;
  type: string;
  description: string;
}

interface GenerationLog {
  step: string;
  status: "pending" | "running" | "completed" | "error";
  message: string;
  timestamp: number;
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
  setupCommands: string[];
  envVariables: Record<string, string>;
  documentation: { ar: string; en: string };
  preview: ArchitecturePreview;
  generationLog: GenerationLog[];
}

function FolderTreeNode({ node, level = 0 }: { node: FolderNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: level * 12 }}>
      <div 
        className="flex items-center gap-1 py-0.5 hover-elevate rounded px-1 cursor-pointer text-sm"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <span className="w-3" />
        )}
        {node.type === "folder" ? (
          <Folder className="h-4 w-4 text-amber-500" />
        ) : (
          <File className="h-4 w-4 text-blue-500" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen && hasChildren && node.children?.map((child, idx) => (
        <FolderTreeNode key={idx} node={child} level={level + 1} />
      ))}
    </div>
  );
}

export default function BackendGenerator() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState("express");
  const [database, setDatabase] = useState("postgresql");
  const [lang, setLang] = useState("typescript");
  const [apiStyle, setApiStyle] = useState("rest");
  const [authentication, setAuthentication] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["crud", "validation", "errorHandling"]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [preview, setPreview] = useState<ArchitecturePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const features = ["crud", "validation", "errorHandling", "logging", "rateLimit", "caching", "fileUpload", "email"];

  const getConfig = useCallback(() => ({
    projectName: projectName || "my-api",
    description,
    framework,
    database,
    language: lang,
    apiStyle,
    authentication,
    features: selectedFeatures,
  }), [projectName, description, framework, database, lang, apiStyle, authentication, selectedFeatures]);

  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const response = await apiRequest("POST", "/api/backend/preview", getConfig());
      if (response?.success && response.preview) {
        setPreview(response.preview);
      }
    } catch (error) {
      console.error("Preview error:", error);
    } finally {
      setPreviewLoading(false);
    }
  }, [getConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreview();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/backend/generate", getConfig());
      if (!response || !response.success) {
        throw new Error(response?.error || "Generation failed");
      }
      return response;
    },
    onSuccess: (data: GenerationResult) => {
      if (data && data.files && data.files.length > 0) {
        setResult(data);
        setSelectedFile(data.files[0]);
        setPreview(data.preview);
        toast({ title: t.success });
      } else {
        toast({ title: language === "ar" ? "لم يتم توليد ملفات" : "No files generated", variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل التوليد" : "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };

  const addSuggestion = (feature: string) => {
    if (!selectedFeatures.includes(feature)) {
      setSelectedFeatures(prev => [...prev, feature]);
      toast({ title: language === "ar" ? "تمت الإضافة" : "Added" });
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      "not-ready": { en: t.notReady, ar: t.notReady },
      "development": { en: t.development, ar: t.development },
      "staging": { en: t.staging, ar: t.staging },
      "production": { en: t.production, ar: t.production },
    };
    return labels[status]?.[language as "en" | "ar"] || status;
  };

  const getArchitectureLabel = (pattern: string) => {
    const labels: Record<string, string> = {
      "clean-architecture": t.cleanArchitecture,
      "modular-monolith": t.modularMonolith,
      "microservices": t.microservices,
    };
    return labels[pattern] || pattern;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-backend-title">
          <Server className="h-8 w-8 text-purple-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {language === "ar" ? "إعدادات التوليد" : "Generation Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.projectName}</Label>
                <Input
                  placeholder={language === "ar" ? "مثال: my-api" : "e.g., my-api"}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  data-testid="input-project-name"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea
                  placeholder={t.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.framework}</Label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger data-testid="select-framework">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">Express.js</SelectItem>
                      <SelectItem value="fastify">Fastify</SelectItem>
                      <SelectItem value="koa">Koa</SelectItem>
                      <SelectItem value="hapi">Hapi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.database}</Label>
                  <Select value={database} onValueChange={setDatabase}>
                    <SelectTrigger data-testid="select-database">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.language}</Label>
                  <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.apiStyle}</Label>
                  <Select value={apiStyle} onValueChange={setApiStyle}>
                    <SelectTrigger data-testid="select-api-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rest">REST API</SelectItem>
                      <SelectItem value="graphql">GraphQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <Label>{t.authentication}</Label>
                </div>
                <Switch
                  checked={authentication}
                  onCheckedChange={setAuthentication}
                  data-testid="switch-auth"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{t.features}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFeatures.includes(feature)}
                        onCheckedChange={() => toggleFeature(feature)}
                        data-testid={`checkbox-${feature}`}
                      />
                      <span className="text-sm">
                        {t.featuresList[feature as keyof typeof t.featuresList]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => generateMutation.mutate()}
                disabled={!projectName || generateMutation.isPending}
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    {t.generate}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {t.preview}
                </CardTitle>
                {previewLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">{t.architecture}</p>
                      <p className="font-medium text-sm">{getArchitectureLabel(preview.architecture.pattern)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">{t.securityScore}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={preview.securityScore} className="h-2 flex-1" />
                        <span className="font-medium text-sm">{preview.securityScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{t.productionReadiness}</p>
                      <Badge 
                        variant={preview.productionReadiness.status === "production" ? "default" : "secondary"}
                        className={preview.productionReadiness.status === "production" ? "bg-green-500" : ""}
                      >
                        {getStatusLabel(preview.productionReadiness.status)}
                      </Badge>
                    </div>
                    <Progress value={preview.productionReadiness.score} className="h-2" />
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {preview.productionReadiness.checklist.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                          {item.passed ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                          <span className={item.passed ? "text-muted-foreground" : "text-red-500"}>
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t.folderStructure}</p>
                    <ScrollArea className="h-40 border rounded-lg p-2 bg-muted/30">
                      {preview.folderStructure.map((node, idx) => (
                        <FolderTreeNode key={idx} node={node} />
                      ))}
                    </ScrollArea>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {preview.enabledModules.slice(0, 8).map((mod, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {mod}
                      </Badge>
                    ))}
                    {preview.enabledModules.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{preview.enabledModules.length - 8}
                      </Badge>
                    )}
                  </div>

                  {preview.warnings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{t.warnings}</p>
                      {preview.warnings.map((warn, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-2 p-2 rounded text-sm ${
                            warn.type === "critical" ? "bg-red-500/10 text-red-600 dark:text-red-400" : 
                            warn.type === "warning" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                            "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {warn.type === "critical" ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> :
                           warn.type === "warning" ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> :
                           <Info className="h-4 w-4 shrink-0 mt-0.5" />}
                          <span>{language === "ar" ? warn.messageAr : warn.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {preview.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{t.suggestions}</p>
                      {preview.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded bg-primary/5">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm">{language === "ar" ? sug.reasonAr : sug.reason}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => addSuggestion(sug.feature)}
                            disabled={selectedFeatures.includes(sug.feature)}
                            data-testid={`button-add-suggestion-${sug.feature}`}
                          >
                            {selectedFeatures.includes(sug.feature) ? <Check className="h-4 w-4" /> : t.addSuggestion}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{language === "ar" ? "ابدأ بتعبئة الإعدادات لرؤية المعاينة" : "Fill in settings to see preview"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                      <FolderTree className="h-5 w-5" />
                      {t.files}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {result.files.length} {language === "ar" ? "ملف" : "files"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <ScrollArea className="h-64 w-1/3 border rounded-lg p-2">
                      {result.files.map((file, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded cursor-pointer hover-elevate ${selectedFile?.path === file.path ? "bg-muted" : ""}`}
                          onClick={() => setSelectedFile(file)}
                          data-testid={`file-item-${idx}`}
                        >
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-blue-500" />
                            <span className="text-sm truncate">{file.path}</span>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                    <div className="flex-1 relative">
                      <ScrollArea className="h-64 border rounded-lg bg-muted">
                        <pre className="p-3 text-xs overflow-x-auto">
                          <code>{selectedFile?.content || ""}</code>
                        </pre>
                      </ScrollArea>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => selectedFile && copyToClipboard(selectedFile.content)}
                        data-testid="button-copy-file"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.generationLog && result.generationLog.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      {t.generationLog}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.generationLog.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          {log.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : log.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : log.status === "running" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium capitalize">{log.step}</span>
                          <span className="text-muted-foreground flex-1">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="deps">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="deps" data-testid="tab-deps">{t.dependencies}</TabsTrigger>
                  <TabsTrigger value="setup" data-testid="tab-setup">{t.setup}</TabsTrigger>
                  <TabsTrigger value="env" data-testid="tab-env">{t.envVars}</TabsTrigger>
                  <TabsTrigger value="docs" data-testid="tab-docs">{t.documentation}</TabsTrigger>
                </TabsList>
                <TabsContent value="deps">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2">
                        {result.dependencies.map((dep, idx) => (
                          <Badge key={idx} variant="secondary">
                            <Package className="h-3 w-3 mr-1" />
                            {dep}
                          </Badge>
                        ))}
                      </div>
                      {result.devDependencies && result.devDependencies.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-sm text-muted-foreground mb-2">Dev Dependencies:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.devDependencies.map((dep, idx) => (
                              <Badge key={idx} variant="outline">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="setup">
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      {result.setupCommands.map((cmd, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Terminal className="h-4 w-4" />
                          <code className="text-sm flex-1">{cmd}</code>
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(cmd)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="env">
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      {Object.entries(result.envVariables).map(([key, value], idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <code className="text-sm font-medium text-primary">{key}</code>
                          <span className="text-muted-foreground">=</span>
                          <code className="text-sm flex-1 truncate">{value}</code>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="docs">
                  <Card>
                    <CardContent className="pt-4">
                      <ScrollArea className="h-64">
                        <pre className="text-sm whitespace-pre-wrap">
                          {result.documentation[language as keyof typeof result.documentation] || result.documentation.en}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
