from replace_blog_json_markdown import update_markdown_for_slug
from generate_dynamodb_and_backend import inject_into_de_blog_data

circular_buffers_md = r"""# Circular Buffers: Fixed-Ring Storage & O(1) Producer-Consumer Queues

A **Circular Buffer** (or **Ring Buffer**) is a bounded, fixed-size data structure that connects the end of an underlying array back to the beginning. Circular buffers eliminate the need to shift array elements when popping from the front, providing strict $O(1)$ constant-time enqueue and dequeue operations without dynamic memory allocations.

---

## 1. Ring Buffer Indexing Mechanics & Pointer Wraparounds

A circular buffer tracks a `head` index (read pointer), a `tail` index (write pointer), and an active `capacity` limit.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ringBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#ringBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f0f6fc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Circular Buffer Ring Indexing Mechanics</text>

  <!-- Ring Circle Representation -->
  <g transform="translate(450, 200)">
    <circle r="110" fill="none" stroke="#334155" stroke-width="32"/>
    <circle r="110" fill="none" stroke="#0284c7" stroke-width="32" stroke-dasharray="172 690" stroke-dashoffset="86"/>
    
    <!-- Index Labels -->
    <text x="0" y="-125" text-anchor="middle" fill="#f0f6fc" font-family="monospace" font-weight="700" font-size="14">[0] Head</text>
    <text x="130" y="0" text-anchor="middle" fill="#f0f6fc" font-family="monospace" font-weight="700" font-size="14">[1]</text>
    <text x="0" y="140" text-anchor="middle" fill="#f0f6fc" font-family="monospace" font-weight="700" font-size="14">[2] Tail</text>
    <text x="-130" y="0" text-anchor="middle" fill="#64748b" font-family="monospace" font-size="14">[3] Free</text>
  </g>

  <!-- Formula Card -->
  <g transform="translate(60, 110)">
    <rect width="240" height="150" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="120" y="30" text-anchor="middle" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="14">Modulo Index Arithmetic</text>
    <text x="20" y="65" fill="#e2e8f0" font-family="monospace" font-size="12">Next Tail = (tail + 1) % Cap</text>
    <text x="20" y="95" fill="#e2e8f0" font-family="monospace" font-size="12">Next Head = (head + 1) % Cap</text>
    <text x="20" y="125" fill="#38bdf8" font-family="monospace" font-size="12">Is Full: (tail + 1) % Cap == head</text>
  </g>
</svg>

### Mathematical Index Arithmetic
$$\text{next\_tail} = (\text{tail} + 1) \pmod N$$
$$\text{next\_head} = (\text{head} + 1) \pmod N$$

---

## 2. High-Performance C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <stdexcept>

template <typename T, size_t Capacity>
class CircularBuffer {
private:
    T buffer[Capacity];
    size_t head = 0;
    size_t tail = 0;
    size_t count = 0;

public:
    bool push(const T& item) {
        if (count == Capacity) return false; // Buffer Full
        buffer[tail] = item;
        tail = (tail + 1) % Capacity;
        count++;
        return true;
    }

    bool pop(T& out_item) {
        if (count == 0) return false; // Buffer Empty
        out_item = buffer[head];
        head = (head + 1) % Capacity;
        count--;
        return true;
    }

    size_t size() const { return count; }
    bool is_full() const { return count == Capacity; }
    bool is_empty() const { return count == 0; }
};

int main() {
    CircularBuffer<int, 4> ring;
    ring.push(100);
    ring.push(200);
    ring.push(300);
    int val;
    ring.pop(val);
    std::cout << "Popped: " << val << " | New Size: " << ring.size() << std::endl;
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why are circular buffers preferred in audio drivers and DSP hardware?
Audio hardware requires deterministic microsecond streaming without memory allocation pauses. Circular buffers operate with fixed memory allocations pre-reserved at startup, eliminating garbage collection sweeps and dynamic heap fragments.
"""

