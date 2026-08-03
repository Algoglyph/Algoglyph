import json

# We define the 10 blogs as a dictionary of articles
articles = {}

# 1. What is Blockchain
articles["what-is-blockchain"] = {
    "title": "What is Blockchain: Fundamentals of Distributed Ledgers",
    "tagline": "Discover append-only data structures, node consensus models, and the mechanics of historical immutability.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": [],
    "related": ["why-blockchain-matters", "blockchain-structure"],
    "practiceProblems": [],
    "markdown": """# What is Blockchain: Fundamentals of Distributed Ledgers

A blockchain is a decentralized, append-only distributed ledger that records transactions across a network of computers. Unlike traditional centralized databases managed by a single authority (like a bank or technology corporation), a blockchain is maintained collectively by distributed nodes. This article explores the core components of blockchain technology: consensus, cryptographic links, transparent ledger updates, and historical immutability.

---

## 1. The Append-Only Ledger & Cryptographic Hash Links

At its architectural core, a blockchain is a singly-linked list of data blocks. Every block contains a batch of transactions and a cryptographic pointer referencing the block preceding it. This pointer is the **Hash Pointer**:

$$\\text{Pointer}_{i} = \\text{SHA-256}(\\text{Block}_{i-1})$$

Because each block's header contains the hash of the previous block, modifying any transaction inside an older block changes its hash. This change propagates forward, breaking all subsequent hash pointers in the chain. To validate the ledger's integrity, nodes verify that:

$$\\text{Hash}(\\text{Block}_{i-1}) == \\text{HeaderPointer}_{i}$$

If a single bit of historical data is altered, this check fails, alerting the network to the tampering attempt.

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    Block 0    │       │    Block 1    │       │    Block 2    │
│  (Genesis)    │       │ PrevHash: H0  │       │ PrevHash: H1  │
│  Hash: H0     │◀──────│ Hash: H1      │◀──────│ Hash: H2      │
└───────────────┘       └───────────────┘       └───────────────┘
```

---

## 2. Distributed Consensus & Node Synchronizations

A database is useless without a mechanism to agree on its state. Since blockchain operates in an untrusted peer-to-peer network, nodes must reach **Consensus** without relying on a central authority.
- **Node Networks**: Network computers (nodes) host copies of the ledger and communicate updates using gossip protocols.
- **Block Proposals**: Selected nodes package pending transactions into new blocks and broadcast them.
- **Consensus Protocols**: Algorithms (like Proof of Work or Proof of Stake) define the rules for validating and appending blocks, resolving disputes when divergent chains appear.

---

## 3. Immutability & Double-Spend Protection

Immutability means that once data is written, it cannot be altered or deleted. On a blockchain, immutability is guaranteed by the physical and computational cost of rewriting history:
- **Computational Locking**: Altering historical data requires recalculating hashes for every subsequent block.
- **Double-Spend Mitigation**: Traditional digital files can be copied indefinitely. Blockchain solves the double-spend problem by verifying that tokens are dynamically deducted from the sender's address and added to the receiver's address simultaneously, preventing duplicate spending of the same token.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How does a blockchain differ from a traditional SQL database?
A SQL database is centralized, allowing administrators to modify or delete records. A blockchain is decentralized and append-only, meaning once data is committed, it cannot be altered or deleted.

### Q2: What is the Genesis Block?
The Genesis Block is the first block ever mined in a blockchain network (designated as block \`0\`). It has no previous block reference and is hardcoded into the client software.

### Q3: Can a transaction committed to a blockchain be rolled back?
In public permissionless blockchains, transactions cannot be rolled back. They can only be offset by executing a new transaction in a subsequent block.

### Q4: What is the role of a Full Node?
A full node downloads and validates the entire history of the blockchain, verifying that every transaction and block adheres to the network's consensus rules.

### Q5: What is the difference between permissioned and permissionless blockchains?
Permissionless blockchains (like Ethereum) allow anyone to join, validate transactions, and write data. Permissioned blockchains restrict access to pre-approved entities.
"""
}

