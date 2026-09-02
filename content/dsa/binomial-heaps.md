# Binomial Heaps: Degree-Unique Forests, Binary Carry & Meldable Priority Queues

## 1. Historical Context & Motivation

A binary heap gives efficient minimum access and insertion, but merging two ordinary array heaps is not its strongest operation.

Concatenating arrays and rebuilding costs linear time in their combined size.

A **binomial heap** organizes a priority queue as a forest designed for logarithmic meld.

Each tree has a power-of-two size.

At most one root of each degree appears in a valid forest.

Melding two forests then resembles adding binary numbers.

Two equal-degree trees collide like two one-bits in the same position.

Linking them creates one tree of the next degree, which acts as a carry.

The structure is named after binomial trees, whose level sizes follow binomial coefficients.

It is an important bridge between elementary heaps and more elaborate meldable structures such as Fibonacci heaps.

Its forest representation supports insertion, minimum extraction, key decrease, and destructive meld without rebuilding every element.

The trade-off is pointer-rich structure and more complex invariants than an array heap.

Finding the minimum requires scanning roots unless a cached minimum pointer is maintained.

Extracting it removes one root and melds all of its child trees back into the forest.

Decrease-key moves an entry upward by heap-order repair.

If entries are swapped between nodes, external handles must follow the logical entry rather than assume node identity never changes.

This article uses explicit handle objects and updates their node references during swaps.

Binomial heaps are valuable when meld is part of the workload contract.

For a standalone priority queue with no meld, a contiguous binary heap often has better locality and smaller constants.

Theoretical operation bounds do not erase allocation, pointer chasing, or garbage-collection cost.

The central mechanism is:

**represent forest degrees as occupied binary positions and resolve every duplicate degree by one heap-ordered link.**

## 2. Core Mathematical Invariants

### Binomial tree definition

The degree-zero binomial tree $B_0$ contains one node.

For $k\ge1$, tree $B_k$ is formed by linking roots of two $B_{k-1}$ trees, making one root a child of the other.

The winning root is chosen by heap priority.

### Size

Tree $B_k$ contains:

$$
2^k
$$

nodes.

The claim follows by induction.

$B_0$ has $1=2^0$ node.

Linking two $B_{k-1}$ trees gives:

$$
2^{k-1}+2^{k-1}=2^k.
$$

### Root degree and children

The root of $B_k$ has degree $k$.

Its child subtrees have degrees:

$$
0,1,\ldots,k-1
$$

in some stored order.

The implementation stores them in increasing degree order.

Appending one $B_k$ loser while linking two degree-$k$ roots therefore creates the child list required for $B_{k+1}$.

### Level counts

The number of nodes at depth $i$ in $B_k$ is:

$$
\binom{k}{i}.
$$

Pascal's identity matches the recursive link construction:

$$
\binom{k}{i}=\binom{k-1}{i}+\binom{k-1}{i-1}.
$$

Summing a row gives total size:

$$
\sum_{i=0}^{k}\binom{k}{i}=2^k.
$$

### Heap order

For a min-oriented heap, every parent entry key is no greater than each child entry key.

Thus the minimum entry of one binomial tree is at its root.

The minimum entry of the whole forest is among its roots.

No ordering is promised between siblings or across unrelated trees.

### Unique-degree forest

A valid binomial heap contains at most one tree of each degree.

If heap size is:

$$
n=\sum_k b_k2^k,
$$

where $b_k\in\{0,1\}$ are binary digits, then the heap has a degree-$k$ root exactly when $b_k=1$.

The number of roots is at most:

$$
\lfloor\log_2 n\rfloor+1
$$

for nonempty $n$.

### Link transition

Two roots may be linked only when they have equal degree.

Compare their root keys.

The smaller root remains a root.

The larger root becomes its child.

The winner's degree increases by one.

Heap order is preserved because the winner key is no larger than the loser's root, and both original subtrees were already heap ordered.

### Binary-carry invariant

When inserting a tree of degree $d$ into a forest:

