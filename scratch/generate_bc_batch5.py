import json

articles = {}

# 1. Decentralized Storage (decentralized-storage)
articles["decentralized-storage"] = {
    "title": "Decentralized Storage: IPFS, Filecoin & Permaweb Architectures",
    "tagline": "Explore content-addressed storage nodes, proof of spacetime, and permanent Web3 assets.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["decentralized-storage"],
    "related": ["smart-contract-security-tools", "fuzzing-static-analysis"],
    "practiceProblems": [],
    "markdown": """# Decentralized Storage: IPFS, Filecoin & Permaweb Architectures

Storing large media files, web assets, or transaction datasets directly on a Layer 1 blockchain is prohibitively expensive. Web3 applications resolve this by utilizing decentralized storage networks. This article covers content-addressing, IPFS DHT routing, Filecoin's proof models, and Arweave's permanent permaweb.

---

## 1. Content-Addressing vs. Location-Addressing

Traditional web storage uses **Location-Addressing** (e.g. URLs):
- Files are requested by their server location (e.g., `https://myserver.com/image.png`).
- If the server crashes or the domain changes hands, the link breaks.

Decentralized storage uses **Content-Addressing** (e.g. CIDs):
- Files are identified by their cryptographic hash (e.g., `ipfs://QmXoypizjW3WknzZFwKLm5fvy591V1zB58H3tVJm35` in IPFS).
- The file is verified mathematically by hashing its payload locally. If the content changes by even a single bit, its address (CID) changes, preventing tampering.

```
Location-Addressed:   [Request url] ──> [Server A] ──> [If server offline, File Fails]
Content-Addressed:    [Request hash] ──> [DHT Peer lookup] ──> [Fetch from any online Node]
```

---

## 2. IPFS Distributed Hash Tables (DHT)

IPFS routes content requests using a **Kademlia Distributed Hash Table (DHT)**:
- Nodes in the network declare which CIDs they are hosting.
- When a client requests a file hash, the DHT routes the query through nearby peer nodes until it locates a provider hosting the file.
- The client downloads segments of the file from multiple peers simultaneously, optimizing download speeds.

---

## 3. Filecoin & Staking Proofs: PoRep & PoSt

Filecoin is an incentive layer built on IPFS that enforces storage contracts using two mathematical proofs:
1. **Proof of Replication (PoRep)**: Proved once when a validator starts hosting a file. It proves that the node has dedicated unique physical storage to house a copy of the target file.
2. **Proof of Spacetime (PoSt)**: Run periodically. It verifies that the node is continuously dedicating that physical storage space to host the file over the contract's entire duration.

If a validator fails a PoSt check, the network slashes their staked tokens.

---

## 4. Arweave: Permanent Data & The Permaweb

Arweave provides perpetual storage using a consensus model called **Proof of Access (PoA)**:
- **Permanent Storage**: Users pay a one-time fee to upload data. The fee funds a storage endowment that pays validators for centuries.
- **Proof of Access**: Validators must prove they have access to random historical blocks to mine the next block. This incentivizes nodes to store rare historical files, creating a permanent, censorship-resistant web (the Permaweb).

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is a Content Identifier (CID)?
A CID is a self-describing cryptographic hash that uniquely identifies a file in decentralized storage networks like IPFS.

### Q2: How does Filecoin ensure nodes do not delete files?
By requiring nodes to run periodic Proof of Spacetime (PoSt) checks, slashing their staked tokens if they fail to prove the data is still hosted.

### Q3: What is the Arweave storage endowment?
It is a pool funded by upfront storage fees that earns interest, distributing payouts to validators to fund the storage of files for centuries.

### Q4: Why is IPFS not permanent by default?
IPFS relies on voluntary node hosting. If no node pins a file and it is cleared from local caches, the file becomes inaccessible.

### Q5: How do smart contracts interact with IPFS?
Smart contracts store the static IPFS CID string (e.g. tokenURI in NFTs), pointing frontends to fetch metadata off-chain to save gas.
"""
}

