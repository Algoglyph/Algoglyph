# Bucket Sort: Distribution Mapping, Local Ordering & Data-Dependent Performance

![Bucket sort distribution and collection](/images/dsa/bucket-sort-dark.jpg#dark)

## 1. Historical Context & Motivation

Comparison sorting treats keys as opaque values that can only be ordered pairwise.

Bucket sort exploits more structure.

It maps keys into ordered regions, sorts within each region, and concatenates the regions.

If the mapping distributes input evenly, each local sort is small.

That can produce expected linear time under an explicit distribution model.

The method belongs to the broader family of distribution sorts.

Counting sort uses one slot per discrete key or key offset.

Radix sort distributes by digits across multiple stable passes.

Bucket sort normally assigns ranges of keys to containers and then sorts each container.

The concept predates any one programming language or machine architecture.

Physical sorting processes use the same pattern: place records into labeled bins, order each bin, then collect bins in label order.

The appealing $O(n)$ claim is conditional.

It does not hold for arbitrary inputs with arbitrary bucket mapping.

If every element lands in one bucket and that bucket uses insertion sort, runtime becomes quadratic.

If each bucket uses a comparison sort, the worst case is typically $O(n\log n)$ plus distribution overhead.

Correctness and performance depend on different properties.

Correctness requires ordered bucket ranges and a correct local sort.

Fast expected performance additionally requires a distribution that keeps bucket loads small.

Choosing bucket count is an engineering decision.

Too few buckets leave expensive local sorting.

Too many buckets consume memory and may spend time scanning mostly empty containers.

The key range must also be modeled carefully.

The familiar classroom version assumes floating-point keys in $[0,1)$.

Real inputs may include negative values, repeated endpoints, integers, infinities, or values outside a promised interval.

A robust API either validates its domain or derives a safe mapping from observed finite bounds.

Floating-point `NaN` has no ordinary total order and must be rejected or handled by a declared policy.

The final collection order matters.

Bucket zero must contain values no greater than values in bucket one, and so forth.

Sorting buckets correctly is insufficient if their ranges overlap in an unordered way.

Stability is possible but not automatic.

Appending input elements to buckets preserves their arrival order within each bucket.

The local sort must be stable, and equal keys must map to the same bucket.

The central question is:

Which mapping invariants make concatenated buckets globally sorted, and under what distribution assumptions does the method approach linear time?

## 2. Core Mathematical Invariants

Let the input contain $n$ records with finite numeric key $k(x)$.

Let there be $b\ge1$ buckets numbered $0$ through $b-1$.

Define a mapping:

$$
h:k(x)\mapsto\{0,1,\ldots,b-1\}.
$$

### Coverage invariant

Every input record is appended to exactly one bucket.

No record is dropped.

No record is copied into multiple buckets.

After distribution, the total bucket population is:

$$
\sum_{i=0}^{b-1}n_i=n,
$$

where $n_i$ is the load of bucket $i$.

### Ordered-range invariant

For any records $x$ and $y$:

$$
h(k(x))<h(k(y))\implies k(x)\le k(y).
$$

This property makes bucket index a coarse order.

It is usually obtained by assigning nonoverlapping, ascending numeric intervals.

If ranges overlap or bucket labels are collected out of order, concatenation may be incorrect.

### Local-order invariant

Before collection, each bucket is sorted by the target key order.

For bucket $i$:

$$
B_i[0]\le B_i[1]\le\cdots\le B_i[n_i-1].
$$

The ordered-range invariant handles pairs in different buckets.

The local-order invariant handles pairs in the same bucket.

Together they prove global sortedness after concatenation.

### Permutation invariant

Distribution moves references from the input sequence into buckets without changing record identity.

Local sorting permutes records within a bucket.

Collection concatenates every bucket once.

Therefore output is a permutation of input.

### Stable-order invariant

Suppose equal keys always map to the same bucket.

Append distribution preserves their input order inside that bucket.

If the local sorting algorithm is stable, equal-key records retain that order.

Concatenation does not separate them.

Under these conditions bucket sort is stable.

### Normalized finite-range mapping

For observed minimum $a$ and maximum $z$ with $a<z$, define:

$$
h(v)=\min\left(b-1,\left\lfloor\frac{(v-a)b}{z-a}\right\rfloor\right).
$$

The outer `min` places the maximum value into the last bucket.

Without it, substituting $v=z$ produces index $b$.

For $a\le v\le z$, the mapping stays within valid bounds.

It is monotone nondecreasing in exact arithmetic.

If every key equals $a=z$, normalization would divide by zero.

That case is already sorted by key and should return directly.

### Load-square invariant for insertion-sorted buckets

Insertion sorting bucket $i$ takes $O(n_i^2)$ worst-case time.

Total local work is bounded by:

$$
O\left(\sum_{i=0}^{b-1}n_i^2\right).
$$

Balanced loads keep this sum small.

Concentrated loads make it large.

If one bucket receives all elements, the sum is $n^2$.

If $b=n$ and expected loads are constant under a uniform model, expected total local work is linear.

### Input-domain invariant

Every key must satisfy the mapping's domain assumptions.

For the finite-range implementation, keys must be real finite numbers.

`NaN` violates ordinary comparison reasoning.

Positive and negative infinity make finite normalization undefined.

Rejecting unsupported values is safer than silently assigning arbitrary buckets.

### Bucket-count invariant

The number of buckets is positive and bounded by an operational policy.

Allocating one bucket per untrusted numeric unit can exhaust memory.

A configurable cap is part of a safe implementation.

## 3. Step-by-Step Execution Trace

Sort:

$$
[0.42,0.32,0.23,0.52,0.25,0.47,0.51]
$$

using five equal-width buckets over the observed range.

The minimum is $a=0.23$.

The maximum is $z=0.52$.

The width scale uses:

$$
h(v)=\min\left(4,\left\lfloor\frac{(v-0.23)5}{0.29}\right\rfloor\right).
$$

Compute bucket assignments in input order.

| Value | Scaled position | Bucket |
|---:|---:|---:|
| 0.42 | $3.275\ldots$ | 3 |
| 0.32 | $1.551\ldots$ | 1 |
| 0.23 | 0 | 0 |
| 0.52 | 5, clamped | 4 |
| 0.25 | $0.344\ldots$ | 0 |
| 0.47 | $4.137\ldots$ | 4 |
| 0.51 | $4.827\ldots$ | 4 |

After stable append distribution:

| Bucket | Unsorted contents |
|---:|---|
| 0 | $[0.23,0.25]$ |
| 1 | $[0.32]$ |
| 2 | $[]$ |
| 3 | $[0.42]$ |
| 4 | $[0.52,0.47,0.51]$ |

Every input occurs exactly once.

The population sum is $2+1+0+1+3=7$.

Sort each bucket stably.

Buckets 0, 1, 2, and 3 are already ordered.

Bucket 4 becomes:

$$
[0.47,0.51,0.52].
$$

Concatenate buckets from index 0 through 4:

$$
[0.23,0.25,0.32,0.42,0.47,0.51,0.52].
$$

Within each bucket, local sorting handles exact order.

Across buckets, monotone interval assignment proves every earlier key is no larger than any later key.

### Maximum-value boundary

For $v=z=0.52$, the unbounded expression equals 5.

Valid bucket indices stop at 4.

Clamping to $b-1$ handles the closed maximum endpoint.

This is not optional defensive code; it follows from using $b$ equal subdivisions with an inclusive observed maximum.

### All-equal trace

For $[7,7,7]$, $a=z=7$.

Normalization has zero denominator.

Because every key is equal, the input is already sorted.

Returning a copy preserves stable order and avoids meaningless bucket work.

### Skewed-load trace

Consider 100 values clustered near zero plus one value near one.

Equal-width ranges may place nearly all clustered values in the first bucket.

Correctness remains intact.

Insertion sorting that bucket can approach quadratic time.

The example separates a correct mapping from a performance-appropriate mapping.

## 4. Production-Ready Implementations

This Python implementation sorts finite real keys and returns a new list.

It uses Python's stable local sort.

```python
from collections.abc import Callable, Iterable
from math import isfinite
from typing import TypeVar


Item = TypeVar("Item")


def bucket_sort(
    values: Iterable[Item],
    *,
    key: Callable[[Item], float] = lambda item: item,
    bucket_count: int | None = None,
    maximum_buckets: int = 100_000,
) -> list[Item]:
    items = list(values)
    if not items:
        return []

    keys = [float(key(item)) for item in items]
    if not all(isfinite(value) for value in keys):
        raise ValueError("bucket-sort keys must be finite")

    count = len(items) if bucket_count is None else bucket_count
    if count < 1:
        raise ValueError("bucket count must be positive")
    if count > maximum_buckets:
        raise ValueError("bucket count exceeds configured limit")

    minimum = min(keys)
    maximum = max(keys)
    if minimum == maximum:
        return items.copy()

    buckets: list[list[tuple[float, Item]]] = [[] for _ in range(count)]
    scale = count / (maximum - minimum)

    for item, item_key in zip(items, keys):
        index = min(count - 1, int((item_key - minimum) * scale))
        buckets[index].append((item_key, item))

    result: list[Item] = []
    for bucket in buckets:
        bucket.sort(key=lambda pair: pair[0])
        result.extend(item for _, item in bucket)
    return result
```

Keys are computed once, which is important when extraction is expensive or stateful.

Converting keys to `float` defines the supported numeric model explicitly.

Applications needing exact huge integers or decimal arithmetic should implement a mapping in that numeric domain rather than accept rounding.

The implementation preserves the input when all keys are equal.

It also preserves stability because append distribution and Python's local sort are stable.

### Correctness and stability checks

```python
from dataclasses import dataclass


sample = [0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51]
assert bucket_sort(sample, bucket_count=5) == sorted(sample)

assert bucket_sort([]) == []
assert bucket_sort([7, 7, 7]) == [7, 7, 7]
assert bucket_sort([-4.0, 2.5, -1.0, 0.0]) == [-4.0, -1.0, 0.0, 2.5]


@dataclass(frozen=True)
class Event:
    time: float
    label: str


events = [
    Event(2.0, "a"),
    Event(1.0, "x"),
    Event(2.0, "b"),
    Event(1.0, "y"),
]
assert bucket_sort(events, key=lambda event: event.time, bucket_count=3) == [
    Event(1.0, "x"),
    Event(1.0, "y"),
    Event(2.0, "a"),
    Event(2.0, "b"),
]
```

### Randomized differential validation

```python
from random import Random


rng = Random(31)
for length in range(120):
    for _ in range(40):
        source = [rng.uniform(-1_000.0, 1_000.0) for _ in range(length)]
        bucket_count = max(1, min(25, length + 1))
        actual = bucket_sort(source, bucket_count=bucket_count)
        assert actual == sorted(source)
        assert len(actual) == len(source)
```

### Domain and resource checks

```python
for invalid in (float("nan"), float("inf"), float("-inf")):
    try:
        bucket_sort([0.0, invalid])
    except ValueError:
        pass
    else:
        raise AssertionError("non-finite key should be rejected")

try:
    bucket_sort([1.0], bucket_count=0)
except ValueError:
    pass
else:
    raise AssertionError("zero buckets should be rejected")

try:
    bucket_sort([1.0], bucket_count=100_001)
except ValueError:
    pass
else:
    raise AssertionError("excessive allocation should be rejected")
```

### Engineering choices

Do not derive a huge bucket count directly from an untrusted key range.

Choose count from input size, distribution knowledge, memory budget, and local-sort cost.

For heavily skewed distributions, quantile-based boundaries may balance loads better than equal widths.

Those boundaries must remain monotone and deterministic.

For external data, buckets may map to files or partitions instead of in-memory lists.

That design needs file-count limits, cleanup, and stable record serialization.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of records and $b$ the number of buckets.

Key extraction takes $\Theta(n)$ calls.

Allocating buckets takes $\Theta(b)$ time and space.

Distribution takes $\Theta(n)$ expected time for constant-time append and mapping arithmetic.

If local bucket $i$ uses comparison sort, its cost is:

$$
O(n_i\log n_i).
$$

Total time is:

$$
O\left(n+b+\sum_{i=0}^{b-1}n_i\log n_i\right).
$$

If all $n$ elements land in one bucket, this becomes $O(n\log n+b)$ with the implementation shown.

If insertion sort is used locally, the corresponding worst case is $O(n^2+b)$.

Under a suitable uniform-distribution model with $b=\Theta(n)$, expected bucket load is constant.

Expected local sorting work is then $O(n)$.

Expected total time becomes $O(n+b)=O(n)$.

That conclusion depends on the probabilistic model and hash/range mapping quality.

It is not an unconditional worst-case guarantee.

Collection visits every record and bucket, costing $\Theta(n+b)$.

The implementation stores cached keys and bucket entries.

Auxiliary space is $\Theta(n+b)$.

Returning a new output list also uses $\Theta(n)$ result space.

An in-place array implementation is possible with more complex counting and rearrangement machinery, but ordinary bucket sort is not considered constant-space.

If $b$ greatly exceeds $n$, empty-bucket allocation and scanning dominate.

If $b$ is too small, local sort work dominates.

The largest bucket size:

$$
L=\max_i n_i
$$

is a useful operational diagnostic.

A large $L/n$ ratio indicates skew and warns that expected-linear assumptions are not matching observed data.

## 6. Systems Connections

### Histogramming and counting sort

Counting sort can be viewed as extremely fine buckets for discrete keys, with counts replacing local sorting.

It is effective when the integer key range is manageable.

Bucket sort handles broader ranges by grouping many possible keys per region.

### Database partitioning

Range-partitioned tables assign records to ordered key intervals.

Local indexes order records within partitions.

Skew creates hot partitions just as it creates overloaded sorting buckets.

Boundary selection and repartitioning are operational concerns shared by both systems.

### Parallel sorting

After distribution, buckets can be sorted independently.

That independence enables parallel workers.

Load imbalance limits speedup when one bucket receives most records.

Parallel collection must preserve bucket order.

### External-memory sorting

Buckets can partition data into chunks that fit memory.

Local runs can then be sorted with an appropriate external algorithm.

Randomly creating thousands of files is unsafe and often slow, so partition count and lifecycle must be controlled.

### Geographic and spatial indexing

Coordinates can be mapped to spatial cells before local processing.

A one-dimensional bucket order is insufficient for arbitrary two-dimensional global ordering.

Spatial grids use the same distribution idea for neighborhood search rather than total sorting.

### Load balancing

Equal numeric widths do not imply equal record counts.

Quantile-derived boundaries aim for equal counts, while fixed semantic boundaries aim for interpretable ranges.

The correct choice depends on whether balance or stable meaning is more important.

### Security boundaries

Untrusted `bucket_count` can trigger excessive allocation.

Untrusted non-finite keys can violate ordering logic.

Adversarial skew can force worst-case local sorting.

Validate allocation sizes, reject unsupported keys, and retain a local sort with a safe worst-case bound.

### Distributed shuffles

MapReduce-style range partitioning sends records to reducers by ordered ranges.

Each reducer sorts its partition, and reducer outputs concatenate by partition order.

Sampling is commonly used to estimate balanced boundaries.

Incorrect samples or changing distributions cause stragglers.

## 7. Practice Checklist

- Define the supported key domain.
- Reject or explicitly order `NaN` and infinities.
- Prove every input enters exactly one bucket.
- Prove bucket indices stay within bounds.
- Handle the inclusive maximum endpoint.
- Handle an all-equal key set without division by zero.
- State the ordered-range invariant.
- Sort every nontrivial bucket correctly.
- Concatenate buckets in index order.
- Prove the permutation invariant.
- Preserve append order during distribution.
- Use a stable local sort when global stability is required.
- Ensure equal keys map to the same bucket.
- Derive total time using bucket loads $n_i$.
- State distribution assumptions behind expected linear time.
- Analyze the all-in-one-bucket case.
- Bound `bucket_count` for untrusted input.
- Avoid allocating from raw numeric key range.
- Include empty-bucket scanning in complexity.
- Include key-extraction cost.
- Cache expensive keys once.
- Test negative values.
- Test duplicate values.
- Test minimum and maximum boundaries.
- Test one bucket.
- Test more buckets than elements.
- Test empty input.
- Test one element.
- Test all equal elements.
- Differential-test against a trusted stable sort.
- Measure maximum observed bucket load.
- Reconsider boundaries when skew is high.
- Choose local sort according to required worst-case behavior.
- Preserve bucket order in parallel execution.
- Control temporary files in external-memory designs.
- Document whether output is new or in place.

## 8. Frequently Asked Questions

### Is bucket sort always $O(n)$?

No.

Expected linear time requires assumptions about distribution, bucket count, mapping, and local sorting cost.

### What is its worst-case time?

With a comparison sort inside each bucket, the shown implementation is $O(n\log n+b)$ when all records collide.

Using insertion sort locally can make that case $O(n^2+b)$.

### How many buckets should I use?

There is no universal optimum.

Use input size, expected distribution, memory budget, parallelism, and local-sort cost to choose and cap it.

### Why clamp the maximum value?

Normalized scaling maps the inclusive maximum to the mathematical value $b$, one beyond the last valid index.

Clamping places it in bucket $b-1$.

### Can bucket sort handle negative numbers?

Yes, if the mapping accounts for the minimum and range as the implementation here does.

The $[0,1)$ textbook formula alone cannot.

### Is bucket sort stable?

It is stable when equal keys share a bucket, distribution preserves arrival order, and each local sort is stable.

### Is it in place?

Typical bucket sort uses $O(n+b)$ auxiliary storage.

Specialized rearrangement variants exist, but constant space is not the ordinary contract.

### How is it different from counting sort?

Counting sort maintains counts for discrete key values or offsets and needs no local comparison sort.

Bucket sort groups key ranges and sorts records within groups.

### How is it different from radix sort?

Radix sort performs multiple stable distribution passes over key digits.

Bucket sort typically performs one range distribution followed by local sorting.

### What if the data is highly skewed?

One or a few buckets may dominate runtime.

Use distribution-aware boundaries, more suitable transformations, or a standard comparison sort.

### Can buckets be processed in parallel?

Yes, because local sorts are independent after distribution.

Global collection must still follow bucket order, and skew can cause worker imbalance.

### Why reject `NaN`?

`NaN` does not participate in a normal total numeric order, so comparison and range mapping assumptions fail.

A different API may define an explicit placement policy instead.

### Should insertion sort be used inside buckets?

It is attractive for genuinely tiny buckets and makes the expected-linear analysis intuitive.

A robust library may use a tested adaptive sort to retain a better collision worst case.

### Does equal-width bucketing guarantee balance?

No.

It balances numeric range width, not record count.

### What is the best diagnostic for a poor mapping?

Inspect the bucket-load distribution, especially the maximum load and empty-bucket fraction.

Those measurements show whether local work and allocation match the intended model.
