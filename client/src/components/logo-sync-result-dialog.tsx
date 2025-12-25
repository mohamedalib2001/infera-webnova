import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  ExternalLink, 
  Clock, 
  Shield, 
  Sparkles,
  History,
  FileCheck,
  ArrowRight,
  Eye
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { logoTargetLocations, getTargetsByPriority, type LogoTargetLocation } from "@/lib/logo-sync-targets";
import { type LogoVariantType, type PlatformLogoState, getPlatformLogoState } from "@/lib/logo-binding-engine";

export interface LogoSyncResult {
  platformId: string;
  platformName: string;
  platformNameAr?: string;
  syncedAt: Date;
  variants: Array<{
    variant: LogoVariantType;
    version: number;
    previousVersion?: number;
  }>;
  totalVariants: number;
  successCount: number;
  complianceStatus: "compliant" | "partial" | "non-compliant";
  previewSvg?: string;
}

interface LogoSyncResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  syncResult: LogoSyncResult | null;
}

export function LogoSyncResultDialog({ 
  open, 
  onOpenChange, 
  syncResult 
}: LogoSyncResultDialogProps) {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isAr = language === "ar";

  if (!syncResult) return null;

  const targets = getTargetsByPriority();
  const syncedVariants = new Set(syncResult.variants.map(v => v.variant));

  const getVariantVersion = (variant: LogoVariantType): number | undefined => {
    return syncResult.variants.find(v => v.variant === variant)?.version;
  };

  const handleNavigate = (route: string) => {
    onOpenChange(false);
    setLocation(route);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">
                {isAr ? "تمت المزامنة بنجاح" : "Sync Completed Successfully"}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>{isAr ? syncResult.platformNameAr || syncResult.platformName : syncResult.platformName}</span>
                <Badge 
                  variant={syncResult.complianceStatus === "compliant" ? "default" : "secondary"}
                  className={syncResult.complianceStatus === "compliant" 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : ""}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {syncResult.complianceStatus === "compliant" 
                    ? (isAr ? "متوافق بالكامل" : "Fully Compliant")
                    : syncResult.complianceStatus === "partial"
                    ? (isAr ? "متوافق جزئياً" : "Partially Compliant")
                    : (isAr ? "غير متوافق" : "Non-Compliant")}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg mb-4">
          {syncResult.previewSvg && (
            <div 
              className="w-16 h-16 rounded-lg overflow-hidden border border-border"
              dangerouslySetInnerHTML={{ __html: syncResult.previewSvg }}
            />
          )}
          <div className="flex-1 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{syncResult.successCount}</div>
              <div className="text-xs text-muted-foreground">
                {isAr ? "نوع محدّث" : "Variants Updated"}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{syncResult.totalVariants}</div>
              <div className="text-xs text-muted-foreground">
                {isAr ? "إجمالي الأنواع" : "Total Variants"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">{formatTime(syncResult.syncedAt)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(syncResult.syncedAt)}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="py-2">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {isAr ? "المواقع المحدّثة" : "Updated Locations"}
          </h4>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 pb-4">
            {targets.map((target) => {
              const Icon = target.icon;
              const isSynced = syncedVariants.has(target.variant);
              const version = getVariantVersion(target.variant);

              return (
                <Card 
                  key={target.id} 
                  className={`transition-all ${isSynced ? "border-emerald-500/30 bg-emerald-500/5" : "opacity-50"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSynced 
                          ? "bg-emerald-500/10 text-emerald-600" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {isAr ? target.nameAr : target.nameEn}
                          </span>
                          {isSynced && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              v{version}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {isAr ? target.descriptionAr : target.descriptionEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSynced && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleNavigate(target.route)}
                          data-testid={`button-navigate-${target.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />

        <DialogFooter className="pt-4 flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleNavigate("/sovereign-workspace")}
            className="gap-2"
            data-testid="button-view-all-platforms"
          >
            <Eye className="w-4 h-4" />
            {isAr ? "عرض جميع المنصات" : "View All Platforms"}
          </Button>
          <Button
            onClick={() => handleNavigate("/")}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600"
            data-testid="button-go-to-home"
          >
            {isAr ? "الذهاب للصفحة الرئيسية" : "Go to Home Page"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useLogoSyncDialog() {
  const [open, setOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<LogoSyncResult | null>(null);

  const showSyncResult = (result: LogoSyncResult) => {
    setSyncResult(result);
    setOpen(true);
  };

  const createSyncResult = (
    platformId: string,
    platformName: string,
    versions: Record<LogoVariantType, number>,
    previewSvg?: string,
    platformNameAr?: string
  ): LogoSyncResult => {
    const variants = Object.entries(versions).map(([variant, version]) => ({
      variant: variant as LogoVariantType,
      version
    }));

    const state = getPlatformLogoState(platformId);

    return {
      platformId,
      platformName,
      platformNameAr,
      syncedAt: new Date(),
      variants,
      totalVariants: 8,
      successCount: variants.length,
      complianceStatus: state?.complianceStatus || "partial",
      previewSvg
    };
  };

  return {
    open,
    setOpen,
    syncResult,
    showSyncResult,
    createSyncResult,
    DialogComponent: () => (
      <LogoSyncResultDialog 
        open={open} 
        onOpenChange={setOpen} 
        syncResult={syncResult} 
      />
    )
  };
}
