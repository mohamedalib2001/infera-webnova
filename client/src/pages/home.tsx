import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Cpu className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            INFERA WebNova
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            {language === "ar" 
              ? "منصة بناء المواقع الذكية" 
              : "Intelligent Platform Builder"}
          </p>
          <Button 
            onClick={() => setLocation("/builder")}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {language === "ar" ? "ابدأ الآن" : "Get Started"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === "ar" ? "AI-Powered" : "AI-Powered"}
            </h3>
            <p className="text-slate-400">
              {language === "ar" 
                ? "دع الذكاء الاصطناعي يبني موقعك" 
                : "Let AI build your platform"}
            </p>
          </Card>
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === "ar" ? "سريع" : "Fast"}
            </h3>
            <p className="text-slate-400">
              {language === "ar" 
                ? "انشر موقعك في دقائق" 
                : "Deploy in minutes"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
