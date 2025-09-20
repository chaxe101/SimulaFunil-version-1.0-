
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
        <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className='p-2 border rounded-md bg-muted/30 space-y-2'>
                <p className="text-sm text-muted-foreground truncate">
                    {node.data.fileName || "Nenhum arquivo enviado."}
                </p>
                <input 
                    type="file" 
                    id={`upload-prop-${node.id}`} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    accept={getAcceptType(node.data.type)}
                />
                <Label htmlFor={`upload-prop-${node.id}`} className="w-full">
                    <Button asChild variant="outline" size="sm" className="w-full cursor-pointer" disabled={isUploading}>
                        <div>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
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
      <aside className="w-80 border-l border-[#232837] bg-[#151922] p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-destructive">Bloco Inválido</h3>
        <p className="text-sm text-muted-foreground">O tipo de bloco selecionado não é reconhecido.</p>
      </aside>
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
        <div className="space-y-2">
          <Label htmlFor="node-description">Descrição</Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleDataChange('description', e.target.value)}
            placeholder="Adicione uma descrição detalhada..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={selectedNode.data.status || 'A Fazer'}
            onValueChange={(value) => handleDataChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A Fazer">A Fazer</SelectItem>
              <SelectItem value="Fazendo">Fazendo</SelectItem>
              <SelectItem value="Feito">Feito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select
            value={selectedNode.data.priority || 'baixa'}
            onValueChange={(value) => handleDataChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-2">
          <Label>Prazo Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedNode.data.deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedNode.data.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
         <div className="space-y-2">
          <Label>Data de Fim</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedNode.data.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
           <div className="space-y-2">
            <Label htmlFor="node-description">Descrição</Label>
            <Textarea
              id="node-description"
              value={selectedNode.data.description || ''}
              onChange={(e) => handleDataChange('description', e.target.value)}
              placeholder="Adicione uma descrição detalhada..."
              rows={3}
            />
          </div>
        )}

        {blockInfo.hasLink && (
            <div className="space-y-2">
              <Label htmlFor="node-url">URL</Label>
              <Input
                id="node-url"
                type="url"
                value={selectedNode.data.url || ''}
                onChange={(e) => handleDataChange('url', e.target.value)}
                placeholder="https://exemplo.com"
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
    <aside className="w-80 border-l border-[#232837] bg-[#151922] flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[#232837] h-14">
        <div className="flex items-center gap-2">
          <div style={{ color: blockInfo.color }}>
            {React.cloneElement(blockInfo.icon, { className: 'w-5 h-5' })}
          </div>
          <h3 className="text-base font-semibold">Propriedades</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={unselectNode}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="node-label">Rótulo do Bloco</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label || ''}
              onChange={(e) => handleDataChange('label', e.target.value)}
              placeholder={blockInfo.label}
            />
          </div>

          {selectedNode.data.isTask ? renderTaskFields() : renderDefaultFields()}

        </div>
      </ScrollArea>
    </aside>
  );
}
