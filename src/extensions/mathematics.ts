import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import type { NodeViewRenderer } from '@tiptap/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Obsidian-style LaTeX for the TipTap notes editor.
//
// Two atom nodes store the raw LaTeX in a `latex` attribute and render it with
// KaTeX through a plain-DOM node view (no React, so it stays cheap):
//   - `inlineMath` ($...$)      lives inline inside a paragraph
//   - `blockMath`  ($$...$$)    is a centered display block
//
// Both round-trip through `@tiptap/markdown`: a custom marked tokenizer parses
// the `$`/`$$` syntax on load, and `renderMarkdown` writes it back out, so the
// markdown stored in the workspace stays the source of truth.

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      /** Insert an inline math node; opens it for editing when no latex is given. */
      insertInlineMath: (attributes?: { latex?: string }) => ReturnType;
    };
    blockMath: {
      /** Insert a block (display) math node; opens it for editing when empty. */
      insertBlockMath: (attributes?: { latex?: string }) => ReturnType;
    };
  }
}

/**
 * Build a plain-DOM node view that renders `latex` with KaTeX and swaps to a
 * text field on click so the source can be edited inline.
 */
function mathNodeView(displayMode: boolean): NodeViewRenderer {
  return ({ node, editor, getPos }) => {
    let current = node;
    let editing = false;

    const dom = document.createElement(displayMode ? 'div' : 'span');
    dom.className = displayMode ? 'math-node math-block' : 'math-node math-inline';

    const rendered = document.createElement(displayMode ? 'div' : 'span');
    rendered.className = 'math-rendered';

    const input = document.createElement(displayMode ? 'textarea' : 'input');
    input.className = 'math-input';
    input.setAttribute('spellcheck', 'false');
    input.style.display = 'none';

    dom.append(rendered, input);

    const paint = (latex: string) => {
      if (!latex.trim()) {
        rendered.classList.add('math-empty');
        rendered.textContent = displayMode ? 'Empty equation' : 'math';
        return;
      }
      rendered.classList.remove('math-empty');
      rendered.textContent = '';
      katex.render(latex, rendered, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    };

    const startEdit = () => {
      if (editing || !editor.isEditable) return;
      editing = true;
      input.value = current.attrs.latex ?? '';
      rendered.style.display = 'none';
      input.style.display = displayMode ? 'block' : 'inline-block';
      // Defer so the element is visible before we focus it.
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    };

    const commit = () => {
      if (!editing) return;
      editing = false;
      input.style.display = 'none';
      rendered.style.display = '';
      const latex = input.value;
      paint(latex);
      if (typeof getPos === 'function' && latex !== current.attrs.latex) {
        const pos = getPos();
        if (pos != null) {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, { latex }),
          );
        }
      }
    };

    rendered.addEventListener('mousedown', (event) => {
      event.preventDefault();
      startEdit();
    });

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (event) => {
      const e = event as KeyboardEvent;
      // Escape always commits. Enter commits for inline; block math keeps Enter
      // for newlines and commits on Cmd/Ctrl/Shift+Enter (KaTeX is multi-line).
      const finish =
        e.key === 'Escape' ||
        (e.key === 'Enter' &&
          (!displayMode || e.metaKey || e.ctrlKey || e.shiftKey));
      if (finish) {
        e.preventDefault();
        commit();
        editor.view.focus();
      }
    });

    paint(current.attrs.latex ?? '');
    // Freshly inserted (empty) nodes jump straight into edit mode.
    if (!current.attrs.latex) requestAnimationFrame(startEdit);

    return {
      dom,
      update(updated) {
        if (updated.type.name !== current.type.name) return false;
        current = updated;
        if (!editing) paint(current.attrs.latex ?? '');
        return true;
      },
      selectNode() {
        dom.classList.add('math-selected');
      },
      deselectNode() {
        dom.classList.remove('math-selected');
        commit();
      },
      // We own everything inside `dom`, so let the browser/our listeners handle
      // events there instead of ProseMirror.
      stopEvent: (event) => dom.contains(event.target as globalThis.Node),
      ignoreMutation: () => true,
    };
  };
}

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
        parseHTML: (element) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'inline-math' })];
  },

  addNodeView() {
    return mathNodeView(false);
  },

  addCommands() {
    return {
      insertInlineMath:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex: attributes?.latex ?? '' },
          }),
    };
  },

  addInputRules() {
    return [
      // Typing `$x$` converts the run into inline math.
      nodeInputRule({
        find: /\$([^$\n]+)\$$/,
        type: this.type,
        getAttributes: (match) => ({ latex: match[1].trim() }),
      }),
    ];
  },

  markdownTokenName: 'inlineMath',
  markdownTokenizer: {
    name: 'inlineMath',
    level: 'inline',
    start: (src) => {
      const index = src.indexOf('$');
      return index === -1 ? src.length : index;
    },
    tokenize: (src) => {
      const match = /^\$(?!\$)([^\n$]+?)\$/.exec(src);
      if (!match) return undefined;
      return { type: 'inlineMath', raw: match[0], latex: match[1].trim(), tokens: [] };
    },
  },
  parseMarkdown: (token, helpers) =>
    helpers.createNode('inlineMath', { latex: token.latex ?? '' }),
  renderMarkdown: (node) => `$${node.attrs?.latex ?? ''}$`,
});

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="block-math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'block-math' })];
  },

  addNodeView() {
    return mathNodeView(true);
  },

  addCommands() {
    return {
      insertBlockMath:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex: attributes?.latex ?? '' },
          }),
    };
  },

  addInputRules() {
    return [
      // Typing `$$` at the start of a line opens a display-math block.
      nodeInputRule({
        find: /^\$\$$/,
        type: this.type,
        getAttributes: () => ({ latex: '' }),
      }),
    ];
  },

  markdownTokenName: 'blockMath',
  markdownTokenizer: {
    name: 'blockMath',
    level: 'block',
    start: (src) => {
      const index = src.indexOf('$$');
      return index === -1 ? src.length : index;
    },
    tokenize: (src) => {
      const match = /^\$\$([\s\S]+?)\$\$/.exec(src);
      if (!match) return undefined;
      return { type: 'blockMath', raw: match[0], latex: match[1].trim(), tokens: [] };
    },
  },
  parseMarkdown: (token, helpers) =>
    helpers.createNode('blockMath', { latex: token.latex ?? '' }),
  renderMarkdown: (node) => `$$\n${node.attrs?.latex ?? ''}\n$$`,
});
