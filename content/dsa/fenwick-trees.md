# Fenwick Trees: Range Variants, Coordinate Compression & Multidimensional Prefixes

## 1. Historical Context & Motivation

Fenwick trees are compact data structures for maintaining prefix-based aggregates under updates.

The basic Binary Indexed Tree handles point updates and prefix sums.

The broader family handles more patterns.

Range updates can be converted into point effects with difference arrays.

Range sums under range updates can be maintained with two coordinated Fenwick trees.

Two-dimensional grids can use nested binary-indexed structure.

Sparse coordinate domains can be compressed before indexing.

Order statistics can be answered by searching cumulative frequencies.

These variants matter because real problems rarely arrive in the exact textbook shape.

A problem may ask for many rectangle sums.

Another may ask for online rank queries over arbitrary keys.

Another may ask for adding a value to every element in a subarray and querying sums later.

A segment tree can solve many of those tasks.

A Fenwick tree can solve a narrower set with less code and lower memory.

The challenge is recognizing when the narrower structure fits.

The central question is:

How far can lowbit-based prefix decomposition be extended before a segment tree or another structure becomes the cleaner tool?

The answer depends on whether the operation can be expressed through prefix differences.

When it can, Fenwick trees are elegant.

When it cannot, forcing the structure usually creates fragile code.

## 2. Core Mathematical Invariants

A one-dimensional Fenwick tree stores bucket aggregates determined by the least significant set bit.

For internal one-based index `i`, bucket `i` covers:

$$
[i-lowbit(i)+1,\ i].
$$

The query path decomposes a prefix into disjoint such buckets.

The update path touches all buckets that contain the updated point.

Range variants preserve that prefix idea by changing what is stored.

For range add and point query, store a difference array `diff`.

Adding `delta` to `[left, right)` means:

```text
diff[left] += delta
diff[right] -= delta
```

The actual value at index `i` is:

$$
prefixDiff(i+1).
$$

For range add and range sum, one Fenwick tree is not enough.

The prefix sum after range additions can be written as:

$$
prefix(x)=x\cdot sum(B_1,x)-sum(B_2,x).
$$

The two trees `B1` and `B2` store coefficients that make this formula true.

To add `delta` over one-based inclusive range `[l,r]`:

```text
B1[l] += delta
B1[r+1] -= delta
B2[l] += delta * (l - 1)
B2[r+1] -= delta * r
```

Then range sum is still prefix difference.

For a two-dimensional Fenwick tree, each cell `(x,y)` participates in buckets along both dimensions.

Point update climbs by lowbit in `x` and `y`.

Rectangle query uses inclusion-exclusion over four prefixes.

The invariant is always the same:

Queries must be decomposable into Fenwick prefix buckets.

Updates must know exactly which buckets their contribution affects.

## 3. Step-by-Step Execution Trace

Trace range add and point query on an array of five zeros.

Start with:

```text
[0, 0, 0, 0, 0]
```

Add `3` to range `[1, 4)`.

The logical result should be:

```text
[0, 3, 3, 3, 0]
```

Instead of updating three array positions, update the difference structure:

```text
diff[1] += 3
diff[4] -= 3
```

A Fenwick tree stores those difference events.

Point query at index `2` asks for prefix difference through `3`.

It includes the `+3` event at index `1`.

It does not include the `-3` event at index `4`.

So the answer is `3`.

Point query at index `4` asks for prefix difference through `5`.

It includes both `+3` and `-3`.

So the answer is `0`.

Now trace range add and range sum.

Start again from zeros of length five.

Add `3` to `[1,4)`.

The sum over `[0,5)` should be `9`.

The sum over `[2,4)` should be `6`.

The two-tree formula turns range updates into prefix-sum coefficients.

The query `prefix(4)` returns the sum of positions `0..3`.

The query `prefix(1)` returns the sum of position `0`.

Their difference gives `[1,4)`.

This is why Fenwick variants feel strange at first.

The tree is not storing final values directly.

It is storing enough prefix coefficients to reconstruct the requested answer.

Now trace coordinate compression.

Suppose updates refer to keys:

```text
1000000000, 50, 700, 50
```

Direct indexing would require an enormous array.

Compression sorts the distinct keys:

```text
[50, 700, 1000000000]
```

Then it maps them to ranks:

```text
50 -> 0
700 -> 1
1000000000 -> 2
```

The Fenwick tree stores counts over ranks `0..2`.

Queries such as "how many keys are at most 700?" become prefix queries through rank `2`.

The numeric key values are preserved in the mapping table.

The Fenwick tree only needs dense positions.

## 4. Production-Ready Implementations

The first implementation supports range add and point query.

It wraps a Fenwick tree over a difference array.

