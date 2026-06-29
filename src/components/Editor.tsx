import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { common, createLowlight } from 'lowlight';
import 'katex/dist/katex.min.css';
import { useWorkspaceStore } from '../store/workspaceStore';
import { InlineMath, MathBlock } from './notes/MathExtensions';
import { PdfEmbed } from './notes/PdfEmbed';
import { importPdfFile } from '../lib/notePdfStore';
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
  Sigma as SigmaIcon,
  FunctionSquare as FunctionSquareIcon,
  Upload as UploadIcon,
} from 'lucide-react';

const lowlight = createLowlight(common);

const isPdf = (file: File) =>
  file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
const isMarkdown = (file: File) =>
  file.type === 'text/markdown' ||
  file.type === 'text/plain' ||
  /\.(md|markdown|txt)$/i.test(file.name);

export const Editor: React.FC = () => {
  const notes = useWorkspaceStore((state) => state.notes);
  const updateNotes = useWorkspaceStore((state) => state.updateNotes);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  // Find now uses the search palette UI (Ctrl+F = this tab) instead of a find bar.
  const openSearchPalette = useWorkspaceStore((state) => state.openSearchPalette);
  const importInputRef = useRef<HTMLInputElement>(null);

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
      InlineMath,
      MathBlock,
      PdfEmbed,
    ],
    content: notes,
    // The stored notes are a markdown string — tell the markdown extension to
    // parse it as such, otherwise a remounted editor (e.g. after collapsing and
    // re-opening the notes pane) renders the raw markdown source as plain text.
    contentType: 'markdown',
    onUpdate: ({ editor }) => {
      if (editor.isDestroyed) return;
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

  // Sync with store when notes change from loading or imports.
  useEffect(() => {
    // `editor` can be a *destroyed* (but non-null) instance while a Suspense /
    // StrictMode reconnect is in flight — and TipTap's `commands`/`getMarkdown`
    // getters throw ("Cannot read properties of null") once the view is torn
    // down. Skipping the dead instance is safe: the freshly-created editor
    // re-runs this effect and syncs the content. (Reliably triggered by a heavy
    // PDF embed, whose blob work widens the teardown window on reload.)
    if (!editor || editor.isDestroyed || isLoading) return;
    try {
      const currentMarkdown = (editor as any).getMarkdown();
      if (currentMarkdown !== notes) {
        // v3 setContent takes an options object; parse the incoming notes as
        // markdown and don't echo the change back through onUpdate.
        (editor as any).commands.setContent(notes, { emitUpdate: false, contentType: 'markdown' });
      }
    } catch {
      // editor mid-teardown; the next live instance will sync.
    }
  }, [notes, editor, isLoading]);

  // Expose the editor instance globally so the cross-tab search palette can
  // jump to and highlight matches.
  useEffect(() => {
    (window as any).notesEditor = editor;
    return () => {
      if ((window as any).notesEditor === editor) {
        (window as any).notesEditor = null;
      }
    };
  }, [editor]);

  // ── Shared file handling: PDFs embed as a viewer, .md files insert as
  // markdown. Used by the Import button, the hidden input, and drag-and-drop. ──
  const handleFiles = async (files: FileList | File[]) => {
    if (!editor) return;
    for (const file of Array.from(files)) {
      if (isPdf(file)) {
        try {
          const { ref, name } = await importPdfFile(file);
          editor.chain().focus().insertPdf({ src: ref, name }).run();
        } catch {
          // ignore a single failed import; others still proceed
        }
      } else if (isMarkdown(file)) {
        const text = await file.text();
        // The markdown extension augments insertContent with a `contentType`
        // option at runtime; cast through the command's own param type so the
        // markdown gets parsed rather than inserted as a literal string.
        type InsertOpts = Parameters<typeof editor.commands.insertContent>[1];
        const mdOpts = { contentType: 'markdown' } as InsertOpts;
        editor.chain().focus().insertContent(`\n${text}\n`, mdOpts).run();
      }
    }
  };

  const onImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) await handleFiles(e.target.files);
    e.target.value = ''; // allow re-importing the same file
  };

  const onDrop = (e: React.DragEvent) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && Array.from(files).some((f) => isPdf(f) || isMarkdown(f))) {
      e.preventDefault();
      e.stopPropagation();
      void handleFiles(files);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full bg-canvas border-l border-hairline text-ink select-text relative">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-canvas/70 border-b border-hairline backdrop-blur-md sticky top-0 z-30 select-none">
        <div className="flex items-center gap-1 flex-nowrap overflow-x-auto min-w-0 [&>*]:shrink-0">
          {/* Format actions */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('bold') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Bold"
          >
            <BoldIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('italic') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Italic"
          >
            <ItalicIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('code') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Inline Code"
          >
            <CodeIcon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-hairline mx-1" />

          {/* Heading actions */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('heading', { level: 1 }) ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Heading 1"
          >
            <H1Icon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('heading', { level: 2 }) ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Heading 2"
          >
            <H2Icon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('heading', { level: 3 }) ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Heading 3"
          >
            <H3Icon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-hairline mx-1" />

          {/* List actions */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Bullet List"
          >
            <ListIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Ordered List"
          >
            <ListOrderedIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('codeBlock') ? 'text-link bg-canvas-soft' : 'text-body'}`}
            title="Code Block"
          >
            <TerminalIcon size={14} />
          </button>

          <div className="h-4 w-[1px] bg-hairline mx-1" />

          {/* Table Actions */}
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer text-body hover:text-ink"
            title="Insert Table (3x3)"
          >
            <TableIcon size={14} />
          </button>
          {editor.isActive('table') && (
            <div className="flex items-center gap-0.5 border border-hairline bg-canvas rounded p-0.5 ml-1">
              <button
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-1 text-[10px] rounded hover:bg-canvas-soft text-ink cursor-pointer"
                title="Add Column"
              >
                +Col
              </button>
              <button
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-1 text-[10px] rounded hover:bg-canvas-soft text-ink cursor-pointer"
                title="Add Row"
              >
                +Row
              </button>
              <button
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="px-1 text-[10px] rounded hover:bg-canvas-soft text-rose-400 hover:text-rose-300 cursor-pointer"
                title="Delete Table"
              >
                Del
              </button>
            </div>
          )}

          <div className="h-4 w-[1px] bg-hairline mx-1" />

          {/* Math + media */}
          <button
            onClick={() => editor.chain().focus().insertInlineMath('').run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('inlineMath') ? 'text-link bg-canvas-soft' : 'text-body hover:text-ink'}`}
            title="Inline math  $…$"
          >
            <SigmaIcon size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().insertMathBlock('').run()}
            className={`p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer ${editor.isActive('mathBlock') ? 'text-link bg-canvas-soft' : 'text-body hover:text-ink'}`}
            title="Math block  $$…$$"
          >
            <FunctionSquareIcon size={14} />
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer text-body hover:text-ink"
            title="Import file (.md or .pdf)"
          >
            <UploadIcon size={14} />
          </button>
        </div>

        {/* Search icon opens the search palette scoped to this tab */}
        <button
          onClick={() => openSearchPalette('current')}
          className="p-1.5 rounded hover:bg-canvas-soft transition-colors cursor-pointer text-body"
          title="Search (Ctrl+F)"
        >
          <SearchIcon size={14} />
        </button>
      </div>

      {/* Hidden input backing the Import button — accepts markdown and PDFs */}
      <input
        ref={importInputRef}
        type="file"
        accept=".md,.markdown,.txt,.pdf,text/markdown,text/plain,application/pdf"
        multiple
        className="hidden"
        onChange={onImportChange}
      />

      {/* Editor Content Area — also a drop target for .md / .pdf files */}
      <div
        className="flex-1 overflow-y-auto w-full relative"
        onDrop={onDrop}
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer?.items ?? []).some((it) => it.kind === 'file')) {
            e.preventDefault();
          }
        }}
      >
        <EditorContent editor={editor} className="h-full w-full" />
      </div>

      {/* Math rendering tweaks so KaTeX inherits the editor's ink colour and
          block formulae centre nicely inside the prose column. */}
      <style>{`
        .ProseMirror .math-node .katex { color: inherit; font-size: 1.05em; }
        .ProseMirror .math-block { text-align: center; }
        .ProseMirror .math-block .katex-display { margin: 0.4em 0; }
        .ProseMirror .pdf-embed { line-height: normal; }
      `}</style>
    </div>
  );
};
