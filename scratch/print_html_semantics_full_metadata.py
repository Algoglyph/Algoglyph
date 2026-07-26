with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'html-semantics'")
# Let's find the closing brace of the html-semantics object.
# To do that, we scan starting from idx. We skip the template literal markdown: `...`
# Let's find where the markdown starts: markdown: `
md_start = content.find("markdown: `", idx)
# Find the end of the markdown template literal: `
# Since we know the markdown has Q5 at the end, let's find that.
md_end = content.find("announce its functionality.\n\n", md_start)
# Find the next ` after that
backtick_idx = content.find("`", md_end)

# Now, print the next 2000 characters after backtick_idx to see what fields follow the markdown
print("=== AFTER MARKDOWN FOR html-semantics ===")
print(content[backtick_idx:backtick_idx+2000])
