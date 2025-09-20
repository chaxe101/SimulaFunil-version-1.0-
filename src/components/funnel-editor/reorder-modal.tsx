
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEditorStore, EditorView } from '@/stores/editor-store';
import { useState, useEffect } from 'react';
import { GripVertical, LayoutGrid, KanbanSquare, PenSquare, Calendar, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface ModuleItem {
    id: EditorView;
    label: string;
    icon: React.ReactNode;
}

const availableModules: ModuleItem[] = [
    { id: 'hub', label: 'Hub', icon: <Home className="w-4 h-4" /> },
    { id: 'fluxo', label: 'Canvas', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanSquare className="w-4 h-4" /> },
    { id: 'notes', label: 'Anotações', icon: <PenSquare className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendário & Timeline', icon: <Calendar className="w-4 h-4" /> },
];

const SlideCard = ({ slide }: { slide: ModuleItem }) => (
    <div
        className="flex items-center gap-2 p-2 border rounded-md cursor-grab active:cursor-grabbing bg-card shadow-sm"
    >
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
         <div className="text-primary">{slide.icon}</div>
        <span className="font-medium text-sm truncate">{slide.label}</span>
    </div>
);

export const ReorderModal = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (isOpen: boolean) => void }) => {
  const { presentation_order, setPresentationOrder } = useEditorStore(state => ({
    presentation_order: state.presentation_order,
    setPresentationOrder: state.setPresentationOrder,
  }));
    
  const [availableSlides, setAvailableSlides] = useState<ModuleItem[]>([]);
  const [presentationSlides, setPresentationSlides] = useState<ModuleItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<'available' | 'presentation' | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPresentationModules = presentation_order
        .map(id => availableModules.find(m => m.id === id))
        .filter((m): m is ModuleItem => !!m);
      
      const currentAvailableModules = availableModules.filter(m => !presentation_order.includes(m.id));

      setPresentationSlides(currentPresentationModules);
      setAvailableSlides(currentAvailableModules);
    }
  }, [isOpen, presentation_order]);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string, from: 'available' | 'presentation') => {
    setDraggedId(id);
    setDraggedFrom(from);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement | HTMLLIElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, to: 'available' | 'presentation') => {
    e.preventDefault();
    if (!draggedId || !draggedFrom || draggedFrom === to) return;

    if (draggedFrom === 'available' && to === 'presentation') {
        const slide = availableSlides.find(s => s.id === draggedId);
        if (slide) {
            setPresentationSlides(prev => [...prev, slide]);
            setAvailableSlides(prev => prev.filter(s => s.id !== draggedId));
        }
    } else if (draggedFrom === 'presentation' && to === 'available') {
        const slide = presentationSlides.find(s => s.id === draggedId);
        if (slide) {
            setAvailableSlides(prev => [...prev, slide]);
            setPresentationSlides(prev => prev.filter(s => s.id !== draggedId));
        }
    }
    setDraggedId(null);
    setDraggedFrom(null);
  };

  const handlePresentationListDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    if (!draggedId) return;

    if (draggedFrom === 'presentation') { // Reordering within the list
        const draggedItem = presentationSlides.find(s => s.id === draggedId);
        if (!draggedItem) return;

        const itemsWithoutDragged = presentationSlides.filter(s => s.id !== draggedId);
        itemsWithoutDragged.splice(dropIndex, 0, draggedItem);
        setPresentationSlides(itemsWithoutDragged);
    } else if (draggedFrom === 'available') { // Moving from available to a specific position
        const slide = availableSlides.find(s => s.id === draggedId);
        if (slide) {
            const newPresentationSlides = [...presentationSlides];
            newPresentationSlides.splice(dropIndex, 0, slide);
            setPresentationSlides(newPresentationSlides);
            setAvailableSlides(prev => prev.filter(s => s.id !== draggedId));
        }
    }

    setDraggedId(null);
    setDraggedFrom(null);
  }

  const handleSaveChanges = () => {
    setPresentationOrder(presentationSlides.map(s => s.id as EditorView));
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Montar Apresentação</DialogTitle>
          <DialogDescription>
            Arraste os módulos da esquerda para a direita para incluí-los na sua apresentação. Você pode reordená-los na coluna da direita.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4 min-h-[300px]">
            {/* Available Modules Column */}
            <div 
                className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'available')}
            >
                <h3 className="font-semibold text-center pb-2 border-b">Módulos Disponíveis</h3>
                <ul className="space-y-2 flex-1 min-h-[50px]">
                    {availableSlides.map((slide) => (
                        <li 
                            key={slide.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, slide.id, 'available')}
                        >
                            <SlideCard slide={slide} />
                        </li>
                    ))}
                     {availableSlides.length === 0 && <p className="text-xs text-center text-muted-foreground p-4">Todos os módulos já estão na apresentação.</p>}
                </ul>
            </div>

            {/* Presentation Slides Column */}
            <div 
                className="flex flex-col gap-2 p-3 border-2 border-primary/50 border-dashed rounded-lg"
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, 'presentation')}
            >
                <h3 className="font-semibold text-center pb-2 border-b">Slides da Apresentação</h3>
                <ul className="space-y-2 flex-1 min-h-[50px]">
                   {presentationSlides.map((slide, index) => (
                         <li 
                            key={slide.id} 
                            draggable
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handlePresentationListDrop(e, index)}
                            onDragStart={(e) => handleDragStart(e, slide.id, 'presentation')}
                            className="list-none"
                          >
                           <SlideCard slide={slide} />
                         </li>
                    ))}
                    {presentationSlides.length === 0 && <p className="text-xs text-center text-muted-foreground p-4">Arraste módulos aqui para começar.</p>}
                </ul>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Salvar Apresentação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
