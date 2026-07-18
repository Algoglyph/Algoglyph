# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    content = f.read()

REPLACEMENTS = {
    '# Aho-Corasick Algorithm: Multi-Pattern String Matching via Failure Links\\n\\n': 
    '# Aho-Corasick Algorithm: Multi-Pattern String Matching via Failure Links\\n\\n![Aho-Corasick Algorithm](/images/dsa/aho-corasick-dark.png#dark)\\n\\n',
    
    '# AVL Trees: Height Constraints & Dynamic Rebalancing Rotations\\n\\n':
    '# AVL Trees: Height Constraints & Dynamic Rebalancing Rotations\\n\\n![AVL Tree](/images/dsa/avl-trees-dark.png#dark)\\n\\n',
    
    '# B+ Trees: Disk-Optimized Branching & Leaf Range Invariants\\n\\n':
    '# B+ Trees: Disk-Optimized Branching & Leaf Range Invariants\\n\\n![B+ Tree Structure](/images/dsa/b-trees-dark.png#dark)\\n\\n',
    
    '# Balanced Search Trees: AVL Heights & Red-Black Coloring Invariants\\n\\n':
    '# Balanced Search Trees: AVL Heights & Red-Black Coloring Invariants\\n\\n![Balanced Search Trees: AVL & Red-Black Trees](/images/dsa/avl-red-black-tree-dark.png#dark)\\n\\n'
}

# In JS/TS code, newlines in string literals are encoded as actual newlines (since we use template strings or multiline strings in double quotes, wait!)
# Let's check how they are stored in blogData.ts.
# Looking at the previous snippet output:
# "markdown": "# AVL Trees: Height Constraints & Dynamic Rebalancing Rotations\n\n## 1. Historical Context & Motivation\n\n"
# Ah! They are stored as escaped \n inside double-quoted string literals!
# So yes, they contain literal '\\n' sequences (the characters '\' and 'n').
# Let's verify by doing the replacements:

replaced_count = 0
for old, new in REPLACEMENTS.items():
    # If the file contains double-quoted string, let's find the occurrences and replace.
    if old in content:
        content = content.replace(old, new)
        replaced_count += 1
        print(f"Replaced {old[:30]}...")
    else:
        # Let's try raw newlines or different spacing just in case
        old_normalized = old.replace('\\n', '\n')
        new_normalized = new.replace('\\n', '\n')
        if old_normalized in content:
            content = content.replace(old_normalized, new_normalized)
            replaced_count += 1
            print(f"Replaced normalized {old[:30]}...")
        else:
            print(f"Warning: could not find {old[:30]} in blogData.ts")

with open("src/config/blogData.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Success: Replaced {replaced_count} image references.")
