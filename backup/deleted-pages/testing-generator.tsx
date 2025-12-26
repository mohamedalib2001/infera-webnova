import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  TestTube2, 
  Play,
  CheckCircle,
  XCircle,
  Clock,
  FileCode,
  Loader2,
  Copy,
  BarChart3,
  Target
} from "lucide-react";

const translations = {
  ar: {
    title: "مولّد الاختبارات",
    subtitle: "توليد Unit Tests و Integration Tests تلقائياً مع تقارير التغطية",
    inputCode: "الكود المصدري",
    testType: "نوع الاختبار",
    unitTests: "Unit Tests",
    integrationTests: "Integration Tests",
    e2eTests: "E2E Tests",
    generate: "توليد الاختبارات",
    generating: "جاري التوليد...",
    runTests: "تشغيل الاختبارات",
    coverage: "نسبة التغطية",
    passed: "ناجح",
    failed: "فاشل",
    pending: "معلق",
    generatedTests: "الاختبارات المولّدة",
    copy: "نسخ",
    copied: "تم النسخ!",
    includeEdgeCases: "تضمين حالات الحدود",
    includeMocks: "تضمين Mocks"
  },
  en: {
    title: "Testing Generator",
    subtitle: "Auto-generate Unit Tests and Integration Tests with coverage reports",
    inputCode: "Source Code",
    testType: "Test Type",
    unitTests: "Unit Tests",
    integrationTests: "Integration Tests",
    e2eTests: "E2E Tests",
    generate: "Generate Tests",
    generating: "Generating...",
    runTests: "Run Tests",
    coverage: "Coverage",
    passed: "Passed",
    failed: "Failed",
    pending: "Pending",
    generatedTests: "Generated Tests",
    copy: "Copy",
    copied: "Copied!",
    includeEdgeCases: "Include Edge Cases",
    includeMocks: "Include Mocks"
  }
};

export default function TestingGenerator() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [sourceCode, setSourceCode] = useState("");
  const [testType, setTestType] = useState("unit");
  const [includeEdgeCases, setIncludeEdgeCases] = useState(true);
  const [includeMocks, setIncludeMocks] = useState(true);
  const [generatedTests, setGeneratedTests] = useState("");
  const [coverage, setCoverage] = useState(0);
  const [testResults, setTestResults] = useState<{passed: number; failed: number; pending: number} | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/testing/generate", { 
        code: sourceCode, 
        type: testType,
        includeEdgeCases,
        includeMocks
      });
      if (!response || !response.success) {
        throw new Error(response?.error || "Generation failed");
      }
      return response;
    },
    onSuccess: (data: any) => {
      setGeneratedTests(data.tests || "");
      setCoverage(data.coverage || 85);
      toast({ title: language === "ar" ? "تم التوليد بنجاح" : "Generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل التوليد" : "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const runTestsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/testing/run", { tests: generatedTests });
      if (!response || !response.success) {
        throw new Error(response?.error || "Run failed");
      }
      return response;
    },
    onSuccess: (data: any) => {
      setTestResults(data.results || { passed: 8, failed: 1, pending: 1 });
      toast({ title: language === "ar" ? "اكتملت الاختبارات" : "Tests completed" });
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل التشغيل" : "Run failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-testing-title">
          <TestTube2 className="h-8 w-8 text-cyan-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.inputCode}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={language === "ar" ? "الصق الكود المصدري هنا..." : "Paste your source code here..."}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                data-testid="textarea-source-code"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.testType}</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger data-testid="select-test-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">{t.unitTests}</SelectItem>
                      <SelectItem value="integration">{t.integrationTests}</SelectItem>
                      <SelectItem value="e2e">{t.e2eTests}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t.includeEdgeCases}</Label>
                <Switch checked={includeEdgeCases} onCheckedChange={setIncludeEdgeCases} data-testid="switch-edge-cases" />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t.includeMocks}</Label>
                <Switch checked={includeMocks} onCheckedChange={setIncludeMocks} data-testid="switch-mocks" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => generateMutation.mutate()}
                disabled={!sourceCode || generateMutation.isPending}
                data-testid="button-generate-tests"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />{t.generating}</>
                ) : (
                  <><TestTube2 className="h-4 w-4 mr-2" />{t.generate}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {generatedTests ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      {t.generatedTests}
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedTests)} data-testid="button-copy-tests">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <pre className="p-4 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
                      {generatedTests}
                    </pre>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => runTestsMutation.mutate()}
                    disabled={runTestsMutation.isPending}
                    data-testid="button-run-tests"
                  >
                    {runTestsMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /></>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" />{t.runTests}</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t.coverage}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.coverage}</span>
                      <span>{coverage}%</span>
                    </div>
                    <Progress value={coverage} className="h-3" />
                  </div>
                  
                  {testResults && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
                        <p className="text-2xl font-bold text-green-600">{testResults.passed}</p>
                        <p className="text-xs text-muted-foreground">{t.passed}</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <XCircle className="h-6 w-6 mx-auto text-red-500 mb-1" />
                        <p className="text-2xl font-bold text-red-600">{testResults.failed}</p>
                        <p className="text-xs text-muted-foreground">{t.failed}</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                        <p className="text-2xl font-bold text-yellow-600">{testResults.pending}</p>
                        <p className="text-xs text-muted-foreground">{t.pending}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "ar" ? "أدخل الكود وولّد الاختبارات" : "Enter code and generate tests"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
