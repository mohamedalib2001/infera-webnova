import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/hooks/use-language";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Builder from "@/pages/builder";
import Projects from "@/pages/projects";
import Templates from "@/pages/templates";
import Preview from "@/pages/preview";
import Pricing from "@/pages/pricing";
import Sovereign from "@/pages/sovereign";
import ChatbotBuilder from "@/pages/chatbot-builder";
import Analytics from "@/pages/analytics";
import SEOOptimizer from "@/pages/seo-optimizer";
import WhiteLabel from "@/pages/white-label";
import OwnerDashboard from "@/pages/owner-dashboard";
import OwnerNotifications from "@/pages/owner-notifications";
import OwnerInfrastructure from "@/pages/owner-infrastructure";
import OwnerIntegrations from "@/pages/owner-integrations";
import OwnerAISovereignty from "@/pages/owner-ai-sovereignty";
import AiAppBuilder from "@/pages/ai-app-builder";
import IDEProjects from "@/pages/ide-projects";
import CloudIDE from "@/pages/cloud-ide";
import SovereignControlCenter from "@/pages/sovereign-control-center";
import Domains from "@/pages/domains";
import Settings from "@/pages/settings";
import PlatformGenerator from "@/pages/platform-generator";
import ApiKeys from "@/pages/api-keys";
import PaymentsDashboard from "@/pages/payments-dashboard";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import Subscription from "@/pages/subscription";
import Notifications from "@/pages/notifications";
import Marketing from "@/pages/marketing";
import Invoices from "@/pages/invoices";
import Integrations from "@/pages/integrations";
import SmartSuggestions from "@/pages/smart-suggestions";
import OneClickDeploy from "@/pages/one-click-deploy";
import BackendGenerator from "@/pages/backend-generator";
import GitControl from "@/pages/git-control";
import AICopilot from "@/pages/ai-copilot";
import TestingGenerator from "@/pages/testing-generator";
import Marketplace from "@/pages/marketplace";
import Collaboration from "@/pages/collaboration";
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
      <Route path="/pricing" component={Pricing} />
      <Route path="/sovereign" component={Sovereign} />
      <Route path="/chatbot-builder" component={ChatbotBuilder} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/seo-optimizer" component={SEOOptimizer} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/owner" component={OwnerDashboard} />
      <Route path="/owner/notifications" component={OwnerNotifications} />
      <Route path="/owner/infrastructure" component={OwnerInfrastructure} />
      <Route path="/owner/integrations" component={OwnerIntegrations} />
      <Route path="/owner/ai-sovereignty" component={OwnerAISovereignty} />
      <Route path="/ai-builder" component={AiAppBuilder} />
      <Route path="/ide" component={IDEProjects} />
      <Route path="/ide/:id" component={CloudIDE} />
      <Route path="/sovereign-control" component={SovereignControlCenter} />
      <Route path="/domains" component={Domains} />
      <Route path="/settings" component={Settings} />
      <Route path="/platform-generator" component={PlatformGenerator} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/payments" component={PaymentsDashboard} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancel" component={PaymentCancel} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/smart-suggestions" component={SmartSuggestions} />
      <Route path="/deploy" component={OneClickDeploy} />
      <Route path="/backend-generator" component={BackendGenerator} />
      <Route path="/git" component={GitControl} />
      <Route path="/ai-copilot" component={AICopilot} />
      <Route path="/testing" component={TestingGenerator} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/collaboration" component={Collaboration} />
      <Route path="/preview/:shareCode" component={Preview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
