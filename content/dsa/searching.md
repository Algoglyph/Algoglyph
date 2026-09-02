# Linear, Binary & Multi-Interval Searching: Preconditions, Boundaries & Query Selection

![Searching strategies across arrays and intervals](/images/dsa/searching-dark.png#dark)

## 1. Historical Context & Motivation

Searching maps a query to matching data or proves that no match exists.

The best method depends on structure already present in the data.

Linear search assumes almost nothing and examines candidates directly.

Binary search exploits monotonic order to discard half a range per decision.

Interval search exploits geometry and augmented summaries to prune regions.

No search algorithm is universally best.

Preprocessing can make repeated queries faster.

Sorting costs time and can change original order.

Hash indexes use extra memory and offer different ordering guarantees.

Tree indexes support dynamic ordered updates.

Search design therefore includes workload frequency and mutation rate.

For one query over a tiny unsorted list, linear scanning is often optimal.

For many queries over static ordered data, binary search amortizes preparation.

For overlap queries, scalar ordering alone is insufficient.

An interval index stores endpoints plus subtree reach information.

Correctness failures often occur at boundaries.

Should a range include its upper endpoint?

Should duplicate keys return the first, last, or any occurrence?

Does a failed search return `-1`, an insertion position, or an empty collection?

These are API contracts, not cosmetic choices.

Binary-search loops are short yet notoriously prone to off-by-one errors.

Half-open ranges `[lo,hi)` make empty ranges and lengths algebraically clean.

Lower bound finds the first position whose value is not less than the target.

Upper bound finds the first position whose value is greater than the target.

Together they identify the complete duplicate range.

Search predicates can generalize beyond arrays.

Binary search on answer finds the first feasible value of a monotone predicate.

The predicate must change direction at most once.

This article unifies search around one rule:

Every discarded region needs a proof that it cannot contain a valid answer.

## 2. Core Mathematical Invariants

### Linear-search invariant

Before examining index `i`, no index in `[0,i)` contains an unreported target.

Indices `[i,n)` remain unexamined.

If `A[i]` matches, returning `i` is correct for first-match search.

If the loop ends, every index has been excluded.

### Sorted-order precondition

Binary search requires a monotone order under the same comparator used by the query.

For ascending data:

$$
A[i]\le A[j]\quad\text{whenever }i<j.
$$

Searching unsorted data with binary search has no correctness guarantee.

### Lower-bound invariant

Maintain half-open candidate range `[lo,hi)`.

All indices below `lo` contain values less than target.

All indices at or above `hi` contain values not less than target.

Compute midpoint:

$$
mid=lo+\left\lfloor\frac{hi-lo}{2}\right\rfloor.
$$

If `A[mid] < target`, set `lo = mid + 1`.

Otherwise set `hi = mid`.

At termination `lo == hi` and is the lower-bound position.

### Exact-search derivation

Compute lower bound `p`.

An exact match exists iff `p < n` and `A[p] == target`.

This returns the first duplicate occurrence.

It also provides insertion position when absent.

### Upper-bound invariant

All indices below `lo` contain values at most target.

All indices at or above `hi` contain values greater than target.

The update tests `target < A[mid]` rather than `A[mid] < target`.

The equal-key interval is `[lower_bound, upper_bound)`.

Its count is the endpoint difference.

### Termination invariant

Every binary-search iteration strictly shrinks `hi-lo`.

Choosing `mid` inside `[lo,hi)` and using `mid+1` on the right move guarantees progress.

Updates that leave endpoints unchanged can loop forever.

### Monotone-predicate invariant

Suppose predicate `P(x)` is false below a boundary and true from the boundary onward.

Maintain one known-false side and one known-true side or a candidate half-open range.

Each midpoint evaluation discards values with the same proven predicate state.

At termination, the first true position remains.

### Interval-overlap invariant

Closed intervals `[a,b]` and `[c,d]` overlap iff:

$$
a\le d\land c\le b.
$$

Half-open intervals `[a,b)` and `[c,d)` overlap iff:

$$
a<d\land c<b.
$$

An interval tree stores the maximum endpoint in each subtree.

If a subtree maximum ends before the query begins, that subtree cannot overlap.

### Search/index trade-off

An index is correct only if updates keep it synchronized with source data.

A stale sorted array or interval summary can return plausible but wrong answers.

Versioning or transactional updates preserve index-data agreement.

## 3. Step-by-Step Execution Trace

Search sorted array `[2,4,4,4,7,9,12]` for target `4`.

Use lower-bound range `[lo,hi) = [0,7)`.

Midpoint is `3` and value is `4`.

Because value is not less than target, set `hi = 3`.

Candidate range becomes `[0,3)`.

Midpoint is `1` and value is `4`.

Again set `hi = 1`.

Candidate range becomes `[0,1)`.

Midpoint is `0` and value is `2`.

Because `2 < 4`, set `lo = 1`.

Now `lo == hi == 1`.

Lower bound is index `1`.

Array index `1` equals target, so exact search succeeds.

This is the first occurrence.

Now compute upper bound for `4`.

Start range `[0,7)` and midpoint `3` with value `4`.

Since value is not greater than target, set `lo = 4`.

Range becomes `[4,7)`.

Midpoint is `5` and value is `9`.

Since `9 > 4`, set `hi = 5`.

Range becomes `[4,5)`.

Midpoint is `4` and value is `7`.

Set `hi = 4`.

Upper bound is index `4`.

The target interval is `[1,4)`.

There are `4 - 1 = 3` occurrences.

### Absent-target trace

Search for `6` with lower bound.

The procedure returns index `4` where value is `7`.

Because `7 != 6`, exact search reports absence.

Index `4` is also the sorted insertion position for `6`.

### Linear-search trace

Search unsorted `[9,2,7,2]` for first `2`.

Index `0` is `9`, so exclude it.

Index `1` is `2`, so return `1`.

No sorting or preprocessing was required.

### Monotone-answer trace

Find smallest integer `x` with $x^2\ge30$.

On range `[0,31)`, midpoint `15` is feasible.

Move high to `15`.

Midpoint `7` is feasible because `49 >= 30`.

Move high to `7`.

Midpoint `3` is infeasible because `9 < 30`.

Move low to `4`.

Midpoint `5` is infeasible because `25 < 30`.

Move low to `6`.

Midpoint `6` is feasible because `36 >= 30`.

Move high to `6`.

Return `6` as the first feasible integer.

## 4. Production-Ready Implementations

The following Python functions expose lower-bound semantics directly.

```python
from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TypeVar

T = TypeVar("T")


def linear_search(values: Sequence[T], target: T) -> int:
    for index, value in enumerate(values):
        if value == target:
            return index
    return -1


def lower_bound(values: Sequence[T], target: T) -> int:
    lo = 0
    hi = len(values)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if values[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(values: Sequence[T], target: T) -> int:
    lo = 0
    hi = len(values)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if target < values[mid]:
            hi = mid
        else:
            lo = mid + 1
    return lo


def binary_search_first(values: Sequence[T], target: T) -> int:
    position = lower_bound(values, target)
    if position < len(values) and values[position] == target:
        return position
    return -1


def first_true(lo: int, hi: int, predicate: Callable[[int], bool]) -> int:
    """Return first true integer in [lo, hi), or hi if none is true."""
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


values = [2, 4, 4, 4, 7, 9, 12]
assert binary_search_first(values, 4) == 1
assert lower_bound(values, 6) == 4
assert (lower_bound(values, 4), upper_bound(values, 4)) == (1, 4)
assert first_true(0, 31, lambda x: x * x >= 30) == 6
```

The functions require ordering consistent with `<`.

Exact equality must agree with ordering equivalence for predictable duplicate semantics.

Python's `bisect` module already implements production lower and upper bounds.

Prefer it unless custom predicate logic is needed.

For descending data, reverse the comparator logic consistently.

Do not “fix” one comparison without updating the invariant.

For floating-point data, NaN breaks ordinary total-order assumptions.

Define a total ordering or reject NaN values.

Concurrent mutation invalidates sortedness during a search.

Use immutable snapshots or synchronization.

Interval indexes need validated endpoint conventions and updated summaries.

## 5. Asymptotic Time & Space Complexity

Linear search takes $O(n)$ worst-case time.

It takes $O(1)$ time when the first item matches.

Expected time depends on target and input distributions.

It uses $O(1)$ auxiliary space.

Binary search halves the candidate range each iteration.

After `k` iterations, range length is at most $n/2^k$.

Termination occurs when $2^k\ge n$.

Therefore time is $O(\log n)$.

The iterative implementation uses $O(1)$ auxiliary space.

A recursive implementation uses $O(\log n)$ call-stack space.

Sorting unsorted input before one query costs $O(n\log n)$.

The combined one-query cost exceeds a direct linear scan asymptotically.

For `q` repeated queries, sort-plus-binary-search costs:

$$
O(n\log n+q\log n).
$$

Repeated linear scans cost $O(qn)$.

The crossover depends on constants, mutation, and query count.

Hash-table lookup is expected $O(1)$ under appropriate assumptions.

It uses $O(n)$ index space and does not preserve sorted range behavior.

Balanced-tree lookup is $O(\log n)$ with $O(n)$ index space.

Interval-tree queries cost $O(\log n+k)$ under suitable balancing and reporting assumptions.

Here `k` is the number of reported overlaps.

Worst-case output alone can be $\Theta(n)$.

Binary search over an expensive predicate costs $O(\log R)$ predicate evaluations over range size `R`.

Total time multiplies by predicate cost.

## 6. Systems Connections

Database indexes choose among scans, B-trees, hashes, and spatial structures.

Query planners compare setup, selectivity, and expected rows.

CPU caches make linear scans surprisingly fast on small contiguous arrays.

SIMD instructions compare several values per cycle.

Branch misprediction can reduce binary-search advantages for modest sizes.

Eytzinger layouts improve locality for some static binary searches.

Search engines use inverted indexes rather than scanning every document.

File systems use ordered trees for directory and extent lookup.

Routers use longest-prefix matching, often with tries or specialized hardware.

Memory allocators search size classes and free-range indexes.

Autocomplete uses prefix indexes rather than scalar exact search.

Monitoring systems search timestamped samples with lower bounds.

Log viewers jump to the first event at or after a timestamp.

Versioned storage searches immutable sorted runs in LSM trees.

Bloom filters avoid unnecessary disk searches with possible false positives.

Spatial systems use k-d trees, quadtrees, R-trees, and interval indexes.

The chosen geometry determines the safe pruning rule.

Security code should avoid timing leaks when the searched value is secret.

Constant-time comparison and access patterns may be required.

Binary search has data-dependent branches and memory locations.

Search correctness also depends on index freshness after updates.

Transactional systems update base data and indexes atomically.

## 7. Practice Checklist

- State whether data is sorted.
- Use linear search when no exploitable order exists.
- Define first, last, any, or all-match semantics.
- Define behavior when no match exists.
- Prefer half-open binary-search ranges.
- Write the lower-bound invariant before the loop.
- Keep midpoint inside the candidate range.
- Ensure every iteration strictly shrinks the range.
- Test empty arrays.
- Test one-element arrays for present and absent targets.
- Test targets below minimum and above maximum.
- Test duplicate runs at both ends.
- Derive exact search from lower bound.
- Derive duplicate count from lower and upper bounds.
- Verify the comparator matches the sort order.
- Define NaN behavior for floating keys.
- Do not binary-search data during unsynchronized mutation.
- Treat insertion position separately from found status.
- Prove monotonicity before binary-searching an answer.
- Include predicate cost in complexity.
- Define interval endpoint inclusion.
- Keep interval summaries synchronized with updates.
- Include output size in reporting-query analysis.
- Compare preprocessing cost against query count.
- Benchmark linear scans for small contiguous data.
- Use library binary-search functions when available.
- Avoid exposing secret-dependent search timing where prohibited.
- Version indexes with their source data.
- Test boundaries with property-based reference scans.
- Assert discarded regions cannot contain valid answers.

## 8. Frequently Asked Questions

### Which boundary bugs deserve dedicated tests?

An inclusive-high loop paired with half-open updates can skip or repeat the midpoint.

Returning immediately on equality loses first-occurrence semantics.

Computing `mid = (lo + hi) / 2` can overflow fixed-width indices.

Using `lo + (hi-lo)/2` avoids that addition overflow under valid bounds.

Updating `lo = mid` in a lower-bound loop can stall when two candidates remain.

The progress-preserving update is `lo = mid + 1` after excluding the midpoint.

Checking `values[position]` before `position < n` reads beyond absent high targets.

An empty array should terminate without evaluating any element.

One-element tests expose mismatched inclusive and exclusive endpoints quickly.

Duplicate runs at index zero expose incorrect predecessor assumptions.

Duplicate runs ending at `n` expose upper-bound boundary mistakes.

A descending array requires every comparator direction to reverse consistently.

A custom comparator must agree with the order used during sorting.

Mutable keys can destroy sortedness without moving records.

Binary search over answers needs a proven feasible endpoint or a documented no-answer sentinel.

Predicate integer multiplication can overflow even when midpoint arithmetic is safe.

Use division-based comparisons or wider arithmetic for large thresholds.

Floating searches need termination by iteration count or tolerance.

Tolerance-based equality can violate transitivity and sorted-order assumptions.

Interval searches must use one endpoint convention in indexing and querying.

Stale subtree maxima can incorrectly prune true overlaps.

A sampled test cannot prove an index stayed synchronized after every mutation.

Property tests should compare optimized results against a direct scan.

The most valuable assertion states why each discarded half cannot contain the answer.

### When should I use linear search?

Use it for unsorted, small, one-off, or streaming data without a suitable index.

### What does lower bound return?

The first position whose value is not less than the target.

It may equal the array length.

### How do I find all duplicates?

Use the half-open interval from lower bound to upper bound.

### Why use `[lo,hi)`?

Its length is `hi-lo`, and an empty range is represented naturally by equality.

### Can binary search work on a predicate?

Yes, when the predicate changes monotonically from false to true or vice versa.

### Why not sort before every search?

Sorting costs $O(n\log n)$ and is not justified for a single ordinary lookup.

### Is binary search always faster in practice?

No.

Small linear scans benefit from locality and predictable execution.

### Can interval overlap use ordinary binary search alone?

Not for arbitrary overlapping intervals.

It needs additional structure or restrictions to prune safely.

### What happens with NaN?

NaN violates ordinary comparison ordering; define or reject it explicitly.

### What unifies search algorithms?

Each step discards candidates only after proving they cannot satisfy the query.
