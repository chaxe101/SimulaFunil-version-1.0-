'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Save, Presentation, LayoutGrid, Calendar, PenSquare, KanbanSquare, FileDown, Settings2, Home, Loader2 } from "lucide-react";
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

const ViewSwitcher = ({ isHovered }: { isHovered: boolean }) => {
    const { currentView, setCurrentView } = useEditorStore(state => ({
        currentView: state.currentView,
        setCurrentView: state.setCurrentView,
    }));

    return (
        <>
            {/* Logo + Dashboard Button */}
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className={cn(
                            "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                            isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                        )}
                    >
                        <Link href="/dashboard">
                            <Logo className={cn('h-4 w-4 text-[#FF5678] transition-all duration-300', isHovered && 'mr-2')} />
                            <span className={cn(
                                "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                            )}>
                                Dashboard
                            </span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="group-hover:hidden">
                    <p>Voltar para Dashboard</p>
                </TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-2"></div>

            {views.map(view => (
                <Tooltip key={view.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCurrentView(view.id)}
                            className={cn(
                                "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                                currentView === view.id && "bg-[#232837] text-[#E8ECF3]",
                                isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                            )}
                        >
                            {React.cloneElement(view.icon as React.ReactElement, { 
                                className: cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2') 
                            })}
                            <span className={cn(
                                "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                            )}>
                                {view.label}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="group-hover:hidden">
                        <p>{view.label}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </>
    );
};

export const Header = ({ projectName }: HeaderProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isReorderModalOpen, setReorderModalOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isStartingPresentation, setIsStartingPresentation] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
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

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 200);
    };

    React.useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <header 
                className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-auto group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex items-center gap-1 rounded-lg bg-card/80 p-1 border border-border backdrop-blur-sm shadow-lg">
                    <TooltipProvider>
                        <ViewSwitcher isHovered={isHovered} />
                        
                        <div className="w-px h-6 bg-border mx-2"></div>
                        
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                                        isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                                    )}
                                    onClick={handleExportJson}
                                >
                                    <FileDown className={cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2')}/>
                                    <span className={cn(
                                        "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        JSON
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="group-hover:hidden">
                                <p>Exportar para JSON</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                                        isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                                    )}
                                    onClick={handleExportPdf}
                                >
                                    <FileDown className={cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2')}/>
                                    <span className={cn(
                                        "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        PDF
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="group-hover:hidden">
                                <p>Exportar PDF da visão atual</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <div className="w-px h-6 bg-border mx-2"></div>
                        
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                                        isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                                    )}
                                    onClick={() => setReorderModalOpen(true)}
                                >
                                    <Settings2 className={cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2')}/>
                                    <span className={cn(
                                        "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        Montar Apresentação
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="group-hover:hidden">
                                <p>Montar Apresentação</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "text-[#A7B0C0] hover:bg-[#232837] hover:text-[#E8ECF3] h-9 transition-all duration-300",
                                        isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                                    )}
                                    onClick={handleStartPresentation} 
                                    disabled={isStartingPresentation}
                                >
                                    {isStartingPresentation ? (
                                        <Loader2 className={cn('h-4 w-4 animate-spin transition-all duration-300', isHovered && 'mr-2')}/>
                                    ) : (
                                        <Presentation className={cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2')}/>
                                    )}
                                    <span className={cn(
                                        "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        Apresentar
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="group-hover:hidden">
                                <p>Apresentar</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="sm" 
                                    className={cn(
                                        "bg-[#FF5678] text-[#0F1115] hover:bg-pink-500 h-9 transition-all duration-300",
                                        isHovered ? "w-auto px-3" : "w-9 p-0 justify-center"
                                    )}
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className={cn('h-4 w-4 animate-spin transition-all duration-300', isHovered && 'mr-2')}/>
                                    ) : (
                                        <Save className={cn('h-4 w-4 transition-all duration-300', isHovered && 'mr-2')} />
                                    )}
                                    <span className={cn(
                                        "transition-all duration-300 delay-100 overflow-hidden whitespace-nowrap",
                                        isHovered ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}>
                                        Salvar
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="group-hover:hidden">
                                <p>Salvar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </header>
            <ReorderModal isOpen={isReorderModalOpen} onOpenChange={setReorderModalOpen} />
        </>
    );
};
