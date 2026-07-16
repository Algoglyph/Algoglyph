# OpenAI: The Platform That Started the AI Revolution

## Introduction: OpenAI's Role in Modern AI

OpenAI is the organization behind GPT-4, GPT-4o, and the ChatGPT product that brought conversational AI into mainstream consciousness. Founded in 2015 as a non-profit with a mission to ensure AI benefits all of humanity, OpenAI pivoted to a "capped-profit" model to attract the capital required for frontier AI research.

For developers, **OpenAI's platform** (api.openai.com) provides programmatic access to their state-of-the-art models through one of the most widely-used APIs in software development. The API's design — particularly its chat completion format — has become an industry standard, with many other providers offering OpenAI-compatible endpoints.

```svg
<svg viewBox="0 0 900 390" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <defs>
    <linearGradient id="oaiBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <linearGradient id="oaiCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10a37f"/>
      <stop offset="100%" style="stop-color:#1a7f64"/>
    </linearGradient>
    <filter id="oaish">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#10a37f30"/>
    </filter>
  </defs>
  <rect width="900" height="390" fill="url(#oaiBg)" rx="16"/>
  <text x="450" y="38" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">OpenAI Model Ecosystem</text>

  <!-- GPT-4o (flagship) -->
  <rect x="300" y="60" width="300" height="100" rx="14" fill="url(#oaiCard)" filter="url(#oaish)"/>
  <text x="450" y="98" text-anchor="middle" fill="white" font-size="18" font-weight="700">GPT-4o</text>
  <text x="450" y="118" text-anchor="middle" fill="#d1fae5" font-size="11">Flagship Multimodal Model</text>
  <text x="450" y="136" text-anchor="middle" fill="#a7f3d0" font-size="10">Text · Images · Audio · Vision</text>

  <!-- Other models -->
  <rect x="30" y="200" width="180" height="80" rx="10" fill="#1e293b" stroke="#10a37f" stroke-width="2"/>
  <text x="120" y="230" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">GPT-4o Mini</text>
  <text x="120" y="250" text-anchor="middle" fill="#94a3b8" font-size="10">Fast &amp; affordable</text>
  <text x="120" y="265" text-anchor="middle" fill="#94a3b8" font-size="10">High-volume tasks</text>

  <rect x="240" y="200" width="180" height="80" rx="10" fill="#1e293b" stroke="#6366f1" stroke-width="2"/>
  <text x="330" y="230" text-anchor="middle" fill="#a5b4fc" font-size="12" font-weight="700">o1 / o3</text>
  <text x="330" y="250" text-anchor="middle" fill="#94a3b8" font-size="10">Reasoning models</text>
  <text x="330" y="265" text-anchor="middle" fill="#94a3b8" font-size="10">Math / coding / logic</text>

  <rect x="450" y="200" width="180" height="80" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="540" y="230" text-anchor="middle" fill="#fcd34d" font-size="12" font-weight="700">Whisper</text>
  <text x="540" y="250" text-anchor="middle" fill="#94a3b8" font-size="10">Speech-to-text</text>
  <text x="540" y="265" text-anchor="middle" fill="#94a3b8" font-size="10">100+ languages</text>

  <rect x="660" y="200" width="210" height="80" rx="10" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
  <text x="765" y="230" text-anchor="middle" fill="#f9a8d4" font-size="12" font-weight="700">DALL-E 3 / TTS</text>
  <text x="765" y="250" text-anchor="middle" fill="#94a3b8" font-size="10">Image generation</text>
  <text x="765" y="265" text-anchor="middle" fill="#94a3b8" font-size="10">Text-to-speech</text>

  <!-- Lines from GPT-4o to others -->
  <line x1="360" y1="160" x2="120" y2="200" stroke="#10a37f" stroke-width="1.5" stroke-dasharray="4,2"/>
  <line x1="410" y1="160" x2="330" y2="200" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="4,2"/>
  <line x1="490" y1="160" x2="540" y2="200" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2"/>
  <line x1="540" y1="160" x2="765" y2="200" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Embeddings -->
  <rect x="30" y="310" width="840" height="50" rx="10" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5"/>
  <text x="450" y="340" text-anchor="middle" fill="#7dd3fc" font-size="12">📐 Embeddings: text-embedding-3-large · text-embedding-3-small · ada-002</text>
  <text x="450" y="375" text-anchor="middle" fill="#64748b" font-size="10">OpenAI also offers: Fine-tuning · Assistants API · Batch API · Evals API</text>
</svg>
```

---

## The Chat Completions API: Industry Standard Format

