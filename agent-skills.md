# Agent Skills: Teaching AI to Do Anything

## Introduction: What Are Agent Skills?

A bare-bones large language model knows how to generate text. But a useful AI agent needs to *do* things — search the web, write code, execute commands, call APIs, remember past conversations, and coordinate complex multi-step tasks. **Agent skills** (also called tools, capabilities, or plugins depending on the platform) are the modular abilities that transform a raw LLM into a capable, autonomous agent.

Think of skills like a professional's toolkit. A doctor has clinical knowledge (the LLM base) but also skills — auscultation, blood pressure measurement, X-ray interpretation, suturing. Each skill is specialized, composable, and invoked on-demand based on the situation. Agent skills work the same way.

```svg
<svg viewBox="0 0 900 440" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <defs>
    <linearGradient id="agentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="sh">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#00000040"/>
    </filter>
  </defs>
  <rect width="900" height="440" fill="#0f172a" rx="16"/>
  <text x="450" y="36" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">Agent Skills Architecture</text>

  <!-- Central Agent -->
  <circle cx="450" cy="220" r="70" fill="url(#agentGrad)" filter="url(#glow)"/>
  <text x="450" y="215" text-anchor="middle" fill="white" font-size="14" font-weight="700">AI Agent</text>
  <text x="450" y="232" text-anchor="middle" fill="#c4b5fd" font-size="11">(LLM Core)</text>

  <!-- Skill Cards - arranged around center -->
  <!-- Top -->
  <rect x="330" y="50" width="140" height="56" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2" filter="url(#sh)"/>
  <text x="400" y="75" text-anchor="middle" fill="#fcd34d" font-size="12" font-weight="700">🔍 Web Search</text>
  <text x="400" y="93" text-anchor="middle" fill="#94a3b8" font-size="10">Real-time info retrieval</text>
  <line x1="400" y1="106" x2="420" y2="153" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Top-right -->
  <rect x="620" y="80" width="160" height="56" rx="10" fill="#1e293b" stroke="#06b6d4" stroke-width="2" filter="url(#sh)"/>
  <text x="700" y="105" text-anchor="middle" fill="#67e8f9" font-size="12" font-weight="700">💻 Code Execution</text>
  <text x="700" y="123" text-anchor="middle" fill="#94a3b8" font-size="10">Run code in sandboxes</text>
  <line x1="620" y1="108" x2="518" y2="180" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Right -->
  <rect x="680" y="195" width="160" height="56" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#sh)"/>
  <text x="760" y="220" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="700">🗄️ Database</text>
  <text x="760" y="238" text-anchor="middle" fill="#94a3b8" font-size="10">Query structured data</text>
  <line x1="680" y1="223" x2="520" y2="223" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Bottom-right -->
  <rect x="620" y="310" width="160" height="56" rx="10" fill="#1e293b" stroke="#f43f5e" stroke-width="2" filter="url(#sh)"/>
  <text x="700" y="335" text-anchor="middle" fill="#fb7185" font-size="12" font-weight="700">📁 File System</text>
  <text x="700" y="353" text-anchor="middle" fill="#94a3b8" font-size="10">Read/write files</text>
  <line x1="620" y1="338" x2="518" y2="267" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Bottom -->
  <rect x="330" y="335" width="140" height="56" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="2" filter="url(#sh)"/>
  <text x="400" y="360" text-anchor="middle" fill="#d8b4fe" font-size="12" font-weight="700">🧠 Memory</text>
  <text x="400" y="378" text-anchor="middle" fill="#94a3b8" font-size="10">Persist context/facts</text>
  <line x1="400" y1="335" x2="430" y2="290" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Bottom-left -->
  <rect x="120" y="310" width="160" height="56" rx="10" fill="#1e293b" stroke="#0ea5e9" stroke-width="2" filter="url(#sh)"/>
  <text x="200" y="335" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="700">🔗 API Calls</text>
  <text x="200" y="353" text-anchor="middle" fill="#94a3b8" font-size="10">External integrations</text>
  <line x1="280" y1="338" x2="382" y2="267" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Left -->
  <rect x="60" y="195" width="160" height="56" rx="10" fill="#1e293b" stroke="#84cc16" stroke-width="2" filter="url(#sh)"/>
  <text x="140" y="220" text-anchor="middle" fill="#bef264" font-size="12" font-weight="700">📧 Communication</text>
  <text x="140" y="238" text-anchor="middle" fill="#94a3b8" font-size="10">Email, Slack, Teams</text>
  <line x1="220" y1="223" x2="380" y2="223" stroke="#84cc16" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- Top-left -->
  <rect x="120" y="80" width="160" height="56" rx="10" fill="#1e293b" stroke="#fb923c" stroke-width="2" filter="url(#sh)"/>
  <text x="200" y="105" text-anchor="middle" fill="#fdba74" font-size="12" font-weight="700">📅 Calendar/Tasks</text>
  <text x="200" y="123" text-anchor="middle" fill="#94a3b8" font-size="10">Scheduling & planning</text>
  <line x1="280" y1="108" x2="385" y2="170" stroke="#fb923c" stroke-width="1.5" stroke-dasharray="4,2"/>

  <text x="450" y="425" text-anchor="middle" fill="#64748b" font-size="11">Skills are dynamically selected by the LLM reasoning loop based on task requirements</text>
</svg>
```

