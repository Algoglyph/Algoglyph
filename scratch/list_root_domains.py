with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Let's find the array definition, e.g. export const domains = [ or similar
# Let's find where the domains are exported
m = re.search(r"export\s+const\s+domains\s*:\s*\w+\[\]\s*=\s*\[", content)
if not m:
    m = re.search(r"export\s+const\s+domains\s*=\s*\[", content)

if m:
    start_pos = m.end()
    # Now let's find the objects in the array that are at depth 1.
    # A root domain object has:
    # {
    #   id: '...',
    #   name: '...',
    #   ...
    # }
    # Let's search for id: '...' at depth 1.
    brace_depth = 1
    current_pos = start_pos
    domain_starts = []
    
    # We can match { id: '...' } blocks at depth 1.
    # To do this, let's scan characters:
    while current_pos < len(content):
        char = content[current_pos]
        if char == '[':
            brace_depth += 1
        elif char == ']':
            brace_depth -= 1
            if brace_depth == 0:
                break
        elif char == '{':
            if brace_depth == 1:
                domain_starts.append(current_pos)
            brace_depth += 1
        elif char == '}':
            brace_depth -= 1
        current_pos += 1
        
    print(f"Found {len(domain_starts)} root domains:")
    for start in domain_starts:
        # Get the id and name
        match = re.search(r"id:\s*'([^']+)',\s*(?:number:\s*'([^']*)',\s*)?name:\s*'([^']+)'", content[start:start+500])
        if match:
            print(f"ID: {match.group(1):<30} | Name: {match.group(3)}")
else:
    print("Could not find domains export in roadmapData.ts")
