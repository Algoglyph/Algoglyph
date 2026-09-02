# ISAM Indexing: Static Search Boundaries, Primary Pages & Overflow Chains

![ISAM static index and overflow pages](/images/dsa/isam-indexing-dark.png#dark)

## 1. Historical Context & Motivation

Indexed Sequential Access Method stores records in sorted primary pages and uses a static index to locate the page responsible for a key range.

It combines two access modes.

Indexed lookup jumps near one key.

Sequential access scans neighboring records in key order.

The primary layout is created during bulk loading or reorganization.

Its separator boundaries remain fixed between reorganizations.

That static structure makes reads predictable and primary pages compact.

Updates create the central trade-off.

If a target primary page has room, a record can be inserted there.

If it is full, the new record goes to an overflow area associated with that page.

Further inserts can extend an overflow chain.

The static index still finds the correct primary page.

The search must then inspect that page's overflow records.

Read cost degrades as chains grow.

Periodic reorganization merges primary and overflow records into a new sorted primary layout.

ISAM therefore separates frequent incremental updates from less frequent rebuilds.

It fits read-heavy or append-constrained workloads better than update-heavy workloads requiring consistently bounded lookup.

Dynamic B-tree families solve a related problem differently.

They split, merge, and rebalance pages as updates occur.

That adds write-time structural work but prevents permanent linear overflow chains.

ISAM is not simply “an old B-tree.”

Its static search hierarchy and overflow policy define different invariants.

The concept remains useful when studying immutable sparse indexes, sorted runs, overflow storage, and rebuild-based maintenance.

Modern storage systems often use different names and more elaborate designs, but the trade-off recurs.

A stable base structure serves reads efficiently.

Updates accumulate in auxiliary storage.

A compaction or rebuild later folds them into a new base.

The central question is:

How can a static sparse index preserve correct key routing while overflow chains absorb updates without changing the primary page boundaries?

## 2. Core Mathematical Invariants

Assume records have unique ordered keys.

Let primary pages be $P_0,P_1,\ldots,P_{p-1}$.

Let boundary key $b_i$ be the smallest key routed to page $P_i$.

Boundaries are strictly increasing:

$$
b_0<b_1<\cdots<b_{p-1}.
$$

### Routing invariant

A key $k$ belongs to the greatest page index $i$ satisfying:

$$
b_i\le k.
$$

For all nonfinal pages, this is equivalent to:

$$
b_i\le k<b_{i+1}.
$$

Keys below $b_0$ need an explicit policy.

A complete implementation may make $b_0$ a negative-infinity sentinel or reject out-of-range keys.

Binary search over boundaries finds the responsible page.

### Static-boundary invariant

Ordinary inserts do not change $b_i$ values or primary page identities.

The index built during reorganization remains read-only.

An insert routed to $P_i$ stays logically associated with $P_i$, even if it lives in overflow.

Only reorganization creates a new primary partition.

### Primary-page ordering

Records inside a primary page are sorted by key.

Neighboring primary pages respect global range order.

Every primary key in $P_i$ belongs to page $i$'s routing interval.

The index need not contain one entry per record.

It is sparse because one boundary covers a page range.

### Overflow association

Every overflow record associated with page $P_i$ also belongs to $P_i$'s key interval.

Overflow storage can be a linked chain, page vector, or another auxiliary structure.

The logical invariant is association with exactly one primary page.

A search routed to $P_i$ must inspect both its primary records and its overflow records.

### Uniqueness invariant

With unique keys, a live key appears in exactly one place across primary and overflow storage.

Insertion must check for an existing key before adding a new record.

Updating a key's payload should not create a second physical version unless versioning semantics explicitly support it.

Deletion may use tombstones, physical removal, or rebuild-time reclamation.

The chosen policy must keep lookups unambiguous.

### Capacity invariant

Each primary page has fixed capacity $c$ between reorganizations.

Its primary-record count satisfies:

$$
0\le |P_i.primary|\le c.
$$

Overflow length is not bounded by that primary capacity.

That unbounded auxiliary growth is the source of degradation.

### Search completeness

If key $k$ exists, routing finds its unique owning page.

Searching the page's primary area and complete overflow chain must find it.

No other page needs inspection for exact lookup under valid boundaries.

### Reorganization invariant

Reorganization collects every live primary and overflow record.

It sorts by key, removes obsolete versions according to policy, creates new primary pages, and rebuilds boundaries.

The new structure contains the same logical mapping as the old structure.

All overflow chains start empty after a complete rebuild.

### Degradation metric

Let $L_i$ be overflow records or overflow pages attached to $P_i$.

Lookup cost after index routing includes $O(L_i)$ under a linear overflow scan.

Average chain length can hide one pathological hot range.

Track maximum and percentile chain lengths as well as totals.

## 3. Step-by-Step Execution Trace

Use page capacity three and these bulk-loaded records:

```text
(10,A), (20,B), (30,C), (40,D), (50,E), (60,F)
```

Create two primary pages:

```text
P0 boundary 10: [(10,A), (20,B), (30,C)]
P1 boundary 40: [(40,D), (50,E), (60,F)]
```

Both pages are full.

The static boundary array is `[10, 40]`.

### Search for key `50`

Binary search boundaries.

`40` is the greatest boundary no greater than `50`.

Route to `P1`.

Binary search or scan its primary records.

Find `(50,E)`.

No overflow access is required.

### Insert key `25`

Boundary `10` is the greatest boundary no greater than `25`.

Route to `P0`.

`P0` is full.

Add `(25,G)` to `P0`'s overflow area.

The primary page and boundary array do not change.

State:

```text
P0 primary: 10, 20, 30
P0 overflow: 25
P1 primary: 40, 50, 60
```

### Insert keys `27` and `15`

Both route to `P0`.

Both enter its overflow area.

Keep the simulation overflow sorted for easier lookup:

```text
P0 overflow: 15, 25, 27
```

The static index still contains only boundaries `10` and `40`.

### Search for key `27`

Route to `P0` through boundary `10`.

Search primary keys `10, 20, 30`; no match exists.

Search overflow keys `15, 25, 27`.

Find the record in overflow.

The index step stayed logarithmic in page count.

The overflow step grew with the hot range's updates.

### Insert key `55`

Route to `P1` through boundary `40`.

`P1` is full.

Add `55` to `P1` overflow.

Overflow growth is localized to its owning range.

### Exact lookup miss for key `35`

Boundary `10` routes `35` to `P0` because `35 < 40`.

Search `P0` primary and overflow.

No key `35` exists.

Do not inspect `P1` for exact lookup.

Its range begins at `40`.

### Sequential range scan `[20, 56]`

Route lower bound `20` to `P0`.

Merge relevant primary and overflow records for `P0`:

```text
20, 25, 27, 30
```

Continue to next primary range `P1`:

```text
40, 50, 55
```

Stop before key `60`, which exceeds the upper bound.

Global scan output is sorted only if each page's primary and overflow sources are merged by key.

Appending an unsorted overflow chain after a primary page would break ordered scan output.

### Reorganize

Collect keys:

```text
10, 15, 20, 25, 27, 30, 40, 50, 55, 60
```

With capacity three, build new primary pages:

```text
P0: 10, 15, 20
P1: 25, 27, 30
P2: 40, 50, 55
P3: 60
```

New boundaries are `[10, 25, 40, 60]`.

All overflow areas become empty.

Logical records are unchanged.

Physical routing has been rebuilt.

## 4. Production-Ready Implementations

The following in-memory model demonstrates static routing and overflow behavior.

It is an educational storage model, not a durable database engine.

```python
from bisect import bisect_left, bisect_right, insort
from dataclasses import dataclass, field
from typing import Iterable, Iterator

Record = tuple[int, str]


@dataclass
class Page:
    boundary: int
    capacity: int
    primary: list[Record] = field(default_factory=list)
    overflow: list[Record] = field(default_factory=list)


class ISAM:
    def __init__(self, records: Iterable[Record], page_capacity: int) -> None:
        if page_capacity <= 0:
            raise ValueError("page_capacity must be positive")

        ordered = sorted(records)
        if any(ordered[i - 1][0] == ordered[i][0] for i in range(1, len(ordered))):
            raise ValueError("keys must be unique")

        self.page_capacity = page_capacity
        self.pages: list[Page] = []
        for start in range(0, len(ordered), page_capacity):
            chunk = ordered[start : start + page_capacity]
            self.pages.append(Page(chunk[0][0], page_capacity, chunk))
        self._refresh_boundaries()

    def _refresh_boundaries(self) -> None:
        self.boundaries = [page.boundary for page in self.pages]

    def _page_for(self, key: int) -> Page:
        index = bisect_right(self.boundaries, key) - 1
        if index < 0:
            raise KeyError("key falls below the first ISAM boundary")
        return self.pages[index]

    @staticmethod
    def _find(records: list[Record], key: int) -> int:
        return bisect_left(records, (key, ""))

    def get(self, key: int) -> str:
        page = self._page_for(key)
        for records in (page.primary, page.overflow):
            index = self._find(records, key)
            if index < len(records) and records[index][0] == key:
                return records[index][1]
        raise KeyError(key)

    def insert(self, key: int, value: str) -> None:
        page = self._page_for(key)
        for records in (page.primary, page.overflow):
            index = self._find(records, key)
            if index < len(records) and records[index][0] == key:
                raise ValueError(f"duplicate key {key}")

        target = page.primary if len(page.primary) < page.capacity else page.overflow
        insort(target, (key, value))

    def reorganize(self) -> None:
        records = [record for page in self.pages for record in page.primary + page.overflow]
        rebuilt = ISAM(records, self.page_capacity)
        self.pages = rebuilt.pages
        self._refresh_boundaries()
```

The model refuses keys below the first boundary.

A production format would normally include an explicit low sentinel or well-defined minimum key domain.

### Execute the trace

```python
index = ISAM(
    [(10, "A"), (20, "B"), (30, "C"), (40, "D"), (50, "E"), (60, "F")],
    page_capacity=3,
)

assert index.get(50) == "E"
index.insert(25, "G")
index.insert(27, "H")
index.insert(15, "I")
index.insert(55, "J")

assert index.get(27) == "H"
assert [record[0] for record in index.pages[0].overflow] == [15, 25, 27]
assert index.boundaries == [10, 40]

index.reorganize()

assert index.boundaries == [10, 25, 40, 60]
assert all(not page.overflow for page in index.pages)
assert index.get(55) == "J"
```

### Validate physical invariants

```python
def valid_isam(index: ISAM) -> bool:
    if index.boundaries != sorted(index.boundaries):
        return False
    if index.boundaries != [page.boundary for page in index.pages]:
        return False

    seen: set[int] = set()
    for page_number, page in enumerate(index.pages):
        if len(page.primary) > page.capacity:
            return False
        combined = page.primary + page.overflow
        for key, _ in combined:
            owner = bisect_right(index.boundaries, key) - 1
            if owner != page_number or key in seen:
                return False
            seen.add(key)
    return True


assert valid_isam(index)
```

Durable implementations additionally need page checksums, transactional update rules, crash recovery, concurrency control, and stable on-disk encoding.

## 5. Asymptotic Time & Space Complexity

Let $p$ be the number of primary pages.

Let $c$ be primary page capacity.

Let $L_i$ be overflow length for the routed page.

Binary search over static boundaries costs $O(\log p)$.

Searching a sorted primary page costs $O(\log c)$ comparisons in the in-memory model.

With fixed page size, this is often treated as bounded page-local work.

Searching a sorted overflow vector costs $O(\log L_i)$ comparisons.

An on-disk linked overflow chain may require $O(L_i)$ page or record visits.

The physical I/O model matters more than an in-memory comparator count.

Inserting into sorted primary or overflow arrays can shift $O(c)$ or $O(L_i)$ records.

Page-based systems insert into a page with bounded capacity and allocate overflow pages as needed.

Reorganization over $n$ records costs $O(n)$ if records can be merged from already sorted page streams.

A naive collection followed by comparison sort costs $O(n\log n)$.

Writing the rebuilt structure costs $O(n)$ sequential output.

The index and records occupy $O(p+n)$ logical storage, plus free space reserved in pages and overflow metadata.

| Operation | Logical bound | Dominant physical concern |
|---|---:|---|
| Route exact key | $O(\log p)$ | Index page reads |
| Search routed page | $O(\log c + L_i)$ model-dependent | Overflow I/O |
| Insert into full page | $O(\log p + L_i)$ model-dependent | Overflow allocation |
| Sequential scan | $O(n)$ | Merge and sequential reads |
| Reorganize | $O(n)$ merge or $O(n\log n)$ sort | Rewrite volume |

Static index depth can be more than one page in real systems.

Then route cost depends on index fanout and storage levels rather than a single in-memory binary search.

## 6. Systems Connections

### B+ trees

B+ trees update search structure as pages split and merge.

They avoid unbounded static overflow chains at the cost of structural writes and concurrency complexity.

ISAM favors a stable primary layout between rebuilds.

Neither design is universally superior without a workload and storage model.

### Log-structured storage

Log-structured merge designs also separate new writes from stable sorted data.

They accumulate sorted runs and compact them across levels rather than attaching one overflow chain to each fixed primary page.

The recurring idea is deferred reorganization.

The write and read amplification patterns differ substantially.

### Sparse indexes

One boundary per page is a sparse index.

It works because records are ordered and pages own contiguous key ranges.

An unordered data file cannot use the same boundary rule.

Sparse indexing saves index space but requires page-local search.

### Range scans

Primary pages support sequential key-order access.

Overflow records complicate that order.

The scan must merge sources per range or accept unsorted output.

Long chains increase random reads and reduce the advantage of sequential layout.

### Hot ranges

Skewed insert distributions can overload one page's overflow while other pages remain untouched.

Average utilization misses this problem.

Monitor the maximum overflow depth and insertion distribution by key range.

Reorganization can choose new boundaries or fill factors to leave room in hot regions.

### Concurrency and recovery

Readers must see a consistent primary-plus-overflow state while writers append or reorganize.

Rebuild publication is commonly treated as a version switch after the new structure is complete.

Crash recovery must distinguish committed records from partial overflow or rebuild writes.

The tutorial model intentionally omits these storage-engine concerns.

### Security and validation

Corrupt boundaries can route searches to the wrong page.

Corrupt overflow pointers can form cycles.

Loaders should validate monotone boundaries, page bounds, record ownership, and chain limits before following untrusted storage metadata.

## 7. Practice Checklist

- Define the key order and duplicate policy.
- Define the minimum-key routing policy.
- Keep boundaries strictly increasing.
- Route with the greatest boundary no greater than the key.
- Keep primary records sorted.
- Keep every overflow record associated with one owning range.
- Preserve static boundaries between reorganizations.
- Check primary capacity before inserting.
- Reject or update duplicate keys consistently.
- Search both primary and overflow storage.
- Merge primary and overflow sources for ordered range scans.
- Track overflow length per page.
- Track maximum rather than only average overflow.
- Trigger reorganization from measured degradation.
- Preserve all live records during rebuild.
- Remove obsolete versions according to one policy.
- Rebuild boundaries from the new primary layout.
- Publish a rebuilt structure atomically.
- Test exact boundary keys.
- Test keys immediately below the next boundary.
- Test a key below the first boundary.
- Test a missing key inside a valid range.
- Test insertion into a page with space.
- Test insertion into a full page.
- Test duplicate insertion.
- Test multiple overflow records in one hot range.
- Test ordered range scans across pages.
- Test invariant preservation after reorganization.
- Validate overflow pointers against cycles in on-disk formats.
- Include crash and concurrency semantics in a real storage engine.

## 8. Frequently Asked Questions

### What makes ISAM static?

Its primary page layout and sparse index boundaries do not split or rebalance during ordinary inserts.

They change during explicit reorganization.

### Where do new records go when a page is full?

They go to overflow storage associated with the page whose key range owns them.

The static index still routes searches to that primary page.

### Why do overflow chains hurt performance?

Searches must follow or inspect additional storage after reaching the primary page.

Long chains add comparisons, pointer traversal, and potentially random I/O.

### Is ISAM the same as a B+ tree?

No.

A B+ tree dynamically splits and rebalances pages; ISAM keeps a static primary index and absorbs inserts through overflow until rebuild.

### Can ISAM support range scans?

Yes.

Primary pages are sequentially ordered, but overflow records must be merged into key order for a fully sorted scan.

### How is the owning page found?

Choose the greatest boundary key not greater than the search key.

This can be done with binary search over the boundary array or through a multi-level sparse index.

### What happens to keys below the first boundary?

The format must define it.

Use a low sentinel, reserve a minimum domain boundary, or reject those keys explicitly.

### When should reorganization run?

Use overflow depth, read amplification, free-space distribution, and workload windows.

A fixed schedule may rebuild too often or tolerate severe hot-range degradation too long.

### Can reorganization be linear-time?

Yes when primary and overflow sources are maintained in sortable runs that can be merged.

Collecting unsorted records and comparison-sorting them costs $O(n\log n)$.

### Does the static index eliminate all scans?

No.

It narrows an exact lookup to one primary range; page-local and overflow search still remain.

### What modern idea resembles ISAM's overflow strategy?

Many storage systems keep a stable optimized base plus auxiliary updates and periodically compact or rebuild them.

The exact data structures and performance guarantees differ.
