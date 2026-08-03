import json
import re

print("=== BUILDING ALL 10 FULL STACK BATCH 1 BLOGS (#1 to #10) WITH >= 7.5K CHARS AND 5 FAQS ===")

with open('scratch/build_fullstack_batch1.py', 'r', encoding='utf-8') as f:
    text = f.read()

scope = {}
exec(text, scope)
fs_batch1 = scope['fs_batch1']

# 3. checkpoint-static
fs_batch1["checkpoint-static"] = {
    "slug": "checkpoint-static",
    "title": "Checkpoint - Static Webpages Project: Architectural Layouts, BEM CSS & Performance",
    "tagline": "Building production static landing pages with semantic HTML5, BEM CSS naming conventions, and performance optimization.",
    "category": "Full Stack Development",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["css-layouts"],
    "related": ["javascript-basics", "npm-ecosystem"],
    "practiceProblems": [{"title": "Static Webpage Optimization", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Checkpoint - Static Webpages Project: Architectural Layouts, BEM CSS & Performance

Static webpages serve as the foundational bedrock of modern web development. Building production-grade static sites requires integrating semantic HTML markup, structured Block-Element-Modifier (BEM) CSS design systems, accessible typography, and web performance optimization techniques.

---

## 1. Project Architecture & Directory Structuring

Organizing static web projects into predictable, modular directory hierarchies accelerates maintainability and build pipeline integration.

```
project-root/
├── index.html
├── about.html
├── assets/
│   ├── images/
│   │   ├── hero-banner.avif
│   │   └── logo.svg
│   └── icons/
├── css/
│   ├── base.css
│   ├── components/
│   │   ├── button.css
│   │   ├── card.css
│   │   └── navbar.css
│   └── main.css
└── js/
    └── main.js
```

---

## 2. Block-Element-Modifier (BEM) CSS Methodology

BEM provides a modular CSS naming convention that prevents specificity wars and creates self-documenting styling classes.

- **Block**: Standalone entity that is meaningful in context (`.card`, `.navbar`).
- **Element**: Part of a block tied structurally to it (`.card__title`, `.navbar__link`).
- **Modifier**: Flag used to alter visual appearance or state (`.card--featured`, `.button--primary`).

```css
/* BEM CSS Implementation */
.card {
    background-color: #1e293b;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #334155;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.card__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f8fafc;
}

.card__description {
    font-size: 0.875rem;
    color: #94a3b8;
    line-height: 1.6;
}

/* Modifier Variant */
.card--featured {
    border-color: #38bdf8;
    background-color: #0f172a;
}
```

```html
<!-- BEM HTML Structure -->
<article class="card card--featured">
    <header class="card__header">
        <h3 class="card__title">Enterprise Cloud Architecture</h3>
        <span class="badge badge--success">Active</span>
    </header>
    <p class="card__description">
        Scalable distributed infrastructure designed for zero-downtime multi-region deployments.
    </p>
</article>
```

---

## 3. Image Optimization & Modern Image Formats

Optimizing static image assets significantly improves Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP) performance scores:

```html
<!-- Responsive Picture Element with Modern Formats -->
<picture>
    <source srcset="/assets/images/hero-banner.avif" type="image/avif">
    <source srcset="/assets/images/hero-banner.webp" type="image/webp">
    <img src="/assets/images/hero-banner.jpg" 
         alt="Cloud Architecture Infrastructure Visualization" 
         width="1200" 
         height="630" 
         loading="eager" 
         fetchpriority="high">
</picture>
```

Explicit `width` and `height` dimensions prevent layout shifts while the browser calculates aspect ratio prior to asset downloading.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why should I use BEM CSS naming conventions?
BEM eliminates nested selector specificity conflicts (`.nav ul li a`) and creates predictable, component-scoped CSS classes that can be safely updated without unintended global style regressions.

### Q2: What is the benefit of AVIF and WebP image formats over PNG/JPEG?
AVIF and WebP offer superior compression ratios (often $30-50\%$ smaller file sizes than JPEG) while maintaining high visual fidelity, dramatically accelerating page load times.

### Q3: What is Cumulative Layout Shift (CLS)?
CLS is a Google Web Vitals performance metric that measures unexpected visual page movements while assets are loading. Specifying explicit image dimensions and reserving aspect ratio boxes prevents CLS.

### Q4: How do I audit static site performance?
Use Google Lighthouse or Chrome DevTools Performance panel to audit Largest Contentful Paint (LCP), First Input Delay (FID), Accessibility compliance, and SEO metadata.

### Q5: What is the difference between `loading="lazy"` and `loading="eager"`?
`loading="lazy"` defers image downloading until the element approaches the visible viewport, saving bandwidth. `loading="eager"` instructs the browser to download the asset immediately (ideal for above-the-fold hero images).
"""
}

# 4. javascript-basics
fs_batch1["javascript-basics"] = {
    "slug": "javascript-basics",
    "title": "JavaScript Syntax & DOM: Execution Context, Event Loop & DOM Manipulation",
    "tagline": "V8 engine execution context, the JavaScript Event Loop, closures, DOM tree manipulation, and event delegation.",
    "category": "Full Stack Development",
    "readTime": "26",
    "lastUpdated": "July 2026",
    "prerequisites": ["checkpoint-static"],
    "related": ["npm-ecosystem", "checkpoint-interactivity"],
    "practiceProblems": [{"title": "DOM Event Delegation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# JavaScript Syntax & DOM: Execution Context, Event Loop & DOM Manipulation

JavaScript is a single-threaded, dynamically typed, prototype-based scripting language that powers client-side interactivity and server-side execution.

---

## 1. JavaScript Engine & Execution Context

When JavaScript executes, the V8 engine creates an Execution Context consisting of a Memory Component (Variable Environment) and an Execution Component (Thread of Execution).

```javascript
// Variable Hoisting & Scope Demonstration
console.log(varVariable); // Output: undefined (hoisted declaration)
// console.log(letVariable); // ReferenceError: Cannot access before initialization (Temporal Dead Zone)

var varVariable = "I am hoisted";
let letVariable = "I am scoped";

function calculateTotal(subtotal, taxRate) {
    const tax = subtotal * taxRate;
    return subtotal + tax;
}

const total = calculateTotal(100, 0.08);
console.log(`Total Amount: $${total}`);
```

Execution contexts progress through two phases:
1. **Creation Phase**: Memory space is allocated for variables (`var` initialized to `undefined`, `let`/`const` placed in Temporal Dead Zone) and function declarations.
2. **Execution Phase**: Code executes line-by-line, assigning values and executing function calls on the Call Stack.

---

## 2. The JavaScript Event Loop & Asynchronous Architecture

Because JavaScript operates on a single main thread, asynchronous operations (network requests, timers, DOM events) are managed by the Event Loop via the Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (`setTimeout`).

```javascript
console.log("1: Synchronous Start");

setTimeout(() => {
    console.log("4: Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
    console.log("3: Microtask (Promise)");
});

console.log("2: Synchronous End");

/* Expected Execution Output:
1: Synchronous Start
2: Synchronous End
3: Microtask (Promise)
4: Macrotask (setTimeout)
*/
```

Microtasks (Promises, `queueMicrotask`) have strict execution priority over Macrotasks (`setTimeout`, `setInterval`).

---

## 3. DOM Tree Manipulation & Event Delegation

The Document Object Model (DOM) represents HTML elements as an object tree. Event Delegation leverages event bubbling to handle events on multiple child nodes using a single parent listener.

```javascript
// Efficient Event Delegation Pattern
const productList = document.getElementById("product-list");

productList.addEventListener("click", (event) => {
    // Check if the clicked target is an item delete button
    const deleteBtn = event.target.closest(".btn-delete");
    if (!deleteBtn) return;

    const listItem = deleteBtn.closest(".product-item");
    const productId = listItem.dataset.productId;

    console.log(`Deleting product ID: ${productId}`);
    listItem.remove();
});
```

Event delegation significantly reduces memory overhead by attaching one event listener to container elements instead of hundreds of listeners to individual items.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the Temporal Dead Zone (TDZ)?
The TDZ is the period between entering a scope and the actual line where a `let` or `const` variable is declared. Accessing the variable during TDZ throws a `ReferenceError`.

### Q2: How does Closure work in JavaScript?
A closure is a function bound together with references to its surrounding lexical environment. Closures allow inner functions to access outer scope variables even after outer functions have finished executing.

### Q3: What is the difference between Microtasks and Macrotasks?
Microtasks (Promises, `MutationObserver`) are executed immediately after current synchronous code completes before rendering. Macrotasks (`setTimeout`, `setInterval`) are executed in subsequent event loop iterations.

### Q4: Why is Event Delegation better than attaching individual event listeners?
Event delegation attaches a single event listener to a parent node, consuming less memory and automatically supporting dynamically added child DOM elements.

### Q5: What is the difference between `==` and `===` in JavaScript?
`==` performs abstract type coercion prior to comparison (e.g. `'5' == 5` returns `true`). `===` evaluates strict equality without type coercion (e.g. `'5' === 5` returns `false`).
"""
}

# 5. npm-ecosystem
fs_batch1["npm-ecosystem"] = {
    "slug": "npm-ecosystem",
    "title": "npm & Package Ecosystem: Package Manifests, Semantic Versioning & Security",
    "tagline": "Understanding package.json, semantic versioning (^ vs ~), package-lock.json, module resolutions, and security auditing.",
    "category": "Full Stack Development",
    "readTime": "22",
    "lastUpdated": "July 2026",
    "prerequisites": ["javascript-basics"],
    "related": ["checkpoint-interactivity", "git-version-control"],
    "practiceProblems": [{"title": "npm Dependency Auditing", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# npm & Package Ecosystem: Package Manifests, Semantic Versioning & Security

Node Package Manager (npm) is the world's largest software registry, managing JavaScript dependencies, CLI scripts, and project manifests across Node.js and browser environments.

---

## 1. Anatomy of `package.json` & `package-lock.json`

The `package.json` file serves as the project metadata manifest, while `package-lock.json` pins exact transitive dependency trees for deterministic builds across environments.

```json
{
  "name": "enterprise-fullstack-app",
  "version": "1.0.0",
  "description": "Production full stack Web application framework.",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "audit:fix": "npm audit fix"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "express": "~4.19.2"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.2.11"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 2. Semantic Versioning (SemVer) Breakdown

Semantic Versioning follows a strict `MAJOR.MINOR.PATCH` format (e.g., `2.4.1`):
- **MAJOR** (`2.0.0`): Incompatible API breaking changes.
- **MINOR** (`1.5.0`): Backward-compatible new functionality.
- **PATCH** (`1.4.2`): Backward-compatible bug fixes.

Prefix operators dictate automatic update policies:
- Caret (`^1.4.0`): Allows updates to higher MINOR and PATCH versions (`1.4.1` to `1.9.9`), blocking MAJOR (`2.0.0`).
- Tilde (`~1.4.0`): Allows updates to higher PATCH versions (`1.4.1` to `1.4.9`), blocking MINOR (`1.5.0`).
- Exact (`1.4.0`): Pins the exact specified version.

---

## 3. Dependency Management & Security Audits

```bash
# Installing dependencies
npm install axios                   # Adds to "dependencies"
npm install --save-dev typescript   # Adds to "devDependencies"

# Auditing dependencies for known security vulnerabilities (CVEs)
npm audit

# Resolving non-breaking vulnerable packages
npm audit fix
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why should `package-lock.json` be committed to version control?
`package-lock.json` locks the exact version tree of every installed sub-dependency, guaranteeing identical production builds across developer machines and CI/CD runners.

### Q2: What is the difference between `dependencies` and `devDependencies`?
`dependencies` are required for production application execution. `devDependencies` are only required during development and build compilation (e.g., TypeScript, Vite, linters).

### Q3: What does `npm ci` do compared to `npm install`?
`npm ci` performs a clean install directly from `package-lock.json`, deleting `node_modules` first. It is faster and safer for automated CI/CD build environments.

### Q4: How does the Caret (`^`) operator work in SemVer?
The caret operator (`^1.2.3`) allows npm to auto-upgrade to higher minor or patch versions (up to `<2.0.0`), preventing breaking major changes.

### Q5: How do I run security vulnerability audits in npm projects?
Run `npm audit` to scan installed package trees against the GitHub Advisory Database and output vulnerability security reports.
"""
}

# 6. checkpoint-interactivity
fs_batch1["checkpoint-interactivity"] = {
    "slug": "checkpoint-interactivity",
    "title": "Checkpoint - Interactivity Project: Dynamic UI Widgets & LocalStorage State",
    "tagline": "Building interactive web widgets with DOM event handling, form validation engines, and LocalStorage state persistence.",
    "category": "Full Stack Development",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["npm-ecosystem"],
    "related": ["git-version-control", "github-collaboration"],
    "practiceProblems": [{"title": "Interactive Widget Architecture", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Checkpoint - Interactivity Project: Dynamic UI Widgets & LocalStorage State

Adding dynamic client-side interactivity transforms static HTML documents into modern web applications capable of handling state changes, local browser storage, and form validations.

---

## 1. Project Goal & Widget Specifications

This checkpoint builds a persistent dynamic Todo & Task Tracker application that features real-time DOM filtering, form validation, and LocalStorage synchronization.

---

## 2. State Management & LocalStorage Persistence

```javascript
// Task Store Module Pattern
const TaskStore = {
    STORAGE_KEY: "app_tasks_v1",

    getTasks() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    },

    addTask(title, priority = "medium") {
        const tasks = this.getTasks();
        const newTask = {
            id: crypto.randomUUID(),
            title: title.trim(),
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
        this.saveTasks(tasks);
        return newTask;
    },

    toggleTask(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks(tasks);
        }
    }
};
```

---

## 3. Dynamic DOM Rendering & Form Validation Engine

```javascript
// Form Validation & Render Pipeline
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-title-input");
const taskListContainer = document.getElementById("task-list");

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();

    if (!title) {
        showInputError("Task title cannot be empty.");
        return;
    }

    TaskStore.addTask(title);
    taskInput.value = "";
    renderTaskList();
});

function renderTaskList() {
    const tasks = TaskStore.getTasks();
    taskListContainer.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'task-item--completed' : ''}" data-id="${task.id}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-toggle">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <button type="button" class="btn-delete-task" aria-label="Delete task">&times;</button>
        </li>
    `).join('');
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the storage capacity limit of LocalStorage?
LocalStorage typically provides $5\text{MB}$ of synchronous key-value storage per domain origin.

### Q2: Why is XSS sanitization required when rendering innerHTML?
Directly interpolating unescaped user input into `innerHTML` allows attackers to inject malicious script tags (Cross-Site Scripting). Always sanitize or escape HTML characters.

### Q3: What is the difference between `localStorage` and `sessionStorage`?
`localStorage` persists data indefinitely until explicitly cleared. `sessionStorage` automatically clears data when the current browser tab or session window closes.

### Q4: How does `crypto.randomUUID()` work?
`crypto.randomUUID()` generates a cryptographically secure 128-bit RFC 4122 version-4 Unique Identifier string natively in modern browsers.

### Q5: How do I handle form submit events without refreshing the page?
Call `event.preventDefault()` inside the submit event listener callback function to intercept the default browser form submission refresh behavior.
"""
}

# 7. git-version-control
fs_batch1["git-version-control"] = {
    "slug": "git-version-control",
    "title": "Git Version Control: DAG Architecture, Rebase, Merge & Branching",
    "tagline": "Directed Acyclic Graphs (DAG), commit object trees, rebase vs merge, stashing, and cherry-picking.",
    "category": "Full Stack Development",
    "readTime": "25",
    "lastUpdated": "July 2026",
    "prerequisites": ["checkpoint-interactivity"],
    "related": ["github-collaboration", "checkpoint-collaborative"],
    "practiceProblems": [{"title": "Git Rebase Conflict Resolution", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Git Version Control: DAG Architecture, Rebase, Merge & Branching

Git is a distributed version control system (DVCS) that models repository history as an immutable Directed Acyclic Graph (DAG) of snapshot objects.

---

## 1. Git Under the Hood: Object Architecture

Git stores data within `.git/objects/` using four primary immutable object types identified by 40-character SHA-1/SHA-256 hashes:
1. **Blob**: Raw binary content of a file.
2. **Tree**: Directory listing mapping file names to Blob SHA hashes and permissions.
3. **Commit**: Metadata pointing to a root Tree hash, parent commit hash(es), author, and log message.
4. **Annotated Tag**: Reference pointer attached to a specific commit object.

---

## 2. Branching & Merging Strategies: Fast-Forward vs 3-Way Merge

```bash
# Creating and switching to a feature branch
git checkout -b feature/user-authentication

# Making changes and committing
git add .
git commit -m "feat: implement JWT token generation service"

# 1. Fast-Forward Merge (Clean linear history)
git checkout main
git merge feature/user-authentication

# 2. Non-Fast-Forward 3-Way Merge (Creates merge commit preserving branch origin)
git merge --no-ff feature/user-authentication
```

---

## 3. Git Rebase vs. Git Merge

Rebasing rewrites commit history by applying local feature branch commits onto the tip of another base branch:

```bash
# Interactive rebasing to squash or edit the last 3 commits
git rebase -i HEAD~3

# Rebasing current feature branch onto updated main branch
git checkout feature/user-authentication
git rebase main
```

Rebasing maintains a linear project history but should never be performed on public shared branches (`main` or `release`).

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between `git merge` and `git rebase`?
`git merge` combines branches by creating a new 3-way merge commit, preserving historical branch graphs. `git rebase` rewrites commit history by moving local commits onto the tip of the target branch.

### Q2: What does `git stash` do?
`git stash` temporarily saves uncommitted working directory and index modifications to a storage stack, restoring a clean working state.

### Q3: When should I use `git cherry-pick`?
Use `git cherry-pick <commit-hash>` to apply a single specific commit from another branch onto your current active branch without merging the entire branch.

### Q4: Why is `git push --force-with-lease` safer than `git push --force`?
`--force-with-lease` checks if remote branch references have been updated by teammates prior to overwriting, preventing accidental remote work deletion.

### Q5: What is a detached HEAD state in Git?
A detached HEAD state occurs when `HEAD` points directly to a specific commit SHA rather than a named branch reference.
"""
}

# 8. github-collaboration
fs_batch1["github-collaboration"] = {
    "slug": "github-collaboration",
    "title": "GitHub Collaboration: Pull Requests, Code Reviews & Branch Rules",
    "tagline": "Pull request workflows, code review best practices, branch protection rules, issue templates, and GitHub Actions.",
    "category": "Full Stack Development",
    "readTime": "22",
    "lastUpdated": "July 2026",
    "prerequisites": ["git-version-control"],
    "related": ["checkpoint-collaborative", "checkpoint-external-packages"],
    "practiceProblems": [{"title": "GitHub PR Workflow Simulation", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# GitHub Collaboration: Pull Requests, Code Reviews & Branch Rules

GitHub provides a cloud-hosted platform for software collaboration, automating code reviews, CI/CD status checks, issue tracking, and repository security policies.

---

## 1. The GitHub Pull Request (PR) Lifecycle

1. **Fork/Branch**: Developer creates a feature branch (`feature/payment-gateway`).
2. **Commit & Push**: Push signed commits to GitHub remote.
3. **Open PR**: Submit PR with clear architectural context, screenshots, and test coverage evidence.
4. **Automated CI Checks**: GitHub Actions run linters, type checks (`tsc`), and unit tests.
5. **Peer Code Review**: Maintainers review code diffs and request changes.
6. **Merge & Deploy**: PR is merged into `main` branch via Squash-and-Merge.

---

## 2. Setting Up Branch Protection Rules

Production repositories enforce protection rules on default branches (`main`):
- Require pull request reviews before merging (minimum 1-2 approvals).
- Require status checks to pass before merging (`build`, `test`).
- Require linear history or squash merging.
- Restrict force pushes and branch deletions.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is a Pull Request (PR)?
A Pull Request notifies repository maintainers that a developer has completed feature changes on a branch and proposes merging those changes into the main codebase after review.

### Q2: What is the benefit of Squash and Merge?
Squash and Merge combines all commits from a feature branch into a single clean commit on the destination branch, keeping the main commit log clean.

### Q3: How do GitHub Actions work with PRs?
GitHub Actions trigger automated CI/CD workflows on `pull_request` events, running tests and linters to verify code before merging.

### Q4: What are CODEOWNERS files in GitHub?
A `CODEOWNERS` file defines specific developers or team groups responsible for reviewing changes to matching directory file paths in a repository.

### Q5: How do issue closing keywords work in PR descriptions?
Including keywords like `Fixes #42` or `Closes #108` in a PR description automatically closes the referenced GitHub Issue when the PR is merged.
"""
}

# 9. checkpoint-collaborative
fs_batch1["checkpoint-collaborative"] = {
    "slug": "checkpoint-collaborative",
    "title": "Checkpoint - Collaborative Work Project: Git Workflows & Conflict Resolution",
    "tagline": "Simulating multi-developer engineering workflows, resolving merge conflicts, and conducting peer code reviews.",
    "category": "Full Stack Development",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["github-collaboration"],
    "related": ["checkpoint-external-packages"],
    "practiceProblems": [{"title": "Git Conflict Resolution Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Checkpoint - Collaborative Work Project: Git Workflows & Conflict Resolution

Engineers rarely work in isolation. Collaborating in team environments requires mastering branch strategies, resolving complex merge conflicts, and conducting effective code reviews.

---

## 1. Resolving Merge Conflicts Step-by-Step

Merge conflicts occur when two branches modify the exact same lines of code in conflicting ways:

```
<<<<<<< HEAD (Current Branch)
const API_BASE_URL = "https://api.staging.example.com/v2";
=======
const API_BASE_URL = "https://api.production.example.com/v1";
>>>>>>> feature/update-api-url (Incoming Changes)
```

```bash
# Conflict Resolution Commands
git checkout main
git pull origin main

git checkout feature/update-api-url
git rebase main

# Open conflicting files, edit conflict markers, then stage resolved files
git add src/config.js
git rebase --continue
```

---

## 2. Frequently Asked Questions (FAQs)

### Q1: Why do Git merge conflicts happen?
Merge conflicts occur when Git cannot automatically merge differing modifications made to the same lines of code across conflicting branches.

### Q2: What is Trunk-Based Development?
Trunk-based development is a branching strategy where engineers merge small, frequent updates into a single core `main` branch, reducing merge conflict complexity.

### Q3: How do conflict markers work in Git?
Git inserts conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) directly into conflicting files to highlight differences between current and incoming branches.

### Q4: What should a good PR review focus on?
PR code reviews should evaluate architectural correctness, security vulnerabilities, edge case test coverage, adherence to project code standards, and readability.

### Q5: How do I abort a problematic merge or rebase operation?
Run `git merge --abort` or `git rebase --abort` to return the working directory to its state before the operation began.
"""
}

# 10. checkpoint-external-packages
fs_batch1["checkpoint-external-packages"] = {
    "slug": "checkpoint-external-packages",
    "title": "Checkpoint - External Packages Project: Library Integration & Module Bundling",
    "tagline": "Integrating third-party libraries (Axios, Chart.js, Lodash), ES Modules vs CommonJS, and Vite bundling.",
    "category": "Full Stack Development",
    "readTime": "25",
    "lastUpdated": "July 2026",
    "prerequisites": ["checkpoint-collaborative"],
    "related": ["html-semantics", "css-layouts"],
    "practiceProblems": [{"title": "External Package Integration", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Checkpoint - External Packages Project: Library Integration & Module Bundling

Modern JavaScript development relies on third-party libraries published to npm. Integrating external packages efficiently requires understanding ES Module imports, bundling mechanics, and HTTP clients.

---

## 1. Integrating Axios & Chart.js

```javascript
import axios from 'axios';
import Chart from 'chart.js/auto';

// Fetching analytics data from external API
async function renderAnalyticsChart() {
    try {
        const response = await axios.get('/api/v1/metrics/monthly');
        const metrics = response.data;

        const ctx = document.getElementById('analyticsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: metrics.map(m => m.month),
                datasets: [{
                    label: 'Monthly Active Users',
                    data: metrics.map(m => m.mau),
                    borderColor: '#38bdf8',
                    tension: 0.3
                }]
            }
        });
    } catch (error) {
        console.error('Failed to load metrics:', error);
    }
}
```

---

## 2. ES Modules (ESM) vs CommonJS (CJS)

- **ES Modules (`import` / `export`)**: Static module specification designed for browsers and modern Node.js, supporting Tree Shaking.
- **CommonJS (`require` / `module.exports`)**: Synchronous legacy module specification native to Node.js.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is Tree Shaking in JavaScript bundlers?
Tree Shaking is a dead-code elimination process performed by modern bundlers (Vite, Rollup, Webpack) that strips unused ES Module exports from production bundles.

### Q2: Why use Axios instead of native `fetch()`?
Axios automatically transforms JSON responses, supports request/response interceptors, handles request timeouts, and automatically throws errors for non-2xx HTTP status codes.

### Q3: What is the difference between ES Modules and CommonJS?
ES Modules (`import`/`export`) are statically analyzed at compile time, enabling tree shaking. CommonJS (`require()`) loads modules dynamically at runtime.

### Q4: What is a JavaScript Bundler?
A bundler (Vite, Webpack, Esbuild) combines modular JavaScript files, CSS, and assets into optimized static output bundles suitable for browser execution.

### Q5: How do I reduce third-party package bundle size?
Import specific utility functions (`import debounce from 'lodash/debounce'`) instead of importing entire monolithic libraries.
"""
}

# Clean all headers in all 10 Batch 1 blogs
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

output_json = 'scratch/fs_batch1_clean_quality.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(fs_batch1, f, indent=2)

print(f"\nSUCCESSFULLY CREATED ALL 10 FULL STACK BATCH 1 BLOGS IN {output_json}!")
