import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Shield, 
  Target,
  CheckCircle2,
  Building2,
  Landmark,
  Briefcase,
  Brain,
  Lock,
  Workflow,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { 
  aboutIntro,
  problemStatement,
  ecosystemDescription,
  valueProposition,
  targetAudience,
  principles,
  positioning,
  closingStatement,
  aboutMeta
} from "@/lib/about-data";

export default function About() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const getAudienceIcon = (index: number) => {
    switch (index) {
      case 0: return <Landmark className="w-6 h-6" />;
      case 1: return <Building2 className="w-6 h-6" />;
      case 2: return <Briefcase className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const getPrincipleIcon = (index: number) => {
    switch (index) {
      case 0: return <Brain className="w-5 h-5" />;
      case 1: return <Shield className="w-5 h-5" />;
      case 2: return <Workflow className="w-5 h-5" />;
      case 3: return <Clock className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <section className="mb-16">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-6 bg-white/10 text-white border-white/20 text-sm px-4 py-1">
                  {isRtl ? aboutMeta.subtitleAr : aboutMeta.subtitle}
                </Badge>
                <CardTitle className="text-4xl font-bold mb-6">
                  {isRtl ? aboutIntro.titleAr : aboutIntro.title}
                </CardTitle>
                <p className="text-2xl font-semibold text-white/90 mb-4">
                  {isRtl ? aboutIntro.statementAr : aboutIntro.statement}
                </p>
                <p className="text-lg text-white/70 max-w-3xl mx-auto">
                  {isRtl ? aboutIntro.descriptionAr : aboutIntro.description}
                </p>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-6">
                  {isRtl ? problemStatement.introAr : problemStatement.intro}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {problemStatement.problems.map((p, i) => (
                    <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-2" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        {isRtl ? p.problemAr : p.problem}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Lock className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="text-lg">
                  {isRtl ? ecosystemDescription.statementAr : ecosystemDescription.statement}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8 bg-slate-900 text-white text-center">
                <p className="text-xl font-semibold mb-2">
                  {isRtl ? valueProposition.statementAr : valueProposition.statement}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {isRtl ? valueProposition.subStatementAr : valueProposition.subStatement}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRtl ? targetAudience.titleAr : targetAudience.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {targetAudience.audiences.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      {getAudienceIcon(i)}
                    </div>
                    <p className="font-medium">{isRtl ? a.audienceAr : a.audience}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRtl ? principles.titleAr : principles.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {principles.items.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getPrincipleIcon(i)}
                    </div>
                    <p className="font-medium">{isRtl ? p.principleAr : p.principle}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">
                  {isRtl ? positioning.statementAr : positioning.statement}
                </p>
                <p className="text-muted-foreground">
                  {isRtl ? positioning.subStatementAr : positioning.subStatement}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
                <p className="text-xl font-bold">
                  {isRtl ? closingStatement.statementAr : closingStatement.statement}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
