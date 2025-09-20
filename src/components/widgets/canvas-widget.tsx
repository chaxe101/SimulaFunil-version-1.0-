
'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Node,
  Edge,
  BackgroundVariant,
  NodeOrigin,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '@/stores/editor-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CustomNode } from '../funnel-editor/custom-node';

const nodeTypes = {
  custom: CustomNode,
};

const nodeOrigin: NodeOrigin = [0, 0];

export function CanvasWidget() {
    const { nodes, edges, setCurrentView } = useEditorStore(state => ({
        nodes: state.nodes,
        edges: state.edges,
        setCurrentView: state.setCurrentView,
    }));

    // CRITICAL FIX: Filter out task nodes from the canvas widget view
    const canvasNodes = useMemo(() => nodes.filter(node => !node.data.isTask), [nodes]);

    return (
       <Card className="h-full flex flex-col flex-grow">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Canvas</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('fluxo')}>
                    Ver Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow relative">
                 <div className="absolute inset-0">
                    <ReactFlow
                        nodes={canvasNodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        proOptions={{ hideAttribution: true }}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        zoomOnScroll={true}
                        panOnDrag={true}
                        nodeOrigin={nodeOrigin}
                        className="bg-muted/30 rounded-md"
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
                    </ReactFlow>
                 </div>
            </CardContent>
        </Card>
    );
}
