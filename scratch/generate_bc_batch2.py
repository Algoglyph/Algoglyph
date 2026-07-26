import json

articles = {}

# 1. PoH (proof-of-history)
articles["proof-of-history"] = {
    "title": "Proof of History: Solana's Cryptographic Clock & Throughput Optimization",
    "tagline": "Deconstruct Verifiable Delay Functions, sequence hash chains, and parallel execution logic.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["proof-of-stake"],
    "related": ["byzantine-fault-tolerance", "blockchain-operations"],
    "practiceProblems": [],
    "markdown": """# Proof of History: Solana's Cryptographic Clock & Throughput Optimization

Traditional blockchains (like Bitcoin and Ethereum) face scalability bottlenecks because nodes must communicate to agree on *when* transactions occurred. This network synchronization adds latency. Solana resolves this issue using **Proof of History (PoH)**, a cryptographic clock that establishes the order of events before consensus runs.

---

## 1. The Sequential Hash Chain & Verifiable Delay Functions (VDF)

PoH uses a **Verifiable Delay Function (VDF)** implemented as a sequential SHA-256 hash loop. The output of one hash is used as the input for the next:

$$H_{i} = \\text{SHA-256}(H_{i-1})$$

Because SHA-256 is collision-resistant and preimage-resistant, a CPU cannot predict or calculate the output at step $H_{1000}$ without executing all $1000$ hashes sequentially.

This sequential execution acts as a clock:
- **Time Pass Proof**: Generating the hash chain requires a predictable amount of real-world time on a single CPU core.
- **Verification**: Unlike generation (which must run sequentially), verification is highly parallelizable. A multi-core CPU can divide the chain into segments and verify them simultaneously, matching the speed of the validator network.

```
[Start Hash H0] ──> SHA-256 ──> [H1] ──> SHA-256 ──> [H2] ──> ... ──> [Target HN]
```

---

## 2. Embedding Transactions Into the Chain

To prove a transaction occurred at a specific point in time, validators write the transaction's hash directly into the VDF input stream:

$$H_{new} = \\text{SHA-256}(H_{i} + \\text{TransactionHash})$$

This locks the transaction index into the hash sequence:
- The transaction cannot be reordered because changing its position alters all subsequent hashes in the chain.
- The transaction must have occurred *after* $H_i$ was generated, and *before* $H_{new}$ was recorded, establishing a strict chronological timeline.

---

## 3. Parallel Execution & Network Scaling

With block order guaranteed by the PoH clock, Solana validators do not need to wait for network confirmations to order transactions. Instead, validators process incoming transactions immediately using a parallel smart contract runtime called **Sealevel**, yielding throughputs exceeding 50,000 transactions per second.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Is Proof of History a consensus mechanism?
No. PoH is not a consensus mechanism. It is a pre-consensus cryptographic clock that Solana uses alongside Proof of Stake to order transactions efficiently.

### Q2: Why can the PoH chain not be calculated in parallel?
Because SHA-256 is a one-way function. Calculating the hash of block \`N\` requires knowing the exact hash of block \`N-1\`, forcing sequential CPU execution.

### Q3: How do validators verify the PoH chain quickly?
While generation is sequential, verification is parallel. A validator can divide the chain among multiple GPU or CPU cores to verify the math in parallel.

### Q4: What happens if a validator's CPU is significantly faster than the rest of the network?
Solana's protocol limits transmission speeds, and validators monitor VDF rates, ignoring blocks produced by nodes operating outside target frequency windows.

### Q5: How are transaction hashes combined with the VDF loop?
The transaction hash is appended to the current state hash, and the combined value is run through the SHA-256 hash function to continue the chain.
"""
}

