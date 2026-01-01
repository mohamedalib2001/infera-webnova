import { Loader2 } from "lucide-react";

interface EditorSkeletonProps {
  text?: string;
}

export function EditorSkeleton({ text = "Loading..." }: EditorSkeletonProps) {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-md">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

export function PanelSkeleton({ text = "Loading panel..." }: EditorSkeletonProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        <span className="text-xs">{text}</span>
      </div>
    </div>
  );
}

export default EditorSkeleton;
