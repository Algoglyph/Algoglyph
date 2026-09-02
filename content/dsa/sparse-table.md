# Sparse Table: Immutable Range Queries with Overlapping Powers of Two

![Sparse-table interval decomposition](/images/dsa/sparse-table-dark.png)

## 1. Historical Context & Motivation

Many programs repeatedly ask questions about fixed data.
Given an array, they may request the minimum value between two indices thousands or millions of times.
Scanning every requested interval wastes the fact that the array never changes.
A **sparse table** preprocesses answers for carefully chosen power-of-two intervals.
Each query then combines a small number of precomputed intervals.
For range minimum, maximum, greatest common divisor, and bitwise AND or OR, two intervals are enough.
The resulting query time is $O(1)$ after $O(n\log n)$ preprocessing.
The structure is called sparse because it stores only logarithmically many interval lengths rather than every one of the $\Theta(n^2)$ possible ranges.
For each start index, it records intervals of lengths $1,2,4,8,\ldots$ that fit in the array.
This family of canonical intervals resembles binary lifting in trees.
Both techniques precompute effects of jumps whose lengths are powers of two.
Sparse tables are most useful when updates are absent or extremely rare.
They exchange preprocessing time and memory for very fast reads.
A segment tree supports updates but has $O(\log n)$ query time and more pointer-like traversal.
A prefix sum answers static range sums in $O(1)$ with only $O(n)$ memory.
The classic sparse-table overlap trick does not directly support sum because overlapping elements would be counted twice.
The algebraic property of the query operation therefore decides whether the structure applies.
Range minimum is the canonical example because `min(x, x) = x`.
Repeating an element does not change the result.
This property is called idempotence.
The structure also works for range maximum, GCD, and set intersection under suitable representations.
It is common in competitive programming because it has compact code and deterministic performance.
It also appears inside lowest-common-ancestor solutions after an Euler tour converts the problem into range minimum queries.
Static analytical systems can use the same technique for immutable snapshots.
A sparse table is not universally optimal.
Its $O(n\log n)$ memory can be excessive for very large arrays.
Preprocessing may cost more than it saves when there are few queries.
Update-heavy workloads should choose another structure.
Understanding the invariant makes these trade-offs precise.
The table is not magic lookup storage.
It is a dynamic program over interval length combined with an algebraic rule for reconstructing arbitrary queries.

## 2. Core Mathematical Invariants

Let the input array be $a[0\ldots n-1]$.
Let $f$ be the aggregation operation, such as minimum.
Define `table[k][i]` as the aggregate of the interval beginning at $i$ with length $2^k$.
In mathematical notation,

$$
\text{table}[k][i] = f(a[i],a[i+1],\ldots,a[i+2^k-1]).
$$

The entry exists only when $i+2^k\le n$.
Level zero contains intervals of length one.
Therefore `table[0][i] = a[i]`.
Every longer power-of-two interval is the concatenation of two adjacent half intervals.
This gives the recurrence

$$
\text{table}[k][i]
= f(\text{table}[k-1][i],
    \text{table}[k-1][i+2^{k-1}]).
$$

The preprocessing invariant says every completed level $k$ stores correct aggregates for all valid length-$2^k$ intervals.
It holds for level zero by definition.
If it holds for level $k-1$, the recurrence combines exactly the left and right halves of every level-$k$ interval.
Associativity of $f$ makes this regrouping valid.
For a query interval $[L,R]$ inclusive, let its length be $m=R-L+1$.
Choose $k=\lfloor\log_2 m\rfloor$.
Then $2^k\le m<2^{k+1}$.
One stored interval of length $2^k$ begins at $L$.
Another stored interval of the same length ends at $R$ and begins at $R-2^k+1$.
Together these two intervals cover the query range.
They may overlap in the middle.
For an idempotent operation, overlap is harmless because $f(x,x)=x$.
The query formula is

$$
f(\text{table}[k][L],
  \text{table}[k][R-2^k+1]).
$$

