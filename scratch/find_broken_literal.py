with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Track backtick count across lines
in_template = False
template_start_line = 0

for idx, line in enumerate(lines, 1):
    # Count unescaped backticks in line
    # Find all backticks not preceded by backslash
    unescaped_bts = [i for i, char in enumerate(line) if char == '`' and (i == 0 or line[i-1] != '\\')]
    for _ in unescaped_bts:
        if not in_template:
            in_template = True
            template_start_line = idx
        else:
            in_template = False

    if idx < 3000 and "algorithmDescription" in line:
        print(f"Line {idx}: {line.strip()}")

print(f"At end of file, in_template state is: {in_template}")
if in_template:
    print(f"ERROR: Template literal started on line {template_start_line} was never closed!")
