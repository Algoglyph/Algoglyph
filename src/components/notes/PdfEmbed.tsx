/* eslint-disable react-refresh/only-export-components -- this module exports a
   Tiptap node extension alongside its (internal) React node view. */
import React, { useEffect, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from '@tiptap/react';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { getPdf } from '../../lib/notePdfStore';
import { LoadingSpinner } from '../LoadingSpinner';

/**
 * PDF embedding for the notes editor — Obsidian-style inline PDF viewing.
 *
 * A block atom node holding a `src` (either an `http(s)` URL or a
 * `pdfstore:<id>` reference into {@link ../../lib/notePdfStore}) and a `name`.
 * The node view resolves `pdfstore:` refs to a blob URL and shows the file in an
 * `<iframe>`, so the browser's native PDF viewer (page nav, zoom, search) is
 * used directly.
 *
 * Markdown round-trip: serialized as a compact `[pdf src="…" name="…"]` block;
 * the heavy bytes never enter the note markdown (see notePdfStore for why).
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdf: {
      insertPdf: (attrs: { src: string; name?: string }) => ReturnType;
    };
  }
}

function parsePdfAttrs(attrString: string): { src: string; name: string } {
  const attrs: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrString)) !== null) {
    attrs[m[1]] = m[2];
  }
  return { src: attrs.src ?? '', name: attrs.name ?? '' };
}

const PdfNodeView: React.FC<NodeViewProps> = ({ node, deleteNode, selected }) => {
  const src: string = node.attrs.src ?? '';
  const name: string = node.attrs.name ?? 'document.pdf';
  const isStored = src.startsWith('pdfstore:');

  // Blob URL + async error are only relevant for stored PDFs; direct URLs and
  // the "missing source" case are derived below without touching state in the
  // effect body (which keeps render-time setState out of the picture).
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStored) return;
    let revoke: string | null = null;
    let cancelled = false;
    const id = src.slice('pdfstore:'.length);
    getPdf(id)
      .then((rec) => {
        if (cancelled) return;
        if (!rec) {
          setLoadError('This PDF is no longer stored locally.');
          return;
        }
        const blob = new Blob([rec.data], { type: rec.type || 'application/pdf' });
        const objUrl = URL.createObjectURL(blob);
        revoke = objUrl;
        setBlobUrl(objUrl);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Failed to load PDF from local store.');
      });
    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src, isStored]);

  const url = isStored ? blobUrl : src || null;
  const error = !src ? 'Missing PDF source' : loadError;

  return (
    <NodeViewWrapper
      className={`pdf-embed my-3 rounded-lg border ${selected ? 'border-link' : 'border-hairline'} bg-canvas-soft overflow-hidden select-none`}
      data-pdf-src={src}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-hairline bg-canvas/60 text-body"
        contentEditable={false}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-link shrink-0" />
          <span className="text-[12.5px] font-medium text-ink truncate" title={name}>
            {name}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded hover:bg-canvas-soft text-body hover:text-ink cursor-pointer"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </a>
          )}
          <button
            onClick={() => deleteNode()}
            className="p-1 rounded hover:bg-canvas-soft text-body hover:text-rose-400 cursor-pointer"
            title="Remove PDF"
            type="button"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div
        className="relative w-full resize-y overflow-hidden bg-[#525659]"
        style={{ height: 600, minHeight: 220 }}
        contentEditable={false}
      >
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-body bg-canvas">
            {error}
          </div>
        ) : !url ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] text-body bg-canvas">
            <LoadingSpinner size={15} />
            Loading PDF…
          </div>
        ) : (
          <iframe
            src={`${url}#view=FitH`}
            title={name}
            className="w-full h-full border-0"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const PdfEmbed = Node.create({
  name: 'pdfEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-pdf-src') ?? '',
        renderHTML: (attrs) => ({ 'data-pdf-src': attrs.src }),
      },
      name: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-pdf-name') ?? '',
        renderHTML: (attrs) => ({ 'data-pdf-name': attrs.name }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-pdf-src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'pdf-embed' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView);
  },

  addCommands() {
    return {
      insertPdf:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: { src: attrs.src, name: attrs.name ?? '' } })
            .run(),
    };
  },

  // ── Markdown round-trip (`[pdf src="…" name="…"]`) ──
  markdownTokenName: 'pdfEmbed',
  markdownTokenizer: {
    name: 'pdfEmbed',
    level: 'block',
    start: (src: string) => {
      const i = src.indexOf('[pdf');
      return i < 0 ? src.length : i;
    },
    tokenize: (src: string) => {
      const m = /^\[pdf\b([^\]]*)\](?:\n+|$)?/.exec(src);
      if (!m) return undefined;
      const { src: pdfSrc, name } = parsePdfAttrs(m[1]);
      return { type: 'pdfEmbed', raw: m[0], pdfSrc, pdfName: name };
    },
  },
  parseMarkdown: (token) => ({
    type: 'pdfEmbed',
    attrs: { src: token.pdfSrc ?? '', name: token.pdfName ?? '' },
  }),
  renderMarkdown: (node) => {
    const src = node.attrs?.src ?? '';
    const name = (node.attrs?.name ?? '').replace(/"/g, "'");
    return `[pdf src="${src}" name="${name}"]`;
  },
});
