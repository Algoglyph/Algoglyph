# Tree-Based Indexing: Search Paths, Fan-Out & Augmented Queries

![Tree index routing keys to records](/images/dsa/tree-indexing-dark.png)

## 1. Historical Context & Motivation

Indexes trade storage and update work for faster retrieval.
Tree indexes preserve key order.
That order supports exact lookup, ranges, predecessors, successors, and ordered scans.
A binary search tree branches on one comparison.
A B-tree branches among many separators.
High fan-out reduces storage-page reads.
Balanced height makes path length predictable.
Unbalanced trees can degrade into linear chains.
Indexes therefore need structural invariants beyond sorted keys.
Database indexes commonly use B+ trees.
Internal pages guide search.
Leaf pages store records or record references.
Leaves are linked for range scans.
In-memory ordered maps often use red-black trees.
Spatial indexes use different bounding relations.
Interval trees augment subtrees with maximum endpoints.
Order-statistic trees store subtree counts.
The word “index” describes workload purpose, not one tree type.
The query determines useful augmentation.
The storage hierarchy determines branching factor.
Mutable indexes must maintain invariants during splits, merges, and rotations.
Concurrent indexes need latch or version protocols.
Persistent indexes need crash-consistent page publication.
An index can be slower than scanning tiny data.
It can also dominate memory when overused.
Selectivity, update rate, range behavior, and cache locality matter.
This article unifies search-tree indexing principles without duplicating dedicated AVL, red-black, B-tree, trie, or spatial-tree articles.
Its focus is the contract between ordering, balance, augmentation, and query execution.

## 2. Core Mathematical Invariants

Every index entry has a search key.
Keys obey one stable comparator.
For a binary node with key $k$, left keys are below $k$.
Right keys are above $k$ under unique-key semantics.
A balanced binary tree keeps height $O(\log n)$.
A multiway node stores ordered separators.
Separator $s_i$ partitions adjacent child ranges.
All keys in child $i$ fall within its declared interval.
A B-tree page obeys minimum and maximum occupancy, except root exceptions.
All leaves occur at the same depth.
This makes lookup path length deterministic up to constants.
For fan-out $b$, height is $O(\log_b n)$.
Larger $b$ reduces page visits.
Node search still costs comparisons within the page.
Binary search inside separators costs $O(\log b)$.
SIMD or linear scan can win for small cache-resident pages.
A B+ tree keeps payload entries in leaves.
Internal separators may duplicate boundary keys.
Leaf links preserve global sorted scan order.
Duplicate keys require composite ordering.
Pair key with record identifier or maintain a value list.
The comparator must remain total and immutable.
Changing an indexed key without remove-and-reinsert breaks routing.
An order-statistic augmentation stores subtree size.

$$
size(x)=1+size(left(x))+size(right(x)).
$$

Rank and selection depend on exact size updates.
An interval-tree node stores maximum high endpoint in its subtree.

$$
maxHigh(x)=\max(high(x),maxHigh(left),maxHigh(right)).
$$

That bound prunes subtrees unable to overlap a query.
Augmentations must be compositional.
Parent metadata derives from local entry and child metadata.
Every rotation or split recomputes affected metadata.
Range search finds the lower bound, then advances in order.
Its cost is lookup plus output.
No ordered index can report $k$ records in less than $\Omega(k)$ time.
Covering indexes store all query-needed fields.
They avoid base-record fetches at added index size.
Clustered indexes determine physical record order.
Only one independent clustering order is normally possible.
Secondary indexes point to clustered keys or record locations.
Those references create extra reads.
Prefix compression reduces separator storage.
Comparison must reconstruct enough key state correctly.
Versioned indexes bind every page to one logical snapshot.
Readers must not combine child pointers from incompatible versions.
Copy-on-write trees publish a new root after descendants are durable.
Write-ahead logging follows a different recovery invariant.
Checksums detect corruption but do not repair logical ordering.

## 3. Step-by-Step Execution Trace

