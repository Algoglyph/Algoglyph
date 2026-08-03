with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
    "what-is-blockchain", "why-blockchain-matters", "blockchain-applications",
    "blockchain-structure", "cryptography-hashing-blockchain", "blockchain-decentralization",
    "decentralization-vs-trust", "blockchain-networks", "proof-of-work", "proof-of-stake",
    "proof-of-history", "byzantine-fault-tolerance", "blockchain-operations",
    "blockchain-interoperability", "blockchain-storage", "blockchain-forking",
    "cryptocurrencies-intro", "crypto-wallets", "mining-incentives", "blockchain-environmental-impact",
    "ethereum-network", "polygon-network", "bnb-chain", "gnosis-chain",
    "avalanche-network", "fantom-network", "moonbeam-moonriver",
    "utxo-blockchains", "tvm-blockchains", "l2-blockchains",
    "solana-network", "smart-contract-languages", "smart-contract-ides",
    "smart-contract-frameworks", "smart-contract-testing", "smart-contract-deployment",
    "smart-contract-monitoring", "erc-tokens", "wallet-integration", "crypto-faucets",
    "decentralized-storage", "smart-contract-security-tools", "fuzzing-static-analysis",
    "blockchain-threat-vectors", "randomness-attacks", "hybrid-smart-contracts",
    "chainlink-oracles", "oracle-networks", "dapp-testing", "dapp-architecture",
    "dapp-frontend", "web3-client-libraries", "dapp-supporting-languages",
    "state-channels", "optimistic-rollups", "zk-rollups", "ethereum-2-0",
    "on-chain-scaling", "client-nodes", "node-as-a-service", "blockchain-applicability"
]

blogs_md = {}

for slug in slugs:
    idx = content.find(f"slug: '{slug}'")
    if idx == -1:
        continue
    md_start = content.find("markdown: `", idx)
    if md_start == -1:
        continue
    md_content_start = md_start + len("markdown: `")
    
    md_content = ""
    esc = False
    for i in range(md_content_start, len(content)):
        char = content[i]
        if esc:
            esc = False
            md_content += char
        elif char == '\\':
            esc = True
            md_content += char
        elif char == '`':
            next_chars = content[i+1:i+20].strip()
            if not next_chars or next_chars.startswith(',') or next_chars.startswith('}') or next_chars.startswith('category'):
                break
            else:
                md_content += char
        else:
            md_content += char
    blogs_md[slug] = md_content

print("=== DUPLICATE SECTION ANALYSIS (BLOCKCHAIN BATCH 1 TO 6) ===")
import collections

paragraphs = collections.defaultdict(list)
for slug, md in blogs_md.items():
    parts = [p.strip() for p in md.split('\n\n') if len(p.strip()) > 35]
    for p in parts:
        paragraphs[p].append(slug)

duplicates = {p: s for p, s in paragraphs.items() if len(s) > 1}
print(f"Found {len(duplicates)} duplicate paragraphs across Blockchain Batches 1 to 6.")
for p, s in list(duplicates.items())[:5]:
    print(f"Paragraph duplicated in: {s}")
    print(f"Content: {p[:150]}...")
    print("-" * 50)