For `min`, every query element occurs in at least one selected interval.
Elements in the overlap may occur twice, but duplicating a candidate does not change the minimum.
The same reasoning applies to `max`, GCD, bitwise AND, and bitwise OR.
Associativity alone is sufficient for building the table.
Idempotence is what permits the overlapping two-block $O(1)$ query.
Commutativity is convenient but not the essential property of this particular proof.
For non-idempotent operations such as sum or product, the overlap would duplicate contributions.
Classic sparse-table queries can instead decompose the interval into disjoint power-of-two blocks.
That takes $O(\log n)$ combinations.
For sums, a prefix array is simpler and uses less memory.
For general associative operations with constant-time static queries, a disjoint sparse table is a different construction.
The log lookup is another invariant.
Define `logs[m] = floor(log2(m))` for positive integer lengths.
It can be precomputed by `logs[m] = logs[m // 2] + 1`.
This avoids floating-point logarithms and their rounding hazards.
The maximum level is $K=\lfloor\log_2 n\rfloor$.
There are $K+1$ levels including zero.
Level $k$ contains $n-2^k+1$ valid entries.
Rectangular implementations often allocate $n$ slots per level and ignore invalid suffix cells.
Their storage remains $O(n\log n)$.
A packed implementation stores only valid entries and saves lower-order space.
The table is immutable with respect to the source snapshot.
Changing one array value invalidates every stored interval containing that position.
There are $O(n)$ such intervals across all starts and levels in the worst case if repaired naïvely.
Sparse tables therefore promise query speed only under a static-data invariant.
Rebuilding after batches of updates may still be practical when reads greatly outnumber writes.
Index conventions must remain consistent.
An inclusive query uses length $R-L+1$ and right-block start $R-2^k+1$.
A half-open query $[L,R)$ uses length $R-L$ and right-block start $R-2^k$.
Mixing these formulas creates subtle off-by-one errors.
Empty intervals have no natural minimum unless an identity such as positive infinity is introduced.
Most APIs reject empty range-minimum queries.
The correctness contract should specify whether endpoints are inclusive or half-open.

## 3. Step-by-Step Execution Trace

Build a range-minimum sparse table for `[7, 2, 3, 0, 5, 10, 3, 12, 18]`.
The array length is $n=9$.
The maximum power-of-two exponent is $\lfloor\log_2 9\rfloor=3$.
Level zero represents intervals of length one.
It is exactly `[7, 2, 3, 0, 5, 10, 3, 12, 18]`.
Level one represents intervals of length two.
At start zero, combine `min(7, 2)` to obtain `2`.
At start one, combine `min(2, 3)` to obtain `2`.
At start two, combine `min(3, 0)` to obtain `0`.
Continuing across the array produces `[2, 2, 0, 0, 5, 3, 3, 12]`.
Level two represents intervals of length four.
Each entry combines two adjacent length-two entries.
At start zero, combine level-one starts zero and two: `min(2, 0) = 0`.
This corresponds to original indices zero through three.
At start one, combine starts one and three: `min(2, 0) = 0`.
At start two, combine starts two and four: `min(0, 5) = 0`.
At start three, combine starts three and five: `min(0, 3) = 0`.
At start four, combine starts four and six: `min(5, 3) = 3`.
At start five, combine starts five and seven: `min(3, 12) = 3`.
Level two is `[0, 0, 0, 0, 3, 3]`.
Level three represents intervals of length eight.
At start zero, combine the length-four intervals starting at zero and four.
The result is `min(0, 3) = 0`.
At start one, combine length-four intervals starting at one and five.
The result is also `0`.
Level three is `[0, 0]`.
Now query the inclusive interval `[1, 6]`.
Its values are `[2, 3, 0, 5, 10, 3]`.
The query length is six.
The largest power of two not exceeding six is four, so $k=2$.
The left length-four block starts at index one and covers indices one through four.
Its precomputed minimum is `table[2][1] = 0`.
The right length-four block ends at index six.
It starts at $6-4+1=3$ and covers indices three through six.
Its precomputed minimum is `table[2][3] = 0`.
The blocks overlap at indices three and four.
Combining them gives `min(0, 0) = 0`.
The result matches a direct scan.
Query `[4, 6]` next.
Its length is three, so $k=1$ and block length is two.
The left block covers indices four and five with minimum `5`.
The right block covers indices five and six with minimum `3`.
Index five appears twice.
Idempotence makes that duplication harmless.
The query result is `min(5, 3) = 3`.
Query the singleton interval `[8, 8]`.
Its length is one, so $k=0$.
Both selected blocks refer to `table[0][8]`.
The result is `min(18, 18) = 18`.
This confirms that the same formula handles singleton queries.
Now consider trying the overlap formula for sum on `[4, 6]`.
The left block sum is `5 + 10 = 15`.
The right block sum is `10 + 3 = 13`.
Adding them produces `28`, but the correct range sum is `18`.
The overlapping value `10` was counted twice.
This failed trace identifies idempotence as a necessary query property rather than a superficial implementation detail.

