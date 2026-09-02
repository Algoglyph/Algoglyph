# Bresenham's Line Algorithm: Integer Error Accumulation, Raster Coverage & Exact Endpoints

![Bresenham line rasterization](/images/dsa/bresenhams-line-dark.jpg#dark)

## 1. Historical Context & Motivation

A mathematical line is continuous, but a raster display exposes only discrete pixel centers.

Drawing a segment therefore requires choosing a finite sequence of grid cells that visually approximates the ideal line.

The choice must be deterministic.

It should include both requested endpoints.

It should avoid holes.

It should advance monotonically from start to finish.

It should also be inexpensive enough to repeat for thousands of edges per frame.

Early vector displays could steer a beam continuously.

Raster devices instead stored a rectangular array of picture elements.

That hardware change made line drawing a discrete algorithmic problem.

Jack Elton Bresenham developed his line algorithm at IBM in the early 1960s.

Its defining achievement was replacing per-pixel floating-point slope calculations with integer addition, subtraction, and comparison.

Those operations matched the capabilities of contemporary hardware particularly well.

The same idea remains valuable even when floating-point arithmetic is fast.

Integer state gives reproducible output across machines.

The loop has a small and predictable instruction footprint.

The emitted pixels are connected under the usual grid-neighborhood interpretation.

The method also illustrates a broader DSA technique: maintain an incremental decision error instead of recomputing an exact expression at every step.

Consider a segment from $(0,0)$ to $(7,3)$.

The real-valued equation is $y=3x/7$.

Rounding that expression independently for every integer $x$ would produce plausible pixels.

It would also perform multiplication and division repeatedly.

Bresenham transforms the same comparison into a recurrence.

Each iteration asks whether the path should continue along its major axis only or also step along its minor axis.

For a shallow line, every iteration moves one column.

Some iterations additionally move one row.

For a steep line, the roles are symmetric.

For negative slopes, the row direction changes sign.

For reversed endpoints, both directions may change.

A robust implementation must cover all octants rather than only the textbook case $0\le m\le1$.

The algorithm solves raster selection, not geometric clipping.

If a segment extends outside an image, a production renderer normally clips it first.

Otherwise the loop may visit an enormous number of off-screen coordinates.

Line thickness, antialiasing, joins, and caps are also separate concerns.

Classic Bresenham emits a one-pixel-wide aliased centerline.

That narrow scope is a strength: it gives a precise primitive on which richer rendering can build.

The central question is:

How can a program choose the next grid point closest to an ideal segment using only incremental integer state?

## 2. Core Mathematical Invariants

Let the endpoints be $(x_0,y_0)$ and $(x_1,y_1)$.

Define unsigned coordinate differences:

$$
d_x=|x_1-x_0|,\qquad d_y=|y_1-y_0|.
$$

Define step directions:

$$
s_x=\begin{cases}1 & x_0<x_1\\-1 & x_0>x_1\\0 & x_0=x_1\end{cases}
$$

and define $s_y$ analogously.

An implicit equation for the infinite line through the endpoints is:

$$
F(x,y)=d_y(x-x_0)-d_x(y-y_0)=0
$$

after orienting the signs consistently.

The sign of $F$ identifies the side of the ideal line on which a candidate lies.

Its magnitude is proportional to perpendicular distance because the denominator $\sqrt{d_x^2+d_y^2}$ is constant for the segment.

### Major-axis progress

In the shallow-octant derivation, $d_x\ge d_y\ge0$.

Exactly one $x$ step occurs per iteration.

The algorithm decides between east $(x+1,y)$ and north-east $(x+1,y+1)$.

Thus the major coordinate never stalls and never reverses.

The general all-octant algorithm preserves the equivalent property without explicitly swapping axes.

At least one coordinate moves toward its target on every nonterminal iteration.

Neither coordinate ever moves away from its target.

Therefore termination occurs after exactly $\max(d_x,d_y)$ transitions.

Including the initial point, the output contains:

$$
\max(d_x,d_y)+1
$$

pixels.

### Midpoint decision for a shallow line

Suppose the current pixel is $(x_k,y_k)$.

After the mandatory $x$ step, compare the ideal line with the midpoint between the two candidate rows:

$$
M_k=(x_k+1,\ y_k+\tfrac12).
$$

If the line lies below this midpoint, choose the lower candidate.

If it lies above the midpoint, choose the upper candidate.

Multiplying the decision expression by two removes the fraction.

The initial decision value becomes:

$$
p_0=2d_y-d_x.
$$

If the lower pixel is selected, the recurrence is:

$$
p_{k+1}=p_k+2d_y.
$$

If the upper pixel is selected, it is:

$$
p_{k+1}=p_k+2(d_y-d_x).
$$

No division remains in the loop.

### Error accumulator in the symmetric formulation

A compact all-octant formulation sets:

$$
e=d_x-d_y.
$$

At a current point, save $e_2=2e$ before changing either coordinate.

If $e_2>-d_y$, advance $x$ and subtract $d_y$ from $e$.

If $e_2<d_x$, advance $y$ and add $d_x$ to $e$.

Both conditions may be true.

When both are true, the path advances diagonally.

Using two independent `if` statements is essential.

Changing the second condition to `elif` breaks diagonal motion.

The saved value $e_2$ is also essential.

Testing the second branch against the already-updated error changes the decision boundary.

### Connectivity invariant

Between successive outputs, each coordinate changes by at most one.

At least one coordinate changes by exactly one.

Therefore consecutive pixels are 8-neighbors.

The raster path cannot contain a gap under 8-connectivity.

Axis-aligned lines are also 4-connected because only one coordinate changes.

### Endpoint invariant

The current point is emitted before the termination test.

The loop stops only when both coordinates equal the requested destination.

Consequently both endpoints appear exactly once for a non-repeated traversal.

The degenerate segment with identical endpoints emits one pixel.

### Reversal behavior

Reversing the endpoints reverses the intended geometric traversal.

Tie-breaking can complicate exact sequence symmetry in some variants.

The comparison choices in this article use strict inequalities from the symmetric formulation.

They produce a consistent connected approximation in every octant.

If an application requires byte-for-byte reversal symmetry, test that contract explicitly and choose its tie rule deliberately.

### Integer-range invariant

The algorithm avoids floating point, but it does not avoid finite-width overflow.

Values such as $2e$ may exceed a narrow coordinate type.

If coordinates are signed 32-bit integers, the differences and doubled error should use a wider integer type.

Python integers expand automatically.

C++ implementations commonly use `std::int64_t` for the arithmetic even when output coordinates are 32-bit.

## 3. Step-by-Step Execution Trace

Trace the segment from $(0,0)$ to $(7,3)$.

The expected result is a connected left-to-right raster whose final pixel is $(7,3)$.

The differences and directions are:

$$
d_x=7,\quad d_y=3,\quad s_x=1,\quad s_y=1.
$$

Initialize:

$$
e=d_x-d_y=4.
$$

The symmetric loop emits the current point, computes $e_2=2e$, and applies both eligible moves.

| Step | Emitted pixel | $e$ before | $e_2$ | Move $x$? | Move $y$? | $e$ after |
|---:|---|---:|---:|---|---|---:|
| 0 | $(0,0)$ | 4 | 8 | yes | no | 1 |
| 1 | $(1,0)$ | 1 | 2 | yes | yes | 5 |
| 2 | $(2,1)$ | 5 | 10 | yes | no | 2 |
| 3 | $(3,1)$ | 2 | 4 | yes | yes | 6 |
| 4 | $(4,2)$ | 6 | 12 | yes | no | 3 |
| 5 | $(5,2)$ | 3 | 6 | yes | yes | 7 |
| 6 | $(6,3)$ | 7 | 14 | yes | no | 4 |
| 7 | $(7,3)$ | 4 | — | stop | stop | 4 |

At step 0, $e_2=8>-3$, so $x$ advances.

The error becomes $4-3=1$.

The saved $e_2=8$ is not less than $7$, so $y$ stays zero.

At step 1, $e_2=2$ satisfies both branch conditions.

Advancing $x$ changes the error to $1-3=-2$.

Advancing $y$ then adds $7$, producing $5$.

The new pixel is $(2,1)$.

This diagonal correction keeps the discrete path near the rising ideal line.

The complete emitted sequence is:

$$
(0,0),(1,0),(2,1),(3,1),(4,2),(5,2),(6,3),(7,3).
$$

Every adjacent pair differs by either $(1,0)$ or $(1,1)$.

No coordinate reverses.

Both endpoints are present.

There are $\max(7,3)+1=8$ pixels, matching the progress invariant.

### A steep negative-slope trace

Now trace from $(2,6)$ to $(5,0)$.

Here:

$$
d_x=3,\quad d_y=6,\quad s_x=1,\quad s_y=-1,\quad e=-3.
$$

The expected major movement is downward along $y$.

| Step | Pixel | $e$ before | $e_2$ | $x$ branch | $y$ branch |
|---:|---|---:|---:|---|---|
| 0 | $(2,6)$ | -3 | -6 | no | yes |
| 1 | $(2,5)$ | 0 | 0 | yes | yes |
| 2 | $(3,4)$ | -3 | -6 | no | yes |
| 3 | $(3,3)$ | 0 | 0 | yes | yes |
| 4 | $(4,2)$ | -3 | -6 | no | yes |
| 5 | $(4,1)$ | 0 | 0 | yes | yes |
| 6 | $(5,0)$ | -3 | — | stop | stop |

The sequence contains seven pixels because $\max(3,6)+1=7$.

The algorithm required no special steep-line branch.

The signed direction $s_y=-1$ handled the descending orientation.

### Boundary cases

For $(4,2)$ to $(4,2)$, the first emission is already the destination.

The output is `[(4, 2)]`.

For $(1,5)$ to $(6,5)$, $d_y=0$.

Only the $x$ branch fires, producing a horizontal run.

For $(3,4)$ to $(3,-1)$, $d_x=0$.

Only the $y$ branch fires, producing a vertical run.

These cases arise from the same loop rather than separate algorithms.

## 4. Production-Ready Implementations

The following Python function returns coordinates instead of coupling the algorithm to a particular image library.

That separation makes it testable and reusable for grids, terminal plots, masks, and game maps.

```python
from collections.abc import Iterator


def bresenham_line(
    x0: int,
    y0: int,
    x1: int,
    y1: int,
) -> Iterator[tuple[int, int]]:
    """Yield an inclusive, connected raster path in any octant."""
    dx = abs(x1 - x0)
    sx = 1 if x0 < x1 else -1 if x0 > x1 else 0
    dy = abs(y1 - y0)
    sy = 1 if y0 < y1 else -1 if y0 > y1 else 0
    error = dx - dy

    while True:
        yield x0, y0
        if x0 == x1 and y0 == y1:
            return

        doubled = 2 * error
        if doubled > -dy:
            error -= dy
            x0 += sx
        if doubled < dx:
            error += dx
            y0 += sy
```

The iterator streams pixels instead of allocating the entire result.

A caller can stop early, paint immediately, or collect the sequence with `list`.

The input coordinates are not mutated outside the function because Python integers are passed by object reference and rebound locally.

### Rendering into a bounded grid

Raster storage needs an explicit boundary policy.

This helper ignores points outside the image, but it does not reduce traversal work.

For long off-screen segments, apply a geometric clipping algorithm before rasterization.

```python
def paint_line(
    pixels: list[list[int]],
    start: tuple[int, int],
    end: tuple[int, int],
    value: int,
) -> None:
    height = len(pixels)
    width = len(pixels[0]) if height else 0
    if any(len(row) != width for row in pixels):
        raise ValueError("pixel grid must be rectangular")

    for x, y in bresenham_line(*start, *end):
        if 0 <= x < width and 0 <= y < height:
            pixels[y][x] = value


canvas = [[0] * 8 for _ in range(5)]
paint_line(canvas, (0, 0), (7, 3), 1)
assert [
    (x, y)
    for y, row in enumerate(canvas)
    for x, cell in enumerate(row)
    if cell
] == [(0, 0), (1, 0), (2, 1), (3, 1),
      (4, 2), (5, 2), (6, 3), (7, 3)]
```

### Structural verification

Tests should assert invariants rather than only compare one illustration.

The verifier below checks endpoints, output length, local connectivity, bounding-box containment, and monotonic progress.

```python
def verify_raster_path(
    start: tuple[int, int],
    end: tuple[int, int],
    points: list[tuple[int, int]],
) -> None:
    x0, y0 = start
    x1, y1 = end
    assert points[0] == start
    assert points[-1] == end
    assert len(points) == max(abs(x1 - x0), abs(y1 - y0)) + 1
    assert len(points) == len(set(points))

    min_x, max_x = sorted((x0, x1))
    min_y, max_y = sorted((y0, y1))
    sx = 0 if x0 == x1 else (1 if x1 > x0 else -1)
    sy = 0 if y0 == y1 else (1 if y1 > y0 else -1)

    for x, y in points:
        assert min_x <= x <= max_x
        assert min_y <= y <= max_y

    for (ax, ay), (bx, by) in zip(points, points[1:]):
        step_x, step_y = bx - ax, by - ay
        assert abs(step_x) <= 1 and abs(step_y) <= 1
        assert step_x != 0 or step_y != 0
        assert step_x in (0, sx)
        assert step_y in (0, sy)


cases = [
    ((0, 0), (7, 3)),
    ((7, 3), (0, 0)),
    ((2, 6), (5, 0)),
    ((5, 0), (2, 6)),
    ((4, 2), (4, 2)),
    ((1, 5), (6, 5)),
    ((3, 4), (3, -1)),
]
for start, end in cases:
    verify_raster_path(start, end, list(bresenham_line(*start, *end)))
```

### Differential property test

A useful independent oracle measures each emitted pixel's distance from the ideal line and verifies the structural contract over many small segments.

It should not demand one unique raster under exact midpoint ties because valid implementations may choose opposite sides.

```python
from random import Random


def implicit_residual(
    point: tuple[int, int],
    start: tuple[int, int],
    end: tuple[int, int],
) -> int:
    x, y = point
    x0, y0 = start
    x1, y1 = end
    return abs((y1 - y0) * (x - x0) - (x1 - x0) * (y - y0))


rng = Random(17)
for _ in range(2_000):
    start = (rng.randrange(-30, 31), rng.randrange(-30, 31))
    end = (rng.randrange(-30, 31), rng.randrange(-30, 31))
    points = list(bresenham_line(*start, *end))
    verify_raster_path(start, end, points)

    dx = abs(end[0] - start[0])
    dy = abs(end[1] - start[1])
    tolerance = max(dx, dy)
    assert all(
        implicit_residual(point, start, end) <= tolerance
        for point in points
    )
```

The residual bound is deliberately integer-valued.

Dividing it by $\sqrt{d_x^2+d_y^2}$ would convert it to Euclidean distance but adds no value to this test.

### Engineering considerations

Keep coordinate arithmetic wider than the stored coordinate format.

Clip before rasterizing untrusted or extremely long segments.

Avoid invoking a callback under a renderer lock unless the callback contract is controlled.

If multiple threads paint the same buffer, synchronize writes or partition the target.

For alpha blending, the emitted centerline is only the coverage input; blending policy belongs to the pixel writer.

For duplicate shared vertices in a polyline, decide whether painting twice changes the result.

An idempotent overwrite is harmless, while additive blending may require omitting the first point of subsequent segments.

## 5. Asymptotic Time & Space Complexity

Let:

$$
N=\max(|x_1-x_0|,|y_1-y_0|).
$$

Each nonterminal iteration advances at least one coordinate by one unit toward its target.

The major-axis distance falls by exactly one per transition.

Therefore there are exactly $N$ transitions and $N+1$ emissions.

The running time is $\Theta(N)$.

This is output-optimal when every selected pixel must be reported or painted.

No algorithm can explicitly emit $N+1$ distinct coordinates in $o(N)$ time.

Each iteration performs a constant number of integer operations.

There is no multiplication except doubling the error, which a compiler may implement as an addition or shift.

There is no division in the hot loop.

The streaming generator stores coordinates, differences, directions, and error state.

Its auxiliary space is $\Theta(1)$, excluding iterator/runtime bookkeeping.

Collecting all coordinates in a list requires $\Theta(N)$ output space.

Painting directly into an existing image uses $\Theta(1)$ additional algorithmic space.

Clipping can change the effective length.

If clipping reduces the visible segment to major-axis extent $V$, rasterization costs $\Theta(V)$ after the clipping calculation.

Simply checking bounds without clipping still costs $\Theta(N)$ because off-screen points are visited.

The numeric magnitude of the error is proportional to coordinate differences.

Space complexity notation treats a fixed-width machine integer as constant size.

Under arbitrary-precision arithmetic, individual operations have a bit-complexity dependent on coordinate magnitude.

For ordinary screen coordinates, that distinction is rarely operationally important.

For gigantic integer geometry, it should not be ignored.

Compared with evaluating $y=mx+b$ per column, Bresenham has the same output-scale asymptotic time.

Its advantage is the operation mix, exact integer decisions, and unified incremental state.

Antialiased line algorithms may still run in $\Theta(N)$ time but emit coverage for multiple neighboring pixels per major-axis step.

Thick-line rasterization can require $\Theta(NW)$ pixel work for width $W$, depending on the coverage method.

Those costs belong to different output requirements, not a failure of Bresenham's bound.

## 6. Systems Connections

### Framebuffers and embedded displays

Small displays often expose a memory-mapped or serially updated pixel grid.

Bresenham's integer loop is suitable when floating-point hardware is absent or energy-sensitive.

The renderer can stream each coordinate directly to a device-specific pixel operation.

Clipping remains important because writing one pixel over a slow bus may dominate arithmetic.

### Tile maps and grid games

Games use the raster path for line-of-sight checks, projectile traversal, and revealing cells along a ray-like segment.

Here each emitted coordinate indexes a logical tile rather than a colored pixel.

Stopping at the first opaque tile makes the iterator form useful.

The result is a discrete visibility convention, not an exact continuous collision proof.

Games must decide how corner-touching obstacles behave.

Different tie rules can affect that policy.

### Robotics and occupancy grids

Mapping systems store free, occupied, or unknown space in grid cells.

A range observation can traverse cells between a sensor origin and a measured obstacle.

Intermediate cells may receive free-space evidence while the endpoint receives occupied-space evidence.

Probabilistic map updates require careful handling of repeated cells and measurement uncertainty.

For exact cell-supercover requirements, classic thin Bresenham may be insufficient because a continuous segment can touch cells the centerline approximation omits.

### Computer-aided design and plotting

An application may transform world coordinates into device coordinates, clip the segment, then rasterize it.

Transformation and clipping should occur before integer quantization where precision matters.

The output forms the final device-level approximation, not the authoritative geometry.

### Image processing

Line masks support measurement, annotation, and sampling along a segment.

If sampling an underlying image, Bresenham chooses discrete sample locations.

Interpolation along the continuous line is a different operation and may use bilinear sampling instead.

### Incremental-error algorithms

The deeper connection is finite differencing.

Instead of recomputing a polynomial or geometric expression, maintain how its decision value changes after a small state transition.

Circle rasterization uses a related midpoint recurrence.

Digital differential analyzers also update state incrementally, though often with fractional values.

Scan conversion, voxel traversal, and some scheduling algorithms use comparable accumulated-error ideas.

### Determinism and replay

Integer decisions help deterministic simulations and replicated editors produce the same pixel path.

The endpoints, coordinate transformation, and tie rule must also be identical.

If one client rounds transformed coordinates differently, Bresenham cannot repair that upstream divergence.

### Security and resource control

Coordinates may come from files, networks, or users.

A segment spanning billions of grid units can become a denial-of-service input even when nearly all points are off-screen.

Validate coordinate ranges and clip to the drawable region before iteration.

Use checked or wide arithmetic for differences and doubled errors.

Never treat bounds checks alone as a work bound.

## 7. Practice Checklist

- Derive $p_0=2d_y-d_x$ from the shallow-line midpoint test.
- Explain why multiplying the decision expression by two preserves its sign.
- State the major-axis progress invariant.
- Prove that the loop emits $\max(d_x,d_y)+1$ points.
- Explain why two independent branch conditions permit diagonal movement.
- Construct a counterexample for replacing the second `if` with `elif`.
- Explain why both branches must test the saved doubled error.
- Trace a shallow positive-slope segment by hand.
- Trace a steep positive-slope segment by hand.
- Trace a shallow negative-slope segment by hand.
- Trace a steep negative-slope segment by hand.
- Test reversed endpoints.
- Test a horizontal segment.
- Test a vertical segment.
- Test a one-point segment.
- Verify that successive pixels are 8-neighbors.
- Verify monotonic movement in each nonconstant coordinate.
- Verify that every pixel lies inside the endpoint bounding box.
- Check exact endpoint inclusion.
- Decide and document the tie-breaking contract.
- Use a wider type for differences and error arithmetic.
- Identify where doubled error may overflow.
- Separate coordinate generation from pixel painting.
- Decide whether the API streams or allocates output.
- Clip long segments before rasterization.
- Distinguish clipping from per-pixel bounds checks.
- Distinguish a thin raster line from a supercover line.
- Distinguish aliased output from antialiased coverage.
- Handle shared polyline vertices under the chosen blend mode.
- Add randomized structural property tests.
- Avoid using floating-point distance as the only oracle.
- Compare emitted count with the proven exact formula.
- Test coordinates on both sides of zero.
- Test maximum supported coordinate magnitudes.
- Document whether output order follows start to end.
- Document the grid coordinate convention, including row direction.
- Treat line thickness, caps, and joins as separate rendering stages.
- Confirm that image memory is indexed as `pixels[y][x]`.
- Bound work for untrusted geometry.
- Profile the pixel writer separately from coordinate generation.

## 8. Frequently Asked Questions

### Does Bresenham compute points on the exact mathematical line?

Usually only the endpoints and occasional intermediate points lie exactly on it.

The algorithm selects nearby integer grid points that form a connected visual approximation.

### Why is it described as an integer algorithm?

The core loop uses integer addition, subtraction, comparison, and coordinate increments.

The midpoint derivation removes fractional comparisons by scaling the decision value.

### Does the algorithm support every slope?

The symmetric implementation in this article supports horizontal, vertical, positive, negative, shallow, and steep segments.

It also supports either endpoint order.

### Why are there two `if` statements?

A diagonal step must update both coordinates during one iteration.

An `elif` would allow only one update and would distort many lines.

### Why save `doubled` before updating the error?

Both coordinate decisions describe the same current geometric state.

Using a partially updated error for the second decision evaluates a different state and breaks the recurrence.

### Is the destination included?

Yes.

The loop emits the current coordinate before checking whether it equals the destination.

### What happens when both endpoints are equal?

Exactly one coordinate is emitted.

This behavior makes the function total for all integer endpoint pairs.

### Is Bresenham antialiased?

Classic Bresenham is not antialiased.

It chooses discrete pixels without calculating fractional coverage.

Algorithms such as Xiaolin Wu's line method address antialiasing with a different output contract.

### Does it draw thick lines?

Not by itself.

Thickness requires expanding coverage around the centerline or rasterizing a stroked geometric shape.

### Is it safe to just ignore off-screen pixels?

That protects buffer access but not runtime.

A huge off-screen segment still causes one iteration per major-axis unit, so clip it first.

### Is the result unique?

Not at exact midpoint ties.

Different consistent tie rules can choose different but equally near connected rasters.

Applications requiring deterministic interchange must standardize the rule.

### Is endpoint reversal guaranteed to return the exact reversed list?

Do not assume it for every Bresenham variant and tie convention.

Test and specify reversal symmetry if an application depends on it.

### Why not compute and round $y=mx+b$?

That approach can work, but it repeats slope-based arithmetic, needs special handling for vertical lines, and may vary around floating-point ties.

Bresenham maintains one unified incremental integer decision state.

### What is a supercover line?

A supercover includes every grid cell touched by the continuous segment.

Classic Bresenham's thin centerline may omit corner-touching cells, so collision and visibility systems sometimes need the supercover variant.

### Can the method be extended to three dimensions?

Yes, voxel line traversal can choose a dominant axis and maintain error terms for the other two axes.

Grid ray traversal methods such as Amanatides-Woo offer another formulation with different boundary semantics.

### What is the most important implementation test?

Test the general invariants across every octant: endpoints, exact output count, monotonicity, bounding-box containment, and neighbor connectivity.

Those properties expose more defects than a single familiar picture.
