# AlgoGlyph Hero — Build Guide (modeled on composio.dev)

> Reverse-engineered from **https://composio.dev/** with Playwright (live computed styles, WebGL detection, canvas/DOM inspection) and planned with the `frontend-design` taste method. Goal: an AlgoGlyph hero that reads as the *same class of product page* as Composio — dark, confident, "tooling for builders" — but grounded in AlgoGlyph's own subject instead of cloning a generic template.

---

## 0. TL;DR

Composio's hero is: **`#0F0F0F` full-height section → animated WebGL "equalizer" field bleeding off both edges → one giant tight grotesque headline → 50%-opacity subtitle → two sharp-cornered mono buttons → grayscale logo cloud.** Everything decorative is the moving background; everything else is disciplined and quiet.

For AlgoGlyph, keep that exact skeleton but **replace the abstract equalizer with the real thing AlgoGlyph does** — a live sorting/array-bar visualizer as ambient background — and recolor from Composio's blue→green spectrum to **AlgoGlyph green**. The background stops being decoration and becomes a demo of the product. That's the whole move.

---

## 1. What Composio actually does (measured, not guessed)

### 1.1 Section shell
| Property | Value |
|---|---|
| Hero `<section>` classes | `dark relative flex min-h-dvh flex-col items-center` |
| Background color | `#0F0F0F` (near-black, **not** pure black) |
| Height | `min-height: 100dvh` — full first screen |
| Content width | inner column `max-w-page` ≈ **1240px**, centered |
| Background layer | full-bleed: `absolute inset-y-0 -left-[50vw] -right-[50vw]` so the canvas extends **past** the content column to both viewport edges |

### 1.2 The animated background — it's a WebGL canvas
- A single `<canvas>` (measured 1440×644), rendered with a **WebGL context** (confirmed: `getContext('2d')` is null, `getContext('webgl')` is live).
- Visually: thousands of thin **vertical bars** arranged in **diagonal perspective streams** flowing inward from the top-left and top-right corners. Bar heights animate like an audio spectrum/equalizer. It fades to black toward the center so text stays legible.
- Palette (sampled from the render): deep indigo `#3B4CC0` → blue `#2E5BFF` → cyan `#22D3EE` → green `#22C55E`, brightest at the corners, dying out in the middle.

> **You do not need WebGL to reproduce the *feel*.** A Canvas-2D array-bar animation gets you 90% of the impact at a fraction of the complexity — and for AlgoGlyph it's literally the product. Section 5 gives a drop-in component.

### 1.3 Typography (exact computed values)
| Role | Family (Composio) | Size / Weight / Tracking / LH |
|---|---|---|
| Headline `<h1>` | `abcDiatype` (grotesque sans) | **64px / 400 / -1.6px / 64px** (LH = 1.0, two centered lines) |
| Subtitle | `abcDiatype` | 18px / 400 / **white @ 50% opacity** / LH 1.2 |
| Nav, buttons, labels | **`JetBrains Mono`** | 14px / uppercase (literal caps) / tracking -0.154px |
| Card/terminal labels | `JetBrains Mono` | 12–14px, e.g. `COMPOSIO_SEARCH_TOOLS` |

Two things make it feel expensive: (1) the headline is only **weight 400** — the presence comes from *size + tight -0.025em tracking + white-on-black*, not bold; (2) **every piece of chrome is uppercase monospace**. That mono/grotesque split is the signature.

### 1.4 Buttons — sharp, flat, mono
| | Primary | Secondary |
|---|---|---|
| Background | `#FFFFFF` | transparent |
| Text | `#000000` | `#FFFFFF` |
| Border | none | `1px solid rgba(255,255,255,0.30)` |
| Radius | **`0px`** (fully sharp) | `0px` |
| Padding | `10px 16px` | `10px 16px` |
| Font | JetBrains Mono 14px, caps | same |

### 1.5 Below the CTAs
Grayscale **logo cloud** (~40% opacity, HubSpot / wabi / agent.ai / Zoom…), then dark feature cards with terminal-style mono headers. Out of scope for the hero itself, but the mono-label motif carries down the whole page — copy it for continuity.

---

## 2. Design thesis for AlgoGlyph (applying the taste method)

The `frontend-design` rule that matters most here: **ground the hero in the subject's own world; the hero is a thesis.** Composio's subject is "agents taking action," so their abstract flowing-data field is a metaphor. AlgoGlyph's subject is **watching algorithms run** — sorting bars, graph traversals, DP tables. So AlgoGlyph should not borrow a metaphor; it should put the *actual product* behind the headline.

**Signature element (the one thing this page is remembered by):** a live, ambient **sorting visualizer** as the hero background — bars in the classic unsorted-grey → comparing → **sorted-green** states, endlessly running a slowed-down sort. It is unmistakably AlgoGlyph, it can't be mistaken for Composio, and it reuses a concept the codebase already renders in `Visualizers.tsx`.

**Spend boldness in one place:** the moving bars are the whole show. Headline, subtitle, and buttons stay quiet and disciplined — exactly like Composio.

---

## 3. Token mapping: Composio → AlgoGlyph

