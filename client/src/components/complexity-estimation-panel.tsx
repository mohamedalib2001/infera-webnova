/**
 * INFERA WebNova - Complexity Estimation Panel
 * لوحة تقدير التعقيد والتكلفة
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calculator,
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  DollarSign,
  Users,
  Server,
  Shield,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  Layers
} from "lucide-react";

interface FeatureSpec {
  id: string;
  name: string;
  category: string;
  complexity: string;
}

interface IntegrationSpec {
  id: string;
  name: string;
  type: string;
  complexity: string;
}

interface DataModelSpec {
  name: string;
  fields: number;
  relationships: number;
  hasFiles: boolean;
  hasEncryption: boolean;
}

interface PlatformSpec {
  name: string;
  sector: string;
  type: string;
  securityLevel: string;
  features: FeatureSpec[];
  integrations: IntegrationSpec[];
  dataModels: DataModelSpec[];
  userRoles: number;
  expectedUsers: number;
  multiLanguage: boolean;
  multiTenant: boolean;
  complianceRequirements: string[];
}

interface ComplexityPanelProps {
  language?: "en" | "ar";
}

export function ComplexityEstimationPanel({ language = "en" }: ComplexityPanelProps) {
  const { toast } = useToast();
  const isAr = language === "ar";

  const [activeTab, setActiveTab] = useState("quick");
  const [platformSpec, setPlatformSpec] = useState<PlatformSpec>({
    name: "",
    sector: "general",
    type: "web",
    securityLevel: "standard",
    features: [],
    integrations: [],
    dataModels: [],
    userRoles: 3,
    expectedUsers: 1000,
    multiLanguage: false,
    multiTenant: false,
    complianceRequirements: []
  });

  const [quickParams, setQuickParams] = useState({
    features: 5,
    integrations: 2,
    sector: "general",
    securityLevel: "standard"
  });

  const { data: configData } = useQuery({
    queryKey: ["/api/complexity/config"]
  });

  const { data: featureTemplates } = useQuery({
    queryKey: ["/api/complexity/templates/features"]
  });

  const { data: integrationTemplates } = useQuery({
    queryKey: ["/api/complexity/templates/integrations"]
  });

  const quickEstimateMutation = useMutation({
    mutationFn: async (params: typeof quickParams) => {
      const response = await apiRequest("POST", "/api/complexity/quick-estimate", params);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isAr ? "تم التقدير السريع" : "Quick Estimate Complete",
        description: data.message
      });
    },
    onError: (error: any) => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const fullEstimateMutation = useMutation({
    mutationFn: async (spec: PlatformSpec) => {
      const response = await apiRequest("POST", "/api/complexity/estimate", spec);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isAr ? "تم التقدير الكامل" : "Full Estimate Complete",
        description: data.message
      });
    },
    onError: (error: any) => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const config = configData?.data;
  const quickResult = quickEstimateMutation.data?.data;
  const fullResult = fullEstimateMutation.data?.data;

  const addFeature = (feature: FeatureSpec) => {
    if (!platformSpec.features.find(f => f.id === feature.id)) {
      setPlatformSpec(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const removeFeature = (id: string) => {
    setPlatformSpec(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };

  const addIntegration = (integration: IntegrationSpec) => {
    if (!platformSpec.integrations.find(i => i.id === integration.id)) {
      setPlatformSpec(prev => ({
        ...prev,
        integrations: [...prev.integrations, integration]
      }));
    }
  };

  const removeIntegration = (id: string) => {
    setPlatformSpec(prev => ({
      ...prev,
      integrations: prev.integrations.filter(i => i.id !== id)
    }));
  };

  const toggleCompliance = (id: string) => {
    setPlatformSpec(prev => ({
      ...prev,
      complianceRequirements: prev.complianceRequirements.includes(id)
        ? prev.complianceRequirements.filter(c => c !== id)
        : [...prev.complianceRequirements, id]
    }));
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "high": return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "very_high": return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "extreme": return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {isAr ? "محرك تقدير التعقيد والتكلفة" : "Complexity & Cost Estimation Engine"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "تقدير الموارد المطلوبة قبل بناء المنصة" : "Estimate resources before building your platform"}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quick" className="gap-2" data-testid="tab-quick-estimate">
            <Zap className="w-4 h-4" />
            {isAr ? "تقدير سريع" : "Quick Estimate"}
          </TabsTrigger>
          <TabsTrigger value="full" className="gap-2" data-testid="tab-full-estimate">
            <Layers className="w-4 h-4" />
            {isAr ? "تقدير كامل" : "Full Estimate"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {isAr ? "التقدير السريع" : "Quick Estimation"}
              </CardTitle>
              <CardDescription>
                {isAr ? "احصل على تقدير سريع بناءً على معايير أساسية" : "Get a quick estimate based on basic parameters"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isAr ? "عدد الميزات" : "Number of Features"}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={quickParams.features}
                    onChange={(e) => setQuickParams(prev => ({ ...prev, features: parseInt(e.target.value) || 1 }))}
                    data-testid="input-quick-features"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "عدد التكاملات" : "Number of Integrations"}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={quickParams.integrations}
                    onChange={(e) => setQuickParams(prev => ({ ...prev, integrations: parseInt(e.target.value) || 0 }))}
                    data-testid="input-quick-integrations"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "القطاع" : "Sector"}</Label>
                  <Select
                    value={quickParams.sector}
                    onValueChange={(v) => setQuickParams(prev => ({ ...prev, sector: v }))}
                  >
                    <SelectTrigger data-testid="select-quick-sector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.sectors?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {isAr ? s.nameAr : s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isAr ? "مستوى الأمان" : "Security Level"}</Label>
                  <Select
                    value={quickParams.securityLevel}
                    onValueChange={(v) => setQuickParams(prev => ({ ...prev, securityLevel: v }))}
                  >
                    <SelectTrigger data-testid="select-quick-security">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.securityLevels?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {isAr ? s.nameAr : s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => quickEstimateMutation.mutate(quickParams)}
                disabled={quickEstimateMutation.isPending}
                className="w-full"
                data-testid="button-quick-estimate"
              >
                {quickEstimateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span className="ms-2">{isAr ? "احسب التقدير" : "Calculate Estimate"}</span>
              </Button>

              {quickResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="font-medium">{isAr ? "التعقيد" : "Complexity"}</span>
                      </div>
                      <p className="text-lg font-semibold" data-testid="text-quick-complexity">{quickResult.complexity}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{isAr ? "الوقت" : "Time"}</span>
                      </div>
                      <p className="text-lg font-semibold" data-testid="text-quick-days">{quickResult.days}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{isAr ? "التكلفة" : "Cost"}</span>
                      </div>
                      <p className="text-lg font-semibold" data-testid="text-quick-cost">{quickResult.cost}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isAr ? "معلومات المنصة" : "Platform Information"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isAr ? "اسم المنصة" : "Platform Name"}</Label>
                      <Input
                        value={platformSpec.name}
                        onChange={(e) => setPlatformSpec(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={isAr ? "أدخل اسم المنصة" : "Enter platform name"}
                        data-testid="input-platform-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{isAr ? "نوع المنصة" : "Platform Type"}</Label>
                      <Select
                        value={platformSpec.type}
                        onValueChange={(v) => setPlatformSpec(prev => ({ ...prev, type: v }))}
                      >
                        <SelectTrigger data-testid="select-platform-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config?.platformTypes?.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {isAr ? t.nameAr : t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{isAr ? "القطاع" : "Sector"}</Label>
                      <Select
                        value={platformSpec.sector}
                        onValueChange={(v) => setPlatformSpec(prev => ({ ...prev, sector: v }))}
                      >
                        <SelectTrigger data-testid="select-platform-sector">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config?.sectors?.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {isAr ? s.nameAr : s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{isAr ? "مستوى الأمان" : "Security Level"}</Label>
                      <Select
                        value={platformSpec.securityLevel}
                        onValueChange={(v) => setPlatformSpec(prev => ({ ...prev, securityLevel: v }))}
                      >
                        <SelectTrigger data-testid="select-platform-security">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config?.securityLevels?.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {isAr ? s.nameAr : s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{isAr ? "عدد الأدوار" : "User Roles"}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={platformSpec.userRoles}
                        onChange={(e) => setPlatformSpec(prev => ({ ...prev, userRoles: parseInt(e.target.value) || 1 }))}
                        data-testid="input-user-roles"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{isAr ? "المستخدمين المتوقعين" : "Expected Users"}</Label>
                      <Input
                        type="number"
                        min={100}
                        value={platformSpec.expectedUsers}
                        onChange={(e) => setPlatformSpec(prev => ({ ...prev, expectedUsers: parseInt(e.target.value) || 100 }))}
                        data-testid="input-expected-users"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="multiLanguage"
                        checked={platformSpec.multiLanguage}
                        onCheckedChange={(c) => setPlatformSpec(prev => ({ ...prev, multiLanguage: !!c }))}
                        data-testid="checkbox-multi-language"
                      />
                      <Label htmlFor="multiLanguage">{isAr ? "متعدد اللغات" : "Multi-Language"}</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="multiTenant"
                        checked={platformSpec.multiTenant}
                        onCheckedChange={(c) => setPlatformSpec(prev => ({ ...prev, multiTenant: !!c }))}
                        data-testid="checkbox-multi-tenant"
                      />
                      <Label htmlFor="multiTenant">{isAr ? "متعدد المستأجرين" : "Multi-Tenant"}</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span>{isAr ? "الميزات" : "Features"}</span>
                    <Badge variant="secondary" data-testid="badge-feature-count">{platformSpec.features.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-32">
                    <div className="flex flex-wrap gap-2">
                      {featureTemplates?.data?.map((f: FeatureSpec) => (
                        <Button
                          key={f.id}
                          variant={platformSpec.features.find(pf => pf.id === f.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => platformSpec.features.find(pf => pf.id === f.id) ? removeFeature(f.id) : addFeature(f)}
                          data-testid={`button-feature-${f.id}`}
                        >
                          {platformSpec.features.find(pf => pf.id === f.id) ? (
                            <CheckCircle className="w-3 h-3 me-1" />
                          ) : (
                            <Plus className="w-3 h-3 me-1" />
                          )}
                          {f.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span>{isAr ? "التكاملات" : "Integrations"}</span>
                    <Badge variant="secondary" data-testid="badge-integration-count">{platformSpec.integrations.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-24">
                    <div className="flex flex-wrap gap-2">
                      {integrationTemplates?.data?.map((i: IntegrationSpec) => (
                        <Button
                          key={i.id}
                          variant={platformSpec.integrations.find(pi => pi.id === i.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => platformSpec.integrations.find(pi => pi.id === i.id) ? removeIntegration(i.id) : addIntegration(i)}
                          data-testid={`button-integration-${i.id}`}
                        >
                          {platformSpec.integrations.find(pi => pi.id === i.id) ? (
                            <CheckCircle className="w-3 h-3 me-1" />
                          ) : (
                            <Plus className="w-3 h-3 me-1" />
                          )}
                          {i.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isAr ? "متطلبات الامتثال" : "Compliance Requirements"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {config?.complianceOptions?.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`compliance-${c.id}`}
                          checked={platformSpec.complianceRequirements.includes(c.id)}
                          onCheckedChange={() => toggleCompliance(c.id)}
                          data-testid={`checkbox-compliance-${c.id}`}
                        />
                        <Label htmlFor={`compliance-${c.id}`} className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {c.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={() => fullEstimateMutation.mutate(platformSpec)}
                disabled={fullEstimateMutation.isPending || !platformSpec.name}
                className="w-full"
                size="lg"
                data-testid="button-full-estimate"
              >
                {fullEstimateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span className="ms-2">{isAr ? "احسب التقدير الكامل" : "Calculate Full Estimate"}</span>
              </Button>
            </div>

            <div className="space-y-4">
              {fullResult && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{isAr ? "نتيجة التقدير" : "Estimation Result"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <span className="text-sm text-muted-foreground">{isAr ? "درجة التعقيد" : "Complexity Score"}</span>
                          <Badge className={getComplexityColor(fullResult.complexity.level)} data-testid="badge-complexity-level">
                            {isAr ? fullResult.complexity.levelAr : fullResult.complexity.level.toUpperCase()}
                          </Badge>
                        </div>
                        <Progress value={fullResult.complexity.overall} className="h-3" data-testid="progress-complexity-score" />
                        <p className="text-xs text-muted-foreground mt-1">{fullResult.complexity.overall}/100</p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{isAr ? "الوقت" : "Time"}</span>
                          </div>
                          <span className="font-medium" data-testid="text-full-time">{fullResult.resources.time.minDays}-{fullResult.resources.time.maxDays} {isAr ? "يوم" : "days"}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{isAr ? "الفريق" : "Team"}</span>
                          </div>
                          <span className="font-medium" data-testid="text-full-team">{fullResult.resources.team.developers} {isAr ? "مطورين" : "devs"}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{isAr ? "البنية" : "Infra"}</span>
                          </div>
                          <Badge variant="outline" data-testid="badge-infrastructure-tier">
                            {isAr ? fullResult.resources.infrastructure.tierAr : fullResult.resources.infrastructure.tier}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{isAr ? "التكلفة" : "Cost"}</span>
                          </div>
                          <span className="font-medium text-sm" data-testid="text-full-cost">
                            ${fullResult.resources.cost.development.min.toLocaleString()}-${fullResult.resources.cost.development.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {fullResult.warnings.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          {isAr ? "التحذيرات" : "Warnings"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-48">
                          <div className="space-y-3">
                            {fullResult.warnings.map((w: any) => (
                              <div key={w.id} className="p-3 rounded-md bg-muted/50 space-y-1">
                                <div className="flex items-start gap-2">
                                  {getWarningIcon(w.type)}
                                  <p className="text-sm">{isAr ? w.messageAr : w.message}</p>
                                </div>
                                <p className="text-xs text-muted-foreground ps-6">
                                  {isAr ? w.recommendationAr : w.recommendation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {fullResult.recommendations.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          {isAr ? "التوصيات" : "Recommendations"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(isAr ? fullResult.recommendationsAr : fullResult.recommendations).map((r: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {!fullResult && (
                <Card className="bg-muted/30">
                  <CardContent className="py-12 text-center">
                    <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isAr ? "أكمل معلومات المنصة واضغط على زر التقدير" : "Complete platform info and click estimate button"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
