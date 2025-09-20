'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const { deleteEdge } = useEditorStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
            ...style, 
            strokeWidth: selected ? 3 : 2, 
            stroke: selected ? '#FF5678' : '#A7B0C0' 
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={cn(
            'nodrag nopan transition-opacity duration-200',
            selected ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            variant="destructive"
            size="icon"
            className="w-6 h-6 rounded-full shadow-lg"
            onClick={handleDelete}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
