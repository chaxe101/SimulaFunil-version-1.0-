
'use client';

import { useEditorStore } from '@/stores/editor-store';
import { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Input } from '@/components/ui/input';
import { FontSize } from '@/lib/tiptap-fontsize';
import { Button } from '../ui/button';
import { Plus, Trash2, MoreVertical, Save, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const NotesPager = () => {
    const { notes, currentNoteIndex, setCurrentNoteIndex, addNewNote, deleteCurrentNote } = useEditorStore(state => ({
        notes: state.notes,
        currentNoteIndex: state.currentNoteIndex,
        setCurrentNoteIndex: state.setCurrentNoteIndex,
        addNewNote: state.addNewNote,
        deleteCurrentNote: state.deleteCurrentNote,
    }));

    return (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-3 p-2 bg-card border border-border rounded-full">
            {notes.map((note, index) => (
                <button
                    key={note.id}
                    onClick={() => setCurrentNoteIndex(index)}
                    className={cn(
                        "flex items-center justify-center rounded-full font-bold text-xs transition-all",
                        currentNoteIndex === index 
                            ? "w-6 h-6 bg-primary text-primary-foreground" 
                            : "w-5 h-5 bg-muted/50 text-muted-foreground hover:bg-primary/50 hover:text-primary-foreground"
                    )}
                    aria-label={`Ir para a anotação ${index + 1}`}
                >
                    {index + 1}
                </button>
            ))}
            <Button size="icon" variant="ghost" onClick={addNewNote} className="w-8 h-8 rounded-full">
                <Plus className="w-4 h-4" />
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                     <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" disabled={notes.length <= 1}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente esta anotação.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={deleteCurrentNote}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Deletar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export function NotesView() {
  const { 
    notes, 
    currentNoteIndex, 
    saveCurrentNote,
    setEditorInstance,
    isNotesAutoSaveEnabled,
    toggleNotesAutoSave,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    exportToPdf,
    currentView,
  } = useEditorStore(state => ({
    notes: state.notes,
    currentNoteIndex: state.currentNoteIndex,
    saveCurrentNote: state.saveCurrentNote,
    setEditorInstance: state.setEditorInstance,
    isNotesAutoSaveEnabled: state.isNotesAutoSaveEnabled,
    toggleNotesAutoSave: state.toggleNotesAutoSave,
    hasUnsavedChanges: state.hasUnsavedChanges,
    setHasUnsavedChanges: state.setHasUnsavedChanges,
    exportToPdf: state.exportToPdf,
    currentView: state.currentView,
  }));
  
  const currentNote = useMemo(() => notes[currentNoteIndex] || { id: '', title: '', content: '' }, [notes, currentNoteIndex]);
  const [title, setTitle] = useState(currentNote.title);

  const handleExport = () => {
    exportToPdf(`anotacao-${currentNote.title || 'sem-titulo'}`, currentView);
  };

  const editor = useEditor({
    editable: true,
    extensions: [
      StarterKit.configure({
        textStyle: true,
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: currentNote.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none flex-grow',
        style: 'font-size: 18px;',
      },
    },
    onUpdate: ({ editor }) => {
      setEditorInstance(editor);
      setHasUnsavedChanges(true);
    },
    onBlur: ({ editor }) => {
      if(isNotesAutoSaveEnabled) {
          saveCurrentNote(title, editor.getHTML());
      }
    },
    onCreate: ({ editor }) => {
        if (editor.isEmpty) {
            editor.commands.setContent(currentNote.content, false);
        }
    },
    onDestroy: () => {
      setEditorInstance(null);
    }
  });
  
  useEffect(() => {
    setTitle(currentNote.title);
    if (editor && !editor.isDestroyed && editor.getHTML() !== currentNote.content) {
      editor.commands.setContent(currentNote.content, false);
    }
    setHasUnsavedChanges(false); // Reset unsaved changes when note changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNote, editor]);

  useEffect(() => {
    if (editor) {
      setEditorInstance(editor);
    }
    return () => {
      setEditorInstance(null);
    }
  }, [editor, setEditorInstance]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setHasUnsavedChanges(true);
  }
  
  const handleTitleBlur = () => {
      if(isNotesAutoSaveEnabled && editor) {
          saveCurrentNote(title, editor.getHTML());
      }
  }

  const handleManualSave = () => {
      if (editor) {
          saveCurrentNote(title, editor.getHTML());
      }
  }

  return (
    <div className="flex h-full w-full relative">
      <div className="flex flex-col h-full flex-grow" id="notes-export-area">
        <header className="flex-shrink-0 p-4 border-b border-border max-w-4xl mx-auto w-full flex items-center justify-between">
          <Input
            placeholder="Título da sua anotação..."
            className="text-3xl font-bold h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 bg-transparent font-headline flex-grow"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
          />
            <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar PDF
                    </Button>
                    <Button onClick={handleManualSave} disabled={!hasUnsavedChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        {hasUnsavedChanges ? 'Salvar' : 'Salvo'}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuCheckboxItem
                                checked={isNotesAutoSaveEnabled}
                                onCheckedChange={toggleNotesAutoSave}
                            >
                                Salvar Automaticamente
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
        </header>
        <EditorContent 
          editor={editor} 
          className="flex-grow overflow-y-auto w-full max-w-4xl mx-auto"
        />
      </div>
      <NotesPager />
    </div>
  );
}