- if degree $d$ is empty, store it and stop;
- if occupied, remove the existing tree, link the pair, and carry a degree-$d+1$ tree.

Every completed step leaves degrees below the carry unique.

The process terminates because the degree increases at each collision.

### Handle invariant

Each live logical entry owns a handle.

The handle points to the node currently storing that entry.

Each node points back to the same handle.

Decrease-key may swap handles between a child and parent node.

Both handle-to-node references must be updated in the same operation.

An extracted handle becomes inactive and cannot be decreased again.

### Ownership invariant

Each node belongs to exactly one tree in one heap.

Each non-root node has one parent.

Roots have no parent.

No node identity is repeated, and total reachable nodes equal stored size.

Destructive meld transfers ownership and empties the donor heap to prevent aliases between two mutable heap objects.

## 3. Step-by-Step Execution Trace

### Insert keys

Insert:

```text
12, 7, 25, 15, 3, 18, 5
```

Represent occupied root degrees as binary positions.

### Insert `12`

Create one $B_0$ tree rooted at `12`.

Forest degrees:

```text
0 -> 12
```

Size one has binary form `1`.

### Insert `7`

A new degree-zero tree collides with root `12`.

Link them.

`7` becomes parent because it is smaller.

The result is one $B_1$:

```text
7
└─12
```

Forest degree one is occupied.

Size two has binary form `10`.

### Insert `25`

Degree zero is empty, so store `25` without a link.

Forest:

```text
degree 0: 25
degree 1: 7
```

Size three has binary form `11`.

### Insert `15`

The new degree-zero tree collides with `25`.

Link them under root `15`, producing degree one.

Degree one already contains root `7`, so another collision occurs.

Compare `15` and `7`.

Root `7` wins and receives the degree-one tree rooted at `15` as its next child.

The resulting $B_2$ contains four nodes:

```text
7
├─12
└─15
  └─25
```

Only degree two is occupied.

Size four has binary form `100`.

This is exactly a two-position carry cascade.

### Insert `3`, `18`, and `5`

Insert `3` into empty degree zero.

Insert `18`; it links with `3`, and `3` becomes a degree-one root with child `18`.

Insert `5` into degree zero.

Final forest before extraction:

```text
degree 0: root 5
degree 1: root 3 with child 18
degree 2: root 7 with subtree {12,15,25}
```

Size seven has binary form `111`, matching degrees zero, one, and two.

The global minimum is root `3`.

### Decrease `25` to `2`

Entry `25` is stored below `15`, which is below `7`.

Change its key to `2`.

Heap order is violated with parent `15`.

Swap logical entries `2` and `15`; update both handles.

The decreased entry now sits at the former `15` node, below root `7`.

`2 < 7`, so swap entries again.

The handle for the decreased entry now points to the degree-two root.

The tree shape and degrees do not change.

Only entries move between nodes.

### Extract minimum `2`

Scan roots `5`, `3`, and `2`.

Remove the degree-two root containing `2`.

Its child trees have degrees zero and one.

Detach them from the removed parent.

Meld each child tree into the remaining forest.

Degree zero collides with root `5`, producing a carry.

That degree-one carry collides with the existing degree-one root `3`.

The result becomes a new degree-two tree.

The extracted handle is marked inactive.

Heap size decreases from seven to six.

Binary size changes from `111` to `110`, so degrees one and two are occupied after consolidation.

The next minimum is again found among those roots.

## 4. Production-Ready Implementations

This Python implementation provides insertion, minimum lookup, destructive meld, handle-aware decrease-key, minimum extraction, and structural validation.

Meld requires matching heap policies and empties the donor.

