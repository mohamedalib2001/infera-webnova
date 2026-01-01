import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useLanguage } from "@/hooks/use-language";
import { SyncSettingsCard } from "@/components/github/sync-settings-card";
import { SyncHistoryCard } from "@/components/github/sync-history-card";
import { DeploymentHistoryCard } from "@/components/github/deployment-history-card";
import { ConnectedRepoCard } from "@/components/github/connected-repo-card";
import { ServerConfigForm } from "@/components/github/server-config-form";
import { PlatformSyncCard } from "@/components/github/platform-sync-card";
import { DocLinkButton } from "@/components/doc-link-button";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatar?: string;
  name?: string;
  error?: string;
}

interface SyncSettings {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  lastSyncAt: string | null;
}

export default function GitHubSync() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [currentSettings, setCurrentSettings] = useState<SyncSettings | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery<{ success: boolean } & GitHubStatus>({
    queryKey: ["/api/github/status"],
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiGithub className="h-6 w-6" />
              {isRtl ? "تكامل GitHub" : "GitHub Integration"}
              <DocLinkButton pageId="github-sync" />
            </CardTitle>
            <CardDescription>
              {isRtl ? "ربط حساب GitHub الخاص بك" : "Connect your GitHub account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-semibold mb-2">
                  {isRtl ? "GitHub غير متصل" : "GitHub Not Connected"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isRtl 
                    ? "لمزامنة مشاريعك، يجب عليك ربط حساب GitHub"
                    : "To sync your projects, you need to connect your GitHub account"}
                </p>
                <ol className="text-left text-sm text-muted-foreground space-y-2 mb-6">
                  <li>1. {isRtl ? "اذهب إلى لوحة التكاملات في Replit" : "Go to the Integrations panel in Replit"}</li>
                  <li>2. {isRtl ? "انقر على GitHub" : "Click on GitHub"}</li>
                  <li>3. {isRtl ? "قم بتفويض الوصول" : "Authorize access"}</li>
                  <li>4. {isRtl ? "عد إلى هذه الصفحة" : "Return to this page"}</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 pb-24 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SiGithub className="h-6 w-6" />
            {isRtl ? "مزامنة GitHub" : "GitHub Sync"}
          </h1>
          <p className="text-muted-foreground">
            {isRtl 
              ? "مزامنة مشاريعك مع GitHub ونشرها على خوادم خارجية"
              : "Synchronize your projects with GitHub and deploy to external servers"}
          </p>
        </div>
        
        {status.avatar && (
          <div className="flex items-center gap-3">
            <img 
              src={status.avatar} 
              alt={status.name || status.username} 
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium">{status.name || status.username}</p>
              <a 
                href={`https://github.com/${status.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline"
              >
                @{status.username}
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <SyncSettingsCard 
          isConnected={status.connected} 
          onSettingsChange={setCurrentSettings}
        />
        <PlatformSyncCard />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SyncHistoryCard />
        <DeploymentHistoryCard />
      </div>

      <ConnectedRepoCard />

      <ServerConfigForm 
        currentSyncSettings={currentSettings ? {
          owner: currentSettings.owner,
          repo: currentSettings.repo,
          branch: currentSettings.branch,
        } : null}
      />
      </div>
    </div>
  );
}