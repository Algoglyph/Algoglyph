import json

articles = {
    "de-basics-programming": """# Programming Basics for Data Engineering

While software engineering often focuses on state management and user interfaces, programming in data engineering is fundamentally about **moving and transforming bytes efficiently**. When pipelines process terabytes of data, small inefficiencies in memory allocation or I/O handling compound into massive cloud compute bills or out-of-memory (OOM) crashes.

## Streaming vs. Batch Memory Models

The most common programming mistake in data engineering is eagerly loading datasets into memory. In languages like Python, comparing a list comprehension to a generator reveals this tradeoff.

### Eager vs. Lazy Evaluation

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Memory Allocation: List vs Generator</text>
  <g transform="translate(30, 50)">
    <!-- Axis -->
    <line x1="40" y1="150" x2="520" y2="150" stroke="#52525b" stroke-width="2"/>
    <line x1="40" y1="10" x2="40" y2="150" stroke="#52525b" stroke-width="2"/>
    <text x="5" y="80" fill="#a1a1aa" font-size="11" font-family="sans-serif" transform="rotate(-90 20 80)">RAM Usage (GB)</text>
    <text x="250" y="170" fill="#a1a1aa" font-size="11" font-family="sans-serif">Rows Processed</text>
    
    <!-- List Line (Spiking) -->
    <path d="M 40 150 L 280 20 L 520 20" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4"/>
    <text x="290" y="15" fill="#ef4444" font-size="12" font-family="sans-serif" font-weight="bold">List (Eager)</text>
    
    <!-- Generator Line (Flat) -->
    <path d="M 40 150 L 520 150" fill="none" stroke="#10b981" stroke-width="3"/>
    <text x="440" y="140" fill="#10b981" font-size="12" font-family="sans-serif" font-weight="bold">Generator (Lazy)</text>
  </g>
</svg>

When reading a 50GB CSV file, an eager load `[process(row) for row in open('data.csv')]` attempts to allocate objects for every row simultaneously. A lazy generator `(process(row) for row in open('data.csv'))` keeps only a single row in memory at any given time, maintaining O(1) space complexity.

### Python Implementation: O(1) Memory File Processing

```python
import csv
import sys

def process_large_dataset(file_path: str):
    \"\"\"
    Processes a large dataset with O(1) auxiliary memory.
    \"\"\"
    # ❌ Bad: df = pd.read_csv(file_path) -> O(N) memory
    
    # ✅ Good: Streaming generator -> O(1) memory
    def record_stream():
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Yield passes control back to the caller, suspending state
                yield row 

    # Consume the stream
    processed_count = 0
    for record in record_stream():
        if record.get('status') == 'active':
            # Write to database or next stage here
            processed_count += 1
            
    print(f"Processed {processed_count} records. Peak memory footprint remains flat.")
```

## Concurrency: I/O Bound vs CPU Bound

Data pipelines are typically I/O bound: waiting on network requests to APIs, reading from S3, or writing to Snowflake. Understanding the difference between concurrency models dictates how fast your pipeline runs.

| Concurrency Model | Best For | Python Library | Mechanism | Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Multithreading** | I/O-bound (Network/Disk) | `concurrent.futures.ThreadPoolExecutor` | Context switching by OS | Blocked by Global Interpreter Lock (GIL) for CPU work |
| **Multiprocessing** | CPU-bound (Data parsing/Math) | `multiprocessing` | Separate memory spaces | High memory overhead per worker, serialization costs |
| **AsyncIO** | Extremely high I/O concurrency | `asyncio`, `aiohttp` | Cooperative multitasking via event loop | Requires entirely async libraries |

### Real-World Practice

* [Python Generators and Yield (RealPython)](https://realpython.com/introduction-to-python-generators/): Deep dive into memory management.
  * *Why this is useful:* Teaches the mechanics of the `yield` statement which is fundamental to writing custom connectors for streaming data.
* [Async IO in Python: A Complete Walkthrough](https://realpython.com/async-io-python/): Master concurrent API scraping.
  * *Why this is useful:* Explains the event loop paradigm critical for extracting data from rate-limited REST APIs efficiently.
""",
    "de-basics-dsa": """# Data Structures & Algorithms for Data Engineers

Standard algorithm questions focus on in-memory collections like arrays and hash maps. In data engineering, the datasets vastly exceed RAM, meaning we must rely on **disk-resident data structures** and **probabilistic algorithms**.

## Columnar Storage vs. Row Storage

Traditional databases (PostgreSQL, MySQL) store data in **row-major order**. Analytical systems (BigQuery, Snowflake) and file formats (Parquet, ORC) store data in **column-major order**.

### Memory Layout: Row vs Column

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Disk Layout for `SELECT sum(revenue)`</text>
  
  <g transform="translate(30, 60)">
    <!-- Row Major -->
    <text x="0" y="0" fill="#a1a1aa" font-size="12" font-family="sans-serif">Row-Major (CSV/Postgres)</text>
    <rect x="0" y="10" width="80" height="25" fill="#ef4444" opacity="0.8"/>
    <text x="40" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">ID:1</text>
    <rect x="80" y="10" width="80" height="25" fill="#f59e0b" opacity="0.8"/>
    <text x="120" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Rev:100</text>
    <rect x="160" y="10" width="80" height="25" fill="#8b5cf6" opacity="0.8"/>
    <text x="200" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Date:Mon</text>
    <!-- Second row -->
    <rect x="240" y="10" width="80" height="25" fill="#ef4444" opacity="0.8"/>
    <text x="280" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">ID:2</text>
    <rect x="320" y="10" width="80" height="25" fill="#f59e0b" opacity="0.8"/>
    <text x="360" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Rev:250</text>
    
    <path d="M 0 50 Q 160 80 320 50" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
    <text x="160" y="90" fill="#ef4444" font-size="11" font-family="sans-serif" text-anchor="middle">Disk Head seeks past useless columns (Slow)</text>
  </g>

  <g transform="translate(30, 160)">
    <!-- Column Major -->
    <text x="0" y="0" fill="#a1a1aa" font-size="12" font-family="sans-serif">Column-Major (Parquet/Snowflake)</text>
    <rect x="0" y="10" width="80" height="25" fill="#ef4444" opacity="0.8"/>
    <text x="40" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">ID:1</text>
    <rect x="80" y="10" width="80" height="25" fill="#ef4444" opacity="0.8"/>
    <text x="120" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">ID:2</text>
    
    <rect x="170" y="10" width="80" height="25" fill="#f59e0b" opacity="0.8"/>
    <text x="210" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Rev:100</text>
    <rect x="250" y="10" width="80" height="25" fill="#f59e0b" opacity="0.8"/>
    <text x="290" y="27" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Rev:250</text>
    
    <path d="M 170 50 Q 250 70 330 50" fill="none" stroke="#10b981" stroke-width="2"/>
    <text x="250" y="80" fill="#10b981" font-size="11" font-family="sans-serif" text-anchor="middle">Contiguous sequential read of only Revenue (Fast)</text>
  </g>
</svg>

Columnar formats unlock algorithmic compression strategies like **Run-Length Encoding (RLE)** and **Dictionary Encoding**, which operate effectively only when data types are uniform sequentially.

## Bloom Filters: The O(1) Membership Oracle

When joining a massive 10-billion row fact table with a small dimension table, traditional hash joins require broadcasting the entire table. Instead, distributed engines like Spark use **Bloom Filters**, a probabilistic data structure.

A Bloom filter tells you if an element is *definitely not* in a set, or *possibly* in a set. It never yields false negatives, only false positives.

```python
import mmh3
import math

class BloomFilter:
    def __init__(self, capacity: int, false_positive_rate: float):
        # Calculate optimal size of bit array (m) and number of hash functions (k)
        self.size = int(-(capacity * math.log(false_positive_rate)) / (math.log(2)**2))
        self.hash_count = int((self.size / capacity) * math.log(2))
        self.bit_array = [0] * self.size
        
    def add(self, item: str):
        for i in range(self.hash_count):
            index = mmh3.hash(item, i) % self.size
            self.bit_array[index] = 1
            
    def check(self, item: str) -> bool:
        for i in range(self.hash_count):
            index = mmh3.hash(item, i) % self.size
            if self.bit_array[index] == 0:
                return False # Definitely not present
        return True # Probably present
```

In a distributed join, sending a 2MB Bloom filter across the network is drastically cheaper than sending a 5GB lookup table.

### LSM-Trees (Log-Structured Merge-Trees)

Modern NoSQL databases (Cassandra, RocksDB, Kafka) abandon B-Trees in favor of LSM-Trees for write-heavy workloads. Instead of performing expensive in-place updates on disk (O(log N) random I/O), LSM-Trees buffer writes in an in-memory `MemTable` and flush them to immutable `SSTables` on disk sequentially (O(1) sequential I/O).

| Operation | B-Tree (PostgreSQL) | LSM-Tree (Cassandra) |
| :--- | :--- | :--- |
| **Write Cost** | High (Random Disk I/O) | Very Low (Sequential Disk I/O) |
| **Read Cost** | O(log N) | Higher (Must check MemTable + multiple SSTables) |
| **Updates** | In-place modification | Append-only tombstone |

### Real-World Practice

* [Design a Bloom Filter (LeetCode 705 Alternative)](https://en.wikipedia.org/wiki/Bloom_filter): Build intuition for probabilistic structures.
  * *Why this is useful:* You will configure Bloom filter indices in Parquet files and RocksDB tunings; knowing the exact math prevents over-allocating memory.
* [The Log: What every software engineer should know about real-time data's unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying): Jay Kreps' seminal essay.
  * *Why this is useful:* It explains the fundamental data structure powering Kafka and all write-ahead logging (WAL) systems.
""",
    "de-basics-git": """# Git and Version Control in Data Engineering

While software engineers version their source code using Git, data engineers face a dual problem: they must version both **the transformation code** and **the data itself**. Understanding Git's internal architecture is required to know where its limits lie and why data-specific versioning tools exist.

## The Git Object Model: Why it Fails on Big Data

Git is not a diff-tracking system; it is a **Directed Acyclic Graph (DAG) of immutable snapshots**. When you commit a file, Git compresses it and stores the entire file in its object database (`.git/objects/`) as a **Blob**.

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f43f5e" font-size="13" font-family="sans-serif" font-weight="bold">Git's Internal DAG (Commit -> Tree -> Blob)</text>
  
  <g transform="translate(50, 80)">
    <!-- Commit Node -->
    <rect x="0" y="0" width="100" height="40" rx="4" fill="#18181b" stroke="#f43f5e" stroke-width="2"/>
    <text x="50" y="24" fill="#f43f5e" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">Commit: 3a2f9</text>
    
    <path d="M 100 20 L 150 20" fill="none" stroke="#52525b" stroke-width="2" marker-end="url(#arrow)"/>
    
    <!-- Tree Node -->
    <rect x="150" y="0" width="100" height="40" rx="4" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
    <text x="200" y="24" fill="#3b82f6" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">Tree: 8b1e4</text>
    
    <path d="M 250 20 L 320 -10" fill="none" stroke="#52525b" stroke-width="2"/>
    <path d="M 250 20 L 320 50" fill="none" stroke="#52525b" stroke-width="2"/>
    
    <!-- Blob Nodes -->
    <rect x="320" y="-30" width="160" height="40" rx="4" fill="#18181b" stroke="#10b981" stroke-width="2"/>
    <text x="400" y="-6" fill="#10b981" font-size="12" font-family="sans-serif" text-anchor="middle">Blob (pipeline.py): 5c8f1</text>
    
    <rect x="320" y="30" width="160" height="40" rx="4" fill="#18181b" stroke="#ef4444" stroke-width="2"/>
    <text x="400" y="54" fill="#ef4444" font-size="12" font-family="sans-serif" text-anchor="middle">Blob (data.csv): 9d3a2</text>
  </g>
</svg>

### Inspecting Git Internals

You can inspect exactly how Git stores your code using plumbing commands:

```bash
# View the type of a Git object
$ git cat-file -t 3a2f9
commit

# View the actual contents (the tree reference and commit message)
$ git cat-file -p 3a2f9
tree 8b1e42c2b38031d237b6070eb3747c0e5a9b3420
author Data Engineer <de@company.com> 1679000000 +0000
committer Data Engineer <de@company.com> 1679000000 +0000

Update transformation logic
```

If you commit a 10GB `users.csv` file, and then change a single row and commit again, Git creates an entirely new 10GB Blob object. Your `.git` repository size instantly balloons to 20GB. When anyone runs `git clone`, their network hangs attempting to download the massive history. **Git is optimized for small text files, not binary data or massive datasets.**

## The Solution: Code vs. Data Versioning

Because of Git's limitations, modern data engineering explicitly splits version control into two layers:

| Target | Tooling | Mechanism | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Logic (Code)** | Git, GitHub, GitLab | Tracks diffs of `.py`, `.sql`, and `.yaml` files | CI/CD pipelines, dbt models, Airflow DAGs |
| **Data (Files)** | DVC (Data Version Control) | Tracks pointers (MD5 hashes) in Git, stores actual files in S3 | Machine Learning datasets, raw CSV/Parquet drops |
| **Data (Tables)**| Apache Iceberg, Delta Lake | Transaction logs alongside Parquet files on object storage | Time-travel queries (e.g. `SELECT * FROM table TIMESTAMP AS OF ...`) |

### Branching in Data Pipelines

In analytical engineering (e.g., dbt), Git branching takes on a unique flavor. When you create a feature branch (`git checkout -b feature/new-revenue-calc`), CI/CD systems can dynamically provision a completely isolated schema in Snowflake (`dbt_pr_123_schema`) so that your experimental transformations do not corrupt the production reporting tables.

### Real-World Practice

* [Git Internals - Git Objects (Official Git Book)](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects): Read how Git actually stores data.
  * *Why this is useful:* Understanding Trees and Blobs explains exactly why Git LFS and DVC exist, and prevents you from destroying repository health with data dumps.
* [DVC Get Started](https://dvc.org/doc/start): Versioning data and models.
  * *Why this is useful:* Demonstrates how to track massive AWS S3 buckets while keeping your Git repository lightweight and cloneable.
"""
}

with open("output.json", "w") as f:
    json.dump(articles, f, indent=2)
