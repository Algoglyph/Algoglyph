import json

articles = {}

# 1. Frontend Frameworks (dapp-frontend)
articles["dapp-frontend"] = {
    "title": "DApp Frontend Frameworks: React, Next.js & Hydration States",
    "tagline": "Configure Next.js setups, manage wallet hydration states, and optimize Web3 rendering.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["dapp-architecture"],
    "related": ["web3-client-libraries", "dapp-supporting-languages"],
    "practiceProblems": [],
    "markdown": """# DApp Frontend Frameworks: React, Next.js & Hydration States

Building decentralized applications (DApps) requires connecting standard web frontends to active blockchain networks. While frameworks like React and Next.js offer rapid development, web3 integrations introduce challenges like server-side rendering (SSR) hydration mismatches and transaction latency updates. This article covers Next.js web3 setups, managing hydration states, and rendering optimization.

---

## 1. Next.js Web3 Setup & SSR Challenges

Modern frontends use Next.js for server-side rendering (SSR) and search engine optimization. However, web3 wallets (like MetaMask) are client-side only, injecting their providers into the browser's global `window` scope:
- **The Mismatch**: When the server attempts to pre-render the page, it has no access to `window.ethereum`, rendering a "Disconnected" state.
- **The Hydration Error**: When the browser loads the client-side code and detects the wallet provider, it attempts to render the "Connected" state, causing a React Hydration Mismatch error.

```
Server (Pre-renders page):  [window.ethereum is undefined] ──> Render "Disconnected"
                                                                     │
                                                           (Hydration Mismatch!)
                                                                     ▼
Client (Browser runs JS):   [window.ethereum is detected]  ──> Render "Connected"
```

---

## 2. Resolving Hydration Mismatches

To resolve hydration errors, defer rendering wallet-connected UI elements until the component has mounted on the client-side:

```typescript
import { useState, useEffect } from 'react';

export function WalletConnector() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading Wallet...</div>;

  return (
    // Render wallet connection buttons safely
    <button onClick={connectWallet}>Connect Wallet</button>
  );
}
```

This pattern ensures the server and client render identical HTML on the initial load, avoiding mismatches.

---

## 3. Optimizing Web3 Rendering Performance

Web3 frontends must poll RPC nodes or listen to event logs continuously:
- **State Triggers**: Triggering a re-render on every block update can freeze the UI.
- **Optimizations**:
  - Use React context or state stores (like Zustand) to share connection states globally.
  - Implement debouncing on transaction alerts and block polling rates to keep rendering smooth.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why do web3 applications trigger hydration errors in Next.js?
Because the server pre-renders the page without client-side wallet variables, mismatching the client-side state once the wallet provider is detected.

### Q2: How does the useEffect mount check resolve hydration errors?
By delaying the rendering of client-only elements (like wallets) until after the client-side JavaScript has successfully initialized.

### Q3: What is the purpose of using state stores like Zustand in DApps?
To manage global wallet variables, connection states, and ABI instantiations across components without causing root re-renders.

### Q4: How do I handle RPC node rate limits on the frontend?
By caching query responses locally and debouncing active block listeners to reduce the frequency of queries.

### Q5: Can I use server components in Next.js App Router for web3 queries?
Yes, you can run read-only queries (like checking balances) on the server using HTTP providers, but any user transaction signing requires client components.
"""
}

