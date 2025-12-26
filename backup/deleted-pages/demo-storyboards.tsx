import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { motion } from "framer-motion";
import { 
  Film, 
  Download,
  Play,
  Clock,
  ChevronRight,
  Cpu,
  DollarSign,
  Users,
  Shield,
  GraduationCap,
  Briefcase,
  Building2,
  Globe2,
  Brain,
  Smartphone,
  FileSearch,
  Hotel,
  Target,
  Sparkles,
  FileText,
} from "lucide-react";
import { inferaPlatforms } from "@/lib/pitch-deck-data";

const platformIcons: Record<string, typeof Cpu> = {
  "webnova": Cpu,
  "engine-control": Building2,
  "engine": Cpu,
  "finance": DollarSign,
  "humaniq": Users,
  "legal": FileText,
  "appforge": Sparkles,
  "marketing": Target,
  "marketplace": Building2,
  "education": GraduationCap,
  "attend": Users,
  "smartdocs": FileSearch,
  "hospitality": Hotel,
  "smartmemory": Brain,
  "visionfeasibility": Target,
  "cvbuilder": FileText,
  "jobsai": Briefcase,
  "trainai": GraduationCap,
  "sovereignfinance": DollarSign,
  "globalcloud": Globe2,
  "shieldgrid": Shield,
  "smartremote": Smartphone,
};

const platformColors: Record<string, string> = {
  "webnova": "from-indigo-600 to-purple-700",
  "engine-control": "from-amber-600 to-violet-700",
  "engine": "from-blue-600 to-indigo-700",
  "finance": "from-emerald-600 to-green-700",
  "humaniq": "from-rose-600 to-pink-700",
  "legal": "from-slate-600 to-gray-700",
  "appforge": "from-orange-600 to-red-700",
  "marketing": "from-pink-600 to-rose-700",
  "marketplace": "from-teal-600 to-cyan-700",
  "education": "from-violet-600 to-purple-700",
  "attend": "from-cyan-600 to-blue-700",
  "smartdocs": "from-sky-600 to-blue-700",
  "hospitality": "from-amber-600 to-orange-700",
  "smartmemory": "from-purple-600 to-violet-700",
  "visionfeasibility": "from-lime-600 to-green-700",
  "cvbuilder": "from-indigo-600 to-blue-700",
  "jobsai": "from-green-600 to-emerald-700",
  "trainai": "from-yellow-600 to-amber-700",
  "sovereignfinance": "from-emerald-600 to-teal-700",
  "globalcloud": "from-blue-600 to-cyan-700",
  "shieldgrid": "from-slate-600 to-zinc-700",
  "smartremote": "from-purple-600 to-violet-700",
};

export default function DemoStoryboards() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const selectedPlatformData = selectedPlatform 
    ? inferaPlatforms.find(p => p.id === selectedPlatform) 
    : null;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-2 border-violet-500/50 bg-violet-500/10">
              <Film className="w-4 h-4 mr-2 text-violet-400" />
              <span className="text-violet-400 font-medium">
                {isRtl ? "سيناريوهات العرض التوضيحي" : "Demo Storyboards"}
              </span>
            </Badge>
            <span className="text-muted-foreground">
              {isRtl ? `${inferaPlatforms.length} منصة` : `${inferaPlatforms.length} Platforms`}
            </span>
          </div>
          <Button variant="outline" className="gap-2" data-testid="button-download-all-storyboards">
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل الكل PDF" : "Download All PDF"}
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {isRtl ? "سيناريوهات العرض التوضيحي لمنظومة INFERA" : "INFERA Demo Storyboards"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isRtl 
              ? "سيناريو تفصيلي لكل عرض توضيحي يتضمن المشاهد والمدة والوصف لكل خطوة في العرض."
              : "Detailed storyboard for each demo presentation including scenes, duration, and description for each step."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              {isRtl ? "اختر منصة" : "Select a Platform"}
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {inferaPlatforms.map((platform) => {
                const Icon = platformIcons[platform.id] || Cpu;
                const isSelected = selectedPlatform === platform.id;
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
                    }`}
                    data-testid={`button-select-platform-${platform.id}`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                      {isRtl ? platform.nameAr : platform.name}
                    </span>
                    {isSelected && <ChevronRight className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPlatformData ? (
              <motion.div
                key={selectedPlatformData.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${platformColors[selectedPlatformData.id]} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white/20">
                          <Film className="w-8 h-8" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">
                            {isRtl ? selectedPlatformData.nameAr : selectedPlatformData.name}
                          </CardTitle>
                          <CardDescription className="text-white/80">
                            {isRtl ? "سيناريو العرض التوضيحي" : "Demo Storyboard"}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="secondary" className="gap-2" data-testid="button-download-storyboard">
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Film className="w-4 h-4" />
                        <span>{selectedPlatformData.demoStoryboard.scenes.length} {isRtl ? "مشاهد" : "Scenes"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {selectedPlatformData.demoStoryboard.scenes.reduce((acc, scene) => {
                            const mins = parseInt(scene.duration.split(' ')[0]) || 0;
                            return acc + mins;
                          }, 0)} {isRtl ? "دقائق إجمالي" : "mins total"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedPlatformData.demoStoryboard.scenes.map((scene, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">
                                  {isRtl ? scene.titleAr : scene.title}
                                </h3>
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="w-3 h-3" />
                                  {scene.duration}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {isRtl ? scene.descriptionAr : scene.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <Button variant="outline" className="gap-2" data-testid="button-play-demo">
                        <Play className="w-4 h-4" />
                        {isRtl ? "معاينة العرض" : "Preview Demo"}
                      </Button>
                      <Button className="gap-2" data-testid="button-view-pitch">
                        {isRtl ? "عرض العرض الكامل" : "View Full Pitch"}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">
                    {isRtl ? "اختر منصة لعرض سيناريو العرض التوضيحي" : "Select a platform to view its demo storyboard"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
