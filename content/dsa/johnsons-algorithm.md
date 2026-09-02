# Johnson's Algorithm: Sparse All-Pairs Paths Through Potential Reweighting

![Johnson reweighting followed by repeated Dijkstra searches](/images/dsa/johnsons-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

All-pairs shortest paths asks for the distance from every vertex to every other vertex.

Floyd-Warshall solves the problem in $O(V^3)$ time with a dense distance matrix.

That is attractive for small or dense graphs.

It wastes work when the graph is large and sparse.

Running Dijkstra from every source exploits sparsity, but ordinary Dijkstra rejects negative edge weights.

Running Bellman-Ford from every source supports negative edges but costs $O(V^2E)$.

Johnson's algorithm combines the strengths of both.

It runs Bellman-Ford once to compute a vertex potential.

The potential reweights every edge so its new weight is nonnegative.

It then runs Dijkstra from every source on the reweighted graph.

Finally, it converts each reweighted distance back to the original metric.

The reweighting changes individual edge values.

It does not change which paths are shortest between fixed endpoints.

Every path from source $s$ to target $t$ receives the same additive adjustment $h(s)-h(t)$.

Competing paths between those endpoints preserve their relative costs.

The Bellman-Ford phase also detects negative cycles.

If a negative cycle exists, shortest-path distance is undefined for pairs that can exploit it.

No reweighting can turn that instance into an ordinary finite all-pairs result.

Johnson's algorithm is therefore designed for directed weighted graphs that may contain negative edges but contain no negative-weight cycle.

Undirected negative edges need special attention.

Representing an undirected edge as two directed edges creates an immediate two-edge negative cycle.

The algorithm's useful negative-edge case is primarily directed.

The output itself can require $\Theta(V^2)$ space if every pairwise distance is materialized.

For huge graphs, an API may stream one source row at a time or answer selected sources only.

The central question is:

How can vertex potentials make every edge nonnegative without changing the identity or original cost of any shortest path?

## 2. Core Mathematical Invariants

Let $G=(V,E)$ be a directed graph with weight function $w:E\to\mathbb{R}$.

Add a new super-source $q$.

Add edge $(q,v)$ of weight zero for every original vertex $v$.

Run Bellman-Ford from $q$.

Let:

$$
h(v)=\delta(q,v),
$$

the shortest distance from the super-source to $v$.

Because every vertex has a direct zero edge from $q$, each potential is finite and no greater than zero.

### Bellman-Ford feasibility invariant

At completion without a negative cycle, shortest-path potentials satisfy every edge inequality:

$$
h(v)\le h(u)+w(u,v).
$$

Rearranging gives:

$$
w(u,v)+h(u)-h(v)\ge0.
$$

Define the reweighted edge:

$$
w'(u,v)=w(u,v)+h(u)-h(v).
$$

Every reweighted edge is nonnegative.

That invariant makes Dijkstra valid.

### Path telescoping invariant

Consider path:

$$
p=v_0\to v_1\to\cdots\to v_k.
$$

Its reweighted cost is:

$$
\sum_{i=0}^{k-1}\left(w(v_i,v_{i+1})+h(v_i)-h(v_{i+1})\right).
$$

Intermediate potentials cancel.

The result is:

$$
w'(p)=w(p)+h(v_0)-h(v_k).
$$

For fixed endpoints $s$ and $t$, every candidate path receives the same adjustment $h(s)-h(t)$.

Therefore one path is cheaper than another before reweighting exactly when it is cheaper afterward.

Shortest paths are preserved.

### Distance restoration invariant

If Dijkstra computes reweighted distance $d'(s,t)$, the original distance is:

$$
d(s,t)=d'(s,t)-h(s)+h(t).
$$

This is the inverse of the path adjustment.

Returning `d'` directly would expose incorrect values even though the chosen paths are correct.

### Negative-cycle invariant

The super-source reaches every original vertex.

Therefore Bellman-Ford detects any negative cycle anywhere in the graph, not only cycles reachable from one arbitrary original source.

An additional relaxation after $|V|$ rounds of the augmented graph proves such a cycle exists.

The all-pairs computation must stop.

### Dijkstra settlement invariant

After reweighting, all edges have nonnegative weight.

When Dijkstra removes the minimum tentative vertex from its priority queue, that distance is final.

Stale queue entries may be skipped when their stored distance differs from the current best.

Each source run is independent.

### Reachability invariant

Reweighting does not add edges among original vertices.

It changes only weights.

If no path exists from $s$ to $t$ originally, none exists afterward.

Unreachable distances remain infinity and must not pass through the restoration arithmetic.

### Graph-preservation invariant

The super-source is conceptual or temporary.

It must not appear in final distance rows.

Production code should avoid mutating the caller's graph irreversibly.

Potential calculation can simulate zero initialization for every vertex instead of physically adding $q$.

## 3. Step-by-Step Execution Trace

Use vertices `A`, `B`, `C`, and `D` with directed weighted edges:

```text
A -> B : 1
A -> C : 4
B -> C : -2
B -> D : 5
C -> D : 2
D -> B : 3
```

The graph contains one negative edge and no negative cycle.

### Add the super-source

Add zero-weight edges from `Q` to `A`, `B`, `C`, and `D`.

Initialize:

```text
h(Q)=0
h(A)=h(B)=h(C)=h(D)=infinity
```

Relax the zero edges.

All original potentials become zero.

### Bellman-Ford relaxation

Edge `B -> C` has weight `-2`.

With `h(B)=0`, update `h(C)` from `0` to `-2`.

Edge `C -> D` has weight `2`.

Candidate potential for `D` is `-2 + 2 = 0`.

`h(D)` stays zero.

Other edges do not create a smaller potential.

Final potentials are:

```text
h(A)=0, h(B)=0, h(C)=-2, h(D)=0
```

No extra relaxation succeeds, so there is no negative cycle.

### Reweight the edges

For `A -> B`:

$$
w'=1+0-0=1.
$$

For `A -> C`:

$$
w'=4+0-(-2)=6.
$$

For `B -> C`:

$$
w'=-2+0-(-2)=0.
$$

For `B -> D`:

$$
w'=5+0-0=5.
$$

For `C -> D`:

$$
w'=2+(-2)-0=0.
$$

For `D -> B`:

$$
w'=3+0-0=3.
$$

Every reweighted edge is nonnegative.

### Run Dijkstra from `A`

Start reweighted distances:

```text
A=0, B=infinity, C=infinity, D=infinity
```

Relax from `A`.

Set `B=1` and `C=6`.

Settle `B` next.

Through zero-weight edge `B -> C`, improve `C` from `6` to `1`.

Set `D=6` through `B`.

Settle `C`.

Through zero-weight edge `C -> D`, improve `D` from `6` to `1`.

Settle `D`.

Reweighted row is:

```text
d'(A,A)=0, d'(A,B)=1, d'(A,C)=1, d'(A,D)=1
```

### Restore original distances

For `A -> C`:

$$
d(A,C)=1-h(A)+h(C)=1-0-2=-1.
$$

This corresponds to path `A -> B -> C` with cost $1+(-2)=-1$.

For `A -> D`:

$$
d(A,D)=1-0+0=1.
$$

Path `A -> B -> C -> D` costs $1-2+2=1$.

For `A -> B`, restoration leaves distance one.

The path identities and original costs are correct.

### Negative-cycle contrast

If edge `D -> B` changed from `3` to `-1`, cycle `B -> C -> D -> B` would cost `-2 + 2 - 1 = -1`.

Bellman-Ford's extra pass would find another improvement.

Johnson's algorithm would report the negative cycle instead of running Dijkstra.

## 4. Production-Ready Implementations

The implementation uses integer vertex identifiers and an edge list.

Potentials are initialized to zero for all vertices, which is equivalent to relaxing zero edges from a super-source.

```python
from heapq import heappop, heappush
from math import inf
from typing import Iterable

Edge = tuple[int, int, int]


def bellman_ford_potentials(vertex_count: int, edges: list[Edge]) -> list[int]:
    potential = [0] * vertex_count

    for _ in range(vertex_count - 1):
        changed = False
        for source, target, weight in edges:
            candidate = potential[source] + weight
            if candidate < potential[target]:
                potential[target] = candidate
                changed = True
        if not changed:
            break

    for source, target, weight in edges:
        if potential[source] + weight < potential[target]:
            raise ValueError("graph contains a negative-weight cycle")

    return potential


def dijkstra(
    adjacency: list[list[tuple[int, int]]],
    source: int,
) -> list[float]:
    distance = [inf] * len(adjacency)
    distance[source] = 0
    queue: list[tuple[int, int]] = [(0, source)]

    while queue:
        current_distance, vertex = heappop(queue)
        if current_distance != distance[vertex]:
            continue

        for neighbor, weight in adjacency[vertex]:
            candidate = current_distance + weight
            if candidate < distance[neighbor]:
                distance[neighbor] = candidate
                heappush(queue, (candidate, neighbor))

    return distance
```

### Complete all-pairs orchestration

```python
def johnson_all_pairs(vertex_count: int, edges: Iterable[Edge]) -> list[list[float]]:
    materialized = list(edges)
    for source, target, _ in materialized:
        if not (0 <= source < vertex_count and 0 <= target < vertex_count):
            raise ValueError("edge endpoint is outside the graph")

    potential = bellman_ford_potentials(vertex_count, materialized)
    adjacency: list[list[tuple[int, int]]] = [[] for _ in range(vertex_count)]

    for source, target, weight in materialized:
        reweighted = weight + potential[source] - potential[target]
        if reweighted < 0:
            raise AssertionError("potential failed to make an edge nonnegative")
        adjacency[source].append((target, reweighted))

    result: list[list[float]] = []
    for source in range(vertex_count):
        reweighted_distances = dijkstra(adjacency, source)
        original_distances = []
        for target, value in enumerate(reweighted_distances):
            if value == inf:
                original_distances.append(inf)
            else:
                original_distances.append(value - potential[source] + potential[target])
        result.append(original_distances)

    return result
```

The implementation avoids restoration arithmetic on infinity.

It checks endpoint bounds before indexing arrays.

### Execute the trace and cycle rejection

```python
edges = [
    (0, 1, 1),
    (0, 2, 4),
    (1, 2, -2),
    (1, 3, 5),
    (2, 3, 2),
    (3, 1, 3),
]

distances = johnson_all_pairs(4, edges)

assert distances[0] == [0, 1, -1, 1]
assert distances[1] == [inf, 0, -2, 0]
assert distances[2] == [inf, 5, 0, 2]
assert distances[3] == [inf, 3, 1, 0]

negative_cycle = [(0, 1, -1), (1, 0, -1)]
try:
    johnson_all_pairs(2, negative_cycle)
except ValueError:
    pass
else:
    raise AssertionError("negative cycle was not detected")
```

For floating-point weights, use tolerant diagnostics carefully without weakening the mathematical nonnegativity requirement unpredictably.

## 5. Asymptotic Time & Space Complexity

Let $V$ be vertex count and $E$ edge count.

The Bellman-Ford potential phase takes $O(VE)$ time.

Reweighting all edges takes $O(E)$ time.

One Dijkstra run with a binary heap and adjacency lists takes:

$$
O((V+E)\log V).
$$

Running it from every source takes:

$$
O(V(V+E)\log V).
$$

For a connected sparse graph where $E=\Omega(V)$, this is commonly summarized with Bellman-Ford as:

$$
O(VE\log V).
$$

A more explicit total is:

$$
O(VE+V(V+E)\log V).
$$

When the graph is dense with $E=\Theta(V^2)$, Floyd-Warshall's $O(V^3)$ can be simpler and asymptotically preferable to binary-heap Johnson implementations.

The adjacency list, edges, potentials, and one Dijkstra workspace require $O(V+E)$ space.

Materializing every distance requires $O(V^2)$ output space.

Streaming one row at a time reduces retained result storage to $O(V+E)$ beyond the consumer.

| Stage | Time | Extra space |
|---|---:|---:|
| Potentials with Bellman-Ford | $O(VE)$ | $O(V)$ |
| Edge reweighting | $O(E)$ | $O(V+E)$ adjacency |
| One Dijkstra run | $O((V+E)\log V)$ | $O(V)$ queue/distances plus entries |
| All Dijkstra runs | $O(V(V+E)\log V)$ | Reused per source |
| Materialized result | — | $O(V^2)$ |

Different priority queues change the Dijkstra term.

Asymptotic improvements do not automatically beat binary heaps in practical sparse graphs.

## 6. Systems Connections

### Sparse routing analysis

Network and dependency graphs are often sparse.

All-pairs analysis can support reachability costs, latency planning, or centrality calculations.

Negative weights may model credits or transformed costs, but negative cycles often signal an invalid model or unbounded arbitrage.

### Difference constraints

Potential functions resemble feasible solutions to difference constraints.

Edge inequality $h(v)\le h(u)+w(u,v)$ is exactly what makes reduced costs nonnegative.

Similar reduced-cost ideas appear in min-cost flow and optimization algorithms.

The potential is not an arbitrary trick; it is a dual-like certificate of safe reweighting.

### A* and consistent potentials

Shortest-path algorithms often transform priorities using potentials or heuristics.

A consistent A* heuristic also ensures nonnegative reduced transition costs.

The endpoint adjustment preserves path comparisons while guiding search order.

The contexts and goals differ, but the algebra is related.

### Incremental updates

Johnson's preprocessing assumes a fixed graph during all source runs.

Changing an edge can invalidate potentials and previous distance rows.

Recomputing only affected results requires dynamic shortest-path techniques beyond the basic algorithm.

### Parallel source runs

After potentials and reweighted adjacency are fixed, Dijkstra runs for distinct sources are independent.

They can execute in parallel with separate distance arrays and queues.

Shared graph storage can remain read-only.

Output size and memory bandwidth may become bottlenecks.

### Numeric safety

Reweighting adds and subtracts path potentials.

Fixed-width integer implementations must prevent overflow in Bellman-Ford relaxation, reweighting, Dijkstra addition, and restoration.

Use a wider type or checked arithmetic.

Infinity sentinels must never participate in ordinary addition.

### Choosing Floyd-Warshall

Floyd-Warshall has compact loops, naturally materializes a distance matrix, and detects negative cycles through diagonal entries.

For dense graphs or modest $V$, it may be the better engineering choice.

Johnson's advantage comes from sparse adjacency and repeated Dijkstra work proportional to edges rather than all possible pairs.

## 7. Practice Checklist

- Confirm the graph is directed when negative edges exist.
- Validate every endpoint.
- Preserve parallel edges or normalize them deliberately.
- Simulate a super-source with zero initial potentials or add it explicitly.
- Run Bellman-Ford before any Dijkstra search.
- Check one extra relaxation for a negative cycle.
- Stop immediately when a negative cycle exists.
- Reweight every original edge with the same potential formula.
- Assert reweighted edges are nonnegative.
- Build adjacency from reweighted weights.
- Use a stale-entry check in heap-based Dijkstra.
- Run Dijkstra independently for every requested source.
- Restore original distances with the inverse potential adjustment.
- Leave unreachable distances as infinity.
- Exclude the super-source from output.
- Test an empty graph.
- Test isolated vertices.
- Test positive-only edges.
- Test one negative edge without a negative cycle.
- Test a disconnected graph.
- Test parallel edges.
- Test a negative self-loop.
- Test a multi-edge negative cycle.
- Compare small random graphs with Floyd-Warshall.
- Verify every reweighted edge directly.
- Verify restored path costs against original weights.
- Use checked arithmetic for bounded integers.
- Stream distance rows when $V^2$ storage is too large.
- Parallelize source runs only after immutable preprocessing.
- Choose Floyd-Warshall when density and simplicity favor it.

## 8. Frequently Asked Questions

### Why not run Dijkstra directly on negative edges?

Dijkstra's settlement proof requires nonnegative outgoing progress.

A later negative edge can improve a vertex already treated as final.

### Why is one Bellman-Ford run enough?

It computes potentials that make all edges nonnegative simultaneously.

Those same reweighted edges are then valid for every Dijkstra source.

### Why add a super-source?

It makes every vertex reachable by a zero edge, so potentials are finite and negative cycles anywhere in the graph are detectable.

### Does reweighting change shortest paths?

No between fixed endpoints.

Every path from $s$ to $t$ receives the same adjustment $h(s)-h(t)$.

### Are the reweighted distances the final answer?

No.

Convert them back with $d(s,t)=d'(s,t)-h(s)+h(t)$.

### Can Johnson's algorithm handle negative cycles?

It detects them but cannot produce finite ordinary shortest paths for the affected graph.

The algorithm must report failure or a richer cycle-aware result.

### Why initialize every potential to zero in the code?

That is equivalent to adding a super-source with zero edges to every vertex and performing its first relaxation immediately.

### Is Johnson always faster than Floyd-Warshall?

No.

It is designed for sparse graphs; dense graphs and small matrices often favor Floyd-Warshall.

### What happens to unreachable pairs?

They remain unreachable because reweighting changes no edges.

Their distance stays infinity and is not adjusted arithmetically.

### Can source runs be parallelized?

Yes after potentials and reweighted adjacency are fixed.

Each Dijkstra run needs separate mutable workspace.

### Does an undirected negative edge work?

Representing it in both directions creates a negative two-edge cycle.

Ordinary undirected shortest paths with negative edges therefore do not fit this finite-distance model.
