
'use client';

import React, { DragEvent, useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  ReactFlowInstance,
  NodeOrigin,
  EdgeChange,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './custom-node';
import { useEditorStore } from '@/stores/editor-store';
import { findBlockByType } from '@/lib/types.tsx';
import { useShallow } from 'zustand/react/shallow';
import CustomEdge from './custom-edge';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

const nodeOrigin: NodeOrigin = [0, 0];

const getId = () => `dnd-node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function FunnelEditor({ funnelId, isPresentation = false, initialNodes, initialEdges }: { funnelId: string, isPresentation?: boolean, initialNodes?: Node[], initialEdges?: Edge[] }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useEditorStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      addNode: state.addNode,
    }))
  );
  
  // Use initial props if provided (for presentation mode), otherwise use the store's state.
  const nodes = initialNodes || storeNodes;
  const edges = isPresentation ? (initialEdges || []) : storeEdges;

  // CRITICAL FIX: Filter out task nodes from the canvas view
  const canvasNodes = useMemo(() => nodes.filter(node => !node.data.isTask), [nodes]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const blockInfo = findBlockByType(type);

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position,
        data: { 
          type,
          isTask: blockInfo?.isTask || false,
          status: blockInfo?.isTask ? 'A Fazer' : undefined,
          priority: blockInfo?.isTask ? 'baixa' : undefined,
        },
        nodeOrigin,
      };
      
      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );
  
  // Pass isPresentation prop to each node
  const nodesWithPresentationProp = React.useMemo(() => {
    return canvasNodes.map(node => ({ // Use canvasNodes here
        ...node,
        data: {
            ...node.data,
            isPresentation: isPresentation
        }
    }));
  }, [canvasNodes, isPresentation]);

  return (
      <div className="w-full h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesWithPresentationProp}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={isPresentation ? undefined : onEdgesChange}
          onConnect={isPresentation ? undefined : onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodeOrigin={nodeOrigin}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={!isPresentation}
          nodesConnectable={!isPresentation}
          elementsSelectable={!isPresentation}
          zoomOnScroll={true}
          panOnDrag={true}
          zoomOnDoubleClick={!isPresentation}
          zoomOnPinch={true}
          isValidConnection={() => true}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          {!isPresentation && <Controls />}
          {!isPresentation && <MiniMap nodeStrokeWidth={3} zoomable pannable />}
        </ReactFlow>
      </div>
  );
}
