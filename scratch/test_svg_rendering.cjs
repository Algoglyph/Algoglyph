const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const blogMarkdowns = [];

// Extract markdown property values from blogData.ts
const blogDataMarkdownRe = /"markdown":\s*`([\s\S]*?)`|'markdown':\s*`([\s\S]*?)`/g;
let m;
while ((m = blogDataMarkdownRe.exec(blogDataRaw)) !== null) {
  blogMarkdowns.push(m[1] || m[2]);
}

// Extract string literal values from blogData.ts (JSON objects or template strings)
const jsonMarkdownRe = /"markdown":\s*"([\s\S]*?)"/g;
while ((m = jsonMarkdownRe.exec(blogDataRaw)) !== null) {
  blogMarkdowns.push(m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
}

// Extract all markdowns from deBlogData.ts
const deRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].length > 50) {
    blogMarkdowns.push(m[2]);
  }
}

console.log(`Extracted ${blogMarkdowns.length} total article markdowns for comprehensive testing.`);

function testArticleMarkdownToHtml(markdown) {
  const blocks = [];
  const mathBlocks = [];
  const inlineMathBlocks = [];

  // Protect code blocks (```lang...```) and syntax highlight them using highlight.js
  let content = markdown.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cleanLang = (lang || '').toLowerCase().trim();
    const trimmedCode = code.trim();
    const hasSvgTag = trimmedCode.includes('<svg') && trimmedCode.includes('</svg>');
    
    if (cleanLang === 'svg' || (hasSvgTag && (cleanLang === 'xml' || cleanLang === 'html' || cleanLang === 'text' || !cleanLang || trimmedCode.startsWith('<svg')))) {
      const svgMatch = trimmedCode.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        const token = `@@BLOCK_SVG_${blocks.length}@@`;
        blocks.push(`<div class="my-6 max-w-full overflow-x-auto flex justify-center">${svgMatch[0]}</div>`);
        return token;
      }
    }

    const token = `@@BLOCK_CODE_${blocks.length}@@`;
    let highlightedCode = code.trim();
    let languageClass = '';
    blocks.push(`<pre><code${languageClass}>${highlightedCode}</code></pre>`);
    return token;
  });

  // Protect SVG blocks (<svg ... </svg>)
  content = content.replace(/<svg[\s\S]*?<\/svg>/gi, (match) => {
    const token = `@@BLOCK_SVG_${blocks.length}@@`;
    blocks.push(`<div class="my-6 max-w-full overflow-x-auto flex justify-center">${match}</div>`);
    return token;
  });

  let finalHtml = content;

  blocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(`@@BLOCK_CODE_${idx}@@`, () => block);
    finalHtml = finalHtml.replace(`@@BLOCK_SVG_${idx}@@`, () => block);
    finalHtml = finalHtml.replace(`@@BLOCK_TABLE_${idx}@@`, () => block);
  });

  return finalHtml;
}

let badCodeBlockSvgs = 0;
let totalRenderedSvgs = 0;

blogMarkdowns.forEach((md, idx) => {
  const html = testArticleMarkdownToHtml(md);
  const badMatch = html.match(/<code[^>]*>[\s\S]*?&lt;svg[\s\S]*?<\/code>/gi) || html.match(/<code[^>]*>[\s\S]*?<svg[\s\S]*?<\/code>/gi);
  if (badMatch) {
    badCodeBlockSvgs++;
  }
  const svgs = (html.match(/<div class="my-6 max-w-full overflow-x-auto flex justify-center"><svg/gi) || []).length;
  totalRenderedSvgs += svgs;
});

console.log(`\nTEST RESULTS ACROSS ALL ARTICLES:`);
console.log(`- Total Rendered Visual SVGs: ${totalRenderedSvgs}`);
console.log(`- Articles with unrendered SVG code blocks: ${badCodeBlockSvgs}`);
