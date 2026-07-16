# AI Structured Outputs & Function Calling

Historically, interacting with Large Language Models meant passing in a string of text and receiving a string of text back. While this works beautifully for chatting with a human, it is notoriously unreliable for interacting with a software system.

If you ask an LLM to "Extract the names and ages of the users from this text," it might respond with:
> "Sure! Here are the users I found: 
> 1. John (25) 
> 2. Mary (30)
> Let me know if you need anything else!"

A human understands this perfectly. A JSON parser `JSON.parse()` crashes immediately.

To bridge the gap between deterministic software architectures and probabilistic language models, the industry developed **Structured Outputs** and **Function Calling**.

---

## 1. The Challenge of Parsing Free-Text

Before native structured outputs existed, developers used aggressive prompt engineering to coerce the model into outputting valid JSON.

### The "JSON Coercion" Era (circa 2022)
Developers would append long, threatening system prompts to their API calls:
```text
SYSTEM: You are a data extraction bot. 
You MUST output ONLY valid JSON.
Do not output markdown. Do not say "Here is your JSON".
Your output must exactly match this schema:
{ "users": [ { "name": string, "age": number } ] }
If you output anything other than JSON, the system will crash.
```

Even with these prompts, models would occasionally fail. They might omit a required bracket, include a trailing comma (which is invalid in strict JSON), or wrap the JSON in ` ```json ` markdown blocks, breaking automated parsers downstream.

Building reliable applications required writing complex Regex fallback parsers to try and salvage malformed JSON strings from the model.

---

## 2. Native Function Calling (Tool Use)

In 2023, OpenAI introduced **Function Calling** (now widely adopted by Anthropic, Google, and open-source models). Instead of relying on prompt engineering, the model was explicitly fine-tuned on JSON Schema and API signatures.

When making an API request, developers pass an array of `tools` alongside the `messages`.

### Define the Schema
```javascript
const tools = [
  {
    type: "function",
    function: {
      name: "extract_users",
      description: "Extracts user data from a document",
      parameters: {
        type: "object",
        properties: {
          users: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                age: { type: "number" }
              },
              required: ["name", "age"]
            }
          }
        },
        required: ["users"]
      }
    }
  }
];
```

When the model processes the user's prompt, it determines if it should output raw text, or if it should invoke the `extract_users` tool.

If it chooses to invoke the tool, the API response does not contain a conversational message. Instead, it returns a `tool_calls` object containing the name of the function and a perfectly formatted JSON string of arguments matching the requested schema.

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Function Calling Execution Flow</text>

  <g transform="translate(40, 60)">
    {/* Client Request */}
    <rect x="0" y="0" width="140" height="70" rx="4" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="70" y="25" fill="#3b82f6" font-size="10" text-anchor="middle" font-weight="bold">Client Application</text>
    <text x="70" y="40" fill="#9ca3af" font-size="8" text-anchor="middle" font-family="monospace">Prompt: "Buy 10 AAPL"</text>
    <text x="70" y="55" fill="#9ca3af" font-size="8" text-anchor="middle" font-family="monospace">Tools: [buy_stock]</text>

    {/* Arrow to LLM */}
    <path d="M 140 35 L 230 35" stroke="#71717a" stroke-width="2" marker-end="url(#arrow-flow-sc)"/>
    <text x="185" y="25" fill="#71717a" font-size="8" text-anchor="middle" font-family="monospace">HTTP POST</text>

    {/* LLM Engine */}
    <rect x="240" y="0" width="100" height="70" rx="4" fill="#111" stroke="#a855f7" stroke-width="1.5"/>
    <text x="290" y="25" fill="#a855f7" font-size="10" text-anchor="middle" font-weight="bold">LLM Engine</text>
    <text x="290" y="45" fill="#9ca3af" font-size="8" text-anchor="middle">Selects tool</text>
    <text x="290" y="55" fill="#9ca3af" font-size="8" text-anchor="middle">Generates JSON</text>

    {/* Arrow back to Client */}
    <path d="M 240 60 L 150 60" stroke="#4ade80" stroke-width="2" marker-end="url(#arrow-flow-green-sc)"/>
    <text x="195" y="75" fill="#4ade80" font-size="8" text-anchor="middle" font-family="monospace">tool_calls payload</text>

    {/* Client Execution */}
    <rect x="0" y="120" width="140" height="70" rx="4" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="145" fill="#f59e0b" font-size="10" text-anchor="middle" font-weight="bold">Local Execution</text>
    <text x="70" y="160" fill="#9ca3af" font-size="8" text-anchor="middle" font-family="monospace">executeBuy('AAPL', 10)</text>
    <text x="70" y="175" fill="#9ca3af" font-size="8" text-anchor="middle" font-family="monospace">Returns success: true</text>
    
    <path d="M 70 70 L 70 110" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-flow-yellow)"/>

    {/* Send Results Back to LLM */}
    <path d="M 140 155 L 290 155 L 290 80" fill="none" stroke="#71717a" stroke-width="1.5" stroke-dasharray="3 2" marker-end="url(#arrow-flow-sc)"/>
    <text x="250" y="145" fill="#71717a" font-size="9" text-anchor="middle" font-family="monospace">Pass result back to LLM to summarize</text>
  </g>

  <defs>
    <marker id="arrow-flow-sc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
    <marker id="arrow-flow-green-sc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
    </marker>
    <marker id="arrow-flow-yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
    </marker>
  </defs>
</svg>

---

## 3. Strict Structured Outputs (Constrained Decoding)

While Function Calling relies on the model being "smart enough" to follow the schema via fine-tuning, **Constrained Decoding** takes structured outputs a step further. It enforces the schema at the foundational inference level.

When an LLM generates a token, it calculates a probability distribution over the entire vocabulary (e.g., 100,000 possible words). 

With Constrained Decoding (often referred to as Strict Structured Outputs), the inference engine converts your JSON Schema into a **Finite State Machine (FSM)** or a Context-Free Grammar. During token generation, the engine masks out any tokens that would violate the schema.

### How Constrained Decoding Works
Imagine the model is generating a JSON object:
`{"name": "`

At this point, the schema requires a string to close the quote.
If the model wants to output `{"name": "John", ...` but hallucinates and tries to output `{"name": "John" }` immediately, violating the fact that the schema requires the `age` property next, the Constrained Decoding engine sets the probability of the `}` token to **0.0**. 

The model is physically blocked from generating invalid JSON syntax or missing required keys. This guarantees 100% adherence to the JSON schema, completely eliminating the need for validation loops or Regex fallback parsers.

---

## 4. Building Typed API Clients (Zod & Pydantic)

To utilize Structured Outputs effectively in production, developers wrap LLM calls in type-safe validators like **Zod** (TypeScript) or **Pydantic** (Python).

Instead of manually writing verbose JSON schemas, you define a native object class. Frameworks like `ai-sdk` (Vercel) or `instructor` automatically serialize these classes into JSON Schemas, pass them to the LLM, and parse the response back into a strictly typed object.

### Example: Vercel AI SDK with Zod
```typescript
import { generateObject } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

// 1. Define the schema using Zod
const RecipeSchema = z.object({
  title: z.string(),
  prepTimeMinutes: z.number().max(60),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string()
  })),
  dietaryTags: z.array(z.enum(["Vegan", "Gluten-Free", "Keto"])).optional()
});

async function getRecipe(query) {
  // 2. Call the LLM with the schema
  const { object } = await generateObject({
    model: openai('gpt-4o-2024-08-06'),
    schema: RecipeSchema,
    prompt: `Generate a recipe for ${query}.`
  });

  // 3. 'object' is perfectly typed!
  console.log(object.title);
  return object;
}
```

This pattern is revolutionary. It turns the LLM from a fuzzy, unpredictable text generator into a deterministic API endpoint that returns perfectly typed data structures.

---

## 5. Architectural Paradigms: Agents vs. Classifiers

Structured outputs unlock two primary architectural patterns:

### 1. The LLM as a Classifier (Routing)
In complex systems, a user prompt often needs to be routed to specialized subsystems. An LLM configured with a strict `CategoryEnum` output can act as an intelligent router.
```json
{
  "category": "BILLING_SUPPORT",
  "confidence": 0.95
}
```
The software reads `BILLING_SUPPORT` and deterministicly routes the user to the Stripe billing portal, bypassing further AI processing.

### 2. The LLM as an Agent (ReAct Loop)
When equipped with tools, an LLM becomes an autonomous agent. The **ReAct** (Reasoning + Acting) loop works by repeatedly querying the LLM:
1. User: "Analyze my database for slow queries."
2. Agent tool call: `run_sql("SELECT * FROM pg_stat_activity")`
3. Software executes SQL and passes results back to Agent.
4. Agent tool call: `search_docs("Postgres index optimization")`
5. Software fetches docs.
6. Agent outputs final human-readable summary.

By leveraging Structured Outputs and Function Calling, AI transitions from a novelty chatbot into a programmable, deterministic core component of modern software architecture.

---

## 6. Real-World Constraints and Tradeoffs

While Structured Outputs are incredibly powerful, they come with certain tradeoffs that engineers must account for.

### 1. Increased Latency
When Constrained Decoding is enabled, the inference engine must continuously update the Finite State Machine based on the schema and the previously generated tokens. For very complex, deeply nested JSON schemas (e.g., recursive trees or schemas with hundreds of optional properties), this parsing overhead can introduce noticeable latency to the Time To First Token (TTFT).

### 2. Context Window Consumption
Passing a large JSON Schema to the LLM consumes tokens. If your schema is 2,000 tokens and you pass it with every API call, you are paying for those tokens on every request. This is why techniques like **Prompt Caching** (recently introduced by Anthropic and OpenAI) are critical when building heavily structured systems. The schema is cached at the edge, reducing the per-request token cost by up to 90%.

### 3. Hallucinated Properties
Even with strict schema enforcement, if a property is marked as optional, the LLM might hallucinate the presence of that property if the prompt is ambiguous. 

For example, if you ask for user details and have an optional avoriteColor field, the model might guess "blue" just to fill out the structure, even if the color wasn't mentioned in the text. The best practice is to make fields required but allow a strict 
ull type, forcing the model to explicitly choose whether it has data or not.
