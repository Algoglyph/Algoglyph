import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "decentralized-storage", "smart-contract-security-tools", "fuzzing-static-analysis",
    "blockchain-threat-vectors", "randomness-attacks", "hybrid-smart-contracts",
    "chainlink-oracles", "oracle-networks", "dapp-testing", "dapp-architecture"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 5 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
