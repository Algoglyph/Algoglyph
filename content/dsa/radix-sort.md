# Radix Sort: Stable Digit Passes, Key Encoding & Linear-Range Sorting

![Radix sort digit passes](/images/dsa/radix-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Comparison sorting learns order through pairwise key comparisons.

That model has an $\Omega(n\log n)$ lower bound for arbitrary distinct keys.

Radix sort escapes the comparison model by inspecting structured digits.

It processes fixed-width keys one position at a time.

Each pass groups records by the digit at one position.

A stable grouping preserves order established by earlier passes.

Least-significant-digit radix sort starts at the least significant position.

It moves toward the most significant position.

Most-significant-digit radix sort starts at the opposite end and recursively partitions buckets.

The two variants use different correctness arguments.

LSD radix sort is iterative and naturally stable.

MSD radix sort supports early termination for shared prefixes.

Radix methods predate electronic computers in card-sorting machines.

Mechanical sorters grouped punched cards by one column per pass.

Modern implementations sort integers, strings, addresses, and fixed-format identifiers.

Performance depends on representation more than abstract order alone.

Base choice controls the number of passes and bucket-table size.

Base `256` processes one byte per pass.

Base $2^{16}$ halves the passes but uses larger count arrays.

Larger count arrays can exceed cache capacity.

Signed integers need an order-preserving encoding.

Floating-point bit patterns need sign-aware transformation.

Variable-length strings need end-of-key semantics.

Locale-aware string order cannot usually be obtained from raw bytes.

The per-digit subroutine must be stable for LSD correctness.

Counting sort is a common stable pass.

In-place unstable bucket swapping does not satisfy the same invariant.

Radix sort uses auxiliary storage in its straightforward high-performance form.

It is not automatically faster than introsort or merge sort.

Small arrays, expensive allocation, and large keys can erase its advantage.

It excels when keys have a compact fixed representation and comparisons are costly.

This article uses unsigned integers, then shows how to map signed integers safely.

## 2. Core Mathematical Invariants

### Digit representation

Represent key `x` in base `B` as digits:

$$
x=\sum_{j=0}^{d-1}digit_j(x)B^j.
$$

Digit zero is least significant.

Every digit lies in `[0,B)`.

Fixed-width keys use exactly `d` positions, including leading zeros.

### Stable pass invariant

A stable digit pass sorts by one digit while preserving prior relative order for equal digits.

If records `a` and `b` share the current digit and `a` entered first,

then `a` leaves first.

This property carries lower-digit order through later passes.

### LSD induction invariant

After completing pass `j`, records are sorted by the low `j+1` digits.

Base case `j = 0` follows from sorting by the least significant digit.

For the induction step, sort stably by digit `j+1`.

Different new digits are ordered by the current pass.

Equal new digits retain the already-correct lower-digit order.

After final digit `d-1`, records are sorted by the full key.

### Counting-pass invariant

Count how many records have each digit.

Convert counts into exclusive starting offsets.

Offset `start[r]` is the first output position for digit `r`.

Scanning input from left to right and incrementing offsets is stable.

Every record is written exactly once.

Bucket ranges are disjoint and cover the output array.

### Permutation invariant

Each pass moves all input records into one output position each.

No record is discarded or duplicated.

Swapping input and output buffers preserves the same multiset.

### Base and pass count

For keys in `[0,U)`, required digit count is:

$$
d=\lceil\log_B U\rceil.
$$

For fixed `w`-bit keys and base $B=2^r$, the pass count is:

$$
d=\lceil w/r\rceil.
$$

### Signed-key transformation

Two's-complement signed order differs from unsigned bit-pattern order.

Flip the sign bit before radix sorting:

$$
encoded(x)=bits(x)\oplus 2^{w-1}.
$$

Negative values then map below nonnegative values in unsigned order.

All other relative ordering is preserved.

Decode by flipping the same bit again if records store transformed keys.

### MSD prefix invariant

An MSD bucket shares all digits processed from the most significant side.

Different buckets are already globally ordered.

Only records inside one bucket need recursion on the next digit.

This can avoid processing suffix digits for singleton buckets.

## 3. Step-by-Step Execution Trace

Sort `[170,45,75,90,802,24,2,66]` in base ten.

Pad conceptual keys to three digits.

The keys are `170`, `045`, `075`, `090`, `802`, `024`, `002`, and `066`.

First process the ones digit.

Digit sequence is `[0,5,5,0,2,4,2,6]`.

Stable bucket zero receives `170` then `90`.

Bucket two receives `802` then `2`.

Bucket four receives `24`.

Bucket five receives `45` then `75`.

Bucket six receives `66`.

Concatenate buckets in digit order.

After pass one:

```text
[170, 90, 802, 2, 24, 45, 75, 66]
```

The array is sorted by ones digit.

Now process the tens digit stably.

Tens digits are `[7,9,0,0,2,4,7,6]`.

Bucket zero receives `802` then `2` in their prior order.

Bucket two receives `24`.

Bucket four receives `45`.

Bucket six receives `66`.

Bucket seven receives `170` then `75`.

Bucket nine receives `90`.

After pass two:

```text
[802, 2, 24, 45, 66, 170, 75, 90]
```

The array is sorted by its last two digits.

Now process hundreds digits.

They are `[8,0,0,0,0,1,0,0]`.

Bucket zero receives `2,24,45,66,75,90` in that exact prior order.

Bucket one receives `170`.

Bucket eight receives `802`.

After pass three:

```text
[2, 24, 45, 66, 75, 90, 170, 802]
```

Every full three-digit key is now ordered.

### Why stability matters

Suppose the tens pass reverses equal-digit records `802` and `2`.

Their low two digits are `02` and `02`, so that reversal is harmless here.

Consider instead records `21` and `25` during a tens pass.

Both have tens digit `2`.

An unstable pass could output `25` before `21`.

The final order would be incorrect because no later pass repairs ones digits.

### Signed transformation trace

For four-bit signed values, sign mask is binary `1000`.

Signed `-2` has two's-complement bits `1110`.

Flipping sign produces `0110`, unsigned value `6`.

Signed `3` has bits `0011`.

Flipping sign produces `1011`, unsigned value `11`.

Thus encoded `-2` sorts before encoded `3`.

The transformation extends consistently across the signed range.

## 4. Production-Ready Implementations

The following Python implementation sorts nonnegative integers by bytes.

```python
from __future__ import annotations


def radix_sort_unsigned(values: list[int]) -> None:
    if any(value < 0 for value in values):
        raise ValueError("unsigned radix sort received a negative key")
    if len(values) < 2:
        return

    maximum = max(values)
    passes = max(1, (maximum.bit_length() + 7) // 8)
    source = values
    target = [0] * len(values)

    for byte_index in range(passes):
        shift = byte_index * 8
        counts = [0] * 256

        for value in source:
            counts[(value >> shift) & 0xFF] += 1

        total = 0
        for digit in range(256):
            count = counts[digit]
            counts[digit] = total
            total += count

        for value in source:
            digit = (value >> shift) & 0xFF
            target[counts[digit]] = value
            counts[digit] += 1

        source, target = target, source

    if source is not values:
        values[:] = source


data = [170, 45, 75, 90, 802, 24, 2, 66]
radix_sort_unsigned(data)
assert data == [2, 24, 45, 66, 75, 90, 170, 802]
```

The count array becomes a table of next write positions.

Input is scanned left to right, so equal digits remain stable.

The implementation alternates two buffers instead of copying after every pass.

It copies back only when the final source is not the caller's list.

Python integers are unbounded, so pass count follows the maximum bit length.

Fixed-width signed integers require the sign-bit mapping described earlier.

Records with payloads should move whole records or indices while extracting a key.

Caching expensive keys avoids recomputation during every pass.

For very small arrays, comparison sorting usually has less setup overhead.

Production hybrids select radix sorting above a measured size threshold.

Memory reuse matters when sorting many arrays repeatedly.

Thread-local scratch buffers can reduce allocations while controlling concurrency.

### String radix considerations

Variable-length strings need a sentinel digit ordered before real characters.

MSD recursion can stop at the end of each string.

Unicode collation rules require normalized collation keys, not raw code points.

Bytewise radix order is correct only for the declared encoding and order contract.

## 5. Asymptotic Time & Space Complexity

Let `n` be record count, `d` digit positions, and `B` radix size.

Each pass counts `n` digits.

It scans `B` bucket counters.

It distributes `n` records.

One pass therefore costs $O(n+B)$ time.

Across all digits:

$$
T(n)=O(d(n+B)).
$$

For fixed-width keys and fixed base, `d` and `B` are constants.

The resulting bound is $O(n)$.

Calling it linear without stating fixed key width hides an assumption.

For arbitrary integers, `d` grows with maximum key magnitude.

Using base $2^r$ on `w`-bit keys gives $d=\lceil w/r\rceil$.

Larger `r` reduces passes but increases the $2^r$ count table.

The straightforward stable implementation uses $O(n+B)$ auxiliary space.

One output buffer stores `n` records.

The counting table stores `B` integers.

In-place radix variants exist but are more complex and may lose stability.

Cache misses in an oversized count table can dominate arithmetic.

Moving large records multiplies memory traffic by pass count.

Sorting references or indices can reduce copied bytes.

Comparison sort remains $O(n\log n)$ but may win for small `n` or long keys.

MSD radix can skip remaining positions for singleton buckets.

Its worst-case work still depends on examined key length.

Parallel counting requires per-worker histograms or synchronized counters.

Prefix sums combine local counts into disjoint output ranges.

## 6. Systems Connections

Database engines radix-partition integer keys before hash joins.

Columnar systems sort compact fixed-width identifiers efficiently.

Network software sorts IPv4 or IPv6 addresses by bytes.

GPU sorting uses radix passes because regular memory operations parallelize well.

Graphics pipelines sort depth or material keys encoded into integers.

Search engines sort document identifiers and compact numeric metadata.

Telemetry pipelines group fixed-width timestamps and counters.

Distributed sort partitions by high-order radix digits before local sorting.

The partition boundaries define worker ownership ranges.

Load skew can make some digit buckets much larger than others.

Adaptive repartitioning may be required for balanced distributed work.

String dictionaries use MSD radix or trie-like prefix partitioning.

Lexicographic byte order depends on encoding.

UTF-8 preserves code-point order for valid scalar sequences but not locale collation.

Floating-point total ordering needs bit transformations for sign and special values.

NaNs require an explicit ordering policy.

External-memory radix sorting writes bucket runs sequentially.

Too many buckets can exceed open-file and buffer limits.

Security-sensitive code should bound key widths and allocations.

An attacker-controlled enormous integer can force unexpected pass counts in unbounded runtimes.

Radix sort illustrates that representation-aware algorithms can beat comparison lower bounds.

The lower bound was never violated because the computation model changed.

## 7. Practice Checklist

- Define the key representation and total ordering.
- State whether keys are fixed width.
- Choose LSD or MSD deliberately.
- Require stable passes for LSD radix sort.
- Prove the low-digit induction invariant.
- Include leading zeros conceptually.
- Choose base according to cache and pass count.
- Compute the required number of passes safely.
- Handle empty and singleton arrays.
- Define behavior for zero keys.
- Reject or transform negative keys.
- Flip the sign bit for fixed-width two's-complement signed order.
- Define floating-point ordering before sorting bits.
- Treat NaNs explicitly.
- Use an end-of-key sentinel for variable-length strings.
- Match string order to encoding or collation requirements.
- Scan input left to right during stable distribution.
- Convert counts to correct exclusive offsets.
- Write every record exactly once per pass.
- Preserve the multiset through buffer swaps.
- Copy final output back only when needed.
- Reuse scratch buffers in repeated workloads.
- Test already sorted and reverse-sorted inputs.
- Test duplicates and all-equal keys.
- Test powers of the chosen base.
- Test maximum supported key values.
- Compare results against a trusted comparison sort.
- Include digit count and radix size in complexity claims.
- Benchmark small-array crossover thresholds.
- Measure bytes moved for large records.
- Guard unbounded key widths from hostile input.

## 8. Frequently Asked Questions

### What implementation defects break ordering?

An unstable LSD pass can destroy order already established by lower digits.

Distributing input from the wrong direction can make an otherwise stable counting pass unstable.

Incorrect prefix offsets can overwrite records or leave output holes.

Omitting leading-zero passes leaves shorter-magnitude keys in the wrong global order.

Stopping from the first record's width ignores wider later keys.

Signed keys sorted as ordinary unsigned bits place negatives after positives.

Negating signed minimum can overflow in fixed-width arithmetic.

Separating negatives and reversing them mishandles equal records unless stability is designed carefully.

Using raw float bits without sign transformation breaks numeric order.

NaNs need a declared location in any total order.

Variable-length strings need an end-of-key digit distinct from real symbols.

Raw UTF encodings do not implement locale-sensitive collation.

Count arrays must be reset on every digit pass.

Swapping source and target buffers requires tracking which one holds the final result.

Moving keys without their payloads destroys record association.

Recomputing expensive keys on every pass can dominate the sort.

An enormous radix can allocate more memory than the input.

A tiny radix can multiply full-array memory traffic.

Sparse digit alphabets may favor maps or coordinate compression over giant tables.

Unbounded integers require a pass bound derived from maximum magnitude.

Hostile key widths should be rejected or resource-limited.

The final validation should compare both order and the complete input multiset.

Stable-sort tests should attach original positions to equal keys.

Boundary tests should include values just below and at radix powers.

Signed tests should include minimum, minus one, zero, and maximum.

Buffer-aliasing tests should confirm no unread source record is overwritten.

Parallel histograms need deterministic offset allocation before distribution.

Per-worker bucket ranges must be disjoint.

Distributed buckets need a stable merge policy when global stability matters.

Performance claims should report key width, radix, passes, and bytes moved.

Comparison against the standard library should include allocation and key extraction.

### How can radix sort beat $n\log n$?

It inspects structured digits rather than learning order only through comparisons.

The comparison-model lower bound does not apply.

### Must each LSD pass be stable?

Yes.

Stability preserves the lower-digit order established by previous passes.

### Is radix sort always $O(n)$?

Only when digit count and radix are treated as fixed constants.

The general bound is $O(d(n+B))$.

### How are negative integers handled?

For fixed-width two's-complement keys, flip the sign bit before unsigned sorting.

Other representations need their own order-preserving mapping.

### Which radix should I choose?

Balance fewer passes against larger count tables and cache behavior.

Byte radix `256` is a common practical starting point.

### Is radix sort in place?

The straightforward stable version uses an output buffer.

In-place variants are possible but more complicated.

### Can it sort strings?

Yes, with defined end-of-string and collation semantics.

MSD radix is often natural for variable-length strings.

### Why use insertion sort for small arrays?

Histogram initialization and full-buffer passes have fixed overhead.

A hybrid can avoid that cost on tiny ranges.

### Does radix sort preserve equal-record order?

It does when every digit pass is stable.

### What is the core correctness argument?

After pass `j`, the array is sorted by the lowest `j+1` digits.
