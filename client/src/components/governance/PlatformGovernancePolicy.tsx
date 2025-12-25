import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, CheckCircle, FileText, Code2, Gauge, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PolicyItem {
  id: string;
  titleEn: string;
  titleAr: string;
  checked: boolean;
}

const CODE_GOVERNANCE_ITEMS: Omit<PolicyItem, "checked">[] = [
  { id: "page-limit", titleEn: "Pages ≤ 400 lines", titleAr: "الصفحات ≤ 400 سطر" },
  { id: "component-limit", titleEn: "Components ≤ 300 lines", titleAr: "المكونات ≤ 300 سطر" },
  { id: "hook-limit", titleEn: "Hooks ≤ 200 lines", titleAr: "Hooks ≤ 200 سطر" },
  { id: "service-limit", titleEn: "Services ≤ 250 lines", titleAr: "الخدمات ≤ 250 سطر" },
  { id: "util-limit", titleEn: "Utils ≤ 150 lines", titleAr: "الأدوات ≤ 150 سطر" },
  { id: "separation", titleEn: "Pages are coordinators only (no business logic)", titleAr: "الصفحات منسقة فقط (بدون منطق أعمال)" },
  { id: "no-monolith", titleEn: "No monolithic files (single responsibility)", titleAr: "لا ملفات ضخمة (مسؤولية واحدة)" },
];

const ROUTING_GOVERNANCE_ITEMS: Omit<PolicyItem, "checked">[] = [
  { id: "sidebar-metadata", titleEn: "Sidebar uses metadata only (no page imports)", titleAr: "القائمة تستخدم البيانات الوصفية فقط" },
  { id: "lazy-pages", titleEn: "ALL pages use React.lazy() loading", titleAr: "جميع الصفحات تستخدم التحميل الكسول" },
  { id: "no-direct-imports", titleEn: "No direct page imports in routing", titleAr: "لا استيراد مباشر للصفحات" },
  { id: "sidebar-speed", titleEn: "Sidebar loads in < 100ms", titleAr: "القائمة تحمل في أقل من 100مللي" },
  { id: "no-sidebar-api", titleEn: "No API calls during sidebar render", titleAr: "لا استدعاءات API أثناء تحميل القائمة" },
  { id: "menu-format", titleEn: "Menu items use standard format", titleAr: "عناصر القائمة بالتنسيق القياسي" },
];

const PERFORMANCE_ITEMS: Omit<PolicyItem, "checked">[] = [
  { id: "lazy-loading", titleEn: "Heavy components use Lazy Loading", titleAr: "المكونات الثقيلة تستخدم التحميل الكسول" },
  { id: "virtualization", titleEn: "Lists > 100 items use Virtualization", titleAr: "القوائم > 100 عنصر تستخدم Virtualization" },
  { id: "load-time", titleEn: "First Load < 2.5 seconds", titleAr: "التحميل الأولي < 2.5 ثانية" },
  { id: "js-execution", titleEn: "JS execution < 1 second", titleAr: "تنفيذ JavaScript < 1 ثانية" },
  { id: "re-renders", titleEn: "Re-renders ≤ 3 per interaction", titleAr: "إعادة الرندر ≤ 3 لكل تفاعل" },
];

const POLICY_ITEMS: Omit<PolicyItem, "checked">[] = [
  ...CODE_GOVERNANCE_ITEMS,
  ...ROUTING_GOVERNANCE_ITEMS,
  ...PERFORMANCE_ITEMS,
];

const STORAGE_KEY = "platform-governance-compliance";

export function PlatformGovernancePolicy() {
  const { toast } = useToast();
  const [items, setItems] = useState<PolicyItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { return POLICY_ITEMS.map(p => ({ ...p, checked: false })); }
    }
    return POLICY_ITEMS.map(p => ({ ...p, checked: false }));
  });

  const allChecked = items.every(i => i.checked);
  const checkedCount = items.filter(i => i.checked).length;
  const compliancePercent = Math.round((checkedCount / items.length) * 100);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleConfirmCompliance = () => {
    if (!allChecked) {
      toast({
        title: "Incomplete Compliance",
        description: "All policy items must be checked before confirming compliance.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Compliance Confirmed",
      description: "Platform governance policy compliance has been confirmed.",
    });
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Platform Governance Policy</CardTitle>
          </div>
          <Badge variant={allChecked ? "default" : "destructive"} className="gap-1">
            {allChecked ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {compliancePercent}% Compliant
          </Badge>
        </div>
        <CardDescription>
          سياسة هندسية إلزامية - غير قابلة للتجاوز
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Code2 className="h-4 w-4 mx-auto mb-1 text-violet-400" />
            <div className="font-medium">Code Limits</div>
            <div className="text-muted-foreground">حدود الأكواد</div>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <Gauge className="h-4 w-4 mx-auto mb-1 text-green-400" />
            <div className="font-medium">Performance</div>
            <div className="text-muted-foreground">الأداء</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lock className="h-4 w-4 mx-auto mb-1 text-amber-400" />
            <div className="font-medium">Mandatory</div>
            <div className="text-muted-foreground">إلزامي</div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                  data-testid={`checkbox-policy-${item.id}`}
                />
                <label htmlFor={item.id} className="flex-1 cursor-pointer text-sm">
                  <div className="font-medium">{item.titleEn}</div>
                  <div className="text-muted-foreground text-xs" dir="rtl">{item.titleAr}</div>
                </label>
                {item.checked && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {checkedCount}/{items.length} items verified
          </div>
          <Button 
            onClick={handleConfirmCompliance}
            disabled={!allChecked}
            className="gap-2"
            data-testid="button-confirm-compliance"
          >
            <FileText className="h-4 w-4" />
            Confirm Compliance
          </Button>
        </div>

        {!allChecked && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" />
              Non-Compliant Status
            </div>
            <p className="mt-1 text-muted-foreground">
              All policy items must be verified before deployment.
            </p>
            <p className="text-muted-foreground" dir="rtl">
              يجب التحقق من جميع بنود السياسة قبل النشر.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
