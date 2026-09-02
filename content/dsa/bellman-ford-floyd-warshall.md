# Bellman–Ford & Floyd–Warshall: Negative Cycles, Path Scope & Dynamic Programming

![Bellman–Ford & Floyd–Warshall: Negative Cycles, Path Scope & Dynamic Programming](/images/dsa/bellman-ford-floyd-warshall-dark.jpg#dark)

## 1. Historical Context & Motivation

Weighted shortest paths are not one problem with one universally best algorithm.

The required source scope and edge-weight assumptions determine the useful formulation.

Bellman–Ford answers a **single-source** question.

It computes distances from one chosen source by repeatedly relaxing an edge list.

Floyd–Warshall answers an **all-pairs** question.

It computes distances between every ordered pair through a matrix dynamic program.

Both permit negative edge weights.

Both can expose negative cycles.

They differ in how much graph state they compute, how they represent reachability, and how they scale with sparse versus dense input.

Richard Bellman's and Lester Ford Jr.'s relaxation work emerged in the late 1950s.

Robert Floyd published a dynamic-programming method for comparing all pairs of vertices in 1962.

Stephen Warshall published a closely related transitive-closure algorithm in the same period.

The familiar combined name reflects the shared matrix recurrence that can compute reachability or weighted distance under different algebraic operations.

The practical choice is often mishandled.

Running Floyd–Warshall because it has compact code can allocate $O(V^2)$ memory for a sparse graph that needs only one source.

Running Bellman–Ford separately from every source costs $O(V^2E)$ in the direct worst-case composition.

On a dense graph where $E=\Theta(V^2)$, that becomes $O(V^4)$, while Floyd–Warshall remains $O(V^3)$.

On a sparse graph with one source, Bellman–Ford uses $O(V+E)$ storage and avoids building a full matrix.

Negative-cycle reporting also needs scope.

A negative cycle unreachable from Bellman–Ford's source does not affect that result.

For all pairs, a negative cycle affects pair $(i,j)$ only if $i$ can reach the cycle and the cycle can reach $j$.

Merely returning `has_negative_cycle = true` loses which queries remain well defined.

The correct mental model is:

- choose Bellman–Ford for source-scoped relaxation over an edge list;
- choose Floyd–Warshall for a complete pairwise matrix on a manageable vertex set;
- classify paths influenced by negative cycles instead of returning misleading finite values.

## 2. Core Mathematical Invariants

### Shared path semantics

For path $p=(v_0,\ldots,v_k)$:

$$
w(p)=\sum_{t=0}^{k-1}w(v_t,v_{t+1}).
$$

A pair may be finite, unreachable, or negative-infinite.

Finite means a minimum-weight path exists.

Unreachable means no path exists.

Negative-infinite means arbitrarily low walk weights exist because a reachable negative cycle can be used before reaching the destination.

### Bellman–Ford pass invariant

After $i$ complete edge passes, the estimate for $v$ is no greater than the cheapest source-to-$v$ path using at most $i$ edges.

Any finite shortest path can be chosen simple when no relevant negative cycle exists.

A simple path has at most $V-1$ edges.

Thus $V-1$ passes suffice, and a further relaxable edge proves a source-reachable negative cycle influences some vertex.

This invariant grows allowed path **length** one edge at a time.

### Floyd–Warshall state

Number vertices $0$ through $V-1$.

Define:

$$
D^{(k)}[i][j]
$$

as the minimum weight of an $i$-to-$j$ path whose intermediate vertices come only from:

$$
\{0,1,\ldots,k-1\}.
$$

Endpoints $i$ and $j$ are not restricted by that intermediate set.

Before any intermediate vertex is allowed:

$$
D^{(0)}[i][i]=0,
$$

and for $i\ne j$:

$$
D^{(0)}[i][j]=w(i,j)
$$

for the lightest direct edge, or $+\infty$ if no direct edge exists.

### Floyd–Warshall recurrence

When vertex $k$ becomes available as an intermediate, an optimal permitted path either avoids $k$ or uses it.

Therefore:

$$
D^{(k+1)}[i][j]=\min\left(
D^{(k)}[i][j],
D^{(k)}[i][k]+D^{(k)}[k][j]
\right).
$$

The first term preserves the old best path.

The second concatenates an $i$-to-$k$ path with a $k$-to-$j$ path.

Both subpaths use only previously admitted intermediate vertices.

This is a dynamic-programming invariant over the **set of allowed intermediate vertices**, not over edge count.

### Loop order is semantic

The standard in-place loops put `k` outermost:

```text
for k
    for i
        for j
```

After completing one outer iteration, the matrix represents exactly the next DP layer.

Moving `k` inside is not a harmless cache transformation.

It can mix incomplete layers and violate the stated recurrence.

Blocked implementations may reorder work only while preserving dependencies for each admitted intermediate set.

### Infinity guard

The candidate through $k$ exists only if both subpaths exist.

Code should test:

```text
dist[i][k] != infinity and dist[k][j] != infinity
```

before addition.

With floating infinity the arithmetic often remains infinity, but explicit guards preserve semantics and avoid overflow when fixed-width sentinels are used.

### Parallel edges and self-distance

If multiple edges connect the same ordered pair, initialization keeps the minimum weight.

The zero-length path gives every diagonal an initial value of zero.

A negative self-loop must replace that zero because it is a direct negative cycle.

Thus initialization uses the minimum of the current matrix entry and each edge weight, including self-loops.

### Negative diagonal criterion

After Floyd–Warshall completes, vertex $k$ lies on or can return through a negative closed walk when:

$$
D[k][k]<0.
$$

A pair $(i,j)$ is affected if there exists such a $k$ with:

$$
D[i][k]<+\infty
$$

and:

$$
D[k][j]<+\infty.
$$

Then a walk from $i$ can reach the negative cycle, repeat it arbitrarily, and continue to $j$.

Only those pairs should be classified as $-\infty$.

### Path reconstruction invariant

Maintain `next[i][j]`, the first vertex after $i$ on one current best path to $j$.

For a direct edge $i\to j$, initialize `next[i][j]=j`.

When the route through $k$ improves $(i,j)$, assign:

```text
next[i][j] = next[i][k]
```

The first step toward $k$ is also the first step on the concatenated path to $j$.

For unreachable or negative-infinite pairs, no finite path should be reconstructed.

## 3. Step-by-Step Execution Trace

### Graph

Use vertices `A, B, C, D` and edges:

```text
A -> B  4
A -> D 10
B -> C -2
C -> D  3
D -> B  1
```

The cycle `B -> C -> D -> B` has total weight:

$$
-2+3+1=2,
$$

so it is not negative.

### Initial matrix

Rows are sources and columns are destinations.

```text
      A    B    C    D
A     0    4   inf  10
B    inf   0   -2   inf
C    inf  inf   0    3
D    inf   1   inf   0
```

The direct `A -> D` route currently costs `10`.

### Admit `A` as an intermediate

No other vertex reaches `A`.

Using `A` cannot improve a pair whose source is not `A`.

The matrix remains unchanged.

### Admit `B`

`A` reaches `B` with cost `4`.

`B` reaches `C` with cost `-2`.

The route `A -> B -> C` costs:

$$
4+(-2)=2.
$$

Update `dist[A][C]` from infinity to `2`.

`D` reaches `B` with cost `1`.

Thus `D -> B -> C` costs `-1`.

Update `dist[D][C]` to `-1`.

Relevant rows now include:

```text
A: 0, 4, 2, 10
D: inf, 1, -1, 0
```

### Admit `C`

`A -> C` now costs `2`, and `C -> D` costs `3`.

The path through `C` improves `A -> D`:

$$
2+3=5<10.
$$

Its route is `A -> B -> C -> D`.

`B -> C -> D` costs:

$$
-2+3=1,
$$

so update `B -> D` from infinity to `1`.

`D -> C -> D` costs `-1+3=2`, which does not improve the zero-length diagonal path of cost `0`.

### Admit `D`

`C -> D -> B` costs $3+1=4$, so `C -> B` becomes `4`.

`A -> D -> B` costs $5+1=6$, which does not beat direct `A -> B` cost `4`.

`B -> D -> B` costs $1+1=2$, which does not improve `0` on the diagonal.

The final finite matrix is:

```text
      A    B    C    D
A     0    4    2    5
B    inf   0   -2    1
C    inf   4    0    3
D    inf   1   -1    0
```

No diagonal entry is negative.

All finite pairs have well-defined shortest paths.

### Compare one Bellman–Ford run

Running Bellman–Ford from `A` produces only row `A`:

```text
A: 0, B: 4, C: 2, D: 5
```

That equals Floyd–Warshall's `A` row.

Bellman–Ford does not compute `D -> C = -1` unless run again from `D`.

### Introduce a negative cycle

Change `D -> B` from weight `1` to weight `-2`.

Cycle weight becomes:

$$
-2+3-2=-1.
$$

After the DP completes, diagonal entries for `B`, `C`, and `D` become negative.

`A` can reach this cycle through `B`.

The cycle cannot reach `A` because no edge enters `A`.

Affected pairs are:

```text
A -> B, A -> C, A -> D
B -> B, B -> C, B -> D
C -> B, C -> C, C -> D
D -> B, D -> C, D -> D
```

Pairs ending at `A` remain unreachable, except `A -> A`, whose zero-length path remains finite because the cycle cannot return to `A`.

The correct matrix is not “all invalid.”

It contains a mixture of finite, unreachable, and negative-infinite pair states.

## 4. Production-Ready Implementations

The implementation below computes all-pairs distances, reconstructs finite paths, retains a reachability snapshot, and marks exactly the pairs influenced by negative cycles.

It uses a dense matrix and is intended for vertex sets small enough for $O(V^2)$ memory.

```python
from __future__ import annotations

from dataclasses import dataclass
from math import inf
from typing import Generic, Hashable, Iterable, Optional, TypeVar

Vertex = TypeVar("Vertex", bound=Hashable)


@dataclass(frozen=True, slots=True)
class WeightedEdge(Generic[Vertex]):
    source: Vertex
    target: Vertex
    weight: float


@dataclass(slots=True)
class FloydWarshallResult(Generic[Vertex]):
    vertices: tuple[Vertex, ...]
    index: dict[Vertex, int]
    distance: list[list[float]]
    next_vertex: list[list[Optional[int]]]
    negative_pairs: frozenset[tuple[int, int]]

    def distance_between(self, source: Vertex, target: Vertex) -> float:
        i = self.index[source]
        j = self.index[target]
        return self.distance[i][j]

    def path(self, source: Vertex, target: Vertex) -> Optional[list[Vertex]]:
        i = self.index[source]
        j = self.index[target]
        if (i, j) in self.negative_pairs:
            raise ValueError("pair has no finite shortest path")
        if self.next_vertex[i][j] is None:
            return None
        route = [source]
        cursor = i
        for _ in range(len(self.vertices)):
            if cursor == j:
                return route
            next_index = self.next_vertex[cursor][j]
            if next_index is None:
                raise AssertionError("path matrix is internally inconsistent")
            cursor = next_index
            route.append(self.vertices[cursor])
        raise AssertionError("finite path reconstruction exceeded vertex bound")


def floyd_warshall(
    vertices: Iterable[Vertex],
    edges: Iterable[WeightedEdge[Vertex]],
) -> FloydWarshallResult[Vertex]:
    ordered = tuple(vertices)
    if len(ordered) != len(set(ordered)):
        raise ValueError("vertices must be unique")
    index = {vertex: position for position, vertex in enumerate(ordered)}
    size = len(ordered)
    distance = [[inf] * size for _ in range(size)]
    next_vertex: list[list[Optional[int]]] = [[None] * size for _ in range(size)]

    for i in range(size):
        distance[i][i] = 0.0
        next_vertex[i][i] = i

    for edge in edges:
        if edge.source not in index or edge.target not in index:
            raise ValueError("edge endpoint is not present in vertices")
        if edge.weight != edge.weight or edge.weight in (inf, -inf):
            raise ValueError("edge weight must be finite")
        i = index[edge.source]
        j = index[edge.target]
        if edge.weight < distance[i][j]:
            distance[i][j] = edge.weight
            next_vertex[i][j] = j

    for k in range(size):
        for i in range(size):
            if distance[i][k] == inf:
                continue
            through_prefix = distance[i][k]
            for j in range(size):
                if distance[k][j] == inf:
                    continue
                candidate = through_prefix + distance[k][j]
                if candidate < distance[i][j]:
                    distance[i][j] = candidate
                    next_vertex[i][j] = next_vertex[i][k]

    negative_vertices = [k for k in range(size) if distance[k][k] < 0]
    negative_pairs = {
        (i, j)
        for k in negative_vertices
        for i in range(size)
        if distance[i][k] != inf
        for j in range(size)
        if distance[k][j] != inf
    }
    for i, j in negative_pairs:
        distance[i][j] = -inf
        next_vertex[i][j] = None

    return FloydWarshallResult(
        vertices=ordered,
        index=index,
        distance=distance,
        next_vertex=next_vertex,
        negative_pairs=frozenset(negative_pairs),
    )
```

### Verify the finite trace

```python
vertices = ["A", "B", "C", "D", "X"]
edges = [
    WeightedEdge("A", "B", 4),
    WeightedEdge("A", "D", 10),
    WeightedEdge("B", "C", -2),
    WeightedEdge("C", "D", 3),
    WeightedEdge("D", "B", 1),
]

finite = floyd_warshall(vertices, edges)
assert finite.distance_between("A", "D") == 5
assert finite.path("A", "D") == ["A", "B", "C", "D"]
assert finite.distance_between("D", "C") == -1
assert finite.path("D", "C") == ["D", "B", "C"]
assert finite.distance_between("X", "A") == inf
assert finite.path("X", "A") is None
assert not finite.negative_pairs
```

### Verify pair-scoped negative-cycle effects

```python
negative_edges = [
    edge if not (edge.source == "D" and edge.target == "B")
    else WeightedEdge("D", "B", -2)
    for edge in edges
]
negative = floyd_warshall(vertices, negative_edges)

expected_sources = {"A", "B", "C", "D"}
expected_targets = {"B", "C", "D"}
actual_pairs = {
    (source, target)
    for source in vertices
    for target in vertices
    if negative.distance_between(source, target) == -inf
}
assert actual_pairs == {
    (source, target)
    for source in expected_sources
    for target in expected_targets
}
assert negative.distance_between("A", "A") == 0
assert negative.distance_between("X", "X") == 0
assert negative.path("A", "A") == ["A"]

try:
    negative.path("A", "D")
    raise AssertionError("negative-infinite pair should reject a path")
except ValueError:
    pass
```

### Differential check against repeated Bellman–Ford

For graphs without negative cycles, every Floyd–Warshall row should equal a Bellman–Ford result from the same source.

The reference below is intentionally compact and independently structured.

```python
import random


def bellman_ford_distances(
    vertices: list[int],
    edges: list[WeightedEdge[int]],
    source: int,
) -> dict[int, float]:
    result = {vertex: inf for vertex in vertices}
    result[source] = 0.0
    for _ in range(max(0, len(vertices) - 1)):
        changed = False
        for edge in edges:
            if result[edge.source] == inf:
                continue
            candidate = result[edge.source] + edge.weight
            if candidate < result[edge.target]:
                result[edge.target] = candidate
                changed = True
        if not changed:
            break
    return result


rng = random.Random(1962)
for size in range(1, 18):
    graph_vertices = list(range(size))
    graph_edges: list[WeightedEdge[int]] = []
    for i in graph_vertices:
        for j in graph_vertices:
            if i != j and rng.random() < 0.16:
                graph_edges.append(WeightedEdge(i, j, rng.randrange(0, 20)))
    all_pairs = floyd_warshall(graph_vertices, graph_edges)
    for source in graph_vertices:
        row = bellman_ford_distances(graph_vertices, graph_edges, source)
        assert [row[target] for target in graph_vertices] == [
            all_pairs.distance_between(source, target)
            for target in graph_vertices
        ]
```

### Engineering limits

Validate $V$ before allocating two or three $V\times V$ matrices.

At $V=50{,}000$, a dense matrix is not a reasonable accidental allocation.

Use integer or fixed-point weights when the domain requires exact comparison.

Do not apply an unexplained floating epsilon to negative-cycle detection.

For path output, cap route serialization and distinguish unreachable from negative-infinite.

The implementation is single-threaded and deterministic for a fixed vertex order.

## 5. Asymptotic Time & Space Complexity

### Bellman–Ford

One pass scans $E$ edges.

At most $V-1$ ordinary passes plus one detection pass are required.

Worst-case time is:

$$
O(VE).
$$

Distances and predecessors use $O(V)$ space.

Propagating negative-cycle effects through adjacency adds $O(V+E)$ storage when per-vertex classification is required.

### Floyd–Warshall

The three nested loops consider every ordered triple $(i,k,j)$.

Time is:

$$
O(V^3).
$$

The distance matrix uses $O(V^2)$ space.

Path reconstruction adds another $O(V^2)$ next-hop matrix.

Negative-pair classification can also contain $\Theta(V^2)$ pairs.

### Repeated single-source comparison

Running Bellman–Ford from every source costs:

$$
O(V^2E).
$$

For dense $E=\Theta(V^2)$ input, this is $O(V^4)$.

Floyd–Warshall's $O(V^3)$ is asymptotically better for the complete matrix in that setting.

For one source on sparse input with $E=O(V)$, Bellman–Ford costs $O(V^2)$ worst case and avoids quadratic matrix storage.

### Query cost after preprocessing

Floyd–Warshall answers a distance query in $O(1)$ by indexing the matrix.

Reconstructing a path of $\ell$ edges costs $O(\ell)$.

Bellman–Ford also answers source-distance queries in $O(1)$ after its one-source computation, but another source requires another run.

### Boolean transitive closure

Replacing numeric minimum-plus operations with Boolean OR-AND operations yields Warshall-style reachability closure.

The same triple-loop shape remains $O(V^3)$.

Bitset rows can accelerate practical Boolean closure by processing many destinations per machine word, while preserving the underlying dependency order.

### Memory constants

High-level language matrices have reference and object overhead beyond element width.

Two nominally $8V^2$-byte numeric arrays can consume much more when represented as nested boxed objects.

Packed arrays, typed buffers, or native numeric libraries may be necessary for predictable capacity planning.

## 6. Systems Connections

### Graph analytics with many queries

A small, mostly static graph with frequent pairwise queries can justify Floyd–Warshall preprocessing.

Examples include compact policy graphs, game maps, or service-dependency subsets.

The $O(1)$ distance lookup is valuable only if the $O(V^2)$ matrix fits comfortably and updates are infrequent.

### Incremental updates

Changing one edge can invalidate many matrix entries.

Recomputing Floyd–Warshall is simple but costs $O(V^3)$.

Dynamic shortest-path algorithms exist, but their complexity and operational cost depend on allowed update types.

A production system should not claim incremental support merely because one matrix cell can be changed.

### Routing and distance vectors

Bellman–Ford's relaxation resembles distance-vector updates from neighbors.

Floyd–Warshall resembles a centralized complete topology computation.

Real network protocols add message delay, convergence rules, loop prevention, failure detection, and bounded metrics.

The centralized algorithms explain core calculations but not the whole protocol.

### Database query planning

Join-order or dependency subproblems can use shortest-path or closure formulations on small state graphs.

Dense all-pairs preprocessing can be reasonable inside a bounded optimizer phase.

It should never be triggered on unbounded user-created vertex sets without capacity checks.

### Difference constraints

Bellman–Ford checks feasibility from a source or super-source efficiently on an edge list.

Floyd–Warshall can derive all implied pairwise upper bounds for a small constraint system.

A negative diagonal exposes inconsistency.

The desired output—one feasibility answer or all implied bounds—determines the method.

### Johnson's algorithm

Johnson combines one Bellman–Ford run with repeated Dijkstra runs after potential-based reweighting.

It computes all-pairs shortest paths efficiently on sparse graphs without negative cycles.

This fills the space between repeated Bellman–Ford and dense Floyd–Warshall.

### GPU and blocked computation

Floyd–Warshall's dense regular computation can benefit from cache blocking or accelerator execution.

The `k`-phase dependency must remain intact.

Blocked algorithms update the diagonal block, row and column blocks, then remaining blocks in a dependency-safe order.

A naive loop permutation can be fast and wrong.

### Security and resource control

Matrix algorithms amplify vertex count quadratically in memory and cubically in time.

Validate graph size before allocation.

Use cancellation between phases.

Avoid returning enormous matrices through an API unless explicitly requested and bounded.

Keep graph labels out of diagnostics when they can contain sensitive identifiers.

## 7. Practice Checklist

### Choose the scope

- Identify whether one source or all pairs are required.
- Identify whether edge weights may be negative.
- Identify whether negative cycles need a witness or affected-set classification.
- Estimate graph density.
- Estimate the maximum vertex count.
- Decide whether a dense matrix fits.
- Consider Johnson's algorithm for sparse all-pairs work.

### Implement Floyd–Warshall

- Map vertices to stable integer indices.
- Initialize every diagonal to zero.
- Keep the lightest parallel edge.
- Preserve a negative self-loop over the zero diagonal.
- Put `k` in the outer loop.
- Guard additions involving infinity.
- Update next hop from the `i -> k` subpath.
- Detect negative diagonal entries after DP.
- Mark only pairs that can reach and leave a negative cycle.
- Reject finite-path reconstruction for marked pairs.

### Implement Bellman–Ford

- Initialize only the source to zero.
- Skip edges from unreachable tails.
- Perform at most $V-1$ ordinary passes.
- Stop after one full unchanged pass.
- Scan once more for reachable cycle evidence.
- Propagate negative-infinite effects through outgoing edges.
- Keep disconnected negative cycles out of source-scoped results.

### Validate results

- Compare one Bellman–Ford row with Floyd–Warshall.
- Compare all rows on small cycle-free random graphs.
- Test parallel edges.
- Test a negative self-loop.
- Test an unreachable pair.
- Test a reachable negative cycle.
- Test a disconnected negative cycle.
- Test a pair that can reach but not leave a negative cycle toward the requested target.
- Sum weights of reconstructed finite paths.
- Verify finite triangle inequalities.

### Operate safely

- Reject NaN and unsupported infinite edge weights.
- Use overflow-safe arithmetic.
- Bound matrix allocation before constructing rows.
- Support cancellation by outer phase.
- Report incomplete computation distinctly.
- Cap serialized matrices and paths.
- Use deterministic vertex indexing.
- Profile boxed versus packed matrix storage.
- Preserve phase dependencies when optimizing loops.

## 8. Frequently Asked Questions

### Which algorithm should I use for one source with negative edges?

Bellman–Ford is the direct baseline.

It uses an edge list naturally, avoids a full matrix, and detects negative cycles reachable from that source.

### Which should I use for all pairs on a small dense graph?

Floyd–Warshall is often the clearest choice.

It computes the complete matrix in $O(V^3)$ time and $O(V^2)$ space.

### Can Floyd–Warshall handle negative edges?

Yes.

It handles negative edges as long as finite results are interpreted with negative-cycle detection.

A pair influenced by a reachable negative cycle has no finite shortest distance.

### Why is `dist[k][k] < 0` evidence of a negative cycle?

The diagonal begins with the zero-length path of weight zero.

A negative final diagonal means the DP found a closed walk from $k$ back to $k$ with negative weight.

Such a walk contains a negative cycle.

### Does one negative diagonal invalidate every pair?

No.

Only sources that can reach the negative cycle and targets reachable from it are affected.

Other finite and unreachable pairs retain their classifications.

### Why must `k` be the outer loop?

Each outer phase admits one new intermediate vertex and relies on values from the previous allowed set.

Putting `k` inside can use partially updated combinations that do not match the recurrence.

### Can Floyd–Warshall reconstruct paths?

Yes.

A next-hop matrix records the first step on one current best route.

It requires $O(V^2)$ additional storage and must be disabled for unreachable or negative-infinite pairs.

### What if there are multiple equal shortest paths?

The strict-improvement implementation retains whichever equal-cost route was established first by vertex and edge order.

If deterministic tie-breaking matters, define it explicitly and update the comparison rule with care.

### Why keep the minimum parallel edge?

A heavier direct edge cannot improve any shortest path when a lighter edge has identical endpoints.

Discarding it from the distance initialization preserves correct optimal values.

Applications may retain edge identity separately if they need route provenance.

### Is repeating Bellman–Ford from every source equivalent?

It can produce the same finite all-pairs distances and source-scoped cycle classifications.

Its direct worst-case time is worse than Floyd–Warshall on dense graphs, while its storage can remain sparse.

### When is Johnson's algorithm preferable?

Johnson is useful for sparse all-pairs graphs with negative edges but no negative cycles.

Bellman–Ford computes potentials, reweighting makes edges nonnegative, and Dijkstra runs from each source.

### Can the matrix be updated after one edge change in constant time?

No general constant-time cell edit restores all-pairs correctness.

One edge can improve or invalidate paths for many source-target pairs.

Use a proven dynamic algorithm or recompute according to workload requirements.

### How should infinity be represented?

Use a representation that cannot collide with a valid finite distance.

Floating infinity is convenient when weights are finite floats.

Fixed-width integer code should guard before addition rather than rely on a large sentinel that can overflow.

### What is the most important comparison insight?

Bellman–Ford expands reliable path length from one source through repeated edge passes.

Floyd–Warshall expands the allowed intermediate-vertex set for every pair through matrix phases.

Their similar support for negative weights comes from different dynamic-programming invariants.
