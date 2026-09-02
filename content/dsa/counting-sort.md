# Counting Sort: Frequency Tables, Prefix Positions & Bounded Integer Keys

![Counting sort frequency and prefix arrays](/images/dsa/counting-sort-dark.png#dark)

## 1. Historical Context & Motivation

Counting sort orders records by counting how many times each integer key occurs.

It does not compare two keys to decide which one is smaller.

It uses the key itself as an address into a frequency table.

That one design choice is why counting sort can beat comparison sorting.

A comparison sort must learn order by asking questions like `a < b`.

Counting sort starts with a stronger assumption: every key belongs to a bounded integer interval.

If the interval is small, the algorithm can count first and place later.

For values in an inclusive range $[minimum, maximum]$, define:

$$
k = maximum - minimum + 1.
$$

The stable version runs in $O(n+k)$ time.

It also uses $O(n+k)$ extra space.

The bound is excellent when $k$ is close to $n$.

The bound is terrible when the keys are sparse across a huge universe.

Sorting ten scores between 0 and 100 is a natural fit.

Sorting ten user IDs where one value is near $10^{12}$ is not.

The algorithm is often introduced only for nonnegative integers.

That restriction is unnecessary.

Subtracting the minimum key maps negative values into zero-based counter positions.

Counting sort is also the usual stable pass inside least-significant-digit radix sort.

Radix sort sorts one digit at a time.

Every digit pass must preserve the ordering created by earlier digit passes.

A nonstable counting pass breaks that property.

The practical question is therefore not merely whether counting sort is fast.

The real question is when frequency tables are a faithful and affordable representation of the key domain.

Counting sort is a lesson in algorithmic honesty.

It converts a distribution assumption into speed.

When the assumption is false, the same mechanism becomes memory waste.

## 2. Core Mathematical Invariants

Let `items` contain $n$ records.

Let `key(item)` return an integer key for each record.

Let `low` be the minimum observed key.

Let `high` be the maximum observed key.

Let `span = high - low + 1`.

Counter index `i` represents actual key `low + i`.

After the frequency pass:

$$
count[i] = |\{x \in items : key(x)=low+i\}|.
$$

The sum of all counters is exactly $n$.

No item is missing from the histogram.

No item contributes to two buckets.

After prefix accumulation:

$$
count[i] = |\{x \in items : key(x)\le low+i\}|.
$$

This value is not the first index of the bucket.

It is the exclusive right boundary of the bucket.

For key `low + i`, all output positions belonging to that key lie before `count[i]`.

The bucket starts just after the previous prefix boundary.

For `i = 0`, the bucket starts at position zero.

For `i > 0`, the bucket starts at `count[i - 1]`.

Stable placement uses the right boundary as a countdown cursor.

When placing an item with key index `i`, decrement `count[i]` first.

Then write the item into `output[count[i]]`.

The decrement-before-write rule prevents an off-by-one error.

The largest valid output index is $n-1$.

The final prefix value for the largest key is $n$.

Writing before decrementing would try to use position $n$.

The right-to-left traversal is the stability invariant.

Suppose two records `a` and `b` have equal keys and `a` appears before `b` in the input.

The placement pass sees `b` first.

It assigns `b` the rightmost remaining slot in that key's bucket.

Later it sees `a`.

It assigns `a` the next slot to the left.

Thus `a` still appears before `b` in the final output.

The output is a permutation because each placement consumes one unique bucket position.

The output is sorted because prefix buckets are laid out in increasing key order.

The output is stable because equal-key records are placed in reverse scan order into decreasing positions.

These three facts are the whole proof.

Frequency preserves multiplicity.

Prefix sums reserve ordered intervals.

Right-to-left placement preserves equal-key order.

## 3. Step-by-Step Execution Trace

Sort the values:

```text
[4, 2, 2, 8, 3, 3, 1]
```

The minimum key is `1`.

The maximum key is `8`.

The span is `8`.

Counter index `0` represents key `1`.

Counter index `7` represents key `8`.

The frequency table is:

| Key | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frequency | 1 | 2 | 2 | 1 | 0 | 0 | 0 | 1 |

The prefix table becomes:

```text
key:     1  2  3  4  5  6  7  8
prefix:  1  3  5  6  6  6  6  7
```

Read `prefix[1] = 3` as:

Three values are less than or equal to `2`.

So the `2` bucket occupies output positions `1` and `2`.

Read `prefix[3] = 6` as:

Six values are less than or equal to `4`.

So key `4` ends just before output position `6`.

Now place items from right to left.

The rightmost input value is `1`.

Its key index is `0`.

Its boundary moves from `1` to `0`.

Write `1` at output position `0`.

The next value is the rightmost `3`.

Its key index is `2`.

Its boundary moves from `5` to `4`.

Write that `3` at output position `4`.

The previous `3` now moves the same boundary from `4` to `3`.

Write it at output position `3`.

The two equal `3` values retain their original order.

The value `8` moves boundary `7` to `6`.

Write `8` at output position `6`.

The rightmost `2` moves boundary `3` to `2`.

Write that `2` at output position `2`.

The leftmost `2` moves boundary `2` to `1`.

Write it at output position `1`.

The value `4` moves boundary `6` to `5`.

Write `4` at output position `5`.

The final output is:

```text
[1, 2, 2, 3, 3, 4, 8]
```

For stability, use tagged records:

```text
[(2, "a"), (1, "x"), (2, "b"), (1, "y")]
```

The sorted result must be:

```text
[(1, "x"), (1, "y"), (2, "a"), (2, "b")]
```

The two key-`1` records keep `x` before `y`.

The two key-`2` records keep `a` before `b`.

That result is impossible to guarantee with a simple emit-by-frequency loop over only the keys.

## 4. Production-Ready Implementations

The implementation below sorts any iterable of records as long as the key function returns bounded integers.

It copies the input once because stable placement needs both forward key discovery and reverse placement.

It rejects boolean keys because Python treats `True` and `False` as integers.

It caps the allowed key span before allocating the count array.

```python
from collections.abc import Callable, Iterable
from typing import TypeVar


Item = TypeVar("Item")


def counting_sort(
    values: Iterable[Item],
    *,
    key: Callable[[Item], int] = lambda item: item,
    maximum_range: int = 1_000_000,
) -> list[Item]:
    items = list(values)
    if not items:
        return []

    keys = [key(item) for item in items]
    if not all(isinstance(value, int) and not isinstance(value, bool) for value in keys):
        raise TypeError("counting-sort keys must be integers")

    low = min(keys)
    high = max(keys)
    span = high - low + 1
    if span > maximum_range:
        raise ValueError("key range exceeds configured counting-sort limit")

    counts = [0] * span
    for value in keys:
        counts[value - low] += 1

    for index in range(1, span):
        counts[index] += counts[index - 1]

    output: list[Item] = [items[0]] * len(items)
    for item, value in zip(reversed(items), reversed(keys)):
        bucket = value - low
        counts[bucket] -= 1
        output[counts[bucket]] = item

    return output


assert counting_sort([4, 2, 2, 8, 3, 3, 1]) == [1, 2, 2, 3, 3, 4, 8]
assert counting_sort([-2, 3, -2, 0]) == [-2, -2, 0, 3]
assert counting_sort([5, 5, 5]) == [5, 5, 5]
assert counting_sort([]) == []

records = [(2, "a"), (1, "x"), (2, "b"), (1, "y")]
assert counting_sort(records, key=lambda record: record[0]) == [
    (1, "x"), (1, "y"), (2, "a"), (2, "b")
]

try:
    counting_sort([0, 10_000_000], maximum_range=100)
    raise AssertionError("range guard did not fire")
except ValueError:
    pass
```

The placeholder initialization `output = [items[0]] * len(items)` is safe here.

Every output slot is overwritten exactly once before returning.

It avoids filtering out a sentinel value that could also be a legitimate record.

The algorithm can also rebuild raw integer values without stability.

That variant is useful for plain numbers when equal records carry no identity.

```python
def unstable_counting_sort(values: Iterable[int], *, maximum_range: int = 1_000_000) -> list[int]:
    items = list(values)
    if not items:
        return []
    if not all(isinstance(value, int) and not isinstance(value, bool) for value in items):
        raise TypeError("values must be integers")

    low = min(items)
    high = max(items)
    span = high - low + 1
    if span > maximum_range:
        raise ValueError("key range exceeds configured counting-sort limit")

    counts = [0] * span
    for value in items:
        counts[value - low] += 1

    result: list[int] = []
    for offset, frequency in enumerate(counts):
        result.extend([low + offset] * frequency)
    return result


assert unstable_counting_sort([4, 2, 2, 8, 3, 3, 1]) == [1, 2, 2, 3, 3, 4, 8]
```

Use the stable version when sorting records.

Use the reconstruction version only when the value itself is the entire item.

For input validation, the range guard is not optional.

A malicious or accidental span of billions can exhaust memory before sorting begins.

For lower-level languages, compute `high - low + 1` in a type wide enough to avoid overflow.

In C or C++, signed overflow during span calculation can turn a rejected input into an unsafe allocation.

In JavaScript, remember that `number` is floating-point.

If exact 64-bit integer keys matter, use `BigInt` or a different strategy.

Differential testing compares counting sort against a trusted stable sort.

```python
from random import Random


rng = Random(59)
for length in range(80):
    for _ in range(50):
        source = [rng.randrange(-30, 31) for _ in range(length)]
        assert counting_sort(source) == sorted(source)

tagged = [(rng.randrange(-5, 6), index) for index in range(200)]
assert counting_sort(tagged, key=lambda record: record[0]) == sorted(tagged, key=lambda record: record[0])
```

The second test matters because Python's `sorted` is stable.

It catches implementations that sort values correctly but scramble equal-key records.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of input items.

Let $k$ be the size of the observed integer key range.

Copying the iterable into a list costs $\Theta(n)$.

Computing keys costs $\Theta(n)$ key-function evaluations.

Finding `min` and `max` costs $\Theta(n)$.

Allocating the count array costs $\Theta(k)$.

Filling the frequency table costs $\Theta(n)$.

Converting frequencies into prefix boundaries costs $\Theta(k)$.

Stable placement costs $\Theta(n)$.

Therefore the total running time is:

$$
\Theta(n+k).
$$

The stable output array uses $\Theta(n)$ space.

The count array uses $\Theta(k)$ space.

The stored keys use $\Theta(n)$ space.

The implementation therefore uses $\Theta(n+k)$ auxiliary space.

The stored keys can be avoided if records are cheap to re-key during reverse traversal.

That trades memory for repeated key-function calls.

If key extraction is expensive, storing keys is usually better.

If records are huge and keys are cheap, recomputing may be better.

The unstable integer-only variant still returns an output list of size $n$.

Beyond the returned output, it needs only $\Theta(k)$ working space.

Counting sort is linear in $n$ only under a bounded-domain assumption.

If $k = O(n)$, the bound simplifies to $\Theta(n)$.

If $k = n^2$, the bound is $\Theta(n^2)$ even though there are only $n$ records.

If $k$ is a 32-bit or 64-bit address space, direct counting is normally not viable.

The comparison-sort lower bound does not apply because counting sort is not comparison-based.

It exploits numeric addressability.

The price is dependence on key range.

The algorithm's performance is distribution-sensitive, not just input-length-sensitive.

## 6. Systems Connections

Counting sort appears whenever systems convert events into bounded buckets.

A histogram over HTTP status codes is a frequency table.

A telemetry counter over latency buckets is a frequency table.

A radix-sort digit pass is a frequency table followed by stable prefix placement.

The same idea appears in compiler passes that group tokens by small enum tags.

It appears in graphics pipelines that bucket pixels by intensity or color channel.

It appears in databases when low-cardinality integer categories are aggregated.

The key difference is whether the system needs sorted records or only counts.

For pure aggregation, frequency counts may be the final answer.

For sorting, prefix positions turn counts into output addresses.

In external-memory systems, direct counting can be attractive when the histogram fits in memory.

The input can be streamed once to build counts.

A second pass or buffered placement can then produce ordered output.

For stable record sorting, however, the output-placement phase needs the records themselves.

That makes storage layout important.

In a columnar system, keys may be compact while records are large.

The implementation may sort record identifiers rather than entire records.

In a distributed system, each worker can build local counts.

Reducers can sum those counts into global bucket boundaries.

Workers then need assigned output ranges for each key.

Stable distributed counting sort additionally needs per-partition ordering rules.

The local order of equal keys must compose into the global order.

For untrusted input, the dangerous operation is allocation.

The span must be checked before creating `counts`.

The maximum range should be treated like a resource budget.

Coordinate compression is the usual alternative for sparse keys.

It maps observed keys to dense ranks.

But compression first needs a way to sort or map the distinct keys.

That may reintroduce $O(m\log m)$ work for $m$ distinct keys.

Counting sort is strongest when the dense domain already exists naturally.

Examples include bytes, grades, days of month, small enum values, and fixed-width radix digits.

## 7. Practice Checklist

- Confirm that every key is an integer.
- Reject booleans if the language treats them as integers.
- Compute `low`, `high`, and `span` before allocation.
- Guard `span` with an explicit memory budget.
- Offset negative keys by subtracting `low`.
- Count each input item exactly once.
- Verify that the sum of frequencies equals input length.
- Convert frequencies to inclusive prefix boundaries.
- Interpret each prefix as an exclusive bucket end.
- Traverse records from right to left for stable placement.
- Decrement the bucket boundary before writing.
- Test duplicate keys with attached identity tags.
- Test negative values.
- Test all-equal values.
- Test empty input.
- Test a range that should be rejected.
- Compare against a trusted stable sort on random data.
- Distinguish stable sorting from value reconstruction.
- Avoid direct counting for sparse huge identifiers.
- Consider coordinate compression when the distinct key set is small.
- Use radix sort only with a stable digit pass.
- In lower-level languages, avoid overflow in range arithmetic.
- Document the meaning of `maximum_range`.
- Keep key extraction deterministic during the whole sort.
- Do not mutate records while sorting by their keys.

## 8. Frequently Asked Questions

### Is counting sort comparison-based?

No.

It uses integer keys as addresses in a count array.

That is why it can avoid the $\Omega(n\log n)$ comparison lower bound.

### Why is counting sort not always faster than quicksort or merge sort?

Its cost includes the key range.

If the range is large and sparse, zeroing and scanning the count array dominates the work.

### Can counting sort handle negative numbers?

Yes.

Subtract the minimum key so the smallest observed key maps to counter index zero.

### Why does stable placement scan right to left?

The prefix table stores the right edge of each key bucket.

Scanning right to left gives later equal-key records the later positions first.

Earlier equal-key records then land to their left.

### What is the most common off-by-one mistake?

Using the prefix boundary as an output index before decrementing it.

The largest prefix boundary is $n$, but the largest valid output index is $n-1$.

### Can I sort strings with counting sort?

Directly, no.

You need bounded integer keys, such as character codes or radix-sort digit values.

### Why is stability important for radix sort?

Each digit pass must preserve the ordering created by previous digit passes.

Without stability, the final multi-digit ordering can be wrong.

### Should I use coordinate compression with counting sort?

Use it when keys are sparse but the number of distinct keys is manageable.

Remember that building the compressed key order has its own cost.

### Is the unstable version wrong?

Not for plain integer values.

It is wrong for records when equal keys carry different payloads that must keep input order.

### What should I monitor in production?

Track maximum observed span, allocation failures, rejected ranges, and whether callers rely on stable equal-key ordering.
