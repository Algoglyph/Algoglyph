import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "dapp-frontend", "web3-client-libraries", "dapp-supporting-languages",
    "state-channels", "optimistic-rollups", "zk-rollups", "ethereum-2-0",
    "on-chain-scaling", "client-nodes", "node-as-a-service", "blockchain-applicability"
]

existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", content))

print("=== BLOCKCHAIN BATCH 6 EXISTENCE IN blogData.ts ===")
for slug in target_slugs:
    exists = slug in existing_slugs
    print(f"Slug: {slug:<35} | Exists: {exists}")
