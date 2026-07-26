import json
import os

filePath = 'src/config/blogData.ts'
jsonPath = 'scratch/bc_batch2.json'

print("=== INJECTING BATCH 2 BLOCKCHAIN BLOGS ===")

if not os.path.exists(jsonPath):
    print(f"ERROR: {jsonPath} does not exist!")
    exit(1)

with open(jsonPath, 'r', encoding='utf-8') as f:
    blogs_data = json.load(f)

with open(filePath, 'r', encoding='utf-8') as f:
    file_content = f.read()

def escape_for_template_literal(content: str) -> str:
    """
    Escape backticks and ${} expressions inside a template literal string.
    """
    # Escape backticks
    content = content.replace("\\`", "ESCAPED_BACKTICK_PLACEHOLDER")
    content = content.replace("`", "\\`")
    content = content.replace("ESCAPED_BACKTICK_PLACEHOLDER", "\\`")
    # Escape template literal interpolations: ${ -> \${
    content = content.replace("${", "\\${")
    return content

# Construct the list of TypeScript objects
blog_objects = []
for slug, blog in blogs_data.items():
    escaped_markdown = escape_for_template_literal(blog["markdown"])
    
    # Format the object as a string
    obj_str = f"""  {{
    slug: '{slug}',
    title: {json.dumps(blog["title"], ensure_ascii=False)},
    tagline: {json.dumps(blog["tagline"], ensure_ascii=False)},
    category: "Blockchain",
    readTime: {blog["readTime"]},
    lastUpdated: 'July 2026',
    prerequisites: {json.dumps(blog["prerequisites"])},
    related: {json.dumps(blog["related"])},
    practiceProblems: {json.dumps(blog["practiceProblems"])},
    markdown: `{escaped_markdown}`,
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
    blog_objects.append(obj_str)

# Find the closing ]; of the BLOG_POSTS array
closing_idx = file_content.rstrip().rfind('];')
if closing_idx == -1:
    print("ERROR: Could not find closing array marker ]; in blogData.ts")
    exit(1)

# Let's insert the new posts just before the closing bracket
posts_to_insert = ",\n" + ",\n".join(blog_objects) + "\n"
new_file_content = file_content[:closing_idx].rstrip() + posts_to_insert + file_content[closing_idx:]

with open(filePath, 'w', encoding='utf-8') as f:
    f.write(new_file_content)

print(f"Successfully injected {len(blogs_data)} blogs into {filePath}!")
