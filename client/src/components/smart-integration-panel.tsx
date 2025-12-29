import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, 
  Shield, 
  Zap, 
  Database,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Building2,
  Cpu,
  Lock,
  AlertTriangle,
  Check,
  Code,
  FileJson,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SmartIntegrationPanelProps {
  architecture: any;
  language?: "ar" | "en";
}

interface IntegrationDetection {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  provider: string;
  confidence: number;
  reason: string;
  reasonAr: string;
  requiredCredentials: string[];
  dataTypes: any[];
  securityLevel: string;
}

interface GeneratedAPI {
  id: string;
  method: string;
  endpoint: string;
  description: string;
  descriptionAr: string;
  authentication: any;
  rateLimit: any;
}

const categoryIcons: Record<string, any> = {
  payment: CreditCard,
  auth: Lock,
  communication: MessageSquare,
  storage: Database,
  analytics: BarChart3,
  crm: Users,
  erp: Building2,
  ai: Cpu,
  custom: Plug
};

const securityColors: Record<string, string> = {
  public: "bg-green-500/10 text-green-700 dark:text-green-400",
  internal: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  confidential: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  restricted: "bg-red-500/10 text-red-700 dark:text-red-400"
};

export function SmartIntegrationPanel({ 
  architecture, 
  language = "ar" 
}: SmartIntegrationPanelProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDetection | null>(null);
  const [generatedAPIs, setGeneratedAPIs] = useState<GeneratedAPI[]>([]);
  const [securityPolicy, setSecurityPolicy] = useState<any>(null);
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const { toast } = useToast();
  const isArabic = language === "ar";

  const catalogQuery = useQuery<{ catalog: any[] }>({
    queryKey: ["/api/integration-hub/catalog"]
  });

  const detectIntegrations = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/integration-hub/detect", { architecture });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: isArabic ? "تم الكشف" : "Detection Complete",
        description: isArabic ? data.messageAr : data.message
      });
    }
  });

  const generateAPI = useMutation({
    mutationFn: async (integration: IntegrationDetection) => {
      const res = await apiRequest("POST", "/api/integration-hub/generate-api", { 
        integration, 
        architecture 
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedAPIs(data.apis || []);
      setSecurityPolicy(data.securityPolicy);
      setOpenApiSpec(data.openApiSpec);
      toast({
        title: isArabic ? "تم التوليد" : "Generation Complete",
        description: isArabic ? data.messageAr : data.message
      });
    }
  });

  const handleSelectIntegration = (integration: IntegrationDetection) => {
    setSelectedIntegration(integration);
    generateAPI.mutate(integration);
  };

  const detections = detectIntegrations.data?.detections || [];

  return (
    <div className="flex flex-col gap-4 h-full" dir={isArabic ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plug className="w-5 h-5" />
              {isArabic ? "مركز التكامل الذكي" : "Smart Integration Hub"}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? "كشف تلقائي وتوليد واجهات تكامل آمنة" 
                : "Auto-detect and generate secure integration interfaces"}
            </CardDescription>
          </div>
          <Button 
            onClick={() => detectIntegrations.mutate()}
            disabled={detectIntegrations.isPending}
            data-testid="button-detect-integrations"
          >
            {detectIntegrations.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span className="mr-2">
              {isArabic ? "كشف التكاملات" : "Detect Integrations"}
            </span>
          </Button>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {isArabic ? "التكاملات المكتشفة" : "Detected Integrations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              {detections.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {isArabic 
                    ? "اضغط على 'كشف التكاملات' لتحليل البنية" 
                    : "Click 'Detect Integrations' to analyze architecture"}
                </div>
              ) : (
                <div className="space-y-2">
                  {detections.map((detection: IntegrationDetection) => {
                    const Icon = categoryIcons[detection.category] || Plug;
                    const isSelected = selectedIntegration?.id === detection.id;
                    
                    return (
                      <div
                        key={detection.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "hover-elevate"
                        }`}
                        onClick={() => handleSelectIntegration(detection)}
                        data-testid={`card-integration-${detection.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-muted">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {isArabic ? detection.nameAr : detection.name}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className={securityColors[detection.securityLevel]}
                              >
                                {detection.securityLevel}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {detection.confidence}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {isArabic ? detection.reasonAr : detection.reason}
                            </p>
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {detection.requiredCredentials.slice(0, 2).map((cred, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {cred}
                                </Badge>
                              ))}
                              {detection.requiredCredentials.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{detection.requiredCredentials.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedIntegration 
                ? (isArabic ? selectedIntegration.nameAr : selectedIntegration.name)
                : (isArabic ? "تفاصيل التكامل" : "Integration Details")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {!selectedIntegration ? (
              <div className="text-center text-muted-foreground py-8">
                {isArabic 
                  ? "اختر تكاملاً لعرض التفاصيل" 
                  : "Select an integration to view details"}
              </div>
            ) : generateAPI.isPending ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Tabs defaultValue="apis" className="h-full flex flex-col">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="apis" data-testid="tab-apis">
                    <Code className="w-4 h-4 mr-1" />
                    APIs
                  </TabsTrigger>
                  <TabsTrigger value="security" data-testid="tab-security">
                    <Shield className="w-4 h-4 mr-1" />
                    {isArabic ? "الأمان" : "Security"}
                  </TabsTrigger>
                  <TabsTrigger value="openapi" data-testid="tab-openapi">
                    <FileJson className="w-4 h-4 mr-1" />
                    OpenAPI
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="apis" className="flex-1 min-h-0 mt-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {generatedAPIs.map((api) => (
                        <div 
                          key={api.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-api-${api.id}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              api.method === "GET" ? "secondary" :
                              api.method === "POST" ? "default" :
                              api.method === "DELETE" ? "destructive" : "outline"
                            }>
                              {api.method}
                            </Badge>
                            <code className="text-sm">{api.endpoint}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? api.descriptionAr : api.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{api.authentication?.type || "none"}</span>
                            <span>|</span>
                            <span>{api.rateLimit?.requests}/{api.rateLimit?.window}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="security" className="flex-1 min-h-0 mt-2">
                  <ScrollArea className="h-full">
                    {securityPolicy && (
                      <div className="space-y-4">
                        <div className="p-3 rounded-md border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            {isArabic ? "التحكم بالوصول" : "Access Control"}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {isArabic ? "الأدوار المطلوبة:" : "Required Roles:"}
                              </span>
                              <div className="flex gap-1 flex-wrap">
                                {securityPolicy.accessControl?.requiredRoles?.map((role: string, i: number) => (
                                  <Badge key={i} variant="outline">{role}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {securityPolicy.accessControl?.mfaRequired ? (
                                <Badge className="bg-green-500/10 text-green-700">
                                  <Check className="w-3 h-3 mr-1" />
                                  MFA
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  {isArabic ? "بدون MFA" : "No MFA"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-md border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {isArabic ? "التشفير" : "Encryption"}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                {isArabic ? "أثناء النقل:" : "In Transit:"}
                              </span>
                              <Badge className="ml-2" variant={securityPolicy.encryption?.inTransit ? "default" : "outline"}>
                                {securityPolicy.encryption?.inTransit ? "Yes" : "No"}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isArabic ? "أثناء الراحة:" : "At Rest:"}
                              </span>
                              <Badge className="ml-2" variant={securityPolicy.encryption?.atRest ? "default" : "outline"}>
                                {securityPolicy.encryption?.atRest ? "Yes" : "No"}
                              </Badge>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">
                                {isArabic ? "الخوارزمية:" : "Algorithm:"}
                              </span>
                              <code className="ml-2 text-xs">{securityPolicy.encryption?.algorithm}</code>
                            </div>
                          </div>
                        </div>

                        {securityPolicy.compliance?.length > 0 && (
                          <div className="p-3 rounded-md border">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              {isArabic ? "الامتثال" : "Compliance"}
                            </h4>
                            <div className="flex gap-1 flex-wrap">
                              {securityPolicy.compliance.map((comp: string, i: number) => (
                                <Badge key={i} variant="secondary">{comp}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="openapi" className="flex-1 min-h-0 mt-2">
                  <ScrollArea className="h-full">
                    {openApiSpec && (
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(openApiSpec, null, 2)}
                      </pre>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {catalogQuery.data?.catalog && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {isArabic ? "كتالوج التكاملات المدعومة" : "Supported Integration Catalog"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {catalogQuery.data.catalog.map((item: any) => {
                const Icon = categoryIcons[item.category] || Plug;
                return (
                  <Badge 
                    key={item.key} 
                    variant="outline" 
                    className="flex items-center gap-1"
                    data-testid={`badge-catalog-${item.key}`}
                  >
                    <Icon className="w-3 h-3" />
                    {isArabic ? item.nameAr : item.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
