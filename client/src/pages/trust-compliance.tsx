import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Scale, AlertTriangle, CheckCircle2, XCircle,
  Clock, Eye, FileText, Activity, TrendingUp, TrendingDown,
  BarChart3, PieChart, Lock, Fingerprint, Key, ShieldCheck,
  ShieldAlert, AlertOctagon, Radio, Crown, Gauge, Target
} from "lucide-react";

interface RiskAssessment {
  id: string;
  category: string;
  categoryAr: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  issues: number;
  lastUpdated: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  status: 'compliant' | 'partial' | 'non_compliant';
  requirements: number;
  passed: number;
  failed: number;
}

export default function TrustCompliance() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const riskAssessments: RiskAssessment[] = [
    { id: "1", category: "Security", categoryAr: "الأمان", score: 92, trend: "up", issues: 2, lastUpdated: new Date().toISOString() },
    { id: "2", category: "Data Privacy", categoryAr: "خصوصية البيانات", score: 88, trend: "stable", issues: 4, lastUpdated: new Date().toISOString() },
    { id: "3", category: "Access Control", categoryAr: "التحكم في الوصول", score: 95, trend: "up", issues: 1, lastUpdated: new Date().toISOString() },
    { id: "4", category: "Infrastructure", categoryAr: "البنية التحتية", score: 78, trend: "down", issues: 7, lastUpdated: new Date().toISOString() },
    { id: "5", category: "API Security", categoryAr: "أمان API", score: 85, trend: "stable", issues: 3, lastUpdated: new Date().toISOString() },
  ];

  const frameworks: ComplianceFramework[] = [
    { id: "1", name: "Saudi PDPL", nameAr: "نظام حماية البيانات السعودي", score: 96, status: "compliant", requirements: 45, passed: 43, failed: 2 },
    { id: "2", name: "GDPR", nameAr: "اللائحة العامة لحماية البيانات", score: 89, status: "partial", requirements: 99, passed: 88, failed: 11 },
    { id: "3", name: "NCA ECC", nameAr: "ضوابط الأمن السيبراني", score: 94, status: "compliant", requirements: 114, passed: 107, failed: 7 },
    { id: "4", name: "ISO 27001", nameAr: "آيزو 27001", score: 91, status: "compliant", requirements: 114, passed: 104, failed: 10 },
    { id: "5", name: "PCI-DSS", nameAr: "معيار أمان بيانات الدفع", score: 82, status: "partial", requirements: 78, passed: 64, failed: 14 },
  ];

  const overallRiskScore = Math.round(riskAssessments.reduce((sum, r) => sum + r.score, 0) / riskAssessments.length);
  const overallComplianceScore = Math.round(frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
                <Scale className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-trust-compliance-title">
                  {language === "ar" ? "هيئة الثقة والمخاطر والامتثال" : "Trust, Risk & Compliance Authority"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "تقييم المخاطر ومراقبة الامتثال المستمر" : "Risk Assessment & Continuous Compliance Monitoring"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${overallRiskScore >= 85 ? 'text-emerald-500 border-emerald-500/30' : overallRiskScore >= 70 ? 'text-amber-500 border-amber-500/30' : 'text-red-500 border-red-500/30'}`}>
                <Shield className="w-3 h-3 mr-1" />
                {language === "ar" ? "درجة المخاطر" : "Risk Score"}: {overallRiskScore}%
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <Gauge className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">{overallRiskScore}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "درجة الأمان" : "Security Score"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Scale className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">{overallComplianceScore}%</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "الامتثال" : "Compliance"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">{riskAssessments.reduce((sum, r) => sum + r.issues, 0)}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مشكلات نشطة" : "Active Issues"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-3 text-center">
              <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500">{frameworks.length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "أطر الامتثال" : "Frameworks"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger value="overview" className="text-xs gap-1.5" data-testid="tab-risk-overview">
                <Gauge className="w-3.5 h-3.5" />
                {language === "ar" ? "نظرة عامة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="risks" className="text-xs gap-1.5" data-testid="tab-risks">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === "ar" ? "المخاطر" : "Risks"}
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs gap-1.5" data-testid="tab-compliance-frameworks">
                <Scale className="w-3.5 h-3.5" />
                {language === "ar" ? "الامتثال" : "Compliance"}
              </TabsTrigger>
              <TabsTrigger value="audits" className="text-xs gap-1.5" data-testid="tab-audits">
                <Eye className="w-3.5 h-3.5" />
                {language === "ar" ? "التدقيق" : "Audits"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {language === "ar" ? "تقييم المخاطر" : "Risk Assessment"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskAssessments.map((assessment) => (
                        <div key={assessment.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">
                              {language === "ar" ? assessment.categoryAr : assessment.category}
                            </span>
                            <div className="flex items-center gap-2">
                              {assessment.trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                              ) : assessment.trend === 'down' ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : (
                                <Activity className="w-3 h-3 text-slate-400" />
                              )}
                              <span className={`text-sm font-bold ${
                                assessment.score >= 85 ? 'text-emerald-500' : 
                                assessment.score >= 70 ? 'text-amber-500' : 'text-red-500'
                              }`}>
                                {assessment.score}%
                              </span>
                            </div>
                          </div>
                          <Progress value={assessment.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      {language === "ar" ? "حالة الامتثال" : "Compliance Status"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {frameworks.map((framework) => (
                        <div key={framework.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {language === "ar" ? framework.nameAr : framework.name}
                            </span>
                            <Badge className={`text-[9px] ${
                              framework.status === 'compliant' ? 'bg-emerald-600' :
                              framework.status === 'partial' ? 'bg-amber-600' : 'bg-red-600'
                            }`}>
                              {framework.status === 'compliant' ? (language === "ar" ? "متوافق" : "COMPLIANT") :
                               framework.status === 'partial' ? (language === "ar" ? "جزئي" : "PARTIAL") :
                               (language === "ar" ? "غير متوافق" : "NON-COMPLIANT")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="text-emerald-500">{framework.passed} {language === "ar" ? "ناجح" : "passed"}</span>
                            <span className="text-red-500">{framework.failed} {language === "ar" ? "فاشل" : "failed"}</span>
                            <span>{framework.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {language === "ar" ? "المخاطر المكتشفة" : "Identified Risks"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {[
                        { title: "Unpatched Server Vulnerabilities", titleAr: "ثغرات خادم غير مصححة", severity: "high", category: "Infrastructure" },
                        { title: "Weak Password Policies", titleAr: "سياسات كلمة مرور ضعيفة", severity: "medium", category: "Access Control" },
                        { title: "Missing Encryption on Storage", titleAr: "تشفير مفقود في التخزين", severity: "critical", category: "Data Privacy" },
                        { title: "API Rate Limiting Not Enforced", titleAr: "تحديد معدل API غير مفعل", severity: "medium", category: "API Security" },
                        { title: "Outdated SSL Certificates", titleAr: "شهادات SSL منتهية", severity: "low", category: "Security" },
                      ].map((risk, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${
                          risk.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                          risk.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
                          risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                          'bg-slate-800/30 border-slate-700/30'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {language === "ar" ? risk.titleAr : risk.title}
                            </span>
                            <Badge variant="outline" className={`text-[9px] ${
                              risk.severity === 'critical' ? 'text-red-500 border-red-500/30' :
                              risk.severity === 'high' ? 'text-orange-500 border-orange-500/30' :
                              risk.severity === 'medium' ? 'text-yellow-500 border-yellow-500/30' :
                              'text-slate-400 border-slate-600'
                            }`}>
                              {risk.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                            {risk.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                {frameworks.map((framework) => (
                  <Card key={framework.id} className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-white">
                          {language === "ar" ? framework.nameAr : framework.name}
                        </CardTitle>
                        <Badge className={`${
                          framework.status === 'compliant' ? 'bg-emerald-600' :
                          framework.status === 'partial' ? 'bg-amber-600' : 'bg-red-600'
                        }`}>
                          {framework.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={framework.score} className="h-3" />
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-2 rounded bg-slate-800/50">
                            <p className="text-lg font-bold text-white">{framework.requirements}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "المتطلبات" : "Requirements"}</p>
                          </div>
                          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-lg font-bold text-emerald-500">{framework.passed}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "ناجح" : "Passed"}</p>
                          </div>
                          <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                            <p className="text-lg font-bold text-red-500">{framework.failed}</p>
                            <p className="text-[10px] text-slate-400">{language === "ar" ? "فاشل" : "Failed"}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full border-slate-600" data-testid={`button-view-framework-${framework.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {language === "ar" ? "عرض التفاصيل" : "View Details"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audits" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    {language === "ar" ? "سجل التدقيق" : "Audit Log"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {[
                        { action: "Security scan completed", actionAr: "اكتمل فحص الأمان", type: "scan", time: "5 mins ago" },
                        { action: "Compliance check: PDPL", actionAr: "فحص الامتثال: PDPL", type: "compliance", time: "1 hour ago" },
                        { action: "Risk assessment updated", actionAr: "تم تحديث تقييم المخاطر", type: "assessment", time: "3 hours ago" },
                        { action: "Policy violation detected", actionAr: "تم اكتشاف انتهاك سياسة", type: "violation", time: "6 hours ago" },
                        { action: "Certificate renewal", actionAr: "تجديد الشهادة", type: "maintenance", time: "1 day ago" },
                      ].map((audit, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center gap-3">
                          <Eye className="w-4 h-4 text-slate-400" />
                          <div className="flex-1">
                            <p className="text-sm text-white">{language === "ar" ? audit.actionAr : audit.action}</p>
                            <p className="text-[10px] text-slate-500">{audit.time}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                            {audit.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
