import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';
import { useWorkspaceStore } from '../store/workspaceStore';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Terminal as TerminalIcon,
  Table as TableIcon,
  Search as SearchIcon,
  X as XIcon,
  ChevronDown
} from 'lucide-react';

const lowlight = createLowlight(common);

export const Editor: React.FC = () => {
  const notes = useWorkspaceStore((state) => state.notes);
  const updateNotes = useWorkspaceStore((state) => state.updateNotes);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // disable to use CodeBlockLowlight
      }),
      Markdown,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: notes,
    onUpdate: ({ editor }) => {
      const markdown = (editor as any).getMarkdown();
      updateNotes(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none min-h-[500px]',
        placeholder: 'Start writing markdown here...',
      },
    },
  }, [isLoading]); // Recreate when loading changes

  // Sync with store when notes change from loading or imports
  useEffect(() => {
    if (editor && !isLoading) {
      const currentMarkdown = (editor as any).getMarkdown();
      if (currentMarkdown !== notes) {
        (editor as any).commands.setContent(notes, false);
      }
    }
  }, [notes, editor, isLoading]);

  // Expose the editor instance globally so the search palette can jump to matches
  useEffect(() => {
    (window as any).notesEditor = editor;
    return () => {
      if ((window as any).notesEditor === editor) {
        (window as any).notesEditor = null;
      }
    };
  }, [editor]);

  // Handle Ctrl+F for Search inside Editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd+F toggles the quick find bar; Ctrl/Cmd+Shift+F is reserved
      // for the global search palette (handled in App.tsx).
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = () => {
    if (!searchTerm) return;
    // Native window.find: (str, caseSensitive, backwards, wrapAround, wholeWord, searchInFrames, showDialog)
    (window as any).find(searchTerm, false, false, true, false, false, false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearch(false);
      editor?.commands.focus();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border-l border-zinc-800 text-zinc-300 select-text relative">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-sm sticky top-0 z-30 select-none">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Format actions */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('bold') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Bold"
          >
            <BoldIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('italic') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Italic"
          >
            <ItalicIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('code') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Inline Code"
          >
            <CodeIcon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Heading actions */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('heading', { level: 1 }) ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Heading 1"
          >
            <H1Icon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('heading', { level: 2 }) ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Heading 2"
          >
            <H2Icon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('heading', { level: 3 }) ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Heading 3"
          >
            <H3Icon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* List actions */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Bullet List"
          >
            <ListIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Ordered List"
          >
            <ListOrderedIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${editor.isActive('codeBlock') ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
            title="Code Block"
          >
            <TerminalIcon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Table Actions */}
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-300"
            title="Insert Table (3x3)"
          >
            <TableIcon size={14} />
          </button>
          {editor.isActive('table') && (
            <div className="flex items-center gap-0.5 border border-zinc-800 bg-zinc-900 rounded p-0.5 ml-1">
              <button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-1 text-[10px] rounded hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                title="Add Column"
              >
                +Col
              </button>
              <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-1 text-[10px] rounded hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                title="Add Row"
              >
                +Row
              </button>
              <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="px-1 text-[10px] rounded hover:bg-zinc-800 text-red-400 hover:text-red-300 cursor-pointer"
                title="Delete Table"
              >
                Del
              </button>
            </div>
          )}
        </div>

        {/* Search icon triggers search bar */}
        <button
          onClick={() => setShowSearch(prev => !prev)}
          className={`p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${showSearch ? 'text-purple-400 bg-zinc-800' : 'text-zinc-400'}`}
          title="Search (Ctrl+F)"
        >
          <SearchIcon size={14} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative">
        <EditorContent editor={editor} className="h-full w-full" />
      </div>

      {/* Floating Find Bar */}
      {showSearch && (
        <div className="absolute bottom-4 right-4 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-2 z-40 flex items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <SearchIcon size={14} className="text-zinc-500 ml-1" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500 w-48"
          />
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleSearch}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Next Match (Enter)"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => setShowSearch(false)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Close (Esc)"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
