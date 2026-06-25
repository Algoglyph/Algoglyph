# Algorithm Doc Panel — Implementation Playbook

A hand-off spec for replicating the "book" documentation feature across every
algorithm in the Visualizer. Built first for **Linear Search**; this document is
the recipe for doing the rest to the same standard.

---

## 1. What the feature is

Each algorithm card in the Visualizer sidebar shows a **book icon** to the left
of its complexity badge. Clicking it opens a **right-hand panel** documenting
that algorithm. The panel is:

- **Resizable** — drag its left edge (320–640px).
- **Collapsible** — header button, or `Esc`.
- **Content** — a signature animated *hero*, then a tagline, an idea paragraph,
  numbered **How it works** steps, a **Complexity** table, **Reach for it when**
  and **Watch out** bullets, and a **Reference** code block.

The animated hero is the one part that must be authored per-algorithm. Prose is
data; the hero is a tiny component.

---

## 2. Files & responsibilities

| File | Role |
|---|---|
| `src/config/algorithmDocs.ts` | Content registry (data only). One entry per algorithm `id`. **The book icon appears automatically for any id present here.** |
| `src/components/DocSidebar.tsx` | The panel: header, collapse, resize, hero slot, section rendering. |
| `src/components/AlgorithmSidebar.tsx` | Renders the book icon per card (`hasAlgorithmDoc(id) && !isMobile`), calls `onOpenDoc(id)`. |
| `src/components/VisualizerWorkspace.tsx` | Owns `docId` state; renders `<DocSidebar>` when `docId` is set and not mobile. |
| `src/config/algorithms.ts` | The catalog. `id` in `algorithmDocs.ts` **must** match an `id` here. |

Do not change `AlgorithmSidebar` / `VisualizerWorkspace` / the panel mechanics —
they already handle every algorithm generically. You only add (a) a doc entry
and (b) optionally a hero component.

---

## 3. Data model

```ts
export interface ComplexityRow { label: string; value: string; note: string }

export interface AlgorithmDoc {
  id: string;          // must equal the algorithms.ts id
  tagline: string;     // one sentence capturing the whole idea
  idea: string;        // a short paragraph: what it is, why reach for it
  steps: string[];     // the algorithm as an ordered sequence of plain steps
  complexity: ComplexityRow[];  // Best / Average / Worst / Space
  useWhen: string[];   // when this is the right tool
  watchOut: string[];  // pitfalls / when to prefer something else
  code: string;        // a compact, readable reference implementation
}
```

TypeScript enforces every field on every entry — `npx tsc -b` fails if one is
missing. That is the safety net.

---

## 4. Adding a doc entry (the prose)

Add to `ALGORITHM_DOCS` keyed by the algorithm id:

```ts
'binary-search': {
  id: 'binary-search',
  tagline: 'Halve the search space on every comparison …',
  idea: 'Binary search maintains two pointers …',
  steps: ['Set lo = 0, hi = n−1.', 'Inspect the middle …', …],
  complexity: [
    { label: 'Best',    value: 'O(1)',     note: 'target is the midpoint' },
    { label: 'Average', value: 'O(log n)', note: 'halving each step' },
    { label: 'Worst',   value: 'O(log n)', note: 'target absent' },
    { label: 'Space',   value: 'O(1)',     note: 'iterative, in place' },
  ],
  useWhen: [ … ],
  watchOut: [ … ],
  code: `int binarySearch(...) { … }`,
},
```

**Writing rules** (these make the copy not read as templated):

- Second person, active voice. "You" the reader, not "the system".
- Numbered `steps` only because the algorithm genuinely **is** a sequence.
- Use a real em dash `—`, not `--`; use `…` not `...`; curly quotes in prose.
- Keep one consistent language across `code` blocks (the repo's runner defaults
  to C++ — prefer C++ unless the algorithm reads clearer in another language;
  do not mix randomly).
- `complexity` is always the four rows Best / Average / Worst / Space.

---

## 5. Adding the signature hero (the per-algorithm visual)

The hero is the panel's thesis: the **one characteristic motion** of the
algorithm, as a small, deterministic, on-subject animation. Linear Search hops a
scan highlight cell-to-cell until it lands on the match. Each algorithm needs its
own defining move:

