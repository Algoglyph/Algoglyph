# Jarvis March: Wrapping a Convex Hull One Supporting Edge at a Time

![Jarvis march selecting successive convex hull points](/images/dsa/jarvis-march-dark.jpg#dark)

## 1. Historical Context & Motivation

Jarvis march constructs a convex hull by walking around the outside of a point set.

It is also called the **gift-wrapping algorithm**.

Imagine wrapping paper tightly around scattered objects.

Starting from one extreme point, each next fold touches the point that leaves every other point on the same side of the new edge.

The chosen edge is a supporting edge of the convex hull.

Repeating this choice returns to the starting point after visiting every extreme hull vertex.

The algorithm solves the same geometric problem as Graham scan.

Its cost depends differently on output size.

Graham scan sorts all points and takes $O(n\log n)$ time.

Jarvis march performs a full point scan for every hull vertex and takes $O(nh)$ time, where $h$ is the hull size.

When only a few points lie on the hull, $h$ may be much smaller than $\log n$ in practical comparisons.

When every point lies on the hull, the algorithm becomes quadratic.

This makes Jarvis march **output-sensitive**.

Its runtime depends on both input size and result size.

The core primitive is orientation.

For current hull point `p`, compare candidate `q` with every other point `r`.

If `r` lies farther around the desired wrapping direction, replace `q` with `r`.

After one complete scan, `q` is the next hull vertex.

Collinear points require a distance tie-break.

Without it, the algorithm may choose a nearer point on a hull edge, retain non-extreme boundary points unintentionally, or fail to advance cleanly.

Duplicate coordinates should be removed or handled explicitly.

Floating-point orientation introduces numerical questions near collinearity.

Integer coordinates permit exact cross-product signs when intermediate arithmetic does not overflow.

The algorithm is attractive for teaching because its proof matches its physical wrapping metaphor.

It also exposes the limits of metaphors: correctness still rests on supporting-line invariants and precise tie rules.

The central question is:

How can one full scan certify the next counterclockwise supporting edge, and why does repeating that scan enumerate exactly the convex hull?

## 2. Core Mathematical Invariants

Represent a point as $p=(p_x,p_y)$.

Define the orientation cross product:

$$
\operatorname{cross}(p,q,r)
=(q_x-p_x)(r_y-p_y)-(q_y-p_y)(r_x-p_x).
$$

A positive value means `p -> q -> r` turns counterclockwise.

A negative value means clockwise.

Zero means collinear.

The sign convention must remain consistent throughout candidate replacement.

### Starting-point invariant

Choose the point with minimum $x$ coordinate.

Break ties using minimum $y$ coordinate.

No point lies strictly to its left.

A vertical supporting line through that point leaves the point set in one closed half-plane.

Therefore it is a convex-hull vertex.

The tie-break makes output deterministic.

### Candidate invariant during one scan

Fix current hull point $p$.

After processing some subset of points, candidate $q$ is the most counterclockwise endpoint among those processed under the chosen comparison rule.

When new point $r$ is more counterclockwise than $q$, replace `q` with `r`.

When all points have been processed, no point lies outside the directed supporting line from $p$ to $q$ on the forbidden side.

Thus segment $(p,q)$ is a hull edge.

### Supporting-edge invariant

Every accepted edge joins two points from the input.

All input points lie on or inside one side of its directed line.

A segment with this property supports the convex hull.

The walk never selects an edge passing through the interior of the convex polygon.

### Collinear distance invariant

Suppose `p`, current candidate `q`, and challenger `r` are collinear.

For an extreme-vertex-only hull, keep whichever of `q` and `r` is farther from `p`.

Use squared distance:

$$
d^2(p,q)=(q_x-p_x)^2+(q_y-p_y)^2.
$$

The nearer point lies on the segment to the farther point.

It is not an extreme endpoint.

No square root is needed.

### Hull-prefix invariant

Before choosing the next point, the output list contains consecutive hull vertices in wrapping order from the start through current point $p$.

Every edge already recorded is a supporting edge.

No recorded extreme vertex repeats except the start used as the termination sentinel.

### Closure invariant

The convex hull boundary is a finite cycle.

From every hull vertex, the next supporting edge in a fixed orientation is unique after collinear extreme tie-breaking.

Repeated steps eventually select the start again.

That selection closes the cycle and terminates output construction.

The start should not be appended a second time unless the API promises a closed polygonal ring.

### All-collinear invariant

When all unique points are collinear, only the two extreme endpoints belong to an extreme-vertex hull.

Distance tie-breaking chooses the far endpoint from the start.

The next wrap returns to the start.

The result contains two points.

### Progress invariant

For at least two distinct points, the chosen candidate is never the current point.

Initialize it to another point before scanning challengers.

Deduplication prevents a different array entry with identical coordinates from defeating progress.

## 3. Step-by-Step Execution Trace

Use points:

```text
(0,0), (2,0), (4,1), (4,4), (2,3), (0,4), (1,2), (3,2)
```

The extreme hull is:

```text
(0,0), (0,4), (4,4), (4,1), (2,0)
```

for the clockwise/counterclockwise convention used in this trace.

Interior points are `(1,2)`, `(2,3)`, and `(3,2)`.

### Select the start

Minimum $x$ is zero.

Points `(0,0)` and `(0,4)` tie.

Minimum $y$ chooses `(0,0)`.

Append it to the hull.

Call it current point `p`.

### Wrap from `(0,0)`

Initialize candidate to any distinct point, such as `(2,0)`.

Scan challengers.

Point `(0,4)` is more counterclockwise under the selected orientation rule.

Replace the candidate with `(0,4)`.

Other points lie on the interior side of directed edge `(0,0) -> (0,4)`.

After the scan, choose `(0,4)`.

The left vertical edge is supporting.

### Wrap from `(0,4)`

Initialize a distinct candidate.

Compare all points around `(0,4)`.

Point `(4,4)` produces the outer top supporting direction.

Point `(2,3)` lies below that line.

Interior points cannot replace `(4,4)`.

Append `(4,4)`.

### Wrap from `(4,4)`

Scan the complete set again.

Point `(4,1)` defines the right supporting edge.

Points `(3,2)` and `(2,3)` lie inside.

Append `(4,1)`.

### Wrap from `(4,1)`

The next supporting direction reaches `(2,0)`.

Point `(2,0)` is more extreme than interior candidate `(3,2)`.

Append `(2,0)`.

### Wrap from `(2,0)`

The next supporting scan selects start `(0,0)`.

The cycle closes.

Do not append the start again for an open vertex-list contract.

Final hull has five vertices.

### Collinear boundary trace

Add point `(1,0)` between `(0,0)` and `(2,0)`.

When wrapping toward the bottom edge, orientation among those three points is zero.

Distance from the relevant current endpoint chooses `(2,0)` or `(0,0)`, whichever is farther along that edge.

The middle point `(1,0)` is excluded from an extreme-only result.

### Output-sensitive work

There are $n=8$ points and $h=5$ hull vertices.

The algorithm scans roughly eight points for each of five wrap steps.

The dominant work is proportional to $8\times5=40$ orientation checks, plus constants.

If only three hull vertices existed, only three full scans would be required.

If all eight points were extreme, eight scans would be required.

## 4. Production-Ready Implementations

The implementation returns unique extreme hull vertices without repeating the start.

It uses integer arithmetic and a deterministic starting point.

```python
from collections.abc import Iterable

Point = tuple[int, int]


def cross(a: Point, b: Point, c: Point) -> int:
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def distance_squared(a: Point, b: Point) -> int:
    dx = b[0] - a[0]
    dy = b[1] - a[1]
    return dx * dx + dy * dy


def jarvis_march(points: Iterable[Point]) -> list[Point]:
    unique = sorted(set(points))
    if len(unique) <= 2:
        return unique

    start = min(unique, key=lambda point: (point[0], point[1]))
    hull: list[Point] = []
    current = start

    while True:
        hull.append(current)
        candidate = unique[0] if unique[0] != current else unique[1]

        for challenger in unique:
            if challenger == current:
                continue

            turn = cross(current, candidate, challenger)
            if turn > 0 or (
                turn == 0
                and distance_squared(current, challenger)
                > distance_squared(current, candidate)
            ):
                candidate = challenger

        current = candidate
        if current == start:
            break

    return hull
```

The sign `turn > 0` chooses one consistent wrapping direction for the coordinate convention.

Reversing the sign reverses output orientation but can remain correct when used consistently.

### Execute representative cases

```python
sample = [
    (0, 0),
    (2, 0),
    (4, 1),
    (4, 4),
    (2, 3),
    (0, 4),
    (1, 2),
    (3, 2),
]

assert jarvis_march(sample) == [(0, 0), (0, 4), (4, 4), (4, 1), (2, 0)]
assert jarvis_march([]) == []
assert jarvis_march([(1, 1)]) == [(1, 1)]
assert jarvis_march([(0, 0), (1, 1), (2, 2), (3, 3)]) == [(0, 0), (3, 3)]
assert jarvis_march([(0, 0), (0, 0), (2, 0), (0, 2)]) == [(0, 0), (0, 2), (2, 0)]
```

### Validate supporting edges

For the chosen clockwise orientation, every input point must lie on or to the right of each directed hull edge.

```python
def edges_support_all_points(hull: list[Point], points: Iterable[Point]) -> bool:
    materialized = list(points)
    if len(hull) < 3:
        return True

    for index, start_point in enumerate(hull):
        end_point = hull[(index + 1) % len(hull)]
        if any(cross(start_point, end_point, point) > 0 for point in materialized):
            return False
    return True


result = jarvis_march(sample)
assert edges_support_all_points(result, sample)
```

This checks containment-side orientation but should be combined with uniqueness and input-membership checks.

Floating-point coordinates need a documented exact-predicate or error-bound strategy.

An arbitrary epsilon can make orientation comparisons inconsistent.

### Failure boundaries worth testing

A comparator that replaces on both turn signs is not an orientation rule.

It merely makes the last scanned point win.

A comparator that omits the collinear distance test can select an interior point on a flat edge.

That choice can add unwanted boundary points or stall on duplicate coordinates.

Selecting the start by minimum $x$ without a deterministic tie-break makes output rotation unstable across input orders.

Appending the start before testing closure creates a duplicated endpoint under an open-ring API.

Using a mutable global candidate across wrap steps leaks state from one supporting-edge search into the next.

Each wrap step must initialize its own distinct candidate.

These are structural failures, not cosmetic output differences.

The independent supporting-edge assertion detects a sign mismatch immediately.

Keep that assertion when refactoring the comparator.

It protects the geometric contract rather than one memorized vertex list.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of unique input points.

Let $h$ be the number of returned hull vertices.

Selecting the start costs $O(n)$ after deduplication.

Each wrap step scans all $n$ points.

There are exactly $h$ wrap steps before returning to the start.

The geometric core therefore costs:

$$
O(nh).
$$

When $h$ is constant, this is linear in $n$.

When every point lies on the hull, $h=n$ and time is $O(n^2)$.

Deduplicating with a hash set is expected $O(n)$, while the presented deterministic `sorted(set(...))` step costs $O(n\log n)$.

That preprocessing can dominate when $h$ is tiny.

A version using a hash set without sorting retains expected $O(n)$ deduplication and deterministic start selection through a scan.

The returned hull uses $O(h)$ space.

The scan itself uses $O(1)$ auxiliary state beyond input and output.

The `unique` collection uses $O(n)$ space in the presented implementation.

| Case | Hull size $h$ | Geometric time |
|---|---:|---:|
| Triangle-like outer boundary | `3` | $O(n)$ |
| Small fixed hull | $O(1)$ | $O(n)$ |
| Moderate hull | problem-dependent | $O(nh)$ |
| Every point extreme | $n$ | $O(n^2)$ |

Graham scan's $O(n\log n)$ bound is independent of $h$.

Chan's algorithm achieves $O(n\log h)$ by combining output-sensitive wrapping with grouped hull computations.

Asymptotic selection should consider expected hull size.

## 6. Systems Connections

### Shape simplification

A hull summarizes the external envelope of a point cloud.

Collision systems can use it as a broad-phase boundary.

The hull includes empty concave regions, so overlap does not prove detailed shapes intersect.

It only prevents false negatives for contained input points.

### Sparse extreme outputs

Some geographic or measurement point sets contain millions of interior samples but few extreme boundary points.

Jarvis march's output sensitivity is attractive in theory for small $h$.

Its repeated full scans can still be bandwidth-heavy.

Data layout and parallel scan strategies affect practical performance.

### Streaming constraints

The algorithm repeatedly rereads all points.

It can operate over a rewindable stream for each hull step without retaining every point, trading memory for repeated I/O.

A one-pass non-rewindable stream does not support ordinary Jarvis march directly.

### Numeric predicates

Orientation is a reusable systems primitive.

Segment intersection, polygon clipping, triangulation, and winding checks rely on the same sign.

Fixed-width integer products can overflow even when coordinates individually fit.

Use wider intermediates or exact arithmetic.

Floating-point robustness requires more than adding a convenient epsilon.

### Parallelization

Within one wrap step, challengers can be partitioned among workers.

Each worker returns its local best candidate.

Those candidates must be reduced with the same orientation and distance comparator.

Wrap steps remain sequential because the next current vertex depends on the previous result.

### Choosing another hull algorithm

Graham scan and monotone chain give predictable $O(n\log n)$ time.

Jarvis march fits small expected hulls and simple output-sensitive reasoning.

Chan's algorithm gives stronger output-sensitive bounds with more implementation complexity.

Dynamic hull workloads need structures designed for insertions and deletions.

### Geospatial caution

Longitude and latitude are not a flat Cartesian plane over large regions.

Project local coordinates or use spherical geometry before interpreting planar cross products.

The chosen projection can change which sampled points appear extreme.

## 7. Practice Checklist

- Remove or explicitly handle duplicate coordinates.
- Choose a deterministic extreme starting point.
- Confirm the cross-product sign convention.
- Initialize the candidate to a point distinct from current.
- Scan every unique point at each wrap step.
- Replace the candidate only under one consistent orientation rule.
- Use distance to resolve collinear candidates.
- Keep the farther collinear point for an extreme-only hull.
- Stop when the next selected point equals the start.
- Do not append the start twice unless the API promises a closed ring.
- Test empty input.
- Test one point.
- Test two points.
- Test duplicate-only input.
- Test all-collinear input.
- Test a triangle with interior points.
- Test a rectangle with edge-collinear points.
- Test negative coordinates.
- Test large coordinate magnitudes.
- Verify every hull point comes from the input.
- Verify hull points are unique.
- Verify every directed edge is supporting.
- Verify all input points lie inside or on the hull.
- Compare random small cases with another hull implementation.
- State whether boundary-collinear points are retained.
- State clockwise or counterclockwise output order.
- Use sufficiently wide integer intermediates.
- Use principled predicates for floating-point input.
- Consider $h$ when choosing among hull algorithms.
- Include deduplication cost in the complete complexity statement.

## 8. Frequently Asked Questions

### Why is it called gift wrapping?

Each step chooses the next point that lets a supporting line wrap around the outside of the set, like folding material around an object.

### What does output-sensitive mean?

Runtime depends on output size $h$ as well as input size $n$.

Jarvis march takes $O(nh)$ time.

### How is Jarvis march different from Graham scan?

Graham scan sorts points once and scans them in $O(n\log n)$ time.

Jarvis march scans all points once per hull vertex and takes $O(nh)$.

### When is Jarvis march faster asymptotically?

When $h<\log n$, the geometric $nh$ term is below $n\log n$.

Preprocessing and constants still matter in a real implementation.

### Why choose the farthest collinear point?

Nearer points lie on the segment to the farther endpoint and are not extreme vertices.

Choosing the farthest point also guarantees progress along a flat hull edge.

### What happens when all points are collinear?

An extreme-only implementation returns the two endpoints.

An API that includes every boundary point would need a different collinear-output policy.

### Can the algorithm loop forever?

A correct implementation on unique finite points returns to the start.

Bad candidate initialization, inconsistent orientation, or duplicate handling can break progress.

### Is the hull output clockwise?

It depends on the orientation comparison sign.

The presented implementation returns the trace's clockwise order from the leftmost-lowest start.

### Does the algorithm need angles?

No.

Cross products compare candidate directions without trigonometry or floating-point angle calculation.

### Is the scan parallelizable?

Candidate evaluation within one step can be reduced in parallel.

Successive hull steps remain dependent on the selected current point.

### Which hull algorithm should I use in production?

Use monotone chain or Graham scan for straightforward $O(n\log n)$ behavior, Jarvis march for small expected hulls, and stronger output-sensitive methods when their complexity is justified.
