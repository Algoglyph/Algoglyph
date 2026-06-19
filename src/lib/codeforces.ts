import type { TestCase } from '../db/indexedDB';
import codeforcesData from '../data/codeforces-top100.json';

export interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  content: string;
  codeSnippet: string;
  testCases: TestCase[];
  url: string;
}

export interface CodeforcesListItem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

// Statically map from Codeforces JSON
export const CODEFORCES_POPULAR_PROBLEMS: CodeforcesListItem[] = (codeforcesData as any[]).map(p => ({
  contestId: p.contestId,
  index: p.index,
  name: p.title,
  rating: p.rating,
  tags: p.tags
}));

export async function fetchCodeforcesProblem(contestId: number, index: string): Promise<CodeforcesProblem> {
  const cleanIndex = index.trim().toUpperCase();
  const item = (codeforcesData as any[]).find(p => p.contestId === contestId && p.index === cleanIndex);

  // Try to scrape live first (for rich HTML statement and examples)
  try {
    const url = `https://codeforces.com/problemset/problem/${contestId}/${cleanIndex}`;
    const response = await fetch(url);
    if (response.ok) {
      const htmlText = await response.text();

      const inputRegex = /<div class="input">[\s\S]*?<pre>([\s\S]*?)<\/pre>/gi;
      const outputRegex = /<div class="output">[\s\S]*?<pre>([\s\S]*?)<\/pre>/gi;

      const inputs: string[] = [];
      const outputs: string[] = [];

      let match;
      while ((match = inputRegex.exec(htmlText)) !== null) {
        inputs.push(match[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim());
      }
      while ((match = outputRegex.exec(htmlText)) !== null) {
        outputs.push(match[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim());
      }

      const testCases: TestCase[] = [];
      const count = Math.min(inputs.length, outputs.length);
      for (let i = 0; i < count; i++) {
        testCases.push({
          id: `cf-tc-${i}-${Date.now()}`,
          input: inputs[i],
          expectedOutput: outputs[i]
        });
      }

      const titleMatch = htmlText.match(/<div class="title">([\s\S]*?)<\/div>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : (item ? item.title : `CF Problem ${contestId}${cleanIndex}`);

      // Extract statement from problem-statement container if present
      let content = `<h3>CF Problem ${contestId}${cleanIndex}</h3><p>Imported from Codeforces. View details on official website.</p>`;
      const statementMatch = htmlText.match(/<div class="problem-statement">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
      if (statementMatch) {
        content = statementMatch[1];
      }

      return {
        contestId,
        index: cleanIndex,
        name: title,
        content,
        codeSnippet: item?.boilerplate || `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write solution\n    return 0;\n}`,
        testCases,
        rating: item?.rating,
        tags: item?.tags || [],
        url
      };
    }
  } catch (error) {
    console.warn("Codeforces scraping failed, using local fallback:", error);
  }

  // Fallback to local JSON catalog
  if (item) {
    return {
      contestId: item.contestId,
      index: item.index,
      name: item.title,
      rating: item.rating,
      tags: item.tags,
      content: item.statement || `<h3>${item.title}</h3><p>Offline fallback description.</p>`,
      codeSnippet: item.boilerplate,
      testCases: item.examples || [],
      url: `https://codeforces.com/problemset/problem/${item.contestId}/${item.index}`
    };
  }

  return {
    contestId,
    index: cleanIndex,
    name: `Problem ${contestId}${cleanIndex}`,
    tags: [],
    content: `<h3>CF Problem ${contestId}${cleanIndex}</h3><p>Offline fallback template. Define custom test inputs in the Test Runner.</p>`,
    codeSnippet: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`,
    testCases: [],
    url: `https://codeforces.com/problemset/problem/${contestId}/${cleanIndex}`
  };
}

export async function fetchCodeforcesProblemsetList(): Promise<any[]> {
  try {
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.result?.problems) {
        return data.result.problems;
      }
    }
  } catch (error) {
    console.error("Failed to query Codeforces problemset list:", error);
  }
  return [];
}