# 2. Byzantine Fault Tolerance
articles["byzantine-fault-tolerance"] = {
    "title": "Byzantine Fault Tolerance: Consensus Mechanics & Fault Bounds",
    "tagline": "Explore the Byzantine Generals problem, CFT vs BFT limits, and PBFT three-phase state loops.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["proof-of-history"],
    "related": ["blockchain-operations", "blockchain-interoperability"],
    "practiceProblems": [],
    "markdown": """# Byzantine Fault Tolerance: Consensus Mechanics & Fault Bounds

Distributed systems must maintain a consistent state even when nodes crash, lag, or actively act maliciously. Byzantine Fault Tolerance (BFT) is the mathematical framework that guarantees consensus under these conditions. This article covers the Byzantine Generals Problem, CFT vs. BFT models, Practical Byzantine Fault Tolerance (PBFT), and the $3f + 1$ network bound.

---

## 1. The Byzantine Generals Problem & Fault Models

The **Byzantine Generals Problem** describes a scenario where multiple divisions of an army surround an enemy city. The generals must agree on a single plan: attack or retreat.
- Communication is sent via messengers who can be captured.
- Some generals may be traitors, sending conflicting messages to prevent consensus.

In computer systems, we define two fault classes:
1. **Crash Fault Tolerance (CFT)**: Nodes may stop running or delay messages, but they do not send corrupted or false data.
2. **Byzantine Fault Tolerance (BFT)**: Nodes can act maliciously, sending conflicting messages, forging signatures, or withholding data.

---

## 2. Practical Byzantine Fault Tolerance (PBFT) States Sequence

PBFT is a state machine replication algorithm designed for low-latency consortium networks. It operates in three phases to reach consensus on state updates:

```
[Request] ──> [Pre-Prepare] ──> [Prepare] ──> [Commit] ──> [Reply to Client]
```

### The Three Phases
1. **Pre-Prepare**: The primary node assigns a sequence number to the transaction batch and broadcasts it.
2. **Prepare**: Backup nodes verify the sequence number and broadcast a prepare message. Nodes collect these messages to confirm that peers agree on the order.
3. **Commit**: Nodes verify that they have received a majority of prepare messages, broadcast a commit message, and execute the transactions, writing them to the ledger.

---

## 3. The 3f + 1 Fault Bound Invariant

In a BFT network with $f$ malicious nodes, the system requires a minimum total of $N$ nodes to guarantee consensus:

$$N \\ge 3f + 1$$

### Proof of the Bound
- If $f$ nodes are malicious, they can send false data or fail to reply.
- The remaining $N - f$ nodes must be sufficient to reach consensus.
- However, since we cannot distinguish between an honest node that is lagging and a malicious node that is silent, we must be able to reach consensus using only $N - f$ replies.
- Within these $N - f$ replies, $f$ replies could still be malicious.
- To guarantee that the honest nodes outnumber the malicious nodes, the number of honest nodes must exceed the number of malicious nodes:
  $$(N - f) - f > f \\implies N > 3f \\implies N \\ge 3f + 1$$

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between CFT and BFT consensus?
CFT assumes nodes are honest but may crash or lag (e.g. Raft). BFT assumes nodes can act maliciously, sending corrupted or conflicting data (e.g. PBFT).

### Q2: Why does a BFT network require at least 4 nodes to tolerate 1 Byzantine node?
Based on the formula $N \\ge 3f + 1$, tolerating $f = 1$ fault requires $N \\ge 3(1) + 1 = 4$ nodes to prevent partition conflicts.

### Q3: What is a primary node in PBFT?
The primary node is the coordinator responsible for ordering transactions and broadcasting them to backup nodes.

### Q4: How is a malicious primary node replaced in PBFT?
If backup nodes detect that the primary node is silent or sending conflicting messages, they trigger a view change protocol to elect a new primary node.

### Q5: Why is PBFT not used for large public networks like Bitcoin?
PBFT requires all nodes to communicate with every other node ($O(N^2)$ messaging complexity), which quickly bottle-necks as the node count grows.
"""
}