Your repo already has a dedicated landing namespace (`[data-landing-theme]` → `--lp-*` in `src/index.css`). Extend it — don't touch the app tokens.

```css
/* src/index.css — inside [data-landing-theme] { … } */

/* Surface (matches Composio's #0F0F0F, warmer than pure black) */
--lp-hero-bg:        #0B0F0D;   /* near-black with a faint green cast */
--lp-hero-ink:       #FFFFFF;   /* headline */
--lp-hero-sub:       rgba(255,255,255,0.55);  /* subtitle */

/* AlgoGlyph green spectrum (replaces Composio blue→cyan→green) */
--ag-green-deep:     #064E3B;   /* far, dim bars */
--ag-green-core:     #10B981;   /* mid */
--ag-green-bright:   #34D399;   /* active / comparing */
--ag-green-mint:     #6EE7B7;   /* peaks */
--ag-green-glow:     #22C55E;   /* "sorted" flash */
--ag-bar-idle:       rgba(255,255,255,0.10); /* unsorted bars */

/* CTA — keep Composio's flat sharp treatment */
--lp-cta-fg:         #06120C;
--lp-cta-bg:         #FFFFFF;   /* OR flip to green fill: #22C55E on black */
--lp-cta-ghost-border: rgba(255,255,255,0.28);
```

**Fonts — do NOT copy Composio's.** `abcDiatype`, `Roobert`, and `Flecha` are commercial trial faces (they're literally serving `*_TRIAL` files). Use free equivalents that hit the same grotesque + mono split:

| Composio role | Free swap | Why |
|---|---|---|
| `abcDiatype` display | **Geist** or **Space Grotesk** | Same neo-grotesque presence; Geist matches your existing Vercel/Geist token look |
| `JetBrains Mono` chrome | **JetBrains Mono** (already loaded per `document.fonts`) | Keep it — it's open-source (OFL) |

---

## 4. Hero structure (React + Tailwind v4, repo conventions)

Mirror Composio's DOM: full-bleed canvas behind a centered, max-width content column.

```tsx
// src/components/landing/Hero.tsx
import { SortingField } from './SortingField';

export function Hero() {
  return (
    <section
      data-landing-theme
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--lp-hero-bg)' }}
    >
      {/* full-bleed animated field, bleeds past the content column like Composio */}
      <div className="pointer-events-none absolute inset-y-0 -left-[20vw] -right-[20vw]">
        <SortingField />
        {/* center vignette so the headline stays legible over the bars */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 45%, var(--lp-hero-bg) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* content column */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-col items-center px-6 text-center">
        <h1
          className="text-white"
          style={{
            fontFamily: '"Space Grotesk", Geist, system-ui, sans-serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', // 40 → 64px
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: '-0.025em',
          }}
        >
          See every algorithm
          <br />
          the moment it runs
        </h1>

        <p
          className="mt-6 max-w-xl"
          style={{
            color: 'var(--lp-hero-sub)',
            fontSize: '1.125rem',
            lineHeight: 1.4,
          }}
        >
          A local-first canvas for DSA practice — notes, drawings, code, and
          step-by-step visualizers for sorting, graphs, and DP in one workspace.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a className="lp-cta lp-cta--solid" href="/app">Open the workspace</a>
          <a className="lp-cta lp-cta--ghost" href="#visualizers">See a visualizer</a>
        </div>
      </div>
    </section>
  );
}
```

```css
/* CTA styles — Composio's flat, sharp, mono treatment */
.lp-cta {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 14px;
  letter-spacing: -0.011em;
  text-transform: uppercase;
  padding: 11px 18px;
  border-radius: 0;              /* sharp corners — the Composio tell */
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.lp-cta--solid { background: var(--lp-cta-bg); color: var(--lp-cta-fg); }
.lp-cta--ghost { background: transparent; color: #fff; border: 1px solid var(--lp-cta-ghost-border); }
.lp-cta:hover  { transform: translateY(-1px); }
.lp-cta--ghost:hover { border-color: rgba(255,255,255,0.55); }
@media (prefers-reduced-motion: reduce) { .lp-cta { transition: none; } }
```

---

## 5. The signature: a live sorting field (drop-in Canvas 2D)

This is the AlgoGlyph analog of Composio's equalizer — but it's a real, slowed-down sort looping forever. Canvas 2D, no WebGL, `requestAnimationFrame`, respects reduced motion, and pauses when off-screen. It's intentionally *ambient* (behind a vignette), so it stays readable.