Index keys `[5,12,18,27,31,44,52,63,79]` in leaf pages of capacity four.
Suppose leaves are `[5,12,18]`, `[27,31,44]`, and `[52,63,79]`.
The root stores separators 27 and 52.
Keys below 27 route left.
Keys from 27 through below 52 route middle.
Keys at least 52 route right.
Search for 44.
Compare 44 with 27.
Move past the first separator.
Compare 44 with 52.
Choose the middle child.
Binary-search its leaf.
Find 44 at leaf offset two.
Search for 40.
The same root path reaches the middle leaf.
Leaf search finds insertion position before 44.
Return “not found” and lower bound 44.
Range query `[18,63]` first finds lower bound 18.
It starts in the left leaf.
Emit 18.
Follow the leaf link to middle page.
Emit 27, 31, and 44.
Follow the next leaf link.
Emit 52 and 63.
Stop before 79 exceeds the upper bound.
Cost is one root-to-leaf lookup plus emitted entries and crossed pages.
Now insert key 35.
Middle leaf becomes `[27,31,35,44]` and still fits.
Insert key 40.
The leaf overflows capacity four.
Split it into two valid leaves.
For example, `[27,31]` and `[35,40,44]`.
Copy separator 35 into the parent.
Root separators become `[27,35,52]` under this representation.
Leaf links are repaired around both halves.
Search routing remains complete and disjoint.
Now delete enough keys from one leaf to violate minimum occupancy.
Borrow from an adjacent sibling if it has surplus.
Update the parent separator.
Otherwise merge siblings and remove one separator.
A root with one remaining child can shrink height.
Now add subtree counts to a binary index.
To select rank five, inspect left subtree size.
Skip entire subtrees rather than scanning keys.
An incorrect size after rotation sends rank lookup to the wrong branch.
The key order can remain valid while augmented queries fail.
This trace shows why augmentation is part of the index invariant.

## 4. Production-Ready Implementations

This immutable sorted index demonstrates lower bounds and range output with flat storage.
It is a useful correctness baseline for tree indexes.

```python
from __future__ import annotations

from bisect import bisect_left, bisect_right
from collections.abc import Iterable, Iterator
from dataclasses import dataclass
from typing import Generic, TypeVar


K = TypeVar("K")
V = TypeVar("V")


@dataclass(frozen=True, order=True)
class Entry(Generic[K, V]):
    key: K
    record_id: int
    value: V


class StaticOrderedIndex(Generic[K, V]):
    def __init__(self, entries: Iterable[Entry[K, V]]) -> None:
        self._entries = sorted(entries, key=lambda item: (item.key, item.record_id))
        self._keys = [(item.key, item.record_id) for item in self._entries]

    def exact(self, key: K) -> list[Entry[K, V]]:
        first = bisect_left(self._keys, (key, -1))
        result: list[Entry[K, V]] = []
        while first < len(self._entries) and self._entries[first].key == key:
            result.append(self._entries[first])
            first += 1
        return result

    def range(self, lower: K, upper: K) -> Iterator[Entry[K, V]]:
        if upper < lower:
            return
        start = bisect_left(self._keys, (lower, -1))
        for index in range(start, len(self._entries)):
            entry = self._entries[index]
            if upper < entry.key:
                break
            yield entry


def demo() -> None:
    index = StaticOrderedIndex([
        Entry(12, 1, "a"), Entry(5, 2, "b"), Entry(12, 3, "c"), Entry(27, 4, "d")
    ])
    assert [entry.value for entry in index.exact(12)] == ["a", "c"]
    assert [entry.key for entry in index.range(10, 27)] == [12, 12, 27]


if __name__ == "__main__":
    demo()
```

The flat baseline has excellent locality.
It is immutable after construction.
Updates require rebuilding or a delta layer.
Tree indexes earn complexity when mutations or page-scale data matter.
Production B-tree code should use a tested storage engine.
Page splits require atomic or recoverable publication.
Comparator behavior must match serialization.
Locale changes can invalidate textual indexes.
Null ordering must be explicit.
Composite keys must encode field boundaries unambiguously.
Prefix compression must preserve comparison order.
Record identifiers break duplicate-key ties.
They must remain stable or be updated transactionally.
Range iterators need snapshot ownership.
Concurrent page changes must not skip or duplicate records.
Latch coupling, optimistic validation, or MVCC solve different concurrency models.
Do not invent one casually.
Validate pages after deserialization.
Check key order, child counts, occupancy, and bounds.
Fuzz split and merge sequences.
Compare results with the static baseline.
Crash-test updates at every persistence boundary.
Measure page reads, not only comparisons.
Keep hot root pages cached.
Avoid indexes whose maintenance exceeds query value.

## 5. Asymptotic Time & Space Complexity