```python
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Generic, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")


@dataclass(slots=True)
class Handle(Generic[K, V]):
    key: K
    value: V
    node: Optional["_Node[K, V]"] = None


@dataclass(slots=True)
class _Node(Generic[K, V]):
    entry: Handle[K, V]
    parent: Optional["_Node[K, V]"] = None
    children: list["_Node[K, V]"] = field(default_factory=list)

    @property
    def degree(self) -> int:
        return len(self.children)


class BinomialHeap(Generic[K, V]):
    def __init__(self) -> None:
        self._roots: dict[int, _Node[K, V]] = {}
        self._size = 0

    def __len__(self) -> int:
        return self._size

    @staticmethod
    def _link(left: _Node[K, V], right: _Node[K, V]) -> _Node[K, V]:
        if left.degree != right.degree:
            raise AssertionError("only equal-degree trees may be linked")
        if right.entry.key < left.entry.key:
            left, right = right, left
        right.parent = left
        left.children.append(right)
        return left

    def _add_tree(self, tree: _Node[K, V]) -> None:
        tree.parent = None
        while tree.degree in self._roots:
            other = self._roots.pop(tree.degree)
            tree = self._link(other, tree)
        self._roots[tree.degree] = tree

    def insert(self, key: K, value: V) -> Handle[K, V]:
        handle = Handle(key, value)
        node = _Node(handle)
        handle.node = node
        self._add_tree(node)
        self._size += 1
        return handle

    def minimum(self) -> tuple[K, V]:
        if not self._roots:
            raise IndexError("minimum from empty heap")
        root = min(self._roots.values(), key=lambda node: node.entry.key)
        return root.entry.key, root.entry.value

    def meld_from(self, other: "BinomialHeap[K, V]") -> None:
        if other is self:
            raise ValueError("heap cannot meld with itself")
        transferred = list(other._roots.values())
        for tree in transferred:
            self._add_tree(tree)
        self._size += other._size
        other._roots.clear()
        other._size = 0

    def decrease_key(self, handle: Handle[K, V], new_key: K) -> None:
        node = handle.node
        if node is None:
            raise ValueError("handle is no longer active")
        if handle is not node.entry:
            raise AssertionError("handle/node backlink is inconsistent")
        if handle.key < new_key:
            raise ValueError("new key must not be greater")
        handle.key = new_key
        while node.parent is not None and node.entry.key < node.parent.entry.key:
            parent = node.parent
            node.entry, parent.entry = parent.entry, node.entry
            node.entry.node = node
            parent.entry.node = parent
            node = parent

    def extract_min(self) -> tuple[K, V]:
        if not self._roots:
            raise IndexError("extract from empty heap")
        degree, root = min(
            self._roots.items(),
            key=lambda item: item[1].entry.key,
        )
        del self._roots[degree]
        result = (root.entry.key, root.entry.value)
        root.entry.node = None
        for child in root.children:
            child.parent = None
            self._add_tree(child)
        root.children = []
        self._size -= 1
        return result

    def validate(self) -> None:
        seen: set[int] = set()

        def audit(node: _Node[K, V], expected_degree: int) -> int:
            identity = id(node)
            if identity in seen:
                raise AssertionError("cycle or shared node detected")
            seen.add(identity)
            if node.degree != expected_degree:
                raise AssertionError("node degree does not match binomial position")
            if node.entry.node is not node:
                raise AssertionError("entry handle does not point back to node")
            count = 1
            for child_degree, child in enumerate(node.children):
                if child.parent is not node:
                    raise AssertionError("child parent pointer is incorrect")
                if child.entry.key < node.entry.key:
                    raise AssertionError("min-heap order is violated")
                count += audit(child, child_degree)
            return count

        count = 0
        for degree, root in self._roots.items():
            if root.parent is not None:
                raise AssertionError("forest root has a parent")
            if root.degree != degree:
                raise AssertionError("root stored under wrong degree")
            count += audit(root, degree)
        if count != self._size:
            raise AssertionError("stored size does not match reachable nodes")
        represented_size = sum(1 << degree for degree in self._roots)
        if represented_size != self._size:
            raise AssertionError("root degrees do not encode heap size")
```

### Verify the worked trace

```python
heap: BinomialHeap[int, str] = BinomialHeap()
handles = {}
for key in [12, 7, 25, 15, 3, 18, 5]:
    handles[key] = heap.insert(key, f"v{key}")
    heap.validate()

assert len(heap) == 7
assert heap.minimum() == (3, "v3")
heap.decrease_key(handles[25], 2)
heap.validate()
assert heap.minimum() == (2, "v25")
assert heap.extract_min() == (2, "v25")
assert handles[25].node is None
heap.validate()
assert len(heap) == 6
```

