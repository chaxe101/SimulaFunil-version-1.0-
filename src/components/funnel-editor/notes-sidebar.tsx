'use client';

import React from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, Quote, Minus, Code, CheckSquare,
  Pilcrow, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Palette, Highlighter, Subscript, Superscript, IndentDecrease,
  IndentIncrease, Link2, Image, Table, FileCode, RemoveFormatting,
  WrapText, Rows, Columns
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [highlightColor, setHighlightColor] = React.useState('#facc15');
  
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

  const highlightColors = [
    { name: 'Amarelo', value: '#facc15' },
    { name: 'Verde', value: '#4ade80' },
    { name: 'Azul', value: '#60a5fa' },
    { name: 'Rosa', value: '#f472b6' },
    { name: 'Laranja', value: '#fb923c' },
    { name: 'Roxo', value: '#c084fc' },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-4">
        {/* Formatação Básica */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Formatação Básica</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={!!editor?.isActive('bold')} label="Negrito" disabled={!editor}>
              <Bold className="mr-2 h-4 w-4" /> Negrito
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={!!editor?.isActive('italic')} label="Itálico" disabled={!editor}>
              <Italic className="mr-2 h-4 w-4" /> Itálico
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={!!editor?.isActive('underline')} label="Sublinhado" disabled={!editor}>
              <Underline className="mr-2 h-4 w-4" /> Sublinhado
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleStrike().run()} isActive={!!editor?.isActive('strike')} label="Tachado" disabled={!editor}>
              <Strikethrough className="mr-2 h-4 w-4" /> Tachado
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} isActive={!!editor?.isActive('code')} label="Código Inline" disabled={!editor}>
              <Code className="mr-2 h-4 w-4" /> Código
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Formatação Avançada */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Formatação Avançada</h3>
          <div className="space-y-1">
            <ToolbarButton 
              onClick={() => editor?.chain().focus().toggleSubscript().run()} 
              isActive={!!editor?.isActive('subscript')} 
              label="Subscrito" 
              disabled={!editor}
            >
              <Subscript className="mr-2 h-4 w-4" /> Subscrito (H₂O)
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor?.chain().focus().toggleSuperscript().run()} 
              isActive={!!editor?.isActive('superscript')} 
              label="Sobrescrito" 
              disabled={!editor}
            >
              <Superscript className="mr-2 h-4 w-4" /> Sobrescrito (x²)
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor?.chain().focus().unsetAllMarks().run()} 
              isActive={false} 
              label="Limpar Formatação" 
              disabled={!editor}
            >
              <RemoveFormatting className="mr-2 h-4 w-4" /> Limpar Formato
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Cores */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Cores</h3>
          <div className="space-y-4 p-2">
            <div className='flex items-center gap-2'>
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="text-color" className='flex-grow text-sm'>Cor do Texto</Label>
              <Input
                id="text-color"
                type="color"
                className="w-10 h-8 p-1 bg-card border-border cursor-pointer"
                value={editor?.getAttributes('textStyle').color || '#E8ECF3'}
                onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                disabled={!editor}
              />
            </div>
            
            <div className='flex items-center gap-2'>
              <Highlighter className="h-4 w-4 text-muted-foreground" />
              <Label className='flex-grow text-sm'>Marca-Texto</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-10 h-8 p-0" 
                    style={{ backgroundColor: highlightColor }}
                    disabled={!editor}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {highlightColors.map((color) => (
                      <Button
                        key={color.value}
                        variant="outline"
                        className="h-8 p-0"
                        style={{ backgroundColor: color.value }}
                        onClick={() => {
                          setHighlightColor(color.value);
                          editor?.chain().focus().toggleHighlight({ color: color.value }).run();
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => editor?.chain().focus().unsetHighlight().run()}
                  >
                    Remover Destaque
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tamanho da Fonte */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Tamanho da Fonte</h3>
          <div className="p-2 space-y-2">
            <Input
              type="number"
              min="8"
              max="72"
              value={currentFontSize}
              onChange={handleFontSizeChange}
              disabled={!editor}
              className="w-full"
              placeholder="Padrão (18px)"
            />
            <div className="grid grid-cols-4 gap-1">
              {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                <Button
                  key={size}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => editor?.chain().focus().setFontSize(`${size}px`).run()}
                  disabled={!editor}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Alinhamento */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Alinhamento</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} isActive={!!editor?.isActive({ textAlign: 'left' })} label="Alinhar à Esquerda" disabled={!editor}>
              <AlignLeft className="mr-2 h-4 w-4" /> Esquerda
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} isActive={!!editor?.isActive({ textAlign: 'center' })} label="Centralizar" disabled={!editor}>
              <AlignCenter className="mr-2 h-4 w-4" /> Centro
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} isActive={!!editor?.isActive({ textAlign: 'right' })} label="Alinhar à Direita" disabled={!editor}>
              <AlignRight className="mr-2 h-4 w-4" /> Direita
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('justify').run()} isActive={!!editor?.isActive({ textAlign: 'justify' })} label="Justificar" disabled={!editor}>
              <AlignJustify className="mr-2 h-4 w-4" /> Justificado
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Recuo */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Recuo</h3>
          <div className="space-y-1">
            <ToolbarButton 
              onClick={() => editor?.chain().focus().sinkListItem('listItem').run()} 
              isActive={false} 
              label="Aumentar Recuo" 
              disabled={!editor}
            >
              <IndentIncrease className="mr-2 h-4 w-4" /> Aumentar Recuo
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor?.chain().focus().liftListItem('listItem').run()} 
              isActive={false} 
              label="Diminuir Recuo" 
              disabled={!editor}
            >
              <IndentDecrease className="mr-2 h-4 w-4" /> Diminuir Recuo
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Títulos */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Estilos de Título</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().setParagraph().run()} isActive={!!editor?.isActive('paragraph')} label="Parágrafo Normal" disabled={!editor}>
              <Pilcrow className="mr-2 h-4 w-4" /> Parágrafo
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} isActive={!!editor?.isActive('heading', { level: 1 })} label="Título 1" disabled={!editor}>
              <Heading1 className="mr-2 h-4 w-4" /> Título 1
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} isActive={!!editor?.isActive('heading', { level: 2 })} label="Título 2" disabled={!editor}>
              <Heading2 className="mr-2 h-4 w-4" /> Título 2
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} isActive={!!editor?.isActive('heading', { level: 3 })} label="Título 3" disabled={!editor}>
              <Heading3 className="mr-2 h-4 w-4" /> Título 3
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} isActive={!!editor?.isActive('heading', { level: 4 })} label="Título 4" disabled={!editor}>
              <Heading4 className="mr-2 h-4 w-4" /> Título 4
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()} isActive={!!editor?.isActive('heading', { level: 5 })} label="Título 5" disabled={!editor}>
              <Heading5 className="mr-2 h-4 w-4" /> Título 5
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()} isActive={!!editor?.isActive('heading', { level: 6 })} label="Título 6" disabled={!editor}>
              <Heading6 className="mr-2 h-4 w-4" /> Título 6
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Listas e Blocos */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Listas e Blocos</h3>
          <div className="space-y-1">
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={!!editor?.isActive('bulletList')} label="Lista com Marcadores" disabled={!editor}>
              <List className="mr-2 h-4 w-4" /> Lista Simples
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={!!editor?.isActive('orderedList')} label="Lista Numerada" disabled={!editor}>
              <ListOrdered className="mr-2 h-4 w-4" /> Lista Numerada
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleTaskList().run()} isActive={!!editor?.isActive('taskList')} label="Lista de Tarefas" disabled={!editor}>
              <CheckSquare className="mr-2 h-4 w-4" /> Lista de Tarefas
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={!!editor?.isActive('blockquote')} label="Citação" disabled={!editor}>
              <Quote className="mr-2 h-4 w-4" /> Citação
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} isActive={!!editor?.isActive('codeBlock')} label="Bloco de Código" disabled={!editor}>
              <FileCode className="mr-2 h-4 w-4" /> Bloco de Código
            </ToolbarButton>
            <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()} isActive={false} label="Linha Horizontal" disabled={!editor}>
              <Minus className="mr-2 h-4 w-4" /> Linha Divisória
            </ToolbarButton>
          </div>
        </div>

        <Separator />

        {/* Quebras */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">Quebras</h3>
          <div className="space-y-1">
            <ToolbarButton 
              onClick={() => editor?.chain().focus().setHardBreak().run()} 
              isActive={false} 
              label="Quebra de Linha" 
              disabled={!editor}
            >
              <WrapText className="mr-2 h-4 w-4" /> Quebra de Linha
            </ToolbarButton>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
