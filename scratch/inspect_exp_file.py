with open('scratch/expand_all_10_batch2_properly.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'md_\d+', text)
print(f"Found md_ occurrences: {set(matches)}")

for i in range(11, 21):
    pos = text.find(f'md_{i}')
    print(f"md_{i} position: {pos}")
    if pos != -1:
        print(repr(text[pos:pos+40]))
