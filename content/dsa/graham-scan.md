# Graham Scan: Building a Convex Hull with Orientation Tests

![Graham scan convex hull construction](/images/dsa/graham-scan-dark.jpg#dark)

## 1. Historical Context & Motivation

The convex hull of a point set is its smallest enclosing convex polygon.

Imagine stretching an elastic band around nails placed on a board.

When released, the band touches exactly the outermost nails.

Those contact points are the hull vertices.

Interior points do not affect the boundary.

A boundary point lying between two extreme endpoints may or may not be retained, depending on the output convention.

Convex hulls reduce a two-dimensional set to its external envelope.

That envelope supports collision detection, geographic boundaries, shape comparison, and geometric preprocessing.

Many later algorithms operate faster on the hull than on every original point.

Graham scan constructs the hull by ordering points around a pivot and maintaining a stack of valid boundary turns.

The method transforms a spatial problem into a sorted sequence problem.

First choose an extreme pivot.

Then sort other points by polar angle around it.

Finally scan that order and remove turns that bend inward.

The orientation test is the essential primitive.

It tells whether three points turn counterclockwise, clockwise, or remain collinear.

No trigonometry is required.

The signed two-dimensional cross product gives the answer exactly for integer coordinates within the numeric range.

The scan resembles maintaining a monotone invariant in a stack.

Each new point is a candidate hull vertex.

While the candidate makes the current boundary non-convex, the middle vertex is removed.

Every removed point is permanently proven unnecessary for the processed prefix.

The algorithm runs in $O(n \log n)$ time because sorting dominates the linear scan.

Its implementation is short, but its edge cases are not trivial.

Duplicate points, collinear rays, all-collinear input, numeric overflow, and boundary-point policy must be settled explicitly.

The central question is:

How can a stack of local orientation decisions certify the global convex boundary?

## 2. Core Mathematical Invariants

Represent a point as $p=(p_x,p_y)$.

For points $a$, $b$, and $c$, define:

$$
\operatorname{cross}(a,b,c)
=(b_x-a_x)(c_y-a_y)-(b_y-a_y)(c_x-a_x).
$$

This is the signed area of the parallelogram formed by vectors $b-a$ and $c-a$.

If the value is positive, the path $a \to b \to c$ turns counterclockwise.

If it is negative, the path turns clockwise.

If it is zero, the points are collinear.

### The pivot is guaranteed to lie on the hull

Choose the point with minimum $y$ coordinate.

Break ties using minimum $x$ coordinate.

No input point lies below this pivot.

A supporting horizontal line through the pivot leaves the entire set on one side.

Therefore the pivot is an extreme point and belongs to the convex hull.

The tie-break makes the pivot deterministic.

### Polar order exposes the boundary cyclically

Sort every non-pivot point by its direction from the pivot.

Points with smaller polar angle appear first.

After this order is fixed, a convex boundary cannot jump backward in angle.

The scan can process candidates from left to right in the angular sequence.

Comparing floating-point angles with `atan2` is unnecessary.

Half-plane classification and cross products can define an exact comparator.

For the chosen bottommost pivot, all displacement vectors lie in the upper closed half-plane.

Cross-product sign is sufficient to order their directions.

### Equal-angle points need a deliberate rule

Two points on the same ray from the pivot have zero orientation with the pivot.

If the desired hull contains only extreme vertices, retain only the farthest point on each ray.

Any nearer point lies on the segment from the pivot to the farther point.

It cannot be an extreme hull vertex.

Sorting equal-angle points by increasing distance lets the scan discard nearer points naturally.

Pre-collapsing rays is clearer and reduces work.

### The stack is a convex chain

After processing each angular prefix, consecutive triples in the stack make strict counterclockwise turns.

Formally, for every valid stack index $i$:

$$
\operatorname{cross}(S_{i-2},S_{i-1},S_i)>0.
$$

This is the scan invariant for an extreme-vertex-only hull.

When a new point violates it, the current top cannot remain on the convex boundary of the processed prefix.

The algorithm pops until the invariant is restored.

### Why a clockwise middle point is removable

Suppose stack suffix $(a,b)$ receives candidate $c$ and $\operatorname{cross}(a,b,c)<0$.

The edge through $a$ and $c$ places $b$ on the inward side of the proposed boundary turn.

Keeping $b$ would create a reflex angle.

A convex polygon cannot contain a reflex vertex.

Thus $b$ is not part of the convex hull of the processed points.

### Why a collinear middle point is removable

When $\operatorname{cross}(a,b,c)=0$ and angular order places $c$ at least as far along the ray, $b$ lies between $a$ and $c$.

Removing $b$ preserves the same boundary segment.

Use the condition `cross <= 0` to return only extreme vertices.

Use a different boundary policy when every collinear boundary point must be preserved.

The policy must remain consistent during sorting and scanning.

### Popped points never return

Each point is pushed once.

A point removed after an invalid turn has been dominated by a later candidate in angular order.

Future points have no smaller angle.

They cannot make the removed point extreme again in the processed chain.

This monotonicity makes the scan linear after sorting.

### The final chain closes convexly

The pivot anchors the first and last hull rays.

Angular sorting visits all candidate directions exactly once.

The strict-left-turn stack contains the outer boundary from the first ray to the last ray.

Closing the final vertex back to the pivot completes the polygon.

Every discarded point lies inside or on an edge of that polygon.

## 3. Step-by-Step Execution Trace

Consider these eight input points:

$$
\{(0,0),(3,0),(4,2),(3,4),(0,4),(1,2),(2,1),(2,3)\}.
$$

The expected extreme hull is:

$$
[(0,0),(3,0),(4,2),(3,4),(0,4)].
$$

The other three points are interior.

### Choose the pivot

The smallest $y$ coordinate is `0`.

Two points share it: `(0, 0)` and `(3, 0)`.

The smaller $x$ coordinate selects `(0, 0)`.

Call this point `P`.

### Sort by polar direction

From `P`, the non-pivot points appear in increasing angular order:

1. `(3, 0)`
2. `(2, 1)`
3. `(4, 2)`
4. `(1, 2)`
5. `(2, 3)`
6. `(3, 4)`
7. `(0, 4)`

The exact middle order follows their cross-product comparisons.

Initialize the stack with `[(0, 0)]`.

### Process `(3, 0)`

Fewer than two points are on the stack.

Push the candidate.

Stack: `[(0, 0), (3, 0)]`.

### Process `(2, 1)`

Compute `cross((0,0), (3,0), (2,1)) = 3`.

The turn is counterclockwise.

Push `(2, 1)`.

Stack: `[(0,0), (3,0), (2,1)]`.

### Process `(4, 2)`

Compute `cross((3,0), (2,1), (4,2)) = -3`.

The turn is clockwise.

Pop `(2, 1)`.

Now compute `cross((0,0), (3,0), (4,2)) = 6`.

The replacement turn is counterclockwise.

Push `(4, 2)`.

Stack: `[(0,0), (3,0), (4,2)]`.

The popped point is inside the triangle formed by the surviving frontier and later boundary.

### Process `(1, 2)`

Compute `cross((3,0), (4,2), (1,2)) = 6`.

Push `(1, 2)`.

Stack: `[(0,0), (3,0), (4,2), (1,2)]`.

This point is temporarily plausible.

The stack invariant concerns only the processed prefix.

### Process `(2, 3)`

Compute `cross((4,2), (1,2), (2,3)) = -3`.

Pop `(1, 2)`.

Compute `cross((3,0), (4,2), (2,3)) = 5`.

Push `(2, 3)`.

Stack: `[(0,0), (3,0), (4,2), (2,3)]`.

### Process `(3, 4)`

Compute `cross((4,2), (2,3), (3,4)) = -3`.

Pop `(2, 3)`.

Compute `cross((3,0), (4,2), (3,4)) = 4`.

Push `(3, 4)`.

Stack: `[(0,0), (3,0), (4,2), (3,4)]`.

### Process `(0, 4)`

Compute `cross((4,2), (3,4), (0,4)) = 6`.

Push `(0, 4)`.

Final stack: `[(0,0), (3,0), (4,2), (3,4), (0,4)]`.

Closing `(0, 4)` back to `(0, 0)` produces the left vertical hull edge.

Every consecutive triple makes a strict counterclockwise turn.

The three interior candidates were each removed at the first later point that exposed their inward turn.

### All-collinear trace

For points `(0,0)`, `(1,1)`, `(2,2)`, and `(3,3)`, every orientation is zero.

With an extreme-only policy, nearer points on the common ray are discarded.

The result is `[(0,0), (3,3)]`.

That is a segment, not a polygon with positive area.

Callers must accept this degenerate hull representation or define another contract.

## 4. Production-Ready Implementations

The implementation below returns hull vertices counterclockwise without repeating the first point.

It removes duplicate input points.

It returns only extreme endpoints on collinear boundary segments.

```python
from functools import cmp_to_key
from typing import Iterable

Point = tuple[int, int]


def cross(a: Point, b: Point, c: Point) -> int:
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def squared_distance(a: Point, b: Point) -> int:
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    return dx * dx + dy * dy


def graham_scan(points: Iterable[Point]) -> list[Point]:
    unique = sorted(set(points))
    if len(unique) <= 1:
        return unique

    pivot = min(unique, key=lambda point: (point[1], point[0]))
    candidates = [point for point in unique if point != pivot]

    def compare(a: Point, b: Point) -> int:
        turn = cross(pivot, a, b)
        if turn > 0:
            return -1
        if turn < 0:
            return 1

        distance_a = squared_distance(pivot, a)
        distance_b = squared_distance(pivot, b)
        return (distance_a > distance_b) - (distance_a < distance_b)

    candidates.sort(key=cmp_to_key(compare))

    rays: list[Point] = []
    for point in candidates:
        if rays and cross(pivot, rays[-1], point) == 0:
            rays[-1] = point
        else:
            rays.append(point)

    if len(rays) == 1:
        return [pivot, rays[0]]

    hull: list[Point] = [pivot]
    for point in rays:
        while len(hull) >= 2 and cross(hull[-2], hull[-1], point) <= 0:
            hull.pop()
        hull.append(point)

    return hull
```

The comparator orders rays without computing floating-point angles.

Its distance tie-break is increasing.

The ray-collapsing pass replaces a nearer point with the farther point on the same ray.

Python integers grow automatically, so the cross product does not overflow.

Fixed-width implementations need wider intermediates than the coordinate type may suggest.

For signed 32-bit coordinates, coordinate differences and their products can exceed signed 32-bit range.

Use a sufficiently wide integer or an exact arithmetic library.

### Executable correctness checks

```python
sample = [
    (0, 0),
    (3, 0),
    (4, 2),
    (3, 4),
    (0, 4),
    (1, 2),
    (2, 1),
    (2, 3),
]

assert graham_scan(sample) == [(0, 0), (3, 0), (4, 2), (3, 4), (0, 4)]
assert graham_scan([(1, 1)]) == [(1, 1)]
assert graham_scan([(0, 0), (1, 1), (2, 2), (3, 3)]) == [(0, 0), (3, 3)]
assert graham_scan([(0, 0), (0, 0), (1, 0), (0, 1)]) == [(0, 0), (1, 0), (0, 1)]
```

### Validate a returned hull

A useful structural test checks every cyclic turn.

```python
def has_strict_counterclockwise_turns(hull: list[Point]) -> bool:
    if len(hull) < 3:
        return True

    for index in range(len(hull)):
        a = hull[index - 2]
        b = hull[index - 1]
        c = hull[index]
        if cross(a, b, c) <= 0:
            return False

    return True


assert has_strict_counterclockwise_turns(graham_scan(sample))
```

Strict turn validation matches the extreme-only output contract.

It would be wrong for a hull contract that intentionally preserves collinear boundary points.

Production tests should also verify that every input point lies inside or on the returned polygon.

That containment check guards against a consistently oriented but incomplete boundary.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of input points and $u$ the number of unique points.

Deduplication with a hash set is expected $O(n)$ time in Python.

The subsequent deterministic ordering of the set costs $O(u \log u)$.

Choosing the pivot costs $O(u)$.

Polar sorting costs $O(u \log u)$ comparisons.

Each comparator performs a constant number of integer arithmetic operations.

Ray collapsing scans the sorted candidates once.

During the hull scan, every candidate is pushed at most once.

Every pushed candidate is popped at most once.

The total stack work is therefore $O(u)$, not $O(u^2)$.

The complete time complexity is:

$$
O(n + u\log u)=O(n\log n).
$$

If the points are already unique, the usual statement is $O(n\log n)$.

The hull scan alone is $O(n)$ after angular sorting.

The unique-point collection, candidate array, ray array, and hull stack use $O(n)$ additional space.

Comparator-based sorting may also use implementation-dependent auxiliary memory.

The hull contains $h$ vertices where $1 \le h \le n$ for nonempty input.

| Stage | Time | Extra space |
|---|---:|---:|
| Deduplicate points | Expected $O(n)$ | $O(n)$ |
| Choose pivot | $O(n)$ | $O(1)$ |
| Polar sort | $O(n\log n)$ | Sort-dependent |
| Collapse equal rays | $O(n)$ | $O(n)$ |
| Stack scan | $O(n)$ | $O(h)$ |

Computing `atan2` does not improve the asymptotic bound.

It adds floating-point cost and can make nearly collinear directions harder to order reliably.

When all points are already sorted by polar angle around a known pivot, the scan can run in linear time.

## 6. Systems Connections

### Broad-phase geometry

A hull is a compact outer approximation of a point cloud or object footprint.

Collision systems can reject clearly separated objects using their hulls before running detailed shape tests.

The hull does not preserve concavities.

It is conservative: the hull may overlap even when the original shapes do not.

### Geographic envelopes

Spatial applications use hulls to summarize sampled locations.

A convex hull can show the outer extent of observations.

It should not be interpreted as an occupied region when the data contains gaps or concave boundaries.

Coordinate reference systems matter.

Applying planar cross products directly to longitude and latitude over a large region can distort geometry.

Project coordinates appropriately before relying on Euclidean orientation.

### Shape preprocessing

Diameter and width computations often operate on a convex hull rather than every point.

After obtaining $h$ hull vertices, rotating-calipers algorithms can exploit cyclic order.

When $h \ll n$, the reduction is substantial.

### Numeric predicates are part of correctness

Orientation appears throughout computational geometry.

Segment intersection, polygon winding, triangulation, and point containment all depend on the same sign test.

Integer coordinates allow exact predicates when intermediates do not overflow.

Floating-point coordinates may require error bounds or adaptive-precision predicates.

An arbitrary epsilon can make orientation non-transitive and break sorting.

### Streaming limitations

Graham scan expects the point set before polar sorting.

It is not inherently an online hull-maintenance algorithm.

Recomputing after every inserted point wastes work for large dynamic sets.

Dynamic convex-hull data structures or batched rebuilding may fit such workloads better.

### Alternative hull algorithms

Andrew's monotone chain also runs in $O(n\log n)$ and sorts lexicographically.

It is often simpler when a general-purpose point sort is already available.

Jarvis march runs in $O(nh)$, which is attractive when the hull size $h$ is very small.

Chan's algorithm combines ideas to achieve output-sensitive $O(n\log h)$ time.

The right choice depends on input order, expected hull size, numeric representation, and implementation risk.

## 7. Practice Checklist

- Define whether duplicate input points are legal.
- Define whether collinear boundary points must be returned.
- Choose a deterministic extreme pivot.
- Use the same tie-break rule in tests and production.
- Implement orientation as a signed cross product.
- Confirm the sign convention with a known left turn.
- Avoid floating-point polar angles for integer points.
- Order equal-angle points by distance from the pivot.
- Keep only the farthest point per pivot ray for an extreme-only hull.
- Maintain strict counterclockwise turns on the stack.
- Pop repeatedly, not just once, after an invalid turn.
- Push every surviving candidate exactly once.
- Test empty input.
- Test a single unique point.
- Test two unique points.
- Test duplicate-only input.
- Test all-collinear points.
- Test a rectangle with interior points.
- Test several points on one hull edge.
- Test negative coordinates.
- Test coordinates near the numeric type's limits.
- Verify the returned orientation order.
- Verify every input point is inside or on the hull.
- Verify hull vertices come from the input.
- Do not repeat the first point unless the API contract requires a closed ring.
- Document whether output begins at the pivot.
- Use wider intermediates for fixed-width integer coordinates.
- Use a principled predicate strategy for floating-point input.
- Compare results against a simple reference implementation on random small sets.
- Select another hull algorithm when the workload is dynamic or strongly output-sensitive.

## 8. Frequently Asked Questions

### Why does Graham scan need sorting?

The stack proof relies on seeing candidate boundary points in nondecreasing direction around the pivot.

Without that order, a point popped by a later candidate might become relevant again.

### Why choose the lowest point as pivot?

It is guaranteed to be extreme and places every other point in one angular half-plane.

That simplifies polar ordering and gives a deterministic starting vertex.

### Should the scan pop on `cross < 0` or `cross <= 0`?

Use `<= 0` when the hull should contain only extreme vertices.

Use a carefully designed collinear policy when all boundary points must be kept.

Changing only this condition without changing sorting can produce inconsistent results.

### Why remove nearer points on the same pivot ray?

The farther point covers the nearer point on the same boundary segment.

The nearer point cannot be an extreme vertex of the hull.

### Does the hull include interior points?

No.

Interior points are excluded, and an extreme-only contract also excludes non-extreme points lying on hull edges.

### Is the algorithm in-place?

It can reorder and reuse the input array, but a clean implementation usually allocates sorted candidates and a hull stack.

The presented implementation uses $O(n)$ additional space.

### Can cross products overflow?

Yes in fixed-width arithmetic.

Subtracting coordinates and multiplying differences may require substantially more range than each coordinate alone.

### Why not use `atan2`?

`atan2` produces floating-point angles and does more work than an orientation comparator.

Cross products preserve exact direction ordering for bounded integer inputs with safe intermediates.

### What does the algorithm return for collinear input?

Under the extreme-only contract, it returns the two endpoints.

A one-point input returns that point, and empty input returns an empty list.

### How do I know the returned polygon contains every point?

For a counterclockwise convex hull, every input point must lie on or to the left of every directed hull edge.

That property can be checked independently in tests.

### When is Jarvis march preferable?

Jarvis march costs $O(nh)$ where $h$ is the hull size.

It can outperform sorting-based methods when $h$ is known to be tiny relative to $n$.

### Is Graham scan suitable for latitude-longitude data?

Only after choosing an appropriate geometric model.

For nonlocal geographic data, project coordinates or use spherical geometry rather than treating degrees as a flat Cartesian plane.
