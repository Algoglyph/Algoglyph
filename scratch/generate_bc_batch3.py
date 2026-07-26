import json

articles = {}

# 1. Ethereum (ethereum-network)
articles["ethereum-network"] = {
    "title": "Ethereum Network: EVM Architecture & State Transition Models",
    "tagline": "Deconstruct stack-based runtimes, account structures, and gas computation loops.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["proof-of-stake"],
    "related": ["l2-blockchains", "smart-contract-languages"],
    "practiceProblems": [],
    "markdown": """# Ethereum Network: EVM Architecture & State Transition Models

While Bitcoin was built as a decentralized payment network, Ethereum was designed as a global, decentralized computer. It introduced the **Ethereum Virtual Machine (EVM)**, allowing developers to deploy and execute self-executing smart contracts. This article covers EVM stack-based runtimes, EOAs vs. contract accounts, state-transition models, and gas mechanics.

---

## 1. EVM Architecture: Stack, Memory & Storage

The EVM is a stack-based virtual machine:
- **The Stack**: All computations are performed on a stack of 256-bit words, with a maximum depth of 1024 elements. Standard mathematical and logical operations pop inputs from the stack and push results back.
- **Memory**: A volatile, byte-addressable linear memory space used for temporary data storage during transaction execution. Memory is cleared after contract execution completes.
- **Storage**: A non-volatile, persistent key-value store mapping 256-bit keys to 256-bit values. Storage writes are written directly to the blockchain's state tree, making them computationally expensive.

```
       ┌────────────────────────┐
       │   EVM Execution Frame  │
       ├──────────┬─────────────┤
       │ Stack    │ Memory      │
       │ (256-bit)│ (Volatile)  │
       └──────────┴─────────────┘
                  │
                  ▼ (Persistent Writes)
       ┌────────────────────────┐
       │ Contract Storage Trie  │
       └────────────────────────┘
```

---

## 2. Account Models: EOAs vs. Contract Accounts

Ethereum manages state using two distinct account types:
1. **Externally Owned Accounts (EOAs)**: Controlled by private keys. They contain a balance (in Ether) and a transaction nonce. EOAs can initiate transactions but do not contain code.
2. **Contract Accounts**: Managed by compiled bytecode. They contain a balance, code bytecode, and a private storage trie. They cannot initiate transactions on their own; their code executes only when triggered by a transaction sent from an EOA or another contract.

---

## 3. State-Transition Model & Gas Mechanics

The Ethereum network is a **State Machine**. When a block executes, it applies a state transition function:

$$\\sigma_{t+1} = \\Upsilon(\\sigma_t, T)$$

Where $\\sigma$ is the network state and $T$ is the transaction execution payload.

### Gas Fees & Infinite Loop Prevention
To prevent nodes from running infinite loops (e.g. `while(true)`), Ethereum requires users to pay for execution using **Gas**:
- Each EVM instruction (opcode) costs a set amount of gas (e.g., `ADD` costs 3 gas, `SSTORE` costs up to 20,000 gas).
- Users specify a `Gas Limit` when sending transactions.
- If execution runs out of gas before completing, the transaction is aborted, state changes are reverted, and the gas is kept by the validator to pay for execution.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the difference between EVM Memory and Storage?
Memory is temporary and volatile, disappearing after contract execution completes. Storage is persistent and written to the blockchain, making it significantly more expensive.

### Q2: Can a contract account initiate a transaction independently?
No. Contract accounts can only execute code when triggered by an incoming transaction from an EOA or a call from another contract.

### Q3: Why does write access cost so much gas?
Because writing to contract storage modifies the global state database on thousands of nodes worldwide, requiring substantial network resources.

### Q4: What is the EVM stack overflow risk?
If a contract execution attempts to push more than 1024 elements onto the stack, the EVM triggers a stack overflow exception and halts execution.

### Q5: How does the gas price auctions work?
Users bid a gas price (in Gwei) per gas unit. Validators select transactions with higher bids to maximize their block rewards.
"""
}

