import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileCode,
  Palette,
  Braces,
  FileJson,
  X,
  Copy,
  Check,
  Play,
  Save,
  Wand2,
  Download,
} from "lucide-react";
import type { CodeFile } from "../utils/ide-types";

const Editor = lazy(() => import("@monaco-editor/react"));

interface EditorWorkspacePaneProps {
  isRtl: boolean;
  codeFiles: CodeFile[];
  activeFileIndex: number;
  setActiveFileIndex: (index: number) => void;
  onFileContentChange: (content: string) => void;
  onRemoveFile: (index: number) => void;
  copied: boolean;
  onCopyCode: () => void;
  onRunCode?: () => void;
  onSaveCode?: () => void;
  onFormatCode?: () => void;
}

export function EditorWorkspacePane({
  isRtl,
  codeFiles,
  activeFileIndex,
  setActiveFileIndex,
  onFileContentChange,
  onRemoveFile,
  copied,
  onCopyCode,
  onRunCode,
  onSaveCode,
  onFormatCode,
}: EditorWorkspacePaneProps) {
  const activeFile = codeFiles[activeFileIndex] || codeFiles[0];

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "html": return <FileCode className="h-3.5 w-3.5 text-orange-500" />;
      case "css": return <Palette className="h-3.5 w-3.5 text-blue-500" />;
      case "javascript": return <Braces className="h-3.5 w-3.5 text-yellow-500" />;
      case "json": return <FileJson className="h-3.5 w-3.5 text-green-500" />;
      default: return <FileCode className="h-3.5 w-3.5" />;
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "html": return "HTML";
      case "css": return "CSS";
      case "javascript": return "JavaScript";
      case "json": return "JSON";
      case "typescript": return "TypeScript";
      default: return lang.toUpperCase();
    }
  };

  const text = {
    run: isRtl ? "تشغيل" : "Run",
    save: isRtl ? "حفظ" : "Save",
    format: isRtl ? "تنسيق" : "Format",
    copy: isRtl ? "نسخ" : "Copy",
    copied: isRtl ? "تم النسخ" : "Copied",
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-muted/30">
        <div className="flex items-center flex-1 overflow-x-auto">
          {codeFiles.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => setActiveFileIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs border-r transition-colors group ${
                activeFileIndex === idx
                  ? "bg-background text-foreground border-b-2 border-b-violet-500"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
              data-testid={`tab-${file.name}`}
            >
              {getFileIcon(file.language)}
              <span>{file.name}</span>
              {codeFiles.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-muted"
                  data-testid={`close-${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRunCode} data-testid="button-run-editor">
                <Play className="h-3.5 w-3.5 text-green-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.run} (F5)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onSaveCode} data-testid="button-save-editor">
                <Save className="h-3.5 w-3.5 text-blue-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.save} (Ctrl+S)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onFormatCode} data-testid="button-format-editor">
                <Wand2 className="h-3.5 w-3.5 text-violet-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{text.format} (Shift+Alt+F)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCopyCode} data-testid="button-copy-editor">
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{copied ? text.copied : text.copy}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground border-b bg-muted/20">
        <span className="text-muted-foreground/60">{isRtl ? "مسار:" : "Path:"}</span>
        <code className="font-mono">{activeFile?.path}</code>
        <Badge variant="outline" className="text-[9px] h-4 ml-auto">
          {getLanguageLabel(activeFile?.language || "")}
        </Badge>
      </div>

      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </div>
        }>
          <Editor
            height="100%"
            language={activeFile?.language || "javascript"}
            value={activeFile?.content || ""}
            onChange={(value) => onFileContentChange(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: true, scale: 1, showSlider: "mouseover" },
              fontSize: 13,
              fontFamily: "JetBrains Mono, Menlo, Monaco, monospace",
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 8 },
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              folding: true,
              renderWhitespace: "selection",
              tabSize: 2,
            }}
          />
        </Suspense>
      </div>

      <div className="flex items-center justify-between px-3 py-1 text-[10px] text-muted-foreground border-t bg-muted/20">
        <div className="flex items-center gap-3">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{getLanguageLabel(activeFile?.language || "")}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {isRtl ? "جاهز" : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}
