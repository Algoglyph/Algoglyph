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

blog_data_path = 'src/config/blogData.ts'
with open(blog_data_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Find the first object `{` that starts with `"slug":`
match = re.search(r'\{\s*"slug":', text)
if match:
    first_obj = match.start()
    fixed_text = header + text[first_obj:]
    with open(blog_data_path, 'w', encoding='utf-8') as f_out:
        f_out.write(fixed_text)
    print("Successfully restored top header of blogData.ts")
else:
    print("Error: Could not find first blog object in blogData.ts")
