import re

files = [
    'src/config/deBlogData.ts',
    'src/config/mlBlogData.ts', 
    'src/config/roadmapData.ts',
]

keywords = ['blockchain', 'bitcoin', 'ethereum', 'solidity', 'defi', 'nft', 'web3', 'smart contract', 'smart-contract', 'crypto']

for fname in files:
    try:
        with open(fname, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        found = False
        for idx, line in enumerate(lines):
            for kw in keywords:
                if kw in line.lower():
                    if not found:
                        print(f"\n=== {fname} ===")
                        found = True
                    print(f"  Line {idx+1}: {line[:120].strip()}")
                    break
        if not found:
            print(f"\n{fname}: No blockchain/crypto keywords found")
    except FileNotFoundError:
        print(f"\n{fname}: File not found")
