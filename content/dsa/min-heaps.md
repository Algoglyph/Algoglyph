# Min-Heaps: Compact Priority Queues for Repeated Minimum Selection

![Min heap](/images/dsa/min-heaps-dark.jpg#dark)

A min-heap stores the smallest key at the root while maintaining only parent-child order.
Its complete-tree shape fits into an array, and updates repair one logarithmic path.
This makes it the standard priority queue behind shortest paths, event simulation, multiway merge, and top-$k$ processing.

## 1. Historical Context & Motivation

### Repeated minimum queries

Many algorithms alternate between adding candidates and removing the smallest current candidate.
Scanning an unsorted array makes every removal $O(n)$.
Keeping a sorted array makes arbitrary insertion $O(n)$ because elements shift.

A min-heap balances the two operations.
Minimum lookup is constant time, while insertion and minimum removal are logarithmic.

### Binary heap structure

J. W. J. Williams introduced binary heaps with heap sort in 1964.
The structure combines:

- a complete binary-tree shape;
- a min-heap order in which every parent is no greater than either child.

Completeness supplies logarithmic height and implicit indexing.
Heap order supplies the minimum at the root.

### Priority-queue interface

Common operations are:

- `push(key, value)`;
- `peek_min()`;
- `pop_min()`;
- `decrease_key(handle, key)`;
- `build(values)`;
- `replace_min(value)`;
- `push_pop(value)`.

Not every library exposes handles or decrease-key.
Graph algorithms often use lazy duplicate entries instead.

### Min-heap versus sorted order

A heap cannot efficiently answer predecessor, successor, or arbitrary rank questions.
It does not iterate in sorted order without destructive repeated pops.

Use a balanced search tree for dynamic ordered queries.
Use sorting when data is static and every ordered element is needed.
Use a heap when repeated access to one extreme dominates.

### Problem statement

Maintain a multiset of comparable priorities under insertion, minimum inspection, and removal of one minimum.
Duplicates are allowed.
Tie order is unspecified unless a secondary field makes it explicit.

## 2. Core Mathematical Invariants

### Array-to-tree mapping

For zero-based index $i$:

$$
left(i)=2i+1,
$$

$$
right(i)=2i+2,
$$

and for $i>0$,

$$
parent(i)=\left\lfloor\frac{i-1}{2}\right\rfloor.
$$

The active array prefix represents a complete tree.

### Min-heap order

Every existing child satisfies

$$
A[parent]\le A[child].
$$

Following any path downward never produces a value smaller than the root.
Therefore the root is a global minimum.

No ordering is required between siblings.
The second-smallest value must be one of the root's children, but deeper ranks do not have fixed positions.

### Height

A complete tree containing $n$ elements has height $\lfloor\log_2 n\rfloor$.
Every sift operation follows at most one path through that height.

### Insert invariant

Append the new element at the next free array position.
Completeness remains valid.
Only its edge to the parent can violate min-order.

While the new key is smaller than its parent, swap upward.
After each swap, only the next parent edge can remain invalid.

### Remove-min invariant

Save the root.
Move the last active element to index zero and shrink the array.
Completeness remains valid.
Only edges downward from the root can violate order.

Compare both children and swap with the smaller one.
Choosing the smaller child restores the parent relationship against both children at that level.

### Bottom-up build invariant

Leaves are valid one-node heaps.
Process internal indices from the last parent down to zero.
Before sifting node $i$, both child subtrees are heaps.
After sifting, the entire subtree rooted at $i$ is a heap.

### Stable priorities

Heaps are not inherently stable.
For FIFO among equal priorities, compare `(priority, sequence)` with increasing sequence values.
For LIFO ties, reverse the sequence comparison.

### Decrease-key invariant

When a known element's priority decreases, only its parent edge can become invalid.
Sift it upward.
Increasing a key instead requires sift-down.

External handles must follow swaps.
Otherwise a later update can target the wrong element.

### Lazy-entry invariant

Without decrease-key, insert a new `(priority,vertex)` entry.
When popping, discard entries whose priority no longer equals the current authoritative value.

The root is minimum among queued entries, including stale ones.
The validity check ensures only current entries influence algorithm state.

## 3. Step-by-Step Execution Trace

### Initial heap

Use

```text
[2, 5, 7, 9, 6, 11, 8]
```

Each parent is no greater than its children.
The minimum is two.

### Insert one

Append one at index seven:

```text
[2, 5, 7, 9, 6, 11, 8, 1]
```

Its parent at index three is nine.
Swap because one is smaller.

```text
[2, 5, 7, 1, 6, 11, 8, 9]
```

### Continue sift-up

Index three's parent is index one with value five.
Swap:

```text
[2, 1, 7, 5, 6, 11, 8, 9]
```

Index one's parent is root two.
Swap again:

```text
[1, 2, 7, 5, 6, 11, 8, 9]
```

The inserted key reaches the root.
Completeness never changed.

### Remove minimum

Save root one.
Move last value nine to the root and shorten:

```text
[9, 2, 7, 5, 6, 11, 8]
```

Children are two and seven.
Choose smaller child two and swap.

```text
[2, 9, 7, 5, 6, 11, 8]
```

### Continue sift-down

Nine's children are five and six.
Choose five and swap:

```text
[2, 5, 7, 9, 6, 11, 8]
```

Nine is a leaf.
Return one.

### Build trace

Build from unsorted array

```text
[9, 4, 7, 1, 3, 6, 2]
```

The last parent is index two with children six and two.
Swap seven with two:

```text
[9,4,2,1,3,6,7]
```

At index one, children are one and three.
Swap four with one:

```text
[9,1,2,4,3,6,7]
```

At root, children are one and two.
Swap nine with one.
Then compare nine with children four and three; swap with three.

Final heap is

```text
[1,3,2,4,9,6,7]
```

### Priority-queue trace

Insert tasks `(deadline,name)`:

```text
(5,"backup"), (2,"alert"), (4,"report")
```

The root becomes `(2,"alert")`.
After popping it, `(4,"report")` becomes minimum.
Heap order provides deadline priority without fully sorting after every insertion.

### Dijkstra lazy-entry trace

Suppose vertex `v` first receives distance ten and later distance six.
Push both `(10,v)` and `(6,v)`.
The six-entry pops first and settles `v`.
When ten later reaches the root, compare it with authoritative distance six and discard it as stale.

## 4. Production-Ready Implementations

### Python min-heap

```python
from collections.abc import Iterable
from typing import Generic, TypeVar


T = TypeVar("T")


class MinHeap(Generic[T]):
    def __init__(self, values: Iterable[T] = ()) -> None:
        self._data = list(values)
        for index in range((len(self._data) - 2) // 2, -1, -1):
            self._sift_down(index)

    def __len__(self) -> int:
        return len(self._data)

    def push(self, value: T) -> None:
        self._data.append(value)
        index = len(self._data) - 1
        while index > 0:
            parent = (index - 1) // 2
            if self._data[parent] <= self._data[index]:
                break
            self._data[parent], self._data[index] = self._data[index], self._data[parent]
            index = parent

    def minimum(self) -> T:
        if not self._data:
            raise IndexError("minimum from empty heap")
        return self._data[0]

    def pop_minimum(self) -> T:
        if not self._data:
            raise IndexError("pop from empty heap")
        result = self._data[0]
        last = self._data.pop()
        if self._data:
            self._data[0] = last
            self._sift_down(0)
        return result

    def _sift_down(self, index: int) -> None:
        size = len(self._data)
        while True:
            left = 2 * index + 1
            right = left + 1
            smallest = index
            if left < size and self._data[left] < self._data[smallest]:
                smallest = left
            if right < size and self._data[right] < self._data[smallest]:
                smallest = right
            if smallest == index:
                return
            self._data[index], self._data[smallest] = self._data[smallest], self._data[index]
            index = smallest


heap = MinHeap([9, 4, 7, 1, 3, 6, 2])
heap.push(0)
assert [heap.pop_minimum() for _ in range(8)] == [0, 1, 2, 3, 4, 6, 7, 9]
```

### Stable task keys

```python
from dataclasses import dataclass, field
from itertools import count


sequence = count()


@dataclass(order=True)
class Task:
    priority: int
    order: int = field(init=False)
    name: str = field(compare=False)

    def __post_init__(self) -> None:
        self.order = next(sequence)
```

Sequence participates after priority, while task name does not affect order.

### Use standard libraries

Python's `heapq`, C++ `priority_queue` with an appropriate comparator, and other standard containers are preferable for ordinary use.
Check whether the library is min-first or max-first.
Comparator inversion is a frequent integration bug.

### Mutable handles

An indexed heap stores a map from item identifier to array index.
Every swap updates two map entries.
Deletion and priority changes then cost $O(\log n)$ once the index is known.

### Stale entries

Lazy duplication simplifies code but can grow the queue beyond the number of logical items.
Worst-case memory follows the number of successful updates.
Periodic rebuilding can discard stale entries when they dominate.

## 5. Asymptotic Time & Space Complexity

### Main operations

Minimum lookup is $O(1)$.
Insertion is $O(\log n)$ worst case.
Minimum removal is $O(\log n)$ worst case.

Building from $n$ arbitrary values with bottom-up heapify is $O(n)$.
Repeated insertion takes $O(n\log n)$ worst case.

### Why build is linear

Nodes at height $h$ number at most about $n/2^{h+1}$.
Their sift cost is $O(h)$.
Summing

$$
\sum_{h\ge0}\frac{n}{2^{h+1}}h
$$

gives $O(n)$.

### Space

The array uses $O(n)$ storage and no node pointers.
Sift operations use $O(1)$ auxiliary state iteratively.
Dynamic-array capacity can reserve additional constant-factor storage.

### Top-k

To retain the $k$ largest stream values, maintain a min-heap of size $k$.
Each accepted replacement costs $O(\log k)$.
Total time is $O(n\log k)$ and space $O(k)$.

### Multiway merge

Merging $k$ sorted sequences with $N$ total items keeps one candidate per nonempty sequence.
Each pop and replacement costs $O(\log k)$.
Total time is $O(N\log k)$ and heap space is $O(k)$.

### Lazy Dijkstra

Without decrease-key, up to $O(E)$ entries can be pushed.
Heap operations cost $O(\log E)$, commonly simplified to $O(\log V)$ for simple-graph asymptotics up to constant factors in logs.
Memory can reach $O(E)$.

## 6. Systems Connections

### Dijkstra's algorithm

The heap selects the unsettled vertex with minimum tentative distance.
Nonnegative edge weights are required for the greedy settlement proof.
Stale-entry checks are necessary in lazy implementations.

### Event simulation

Events are keyed by timestamp.
The earliest event is removed, processed, and may schedule later events.
Equal-time ordering must be explicit when it affects simulation behavior.

### Multiway merge

Place the first item from each sorted source in a min-heap.
Pop the smallest, emit it, and push the next item from the same source.
This powers external merge and sorted-stream combination.

### Top-k largest values

A bounded min-heap keeps the best $k$ largest values.
The root is the smallest retained candidate and therefore the next one to replace.

### Timers

Timer queues select the earliest deadline.
Cancellation and clock changes complicate the container.
Hierarchical timing wheels may outperform heaps for bounded timer distributions.

### Concurrency

A binary heap mutates root and paths under updates.
Concurrent priority queues often use locks, multiple heaps, or relaxed ordering to improve throughput.
Strict global minimum semantics create contention.

### Security

Validate comparator consistency and numeric priorities.
Bound queued items.
Avoid subtraction comparators that overflow fixed-width integers.

### D-ary min-heaps

A d-ary heap gives each node $d$ children rather than two.
Its height becomes $O(\log_d n)$, reducing levels during decrease-key.
Sift-down must inspect up to $d$ children per level to choose the minimum.

Larger $d$ can help workloads with many priority decreases and fewer removals.
It can also improve cache layout for some graph algorithms.
The best branching factor is workload- and machine-dependent.
Benchmark it instead of assuming binary or four-way branching is universally fastest.

## 7. Practice Checklist

### Representation

- Keep nodes in one active array prefix.
- Use zero-based formulas consistently.
- Define comparator direction.
- Define tie behavior.
- Define empty operations.
- Define ownership of values.

### Push

- Append at next position.
- Compare with parent.
- Swap while smaller.
- Update handles.
- Stop when order holds.
- Test a new global minimum.

### Pop

- Save root.
- Move last to root.
- Handle singleton case.
- Compare both children.
- Choose smaller child.
- Sift until valid.
- Return saved item.

### Build

- Begin at last parent.
- Process toward root.
- Use sift-down.
- Validate every edge.
- Compare output pops with sorting.
- Test non-power-of-two sizes.

### Advanced use

- Define handle invalidation.
- Update handle positions on swaps.
- Detect stale lazy entries.
- Bound duplicate growth.
- Use sequence numbers for stable ties.
- Rebuild when stale entries dominate.

## 8. Frequently Asked Questions

### Where is the minimum?

At array index zero in every nonempty min-heap.

### Is the array sorted?

No.
Only parent-child order is guaranteed.

### Why is pop logarithmic?

The replacement root descends at most the complete tree's logarithmic height.

### Why choose the smaller child?

The moved key must be no greater than both children after repair.
Swapping with the larger child can leave the smaller above it.

### Can a min-heap find the maximum quickly?

The maximum lies among leaves and can require scanning $O(n)$ values.

### Are duplicates supported?

Yes.
Add a secondary sequence key when stable order matters.

### How is decrease-key implemented?

Lower a known element's priority and sift it upward, updating any index handles during swaps.

### What if the library has no decrease-key?

Push a new entry and discard stale entries when popped, or implement an indexed heap.

### Why is heapify $O(n)$?

Most nodes are near leaves and can move only a short distance; aggregate height work forms a convergent weighted sum.

### Can two binary heaps be melded efficiently?

Concatenate their arrays and heapify in linear combined size.
If meld is frequent, use a meldable heap structure.

### Is a priority queue always a heap?

No.
A heap is one implementation; trees, buckets, and other structures can implement priority queues.

### What is the most common bug?

Using max-heap comparator semantics accidentally or choosing the larger child during min-heap sift-down.

### What should I study next?

Study indexed heaps, d-ary heaps, multiway merging, Dijkstra, top-k algorithms, and meldable priority queues.
