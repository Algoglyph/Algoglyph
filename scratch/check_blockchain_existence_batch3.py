import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "ethereum-network", "polygon-network", "bnb-chain", "gnosis-chain",
    "avalanche-network", "fantom-network", "moonbeam-moonriver",
    "utxo-blockchains", "tvm-blockchains", "l2-blockchains"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 3 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
