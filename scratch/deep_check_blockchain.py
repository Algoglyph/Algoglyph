import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all slugs and check if they could be blockchain-related
blockchain_keywords = [
    'blockchain', 'bitcoin', 'ethereum', 'solidity', 'defi', 'nft',
    'web3', 'smart-contract', 'crypto', 'consensus', 'merkle',
    'hash-function', 'distributed-ledger', 'token', 'mining',
    'proof-of-work', 'proof-of-stake', 'wallet', 'dex', 'dao'
]

print("All slugs in blogData.ts:")
all_slugs = []
for idx, line in enumerate(lines):
    slug_match = re.search(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', line)
    if slug_match:
        slug = slug_match.group(1)
        # Skip interface definition
        if slug != 'string':
            all_slugs.append((idx+1, slug))

# Search for blockchain terms in all slugs            
print(f"\nTotal slugs: {len(all_slugs)}")
print("\nBlockchain/crypto related slugs:")
for lineno, slug in all_slugs:
    for kw in blockchain_keywords:
        if kw in slug.lower():
            print(f"  Line {lineno}: {slug}")
            break

# Also search raw content for blockchain mentions
print("\n\nSearching file content for 'blockchain' keyword occurrences (first 20):")
count = 0
for idx, line in enumerate(lines):
    if 'blockchain' in line.lower() and count < 20:
        print(f"  Line {idx+1}: {line[:120].strip()}")
        count += 1