# 2. Why it matters?
articles["why-blockchain-matters"] = {
    "title": "Why Blockchain Matters: Trustless Coordination & Censorship Resistance",
    "tagline": "Explore how decentralized networks eliminate middlemen, secure global liquidity, and automate agreements.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["what-is-blockchain"],
    "related": ["blockchain-applications", "blockchain-decentralization"],
    "practiceProblems": [],
    "markdown": """# Why Blockchain Matters: Trustless Coordination & Censorship Resistance

Blockchain is more than a database layout; it is a coordination system. By enabling trustless, peer-to-peer agreements, it eliminates the need for centralized intermediaries (banks, brokers, governments) to enforce trust. This article covers trustless coordination, transaction settlement efficiency, censorship resistance, and smart contract automation.

---

## 1. Trustless Coordination & Middlemen Disintermediation

In traditional transactions, trust is outsourced to centralized entities:
- **High Fees**: Middlemen charge payment processing and clearing fees.
- **Counterparty Risk**: Centralized entities can freeze accounts, go bankrupt, or misuse user data.

Blockchain introduces **Trustless Coordination**:
- Trust is placed in cryptographic math and open-source protocols, not institutions.
- Transactions settle peer-to-peer directly, removing clearinghouses and brokers, which reduces transaction fees and settlement times.

```
Traditional:  [Sender] ──> [Bank A] ──> [Clearinghouse] ──> [Bank B] ──> [Receiver]
Blockchain:   [Sender] ──────────────────(Peer-to-Peer)─────────────────> [Receiver]
```

---

## 2. Global Settlement & Liquidity Integration

Web applications typically rely on disjointed financial networks (ACH, SWIFT, credit cards). These systems settle slowly, taking days to move money across international borders.

Blockchains merge payment networks and asset ledgers into a single layer:
- **Instant Settlements**: Transactions settle in minutes or seconds, regardless of geographic distance.
- **Global Liquidity**: Anyone with an internet connection can access decentralized financial protocols, enabling frictionless cross-border micropayments.

---

## 3. Censorship Resistance & Smart Contract Automation

### Censorship Resistance
Because data is replicated across thousands of independent nodes globally, no single authority can shut down the network or rewrite transactions. This guarantees that access to financial and data networks remains open and unbiased.

### Smart Contract Automation
Smart contracts are self-executing programs stored on a blockchain that execute actions automatically when defined conditions are met:
- **No Escrow Needed**: Payments are locked in code and released automatically (e.g. shipping escrow).
- **Execution Invariance**: Once deployed, smart contracts execute exactly as written, without human intervention or risk of default.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What does 'trustless' mean in the context of blockchain?
It means that participants do not need to know or trust each other, or rely on a centralized middleman, because cryptographic code enforces the rules.

### Q2: How does blockchain achieve censorship resistance?
By storing the ledger across thousands of globally distributed nodes. Shutting down the network requires closing all nodes simultaneously, which is virtually impossible.

### Q3: What is the main benefit of smart contracts?
They automate transactions and agreements, eliminating the administrative delay, costs, and risks associated with manual escrow agents and legal middleman checks.

### Q4: How do blockchains reduce international transaction fees?
By bypassing SWIFT networks, correspondent banks, and foreign exchange brokers, allowing users to send tokens directly to other addresses globally.

### Q5: Can smart contracts be updated after deployment?
By default, smart contracts are immutable and cannot be modified. Upgrades are achieved using proxy patterns or migration paths to new contracts.
"""
}

