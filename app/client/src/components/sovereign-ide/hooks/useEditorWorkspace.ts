import { useState } from "react";
import type { CodeFile } from "../utils/ide-types";

const DEFAULT_FILES: CodeFile[] = [
  {
    name: "index.html",
    path: "/index.html",
    content: `<!DOCTYPE html>
<html>
<head>
  <title>Sovereign Platform</title>
</head>
<body>
  <h1>Welcome to Sovereign Core</h1>
</body>
</html>`,
    language: "html",
  },
  {
    name: "styles.css",
    path: "/styles.css",
    content: `body {
  font-family: system-ui;
  background: #0a0a0a;
  color: white;
}`,
    language: "css",
  },
  {
    name: "app.js",
    path: "/app.js",
    content: `// Sovereign Core Application
console.log('Sovereign Core initialized');`,
    language: "javascript",
  },
];

export function useEditorWorkspace() {
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>(DEFAULT_FILES);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeFile = codeFiles[activeFileIndex] || codeFiles[0];

  const updateFileContent = (content: string) => {
    setCodeFiles((prev) => {
      const newFiles = [...prev];
      newFiles[activeFileIndex].content = content;
      return newFiles;
    });
  };

  const addFile = (file: CodeFile) => {
    setCodeFiles((prev) => [...prev, file]);
    setActiveFileIndex(codeFiles.length);
  };

  const removeFile = (index: number) => {
    if (codeFiles.length <= 1) return;
    setCodeFiles((prev) => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= index && activeFileIndex > 0) {
      setActiveFileIndex((prev) => prev - 1);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  };

  const generatePreviewContent = () => {
    const htmlFile = codeFiles.find((f) => f.language === "html");
    const cssFile = codeFiles.find((f) => f.language === "css");
    const jsFile = codeFiles.find((f) => f.language === "javascript");

    const html = htmlFile?.content || "<html><body></body></html>";
    const css = cssFile?.content || "";
    const js = jsFile?.content || "";

    return html
      .replace("</head>", `<style>${css}</style></head>`)
      .replace("</body>", `<script>${js}</script></body>`);
  };

  return {
    codeFiles,
    setCodeFiles,
    activeFileIndex,
    setActiveFileIndex,
    activeFile,
    updateFileContent,
    addFile,
    removeFile,
    copied,
    copyCode,
    generatePreviewContent,
  };
}
