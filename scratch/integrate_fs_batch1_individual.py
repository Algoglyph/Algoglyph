import json
import os
import re

print("=== INTEGRATING INDIVIDUAL FS BATCH 1 FILES INTO blogData.ts ===")

fs_batch1_metadata = {
    "html-semantics": {
        "title": "HTML Structure & Semantics: Document Landmarks & Accessibility",
        "tagline": "Master page landmarks, heading hierarchies, accessibility considerations, and document outlines.",
        "category": "Full Stack Development",
        "readTime": "18",
        "prerequisites": [],
        "related": ["css-layouts", "checkpoint-static"],
        "practiceProblems": [{"title": "HTML Landmark Outlines", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "css-layouts": {
        "title": "CSS Layouts & Responsive Design: Flexbox, CSS Grid & Fluid Systems",
        "tagline": "Deep-dive into box model formatting context, Flexbox alignment, CSS Grid tracks, and mobile-first media queries.",
        "category": "Full Stack Development",
        "readTime": "20",
        "prerequisites": ["html-semantics"],
        "related": ["checkpoint-static", "javascript-basics"],
        "practiceProblems": [{"title": "Responsive Layout Auditing", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "checkpoint-static": {
        "title": "Checkpoint - Static Webpages Project: Architectural Layouts, BEM CSS & Performance",
        "tagline": "Building production static landing pages with semantic HTML5, BEM CSS naming conventions, and performance optimization.",
        "category": "Full Stack Development",
        "readTime": "24",
        "prerequisites": ["css-layouts"],
        "related": ["javascript-basics", "npm-ecosystem"],
        "practiceProblems": [{"title": "Static Webpage Optimization", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "javascript-basics": {
        "title": "JavaScript Syntax & DOM: Execution Context, Event Loop & DOM Manipulation",
        "tagline": "V8 engine execution context, the JavaScript Event Loop, closures, DOM tree manipulation, and event delegation.",
        "category": "Full Stack Development",
        "readTime": "26",
        "prerequisites": ["checkpoint-static"],
        "related": ["npm-ecosystem", "checkpoint-interactivity"],
        "practiceProblems": [{"title": "DOM Event Delegation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "npm-ecosystem": {
        "title": "npm & Package Ecosystem: Package Manifests, Semantic Versioning & Security",
        "tagline": "Understanding package.json, semantic versioning (^ vs ~), package-lock.json, module resolutions, and security auditing.",
        "category": "Full Stack Development",
        "readTime": "22",
        "prerequisites": ["javascript-basics"],
        "related": ["checkpoint-interactivity", "git-version-control"],
        "practiceProblems": [{"title": "npm Dependency Auditing", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "checkpoint-interactivity": {
        "title": "Checkpoint - Interactivity Project: State Preservation, Forms & Accessible Elements",
        "tagline": "Enhancing user interaction with localStorage state storage, form validation engines, and keyboard-accessible UI widgets.",
        "category": "Full Stack Development",
        "readTime": "24",
        "prerequisites": ["npm-ecosystem"],
        "related": ["git-version-control", "github-collaboration"],
        "practiceProblems": [{"title": "Dynamic Form Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "git-version-control": {
        "title": "Git Version Control: Object Storage, Branch Mechanics & History Rebasing",
        "tagline": "Low-level Git object storage models, commit references, branching models, rebasing logs, and bug isolation.",
        "category": "Full Stack Development",
        "readTime": "22",
        "prerequisites": ["checkpoint-interactivity"],
        "related": ["github-collaboration", "checkpoint-collaborative"],
        "practiceProblems": [{"title": "Git Graph Resolution", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "github-collaboration": {
        "title": "GitHub Collaboration: PR Workflows, Branch Protection & CI Integrations",
        "tagline": "Setting up collaborative team repositories with branch protection rules, code reviews, and automated GitHub Actions CI checks.",
        "category": "Full Stack Development",
        "readTime": "20",
        "prerequisites": ["git-version-control"],
        "related": ["checkpoint-collaborative", "checkpoint-external-packages"],
        "practiceProblems": [{"title": "CI/CD Action Pipelines", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "checkpoint-collaborative": {
        "title": "Checkpoint - Collaborative Work Project: Peer Reviews, Conflicts & Release Workflows",
        "tagline": "Collaborative developer checklists, resolving merge conflicts, staging releases, and rollback mechanisms.",
        "category": "Full Stack Development",
        "readTime": "22",
        "prerequisites": ["github-collaboration"],
        "related": ["checkpoint-external-packages", "react-components"],
        "practiceProblems": [{"title": "Code Conflict Resolutions", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    },
    "checkpoint-external-packages": {
        "title": "Checkpoint - External Packages Project: Library Integration & Module Bundling",
        "tagline": "Integrating third-party libraries (Axios, Chart.js, Lodash, Date-fns), ES Modules vs CommonJS, and Vite bundling.",
        "category": "Full Stack Development",
        "readTime": "25",
        "prerequisites": ["checkpoint-collaborative"],
        "related": ["html-semantics", "css-layouts"],
        "practiceProblems": [{"title": "External Package Integration", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}]
    }
}

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# First, restore clean slate by stripping any existing entries of these 10 slugs from blogData.ts
for slug in fs_batch1_metadata.keys():
    pattern = r"\s*\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}(?:,\s*)?"
    matches = list(re.finditer(pattern, content))
    if matches:
        print(f"Removing {len(matches)} old entry for '{slug}'")
        for m in reversed(matches):
            content = content[:m.start()] + content[m.end():]

# Clean up any trailing double braces or weird brackets
content = re.sub(r',\s*,\s*', ',\n', content)

# Now read the individual files, escape them, and assemble
def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

new_entries = []
for slug, meta in fs_batch1_metadata.items():
    filename = f"scratch/fs_batch1_individual/{slug}.md"
    if not os.path.exists(filename):
        print(f"File not found: {filename}!")
        continue

    with open(filename, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    escaped_md = escape_template_literal(raw_md)

    title = json.dumps(meta['title'])
    tagline = json.dumps(meta['tagline'])
    cat = json.dumps(meta['category'])
    rt = meta['readTime']
    prereqs = json.dumps(meta['prerequisites'])
    related = json.dumps(meta['related'])
    practice = json.dumps(meta['practiceProblems'])

    entry = f"""  {{
    slug: '{slug}',
    title: {title},
    tagline: {tagline},
    category: {cat},
    readTime: {rt},
    lastUpdated: 'July 2026',
    prerequisites: {prereqs},
    related: {related},
    practiceProblems: {practice},
    markdown: `{escaped_md}`,
    content: {{
      introduction: "",
      whyImportant: "",
      realWorldApps: [],
      algorithmDescription: [],
      complexity: [],
      implementationCpp: "",
      implementationPython: "",
      commonMistakes: [],
      interviewQuestions: [],
      summary: ""
    }}
  }}"""
    new_entries.append(entry)

last_bracket = content.rfind('];')
if last_bracket != -1:
    content = content[:last_bracket].rstrip() + ",\n" + ",\n".join(new_entries) + "\n];\n"

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY INTEGRATED THE 10 INDIVIDUAL BATCH 1 BLOGS!")
