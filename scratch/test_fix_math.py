import subprocess

js_code = """
const katex = require('katex');
const hljs = require('highlight.js');
const fs = require('fs');

const blogDataContent = fs.readFileSync('./src/config/blogData.ts', 'utf-8');
const match = blogDataContent.match(/"slug":\\s*"p-vs-np-class-limits"[\\s\\S]*?"markdown":\\s*"([\\s\\S]*?)"\\s*,\\s*"title"/);
const rawMarkdown = match ? JSON.parse('"' + match[1] + '"') : '';

const escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderInlineMarkdown = (text) => {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
    .replace(/!\\[([^\\]]*)\\]\\(([^)]+?)(#light|#dark)?\\)/g, (_, alt, src, themeHash) => {
      let classes = 'my-6 max-w-full rounded-lg border border-[var(--rm-border)] shadow-md mx-auto';
      if (themeHash === '#light') {
        classes += ' block dark:hidden';
      } else if (themeHash === '#dark') {
        classes += ' hidden dark:block';
      } else {
        classes += ' block';
      }
      return `<img src="${src}" alt="${alt}" class="${classes}" />`;
    })
    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--rm-accent)] hover:underline font-semibold">$1</a>');
};

const fixedArticleMarkdownToHtml = (markdown) => {
  const blocks = [];
  const mathBlocks = [];
  const inlineMathBlocks = [];
  
  let content = markdown
    .replace(/^(#\\s+[^\\n]+\\r?\\n\\r?\\n)(?:!\\[[^\\]]*\\]\\(\\/images\\/[^\\)]+\\)\\r?\\n\\r?\\n)+/i, '$1')
    .replace(/^(?:!\\[[^\\]]*\\]\\(\\/images\\/[^\\)]+\\)\\r?\\n\\r?\\n)+/i, '');

  // 1. Protect code blocks
  content = content.replace(/```(\\w*)\\r?\\n([\\s\\S]*?)```/g, (_, lang, code) => {
    const cleanLang = (lang || '').toLowerCase().trim();
    const trimmedCode = code.trim();
    const hasSvgTag = trimmedCode.includes('<svg') && trimmedCode.includes('</svg>');

    if (cleanLang === 'svg' || (hasSvgTag && (cleanLang === 'xml' || cleanLang === 'html' || cleanLang === 'text' || !cleanLang || trimmedCode.startsWith('<svg')))) {
      const svgMatch = trimmedCode.match(/<svg[\\s\\S]*?<\\/svg>/i);
      if (svgMatch) {
        const token = `@@BLOCK_SVG_${blocks.length}@@`;
        blocks.push(`<div class="my-6 max-w-full overflow-x-auto flex justify-center">${svgMatch[0]}</div>`);
        return token;
      }
    }

    const token = `@@BLOCK_CODE_${blocks.length}@@`;
    let highlightedCode = escapeHtml(code.trim());
    let languageClass = '';
    
    if (lang) {
      try {
        const cleanLang = lang.toLowerCase() === 'cpp' ? 'cpp' : lang.toLowerCase();
        highlightedCode = hljs.highlight(code.trim(), { language: cleanLang }).value;
        languageClass = ` class="language-${cleanLang} hljs"`;
      } catch (e) {
        try {
          highlightedCode = hljs.highlightAuto(code.trim()).value;
          languageClass = ' class="hljs"';
        } catch (err) {}
      }
    } else {
      try {
        highlightedCode = hljs.highlightAuto(code.trim()).value;
        languageClass = ' class="hljs"';
      } catch (err) {}
    }
    
    blocks.push(`<pre><code${languageClass}>${highlightedCode}</code></pre>`);
    return token;
  });

  // 2. Protect Block math ($$...$$)
  content = content.replace(/\\$\\$([\\s\\S]+?)\\$\\$/g, (_, math) => {
    const token = `@@BLOCK_MATH_${mathBlocks.length}@@`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathBlocks.push(rendered);
    } catch (e) {
      mathBlocks.push(`<div class="math-error">${escapeHtml(math)}</div>`);
    }
    return token;
  });

  // 3. Protect Inline math ($...$) - RESTRICTED TO SINGLE LINE ([^\\$\\n]+?)
  content = content.replace(/\\$([^\\$\\n]+?)\\$/g, (_, math) => {
    // If it looks like a currency amount like $1,000,000 without math symbols, ignore
    const token = `@@INLINE_MATH_${inlineMathBlocks.length}@@`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      inlineMathBlocks.push(rendered);
    } catch (e) {
      inlineMathBlocks.push(`<span class="math-error">${escapeHtml(math)}</span>`);
    }
    return token;
  });

  // 4. Protect Raw SVG
  content = content.replace(/<svg[\\s\\S]*?<\\/svg>/gi, (match) => {
    const token = `@@BLOCK_SVG_${blocks.length}@@`;
    blocks.push(`<div class="my-6 max-w-full overflow-x-auto flex justify-center">${match}</div>`);
    return token;
  });

  // 5. Protect HTML Table
  content = content.replace(/<table[\\s\\S]*?<\\/table>/g, (match) => {
    const token = `@@BLOCK_TABLE_${blocks.length}@@`;
    blocks.push(match);
    return token;
  });

  const lines = content.split(/\\r?\\n/);
  const htmlLines = [];
  let inList = null;
  let inTable = false;
  let tableRows = [];
  let inBlockquote = false;

  const closeBlockquote = () => {
    if (inBlockquote) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }
  };

  const closeList = () => {
    if (inList) {
      htmlLines.push(`</${inList}>`);
      inList = null;
    }
  };

  const closeTable = () => {
    if (inTable) {
      let tableHtml = `<div class="overflow-x-auto"><table>`;
      tableRows.forEach((row, rIdx) => {
        const isHeader = rIdx === 0;
        const tag = isHeader ? 'th' : 'td';
        tableHtml += `<tr>`;
        row.forEach(cell => {
          tableHtml += `<${tag}>${renderInlineMarkdown(cell)}</${tag}>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</table></div>`;
      htmlLines.push(tableHtml);
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith('@@BLOCK_') || line.startsWith('@@INLINE_')) {
      closeList();
      closeTable();
      closeBlockquote();
      htmlLines.push(line);
      continue;
    }

    if (!line) {
      closeList();
      closeTable();
      closeBlockquote();
      continue;
    }

    if (line.startsWith('|')) {
      closeList();
      closeBlockquote();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.every(c => c.startsWith('-'))) {
        continue;
      }
      tableRows.push(cells);
      continue;
    } else {
      closeTable();
    }

    if (line === '---') {
      closeList();
      closeBlockquote();
      htmlLines.push('<hr class="my-8 border-[var(--rm-border)] opacity-30" />');
    } else if (line.startsWith('>')) {
      closeList();
      if (!inBlockquote) {
        inBlockquote = true;
        htmlLines.push('<blockquote>');
      }
      const bqLine = line.replace(/^>\\s*/, '');
      htmlLines.push(`<p>${renderInlineMarkdown(bqLine)}</p>`);
    } else if (line.startsWith('# ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
    } else if (/^[-*]\\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        htmlLines.push('<ul>');
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.replace(/^[-*]\\s+/, ''))}</li>`);
    } else if (/^\\d+\\.\\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        htmlLines.push('<ol>');
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.replace(/^\d+\\.\\s+/, ''))}</li>`);
    } else {
      closeList();
      closeBlockquote();
      htmlLines.push(`<p>${renderInlineMarkdown(rawLine)}</p>`);
    }
  }
  closeList();
  closeTable();
  closeBlockquote();

  let finalHtml = htmlLines.join('\\n');

  // Strip <p> wrappers from standalone block tokens
  finalHtml = finalHtml.replace(/<p>\\s*(@@BLOCK_[A-Z]+_\\d+@@)\\s*<\\/p>/gi, '$1');

  // Safe replacements using functions (never raw strings!)
  blocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_CODE_${idx}@@`, 'g'), () => block);
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_SVG_${idx}@@`, 'g'), () => block);
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_TABLE_${idx}@@`, 'g'), () => block);
  });

  mathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_MATH_${idx}@@`, 'g'), () => mathHtml);
  });

  inlineMathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@INLINE_MATH_${idx}@@`, 'g'), () => mathHtml);
  });

  return finalHtml;
};

const html = fixedArticleMarkdownToHtml(rawMarkdown);
console.log('--- TEST WITH SINGLE-LINE INLINE MATH REGEX ---');
const lines = html.split('\\n');
console.log('TOTAL LINES IN HTML:', lines.length);
console.log('SAMPLE OUTPUT (Lines 10 to 45):');
console.log(lines.slice(10, 45).join('\\n'));
"""

with open("scratch/temp_run.cjs", "w", encoding="utf-8") as f:
    f.write(js_code)

res = subprocess.run(["node", "scratch/temp_run.cjs"], capture_output=True, text=True)
print(res.stdout)
if res.stderr:
    print("STDERR:", res.stderr)
