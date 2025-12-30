import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { 
  Bot, Menu, Moon, Sun, Download, Upload, Play, Settings,
  Rocket, GitBranch, Globe, Zap, ArrowLeft, Brain, Activity,
  Layers, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { BuilderSidebar } from '@/components/nova-builder/BuilderSidebar';
import { ArchitectureCanvas } from '@/components/nova-builder/ArchitectureCanvas';
import { AISmartPanel } from '@/components/nova-builder/AISmartPanel';
import { BottomConsole } from '@/components/nova-builder/BottomConsole';
import { AIOrchestrator } from '@/components/nova-builder/AIOrchestrator';
import { SmartDashboard } from '@/components/nova-builder/SmartDashboard';
import { ProactiveIntelligence } from '@/components/nova-builder/ProactiveIntelligence';
import { ProjectTypeSelector, projectTypes, ProjectType } from '@/components/nova-builder/ProjectTypeSelector';
import { Link } from 'wouter';

interface AISuggestion {
  id: string;
  type: 'optimization' | 'security' | 'scalability' | 'cost';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  autoApply?: boolean;
}

interface CostEstimate {
  monthly: number;
  breakdown: { name: string; cost: number }[];
  savings?: { amount: number; suggestion: string };
}

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fix?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export default function SmartPlatformBuilder() {
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const [dockerCompose, setDockerCompose] = useState('');
  const [kubernetesYaml, setKubernetesYaml] = useState('');
  const [terraformCode, setTerraformCode] = useState('');
  const [showOrchestrator, setShowOrchestrator] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projectType, setProjectType] = useState<string>('general');
  const { toast } = useToast();

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      level,
      message
    }]);
  }, []);

  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes);
  }, []);

  const handleDragStart = useCallback((nodeType: string, nodeData: any) => {
    addLog('info', `Preparing to add ${nodeData.label}`);
  }, [addLog]);

  const handleAIAction = useCallback(async (action: string) => {
    addLog('info', `Executing AI action: ${action}`);
    setIsAnalyzing(true);

    try {
      const architectureData = {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
        edges: edges.map(e => ({ source: e.source, target: e.target })),
        action
      };

      const response = await apiRequest('POST', '/api/ai/analyze-architecture', architectureData);
      const result = await response.json();

      if (result.suggestions) setSuggestions(result.suggestions);
      if (result.costEstimate) setCostEstimate(result.costEstimate);
      if (result.securityIssues) setSecurityIssues(result.securityIssues);
      if (result.dockerCompose) setDockerCompose(result.dockerCompose);
      if (result.kubernetesYaml) setKubernetesYaml(result.kubernetesYaml);
      if (result.terraformCode) setTerraformCode(result.terraformCode);

      addLog('success', `AI analysis complete for action: ${action}`);
    } catch (error) {
      addLog('error', `AI action failed: ${error}`);
      
      if (action === 'analyze' && nodes.length > 0) {
        const mockCost: CostEstimate = {
          monthly: nodes.length * 150 + Math.random() * 500,
          breakdown: nodes.map(n => ({
            name: (n.data as any).label || n.id,
            cost: 50 + Math.random() * 200
          })),
          savings: {
            amount: Math.floor(Math.random() * 300) + 100,
            suggestion: t('Use spot instances for non-critical services', 'استخدم الخوادم المؤقتة للخدمات غير الحرجة')
          }
        };
        setCostEstimate(mockCost);

        const mockSuggestions: AISuggestion[] = [
          {
            id: 'sug-1',
            type: 'optimization',
            title: t('Add caching layer', 'إضافة طبقة تخزين مؤقت'),
            description: t('Add Redis cache between API Gateway and services for 40% faster response times', 'أضف ذاكرة Redis بين البوابة والخدمات لتسريع الاستجابة 40%'),
            impact: 'high'
          },
          {
            id: 'sug-2',
            type: 'scalability',
            title: t('Enable auto-scaling', 'تفعيل التوسع التلقائي'),
            description: t('Configure horizontal pod autoscaling for your services', 'إعداد التوسع الأفقي للخدمات'),
            impact: 'medium'
          }
        ];
        setSuggestions(mockSuggestions);

        if (nodes.some(n => n.type === 'service' && !(n.data as any).nodeType?.includes('auth'))) {
          setSecurityIssues([{
            id: 'sec-1',
            severity: 'medium',
            title: t('Missing authentication', 'مصادقة مفقودة'),
            description: t('Some services lack proper authentication', 'بعض الخدمات تفتقر للمصادقة'),
            fix: t('Add auth-service', 'أضف خدمة المصادقة')
          }]);
        }

        addLog('success', t('Analysis complete (mock data)', 'تم التحليل (بيانات تجريبية)'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges, addLog, t]);

  const handleArchitectureAnalysis = useCallback((analysisNodes: Node[], analysisEdges: Edge[]) => {
    setNodes(analysisNodes);
    setEdges(analysisEdges);
    handleAIAction('analyze');
  }, [handleAIAction]);

  const handleApplySuggestion = useCallback((suggestion: AISuggestion) => {
    addLog('info', `Applying suggestion: ${suggestion.title}`);
    toast({
      title: t('Suggestion Applied', 'تم تطبيق الاقتراح'),
      description: suggestion.title
    });
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }, [addLog, toast, t]);

  const handleAskAI = useCallback(async (question: string) => {
    addLog('info', `User question: ${question}`);
    toast({
      title: t('Processing...', 'جاري المعالجة...'),
      description: question.substring(0, 50) + '...'
    });
  }, [addLog, toast, t]);

  const handleExport = useCallback((type: 'docker' | 'k8s' | 'terraform') => {
    let content = '';
    let filename = '';
    
    switch (type) {
      case 'docker':
        content = dockerCompose || generateDockerCompose(nodes);
        filename = 'docker-compose.yml';
        break;
      case 'k8s':
        content = kubernetesYaml || generateKubernetesYaml(nodes);
        filename = 'kubernetes.yaml';
        break;
      case 'terraform':
        content = terraformCode || generateTerraformCode(nodes);
        filename = 'main.tf';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    addLog('success', `Exported ${filename}`);
    toast({
      title: t('Exported!', 'تم التصدير!'),
      description: filename
    });
  }, [dockerCompose, kubernetesYaml, terraformCode, nodes, addLog, toast, t]);

  const handleProjectTypeSelect = useCallback((type: ProjectType) => {
    setProjectType(type.id);
    addLog('info', `Project type set to: ${type.name.en}`);
    toast({
      title: t('Project Type Selected', 'تم اختيار نوع المشروع'),
      description: type.name[language]
    });
  }, [addLog, toast, t, language]);

  const handleProactiveSuggestionApply = useCallback((nodeType: string, nodeData: any) => {
    addLog('success', `Applied proactive suggestion: ${nodeType}`);
    toast({
      title: t('Component Added', 'تمت إضافة المكون'),
      description: nodeData.label
    });
  }, [addLog, toast, t]);

  const handleDashboardAction = useCallback((action: string) => {
    switch (action) {
      case 'optimize-build':
        setShowOrchestrator(true);
        break;
      case 'auto-fix-security':
        handleAIAction('security-check');
        break;
      case 'show-alternatives':
        handleAIAction('optimize-cost');
        break;
      case 'optimize-performance':
        handleAIAction('analyze');
        break;
      default:
        addLog('info', `Dashboard action: ${action}`);
    }
  }, [handleAIAction, addLog]);

  const handleOrchestratorRecommendation = useCallback((recommendation: any) => {
    addLog('success', `Applied recommendation: ${recommendation.title}`);
    toast({
      title: t('Recommendation Applied', 'تم تطبيق التوصية'),
      description: recommendation.title
    });
    setShowOrchestrator(false);
  }, [addLog, toast, t]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/platform-builder">
            <Button variant="ghost" size="icon" className="h-9 w-9" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">{t('Nova Visual Builder', 'منشئ نوفا المرئي')}</h1>
              <p className="text-xs text-muted-foreground">{t('Drag & Drop Architecture', 'سحب وإفلات البنية')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowProjectSelector(true)}
            data-testid="button-project-type"
          >
            <Target className="w-4 h-4" />
            {projectType === 'general' ? t('Select Type', 'اختر النوع') : projectType}
          </Button>

          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            {nodes.length} {t('components', 'مكونات')}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowOrchestrator(true)}
            disabled={nodes.length === 0}
            data-testid="button-ai-orchestrator"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            {t('AI Architect', 'المهندس الذكي')}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setShowDashboard(!showDashboard)}
            data-testid="button-toggle-dashboard"
          >
            <Activity className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            data-testid="button-language"
          >
            <Globe className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            data-testid="button-theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleExport('docker')}
            disabled={nodes.length === 0}
            data-testid="button-export"
          >
            <Download className="w-4 h-4" />
            {t('Export', 'تصدير')}
          </Button>

          <Button 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
            disabled={nodes.length === 0}
            data-testid="button-deploy"
          >
            <Rocket className="w-4 h-4" />
            {t('Deploy', 'نشر')}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <BuilderSidebar
          language={language}
          onDragStart={handleDragStart}
          onAIAction={handleAIAction}
        />

        <div className="flex-1 flex flex-col">
          <ArchitectureCanvas
            language={language}
            onNodesChange={handleNodesChange}
            onArchitectureAnalysis={handleArchitectureAnalysis}
          />
          
          <BottomConsole
            language={language}
            logs={logs}
            dockerCompose={dockerCompose || generateDockerCompose(nodes)}
            kubernetesYaml={kubernetesYaml || generateKubernetesYaml(nodes)}
            terraformCode={terraformCode || generateTerraformCode(nodes)}
            isExpanded={consoleExpanded}
            onToggleExpand={() => setConsoleExpanded(!consoleExpanded)}
            onExport={handleExport}
          />
        </div>

        <AISmartPanel
          language={language}
          suggestions={suggestions}
          costEstimate={costEstimate}
          securityIssues={securityIssues}
          isAnalyzing={isAnalyzing}
          onApplySuggestion={handleApplySuggestion}
          onAskAI={handleAskAI}
        />
      </div>

      <ProactiveIntelligence
        language={language}
        nodes={nodes}
        projectType={projectType}
        onSuggestionApply={handleProactiveSuggestionApply}
        onDismiss={(id) => addLog('info', `Dismissed suggestion: ${id}`)}
      />

      <SmartDashboard
        language={language}
        nodes={nodes}
        edges={edges}
        isVisible={showDashboard && nodes.length > 0}
        onClose={() => setShowDashboard(false)}
        onActionClick={handleDashboardAction}
      />

      <AIOrchestrator
        language={language}
        nodes={nodes}
        edges={edges}
        projectType={projectType}
        isVisible={showOrchestrator}
        onClose={() => setShowOrchestrator(false)}
        onApplyRecommendation={handleOrchestratorRecommendation}
      />

      <ProjectTypeSelector
        language={language}
        isOpen={showProjectSelector}
        onClose={() => setShowProjectSelector(false)}
        onSelect={handleProjectTypeSelect}
        currentType={projectType}
      />
    </div>
  );
}

function generateDockerCompose(nodes: Node[]): string {
  if (nodes.length === 0) return '# Add components to generate Docker Compose';
  
  let compose = `version: '3.8'\n\nservices:\n`;
  
  nodes.forEach(node => {
    const data = node.data as any;
    const name = data.label?.toLowerCase().replace(/\s+/g, '-') || node.id;
    
    if (node.type === 'service') {
      compose += `  ${name}:\n`;
      compose += `    build: ./${name}\n`;
      compose += `    ports:\n`;
      compose += `      - "8080"\n`;
      compose += `    environment:\n`;
      compose += `      - NODE_ENV=production\n`;
      compose += `    restart: unless-stopped\n\n`;
    } else if (node.type === 'database') {
      if (data.nodeType === 'postgresql') {
        compose += `  postgres:\n`;
        compose += `    image: postgres:15-alpine\n`;
        compose += `    environment:\n`;
        compose += `      - POSTGRES_PASSWORD=\${DB_PASSWORD}\n`;
        compose += `    volumes:\n`;
        compose += `      - postgres_data:/var/lib/postgresql/data\n\n`;
      } else if (data.nodeType === 'redis') {
        compose += `  redis:\n`;
        compose += `    image: redis:7-alpine\n`;
        compose += `    restart: unless-stopped\n\n`;
      } else if (data.nodeType === 'mongodb') {
        compose += `  mongodb:\n`;
        compose += `    image: mongo:6\n`;
        compose += `    volumes:\n`;
        compose += `      - mongo_data:/data/db\n\n`;
      }
    }
  });

  compose += `\nvolumes:\n`;
  compose += `  postgres_data:\n`;
  compose += `  mongo_data:\n`;

  return compose;
}

function generateKubernetesYaml(nodes: Node[]): string {
  if (nodes.length === 0) return '# Add components to generate Kubernetes manifests';
  
  let yaml = `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: platform\n---\n`;

  nodes.filter(n => n.type === 'service').forEach(node => {
    const data = node.data as any;
    const name = data.label?.toLowerCase().replace(/\s+/g, '-') || node.id;
    
    yaml += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ${name}\n  namespace: platform\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: ${name}\n  template:\n    metadata:\n      labels:\n        app: ${name}\n    spec:\n      containers:\n      - name: ${name}\n        image: ${name}:latest\n        ports:\n        - containerPort: 8080\n        resources:\n          limits:\n            cpu: "500m"\n            memory: "512Mi"\n---\n`;
  });

  return yaml;
}

function generateTerraformCode(nodes: Node[]): string {
  if (nodes.length === 0) return '# Add components to generate Terraform code';
  
  let tf = `terraform {\n  required_providers {\n    kubernetes = {\n      source = "hashicorp/kubernetes"\n    }\n  }\n}\n\n`;

  tf += `provider "kubernetes" {\n  config_path = "~/.kube/config"\n}\n\n`;

  nodes.filter(n => n.type === 'service').forEach(node => {
    const data = node.data as any;
    const name = data.label?.toLowerCase().replace(/\s+/g, '_') || node.id;
    
    tf += `resource "kubernetes_deployment" "${name}" {\n  metadata {\n    name = "${name}"\n  }\n  spec {\n    replicas = 3\n    selector {\n      match_labels = {\n        app = "${name}"\n      }\n    }\n    template {\n      metadata {\n        labels = {\n          app = "${name}"\n        }\n      }\n      spec {\n        container {\n          image = "${name}:latest"\n          name  = "${name}"\n          port {\n            container_port = 8080\n          }\n        }\n      }\n    }\n  }\n}\n\n`;
  });

  return tf;
}
