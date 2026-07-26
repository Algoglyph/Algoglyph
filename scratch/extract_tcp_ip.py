import subprocess
import re

# Get old content from git
result = subprocess.run(
    ['git', 'show', 'c600d83:src/config/blogData.ts'],
    capture_output=True, text=True, encoding='utf-8',
    cwd='.'
)
old_content = result.stdout

# Find tcp-ip-model entry in old content
idx = old_content.find('"tcp-ip-model"')
if idx == -1:
    idx = old_content.find("'tcp-ip-model'")
    
print(f"tcp-ip-model found at char: {idx}")
if idx > 0:
    # Find the object boundaries (backwards to {, forwards to "summary": ""...} })
    start = old_content.rfind('\n  {', 0, idx)
    end_mark = old_content.find('"summary":', idx)
    end = old_content.find('  }', end_mark) + 3
    
    entry = old_content[start:end]
    print(f"Entry length: {len(entry)} chars")
    print(f"Entry preview (first 500):\n{entry[:500]}")
    print(f"\nEntry end (last 200):\n{entry[-200:]}")
    
    # Save the entry for later restoration
    with open('scratch/tcp_ip_model_entry.txt', 'w', encoding='utf-8') as f:
        f.write(entry)
    print("\nSaved to scratch/tcp_ip_model_entry.txt")
