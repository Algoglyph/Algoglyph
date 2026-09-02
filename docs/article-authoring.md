# AlgoGlyph Article Authoring

The authoritative article body is a Markdown file at:

```text
content/<topic>/<public-slug>.md
```

`<topic>` is the authoritative editorial topic folder. DSA articles use `content/dsa/`; other topics currently retain their roadmap-zone folder until their own migration phase. Do not create subtopic folders. Do not copy article bodies into TypeScript, JSON, HTML, or scratch datasets. `npm run content:index` derives `src/generated/articleContent.ts` from the canonical Markdown files for the browser and production SEO build.

## Adding or updating an article

1. Choose the primary roadmap zone directory for the article. The file must sit directly under that one folder, with no nested category/subcategory directory.
2. Name the file with the stable public article slug in lowercase kebab-case.
3. Add the matching editorial/SEO metadata and roadmap placement in the existing configuration when creating a new public article. Moving an existing file between topic directories does not change its route because routes use the slug and roadmap metadata, not the physical content path.
4. Run `npm run content:index` after editing Markdown.
5. Run `npm run test:content`, `npm run test:seo`, and `npm run build` before shipping.

Use `npm run content:inventory` to compare the Markdown corpus against the full roadmap article inventory. For the normalized DSA-only inventory, use `npm run content:inventory:dsa`; its strict counterpart requires an exact match under `content/dsa/`. `npm run content:inventory:strict` remains the final all-topic corpus gate.

## Canonical structure

Use one source H1 followed by these eight semantic H2 stages:

1. Historical Context & Motivation
2. Core Mathematical Invariants
3. Step-by-Step Execution Trace
4. Production-Ready Implementations
5. Asymptotic Time & Space Complexity
6. Systems Connections
7. Practice Checklist
8. Frequently Asked Questions

The stages organize subject-specific material; they are not a template for filler. Adapt theoretical or non-algorithmic material honestly, and never label a toy implementation as production-ready.

## Supported Markdown and math

- Use H1 through H3 only.
- Use fenced code labels `text`, `cpp`, `python`, `javascript`, or `svg`.
- Use `$...$` for inline math and `$$...$$` for display math.
- Do not use `\(...\)`, `\[...\]`, `\label`, `\ref`, or `\eqref`.
- Raw or fenced SVG may contain declarative SVG elements only. Never add scripts, event handlers, or `foreignObject`.

## Visual mapping

The public slug is the deterministic primary-image key. DSA/theoretical articles resolve to:

```text
public/images/dsa/<public-slug>-dark.png
```

with `.jpg` as the existing fallback. Inline SVGs may remain in the article when they explain a trace, invariant, hierarchy, or protocol. Do not add decorative visuals merely to satisfy a quota.

## SEO and URLs

The physical topic directory is not part of the public URL. Existing public routes, canonical URLs, descriptions, Open Graph/Twitter metadata, breadcrumbs, schema, and sitemap entries continue to come from the roadmap and article metadata configuration. Do not change a slug casually; a slug change is a public URL migration and requires redirect and canonical review.
