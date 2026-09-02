# K-th Order Statistics: Selecting Without Fully Sorting

![K-th element selection](/images/dsa/kth-element-dark.jpg#dark)

Finding the $k$-th smallest element looks like a sorting problem, but a total order is more information than the query needs.
Selection algorithms exploit that gap.
Quickselect gives linear expected time, median-of-medians gives linear worst-case time, and heaps provide useful streaming and top-$k$ alternatives.

## 1. Historical Context & Motivation

### A rank is not a sorted array

Given $n$ values, sorting answers every rank query at once.
If the only question is “which value would appear at position $k$?”, sorting performs unnecessary comparisons among values that lie entirely on the same side of the answer.

The **$k$-th order statistic** is the element with zero-based rank $k$ in nondecreasing order.
Under one-based terminology, the first order statistic is the minimum and the $n$-th is the maximum.
Implementations should expose one convention clearly because off-by-one mistakes are more common than algorithmic mistakes here.

### Examples of order statistics

The median is an order statistic.
Percentiles and quantiles are rank-based summaries.
The smallest latency among the slowest one percent, the fifth-highest score, and the threshold separating two partitions are all selection questions.

Duplicates require precise semantics.
For multiset values `[2, 2, 5]`, ranks zero and one both contain value `2`.
This article counts duplicates as separate positions, matching ordinary sorted-array indexing.

### Three useful algorithm families

Selection is not one algorithm but a design space:

- **Quickselect** partitions in place and recurses into one side; expected time is $O(n)$.
- **Median of medians** chooses a pivot with a deterministic balance guarantee; worst-case time is $O(n)$.
- **Heap selection** maintains only the most relevant $k$ values; time is $O(n\log k)$ and it supports streams.

Sorting remains reasonable when many future rank queries will reuse the ordered result.
The best method depends on whether input is mutable, whether it fits memory, whether worst-case guarantees matter, and whether more queries will follow.

### Historical development

Quickselect is closely associated with Tony Hoare's partitioning work.
In 1973, Blum, Floyd, Pratt, Rivest, and Tarjan published a deterministic linear-time selection algorithm, commonly taught through the median-of-medians pivot rule.
The result established that exact selection does not require $\Omega(n\log n)$ comparisons.

### Problem statement

Given a finite sequence $A$ of length $n>0$ and rank $k$ satisfying

$$
0\le k<n,
$$

return a value $x$ such that exactly fewer than or equal to $k$ elements are strictly smaller in the duplicate-aware rank interpretation and the sorted element at index $k$ equals $x$.

An in-place algorithm may reorder $A$.
A nonmutating API should copy the input or use a separate data structure.

## 2. Core Mathematical Invariants

### Rank partition

For a chosen pivot value $p$, a three-way partition divides the active range into:

$$
L=\{x:x<p\},\qquad E=\{x:x=p\},\qquad G=\{x:x>p\}.
$$

After partitioning, every element of $L$ precedes every element of $E$, and every element of $E$ precedes every element of $G$.
The groups themselves need not be internally sorted.

If the active range begins at index $a$, the equal block occupies indices

$$
[a+|L|,\;a+|L|+|E|-1].
$$

If $k$ lies in that interval, the pivot value is the answer.
If $k$ is smaller, only $L$ can contain the answer.
If $k$ is larger, only $G$ can contain it.

### Active-range invariant

Quickselect maintains an interval `[left, right]` known to contain the element of global rank $k$.
Elements outside the interval have already been classified relative to the target rank.

The algorithm never needs to sort either discarded side.
It only preserves enough partition information to prove where rank $k$ remains.

### Dutch-national-flag partition

Three-way partitioning uses indices `less`, `scan`, and `greater`.
During the loop:

- `[left, less)` contains values smaller than the pivot;
- `[less, scan)` contains values equal to the pivot;
- `[scan, greater]` is unclassified;
- `(greater, right]` contains values greater than the pivot.

Every iteration shrinks the unclassified interval.
When `scan > greater`, the equal block is final.

This form handles duplicates directly.
A two-way partition can degrade badly when many values equal the pivot because it may shrink by only one position per iteration.

### Quickselect progress

After partitioning, either the answer is returned or the next active range excludes the entire equal block and one outer partition.
At least one element—the pivot—is removed from consideration.
With a randomly chosen pivot, the expected active size decreases by a constant factor often enough to yield linear expected work.

The worst case still exists.
Repeatedly choosing an extreme pivot produces ranges of sizes $n-1,n-2,\ldots,1$ and costs

$$
\Theta(n^2).
$$

### Randomized expected-time recurrence

Partitioning a range of size $n$ costs $\Theta(n)$.
For a uniformly random pivot, the expected recurrence is bounded by

$$
\mathbb{E}[T(n)]
\le cn+\frac{1}{n}\sum_{i=0}^{n-1}\mathbb{E}[T(\max(i,n-i-1))].
$$

Although some pivots are poor, a constant fraction place both sides below a fixed fraction of $n$.
The expected sum of scanned elements across iterations is geometric, giving $O(n)$.

### Median-of-medians pivot guarantee

Divide the active values into groups of at most five.
Find each full group's median.
Recursively select the median of those medians as pivot $p$.

At least half the group medians are at least $p$.
Each such full group contributes at least three values at least $p$.
Symmetrically, at least about $3n/10$ values are no greater than $p$ and at least about $3n/10$ are no less than $p$, excluding constant-size boundary effects.

Therefore the larger recursive side contains at most roughly $7n/10$ values.
The recurrence is

$$
T(n)\le T(\lceil n/5\rceil)+T(7n/10+O(1))+O(n),
$$

which solves to $O(n)$.

### Heap invariant

To find the $k$-th smallest using one-based $k$, maintain a max-heap of at most $k$ values.
After processing any prefix of the stream, the heap contains the $k$ smallest values seen so far, or all values if fewer than $k$ have arrived.
The root is the largest among those retained values.

When a new value is not smaller than the root, it cannot enter the retained set.
When it is smaller, replace the root and restore the heap.
After the full stream, the root is the $k$-th smallest.

### Lower-bound perspective

Finding the minimum requires $n-1$ comparisons in the comparison model.
Exact general selection likewise requires $\Omega(n)$ work because every input element can affect the result.
Linear-time selection is therefore asymptotically optimal.

## 3. Step-by-Step Execution Trace

### Input and rank

Use

```text
A = [12, 3, 5, 7, 4, 19, 26, 4, 8]
```

Find the zero-based rank $k=4$.
The sorted sequence would be

```text
[3, 4, 4, 5, 7, 8, 12, 19, 26]
```

so the expected answer is $7$.
The trace will not sort the sequence.

### First pivot

Choose pivot value $8$.
Three-way partitioning groups the active values conceptually as:

```text
less:    [3, 5, 7, 4, 4]
equal:   [8]
greater: [12, 19, 26]
```

The exact order within `less` and `greater` depends on swaps and is irrelevant.
The equal block begins at global index $5$.
Because $k=4<5$, the answer lies in the five-element `less` partition.
Discard the pivot and all greater values.

### Second pivot

The active values are some permutation of

```text
[3, 5, 7, 4, 4]
```

Choose pivot value $4$.
Partition into:

```text
less:    [3]
equal:   [4, 4]
greater: [5, 7]
```

Within the original global rank space, the equal values occupy indices $1$ and $2$.
Rank $4$ lies to their right.
Discard the smaller and equal blocks.

### Third pivot

The remaining candidate values are `[5, 7]`, corresponding to global ranks $3$ and $4$.
Choose pivot $7$.
Partition into:

```text
less:  [5]
equal: [7]
```

The equal block contains global rank $4$.
Return $7$.

### State summary

| Iteration | Active values | Pivot | Equal rank interval | Decision |
|---:|---|---:|---|---|
| 1 | 9 values | 8 | $[5,5]$ | search left |
| 2 | 5 values | 4 | $[1,2]$ | search right |
| 3 | 2 values | 7 | $[4,4]$ | return 7 |

Only the active partition is processed again.
The discarded values are not ordered among themselves.

### Duplicate-heavy trace

Use values `[6, 2, 6, 6, 1, 6, 9]` and rank $k=4$.
Choose pivot $6$.
The partition sizes are $|L|=2$, $|E|=4$, and $|G|=1$.
The equal block occupies sorted ranks $2$ through $5$.
Because rank four lies in that interval, return $6$ immediately.

A three-way partition resolves all equal pivot copies in one scan.
This is why it is preferable to repeatedly placing only one copy.

### Heap trace

Find the third smallest value in stream

```text
9, 1, 7, 3, 2, 8
```

Maintain a max-heap of size three.

| Input | Retained three smallest so far | Heap maximum |
|---:|---|---:|
| 9 | `[9]` | 9 |
| 1 | `[1,9]` | 9 |
| 7 | `[1,7,9]` | 9 |
| 3 | replace 9: `[1,3,7]` | 7 |
| 2 | replace 7: `[1,2,3]` | 3 |
| 8 | ignore | 3 |

The final heap root is $3$, the third smallest.
Unlike quickselect, this method does not mutate or retain the complete stream.

### Why full sorting was unnecessary

At the moment quickselect returned $7$, it knew that four elements were smaller and four were greater.
It did not know whether $3$ preceded the two $4$s in physical storage or whether $12$ preceded $19$.
Those comparisons cannot change rank four, so the algorithm never demanded them.

## 4. Production-Ready Implementations

### Randomized three-way quickselect in Python

```python
from collections.abc import MutableSequence
from random import Random
from typing import TypeVar


T = TypeVar("T")


def select_kth(values: MutableSequence[T], k: int, *, seed: int | None = None) -> T:
    if not 0 <= k < len(values):
        raise IndexError("k is outside the sequence")

    rng = Random(seed)
    left = 0
    right = len(values) - 1

    while True:
        if left == right:
            return values[left]

        pivot = values[rng.randrange(left, right + 1)]
        less = left
        scan = left
        greater = right

        while scan <= greater:
            if values[scan] < pivot:
                values[less], values[scan] = values[scan], values[less]
                less += 1
                scan += 1
            elif pivot < values[scan]:
                values[scan], values[greater] = values[greater], values[scan]
                greater -= 1
            else:
                scan += 1

        if k < less:
            right = less - 1
        elif k > greater:
            left = greater + 1
        else:
            return values[k]


data = [12, 3, 5, 7, 4, 19, 26, 4, 8]
assert select_kth(data, 4, seed=7) == 7
assert select_kth([6, 2, 6, 6, 1, 6, 9], 4, seed=2) == 6
assert select_kth([5], 0) == 5
```

The function mutates the sequence.
Pass a copy when caller-visible order must remain unchanged.
The optional seed supports reproducible tests; production callers can omit it.

### Heap selection for a stream

Python's standard library provides a min-heap, so negated values implement a max-heap for numeric input.

```python
import heapq
from collections.abc import Iterable


def kth_smallest_stream(values: Iterable[int], k: int) -> int:
    if k <= 0:
        raise ValueError("k must be positive")

    retained: list[int] = []
    count = 0
    for value in values:
        count += 1
        if len(retained) < k:
            heapq.heappush(retained, -value)
        elif value < -retained[0]:
            heapq.heapreplace(retained, -value)

    if count < k:
        raise ValueError("fewer than k values were provided")
    return -retained[0]


assert kth_smallest_stream(iter([9, 1, 7, 3, 2, 8]), 3) == 3
assert kth_smallest_stream(iter([4, 4, 4]), 2) == 4
```

For generic comparable objects, store a reversed-order wrapper or use a language with a configurable comparator.

### C++ quickselect with standard facilities

```cpp
#include <cstddef>
#include <stdexcept>
#include <vector>
#include <algorithm>

template <class T>
T select_kth(std::vector<T> values, std::size_t k) {
    if (k >= values.size()) {
        throw std::out_of_range("k is outside the sequence");
    }
    auto nth = values.begin() + static_cast<std::ptrdiff_t>(k);
    std::nth_element(values.begin(), nth, values.end());
    return *nth;
}
```

`std::nth_element` rearranges the vector so the selected element has its sorted position and the partitions satisfy the required ordering relation.
The C++ standard specifies average linear comparisons for common implementations rather than promising deterministic worst-case linear behavior.
Copying in this wrapper preserves the caller's vector but adds $O(n)$ memory and copy time.

### Deterministic pivot pseudocode

```text
SELECT_DETERMINISTIC(A, k):
    if |A| is small:
        sort A and return A[k]

    split A into groups of at most five
    sort each small group
    collect each group's median
    pivot := SELECT_DETERMINISTIC(medians, floor(|medians| / 2))

    partition A into values less than, equal to, and greater than pivot
    if k lies in the less partition:
        recurse there
    if k lies in the equal block:
        return pivot
    recurse in the greater partition with adjusted rank
```

The group size five is part of the classic balance proof.
Changing it requires redoing the recurrence analysis.

### API decisions

Name ranks `rank` when zero-based and reserve `k` documentation for one-based user terminology if necessary.
Validate rank before mutating input.
Define how custom comparators treat equal values.
Avoid floating-point NaN unless a total-order policy is supplied.

## 5. Asymptotic Time & Space Complexity

### Sorting baseline

Sorting costs $O(n\log n)$ comparisons and then returns index $k$ in $O(1)$.
It is appropriate when the sorted sequence will answer many later queries.
For one rank, it computes more order information than necessary.

### Randomized quickselect

Each partition scans the active range once.
Uniform random pivots yield expected total time $O(n)$.
Worst-case time is $O(n^2)$.

An iterative in-place implementation uses $O(1)$ auxiliary storage beyond random-generator state.
A recursive implementation has expected $O(\log n)$ stack depth and $O(n)$ worst-case depth.
Copying to preserve input adds $O(n)$ space.

### Median of medians

The deterministic recurrence is

$$
T(n)\le T(n/5)+T(7n/10+O(1))+O(n),
$$

which gives worst-case $O(n)$ time.
Its constants and implementation complexity are usually higher than randomized quickselect.
It is useful when adversarial worst-case behavior matters more than typical speed.

### Heap selection

A heap of size $k$ processes $n$ values in

$$
O(n\log k)
$$

time and $O(k)$ space.
When finding the $k$-th largest, maintain a min-heap of size $k$ instead.
For a rank near the opposite end, retain the smaller of $k$ and $n-k+1$ elements when $n$ is known.

### Multiple queries

For $q$ arbitrary rank queries on unchanged data, sorting once costs

$$
O(n\log n+q).
$$

Running independent expected-linear quickselect $q$ times costs $O(qn)$ expected time.
Multi-selection algorithms can partition around several requested ranks together, but add complexity.

### Output and lower bounds

One selected value uses $O(1)$ output space.
Returning the smallest $k$ values necessarily uses $\Omega(k)$ output.
Any exact comparison-based selector must inspect enough input to distinguish changes that alter the answer, giving an $\Omega(n)$ lower bound in the general case.

## 6. Systems Connections

### Percentiles and telemetry

Exact percentiles over a finite batch are order-statistic queries.
Quickselect can find one percentile without sorting all samples.
Large distributed telemetry systems often use approximate sketches because retaining and transferring every sample is more expensive than selection itself.

### Top-k services

A bounded heap maintains the best $k$ candidates seen in a stream.
Search engines and recommendation systems use related structures after scoring candidates.
Real systems also require stable tie-breaking, deduplication, sharding, and result merging.

### Database execution

Queries with `ORDER BY ... LIMIT k` can use bounded heaps instead of fully sorting when no suitable index supplies order.
The desired output is the whole top-$k$ set, not only its boundary statistic.
An index can make the query cheaper still by reading entries directly in order.

### Load shedding thresholds

A service can select a latency or priority threshold from a recent batch and treat values on either side differently.
The threshold's duplicate policy matters: many requests equal to the boundary can cause a larger admitted set than the nominal rank.

### External memory

In-place quickselect assumes random access to the active data.
For values on disk, repeated partition passes cause I/O.
External selection uses block-aware partitioning, sampling, or multiway techniques.
A heap is attractive for streams when $k$ fits memory.

### Parallel selection

Partition counts can be computed in parallel after choosing a pivot.
Workers classify local values, reduce counts, and retain only the relevant global side.
Skewed pivots produce load imbalance and repeated passes.
Sampling improves pivots but adds coordination.

### Adversarial inputs

Fixed choices such as “always use the first element” permit crafted quadratic cases.
Randomization hides the pivot sequence from ordinary input structure.
When attackers can observe or influence randomness, deterministic median-of-medians or introselect-style fallback can cap worst-case work.

## 7. Practice Checklist

### Define the query

- Decide whether $k$ is zero-based or one-based.
- Decide whether duplicates occupy separate ranks.
- Decide whether input may be reordered.
- Decide whether one or many rank queries are expected.
- Decide whether input is a batch or stream.
- Define custom comparison and NaN behavior.

### Quickselect implementation

- Validate rank before partitioning.
- Randomize or deliberately choose the pivot.
- Use three-way partitioning for duplicates.
- Maintain the global target rank consistently.
- Shrink only to the partition containing $k$.
- Return when $k$ lies in the equal block.
- Prefer iteration to avoid recursion depth failures.
- Copy only when input preservation is required.

### Heap implementation

- Use a max-heap for the $k$ smallest.
- Use a min-heap for the $k$ largest.
- Keep heap size at most $k$.
- Reject nonpositive $k$.
- Detect streams shorter than $k$.
- Clarify whether all top-$k$ values or only the boundary is returned.

### Test cases

- One element.
- Rank zero.
- Rank $n-1$.
- Already sorted input.
- Reverse-sorted input.
- All values equal.
- Many duplicates near the target.
- Negative values.
- Random values checked against sorting.
- Invalid ranks.
- Adversarial fixed-pivot orders.

### Validate invariants

- Values left of the equal block compare smaller.
- Values inside it compare equal.
- Values right of it compare greater.
- The active interval always contains rank $k$.
- The interval shrinks after every unsuccessful partition.
- Heap contents are the best $k$ values of every processed prefix.

### Choose the method

- Sort when many ranks or ordered iteration are needed.
- Use randomized quickselect for one mutable in-memory batch.
- Use deterministic selection for strict worst-case guarantees.
- Use a heap for streams or small $k$.
- Use approximate quantile sketches when exact values need not be retained.
- Use library selection primitives when their guarantees match the requirement.

## 8. Frequently Asked Questions

### Is the $k$-th element zero-based or one-based?

Mathematical order-statistic language is often one-based, while array APIs are often zero-based.
State the convention explicitly and convert once at the boundary.

### Why not always sort?

Sorting determines the relative order of every value.
A single rank query only needs enough partition information to isolate one position.

### Does quickselect return a sorted prefix?

No.
It places the selected value at its rank and partitions values by comparison, but values within either side can remain unordered.

### What is quickselect's worst case?

$O(n^2)$ when pivots repeatedly leave an active partition only one element smaller.
Randomization makes this unlikely but does not remove the formal worst case.

### Why use a three-way partition?

It groups all pivot-equal values at once.
Duplicate-heavy inputs then terminate or discard the whole equal block rather than processing equal values repeatedly.

### Is median of medians always faster?

No.
It provides worst-case linear time but often has higher constants than randomized quickselect.
Its value is the guarantee, not automatic wall-clock superiority.

### Why are groups of five used?

They are small enough to process cheaply and large enough to guarantee that the recursive side remains below a constant fraction compatible with a linear recurrence.

### Can a heap find the median efficiently?

A single batch median can be found in $O(n\log n)$ with a half-size heap, which is worse than linear selection.
Two heaps are useful when the median must be updated after every stream insertion.

### How are duplicates ranked?

This article treats the input as a multiset, so equal values occupy multiple consecutive ranks.
Selecting the $k$-th distinct value is a different problem requiring deduplication or distinct-aware counting.

### Can quickselect work on linked lists?

Its in-place partition advantage depends on random-access arrays.
Linked structures can be partitioned into lists, but allocation and traversal change the practical trade-offs.

### What does `nth_element` guarantee?

It places the requested element where it would appear in sorted order and partitions the range around it.
It does not sort either partition.

### How can I test a selector?

Generate many small random arrays, compare the answer with `sorted(values)[k]`, and include duplicate-heavy and boundary-rank cases.

### What if values include NaN?

Ordinary floating-point comparison with NaN is not a total order.
Reject NaN or supply a documented total-order comparator before applying selection.

### How do I find the $k$-th largest?

Convert it to zero-based ascending rank $n-k$ for a batch, or maintain a min-heap of the $k$ largest stream values.

### What should I study next?

Study two-heap running medians, top-$k$ extraction, quantile sketches, and introselect strategies that combine fast pivots with worst-case fallback.
