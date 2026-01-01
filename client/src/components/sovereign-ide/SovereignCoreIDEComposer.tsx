import { useState, lazy, Suspense } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Brain,
  Lock,
  Shield,
  Play,
  Zap,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Settings2,
} from "lucide-react";
import { NovaControlPanel, useNovaFullscreen } from "@/components/nova-control-panel";
import { useNovaChat } from "./hooks/useNovaChat";
import { useEditorWorkspace } from "./hooks/useEditorWorkspace";
import { usePanelVisibility } from "./hooks/usePanelVisibility";
import type { SovereignCoreIDEProps, GroupPlatform } from "./utils/ide-types";

const LeftNavigationPane = lazy(() => import("./panes/LeftNavigationPane").then(m => ({ default: m.LeftNavigationPane })));
const EditorWorkspacePane = lazy(() => import("./panes/EditorWorkspacePane").then(m => ({ default: m.EditorWorkspacePane })));
const PreviewPane = lazy(() => import("./panes/PreviewPane").then(m => ({ default: m.PreviewPane })));
const BottomExecutionPane = lazy(() => import("./panes/BottomExecutionPane").then(m => ({ default: m.BottomExecutionPane })));
const RightUtilitiesPane = lazy(() => import("./panes/RightUtilitiesPane").then(m => ({ default: m.RightUtilitiesPane })));
const NovaChatPane = lazy(() => import("./panes/NovaChatPane").then(m => ({ default: m.NovaChatPane })));

