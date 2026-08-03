import re
import sys

def replace_blog_markdown_in_file(file_path: str, slug: str, new_markdown: str) -> bool:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    clean_md = new_markdown.replace("\\`", "`").replace("\\${", "${")
    escaped_markdown = clean_md.replace("`", "\\`").replace("${", "\\${")

    # Match in blogData.ts or deBlogData.ts
    # If deBlogData.ts: 'slug': `...`,
    # If blogData.ts: "slug": "lifo-stacks", ... "markdown": `...`
    
    if "deBlogData.ts" in file_path:
        pattern = re.compile(
            r"(  '" + re.escape(slug) + r"'\s*:\s*)[\s\S]*?(,\s*\n(?=\s*['}]|\s*$))",
            re.MULTILINE
        )
        def sub_func(m):
            return f"{m.group(1)}`\n{escaped_markdown}\n`{m.group(2)}"
        new_content, count = pattern.subn(sub_func, content)
    else:
        # blogData.ts format
        pattern = re.compile(
            r"(\"slug\"\s*:\s*\"" + re.escape(slug) + r"\"[\s\S]*?\"markdown\"\s*:\s*)`[\s\S]*?`(\s*,\s*\n\s*\"category\")",
            re.MULTILINE
        )
        def sub_func(m):
            return f"{m.group(1)}`\n{escaped_markdown}\n`{m.group(2)}"
        new_content, count = pattern.subn(sub_func, content)
    
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESSFULLY EXPANDED: '{slug}' in {file_path}")
        return True
    else:
        print(f"FAILED TO FIND SLOT FOR: '{slug}' in {file_path}")
        return False

# --- EXPANDED ARTICLES ---

