
'use client';

import { useEditorStore } from '@/stores/editor-store';
import { useMemo } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'Fazendo':
            return 'bg-yellow-500/80';
        case 'Feito':
            return 'bg-green-500/80';
        case 'A Fazer':
        default:
            return 'bg-blue-500/80';
    }
}

export function TimelineView() {
    const { nodes, exportToPdf, currentView } = useEditorStore(state => ({
        nodes: state.nodes.filter(node => node.data.isTask && node.data.startDate && node.data.endDate),
        exportToPdf: state.exportToPdf,
        currentView: state.currentView,
    }));

    const handleExport = () => {
        exportToPdf('linha-do-tempo', currentView);
    };

    const sortedTasks = useMemo(() => {
        return nodes.sort((a, b) => new Date(a.data.startDate).getTime() - new Date(b.data.startDate).getTime());
    }, [nodes]);

    const { overallStartDate, overallEndDate, totalDays } = useMemo(() => {
        if (sortedTasks.length === 0) {
            const today = new Date();
            return {
                overallStartDate: today,
                overallEndDate: addDays(today, 30),
                totalDays: 30
            };
        }
        const startDates = sortedTasks.map(task => new Date(task.data.startDate));
        const endDates = sortedTasks.map(task => new Date(task.data.endDate));
        const overallStartDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        const overallEndDate = new Date(Math.max(...endDates.map(d => d.getTime())));
        const totalDays = differenceInDays(overallEndDate, overallStartDate) + 1;
        return { overallStartDate, overallEndDate, totalDays: Math.max(totalDays, 1) };
    }, [sortedTasks]);

    return (
        <div className="p-4 sm:p-6 h-full w-full overflow-auto">
             <div className="flex-shrink-0 mb-4 flex justify-end">
                <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>
            <Card id="timeline-export-area">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Linha do Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedTasks.length > 0 ? (
                        <div className="relative space-y-2 pt-8">
                           {/* Header with dates */}
                            <div className="sticky top-0 z-10 bg-card pb-2 mb-2 border-b border-border grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(40px, 1fr))` }}>
                                {Array.from({ length: totalDays }).map((_, i) => {
                                    const date = addDays(overallStartDate, i);
                                    return (
                                        <div key={i} className="text-center text-xs text-muted-foreground border-r border-border/50 last:border-r-0">
                                            <p>{format(date, 'dd')}</p>
                                            <p className='font-bold'>{format(date, 'MMM')}</p>
                                        </div>
                                    );
                                })}
                            </div>
                             {/* Task bars */}
                            <TooltipProvider>
                                <div className="space-y-3">
                                {sortedTasks.map(task => {
                                    const taskStartDate = new Date(task.data.startDate);
                                    const taskEndDate = new Date(task.data.endDate);
                                    const startOffset = differenceInDays(taskStartDate, overallStartDate);
                                    const duration = differenceInDays(taskEndDate, taskStartDate) + 1;

                                    if (startOffset < 0 || duration <= 0) return null;

                                    return (
                                        <Tooltip key={task.id}>
                                            <TooltipTrigger asChild>
                                                <div className="relative h-10 flex items-center">
                                                    <div 
                                                        className={cn("absolute h-8 rounded-md text-white flex items-center px-2", getStatusColor(task.data.status))}
                                                        style={{
                                                            left: `calc(${(startOffset / totalDays) * 100}% + 2px)`,
                                                            width: `calc(${(duration / totalDays) * 100}% - 4px)`,
                                                        }}
                                                    >
                                                        <p className="text-sm font-medium truncate">{task.data.label}</p>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className='font-bold'>{task.data.label}</p>
                                                <p>Status: {task.data.status}</p>
                                                <p>Início: {format(taskStartDate, 'dd/MM/yyyy')}</p>
                                                <p>Fim: {format(taskEndDate, 'dd/MM/yyyy')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                                </div>
                            </TooltipProvider>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Nenhuma tarefa com data de início e fim encontrada.</p>
                            <p className="text-sm">Adicione tarefas com um período definido para vê-las aqui.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
