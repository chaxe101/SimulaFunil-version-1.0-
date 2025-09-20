
'use client';

import React, { memo, useCallback, ChangeEvent, useMemo, FocusEvent } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { findBlockByType } from '@/lib/types.tsx';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Expand, Trash2, Video, AudioLines, FileText, DollarSign, Mail as MailIcon, MessageSquare, Crown, VideoOff, CalendarDays, Flag, Upload, Loader2, CheckSquare, ArrowRight } from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';

type Task = Node;
type ColumnId = 'A Fazer' | 'Fazendo' | 'Feito';

// Componente para as alças de conexão com a lógica aprimorada
const ConnectionHandles = ({ isPresentation }: { isPresentation: boolean }) => {
    if (isPresentation) {
        return null;
    }

    const baseStyle = "w-3 h-3 rounded-full absolute pointer-events-auto opacity-0 group-hover/node:opacity-100 group-data-[selected=true]/node:opacity-100 transition-opacity z-10";
    const sourceStyle = "bg-green-500";
    const targetStyle = "bg-blue-500";

    const handles = [
        // Top
        { type: 'source', position: Position.Top, id: 'top-source', style: { left: '40%' } },
        { type: 'target', position: Position.Top, id: 'top-target', style: { left: '60%' } },
        // Bottom
        { type: 'source', position: Position.Bottom, id: 'bottom-source', style: { left: '40%' } },
        { type: 'target', position: Position.Bottom, id: 'bottom-target', style: { left: '60%' } },
        // Right
        { type: 'source', position: Position.Right, id: 'right-source', style: { top: '40%' } },
        { type: 'target', position: Position.Right, id: 'right-target', style: { top: '60%' } },
        // Left
        { type: 'source', position: Position.Left, id: 'left-source', style: { top: '40%' } },
        { type: 'target', position: Position.Left, id: 'left-target', style: { top: '60%' } },
    ];

    return (
        <>
            {handles.map(handle => (
                <Handle
                    key={handle.id}
                    type={handle.type as 'source' | 'target'}
                    position={handle.position}
                    id={handle.id}
                    className={cn(baseStyle, handle.type === 'source' ? sourceStyle : targetStyle)}
                    style={handle.style}
                    isConnectable={true}
                />
            ))}
        </>
    );
};


const getPriorityPillClass = (priority?: string) => {
  switch (priority) {
    case 'alta':
      return 'bg-red-500/80 text-white';
    case 'media':
      return 'bg-yellow-500/80 text-white';
    case 'baixa':
      return 'bg-blue-500/80 text-white';
    default:
      return 'hidden';
  }
};

const MiniTaskCard = ({ task }: { task: Task }) => (
    <div className="p-2.5 bg-card/80 rounded-md border border-border/50 shadow-sm text-left space-y-2">
        <p className="font-semibold text-sm truncate">{task.data.label}</p>
        {task.data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.data.description}</p>
        )}
        <div className="flex items-center">
            {task.data.priority && (
                <Badge className={cn('capitalize text-xs px-1.5 py-0.5 border-0', getPriorityPillClass(task.data.priority))}>
                    <Flag className="w-3 h-3 mr-1"/> {task.data.priority}
                </Badge>
            )}
        </div>
    </div>
);


