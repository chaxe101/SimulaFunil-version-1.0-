
import React from 'react';
import { Node, Edge } from 'reactflow';
import {
  FileText,
  ImageIcon, VideoIcon, AudioLines, StickyNote,
  Globe,
  KanbanSquare,
} from 'lucide-react';
import { EditorView } from '@/stores/editor-store';

export type UserPlan = 'free' | 'semanal' | 'mensal';

export interface UserData {
  name: string;
  email: string;
  plan: UserPlan;
}

export type CanvasNodeData = {
  type: string;
  label?: string;
  description?: string;
  // Task specific properties
  isTask?: boolean;
  status?: 'A Fazer' | 'Fazendo' | 'Feito';
  priority?: 'baixa' | 'media' | 'alta';
  deadline?: string;
  startDate?: string;
  endDate?: string;
  // Web specific
  url?: string;
  // Note specific
  notesText?: string;
  [key: string]: any;
};

export type CanvasNode = Node<CanvasNodeData>;

export type FunnelStatus = "all" | "active" | "draft";
export type FunnelAnalysis = {
  leads: number;
  buyers: number;
};
export type NotesContent = {
  id: string;
  title: string;
  content: string;
};
export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color: string;
  completed?: boolean;
};

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  notes: NotesContent[];
  calendar_events: CalendarEvent[];
  status: FunnelStatus;
  presentation_order: EditorView[];
  analysis: FunnelAnalysis;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  file_name: string;
  public_url: string;
  created_at: string;
}


// hasDescription: Adiciona um campo de texto 'description' no painel de propriedades.
// hasLink: Adiciona um campo de URL 'url' no painel de propriedades.
export const blockTypes = [
  // Essenciais
  { type: 'kanban-panel', label: 'Painel Kanban', icon: <KanbanSquare />, color: '#4C8FFF', category: 'Essenciais' },
  { type: 'notes', label: 'Nota Rápida', icon: <StickyNote />, color: '#F39C12', category: 'Essenciais' },
  { type: 'website', label: 'Web', icon: <Globe />, color: '#E74C3C', category: 'Essenciais', hasLink: true, hasDescription: true },
  
  // Mídia
  { type: 'image-upload', label: 'Imagem', icon: <ImageIcon />, color: '#2ECC71', category: 'Mídia', hasDescription: true },
  { type: 'video-upload', label: 'Vídeo', icon: <VideoIcon />, color: '#FF5678', category: 'Mídia', hasDescription: true },
  { type: 'audio-upload', label: 'Áudio', icon: <AudioLines />, color: '#3498DB', category: 'Mídia', hasDescription: true },
  { type: 'pdf-upload', label: 'PDF', icon: <FileText />, color: '#9B59B6', category: 'Mídia', hasDescription: true },
];

export const findBlockByType = (type: string) => {
    return blockTypes.find(b => b.type === type);
}

export type BlockType = typeof blockTypes[number];

export const proPlanFeatures = {
    unlimitedProjects: true,
    unlimitedBlocks: true,
    advancedKanban: true,
    fullCalendarTimeline: true,
    professionalPresentation: true,
    pdfExport: true,
    prioritySupport: true,
};

export const freePlanFeatures = {
    ...Object.keys(proPlanFeatures).reduce((acc, key) => {
        acc[key as keyof typeof proPlanFeatures] = false;
        return acc;
    }, {} as typeof proPlanFeatures),
    projects: 1,
    blocksPerProject: 5,
    limitedKanban: true,
    basicCalendar: true,
    jsonExport: true,
    presentationWithWatermark: true,
};
