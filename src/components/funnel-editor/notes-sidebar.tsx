'use client';

import React from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Code, CheckSquare,
  Pilcrow, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Highlighter
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { useEditorStore } from '@/stores/editor-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  label,
  disabled = false
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={cn("w-full justify-start", isActive && "bg-accent text-accent-foreground")}
    aria-label={label}
    disabled={disabled}
  >
    {children}
  </Button>
);

export const NotesSidebar = () => {
  const { editorInstance: editor } = useEditorStore();
  const [_, setForceRender] = React.useState(0);
  
  React.useEffect(() => {
    if (editor) {
      const updateHandler = () => setForceRender(val => val + 1);
      editor.on('transaction', updateHandler);
      editor.on('focus', updateHandler);
      editor.on('blur', updateHandler);
      return () => {
        editor.off('transaction', updateHandler);
        editor.off('focus', updateHandler);
        editor.off('blur', updateHandler);
      };
    }
  }, [editor]);
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = e.target.value;
    if (size && editor) {
      editor.chain().focus().setFontSize(`${size}px`).run();
    } else if (editor) {
      editor.chain().focus().unsetFontSize().run();
    }
  };

  const currentFontSize = editor?.getAttributes('textStyle').fontSize?.replace('px', '') || '';


  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Estilo do Texto</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={!!editor?.isActive('bold')} label="Negrito" disabled={!editor}><Bold className="mr-2 h-4 w-4" /> Negrito</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={!!editor?.isActive('italic')} label="Itálico" disabled={!editor}><Italic className="mr-2 h-4 w-4" /> Itálico</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={!!editor?.isActive('underline')} label="Sublinhado" disabled={!editor}><Underline className="mr-2 h-4 w-4" /> Sublinhado</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} isActive={!!editor?.isActive('strike')} label="Tachado" disabled={!editor}><Strikethrough className="mr-2 h-4 w-4" /> Tachado</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} isActive={!!editor?.isActive('code')} label="Código" disabled={!editor}><Code className="mr-2 h-4 w-4" /> Código</ToolbarButton>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Estilo</h3>
          <div className="space-y-4 p-2">
              <div className='flex items-center gap-2'>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="text-color" className='flex-grow text-sm'>Cor do Texto</Label>
                  <Input
                      id="text-color"
                      type="color"
                      className="w-10 h-8 p-1 bg-card border-border"
                      value={editor?.getAttributes('textStyle').color || '#E8ECF3'}
                      onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                      disabled={!editor}
                  />
              </div>
              <ToolbarButton onClick={() => editor?.chain().focus().toggleHighlight({ color: '#facc15' }).run()} isActive={!!editor?.isActive('highlight')} label="Marca-Texto" disabled={!editor}><Highlighter className="mr-2 h-4 w-4" /> Marca-Texto</ToolbarButton>
          </div>
        </div>
        <Separator />
         <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Tamanho da Fonte</h3>
           <div className="p-2">
            <Input
              type="number"
              min="1"
              max="70"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              disabled={!editor}
              className="w-full"
              placeholder="Padrão (18px)"
            />
           </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Alinhamento</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} isActive={!!editor?.isActive({ textAlign: 'left' })} label="Alinhar à Esquerda" disabled={!editor}><AlignLeft className="mr-2 h-4 w-4" /> Esquerda</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} isActive={!!editor?.isActive({ textAlign: 'center' })} label="Centralizar" disabled={!editor}><AlignCenter className="mr-2 h-4 w-4" /> Centro</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} isActive={!!editor?.isActive({ textAlign: 'right' })} label="Alinhar à Direita" disabled={!editor}><AlignRight className="mr-2 h-4 w-4" /> Direita</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('justify').run()} isActive={!!editor?.isActive({ textAlign: 'justify' })} label="Justificar" disabled={!editor}><AlignJustify className="mr-2 h-4 w-4" /> Justificado</ToolbarButton>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Títulos</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().setParagraph().run()} isActive={!!editor?.isActive('paragraph')} label="Parágrafo" disabled={!editor}><Pilcrow className="mr-2 h-4 w-4" /> Parágrafo</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} isActive={!!editor?.isActive('heading', { level: 1 })} label="Título 1" disabled={!editor}><Heading1 className="mr-2 h-4 w-4" /> Título 1</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} isActive={!!editor?.isActive('heading', { level: 2 })} label="Título 2" disabled={!editor}><Heading2 className="mr-2 h-4 w-4" /> Título 2</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} isActive={!!editor?.isActive('heading', { level: 3 })} label="Título 3" disabled={!editor}><Heading3 className="mr-2 h-4 w-4" /> Título 3</ToolbarButton>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Blocos</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={!!editor?.isActive('bulletList')} label="Lista com Marcadores" disabled={!editor}><List className="mr-2 h-4 w-4" /> Lista</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={!!editor?.isActive('orderedList')} label="Lista Numerada" disabled={!editor}><ListOrdered className="mr-2 h-4 w-4" /> Lista Numerada</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleTaskList().run()} isActive={!!editor?.isActive('taskList')} label="Checklist" disabled={!editor}><CheckSquare className="mr-2 h-4 w-4" /> Checklist</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={!!editor?.isActive('blockquote')} label="Citação" disabled={!editor}><Quote className="mr-2 h-4 w-4" /> Citação</ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} isActive={false} label="Divisor" disabled={!editor}><Minus className="mr-2 h-4 w-4" /> Divisor</ToolbarButton>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
