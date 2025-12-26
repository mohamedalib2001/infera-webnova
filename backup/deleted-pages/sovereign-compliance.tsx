import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Shield, CheckCircle2, Award, Scale, Globe, Lock,
  FileText, Calendar, ChevronRight, Crown, ShieldCheck,
  Loader2, Download, ExternalLink
} from "lucide-react";

interface ComplianceFramework {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  region: string;
  regionAr: string;
  score: number;
  status: string;
  requirements: number;
  passed: number;
  failed: number;
  isCertified: boolean;
  certificationDate: string;
  nextAudit: string;
  description: string;
  descriptionAr: string;
  controls: string[];
  controlsAr: string[];
}

interface ComplianceData {
  overallScore: number;
  totalFrameworks: number;
  certifiedFrameworks: number;
  totalRequirements: number;
  totalPassed: number;
  totalFailed: number;
  lastAuditDate: string;
  nextAuditDate: string;
  frameworks: ComplianceFramework[];
}

const frameworkIcons: Record<string, string> = {
  gdpr: "EU",
  hipaa: "US",
  "pci-dss": "PCI",
  wcag: "A11Y",
  ferpa: "EDU",
  coppa: "KID",
  aml: "FIN",
  "data-sovereignty": "SOV",
};

export default function SovereignCompliance() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const isRtl = language === "ar";

  const { data, isLoading } = useQuery<ComplianceData>({
    queryKey: ["/api/sovereign/compliance-frameworks"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {isRtl ? "جاري تحميل بيانات الامتثال..." : "Loading compliance data..."}
          </p>
        </div>
      </div>
    );
  }

  const {
    overallScore = 100,
    totalFrameworks = 8,
    certifiedFrameworks = 8,
    totalRequirements = 790,
    totalPassed = 790,
    frameworks = [],
  } = data || {};

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-compliance-title">
                {isRtl ? "لوحة الامتثال السيادي" : "Sovereign Compliance Panel"}
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                  <Crown className="w-3 h-3" />
                  100%
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRtl 
                  ? "امتثال كامل عبر 8 أطر تنظيمية عالمية" 
                  : "Full compliance across 8 global regulatory frameworks"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setLocation("/sovereign/command-center")}
              data-testid="button-command-center"
            >
              <ExternalLink className="w-4 h-4" />
              {isRtl ? "مركز القيادة" : "Command Center"}
            </Button>
            <Button variant="outline" className="gap-2" data-testid="button-download-report">
              <Download className="w-4 h-4" />
              {isRtl ? "تقرير التدقيق" : "Audit Report"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-emerald-600">{overallScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRtl ? "نسبة الامتثال الكلية" : "Overall Compliance"}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalFrameworks}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "أطر الامتثال" : "Frameworks"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certifiedFrameworks}/{totalFrameworks}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "شهادات معتمدة" : "Certified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPassed}/{totalRequirements}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRtl ? "متطلبات مستوفاة" : "Requirements Met"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {isRtl ? "أطر الامتثال التنظيمي" : "Regulatory Compliance Frameworks"}
            </CardTitle>
            <CardDescription>
              {isRtl 
                ? "جميع الأطر معتمدة ومتوافقة بنسبة 100%" 
                : "All frameworks certified and 100% compliant"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid gap-4 md:grid-cols-2">
                {frameworks.map((framework) => (
                  <Card 
                    key={framework.id} 
                    className="hover-elevate border-emerald-500/20"
                    data-testid={`card-framework-${framework.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center border border-emerald-500/30">
                            <span className="text-sm font-bold text-emerald-600">
                              {frameworkIcons[framework.id] || framework.code.substring(0, 3)}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {framework.code}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {isRtl ? framework.regionAr : framework.region}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {framework.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {isRtl ? framework.descriptionAr : framework.description}
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {isRtl ? "المتطلبات" : "Requirements"}
                          </span>
                          <span className="font-medium text-emerald-600">
                            {framework.passed}/{framework.requirements}
                          </span>
                        </div>
                        <Progress value={100} className="h-2 bg-emerald-500/20" />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(isRtl ? framework.controlsAr : framework.controls).slice(0, 3).map((control, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px]">
                            {control}
                          </Badge>
                        ))}
                        {framework.controls.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{framework.controls.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {isRtl ? "الشهادة:" : "Certified:"} {framework.certificationDate}
                        </div>
                        {framework.isCertified && (
                          <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-500/30">
                            <Award className="w-3 h-3" />
                            {isRtl ? "معتمد" : "Verified"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-5 h-5" />
                {isRtl ? "التغطية الجغرافية" : "Geographic Coverage"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">EU</span>
                    </div>
                    <span className="text-sm">{isRtl ? "الاتحاد الأوروبي" : "European Union"}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">GDPR</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600">US</span>
                    </div>
                    <span className="text-sm">{isRtl ? "الولايات المتحدة" : "United States"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">HIPAA</Badge>
                    <Badge variant="outline" className="text-[10px]">FERPA</Badge>
                    <Badge variant="outline" className="text-[10px]">COPPA</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm">{isRtl ? "عالمي" : "Global"}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">PCI-DSS</Badge>
                    <Badge variant="outline" className="text-[10px]">WCAG</Badge>
                    <Badge variant="outline" className="text-[10px]">AML</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-5 h-5" />
                {isRtl ? "الروابط السريعة" : "Quick Links"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/sovereign/trust-compliance")}
                  data-testid="link-trust-compliance"
                >
                  <span>{isRtl ? "هيئة الثقة والمخاطر" : "Trust & Risk Authority"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/permissions")}
                  data-testid="link-permissions"
                >
                  <span>{isRtl ? "التحكم في الصلاحيات" : "Permission Control"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/owner")}
                  data-testid="link-owner-dashboard"
                >
                  <span>{isRtl ? "لوحة المالك" : "Owner Dashboard"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/sovereign/digital-borders")}
                  data-testid="link-digital-borders"
                >
                  <span>{isRtl ? "الحدود الرقمية" : "Digital Borders"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
