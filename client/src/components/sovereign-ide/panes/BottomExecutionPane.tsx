import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  AlertTriangle,
  FileOutput,
  Play,
  Trash2,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { BottomTab } from "../utils/ide-types";

interface Problem {
  type: "error" | "warning" | "info";
  file: string;
  line: number;
  message: string;
}

interface BottomExecutionPaneProps {
  isRtl: boolean;
  terminalOutput: string[];
  terminalInput: string;
  setTerminalInput: (v: string) => void;
  onTerminalCommand: (cmd: string) => void;
  problems?: Problem[];
  outputLogs?: string[];
  activeTab: BottomTab;
  setActiveTab: (tab: BottomTab) => void;
  onClearTerminal?: () => void;
  onClose?: () => void;
}

export function BottomExecutionPane({
  isRtl,
  terminalOutput,
  terminalInput,
  setTerminalInput,
  onTerminalCommand,
  problems = [],
  outputLogs = [],
  activeTab,
  setActiveTab,
  onClearTerminal,
  onClose,
}: BottomExecutionPaneProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const text = {
    terminal: isRtl ? "الطرفية" : "Terminal",
    problems: isRtl ? "المشاكل" : "Problems",
    output: isRtl ? "المخرجات" : "Output",
    typeCommand: isRtl ? "اكتب أمرًا..." : "Type a command...",
    clear: isRtl ? "مسح" : "Clear",
    noProblems: isRtl ? "لا توجد مشاكل" : "No problems detected",
    noOutput: isRtl ? "لا توجد مخرجات" : "No output yet",
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && terminalInput.trim()) {
      onTerminalCommand(terminalInput);
      setTerminalInput("");
    }
  };

  const errorCount = problems.filter(p => p.type === "error").length;
  const warningCount = problems.filter(p => p.type === "warning").length;

  return (
    <div className="h-full flex flex-col bg-background border-t">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BottomTab)} className="h-full flex flex-col">
        <div className="flex items-center justify-between px-2 border-b bg-muted/30">
          <TabsList className="h-8 bg-transparent p-0">
            <TabsTrigger value="terminal" className="text-xs px-3 h-7 data-[state=active]:bg-background" data-testid="tab-terminal">
              <Terminal className="h-3.5 w-3.5 mr-1.5" />
              {text.terminal}
            </TabsTrigger>
            <TabsTrigger value="problems" className="text-xs px-3 h-7 data-[state=active]:bg-background" data-testid="tab-problems">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              {text.problems}
              {(errorCount > 0 || warningCount > 0) && (
                <div className="flex items-center gap-1 ml-1.5">
                  {errorCount > 0 && <Badge variant="destructive" className="text-[9px] h-4 px-1">{errorCount}</Badge>}
                  {warningCount > 0 && <Badge variant="outline" className="text-[9px] h-4 px-1 text-amber-400 border-amber-500/30">{warningCount}</Badge>}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger value="output" className="text-xs px-3 h-7 data-[state=active]:bg-background" data-testid="tab-output">
              <FileOutput className="h-3.5 w-3.5 mr-1.5" />
              {text.output}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1">
            {activeTab === "terminal" && onClearTerminal && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClearTerminal} data-testid="button-clear-terminal">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onClose && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose} data-testid="button-close-bottom">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="terminal" className="flex-1 m-0 flex flex-col">
          <ScrollArea className="flex-1 bg-slate-950">
            <div className="p-3 font-mono text-xs">
              {terminalOutput.map((line, i) => (
                <div key={i} className={`py-0.5 ${
                  line.includes("[Error]") ? "text-red-400" :
                  line.includes("[Warning]") ? "text-amber-400" :
                  line.includes("[Success]") || line.includes("passed") ? "text-green-400" :
                  line.includes("[Nova AI]") ? "text-violet-400" :
                  "text-slate-300"
                }`}>
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2 p-2 border-t bg-slate-900">
            <span className="text-green-400 font-mono text-xs">$</span>
            <Input
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={text.typeCommand}
              className="h-7 text-xs font-mono bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-terminal"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { onTerminalCommand(terminalInput); setTerminalInput(""); }} data-testid="button-run-command">
              <Play className="h-3.5 w-3.5 text-green-400" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="problems" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                <p className="text-sm text-muted-foreground">{text.noProblems}</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {problems.map((problem, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/30 text-xs">
                    {problem.type === "error" ? (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{problem.message}</p>
                      <p className="text-muted-foreground">{problem.file}:{problem.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="output" className="flex-1 m-0">
          <ScrollArea className="h-full bg-slate-950">
            {outputLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">{text.noOutput}</p>
              </div>
            ) : (
              <div className="p-3 font-mono text-xs text-slate-300">
                {outputLogs.map((log, i) => (
                  <div key={i} className="py-0.5">{log}</div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
