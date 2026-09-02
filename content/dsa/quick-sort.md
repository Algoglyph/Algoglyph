# Quick Sort: Partition Invariants, Pivot Control & Introspective Safeguards

![Quick sort partitioning](/images/dsa/quick-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Quick sort orders an array by partitioning around a chosen pivot.

Values smaller than the pivot move to one side.

Values larger than the pivot move to the other side.

The algorithm then sorts the two partitions recursively.

Tony Hoare developed the method in 1959 and published it in 1961.

Its appeal comes from compact in-place partitioning and strong cache behavior.

Average running time is $O(n\log n)$.

Poor pivot choices can produce $O(n^2)$ time.

This gap makes pivot policy a correctness-adjacent engineering decision.

Partitioning is the real mechanism.

Recursion only applies the same mechanism to smaller ranges.

Several partition schemes are valid.

Lomuto partition is simple and uses one growing less-than region.

Hoare partition scans inward from both ends and often performs fewer swaps.

Three-way partition separates less-than, equal-to, and greater-than regions.

Three-way partition is especially effective when many keys repeat.

The schemes use different return values and recursion boundaries.

Mixing their contracts causes skipped elements or infinite recursion.

Quick sort is usually unstable.

Equal keys can change relative order during swaps.

It can be made stable with extra storage, but that loses its common in-place advantage.

Arrays suit quick sort because indexed swaps are cheap and memory is contiguous.

Linked lists generally favor merge sort because splitting and merging use links.

Production standard libraries rarely expose naive recursive quick sort unchanged.

They use randomized pivots, median sampling, insertion-sort cutoffs, or introsort.

Introsort starts like quick sort and switches to heap sort at excessive recursion depth.

That combination preserves quick sort's common-case behavior and $O(n\log n)$ worst case.

Recursing on the smaller side first limits stack depth.

The larger side can be handled by loop iteration.

This transforms stack usage from worst-case $O(n)$ to $O(\log n)$.

The comparison function must define a consistent strict ordering.

NaN values, mutable keys, or inconsistent comparators can violate assumptions.

The objective is not merely to memorize a pivot swap.

It is to maintain explicit regions whose membership is always known.

## 2. Core Mathematical Invariants

### Sorting contract

For input array `A`, output must be a permutation of the same elements.

For every valid adjacent pair in ascending order:

$$
A[i]\le A[i+1].
$$

Partitioning must preserve the multiset because it only swaps elements.

Recursive calls must cover every non-pivot element exactly once.

### Lomuto partition invariant

Choose pivot `p = A[hi]`.

Maintain boundary `i` for values known to be at most the pivot.

Before scanning index `j`, regions satisfy:

$$
A[lo..i]\le p,
$$

$$
A[i+1..j-1]>p,
$$

and `A[j..hi-1]` remains unclassified.

If `A[j] <= p`, increment `i` and swap `A[i]` with `A[j]`.

Otherwise extend the greater-than region by advancing `j`.

After the scan, swap the pivot into `i+1`.

Every value left of that position is at most the pivot.

Every value right of it is greater than the pivot.

The pivot is in its final sorted position.

### Three-way partition invariant

For Dutch-national-flag partition, maintain indices `lt`, `i`, and `gt`.

The regions are:

$$
A[lo..lt-1]<p,
$$

$$
A[lt..i-1]=p,
$$

$$
A[i..gt]\text{ is unknown},
$$

$$
A[gt+1..hi]>p.
$$

If `A[i] < p`, swap it with `A[lt]` and advance both.

If `A[i] > p`, swap it with `A[gt]` and decrement `gt`.

Do not advance `i` after the greater-than swap.

The incoming value at `i` has not yet been classified.

If `A[i] == p`, advance only `i`.

At termination `i > gt`, so the unknown region is empty.

### Recursive invariant

When sorting range `[lo,hi]`, elements outside that range remain untouched.

After partition, the equal pivot block needs no recursive work.

Only the strictly smaller and strictly greater regions remain unsorted internally.

Recursive calls use disjoint ranges that are strictly shorter.

Strict decrease proves termination.

### Pivot independence

Correctness does not require a balanced pivot.

Any pivot value from the range yields a valid partition.

Balance affects time, not the sorted result.

Randomization makes the split distribution independent of preexisting input order.

### Stability property

Ordinary in-place swaps do not preserve the order of equal records.

If stability is required, quick sort needs a stable partition with extra space.

The algorithm's API should not imply stability unless it supplies that mechanism.

### Depth safeguard

Introsort tracks an allowed depth such as:

$$
2\lfloor\log_2 n\rfloor.
$$

Reaching the limit triggers heap sort on the remaining range.

This prevents an adversarial sequence of one-sided partitions from causing quadratic time.

## 3. Step-by-Step Execution Trace

Sort array `[7,2,9,4,3,8,5]` using three-way partition.

Choose pivot value `5` from the final element.

Initialize `lt = 0`, `i = 0`, and `gt = 6`.

Unknown region is the entire array.

At `i = 0`, value `7` is greater than pivot.

Swap positions `0` and `6`.

Array becomes `[5,2,9,4,3,8,7]`.

Decrement `gt` to `5`.

Keep `i = 0` because incoming value `5` is unclassified.

Value `5` equals pivot.

Advance `i` to `1`.

At index `1`, value `2` is smaller.

Swap positions `1` and `lt = 0`.

Array becomes `[2,5,9,4,3,8,7]`.

Advance `lt` to `1` and `i` to `2`.

At index `2`, value `9` is greater.

Swap positions `2` and `gt = 5`.

Array becomes `[2,5,8,4,3,9,7]`.

Decrement `gt` to `4` and keep `i = 2`.

Value `8` is greater than pivot.

Swap positions `2` and `4`.

Array becomes `[2,5,3,4,8,9,7]`.

Decrement `gt` to `3`.

Value `3` at index `2` is smaller than pivot.

Swap positions `2` and `lt = 1`.

Array becomes `[2,3,5,4,8,9,7]`.

Advance `lt` to `2` and `i` to `3`.

Value `4` is smaller than pivot.

Swap positions `3` and `2`.

Array becomes `[2,3,4,5,8,9,7]`.

Advance `lt` to `3` and `i` to `4`.

Now `i = 4` and `gt = 3`, so partition ends.

Smaller region is indices `[0,2]` containing `[2,3,4]`.

Equal region is index `[3,3]` containing `[5]`.

Greater region is `[4,6]` containing `[8,9,7]`.

Recursively sort `[2,3,4]`.

Its chosen pivot can produce three singleton classifications.

Recursively sort `[8,9,7]` with pivot `7`.

Partition places `7` before `[9,8]`.

The remaining two values partition into `[8,9]`.

The final array is `[2,3,4,5,7,8,9]`.

Every step used swaps, so the output multiset matches the input.

### Duplicate-heavy trace

Partition `[4,2,4,4,1,4]` around pivot `4`.

The equal region grows without recursive calls for each `4`.

The result has smaller region `[2,1]` and equal block `[4,4,4,4]`.

Only `[2,1]` requires further sorting.

A two-way partition can repeatedly recurse through the equal keys.

Three-way partition removes that avoidable work.

## 4. Production-Ready Implementations

The following implementation uses randomized three-way partitioning.

It recurses on the smaller side and loops over the larger side.

```python
from __future__ import annotations

import random
from collections.abc import MutableSequence
from typing import TypeVar

T = TypeVar("T")


def quick_sort(values: MutableSequence[T], *, seed: int | None = None) -> None:
    rng = random.Random(seed)

    def insertion_sort(lo: int, hi: int) -> None:
        for i in range(lo + 1, hi + 1):
            current = values[i]
            j = i - 1
            while j >= lo and current < values[j]:
                values[j + 1] = values[j]
                j -= 1
            values[j + 1] = current

    def sort_range(lo: int, hi: int) -> None:
        while lo < hi:
            if hi - lo < 16:
                insertion_sort(lo, hi)
                return

            pivot = values[rng.randint(lo, hi)]
            lt = lo
            i = lo
            gt = hi

            while i <= gt:
                if values[i] < pivot:
                    values[lt], values[i] = values[i], values[lt]
                    lt += 1
                    i += 1
                elif pivot < values[i]:
                    values[i], values[gt] = values[gt], values[i]
                    gt -= 1
                else:
                    i += 1

            left_size = lt - lo
            right_size = hi - gt
            if left_size < right_size:
                sort_range(lo, lt - 1)
                lo = gt + 1
            else:
                sort_range(gt + 1, hi)
                hi = lt - 1

    sort_range(0, len(values) - 1)


data = [7, 2, 9, 4, 3, 8, 5, 5, 2]
quick_sort(data, seed=42)
assert data == [2, 2, 3, 4, 5, 5, 7, 8, 9]
```

The optional seed makes tests reproducible.

Production callers can omit it for a fresh pseudorandom sequence.

Random pivot values are copied before swaps.

The comparator relies only on strict less-than.

This supports types that define a strict weak ordering without `<=`.

The insertion-sort cutoff improves tiny-range locality.

The exact threshold should be benchmarked for the language and data type.

The smaller-side recursion rule bounds active recursive depth.

It does not prevent quadratic comparison count.

For a hard worst-case time guarantee, add an introspective heap-sort fallback.

Standard-library sort should be preferred unless custom partition behavior is required.

Test custom comparators for transitivity and consistency.

Do not mutate comparison keys while sorting.

## 5. Asymptotic Time & Space Complexity

Partitioning a range of length `n` takes $O(n)$ time.

If the pivot splits into fractions near one half, the recurrence is:

$$
T(n)=2T(n/2)+O(n).
$$

The solution is $O(n\log n)$.

More generally, expected randomized quick-sort time is $O(n\log n)$.

Expected comparisons are approximately proportional to $n\log n$.

A pivot that is always minimum or maximum gives:

$$
T(n)=T(n-1)+O(n)=O(n^2).
$$

Already sorted input triggers this pattern for naive first-element pivots.

Random selection makes such behavior unlikely independently of input order.

It does not create a deterministic worst-case guarantee.

Three-way partition handles all-equal data in one $O(n)$ pass.

A poor two-way implementation may recurse quadratically on equal values.

In-place partitioning uses $O(1)$ element storage beyond recursion.

Naive recursion uses expected $O(\log n)$ stack space.

Its worst-case stack depth is $O(n)$.

Recursing only on the smaller side guarantees $O(\log n)$ active stack depth.

The larger side is processed iteratively.

Introsort adds heap sort to guarantee $O(n\log n)$ worst-case time.

Insertion sort on small ranges does not change the asymptotic bound.

Quick sort is not stable under the shown in-place partition.

A stable external partition needs $O(n)$ auxiliary storage.

Cache locality often makes array quick sort faster than pointer-heavy alternatives.

Comparator cost can dominate when keys are expensive to compute.

Decorate-sort-undecorate can cache derived keys at $O(n)$ extra space.

## 6. Systems Connections

Standard libraries use quick-sort descendants or introspective hybrids.

C++ `std::sort` commonly follows introsort-style guarantees.

Java uses dual-pivot quick sort for some primitive arrays.

Object-array sorting may choose stable merge-derived algorithms instead.

Database partition operators divide records around predicates or hash values.

Selection algorithms reuse partitioning without sorting both sides.

Quickselect finds an order statistic in expected linear time.

External-memory sorting rarely uses ordinary quick sort across disks.

Sequential merge passes fit block storage better.

Parallel quick sort can partition chunks and recurse independently.

Load balance depends on pivot quality and duplicate handling.

SIMD partitioning uses masks and buffered writes to reduce branches.

Branch prediction affects classic comparison-heavy loops.

Security-sensitive code should avoid adversarial worst cases.

Random pivots or introspective limits mitigate denial-of-service inputs.

Random seeds exposed to attackers may permit constructed bad sequences.

Deterministic median sampling reduces but does not eliminate all adversarial patterns.

Stable sorting matters for multi-key pipelines.

An unstable second sort can destroy ordering established by the first.

Sorting immutable records by references can reduce swap cost.

Large records may benefit from indirect sorting and one final permutation.

The partition invariant also appears in garbage collectors and data compaction.

## 7. Practice Checklist

- Define the partition scheme before coding recursion boundaries.
- Keep the pivot value stable during swaps.
- State less-than, equal, and greater regions explicitly.
- Advance `i` only after classifying the incoming value.
- Do not advance after swapping from the unknown greater boundary.
- Ensure recursive ranges are strictly smaller.
- Exclude the equal pivot block from recursion.
- Test empty and one-element arrays.
- Test two elements in both orders.
- Test already sorted and reverse-sorted inputs.
- Test all-equal and duplicate-heavy inputs.
- Test negative values and repeated extremes.
- Verify output is sorted.
- Verify output multiset equals input multiset.
- Define whether stability is required.
- Use randomized or sampled pivots for input-order resilience.
- Seed randomness deterministically in tests.
- Add an introspective fallback for worst-case guarantees.
- Recurse on the smaller side first.
- Loop over the larger partition to bound stack depth.
- Benchmark the insertion-sort cutoff.
- Avoid naive quick sort for linked lists.
- Ensure comparators are transitive and consistent.
- Define handling for unordered floating values such as NaN.
- Avoid recomputing expensive sort keys inside every comparison.
- Prefer the language standard library for general production sorting.
- Measure comparisons, swaps, and cache effects when tuning.
- Separate average-time claims from worst-case guarantees.
- Do not mix Lomuto return values with Hoare recursion ranges.
- Check integer index arithmetic at empty boundaries.

## 8. Frequently Asked Questions

The answers below assume an array-backed, comparison-based implementation.

### Why is quick sort usually fast?

It partitions in place, scans contiguous memory, and has small inner-loop overhead.

### What causes quadratic time?

Repeatedly choosing pivots that leave one partition almost as large as the input.

### Does randomization guarantee $O(n\log n)$?

It guarantees expected performance under the random choices, not every execution.

### Why use three-way partitioning?

It removes the entire equal-key block from further recursion.

This is valuable for duplicate-heavy arrays.

### Is quick sort stable?

The usual in-place versions are not stable.

Equal records can cross during swaps.

### How can stack usage be bounded?

Recurse on the smaller partition and process the larger partition with a loop.

### What is introsort?

It begins with quick sort and falls back to heap sort after excessive depth.

This provides $O(n\log n)$ worst-case time.

### Which partition scheme is best?

It depends on duplicates, comparator cost, and implementation goals.

The scheme's invariant and recursion contract must stay consistent.

### Why not use quick sort for linked lists?

Linked lists lack cheap indexed scans and swaps; merge sort fits their structure better.

### What is the core proof idea?

Partition establishes final region relationships, then recursion sorts disjoint smaller regions.
