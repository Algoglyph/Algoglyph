import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all blockchain-related slugs
print("Searching for blockchain-related slugs and their markdown content size...")
for idx, line in enumerate(lines):
    if '"slug"' in line or "slug:" in line:
        slug_match = re.search(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', line)
        if slug_match:
            slug = slug_match.group(1)
            if 'block' in slug.lower() or 'crypto' in slug.lower() or 'ethereum' in slug.lower() or 'bitcoin' in slug.lower() or 'solidity' in slug.lower() or 'defi' in slug.lower() or 'nft' in slug.lower() or 'web3' in slug.lower() or 'smart' in slug.lower() or 'chain' in slug.lower():
                # Find the markdown field for this entry
                md_line_idx = idx
                while md_line_idx < min(idx + 20, len(lines)):
                    if '"markdown"' in lines[md_line_idx] or 'markdown:' in lines[md_line_idx]:
                        md_content = lines[md_line_idx]
                        md_len = len(md_content)
                        print(f"Line {idx+1}: slug='{slug}' | markdown length: {md_len} chars")
                        break
                    md_line_idx += 1
                else:
                    print(f"Line {idx+1}: slug='{slug}' | NO markdown field found nearby")
