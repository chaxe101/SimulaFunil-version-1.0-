
'use client';

import React, { useMemo, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import { Calendar, FileDown, Flag, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Task = Node;
type ColumnId = 'A Fazer' | 'Fazendo' | 'Feito';

const getPriorityPillClass = (priority?: string) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'media':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'baixa':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default:
      return 'hidden';
  }
};

const getCardBorderColorClass = (columnId: ColumnId) => {
    switch (columnId) {
        case 'A Fazer':
            return 'border-l-4 border-blue-500';
        case 'Fazendo':
            return 'border-l-4 border-yellow-500';
        case 'Feito':
            return 'border-l-4 border-green-500';
        default:
            return 'border-l-4 border-transparent';
    }
};

const TaskCard = ({ task, columnId }: { task: Task, columnId: ColumnId }) => {
    const { selectNode, selectedNode, deleteNode } = useEditorStore(state => ({
        selectNode: state.selectNode,
        selectedNode: state.selectedNode,
        deleteNode: state.deleteNode,
    }));
    const isSelected = selectedNode?.id === task.id;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique selecione o card
        deleteNode(task.id);
    }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => selectNode(task.id)}
      className={cn(
        'p-4 mb-4 bg-card rounded-md shadow-sm cursor-grab touch-none relative group/task',
        'transition-shadow duration-200 hover:shadow-lg',
        getCardBorderColorClass(columnId),
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
        isDragging && 'opacity-50 z-50',
      )}
    >
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover/task:opacity-100 hover:bg-destructive/10 hover:text-destructive z-10"
                    onClick={(e) => e.stopPropagation()} // Impede a seleção do card ao clicar no botão
                >
                    <Trash2 className="h-4 h-4" />
                    <span className="sr-only">Deletar Tarefa</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente a tarefa "{task.data.label}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Deletar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <h4 className="font-semibold text-sm text-foreground mb-1">{task.data.label}</h4>
        <p className="text-xs text-muted-foreground break-words mb-3">{task.data.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.data.deadline && (
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(task.data.deadline), "dd/MM")}</span>
                </div>
            )}
            {task.data.priority && (
                <Badge variant="outline" className={cn('capitalize text-xs px-1.5 py-0.5 font-normal', getPriorityPillClass(task.data.priority))}>
                    <Flag className="w-3 h-3 mr-1"/> {task.data.priority}
                </Badge>
            )}
        </div>
    </div>
  );
};

const Column = ({ id, title, tasks }: { id: ColumnId; title: string; tasks: Task[] }) => {
    const { setNodeRef } = useSortable({ id });
    const getColumnColorClass = (columnId: ColumnId) => {
        switch (columnId) {
            case 'A Fazer': return 'border-t-4 border-blue-500';
            case 'Fazendo': return 'border-t-4 border-yellow-500';
            case 'Feito': return 'border-t-4 border-green-500';
            default: return 'border-t-4 border-border';
        }
    };
    return (
        <div ref={setNodeRef} className="w-full h-full flex flex-col bg-muted/40 rounded-lg overflow-hidden">
            <div className={cn("p-4 flex-shrink-0", getColumnColorClass(id))}>
                <h3 className="font-semibold text-foreground">{title} <span className="text-sm font-normal text-muted-foreground">({tasks.length})</span></h3>
            </div>
            <ScrollArea className="flex-grow">
                <div className="flex-grow min-h-[100px] transition-colors p-4">
                    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} columnId={id} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
};

export function KanbanView() {
  const { nodes: allNodes, setNodes, updateNodeData, exportToPdf, currentView } = useEditorStore(state => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    updateNodeData: state.updateNodeData,
    exportToPdf: state.exportToPdf,
    currentView: state.currentView,
  }));

  // CRITICAL FIX: Ensure Kanban view only ever deals with task nodes.
  const tasks = useMemo(() => allNodes.filter(n => n.data.isTask), [allNodes]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  const handleExport = () => {
    exportToPdf('kanban', currentView);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksById = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, Task>);
  }, [tasks]);

  const columnIds = useMemo(() => Object.keys(columns), [columns]) as ColumnId[];

  function findContainer(id: string) {
    if (columnIds.includes(id as ColumnId)) {
        return id;
    }
    const task = tasksById[id];
    return task?.data.status || 'A Fazer';
  }

  function handleDragStart(event: DragStartEvent) {
      const { active } = event;
      const task = tasks.find(t => t.id === active.id);
      if (task) {
          setActiveTask(task);
      }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    // We update the state locally for a smooth UI, but the final save happens onDragEnd
    updateNodeData(activeId, { status: overContainer });
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) {
        return;
    };

    const activeId = active.id as string;
    const overContainer = findContainer(over.id as string);
    const activeNode = allNodes.find(n => n.id === activeId);

    if (activeNode && activeNode.data.status !== overContainer) {
        updateNodeData(activeId, { status: overContainer });
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
       <div className="p-4 sm:p-6 flex-grow flex flex-col">
            <div className="flex-shrink-0 mb-4 flex justify-end">
                <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                </Button>
            </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={columnIds}>
                    {columnIds.map((id) => (
                        <Column key={id} id={id} title={id} tasks={columns[id]} />
                    ))}
                </SortableContext>
                <DragOverlay>
                    {activeTask ? ( 
                        <TaskCard 
                            task={activeTask} 
                            columnId={activeTask.data.status || 'A Fazer'} 
                        /> 
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
       </div>
    </div>
  );
}