lifo_stacks_article = r"""# LIFO Stacks: Memory Mechanics, Call Stack Frames & Constant-Time Operations

A **Stack** is a linear data structure operating on the **Last-In, First-Out (LIFO)** principle. The last element pushed onto the stack is always the first element popped off. From hardware CPU register stacks (`RSP` register in x86_64) to recursion call frames and expression evaluators, stacks form a fundamental building block of modern computer systems.

---

## 1. Physical Memory Mechanics & CPU Stack Pointer

At the operating system level, each running thread receives a fixed virtual memory segment called the **Thread Call Stack**.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stackBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#stackBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f0f6fc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">CPU Thread Stack & Assembly Push/Pop Mechanics</text>

  <!-- High Memory Address -->
  <text x="70" y="90" fill="#94a3b8" font-family="monospace" font-size="12">High Addresses (0x7FFF...)</text>

  <!-- Stack Frames -->
  <g transform="translate(220, 80)">
    <rect width="460" height="50" rx="6" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="230" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Caller Frame: main() (Return Addr, Local Vars)</text>
  </g>

  <g transform="translate(220, 140)">
    <rect width="460" height="50" rx="6" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="230" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Callee Frame: process_data(int n)</text>
  </g>

  <g transform="translate(220, 200)">
    <rect width="460" height="50" rx="6" fill="#2563eb" stroke="#93c5fd" stroke-width="1.5"/>
    <text x="230" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Active Frame: compute_hash(char* buf)  <-- RSP Pointer</text>
  </g>

  <!-- Unallocated Memory -->
  <g transform="translate(220, 260)">
    <rect width="460" height="40" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="230" y="25" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="11">Unallocated Stack Memory Growth Direction ↓</text>
  </g>

  <!-- Low Memory Address -->
  <text x="70" y="310" fill="#94a3b8" font-family="monospace" font-size="12">Low Addresses (0x0000...)</text>
</svg>

### Stack Operations & Time Complexities
- **Push ($O(1)$):** Appends an element to the top of the stack.
- **Pop ($O(1)$):** Removes and returns the top element.
- **Peek / Top ($O(1)$):** Returns the top element without mutating the stack.
- **IsEmpty ($O(1)$):** Returns true if stack size is zero.

---

## 2. Mathematical Formalism & Expression Evaluation

Stacks are indispensable for parsing nested structures, balancing parentheses, and evaluating Infix expressions (`A + B`) by converting them to Postfix (Reverse Polish Notation: `A B +`).

### Shunting-Yard Algorithm
Dijkstra's Shunting-Yard algorithm uses an operator stack to convert infix arithmetic into postfix notation without parentheses ambiguity.

---

## 3. High-Performance C++ Stack Implementation

```cpp
#include <iostream>
#include <vector>
#include <stdexcept>

template <typename T>
class FixedCapacityStack {
private:
    T* data;
    size_t capacity;
    int top_index;

public:
    explicit FixedCapacityStack(size_t cap) : capacity(cap), top_index(-1) {
        data = new T[capacity];
    }

    ~FixedCapacityStack() {
        delete[] data;
    }

    void push(const T& value) {
        if (top_index + 1 >= static_cast<int>(capacity)) {
            throw std::overflow_error("Stack Overflow: Exceeded fixed capacity limit.");
        }
        data[++top_index] = value;
    }

    T pop() {
        if (isEmpty()) {
            throw std::underflow_error("Stack Underflow: Stack is empty.");
        }
        return data[top_index--];
    }

    const T& peek() const {
        if (isEmpty()) {
            throw std::underflow_error("Stack is empty.");
        }
        return data[top_index];
    }

    bool isEmpty() const {
        return top_index == -1;
    }

    size_t size() const {
        return static_cast<size_t>(top_index + 1);
    }
};

int main() {
    FixedCapacityStack<int> s(5);
    s.push(10);
    s.push(20);
    s.push(30);
    std::cout << "Top: " << s.peek() << std::endl; // 30
    std::cout << "Popped: " << s.pop() << std::endl; // 30
    std::cout << "New Top: " << s.peek() << std::endl; // 20
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What causes a Stack Overflow error in recursive function calls?
Each recursive function call allocates a new stack frame on the OS call stack containing local parameters, return pointers, and registers. If a recursive function fails to hit its base case (infinite recursion), the call stack consumes all allocated memory boundary space (typically 1 MB–8 MB), throwing a StackOverflow Exception or Segmentation Fault.

### Q2: What is the difference between Array-based vs. Linked-List-based Stacks?
An Array-based stack offers contiguous memory cache locality and fast element access, but requires dynamic array reallocation when capacity limits are hit ($O(N)$ worst-case amortized push). A Linked-List stack dynamically allocates node pointers on demand with no capacity cap, but incurs dynamic memory allocation overhead and node pointer space penalties per element.
"""

