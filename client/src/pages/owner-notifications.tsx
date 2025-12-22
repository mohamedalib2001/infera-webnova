import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff,
  FileText,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  ArrowUp,
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  Shield,
  Crown,
  Zap,
  Filter
} from "lucide-react";
import type { SovereignNotification, NotificationTemplate } from "@shared/schema";

const translations = {
  ar: {
    title: "نظام الإشعارات الذكية السيادي",
    subtitle: "SRINS - إدارة ومراقبة الإشعارات بالذكاء الاصطناعي",
    tabs: {
      all: "جميع الإشعارات",
      sovereign: "إشعارات المالك",
      escalations: "التصعيدات",
      templates: "القوالب",
      analytics: "الإحصائيات",
      settings: "الإعدادات"
    },
    stats: {
      total: "الإجمالي",
      unread: "غير مقروء",
      critical: "حرجة",
      pending: "بانتظار التأكيد"
    },
    priority: {
      EMERGENCY: "طوارئ",
      CRITICAL: "حرج",
      HIGH: "مرتفع",
      MEDIUM: "متوسط",
      LOW: "منخفض"
    },
    channel: {
      DASHBOARD: "لوحة التحكم",
      EMAIL: "البريد",
      SMS: "رسالة نصية",
      PUSH: "إشعار فوري",
      WEBHOOK: "ويب هوك",
      ENCRYPTED: "مشفر"
    },
    status: {
      pending: "في الانتظار",
      sent: "مرسل",
      read: "مقروء",
      acknowledged: "مؤكد",
      escalated: "مُصعّد",
      expired: "منتهي"
    },
    actions: {
      markRead: "تعليم كمقروء",
      acknowledge: "تأكيد الاستلام",
      sendAlert: "إرسال تنبيه طوارئ",
      createTemplate: "إنشاء قالب",
      refresh: "تحديث"
    },
    newAlert: {
      title: "إرسال تنبيه طوارئ",
      alertTitle: "عنوان التنبيه",
      alertMessage: "رسالة التنبيه",
      alertType: "نوع التنبيه",
      send: "إرسال فوري",
      targetType: "المستهدفين",
      allUsers: "جميع المستخدمين",
      specificUsers: "مستخدمين محددين",
      selectUsers: "اختر المستخدمين"
    },
    empty: "لا توجد إشعارات",
    loading: "جاري التحميل...",
    noTemplates: "لا توجد قوالب بعد"
  },
  en: {
    title: "Sovereign Intelligent Notification System",
    subtitle: "SRINS - AI-Powered Notification Management & Monitoring",
    tabs: {
      all: "All Notifications",
      sovereign: "Owner Notifications",
      escalations: "Escalations",
      templates: "Templates",
      analytics: "Analytics",
      settings: "Settings"
    },
    stats: {
      total: "Total",
      unread: "Unread",
      critical: "Critical",
      pending: "Pending Ack"
    },
    priority: {
      EMERGENCY: "Emergency",
      CRITICAL: "Critical",
      HIGH: "High",
      MEDIUM: "Medium",
      LOW: "Low"
    },
    channel: {
      DASHBOARD: "Dashboard",
      EMAIL: "Email",
      SMS: "SMS",
      PUSH: "Push",
      WEBHOOK: "Webhook",
      ENCRYPTED: "Encrypted"
    },
    status: {
      pending: "Pending",
      sent: "Sent",
      read: "Read",
      acknowledged: "Acknowledged",
      escalated: "Escalated",
      expired: "Expired"
    },
    actions: {
      markRead: "Mark as Read",
      acknowledge: "Acknowledge",
      sendAlert: "Send Emergency Alert",
      createTemplate: "Create Template",
      refresh: "Refresh"
    },
    newAlert: {
      title: "Send Emergency Alert",
      alertTitle: "Alert Title",
      alertMessage: "Alert Message",
      alertType: "Alert Type",
      send: "Send Now",
      targetType: "Target",
      allUsers: "All Users",
      specificUsers: "Specific Users",
      selectUsers: "Select Users"
    },
    empty: "No notifications",
    loading: "Loading...",
    noTemplates: "No templates yet"
  }
};

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'EMERGENCY': return 'bg-red-600 text-white';
    case 'CRITICAL': return 'bg-orange-500 text-white';
    case 'HIGH': return 'bg-yellow-500 text-black';
    case 'MEDIUM': return 'bg-blue-500 text-white';
    case 'LOW': return 'bg-gray-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'acknowledged': return 'bg-green-600 text-white';
    case 'read': return 'bg-blue-500 text-white';
    case 'sent': return 'bg-yellow-500 text-black';
    case 'escalated': return 'bg-red-500 text-white';
    case 'pending': return 'bg-gray-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case 'DASHBOARD': return <Globe className="w-4 h-4" />;
    case 'EMAIL': return <Mail className="w-4 h-4" />;
    case 'SMS': return <Smartphone className="w-4 h-4" />;
    case 'PUSH': return <Bell className="w-4 h-4" />;
    case 'WEBHOOK': return <Zap className="w-4 h-4" />;
    case 'ENCRYPTED': return <Shield className="w-4 h-4" />;
    default: return <MessageSquare className="w-4 h-4" />;
  }
}

