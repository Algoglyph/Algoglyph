import json
import os

def inject_article(slug, title, tagline, category, md_path):
    with open(md_path, 'r') as f:
        md_content = f.read()

    # Escape backticks and standard escape characters for JS template literal
    # We must escape backticks because we'll wrap the markdown in backticks.
    # We must escape ${} to prevent JS interpolation errors.
    escaped_md = md_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

    new_post = f"""  {{
    slug: "{slug}",
    title: "{title}",
    tagline: "{tagline}",
    category: "{category}",
    readTime: 5,
    lastUpdated: "2026-07-20",
    prerequisites: [],
    related: [],
    practiceProblems: [],
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

    ts_file = 'src/config/blogData.ts'
    with open(ts_file, 'r') as f:
        content = f.read()

    # find the end of the BLOG_POSTS array
    # Since it's a huge file, we look for the last '];' or we can just find 'export const BLOG_POSTS'
    # and find the matching closing bracket.
    
    # A simpler approach: replace '\n];' with ',\n' + new_post + '\n];'
    # assuming the array ends with \n];
    
    if '\n];' in content:
        # To avoid replacing all \n]; if there are multiple arrays, we search from the end
        idx = content.rfind('\n];')
        if idx != -1:
            new_content = content[:idx] + ',\n' + new_post + content[idx:]
            with open(ts_file, 'w') as f:
                f.write(new_content)
            print(f"Successfully injected {slug}")
            return
            
    print("Failed to find the end of the array")

if __name__ == '__main__':
    inject_article(
        slug="what-is-ml-engineer",
        title="What is an ML Engineer?",
        tagline="Understand the core responsibilities, tech stack, and engineering mindset required to bridge data science and production software.",
        category="Machine Learning",
        md_path="/Users/vansh_uni/.gemini/antigravity/brain/ae22bccb-017d-43bb-b2c8-57f825eba924/scratch/what-is-ml-engineer.md"
    )
