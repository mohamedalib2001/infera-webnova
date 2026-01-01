import { 
  ShoppingCart, Users, Building2, GraduationCap, Heart, Briefcase,
  Gamepad2, MessageSquare, BarChart3, Globe, Smartphone, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectTypeSelectorProps {
  language: 'en' | 'ar';
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ProjectType) => void;
  currentType: string;
}

interface ProjectType {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: any;
  color: string;
  suggestedComponents: string[];
}

const projectTypes: ProjectType[] = [
  {
    id: 'ecommerce',
    name: { en: 'E-Commerce', ar: 'تجارة إلكترونية' },
    description: { en: 'Online store with payments & inventory', ar: 'متجر إلكتروني مع الدفع والمخزون' },
    icon: ShoppingCart,
    color: 'bg-purple-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'user-service', 'payment-service', 'postgresql', 'redis'],
  },
  {
    id: 'saas',
    name: { en: 'SaaS Platform', ar: 'منصة SaaS' },
    description: { en: 'Multi-tenant software as a service', ar: 'برنامج كخدمة متعدد المستأجرين' },
    icon: Building2,
    color: 'bg-blue-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'user-service', 'analytics-service', 'postgresql', 'redis'],
  },
  {
    id: 'healthcare',
    name: { en: 'Healthcare', ar: 'رعاية صحية' },
    description: { en: 'HIPAA-compliant medical systems', ar: 'أنظمة طبية متوافقة مع HIPAA' },
    icon: Heart,
    color: 'bg-red-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'firewall', 'secrets-vault', 'postgresql', 'ssl-cert'],
  },
  {
    id: 'education',
    name: { en: 'Education', ar: 'تعليم' },
    description: { en: 'Learning management systems', ar: 'أنظمة إدارة التعلم' },
    icon: GraduationCap,
    color: 'bg-green-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'user-service', 'notification-service', 'postgresql', 'storage'],
  },
  {
    id: 'enterprise',
    name: { en: 'Enterprise', ar: 'مؤسسي' },
    description: { en: 'Large-scale business applications', ar: 'تطبيقات أعمال واسعة النطاق' },
    icon: Briefcase,
    color: 'bg-gray-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'analytics-service', 'load-balancer', 'kubernetes', 'postgresql'],
  },
  {
    id: 'social',
    name: { en: 'Social Media', ar: 'شبكات اجتماعية' },
    description: { en: 'Community & social platforms', ar: 'منصات مجتمعية واجتماعية' },
    icon: Users,
    color: 'bg-pink-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'user-service', 'notification-service', 'cdn', 'redis', 'mongodb'],
  },
  {
    id: 'gaming',
    name: { en: 'Gaming', ar: 'ألعاب' },
    description: { en: 'Game servers & leaderboards', ar: 'خوادم ألعاب ولوحات المتصدرين' },
    icon: Gamepad2,
    color: 'bg-orange-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'analytics-service', 'redis', 'load-balancer'],
  },
  {
    id: 'chat',
    name: { en: 'Real-time Chat', ar: 'دردشة فورية' },
    description: { en: 'Messaging & communication apps', ar: 'تطبيقات المراسلة والتواصل' },
    icon: MessageSquare,
    color: 'bg-cyan-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'notification-service', 'redis', 'mongodb'],
  },
  {
    id: 'analytics',
    name: { en: 'Analytics Platform', ar: 'منصة تحليلات' },
    description: { en: 'Data visualization & insights', ar: 'تصور البيانات والرؤى' },
    icon: BarChart3,
    color: 'bg-indigo-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'analytics-service', 'elasticsearch', 'postgresql'],
  },
  {
    id: 'api',
    name: { en: 'API Platform', ar: 'منصة API' },
    description: { en: 'Developer APIs & integrations', ar: 'واجهات برمجة للمطورين' },
    icon: Server,
    color: 'bg-teal-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'load-balancer', 'redis', 'postgresql'],
  },
  {
    id: 'mobile',
    name: { en: 'Mobile Backend', ar: 'خلفية موبايل' },
    description: { en: 'Backend for mobile apps', ar: 'خلفية لتطبيقات الموبايل' },
    icon: Smartphone,
    color: 'bg-yellow-500',
    suggestedComponents: ['api-gateway', 'auth-service', 'notification-service', 'storage', 'postgresql'],
  },
  {
    id: 'general',
    name: { en: 'General', ar: 'عام' },
    description: { en: 'Custom architecture', ar: 'بنية مخصصة' },
    icon: Globe,
    color: 'bg-slate-500',
    suggestedComponents: ['api-gateway', 'postgresql'],
  },
];

export function ProjectTypeSelector({
  language,
  isOpen,
  onClose,
  onSelect,
  currentType,
}: ProjectTypeSelectorProps) {
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl" data-testid="project-type-dialog">
        <DialogHeader>
          <DialogTitle>{t('Select Project Type', 'اختر نوع المشروع')}</DialogTitle>
          <DialogDescription data-testid="text-project-type-description">
            {t(
              'Choose a project type to get AI-powered component suggestions',
              'اختر نوع المشروع للحصول على اقتراحات مكونات مدعومة بالذكاء'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {projectTypes.map((type) => (
            <Button
              key={type.id}
              variant={currentType === type.id ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col items-start gap-2 ${
                currentType === type.id ? 'ring-2 ring-cyan-500' : ''
              }`}
              onClick={() => {
                onSelect(type);
                onClose();
              }}
              data-testid={`project-type-${type.id}`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center`}>
                  <type.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-sm">{type.name[language]}</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                {type.description[language]}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {type.suggestedComponents.slice(0, 3).map((comp) => (
                  <Badge key={comp} variant="secondary" className="text-xs">
                    {comp}
                  </Badge>
                ))}
                {type.suggestedComponents.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{type.suggestedComponents.length - 3}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { projectTypes };
export type { ProjectType };
