# Binary Heaps & Priority Queues: Maintaining an Extremum in a Compact Tree

![Binary heap represented as a tree and array](/images/dsa/heap-dark.png#dark)

## 1. Historical Context & Motivation

A priority queue answers a different question from an ordinary FIFO queue.

Instead of removing the oldest item, it removes the item with the most urgent priority.

The interface needs repeated insertion and repeated access to an extremum.

An unsorted array inserts quickly but searches the entire collection for every minimum.

A sorted array exposes the minimum immediately but may shift many elements per insertion.

A balanced search tree supports both operations logarithmically, but stores links and more structural metadata.

A binary heap gives a compact alternative.

It stores a complete binary tree in one contiguous array.

The root contains the minimum in a min-heap or the maximum in a max-heap.

Insertions repair one ancestor path.

Removing the root repairs one descendant path.

Neither operation needs the whole array to be sorted.

That partial order is the source of the data structure's efficiency.

Heaps support schedulers, shortest-path frontiers, event simulations, streaming selection, external sorting, and merge pipelines.

The term **heap** is overloaded.

The binary heap data structure is unrelated to the heap memory region used by dynamic allocation.

A binary heap is also not a binary search tree.

In a search tree, left and right subtrees encode key ranges.

In a heap, each parent is ordered only relative to its children.

Searching for an arbitrary key remains linear in the worst case.

Completeness matters as much as heap order.

Every level is full except possibly the last.

The final level is filled from left to right.

This shape keeps height logarithmic without pointers or rotations.

Array positions imply every parent-child relationship.

A heap does not promise stable ordering among equal-priority items.

If stability matters, store an insertion sequence as a secondary key.

The central question is:

How can one array maintain fast extremum access while repairing only a single root-to-leaf path after each mutation?

## 2. Core Mathematical Invariants

Let the heap contain $n$ items at zero-based array indices $0$ through $n-1$.

For index $i>0$, its parent is:

$$
\operatorname{parent}(i)=\left\lfloor\frac{i-1}{2}\right\rfloor.
$$

Its children, when within bounds, are:

$$
\operatorname{left}(i)=2i+1
$$

and

$$
\operatorname{right}(i)=2i+2.
$$

These formulas encode the complete-tree shape.

No child pointers are stored.

### Shape invariant

The occupied indices form the contiguous prefix `[0, n)`.

There are no holes.

Appending at index `n` adds the next left-to-right leaf.

Removing the last array element removes the final leaf.

Swapping values never changes the shape.

The height is:

$$
\lfloor\log_2 n\rfloor
$$

for nonempty heaps.

### Min-heap order invariant

For every child index $i>0$:

$$
A[\operatorname{parent}(i)]\le A[i].
$$

Therefore every ancestor is no greater than its descendants.

The root is a global minimum.

Siblings have no required ordering.

Nodes in different subtrees have no required ordering.

The array is generally not sorted.

### Max-heap order invariant

A max-heap reverses the comparison:

$$
A[\operatorname{parent}(i)]\ge A[i].
$$

The root is then a global maximum.

The algorithms are identical after replacing the priority comparator.

### Insertion violation is confined upward

Before insertion, all existing edges satisfy heap order.

Appending a new leaf creates only one new parent-child edge.

If that edge violates order, swap the leaf with its parent.

After the swap, the lower edge becomes valid.

Only the moved value's edge to its new parent may remain invalid.

Repeated upward swaps restore the heap along one ancestor path.

This is **sift-up**.

### Root removal violation is confined downward

The root is removed, and the last leaf value moves to index `0`.

All edges not touching that moved value remain unchanged.

Compare it with its children.

If order is violated, swap with the higher-priority child.

Choosing the best child is essential.

Swapping with the other child could leave the new parent worse than its sibling child.

Only the moved value may violate order at the next level.

Repeated downward swaps restore the heap along one descendant path.

This is **sift-down**.

### The root certifies the extremum

In a min-heap, follow the parent chain from any node to the root.

Every step moves to a value no greater than the child.

By transitivity, the root is no greater than every node.

The heap does not need comparisons between unrelated branches to prove this result.

### Bottom-up construction invariant

Every index from $\lfloor n/2\rfloor$ onward is a leaf.

A leaf is already a valid heap.

Process internal nodes in reverse index order.

When sifting down node $i$, both child subtrees are already valid heaps.

After the sift, the subtree rooted at $i$ is valid.

When index `0` finishes, the entire array is a heap.

This builds a heap in $O(n)$ time.

### Priority identity

If heap entries carry payloads, comparisons must use the priority key consistently.

Mutating a stored priority in place can break heap order.

Use a decrease-key or increase-key repair operation, or insert a new version and discard stale entries when popped.

## 3. Step-by-Step Execution Trace

Build a min-heap by inserting values `7, 3, 9, 1, 6, 2`.

Start with an empty array.

### Insert `7`

Append at index `0`.

Array: `[7]`.

The new value is the root.

No comparison is needed.

### Insert `3`

Append at index `1`.

Temporary array: `[7, 3]`.

Parent index is `0` with value `7`.

Because `3 < 7`, swap them.

Heap: `[3, 7]`.

### Insert `9`

Append at index `2`.

Temporary array: `[3, 7, 9]`.

Parent value is `3`.

`9 >= 3`, so the new edge is valid.

Heap remains `[3, 7, 9]`.

### Insert `1`

Append at index `3`.

Temporary array: `[3, 7, 9, 1]`.

Its parent is index `1`, value `7`.

Swap `1` and `7`.

Array becomes `[3, 1, 9, 7]`.

The moved value `1` is now at index `1`.

Its parent is index `0`, value `3`.

Swap again.

Heap: `[1, 3, 9, 7]`.

Only the ancestor path changed.

### Insert `6`

Append at index `4`.

Temporary array: `[1, 3, 9, 7, 6]`.

Parent value is `3`.

`6 >= 3`, so no swap occurs.

### Insert `2`

Append at index `5`.

Temporary array: `[1, 3, 9, 7, 6, 2]`.

Parent index is `2`, value `9`.

Swap to obtain `[1, 3, 2, 7, 6, 9]`.

The moved value `2` now has root `1` as parent.

`2 >= 1`, so sift-up stops.

Final heap: `[1, 3, 2, 7, 6, 9]`.

The array is not sorted because `3` appears before `2`.

It is a valid heap because every parent is no greater than its children.

### Remove the minimum

The minimum is root value `1`.

Move the last value `9` to the root and shrink the array.

Temporary array: `[9, 3, 2, 7, 6]`.

Root children are `3` and `2`.

Choose smaller child `2` at index `2`.

Swap to obtain `[2, 3, 9, 7, 6]`.

Index `2` has no children within the array.

Sift-down stops.

The removed value is `1`.

The new minimum is `2`.

### Continue removal order

Repeated `pop_min` operations return:

```text
1, 2, 3, 6, 7, 9
```

The heap exposes items in sorted order through repeated removal.

It does not store them in sorted array order between removals.

### Bottom-up heapify trace

Consider raw array `[7, 3, 9, 1, 6, 2]`.

The last internal index is `2`.

Sift index `2`: value `9` swaps with child `2`.

Array becomes `[7, 3, 2, 1, 6, 9]`.

Sift index `1`: value `3` swaps with child `1`.

Array becomes `[7, 1, 2, 3, 6, 9]`.

Sift index `0`: value `7` compares with children `1` and `2`.

Swap with `1` to get `[1, 7, 2, 3, 6, 9]`.

Continue at index `1`.

Swap `7` with smaller child `3`.

Final heap is `[1, 3, 2, 7, 6, 9]`.

It matches the insertion-built heap for this input, though identical heap arrays are not guaranteed generally.

## 4. Production-Ready Implementations

The implementation below uses a caller-provided key and a sequence number.

The sequence number makes equal priorities stable.

```python
from dataclasses import dataclass
from itertools import count
from typing import Callable, Generic, Iterable, TypeVar

T = TypeVar("T")
K = TypeVar("K")


@dataclass(frozen=True)
class _Entry(Generic[K, T]):
    priority: K
    sequence: int
    value: T


class MinPriorityQueue(Generic[T, K]):
    def __init__(self, key: Callable[[T], K]) -> None:
        self._key = key
        self._entries: list[_Entry[K, T]] = []
        self._sequence = count()

    def __len__(self) -> int:
        return len(self._entries)

    def _less(self, left: int, right: int) -> bool:
        a = self._entries[left]
        b = self._entries[right]
        return (a.priority, a.sequence) < (b.priority, b.sequence)

    def push(self, value: T) -> None:
        entry = _Entry(self._key(value), next(self._sequence), value)
        self._entries.append(entry)
        self._sift_up(len(self._entries) - 1)

    def peek(self) -> T:
        if not self._entries:
            raise IndexError("peek from an empty priority queue")
        return self._entries[0].value

    def pop(self) -> T:
        if not self._entries:
            raise IndexError("pop from an empty priority queue")

        root = self._entries[0]
        last = self._entries.pop()

        if self._entries:
            self._entries[0] = last
            self._sift_down(0)

        return root.value

    def _sift_up(self, index: int) -> None:
        while index > 0:
            parent = (index - 1) // 2
            if not self._less(index, parent):
                return
            self._entries[index], self._entries[parent] = (
                self._entries[parent],
                self._entries[index],
            )
            index = parent

    def _sift_down(self, index: int) -> None:
        size = len(self._entries)
        while True:
            left = 2 * index + 1
            right = left + 1
            best = index

            if left < size and self._less(left, best):
                best = left
            if right < size and self._less(right, best):
                best = right
            if best == index:
                return

            self._entries[index], self._entries[best] = (
                self._entries[best],
                self._entries[index],
            )
            index = best
```

The key is captured once at insertion.

Later mutation of the payload cannot silently change its stored priority.

If priorities must change, expose a deliberate update operation or insert a replacement entry.

### Execute the trace and stability rule

```python
numbers: MinPriorityQueue[int, int] = MinPriorityQueue(key=lambda value: value)
for value in [7, 3, 9, 1, 6, 2]:
    numbers.push(value)

assert numbers.peek() == 1
assert [numbers.pop() for _ in range(len(numbers))] == [1, 2, 3, 6, 7, 9]

tasks: MinPriorityQueue[tuple[int, str], int] = MinPriorityQueue(
    key=lambda task: task[0]
)
tasks.push((2, "first equal-priority task"))
tasks.push((1, "urgent task"))
tasks.push((2, "second equal-priority task"))

assert tasks.pop()[1] == "urgent task"
assert tasks.pop()[1] == "first equal-priority task"
assert tasks.pop()[1] == "second equal-priority task"
```

### Validate heap order

```python
def has_min_heap_order(entries: list[_Entry[K, T]]) -> bool:
    for child in range(1, len(entries)):
        parent = (child - 1) // 2
        parent_key = (entries[parent].priority, entries[parent].sequence)
        child_key = (entries[child].priority, entries[child].sequence)
        if parent_key > child_key:
            return False
    return True


check: MinPriorityQueue[int, int] = MinPriorityQueue(key=lambda value: value)
for value in [8, 4, 5, 1, 3, 9, 2]:
    check.push(value)
    assert has_min_heap_order(check._entries)

while check:
    check.pop()
    assert has_min_heap_order(check._entries)
```

Production tests should prefer public behavior where possible.

An internal invariant checker is still valuable for randomized mutation sequences.

## 5. Asymptotic Time & Space Complexity

A complete binary tree with $n$ nodes has height $O(\log n)$.

Sift-up crosses at most one edge per level.

Insertion therefore costs $O(\log n)$ in the worst case.

Sift-down also crosses at most one edge per level.

Removing the extremum costs $O(\log n)$.

Peeking at the root costs $O(1)$.

Searching for an arbitrary value costs $O(n)$ in the worst case.

Heap order cannot eliminate either subtree from a general equality search.

Building a heap by repeated insertion costs $O(n\log n)$.

Bottom-up heapify costs $O(n)$.

The linear bound follows because most nodes are near the leaves and move only a few levels.

One useful bound is:

$$
\sum_{h\ge 0}\frac{n}{2^{h+1}}O(h)=O(n).
$$

The array occupies $O(n)$ space.

Each individual sift uses $O(1)$ auxiliary space when iterative.

Stable priority entries add one sequence integer per item but keep total space $O(n)$.

| Operation | Worst-case time | Auxiliary space |
|---|---:|---:|
| `peek` | $O(1)$ | $O(1)$ |
| `push` | $O(\log n)$ | $O(1)$ |
| `pop` extremum | $O(\log n)$ | $O(1)$ |
| arbitrary search | $O(n)$ | $O(1)$ |
| repeated-insert build | $O(n\log n)$ | $O(1)$ beyond array |
| bottom-up heapify | $O(n)$ | $O(1)$ beyond array |

Dynamic array growth makes append amortized $O(1)$.

Occasional capacity expansion copies the array but does not change amortized insertion bounds.

## 6. Systems Connections

### Task scheduling

A scheduler may prioritize deadline, severity, or virtual runtime.

Equal priorities often require FIFO stability.

The sequence-number technique supplies that deterministic tie-break.

Real schedulers also need cancellation and priority updates.

A plain binary heap needs an index map for efficient arbitrary removal or update.

### Graph algorithms

Dijkstra and Prim repeatedly extract the smallest frontier key.

Many libraries avoid decrease-key by pushing a new `(distance, vertex)` entry.

When popped, an entry whose distance differs from the current best is stale and discarded.

This increases heap entries but simplifies indexing.

The complexity analysis must include those duplicate entries.

### Event simulation

Discrete-event simulators order future events by timestamp.

The heap root is the next event to execute.

A sequence key gives deterministic order to simultaneous events.

Determinism matters for reproducible simulation tests.

### Streaming top-k

To retain the largest $k$ items seen so far, maintain a min-heap of size at most $k$.

The root is the smallest retained item.

Discard incoming values no larger than the root.

Replace the root for larger values.

The memory cost is $O(k)$ and each accepted replacement costs $O(\log k)$.

### Multiway merge

Merging $k$ sorted streams uses a heap containing each stream's current head.

Every output removes one head and inserts the next item from the same stream.

For $N$ total items, the time is $O(N\log k)$.

### Memory locality

Array storage gives better locality than pointer-heavy tree nodes.

Parent and child indices are inexpensive to compute.

For large heaps, sift paths still jump geometrically through memory rather than scanning sequentially.

Branching and comparator cost can dominate for complex payloads.

Store small handles when moving full records is expensive.

### Concurrency boundary

A binary heap is not automatically thread-safe.

Concurrent mutations can corrupt both shape and order.

Use synchronization, ownership by one scheduler thread, or a concurrent priority-queue design.

Lock-free FIFO queues do not directly solve priority ordering.

## 7. Practice Checklist

- Decide whether minimum or maximum priority is exposed.
- Define the priority key independently from payload identity.
- Define deterministic behavior for equal priorities.
- Keep occupied array indices contiguous.
- Verify parent and child index formulas.
- Compare a new leaf only along its ancestor path.
- Compare a replacement root with both children.
- Swap downward with the higher-priority child.
- Stop sifting as soon as the local edge order is valid.
- Handle empty `peek` explicitly.
- Handle empty `pop` explicitly.
- Test one-element removal.
- Test ascending insertion order.
- Test descending insertion order.
- Test duplicate priorities.
- Test alternating insertions and removals.
- Check the invariant after every randomized mutation.
- Compare removal output with a reference sort.
- Avoid mutating stored priority fields invisibly.
- Add an index map if arbitrary updates must be logarithmic.
- Remove stale index-map entries after swaps and pops.
- Prefer bottom-up heapify for a complete initial batch.
- Do not claim arbitrary search is logarithmic.
- Distinguish binary heaps from binary search trees.
- Distinguish the data structure from heap memory allocation.
- Account for lazy duplicate entries in graph algorithms.
- Store sequence numbers when stable ordering matters.
- Bound queue growth when untrusted producers can enqueue freely.
- Synchronize concurrent access.
- Measure comparator and payload-movement costs for large workloads.

## 8. Frequently Asked Questions

### Is a binary heap a sorted array?

No.

Only parent-child order is guaranteed.

Repeated extremum removal produces sorted output, but the internal array is partially ordered.

### Why is the root always the minimum in a min-heap?

Every parent is no greater than its children.

Following any node's ancestor chain proves the root is no greater than that node.

### Why is arbitrary search $O(n)$?

If the target is larger than a node, it may still occur in either descendant subtree.

Heap order provides too little information to choose one branch.

### Why choose the smaller child during min-heap sift-down?

The new parent must be no greater than both children.

Swapping with the larger child could leave the smaller child above a larger parent and preserve a violation.

### Is heap construction really linear?

Bottom-up heapify is.

Most nodes are near the leaves and travel little or not at all, so the aggregate sift distance is $O(n)$.

Repeated insertion is $O(n\log n)$.

### How are equal priorities handled?

Basic heaps make no stability promise.

Add a monotone sequence number as a secondary comparison key to preserve insertion order among ties.

### Can priorities be changed after insertion?

Yes with a deliberate repair operation and usually an item-to-index map.

Changing a field without sifting can invalidate the heap.

### What is lazy deletion?

Insert a replacement entry and mark or recognize the older entry as stale when it reaches the root.

This avoids arbitrary deletion but may increase memory use.

### When is a balanced search tree preferable?

Use one when ordered iteration, predecessor/successor queries, or efficient arbitrary-key deletion matters alongside extremum access.

A heap is specialized for priority-queue operations.

### How does a max-heap differ?

It reverses the comparator so every parent is no smaller than its children.

The shape and sift mechanics remain the same.

### Can a heap be persisted directly?

The array can be serialized, but include comparator/key semantics and payload schema.

After loading untrusted data, validate or rebuild heap order before using the root as an extremum.
