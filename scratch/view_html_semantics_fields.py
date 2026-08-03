with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'html-semantics'")
# Let's print about 2000 characters from idx onwards, but we'll stop if we find markdown: ` so we don't print the huge markdown
# Let's print out parts of it
print(content[idx:idx+800])
