import { useCallback, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, ZoomOut, Maximize2, Download, Upload, Trash2, 
  Database, Server, Globe, Lock, Users, CreditCard, Bell,
  BarChart3, Shield, Network, Container, Cpu, HardDrive, Search
} from 'lucide-react';

interface ArchitectureCanvasProps {
  language: 'en' | 'ar';
  onNodesChange: (nodes: Node[]) => void;
  onArchitectureAnalysis: (nodes: Node[], edges: Edge[]) => void;
}

const iconMap: Record<string, any> = {
  'api-gateway': Globe,
  'auth-service': Lock,
  'user-service': Users,
  'payment-service': CreditCard,
  'notification-service': Bell,
  'analytics-service': BarChart3,
  'postgresql': Database,
  'mongodb': Database,
  'redis': Database,
  'elasticsearch': Search,
  'load-balancer': Network,
  'container': Container,
  'kubernetes': Cpu,
  'storage': HardDrive,
  'cdn': Globe,
  'firewall': Shield,
  'waf': Shield,
  'secrets-vault': Lock,
  'ssl-cert': Lock,
};

function ServiceNode({ data, selected }: { data: any; selected: boolean }) {
  const IconComponent = iconMap[data.nodeType] || Server;
  
  return (
    <div className={`
      px-4 py-3 rounded-xl border-2 transition-all duration-200
      ${selected ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-border/50'}
      bg-card/90 backdrop-blur-sm min-w-[140px]
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-cyan-500" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${data.color || 'bg-blue-500'} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-medium text-sm">{data.label}</div>
          {data.instances && (
            <Badge variant="secondary" className="text-xs mt-1">
              x{data.instances}
            </Badge>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-cyan-500" />
    </div>
  );
}

function DatabaseNode({ data, selected }: { data: any; selected: boolean }) {
  const IconComponent = iconMap[data.nodeType] || Database;
  
  return (
    <div className={`
      px-4 py-3 rounded-xl border-2 transition-all duration-200
      ${selected ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-border/50'}
      bg-card/90 backdrop-blur-sm min-w-[140px]
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-green-500" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${data.color || 'bg-green-600'} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-medium text-sm">{data.label}</div>
          {data.size && (
            <Badge variant="secondary" className="text-xs mt-1">
              {data.size}
            </Badge>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-green-500" />
    </div>
  );
}

function InfraNode({ data, selected }: { data: any; selected: boolean }) {
  const IconComponent = iconMap[data.nodeType] || Cloud;
  
  return (
    <div className={`
      px-4 py-3 rounded-xl border-2 transition-all duration-200
      ${selected ? 'border-purple-400 shadow-lg shadow-purple-400/20' : 'border-border/50'}
      bg-card/90 backdrop-blur-sm min-w-[140px]
    `}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-500" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${data.color || 'bg-purple-500'} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-medium text-sm">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
    </div>
  );
}

import { Cloud } from 'lucide-react';

const nodeTypes: NodeTypes = {
  service: ServiceNode,
  database: DatabaseNode,
  infra: InfraNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function ArchitectureCanvasInner({ language, onNodesChange, onArchitectureAnalysis }: ArchitectureCanvasProps) {
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00D9FF' } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const { type, data: nodeData } = JSON.parse(data);
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeCategory = ['postgresql', 'mongodb', 'redis', 'elasticsearch'].includes(type) 
        ? 'database' 
        : ['load-balancer', 'container', 'kubernetes', 'storage', 'cdn', 'firewall', 'waf', 'secrets-vault', 'ssl-cert'].includes(type)
        ? 'infra'
        : 'service';

      const nodeId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newNode: Node = {
        id: nodeId,
        type: nodeCategory,
        position,
        data: { ...nodeData, nodeType: type },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        onNodesChange(updated);
        return updated;
      });
    },
    [setNodes, onNodesChange, screenToFlowPosition]
  );

  const onNodesChangeHandler = useCallback((changes: any) => {
    handleNodesChange(changes);
    setNodes((nds) => {
      setTimeout(() => onNodesChange(nds), 0);
      return nds;
    });
  }, [handleNodesChange, onNodesChange, setNodes]);

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    onNodesChange([]);
  };

  const analyzeArchitecture = () => {
    onArchitectureAnalysis(nodes, edges);
  };

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper} data-testid="architecture-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
        <Controls className="!bg-card/80 !backdrop-blur-sm !border-border/50 !rounded-lg" />
        <MiniMap 
          className="!bg-card/80 !backdrop-blur-sm !border-border/50 !rounded-lg"
          nodeColor={(node) => {
            if (node.type === 'database') return '#22c55e';
            if (node.type === 'infra') return '#a855f7';
            return '#06b6d4';
          }}
        />
        
        <Panel position="top-center" className="flex items-center gap-2">
          {nodes.length === 0 && (
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl px-6 py-4 text-center">
              <p className="text-muted-foreground text-sm">
                {t('Drag components from the sidebar to build your architecture', 'اسحب المكونات من الشريط الجانبي لبناء البنية')}
              </p>
            </div>
          )}
        </Panel>

        <Panel position="top-right" className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-card/80 backdrop-blur-sm"
            onClick={analyzeArchitecture}
            disabled={nodes.length === 0}
            data-testid="button-analyze-arch"
          >
            <BarChart3 className="w-4 h-4" />
            {t('Analyze', 'تحليل')}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-card/80 backdrop-blur-sm"
            onClick={clearCanvas}
            data-testid="button-clear-canvas"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Panel>

        <Panel position="bottom-center">
          <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2">
            <Badge variant="secondary" className="gap-1">
              <Server className="w-3 h-3" />
              {nodes.filter(n => n.type === 'service').length} {t('Services', 'خدمات')}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Database className="w-3 h-3" />
              {nodes.filter(n => n.type === 'database').length} {t('Databases', 'قواعد بيانات')}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Cloud className="w-3 h-3" />
              {nodes.filter(n => n.type === 'infra').length} {t('Infra', 'بنية تحتية')}
            </Badge>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function ArchitectureCanvas(props: ArchitectureCanvasProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
