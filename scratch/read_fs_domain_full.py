with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("id: 'software-engineering'")
print(f"Start index: {start_idx}")

# Let's print the next 20,000 characters without brace counting
print(content[start_idx:start_idx+20000])