### Verify destructive meld and sorted extraction

```python
left: BinomialHeap[int, int] = BinomialHeap()
right: BinomialHeap[int, int] = BinomialHeap()
for key in [9, 1, 14, 6]:
    left.insert(key, key)
for key in [8, 2, 11, 4, 7]:
    right.insert(key, key)

left.meld_from(right)
assert len(right) == 0
left.validate()

ordered = []
while len(left):
    ordered.append(left.extract_min()[0])
    left.validate()
assert ordered == [1, 2, 4, 6, 7, 8, 9, 11, 14]
```

### Differential randomized verification

```python
import heapq
import random

rng = random.Random(20260830)
subject: BinomialHeap[tuple[int, int], int] = BinomialHeap()
reference: list[tuple[tuple[int, int], int]] = []

for serial in range(2_000):
    priority = (rng.randrange(-20_000, 20_001), serial)
    subject.insert(priority, serial)
    heapq.heappush(reference, (priority, serial))
    if rng.random() < 0.35:
        assert subject.extract_min() == heapq.heappop(reference)
    subject.validate()

while reference:
    assert subject.extract_min() == heapq.heappop(reference)
    subject.validate()
```

The composite `(priority, serial)` key gives the differential test a deterministic tie policy.

## 5. Asymptotic Time & Space Complexity

Let $n$ be heap size.

The forest has at most $\lfloor\log_2 n\rfloor+1$ roots.

### Insertion

Insertion adds one degree-zero tree.

A carry can pass through every occupied degree.

Worst-case time is $O(\log n)$.

If insertions are analyzed amortized using binary-counter bit flips, the number of links per insertion is $O(1)$ amortized.

The implementation still advertises the worst-case bound unless its API explicitly promises amortized behavior.

### Minimum

Without a cached minimum root, scan all roots.

Time is $O(\log n)$.

Caching a minimum pointer can make lookup $O(1)$, but meld, decrease, and extraction must maintain it.

### Meld

Each root degree participates in bounded carry work.

Time is $O(\log(n+m))$ for heaps of sizes $n$ and $m$.

The donor is emptied in $O(1)$ metadata work after its roots transfer.

### Decrease-key

An entry can move from its node to the root of a degree-$k$ tree through at most $k$ parent swaps.

Because $k=O(\log n)$, worst-case time is $O(\log n)$.

### Extract minimum

Scanning roots costs $O(\log n)$.

The removed root has at most $O(\log n)$ children.

Melding those children causes at most logarithmic carry work.

Total time is $O(\log n)$.

### Space

Each entry uses one handle and one node.

Child and parent references total $O(n)$.

The root dictionary has $O(\log n)$ entries.

Overall storage is $O(n)$.

Validation uses $O(n)$ identity space and $O(\log n)$ recursion depth for valid binomial trees.

## 6. Systems Connections

### Meld-heavy scheduling

Separate schedulers can accumulate local priority queues and merge them when ownership changes.

A binomial heap makes the structural merge logarithmic rather than rebuilding every entry.

Real schedulers must also define concurrency, cancellation, stale handles, and equal-priority fairness.

### Graph algorithms

Dijkstra and Prim need insertion, minimum extraction, and decrease-key.

A binary heap often wins in practice because of locality, even when another heap has attractive theoretical bounds.

Benchmark the actual graph density, decrease frequency, allocator, and language runtime.

### Binary arithmetic

Root degrees encode the binary representation of heap size.

Insertion resembles adding one.

Meld resembles binary addition of two bit vectors with tree links as carries.

This analogy is a correctness tool, not merely a metaphor.

### Persistent variants

Immutable binomial heaps can share untouched trees between versions.

Functional languages often represent roots as degree-sorted lists and return new forests from meld.

The mutable donor-emptying contract used here is different and prevents cross-heap aliases.

### Memory locality

Nodes and child lists can be scattered across allocations.

