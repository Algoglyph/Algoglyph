# Bellman–Ford: Edge Relaxation, Negative Weights & Cycle Reachability

![Bellman–Ford: Edge Relaxation, Negative Weights & Cycle Reachability](/images/dsa/bellman-ford-floyd-warshall-dark.jpg#dark)

## 1. Historical Context & Motivation

Shortest-path problems ask for the minimum total weight of a route from a source to other vertices.

When every edge weight is nonnegative, Dijkstra's greedy settlement rule is effective.

A negative edge breaks that rule.

A vertex that appears final can later receive a cheaper path through a negative edge from a vertex processed afterward.

Bellman–Ford uses a different principle.

It repeatedly relaxes every directed edge instead of permanently settling the currently cheapest vertex.

After enough complete passes, information from the source can propagate across every simple path.

The algorithm is associated with work by Richard Bellman and Lester Ford Jr. in the late 1950s.

Its value is broader than accepting negative weights.

It also detects a reachable negative-weight cycle.

Such a cycle changes the meaning of “shortest.”

If a route from the source can enter a cycle whose total weight is negative, traversing that cycle repeatedly makes path cost arbitrarily small.

For the cycle and every vertex reachable from it, no finite minimum distance exists.

That state is different from “unreachable.”

An unreachable vertex has no source path and is conventionally assigned $+\infty$.

A vertex affected by a reachable negative cycle has path infimum $-\infty$.

Conflating those conditions produces misleading APIs.

Bellman–Ford therefore supports three useful outcomes per vertex:

- a finite shortest distance;
- unreachable from the source;
- reachable from a source-reachable negative cycle.

This distinction appears in routing, difference constraints, arbitrage models, timing analysis, and graph validation.

In distance-vector routing, nodes repeatedly exchange estimates and relax routes through neighbors.

The distributed setting introduces failure modes such as count-to-infinity, which are not solved merely by knowing the centralized algorithm.

Bellman–Ford's main disadvantage is work.

For $|V|$ vertices and $|E|$ edges, the standard bound is $O(|V||E|)$.

That is slower than heap-based Dijkstra on large sparse graphs with nonnegative weights.

The correct selection rule is semantic before it is asymptotic:

**use an algorithm whose assumptions match the edge-weight model and whose result represents negative-cycle effects honestly.**

## 2. Core Mathematical Invariants

### Path weight and distance

For a directed path:

$$
p=(v_0,v_1,\ldots,v_k),
$$

its weight is:

$$
w(p)=\sum_{i=0}^{k-1}w(v_i,v_{i+1}).
$$

The shortest-path distance from source $s$ to vertex $v$ is:

$$
\delta(s,v)=\min_{p:s\leadsto v}w(p)
$$

when a finite minimum exists.

If no path exists, $\delta(s,v)=+\infty$.

If arbitrarily negative path weights exist because a reachable negative cycle can lead to $v$, the appropriate classification is $-\infty$ rather than a finite number.

### Upper-bound invariant

Initialize:

$$
d[s]=0
$$

and:

$$
d[v]=+\infty\quad\text{for }v\ne s.
$$

Every finite estimate corresponds to the weight of some discovered source-to-vertex walk.

Therefore, while no negative-cycle classification has been applied:

$$
d[v]\ge\delta(s,v)
$$

for vertices with finite shortest paths.

Relaxation only replaces an estimate with another realizable path weight.

It never invents a value smaller than every actual path.

### Edge relaxation

For edge $(u,v)$ of weight $w(u,v)$, test:

$$
d[u]+w(u,v)<d[v].
$$

The test is meaningful only when $d[u]$ is finite.

If it succeeds, assign:

$$
d[v]\leftarrow d[u]+w(u,v)
$$

and record:

$$
pred[v]\leftarrow u.
$$

This enforces the triangle inequality for that edge at the moment of relaxation:

$$
d[v]\le d[u]+w(u,v).
$$

Later changes to $d[u]$ can make the edge profitable again, which is why edges are revisited.

### Pass invariant

After $i$ complete passes over all edges, $d[v]$ is no greater than the weight of the cheapest source-to-$v$ path using at most $i$ edges.

This statement is independent of edge order.

Within one pass, a favorable edge order may propagate across several edges immediately.

An unfavorable order may propagate information across only one new edge.

The $|V|-1$ bound covers the worst order.

The proof is inductive.

Before any pass, only the zero-edge path from $s$ is known.

Assume paths of at most $i-1$ edges are represented after pass $i-1$.

Take a cheapest path to $v$ using at most $i$ edges.

Its final edge is $(u,v)$, and its prefix to $u$ uses at most $i-1$ edges.

During pass $i$, relaxing $(u,v)$ can extend the represented prefix and establish the path value for $v$.

### Why $|V|-1$ passes suffice

Any finite shortest path can be chosen simple when no reachable negative cycle affects its destination.

A simple path visits each vertex at most once.

It therefore contains at most $|V|-1$ edges.

The pass invariant then implies that $|V|-1$ passes are sufficient to represent every finite shortest path.

### Early termination

If one complete pass performs no relaxation, every edge already satisfies:

$$
d[v]\le d[u]+w(u,v).
$$

Another identical pass cannot change any estimate.

The algorithm may terminate early.

This optimization preserves correctness because it observes a fixed point; it does not guess that later work is unnecessary.

### Reachable negative-cycle test

After at most $|V|-1$ ordinary passes, scan all edges once more.

If an edge from a finite-distance vertex can still relax, some source-reachable negative cycle influences that relaxation.

Why?

Any strictly improving walk with at least $|V|$ edges repeats a vertex.

Removing a nonnegative repeated cycle could not be necessary for strict improvement beyond the best simple path.

Thus the repeated portion responsible for continued decrease includes a negative cycle.

An edge from an unreachable tail must not seed this detection.

A negative cycle in a disconnected component does not invalidate distances from the chosen source.

### Propagating $-\infty$

Detecting one relaxable edge is not enough for a vertex-by-vertex result.

Seed vertices whose estimates can still improve.

Then traverse outgoing edges from those seeds.

Every reachable descendant also has no finite minimum because a walk can loop around the negative cycle arbitrarily many times before continuing to that descendant.

Vertices that cannot be reached from any such seed retain their finite or unreachable classification.

### Predecessor limitations

For finite vertices, predecessor links reconstruct one shortest path if updates store the improving parent.

For unreachable vertices, no predecessor path exists.

For negative-cycle-affected vertices, following predecessors can loop and does not represent a finite optimum.

Path-reconstruction APIs must reject both non-finite cases explicitly.

## 3. Step-by-Step Execution Trace

### Graph and edge order

Use vertices:

```text
S, A, B, C, D
```

and directed weighted edges in this deliberately unfavorable order:

```text
C -> D  weight  2
B -> C  weight -3
A -> B  weight  4
S -> A  weight  5
S -> D  weight 20
```

The expected shortest route to `D` is:

```text
S -> A -> B -> C -> D
```

Its weight is:

$$
5+4-3+2=8.
$$

The negative edge `B -> C` is safe because this graph has no directed cycle at all.

### Initialization

Set:

```text
d[S] = 0
d[A] = d[B] = d[C] = d[D] = infinity
```

All predecessors are absent.

### Pass 1

Process `C -> D` first.

`C` is unreachable so no update occurs.

Process `B -> C`.

`B` is unreachable so no update occurs.

Process `A -> B`.

`A` is unreachable so no update occurs.

Process `S -> A`.

Candidate cost is $0+5=5$, so set `d[A]=5` and `pred[A]=S`.

Process `S -> D`.

Candidate cost is $0+20=20$, so set `d[D]=20` and `pred[D]=S`.

End-of-pass state:

```text
S: 0, A: 5, B: inf, C: inf, D: 20
```

Only the first edge of the best four-edge route has propagated because its later edges appeared earlier in the pass.

### Pass 2

`C -> D` and `B -> C` still have unreachable tails.

For `A -> B`, candidate cost is $5+4=9$.

Set `d[B]=9` and `pred[B]=A`.

The two source edges do not improve their destinations.

End-of-pass state:

```text
S: 0, A: 5, B: 9, C: inf, D: 20
```

### Pass 3

`C -> D` still cannot relax.

For `B -> C`, candidate cost is $9-3=6$.

Set `d[C]=6` and `pred[C]=B`.

No later edge improves another estimate.

End-of-pass state:

```text
S: 0, A: 5, B: 9, C: 6, D: 20
```

### Pass 4

For `C -> D`, candidate cost is $6+2=8$.

Replace `d[D]=20` with `d[D]=8` and set `pred[D]=C`.

No other edge improves.

End-of-pass state:

```text
S: 0, A: 5, B: 9, C: 6, D: 8
```

There are five vertices, so four passes cover the worst-case simple-path length.

### Detection pass

Check all edges again.

Every edge satisfies its triangle inequality.

No seed vertex is found.

All finite estimates are valid shortest distances.

Following predecessors from `D` gives:

```text
D <- C <- B <- A <- S
```

Reversing yields the expected path `S, A, B, C, D`.

### Add a reachable negative cycle

Now add:

```text
C -> A  weight -2
```

The cycle is:

```text
A -> B -> C -> A
```

Its total weight is:

$$
4+(-3)+(-2)=-1.
$$

The source reaches `A`, so it reaches this negative cycle.

Each lap reduces path weight by one.

No finite shortest distance exists for `A`, `B`, or `C`.

Because `C -> D`, vertex `D` is also affected even though it is not on the cycle.

`S` is not affected because no edge leads from the cycle back to `S`.

The correct classification is:

```text
S: 0
A: -infinity
B: -infinity
C: -infinity
D: -infinity
```

This trace shows why reporting only “a negative cycle exists” is less useful than identifying its reachable influence region.

## 4. Production-Ready Implementations

The following Python implementation validates graph identity, supports arbitrary hashable vertices, computes finite distances and predecessors, propagates reachable negative-cycle effects, and reconstructs only well-defined paths.

```python
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from math import inf
from typing import Generic, Hashable, Iterable, Optional, TypeVar

Vertex = TypeVar("Vertex", bound=Hashable)


@dataclass(frozen=True, slots=True)
class Edge(Generic[Vertex]):
    source: Vertex
    target: Vertex
    weight: float


@dataclass(slots=True)
class BellmanFordResult(Generic[Vertex]):
    source: Vertex
    distance: dict[Vertex, float]
    predecessor: dict[Vertex, Optional[Vertex]]
    negative_infinite: frozenset[Vertex]

    def path_to(self, target: Vertex) -> Optional[list[Vertex]]:
        if target not in self.distance:
            raise KeyError(target)
        if target in self.negative_infinite:
            raise ValueError("target has no finite shortest path")
        if self.distance[target] == inf:
            return None
        path: list[Vertex] = []
        cursor: Optional[Vertex] = target
        seen: set[Vertex] = set()
        while cursor is not None:
            if cursor in seen:
                raise AssertionError("finite predecessor chain contains a cycle")
            seen.add(cursor)
            path.append(cursor)
            if cursor == self.source:
                path.reverse()
                return path
            cursor = self.predecessor[cursor]
        raise AssertionError("finite predecessor chain did not reach the source")


def bellman_ford(
    vertices: Iterable[Vertex],
    edges: Iterable[Edge[Vertex]],
    source: Vertex,
) -> BellmanFordResult[Vertex]:
    vertex_list = list(vertices)
    if len(vertex_list) != len(set(vertex_list)):
        raise ValueError("vertices must be unique")
    vertex_set = set(vertex_list)
    if source not in vertex_set:
        raise ValueError("source is not present in vertices")

    edge_list = list(edges)
    outgoing: dict[Vertex, list[Vertex]] = {vertex: [] for vertex in vertex_list}
    for edge in edge_list:
        if edge.source not in vertex_set or edge.target not in vertex_set:
            raise ValueError("edge endpoint is not present in vertices")
        if edge.weight != edge.weight or edge.weight in (inf, -inf):
            raise ValueError("edge weights must be finite numbers")
        outgoing[edge.source].append(edge.target)

    distance = {vertex: inf for vertex in vertex_list}
    predecessor: dict[Vertex, Optional[Vertex]] = {
        vertex: None for vertex in vertex_list
    }
    distance[source] = 0.0

    for _ in range(max(0, len(vertex_list) - 1)):
        changed = False
        for edge in edge_list:
            if distance[edge.source] == inf:
                continue
            candidate = distance[edge.source] + edge.weight
            if candidate < distance[edge.target]:
                distance[edge.target] = candidate
                predecessor[edge.target] = edge.source
                changed = True
        if not changed:
            break

    seeds: set[Vertex] = set()
    for edge in edge_list:
        if distance[edge.source] == inf:
            continue
        if distance[edge.source] + edge.weight < distance[edge.target]:
            seeds.add(edge.target)

    affected = set(seeds)
    queue = deque(seeds)
    while queue:
        current = queue.popleft()
        for neighbor in outgoing[current]:
            if neighbor not in affected:
                affected.add(neighbor)
                queue.append(neighbor)

    for vertex in affected:
        distance[vertex] = -inf
        predecessor[vertex] = None

    return BellmanFordResult(
        source=source,
        distance=distance,
        predecessor=predecessor,
        negative_infinite=frozenset(affected),
    )
```

### Verify the pass-order trace

```python
vertices = ["S", "A", "B", "C", "D", "X"]
edges = [
    Edge("C", "D", 2),
    Edge("B", "C", -3),
    Edge("A", "B", 4),
    Edge("S", "A", 5),
    Edge("S", "D", 20),
]

result = bellman_ford(vertices, edges, "S")
assert result.distance == {
    "S": 0.0,
    "A": 5.0,
    "B": 9.0,
    "C": 6.0,
    "D": 8.0,
    "X": inf,
}
assert result.path_to("D") == ["S", "A", "B", "C", "D"]
assert result.path_to("X") is None
assert result.negative_infinite == frozenset()
```

### Verify reachable and unreachable negative cycles

```python
reachable_cycle = edges + [Edge("C", "A", -2)]
cycle_result = bellman_ford(vertices, reachable_cycle, "S")
assert cycle_result.negative_infinite == frozenset({"A", "B", "C", "D"})
assert cycle_result.distance["S"] == 0
assert cycle_result.distance["X"] == inf

try:
    cycle_result.path_to("D")
    raise AssertionError("affected target should reject reconstruction")
except ValueError:
    pass

disconnected_vertices = vertices + ["Y"]
disconnected_cycle = edges + [Edge("X", "Y", -2), Edge("Y", "X", 1)]
disconnected_result = bellman_ford(disconnected_vertices, disconnected_cycle, "S")
assert disconnected_result.negative_infinite == frozenset()
assert disconnected_result.distance["X"] == inf
assert disconnected_result.distance["Y"] == inf
```

### Differential verification on nonnegative graphs

For nonnegative weights, Bellman–Ford should agree with a heap-based Dijkstra reference.

The test generates deterministic random directed graphs and compares every distance.

```python
import heapq
import random


def dijkstra_reference(
    vertices: list[int],
    edges: list[Edge[int]],
    source: int,
) -> dict[int, float]:
    adjacency: dict[int, list[tuple[int, float]]] = {vertex: [] for vertex in vertices}
    for edge in edges:
        adjacency[edge.source].append((edge.target, edge.weight))
    distance = {vertex: inf for vertex in vertices}
    distance[source] = 0.0
    queue: list[tuple[float, int]] = [(0.0, source)]
    while queue:
        current_distance, vertex = heapq.heappop(queue)
        if current_distance != distance[vertex]:
            continue
        for neighbor, weight in adjacency[vertex]:
            candidate = current_distance + weight
            if candidate < distance[neighbor]:
                distance[neighbor] = candidate
                heapq.heappush(queue, (candidate, neighbor))
    return distance


rng = random.Random(20260830)
for size in range(1, 24):
    graph_vertices = list(range(size))
    graph_edges: list[Edge[int]] = []
    for source_vertex in graph_vertices:
        for target_vertex in graph_vertices:
            if source_vertex != target_vertex and rng.random() < 0.12:
                graph_edges.append(Edge(source_vertex, target_vertex, rng.randrange(0, 15)))
    actual = bellman_ford(graph_vertices, graph_edges, 0)
    expected = dijkstra_reference(graph_vertices, graph_edges, 0)
    assert actual.distance == expected
    assert actual.negative_infinite == frozenset()
```

### Numeric and API cautions

Floating-point comparison can make nearly equal route costs sensitive to rounding.

Do not add an arbitrary epsilon without defining what it means for the application's weight domain.

Financial or exact constraint systems may need integers, rationals, or fixed-point values.

Very large integer sums require a language or policy that avoids silent overflow.

The implementation rejects NaN and infinite edge weights because they make relaxation ordering and classification ambiguous.

For untrusted graphs, enforce vertex and edge limits before allocating adjacency structures or starting $O(|V||E|)$ work.

## 5. Asymptotic Time & Space Complexity

Let $V=|V|$ and $E=|E|$.

### Initialization

Building distance, predecessor, and outgoing maps costs $O(V+E)$ time.

The maps and edge list use $O(V+E)$ space.

### Relaxation passes

One pass scans all $E$ edges.

At most $V-1$ ordinary passes are required.

Worst-case relaxation time is:

$$
O((V-1)E)=O(VE).
$$

The early-stop check can reduce actual passes to $k<V-1$ when estimates reach a fixed point quickly.

Its runtime is then $O(kE)$.

The worst-case bound remains $O(VE)$ because edge ordering and path length can force all passes, as the trace demonstrates.

### Negative-cycle detection and propagation

The extra detection scan costs $O(E)$.

Breadth-first propagation over outgoing adjacency visits each affected vertex and outgoing edge at most once.

Its worst-case time is $O(V+E)$.

These terms do not exceed the standard relaxation bound for nontrivial graphs.

### Path reconstruction

For a finite target, following predecessors visits at most $V$ vertices in a valid result.

Time is $O(V)$ in the worst case and $O(\ell)$ for a path of $\ell$ edges.

The returned list and cycle-defense set use $O(\ell)$ space.

### Auxiliary storage

Distances and predecessors use $O(V)$.

The outgoing adjacency used for effect propagation uses $O(V+E)$.

Seeds, affected vertices, and the queue use $O(V)$.

Total auxiliary storage beyond the input edge list is $O(V+E)$.

If only cycle existence were needed, outgoing propagation could be omitted, but the result would lose per-vertex $-\infty$ classification.

### Sparse versus dense graphs

For a sparse graph with $E=O(V)$, worst-case time is $O(V^2)$.

For a dense graph with $E=\Theta(V^2)$, it is $O(V^3)$.

Floyd–Warshall also uses $O(V^3)$ time on dense graphs but computes all-pairs distances and uses a matrix representation.

Algorithm selection depends on source count, density, weights, and required negative-cycle reporting.

### Queue-based variants

Queue-driven label-correcting variants process outgoing edges only from recently improved vertices.

They can be fast on many instances.

Their worst case remains poor, and adversarial inputs can cause extensive reprocessing.

They should be chosen from measured workload evidence rather than advertised as a universally faster complexity class.

## 6. Systems Connections

### Difference constraints

A constraint:

$$
x_v-x_u\le c
$$

can be represented by edge $u\to v$ with weight $c$.

Shortest-path potentials satisfy the collection when no negative cycle exists in the constructed graph.

A negative cycle proves the inequalities are inconsistent because summing constraints around the cycle yields an impossible strict decrease.

Adding a super-source with zero-weight edges makes every variable reachable for global feasibility detection.

### Currency arbitrage

An exchange sequence multiplies rates.

Applying negative logarithms converts multiplication into addition:

$$
w(u,v)=-\log(rate(u,v)).
$$

A product of rates greater than one becomes a cycle with negative total log weight.

Bellman–Ford can detect that mathematical opportunity.

A real trading system must also include fees, bid/ask spreads, liquidity, latency, quantity limits, and execution risk.

The graph result alone is not a guaranteed profit.

### Distance-vector routing

The relaxation equation resembles a router updating a destination estimate through a neighbor.

Distributed messages arrive asynchronously and routers do not hold one synchronized global edge list.

Link failures can cause stale routes and count-to-infinity behavior.

Split horizon, poisoned reverse, hold-down policies, and bounded metrics address parts of that operational problem.

Centralized Bellman–Ford correctness should not be copied uncritically into a network protocol claim.

### Johnson's all-pairs algorithm

Johnson's algorithm adds a super-source and runs Bellman–Ford once to compute vertex potentials.

Those potentials reweight edges so all adjusted weights are nonnegative while preserving shortest-path ordering.

Dijkstra can then run from each source.

A detected negative cycle prevents this reweighting because finite potentials cannot satisfy the required inequalities.

### Timing and dependency analysis

Edges can encode upper-bound relationships between events.

Negative-cycle detection exposes contradictory constraint chains.

The interpretation of edge direction is easy to reverse, so a worked inequality-to-edge example should accompany implementation tests.

### Observability

Useful metrics include graph size, completed passes, relaxations per pass, early termination, number of negative-cycle seeds, affected-vertex count, and total runtime.

A sudden increase to $V-1$ passes may indicate a changed edge order or longer dependency chains.

Logs should avoid dumping sensitive graph labels or weights by default.

### Parallel processing

Relaxations within a pass are not trivially independent when updates are applied in place.

One edge can observe a value written earlier in the same pass.

A synchronous parallel formulation reads the previous distance array and writes a next array, giving a clearer round semantics at extra memory and potentially more rounds.

Atomic in-place implementations require careful convergence and predecessor rules.

Correctness and determinism should be established before parallelizing edge scans.

## 7. Practice Checklist

### Model the graph

- State whether edges are directed.
- Include both directions explicitly for an undirected graph.
- Define the weight numeric domain.
- Reject NaN and unsupported infinities.
- Decide whether parallel edges are allowed.
- Decide whether self-loops are allowed.
- Validate every endpoint.
- Define source membership.
- Distinguish unreachable from negative-infinite.

### Implement relaxation

- Initialize only the source to zero.
- Skip edges whose tail remains unreachable.
- Use strict improvement for predecessor replacement.
- Record the predecessor on every improvement.
- Scan all edges in each pass.
- Stop only after a full unchanged pass.
- Perform at most $V-1$ ordinary passes.
- Use overflow-safe arithmetic for the weight domain.

### Detect cycle effects

- Run an additional relaxability scan.
- Ignore edges from unreachable tails.
- Seed vertices whose estimates can still improve.
- Traverse outgoing edges from all seeds.
- Mark descendants as negative-infinite.
- Do not reconstruct paths for affected vertices.
- Test a reachable negative cycle.
- Test a disconnected negative cycle.
- Test a negative self-loop.
- Test a cycle with total weight zero.

### Verify finite results

- Check the source distance is zero when it is not cycle-affected.
- Check every predecessor edge exists.
- Sum reconstructed path weights.
- Verify each finite edge satisfies the triangle inequality.
- Compare against Dijkstra on nonnegative graphs.
- Compare against Floyd–Warshall on small random graphs.
- Test an empty edge set.
- Test one vertex.
- Test a long path in reverse edge order.
- Test duplicate edges with different weights.

### Operate safely

- Enforce input size budgets.
- Support cancellation between passes for large graphs.
- Expose completed-pass counts.
- Separate malformed input from negative-cycle results.
- Avoid arbitrary floating tolerances.
- Document exact or approximate numeric behavior.
- Bound serialized output for huge predecessor maps.
- Avoid logging confidential graph contents.
- Profile edge scans before adding concurrency.
- Keep negative-cycle propagation in the result contract.

## 8. Frequently Asked Questions

### Can Bellman–Ford handle negative edges?

Yes.

Negative edges are the main reason to choose it over Dijkstra's ordinary greedy formulation.

A reachable negative cycle prevents finite shortest distances for the cycle and its reachable descendants.

### Does any negative cycle invalidate the result?

No.

Only a negative cycle reachable from the selected source affects single-source distances.

A disconnected negative cycle remains irrelevant to that source unless the task is global cycle detection.

### Why are $V-1$ passes enough?

A finite shortest path can be simple when it is not influenced by a reachable negative cycle.

A simple path in a $V$-vertex graph has at most $V-1$ edges.

Each full pass guarantees propagation across one additional edge in the worst case.

### Can one pass propagate across several edges?

Yes.

In-place relaxation observes earlier updates in the same pass.

A favorable edge order can propagate through a long path immediately.

The algorithm does not rely on that favorable order for correctness.

### Why skip relaxation from infinity?

An unreachable tail does not define a source path to extend.

In fixed-width arithmetic, adding a weight to a sentinel can also overflow or create a bogus candidate.

The explicit check preserves both semantics and numeric safety.

### What does an extra successful relaxation prove?

After $V-1$ passes, every finite simple shortest path is already represented.

A further strict improvement requires a repeated vertex on an improving walk, and the responsible reachable repetition includes negative total weight.

### Why mark vertices downstream of the cycle?

A path can loop around the negative cycle arbitrarily many times and then leave toward any reachable descendant.

That makes the descendant's path weight arbitrarily negative even if the descendant is not itself on the cycle.

### Can predecessor links identify the exact cycle?

They can help extract a witness: follow predecessors enough steps to enter a repeated region, then walk until a vertex repeats.

Care is needed because predecessor state after detection may reflect one of several improving structures.

The implementation here reports the affected region rather than promising one canonical cycle witness.

### Is Bellman–Ford always slower than Dijkstra?

Its worst-case bound is larger on nonnegative sparse graphs.

Small graphs, early termination, edge layout, and implementation constants can narrow the difference.

Semantic support for negative weights and cycle detection remains the decisive distinction.

### Should floating-point comparisons use an epsilon?

Only if the application defines an approximation policy that justifies one.

An arbitrary epsilon can hide a genuinely negative cycle or change which path is selected.

Exact integers or fixed-point values are preferable when the domain permits them.

### How can Bellman–Ford detect any negative cycle in a graph?

Add a synthetic super-source with zero-weight edges to every vertex, then run the algorithm from it.

Every component becomes reachable.

The super-source does not change cycle weights.

### What is the difference between `+infinity` and `-infinity` here?

`+infinity` means no route from the source is known because none exists.

`-infinity` means routes exist with arbitrarily small weight due to a reachable negative cycle.

Neither state supports a finite predecessor path, but for opposite reasons.

### Is early stopping always safe?

It is safe only after a complete pass with no relaxation.

Stopping because one prefix of the edge list made no change is not sufficient; a later edge in that same pass might still improve a distance.

### When is Floyd–Warshall a better choice?

Floyd–Warshall is attractive for dense graphs or when distances between all pairs are required and $O(V^2)$ memory is acceptable.

Bellman–Ford is single-source and works naturally from an edge list, especially on sparse graphs.

### What is the most useful production result type?

Return finite distances, reachability, negative-cycle influence, and path-reconstruction status separately.

A single numeric sentinel or boolean “cycle exists” hides distinctions callers often need.
