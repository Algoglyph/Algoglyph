# Quadtrees: Recursive Spatial Partitioning, Region Invariants & Adaptive Resolution

![Quadtree spatial subdivision](/images/dsa/quadtrees-dark.png#dark)

## 1. Historical Context & Motivation

Two-dimensional data often clusters unevenly across space.

A uniform grid spends equal storage on empty and dense regions.

A quadtree adapts resolution by recursively subdividing only where needed.

Each internal region splits into four axis-aligned child regions.

The usual quadrants are northwest, northeast, southwest, and southeast.

Leaves represent regions that need no further refinement.

The stopping rule depends on the application.

A point-region quadtree may split when a leaf exceeds point capacity.

An image quadtree may split when pixel variation exceeds a tolerance.

A collision index may split when too many objects intersect one region.

The structure was developed for spatial indexing and image representation.

It now appears in mapping, rendering, simulation, compression, and robotics.

Adaptive partitioning is the main idea, not the number four by itself.

An octree applies the analogous pattern to three dimensions.

A binary space partition can choose two children with arbitrary splitting planes.

An R-tree groups bounding boxes rather than recursively dividing fixed space.

Choosing among these structures depends on query and update distributions.

A quadtree needs a declared boundary convention.

Points on vertical or horizontal midlines must belong to exactly one child.

Half-open rectangles make that assignment deterministic.

For example, include left and top boundaries while excluding right and bottom.

The outermost region may need special treatment for its maximum boundary.

Finite coordinate precision also matters.

Repeated subdivision can stop making numerical progress.

Identical points can force infinite splitting without capacity or depth safeguards.

A production implementation therefore specifies maximum depth and minimum cell size.

Objects with nonzero area create another design choice.

Duplicating an object into every intersecting child accelerates some queries but costs memory.

Keeping straddling objects at the parent avoids duplication.

Loose quadtrees enlarge child bounds to reduce object movement between cells.

There is no single canonical quadtree implementation for every spatial workload.

The invariants are shared, while storage policies vary.

This article builds a point-region quadtree with bucketed leaves.

That model makes containment, subdivision, and range-query pruning precise.

## 2. Core Mathematical Invariants

### Region representation

Represent a node region by half-open rectangle:

$$
[x_{min},x_{max})\times[y_{min},y_{max}).
$$

Its midpoint is:

$$
x_m=\frac{x_{min}+x_{max}}{2},\qquad y_m=\frac{y_{min}+y_{max}}{2}.
$$

The four children partition the parent without interior overlap.

Their union equals the parent region.

Every contained point maps to exactly one child under deterministic comparisons.

### Child partition invariant

Using screen coordinates where smaller `y` is north:

Northwest is `[xmin,xm) x [ymin,ym)`.

Northeast is `[xm,xmax) x [ymin,ym)`.

Southwest is `[xmin,xm) x [ym,ymax)`.

Southeast is `[xm,xmax) x [ym,ymax)`.

The child index can be computed from two Boolean tests.

`east = x >= xm` chooses the horizontal half.

`south = y >= ym` chooses the vertical half.

The same tests must be used during insertion, lookup, and deletion.

### Node-state invariant

A node is either a leaf or an internal node.

A leaf owns a bucket of points and has no children.

An internal node owns exactly four child nodes.

In the chosen point model, an internal node stores no local points.

Mixing states without a defined policy complicates queries and counts.

### Containment invariant

Every point stored beneath a node lies inside that node's region.

Every leaf point lies inside its leaf region.

Insertion outside the root is rejected or triggers a separately defined root expansion.

Silent clipping would lose the meaning of spatial queries.

### Capacity invariant

A splittable leaf holds at most `capacity` points.

When insertion exceeds capacity, subdivide and redistribute its full bucket.

Redistribution includes the newly inserted point.

No point may remain in both the old bucket and a child.

At maximum depth, a leaf may exceed capacity by explicit policy.

This exception prevents infinite refinement for coincident points.

### Range-query pruning

If a node region does not intersect the query rectangle, no descendant can match.

The entire subtree can be skipped.

If a node region is fully contained by the query and aggregate reporting is supported,

the stored subtree aggregate can be returned without inspecting leaves.

Otherwise traversal descends only into intersecting children.

### Count invariant

Let `count(v)` be the number of points in a node's subtree.

For a leaf:

$$
count(v)=|bucket(v)|.
$$

For an internal node:

$$
count(v)=\sum_{c\in children(v)}count(c).
$$

A cached count must be updated exactly once along every insertion or deletion path.

### Compression invariant

After deletion, four leaf children may be merged when their combined points fit one bucket.

The merge must preserve every point exactly once.

It replaces four child leaves with one parent leaf.

Merging internal grandchildren without collecting them first would lose points.

### Termination invariant

Every insertion path stops because at least one bound applies.

Possible bounds include remaining depth, minimum cell width, or unsplittable coordinates.

Capacity alone does not guarantee termination when many points are identical.

## 3. Step-by-Step Execution Trace

Use root region `[0,8) x [0,8)`.

Set leaf capacity to `2` points.

Set maximum depth to `3`.

Insert point `A = (1,1)`.

The root is a leaf with free capacity.

Its bucket becomes `[A]`.

Insert point `B = (6,1)`.

The root bucket becomes `[A,B]`.

Capacity is exactly satisfied, so no split occurs.

Insert point `C = (7,6)`.

The root would contain three points and exceeds capacity.

Split at midpoint `(4,4)`.

Create four child regions.

Redistribute `A` to northwest because `1 < 4` and `1 < 4`.

Redistribute `B` to northeast because `6 >= 4` and `1 < 4`.

Redistribute `C` to southeast because `7 >= 4` and `6 >= 4`.

The southwest leaf remains empty.

The root becomes internal and its old bucket is cleared.

Insert point `D = (5,5)`.

At the root, `D` maps to southeast.

That leaf currently holds only `C`.

Append `D`, producing bucket `[C,D]`.

Insert point `E = (6,7)`.

The southeast bucket would grow to three points.

Its region is `[4,8) x [4,8)` with midpoint `(6,6)`.

Subdivide that leaf.

Point `C = (7,6)` maps to its southeast child.

Point `D = (5,5)` maps to its northwest child.

Point `E = (6,7)` maps to its southeast child.

The nested southeast child contains `[C,E]`.

The nested northwest child contains `[D]`.

No point is duplicated.

Now query rectangle `[4,8) x [4,7)`.

The root intersects the query, so inspect children.

Root northwest, northeast, and southwest do not intersect its interior.

Prune those three subtrees.

Root southeast intersects, so descend.

Nested northwest contains `D = (5,5)`, which matches.

Nested northeast is empty.

Nested southwest is empty.

Nested southeast contains `C = (7,6)` and `E = (6,7)`.

Point `C` matches because `6 < 7` for the half-open y bound.

Point `E` does not match because `y = 7` equals the excluded maximum.

The query returns `{C,D}`.

### Boundary trace

Insert point `M = (4,4)` at the root midpoint.

The comparisons `x >= 4` and `y >= 4` are both true.

Therefore `M` maps deterministically to southeast.

No neighboring child also owns that boundary point.

### Coincident-point trace

Suppose several points all equal `(2,2)`.

Every split maps them into the same child.

At maximum depth, splitting stops.

The terminal leaf is allowed to exceed nominal capacity.

Insertion terminates while retaining every coincident record.

## 4. Production-Ready Implementations

The following Python implementation stores immutable point records in bucketed leaves.

```python
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True, slots=True)
class Point(Generic[T]):
    x: float
    y: float
    value: T


@dataclass(frozen=True, slots=True)
class Rect:
    xmin: float
    ymin: float
    xmax: float
    ymax: float

    def __post_init__(self) -> None:
        if not self.xmin < self.xmax or not self.ymin < self.ymax:
            raise ValueError("rectangle must have positive width and height")

    def contains(self, point: Point[object]) -> bool:
        return self.xmin <= point.x < self.xmax and self.ymin <= point.y < self.ymax

    def intersects(self, other: Rect) -> bool:
        return not (
            self.xmax <= other.xmin or other.xmax <= self.xmin
            or self.ymax <= other.ymin or other.ymax <= self.ymin
        )


@dataclass(slots=True)
class QuadNode(Generic[T]):
    bounds: Rect
    depth: int
    points: list[Point[T]] = field(default_factory=list)
    children: list[QuadNode[T]] | None = None


class Quadtree(Generic[T]):
    def __init__(self, bounds: Rect, capacity: int = 8, max_depth: int = 20) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        if max_depth < 0:
            raise ValueError("maximum depth cannot be negative")
        self.capacity = capacity
        self.max_depth = max_depth
        self.root: QuadNode[T] = QuadNode(bounds, 0)

    @staticmethod
    def _child_index(bounds: Rect, point: Point[object]) -> int:
        xm = (bounds.xmin + bounds.xmax) / 2
        ym = (bounds.ymin + bounds.ymax) / 2
        east = point.x >= xm
        south = point.y >= ym
        return (2 if south else 0) + (1 if east else 0)

    @staticmethod
    def _child_bounds(bounds: Rect) -> list[Rect]:
        xm = (bounds.xmin + bounds.xmax) / 2
        ym = (bounds.ymin + bounds.ymax) / 2
        return [
            Rect(bounds.xmin, bounds.ymin, xm, ym),
            Rect(xm, bounds.ymin, bounds.xmax, ym),
            Rect(bounds.xmin, ym, xm, bounds.ymax),
            Rect(xm, ym, bounds.xmax, bounds.ymax),
        ]

    def insert(self, point: Point[T]) -> None:
        if not self.root.bounds.contains(point):
            raise ValueError("point lies outside the quadtree root")
        self._insert(self.root, point)

    def _insert(self, node: QuadNode[T], point: Point[T]) -> None:
        if node.children is not None:
            index = self._child_index(node.bounds, point)
            self._insert(node.children[index], point)
            return

        if len(node.points) < self.capacity or node.depth >= self.max_depth:
            node.points.append(point)
            return

        child_rects = self._child_bounds(node.bounds)
        node.children = [QuadNode(rect, node.depth + 1) for rect in child_rects]
        old_points = node.points
        node.points = []
        for old_point in old_points:
            index = self._child_index(node.bounds, old_point)
            self._insert(node.children[index], old_point)
        index = self._child_index(node.bounds, point)
        self._insert(node.children[index], point)

    def query(self, area: Rect) -> list[Point[T]]:
        result: list[Point[T]] = []
        self._query(self.root, area, result)
        return result

    def _query(self, node: QuadNode[T], area: Rect, result: list[Point[T]]) -> None:
        if not node.bounds.intersects(area):
            return
        if node.children is None:
            result.extend(point for point in node.points if area.contains(point))
            return
        for child in node.children:
            self._query(child, area, result)


tree: Quadtree[str] = Quadtree(Rect(0, 0, 8, 8), capacity=2, max_depth=3)
for point in [
    Point(1, 1, "A"), Point(6, 1, "B"), Point(7, 6, "C"),
    Point(5, 5, "D"), Point(6, 7, "E"),
]:
    tree.insert(point)

assert {point.value for point in tree.query(Rect(4, 4, 8, 7))} == {"C", "D"}
```

The root uses half-open bounds consistently.

The maximum boundary is excluded by this implementation.

Callers needing inclusive world maxima can normalize coordinates or define a closed-root wrapper.

The split redistributes old points before inserting the new point.

Internal nodes clear their buckets, preserving the chosen state invariant.

Maximum depth guarantees termination for coincident points.

Floating-point midpoint precision can still collapse at extreme magnitudes.

A production version should detect a midpoint equal to a boundary and stop splitting.

Object indexes need rectangle intersection rather than point containment.

They must choose parent retention, duplication, or loose bounds for straddlers.

Deletion should optionally merge four small leaf children.

Concurrent readers require immutable snapshots or synchronization during splits.

Range-query output order is structural, not spatially sorted.

Sort explicitly when consumers require a deterministic coordinate order.

## 5. Asymptotic Time & Space Complexity

Let `n` be the number of stored points and `h` the tree height.

One insertion follows one root-to-leaf path.

Ignoring split redistribution, its time is $O(h)$.

A split redistributes the leaf bucket of at most `capacity` points.

With fixed capacity, that is constant work per split level.

Insertion is therefore $O(h)$ under the bounded-bucket model.

For balanced spatial data, height is often $O(\log n)$.

Adversarial clustered data can produce height up to `max_depth`.

Without a depth or cell-size bound, coincident points can prevent termination.

A range query visits nodes whose regions intersect the query.

Its cost is:

$$
O(v+k)
$$

where `v` is the number of visited tree nodes and `k` is reported points.

There is no universal logarithmic worst-case guarantee for arbitrary distributions.

A query covering the entire root takes $O(n)$ when every point is returned.

A tiny query can still visit many nodes under pathological subdivision.

Point lookup follows one path and inspects one bucket.

Its bound is $O(h+capacity)$.

With constant capacity, this simplifies to $O(h)$.

Each internal node allocates four child records.

The total number of nodes is proportional to occupied subdivision structure.

For bucketed point data with bounded depth, storage is $O(n+h)$ in typical compressed trees.

An eagerly allocated complete quadtree of depth `d` has:

$$
1+4+4^2+\cdots+4^d=\frac{4^{d+1}-1}{3}
$$

nodes.

Lazy allocation avoids paying for empty regions.

Duplicating area objects across intersecting children can exceed linear storage.

Parent-retention policies bound duplication differently.

Deletion takes $O(h)$ to find a point plus any bucket search.

Bottom-up merging adds work along the same ancestor path.

Bulk construction can outperform repeated insertion when points can be partitioned by level.

Cache-friendly linear quadtrees encode leaf locations with Morton codes.

They trade pointer navigation for sorting and compact arrays.

## 6. Systems Connections

Geographic information systems index features by recursively divided map tiles.

Web maps use related multiresolution tiling schemes.

Image quadtrees compress uniform-color or low-variation regions.

Lossy thresholds trade fidelity against leaf count.

Collision detection queries nearby objects instead of checking every pair.

Large objects require a careful straddling policy to avoid excessive duplication.

Particle simulations use adaptive spatial cells for neighborhood search.

Terrain renderers choose detail based on camera distance and projected error.

Robotics occupancy maps refine cells near observed obstacles.

Unknown, free, and occupied states need explicit merge rules.

Game engines use loose quadtrees for moving two-dimensional objects.

Loose bounds reduce frequent reinsertion near cell boundaries.

Database spatial indexes more commonly use R-trees for arbitrary rectangles.

Quadtrees remain attractive when space has a stable global extent.

Morton or Z-order codes interleave coordinate bits.

They linearize quadtree cells while preserving useful spatial locality.

Key-value stores can index Morton intervals with ordered keys.

Parallel construction can partition points among independent quadrants.

Skewed inputs can create load imbalance among workers.

Distributed spatial indexes must decide which machine owns boundary objects.

The same half-open boundary convention prevents duplicate ownership.

Adaptive mesh refinement uses related hierarchical cell subdivision.

Its numerical constraints are richer than a simple point index.

Frustum and viewport queries prune regions outside the visible area.

The region invariant makes that pruning mathematically safe.

## 7. Practice Checklist

- Define the root spatial extent.
- State whether bounds are closed, open, or half-open.
- Use the same midpoint comparisons in every operation.
- Guarantee each point maps to exactly one child.
- Reject or deliberately expand for out-of-root insertions.
- Choose leaf capacity from measured workloads.
- Set a maximum depth or minimum cell size.
- Detect floating-point midpoint collapse.
- Define behavior for coincident points.
- Keep leaves and internal nodes in unambiguous states.
- Redistribute every old point when splitting.
- Clear the old bucket after redistribution.
- Never duplicate point records accidentally.
- Define a policy for area objects crossing child boundaries.
- Prune only when node and query regions are disjoint.
- Test queries touching boundaries.
- Test points exactly on both midlines.
- Test points near the root maximum boundary.
- Test empty trees and empty query results.
- Test clustered and uniformly distributed points.
- Test more coincident points than leaf capacity.
- Validate maximum-depth termination.
- Compare range results with brute-force filtering.
- Validate each stored point lies within every ancestor region.
- Recompute subtree counts in debug validation.
- Merge children only when all points are preserved.
- Define query output ordering if consumers depend on it.
- Synchronize splits when readers and writers coexist.
- Limit deserialized depth and node count for untrusted indexes.
- Benchmark against uniform grids, k-d trees, and R-trees.
- Include allocation overhead in memory measurements.
- Consider Morton-coded linear storage for static datasets.
- Measure query selectivity and visited-node count.
- Avoid assuming balanced height without a distribution model.
- Match the tree variant to points, images, or area objects.

## 8. Frequently Asked Questions

### Why does a quadtree have four children?

Each split halves both coordinate axes, producing four rectangular quadrants.

### Is lookup always logarithmic?

No.

Height depends on spatial distribution, capacity, and stopping rules.

### What happens to points on a midpoint?

Deterministic comparisons assign them to one designated east or south child.

The policy must be consistent across all operations.

### Why set a maximum depth?

Coincident points and finite coordinate precision can otherwise force endless subdivision.

### How are large rectangles stored?

Common choices are parent retention, child duplication, or loose child bounds.

Each has different query, update, and memory trade-offs.

### Is a quadtree better than a k-d tree?

Neither dominates universally.

Quadtrees partition fixed space; k-d trees usually partition around point distributions.

### What is a loose quadtree?

Its child ownership cells remain fixed, but storage bounds are enlarged.

Moving or straddling objects then require fewer structural updates.

### Can a quadtree represent an image?

Yes.

Leaves can represent uniform or sufficiently similar pixel blocks.

### What is a linear quadtree?

It stores cells through compact spatial keys such as Morton codes rather than pointers.

This improves serialization and often cache locality.

### What is the central invariant?

Every stored item belongs to a region hierarchy whose children partition the parent deterministically.
