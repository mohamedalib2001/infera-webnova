import { z } from 'zod';

export const PageVisibilitySchema = z.object({
  pageId: z.string(),
  path: z.string(),
  name: z.string(),
  nameAr: z.string(),
  category: z.string(),
  icon: z.string(),
  isVisible: z.boolean(),
  order: z.number(),
  requiredRole: z.enum(['free', 'basic', 'pro', 'enterprise', 'sovereign', 'owner']).optional(),
  customRoles: z.array(z.string()).optional(),
});

export type PageVisibility = z.infer<typeof PageVisibilitySchema>;

export const SidebarConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  isDefault: z.boolean(),
  pages: z.array(PageVisibilitySchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export type SidebarConfig = z.infer<typeof SidebarConfigSchema>;

export const UserSidebarOverrideSchema = z.object({
  userId: z.string(),
  configId: z.string().optional(),
  overrides: z.array(z.object({
    pageId: z.string(),
    isVisible: z.boolean().optional(),
    order: z.number().optional(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserSidebarOverride = z.infer<typeof UserSidebarOverrideSchema>;

const DEFAULT_PAGES: PageVisibility[] = [
  { pageId: 'home', path: '/', name: 'Home', nameAr: 'الرئيسية', category: 'core', icon: 'Home', isVisible: true, order: 0 },
  { pageId: 'console', path: '/console', name: 'Console', nameAr: 'وحدة التحكم', category: 'development', icon: 'SquareTerminal', isVisible: true, order: 1 },
  { pageId: 'ide', path: '/ide', name: 'Cloud IDE', nameAr: 'بيئة التطوير', category: 'development', icon: 'Terminal', isVisible: true, order: 2 },
  { pageId: 'ai-builder', path: '/ai-builder', name: 'AI App Builder', nameAr: 'منشئ التطبيقات', category: 'ai', icon: 'Sparkles', isVisible: true, order: 3 },
  { pageId: 'smart-suggestions', path: '/smart-suggestions', name: 'Smart Suggestions', nameAr: 'الاقتراحات الذكية', category: 'ai', icon: 'Lightbulb', isVisible: true, order: 4 },
  { pageId: 'deploy', path: '/deploy', name: 'One-Click Deploy', nameAr: 'النشر بنقرة', category: 'deployment', icon: 'Rocket', isVisible: true, order: 5 },
  { pageId: 'ssl', path: '/ssl', name: 'SSL Certificates', nameAr: 'شهادات SSL', category: 'security', icon: 'ShieldCheck', isVisible: true, order: 6 },
  { pageId: 'backend-generator', path: '/backend-generator', name: 'Backend Generator', nameAr: 'مولّد الباك إند', category: 'ai', icon: 'ServerCog', isVisible: true, order: 7 },
  { pageId: 'git', path: '/git', name: 'Version Control', nameAr: 'التحكم بالإصدارات', category: 'development', icon: 'GitBranch', isVisible: true, order: 8 },
  { pageId: 'ai-copilot', path: '/ai-copilot', name: 'AI Copilot', nameAr: 'مساعد AI Copilot', category: 'ai', icon: 'Brain', isVisible: true, order: 9 },
  { pageId: 'testing', path: '/testing', name: 'Testing Generator', nameAr: 'مولّد الاختبارات', category: 'development', icon: 'TestTube2', isVisible: true, order: 10 },
  { pageId: 'marketplace', path: '/marketplace', name: 'Marketplace', nameAr: 'سوق الإضافات', category: 'extensions', icon: 'Store', isVisible: true, order: 11 },
  { pageId: 'collaboration', path: '/collaboration', name: 'Collaboration', nameAr: 'التعاون الجماعي', category: 'team', icon: 'Users', isVisible: true, order: 12 },
  { pageId: 'platform-generator', path: '/platform-generator', name: 'Platform Generator', nameAr: 'مولّد المنصات', category: 'ai', icon: 'TrendingUp', isVisible: true, order: 13 },
  { pageId: 'templates', path: '/templates', name: 'Templates', nameAr: 'القوالب', category: 'builder', icon: 'LayoutTemplate', isVisible: true, order: 14 },
  { pageId: 'chatbot-builder', path: '/chatbot-builder', name: 'Chatbot Builder', nameAr: 'منشئ الروبوتات', category: 'ai', icon: 'Bot', isVisible: true, order: 15 },
  { pageId: 'projects', path: '/projects', name: 'Projects', nameAr: 'المشاريع', category: 'management', icon: 'FolderOpen', isVisible: true, order: 16 },
  { pageId: 'domains', path: '/domains', name: 'Domains', nameAr: 'النطاقات', category: 'management', icon: 'Globe', isVisible: true, order: 17, requiredRole: 'basic' },
  { pageId: 'support', path: '/support', name: 'Support', nameAr: 'الدعم', category: 'management', icon: 'Headphones', isVisible: true, order: 18 },
  { pageId: 'settings', path: '/settings', name: 'Settings', nameAr: 'الإعدادات', category: 'management', icon: 'Settings', isVisible: true, order: 19 },
  { pageId: 'seo-optimizer', path: '/seo-optimizer', name: 'SEO Optimizer', nameAr: 'محسّن SEO', category: 'growth', icon: 'Search', isVisible: true, order: 20 },
  { pageId: 'analytics', path: '/analytics', name: 'Analytics', nameAr: 'التحليلات', category: 'growth', icon: 'BarChart3', isVisible: true, order: 21 },
  { pageId: 'marketing', path: '/marketing', name: 'Marketing', nameAr: 'التسويق', category: 'growth', icon: 'Megaphone', isVisible: true, order: 22 },
  { pageId: 'owner-dashboard', path: '/owner-dashboard', name: 'Owner Dashboard', nameAr: 'لوحة المالك', category: 'owner', icon: 'Crown', isVisible: true, order: 100, requiredRole: 'owner' },
  { pageId: 'owner-quality', path: '/owner/quality', name: 'Quality Assurance', nameAr: 'ضمان الجودة', category: 'owner', icon: 'ShieldCheck', isVisible: true, order: 101, requiredRole: 'owner' },
];

interface ISidebarController {
  getDefaultConfig(): SidebarConfig;
  getConfig(configId: string): SidebarConfig | null;
  getAllConfigs(): SidebarConfig[];
  createConfig(name: string, description: string, pages: PageVisibility[], createdBy: string): SidebarConfig;
  updateConfig(configId: string, updates: Partial<SidebarConfig>): SidebarConfig | null;
  deleteConfig(configId: string): boolean;
  
  getUserPages(userId: string, userRole: string): PageVisibility[];
  setUserOverride(userId: string, overrides: UserSidebarOverride['overrides']): void;
  clearUserOverride(userId: string): void;
  
  setPageVisibility(configId: string, pageId: string, isVisible: boolean): void;
  setPageOrder(configId: string, pageId: string, order: number): void;
  reorderPages(configId: string, pageIds: string[]): void;
  
  resetToDefault(configId: string): SidebarConfig;
}

class SidebarControllerImpl implements ISidebarController {
  private configs: Map<string, SidebarConfig> = new Map();
  private userOverrides: Map<string, UserSidebarOverride> = new Map();
  private defaultConfigId = 'default';

  constructor() {
    const defaultConfig: SidebarConfig = {
      id: this.defaultConfigId,
      name: 'Default Configuration',
      description: 'Default sidebar configuration for all users',
      isDefault: true,
      pages: [...DEFAULT_PAGES],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
    };
    this.configs.set(this.defaultConfigId, defaultConfig);
  }

  getDefaultConfig(): SidebarConfig {
    return this.configs.get(this.defaultConfigId)!;
  }

  getConfig(configId: string): SidebarConfig | null {
    return this.configs.get(configId) || null;
  }

  getAllConfigs(): SidebarConfig[] {
    return Array.from(this.configs.values());
  }

  createConfig(name: string, description: string, pages: PageVisibility[], createdBy: string): SidebarConfig {
    const id = `config-${Date.now()}`;
    const config: SidebarConfig = {
      id,
      name,
      description,
      isDefault: false,
      pages,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    };
    this.configs.set(id, config);
    return config;
  }

  updateConfig(configId: string, updates: Partial<SidebarConfig>): SidebarConfig | null {
    const config = this.configs.get(configId);
    if (!config) return null;

    const updated = {
      ...config,
      ...updates,
      id: config.id,
      isDefault: config.isDefault,
      updatedAt: new Date(),
    };
    this.configs.set(configId, updated);
    return updated;
  }

  deleteConfig(configId: string): boolean {
    if (configId === this.defaultConfigId) return false;
    return this.configs.delete(configId);
  }

  getUserPages(userId: string, userRole: string): PageVisibility[] {
    const defaultConfig = this.getDefaultConfig();
    const override = this.userOverrides.get(userId);
    
    let pages = [...defaultConfig.pages];
    
    if (override?.configId) {
      const customConfig = this.configs.get(override.configId);
      if (customConfig) {
        pages = [...customConfig.pages];
      }
    }

    if (override?.overrides) {
      for (const o of override.overrides) {
        const pageIndex = pages.findIndex(p => p.pageId === o.pageId);
        if (pageIndex >= 0) {
          if (o.isVisible !== undefined) pages[pageIndex].isVisible = o.isVisible;
          if (o.order !== undefined) pages[pageIndex].order = o.order;
        }
      }
    }

    const roleHierarchy = ['free', 'basic', 'pro', 'enterprise', 'sovereign', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);

    return pages
      .filter(p => {
        if (!p.isVisible) return false;
        if (p.requiredRole) {
          const requiredIndex = roleHierarchy.indexOf(p.requiredRole);
          if (userRoleIndex < requiredIndex) return false;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }

  setUserOverride(userId: string, overrides: UserSidebarOverride['overrides']): void {
    const existing = this.userOverrides.get(userId);
    this.userOverrides.set(userId, {
      userId,
      configId: existing?.configId,
      overrides,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    });
  }

  clearUserOverride(userId: string): void {
    this.userOverrides.delete(userId);
  }

  setPageVisibility(configId: string, pageId: string, isVisible: boolean): void {
    const config = this.configs.get(configId);
    if (!config) return;

    const pageIndex = config.pages.findIndex(p => p.pageId === pageId);
    if (pageIndex >= 0) {
      config.pages[pageIndex].isVisible = isVisible;
      config.updatedAt = new Date();
    }
  }

  setPageOrder(configId: string, pageId: string, order: number): void {
    const config = this.configs.get(configId);
    if (!config) return;

    const pageIndex = config.pages.findIndex(p => p.pageId === pageId);
    if (pageIndex >= 0) {
      config.pages[pageIndex].order = order;
      config.updatedAt = new Date();
    }
  }

  reorderPages(configId: string, pageIds: string[]): void {
    const config = this.configs.get(configId);
    if (!config) return;

    pageIds.forEach((id, index) => {
      const pageIndex = config.pages.findIndex(p => p.pageId === id);
      if (pageIndex >= 0) {
        config.pages[pageIndex].order = index;
      }
    });
    config.updatedAt = new Date();
  }

  resetToDefault(configId: string): SidebarConfig {
    if (configId === this.defaultConfigId) {
      const defaultConfig: SidebarConfig = {
        id: this.defaultConfigId,
        name: 'Default Configuration',
        description: 'Default sidebar configuration for all users',
        isDefault: true,
        pages: [...DEFAULT_PAGES],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      };
      this.configs.set(this.defaultConfigId, defaultConfig);
      return defaultConfig;
    }
    
    const config = this.configs.get(configId);
    if (config) {
      config.pages = [...DEFAULT_PAGES];
      config.updatedAt = new Date();
      return config;
    }
    
    return this.getDefaultConfig();
  }

  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) throw new Error('Config not found');
    return JSON.stringify(config, null, 2);
  }

  importConfig(jsonData: string, createdBy: string): SidebarConfig {
    const data = JSON.parse(jsonData);
    const validated = SidebarConfigSchema.parse({
      ...data,
      id: `config-${Date.now()}`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    });
    this.configs.set(validated.id, validated);
    return validated;
  }
}

export const sidebarController = new SidebarControllerImpl();
