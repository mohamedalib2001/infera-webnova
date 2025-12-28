import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, Brain, Sparkles, Code, Eye, Play, 
  CheckCircle, Loader2, Terminal, Globe, Database,
  GitBranch, Rocket, FileCode, Server, RefreshCw,
  Smartphone, Monitor, Tablet, ExternalLink, Copy,
  ChevronRight, Zap, Shield, Activity, Box, Layers,
  Network, Cloud, Container, Lock, Users, CreditCard,
  Video, MessageSquare, BarChart3, Settings, Download,
  AlertTriangle, HardDrive, Cpu, Gauge, ShoppingCart,
  Search, User, GraduationCap, Bell, Heart, FolderTree,
  File, FileJson, FileType2
} from "lucide-react";
import { generatePlatformCode, generatePackageJson, type GeneratedCode, type PlatformSpec } from "@/lib/platform-code-generator";

interface BuildMessage {
  id: string;
  role: 'user' | 'nova' | 'system';
  content: string;
  timestamp: Date;
  status?: 'thinking' | 'building' | 'complete' | 'error';
  buildProgress?: BuildProgress;
}

interface BuildProgress {
  currentStep: string;
  currentStepAr: string;
  steps: BuildStep[];
  previewUrl?: string;
  githubUrl?: string;
}

interface BuildStep {
  id: string;
  name: string;
  nameAr: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  details?: string;
}

interface MicroserviceSpec {
  id: string;
  name: string;
  nameAr: string;
  type: 'api' | 'worker' | 'gateway' | 'database' | 'cache' | 'queue' | 'cdn' | 'storage';
  replicas: number;
  database?: string;
  dependencies: string[];
  port?: number;
  icon: typeof Server;
}

interface ArchitectureAnalysis {
  platformType: string;
  platformTypeAr: string;
  estimatedUsers: string;
  complexity: 'simple' | 'medium' | 'enterprise';
  microservices: MicroserviceSpec[];
  databases: { type: string; purpose: string; purposeAr: string }[];
  infrastructure: {
    loadBalancer: boolean;
    cdn: boolean;
    cache: boolean;
    queue: boolean;
    containerized: boolean;
  };
  estimatedCost: string;
  deploymentRegions: string[];
}

