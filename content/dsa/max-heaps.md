# Max-Heaps: Maintaining the Largest Priority at the Root

![Max heap](/images/dsa/max-heaps-dark.png#dark)

A max-heap stores a partial order in which every parent is at least as large as its children.
The largest key is therefore available at the root in constant time.
Insertion and removal repair only one root-to-leaf path, giving logarithmic updates in a compact array representation.

## 1. Historical Context & Motivation

### Priority is not full sorting

Many systems repeatedly need the current largest item but do not need all items sorted.
A scheduler may choose the highest priority task.
A stream processor may retain the smallest $k$ values by ejecting the largest retained value.
Heap sort repeatedly extracts maxima to build sorted order.

Maintaining a completely sorted array makes insertion expensive.
Leaving values unsorted makes maximum lookup expensive.
A heap preserves only the comparisons needed for efficient priority operations.

### Williams's heap structure

J. W. J. Williams introduced binary heaps and heap sort in 1964.
A binary heap is a complete binary tree.
Completeness packs all levels except possibly the last and fills the last from left to right.

The shape enables implicit array storage with no child pointers.
Heap order supplies the priority guarantee.
These are independent invariants.

### Core operations

A max-heap commonly supports:

- inspect maximum;
- insert a key;
- remove maximum;
- increase a key through a handle or index;
- build from an array;
- replace the root;
- sort in place through repeated extraction.

Arbitrary search remains $O(n)$ because heap order does not identify which child contains a target.

### Max versus min

A max-heap places the largest key at the root.
A min-heap places the smallest.
Negating numeric keys can simulate one with the other, but negation can overflow fixed-width minimum integers and obscures composite ordering.
A comparator is the cleaner general abstraction.

### Appropriate uses

Use a max-heap when one end of an evolving priority order matters.
Use a balanced search tree when ordered iteration, predecessor, or arbitrary deletion by key matters.
Use a sorted array for immutable data with many binary searches.
Use a meldable heap if combining queues dominates.

## 2. Core Mathematical Invariants

### Complete-tree shape

For zero-based array index $i$:

$$
parent(i)=\left\lfloor\frac{i-1}{2}\right\rfloor
$$

for $i>0$,

$$
left(i)=2i+1,
$$

$$
right(i)=2i+2.
$$

Indices below array length correspond exactly to tree nodes.

### Heap-order invariant

For every node and existing child,

$$
A[parent]\ge A[child].
$$

By transitivity, the root is at least every descendant.
Thus `A[0]` is a maximum.

Siblings have no required order.
An array sorted level by level is not necessarily globally sorted.

### Height bound

A complete binary tree with $n$ nodes has height

$$
\lfloor\log_2 n\rfloor.
$$

Sift-up and sift-down touch at most one node per level.
Their worst-case time is $O(\log n)$.

### Insertion invariant

Append the new key at the next complete-tree position.
Shape remains valid.
Only the edge between the new node and its parent may violate heap order.

While the child exceeds its parent, swap them.
After each swap, the moved key may violate only its new parent edge.
All other edges remain valid.

### Removal invariant

To remove the maximum, save the root and move the last array element to index zero.
Removing the last position preserves completeness.
Only edges from the new root downward may violate order.

Swap it with the larger child while that child is larger.
Choosing the larger child is essential: swapping with the smaller could leave the larger child above the moved value.

### Build-heap invariant

Every leaf is already a valid heap.
Process internal nodes from the last parent down to zero.
Before sifting index $i$, both child subtrees are heaps.
Sift-down then makes the subtree rooted at $i$ a heap.

After processing root zero, the entire array is a heap.

### Duplicate priorities

Equality satisfies max-heap order.
The structure is not stable.
For FIFO behavior among equal priorities, compare composite keys such as `(priority, -sequence)` according to desired semantics.

### Handle invariant

If arbitrary priority updates use external handles, each handle must track the element's current array index.
Every swap must update both involved handles.
Stale indices can modify the wrong entry even though the heap remains structurally valid.

## 3. Step-by-Step Execution Trace

### Initial heap

Use array

```text
[90, 70, 60, 40, 50, 20, 30]
```

Its tree is complete.
Every parent is at least its children.

### Insert 80

Append at index seven:

```text
[90, 70, 60, 40, 50, 20, 30, 80]
```

Completeness holds.
Index seven's parent is index three with value forty.
Heap order fails on that edge.

### First sift-up swap

Swap eighty and forty:

```text
[90, 70, 60, 80, 50, 20, 30, 40]
```

Eighty is now at index three.
Its parent is index one with value seventy.
Order still fails.

### Second sift-up swap

Swap eighty and seventy:

```text
[90, 80, 60, 70, 50, 20, 30, 40]
```

Eighty's parent is ninety.
Since $90\ge80$, stop.

Only two root-path edges changed.

### Remove maximum

The maximum is ninety at index zero.
Save it for return.
Move last value forty to the root and shorten the array:

```text
[40, 80, 60, 70, 50, 20, 30]
```

The root violates order with both children.

### First sift-down swap

Children are eighty and sixty.
Choose the larger child, eighty.
Swap:

```text
[80, 40, 60, 70, 50, 20, 30]
```

Forty is now at index one.

### Second sift-down swap

Children of index one are seventy and fifty.
Choose seventy and swap:

```text
[80, 70, 60, 40, 50, 20, 30]
```

Forty is a leaf.
Return ninety.

### Build from unsorted input

Use

```text
[4, 10, 3, 5, 1]
```

The last parent is index one.
Sift ten against children five and one; no change.

At root index zero, children are ten and three.
Swap four with ten:

```text
[10, 4, 3, 5, 1]
```

Then swap four with child five:

```text
[10, 5, 3, 4, 1]
```

The array is now a max-heap.

### Why it is not sorted

In the final heap, five appears before three, but four appears after three.
Heap order only constrains ancestor relationships.
Sorted iteration requires repeated extraction or another structure.

## 4. Production-Ready Implementations

### Python max-heap

```python
from collections.abc import Iterable
from typing import Generic, TypeVar


T = TypeVar("T")


class MaxHeap(Generic[T]):
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
            if self._data[parent] >= self._data[index]:
                break
            self._data[parent], self._data[index] = self._data[index], self._data[parent]
            index = parent

    def maximum(self) -> T:
        if not self._data:
            raise IndexError("maximum from empty heap")
        return self._data[0]

    def pop_maximum(self) -> T:
        if not self._data:
            raise IndexError("pop from empty heap")
        maximum = self._data[0]
        last = self._data.pop()
        if self._data:
            self._data[0] = last
            self._sift_down(0)
        return maximum

    def _sift_down(self, index: int) -> None:
        size = len(self._data)
        while True:
            left = 2 * index + 1
            right = left + 1
            largest = index
            if left < size and self._data[left] > self._data[largest]:
                largest = left
            if right < size and self._data[right] > self._data[largest]:
                largest = right
            if largest == index:
                return
            self._data[index], self._data[largest] = self._data[largest], self._data[index]
            index = largest


heap = MaxHeap([4, 10, 3, 5, 1])
heap.push(8)
assert [heap.pop_maximum() for _ in range(6)] == [10, 8, 5, 4, 3, 1]
```

### Heap validator

```python
def is_max_heap(values: list[int]) -> bool:
    for child in range(1, len(values)):
        parent = (child - 1) // 2
        if values[parent] < values[child]:
            return False
    return True
```

Randomized tests can compare popped output with reverse sorting.

### Standard-library choices

Prefer established library heaps unless custom handles or policies are needed.
When a library exposes only min-heap operations, wrap keys with reversed comparison rather than relying blindly on numeric negation.

### Exception safety

Comparator exceptions during swaps can leave custom containers partially modified.
Production generic containers need a documented exception guarantee.
Educational implementations usually assume comparison is pure and nonthrowing.

### Bounded top-k pattern

To retain the $k$ smallest values, use a max-heap of size at most $k$.
If a new value is smaller than the root, replace the root.
At completion, the heap contains the $k$ smallest values in unspecified internal order.

## 5. Asymptotic Time & Space Complexity

### Lookup and updates

Maximum lookup is $O(1)$.
Insertion is $O(\log n)$ worst case.
Maximum removal is $O(\log n)$ worst case.

Arbitrary search is $O(n)$.
Deleting a known index is $O(\log n)$ after replacing it with the final element and choosing sift direction.

### Build heap

Repeated insertion gives $O(n\log n)$.
Bottom-up heap construction is $O(n)$.

Most nodes lie near the leaves and move only a small distance.
The aggregate work is bounded by

$$
\sum_{h\ge0}\frac{n}{2^{h+1}}O(h)=O(n).
$$

### Heap sort

Build a max-heap in $O(n)$.
Repeatedly swap the root with the end of the active range and sift down.
There are $n-1$ logarithmic removals, so total time is $O(n\log n)$.

In-place heap sort uses $O(1)$ auxiliary array space.
It is not stable.

### Storage

An array heap stores $n$ elements in $O(n)$ space.
No child pointers are required.
Dynamic-array capacity can exceed logical size by a constant factor.

### Cache behavior

Arrays offer good locality compared with node heaps.
Sift paths jump by powers of two and are less sequential than scans.
Branching and comparator cost influence measured performance.

## 6. Systems Connections

### Priority scheduling

A max-heap can select the highest priority ready job.
Real schedulers also need fairness, aging, cancellation, and concurrency.
Priority alone can starve low-priority work.

### Top-k streaming

A size-$k$ max-heap retains the $k$ smallest observations in $O(n\log k)$ time and $O(k)$ memory.
The root is the current rejection threshold.

### Heap sort

Max-heaps produce ascending in-place heap sort by moving each maximum to the end.
Merge sort is stable but needs extra array storage in common implementations.
Quick sort often has better locality but a different worst-case story.

### Event and graph algorithms

Many algorithms need minimum rather than maximum priority.
Use a min-heap directly instead of reversing semantics throughout the code.
Clear naming prevents subtle comparator mistakes.

### Mutable priorities

Schedulers may increase a waiting job's effective priority.
With an index handle, increase-key sifts upward.
Without handles, lazy insertion can leave stale copies that must be detected during removal.

### Concurrency

Root updates and array swaps mutate shared structure.
A normal heap is not thread-safe.
Concurrent priority queues require locking, partitioning, or specialized relaxed designs.

### Security

Untrusted priority values can exploit comparator bugs such as integer subtraction overflow.
Use relational comparison rather than `a-b` in fixed-width comparators.
Bound queue size to prevent memory exhaustion.

### Root replacement operations

Some workloads repeatedly compare one candidate with the current maximum.
`replace_max(x)` returns the old root, writes $x$ at the root, and sifts downward.
It performs one $O(\log n)$ repair instead of a pop followed by a push.

For a bounded heap retaining the $k$ smallest values, first compare $x$ with the root.
If $x$ is not smaller, reject it without mutation.
If it is smaller, replace the root and sift down.

`push_pop(x)` has different semantics: conceptually insert, then remove the maximum.
When $x$ exceeds the current root, the pushed value itself is immediately returned and the heap need not change.

Name these operations carefully because reversing the comparison silently corrupts top-$k$ selection.
Test both candidates below and above the current root.
Verify rejected candidates leave the heap byte-for-byte unchanged when that guarantee matters.

## 7. Practice Checklist

### Representation

- Use zero-based formulas consistently.
- Keep active nodes contiguous.
- Preserve complete-tree shape.
- Define comparator semantics.
- Define duplicate tie behavior.
- Define empty-operation behavior.

### Insert

- Append at the end.
- Compare with parent.
- Swap only while larger.
- Update handles on every swap.
- Stop at root or valid edge.
- Test a new maximum.

### Remove maximum

- Save root.
- Move last element to root.
- Handle one-element heap.
- Compare both children.
- Choose the larger child.
- Stop when order holds.
- Return saved maximum.

### Build and validate

- Start at last internal node.
- Process indices downward.
- Validate every parent-child edge.
- Compare pop sequence with sorting.
- Test duplicates.
- Test random arrays.

### Edge cases

- Empty heap.
- One element.
- Two elements.
- Ascending insertion.
- Descending insertion.
- All equal keys.
- Custom records.
- Comparator ties.
- Capacity growth.

## 8. Frequently Asked Questions

### Is a max-heap sorted?

No.
Only each parent-child relationship is ordered.

### Where is the maximum?

At array index zero for a nonempty max-heap.

### Why is insertion logarithmic?

The appended key moves through at most the complete tree's logarithmic height.

### Why choose the larger child during sift-down?

The moved key must end above both children.
Swapping with the smaller can leave the larger child violating heap order.

### Can a max-heap find the minimum quickly?

The minimum is somewhere among the leaves and can require $O(n)$ inspection.

### Is build-heap really linear?

Yes.
Most nodes are close to leaves and perform little sift work; summing work by height gives $O(n)$.

### Are duplicate keys allowed?

Yes.
The heap is not stable unless ties include an explicit sequence field.

### How do I implement increase-key?

Update a known index to a larger key and sift upward, maintaining any external index handles during swaps.

### Can I merge two binary heaps quickly?

Concatenate arrays and rebuild in linear combined size.
For frequent melds, consider a meldable heap.

### Why not negate every key?

Negation can overflow and does not generalize cleanly to records.
Use a reversed comparator or wrapper.

### Is heap sort stable?

No.
Root swaps can reorder equal keys.

### What is the most common indexing bug?

Mixing one-based formulas with zero-based arrays or failing to check whether the right child exists.

### What should I study next?

Study min-heaps, heap sort, indexed priority queues, d-ary heaps, and meldable heaps.