# 2. Polygon (polygon-network)
articles["polygon-network"] = {
    "title": "Polygon Network: Sidechains, Checkpoints & Commit Mechanics",
    "tagline": "Explore L2 sidechain architectures, Heimdall/Bor software tiers, and L1 checkpoint security.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["ethereum-network"],
    "related": ["l2-blockchains", "bnb-chain"],
    "practiceProblems": [],
    "markdown": """# Polygon Network: Sidechains, Checkpoints & Commit Mechanics

As Ethereum usage grew, high gas fees pushed developers to seek scaling alternatives. Polygon PoS is a prominent commit-chain scaling solution. This article covers Polygon's dual-layered architecture, sidechain validation, and how it commits state checkpoints to secure transactions on Ethereum Layer 1.

---

## 1. Dual-Layer Software Architecture: Bor & Heimdall

Polygon PoS divides block production and validation between two specialized software layers:
1. **Bor Layer (Block Production)**: A fast Geth-derived EVM client responsible for packaging transactions and producing blocks. It updates the chain state rapidly, keeping block confirmation times below 2 seconds.
2. **Heimdall Layer (Validation & Checkpointing)**: A Tendermint-based PoS engine that monitors Bor block production, validates blocks, and aggregates transaction signatures into state checkpoints.

```
       [Bor Layer] ──(Produce Blocks)──> [Heimdall Layer] ──(Checkpoint Proofs)──> [Ethereum L1]
```

---

## 2. Commit Checkpoints & L1 Security Anchoring

Unlike independent sidechains, Polygon secures its history by anchoring state checkpoints directly to Ethereum Layer 1:
- **Merkle Roots**: Heimdall validators compile Bor block hashes into a Merkle root representation.
- **Checkpoint Submission**: The primary validator submits this Merkle root to a smart contract on the Ethereum mainnet.
- **Security Guarantee**: Once the checkpoint transaction is confirmed on Ethereum L1, Polygon's history becomes immutable. Attempting to reorganize Polygon history requires reorganizing the Ethereum L1 mainnet.

---

## 3. Bridging Assets: Plasma & PoS Bridges

Polygon features two asset bridges:
- **PoS Bridge**: Secured by the validator set. It offers fast deposits and withdrawals (typically 30 minutes to 3 hours), making it ideal for standard ERC tokens.
- **Plasma Bridge**: Secured by Ethereum L1 fraud proofs. It provides higher security guarantees but requires a 7-day challenge period before funds can be withdrawn.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the role of the Heimdall layer in Polygon?
Heimdall is a validation layer that monitors block production, verifies Bor blocks, and aggregates signatures to submit checkpoints to Ethereum L1.

### Q2: Why does the Plasma bridge require a 7-day withdrawal delay?
To allow network participants to detect and submit fraud proofs on Ethereum L1 if validators attempt to process invalid withdrawals.

### Q3: How does Polygon PoS achieve lower gas fees than Ethereum?
By offloading transactions to its Bor sidechain layer, which uses a smaller validator set and faster block times, increasing throughput.

### Q4: What happens if Polygon validators stop submitting checkpoints?
Transactions continue on the sidechain, but the security guarantee anchored to Ethereum L1 stalls until checkpoint submissions resume.

### Q5: Is G-MAV (MATIC) token still used on Polygon?
Yes, G-MAV (or POL after upgrades) is used for staking to secure the Heimdall layer and paying gas fees on the Bor sidechain.
"""
}

