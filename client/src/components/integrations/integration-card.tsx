import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Eye, EyeOff, Loader2, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import type { IntegrationProvider, IntegrationField } from "@/lib/integration-providers";

interface IntegrationCardProps {
  provider: IntegrationProvider;
}

export function IntegrationCard({ provider }: IntegrationCardProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [isEnabled, setIsEnabled] = useState(false);

  const { data: settingsData, isLoading } = useQuery<{ 
    success: boolean; 
    data: { values: Record<string, string>; isEnabled: boolean; hasValues: boolean; lastTestStatus?: string } 
  }>({
    queryKey: ["/api/integrations", provider.key],
  });

  useEffect(() => {
    if (settingsData?.data) {
      setFormValues(settingsData.data.values || {});
      setIsEnabled(settingsData.data.isEnabled);
    }
  }, [settingsData]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/integrations/${provider.key}`, {
        values: formValues,
        isEnabled,
        category: provider.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", provider.key] });
      toast({
        title: isRtl ? "تم الحفظ" : "Saved",
        description: isRtl ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/integrations/test/${provider.key}`, {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations", provider.key] });
      toast({
        title: data.success ? (isRtl ? "نجاح" : "Success") : (isRtl ? "فشل" : "Failed"),
        description: data.message || (isRtl ? "اكتمل الاختبار" : "Test completed"),
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number, type: "cost" | "quality") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= rating
              ? type === "cost"
                ? "text-green-500 fill-green-500"
                : "text-yellow-500 fill-yellow-500"
              : "text-muted-foreground/30"
          }`}
        />
      );
    }
    return stars;
  };

  const toggleFieldVisibility = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const Icon = provider.icon;
  const hasValues = settingsData?.data?.hasValues;
  const lastTestStatus = settingsData?.data?.lastTestStatus;

  return (
    <Card className="relative" data-testid={`card-integration-${provider.key}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-muted ${provider.iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {isRtl ? provider.nameAr : provider.name}
                {provider.url && (
                  <a 
                    href={provider.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`link-provider-${provider.key}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {lastTestStatus === "success" && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {isRtl ? "متصل" : "Connected"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isRtl ? provider.descriptionAr : provider.description}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            data-testid={`switch-enable-${provider.key}`}
          />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{isRtl ? "التكلفة:" : "Cost:"}</span>
            <div className="flex">{renderStars(provider.costRating, "cost")}</div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{isRtl ? "الجودة:" : "Quality:"}</span>
            <div className="flex">{renderStars(provider.qualityRating, "quality")}</div>
          </div>
        </div>

        {provider.pricingNote && (
          <p className="text-xs text-muted-foreground mt-1">
            {isRtl ? provider.pricingNoteAr : provider.pricingNote}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {provider.fields.map((field: IntegrationField) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`${provider.key}-${field.key}`} className="text-xs">
                  {isRtl ? field.labelAr : field.label}
                  {field.required && <span className="text-destructive mr-1">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id={`${provider.key}-${field.key}`}
                    type={field.type === "password" && !visibleFields[field.key] ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="text-sm"
                    data-testid={`input-${provider.key}-${field.key}`}
                  />
                  {field.type === "password" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`absolute top-0 ${isRtl ? "left-0" : "right-0"} h-full px-3`}
                      onClick={() => toggleFieldVisibility(field.key)}
                      data-testid={`button-toggle-${provider.key}-${field.key}`}
                    >
                      {visibleFields[field.key] ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2 flex-wrap">
              <Button
                onClick={() => saveSettings.mutate()}
                disabled={saveSettings.isPending}
                size="sm"
                data-testid={`button-save-${provider.key}`}
              >
                {saveSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isRtl ? "حفظ" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => testConnection.mutate()}
                disabled={testConnection.isPending || !hasValues}
                size="sm"
                data-testid={`button-test-${provider.key}`}
              >
                {testConnection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isRtl ? "اختبار" : "Test"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
