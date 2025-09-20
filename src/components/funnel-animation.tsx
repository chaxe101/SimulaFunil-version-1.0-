
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
  Node,
  Edge,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
  NodeOrigin,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { BrainCircuit, Image as ImageIcon, Video, Megaphone } from 'lucide-react';

// Local block definitions to make the component self-contained and prevent future errors.
const animationBlockTypes = [
    { type: 'notes', label: 'Nota', icon: <BrainCircuit />, color: '#4C8FFF' },
    { type: 'google-ads', label: 'Anúncio', icon: <Megaphone />, color: '#2ECC71' },
    { type: 'image-upload', label: 'Imagem', icon: <ImageIcon />, color: '#F39C12' },
    { type: 'video-upload', label: 'Vídeo', icon: <Video />, color: '#FF5678' },
];

const findBlockByType = (type: string) => {
    return animationBlockTypes.find(b => b.type === type);
}

const AnimatedNode = ({ data, selected }: NodeProps<{ type: string; label?: string; imageUrl?: string }>) => {
  const blockInfo = findBlockByType(data.type);

  // Strengthened check to prevent crash if blockInfo is not found
  if (!blockInfo || !blockInfo.icon) {
    return (
        <div className="w-56 h-36 p-3 rounded-lg shadow-xl bg-card border-2 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Bloco inválido</span>
        </div>
    );
  }

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <div 
        className={cn(
          "w-56 h-36 p-3 rounded-lg shadow-xl bg-card border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300",
          selected ? 'border-primary scale-105' : 'border-border'
        )}
      >
        <div className="flex items-center gap-2">
            <div style={{color: blockInfo.color}}>{React.cloneElement(blockInfo.icon, {className: 'w-6 h-6'})}</div>
            <span className="text-sm font-semibold text-center text-card-foreground">{data.label || blockInfo.label}</span>
        </div>
        {data.imageUrl && (
             <div className='mt-1 text-xs p-1 bg-muted rounded w-full h-full relative overflow-hidden'>
                <Image src={data.imageUrl} alt={`Preview of ${data.label}`} fill objectFit="cover" />
            </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </>
  );
};

const nodeTypes = {
  custom: AnimatedNode,
};

const nodeOrigin: NodeOrigin = [0, 0];
const getId = (name: string) => `dnd-node_${name}`;

const animationSteps = [
    { type: 'add_node', node: { id: getId('brainstorm'), type: 'custom', position: { x: 100, y: 50 }, data: { type: 'notes', label: 'Brainstorm Inicial' }, nodeOrigin } as Node },
    { type: 'select_node', nodeId: getId('brainstorm') },
    { type: 'wait', duration: 1500 },
    { type: 'unselect_node', nodeId: getId('brainstorm') },
    { type: 'add_node', node: { id: getId('references'), type: 'custom', position: { x: 400, y: 50 }, data: { type: 'google-ads', label: 'Referências' }, nodeOrigin } as Node },
    { type: 'add_edge', edge: { id: 'e1', source: getId('brainstorm'), target: getId('references'), animated: true } },
    { type: 'select_node', nodeId: getId('references') },
    { type: 'update_node_image', nodeId: getId('references'), data: { imageUrl: 'https://i.postimg.cc/zfHYtpZJ/Captura-de-tela-2025-08-02-212217.png' } },
    { type: 'show_preview', imageUrl: 'https://i.postimg.cc/zfHYtpZJ/Captura-de-tela-2025-08-02-212217.png' },
    { type: 'wait', duration: 2000 },
    { type: 'hide_preview' },
    { type: 'unselect_node', nodeId: getId('references') },
    { type: 'add_node', node: { id: getId('prototype'), type: 'custom', position: { x: 400, y: 250 }, data: { type: 'image-upload', label: 'Protótipo' }, nodeOrigin } as Node },
    { type: 'add_edge', edge: { id: 'e2', source: getId('references'), target: getId('prototype'), animated: true } },
    { type: 'select_node', nodeId: getId('prototype') },
    { type: 'update_node_image', nodeId: getId('prototype'), data: { imageUrl: 'https://i.postimg.cc/VLyvj7TW/Captura-de-tela-2025-08-02-220132.png' } },
    { type: 'show_preview', imageUrl: 'https://i.postimg.cc/VLyvj7TW/Captura-de-tela-2025-08-02-220132.png' },
    { type: 'wait', duration: 2000 },
    { type: 'hide_preview' },
    { type: 'unselect_node', nodeId: getId('prototype') },
    { type: 'add_node', node: { id: getId('feedback-video'), type: 'custom', position: { x: 400, y: 450 }, data: { type: 'video-upload', label: 'Vídeo de Feedback' }, nodeOrigin } as Node },
    { type: 'add_edge', edge: { id: 'e3', source: getId('prototype'), target: getId('feedback-video'), animated: true } },
    { type: 'fit_view' },
    { type: 'wait', duration: 3000 }, // Wait before restart
    { type: 'end' }
];

export function FunnelAnimation() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), []);

  const resetAnimation = () => {
    setNodes([]);
    setEdges([]);
    setStepIndex(0);
    setPreviewImageUrl(null);
  };
  
  const runAnimationStep = useCallback((index: number) => {
    if (index >= animationSteps.length) {
      resetAnimation();
      return;
    }

    const step = animationSteps[index];

    switch (step.type) {
      case 'add_node':
        setNodes((nds) => [...nds, step.node]);
        break;
      case 'add_edge':
        setEdges((eds) => addEdge(step.edge, eds));
        break;
      case 'select_node':
        setNodes((nds) => nds.map(n => ({ ...n, selected: n.id === step.nodeId })));
        if (reactFlowInstance.current) {
            const node = reactFlowInstance.current.getNode(step.nodeId);
            if(node) {
                 reactFlowInstance.current.setCenter(node.position.x + (node.width!/2), node.position.y + (node.height!/2), { zoom: 1.5, duration: 800 });
            }
        }
        break;
      case 'update_node_image':
        setNodes((nds) =>
          nds.map((n) => (n.id === step.nodeId ? { ...n, data: { ...n.data, ...step.data } } : n))
        );
        break;
       case 'show_preview':
        setPreviewImageUrl(step.imageUrl);
        break;
      case 'hide_preview':
        setPreviewImageUrl(null);
        break;
      case 'unselect_node':
        setNodes((nds) => nds.map(n => ({ ...n, selected: false })));
        break;
      case 'fit_view':
         reactFlowInstance.current?.fitView({ padding: 0.2, duration: 800 });
         break;
       case 'end':
        resetAnimation();
        return; // Important to stop the current cycle
    }

    setStepIndex(index + 1);
  }, [reactFlowInstance]);
  

  useEffect(() => {
      const step = animationSteps[stepIndex];
      if (!step) {
          // If we are out of bounds, reset and start over
          const timer = setTimeout(resetAnimation, 1000);
          return () => clearTimeout(timer);
      }

      const delay = step.type === 'wait' ? step.duration : 1000;
      
      animationTimeout.current = setTimeout(() => {
        runAnimationStep(stepIndex);
      }, delay); 

      return () => {
        if(animationTimeout.current) {
          clearTimeout(animationTimeout.current)
        }
      };
  }, [stepIndex, runAnimationStep]);


  return (
    <ReactFlowProvider>
      <div className="w-full h-full rounded-2xl border-4 border-primary/20 bg-card shadow-2xl overflow-hidden relative">
          {previewImageUrl && (
              <div 
                className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8 animate-in fade-in-50"
                onClick={() => setPreviewImageUrl(null)}
              >
                  <Image 
                      src={previewImageUrl} 
                      alt="Preview" 
                      width={800} 
                      height={600} 
                      className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
                  />
              </div>
          )}
          <div className="p-4 border-b border-border/50 bg-sidebar flex items-center justify-between">
              <h2 className="font-headline text-xl">Demonstração: Planejamento de App</h2>
          </div>
        
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={(instance) => { reactFlowInstance.current = instance; }}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                panOnDrag={false}
                className="flex-grow"
                >
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
            </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