## 4. Production-Ready Implementations

This Python implementation provides immutable inclusive range-minimum queries.
It validates construction and query boundaries and computes logs with integer recurrence.

```python
from __future__ import annotations

from collections.abc import Iterable
from typing import Generic, TypeVar


T = TypeVar("T")


class RangeMinimumSparseTable(Generic[T]):
    def __init__(self, values: Iterable[T]) -> None:
        data = list(values)
        if not data:
            raise ValueError("a sparse table requires at least one value")

        self._n = len(data)
        self._logs = [0] * (self._n + 1)
        for length in range(2, self._n + 1):
            self._logs[length] = self._logs[length // 2] + 1

        levels = self._logs[self._n] + 1
        self._table: list[list[T]] = [data]

        for level in range(1, levels):
            half = 1 << (level - 1)
            width = 1 << level
            previous = self._table[level - 1]
            current = [
                min(previous[start], previous[start + half])
                for start in range(self._n - width + 1)
            ]
            self._table.append(current)

    def __len__(self) -> int:
        return self._n

    def minimum(self, left: int, right: int) -> T:
        """Return min(values[left:right + 1])."""
        if not 0 <= left <= right < self._n:
            raise IndexError("expected 0 <= left <= right < len(values)")

        length = right - left + 1
        level = self._logs[length]
        width = 1 << level
        return min(
            self._table[level][left],
            self._table[level][right - width + 1],
        )


def demo() -> None:
    values = [7, 2, 3, 0, 5, 10, 3, 12, 18]
    table = RangeMinimumSparseTable(values)
    assert table.minimum(1, 6) == 0
    assert table.minimum(4, 6) == 3
    assert table.minimum(8, 8) == 18
    print(table.minimum(2, 7))


if __name__ == "__main__":
    demo()
```

The constructor copies its input so later caller mutations cannot silently invalidate the table.
That copy is part of the implementation's ownership contract.
If values are immutable and the caller guarantees snapshot stability, a specialized implementation might avoid it.
The packed rows store only valid starting positions.
This saves unused suffix cells and makes accidental invalid access more visible.
Generic `min` requires elements with a total ordering.
Production code should document behavior for NaN-like values or incomparable mixed types.
A custom comparator can be supported by storing indices rather than values.
An index sparse table returns the position of a minimum and resolves ties by a declared rule.
Tie handling matters for lowest-common-ancestor reductions that depend on the first occurrence.
For maximum queries, replace `min` consistently in build and query.
For GCD, use an integer GCD function in both places.
Do not expose a generic arbitrary combine function with an $O(1)$ overlap query unless its idempotence is guaranteed by the API.
Type systems rarely prove algebraic laws.
Documentation and property tests must enforce the contract.
Test every interval against a direct scan for small random arrays.
Include singleton ranges, the entire array, and intervals whose lengths straddle powers of two.
Include duplicate minima to test tie behavior when indices are returned.
Use integer logs rather than floating point.
In performance-sensitive implementations, precompute the log array once per maximum supported size or use bit-length instructions.
In Python, `length.bit_length() - 1` computes the floor logarithm without a lookup array.
The lookup shown here makes the textbook state explicit and is portable across languages.
Flat memory layouts can reduce allocation overhead in C++ or Rust.
Store levels contiguously or keep one vector per level depending on access patterns.
Preprocessing is easy to parallelize within a level because entries read only the previous level.
Levels themselves must remain sequential due to dependency.
Do not parallelize small arrays where scheduling overhead exceeds useful work.
For persisted immutable datasets, a prebuilt table can be memory-mapped.
Validate version, endianness, type width, length, and checksum before trusting serialized contents.
Sparse-table values derived from untrusted input remain ordinary data; avoid unsafe deserialization formats.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the array length.
There are $\lfloor\log_2 n\rfloor+1$ levels.
Level $k$ contains $n-2^k+1$ valid intervals.
The total number of stored entries is

$$
\sum_{k=0}^{\lfloor\log_2 n\rfloor}(n-2^k+1).
$$