# 3. Basic Blockchain Operations
articles["blockchain-operations"] = {
    "title": "Basic Blockchain Operations: Lifecycle of a Transaction",
    "tagline": "Trace transactions from ECDSA key creation, mempool queues, gas pricing, to block confirmations.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["byzantine-fault-tolerance"],
    "related": ["blockchain-interoperability", "blockchain-storage"],
    "practiceProblems": [],
    "markdown": """# Basic Blockchain Operations: Lifecycle of a Transaction

For software engineers building decentralized applications, understanding how data moves from user input to blockchain commitment is essential. This article traces the lifecycle of a transaction through creation, signature, propagation, the mempool, block packaging, and final block confirmation.

---

## 1. Key Creation & Digital Signature Generation

Before a user can submit a transaction, their client wallet must generate and sign the transaction payload:
1. **Payload Construction**: Define transaction details (sender, recipient, amount, nonce, gas limit).
2. **Hashing**: Compute the hash of the transaction data.
3. **ECDSA Signature**: Sign the hash using the sender's private key:

$$\\text{Signature} = \\text{Sign}(\\text{Hash}(\\text{TxData}), \\text{PrivateKey})$$

This signature proves that the transaction was authorized by the owner of the private key, without exposing the key itself.

---

## 2. Gossip Propagation & The Mempool Queue

Once signed, the transaction is broadcast to the network:
1. **Network Gossip**: The user's wallet sends the transaction to connected nodes, which forward it to their peers.
2. **Validation**: Nodes verify the transaction's signature and confirm that the sender has a sufficient token balance.
3. **Mempool Insertion**: Verified but unconfirmed transactions are held in a temporary queue called the **Mempool** (memory pool).

```
[Wallet Signs Tx] ──> [Gossip Broadcast] ──> [Nodes Verify Sig] ──> [Mempool Queue]
```

---

## 3. Gas Fees & Block Packaging

Miners or validators select transactions from their local mempools to package into new blocks:
- **Priority Auctions**: Since block space is limited, validators prioritize transactions that offer higher transaction fees (gas price).
- **Block Mining**: Once the block is filled, the miner solves the consensus puzzle (PoW) or submits the block (PoS) to add it to the ledger.

---

## 4. Block Confirmation & Immutability

When a block is appended to the chain, the transaction receives its first **Confirmation**:
- As subsequent blocks are added, the transaction's confirmation count increases.
- More confirmations make the transaction harder to alter or erase, as rewriting it requires recalculating hashes for all subsequent blocks. A transaction is typically considered final after 6 confirmations in Bitcoin and 12-30 in Ethereum.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the mempool?
The mempool is a temporary holding queue on nodes where transactions wait until they are selected and packaged into a block by a validator.

### Q2: Why does my transaction fee affect confirmation speeds?
Validators prioritize transactions that offer higher fees to maximize their mining rewards. Low-fee transactions may sit in the mempool during high traffic.

### Q3: What is a transaction nonce in Ethereum?
A nonce is a sequential integer assigned to each transaction sent from an address, ensuring transactions are executed in the correct order and preventing replay attacks.

### Q4: What does one confirmation represent?
One confirmation means the transaction has been included in the most recently mined block.

### Q5: What happens to my transaction if it fails to execute on-chain?
The transaction is still recorded on the blockchain and gas fees are consumed to pay for the node computations, but the target state changes are reverted.
"""
}