# 2. Security Tooling (smart-contract-security-tools)
articles["smart-contract-security-tools"] = {
    "title": "Smart Contract Security Tooling: Slither & Mythril Integration",
    "tagline": "Configure automated static code analysis, AST validations, and symbolic compilers.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["decentralized-storage"],
    "related": ["fuzzing-static-analysis", "blockchain-threat-vectors"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Security Tooling: Slither & Mythril Integration

Because deployed smart contracts cannot be modified, security audits are essential. Automated security tools help developers detect code bugs and vulnerabilities during development. This article covers static analysis using Slither, symbolic execution with Mythril, and setting up CI/CD security pipelines.

---

## 1. Slither: Static Code Analysis

**Slither** is a static analysis framework written in Python:
- **AST Parsing**: It compiles Solidity files and converts them into an Abstract Syntax Tree (AST) to inspect the structure of the code.
- **Detector Rules**: Slither runs pre-defined detector rules to flag common vulnerabilities like reentrancy, uninitialized variables, shadow variables, and incorrect permission controls.
- **Speed**: It runs in milliseconds, making it ideal for checking code during local compilation.

```
[Solidity Source Code] ──> [Slither AST Compilation] ──> [Detector Rules Scan] ──> [Vulnerability Report]
```

---

## 2. Mythril: Symbolic Execution Engine

While Slither scans code structure, **Mythril** analyzes execution paths:
- **Symbolic Execution**: It executes EVM bytecode using symbolic inputs rather than concrete values.
- **Path Exploration**: Mythril explores all possible execution paths to find inputs that could trigger unexpected states, like math overflows, arbitrary writes, or unauthorized self-destruction.
- **Thoroughness**: Because it explores all execution paths, Mythril takes longer to run than Slither, but detects complex logic bugs that static analysis slips past.

---

## 3. Integrating Security Tooling into CI/CD

To prevent vulnerable code from being merged, configure security tools to run automatically in your CI/CD pipelines (e.g. GitHub Actions):

```yaml
# GitHub Actions security step
- name: Run Slither Security Scan
  uses: crytic/slither-action@v0.4.0
  with:
    node-version: 20
    fail-on: low
```

If Slither detects low-risk or high-risk vulnerabilities, the build step fails, preventing the code from being deployed.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is static code analysis?
Static analysis scans source code structure without executing it, checking code rules to find common vulnerabilities like reentrancy or shadow variables.

### Q2: How does symbolic execution in Mythril differ from static analysis?
Symbolic execution models code execution paths mathematically, testing all input combinations to find states that trigger vulnerabilities.

### Q3: What is the Abstract Syntax Tree (AST)?
The AST is a tree-like representation of source code structure created by the compiler, allowing security tools to trace variables and calls.

### Q4: How do I handle false positives in security tool logs?
Add exclusion comments (e.g. \`// slither-disable-next-line reentrancy-eth\`) to tell the scanner to ignore specific lines after manual review.

### Q5: When should I run Mythril scans?
Run Slither during daily coding tasks, and schedule longer Mythril scans before commits, pull request merges, and production deployments.
"""
}

# 3. Fuzz Testing & Static Analysis (fuzzing-static-analysis)
articles["fuzzing-static-analysis"] = {
    "title": "Fuzz Testing & Static Analysis: Echidna Property-Based Security",
    "tagline": "Configure Echidna fuzzers, build test corpuses, and declare state security assertions.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["smart-contract-security-tools"],
    "related": ["blockchain-threat-vectors", "randomness-attacks"],
    "practiceProblems": [],
    "markdown": """# Fuzz Testing & Static Analysis: Echidna Property-Based Security

To secure complex smart contracts, developers use fuzzing to test how contracts handle unexpected input sequences. Echidna is a popular tool for property-based fuzzing in Solidity. This article covers property-based testing, configuring Echidna, managing test corpuses, and declaring state invariants.

---

## 1. Property-Based Fuzzing vs. Unit Testing

- **Unit Testing**: Tests a function with a single, hardcoded input (e.g. testing `deposit(100)`).
- **Property-Based Testing**: Asserts that a specific rule (a property) remains true no matter what inputs are fed to the contract:
  - **The Fuzzer**: Generates thousands of transaction sequences with randomized inputs, trying to find a sequence that breaks the property.

```
                      ┌───────────────────────┐
                      │    Echidna Fuzzer     │
                      └───────────┬───────────┘
                                  │ (Generate 10,000 Tx sequences)
                                  ▼
[Contract State] ──> [Apply Sequence of Random Inputs] ──> [Assert Property holds True]
```

---

## 2. Declaring Properties in Echidna

In Echidna, properties are written as Solidity functions:
- **Prefix**: Property functions must start with the prefix `echidna_`.
- **Return Value**: They must return a boolean. Echidna tries to find transaction combinations that force the function to return `false`.

```solidity
// Echidna Property Example
contract TokenFuzzTest {
    Token token = new Token();

    // Property: The total supply must never exceed 1,000,000 tokens
    function echidna_supply_limit() public view returns (bool) {
        return token.totalSupply() <= 1000000;
    }
}
```

---

## 3. Configuring Echidna & Corpus Management

To run Echidna, configure a YAML settings file:
- **testLimit**: Define the number of randomized transaction sequences to run (e.g., 50,000).
- **corpusDir**: Directs Echidna to save successful test sequences to a folder. On subsequent runs, it uses these saved sequences as seeds to explore new paths, increasing test coverage.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is property-based fuzzing?
It is a testing method that asserts general rules (properties) about a contract, generating thousands of random inputs to break them.

### Q2: Why must Echidna property functions return a boolean?
Because Echidna is designed to search for transaction combinations that force the property function to return \`false\`.

### Q3: What is the purpose of the Echidna testLimit parameter?
It defines the number of randomized transaction sequences Echidna will execute before marking a property as verified.

### Q4: How does a test corpus improve fuzzing speed?
By saving successful transaction sequences to reuse as start seeds, helping the fuzzer explore deeper code paths on subsequent runs.

### Q5: Can Echidna test reentrancy vulnerabilities?
Yes. Echidna can simulate multi-contract calls and reentrant transactions to test if invariants hold under reentrancy.
"""
}

# 4. Common Threat Vectors (blockchain-threat-vectors)
articles["blockchain-threat-vectors"] = {
    "title": "Blockchain Threat Vectors: Reentrancy, MEV & Gas Limits",
    "tagline": "Analyze reentrancy bugs, MEV frontrunning tactics, sandwich attacks, and DOS gas vulnerabilities.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["fuzzing-static-analysis"],
    "related": ["randomness-attacks", "hybrid-smart-contracts"],
    "practiceProblems": [],
    "markdown": """# Blockchain Threat Vectors: Reentrancy, MEV & Gas Limits

Smart contracts process billions of dollars in public, open environments, making them attractive targets for attackers. Securing code requires understanding common attack vectors. This article covers reentrancy attacks, frontrunning, Maximal Extractable Value (MEV), sandwich attacks, and Denial of Service (DoS) gas exploits.

---

## 1. Reentrancy Vulnerability

Reentrancy remains a major cause of fund loss in Solidity:
- **The Issue**: A contract transfers funds to an external address before updating its internal balance state.
- **The Exploit**: The receiving address is a contract containing a fallback function that calls the withdraw function again recursively, draining the balance before the contract can update its state.

```
[Contract] ──(Transfer Eth)──> [Attacker Contract] ──(Call withdraw() recursively)──> [Contract]
                                                                                       │
                      (Drains balance before state balance is updated) ◀───────────────┘
```

### The Fix
Follow the **Checks-Effects-Interactions Pattern**:
1. Run condition checks first (`require`).
2. Update internal state variables second (effects).
3. Execute external transfers last (interactions). Alternatively, use OpenZeppelin's `nonReentrant` modifier.

---

## 2. Frontrunning & Maximal Extractable Value (MEV)

Transactions sit in the public mempool before execution. Attackers can view pending transactions and exploit them:
- **Frontrunning**: An attacker sees a pending transaction (like a large trade) and submits their own transaction with a higher gas price to ensure it executes first.
- **MEV**: The profit validators or searchers extract by ordering, inserting, or withholding transactions within blocks.
- **Sandwich Attacks**: An attacker sandwich-trades a user's transaction:
  1. Buy the target token first (pushes price up).
  2. The user's transaction executes at the inflated price.
  3. Sell the token immediately after for a profit.

---

## 3. Denial of Service (DoS) via Gas Blocks

Smart contracts have gas execution limits:
- **Array Loops**: Loops that scale dynamically based on user counts can run out of gas as the user set grows, preventing execution.
- **The Block Stuffing DoS**: An attacker fills blocks with high-gas transactions to prevent other users' transactions from being processed.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the Checks-Effects-Interactions pattern?
It is a coding pattern where developers verify conditions first, update internal state variables second, and execute external calls last to prevent reentrancy.

### Q2: How does a sandwich attack exploit traders?
By buying a token right before a user's trade executes (pushing the price up) and selling it immediately after, pocketing the price difference.

### Q3: What is the purpose of OpenZeppelin's nonReentrant modifier?
It acts as a lock flag, preventing a function from being called recursively during its own execution.

### Q4: Why are unbounded loops dangerous in Solidity?
Because as the array grows, executing the loop eventually consumes more gas than the block limit, causing all transactions to fail.

### Q5: How do developers protect contracts from frontrunning?
By implementing slippage tolerance checks and commit-reveal schemes that hide transaction details until order sequences are locked.
"""
}

# 5. Source of Randomness Attacks (randomness-attacks)
articles["randomness-attacks"] = {
    "title": "Randomness Attacks: Block Variables Pitfalls & Chainlink VRF",
    "tagline": "Explore timestamp manipulation, prevrandao limits, and secure verifiable delay randoms.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["blockchain-threat-vectors"],
    "related": ["hybrid-smart-contracts", "chainlink-oracles"],
    "practiceProblems": [],
    "markdown": """# Randomness Attacks: Block Variables Pitfalls & Chainlink VRF

Generating random numbers on a deterministic blockchain is challenging. Because all nodes must arrive at the exact same state, standard random functions (like `Math.random()`) cannot be used. Developers often use block variables, exposing their contracts to exploits. This article covers block variable pitfalls, mining exploits, and secure randomness using Chainlink VRF.

---

## 1. The Insecurity of Block Variables

Many developers use block variables to generate random numbers:

```solidity
// INSECURE Randomness Example
uint256 randomValue = uint256(keccak256(abi.encodePacked(
    block.timestamp,
    block.prevrandao,
    msg.sender
)));
```

### Why Block Variables are Insecure
1. **Block Timestamp Manipulation**: Validators can manipulate the block timestamp by up to a few seconds, letting them modify the hash output to win lottery games.
2. **Prevrandao Limitations**: While more secure than block hashes, `prevrandao` values are known beforehand, allowing builders to anticipate outcomes.
3. **Blockhash Exploits**: Block hashes are only generated after execution, but validators can choose to discard blocks if the hash is unfavorable, sacrificing block rewards to win larger on-chain stakes.

---

## 2. Secure Randomness: Chainlink VRF

To get secure, tamper-proof random numbers, contracts use **Chainlink VRF (Verifiable Random Function)**:
- **Off-Chain Generation**: An oracle node generates a random number off-chain, alongside a cryptographic proof.
- **On-Chain Verification**: The verifier smart contract checks the proof on-chain before using the number.
- **Security Guarantee**: Neither the oracle node nor the validator can manipulate the output without failing verification checks.

```
[Request Randomness] ──> [Chainlink VRF Node] ──(Generates Number + Proof)──> [Verify Proof on-chain]
                                                                                     │
                                  [Secure Random Number returned] ◀──────────────────┘
```

---

## 3. Frequently Asked Questions (FAQs)

### Q1: Why is block.timestamp insecure for generating random numbers?
Because validators can modify the block timestamp by up to a few seconds, allowing them to manipulate the hash output to favor themselves.

### Q2: What is the blockhash limit in Solidity?
Solidity can only retrieve hashes for the last 256 blocks. Older block requests return \`0\`, which can be exploited if contracts wait to resolve states.

### Q3: How does Chainlink VRF verify random numbers?
By generating a cryptographic proof alongside the random value off-chain. The on-chain contract validates this proof before releasing the number.

### Q4: Why does Chainlink VRF require a two-transaction flow?
To prevent frontrunning. The first transaction submits the request, and the second transaction receives the verified random number from the oracle.

### Q5: What is the cost of requesting Chainlink VRF numbers?
Requests require paying gas fees to cover the oracle's callback transaction and protocol fees paid in LINK tokens.
"""
}

# 6. Hybrid Smart Contracts (hybrid-smart-contracts)
articles["hybrid-smart-contracts"] = {
    "title": "Hybrid Smart Contracts: Off-Chain States & TEE Integrations",
    "tagline": "Explore decentralized oracle connectivity, secure execution environments, and off-chain scaling.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["randomness-attacks"],
    "related": ["chainlink-oracles", "oracle-networks"],
    "practiceProblems": [],
    "markdown": """# Hybrid Smart Contracts: Off-Chain States & TEE Integrations

A blockchain is a secure but isolated network. It cannot access real-world data (like stock prices, weather data, or API endpoints) or execute complex computations efficiently. Hybrid smart contracts solve this by combining on-chain security with off-chain data and computation. This article covers hybrid architectures, decentralized oracle networks, and Trusted Execution Environments (TEEs).

---

## 1. The Architecture of Hybrid Smart Contracts

A hybrid smart contract is composed of two primary parts:
1. **On-Chain Component**: The smart contract deployed to the blockchain. It maintains the ledger state, secures assets, and executes final state changes.
2. **Off-Chain Component**: An oracle network or compute layer that gathers real-world data, runs complex logic, and writes verification proofs back to the on-chain contract.

```
┌──────────────────┐               ┌──────────────────┐
│   On-Chain L1    │ ──(Request)──>│   Off-Chain L2   │ (Fetch APIs / Run Logic)
│ (Secure Ledger)  │◀──(Response)──│ (Oracle Network) │
└──────────────────┘               └──────────────────┘
```

---

## 2. Trusted Execution Environments (TEEs)

To execute complex, private calculations off-chain without relying on trusted centralized servers, developers use **TEEs** (e.g. Intel SGX):
- **Hardware Enclaves**: A TEE is an isolated, hardware-level enclave inside a processor.
- **Privacy Guarantee**: The data and code inside the enclave cannot be read or modified by the host system or root users.
- **Attestation**: The TEE generates an attestation proof verifying that the program executed correctly, which can be validated on-chain to trigger smart contract state updates.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is a hybrid smart contract?
A hybrid contract combines on-chain smart contract code with off-chain data feeds and compute resources.

### Q2: Why can blockchains not access external API data directly?
Because blockchains are deterministic. Every node must arrive at the exact same state, which would fail if nodes queried APIs that return changing data.

### Q3: What is a Trusted Execution Environment (TEE)?
A TEE is a hardware-isolated enclave inside a processor that runs code securely and privately, shielding execution from the host system.

### Q4: What does hardware attestation verify?
It is a cryptographic proof generated by a TEE verifying that a specific program was executed exactly as written inside the secure enclave.

### Q5: How do hybrid contracts improve scaling?
By moving computationally heavy tasks (like sorting or processing large datasets) off-chain, and writing only the final results to the blockchain.
"""
}

# 7. Chainlink (chainlink-oracles)
articles["chainlink-oracles"] = {
    "title": "Chainlink: DONs, Data Feeds & Cross-Chain CCIP Channels",
    "tagline": "Explore Decentralized Oracle Networks, secure VRF generation, and CCIP message routing.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["hybrid-smart-contracts"],
    "related": ["oracle-networks", "dapp-testing"],
    "practiceProblems": [],
    "markdown": """# Chainlink: DONs, Data Feeds & Cross-Chain CCIP Channels

Chainlink is a widely used decentralized oracle network. It provides smart contracts with secure access to external APIs, randomness, automated executions, and cross-chain messaging. This article covers Decentralized Oracle Networks (DONs), Data Feeds, Chainlink Automation, and the Cross-Chain Interoperability Protocol (CCIP).

---

## 1. Decentralized Oracle Networks (DONs) & Data Feeds

Using a single oracle node to fetch external data introduces a single point of failure. If the node is hacked or goes offline, the smart contract receives invalid data.

Chainlink resolves this using **Decentralized Oracle Networks (DONs)**:
- **Multiple Nodes**: A network of independent oracle nodes fetches data from separate API sources.
- **Data Aggregation**: Nodes submit their answers, and a consensus protocol calculates the median value.
- **Data Feeds**: This median value is written to an on-chain oracle aggregator contract, providing DeFi protocols with tamper-resistant price feeds.

```
                  ┌─── [Oracle Node 1] ───┐
                  │                       │
[External API] ───┼─── [Oracle Node 2] ───┼─── [Calculate Median] ──> [On-Chain Contract]
                  │                       │
                  └─── [Oracle Node 3] ───┘
```

---

## 2. Chainlink Automation & CCIP Routing

- **Chainlink Automation**: Smart contracts cannot trigger themselves. Chainlink Automation utilizes a network of nodes to monitor off-chain conditions and execute contract functions automatically when criteria are met (e.g., executing liquidations).
- **Cross-Chain Interoperability Protocol (CCIP)**: A cross-chain messaging standard that allows smart contracts to send data, transfer tokens, and trigger contract executions across different blockchains securely.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: Why do Chainlink Data Feeds use median aggregation?
Using the median prevents single outlier nodes or compromised APIs from distorting the price feed value.

### Q2: What is a Decentralized Oracle Network (DON)?
A DON is a group of independent oracle nodes that fetch and aggregate data off-chain before writing the verified result to a blockchain.

### Q3: How does Chainlink Automation monitor smart contracts?
By continuously calling check functions off-chain and submitting execution transactions to the contract once defined criteria return true.

### Q4: What is Chainlink CCIP?
CCIP is an interoperability protocol that enables secure token transfers and cross-chain messaging across different blockchains.

### Q5: How do Data Feeds defend against flash loan exploits?
By aggregating asset prices from multiple volume-weighted exchange sources rather than relying on a single decentralized pool's active price.
"""
}

# 8. Oracle Networks (oracle-networks)
articles["oracle-networks"] = {
    "title": "Oracle Networks: Data Aggregations, Attestations & Fallbacks",
    "tagline": "Compare decentralized oracle structures, data attestation proofs, and node reputations.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["chainlink-oracles"],
    "related": ["dapp-testing", "dapp-architecture"],
    "practiceProblems": [],
    "markdown": """# Oracle Networks: Data Aggregations, Attestations & Fallbacks

Connecting smart contracts to real-world data requires robust oracle architectures. Oracle networks must ensure data integrity, verify inputs cryptographically, and implement fallback layers to prevent failures. This article covers data aggregation methods, cryptographic attestations, node reputation models, and fallback systems.

---

## 1. Data Aggregation & Consensus Methods

Oracle networks gather data from multiple sources to eliminate bias:
- **Median Aggregation**: Used for numerical price feeds to filter out anomalous price spikes.
- **Weighted Averages**: Aggregates prices based on the trading volume of the source exchanges.
- **Consensus Verification**: For non-numerical data (like flight updates), nodes must reach a majority consensus before writing data on-chain.

---

## 2. Cryptographic Attestations & Node Reputation

- **Attestations**: Oracle nodes sign their data payloads using their private keys, creating a cryptographic proof that validates the source and integrity of the data.
- **Reputation Systems**: Networks track node performance metrics (uptime, response latency, data accuracy). Malicious or slow nodes are downgraded, reducing their chance of selection for future high-value data requests.

```
[Fetch API] ──> [Node Signs Data with Private Key] ──> [On-Chain verification of Signature]
```

---

## 3. Fallback Infrastructures

If an oracle network stalls or feeds stale data, dependent DeFi protocols can fail. To protect against this, developers implement **Fallback Oracles**:
- If the primary oracle fails to update within a set window (e.g. 1 hour), the smart contract automatically switches to a backup oracle network (e.g. switching from Chainlink to Pyth).

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why is a centralized oracle dangerous?
A centralized oracle is a single point of failure; if the owner is hacked or goes offline, the contract receives corrupt or stale data.

### Q2: What does cryptographic data attestation guarantee?
It guarantees that the data was signed by a specific, authorized oracle node and has not been modified in transit.

### Q3: How do node reputation systems protect oracle networks?
By tracking metrics like uptime and data accuracy, allowing the network to filter out slow or malicious nodes.

### Q4: When is a fallback oracle triggered?
A fallback oracle is triggered when the primary feed fails to update within a configured time limit, or returns invalid values.

### Q5: How do oracle networks handle API access keys securely?
By using decentralized key management and encrypted secrets stored inside secure hardware enclaves (TEEs) on oracle nodes.
"""
}

# 9. Testing & Deployment (dapp-testing)
articles["dapp-testing"] = {
    "title": "DApp Testing & Deployment: End-to-End Web3 Integration",
    "tagline": "Configure local oracle mock scripts, testnet deployments, and Playwright browser tests.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["oracle-networks"],
    "related": ["dapp-architecture"],
    "practiceProblems": [],
    "markdown": """# DApp Testing & Deployment: End-to-End Web3 Integration

Building decentralized applications (DApps) requires testing the integration between smart contracts, backend indexing engines, and frontend wallet connectors. This article covers writing mock contract scripts, testnet deployments, and executing automated Web3 browser tests.

---

## 1. Mocking Oracle Inputs Locally

Testing contract code that depends on external oracle feeds (like prices or randomness) requires mocking those feeds locally:
- **Mock Contracts**: Deploy a mock contract that mimics the oracle's interface:
  ```solidity
  contract MockV3Aggregator {
      int256 private mockPrice;
      function updateAnswer(int256 _price) public { mockPrice = _price; }
      function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
          return (0, mockPrice, 0, 0, 0);
      }
  }
  ```
- **Local Control**: During tests, your scripts call `updateAnswer` to simulate price fluctuations and verify how your contract handles market shifts.

---

## 2. Testnet Deployment Protocols

Once local tests pass, deploy contracts to public testnets (e.g., Sepolia):
1. **RPC Endpoints**: Configure deployment tools to connect via testnet provider nodes (e.g. Alchemy or Infura).
2. **Faucet Gas**: Retrieve testnet gas tokens from faucets.
3. **Contract Verification**: Verify the deployed contract's source code on-chain block explorers.

---

## 3. Automated Web3 Browser Testing with Playwright

To test the frontend user experience (connecting wallet, signing transactions), developers use **Playwright** paired with wallet simulator tools (like Synpress):
- **Wallet Automation**: Synpress launches a Chromium instance with MetaMask pre-installed, automating connection prompts.
- **E2E Assertions**: The test script triggers clicks, confirms MetaMask popups automatically, and asserts that the UI displays updated balances.

```
[Start Playwright + Synpress] ──> [Load Frontend Page] ──> [Click Connect] ──> [Auto-approve in MetaMask]
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why are mock aggregator contracts necessary in local tests?
They simulate external oracle feeds locally, allowing developers to test contract logic without needing live internet connections.

### Q2: What is Synpress?
Synpress is an extension for Playwright and Cypress that automates browser wallet interactions (like MetaMask approvals) during E2E tests.

### Q3: How do I select a testnet for deployment?
Choose a testnet that matches your target mainnet ecosystem (e.g. Sepolia for Ethereum, Amoy for Polygon) and check that active faucets are available.

### Q4: Why should I write E2E browser tests for a DApp?
To verify that the frontend UI maps connection states, handles transaction errors gracefully, and updates state balances correctly for the user.

### Q5: How do I automate contract address updates in my frontend code?
Configure your deployment scripts to write compiled contract addresses directly into a shared JSON file that your frontend reads at runtime.
"""
}

# 10. Architecture & Security (dapp-architecture)
articles["dapp-architecture"] = {
    "title": "DApp Architecture: Secure APIs, RPC Routing & Frontend Defense",
    "tagline": "Configure secure wallet authentication, RPC node failovers, and client-side defenses.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["dapp-testing"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# DApp Architecture: Secure APIs, RPC Routing & Frontend Defense

A secure decentralized application requires safe connections between frontends, RPC nodes, and smart contract layers. While smart contracts enforce on-chain security, frontends are vulnerable to DNS hijackings and client-side exploits. This article covers secure API integration, RPC node routing, Web3 signature logins, and frontend security.

---

## 1. RPC Node Routing & Load Balancing

DApps query blockchain states by sending requests to **Remote Procedure Call (RPC) Nodes**:
- **Rate Limits**: Free public RPC nodes quickly rate-limit high-traffic applications.
- **Failover Configuration**: Configure Web3 libraries (like viem or ethers.js) with fallback arrays containing multiple RPC providers (e.g. Infura, Alchemy, and custom nodes) to ensure the application remains functional if one provider goes offline.

```javascript
// viem fallback provider example
import { fallback, http } from 'viem'
const client = createPublicClient({
  transport: fallback([
    http('https://eth-mainnet.g.alchemy.com/v2/key'),
    http('https://mainnet.infura.io/v3/key')
  ])
})
```

---

## 2. Web3 Signature Authentication (SIWE)

Traditional login models use usernames and passwords. DApps utilize **Sign-In with Ethereum (SIWE)** to authenticate users:
1. **Nonce Request**: The backend generates a unique nonce and session token.
2. **Signature request**: The frontend requests the user to sign a standardized message containing the nonce using their private key.
3. **Verification**: The backend verifies the signature on-chain. If valid, it establishes a secure session without requiring passwords or database credential tables.

---

## 3. Frontend Security: Wallet Draining Prevention

Because frontends interact with browser wallets, they are attractive targets for hackers:
- **XSS Mitigations**: Sanitize all inputs to prevent Cross-Site Scripting (XSS) attacks that could inject malicious wallet approval calls.
- **Slippage Safeguards**: Calculate slippage bounds on-chain rather than trusting frontend variables, which can be modified by client-side injectors.
- **Content Security Policies (CSP)**: Implement strict CSP headers to prevent unauthorized external scripts from running inside your DApp.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is Sign-In with Ethereum (SIWE)?
SIWE is an authentication standard that allows users to log in securely by signing a standardized message with their private key, replacing passwords.

### Q2: Why is configuring RPC fallbacks important?
To prevent DApp downtime. If one RPC provider goes offline or hits rate limits, the library automatically redirects queries to the backup nodes.

### Q3: How do attackers execute wallet-draining hacks on frontends?
By using XSS or DNS hijacking to inject scripts that trick users into signing malicious approvals (e.g. \`approve(attacker, infinity)\`).

### Q4: What is the purpose of the nonce in SIWE signatures?
The nonce is a random value that prevents replay attacks, ensuring an attacker cannot reuse a captured login signature to authenticate a new session.

### Q5: How do I secure API keys in a client-side DApp?
Do not expose private keys in client-side code. Instead, route sensitive requests through a backend server that holds the keys securely.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch5.json
with open('scratch/bc_batch5.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch5.json containing 10 articles!")
