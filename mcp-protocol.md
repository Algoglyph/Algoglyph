# Model Context Protocol (MCP): The Universal Language for AI-Tool Integration

## Introduction: The Interoperability Problem in AI

Imagine you're building an AI assistant. You want it to search the web, query a database, run code, and call a REST API. Without a standard, you'd write four completely different integration layers — one for each tool. Now multiply that by dozens of tools and dozens of AI models from different providers. The combinatorial explosion of bespoke connectors becomes unmaintainable.

**Model Context Protocol (MCP)** solves this. It is an open standard, introduced by Anthropic in November 2024, that defines a universal communication protocol between AI applications (hosts) and the tools/data sources they use (servers). Think of it as the **USB standard for AI integrations** — a single plug format that works everywhere.

```svg
<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <defs>
    <linearGradient id="hostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="serverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="protocolGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#00000030"/>
    </filter>
  </defs>
  <rect width="900" height="420" fill="#0f172a" rx="16"/>
  <text x="450" y="38" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">Model Context Protocol — Architecture</text>

  <!-- Host Box -->
  <rect x="40" y="70" width="220" height="300" rx="12" fill="url(#hostGrad)" filter="url(#shadow)"/>
  <text x="150" y="100" text-anchor="middle" fill="white" font-size="14" font-weight="700">MCP HOST</text>
  <text x="150" y="118" text-anchor="middle" fill="#c7d2fe" font-size="11">(Claude Desktop / IDE)</text>
  <rect x="60" y="135" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="150" y="158" text-anchor="middle" fill="white" font-size="11">AI Model (LLM)</text>
  <rect x="60" y="183" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="150" y="206" text-anchor="middle" fill="white" font-size="11">MCP Client Library</text>
  <rect x="60" y="231" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="150" y="254" text-anchor="middle" fill="white" font-size="11">User Interface</text>
  <rect x="60" y="279" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="150" y="302" text-anchor="middle" fill="white" font-size="11">Session Manager</text>

  <!-- Protocol Channel -->
  <rect x="290" y="155" width="320" height="110" rx="12" fill="url(#protocolGrad)" opacity="0.9" filter="url(#shadow)"/>
  <text x="450" y="188" text-anchor="middle" fill="white" font-size="13" font-weight="700">MCP Protocol Layer</text>
  <text x="450" y="210" text-anchor="middle" fill="#fff8e1" font-size="10">JSON-RPC 2.0 over stdio / HTTP+SSE</text>
  <text x="450" y="228" text-anchor="middle" fill="#fff8e1" font-size="10">initialize · list_tools · call_tool</text>
  <text x="450" y="246" text-anchor="middle" fill="#fff8e1" font-size="10">list_resources · read_resource · ping</text>

  <!-- Arrows -->
  <line x1="260" y1="210" x2="290" y2="210" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr)"/>
  <line x1="610" y1="210" x2="640" y2="210" stroke="#f59e0b" stroke-width="3" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <!-- Server Box -->
  <rect x="640" y="70" width="220" height="300" rx="12" fill="url(#serverGrad)" filter="url(#shadow)"/>
  <text x="750" y="100" text-anchor="middle" fill="white" font-size="14" font-weight="700">MCP SERVER</text>
  <text x="750" y="118" text-anchor="middle" fill="#a7f3d0" font-size="11">(Tool / Data Provider)</text>
  <rect x="660" y="135" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="750" y="158" text-anchor="middle" fill="white" font-size="11">🔧 Tools (actions)</text>
  <rect x="660" y="183" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="750" y="206" text-anchor="middle" fill="white" font-size="11">📄 Resources (data)</text>
  <rect x="660" y="231" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="750" y="254" text-anchor="middle" fill="white" font-size="11">📝 Prompts (templates)</text>
  <rect x="660" y="279" width="180" height="36" rx="8" fill="#ffffff20"/>
  <text x="750" y="302" text-anchor="middle" fill="white" font-size="11">🔔 Sampling (LLM calls)</text>

  <text x="450" y="400" text-anchor="middle" fill="#64748b" font-size="11">One protocol · Any AI model · Any tool or data source</text>
</svg>
```

---

## Core Concepts: The Building Blocks of MCP

### 1. Hosts, Clients, and Servers

