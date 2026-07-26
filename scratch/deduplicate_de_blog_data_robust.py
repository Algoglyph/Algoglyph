import re

print("=== RUNNING ROBUST DEDUPLICATION ON deBlogData.ts ===")

with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
seen_keys = set()

in_key = None
skip_current = False

# We will match key declarations like:   'async-coroutines': `
# or   "async-coroutines": `
key_start_regex = re.compile(r"^\s*['\"]([^'\"]+)['\"]\s*:\s*`?\s*\n?$")
# Also handle if the backtick is on the same line or next line:
# For example:   'async-coroutines': `

for idx, line in enumerate(lines, 1):
    stripped = line.strip()
    
    if in_key is None:
        # Check if line starts a key
        # e.g.,   'async-coroutines': `
        # or   'async-coroutines':
        m = re.match(r"^\s*['\"]([^'\"]+)['\"]\s*:\s*(?:`|(?:\s*\n?$))", line)
        if m:
            key = m.group(1)
            in_key = key
            if key in seen_keys:
                print(f"Skipping duplicate key '{key}' starting at line {idx}")
                skip_current = True
            else:
                seen_keys.add(key)
                skip_current = False
                output_lines.append(line)
        else:
            output_lines.append(line)
    else:
        # We are inside a key definition. Check if we hit the end of the backtick string.
        # The end of the backtick is a backtick alone, or backtick followed by a comma or closing brace
        # e.g.,   `,
        # or      `
        # or      `};
        # But wait! We must make sure it's not an escaped backtick inside a code fence!
        # An escaped backtick starts with a backslash: \`
        # So we check if the line has an unescaped backtick at the start (ignoring spaces).
        # Typically the closing line is exactly: `,
        # or `
        # or `};
        is_end = False
        if stripped == '`,' or stripped == '`' or stripped == '`};':
            is_end = True
            
        if not skip_current:
            output_lines.append(line)
            
        if is_end:
            in_key = None
            skip_current = False

print(f"Processed file. Unique keys retained: {len(seen_keys)}")

with open('src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Robust deduplication of deBlogData.ts completed successfully!")
