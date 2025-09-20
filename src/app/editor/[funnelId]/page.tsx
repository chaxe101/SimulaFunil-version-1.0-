
'use client';

import { FunnelEditor } from '@/components/funnel-editor/editor';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useEditorStore, EditorView } from '@/stores/editor-store';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { getFunnelAndUserData } from '@/lib/supabase-service';
import { Header } from '@/components/funnel-editor/header';
import { EditorSidebar } from '@/components/funnel-editor/sidebar';
import { PropertiesPanel } from '@/components/funnel-editor/properties-panel';
import { ReactFlowProvider } from 'reactflow';
import { CalendarView } from '@/components/views/calendar-view';
import { NotesView } from '@/components/views/notes-view';
import { TimelineView } from '@/components/views/timeline-view';
import { KanbanView } from '@/components/views/kanban-view';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContentPreviewModal } from '@/components/funnel-editor/content-preview-modal';
import { HubView } from '@/components/views/hub-view';
import { FloatingToolbar } from '@/components/funnel-editor/floating-toolbar';


export default function EditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const funnelId = Array.isArray(params.funnelId) ? params.funnelId[0] : params.funnelId;
  const router = useRouter();

  const [projectName, setProjectName] = useState('Carregando...');
  const [user, setUser] = useState<User | null>(null);

  const {
    setFunnelId,
    setNodes,
    setEdges,
    selectedNode,
    currentView,
    setPresentationOrder,
    setInitialNotes,
    setCalendarEvents,
    previewContent,
    setPreviewContent,
    setCurrentView,
    setUserPlan,
  } = useEditorStore(state => ({
    setFunnelId: state.setFunnelId,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    selectedNode: state.selectedNode,
    currentView: state.currentView,
    setPresentationOrder: state.setPresentationOrder,
    setInitialNotes: state.setInitialNotes,
    setCalendarEvents: state.setCalendarEvents,
    previewContent: state.previewContent,
    setPreviewContent: state.setPreviewContent,
    setCurrentView: state.setCurrentView,
    setUserPlan: state.setUserPlan,
  }));

  useEffect(() => {
    const fetchUserAndProject = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFunnelId(funnelId);

        try {
          const { funnelData, userData } = await getFunnelAndUserData(funnelId, session.user.id);
          if (funnelData) {
            setProjectName(funnelData.name);
            setNodes(funnelData.nodes || []);
            setEdges(funnelData.edges || []);
            setPresentationOrder(funnelData.presentation_order || []);
            setInitialNotes(funnelData.notes);
            setCalendarEvents(funnelData.calendar_events || []);
            setUserPlan(userData?.plan || 'free');
            
            // Set view based on URL param or default to hub
            const viewFromUrl = searchParams.get('view') as EditorView;
            setCurrentView(viewFromUrl || 'hub');

          } else {
            throw new Error('Projeto não encontrado.');
          }
        } catch (error) {
          console.error(error);
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    };
    fetchUserAndProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);


  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0F1115]">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF5678]" />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
        case 'hub':
            return <HubView />;
        case 'kanban':
            return <KanbanView />;
        case 'calendar':
            return (
                 <ScrollArea className="h-full">
                    <div className="flex flex-col h-[150vh]">
                        <div className="min-h-[80vh]">
                            <CalendarView />
                        </div>
                        <div className="min-h-[70vh]">
                             <TimelineView />
                        </div>
                    </div>
                </ScrollArea>
            );
        case 'notes':
            return <NotesView />;
        case 'timeline':
            return <TimelineView />;
        case 'fluxo':
        default:
            return (
                <ReactFlowProvider>
                    <FunnelEditor funnelId={funnelId} />
                </ReactFlowProvider>
            );
    }
  };
  
  const isCanvasView = currentView === 'fluxo';

  return (
    <div className="flex h-screen w-full flex-col bg-[#0F1115] text-[#E8ECF3]">
      <Header projectName={projectName} />
      <div className="flex flex-1 overflow-hidden">
        {isCanvasView ? <FloatingToolbar /> : <EditorSidebar />}
        <main className="flex-1 overflow-auto relative h-full">
           {renderCurrentView()}
        </main>
        {selectedNode && currentView === 'fluxo' && <PropertiesPanel />}
      </div>
      <ContentPreviewModal content={previewContent} onClose={() => setPreviewContent(null)} />
    </div>
  );
}
