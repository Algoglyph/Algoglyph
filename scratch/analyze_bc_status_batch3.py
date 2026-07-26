import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target_slugs = [
    "what-is-blockchain", "why-blockchain-matters", "blockchain-applications",
    "blockchain-structure", "cryptography-hashing-blockchain", "blockchain-decentralization",
    "decentralization-vs-trust", "blockchain-networks", "proof-of-work", "proof-of-stake",
    "proof-of-history", "byzantine-fault-tolerance", "blockchain-operations",
    "blockchain-interoperability", "blockchain-storage", "blockchain-forking",
    "cryptocurrencies-intro", "crypto-wallets", "mining-incentives", "blockchain-environmental-impact",
    "ethereum-network", "polygon-network", "bnb-chain", "gnosis-chain",
    "avalanche-network", "fantom-network", "moonbeam-moonriver",
    "utxo-blockchains", "tvm-blockchains", "l2-blockchains"
]

print("=== STATUS OF BLOCKCHAIN BATCH 1, 2 & 3 ===")
count = 0
for slug in target_slugs:
    idx = content.find(f"slug: '{slug}'")
    if idx != -1:
        md_start = content.find("markdown: `", idx)
        if md_start != -1:
            # The markdown ends right before the next field: content: {
            md_end = content.find("content: {", md_start)
            # back off the whitespace and backtick
            if md_end != -1:
                # Find the last backtick before content: {
                real_end = content.rfind("`", md_start, md_end)
                length = real_end - (md_start + len("markdown: `"))
                print(f"Slug: {slug:<35} | Status: Fixed (Length: {length} chars)")
                count += 1
            else:
                print(f"Slug: {slug:<35} | Status: Missing closing content marker!")
        else:
            print(f"Slug: {slug:<35} | Status: Missing markdown field!")
    else:
        print(f"Slug: {slug:<35} | Status: NOT FOUND!")

print(f"\nTotal Blockchain blogs found: {count}/30")
