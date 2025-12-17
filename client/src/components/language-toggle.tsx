import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="gap-2 font-medium"
      data-testid="button-language-toggle"
    >
      <Languages className="h-4 w-4" />
      {language === "ar" ? "EN" : "عربي"}
    </Button>
  );
}
