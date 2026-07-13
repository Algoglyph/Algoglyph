# Agent Architecture Patterns

As the AI industry shifts from simple conversational chatbots (like ChatGPT) to autonomous systems that perform work, the term **"AI Agent"** has become ubiquitous. But what exactly is an agent?

An AI Agent is a system where an LLM is given access to external tools (APIs, databases, bash terminals) and an execution loop. Rather than just returning text to a user, the agent uses the LLM as a "reasoning engine" to decide which tools to execute to achieve a high-level goal.

Building these systems reliably requires rigorous architectural patterns.

---

## 1. The Core Agent Loop (ReAct)

The foundational architecture of an agent is the **ReAct (Reasoning + Acting) Loop**. In a standard LLM call, the flow is `Input -> Output`. In an agent, the flow is a continuous `While` loop that only terminates when the LLM explicitly returns a `Final Answer`.

### The State Machine
1. **Goal:** The user provides a high-level objective (e.g., "Find the cheapest flight to Tokyo next week").
2. **Thought:** The LLM reasons about the goal ("I need to know the dates for next week, then search flights").
3. **Action:** The LLM requests to execute a tool (e.g., `get_current_date()`).
4. **Observation:** The execution environment (your Python/Node server) executes the tool and injects the result back into the LLM's context window.
5. **Repeat:** The LLM reasons about the new data.

<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="250" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f43f5e" font-size="13" font-family="sans-serif" font-weight="bold">The Agentic ReAct Loop</text>

  <g transform="translate(60, 60)">
    {/* Goal */}
    <rect x="0" y="50" width="100" height="40" rx="4" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="50" y="74" fill="#3b82f6" font-size="10" text-anchor="middle" font-weight="bold">User Goal</text>

    <path d="M 100 70 L 170 70" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-flow)"/>

    {/* LLM Engine */}
    <rect x="180" y="30" width="120" height="80" rx="4" fill="#111" stroke="#a855f7" stroke-width="1.5"/>
    <text x="240" y="55" fill="#a855f7" font-size="10" text-anchor="middle" font-weight="bold">LLM (Reasoning)</text>
    <text x="240" y="75" fill="#9ca3af" font-size="8" text-anchor="middle">Analyzes Context</text>
    <text x="240" y="90" fill="#9ca3af" font-size="8" text-anchor="middle">Decides Next Action</text>

    {/* To Tool */}
    <path d="M 240 30 L 240 -10 L 370 -10" fill="none" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow-flow-yellow)"/>
    <text x="305" y="-15" fill="#f59e0b" font-size="8" text-anchor="middle">Tool Call Requested</text>

    {/* Tool Execution */}
    <rect x="380" y="-30" width="100" height="40" rx="4" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="430" y="-10" fill="#f59e0b" font-size="10" text-anchor="middle" font-weight="bold">Tool Execution</text>
    <text x="430" y="2" fill="#9ca3af" font-size="7" text-anchor="middle">API / DB / Bash</text>

    {/* Observation Return */}
    <path d="M 430 10 L 430 70 L 300 70" fill="none" stroke="#4ade80" stroke-width="1.5" marker-end="url(#arrow-flow-green)"/>
    <text x="365" y="65" fill="#4ade80" font-size="8" text-anchor="middle">Observation Result</text>

    {/* Final Answer */}
    <path d="M 240 110 L 240 150 L 370 150" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-flow-green2)"/>
    <rect x="380" y="130" width="100" height="40" rx="4" fill="#111" stroke="#10b981" stroke-width="2"/>
    <text x="430" y="154" fill="#10b981" font-size="10" text-anchor="middle" font-weight="bold">Final Answer</text>
  </g>

  <defs>
    <marker id="arrow-flow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" /></marker>
    <marker id="arrow-flow-yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>
    <marker id="arrow-flow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" /></marker>
    <marker id="arrow-flow-green2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" /></marker>
  </defs>
</svg>

### The Infinite Loop Problem
The greatest risk in building a ReAct agent is the infinite loop. If a tool returns an unexpected error (e.g., `404 Not Found`), the LLM might try to call the exact same tool again with the exact same arguments, endlessly burning through API tokens.

