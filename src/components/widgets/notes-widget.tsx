
'use client';

import { useEditorStore } from '@/stores/editor-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

export function NotesWidget() {
  const { notes, setCurrentView } = useEditorStore(state => ({
    notes: state.notes,
    setCurrentView: state.setCurrentView,
  }));

  const notesContent = useMemo(() => {
    // Always show the first note in the widget, which is the main one.
    return notes[0] || { title: 'Anotações', content: '' };
  }, [notes]);

  // Create a temporary div to strip HTML for preview
  const getPlainText = (html: string) => {
    if (typeof window === 'undefined' || !html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainTextContent = getPlainText(notesContent?.content || '');
  const characterLimit = 360;
  const previewText = plainTextContent.substring(0, characterLimit);

  return (
    <Card className="h-full flex flex-col flex-grow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl truncate">{notesContent?.title || 'Anotações'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('notes')}>
          Abrir Anotação
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-full">
           <div className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none">
                <p className="whitespace-pre-wrap">
                    {previewText ? (
                        previewText + (plainTextContent.length > characterLimit ? '...' : '')
                    ) : (
                        'Nenhum conteúdo ainda. Clique para abrir a anotação e começar a escrever.'
                    )}
                </p>
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