MCP uses a **three-role architecture**:

| Role | Description | Example |
|------|-------------|---------|
| **Host** | The AI application that the end user interacts with. Manages multiple MCP client connections. | Claude Desktop, Cursor IDE, a custom chatbot |
| **Client** | A component inside the host that maintains a 1:1 connection with one MCP server. Handles protocol negotiation. | The MCP client library embedded in Claude Desktop |
| **Server** | A lightweight process exposing tools, resources, or prompts via MCP. Can be local or remote. | A Postgres MCP server, a GitHub MCP server |

This separation of concerns is crucial. The host (e.g., Claude Desktop) doesn't need to know *how* to query Postgres — it just asks its MCP client to call the `query` tool on the Postgres MCP server, and the server handles the rest.

### 2. Transport Mechanisms

MCP is transport-agnostic at the application level but currently defines two primary transports:

**stdio Transport (Local servers)**
```
Host Process → spawns → Server Process
              ↕ stdin / stdout (JSON-RPC messages)
```
The host spawns the server as a subprocess and communicates over its standard input/output. Perfect for local tools like file system access, shell command execution, or local database queries.

**HTTP + SSE Transport (Remote servers)**
```
Client ──POST──▶ /message  (sends requests/responses)
Client ◀──SSE── /sse       (receives server-initiated events)
```
For remote servers accessible over the network. Server-Sent Events (SSE) allow the server to push notifications back to the client (e.g., streaming progress updates). A WebSocket-based transport is also under development.

---

## The MCP Message Format: JSON-RPC 2.0

All MCP communication uses **JSON-RPC 2.0**, a lightweight remote procedure call protocol encoded in JSON. Every message is one of three types:

### Request (Client → Server)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "/home/user/document.txt"
    }
  }
}
```

### Response (Server → Client)
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Hello, this is the file content!"
      }
    ]
  }
}
```

### Notification (Either direction, no response expected)
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "abc123",
    "progress": 50,
    "total": 100
  }
}
```

---

## The Three Primitives: Tools, Resources, and Prompts

```svg
<svg viewBox="0 0 900 340" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <rect width="900" height="340" fill="#0f172a" rx="16"/>
  <text x="450" y="38" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">MCP Server Primitives</text>
  <!-- Tools -->
  <rect x="40" y="65" width="250" height="245" rx="12" fill="#1e293b" stroke="#4f46e5" stroke-width="2"/>
  <rect x="40" y="65" width="250" height="44" rx="12" fill="#4f46e5"/>
  <text x="165" y="93" text-anchor="middle" fill="white" font-size="14" font-weight="700">🔧 Tools</text>
  <text x="165" y="130" text-anchor="middle" fill="#94a3b8" font-size="11">Model-controlled actions</text>
  <text x="165" y="150" text-anchor="middle" fill="#94a3b8" font-size="11">that change state or</text>
  <text x="165" y="170" text-anchor="middle" fill="#94a3b8" font-size="11">produce side effects.</text>
  <rect x="60" y="185" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="165" y="204" text-anchor="middle" fill="#a5b4fc" font-size="10">• read_file(path)</text>
  <rect x="60" y="220" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="165" y="239" text-anchor="middle" fill="#a5b4fc" font-size="10">• execute_sql(query)</text>
  <rect x="60" y="255" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="165" y="274" text-anchor="middle" fill="#a5b4fc" font-size="10">• send_email(to, body)</text>
  <!-- Resources -->
  <rect x="325" y="65" width="250" height="245" rx="12" fill="#1e293b" stroke="#059669" stroke-width="2"/>
  <rect x="325" y="65" width="250" height="44" rx="12" fill="#059669"/>
  <text x="450" y="93" text-anchor="middle" fill="white" font-size="14" font-weight="700">📄 Resources</text>
  <text x="450" y="130" text-anchor="middle" fill="#94a3b8" font-size="11">Application-controlled data</text>
  <text x="450" y="150" text-anchor="middle" fill="#94a3b8" font-size="11">that the AI can read to</text>
  <text x="450" y="170" text-anchor="middle" fill="#94a3b8" font-size="11">build its context.</text>
  <rect x="345" y="185" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="450" y="204" text-anchor="middle" fill="#6ee7b7" font-size="10">• file:///project/README.md</text>
  <rect x="345" y="220" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="450" y="239" text-anchor="middle" fill="#6ee7b7" font-size="10">• db://table/schema</text>
  <rect x="345" y="255" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="450" y="274" text-anchor="middle" fill="#6ee7b7" font-size="10">• screen://current-view</text>
  <!-- Prompts -->
  <rect x="610" y="65" width="250" height="245" rx="12" fill="#1e293b" stroke="#d97706" stroke-width="2"/>
  <rect x="610" y="65" width="250" height="44" rx="12" fill="#d97706"/>
  <text x="735" y="93" text-anchor="middle" fill="white" font-size="14" font-weight="700">📝 Prompts</text>
  <text x="735" y="130" text-anchor="middle" fill="#94a3b8" font-size="11">User-controlled reusable</text>
  <text x="735" y="150" text-anchor="middle" fill="#94a3b8" font-size="11">templates that guide LLM</text>
  <text x="735" y="170" text-anchor="middle" fill="#94a3b8" font-size="11">interactions.</text>
  <rect x="630" y="185" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="735" y="204" text-anchor="middle" fill="#fcd34d" font-size="10">• code_review(language)</text>
  <rect x="630" y="220" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="735" y="239" text-anchor="middle" fill="#fcd34d" font-size="10">• summarize_doc(style)</text>
  <rect x="630" y="255" width="210" height="28" rx="6" fill="#0f172a"/>
  <text x="735" y="274" text-anchor="middle" fill="#fcd34d" font-size="10">• debug_error(language)</text>
  <text x="450" y="325" text-anchor="middle" fill="#64748b" font-size="11">Tools = LLM decides to invoke · Resources = App decides to include · Prompts = User decides to trigger</text>
