import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Link2,
  Copy,
  Clock,
  FileCode
} from "lucide-react";

const translations = {
  ar: {
    title: "التعاون الجماعي",
    subtitle: "اعمل مع فريقك في الوقت الفعلي على نفس المشروع",
    activeCollaborators: "المتعاونون النشطون",
    inviteCollaborator: "دعوة متعاون",
    comments: "التعليقات",
    shareProject: "مشاركة المشروع",
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
    noComments: "لا توجد تعليقات بعد"
  },
  en: {
    title: "Real-time Collaboration",
    subtitle: "Work with your team in real-time on the same project",
    activeCollaborators: "Active Collaborators",
    inviteCollaborator: "Invite Collaborator",
    comments: "Comments",
    shareProject: "Share Project",
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
    noComments: "No comments yet"
  }
};

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline";
  activity?: "editing" | "viewing";
  currentFile?: string;
  color: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  file?: string;
  line?: number;
}

const mockCollaborators: Collaborator[] = [
  { id: "1", name: "أحمد محمد", email: "ahmed@example.com", role: "owner", status: "online", activity: "editing", currentFile: "src/App.tsx", color: "bg-blue-500" },
  { id: "2", name: "Sara Ali", email: "sara@example.com", role: "editor", status: "online", activity: "viewing", currentFile: "src/components/Header.tsx", color: "bg-green-500" },
  { id: "3", name: "John Doe", email: "john@example.com", role: "viewer", status: "offline", color: "bg-purple-500" },
];

const mockComments: Comment[] = [
  { id: "1", author: "Sara Ali", content: "Can we optimize this function?", timestamp: "2 minutes ago", file: "src/utils.ts", line: 45 },
  { id: "2", author: "أحمد محمد", content: "Done! Check the updated version", timestamp: "5 minutes ago" },
];

export default function Collaboration() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const shareLink = "https://infera.app/share/abc123xyz";

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({ title: t.copied });
  };

  const sendInvite = () => {
    toast({ title: language === "ar" ? `تم إرسال الدعوة إلى ${inviteEmail}` : `Invite sent to ${inviteEmail}` });
    setInviteEmail("");
    setShowInviteDialog(false);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      content: newComment,
      timestamp: "Just now"
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-collaboration-title">
          <Users className="h-8 w-8 text-indigo-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
              <div className="space-y-4">
                {mockCollaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`collaborator-${collab.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className={collab.color}>{collab.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Circle className={`absolute -bottom-1 -right-1 h-4 w-4 ${collab.status === "online" ? "text-green-500 fill-green-500" : "text-gray-400 fill-gray-400"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{collab.name}</span>
                          {collab.role === "owner" && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{collab.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {collab.activity && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {collab.activity === "editing" ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {t[collab.activity]}
                        </Badge>
                      )}
                      {collab.currentFile && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <FileCode className="h-3 w-3" />
                          {collab.currentFile.split("/").pop()}
                        </Badge>
                      )}
                      <Badge variant={collab.status === "online" ? "default" : "secondary"}>
                        {t[collab.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t.shareProject}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={copyLink} data-testid="button-copy-link">
                  <Copy className="h-4 w-4 mr-2" />
                  {t.copyLink}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Button size="sm" onClick={addComment} disabled={!newComment.trim()} data-testid="button-add-comment">
                  <Send className="h-4 w-4 mr-2" />
                  {t.addComment}
                </Button>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p>{t.noComments}</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted rounded-lg" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        {comment.file && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {comment.file}:{comment.line}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

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
            <Button onClick={sendInvite} disabled={!inviteEmail} data-testid="button-send-invite">
              <Send className="h-4 w-4 mr-2" />
              {t.sendInvite}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