# 3. Applications and Uses
articles["blockchain-applications"] = {
    "title": "Blockchain Applications: DeFi, Supply Chain & Digital Identity",
    "tagline": "Discover practical deployments of decentralized ledgers across finance, log tracking, and governance.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["why-blockchain-matters"],
    "related": ["blockchain-structure", "cryptography-hashing-blockchain"],
    "practiceProblems": [],
    "markdown": """# Blockchain Applications: DeFi, Supply Chain & Digital Identity

Decentralized ledgers have expanded far beyond simple currency transfers. Today, blockchains host complex applications that rebuild traditional systems. This article explores practical use cases: Decentralized Finance (DeFi), supply chain tracking, sovereign digital identity (SSI), tokenization, and decentralized governance (DAOs).

---

## 1. Decentralized Finance (DeFi) & Yield Pools

Traditional finance relies on centralized banking institutions to host liquidity and match borrowers with lenders. **Decentralized Finance (DeFi)** replaces these institutions with smart contracts:
- **Lending Pools**: Lenders deposit capital into smart contracts to earn interest, and borrowers withdraw capital by depositing collateral (e.g., Aave).
- **Automated Market Makers (AMMs)**: Decentralized exchanges (DEXs) match trades using mathematical formulas (`x * y = k`) instead of centralized order books (e.g., Uniswap).

```
                      [Liquidity Pool]
                       /            \\
                      /              \\
             [Lender Deposits]     [Borrower Withdraws]
             (Earns Yield)         (Deposits Collateral)
```

---

## 2. Supply Chain Logistics & Provenance Tracking

Supply chains are complex networks with multiple independent participants. Tracking items suffers from data silos and paper trail gaps.

Blockchain provides a shared, immutable record of truth:
- **Provenance Tracking**: Every handoff (from farm to processing plant to cargo vessel) is logged to the ledger.
- **Verification**: IoT sensors (RFIDs, temperature loggers) write telemetry directly to the blockchain, proving that perishable cargo (like vaccines or food) remained within safe limits throughout transit.

---

## 3. Sovereign Digital Identity (SSI)

Traditional online identities are fragmented across platforms (Google, Facebook, bank logins), creating centralized targets for hackers.

**Self-Sovereign Identity (SSI)** allows users to own and control their digital credentials:
- **Decentralized Identifiers (DIDs)**: Cryptographic identity keys stored on-chain.
- **Verifiable Credentials**: Authorities issue signed statements (like driver's licenses) to the user's local wallet. Users share credentials selectively, proving properties (like age) without exposing sensitive personal data.

---

## 4. Tokenization & Decentralized Autonomous Organizations (DAOs)

- **Tokenization**: Representing real-world assets (like real estate, stocks, or art) as digital tokens on-chain, enabling fractional ownership and instant transfers.
- **DAOs**: Organizations governed by smart contracts. Members pool capital, propose actions, and vote on-chain using governance tokens, bypassing traditional corporate boards.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is an Automated Market Maker (AMM)?
An AMM is a smart contract protocol that manages liquidity pools of tokens, allowing users to swap assets without a centralized broker.

### Q2: How does blockchain prevent counterfeit goods in supply chains?
By assigning an immutable, cryptographic tag (like an RFID hash) to a physical item at the source, allowing buyers to trace its entire ownership history back to the manufacturer.

### Q3: What is the core idea of Self-Sovereign Identity (SSI)?
SSI allows individuals to own and manage their digital identity keys locally, avoiding reliance on centralized authentication services.

### Q4: What are Decentralized Autonomous Organizations (DAOs)?
DAOs are member-owned organizations governed by smart contracts on-chain, where decisions are made collectively using token-based voting.

### Q5: What does tokenizing real estate accomplish?
Tokenization divides property ownership into small digital segments, allowing fractional investment and trading without expensive real estate brokers.
"""
}

# 4. Blockchain Structure
articles["blockchain-structure"] = {
    "title": "Blockchain Structure: Blocks, Headers & Merkle Trees",
    "tagline": "Deconstruct block headers, Merkle tree verification logic, and pointer chaining.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["what-is-blockchain"],
    "related": ["cryptography-hashing-blockchain", "blockchain-decentralization"],
    "practiceProblems": [],
    "markdown": """# Blockchain Structure: Blocks, Headers & Merkle Trees

To write applications for blockchain, engineers must understand the physical structure of data storage on-chain. A blockchain's ledger is composed of chained blocks, block headers, and Merkle tree transaction mappings. This article covers the anatomy of a block, how headers chain together, and how Merkle trees enable efficient validation of large transaction datasets.

---

## 1. Anatomy of a Block

A block is divided into two primary sections: the **Block Header** (metadata) and the **Block Body** (transaction data):

| Component | Category | Description |
| :--- | :--- | :--- |
| **Previous Block Hash** | Header | The cryptographic pointer linking this block to its parent. |
| **Merkle Root Hash** | Header | A single hash representing all transactions in the block body. |
| **Timestamp** | Header | The Unix epoch time when the block was created. |
| **Nonce** | Header | A mutable value adjusted by miners to solve consensus puzzles. |
| **Difficulty Target** | Header | The dynamic threshold the block hash must satisfy. |
| **Transaction List** | Body | The raw list of transaction payloads included in the block. |

```
┌──────────────────────────────────────────────┐
│                 Block Header                 │
│  [PrevHash] [MerkleRoot] [Timestamp] [Nonce]  │
├──────────────────────────────────────────────┤
│                  Block Body                  │
│  [Tx0] [Tx1] [Tx2] [Tx3] ... [TxN]           │
└──────────────────────────────────────────────┘
```

---

## 2. Merkle Tree & Binary Hash Verification

A block can contain thousands of transactions. To verify that a specific transaction exists within a block without downloading the entire block body, blockchains use a binary hash tree called a **Merkle Tree**.

### Merkle Tree Construction
1. Every transaction payload is hashed: $H_A = \\text{Hash}(Tx_A)$.
2. Adjacent hashes are combined and hashed again: $H_{AB} = \\text{Hash}(H_A + H_B)$.
3. This process repeats recursively until a single hash remains—the **Merkle Root**:

```
                       [Merkle Root (H_ABCD)]
                            /          \\
                           /            \\
                    [Hash H_AB]      [Hash H_CD]
                    /       \\        /       \\
                  H_A       H_B    H_C       H_D
                  │         │      │         │
                 Tx_A      Tx_B   Tx_C      Tx_D
```

### Log-Time Verification ($O(\\log N)$)
To prove that $Tx_C$ is included in the block, a node only needs to provide:
- The hash of the target transaction $H_C$.
- The sibling hashes along the path to the root (known as the **Merkle Proof**): $H_D$ and $H_{AB}$.
- The node can then calculate:
  $$H_{CD} = \\text{Hash}(H_C + H_D)$$
  $$\\text{Root} = \\text{Hash}(H_{AB} + H_{CD})$$
If the calculated root matches the block header's Merkle Root, the transaction is verified. The check requires only $\\log_2(N)$ hashes, making it incredibly fast.

---

## 3. Block Index Linkages & Cryptographic Pointers

Each block header references the hash of the preceding block header:
- This design creates a sequential history chain.
- If an attacker alters a transaction in Block 1, its Merkle Root changes.
- Consequently, Block 1's header hash changes.
- Since Block 2's header references Block 1's hash, Block 2's header hash changes as well, invalidating the entire subsequent chain.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a Merkle Root?
A Merkle Root is a single hash value representing the root of a Merkle Tree, which summarizes all transactions inside a block body.

### Q2: How does Merkle proof verification achieve logarithmic complexity?
Because it only requires verifying the sibling hashes along the path from the target transaction to the root, rather than checking every transaction in the block.

### Q3: Why is transaction data separated from the block header?
This separation allows lightweight clients (light nodes) to download only the small block headers ($\approx 80$ bytes) to verify transaction existence using Merkle proofs, saving storage and bandwidth.

### Q4: What happens if a block has an odd number of transactions when building a Merkle tree?
The last transaction hash is duplicated and paired with itself to maintain the binary tree structure.

### Q5: Why is a block hash calculated from the header, not the body?
Because the header already contains the Merkle Root, which summarizes the block body. Hashing the header validates all transactions inside the body.
"""
}

