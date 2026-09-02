# Fenwick Tree: Binary Indexed Prefix Sums, Point Updates & Range Queries

![Fenwick tree binary indexed ranges](/images/dsa/fenwick-tree-dark.jpg#dark)

## 1. Historical Context & Motivation

A Fenwick tree stores prefix aggregates in an array using binary structure hidden inside indices.

It is also called a Binary Indexed Tree.

Peter Fenwick described the structure in 1994 for maintaining cumulative frequency tables.

The original motivation still feels modern.

You have an array of values.

Values change over time.

You need prefix sums and range sums quickly.

A plain prefix-sum array gives $O(1)$ range queries.

But a point update costs $O(n)$ because many later prefixes change.

A segment tree gives $O(\log n)$ updates and queries with explicit tree nodes.

A Fenwick tree gives the same common prefix-sum bounds with less memory and simpler constants.

It stores a compact implicit tree in one array.

The key trick is the least significant set bit.

For one-based index `i`, the value `i & -i` tells how large a suffix range `tree[i]` summarizes.

For example, index `12` in binary is `1100`.

Its least significant set bit is `4`.

So `tree[12]` stores a range of length four ending at position `12`.

The central question is:

How can binary index arithmetic maintain prefix information without building an explicit tree?

Fenwick trees are excellent for point updates plus prefix or range queries over associative invertible operations such as addition.

They are not a universal replacement for segment trees.

The operation and update pattern matter.

## 2. Core Mathematical Invariants

A Fenwick tree is usually written with one-based indices.

Let `bit[i]` store an aggregate over a range ending at `i`.

Define:

$$
lowbit(i)=i\ \&\ (-i).
$$

Then `bit[i]` covers:

$$
[i-lowbit(i)+1,\ i].
$$

The ranges are inclusive in one-based coordinates.

For zero-based user arrays, implementations usually translate index `p` to internal index `p + 1`.

The update invariant is:

When array position `p` changes by `delta`, every Fenwick bucket whose covered range contains `p+1` must receive `delta`.

Starting from `i = p + 1`, repeatedly add `lowbit(i)`:

```text
i += i & -i
```

This jumps to the next responsible bucket.

The prefix query invariant is:

To compute the sum of positions `0..p-1`, start at internal index `p`.

Repeatedly add `bit[i]` and clear the least significant set bit:

```text
i -= i & -i
```

Those visited buckets partition the prefix.

They do not overlap.

Together they cover exactly the requested prefix.

For range sum `[left, right)`, use:

$$
sum(left,right)=prefix(right)-prefix(left).
$$

That subtraction requires an invertible aggregate.

Addition works.

XOR works.

Minimum with arbitrary point updates does not work in the same simple form because there is no inverse for removing a prefix contribution.

The core invariant is that each `bit[i]` stores the exact aggregate for its lowbit-sized suffix.

Updates preserve that invariant by touching every bucket that includes the changed point.

Queries exploit that invariant by decomposing a prefix into those suffix buckets.

## 3. Step-by-Step Execution Trace

Use zero-based values:

```text
index: 0 1 2 3 4 5 6 7
value: 3 2 1 6 5 4 7 2
```

Internally, Fenwick indices are one-based:

```text
1..8
```

Build by adding each value.

Value `3` at external index `0` starts at internal index `1`.

Update `bit[1]`, then `bit[2]`, then `bit[4]`, then `bit[8]`.

Value `2` at external index `1` starts at internal index `2`.

Update `bit[2]`, then `bit[4]`, then `bit[8]`.

After all values are added, each bucket stores a range:

```text
bit[1] covers [1,1]
bit[2] covers [1,2]
bit[3] covers [3,3]
bit[4] covers [1,4]
bit[5] covers [5,5]
bit[6] covers [5,6]
bit[7] covers [7,7]
bit[8] covers [1,8]
```

Now query prefix length `6`, meaning external indices `0..5`.

Start at internal index `6`.

Add `bit[6]`, which covers internal range `[5,6]`.

Move to `6 - lowbit(6) = 4`.

Add `bit[4]`, which covers `[1,4]`.

Move to `0`.

The query stops.

The ranges `[1,4]` and `[5,6]` cover exactly internal positions `1..6`.

The result is:

```text
3 + 2 + 1 + 6 + 5 + 4 = 21
```

Now update external index `3` from `6` to `10`.

The delta is `4`.

Internal index is `4`.

Update `bit[4]` and `bit[8]`.

Only buckets whose ranges include position `4` change.

The new prefix length `6` result becomes `25`.

The query path is the same.

The bucket values are different.

Now trace inversion counting.

An inversion is a pair `(i, j)` where `i < j` but `a[i] > a[j]`.

Use values:

```text
[3, 1, 2]
```

Compress the values to ranks:

```text
1 -> 0
2 -> 1
3 -> 2
```

Scan left to right.

Before reading `3`, no earlier values exist.

Add rank `2` to the Fenwick frequency table.

Before reading `1`, one earlier value is greater than it.

That is `3`.

Add one inversion.

Add rank `0`.

Before reading `2`, one earlier value is greater than it.

That is again `3`.

Add one inversion.

The total is `2`.

The Fenwick tree is not sorting the array.

It is maintaining prefix counts over ranks while the scan asks order-statistics questions.

## 4. Production-Ready Implementations

The implementation below supports point-add updates and half-open range sums.

It accepts an initial array and builds in $O(n\log n)$ using repeated updates.

```python
class FenwickTree:
    def __init__(self, values: list[int]) -> None:
        self.bit = [0] * (len(values) + 1)
        for index, value in enumerate(values):
            self.add(index, value)

    def __len__(self) -> int:
        return len(self.bit) - 1

    def _check_index(self, index: int) -> None:
        if not 0 <= index < len(self):
            raise IndexError("Fenwick index out of range")

    def add(self, index: int, delta: int) -> None:
        self._check_index(index)
        i = index + 1
        while i < len(self.bit):
            self.bit[i] += delta
            i += i & -i

    def prefix_sum(self, count: int) -> int:
        if not 0 <= count <= len(self):
            raise IndexError("Fenwick prefix length out of range")
        total = 0
        i = count
        while i > 0:
            total += self.bit[i]
            i -= i & -i
        return total

    def range_sum(self, left: int, right: int) -> int:
        if not 0 <= left <= right <= len(self):
            raise IndexError("invalid Fenwick range")
        return self.prefix_sum(right) - self.prefix_sum(left)


tree = FenwickTree([3, 2, 1, 6, 5, 4, 7, 2])
assert tree.prefix_sum(6) == 21
assert tree.range_sum(2, 6) == 16
tree.add(3, 4)
assert tree.prefix_sum(6) == 25
assert tree.range_sum(3, 4) == 10
```

A Fenwick tree can also find the smallest prefix whose sum reaches a target when all values are nonnegative.

```python
def lower_bound_prefix(tree: FenwickTree, target: int) -> int:
    if target <= 0:
        return 0
    index = 0
    bit_mask = 1
    while bit_mask * 2 < len(tree.bit):
        bit_mask *= 2

    running = 0
    while bit_mask:
        next_index = index + bit_mask
        if next_index < len(tree.bit) and running + tree.bit[next_index] < target:
            running += tree.bit[next_index]
            index = next_index
        bit_mask //= 2
    return min(index, len(tree))


freq = FenwickTree([2, 0, 3, 1, 4])
assert lower_bound_prefix(freq, 1) == 0
assert lower_bound_prefix(freq, 3) == 2
assert lower_bound_prefix(freq, 6) == 3
assert lower_bound_prefix(freq, 11) == 5
```

The lower-bound search depends on nonnegative frequencies.

If values can be negative, prefix sums are not monotonic.

Binary lifting over Fenwick buckets no longer answers the question correctly.

Production APIs should state that precondition clearly.

For construction, an $O(n)$ build exists by pushing each bucket's value to its parent.

Repeated `add` is often simple enough unless construction time dominates.

```python
def build_fenwick_linear(values: list[int]) -> list[int]:
    bit = [0] + values[:]
    for i in range(1, len(bit)):
        parent = i + (i & -i)
        if parent < len(bit):
            bit[parent] += bit[i]
    return bit


fast_bit = build_fenwick_linear([3, 2, 1, 6, 5, 4, 7, 2])
slow_tree = FenwickTree([3, 2, 1, 6, 5, 4, 7, 2])
assert fast_bit == slow_tree.bit
```

The linear build works because each bucket contributes to the next larger bucket that contains it.

It is useful when the initial array is known all at once.

It does not replace point updates after construction.

## 5. Asymptotic Time & Space Complexity

Every Fenwick update climbs through indices by adding the least significant set bit.

Each step clears or advances through one binary scale.

There are at most $\lfloor \log_2 n \rfloor + 1$ relevant scales.

So point update costs:

$$
O(\log n).
$$

Prefix query repeatedly removes the least significant set bit.

It also costs:

$$
O(\log n).
$$

Range sum uses two prefix queries.

It is still $O(\log n)$.

The tree array has length $n+1$.

Space complexity is:

$$
O(n).
$$

Repeated-update construction costs $O(n\log n)$.

Linear construction costs $O(n)$.

Lower-bound prefix search costs $O(\log n)$.

The constant factors are small.

Fenwick trees usually use less memory than segment trees.

They are also often faster for simple prefix sums.

Segment trees are more flexible.

They handle range minimum, lazy range updates, custom aggregates, and richer queries more naturally.

Fenwick trees are narrow and elegant.

Use them when the operation fits.

Range-update variants change what the tree stores.

For range add and point query, store a difference array in the Fenwick tree.

To add `delta` over `[left, right)`, add `delta` at `left` and `-delta` at `right`.

Then the point value at index `i` is the prefix sum through `i + 1`.

For range add and range sum, two Fenwick trees can maintain the weighted difference formula.

That variant is powerful but easier to get wrong.

When lazy propagation or custom aggregates are needed, a segment tree is often clearer.

## 6. Systems Connections

Fenwick trees are common in frequency-table problems.

They can maintain counts while answering "how many items are less than this key?"

That supports inversion counting.

It also supports online ranking over compressed coordinates.

Compression matters because Fenwick indices must be dense.

Large sparse keys should be mapped to ranks before use.

Order-statistics queries use the lower-bound prefix search.

Given cumulative frequencies, find the key whose cumulative count reaches a target rank.

This appears in sampling, leaderboards, and percentile-like workflows when updates are frequent.

Subtree queries on static trees can use Euler-tour flattening plus a Fenwick tree.

The tree structure becomes a range over entry times.

Point updates to node values become Fenwick updates.

Subtree sums become Fenwick range sums.

Fenwick trees also appear in offline algorithms.

Sort events by one coordinate.

Sweep through them.

Use a Fenwick tree over another compressed coordinate.

The structure is small enough that it is often preferred in contest and systems prototypes.

The main production concern is preconditions.

The operation must support the needed prefix subtraction.

The indices must be bounded and dense.

The numeric type must not overflow under accumulated sums.

Fenwick trees also show up in arithmetic coding and cumulative frequency models.

The original cumulative-table motivation matters there.

Frequencies change as symbols are observed.

The encoder needs cumulative counts to map symbols into ranges.

Fenwick updates and prefix searches fit that model naturally.

Again, the nonnegative-frequency precondition is essential for prefix search.

A negative count would make cumulative rank lookup meaningless.

## 7. Practice Checklist

- Use one-based indices internally.
- Translate external index `p` to internal index `p + 1`.
- Remember that `i & -i` gives the covered range size.
- Treat `bit[i]` as a suffix ending at `i`.
- Update by adding `lowbit(i)`.
- Query by subtracting `lowbit(i)`.
- Use half-open ranges `[left, right)` in public APIs.
- Validate prefix lengths separately from element indices.
- Coordinate-compress sparse keys before indexing.
- Use a wide numeric type for accumulated sums.
- Do not use simple range subtraction for noninvertible operations.
- Require nonnegative values for prefix lower-bound search.
- Test index zero.
- Test the last index.
- Test empty-prefix queries.
- Test full-prefix queries.
- Test point updates followed by overlapping ranges.
- Compare against a plain array on random operations.
- Consider a segment tree when operations are not prefix-sum-like.
- Document whether construction is $O(n)$ or $O(n\log n)$.
- Use linear build when the full initial array is available.
- Use repeated updates when values arrive online.
- For inversion counting, query how many previous ranks are greater.
- For range add and point query, store differences.
- Keep prefix-search frequencies nonnegative.
- Test linear build against repeated-update build.
- Test coordinate compression with duplicate values.

## 8. Frequently Asked Questions

### Why is it called a Binary Indexed Tree?

The structure uses binary properties of indices to decide which ranges each array cell stores.

The tree is implicit in the index arithmetic.

### Why use one-based indexing?

The lowbit operation works cleanly with one-based indices.

Index zero would never advance during updates.

### What does `i & -i` mean?

It isolates the least significant set bit of `i`.

That value is the size of the range represented by `bit[i]`.

### Can a Fenwick tree answer range sums?

Yes.

Use `prefix_sum(right) - prefix_sum(left)` for the half-open range `[left, right)`.

### Can it handle range minimum queries?

Not with the same simple update/query logic for arbitrary point updates.

Use a segment tree unless the problem has special monotonic constraints.

### Why coordinate-compress values?

Fenwick indices must be dense array positions.

Sparse keys like large IDs waste memory unless mapped to compact ranks.

### When is a segment tree better?

Use a segment tree for more general range aggregates, lazy propagation, or noninvertible operations.

### What is the most common bug?

Mixing zero-based and one-based indices.

Most wrong Fenwick implementations are off by one in update or query boundaries.

### What should a diagram show?

Show each `bit[i]` cell covering a lowbit-sized suffix and show how query buckets partition a prefix.
