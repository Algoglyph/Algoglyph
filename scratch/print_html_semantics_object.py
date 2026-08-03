with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'html-semantics'")
# Find the start of the object: it's the { before idx
start_idx = content.rfind("{", 0, idx)

# Let's parse the object and skip the markdown template literal properly:
brace_count = 0
in_template_literal = False
esc = False
obj_chars = []

for i in range(start_idx, len(content)):
    char = content[i]
    if in_template_literal:
        if esc:
            esc = False
        elif char == '\\':
            esc = True
        elif char == '`':
            in_template_literal = False
    else:
        if char == '`':
            in_template_literal = True
        elif char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                obj_chars.append(char)
                break
    obj_chars.append(char)

obj_str = "".join(obj_chars)
print(f"Object length: {len(obj_str)}")
# Let's print the fields by removing the markdown string content (just printing 'markdown: ...')
md_start = obj_str.find("markdown: `")
if md_start != -1:
    md_end = obj_str.rfind("`", 0, obj_str.find("category:") if obj_str.find("category:") != -1 else len(obj_str))
    # Wait, let's search for "category:" from md_start
    cat_idx = obj_str.find("category:", md_start)
    # The backtick closing markdown is before cat_idx
    backtick_close = obj_str.rfind("`", 0, cat_idx)
    shortened_obj = obj_str[:md_start] + "markdown: `...`,\n    " + obj_str[backtick_close+1:]
    print("=== SHORTENED OBJECT ===")
    print(shortened_obj)
else:
    print(obj_str[:2000])
