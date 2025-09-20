
'use client';

import React, { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import type { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

type Task = Node;
type ColumnId = 'A Fazer' | 'Fazendo' | 'Feito';

const getPresentationPriorityBadgeClass = (priority?: string) => {
    switch(priority) {
        case 'alta': return 'bg-red-500/30 text-red-300 border border-red-500/50';
        case 'media': return 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50';
        case 'baixa': return 'bg-blue-500/30 text-blue-300 border border-blue-500/50';
        default: return 'hidden';
    }
};

const PresentationTaskCard = ({ task }: { task: Task }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-6 shadow-lg flex flex-col"
    >
        <h3 className="text-xl font-bold mb-2 text-foreground">{task.data.label}</h3>
        <p className="text-base text-muted-foreground mb-4">{task.data.description}</p>
        <div className="mt-auto flex items-center gap-4">
            {task.data.priority && (
                <Badge variant="outline" className={cn("text-sm capitalize", getPresentationPriorityBadgeClass(task.data.priority))}>
                    {task.data.priority}
                </Badge>
            )}
            {task.data.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(task.data.deadline), 'dd/MM/yyyy')}</span>
                </div>
            )}
        </div>
    </motion.div>
);

const PresentationColumn = ({ title, tasks }: { title: ColumnId; tasks: Task[] }) => {
    const getColumnColorClass = (columnId: string) => {
        switch (columnId) {
            case 'A Fazer': return 'border-blue-500';
            case 'Fazendo': return 'border-yellow-500';
            case 'Feito': return 'border-green-500';
            default: return 'border-border';
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl h-full overflow-hidden">
            <div className={cn("pb-2 border-b-2 flex-shrink-0", getColumnColorClass(title))}>
                <h3 className="font-bold text-xl text-foreground">{title} ({tasks.length})</h3>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                 <div className="space-y-4">
                    {tasks.map(task => (
                        <PresentationTaskCard key={task.id} task={task} />
                    ))}
                 </div>
            </div>
        </div>
    );
};


export function KanbanPresentationView() {
  const { nodes: allNodes } = useEditorStore(state => ({
    nodes: state.nodes,
  }));

  const tasks = useMemo(() => allNodes.filter(n => n.data.isTask), [allNodes]);

  const columns = useMemo<{ [key in ColumnId]: Task[] }>(() => {
    const cols: { [key in ColumnId]: Task[] } = {
      'A Fazer': [],
      'Fazendo': [],
      'Feito': [],
    };
    tasks.forEach((task) => {
      const status = (task.data.status as ColumnId) || 'A Fazer';
      if (cols[status]) {
        cols[status].push(task);
      }
    });
    return cols;
  }, [tasks]);

  const columnIds = ['A Fazer', 'Fazendo', 'Feito'] as ColumnId[];

    return (
        <div className="h-full w-full bg-[#0F1115] p-4 sm:p-6 flex flex-col">
            <div className="grid grid-cols-3 gap-6 h-full flex-grow">
                {columnIds.map(id => (
                    <PresentationColumn key={id} title={id} tasks={columns[id]} />
                ))}
            </div>
        </div>
    );
}
