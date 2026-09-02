# Chan's Algorithm: Output-Sensitive Convex Hulls, Tangent Queries & Doubling Schedules

![Chan's algorithm convex hull construction](/images/dsa/chans-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

The planar convex hull of a finite point set is the smallest convex polygon containing every point.

It is the tight elastic boundary around the points.

Many hull algorithms run in $O(n\log n)$ time for $n$ input points.

That bound is optimal when the hull itself may contain all $n$ points.

It can be wasteful when millions of points lie inside a hull with only a few vertices.

An **output-sensitive** algorithm accounts for both input size $n$ and output size $h$, the number of hull vertices.

Timothy Chan's 1996 algorithm achieves:

$$
O(n\log h).
$$

When $h$ is small, this can be much better than sorting all points once with an $O(n\log n)$ hull algorithm.

Chan's construction combines two familiar techniques.

First, divide points into small groups and compute each group's convex hull.

Second, use a gift-wrapping-style traversal over the group hulls rather than over all raw points.

The difficult part is choosing the group size without already knowing $h$.

Chan's algorithm tries rapidly growing guesses.

If a guess is too small, the traversal fails after that many output steps.

The next round uses a much larger bound.

The doubly exponential schedule makes all failed rounds collectively inexpensive compared with the successful round.

The method is a good example of algorithm composition.

Graham scan supplies local hulls.

Jarvis march supplies global output order.

Binary-search-like tangent selection prevents scanning every local hull vertex at every output step.

The geometric primitives require exact thought.

Collinear points need a declared policy.

Duplicate points need normalization.

Integer-coordinate orientation can overflow narrow types.

Floating-point orientation near collinearity can be unstable.

The algorithm also has a practical caveat.

Its asymptotic advantage comes with nontrivial implementation complexity and constant factors.

For modest point sets, a carefully implemented monotone-chain hull is often simpler and faster.

The central question is:

How can local hulls and bounded wrapping find a global hull in $O(n\log h)$ time without knowing $h$ beforehand?

## 2. Core Mathematical Invariants

Let $P$ be the deduplicated input set and let $H(P)$ be its convex hull boundary.

Let $h=|H(P)|$ under a policy that keeps only extreme vertices and excludes intermediate collinear boundary points.

### Orientation invariant

For points $a,b,c$, define the signed cross product:

$$
cross(a,b,c)=(b_x-a_x)(c_y-a_y)-(b_y-a_y)(c_x-a_x).
$$

Positive value means $a\to b\to c$ is counterclockwise.

Negative means clockwise.

Zero means collinear.

Every turn decision must use the same orientation convention.

### Local-hull coverage invariant

Partition $P$ into groups $P_1,\ldots,P_g$ of at most $m$ points.

Compute each local hull $H(P_i)$.

For any direction, an extreme point of $P_i$ is a vertex of $H(P_i)$.

Therefore a global supporting tangent need only inspect local hull vertices, never an interior point of a group.

This compression is the first source of efficiency.

### Global-next-vertex invariant

Suppose current global hull vertex is $p$.

For each local hull, find the point that is most counterclockwise relative to the directed ray from $p$ under the selected wrapping convention.

The most counterclockwise candidate across all local hulls is the next vertex of the global hull.

Every point belongs to some group.

Every group candidate dominates all points in that group for the direction decision.

Thus the global comparison covers the entire input set indirectly.

### Partial-wrap invariant

After $k$ successful wrapping steps, the emitted sequence contains the first $k$ consecutive vertices of the true global hull in counterclockwise order.

The next-point invariant extends this sequence by one vertex.

If the traversal returns to its start, it has closed the full hull.

If it has emitted $m$ vertices without closing, then the true hull has more than $m$ vertices.

That failure is informative and safe.

### Collinearity invariant

When candidate points are collinear with the current point, choose the farther one if intermediate boundary points are excluded.

This keeps only extreme endpoints of a straight hull edge.

Choosing the nearer point can create an unnecessary intermediate vertex and can prevent the intended closure bound from matching $h$.

### Round-bound invariant

Round $t$ chooses:

$$
m_t=\min(n,2^{2^t}).
$$

If $m_t\ge h$, wrapping closes within at most $h\le m_t$ steps.

The first successful round is therefore the first with a sufficiently large guess.

The previous round has $m_{t-1}<h$.

This relation bounds the successful round's logarithm by $O(\log h)$.

### Complexity invariant

For a round with group size $m$, local hull computation costs $O(n\log m)$.

There are $O(n/m)$ groups.

If tangent selection on a local hull is logarithmic, one wrapping step costs:

$$
O((n/m)\log m).
$$

At most $m$ steps cost $O(n\log m)$.

The round total remains $O(n\log m)$.

The growth schedule ensures failed-round costs form a dominated series.

### Degeneracy invariant

For zero, one, or two distinct points, the hull is the input's extreme set under the chosen ordering.

The general wrapping loop should not be invoked with an undefined start or an empty local hull.

## 3. Step-by-Step Execution Trace

Consider points whose global hull is:

$$
A\to B\to C\to D\to E\to A.
$$

Thus $h=5$.

Assume additional points lie strictly inside this pentagon.

### Round 0: guess $m=2$

Split points into groups of at most two.

Each nontrivial local hull is a segment.

Start from the lexicographically lowest point $A$.

The global tangent comparison selects $B$.

The next selections are $C$ and then $D$.

After two permitted wrapping steps, the bound is exhausted before returning to $A$.

The round cannot conclude “not a hull.”

It concludes only that the hull did not close within two vertices.

Therefore $h>2$.

### Round 1: guess $m=4$

Repartition into groups of at most four points.

Compute each local hull using a standard $O(m\log m)$ method.

Wrapping now emits:

$$
A,B,C,D.
$$

The traversal still has not returned to $A$ after four steps.

This proves $h>4$.

### Round 2: guess $m=16$

Since $m\ge n$ for a small example, one group may contain every point.

Its local hull is the global hull.

Wrapping emits:

$$
A,B,C,D,E
$$

and the next tangent returns to $A$.

The algorithm returns the closed boundary without emitting the final duplicate start point.

### One tangent decision

Suppose current vertex is $B$.

Each group offers a local candidate reached by a supporting tangent from $B$.

One group proposes $C$.

Another proposes an interior-looking point $q$.

Orientation shows:

$$
cross(B,C,q)<0
$$

under the chosen counterclockwise candidate comparison.

Thus $C$ is farther around the boundary than $q$ and remains the global candidate.

If a candidate lies collinear beyond $C$, the farther-point tie rule replaces $C$.

That replacement preserves the extreme boundary.

### Why a failed round is useful

The algorithm never guesses $h$ directly.

It turns an insufficient guess into a bounded amount of verified work.

The next guess grows so quickly that only $O(\log\log h)$ rounds occur.

More importantly, their total cost is asymptotically no larger than the last round.

## 4. Production-Ready Implementations

The implementation below uses monotone chain for local hulls.

For clarity and testability, it finds each group candidate by scanning that local hull.

That variant is correct but has $O(nh)$ wrapping cost in the successful round, not Chan's optimal tangent-query bound.

It is included to make the composition and invariants executable.

An optimal implementation replaces `best_from_hull` with a correct logarithmic tangent query over cyclically ordered hull vertices.

```python
from collections.abc import Iterable


Point = tuple[int, int]


def cross(a: Point, b: Point, c: Point) -> int:
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])


def distance_squared(a: Point, b: Point) -> int:
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2


def monotone_chain(points: Iterable[Point]) -> list[Point]:
    ordered = sorted(set(points))
    if len(ordered) <= 1:
        return ordered

    def build(sequence: list[Point]) -> list[Point]:
        hull: list[Point] = []
        for point in sequence:
            while len(hull) >= 2 and cross(hull[-2], hull[-1], point) <= 0:
                hull.pop()
            hull.append(point)
        return hull

    lower = build(ordered)
    upper = build(list(reversed(ordered)))
    return lower[:-1] + upper[:-1]


def is_better_turn(origin: Point, candidate: Point, challenger: Point) -> bool:
    turn = cross(origin, candidate, challenger)
    return turn < 0 or (turn == 0 and distance_squared(origin, challenger) > distance_squared(origin, candidate))


def best_from_hull(origin: Point, hull: list[Point]) -> Point | None:
    best: Point | None = None
    for point in hull:
        if point == origin:
            continue
        if best is None or is_better_turn(origin, best, point):
            best = point
    return best


def chans_hull_reference(points: Iterable[Point]) -> list[Point]:
    unique = sorted(set(points))
    if len(unique) <= 2:
        return unique

    n = len(unique)
    round_number = 0
    while True:
        m = min(n, 2 ** (2 ** round_number))
        local_hulls = [
            monotone_chain(unique[start:start + m])
            for start in range(0, n, m)
        ]
        start = min(unique)
        output = [start]
        current = start

        for _ in range(m):
            next_point: Point | None = None
            for hull in local_hulls:
                candidate = best_from_hull(current, hull)
                if candidate is not None and (
                    next_point is None or is_better_turn(current, next_point, candidate)
                ):
                    next_point = candidate
            assert next_point is not None
            if next_point == start:
                return output
            output.append(next_point)
            current = next_point

        round_number += 1
```

The local chain removes collinear intermediate points through `<= 0`.

The farther-point tie rule agrees with that extreme-vertex policy.

The function returns a counterclockwise boundary without repeating its start point.

### Validation against monotone chain

```python
sample = [
    (0, 0), (4, 0), (5, 2), (3, 5), (0, 4),
    (1, 1), (2, 2), (3, 2), (2, 3), (0, 0),
]
assert chans_hull_reference(sample) == monotone_chain(sample)

assert chans_hull_reference([]) == []
assert chans_hull_reference([(2, 3), (2, 3)]) == [(2, 3)]
assert chans_hull_reference([(2, 3), (1, 1)]) == [(1, 1), (2, 3)]
assert chans_hull_reference([(0, 0), (1, 0), (2, 0), (3, 0)]) == [(0, 0), (3, 0)]
```

### Randomized differential test

```python
from random import Random


rng = Random(47)
for _ in range(700):
    points = [
        (rng.randrange(-20, 21), rng.randrange(-20, 21))
        for _ in range(rng.randrange(0, 80))
    ]
    assert chans_hull_reference(points) == monotone_chain(points)
```

### Production notes

Use a logarithmic tangent routine before claiming $O(n\log h)$ time in production.

That routine must handle one-point and two-point local hulls explicitly.

For integer coordinates, use an orientation type wide enough for coordinate differences and products.

For floating coordinates, use a documented tolerance policy or exact predicates when geometric correctness is critical.

Avoid using an arbitrary epsilon in both ordering and equality without proving its consistency.

For ordinary application hulls, benchmark a monotone-chain implementation first; its simpler control flow often wins below large input sizes.

## 5. Asymptotic Time & Space Complexity

With group size $m$, computing local hulls costs $O(n\log m)$.

There are $O(n/m)$ group hulls.

An optimal cyclic-hull tangent query costs $O(\log m)$.

Each wrapping step then compares $O(n/m)$ candidates and costs:

$$
O((n/m)\log m).
$$

At most $m$ wrapping steps cost $O(n\log m)$.

The whole round costs $O(n\log m)$.

At the successful round, $m$ is related to $h$ by the doubling schedule, so $\log m=O(\log h)$.

Earlier rounds form a rapidly growing sequence and do not change the final bound.

The resulting time is:

$$
O(n\log h).
$$

Since $h\le n$, this is never asymptotically worse than $O(n\log n)$.

When $h$ is constant, it is linear in $n$.

The reference implementation scans local hull vertices for each tangent candidate.

It does not meet the tangent-query assumption.

Its wrapping phase can become $O(nh)$, and it should be understood as a correctness reference.

Local hull storage totals $O(n)$ vertices across groups.

The output stores $O(h)$ vertices.

Temporary sorting and local-chain storage use $O(n)$ space in the displayed Python implementation.

The working-space bound is $O(n)$.

## 6. Systems Connections

### Collision and visibility boundaries

Convex hulls provide compact outer boundaries for broad-phase collision checks and visibility approximations.

The hull discards concavities, so it is not a replacement for exact collision geometry.

### Geographic summarization

Point clouds from locations, sensors, or map features can be summarized by a hull for overview rendering.

Coordinate projection matters: longitude-latitude arithmetic is not planar Euclidean geometry over large regions.

### Computational geometry pipelines

Hull vertices often seed rotating-calipers diameter computations, minimum-area rectangles, and farthest-pair algorithms.

Keeping collinear policy consistent across stages prevents surprising duplicate-edge behavior.

### Output-sensitive design

Chan's schedule is a general pattern: use bounded attempts whose cost depends on a guessed output scale, then grow guesses rapidly.

The failed attempts must be structured so their total does not dominate the successful one.

### Parallel local computation

Group hulls are independent within a round and can be computed in parallel.

The wrapping phase is sequential because each next global vertex depends on the previous one.

Load balancing and deterministic group partitioning affect practical performance.

### Numerical reliability

Near-collinear floating input can change turn signs due to rounding.

In CAD, scientific, or legal-boundary applications, use a geometry library with appropriate predicate guarantees rather than treating a tiny epsilon as universal.

### Data reduction

Removing duplicates before grouping reduces work and makes hull size semantics clear.

It should preserve any application-level multiplicity metadata separately if that metadata matters.

## 7. Practice Checklist

- Define the hull boundary and collinearity policy.
- Deduplicate points before grouping.
- State the orientation sign convention.
- Use a sufficiently wide type for cross products.
- Prove local hulls retain all directional extreme points.
- Prove the next-point comparison covers every group.
- Choose the farther collinear candidate for extreme-only hulls.
- Treat zero, one, and two-point inputs separately.
- Verify local hull orientation is consistent.
- Bound every wrapping round by its guessed size.
- Treat failure to close as an insufficient guess, not an error.
- Use the doubly exponential schedule correctly.
- Distinguish the reference scan from logarithmic tangent search.
- Do not claim $O(n\log h)$ without tangent-query support.
- Differential-test against a simpler trusted hull algorithm.
- Test duplicates.
- Test all-collinear points.
- Test points already on a convex polygon.
- Test interior points.
- Test negative coordinates.
- Test different input permutations.
- Define floating-point policy before supporting floats.
- Benchmark against monotone chain on expected data sizes.
- Retain group partitions only as long as the round needs them.
- Document whether the output repeats the start vertex.

## 8. Frequently Asked Questions

### What does output-sensitive mean?

The running time depends on both input size $n$ and output size $h$.

For Chan's algorithm the target bound is $O(n\log h)$.

### Why not just use an $O(n\log n)$ hull algorithm?

For many workloads that is the best engineering choice.

Chan's algorithm matters when $h$ is much smaller than $n$ and implementation complexity is justified.

### Why are local hulls sufficient?

An interior group point cannot be extreme in any direction for the entire set.

Any global tangent reaches a directional extreme of its own group.

### Why does the algorithm need rounds?

It does not know $h$ in advance.

Rounds try a bounded output length and grow the bound until closure occurs.

### What happens if the guess is too small?

The algorithm stops that round after the bound without returning a hull, then retries with a larger group size.

### Is the displayed code optimally fast?

No.

It scans local hulls for clarity; an $O(n\log h)$ implementation needs logarithmic tangent queries.

### Why choose the farther collinear point?

It removes intermediate collinear boundary points and preserves the extreme endpoint needed for the intended hull definition.

### Does Chan's algorithm work with floating-point coordinates?

It can, but orientation and equality decisions need a carefully specified numerical policy.

Exact integer predicates are simpler when coordinates are integral and bounded.

### Does it return clockwise or counterclockwise order?

That depends on implementation conventions.

The code here returns the monotone-chain convention used by its local hull routine and verifies against that reference.

### Is the hull unique?

The convex region is unique.

The vertex sequence depends on start-point, orientation, and collinear-boundary policy.

### Can the local hulls be parallelized?

Yes.

They are independent within a round, while global wrapping remains sequential.

### What is the main implementation risk?

Tangent selection and degenerate geometry are the usual sources of subtle bugs.

Test them against a simpler hull algorithm before optimizing.
