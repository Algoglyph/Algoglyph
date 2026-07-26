import subprocess
import re
import sys

# Get old content from git
result = subprocess.run(
    ['git', 'show', 'c600d83:src/config/blogData.ts'],
    capture_output=True, text=True, encoding='utf-8',
    cwd='.'
)
old_content = result.stdout

# Blockchain slugs referenced in roadmapData.ts
blockchain_slugs = [
    'what-is-blockchain', 'why-blockchain-matters', 'blockchain-applications',
    'blockchain-structure', 'cryptography-hashing-blockchain', 'blockchain-decentralization',
    'consensus-mechanisms', 'blockchain-networks', 'blockchain-operations',
    'blockchain-interoperability', 'blockchain-storage', 'blockchain-forking',
    'cryptocurrencies-intro', 'crypto-wallets', 'blockchain-environmental',
    'ethereum-network', 'utxo-blockchains', 'tvm-blockchains', 'l2-blockchains',
    'smart-contract-languages', 'smart-contract-ides', 'smart-contract-frameworks',
    'smart-contract-testing', 'smart-contract-deployment', 'smart-contract-monitoring',
    'wallet-integration', 'crypto-faucets', 'smart-contract-security-tools',
    'blockchain-threat-vectors', 'hybrid-smart-contracts', 'web3-client-libraries',
    'ethereum-2-0', 'blockchain-applicability'
]

# Check which are in old file
old_slugs = re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', old_content)
old_slug_set = set(old_slugs)

# Check which are in current file
with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    new_content = f.read()
new_slugs = re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', new_content)
new_slug_set = set(new_slugs)

print("Blockchain slugs from roadmapData.ts:")
for slug in blockchain_slugs:
    in_old = slug in old_slug_set
    in_new = slug in new_slug_set
    if not in_old and not in_new:
        status = "MISSING in BOTH old and new"
    elif in_old and not in_new:
        status = "WAS IN OLD, MISSING from new"
    elif not in_old and in_new:
        status = "NEW (added)"
    else:
        status = "Present in both"
    print(f"  {slug}: {status}")