---

## The Skill Lifecycle: From Definition to Execution

Understanding how a skill is invoked requires understanding the **ReAct loop** (Reason + Act):

1. **Observe:** Agent reads the current conversation and task state
2. **Think:** LLM reasons about what action to take next (internal "chain of thought")
3. **Act:** LLM outputs a tool call with structured arguments
4. **Observe Result:** The tool executes and returns output
5. **Iterate:** The cycle repeats until the task is complete

```
User: "What's the weather in Tokyo and create a summary doc?"
  │
  ▼
[THINK] I need weather data. I have a `get_weather` tool. Let me call it.
  │
  ▼
[ACT]   → call get_weather(city="Tokyo")
  │
  ▼
[OBS]   ← { temperature: 28°C, condition: "Humid, partly cloudy" }
  │
  ▼
[THINK] Now I have the data. I should create a file. I have `write_file`.
  │
  ▼
[ACT]   → call write_file(name="tokyo_weather.md", content="# Tokyo Weather\n...")
  │
  ▼
[OBS]   ← { success: true, path: "/docs/tokyo_weather.md" }
  │
  ▼
[FINAL] "I've fetched the weather (28°C, humid) and created the summary doc."
```

---

## Categories of Agent Skills

### Category 1: Information Retrieval Skills

These skills expand the agent's knowledge beyond its training cutoff:

**Web Search**
```python
@tool
def web_search(query: str, num_results: int = 5) -> list[dict]:
    """
    Search the internet for current information.
    Returns a list of {title, url, snippet} dicts.
    """
    response = requests.get(
        "https://api.search-provider.com/search",
        params={"q": query, "count": num_results},
        headers={"Authorization": f"Bearer {SEARCH_API_KEY}"}
    )
    results = response.json()["results"]
    return [{"title": r["name"], "url": r["url"], "snippet": r["snippet"]} 
            for r in results]
```

**Document Retrieval (RAG)**
```python
@tool
def search_knowledge_base(query: str, top_k: int = 3) -> list[dict]:
    """
    Semantic search over the internal company knowledge base.
    Returns the top-k most relevant document chunks.
    """
    query_embedding = embed(query)
    results = vector_db.query(
        embedding=query_embedding,
        top_k=top_k,
        filter={"department": "engineering"}
    )
    return [{"source": r.metadata["source"], "content": r.page_content} 
            for r in results]
```

### Category 2: Code Execution Skills

The ability to write and run code makes agents dramatically more capable for technical tasks:

```python
@tool
def execute_python(code: str, timeout: int = 30) -> dict:
    """
    Execute Python code in an isolated sandbox environment.
    Returns stdout, stderr, and any execution errors.
    WARNING: Always runs in a restricted Docker container.
    """
    result = sandbox.run(
        code=code,
        language="python",
        timeout_seconds=timeout,
        resource_limits={"memory_mb": 512, "cpu_percent": 50}
    )
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.exit_code,
        "execution_time": result.elapsed_seconds
    }
```