# 4. Blockchain Interoperability
articles["blockchain-interoperability"] = {
    "title": "Blockchain Interoperability: Bridges, Relays & Wrapped Tokens",
    "tagline": "Explore cross-chain communication, token wrapping bridges, decentralized oracles, and security risks.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["blockchain-operations"],
    "related": ["blockchain-storage", "blockchain-forking"],
    "practiceProblems": [],
    "markdown": """# Blockchain Interoperability: Bridges, Relays & Wrapped Tokens

Blockchains operate as isolated databases. By default, Ethereum cannot read Bitcoin's state, and Solana cannot send tokens to Avalanche. Blockchain Interoperability protocols solve this by enabling communication across separate networks. This article covers cross-chain bridges, state relay systems, oracle networks, and wrapped assets.

---

## 1. Cross-Chain Bridges: Lock, Mint & Burn Mechanics

Bridges transfer assets between blockchains. The most common bridge architecture uses the **Lock-and-Mint** and **Burn-and-Redeem** models:

```
[Chain A (Ethereum)]                             [Chain B (Polygon)]
  User locks 1 ETH                                 Smart Contract mints
  in Bridge Contract ──> [Bridge Relayers] ──>   1 wrapped wETH token
```

### Detailed Lifecycle
1. **Asset Locking**: A user deposits an asset (e.g., ETH) into a smart contract on Chain A.
2. **Verification**: Bridge relayer nodes verify the deposit and send a cryptographic proof to Chain B.
3. **Wrapped Minting**: A smart contract on Chain B mints an equivalent wrapped asset (e.g. wETH) and sends it to the user.
4. **Redemption**: To retrieve the original asset, the user burns the wETH on Chain B, prompting the Chain A contract to release the locked ETH.

---

## 2. Oracle Networks & Relays

To verify cross-chain events, networks rely on intermediate data systems:
- **State Relays**: Specialized smart contracts on one chain that monitor and store block header data from another chain.
- **Decentralized Oracles**: Nodes that monitor events on-chain, gather external API data, and write proofs back to target smart contracts (e.g., Chainlink CCIP).

---

## 3. Wrapped Asset Security Vulnerabilities

Wrapped tokens (like wBTC or wETH) allow assets to be used on different blockchains:
- **Centralization Risk**: Some bridges rely on centralized custody groups to hold locked assets, introducing counterparty risks.
- **Smart Contract Exploits**: Bridge contracts contain massive pools of locked funds, making them primary targets for hackers. If the bridge contract on Chain A is hacked and drained, the wrapped tokens on Chain B lose their backing and crash to zero value.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a wrapped token?
A wrapped token is an on-chain asset backed 1:1 by another cryptocurrency locked in a vault contract on a different blockchain.

### Q2: How does a Lock-and-Mint bridge function?
It locks a native token in a smart contract on the source chain, and mints an equivalent wrapped token on the destination chain.

### Q3: What is the primary security vulnerability of cross-chain bridges?
They hold massive pools of locked assets in public smart contracts, which can be drained if developers introduce logic flaws or security bugs.

### Q4: What is the role of an oracle in cross-chain routing?
Oracles verify events on the source chain (like lock transactions) and write cryptographic confirmation proofs to the destination chain.

### Q5: How do cross-chain messages differ from token bridges?
Token bridges transfer assets. Cross-chain messages transfer raw data and commands, allowing a smart contract on one chain to trigger executions on another.
"""
}

# 5. Storage
articles["blockchain-storage"] = {
    "title": "Blockchain Storage: LevelDB, State Trees & Decentralized Filesystems",
    "tagline": "Analyze client node databases, state tree pruning, and decentralized storage protocols.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["blockchain-operations"],
    "related": ["blockchain-forking", "cryptocurrencies-intro"],
    "practiceProblems": [],
    "markdown": """# Blockchain Storage: LevelDB, State Trees & Decentralized Filesystems

Blockchains must store transaction logs and active application states securely and efficiently. Managing this data on thousands of nodes requires specialized database structures. This article covers node storage backends, state database architectures, state pruning, and decentralized storage networks.

---

## 1. Node Database Backends: LevelDB & RocksDB

A blockchain client node does not store data in standard SQL databases. Instead, clients use fast, lightweight key-value stores:
- **Go-Ethereum (Geth)**: Uses **LevelDB** or **RocksDB** locally to store raw block data and contract states.
- **Bitcoin Core**: Uses **LevelDB** to store the UTXO (Unspent Transaction Output) set.

Key-value databases are optimized for fast lookups and sequential reads, which are essential for verifying block hashes quickly.

---

## 2. State Tree Storage & Pruning

In Ethereum, account details, balances, and smart contract variables are stored in a hierarchical structure called the **Patricia Merkle Trie**:
- **History Growth**: The database grows with every state transition, requiring massive amounts of storage.
- **State Pruning**: To save disk space, node clients delete historical state trie data once verified, retaining only the latest state and block history. This allows full nodes to run on standard consumer SSDs.

---

## 3. Decentralized Storage: IPFS, Filecoin & Arweave

Storing large files (images, videos, PDF documents) directly on a blockchain is prohibitively expensive because every node must download and replicate the data:
- **IPFS (InterPlanetary File System)**: A peer-to-peer network that addresses files by their cryptographic hash (content identifier) rather than their URL path.
- **Filecoin**: An incentive layer for IPFS that rewards nodes for providing verifiable storage contracts.
- **Arweave**: A protocol designed for perpetual data storage using a proof-of-access consensus mechanism that pays nodes to host data indefinitely.

```
[DApp Frontend] ──> [Saves Image to IPFS] ──> [Hash ID Received] ──> [Write Hash ID to Chain]
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why are SQL databases not used as backend storage for blockchain nodes?
SQL databases introduce relational query overhead. Nodes require fast key-value lookups (LevelDB/RocksDB) to verify hashes and update account balances quickly.

### Q2: What is node state pruning?
Pruning is a cleanup process where nodes delete historical state database snapshots once verified, keeping only recent states to save disk space.

### Q3: Why is storing media files directly on-chain impractical?
Blockchains require every node to copy and store the database. Storing large media files directly on-chain would quickly exceed node storage limits.

### Q4: How does IPFS locate files?
IPFS uses content-addressing, locating files using their cryptographic hash value (CID) instead of a physical server URL.

### Q5: What is the core feature of Arweave?
Arweave provides perpetual storage, charging an upfront fee that funds node hosting rewards for hundreds of years.
"""
}