# 5. Cryptography & Hashing
articles["cryptography-hashing-blockchain"] = {
    "title": "Cryptography & Hashing: SHA-256 & Public-Key Signatures",
    "tagline": "Explore hash properties, asymmetric keypairs, elliptic curves, and digital signature verification.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["blockchain-structure"],
    "related": ["blockchain-decentralization", "decentralization-vs-trust"],
    "practiceProblems": [],
    "markdown": """# Cryptography & Hashing: SHA-256 & Public-Key Signatures

Cryptography guarantees the security, privacy, and authenticity of transactions on a blockchain. Blockchains rely on cryptographic hash functions and public-key asymmetric cryptography. This article covers hash algorithms (SHA-256), the public/private key relationship, Elliptic Curve Cryptography (ECC), and digital signature verification.

---

## 1. Cryptographic Hash Functions & SHA-256

A cryptographic hash function takes an input of any size and produces a fixed-size string of characters. Blockchains use **SHA-256** (Secure Hash Algorithm 256-bit). To be suitable for blockchain, hash functions must satisfy five criteria:
1. **Deterministic**: The same input always produces the exact same output.
2. **Quick Computation**: The hash must be calculated rapidly by nodes.
3. **Preimage Resistant** (One-Way): It is computationally impossible to reverse-engineer the input from the hash output.
4. **Avalanche Effect**: Changing a single bit in the input produces a radically different hash output.
5. **Collision Resistant**: It is computationally infeasible to find two different inputs that produce the same hash output.

```
Input: "hello" ──> [SHA-256] ──> 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
Input: "hellp" ──> [SHA-256] ──> 0b5406c138f24419515904df8b53d8a57e62a5b17cf907cfb910e53a3e6396f4
```

---

## 2. Public-Key Asymmetric Cryptography

Unlike symmetric cryptography (where the same key encrypts and decrypts), asymmetric cryptography uses a **Keypair**:
- **Private Key**: A randomly generated 256-bit number kept secret by the owner. It is used to generate digital signatures to authorize transactions.
- **Public Key**: Derived mathematically from the private key. It is shared publicly and is used by nodes to verify that a transaction was signed by the matching private key.

```
[Private Key] ──(Elliptic Curve Multiplication)──> [Public Key] ──> [Wallet Address]
```

---

## 3. Elliptic Curve Digital Signature Algorithm (ECDSA)

Blockchains derive public keys using **Elliptic Curve Cryptography (ECC)** (specifically the `secp256k1` curve in Bitcoin and Ethereum). 

The public key ($K$) is derived by multiplying the private key ($k$) by a generator point ($G$) on the curve:

$$K = k \\times G$$

While curve multiplication is fast, reversing the calculation to find the private key from a public key is mathematically infeasible—a constraint known as the **Discrete Logarithm Problem**.

### Digital Signatures (ECDSA)
When sending tokens, your wallet signs the transaction data with your private key:
- **Sign**: `Signature = Sign(TransactionData, PrivateKey)`
- **Verify**: Nodes verify the transaction using: `Verify(TransactionData, Signature, PublicKey)`

If `Verify` returns true, nodes know the transaction is authentic, preventing attackers from modifying transaction parameters.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why is SHA-256 described as a 'one-way' function?
Because it is computationally impossible to calculate or reverse-engineer the original input string from the hash output.

### Q2: What is the avalanche effect in hashing?
It is the property where changing a tiny detail of the input (like changing a lowercase letter to uppercase) produces a completely different hash output.

### Q3: Can a public key be used to find its matching private key?
No. The derivation uses elliptic curve math, which is one-way. Finding the private key requires solving the Discrete Logarithm Problem, which is computationally infeasible.

### Q4: What is the risk if a private key is exposed?
Anyone who obtains your private key gains complete control over your wallet, allowing them to sign transactions and transfer all assets.

### Q5: How does a blockchain address differ from a public key?
An address is typically a hashed and checksummed version of the public key, designed to be shorter and less error-prone when copied.
"""
}

