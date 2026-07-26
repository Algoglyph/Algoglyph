with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

before = len(content)

# Fix the double comma
content = content.replace('  },,\n  {', '  },\n  {', 1)

after = len(content)
print(f"Chars before: {before}, after: {after}, delta: {before - after}")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed double comma.")