fifo_queues_article = r"""# FIFO Queues: Ring Buffers, Multi-Producer Multi-Consumer (MPMC) Queues & Scheduling

A **Queue** is a linear data structure following the **First-In, First-Out (FIFO)** ordering principle. The first element enqueued into the queue is the first element dequeued. Queues serve as foundational building blocks in operating system task schedulers, network packet routing buffers, and message queue middleware (RabbitMQ, Kafka).

---

## 1. Queue Architecture & Dual-Pointer Mechanics

A queue maintains two pointers: a `Head` (or `Front`) pointer marking the next item to dequeue, and a `Tail` (or `Rear`) pointer marking the slot for incoming items.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="qBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#qBg)" stroke="#10b981" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">FIFO Queue Front & Rear Pointer Mechanics</text>

  <!-- Enqueue Action -->
  <g transform="translate(60, 140)">
    <rect width="120" height="60" rx="6" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
    <text x="60" y="35" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Enqueue(X)</text>
  </g>
  <path d="M 180 170 L 240 170" stroke="#34d399" stroke-width="3" />

  <!-- Queue Buffer -->
  <g transform="translate(240, 100)">
    <rect width="420" height="140" rx="8" fill="#065f46" stroke="#10b981" stroke-width="2"/>
    
    <!-- Slots -->
    <rect x="20" y="40" width="80" height="60" rx="4" fill="#047857" stroke="#6ee7b7"/>
    <text x="60" y="75" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="16">Item 1</text>
    <text x="60" y="125" text-anchor="middle" fill="#a7f3d0" font-family="monospace" font-size="11">HEAD (Front)</text>

    <rect x="120" y="40" width="80" height="60" rx="4" fill="#047857" stroke="#6ee7b7"/>
    <text x="160" y="75" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="16">Item 2</text>

    <rect x="220" y="40" width="80" height="60" rx="4" fill="#047857" stroke="#6ee7b7"/>
    <text x="260" y="75" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="16">Item 3</text>

    <rect x="320" y="40" width="80" height="60" rx="4" fill="#047857" stroke="#6ee7b7"/>
    <text x="360" y="75" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="16">Item 4</text>
    <text x="360" y="125" text-anchor="middle" fill="#a7f3d0" font-family="monospace" font-size="11">TAIL (Rear)</text>
  </g>

  <!-- Dequeue Action -->
  <path d="M 660 170 L 720 170" stroke="#34d399" stroke-width="3" />
  <g transform="translate(720, 140)">
    <rect width="120" height="60" rx="6" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
    <text x="60" y="35" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Dequeue()</text>
  </g>
</svg>

---

## 2. Lock-Free Single-Producer Single-Consumer (SPSC) Queue in C++

In real-time financial trading engines and audio drivers, mutex locks introduce costly thread sleeping. A Lock-Free SPSC queue uses atomic head/tail memory indices with memory barrier semantics.

```cpp
#include <atomic>
#include <vector>
#include <optional>
#include <iostream>

template <typename T, size_t Capacity>
class LockFreeSPSCQueue {
private:
    std::vector<T> buffer;
    alignas(64) std::atomic<size_t> head{0};
    alignas(64) std::atomic<size_t> tail{0};

public:
    LockFreeSPSCQueue() : buffer(Capacity) {}

    bool enqueue(const T& item) {
        size_t current_tail = tail.load(std::memory_order_relaxed);
        size_t current_head = head.load(std::memory_order_acquire);

        if ((current_tail + 1) % Capacity == current_head) {
            return false; // Queue Full
        }

        buffer[current_tail] = item;
        tail.store((current_tail + 1) % Capacity, std::memory_order_release);
        return true;
    }

    std::optional<T> dequeue() {
        size_t current_head = head.load(std::memory_order_relaxed);
        size_t current_tail = tail.load(std::memory_order_acquire);

        if (current_head == current_tail) {
            return std::nullopt; // Queue Empty
        }

        T item = buffer[current_head];
        head.store((current_head + 1) % Capacity, std::memory_order_release);
        return item;
    }
};

int main() {
    LockFreeSPSCQueue<int, 16> q;
    q.enqueue(42);
    q.enqueue(99);
    std::cout << "Dequeued: " << q.dequeue().value_or(-1) << std::endl; // 42
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between a Queue and a Double-Ended Queue (Deque)?
A Queue permits insertions exclusively at the Rear and removals at the Front ($O(1)$ FIFO). A Deque (Double-Ended Queue) permits insertions and deletions at **both** Front and Rear in $O(1)$ time.

### Q2: How does a Priority Queue differ from a standard FIFO Queue?
In a standard FIFO queue, items depart strictly in arrival order. In a Priority Queue, each element is associated with a numerical priority score; elements with higher priority scores are dequeued before lower-priority elements, typically implemented using Binary Heaps ($O(\log N)$ enqueue/dequeue).
"""

# Apply replacements
replace_blog_markdown_in_file('src/config/blogData.ts', 'lifo-stacks', lifo_stacks_article)
replace_blog_markdown_in_file('src/config/blogData.ts', 'fifo-queues', fifo_queues_article)