# 2. Client Libraries (web3-client-libraries)
articles["web3-client-libraries"] = {
    "title": "Web3 Client Libraries: viem, ethers.js & Payload Encoding",
    "tagline": "Compare ethers.js providers, viem performance gains, and payload serialization logic.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["dapp-frontend"],
    "related": ["dapp-supporting-languages", "state-channels"],
    "practiceProblems": [],
    "markdown": """# Web3 Client Libraries: viem, ethers.js & Payload Encoding

Frontend developers rely on helper libraries to serialize data, sign payloads, and interact with smart contracts. This article compares ethers.js and viem, covering providers, signers, transport configurations, and ABI payload serialization.

---

## 1. ethers.js vs. viem

For years, **ethers.js** was the default Web3 client library:
- **Ethers Model**: Uses `Provider` (for read-only node calls) and `Signer` (to sign transactions using private keys).
- **Cons**: Large bundle size; state management is often verbose.

**viem** is a modern, modular alternative designed for speed and type safety:
- **Viem Model**: Uses separate clients: `PublicClient` (for read-only queries) and `WalletClient` (to sign transactions).
- **Bundle Size**: Extremely small and tree-shakable.
- **Type Safety**: Leverages TypeScript features to extract contract function parameters directly from the ABI schema, preventing compile-time type mismatches.

```
ethers.js:  [Provider (Read)] ── [Signer (Write)]
viem:       [PublicClient (Read)] ── [WalletClient (Write)]
```

---

## 2. ABI Payload Encoding & Serialization

When calling a smart contract function, client libraries convert the call into a hex payload (data payload) that the EVM can parse:
- **Function Selector**: The first 4 bytes of the keccak-256 hash of the function signature (e.g. `transfer(address,uint256)`).
- **Argument Encoding**: The function arguments are padded to 32-byte words and appended to the selector.

```javascript
// Raw payload encoding using viem
import { encodeFunctionData } from 'viem';

const data = encodeFunctionData({
  abi: myTokenAbi,
  functionName: 'transfer',
  args: ['0xUserAddress', 1000n]
});
// Result: 0xa9059cbb00000000... (Function Selector + Arguments)
```

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is the main benefit of viem over ethers.js?
Viem is significantly smaller, offers better performance, and provides out-of-the-box TypeScript type checking for contract ABIs.

### Q2: What does an EVM function selector represent?
The first 4 bytes of the keccak-256 hash of the function signature, used by the EVM to identify which contract function to execute.

### Q3: What is the difference between PublicClient and WalletClient in viem?
\`PublicClient\` handles read-only queries (like checking token balances) using public nodes. \`WalletClient\` signs transactions and writes data using the user's wallet.

### Q4: Why must client libraries encode ABI inputs?
Because the EVM cannot parse JavaScript objects; it requires parameters to be formatted as serialized, 32-byte padded hex data payloads.

### Q5: How do I handle custom transport layers in viem?
Configure the client with custom transport protocols (like HTTP, WebSocket, or fallback arrays) in the client's instantiation parameters.
"""
}

# 3. Supporting Languages (dapp-supporting-languages)
articles["dapp-supporting-languages"] = {
    "title": "Supporting Languages: TypeScript, Go & Web3.py Integrations",
    "tagline": "Explore type-safe contract interfaces, Go-ethereum backends, and Python analytics engines.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["web3-client-libraries"],
    "related": ["state-channels", "optimistic-rollups"],
    "practiceProblems": [],
    "markdown": """# Supporting Languages: TypeScript, Go & Web3.py Integrations

Decentralized software systems are multi-language environments. While Solidity and Rust run on-chain, backends, analytics engines, and client interfaces are built using other runtimes. This article covers TypeScript type-safe contracts, writing Go-ethereum interactions, and using Python for data analytics.

---

## 1. TypeScript: Type-Safe ABIs (Abitype)

Using raw JSON ABIs in JavaScript often leads to runtime bugs because parameter types are not checked. TypeScript resolves this using libraries like **abitype**:
- **Static Types**: Parses the JSON ABI structure at compile time.
- **Validation**: Ensures that function calls, variable inputs, and event arguments are statically checked, flagging type mismatches during development.

---

## 2. Go-Ethereum (Geth) & Backend Execution

Go is the primary language used to build blockchain node clients (like Geth). Developers write backend services in Go to handle high-performance blockchain operations:
- **abigen**: A tool that compiles Solidity ABIs into type-safe Go source code files.
- **Client Queries**: Allows backend systems to connect to nodes over IPC/WebSockets, parse transactions, and manage smart contracts using Go structs.

```
[Solidity ABI] ──(abigen compiler)──> [Go Source Code Structs] ──> [High-Speed Backend Server]
```

---

## 3. Python: Web3.py & Data Analytics

For data analysts, security auditors, and researchers, Python is the default language:
- **web3.py**: The official Python library to connect to Ethereum nodes.
- **Data Analytics**: Used alongside libraries like Pandas and NumPy to pull historical block data, analyze gas usage statistics, detect MEV patterns, and build security scanners.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What does the abigen tool accomplish in Go development?
\`abigen\` compiles smart contract ABI JSON files into type-safe Go structs, allowing developers to call contract functions directly from Go code.

### Q2: Why is TypeScript preferred for frontend Web3 codebases?
Because it validates contract function parameters and event signatures against the ABI schema, preventing type mismatch errors at compile time.

### Q3: When should I choose web3.py over ethers.js?
Choose \`web3.py\` for data analysis, security audits, machine learning models, and command-line scripts where Python's data ecosystem is required.

### Q4: How do I read block transactions in Go?
Instantiate a Geth client, call the \`BlockByNumber\` query method, and loop through the transaction array using Go struct mappings.

### Q5: Can I run smart contract logic locally in a Python environment?
Not directly. Python must connect to a local node simulator (like Anvil) or an RPC provider to execute and test smart contract calls.
"""
}

