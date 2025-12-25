import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface LazyMonacoEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  theme?: string;
  options?: Record<string, unknown>;
  className?: string;
}

function EditorSkeleton() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-md">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  );
}

export function LazyMonacoEditor({
  value,
  language,
  onChange,
  theme = "vs-dark",
  options = {},
  className = "h-full"
}: LazyMonacoEditorProps) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <MonacoEditor
        value={value}
        language={language}
        onChange={onChange}
        theme={theme}
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: "on",
          ...options
        }}
        className={className}
      />
    </Suspense>
  );
}

export default LazyMonacoEditor;
