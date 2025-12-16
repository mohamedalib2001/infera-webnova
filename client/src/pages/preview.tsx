import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CodePreview } from "@/components/code-preview";

interface SharedProject {
  name: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

export default function Preview() {
  const params = useParams<{ shareCode: string }>();

  const { data: project, isLoading, error } = useQuery<SharedProject>({
    queryKey: ["/api/share", params.shareCode],
    enabled: !!params.shareCode,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-4xl text-destructive">!</span>
          </div>
          <h1 className="text-2xl font-bold">Preview Not Available</h1>
          <p className="text-muted-foreground">
            This share link may have expired or been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between gap-4 p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <h1 className="font-semibold text-lg">{project.name}</h1>
        </div>
        <div className="text-sm text-muted-foreground">Shared Preview</div>
      </header>

      <div className="flex-1 p-4">
        <CodePreview
          html={project.htmlCode}
          css={project.cssCode}
          js={project.jsCode}
        />
      </div>
    </div>
  );
}
