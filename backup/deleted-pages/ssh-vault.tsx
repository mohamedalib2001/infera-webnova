import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import {
  Key, Shield, Lock, Unlock, Plus, Eye, EyeOff, Copy, Trash2,
  Server, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Fingerprint, ShieldCheck, ShieldAlert, History, Terminal, Download,
  Upload, Ban, Activity, Loader2, KeyRound, Database, Globe, ChevronRight
} from "lucide-react";

interface SSHKey {
  id: string;
  name: string;
  description?: string;
  serverHost?: string;
  serverPort?: number;
  serverUsername?: string;
  keyType: string;
  keyFingerprint?: string;
  accessLevel: string;
  lastUsedAt?: string;
  usageCount?: number;
  expiresAt?: string;
  isActive: boolean;
  isRevoked: boolean;
  tags?: string[];
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  actionDetail?: string;
  ipAddress?: string;
  success: boolean;
  createdAt: string;
}

type AuthStep = "locked" | "password" | "email_code" | "totp" | "authenticated";

export default function SSHVault() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const isRtl = language === "ar";

  const [authStep, setAuthStep] = useState<AuthStep>("locked");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [hasTOTP, setHasTOTP] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  // Fetch auth requirements for 3FA
  const { data: authRequirements } = useQuery<{
    requiresPassword: boolean;
    hasTOTP: boolean;
    isOAuthUser: boolean;
    hasPassword: boolean;
    hasEmail: boolean;
    authFactors: { password: boolean; emailOTP: boolean; totp: boolean };
    missingFactors: { password: boolean; email: boolean; totp: boolean };
  }>({
    queryKey: ["/api/vault/ssh/auth/requirements"],
    enabled: authStep === "locked",
  });

  // Update state when auth requirements are fetched
  useEffect(() => {
    if (authRequirements) {
      setIsOAuthUser(authRequirements.isOAuthUser);
      setHasTOTP(authRequirements.hasTOTP);
      setHasEmail(authRequirements.hasEmail);
      setHasPassword(authRequirements.hasPassword);
    }
  }, [authRequirements]);

  const [showAddKey, setShowAddKey] = useState(false);
  const [selectedKey, setSelectedKey] = useState<SSHKey | null>(null);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  
  // Password update state
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Key generation terminal state
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "╔══════════════════════════════════════════════════════════════╗",
    "║          INFERA SSH Key Generation Terminal v2.0             ║",
    "║              Sovereign Key Management System                 ║",
    "╚══════════════════════════════════════════════════════════════╝",
    "",
    "Available key categories:",
    "  • sovereign    - Root owner access keys (highest privilege)",
    "  • production   - Production environment keys",
    "  • development  - Development environment keys",
    "  • deployment   - CI/CD and deployment keys",
    "  • infrastructure - Infrastructure management keys",
    "  • maintenance  - System maintenance keys",
    "  • emergency    - Emergency access keys",
    "",
    "Type 'help' for available commands or select a category below.",
    ""
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("deployment");
  const [generatedKey, setGeneratedKey] = useState<{publicKey: string; privateKey: string; fingerprint: string} | null>(null);
  const [keyName, setKeyName] = useState("");
  const [keyDescription, setKeyDescription] = useState("");
  const [savePassword, setSavePassword] = useState("");

  const keyCategories = [
    { id: "sovereign", label: "Sovereign", labelAr: "سيادي", icon: "👑", color: "text-amber-500", description: "Root owner access", descriptionAr: "وصول المالك الجذري" },
    { id: "production", label: "Production", labelAr: "إنتاج", icon: "🚀", color: "text-green-500", description: "Production servers", descriptionAr: "سيرفرات الإنتاج" },
    { id: "development", label: "Development", labelAr: "تطوير", icon: "💻", color: "text-blue-500", description: "Development environment", descriptionAr: "بيئة التطوير" },
    { id: "deployment", label: "Deployment", labelAr: "نشر", icon: "📦", color: "text-purple-500", description: "CI/CD pipelines", descriptionAr: "خطوط CI/CD" },
    { id: "infrastructure", label: "Infrastructure", labelAr: "بنية تحتية", icon: "🏗️", color: "text-orange-500", description: "Infrastructure management", descriptionAr: "إدارة البنية التحتية" },
    { id: "maintenance", label: "Maintenance", labelAr: "صيانة", icon: "🔧", color: "text-slate-500", description: "System maintenance", descriptionAr: "صيانة النظام" },
    { id: "emergency", label: "Emergency", labelAr: "طوارئ", icon: "🚨", color: "text-red-500", description: "Emergency access", descriptionAr: "وصول طوارئ" },
  ];

  const [newKey, setNewKey] = useState({
    name: "",
    description: "",
    serverHost: "",
    serverPort: "22",
    serverUsername: "",
    privateKey: "",
    publicKey: "",
    passphrase: "",
    keyType: "ed25519",
    tags: "",
    masterPassword: "",
    confirmMasterPassword: "",
  });

  const { data: keysData, isLoading: loadingKeys, refetch: refetchKeys } = useQuery<{ keys: SSHKey[] }>({
    queryKey: ["/api/vault/ssh/keys", sessionToken],
    queryFn: async () => {
      const res = await fetch("/api/vault/ssh/keys", {
        headers: { "x-vault-session": sessionToken || "" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch keys");
      return res.json();
    },
    enabled: authStep === "authenticated" && !!sessionToken,
  });

  const { data: auditData, isLoading: loadingAudit } = useQuery<{ logs: AuditLog[] }>({
    queryKey: ["/api/vault/ssh/audit", sessionToken],
    queryFn: async () => {
      const res = await fetch("/api/vault/ssh/audit", {
        headers: { "x-vault-session": sessionToken || "" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch audit");
      return res.json();
    },
    enabled: authStep === "authenticated" && !!sessionToken,
  });

  // 3FA Flow: Password (Factor 1) → Email OTP (Factor 2) → TOTP (Factor 3)
  const startAuthMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await apiRequest("POST", "/api/vault/ssh/auth/start", { password: pwd });
      return res;
    },
    onSuccess: (data: any) => {
      setSessionToken(data.sessionToken);
      setEmailHint(data.emailHint || "");
      setHasTOTP(data.hasTOTP || false);
      setHasEmail(data.hasEmail || false);
      
      // 3FA Flow: Password done → Email OTP next (if available) → TOTP last
      if (data.nextStep === "email_code") {
        setAuthStep("email_code");
      } else if (data.nextStep === "totp") {
        setAuthStep("totp");
      } else if (data.nextStep === "complete") {
        setAuthStep("authenticated");
        toast({
          title: isRtl ? "تم فتح الخزنة" : "Vault Unlocked",
          description: isRtl ? "يمكنك الآن إدارة مفاتيح SSH" : "You can now manage SSH keys",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "";
      let title = isRtl ? "خطأ في المصادقة" : "Authentication Error";
      let description = isRtl ? "كلمة المرور غير صحيحة" : "Invalid password";
      
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
        title = isRtl ? "غير مسجل الدخول" : "Not Logged In";
        description = isRtl ? "يرجى تسجيل الدخول أولاً" : "Please log in first";
      } else if (errorMessage.includes("Sovereign") || errorMessage.includes("403")) {
        title = isRtl ? "غير مصرح" : "Access Denied";
        description = isRtl ? "هذه الميزة متاحة فقط للحساب السيادي" : "This feature is only available for sovereign accounts";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  // 3FA: TOTP verification (Factor 3) - final step
  const verifyTotpMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/vault/ssh/auth/verify-totp", {
        sessionToken,
        totpCode: code,
      });
    },
    onSuccess: (data: any) => {
      setTotpCode("");
      // TOTP is always the final factor in 3FA - authentication complete
      if (data?.accessGranted || data?.nextStep === "complete") {
        setAuthStep("authenticated");
        toast({
          title: isRtl ? "تم فتح الخزنة" : "Vault Unlocked",
          description: isRtl ? "جميع عوامل المصادقة الثلاثة تم التحقق منها" : "All 3 authentication factors verified",
        });
      }
    },
    onError: () => {
      toast({
        title: isRtl ? "رمز غير صحيح" : "Invalid Code",
        description: isRtl ? "رمز المصادقة الثنائية غير صحيح" : "Invalid TOTP code",
        variant: "destructive",
      });
    },
  });

  // 3FA: Email OTP verification (Factor 2) → leads to TOTP (Factor 3) if available
  const verifyEmailMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/vault/ssh/auth/verify-email", {
        sessionToken,
        emailCode: code,
      });
    },
    onSuccess: (data: any) => {
      setEmailCode("");
      
      // Check if TOTP is needed as Factor 3
      if (data?.nextStep === "totp") {
        setAuthStep("totp");
        toast({
          title: isRtl ? "تم التحقق من البريد" : "Email Verified",
          description: isRtl ? "أدخل رمز المصادقة الثنائية" : "Enter your TOTP code",
        });
      } else if (data?.accessGranted || data?.nextStep === "complete") {
        setAuthStep("authenticated");
        toast({
          title: isRtl ? "تم فتح الخزنة" : "Vault Unlocked",
          description: isRtl ? "يمكنك الآن إدارة مفاتيح SSH" : "You can now manage SSH keys",
        });
      }
    },
    onError: () => {
      toast({
        title: isRtl ? "رمز غير صحيح" : "Invalid Code",
        description: isRtl ? "رمز البريد الإلكتروني غير صحيح أو منتهي" : "Invalid or expired email code",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      setShowPasswordUpdate(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast({
        title: isRtl ? "تم تحديث كلمة المرور" : "Password Updated",
        description: isRtl ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "فشل التحديث" : "Update Failed",
        description: error?.message || (isRtl ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect"),
        variant: "destructive",
      });
    },
  });

  const addKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/vault/ssh/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-session": sessionToken || "",
        },
        credentials: "include",
        body: JSON.stringify({
          ...newKey,
          serverPort: parseInt(newKey.serverPort) || 22,
          tags: newKey.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to add key");
      return res.json();
    },
    onSuccess: () => {
      setShowAddKey(false);
      setNewKey({
        name: "", description: "", serverHost: "", serverPort: "22",
        serverUsername: "", privateKey: "", publicKey: "", passphrase: "",
        keyType: "ed25519", tags: "", masterPassword: "", confirmMasterPassword: "",
      });
      refetchKeys();
      toast({
        title: isRtl ? "تم إضافة المفتاح" : "Key Added",
        description: isRtl ? "تم تشفير وحفظ المفتاح بنجاح" : "Key encrypted and saved successfully",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل الإضافة" : "Failed to Add",
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vault/ssh/keys/${id}`, {
        method: "DELETE",
        headers: { "x-vault-session": sessionToken || "" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete key");
      return res.json();
    },
    onSuccess: () => {
      refetchKeys();
      setShowKeyDetails(false);
      setSelectedKey(null);
      toast({
        title: isRtl ? "تم الحذف" : "Key Deleted",
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/vault/ssh/keys/${id}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-session": sessionToken || "",
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to revoke key");
      return res.json();
    },
    onSuccess: () => {
      refetchKeys();
      toast({
        title: isRtl ? "تم إلغاء المفتاح" : "Key Revoked",
      });
    },
  });

  const generateKeyMutation = useMutation({
    mutationFn: async (data: { category: string; keyType: string; keyName: string }) => {
      const res = await fetch("/api/vault/ssh/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-session": sessionToken || "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate key");
      return res.json();
    },
    onSuccess: (data: any) => {
      setGeneratedKey({
        publicKey: data.publicKey,
        privateKey: data.privateKey,
        fingerprint: data.fingerprint,
      });
      setTerminalOutput(prev => [
        ...prev,
        `[SUCCESS] SSH key pair generated successfully!`,
        `Category: ${selectedCategory.toUpperCase()}`,
        `Type: ED25519`,
        `Fingerprint: ${data.fingerprint}`,
        "",
        "Public key ready for deployment. Private key displayed below.",
        "IMPORTANT: Save the private key securely - it cannot be recovered!",
        ""
      ]);
      toast({
        title: isRtl ? "تم توليد المفتاح" : "Key Generated",
        description: isRtl ? "تم توليد زوج مفاتيح SSH بنجاح" : "SSH key pair generated successfully",
      });
    },
    onError: (error: any) => {
      setTerminalOutput(prev => [
        ...prev,
        `[ERROR] Failed to generate key: ${error?.message || "Unknown error"}`,
        ""
      ]);
      toast({
        title: isRtl ? "فشل التوليد" : "Generation Failed",
        variant: "destructive",
      });
    },
  });

  const saveGeneratedKeyMutation = useMutation({
    mutationFn: async () => {
      if (!generatedKey) throw new Error("No key to save");
      const res = await fetch("/api/vault/ssh/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-session": sessionToken || "",
        },
        credentials: "include",
        body: JSON.stringify({
          name: keyName,
          description: keyDescription,
          privateKey: generatedKey.privateKey,
          publicKey: generatedKey.publicKey,
          keyType: "ed25519",
          tags: selectedCategory,
          masterPassword: savePassword,
          confirmMasterPassword: savePassword,
        }),
      });
      if (!res.ok) throw new Error("Failed to save key");
      return res.json();
    },
    onSuccess: () => {
      setGeneratedKey(null);
      setKeyName("");
      setKeyDescription("");
      setSavePassword("");
      refetchKeys();
      setTerminalOutput(prev => [
        ...prev,
        `[SUCCESS] Key "${keyName}" saved to vault with AES-256-GCM encryption`,
        ""
      ]);
      toast({
        title: isRtl ? "تم الحفظ" : "Key Saved",
        description: isRtl ? "تم حفظ المفتاح في الخزنة" : "Key saved to vault",
      });
    },
  });

  const handleTerminalCommand = (command: string) => {
    const cmd = command.trim().toLowerCase();
    setTerminalOutput(prev => [...prev, `> ${command}`]);
    
    if (cmd === "help") {
      setTerminalOutput(prev => [...prev,
        "",
        "Available commands:",
        "  generate [category] - Generate a new SSH key pair",
        "  list               - List saved keys",
        "  clear              - Clear terminal",
        "  categories         - Show all categories",
        "  help               - Show this help",
        ""
      ]);
    } else if (cmd === "clear") {
      setTerminalOutput([]);
    } else if (cmd === "categories") {
      setTerminalOutput(prev => [...prev,
        "",
        "Key Categories:",
        ...keyCategories.map(c => `  ${c.id.padEnd(15)} - ${c.description}`),
        ""
      ]);
    } else if (cmd === "list") {
      setTerminalOutput(prev => [...prev,
        "",
        `Found ${keys.length} keys in vault:`,
        ...keys.map(k => `  [${k.isActive ? "ACTIVE" : "INACTIVE"}] ${k.name} (${k.keyType})`),
        ""
      ]);
    } else if (cmd.startsWith("generate")) {
      const parts = cmd.split(" ");
      const category = parts[1] || selectedCategory;
      setSelectedCategory(category);
      setTerminalOutput(prev => [...prev,
        "",
        `Generating ${category.toUpperCase()} SSH key pair...`,
        "Algorithm: ED25519 (recommended)",
        ""
      ]);
      generateKeyMutation.mutate({ category, keyType: "ed25519", keyName: keyName || `${category}-key` });
    } else {
      setTerminalOutput(prev => [...prev, `Unknown command: ${cmd}. Type 'help' for available commands.`, ""]);
    }
    setTerminalInput("");
  };

  const handleLock = () => {
    if (sessionToken) {
      fetch("/api/vault/ssh/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vault-session": sessionToken,
        },
        credentials: "include",
      });
    }
    setSessionToken(null);
    setAuthStep("locked");
    setPassword("");
    setTotpCode("");
    setEmailCode("");
    setDecryptedKey(null);
  };

  const handleDecryptKey = async () => {
    if (!selectedKey || !decryptPassword) return;
    try {
      const res = await fetch(
        `/api/vault/ssh/keys/${selectedKey.id}?includePrivate=true&masterPassword=${encodeURIComponent(decryptPassword)}`,
        {
          headers: { "x-vault-session": sessionToken || "" },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Decryption failed");
      const data = await res.json();
      setDecryptedKey(data.key.privateKey);
      setShowPrivateKey(true);
    } catch {
      toast({
        title: isRtl ? "كلمة مرور خاطئة" : "Wrong Password",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: isRtl ? "تم النسخ" : "Copied" });
  };

  const keys = keysData?.keys || [];
  const auditLogs = auditData?.logs || [];

  const getActionLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      auth_password: { en: "Password Auth", ar: "مصادقة بكلمة المرور" },
      auth_totp: { en: "TOTP Verify", ar: "تحقق TOTP" },
      auth_email: { en: "Email Verify", ar: "تحقق البريد" },
      auth_complete: { en: "Auth Complete", ar: "اكتمال المصادقة" },
      list_keys: { en: "List Keys", ar: "عرض المفاتيح" },
      create_key: { en: "Create Key", ar: "إنشاء مفتاح" },
      view_key: { en: "View Key", ar: "عرض مفتاح" },
      view_private_key: { en: "View Private Key", ar: "عرض المفتاح الخاص" },
      delete_key: { en: "Delete Key", ar: "حذف مفتاح" },
      revoke_key: { en: "Revoke Key", ar: "إلغاء مفتاح" },
    };
    return labels[action]?.[isRtl ? "ar" : "en"] || action;
  };

  if (authStep !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {isRtl ? "خزنة SSH السيادية" : "Sovereign SSH Vault"}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isRtl ? "تشفير AES-256-GCM مع تحقق ثلاثي" : "AES-256-GCM Encryption with Triple Authentication"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {authStep === "locked" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Lock className="w-3 h-3" />
                    {isRtl ? "مشفرة" : "Encrypted"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {isRtl ? "تحقق ثلاثي" : "3-Factor Auth"}
                  </Badge>
                </div>
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => setAuthStep("password")}
                  data-testid="button-unlock-vault"
                >
                  <Unlock className="w-5 h-5" />
                  {isRtl ? "فتح الخزنة" : "Unlock Vault"}
                </Button>
              </div>
            )}

            {authStep === "password" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <span>{isRtl ? "كلمة المرور" : "Password"}</span>
                  <div className="flex-1 h-px bg-border" />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">2</div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">3</div>
                </div>
                
                {/* 3FA: Password always required (Factor 1) */}
                <div className="space-y-2">
                  <Label>{isRtl ? "كلمة مرور الحساب" : "Account Password"}</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRtl ? "أدخل كلمة المرور" : "Enter password"}
                    data-testid="input-vault-password"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => startAuthMutation.mutate(password)}
                  disabled={!password || startAuthMutation.isPending}
                  data-testid="button-verify-password"
                >
                  {startAuthMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isRtl ? "تحقق" : "Verify"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setShowPasswordUpdate(true)}
                  data-testid="button-update-password-link"
                >
                  {isRtl ? "تحديث كلمة المرور" : "Update Password"}
                </Button>
              </div>
            )}

            {authStep === "totp" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                  <div className="flex-1 h-px bg-green-500" />
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">3</div>
                </div>

                <div className="text-center space-y-4">
                  <KeyRound className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {isRtl ? "أدخل رمز تطبيق المصادقة" : "Enter authenticator app code"}
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={totpCode} onChange={setTotpCode}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => verifyTotpMutation.mutate(totpCode)}
                    disabled={totpCode.length < 6 || verifyTotpMutation.isPending}
                    data-testid="button-verify-totp"
                  >
                    {verifyTotpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isRtl ? "تحقق" : "Verify"}
                  </Button>
                </div>
              </div>
            )}

            {authStep === "email_code" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                  <div className="flex-1 h-px bg-green-500" />
                  {hasTOTP && (
                    <>
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                      <div className="flex-1 h-px bg-green-500" />
                    </>
                  )}
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{hasTOTP ? "3" : "2"}</div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{isRtl ? "تحقق من بريدك الإلكتروني" : "Check Your Email"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRtl ? `تم إرسال رمز إلى ${emailHint}` : `Code sent to ${emailHint}`}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={emailCode} onChange={setEmailCode}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => verifyEmailMutation.mutate(emailCode)}
                    disabled={emailCode.length < 6 || verifyEmailMutation.isPending}
                    data-testid="button-verify-email"
                  >
                    {verifyEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isRtl ? "فتح الخزنة" : "Unlock Vault"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground text-center">
              {isRtl 
                ? "مشفرة بتقنية AES-256-GCM مع PBKDF2 (100,000 تكرار)"
                : "Encrypted with AES-256-GCM + PBKDF2 (100,000 iterations)"}
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {isRtl ? "خزنة SSH السيادية" : "Sovereign SSH Vault"}
                <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                  <Unlock className="w-3 h-3" />
                  {isRtl ? "مفتوحة" : "Unlocked"}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRtl ? "إدارة مفاتيح SSH المشفرة للسيرفرات" : "Manage encrypted SSH keys for servers"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddKey(true)} className="gap-2" data-testid="button-add-key">
              <Plus className="w-4 h-4" />
              {isRtl ? "إضافة مفتاح" : "Add Key"}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleLock} data-testid="button-lock-vault">
              <Lock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="keys" className="gap-2">
              <Key className="w-4 h-4" />
              {isRtl ? "المفاتيح" : "Keys"}
              <Badge variant="secondary" className="text-xs">{keys.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="generate" className="gap-2">
              <Terminal className="w-4 h-4" />
              {isRtl ? "توليد مفتاح" : "Generate Key"}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="w-4 h-4" />
              {isRtl ? "سجل التدقيق" : "Audit Log"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            {loadingKeys ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">{isRtl ? "لا توجد مفاتيح" : "No Keys"}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isRtl ? "أضف مفتاح SSH أول لبدء إدارة السيرفرات" : "Add your first SSH key to start managing servers"}
                  </p>
                  <Button onClick={() => setShowAddKey(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {isRtl ? "إضافة مفتاح" : "Add Key"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {keys.map((key) => (
                  <Card 
                    key={key.id} 
                    className={`hover-elevate cursor-pointer transition-all ${key.isRevoked ? "opacity-60" : ""}`}
                    onClick={() => { setSelectedKey(key); setShowKeyDetails(true); }}
                    data-testid={`card-key-${key.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            key.isRevoked ? "bg-red-500/10" : "bg-primary/10"
                          }`}>
                            {key.isRevoked ? (
                              <Ban className="w-5 h-5 text-red-500" />
                            ) : (
                              <Key className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{key.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{key.keyType.toUpperCase()}</p>
                          </div>
                        </div>
                        <Badge variant={key.isActive && !key.isRevoked ? "default" : "secondary"} className="text-[10px]">
                          {key.isRevoked 
                            ? (isRtl ? "ملغى" : "Revoked")
                            : key.isActive 
                              ? (isRtl ? "نشط" : "Active") 
                              : (isRtl ? "معطل" : "Inactive")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {key.serverHost && (
                        <div className="flex items-center gap-2 text-sm">
                          <Server className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{key.serverUsername}@{key.serverHost}:{key.serverPort}</span>
                        </div>
                      )}
                      {key.keyFingerprint && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Fingerprint className="w-3 h-3" />
                          <span className="font-mono truncate">{key.keyFingerprint.substring(0, 24)}...</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {key.usageCount || 0}
                        </span>
                        {key.lastUsedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(key.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    {isRtl ? "ترمينال توليد المفاتيح" : "Key Generation Terminal"}
                  </CardTitle>
                  <CardDescription>
                    {isRtl ? "استخدم الأوامر أو الأزرار لتوليد مفاتيح SSH جديدة" : "Use commands or buttons to generate new SSH keys"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-[300px] overflow-hidden">
                    <ScrollArea className="h-full">
                      {terminalOutput.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap">{line}</div>
                      ))}
                    </ScrollArea>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-500 font-mono">$</span>
                    <Input
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTerminalCommand(terminalInput)}
                      placeholder={isRtl ? "أدخل أمر..." : "Enter command..."}
                      className="font-mono bg-muted/50"
                      data-testid="input-terminal-command"
                    />
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => handleTerminalCommand(terminalInput)}
                      data-testid="button-terminal-run"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    {isRtl ? "فئات المفاتيح" : "Key Categories"}
                  </CardTitle>
                  <CardDescription>
                    {isRtl ? "اختر نوع المفتاح المطلوب توليده" : "Select the type of key to generate"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {keyCategories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className="justify-start gap-2 h-auto py-3"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setTerminalOutput(prev => [...prev, `> Category selected: ${cat.id.toUpperCase()}`, ""]);
                        }}
                        data-testid={`button-category-${cat.id}`}
                      >
                        <span className={cat.color}>{cat.icon}</span>
                        <div className="text-start">
                          <div className="font-medium">{isRtl ? cat.labelAr : cat.label}</div>
                          <div className="text-xs text-muted-foreground">{isRtl ? cat.descriptionAr : cat.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>{isRtl ? "اسم المفتاح" : "Key Name"}</Label>
                      <Input
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder={isRtl ? "مثال: deploy-key-hetzner" : "e.g., deploy-key-hetzner"}
                        data-testid="input-generate-key-name"
                      />
                    </div>
                    
                    <Button 
                      className="w-full gap-2"
                      onClick={() => {
                        setTerminalOutput(prev => [...prev, `> generate ${selectedCategory}`, ""]);
                        generateKeyMutation.mutate({ 
                          category: selectedCategory, 
                          keyType: "ed25519", 
                          keyName: keyName || `${selectedCategory}-key` 
                        });
                      }}
                      disabled={generateKeyMutation.isPending}
                      data-testid="button-generate-key"
                    >
                      {generateKeyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      {isRtl ? "توليد مفتاح جديد" : "Generate New Key"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {generatedKey && (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    {isRtl ? "تم توليد المفتاح بنجاح!" : "Key Generated Successfully!"}
                  </CardTitle>
                  <CardDescription>
                    {isRtl ? "احفظ المفتاح الخاص بشكل آمن - لا يمكن استرجاعه لاحقاً" : "Save the private key securely - it cannot be recovered later"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{isRtl ? "المفتاح العام (للسيرفر)" : "Public Key (for server)"}</Label>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedKey.publicKey)} data-testid="button-copy-public">
                        <Copy className="w-3 h-3 mr-1" /> {isRtl ? "نسخ" : "Copy"}
                      </Button>
                    </div>
                    <Textarea value={generatedKey.publicKey} readOnly className="font-mono text-xs h-20" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{isRtl ? "المفتاح الخاص (احفظه بأمان!)" : "Private Key (save securely!)"}</Label>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedKey.privateKey)} data-testid="button-copy-private">
                          <Copy className="w-3 h-3 mr-1" /> {isRtl ? "نسخ" : "Copy"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          const blob = new Blob([generatedKey.privateKey], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${keyName || selectedCategory}_private_key.pem`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }} data-testid="button-download-private">
                          <Download className="w-3 h-3 mr-1" /> {isRtl ? "تنزيل" : "Download"}
                        </Button>
                      </div>
                    </div>
                    <Textarea value={generatedKey.privateKey} readOnly className="font-mono text-xs h-32" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Fingerprint className="w-4 h-4" />
                    <span className="font-mono">{generatedKey.fingerprint}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">{isRtl ? "حفظ في الخزنة" : "Save to Vault"}</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{isRtl ? "اسم المفتاح" : "Key Name"}</Label>
                        <Input
                          value={keyName}
                          onChange={(e) => setKeyName(e.target.value)}
                          placeholder={isRtl ? "سيرفر النشر" : "Deploy Server"}
                          data-testid="input-save-key-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRtl ? "كلمة مرور التشفير" : "Encryption Password"}</Label>
                        <Input
                          type="password"
                          value={savePassword}
                          onChange={(e) => setSavePassword(e.target.value)}
                          placeholder="********"
                          data-testid="input-save-password"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRtl ? "الوصف" : "Description"}</Label>
                      <Textarea
                        value={keyDescription}
                        onChange={(e) => setKeyDescription(e.target.value)}
                        placeholder={isRtl ? "وصف اختياري للمفتاح..." : "Optional description..."}
                        className="h-16"
                        data-testid="input-save-description"
                      />
                    </div>
                    <Button 
                      className="w-full gap-2"
                      onClick={() => saveGeneratedKeyMutation.mutate()}
                      disabled={!keyName || !savePassword || saveGeneratedKeyMutation.isPending}
                      data-testid="button-save-to-vault"
                    >
                      {saveGeneratedKeyMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4" />
                      )}
                      {isRtl ? "حفظ في الخزنة المشفرة" : "Save to Encrypted Vault"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {isRtl ? "سجل التدقيق" : "Audit Log"}
                </CardTitle>
                <CardDescription>
                  {isRtl ? "جميع العمليات على الخزنة مسجلة ومحفوظة" : "All vault operations are logged and preserved"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          log.success ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{getActionLabel(log.action)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {log.ipAddress} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {isRtl ? "إضافة مفتاح SSH جديد" : "Add New SSH Key"}
            </DialogTitle>
            <DialogDescription>
              {isRtl ? "سيتم تشفير المفتاح بـ AES-256-GCM" : "Key will be encrypted with AES-256-GCM"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRtl ? "اسم المفتاح" : "Key Name"} *</Label>
                <Input
                  value={newKey.name}
                  onChange={(e) => setNewKey(p => ({ ...p, name: e.target.value }))}
                  placeholder={isRtl ? "سيرفر الإنتاج" : "Production Server"}
                  data-testid="input-key-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? "نوع المفتاح" : "Key Type"}</Label>
                <Select value={newKey.keyType} onValueChange={(v) => setNewKey(p => ({ ...p, keyType: v }))}>
                  <SelectTrigger data-testid="select-key-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ed25519">ED25519</SelectItem>
                    <SelectItem value="rsa">RSA</SelectItem>
                    <SelectItem value="ecdsa">ECDSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? "الوصف" : "Description"}</Label>
              <Input
                value={newKey.description}
                onChange={(e) => setNewKey(p => ({ ...p, description: e.target.value }))}
                placeholder={isRtl ? "وصف اختياري" : "Optional description"}
              />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{isRtl ? "عنوان السيرفر" : "Server Host"}</Label>
                <Input
                  value={newKey.serverHost}
                  onChange={(e) => setNewKey(p => ({ ...p, serverHost: e.target.value }))}
                  placeholder="server.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? "المنفذ" : "Port"}</Label>
                <Input
                  value={newKey.serverPort}
                  onChange={(e) => setNewKey(p => ({ ...p, serverPort: e.target.value }))}
                  placeholder="22"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? "اسم المستخدم" : "Username"}</Label>
                <Input
                  value={newKey.serverUsername}
                  onChange={(e) => setNewKey(p => ({ ...p, serverUsername: e.target.value }))}
                  placeholder="root"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{isRtl ? "المفتاح الخاص" : "Private Key"} *</Label>
              <Textarea
                value={newKey.privateKey}
                onChange={(e) => setNewKey(p => ({ ...p, privateKey: e.target.value }))}
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                rows={5}
                className="font-mono text-xs"
                data-testid="input-private-key"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? "المفتاح العام (اختياري)" : "Public Key (Optional)"}</Label>
              <Textarea
                value={newKey.publicKey}
                onChange={(e) => setNewKey(p => ({ ...p, publicKey: e.target.value }))}
                placeholder="ssh-ed25519 AAAA..."
                rows={2}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? "عبارة المرور (إن وجدت)" : "Passphrase (if any)"}</Label>
              <Input
                type="password"
                value={newKey.passphrase}
                onChange={(e) => setNewKey(p => ({ ...p, passphrase: e.target.value }))}
                placeholder={isRtl ? "عبارة مرور المفتاح" : "Key passphrase"}
              />
            </div>

            <Separator />

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-600">
                  {isRtl ? "كلمة المرور الرئيسية للتشفير" : "Master Encryption Password"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRtl ? "كلمة المرور" : "Password"} *</Label>
                  <Input
                    type="password"
                    value={newKey.masterPassword}
                    onChange={(e) => setNewKey(p => ({ ...p, masterPassword: e.target.value }))}
                    data-testid="input-master-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRtl ? "تأكيد كلمة المرور" : "Confirm Password"} *</Label>
                  <Input
                    type="password"
                    value={newKey.confirmMasterPassword}
                    onChange={(e) => setNewKey(p => ({ ...p, confirmMasterPassword: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isRtl 
                  ? "احفظ هذه الكلمة بأمان - لن نتمكن من استعادة المفتاح بدونها"
                  : "Save this password securely - we cannot recover the key without it"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKey(false)}>
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => addKeyMutation.mutate()}
              disabled={
                !newKey.name || 
                !newKey.privateKey || 
                !newKey.masterPassword ||
                newKey.masterPassword !== newKey.confirmMasterPassword ||
                addKeyMutation.isPending
              }
              className="gap-2"
              data-testid="button-save-key"
            >
              {addKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isRtl ? "تشفير وحفظ" : "Encrypt & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showKeyDetails} onOpenChange={(open) => { 
        setShowKeyDetails(open); 
        if (!open) { setDecryptedKey(null); setDecryptPassword(""); setShowPrivateKey(false); }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedKey && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {selectedKey.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">{isRtl ? "النوع" : "Type"}</Label>
                    <p className="font-medium">{selectedKey.keyType.toUpperCase()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{isRtl ? "الحالة" : "Status"}</Label>
                    <div>
                      <Badge variant={selectedKey.isActive && !selectedKey.isRevoked ? "default" : "destructive"}>
                        {selectedKey.isRevoked ? (isRtl ? "ملغى" : "Revoked") : selectedKey.isActive ? (isRtl ? "نشط" : "Active") : (isRtl ? "معطل" : "Inactive")}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedKey.serverHost && (
                  <div>
                    <Label className="text-muted-foreground">{isRtl ? "السيرفر" : "Server"}</Label>
                    <p className="font-mono text-sm">{selectedKey.serverUsername}@{selectedKey.serverHost}:{selectedKey.serverPort}</p>
                  </div>
                )}

                {selectedKey.keyFingerprint && (
                  <div>
                    <Label className="text-muted-foreground">{isRtl ? "البصمة" : "Fingerprint"}</Label>
                    <p className="font-mono text-xs break-all">{selectedKey.keyFingerprint}</p>
                  </div>
                )}

                <Separator />

                {!showPrivateKey ? (
                  <div className="space-y-3">
                    <Label>{isRtl ? "فك تشفير المفتاح الخاص" : "Decrypt Private Key"}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={decryptPassword}
                        onChange={(e) => setDecryptPassword(e.target.value)}
                        placeholder={isRtl ? "كلمة المرور الرئيسية" : "Master password"}
                        className="flex-1"
                      />
                      <Button onClick={handleDecryptKey} disabled={!decryptPassword} className="gap-2">
                        <Eye className="w-4 h-4" />
                        {isRtl ? "عرض" : "View"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{isRtl ? "المفتاح الخاص" : "Private Key"}</Label>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => decryptedKey && copyToClipboard(decryptedKey)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowPrivateKey(false); setDecryptedKey(null); }}>
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={decryptedKey || ""}
                      readOnly
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {!selectedKey.isRevoked && (
                  <Button
                    variant="outline"
                    className="text-amber-600"
                    onClick={() => revokeKeyMutation.mutate({ id: selectedKey.id, reason: "Manual revocation" })}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {isRtl ? "إلغاء" : "Revoke"}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => deleteKeyMutation.mutate(selectedKey.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRtl ? "حذف" : "Delete"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Update Dialog */}
      <Dialog open={showPasswordUpdate} onOpenChange={setShowPasswordUpdate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {isRtl ? "تحديث كلمة المرور" : "Update Password"}
            </DialogTitle>
            <DialogDescription>
              {isRtl ? "أدخل كلمة المرور الحالية والجديدة" : "Enter your current and new password"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRtl ? "كلمة المرور الحالية" : "Current Password"}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isRtl ? "كلمة المرور الحالية" : "Current password"}
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? "كلمة المرور الجديدة" : "New Password"}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isRtl ? "كلمة المرور الجديدة" : "New password"}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={isRtl ? "تأكيد كلمة المرور" : "Confirm password"}
                data-testid="input-confirm-new-password"
              />
              {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordUpdate(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              }}
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => updatePasswordMutation.mutate({ currentPassword, newPassword })}
              disabled={
                !currentPassword ||
                !newPassword ||
                newPassword !== confirmNewPassword ||
                newPassword.length < 8 ||
                updatePasswordMutation.isPending
              }
              data-testid="button-confirm-update-password"
            >
              {updatePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isRtl ? "تحديث" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
