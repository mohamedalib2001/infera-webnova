import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Layout, Brain, Shield, Crown, Settings, Play, Code2, Sparkles } from "lucide-react";

function LoadingFallback({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-slate-950/20 to-indigo-950/20 rounded-lg border">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="w-12 h-12 animate-spin text-violet-400" />
        <span className="text-lg font-medium">{message}</span>
      </div>
    </div>
  );
}

function LaunchPane({ title, description, onLaunch, loading }: { title: string; description: string; onLaunch: () => void; loading: boolean }) {
  if (loading) {
    return <LoadingFallback message={`Loading ${title}...`} />;
  }
  
  return (
    <div className="h-[600px] w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center rounded-lg border border-violet-500/20">
      <Card className="max-w-lg bg-slate-900/80 border-violet-500/30">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Code2 className="h-5 w-5 mx-auto mb-1 text-violet-400" />
              <span className="text-muted-foreground">Full IDE</span>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <span className="text-muted-foreground">Security</span>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-cyan-400" />
              <span className="text-muted-foreground">AI-Powered</span>
            </div>
          </div>
          <Button onClick={onLaunch} size="lg" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600" data-testid="button-launch">
            <Play className="h-5 w-5 mr-2" />
            Launch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SovereignWorkspaceShell() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loadedModules, setLoadedModules] = useState<Record<string, React.ComponentType<any> | null>>({});
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  const loadModule = async (tabName: string, importFn: () => Promise<any>) => {
    if (loadedModules[tabName]) return;
    setLoadingTab(tabName);
    try {
      const mod = await importFn();
      setLoadedModules(prev => ({ ...prev, [tabName]: mod.default || mod.SovereignWorkspacePage || mod }));
    } catch (e) {
      console.error(`Failed to load ${tabName}:`, e);
    } finally {
      setLoadingTab(null);
    }
  };

  const renderTabContent = (tabName: string) => {
    const Component = loadedModules[tabName];
    if (Component) {
      return <Component />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                INFERA WebNova
              </h1>
              <p className="text-sm text-muted-foreground">Sovereign Digital Platform Factory</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="logo-factory" className="flex items-center gap-2" data-testid="tab-logo-factory">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Logo Factory</span>
            </TabsTrigger>
            <TabsTrigger value="sovereign-core" className="flex items-center gap-2" data-testid="tab-sovereign-core">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Core IDE</span>
            </TabsTrigger>
            <TabsTrigger value="nova-ai" className="flex items-center gap-2" data-testid="tab-nova-ai">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Nova AI</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {loadedModules["overview"] ? (
              renderTabContent("overview")
            ) : (
              <LaunchPane 
                title="Sovereign Workspace"
                description="مساحة العمل السيادية - إدارة المنصات والمشاريع"
                onLaunch={() => loadModule("overview", () => import("@/pages/sovereign-workspace"))}
                loading={loadingTab === "overview"}
              />
            )}
          </TabsContent>

          <TabsContent value="logo-factory" className="mt-6">
            {loadedModules["logo-factory"] ? (
              renderTabContent("logo-factory")
            ) : (
              <LaunchPane 
                title="Logo Factory"
                description="مصنع الشعارات - إنشاء وإدارة شعارات المنصات"
                onLaunch={() => loadModule("logo-factory", () => import("@/pages/logo-factory"))}
                loading={loadingTab === "logo-factory"}
              />
            )}
          </TabsContent>

          <TabsContent value="sovereign-core" className="mt-6">
            {loadedModules["sovereign-core"] ? (
              renderTabContent("sovereign-core")
            ) : (
              <LaunchPane 
                title="Sovereign Core IDE"
                description="بيئة التطوير السيادية - بناء وتطوير المنصات"
                onLaunch={() => loadModule("sovereign-core", () => import("@/components/sovereign-core-ide").then(m => ({ default: m.SovereignCoreIDE })))}
                loading={loadingTab === "sovereign-core"}
              />
            )}
          </TabsContent>

          <TabsContent value="nova-ai" className="mt-6">
            {loadedModules["nova-ai"] ? (
              renderTabContent("nova-ai")
            ) : (
              <LaunchPane 
                title="Nova AI"
                description="حاكم القرارات السيادي - الذكاء الاصطناعي السيادي"
                onLaunch={() => loadModule("nova-ai", () => import("@/components/nova-sovereign-workspace").then(m => ({ default: m.NovaSovereignWorkspace })))}
                loading={loadingTab === "nova-ai"}
              />
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            {loadedModules["settings"] ? (
              renderTabContent("settings")
            ) : (
              <LaunchPane 
                title="Settings"
                description="إعدادات المنصة والتكوينات"
                onLaunch={() => loadModule("settings", () => import("@/pages/settings"))}
                loading={loadingTab === "settings"}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