# 3. BNB Chain (bnb-chain)
articles["bnb-chain"] = {
    "title": "BNB Chain: Dual-Chain Architecture & Proof of Staked Authority",
    "tagline": "Compare Binance Beacon Chain, BSC EVM runtimes, and PoSA consensus tradeoffs.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["ethereum-network"],
    "related": ["polygon-network", "gnosis-chain"],
    "practiceProblems": [],
    "markdown": """# BNB Chain: Dual-Chain Architecture & Proof of Staked Authority

BNB Chain (formerly Binance Smart Chain) provides a high-throughput, EVM-compatible environment. It achieves scale by using a centralized validator topology. This article covers BNB Chain's dual-chain structure, the Proof of Staked Authority (PoSA) consensus model, and its scalability trade-offs.

---

## 1. Dual-Chain Infrastructure: Beacon Chain & BSC

Initially, BNB Chain operated as a dual-chain system to separate governance from execution:
- **Binance Beacon Chain (BC)**: Optimized for fast, secure coin swaps and governance staking, using non-EVM logic.
- **Binance Smart Chain (BSC)**: An EVM-compatible execution layer designed for deploying smart contracts and hosting decentralized applications (DApps).

To simplify operations, the network phased out the Beacon Chain, merging assets and staking directly into the EVM BSC layer.

---

## 2. Proof of Staked Authority (PoSA) Consensus

BSC uses **Proof of Staked Authority (PoSA)** to reach consensus:
- **Limited Validator Set**: Validation is restricted to a small number of active validators (typically 21 to 40 nodes) elected daily.
- **Staking Power**: Validators are selected based on the total amount of BNB staked by themselves and delegators.
- **Authority Validation**: The active validator set takes turns proposing and validating blocks in a round-robin format, keeping block production fast and energy usage low.

```
[Staked BNB Balance] ──> [Top 21-40 Validators Chosen] ──> [Round-Robin Block Production]
```

---

## 3. Centralization vs. Scaling Tradeoffs

BSC provides low transaction fees and high speeds, but sacrifices decentralization:
- **High Performance**: Processing thousands of transactions per second with sub-dollar fees.
- **Censorship Vulnerability**: Since validation is concentrated in a small group of high-stake validators, the network is more vulnerable to censorship or collusion than Ethereum.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is Proof of Staked Authority (PoSA)?
PoSA is a consensus mechanism combining Proof of Stake and Proof of Authority, where validation rights are restricted to a small set of high-stake validators.

### Q2: Why did BNB Chain merge its dual-chain structure?
To streamline staking, improve execution speeds, and reduce the complexity of cross-chain asset transfers.

### Q3: What is the main security risk of BNB Chain?
The concentrated validator set increases the risk of validator collusion, making the network more centralized than public networks like Ethereum.

### Q4: How do delegators participate in BSC consensus?
Delegators stake their BNB tokens to support specific validators, earning a share of the transaction fees collected by those validators.

### Q5: Is BNB Chain fully EVM-compatible?
Yes. BSC runs a modified version of the EVM, allowing developers to deploy Solidity contracts using tools like Hardhat or Foundry.
"""
}

# 4. Gnosis Chain (gnosis-chain)
articles["gnosis-chain"] = {
    "title": "Gnosis Chain: Stable Gas, xDai Economy & Validator Distributions",
    "tagline": "Explore dual-token economies, stablecoin transaction gas, and decentralized staking networks.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["bnb-chain"],
    "related": ["avalanche-network", "fantom-network"],
    "practiceProblems": [],
    "markdown": """# Gnosis Chain: Stable Gas, xDai Economy & Validator Distributions

Gnosis Chain (formerly xDai Chain) is an EVM-compatible network designed to provide stable, low-cost transactions. Unlike chains where gas fees fluctuate wildly in fiat terms, Gnosis Chain utilizes a stablecoin as its native gas asset. This article covers Gnosis Chain's dual-token economy, validator distribution, and its infrastructure properties.

---

## 1. Dual-Token Architecture: xDai & GNO

Gnosis Chain separates transaction fees from staking incentives using two tokens:
1. **xDai (Native Gas Asset)**: A stablecoin pegged 1:1 to the US Dollar. All transaction gas fees are paid in xDai, protecting users and developers from gas price volatility.
2. **GNO (Staking & Governance)**: The network's governance token. Validators stake GNO to secure the consensus layer, earning rewards paid in GNO.

```
       ┌────────────────────────────────────────────────────────┐
       │                 Gnosis Chain Economy                   │
       ├───────────────────────────┬────────────────────────────┤
       │ xDai (Stable Gas Token)   │ GNO (Staking & Governance) │
       │ - Pegged 1:1 to USD       │ - Locked by Validators     │
       │ - Predictable TX Costs    │ - Secures Network State    │
       └───────────────────────────┴────────────────────────────┘
```

---

## 2. POS Consensus & Validator Decentralization

Gnosis Chain uses Ethereum's consensus engine layout (Beacon Chain architecture):
- **Staking Threshold**: Requires validators to stake GNO tokens.
- **Node Distribution**: By keeping hardware requirements low and utilizing a decentralized validator model, Gnosis Chain is secured by over 100,000 validators globally, making it one of the most decentralized EVM networks.

---

## 3. Bridging Assets to Gnosis Chain

Assets are bridged from Ethereum using the **OmniBridge**:
- Users bridge DAI from Ethereum, which is locked in a vault contract.
- The Gnosis Chain mints an equivalent amount of xDai.
- When xDai is bridged back to Ethereum, the xDai is burned, and the original DAI is released.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is xDai?
xDai is Gnosis Chain's native stable gas token, pegged 1:1 to the US Dollar to ensure predictable transaction costs.

### Q2: What is the role of GNO on Gnosis Chain?
GNO is the staking and governance token that validators lock up to secure the network and earn consensus rewards.

### Q3: How does Gnosis Chain achieve high decentralization?
By adopting Ethereum's Beacon Chain model and keeping validator hardware requirements low, allowing thousands of home validators to run nodes.

### Q4: What is the OmniBridge?
The OmniBridge is a decentralized bridge contract that locks assets on Ethereum L1 and mints wrapped equivalents on Gnosis Chain.

### Q5: Can I run Gnosis Chain smart contracts using Ethereum tools?
Yes. Gnosis Chain is fully EVM-compatible, meaning you can deploy Solidity contracts using standard tools like Foundry, Hardhat, and MetaMask.
"""
}

