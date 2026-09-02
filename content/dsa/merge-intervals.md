# Merging Intervals: Canonicalizing Overlapping Ranges

![Merge intervals](/images/dsa/merge-intervals-dark.jpg#dark)

Interval merging turns an arbitrary collection of overlapping ranges into disjoint ranges with the same union.
The decisive step is sorting by start coordinate.
After that, one scan either extends the current union component or proves that a new component has begun.

## 1. Historical Context & Motivation

### Ranges appear everywhere

Calendars store occupied time spans.
Allocators track free address ranges.
Network tools summarize port or address blocks.
Editors represent changed character spans.
Databases combine range predicates.

Raw intervals can overlap, nest, duplicate one another, or touch at endpoints.
Many downstream operations become easier after canonicalization into sorted disjoint ranges.

### The unsorted difficulty

Without order, an interval near the end of the input can connect two earlier groups.
Comparing every pair costs $O(n^2)$ and still requires careful transitive merging.

Sorting by start places every possible future connector after the current range begins.
The scan then needs only the rightmost endpoint of the component built so far.

### Endpoint semantics

The algorithm depends on whether intervals are closed, open, or half-open.

Closed intervals `[a,b]` and `[b,c]` overlap at point $b$.
Half-open intervals `[a,b)` and `[b,c)` do not overlap, though applications may choose to coalesce adjacent ranges.

This article uses closed intervals by default and states where half-open behavior changes.

### Input policy

Each interval must satisfy $start\le end$.
An API can reject reversed endpoints or normalize them by swapping.
Silent normalization can hide upstream bugs, so validation is often safer.

### Output contract

Return sorted intervals that:

- have the same union as the input;
- do not overlap one another;
- are maximal under the chosen overlap rule;
- contain no redundant interval.

The output order is by increasing start.

## 2. Core Mathematical Invariants

### Sorted order

Sort intervals lexicographically by start, then end.
After sorting,

$$
s_0\le s_1\le\cdots\le s_{n-1}.
$$

When processing interval $i$, no future interval starts before it.

### Output-prefix invariant

After processing the first $i$ sorted intervals:

- the output union equals their union;
- output intervals are sorted;
- every output interval except possibly the last is final;
- output intervals are disjoint under the selected rule;
- the last interval represents the rightmost connected union component.

Only the last interval can overlap the next input because all earlier components end before the last one starts.

### Closed overlap test

Let current merged interval be $[a,b]$ and next interval $[c,d]$ with $a\le c$.
They overlap exactly when

$$
c\le b.
$$

If so, replace the current end with

$$
\max(b,d).
$$

The start remains $a$.

### Half-open overlap test

For `[a,b)` and `[c,d)`, nonempty overlap requires

$$
c<b.
$$

Using $c\le b$ intentionally coalesces adjacent ranges.
Neither rule is universally correct; the interval model decides.

### Separation proof

If $c>b$, the current interval ends before the next begins.
Every future start is at least $c$ because of sorting.
Therefore no future interval can connect back to `[a,b]`.
The current component is final and the next interval starts a new one.

### Nested intervals

If next interval lies inside current, then $d\le b$.
The update `max(b,d)` leaves current unchanged.
No special nested-case branch is necessary.

### Union preservation

When overlapping ranges merge, their union is exactly

$$
[a,\max(b,d)]
$$

for closed intervals with $c\le b$.
When they do not overlap, retaining both preserves their disjoint union.
Each transition therefore preserves the union invariant.

### Idempotence

Merging an already canonical output returns the same intervals.
Formally,

$$
merge(merge(I))=merge(I).
$$

This is a valuable property test.

## 3. Step-by-Step Execution Trace

### Input

Use closed intervals

```text
[8,10], [1,3], [2,6], [15,18], [6,8], [17,20]
```

The input is unsorted and contains a chain of overlaps.

### Sort by start

Sorted order is

```text
[1,3], [2,6], [6,8], [8,10], [15,18], [17,20]
```

Initialize output with `[1,3]`.

### Process `[2,6]`

Next start two is at most current end three.
The intervals overlap.
Extend end to `max(3,6) = 6`.

Output becomes

```text
[1,6]
```

### Process `[6,8]`

Under closed semantics, start six is at most end six.
They share endpoint six.
Extend current range to `[1,8]`.

Under strict half-open semantics, `[1,6)` and `[6,8)` would remain separate unless adjacency coalescing were requested.

### Process `[8,10]`

Start eight touches current end eight.
Merge to `[1,10]`.

This demonstrates transitive merging.
The original `[1,3]` did not directly overlap `[8,10]`, but intermediate intervals connect the union.

### Process `[15,18]`

Start fifteen exceeds current end ten.
The current component can never be extended by a future interval.
Append `[15,18]` as a new component.

Output is

```text
[1,10], [15,18]
```

### Process `[17,20]`

Start seventeen is at most current end eighteen.
Extend the final interval to `[15,20]`.

### Final output

```text
[1,10], [15,20]
```

The output is sorted, disjoint, maximal, and union-equivalent to the input.

### Nested trace

Input `[1,10], [2,3], [4,8]` is already start-sorted.
Both later intervals begin before current end ten and end no later than ten.
The merged output remains `[1,10]`.

### Duplicate trace

Input `[2,5], [2,5], [2,5]` merges into one `[2,5]`.
Sorting tie order does not matter because all endpoints agree.

### Empty and singleton inputs

Empty input returns empty output.
A single valid interval returns an equivalent one-element result.
Avoid indexing the first item before checking emptiness.

## 4. Production-Ready Implementations

### Python closed-interval implementation

```python
from dataclasses import dataclass
from collections.abc import Iterable


@dataclass(frozen=True, order=True)
class Interval:
    start: int
    end: int

    def __post_init__(self) -> None:
        if self.start > self.end:
            raise ValueError("interval start exceeds end")


def merge_closed(intervals: Iterable[Interval]) -> list[Interval]:
    ordered = sorted(intervals)
    if not ordered:
        return []

    merged: list[Interval] = [ordered[0]]
    for interval in ordered[1:]:
        current = merged[-1]
        if interval.start <= current.end:
            merged[-1] = Interval(current.start, max(current.end, interval.end))
        else:
            merged.append(interval)
    return merged


sample = [
    Interval(8, 10), Interval(1, 3), Interval(2, 6),
    Interval(15, 18), Interval(6, 8), Interval(17, 20),
]
assert merge_closed(sample) == [Interval(1, 10), Interval(15, 20)]
assert merge_closed([]) == []
```

Immutable interval values prevent accidental mutation of caller-owned objects.

### Configurable adjacency

```python
def merge_half_open(
    intervals: Iterable[Interval], *, coalesce_adjacent: bool = False
) -> list[Interval]:
    ordered = sorted(intervals)
    merged: list[Interval] = []
    for interval in ordered:
        if not merged:
            merged.append(interval)
            continue
        current = merged[-1]
        overlaps = (
            interval.start <= current.end
            if coalesce_adjacent
            else interval.start < current.end
        )
        if overlaps:
            merged[-1] = Interval(current.start, max(current.end, interval.end))
        else:
            merged.append(interval)
    return merged
```

Zero-length half-open intervals need an explicit policy because `[x,x)` denotes an empty set.

### C++ in-place implementation

```cpp
#include <algorithm>
#include <stdexcept>
#include <utility>
#include <vector>

using Interval = std::pair<long long, long long>;

std::vector<Interval> merge_closed(std::vector<Interval> intervals) {
    for (const auto& [start, end] : intervals) {
        if (start > end) throw std::invalid_argument("reversed interval");
    }
    std::sort(intervals.begin(), intervals.end());
    std::vector<Interval> merged;
    merged.reserve(intervals.size());

    for (const auto& interval : intervals) {
        if (merged.empty() || interval.first > merged.back().second) {
            merged.push_back(interval);
        } else {
            merged.back().second = std::max(merged.back().second, interval.second);
        }
    }
    return merged;
}
```

### Metadata-bearing intervals

If intervals carry owners, labels, or permissions, merging geometry alone may be invalid.
Define how metadata combines.
Sometimes intervals may merge only when metadata is equal; sometimes overlap requires splitting into segments with combined metadata.

### Numeric safety

This algorithm compares endpoints and takes maxima, so it does not inherently add endpoint values.
Adjacency rules such as `next.start <= current.end + 1` can overflow.
Prefer an overflow-safe comparison or wider type.

## 5. Asymptotic Time & Space Complexity

### Sorting

Sorting $n$ intervals costs $O(n\log n)$ comparisons.
The subsequent scan is $O(n)$.
Total time is

$$
O(n\log n).
$$

### Already sorted input

If intervals are guaranteed sorted by start, merging takes $O(n)$ time.
Verify the precondition or sort defensively.

### Space

The output contains at most $n$ intervals, so output space is $O(n)$.
Sorting may use additional implementation-dependent space.
An in-place compaction can write merged ranges into the front of a mutable sorted array and use $O(1)$ extra storage beyond sorting.

### Lower-bound intuition

For arbitrary comparison-based endpoints, canonical ordering generally requires enough information to distinguish start order, giving an $\Omega(n\log n)$ sorting-related lower bound in the general formulation.
Restricted integer domains can use counting or radix techniques.

### Incremental insertion

Inserting one interval into an already sorted canonical vector can require $O(n)$ shifting.
Balanced interval trees support dynamic operations with different complexity and implementation cost.

### Output sensitivity

Let $k$ be the number of merged ranges.
The scan still reads all $n$ inputs, so time after sorting is $\Theta(n)$, while output storage is $\Theta(k)$.

## 6. Systems Connections

### Calendars

Merge busy periods to compute occupied time.
Endpoint semantics decide whether back-to-back events form one block.
Time zones and daylight-saving transitions should be normalized before numeric interval operations.

### Memory allocators

Free blocks can be coalesced when adjacent addresses touch.
Allocator metadata, alignment, and ownership make this a dynamic ordered-neighbor problem rather than repeated batch sorting.

### Network ranges

Port and numeric address ranges can be merged under identical policy metadata.
CIDR prefixes are not arbitrary numeric intervals; converting back to minimal prefixes requires additional decomposition.

### Database range predicates

Combining overlapping query ranges can reduce redundant scans.
Open, closed, and unbounded endpoints must match database comparison semantics.
Null values are not ordinary infinities.

### Genomic coordinates

Bioinformatics formats differ between zero-based half-open and one-based closed coordinates.
Converting conventions before merging is essential.
An off-by-one error changes biological meaning.

### Distributed processing

Workers can merge local sorted ranges.
Their outputs are sorted canonical streams that can be merged again.
Partition boundaries need reconciliation because an interval from one worker can overlap the next worker's first interval.

### Security

Bound input count before sorting untrusted data.
Validate endpoint encoding and avoid overflow in adjacency arithmetic.
Do not merge permission intervals unless their authorization metadata is compatible.

### Sweep-line distinction

Batch merging computes the union's connected components.
A sweep-line algorithm can answer richer questions such as maximum simultaneous overlap, covered multiplicity, or which labels are active.

Convert every interval into start and end events.
Sort events by coordinate.
Update an active count or active set while sweeping.

Event tie order depends on endpoint semantics.
For closed intervals, a start at coordinate $x$ overlaps an interval ending at $x$, so starts must become active before ends are removed for point-count calculations.
For half-open intervals, ends at $x$ cease before starts at $x$ become active.

Ordinary merge does not need a separate event for every endpoint.
It retains only the farthest end of the current union component and is simpler for union canonicalization.

### Total covered length

After producing disjoint half-open intervals, total covered length is

$$
\sum_i(end_i-start_i).
$$

For closed integer intervals representing discrete integers, cardinality is instead

$$
\sum_i(end_i-start_i+1).
$$

Mixing continuous length with discrete cardinality creates off-by-one errors.
Merge first so overlapping regions are not counted twice.

### Streaming sorted intervals

If intervals arrive already sorted by start, merging needs only the current interval and an output sink.
Memory can be $O(1)$ beyond emitted output.
Once a separation is observed, the prior component can be written permanently.

An out-of-order interval invalidates that guarantee.
Either validate monotonic starts or sort before streaming the merge.

## 7. Practice Checklist

### Contract

- Closed, open, or half-open?
- Should touching ranges merge?
- Are empty ranges allowed?
- Are reversed endpoints rejected?
- Is input mutation allowed?
- How does metadata combine?
- Is output sorted?

### Implementation

- Handle empty input.
- Sort by start then end.
- Seed the first output interval.
- Compare only with the last merged interval.
- Extend end with maximum.
- Append after proven separation.
- Avoid overflow in adjacency checks.

### Correctness

- State the processed-prefix invariant.
- Prove overlap preserves union.
- Prove separation makes current final.
- Handle nested intervals.
- Handle duplicates.
- Verify idempotence.

### Tests

- Empty input.
- One interval.
- Disjoint intervals.
- Fully overlapping intervals.
- Nested intervals.
- Touching endpoints.
- Duplicate intervals.
- Negative endpoints.
- One chain of transitive overlaps.
- Reversed invalid interval.

### Validation

- Output union equals input union.
- Output is sorted.
- Output ranges are disjoint.
- No adjacent output ranges can still merge.
- Every input point is covered equivalently.
- Merging output changes nothing.

## 8. Frequently Asked Questions

### Why sort by start?

It ensures future intervals cannot begin before the current one, so only the last merged component can overlap next.

### Why not compare every pair?

Pairwise comparison is quadratic and complicates transitive overlap.
Sorting reduces the problem to one scan.

### Do `[1,2]` and `[2,3]` merge?

Yes as closed intervals because they share point two.
As half-open intervals, they are adjacent but nonoverlapping unless coalescing is requested.

### What about one interval inside another?

The current end remains the maximum, so the nested interval adds nothing.

### Is the output unique?

For a fixed endpoint and adjacency policy, maximal disjoint components of the union are unique.

### Can merging be done in place?

Yes after sorting, by writing results into the front of a mutable array and returning the active prefix.

### Does the algorithm preserve original interval order?

No.
It sorts by coordinates.

### Can intervals carry labels?

Yes, but a label-combination rule is required.
Geometry alone may not permit merging different owners or permissions.

### How do I insert one interval into canonical ranges?

Locate its position, merge neighboring overlaps, and replace the affected slice.
A vector can still require linear shifting.

### How are unbounded intervals represented?

Use explicit endpoint variants or well-defined infinities, not magic finite sentinels that valid data can reach.

### What is the most common bug?

Applying a closed-interval overlap test to half-open data or forgetting a chain of overlaps is handled through the continually extended end.

### What should I study next?

Study interval insertion, sweep-line algorithms, interval trees, difference arrays, and coordinate compression.