function PaneSkeleton() {
  return (
    <div className="h-full p-4 space-y-3">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SovereignCoreIDEComposer({ workspaceId, isOwner }: SovereignCoreIDEProps) {
  const { isRtl } = useLanguage();
  const { toast } = useToast();
  const novaFullscreen = useNovaFullscreen();
  const [showNovaControlPanel, setShowNovaControlPanel] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["[Nova AI] Terminal initialized", "[Nova AI] Ready for commands..."]);
  const [terminalInput, setTerminalInput] = useState("");

  const panelState = usePanelVisibility();
  const editorState = useEditorWorkspace();
  const chatState = useNovaChat(workspaceId, isOwner, isRtl);

  const { data: groupPlatforms = [] } = useQuery<GroupPlatform[]>({
    queryKey: ["/api/platforms/group"],
    enabled: isOwner,
  });

  const text = {
    title: isRtl ? "Nova AI - مساعد التطوير السيادي" : "Nova AI - Sovereign Development Assistant",
    ownerOnly: isRtl ? "للمالك فقط" : "Owner Only",
    autoSave: isRtl ? "حفظ تلقائي" : "Auto-Save",
    securityNote: isRtl ? "جميع البيانات مشفرة بـ AES-256-GCM" : "All data encrypted with AES-256-GCM",
    run: isRtl ? "تشغيل" : "Run",
    deploy: isRtl ? "نشر" : "Deploy",
    controlPanel: isRtl ? "لوحة التحكم" : "Control Panel",
    minimize: isRtl ? "تصغير" : "Minimize",
    float: isRtl ? "عائم" : "Float",
    fullscreen: isRtl ? "ملء الشاشة" : "Fullscreen",
    accessDenied: isRtl ? "الوصول مرفوض - للمالك فقط" : "Access Denied - Owner Only",
  };

  const handlePlatformSelect = (id: string) => setSelectedPlatformId(id);

  const handleTerminalCommand = (cmd: string) => {
    setTerminalOutput(prev => [...prev, `$ ${cmd}`, `[Nova AI] Executing: ${cmd}...`]);
  };

  const handleCreateConversation = async (title: string) => {
    await chatState.ensureConversation();
    toast({
      title: isRtl ? "تم إنشاء المحادثة" : "Conversation Created",
      description: title,
    });
  };

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-destructive/5 border-destructive/50">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 mx-auto text-destructive/50" />
          <p className="text-lg font-medium text-destructive">{text.accessDenied}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex flex-col bg-background overflow-hidden transition-all duration-300 ${
          novaFullscreen.isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-0" : "h-[calc(100vh-12rem)] rounded-lg border"
        }`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                {text.title}
                <Badge variant="outline" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                  <Lock className="w-3 h-3 mr-1" />
                  {text.ownerOnly}
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                  <Shield className="w-3 h-3 mr-1" />
                  {text.autoSave}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">{text.securityNote}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setShowNovaControlPanel(true)} className="border-violet-500/30 text-violet-300" data-testid="button-nova-control">
              <Settings2 className="h-4 w-4 mr-1" />
              {text.controlPanel}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" variant="outline" onClick={panelState.toggleSidebar} data-testid="toggle-sidebar">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={panelState.toggleBottomPanel} data-testid="toggle-bottom">
              <PanelBottom className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={panelState.toggleRightPanel} data-testid="toggle-right">
              <PanelRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            {novaFullscreen.isFullscreen ? (
              <Button size="sm" variant="outline" onClick={novaFullscreen.minimize} className="border-amber-500/30 text-amber-400" data-testid="button-minimize">
                <Minimize2 className="h-4 w-4 mr-1" />
                {text.minimize}
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={novaFullscreen.toggleFloating} className={`border-cyan-500/30 ${novaFullscreen.isFloating ? "text-cyan-300 bg-cyan-500/20" : "text-cyan-400"}`} data-testid="button-floating">
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  {text.float}
                </Button>
                <Button size="sm" variant="outline" onClick={novaFullscreen.maximize} className="border-violet-500/30 text-violet-300" data-testid="button-maximize">
                  <Maximize2 className="h-4 w-4 mr-1" />
                  {text.fullscreen}
                </Button>
              </>
            )}
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-run">
              <Play className="h-4 w-4 mr-1" />
              {text.run}
            </Button>
            <Button size="sm" variant="secondary" data-testid="button-deploy">
              <Zap className="h-4 w-4 mr-1" />
              {text.deploy}
            </Button>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {panelState.showSidebar && (
            <>
              <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
                <Suspense fallback={<PaneSkeleton />}>
                  <LeftNavigationPane
                    isRtl={isRtl}
                    conversations={chatState.conversations}
                    loadingConversations={chatState.loadingConversations}
                    selectedConversation={chatState.selectedConversation}
                    setSelectedConversation={chatState.setSelectedConversation}
                    groupPlatforms={groupPlatforms}
                    selectedPlatformId={selectedPlatformId}
                    onPlatformSelect={handlePlatformSelect}
                    codeFiles={editorState.codeFiles}
                    activeFileIndex={editorState.activeFileIndex}
                    setActiveFileIndex={editorState.setActiveFileIndex}
                    onCreateConversation={handleCreateConversation}
                  />
                </Suspense>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          <ResizablePanel defaultSize={panelState.showSidebar && panelState.showRightPanel ? 54 : panelState.showSidebar || panelState.showRightPanel ? 72 : 100}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={panelState.showBottomPanel ? 70 : 100}>
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={40} minSize={30}>
                    <Suspense fallback={<PaneSkeleton />}>
                      <NovaChatPane
                        isRtl={isRtl}
                        messages={chatState.messages}
                        loadingMessages={chatState.loadingMessages}
                        newMessage={chatState.newMessage}
                        setNewMessage={chatState.setNewMessage}
                        onSendMessage={chatState.handleSendMessage}
                        isProcessing={chatState.isProcessing}
                        streamingMessage={chatState.streamingMessage}
                        isConnected={chatState.aiWs.isConnected}
                        isAuthenticated={chatState.aiWs.isAuthenticated}
                      />
                    </Suspense>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={25}>
                    <Suspense fallback={<PaneSkeleton />}>
                      <EditorWorkspacePane
                        isRtl={isRtl}
                        codeFiles={editorState.codeFiles}
                        activeFileIndex={editorState.activeFileIndex}
                        setActiveFileIndex={editorState.setActiveFileIndex}
                        onFileContentChange={editorState.updateFileContent}
                        onRemoveFile={editorState.removeFile}
                        copied={editorState.copied}
                        onCopyCode={editorState.copyCode}
                      />
                    </Suspense>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <Suspense fallback={<PaneSkeleton />}>
                      <PreviewPane
                        isRtl={isRtl}
                        previewContent={editorState.generatePreviewContent()}
                        viewport={panelState.viewport}
                        setViewport={panelState.setViewport}
                      />
                    </Suspense>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              {panelState.showBottomPanel && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                    <Suspense fallback={<PaneSkeleton />}>
                      <BottomExecutionPane
                        isRtl={isRtl}
                        terminalOutput={terminalOutput}
                        terminalInput={terminalInput}
                        setTerminalInput={setTerminalInput}
                        onTerminalCommand={handleTerminalCommand}
                        activeTab={panelState.bottomTab}
                        setActiveTab={panelState.setBottomTab}
                        onClearTerminal={() => setTerminalOutput(["[Nova AI] Terminal cleared"])}
                        onClose={panelState.toggleBottomPanel}
                      />
                    </Suspense>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {panelState.showRightPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
                <Suspense fallback={<PaneSkeleton />}>
                  <RightUtilitiesPane
                    isRtl={isRtl}
                    activeTab={panelState.rightTab}
                    setActiveTab={panelState.setRightTab}
                    isConnected={chatState.aiWs.isConnected}
                    isProcessing={chatState.isProcessing}
                  />
                </Suspense>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <NovaControlPanel isOpen={showNovaControlPanel} onClose={() => setShowNovaControlPanel(false)} />
    </>
  );
}
