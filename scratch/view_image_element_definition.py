with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines()
print(f"Total lines: {len(lines)}")
# Let's search for "imageElement =" or similar and view that block
pos = content.find('imageElement =')
if pos != -1:
    line_no = content[:pos].count('\n') + 1
    print(f"Found at line {line_no}")
    for idx in range(max(0, line_no - 40), min(len(lines), line_no + 60)):
        print(f"{idx+1}: {lines[idx]}")
else:
    print("Not found")
