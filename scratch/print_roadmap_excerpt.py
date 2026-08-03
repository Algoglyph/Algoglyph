with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for "Full Stack Development"
fs_idx = content.find("name: 'Full Stack Development'")
print(f"Index of 'Full Stack Development': {fs_idx}")

# Let's print out 20,000 characters from fs_idx onwards
print(content[fs_idx:fs_idx+20000])
