import { Badge } from "@/components/ui/badge";
import { Globe, Shield, Server, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformStatusBarProps {
  platformStatus: 'active' | 'draft' | 'building' | 'error';
  domainStatus: 'connected' | 'not_connected' | 'verifying' | 'error';
  sslStatus: 'active' | 'pending' | 'error' | 'none';
  language?: 'ar' | 'en';
  platformName?: string;
}

const translations = {
  ar: {
    platform: 'المنصة',
    domain: 'النطاق',
    ssl: 'SSL',
    active: 'نشط',
    draft: 'مسودة',
    building: 'قيد الإنشاء',
    error: 'خطأ',
    connected: 'متصل',
    not_connected: 'غير متصل',
    verifying: 'قيد التحقق',
    pending: 'معلق',
    none: 'غير مفعل',
  },
  en: {
    platform: 'Platform',
    domain: 'Domain',
    ssl: 'SSL',
    active: 'Active',
    draft: 'Draft',
    building: 'Building',
    error: 'Error',
    connected: 'Connected',
    not_connected: 'Not Connected',
    verifying: 'Verifying',
    pending: 'Pending',
    none: 'None',
  },
};

function StatusIcon({ status }: { status: 'success' | 'warning' | 'error' | 'pending' }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
    case 'warning':
      return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
    case 'error':
      return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    case 'pending':
      return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function getStatusType(status: string): 'success' | 'warning' | 'error' | 'pending' {
  switch (status) {
    case 'active':
    case 'connected':
      return 'success';
    case 'draft':
    case 'verifying':
    case 'pending':
    case 'building':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'pending';
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
    case 'connected':
      return 'default';
    case 'draft':
    case 'verifying':
    case 'pending':
    case 'building':
      return 'secondary';
    case 'error':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function PlatformStatusBar({
  platformStatus,
  domainStatus,
  sslStatus,
  language = 'en',
  platformName,
}: PlatformStatusBarProps) {
  const t = translations[language];

  const items = [
    {
      icon: Server,
      label: t.platform,
      status: platformStatus,
      statusText: t[platformStatus as keyof typeof t] || platformStatus,
    },
    {
      icon: Globe,
      label: t.domain,
      status: domainStatus,
      statusText: t[domainStatus as keyof typeof t] || domainStatus,
    },
    {
      icon: Shield,
      label: t.ssl,
      status: sslStatus,
      statusText: t[sslStatus as keyof typeof t] || sslStatus,
    },
  ];

  return (
    <div 
      className="flex items-center gap-4 p-2 px-4 bg-muted/50 border-b text-sm flex-wrap"
      data-testid="platform-status-bar"
    >
      {platformName && (
        <span className="font-medium text-foreground" data-testid="platform-name">
          {platformName}
        </span>
      )}
      
      <div className="flex items-center gap-3 flex-wrap">
        {items.map((item) => (
          <div 
            key={item.label} 
            className="flex items-center gap-1.5"
            data-testid={`status-${item.label.toLowerCase()}`}
          >
            <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{item.label}:</span>
            <Badge 
              variant={getStatusVariant(item.status)} 
              className="text-xs py-0 px-1.5 gap-1"
            >
              <StatusIcon status={getStatusType(item.status)} />
              {item.statusText}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function usePlatformStatus(platformId?: string) {
  return {
    platformStatus: 'active' as const,
    domainStatus: 'not_connected' as const,
    sslStatus: 'none' as const,
    isLoading: false,
  };
}
