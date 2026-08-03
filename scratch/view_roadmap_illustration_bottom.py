with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's print around line 430 to 520
lines = content.splitlines()
print(f"Total lines: {len(lines)}")
for idx in range(min(400, len(lines)), min(530, len(lines))):
    print(f"{idx+1}: {lines[idx]}")
