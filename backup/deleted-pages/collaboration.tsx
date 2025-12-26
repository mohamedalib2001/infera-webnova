import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus,
  MessageSquare,
  Share2,
  Eye,
  Edit,
  Crown,
  Circle,
  Send,
  Copy,
  Clock,
  FileCode,
  Trash2,
  Check,
  Loader2,
  FolderOpen
} from "lucide-react";
import type { Collaborator, Project } from "@shared/schema";

const translations = {
  ar: {
    title: "التعاون الجماعي",
    subtitle: "اعمل مع فريقك في الوقت الفعلي على نفس المشروع",
    activeCollaborators: "المتعاونون النشطون",
    inviteCollaborator: "دعوة متعاون",
    comments: "التعليقات",
    shareProject: "مشاركة المشروع",
    selectProject: "اختر مشروعاً",
    noProjectSelected: "يرجى اختيار مشروع للتعاون",
    online: "متصل",
    offline: "غير متصل",
    editing: "يحرر",
    viewing: "يشاهد",
    owner: "المالك",
    editor: "محرر",
    viewer: "مشاهد",
    email: "البريد الإلكتروني",
    role: "الدور",
    sendInvite: "إرسال الدعوة",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ!",
    addComment: "أضف تعليقاً",
    recentActivity: "النشاط الأخير",
    noComments: "لا توجد تعليقات بعد",
    noCollaborators: "لا يوجد متعاونون بعد",
    pending: "قيد الانتظار",
    accepted: "مقبول",
    inviteSent: "تم إرسال الدعوة!",
    commentAdded: "تم إضافة التعليق!",
    removed: "تمت الإزالة",
    resolve: "حل",
    delete: "حذف"
  },
  en: {
    title: "Real-time Collaboration",
    subtitle: "Work with your team in real-time on the same project",
    activeCollaborators: "Active Collaborators",
    inviteCollaborator: "Invite Collaborator",
    comments: "Comments",
    shareProject: "Share Project",
    selectProject: "Select a project",
    noProjectSelected: "Please select a project to collaborate on",
    online: "Online",
    offline: "Offline",
    editing: "Editing",
    viewing: "Viewing",
    owner: "Owner",
    editor: "Editor",
    viewer: "Viewer",
    email: "Email",
    role: "Role",
    sendInvite: "Send Invite",
    copyLink: "Copy Link",
    copied: "Copied!",
    addComment: "Add a comment",
    recentActivity: "Recent Activity",
    noComments: "No comments yet",
    noCollaborators: "No collaborators yet",
    pending: "Pending",
    accepted: "Accepted",
    inviteSent: "Invite sent!",
    commentAdded: "Comment added!",
    removed: "Removed",
    resolve: "Resolve",
    delete: "Delete"
  }
};

interface EnrichedComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  file: string | null;
  line: number | null;
  parentId: string | null;
  isResolved: boolean;
  createdAt: string;
  author: string;
  authorEmail: string;
}