</svg>
```

### Tools: The Action Layer

Tools are the most powerful MCP primitive. They are **executable functions** that the AI model can invoke. The LLM decides *when* and *how* to call them based on the conversation context.

```typescript
// Defining a tool in an MCP server (TypeScript SDK)
server.tool(
  "search_web",
  "Search the internet for up-to-date information on a given query.",
  {
    query: z.string().describe("The search query string"),
    num_results: z.number().default(5).describe("Number of results to return")
  },
  async ({ query, num_results }) => {
    const results = await performWebSearch(query, num_results);
    return {
      content: [
        {
          type: "text",
          text: results.map(r => `**${r.title}**\n${r.url}\n${r.snippet}`).join("\n\n")
        }
      ]
    };
  }
);
```

The model receives the tool's `name`, `description`, and JSON Schema for its parameters. It then makes a **tool call decision** during inference, outputting a structured request. The host intercepts this, routes it to the correct MCP server, and feeds the result back to the model.

### Resources: The Data Layer

Resources expose **data** that can be read into the model's context. Unlike tools, resources are passive — the host/user decides which resources to include, not the model.

```typescript
// Exposing a dynamic resource
server.resource(
  "database-schema",
  "db://postgres/schema",
  async (uri) => {
    const schema = await getPostgresSchema();
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(schema, null, 2)
      }]
    };
  }
);
```

Resources use **URI templates** for dynamic access. A file server might expose `file:///path/{+filepath}` to serve any file under a given directory.

### Prompts: The Template Layer

Prompts are **pre-defined message templates** with optional parameters. They allow server operators to craft specialized interaction patterns. For example, a Git MCP server might expose a `generate_commit_message` prompt that automatically reads the current diff and produces a well-formatted commit message.