OpenAI popularized the **messages array** format that is now the de facto standard across the industry:

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": "You are a senior software engineer specializing in distributed systems. Provide precise, technically accurate responses."
        },
        {
            "role": "user",
            "content": "Explain the CAP theorem and give a practical example."
        }
    ],
    max_tokens=1024,
    temperature=0.3
)

print(response.choices[0].message.content)
print(f"\nUsage: {response.usage.prompt_tokens} prompt + {response.usage.completion_tokens} completion = {response.usage.total_tokens} total tokens")
```

The three roles:
- **`system`**: Sets the model's behavior, persona, and constraints for the entire conversation
- **`user`**: Represents input from the human
- **`assistant`**: Represents the model's previous responses (used to provide conversation history)

---

## Function Calling: The Foundation of Tool-Using Agents

OpenAI introduced structured function calling, enabling reliable tool-use:

```python
from openai import OpenAI
import json

client = OpenAI()

# Define available tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_stock_price",
            "description": "Retrieves the current stock price and related financial data for a given ticker symbol.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "Stock ticker symbol, e.g. 'AAPL' for Apple Inc."
                    },
                    "include_history": {
                        "type": "boolean",
                        "description": "Whether to include 30-day price history",
                        "default": False
                    }
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "place_order",
            "description": "Places a buy or sell order for a stock. IMPORTANT: This executes real trades.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {"type": "string"},
                    "action": {"type": "string", "enum": ["buy", "sell"]},
                    "quantity": {"type": "integer", "minimum": 1}
                },
                "required": ["ticker", "action", "quantity"]
            }
        }
    }
]

def execute_tool(name: str, args: dict) -> str:
    """Mock tool execution"""
    if name == "get_stock_price":
        return json.dumps({
            "ticker": args["ticker"],
            "price": 189.45,
            "change_percent": 2.3,
            "market_cap": "2.9T"
        })
    elif name == "place_order":
        return json.dumps({"status": "Order placed", "order_id": "ORD-789123"})
    return json.dumps({"error": "Unknown function"})

# Agent loop
messages = [
    {"role": "system", "content": "You are a stock trading assistant. Always check price before placing orders."},
    {"role": "user", "content": "Buy 10 shares of AAPL for me."}
]

while True:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"  # Let model decide when to call tools
    )
    
    choice = response.choices[0]
    messages.append({"role": "assistant", "content": choice.message.content, 
                     "tool_calls": choice.message.tool_calls})
    
    if choice.finish_reason == "stop":
        print("Final:", choice.message.content)
        break
    
    if choice.finish_reason == "tool_calls":
        for tool_call in choice.message.tool_calls:
            result = execute_tool(tool_call.function.name, json.loads(tool_call.function.arguments))
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result
            })
```

---

## Structured Outputs: Guaranteed JSON

OpenAI's **Structured Outputs** feature (via JSON schema mode) guarantees the model returns valid, schema-conformant JSON — no parsing errors:

```python
from openai import OpenAI
from pydantic import BaseModel
from typing import Optional

client = OpenAI()

class ResearchPaper(BaseModel):
    title: str
    authors: list[str]
    year: int
    abstract_summary: str
    key_contributions: list[str]
    methodology: str
    limitations: Optional[str]
    citation_count_estimate: int

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",  # Must use a model that supports structured outputs
    messages=[
        {"role": "user", "content": "Analyze this research abstract and extract structured information: [paste abstract here]"}
    ],
    response_format=ResearchPaper,  # Pass Pydantic model directly
)

paper = response.choices[0].message.parsed
print(f"Title: {paper.title}")
print(f"Authors: {', '.join(paper.authors)}")
print(f"Key contributions: {paper.key_contributions}")
```

---

## The Assistants API: Stateful Agent Framework

The Assistants API provides a higher-level abstraction for building persistent, stateful agents:

```python
from openai import OpenAI
import time

client = OpenAI()

# Create an Assistant (done once, reused across many conversations)
assistant = client.beta.assistants.create(
    name="Code Review Bot",
    instructions="""You are an expert code reviewer with 20 years of experience. 
    Review code for: correctness, performance, security, readability, and maintainability.
    Provide specific, actionable feedback with line numbers.""",
    model="gpt-4o",
    tools=[
        {"type": "code_interpreter"},  # Can run code to verify it works
        {"type": "file_search"}        # Can search through uploaded docs
    ]
)

# Create a thread (one per conversation/user)
thread = client.beta.threads.create()

# Add a message to the thread
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="""Review this Python function:
    
def find_user(users, target_email):
    for i in range(len(users)):
        if users[i]['email'] == target_email:
            return users[i]
    return None"""
)

# Run the assistant
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# Poll for completion
while run.status in ["queued", "in_progress"]:
    time.sleep(1)
    run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