export default function Collaboration() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [newComment, setNewComment] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch user's projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch collaborators for selected project
  const { data: collaborators, isLoading: collaboratorsLoading } = useQuery<Collaborator[]>({
    queryKey: ["/api/projects", selectedProjectId, "collaborators"],
    enabled: !!selectedProjectId,
  });

  // Fetch comments for selected project
  const { data: comments, isLoading: commentsLoading } = useQuery<EnrichedComment[]>({
    queryKey: ["/api/projects", selectedProjectId, "comments"],
    enabled: !!selectedProjectId,
  });

  // Invite collaborator mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return apiRequest("POST", `/api/projects/${selectedProjectId}/collaborators`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "collaborators"] });
      toast({ title: t.inviteSent });
      setInviteEmail("");
      setShowInviteDialog(false);
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل في إرسال الدعوة" : "Failed to send invite", variant: "destructive" });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/projects/${selectedProjectId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "comments"] });
      toast({ title: t.commentAdded });
      setNewComment("");
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل في إضافة التعليق" : "Failed to add comment", variant: "destructive" });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return apiRequest("DELETE", `/api/projects/${selectedProjectId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "comments"] });
      toast({ title: t.removed });
    }
  });

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      return apiRequest("DELETE", `/api/projects/${selectedProjectId}/collaborators/${collaboratorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "collaborators"] });
      toast({ title: t.removed });
    }
  });

  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  const shareLink = selectedProjectId 
    ? `${window.location.origin}/builder/${selectedProjectId}` 
    : "";

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({ title: t.copied });
    }
  };

  const sendInvite = () => {
    if (inviteEmail && selectedProjectId) {
      inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  const addComment = () => {
    if (newComment.trim() && selectedProjectId) {
      addCommentMutation.mutate(newComment);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return language === "ar" ? "الآن" : "Just now";
    if (diffMins < 60) return language === "ar" ? `منذ ${diffMins} دقيقة` : `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return language === "ar" ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-yellow-500";
      case "editor": return "bg-blue-500";
      case "viewer": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-collaboration-title">
          <Users className="h-8 w-8 text-indigo-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Project Selector */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-72" data-testid="select-project">
                <SelectValue placeholder={t.selectProject} />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && (
              <Badge variant="outline">{selectedProject.name}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>{t.noProjectSelected}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Collaborators Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t.activeCollaborators}
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowInviteDialog(true)} data-testid="button-invite">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t.inviteCollaborator}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {collaboratorsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : collaborators && collaborators.length > 0 ? (
                  <div className="space-y-4">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg gap-2 flex-wrap" data-testid={`collaborator-${collab.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback className={getRoleColor(collab.role)}>
                                {(collab.inviteEmail || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Circle className={`absolute -bottom-1 -right-1 h-4 w-4 ${collab.status === "accepted" ? "text-green-500 fill-green-500" : "text-yellow-500 fill-yellow-500"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{collab.inviteEmail || "User"}</span>
                              {collab.role === "owner" && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{collab.inviteEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={collab.status === "accepted" ? "default" : "secondary"}>
                            {collab.status === "accepted" ? t.accepted : t.pending}
                          </Badge>
                          <Badge variant="outline">
                            {t[collab.role as keyof typeof t] || collab.role}
                          </Badge>
                          {collab.role !== "owner" && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeCollaboratorMutation.mutate(collab.id)}
                              disabled={removeCollaboratorMutation.isPending}
                              data-testid={`button-remove-collaborator-${collab.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>{t.noCollaborators}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Project Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {t.shareProject}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Input value={shareLink} readOnly className="font-mono text-sm flex-1 min-w-0" />
                  <Button variant="outline" onClick={copyLink} data-testid="button-copy-link">
                    <Copy className="h-4 w-4 mr-2" />
                    {t.copyLink}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t.comments}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <Textarea
                    placeholder={t.addComment}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    data-testid="textarea-comment"
                  />
                  <Button 
                    size="sm" 
                    onClick={addComment} 
                    disabled={!newComment.trim() || addCommentMutation.isPending} 
                    data-testid="button-add-comment"
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {t.addComment}
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`p-3 rounded-lg ${comment.isResolved ? 'bg-muted/50' : 'bg-muted'}`} 
                          data-testid={`comment-${comment.id}`}
                        >
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(comment.createdAt)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                data-testid={`button-delete-comment-${comment.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                          {comment.file && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              <FileCode className="h-3 w-3 mr-1" />
                              {comment.file}{comment.line ? `:${comment.line}` : ''}
                            </Badge>
                          )}
                          {comment.isResolved && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              {t.resolve}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>{t.noComments}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.inviteCollaborator}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                data-testid="input-invite-email"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.role}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">{t.editor}</SelectItem>
                  <SelectItem value="viewer">{t.viewer}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={sendInvite} 
              disabled={!inviteEmail || inviteMutation.isPending} 
              data-testid="button-send-invite"
            >
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t.sendInvite}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