# 6. Blockchain Forking
articles["blockchain-forking"] = {
    "title": "Blockchain Forking: Hard Forks, Soft Forks & Replay Protection",
    "tagline": "Differentiate backward-compatible rule changes, split consensus branches, and transaction replay vulnerabilities.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["blockchain-storage"],
    "related": ["cryptocurrencies-intro", "crypto-wallets"],
    "practiceProblems": [],
    "markdown": """# Blockchain Forking: Hard Forks, Soft Forks & Replay Protection

A fork occurs when a blockchain network's codebase is updated, or when nodes disagree on the valid path of the ledger. Understanding forks is critical for developers managing node upgrades and token splits. This article covers soft forks, hard forks, famous fork histories, and transaction replay attacks.

---

## 1. Soft Forks vs. Hard Forks

Forks are categorized based on their backward compatibility:

### Soft Forks (Backward-Compatible)
A soft fork restricts network rules. Old nodes still accept blocks produced by upgraded nodes, but non-upgraded nodes producing blocks that violate the new rules will have their blocks rejected. Upgrading requires only a majority of the network's hash rate:

```
Old Rules:   [Block (Max 1MB)] ──> [Block (Max 1MB)]
Soft Fork:   [Block (Max 0.5MB)] ──> [Block (Max 0.5MB)] (Old nodes still accept)
```

### Hard Forks (Backward-Incompatible)
A hard fork changes network rules completely, making older blocks invalid. Non-upgraded nodes will reject blocks from upgraded nodes. This splits the chain into two separate networks unless all nodes upgrade simultaneously:

```
Old Rules:   [Block (No Smart Contracts)] ──> [Branch A (No Upgrades)]
Hard Fork:   [Block (Smart Contracts)]    ──> [Branch B (Upgraded Nodes)]
```

---

## 2. Famous Blockchain Forks

- **Bitcoin Cash (2017)**: A hard fork from Bitcoin to increase the block size limit from 1MB to 8MB, aiming to lower transaction fees.
- **Ethereum Classic (2016)**: A hard fork triggered by the DAO exploit. Upgraded nodes rolled back the stolen funds to create Ethereum, while classic nodes maintained the original ledger.

---

## 3. Replay Attacks & Mitigation

When a hard fork splits a chain, the two networks share the same transaction history and private key schemas:
- **The Attack**: If a user submits a transaction on Chain A, an attacker can copy the signed payload and broadcast it on Chain B, duplicate-spending the user's funds.
- **Replay Protection**: Modern forks implement unique **Chain IDs** in the transaction signature hash, ensuring a transaction signed for Ethereum (Chain ID 1) is rejected by Ethereum Classic (Chain ID 61).

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why is a soft fork described as backward-compatible?
Because older nodes still view blocks produced under the new, more restrictive rules as valid, avoiding a network split.

### Q2: What triggers a hard fork split?
A hard fork split occurs when a rule change is backward-incompatible, and a subset of nodes refuses to upgrade, continuing to run the old client software.

### Q3: What is a transaction replay attack on a forked chain?
It is when an attacker copies a valid transaction signature from one forked chain and broadcasts it to execute the same transfer on the other chain.

### Q4: How does Chain ID integration prevent replay attacks?
By including a unique network identifier in the transaction payload before hashing, making signatures invalid on other networks.

### Q5: What is a chain reorganization (reorg)?
A reorg occurs when a node receives a longer chain branch and must replace its recent blocks to align with the longest-chain rule.
"""
}

