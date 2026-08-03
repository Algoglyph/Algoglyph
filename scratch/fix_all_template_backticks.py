import json
import re

print("=== REPAIRING ESCAPING FOR ALL TEMPLATE LITERAL BACKTICKS ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix unescaped backtick sequences in blogData.ts
# Replace any occurrence of \``` with \`\`\`
fixed_text = re.sub(r'\\`{2,}', lambda m: '\\`' * len(m.group(0).replace('\\', '')), text)

# Also fix the stray `  })` at line 44969 if it was orphaned
fixed_text = fixed_text.replace("```\n  })\n    return summary.sort_values", "```\n    return summary.sort_values")
fixed_text = fixed_text.replace("\\`\\`\\`\n  })\n    return summary.sort_values", "\\`\\`\\`\n    return summary.sort_values")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(fixed_text)

print("Updated blogData.ts!")
