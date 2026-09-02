# Binary Search: Half-Open Intervals, Boundary Queries & Monotone Predicates

![Binary Search: Half-Open Intervals, Boundary Queries & Monotone Predicates](/images/dsa/binary-search-dark.jpg#dark)

## 1. Historical Context & Motivation

Searching an ordered collection can discard half of the remaining candidates after one comparison.

That simple observation produces logarithmic lookup depth and one of the most reused algorithmic patterns in computing.

Forms of interval halving predate electronic computers.

Modern binary search applies the idea to indexed arrays, ordered files, table-of-contents structures, numeric answer spaces, and any domain with a monotone decision boundary.

The data requirement is not merely “looks sorted.”

The search's comparison rule must agree with the ordering that produced the sequence.

If strings were sorted case-insensitively but searched case-sensitively, the predicate may not be monotone and the result is undefined.

Binary search is famous for being easy to describe and easy to implement incorrectly.

Common defects include:

- discarding the boundary that may contain the answer;
- retaining a midpoint forever;
- reading outside the collection;
- overflowing midpoint arithmetic in fixed-width integers;
- confusing an exact match with the first duplicate;
- returning insertion position as though a key were present;
- applying the algorithm to a non-monotone predicate.

A precise interval convention removes much of this ambiguity.

This article uses half-open intervals:

```text
[low, high)
```

`low` is included.

`high` is excluded.

The number of remaining positions is exactly `high - low`.

The empty interval is represented naturally by `low == high`.

The same skeleton computes `lower_bound`: the first index whose value is not less than the target.

From that primitive, exact search, duplicate ranges, insertion positions, and monotone boundary queries follow cleanly.

The central lesson is:

**binary search does not search for “a middle value”; it maintains a proof that a boundary lies inside a shrinking candidate interval.**

## 2. Core Mathematical Invariants

### Ordered sequence contract

Let the sequence be:

$$
a_0,a_1,\ldots,a_{n-1}
$$

with:

$$
a_i\le a_{i+1}
$$

under the same total ordering used by search.

Duplicates are allowed.

For lower-bound search on target $x$, define predicate:

$$
P(i)\equiv a_i\ge x.
$$

Because the sequence is sorted, the predicate has shape:

```text
false false ... false true true ... true
```

The desired answer is the first true position.

If no array position is true, the answer is sentinel index $n$.

### Half-open boundary invariant

Maintain integers `low` and `high` satisfying:

$$
0\le low\le high\le n.
$$

For lower bound, preserve:

- every index less than `low` has value less than $x$;
- every index at least `high` has value at least $x$, where sentinel position $n$ is treated as true;
- the first true boundary lies in `[low, high]`.

The executable candidate indices are `[low, high)`.

At termination `low == high`, so that shared value is the boundary.

### Midpoint

For a nonempty interval, choose:

$$
mid=low+\left\lfloor\frac{high-low}{2}\right\rfloor.
$$

Then:

$$
low\le mid<high.
$$

The subtraction-first form avoids overflow that can occur in fixed-width code with `(low + high) / 2`.

In Python integers do not overflow, but retaining the safe formula keeps the proof portable.

### Lower-bound transition

If:

$$
a_{mid}<x,
$$

then every index at most `mid` is also too small.

Set:

```text
low = mid + 1
```

If instead:

$$
a_{mid}\ge x,
$$

`mid` may be the first valid index.

Keep it by setting:

```text
high = mid
```

Both transitions preserve the boundary invariant.

### Progress measure

The interval length is:

$$
L=high-low.
$$

When `a[mid] < x`, the new length is `high - (mid + 1)`, strictly less than $L$.

Otherwise the new length is `mid - low`, also strictly less than $L$.

The nonnegative integer length decreases every iteration.

Termination follows.

### Upper bound

`upper_bound(x)` is the first index whose value is strictly greater than $x$.

Its monotone predicate is:

$$
Q(i)\equiv a_i>x.
$$

The transition changes only the comparison:

```text
if a[mid] <= x:
    low = mid + 1
else:
    high = mid
```

If `left = lower_bound(x)` and `right = upper_bound(x)`, then all occurrences occupy:

```text
[left, right)
```

and count is `right - left`.

### Exact search

Lower bound returns an insertion position whether or not $x$ exists.

Exact membership requires:

```text
index < n and a[index] == x
```

Failing to check the sentinel can read past the array.

Failing to compare equality can report an absent key at its insertion position.

### General monotone boundary

Let integer domain be `[lo, hi)` and predicate $P(k)$ satisfy:

$$
i<j\land P(i)\implies P(j).
$$

Equivalently, once true, it never becomes false at a larger index.

Treat `hi` as a true sentinel when searching for the first true position.

The same half-open transition applies without an array.

If the caller requires an actual satisfying value rather than the sentinel, it must verify `answer < hi`.

### Floating answer searches

Continuous binary search does not terminate by exact interval equality in finite-precision arithmetic.

It needs a fixed iteration count or an error criterion derived from the required result.

Monotonicity, rounding, NaN behavior, and endpoint inclusion must be specified.

The discrete proof should not be copied without those changes.

## 3. Step-by-Step Execution Trace

### Input

Search lower and upper bounds of target `7` in:

```text
index: 0  1  2  3  4  5  6  7  8  9
value: 1  3  3  5  7  7  7  9 12 18
```

Expected duplicate range is `[4, 7)`.

### Lower-bound initialization

Set:

```text
low = 0
high = 10
```

No index below zero exists, so the false-prefix condition holds vacuously.

Sentinel index ten is treated as true.

### Lower-bound iteration 1

Compute:

```text
mid = 0 + (10 - 0) // 2 = 5
value[5] = 7
```

Because `7 >= target`, index five may be the first valid position.

Keep it:

```text
high = 5
interval = [0, 5)
```

### Lower-bound iteration 2

```text
mid = 0 + (5 - 0) // 2 = 2
value[2] = 3
```

`3 < 7`.

Sorted order proves indices `0,1,2` are all too small.

Discard them:

```text
low = 3
interval = [3, 5)
```

### Lower-bound iteration 3

```text
mid = 3 + (5 - 3) // 2 = 4
value[4] = 7
```

`7 >= 7`, so keep index four:

```text
high = 4
interval = [3, 4)
```

### Lower-bound iteration 4

```text
mid = 3 + (4 - 3) // 2 = 3
value[3] = 5
```

`5 < 7`, so:

```text
low = 4
```

Now `low == high == 4`.

The first value not less than seven is index four.

### Upper-bound trace

Start again with `[0,10)` and predicate `value > 7`.

First midpoint is index five with value seven.

Because `7 <= target`, discard through index five:

```text
low = 6
```

Next midpoint is:

```text
mid = 6 + (10 - 6) // 2 = 8
value[8] = 12
```

`12 > 7`, so keep it with `high = 8`.

Next midpoint is index seven with value nine.

`9 > 7`, so `high = 7`.

Next midpoint is index six with value seven.

`7 <= 7`, so `low = 7`.

Termination gives upper bound seven.

### Duplicate result

The occurrence interval is:

```text
[4, 7)
```

Values at indices `4,5,6` are all seven.

Count is:

```text
7 - 4 = 3
```

### Absent target

For target `8`, lower bound returns index seven because value nine is the first value not less than eight.

Exact membership checks `value[7] == 8`, which is false.

The same index is the correct sorted insertion position.

### Empty input

For an empty sequence:

```text
low = high = 0
```

The loop executes zero times.

Lower and upper bounds both return zero.

Exact search returns absent without indexing the sequence.

### Monotone answer trace

Find the smallest integer capacity `c` such that ten jobs fit in at most three batches, where each batch holds `c` jobs.

Predicate is:

$$
P(c)=\left\lceil\frac{10}{c}\right\rceil\le3.
$$

Search domain is `[1, 11)` with sentinel eleven.

Predicate values are false for capacities one through three and true from four onward.

Binary search returns four.

The answer is not found by comparing an array element; it is found by locating a false-to-true boundary.

## 4. Production-Ready Implementations

The following Python functions accept any sequence and a projection key.

They use half-open intervals, validate optional search bounds, and keep membership distinct from insertion position.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Generic, Optional, Sequence, TypeVar

T = TypeVar("T")
K = TypeVar("K")


def _identity(value: T) -> T:
    return value


def _validate_bounds(length: int, low: int, high: Optional[int]) -> tuple[int, int]:
    resolved_high = length if high is None else high
    if isinstance(low, bool) or isinstance(resolved_high, bool):
        raise TypeError("bounds must be integers")
    if not isinstance(low, int) or not isinstance(resolved_high, int):
        raise TypeError("bounds must be integers")
    if low < 0 or resolved_high < low or resolved_high > length:
        raise ValueError("bounds must satisfy 0 <= low <= high <= len(values)")
    return low, resolved_high


def lower_bound(
    values: Sequence[T],
    target: K,
    *,
    key: Callable[[T], K] = _identity,
    low: int = 0,
    high: Optional[int] = None,
) -> int:
    left, right = _validate_bounds(len(values), low, high)
    while left < right:
        middle = left + (right - left) // 2
        if key(values[middle]) < target:
            left = middle + 1
        else:
            right = middle
    return left


def upper_bound(
    values: Sequence[T],
    target: K,
    *,
    key: Callable[[T], K] = _identity,
    low: int = 0,
    high: Optional[int] = None,
) -> int:
    left, right = _validate_bounds(len(values), low, high)
    while left < right:
        middle = left + (right - left) // 2
        if key(values[middle]) <= target:
            left = middle + 1
        else:
            right = middle
    return left


@dataclass(frozen=True, slots=True)
class EqualRange:
    start: int
    stop: int

    @property
    def count(self) -> int:
        return self.stop - self.start


def equal_range(
    values: Sequence[T],
    target: K,
    *,
    key: Callable[[T], K] = _identity,
) -> EqualRange:
    start = lower_bound(values, target, key=key)
    stop = upper_bound(values, target, key=key, low=start)
    return EqualRange(start, stop)


def binary_search_first(
    values: Sequence[T],
    target: K,
    *,
    key: Callable[[T], K] = _identity,
) -> Optional[int]:
    index = lower_bound(values, target, key=key)
    if index < len(values) and key(values[index]) == target:
        return index
    return None
```

### Verify duplicates, projections, and bounds

```python
values = [1, 3, 3, 5, 7, 7, 7, 9, 12, 18]
assert lower_bound(values, 7) == 4
assert upper_bound(values, 7) == 7
assert equal_range(values, 7) == EqualRange(4, 7)
assert binary_search_first(values, 7) == 4
assert binary_search_first(values, 8) is None
assert lower_bound(values, 8) == 7
assert lower_bound([], 10) == 0
assert upper_bound([], 10) == 0

records = [(1, "a"), (3, "b"), (3, "c"), (8, "d")]
record_key = lambda item: item[0]
assert equal_range(records, 3, key=record_key) == EqualRange(1, 3)
assert lower_bound(values, 7, low=2, high=8) == 4
```

### General first-true search

The domain is a bounded half-open integer interval.

The return value may equal `high`, meaning no domain value satisfied the predicate.

```python
def first_true(low: int, high: int, predicate: Callable[[int], bool]) -> int:
    if isinstance(low, bool) or isinstance(high, bool):
        raise TypeError("bounds must be integers")
    if not isinstance(low, int) or not isinstance(high, int):
        raise TypeError("bounds must be integers")
    if low > high:
        raise ValueError("low must not exceed high")
    left, right = low, high
    while left < right:
        middle = left + (right - left) // 2
        if predicate(middle):
            right = middle
        else:
            left = middle + 1
    return left


def minimum_batch_capacity(jobs: int, batches: int) -> int:
    if jobs <= 0 or batches <= 0:
        raise ValueError("jobs and batches must be positive")
    return first_true(
        1,
        jobs + 1,
        lambda capacity: (jobs + capacity - 1) // capacity <= batches,
    )


assert minimum_batch_capacity(10, 3) == 4
assert minimum_batch_capacity(12, 3) == 4
assert minimum_batch_capacity(1, 100) == 1
assert first_true(0, 10, lambda _: False) == 10
```

### Differential verification against the standard library

Python's `bisect` module provides an independent reference for scalar lists.

```python
import bisect
import random

rng = random.Random(20260830)
for length in range(0, 200):
    sample = sorted(rng.randrange(-30, 31) for _ in range(length))
    for target in range(-35, 36):
        assert lower_bound(sample, target) == bisect.bisect_left(sample, target)
        assert upper_bound(sample, target) == bisect.bisect_right(sample, target)
        expected = bisect.bisect_left(sample, target)
        expected_exact = expected if expected < length and sample[expected] == target else None
        assert binary_search_first(sample, target) == expected_exact
```

### Operational cautions

The projection function must be consistent and free of mutations that reorder observations during search.

If computing `key(value)` is expensive, precomputed keys may be faster than recomputing one projection per comparison across many queries.

Concurrent mutation of the searched sequence invalidates the ordering and interval proof unless synchronization or immutable snapshots are used.

For remote storage, comparison count may be less important than page access; use an index structure designed for the storage medium.

## 5. Asymptotic Time & Space Complexity

### Iteration count

Let initial candidate length be $n$.

Each iteration leaves at most half of the previous candidates, rounded down or up by one.

After $k$ iterations, remaining length is at most:

$$
\left\lceil\frac{n}{2^k}\right\rceil.
$$

Termination occurs once this length reaches zero.

Thus iteration count is $O(\log n)$.

A decision among $n+1$ possible insertion boundaries using binary comparisons also requires $\Omega(\log n)$ comparisons in the comparison model.

Therefore boundary search is $\Theta(\log n)$ comparisons.

### Projection cost

If one key projection and comparison costs $C$, total search time is:

$$
O(C\log n).
$$

Calling a linear-time projection at every midpoint can turn a nominal logarithmic comparison count into larger actual work.

### Space

The iterative functions store a constant number of indices.

Auxiliary space is $O(1)$.

A recursive binary search uses $O(\log n)$ call-stack frames unless transformed or optimized by the language.

### Equal range

Two binary searches each cost $O(\log n)$.

Their sum remains $O(\log n)$.

Returning or processing all $k$ duplicates afterward costs an additional $O(k)$.

### Sorted insertion

Finding an insertion index in an array costs $O(\log n)$ comparisons.

Actually inserting into the middle shifts up to $n$ elements and costs $O(n)$ time.

Binary search does not make an array insertion logarithmic overall.

### Linked lists

A linked list lacks constant-time indexed access.

Finding the midpoint by traversal costs linear work across levels, erasing the ordinary array advantage.

Ordered trees or skip lists support different navigation structures.

### Answer-space search

Let domain width be $R=high-low$ and predicate evaluation cost $P$.

Discrete first-true search uses $O(\log R)$ predicate calls and total time:

$$
O(P\log R).
$$

The numeric magnitude of endpoints matters through their difference, while arithmetic bit cost may matter for very large integers.

## 6. Systems Connections

### Standard library contracts

C++ `lower_bound`, Java binary-search utilities, Python `bisect`, and database APIs differ in return conventions.

Some return insertion positions.

Some encode absence as a negative value derived from insertion position.

Some accept custom comparators or projections.

Callers must read the contract rather than infer exact-match semantics from the function name.

### Database index navigation

B-trees and B+ trees perform search within ordered page separators, often using binary search or interpolation-like techniques.

Overall index lookup also follows child pages across tree levels.

The array binary-search invariant appears locally inside a larger storage-aware structure.

### Version and timestamp lookup

Systems often need the first event at or after a timestamp, the last version not after a snapshot, or the range of equal keys.

These are lower- and upper-bound queries, not merely exact membership.

Careful endpoint semantics prevent skipped or duplicated records during pagination.

### Memory-mapped files

Binary search over a sorted mapped table uses few comparisons but can touch pages far apart.

Cache and page-fault behavior may dominate.

Blocked indexes, sampled offsets, or B-tree layouts can reduce random page access for very large data.

### Numeric configuration

Capacity planning problems often ask for the smallest resource value that makes a simulator succeed.

If feasibility is monotone, first-true search can reduce a large answer domain to logarithmically many simulations.

The predicate must not depend on random state or hidden mutable state that breaks monotonicity.

### Rate and threshold controls

Threshold tables, feature rollout buckets, and percentile boundaries use insertion-position semantics.

Floating NaN values violate ordinary total ordering and need explicit rejection or placement policy.

Locale-aware strings require the same collation at sort and search time.

### Concurrency

Searching an immutable array is naturally safe for concurrent readers.

Searching while another thread reorders or resizes the same storage is unsafe without synchronization.

Copy-on-write snapshots can provide stable ordering at additional allocation cost.

### Security boundaries

Untrusted custom comparators or predicate callbacks can execute arbitrary work, throw, mutate state, or violate monotonicity.

Privileged services should expose declarative query parameters rather than execute caller-provided code.

Bound predicate calls and total work for expensive answer-space searches.

## 7. Practice Checklist

### Establish preconditions

- Confirm the data are sorted.
- Use the same ordering for sort and search.
- Define duplicate semantics.
- Define inclusive and exclusive endpoints.
- Reject NaN or comparator inconsistencies.
- Decide whether absence returns `None`, a sentinel, or insertion position.
- Decide whether concurrent mutation is possible.

### Maintain the interval

- Write the interval convention before coding.
- Initialize half-open search as `[0,n)`.
- Compute midpoint from the difference.
- Keep `mid` when it may be the answer.
- Discard `mid` with `mid + 1` when it cannot be the answer.
- Prove interval length decreases.
- Avoid indexing sentinel `n`.
- Test the empty interval.

### Test boundaries

- Search an empty sequence.
- Search a one-element sequence.
- Search below the minimum.
- Search above the maximum.
- Search the first element.
- Search the last element.
- Search an absent interior value.
- Search all-equal values.
- Search a long duplicate run.
- Test bounded subranges.

### Validate variants

- Compare lower bound with a linear reference.
- Compare upper bound with a linear reference.
- Verify equal-range count.
- Verify exact search checks equality.
- Verify first-true returns the sentinel when all false.
- Verify first-true returns `low` when all true.
- Test monotonicity of the predicate over small domains.
- Keep discrete and floating variants separate.

### Analyze total operation

- Include key-projection cost.
- Include sorted insertion shifts.
- Include data-sorting cost if search is one-time.
- Include page accesses for external storage.
- Include result materialization for duplicate ranges.
- Compare repeated queries with preprocessing cost.
- Consider hashing for equality-only lookup.
- Consider trees for frequent ordered updates.

## 8. Frequently Asked Questions

### Does binary search require unique values?

No.

Lower and upper bounds define deterministic behavior for duplicates.

An unspecified “find any match” variant may return any occurrence.

### What does lower bound return when the target is absent?

It returns the first position where the target could be inserted without violating order.

That position may equal the sequence length.

### Why use a half-open interval?

Its length is `high - low`, the empty state is `low == high`, and sentinel index `n` fits naturally as an insertion boundary.

Closed intervals can also be correct when their distinct invariants are maintained consistently.

### Why is `high = mid` instead of `mid - 1`?

When the midpoint satisfies the lower-bound predicate, it may be the first valid position.

Discarding it would lose a possible answer.

### Why is `low = mid + 1`?

When the midpoint is too small, sorted order proves every index through `mid` is too small.

Keeping `mid` could prevent progress.

### Can midpoint addition really overflow?

In fixed-width signed integer languages, `low + high` can exceed the maximum even when both indices are valid.

`low + (high - low) / 2` avoids that addition overflow under valid nonnegative bounds.

### Is binary search always $O(\log n)$ time?

It uses $O(\log n)$ iterations.

Total time also includes indexed access, comparison, and projection costs.

On a linked list or remote source, those operations may not be constant time.

### Why not sort and binary-search for one query?

Sorting costs $O(n\log n)$ in a general comparison model, while one linear scan costs $O(n)$.

Sorting becomes attractive when order is otherwise needed or many queries amortize preprocessing.

### What is “binary search on the answer”?

It searches an ordered domain of candidate answers using a monotone feasibility predicate.

The predicate is false on one side of a boundary and true on the other.

### How do I know a predicate is monotone?

Prove that once a candidate is feasible, every larger candidate remains feasible, or the symmetric direction for a last-true search.

Testing sample points is useful but not a proof over the full domain.

### How many iterations does discrete search take?

For range width $R$, it takes at most about $\lceil\log_2(R+1)\rceil$ iterations, depending on the exact convention.

The key fact is that each iteration removes at least half of the remaining interval.

### Can binary search be stable across equal keys?

Lower bound consistently selects the first equal key, and upper bound selects the position after the last.

The ordering among records with equal projected keys still depends on how the sequence was sorted.

### What if the array changes during search?

If mutation changes length or ordering, the invariant no longer holds and results are unreliable.

Use synchronization, immutable snapshots, or a concurrent ordered structure with a defined search contract.

### Should a floating binary search stop when `low == high`?

Not generally.

Floating values can stop changing because of rounding before mathematical equality, or the loop can fail to reach exact equality.

Use a justified iteration count or tolerance tied to output requirements.

### What is the most reusable implementation?

A tested lower-bound or first-true primitive with explicit half-open semantics is more reusable than several ad hoc exact-match loops.

Exact search and duplicate ranges can be built from that boundary operation.