# 4. State & Payment Channels (state-channels)
articles["state-channels"] = {
    "title": "State & Payment Channels: Off-Chain Transits & Timelocks",
    "tagline": "Deconstruct Lightning Network payments, state signatures, dispute windows, and settlements.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["dapp-supporting-languages"],
    "related": ["optimistic-rollups", "zk-rollups"],
    "practiceProblems": [],
    "markdown": """# State & Payment Channels: Off-Chain Transits & Timelocks

Layer 2 scaling solutions are divided into Rollups and Channels. State and payment channels allow users to execute thousands of transactions off-chain instantly, with only the final balance settled on-chain. This article covers payment channels (like Bitcoin's Lightning Network), multi-signature state locks, dispute resolution periods, and timelocks.

---

## 1. Payment Channels & The Lightning Network

A **Payment Channel** is a direct transaction channel between two participants:
1. **Funding (On-Chain)**: Alice and Bob open a channel by depositing capital (e.g., 1 BTC each) into a 2-of-2 multi-signature address on-chain.
2. **Execution (Off-Chain)**: Alice and Bob exchange signed balance updates off-chain. Transactions are instant and cost zero gas fees.
3. **Settlement (On-Chain)**: To close the channel, either participant submits the final signed balance update on-chain. The multi-sig contract distributes the funds accordingly.

The **Lightning Network** routes payments across a web of interconnected channels, allowing Alice to pay Charlie even if she only has a channel open with Bob.

```
  On-Chain Deposit (Funding) ──> [Off-Chain Transaction updates] ──> On-Chain Settlement (Closing)
```

---

## 2. State Channels & Multi-Signature Locks

While payment channels only transfer currency, **State Channels** support general smart contract executions (e.g., playing an on-chain game):
- **State Signatures**: Participants sign sequential game moves off-chain, modifying variables (like board layout or scores).
- **Multi-sig Validation**: Every update must be signed by all participants, preventing users from forging states unilaterally.

---

## 3. Dispute Resolution & Hash Time-Locked Contracts (HTLCs)

If one participant goes offline or attempts to submit an older, favorable balance state to cheat:
- **Dispute Windows**: The protocol locks funds for a challenge window (e.g., 24 hours).
- **Fraud Proofs**: The honest user has until the challenge window closes to submit a newer signed update, proving the fraud attempt. The protocol awards the attacker's stake to the honest user as a penalty.
- **HTLCs (Hash Time-Locked Contracts)**: Cryptographic locks that enforce deadline-based transfers, enabling safe routing across multiple channel jumps.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a payment channel?
A payment channel is a direct, off-chain communication channel between two users, secured by an on-chain multi-signature deposit.

### Q2: How does the Lightning Network route payments across users?
By searching for a connected path of open payment channels between the sender and receiver, using HTLCs to secure routing steps.

### Q3: What is the purpose of a challenge window when closing a channel?
To give the other participant a safety window to detect and submit proof if someone attempts to close the channel using an outdated state.

### Q4: What is a Hash Time-Locked Contract (HTLC)?
An HTLC is a smart contract that locks a payment, releasing it only if the recipient reveals a cryptographic secret before a block deadline.

### Q5: What is the main drawback of state channels?
They require all participants to remain online continuously to sign state updates and monitor the network for fraud attempts.
"""
}

