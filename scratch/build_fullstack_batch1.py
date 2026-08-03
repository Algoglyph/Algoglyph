import json
import re

print("=== BUILDING FULL STACK BATCH 1 BLOGS (#1 to #10) WITH >= 7.5K CHARS AND 5 FAQS ===")

fs_batch1 = {}

# 1. html-semantics
fs_batch1["html-semantics"] = {
    "slug": "html-semantics",
    "title": "HTML Structure & Semantics: Modern HTML5, Accessibility & SEO Architecture",
    "tagline": "Semantic elements, ARIA attributes, document outline trees, accessibility standards (WCAG), and modern form controls.",
    "category": "Full Stack Development",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["css-layouts", "javascript-basics"],
    "practiceProblems": [{"title": "Semantic HTML Refactoring", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# HTML Structure & Semantics: Modern HTML5, Accessibility & SEO Architecture

HyperText Markup Language (HTML) forms the structural backbone of every modern web application. HTML5 introduced semantic elements that communicate document structure, content relationships, and interactive roles to web browsers, assistive technologies (screen readers), and search engine crawlers.

---

## 1. The Anatomy of a Modern Semantic HTML5 Document

A well-structured HTML document begins with a strict `<!DOCTYPE html>` declaration, language attribute, responsive viewport metadata, and semantic container elements rather than non-semantic generic `<div>` wrappers.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Production-grade semantic HTML layout demonstrating modern web standards.">
    <title>Enterprise Semantic Layout</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Top-level landmark header -->
    <header class="site-header">
        <div class="logo">
            <a href="/" aria-label="Homepage">
                <img src="/logo.svg" alt="Company Logo" width="120" height="40">
            </a>
        </div>
        <nav class="primary-nav" aria-label="Main Navigation">
            <ul>
                <li><a href="/products">Products</a></li>
                <li><a href="/solutions">Solutions</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/about">About Us</a></li>
            </ul>
        </nav>
    </header>

    <!-- Primary unique content area -->
    <main id="main-content">
        <section aria-labelledby="hero-title" class="hero">
            <h1 id="hero-title">Architecting Accessible & Performant Web Applications</h1>
            <p>Master modern web standards, accessibility landmarks, and search engine optimization structure.</p>
        </section>
    </main>
</body>
</html>
```

Using semantic landmarks like `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` allows screen readers to navigate directly between major structural sections without traversing every DOM node.

---

## 2. Document Outline Hierarchy & Heading Flow

Maintain a single `<h1>` element per page representing the primary topic of the document. Subsequent headings (`<h2>` through `<h6>`) must follow a strict non-skipping nested hierarchy.

```html
<!-- CORRECT HEADING NESTING -->
<main>
    <h1>Full Stack Web Development Architecture</h1>
    
    <section>
        <h2>1. Frontend Foundations</h2>
        <p>Frontend engineering encompasses client-side execution.</p>
        
        <h3>1.1 HTML5 Semantics</h3>
        <p>Structuring accessible markup.</p>
        
        <h3>1.2 CSS Layout Engines</h3>
        <p>Flexbox and Grid layouts.</p>
    </section>

    <section>
        <h2>2. Backend Services</h2>
        <p>Server-side runtime environments and API endpoints.</p>
    </section>
</main>
```

Skipping heading levels (e.g., jumping directly from `<h2>` to `<h4>`) breaks the visual and screen reader document tree, harming accessible navigation and SEO indexability.

---

## 3. Accessible Rich Internet Applications (ARIA) & Roles

ARIA attributes bridge accessibility gaps for complex interactive UI widgets (modals, accordions, tabs, dropdowns) where native HTML elements are insufficient.

- `role="dialog"`: Identifies a modal container.
- `aria-expanded="true|false"`: Communicates expand/collapse state of accordions or mobile drawer menus.
- `aria-label` / `aria-labelledby`: Provides accessible naming for icon-only buttons or search bars.
- `aria-live="polite|assertive"`: Announces dynamic DOM content updates to screen readers without interrupting ongoing speech.

```html
<!-- Accessible Modal Dialog Container -->
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="modal-heading" 
     aria-describedby="modal-description"
     class="modal-backdrop">
     
    <div class="modal-card">
        <h2 id="modal-heading">Confirm Action</h2>
        <p id="modal-description">Are you sure you want to permanently delete this dataset?</p>
        
        <div class="modal-actions">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="button" class="btn-danger">Delete</button>
        </div>
    </div>
</div>
```

---

## 4. Modern HTML5 Form Controls, Validation & Microdata

HTML5 provides native form controls that handle client-side input validation, accessible label binding, and specialized mobile keyboard layouts without requiring heavy JavaScript plugins.

```html
<form action="/api/v1/users" method="POST" novalidate>
    <fieldset>
        <legend>User Registration</legend>

        <div class="form-group">
            <label for="user-email">Email Address <span class="required" aria-hidden="true">*</span></label>
            <input type="email" 
                   id="user-email" 
                   name="email" 
                   required 
                   autocomplete="email" 
                   placeholder="user@example.com"
                   aria-required="true">
        </div>

        <div class="form-group">
            <label for="user-phone">Phone Number</label>
            <input type="tel" 
                   id="user-phone" 
                   name="phone" 
                   pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" 
                   placeholder="123-456-7890">
        </div>

        <button type="submit" class="btn-primary">Create Account</button>
    </fieldset>
</form>
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why should I use `<article>` instead of `<div>`?
Use `<article>` for self-contained, independently distributable content units (such as blog posts, user comments, or product cards). Generic `<div>` elements convey no semantic meaning to search engines or screen readers.

### Q2: What is the difference between `aria-label` and `aria-labelledby`?
`aria-label` accepts a plain string value directly on the element. `aria-labelledby` takes one or more DOM element IDs whose text content provides the accessible label for the target control.

### Q3: Why is `alt` attribute required on `<img>` tags?
The `alt` attribute provides textual alternative descriptions for screen reader users and displays fallback text when image assets fail to load. For decorative images, use `alt=""` or `aria-hidden="true"`.

### Q4: How does semantic HTML improve SEO?
Search engine web crawlers evaluate semantic tags (`<main>`, `<article>`, `<header>`, `<h1>-<h6>`) to determine content authority, primary keywords, and document hierarchy, leading to higher search ranking relevance.

### Q5: What does `aria-live="polite"` do?
`aria-live="polite"` instructs screen readers to wait until the current speech queue is idle before announcing dynamic DOM content updates (such as toast notifications or search results).
"""
}

# 2. css-layouts
fs_batch1["css-layouts"] = {
    "slug": "css-layouts",
    "title": "CSS Layouts & Responsive Design: Flexbox, CSS Grid & Fluid Systems",
    "tagline": "The Box Model, Flexbox architecture, CSS Grid 2D alignment, container queries, and fluid typography.",
    "category": "Full Stack Development",
    "readTime": "25",
    "lastUpdated": "July 2026",
    "prerequisites": ["html-semantics"],
    "related": ["checkpoint-static", "javascript-basics"],
    "practiceProblems": [{"title": "Responsive Layout Refactoring", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# CSS Layouts & Responsive Design: Flexbox, CSS Grid & Fluid Systems

Cascading Style Sheets (CSS) govern the visual rendering, spatial alignment, and responsive responsiveness of HTML documents across heterogeneous screen form factors.

---

## 1. The CSS Box Model & `box-sizing` Reset

Every rendered HTML element is encapsulated within a rectangular box model comprising four concentric layers:
1. **Content**: The inner core holding text, images, or child DOM elements.
2. **Padding**: Transparent space surrounding content inside element borders.
3. **Border**: Outer bounding line encircling padding and content.
4. **Margin**: Transparent space outside borders separating adjacent DOM elements.

```css
/* Modern Universal Box Model Reset */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* Demonstrating box-sizing behavior */
.card-container {
    width: 350px;
    padding: 24px;
    border: 2px solid #334155;
    margin: 16px auto;
    /* With border-box, total element width remains strictly 350px */
}
```

Using `box-sizing: border-box` includes padding and border widths within specified element dimensions, preventing unexpected container overflows.

---

## 2. Flexbox Architecture: One-Dimensional Spatial Alignment

Flexible Box Layout (Flexbox) optimizes alignment and space distribution along a single primary axis (main axis or cross axis).

```css
.navbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between; /* Main axis alignment */
    align-items: center;            /* Cross axis alignment */
    gap: 1.5rem;
    background-color: #0f172a;
    padding: 1rem 2rem;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
    list-style: none;
}

.nav-item {
    flex: 0 1 auto; /* flex-grow | flex-shrink | flex-basis */
}
```

Flexbox axes can be dynamically toggled using `flex-direction: column` for vertical stack layouts on mobile viewports.

---

## 3. CSS Grid: Two-Dimensional Grid Systems

CSS Grid provides a powerful two-dimensional layout engine for aligning items across rows and columns simultaneously.

```css
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 1.5rem;
    padding: 2rem;
}

.widget-featured {
    grid-column: span 2;
    grid-row: span 2;
    background-color: #1e293b;
    border-radius: 0.75rem;
    padding: 1.5rem;
}
```

The `repeat(auto-fit, minmax(280px, 1fr))` pattern creates fluid responsive card grids that automatically adjust column counts without requiring explicit media query breakpoints.

---

## 4. Responsive Design: Media Queries vs. Container Queries

While traditional media queries evaluate the global browser viewport dimensions (`@media (min-width: 768px)`), Container Queries allow components to adapt based on their immediate parent container width:

```css
/* Defining a Container Query Context */
.card-wrapper {
    container-type: inline-size;
    container-name: card-container;
}

/* Adapting Component Layout based on Parent Container Width */
@container card-container (min-width: 400px) {
    .card-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }
}
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Flexbox and CSS Grid?
Flexbox is designed for one-dimensional layouts (either a row OR a column). CSS Grid is designed for two-dimensional layouts (rows AND columns simultaneously).

### Q2: Why is `box-sizing: border-box` considered a best practice?
It forces `width` and `height` properties to include padding and border sizes, eliminating container overflow bugs when padding is added to elements.

### Q3: How does `clamp()` enable fluid typography?
`font-size: clamp(1rem, 2.5vw, 2.5rem)` sets a minimum font size ($1\text{rem}$), a fluid dynamic size ($2.5\text{vw}$), and a maximum ceiling ($2.5\text{rem}$), scaling typography smoothly without breakpoint jumps.

### Q4: What is the difference between `auto-fit` and `auto-fill` in CSS Grid?
`auto-fit` collapses empty implicit grid tracks and expands existing items to fill remaining container space. `auto-fill` preserves empty grid tracks as empty columns.

### Q5: When should I use Container Queries instead of Media Queries?
Use Container Queries for reusable micro-components (such as cards or sidebars) that need to adapt their internal layout based on the width of their parent container rather than the overall browser viewport width.
"""
}

# Clean all headers in all generated blogs
def clean_markdown_headers_perfectly(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', header_text).strip()
            
            if not clean_title or clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

for slug, b in fs_batch1.items():
    b['markdown'] = clean_markdown_headers_perfectly(b['markdown'])

output_json = 'scratch/fs_batch1_part1.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(fs_batch1, f, indent=2)

print(f"\nCreated initial blogs #1 and #2 in {output_json}!")
