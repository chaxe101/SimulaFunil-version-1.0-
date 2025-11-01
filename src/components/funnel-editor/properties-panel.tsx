'use client';

import React, { ChangeEvent } from 'react';
import { useEditorStore } from '@/stores/editor-store';
import { findBlockByType } from '@/lib/types.tsx';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Calendar as CalendarIcon, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

const FileUploadSection = ({ node, onDataChange }: { node: any, onDataChange: (key: string, value: any) => void }) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = React.useState(false);
    const { updateNodeData, userPlan } = useEditorStore(state => ({
        updateNodeData: state.updateNodeData,
        userPlan: state.userPlan,
    }));

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const limits = {
            free: { maxFileSize: 5 * 1024 * 1024, label: "5 MB" },
            mensal: { maxFileSize: 100 * 1024 * 1024, label: "100 MB" },
        };
        const currentPlanKey = userPlan === 'mensal' ? 'mensal' : 'free';
        const planLimits = limits[currentPlanKey];

        if (file.size > planLimits.maxFileSize) {
            toast({
                variant: 'destructive',
                title: 'Arquivo muito grande',
                description: `O arquivo excede o limite de ${planLimits.label} para o seu plano.`
            });
            return;
        }

        setIsUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Usuário não autenticado.");

            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/bunny-upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Falha no upload.');
            }

            updateNodeData(node.id, { fileUrl: result.url, fileName: result.fileName });
            toast({ title: 'Sucesso!', description: 'Arquivo atualizado com sucesso.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro de Upload', description: error.message });
        } finally {
            setIsUploading(false);
        }
    };
    
    const getAcceptType = (type: string) => {
        switch(type) {
            case 'image-upload': return 'image/*';
            case 'video-upload': return 'video/*';
            case 'audio-upload': return 'audio/*';
            case 'pdf-upload': return 'application/pdf';
            default: return '*/*';
        }
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500 font-normal">Arquivo</Label>
            <div className='p-2 border border-[#2a2f3f] rounded-md bg-[#0f1115] space-y-2'>
                <div className="w-full overflow-hidden">
                    <p className="text-[10px] text-gray-400 break-words line-clamp-2">
                        {node.data.fileName || "Nenhum arquivo enviado."}
                    </p>
                </div>
                <input 
                    type="file" 
                    id={`upload-prop-${node.id}`} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    accept={getAcceptType(node.data.type)}
                />
                <Label htmlFor={`upload-prop-${node.id}`} className="w-full">
                    <Button asChild variant="outline" size="sm" className="w-full cursor-pointer h-7 text-[10px]" disabled={isUploading}>
                        <div>
                            {isUploading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Upload className="mr-1.5 h-3 w-3" />}
                            {isUploading ? 'Enviando...' : 'Trocar Arquivo'}
                        </div>
                    </Button>
                </Label>
            </div>
        </div>
    );
}


