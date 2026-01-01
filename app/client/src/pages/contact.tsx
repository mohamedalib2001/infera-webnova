import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Mail, 
  Shield,
  AlertTriangle,
  FileWarning,
  MessageSquare,
  Scale,
  Lock,
  Brain,
  CreditCard,
} from "lucide-react";
import { 
  contactIntro,
  contactChannels,
  accessPolicy,
  securityNotice,
  governanceNotice,
  contactClosing,
  contactMeta
} from "@/lib/contact-data";

export default function Contact() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "general": return <MessageSquare className="w-5 h-5" />;
      case "legal": return <Scale className="w-5 h-5" />;
      case "privacy": return <Lock className="w-5 h-5" />;
      case "ai": return <Brain className="w-5 h-5" />;
      case "billing": return <CreditCard className="w-5 h-5" />;
      default: return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-10">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Mail className="w-4 h-4 mr-2" />
                  {isRtl ? contactMeta.subtitleAr : contactMeta.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-4">
                  {isRtl ? contactMeta.titleAr : contactMeta.title}
                </CardTitle>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                {isRtl ? contactIntro.statementAr : contactIntro.statement}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-center">
            {isRtl ? contactMeta.subtitleAr : contactMeta.subtitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactChannels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        {getChannelIcon(channel.id)}
                      </div>
                      <div>
                        <p className="font-medium">{isRtl ? channel.titleAr : channel.title}</p>
                        <a 
                          href={`mailto:${channel.email}`}
                          className="text-sm text-primary hover:underline"
                          data-testid={`link-email-${channel.id}`}
                        >
                          {channel.email}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                {isRtl ? accessPolicy.titleAr : accessPolicy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {accessPolicy.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {isRtl ? item.textAr : item.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card className="border-red-500/20">
            <CardHeader className="border-b bg-red-500/5 py-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                {isRtl ? securityNotice.titleAr : securityNotice.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="font-medium text-red-600 dark:text-red-400 mb-2">
                {isRtl ? securityNotice.warningAr : securityNotice.warning}
              </p>
              <ul className="space-y-1 mb-4">
                {securityNotice.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {isRtl ? item.textAr : item.text}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                {isRtl ? securityNotice.noteAr : securityNotice.note}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10">
          <Card>
            <CardHeader className="border-b bg-muted/30 py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-amber-500" />
                {isRtl ? governanceNotice.titleAr : governanceNotice.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="font-medium mb-2">
                {isRtl ? governanceNotice.introAr : governanceNotice.intro}
              </p>
              <ul className="space-y-1 mb-4">
                {governanceNotice.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {isRtl ? item.textAr : item.text}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground font-medium">
                {isRtl ? governanceNotice.noteAr : governanceNotice.note}
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="overflow-hidden">
            <CardContent className="p-8 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
              <Shield className="w-8 h-8 text-blue-300 mx-auto mb-4" />
              <p className="text-lg font-medium">
                {isRtl ? contactClosing.statementAr : contactClosing.statement}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