```typescript
server.prompt(
  "code-review",
  "Generate a thorough code review for a given file.",
  [{ name: "language", description: "Programming language", required: true }],
  async ({ language }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please provide a detailed code review for the following ${language} code, focusing on correctness, performance, readability, and security...`
        }
      }
    ]
  })
);
```

---

## The Connection Lifecycle

```svg
<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <rect width="900" height="300" fill="#0f172a" rx="16"/>
  <text x="450" y="32" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="700">MCP Connection Lifecycle</text>
  <!-- Timeline -->
  <line x1="60" y1="150" x2="840" y2="150" stroke="#334155" stroke-width="2"/>
  <!-- Steps -->
  <circle cx="130" cy="150" r="22" fill="#4f46e5"/>
  <text x="130" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">1</text>
  <text x="130" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Connect</text>
  <text x="130" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(spawn/HTTP)</text>
  <line x1="152" y1="150" x2="218" y2="150" stroke="#4f46e5" stroke-width="2" stroke-dasharray="4,2"/>
  <circle cx="240" cy="150" r="22" fill="#7c3aed"/>
  <text x="240" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">2</text>
  <text x="240" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Initialize</text>
  <text x="240" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(version neg.)</text>
  <line x1="262" y1="150" x2="328" y2="150" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,2"/>
  <circle cx="350" cy="150" r="22" fill="#0891b2"/>
  <text x="350" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">3</text>
  <text x="350" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Discover</text>
  <text x="350" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(list tools/res)</text>
  <line x1="372" y1="150" x2="448" y2="150" stroke="#0891b2" stroke-width="2" stroke-dasharray="4,2"/>
  <circle cx="470" cy="150" r="22" fill="#059669"/>
  <text x="470" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">4</text>
  <text x="470" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Operate</text>
  <text x="470" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(call tools)</text>
  <line x1="492" y1="150" x2="558" y2="150" stroke="#059669" stroke-width="2" stroke-dasharray="4,2"/>
  <circle cx="580" cy="150" r="22" fill="#d97706"/>
  <text x="580" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">5</text>
  <text x="580" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Notify</text>
  <text x="580" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(progress/logs)</text>
  <line x1="602" y1="150" x2="668" y2="150" stroke="#d97706" stroke-width="2" stroke-dasharray="4,2"/>
  <circle cx="690" cy="150" r="22" fill="#dc2626"/>
  <text x="690" y="155" text-anchor="middle" fill="white" font-size="11" font-weight="700">6</text>
  <text x="690" y="195" text-anchor="middle" fill="#94a3b8" font-size="10">Terminate</text>
  <text x="690" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">(close session)</text>
  <!-- Label boxes above timeline -->
  <rect x="60" y="60" width="150" height="60" rx="8" fill="#1e293b"/>
  <text x="135" y="82" text-anchor="middle" fill="#a5b4fc" font-size="10">CLIENT → SERVER</text>
  <text x="135" y="98" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600">initialize {</text>
  <text x="135" y="113" text-anchor="middle" fill="#e2e8f0" font-size="10">  protocolVersion</text>
  <rect x="600" y="60" width="150" height="60" rx="8" fill="#1e293b"/>
  <text x="675" y="82" text-anchor="middle" fill="#fca5a5" font-size="10">CLIENT → SERVER</text>
  <text x="675" y="98" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="600">{"method":"shutdown"}</text>
  <text x="450" y="270" text-anchor="middle" fill="#64748b" font-size="11">Sessions are persistent — one connection supports many tool calls</text>
</svg>
```

**Step 1 — Connect:** The host starts the server process (stdio) or opens an HTTP/SSE connection (remote).

**Step 2 — Initialize:** Client sends `initialize` with its protocol version and capabilities. Server responds with its version and supported features. Client sends `initialized` notification to complete the handshake.

**Step 3 — Discover:** Client calls `tools/list`, `resources/list`, and `prompts/list` to enumerate available capabilities. The server returns schema definitions for all exposed primitives.

**Step 4 — Operate:** The core operational loop. The LLM decides to call tools, the client routes the calls, the server executes them, and results flow back.

**Step 5 — Notifications:** Throughout the session, either side can send asynchronous notifications — progress updates, log messages, resource change alerts.

**Step 6 — Terminate:** The host sends a shutdown signal, the server cleans up resources, and the connection closes.

---

## Building Your First MCP Server

Here's a complete, functional MCP server in TypeScript that exposes a weather-fetching tool:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Create the server instance
const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// 2. Define the tool
server.tool(
  "get_current_weather",
  "Fetches the current weather for a given city.",
  {
    city: z.string().describe("The name of the city"),
    units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  },
  async ({ city, units }) => {
    // In a real server, you'd call a weather API here
    const tempUnit = units === "celsius" ? "°C" : "°F";
    const mockTemp = units === "celsius" ? 22 : 71;
    
    return {
      content: [
        {
          type: "text",
          text: `Current weather in ${city}: ${mockTemp}${tempUnit}, Partly Cloudy, Humidity: 65%`,
        },
      ],
    };
  }
);

// 3. Connect to stdio transport and start
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Weather MCP Server running on stdio");
```