# 6. Decentralization
articles["blockchain-decentralization"] = {
    "title": "Blockchain Decentralization: Node Topologies & P2P Networks",
    "tagline": "Analyze distributed state synchronization, node clustering, and peer-to-peer network routing.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["cryptography-hashing-blockchain"],
    "related": ["decentralization-vs-trust", "blockchain-networks"],
    "practiceProblems": [],
    "markdown": """# Blockchain Decentralization: Node Topologies & P2P Networks

Decentralization is the core security feature of blockchain. By distributing data and decision-making power across a peer-to-peer (P2P) network, blockchains eliminate single points of failure. This article covers distributed state synchronization, peer-to-peer networks, node topologies, and the mechanics of 51% attacks.

---

## 1. Peer-to-Peer (P2P) Network Architecture

A blockchain operates over a decentralized P2P network. All nodes are equal peers, acting as both clients and servers:
- **Discovery**: When a new node joins, it queries bootstrap nodes to obtain active peer IP addresses.
- **Gossip Protocol**: Nodes broadcast new transactions and blocks to adjacent peers. The network gossips updates until they reach all nodes within seconds.

```
          [Node] ────── [Node]
            │   ╲        ╱  │
            │     [Node]    │
            │   ╱        ╲  │
          [Node] ────── [Node]
```

---

## 2. Node Typologies & Ledger Replication

To maintain security and efficiency, nodes specialize in different roles:
- **Full Nodes**: Download, validate, and store the entire blockchain history, enforcing the network's consensus rules.
- **Light Nodes**: Store only block headers. They query full nodes to verify transaction details using Merkle proofs, consuming minimal storage.
- **Archival Nodes**: Store the complete history of all blocks and every historical state transition, which is essential for indexing services.

---

## 3. The 51% Attack & Double-Spend Vulnerabilities

Decentralized security relies on the assumption that the majority of network participants are honest. If a single entity or cartel gains control of **more than 50%** of the network's validation power (hash rate in PoW or staked tokens in PoS), they can execute a **51% Attack**:
- **Reorganize Blocks**: The attacker secretly mines a private chain branch that is longer than the public chain.
- **Double-Spend**: They execute a transaction on the public chain, swap tokens, and then broadcast their longer private chain. The network's consensus rules force nodes to accept the longer chain, erasing the public transaction and allowing the attacker to spend the tokens again.

The attacker cannot modify historic transactions, steal tokens they do not own, or rewrite consensus rules, as honest full nodes will reject invalid blocks.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a gossip protocol in blockchain networks?
A gossip protocol is a communication method where nodes broadcast new transactions and blocks to their neighbors, propagating data across the network.

### Q2: Can a full node run without storing the entire blockchain history?
Yes. Full nodes can run in pruned mode, which validates all blocks but deletes older transaction data once validated to save disk space.

### Q3: What can an attacker accomplish with a 51% attack?
An attacker can double-spend tokens, block transaction confirmations, and reorganize recent blocks. They cannot steal tokens from other addresses or alter historical blocks.

### Q4: Why do light nodes rely on full nodes?
Light nodes do not store transaction history. They request Merkle proofs from full nodes to verify that a transaction exists in a block.

### Q5: How does blockchain prevent Sybil attacks?
Blockchains use consensus mechanisms (like PoW or PoS) that require validators to commit expensive resources (hardware power or token capital), preventing attackers from creating fake nodes to take over the network.
"""
}