```tsx
// src/components/landing/SortingField.tsx
import { useEffect, useRef } from 'react';

export function SortingField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0, w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const BARS = 96;
    let vals = Array.from({ length: BARS }, () => Math.random());
    let i = 0, j = 0;                            // bubble-sort state
    const sortedTo = BARS;
    let sortedFlash = -1;

    const css = getComputedStyle(document.documentElement);
    const idle   = css.getPropertyValue('--ag-bar-idle').trim()    || 'rgba(255,255,255,.10)';
    const active = css.getPropertyValue('--ag-green-bright').trim() || '#34D399';
    const core   = css.getPropertyValue('--ag-green-core').trim()   || '#10B981';
    const glow   = css.getPropertyValue('--ag-green-glow').trim()   || '#22C55E';

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    const step = () => {                          // one comparison per tick
      if (j >= sortedTo - 1 - i) { j = 0; i++; }
      if (i >= sortedTo - 1) {                     // pass complete → flash & reshuffle
        sortedFlash = performance.now();
        vals = Array.from({ length: BARS }, () => Math.random());
        i = 0; j = 0;
      } else {
        if (vals[j] > vals[j + 1]) [vals[j], vals[j + 1]] = [vals[j + 1], vals[j]];
        j++;
      }
    };

    let last = 0;
    const draw = (t: number) => {
      if (t - last > 55) { step(); last = t; }     // slow, ambient cadence
      ctx.clearRect(0, 0, w, h);
      const gap = 2, bw = (w / BARS) - gap, base = h * 0.92;
      const flashOn = performance.now() - sortedFlash < 700;
      for (let k = 0; k < BARS; k++) {
        const bh = vals[k] * h * 0.7;
        const comparing = k === j || k === j + 1;
        ctx.fillStyle = flashOn ? glow : comparing ? active : k % 3 === 0 ? core : idle;
        ctx.globalAlpha = comparing || flashOn ? 0.9 : 0.5;
        ctx.fillRect(k * (bw + gap), base - bh, bw, bh);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    if (reduce) {                                 // static, sorted, no motion
      vals.sort((a, b) => a - b);
      requestAnimationFrame((t) => { draw(t); cancelAnimationFrame(raf); });
    } else {
      raf = requestAnimationFrame(draw);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="h-full w-full" />;
}
```

**Ambient variations** (pick one to be *the* signature, don't stack them):
- **Bubble/insertion sort** (above) — calm, readable, classic.
- **Graph BFS ripple** — reuse `TRAVERSAL_GRAPH` from `algorithmFrames.ts`; nodes light green outward from a source. More "CS," less obvious than bars.
- **Perspective streams** — to echo Composio more literally, tilt the bars with a `ctx.transform` skew so they flow diagonally from the corners; keep the center vignette.

---

## 6. Copy (write from the user's side of the screen)

| Slot | Draft | Note |
|---|---|---|
| Headline | *"See every algorithm the moment it runs"* | Names the payoff, not the tech. Two tight lines like Composio. |
| Subtitle | *"A local-first canvas for DSA practice — notes, drawings, code, and step-by-step visualizers in one workspace."* | Concrete feature list, ~2 lines, 55% opacity. |
| Primary CTA | **OPEN THE WORKSPACE** | Says exactly what happens (Composio: "GET STARTED FOR FREE"). |
| Ghost CTA | **SEE A VISUALIZER** | Low-commitment second action (Composio: "GET A DEMO"). |
| Eyebrow (optional, mono) | `LOCAL-FIRST · NO SIGN-IN · RUNS OFFLINE` | Reuses the uppercase-mono motif; encodes something true. |

Keep button verbs consistent through the flow (an "OPEN THE WORKSPACE" button should land you *in* the workspace, not a signup wall).

---

## 7. Quality floor (do these before calling it done)
- **Responsive:** headline `clamp(2.5rem, 6vw, 4rem)`; stack CTAs on mobile; cap `BARS` lower (~48) under 640px for perf.
- **Reduced motion:** field renders one static sorted frame (already handled above); CTA transitions disabled.
- **Perf:** `dpr` capped at 2; pause the RAF loop when the hero scrolls out of view (add an `IntersectionObserver`).
- **Keyboard focus:** visible focus ring on both CTAs (don't remove outlines).
- **Legibility:** verify WCAG AA for the white subtitle over the *brightest* bar region — the center vignette is what guarantees it; keep it.
- **Electron:** this is landing-only. Per `App.tsx`, the landing never renders in Electron (`isLandingActive = !isElectron`), so the hero ships web-only — no desktop regression risk.

---

## 8. Build order
1. Add the `--lp-hero-*` and `--ag-green-*` tokens to `[data-landing-theme]` in `src/index.css`.
2. Load **Space Grotesk** (display) + confirm **JetBrains Mono** (chrome) are self-hosted/`@font-face`d — don't rely on Google Fonts at runtime for a local-first app.
3. Build `SortingField.tsx`, verify it animates + honors reduced motion in isolation.
4. Build `Hero.tsx`; drop it at the top of `LandingPage.tsx`.
5. Add the `.lp-cta` styles.
6. Screenshot at 1440 / 768 / 375, check the vignette keeps text legible, and remove one thing (Chanel rule) before shipping.

---

### What to copy vs. what to change — one line
**Copy** the shell: `#0F0F0F`-class dark, `min-h-dvh`, full-bleed animated field, tight 64/1.0/-0.025em grotesque headline, 50%-opacity subtitle, flat sharp mono CTAs, uppercase-mono chrome.
**Change** the soul: swap Composio's abstract blue equalizer for AlgoGlyph's **green live-sorting field** — the product *is* the background — and use free fonts (Space Grotesk + JetBrains Mono) instead of their trial faces.
