
'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Flag, Plus, X } from 'lucide-react';
import type { Node } from 'reactflow';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getId = () => `dnd-node_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const KanbanSidebar = () => {
  const { selectedNode, addNode, selectNode, updateNodeData, unselectNode } = useEditorStore(state => ({
    selectedNode: state.selectedNode,
    addNode: state.addNode,
    selectNode: state.selectNode,
    updateNodeData: state.updateNodeData,
    unselectNode: state.unselectNode,
  }));

  const handleCreateNewTask = () => {
      const newNode: Node = {
        id: getId(),
        position: { x: -9999, y: -9999 }, 
        type: 'custom',
        data: { 
            isTask: true, 
            label: 'Nova Tarefa',
            status: 'A Fazer',
            priority: 'baixa',
        },
      };
      addNode(newNode);
      selectNode(newNode.id);
  }

  const handleDataChange = (key: string, value: any) => {
    if (selectedNode) {
        updateNodeData(selectedNode.id, { [key]: value });
    }
  };

  const handleDateChange = (key: 'startDate' | 'endDate' | 'deadline', date: Date | undefined) => {
    if (date) {
      handleDataChange(key, date.toISOString());
    } else {
      handleDataChange(key, undefined);
    }
  };

  return (
    <div className="w-80 flex-shrink-0 border-r border-[#232837] bg-card/50 flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-border">
            <h2 className="text-2xl font-bold font-headline">Kanban</h2>
            <p className="text-sm text-muted-foreground mt-1">Gerencie suas tarefas.</p>
        </div>
        <div className="p-4">
          <Button className="w-full" onClick={handleCreateNewTask}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
          </Button>
        </div>
        <ScrollArea className="flex-grow">
            {selectedNode && selectedNode.data.isTask ? (
                 <div className="p-4 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold">Editar Tarefa</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={unselectNode}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Desmarcar Tarefa</span>
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="node-label">Rótulo da Tarefa</Label>
                        <Input
                        id="node-label"
                        value={selectedNode.data.label || ''}
                        onChange={(e) => handleDataChange('label', e.target.value)}
                        placeholder="Nome da tarefa"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="node-description">Descrição</Label>
                        <Textarea
                            id="node-description"
                            value={selectedNode.data.description || ''}
                            onChange={(e) => handleDataChange('description', e.target.value)}
                            placeholder="Adicione uma descrição detalhada..."
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={selectedNode.data.status || 'A Fazer'}
                            onValueChange={(value) => handleDataChange('status', value)}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="A Fazer">A Fazer</SelectItem>
                            <SelectItem value="Fazendo">Fazendo</SelectItem>
                            <SelectItem value="Feito">Feito</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select
                            value={selectedNode.data.priority || 'baixa'}
                            onValueChange={(value) => handleDataChange('priority', value)}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Prazo Final</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedNode.data.deadline && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedNode.data.deadline ? format(new Date(selectedNode.data.deadline), "PPP") : <span>Escolha uma data</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedNode.data.deadline ? new Date(selectedNode.data.deadline) : undefined}
                                onSelect={(date) => handleDateChange('deadline', date)}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                 </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground text-sm h-full flex items-center justify-center">
                    <p>Selecione uma tarefa para ver e editar seus detalhes.</p>
                </div>
            )}
        </ScrollArea>
    </div>
  );
};
