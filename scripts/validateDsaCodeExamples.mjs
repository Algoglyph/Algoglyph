import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const dsaRoot = path.resolve('content/dsa');
const snippets = [];

for (const entry of fs.readdirSync(dsaRoot, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
  const markdown = fs.readFileSync(path.join(dsaRoot, entry.name), 'utf8');
  let index = 0;
  for (const match of markdown.matchAll(/^```(python|cpp)\r?\n([\s\S]*?)^```/gm)) {
    index += 1;
    snippets.push({ file: entry.name, index, language: match[1], source: match[2] });
  }
}

const failures = [];
const pythonSnippets = snippets.filter(({ language }) => language === 'python');
if (pythonSnippets.length > 0) {
  const validator = [
    'import json, sys',
    'failures = []',
    'for item in json.load(sys.stdin):',
    '    try:',
    "        compile(item['source'], f\"{item['file']}:{item['index']}\", 'exec')",
    '    except SyntaxError as error:',
    "        failures.append(f\"{item['file']} block {item['index']}: {error.msg} at line {error.lineno}\")",
    'print(json.dumps(failures))',
  ].join('\n');
  const result = spawnSync('python', ['-c', validator], {
    input: JSON.stringify(pythonSnippets),
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || 'Python syntax validator failed');
  failures.push(...JSON.parse(result.stdout));
}

const cppByFile = new Map();
for (const snippet of snippets.filter(({ language }) => language === 'cpp')) {
  const group = cppByFile.get(snippet.file) || [];
  group.push(snippet);
  cppByFile.set(snippet.file, group);
}

const compileCpp = ([file, fileSnippets]) => new Promise((resolve) => {
  const child = spawn('g++', ['-x', 'c++', '-std=c++20', '-fsyntax-only', '-'], {
    stdio: ['pipe', 'ignore', 'pipe'],
    shell: false,
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', (error) => resolve(`${file}: ${error.message}`));
  child.on('close', (code) => resolve(code === 0 ? null : `${file}: ${stderr.split('\n')[0]}`));
  child.stdin.end(fileSnippets.map(({ source }) => source).join('\n\n'));
});

const cppResults = await Promise.all([...cppByFile].map(compileCpp));
failures.push(...cppResults.filter(Boolean));

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated syntax for ${snippets.length} executable DSA code blocks (${pythonSnippets.length} Python, ${snippets.length - pythonSnippets.length} C++).`);
}
