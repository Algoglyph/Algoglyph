with open('src/components/RoadmapPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pos = content.find('articleMarkdownToHtml')
if pos != -1:
    print(content[pos-100:pos+1500])
else:
    print("articleMarkdownToHtml not found")
