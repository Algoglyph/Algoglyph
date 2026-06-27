/* eslint-disable react-refresh/only-export-components -- this module exports
   Tiptap node extensions alongside their (internal) React node view; Fast
   Refresh of the node view isn't applicable here. */
import React, { useEffect, useRef, useState } from 'react';
import { Node, mergeAttributes, nodeInputRule, InputRule } from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from '@tiptap/react';
import katex from 'katex';

/**
 * LaTeX math for the notes editor — Obsidian-style `$inline$` and `$$block$$`.
 *
 * Two atom nodes (`inlineMath`, `mathBlock`) store the raw LaTeX in a `latex`
 * attribute and render it with KaTeX through a React node view. Clicking a
 * formula reveals its source for editing; committing re-renders it.
 *
 * Markdown round-trip: each node registers a custom `markdownTokenizer` so the
 * `@tiptap/markdown` lexer recognises `$…$` / `$$…$$` (running *before* the
 * default emphasis tokenizer, which is what keeps `x_i` from turning into
 * italics), plus `parseMarkdown`/`renderMarkdown` so the LaTeX survives the
 * markdown save/load cycle verbatim.
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      insertInlineMath: (latex?: string) => ReturnType;
      insertMathBlock: (latex?: string) => ReturnType;
    };
  }
}

function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
      strict: false,
    });
  } catch {
    return '';
  }
}

const MathNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor }) => {
  const isBlock = node.type.name === 'mathBlock';
  const latex: string = node.attrs.latex ?? '';
  const [editing, setEditing] = useState(latex.trim() === '');
  const [value, setValue] = useState(latex);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const syncedLatex = useRef(latex);

  // Tiptap may reuse this React node view for a *different* underlying node
  // (e.g. when content is replaced while a block was mid-edit). Re-sync local UI
  // state to the node whenever its latex changes from what we last rendered, so
  // a stale editor can't show the wrong formula. This is a deliberate
  // external-system sync (the ProseMirror node), hence the rule suppression.
  useEffect(() => {
    if (syncedLatex.current !== latex) {
      syncedLatex.current = latex;
      setValue(latex);
      setEditing(latex.trim() === '');
    }
  }, [latex]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    updateAttributes({ latex: value.trim() });
    setEditing(false);
    // return focus to the document so typing continues naturally
    queueMicrotask(() => editor.commands.focus());
  };

  const cancel = () => {
    setValue(latex);
    setEditing(false);
    queueMicrotask(() => editor.commands.focus());
  };

  const wrapperTag = isBlock ? 'div' : 'span';
  const baseClass = isBlock
    ? 'math-node math-block my-2 block'
    : 'math-node math-inline inline-block align-middle';

  if (editing) {
    const editorClass =
      'font-mono text-[12.5px] bg-canvas-soft border border-link/40 rounded px-1.5 py-0.5 text-ink outline-none focus:border-link';
    return (
      <NodeViewWrapper as={wrapperTag} className={baseClass} data-math-editing="true">
        {isBlock ? (
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={commit}
            rows={Math.max(2, value.split('\n').length)}
            placeholder="\\int_a^b f(x)\\,dx"
            className={`${editorClass} w-full resize-y min-w-[260px]`}
            spellCheck={false}
          />
        ) : (
          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={commit}
            placeholder="e.g. x^2 + y^2"
            className={`${editorClass} min-w-[120px]`}
            spellCheck={false}
          />
        )}
      </NodeViewWrapper>
    );
  }

  const empty = latex.trim() === '';
  return (
    <NodeViewWrapper
      as={wrapperTag}
      className={`${baseClass} cursor-pointer rounded ${selected ? 'ring-1 ring-link/50' : ''} hover:bg-canvas-soft/60`}
      onClick={() => {
        setValue(latex);
        setEditing(true);
      }}
      title="Click to edit math"
    >
      {empty ? (
        <span className="text-mute text-[12px] font-mono px-1" contentEditable={false}>
          ƒ empty math — click to edit
        </span>
      ) : (
        <span
          contentEditable={false}
          dangerouslySetInnerHTML={{ __html: renderKatex(latex, isBlock) }}
        />
      )}
    </NodeViewWrapper>
  );
};

export const InlineMath = Node.create({
  name: 'inlineMath',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-latex') ?? '',
        renderHTML: (attrs) => ({ 'data-latex': attrs.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-latex]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'math-inline' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertInlineMath:
        (latex = '') =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: { latex } })
            .run(),
    };
  },

  addInputRules() {
    return [
      // Typing `$x^2$` converts inline to rendered math. The lookbehind keeps
      // the rule from firing inside `$$`. We intentionally use *no* capture
      // group: tiptap's nodeInputRule keeps the delimiters when a group is
      // present, so matching the whole `$…$` makes it replace the delimiters
      // too. The latex is recovered by stripping the surrounding `$`.
      nodeInputRule({
        find: /(?<!\$)\$[^$\n]+?\$$/,
        type: this.type,
        getAttributes: (match) => ({ latex: match[0].slice(1, -1).trim() }),
      }),
    ];
  },

  // ── Markdown round-trip (`$…$`) ──
  markdownTokenName: 'inlineMath',
  markdownTokenizer: {
    name: 'inlineMath',
    level: 'inline',
    start: (src: string) => {
      const i = src.indexOf('$');
      return i < 0 ? src.length : i;
    },
    tokenize: (src: string) => {
      // single-dollar, not double; no surrounding whitespace; closer not before a digit
      const m = /^\$(?!\$)(?!\s)([^\n$]*?[^\n$\s])\$(?!\d)/.exec(src);
      if (!m) return undefined;
      return { type: 'inlineMath', raw: m[0], latex: m[1] };
    },
  },
  parseMarkdown: (token) => ({ type: 'inlineMath', attrs: { latex: token.latex ?? '' } }),
  renderMarkdown: (node) => `$${node.attrs?.latex ?? ''}$`,
});

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-latex') ?? '',
        renderHTML: (attrs) => ({ 'data-latex': attrs.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-latex]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'math-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addCommands() {
    return {
      insertMathBlock:
        (latex = '') =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: { latex } })
            .run(),
    };
  },

  addInputRules() {
    // A block atom replacing a whole paragraph trips up nodeInputRule's position
    // math, so swap the matched range for the node directly via replaceRangeWith.
    const type = this.type;
    const rule = (find: RegExp, getLatex: (m: RegExpMatchArray) => string) =>
      new InputRule({
        find,
        handler: ({ state, range, match }) => {
          // The regex anchors to the whole textblock, so replace the entire
          // parent paragraph with the block node (replacing an inline range with
          // a block node throws on position fitting).
          const $from = state.doc.resolve(range.from);
          const depth = Math.max(1, $from.depth);
          state.tr.replaceWith(
            $from.before(depth),
            $from.after(depth),
            type.create({ latex: getLatex(match).trim() }),
          );
        },
      });

    return [
      // Typing `$$` opens an empty block editor (Obsidian-style); type the LaTeX
      // in it, then ⌘/Ctrl+Enter (or click away) to render. (A one-line `$$x$$`
      // rule is intentionally omitted — typing the two opening dollars already
      // triggers this rule first, so it could never be reached anyway.)
      rule(/^\$\$$/, () => ''),
    ];
  },

  // ── Markdown round-trip (`$$…$$`) ──
  markdownTokenName: 'mathBlock',
  markdownTokenizer: {
    name: 'mathBlock',
    level: 'block',
    start: (src: string) => {
      const i = src.indexOf('$$');
      return i < 0 ? src.length : i;
    },
    tokenize: (src: string) => {
      const m = /^\$\$\s*([\s\S]+?)\s*\$\$(?:\n+|$)/.exec(src);
      if (!m) return undefined;
      return { type: 'mathBlock', raw: m[0], latex: m[1] };
    },
  },
  parseMarkdown: (token) => ({ type: 'mathBlock', attrs: { latex: token.latex ?? '' } }),
  renderMarkdown: (node) => `$$\n${node.attrs?.latex ?? ''}\n$$`,
});
