import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { technicalDocs, categoryLabels, type PageDoc } from "@/config/technical-docs";
import { generateMarkdownDoc, copyToClipboard, downloadAsMarkdown, downloadAllDocs, printAsPDF } from "@/lib/docs-export";
import { FileText, Search, Copy, Download, FileDown, Printer, Check, Globe, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function TechnicalDocumentationPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<PageDoc | null>(null);
  const [isRTL, setIsRTL] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.role === "ROOT_OWNER";
  
  if (!isOwner) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              This page is only available to platform owners.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const filteredDocs = technicalDocs.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.nameAr.includes(searchQuery) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, PageDoc[]>);

  const handleCopy = async () => {
    if (!selectedDoc) return;
    const success = await copyToClipboard(generateMarkdownDoc(selectedDoc, isRTL));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: isRTL ? "تم النسخ" : "Copied",
        description: isRTL ? "تم نسخ التوثيق للحافظة" : "Documentation copied to clipboard",
      });
    }
  };

  const handleDownloadAll = async () => {
    await downloadAllDocs(technicalDocs, isRTL);
    toast({
      title: isRTL ? "تم التحميل" : "Downloaded",
      description: isRTL ? "تم تحميل جميع التوثيقات" : "All documentation downloaded",
    });
  };

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              {isRTL ? "التوثيق التقني" : "Technical Documentation"}
            </h1>
            <p className="text-muted-foreground">
              {technicalDocs.length} {isRTL ? "صفحة موثقة" : "pages documented"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsRTL(!isRTL)}
              data-testid="button-toggle-language"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button onClick={handleDownloadAll} data-testid="button-export-all">
              <FileDown className="h-4 w-4 mr-2" />
              {isRTL ? "تصدير الكل" : "Export All"}
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? "بحث في التوثيقات..." : "Search documentation..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        
        <div className="grid gap-6">
          {Object.entries(groupedDocs).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {isRTL ? categoryLabels[category]?.ar : categoryLabels[category]?.en || category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map(doc => (
                    <Card 
                      key={doc.id} 
                      className="cursor-pointer hover-elevate active-elevate-2"
                      onClick={() => setSelectedDoc(doc)}
                      data-testid={`card-doc-${doc.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {isRTL ? doc.nameAr : doc.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {doc.filePath}
                            </p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {doc.apiEndpoints.length} APIs
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {doc.accessLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {Object.keys(groupedDocs).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {isRTL ? "لا توجد نتائج" : "No results found"}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>
                {selectedDoc && (isRTL ? selectedDoc.nameAr : selectedDoc.name)}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[55vh]">
              <pre 
                className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg font-mono"
                dir={isRTL ? "rtl" : "ltr"}
              >
                {selectedDoc && generateMarkdownDoc(selectedDoc, isRTL)}
              </pre>
            </ScrollArea>
            <div className="flex justify-end gap-2 flex-wrap">
              <Button 
                variant="outline"
                onClick={handleCopy}
                data-testid="button-copy-doc"
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isRTL ? "نسخ" : "Copy"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => selectedDoc && printAsPDF(selectedDoc, isRTL)}
                data-testid="button-print-doc"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isRTL ? "طباعة" : "Print"}
              </Button>
              <Button 
                onClick={() => selectedDoc && downloadAsMarkdown(selectedDoc, isRTL)}
                data-testid="button-download-doc"
              >
                <Download className="h-4 w-4 mr-2" />
                {isRTL ? "تحميل" : "Download"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