**Security Note:** Code execution is one of the highest-risk skills. Always run in isolated containers (Docker/gVisor), enforce strict resource limits, block network access by default, and consider requiring explicit user confirmation before execution.

### Category 3: Memory and State Skills

Agents have a limited context window. Memory skills extend their effective working memory:

```python
# Short-term episodic memory (conversation history)
@tool
def save_to_memory(key: str, value: str) -> str:
    """Store a key-value fact for retrieval later in this session."""
    session_memory[key] = {"value": value, "timestamp": datetime.now().isoformat()}
    return f"Saved '{key}' to memory."

@tool
def recall_from_memory(key: str) -> str:
    """Retrieve a previously stored fact by key."""
    entry = session_memory.get(key)
    if not entry:
        return f"No memory found for key '{key}'."
    return f"Recalled: {entry['value']} (stored at {entry['timestamp']})"

# Long-term semantic memory (vector-based)
@tool
def remember_fact(fact: str) -> str:
    """
    Permanently store a fact in long-term memory.
    This persists across sessions and is searchable semantically.
    """
    embedding = embed(fact)
    long_term_memory.upsert(
        id=generate_id(fact),
        embedding=embedding,
        metadata={"fact": fact, "timestamp": datetime.now().isoformat()}
    )
    return f"Fact committed to long-term memory."
```

### Category 4: File System and I/O Skills

```python
@tool
def read_file(path: str) -> str:
    """Read the contents of a file at the specified path."""
    safe_path = validate_path(path, allowed_root="/workspace")
    with open(safe_path, 'r', encoding='utf-8') as f:
        return f.read()

@tool  
def write_file(path: str, content: str, append: bool = False) -> str:
    """Write content to a file. Creates the file if it doesn't exist."""
    safe_path = validate_path(path, allowed_root="/workspace")
    mode = 'a' if append else 'w'
    with open(safe_path, mode, encoding='utf-8') as f:
        f.write(content)
    return f"Successfully wrote {len(content)} characters to {path}"

@tool
def list_directory(path: str = ".") -> list[str]:
    """List files and subdirectories at the given path."""
    safe_path = validate_path(path, allowed_root="/workspace")
    entries = []
    for item in os.listdir(safe_path):
        full = os.path.join(safe_path, item)
        prefix = "📁 " if os.path.isdir(full) else "📄 "
        entries.append(prefix + item)
    return entries
```

### Category 5: API Integration Skills