```python
class Fenwick:
    def __init__(self, n: int) -> None:
        if n < 0:
            raise ValueError("size must be nonnegative")
        self.bit = [0] * (n + 1)

    def add(self, index: int, delta: int) -> None:
        if not 0 <= index < len(self.bit) - 1:
            raise IndexError("index out of range")
        i = index + 1
        while i < len(self.bit):
            self.bit[i] += delta
            i += i & -i

    def prefix(self, count: int) -> int:
        if not 0 <= count <= len(self.bit) - 1:
            raise IndexError("prefix length out of range")
        total = 0
        i = count
        while i > 0:
            total += self.bit[i]
            i -= i & -i
        return total


class RangeAddPointQuery:
    def __init__(self, n: int) -> None:
        self.n = n
        self.diff = Fenwick(n + 1)

    def add_range(self, left: int, right: int, delta: int) -> None:
        if not 0 <= left <= right <= self.n:
            raise IndexError("invalid range")
        if left < right:
            self.diff.add(left, delta)
            self.diff.add(right, -delta)

    def get(self, index: int) -> int:
        if not 0 <= index < self.n:
            raise IndexError("index out of range")
        return self.diff.prefix(index + 1)


point = RangeAddPointQuery(5)
point.add_range(1, 4, 3)
assert [point.get(i) for i in range(5)] == [0, 3, 3, 3, 0]
```

The next implementation supports range add and range sum using two Fenwick trees.

It exposes zero-based half-open ranges but converts internally to one-based arithmetic.

```python
class RangeAddRangeSum:
    def __init__(self, n: int) -> None:
        self.n = n
        self.b1 = Fenwick(n + 1)
        self.b2 = Fenwick(n + 1)

    def _add_one_based(self, index: int, delta1: int, delta2: int) -> None:
        if index <= self.n + 1:
            self.b1.add(index - 1, delta1)
            self.b2.add(index - 1, delta2)

    def add_range(self, left: int, right: int, delta: int) -> None:
        if not 0 <= left <= right <= self.n:
            raise IndexError("invalid range")
        if left == right:
            return
        l = left + 1
        r = right
        self._add_one_based(l, delta, delta * (l - 1))
        self._add_one_based(r + 1, -delta, -delta * r)

    def prefix_sum(self, count: int) -> int:
        if not 0 <= count <= self.n:
            raise IndexError("prefix length out of range")
        x = count
        return x * self.b1.prefix(x) - self.b2.prefix(x)

    def range_sum(self, left: int, right: int) -> int:
        if not 0 <= left <= right <= self.n:
            raise IndexError("invalid range")
        return self.prefix_sum(right) - self.prefix_sum(left)


ranges = RangeAddRangeSum(5)
ranges.add_range(1, 4, 3)
assert ranges.range_sum(0, 5) == 9
assert ranges.range_sum(2, 4) == 6
ranges.add_range(0, 2, 5)
assert [ranges.range_sum(i, i + 1) for i in range(5)] == [5, 8, 3, 3, 0]
```

A two-dimensional Fenwick tree handles point updates and rectangle sums.

```python
class Fenwick2D:
    def __init__(self, rows: int, cols: int) -> None:
        self.rows = rows
        self.cols = cols
        self.bit = [[0] * (cols + 1) for _ in range(rows + 1)]

    def add(self, row: int, col: int, delta: int) -> None:
        r = row + 1
        while r <= self.rows:
            c = col + 1
            while c <= self.cols:
                self.bit[r][c] += delta
                c += c & -c
            r += r & -r

    def prefix(self, rows: int, cols: int) -> int:
        total = 0
        r = rows
        while r > 0:
            c = cols
            while c > 0:
                total += self.bit[r][c]
                c -= c & -c
            r -= r & -r
        return total

    def rectangle_sum(self, r1: int, c1: int, r2: int, c2: int) -> int:
        return (
            self.prefix(r2, c2)
            - self.prefix(r1, c2)
            - self.prefix(r2, c1)
            + self.prefix(r1, c1)
        )


grid = Fenwick2D(3, 3)
grid.add(0, 0, 5)
grid.add(1, 2, 7)
assert grid.rectangle_sum(0, 0, 2, 3) == 12
assert grid.rectangle_sum(1, 2, 2, 3) == 7
```

The code keeps public ranges half-open.

That convention matches Python slicing and avoids inclusive-boundary confusion.

The internal formulas still use one-based Fenwick arithmetic.

For compressed coordinates, keep the sorted coordinate list beside the tree.

Use binary search to translate query thresholds to prefix lengths.

If online updates introduce unseen keys, a fixed compressed Fenwick tree cannot simply grow in sorted order.

Use an offline collection step, a balanced tree, or a dynamic segment tree for that setting.

