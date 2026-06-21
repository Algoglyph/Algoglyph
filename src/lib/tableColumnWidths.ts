import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';

// Default width (px) assigned to any table column that doesn't have an explicit
// one yet. ~200px gives a 3-column table close to the editor's content width.
const DEFAULT_COL_WIDTH = 200;

/**
 * Ensures every table cell carries an explicit `colwidth`.
 *
 * ProseMirror's column resizing only writes a width onto the column you drag.
 * With the editor's `table { width: 100% }` rule, the remaining `auto` columns
 * then redistribute the leftover space — so dragging one divider also shrinks
 * the other columns and moves their dividers ("both lines move").
 *
 * Once *all* columns have explicit widths, there are no `auto` columns to
 * redistribute: resizing a column changes only that column's width and the
 * table grows (the `.tableWrapper` scrolls). This backfills any missing width
 * on insert, paste, add-column, and when existing notes load.
 */
export const TableColumnWidths = Extension.create({
  name: 'tableColumnWidths',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, _oldState, newState) => {
          // Only react to content changes (skip pure selection/metadata txns).
          if (!transactions.some((t) => t.docChanged)) return null;

          let tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== 'tableCell' && node.type.name !== 'tableHeader') {
              return true;
            }
            const colspan: number = node.attrs.colspan || 1;
            const current: number[] | null = node.attrs.colwidth;
            const missing =
              !current ||
              current.length !== colspan ||
              current.some((w) => !w);
            if (missing) {
              const colwidth = Array.from(
                { length: colspan },
                (_, i) => (current && current[i]) || DEFAULT_COL_WIDTH
              );
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, colwidth });
              modified = true;
            }
            return true;
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
