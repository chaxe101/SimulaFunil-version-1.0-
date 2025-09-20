
'use client';

import { useEditorStore } from '@/stores/editor-store';
import { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize } from '@/lib/tiptap-fontsize';

export function NotesPresentationView() {
  const { notes, currentNoteIndex } = useEditorStore(state => ({
    notes: state.notes,
    currentNoteIndex: state.currentNoteIndex,
  }));
  
  const currentNote = useMemo(() => notes[currentNoteIndex] || { id: '', title: '', content: '' }, [notes, currentNoteIndex]);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ textStyle: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontSize,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: currentNote.content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none flex-grow',
        style: 'font-size: 18px;',
      },
    },
  });
  
  return (
    <div className="flex h-full w-full relative">
      <div className="flex flex-col h-full flex-grow">
        <header className="flex-shrink-0 p-4 border-b border-border max-w-4xl mx-auto w-full flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">{currentNote.title}</h1>
        </header>
        <EditorContent 
          editor={editor} 
          className="flex-grow overflow-y-auto w-full max-w-4xl mx-auto"
        />
      </div>
    </div>
  );
}
