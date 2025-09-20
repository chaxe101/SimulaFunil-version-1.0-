
import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  getNodesBounds,
  getViewportForBounds,
  addEdge,
  OnConnect,
} from 'reactflow';
import { useShallow } from 'zustand/react/shallow';
import { Funnel, FunnelAnalysis, UserPlan, findBlockByType, NotesContent as INotesContent } from '@/lib/types.tsx';
import { toast } from '@/hooks/use-toast';
import { Editor } from '@tiptap/core';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { updateFunnel } from '@/lib/supabase-service';

type PreviewContent = {
  type: string;
  src: string;
};

type HistoryEntry = { type: 'node'; nodes: Node[]; edges: Edge[] };
export type EditorView = 'hub' | 'fluxo' | 'calendar' | 'notes' | 'timeline' | 'kanban';

export type NotesContent = INotesContent;

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color: string;
  completed?: boolean;
};

type EditorState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  previewContent: PreviewContent | null;
  funnelId: string | null;
  userPlan: UserPlan;
  isPresentationMode: boolean; // Deprecated, but kept for safety to avoid breaking old components.
  presentationNodeId: string | null;
  presentation_order: EditorView[];
  analysis: FunnelAnalysis;
  currentView: EditorView;
  notes: NotesContent[];
  currentNoteIndex: number;
  calendarEvents: CalendarEvent[];
  eventsForCalendar: CalendarEvent[];
  editorInstance: Editor | null;
  isNotesAutoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
  
  history: HistoryEntry[];
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (node: Node) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  selectNode: (nodeId: string | null) => void;
  unselectNode: () => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  setPreviewContent: (content: PreviewContent | null) => void;
  
  undoLastAction: () => void;
  
  setFunnelId: (funnelId: string) => void;
  setUserPlan: (plan: UserPlan) => void;
  reset: () => void;

  setPresentationNodeId: (nodeId: string | null) => void;
  goToNextNode: () => void;
  goToPrevNode: () => void;
  setPresentationOrder: (order: EditorView[]) => void;

  setAnalysis: (analysis: FunnelAnalysis) => void;
  setCurrentView: (view: EditorView) => void;
  
  setInitialNotes: (notesFromFunnel: NotesContent[] | undefined) => void;
  saveCurrentNote: (title: string, content: string) => void;
  addNewNote: () => void;
  deleteCurrentNote: () => void;
  setCurrentNoteIndex: (index: number) => void;
  toggleNotesAutoSave: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  setEditorInstance: (editor: Editor | null) => void;
  
  exportToJson: (fileName: string) => void;
  exportToPdf: (fileName: string, view: EditorView) => void;
  
  saveFunnel: () => Promise<void>;
};

const initialNotesState = {
    notes: [{ id: `note_${Date.now()}`, title: 'Anotação Principal', content: '' }],
    currentNoteIndex: 0,
};

const getInitialState = (plan: UserPlan = 'free') => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    previewContent: null,
    funnelId: null,
    userPlan: plan,
    history: [],
    isPresentationMode: false,
    presentationNodeId: null,
    presentation_order: [],
    analysis: { leads: 0, buyers: 0 },
    currentView: 'hub' as EditorView,
    ...initialNotesState,
    calendarEvents: [],
    eventsForCalendar: [],
    editorInstance: null,
    isNotesAutoSaveEnabled: true,
    hasUnsavedChanges: false,
});


const computeEventsForCalendar = (nodes: Node[], calendarEvents: CalendarEvent[]): CalendarEvent[] => {
    const taskEvents = nodes
        .filter(node => node.data.isTask && node.data.deadline)
        .map(node => ({
            id: `task-${node.id}`,
            title: node.data.label || 'Tarefa sem título',
            start: node.data.deadline,
            allDay: true,
            color: '#9B59B6', // A purple color for tasks
            completed: node.data.status === 'Feito',
        }));
    return [...calendarEvents, ...taskEvents];
};

