import re

header = """export interface ComplexityRow {
  label: string;
  value: string;
  note: string;
}

export interface PracticeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
}

export interface ArticleContent {
  introduction: string;
  whyImportant: string;
  realWorldApps: string[];
  algorithmDescription: string[];
  complexity: ComplexityRow[];
  implementationCpp: string;
  implementationPython: string;
  commonMistakes: string[];
  interviewQuestions: string[];
  summary: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  tagline: string;
  markdown?: string;
  category: string;
  readTime: number;
  lastUpdated: string;
  visualizerId?: string | null;
  prerequisites: string[];
  related: string[];
  nextTopic?: string | null;
  prevTopic?: string | null;
  practiceProblems: PracticeProblem[];
  content: ArticleContent;
}

export const BLOG_POSTS: BlogPost[] = [
"""

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find where the first object in BLOG_POSTS starts (e.g., `{` right before "slug": "arrays" or "slug": "mathematics-for-machine-learning")
match = re.search(r'\{\s*"slug":\s*"[^"]+"', text)
if match:
    first_obj_pos = match.start()
    fixed_text = header + text[first_obj_pos:]
    with open('src/config/blogData.ts', 'w', encoding='utf-8') as f_out:
        f_out.write(fixed_text)
    print("Successfully restored header in src/config/blogData.ts")
else:
    print("Could not find start of object array in blogData.ts")
