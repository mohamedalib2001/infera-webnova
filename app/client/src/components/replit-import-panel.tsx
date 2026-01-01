/**
 * Replit Import Panel | لوحة استيراد مشاريع Replit
 * 
 * Interface for:
 * 1. Connecting to Replit account
 * 2. Browsing user's Repls
 * 3. Importing projects to sovereign storage
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link2, Unlink, Download, Search, RefreshCw, FolderGit2, Check,
  AlertCircle, FileCode, Clock, Globe, Lock, ExternalLink, Package
} from "lucide-react";
import { SiReplit } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatus {
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

interface ReplInfo {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language: string;
  isPrivate: boolean;
  url: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ImportHistory {
  repositoryId: string;
  name: string;
  replitUrl?: string;
  importedAt: string;
  filesCount: number;
}

export function ReplitImportPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connect");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectToken, setConnectToken] = useState("");
  const [selectedRepl, setSelectedRepl] = useState<ReplInfo | null>(null);
  const [importName, setImportName] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Connection status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ data: ConnectionStatus }>({
    queryKey: ["/api/replit/status"]
  });

  // List Repls
  const { data: replsData, isLoading: replsLoading, refetch: refetchRepls } = useQuery<{ data: ReplInfo[] }>({
    queryKey: ["/api/replit/repls", searchQuery],
    enabled: statusData?.data?.connected === true
  });

  // Import history
  const { data: historyData } = useQuery<{ data: { imports: ImportHistory[] } }>({
    queryKey: ["/api/replit/history"]
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (accessToken: string) => apiRequest("POST", "/api/replit/connect", { accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit/status"] });
      setConnectToken("");
      setActiveTab("browse");
      toast({
        title: "Connected to Replit | تم الاتصال بـ Replit",
        description: "You can now browse and import your projects"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed | فشل الاتصال",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/replit/disconnect"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit/status"] });
      setActiveTab("connect");
      toast({
        title: "Disconnected | تم قطع الاتصال",
        description: "Disconnected from Replit account"
      });
    }
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data: { replId: string; newName?: string }) => 
      apiRequest("POST", "/api/replit/import", data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/replit/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/git/repos"] });
      setImportDialogOpen(false);
      setSelectedRepl(null);
      setImportName("");
      toast({
        title: "Import successful | تم الاستيراد بنجاح",
        description: `Imported ${response.data?.filesImported || 0} files`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed | فشل الاستيراد",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const status = statusData?.data;
  const repls = replsData?.data || [];
  const imports = historyData?.data?.imports || [];

  const handleImport = () => {
    if (!selectedRepl) return;
    importMutation.mutate({
      replId: selectedRepl.id,
      newName: importName || undefined
    });
  };

  return (
    <div className="space-y-6 p-6" data-testid="replit-import-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SiReplit className="w-6 h-6" />
            Replit Import
          </h2>
          <p className="text-muted-foreground">استيراد مشاريع Replit للاستقلال السيادي</p>
        </div>
        {status?.connected && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500">
              <Check className="w-3 h-3" />
              Connected: @{status.username}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              data-testid="button-disconnect"
            >
              <Unlink className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          </div>
        )}
      </div>

      {/* Steps Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={activeTab === "connect" ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                status?.connected ? 'bg-green-500 text-white' : 'bg-primary/20 text-primary'
              }`}>
                {status?.connected ? <Check className="w-4 h-4" /> : '1'}
              </div>
            </div>
            <h3 className="font-medium">Connect Account</h3>
            <p className="text-xs text-muted-foreground">ربط حساب Replit</p>
          </CardContent>
        </Card>

        <Card className={activeTab === "browse" ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary/20 text-primary">
                2
              </div>
            </div>
            <h3 className="font-medium">Browse Repls</h3>
            <p className="text-xs text-muted-foreground">استعراض المشاريع</p>
          </CardContent>
        </Card>

        <Card className={activeTab === "history" ? "border-primary" : ""}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary/20 text-primary">
                3
              </div>
            </div>
            <h3 className="font-medium">Import & Manage</h3>
            <p className="text-xs text-muted-foreground">استيراد وإدارة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connect" data-testid="tab-connect">
            <Link2 className="w-4 h-4 mr-1" />
            Connect
          </TabsTrigger>
          <TabsTrigger value="browse" disabled={!status?.connected} data-testid="tab-browse">
            <Search className="w-4 h-4 mr-1" />
            Browse Repls
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="w-4 h-4 mr-1" />
            Import History ({imports.length})
          </TabsTrigger>
        </TabsList>

        {/* Connect Tab */}
        <TabsContent value="connect" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect to Replit | الاتصال بـ Replit</CardTitle>
              <CardDescription>
                Enter your Replit API token to browse and import your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status?.connected ? (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-medium">Connected as @{status.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Connected on {status.connectedAt ? new Date(status.connectedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Access Token | رمز الوصول</label>
                    <Input
                      type="password"
                      value={connectToken}
                      onChange={(e) => setConnectToken(e.target.value)}
                      placeholder="Enter your Replit API token..."
                      data-testid="input-token"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your token from Replit Account Settings → API Tokens
                    </p>
                  </div>
                  <Button
                    onClick={() => connectMutation.mutate(connectToken)}
                    disabled={!connectToken || connectMutation.isPending}
                    data-testid="button-connect"
                  >
                    {connectMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-1" />
                    )}
                    Connect to Replit
                  </Button>
                </>
              )}

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">How to get your token | كيفية الحصول على الرمز</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://replit.com/account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">replit.com/account</a></li>
                  <li>Navigate to "Account" settings</li>
                  <li>Find "API Tokens" section</li>
                  <li>Generate a new token with read permissions</li>
                  <li>Copy and paste the token above</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Your Repls | مشاريعك</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search repls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    data-testid="input-search"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => refetchRepls()}
                    data-testid="button-refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${replsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {replsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : repls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No Repls found</p>
                    <p className="text-sm">لم يتم العثور على مشاريع</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {repls.map((repl) => (
                      <div
                        key={repl.id}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        data-testid={`repl-${repl.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {repl.iconUrl ? (
                              <img src={repl.iconUrl} alt="" className="w-10 h-10 rounded" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                <FileCode className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {repl.title}
                                {repl.isPrivate ? (
                                  <Lock className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <Globe className="w-3 h-3 text-muted-foreground" />
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">{repl.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{repl.language}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <a href={repl.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRepl(repl);
                                setImportName(repl.title);
                                setImportDialogOpen(true);
                              }}
                              data-testid={`import-${repl.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Import
                            </Button>
                          </div>
                        </div>
                        {repl.description && (
                          <p className="text-sm text-muted-foreground mt-2">{repl.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History | سجل الاستيراد</CardTitle>
              <CardDescription>
                Previously imported Replit projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {imports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No imports yet</p>
                    <p className="text-sm">لا توجد عمليات استيراد بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {imports.map((imp) => (
                      <div
                        key={imp.repositoryId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <FolderGit2 className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{imp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {imp.filesCount} files • Imported {new Date(imp.importedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {imp.replitUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={imp.replitUrl} target="_blank" rel="noopener noreferrer">
                                <SiReplit className="w-4 h-4 mr-1" />
                                Original
                              </a>
                            </Button>
                          )}
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            Sovereign
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Repl | استيراد مشروع</DialogTitle>
            <DialogDescription>
              Import "{selectedRepl?.title}" to your sovereign repository
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Repository Name | اسم المستودع</label>
              <Input
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder="Enter repository name..."
                data-testid="input-import-name"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <strong>Source:</strong> {selectedRepl?.title} ({selectedRepl?.language})
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The project will be imported to your sovereign internal repository,
                completely independent from Replit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importMutation.isPending}
              data-testid="button-confirm-import"
            >
              {importMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Import to Sovereign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReplitImportPanel;
