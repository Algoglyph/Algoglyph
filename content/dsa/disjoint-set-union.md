# Disjoint Set Union: Representatives, Path Compression & Near-Constant Connectivity

![Disjoint set union forest](/images/dsa/disjoint-set-union-dark.png#dark)

## 1. Historical Context & Motivation

Disjoint Set Union stores a partition of elements into non-overlapping groups.

It is also called union-find.

The structure answers two questions efficiently.

Which group contains this element?

Can these two groups be merged?

Those questions appear whenever connectivity changes over time.

Kruskal's minimum spanning tree algorithm uses DSU to decide whether an edge connects two different components.

Network membership systems use the same idea when components merge.

Image segmentation can group neighboring pixels into regions.

Offline query algorithms use DSU to merge sets as constraints become active.

The data structure is intentionally narrow.

It does not list all members of a set quickly.

It does not split a set after merging.

It optimizes repeated `find` and `union` operations.

The core trick is to represent each set as a rooted tree.

The root is the representative of the set.

Every element points upward toward the representative.

Two elements are in the same set if their representatives are equal.

Naive trees can become long chains.

Long chains make `find` slow.

Union by size or rank keeps trees shallow.

Path compression flattens trees during lookup.

Together those heuristics make DSU effectively constant time for practical workloads.

The central question is:

How can a mutable forest represent connected components while keeping repeated representative lookups cheap?

## 2. Core Mathematical Invariants

At any moment, the elements are partitioned into disjoint sets.

Each element belongs to exactly one set.

Each set has one representative root.

In the parent-array representation, `parent[x] == x` means `x` is a root.

If `parent[x] != x`, following parent pointers eventually reaches a root.

The `find(x)` operation returns that root.

The partition invariant is:

$$
find(a)=find(b)
$$

if and only if `a` and `b` are currently in the same set.

The `union(a, b)` operation finds both representatives.

If the representatives are equal, the partition does not change.

If they differ, one root becomes the parent of the other root.

That merges exactly two sets into one.

No element is lost.

No element joins two sets.

Union by size attaches the smaller tree under the larger tree.

If `size[root]` stores the number of elements in a root's set, then after merging roots `ra` and `rb`:

$$
size[newRoot]=size[ra]+size[rb].
$$

Only root sizes are authoritative.

The size stored at a non-root may be stale or unused.

Union by rank stores an upper bound on tree height instead of exact set size.

Path compression changes parent pointers during `find`.

It preserves representatives.

It only shortens paths to the same root.

After `find(x)`, `x` can point directly to the representative.

The partition is unchanged because every compressed node stays in the same set.

The key invariant is that only roots are linked during union.

Linking arbitrary non-root nodes can corrupt sizes, ranks, and representatives.

## 3. Step-by-Step Execution Trace

Start with elements `0` through `5`.

Initially every element is its own set:

```text
parent: [0, 1, 2, 3, 4, 5]
size:   [1, 1, 1, 1, 1, 1]
```

Perform `union(0, 1)`.

`find(0)` returns `0`.

`find(1)` returns `1`.

Attach `1` under `0`.

```text
parent: [0, 0, 2, 3, 4, 5]
size:   [2, 1, 1, 1, 1, 1]
```

Perform `union(2, 3)`.

Attach `3` under `2`.

```text
parent: [0, 0, 2, 2, 4, 5]
size:   [2, 1, 2, 1, 1, 1]
```

Perform `union(1, 3)`.

`find(1)` follows `1 -> 0` and returns `0`.

`find(3)` follows `3 -> 2` and returns `2`.

Both sets have size two.

Choose `0` as the new root and attach `2` under `0`.

```text
parent: [0, 0, 0, 2, 4, 5]
size:   [4, 1, 2, 1, 1, 1]
```

Element `3` still points to `2`.

Element `2` now points to `0`.

So `find(3)` follows:

```text
3 -> 2 -> 0
```

Path compression rewrites `3` to point directly to `0`.

After `find(3)`:

```text
parent: [0, 0, 0, 0, 4, 5]
```

The represented set did not change.

Only the path became shorter.

Now `connected(0, 3)` is true.

`connected(0, 5)` is false.

After `union(4, 5)`, there are two components:

```text
{0, 1, 2, 3}
{4, 5}
```

After `union(3, 4)`, every element belongs to one component.

The forest shape is an implementation detail.

The representatives define the abstract partition.

Now consider a failed merge.

Calling `union(0, 2)` after those earlier unions finds the same representative for both elements.

The operation should return false or otherwise report that no merge occurred.

It should not decrement the component count.

It should not add the edge to a spanning tree.

This distinction is exactly what Kruskal's algorithm needs.

An accepted union means an edge connected two components.

A rejected union means the edge stayed inside one component and would create a cycle.

## 4. Production-Ready Implementations

The implementation below uses path compression and union by size.

It validates element indices.

It returns whether a union actually merged two previously separate sets.

```python
class DisjointSetUnion:
    def __init__(self, n: int) -> None:
        if n < 0:
            raise ValueError("size must be nonnegative")
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def _check(self, x: int) -> None:
        if not 0 <= x < len(self.parent):
            raise IndexError("DSU element out of range")

    def find(self, x: int) -> int:
        self._check(x)
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a: int, b: int) -> bool:
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False

        if self.size[root_a] < self.size[root_b]:
            root_a, root_b = root_b, root_a

        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        self.components -= 1
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.find(a) == self.find(b)

    def component_size(self, x: int) -> int:
        return self.size[self.find(x)]


dsu = DisjointSetUnion(6)
assert dsu.union(0, 1)
assert dsu.union(2, 3)
assert dsu.union(1, 3)
assert dsu.connected(0, 3)
assert not dsu.connected(0, 5)
assert dsu.component_size(2) == 4
assert not dsu.union(0, 3)
```

Kruskal's algorithm uses DSU to reject edges that would close a cycle.

```python
def kruskal_weight(n: int, edges: list[tuple[int, int, int]]) -> int:
    dsu = DisjointSetUnion(n)
    total = 0
    used = 0
    for weight, u, v in sorted(edges):
        if dsu.union(u, v):
            total += weight
            used += 1
    if used != n - 1:
        raise ValueError("graph is disconnected")
    return total


edges = [
    (1, 0, 1),
    (4, 0, 2),
    (2, 1, 2),
    (5, 1, 3),
    (3, 2, 3),
]
assert kruskal_weight(4, edges) == 6
```

For extremely deep historical trees, recursive `find` can hit recursion limits.

An iterative two-pass find avoids that risk.

```python
def find_iterative(parent: list[int], x: int) -> int:
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != x:
        next_x = parent[x]
        parent[x] = root
        x = next_x
    return root


parents = [0, 0, 1, 2]
assert find_iterative(parents, 3) == 0
assert parents == [0, 0, 0, 0]
```

Use recursive `find` for clarity when input sizes are moderate and trees are kept shallow.

Use iterative `find` when the environment cannot tolerate recursion depth risk.

In concurrent code, DSU updates require synchronization.

Path compression writes during reads, so even `find` is not purely read-only.

If stable component names are required, wrap DSU behind a mapping layer.

For example, an application may choose the smallest member as a display label.

That label should be maintained separately from the representative root.

Union by size may choose a different root than the display label.

Mixing those ideas causes subtle UI and persistence bugs.

The root is for fast connectivity.

The label is for humans or external contracts.

## 5. Asymptotic Time & Space Complexity

Without heuristics, DSU can degrade to linear-time `find`.

A sequence of unlucky unions can form a chain of length $n$.

Union by size prevents small trees from becoming ancestors of large trees.

Every time a node's depth increases under union by size, the size of its containing tree at least doubles.

That alone keeps height $O(\log n)$.

Path compression flattens lookup paths after they are used.

With both union by size or rank and path compression, a sequence of $m$ operations on $n$ elements costs:

$$
O((m+n)\alpha(n)).
$$

Here $\alpha(n)$ is the inverse Ackermann function.

It grows so slowly that it is less than five for any realistic input size.

That is why DSU is often described as near-constant time.

The phrase "near-constant" should not hide the actual theorem.

The amortized cost is not worst-case $O(1)$ per operation.

It is $O(\alpha(n))$ amortized.

Initialization costs $O(n)$.

The parent array uses $O(n)$ space.

The size or rank array uses $O(n)$ space.

The component counter uses $O(1)$ space.

Kruskal's algorithm sorts edges first.

For $E$ edges, sorting costs $O(E\log E)$.

The DSU work after sorting is almost linear.

So the sort usually dominates Kruskal's running time.

Rollback DSU changes the complexity trade-off.

It usually disables path compression because compression rewrites many parent pointers that would need to be undone.

Rollback variants commonly keep union by size and record parent and size changes on a stack.

That gives predictable undo behavior.

The standard DSU in this article is not that structure.

Its path compression is designed for monotonic merge-only workloads.

## 6. Systems Connections

DSU is a dynamic connectivity structure for merge-only workloads.

It shines when components only combine.

It does not support efficient deletion or splitting.

Network cables being added to a system are a fit.

Network cables being added and removed need a more powerful dynamic graph structure.

Image processing uses DSU in connected-component labeling.

Neighboring pixels or cells are unioned when they share a region.

After processing, each region has a representative.

Compilers and static-analysis tools use union-find in unification problems.

Two type variables can be merged when constraints say they must be equal.

Database and data-cleaning systems use related ideas for entity resolution.

Records believed to represent the same real entity are merged into equivalence classes.

Constraint solvers use DSU for equality constraints.

If `a = b` and `b = c`, then all three names share one representative.

Rollback DSU appears in offline algorithms where time ranges are processed recursively.

It records changes so unions can be undone after a segment of the computation.

That is a specialized extension.

Plain DSU should be treated as merge-only.

Operationally, DSU is compact and cache-friendly because it stores integer arrays.

It is usually faster than pointer-heavy component structures.

The main correctness risk is treating representative IDs as stable names.

Representatives can change after union.

External systems should not store a root as a permanent component identifier unless the API guarantees that behavior.

A monitoring system can expose DSU health with a few simple counters.

Track `components`.

Track attempted unions.

Track successful unions.

Track maximum observed tree depth in debug builds.

If maximum depth keeps growing unexpectedly, union by size or path compression may not be wired correctly.

If successful unions exceed `n - 1`, component accounting is wrong.

Those checks are cheap ways to catch invariant drift in integration tests.

DSU also has a useful empty-structure edge case.

A DSU with zero elements is valid if the application has no vertices yet.

Every `find` or `union` call should reject indices cleanly.

That behavior is better than special-casing zero-size graphs throughout the caller.

For one element, every valid connectivity query is trivially true.

The first successful union cannot happen until a second element exists.

## 7. Practice Checklist

- Initialize every element as its own parent.
- Treat `parent[x] == x` as the root test.
- Call `find` before comparing components.
- Link only roots during union.
- Use union by size or rank.
- Compress paths during `find`.
- Remember that path compression mutates parent arrays.
- Keep sizes authoritative only at roots.
- Return whether `union` actually merged two sets.
- Track component count when needed.
- Validate indices before array access.
- Test repeated union of already connected elements.
- Test transitive connectivity.
- Test singleton component size.
- Test invalid indices.
- Use iterative `find` when recursion depth is a concern.
- Do not use plain DSU when components must split.
- Do not expose roots as stable public IDs without a contract.
- Synchronize mutations in concurrent code.
- For Kruskal, sort edges before using DSU.
- Keep display labels separate from representative roots.
- Do not decrement component count when roots are already equal.
- Use rollback DSU only when undo is part of the problem.
- Avoid path compression in rollback variants unless every write is logged.
- Test that successful unions are at most `n - 1`.
- Test zero-element construction if the API permits it.
- Test a one-element DSU.
- Verify that every rejected index leaves the structure unchanged.

## 8. Frequently Asked Questions

### What does `find` return?

It returns the representative root of the set containing the element.

Two elements are connected when their representatives are equal.

### Is the representative meaningful?

Usually no.

It is an implementation-selected root, not necessarily the smallest or earliest element.

### Why use union by size?

It attaches the smaller tree under the larger tree.

That prevents long chains from forming easily.

### What does path compression do?

It rewrites nodes on a lookup path to point directly to the root.

Future lookups become shorter.

### Is `find` read-only?

Not with path compression.

It changes parent pointers while preserving the represented partition.

### Can DSU remove an edge?

Plain DSU cannot split components efficiently.

Use another dynamic connectivity structure or an offline rollback technique when deletions matter.

### Why is DSU useful in Kruskal's algorithm?

It quickly tells whether adding an edge would connect two different components or create a cycle.

### What is the actual time complexity?

With path compression and union by size or rank, operations are $O(\alpha(n))$ amortized.

That is effectively constant for real input sizes, but it is not literally worst-case $O(1)$.

### What is the most common bug?

Updating parents without first finding both roots.

That can attach a node inside one tree to another tree and corrupt the intended representative structure.
