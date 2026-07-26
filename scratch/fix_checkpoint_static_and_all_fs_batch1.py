import re

print("=== REMOVING ALL DUPLICATE CHECKLISTS FROM src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Stripping `### Production Maintenance & Monitoring Checklist` and everything under it
# Stripping `### Architectural Best Practices Summary` and everything under it
patterns_to_remove = [
    r"\n\s*###\s*Production Maintenance & Monitoring Checklist[\s\S]*?(?=\n\s*`|\n\s*##|\n\s*###\s*Q|\n\s*\}|$)",
    r"\n\s*###\s*Architectural Best Practices Summary[\s\S]*?(?=\n\s*`|\n\s*##|\n\s*###\s*Q|\n\s*\}|$)"
]

total_removed = 0
for pat in patterns_to_remove:
    matches = list(re.finditer(pat, content))
    if matches:
        print(f"Removing {len(matches)} occurrences for pattern '{pat[:40]}...'")
        content = re.sub(pat, "", content)
        total_removed += len(matches)

# Clean up any trailing whitespace or orphan empty lines right before closing template backtick
content = re.sub(r"\n\s*\n\s*`", "\n`", content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nSUCCESSFULLY REMOVED {total_removed} DUPLICATE CHECKLIST BLOCKS FROM blogData.ts!")
