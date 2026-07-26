with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p1 = text.find("slug: 'algorithmic-exercises'")
p2 = text.find("slug: 'study-plans-leetcode'")
print("Length of raw section:", p2 - p1)
print("Snippet:", repr(text[p1:p1+500]))