# 7. Decentralization vs Trust
articles["decentralization-vs-trust"] = {
    "title": "Decentralization vs. Trust: The Scalability Trilemma & Tradeoffs",
    "tagline": "Explore mathematical trust shifts, network latency limits, and the scalability trilemma bounds.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["blockchain-decentralization"],
    "related": ["blockchain-networks", "proof-of-work"],
    "practiceProblems": [],
    "markdown": """# Decentralization vs. Trust: The Scalability Trilemma & Tradeoffs

Designing a decentralized system requires balancing trade-offs. Moving from centralized trust models to mathematical consensus systems introduces latency and throughput constraints. This article covers the transition from institutional trust to mathematical trust, network latency limits, and the Scalability Trilemma.

---

## 1. Shifting Trust: Institutional to Mathematical

Centralized systems rely on trust in institutions (banks, courts, corporations):
- **Sovereign Trust**: Trusting that banks clear checks correctly and courts resolve disputes fairly.
- **Mathematical Trust**: Replacing human discretion with cryptographic math and decentralized consensus. Transactions execute automatically based on code rules, reducing the risk of human error or bias.

---

## 2. The Scalability Trilemma Invariant

Coined by Vitalik Buterin, the **Scalability Trilemma** states that a blockchain database can achieve only two of the three core properties simultaneously:

```
                  [Decentralization]
                         /\
                        /  \
                       /    \
                      /      \
        [Security] ───┴──────┴─── [Scalability]
```

### The Three Tradeoffs
1. **Decentralization**: The network is run by thousands of globally distributed nodes.
2. **Security**: The network resists attacks, double-spends, and transaction reorgs.
3. **Scalability**: The network processes high transaction volumes with low latency.

### Trilemma Implementations
- **Decentralized & Secure (Bitcoin/Ethereum L1)**: Thousands of nodes validate transactions, providing high security but limiting throughput ($\approx 15$ transactions per second).
- **Secure & Scalable (Consortium chains / L2s)**: Restricting node validation access to a small group of nodes speeds up consensus, but reduces decentralization.

---

## 3. Network Latency & Consensus Overhead

Decentralized databases are slower than centralized databases:
- **Centralized Databases**: A single database server processes queries in milliseconds.
- **Decentralized Databases**: Updates must propagate to thousands of nodes globally, requiring consensus confirmations that add network latency and overhead.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the Scalability Trilemma?
The Scalability Trilemma states that a blockchain can only optimize two of its three core properties (Decentralization, Security, Scalability) at any one time.

### Q2: Why are Layer 1 blockchains typically slow?
Because they prioritize decentralization and security, requiring thousands of global nodes to validate and reach consensus on every transaction.

### Q3: How do Layer 2 solutions resolve the scalability trilemma?
Layer 2 solutions (like Rollups) process transactions off-chain for speed, and bundle them into single proofs submitted to Layer 1 to maintain security.

### Q4: Why does decentralization increase network latency?
Because updating the ledger requires broadcasting data across a global peer-to-peer network and waiting for nodes to reach consensus, adding network delays.

### Q5: What is the risk of optimizing for scalability alone?
Optimizing only for scalability usually requires reducing the number of validating nodes, which centralizes the network and increases security risks.
"""
}

