import json
import os

with open('/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/config/deBlogData.ts', 'r') as f:
    content = f.read()

def process_batch(filepath):
    global content
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} as it doesn't exist.")
        return
        
    with open(filepath, 'r') as f:
        batch = json.load(f)
        
    for key, value in batch.items():
        pattern = f"  '{key}': '',"
        escaped_val = value.replace('`', '\\`').replace('$', '\\$')
        replacement = f"  '{key}': `\n{escaped_val}\n`,"
        content = content.replace(pattern, replacement)
        print(f"Replaced {key}")

process_batch('/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/output.json')
process_batch('/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/scratch/batch_B.json')

with open('/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/config/deBlogData.ts', 'w') as f:
    f.write(content)
print("Updated deBlogData.ts with Batches A and B")
