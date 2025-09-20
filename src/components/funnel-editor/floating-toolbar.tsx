
'use client';

import React from 'react';
import { blockTypes } from "@/lib/types.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export const FloatingToolbar = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
       <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
         <div className="flex flex-col items-center gap-3 p-2 bg-card/80 border border-border rounded-full backdrop-blur-sm">
            <TooltipProvider>
                {blockTypes.map((block) => (
                    <Tooltip key={block.type}>
                        <TooltipTrigger asChild>
                             <div
                                className={cn(
                                    "flex items-center justify-center h-12 w-12 rounded-full bg-card hover:bg-accent cursor-grab transition-colors border-2 border-border",
                                    "hover:border-primary"
                                )}
                                onDragStart={(event) => onDragStart(event, block.type)}
                                draggable
                            >
                                <div style={{ color: block.color }}>
                                    {React.cloneElement(block.icon, { className: 'w-6 h-6' })}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{block.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
         </div>
       </div>
    );
};
