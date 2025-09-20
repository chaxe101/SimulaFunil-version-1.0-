
'use client';

import React, { useMemo } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import type { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';

type Task = Node;
type ColumnId = 'A Fazer' | 'Fazendo' | 'Feito';

const getPriorityPillClass = (priority?: string) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-500/20 text-red-400';
    case 'media':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'baixa':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'hidden';
  }
};

const getColumnColorClass = (columnId: ColumnId) => {
    switch (columnId) {
        case 'A Fazer':
            return 'border-t-4 border-blue-500';
        case 'Fazendo':
            return 'border-t-4 border-yellow-500';
        case 'Feito':
            return 'border-t-4 border-green-500';
        default:
            return 'border-t-4 border-border';
    }
};

function MiniTaskCard({ task }: { task: Task }) {
    return (
        <div className="p-2.5 bg-card/50 rounded-md border shadow-sm">
            <p className="font-semibold text-sm truncate">{task.data.label}</p>
            <div className="flex items-center mt-2">
                {task.data.priority && (
                    <Badge className={cn('capitalize text-xs px-1.5 py-0.5', getPriorityPillClass(task.data.priority))}>
                        <Flag className="w-3 h-3 mr-1"/> {task.data.priority}
                    </Badge>
                )}
            </div>
        </div>
    )
}


export function KanbanWidget() {
    const { allNodes, setCurrentView } = useEditorStore(state => ({
        allNodes: state.nodes, // Use um nome diferente para evitar confusão
        setCurrentView: state.setCurrentView,
    }));

    // Filtra os nós para obter apenas as tarefas, sem modificar o estado global
    const taskNodes = useMemo(() => allNodes.filter(n => n.data.isTask), [allNodes]);

    const columns = useMemo<{ [key in ColumnId]: Task[] }>(() => {
        const cols: { [key in ColumnId]: Task[] } = {
            'A Fazer': [],
            'Fazendo': [],
            'Feito': [],
        };
        taskNodes.forEach((node) => {
            const status = (node.data.status as ColumnId) || 'A Fazer';
            if (cols[status]) {
                cols[status].push(node);
            }
        });
        return cols;
    }, [taskNodes]);

    const columnIds = ['A Fazer', 'Fazendo', 'Feito'] as ColumnId[];

    return (
        <Card className="h-full flex-grow flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Kanban</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('kanban')}>
                    Ver Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                    {columnIds.map(id => (
                        <div key={id} className={cn("rounded-lg bg-muted/40 flex flex-col", getColumnColorClass(id))}>
                            <h3 className="font-semibold p-3 border-b border-border/50 flex-shrink-0">{id} ({columns[id].length})</h3>
                            <ScrollArea className="flex-grow">
                                <div className="p-2 space-y-2">
                                    {columns[id].slice(0, 3).map(task => (
                                        <MiniTaskCard key={task.id} task={task} />
                                    ))}
                                    {columns[id].length > 3 && (
                                        <Button variant="link" size="sm" className="w-full text-muted-foreground" onClick={() => setCurrentView('kanban')}>
                                            + {columns[id].length - 3} Ver todas
                                        </Button>
                                    )}
                                    {columns[id].length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center p-4">Nenhuma tarefa.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
