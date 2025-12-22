import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Tablet,
  Monitor,
  RotateCcw,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Moon,
  Sun
} from "lucide-react";

interface Screen {
  name: string;
  description: string;
  components: string[];
}

interface AppLivePreviewProps {
  projectName: string;
  screens: Screen[];
  primaryColor: string;
  language: "ar" | "en";
  type: "mobile" | "desktop";
  framework?: string;
}

const translations = {
  ar: {
    noScreens: "لا توجد شاشات للمعاينة",
    generateFirst: "قم بتوليد واجهة المستخدم بالذكاء الاصطناعي أولاً",
    preview: "معاينة التطبيق",
    phone: "هاتف",
    tablet: "تابلت",
    desktop: "سطح المكتب",
    screens: "الشاشات",
    components: "المكونات",
    refresh: "تحديث",
    fullscreen: "شاشة كاملة",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    screen: "شاشة"
  },
  en: {
    noScreens: "No screens to preview",
    generateFirst: "Generate UI with AI first",
    preview: "App Preview",
    phone: "Phone",
    tablet: "Tablet",
    desktop: "Desktop",
    screens: "Screens",
    components: "Components",
    refresh: "Refresh",
    fullscreen: "Fullscreen",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    screen: "Screen"
  }
};

export function AppLivePreview({ 
  projectName, 
  screens, 
  primaryColor, 
  language, 
  type,
  framework 
}: AppLivePreviewProps) {
  const t = translations[language];
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(type === "mobile" ? "phone" : "desktop");
  const [activeScreen, setActiveScreen] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const deviceDimensions = {
    phone: { width: 375, height: 667, scale: 0.85 },
    tablet: { width: 768, height: 1024, scale: 0.6 },
    desktop: { width: 1280, height: 800, scale: 0.5 }
  };

  const dim = deviceDimensions[device];

  const getDeviceFrame = () => {
    switch (device) {
      case "phone":
        return "rounded-[2.5rem] border-8 border-gray-800 dark:border-gray-700";
      case "tablet":
        return "rounded-[1.5rem] border-8 border-gray-800 dark:border-gray-700";
      case "desktop":
        return "rounded-lg border-4 border-gray-700";
    }
  };

  if (screens.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">{t.noScreens}</p>
        <p className="text-sm text-muted-foreground">{t.generateFirst}</p>
      </Card>
    );
  }

  const currentScreen = screens[activeScreen];

  const renderMockUI = () => {
    const bgColor = isDarkMode ? "#1f2937" : "#ffffff";
    const textColor = isDarkMode ? "#f9fafb" : "#111827";
    const cardBg = isDarkMode ? "#374151" : "#f3f4f6";

    return (
      <div 
        style={{ 
          backgroundColor: bgColor, 
          color: textColor,
          width: "100%",
          height: "100%",
          overflow: "hidden"
        }}
        className="flex flex-col"
      >
        <div 
          style={{ backgroundColor: primaryColor }}
          className="px-4 py-3 flex items-center justify-between"
        >
          <span className="font-bold text-white text-sm">{projectName}</span>
          <Badge variant="secondary" className="text-xs">{framework}</Badge>
        </div>

        <div className="flex-1 p-3 overflow-auto">
          <h2 className="text-lg font-semibold mb-2">{currentScreen.name}</h2>
          <p className="text-xs opacity-70 mb-4">{currentScreen.description}</p>

          <div className="space-y-2">
            {currentScreen.components.map((comp, idx) => (
              <div 
                key={idx}
                style={{ backgroundColor: cardBg }}
                className="p-3 rounded-lg text-sm flex items-center gap-2"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: primaryColor }}
                />
                {comp}
              </div>
            ))}
          </div>
        </div>

        <div 
          style={{ backgroundColor: cardBg }}
          className="px-4 py-2 flex justify-around border-t"
        >
          {screens.slice(0, 4).map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveScreen(idx)}
              className={`text-xs py-1 px-2 rounded ${idx === activeScreen ? 'opacity-100' : 'opacity-50'}`}
              style={{ color: idx === activeScreen ? primaryColor : textColor }}
            >
              {s.name.substring(0, 8)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={device === "phone" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("phone")}
            disabled={type === "desktop"}
            data-testid="button-device-phone"
          >
            <Smartphone className="h-4 w-4" />
            {t.phone}
          </Button>
          <Button
            variant={device === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("tablet")}
            data-testid="button-device-tablet"
          >
            <Tablet className="h-4 w-4" />
            {t.tablet}
          </Button>
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setDevice("desktop")}
            data-testid="button-device-desktop"
          >
            <Monitor className="h-4 w-4" />
            {t.desktop}
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline">{t.screens}: {screens.length}</Badge>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            data-testid="button-toggle-dark-mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setKey(k => k + 1)}
            data-testid="button-refresh-preview"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-preview-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-xl p-4 min-h-[400px]">
        <div 
          key={key}
          className={`${getDeviceFrame()} overflow-hidden shadow-2xl`}
          style={{
            width: dim.width * dim.scale,
            height: dim.height * dim.scale
          }}
        >
          <div 
            style={{ 
              width: dim.width, 
              height: dim.height,
              transform: `scale(${dim.scale})`,
              transformOrigin: "top left"
            }}
          >
            {renderMockUI()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Tabs value={String(activeScreen)} onValueChange={(v) => setActiveScreen(Number(v))}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {screens.map((screen, idx) => (
              <TabsTrigger 
                key={idx} 
                value={String(idx)}
                data-testid={`tab-screen-${idx}`}
              >
                {screen.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {screens.map((screen, idx) => (
            <TabsContent key={idx} value={String(idx)} className="mt-2">
              <Card className="p-4">
                <h3 className="font-medium mb-2">{screen.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{screen.description}</p>
                <div className="flex flex-wrap gap-2">
                  {screen.components.map((comp, i) => (
                    <Badge key={i} variant="secondary">{comp}</Badge>
                  ))}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
