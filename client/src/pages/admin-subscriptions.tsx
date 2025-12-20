import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Eye, 
  MoreVertical,
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Settings,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { SubscriptionPlan, PlanCapabilities, PlanLimits, PlanRestrictions } from "@shared/schema";

export default function AdminSubscriptions() {
  const { language, isRtl } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("plans");

  const { data: plans, isLoading, refetch } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (data: { planId: string; updates: Partial<SubscriptionPlan> }) => {
      const response = await apiRequest("PATCH", `/api/plans/${data.planId}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث الخطة بنجاح" : "Plan updated successfully",
      });
      setEditingPlanId(null);
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tr = {
    title: language === "ar" ? "إدارة خطط الاشتراك" : "Subscription Plans Management",
    plansTab: language === "ar" ? "الخطط" : "Plans",
    statsTab: language === "ar" ? "الإحصائيات" : "Statistics",
    settingsTab: language === "ar" ? "الإعدادات" : "Settings",
    edit: language === "ar" ? "تعديل" : "Edit",
    save: language === "ar" ? "حفظ" : "Save",
    cancel: language === "ar" ? "إلغاء" : "Cancel",
    delete: language === "ar" ? "حذف" : "Delete",
    pricing: language === "ar" ? "التسعير" : "Pricing",
    priceMonthly: language === "ar" ? "السعر الشهري" : "Monthly Price",
    priceYearly: language === "ar" ? "السعر السنوي" : "Yearly Price",
    limits: language === "ar" ? "الحدود" : "Limits",
    capabilities: language === "ar" ? "القدرات" : "Capabilities",
    restrictions: language === "ar" ? "التقيدات" : "Restrictions",
    features: language === "ar" ? "المميزات" : "Features",
    featuresAr: language === "ar" ? "المميزات (عربي)" : "Features (Arabic)",
    description: language === "ar" ? "الوصف" : "Description",
    descriptionAr: language === "ar" ? "الوصف (عربي)" : "Description (Arabic)",
    popular: language === "ar" ? "الأكثر شعبية" : "Most Popular",
    contactSales: language === "ar" ? "اتصل بفريق المبيعات" : "Contact Sales",
    savingChanges: language === "ar" ? "جاري الحفظ..." : "Saving changes...",
    confirm: language === "ar" ? "تأكيد" : "Confirm",
    areYouSure: language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure?",
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد صلاحية للوصول" : "Access denied"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedPlans = plans?.sort((a, b) => a.sortOrder - b.sortOrder) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            {tr.title}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "إدارة شاملة لجميع خطط الاشتراك والخدمات" : "Complete management of all subscription plans"}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="plans" data-testid="tab-plans">
              <Package className="h-4 w-4 me-2" />
              {tr.plansTab}
            </TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-stats">
              <TrendingUp className="h-4 w-4 me-2" />
              {tr.statsTab}
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 me-2" />
              {tr.settingsTab}
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedPlans.map((plan) => (
                <Card key={plan.id} className="relative" data-testid={`plan-card-admin-${plan.role}`}>
                  {/* Card Header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle>{language === "ar" ? plan.nameAr : plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {language === "ar" ? plan.descriptionAr : plan.description}
                        </CardDescription>
                      </div>
                      {editingPlanId !== plan.id && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => setEditingPlanId(plan.id)}
                              data-testid={`btn-edit-${plan.role}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid={`dialog-edit-${plan.role}`}>
                            <PlanEditForm plan={plan} onSave={() => {}} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {plan.isPopular && (
                        <Badge className="bg-primary">{tr.popular}</Badge>
                      )}
                      {plan.isContactSales && (
                        <Badge variant="outline">{tr.contactSales}</Badge>
                      )}
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4" />
                          {tr.priceMonthly}
                        </span>
                        <span className="font-bold text-lg" data-testid={`price-monthly-${plan.role}`}>
                          ${(plan.priceMonthly / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4" />
                          {tr.priceYearly}
                        </span>
                        <span className="font-bold text-lg" data-testid={`price-yearly-${plan.role}`}>
                          ${(plan.priceYearly / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-blue-500/10 rounded text-center">
                        <div className="text-xs text-muted-foreground">AI Autonomy</div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">
                          {(plan.capabilities as PlanCapabilities)?.aiAutonomy}%
                        </div>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded text-center">
                        <div className="text-xs text-muted-foreground">Max Projects</div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {(plan.limits as PlanLimits)?.maxProjects === -1 ? "∞" : (plan.limits as PlanLimits)?.maxProjects}
                        </div>
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{tr.features}</p>
                      <ul className="space-y-1">
                        {((language === "ar" ? plan.featuresAr : plan.features) as string[])
                          ?.slice(0, 3)
                          .map((feature, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        {((language === "ar" ? plan.featuresAr : plan.features) as string[])?.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{((language === "ar" ? plan.featuresAr : plan.features) as string[]).length - 3} {language === "ar" ? "ميزة أخرى" : "more"}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            data-testid={`btn-view-details-${plan.role}`}
                          >
                            <Eye className="h-4 w-4 me-1" />
                            {language === "ar" ? "التفاصيل الكاملة" : "Full Details"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <PlanDetailsView plan={plan} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            data-testid={`btn-quick-edit-${plan.role}`}
                          >
                            <Edit2 className="h-4 w-4 me-1" />
                            {tr.edit}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <PlanEditForm plan={plan} onSave={() => refetch()} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: language === "ar" ? "إجمالي الخطط" : "Total Plans", value: sortedPlans.length, icon: Package, color: "bg-blue-500" },
                { label: language === "ar" ? "متوسط السعر" : "Avg Price", value: `$${(sortedPlans.reduce((a, b) => a + b.priceMonthly, 0) / sortedPlans.length / 100).toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
                { label: language === "ar" ? "الخطط الشهيرة" : "Popular Plans", value: sortedPlans.filter(p => p.isPopular).length, icon: TrendingUp, color: "bg-purple-500" },
                { label: language === "ar" ? "خيارات التواصل" : "Contact Sales", value: sortedPlans.filter(p => p.isContactSales).length, icon: Users, color: "bg-orange-500" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <div className={`${stat.color} p-3 rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pricing Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "مقارنة التسعير" : "Pricing Comparison"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-2 font-semibold">{language === "ar" ? "الخطة" : "Plan"}</th>
                        <th className="text-center p-2 font-semibold">{tr.priceMonthly}</th>
                        <th className="text-center p-2 font-semibold">{tr.priceYearly}</th>
                        <th className="text-center p-2 font-semibold">AI Autonomy</th>
                        <th className="text-center p-2 font-semibold">Max Projects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlans.map((plan) => (
                        <tr key={plan.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{language === "ar" ? plan.nameAr : plan.name}</td>
                          <td className="p-2 text-center font-semibold">${(plan.priceMonthly / 100).toFixed(2)}</td>
                          <td className="p-2 text-center font-semibold">${(plan.priceYearly / 100).toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <Badge variant="secondary">
                              {(plan.capabilities as PlanCapabilities)?.aiAutonomy}%
                            </Badge>
                          </td>
                          <td className="p-2 text-center">
                            {(plan.limits as PlanLimits)?.maxProjects === -1 ? "∞" : (plan.limits as PlanLimits)?.maxProjects}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{tr.settingsTab}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "إعدادات عامة لنظام الاشتراكات" : "General subscription system settings"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {language === "ar" 
                      ? "الإعدادات المتقدمة قيد التطوير. يمكنك تحرير الخطط مباشرة من تبويب الخطط."
                      : "Advanced settings coming soon. You can edit plans directly from the Plans tab."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PlanEditForm({ plan, onSave }: { plan: SubscriptionPlan; onSave: () => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState(plan);
  const [isSaving, setIsSaving] = useState(false);

  const updatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/plans/${plan.id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar" ? "تم تحديث الخطة بنجاح" : "Plan updated successfully",
      });
      onSave();
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    await updatePlanMutation.mutateAsync();
    setIsSaving(false);
  };

  const tr = {
    save: language === "ar" ? "حفظ التغييرات" : "Save Changes",
    cancel: language === "ar" ? "إلغاء" : "Cancel",
    priceMonthly: language === "ar" ? "السعر الشهري" : "Monthly Price",
    priceYearly: language === "ar" ? "السعر السنوي" : "Yearly Price",
    name: language === "ar" ? "اسم الخطة" : "Plan Name",
    description: language === "ar" ? "الوصف" : "Description",
    isPopular: language === "ar" ? "الأكثر شعبية" : "Most Popular",
    contactSales: language === "ar" ? "اتصل بفريق المبيعات" : "Contact Sales",
  };

  return (
    <div className="space-y-6" data-testid={`edit-form-${plan.role}`}>
      <DialogHeader>
        <DialogTitle>{language === "ar" ? `تعديل ${plan.nameAr}` : `Edit ${plan.name}`}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Pricing Section */}
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold">{language === "ar" ? "التسعير" : "Pricing"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{tr.priceMonthly} ($)</label>
              <Input
                type="number"
                value={formData.priceMonthly / 100}
                onChange={(e) => setFormData({
                  ...formData,
                  priceMonthly: parseInt(e.target.value) * 100
                })}
                data-testid={`input-price-monthly-${plan.role}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{tr.priceYearly} ($)</label>
              <Input
                type="number"
                value={formData.priceYearly / 100}
                onChange={(e) => setFormData({
                  ...formData,
                  priceYearly: parseInt(e.target.value) * 100
                })}
                data-testid={`input-price-yearly-${plan.role}`}
              />
            </div>
          </div>
        </div>

        {/* General Info */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{tr.name} (EN)</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid={`input-name-en-${plan.role}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{tr.name} (AR)</label>
            <Input
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              data-testid={`input-name-ar-${plan.role}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{tr.description} (EN)</label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid={`input-desc-en-${plan.role}`}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{tr.description} (AR)</label>
            <Textarea
              value={formData.descriptionAr || ""}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              data-testid={`input-desc-ar-${plan.role}`}
            />
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              data-testid={`check-popular-${plan.role}`}
            />
            <span className="text-sm">{tr.isPopular}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isContactSales}
              onChange={(e) => setFormData({ ...formData, isContactSales: e.target.checked })}
              data-testid={`check-contact-sales-${plan.role}`}
            />
            <span className="text-sm">{tr.contactSales}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={isSaving || updatePlanMutation.isPending}
            data-testid={`btn-save-${plan.role}`}
          >
            {isSaving || updatePlanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 me-2" />
                {tr.save}
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1" data-testid={`btn-cancel-${plan.role}`}>
            {tr.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PlanDetailsView({ plan }: { plan: SubscriptionPlan }) {
  const { language } = useLanguage();
  const capabilities = plan.capabilities as PlanCapabilities | undefined;
  const limits = plan.limits as PlanLimits | undefined;
  const restrictions = plan.restrictions as PlanRestrictions | undefined;

  return (
    <div className="space-y-6" data-testid={`details-view-${plan.role}`}>
      <DialogHeader>
        <DialogTitle>{language === "ar" ? plan.nameAr : plan.name}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Capabilities */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            {language === "ar" ? "القدرات" : "Capabilities"}
          </h3>
          <div className="space-y-2 bg-muted p-3 rounded-lg text-sm">
            <div className="flex justify-between">
              <span>AI Mode:</span>
              <Badge>{capabilities?.aiMode}</Badge>
            </div>
            <div className="flex justify-between">
              <span>AI Autonomy:</span>
              <Badge variant="secondary">{capabilities?.aiAutonomy}%</Badge>
            </div>
            <div className="flex justify-between">
              <span>Smart Suggestions:</span>
              <span>{capabilities?.smartSuggestions ? "✓" : "✗"}</span>
            </div>
            <div className="flex justify-between">
              <span>AI Copilot:</span>
              <span>{capabilities?.aiCopilot ? "✓" : "✗"}</span>
            </div>
          </div>
        </div>

        {/* Limits */}
        <div>
          <h3 className="font-semibold mb-3">{language === "ar" ? "الحدود" : "Limits"}</h3>
          <div className="space-y-2 bg-muted p-3 rounded-lg text-sm">
            <div className="flex justify-between">
              <span>Max Projects:</span>
              <span className="font-bold">{limits?.maxProjects === -1 ? "∞" : limits?.maxProjects}</span>
            </div>
            <div className="flex justify-between">
              <span>AI Generations/Month:</span>
              <span className="font-bold">{limits?.aiGenerationsPerMonth === -1 ? "∞" : limits?.aiGenerationsPerMonth}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Deployments:</span>
              <span className="font-bold">{limits?.activeDeployments === -1 ? "∞" : limits?.activeDeployments}</span>
            </div>
            <div className="flex justify-between">
              <span>Team Members:</span>
              <span className="font-bold">{limits?.teamMembers === -1 ? "∞" : limits?.teamMembers}</span>
            </div>
          </div>
        </div>

        {/* Restrictions */}
        <div>
          <h3 className="font-semibold mb-3">{language === "ar" ? "التقيدات" : "Restrictions"}</h3>
          <div className="space-y-2 bg-muted p-3 rounded-lg text-sm">
            <div className="flex justify-between">
              <span>Sandbox Mode:</span>
              <span>{restrictions?.sandboxMode ? "✓ Yes" : "✗ No"}</span>
            </div>
            <div className="flex justify-between">
              <span>Watermark:</span>
              <span>{restrictions?.watermark ? "✓ Yes" : "✗ No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