# 8. Blockchain Networks
articles["blockchain-networks"] = {
    "title": "Blockchain Networks: Public, Private & Consortium Topologies",
    "tagline": "Compare permissioned and permissionless networks, node access rights, and governance structures.",
    "category": "Full Stack Development",
    "readTime": 12,
    "prerequisites": ["decentralization-vs-trust"],
    "related": ["proof-of-work", "proof-of-stake"],
    "practiceProblems": [],
    "markdown": """# Blockchain Networks: Public, Private & Consortium Topologies

Blockchain networks are configured based on their target use case. The rules governing who can read data, write transactions, and validate blocks determine a network's structure. This article compares public permissionless networks, private permissioned networks, and consortium systems.

---

## 1. Public Permissionless Networks

Public blockchains (like Bitcoin and Ethereum) are open and permissionless:
- **Open Access**: Anyone can download the client software, read the ledger, submit transactions, and act as a validator.
- **Censorship Resistant**: No central authority can block users or alter historical blocks.
- **Incentive Systems**: Use built-in tokens to reward validators for securing the network.

---

## 2. Private Permissioned Networks

Private blockchains (like Hyperledger Fabric or Corda) are restricted and permissioned:
- **Controlled Access**: A single organization controls who can join the network, read data, and validate transactions.
- **No Mining Required**: Since all participants are known and vetted, private networks use lightweight crash fault tolerant (CFT) consensus algorithms, yielding high transaction speeds.
- **Data Privacy**: Ideal for corporate settings where financial details or supply chain data must remain confidential.

---

## 3. Consortium (Federated) Blockchains

Consortium networks balance public and private properties:
- **Group Governance**: Instead of a single organization, a group of pre-selected institutions (like a consortium of banks or shipping lines) governs the network.
- **Shared Validation**: Node validation rights are distributed among the consortium members (e.g., 10 institutions must reach consensus).

```
┌─────────────────────────────────────────────────────────────┐
│                       Network Tiers                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│    Public       │    Consortium   │       Private           │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Open to All     │ Group Governed  │ Single Admin            │
│ Permissionless  │ Permissioned    │ Permissioned            │
│ Token Incentives│ High Throughput │ Immediate Settlements   │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Public and Private blockchains?
Public blockchains are open to anyone to validate and write data. Private blockchains restrict ledger access and validation rights to authorized entities.

### Q2: Why do private blockchains not require energy-intensive mining?
Because all validating nodes are known and trusted, allowing the network to use fast, lightweight consensus algorithms.

### Q3: What is a Consortium blockchain?
A consortium blockchain is a federated network where governance and validation rights are shared among a group of pre-selected organizations.

### Q4: How is data privacy managed in permissioned networks?
Permissioned networks use channel isolation and private data collections to restrict transaction visibility to the involved parties.

### Q5: Which network type is best for enterprise supply chains?
Consortium blockchains are typically best, as they allow multiple independent business partners to collaborate on a shared ledger without exposing sensitive data publicly.
"""
}

# 9. Proof of Work
articles["proof-of-work"] = {
    "title": "Proof of Work: Mining Mechanics, Difficulty Adjustments & ASICs",
    "tagline": "Deconstruct target puzzles, dynamic difficulty recalculations, block rewards, and mining hardware.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["blockchain-networks"],
    "related": ["proof-of-stake"],
    "practiceProblems": [],
    "markdown": """# Proof of Work: Mining Mechanics, Difficulty Adjustments & ASICs

Consensus mechanisms ensure all nodes in a decentralized network agree on the same history of transactions. Proof of Work (PoW) is the consensus mechanism introduced by Bitcoin. This article covers mining mechanics, hash puzzles, target calculations, difficulty adjustments, and the evolution of mining hardware.

---

## 1. The Hash Puzzle & Nonce Manipulation

In a PoW network, miners compete to add the next block by solving a mathematical puzzle. The puzzle requires finding a block header hash that is **less than or equal to a target value**:

$$\\text{SHA-256}(\\text{SHA-256}(\\text{BlockHeader})) \\le \\text{Target}$$

Because cryptographic hash outputs are unpredictable, miners cannot compute the correct input directly. Instead, they must use brute force, modifying a variable field in the header called the **Nonce** (number used once) and recalculating the hash repeatedly:

```
[Block Header Elements + Nonce] ──> [SHA-256] ──> [Result Hash]
                                                       │
         ┌──────────── (Hash <= Target?) ──────────────┤
         ▼ Yes                                         ▼ No
  [Block Validated & Broadcast]                  [Increment Nonce & Retry]
```

Once a miner finds a winning nonce, they broadcast the block. Other nodes verify the solution instantly in a single hash operation, checking that the block hash satisfies the difficulty target.

---

## 2. Dynamic Difficulty Adjustments

If the network's total hash rate (computing power) increases, miners will solve puzzles faster, causing blocks to be mined too quickly. To keep block creation times stable (e.g., 10 minutes in Bitcoin), the network adjusts the difficulty target dynamically.

In Bitcoin, the target is adjusted every **2016 blocks** (roughly two weeks) using the formula:

$$\\text{NewTarget} = \\text{CurrentTarget} \\times \\frac{\\text{ActualTimeFor2016Blocks}}{\\text{ExpectedTimeFor2016Blocks}}$$

- **If Actual Time < Expected Time**: The target value is lowered, making it harder to find a winning hash (higher difficulty).
- **If Actual Time > Expected Time**: The target value is raised, making it easier to find a winning hash (lower difficulty).

---

## 3. The Evolution of Mining Hardware

As competition in PoW networks grew, mining hardware evolved to maximize hashing speeds:
1. **CPU Mining**: Early days; general-purpose processors.
2. **GPU Mining**: Graphical cards; optimized for running simple hash operations in parallel.
3. **FPGA Mining**: Field Programmable Gate Arrays; programmable chips configured for specific hashing algorithms.
4. **ASIC Mining**: Application-Specific Integrated Circuits; custom silicon chips built for a single hashing algorithm (like SHA-256). ASICs are orders of magnitude faster and more energy-efficient than general-purpose hardware.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a Nonce?
A Nonce is a mutable 32-bit field in a block header that miners modify repeatedly to change the block's hash output until it satisfies the difficulty target.

### Q2: Why does the difficulty target adjust dynamically?
To keep block times stable regardless of whether computing power joins or leaves the network.

### Q3: How do nodes verify that a miner solved the hash puzzle?
By hashing the received block header once with the provided nonce and verifying that the resulting hash is less than the difficulty target.

### Q4: What is an ASIC miner?
An ASIC is a custom silicon chip designed solely to execute a specific hashing algorithm (like SHA-256) at maximum speed and efficiency.

### Q5: What is the environmental concern associated with Proof of Work?
PoW requires miners globally to run millions of high-power hardware rigs continuously, consuming significant electrical energy.
"""
}