# 5. Avalanche (avalanche-network)
articles["avalanche-network"] = {
    "title": "Avalanche Network: Subnets, Metastability & Multi-Chain Tiers",
    "tagline": "Deconstruct sub-sampled voting consensus, X/P/C multi-chain architectures, and custom subnets.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["ethereum-network"],
    "related": ["fantom-network", "moonbeam-moonriver"],
    "practiceProblems": [],
    "markdown": """# Avalanche Network: Subnets, Metastability & Multi-Chain Tiers

To scale transaction throughput without sacrificing security, Avalanche introduced a multi-chain architecture alongside a consensus mechanism based on metastability. This article covers Avalanche's primary networks (X, P, and C chains), sub-sampled voting consensus, and custom subnets.

---

## 1. Multi-Chain Architecture: X-Chain, P-Chain & C-Chain

Instead of running all operations on a single database, Avalanche divides workloads among three built-in blockchains:
1. **Exchange Chain (X-Chain)**: A UTXO-based network optimized for creating, trading, and transferring digital assets (non-EVM).
2. **Platform Chain (P-Chain)**: The metadata blockchain that manages validator sets, tracks active subnets, and coordinates staking operations.
3. **Contract Chain (C-Chain)**: An EVM-compatible execution layer designed for deploying smart contracts and running decentralized applications.

```
                            ┌─── X-Chain (Asset Exchanges)
                            │
    [Avalanche Network] ────┼─── P-Chain (Validator Staking)
                            │
                            └─── C-Chain (EVM Smart Contracts)
```

---

## 2. Metastability & Sub-Sampled Voting Consensus

Avalanche consensus uses **Randomized Sub-Sampled Voting**:
1. **Block Proposals**: A validator proposes a block transition.
2. **Sub-Sampling**: The validator queries a small, randomly selected group of peers (e.g. 20 validators) rather than the entire network.
3. **Confidence Scoring**: If a majority of the queried validators agree, the validator updates its local preference.
4. **Metastability Iteration**: This process is repeated recursively. The network rapidly cascades to a single, unanimous consensus decision within milliseconds, scaling to thousands of validators with low latency.

---

## 3. Custom Subnets & Application Isolation

An Avalanche **Subnet** is a dynamic group of validators that reach consensus on their own customized blockchains:
- **Custom Rules**: Subnets can define their own gas tokens, access controls (private/public), and compliance rules.
- **Dedicated Resources**: Since subnet transactions are processed only by their assigned validators, they avoid network congestion from other applications.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What are the three chains in the Avalanche Primary Network?
The X-Chain (asset management), P-Chain (staking and subnets), and C-Chain (EVM smart contracts).

### Q2: How does sub-sampled voting speed up consensus?
By querying a small, random subset of validators repeatedly, reducing network communication overhead ($O(N)$ scaling) while maintaining high security.

### Q3: What is an Avalanche Subnet?
A subnet is an isolated validator group that runs custom blockchains with custom rules, gas tokens, and access configurations.

### Q4: Why is the C-Chain important for Ethereum developers?
Because it runs the EVM, allowing Solidity developers to deploy contracts on Avalanche with minimal code modifications.

### Q5: What is required to secure an Avalanche Subnet?
Subnet validators must validate Avalanche's Primary Network, requiring them to stake a minimum amount of AVAX tokens on the P-Chain.
"""
}

