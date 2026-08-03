import os

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

img_dir = "public/images/blockchain"
files = os.listdir(img_dir)

print("=== CHECKING BLOCKCHAIN IMAGES ===")
missing = []
for slug in slugs:
    expected = f"{slug}-dark.png"
    if expected not in files:
        missing.append(slug)

print(f"Total slugs: {len(slugs)}")
print(f"Total image files found: {len(files) - 1}") # subtract .gitkeep
print(f"Missing image slugs: {missing}")