A balanced binary index has height $O(\log n)$.
Exact lookup is $O(\log n)$.
Insertion and deletion are $O(\log n)$.
A B-tree with fan-out $b$ has height $O(\log_b n)$.
It performs that many page visits.
CPU comparison work also includes page-local search.
Range output costs $O(\log_b n+k)$ page-navigation and output terms under linked leaves.
Building by repeated insertion costs $O(n\log n)$ operations.
Bulk loading sorted input can approach $O(n)$ page work.
The index stores $O(n)$ entries and pointers.
Occupancy controls concrete amplification.
Half-empty pages can nearly double slot overhead.
Subtree-size augmentation adds $O(1)$ metadata per node.
Rank and selection stay $O(\log n)$.
Interval augmentation similarly keeps logarithmic expected or worst-case search depending on balance and output.
Reporting $k$ overlaps adds $O(k)$.
The static flat baseline builds in $O(n\log n)$ comparison time.
Its lookup is $O(\log n)$.
Its insertion is $O(n)$ due to shifting or rebuild.
Its storage is $O(n)$ with small constants.
Hash indexes use expected $O(1)$ exact lookup.
They do not naturally support ordered ranges.
Trie lookup depends on key length rather than key count.
Spatial indexes use geometric pruning and distribution-sensitive performance.
One asymptotic label cannot describe every tree index.
Include update, query, output, and storage hierarchy separately.

## 6. Systems Connections

Database B+ trees align nodes with storage pages.
High fan-out minimizes random reads.
Leaf links serve ordered scans.
Filesystem indexes map names, extents, and directory entries.
Crash consistency matters as much as search complexity.
LSM trees buffer writes and merge sorted runs.
They are not one search tree, but they trade write patterns against read amplification.
In-memory runtimes use balanced trees for ordered maps.
Allocator overhead can exceed payload for tiny entries.
Search engines use inverted indexes because token lookup differs from arbitrary key ranges.
Interval trees schedule time spans and detect overlaps.
Order-statistic trees support percentile-like rank operations over dynamic sets.
Merkle trees add cryptographic summaries rather than search ordering.
Authenticated search trees combine both concerns.
Copy-on-write B-trees power snapshots.
New roots publish immutable versions.
Readers pin old versions until release.
Distributed indexes partition key ranges across nodes.
Routing adds a higher-level index.
Rebalancing moves ranges while preserving availability.
Security checks must bound key length and page counts.
Corrupt pointers cannot be trusted.
Indexes expose information through access patterns unless oblivious techniques are used.
Tree indexing connects algorithmic order to storage, transactions, and concurrency.

## 7. Practice Checklist

- Measure fan-out using real key and pointer widths.
- Distinguish logical height from storage-page reads.
- Verify separators after a child's first key changes.
- Define key equality and ordering.
- Keep comparators stable.
- Define duplicate-key policy.
- Use composite ties where needed.
- Preserve child key ranges.
- Maintain balance or occupancy invariants.
- Keep all B-tree leaves at equal depth.
- Update separators after redistribution.
- Repair leaf links after splits and merges.
- Recompute augmentations bottom-up.
- Validate subtree counts.
- Validate interval maxima.
- Include destination record identity.
- Define null ordering.
- Define collation version.
- Use checked page offsets.
- Validate serialized pages.
- Bind indexes to source versions.
- Snapshot concurrent scans.
- Prevent skipped range entries.
- Prevent duplicate range entries.
- Test empty and singleton indexes.
- Test ascending and descending insertions.
- Test duplicate-heavy keys.
- Test split propagation to root.
- Test root shrink after deletion.
- Test lower and upper boundaries.
- Compare with a sorted reference.
- Fuzz mutations.
- Crash-test persistent updates.
- Measure page reads.
- Measure write amplification.
- Include index cache memory.
- Remove unused indexes.
- Prefer bulk loading for sorted data.
- Keep covering fields intentional.
- Separate clustered and secondary costs.
- Bound untrusted key sizes.
- Choose tree family from workload.
- Document every augmentation invariant.

## 8. Frequently Asked Questions

### Why use a tree index?

It preserves order while providing logarithmic search paths and efficient range navigation.

### Why do databases use B+ trees?

High fan-out reduces page reads, while linked leaves make ordered range scans efficient.

### What is a separator key?

It divides child key ranges inside a multiway internal node.

### Why are leaves linked?

After one lower-bound lookup, a scan can advance through neighboring leaves without returning to internal nodes.

### What is a covering index?

It stores every field needed by a query, avoiding a separate base-record lookup.

### Why are updates expensive?

They may split, merge, rebalance, update ancestors, maintain augmentations, and persist recovery metadata.

### What is an augmented tree?

It stores compositional subtree summaries such as counts or maximum endpoints to support additional queries.

### Is a tree always better than a sorted array?

No.
Immutable small data often favors flat arrays through locality and low overhead.

### Is a hash index faster?

It often provides expected constant exact lookup but lacks natural ordered range operations.

### What does fan-out change?

Higher fan-out lowers tree height but increases work and storage inside each node.

### Why must collation be versioned?

Changing text order invalidates separator and leaf ordering even when stored bytes remain unchanged.

### What makes an index production-safe?

Validated ordering, recoverable updates, snapshot-consistent reads, bounded resources, and evidence that workload benefit exceeds maintenance cost.