# 6. Fantom (fantom-network)
articles["fantom-network"] = {
    "title": "Fantom Network: Lachesis aBFT Engine & DAG Topologies",
    "tagline": "Explore asynchronous Byzantine agreement, Directed Acyclic Graph blocks, and Opera executions.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["ethereum-network"],
    "related": ["avalanche-network", "moonbeam-moonriver"],
    "practiceProblems": [],
    "markdown": """# Fantom Network: Lachesis aBFT Engine & DAG Topologies

Fantom achieves scale by replacing traditional block-producing chains with a Directed Acyclic Graph (DAG) structure. Secured by the Lachesis consensus engine, it enables fast transaction finality. This article covers Fantom's aBFT consensus, DAG event blocks, and the Opera EVM layer.

---

## 1. Directed Acyclic Graph (DAG) & Event Blocks

Traditional blockchains package transactions into linear blocks that must be confirmed sequentially. Fantom uses a **DAG Topology**:
- **Event Blocks**: Transactions are grouped into event blocks, which are linked to preceding event blocks through multiple parent pointers.
- **Parallel Submissions**: Nodes can generate and broadcast event blocks simultaneously without waiting for a coordinator, avoiding sequential block processing bottlenecks.

```
       [Event Block 1] ──> [Event Block 3]
              │      ╲      ╱     │
              ▼       ▼    ▼      ▼
       [Event Block 2] ──> [Event Block 4]
```

---

## 2. Lachesis Asynchronous Byzantine Fault Tolerant (aBFT) Consensus

Fantom's consensus is powered by the **Lachesis Engine**:
- **Asynchronous**: Nodes reach consensus independently without needing synchronized rounds.
- **Byzantine Fault Tolerant**: Tolerates up to $1/3$ of the network validators acting maliciously.
- **Fast Finality**: Once Lachesis determines the order of event blocks, transactions are finalized in under 1 second.

---

## 3. The Opera EVM Execution Layer

Fantom's mainnet, **Opera**, is a fully EVM-compatible smart contract platform:
- Developers deploy Solidity contracts to Opera just like on Ethereum.
- Opera processes smart contract executions on top of Lachesis, combining EVM compatibility with sub-second finality and low transaction fees.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a Directed Acyclic Graph (DAG) in blockchain?
A DAG is a database structure where events are linked as a web of parent-child relationships instead of a single, sequential chain of blocks.

### Q2: What does asynchronous mean in aBFT consensus?
It means that nodes can process and agree on transactions independently without waiting for synchronized network voting rounds.

### Q3: What is the Lachesis engine?
Lachesis is Fantom's high-speed consensus engine that uses aBFT and DAG topologies to order transactions and finalize blocks in under a second.

### Q4: Is Fantom Opera EVM-compatible?
Yes. The Opera network supports Solidity contracts, allowing developers to reuse Ethereum libraries and deployment frameworks.

### Q5: How are validators rewarded on Fantom?
Validators earn FTM tokens through transaction fees and block rewards, proportional to their staked FTM balance.
"""
}

