# Breadth-First Search: Queue Layers, Unweighted Distance & Graph Reachability

![Breadth-First Search: Queue Layers, Unweighted Distance & Graph Reachability](/images/dsa/bfs-dark.jpg#dark)

## 1. Historical Context & Motivation

Many graph questions are organized by the number of transitions from a starting state.

Examples include the fewest moves in a puzzle, the minimum number of links between users, the nearest matching node in a tree, and every state reachable within a hop budget.

Depth-first search follows one branch before considering its siblings.

That order is excellent for many structural tasks but does not guarantee the first discovered target uses the fewest edges.

**Breadth-first search (BFS)** expands the frontier one distance layer at a time.

A first-in, first-out queue is the mechanism that preserves this order.

Vertices discovered from the source enter before vertices discovered from the next layer.

The result is a shortest-path algorithm for unweighted graphs, or equivalently for graphs whose every edge has the same cost.

BFS is closely associated with early graph-search work in the 1950s, including maze exploration and shortest-route procedures.

Its modern importance comes from treating many non-graph objects as an **implicit graph**.

A word-ladder state has edges to words reachable by one valid edit.

A lock combination has edges to states produced by one wheel turn.

A grid cell has edges to permitted neighboring cells.

The full graph need not be materialized if neighbors can be generated on demand.

BFS answers more than reachability.

With a distance array, it computes minimum hop counts.

With a predecessor map, it reconstructs one shortest path.

With layer boundaries, it computes level-order traversals and bounded-radius neighborhoods.

Repeated from each unvisited vertex, it identifies connected components in an undirected graph.

On a directed graph, the same repeated procedure forms a reachability forest, not strongly connected components.

The algorithm's simplicity hides several correctness-sensitive choices.

A vertex should normally be marked discovered when it is enqueued, not when it is dequeued.

Marking late allows several parents to enqueue the same vertex, increasing memory and obscuring predecessor semantics.

Neighbor order determines which one of several equal-length paths is returned.

The graph representation determines whether runtime is truly $O(V+E)$ or includes repeated membership scans.

For massive or adversarial implicit graphs, the reachable state space may exceed memory even though BFS is asymptotically optimal for shortest hop count.

The governing idea is:

**the queue contains discovered but unexpanded vertices in nondecreasing distance from the source.**

## 2. Core Mathematical Invariants

### Graph model

Let $G=(V,E)$ be directed or undirected.

For unweighted shortest paths, each edge contributes one unit of distance.

The distance from source $s$ to vertex $v$ is:

$$
\delta(s,v)=\min\{|p|:p\text{ is a path from }s\text{ to }v\},
$$

where $|p|$ is the number of edges.

If no path exists, distance is undefined or represented as infinity.

In an undirected adjacency list, each edge usually appears in both endpoint lists.

Complexity counts the logical edge set or the stored adjacency entries consistently.

### Discovery invariant

Each reachable vertex is enqueued at most once.

The implementation establishes this by marking a vertex discovered before or at the same atomic step as enqueueing it.

For a single-threaded traversal:

```text
if neighbor not in distance:
    distance[neighbor] = distance[current] + 1
    predecessor[neighbor] = current
    queue.append(neighbor)
```

The distance map doubles as the discovered set.

If discovery is delayed until dequeue, a diamond-shaped graph can place the same vertex into the queue through several parents.

### Queue-layer invariant

At all times, queue distances are nondecreasing from front to back.

More strongly, the queue contains vertices from at most two consecutive layers during ordinary BFS expansion.

Suppose the front has distance $d$.

Its undiscovered neighbors receive distance $d+1$ and are appended behind all previously queued vertices of distance $d$ or $d+1$.

No vertex of distance $d+2$ can be added until a distance-$d+1$ vertex is removed.

The FIFO discipline preserves the ordering inductively.

### First-discovery shortest-path invariant

When vertex $v$ is first discovered from $u$:

$$
distance[v]=distance[u]+1.
$$

Assume a shorter path to $v$ existed.

Its predecessor on that path would have smaller distance than $u$.

By the queue-layer invariant, that predecessor would have been expanded earlier and would have discovered $v$ first.

This contradiction proves the recorded distance is minimal.

The predecessor chain therefore describes one shortest path.

### Edge classification under BFS

For an undirected graph, every edge $(u,v)$ connects vertices whose BFS distances differ by at most one:

$$
|distance[u]-distance[v]|\le 1.
$$

If they differed by two or more, the endpoint with smaller distance would provide a shorter route to the other.

For directed graphs, an edge can point from a later layer back to an arbitrarily earlier layer.

The forward relaxation still gives:

$$
distance[v]\le distance[u]+1
$$

for reachable endpoints after traversal.

### Parent-tree invariant

Every discovered non-source vertex has one recorded predecessor that was already discovered.

Following predecessors strictly decreases distance by one:

$$
distance[pred[v]]=distance[v]-1.
$$

The predecessor relation is acyclic and forms a rooted BFS tree over the source-reachable component.

Non-tree graph edges remain in the original graph but not in the parent tree.

### Early target termination

For a single target, the search can stop when the target is discovered or dequeued, depending on the API's bookkeeping needs.

Stopping at discovery is safe for hop distance because first discovery is optimal.

Stopping at dequeue is sometimes simpler when processing callbacks are defined on expanded vertices.

Stopping merely because the target appears as an already-present neighbor in an incorrectly managed queue is not a substitute for the discovery invariant.

### Multi-source invariant

To compute distance to the nearest source in a set $S$, enqueue every distinct source initially with distance zero.

The queue then expands a virtual super-source layer without needing an explicit extra vertex.

Each vertex's first discovery gives:

$$
\min_{s\in S}\delta(s,v).
$$

Predecessor or owner metadata can record which source claimed it.

### Input integrity

A robust explicit-graph implementation should decide whether neighbor-only vertices are allowed.

It can normalize them into the vertex set or reject them.

Silently ignoring a referenced neighbor loses reachable state.

Iteration order should be deterministic when reproducible paths matter.

Sets without defined order may produce different equal-length predecessor trees across runs or platforms.

## 3. Step-by-Step Execution Trace

### Graph

Use this undirected graph with sorted neighbor order:

```text
A: B, C
B: A, D, E
C: A, F
D: B, G
E: B, G
F: C, G
G: D, E, F, H
H: G
```

Start at `A` and search for `H`.

Several shortest routes to `G` exist.

Sorted neighbor order makes the chosen predecessor tree deterministic.

### Initialization

Record:

```text
distance[A] = 0
predecessor[A] = None
queue = [A]
```

Every other vertex is undiscovered.

Layer zero contains only `A`.

### Expand `A`

Remove `A` from the front.

Inspect `B`.

It is undiscovered, so record distance one, predecessor `A`, and enqueue it.

Inspect `C` similarly.

State becomes:

```text
queue = [B, C]
distances = A:0, B:1, C:1
```

The queue contains the whole discovered part of layer one.

### Expand `B`

Remove `B`.

Neighbor `A` is already discovered and is not enqueued again.

Discover `D` with distance two and predecessor `B`.

Discover `E` with distance two and predecessor `B`.

State:

```text
queue = [C, D, E]
```

The front is still in layer one.

The appended vertices are in layer two.

### Expand `C`

Remove `C`.

Skip discovered neighbor `A`.

Discover `F` with distance two and predecessor `C`.

State:

```text
queue = [D, E, F]
distances include D:2, E:2, F:2
```

Layer one is fully expanded.

The queue now contains exactly layer two.

### Expand `D`

Remove `D`.

Skip `B`.

Discover `G` with distance three and predecessor `D`.

State:

```text
queue = [E, F, G]
```

### Expand `E`

Remove `E`.

`B` and `G` are both already discovered.

Do not enqueue `G` again.

The path `A -> B -> E -> G` also has length three, but sorted processing chose `D` as `G`'s predecessor first.

State:

```text
queue = [F, G]
```

### Expand `F`

Remove `F`.

`C` and `G` are already discovered.

The third equal-length route to `G` does not alter its recorded parent.

State:

```text
queue = [G]
```

### Expand `G`

Remove `G`.

Neighbors `D`, `E`, and `F` are discovered.

Discover `H` with distance four and predecessor `G`.

Because `H` is the target, a target-specific BFS may stop at this discovery.

Predecessor chain is:

```text
H <- G <- D <- B <- A
```

Reverse it to obtain:

```text
A -> B -> D -> G -> H
```

The path has four edges, equal to `distance[H]`.

### Layer summary

| Distance | Vertices |
| ---: | --- |
| `0` | `A` |
| `1` | `B, C` |
| `2` | `D, E, F` |
| `3` | `G` |
| `4` | `H` |

Every original undirected edge connects vertices in the same or adjacent rows of this table.

The trace also shows why enqueue-time marking matters: `D`, `E`, and `F` all point toward `G`, but `G` occupies the queue only once.

## 4. Production-Ready Implementations

The implementation below normalizes an explicit adjacency mapping, preserves caller-provided neighbor order, rejects dangling references by default, supports an optional target, and exposes distances, predecessors, discovery order, and safe path reconstruction.

```python
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Generic, Hashable, Iterable, Mapping, Optional, TypeVar

Vertex = TypeVar("Vertex", bound=Hashable)


@dataclass(slots=True)
class BFSResult(Generic[Vertex]):
    source: Vertex
    distance: dict[Vertex, int]
    predecessor: dict[Vertex, Optional[Vertex]]
    discovery_order: tuple[Vertex, ...]

    def path_to(self, target: Vertex) -> Optional[list[Vertex]]:
        if target not in self.distance:
            return None
        path: list[Vertex] = []
        cursor: Optional[Vertex] = target
        seen: set[Vertex] = set()
        while cursor is not None:
            if cursor in seen:
                raise AssertionError("predecessor chain contains a cycle")
            seen.add(cursor)
            path.append(cursor)
            cursor = self.predecessor[cursor]
        path.reverse()
        if not path or path[0] != self.source:
            raise AssertionError("predecessor chain does not reach the source")
        return path


def normalize_graph(
    graph: Mapping[Vertex, Iterable[Vertex]],
    *,
    allow_neighbor_only: bool = False,
) -> dict[Vertex, tuple[Vertex, ...]]:
    normalized = {vertex: tuple(neighbors) for vertex, neighbors in graph.items()}
    known = set(normalized)
    referenced = {neighbor for neighbors in normalized.values() for neighbor in neighbors}
    missing = referenced - known
    if missing and not allow_neighbor_only:
        raise ValueError(f"neighbor-only vertices are not declared: {missing!r}")
    for vertex in missing:
        normalized[vertex] = ()
    return normalized


def breadth_first_search(
    graph: Mapping[Vertex, Iterable[Vertex]],
    source: Vertex,
    *,
    target: Optional[Vertex] = None,
    allow_neighbor_only: bool = False,
) -> BFSResult[Vertex]:
    adjacency = normalize_graph(graph, allow_neighbor_only=allow_neighbor_only)
    if source not in adjacency:
        raise ValueError("source is not present in graph")
    if target is not None and target not in adjacency:
        raise ValueError("target is not present in graph")

    distance = {source: 0}
    predecessor: dict[Vertex, Optional[Vertex]] = {source: None}
    order: list[Vertex] = [source]
    queue = deque([source])

    if target == source:
        return BFSResult(source, distance, predecessor, tuple(order))

    while queue:
        current = queue.popleft()
        for neighbor in adjacency[current]:
            if neighbor in distance:
                continue
            distance[neighbor] = distance[current] + 1
            predecessor[neighbor] = current
            order.append(neighbor)
            if neighbor == target:
                return BFSResult(source, distance, predecessor, tuple(order))
            queue.append(neighbor)

    return BFSResult(source, distance, predecessor, tuple(order))
```

### Verify the trace

```python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B", "G"],
    "E": ["B", "G"],
    "F": ["C", "G"],
    "G": ["D", "E", "F", "H"],
    "H": ["G"],
    "X": [],
}

result = breadth_first_search(graph, "A")
assert result.discovery_order == ("A", "B", "C", "D", "E", "F", "G", "H")
assert result.distance == {
    "A": 0,
    "B": 1,
    "C": 1,
    "D": 2,
    "E": 2,
    "F": 2,
    "G": 3,
    "H": 4,
}
assert result.path_to("H") == ["A", "B", "D", "G", "H"]
assert result.path_to("X") is None

targeted = breadth_first_search(graph, "A", target="H")
assert targeted.distance["H"] == 4
assert targeted.path_to("H") == ["A", "B", "D", "G", "H"]
```

### Multi-source BFS

The next implementation computes distance to the nearest source and records the source that first claims each vertex.

Duplicate sources are normalized.

Source order resolves equal-distance ownership deterministically.

```python
@dataclass(slots=True)
class MultiSourceResult(Generic[Vertex]):
    distance: dict[Vertex, int]
    owner: dict[Vertex, Vertex]
    predecessor: dict[Vertex, Optional[Vertex]]


def multi_source_bfs(
    graph: Mapping[Vertex, Iterable[Vertex]],
    sources: Iterable[Vertex],
) -> MultiSourceResult[Vertex]:
    adjacency = normalize_graph(graph)
    source_order = tuple(dict.fromkeys(sources))
    if not source_order:
        raise ValueError("at least one source is required")
    if any(source not in adjacency for source in source_order):
        raise ValueError("a source is not present in graph")

    distance = {source: 0 for source in source_order}
    owner = {source: source for source in source_order}
    predecessor: dict[Vertex, Optional[Vertex]] = {
        source: None for source in source_order
    }
    queue = deque(source_order)

    while queue:
        current = queue.popleft()
        for neighbor in adjacency[current]:
            if neighbor in distance:
                continue
            distance[neighbor] = distance[current] + 1
            owner[neighbor] = owner[current]
            predecessor[neighbor] = current
            queue.append(neighbor)

    return MultiSourceResult(distance, owner, predecessor)
```

### Verify nearest-source ownership

```python
multi = multi_source_bfs(graph, ["A", "H"])
assert multi.distance == {
    "A": 0,
    "H": 0,
    "B": 1,
    "C": 1,
    "G": 1,
    "D": 2,
    "E": 2,
    "F": 2,
}
assert multi.owner["B"] == "A"
assert multi.owner["G"] == "H"
assert multi.owner["D"] == "A"
```

### Differential verification

For small random undirected graphs, compare BFS distances with an independently computed repeated edge-relaxation reference.

```python
import random


def relaxation_reference(graph: dict[int, list[int]], source: int) -> dict[int, int]:
    infinity = len(graph) + 1
    distance = {vertex: infinity for vertex in graph}
    distance[source] = 0
    for _ in range(max(0, len(graph) - 1)):
        changed = False
        for vertex, neighbors in graph.items():
            if distance[vertex] == infinity:
                continue
            for neighbor in neighbors:
                candidate = distance[vertex] + 1
                if candidate < distance[neighbor]:
                    distance[neighbor] = candidate
                    changed = True
        if not changed:
            break
    return {vertex: value for vertex, value in distance.items() if value != infinity}


rng = random.Random(20260830)
for size in range(1, 35):
    random_graph = {vertex: [] for vertex in range(size)}
    for left in range(size):
        for right in range(left + 1, size):
            if rng.random() < 0.1:
                random_graph[left].append(right)
                random_graph[right].append(left)
    for neighbors in random_graph.values():
        neighbors.sort()
    for source in range(size):
        actual = breadth_first_search(random_graph, source)
        assert actual.distance == relaxation_reference(random_graph, source)
```

### Implementation cautions

Do not use a Python list with `pop(0)` as a queue; removing the first element shifts the remaining list and can make queue operations linear.

`collections.deque` provides constant-time append and left-pop operations.

The adjacency normalization copies iterables so one-shot generators do not disappear between validation and traversal.

For huge graphs, copying may be undesirable; a streaming neighbor API should then define stability, errors, and repeated-access behavior explicitly.

For untrusted implicit graphs, enforce state, depth, time, and output budgets.

## 5. Asymptotic Time & Space Complexity

Let $V_r$ be the number of vertices reachable from the source and $E_r$ the outgoing adjacency entries inspected for them.

### Explicit adjacency list

Each reachable vertex is enqueued and dequeued once.

Each outgoing stored adjacency entry of a reachable vertex is inspected once.

Traversal time is:

$$
O(V_r+E_r).
$$

If the whole graph is reachable, this is $O(V+E)$.

For an undirected graph represented twice, scanning adjacency uses $2E$ entries, which remains $O(E)$.

### Queue and metadata

Distance and predecessor maps store at most $V_r$ entries.

The queue can hold $O(V_r)$ vertices in a wide layer.

Auxiliary space is:

$$
O(V_r).
$$

The returned discovery order also stores $O(V_r)$ vertices.

If only reachability is needed, predecessor and order outputs can be omitted to reduce constants, not the asymptotic bound.

### Adjacency matrix

With a $V\times V$ matrix, discovering neighbors of one vertex scans a full row.

Across all vertices, traversal takes $O(V^2)$ time even when few edges exist.

The matrix itself consumes $O(V^2)$ storage.

This representation can be reasonable for small dense graphs, but the complexity claim must match it.

### Implicit graphs

Let neighbor generation for state $v$ cost $g(v)$.

Runtime becomes:

$$
O\left(V_r+\sum_{v\ reachable}g(v)\right).
$$

Hashing or canonicalizing states may also dominate.

If states have large copied representations, memory can exceed the simple vertex-count model.

### Shortest path reconstruction

A path of $\ell$ edges contains $\ell+1$ vertices.

Following and reversing predecessor links costs $O(\ell)$ time and space.

Because distances decrease by one per predecessor, $\ell\le V_r-1$ in the parent tree.

### Multi-source BFS

Initializing $k$ distinct sources costs $O(k)$.

Every reachable vertex is still discovered once.

Total traversal remains $O(V_r+E_r)$ with $O(V_r)$ auxiliary space.

### Bidirectional BFS

When start and target are known and edges can be traversed in both required directions, searches can expand from both ends.

In a roughly uniform branching graph with shortest distance $d$, idealized explored volume can fall from about $b^d$ to about $2b^{d/2}$.

This is a practical search-space argument, not a universal worst-case guarantee.

Correct termination requires tracking the best meeting distance rather than stopping at an arbitrary frontier contact in every variant.

## 6. Systems Connections

### Network hop discovery

BFS computes minimum hop count in an unweighted topology.

Actual routing often uses latency, bandwidth, administrative cost, or policy, making weighted algorithms more appropriate.

Hop count is a metric choice, not a synonym for network-optimal path.

### Social graphs

Degrees of separation and bounded-radius neighborhoods use BFS layers.

High-degree vertices can make the frontier enormous.

Production graph engines partition adjacency, compress identifiers, and coordinate distributed frontiers.

Privacy policy should constrain which relationships and paths are returned.

### Garbage collection

Tracing collectors explore objects reachable from roots.

Breadth-first order is one possible worklist discipline, though practical collectors choose layouts and queues for locality, concurrency, and pause behavior.

The discovered set corresponds to marking an object before adding its references to the worklist.

### Web crawling

A crawler can process URLs by link distance from seed pages.

The graph is implicit and discovered online.

Canonicalization, robots policy, rate limits, duplicate content, authentication boundaries, and infinite URL spaces matter more than the basic queue alone.

### Grid wavefronts

In a grid with unit-cost moves, BFS expands a wavefront and computes minimum steps around obstacles.

Multi-source BFS can compute distance to the nearest exit, hazard, facility, or occupied cell.

If moves have costs zero and one, 0–1 BFS with a deque is more appropriate.

Arbitrary nonnegative weights call for Dijkstra.

### Distributed BFS

Large graph systems process one frontier superstep at a time.

Workers send newly discovered vertices to owners of remote partitions.

Duplicate suppression must be coordinated because the same vertex can arrive from many parents.

Direction-optimizing BFS can switch between pushing from the frontier and pulling from unvisited vertices based on frontier size.

### Tree level order

A tree has a unique root-to-node path, so no discovered set is required when traversing a well-formed owned tree downward.

If the input may contain cycles or shared objects, graph-style identity tracking restores safety.

The same queue-layer invariant produces level-order output.

### State-space search

Puzzle solvers hash canonical states to prevent repeated exploration.

If only the solution path is needed, predecessor storage can dominate memory.

Compressed parent encodings, frontier search, iterative deepening, or bidirectional search trade memory, recomputation, and implementation complexity.

## 7. Practice Checklist

### State the graph contract

- Decide directed or undirected semantics.
- Ensure undirected edges appear in both adjacency lists.
- Define vertex identity and hashing.
- Decide whether neighbor-only vertices are normalized or rejected.
- Define deterministic neighbor order when path identity matters.
- Define source and target validation.
- Define behavior for an empty graph.
- Define behavior for an unreachable target.

### Preserve BFS invariants

- Use a FIFO queue.
- Mark discovery at enqueue time.
- Enqueue each vertex once.
- Assign distance from the discovering parent.
- Assign one predecessor on first discovery.
- Do not overwrite a parent for an equal-length path unless tie policy requires it.
- Confirm queue distances are nondecreasing.
- Confirm predecessor distance decreases by one.

### Test shortest paths

- Test a single vertex.
- Test a path graph.
- Test a wide star.
- Test a cycle.
- Test a diamond with multiple shortest paths.
- Test disconnected vertices.
- Test a directed one-way edge.
- Test a self-loop.
- Test duplicate adjacency entries.
- Verify reconstructed edge count equals recorded distance.

### Test scalability

- Measure maximum queue size.
- Measure reachable vertices and scanned edges.
- Avoid `pop(0)` queues.
- Avoid copying large states unnecessarily.
- Bound implicit graph expansion.
- Add cancellation checks for long traversals.
- Cap predecessor or result serialization.
- Profile state hashing.
- Consider bidirectional search for one distant target.
- Consider external-memory or distributed traversal when the frontier exceeds memory.

### Choose the correct variant

- Use multi-source BFS for nearest-source distance.
- Use 0–1 BFS only for weights in `{0,1}`.
- Use Dijkstra for arbitrary nonnegative weights.
- Use Bellman–Ford when negative weights are allowed.
- Use topological relaxation for shortest paths in a DAG.
- Use connected-component BFS repeatedly on undirected graphs.
- Do not call a directed BFS forest strongly connected components.
- Use layer counts for bounded-hop queries.

## 8. Frequently Asked Questions

### Why does BFS find shortest paths?

The FIFO queue expands vertices in nondecreasing hop distance.

Any shorter route to a newly discovered vertex would have come through an earlier layer and would already have discovered it.

### Does BFS work with weighted edges?

It works directly when every edge has the same cost.

For weights zero and one, 0–1 BFS is a specialized deque algorithm.

For arbitrary nonnegative weights, use Dijkstra; negative weights require other methods.

### When should a vertex be marked visited?

Normally at enqueue time.

That guarantees one queue entry per vertex and fixes the predecessor at first discovery.

### Can BFS return different shortest paths?

Yes.

When several shortest paths have equal length, neighbor iteration order determines which parent discovers a vertex first.

Sort or otherwise stabilize neighbors if reproducibility is required.

### Is the BFS tree the same as the graph?

No.

The parent relation selects one discovery edge per reachable non-source vertex.

Other edges remain in the graph and can connect vertices in the same or adjacent layers.

### What happens if the source equals the target?

The shortest path is the one-vertex path containing the source, with distance zero.

A target-aware implementation can return immediately after initialization.

### How does BFS handle disconnected graphs?

One run visits only the source-reachable component.

To visit an entire graph, start another BFS from each still-undiscovered vertex.

For undirected graphs this yields connected components.

### Does repeated BFS find strongly connected components?

Not by simply starting from each unvisited directed vertex.

Strong connectivity requires mutual reachability and algorithms such as Kosaraju, Tarjan, or Gabow.

### Why can BFS consume so much memory?

An entire wide frontier can be resident at once, along with discovered and predecessor metadata.

In implicit graphs, the number of states at one distance can grow exponentially with depth.

### What is multi-source BFS equivalent to?

It is equivalent to adding a virtual super-source with a zero-cost edge to every initial source, while treating all real graph edges as unit cost.

Initializing all sources at distance zero avoids materializing that vertex.

### When is bidirectional BFS useful?

It is useful for a known start and target when reverse expansion is available and frontiers are substantially smaller at half the distance.

It adds meeting, visited-set, and termination complexity and is not a replacement for every BFS task.

### Can the queue contain two different distance layers?

Yes.

While vertices of distance $d$ are being expanded, their newly discovered neighbors of distance $d+1$ accumulate behind the remaining distance-$d$ vertices.

It does not need to contain a third layer at that moment.

### Why normalize adjacency iterables?

It makes validation and traversal observe the same neighbor sequence, including when a caller supplies a one-shot generator.

For very large graphs, an explicit reusable neighbor-provider contract may avoid the copy.

### What is the most common BFS bug?

Marking a vertex only after dequeue is a frequent source of duplicate queue entries.

Using a stack by accident silently changes the traversal into depth-first search.

### How should an unreachable path be represented?

Return a distinct absent result such as `None`, not an empty path that could be confused with the valid zero-edge source-to-source path.
