import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "what-is-blockchain", "why-blockchain-matters", "blockchain-applications",
    "blockchain-structure", "cryptography-hashing-blockchain", "blockchain-decentralization",
    "decentralization-vs-trust", "blockchain-networks", "proof-of-work", "proof-of-order", "proof-of-stake"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 1 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