# 7. Cryptocurrencies
articles["cryptocurrencies-intro"] = {
    "title": "Cryptocurrencies: Native Coins, Utility Tokens & Stablecoins",
    "tagline": "Categorize digital assets, ERC-20 standards, governance tokens, and stablecoin pegs.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["blockchain-forking"],
    "related": ["crypto-wallets", "mining-incentives"],
    "practiceProblems": [],
    "markdown": """# Cryptocurrencies: Native Coins, Utility Tokens & Stablecoins

Decentralized networks support various digital assets, each serving different roles. This article categorizes these assets: native protocol coins, application-level tokens, utility and governance models, and stablecoin architectures.

---

## 1. Native Coins vs. Application Tokens

- **Native Coins**: The primary currency built directly into the blockchain protocol (e.g. BTC on Bitcoin, ETH on Ethereum). They are used to pay network gas fees and reward validators.
- **Application Tokens**: Custom tokens created using smart contracts on an existing blockchain (e.g., ERC-20 tokens on Ethereum like LINK or UNI). They represent assets or access rights within specific applications.

---

## 2. Utility vs. Governance Tokens

### Utility Tokens
Tokens that grant holders access to specific products or services within a decentralized application (e.g., Filecoin tokens used to purchase storage space).

### Governance Tokens
Tokens that act as voting shares within a project. Holders vote on-chain to decide protocol upgrades, treasury spending, and risk parameters, directing the decentralized autonomous organization (DAO).

---

## 3. Stablecoin Pegging Architectures

Stablecoins are tokens designed to track the value of a target fiat currency (usually the US Dollar). They use three primary architectures to maintain their peg:

1. **Fiat-Collateralized**: Backed 1:1 by physical currency held in centralized bank reserves (e.g. USDC, USDT).
2. **Crypto-Collateralized**: Backed by volatile cryptocurrencies locked in smart contracts, requiring over-collateralization to absorb price drops (e.g. DAI).
3. **Algorithmic**: Use smart contracts to expand or contract token supply dynamically based on market demand, without physical backing (e.g. FRAX).

```
                      [Stablecoin Pegs]
                       /      │       \\
                      /       │        \\
            [Centralized] [Over-Collateral] [Algorithmic]
            (USD Reserves) (Crypto Locked)  (Supply Control)
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the difference between a coin and a token?
A coin is the native currency of a Layer 1 blockchain used for gas fees. A token is created using smart contracts on an existing blockchain.

### Q2: What does over-collateralization mean in stablecoins?
It means locking up collateral worth more than the stablecoins minted (e.g. depositing $150 of ETH to mint $100 of DAI) to absorb asset price drops.

### Q3: How do fiat-backed stablecoins verify their reserves?
Centralized issuers hire independent accounting firms to conduct audits and publish reports of the cash reserves backing the tokens.

### Q4: What is the purpose of a utility token?
To serve as the default currency or access token within a specific decentralized application or service.

### Q5: What is the role of governance tokens?
They allow holders to vote on key protocol decisions and parameter adjustments, decentralizing control of the application.
"""
}

