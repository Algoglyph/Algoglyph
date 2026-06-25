# Search Bar — Implementation Spec

A hand-off spec for adding a **search bar to two sidebars**:

1. The **Visualizer** algorithm list — `src/components/AlgorithmSidebar.tsx`
2. The **canvas Structures** panel — `src/components/StructuresPanel.tsx`

The bar sits directly under each panel's heading (above the category sections),
filters the list live as the user types, and lets them jump straight to the
exact visualizer/structure they want.

```
┌─────────────────────────────┐
│  Algorithms              66  │  ← existing heading
│  ┌───────────────────────┐  │
│  │ 🔍  Search algorithms… │  │  ← NEW search field (full width)
│  └───────────────────────┘  │
│  SEARCHING ───────────────  │  ← category sections, now filtered
│   Linear Search        O(n) │
│   …                         │
└─────────────────────────────┘
```

The two panels look different on purpose (one uses raw zinc + `isDark`, the
other uses the app's semantic tokens). Use **one shared `SearchField`
component** styled with semantic tokens so both stay consistent, and wire the
filtering separately in each panel.

---

## 1. Shared component — `src/components/SearchField.tsx` (new)

A small, controlled, accessible search input. Reused by both panels.

```tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchField: React.FC<Props> = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative">
    <Search
      size={13}
      aria-hidden
      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
    />
    <input
      type="search"
      role="searchbox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value) {
          e.stopPropagation();   // don't let Escape bubble to global handlers
          onChange('');
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete="off"
      spellCheck={false}
      className="w-full rounded-lg border border-hairline bg-canvas-soft py-1.5 pl-8 pr-7 text-[12.5px] text-ink placeholder:text-mute outline-none transition-colors focus-visible:border-link focus-visible:ring-1 focus-visible:ring-link"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        title="Clear"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center rounded p-0.5 text-mute hover:text-ink transition-colors cursor-pointer"
      >
        <X size={13} />
      </button>
    )}
  </div>
);
```

Notes:
- `type="search"` + `role="searchbox"` + `aria-label` (a11y).
- Placeholder ends with `…`; `spellCheck={false}`, `autoComplete="off"`.
- **`Escape` clears and `stopPropagation()`s** — both panels and the app
  register global key handlers, so the event must not bubble.
- `outline-none` is paired with a `focus-visible` ring (never bare).
- Tokens (`text-ink`, `bg-canvas-soft`, `border-hairline`, `text-mute`,
  `border-link`) resolve in both light and dark themes automatically.

---

## 2. Shared filter helper — add to `src/lib/` or inline

Case-insensitive, token-based AND match: every whitespace-separated term in the
query must appear somewhere in the item's searchable text. This makes
"lin sea" match "Linear Search".

```ts
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;                       // empty query = everything
  const text = haystack.toLowerCase();
  return q.split(/\s+/).every((term) => text.includes(term));
}
```

Build the haystack per item from the fields below (join with spaces).

---

## 3. Wire into the Visualizer — `AlgorithmSidebar.tsx`

**Data:** `ALGORITHMS` (`{ id, name, category, blurb, complexity }`) grouped by
`ALGORITHM_CATEGORIES`. Searchable fields: `name`, `id`, `blurb`, `complexity`.

**Add state** (next to the existing `width`/`isResizing` state):
```tsx
const [query, setQuery] = useState('');
```

**Filter** before the category map. Inside `body`, change the category loop so
each category only renders its matching items, and skip categories with none:
```tsx
const visible = (a: AlgorithmDef) =>
  matchesQuery(`${a.name} ${a.id} ${a.blurb} ${a.complexity}`, query);
const totalMatches = ALGORITHMS.filter(visible).length;
```
```tsx
{ALGORITHM_CATEGORIES.map((cat) => {
  const items = ALGORITHMS.filter((a) => a.category === cat && visible(a));
  if (!items.length) return null;
  return ( /* …existing category block, mapping `items`… */ );
})}
```

**Insert the field** in `body`, right after the header `<div>` (the one with
"Algorithms" + count + collapse button) and before the scrolling list:
```tsx
<div className="px-3 pb-2">
  <SearchField value={query} onChange={setQuery} placeholder="Search algorithms…" />
</div>
```

**Empty state** — when nothing matches, render inside the scroll area instead of
the category list:
```tsx
{totalMatches === 0 ? (
  <p className="px-4 py-6 text-[12px] text-mute">No algorithms match “{query}”.</p>
) : ( /* category map */ )}
```

**Keep working:** the per-card book icon and drag/click stay untouched — you're
only filtering which cards render.

---

## 4. Wire into the canvas — `StructuresPanel.tsx`

**Data:** `dsaStructures` (`{ id, name, category, description, commands[] }`),
already split into `structures` (category `'structures'`) and `algorithms`
(category `'algorithms'`). Searchable fields: `name`, `description`,
`commands` (joined), `id`.

**Add state** (near `isDragging`):
```tsx
const [query, setQuery] = useState('');
```

**Filter** the two lists:
```tsx
const visible = (s: DSAStructure) =>
  matchesQuery(`${s.name} ${s.description} ${s.commands.join(' ')} ${s.id}`, query);
const structures = dsaStructures.filter((s) => s.category === 'structures' && visible(s));
const algorithms = dsaStructures.filter((s) => s.category === 'algorithms' && visible(s));
```

**Insert the field** inside `body`, right after the "Structures" heading `<div>`
and before the first `<Section>`:
```tsx
<div className="px-4 pb-2">
  <SearchField value={query} onChange={setQuery} placeholder="Search structures…" />
</div>
```

**Hide empty sections & show empty state:**
```tsx
{structures.length > 0 && (
  <Section label="data structures" count={structures.length}>{structures.map(Row)}</Section>
)}
{algorithms.length > 0 && (
  <Section label="algorithms" count={algorithms.length}>{algorithms.map(Row)}</Section>
)}
{structures.length === 0 && algorithms.length === 0 && (
  <p className="px-4 py-6 text-[12px] text-mute">Nothing matches “{query}”.</p>
)}
```

Note: the `Section` `count` now reflects the **filtered** count, which is the
desired behavior (it shows how many matched). The top-of-panel total
(`structures.length + algorithms.length`) will also become the filtered total —
if you want it to always show the grand total, compute it from the unfiltered
`dsaStructures` separately.

---

## 5. Behavior summary

- **Live filtering** as the user types (controlled input, no submit).
- **Token-AND match** on name / id / description-or-blurb / command-or-complexity.
- **Empty categories hidden**; a friendly empty state when nothing matches.
- **Clear** via the `X` button or `Escape`.
- Each row keeps its existing **drag + click + book icon** behavior.

---

## 6. Accessibility & guideline checklist

- [ ] Input is `type="search"` with an `aria-label`/placeholder ending in `…`.
- [ ] Search icon and clear icon are `aria-hidden` / have `aria-label`.
- [ ] `spellCheck={false}`, `autoComplete="off"`.
- [ ] `outline-none` only with a `focus-visible` ring.
- [ ] `Escape` clears and does **not** bubble to global shortcuts.
- [ ] Do **not** `autoFocus` (desktop sidebars open without stealing focus).
- [ ] Result count is visible (the section/header counts already reflect it);
      optionally wrap the empty-state text in `aria-live="polite"`.

---

## 7. Optional polish (only if asked)

- **Match highlighting:** bold the matched substring in each row's name.
- **Keyboard nav:** Arrow Up/Down to move a highlight, Enter to add/insert the
  focused item.
- **Focus shortcut:** `/` focuses the search field when the panel is focused —
  but the app already uses `Ctrl/Cmd+F` (notes/canvas search) and `Ctrl/Cmd+K`
  (DSA palette), so **do not** reuse those.
- **Persisted count:** keep the panel header showing the grand total while the
  section headers show filtered counts (see note in §4).

---

## 8. Verify

```bash
npx tsc -b      # must pass
```
Then in the app:
- **Visualizer** → type in the search field → list narrows; clear via `X`/`Esc`;
  drag/click and the book icon still work on the filtered rows.
- **Canvas Structures panel** → same, across both "data structures" and
  "algorithms" sections; empty state shows for a no-match query.

---

## 9. Files touched

- **New:** `src/components/SearchField.tsx`
- **Edit:** `src/components/AlgorithmSidebar.tsx` (state + filter + field + empty state)
- **Edit:** `src/components/StructuresPanel.tsx` (state + filter + field + empty state)
- **Optional:** a `matchesQuery` helper in `src/lib/` (or inline in each panel)
