# B+ Trees: Page Fan-Out, Separator Keys & Ordered Leaf Scans

![B+ Trees: Page Fan-Out, Separator Keys & Ordered Leaf Scans](/images/dsa/b-trees-dark.jpg#dark)

## 1. Historical Context & Motivation

Balanced binary trees control comparison depth, but external storage charges for page transfers rather than individual comparisons.

A binary node containing two child pointers wastes most of a 4 KiB or 16 KiB page.

Following one pointer per level can require many unrelated page reads.

Multiway search trees address the storage hierarchy directly.

A single node stores many separator keys and many child references.

One page read can therefore eliminate a large fraction of the remaining key space.

Rudolf Bayer and Edward McCreight introduced B-trees for large indexes in the early 1970s.

The B+ tree is a closely related organization used widely in database and filesystem indexes.

Its defining separation is practical:

- internal nodes guide navigation with separators;
- leaf nodes hold the indexed entries or references to them;
- leaves appear at one common depth;
- leaves are linked in key order for range scans.

The `+` does not mean “a B-tree with one extra level.”

It denotes a different placement policy for records and an explicit sequential access path through leaves.

Internal separators are routing copies, not independent logical records.

That distinction explains why a point lookup continues to a leaf even if its key equals an internal separator.

It also explains why changing the smallest key in a right child may require updating a separator copy in an ancestor.

The central engineering question is not merely “is the tree balanced?”

It is:

**how many useful routing decisions fit in one transfer unit, and how does the structure preserve occupancy under updates?**

Suppose an internal page can hold 256 child pointers.

A three-level tree can address on the order of $256^3$ leaf regions before accounting for root exceptions and leaf capacity.

High fan-out keeps the root and upper levels hot in memory while most requests perform very few lower-level reads.

B+ trees also make ordered queries natural.

After locating the first qualifying leaf, a range query walks sibling links instead of returning to internal nodes for every next key.

This behavior supports database predicates such as `WHERE timestamp BETWEEN a AND b`, ordered pagination, prefix ranges, and index-only scans.

The abstraction still carries trade-offs.

Splitting a full page writes multiple pages and changes a parent.

Deleting from a sparse page may borrow from a sibling or merge pages.

Variable-length keys complicate capacity because a page may be byte-full before reaching a nominal key count.

Concurrent systems need latches or optimistic validation across structural modification.

Crash-safe systems must coordinate page writes with logging or copy-on-write publication.

The educational model in this article counts entries and children.

Real storage engines budget bytes, headers, slot arrays, checksums, prefix-compression state, and recovery metadata.

The model is nevertheless valuable because it exposes the invariants that those implementations preserve.

## 2. Core Mathematical Invariants

### Search partition

An internal node with separators:

$$
s_0<s_1<\cdots<s_{k-1}
$$

has $k+1$ children:

$$
c_0,c_1,\ldots,c_k.
$$

Using the common “minimum key of the right child” convention:

- $c_0$ contains keys smaller than $s_0$;
- $c_i$ for $0<i<k$ contains keys from $s_{i-1}$ up to but not including $s_i$;
- $c_k$ contains keys at least $s_{k-1}$.

Equality therefore routes right.

In code, `bisect_right(separators, key)` selects the child.

Using `bisect_left` with this separator convention can send an equal key into the wrong subtree.

Other separator conventions are possible.

The comparison rule and separator definition must agree everywhere: lookup, insertion, deletion, validation, and recovery.

### Leaf ownership

Every logical key-value entry resides in exactly one leaf.

Internal copies do not increase the map's logical size.

Leaves keep keys strictly sorted under a unique-key map policy.

Replacing an existing key changes its value in place and does not split a page.

### Uniform leaf depth

All leaves have the same depth from the root.

Splits grow the tree upward rather than leaving one branch deeper than its peers.

If the root splits, a new root is created and every old leaf becomes one level deeper together.

This is the B+ tree's balance property.

### Occupancy

Let an internal node hold at most $m$ children.

Except for the root, an internal node normally holds at least:

$$
\left\lceil\frac{m}{2}\right\rceil
$$

children.

If a leaf holds at most $L$ entries, a common count-based policy requires at least:

$$
\left\lceil\frac{L}{2}\right\rceil
$$

entries in every non-root leaf.

Exact minimums depend on the chosen split policy and implementation specification.

Byte-oriented systems often enforce a minimum used-byte fraction rather than a key count.

The root is exceptional.

A root leaf may contain from zero through $L$ entries.

An internal root needs at least two children after a split, but deletion can collapse a one-child root into that child.

### Separator derivation

For the convention used here, internal separator $s_i$ equals the minimum key reachable from child $c_{i+1}$.

Formally:

$$
s_i=\min(c_{i+1}).
$$

This equality is stronger than merely checking that separators are sorted.

A stale separator can preserve local sorting while making an existing key unreachable.

Validation should derive subtree minima and compare them with every stored separator.

### Leaf-link invariant

Each leaf except the last points to its immediate successor in global key order.

Following `next` pointers from the leftmost leaf must:

- visit every leaf exactly once;
- never form a cycle;
- produce the same leaf order as an in-order traversal of the tree;
- produce globally increasing keys.

The links are an additional index structure.

Tree correctness does not automatically imply link correctness.

A split can leave point lookup working while a missed `next` assignment silently drops rows from range scans.

### Split invariants

When a leaf overflows, its sorted entries are divided into left and right leaves.

The first key of the right leaf is copied into the parent as a separator.

The key remains in the leaf because leaves own records.

When an internal node overflows, its children are divided around a promoted separator.

That promoted separator moves into the parent and is not retained as a record in either internal child.

Confusing leaf splitting with internal splitting is a common implementation error.

### Height bound

Let $f$ be the minimum non-root fan-out and let the root have at least two children when it is internal.

At height $h$ measured in edges from root to leaf, the number of leaves is at least proportional to:

$$
2f^{h-1}.
$$

If each non-root leaf contains at least $q$ records, then for a nontrivial tree:

$$
n\ge 2qf^{h-1}.
$$

Solving for height gives:

$$
h=O(\log_f n).
$$

Because $f$ can be in the hundreds, the base of this logarithm is operationally important.

### Mutable object-graph safety

An in-memory representation also requires:

- no child cycle;
- no internal or leaf node referenced by two tree parents;
- child count equal to separator count plus one;
- leaves occurring at one depth;
- logical size matching all leaf entries;
- a leaf chain matching structural leaf order.

These checks catch corruption that ordinary successful lookups may not expose.

## 3. Step-by-Step Execution Trace

### Configuration

Use a small demonstration tree with:

- at most three entries per leaf;
- at most four children per internal node;
- unique integer keys;
- minimum-of-right-child separators.

Insert:

```text
10, 20, 5, 6, 12, 30, 7, 17, 3, 4, 2, 1
```

Small capacities force visible splits that production-sized pages would postpone.

### Insert `10`, `20`, and `5`

The root is initially a leaf.

Entries remain sorted inside it:

```text
[5, 10, 20]
```

The leaf is full but not overflowing.

No internal node exists yet.

### Insert `6`: first leaf split

Temporary leaf contents become:

```text
[5, 6, 10, 20]
```

The capacity is three, so split into:

```text
[5, 6] -> [10, 20]
```

Copy the right leaf's minimum `10` into a new root:

```text
          [10]
         /    \
    [5, 6] -> [10, 20]
```

The logical entry `10` remains in the right leaf.

The root's `10` is only a routing copy.

A lookup for `10` compares equal at the root, routes right, and finds the leaf entry.

### Insert `12` and `30`

Both route through the right child.

After `12`, the right leaf is `[10, 12, 20]`.

After inserting `30`, it temporarily becomes `[10, 12, 20, 30]` and splits:

```text
              [10, 20]
            /     |      \
       [5, 6] -> [10, 12] -> [20, 30]
```

The copied separator is `20`, the new right leaf's minimum.

The root now has two separators and three children.

### Insert `7`

`7 < 10`, so it enters the leftmost leaf.

```text
              [10, 20]
            /     |      \
    [5, 6, 7] -> [10, 12] -> [20, 30]
```

No split occurs.

### Insert `17`

The child index is one because `10 <= 17 < 20`.

The middle leaf becomes `[10, 12, 17]`.

The separator keys do not change because its minimum remains `10`.

### Insert `3`: split the left leaf

The left leaf temporarily contains `[3, 5, 6, 7]`.

It splits into `[3, 5]` and `[6, 7]`.

Copy `6` into the root at the position immediately after the old left child:

```text
                    [6, 10, 20]
                 /      |       |       \
          [3, 5] -> [6, 7] -> [10, 12, 17] -> [20, 30]
```

The root reaches its maximum of four children but has not overflowed.

### Insert `4`

The leftmost leaf becomes `[3, 4, 5]`.

No separator changes.

### Insert `2`: cascading split

The leftmost leaf temporarily becomes `[2, 3, 4, 5]`.

Split it into `[2, 3]` and `[4, 5]` and copy `4` into the root.

The root would then have five children:

```text
[2,3] [4,5] [6,7] [10,12,17] [20,30]
```

Five exceeds the internal maximum of four.

The internal node must split.

Divide its children into two groups:

```text
left children:  [2,3] [4,5]
right children: [6,7] [10,12,17] [20,30]
```

The minimum key of the new right internal subtree is `6`.

Promote `6` into a new root:

```text
                         [6]
                       /     \
                    [4]     [10, 20]
                   /  \     /    |      \
              [2,3] [4,5] [6,7] [10,12,17] [20,30]
```

The leaf links still form one chain across the internal-subtree boundary.

Every leaf is now two edges below the root.

### Insert `1`

`1 < 6`, then `1 < 4`, so lookup reaches `[2,3]`.

The leaf becomes `[1,2,3]` without splitting.

Final leaves are:

```text
[1,2,3] -> [4,5] -> [6,7] -> [10,12,17] -> [20,30]
```

### Point lookup for `17`

At root `[6]`, equality partitioning sends `17` right.

At internal node `[10,20]`, `10 <= 17 < 20` selects the middle child.

Binary search inside `[10,12,17]` finds index two.

Only one leaf owns the value.

### Range query `[5, 17]`

Navigate to the first leaf that could contain `5`.

That leaf is `[4,5]`.

Start at its lower-bound position for `5`.

Emit `5`.

Follow `next` to `[6,7]` and emit `6,7`.

Follow `next` to `[10,12,17]` and emit `10,12,17`.

The next leaf starts at `20`, which exceeds the inclusive upper bound.

Stop without revisiting an internal page.

The final result is:

```text
5, 6, 7, 10, 12, 17
```

The trace connects all core invariants: separator equality routes right, all records live in leaves, splits preserve common depth, and sibling links accelerate ordered scans.

## 4. Production-Ready Implementations

The following Python implementation provides unique-key insertion, replacement, point lookup, inclusive range scans, ordered iteration, and structural validation.

It models pages by entry counts so the algorithms remain inspectable.

It deliberately omits deletion, byte-based page packing, persistence, concurrency, and crash recovery; those omissions are stated rather than hidden behind a “complete database index” claim.

```python
from __future__ import annotations

from bisect import bisect_left, bisect_right
from dataclasses import dataclass, field
from typing import Generic, Iterator, Optional, TypeVar, Union

K = TypeVar("K")
V = TypeVar("V")


@dataclass(slots=True)
class _Leaf(Generic[K, V]):
    keys: list[K] = field(default_factory=list)
    values: list[V] = field(default_factory=list)
    next: Optional["_Leaf[K, V]"] = None


@dataclass(slots=True)
class _Internal(Generic[K, V]):
    separators: list[K] = field(default_factory=list)
    children: list["_Page[K, V]"] = field(default_factory=list)


_Page = Union[_Leaf[K, V], _Internal[K, V]]


class BPlusTree(Generic[K, V]):
    def __init__(self, leaf_capacity: int = 31, internal_capacity: int = 32) -> None:
        if leaf_capacity < 2:
            raise ValueError("leaf_capacity must be at least 2")
        if internal_capacity < 3:
            raise ValueError("internal_capacity must be at least 3")
        self._leaf_capacity = leaf_capacity
        self._internal_capacity = internal_capacity
        self._root: _Page[K, V] = _Leaf()
        self._size = 0

    def __len__(self) -> int:
        return self._size

    def _find_leaf(
        self,
        key: K,
    ) -> tuple[_Leaf[K, V], list[tuple[_Internal[K, V], int]]]:
        page = self._root
        path: list[tuple[_Internal[K, V], int]] = []
        while isinstance(page, _Internal):
            child_index = bisect_right(page.separators, key)
            path.append((page, child_index))
            page = page.children[child_index]
        return page, path

    def get(self, key: K) -> V:
        leaf, _ = self._find_leaf(key)
        index = bisect_left(leaf.keys, key)
        if index == len(leaf.keys) or leaf.keys[index] != key:
            raise KeyError(key)
        return leaf.values[index]

    def put(self, key: K, value: V) -> Optional[V]:
        leaf, path = self._find_leaf(key)
        index = bisect_left(leaf.keys, key)
        if index < len(leaf.keys) and leaf.keys[index] == key:
            previous = leaf.values[index]
            leaf.values[index] = value
            return previous

        leaf.keys.insert(index, key)
        leaf.values.insert(index, value)
        self._size += 1
        if len(leaf.keys) <= self._leaf_capacity:
            return None

        split_at = (len(leaf.keys) + 1) // 2
        right = _Leaf(
            keys=leaf.keys[split_at:],
            values=leaf.values[split_at:],
            next=leaf.next,
        )
        leaf.keys = leaf.keys[:split_at]
        leaf.values = leaf.values[:split_at]
        leaf.next = right
        self._insert_in_parent(leaf, right.keys[0], right, path)
        return None

    def _insert_in_parent(
        self,
        left: _Page[K, V],
        separator: K,
        right: _Page[K, V],
        path: list[tuple[_Internal[K, V], int]],
    ) -> None:
        if not path:
            self._root = _Internal([separator], [left, right])
            return

        parent, left_index = path.pop()
        if parent.children[left_index] is not left:
            raise AssertionError("recorded parent path is stale")
        parent.separators.insert(left_index, separator)
        parent.children.insert(left_index + 1, right)
        if len(parent.children) <= self._internal_capacity:
            return

        child_split = len(parent.children) // 2
        promoted = parent.separators[child_split - 1]
        right_internal = _Internal(
            separators=parent.separators[child_split:],
            children=parent.children[child_split:],
        )
        parent.separators = parent.separators[: child_split - 1]
        parent.children = parent.children[:child_split]
        self._insert_in_parent(parent, promoted, right_internal, path)

    def range_items(self, lower: K, upper: K) -> Iterator[tuple[K, V]]:
        if upper < lower:
            return
        leaf, _ = self._find_leaf(lower)
        index = bisect_left(leaf.keys, lower)
        while leaf is not None:
            while index < len(leaf.keys):
                key = leaf.keys[index]
                if upper < key:
                    return
                yield key, leaf.values[index]
                index += 1
            leaf = leaf.next
            index = 0

    def items(self) -> Iterator[tuple[K, V]]:
        page = self._root
        while isinstance(page, _Internal):
            page = page.children[0]
        leaf: Optional[_Leaf[K, V]] = page
        while leaf is not None:
            yield from zip(leaf.keys, leaf.values)
            leaf = leaf.next

    def validate(self) -> int:
        seen_pages: set[int] = set()
        leaves: list[_Leaf[K, V]] = []
        leaf_depth: Optional[int] = None

        def audit(page: _Page[K, V], depth: int, is_root: bool) -> tuple[K, K, int]:
            nonlocal leaf_depth
            identity = id(page)
            if identity in seen_pages:
                raise AssertionError("cycle or shared tree page detected")
            seen_pages.add(identity)

            if isinstance(page, _Leaf):
                if len(page.keys) != len(page.values):
                    raise AssertionError("leaf key/value lengths differ")
                if any(page.keys[i - 1] >= page.keys[i] for i in range(1, len(page.keys))):
                    raise AssertionError("leaf keys are not strictly increasing")
                if not is_root and not page.keys:
                    raise AssertionError("non-root leaf is empty")
                if len(page.keys) > self._leaf_capacity:
                    raise AssertionError("leaf exceeds capacity")
                if leaf_depth is None:
                    leaf_depth = depth
                elif leaf_depth != depth:
                    raise AssertionError("leaves do not share one depth")
                leaves.append(page)
                if not page.keys:
                    raise AssertionError("empty root has no key bounds")
                return page.keys[0], page.keys[-1], len(page.keys)

            if len(page.children) != len(page.separators) + 1:
                raise AssertionError("internal child/separator arity mismatch")
            if is_root and len(page.children) < 2:
                raise AssertionError("internal root must have at least two children")
            if not is_root and len(page.children) < 2:
                raise AssertionError("non-root internal page has too few children")
            if len(page.children) > self._internal_capacity:
                raise AssertionError("internal page exceeds capacity")

            summaries = [audit(child, depth + 1, False) for child in page.children]
            expected = [summary[0] for summary in summaries[1:]]
            if page.separators != expected:
                raise AssertionError("separator is not the right-child minimum")
            for left_summary, right_summary in zip(summaries, summaries[1:]):
                if not (left_summary[1] < right_summary[0]):
                    raise AssertionError("adjacent child ranges overlap")
            return summaries[0][0], summaries[-1][1], sum(item[2] for item in summaries)

        if isinstance(self._root, _Leaf) and not self._root.keys:
            if self._size != 0 or self._root.next is not None:
                raise AssertionError("empty-tree metadata is inconsistent")
            return 0

        _, _, count = audit(self._root, 0, True)
        if count != self._size:
            raise AssertionError("stored size does not match leaf entries")

        linked: list[_Leaf[K, V]] = []
        cursor: Optional[_Leaf[K, V]] = leaves[0]
        linked_seen: set[int] = set()
        while cursor is not None:
            if id(cursor) in linked_seen:
                raise AssertionError("leaf chain contains a cycle")
            linked_seen.add(id(cursor))
            linked.append(cursor)
            cursor = cursor.next
        if linked != leaves:
            raise AssertionError("leaf chain differs from structural leaf order")
        return leaf_depth or 0
```

### Trace and replacement checks

```python
trace_tree: BPlusTree[int, str] = BPlusTree(leaf_capacity=3, internal_capacity=4)
for key in [10, 20, 5, 6, 12, 30, 7, 17, 3, 4, 2, 1]:
    assert trace_tree.put(key, f"v{key}") is None
    trace_tree.validate()

expected_keys = [1, 2, 3, 4, 5, 6, 7, 10, 12, 17, 20, 30]
assert [key for key, _ in trace_tree.items()] == expected_keys
assert trace_tree.get(17) == "v17"
assert [key for key, _ in trace_tree.range_items(5, 17)] == [5, 6, 7, 10, 12, 17]
assert trace_tree.validate() == 2

assert trace_tree.put(12, "updated") == "v12"
assert trace_tree.get(12) == "updated"
assert len(trace_tree) == len(expected_keys)
trace_tree.validate()

try:
    trace_tree.get(999)
    raise AssertionError("missing key should fail")
except KeyError:
    pass
```

### Differential randomized verification

This test varies page capacities as well as insertion order.

It checks point lookup, ordered iteration, inclusive ranges, replacement values, common leaf depth, separators, and links after every update.

```python
import random

for leaf_capacity in range(2, 8):
    for internal_capacity in range(3, 8):
        rng = random.Random(leaf_capacity * 100 + internal_capacity)
        tree: BPlusTree[int, int] = BPlusTree(leaf_capacity, internal_capacity)
        reference: dict[int, int] = {}
        operations = [rng.randrange(0, 180) for _ in range(350)]
        for step, key in enumerate(operations):
            value = step * 17 - key
            assert tree.put(key, value) == reference.get(key)
            reference[key] = value
            tree.validate()
            assert list(tree.items()) == sorted(reference.items())
            assert tree.get(key) == value

        for lower, upper in [(0, 0), (0, 179), (20, 70), (70, 20), (175, 999)]:
            expected = [
                item for item in sorted(reference.items())
                if lower <= item[0] <= upper
            ]
            assert list(tree.range_items(lower, upper)) == expected
```

### What production storage adds

A disk-backed implementation identifies pages by stable page IDs rather than Python references.

It compares serialized byte lengths rather than list lengths.

It defines split points that account for variable-length keys and values.

It maintains parent discovery through a traversal stack, parent pointers, or a buffer manager.

It pins pages during mutation so eviction cannot invalidate an active operation.

It coordinates dirty-page writes with write-ahead logging or copy-on-write publication.

It verifies checksums and format versions during page reads.

It handles deletion through redistribution, merging, separator repair, and root collapse.

It provides a concurrency protocol for readers, writers, and structure changes.

The in-memory code above is suitable for learning and deterministic testing of insertion invariants, not as a drop-in transactional storage engine.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of entries.

Let $B$ be the maximum internal fan-out.

Let $L$ be the maximum number of leaf entries.

Let $h$ be the number of edges from root to leaf.

### Point lookup

Lookup visits one internal node at each level and one leaf.

Binary search within a node containing at most $B-1$ separators costs $O(\log B)$ comparisons.

The number of levels is $O(\log_B n)$ under occupancy guarantees.

Comparison complexity is therefore:

$$
O(\log_B n\cdot\log B)=O(\log n).
$$

For external memory, the more useful measure is page transfers:

$$
O(\log_B n).
$$

If the root and upper levels are cached, physical reads can be smaller still.

### Insertion

Navigation costs $O(\log_B n)$ page visits.

Inserting into array-backed page slots can move $O(B)$ separators or $O(L)$ leaf entries within memory.

An overflow can split one node per level in the worst case.

The split cascade touches $O(\log_B n)$ tree levels.

The external-memory cost remains $O(\log_B n)$ page operations, with larger constants for allocation, logging, and writes.

The Python model's list shifts make CPU cost per affected page linear in page capacity.

Because page capacity is configured as a bounded storage unit, external-memory analysis treats it separately from $n$.

### Range scan

Finding the first qualifying key costs $O(\log_B n)$ page visits.

After that, leaf links stream the result.

Returning $k$ entries costs:

$$
O(\log_B n+k)
$$

logical work.

In page-transfer terms, the scan reads approximately the number of leaf pages covering those $k$ entries, often $O(k/L)$ when leaves are well occupied.

### Deletion

Although deletion is not implemented in the sample, its bounded behavior can be derived.

Finding the key costs $O(\log_B n)$ page visits.

Borrowing or merging performs bounded work at one page level.

Underflow can propagate to the root across $O(\log_B n)$ levels.

Worst-case page operations are therefore $O(\log_B n)$.

### Bulk loading

If input is already sorted, leaves can be filled sequentially and linked in $O(n)$ entry work.

Internal levels can then be built bottom-up from child minima.

This avoids repeated root-to-leaf insertion and usually produces dense pages.

External sorting may dominate when source data are not ordered.

### Space

Leaves store all $n$ logical entries.

Internal pages store routing copies and child identifiers.

With guaranteed occupancy, total page count is $O(n/L)$ leaves plus a decreasing geometric series of internal pages.

Overall asymptotic storage is $O(n)$.

Unused page space from split policies and deletion is part of the constant factor.

### Validation

The structural audit visits every page and entry once, so it uses $O(n)$ time.

The identity set and collected leaf list use $O(n)$ space in the Python object model.

Production offline validators can trade memory for page-ID bitmaps, sorted runs, or multiple passes.

## 6. Systems Connections

### Database secondary indexes

A secondary B+ tree leaf can store an indexed key plus a row identifier or primary key.

A non-covering query follows that reference to the base record.

A covering index includes all columns needed by the query, avoiding the extra lookup.

Composite keys are ordered lexicographically, which determines which predicate prefixes can navigate efficiently.

An index on `(tenant_id, created_at)` naturally supports a tenant equality followed by a time range.

It does not provide the same navigation for a time-only predicate unless another access path exists.

### Clustered organization

Some engines arrange base records in primary-key leaf order.

Others keep a separate heap file and place record identifiers in all indexes.

The choice affects range locality, update amplification, and secondary-index payload size.

“B+ tree index” does not by itself reveal whether leaves contain complete rows or references.

### Filesystems

Filesystems use multiway trees to index directory entries, extents, free-space regions, or metadata objects.

Page-sized nodes align traversal with block and cache boundaries.

Crash consistency is essential because a half-published split could make an entire key range unreachable.

Journaling, copy-on-write roots, and transactional metadata trees are different ways to publish structural changes safely.

### Buffer pools

A database buffer pool caches pages by page ID.

Upper B+ tree levels have high reuse and often remain resident.

A nominal height of four does not necessarily imply four storage reads per lookup.

The root may be pinned, the next level hot, and only one leaf access miss the cache.

Metrics should distinguish logical page visits from physical I/O.

### Prefix compression

Internal separators and neighboring leaf keys often share long prefixes.

Prefix compression can increase fan-out by storing only enough bytes to distinguish adjacent ranges.

The comparison routine must reconstruct or interpret compressed keys correctly.

Splits and merges may change the common prefix and require page-local recompression.

### Variable-length records

Count-based occupancy is insufficient when one key is 8 bytes and another is 800 bytes.

Slotted pages separate a compact slot directory from variable-length payloads.

A page split chooses a byte-balanced boundary while respecting any minimum fill policy.

Very large values are commonly stored out of line so one entry cannot monopolize a leaf.

### Concurrency and structural modification

Readers descending the tree can race with a split that changes parent separators.

Latch coupling holds a safe relationship between parent and child while moving downward.

Optimistic protocols read versions and restart if a page changed.

B-link trees add right-sibling links and high keys so searches can recover from concurrent splits.

No-lock mutation of the educational object graph is unsafe.

### Recovery

Write-ahead logging records enough information to redo committed updates and undo incomplete ones according to the engine's recovery design.

The log must reach durable storage before a corresponding dirty page is flushed under the write-ahead rule.

Copy-on-write designs instead write new pages and atomically publish a new root or superblock reference.

Both strategies preserve tree reachability across crashes, but their write amplification and reclamation behavior differ.

### LSM-tree comparison

An LSM tree buffers writes in memory and flushes sorted runs, reducing random update I/O.

Reads may consult multiple levels unless filters and compaction limit work.

A B+ tree updates a stable search hierarchy in place or through page-level copy-on-write.

Workload write rate, range-scan needs, storage medium, and amplification budgets decide between them.

Neither structure dominates every database workload.

## 7. Practice Checklist

### Model the node contract

- Choose a separator convention before coding.
- State whether equality routes left or right.
- Keep records in leaves under B+ semantics.
- Distinguish copied separators from logical entries.
- Define maximum leaf entries.
- Define maximum internal children.
- Define non-root minimum occupancy.
- Document root exceptions.
- Require all leaves at one depth.
- Link leaves in exact structural order.

### Implement insertion carefully

- Record the parent path during descent.
- Use binary search within each node.
- Replace duplicate-key values without increasing size.
- Split a leaf only after overflow.
- Copy the new right leaf's minimum into the parent.
- Reconnect the leaf sibling chain during a split.
- Insert the right page immediately after the left page in its parent.
- Split an internal node by children, not by treating it like a leaf.
- Promote the boundary separator during an internal split.
- Create a new root when the old root splits.
- Test cascades through several levels.

### Validate structure

- Check key/value length equality in leaves.
- Check strict leaf key ordering.
- Check child/separator arity.
- Derive every separator from its right child.
- Verify adjacent child ranges do not overlap.
- Verify common leaf depth.
- Count logical records only in leaves.
- Compare reachable count with stored size.
- Reject tree-page cycles and shared mutable pages.
- Compare sibling-chain order with structural leaf order.
- Reject leaf-link cycles.
- Enforce configured capacities.

### Test observable behavior

- Insert ascending keys.
- Insert descending keys.
- Insert random permutations.
- Use the smallest supported capacities to force splits.
- Test exact separator equality.
- Test keys below the minimum and above the maximum.
- Replace existing values.
- Scan an empty range.
- Scan a one-key range.
- Scan across multiple leaves.
- Scan the entire tree.
- Compare results with a trusted ordered model.
- Repeat across several leaf and internal capacities.

### Design production pages

- Budget bytes, not only key counts.
- Reserve page-header and slot-directory space.
- Decide whether values are inline or referenced.
- Define page-ID width and checksum policy.
- Choose split fill factors from workload evidence.
- Specify deletion redistribution and merge rules.
- Specify root collapse.
- Define parent discovery.
- Define buffer pinning and dirty-page ownership.
- Define the concurrency protocol.
- Define logging or copy-on-write publication.
- Define recovery tests with crash injection.

### Evaluate the access path

- Measure logical page visits.
- Measure physical reads and writes separately.
- Measure cache hit rate by tree level.
- Measure split frequency.
- Measure average and minimum fill factor.
- Measure write amplification.
- Measure range throughput.
- Account for key-comparison cost.
- Account for prefix compression.
- Compare with a hash index for equality-only workloads.
- Compare with an LSM tree for write-heavy workloads.

## 8. Frequently Asked Questions

### What is the difference between a B-tree and a B+ tree?

Both are balanced multiway search trees.

In a common B-tree organization, records may appear in internal nodes as well as leaves.

In a B+ tree, logical records live in leaves, internal nodes carry routing separators, and leaves are linked for ordered scans.

Terminology varies among implementations, so inspect the actual record-placement and navigation rules.

### Why must a lookup continue after matching an internal separator?

The separator is a routing copy, not the owned record.

Under the minimum-of-right-child convention, equality selects the child to the right of that separator.

The leaf then confirms presence and returns the value.

### Why are B+ tree leaves linked?

The links turn a sequence of leaves into an ordered scan path.

After one logarithmic navigation to the lower bound, a range query advances without climbing back through internal pages.

### Does a B+ tree have $O(\log n)$ height?

Yes, under minimum occupancy rules.

More specifically, the height is logarithmic in a base related to minimum fan-out.

High fan-out makes the practical number of page levels small.

### Is tree order the number of keys or children?

Textbooks use “order” inconsistently.

Some define it as maximum children; others use maximum keys or minimum degree.

Production code should use explicit names such as `max_children`, `max_leaf_entries`, and `min_degree` rather than relying on the word alone.

### Why do leaf and internal splits promote keys differently?

A leaf owns records, so its first right-side key must remain in the right leaf and is copied upward.

An internal separator only routes searches, so the boundary separator moves upward when the internal node splits.

Treating both cases identically can duplicate or lose routing boundaries.

### What happens when the root splits?

A new internal root is allocated with the two split pages as children.

Its one separator divides their ranges.

This is the only insertion event that increases tree height.

### How does deletion repair an underfull leaf?

The tree first attempts to redistribute an entry from a sufficiently full adjacent sibling with the same parent.

It then updates the affected parent separator.

If redistribution is impossible, it merges pages, removes one parent child reference and separator, and may propagate parent underflow upward.

### Can one range scan observe a split concurrently?

Only if the concurrency design defines a safe behavior.

A naive unsynchronized leaf chain can expose missed, duplicate, or transient entries.

Latch protocols, versions with retries, or B-link-style high keys provide stronger navigation rules.

### Why not use a hash table for every index?

A hash table is excellent for equality lookup but does not naturally preserve key order.

B+ trees support predecessor/successor navigation, ranges, ordered iteration, and prefix intervals.

The correct index follows query semantics.

### Why not use a sorted array on disk?

A sorted array offers compact search and excellent scan locality.

Inserting into the middle can move a large suffix or require indirection and rebuilds.

B+ tree pages bound local movement and split incrementally while retaining ordered navigation.

### What does fill factor control?

Fill factor reserves free space for future inserts and influences fan-out.

Denser pages reduce tree size and scan I/O.

More headroom can reduce near-term split frequency for randomly distributed updates.

The best value depends on workload and page-rewrite cost.

### Is the Python implementation a database-ready index?

No.

It is a tested in-memory implementation of insertion, lookup, range scanning, and key structural invariants.

A database index additionally needs byte-oriented pages, durable identifiers, deletion, concurrency, recovery, checksums, and integration with a buffer manager.

### What is the strongest simple validator check?

There is no single sufficient check.

Deriving separators from right-child minima catches routing corruption.

Comparing leaf-chain order with structural leaf order catches scan corruption.

Uniform depth, arity, ordering, identity, capacity, and size checks complete the core audit.

### When should a B+ tree be bulk-loaded?

Bulk loading is attractive when a large initial data set can be sorted once.

It fills leaves sequentially and builds upper levels bottom-up, producing dense pages with less split work than repeated inserts.

Later incremental updates can use the ordinary insertion path.