# 7. Moonbeam / Moonriver (moonbeam-moonriver)
articles["moonbeam-moonriver"] = {
    "title": "Moonbeam & Moonriver: Parachains & Substrate EVM Unity",
    "tagline": "Explore Polkadot parachains, unified substrate accounts, and cross-chain XCM routing.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["ethereum-network"],
    "related": ["avalanche-network", "fantom-network"],
    "practiceProblems": [],
    "markdown": """# Moonbeam & Moonriver: Parachains & Substrate EVM Unity

Polkadot uses a multi-chain network architecture where specialized blockchains (parachains) connect to a central security hub (Relay Chain). Moonbeam and Moonriver are EVM-compatible parachains within this ecosystem. This article covers their dual deployments, unified accounts, and cross-consensus communication (XCM).

---

## 1. Parachain Deployments: Moonbeam & Moonriver

To support development and staging, the network uses a dual-deployment model:
- **Moonriver (Kusama Parachain)**: Launched on Polkadot's canary network, Kusama. It serves as an active testing ground where developers test features under real economic conditions.
- **Moonbeam (Polkadot Parachain)**: Launched on Polkadot's mainnet, providing a stable production environment for EVM applications.

---

## 2. Unified Accounts: Substrate & H160 Mapping

Traditional Polkadot networks use 32-byte account addresses (SS58 format), while Ethereum uses 20-byte addresses (H160 format).

Moonbeam resolves this using **Unified Accounts**:
- Users access their Polkadot assets using their standard Ethereum keys and MetaMask addresses.
- The underlying Substrate runtime maps H160 addresses directly to Substrate state accounts, eliminating the need to manage different keypairs for different layers.

```
[MetaMask Address (H160)] ──> [Unified Accounts Layer] ──> [Substrate State Account]
```

---

## 3. Cross-Consensus Messaging (XCM) Integration

Through Polkadot's **Cross-Consensus Messaging (XCM)** protocol, Moonbeam interact with other parachains:
- Users can move assets (like DOT or stablecoins) directly between parachains without relying on centralized bridge contracts.
- This creates a secure, native network connection across the entire Polkadot ecosystem.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a parachain?
A parachain is an independent, application-specific blockchain that connects to Polkadot's central Relay Chain to share security and cross-chain communication.

### Q2: What is the difference between Moonbeam and Moonriver?
Moonbeam is a parachain on the Polkadot mainnet. Moonriver is a parachain on Kusama, Polkadot's canary testing network.

### Q3: What problem do Unified Accounts solve?
They allow users to interact with Polkadot substrate features using their standard 20-byte Ethereum (MetaMask) keys, avoiding keypair mismatches.

### Q4: How does XCM differ from traditional bridging?
XCM is a native, trustless messaging protocol built into Polkadot's Relay Chain, avoiding the need for external, hack-prone bridge contracts.

### Q5: Can I deploy Solidity smart contracts on Moonbeam?
Yes. Moonbeam provides full EVM compatibility, allowing developers to deploy Solidity contracts with tools like Foundry, Hardhat, and Truffle.
"""
}

# 8. UTXO-Based (utxo-blockchains)
articles["utxo-blockchains"] = {
    "title": "UTXO Blockchains: Bitcoin Transaction Accounting & Script Opcodes",
    "tagline": "Analyze inputs, outputs, unspent balances, and stack-based Script execution.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["cryptography-hashing-blockchain"],
    "related": ["tvm-blockchains", "l2-blockchains"],
    "practiceProblems": [],
    "markdown": """# UTXO Blockchains: Bitcoin Transaction Accounting & Script Opcodes

Blockchains track balances using two main accounting models: the Account Model (used in Ethereum) and the **UTXO (Unspent Transaction Output) Model** (used in Bitcoin). Understanding the UTXO model is essential for writing secure blockchain software. This article covers UTXO inputs and outputs, Bitcoin's stack-based Script language, and transaction verification.

---

## 1. The UTXO Accounting Model

In a UTXO-based blockchain, there are no database fields tracking "account balances". Instead, user balances are calculated by scanning the database for **Unspent Transaction Outputs (UTXOs)** owned by their address.

### Transaction Structure: Inputs & Outputs
A transaction consumes existing UTXOs as **Inputs** and creates new UTXOs as **Outputs**:

```
[Inputs: Consumed UTXOs] ──> [Transaction Engine] ──> [Outputs: New UTXOs Created]
```

- **Egress Change**: If you own a `10 BTC` UTXO and want to send `3 BTC`, you must consume the entire `10 BTC` input. The transaction produces two outputs: `3 BTC` sent to the recipient, and `7 BTC` returned to your wallet as "change".
- **Fee Calculation**: The difference between total inputs and total outputs is kept by the miner as the transaction fee:

$$\\text{Fee} = \\sum \\text{Inputs} - \\sum \\text{Outputs}$$

---

## 2. Bitcoin Script: Stack-Based Execution

To spend a UTXO, a user must unlock it using a stack-based scripting language called **Script**:
- **Script properties**: Script is non-Turing complete (it lacks loops and recursion), which prevents infinite execution loops and makes transaction validation times predictable.
- **Verification**: To verify a transaction, nodes concatenate the sender's unlocking script (`scriptSig`) with the output's locking script (`scriptPubKey`) and execute the combined code. If the stack resolves to `True` (non-zero) at the end of execution, the transaction is valid.

### Pay-to-Public-Key-Hash (P2PKH) Execution
For a standard transfer, nodes run the following script instructions:

$$\\text{scriptSig} + \\text{scriptPubKey}$$

$$\\langle\\text{Sig}\\rangle \\; \\langle\\text{PubKey}\\rangle \\; \\text{OP\\_DUP} \\; \\text{OP\\_HASH160} \\; \\langle\\text{PubKeyHash}\\rangle \\; \\text{OP\\_EQUALVERIFY} \\; \\text{OP\\_CHECKSIG}$$

1. `OP_DUP` duplicates the Public Key.
2. `OP_HASH160` hashes the duplicated key.
3. `OP_EQUALVERIFY` checks that the calculated hash matches the recipient's PubKeyHash.
4. `OP_CHECKSIG` uses the public key to verify the signature, pushing `True` to the stack if valid.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is a UTXO?
A UTXO is an Unspent Transaction Output—a chunk of token value locked on-chain that can be spent as an input in a future transaction.

### Q2: Why is Bitcoin Script not Turing-complete?
It lacks loops and recursion, preventing attackers from writing infinite execution loops that could crash validating nodes.

### Q3: How is a user's total wallet balance calculated in Bitcoin?
The wallet client scans the blockchain database for all active UTXOs locked to the user's public key hash and sums their values.

### Q4: What is the purpose of a change address in UTXO transactions?
Since UTXOs must be spent in their entirety, any excess value from the inputs is sent back to the sender's change address as a new UTXO.

### Q5: What is the role of OP_CHECKSIG?
It pops a public key and a signature from the stack, and uses cryptography to verify that the signature was generated by the matching private key.
"""
}