## 5. Asymptotic Time & Space Complexity

A one-dimensional Fenwick operation costs $O(\log n)$.

Range add and point query performs two updates.

Its update cost is $O(\log n)$.

Its point query cost is $O(\log n)$.

Range add and range sum uses two Fenwick trees.

Its range update performs four internal point updates.

Its range query performs two prefix queries, each touching both trees.

The asymptotic cost remains:

$$
O(\log n).
$$

The constant factor is larger than the basic tree.

Space is $O(n)$ for one tree and $O(n)$ for two trees.

Two-dimensional Fenwick trees cost:

$$
O(\log R \log C)
$$

per point update or rectangle query on an $R$ by $C$ grid.

Their memory is $O(RC)$ in the dense form.

That can be too large for sparse grids.

Sparse two-dimensional Fenwick structures use maps or coordinate compression.

They reduce memory for sparse updates but increase implementation complexity and constants.

Coordinate compression costs $O(m\log m)$ to sort unique coordinates for $m$ observed keys.

After compression, Fenwick operations run on dense ranks.

The complexity remains logarithmic in the number of compressed coordinates.

## 6. Systems Connections

Fenwick variants are useful in analytics pipelines that maintain cumulative counts.

A leaderboard can maintain score frequencies and find rank thresholds.

A telemetry system can maintain counts by compressed latency bucket.

A geometric sweep can maintain active y-coordinates while events move across x-coordinates.

Two-dimensional Fenwick trees can support mutable heatmaps when the grid is not too large.

Subtree update/query problems use Euler-tour flattening plus range variants.

Adding a bonus to every employee under one manager becomes a range update.

Reading one employee's effective bonus becomes a point query.

Reading the total under a manager needs range sum support.

The systems danger is hidden coordinate growth.

If a service accepts arbitrary user IDs and uses them directly as Fenwick indices, memory explodes.

Compression or a different map-based structure is required.

Another danger is choosing the variant by habit.

Range add plus point query needs one difference tree.

Point add plus range sum needs one normal tree.

Range add plus range sum needs two trees or a segment tree.

Rectangle updates and rectangle queries in two dimensions require still more structure.

The right choice should be written down before code begins.

Compression also affects API honesty.

If all query coordinates are known up front, compression is clean.

If queries arrive forever, rebuilding compression after each new key is usually too expensive.

That is not a Fenwick failure.

It is a mismatch between a static dense index structure and an open-ended key universe.

## 7. Practice Checklist

- Identify the update type before choosing the variant.
- Identify the query type before choosing the variant.
- Use one Fenwick tree for point add and range sum.
- Use one difference Fenwick tree for range add and point query.
- Use two Fenwick trees for range add and range sum.
- Use inclusion-exclusion for rectangle sums.
- Coordinate-compress sparse keys.
- Keep public ranges half-open where possible.
- Translate carefully into one-based internal indices.
- Test empty ranges.
- Test range updates touching index zero.
- Test range updates touching the final index.
- Test overlapping range updates.
- Test negative deltas.
- Test two-dimensional corner rectangles.
- Compare against a brute-force array on random operations.
- Require nonnegative frequencies for rank search.
- Use wide numeric types for accumulated coefficients.
- Prefer a segment tree when operations are not prefix-difference friendly.
- Document which Fenwick variant is implemented.
- Keep the compression map sorted.
- Use binary search for threshold-to-rank queries.
- Do not pretend static compression supports arbitrary unseen online keys.
- Test duplicate compressed coordinates.
- Test thresholds below the minimum and above the maximum.

## 8. Frequently Asked Questions

### Why have both `fenwick-tree` and `fenwick-trees` as topics?

The singular topic covers the core Binary Indexed Tree.

The plural topic is a useful place for variants: range updates, multidimensional trees, compression, and prefix searching.

### Can one Fenwick tree handle range updates and range sums?

Not directly with the usual simple formula.

Use two Fenwick trees or a segment tree.

### Why does range add and point query use a difference array?

A range addition can be represented as two boundary events.

A prefix sum over those events gives the value at a point.

### Why does the two-tree formula work?

It stores coefficients so the prefix sum after range additions can be reconstructed as `x * sum(B1, x) - sum(B2, x)`.

### Can Fenwick trees be multidimensional?

Yes.

Each dimension adds another logarithmic factor and usually multiplies memory.

### When should I coordinate-compress?

Compress when keys are sparse but all possible queried keys are known ahead of time or can be collected offline.

### Are Fenwick trees better than segment trees?

They are smaller and simpler for prefix-friendly operations.

Segment trees are better for more general range operations.

### What is the most common variant bug?

Mixing inclusive one-based formulas with half-open zero-based public ranges.

Write down the conversion before coding.