const generatePdfFromImage = (fileName: string, elementSelector: string) => {
    const elementToCapture = document.querySelector(elementSelector) as HTMLElement;
    if (!elementToCapture) {
        toast({
            variant: "destructive",
            title: "Erro ao exportar PDF",
            description: `Não foi possível encontrar o elemento (${elementSelector}) para exportar.`,
        });
        return;
    }

    toPng(elementToCapture, { 
        backgroundColor: '#0F1115',
        fetchRequestInit: {
            mode: 'cors',
            credentials: 'omit',
        },
    })
        .then((dataUrl) => {
            const pdf = new jsPDF({ orientation: 'landscape' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const newWidth = imgWidth * ratio;
                const newHeight = imgHeight * ratio;
                const x = (pdfWidth - newWidth) / 2;
                const y = (pdfHeight - newHeight) / 2;
                pdf.addImage(dataUrl, 'PNG', x, y, newWidth, newHeight);
                pdf.save(`${fileName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
            }
        })
        .catch((err) => {
            console.error("Failed to export element to PDF", err);
            toast({ variant: "destructive", title: "Erro ao exportar PDF", description: "Ocorreu um erro inesperado. Tente novamente." });
        });
};


const generateCanvasPdf = async (fileName: string, nodes: Node[]) => {
  const elementToCapture = document.querySelector('.react-flow__viewport') as HTMLElement;
  if (!elementToCapture) {
    toast({ variant: "destructive", title: "Erro de Exportação", description: "Não foi possível encontrar o Canvas." });
    return;
  }

  if (nodes.length === 0) {
    toast({ title: "Canvas vazio", description: "Adicione alguns blocos antes de exportar." });
    return;
  }
  
  try {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imageWidth = 1920;
    const imageHeight = 1080;
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    const dataUrl = await toPng(elementToCapture, {
      backgroundColor: '#0F1115',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
      fetchRequestInit: {
        mode: 'cors',
        credentials: 'omit',
      },
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

    if (nodes.length > 0) {
      pdf.addPage('a4', 'landscape');
      pdf.text('Detalhes dos Blocos do Canvas', 15, 15);
      
      (pdf as any).autoTable({
        head: [['Nome do Bloco', 'Tipo', 'Detalhes']],
        body: nodes.map(node => {
          const blockInfo = findBlockByType(node.data.type);
          const typeLabel = blockInfo?.label || node.data.type;
          
          let details = '';
          if (node.data.description) details += `Descrição: ${node.data.description}\n`;
          if (node.data.url) details += `URL: ${node.data.url}\n`;
          if (node.data.fileName) details += `Arquivo: ${node.data.fileName}\n`;
          
          return [
            node.data.label || 'Sem nome',
            typeLabel,
            details.trim() || 'Nenhum detalhe adicional.'
          ];
        }),
        startY: 20,
        theme: 'grid',
        styles: {
          fillColor: [21, 25, 34],
          textColor: [232, 236, 243],
          lineColor: [35, 40, 55],
          lineWidth: 0.1,
          valign: 'top',
        },
        headStyles: {
          fillColor: [35, 40, 55],
          fontStyle: 'bold',
        },
      });
    }

    pdf.save(`${fileName.replace(/\s+/g, '_').toLowerCase()}.pdf`);

  } catch (err) {
    console.error("Failed to export Canvas to PDF", err);
    toast({ variant: "destructive", title: "Erro ao exportar PDF", description: "Ocorreu um erro inesperado. Tente novamente." });
  }
};


const generateNotesPdf = (fileName: string, note: NotesContent) => {
    const pdf = new jsPDF();
    const margin = 15;
    let cursorY = 20;
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;

    pdf.setFontSize(22);
    pdf.text(note.title, margin, cursorY);
    cursorY += 15;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;

    pdf.setFontSize(12);
    
    tempDiv.childNodes.forEach(node => {
        if (node.nodeName === 'HR') {
            cursorY += 5;
            pdf.line(margin, cursorY, pdf.internal.pageSize.getWidth() - margin, cursorY);
            cursorY += 10;
        } else {
            const textContent = node.textContent || '';
            const splitText = pdf.splitTextToSize(textContent, maxWidth);
            
            if (cursorY + (splitText.length * 5) > pdf.internal.pageSize.getHeight() - margin) {
                pdf.addPage();
                cursorY = margin;
            }

            pdf.text(splitText, margin, cursorY);
            cursorY += splitText.length * 5 + 5;
        }
    });

    pdf.save(`${fileName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};

const wrapText = (text: string | null | undefined, maxWidth: number): string => {
    if (!text) return '';
    const words = text.split(' ');
    let line = '';
    let result = '';

    for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        if (testLine.length > maxWidth) {
            result += (result ? '\n' : '') + line;
            line = word;
        } else {
            line = testLine;
        }
    }
    result += (result ? '\n' : '') + line;
    return result;
};

const generateKanbanPdf = (fileName: string, nodes: Node[]) => {
    const pdf = new jsPDF({ orientation: 'landscape' });
    const columns: { [key: string]: Node[] } = {
        'A Fazer': [],
        'Fazendo': [],
        'Feito': [],
    };

    nodes.filter(n => n.data.isTask).forEach(node => {
        const status = node.data.status || 'A Fazer';
        if (columns[status]) {
            columns[status].push(node);
        }
    });

    const columnTitles = ['A Fazer', 'Fazendo', 'Feito'];
    const tableBody = [];
    const maxRows = Math.max(...Object.values(columns).map(c => c.length));

    for (let i = 0; i < maxRows; i++) {
        const row = columnTitles.map(title => {
            const task = columns[title][i];
            if (!task) return '';
            
            const { label, description, priority, deadline } = task.data;
            let content = `Título: ${label || 'N/A'}\n`;
            if (description) {
                const wrappedDescription = wrapText(description, 67);
                content += `Descrição: ${wrappedDescription}\n`;
            }
            if (priority) content += `Prioridade: ${priority}\n`;
            if (deadline) content += `Prazo: ${format(new Date(deadline), 'dd/MM/yyyy')}`;
            
            return content;
        });
        tableBody.push(row);
    }

    (pdf as any).autoTable({
        head: [columnTitles],
        body: tableBody,
        startY: 10,
        theme: 'grid',
        styles: {
            fillColor: [21, 25, 34],
            textColor: [232, 236, 243],
            lineColor: [35, 40, 55],
            lineWidth: 0.1,
            valign: 'top',
        },
        headStyles: {
            fillColor: [35, 40, 55],
            fontStyle: 'bold',
        }
    });

    pdf.save(`${fileName}.pdf`);
};

const useStore = create<EditorState>((set, get) => ({
  ...getInitialState(),

  onNodesChange: (changes: NodeChange[]) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    
    const selectionChange = changes.find(change => change.type === 'select');
    if (selectionChange && selectionChange.type === 'select') {
        if (selectionChange.selected) {
            const selected = newNodes.find(node => node.id === selectionChange.id);
            set({ selectedNode: selected || null });
        } else if (get().selectedNode?.id === selectionChange.id) {
             set({ selectedNode: null });
        }
    } else {
        const hasSelection = newNodes.some(n => n.selected);
        if (!hasSelection) {
            set({ selectedNode: null });
        }
    }
    
    set({ nodes: newNodes });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, id: `edge-${Date.now()}`, type: 'custom' }, get().edges),
    });
  },

  saveFunnel: async () => {
    const { funnelId, nodes, edges, presentation_order, analysis, notes, calendarEvents } = get();
    if (funnelId) {
        const dataToSave: Partial<Omit<Funnel, 'id' | 'user_id' | 'created_at'>> = {
            nodes,
            edges,
            presentation_order,
            analysis,
            notes,
            calendar_events: calendarEvents,
        };
        
        try {
            await updateFunnel(funnelId, dataToSave);
        } catch (err: any) {
            console.error("Save failed:", err);
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: `Não foi possível salvar suas alterações: ${err.message}` });
            throw err; 
        }
    }
  },
  
  addNode: (node: Node) => {
    const { nodes, userPlan } = get();
    
    const blockLimit = userPlan === 'free' ? 5 : Infinity;
    const mediaBlockCount = nodes.filter(n => ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload'].includes(n.data.type)).length;
    const isMediaBlock = ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload'].includes(node.data.type);
    
    if (userPlan === 'free') {
        if (nodes.length >= blockLimit) {
            toast({
                variant: 'destructive',
                title: 'Limite de Blocos Atingido',
                description: `Você atingiu o limite de ${blockLimit} blocos por projeto. Faça upgrade para adicionar mais.`,
            });
            return;
        }
        if (isMediaBlock && mediaBlockCount >= 3) {
            toast({
                variant: 'destructive',
                title: 'Limite de Mídia Atingido',
                description: `Você atingiu o limite de 3 uploads de mídia. Faça upgrade para adicionar mais.`,
            });
            return;
        }
    }
    
    set({
      nodes: [...get().nodes, node],
    });
  },

  setNodes: (nodes: Node[]) => {
    set(state => ({
        ...state,
        nodes: nodes,
        eventsForCalendar: computeEventsForCalendar(nodes, state.calendarEvents)
    }));
  },

  setEdges: (edges: Edge[]) => {
    set({ edges: edges });
  },
  
  updateNodeData: (nodeId: string, data: any) => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];
    
    const newNodes = get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...data };
        }
        return node;
      });

    set({
      nodes: newNodes,
      history: newHistory.slice(-50),
      eventsForCalendar: computeEventsForCalendar(newNodes, get().calendarEvents),
    });
    const selected = get().selectedNode;
    if (selected && selected.id === nodeId) {
        set({
            selectedNode: {...selected, data: {...selected.data, ...data}}
        });
    }
  },

  selectNode: (nodeId: string | null) => {
    if (nodeId === null) {
      set({
        nodes: get().nodes.map(n => ({...n, selected: false})),
        selectedNode: null
      });
      return;
    }
    const nodeToSelect = get().nodes.find(node => node.id === nodeId);
    if (nodeToSelect) {
      set({
        nodes: get().nodes.map(n => ({...n, selected: n.id === nodeId})),
        selectedNode: nodeToSelect
      });
    }
  },

  unselectNode: () => {
    get().selectNode(null);
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges, history } = get();
    const newHistory = [...history, { type: 'node', nodes, edges }];
    
    const remainingNodes = get().nodes.filter(n => n.id !== nodeId);
    const remainingEdges = get().edges.filter(e => e.source !== nodeId && e.target !== nodeId);

    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      history: newHistory.slice(-50),
      eventsForCalendar: computeEventsForCalendar(remainingNodes, get().calendarEvents),
    });
    
    if (get().selectedNode?.id === nodeId) {
      set({ selectedNode: null });
    }
  },

  deleteEdge: (edgeId: string) => {
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== edgeId),
    }));
  },

  setPreviewContent: (content) => {
    set({ previewContent: content });
  },
  
  undoLastAction: () => {
    const { history, isPresentationMode } = get();
    if (history.length === 0 || isPresentationMode) return;

    const lastAction = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    if (lastAction.type === 'node') {
      set({ nodes: lastAction.nodes, edges: lastAction.edges, history: newHistory });
    }
  },

  setFunnelId: (funnelId: string) => {
    const currentFunnelId = get().funnelId;
    if (currentFunnelId && currentFunnelId === funnelId) {
        return; 
    }
    set(getInitialState(get().userPlan));
    set({ funnelId });
  },
  setUserPlan: (plan: UserPlan) => {
    set({ userPlan: plan });
  },
  reset: () => {
    set(getInitialState());
  },

  setPresentationNodeId: (nodeId: string | null) => {
      set({ presentationNodeId: nodeId });
  },
  
  goToNextNode: () => {
    const { presentation_order, presentationNodeId } = get();
    const currentIndex = presentation_order.findIndex(id => id === presentationNodeId);
    if (currentIndex < presentation_order.length - 1) {
        set({ presentationNodeId: presentation_order[currentIndex + 1] });
    }
  },

  goToPrevNode: () => {
    const { presentation_order, presentationNodeId } = get();
    const currentIndex = presentation_order.findIndex(id => id === presentationNodeId);
    if (currentIndex > 0) {
        set({ presentationNodeId: presentation_order[currentIndex - 1] });
    }
  },

  setPresentationOrder: (order: EditorView[]) => {
      set({ presentation_order: order });
  },

  setAnalysis: (analysisData: FunnelAnalysis) => {
    set({ analysis: analysisData });
  },
  setCurrentView: (view: EditorView) => {
    get().unselectNode();
    set({ currentView: view });
  },
  setInitialNotes: (notesFromFunnel: NotesContent[] | undefined) => {
    if (notesFromFunnel && notesFromFunnel.length > 0) {
        set({ 
            notes: notesFromFunnel,
            currentNoteIndex: 0,
        });
    } else {
        set(initialNotesState);
    }
  },
  saveCurrentNote: async (title: string, content: string) => {
    const state = get();
    const currentNotes = state.notes;
    const currentIndex = state.currentNoteIndex;

    const updatedNotes = currentNotes.map((note, index) => 
      index === currentIndex ? { ...note, title, content } : note
    );

    set({ 
        notes: updatedNotes,
        hasUnsavedChanges: false 
    });

    try {
        await state.saveFunnel(); // saveFunnel will now save the entire notes array
        toast({ title: 'Anotação salva!' });
    } catch (error) {
        set({ hasUnsavedChanges: true });
    }
  },
  addNewNote: () => {
    toast({ title: "Funcionalidade em desenvolvimento", description: "A criação de múltiplas anotações será adicionada em breve." });
  },
  deleteCurrentNote: () => {
    toast({ title: "Funcionalidade em desenvolvimento", description: "A exclusão de anotações será adicionada em breve." });
  },
  setCurrentNoteIndex: (index: number) => {
    set({ currentNoteIndex: index });
  },
  toggleNotesAutoSave: () => {
      set(state => ({ isNotesAutoSaveEnabled: !state.isNotesAutoSaveEnabled }));
  },
  setHasUnsavedChanges: (hasChanges: boolean) => {
      set({ hasUnsavedChanges: hasChanges });
  },
  setCalendarEvents: (events: CalendarEvent[]) => {
    set({ 
        calendarEvents: events,
        eventsForCalendar: computeEventsForCalendar(get().nodes, events),
    });
  },
  addCalendarEvent: (event: CalendarEvent) => {
    const newEvents = [...get().calendarEvents, event];
    set({ 
        calendarEvents: newEvents,
        eventsForCalendar: computeEventsForCalendar(get().nodes, newEvents),
    });
    get().saveFunnel();
  },
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => {
    const newEvents = get().calendarEvents.map(event => 
        event.id === eventId ? { ...event, ...updates } : event
    );
    set({
      calendarEvents: newEvents,
      eventsForCalendar: computeEventsForCalendar(get().nodes, newEvents),
    });
    get().saveFunnel();
  },
  setEditorInstance: (editor: Editor | null) => {
    set({ editorInstance: editor });
  },
  exportToJson: (fileName: string) => {
    const { nodes, edges, presentation_order, analysis } = get();
    const data = {
        name: fileName,
        nodes,
        edges,
        presentation_order,
        analysis,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  exportToPdf: (fileName: string, view: EditorView) => {
    toast({ title: `Exportando ${view} para PDF...`, description: "Isso pode levar alguns segundos." });
    const { nodes, notes, currentNoteIndex } = get();

    switch(view) {
        case 'notes':
            const currentNote = notes[currentNoteIndex];
            if (currentNote) {
                generateNotesPdf(fileName, currentNote);
            }
            break;
        case 'kanban':
            generateKanbanPdf(fileName, nodes);
            break;
        case 'fluxo':
            generateCanvasPdf(fileName, nodes);
            break;
        case 'calendar':
             generatePdfFromImage(fileName, '#calendar-export-area .fc-view-harness');
             break;
        case 'timeline':
             generatePdfFromImage(fileName, '#timeline-export-area');
             break;
        default:
            toast({
                variant: "destructive",
                title: "Exportação não disponível",
                description: "A exportação de PDF não está disponível para esta visualização.",
            });
            return;
    }
  }
}));

export const useEditorStore = useStore;

export const useShallowEditorStore = <U,>(
  selector: (state: EditorState) => U
) => {
    return useEditorStore(useShallow(selector));
};
