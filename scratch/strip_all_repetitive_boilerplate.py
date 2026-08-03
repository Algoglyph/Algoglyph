import json
import re

print("=== STRIPPING ALL REPETITIVE BOILERPLATE & DUPLICATE CHECKLISTS FROM src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for boilerplate blocks to remove
boilerplate_patterns = [
    r"### Production Maintenance & Monitoring Checklist[\s\S]*?(?=\n\n#|\n\n##|\n\n###|$)",
    r"## Technical Architecture Deep-Dive & Engineering Reference[\s\S]*?(?=\n\n#|\n\n##|$)",
    r"### Architectural Best Practices Summary[\s\S]*?(?=\n\n#|\n\n##|$)",
    r"## Technical Deep-Dive Section[\s\S]*?(?=\n\n#|\n\n##|$)",
    r"## Advanced Analytical Frameworks[\s\S]*?(?=\n\n#|\n\n##|$)"
]

cleaned_count = 0
for pat in boilerplate_patterns:
    matches = list(re.finditer(pat, content))
    if matches:
        print(f"Found {len(matches)} occurrences matching pattern '{pat[:40]}...'")
        content = re.sub(pat, "", content)
        cleaned_count += len(matches)

# Also let's clean any double-repeated headings within any blog post's markdown
# Parse all entries in blogData.ts, clean their markdown strings, and write back
def clean_markdown_completely(md):
    # Remove repetitive checklist blocks
    for pat in boilerplate_patterns:
        md = re.sub(pat, "", md)

    lines = md.splitlines()
    seen_h2 = set()
    seen_h3 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', header_text).strip()
            if clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
            seen_h3.clear() # Reset H3 tracking for new H2 section
        elif stripped.startswith('### '):
            header_text = stripped[4:].strip()
            if header_text in seen_h3:
                continue
            seen_h3.add(header_text)
            
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

# Process all entries in blogData.ts using regex replace on markdown: `...`
def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

# Match each entry: slug: '...' ... markdown: `...`
entry_pattern = r"(slug:\s*['\"]([^'\"]+)['\"][\s\S]*?markdown:\s*`)([\s\S]*?)(`\s*\n\s*\})"

def replace_entry_md(match):
    prefix = match.group(1)
    slug = match.group(2)
    raw_md = match.group(3)
    suffix = match.group(4)
    
    # Unescape raw_md first
    unescaped_md = raw_md.replace('\\`', '`').replace('\\${', '${').replace('\\\\', '\\')
    
    # Clean completely
    cleaned_md = clean_markdown_completely(unescaped_md)
    
    # Re-escape
    escaped_md = escape_template_literal(cleaned_md)
    
    return f"{prefix}{escaped_md}{suffix}"

new_content = re.sub(entry_pattern, replace_entry_md, content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\nSUCCESSFULLY STRIPPED REPETITIVE BOILERPLATE FROM src/config/blogData.ts!")
