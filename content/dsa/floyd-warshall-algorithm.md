# Floyd-Warshall Algorithm: Intermediate Vertices, All-Pairs Paths & Negative Cycle Checks

![Floyd-Warshall all-pairs shortest paths](/images/dsa/floyd-warshall-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

Floyd-Warshall computes shortest paths between every pair of vertices in a weighted directed graph.

It is an all-pairs shortest-path algorithm.

Single-source algorithms such as Dijkstra and Bellman-Ford start from one vertex.

Floyd-Warshall fills a complete distance matrix.

That makes it attractive when many source-target queries will follow.

The algorithm is also compact.

It has three nested loops.

It works with negative edge weights.

It detects negative cycles.

It does not require a priority queue.

The cost is cubic time.

For large sparse graphs, running single-source algorithms from many sources may be better.

For small dense graphs, transitive-closure-like problems, or teaching dynamic programming on graphs, Floyd-Warshall is clean and powerful.

The central idea is to grow the set of allowed intermediate vertices.

At step `k`, the algorithm asks whether paths become shorter if vertex `k` may appear as an intermediate stop.

For every pair `(i, j)`, it compares the current best path from `i` to `j` with the path that goes through `k`.

The central question is:

How can allowing one more intermediate vertex at a time solve every source-target shortest path?

The answer is a dynamic-programming invariant over permitted intermediate sets.

## 2. Core Mathematical Invariants

Number vertices from `0` to `n - 1`.

Let:

$$
D_k[i][j]
$$

be the shortest path distance from `i` to `j` using only intermediate vertices from the set:

$$
\{0,1,\ldots,k-1\}.
$$

The endpoints `i` and `j` are not counted as intermediate vertices.

The base matrix `D_0` contains direct edge weights.

It also contains zero on the diagonal.

Missing edges have distance infinity.

When vertex `k` becomes allowed as an intermediate vertex, a shortest valid path from `i` to `j` either does not use `k` or uses `k`.

If it does not use `k`, the distance remains `D_k[i][j]`.

If it uses `k`, it can be decomposed into:

```text
i -> k
k -> j
```

using only earlier intermediate vertices inside each subpath.

The transition is:

$$
D_{k+1}[i][j] = \min(D_k[i][j], D_k[i][k] + D_k[k][j]).
$$

The implementation updates one matrix in place.

That is safe because the `k` loop is outermost.

During phase `k`, distances involving intermediate vertices up to `k - 1` are already valid.

The algorithm must not put `i` or `j` as the outer loop and `k` inside.

That changes the invariant and can produce wrong answers.

After all phases, every vertex has been allowed as an intermediate.

The matrix contains all-pairs shortest distances unless a reachable negative cycle makes a shortest distance undefined.

A negative value on `dist[v][v]` after the algorithm means vertex `v` lies on or reaches a negative cycle in the relevant closure.

The diagonal is the negative-cycle signal.

## 3. Step-by-Step Execution Trace

Use four vertices: `A`, `B`, `C`, and `D`.

Edges are:

```text
A -> B weight 3
A -> D weight 7
B -> A weight 8
B -> C weight 2
C -> A weight 5
C -> D weight 1
D -> A weight 2
```

The initial matrix is:

```text
      A   B   C   D
A     0   3   ∞   7
B     8   0   2   ∞
C     5   ∞   0   1
D     2   ∞   ∞   0
```

Allow `A` as an intermediate.

`B -> D` can improve through `A`:

```text
B -> A -> D = 8 + 7 = 15
```

`D -> B` can improve through `A`:

```text
D -> A -> B = 2 + 3 = 5
```

Allow `B` as an intermediate.

`A -> C` improves:

```text
A -> B -> C = 3 + 2 = 5
```

`D -> C` improves:

```text
D -> B -> C = 5 + 2 = 7
```

Allow `C` as an intermediate.

`A -> D` improves:

```text
A -> C -> D = 5 + 1 = 6
```

`B -> D` improves:

```text
B -> C -> D = 2 + 1 = 3
```

Allow `D` as an intermediate.

`C -> B` improves:

```text
C -> D -> B = 1 + 5 = 6
```

The final matrix contains shortest distances between every ordered pair.

Every update has the same interpretation.

The algorithm is asking whether the newly allowed intermediate vertex creates a cheaper route.

Now trace a negative cycle.

Use vertices `A`, `B`, and `C`:

```text
A -> B weight 1
B -> C weight -3
C -> A weight 1
```

The cycle weight is:

$$
1 + (-3) + 1 = -1.
$$

After enough intermediate phases, the algorithm can improve `A -> A` by going around the cycle.

The diagonal entry `dist[A][A]` becomes negative.

That means there is no well-defined shortest path involving that cycle.

The path can loop around the cycle repeatedly and become cheaper every time.

The correct response is not to return a very negative finite distance as if it were final.

The correct response is to report the negative cycle.

Some applications need to mark every pair `(i, j)` affected by a negative cycle.

That requires an additional propagation pass.

The simple implementation raises as soon as any diagonal is negative after the main algorithm.

To identify affected pairs, inspect each negative-cycle vertex `k`.

If `i` can reach `k` and `k` can reach `j`, then pair `(i, j)` has no finite shortest path.

The distance can be improved indefinitely by looping through the negative cycle.

That propagation is useful in judge problems that distinguish unreachable pairs, finite shortest paths, and negative-infinite paths.

It is more information than simple detection.

Most application APIs should decide which behavior they need before exposing results.

## 4. Production-Ready Implementations

The implementation below returns both distances and a `next` matrix for path reconstruction.

It uses `math.inf` for missing edges.

```python
from math import inf


def floyd_warshall(
    n: int,
    edges: list[tuple[int, int, float]],
) -> tuple[list[list[float]], list[list[int | None]]]:
    dist = [[inf] * n for _ in range(n)]
    nxt: list[list[int | None]] = [[None] * n for _ in range(n)]

    for vertex in range(n):
        dist[vertex][vertex] = 0
        nxt[vertex][vertex] = vertex

    for u, v, weight in edges:
        if weight < dist[u][v]:
            dist[u][v] = weight
            nxt[u][v] = v

    for k in range(n):
        for i in range(n):
            if dist[i][k] == inf:
                continue
            for j in range(n):
                candidate = dist[i][k] + dist[k][j]
                if candidate < dist[i][j]:
                    dist[i][j] = candidate
                    nxt[i][j] = nxt[i][k]

    for vertex in range(n):
        if dist[vertex][vertex] < 0:
            raise ValueError("negative cycle detected")

    return dist, nxt


def reconstruct_path(nxt: list[list[int | None]], source: int, target: int) -> list[int]:
    if nxt[source][target] is None:
        return []
    path = [source]
    while source != target:
        next_vertex = nxt[source][target]
        assert next_vertex is not None
        source = next_vertex
        path.append(source)
    return path


edges = [
    (0, 1, 3),
    (0, 3, 7),
    (1, 0, 8),
    (1, 2, 2),
    (2, 0, 5),
    (2, 3, 1),
    (3, 0, 2),
]

dist, nxt = floyd_warshall(4, edges)
assert dist[0][2] == 5
assert dist[0][3] == 6
assert dist[1][3] == 3
assert reconstruct_path(nxt, 0, 3) == [0, 1, 2, 3]
```

The outer loop over `k` is not optional style.

It encodes the DP phase.

The `dist[i][k] == inf` check skips impossible prefixes and avoids unnecessary arithmetic.

Multiple edges between the same ordered pair are handled by keeping the lightest one.

For integer weights, use a large sentinel carefully instead of `inf` only if overflow is impossible.

For boolean transitive closure, the same loop structure becomes reachability.

```python
def transitive_closure(n: int, edges: list[tuple[int, int]]) -> list[list[bool]]:
    reach = [[False] * n for _ in range(n)]
    for vertex in range(n):
        reach[vertex][vertex] = True
    for u, v in edges:
        reach[u][v] = True

    for k in range(n):
        for i in range(n):
            if not reach[i][k]:
                continue
            for j in range(n):
                reach[i][j] = reach[i][j] or reach[k][j]
    return reach


closure = transitive_closure(3, [(0, 1), (1, 2)])
assert closure[0][2]
assert not closure[2][0]
```

The boolean version replaces shortest-distance relaxation with logical reachability.

The invariant remains "allowed intermediates up to `k`."

That is why Floyd-Warshall and Warshall's algorithm are usually taught together.

The in-place update is safe only because phase `k` is fixed while all pairs are relaxed.

During phase `k`, `dist[i][k]` and `dist[k][j]` already represent paths using earlier intermediates.

Updating `dist[i][j]` does not invalidate the phase interpretation.

If loops are reordered, the matrix may mix states from different phases.

That can accidentally allow vertices before they are supposed to be allowed.

For this algorithm, loop order is part of correctness, not style.

## 5. Asymptotic Time & Space Complexity

Floyd-Warshall has three nested loops over `n` vertices.

The time complexity is:

$$
O(n^3).
$$

The distance matrix uses:

$$
O(n^2)
$$

space.

The path reconstruction matrix also uses $O(n^2)$ space.

If only distances are needed, the `next` matrix can be omitted.

Initialization from an adjacency matrix costs $O(n^2)$.

Initialization from an edge list costs $O(n^2 + E)$ because the matrix still must be created.

The algorithm works well for dense graphs where $E$ is near $n^2$.

For sparse graphs with nonnegative weights, running Dijkstra from every source can be better.

For sparse graphs with negative edges but no negative cycles, Johnson's algorithm can be better.

Floyd-Warshall's advantage is simplicity and predictable all-pairs coverage.

Its disadvantage is cubic scaling.

At $n=500$, the loop count is already $125,000,000$ candidate relaxations.

That is feasible in optimized environments but not casual.

At $n=10,000$, the algorithm is normally impossible for ordinary memory and time budgets.

The matrix alone has $100,000,000$ entries.

Path reconstruction also has cost.

The `next` matrix stores one next hop per ordered pair.

For dense all-pairs querying, that is acceptable.

For one-off distance queries, it may be wasteful.

If only reachability or distance is needed, skip reconstruction.

If actual paths are part of the API, test reconstruction for direct edges, multi-hop paths, and unreachable pairs.

The matrix representation also fixes vertex identity.

External vertex labels must be mapped to dense indices.

Store both maps when returning paths to caller-facing code.

The algorithm should not leak arbitrary internal indices if the input used names, IDs, or objects.

Index mapping is boring until it is wrong.

A path `[0, 1, 2]` means nothing to a caller who supplied airport codes.

## 6. Systems Connections

Floyd-Warshall is useful when the graph is small enough and all-pairs answers are repeatedly needed.

Routing policy analysis sometimes works on small abstract graphs rather than raw network-scale topology.

Game maps with moderate node counts can precompute all-pairs distances for AI decisions.

Compiler and static-analysis tools use similar transitive-closure reasoning on relation graphs.

Database query optimizers and planners sometimes maintain small cost matrices.

The algorithm also teaches dynamic programming over graph structure.

The allowed-intermediate-vertex invariant appears in transitive closure.

Warshall's reachability algorithm replaces numeric `min-plus` arithmetic with boolean logic.

Instead of asking whether a path is shorter through `k`, it asks whether a path exists through `k`.

Negative cycle detection is another systems connection.

Currency-exchange arbitrage can be modeled with transformed edge weights.

A negative cycle signals an arbitrage opportunity under the model.

Scheduling constraints can also contain cycles with impossible negative totals.

Production use must respect numeric precision.

Floating-point weights can create tiny comparison artifacts.

Integer weights can overflow if infinity sentinels are added blindly.

The implementation should choose numeric representation based on the domain.

Floyd-Warshall can also be viewed as min-plus matrix closure.

Ordinary matrix multiplication combines multiplication and addition.

Shortest-path closure over path lengths combines addition and minimum.

That algebraic view matters in advanced algorithms and GPU-style implementations.

For day-to-day DSA work, the intermediate-vertex invariant is usually easier to reason about.

Still, the algebra explains why the algorithm resembles repeated relaxation over a matrix.

It is computing the best path under the min-plus semiring.

The same shape appears in graph constraint closure.

Difference constraints, reachability, and small policy graphs can all use matrix closure ideas.

The cubic cost limits scale, but the implementation is predictable.

When the graph has a few dozen or a few hundred vertices and queries are numerous, precomputing the full closure can simplify downstream code.

When the graph has millions of vertices, the same idea is the wrong tool.

## 7. Practice Checklist

- Use the `k` loop as the outermost loop.
- Initialize diagonal distances to zero.
- Initialize missing edges to infinity.
- Keep the lightest edge when parallel edges exist.
- Skip `dist[i][k] + dist[k][j]` when a prefix is unreachable if using finite sentinels.
- Use a `next` matrix when paths must be reconstructed.
- Detect negative cycles by checking the diagonal after the algorithm.
- Remember that directed pairs are ordered.
- Test unreachable vertex pairs.
- Test negative edges without negative cycles.
- Test a graph with a negative cycle.
- Test parallel edges.
- Test path reconstruction, not only distances.
- Avoid Floyd-Warshall for huge sparse graphs.
- Consider Johnson's algorithm for sparse all-pairs shortest paths with negative edges.
- Consider repeated Dijkstra for sparse nonnegative graphs.
- Use Warshall's boolean variant for transitive closure.
- Watch integer overflow with large sentinels.
- Treat floating-point comparisons carefully.
- Document the vertex ordering used by the matrix.
- Test diagonal entries after completion.
- Decide whether to merely detect or fully propagate negative-cycle effects.
- Omit the `next` matrix when paths are not needed.
- Test transitive closure separately from weighted shortest paths.
- Keep numeric infinity behavior explicit.
- Map external labels to dense matrix indices and back.
- Test named-vertex path reconstruction.
- Treat loop order as a correctness condition.
- Mark negative-infinite pairs when the API needs that distinction.

## 8. Frequently Asked Questions

### Does Floyd-Warshall work with negative edges?

Yes.

It works with negative edges as long as no relevant negative cycle exists.

### How does it detect negative cycles?

After the algorithm, a negative diagonal entry `dist[v][v]` means a negative cycle is reachable through `v`.

### Why is the `k` loop outermost?

Each phase allows one more intermediate vertex.

Putting `k` inside changes the dynamic-programming invariant.

### Is Floyd-Warshall good for sparse graphs?

Usually not for large sparse graphs.

Repeated Dijkstra or Johnson's algorithm is often better.

### Can it reconstruct paths?

Yes.

Store the next hop for each source-target pair and update it whenever a shorter path is found.

### What is the space cost?

The distance matrix uses $O(n^2)$ space.

Path reconstruction adds another $O(n^2)$ matrix.

### What is Warshall's algorithm?

It is the boolean reachability version of the same intermediate-vertex idea.

It computes transitive closure.

### What is the most common bug?

Using the wrong loop order or forgetting to initialize the diagonal to zero.

Either mistake breaks the intended DP state.