There are $O(\log n)$ terms, each at most $n$.
Therefore storage is $O(n\log n)$.
A lower estimate also has $\Theta(n)$ entries on each of the first $\Theta(\log n)$ levels until interval width becomes comparable with $n$.
Thus the storage bound is tight: $\Theta(n\log n)$.
Each stored entry performs one constant-time combine operation.
Preprocessing time is therefore $\Theta(n\log n)$ when $f$ is constant time.
If combining values has cost $C$, preprocessing becomes $\Theta(Cn\log n)$.
The integer log array needs $O(n)$ time and $O(n)$ additional space.
Using a machine bit operation can remove that array while preserving constant query time.
An idempotent range query performs one log lookup, two table reads, and one combine.
Its time is $O(1)$.
No query allocation is required, so auxiliary query space is $O(1)$.
Construction uses the final table itself plus temporary row references.
Its auxiliary space beyond the returned structure can be $O(n)$ or $O(1)$ depending on how rows are allocated and counted.
The structure's retained space remains $\Theta(n\log n)$.
Building from a copied input adds $O(n)$ retained or temporary space but does not change the dominant bound.
Classic disjoint decomposition for an associative non-idempotent operation uses at most $O(\log n)$ blocks per query.
That query time is $O(\log n)$.
A prefix-sum array provides $O(n)$ preprocessing, $O(n)$ space, and $O(1)$ range sums when subtraction is available.
A segment tree provides $O(n)$ storage, $O(n)$ build, $O(\log n)$ query, and $O(\log n)$ point update.
A Fenwick tree provides $O(n)$ storage and $O(\log n)$ prefix updates and queries for group-like operations.
The sparse table wins when data is static, query count is high, memory fits, and idempotent aggregates are required.
Suppose there are $q$ queries.
A direct scan costs $O(qn)$ in the worst case with almost no preprocessing.
A sparse table costs $O(n\log n+q)$.
For sufficiently large $q$, preprocessing is amortized across reads.
For a handful of short intervals, direct scans may be faster in practice despite inferior worst-case notation.
Cache behavior affects constants.
The two queried cells can be far apart but require only a few memory accesses.
The table itself is larger than the source array and may not fit in cache.
Packed rows reduce footprint but complicate indexing only slightly.
As always, asymptotic superiority does not erase workload-dependent constants.

## 6. Systems Connections

The Euler-tour reduction for lowest common ancestor is a celebrated sparse-table application.
A depth-first traversal records each visited tree vertex and its depth.
The lowest common ancestor of two vertices corresponds to the minimum-depth entry between their first Euler occurrences.
An RMQ sparse table then answers each LCA query in $O(1)$ after preprocessing.
This design is attractive when the tree is static and query volume is high.
Versioned configuration snapshots can support immutable range diagnostics with similar precomputation.
Time-series blocks that are sealed after ingestion can build per-block minimum and maximum tables.
Mutable recent data may use another structure until the block closes.
This hybrid respects the immutable invariant instead of pretending updates are free.
Columnar analytics systems frequently compute zone maps or hierarchical summaries.
Those indexes are not always literal sparse tables, but they use the same principle of precomputed aggregates over canonical ranges.
Static geometry pipelines use range minima in Cartesian-tree and LCA reductions.
Suffix-array algorithms use RMQ over longest-common-prefix arrays to answer substring similarity queries.
After building the suffix array and LCP array, a minimum over the intervening LCP values gives the common prefix length of two suffixes.
Immutable routing or policy snapshots can precompute range aggregates when their query semantics match.
The entire snapshot must be replaced on change so readers never mix levels from different versions.
Read-copy-update techniques can publish a newly built table atomically while existing readers finish on the old one.
The memory peak during publication includes both versions.
That operational cost should be included in capacity planning.
Serialization can reduce startup work for fixed datasets.
The serialized format must bind the table to an exact source version or content digest.
Otherwise stale precomputed answers can appear valid.
SIMD can accelerate preprocessing because adjacent entries perform identical combines.
GPU construction is possible for very large arrays, with a synchronization boundary between levels.
Transfer costs may dominate unless data already resides on the device.
In concurrent programs, immutable sparse tables are naturally read-safe.
Queries need no locks after safe publication.
This makes their memory-heavy preprocessing valuable in read-mostly services.
Security-sensitive bounds checking remains necessary when endpoints come from untrusted requests.
An out-of-range table access in an unsafe language can become memory corruption.
Validate endpoints before computing shifts or offsets.
Reject arrays whose $n\log n$ allocation would overflow size arithmetic.
Use checked multiplication when calculating serialized or contiguous allocation sizes.
Immutability simplifies reasoning, but it does not eliminate input validation.

