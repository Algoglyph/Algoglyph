import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "proof-of-history", "byzantine-fault-tolerance", "blockchain-operations",
    "blockchain-interoperability", "blockchain-storage", "blockchain-forking",
    "cryptocurrencies-intro", "crypto-wallets", "mining-incentives", "blockchain-environmental-impact"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 2 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
