# Bubble Sort: Adjacent Inversions, Stable Exchanges & Adaptive Passes

![Bubble sort adjacent exchanges](/images/dsa/bubble-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Bubble sort repeatedly compares neighboring elements and swaps an inverted pair.

After a left-to-right pass, a maximum element in the unsorted prefix reaches that prefix's right boundary.

The motion resembles a bubble rising through a medium, which explains the common name.

The algorithm is old enough that assigning a single inventor is not useful.

It became a familiar teaching algorithm because its state transitions are visible and local.

Only adjacent elements exchange positions.

Each comparison is easy to animate.

Correctness follows from a compact loop invariant.

Those educational strengths do not make it a good default general-purpose sort.

Quadratic comparisons make it substantially slower than $O(n\log n)$ algorithms on large inputs.

Repeated swaps also generate many writes.

Bubble sort still has legitimate analytical value.

It demonstrates how eliminating local inversions produces global order.

It provides a naturally stable comparison sort.

It shows how a no-swap pass certifies that an input is already sorted.

It illustrates adaptivity when the input is nearly sorted.

It also serves as a small trusted implementation for tests and visualizations.

The core operation is an adjacent compare-exchange.

For ascending order, swap positions $j$ and $j+1$ exactly when the right value is strictly smaller under the chosen key.

Using a strict comparison matters for stability.

Equal-key records remain in their original relative order because they never cross.

A basic implementation performs $n-1$ passes even if the array becomes sorted early.

An adaptive implementation records whether a pass made any swap.

If no swap occurs, no adjacent inversion remains.

An array with no adjacent inversion is globally nondecreasing.

The algorithm can also shrink the next pass boundary.

Everything at and to the right of the last swap is already in final relative order for the current process.

Remembering that location avoids redundant comparisons on sorted suffixes.

Bubble sort's simplicity can conceal implementation mistakes.

An off-by-one boundary may read past the array.

Swapping equal keys destroys the straightforward stability guarantee.

Returning after any locally swap-free region is unsound; the entire active pass must be swap-free.

Calling the algorithm $O(n)$ without mentioning the adaptive best case is also misleading.

The central question is:

Why do repeated adjacent exchanges place a final maximum on each pass, and when can the algorithm safely terminate early?

## 2. Core Mathematical Invariants

Let the input be an array $A$ of length $n$.

Let `key(x)` map each element to a comparable key.

The target order is:

$$
key(A[i])\le key(A[i+1])
$$

for every valid adjacent index $i$.

### Inversion definition

An inversion is a pair of indices $(i,j)$ such that:

$$
i<j\quad\text{and}\quad key(A[i])>key(A[j]).
$$

A nondecreasing array has zero inversions.

Conversely, an array with zero inversions is nondecreasing.

An adjacent inverted pair is an inversion with $j=i+1$.

### Effect of one adjacent swap

Suppose adjacent values $x=A[j]$ and $y=A[j+1]$ satisfy $key(x)>key(y)$.

Swapping them removes their mutual inversion.

Their order relative to every element outside the two positions does not change in aggregate.

Therefore a strict adjacent inversion swap reduces the total inversion count by exactly one.

The inversion count is a nonnegative integer.

This gives a termination measure independent of the pass counter.

### Inner-loop maximum invariant

During a left-to-right pass over indices $0$ through $b-1$, after comparing pair $(j,j+1)$:

$$
A[j+1]
$$

contains a maximum-key element of the prefix that ended at $j+1$ before that comparison sequence.

Proof proceeds by induction.

Before the first comparison, the larger of positions 0 and 1 is placed at position 1.

Assume position $j$ holds a maximum of the scanned prefix.

Comparing it with position $j+1$ moves the larger key to $j+1$.

Thus the claim extends by one position.

At pass end, a maximum of the active prefix occupies index $b-1$.

### Sorted-suffix invariant

At the beginning of a pass with exclusive boundary $b$:

1. indices $b$ through $n-1$ are in final nondecreasing order,
2. every key in that suffix is at least every key in the active prefix.

The inner-loop maximum invariant places a maximum active element at $b-1$.

That extends the final suffix one position left.

The next basic pass may therefore use boundary $b-1$.

### No-swap certificate

If a complete active pass performs no swap, every examined adjacent pair is ordered.

The suffix was already ordered by the outer invariant.

The boundary pair is also ordered because the suffix contains keys no smaller than the prefix.

Therefore the entire array is sorted.

Early termination after a no-swap pass is sound.

### Last-swap boundary

Let $r$ be the index immediately to the right of the final swap in a pass.

No later comparison swaps.

Hence every adjacent pair from $r$ through the old boundary is already ordered after the pass.

The next active boundary can be set to $r$.

If no swap occurs, $r=0$ and the algorithm terminates.

This optimization can skip more than one known-sorted position.

### Permutation invariant

The only mutation is exchanging two existing elements.

No element is created or discarded.

The array remains a permutation of its input after every operation.

Sortedness plus the permutation invariant proves the output is a sorted rearrangement rather than a fabricated sequence.

### Stability invariant

Tag equal-key records by original order.

The algorithm swaps only when the left key is strictly greater.

Equal-key records are never directly swapped.

Because elements move only through adjacent swaps, two equal-key records cannot reverse without crossing each other.

They never cross, so their original relative order is preserved.

### In-place invariant

The array is rearranged through constant-size temporary state.

Ignoring the key function and caller-owned input, auxiliary algorithmic storage is $O(1)$.

A trace collector or copied output changes that space contract and should be documented separately.

## 3. Step-by-Step Execution Trace

Sort the array:

$$
[5,1,4,2,8]
$$

in ascending order.

Initialize the active boundary to 5.

### Pass 1

Compare 5 and 1.

They are inverted, so swap:

$$
[1,5,4,2,8].
$$

Compare 5 and 4.

Swap:

$$
[1,4,5,2,8].
$$

Compare 5 and 2.

Swap:

$$
[1,4,2,5,8].
$$

Compare 5 and 8.

Do not swap:

$$
[1,4,2,5,8].
$$

The last swap ended at index 3.

Positions 3 and 4 form an ordered suffix $[5,8]$.

The next exclusive boundary is 3.

### Pass 2

Compare 1 and 4.

Do not swap.

Compare 4 and 2.

Swap:

$$
[1,2,4,5,8].
$$

The last swap ended at index 2.

The suffix $[4,5,8]$ is final.

The next boundary is 2.

### Pass 3

Compare 1 and 2.

Do not swap.

No swap occurs in the complete active pass.

The no-swap certificate proves the entire array is sorted.

The final result is:

$$
[1,2,4,5,8].
$$

### Inversion accounting

The original inversions are $(5,1)$, $(5,4)$, $(5,2)$, and $(4,2)$.

There are four inversions.

The trace performs exactly four swaps.

Each swap removes one inversion, so the final count is zero.

This equality between swaps and initial inversions holds for strict adjacent-exchange sorting.

### Stability trace

Consider records with keys:

$$
[(2,a),(1,x),(2,b),(1,y)].
$$

The letters record original identity.

After sorting by the numeric key, a stable result is:

$$
[(1,x),(1,y),(2,a),(2,b)].
$$

Record $(2,a)$ never crosses $(2,b)$ because their keys compare equal.

Record $(1,x)$ never crosses $(1,y)$ for the same reason.

Using `>=` as the swap condition would exchange equal neighbors and invalidate this proof.

### Already sorted trace

For $[1,2,3,4]$, every comparison in the first pass is ordered.

The last-swap boundary remains zero.

The algorithm returns after $n-1$ comparisons and zero swaps.

That is the adaptive $\Theta(n)$ best case.

## 4. Production-Ready Implementations

The Python implementation mutates a mutable sequence and supports a key function.

It uses the last-swap position to reduce later passes.

```python
from collections.abc import Callable, MutableSequence
from typing import TypeVar


Item = TypeVar("Item")
Key = TypeVar("Key")


def bubble_sort_in_place(
    values: MutableSequence[Item],
    *,
    key: Callable[[Item], object] = lambda item: item,
) -> None:
    """Stable in-place ascending sort using adjacent exchanges."""
    boundary = len(values)

    while boundary > 1:
        last_swap = 0
        for index in range(1, boundary):
            if key(values[index]) < key(values[index - 1]):
                values[index - 1], values[index] = (
                    values[index],
                    values[index - 1],
                )
                last_swap = index
        boundary = last_swap
```

The key is evaluated repeatedly.

That preserves $O(1)$ auxiliary space but can be costly for expensive key functions.

Decorating elements with cached keys reduces repeated computation at the cost of $O(n)$ extra space.

Python's built-in stable sort is a better production default for ordinary sorting.

This function is appropriate when the adjacent-exchange behavior itself is required or studied.

### Correctness and stability checks

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Record:
    priority: int
    label: str


numbers = [5, 1, 4, 2, 8]
bubble_sort_in_place(numbers)
assert numbers == [1, 2, 4, 5, 8]

records = [
    Record(2, "a"),
    Record(1, "x"),
    Record(2, "b"),
    Record(1, "y"),
]
bubble_sort_in_place(records, key=lambda record: record.priority)
assert records == [
    Record(1, "x"),
    Record(1, "y"),
    Record(2, "a"),
    Record(2, "b"),
]

empty: list[int] = []
bubble_sort_in_place(empty)
assert empty == []

singleton = [7]
bubble_sort_in_place(singleton)
assert singleton == [7]
```

### Instrumented implementation

Counting comparisons and swaps makes adaptive behavior measurable.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class SortMetrics:
    comparisons: int
    swaps: int


def measured_bubble_sort(values: list[int]) -> SortMetrics:
    boundary = len(values)
    comparisons = 0
    swaps = 0

    while boundary > 1:
        last_swap = 0
        for index in range(1, boundary):
            comparisons += 1
            if values[index] < values[index - 1]:
                values[index - 1], values[index] = (
                    values[index], values[index - 1]
                )
                swaps += 1
                last_swap = index
        boundary = last_swap

    return SortMetrics(comparisons, swaps)


ordered = list(range(100))
ordered_metrics = measured_bubble_sort(ordered)
assert ordered_metrics == SortMetrics(comparisons=99, swaps=0)

reversed_values = list(range(10, 0, -1))
reversed_metrics = measured_bubble_sort(reversed_values)
assert reversed_values == list(range(1, 11))
assert reversed_metrics.swaps == 10 * 9 // 2
assert reversed_metrics.comparisons == 10 * 9 // 2
```

### Randomized differential validation

```python
from random import Random


rng = Random(29)
for length in range(80):
    for _ in range(80):
        source = [rng.randrange(-20, 21) for _ in range(length)]
        actual = source.copy()
        bubble_sort_in_place(actual)
        assert actual == sorted(source)
        assert sorted(actual) == sorted(source)
```

The final assertion is redundant with equality to `sorted(source)` but highlights the permutation property being tested.

For custom records, test stability by comparing against a trusted stable reference sort.

### Operational considerations

Do not expose quadratic sorting of unrestricted user-sized arrays on a request hot path.

Check sequence mutability before relying on in-place behavior.

Do not call an impure key function repeatedly; cache keys or require purity.

Concurrent mutation of the sequence invalidates loop assumptions.

If comparisons can raise, the array may be left partially reordered.

Document whether that basic exception guarantee is acceptable.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of elements.

In the reverse-sorted case, the basic pass boundaries have lengths:

$$
n-1,n-2,\ldots,1.
$$

The comparison count is:

$$
\sum_{k=1}^{n-1}k=\frac{n(n-1)}2=\Theta(n^2).
$$

Every pair is inverted in reverse order.

The inversion count is also $n(n-1)/2$.

Because each swap removes exactly one inversion, the algorithm performs $\Theta(n^2)$ swaps.

Worst-case time is $\Theta(n^2)$.

Average comparison and inversion counts are also quadratic under common random-permutation models.

Thus average time is $\Theta(n^2)$.

For an already sorted array, the adaptive implementation makes one pass.

It performs $n-1$ comparisons and zero swaps.

Best-case time is $\Theta(n)$.

The last-swap optimization can improve partially sorted inputs by skipping an ordered suffix.

It does not change the quadratic worst case.

If key extraction costs $K$, repeated key evaluation adds that cost to comparisons.

The displayed implementation may spend $O(Kn^2)$ time in the worst case.

Caching $n$ keys costs $O(nK)$ preprocessing plus $O(n)$ auxiliary storage.

The in-place algorithm uses a boundary, indices, last-swap marker, and temporary exchange references.

Auxiliary algorithmic space is $O(1)$.

The input array itself is not counted as auxiliary space.

A version that returns a copied sorted list uses $O(n)$ additional space.

The number of writes is twice the number of swaps at the array-slot level.

On reverse input, this is $n(n-1)$ slot writes.

That write volume makes bubble sort unattractive for storage with expensive writes.

Compared with insertion sort, both can be adaptive and stable.

Insertion sort usually moves blocks more efficiently and is generally preferred for small or nearly sorted arrays.

Compared with selection sort, bubble sort makes many more swaps, while selection sort is normally unstable without modification.

Compared with merge sort, bubble sort uses less auxiliary memory but has a worse asymptotic comparison count.

## 6. Systems Connections

### Sorting-network intuition

Bubble sort is a sequential schedule of adjacent compare-exchange operations.

Odd-even transposition sort reorganizes adjacent comparisons into alternating independent phases.

Those phases can execute in parallel and connect the idea to sorting networks.

### Inversion metrics

Because swap count equals initial inversion count, bubble sort can measure disorder while sorting.

Counting inversions faster with merge-sort techniques takes $O(n\log n)$ time.

The adjacent-swap interpretation remains useful for understanding minimum adjacent exchanges.

### UI animation and education

Each mutation affects one neighboring pair, making the algorithm easy to animate.

The animation should distinguish comparisons from swaps and show the finalized suffix.

Visual simplicity is not evidence of production efficiency.

### Local repair in streams

When a single item is slightly displaced in an otherwise ordered list, adjacent exchanges can move it toward its position.

Using a full bubble sort is usually unnecessary.

A targeted insertion-like repair performs only the relevant local moves.

### Stable ordering

Stable sorting matters when records have already been ordered by a secondary field.

Strict adjacent comparisons preserve that prior order among equal primary keys.

The key function must itself define equality consistently.

### Hardware writes

On flash-backed or persistent memory, write amplification can matter.

Bubble sort's potentially quadratic swaps are a poor match for write-sensitive storage.

Selection-style approaches use fewer swaps but sacrifice other properties.

### Adversarial service inputs

An endpoint that accepts arbitrary arrays and explicitly chooses bubble sort exposes quadratic CPU consumption.

Use size limits or a standard $O(n\log n)$ sorting implementation.

Algorithm selection is part of resource security.

### Linked structures

Adjacent node exchanges in a linked list require pointer manipulation rather than constant-time array assignment semantics.

Swapping payloads may be simpler but can violate object-identity expectations.

Merge sort is generally a more natural efficient sort for linked lists.

## 7. Practice Checklist

- Define an inversion precisely.
- Prove that one inverted adjacent swap removes exactly one inversion.
- State the inner-loop maximum invariant.
- State the sorted-suffix invariant.
- Prove that a complete no-swap pass certifies sortedness.
- Explain why the next boundary may shrink by one.
- Explain the stronger last-swap boundary optimization.
- Use strict comparison to preserve stability.
- Construct an input showing how `>=` can reverse equal records.
- Prove the permutation invariant.
- Test an empty array.
- Test a singleton.
- Test an already sorted array.
- Test a reverse-sorted array.
- Test all equal keys.
- Test duplicate keys with identity tags.
- Test negative values.
- Compare output with a trusted stable sort.
- Count swaps and compare with inversion count.
- Derive $n(n-1)/2$ worst-case comparisons.
- Distinguish best, average, and worst cases.
- Include key-extraction cost in analysis.
- Decide whether to cache expensive keys.
- Document mutation and return behavior.
- Document the exception guarantee.
- Prevent concurrent mutation during sorting.
- Measure writes as well as comparisons.
- Do not select bubble sort merely because the input is “small” without a bound.
- Prefer insertion sort for many nearly sorted small-array cases.
- Prefer a standard library sort for general production use.
- Separate visualization value from runtime value.
- Verify the active boundary is exclusive.
- Avoid reading index `boundary` in the inner loop.
- Ensure a no-swap pass sets the boundary to zero.
- Preserve caller-visible record identity during swaps.

## 8. Frequently Asked Questions

### Why is it called bubble sort?

During a left-to-right ascending pass, larger elements move right through successive adjacent swaps, resembling bubbles rising.

The metaphor is informal; the loop invariant gives the real explanation.

### Is bubble sort stable?

Yes, when it swaps only strict inversions.

Swapping equal-key neighbors can destroy stability.

### Is bubble sort in place?

The ordinary array implementation uses $O(1)$ auxiliary algorithmic space.

Copying input or recording every trace state changes that space usage.

### What is its best-case complexity?

With early termination, an already sorted array takes $\Theta(n)$ time.

Without a swap flag or last-swap boundary, a naive implementation remains quadratic.

### What is its worst-case complexity?

Reverse order causes $n(n-1)/2$ comparisons and swaps, giving $\Theta(n^2)$ time.

### Why does each pass finalize one element?

The larger of each compared pair moves right.

Inductively, a maximum of the active prefix reaches its rightmost position by pass end.

### Does a swap-free inner fragment prove sortedness?

No.

The complete active pass must be swap-free so every relevant adjacent pair has been certified.

### Why remember the last swap?

Every later comparison in that pass was already ordered.

The next pass does not need to scan that known-ordered suffix.

### Is swap count always the inversion count?

For this algorithm using strict adjacent inversion swaps, yes.

Each swap reduces inversion count by exactly one and sorting ends at zero.

### Is bubble sort ever faster than $O(n\log n)$ sorting?

On tiny or already sorted inputs, constants and early exit can make any simple loop competitive in a narrow measurement.

That does not justify it as a general-purpose choice.

### Why is insertion sort usually preferred for nearly sorted data?

It also adapts to low disorder but typically performs fewer comparisons and assignments than repeated full bubble passes.

### Can bubble sort run in parallel?

The usual sequential pass has dependencies between neighboring exchanges.

Odd-even transposition sort groups nonoverlapping pairs into parallel phases.

### Can it sort linked lists efficiently?

It can be implemented, but repeated traversal and swaps are awkward.

Merge sort is generally better suited to linked structures.

### What if the key function is expensive?

The implementation shown recomputes keys during comparisons.

Cache decorated keys if repeated computation dominates and $O(n)$ extra space is acceptable.

### Should production code call this implementation?

Only when its exact adjacent stable-exchange behavior, bounded input size, or teaching trace is a requirement.

For ordinary sorting, use the language's tested standard sort.