# 9. TVM-Based (tvm-blockchains)
articles["tvm-blockchains"] = {
    "title": "TVM Blockchains: TRON Virtual Machine, Energy & Bandwidth Models",
    "tagline": "Explore TVM execution mechanics, resource allocations, and DPoS validator voting.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["utxo-blockchains"],
    "related": ["l2-blockchains"],
    "practiceProblems": [],
    "markdown": """# TVM Blockchains: TRON Virtual Machine, Energy & Bandwidth Models

The TRON Virtual Machine (TVM) provides an alternative EVM-compatible execution environment. It scales transaction throughput using a Delegated Proof of Stake (DPoS) consensus engine and a dual-resource consumption model (Energy and Bandwidth). This article covers TVM execution, DPoS consensus, and its resource allocation systems.

---

## 1. TVM Resource Allocation: Bandwidth & Energy

Unlike Ethereum (where users pay gas fees directly in volatile Ether), TRON divides network resources into two categories:
1. **Bandwidth**: Used to pay for transaction data storage. Every account receives a daily allowance of free bandwidth. Transactions that exceed this allowance consume TRX tokens.
2. **Energy**: Used to pay for smart contract CPU execution (similar to EVM gas). Storing or executing complex contracts consumes energy.

### Free Transactions via Staking
Users can obtain Bandwidth and Energy by locking (staking) TRX tokens in their wallets. This allows developers and users to interact with smart contracts for free, without spending their principal tokens.

```
                      [TRX Token Staking]
                       /             \\
                      /               \\
            [Earn Bandwidth]        [Earn Energy]
            (For Data Size)         (For Contract CPU)
```

---

## 2. Delegated Proof of Stake (DPoS) Consensus

TRON uses **Delegated Proof of Stake (DPoS)** to achieve fast block times:
- **Super Representatives (SRs)**: Validation is restricted to 27 active nodes called Super Representatives.
- **Voting**: TRX holders vote for SR candidates using voting power obtained by staking TRX.
- **Block Production**: The 27 elected SRs take turns producing blocks every 3 seconds, keeping network latency low.

---

## 3. TVM & EVM Compatibility

The TVM is designed to be compatible with Ethereum's EVM:
- Developers write smart contracts in Solidity and compile them to bytecode.
- TVM executes this bytecode, allowing developers to port Ethereum applications to TRON with minimal code changes.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is TRON Energy?
Energy is a network resource consumed during smart contract CPU calculations. It can be obtained by staking TRX.

### Q2: What is the role of Super Representatives (SRs)?
SRs are the 27 elected validators in TRON's DPoS consensus responsible for validating transactions and producing new blocks.

### Q3: How do users access free transactions on TRON?
By staking TRX to generate Bandwidth and Energy, allowing them to send transfers and run smart contracts without paying fees.

### Q4: What happens if an account lacks sufficient Energy for a transaction?
The transaction will consume TRX tokens directly from the sender's account balance to purchase the required resources.

### Q5: Is the TVM compatible with Solidity?
Yes. The TVM supports Solidity, allowing developers to deploy standard Ethereum smart contracts to the TRON network.
"""
}

