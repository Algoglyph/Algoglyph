const fs = require('fs');

const data = fs.readFileSync('src/config/blogData.ts', 'utf8');

const codeReviewsMd = fs.readFileSync('ai-app-code-reviews.md', 'utf8');
const refactoringMd = fs.readFileSync('ai-app-refactoring.md', 'utf8');

let nextId = 0;
const idMatches = data.match(/id:\s*(\d+)/g);
if (idMatches) {
  for (const match of idMatches) {
    const id = parseInt(match.replace(/[^\d]/g, ''), 10);
    if (id > nextId) nextId = id;
  }
}

const blogs = [
  {
    slug: 'ai-app-code-reviews',
    title: 'AI-Assisted Code Reviews: The Future of Pull Requests',
    author: 'AI Engineering Team',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'AI Tools',
    tags: ['AI', 'Code Review', 'CI/CD'],
    excerpt: 'How AI agents are transforming the code review process by catching bugs and enforcing style guidelines at machine speed.',
    markdown: codeReviewsMd
  },
  {
    slug: 'ai-app-refactoring',
    title: 'AI-Powered Automated Refactoring',
    author: 'AI Engineering Team',
    date: '2026-07-13',
    readTime: '7 min read',
    category: 'AI Tools',
    tags: ['AI', 'Refactoring', 'Technical Debt'],
    excerpt: 'Leveraging Large Language Models and static analysis to automate the modernization of legacy systems and eliminate technical debt.',
    markdown: refactoringMd
  }
];

let injectedData = data;

for (const blog of blogs) {
  if (injectedData.indexOf('slug: "' + blog.slug + '"') === -1) {
    nextId++;
    const blogString = `
  {
    id: ${nextId},
    title: ${JSON.stringify(blog.title)},
    slug: "${blog.slug}",
    author: "${blog.author}",
    date: "${blog.date}",
    readTime: "${blog.readTime}",
    category: "${blog.category}",
    tags: ${JSON.stringify(blog.tags)},
    excerpt: ${JSON.stringify(blog.excerpt)},
    markdown: ${JSON.stringify(blog.markdown)}
  },`;
    
    // insert right before the closing bracket of BLOG_POSTS
    const closingIndex = injectedData.lastIndexOf('];');
    if (closingIndex !== -1) {
      injectedData = injectedData.substring(0, closingIndex) + blogString + '\n' + injectedData.substring(closingIndex);
    }
  }
}

fs.writeFileSync('src/config/blogData.ts', injectedData, 'utf8');
console.log('Phase 1 blogs injected successfully.');
