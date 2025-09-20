
'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { BlockLibrary } from './block-library';
import { KanbanSidebar } from './kanban-sidebar';
import { NotesSidebar } from './notes-sidebar';
import { PropertiesPanel } from './properties-panel';

export const EditorSidebar = () => {
    const { currentView, selectedNode } = useEditorStore(state => ({
        currentView: state.currentView,
        selectedNode: state.selectedNode
    }));

    const renderSidebarContent = () => {
        switch (currentView) {
            case 'fluxo':
                return <BlockLibrary />;
            case 'kanban':
                return <KanbanSidebar />;
            case 'notes':
                return <NotesSidebar />;
            case 'hub':
            case 'calendar':
            case 'table':
            case 'timeline':
                return null;
            default:
                return null;
        }
    }
    
    const sidebarContent = renderSidebarContent();

    if (!sidebarContent) {
        return null;
    }

    return (
        <aside className="w-80 flex-col border-r border-[#232837] bg-[#0F1115] hidden md:flex">
            {sidebarContent}
        </aside>
    );
};