# 8. Cryptowallets
articles["crypto-wallets"] = {
    "title": "Crypto Wallets: Public Keys, Seed Phrases & BIP Standards",
    "tagline": "Explore key storage systems, HD wallet architectures, and recovery standards.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["cryptocurrencies-intro"],
    "related": ["mining-incentives", "blockchain-environmental-impact"],
    "practiceProblems": [],
    "markdown": """# Crypto Wallets: Public Keys, Seed Phrases & BIP Standards

A crypto wallet is not a storage vault for digital coins; it is a key management system. The tokens reside on the blockchain, and the wallet manages the cryptographic keys needed to access them. This article covers hot and cold wallets, seed phrase generation, Hierarchical Deterministic (HD) wallets, and BIP standards.

---

## 1. Hot vs. Cold Wallet Storage

Wallets are classified based on their connection to the internet:
- **Hot Wallets**: Software wallets running on internet-connected devices (e.g. browser extensions, mobile apps). They are convenient for daily trading, but vulnerable to malware and phishing attacks.
- **Cold Wallets**: Air-gapped hardware wallets (e.g. Ledger, Trezor) that keep private keys isolated from the internet. Transactions are signed locally on the device, preventing remote theft.

---

## 2. Seed Phrases & BIP-39 Standards

To make managing keys easier, modern wallets use a **Seed Phrase** (typically 12 or 24 random words) to derive keys:
- **BIP-39**: Defines the standard wordlist (2048 words) and the process for converting a seed phrase into a 512-bit binary seed.
- **Derivation**: The binary seed is used to generate the master key. If a device is lost, entering the seed phrase on a new device restores all keys.

---

## 3. Hierarchical Deterministic (HD) Wallets (BIP-32 & BIP-44)

Instead of generating new random keys for every address, modern wallets use **Hierarchical Deterministic (HD) Wallet** standards to derive a tree of keys from a single master seed:

```
                             [Master Seed]
                                   │
                           [Master Private Key]
                           /       │        \\
                       [Key 0]  [Key 1]   [Key 2]
```

- **BIP-32**: Defines the hierarchical derivation format.
- **BIP-44**: Defines a standard derivation path to organize keys by purpose, coin type, account, and address index:

$$\\text{m} / 44' / \\text{coin\\_type}' / \\text{account}' / \\text{change} / \\text{address\\_index}$$

For example, Ethereum keys are derived at path `m/44'/60'/0'/0/0`, allowing a single seed phrase to manage keys for multiple blockchains.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Does a crypto wallet store my actual digital tokens?
No. Tokens are stored on the blockchain. The wallet only manages the private keys required to sign transactions and authorize transfers.

### Q2: Why is a cold wallet more secure than a hot wallet?
Because a cold wallet keeps private keys offline, signing transactions on physical hardware to prevent online hackers from accessing keys.

### Q3: What is the purpose of the BIP-39 standard?
BIP-39 standardizes the conversion of a random seed phrase (12/24 words) into a binary seed used to derive wallet keys.

### Q4: How does a single seed phrase generate keys for different block chains?
By using BIP-44 derivation paths, which specify different coin type values (e.g. \`0\` for Bitcoin, \`60\` for Ethereum) under the master seed.

### Q5: Can I recover my wallet if I lose my seed phrase?
No. If the seed phrase is lost and the hardware device is reset, the keys cannot be recovered, resulting in the permanent loss of all assets.
"""
}

# 9. Mining & Incentive Models
articles["mining-incentives"] = {
    "title": "Mining & Incentive Models: Game Theory & Selfish Mining",
    "tagline": "Explore transaction fees, block reward halving schedules, Nash equilibria, and routing exploits.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["crypto-wallets"],
    "related": ["blockchain-environmental-impact"],
    "practiceProblems": [],
    "markdown": """# Mining & Incentive Models: Game Theory & Selfish Mining

Decentralized networks rely on economic incentives to ensure nodes behave honestly. By combining cryptography with game theory, blockchains align validator incentives with network security. This article covers block rewards, transaction fees, halving schedules, Nash equilibrium, and selfish mining attacks.

---

## 1. Block Rewards & Transaction Fees

Validators are rewarded for securing the network through two revenue streams:
1. **Block Rewards**: Newly minted native tokens distributed to the validator who proposes a valid block.
2. **Transaction Fees**: Tips paid by users to have their transactions prioritized, which become the validator's primary incentive once block rewards end.

---

## 2. Halving Schedules & Token Deflation

To control inflation and enforce scarcity, some blockchains implement periodic reward reductions called **Halving Schedules**:
- **Bitcoin Halving**: Bitcoin reduces block rewards by 50% every **210,000 blocks** (roughly 4 years).
- **Supply Cap**: This deflationary mechanism caps the total supply of Bitcoin at **21 million BTC**, protecting the currency from inflation.

```
Initial Reward: 50 BTC ──> 25 BTC ──> 12.5 BTC ──> 6.25 BTC ──> ... ──> 0 BTC (Limit)
```

---

## 3. Game Theory & The Nash Equilibrium

Blockchain security assumes that nodes act to maximize their own economic self-interest:
- **Honest Mining Nash Equilibrium**: If the network is healthy, the most profitable strategy is to build on the longest valid chain and earn block rewards.
- **Selfish Mining Attack**: A mining pool secretly builds a private chain branch. When they find blocks, they withhold them from the public. Once the private branch is longer than the public chain, they release it, invalidating the blocks mined by the rest of the network and claiming a larger share of rewards.

To counter this, protocols adjust block confirmation rules and reward distribution to make selfish mining unprofitable for all but the largest mining cartels.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a block reward halving?
A halving is a protocol event where the reward for mining new blocks is cut in half, reducing the rate at which new tokens are created.

### Q2: What happens when the block rewards hit zero?
Validators will rely entirely on transaction fees to fund operations, which must be sufficient to maintain network security.

### Q3: What is the Nash Equilibrium in blockchain consensus?
It is the state where the most profitable strategy for all miners is to behave honestly and follow consensus rules.

### Q4: How does selfish mining impact the network?
Selfish mining wastes the hashing power of honest miners by invalidating their blocks, allowing the attacker to claim a disproportionate share of rewards.

### Q5: Why do miners join mining pools?
Mining pools combine the computing power of multiple miners to solve blocks more frequently, providing participants with stable, predictable payouts.
"""
}