# 5. Optimistic Rollups & Fraud Proofs (optimistic-rollups)
articles["optimistic-rollups"] = {
    "title": "Optimistic Rollups: Interactive Fraud Proofs & Challenge Windows",
    "tagline": "Explore L2 state serialization, interactive dispute protocols, and data compression.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["state-channels"],
    "related": ["zk-rollups", "ethereum-2-0"],
    "practiceProblems": [],
    "markdown": """# Optimistic Rollups: Interactive Fraud Proofs & Challenge Windows

Rollups scale Layer 1 blockchains by executing transactions off-chain and posting state updates to Layer 1. Optimistic Rollups assume all transactions are valid by default, using a challenge window to catch fraud. This article covers state serialization, sequencer operations, interactive dispute resolution, and data compression.

---

## 1. Rollup State Serialization & Sequencers

Optimistic Rollups (e.g. Arbitrum, Optimism) run an off-chain execution network:
- **The Sequencer**: Orders and executes transactions immediately on Layer 2, sending fast confirmations to users.
- **Batching**: The sequencer bundles transactions and compresses data, publishing the inputs as `calldata` to Ethereum Layer 1 to ensure data availability.
- **State Transition**: The sequencer updates the L2 state root locally and posts the new root to Layer 1.

---

## 2. Interactive Fraud Proofs: The Dispute Protocol

Because L1 does not verify the state root during submission, the system uses a **Challenge Period** (typically 7 days):
- **Validation**: Validator nodes monitor L1 state roots and execute transactions locally to confirm the math matches.
- **The Dispute**: If a validator detects an invalid state root, they issue a challenge on Layer 1.
- **Interactive Binary Search**: The challenger and sequencer execute an on-chain binary search (bisection game) to locate the exact instruction step where the calculations diverged.
- **L1 Execution**: The L1 virtual machine executes that single instruction step on-chain to determine the correct result, rolling back the invalid batch and slashing the malicious sequencer's stake.

```
       [Sequencer State Root] ──(7-Day Challenge Window)──> No Disputes ──> [State Finalized]
                 │
                 ▼ (Dispute Triggered)
       [Binary Search Bisection] ──> [L1 Executes Step] ──> [Malicious Node Slashed]
```

---

## 3. Data Compression & Gas Optimizations

To keep L1 transaction costs low, rollups compress transaction data:
- **Calldata Storage**: Data is stored as raw `calldata` on Ethereum, avoiding expensive contract storage writes.
- **Signature Compression**: Signatures are compressed or aggregated to minimize the data footprint submitted to L1.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why are they called 'Optimistic' rollups?
Because they assume transactions are valid by default, only executing validation checks on L1 if a validator submits a dispute.

### Q2: How does the bisection game work in interactive fraud proofs?
The challenger and sequencer divide the transaction sequence in half repeatedly to locate the exact execution step where their states diverged.

### Q3: Why is the challenge period set to 7 days?
To provide validator nodes with a safety window to detect invalid roots, build proofs, and submit disputes during periods of network congestion.

### Q4: What is data availability in rollups?
The requirement that all transaction inputs must be published to L1, allowing anyone to reconstruct the L2 state and detect fraud.

### Q5: What is the main drawback of Optimistic Rollups?
The 7-day challenge window prevents users from withdrawing funds back to Ethereum L1 instantly, unless they use fast bridge protocols.
"""
}

