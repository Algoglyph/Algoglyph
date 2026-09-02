# Selection Sort: Minimum Selection, Prefix Invariants & Write-Efficient Ordering

![Selection sort minimum extraction](/images/dsa/selection-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Selection sort repeatedly chooses the smallest remaining element.

It places that element into the next final position.

After `i` passes, the first `i` positions never change again.

The method is one of the simplest in-place comparison sorts.

Its time is quadratic regardless of initial order.

That makes it unsuitable for large general-purpose arrays.

Its number of swaps is small and predictable.

At most one swap occurs per outer pass.

This property can matter when writes are much more expensive than reads.

Flash storage, EEPROM, and remote records can have asymmetric write costs.

Selection sort still performs all comparisons, but reduces record movement.

The algorithm separates selection from placement.

Scan the unsorted suffix to identify its minimum.

Swap that minimum with the suffix's first position.

Then advance the sorted boundary.

Unlike bubble sort, adjacent swaps are not required.

Unlike insertion sort, an already sorted array does not reduce comparisons.

The basic algorithm is not stable.

Swapping a distant minimum forward can move an equal key behind another equal key.

A stable variant removes the minimum and shifts the intervening block.

That variant increases writes from linear to potentially quadratic.

Selection sort is not adaptive.

It does not detect or exploit existing runs in its ordinary form.

It needs constant auxiliary space.

Its access pattern is straightforward and deterministic.

The comparison count is independent of data values.

That regularity helps teaching and some specialized cost models.

It does not make the implementation constant-time against side channels because swaps and comparator behavior remain data-dependent.

For tiny arrays, quadratic algorithms can be competitive because setup is minimal.

Insertion sort usually performs better when data is nearly sorted.

Selection sort is preferable when minimizing writes is the primary objective.

The main proof rests on a sorted-prefix invariant and a minimum-suffix scan.

## 2. Core Mathematical Invariants

### Outer-loop partition

At the start of pass `i`, divide the array into:

$$
A[0..i)\quad\text{and}\quad A[i..n).
$$

The prefix is in final sorted order.

The suffix contains all not-yet-placed elements.

Every prefix element is no greater than every suffix element.

### Sorted-prefix invariant

Before pass `i`:

1. `A[0..i)` is sorted;
2. it contains the `i` smallest input elements with multiplicity;
3. those positions are final.

Initially `i = 0`, so the empty prefix satisfies all conditions.

The pass selects a minimum from the suffix.

Placing it at index `i` extends the prefix by one correct element.

### Minimum-scan invariant

Let `min_index` track the best candidate during suffix scan.

Before examining index `j`, `A[min_index]` is a minimum of `A[i..j)`.

If `A[j] < A[min_index]`, set `min_index = j`.

Otherwise leave it unchanged.

After `j` reaches `n`, it identifies a suffix minimum.

Using strict `<` retains the first minimum encountered.

That choice alone does not make the swap-based algorithm stable.

### Permutation invariant

The algorithm changes positions only by swapping.

Every swap preserves the multiset of elements.

Therefore final sorted order is a permutation of the input.

### Progress and termination

Every outer pass increases `i` by one.

The unsorted suffix length decreases from `n-i` to `n-i-1`.

After `n-1` passes, one element remains.

That element must be the maximum and is already placed.

### Comparison count

Pass `i` compares the candidate with `n-i-1` later elements.

Total comparisons are:

$$
\sum_{i=0}^{n-2}(n-i-1)=\frac{n(n-1)}{2}.
$$

This count does not depend on input ordering.

### Swap bound

The algorithm swaps only when `min_index != i`.

There are at most `n-1` swaps.

Some passes need no swap when the correct minimum is already at the boundary.

### Stability condition

A stable sort preserves relative order among records with equivalent keys.

A distant swap can violate that property.

Stable selection instead extracts the minimum and shifts `[i,min_index)` right by one.

That preserves relative order but performs more writes.

### Comparator invariant

The comparator must define a consistent strict weak ordering.

If comparisons are nontransitive, “minimum” may be ill-defined.

Mutable keys can also invalidate conclusions within one scan.

## 3. Step-by-Step Execution Trace

Sort `[29,10,14,37,13]` in ascending order.

Start pass `i = 0`.

Set `min_index = 0` for value `29`.

Compare value `10` at index `1` with `29`.

Update `min_index = 1`.

Compare `14` with current minimum `10`.

Keep index `1`.

Compare `37` with `10`.

Keep index `1`.

Compare `13` with `10`.

Keep index `1`.

Swap positions `0` and `1`.

Array becomes `[10,29,14,37,13]`.

Prefix `[10]` is final.

Start pass `i = 1`.

Set candidate to value `29` at index `1`.

Compare `14`, update candidate to index `2`.

Compare `37`, retain `14`.

Compare `13`, update candidate to index `4`.

Swap positions `1` and `4`.

Array becomes `[10,13,14,37,29]`.

Prefix `[10,13]` is final.

Start pass `i = 2`.

Candidate is `14`.

Compare `37` and retain `14`.

Compare `29` and retain `14`.

No swap is needed because candidate is already at index `2`.

Prefix becomes `[10,13,14]`.

Start pass `i = 3`.

Candidate is `37`.

Compare `29` and update candidate to index `4`.

Swap them.

Array becomes `[10,13,14,29,37]`.

Only one suffix element remains.

The final array is sorted.

The comparison count was `4 + 3 + 2 + 1 = 10`.

Three swaps occurred.

### Instability trace

Label equal keys by origin: `[2a,2b,1]`.

The first pass selects `1` at index `2`.

Swap it with `2a` at index `0`.

Array becomes `[1,2b,2a]`.

The equal records changed relative order.

Therefore basic selection sort is not stable.

### Stable extraction trace

For the same input, remove `1` from index `2`.

Shift `2b` from index `1` to `2`.

Shift `2a` from index `0` to `1`.

Place `1` at index `0`.

Result `[1,2a,2b]` preserves equal-key order.

It required several writes instead of one swap.

## 4. Production-Ready Implementations

The implementation below sorts mutable records using an optional key function.

```python
from __future__ import annotations

from collections.abc import Callable, MutableSequence
from typing import TypeVar

T = TypeVar("T")
K = TypeVar("K")


def selection_sort(
    values: MutableSequence[T],
    key: Callable[[T], K] = lambda value: value,  # type: ignore[assignment,return-value]
) -> None:
    n = len(values)
    for i in range(n - 1):
        min_index = i
        min_key = key(values[i])
        for j in range(i + 1, n):
            candidate_key = key(values[j])
            if candidate_key < min_key:
                min_index = j
                min_key = candidate_key
        if min_index != i:
            values[i], values[min_index] = values[min_index], values[i]


data = [29, 10, 14, 37, 13]
selection_sort(data)
assert data == [10, 13, 14, 29, 37]
```

The current minimum key is cached.

That avoids recomputing it for every comparison.

Other candidate keys are still computed during each pass.

Decorating all records once can reduce expensive key extraction to $O(n)$ evaluations.

That decoration uses $O(n)$ extra space.

The function intentionally does not claim stability.

For user-defined records, comparator consistency remains the caller's responsibility.

Do not use this implementation for large general-purpose sorting.

Prefer the language's standard stable or introspective sort.

### Stable variant

Find the first suffix minimum with the same scan.

Save the selected record.

Shift each intervening record right by one position.

Write the saved record at the prefix boundary.

The comparison count is unchanged.

The number of element writes can become quadratic.

### Testing strategy

Compare output with the language's trusted sorted result.

Compare multisets to detect loss or duplication.

Attach original sequence numbers to equal keys when testing stability claims.

Count writes separately from comparisons for asymmetric-memory experiments.

## 5. Asymptotic Time & Space Complexity

The exact comparison count is $n(n-1)/2$.

Best-case time is therefore $\Theta(n^2)$.

Average-case time is $\Theta(n^2)$.

Worst-case time is $\Theta(n^2)$.

Input presortedness does not change comparison count.

The basic algorithm performs at most `n-1` swaps.

Each swap may translate into several machine-word writes.

The exact write count depends on record size and swap implementation.

Auxiliary index and key variables use $O(1)$ space.

The sort is in place under ordinary definitions.

Stable shifting retains $\Theta(n^2)$ comparisons.

It may perform $\Theta(n^2)$ moves.

Heap sort can be understood as accelerated selection using a heap.

It selects extrema in $O(\log n)$ rather than rescanning the whole suffix.

Heap sort runs in $O(n\log n)$ time.

For arrays shorter than a small fixed threshold, asymptotic differences may not dominate.

Insertion sort often wins on nearly sorted data because it is adaptive.

Selection sort wins a narrow write-count comparison.

Key extraction can add cost beyond comparison count.

If key computation costs `C`, naive repeated extraction can cost $\Theta(Cn^2)$.

Caching one key per record changes that component to $\Theta(Cn)$ plus comparison work.

## 6. Systems Connections

Write-limited memory motivates algorithms that minimize modifications.

Selection sort's at-most-linear swaps can be useful under that cost model.

Database records are rarely swapped directly because records may be large.

Systems sort references, row IDs, or compact keys instead.

Partial selection finds the smallest `k` elements without fully sorting all positions.

Naive repeated selection costs $O(kn)$.

Heaps and quickselect offer better bounds for larger `k`.

Selection sort resembles choosing the next greedy item from a candidate set.

The similarity is structural, not a proof that every greedy choice is optimal.

Hardware branch behavior is regular in the scan but data-dependent in updates.

Vectorized minimum reduction can identify value and index over a block.

Stable record order matters in multi-key sorting pipelines.

An unstable selection pass can destroy earlier secondary-key order.

Educational visualizers use selection sort because the sorted boundary is explicit.

The algorithm demonstrates how loop invariants lead directly to proof.

External storage strongly favors sequential merge strategies over repeated scans.

Selection sort would reread the unsorted region too often.

Security-critical sorting may need data-oblivious networks instead.

Selection sort's memory access scan is regular, but swap destination reveals the minimum index.

The operational objective determines whether low writes outweigh quadratic reads.

### Write-sensitive engineering analysis

Selection sort's comparison count is almost independent of input order.
Its write count is not.
A pass performs no swap when the smallest remaining element is already at the boundary.
The maximum number of swaps is $n-1$.
Each ordinary swap writes two array positions plus a temporary register assignment.
This is dramatically fewer array writes than insertion sort can perform on reverse-ordered data.
The distinction matters when writes are materially more expensive than reads.
Flash cells have limited program-and-erase endurance.
Persistent-memory writes may require ordering fences and durability traffic.
Remote-memory updates can cross a bus while comparisons remain local.
Selection sort can therefore be reasonable for a tiny, write-sensitive array even when its comparison count is quadratic.
The argument should use a concrete cost model rather than the slogan that writes are expensive.
Let comparison cost be $c$ and an array write cost be $w$.
Ordinary selection sort costs about $c n(n-1)/2$ plus at most $2w(n-1)$ array writes.
Insertion sort can cost about $w n(n-1)/2$ shifts on reverse input.
If $w$ dominates $c$ and $n$ is small enough, selection can win.
For large $n$, its quadratic reads still become prohibitive.
Cycle sort can reduce writes further by placing permutation cycles directly.
It is more complex and handles duplicates carefully.
Heap sort preserves constant auxiliary space and improves comparison complexity to $O(n\log n)$.
Its write pattern and random access differ from selection sort.
Benchmark the actual storage medium and array size before choosing.

### Stability-preserving variants

The conventional swap makes selection sort unstable.
Suppose records `(2, A)` and `(2, B)` appear in that order.
Swapping a later minimum across one of them can reverse equal-key records.
A stable variant removes the selected minimum and shifts the intervening range one place right.
The selected record is then inserted at the boundary.
This preserves relative order among equal keys.
It also changes the movement cost from one swap to as many as $O(n)$ writes per pass.
Worst-case total movement becomes $O(n^2)$.
Stability has therefore not been obtained for free.
A linked representation can detach and splice the selected node without shifting array cells.
Finding each minimum still takes a scan.
Pointer relinking is constant time once predecessor information is known.
The resulting implementation pays for poor locality and node overhead.
Decorating each key with its original index makes every key distinct under lexicographic comparison.
Ordinary swaps then reproduce a stable-by-original-order result.
That method uses extra metadata and changes comparison payload.
For production work, choosing an inherently stable $O(n\log n)$ algorithm is usually clearer.
Stable merge sort and TimSort are common choices.
The stable selection variant remains educational because it isolates the exact operation that destroys stability.

### Boundary and comparator behavior

The minimum scan must use a strict comparison if the first minimum should win ties.
Using less-than-or-equal selects the last equal minimum and makes instability more visible.
A custom comparator must define a transitive strict weak ordering.
If comparisons change during the sort, the prefix invariant can fail even though the code executes normally.
NaN values need an explicit ordering policy because ordinary floating-point comparisons are not total.
Sorting mutable records requires keys to remain unchanged while the algorithm runs.
An empty array performs zero passes.
A singleton array performs zero swaps.
Already sorted input still performs the full quadratic comparison schedule.
These cases make selection sort a useful contrast between adaptive and non-adaptive algorithms.

## 7. Practice Checklist

- Define ascending or descending order.
- Maintain a final sorted prefix.
- Initialize the minimum candidate at the suffix start.
- Scan every remaining suffix element.
- Update both candidate index and cached key.
- Swap only after the scan completes.
- Skip self-swaps when minimizing writes.
- Prove the selected value is a suffix minimum.
- Prove the prefix contains the smallest placed elements.
- Preserve the input multiset through swaps.
- Stop after `n-1` outer passes.
- Test empty and singleton arrays.
- Test sorted and reverse-sorted arrays.
- Test duplicates with labeled origins.
- Do not claim the swap version is stable.
- Use shifting if stability is required.
- Include extra writes in stable-variant analysis.
- Cache expensive keys when justified.
- Ensure comparator transitivity.
- Avoid mutable comparison keys during sorting.
- Count comparisons independently from swaps.
- Measure record bytes written, not only swap statements.
- Prefer standard sorting for large general inputs.
- Compare against insertion sort for nearly sorted data.
- Compare against heap selection for large partial selections.
- Verify sortedness and permutation properties.
- Define handling for NaN or unordered values.
- Distinguish in-place storage from call-stack or decoration storage.
- Benchmark under the actual read/write asymmetry.
- Keep selection semantics separate from placement mechanics.

## 8. Frequently Asked Questions

### Why is selection sort quadratic on sorted input?

It still scans every unsorted suffix to prove the current element is minimum.

### How many swaps does it perform?

At most `n-1`, and fewer when minima are already positioned.

### Is selection sort stable?

The ordinary distant-swap implementation is not stable.

### Can it be made stable?

Yes, by extracting the minimum and shifting intervening elements.

That increases writes.

### Is it in place?

The basic array implementation uses constant auxiliary space.

### When is it useful?

For tiny inputs, teaching, or storage where writes are unusually expensive.

### How does it differ from insertion sort?

Selection chooses a suffix minimum; insertion places the next item into a sorted prefix.

### How does heap sort relate?

Heap sort accelerates repeated extreme selection through a heap structure.

### Does it adapt to existing order?

No in its basic form; the comparison count is fixed by `n`.

### What is the proof's central invariant?

Before pass `i`, the prefix contains the `i` smallest elements in final order.
