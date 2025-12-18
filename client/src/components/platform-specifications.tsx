import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  HeartPulse,
  Landmark,
  GraduationCap,
  Shield,
  Globe,
  Server,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export interface PlatformSpecifications {
  domain: string;
  name: string;
  description: string;
  compliance: string[];
  targetUsers: number;
  availability: string;
  dataSovereignty: string;
  features: string[];
}

interface PlatformSpecificationsFormProps {
  onSubmit: (specs: PlatformSpecifications) => void;
  isLoading?: boolean;
}

const domains = [
  { value: "financial", icon: Building2, color: "text-emerald-500" },
  { value: "healthcare", icon: HeartPulse, color: "text-rose-500" },
  { value: "government", icon: Landmark, color: "text-blue-500" },
  { value: "education", icon: GraduationCap, color: "text-amber-500" },
  { value: "enterprise", icon: Server, color: "text-violet-500" },
];

const complianceStandards = [
  { value: "PCI-DSS", domains: ["financial"] },
  { value: "AML", domains: ["financial"] },
  { value: "KYC", domains: ["financial"] },
  { value: "HIPAA", domains: ["healthcare"] },
  { value: "GDPR", domains: ["healthcare", "enterprise", "financial"] },
  { value: "WCAG 2.1", domains: ["government", "education"] },
  { value: "FERPA", domains: ["education"] },
  { value: "ISO 27001", domains: ["enterprise", "financial", "government"] },
  { value: "SOC 2", domains: ["enterprise", "financial"] },
];

const availabilityTiers = [
  { value: "99.9%", label: { ar: "99.9% - قياسي", en: "99.9% - Standard" } },
  { value: "99.95%", label: { ar: "99.95% - عالي", en: "99.95% - High" } },
  { value: "99.99%", label: { ar: "99.99% - مؤسسي", en: "99.99% - Enterprise" } },
  { value: "99.999%", label: { ar: "99.999% - حرج", en: "99.999% - Mission Critical" } },
];

const sovereigntyOptions = [
  { value: "local", label: { ar: "محلي - نفس الدولة", en: "Local - Same Country" } },
  { value: "regional", label: { ar: "إقليمي - نفس المنطقة", en: "Regional - Same Region" } },
  { value: "global", label: { ar: "عالمي - أي مكان", en: "Global - Anywhere" } },
];

export function PlatformSpecificationsForm({ onSubmit, isLoading }: PlatformSpecificationsFormProps) {
  const { t, language } = useLanguage();
  const [specs, setSpecs] = useState<PlatformSpecifications>({
    domain: "",
    name: "",
    description: "",
    compliance: [],
    targetUsers: 1000,
    availability: "99.9%",
    dataSovereignty: "local",
    features: [],
  });

  const handleDomainChange = (domain: string) => {
    const relevantCompliance = complianceStandards
      .filter((c) => c.domains.includes(domain))
      .map((c) => c.value);
    setSpecs({ ...specs, domain, compliance: relevantCompliance.slice(0, 2) });
  };

  const toggleCompliance = (standard: string) => {
    if (specs.compliance.includes(standard)) {
      setSpecs({ ...specs, compliance: specs.compliance.filter((c) => c !== standard) });
    } else {
      setSpecs({ ...specs, compliance: [...specs.compliance, standard] });
    }
  };

  const handleSubmit = () => {
    onSubmit(specs);
  };

  const relevantCompliance = specs.domain
    ? complianceStandards.filter((c) => c.domains.includes(specs.domain))
    : complianceStandards;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          {language === "ar" ? "مواصفات المنصة السيادية" : "Sovereign Platform Specifications"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{language === "ar" ? "مجال المنصة" : "Platform Domain"}</Label>
          <div className="grid grid-cols-5 gap-2">
            {domains.map((domain) => {
              const Icon = domain.icon;
              const isSelected = specs.domain === domain.value;
              return (
                <Button
                  key={domain.value}
                  variant={isSelected ? "default" : "outline"}
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => handleDomainChange(domain.value)}
                  data-testid={`button-domain-${domain.value}`}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? "text-white" : domain.color}`} />
                  <span className="text-xs">{t(`domain.${domain.value}`)}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">
              {language === "ar" ? "اسم المنصة" : "Platform Name"}
            </Label>
            <Input
              id="platformName"
              value={specs.name}
              onChange={(e) => setSpecs({ ...specs, name: e.target.value })}
              placeholder={language === "ar" ? "اسم المنصة..." : "Platform name..."}
              data-testid="input-platform-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetUsers">
              {language === "ar" ? "المستخدمين المتوقعين" : "Expected Users"}
            </Label>
            <Input
              id="targetUsers"
              type="number"
              min={1}
              value={specs.targetUsers}
              onChange={(e) => setSpecs({ ...specs, targetUsers: parseInt(e.target.value) || 1000 })}
              data-testid="input-target-users"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {language === "ar" ? "وصف المنصة" : "Platform Description"}
          </Label>
          <Textarea
            id="description"
            value={specs.description}
            onChange={(e) => setSpecs({ ...specs, description: e.target.value })}
            placeholder={language === "ar" ? "صف المنصة بالتفصيل..." : "Describe the platform in detail..."}
            rows={3}
            data-testid="input-description"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            {language === "ar" ? "متطلبات الامتثال" : "Compliance Requirements"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {relevantCompliance.map((standard) => (
              <div key={standard.value} className="flex items-center gap-2">
                <Checkbox
                  id={`compliance-${standard.value}`}
                  checked={specs.compliance.includes(standard.value)}
                  onCheckedChange={() => toggleCompliance(standard.value)}
                />
                <Label htmlFor={`compliance-${standard.value}`} className="text-sm cursor-pointer">
                  {standard.value}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              {language === "ar" ? "نسبة التوفر" : "Availability"}
            </Label>
            <Select
              value={specs.availability}
              onValueChange={(value) => setSpecs({ ...specs, availability: value })}
            >
              <SelectTrigger data-testid="select-availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availabilityTiers.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-500" />
              {language === "ar" ? "سيادة البيانات" : "Data Sovereignty"}
            </Label>
            <Select
              value={specs.dataSovereignty}
              onValueChange={(value) => setSpecs({ ...specs, dataSovereignty: value })}
            >
              <SelectTrigger data-testid="select-sovereignty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sovereigntyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {specs.compliance.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground w-full mb-1">
              {language === "ar" ? "الامتثال المحدد:" : "Selected Compliance:"}
            </span>
            {specs.compliance.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!specs.domain || !specs.name || isLoading}
          className="w-full"
          size="lg"
          data-testid="button-create-platform"
        >
          <Sparkles className="h-4 w-4 me-2" />
          {isLoading
            ? language === "ar"
              ? "جاري إنشاء المنصة..."
              : "Creating Platform..."
            : language === "ar"
            ? "إنشاء المنصة السيادية"
            : "Create Sovereign Platform"}
        </Button>
      </CardContent>
    </Card>
  );
}
