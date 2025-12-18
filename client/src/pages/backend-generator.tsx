import { useState } from "react";
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
  FolderTree
} from "lucide-react";

const translations = {
  ar: {
    title: "مولّد الباك إند",
    subtitle: "أنشئ باك إند كامل بضغطة زر باستخدام الذكاء الاصطناعي",
    projectName: "اسم المشروع",
    description: "وصف المشروع",
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
    }
  },
  en: {
    title: "Backend Generator",
    subtitle: "Generate a complete backend with one click using AI",
    projectName: "Project Name",
    description: "Project Description",
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
    }
  }
};

interface GeneratedFile {
  path: string;
  content: string;
  type: string;
}

interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
  setupCommands: string[];
  envVariables: Record<string, string>;
  documentation: { ar: string; en: string };
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

  const features = ["crud", "validation", "errorHandling", "logging", "rateLimit", "caching", "fileUpload", "email"];

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/backend/generate", {
        projectName,
        description,
        framework,
        database,
        language: lang,
        apiStyle,
        authentication,
        features: selectedFeatures,
      });
      if (!response || !response.success) {
        throw new Error(response?.error || "Generation failed");
      }
      return response;
    },
    onSuccess: (data: GenerationResult) => {
      if (data && data.files && data.files.length > 0) {
        setResult(data);
        setSelectedFile(data.files[0]);
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
                  placeholder={language === "ar" ? "صف التطبيق الذي تريد بناءه..." : "Describe the application you want to build..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
          {result ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                        size="sm"
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
                      {result.devDependencies.length > 0 && (
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
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(cmd)}>
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
                          <code className="text-sm">{key}={value}</code>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="docs">
                  <Card>
                    <CardContent className="pt-4">
                      <ScrollArea className="h-48">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm">
                            {result.documentation[language as keyof typeof result.documentation] || result.documentation.en}
                          </pre>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "قم بتعبئة الإعدادات واضغط 'توليد الباك إند'" 
                    : "Fill in the settings and click 'Generate Backend'"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
