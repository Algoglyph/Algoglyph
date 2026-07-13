// inject_phase2.cjs — Injects Phase 2 blogs into blogData.ts
const fs = require('fs');
const path = require('path');

const BLOG_DATA_PATH = path.join(__dirname, 'src/config/blogData.ts');
const FILES = {
  'mcp-protocol': fs.readFileSync(path.join(__dirname, 'mcp-protocol.md'), 'utf8'),
  'agent-skills': fs.readFileSync(path.join(__dirname, 'agent-skills.md'), 'utf8'),
  'agent-roadmap': fs.readFileSync(path.join(__dirname, 'agent-roadmap.md'), 'utf8'),
  'provider-gemini': fs.readFileSync(path.join(__dirname, 'provider-gemini.md'), 'utf8'),
  'provider-openai': fs.readFileSync(path.join(__dirname, 'provider-openai.md'), 'utf8'),
  'provider-anthropic': fs.readFileSync(path.join(__dirname, 'provider-anthropic.md'), 'utf8'),
};

function escapeContent(content) {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

const entries = [
  {
    id: 26,
    slug: 'mcp-protocol',
    title: 'Model Context Protocol (MCP)',
    description: 'MCP is the universal communication protocol between AI applications and tools. Learn how it standardizes tool integration across all AI providers.',
    date: 'Jul 10, 2025',
    readTime: '16 min read',
    tags: ['MCP', 'Protocol', 'Tools', 'Integration', 'AI Infrastructure'],
    subtopic: 'backend',
    file: 'mcp-protocol',
  },
  {
    id: 27,
    slug: 'agent-skills',
    title: 'Agent Skills: Teaching AI to Do Anything',
    description: 'Explore the modular capabilities that transform a raw LLM into a capable autonomous agent — from web search to code execution to memory systems.',
    date: 'Jul 10, 2025',
    readTime: '17 min read',
    tags: ['Agent Skills', 'Tools', 'Functions', 'Capabilities', 'Agents'],
    subtopic: 'backend',
    file: 'agent-skills',
  },
  {
    id: 28,
    slug: 'agent-roadmap',
    title: 'AI Agents Roadmap: Beginner to Production',
    description: 'A structured, four-stage learning path from your first LLM API call to deploying production-grade autonomous agent systems.',
    date: 'Jul 10, 2025',
    readTime: '18 min read',
    tags: ['Roadmap', 'Agents', 'Learning Path', 'Multi-Agent', 'Production'],
    subtopic: 'backend',
    file: 'agent-roadmap',
  },
  {
    id: 29,
    slug: 'provider-gemini',
    title: 'Google Gemini: The Multimodal AI Platform',
    description: 'Deep-dive into Google Gemini\'s model family, 1M token context, native multimodality, function calling, and how to build agents with the Gemini API.',
    date: 'Jul 10, 2025',
    readTime: '15 min read',
    tags: ['Gemini', 'Google', 'Multimodal', 'API', 'AI Provider'],
    subtopic: 'backend',
    file: 'provider-gemini',
  },
  {
    id: 30,
    slug: 'provider-openai',
    title: 'OpenAI: The Platform That Started the AI Revolution',
    description: 'Master the OpenAI API — GPT-4o, reasoning models (o1/o3), function calling, structured outputs, Assistants API, embeddings, and cost optimization.',
    date: 'Jul 10, 2025',
    readTime: '16 min read',
    tags: ['OpenAI', 'GPT-4o', 'API', 'Function Calling', 'AI Provider'],
    subtopic: 'backend',
    file: 'provider-openai',
  },
  {
    id: 31,
    slug: 'provider-anthropic',
    title: 'Anthropic & Claude: Safety-First AI for Production',
    description: 'Learn how Constitutional AI shapes Claude\'s behavior, explore prompt caching, extended thinking, and why safety-by-design matters for production deployments.',
    date: 'Jul 10, 2025',
    readTime: '17 min read',
    tags: ['Anthropic', 'Claude', 'Constitutional AI', 'Safety', 'AI Provider'],
    subtopic: 'backend',
    file: 'provider-anthropic',
  },
];

let blogData = fs.readFileSync(BLOG_DATA_PATH, 'utf8');

// Find insertion point — just before the closing ]; of BLOG_POSTS array
const insertionPoint = blogData.lastIndexOf('];');
if (insertionPoint === -1) {
  console.error('ERROR: Could not find closing ]; in blogData.ts');
  process.exit(1);
}

let newEntries = '\n';
for (const entry of entries) {
  const content = escapeContent(FILES[entry.file]);
  const tagsStr = entry.tags.map(t => `"${t}"`).join(', ');
  newEntries += `  {
    id: ${entry.id},
    slug: "${entry.slug}",
    title: "${entry.title}",
    description: "${entry.description}",
    date: "${entry.date}",
    readTime: "${entry.readTime}",
    tags: [${tagsStr}],
    subtopic: "${entry.subtopic}",
    content: \`${content}\`
  },\n`;
}

const updatedBlogData = blogData.slice(0, insertionPoint) + newEntries + blogData.slice(insertionPoint);
fs.writeFileSync(BLOG_DATA_PATH, updatedBlogData, 'utf8');
console.log('SUCCESS: Injected', entries.length, 'Phase 2 blog entries into blogData.ts');
console.log('IDs injected:', entries.map(e => e.id).join(', '));