# 6. Zk Rollups & ZKP (zk-rollups)
articles["zk-rollups"] = {
    "title": "Zero-Knowledge Rollups: SNARKs, STARKs & Validity Proofs",
    "tagline": "Explore zero-knowledge mathematical foundations, verifier contract limits, and instant finality.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["optimistic-rollups"],
    "related": ["ethereum-2-0", "on-chain-scaling"],
    "practiceProblems": [],
    "markdown": """# Zero-Knowledge Rollups: SNARKs, STARKs & Validity Proofs

Zero-Knowledge (ZK) Rollups provide an alternative scaling model to Optimistic Rollups. Instead of assuming transactions are valid and relying on fraud proofs, ZK Rollups use cryptographic proofs to verify every state transition instantly. This article covers ZK validity proofs, SNARKs vs. STARKs, and verifier smart contracts.

---

## 1. ZK Rollup Architecture & Validity Proofs

ZK Rollups (e.g. Starknet, zkSync) execute transactions off-chain:
- **Proof Generation**: The sequencer runs a batch of transactions and compiles a cryptographic proof (the **Validity Proof**) confirming the validity of the state changes.
- **L1 Verification**: The sequencer submits the validity proof and the new state root to Ethereum L1.
- **Verifier Contract**: A smart contract on Ethereum L1 validates the proof mathematically. If the verification succeeds, the state root is written to the ledger immediately.

Since math guarantees validity, there is no need for a challenge window, allowing users to withdraw funds back to L1 instantly.

```
[User Transactions] ──> [ZK Sequencer] ──(Generates Proof)──> [L1 Verifier Contract]
                                                                      │
                                    [State Finalized Instantly] ◀─────┘
```

---

## 2. SNARKs vs. STARKs

ZK Rollups utilize two primary cryptographic proof systems:

| Feature | zk-SNARK | zk-STARK |
| :--- | :--- | :--- |
| **Full Name** | Zero-Knowledge Succinct Non-Interactive Argument of Knowledge | Zero-Knowledge Scalable Transparent Argument of Knowledge |
| **Proof Size** | Small ($\approx 288$ bytes) | Large ($\approx 45-100$ KB) |
| **Trusted Setup** | Required (security risk if corrupted) | Transparent (no trusted setup required) |
| **Quantum Security** | Vulnerable | Quantum-resistant (uses collision-resistant hashes) |
| **Verification Speed** | Constant time | Scales logarithmically with transaction size |

---

## 3. Verifier Contract Execution

The verifier smart contract on Layer 1 runs calculations to check the validity proof. Although generating ZK proofs off-chain is computationally heavy (requiring specialized GPU/FPGA clusters), verifying the proof on-chain is fast and consumes constant gas, regardless of the number of transactions included in the batch.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why do ZK Rollups enable instant withdrawals to Layer 1?
Because validity proofs are verified mathematically by the L1 smart contract upon submission, eliminating the need for a challenge window.

### Q2: What is the main security risk of zk-SNARKs?
They require an initial trusted setup phase to generate key parameters. If the setup variables are compromised, attackers can forge proofs.

### Q3: Why are zk-STARKs described as transparent?
Because they use public parameters to generate proofs, avoiding the need for a trusted setup phase.

### Q4: How does a ZK rollup save gas on Layer 1?
By executing complex computations off-chain, and sending only a single, condensed validity proof to be verified on-chain.

### Q5: What is a zkEVM?
A zkEVM is a specialized virtual machine that executes Ethereum smart contracts while generating zero-knowledge proofs of execution validity.
"""
}

# 7. Ethereum 2.0 (ethereum-2-0)
articles["ethereum-2-0"] = {
    "title": "Ethereum 2.0: The Beacon Chain Consensus & Staking Mechanics",
    "tagline": "Explore validator slots, epoch structures, attestation rules, and slashing metrics.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["zk-rollups"],
    "related": ["on-chain-scaling", "client-nodes"],
    "practiceProblems": [],
    "markdown": """# Ethereum 2.0: The Beacon Chain Consensus & Staking Mechanics

Ethereum transitioned from Proof of Work to Proof of Stake (PoS) through a series of upgrades known as Ethereum 2.0. At the center of this transition was the launch of the Beacon Chain, which introduced the staking and validation rules that secure the network today. This article covers validator slots, epoch structures, attestations, and validator duties.

---

## 1. The Beacon Chain & Proof of Stake (PoS)

The **Beacon Chain** was launched in December 2020 as a parallel coordination layer. It managed validator sets and consensus rules while the original PoW chain handled transactions. In September 2022 (The Merge), the execution state was merged into the Beacon Chain, ending Proof of Work mining on Ethereum.

---

## 2. Slots, Epochs & Attestations

Time on Ethereum PoS is structured into strict intervals:
- **Slots**: A slot lasts **12 seconds**. During each slot, a randomly selected validator is chosen to propose a new block.
- **Epochs**: An epoch consists of **32 slots** (roughly 6.4 minutes).
- **Attestations**: During each epoch, validators are divided into committees. Every validator must attest (vote) to confirm the validity of the block proposed in their assigned slot.

```
       ┌─────────────────────────────── Epoch (6.4 min) ───────────────────────────────┐
       │ Slot 1 (12s) │ Slot 2 (12s) │ Slot 3 (12s) │ ... │ Slot 32 (12s)             │
       ├──────────────┼──────────────┼──────────────┼─────┼───────────────────────────┤
       │ Proposer 1   │ Proposer 2   │ Proposer 3   │ ... │ Proposer 32               │
       └──────────────┴──────────────┴──────────────┴─────┴───────────────────────────┘
```

---

## 3. Staking Mechanics & Validator Penalties

To participate in consensus, users must stake **32 ETH** to lock up their capital:
- **Active Validation**: Validators run node clients to attest to valid blocks, earning rewards paid in Gwei.
- **Slashing Penalties**: Validators are penalized if they double-sign conflicting blocks or go offline for extended periods. Confiscated ETH is burned, and the validator is ejected from the network.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What was 'The Merge' in Ethereum's history?
The Merge was the upgrade that joined Ethereum's execution layer with the PoS Beacon Chain, ending Proof of Work mining.

### Q2: How does a validator qualify to propose blocks on Ethereum?
By staking a minimum of 32 ETH in the network's official deposit contract and running active validator client software.

### Q3: What is the difference between a slot and an epoch in PoS?
A slot is a 12-second block production window. An epoch consists of 32 slots (6.4 minutes) used to manage validator consensus voting.

### Q4: What is an attestation in PoS consensus?
An attestation is a validator's signed vote confirming that a proposed block is valid and follows consensus rules.

### Q5: What is the risk of validator inactivity?
If a validator goes offline, they suffer an inactivity leak, gradually losing a portion of their staked ETH over time until they reconnect.
"""
}

