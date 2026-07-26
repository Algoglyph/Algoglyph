import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "solana-network", "smart-contract-languages", "smart-contract-ides",
    "smart-contract-frameworks", "smart-contract-testing", "smart-contract-deployment",
    "smart-contract-monitoring", "erc-tokens", "wallet-integration", "crypto-faucets"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 4 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
