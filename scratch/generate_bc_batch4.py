import json

articles = {}

# 1. Solana (solana-network)
articles["solana-network"] = {
    "title": "Solana Network: Accounts, Sealevel Runtime & Parallel Scaling",
    "tagline": "Deconstruct data vs executable accounts, rent exemptions, and parallel execution pipelines.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["proof-of-history"],
    "related": ["smart-contract-languages", "smart-contract-frameworks"],
    "practiceProblems": [],
    "markdown": """# Solana Network: Accounts, Sealevel Runtime & Parallel Scaling

While Ethereum executes smart contracts sequentially using a single EVM thread, Solana scales transaction throughput by executing contracts in parallel. This is made possible by separating program logic from data storage. This article covers Solana's account-based storage model, rent exemptions, the Sealevel parallel runtime, and validation pipelines.

---

## 1. The Solana Account Model: Data vs. Executable Accounts

Unlike Ethereum, where smart contract code and state are stored in the same contract account, Solana separates them completely:
- **Executable Accounts**: Accounts that store the compiled Read-Only WebAssembly (Wasm) or BPF bytecode of a smart contract program. They do not store user balances or custom states.
- **Data Accounts**: Accounts that store data, variables, and balances. They are owned by an executable program, which has exclusive rights to modify their data.

```
       ┌────────────────────────┐
       │   Executable Account   │ (Program Bytecode)
       └───────────┬────────────┘
                   │
                   ▼ (Controls & Writes to)
       ┌────────────────────────┐
       │      Data Account      │ (User Balances & Variables)
       └────────────────────────┘
```

---

## 2. Account Rent & Rent Exemptions

Storing data on the global validator network consumes SSD storage. To compensate validators, Solana implements **Rent**:
- Accounts must maintain a minimum balance of lamports (the smallest denomination of SOL).
- **Rent Exemption**: If an account holds enough lamports to cover two years of storage costs, it is flagged as rent-exempt and pays no rent fees. Most modern dApps require accounts to be created with this rent-exempt balance upfront.

---

## 3. Sealevel Parallel Runtime & Transaction Execution

Solana's parallel transaction execution engine is called **Sealevel**:
- **State Overlap Mapping**: Solana transactions specify exactly which accounts they will read and write to upfront.
- **Parallel Processing**: If two transactions read/write to independent accounts (e.g. Alice sending to Bob, and Charlie sending to Dave), Sealevel executes them simultaneously on different CPU cores.
- **Sequential Execution**: If transactions modify the same account (e.g. multiple users interacting with the same liquidity pool), they are run sequentially to prevent race conditions.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why does Solana separate contract code from contract data?
To enable parallel execution. By identifying which data accounts a program will read/write to upfront, the runtime can process non-overlapping transactions simultaneously.

### Q2: What is rent exemption in Solana?
Rent exemption is the state where an account holds sufficient SOL tokens (equal to 2 years of rent) to bypass paying ongoing storage fees.

### Q3: What is the Sealevel runtime?
Sealevel is Solana's parallel smart contract execution engine that allows non-overlapping transactions to run simultaneously across multi-core processors.

### Q4: How does Solana prevent race conditions during parallel writes?
Transactions must declare all target accounts upfront. If two transactions attempt to write to the same account, Sealevel sequences them to execute sequentially.

### Q5: What is the role of a system account in Solana?
A system account is a basic wallet account controlled by a private key, used to hold SOL and initiate transactions.
"""
}

