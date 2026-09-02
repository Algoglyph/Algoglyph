# Insertion Sort: Growing a Sorted Prefix One Key at a Time

![Insertion sort shifting values into a sorted prefix](/images/dsa/insertion-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Insertion sort maintains order incrementally.

It takes the next unsorted value and inserts it into the correct position among values already processed.

The technique resembles arranging playing cards in one hand.

Each new card is compared with cards to its left.

Larger cards shift right until the insertion gap appears.

The algorithm is simple enough to implement inside low-level sorting kernels.

Its worst-case quadratic time makes it unsuitable as a standalone general sorter for large random inputs.

That does not make it obsolete.

Insertion sort is adaptive.

Nearly sorted input requires few shifts.

It has low fixed overhead.

It operates in place.

It is stable when equal keys are not shifted past one another.

It works well on small partitions where recursion, allocation, or elaborate partitioning costs dominate.

Hybrid sorting algorithms often switch to insertion sort below a size threshold.

Timsort uses insertion-like techniques to extend short natural runs.

Introspective and quicksort-family implementations commonly leave tiny partitions for a final insertion pass.

Insertion sort also supports online ordering.

If values arrive one at a time and the collection must remain sorted, each arrival can be inserted immediately.

For array storage, finding a position and making room are separate costs.

Binary search can reduce comparisons used to find the position.

It cannot eliminate the linear number of element shifts required in the worst case.

The central mechanism is not repeated swapping by necessity.

A more efficient implementation saves the key, shifts a block of larger values right, and writes the key once.

This reduces assignments while preserving the same comparison logic.

Insertion sort's behavior is closely tied to **inversions**.

An inversion is a pair of positions that appears in the opposite order from the sorted result.

Each adjacent movement of a key across a larger predecessor removes one inversion.

The running time therefore reflects how far the input is from sorted order.

The central question is:

How does preserving a sorted prefix convert local shifts into a stable, adaptive sort with work proportional to the input's inversions?

## 2. Core Mathematical Invariants

Let $A$ contain $n$ comparable items.

At outer-loop index $i$, the key is the original value at position $i$ before shifting begins.

### Sorted-prefix invariant

Before iteration $i$, prefix $A[0:i)$ is sorted in nondecreasing order.

The prefix contains exactly the values originally found in positions $0$ through $i-1$.

After inserting the key, prefix $A[0:i+1)$ is sorted and contains exactly the first $i+1$ original values.

This is the main loop invariant.

The base case is $i=1$.

A one-element prefix is already sorted.

The maintenance step inserts one key without losing or duplicating any value.

At termination, $i=n$ and the sorted prefix is the entire array.

### Shifting invariant

During insertion, let `j` identify the next predecessor to inspect.

Values in positions `j+1` through `i` are the processed prefix values known to be greater than the key.

They have each moved one position right.

Positions before or at `j` retain their original relative order.

When `A[j] <= key`, no earlier value can exceed the key because the old prefix was sorted.

The correct gap is `j+1`.

### Permutation invariant

The key is held in a temporary variable while other values shift.

Every shifted value is copied exactly one position to the right.

Writing the key into the final gap restores the prefix length.

No value is created or discarded.

The final array is a permutation of the input.

### Stability invariant

Shift a predecessor only when its key is **strictly greater** than the insertion key.

Do not shift equal keys.

Then an arriving equal key is placed after equal keys already in the prefix.

Their original relative order is preserved.

Changing the comparison from `>` to `>=` makes the implementation unstable.

Stability is an implementation property, not automatic from the algorithm's name.

### Inversion relationship

An inversion is a pair $(p,q)$ such that:

$$
p<q \quad\text{and}\quad A[p]>A[q].
$$

When key $A[q]$ moves left past a larger predecessor, that shift removes exactly one inversion involving the key.

Insertion sort performs exactly one such shift for each input inversion.

If the inversion count is $I$, shift work is $\Theta(I)$.

The outer loop still contributes $\Theta(n)$ overhead.

The total work is therefore $\Theta(n+I)$ under a unit-cost comparison and movement model.

### Bounds on inversions

A sorted array has $I=0$.

A reverse-sorted array with distinct values has:

$$
I=\binom{n}{2}=\frac{n(n-1)}{2}.
$$

This explains the linear best case and quadratic worst case.

### Binary-search insertion boundary

Binary search can find an insertion index in $O(\log i)$ comparisons.

To preserve stability, insert after existing equal keys, which is an upper-bound position.

Array elements after that position still need to shift.

The movement bound remains $O(i)$ for one insertion and $O(n^2)$ overall.

### Termination

The outer index increases from `1` to `n-1`.

The inner index decreases on every shift.

Both loops have finite monotone measures.

## 3. Step-by-Step Execution Trace

Sort the array:

```text
[5, 2, 4, 6, 1, 3]
```

The expected result is `[1, 2, 3, 4, 5, 6]`.

### Initial prefix

Prefix `[5]` is trivially sorted.

Set `i = 1`.

The key is `2`.

### Insert `2`

Compare predecessor `5` with key `2`.

`5 > 2`, so shift `5` from index `0` to index `1`.

The open gap is index `0`.

Write `2` there.

Array becomes:

```text
[2, 5, 4, 6, 1, 3]
```

Sorted prefix is `[2, 5]`.

One inversion, `(5,2)`, was removed.

### Insert `4`

Set `i = 2` and save key `4`.

Compare `5 > 4`.

Shift `5` right.

Compare predecessor `2 <= 4`.

Stop and write `4` after `2`.

Array becomes:

```text
[2, 4, 5, 6, 1, 3]
```

Sorted prefix is `[2, 4, 5]`.

### Insert `6`

Set `i = 3` and save key `6`.

The immediate predecessor is `5`.

`5 <= 6`, so no shift occurs.

Write-back may be skipped because the key remains at index `3`.

Array stays `[2, 4, 5, 6, 1, 3]`.

This iteration demonstrates adaptivity.

An already-correct key costs one failed comparison and constant bookkeeping.

### Insert `1`

Set `i = 4` and save key `1`.

Compare `6 > 1`; shift `6` right.

Compare `5 > 1`; shift `5` right.

Compare `4 > 1`; shift `4` right.

Compare `2 > 1`; shift `2` right.

No predecessor remains.

Write `1` at index `0`.

Array becomes:

```text
[1, 2, 4, 5, 6, 3]
```

The key removed four inversions.

### Insert `3`

Set `i = 5` and save key `3`.

Shift `6` right.

Shift `5` right.

Shift `4` right.

Stop at predecessor `2` because `2 <= 3`.

Write `3` into index `2`.

Final array:

```text
[1, 2, 3, 4, 5, 6]
```

The full array is the sorted prefix.

### Count the shifts

The iterations used `1 + 1 + 0 + 4 + 3 = 9` shifts.

The original array has nine inversions.

This equality is not accidental.

Every shift crosses the key over one inverted predecessor.

### Stability trace

Represent records as `(key, label)`:

```text
[(2, "A"), (1, "X"), (2, "B")]
```

When `(2, "B")` is inserted, predecessor `(2, "A")` has an equal key.

The strict-greater comparison does not shift `A`.

Sorted result is:

```text
[(1, "X"), (2, "A"), (2, "B")]
```

Equal-key arrival order is preserved.

## 4. Production-Ready Implementations

The generic implementation caches the current key once per outer iteration.

It shifts records rather than repeatedly swapping adjacent pairs.

```python
from typing import Callable, TypeVar

T = TypeVar("T")
K = TypeVar("K")


def insertion_sort(values: list[T], key: Callable[[T], K] = lambda value: value) -> None:
    for index in range(1, len(values)):
        item = values[index]
        item_key = key(item)
        position = index - 1

        while position >= 0 and key(values[position]) > item_key:
            values[position + 1] = values[position]
            position -= 1

        values[position + 1] = item
```

The strict `>` comparison preserves stability.

The function mutates the list and returns `None`, matching common in-place API conventions.

For an expensive key function, pre-decorating every item or maintaining a parallel key array avoids repeated predecessor key evaluation.

That optimization uses $O(n)$ extra memory.

### Execute representative cases

```python
sample = [5, 2, 4, 6, 1, 3]
insertion_sort(sample)
assert sample == [1, 2, 3, 4, 5, 6]

cases = [
    [],
    [8],
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    [3, 1, 3, 2, 3],
    [-2, 7, 0, -2],
]

for case in cases:
    expected = sorted(case)
    insertion_sort(case)
    assert case == expected

records = [(2, "A"), (1, "X"), (2, "B")]
insertion_sort(records, key=lambda record: record[0])
assert records == [(1, "X"), (2, "A"), (2, "B")]
```

### Binary insertion variant

This version reduces insertion-position comparisons while retaining shifts.

It uses upper-bound search so equal keys remain before the arriving equal item.

```python
def binary_insertion_sort(values: list[int]) -> None:
    for index in range(1, len(values)):
        item = values[index]
        low = 0
        high = index

        while low < high:
            middle = low + (high - low) // 2
            if values[middle] <= item:
                low = middle + 1
            else:
                high = middle

        position = index
        while position > low:
            values[position] = values[position - 1]
            position -= 1
        values[low] = item


binary_sample = [5, 2, 4, 6, 1, 3]
binary_insertion_sort(binary_sample)
assert binary_sample == [1, 2, 3, 4, 5, 6]
```

Binary insertion helps when comparisons are expensive relative to movement.

It does not change the quadratic movement bound on arrays.

### Sorting a range

Hybrid algorithms often insertion-sort only a half-open subrange `[lo, hi)`.

The inner loop must stop at `lo`, not at zero.

That boundary prevents one partition from disturbing previously arranged regions.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the input length and $I$ its inversion count.

The outer loop runs $n-1$ times.

Shift work is exactly $I$ for distinct comparisons under the standard stable rule.

Total running time is:

$$
\Theta(n+I).
$$

For sorted input, $I=0$.

Each iteration performs one failed predecessor comparison or reaches its fixed position immediately.

Best-case time is $\Theta(n)$.

For reverse-sorted distinct input:

$$
I=\frac{n(n-1)}{2}.
$$

Worst-case time is $\Theta(n^2)$.

Random permutations have expected inversion count $n(n-1)/4$.

Average-case time is therefore $\Theta(n^2)$ under that distribution.

The direct implementation uses one saved item, key, and indices.

Auxiliary space is $O(1)$ beyond the input array.

The algorithm is in place.

Binary insertion reduces position-search comparisons to $O(n\log n)$ total.

Shifts remain $O(n^2)$ in the worst case.

Thus binary insertion sort still has $O(n^2)$ worst-case time on an array.

| Input property | Inversions | Time |
|---|---:|---:|
| Already sorted | `0` | $\Theta(n)$ |
| Nearly sorted | Small $I$ | $\Theta(n+I)$ |
| Random permutation | Expected $n(n-1)/4$ | $\Theta(n^2)$ |
| Reverse sorted | $n(n-1)/2$ | $\Theta(n^2)$ |

For a linked list with a known insertion position, insertion does not shift array cells.

Finding that position still requires traversal unless another index exists.

Representation changes where the work occurs.

## 6. Systems Connections

### Hybrid sorting

Divide-and-conquer sorts create small subproblems.

At tiny sizes, insertion sort's short loops and minimal setup can beat further recursion or partitioning.

The best threshold depends on language, comparator, data size, and hardware.

It should be measured rather than copied blindly.

### Timsort and natural runs

Real data often contains ordered subsequences.

Timsort detects these runs and may extend short ones using insertion techniques.

Adaptivity turns existing order into less work.

The full algorithm adds carefully managed merging and run-stack invariants.

### Online maintenance

Insertion sort naturally incorporates one newly arrived item into an already sorted sequence.

For small collections, this can be simpler than rebuilding.

For large mutable ordered sets, balanced trees or skip lists avoid linear shifts.

For append-heavy batches, collect unsorted arrivals and merge sorted runs instead.

### Database page organization

Keeping records sorted inside one bounded page can involve shifting a small number of slots.

The page size caps worst-case local movement.

Higher-level tree structure locates the page.

This combines logarithmic navigation with small-array insertion behavior.

### Cache locality

Insertion sort accesses a compact neighboring region.

Shifts are sequential memory writes.

That locality helps on small arrays despite quadratic asymptotics.

Large reverse-sorted arrays still move too much data for locality to rescue the algorithm.

### Linked-list misconception

A linked list can splice a node in constant time once the predecessor is known.

Searching for the predecessor is typically linear.

Poor locality can also make pointer traversal slower than array shifts.

Constant-time insertion does not imply constant-time sorted insertion.

### Expensive records

Moving full records can dominate comparison cost.

Sort handles or indices when payloads are large and stable indirection is acceptable.

Alternatively use move semantics in languages that distinguish moving from copying.

Exception behavior during moves must preserve a valid array state.

## 7. Practice Checklist

- Define ascending or descending output.
- Treat the first element as the initial sorted prefix.
- Save the insertion item before shifting.
- Cache its key once.
- Shift larger predecessors one position right.
- Stop at the first predecessor no greater than the key.
- Insert into `position + 1`.
- Use strict comparison to preserve stability.
- Verify the prefix after every outer iteration in tests.
- Verify output is a permutation of input.
- Test empty input.
- Test one element.
- Test sorted input.
- Test reverse-sorted input.
- Test all-equal input.
- Test repeated keys with identity labels.
- Test negative values.
- Test nearly sorted input.
- Compare randomized cases with a trusted sort.
- Count shifts and compare them with inversion counts on small arrays.
- Document in-place mutation.
- Document stability.
- Do not claim $O(n\log n)$ from binary position search alone.
- Use upper-bound insertion for stable binary insertion.
- Keep subrange boundaries explicit inside hybrid sorts.
- Avoid repeated adjacent swaps when block shifting suffices.
- Consider key decoration when comparisons are expensive.
- Account for decoration space.
- Use a different structure for large continuously updated ordered collections.
- Benchmark small-partition thresholds on the target runtime.

## 8. Frequently Asked Questions

### Why is insertion sort adaptive?

Its shift count equals the number of inversions.

Nearly sorted data has few inversions, so little movement is required.

### Is insertion sort stable?

It is stable when predecessors shift only if they are strictly greater than the key.

Using greater-than-or-equal can reverse equal-key records.

### Is it in place?

The direct array implementation uses $O(1)$ auxiliary storage.

Precomputing all keys or sorting a decorated array changes that bound.

### Why is the worst case quadratic?

Reverse-sorted input has $n(n-1)/2$ inversions.

Every inversion requires one crossing shift.

### Does binary search make insertion sort $O(n\log n)$?

No for arrays.

It reduces comparisons used to find each gap, but opening the gap still shifts up to $O(n)$ elements.

### Why use shifts instead of adjacent swaps?

Saving the key and shifting predecessors reduces assignments.

Adjacent swaps repeatedly write the key as it travels left.

### When does insertion sort beat faster asymptotic sorts?

It can win on small or nearly sorted inputs because it has low overhead, sequential access, and adaptive work.

The crossover point is implementation-dependent.

### Can insertion sort process a stream?

Yes, by inserting every arrival into the current ordered collection.

Array insertion becomes costly as the collection grows, so other ordered structures may fit long-lived streams better.

### What is the relationship to inversions?

Every shift moves the current key across one larger predecessor and removes one inversion.

The exact shift count is the input inversion count.

### Why is a linked list not automatically faster?

Splicing is constant-time only after locating the predecessor.

Finding the sorted position remains linear, and pointer traversal has weaker locality.

### Should production code implement insertion sort directly?

Use the standard library sort unless implementing a specialized hybrid, bounded-page operation, or educational component.

Library sorts usually combine algorithms and handle edge cases more thoroughly.