export default function PlatformBuilderPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<BuildMessage[]>([
    {
      id: 'welcome',
      role: 'nova',
      content: language === 'ar' 
        ? 'مرحباً! أنا Nova. صف لي المنصة التي تريد بناءها وسأقوم بتحليل المتطلبات واقتراح البنية المثلى.\n\nيمكنني بناء منصات عملاقة تدعم ملايين المستخدمين مع:\n• بنية Microservices\n• Docker + Kubernetes\n• قواعد بيانات موزعة\n• موازنة التحميل\n\nمثال: "أنشئ منصة تعليمية تضم مليون مستخدم متزامن مع فيديو ستريمينج ونظام دفع"'
        : 'Hello! I am Nova. Describe the platform you want to build and I will analyze requirements and suggest optimal architecture.\n\nI can build enterprise platforms supporting millions of users with:\n• Microservices Architecture\n• Docker + Kubernetes\n• Distributed Databases\n• Load Balancing\n\nExample: "Create an educational platform with 1M concurrent users, video streaming, and payment system"',
      timestamp: new Date(),
      status: 'complete'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([]);
  const [activeTab, setActiveTab] = useState('preview');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [architecture, setArchitecture] = useState<ArchitectureAnalysis | null>(null);
  const [dockerCompose, setDockerCompose] = useState<string>('');
  const [kubernetesManifest, setKubernetesManifest] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedCode[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedCode | null>(null);
  const [platformSpec, setPlatformSpec] = useState<PlatformSpec | null>(null);
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeRequirements = (description: string): ArchitectureAnalysis => {
    const lowerDesc = description.toLowerCase();
    const hasArabic = /[\u0600-\u06FF]/.test(description);
    
    const keywords = {
      users: /مليون|million|1m|100k|10k|مستخدم|users?|concurrent/i,
      video: /فيديو|video|streaming|ستريمينج|بث/i,
      payment: /دفع|payment|stripe|مدفوعات|checkout|cart|سلة/i,
      auth: /تسجيل|login|auth|مصادقة|oauth|sso/i,
      ecommerce: /متجر|store|ecommerce|منتجات|products|تجارة/i,
      education: /تعليم|education|دورات|courses|طلاب|students/i,
      social: /اجتماعي|social|chat|رسائل|messages|timeline/i,
      analytics: /تحليلات|analytics|dashboard|لوحة|reports|تقارير/i,
      api: /api|integration|تكامل|webhook/i,
      realtime: /حي|realtime|live|مباشر|websocket/i,
    };

    const detectedFeatures = Object.entries(keywords).filter(([_, regex]) => regex.test(lowerDesc));
    const isEnterprise = detectedFeatures.length >= 4 || /مليون|million|enterprise|عملاقة/i.test(lowerDesc);
    const isMedium = detectedFeatures.length >= 2;

    const microservices: MicroserviceSpec[] = [
      { id: 'gateway', name: 'API Gateway', nameAr: 'بوابة API', type: 'gateway', replicas: 2, dependencies: [], port: 80, icon: Network },
    ];

    const needsUsers = keywords.users.test(lowerDesc);
    const needsPayment = keywords.payment.test(lowerDesc) || keywords.ecommerce.test(lowerDesc);
    const needsAuth = keywords.auth.test(lowerDesc) || needsUsers || needsPayment;
    const needsVideo = keywords.video.test(lowerDesc);
    const needsAnalytics = keywords.analytics.test(lowerDesc);
    const needsQueue = needsVideo || needsAnalytics || isEnterprise;

    if (needsAuth) {
      microservices.push({ id: 'auth', name: 'Auth Service', nameAr: 'خدمة المصادقة', type: 'api', replicas: 3, database: 'postgres-auth', dependencies: ['gateway'], port: 3001, icon: Lock });
    }

    if (needsUsers) {
      microservices.push({ id: 'users', name: 'User Service', nameAr: 'خدمة المستخدمين', type: 'api', replicas: 3, database: 'postgres-users', dependencies: ['auth'], port: 3002, icon: Users });
    }

    if (needsPayment) {
      const paymentDeps = needsUsers ? ['auth', 'users'] : ['auth'];
      microservices.push({ id: 'payment', name: 'Payment Service', nameAr: 'خدمة الدفع', type: 'api', replicas: 2, database: 'mysql-payment', dependencies: paymentDeps, port: 3003, icon: CreditCard });
    }

    if (needsVideo) {
      microservices.push({ id: 'media', name: 'Media Service', nameAr: 'خدمة الوسائط', type: 'api', replicas: 5, dependencies: ['storage'], port: 3004, icon: Video });
      microservices.push({ id: 'transcoder', name: 'Video Transcoder', nameAr: 'محول الفيديو', type: 'worker', replicas: 4, dependencies: ['media', 'kafka'], icon: Cpu });
    }

    if (keywords.realtime.test(lowerDesc) || keywords.social.test(lowerDesc)) {
      microservices.push({ id: 'realtime', name: 'Realtime Service', nameAr: 'خدمة الوقت الحقيقي', type: 'api', replicas: 4, dependencies: ['redis'], port: 3005, icon: MessageSquare });
    }

    if (needsAnalytics) {
      microservices.push({ id: 'analytics', name: 'Analytics Service', nameAr: 'خدمة التحليلات', type: 'api', replicas: 2, database: 'elasticsearch', dependencies: ['kafka'], port: 3006, icon: BarChart3 });
    }

    if (keywords.ecommerce.test(lowerDesc)) {
      microservices.push({ id: 'catalog', name: 'Catalog Service', nameAr: 'خدمة المنتجات', type: 'api', replicas: 3, database: 'mongo-catalog', dependencies: ['gateway'], port: 3007, icon: Box });
      microservices.push({ id: 'orders', name: 'Order Service', nameAr: 'خدمة الطلبات', type: 'api', replicas: 3, database: 'postgres-orders', dependencies: ['payment', 'catalog'], port: 3008, icon: Layers });
    }

    microservices.push({ id: 'redis', name: 'Redis Cluster', nameAr: 'مخزن Redis', type: 'cache', replicas: 3, dependencies: [], icon: HardDrive });
    
    if (needsQueue) {
      microservices.push({ id: 'kafka', name: 'Kafka Cluster', nameAr: 'طابور Kafka', type: 'queue', replicas: 3, dependencies: [], icon: Activity });
    }
    
    if (needsVideo || isEnterprise) {
      microservices.push({ id: 'storage', name: 'Object Storage', nameAr: 'تخزين الملفات', type: 'storage', replicas: 1, dependencies: [], icon: Cloud });
    }
    
    if (isEnterprise) {
      microservices.push({ id: 'cdn', name: 'CDN Edge', nameAr: 'شبكة CDN', type: 'cdn', replicas: 1, dependencies: [], icon: Globe });
    }

    const databases: { type: string; purpose: string; purposeAr: string }[] = [];
    if (microservices.some(s => s.database?.includes('postgres'))) {
      databases.push({ type: 'PostgreSQL Cluster', purpose: 'Primary Data Store', purposeAr: 'قاعدة البيانات الرئيسية' });
    }
    if (microservices.some(s => s.database?.includes('mongo'))) {
      databases.push({ type: 'MongoDB Cluster', purpose: 'Document Store', purposeAr: 'تخزين المستندات' });
    }
    if (microservices.some(s => s.database?.includes('elasticsearch'))) {
      databases.push({ type: 'Elasticsearch', purpose: 'Search & Analytics', purposeAr: 'البحث والتحليلات' });
    }
    if (microservices.some(s => s.database?.includes('mysql'))) {
      databases.push({ type: 'MySQL Master-Slave', purpose: 'Transactional Data', purposeAr: 'البيانات المالية' });
    }

    const platformTypes: Record<string, { en: string; ar: string }> = {
      ecommerce: { en: 'E-commerce Platform', ar: 'منصة تجارة إلكترونية' },
      education: { en: 'Educational Platform', ar: 'منصة تعليمية' },
      social: { en: 'Social Platform', ar: 'منصة اجتماعية' },
      saas: { en: 'SaaS Platform', ar: 'منصة SaaS' },
      custom: { en: 'Custom Platform', ar: 'منصة مخصصة' },
    };

    let platformKey = 'custom';
    if (keywords.ecommerce.test(lowerDesc)) platformKey = 'ecommerce';
    else if (keywords.education.test(lowerDesc)) platformKey = 'education';
    else if (keywords.social.test(lowerDesc)) platformKey = 'social';

    return {
      platformType: platformTypes[platformKey].en,
      platformTypeAr: platformTypes[platformKey].ar,
      estimatedUsers: isEnterprise ? '1M+' : isMedium ? '100K+' : '10K+',
      complexity: isEnterprise ? 'enterprise' : isMedium ? 'medium' : 'simple',
      microservices,
      databases,
      infrastructure: {
        loadBalancer: true,
        cdn: isEnterprise || needsVideo,
        cache: true,
        queue: needsQueue,
        containerized: true,
      },
      estimatedCost: isEnterprise ? '$2,000-5,000/mo' : isMedium ? '$500-1,500/mo' : '$100-300/mo',
      deploymentRegions: isEnterprise ? ['us-east-1', 'eu-west-1', 'ap-southeast-1'] : ['us-east-1'],
    };
  };

  const generateDockerCompose = (arch: ArchitectureAnalysis): string => {
    const services: string[] = [];
    
    const getDbServiceName = (db?: string): string => {
      if (!db) return '';
      if (db.includes('postgres')) return 'postgres';
      if (db.includes('mongo')) return 'mongodb';
      if (db.includes('mysql')) return 'mysql';
      if (db.includes('elasticsearch')) return 'elasticsearch';
      return db.split('-')[0];
    };

    const getServiceDependencies = (service: MicroserviceSpec): string[] => {
      const deps: string[] = [];
      
      if (arch.infrastructure.cache) deps.push('redis');
      
      if (service.database) {
        const dbService = getDbServiceName(service.database);
        if (dbService) deps.push(dbService);
      }
      
      service.dependencies.forEach(dep => {
        if ((dep === 'kafka' || dep === 'queue') && arch.infrastructure.queue) {
          deps.push('kafka');
        } else if (dep === 'redis' && !deps.includes('redis')) {
          deps.push('redis');
        } else if (dep === 'storage') {
          deps.push('minio');
        } else if (dep === 'cdn') {
          deps.push('nginx');
        } else {
          const microservice = arch.microservices.find(m => m.id === dep);
          if (microservice && (microservice.type === 'api' || microservice.type === 'gateway')) {
            deps.push(dep);
          }
        }
      });
      
      return Array.from(new Set(deps));
    };
    
    arch.microservices.forEach(service => {
      if (service.type === 'api' || service.type === 'gateway' || service.type === 'worker') {
        const deps = getServiceDependencies(service);
        const dependsOnBlock = deps.length > 0 
          ? `depends_on:\n      ${deps.map(d => `- ${d}`).join('\n      ')}`
          : '';
        
        services.push(`  ${service.id}:
    build: ./${service.id}-service
    ports:
      - "${service.port || 3000}:${service.port || 3000}"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    ${dependsOnBlock}
    deploy:
      replicas: ${service.replicas}
      resources:
        limits:
          cpus: '0.5'
          memory: 512M`);
      }
    });

    if (arch.infrastructure.cache) {
      services.push(`  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes`);
    }

    if (arch.databases.some(d => d.type.includes('PostgreSQL'))) {
      services.push(`  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: platform_db
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"`);
    }

    if (arch.databases.some(d => d.type.includes('MongoDB'))) {
      services.push(`  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD}
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"`);
    }

    if (arch.databases.some(d => d.type.includes('MySQL'))) {
      services.push(`  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: platform_db
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"`);
    }

    if (arch.databases.some(d => d.type.includes('Elasticsearch'))) {
      services.push(`  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elastic-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"`);
    }

    if (arch.infrastructure.queue) {
      services.push(`  kafka:
    image: bitnami/kafka:latest
    environment:
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
    ports:
      - "9092:9092"`);
    }

    if (arch.microservices.some(s => s.dependencies.includes('storage')) || arch.infrastructure.cdn) {
      services.push(`  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: \${MINIO_USER}
      MINIO_ROOT_PASSWORD: \${MINIO_PASSWORD}
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"`);
    }

    if (arch.infrastructure.cdn) {
      services.push(`  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - gateway`);
    }

    const volumes: string[] = [];
    if (arch.infrastructure.cache) volumes.push('redis-data:');
    if (arch.databases.some(d => d.type.includes('PostgreSQL'))) volumes.push('postgres-data:');
    if (arch.microservices.some(s => s.dependencies.includes('storage')) || arch.infrastructure.cdn) volumes.push('minio-data:');
    if (arch.databases.some(d => d.type.includes('MongoDB'))) volumes.push('mongo-data:');
    if (arch.databases.some(d => d.type.includes('MySQL'))) volumes.push('mysql-data:');
    if (arch.databases.some(d => d.type.includes('Elasticsearch'))) volumes.push('elastic-data:');

    return `version: '3.8'

services:
${services.join('\n\n')}

volumes:
  ${volumes.join('\n  ')}

networks:
  default:
    driver: bridge
`;
  };

  const generateKubernetesManifest = (arch: ArchitectureAnalysis): string => {
    const deployments: string[] = [];
    
    arch.microservices.filter(s => s.type === 'api' || s.type === 'gateway').forEach(service => {
      deployments.push(`---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service.id}-deployment
  labels:
    app: ${service.id}
spec:
  replicas: ${service.replicas}
  selector:
    matchLabels:
      app: ${service.id}
  template:
    metadata:
      labels:
        app: ${service.id}
    spec:
      containers:
      - name: ${service.id}
        image: infera/${service.id}-service:latest
        ports:
        - containerPort: ${service.port || 3000}
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: platform-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: ${service.id}-service
spec:
  selector:
    app: ${service.id}
  ports:
  - port: ${service.port || 3000}
    targetPort: ${service.port || 3000}
  type: ClusterIP`);
    });

    if (arch.infrastructure.loadBalancer) {
      deployments.push(`---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.platform.infera.dev
    secretName: platform-tls
  rules:
  - host: api.platform.infera.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 80`);
    }

    return deployments.join('\n');
  };

  const simulateBuild = async (description: string) => {
    const hasArabic = /[\u0600-\u06FF]/.test(description);
    const lang = hasArabic ? 'ar' : language;
    
    const arch = analyzeRequirements(description);
    setArchitecture(arch);
    
    const steps: BuildStep[] = [
      { id: 's1', name: 'Analyzing requirements', nameAr: 'تحليل المتطلبات', status: 'pending' },
      { id: 's2', name: 'Designing microservices architecture', nameAr: 'تصميم بنية الخدمات المصغرة', status: 'pending' },
      { id: 's3', name: 'Generating database schemas', nameAr: 'توليد مخططات قواعد البيانات', status: 'pending' },
      { id: 's4', name: 'Building frontend (React + Tailwind)', nameAr: 'بناء الواجهة (React + Tailwind)', status: 'pending' },
      { id: 's5', name: 'Building backend services (Node.js)', nameAr: 'بناء خدمات الخادم (Node.js)', status: 'pending' },
      { id: 's6', name: 'Generating Docker containers', nameAr: 'توليد حاويات Docker', status: 'pending' },
      { id: 's7', name: 'Creating Kubernetes manifests', nameAr: 'إنشاء ملفات Kubernetes', status: 'pending' },
      { id: 's8', name: 'Configuring load balancer', nameAr: 'إعداد موازن التحميل', status: 'pending' },
      { id: 's9', name: 'Deploying to cloud', nameAr: 'النشر على السحابة', status: 'pending' },
    ];
    
    setBuildSteps(steps);
    setActiveTab('architecture');
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setBuildSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < i ? 'complete' : idx === i ? 'active' : 'pending'
      })));
      
      const stepMessage: BuildMessage = {
        id: `step-${i}`,
        role: 'system',
        content: lang === 'ar' ? `✓ ${steps[i].nameAr}` : `✓ ${steps[i].name}`,
        timestamp: new Date(),
        status: 'building'
      };
      setMessages(prev => [...prev, stepMessage]);
    }
    
    setBuildSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
    
    const projectName = arch.platformType.toLowerCase().replace(/\s+/g, '-');
    const mockPreviewUrl = `https://${projectName}.infera.dev`;
    setPreviewUrl(mockPreviewUrl);
    
    setDockerCompose(generateDockerCompose(arch));
    setKubernetesManifest(generateKubernetesManifest(arch));
    
    const spec: PlatformSpec = {
      name: arch.platformType,
      nameAr: arch.platformTypeAr,
      type: arch.platformType.toLowerCase().includes('commerce') ? 'ecommerce' : 
            arch.platformType.toLowerCase().includes('education') ? 'education' :
            arch.platformType.toLowerCase().includes('social') ? 'social' : 'saas',
      features: arch.microservices.map(s => s.name),
      hasAuth: arch.microservices.some(s => s.id === 'auth'),
      hasSubscriptions: arch.microservices.some(s => s.id === 'payment'),
      hasPayments: arch.microservices.some(s => s.id === 'payment'),
      hasDashboard: true,
      databases: arch.databases.map(db => ({
        name: db.type,
        type: db.type.includes('postgres') ? 'postgresql' as const : db.type.includes('redis') ? 'redis' as const : 'postgresql' as const,
        tables: []
      })),
      microservices: arch.microservices.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        port: s.port || 3000,
        endpoints: []
      }))
    };
    setPlatformSpec(spec);
    
    const localFiles = generatePlatformCode(spec);
    localFiles.push({
      fileName: 'package.json',
      filePath: 'package.json',
      language: 'json',
      content: generatePackageJson(spec),
      category: 'config'
    });
    
    try {
      const apiSpec = {
        name: spec.name,
        nameAr: spec.nameAr,
        description: `${spec.name} Platform`,
        descriptionAr: `منصة ${spec.nameAr || spec.name}`,
        sector: spec.type,
        features: spec.features,
        hasAuth: spec.hasAuth,
        hasPayments: spec.hasPayments,
        hasSubscriptions: spec.hasSubscriptions,
        hasCMS: false,
        hasAnalytics: spec.hasDashboard,
      };
      
      const buildResponse = await apiRequest('POST', '/api/platforms/build', apiSpec);
      
      if (buildResponse.success && buildResponse.buildId) {
        setCurrentBuildId(buildResponse.buildId);
        
        const filesResponse = await fetch(`/api/platforms/build/${buildResponse.buildId}/files`);
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          const serverFiles: GeneratedCode[] = [];
          
          for (const fileMeta of filesData.files || []) {
            const encodedPath = encodeURIComponent(fileMeta.filePath);
            const fileResponse = await fetch(`/api/platforms/build/${buildResponse.buildId}/file/${encodedPath}`);
            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              serverFiles.push({
                fileName: fileData.fileName,
                filePath: fileData.filePath,
                language: fileData.language,
                content: fileData.content,
                category: fileMeta.category || 'generated'
              });
            }
          }
          
          if (serverFiles.length > 0) {
            setGeneratedFiles(serverFiles);
            setSelectedFile(serverFiles[0]);
            setGeneratedCode(serverFiles[0].content);
          } else {
            setGeneratedFiles(localFiles);
            setSelectedFile(localFiles[0]);
            setGeneratedCode(localFiles[0]?.content || '');
          }
        }
      } else {
        setGeneratedFiles(localFiles);
        if (localFiles.length > 0) {
          setSelectedFile(localFiles[0]);
          setGeneratedCode(localFiles[0].content);
        }
      }
    } catch (error) {
      console.error('API build error, using local generation:', error);
      setGeneratedFiles(localFiles);
      if (localFiles.length > 0) {
        setSelectedFile(localFiles[0]);
        setGeneratedCode(localFiles[0].content);
      }
    }
    
    setActiveTab('architecture');
    
    return {
      success: true,
      previewUrl: mockPreviewUrl,
      githubUrl: `https://github.com/infera/${projectName}`,
      projectName,
      architecture: arch
    };
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isBuilding) return;
    
    const hasArabic = /[\u0600-\u06FF]/.test(content);
    const lang = hasArabic ? 'ar' : language;
    const lowerContent = content.toLowerCase().trim();
    
    const userMessage: BuildMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    const greetings = /^(hi|hello|hey|مرحبا|السلام عليكم|اهلا|هلا|صباح الخير|مساء الخير|شكرا|thanks|thank you)[\s!.]*$/i;
    const questions = /^(ما|ماذا|كيف|لماذا|هل|أين|من|what|how|why|where|who|can you|do you|are you)/i;
    const helpRequests = /^(ساعدني|help|مساعدة|أحتاج|i need|عاوز|أريد)[\s]*$/i;
    
    const isPlatformDescription = /منصة|platform|متجر|store|موقع|site|تطبيق|app|نظام|system|مليون|million|users|مستخدم|ecommerce|تعليم|education|فيديو|video|دفع|payment/i.test(lowerContent);
    
    if (greetings.test(lowerContent) || (!isPlatformDescription && (questions.test(lowerContent) || helpRequests.test(lowerContent) || lowerContent.length < 15))) {
      const responseMessage: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'nova',
        content: lang === 'ar' 
          ? `مرحباً! أنا Nova، مساعدك لبناء المنصات الرقمية العملاقة.\n\nأخبرني عن المنصة التي تريد بناءها. مثال:\n• "منصة تعليمية لمليون طالب مع فيديوهات ودفع"\n• "متجر إلكتروني متكامل مع نظام دفع وشحن"\n• "منصة اجتماعية مع محادثات وبث مباشر"\n\nما نوع المنصة التي تريد بناءها؟`
          : `Hello! I'm Nova, your assistant for building enterprise-scale digital platforms.\n\nTell me about the platform you want to build. For example:\n• "Educational platform for 1M students with video and payments"\n• "Complete e-commerce store with payment and shipping"\n• "Social platform with chat and live streaming"\n\nWhat kind of platform would you like to build?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
      return;
    }
    
    setIsBuilding(true);
    
    const thinkingMessage: BuildMessage = {
      id: (Date.now() + 1).toString(),
      role: 'nova',
      content: lang === 'ar' ? 'جاري تحليل المتطلبات وتصميم البنية المثلى...' : 'Analyzing requirements and designing optimal architecture...',
      timestamp: new Date(),
      status: 'thinking',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const result = await simulateBuild(content);
      
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const arch = result.architecture;
      const completionMessage: BuildMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: lang === 'ar' 
          ? `✅ تم بناء المنصة بنجاح!\n\n📊 نوع المنصة: ${arch?.platformTypeAr}\n🔧 عدد الخدمات: ${arch?.microservices.length}\n👥 المستخدمين المتوقعين: ${arch?.estimatedUsers}\n💰 التكلفة المقدرة: ${arch?.estimatedCost}\n\n🔗 رابط المعاينة: ${result.previewUrl}\n📦 GitHub: ${result.githubUrl}\n\nيمكنك تحميل ملفات Docker و Kubernetes من تبويب "البنية".`
          : `✅ Platform built successfully!\n\n📊 Platform Type: ${arch?.platformType}\n🔧 Services: ${arch?.microservices.length}\n👥 Expected Users: ${arch?.estimatedUsers}\n💰 Estimated Cost: ${arch?.estimatedCost}\n\n🔗 Preview URL: ${result.previewUrl}\n📦 GitHub: ${result.githubUrl}\n\nYou can download Docker and Kubernetes files from the "Architecture" tab.`,
        timestamp: new Date(),
        status: 'complete',
      };
      
      setMessages(prev => [...prev, completionMessage]);
      
      toast({
        title: lang === 'ar' ? 'تم البناء بنجاح' : 'Build Complete',
        description: lang === 'ar' ? `تم إنشاء ${arch?.microservices.length} خدمة مصغرة` : `Created ${arch?.microservices.length} microservices`,
      });
      
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const errorMessage: BuildMessage = {
        id: (Date.now() + 2).toString(),
        role: 'nova',
        content: lang === 'ar' 
          ? 'عذراً، حدث خطأ أثناء البناء. حاول مرة أخرى.'
          : 'Sorry, an error occurred during build. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBuilding(false);
    }
  }, [isBuilding, language, toast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      default: return 'w-full';
    }
  };

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getServiceIcon = (type: MicroserviceSpec['type']) => {
    const icons: Record<MicroserviceSpec['type'], typeof Server> = {
      api: Server,
      worker: Cpu,
      gateway: Network,
      database: Database,
      cache: HardDrive,
      queue: Activity,
      cdn: Globe,
      storage: Cloud,
    };
    return icons[type];
  };

  const getComplexityColor = (complexity: ArchitectureAnalysis['complexity']) => {
    switch (complexity) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-green-500/10 text-green-600 border-green-500/30';
    }
  };

  return (
    <div className={`flex h-screen bg-background ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`w-[450px] flex flex-col border-${isRTL ? 'l' : 'r'} border-border bg-card/50`}>
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Nova Enterprise Builder</h2>
              <p className="text-xs text-muted-foreground">{t('Build scalable platforms', 'بناء منصات عملاقة')}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? (isRTL ? 'flex-row-reverse' : '') : ''}`}
                >
                  {message.role !== 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${message.role === 'system' ? 'bg-blue-500/20 text-blue-500' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                        {message.role === 'system' ? <Terminal className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`rounded-lg p-3 max-w-[90%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.role === 'system'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm'
                        : 'bg-muted'
                    }`}>
                      {message.status === 'thinking' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{message.content}</span>
                        </div>
                      )}
                      {message.status !== 'thinking' && (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-card/80">
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { icon: Layers, label: t('Enterprise E-commerce', 'متجر عملاق'), prompt: t('Create an enterprise e-commerce platform with 1M concurrent users, global CDN, multi-currency payments, real-time inventory, recommendation engine, and analytics dashboard', 'أنشئ منصة تجارة إلكترونية عملاقة تدعم مليون مستخدم متزامن مع CDN عالمي ودفع متعدد العملات ومخزون حي ومحرك توصيات ولوحة تحليلات') },
              { icon: Video, label: t('Learning Platform', 'منصة تعليم'), prompt: t('Create an educational platform with video streaming, virtual classrooms, smart testing system, progress tracking, and payment integration for 500K users', 'أنشئ منصة تعليمية مع بث فيديو وفصول افتراضية ونظام اختبارات ذكي وتتبع التقدم ونظام دفع لـ 500 ألف مستخدم') },
              { icon: Users, label: t('Social Platform', 'منصة اجتماعية'), prompt: t('Create a social platform with real-time messaging, content feed, live streaming, notifications, and moderation system', 'أنشئ منصة اجتماعية مع رسائل حية وتايملاين وبث مباشر وإشعارات ونظام إشراف') },
            ].map((example, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(example.prompt)}
                className="text-xs gap-1"
                data-testid={`button-example-${idx}`}
              >
                <example.icon className="w-3 h-3" />
                {example.label}
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('Describe your enterprise platform requirements...', 'صف متطلبات منصتك العملاقة...')}
              className="resize-none pr-12 min-h-[80px]"
              disabled={isBuilding}
              data-testid="input-chat"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isBuilding}
              className={`absolute ${isRTL ? 'left-2' : 'right-2'} bottom-2`}
              data-testid="button-send"
            >
              {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-muted/30">
        <div className="p-3 border-b border-border bg-card/50 flex items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-[400px] grid-cols-4">
              <TabsTrigger value="preview" className="gap-1" data-testid="tab-preview">
                <Eye className="w-4 h-4" />
                {t('Preview', 'معاينة')}
              </TabsTrigger>
              <TabsTrigger value="architecture" className="gap-1" data-testid="tab-architecture">
                <Network className="w-4 h-4" />
                {t('Architecture', 'البنية')}
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-1" data-testid="tab-code">
                <Code className="w-4 h-4" />
                {t('Code', 'الكود')}
              </TabsTrigger>
              <TabsTrigger value="build" className="gap-1" data-testid="tab-build">
                <Activity className="w-4 h-4" />
                {t('Build', 'البناء')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setPreviewDevice('desktop')}
                data-testid="button-device-desktop"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setPreviewDevice('tablet')}
                data-testid="button-device-tablet"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setPreviewDevice('mobile')}
                data-testid="button-device-mobile"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            {previewUrl && (
              <Button variant="outline" size="sm" className="gap-1" data-testid="button-open-preview">
                <ExternalLink className="w-3 h-3" />
                {t('Open', 'فتح')}
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {activeTab === 'preview' && (
            <div className="h-full flex items-center justify-center">
              {previewUrl ? (
                <div className={`${getDeviceWidth()} h-full bg-white dark:bg-zinc-900 rounded-lg border border-border shadow-lg overflow-hidden transition-all duration-300`}>
                  <div className="h-8 bg-muted/50 border-b border-border flex items-center gap-2 px-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-background rounded px-2 py-0.5 text-xs text-muted-foreground text-center">
                        {previewUrl}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="h-[calc(100%-2rem)] bg-white dark:bg-zinc-900 overflow-auto">
                    {architecture?.platformType.includes('commerce') || architecture?.platformType.includes('E-commerce') ? (
                      <div className="min-h-full">
                        <nav className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-lg">{t('My Store', 'متجري')}</span>
                            </div>
                            <div className="hidden md:flex items-center gap-6 text-sm">
                              <span>{t('Products', 'المنتجات')}</span>
                              <span>{t('Categories', 'الفئات')}</span>
                              <span>{t('Offers', 'العروض')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Search className="w-5 h-5" />
                              <ShoppingCart className="w-5 h-5" />
                              <User className="w-5 h-5" />
                            </div>
                          </div>
                        </nav>
                        <div className="p-6">
                          <div className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl p-8 mb-6">
                            <h1 className="text-2xl font-bold mb-2">{t('Welcome to Our Store', 'مرحباً بك في متجرنا')}</h1>
                            <p className="text-muted-foreground mb-4">{t('Discover the best products at the best prices', 'اكتشف أفضل المنتجات بأفضل الأسعار')}</p>
                            <Button size="sm">{t('Shop Now', 'تسوق الآن')}</Button>
                          </div>
                          <h2 className="font-semibold mb-4">{t('Featured Products', 'منتجات مميزة')}</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="bg-muted/30 rounded-lg p-3">
                                <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-800/50 dark:to-purple-800/50 rounded-lg mb-2 flex items-center justify-center">
                                  <Box className="w-8 h-8 text-violet-500" />
                                </div>
                                <div className="text-sm font-medium">{t('Product', 'منتج')} {i}</div>
                                <div className="text-xs text-muted-foreground">$99.99</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : architecture?.platformType.includes('Education') || architecture?.platformType.includes('تعليم') ? (
                      <div className="min-h-full">
                        <nav className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-lg">{t('Learn Platform', 'منصة التعلم')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Search className="w-5 h-5" />
                              <User className="w-5 h-5" />
                            </div>
                          </div>
                        </nav>
                        <div className="p-6">
                          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-8 mb-6">
                            <h1 className="text-2xl font-bold mb-2">{t('Start Learning Today', 'ابدأ التعلم اليوم')}</h1>
                            <p className="text-muted-foreground mb-4">{t('Thousands of courses from top instructors', 'آلاف الدورات من أفضل المدربين')}</p>
                            <Button size="sm">{t('Browse Courses', 'تصفح الدورات')}</Button>
                          </div>
                          <h2 className="font-semibold mb-4">{t('Popular Courses', 'دورات شائعة')}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="bg-muted/30 rounded-lg p-4 flex gap-4">
                                <div className="w-20 h-16 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-800/50 dark:to-cyan-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Play className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{t('Course', 'دورة')} {i}</div>
                                  <div className="text-xs text-muted-foreground">{t('12 lessons', '12 درس')}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : architecture?.platformType.includes('Social') || architecture?.platformType.includes('اجتماع') ? (
                      <div className="min-h-full">
                        <nav className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-lg">{t('Social Hub', 'المركز الاجتماعي')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5" />
                              <User className="w-5 h-5" />
                            </div>
                          </div>
                        </nav>
                        <div className="p-6">
                          <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400" />
                                  <div>
                                    <div className="text-sm font-medium">{t('User', 'مستخدم')} {i}</div>
                                    <div className="text-xs text-muted-foreground">{t('2 hours ago', 'منذ ساعتين')}</div>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{t('This is a sample post content...', 'هذا محتوى منشور تجريبي...')}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> 42</span>
                                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> 12</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-full">
                        <nav className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Rocket className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-lg">{architecture?.platformType || t('Platform', 'المنصة')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5" />
                            </div>
                          </div>
                        </nav>
                        <div className="p-6">
                          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-8 mb-6">
                            <h1 className="text-2xl font-bold mb-2">{architecture?.platformType || t('Welcome', 'مرحباً')}</h1>
                            <p className="text-muted-foreground mb-4">{t('Your platform is ready and deployed', 'منصتك جاهزة ومنشورة')}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={getComplexityColor(architecture?.complexity || 'simple')}>
                                {architecture?.complexity === 'enterprise' ? t('Enterprise', 'مؤسسي') : architecture?.complexity === 'medium' ? t('Medium', 'متوسط') : t('Simple', 'بسيط')}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Users className="w-3 h-3" />
                                {architecture?.estimatedUsers}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Server className="w-3 h-3" />
                                {architecture?.microservices.length} {t('services', 'خدمة')}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {architecture?.microservices.filter(s => s.type === 'api').slice(0, 4).map(service => (
                              <div key={service.id} className="bg-muted/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <service.icon className="w-5 h-5 text-emerald-500" />
                                  <span className="font-medium text-sm">{language === 'ar' ? service.nameAr : service.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{t('Active', 'نشط')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Layers className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('Enterprise Platform Builder', 'باني المنصات العملاقة')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {t('Describe your platform requirements and watch Nova design the perfect microservices architecture.', 'صف متطلبات منصتك وشاهد Nova تصمم بنية الخدمات المصغرة المثالية.')}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <Container className="w-3 h-3" />
                      Docker
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Box className="w-3 h-3" />
                      Kubernetes
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Database className="w-3 h-3" />
                      PostgreSQL
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Activity className="w-3 h-3" />
                      Kafka
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              {architecture ? (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{t('Complexity', 'التعقيد')}</span>
                        </div>
                        <Badge className={getComplexityColor(architecture.complexity)}>
                          {architecture.complexity === 'enterprise' ? t('Enterprise', 'مؤسسي') : architecture.complexity === 'medium' ? t('Medium', 'متوسط') : t('Simple', 'بسيط')}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{t('Users', 'المستخدمين')}</span>
                        </div>
                        <p className="text-xl font-bold">{architecture.estimatedUsers}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{t('Services', 'الخدمات')}</span>
                        </div>
                        <p className="text-xl font-bold">{architecture.microservices.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{t('Est. Cost', 'التكلفة')}</span>
                        </div>
                        <p className="text-lg font-bold">{architecture.estimatedCost}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Network className="w-4 h-4" />
                        {t('Microservices Architecture', 'بنية الخدمات المصغرة')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {architecture.microservices.map((service) => {
                          const IconComponent = getServiceIcon(service.type);
                          return (
                            <div
                              key={service.id}
                              className="p-3 rounded-lg border border-border bg-card hover-elevate"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                  <IconComponent className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {language === 'ar' ? service.nameAr : service.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{service.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  x{service.replicas}
                                </Badge>
                                {service.port && (
                                  <Badge variant="outline" className="text-xs">
                                    :{service.port}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Container className="w-4 h-4" />
                            Docker Compose
                          </CardTitle>
                          <Button variant="outline" size="sm" className="gap-1" data-testid="button-download-docker">
                            <Download className="w-3 h-3" />
                            {t('Download', 'تحميل')}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {dockerCompose}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Box className="w-4 h-4" />
                            Kubernetes Manifests
                          </CardTitle>
                          <Button variant="outline" size="sm" className="gap-1" data-testid="button-download-k8s">
                            <Download className="w-3 h-3" />
                            {t('Download', 'تحميل')}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                            {kubernetesManifest}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {t('Databases', 'قواعد البيانات')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 flex-wrap">
                        {architecture.databases.map((db, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
                            <Database className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{db.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {language === 'ar' ? db.purposeAr : db.purpose}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t('Infrastructure', 'البنية التحتية')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 flex-wrap">
                        {architecture.infrastructure.loadBalancer && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Load Balancer
                          </Badge>
                        )}
                        {architecture.infrastructure.cdn && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            CDN
                          </Badge>
                        )}
                        {architecture.infrastructure.cache && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Redis Cache
                          </Badge>
                        )}
                        {architecture.infrastructure.queue && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Message Queue
                          </Badge>
                        )}
                        {architecture.infrastructure.containerized && (
                          <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Containerized
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">{t('Deployment Regions:', 'مناطق النشر:')}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {architecture.deploymentRegions.map((region, idx) => (
                            <Badge key={idx} variant="outline">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('Architecture will appear here after build', 'ستظهر البنية هنا بعد البناء')}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'code' && (
            <div className="h-full flex gap-4">
              <Card className="w-64 flex-shrink-0 h-full">
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    {t('Generated Files', 'الملفات المُولدة')}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  <div className="p-2 space-y-1">
                    {generatedFiles.length > 0 ? (
                      <>
                        {['frontend', 'backend', 'shared', 'database', 'infrastructure', 'config', 'docs', 'generated'].map(category => {
                          const categoryFiles = generatedFiles.filter(f => f.category === category);
                          if (categoryFiles.length === 0) return null;
                          return (
                            <div key={category} className="mb-3">
                              <div className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">
                                {category === 'frontend' ? t('Frontend', 'الواجهة') :
                                 category === 'backend' ? t('Backend', 'الخادم') :
                                 category === 'shared' ? t('Shared', 'المشترك') :
                                 category === 'database' ? t('Database', 'قاعدة البيانات') :
                                 category === 'infrastructure' ? t('Infrastructure', 'البنية التحتية') :
                                 category === 'docs' ? t('Documentation', 'التوثيق') :
                                 category === 'generated' ? t('Generated', 'المولّد') :
                                 t('Config', 'الإعدادات')}
                              </div>
                              {categoryFiles.map(file => (
                                <button
                                  key={file.filePath}
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setGeneratedCode(file.content);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 hover-elevate ${
                                    selectedFile?.filePath === file.filePath ? 'bg-primary/10 text-primary' : ''
                                  }`}
                                  data-testid={`file-${file.fileName}`}
                                >
                                  {file.language === 'tsx' || file.language === 'typescript' ? (
                                    <FileType2 className="w-4 h-4 text-blue-500" />
                                  ) : file.language === 'json' ? (
                                    <FileJson className="w-4 h-4 text-yellow-500" />
                                  ) : file.language === 'yaml' || file.language === 'dockerfile' ? (
                                    <FileCode className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <File className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <span className="truncate">{file.fileName}</span>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        {t('Files will appear after build', 'ستظهر الملفات بعد البناء')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
              
              <Card className="flex-1 h-full">
                <CardContent className="p-0 h-full">
                  <div className="h-10 bg-muted/50 border-b border-border flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{selectedFile?.filePath || 'generated-code.ts'}</span>
                      {selectedFile && (
                        <Badge variant="outline" className="text-xs">
                          {selectedFile.language}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 h-7" 
                        onClick={() => {
                          if (generatedCode) {
                            navigator.clipboard.writeText(generatedCode);
                            toast({ title: t('Copied!', 'تم النسخ!') });
                          }
                        }}
                        data-testid="button-copy-code"
                      >
                        <Copy className="w-3 h-3" />
                        {t('Copy', 'نسخ')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 h-7"
                        onClick={() => {
                          if (selectedFile) {
                            const blob = new Blob([selectedFile.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = selectedFile.fileName;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast({ title: t('Downloaded!', 'تم التحميل!') });
                          }
                        }}
                        data-testid="button-download-file"
                      >
                        <Download className="w-3 h-3" />
                        {t('Download', 'تحميل')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 h-7"
                        onClick={() => {
                          if (generatedFiles.length > 0) {
                            generatedFiles.forEach((file, index) => {
                              setTimeout(() => {
                                const blob = new Blob([file.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = file.fileName;
                                a.click();
                                URL.revokeObjectURL(url);
                              }, index * 100);
                            });
                            toast({ title: t('Downloading all files...', 'جاري تحميل جميع الملفات...') });
                          }
                        }}
                        data-testid="button-download-all"
                      >
                        <Download className="w-3 h-3" />
                        {t('Download All', 'تحميل الكل')} ({generatedFiles.length})
                      </Button>
                      {currentBuildId && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="gap-1 h-7"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/platforms/download/${currentBuildId}`);
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${platformSpec?.name || 'platform'}-complete.zip`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast({ title: t('Platform downloaded!', 'تم تحميل المنصة!') });
                              } else {
                                toast({ title: t('Download failed', 'فشل التحميل'), variant: 'destructive' });
                              }
                            } catch (error) {
                              toast({ title: t('Download failed', 'فشل التحميل'), variant: 'destructive' });
                            }
                          }}
                          data-testid="button-download-platform-zip"
                        >
                          <Rocket className="w-3 h-3" />
                          {t('Download Complete Platform', 'تحميل المنصة الكاملة')}
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-[calc(100%-2.5rem)]">
                    <pre className="p-4 text-sm font-mono text-foreground/90 whitespace-pre-wrap">
                      {generatedCode || t('// Code will appear here after build', '// سيظهر الكود هنا بعد البناء')}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === 'build' && (
            <Card className="h-full">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t('Build Progress', 'تقدم البناء')}
                </h3>
                
                {buildSteps.length > 0 ? (
                  <div className="space-y-3">
                    {buildSteps.map((step, idx) => (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          step.status === 'active' ? 'border-primary bg-primary/5' :
                          step.status === 'complete' ? 'border-green-500/30 bg-green-500/5' :
                          'border-border bg-muted/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === 'active' ? 'bg-primary text-primary-foreground' :
                          step.status === 'complete' ? 'bg-green-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {step.status === 'active' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : step.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">{idx + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${step.status === 'complete' ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {language === 'ar' ? step.nameAr : step.name}
                          </p>
                        </div>
                        {step.status === 'complete' && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                            {t('Done', 'تم')}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('Build steps will appear here', 'ستظهر خطوات البناء هنا')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {previewUrl && (
          <div className="p-3 border-t border-border bg-card/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t('Deployed', 'تم النشر')}
                </Badge>
                <span className="text-sm text-muted-foreground">{previewUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1" data-testid="button-github">
                  <GitBranch className="w-3 h-3" />
                  GitHub
                </Button>
                <Button size="sm" className="gap-1" data-testid="button-publish">
                  <Globe className="w-3 h-3" />
                  {t('Publish', 'نشر')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
