# Debug Plan — Tiptap Table Resizing Bug

> Based on systematic debugging protocol.

## 🔴 FIX-13: Both Columns Resize / Table Moves When Dragging

**Severity:** Low — UI annoyance / confusion

### Root Cause

The user reported: *"when i import a table inside the notes and resize the column, both the column begins to resize. I just want the line to move... the table is also moving it shouldn't move"*

**Phase 1 & 2 (Investigation & Pattern Analysis):**
1. Tiptap's table extension handles column resizing by assigning a fixed `width` to each `<col>` element when dragged.
2. In the original codebase, our custom `TableColumnWidths` extension forced *every* column to have an explicit `200px` width when a table was created or imported.
3. However, `src/index.css` forced the table to be `width: 100%;`. Because all columns had explicit pixel widths but the table forced 100%, the browser scaled the widths proportionally. Dragging the mouse 50px would cause the browser to mathematically recalculate the 100% split, resulting in "rubber-banding" where the line didn't track the mouse and both columns visibly shifted.
4. My first attempt was setting the table to `width: max-content`. This fixed the rubber-banding (the line tracked the mouse perfectly), but it caused the overall table to expand to the right ("the table is moving").

**The user actually wants the best of both worlds:** The table must stay exactly 100% wide (it shouldn't move/expand), AND the dragged line must perfectly track the mouse without rubber-banding proportional scaling.

### Hypothesis (Phase 3)

If we keep `width: 100%` on the table to prevent it from moving, but we **remove** the `TableColumnWidths` extension, then newly imported tables won't have rigid pixel widths forced on every column. The browser will auto-layout the table to 100%. When the user drags a column, Tiptap will assign an explicit width *only* to the column being dragged. The remaining columns will perfectly absorb the leftover space, allowing the dividing line to perfectly track the mouse without any rubber-banding or table expansion!

### Fix (Phase 4)

1. **Reverted `src/index.css`** back to `width: 100%;` so the table never moves or expands.
2. **Removed `TableColumnWidths`** from `src/components/Editor.tsx` so the remaining columns can act as shock absorbers for the dragged column.

### Verify
- Create or import a table in the notes.
- The table spans 100% of the editor width.
- Hover over the border between two columns and drag it.
- The dragged line perfectly follows your mouse cursor (no proportional jumping/rubber-banding).
- The overall table right-edge stays perfectly still.
