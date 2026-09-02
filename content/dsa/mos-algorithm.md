# Mo's Algorithm: Reordering Offline Range Queries to Reuse Work

![Mo's algorithm](/images/dsa/mos-algorithm-dark.jpg#dark)

Mo's algorithm answers many static array-range queries by sorting the queries into an order that moves a shared window gradually.
It does not make one query intrinsically cheap.
It reduces total boundary movement across the whole offline batch, typically to $O((n+q)\sqrt n)$ update operations.

## 1. Historical Context & Motivation

### Independent range scans repeat work

Suppose an immutable array receives $q$ queries on intervals `[left,right]`.
Scanning every interval costs $O(nq)$ in the worst case.
Prefix sums solve additive queries, but many statistics are not invertible from two prefixes.

Examples include:

- number of distinct values;
- frequency of the mode candidate under controlled updates;
- sum of values whose frequency meets a property;
- pair counts depending on equal values;
- frequency-square statistics.

If adding or removing one boundary element is cheap, neighboring query windows can share state.

### Offline reordering

Mo's algorithm requires all queries before processing.
It changes their execution order and restores answers to original order afterward.

Sort primarily by the block containing the left endpoint.
Within one left block, sort by right endpoint.
Queries then move the left boundary within a block while the right boundary advances mostly monotonically.

### Name and context

The technique is widely known as Mo's algorithm in competitive programming.
Historical attribution is less standardized than the algorithm's modern presentation, so implementation guidance should focus on its invariant rather than inventing a precise origin story.

### Appropriate problem shape

Use Mo's algorithm when:

- the array is static during the batch;
- queries can be reordered;
- one-element add and remove are efficient;
- no simpler prefix, Fenwick, segment-tree, or sweep solution applies;
- $O((n+q)\sqrt n)$ is feasible.

It is usually inferior for online queries because it needs the complete batch.
Variants can include point updates by adding a time dimension, with greater complexity.

### Problem statement

Given array $A$ of length $n$ and $q$ indexed queries $[L_i,R_i]$, compute a range statistic for each query.
The state object must support adding and removing either endpoint while preserving the statistic for the current window.

## 2. Core Mathematical Invariants

### Current-window invariant

Maintain inclusive window `[current_left,current_right]` and state $S$.
At all times, $S$ represents exactly the multiset

$$
\{A[j]:current\_left\le j\le current\_right\}.
$$

An empty initial window can be represented as `[0,-1]`.

### Four boundary transitions

To reach target `[L,R]`:

- while `current_left > L`, decrement and add the new left element;
- while `current_right < R`, increment and add the new right element;
- while `current_left < L`, remove the old left element and increment;
- while `current_right > R`, remove the old right element and decrement.

Order can vary if add and remove operations are correct for every intermediate window.

### Distinct-count state

Maintain frequency `count[x]` and integer `distinct`.
When adding value $x$:

- if `count[x]` is zero, increment `distinct`;
- increment `count[x]`.

When removing $x$:

- decrement `count[x]`;
- if it becomes zero, decrement `distinct`.

The invariant is

$$
distinct=|\{x:count[x]>0\}|.
$$

### Query-order invariant

Partition left endpoints into blocks of size $B$.
Primary key is

$$
\left\lfloor\frac{L}{B}\right\rfloor.
$$

Within a block, right endpoints are monotone.
The common alternating-order optimization sorts even blocks by increasing $R$ and odd blocks by decreasing $R$.
This avoids resetting the right pointer across block boundaries.

### Movement bound

There are about $n/B$ left blocks.
Within each block, right movement is $O(n)$ under monotone ordering, totaling

$$
O\left(\frac{n^2}{B}\right).
$$

Across $q$ queries, left movement is at most $O(qB)$ because left endpoints stay within one block before moving on.

Total updates are

$$
O\left(\frac{n^2}{B}+qB\right).
$$

When $q$ is comparable to $n$, choosing $B\approx\sqrt n$ yields $O((n+q)\sqrt n)$.

### General block choice

Balancing the two terms gives roughly

$$
B\approx\frac{n}{\sqrt q}
$$

when $q$ differs greatly from $n$.
Constants depend on add/remove cost and cache behavior.
The square-root rule is a safe baseline, not a universal optimum.

### Answer-index invariant

Queries carry original identifier $id$.
After adjusting to one query, store its result at `answers[id]`.
Processing order never changes output order.

### Reversibility requirement

The state must support removal as well as addition.
A statistic that cannot undo a boundary element cheaply does not fit ordinary Mo processing.
It may require richer state, rollback variants, or another algorithm.

## 3. Step-by-Step Execution Trace

### Array and queries

Use

```text
A = [1, 2, 1, 3, 2, 2, 4, 1]
```

Answer distinct counts for:

```text
Q0 = [0,3]
Q1 = [2,5]
Q2 = [4,7]
Q3 = [1,6]
```

Choose block size two.

### Sort queries

Left blocks are:

```text
Q0 block 0, right 3
Q3 block 0, right 6
Q1 block 1, right 5
Q2 block 2, right 7
```

One simple increasing-right order by block is `Q0, Q3, Q1, Q2`.
Alternating order may differ but produces the same answers.

### Start empty

Current window is `[0,-1]`.
All frequencies are zero.
Distinct count is zero.

### Process Q0 `[0,3]`

Extend right through indices zero to three.

Add value one: frequency one becomes one; distinct becomes one.
Add value two: frequency two becomes one; distinct becomes two.
Add value one: frequency one becomes two; distinct remains two.
Add value three: frequency three becomes one; distinct becomes three.

Store `answer[0] = 3`.

### Process Q3 `[1,6]`

Current window is `[0,3]`.
Extend right to six, adding values two, two, and four.
Only four is new, so distinct becomes four.

Move left from zero to one by removing value one at index zero.
One still occurs at index two, so distinct remains four.

Store `answer[3] = 4` for values `[2,1,3,2,2,4]`.

### Process Q1 `[2,5]`

Current window is `[1,6]`.
Remove left value two at index one.
Two remains twice, so distinct stays four.

Remove right value four at index six.
Its frequency reaches zero, so distinct falls to three.

Current values are `[1,3,2,2]`.
Store `answer[1] = 3`.

### Process Q2 `[4,7]`

Current window is `[2,5]`.
Remove index two value one; distinct falls from three to two.
Remove index three value three; distinct falls to one.

Extend right to index six with value four; distinct becomes two.
Extend right to index seven with value one; distinct becomes three.

Current values are `[2,2,4,1]`.
Store `answer[2] = 3`.

### Restore original order

The answer array is

```text
[3, 3, 3, 4]
```

Although Q3 ran second, its result occupies index three.

### Movement comparison

The ordered sequence reuses most of each previous window.
An unlucky original order can repeatedly jump between distant intervals.
Mo ordering reduces aggregate movement rather than the cost of one isolated adjustment.

## 4. Production-Ready Implementations

### Python distinct-query implementation

```python
from dataclasses import dataclass
from math import isqrt
from collections import defaultdict


@dataclass(frozen=True)
class Query:
    left: int
    right: int
    index: int


def distinct_range_counts(values: list[int], ranges: list[tuple[int, int]]) -> list[int]:
    n = len(values)
    if any(left < 0 or left > right or right >= n for left, right in ranges):
        raise IndexError("invalid inclusive query range")
    if not ranges:
        return []

    block = max(1, isqrt(max(1, n)))
    queries = [Query(left, right, index) for index, (left, right) in enumerate(ranges)]
    queries.sort(key=lambda query: (
        query.left // block,
        query.right if (query.left // block) % 2 == 0 else -query.right,
    ))

    frequency: dict[int, int] = defaultdict(int)
    distinct = 0
    current_left, current_right = 0, -1
    answers = [0] * len(queries)

    def add(index: int) -> None:
        nonlocal distinct
        value = values[index]
        if frequency[value] == 0:
            distinct += 1
        frequency[value] += 1

    def remove(index: int) -> None:
        nonlocal distinct
        value = values[index]
        frequency[value] -= 1
        if frequency[value] == 0:
            distinct -= 1

    for query in queries:
        while current_left > query.left:
            current_left -= 1
            add(current_left)
        while current_right < query.right:
            current_right += 1
            add(current_right)
        while current_left < query.left:
            remove(current_left)
            current_left += 1
        while current_right > query.right:
            remove(current_right)
            current_right -= 1
        answers[query.index] = distinct

    return answers


array = [1, 2, 1, 3, 2, 2, 4, 1]
queries = [(0, 3), (2, 5), (4, 7), (1, 6)]
assert distinct_range_counts(array, queries) == [3, 3, 3, 4]
```

### Coordinate compression

If values are arbitrary but fixed, compress them into dense integer identifiers.
Then frequencies can use an array instead of a dictionary.
Compression costs $O(n\log n)$ through sorting distinct values and often improves constants.

### State abstraction

For other statistics, isolate `add`, `remove`, and `answer` operations.
Test the state independently by comparing random window transitions against brute-force recomputation.

### Update variant warning

Mo with modifications adds query time as a third coordinate.
The state must apply and roll back point updates while respecting whether the changed position lies inside the current window.
Typical block sizes and analysis change.
Do not describe the static implementation as supporting updates.

### Hilbert order

Sorting queries by a space-filling-curve order can reduce movement constants for some workloads.
It does not change the state invariant.
Its implementation complexity should be justified by measurement.

## 5. Asymptotic Time & Space Complexity

### Sorting queries

Comparison sorting $q$ queries costs $O(q\log q)$.
Block identifiers and bounded coordinates can permit alternate sorts, but comparison sorting is standard.

### Boundary updates

With block size $B$, movement is

$$
O(qB+n^2/B).
$$

For $B\approx\sqrt n$ and $q=\Theta(n)$, this is $O(n\sqrt n)$.
The common combined expression is

$$
O((n+q)\sqrt n)
$$

when add and remove are $O(1)$.

### State cost

If one update costs $U$, multiply movement by $U$.
If extracting an answer costs $A$, add $O(qA)$.

### Space

Stored queries and answers use $O(q)$.
Frequencies use $O(D)$ for $D$ compressed values or dictionary entries.
The array uses input space $O(n)$.

### Comparison with alternatives

Prefix sums answer additive ranges in $O(1)$ after $O(n)$ preprocessing.
Fenwick trees and segment trees handle many associative statistics and updates in $O(\log n)$.
Mo is valuable when state is locally adjustable but lacks a compact associative summary.

### Worst-case constants

The algorithm performs many add/remove calls and indirect frequency accesses.
It can lose to a theoretically similar alternative with better locality.
Block-size tuning and alternating right order matter in practice.

## 6. Systems Connections

### Offline analytics

Historical batches can reorder queries because no caller waits for one result before issuing the next.
This allows locality-oriented scheduling unavailable to online services.

### Cache locality

Adjacent windows reuse array regions and frequency state.
Coordinate-compressed arrays improve contiguous counter access.
Query sorting itself also changes memory access order.

### Database distinction

Database optimizers reorder operations under semantic constraints, but Mo's algorithm is not a general database indexing method.
It assumes static array ranges and reversible boundary updates.

### Tree queries

Euler tours can map subtree queries to array intervals.
Path queries need entry/exit toggling and lowest-common-ancestor handling.
The transformed state invariant must be proved separately.

### Parallelism

Queries within one Mo order share mutable state and are sequentially dependent.
Independent batches can run in parallel, each paying its own initialization and movement.

### Security

Validate query bounds before sorting or moving pointers.
Untrusted query counts can consume memory and CPU even with valid ranges.
Bound the batch size.

### Calibrating block size

The asymptotic balance treats left and right moves as equally expensive.
That assumption can fail when add/remove logic is asymmetric or cache behavior differs by direction.

Instrument four counters: add-left, add-right, remove-left, and remove-right.
Measure total state-update time separately from query sorting.
Try a small range of block sizes around the theoretical estimate.

Choose the size from representative workloads, not one favorable random input.
Retain a safe default when calibration data is unavailable.
Do not tune until answers match brute force.

If $q$ is much larger than $n$, smaller left blocks can reduce per-query left movement.
If $q$ is small, the overhead of Mo ordering may exceed direct scans or another preprocessing method.
Re-evaluate the algorithm choice before micro-tuning the block constant.

Document the chosen ordering because performance regressions can otherwise look like unexplained noise.
Record the array and query distributions used during tuning.
Repeat measurements after changing the maintained statistic.

## 7. Practice Checklist

### Suitability

- Queries are known offline.
- Array is static.
- Ranges are inclusive or converted consistently.
- Add is efficient.
- Remove is efficient.
- Simpler prefix structures do not solve the statistic.
- Complexity fits limits.

### Ordering

- Choose positive block size.
- Sort by left block.
- Sort right within block.
- Consider alternating right direction.
- Carry original query index.
- Restore answer order.

### Window state

- Start with an empty valid window.
- Add only after entering a cell.
- Remove before leaving a cell.
- Maintain exact frequencies.
- Handle duplicates.
- Assert no frequency becomes negative.

### Tests

- No queries.
- One-element ranges.
- Whole-array range.
- Repeated identical ranges.
- Nested ranges.
- Disjoint ranges.
- Duplicate values.
- All values equal.
- Random queries against brute force.

### Performance

- Count boundary moves.
- Tune block size on representative data.
- Compress values.
- Avoid allocations in add/remove.
- Compare alternating order.
- Compare with simpler algorithms.

## 8. Frequently Asked Questions

### Why is Mo's algorithm offline?

It needs to reorder the complete query batch before processing.

### Does it update the array?

The ordinary form assumes a static array.
A more complex time-dimensional variant supports point modifications.

### Why use square-root blocks?

They balance left-boundary movement against repeated right sweeps when query and array counts are comparable.

### Are queries answered in sorted order?

They are processed in sorted order but stored by original query identifier.

### Why must removal be supported?

Both window boundaries sometimes move inward, so elements leave the current state.

### Can it answer sums?

Yes, but prefix sums are much simpler and faster for static range sums.

### What does alternating order improve?

It prevents the right pointer from jumping from one end of the array back to the other between every left block.

### Is the complexity always $O(n\sqrt n)$?

It depends on both $n$ and $q$, block size, and update cost.
Use $O(qB+n^2/B)$ for precise tuning.

### Can it process tree subtrees?

Yes after an Euler-tour mapping that makes each subtree contiguous.

### What is the most common bug?

Adding or removing the wrong boundary index due to inconsistent inclusive endpoints.

### What should I study next?

Study coordinate compression, Fenwick trees, segment trees, Hilbert query order, and Mo variants with updates or tree paths.