# 10. Environmental Considerations
articles["blockchain-environmental-impact"] = {
    "title": "Environmental Considerations: PoW Carbon Footprints & PoS Alternatives",
    "tagline": "Compare energy footprints, carbon offset indexes, and green consensus alternatives.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["mining-incentives"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Environmental Considerations: PoW Carbon Footprints & PoS Alternatives

The rise of public blockchains has sparked intense debates about their environmental impact. Because Proof of Work consensus relies on brute-force computation, it consumes significant electricity. This article covers PoW energy requirements, carbon footprints, green mining solutions, and the transition to Proof of Stake.

---

## 1. Proof of Work Energy Footprints

PoW mining requires thousands of ASIC rigs globally to solve cryptographic puzzles:
- **Hashing Rate**: The network's total computing power is measured in Exahashes per second (EH/s).
- **Power Draw**: Top-tier miners run millions of high-power hardware rigs continuously, leading to significant electrical consumption.

---

## 2. Green Mining & Carbon Offsetting

To reduce their environmental footprint, miners are transitioning to clean energy sources:
- **Stranded Energy**: Setting up mining operations near remote hydroelectric plants or wind farms where excess energy would otherwise go to waste.
- **Flared Gas Mining**: Using excess methane gas from oil wells to power mining generators, converting a high-potency greenhouse gas into CO2 while generating electricity.

---

## 3. The Proof of Stake Transition

The most effective solution to blockchain's energy usage is transitioning from Proof of Work to Proof of Stake (PoS):
- **Staking vs. Mining**: PoS replaces computational puzzles with capital staking, eliminating the need for continuous, energy-intensive hardware calculations.
- **The Ethereum Merge (2022)**: Ethereum transitioned from PoW to PoS, reducing the network's energy consumption by **99.95%** instantly.

```
PoW: [ASIC Rigs running 24/7] ──> High Energy ──> [Consensus Reached]
PoS: [Validators Staking Tokens] ──> Low Energy  ──> [Consensus Reached]
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why does Proof of Work require so much electricity?
Because miners globally compete to solve puzzles by running millions of high-power hardware rigs continuously to maximize their hash rate.

### Q2: What was the environmental impact of the Ethereum Merge?
The transition from PoW to PoS reduced Ethereum's electricity usage and carbon footprint by over \`99.95%\` instantly.

### Q3: What is stranded energy in mining?
Stranded energy is clean power generated in remote locations (like wind or hydro) that cannot easily be transmitted to cities, making it cheap and ideal for mining.

### Q4: How does flared gas mining benefit the environment?
It combusts waste methane (a potent greenhouse gas) to run mining generators, reducing overall emissions compared to venting the gas directly into the atmosphere.

### Q5: What is Proof of Useful Work?
It is a proposed consensus variation where the computational power of miners is directed to solve real-world problems (like scientific simulations) instead of arbitrary puzzles.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch2.json
with open('scratch/bc_batch2.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch2.json containing 10 articles!")