# 8. On-Chain Scaling (on-chain-scaling)
articles["on-chain-scaling"] = {
    "title": "On-Chain Scaling: Danksharding, EIP-4844 & Data Blobs",
    "tagline": "Explore L1 sharding concepts, blob transactions, and state transition speedups.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["ethereum-2-0"],
    "related": ["client-nodes", "node-as-a-service"],
    "practiceProblems": [],
    "markdown": """# On-Chain Scaling: Danksharding, EIP-4844 & Data Blobs

Scaling blockchains requires optimizing storage and data throughput on Layer 1. Rather than processing all data in execution contracts, modern networks implement data-centric scaling solutions. This article covers sharding database concepts, EIP-4844 blob transactions, and Danksharding.

---

## 1. Database Partitioning & Sharding

In traditional databases, **Sharding** divides the data set into separate partitions (shards) hosted on different servers to distribute load.

In blockchains, early sharding plans aimed to split execution into 64 separate chains. However, because cross-shard communication is slow and complex, the Ethereum roadmap shifted to focus on **Rollup-Centric Scaling**, where sharding is used to provide cheap data storage space for Layer 2 rollups rather than running execution code.

---

## 2. EIP-4844: Proto-Danksharding & Blob Transactions

EIP-4844 (Proto-Danksharding) introduced **Blob-carrying Transactions** to Ethereum:
- **The Issue**: Before EIP-4844, rollups published transaction data to L1 as `calldata`, which is stored permanently on-chain, consuming expensive gas.
- **The Solution**: EIP-4844 introduces **Blobs** (Binary Large Objects)—large packets of data attached to blocks. Blobs bypass EVM execution entirely and are deleted from client node storage after 18 days, reducing gas costs for Layer 2 rollups by over 90%.

```
[Traditional Block] ──> [EVM Execution] ──> [Permanent Storage]
[Blob Transaction]  ──> [Bypasses EVM]  ──> [Deleted after 18 Days (Data Availability)]
```

---

## 3. Danksharding & Data Availability Sampling

Danksharding is the final scaling target for Ethereum:
- **Unified Block Builder**: Merges transaction blocks and blob spaces into a single structure.
- **Data Availability Sampling (DAS)**: Allows light nodes to verify that blob data is complete and accessible by downloading only a few random bytes, securing the network without requiring nodes to download entire blobs.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is EIP-4844?
EIP-4844 (Proto-Danksharding) is an upgrade that introduced blob-carrying transactions to Ethereum, reducing L2 rollup data fees.

### Q2: Why are blobs cheaper than calldata?
Because blobs bypass EVM execution and are deleted from client node storage after 18 days, avoiding permanent storage costs.

### Q3: What is the data availability sampling (DAS) protocol?
DAS allows light nodes to verify that blob data is complete and available by downloading only a few random bytes of the payload.

### Q4: How long is blob data preserved on Ethereum client nodes?
Blob data is stored for approximately 18 days before being deleted from client node storage to prevent database bloat.

### Q5: What is the rollup-centric roadmap?
It is the design plan where Layer 1 focuses on security and data availability (via blobs), while Layer 2 rollups handle fast transaction execution.
"""
}