**Package and configure:**
```json
// package.json
{
  "name": "weather-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": { "weather-server": "./build/index.js" },
  "scripts": { "build": "tsc" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  }
}
```

**Register in Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"]
    }
  }
}
```

---

## Security Model and Best Practices

MCP introduces significant security considerations because it grants AI models the ability to interact with external systems:

### 1. User Consent and Authorization
Every tool invocation that could have side effects (writing files, sending emails, making purchases) should require **explicit user confirmation** before execution. MCP hosts are responsible for implementing approval flows.

```typescript
// Host-side approval flow (pseudocode)
async function handleToolCall(toolName: string, args: object) {
  if (isDestructiveAction(toolName)) {
    const approved = await showConfirmationDialog(
      `Allow AI to ${toolName} with args: ${JSON.stringify(args)}?`
    );
    if (!approved) return { error: "User denied tool execution" };
  }
  return await mcpClient.callTool(toolName, args);
}
```

### 2. Principle of Least Privilege
MCP servers should only expose the minimum set of capabilities needed. A read-only research assistant should not have a server with write-access tools.

### 3. Input Validation
Always validate and sanitize inputs in your MCP server, even though the client sends structured JSON. Validate paths to prevent directory traversal, parameterize SQL to prevent injection, and validate URIs to prevent SSRF.

```typescript
server.tool("read_file", "Read a file's contents", {
  path: z.string().refine(
    (p) => p.startsWith("/safe/base/directory/"),
    "Path must be within the allowed directory"
  )
}, async ({ path }) => { /* ... */ });
```

### 4. Transport Security
For HTTP-based servers, always use HTTPS with valid TLS certificates. For local stdio servers, process isolation provides inherent security.

---

## The MCP Ecosystem: Real-World Servers

The MCP ecosystem has grown rapidly since launch. Here are key servers across different domains:

| Category | Server | What It Does |
|----------|--------|-------------|
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | Read/write/search local files |
| **Database** | `@modelcontextprotocol/server-postgres` | Query PostgreSQL databases |
| **Browser** | `@modelcontextprotocol/server-puppeteer` | Control a headless browser |
| **Version Control** | `@modelcontextprotocol/server-github` | GitHub issues, PRs, code search |
| **Search** | `@modelcontextprotocol/server-brave-search` | Web search via Brave API |
| **Memory** | `@modelcontextprotocol/server-memory` | Persistent knowledge graph |
| **Communication** | `@modelcontextprotocol/server-slack` | Send Slack messages, read channels |
| **Monitoring** | `@modelcontextprotocol/server-sentry` | Fetch and analyze error reports |
| **Cloud** | `@aws-sdk/mcp-server` | Interact with AWS services |

---

## MCP vs. Traditional Function Calling

Before MCP, AI function calling existed but without standardization:

| Aspect | Traditional Function Calling | MCP |
|--------|------------------------------|-----|
| **Schema format** | Provider-specific JSON | Standardized across all providers |
| **Discovery** | Hardcoded in application | Dynamic via `list_tools` |
| **Transport** | Direct API call | Protocol-abstracted (stdio/HTTP) |
| **Stateful sessions** | No | Yes — persistent connections |
| **Resources** | Not supported | First-class primitive |
| **Multi-server** | N/A | Native support |
| **Reusability** | Per-application | Universal across any MCP host |

The key insight is that MCP separates **tool definition** (the server's job) from **tool invocation** (the LLM's job) from **tool routing** (the host's job). Each party does what it's best at.

---

## Summary

Model Context Protocol is the foundational infrastructure for building scalable, interoperable AI applications. By standardizing how AI models discover and interact with tools, data, and prompts:

- **Developers** write one server that works with any MCP-compatible AI
- **Organizations** maintain centralized, auditable tool repositories
- **Users** benefit from consistently safe, consent-driven AI interactions
- **The ecosystem** grows through composability — combine any MCP servers to create powerful agentic workflows

MCP is not just a protocol — it's the emergence of a **universal API layer** for the age of AI agents.