```typescript
// Generic HTTP API skill
async function callRestAPI(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: object,
  headers?: Record<string, string>
): Promise<object> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Specific domain skill built on top of the generic one
async function createGitHubIssue(
  owner: string,
  repo: string, 
  title: string,
  body: string,
  labels: string[] = []
): Promise<string> {
  const result = await callRestAPI(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    "POST",
    { title, body, labels },
    { Authorization: `token ${GITHUB_TOKEN}` }
  );
  return `Created issue #${(result as any).number}: ${(result as any).html_url}`;
}
```

---

## Skill Definition Best Practices

```svg
<svg viewBox="0 0 900 360" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', sans-serif">
  <rect width="900" height="360" fill="#0f172a" rx="16"/>
  <text x="450" y="36" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Anatomy of a Well-Defined Skill</text>
  <!-- Main card -->
  <rect x="60" y="55" width="780" height="275" rx="12" fill="#1e293b"/>
  <!-- Function signature -->
  <rect x="80" y="75" width="740" height="30" rx="6" fill="#0f172a"/>
  <text x="100" y="95" fill="#7dd3fc" font-size="12" font-family="monospace">def search_documentation(</text>
  <text x="320" y="95" fill="#fb923c" font-size="12" font-family="monospace">query: str</text>
  <text x="420" y="95" fill="#e2e8f0" font-size="12" font-family="monospace">,</text>
  <text x="436" y="95" fill="#fb923c" font-size="12" font-family="monospace">library: str</text>
  <text x="540" y="95" fill="#e2e8f0" font-size="12" font-family="monospace">,</text>
  <text x="556" y="95" fill="#fb923c" font-size="12" font-family="monospace">version: str = "latest"</text>
  <text x="730" y="95" fill="#e2e8f0" font-size="12" font-family="monospace">) -></text>
  <text x="780" y="95" fill="#6ee7b7" font-size="12" font-family="monospace">list</text>
  <!-- Annotations -->
  <rect x="80" y="117" width="740" height="110" rx="6" fill="#0f172a"/>
  <text x="100" y="138" fill="#d8b4fe" font-size="11" font-family="monospace">    """</text>
  <text x="100" y="158" fill="#86efac" font-size="12" font-family="monospace">    ① Clear action verb + object: "Search ... and return"</text>
  <text x="100" y="178" fill="#94a3b8" font-size="11" font-family="monospace">    Search documentation for a given library and return relevant code examples.</text>
  <text x="100" y="198" fill="#6ee7b7" font-size="12" font-family="monospace">    ② Each param explained: what it is AND what values are valid</text>
  <text x="100" y="218" fill="#d8b4fe" font-size="11" font-family="monospace">    """</text>
  <!-- Parameter schema -->
  <rect x="80" y="238" width="350" height="72" rx="6" fill="#0f172a"/>
  <text x="100" y="258" fill="#fcd34d" font-size="11" font-family="monospace">③ Narrow types: use enums, ranges, regex</text>
  <text x="100" y="276" fill="#e2e8f0" font-size="11" font-family="monospace">   query: min 3 chars, max 200 chars</text>
  <text x="100" y="294" fill="#e2e8f0" font-size="11" font-family="monospace">   library: one of ["numpy", "pandas", "torch"]</text>
  <!-- Output contract -->
  <rect x="450" y="238" width="370" height="72" rx="6" fill="#0f172a"/>
  <text x="470" y="258" fill="#fb923c" font-size="11" font-family="monospace">④ Predictable output: typed and documented</text>
  <text x="470" y="276" fill="#e2e8f0" font-size="11" font-family="monospace">   Returns: [{title, url, code_snippet, version}]</text>
  <text x="470" y="294" fill="#e2e8f0" font-size="11" font-family="monospace">   Error: {error: "library not found"}</text>
  <text x="450" y="345" text-anchor="middle" fill="#64748b" font-size="11">A great skill description is 40% of the LLM's decision-making quality</text>
</svg>
```

**Rule 1: Write descriptions for the LLM, not for humans**
The LLM reads your tool description to decide *if and when* to call it. Every word matters.

```python
# ❌ Bad — vague, ambiguous
def process_data(input: str) -> str:
    """Process the data."""

# ✅ Good — specific, includes when NOT to use it
def convert_csv_to_json(csv_content: str, delimiter: str = ",") -> str:
    """
    Convert CSV-formatted text data into a JSON array of objects.
    The first row is treated as headers. Use this for structured tabular data.
    Do NOT use this for Excel files (.xlsx) — use read_excel_file instead.
    Returns: JSON string with array of objects.
    """
```

**Rule 2: Fail loudly with helpful messages**
```python
@tool
def send_email(to: str, subject: str, body: str) -> str:
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', to):
        # Return error as text, not an exception — let the LLM handle it
        return f"Error: '{to}' is not a valid email address. Please provide a valid email."
    
    if len(body) > 10000:
        return "Error: Email body exceeds 10,000 character limit. Please shorten the content."
    
    # ... send email logic
    return f"Email sent successfully to {to} with subject '{subject}'."