# 9. Client Nodes (client-nodes)
articles["client-nodes"] = {
    "title": "Client Nodes: Geth, Besu & Node Synchronization Modes",
    "tagline": "Configure Go-ethereum clients, snap syncs, and database storage backends.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["on-chain-scaling"],
    "related": ["node-as-a-service", "blockchain-applicability"],
    "practiceProblems": [],
    "markdown": """# Client Nodes: Geth, Besu & Node Synchronization Modes

Running a blockchain client node allows developers and validators to interact directly with the ledger, query states, and validate blocks. This article compares client node software packages, node synchronization modes, and database storage backends.

---

## 1. Node Client Software: Geth, Besu & Erigon

Ethereum requires nodes to run two client packages: the **Execution Client** (for transactions and state) and the **Consensus Client** (for PoS consensus).

Common execution clients include:
- **Geth (Go-Ethereum)**: The most widely used execution client, written in Go.
- **Besu**: A Java-based client designed for both public networks and enterprise consortium setups.
- **Erigon**: An optimized client featuring custom state storage databases (MDBX) that reduce disk space requirements.

---

## 2. Node Synchronization Modes

When launching a node, developers choose a synchronization mode to download and validate history:
- **Full Sync**: Downloads all blocks and executes every transaction from the Genesis Block to the latest block, which is slow but highly secure.
- **Snap Sync**: Ethereum's default sync mode. It downloads recent block headers, verifies consensus proofs, and downloads the active state trie directly, sync-ing in hours instead of days.
- **Light Sync**: Downloads only block headers and relies on full nodes to verify transaction details, which is ideal for low-power devices.

```
Full Sync:  [Block 0] ──> Execute Tx ──> [Block 1] ──> Execute Tx ──> [Latest Block]
Snap Sync:  [Download State Trie directly] ──> Validate recent Block Headers
```

---

## 3. Local Node CLI Configuration

To start a Geth node, configure the client via the command-line interface:

```bash
# Start Geth with snap synchronization and enable HTTP JSON-RPC
geth --syncmode "snap" --http --http.addr "127.0.0.1" --http.api "eth,net,web3"
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the difference between an Execution client and a Consensus client?
The execution client processes smart contracts, executes transactions, and manages state. The consensus client handles PoS consensus block attestations.

### Q2: Why is snap sync faster than full sync?
Because it downloads the active state trie directly from peers, avoiding the need to execute every historical transaction since the Genesis block.

### Q3: What is the advantage of the Erigon client?
Erigon uses an optimized database architecture (MDBX) that reduces storage requirements and speeds up sync times.

### Q4: How do I connect my frontend to a local Geth node?
By enabling the HTTP JSON-RPC flag in Geth and configuring your client library (viem/ethers.js) to connect to \`http://127.0.0.1:8545\`.

### Q5: What is the hardware requirement for running a full node?
A full node typically requires a multi-core CPU, at least 16GB of RAM, and a minimum of 2TB of high-speed SSD storage.
"""
}

# 10. Node as a Service (node-as-a-service)
articles["node-as-a-service"] = {
    "title": "Node as a Service: NaaS Providers & JSON-RPC Integrations",
    "tagline": "Configure remote RPC connections, secure API credentials, and manage rate limits.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["client-nodes"],
    "related": ["blockchain-applicability"],
    "practiceProblems": [],
    "markdown": """# Node as a Service: NaaS Providers & JSON-RPC Integrations

Running local blockchain nodes requires expensive hardware and ongoing maintenance. To scale applications, developers use Node as a Service (NaaS) providers. This article covers NaaS architectures, JSON-RPC connections, and managing rate limits.

---

## 1. What is Node as a Service (NaaS)?

NaaS providers (such as Alchemy, Infura, or QuickNode) maintain clusters of globally distributed blockchain nodes:
- **API Endpoints**: Providers assign developers unique RPC endpoints (HTTPS or WebSockets).
- **Maintenance**: Providers handle client upgrades, database scaling, and node uptime, allowing developers to focus on writing code.

---

## 2. Managing API Keys & Rate Limits

Because public NaaS endpoints are shared, providers enforce rate limits and security controls:
- **Rate Limits**: Requests are metered using Compute Units (CUs). If your application sends too many queries simultaneously, the provider returns status code `429` (Too Many Requests).
- **Secure Key Storage**: Never commit API keys directly in client-side code. Instead, route requests through an intermediary backend server that stores keys securely.

```
[DApp Frontend] ──> [Backend Server (API key hidden)] ──> [NaaS Provider (Alchemy)]
```

---

## 3. Connecting to NaaS Providers

Configure your client library (like viem) to connect to your NaaS provider endpoint:

```typescript
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
});
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a Node as a Service (NaaS) provider?
A NaaS provider is a cloud infrastructure company that maintains blockchain nodes, providing developers with API endpoints to connect to networks.

### Q2: What is the disadvantage of using NaaS providers?
It introduces dependency on a third-party service provider, which can rate-limit requests or experience outages.

### Q3: How do I handle status 429 rate limit errors?
Implement query caching, batch requests together using multi-call contracts, and configure request retry limits in your client library.

### Q4: Why should I choose WebSockets over HTTP for NaaS connections?
WebSockets establish a persistent, bidirectional connection, allowing your frontend to receive instant, push-based block and event updates.

### Q5: What are Compute Units (CUs) in NaaS pricing?
CUs are metric units used by providers to measure request complexity (e.g. simple balance checks cost fewer CUs than fetching full transaction traces).
"""
}

