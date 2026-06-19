import type { TestCase } from '../db/indexedDB';
import leetcodeData from '../data/leetcode-top100.json';

export interface LeetCodeProblem {
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  content: string;
  codeSnippet: string;
  testCases: TestCase[];
  url: string;
  tags?: string[];
  driver?: string;
  constraints?: string[];
}

export interface LeetCodeListItem {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

// Statically map from the JSON data for sidebar/lists
export const LEETCODE_POPULAR_PROBLEMS: LeetCodeListItem[] = (leetcodeData as any[]).map(p => ({
  slug: p.slug,
  title: p.title,
  difficulty: p.difficulty,
  tags: p.tags
}));

export async function fetchLeetCodeProblem(titleSlug: string): Promise<LeetCodeProblem> {
  const cleanSlug = titleSlug.trim().toLowerCase().replace(/\s+/g, '-');
  const item = (leetcodeData as any[]).find(p => p.slug === cleanSlug);

  // Try live GraphQL first
  try {
    const query = `
      query getProblem($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          titleSlug
          content
          difficulty
          topicTags {
            name
          }
          codeSnippets {
            langSlug
            code
          }
          sampleTestCase
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: cleanSlug }
      })
    });

    if (response.ok) {
      const result = await response.json();
      const question = result.data?.question;
      if (question) {
        const cppSnippet = question.codeSnippets?.find((s: any) => s.langSlug === 'cpp')?.code ||
                           question.codeSnippets?.[0]?.code || '';

        const sampleInput = question.sampleTestCase || '';
        const tags = question.topicTags?.map((t: any) => t.name) || [];

        return {
          title: question.title,
          titleSlug: question.titleSlug,
          difficulty: question.difficulty as any,
          content: question.content || 'No description found.',
          codeSnippet: cppSnippet,
          testCases: sampleInput ? [{ id: `tc-${Date.now()}`, input: sampleInput, expectedOutput: '' }] : [],
          url: `https://leetcode.com/problems/${question.titleSlug}/`,
          tags,
          driver: item?.driver
        };
      }
    }
  } catch (error) {
    console.warn("LeetCode live API fetch failed, using offline fallback:", error);
  }

  // Fallback to local JSON catalog
  if (item) {
    return {
      title: item.title,
      titleSlug: item.slug,
      difficulty: item.difficulty,
      content: item.statement,
      codeSnippet: item.boilerplate,
      testCases: item.examples || [],
      url: `https://leetcode.com/problems/${item.slug}/`,
      tags: item.tags,
      driver: item.driver,
      constraints: item.constraints
    };
  }

  return {
    title: titleSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    titleSlug: cleanSlug,
    difficulty: 'Medium',
    content: `<h3>Description</h3><p>Imported template for <strong>${titleSlug}</strong>. Offline fallback.</p>`,
    codeSnippet: `// Enter your solution here\nclass Solution {\npublic:\n    // Add signature\n};`,
    testCases: [],
    url: `https://leetcode.com/problems/${cleanSlug}/`,
    tags: []
  };
}
