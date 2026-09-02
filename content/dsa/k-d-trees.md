# K-D Trees: Recursive Space Partitioning for Multidimensional Search

![K-D tree partitions and search regions](/images/dsa/k-d-trees-dark.png#dark)

## 1. Historical Context & Motivation

A one-dimensional ordered tree compares one key at each node.

Multidimensional points contain several coordinates.

K-D trees extend recursive partitioning by cycling the comparison axis with depth.

At one level they split by `x`.

At the next they split by `y`.

Higher-dimensional trees continue through all $k$ axes.

Each node divides space with an axis-aligned hyperplane.

Points below the split coordinate enter one subtree.

Points above it enter the other.

This structure supports exact lookup, orthogonal range queries, and nearest-neighbor search.

Its benefit comes from pruning spatial regions that cannot contain an answer.

A balanced tree has logarithmic height.

An unlucky insertion order can create a linear chain.

Bulk construction commonly chooses a median on each active axis to control height.

The structure is not a universal high-dimensional index.

As dimension grows, bounding regions overlap query neighborhoods in ways that weaken pruning.

Nearest-neighbor search can approach a full scan.

This is one manifestation of the curse of dimensionality.

Metric choice also matters.

The usual pruning inequality is derived for Euclidean distance and an axis-aligned split.

Changing the metric requires a compatible lower bound.

Duplicate coordinates need a deterministic tie policy.

Points can share one axis value while differing on others.

Comparing complete point tuples after the split coordinate provides deterministic construction without changing the spatial split semantics.

K-D trees are useful for modest-dimensional geometry, collision candidates, point clouds, and spatial lookup.

Dynamic workloads require balancing or rebuild strategies.

Deleting a split point is more involved than deleting from a simple binary search tree because replacement must preserve the active-axis partition.

The central question is:

How can subtree bounding regions prove that an entire branch cannot improve a range or nearest-neighbor result?

## 2. Core Mathematical Invariants

Let every point belong to $\mathbb{R}^k$.

A node at depth $d$ uses axis:

$$
a=d\bmod k.
$$

Its split value is its point coordinate $p_a$.

### Partition invariant

Every point in the left subtree compares before the node under the active-axis tie rule.

Every point in the right subtree compares after it.

Using strict complete keys makes each unique point occupy one deterministic side.

The invariant applies recursively with the next axis.

### Region invariant

Each node corresponds to an axis-aligned region inherited from ancestor splits.

The left child intersects that region with $x_a\le p_a$ under the chosen tie policy.

The right child intersects it with $x_a\ge p_a$.

Maintaining explicit bounding boxes is optional.

The logical region exists even when computed from traversal state.

### Median-build invariant

Bulk construction sorts or selects by the active axis and places a median at the node.

Each child receives roughly half the points.

For balanced splitting, subtree sizes differ by at most one when all points are distinct under the ordering key.

Height is then $O(\log n)$.

### Exact-search invariant

At a node, first test full-point equality.

If unequal, compare the target and node under the active-axis ordering.

Only one child can contain the exact point under a deterministic partition.

Exact search follows one root-to-leaf path.

### Range-pruning invariant

For an orthogonal query box with lower and upper coordinate bounds, report a node point when every coordinate lies within the box.

Search the left child only when the query's lower bound on the split axis does not lie completely above the split.

Search the right child only when the query's upper bound does not lie completely below the split.

Branches whose regions do not intersect the query box cannot contain answers.

### Nearest-neighbor incumbent invariant

Maintain the best point found and squared distance $D$.

Visit the child containing the query point first.

After that search, the opposite child can improve the result only if the split plane is closer than the incumbent:

$$
(q_a-p_a)^2\le D.
$$

If the squared plane distance exceeds $D$, every point across the plane is farther in Euclidean distance.

Prune that branch safely.

### Squared-distance invariant

Compare squared Euclidean distances:

$$
d^2(p,q)=\sum_{i=0}^{k-1}(p_i-q_i)^2.
$$

Square roots are monotone and unnecessary for ordering candidates.

This saves work and avoids one floating-point transformation.

### Tie invariant

Equal distances need a deterministic result policy.

Comparing `(distance_squared, point)` selects the lexicographically smaller point on ties.

Tests and APIs should state that behavior.

## 3. Step-by-Step Execution Trace

Build a two-dimensional tree from:

```text
(2,3), (5,4), (9,6), (4,7), (8,1), (7,2)
```

Use median bulk construction.

### Root split on `x`

Sort by `(x,y)`:

```text
(2,3), (4,7), (5,4), (7,2), (8,1), (9,6)
```

Choose upper median `(7,2)`.

Left subset is `(2,3), (4,7), (5,4)`.

Right subset is `(8,1), (9,6)`.

The root split is vertical at `x=7`.

### Left subtree split on `y`

Sort left subset by `(y,x)`:

```text
(2,3), (5,4), (4,7)
```

Choose median `(5,4)`.

Its left child is `(2,3)`.

Its right child is `(4,7)`.

These children split on `x`, but each is a leaf.

### Right subtree split on `y`

Sort `(8,1), (9,6)` by `y`.

Choose upper median `(9,6)`.

Its left child is `(8,1)`.

Its right child is empty.

### Exact search for `(4,7)`

At root `(7,2)`, compare `x` coordinates.

Target `x=4` goes left.

At `(5,4)`, compare `y` coordinates.

Target `y=7` goes right.

Node `(4,7)` matches exactly.

Three nodes were examined.

### Nearest neighbor to `(9,2)`

At `(7,2)`, squared distance is `4`.

Query lies on the right side of root split.

Visit `(9,6)` next.

Its squared distance is `16`, so incumbent stays `(7,2)`.

Query `y=2` goes toward left child `(8,1)`.

Squared distance to `(8,1)` is `2`.

Update incumbent to `(8,1)` with $D=2$.

Return to split `(9,6)`.

Plane distance on `y` is $(2-6)^2=16>D$.

Prune its absent far side.

Return to root split `x=7`.

Plane distance is $(9-7)^2=4>D$.

Prune the entire left subtree.

Nearest point is `(8,1)`.

### Range query

Query rectangle is `x in [3,8]`, `y in [1,5]`.

Root `(7,2)` lies inside and is reported.

The box crosses the root split, so both sides may matter.

Left node `(5,4)` lies inside.

Its child `(2,3)` is outside by `x`.

Its child `(4,7)` is outside by `y`.

On the right, `(9,6)` is outside.

Its left child `(8,1)` lies on both upper/lower boundaries and is reported.

Result is `(7,2), (5,4), (8,1)` in traversal order.

## 4. Production-Ready Implementations

The implementation bulk-builds a balanced immutable point topology.

It validates one shared dimension and rejects duplicate points.

```python
from dataclasses import dataclass
from math import inf
from typing import Iterable

Point = tuple[float, ...]


@dataclass
class KDNode:
    point: Point
    axis: int
    left: "KDNode | None" = None
    right: "KDNode | None" = None


class KDTree:
    def __init__(self, points: Iterable[Point]) -> None:
        materialized = list(points)
        if not materialized:
            self.dimension = 0
            self.root = None
            return

        self.dimension = len(materialized[0])
        if self.dimension == 0:
            raise ValueError("points must have at least one coordinate")
        if any(len(point) != self.dimension for point in materialized):
            raise ValueError("all points must share one dimension")
        if len(set(materialized)) != len(materialized):
            raise ValueError("duplicate points are not supported")

        self.root = self._build(materialized, 0)

    def _build(self, points: list[Point], depth: int) -> KDNode | None:
        if not points:
            return None
        axis = depth % self.dimension
        points.sort(key=lambda point: (point[axis], point))
        middle = len(points) // 2
        return KDNode(
            points[middle],
            axis,
            self._build(points[:middle], depth + 1),
            self._build(points[middle + 1 :], depth + 1),
        )
```

### Exact membership and nearest neighbor

```text
    def contains(self, target: Point) -> bool:
        if len(target) != self.dimension:
            return False
        node = self.root
        while node is not None:
            if target == node.point:
                return True
            key = (target[node.axis], target)
            node_key = (node.point[node.axis], node.point)
            node = node.left if key < node_key else node.right
        return False

    def nearest(self, target: Point) -> Point:
        if self.root is None:
            raise ValueError("empty tree has no nearest point")
        if len(target) != self.dimension:
            raise ValueError("target dimension does not match tree")

        best_point = self.root.point
        best_distance = inf

        def squared_distance(a: Point, b: Point) -> float:
            return sum((left - right) ** 2 for left, right in zip(a, b))

        def search(node: KDNode | None) -> None:
            nonlocal best_point, best_distance
            if node is None:
                return

            candidate_distance = squared_distance(target, node.point)
            if (candidate_distance, node.point) < (best_distance, best_point):
                best_distance = candidate_distance
                best_point = node.point

            delta = target[node.axis] - node.point[node.axis]
            near, far = (node.left, node.right) if delta < 0 else (node.right, node.left)
            search(near)
            if delta * delta <= best_distance:
                search(far)

        search(self.root)
        return best_point
```

The methods belong inside `KDTree`; they are shown separately to keep each mechanism visible.

### Executable complete version

```python
def attach_kd_methods() -> None:
    KDTree.contains = contains = locals().get("contains", getattr(KDTree, "contains", None))


# Define methods directly for executable article validation.
def kd_contains(tree: KDTree, target: Point) -> bool:
    if len(target) != tree.dimension:
        return False
    node = tree.root
    while node is not None:
        if target == node.point:
            return True
        key = (target[node.axis], target)
        node_key = (node.point[node.axis], node.point)
        node = node.left if key < node_key else node.right
    return False


def kd_nearest(tree: KDTree, target: Point) -> Point:
    if tree.root is None:
        raise ValueError("empty tree has no nearest point")
    best = [float("inf"), tree.root.point]

    def search(node: KDNode | None) -> None:
        if node is None:
            return
        distance = sum((a - b) ** 2 for a, b in zip(target, node.point))
        if (distance, node.point) < (best[0], best[1]):
            best[:] = [distance, node.point]
        delta = target[node.axis] - node.point[node.axis]
        near, far = (node.left, node.right) if delta < 0 else (node.right, node.left)
        search(near)
        if delta * delta <= best[0]:
            search(far)

    search(tree.root)
    return best[1]


tree = KDTree([(2, 3), (5, 4), (9, 6), (4, 7), (8, 1), (7, 2)])
assert kd_contains(tree, (4, 7))
assert not kd_contains(tree, (3, 3))
assert kd_nearest(tree, (9, 2)) == (8, 1)
```

The separate executable helpers avoid relying on prose indentation to place methods inside the class.

A production module should define them as ordinary methods in one class block.

## 5. Asymptotic Time & Space Complexity

Median bulk construction using a sort at every recursive level takes $O(n\log^2 n)$ in the straightforward implementation.

Sorting once per axis or using linear-time selection can achieve $O(n\log n)$ construction.

Balanced height is $O(\log n)$.

Exact lookup is expected or balanced-case $O(\log n)$.

Worst-case lookup is $O(n)$ for a degenerate or adversarial tree.

Orthogonal range query time is often expressed as output plus visited nodes.

In two dimensions, balanced idealized bounds can be $O(\sqrt n+m)$ for $m$ reported points.

General practical behavior depends on dimension and distribution.

Nearest-neighbor search is often fast in low dimension.

Its worst case is $O(n)$ because pruning may fail.

The tree stores $O(n)$ nodes.

Recursive construction and search use $O(h)$ stack space.

The presented slicing builder allocates intermediate lists and can use more transient memory than an in-place selection build.

| Operation | Balanced/common bound | Worst case |
|---|---:|---:|
| Straightforward bulk build | $O(n\log^2 n)$ | $O(n\log^2 n)$ |
| Optimized bulk build | $O(n\log n)$ | implementation-dependent |
| Exact lookup | $O(\log n)$ | $O(n)$ |
| Nearest neighbor | data-dependent | $O(n)$ |
| Storage | $O(n)$ | $O(n)$ |

Dimension $k$ appears in every distance calculation, which costs $O(k)$.

For high-dimensional data, both computation and weak pruning can dominate.

## 6. Systems Connections

### Collision and proximity queries

Physics and geometry systems query nearby points or objects.

K-D trees can prune regions separated from the query.

Moving objects invalidate static partitions; periodic rebuilding or dynamic alternatives may fit better.

### Point clouds

Three-dimensional point processing uses neighbor queries for normals, clustering, and registration.

Balanced trees help when the point set is static or updated in batches.

Approximate queries may trade exactness for substantial speed.

### Database spatial indexes

General spatial databases often prefer R-trees because they index rectangles and support dynamic disk-page organization.

K-D trees partition points by alternating coordinates.

Storage layout and workload determine which structure fits.

### High-dimensional search

In high dimension, most points can appear similarly distant.

The search ball crosses many split planes.

The tree visits much of the data.

Approximate nearest-neighbor structures, graph-based indexes, or product quantization may outperform exact K-D search.

### Bounding boxes

Storing subtree bounding boxes strengthens pruning beyond one split-plane test.

The minimum distance from a query to a box is a lower bound for every contained point.

That metadata costs space and update work.

### Concurrency and snapshots

An immutable bulk-built tree supports concurrent readers naturally.

Writers can build a replacement tree and atomically publish a new root.

Incremental mutation needs synchronization and may degrade balance.

### Numeric behavior

NaN coordinates break total ordering and distance comparisons.

Validate finite inputs or define an explicit policy.

Large integer squared differences can overflow fixed-width types.

Use checked or wider arithmetic.

## 7. Practice Checklist

- Define point dimension explicitly.
- Reject inconsistent dimensions.
- Decide how duplicate points are handled.
- Validate finite floating-point coordinates.
- Cycle split axes with depth modulo dimension.
- Use deterministic tie-breaking on equal axis values.
- Choose medians for balanced bulk construction.
- Keep the partition invariant in both children.
- Test exact equality before choosing a branch.
- Visit the near child first in nearest search.
- Maintain one incumbent distance.
- Compare squared distances.
- Search the far child when the split plane can beat the incumbent.
- Use a consistent equal-distance result policy.
- Test empty input.
- Test one point.
- Test collinear points.
- Test repeated axis coordinates.
- Test negative coordinates.
- Test an exact query point.
- Test equal-distance candidates.
- Compare random nearest queries with brute force.
- Verify every node lies in its inherited region.
- Measure height after dynamic insertion.
- Rebuild when imbalance exceeds the workload budget.
- Add bounding boxes only when pruning benefits justify metadata.
- Use wider arithmetic for squared integer distance.
- State the distance metric.
- Do not assume low-dimensional performance in high dimension.
- Consider approximate indexes when exact search scans too much.

## 8. Frequently Asked Questions

### What does K-D mean?

It means k-dimensional.

The tree stores points with $k$ coordinates and cycles its split axis across dimensions.

### Is a K-D tree a binary search tree?

It is binary and comparison-driven, but the comparison coordinate changes with depth.

It does not maintain one global scalar-key ordering.

### Why choose a median during construction?

A median gives roughly equal subtree sizes and keeps height logarithmic for bulk-built data.

### Is nearest-neighbor search always logarithmic?

No.

Its worst case is linear because the query region may cross many partitions, especially in high dimensions.

### Why search the near child first?

It is more likely to produce a strong incumbent quickly.

A smaller incumbent distance lets the split-plane test prune more far branches.

### Why compare squared distances?

Square root is monotone, so it cannot change which candidate is nearer.

Squared values avoid unnecessary roots.

### Can points share a split coordinate?

Yes.

A deterministic secondary comparison must place them consistently while preserving exact lookup behavior.

### How are range queries pruned?

Skip a child when its inherited spatial region does not intersect the query box.

The split coordinate supplies a simple intersection test.

### Can the tree support insertions?

Yes, but ordinary insertion can unbalance it.

Dynamic workloads need rebuilding or a balancing strategy.

### Why do K-D trees struggle in high dimensions?

Distance neighborhoods intersect many split regions, so pruning loses effectiveness and search approaches a scan.

### Should subtree bounding boxes be stored?

They can improve pruning by providing tighter lower bounds, at the cost of storage and update complexity.

### When should another index be used?

Use alternatives for high-dimensional approximate search, rectangle indexing, heavily dynamic points, or disk-oriented spatial workloads whose access pattern does not match K-D partitions.
