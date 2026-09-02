# Shell Sort: Gap-Sorted Subsequences, Increment Sequences & In-Place Refinement

![Shell sort gapped insertion passes](/images/dsa/shell-sort-dark.png#dark)

## 1. Historical Context & Motivation

Insertion sort is efficient when elements are already near their final positions.

It is slow when a small value begins far to the right.

That value moves only one adjacent position per inner-loop step.

Shell sort accelerates this movement through gapped insertion passes.

For a gap `h`, it sorts elements whose indices differ by `h`.

The array becomes `h`-sorted.

Later passes use smaller gaps.

The final gap is one, producing ordinary insertion sort on a nearly sorted array.

Donald Shell introduced the method in 1959.

Its behavior depends heavily on the chosen gap sequence.

Shell's original halving sequence is simple but has weak worst-case behavior.

Sequences by Hibbard, Knuth, Sedgewick, Pratt, and Ciura improve practical or theoretical properties.

There is no universally optimal sequence for all sizes and machines.

The algorithm is in-place and usually unstable.

It performs no recursive calls and needs only a few temporary values.

Its code resembles insertion sort with stride `gap` instead of one.

Long gaps move misplaced records large distances early.

Short gaps repair the remaining local disorder.

Gap passes interact in a nontrivial way.

Sorting by one gap can disturb order under another earlier gap.

The final gap-one pass is what guarantees complete sortedness.

Any valid finite sequence must end with one.

Omitting one leaves only partial gap order.

Shell sort occupies a practical middle ground.

It is simpler and more memory-frugal than merge sort.

It often outperforms quadratic elementary sorts on medium arrays.

It lacks the straightforward $O(n\log n)$ guarantee of modern hybrids.

Standard libraries therefore rarely use it for general sorting.

It remains useful in embedded environments and educational analysis.

The central concept is not “compare far elements randomly.”

It is maintaining sorted residue-class subsequences for decreasing gaps.

## 2. Core Mathematical Invariants

### Gap subsequences

For gap `h`, indices split by residue modulo `h`.

Residue `r` forms sequence:

$$
A[r],A[r+h],A[r+2h],\ldots.
$$

There are at most `h` such subsequences.

An `h`-sorting pass applies insertion sort to each one.

### h-sorted invariant

An array is `h`-sorted when:

$$
A[i-h]\le A[i]
$$

for every valid `i >= h`.

Equivalently, every residue-class subsequence modulo `h` is sorted.

The gap pass establishes this invariant at completion.

### Inner insertion invariant

While processing index `i`, earlier elements of its residue subsequence are sorted.

Save current value.

Shift larger predecessors right by `h`.

Insert the saved value at the first valid position.

The subsequence remains a permutation of its prior records.

### Final correctness

When `h = 1`, there is one residue-class subsequence containing the whole array.

Being `1`-sorted means:

$$
A[i-1]\le A[i]
$$

for all `i` from one to `n-1`.

That is exactly sorted order.

Earlier passes improve efficiency but are not needed for the final logical implication.

### Gap sequence invariant

Every gap is a positive integer smaller than or relevant to the array length.

The sequence decreases and eventually reaches one.

Duplicate gaps should be removed to avoid redundant passes.

A zero gap would make index progress impossible.

### Permutation invariant

Gapped insertion only moves existing records and restores the saved record.

No item is lost or duplicated.

Every completed pass preserves the input multiset.

### Instability

Equal records in different residue subsequences can cross through long-distance movements.

Even a stable insertion implementation within each subsequence does not guarantee global stability.

Shell sort should be advertised as unstable unless a specialized proof says otherwise.

### Disorder reduction

An inversion is a pair `i < j` with `A[i] > A[j]`.

Long-gap passes can remove inversions spanning large index distances.

They may also create or leave other inversion patterns.

The final insertion pass removes all remaining inversions.

## 3. Step-by-Step Execution Trace

Sort `[23,12,1,8,34,54,2,3]` with gaps `[4,2,1]`.

Begin with gap `4`.

Residue zero subsequence uses indices `0` and `4`: values `[23,34]`.

It is already sorted.

Residue one uses indices `1` and `5`: `[12,54]`.

It is already sorted.

Residue two uses indices `2` and `6`: `[1,2]`.

It is already sorted.

Residue three uses indices `3` and `7`: `[8,3]`.

Save `3`, shift `8` from index `3` to `7`, and place `3` at index `3`.

Array becomes `[23,12,1,3,34,54,2,8]`.

The array is now `4`-sorted.

Move to gap `2`.

Even-index subsequence is `[23,1,34,2]`.

Insert `1` before `23`.

The full array becomes `[1,12,23,3,34,54,2,8]` temporarily.

Value `34` remains after `23`.

Insert `2` into even sequence `[1,23,34]`.

Shift `34` and `23` by two positions.

Even subsequence becomes `[1,2,23,34]`.

Odd-index subsequence is `[12,3,54,8]`.

Insert `3` before `12`.

Insert `8` after `3` but before `12` and `54`.

After the gap-two pass, array is `[1,3,2,8,23,12,34,54]`.

Every element is no greater than the element two positions later.

The array is not yet fully sorted because `3 > 2` across residues.

Move to gap `1`.

This is ordinary insertion sort.

Process `3`; prefix `[1,3]` is sorted.

Process `2`; shift `3` and insert `2` after `1`.

Prefix becomes `[1,2,3]`.

Process `8`; it stays in place.

Process `23`; it stays in place.

Process `12`; shift `23` and insert `12` after `8`.

Process `34` and `54`; both remain in place.

Final array is `[1,2,3,8,12,23,34,54]`.

### Why gap one cannot be omitted

After the gap-two pass, `[1,3,2,8,23,12,34,54]` is `2`-sorted.

Its even and odd subsequences are each sorted.

The adjacent inversion `(3,2)` crosses residue classes.

Only a later compatible gap such as one guarantees its removal.

## 4. Production-Ready Implementations

The implementation uses the empirical Ciura sequence and extends it for larger arrays.

```python
from __future__ import annotations

from collections.abc import MutableSequence
from typing import TypeVar

T = TypeVar("T")


def ciura_gaps(length: int) -> list[int]:
    gaps = [1, 4, 10, 23, 57, 132, 301, 701]
    while gaps[-1] < length:
        next_gap = int(gaps[-1] * 2.25)
        if next_gap <= gaps[-1]:
            next_gap = gaps[-1] + 1
        gaps.append(next_gap)
    return [gap for gap in reversed(gaps) if gap < length]


def shell_sort(values: MutableSequence[T]) -> None:
    for gap in ciura_gaps(len(values)):
        for i in range(gap, len(values)):
            current = values[i]
            j = i
            while j >= gap and current < values[j - gap]:
                values[j] = values[j - gap]
                j -= gap
            values[j] = current


data = [23, 12, 1, 8, 34, 54, 2, 3]
shell_sort(data)
assert data == [1, 2, 3, 8, 12, 23, 34, 54]
```

The generated sequence always includes gap one for arrays longer than one.

Gaps are processed from largest to smallest.

The extension factor is a practical convention, not a universal optimum proof.

The inner loop compares through strict less-than.

Equal records are not shifted within one subsequence.

Global stability still does not follow.

For custom keys, decorate records once when extraction is expensive.

Large records can be sorted indirectly through references or indices.

Production systems should benchmark against the standard library.

Do not replace a guaranteed $O(n\log n)$ library sort without workload evidence.

### Gap validation

Reject zero or negative custom gaps.

Remove duplicates.

Ignore gaps greater than or equal to length.

Require final gap one for nontrivial arrays.

A custom sequence API should enforce these conditions centrally.

## 5. Asymptotic Time & Space Complexity

Complexity depends on the increment sequence.

Shell's original halving sequence has $O(n^2)$ worst-case time.

Other sequences provide improved proven bounds.

Pratt's sequence using powers of two and three has an $O(n\log^2 n)$ worst-case bound with many gaps.

Ciura's sequence is valued for empirical performance.

Its commonly extended form lacks one simple universal tight bound.

Therefore complexity claims must name the sequence.

One gap pass can take $O(n^2/h)$-like work under rough subsequence reasoning, depending on disorder.

Summing passes yields sequence-specific behavior.

Best-case work still scans indices for every gap.

With `g` gaps, already ordered data costs $O(gn)$ comparisons up to constants.

The shown algorithm uses $O(1)$ auxiliary element storage.

The generated gap list uses $O(\log n)$ small integers for geometric growth.

If the sequence is treated as external or fixed, sorting workspace is constant.

There is no recursion stack.

Record movements can be much lower than plain insertion sort on distant inversions.

Worst-case movement remains superlinear or quadratic depending on gaps.

Cache behavior is less sequential for large gaps.

Later small gaps regain contiguous locality.

Comparison cost and record size affect the best threshold.

For guaranteed general performance, introsort, timsort, or merge sort is safer.

## 6. Systems Connections

Embedded systems value in-place algorithms with tiny code and memory footprints.

Shell sort can fit when arrays are moderate and worst-case deadlines are loose.

Gap-based passes resemble cache-aware strided processing.

Large strides can cause cache and translation-lookaside-buffer misses.

Choosing gaps relatively prime to common layout patterns can avoid some repeated alignment effects.

Stable sorting pipelines should not use ordinary shell sort for a later key.

Equal-record reordering can destroy prior ordering.

Firmware may prefer deterministic allocation-free behavior over sophisticated libraries.

Real-time firmware still needs a proven time bound for its exact gap sequence.

Sorting networks provide data-independent operation patterns for fixed small sizes.

Shell sort does not provide the same obliviousness.

Database and external-memory systems prefer block-aware merge or radix methods.

Strided repeated scans are inefficient on disks.

GPU implementations generally favor radix, merge, or network-based primitives.

Shell sort is difficult to parallelize efficiently across interacting gap passes.

Educationally, it demonstrates how partial order can accelerate a final simple algorithm.

That theme appears in preprocessing, smoothing, and multiscale methods beyond sorting.

Benchmarking should include data distributions, record widths, and cache sizes.

One gap sequence can perform differently across architectures.

### Gap-sequence design in practice

The gap sequence is part of the algorithm, not a tuning constant hidden from analysis.
Every useful sequence must end in gap one.
Without that final insertion-sort pass, separate residue classes may remain globally interleaved.
Gaps should normally decrease strictly.
Duplicate or increasing gaps repeat work without strengthening the h-sorted invariant.
Halving gaps are simple to derive but admit quadratic worst cases.
Hibbard gaps have the form $2^k-1$.
Knuth gaps follow repeated multiplication by three and addition of one.
Sedgewick proposed interleaved formulas with stronger empirical and analytical behavior.
Tokuda gaps use a geometric ratio designed for practical spacing.
Ciura's experimentally derived prefix performs well on many ordinary array sizes.
For arrays larger than the published Ciura prefix, implementations extend it by a documented ratio.
Different extensions can produce different comparison counts.
An implementation should not claim a theorem for one sequence while executing another.
Large initial gaps move distant inversions rapidly.
Too many gaps add full-array scan overhead.
Too few gaps leave excessive work for the final insertion pass.
Gaps sharing unfavorable arithmetic relationships can preserve patterns that are slow to eliminate.
Relatively diverse gaps mix residue classes more effectively.
Theoretical sequence research studies precisely these interactions.
No universally best practical sequence exists for every size, distribution, and machine.
Record the chosen sequence in performance results.

### Data movement and cache behavior

Each gap pass scans the array mostly from left to right.
Its inner shifts jump by the current gap.
Large gaps therefore touch memory with poor spatial locality.
As gaps shrink, access becomes progressively more cache-friendly.
The final gap-one pass is an ordinary contiguous insertion sort.
Earlier passes aim to make that pass nearly linear.
Moving whole records can be expensive when records are large.
Sort indices or lightweight references when payload movement dominates.
The comparator may also dominate for strings, locale-aware keys, or computed projections.
Cache a projection once per record if it is pure and expensive.
Do not recompute it inside every comparison.
For trivial numeric arrays that fit in cache, branch behavior and shifts determine constants.
Binary insertion can reduce comparisons inside a gap subsequence.
It does not reduce the number of elements that must be shifted.
The noncontiguous subsequence makes binary lookup less cache-friendly than in a packed range.
Simple linear insertion is often preferable for small subsequences.
Sentinel techniques can remove some boundary checks but complicate generic comparators.
Correctness and clear bounds should precede micro-optimization.

### Choosing Shell sort honestly

Shell sort is attractive when auxiliary memory must remain constant.
It is also attractive when code size should be small and input sizes are moderate.
It does not provide stability under conventional shifting.
It does not offer a simple universally accepted tight bound independent of gap choice.
It is not a replacement for introsort when worst-case $O(n\log n)$ is contractual.
It can outperform elementary quadratic sorts by moving elements long distances early.
It can be simpler than heap sort for constrained educational or embedded contexts.
Benchmark distributions should include sorted, reverse, random, organ-pipe, duplicate-heavy, and patterned inputs.
Adversarial inputs should be constructed for the actual gap sequence.
Measure comparisons and moves separately.
Measure elapsed time only after confirming identical comparator semantics.
Include gap-list construction in tiny-input benchmarks.
For very small arrays, insertion sort alone may win because setup dominates.
Hybrid libraries usually choose a proven general sorter and reserve insertion sort for tiny partitions.
Shell sort belongs when its memory and implementation trade-offs are explicit.
It is especially important to separate algorithm comparisons from gap-sequence comparisons.
Two programs both labeled Shell sort may execute materially different passes.
A reproducible report lists every gap used for each tested length.
It also states whether gaps larger than the array were generated and discarded.
Move counting should distinguish shifts from the final placement of the held value.
Comparison counting should define whether loop-bound checks are included.
Duplicate-heavy data can reduce shifts without reducing every comparison.
Large record payloads make indirect sorting more attractive.
Tiny scalar arrays make dispatch overhead relatively visible.
These details turn a vague benchmark into an explainable engineering result.

## 7. Practice Checklist

- Define the gap sequence explicitly.
- Ensure every gap is positive.
- Process gaps in decreasing order.
- Ensure the final gap is one.
- Ignore gaps not smaller than the array length.
- Apply insertion sort separately to each residue class.
- Shift by `gap`, not by one, inside a gapped pass.
- Save the current record before shifting.
- Restore it at the correct residue-class position.
- Prove each completed pass produces an h-sorted array.
- Use the gap-one invariant for final correctness.
- Preserve the input multiset.
- Do not claim ordinary shell sort is stable.
- State complexity together with the increment sequence.
- Test empty and singleton arrays.
- Test sorted and reverse-sorted arrays.
- Test duplicate-heavy arrays with labeled equal records.
- Test sizes below and above every configured gap.
- Validate custom gap sequences centrally.
- Check that gap generation always terminates.
- Cache expensive record keys if justified.
- Benchmark against insertion sort on nearly sorted data.
- Benchmark against the standard library on random data.
- Include moves as well as comparisons.
- Include cache effects for large gaps.
- Avoid shell sort for external storage.
- Avoid it where stable order is required.
- Use a proven sequence when worst-case bounds matter.
- Document empirical extensions separately from proven sequences.
- Prefer standard sorting absent a clear constraint advantage.

## 8. Frequently Asked Questions

### Why is shell sort faster than insertion sort?

Early large gaps move distant misplaced elements closer to final positions.

The final insertion pass then sees less disorder.

### Why must the last gap be one?

Only one-sortedness guarantees every adjacent pair is ordered.

### Is shell sort stable?

Ordinary implementations are not stable because records can cross between gap subsequences.

### Is it in place?

Yes, aside from the small gap list and temporary record.

### What is its time complexity?

The bound depends on the chosen gap sequence.

State the sequence before stating the bound.

### What is an h-sorted array?

Every sequence of elements `h` positions apart is sorted.

### Which gap sequence is best?

No sequence dominates every size, machine, and workload.

Ciura's is a common empirical choice.

### Does it exploit sorted input?

Gapped insertion moves little on ordered data, but every gap pass still scans the array.

### Why not use it as a standard library default?

Modern hybrids offer stronger guarantees and often better broad workload behavior.

### What is the central proof idea?

Each pass establishes h-sortedness, and the final `h = 1` pass establishes full order.
