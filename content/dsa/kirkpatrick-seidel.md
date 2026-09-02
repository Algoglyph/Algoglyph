# Kirkpatrick–Seidel Convex Hull: Output-Sensitive Prune and Search

![Kirkpatrick–Seidel convex hull](/images/dsa/kirkpatrick-seidel-dark.jpg#dark)

The Kirkpatrick–Seidel algorithm computes a planar convex hull in $O(n\log h)$ time, where $n$ is the number of input points and $h$ is the number of hull vertices.
Its advantage is output sensitivity: a large point cloud with a small boundary can be easier than one in which nearly every point lies on the boundary.
Its cost is implementation complexity.
The bridge routine is subtle, degeneracies matter, and careless numerical comparisons can destroy the pruning guarantee.

## 1. Historical Context & Motivation

### Why $O(n\log n)$ was not the end of the story

Comparison-based sorting gives a convenient route to a convex hull.
Sort points by coordinate, then scan them while maintaining a convex chain.
Algorithms such as Graham scan and the monotone-chain method therefore run in $O(n\log n)$ time.
That bound is excellent when the output can contain $Theta(n)$ points.
It can be wasteful when only a few points survive on the hull.

Let $h$ denote the number of vertices in the final hull.
An output-sensitive algorithm expresses its running time using both $n$ and $h$.
The desired bound is

$$
O(n\log h).
$$

If $h$ is constant, this becomes linear.
If $h=n$, it becomes the familiar $O(n\log n)$ worst-case bound.
The formula therefore adapts to the information actually returned.

### The 1986 result

David Kirkpatrick and Raimund Seidel presented an optimal output-sensitive planar convex-hull algorithm in 1986.
Its central idea is commonly summarized as **marriage before conquest**.
Ordinary divide and conquer first solves two subproblems and later discovers how their hulls connect.
Kirkpatrick–Seidel first finds a genuine hull edge crossing the division line—the marriage—and only then recurses on the surviving regions.

That reversal matters.
The discovered bridge certifies that many points cannot contribute to either remaining chain.
The recursion is charged to output vertices rather than blindly following the input size.

### Where the algorithm fits

Kirkpatrick–Seidel is primarily valuable as:

- a proof that the $O(n\log h)$ target is achievable;
- a canonical example of prune and search;
- a study in output-sensitive analysis;
- a geometric application of linear-time selection;
- a reference point for later algorithms such as Chan's algorithm.

For routine software, a monotone-chain hull is usually shorter and easier to audit.
Chan's algorithm often provides a more approachable output-sensitive implementation.
Kirkpatrick–Seidel remains important because its bridge primitive exposes the geometry behind the optimal bound.

### Problem statement

The input is a finite set $P$ of points in the Euclidean plane.
The convex hull, written $\operatorname{conv}(P)$, is the smallest convex set containing every point of $P$.
The algorithm returns the extreme boundary vertices in cyclic order.

Duplicate points do not change the hull and should be removed.
Collinear boundary points require an explicit policy.
This article returns only the extreme endpoints of a straight boundary segment.
An application that needs every boundary point can restore them afterward in edge order.

## 2. Core Mathematical Invariants

### Orientation is the basic predicate

For points $a=(a_x,a_y)$, $b=(b_x,b_y)$, and $c=(c_x,c_y)$, define

$$
\operatorname{orient}(a,b,c)
=(b_x-a_x)(c_y-a_y)-(b_y-a_y)(c_x-a_x).
$$

A positive result places $c$ to the left of the directed line $a\rightarrow b$.
A negative result places it to the right.
Zero means the three points are collinear.

For an upper chain directed from left to right, candidates lie on or above the chord joining its endpoints.
Orientation tests decide whether a point can remain above that chord without dividing by a coordinate difference.
With integer inputs, exact integer arithmetic avoids floating-point error in these tests.

### Split the boundary into two chains

Choose the left and right extreme points.
When several points have the minimum $x$ coordinate, the upper chain starts at the highest one and the lower chain starts at the lowest one.
Apply the symmetric rule at the maximum $x$ coordinate.

The full hull is the union of:

- an upper chain from the left upper extreme to the right upper extreme;
- a lower chain from the right lower extreme back to the left lower extreme.

The lower-chain problem can be transformed into an upper-chain problem by mapping $(x,y)$ to $(x,-y)$.
This symmetry keeps the core reasoning in one routine.

### The upper bridge

Let $x_m$ be a median of the candidate $x$ coordinates.
An **upper bridge** is an edge $(p,q)$ of the upper hull satisfying

$$
p_x\le x_m < q_x.
$$

The strict inequality on the right assigns a bridge consistently when a point lies on the median line.
Equivalent tie conventions are valid if used everywhere.

The supporting line through the bridge has every candidate point on or below it.
If its slope is $s$, then its intercept score at a point $r$ is

$$
r_y-sr_x.
$$

Bridge endpoints maximize this score.
Among maximizers, the leftmost and rightmost points delimit the exposed face.
If they straddle $x_m$, that face is the required bridge.

### Pairing converts geometry into selection

The bridge subroutine arbitrarily pairs candidate points.
For each nonvertical pair $(a,b)$ with $a_x<b_x$, compute

$$
s(a,b)=\frac{b_y-a_y}{b_x-a_x}.
$$

Select the median pair slope $s_m$ without fully sorting all slopes.
Then find the supporting line of slope $s_m$ by maximizing $y-s_mx$.

Three outcomes are possible:

1. The exposed face crosses $x_m$; the bridge is found.
2. The exposed face lies entirely left of $x_m$; the desired bridge has a smaller or larger slope according to the chosen upper-hull convention.
3. The exposed face lies entirely right of $x_m$; the opposite slope relation applies.

The implementation must keep those inequalities consistent with its coordinate orientation.
A sign error does not merely slow the algorithm; it may discard a true hull endpoint.

### The pruning invariant

Each failed bridge attempt retains at least one endpoint from every pair but can discard one endpoint from a constant fraction of pairs.
Pairs on the provably irrelevant side of the median slope contribute the discarded endpoints.
Vertical pairs retain only the higher endpoint for an upper bridge.

Consequently, the next bridge instance contains at most a fixed fraction of the previous candidates plus a constant term.
Its recurrence has the form

$$
T(m)\le T(\alpha m+O(1))+O(m)
$$

for a constant $\alpha<1$.
Therefore one bridge can be found in $O(m)$ time.

### The recursion invariant

Suppose the upper bridge is $(p,q)$.
The edge is already part of the final upper hull.
Only points left of $p$ can contribute to the chain ending at $p$.
Only points right of $q$ can contribute to the chain beginning at $q$.

More precisely, the left recursive candidate set contains endpoints plus points above the chord from the current left endpoint to $p$.
The right recursive candidate set contains endpoints plus points above the chord from $q$ to the current right endpoint.
Points below those chords lie inside the region already certified by convexity.
They can never become extreme later.

### Why the recursion is output-sensitive

Every nontrivial recursive call discovers at least one hull edge.
A recursion level can be charged to the hull vertices separating its subproblems.
The depth relevant to any input point is bounded by $O(\log h)$ under the algorithm's median splitting analysis.
Linear work per active level therefore sums to $O(n\log h)$.

The result is not obtained by assuming that half the points disappear at every hull recursion.
That statement is false in general.
Constant-fraction pruning belongs inside bridge finding; output-sensitive charging controls the outer recursion.

### Degenerate inputs

Several cases need deliberate treatment:

- An empty set has an empty hull.
- One unique point is its own hull.
- Two unique points form a segment.
- All-collinear points reduce to the two extremes under the endpoint-only policy.
- Duplicate points must not form zero-length pairs.
- Vertical pairs have undefined slope and keep only their upper endpoint for the upper bridge.
- Equal slopes require grouping rather than arbitrary comparison.
- Repeated $x$ coordinates require stable extreme-point rules.

These are part of the algorithm, not optional cleanup.

## 3. Step-by-Step Execution Trace

### Input and objective

Consider the points

$$
P=\{(0,0),(0,2),(1,1),(1,4),(2,2),(2,5),(3,3),(3,4),(4,0),(4,2)\}.
$$

The objective is to recover the extreme boundary while discarding interior points such as $(1,1)$ and $(2,2)$.
For readability, the trace focuses on the upper chain.

### Establish the upper endpoints

At the minimum $x=0$, the highest point is $L=(0,2)$.
At the maximum $x=4$, the highest point is $R=(4,2)$.
The direct chord $L\rightarrow R$ is horizontal.
Points $(1,4)$, $(2,5)$, $(3,3)$, and $(3,4)$ lie above it and remain upper candidates.
Points on or below it cannot create an upper vertex between $L$ and $R$.

The active upper set is therefore

$$
U=\{(0,2),(1,4),(2,5),(3,3),(3,4),(4,2)\}.
$$

### Choose the median divider

The ordered $x$ coordinates are $0,1,2,3,3,4$.
Choose $x_m=2.5$ as a divider between the middle coordinates.
Any consistent median convention is acceptable.
We now need the true upper-hull edge crossing this vertical line.

### Pair candidates

One possible arbitrary pairing is:

| Pair | Slope | Immediate observation |
|---|---:|---|
| $(0,2)$ to $(3,3)$ | $1/3$ | nonvertical |
| $(1,4)$ to $(4,2)$ | $-2/3$ | nonvertical |
| $(2,5)$ to $(3,4)$ | $-1$ | nonvertical |

The median of the three slopes is $-2/3$.
The bridge routine considers a supporting line with this slope.
For each point $r$, evaluate $r_y+(2/3)r_x$.

The maximum exposed point for this trial slope is determined from those scores.
If the leftmost and rightmost maximizers straddle $x_m$, the routine terminates.
Otherwise the location of the exposed face tells the routine which endpoint classes are safe to prune.

### Continue prune and search

Suppose this trial does not yet expose a straddling face.
The slope comparison partitions pairs into smaller, equal, and larger classes.
The side on which the supporting face appears identifies which paired endpoints cannot belong to the desired bridge.
Those endpoints are deleted.
Unpaired points and the surviving endpoints form the next candidate set.

The crucial fact is not the exact arbitrary pairing.
It is that median slope selection leaves enough pairs on each side to discard a constant fraction safely.
Different pairings may produce different intermediate sets but must return the same exposed bridge.

### Discover the bridge

For this input, the upper hull crosses $x=2.5$ along the edge

$$
p=(2,5),\qquad q=(3,4).
$$

The directed line from $p$ to $q$ has slope $-1$.
Every input point lies on or below its supporting line.
Its endpoints satisfy $2\le2.5<3$, so it is the required upper bridge.

### Form the left subproblem

The left chain runs from $L=(0,2)$ to $p=(2,5)$.
Test candidates against this chord.
Point $(1,4)$ lies above the line segment and remains relevant.
Points strictly below it cannot be upper-hull vertices on that interval.

The left recursive problem discovers two edges:

$$
(0,2)\rightarrow(1,4)
$$

and

$$
(1,4)\rightarrow(2,5).
$$

### Form the right subproblem

The right chain runs from $q=(3,4)$ to $R=(4,2)$.
The point $(3,3)$ is vertically below $q$.
It cannot be an upper extreme and is removed.
No other point lies above the chord, so the right chain is simply

$$
(3,4)\rightarrow(4,2).
$$

### Assemble the upper chain

Concatenating the left chain, bridge, and right chain yields

$$
(0,2),(1,4),(2,5),(3,4),(4,2).
$$

Each consecutive edge has all active points on or below its supporting line.
That is the geometric certificate for the upper boundary.

### Recover the lower chain

Reflect every input point across the $x$ axis.
Run the same upper-chain procedure on $(x,-y)$.
Reflect the result back and reverse its order for cyclic assembly.

For this set, the lower extremes include $(0,0)$ and $(4,0)$.
After removing duplicated left and right endpoints, combine both chains.
The final hull in counterclockwise order is

$$
(0,0),(4,0),(4,2),(3,4),(2,5),(1,4),(0,2).
$$

### Connect the trace to the invariant

The median line did not approximate the hull.
It located a real hull edge before recursion.
That edge divided the unknown upper boundary into independent left and right chains.
Chord tests removed points already certified as interior.
The bridge routine's own pruning reduced its candidate set without deleting a valid endpoint.
Those two kinds of pruning are distinct and together produce the output-sensitive bound.

## 4. Production-Ready Implementations

### Implementation warning

A full Kirkpatrick–Seidel implementation is considerably harder to review than a monotone-chain implementation.
The bridge routine needs deterministic selection, exact tie handling, vertical-pair handling, and carefully proved discard rules.
Replacing it with an all-pairs bridge search does not preserve the $O(n\log h)$ guarantee.
Sorting inside every bridge call also changes the bound.

The following pseudocode states the real decomposition without pretending that omitted numerical-policy details are trivial.

```text
KIRKPATRICK_SEIDEL(points):
    P := remove_duplicates(points)
    handle |P| <= 2

    upper_left  := highest point at minimum x
    upper_right := highest point at maximum x
    upper_candidates := points on/above upper_left -> upper_right
    upper := CONNECT_UPPER(upper_left, upper_right, upper_candidates)

    reflect every (x, y) as (x, -y)
    compute the reflected upper chain with the same procedure
    reflect that chain back to obtain the lower chain

    concatenate chains in cyclic order
    remove duplicate endpoints
    return hull

CONNECT_UPPER(left, right, candidates):
    if left == right:
        return [left]
    if no candidate lies strictly above left -> right:
        return [left, right]

    median_x := linear_select(candidate x coordinates)
    (p, q) := UPPER_BRIDGE(candidates, median_x)

    left_set := {left, p} plus candidates above left -> p
    right_set := {q, right} plus candidates above q -> right

    left_chain := CONNECT_UPPER(left, p, left_set)
    right_chain := CONNECT_UPPER(q, right, right_set)
    return left_chain + bridge_without_duplicate_endpoints + right_chain

UPPER_BRIDGE(candidates, median_x):
    while more than two candidates remain:
        pair candidates arbitrarily
        for each vertical pair:
            retain only its higher endpoint
        slopes := slopes of nonvertical pairs
        median_slope := linear_select(slopes)

        exposed := points maximizing y - median_slope * x
        p := leftmost exposed point
        q := rightmost exposed point
        if p.x <= median_x < q.x:
            return (p, q)

        classify pairs by slope relative to median_slope
        use the side of exposed to discard proved-impossible endpoints
        retain unpaired points and all non-discarded endpoints

    return the remaining straddling supporting edge
```

### Exact geometry primitives in Python

The next code is executable and useful in a tested implementation.
It deliberately provides exact predicates and a reference hull oracle rather than falsely presenting a quadratic bridge as Kirkpatrick–Seidel.

```python
from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from typing import Iterable, Sequence


@dataclass(frozen=True, order=True)
class Point:
    x: int
    y: int


def orientation(a: Point, b: Point, c: Point) -> int:
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)


def pair_slope(a: Point, b: Point) -> Fraction | None:
    if a.x == b.x:
        return None
    if b.x < a.x:
        a, b = b, a
    return Fraction(b.y - a.y, b.x - a.x)


def support_face(points: Sequence[Point], slope: Fraction) -> tuple[Point, Point]:
    if not points:
        raise ValueError("support_face requires at least one point")

    def score(point: Point) -> Fraction:
        return Fraction(point.y) - slope * point.x

    best = max(score(point) for point in points)
    exposed = [point for point in points if score(point) == best]
    return min(exposed), max(exposed)


def reference_hull(points: Iterable[Point]) -> list[Point]:
    """Andrew's monotone chain, used as an independent test oracle."""
    ordered = sorted(set(points))
    if len(ordered) <= 1:
        return ordered

    lower: list[Point] = []
    for point in ordered:
        while len(lower) >= 2 and orientation(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)

    upper: list[Point] = []
    for point in reversed(ordered):
        while len(upper) >= 2 and orientation(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)

    return lower[:-1] + upper[:-1]


sample = [
    Point(0, 0), Point(0, 2), Point(1, 1), Point(1, 4), Point(2, 2),
    Point(2, 5), Point(3, 3), Point(3, 4), Point(4, 0), Point(4, 2),
]

assert orientation(Point(0, 0), Point(1, 0), Point(1, 1)) > 0
assert pair_slope(Point(2, 5), Point(3, 4)) == Fraction(-1, 1)
assert support_face(sample, Fraction(-1, 1)) == (Point(2, 5), Point(3, 4))
assert reference_hull(sample) == [
    Point(0, 0), Point(4, 0), Point(4, 2), Point(3, 4),
    Point(2, 5), Point(1, 4), Point(0, 2),
]
```

### Engineering choices

Use exact integer orientation when input coordinates are integers and products cannot overflow the chosen integer type.
In C++, widen 64-bit coordinates to `__int128` for cross products when appropriate.
For rational support slopes, compare products rather than converting to floating point.
If coordinates are measured values, adopt a documented filtered-predicate or exact-construction library.

The bridge loop should be iterative to limit stack depth.
The outer hull recursion has depth related to the output and can also be represented by an explicit work stack.
Do not mutate a shared candidate array across sibling calls unless ownership is unambiguous.

### Testing strategy

Compare the result against an independently implemented monotone-chain oracle.
Generate random integer point sets with fixed seeds.
Add adversarial families:

- every point collinear;
- every point on a circle;
- many duplicate points;
- many points sharing one $x$ coordinate;
- rectangles with dense interior grids;
- nearly collinear coordinates;
- hulls with $h=3$, $h=4$, and $h=n$.

Normalize cyclic order before comparing hulls.
Verify that every returned vertex belongs to the input.
Verify consistent orientation around the returned polygon.
Verify every input point lies inside or on every directed hull half-plane.

## 5. Asymptotic Time & Space Complexity

### Bridge complexity

Pair construction is linear in the current candidate count $m$.
Median slope selection is linear when implemented with deterministic linear selection.
Computing the exposed support face is linear.
Pruning is linear.

Because a constant fraction is discarded after an unsuccessful trial,

$$
B(m)\le B(\alpha m+c)+cm
$$

for constants $0<\alpha<1$ and $c>0$.
The geometric series gives

$$
B(m)=O(m).
$$

Using a comparison sort for slopes changes a bridge iteration to $O(m\log m)$.
That implementation may still compute the right hull, but it no longer establishes the advertised optimal bound.

### Full hull complexity

The connect procedure spends linear work over the candidates active at a recursive frontier.
Its bridge edges partition the output chain.
The output-sensitive analysis charges a point through at most $O(\log h)$ relevant subdivisions.
Thus the upper chain costs $O(n\log h)$, and the symmetric lower chain has the same bound.

The total is

$$
O(n\log h).
$$

When $h=O(1)$, the running time is $O(n)$.
When $h=n$, the running time is $O(n\log n)$.
This matches the worst-case comparison-model lower bound while improving small-output instances.

### Space complexity

A straightforward implementation materializes candidate subsets and uses $O(n)$ auxiliary storage.
Recursion metadata is $O(h)$ in the most literal implementation, though balanced output division commonly gives smaller depth.
Explicit work stacks can remove dependence on the language call stack.
In-place partitioning can reduce allocations but makes correctness and ownership harder to audit.

### Comparison with alternatives

| Algorithm | Time | Main advantage | Main limitation |
|---|---:|---|---|
| Monotone chain | $O(n\log n)$ | short, dependable implementation | not output-sensitive |
| Graham scan | $O(n\log n)$ | familiar angular ordering | polar-sort degeneracies |
| Jarvis march | $O(nh)$ | simple and output-sensitive | poor when $h$ is large |
| Kirkpatrick–Seidel | $O(n\log h)$ | optimal output-sensitive bound | intricate bridge routine |
| Chan's algorithm | $O(n\log h)$ | modular use of simpler hull routines | parameter rounds and grouping |

Asymptotic optimality does not guarantee the lowest wall-clock time.
Selection constants, allocation, and exact arithmetic can dominate moderate inputs.

## 6. Systems Connections

### Geographic boundary extraction

Mapping systems often summarize a point set with a coarse convex envelope.
A dataset may contain millions of samples but only a small number of extreme coordinates.
That is the regime in which $h\ll n$ and output-sensitive analysis is meaningful.
The convex hull is only an envelope; it does not preserve bays, holes, or disconnected regions.

### Collision broad phases

Physics and robotics pipelines use convex shapes because intersection and support queries become tractable.
A hull can serve as a broad-phase approximation before a detailed mesh test.
Kirkpatrick–Seidel's support-line view is closely related to support mappings used by convex collision algorithms.
Applications still need a numerical policy consistent with their coordinate system.

### Database and visualization summaries

A scatter plot may contain far more points than pixels.
Computing extreme envelopes can preserve the outer shape while interior samples are aggregated separately.
An output-sensitive hull avoids paying a sorting cost solely to identify a small boundary.
It is not a substitute for density visualization because interior frequency disappears.

### Prune and search beyond geometry

The bridge routine demonstrates a reusable algorithmic pattern:

1. choose a pivot statistic using selection;
2. solve a decision question at that pivot;
3. prove that a class of candidates cannot contain the answer;
4. discard that class;
5. repeat on a constant-factor smaller instance.

Linear-time median selection and low-dimensional optimization use related reasoning.
The proof of safe deletion is the heart of the pattern.
Deleting many candidates without such a certificate is merely a heuristic.

### Streaming and external memory limits

The standard algorithm assumes candidates can be revisited and partitioned.
It is not naturally a one-pass streaming hull algorithm.
External-memory settings care about block transfers rather than only arithmetic operations.
A theoretically optimal RAM bound may therefore lose to an algorithm with sequential access and simpler storage behavior.

### Parallelism

After a bridge is found, left and right chain subproblems are independent.
They can execute concurrently if candidate partitioning does not duplicate excessive memory.
The bridge routine itself contains parallel reductions for slopes and support scores, but deterministic selection and pruning introduce synchronization.
Parallel speedup should be measured against the simpler sorting-based alternatives available on optimized platforms.

### Security and adversarial inputs

Geometry code exposed to untrusted coordinates must defend against overflow, non-finite values, and resource exhaustion.
An orientation overflow can silently reverse a turn decision.
NaN coordinates can invalidate every comparison.
Repeated points can amplify memory use if deduplication is omitted.
Validate coordinates and impose input limits at the system boundary.

## 7. Practice Checklist

### Before implementing

- Define whether collinear boundary points are retained or removed.
- Define the cyclic output orientation.
- Define behavior for zero, one, and two unique points.
- Choose exact, filtered, or approximate predicates deliberately.
- Confirm coordinate products fit the arithmetic type.
- Separate the upper-chain and lower-chain policies.
- Write the median-line tie convention down.

### While implementing the bridge

- Pair candidates without losing an odd unpaired point.
- Order nonvertical pair endpoints by $x$.
- Keep the higher endpoint of a vertical pair.
- Select the median slope without sorting if claiming $O(n\log h)$.
- Compute support scores consistently with the slope sign convention.
- Use leftmost and rightmost maximizers for an exposed face.
- Check the exact straddling predicate.
- Prove each discard rule before coding it.
- Assert that an unsuccessful iteration shrinks the candidate set.
- Preserve bridge endpoints under equal-slope ties.

### While implementing the recursion

- Include both endpoints in every subproblem.
- Keep only points above the relevant upper chord.
- Stop when no point lies strictly above the chord.
- Avoid duplicating the bridge endpoints during concatenation.
- Reflect the lower problem without changing point identity accidentally.
- Restore the requested cyclic order at the end.
- Normalize duplicated extreme coordinates.

### Correctness tests

- Test an empty input.
- Test one point repeated many times.
- Test two unique points.
- Test a horizontal collinear set.
- Test a vertical collinear set.
- Test a triangle with interior points.
- Test a rectangle with points on each edge.
- Test all points in convex position.
- Test many points with the median $x$ coordinate.
- Test negative coordinates.
- Test large integer coordinates near overflow limits.
- Compare random cases with an independent hull oracle.
- Verify containment, not just vertex equality.

### Complexity checks

- Instrument bridge candidate counts.
- Confirm geometric shrinkage on adversarial inputs.
- Ensure no hidden sort occurs inside bridge recursion.
- Ensure candidate lists are not copied more often than intended.
- Measure separately for small and large $h$.
- Compare with monotone chain before choosing the production algorithm.

### Review questions

- Can a true bridge endpoint enter a discarded class?
- Are equal slopes grouped correctly?
- Does the exposed face use exact score comparisons?
- Does the median divider handle repeated coordinates?
- Is the lower-chain symmetry exact?
- Does documentation match the collinearity policy?
- Is the claimed bound supported by the actual code?

## 8. Frequently Asked Questions

### Why is the algorithm called marriage before conquest?

It finds the bridge joining the future left and right hull chains before recursively solving those chains.
Traditional divide and conquer solves subhulls first and joins them afterward.

### What do $n$ and $h$ mean?

$n$ is the number of unique input points.
$h$ is the number of vertices returned on the convex hull under the selected collinearity policy.

### Why is $O(n\log h)$ better than $O(n\log n)$?

When the hull is small, $\log h$ can be much smaller than $\log n$.
The worst case remains $O(n\log n)$ because $h$ can equal $n$.

### Is the upper bridge just any segment crossing the median line?

No.
It must be an actual edge or exposed face of the upper convex hull, with every candidate on or below its supporting line.

### Why use the median $x$ coordinate?

It divides the geometric domain so the discovered bridge separates the remaining upper chain into left and right output portions.
Median selection also avoids a persistently unbalanced coordinate split.

### Why are median slopes used inside bridge finding?

They divide paired slopes into large classes.
After inspecting the support face, one class yields endpoints that are provably irrelevant, enabling constant-fraction pruning.

### Can I sort the slopes instead of using linear selection?

You can obtain a correct implementation that way if every other detail is right.
You cannot then cite the same optimal analysis without accounting for the added sorting costs.

### Why not test every left-right pair for the bridge?

There can be $\Theta(n^2)$ such pairs, and verifying each support line can make the routine even slower.
That approach abandons the central prune-and-search result.

### Does the algorithm retain collinear boundary points?

That depends on policy.
The formulation here returns extreme endpoints of each boundary segment; retaining all boundary points requires a deliberate post-processing or tie-handling rule.

### Is floating-point arithmetic safe?

Not automatically.
Near-collinear points and large magnitudes can make signs unreliable.
Use exact integer predicates, rational comparisons, or a tested geometry kernel when correctness matters.

### Is Kirkpatrick–Seidel the best practical convex-hull implementation?

Often it is not.
Monotone chain is compact and fast, while Chan's algorithm offers output sensitivity with more reusable pieces.
Kirkpatrick–Seidel is justified when its bound or prune-and-search structure is specifically valuable.

### How can I verify an implementation independently?

Compare normalized output with a monotone-chain oracle, then verify convex orientation and containment for every input point.
Agreement on random cases alone is weaker than checking those geometric certificates.

### What is the most common conceptual mistake?

Calling a recursive bridge-shaped program Kirkpatrick–Seidel while its bridge finder sorts or checks all pairs, then still claiming $O(n\log h)$.
Correct output and the optimal complexity proof are separate obligations.

### Does the algorithm generalize directly to three dimensions?

No.
Higher-dimensional convex hulls have different combinatorics, output sizes, and algorithms.
The planar bridge proof should not be extrapolated without a separate analysis.

### What should I learn after this algorithm?

Study Chan's convex-hull algorithm and deterministic linear-time selection.
Together they clarify two different routes to output sensitivity and the role of selection in pruning.
