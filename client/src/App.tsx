import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Builder from "@/pages/builder";
import Projects from "@/pages/projects";
import Templates from "@/pages/templates";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/:id" component={Builder} />
      <Route path="/projects" component={Projects} />
      <Route path="/templates" component={Templates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isRtl } = useLanguage();

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <header className="flex items-center justify-end gap-2 p-3 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main>
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
