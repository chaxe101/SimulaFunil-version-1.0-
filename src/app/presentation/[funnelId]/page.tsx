
'use client';

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HubView } from '@/components/views/hub-view';
import { FunnelEditor } from '@/components/funnel-editor/editor';
import { ReactFlowProvider } from 'reactflow';
import { KanbanPresentationView } from '@/components/views/kanban-presentation-view';
import { NotesPresentationView } from '@/components/views/notes-presentation-view';
import { CalendarPresentationView } from '@/components/views/calendar-presentation-view';
import { getFunnelById } from '@/lib/supabase-service';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ContentPreviewModal } from '@/components/funnel-editor/content-preview-modal';
import { useShallow } from 'zustand/react/shallow';

const moduleViews: Record<string, { component: React.ReactNode; label: string }> = {
    'hub': { component: <HubView />, label: 'Hub' },
    'fluxo': { 
        component: (
            <ReactFlowProvider>
                <FunnelEditor 
                    funnelId={''} 
                    isPresentation={true} 
                />
            </ReactFlowProvider>
        ), 
        label: 'Canvas' 
    },
    'kanban': { component: <KanbanPresentationView />, label: 'Kanban' },
    'notes': { component: <NotesPresentationView />, label: 'Anotações' },
    'calendar': { component: <CalendarPresentationView />, label: 'Calendário' },
};

const SlideContent = ({ viewId, funnelId }: { viewId: string; funnelId: string | null }) => {
    const { nodes, edges } = useEditorStore(
        useShallow((state) => ({ nodes: state.nodes, edges: state.edges }))
    );

    if (viewId === 'fluxo') {
         return (
            <ReactFlowProvider>
                <FunnelEditor 
                    funnelId={funnelId || ''} 
                    isPresentation={true} 
                    initialNodes={nodes}
                    initialEdges={edges}
                />
            </ReactFlowProvider>
        );
    }

    const view = moduleViews[viewId];
    if (!view) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 p-8 text-center">
                <h3 className="text-2xl font-bold">Módulo Inválido</h3>
            </div>
        );
    }

    return (
      <div className="w-full h-full bg-[#0F1115] overflow-hidden">
          {view.component}
      </div>
    );
};


export default function PresentationPage() {
  const router = useRouter();
  const params = useParams();
  const funnelId = Array.isArray(params.funnelId) ? params.funnelId[0] : params.funnelId;
  const [isLoading, setIsLoading] = useState(true);

  const {
    presentation_order,
    presentationNodeId: currentSlideId,
    goToNextNode,
    goToPrevNode,
    setFunnelId,
    setNodes,
    setEdges,
    setPresentationOrder,
    setInitialNotes,
    setCalendarEvents,
    setPresentationNodeId,
    previewContent,
    setPreviewContent,
  } = useEditorStore(state => ({
    presentation_order: state.presentation_order,
    presentationNodeId: state.presentationNodeId,
    goToNextNode: state.goToNextNode,
    goToPrevNode: state.goToPrevNode,
    setFunnelId: state.setFunnelId,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    setPresentationOrder: state.setPresentationOrder,
    setInitialNotes: state.setInitialNotes,
    setCalendarEvents: state.setCalendarEvents,
    setPresentationNodeId: state.setPresentationNodeId,
    previewContent: state.previewContent,
    setPreviewContent: state.setPreviewContent,
  }));
  
  useEffect(() => {
    const fetchProjectData = async () => {
        setIsLoading(true);
        try {
            const data = await getFunnelById(funnelId);
            if(data) {
                setFunnelId(funnelId);
                setNodes(data.nodes || []);
                setEdges(data.edges || []);
                const order = data.presentation_order || [];
                setPresentationOrder(order);
                setInitialNotes(data.notes || []);
                setCalendarEvents(data.calendar_events || []);
                if (order.length > 0 && !currentSlideId) {
                    setPresentationNodeId(order[0]);
                }
            } else {
                router.push('/dashboard'); // Funnel not found
            }
        } catch (error) {
            console.error(error);
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    }
    fetchProjectData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);

  const handleExitPresentation = () => {
    const lastView = localStorage.getItem(`funnel-last-view-${funnelId}`) || 'hub';
    router.push(`/editor/${funnelId}?view=${lastView}`);
  };

  const presentationModuleLabels: Record<string, { label: string }> = {
    'hub': { label: 'Hub' },
    'fluxo': { label: 'Canvas' },
    'kanban': { label: 'Kanban' },
    'notes': { label: 'Anotações' },
    'calendar': { label: 'Calendário' },
  };

  const currentIndex = presentation_order.findIndex(id => id === currentSlideId);
  const totalSlides = presentation_order.length;
  const currentViewInfo = currentSlideId ? presentationModuleLabels[currentSlideId] : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToNextNode();
    if (e.key === 'ArrowLeft') goToPrevNode();
    if (e.key === 'Escape') handleExitPresentation();
  };

  React.useEffect(() => {
    const container = document.getElementById('presentation-container');
    container?.focus();
  }, [currentSlideId]);
  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-black">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      )
  }

  if (totalSlides === 0 && !isLoading) {
    return (
       <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-8 text-center">
          <h2 className="text-3xl font-bold">Nenhum slide na apresentação.</h2>
           <p className="text-lg text-white/80 mt-2">Use o botão "Montar Apresentação" no editor para adicionar slides.</p>
          <Button size="lg" onClick={handleExitPresentation} className="mt-8">
            Voltar para o Editor
          </Button>
      </div>
    );
  }
  
  return (
    <div 
        id="presentation-container"
        className="flex h-screen w-full flex-col bg-black text-white outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
    >
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/80" onClick={handleExitPresentation}>
            <X className="h-5 w-5" />
        </Button>

        <div className="flex-grow p-4 flex items-center justify-center overflow-hidden">
             {currentSlideId && !isLoading && <SlideContent viewId={currentSlideId} funnelId={funnelId} />}
        </div>
        
        <div className="flex-shrink-0 w-full flex items-center justify-center py-4">
            <div className="flex items-center gap-4 rounded-lg bg-[#151922]/80 p-2 backdrop-blur-md border border-[#232837]">
                <Button variant="ghost" size="icon" onClick={goToPrevNode} disabled={currentIndex <= 0}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center min-w-[120px]">
                    <span className="text-sm font-semibold truncate">{currentViewInfo?.label}</span>
                    <span className="text-xs text-muted-foreground">{currentIndex + 1} / {totalSlides}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={goToNextNode} disabled={currentIndex >= totalSlides - 1}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
        <ContentPreviewModal content={previewContent} onClose={() => setPreviewContent(null)} />
    </div>
  );
}
