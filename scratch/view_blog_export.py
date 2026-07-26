with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pos = content.find('export const BLOG_POSTS')
if pos != -1:
    print(content[pos:pos+400])
else:
    print("export const BLOG_POSTS not found")
