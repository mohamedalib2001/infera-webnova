import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  CreditCard,
  Users,
  FolderOpen,
  Shield,
  Sparkles,
  Settings,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import type { Notification } from "@shared/schema";

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  const t = {
    ar: {
      title: "الإشعارات",
      subtitle: "جميع إشعاراتك في مكان واحد",
      markAllRead: "تحديد الكل كمقروء",
      noNotifications: "لا توجد إشعارات",
      noNotificationsDesc: "ستظهر إشعاراتك هنا عند وصولها",
      back: "رجوع",
      new: "جديد",
      delete: "حذف",
      view: "عرض",
      loading: "جاري التحميل...",
      markedRead: "تم تحديد الإشعار كمقروء",
      markedAllRead: "تم تحديد جميع الإشعارات كمقروءة",
      deleted: "تم حذف الإشعار",
    },
    en: {
      title: "Notifications",
      subtitle: "All your notifications in one place",
      markAllRead: "Mark all as read",
      noNotifications: "No notifications",
      noNotificationsDesc: "Your notifications will appear here",
      back: "Back",
      new: "New",
      delete: "Delete",
      view: "View",
      loading: "Loading...",
      markedRead: "Notification marked as read",
      markedAllRead: "All notifications marked as read",
      deleted: "Notification deleted",
    },
  };

  const txt = t[language];

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({ title: txt.markedAllRead });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({ title: txt.deleted });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "collaboration":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "project":
        return <FolderOpen className="h-5 w-5 text-purple-500" />;
      case "security":
        return <Shield className="h-5 w-5 text-red-500" />;
      case "ai":
        return <Sparkles className="h-5 w-5 text-yellow-500" />;
      case "system":
      default:
        return <Settings className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      setLocation(notification.link);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-4xl mx-auto" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/projects")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-title">
              <Bell className="h-6 w-6" />
              {txt.title}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">{txt.subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-toggle-language"
          >
            {language === "ar" ? "EN" : "عربي"}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {txt.markAllRead}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{txt.title}</CardTitle>
          <CardDescription>
            {notifications.length} {language === "ar" ? "إشعار" : "notifications"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{txt.noNotifications}</p>
              <p className="text-sm">{txt.noNotificationsDesc}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`flex items-start gap-4 p-4 cursor-pointer hover-elevate transition-colors ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                          {language === "ar" && notification.titleAr ? notification.titleAr : notification.title}
                        </p>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs">{txt.new}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {language === "ar" && notification.messageAr ? notification.messageAr : notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {notification.link && (
                        <Button variant="ghost" size="icon" data-testid={`button-view-${notification.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            markReadMutation.mutate(notification.id);
                          }}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificationMutation.mutate(notification.id);
                        }}
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