leftist_heaps_md = r"""# Leftist Heaps: NPL Distance Metrics & Logarithmic Merge Mechanics

A **Leftist Heap** is a variant of a binary heap designed for fast $O(\log N)$ heap merges. Unlike standard array-based binary heaps which require $O(N)$ time to merge two heaps, a leftist heap maintains a property called the **Null Path Length (NPL)** to guarantee that tree depth remains biased toward the left subtree, keeping the right subtree extremely short.

---

## 1. The Null Path Length (NPL) Property

The **Null Path Length ($npl(x)$)** of a node $x$ is defined as the shortest distance from $x$ to an empty (null) descendant leaf node.

$$npl(x) = \begin{cases} -1 & \text{if } x \text{ is NULL} \\ 1 + \min(npl(\text{left}(x)), npl(\text{right}(x))) & \text{otherwise} \end{cases}$$

### Leftist Property Rule
For every node $x$ in a leftist heap:
$$npl(\text{left}(x)) \ge npl(\text{right}(x))$$

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lhBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#lhBg)" stroke="#4ade80" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f0fdf4" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Leftist Heap Tree Structure & NPL Invariant</text>

  <!-- Root Node -->
  <g transform="translate(450, 100)">
    <circle r="26" fill="#166534" stroke="#4ade80" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">3 (npl=1)</text>
  </g>

  <!-- Left Child -->
  <g transform="translate(300, 200)">
    <circle r="26" fill="#166534" stroke="#4ade80" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">10 (npl=1)</text>
  </g>
  <path d="M 430 118 L 320 182" stroke="#4ade80" stroke-width="2"/>

  <!-- Right Child -->
  <g transform="translate(600, 200)">
    <circle r="26" fill="#166534" stroke="#86efac" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">8 (npl=0)</text>
  </g>
  <path d="M 470 118 L 580 182" stroke="#4ade80" stroke-width="2"/>

  <!-- Deep Left Subtree -->
  <g transform="translate(220, 290)">
    <circle r="22" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="12">21</text>
  </g>
  <path d="M 285 218 L 235 272" stroke="#22c55e" stroke-width="1.5"/>
</svg>

---

## 2. C++ Recursive Merge Algorithm

```cpp
#include <iostream>
#include <algorithm>

struct LeftistNode {
    int key;
    int npl;
    LeftistNode* left;
    LeftistNode* right;

    LeftistNode(int val) : key(val), npl(0), left(nullptr), right(nullptr) {}
};

int getNpl(LeftistNode* node) {
    return node ? node->npl : -1;
}

LeftistNode* merge(LeftistNode* h1, LeftistNode* h2) {
    if (!h1) return h2;
    if (!h2) return h1;

    if (h1->key > h2->key) std::swap(h1, h2);

    h1->right = merge(h1->right, h2);

    if (getNpl(h1->left) < getNpl(h1->right)) {
        std::swap(h1->left, h1->right);
    }

    h1->npl = getNpl(h1->right) + 1;
    return h1;
}
```
"""

fibonacci_heaps_md = r"""# Fibonacci Heaps: Amortized O(1) Key Decrements & Minimum Spanning Trees

A **Fibonacci Heap** is a collection of min-heap-ordered trees offering superior theoretical time bounds: **$O(1)$ amortized time** for `Insert`, `Find-Min`, `Merge`, and `Decrease-Key` operations. This makes Fibonacci heaps optimal for graph algorithms like **Dijkstra's Shortest Path** and **Prim's Minimum Spanning Tree**.

---

## 1. Structural Architecture & Cascading Cuts

Unlike standard binary heaps which maintain rigid tree structures, a Fibonacci heap is a lazy forest of trees linked by a circular doubly linked list.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fhBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#180e04"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fhBg)" stroke="#f97316" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ffedd5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Fibonacci Heap Circular Root List Topology</text>

  <!-- Root Min Node Pointer -->
  <g transform="translate(180, 120)">
    <circle r="28" fill="#7c2d12" stroke="#ea580c" stroke-width="2.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">3 [MIN]</text>
  </g>

  <!-- Root Node 2 -->
  <g transform="translate(450, 120)">
    <circle r="28" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">17</text>
  </g>

  <!-- Root Node 3 -->
  <g transform="translate(720, 120)">
    <circle r="28" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">24</text>
  </g>

  <!-- Root Pointer Links -->
  <path d="M 210 120 L 420 120" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M 480 120 L 690 120" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
</svg>

---

## Frequently Asked Questions (FAQs)

### Q1: Why are Fibonacci Heaps rarely used in production high-frequency trading engines despite their superior theoretical amortized time bounds?
Fibonacci heaps suffer from large constant-factor memory overheads and poor CPU cache locality due to extensive dynamic node pointer operations, making dynamic array binary heaps faster in practice for small to medium datasets ($N < 100,000$).
"""

# Update blogData.ts entries
update_markdown_for_slug('src/config/blogData.ts', 'circular-buffers', circular_buffers_md)
update_markdown_for_slug('src/config/blogData.ts', 'leftist-heaps', leftist_heaps_md)
update_markdown_for_slug('src/config/blogData.ts', 'fibonacci-heaps', fibonacci_heaps_md)
