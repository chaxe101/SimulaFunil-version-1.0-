
'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { blockTypes } from "@/lib/types.tsx";

export const BlockLibrary = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const groupedBlocks = blockTypes.reduce((acc, block) => {
        const category = block.category || 'Outros';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(block);
        return acc;
    }, {} as Record<string, typeof blockTypes>);

    return (
        <ScrollArea className="flex-1 p-3 pt-4">
            <div className="space-y-6">
                {Object.entries(groupedBlocks).map(([category, blocks]) => (
                    <div key={category}>
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-3">
                            {category}
                        </h3>
                        <div className="space-y-2">
                            {blocks.map((block) => (
                                <div
                                    key={block.type}
                                    className="flex items-center gap-3 p-3 h-14 rounded-md bg-[#151922] hover:bg-[#232837] cursor-grab transition-colors"
                                    onDragStart={(event) => onDragStart(event, block.type)}
                                    draggable
                                >
                                    <div style={{ color: block.color }}>
                                        {React.cloneElement(block.icon, { className: 'w-6 h-6 flex-shrink-0' })}
                                    </div>
                                    <span className="text-sm font-medium">{block.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};
