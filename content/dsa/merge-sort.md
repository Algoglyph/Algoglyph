# Merge Sort: Stable Ordering by Combining Sorted Runs

![Merge sort](/images/dsa/merge-sort-dark.jpg#dark)

Merge sort divides a sequence until each piece is trivially sorted, then combines adjacent sorted runs in linear time.
Its $O(n\log n)$ worst-case bound does not depend on pivot quality or input order.
The standard array implementation is stable and predictable, paid for with auxiliary storage.

## 1. Historical Context & Motivation

### Sorting through merging

John von Neumann described merge sort in 1945.
The algorithm separates sorting into two ideas:

- recursively sort smaller ranges;
- merge two sorted ranges by repeatedly taking the smaller front element.

Merging is easier than sorting from scratch because each run has known order.

### Why predictability matters

Quick sort often performs well in memory but needs careful pivoting to avoid quadratic worst cases.
Heap sort guarantees $O(n\log n)$ in place but is not stable and has less sequential access.
Merge sort guarantees $O(n\log n)$ comparisons and naturally preserves equal-key order.

### Stability

A stable sort keeps the original relative order of records whose keys compare equal.
If employees are first ordered by name and then stably sorted by department, names remain ordered within each department.

During merge, choose the left-run element when keys tie.
Choosing the right element first breaks stability.

### External sorting

Merge sort's sequential merge pattern fits data larger than memory.
Sort chunks independently into runs, write them to storage, then perform multiway merges.
Disk and network sorting systems build on this run-based structure.

### Problem statement

Given a sequence of $n$ comparable elements, return or produce a nondecreasing permutation.
The output must contain exactly the input multiset.
For record sorting, comparator semantics and stability must be defined.

## 2. Core Mathematical Invariants

### Divide invariant

For range `[lo, hi)`, choose midpoint

$$
mid=lo+\left\lfloor\frac{hi-lo}{2}\right\rfloor.
$$

The halves `[lo,mid)` and `[mid,hi)` are disjoint and cover the original range.
Their lengths are smaller whenever `hi - lo > 1`.

### Base case

A range of length zero or one is sorted.
Returning immediately establishes the induction base and prevents infinite recursion.

### Recursive invariant

Before merge begins, both halves are sorted and each is a permutation of its original contents.
Merge must produce a sorted permutation of their union.

### Merge-loop invariant

Let `i` index the unconsumed left run, `j` the unconsumed right run, and `out` the destination.
Before each selection:

- output contains exactly the consumed elements;
- output is sorted;
- every output element is no greater than every unconsumed candidate that can come next;
- left suffix and right suffix remain sorted.

Comparing the two front elements identifies the smallest unconsumed value globally.
Appending it preserves the invariant.

### Exhaustion

When one run empties, every element in the other run is at least the last output element.
Copy the remaining suffix directly.
No further cross-run comparison is required.

### Stability invariant

When left and right front keys compare equal, take the left item.
Elements inside each run already retain original order by induction.
Left-before-right on cross-run ties preserves global original order.

### Permutation invariant

Every input element is copied exactly once into the merge destination.
Indices only advance after copying their current element.
No element is created, lost, or duplicated.

### Recursion depth

Balanced halving yields depth

$$
\lceil\log_2 n\rceil.
$$

At each depth, the total length of merged ranges is $n$.
This gives the standard complexity proof.

### Bottom-up invariant

An iterative variant starts with runs of length one.
After pass width $w$, every aligned run of length up to $2w$ is sorted.
Doubling width eventually covers the array.

## 3. Step-by-Step Execution Trace

### Input

Sort

```text
[38, 27, 43, 3, 9, 82, 10]
```

Use half-open ranges.

### First division

Split into

```text
[38,27,43] and [3,9,82,10]
```

The exact midpoint convention can place the extra element on either side.
Balanced depth remains logarithmic.

### Divide the left half

Split `[38,27,43]` into `[38]` and `[27,43]`.
Split `[27,43]` into `[27]` and `[43]`.
All singleton runs are sorted.

Merge `[27]` and `[43]`.
Compare twenty-seven with forty-three and take twenty-seven.
Copy remaining forty-three.
Result is `[27,43]`.

Merge `[38]` with `[27,43]`.
Compare thirty-eight with twenty-seven and take twenty-seven.
Compare thirty-eight with forty-three and take thirty-eight.
Copy forty-three.
Left result is

```text
[27,38,43]
```

### Divide the right half

Split `[3,9,82,10]` into `[3,9]` and `[82,10]`.

Merge `[3]` and `[9]` to obtain `[3,9]`.
Merge `[82]` and `[10]` to obtain `[10,82]`.

### Merge right runs

Merge `[3,9]` and `[10,82]`.
Take three, then nine, because each is below ten.
The left run is exhausted.
Copy ten and eighty-two.

Right result is

```text
[3,9,10,82]
```

### Final merge

Merge left `[27,38,43]` and right `[3,9,10,82]`.

Compare twenty-seven and three; take three.
Compare twenty-seven and nine; take nine.
Compare twenty-seven and ten; take ten.
Compare twenty-seven and eighty-two; take twenty-seven.
Compare thirty-eight and eighty-two; take thirty-eight.
Compare forty-three and eighty-two; take forty-three.
Copy eighty-two.

Final output is

```text
[3,9,10,27,38,43,82]
```

### Stability trace

Sort records by numeric key:

```text
[(2,"A"), (1,"B"), (2,"C"), (1,"D")]
```

A stable result is

```text
[(1,"B"), (1,"D"), (2,"A"), (2,"C")]
```

During the final merge, ties choose the left run first.
That preserves `B` before `D` and `A` before `C`.

### Level accounting

At the singleton merge level, total merged length is seven.
At each higher level, ranges remain disjoint and cover seven elements.
There are $O(\log7)$ levels.
Total work is $O(7\log7)$ for this instance and $O(n\log n)$ generally.

## 4. Production-Ready Implementations

### Stable Python implementation

```python
from collections.abc import Callable, Iterable
from typing import TypeVar


T = TypeVar("T")
K = TypeVar("K")


def merge_sort(values: Iterable[T], key: Callable[[T], K]) -> list[T]:
    data = list(values)
    buffer = data.copy()

    def sort(lo: int, hi: int) -> None:
        if hi - lo <= 1:
            return
        mid = lo + (hi - lo) // 2
        sort(lo, mid)
        sort(mid, hi)

        if key(data[mid - 1]) <= key(data[mid]):
            return

        i, j, out = lo, mid, lo
        while i < mid and j < hi:
            if key(data[i]) <= key(data[j]):
                buffer[out] = data[i]
                i += 1
            else:
                buffer[out] = data[j]
                j += 1
            out += 1

        while i < mid:
            buffer[out] = data[i]
            i += 1
            out += 1
        while j < hi:
            buffer[out] = data[j]
            j += 1
            out += 1
        data[lo:hi] = buffer[lo:hi]

    sort(0, len(data))
    return data


records = [(2, "A"), (1, "B"), (2, "C"), (1, "D")]
assert merge_sort(records, key=lambda item: item[0]) == [
    (1, "B"), (1, "D"), (2, "A"), (2, "C")
]
assert merge_sort([], key=lambda item: item) == []
```

The boundary check skips merging when the two sorted halves are already globally ordered.
It improves nearly sorted inputs without changing worst-case complexity.

### Bottom-up pseudocode

```text
width := 1
while width < n:
    for lo in 0, 2*width, 4*width, ...:
        mid := min(lo + width, n)
        hi := min(lo + 2*width, n)
        merge [lo,mid) with [mid,hi)
    width := 2*width
```

This removes recursion and visits runs in predictable passes.

### Linked-list merge sort

Linked lists can split with slow and fast pointers and merge by relinking nodes.
They avoid an $O(n)$ auxiliary element buffer, though recursion still uses $O(\log n)$ frames.
Random access sorting algorithms fit linked lists poorly.

### Comparator requirements

The comparison must define a consistent strict weak order or total preorder appropriate to the language.
Inconsistent comparison can produce output that is neither meaningful nor reproducible.
Floating-point NaN requires an explicit policy.

### Avoid repeated key computation

If key extraction is expensive, decorate each item once with its key and original sequence position, sort decorated records, then remove decoration.
Repeated key calls inside merge can otherwise multiply extraction cost by $O(\log n)$ levels.

## 5. Asymptotic Time & Space Complexity

### Recurrence

For balanced halves,

$$
T(n)=2T(n/2)+\Theta(n).
$$

The Master Theorem gives

$$
T(n)=\Theta(n\log n).
$$

Best, average, and worst cases retain this bound in the standard implementation.

### Comparisons

Merging runs of lengths $a$ and $b$ uses at most $a+b-1$ comparisons.
Across all levels, comparison count is $O(n\log n)$.

### Array space

A reusable merge buffer needs $O(n)$ auxiliary storage.
Recursion adds $O(\log n)$ frames.
Allocating new subarrays in every recursive call increases allocation traffic and should be avoided in performance-sensitive code.

### Linked-list space

Relinking nodes can merge with $O(1)$ auxiliary node storage.
Recursive splitting still uses $O(\log n)$ stack space.

### External merge sort

If memory holds $M$ records, initial run generation creates about $n/M$ runs.
A $k$-way merge reduces pass count according to available buffers and file handles.
I/O complexity, not only comparisons, dominates.

### Parallelism

Independent halves can sort concurrently.
Merging can also be partitioned but requires locating compatible split points.
Parallel overhead makes small ranges better handled serially.

## 6. Systems Connections

### Stable record processing

Stable sorting supports multi-key order by applying stable sorts from least significant key to most significant key.
Many standard-library sorts provide stability explicitly; check the contract.

### External data systems

Database sort operators create sorted runs within memory limits and merge them from disk.
Log-processing pipelines use similar techniques for time-ordered streams.
Spill files need cleanup and failure handling.

### Merge joins

Two relations sorted by join key can be scanned together.
Duplicate-key groups require careful cross-product handling.
The merge pattern is related, but join semantics are not ordinary sorting.

### Version control

Three-way text merge is not merge sort.
It combines changes relative to a base and resolves conflicts rather than ordering elements.
The shared word “merge” should not imply the same invariant.

### Cache behavior

Merging reads and writes sequentially, which works well with caches and storage prefetching.
Recursive access patterns can be tuned with insertion sort for small base ranges.

### Security

Predictable $O(n\log n)$ avoids adversarial pivot cases.
Untrusted sizes can still exhaust memory through the auxiliary buffer.
Comparator code should be pure, bounded, and overflow-safe.

### Natural merge sort

Real data often already contains monotonic runs.
Natural merge sort scans for existing nondecreasing runs instead of beginning with singletons.
It then merges neighboring runs until one remains.

An already sorted array forms one run and needs only a linear discovery scan.
Reverse runs can sometimes be reversed safely, but stability requires care when equal keys occur.

Modern adaptive stable sorting methods build on this observation with run stacks and policies controlling merge balance.
The exact policy matters because repeatedly merging one huge run with tiny runs can increase copying.

### K-way merge

External sorting often merges more than two runs at once.
Keep the current front item of each run in a min-heap keyed by sort key and stable tie information.

Pop the smallest item, emit it, and push the next item from the same run.
For $k$ runs containing $N$ total items, time is

$$
O(N\log k)
$$

and heap storage is $O(k)$, excluding I/O buffers.

Larger $k$ reduces the number of merge passes but requires more buffers and open streams.
External-sort design therefore balances fan-in against available memory and file-handle limits.

### Inversion counting

Merge sort can count inversions while sorting.
An inversion is a pair $(i,j)$ with $i<j$ and $A[i]>A[j]$.

When a right-run value is selected before the current left-run value, it is smaller than every unconsumed left value.
Add the number of remaining left values to the inversion count.

The merge invariant proves that all those cross inversions are real.
Recursive calls count inversions internal to each half.
Total time remains $O(n\log n)$.

### Alternating source and destination buffers

Copying every merged slice back into the source adds memory traffic.
An optimized recursive implementation alternates the roles of source and destination arrays by level.

Each call reads sorted child runs from one buffer and writes its merged result to the other.
The interface invariant must specify which buffer owns valid output at each recursion depth.

This technique reduces copying but makes base cases and boundary-skip logic less obvious.
Use tests that compare both odd and even recursion depths.

### Parallel merge limits

Sorting left and right halves is embarrassingly parallel until task overhead dominates.
The final merge remains linear work and can become a sequential bottleneck.

Parallel merge partitions one run, binary-searches compatible positions in the other, and assigns disjoint output slices.
Load balance depends on duplicates and partition selection.
Stable tie rules must remain consistent across slice boundaries.

### Small-run cutoffs

Recursive overhead and buffer traffic are expensive for tiny ranges.
Production hybrids commonly switch to insertion sort below a measured cutoff.
Insertion sort is simple, stable when implemented carefully, and efficient on short nearly sorted runs.

The cutoff is an engineering parameter rather than an asymptotic change.
Worst-case time remains $O(n\log n)$ because only constant-bounded leaves use quadratic local work.

Benchmark with the real comparator and record size.
A cutoff tuned for primitive integers may be wrong for large records or expensive key extraction.
Preserve the same comparison and stability policy in both algorithms.
Test the hybrid boundary at cutoff minus one, cutoff, and cutoff plus one.
Confirm that equal records crossing the cutoff retain original order.
Keep the cutoff outside the correctness logic so tuning cannot change results.
Document whether small runs are sorted in the source or destination buffer.

## 7. Practice Checklist

### Divide

- Use half-open ranges.
- Compute midpoint without overflow.
- Stop at length zero or one.
- Cover the original range exactly.
- Keep recursion balanced.

### Merge

- Assume both runs are sorted.
- Compare front elements.
- Choose left on equality for stability.
- Advance exactly one selected pointer.
- Copy remaining suffix.
- Write every element exactly once.

### Implementation

- Reuse one buffer.
- Avoid repeated slicing.
- Define comparator semantics.
- Cache expensive keys.
- Test already ordered boundaries.
- Consider bottom-up traversal.

### Tests

- Empty sequence.
- One element.
- Two ordered elements.
- Two reversed elements.
- Already sorted input.
- Reverse-sorted input.
- Duplicate keys.
- Stability records.
- Odd length.
- Non-power-of-two length.

### Validation

- Output is nondecreasing.
- Output multiset equals input multiset.
- Equal-key order is preserved.
- Compare with trusted sorting.
- Test random arrays.
- Check comparator edge cases.

## 8. Frequently Asked Questions

### Is merge sort stable?

It is stable when merge chooses the left-run item on equal keys.
An implementation can break stability by choosing the right item first.

### Is merge sort in place?

The standard array form uses $O(n)$ auxiliary storage.
Specialized in-place merges exist but are substantially more complex.

### Why is build time always $O(n\log n)$?

There are logarithmically many balanced levels and each level merges a total of $n$ elements.

### Does sorted input make it linear?

The boundary-skip optimization can reduce merging work, though recursive checks still occur.
Standard unoptimized merge sort remains $\Theta(n\log n)$.

### Why is it good for linked lists?

Splitting and merging can relink nodes sequentially without random access or a full auxiliary element array.

### Why is it good for external sorting?

Merges read sorted runs sequentially, matching block storage and limited-memory buffers.

### Can it sort in descending order?

Yes.
Reverse comparator and tie logic consistently.

### How does it compare with quick sort?

Merge sort guarantees $O(n\log n)$ and stability with extra storage.
Quick sort is often in-place and cache-efficient but needs pivot safeguards.

### Why not allocate arrays at every recursion?

It increases allocation, copying, and garbage-collection costs.
One reusable buffer is more predictable.

### What breaks stability?

Taking the right element before an equal left element reverses cross-run equal-key order.

### What is the most common bug?

Mixing inclusive and half-open bounds, causing omitted or duplicated midpoint elements.

### What should I study next?

Study external merge sort, k-way merging, merge joins, inversion counting, and parallel merge algorithms.
