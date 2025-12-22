import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Check, 
  FileCode, 
  Palette, 
  Braces,
  Download,
  RotateCcw,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeFile {
  path: string;
  content: string;
  language: string;
}

interface AppCodeEditorProps {
  files: CodeFile[];
  onFilesChange?: (files: CodeFile[]) => void;
  language: "ar" | "en";
  readOnly?: boolean;
  onSave?: (files: CodeFile[]) => void;
}

const translations = {
  ar: {
    noFiles: "لا توجد ملفات للعرض",
    generateFirst: "قم بتوليد الكود بالذكاء الاصطناعي أولاً",
    copied: "تم النسخ!",
    copyCode: "نسخ الكود",
    downloadAll: "تحميل الكل",
    reset: "إعادة تعيين",
    fullscreen: "شاشة كاملة",
    exitFullscreen: "إنهاء الشاشة الكاملة",
    files: "الملفات",
    lines: "أسطر"
  },
  en: {
    noFiles: "No files to display",
    generateFirst: "Generate code with AI first",
    copied: "Copied!",
    copyCode: "Copy code",
    downloadAll: "Download all",
    reset: "Reset",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    files: "Files",
    lines: "lines"
  }
};

export function AppCodeEditor({ 
  files, 
  onFilesChange, 
  language, 
  readOnly = false,
  onSave 
}: AppCodeEditorProps) {
  const t = translations[language];
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "typescript":
      case "javascript":
        return <Braces className="h-4 w-4 text-yellow-500" />;
      case "css":
        return <Palette className="h-4 w-4 text-blue-500" />;
      default:
        return <FileCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMonacoLanguage = (lang: string) => {
    const langMap: Record<string, string> = {
      "typescript": "typescript",
      "javascript": "javascript",
      "tsx": "typescript",
      "jsx": "javascript",
      "css": "css",
      "html": "html",
      "json": "json",
      "dart": "dart",
      "kotlin": "kotlin",
      "swift": "swift",
      "rust": "rust",
      "python": "python"
    };
    return langMap[lang] || "plaintext";
  };

  const handleCopy = async () => {
    if (files[activeFile]) {
      await navigator.clipboard.writeText(files[activeFile].content);
      setCopied(true);
      toast({ title: t.copied });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.path.split("/").pop() || "code.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!readOnly && value !== undefined && onFilesChange) {
      const newFiles = [...files];
      newFiles[activeFile] = { ...newFiles[activeFile], content: value };
      onFilesChange(newFiles);
    }
  };

  if (files.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">{t.noFiles}</p>
        <p className="text-sm text-muted-foreground">{t.generateFirst}</p>
      </Card>
    );
  }

  const currentFile = files[activeFile];
  const lineCount = currentFile?.content.split("\n").length || 0;

  return (
    <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 overflow-x-auto">
          {files.map((file, idx) => (
            <Button
              key={file.path}
              variant={idx === activeFile ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFile(idx)}
              className="gap-1 shrink-0"
              data-testid={`button-file-${idx}`}
            >
              {getFileIcon(file.language)}
              <span className="max-w-32 truncate">{file.path.split("/").pop()}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="gap-1">
            {t.files}: {files.length}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {lineCount} {t.lines}
          </Badge>
          
          <Button size="icon" variant="ghost" onClick={handleCopy} data-testid="button-copy-code">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          
          <Button size="icon" variant="ghost" onClick={handleDownloadAll} data-testid="button-download-all">
            <Download className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className={`flex-1 ${isFullscreen ? "h-[calc(100vh-48px)]" : "h-[400px]"}`}>
        <Editor
          height="100%"
          language={getMonacoLanguage(currentFile?.language || "plaintext")}
          value={currentFile?.content || ""}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