const KanbanBlock = ({ id, selected }: { id: string; selected: boolean }) => {
    const { nodes: allNodes, deleteNode, setCurrentView } = useEditorStore(state => ({
        nodes: state.nodes,
        deleteNode: state.deleteNode,
        setCurrentView: state.setCurrentView,
    }));

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        deleteNode(id);
    }, [deleteNode, id]);

    const tasks = useMemo(() => allNodes.filter(n => n.data.isTask), [allNodes]);

    const columns = useMemo(() => {
        const cols: { [key in ColumnId]: Task[] } = {
            'A Fazer': [],
            'Fazendo': [],
            'Feito': [],
        };
        tasks.forEach((node) => {
            const status = (node.data.status as ColumnId) || 'A Fazer';
            if (cols[status]) {
                cols[status].push(node);
            }
        });
        return cols;
    }, [tasks]);

    const columnDefs: { id: ColumnId, title: string, color: string }[] = [
        { id: 'A Fazer', title: 'A Fazer', color: 'border-blue-500' },
        { id: 'Fazendo', title: 'Fazendo', color: 'border-yellow-500' },
        { id: 'Feito', title: 'Feito', color: 'border-green-500' },
    ];

    return (
        <div className={cn(
            "w-full h-full bg-card rounded-lg p-3 flex flex-col gap-3 transition-all",
            selected && "ring-2 ring-primary"
        )}>
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg font-headline">Painel Kanban</h3>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentView('kanban')}>
                        Ver Kanban
                        <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                    {selected && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-10" onClick={handleDelete} >
                            <Trash2 className="h-4 h-4" />
                            <span className="sr-only">Deletar</span>
                        </Button>
                    )}
                </div>
            </div>
             <div className="flex w-full">
                {columnDefs.map(col => (
                    <div key={col.id} className="flex-1">
                        <div className={cn("pb-2 border-b-2", col.color)}>
                            <h3 className="font-semibold text-sm text-foreground">{col.title} <span className="text-xs text-muted-foreground">({columns[col.id].length})</span></h3>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-grow w-full gap-3 overflow-hidden">
                {columnDefs.map(col => (
                    <div key={col.id} className="flex-1 space-y-2">
                        {columns[col.id].slice(0, 3).map(task => (
                            <MiniTaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};


const CustomNodeComponent = ({ data, id, selected }: NodeProps<{ type: string; label?: string, url?: string, fileUrl?: string, fileName?: string, notesText?: string, description?: string, value?: string, subject?: string, message?: string, status?: 'A Fazer' | 'Fazendo' | 'Feito', priority?: 'baixa' | 'media' | 'alta', deadline?: string, isTask?: boolean, tags?: string[], userInitial?: string, isPresentation?: boolean }>) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const { setPreviewContent, deleteNode, updateNodeData } = useEditorStore(state => ({
    setPreviewContent: state.setPreviewContent,
    deleteNode: state.deleteNode,
    updateNodeData: state.updateNodeData,
  }));

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  }, [deleteNode, id]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const getPreviewType = () => {
        switch (data.type) {
            case 'website': return 'website';
            case 'image-upload': return 'imagem';
            case 'video-upload': return 'video';
            case 'audio-upload': return 'audio';
            case 'pdf-upload': return 'pdf';
            default: return null;
        }
    };

    const previewType = getPreviewType();
    if (!previewType) return;
    
    const src = data.url || data.fileUrl;
    if (src) {
        setPreviewContent({ type: previewType, src });
    }
  }, [data.type, data.url, data.fileUrl, setPreviewContent]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/bunny-upload', {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Falha no upload.');
        }

        updateNodeData(id, { fileUrl: result.url, fileName: result.fileName });
        toast({ title: 'Sucesso!', description: 'Arquivo enviado com sucesso.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message });
    } finally {
        setIsUploading(false);
    }
  };

  const handleNotesBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      const newText = e.currentTarget.value;
      if (data.notesText !== newText) {
          updateNodeData(id, { notesText: newText });
      }
  };


  const blockInfo = findBlockByType(data.type);

  if (!blockInfo) {
    return <div>Unknown block type</div>;
  }
  
  const isPresentationMode = data.isPresentation || false;
  
  if (data.type === 'kanban-panel') {
      return (
         <div className={cn(
            "group/node relative w-[850px] h-[450px] transition-all duration-300"
         )}
         data-selected={selected}
         >
            <ConnectionHandles isPresentation={isPresentationMode} />

            <NodeResizer 
                color="#F43F5E" 
                isVisible={selected && !isPresentationMode} 
                minWidth={600} 
                minHeight={400} 
            />
             <KanbanBlock id={id} selected={selected} />
        </div>
      )
  }

    if (data.isTask) {
        return (
             <div className={cn(
                "group/node relative w-56 p-0 rounded-lg shadow-lg transition-opacity duration-300 bg-card border border-border/50",
                selected && 'ring-2 ring-primary'
            )}
            data-selected={selected}
            >
                <ConnectionHandles isPresentation={isPresentationMode} />
                
                <NodeResizer 
                    color="#F43F5E" 
                    isVisible={selected && !isPresentationMode} 
                    minWidth={200} 
                    minHeight={144} 
                />
                {selected && !isPresentationMode && (
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-10" onClick={handleDelete} >
                        <Trash2 className="h-4 h-4" />
                        <span className="sr-only">Deletar</span>
                    </Button>
                )}
                <div className="p-3 border-b border-border flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm truncate">{data.label || 'Nova Tarefa'}</h3>
                </div>
                <div className="p-3 space-y-2 min-h-[70px]">
                     <div className="flex flex-wrap items-center gap-1">
                        {data.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs capitalize bg-blue-500/20 text-blue-300 border-blue-500/30">{tag}</Badge>
                        ))}
                        {data.priority === 'alta' && <Badge variant="destructive" className="capitalize">Urgente</Badge>}
                     </div>
                </div>
                <div className="absolute bottom-2 right-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">{data.userInitial || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        )
    }

  if (data.type === 'notes') {
    return (
      <div className={cn(
          "group/node relative w-[55ch] rounded-lg shadow-lg transition-opacity duration-300 flex flex-col",
          'bg-[#F39C12]/10 border border-[#F39C12]/20',
          selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      data-selected={selected}
      >
          <ConnectionHandles isPresentation={isPresentationMode} />
          
          {selected && !isPresentationMode && (
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} >
                  <Trash2 className="h-4 h-4" />
                  <span className="sr-only">Deletar</span>
              </Button>
          )}
          <textarea
              defaultValue={data.notesText}
              onBlur={handleNotesBlur}
              className="w-full h-full bg-transparent border-none focus:outline-none resize-none text-sm placeholder:text-yellow-400/50 text-yellow-100 min-h-[150px] flex-grow p-4"
              placeholder="Escreva uma nota..."
              rows={1}
          />
      </div>
    );
  }
  
  const hasUrlInput = blockInfo.hasLink;
  const hasFileInput = ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload'].includes(data.type);
  
  const hasUrlPreview = hasUrlInput && data.url;
  const hasFilePreview = hasFileInput && data.fileUrl;
  
  const hasContent = hasUrlPreview || hasFilePreview;
    
  const displayDescription = data.description || blockInfo.description;
  
  const additionalData = [
    { key: 'value', value: data.value, icon: <DollarSign className="w-3 h-3 text-muted-foreground" /> },
    { key: 'subject', value: data.subject, icon: <MailIcon className="w-3 h-3 text-muted-foreground" /> },
    { key: 'message', value: data.message, icon: <MessageSquare className="w-3 h-3 text-muted-foreground" /> },
  ].filter(item => item.value);

  const renderFilePreview = () => {
    let previewContent;
    switch (data.type) {
      case 'image-upload':
        previewContent = <img alt="File Preview" className="aspect-video w-full h-full object-cover rounded" src={data.fileUrl!} />;
        break;
      case 'video-upload':
        previewContent = <video src={data.fileUrl!} muted className="aspect-video w-full h-full object-cover rounded pointer-events-none" />;
        break;
      case 'audio-upload':
        previewContent = <div className="aspect-video w-full h-full rounded bg-muted flex items-center justify-center pointer-events-none"><AudioLines className="w-10 h-10 text-muted-foreground" /></div>;
        break;
      case 'pdf-upload':
        previewContent = <iframe src={data.fileUrl!} title="PDF Preview" className="w-full h-full border-0 rounded pointer-events-none" />;
        break;
      default:
        previewContent = <div className="aspect-video w-full h-full rounded bg-muted flex items-center justify-center pointer-events-none"><FileText className="w-10 h-10 text-muted-foreground" /></div>;
        break;
    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex-grow flex items-center justify-center pointer-events-none">{previewContent}</div>
        <p className="text-xs text-muted-foreground pt-2 truncate shrink-0">{data.fileName}</p>
      </div>
    );
  };
  
  let expandButtonWrapperClasses;
    if (isPresentationMode) {
        expandButtonWrapperClasses = "opacity-100 z-30";
    } else {
        expandButtonWrapperClasses = "opacity-0 group-hover/node:opacity-100 group-data-[selected=true]/node:opacity-100";
    }

  return (
    <div className={cn("group/node relative h-full w-full transition-all duration-300")}
    data-selected={selected}
    >
      <ConnectionHandles isPresentation={isPresentationMode} />
      
      <NodeResizer 
        color="#F43F5E" 
        isVisible={selected && !isPresentationMode} 
        minWidth={256} 
        minHeight={150} 
      />
      
      <div 
        className={cn(
          "transition-all duration-300 w-full h-full flex flex-col rounded-lg bg-card",
          selected && !isPresentationMode ? "ring-2 ring-primary" : ""
        )} 
      >
        <div className="flex flex-row items-center gap-3 space-y-0 p-3 relative react-flow__drag-handle cursor-move shrink-0 rounded-t-lg" style={{backgroundColor: `${blockInfo.color}1A`}}>
            <div style={{ color: blockInfo.color }}>
                {React.cloneElement(blockInfo.icon, { className: 'w-6 h-6' })}
            </div>
            <div className="text-base font-semibold truncate flex-grow">{data.label || blockInfo.label}</div>
            
             <div className="flex items-center gap-1 flex-shrink-0">
                {selected && !isPresentationMode && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-20 pointer-events-auto"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 h-4" />
                        <span className="sr-only">Deletar</span>
                    </Button>
                )}
            </div>
        </div>
        <div className="p-3 pt-2 space-y-2 flex-grow flex flex-col rounded-b-lg relative">
            {hasContent && (
                 <div className={cn("absolute top-2 right-2", expandButtonWrapperClasses)}>
                    <div className="relative z-30 pointer-events-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-black/50 text-white backdrop-blur-sm"
                            onClick={handleExpandClick}
                        >
                            <Expand className="h-4 h-4" />
                            <span className="sr-only">Expandir</span>
                        </Button>
                    </div>
                </div>
            )}
            
            {!hasContent && hasFileInput ? (
                <div className="flex-grow flex flex-col items-center justify-center space-y-3 text-center border-2 border-dashed border-border rounded-md p-4">
                    <input 
                        type="file" 
                        id={`upload-${id}`} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        disabled={isUploading}
                        accept={data.type === 'image-upload' ? 'image/*' : data.type === 'video-upload' ? 'video/*' : data.type === 'audio-upload' ? 'audio/*' : data.type === 'pdf-upload' ? 'application/pdf' : '*/*'}
                    />
                    <Label htmlFor={`upload-${id}`} className="w-full">
                        <Button asChild className="w-full cursor-pointer" disabled={isUploading}>
                            <div>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {isUploading ? 'Enviando...' : 'Fazer Upload'}
                            </div>
                        </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        {data.type === 'pdf-upload' ? 'PDFs são suportados.' :
                        data.type === 'image-upload' ? 'Imagens são suportadas.' :
                        data.type === 'video-upload' ? 'Vídeos são suportados.' :
                        'Todos os arquivos são suportados.'}
                    </p>
                </div>
            ) : !hasContent ? (
            <div className="text-xs text-muted-foreground flex-grow flex flex-col space-y-2">
                {data.description && (
                    <p className="line-clamp-4 flex-grow">{data.description}</p>
                )}
                {additionalData.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                    {additionalData.map(item => (
                    <div key={item.key} className="flex items-start gap-2">
                        {item.icon}
                        <span className="truncate flex-1">{item.key === 'value' ? `R$ ${item.value}` : item.value}</span>
                    </div>
                    ))}
                </div>
                )}
            </div>
            ) : hasContent ? (
                <div className="relative w-full h-full flex-grow pointer-events-none">
                    {hasUrlPreview && (
                        <iframe
                            src={data.url}
                            title={`Pré-visualização de ${data.url}`}
                            className="relative w-full h-full flex-grow border-0 rounded bg-muted"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    )}
                    
                    {hasFilePreview && renderFilePreview()}
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);