# 10. Proof of Stake
articles["proof-of-stake"] = {
    "title": "Proof of Stake: Validator Selection, Slashing & Staking Economics",
    "tagline": "Analyze stake allocations, block verification rules, slashing penalties, and nothing-at-stake mitigations.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["proof-of-work"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Proof of Stake: Validator Selection, Slashing & Staking Economics

Proof of Stake (PoS) is an energy-efficient alternative to Proof of Work. Instead of requiring miners to run power-hungry hardware to solve puzzles, PoS requires participants to commit capital (tokens) to secure the network. This article covers validator selection, slashing security penalties, the nothing-at-stake dilemma, and staking economics.

---

## 1. Validator Selection & Block Proposals

In a PoS network, participants lock up tokens (stake) in a smart contract to qualify as **Validators**:
- **Selection Probability**: The probability of a validator being chosen to propose the next block is proportional to the size of their stake (e.g. holding 10% of staked tokens yields a 10% chance of proposing a block).
- **Attestation**: Other validators verify the proposed block and submit signatures (attestations) to validate it.

```
[Lock Tokens (Stake)] ──> [Active Validator List] ──> [Selected to Propose Block]
                                                               │
     ┌────────────────── (Attestation Phase) ──────────────────┘
     ▼
[Block Appended & Rewards Issued]
```

---

## 2. Staking Security & Slashing Protocols

To enforce honesty without physical hardware costs, PoS networks implement financial penalties called **Slashing**:
- **Double Signing**: If a validator signs two conflicting blocks for the same slot, they are flagged as malicious.
- **Offline Penalties**: If a validator goes offline and fails to attest blocks, they lose a portion of their stake.
- **Slashing Execution**: The network automatically confiscates a portion of the validator's staked tokens and ejects them from the active validator set.

---

## 3. The Nothing-at-Stake Dilemma & Mitigations

In PoW, if the chain splits (forks), miners must split their computing power to mine both chains, which is expensive. In PoS, proposing blocks on both forks costs nothing, leading to the **Nothing-at-Stake Dilemma**:
- **Vulnerability**: Validators could attest to both forks to ensure they earn rewards regardless of which chain wins, preventing the fork from resolving.
- **Mitigation**: Modern PoS protocols (like Ethereum's Casper) implement rules that detect double-voting and slash validators who sign blocks on conflicting forks.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How does Proof of Stake save energy compared to Proof of Work?
PoS replaces physical mining rigs with digital token staking, eliminating the need for continuous, energy-intensive hardware computations.

### Q2: What is slashing in Proof of Stake?
Slashing is a security penalty where the network confiscates a portion of a validator's staked tokens for malicious behavior like double-signing or prolonged offline status.

### Q3: What is the 'Nothing-at-Stake' dilemma?
The nothing-at-stake dilemma is a scenario where validators vote on conflicting forks of a chain because it costs them no resources, preventing the network from resolving splits.

### Q4: What is Delegated Proof of Stake (DPoS)?
DPoS is a variation where token holders vote to elect a small group of delegates who are responsible for validating transactions and proposing blocks.

### Q5: What is liquid staking?
Liquid staking allows users to stake tokens and receive a derivative token in return, allowing them to earn staking rewards while keeping their assets liquid.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch1.json
with open('scratch/bc_batch1.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch1.json containing 10 articles!")