export function PropertiesPanel() {
  const { selectedNode, updateNodeData, unselectNode, currentView } = useEditorStore();

  if (!selectedNode || (currentView !== 'fluxo' && currentView !== 'kanban')) {
    return null;
  }

  const blockInfo = findBlockByType(selectedNode.data.type);

  if (!blockInfo) {
    return (
      <div className="fixed top-20 right-4 w-64 bg-[#1a1d29] border border-[#2a2f3f] rounded-2xl shadow-2xl p-3 z-50">
        <h3 className="text-xs font-semibold text-destructive">Bloco Inválido</h3>
        <p className="text-[10px] text-gray-500">O tipo de bloco selecionado não é reconhecido.</p>
      </div>
    );
  }

  const handleDataChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const handleDateChange = (key: 'startDate' | 'endDate' | 'deadline', date: Date | undefined) => {
    if (date) {
      handleDataChange(key, date.toISOString());
    } else {
      handleDataChange(key, undefined);
    }
  };

  const renderTaskFields = () => (
     <>
        <div className="space-y-1.5">
          <Label htmlFor="node-description" className="text-[10px] text-gray-500 font-normal">Descrição</Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleDataChange('description', e.target.value)}
            placeholder="Adicione uma descrição detalhada..."
            rows={3}
            className="min-h-[60px] text-[10px] resize-none bg-[#0f1115] border-[#2a2f3f]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 font-normal">Status</Label>
          <Select
            value={selectedNode.data.status || 'A Fazer'}
            onValueChange={(value) => handleDataChange('status', value)}
          >
            <SelectTrigger className="h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A Fazer">A Fazer</SelectItem>
              <SelectItem value="Fazendo">Fazendo</SelectItem>
              <SelectItem value="Feito">Feito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 font-normal">Prioridade</Label>
          <Select
            value={selectedNode.data.priority || 'baixa'}
            onValueChange={(value) => handleDataChange('priority', value)}
          >
            <SelectTrigger className="h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]">
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 font-normal">Prazo Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]",
                  !selectedNode.data.deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
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
        <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 font-normal">Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]",
                  !selectedNode.data.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
                {selectedNode.data.startDate ? format(new Date(selectedNode.data.startDate), "PPP") : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedNode.data.startDate ? new Date(selectedNode.data.startDate) : undefined}
                onSelect={(date) => handleDateChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
         <div className="space-y-1.5">
          <Label className="text-[10px] text-gray-500 font-normal">Data de Fim</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]",
                  !selectedNode.data.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
                {selectedNode.data.endDate ? format(new Date(selectedNode.data.endDate), "PPP") : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedNode.data.endDate ? new Date(selectedNode.data.endDate) : undefined}
                onSelect={(date) => handleDateChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </>
  );

  const renderDefaultFields = () => {
    const fileUploadBlockTypes = ['image-upload', 'video-upload', 'audio-upload', 'pdf-upload'];
    
    return (
      <>
        {blockInfo.hasDescription && (
           <div className="space-y-1.5">
            <Label htmlFor="node-description" className="text-[10px] text-gray-500 font-normal">Descrição</Label>
            <Textarea
              id="node-description"
              value={selectedNode.data.description || ''}
              onChange={(e) => handleDataChange('description', e.target.value)}
              placeholder="Adicione uma descrição detalhada..."
              rows={3}
              className="min-h-[60px] text-[10px] resize-none bg-[#0f1115] border-[#2a2f3f]"
            />
          </div>
        )}

        {blockInfo.hasLink && (
            <div className="space-y-1.5">
              <Label htmlFor="node-url" className="text-[10px] text-gray-500 font-normal">URL</Label>
              <Input
                id="node-url"
                type="url"
                value={selectedNode.data.url || ''}
                onChange={(e) => handleDataChange('url', e.target.value)}
                placeholder="https://exemplo.com"
                className="h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f] truncate"
              />
            </div>
        )}
        
        {fileUploadBlockTypes.includes(selectedNode.data.type) && (
            <FileUploadSection node={selectedNode} onDataChange={handleDataChange} />
        )}
      </>
    )
  }

  return (
    <div className="fixed top-20 right-4 w-64 bg-[#1a1d29] border border-[#2a2f3f] rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2f3f]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: blockInfo.color }}>
            {React.cloneElement(blockInfo.icon, { className: 'w-3 h-3 text-white' })}
          </div>
          <h3 className="text-xs font-medium text-white">Propriedades</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-[#2a2f3f]" onClick={unselectNode}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="node-label" className="text-[10px] text-gray-500 font-normal">Rótulo do Bloco</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label || ''}
              onChange={(e) => handleDataChange('label', e.target.value)}
              placeholder={blockInfo.label}
              className="h-7 text-[10px] bg-[#0f1115] border-[#2a2f3f]"
            />
          </div>

          {selectedNode.data.isTask ? renderTaskFields() : renderDefaultFields()}

        </div>
      </ScrollArea>
    </div>
  );
}
