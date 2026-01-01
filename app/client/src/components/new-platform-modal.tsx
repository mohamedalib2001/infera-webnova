import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Server, Globe, Settings, Shield } from "lucide-react";

interface NewPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  language?: 'ar' | 'en';
}

const translations = {
  ar: {
    title: 'إنشاء منصة جديدة',
    description: 'إنشاء منصة مستقلة بإعداداتها ونطاقها الخاص',
    whatYouGet: 'ما ستحصل عليه:',
    features: [
      { icon: Server, text: 'منصة مستقلة بإعداداتها الخاصة' },
      { icon: Globe, text: 'إمكانية ربط نطاق خاص' },
      { icon: Settings, text: 'تخصيص كامل للعلامة التجارية' },
      { icon: Shield, text: 'أمان وخصوصية منفصلة' },
    ],
    dontShowAgain: 'لا تظهر هذا مرة أخرى',
    cancel: 'إلغاء',
    create: 'إنشاء المنصة',
  },
  en: {
    title: 'Create New Platform',
    description: 'Create an independent platform with its own settings and domain',
    whatYouGet: 'What you will get:',
    features: [
      { icon: Server, text: 'Independent platform with its own settings' },
      { icon: Globe, text: 'Ability to connect a custom domain' },
      { icon: Settings, text: 'Full branding customization' },
      { icon: Shield, text: 'Separate security and privacy' },
    ],
    dontShowAgain: "Don't show this again",
    cancel: 'Cancel',
    create: 'Create Platform',
  },
};

const STORAGE_KEY = 'infera_hide_new_platform_modal';

export function NewPlatformModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  language = 'en' 
}: NewPlatformModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const t = translations[language];

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="new-platform-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm font-medium">{t.whatYouGet}</p>
          <div className="space-y-3">
            {t.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <Checkbox 
            id="dont-show" 
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            data-testid="checkbox-dont-show"
          />
          <Label htmlFor="dont-show" className="text-sm text-muted-foreground cursor-pointer">
            {t.dontShowAgain}
          </Label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            {t.cancel}
          </Button>
          <Button onClick={handleConfirm} data-testid="button-create-platform">
            {t.create}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useNewPlatformModal() {
  const [isOpen, setIsOpen] = useState(false);

  const shouldShowModal = () => {
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  };

  const openModal = () => {
    if (shouldShowModal()) {
      setIsOpen(true);
      return true;
    }
    return false;
  };

  const resetPreference = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { isOpen, setIsOpen, openModal, shouldShowModal, resetPreference };
}