# Get the response
messages = client.beta.threads.messages.list(thread_id=thread.id)
print(messages.data[0].content[0].text.value)
```

---

## Embeddings: Turning Text into Vectors

OpenAI's embedding models convert text into high-dimensional vectors for semantic search and similarity:

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def get_embedding(text: str, model: str = "text-embedding-3-small") -> list[float]:
    """Get vector embedding for a piece of text."""
    text = text.replace("\n", " ")
    response = client.embeddings.create(input=[text], model=model)
    return response.data[0].embedding

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Calculate how similar two vectors are (1.0 = identical, 0.0 = unrelated)."""
    a, b = np.array(vec1), np.array(vec2)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Example: semantic search
documents = [
    "Python is a high-level programming language known for its simplicity.",
    "Machine learning models are trained on large datasets.",
    "The Eiffel Tower is located in Paris, France.",
    "Neural networks consist of layers of interconnected nodes.",
    "Soccer is the most popular sport in the world."
]

# Embed all documents
doc_embeddings = [get_embedding(doc) for doc in documents]

# Search
query = "How do deep learning systems work?"
query_embedding = get_embedding(query)

# Rank by similarity
similarities = [(doc, cosine_similarity(query_embedding, emb)) 
                for doc, emb in zip(documents, doc_embeddings)]
similarities.sort(key=lambda x: x[1], reverse=True)

print(f"Query: {query}\n")
print("Most relevant documents:")
for doc, score in similarities[:3]:
    print(f"  [{score:.3f}] {doc}")
```

---

## The o1 and o3 Reasoning Models

OpenAI's reasoning models are fundamentally different from GPT-4o — they spend time "thinking" before responding:

```python
from openai import OpenAI

client = OpenAI()

# o1 model — uses internal chain-of-thought
# Note: system messages not supported for o1; use user message
response = client.chat.completions.create(
    model="o1-preview",
    messages=[
        {
            "role": "user",
            "content": """Solve this step-by-step:
            A train leaves City A at 8:00 AM traveling 60 mph toward City B (300 miles away).
            Another train leaves City B at 9:00 AM traveling 80 mph toward City A.
            At what time and location do they meet?"""
        }
    ],
    max_completion_tokens=8192  # Reasoning models use max_completion_tokens, not max_tokens
)

print(response.choices[0].message.content)
# o1 shows its reasoning in a <think> block before the final answer
```

**When to use reasoning models:**
- Complex mathematical proofs
- Multi-step logical reasoning
- Code debugging with subtle bugs
- Scientific analysis and hypothesis generation
- Problems where "thinking time" directly improves accuracy

---

## Batch API: 50% Cost Reduction for Async Tasks

For non-real-time workloads, the Batch API processes requests asynchronously at half the cost:

```python
import json
from openai import OpenAI

client = OpenAI()

# Prepare batch requests
requests = []
for i, document in enumerate(my_documents):
    requests.append({
        "custom_id": f"request-{i}",
        "method": "POST",
        "url": "/v1/chat/completions",
        "body": {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "user", "content": f"Summarize in 2 sentences: {document}"}
            ],
            "max_tokens": 200
        }
    })

# Write to JSONL file
with open("batch_input.jsonl", "w") as f:
    for req in requests:
        f.write(json.dumps(req) + "\n")

# Upload and create batch
batch_file = client.files.create(file=open("batch_input.jsonl", "rb"), purpose="batch")
batch = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h"
)

print(f"Batch ID: {batch.id} — Status: {batch.status}")
# Poll batch.status until "completed", then download results
```

---

## Rate Limits and Cost Management

```python
from openai import OpenAI, RateLimitError
import time
import tiktoken

client = OpenAI()

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens before making API calls to estimate cost."""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def chat_with_retry(messages: list, model: str = "gpt-4o", max_retries: int = 3):
    """Chat with automatic retry on rate limits."""
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(model=model, messages=messages)
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)

# Estimate cost before calling
system_msg = "You are a helpful assistant."
user_msg = "Explain quantum computing in detail."
total_tokens = count_tokens(system_msg + user_msg)
estimated_cost = (total_tokens / 1_000_000) * 5.00  # GPT-4o: $5/1M input tokens
print(f"Estimated cost: ${estimated_cost:.6f}")
```

---

## Summary

OpenAI's platform remains the most widely adopted AI API in the industry, offering:
- **GPT-4o**: Best multimodal general-purpose model
- **o1/o3**: Specialized reasoning for complex analytical tasks
- **GPT-4o Mini**: Cost-efficient for high-volume simpler tasks
- **Embeddings**: Industry-standard vectors for semantic search
- **Assistants API**: Managed stateful agent framework
- **Batch API**: 50% cost reduction for async workloads

The OpenAI API format has become the industry standard, meaning skills learned here transfer directly to many other providers.