# 11. Blockchain Applicability (blockchain-applicability)
articles["blockchain-applicability"] = {
    "title": "Blockchain Applicability: Database Selection & Cost Tradeoffs",
    "tagline": "Evaluate read/write throughputs, trust profiles, and decentralization trade-offs.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["node-as-a-service"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Blockchain Applicability: Database Selection & Cost Tradeoffs

A common mistake in Web3 development is using a blockchain when a traditional centralized database is better suited. Blockchains introduce latency, high storage costs, and transaction fees. This article evaluates when to choose a blockchain, trust profiling, and system design trade-offs.

---

## 1. Selection Guidelines: Database vs. Blockchain

Before choosing a database architecture, evaluate your project's write permissions and trust model:

```
                  ┌──────────────────────────────┐
                  │ Do you need a shared ledger? │
                  └──────────────┬───────────────┘
                                 │
                         ┌───────┴───────┐
                         ▼ Yes           ▼ No
             ┌───────────────────────┐  ┌───────────────────────┐
             │ Multiple writers?     │  │ Central SQL Database  │
             └───────────┬───────────┘  └───────────────────────┘
                         │
                 ┌───────┴───────┐
                 ▼ Yes           ▼ No
     ┌───────────────────────┐  ┌───────────────────────┐
     │ Dislike Intermediary? │  │ Central SQL Database  │
     └───────────┬───────────┘  └───────────────────────┘
                 │
         ┌───────┴───────┐
         ▼ Yes           ▼ No
┌─────────────────────────┐   ┌─────────────────────────┐
│ Use Blockchain Network  │   │ Trusted Third-Party DB  │
└─────────────────────────┘   └─────────────────────────┘
```

---

## 2. Trust Profiling & System Tradeoffs

Choose a blockchain only if your application meets these four conditions:
1. **Multiple Writers**: Multiple independent entities need to write data to the ledger.
2. **Absence of Trust**: Writers do not know or trust each other, and refuse to trust a single centralized database administrator.
3. **Immutability Requirement**: Deployed data must be permanent, auditable, and resistant to revision or deletion.
4. **Execution Rules**: Transactions must follow pre-defined validation logic (smart contracts) enforced by a consensus network.

If these conditions are not met, a traditional centralized database (like PostgreSQL or DynamoDB) is faster, cheaper, and more scalable.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is the main cost overhead of using a blockchain over SQL?
Blockchains require thousands of nodes to copy, validate, and store data, resulting in higher execution transaction fees and network latency.

### Q2: When is a centralized database preferred?
When your system requires high transaction speeds, processes large files, or is managed by a single organization that users trust.

### Q3: What is the risk of using blockchain for private data?
Public blockchains are open ledgers; any data written to them is visible to everyone, violating privacy regulations like GDPR unless encrypted.

### Q4: How do transaction fees (gas) affect blockchain applicability?
High, unpredictable gas fees make blockchains unsuitable for applications that require millions of low-value micro-transactions daily.

### Q5: Can I build a hybrid system with both databases?
Yes. Many modern DApps store lightweight state proofs on-chain, and host large media files and user details in centralized database structures.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch6.json
with open('scratch/bc_batch6.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch6.json containing 11 articles!")