```

**Rule 3: Design for idempotency where possible**
Tools should be safe to call multiple times. Reading a file is naturally idempotent. Creating a database record should check for existence first.

---

## Skill Composition: Building Complex Behaviors

Individual skills become powerful through composition. Here's a multi-skill research pipeline:

```python
async def research_and_report(topic: str) -> str:
    """Agent orchestrates multiple skills to produce a research report."""
    
    # Skill 1: Search for information
    search_results = await web_search(f"{topic} latest developments 2024")
    
    # Skill 2: Extract key URLs to read in full
    urls = [r["url"] for r in search_results[:3]]
    full_articles = []
    for url in urls:
        article = await scrape_webpage(url)
        full_articles.append(article)
    
    # Skill 3: Check memory for prior research
    prior_notes = await recall_from_memory(f"research_{topic.replace(' ', '_')}")
    
    # Skill 4: Synthesize (LLM reasoning step - no tool needed)
    combined_context = "\n\n".join(full_articles)
    # LLM generates the report in its next reasoning step...
    
    # Skill 5: Write to file
    report_content = generate_report(topic, combined_context, prior_notes)
    await write_file(f"reports/{topic}_research.md", report_content)
    
    # Skill 6: Save summary to memory
    summary = report_content[:500]
    await save_to_memory(f"research_{topic.replace(' ', '_')}", summary)
    
    return f"Research complete. Report saved to reports/{topic}_research.md"
```

---

## Platform-Specific Skill Implementations

Different AI agent frameworks have different APIs for defining skills, but they all follow the same pattern:

### OpenAI Agents SDK (Python)
```python
from agents import function_tool

@function_tool
def calculate_compound_interest(
    principal: float,
    annual_rate: float,
    years: int,
    compounds_per_year: int = 12
) -> float:
    """
    Calculate compound interest given principal, rate, time, and compounding frequency.
    Returns the final amount after compound growth.
    """
    return principal * (1 + annual_rate / compounds_per_year) ** (compounds_per_year * years)
```

### LangChain (Python)
```python
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    city: str = Field(description="The city to get weather for")
    units: str = Field(default="metric", description="'metric' for Celsius, 'imperial' for Fahrenheit")

weather_tool = StructuredTool.from_function(
    func=get_weather,
    name="get_weather",
    description="Get current weather conditions for a city.",
    args_schema=WeatherInput
)
```

### Google ADK (Python)
```python
from google.adk.tools import FunctionTool

def search_products(query: str, max_price: float = None, category: str = "all") -> list:
    """
    Search the product catalog for items matching the query.
    
    Args:
        query: Search term for finding products
        max_price: Optional maximum price filter in USD
        category: Product category filter — one of 'electronics', 'clothing', 'books', 'all'
    
    Returns:
        List of matching products with id, name, price, rating
    """
    # ... implementation
    pass

search_tool = FunctionTool(func=search_products)
```

---

## Advanced Patterns: Skills That Make Agents Smarter

### Self-Reflection Skill
```python
@tool
def evaluate_my_response(draft_response: str, task_description: str) -> str:
    """
    Self-critique a draft response before presenting to the user.
    Returns a JSON object with 'quality_score' (1-10), 'issues', and 'suggestions'.
    Use this before finalizing any complex technical explanation.
    """
    prompt = f"""
    Task: {task_description}
    Draft: {draft_response}
    
    Evaluate this draft for accuracy, completeness, and clarity.
    Output JSON: {{"score": 1-10, "issues": [...], "suggestions": [...]}}
    """
    critique = call_llm(prompt)
    return critique
```

### Planning Skill
```python
@tool
def create_execution_plan(goal: str, available_tools: list[str]) -> str:
    """
    Break down a complex goal into an ordered list of actionable steps.
    Each step should map to one of the available tools.
    Use this at the start of multi-step tasks.
    """
    prompt = f"""
    Goal: {goal}
    Available tools: {', '.join(available_tools)}
    
    Create a numbered execution plan where each step uses exactly one tool.
    Format: 1. [tool_name]: description of what to do
    """
    return call_llm(prompt)
```

---

## Summary

Agent skills are the fundamental building blocks that elevate AI from a text generator to a capable autonomous system. By designing skills with:
- **Precision**: Clear, narrow type definitions and unambiguous descriptions
- **Safety**: Input validation, sandboxing, and idempotency where applicable
- **Composability**: Skills that work independently and together
- **Observability**: Structured, predictable output formats

…you enable your AI agent to tackle real-world tasks with the reliability of software and the flexibility of intelligence.