**Architectural Fixes:**
- **Max Iterations:** Hardcode a limit (e.g., `max_steps=10`) in the execution loop. If the agent hits step 10, force it to yield whatever answer it currently has.
- **Error Contextualization:** Instead of just returning `"Error 500"`, intercept the error in the execution environment and return `"Error 500. Do not retry this API. Try using the search tool instead."`

---

## 2. Multi-Agent Systems (Swarm Architecture)

A single agent given 50 tools and a complex goal will quickly hallucinate. The context window becomes flooded with irrelevant tool definitions and disparate observations.

To build reliable enterprise systems, architects use **Multi-Agent Systems**. Instead of one monolithic agent, you instantiate multiple specialized micro-agents, each with a narrow focus and a small set of tools.

### The Supervisor Pattern
In this pattern, a "Supervisor" or "Router" agent acts as the orchestrator. It does not execute tasks itself. Instead, it reads the user's goal, breaks it down into sub-tasks, and delegates them to worker agents.

```typescript
// Conceptual Multi-Agent Flow
const userRequest = "Analyze Q3 revenue and write a marketing blog about it.";

// 1. Supervisor reads request and delegates
const dataAgent = new Agent({ role: "Data Analyst", tools: [sqlTool, chartTool] });
const writerAgent = new Agent({ role: "Copywriter", tools: [markdownTool] });

// 2. Data Agent executes
const analysis = await dataAgent.execute("Get Q3 revenue from DB and summarize.");

// 3. Writer Agent executes using the output from the Data Agent
const blogPost = await writerAgent.execute(`Write a blog based on this data: ${analysis}`);
```

This pattern drastically reduces hallucinations. The Data Analyst agent only sees SQL tools and database schemas. The Copywriter agent only sees writing tools and stylistic guidelines.

---

## 3. Plan-and-Solve Architecture

While ReAct agents figure out what to do step-by-step, **Plan-and-Solve** agents create a comprehensive plan *before* executing any tools.

This architecture is modeled after human cognition (System 2 thinking).

1. **Planner Agent:** Receives the goal and outputs a strict JSON array of ordered tasks.
2. **Executor Agent:** Takes the first task from the plan, executes it, and records the result.
3. **Reviewer Agent:** Looks at the result of the task and determines if the next step in the plan needs to be dynamically adjusted.

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#14b8a6" font-size="13" font-family="sans-serif" font-weight="bold">Plan-and-Solve Workflow</text>

  <g transform="translate(40, 70)">
    {/* Goal */}
    <circle cx="20" cy="50" r="20" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="20" y="53" fill="#3b82f6" font-size="8" text-anchor="middle">Goal</text>

    <path d="M 45 50 L 80 50" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-flow)"/>

    {/* Planner */}
    <rect x="90" y="20" width="100" height="60" rx="4" fill="#111" stroke="#a855f7" stroke-width="1.5"/>
    <text x="140" y="45" fill="#a855f7" font-size="10" text-anchor="middle" font-weight="bold">Planner</text>
    <text x="140" y="60" fill="#9ca3af" font-size="7" text-anchor="middle">Generates Task List</text>

    {/* Task List */}
    <path d="M 195 50 L 230 50" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-flow)"/>
    <rect x="240" y="0" width="80" height="100" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 2"/>
    <text x="280" y="20" fill="#f59e0b" font-size="9" text-anchor="middle" font-weight="bold">Plan</text>
    <rect x="250" y="30" width="60" height="15" fill="#f59e0b" fill-opacity="0.2"/>
    <text x="280" y="41" fill="#f59e0b" font-size="7" text-anchor="middle">1. Fetch Data</text>
    <rect x="250" y="50" width="60" height="15" fill="#f59e0b" fill-opacity="0.2"/>
    <text x="280" y="61" fill="#f59e0b" font-size="7" text-anchor="middle">2. Clean Data</text>
    <rect x="250" y="70" width="60" height="15" fill="#f59e0b" fill-opacity="0.2"/>
    <text x="280" y="81" fill="#f59e0b" font-size="7" text-anchor="middle">3. Upload</text>

    {/* Executor */}
    <path d="M 330 50 L 370 50" stroke="#71717a" stroke-width="1.5" marker-end="url(#arrow-flow)"/>
    <rect x="380" y="20" width="100" height="60" rx="4" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="430" y="45" fill="#10b981" font-size="10" text-anchor="middle" font-weight="bold">Executor</text>
    <text x="430" y="60" fill="#9ca3af" font-size="7" text-anchor="middle">Runs Step 1</text>

    {/* Loop back */}
    <path d="M 430 85 L 430 130 L 280 130 L 280 105" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-flow-yellow)"/>
    <text x="355" y="145" fill="#a1a1aa" font-size="8" text-anchor="middle">Mark done, proceed to Step 2</text>
  </g>
