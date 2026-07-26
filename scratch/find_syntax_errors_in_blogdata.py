with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if line.strip() == '},' and idx > 1 and lines[idx-2].strip() == '},':
        print(f"DUPLICATE CLOSING BRACKET AT LINE {idx}: {repr(line)}")
