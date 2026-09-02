# Heap Sort: In-Place Selection with a Shrinking Max-Heap

![Heap sort extraction from a max-heap](/images/dsa/heap-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Heap sort turns a binary heap into an in-place sorting algorithm.

It first rearranges the input into a max-heap.

The root is then the largest unsorted value.

Swap that root with the final unsorted position.

Shrink the active heap boundary.

Repair heap order from the root.

Repeat until the active heap contains one item.

The array serves two roles at once.

Its prefix is the live heap.

Its suffix is the completed sorted output.

No second array proportional to the input size is required.

Heap sort guarantees $O(n\log n)$ time in the worst case.

That bound distinguishes it from basic quicksort, whose unlucky pivots can produce quadratic work.

Heap sort also avoids merge sort's usual $O(n)$ auxiliary buffer.

Those guarantees come with trade-offs.

Heap sort is not stable.

Equal keys can cross during long-distance swaps.

Its memory access pattern jumps between parent and child indices.

That locality is often worse than sequential merging or well-engineered quicksort partitioning.

The constants in repeated sift-down operations can be substantial.

The algorithm is valuable when predictable worst-case time and small auxiliary memory matter more than stability and locality.

It also exposes a useful design pattern.

A data structure can enforce exactly the partial order needed for the next output item.

The heap does not sort every remaining element.

It only certifies that the root is the maximum.

After extracting that maximum, local repair certifies the next one.

Heap sort should not be confused with using a separate priority queue and collecting removals.

A separate heap can sort but consumes $O(n)$ additional storage.

Classic heap sort heapifies the input array itself.

The central question is:

How can one array maintain both a valid heap prefix and a permanently sorted suffix throughout repeated extraction?

## 2. Core Mathematical Invariants

Let the input array be $A$ with length $n$.

At each extraction step, let `heap_size` be the exclusive end of the active heap.

The array is partitioned into:

$$
A[0:\text{heap\_size})
$$

and

$$
A[\text{heap\_size}:n).
$$

### Max-heap prefix invariant

For every child index $i$ with $0<i<\text{heap\_size}$:

$$
A[\lfloor(i-1)/2\rfloor]\ge A[i].
$$

Therefore `A[0]` is the maximum value in the active prefix.

Only indices below `heap_size` participate in this heap.

Values in the suffix must never be pulled back into repair comparisons.

### Sorted-suffix invariant

The suffix `A[heap_size:n]` is sorted in nondecreasing order.

Every suffix value is at least every active heap value.

Formally, whenever both regions are nonempty:

$$
\max A[0:\text{heap\_size})\le
\min A[\text{heap\_size}:n).
$$

Together, suffix order and cross-region order make the suffix final.

No later operation can change it.

### Extraction preserves the partition

Because `A[0]` is the active maximum, swapping it with `A[heap_size-1]` places the correct value at the last active position.

Decrementing `heap_size` moves that position into the sorted suffix.

The suffix grows leftward by one item.

The new root value came from the former last heap leaf.

All other active parent-child edges remain unchanged.

Only the root-to-leaf path may violate heap order.

Sift-down repairs that path without touching the suffix.

### Sift-down invariant

Before each sift-down iteration, both child subtrees of `root` are valid max-heaps.

The value at `root` may be too small.

Compare it with both children.

If a child is larger, swap with the larger child.

The old root then dominates the sibling it did not choose only if the chosen child was maximal.

After the swap, the parent position is correct.

Only the moved value's new subtree root may remain invalid.

### Bottom-up heap construction

Indices from $\lfloor n/2\rfloor$ through $n-1$ are leaves.

Every leaf is a valid one-node heap.

Process internal indices in reverse order:

$$
\left\lfloor\frac{n}{2}\right\rfloor-1,
\ldots,
1,
0.
$$

When index $i$ is processed, its child subtrees are already heaps.

Sift-down makes the subtree rooted at $i$ a heap.

After processing index `0`, the whole array is a max-heap.

### Permutation invariant

Heap sort changes positions only through swaps.

It neither creates nor removes values.

The output is a permutation of the input.

Sortedness without this invariant would be insufficient; an algorithm returning repeated minima could be ordered but incorrect.

### Termination measure

Every extraction decreases `heap_size` by one.

It starts at $n$ and stops at one.

Sift-down moves strictly to a child index each iteration.

Both loops therefore terminate.

### Instability mechanism

Heap comparisons need not preserve the input order of equal keys.

The root-to-end swap can move one equal key across another.

Adding original positions to the comparison key can impose deterministic order, but then the algorithm sorts composite keys and still performs the same long-distance movement.

## 3. Step-by-Step Execution Trace

Sort the array:

```text
[4, 10, 3, 5, 1]
```

The desired result is `[1, 3, 4, 5, 10]`.

### Build the max-heap

The length is five.

The last internal node is index `1`.

Start heapifying from index `1`.

Index `1` contains `10`.

Its children are indices `3` and `4`, values `5` and `1`.

`10` is already at least both children.

No swap occurs.

Move to index `0`, value `4`.

Its children are `10` and `3`.

The larger child is `10` at index `1`.

Swap `4` and `10`.

Array becomes:

```text
[10, 4, 3, 5, 1]
```

Continue sifting the moved `4` at index `1`.

Its children are `5` and `1`.

Swap with larger child `5`.

The built heap is:

```text
[10, 5, 3, 4, 1]
```

Every parent dominates its children.

### Extract maximum `10`

Swap root `10` with the last active value `1`.

Array becomes `[1, 5, 3, 4, 10]`.

Shrink `heap_size` from five to four.

Suffix `[10]` is final.

Sift root `1` inside prefix `[1, 5, 3, 4]`.

The larger child is `5`.

Swap to get `[5, 1, 3, 4, 10]`.

At index `1`, the only active child is `4`.

Swap again.

Array becomes `[5, 4, 3, 1, 10]`.

The active prefix is a max-heap.

### Extract maximum `5`

Swap index `0` with active end index `3`.

Array becomes `[1, 4, 3, 5, 10]`.

Shrink `heap_size` to three.

Suffix `[5, 10]` is sorted and final.

Sift root `1` against children `4` and `3`.

Swap with `4`.

Array becomes `[4, 1, 3, 5, 10]`.

### Extract maximum `4`

Swap root with active end index `2`.

Array becomes `[3, 1, 4, 5, 10]`.

Shrink `heap_size` to two.

Suffix is `[4, 5, 10]`.

Root `3` already dominates child `1`.

No repair swap is needed.

### Extract maximum `3`

Swap root and active end index `1`.

Array becomes `[1, 3, 4, 5, 10]`.

Shrink `heap_size` to one.

A one-element prefix is trivially sorted.

The full array is now nondecreasing.

### Check the loop invariant

After every extraction, the suffix contains exactly the largest values removed so far.

They appear in ascending order because each new maximum is placed immediately before previously extracted larger maxima.

The prefix remains a heap after repair.

The trace never compares against an index in the finished suffix.

### Duplicate-key trace

Input records `(2, "first")`, `(1, "middle")`, and `(2, "second")` compare only by the numeric key.

Heap swaps may emit the two key-`2` records in either relative order.

Numeric sortedness still holds.

Stability does not.

## 4. Production-Ready Implementations

This implementation accepts a mutable list and sorts it in place.

Its optional key function is evaluated once per element.

Decorating values avoids repeated expensive key computation during comparisons.

```python
from typing import Callable, TypeVar

T = TypeVar("T")
K = TypeVar("K")


def heap_sort(values: list[T], key: Callable[[T], K] = lambda value: value) -> None:
    decorated = [(key(value), value) for value in values]
    size = len(decorated)

    def sift_down(root: int, heap_size: int) -> None:
        while True:
            left = 2 * root + 1
            right = left + 1
            largest = root

            if left < heap_size and decorated[left][0] > decorated[largest][0]:
                largest = left
            if right < heap_size and decorated[right][0] > decorated[largest][0]:
                largest = right
            if largest == root:
                return

            decorated[root], decorated[largest] = decorated[largest], decorated[root]
            root = largest

    for root in range(size // 2 - 1, -1, -1):
        sift_down(root, size)

    for heap_size in range(size - 1, 0, -1):
        decorated[0], decorated[heap_size] = decorated[heap_size], decorated[0]
        sift_down(0, heap_size)

    values[:] = [value for _, value in decorated]
```

The decoration array uses $O(n)$ additional space.

That is appropriate when key caching matters, but it is not the classic constant-extra-space variant.

For primitive directly comparable values, sort the original list without decoration to retain $O(1)$ auxiliary storage.

### Strict in-place integer variant

```python
def heap_sort_in_place(values: list[int]) -> None:
    def sift_down(root: int, heap_size: int) -> None:
        while True:
            left = 2 * root + 1
            if left >= heap_size:
                return

            right = left + 1
            largest = left
            if right < heap_size and values[right] > values[left]:
                largest = right

            if values[root] >= values[largest]:
                return

            values[root], values[largest] = values[largest], values[root]
            root = largest

    for root in range(len(values) // 2 - 1, -1, -1):
        sift_down(root, len(values))

    for end in range(len(values) - 1, 0, -1):
        values[0], values[end] = values[end], values[0]
        sift_down(0, end)
```

### Execute representative cases

```python
sample = [4, 10, 3, 5, 1]
heap_sort_in_place(sample)
assert sample == [1, 3, 4, 5, 10]

cases = [
    [],
    [7],
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [5, 1, 5, 2, 5],
    [-3, 8, 0, -3, 2],
]

for case in cases:
    expected = sorted(case)
    heap_sort_in_place(case)
    assert case == expected

records = [{"score": 3}, {"score": 1}, {"score": 2}]
heap_sort(records, key=lambda record: record["score"])
assert [record["score"] for record in records] == [1, 2, 3]
```

The generic version's type annotation assumes comparable keys.

Production interfaces should state mutation, stability, comparison failure, and exception behavior.

## 5. Asymptotic Time & Space Complexity

Bottom-up max-heap construction costs $O(n)$.

Although one sift can move $O(\log n)$ levels, most nodes begin near the leaves.

Their aggregate movement is linear.

There are $n-1$ extraction steps.

Each extraction performs one root swap and at most one heap-height sift.

The active heap height is at most $\lfloor\log_2 n\rfloor$.

Extraction therefore costs:

$$
\sum_{k=2}^{n}O(\log k)=O(n\log n).
$$

Adding linear heap construction leaves total time $O(n\log n)$.

The bound holds for best, average, and worst cases under the standard implementation.

Already sorted input still undergoes heap construction and extraction.

Heap sort is not adaptive.

The strict in-place iterative version uses $O(1)$ auxiliary storage.

Recursive sift-down would use $O(\log n)$ call-stack space.

The decorated key-caching implementation uses $O(n)$ extra storage.

Its trade-off is fewer key-function calls.

| Stage | Time | Strict in-place extra space |
|---|---:|---:|
| Bottom-up heapify | $O(n)$ | $O(1)$ |
| One extraction | $O(\log n)$ | $O(1)$ |
| All extractions | $O(n\log n)$ | $O(1)$ |
| Complete sort | $O(n\log n)$ | $O(1)$ |

Comparison sorting has an $\Omega(n\log n)$ lower bound in the general decision-tree model.

Heap sort meets that asymptotic bound in the worst case.

It does not minimize comparisons or data movement constants for every workload.

## 6. Systems Connections

### Introspective sorting

Introsort begins with quicksort-like partitioning.

It monitors recursion depth.

If partitions remain unbalanced, it switches to heap sort.

This preserves quicksort's common-case locality while enforcing $O(n\log n)$ worst-case time.

Heap sort acts as a safety net rather than the default path.

### Embedded and bounded-memory systems

The strict in-place variant has predictable auxiliary memory.

It avoids allocation proportional to input length.

That property can matter when memory budgets are fixed.

Worst-case time is also predictable asymptotically.

Comparator cost and cache behavior still need measurement.

### External data

Heap sort is not an external-memory sorting algorithm.

Its parent-child jumps cause poor block locality on data larger than memory.

External merge sort uses sequential runs and merges to reduce storage I/O.

Choosing heap sort solely for $O(1)$ RAM ignores the cost of random storage access.

### Partial selection

If only the largest or smallest $k$ values are needed, fully sorting all $n$ items may waste work.

A size-$k$ heap can solve streaming top-k in $O(n\log k)$ time and $O(k)$ space.

Quickselect offers expected linear selection for in-memory arrays.

Use the operation required, not sorting by habit.

### Cache behavior

Sift-down touches indices `i`, `2i+1`, and `2i+2`.

Paths spread across the array as the heap grows.

Modern CPUs generally prefer the contiguous scans used by merging or partitioning.

Heap sort's asymptotic guarantees do not predict its ranking in a wall-clock benchmark.

### Write amplification

Each extraction performs a root-end swap plus sift swaps.

Large records make these moves expensive.

Sorting handles or indices can reduce bytes moved.

The final indirection cost and ownership model must then be considered.

### Security-sensitive bounds

Inputs controlled by an adversary cannot force heap sort into quadratic comparison counts.

That makes it a useful fallback when deterministic worst-case bounds matter.

Comparators themselves must still be total, deterministic, and free from unsafe side effects.

## 7. Practice Checklist

- Decide whether output order is ascending or descending.
- Use a max-heap for in-place ascending output.
- Use a min-heap for in-place descending output.
- Treat `heap_size` as an exclusive boundary.
- Never compare children outside the active prefix.
- Compare both children before selecting a swap target.
- Swap with the larger child in a max-heap.
- Continue sifting after every swap.
- Build from the last internal node.
- Use bottom-up heapify rather than repeated insertion.
- Verify the heap prefix after construction.
- Verify the sorted suffix after each extraction in tests.
- Test empty input.
- Test one element.
- Test two elements.
- Test ascending input.
- Test descending input.
- Test equal values.
- Test negative values.
- Test a mixture of duplicates and unique values.
- Compare randomized outputs with a trusted sort.
- Verify output is a permutation of input.
- Do not claim stability.
- Cache expensive keys deliberately.
- Account for decoration space when caching keys.
- Use iterative sift-down for constant call-stack space.
- Document in-place mutation.
- Ensure the comparator defines a consistent order.
- Prefer partial-selection algorithms when only top-k is required.
- Benchmark locality-sensitive workloads rather than relying only on Big-O.

## 8. Frequently Asked Questions

### Why does ascending heap sort use a max-heap?

The maximum belongs at the final unsorted position.

Each extraction moves the max-heap root to that position, growing an ascending suffix from right to left.

### Is heap sort stable?

No.

Root-end and sift swaps can move equal-key records across one another.

### Is heap sort truly in place?

The direct iterative array implementation uses $O(1)$ auxiliary storage.

Key decoration, recursive sifting, or a separate priority queue changes that space bound.

### Why is heap construction $O(n)$ rather than $O(n\log n)$?

Most nodes are leaves or near leaves and move only a few levels.

Summing actual subtree heights over all internal nodes gives a linear total.

### Does sorted input make heap sort faster?

Not asymptotically.

Heap sort still builds a heap and performs the extraction loop, so it is not adaptive to existing order.

### Why must sift-down choose the larger child?

After the swap, the new parent must dominate both children.

Choosing the smaller child can leave the larger child above a smaller parent.

### Can heap sort sort linked lists efficiently?

Its index arithmetic assumes random access.

Merge sort fits linked lists better because it splits and merges through sequential links.

### How does heap sort compare with quicksort?

Heap sort guarantees $O(n\log n)$ worst-case time and constant auxiliary space.

Quicksort often has better locality and constants but needs pivot safeguards for worst-case protection.

### How does heap sort compare with merge sort?

Merge sort is stable and sequential-access friendly but commonly needs $O(n)$ auxiliary array space.

Heap sort is unstable and less cache-friendly but can operate with constant extra storage.

### Can I use a library priority queue instead?

Yes, but inserting all items into a separate queue and removing them uses $O(n)$ extra storage.

That is not the classic in-place heap-sort algorithm.

### When should heap sort be chosen?

Choose it when deterministic $O(n\log n)$ comparisons and small auxiliary memory outweigh stability and locality concerns.

It is also a strong fallback inside hybrid sorting algorithms.
