import { useState } from 'react';
import { 
  Box, Database, Server, Shield, Zap, Cloud, Users, CreditCard,
  FileCode, Layout, Globe, Lock, Bell, BarChart3, GitBranch,
  Container, Cpu, HardDrive, Network, Workflow, ChevronRight,
  Plus, Search, Layers, Settings, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface BuilderSidebarProps {
  language: 'en' | 'ar';
  onDragStart: (nodeType: string, nodeData: any) => void;
  onAIAction: (action: string) => void;
}

const componentCategories = {
  services: {
    icon: Server,
    label: { en: 'Services', ar: 'الخدمات' },
    items: [
      { id: 'api-gateway', icon: Globe, label: { en: 'API Gateway', ar: 'بوابة API' }, color: 'bg-blue-500' },
      { id: 'auth-service', icon: Lock, label: { en: 'Auth Service', ar: 'خدمة المصادقة' }, color: 'bg-green-500' },
      { id: 'user-service', icon: Users, label: { en: 'User Service', ar: 'خدمة المستخدمين' }, color: 'bg-purple-500' },
      { id: 'payment-service', icon: CreditCard, label: { en: 'Payment Service', ar: 'خدمة الدفع' }, color: 'bg-yellow-500' },
      { id: 'notification-service', icon: Bell, label: { en: 'Notification', ar: 'الإشعارات' }, color: 'bg-pink-500' },
      { id: 'analytics-service', icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' }, color: 'bg-cyan-500' },
    ]
  },
  databases: {
    icon: Database,
    label: { en: 'Databases', ar: 'قواعد البيانات' },
    items: [
      { id: 'postgresql', icon: Database, label: { en: 'PostgreSQL', ar: 'PostgreSQL' }, color: 'bg-blue-600' },
      { id: 'mongodb', icon: Database, label: { en: 'MongoDB', ar: 'MongoDB' }, color: 'bg-green-600' },
      { id: 'redis', icon: Database, label: { en: 'Redis Cache', ar: 'ذاكرة Redis' }, color: 'bg-red-500' },
      { id: 'elasticsearch', icon: Search, label: { en: 'Elasticsearch', ar: 'Elasticsearch' }, color: 'bg-yellow-600' },
    ]
  },
  infrastructure: {
    icon: Cloud,
    label: { en: 'Infrastructure', ar: 'البنية التحتية' },
    items: [
      { id: 'load-balancer', icon: Network, label: { en: 'Load Balancer', ar: 'موازن الحمل' }, color: 'bg-indigo-500' },
      { id: 'container', icon: Container, label: { en: 'Container', ar: 'حاوية' }, color: 'bg-blue-400' },
      { id: 'kubernetes', icon: Cpu, label: { en: 'K8s Cluster', ar: 'عنقود K8s' }, color: 'bg-blue-500' },
      { id: 'storage', icon: HardDrive, label: { en: 'Object Storage', ar: 'تخزين الملفات' }, color: 'bg-gray-500' },
      { id: 'cdn', icon: Globe, label: { en: 'CDN', ar: 'شبكة توصيل' }, color: 'bg-orange-500' },
    ]
  },
  security: {
    icon: Shield,
    label: { en: 'Security', ar: 'الأمان' },
    items: [
      { id: 'firewall', icon: Shield, label: { en: 'Firewall', ar: 'جدار حماية' }, color: 'bg-red-600' },
      { id: 'waf', icon: Shield, label: { en: 'WAF', ar: 'WAF' }, color: 'bg-orange-600' },
      { id: 'secrets-vault', icon: Lock, label: { en: 'Secrets Vault', ar: 'خزنة الأسرار' }, color: 'bg-purple-600' },
      { id: 'ssl-cert', icon: Lock, label: { en: 'SSL/TLS', ar: 'شهادة SSL' }, color: 'bg-green-600' },
    ]
  }
};

const aiActions = [
  { id: 'analyze', icon: Zap, label: { en: 'Analyze Architecture', ar: 'تحليل البنية' }, color: 'text-cyan-400' },
  { id: 'optimize-cost', icon: CreditCard, label: { en: 'Optimize Cost', ar: 'تحسين التكلفة' }, color: 'text-green-400' },
  { id: 'security-check', icon: Shield, label: { en: 'Security Check', ar: 'فحص الأمان' }, color: 'text-red-400' },
  { id: 'auto-scale', icon: Layers, label: { en: 'Auto Scale Config', ar: 'إعداد التوسع' }, color: 'text-purple-400' },
  { id: 'generate-code', icon: FileCode, label: { en: 'Generate Code', ar: 'توليد الكود' }, color: 'text-blue-400' },
  { id: 'compare-arch', icon: GitBranch, label: { en: 'Compare Architectures', ar: 'مقارنة البنيات' }, color: 'text-yellow-400' },
];

export function BuilderSidebar({ language, onDragStart, onAIAction }: BuilderSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleDragStart = (e: React.DragEvent, nodeType: string, nodeData: any) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data: nodeData }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(nodeType, nodeData);
  };

  return (
    <div className="w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">{t('Components', 'المكونات')}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('Search...', 'بحث...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/50"
            data-testid="input-search-components"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <Accordion type="multiple" defaultValue={['services', 'databases', 'ai-actions']} className="space-y-1">
            {Object.entries(componentCategories).map(([key, category]) => (
              <AccordionItem key={key} value={key} className="border-none">
                <AccordionTrigger className="py-2 px-3 hover:bg-muted/50 rounded-lg text-sm font-medium hover:no-underline">
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4 text-muted-foreground" />
                    <span>{category.label[language]}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {category.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-1">
                  <div className="space-y-1 pl-2">
                    {category.items
                      .filter(item => 
                        searchQuery === '' || 
                        item.label.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.label.ar.includes(searchQuery)
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id, { label: item.label[language], color: item.color })}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/70 cursor-grab active:cursor-grabbing transition-colors group"
                          data-testid={`draggable-${item.id}`}
                        >
                          <div className={`w-6 h-6 rounded ${item.color} flex items-center justify-center`}>
                            <item.icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-sm">{item.label[language]}</span>
                          <Plus className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            <AccordionItem value="ai-actions" className="border-none">
              <AccordionTrigger className="py-2 px-3 hover:bg-muted/50 rounded-lg text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {t('AI Actions', 'أدوات الذكاء')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pt-1">
                <div className="space-y-1 pl-2">
                  {aiActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-9"
                      onClick={() => onAIAction(action.id)}
                      data-testid={`ai-action-${action.id}`}
                    >
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="text-sm">{action.label[language]}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/50">
        <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-settings">
          <Settings className="w-4 h-4" />
          {t('Settings', 'الإعدادات')}
        </Button>
      </div>
    </div>
  );
}
