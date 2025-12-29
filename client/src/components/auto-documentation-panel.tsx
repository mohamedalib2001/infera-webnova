/**
 * INFERA WebNova - Auto Documentation Panel
 * لوحة منصة التوثيق التلقائي
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  Book, 
  Video, 
  Presentation,
  Users, 
  Code, 
  Settings,
  RefreshCw,
  Trash2,
  Eye,
  Plus,
  CheckCircle,
  Clock,
  Archive
} from "lucide-react";

interface Documentation {
  id: string;
  platformId: string;
  type: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  sections: any[];
  generatedAt: string;
  version: string;
  status: string;
}

interface UserGuide {
  id: string;
  platformId: string;
  platformName: string;
  targetAudience: string;
  title: string;
  titleAr: string;
  chapters: any[];
  generatedAt: string;
  version: string;
}

interface TutorialContent {
  id: string;
  platformId: string;
  type: string;
  title: string;
  titleAr: string;
  duration: number;
  slides: any[];
  script: any[];
  generatedAt: string;
}

export default function AutoDocumentationPanel() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<UserGuide | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialContent | null>(null);
  
  const [platformName, setPlatformName] = useState("");
  const [platformNameAr, setPlatformNameAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [features, setFeatures] = useState("");
  const [techStack, setTechStack] = useState("");
  const [targetAudience, setTargetAudience] = useState<string>("user");
  const [tutorialType, setTutorialType] = useState<string>("video_script");

  const statsQuery = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/auto-documentation/stats"]
  });

  const docsQuery = useQuery<{ success: boolean; data: Documentation[] }>({
    queryKey: ["/api/auto-documentation/docs"]
  });

  const guidesQuery = useQuery<{ success: boolean; data: UserGuide[] }>({
    queryKey: ["/api/auto-documentation/guides"]
  });

  const tutorialsQuery = useQuery<{ success: boolean; data: TutorialContent[] }>({
    queryKey: ["/api/auto-documentation/tutorials"]
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auto-documentation/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auto-documentation/docs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auto-documentation/guides"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auto-documentation/tutorials"] });
  };

  const handleGenerateTechnical = async () => {
    if (!platformName || !description) {
      toast({ title: "Missing Info | معلومات ناقصة", description: "Platform name and description required", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auto-documentation/docs/generate/technical", {
        name: platformName,
        nameAr: platformNameAr || platformName,
        description,
        descriptionAr: descriptionAr || description,
        features: features.split('\n').filter(f => f.trim()),
        featuresAr: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split(',').map(t => t.trim()).filter(Boolean)
      });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Generated | تم الإنشاء", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateOperational = async () => {
    if (!platformName || !description) {
      toast({ title: "Missing Info | معلومات ناقصة", description: "Platform name and description required", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auto-documentation/docs/generate/operational", {
        name: platformName,
        nameAr: platformNameAr || platformName,
        description,
        descriptionAr: descriptionAr || description,
        features: features.split('\n').filter(f => f.trim()),
        featuresAr: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split(',').map(t => t.trim()).filter(Boolean)
      });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Generated | تم الإنشاء", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGuide = async () => {
    if (!platformName || !description) {
      toast({ title: "Missing Info | معلومات ناقصة", description: "Platform name and description required", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auto-documentation/guides/generate", {
        name: platformName,
        nameAr: platformNameAr || platformName,
        description,
        descriptionAr: descriptionAr || description,
        features: features.split('\n').filter(f => f.trim()),
        featuresAr: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
        targetAudience
      });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Guide Generated | تم إنشاء الدليل", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTutorial = async () => {
    if (!platformName || !description) {
      toast({ title: "Missing Info | معلومات ناقصة", description: "Platform name and description required", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auto-documentation/tutorials/generate", {
        name: platformName,
        nameAr: platformNameAr || platformName,
        description,
        descriptionAr: descriptionAr || description,
        features: features.split('\n').filter(f => f.trim()),
        featuresAr: features.split('\n').filter(f => f.trim()),
        techStack: techStack.split(',').map(t => t.trim()).filter(Boolean),
        type: tutorialType
      });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Tutorial Generated | تم إنشاء الدرس", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const response = await apiRequest("DELETE", `/api/auto-documentation/docs/${id}`, {});
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        setSelectedDoc(null);
        toast({ title: "Deleted | تم الحذف", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await apiRequest("PATCH", `/api/auto-documentation/docs/${id}/status`, { status });
      const data = await response.json();
      if (data.success) {
        invalidateAll();
        toast({ title: "Updated | تم التحديث", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Failed | فشل", description: error.message, variant: "destructive" });
    }
  };

  const stats = statsQuery.data?.data;
  const docs = docsQuery.data?.data || [];
  const guides = guidesQuery.data?.data || [];
  const tutorials = tutorialsQuery.data?.data || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <Code className="w-4 h-4" />;
      case 'operational': return <Settings className="w-4 h-4" />;
      case 'video_script': return <Video className="w-4 h-4" />;
      case 'slide_deck': return <Presentation className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case 'draft': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'archived': return <Badge variant="outline"><Archive className="w-3 h-3 mr-1" />Archived</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'admin': return 'Admins | المدراء';
      case 'user': return 'Users | المستخدمين';
      case 'developer': return 'Developers | المطورين';
      case 'operator': return 'Operators | المشغلين';
      default: return audience;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4" data-testid="auto-documentation-panel">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Auto Documentation
            <span className="text-muted-foreground text-lg">| التوثيق التلقائي</span>
          </h2>
          <p className="text-muted-foreground">
            Generate technical docs, user guides, and tutorials automatically
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => invalidateAll()}
          data-testid="button-refresh-docs"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card data-testid="card-total-docs">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalDocs}</div>
              <p className="text-sm text-muted-foreground">Documents | وثائق</p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-guides">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalGuides}</div>
              <p className="text-sm text-muted-foreground">Guides | أدلة</p>
            </CardContent>
          </Card>
          <Card data-testid="card-total-tutorials">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalTutorials}</div>
              <p className="text-sm text-muted-foreground">Tutorials | دروس</p>
            </CardContent>
          </Card>
          <Card data-testid="card-published-docs">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.publishedDocs}</div>
              <p className="text-sm text-muted-foreground">Published | منشور</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="generate" className="flex-1">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="generate" data-testid="tab-generate">
            <Plus className="w-4 h-4 mr-1" />Generate
          </TabsTrigger>
          <TabsTrigger value="docs" data-testid="tab-docs">
            <FileText className="w-4 h-4 mr-1" />Docs
          </TabsTrigger>
          <TabsTrigger value="guides" data-testid="tab-guides">
            <Book className="w-4 h-4 mr-1" />Guides
          </TabsTrigger>
          <TabsTrigger value="tutorials" data-testid="tab-tutorials">
            <Video className="w-4 h-4 mr-1" />Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information | معلومات المنصة</CardTitle>
                <CardDescription>Enter details about the platform to document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Name (EN)</label>
                    <Input 
                      value={platformName}
                      onChange={e => setPlatformName(e.target.value)}
                      placeholder="Platform Name"
                      data-testid="input-platform-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الاسم (AR)</label>
                    <Input 
                      value={platformNameAr}
                      onChange={e => setPlatformNameAr(e.target.value)}
                      placeholder="اسم المنصة"
                      dir="rtl"
                      data-testid="input-platform-name-ar"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description | الوصف</label>
                  <Textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the platform..."
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Features (one per line) | الميزات</label>
                  <Textarea 
                    value={features}
                    onChange={e => setFeatures(e.target.value)}
                    placeholder="User authentication&#10;Dashboard analytics&#10;..."
                    rows={3}
                    data-testid="input-features"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
                  <Input 
                    value={techStack}
                    onChange={e => setTechStack(e.target.value)}
                    placeholder="React, Node.js, PostgreSQL..."
                    data-testid="input-tech-stack"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Technical & Operational Docs
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button 
                    onClick={handleGenerateTechnical}
                    disabled={isGenerating}
                    data-testid="button-generate-technical"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                    Technical Doc
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleGenerateOperational}
                    disabled={isGenerating}
                    data-testid="button-generate-operational"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Settings className="w-4 h-4 mr-1" />}
                    Operational Doc
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Guide | دليل المستخدم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger data-testid="select-audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admins | المدراء</SelectItem>
                      <SelectItem value="user">Users | المستخدمين</SelectItem>
                      <SelectItem value="developer">Developers | المطورين</SelectItem>
                      <SelectItem value="operator">Operators | المشغلين</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full"
                    onClick={handleGenerateGuide}
                    disabled={isGenerating}
                    data-testid="button-generate-guide"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Book className="w-4 h-4 mr-1" />}
                    Generate Guide | إنشاء الدليل
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Tutorial Content | محتوى تعليمي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={tutorialType} onValueChange={setTutorialType}>
                    <SelectTrigger data-testid="select-tutorial-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_script">Video Script | سيناريو فيديو</SelectItem>
                      <SelectItem value="slide_deck">Slide Deck | عرض تقديمي</SelectItem>
                      <SelectItem value="walkthrough">Walkthrough | جولة تعريفية</SelectItem>
                      <SelectItem value="quick_start">Quick Start | بدء سريع</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full"
                    onClick={handleGenerateTutorial}
                    disabled={isGenerating}
                    data-testid="button-generate-tutorial"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Presentation className="w-4 h-4 mr-1" />}
                    Generate Tutorial | إنشاء درس
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents | الوثائق</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {docs.map(doc => (
                      <div 
                        key={doc.id}
                        className={`p-3 rounded-md border cursor-pointer hover-elevate ${selectedDoc?.id === doc.id ? 'border-primary bg-accent' : ''}`}
                        onClick={() => setSelectedDoc(doc)}
                        data-testid={`doc-item-${doc.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(doc.type)}
                            <span className="font-medium truncate">{doc.title}</span>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{doc.titleAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(doc.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {docs.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No documents yet | لا توجد وثائق بعد
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {selectedDoc && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Document Details
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select 
                        value={selectedDoc.status} 
                        onValueChange={(v) => handleUpdateStatus(selectedDoc.id, v)}
                      >
                        <SelectTrigger className="w-32" data-testid="select-doc-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeleteDoc(selectedDoc.id)}
                        data-testid="button-delete-doc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{selectedDoc.title}</h3>
                        <p className="text-muted-foreground" dir="rtl">{selectedDoc.titleAr}</p>
                      </div>
                      <Separator />
                      <div>
                        <p>{selectedDoc.content}</p>
                        <p className="text-muted-foreground mt-2" dir="rtl">{selectedDoc.contentAr}</p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Sections | الأقسام</h4>
                        {selectedDoc.sections.map((section, i) => (
                          <div key={i} className="p-2 bg-muted rounded-md mb-2">
                            <p className="font-medium">{section.title}</p>
                            <p className="text-sm text-muted-foreground" dir="rtl">{section.titleAr}</p>
                            <p className="text-sm mt-1">{section.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Guides | أدلة المستخدم</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {guides.map(guide => (
                      <div 
                        key={guide.id}
                        className={`p-3 rounded-md border cursor-pointer hover-elevate ${selectedGuide?.id === guide.id ? 'border-primary bg-accent' : ''}`}
                        onClick={() => setSelectedGuide(guide)}
                        data-testid={`guide-item-${guide.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Book className="w-4 h-4" />
                            <span className="font-medium truncate">{guide.title}</span>
                          </div>
                          <Badge variant="outline">{getAudienceLabel(guide.targetAudience)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1" dir="rtl">{guide.titleAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {guide.chapters.length} chapters | {new Date(guide.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {guides.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No guides yet | لا توجد أدلة بعد
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {selectedGuide && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedGuide.title}</CardTitle>
                  <CardDescription dir="rtl">{selectedGuide.titleAr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-4">
                      {selectedGuide.chapters.map((chapter, i) => (
                        <div key={i} className="p-3 border rounded-md">
                          <h4 className="font-semibold">Chapter {i + 1}: {chapter.title}</h4>
                          <p className="text-sm text-muted-foreground" dir="rtl">{chapter.titleAr}</p>
                          <p className="text-sm mt-2">{chapter.content}</p>
                          {chapter.steps && chapter.steps.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {chapter.steps.map((step: any, j: number) => (
                                <div key={j} className="text-sm pl-4 border-l-2 border-primary">
                                  <p>{j + 1}. {step.instruction}</p>
                                  {step.tips && step.tips.length > 0 && (
                                    <p className="text-xs text-muted-foreground">Tip: {step.tips[0]}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tutorial Content | المحتوى التعليمي</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tutorials.map(tutorial => (
                      <div 
                        key={tutorial.id}
                        className={`p-3 rounded-md border cursor-pointer hover-elevate ${selectedTutorial?.id === tutorial.id ? 'border-primary bg-accent' : ''}`}
                        onClick={() => setSelectedTutorial(tutorial)}
                        data-testid={`tutorial-item-${tutorial.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tutorial.type)}
                            <span className="font-medium truncate">{tutorial.title}</span>
                          </div>
                          <Badge variant="secondary">{tutorial.duration} min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1" dir="rtl">{tutorial.titleAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tutorial.slides.length} slides | {new Date(tutorial.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {tutorials.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">
                        No tutorials yet | لا توجد دروس بعد
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {selectedTutorial && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTutorial.title}</CardTitle>
                  <CardDescription>
                    {selectedTutorial.duration} minutes | {selectedTutorial.slides.length} slides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="slides">
                    <TabsList className="w-full">
                      <TabsTrigger value="slides" className="flex-1">Slides</TabsTrigger>
                      <TabsTrigger value="script" className="flex-1">Script</TabsTrigger>
                    </TabsList>
                    <TabsContent value="slides">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {selectedTutorial.slides.map((slide, i) => (
                            <div key={i} className="p-3 border rounded-md">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Slide {i + 1}: {slide.title}</h4>
                                <Badge variant="outline" size="sm">{slide.visualType}</Badge>
                              </div>
                              <ul className="list-disc pl-4 mt-2 text-sm">
                                {slide.content.map((point: string, j: number) => (
                                  <li key={j}>{point}</li>
                                ))}
                              </ul>
                              {slide.notes && (
                                <p className="text-xs text-muted-foreground mt-2 italic">Notes: {slide.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="script">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {selectedTutorial.script.map((segment, i) => (
                            <div key={i} className="p-3 border rounded-md">
                              <div className="flex items-center justify-between text-sm">
                                <Badge>{segment.timestamp}</Badge>
                                <span className="text-muted-foreground">{segment.duration}s</span>
                              </div>
                              <p className="mt-2">{segment.narration}</p>
                              <p className="text-sm text-muted-foreground mt-1" dir="rtl">{segment.narrationAr}</p>
                              {segment.visualCue && (
                                <p className="text-xs text-muted-foreground mt-1 italic">Visual: {segment.visualCue}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