## 7. Practice Checklist

- Confirm the source data will remain immutable for the table's lifetime.
- Name the aggregation operation explicitly.
- Verify associativity for preprocessing.
- Verify idempotence before using overlapping two-block queries.
- Do not apply the overlap formula to sums or products.
- Decide whether query endpoints are inclusive or half-open.
- Keep that convention consistent in length and right-block formulas.
- Reject empty intervals unless a documented identity is supported.
- Validate `0 <= left <= right < n` for inclusive APIs.
- Build level zero directly from the input snapshot.
- Build each higher level from two adjacent half intervals.
- Stop when $2^k>n$.
- Compute floor logarithms with integer logic.
- Avoid floating-point `log2` for index selection.
- Test interval lengths one, two, powers of two, and one beyond each power.
- Test the full array and both boundary singletons.
- Test duplicate minima and declared tie behavior.
- Compare every small interval against a direct implementation.
- Property-test random arrays and ranges.
- Store indices if callers need minimum positions rather than values.
- Define tie-breaking when storing indices.
- Keep build and query combine operations identical.
- Estimate $n\log n$ memory before allocation.
- Use checked size arithmetic in native implementations.
- Prefer packed rows when memory pressure matters.
- Measure preprocessing amortization against actual query volume.
- Choose prefix aggregates for invertible static operations such as sum.
- Choose a segment or Fenwick tree when updates are required.
- Consider a disjoint sparse table for general static associative queries.
- Version persisted tables with their source data.
- Publish rebuilt snapshots atomically.
- Account for overlapping old and new snapshots during replacement.
- Validate serialized tables before mapping them into memory.
- Keep query methods allocation-free.
- Document element ordering requirements.
- Define behavior for NaN or exceptional numeric values.
- Benchmark cache effects for large tables.
- Preserve immutable ownership across API boundaries.
- Include the source snapshot in lifecycle planning.
- Explain why the selected algebra supports the advertised complexity.

## 8. Frequently Asked Questions

### Why is it called a sparse table?

It stores only power-of-two interval lengths for each start rather than all possible intervals.
The stored family is sparse relative to the $\Theta(n^2)$ complete interval set.

### Why can two blocks answer a range minimum query?

The largest fitting power-of-two block is more than half the query length.
A block anchored at each endpoint therefore covers the whole range, with possible overlap.

### Why does overlap not break minimum queries?

Minimum is idempotent: repeating a value does not change the result.
The same is true for maximum, GCD, bitwise AND, and bitwise OR.

### Can a classic sparse table answer range sums in $O(1)$?

Not with the overlapping two-block formula, because overlapping elements are counted twice.
Use prefix sums for ordinary static range sums or a disjoint sparse table for a general associative operation.

### Can the array be updated?

Not efficiently in the classic structure.
An update invalidates many precomputed intervals; use a segment tree or Fenwick tree for update-heavy workloads.

### How much memory does it need?

It stores $\Theta(n\log n)$ aggregate values.
This is the main cost exchanged for constant-time idempotent queries.

### Should logarithms be computed with floating point?

No.
Use a precomputed integer log table or a bit-length operation to avoid rounding errors near powers of two.

### Does the operation need to be commutative?

The build fundamentally needs associativity.
The classic overlap query needs idempotence; exact ordering details matter for noncommutative operations and should be modeled explicitly.

### How are duplicate minima handled?

If only the value is stored, duplicates are indistinguishable and harmless.
If an index is required, store indices and define whether the leftmost or rightmost minimum wins.

### When is a sparse table better than a segment tree?

It is compelling for immutable data with many idempotent range queries and enough memory.
A segment tree is preferable when updates or lower retained space matter more than constant query time.

### Is preprocessing parallelizable?

Entries within one level are independent and can be computed in parallel.
Levels remain sequential because each depends on the previous one.

### What is the most common implementation bug?

Mixing inclusive and half-open endpoint formulas is especially common.
Writing the interval convention into the API and tests prevents that class of off-by-one error.
