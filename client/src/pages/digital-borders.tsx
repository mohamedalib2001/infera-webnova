import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, MapPin, Shield, Lock, Eye, AlertTriangle,
  CheckCircle2, XCircle, Server, Database, Cloud,
  Layers, Network, Activity, Settings, Radio,
  Flag, Building, Crown, Scale, Gavel, FileText,
  ArrowUpRight, ArrowDownRight, Clock, Timer,
  Fingerprint, Key, ShieldCheck, ShieldAlert
} from "lucide-react";

interface DataRegion {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  status: 'active' | 'restricted' | 'blocked';
  compliance: string[];
  dataStorageAllowed: boolean;
  dataProcessingAllowed: boolean;
  dataTransferAllowed: boolean;
  activeUsers: number;
  dataVolume: string;
}

interface DataPolicy {
  id: string;
  name: string;
  nameAr: string;
  type: 'residency' | 'transfer' | 'retention' | 'encryption';
  status: 'enforced' | 'pending' | 'draft';
  affectedRegions: string[];
  createdAt: string;
}

export default function DigitalBorders() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState<DataRegion | null>(null);
  const [activeTab, setActiveTab] = useState("regions");

  const regions: DataRegion[] = [
    { id: "1", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", code: "SA", status: "active", compliance: ["PDPL", "NCA"], dataStorageAllowed: true, dataProcessingAllowed: true, dataTransferAllowed: false, activeUsers: 12500, dataVolume: "2.4 TB" },
    { id: "2", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", code: "AE", status: "active", compliance: ["PDPL-UAE"], dataStorageAllowed: true, dataProcessingAllowed: true, dataTransferAllowed: true, activeUsers: 8200, dataVolume: "1.8 TB" },
    { id: "3", name: "European Union", nameAr: "الاتحاد الأوروبي", code: "EU", status: "active", compliance: ["GDPR", "ePrivacy"], dataStorageAllowed: true, dataProcessingAllowed: true, dataTransferAllowed: true, activeUsers: 5600, dataVolume: "3.2 TB" },
    { id: "4", name: "United States", nameAr: "الولايات المتحدة", code: "US", status: "restricted", compliance: ["CCPA", "HIPAA"], dataStorageAllowed: false, dataProcessingAllowed: true, dataTransferAllowed: true, activeUsers: 3400, dataVolume: "0.9 TB" },
    { id: "5", name: "China", nameAr: "الصين", code: "CN", status: "blocked", compliance: ["PIPL"], dataStorageAllowed: false, dataProcessingAllowed: false, dataTransferAllowed: false, activeUsers: 0, dataVolume: "0 TB" },
  ];

  const policies: DataPolicy[] = [
    { id: "1", name: "Saudi Data Residency", nameAr: "إقامة البيانات السعودية", type: "residency", status: "enforced", affectedRegions: ["SA"], createdAt: new Date().toISOString() },
    { id: "2", name: "Cross-Border Transfer Policy", nameAr: "سياسة النقل عبر الحدود", type: "transfer", status: "enforced", affectedRegions: ["SA", "AE", "EU"], createdAt: new Date().toISOString() },
    { id: "3", name: "Data Retention Policy", nameAr: "سياسة الاحتفاظ بالبيانات", type: "retention", status: "pending", affectedRegions: ["SA", "AE", "EU", "US"], createdAt: new Date().toISOString() },
    { id: "4", name: "Encryption at Rest", nameAr: "التشفير في حالة السكون", type: "encryption", status: "enforced", affectedRegions: ["SA", "AE", "EU", "US"], createdAt: new Date().toISOString() },
  ];

  const statusColors: Record<string, string> = {
    active: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    restricted: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    blocked: "text-red-500 bg-red-500/10 border-red-500/30",
    enforced: "bg-emerald-600",
    pending: "bg-amber-600",
    draft: "bg-slate-600",
  };

  const policyTypeIcons: Record<string, any> = {
    residency: MapPin,
    transfer: ArrowUpRight,
    retention: Clock,
    encryption: Lock,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                <Globe className="w-7 h-7 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-digital-borders-title">
                  {language === "ar" ? "الحدود الرقمية ونطاقات البيانات" : "Digital Borders & Data Domains"}
                </h1>
                <p className="text-sm text-slate-400">
                  {language === "ar" ? "التحكم السيادي في إقامة ونقل البيانات" : "Sovereign Control over Data Residency & Transfer"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-cyan-500 border-cyan-500/30 bg-cyan-500/5">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {language === "ar" ? "متوافق" : "COMPLIANT"}
              </Badge>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
                <Globe className="w-3 h-3 mr-1" />
                5 {language === "ar" ? "مناطق" : "REGIONS"}
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-900/50 border-b border-slate-800/30">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-500">3</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مناطق نشطة" : "Active Regions"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-500">1</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "مقيدة" : "Restricted"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
            <CardContent className="p-3 text-center">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-500">1</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "محظورة" : "Blocked"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="p-3 text-center">
              <Database className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-500">8.3 TB</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "حجم البيانات" : "Data Volume"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
            <CardContent className="p-3 text-center">
              <FileText className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500">{policies.filter(p => p.status === 'enforced').length}</p>
              <p className="text-[10px] text-slate-400">{language === "ar" ? "سياسات مفعلة" : "Enforced Policies"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-6 bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger value="regions" className="text-xs gap-1.5" data-testid="tab-regions">
                <Globe className="w-3.5 h-3.5" />
                {language === "ar" ? "المناطق" : "Regions"}
              </TabsTrigger>
              <TabsTrigger value="policies" className="text-xs gap-1.5" data-testid="tab-policies">
                <FileText className="w-3.5 h-3.5" />
                {language === "ar" ? "السياسات" : "Policies"}
              </TabsTrigger>
              <TabsTrigger value="transfers" className="text-xs gap-1.5" data-testid="tab-transfers">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {language === "ar" ? "النقل" : "Transfers"}
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs gap-1.5" data-testid="tab-compliance">
                <Scale className="w-3.5 h-3.5" />
                {language === "ar" ? "الامتثال" : "Compliance"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regions" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-500" />
                      {language === "ar" ? "نطاقات البيانات" : "Data Domains"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {regions.map((region) => (
                          <button
                            key={region.id}
                            onClick={() => setSelectedRegion(region)}
                            className={`w-full p-4 rounded-lg text-left transition-all hover-elevate ${
                              selectedRegion?.id === region.id 
                                ? "bg-cyan-500/10 border border-cyan-500/30" 
                                : "bg-slate-800/30 border border-slate-700/30"
                            }`}
                            data-testid={`button-region-${region.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Flag className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-white">
                                  {language === "ar" ? region.nameAr : region.name}
                                </span>
                                <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                  {region.code}
                                </Badge>
                              </div>
                              <Badge variant="outline" className={`text-[9px] ${statusColors[region.status]}`}>
                                {region.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>{region.activeUsers.toLocaleString()} {language === "ar" ? "مستخدم" : "users"}</span>
                              <span>{region.dataVolume}</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {region.compliance.map((c, i) => (
                                <Badge key={i} variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {selectedRegion ? (
                  <Card className="bg-slate-900/50 border-slate-800/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Flag className="w-5 h-5 text-cyan-500" />
                            {language === "ar" ? selectedRegion.nameAr : selectedRegion.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            {language === "ar" ? "إعدادات إقامة البيانات" : "Data Residency Settings"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={`${statusColors[selectedRegion.status]}`}>
                          {selectedRegion.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <p className="text-2xl font-bold text-white">{selectedRegion.activeUsers.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "المستخدمون النشطون" : "Active Users"}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                          <p className="text-2xl font-bold text-white">{selectedRegion.dataVolume}</p>
                          <p className="text-xs text-slate-400">{language === "ar" ? "حجم البيانات" : "Data Volume"}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">{language === "ar" ? "أذونات البيانات" : "Data Permissions"}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">{language === "ar" ? "تخزين البيانات" : "Data Storage"}</span>
                            </div>
                            <Switch checked={selectedRegion.dataStorageAllowed} disabled data-testid="switch-data-storage" />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                            <div className="flex items-center gap-2">
                              <Server className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">{language === "ar" ? "معالجة البيانات" : "Data Processing"}</span>
                            </div>
                            <Switch checked={selectedRegion.dataProcessingAllowed} disabled data-testid="switch-data-processing" />
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                            <div className="flex items-center gap-2">
                              <ArrowUpRight className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-300">{language === "ar" ? "نقل البيانات" : "Data Transfer"}</span>
                            </div>
                            <Switch checked={selectedRegion.dataTransferAllowed} disabled data-testid="switch-data-transfer" />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid="button-edit-region">
                          <Settings className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تعديل الإعدادات" : "Edit Settings"}
                        </Button>
                        <Button variant="outline" className="flex-1 border-slate-600" data-testid="button-view-audit">
                          <FileText className="w-4 h-4 mr-2" />
                          {language === "ar" ? "سجل التدقيق" : "Audit Log"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-900/50 border-slate-800/50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Globe className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-1">
                        {language === "ar" ? "اختر منطقة" : "Select a Region"}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {language === "ar" ? "اختر منطقة لعرض التفاصيل" : "Choose a region to view details"}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="policies" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      {language === "ar" ? "سياسات البيانات السيادية" : "Sovereign Data Policies"}
                    </CardTitle>
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-create-policy">
                      {language === "ar" ? "إنشاء سياسة" : "Create Policy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policies.map((policy) => {
                      const Icon = policyTypeIcons[policy.type];
                      return (
                        <div 
                          key={policy.id}
                          className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30"
                          data-testid={`policy-${policy.id}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-white">
                                {language === "ar" ? policy.nameAr : policy.name}
                              </span>
                            </div>
                            <Badge className={`text-[9px] ${statusColors[policy.status]}`}>
                              {policy.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{language === "ar" ? "المناطق المتأثرة:" : "Affected regions:"}</span>
                            <div className="flex gap-1">
                              {policy.affectedRegions.map((r, i) => (
                                <Badge key={i} variant="outline" className="text-[9px] text-slate-400 border-slate-600">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfers" className="mt-0">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    {language === "ar" ? "سجل نقل البيانات" : "Data Transfer Log"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-400">
                    <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{language === "ar" ? "لا توجد عمليات نقل حالياً" : "No active transfers"}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-500" />
                      {language === "ar" ? "حالة الامتثال" : "Compliance Status"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "PDPL (Saudi)", score: 98 },
                        { name: "GDPR (EU)", score: 94 },
                        { name: "CCPA (US)", score: 89 },
                        { name: "NCA (Saudi)", score: 96 },
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">{item.name}</span>
                            <span className={`text-sm font-bold ${item.score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {item.score}%
                            </span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {language === "ar" ? "مشكلات الامتثال" : "Compliance Issues"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-white">
                            {language === "ar" ? "تحديث سياسة الاحتفاظ مطلوب" : "Retention policy update required"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {language === "ar" ? "CCPA يتطلب تحديث سياسة الاحتفاظ" : "CCPA requires updated retention policy"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