An array binary heap stores priorities contiguously and usually has stronger cache behavior.

The meld benefit must justify pointer overhead for the target workload.

### Handle safety

Decrease-key APIs expose references into a mutable structure.

Extraction must invalidate handles.

Meld must preserve active handles while transferring ownership.

Application code should not mutate handle keys directly; the heap must perform repair atomically with the key change.

### Concurrency

Linking and root-dictionary carries touch several mutable nodes.

Unsynchronized meld or extraction can lose trees.

Use external locking, immutable heaps, or a specialized concurrent priority queue rather than assuming pointer operations are atomic as a transaction.

## 7. Practice Checklist

### Preserve tree structure

- Link only equal-degree roots.
- Keep the smaller root for a min heap.
- Append the loser at the correct child degree.
- Update the loser's parent.
- Keep roots parentless.
- Verify a degree-$k$ tree has $2^k$ nodes.
- Verify child degrees are `0..k-1`.

### Preserve the forest

- Store at most one root per degree.
- Resolve collisions as carries.
- Compare represented binary size with stored size.
- Create degree-zero trees for insertion.
- Transfer all donor roots during meld.
- Empty the donor after destructive meld.
- Reject self-meld.

### Maintain handles

- Keep node-to-handle and handle-to-node backlinks equal.
- Swap logical entries, not structural child lists, during decrease.
- Update both backlinks after every swap.
- Reject a key increase through decrease-key.
- Invalidate the extracted handle.
- Reject operations on inactive handles.

### Test operations

- Insert through a multi-degree carry cascade.
- Meld heaps with overlapping degrees.
- Extract from one element.
- Extract all elements in sorted order.
- Decrease a leaf key to become the global minimum.
- Test equal priorities under a documented tie policy.
- Differential-test against a trusted priority queue.
- Validate after every randomized operation.

## 8. Frequently Asked Questions

### Why is it called a binomial heap?

Each component is a binomial tree, whose node counts by depth are binomial coefficients.

The forest uses at most one tree of each degree.

### Is a binomial heap one tree?

Not generally.

It is a forest whose occupied degrees encode heap size in binary.

A power-of-two size may be represented by one tree.

### Where is the minimum?

Heap order places each tree minimum at its root.

The global minimum is the smallest root key.

Without a cached pointer, finding it scans logarithmically many roots.

### Why can equal-degree trees be linked?

Two $B_k$ trees have identical structural rank.

Making one root a child of the other produces exactly the recursive definition of $B_{k+1}$.

### Why does meld resemble binary addition?

One root at degree $k$ represents a $2^k$ contribution.

Two such roots link into one degree-$(k+1)$ tree, exactly like two one-bits producing a carry.

### Is insertion $O(1)$?

Worst-case insertion can carry through $O(\log n)$ occupied degrees.

Across a sequence, links behave like binary-counter bit flips and can be $O(1)$ amortized.

State which guarantee the API uses.

### Why not always use a binomial heap?

Array binary heaps are simpler and cache-friendly.

If meld is absent or rare, their constants often dominate.

### What happens to children during extract-min?

They become roots of separate binomial trees.

Their parent links are cleared and they are melded into the remaining forest by degree.

### Why are handles complicated?

Decrease-key moves an entry upward.

If keys or entries swap between structural nodes, a handle must continue following the same logical entry.

Stale node-based handles can modify the wrong item.

### Does the structure define stable order for equal keys?

No, not by default.

Use a composite priority such as `(priority, sequence)` when deterministic FIFO tie behavior is required.

### Can meld be non-destructive?

Yes with cloning, immutability, or structural sharing.

This implementation chooses destructive transfer so two mutable heaps never own the same nodes.

### How is a Fibonacci heap different?

Fibonacci heaps defer more consolidation work and achieve stronger amortized bounds for insertion, meld, and decrease-key.

They use more complex marking and cut invariants and often have larger practical constants.

### What should validation prove?

Unique root degrees, binomial child degrees, heap order, correct parents, valid handle backlinks, unique node ownership, and binary-size agreement together cover the core representation.
