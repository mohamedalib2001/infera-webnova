import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Users,
  Plus,
  Mail,
  Trash2,
  Crown,
  Edit3,
  Eye,
  Loader2,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import type { Collaborator } from "@shared/schema";

interface CollaboratorsManagerProps {
  projectId: string;
  language: "ar" | "en";
  isOwner?: boolean;
}

export function CollaboratorsManager({ projectId, language, isOwner = false }: CollaboratorsManagerProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const t = {
    ar: {
      title: "المتعاونون",
      subtitle: "إدارة أعضاء الفريق والصلاحيات",
      invite: "دعوة متعاون",
      email: "البريد الإلكتروني",
      role: "الدور",
      owner: "المالك",
      editor: "محرر",
      viewer: "مشاهد",
      pending: "قيد الانتظار",
      accepted: "مقبول",
      rejected: "مرفوض",
      remove: "إزالة",
      cancel: "إلغاء",
      send: "إرسال الدعوة",
      noCollaborators: "لا يوجد متعاونون",
      noCollaboratorsDesc: "ادعُ أعضاء الفريق للتعاون في هذا المشروع",
      inviteSent: "تم إرسال الدعوة",
      removed: "تمت الإزالة",
      enterEmail: "أدخل البريد الإلكتروني",
    },
    en: {
      title: "Collaborators",
      subtitle: "Manage team members and permissions",
      invite: "Invite Collaborator",
      email: "Email",
      role: "Role",
      owner: "Owner",
      editor: "Editor",
      viewer: "Viewer",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      remove: "Remove",
      cancel: "Cancel",
      send: "Send Invitation",
      noCollaborators: "No collaborators",
      noCollaboratorsDesc: "Invite team members to collaborate on this project",
      inviteSent: "Invitation sent",
      removed: "Removed",
      enterEmail: "Enter email address",
    },
  };

  const txt = language === "ar" ? t.ar : t.en;

  const { data: collaborators = [], isLoading } = useQuery<Collaborator[]>({
    queryKey: ["/api/projects", projectId, "collaborators"],
    enabled: !!projectId,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return apiRequest("POST", `/api/projects/${projectId}/collaborators`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "collaborators"] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteRole("viewer");
      toast({ title: txt.inviteSent });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      return apiRequest("DELETE", `/api/projects/${projectId}/collaborators/${collaboratorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "collaborators"] });
      toast({ title: txt.removed });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="w-4 h-4 text-amber-500" />;
      case "editor": return <Edit3 className="w-4 h-4 text-blue-500" />;
      case "viewer": return <Eye className="w-4 h-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner": return txt.owner;
      case "editor": return txt.editor;
      case "viewer": return txt.viewer;
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    } as const;
    const labels = {
      pending: txt.pending,
      accepted: txt.accepted,
      rejected: txt.rejected,
    };
    return <Badge variant={colors[status as keyof typeof colors] || "secondary"}>{labels[status as keyof typeof labels] || status}</Badge>;
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {txt.title}
          </CardTitle>
          <CardDescription>{txt.subtitle}</CardDescription>
        </div>
        {isOwner && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" data-testid="button-invite-collaborator">
                <UserPlus className="w-4 h-4" />
                {txt.invite}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{txt.invite}</DialogTitle>
                <DialogDescription>{txt.enterEmail}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{txt.email}</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    data-testid="input-invite-email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{txt.role}</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "viewer")}>
                    <SelectTrigger data-testid="select-invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          {txt.editor}
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {txt.viewer}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  {txt.cancel}
                </Button>
                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail || inviteMutation.isPending}
                  data-testid="button-send-invite"
                >
                  {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : txt.send}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">{txt.noCollaborators}</p>
            <p className="text-sm">{txt.noCollaboratorsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                data-testid={`collaborator-${collab.id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {getInitials((collab as any).inviteEmail || collab.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{(collab as any).inviteEmail || collab.userId}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getRoleIcon(collab.role)}
                      <span>{getRoleLabel(collab.role)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(collab.status)}
                  {isOwner && collab.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(collab.id)}
                      disabled={removeMutation.isPending}
                      data-testid={`button-remove-${collab.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
