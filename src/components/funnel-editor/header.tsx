
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ChevronRight, Save, Presentation, LayoutGrid, Calendar, PenSquare, KanbanSquare, FileDown, Settings2, Home, Loader2 } from "lucide-react";
import { useEditorStore, EditorView } from "@/stores/editor-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ReorderModal } from './reorder-modal';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    projectName: string;
}

const views: { id: EditorView; label: string; icon: React.ReactNode }[] = [
    { id: 'hub', label: 'Hub', icon: <Home /> },
    { id: 'fluxo', label: 'Canvas', icon: <LayoutGrid /> },
    { id: 'kanban', label: 'Kanban', icon: <KanbanSquare /> },
    { id: 'calendar', label: 'Calendário', icon: <Calendar /> },
    { id: 'notes', label: 'Anotações', icon: <PenSquare /> },
];

const ViewSwitcher = () => {
    const { currentView, setCurrentView } = useEditorStore(state => ({
        currentView: state.currentView,
        setCurrentView: state.setCurrentView,
    }));

    return (
        <div className="flex items-center gap-1 rounded-lg bg-[#151922] p-1">
            {views.map(view => (
                <Button
                    key={view.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentView(view.id)}
                    className={cn(
                        "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3]",
                        currentView === view.id && "bg-[#232837] text-[#E8ECF3]"
                    )}
                >
                    {React.cloneElement(view.icon as React.ReactElement, { className: 'h-4 w-4 mr-2' })}
                    {view.label}
                </Button>
            ))}
        </div>
    );
};

export const Header = ({ projectName }: HeaderProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isReorderModalOpen, setReorderModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isStartingPresentation, setIsStartingPresentation] = React.useState(false);
    const { 
        exportToJson,
        exportToPdf,
        currentView,
        funnelId,
        saveFunnel,
    } = useEditorStore(state => ({
      exportToJson: state.exportToJson,
      exportToPdf: state.exportToPdf,
      currentView: state.currentView,
      funnelId: state.funnelId,
      saveFunnel: state.saveFunnel,
    }));

    const handleExportPdf = () => {
        exportToPdf(`${projectName}-${currentView}`, currentView);
    }
    
    const handleExportJson = () => {
        exportToJson(projectName);
        toast({ title: "JSON exportado com sucesso!" });
    }

    const handleStartPresentation = async () => {
        if (!funnelId) {
            toast({ variant: "destructive", title: "Erro", description: "ID do projeto não encontrado." });
            return;
        }
        
        setIsStartingPresentation(true);
        try {
            await saveFunnel();
            localStorage.setItem(`funnel-last-view-${funnelId}`, currentView);
            router.push(`/presentation/${funnelId}`);
        } catch (error) {
            console.error("Failed to save before presentation:", error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as alterações antes de apresentar." });
        } finally {
            setIsStartingPresentation(false);
        }
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveFunnel();
            toast({ title: "Salvo com sucesso!", description: "Suas alterações foram salvas no banco de dados." });
        } catch (error) {
             // Error toast is handled within saveFunnel now
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#232837] px-4 flex-col md:flex-row gap-4 md:gap-0 py-2 md:py-0">
                <div className="flex items-center gap-2 text-sm self-start md:self-center">
                    <Link href="/dashboard">
                        <Logo className="h-5 w-5 text-[#FF5678]" />
                    </Link>
                    <ChevronRight className="h-4 w-4 text-[#A7B0C0]" />
                    <span className="font-semibold text-[#E8ECF3] truncate max-w-xs">{projectName}</span>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                    <ViewSwitcher />
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3]" onClick={handleExportJson}>
                                    <FileDown className="h-4 w-4 mr-1"/>
                                    JSON
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Exportar para JSON</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3]" onClick={handleExportPdf}>
                                    <FileDown className="h-4 w-4 mr-1"/>
                                    PDF
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Exportar PDF da visão atual</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button variant="ghost" size="sm" className="text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3]" onClick={() => setReorderModalOpen(true)}>
                        <Settings2 className="h-4 w-4 mr-1"/>
                        Montar Apresentação
                    </Button>

                    <Button variant="ghost" size="sm" className="text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3]" onClick={handleStartPresentation} disabled={isStartingPresentation}>
                        {isStartingPresentation ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Presentation className="h-4 w-4 mr-1"/>}
                        Apresentar
                    </Button>
                    <Button size="sm" className="bg-[#FF5678] text-[#0F1115] hover:bg-pink-500" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <Save className="h-4 w-4 mr-1" />}
                        Salvar
                    </Button>
                </div>
            </header>
            <ReorderModal isOpen={isReorderModalOpen} onOpenChange={setReorderModalOpen} />
        </>
    );
};