# 2. Programming Languages (smart-contract-languages)
articles["smart-contract-languages"] = {
    "title": "Smart Contract Languages: Solidity, Rust & Low-Level EVM Assembly",
    "tagline": "Compare Solidity compilation, Rust memory safety, and Yul gas optimization opcodes.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["solana-network"],
    "related": ["smart-contract-ides", "smart-contract-frameworks"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Languages: Solidity, Rust & Low-Level EVM Assembly

Smart contract development requires choosing a programming language suited for the target blockchain runtime. This article compares Solidity (the standard for EVM chains), Rust (the language of Solana, Near, and Polkadot), and Yul (the low-level intermediate language for EVM gas optimization).

---

## 1. Solidity: EVM-Native Object-Oriented Language

Solidity is a high-level, statically-typed language designed specifically for the EVM:
- **State Variables**: Variables declared at the contract level are written directly to persistent storage.
- **Functions & Modifiers**: Functions define contract entry points. Modifiers act as middle-ware checks to restrict access (e.g. `onlyOwner`).
- **Security Hazards**: Developers must navigate vulnerabilities like **Reentrancy** (where an external call executes recursively before the contract updates its internal state) and integer overflows.

```solidity
// Simple Solidity Example
contract Counter {
    uint256 public count;

    function increment() public {
        count += 1;
    }
}
```

---

## 2. Rust: High-Performance Wasm & BPF Compiler Target

Rust is used to write smart contracts on Solana, Near, and Polkadot:
- **Compile-Time Safety**: Rust's compiler enforces strict memory safety rules (ownership, borrowing, lifetime tracking), eliminating null pointer errors and memory leaks.
- **Resource Constraints**: Rust programs compile to WebAssembly (Wasm) or Berkley Packet Filter (BPF) bytecode, running fast on multi-core validators.
- **No Global State**: Unlike Solidity, Rust programs are stateless; they modify data by reading and writing to external data accounts.

---

## 3. Yul: Low-Level EVM Assembly

Yul is an intermediate language compiled directly to EVM assembly:
- **Opcodes Access**: Allows developers to bypass Solidity compiler abstractions and write assembly code directly (e.g. `mstore`, `sstore`, `mload`).
- **Gas Optimizations**: Writing critical sections in Yul minimizes stack changes and memory allocations, reducing execution gas costs by up to 50%.

```yul
// Yul inline assembly block
assembly {
    let result := add(x, y)
    mstore(0x40, result)
}
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a reentrancy attack in Solidity?
A reentrancy attack occurs when a contract calls an external untrusted contract before updating its state, allowing the external contract to call back recursively and drain funds.

### Q2: Why are Rust smart contracts described as stateless?
Because Solana's architecture stores contract code in executable accounts and variable data in separate data accounts, forcing Rust programs to read/write externally.

### Q3: What is Yul?
Yul is a low-level intermediate assembly language for the EVM, allowing developers to write optimized opcodes to minimize gas costs.

### Q4: When should I choose Rust over Solidity?
Choose Rust when building on Wasm/BPF-based blockchains like Solana, or when you require strict compile-time safety and peak execution performance.

### Q5: How do modifier functions work in Solidity?
Modifiers declare pre-requisite conditions (e.g., verifying access keys) that run automatically before a function executes its main body.
"""
}

# 3. IDEs (smart-contract-ides)
articles["smart-contract-ides"] = {
    "title": "Smart Contract IDEs: Remix, VS Code & Compiler Integrations",
    "tagline": "Configure rapid browser compilers, local editor plugins, and debugging suites.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["smart-contract-languages"],
    "related": ["smart-contract-frameworks", "smart-contract-testing"],
    "practiceProblems": [],
    "markdown": """# Smart Contract IDEs: Remix, VS Code & Compiler Integrations

Writing secure smart contracts requires developer environments equipped with compiler validations, code linters, and debugging tools. This article covers the Remix Online IDE, setting up local development editors like VS Code, and configuring compiler plugins.

---

## 1. Remix Online IDE: Rapid Browser Development

**Remix** is a powerful, browser-based IDE optimized for Solidity smart contracts:
- **No Setup Required**: Compiles Solidity code directly in the browser.
- **EVM Simulator**: Features an in-memory blockchain simulation environment to test contract deployments instantly.
- **Debugger**: Allows developers to step through transaction execution traces line-by-line, monitoring stack and memory alterations.

---

## 2. VS Code Workspace Configs

For professional codebases, developers transition to local environments using **VS Code**:
- **Solidity Plugins**: Install extensions like `Nomic Foundation Solidity` to get syntax highlighting, formatting, and auto-completions.
- **rust-analyzer**: If writing contracts in Rust for Solana, configure `rust-analyzer` to parse Wasm/BPF compile targets.
- **Code Linter**: Integrate tools like **Solhint** to flag style guide violations and security hazards during editing.

```json
// .vscode/settings.json
{
  "solidity.formatter": "prettier",
  "solidity.linter": "solhint"
}
```

---

## 3. Local Compiler Toolchain Integrations

IDE environments interface directly with compiler executables (`solc` for Solidity, `cargo` for Rust). Local frameworks automate switching between compiler versions, ensuring contracts build under correct dependency guidelines.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: When is Remix preferred over VS Code?
Remix is ideal for prototyping, testing small scripts, and stepping through execution trace paths rapidly in the browser without setup.

### Q2: Why is rust-analyzer critical for Solana developers?
It provides compiler validation, type completions, and reference checks, which are essential for navigating Rust's strict compiler rules.

### Q3: What is the purpose of Solhint in VS Code?
Solhint is a linter that scans Solidity files during coding to flag security bugs, styling issues, and syntax errors before compilation.

### Q4: How do I test deployments in Remix?
Use the built-in Remix VM environment, which allocates 10 mock Ethereum accounts with 100 ether each to simulate on-chain transactions.

### Q5: How do I resolve compiler version conflicts in IDEs?
Ensure your IDE compiler version settings match the pragma statement declared at the top of your Solidity files (e.g., \`pragma solidity ^0.8.0\`).
"""
}

# 4. Frameworks & Version Control (smart-contract-frameworks)
articles["smart-contract-frameworks"] = {
    "title": "Smart Contract Frameworks: Foundry, Hardhat & Anchor",
    "tagline": "Configure JS/TS compiler engines, Rust-based testing tools, and Solana serialization frameworks.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["smart-contract-ides"],
    "related": ["smart-contract-testing", "smart-contract-deployment"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Frameworks: Foundry, Hardhat & Anchor

Local development frameworks compile code, run tests, and manage deployments. They automate the developer workflow, replacing manual compile commands. This article compares the three leading smart contract frameworks: Hardhat (JS/TS ecosystem), Foundry (Rust-based, Solidity-native testing), and Anchor (the standard for Solana development).

---

## 1. Hardhat: JavaScript & TypeScript Tooling

**Hardhat** is a task runner and deployment framework built on Node.js:
- **Ecosystem**: Runs tests written in JavaScript or TypeScript using Mocha and Waffle.
- **Debugging**: Features `console.log` support within Solidity code, displaying output directly in the terminal during test runs.
- **Configuration**: Highly extensible via plugins (e.g. gas reporting, Etherscan code verification).

---

## 2. Foundry: Rust-Based, Solidity-Native Framework

**Foundry** is a modern, fast development toolchain written in Rust:
- **Solidity-Native Testing**: Tests are written in Solidity. Developers write test assertions using standard Solidity structures, avoiding the need to learn JS/TS helper libraries.
- **Performance**: Compiles contracts and runs test suites in milliseconds.
- **Fuzz Testing**: Features built-in fuzz testing where developers declare input parameters, and Foundry feeds random variables to find edge-case failures.

```solidity
// Foundry test example
function testIncrement() public {
    counter.increment();
    assertEq(counter.count(), 1);
}
```

---

## 3. Anchor: Solana Program Development Framework

**Anchor** is the standard framework for Solana Rust programs:
- **Serialization Boilerplate**: Automatically manages account serialization and deserialization using the Borsh library.
- **Security Checkers**: Implements automated security checks, verifying account owners and instruction permissions.
- **IDL Generation**: Automatically generates an Interface Definition Language (IDL) file (similar to an ABI in Ethereum), allowing frontends to interact with Rust programs easily.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main benefit of writing tests in Foundry over Hardhat?
Foundry tests are written in Solidity, avoiding the context switch between Solidity and JavaScript, and executions run orders of magnitude faster.

### Q2: How does Anchor help Solana developers manage storage?
Anchor manages account serialization and deserialization, automating data conversions when writing to or reading from Solana data accounts.

### Q3: What is the role of the hardhat.config.ts file?
It serves as the main configuration file where developers specify Solidity compiler versions, target network RPC endpoints, and active plugins.

### Q4: How does fuzz testing work in Foundry?
If a test function accepts arguments, Foundry feeds thousands of random inputs into the function to detect boundary conditions and failures automatically.

### Q5: What does Anchor's IDL file represent?
The IDL is a JSON schema describing a Solana program's entry points, parameters, and account structures, allowing client libraries to connect easily.
"""
}

# 5. Testing (smart-contract-testing)
articles["smart-contract-testing"] = {
    "title": "Smart Contract Testing: Fuzzing, Invariants & Fork Testing",
    "tagline": "Explore assertion testing, randomized input fuzzing, state invariants, and local fork simulations.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["smart-contract-frameworks"],
    "related": ["smart-contract-deployment", "smart-contract-monitoring"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Testing: Fuzzing, Invariants & Fork Testing

Because smart contracts are immutable once deployed, catching bugs before they hit production is critical. A robust testing strategy goes far beyond simple unit tests. This article covers the testing hierarchy: unit testing assertions, fuzz testing, invariant properties, and fork testing mainnet environments locally.

---

## 1. Unit Testing & Assertion Checks

Unit testing validates individual functions:
- **Assertions**: Verify that functions return expected values (e.g. `assertEq`).
- **Reversion Checks**: Verify that functions revert when invalid inputs are provided (e.g. `vm.expectRevert`).
- **Events**: Confirm that smart contracts emit correct event logs during executions.

---

## 2. Fuzz Testing vs. Invariant Testing

### Fuzz Testing (Stateless Fuzzing)
The testing framework feeds randomized values into a target function to find boundary-condition failures:
- **Example**: Testing a deposit function with inputs ranging from 0 to $2^{256}-1$ to check for overflow issues.

### Invariant Testing (Stateful Fuzzing)
Verifies that specific network or contract rules (invariants) remain true regardless of the sequence of actions executed:
- **Example**: In a token exchange, verifying that the total reserve balance never drops below the combined pool liquidity.

```
       [Contract State] ──> Run Random Actions (Fuzz) ──> [Verify Invariant holds True]
```

---

## 3. Mainnet Fork Testing

Many smart contracts interact with external protocols (like Uniswap or Chainlink). Mocking these integrations in local tests is complex and prone to errors.

**Fork Testing** solves this:
- The framework starts a local test network that pulls live state data from the mainnet via an RPC provider.
- Developers test contract interactions with active, live protocols locally, without spending gas fees or deploying files to production.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a state invariant in smart contract testing?
A state invariant is a rule that must remain true at all times during execution, regardless of what transactions are sent to the contract.

### Q2: Why is fork testing useful for DeFi developers?
It allows testing contract code against active mainnet states and protocols (like Aave or Uniswap) without deploying anything to production.

### Q3: What is the difference between stateless and stateful fuzzing?
Stateless fuzzing tests single functions with random inputs starting from a clean state. Stateful fuzzing runs chains of transactions to test rules across state changes.

### Q4: How do I test that a function reverts correctly?
Use test helpers (like Foundry's \`vm.expectRevert\`) before calling the function to assert that it halts and rolls back invalid executions.

### Q5: What is a coverage report in testing?
A coverage report displays the percentage of contract source code lines, branches, and functions executed by the test suite, highlighting untested paths.
"""
}

# 6. Deployment (smart-contract-deployment)
articles["smart-contract-deployment"] = {
    "title": "Smart Contract Deployment: Key Management & Code Verifications",
    "tagline": "Configure deployment scripts, protect provider keys, and verify contract code on Etherscan.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["smart-contract-testing"],
    "related": ["smart-contract-monitoring", "erc-tokens"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Deployment: Key Management & Code Verifications

Writing smart contracts is only half the battle. Once verified, developers must deploy their contracts to the target blockchain and verify the source code. This article covers compiling contracts, secure key management, writing deployment scripts, and verifying source code on block scanners.

---

## 1. Local Compilation & Deployment Scripts

Before deploying, developers compile their source code:
- **ABI (Application Binary Interface)**: A JSON schema mapping a contract's functions and inputs, allowing client applications to interact with the bytecode.
- **Bytecode**: The compiled assembly bytecode executed by the EVM.
- **Deployment Scripts**: Scripts (written in JS, TS, or Solidity) that call constructor functions and submit creation transactions.

---

## 2. Secure Key Management Protocols

The deployment script must sign the creation transactions using the deployer's private key:
- **The Risk**: Hardcoding private keys in scripts or committing them in `.env` files to public git repositories leads to immediate fund theft.
- **Secure Practices**: Load private keys dynamically using terminal environment variables, retrieve them from local keystore files encrypted with passwords, or sign transactions using hardware wallets.

```
       [Keystore File] ──(Decrypt via Password)──> [Deployer Key] ──> [Sign Deployment Tx]
```

---

## 3. On-Chain Source Code Verification

To build trust, developers verify their contract source code on block explorers like Etherscan:
- **Bytecode Matching**: The explorer compiles the provided Solidity files and verifies that the output matches the bytecode deployed on-chain.
- **Public Auditability**: Once verified, the source code is displayed publicly on Etherscan, allowing users to inspect contract logic.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the Application Binary Interface (ABI)?
The ABI is a JSON schema that defines a contract's entry points and functions, allowing client applications to serialize calls correctly.

### Q2: Why is committing a .env file containing private keys dangerous?
If the repository is pushed to a public host (like GitHub), scanners will immediately detect the key and drain all associated assets.

### Q3: How does Etherscan verify smart contract source code?
By compiling the submitted Solidity files with the declared settings (compiler version, optimization flags) and comparing the resulting bytecode with the deployed on-chain bytecode.

### Q4: What is the constructor function in a deployment?
The constructor is a setup function that executes once during block initialization to configure the contract's initial parameters (e.g. setting the owner).

### Q5: How do I manage network RPC timeouts during deployments?
Configure backup RPC provider nodes in your development framework settings, and adjust retry limits to prevent interrupted deployment transactions.
"""
}

# 7. Monitoring & Upgrades (smart-contract-monitoring)
articles["smart-contract-monitoring"] = {
    "title": "Smart Contract Monitoring & Upgrades: Proxy Patterns & Subgraphs",
    "tagline": "Explore contract upgradeability, proxy layouts, event logging, and subgraph indexers.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["smart-contract-deployment"],
    "related": ["erc-tokens", "wallet-integration"],
    "practiceProblems": [],
    "markdown": """# Smart Contract Monitoring & Upgrades: Proxy Patterns & Subgraphs

Because smart contracts are immutable by default, addressing bugs or adding features after deployment requires specialized patterns. Developers must also monitor contract events to build indexing pipelines. This article covers proxy upgrade patterns, indexing event logs using subgraphs, and security monitoring.

---

## 1. Smart Contract Upgradeability: Proxy Patterns

To update contract logic while preserving state and address parameters, developers use **Proxy Patterns**:
- **Proxy Contract**: The client interfaces with a permanent proxy contract that stores all variable states. The proxy forwards calls to an implementation contract using `delegatecall`.
- **Implementation Contract**: Stores the execution logic.
- **The Upgrade**: To update logic, the admin changes the implementation address stored in the proxy, routing subsequent calls to the new logic contract.

```
                  [Client Call]
                        │
                        ▼
             ┌─────────────────────┐
             │   Proxy Contract    │ (Stores State variables)
             └──────────┬──────────┘
                        │
                        ▼ (delegatecall)
             ┌─────────────────────┐
             │   Implementation    │ (Contract Logic & Code)
             └─────────────────────┘
```

### Proxy Vulnerabilities
- **Storage Collisions**: The proxy and implementation must declare variables in the exact same memory slots. A mismatch can overwrite variables, corrupting the contract state.
- **UUPS vs. Transparent Proxies**: Universal Upgradeable Proxy Standard (UUPS) stores the upgrade logic inside the implementation contract, which saves gas compared to storing it in the proxy.

---

## 2. Event Log Indexing & Subgraphs

Querying events directly from a blockchain client node is slow and resource-intensive. We resolve this using **The Graph**:
- **Event Logs**: Contracts emit events during transactions (e.g. `emit Transfer(from, to, value)`).
- **Subgraphs**: Indexing engines that scan the blockchain, extract event logs, and store them in structured databases, allowing clients to query data quickly using GraphQL.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: How does delegatecall function in proxy upgrade patterns?
\`delegatecall\` executes code from a target contract using the calling contract's storage, balance, and address parameters.

### Q2: What is a storage collision in upgradeable contracts?
A storage collision occurs when a proxy and its implementation map different variables to the same storage slot, causing variables to overwrite each other.

### Q3: Why is UUPS preferred over Transparent proxy patterns?
UUPS stores upgrade logic in the implementation contract, which reduces the proxy's size and lowers transaction gas costs.

### Q4: What is a subgraph?
A subgraph is a custom indexer configuration that defines how to extract and index on-chain event logs to serve fast GraphQL queries.

### Q5: How do multisig wallets secure upgrade operations?
By routing proxy updates through a multisig wallet (like Safe), ensuring that multiple signers must approve upgrades to prevent malicious takeovers.
"""
}

# 8. ERC Tokens (erc-tokens)
articles["erc-tokens"] = {
    "title": "ERC Tokens: ERC-20, ERC-721 & ERC-1155 Token Standards",
    "tagline": "Differentiate fungible tokens, non-fungible assets, and multi-token batch patterns.",
    "category": "Blockchain",
    "readTime": 15,
    "prerequisites": ["smart-contract-monitoring"],
    "related": ["wallet-integration", "crypto-faucets"],
    "practiceProblems": [],
    "markdown": """# ERC Tokens: ERC-20, ERC-721 & ERC-1155 Token Standards

Standardization enables composability. On Ethereum, tokens follow defined blueprints (ERC standards) to ensure that wallets, exchanges, and DeFi protocols can interact with them automatically. This article compares ERC-20 (fungible), ERC-721 (non-fungible), and ERC-1155 (multi-token) standards.

---

## 1. ERC-20: Fungible Token Standard

**ERC-20** is the standard for identical, interchangeable tokens (e.g. stablecoins or utility tokens):
- **Identical Value**: One token is identical in value and function to any other token of the same type.
- **Core Functions**:
  - `balanceOf(address)`: Returns an account's token balance.
  - `transfer(to, value)`: Transfers tokens directly from the caller.
  - `approve(spender, value)` and `transferFrom(from, to, value)`: Allows a smart contract (like an exchange) to spend tokens on a user's behalf.

---

## 2. ERC-721: Non-Fungible Token (NFT) Standard

**ERC-721** is the standard for unique, non-interchangeable digital assets (e.g. digital art, domain names, or physical asset receipts):
- **Uniqueness**: Each token is assigned a unique `tokenId`.
- **Metadata Association**: The standard maps each token ID to a metadata URI (usually pointing to an IPFS JSON file) containing details like name, description, and image paths:

$$\\text{tokenURI}(\\text{tokenId}) \\to \\text{"ipfs://Qm..."}$$

---

## 3. ERC-1155: Multi-Token Standard

**ERC-1155** is a hybrid standard that supports both fungible and non-fungible tokens in a single contract:
- **Gas Savings**: Enables batch transfers, allowing multiple token types to be sent in a single transaction, reducing network gas fees compared to running separate ERC-20 and ERC-721 operations.
- **Fungibility Toggles**: Ideal for games, where a single contract manages both fungible assets (like currency) and unique items (like weapons).

```
┌─────────────────────────────────────────────────────────────────┐
│                        Token Standards                          │
├───────────────────┬───────────────────┬─────────────────────────┤
│      ERC-20       │      ERC-721      │        ERC-1155         │
├───────────────────┼───────────────────┼─────────────────────────┤
│ Fungible Assets   │ Unique Assets     │ Hybrid Multi-Token      │
│ Identical Tokens  │ Unique Token IDs  │ Batch Transfers         │
│ Balances Mapping  │ Ownership Mapping │ Gas-Efficient Gaming    │
└───────────────────┴───────────────────┴─────────────────────────┘
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What does the approve function do in ERC-20 tokens?
It grants a third-party address (like a Uniswap contract) permission to transfer a specified amount of tokens from your wallet.

### Q2: How do ERC-721 tokens represent digital artwork?
By storing a unique \`tokenId\` on-chain and mapping it to a \`tokenURI\` URL that points to the metadata and image hosted on IPFS.

### Q3: What is the main benefit of the ERC-1155 standard?
It supports batch transfers of multiple token types in a single transaction, reducing gas fees compared to separate transfers.

### Q4: Why is transferFrom preferred over transfer in smart contract swaps?
\`transferFrom\` allows contracts to pull approved tokens from a user's wallet automatically during execution, ensuring atomic swaps.

### Q5: Can I change the metadata of an ERC-721 token after minting?
By default, metadata can be made mutable or immutable depending on how the contract's \`tokenURI\` function is written.
"""
}

# 9. Wallet Integration (wallet-integration)
articles["wallet-integration"] = {
    "title": "Wallet Integration: Connecting Frontends with Web3 Clients",
    "tagline": "Configure wallet providers, viem/wagmi helper hooks, and secure transaction sign routines.",
    "category": "Blockchain",
    "readTime": 12,
    "prerequisites": ["erc-tokens"],
    "related": ["crypto-faucets"],
    "practiceProblems": [],
    "markdown": """# Wallet Integration: Connecting Frontends with Web3 Clients

To build decentralized applications, developers must connect web frontends to active blockchain wallets. This integration allows users to approve transactions and sign payloads securely. This article covers injected wallet providers, library interfaces (ethers.js, viem), and connecting wallets using wagmi hooks.

---

## 1. Injected Wallet Providers & window.ethereum

Web wallets (like MetaMask or Phantom) inject a provider object directly into the browser's global window scope:
- **Provider Detection**: The frontend checks if `window.ethereum` is available.
- **JSON-RPC Communication**: The provider acts as a communication channel, routing JSON-RPC requests (like requesting account access or sending transactions) from the frontend to the wallet interface.

```javascript
// Requesting account access in raw JS
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
console.log("Connected account:", accounts[0]);
```

---

## 2. Web3 Client Libraries: viem & ethers.js

Directly calling JSON-RPC methods is complex. We simplify this using libraries like **ethers.js** or **viem**:
- **Providers & Signers**: Ethers.js defines a `Provider` to read blockchain data, and a `Signer` to write data and sign transactions.
- **Contract Mappings**: Libraries reconstruct on-chain smart contracts locally using their address and ABI, allowing developers to call functions like standard JavaScript methods:

```javascript
const balance = await tokenContract.balanceOf(userAddress);
```

---

## 3. React Integrations: wagmi & ConnectKit

For React applications, **wagmi** provides a set of hooks that manage wallet states, network changes, and contract interactions:
- **Hooks Ecosystem**: Access pre-built hooks like `useAccount`, `useConnect`, and `useWriteContract`.
- **UI Libraries**: Pair wagmi with libraries like RainbowKit or ConnectKit to add polished, customizable "Connect Wallet" modals instantly.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is window.ethereum?
It is the provider object injected into the browser window by wallets like MetaMask, serving as the communication channel to the blockchain.

### Q2: What is the difference between reading and writing data in web3 libraries?
Reading data (e.g. checking balances) is free and calls nodes directly. Writing data (e.g. sending transfers) requires user signature confirmation and costs gas.

### Q3: Why are wagmi hooks preferred in React setups?
They simplify state management, automatically tracking wallet connections, network shifts, and loading/error states in React components.

### Q4: How do I handle transaction rejection errors in my code?
Wrap wallet contract calls in try-catch blocks to detect user cancellation error codes (typically code \`4001\` for MetaMask user rejection).

### Q5: What does signing a message accomplish compared to signing a transaction?
Signing a message validates ownership of a private key offline without broadcasting to the network, avoiding gas fees.
"""
}

# 10. Crypto Faucets (crypto-faucets)
articles["crypto-faucets"] = {
    "title": "Crypto Faucets: Testnets, Devnets & Sandbox Tokens",
    "tagline": "Explore sandbox environments, testnet gas faucets, and Sybil protection mechanics.",
    "category": "Blockchain",
    "readTime": 10,
    "prerequisites": ["wallet-integration"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Crypto Faucets: Testnets, Devnets & Sandbox Tokens

Before deploying smart contracts to mainnet environments where transactions cost real currency, developers must test their applications in sandboxes. This testing requires testnet tokens. This article covers testnets and devnets, how crypto faucets distribute test tokens, and how faucets defend against abuse.

---

## 1. Sandbox Environments: Testnets & Devnets

Blockchains run parallel networks specifically for testing:
- **Testnets**: Globally distributed networks running identical code to the mainnet (e.g., Sepolia or Holesky for Ethereum). Testnet tokens have no real-world financial value.
- **Devnets**: Local or remote sandboxes used for rapid development (e.g. Solana Devnet).
- **Local Nodes**: Running a local blockchain simulation (like Hardhat Network or Anvil) on your machine, providing instant transaction times.

---

## 2. Crypto Faucets & Sandbox Tokens

A **Crypto Faucet** is a web service that distributes small amounts of testnet tokens (like Sepolia ETH) to developer addresses for free. These tokens are used to pay gas fees during testing.

```
[Developer Address] ──> [Request Faucet Web App] ──> [Faucet Contract Sends Test ETH]
```

---

## 3. Sybil Attacks & Faucet Mitigations

Because testnet tokens are scarce, faucets are vulnerable to **Sybil Attacks**:
- **The Exploit**: Bot scripts generate thousands of unique addresses to drain faucets, hoarding test tokens.
- **Mitigation Protocols**:
  - **Social Authentication**: Requiring users to log in with GitHub or Google accounts.
  - **Mainnet Balance Checks**: Verifying that request addresses hold a minimum balance on the mainnet (e.g., 0.001 ETH) to prove they are legitimate users, not spam bots.
  - **IP & Rate Limits**: Restricting requests to one per IP address every 24 hours.

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between mainnet and testnet tokens?
Mainnet tokens have real financial value. Testnet tokens have zero financial value and are used solely for testing in sandbox environments.

### Q2: Why are Sepolia and Holesky testnets important?
They are Ethereum's active testnets where developers deploy smart contracts to test integrations before launching on the mainnet.

### Q3: How do faucets prevent bots from hoarding test tokens?
By implementing rate limits, social logins (like GitHub), and verifying that requesting addresses hold a minimal mainnet balance.

### Q4: Can I buy testnet tokens with real money?
No. Testnet tokens should be obtained for free from faucets. Buying them is discouraged as they have no real economic value.

### Q5: What is the benefit of running a local node (like Anvil) over a public testnet?
A local node runs instantly on your machine with zero latency and infinite test tokens, making it ideal for rapid iteration and testing.
"""
}

# Now, we serialize this dictionary to scratch/bc_batch4.json
with open('scratch/bc_batch4.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/bc_batch4.json containing 10 articles!")
