import type { PageDoc } from "@/config/technical-docs";

export function generateMarkdownDoc(doc: PageDoc, isRTL: boolean): string {
  const title = isRTL ? doc.nameAr : doc.name;
  const desc = isRTL ? doc.descriptionAr : doc.description;
  const features = isRTL ? doc.featuresAr : doc.features;
  
  let content = `# ${title}\n\n`;
  content += `## ${isRTL ? "الوصف" : "Description"}\n${desc}\n\n`;
  content += `## ${isRTL ? "مسار الملف" : "File Path"}\n\`${doc.filePath}\`\n\n`;
  
  content += `## ${isRTL ? "المميزات" : "Features"}\n`;
  features.forEach(f => content += `- ${f}\n`);
  content += "\n";
  
  if (doc.apiEndpoints.length > 0) {
    content += `## ${isRTL ? "نقاط API" : "API Endpoints"}\n`;
    doc.apiEndpoints.forEach(ep => {
      const epDesc = isRTL ? ep.descriptionAr : ep.description;
      content += `- \`${ep.method} ${ep.path}\` - ${epDesc}\n`;
    });
    content += "\n";
  }
  
  if (doc.dataModels.length > 0) {
    content += `## ${isRTL ? "نماذج البيانات" : "Data Models"}\n`;
    content += doc.dataModels.map(m => `\`${m}\``).join(", ") + "\n\n";
  }
  
  if (doc.dependencies.length > 0) {
    content += `## ${isRTL ? "المكتبات" : "Dependencies"}\n`;
    content += doc.dependencies.map(d => `\`${d}\``).join(", ") + "\n";
  }
  
  return content;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

export function downloadAsMarkdown(doc: PageDoc, isRTL: boolean): void {
  const content = generateMarkdownDoc(doc, isRTL);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.id}-documentation.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printAsPDF(doc: PageDoc, isRTL: boolean): void {
  const content = generateMarkdownDoc(doc, isRTL);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html dir="${isRTL ? "rtl" : "ltr"}">
      <head>
        <title>${isRTL ? doc.nameAr : doc.name}</title>
        <style>
          body { font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
          pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; }
          ul { padding-${isRTL ? "right" : "left"}: 20px; }
        </style>
      </head>
      <body>
        <pre style="white-space: pre-wrap; background: white; color: black;">${content}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

export async function downloadAllDocs(docs: PageDoc[], isRTL: boolean): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  
  docs.forEach(doc => {
    const content = generateMarkdownDoc(doc, isRTL);
    zip.file(`${doc.id}.md`, content);
  });
  
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "technical-documentation.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