export default function OwnerNotifications() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.ar;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: "",
    titleAr: "",
    message: "",
    messageAr: "",
    type: "SECURITY",
    targetType: "all" as "all" | "specific",
    targetUserIds: [] as string[]
  });
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data: notificationsData, isLoading: loadingNotifications, refetch: refetchNotifications, isFetching: isRefetchingNotifications } = useQuery<{
    success: boolean;
    notifications: SovereignNotification[];
    stats?: { total: number; unread: number; critical: number; pendingAcknowledgment: number };
  }>({
    queryKey: ['/api/owner/notifications']
  });

  const { data: sovereignData, isLoading: loadingSovereign } = useQuery<{
    success: boolean;
    notifications: SovereignNotification[];
  }>({
    queryKey: ['/api/owner/notifications/sovereign']
  });

  const { data: escalationsData, isLoading: loadingEscalations } = useQuery<{
    success: boolean;
    notifications: SovereignNotification[];
  }>({
    queryKey: ['/api/owner/notifications/escalations']
  });

  const { data: templatesData, isLoading: loadingTemplates } = useQuery<{
    success: boolean;
    templates: NotificationTemplate[];
  }>({
    queryKey: ['/api/owner/notification-templates']
  });

  const { data: analyticsData } = useQuery<{
    success: boolean;
    analytics: any[];
  }>({
    queryKey: ['/api/owner/notification-analytics']
  });

  // Fetch users for targeting
  const { data: usersData } = useQuery<Array<{ id: string; username: string; email: string; fullName: string }>>({
    queryKey: ['/api/owner/users'],
    enabled: alertForm.targetType === 'specific'
  });

  const availableUsers = usersData || [];

  // Extract arrays from response objects
  const notifications = notificationsData?.notifications || [];
  const sovereignNotifications = sovereignData?.notifications || [];
  const escalations = escalationsData?.notifications || [];
  const templates = templatesData?.templates || [];
  const analytics = analyticsData?.analytics || [];

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/owner/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/notifications'] });
      toast({ title: language === 'ar' ? 'تم التعليم كمقروء' : 'Marked as read' });
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/owner/notifications/${id}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/notifications/sovereign'] });
      toast({ title: language === 'ar' ? 'تم تأكيد الاستلام' : 'Acknowledged' });
    }
  });

  const sendAlertMutation = useMutation({
    mutationFn: (data: typeof alertForm) => apiRequest('POST', '/api/owner/notifications/alert', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/notifications'] });
      setShowAlertDialog(false);
      setAlertForm({ title: "", titleAr: "", message: "", messageAr: "", type: "SECURITY", targetType: "all", targetUserIds: [] });
      toast({ title: language === 'ar' ? 'تم إرسال التنبيه' : 'Alert sent' });
    }
  });

  const stats = {
    total: notifications?.length || 0,
    unread: notifications?.filter(n => n.status === 'sent').length || 0,
    critical: notifications?.filter(n => n.priority === 'CRITICAL' || n.priority === 'EMERGENCY').length || 0,
    pending: notifications?.filter(n => n.requiresAcknowledgment && n.status !== 'acknowledged').length || 0
  };

  const filteredNotifications = notifications?.filter(n => 
    priorityFilter === 'all' || n.priority === priorityFilter
  ) || [];

  const renderNotificationCard = (notification: SovereignNotification) => (
    <Card key={notification.id} className="mb-3" data-testid={`notification-card-${notification.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getPriorityColor(notification.priority)}>
              {t.priority[notification.priority as keyof typeof t.priority] || notification.priority}
            </Badge>
            <Badge className={getStatusColor(notification.status)}>
              {t.status[notification.status as keyof typeof t.status] || notification.status}
            </Badge>
            {notification.channels && notification.channels[0] && (
              <Badge variant="outline" className="gap-1">
                {getChannelIcon(notification.channels[0])}
                {t.channel[notification.channels[0] as keyof typeof t.channel] || notification.channels[0]}
              </Badge>
            )}
            {notification.isOwnerOnly && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" />
                {language === 'ar' ? 'للمالك فقط' : 'Owner Only'}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : ''}
          </span>
        </div>
        <CardTitle className="text-lg mt-2">
          {language === 'ar' ? (notification.titleAr || notification.title) : notification.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {language === 'ar' ? (notification.messageAr || notification.message) : notification.message}
        </p>
        
        {notification.contextAnalysis && (
          <div className="bg-muted/50 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{language === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">{language === 'ar' ? 'درجة الأولوية:' : 'Priority Score:'}</span>
                <span className="ml-1 font-medium">{notification.priorityScore}/100</span>
              </div>
              {notification.contextAnalysis && typeof notification.contextAnalysis === 'object' && (
                <>
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'التأثير:' : 'Impact:'}</span>
                    <span className="ml-1 font-medium">{(notification.contextAnalysis as any).userImpact || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'المخاطر:' : 'Risk:'}</span>
                    <span className="ml-1 font-medium">{(notification.contextAnalysis as any).riskLevel || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {notification.status === 'sent' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => markAsReadMutation.mutate(notification.id)}
              disabled={markAsReadMutation.isPending}
              data-testid={`button-mark-read-${notification.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              {t.actions.markRead}
            </Button>
          )}
          {notification.requiresAcknowledgment && notification.status !== 'acknowledged' && (
            <Button 
              size="sm"
              onClick={() => acknowledgeMutation.mutate(notification.id)}
              disabled={acknowledgeMutation.isPending}
              data-testid={`button-acknowledge-${notification.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t.actions.acknowledge}
            </Button>
          )}
          {notification.actionUrl && (
            <Button size="sm" variant="secondary" asChild>
              <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                {language === 'ar' ? (notification.actionLabelAr || notification.actionLabel || 'عرض') : (notification.actionLabel || 'View')}
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <BellRing className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetchNotifications()} 
            disabled={isRefetchingNotifications}
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetchingNotifications ? 'animate-spin' : ''}`} />
            {t.actions.refresh}
          </Button>
          <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-send-alert">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t.actions.sendAlert}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.newAlert.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.newAlert.alertTitle} (EN)</Label>
                    <Input 
                      value={alertForm.title}
                      onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
                      data-testid="input-alert-title"
                    />
                  </div>
                  <div>
                    <Label>{t.newAlert.alertTitle} (AR)</Label>
                    <Input 
                      value={alertForm.titleAr}
                      onChange={(e) => setAlertForm({...alertForm, titleAr: e.target.value})}
                      dir="rtl"
                      data-testid="input-alert-title-ar"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.newAlert.alertMessage} (EN)</Label>
                    <Textarea 
                      value={alertForm.message}
                      onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
                      data-testid="input-alert-message"
                    />
                  </div>
                  <div>
                    <Label>{t.newAlert.alertMessage} (AR)</Label>
                    <Textarea 
                      value={alertForm.messageAr}
                      onChange={(e) => setAlertForm({...alertForm, messageAr: e.target.value})}
                      dir="rtl"
                      data-testid="input-alert-message-ar"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t.newAlert.alertType}</Label>
                  <Select value={alertForm.type} onValueChange={(v) => setAlertForm({...alertForm, type: v})}>
                    <SelectTrigger data-testid="select-alert-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="OPERATIONAL">Operational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.newAlert.targetType}</Label>
                  <Select value={alertForm.targetType} onValueChange={(v: "all" | "specific") => setAlertForm({...alertForm, targetType: v, targetUserIds: []})}>
                    <SelectTrigger data-testid="select-target-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.newAlert.allUsers}</SelectItem>
                      <SelectItem value="specific">{t.newAlert.specificUsers}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {alertForm.targetType === 'specific' && (
                  <div>
                    <Label>{t.newAlert.selectUsers}</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                      {availableUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{language === 'ar' ? 'جاري تحميل المستخدمين...' : 'Loading users...'}</p>
                      ) : (
                        availableUsers.map(user => (
                          <div key={user.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={alertForm.targetUserIds.includes(user.id)}
                              onChange={(e) => {
                                const userIds = e.target.checked 
                                  ? [...alertForm.targetUserIds, user.id]
                                  : alertForm.targetUserIds.filter(id => id !== user.id);
                                setAlertForm({...alertForm, targetUserIds: userIds});
                              }}
                              className="rounded"
                              data-testid={`checkbox-user-${user.id}`}
                            />
                            <label htmlFor={`user-${user.id}`} className="text-sm">
                              {user.fullName || user.username} ({user.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => sendAlertMutation.mutate(alertForm)}
                  disabled={sendAlertMutation.isPending || !alertForm.title || !alertForm.message || (alertForm.targetType === 'specific' && alertForm.targetUserIds.length === 0)}
                  data-testid="button-confirm-send-alert"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t.newAlert.send}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.total}</p>
                <p className="text-2xl font-bold" data-testid="text-stat-total">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.unread}</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stat-unread">{stats.unread}</p>
              </div>
              <EyeOff className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.critical}</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-stat-critical">{stats.critical}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.pending}</p>
                <p className="text-2xl font-bold text-yellow-600" data-testid="text-stat-pending">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all" className="gap-2" data-testid="tab-all">
            <Bell className="w-4 h-4" />
            {t.tabs.all}
          </TabsTrigger>
          <TabsTrigger value="sovereign" className="gap-2" data-testid="tab-sovereign">
            <Crown className="w-4 h-4" />
            {t.tabs.sovereign}
          </TabsTrigger>
          <TabsTrigger value="escalations" className="gap-2" data-testid="tab-escalations">
            <ArrowUp className="w-4 h-4" />
            {t.tabs.escalations}
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
            <FileText className="w-4 h-4" />
            {t.tabs.templates}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4" />
            {t.tabs.analytics}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48" data-testid="select-priority-filter">
                <SelectValue placeholder={language === 'ar' ? 'تصفية حسب الأولوية' : 'Filter by priority'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="EMERGENCY">{t.priority.EMERGENCY}</SelectItem>
                <SelectItem value="CRITICAL">{t.priority.CRITICAL}</SelectItem>
                <SelectItem value="HIGH">{t.priority.HIGH}</SelectItem>
                <SelectItem value="MEDIUM">{t.priority.MEDIUM}</SelectItem>
                <SelectItem value="LOW">{t.priority.LOW}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[600px]">
            {loadingNotifications ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              filteredNotifications.map(renderNotificationCard)
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sovereign">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                {language === 'ar' ? 'إشعارات المالك الحصرية' : 'Owner-Exclusive Notifications'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'إشعارات تتطلب تأكيد استلام من المالك - للأمور الحرجة والسيادية'
                  : 'Notifications requiring owner acknowledgment - for critical and sovereign matters'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ScrollArea className="h-[550px]">
            {loadingSovereign ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : !sovereignNotifications || sovereignNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              sovereignNotifications.map(renderNotificationCard)
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="escalations">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-orange-500" />
                {language === 'ar' ? 'التصعيدات النشطة' : 'Active Escalations'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'الإشعارات التي تم تصعيدها لعدم الاستجابة في الوقت المحدد'
                  : 'Notifications escalated due to no response within timeout'}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ScrollArea className="h-[550px]">
            {loadingEscalations ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : !escalations || (Array.isArray(escalations) && escalations.length === 0) ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد تصعيدات نشطة' : 'No active escalations'}
                </p>
              </div>
            ) : (
              Array.isArray(escalations) && escalations.map((esc: any) => (
                <Card key={esc.id} className="mb-3">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <Badge variant="destructive">
                        {language === 'ar' ? `المستوى ${esc.escalationLevel}` : `Level ${esc.escalationLevel}`}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {esc.escalatedAt ? new Date(esc.escalatedAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-sm">{esc.reason}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="templates">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">
              {language === 'ar' ? 'قوالب الإشعارات' : 'Notification Templates'}
            </h3>
            <Button size="sm" data-testid="button-create-template">
              <Plus className="w-4 h-4 mr-2" />
              {t.actions.createTemplate}
            </Button>
          </div>
          
          <ScrollArea className="h-[550px]">
            {loadingTemplates ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : !templates || templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.noTemplates}</div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="mb-3">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                        </Badge>
                        <Button size="icon" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'ar' ? template.titleTemplateAr || template.titleTemplate : template.titleTemplate}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant="outline">{template.defaultPriority}</Badge>
                      {template.defaultChannels?.map((ch, i) => (
                        <Badge key={i} variant="secondary" className="gap-1">
                          {getChannelIcon(ch)}
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'ملخص الإشعارات' : 'Notification Summary'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'ar' ? 'إجمالي الإشعارات' : 'Total Notifications'}</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'ar' ? 'معدل القراءة' : 'Read Rate'}</span>
                    <span className="font-bold">
                      {stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'ar' ? 'معدل التأكيد' : 'Acknowledgment Rate'}</span>
                    <span className="font-bold">
                      {stats.pending > 0 ? `${stats.pending} ${language === 'ar' ? 'بانتظار' : 'pending'}` : '100%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'توزيع الأولويات' : 'Priority Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['EMERGENCY', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => {
                    const count = notifications?.filter(n => n.priority === priority).length || 0;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{t.priority[priority as keyof typeof t.priority]}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPriorityColor(priority).split(' ')[0]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
