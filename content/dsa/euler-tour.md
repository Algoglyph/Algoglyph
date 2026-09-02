# Euler Tour: Tree Flattening, Entry Times & Subtree Query Intervals

![Euler tour tree traversal intervals](/images/dsa/euler-tour-dark.png#dark)

## 1. Historical Context & Motivation

An Euler tour records a walk through a tree or graph in traversal order.

In competitive programming and data-structure design, the phrase often means flattening a rooted tree into an array.

Each node receives an entry time when DFS first enters it.

It may also receive an exit time when DFS leaves its subtree.

The result turns hierarchical subtree relationships into contiguous array intervals.

That transformation is powerful.

Arrays have mature range-query structures.

Segment trees, Fenwick trees, sparse tables, and prefix sums all work naturally on arrays.

Trees are harder to update and query directly.

Euler tours bridge that gap.

A subtree sum becomes a range sum.

A subtree update becomes a range update.

Ancestor checks become interval containment tests.

Lowest common ancestor algorithms can use a different Euler tour that records depth along a DFS walk.

The same name is used for several related traversal encodings.

That can cause confusion.

One variant records each node once at entry time.

Another records entry and exit events.

Another records every visit along a DFS walk for LCA by range minimum query.

The central question is:

Which traversal record preserves the tree fact we want to query later?

Euler tours are useful because they convert pointer-shaped structure into index-shaped structure.

The conversion is only correct when the chosen tour matches the query invariant.

## 2. Core Mathematical Invariants

Root the tree at some node.

Run DFS from the root.

When a node `u` is first entered, assign:

```text
tin[u] = timer
```

Then increment `timer`.

After all descendants of `u` have been visited, assign:

```text
tout[u] = timer
```

For the entry-time flattening variant, every node in the subtree of `u` receives an entry time in the half-open interval:

$$
[tin[u], tout[u]).
$$

That is the core subtree interval invariant.

Node `u` is an ancestor of node `v` exactly when:

$$
tin[u]\le tin[v] < tout[u].
$$

This works because DFS fully explores a child subtree before moving to the next sibling.

No outside node can receive a timestamp in the middle of a subtree's DFS block.

For an array `flat`, store:

```text
flat[tin[u]] = value[u]
```

Then a subtree sum for `u` is a range sum over:

```text
flat[tin[u] : tout[u]]
```

If using entry and exit events, each node may appear twice.

That variant is useful for path accumulation tricks and bracket-like ancestry reasoning.

If using the LCA Euler walk, nodes may appear many times.

The first occurrence of each node and minimum depth between occurrences identify the LCA.

These variants are related, but their invariants are not interchangeable.

Choosing the wrong variant is the main bug.

The phrase "Euler tour" should always be paired with what is stored and why.

## 3. Step-by-Step Execution Trace

Use this rooted tree:

```text
        A
      / | \
     B  C  D
       / \
      E   F
```

Use child order left to right.

Start DFS at `A`.

Enter `A`.

Assign `tin[A] = 0`.

Enter `B`.

Assign `tin[B] = 1`.

`B` has no children.

Exit `B`.

Assign `tout[B] = 2`.

Enter `C`.

Assign `tin[C] = 2`.

Enter `E`.

Assign `tin[E] = 3`.

Exit `E`.

Assign `tout[E] = 4`.

Enter `F`.

Assign `tin[F] = 4`.

Exit `F`.

Assign `tout[F] = 5`.

Exit `C`.

Assign `tout[C] = 5`.

Enter `D`.

Assign `tin[D] = 5`.

Exit `D`.

Assign `tout[D] = 6`.

Exit `A`.

Assign `tout[A] = 6`.

The flattened entry array is:

```text
index: 0 1 2 3 4 5
node:  A B C E F D
```

The subtree of `C` occupies:

```text
[tin[C], tout[C]) = [2, 5)
```

That range contains:

```text
C, E, F
```

The subtree of `A` occupies `[0, 6)`.

The subtree of `B` occupies `[1, 2)`.

To test whether `C` is an ancestor of `F`, check:

```text
tin[C] <= tin[F] < tout[C]
2 <= 4 < 5
```

The answer is true.

To test whether `B` is an ancestor of `F`, check:

```text
1 <= 4 < 2
```

The answer is false.

The tree relationship became interval containment.

Now compare with the LCA Euler walk on the same tree.

One DFS walk sequence is:

```text
A, B, A, C, E, C, F, C, A, D, A
```

This sequence records returns to ancestors.

It is not the same as the entry-only flattened array.

The associated depths are:

```text
0, 1, 0, 1, 2, 1, 2, 1, 0, 1, 0
```

To find the LCA of `E` and `F`, look between their first occurrences.

The minimum-depth node in that interval is `C`.

So `LCA(E, F) = C`.

That representation is excellent for LCA.

It is not the right array for a simple subtree sum.

The entry-only flattening stores each node once.

The LCA walk stores ancestors repeatedly.

The repeated visits are the whole point for RMQ.

## 4. Production-Ready Implementations

The implementation below builds entry times, exit times, and a flattened node array.

It assumes the input is a rooted tree represented by children lists.

```python
from collections.abc import Mapping, Sequence


Tree = Mapping[str, Sequence[str]]


def euler_subtree_intervals(tree: Tree, root: str) -> tuple[dict[str, int], dict[str, int], list[str]]:
    tin: dict[str, int] = {}
    tout: dict[str, int] = {}
    flat: list[str] = []
    active: set[str] = set()

    def dfs(node: str) -> None:
        if node in active:
            raise ValueError("input contains a cycle")
        if node in tin:
            raise ValueError("input is not a rooted tree")

        active.add(node)
        tin[node] = len(flat)
        flat.append(node)
        for child in tree.get(node, ()):
            dfs(child)
        tout[node] = len(flat)
        active.remove(node)

    dfs(root)
    return tin, tout, flat


tree = {
    "A": ["B", "C", "D"],
    "B": [],
    "C": ["E", "F"],
    "D": [],
    "E": [],
    "F": [],
}

tin, tout, flat = euler_subtree_intervals(tree, "A")
assert flat == ["A", "B", "C", "E", "F", "D"]
assert flat[tin["C"]:tout["C"]] == ["C", "E", "F"]
assert tin["C"] <= tin["F"] < tout["C"]
assert not (tin["B"] <= tin["F"] < tout["B"])
```

A Fenwick tree can use the flattened positions for subtree sums.

```python
class Fenwick:
    def __init__(self, values: list[int]) -> None:
        self.bit = [0] * (len(values) + 1)
        for index, value in enumerate(values):
            self.add(index, value)

    def add(self, index: int, delta: int) -> None:
        i = index + 1
        while i < len(self.bit):
            self.bit[i] += delta
            i += i & -i

    def prefix_sum(self, count: int) -> int:
        total = 0
        i = count
        while i > 0:
            total += self.bit[i]
            i -= i & -i
        return total

    def range_sum(self, left: int, right: int) -> int:
        return self.prefix_sum(right) - self.prefix_sum(left)


values = {"A": 5, "B": 2, "C": 7, "D": 1, "E": 4, "F": 3}
fenwick = Fenwick([values[node] for node in flat])
assert fenwick.range_sum(tin["C"], tout["C"]) == 14
fenwick.add(tin["E"], 6)
assert fenwick.range_sum(tin["C"], tout["C"]) == 20
```

The same flattening can support subtree add and point query with a difference array or Fenwick variation.

Add a delta at `tin[u]`.

Subtract the delta at `tout[u]`.

Then a node's accumulated value is the prefix sum at `tin[node]`.

That works because every descendant entry time lies inside the ancestor's interval.

For subtree add and subtree sum together, use a lazy segment tree over the flattened array.

The Euler tour does not perform the update by itself.

It supplies the interval that the range structure updates.

The code rejects cycles and repeated visits because subtree intervals assume a tree.

For general graphs, DFS timestamps still exist, but subtree ranges no longer mean tree subtrees in the same way.

For very deep trees, use an iterative DFS to avoid recursion limits.

For deterministic intervals, keep child order stable.

If the tree is supplied as parent pointers, build child lists first.

Verify there is exactly one root unless the problem allows a forest.

Verify every non-root node has exactly one parent.

Euler subtree intervals assume that unique-parent property.

If a node can have two parents, the input is a DAG, not a tree.

The interval invariant no longer applies directly.

## 5. Asymptotic Time & Space Complexity

Building entry and exit times visits every node once.

For a tree with $n$ nodes, the DFS costs:

$$
O(n).
$$

The `tin` table stores one timestamp per node.

The `tout` table stores one timestamp per node.

The flattened array stores each node once.

The total auxiliary space is $O(n)$.

Subtree containment checks are $O(1)$ after preprocessing.

With prefix sums over static values, subtree sum queries are $O(1)$.

Point updates would require rebuilding prefix sums, so they are not efficient in the static prefix representation.

With a Fenwick tree, point updates cost $O(\log n)$.

Subtree sum queries also cost $O(\log n)$.

With a segment tree, range updates and richer aggregates become possible.

The preprocessing cost remains $O(n)$.

The range data structure determines later query and update costs.

For subtree add and point query, update cost is $O(\log n)$ with a Fenwick tree.

Point query is also $O(\log n)$.

For subtree add and subtree sum, a lazy segment tree gives $O(\log n)$ updates and queries.

For static subtree sums, prefix sums give $O(1)$ queries after $O(n)$ preprocessing.

The same timestamps can feed several range structures.

The query requirement chooses the structure.

The LCA Euler-walk variant has a different size.

It records nodes during entry and after returning from children.

That walk has $O(n)$ length for a tree.

Range-minimum preprocessing over depths may cost $O(n\log n)$ or $O(n)$ depending on the RMQ method.

Do not mix those complexity claims with the subtree-interval variant.

If the tree is a forest, add a virtual root or process each root separately.

A virtual root makes all components part of one interval universe.

Processing roots separately can be cleaner when components should remain independent.

Either way, document whether ancestor checks across different trees should return false.

The preprocessing remains linear in the total number of nodes.

## 6. Systems Connections

Euler flattening is common in tree dashboards and authorization systems.

An organization chart can be flattened so every manager's subtree is an interval.

Queries like "total quota under this manager" become range queries.

File-system indexes use similar ideas when directory subtrees need compact ranges.

Compilers use DFS entry and exit times for dominance-related reasoning, though full dominator algorithms need more machinery.

Static-analysis tools use interval containment to answer ancestry questions in syntax trees.

UI frameworks often store tree views in flattened arrays for rendering.

Expanding or collapsing a subtree then corresponds to a contiguous slice.

Game engines and scene graphs may flatten hierarchy for traversal or batching.

The important engineering rule is that the tree must stay stable or the intervals must be updated.

Inserting a node changes timestamps for nodes after the insertion point.

For highly dynamic trees, Euler-tour trees or link-cut trees may be needed.

Those are different data structures.

The simple DFS flattening in this article is best for static or rebuild-friendly trees.

When data changes rarely and queries are frequent, it is excellent.

When structure changes constantly, timestamp maintenance becomes the bottleneck.

Dynamic tree structures solve a harder problem.

Euler-tour trees maintain a tour sequence inside a balanced binary tree.

They can support link and cut operations with logarithmic-time updates.

That is not the same as a static Euler flattening array.

For most DSA problems, the tree is static during queries.

For online connectivity under changing forests, use the dynamic structure deliberately.

Do not patch static timestamps after arbitrary edits and hope intervals stay meaningful.

In UI trees, flattening also helps virtualization.

The renderer can keep a visible slice of the flattened tree instead of recursively mounting every node.

When a subtree is collapsed, its interval can be skipped.

When it is expanded, the same interval becomes eligible for display.

The implementation may store depth alongside each flattened node for indentation.

That is another example of preserving tree information in array form.

## 7. Practice Checklist

- Choose the Euler-tour variant before coding.
- Use entry-only flattening for subtree ranges.
- Use entry and exit times for ancestor checks.
- Use full DFS walk plus depths for RMQ-based LCA.
- Root the tree explicitly.
- Keep child order deterministic when output must be stable.
- Treat intervals as half-open: `[tin, tout)`.
- Store node values at `flat[tin[node]]`.
- Query a subtree using `tin[node]` and `tout[node]`.
- Reject cycles when the input is supposed to be a tree.
- Reject repeated parents when the input is a rooted tree.
- Test a single-node tree.
- Test a chain-shaped tree.
- Test a branching tree.
- Test ancestor and non-ancestor pairs.
- Test subtree sums after point updates.
- Use iterative DFS for very deep trees.
- Do not apply subtree interval logic blindly to general graphs.
- Rebuild or update intervals after structural tree changes.
- Document which timestamps are inclusive or exclusive.
- Do not confuse entry-only flattening with LCA Euler walks.
- Verify parent-pointer inputs form a tree before flattening.
- Use a virtual root deliberately for forests.
- Treat dynamic link/cut operations as a different data-structure problem.
- Keep subtree values aligned with `flat[tin[node]]`.
- Store depth when flattened output must render hierarchy.
- Test subtree size with `tout[u] - tin[u]`.

## 8. Frequently Asked Questions

### Is Euler tour always about Eulerian paths?

No.

In tree algorithms, "Euler tour" often means a DFS traversal encoding, not necessarily an Eulerian trail that uses every edge exactly once.

### Why does a subtree become a contiguous interval?

DFS finishes an entire child subtree before moving to the next sibling.

No outside node can be timestamped inside that block.

### What does `tout[u]` mean?

In the subtree-interval variant, it is the exclusive end of `u`'s subtree range.

### Can I use this on a graph with cycles?

DFS timestamps exist on graphs, but subtree intervals no longer represent original graph subtrees cleanly.

Use this technique for rooted trees unless an algorithm states otherwise.

### How do subtree sums work?

Store each node's value at its entry-time position.

Then query the range `[tin[u], tout[u])`.

### Why use half-open intervals?

They compose cleanly with array slicing and range data structures.

The subtree size is simply `tout[u] - tin[u]`.

### Which Euler tour is used for LCA?

The common RMQ method records a DFS walk with node depths and first occurrences.

That is different from entry-only subtree flattening.

### What is the most common bug?

Using an LCA-style tour for subtree sums or using entry-only flattening for RMQ LCA without the required depth walk.

The variants look similar but answer different questions.