- Binary Search → a `[lo … hi]` window collapsing by half each step.
- BFS → concentric "rings" lighting outward from the source.
- DP (knapsack/LIS/LCS) → a grid/table filling cell by cell.
- Sorting → bars settling into order (reuse the visualizer's bar language).

### Non-negotiable rules (from the web-interface guidelines)

1. **Animate `transform` / `opacity` only** — never `left/top/width/height`.
   (Linear Search uses staggered **opacity**, which is also responsive without
   measuring pixels.)
2. **Respect `prefers-reduced-motion`** via `useReducedMotion()` — no autoplay,
   render the resting/solved state, and hide the play control.
3. Decorative motion elements get `aria-hidden`.
4. Palette: dark surface `bg-black/40 ring-1 ring-white/[0.06]`, **emerald**
   (`#10b981` / `emerald-400`) as the single accent, zinc for idle.

### Play / pause control (required)

Autoplay **once** when the panel opens, then **stop on completion**; the user
drives every replay (one run per click). Stop with a **deterministic timer** —
framer-motion's `onAnimationComplete` on a delayed keyframe is unreliable.

```tsx
const reduce = useReducedMotion();
const [playing, setPlaying] = useState(!reduce);   // autoplay once unless reduced
const [runId, setRunId]   = useState(0);            // bump to remount + replay

useEffect(() => {                                   // stop after the known run length
  if (!playing || reduce) return;
  const ms = (RUN_DURATION_SECONDS) * 1000 + 120;
  const t = setTimeout(() => setPlaying(false), ms);
  return () => clearTimeout(t);
}, [playing, runId, reduce]);

const replay = () => { setRunId(r => r + 1); setPlaying(true); };

// Row remounts on replay so animations restart from their initial frame:
<div key={runId}> … animated cells gated on `playing && !reduce` … </div>

// Button (only when !reduce):
<button onClick={playing ? () => setPlaying(false) : replay}
        aria-label={playing ? 'Pause scan' : 'Play scan'}>
  {playing ? <Pause size={12}/> : <Play size={12}/>}
</button>
```

### Wiring a hero into the panel

In `DocSidebar.tsx` the hero is currently a single line:

```tsx
{algorithmId === 'linear-search' && <LinearScanHero isDark={isDark} />}
```

Replace it with a lookup so each id maps to its own hero (ids without one simply
render no hero — the prose still shows, which is acceptable):

```tsx
const HERO: Record<string, React.FC<{ isDark: boolean }>> = {
  'linear-search': LinearScanHero,
  'binary-search': BinarySearchHero,
  // …add as you build them
};
const Hero = HERO[algorithmId];
{Hero && <Hero isDark={isDark} />}
```

---

## 6. Panel mechanics (already done — reuse, don't rebuild)

- **Resize**: left-edge handle; on mousedown capture `parent.getBoundingClientRect().right`, then `width = right − clientX`, clamped `[320, 640]`.
- **Collapse**: header button + a `keydown` listener for `Escape`, both calling `onClose` (which sets `docId = null` in the workspace).
- **Entrance**: framer spring on `x` + `opacity`, skipped under reduced motion.
- **Scroll body**: `overflow-y-auto overscroll-contain`.
- **Header title**: `min-w-0 truncate` so long names don't overflow.

---

## 7. Accessibility / guideline checklist (per doc + hero)

- [ ] Book icon button has `aria-label="Read about <Name>"`.
- [ ] Book icon hidden on mobile (`!isMobile`) — the panel is desktop-only.
- [ ] Card is keyboard-operable (it's a `role="button"` div with Enter/Space + a focus ring) — don't nest a `<button>` inside another `<button>`.
- [ ] Hero motion is `transform`/`opacity` only and `aria-hidden`.
- [ ] `prefers-reduced-motion` respected; play control hidden when reduced.
- [ ] Em dashes / `…` / curly quotes in prose.

---

## 8. Verify

```bash
npx tsc -b          # must pass — proves every doc entry is complete
```

Then in the Visualizer: click a book icon → panel opens with the content →
resize via the left edge → collapse via the header button and `Esc` → play/pause
the hero (plays once, stops, replays on click).

---

## 9. Current status (what's done vs left)

- **Done:** prose docs for all ~64 algorithms; the panel, book icon, resize,
  collapse, and the Linear Search hero with play/pause.
- **Left for you:** a per-algorithm **hero** for everything except Linear Search
  — today those docs open as text only. Build heroes following §5, wire them via
  the `HERO` map in §5.