# 10. L2 Blockchains (l2-blockchains)
articles["l2-blockchains"] = {
    "title": "Layer 2 Rollups: Optimistic vs. Zero-Knowledge Scalability Engines",
    "tagline": "Analyze state batching, sequencer operations, fraud proofs, and ZK validity proofs.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["ethereum-network"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Layer 2 Rollups: Optimistic vs. Zero-Knowledge Scalability Engines

To scale throughput without compromising Layer 1 security, the blockchain ecosystem uses **Layer 2 (L2) Rollups**. Rollups execute transactions off-chain, and bundle them into consolidated state batches submitted to Layer 1. This article compares Optimistic Rollups and Zero-Knowledge (ZK) Rollups, covering state batching, sequencers, fraud proofs, and validity proofs.

---

## 1. Rollup Mechanics: State Batching & Sequencers

Rollups achieve scalability by separating transaction execution from ledger consensus:
- **Sequencers**: High-speed centralized or decentralized nodes that receive, order, and execute transactions on Layer 2 immediately, providing fast confirmation times.
- **State Batching**: Instead of writing every transaction to Layer 1, the sequencer bundles hundreds of transactions into a single batch, compressing data size.
- **L1 Submission**: The sequencer submits the compressed transaction data and the resulting L2 state root to the Ethereum L1 mainnet, anchoring L2 security to Layer 1.

```
  [User Transactions] ──> [L2 Sequencer (Executes Off-chain)]
                                      │
                                      ▼ (Batch & Compress)
                                [Ethereum L1]
```

---

## 2. Optimistic Rollups & Fraud Proofs

Optimistic Rollups (e.g. Arbitrum, Optimism) assume transactions are valid by default:
- **The Challenge Period**: When a state batch is submitted to Layer 1, it enters a challenge window (typically 7 days).
- **Fraud Proofs**: If a validator detects an invalid transaction in the batch, they submit a cryptographic proof to Ethereum L1. The L1 contract verifies the proof, rolls back the invalid state changes, and slashes the sequencer's stake.
- **Drawback**: Users must wait for the 7-day challenge period to complete before they can withdraw funds back to Layer 1.

---

## 3. Zero-Knowledge (ZK) Rollups & Validity Proofs

ZK Rollups (e.g. Starknet, zkSync) use mathematical proofs to verify transactions instantly:
- **Validity Proofs**: The sequencer runs transactions, generates a cryptographic proof (SNARK or STARK), and submits it alongside the state batch to Layer 1.
- **L1 Verification**: A verifier smart contract on Ethereum L1 checks the proof. If valid, the state is finalized immediately.
- **Advantage**: Since math guarantees transaction validity, there is no challenge window, enabling instant withdrawals back to Layer 1.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why are Layer 2 solutions called 'rollups'?
Because they execute transactions off-chain and roll them up into a single, compressed data batch submitted to Layer 1.

### Q2: What is the main security difference between Optimistic and ZK rollups?
Optimistic rollups rely on fraud proofs and challenge periods to catch invalid states. ZK rollups use mathematical validity proofs to verify transactions instantly.

### Q3: What is the data availability problem?
It is the requirement that rollups must publish transaction data to Layer 1 so that anyone can reconstruct the state and submit fraud proofs if the sequencer fails.

### Q4: Why do Optimistic rollups have a 7-day withdrawal delay?
To provide validator nodes with a safety window to detect invalid transactions and submit fraud proofs on Layer 1.

### Q5: What is the role of a rollup sequencer?
A sequencer receives, orders, and executes transactions on Layer 2, batching them for submission to Layer 1.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch3.json
with open('scratch/bc_batch3.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch3.json containing 10 articles!")