</svg>

Plan-and-Solve is superior for long-running workflows (e.g., writing a 50-page ebook or scaffolding a full React application) because the agent has a persistent roadmap. If it gets confused on Step 14, it can reference the original plan to regain its bearings.

---

## 4. RAG Agents (Retrieval-Augmented Generation)

A standard RAG pipeline (embed query $\rightarrow$ fetch vectors $\rightarrow$ pass to LLM) is static. It fails if the user asks a multi-hop question like: *"How does Q3 revenue compare to Q1 revenue?"* A single vector search usually fails to retrieve both distinct documents simultaneously.

A **RAG Agent** solves this by treating the vector database as a *tool* rather than a prerequisite.

1. **User:** "Compare Q3 and Q1 revenue."
2. **Agent Thought:** I need to find Q1 first.
3. **Action:** `search_database("Q1 revenue report")`
4. **Observation:** "Q1 revenue was $1.2M."
5. **Agent Thought:** Now I need to find Q3.
6. **Action:** `search_database("Q3 revenue report")`
7. **Observation:** "Q3 revenue was $1.5M."
8. **Final Answer:** "Q3 revenue grew by $300k compared to Q1."

By giving the agent control over the search query, it can dynamically reformulate its searches, execute multiple queries sequentially, and perform complex semantic joins across disparate datasets.

---

## 5. Memory Architectures

Agents are stateless by default. If you start a new conversation, the agent forgets everything. To build persistent, personalized agents, you must implement memory.

### 1. Short-Term Memory (Context Window)
This is simply passing the last 10 messages back into the API call. As the context window grows (e.g., 100K tokens), short-term memory can hold entire books. However, passing 100K tokens on every request is extremely slow and expensive.

### 2. Long-Term Memory (Vector DB / Graph DB)
Agents use tools like `save_to_memory(key, value)` and `recall_from_memory(query)` to persistently store facts about the user. 
When the user says "My dog's name is Rex," the agent explicitly executes `save_to_memory("user_dog_name", "Rex")`. 

In future sessions, the agent's initialization sequence might include a step where it searches the vector database for relevant facts about the user before responding.

### 3. Entity-Memory (Knowledge Graphs)
Advanced agents use Graph Databases (like Neo4j) to build entity relationships. Instead of storing text chunks, the agent builds nodes: `(User) -[OWNS]-> (Dog: Rex)`. This allows the agent to traverse relationships logically, enabling highly complex reasoning over long periods of time.

---

## 6. The Execution Sandbox (Security)

Agents execute code. If you give an agent a Bash terminal tool to "fix my git repo", it might hallucinate and run `rm -rf /`. 

Production agent architectures demand strict execution sandboxing:
- **Docker Containers:** Agents execute tools inside ephemeral, isolated Docker containers.
- **WASM (WebAssembly):** Tools are executed in secure WASM runtimes (like Wasmtime or Wasmer) which strictly limit file system and network access.
- **Human-in-the-Loop (HITL):** For high-risk actions (e.g., executing a database migration, sending an email to a client, or transferring funds), the agent pauses execution and requests explicit human approval via a UI prompt before proceeding.

Agent architecture is not about building a smarter AI; it is about building robust software guardrails that constrain and harness the AI's probabilistic nature into deterministic workflows.
