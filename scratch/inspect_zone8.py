with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('AI & Data Scientist')
print(f"Found 'AI & Data Scientist' at pos {pos}")

snippet = text[pos-200:pos+3000]
print(snippet)
