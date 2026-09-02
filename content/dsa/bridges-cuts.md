# Bridges and Articulation Points: Low-Link Invariants, DFS Cuts & Robust Undirected Graph Analysis

![Bridge and articulation-point analysis](/images/dsa/bridges-cuts-dark.jpg#dark)

## 1. Historical Context & Motivation

Connectivity is not only a question of whether a graph is connected now.

Engineers also need to know how easily that connectivity can fail.

An undirected edge whose removal increases the number of connected components is a **bridge**.

An undirected vertex whose removal, together with its incident edges, increases the number of components is an **articulation point**.

These objects expose single points of structural failure.

In a road graph, a bridge may be the only road joining two regions.

In a communication graph, an articulation point may be the only relay between groups of devices.

In a dependency graph, a bridge-like relation can reveal a uniquely necessary connection.

Testing every edge by deleting it and rerunning a traversal is conceptually simple.

For $m$ edges and $n$ vertices, that approach costs $O(m(n+m))$ with ordinary traversals.

Testing every vertex similarly is also too expensive for large sparse graphs.

Depth-first search provides a linear-time alternative.

The crucial observation is that a DFS tree organizes unexplored connectivity into nested subtrees.

If a subtree cannot reach an ancestor without using its parent edge, that parent edge is a bridge.

If the subtree cannot reach above its parent vertex, removing the parent disconnects it.

Robert Tarjan's early work on graph algorithms formalized low-link reasoning into efficient linear-time procedures.

The algorithm assigns each discovered vertex a timestamp.

It then summarizes the earliest ancestor reachable from an entire DFS subtree.

That summary is the vertex's **low-link value**.

One integer per vertex replaces repeated deletion experiments.

The method is elegant but implementation-sensitive.

Confusing a parent vertex with a parent edge breaks graphs containing parallel edges.

Applying the ordinary articulation rule to a DFS root marks roots incorrectly.

Treating an already visited descendant like an ancestor can obscure the proof.

Forgetting disconnected components leaves part of the graph unanalyzed.

A production implementation must state its graph model precisely.

This article uses an undirected multigraph represented by edge identities.

Parallel edges are allowed.

Self-loops are allowed but can never be bridges.

Removing a vertex means removing that vertex and every incident edge.

The central question is:

How can one DFS determine every single-edge and single-vertex cut while remaining correct for disconnected graphs and parallel edges?

## 2. Core Mathematical Invariants

Let $G=(V,E)$ be an undirected graph.

A DFS forest gives every visited vertex $v$ a discovery time $tin[v]$.

Discovery times are unique and increase monotonically.

Each non-root vertex has one DFS-tree parent edge.

An undirected edge encountered from a vertex is either its parent tree edge, another tree edge, or an edge to an already discovered vertex.

### Low-link definition

For a vertex $v$, define $low[v]$ as the minimum discovery time reachable by:

1. zero or more DFS-tree edges descending within the subtree of $v$, followed by
2. at most one non-parent edge to an already discovered vertex.

Operationally:

$$
low[v]=\min\left(
tin[v],
\min_{(v,w)\text{ back edge}} tin[w],
\min_{u\text{ child of }v} low[u]
\right).
$$

The value never exceeds $tin[v]$.

It may equal $tin[v]$ when the subtree has no connection to a strict ancestor of $v$.

### Postorder invariant

When DFS returns from a child $u$ to its parent $v$, `low[u]` is final.

Every edge reachable inside $u$'s DFS subtree has already been examined.

The parent can therefore merge the complete subtree summary with:

$$
low[v]\leftarrow\min(low[v],low[u]).
$$

This postorder dependency is why bridge decisions occur after the recursive child call returns.

### Bridge criterion

For a DFS-tree edge with parent $v$ and child $u$:

$$
(v,u)\text{ is a bridge}\iff low[u]>tin[v].
$$

If $low[u]>tin[v]$, the subtree of $u$ has no edge reaching $v$ or any ancestor of $v$ except the tree edge itself.

Deleting that edge separates the entire subtree from the preceding DFS region.

Conversely, if $low[u]\le tin[v]$, some edge from the subtree reaches $v$ or an ancestor.

That edge plus tree paths provides an alternate route around $(v,u)$.

The inequality is strict.

Equality means the subtree can return to $v$, so the parent edge is not a bridge.

### Non-root articulation criterion

For a non-root DFS vertex $v$:

$$
v\text{ is an articulation point}\iff
\exists\text{ child }u:\ low[u]\ge tin[v].
$$

If $low[u]\ge tin[v]$, the child subtree cannot reach a strict ancestor of $v$ without passing through $v$.

Removing $v$ disconnects that subtree from the earlier DFS region.

Equality now suffices.

A return edge to $v$ itself does not help after $v$ is removed.

This difference explains why the bridge test uses `>` while the articulation test uses `>=`.

### Root articulation criterion

A DFS root has no ancestor side from which a child subtree must be separated.

The ordinary rule would incorrectly mark a root with one child.

A root is an articulation point exactly when it has at least two DFS-tree children.

Distinct root children cannot have cross edges between their subtrees.

If such an edge had been encountered, the later subtree would already have been discovered through the earlier one.

Removing a root with two or more children therefore separates those child subtrees.

### Parent-edge invariant

In an undirected adjacency list, every edge appears twice.

When traversing from $v$ to child $u$, the matching reverse incidence must be skipped once.

The correct identity to skip is the exact parent **edge ID**.

Skipping every neighbor equal to the parent vertex is wrong in a multigraph.

If two parallel edges join $v$ and $u$, one may be the tree edge while the other is a valid alternate connection.

That second edge lowers `low[u]` to `tin[v]` and prevents a false bridge report.

### Component invariant

Starting DFS once analyzes only the start vertex's connected component.

The outer algorithm must start a new DFS root for every undiscovered vertex.

The resulting structure is a DFS forest.

Bridge and articulation criteria apply independently in each tree.

An isolated vertex is a root with zero children and is not an articulation point under the component-count definition.

### Self-loop invariant

A self-loop offers no route between distinct vertices.

It cannot be a bridge because removing it does not alter vertex connectivity.

During DFS it only compares `tin[v]` with itself, leaving `low[v]` unchanged.

### Output identity

In a multigraph, an edge is not uniquely identified by an unordered endpoint pair.

The output should retain edge IDs if callers need to distinguish parallel edges.

Endpoints may be included as descriptive metadata, but they are not a complete identity.

## 3. Step-by-Step Execution Trace

Consider vertices $A,B,C,D,E,F,G$ and undirected edges:

$$
AB,\ BC,\ CA,\ BD,\ DE,\ EF,\ FD,\ DG.
$$

The edges $AB,BC,CA$ form one triangle.

The edges $DE,EF,FD$ form another triangle.

Edge $BD$ joins the triangles.

Edge $DG$ attaches a leaf.

We expect $BD$ and $DG$ to be bridges.

We expect $B$ and $D$ to be articulation points.

Start DFS at $A$ and visit neighbors in alphabetical edge order.

Assign discovery times from zero.

| Event | Vertex state | Explanation |
|---|---|---|
| discover $A$ | $tin[A]=low[A]=0$ | DFS root |
| tree edge $A\to B$ | — | descend |
| discover $B$ | $tin[B]=low[B]=1$ | parent edge $AB$ |
| tree edge $B\to C$ | — | descend |
| discover $C$ | $tin[C]=low[C]=2$ | parent edge $BC$ |
| edge $C\to A$ | $low[C]=0$ | reaches ancestor $A$ |
| return $C\to B$ | $low[B]=0$ | merge child's low value |
| test $BC$ | $0>1$ is false | not a bridge |
| tree edge $B\to D$ | — | descend into second region |
| discover $D$ | $tin[D]=low[D]=3$ | parent edge $BD$ |
| tree edge $D\to E$ | — | descend |
| discover $E$ | $tin[E]=low[E]=4$ | parent edge $DE$ |
| tree edge $E\to F$ | — | descend |
| discover $F$ | $tin[F]=low[F]=5$ | parent edge $EF$ |
| edge $F\to D$ | $low[F]=3$ | reaches ancestor $D$ |
| return $F\to E$ | $low[E]=3$ | merge child summary |
| test $EF$ | $3>4$ is false | not a bridge |
| return $E\to D$ | $low[D]=3$ | merge child summary |
| test $DE$ | $3>3$ is false | cycle gives alternate route |
| tree edge $D\to G$ | — | descend to leaf |
| discover $G$ | $tin[G]=low[G]=6$ | no other incident edge |
| return $G\to D$ | $low[D]=3$ | child contributes 6 |
| test $DG$ | $6>3$ is true | $DG$ is a bridge |
| articulation test at $D$ | $6\ge3$ | removing $D$ isolates $G$ |
| return $D\to B$ | $low[B]=0$ | child low is 3 |
| test $BD$ | $3>1$ is true | $BD$ is a bridge |
| articulation test at $B$ | $3\ge1$ | removing $B$ separates $D$ subtree |
| return $B\to A$ | $low[A]=0$ | root has one DFS child |

Although $A$ has two graph neighbors, it has only one DFS-tree child.

Vertex $C$ was discovered inside $B$'s subtree.

Therefore $A$ is not an articulation point.

The final low values are:

| Vertex | $tin$ | $low$ | Meaning |
|---|---:|---:|---|
| $A$ | 0 | 0 | component root |
| $B$ | 1 | 0 | subtree returns to $A$ |
| $C$ | 2 | 0 | edge $CA$ reaches $A$ |
| $D$ | 3 | 3 | second triangle cannot reach above $D$ |
| $E$ | 4 | 3 | cycle returns to $D$ |
| $F$ | 5 | 3 | edge $FD$ reaches $D$ |
| $G$ | 6 | 6 | leaf has no alternate edge |

Deleting $BD$ produces components $\{A,B,C\}$ and $\{D,E,F,G\}$.

Deleting $DG$ isolates $G$.

Deleting $DE$ does not disconnect the graph because $D-F-E$ remains.

Deleting $B$ separates $\{A,C\}$ from $\{D,E,F,G\}$.

Deleting $D$ separates $G$ and the $\{E,F\}$ region from $\{A,B,C\}$.

### Parallel-edge check

Now consider two vertices $P,Q$ joined by edge IDs 0 and 1.

DFS uses edge 0 as the tree edge.

At $Q$, only edge ID 0 is skipped.

Edge ID 1 reaches the already discovered vertex $P$.

Thus $low[Q]=tin[P]$.

The test $low[Q]>tin[P]$ is false.

Neither parallel edge is a bridge, which matches deletion behavior.

## 4. Production-Ready Implementations

This implementation accepts hashable vertex labels and preserves an integer identity for every inserted edge.

It uses iterative input construction and recursive DFS.

```python
from dataclasses import dataclass
from typing import Hashable, Iterable


Vertex = Hashable


@dataclass(frozen=True)
class CutAnalysis:
    bridge_ids: tuple[int, ...]
    articulation_points: frozenset[Vertex]
    discovery: dict[Vertex, int]
    low: dict[Vertex, int]


def analyze_undirected_cuts(
    vertices: Iterable[Vertex],
    edges: Iterable[tuple[Vertex, Vertex]],
) -> CutAnalysis:
    adjacency: dict[Vertex, list[tuple[Vertex, int]]] = {}
    for vertex in vertices:
        adjacency.setdefault(vertex, [])

    edge_list = list(edges)
    for edge_id, (left, right) in enumerate(edge_list):
        adjacency.setdefault(left, []).append((right, edge_id))
        adjacency.setdefault(right, []).append((left, edge_id))

    discovery: dict[Vertex, int] = {}
    low: dict[Vertex, int] = {}
    bridges: list[int] = []
    cuts: set[Vertex] = set()
    timer = 0

    def dfs(vertex: Vertex, parent_edge: int | None) -> None:
        nonlocal timer
        discovery[vertex] = low[vertex] = timer
        timer += 1
        child_count = 0

        for neighbor, edge_id in adjacency[vertex]:
            if edge_id == parent_edge:
                continue

            if neighbor in discovery:
                low[vertex] = min(low[vertex], discovery[neighbor])
                continue

            child_count += 1
            dfs(neighbor, edge_id)
            low[vertex] = min(low[vertex], low[neighbor])

            if low[neighbor] > discovery[vertex]:
                bridges.append(edge_id)

            if parent_edge is not None and low[neighbor] >= discovery[vertex]:
                cuts.add(vertex)

        if parent_edge is None and child_count >= 2:
            cuts.add(vertex)

    for vertex in adjacency:
        if vertex not in discovery:
            dfs(vertex, None)

    return CutAnalysis(
        bridge_ids=tuple(sorted(bridges)),
        articulation_points=frozenset(cuts),
        discovery=discovery,
        low=low,
    )
```

The adjacency dictionary includes explicitly supplied isolated vertices.

It also admits vertices appearing only in the edge iterable.

Sorting bridge IDs makes output deterministic relative to input order.

Dictionary traversal determines timestamps, but bridge and cut identities do not depend on timestamp numbering.

### Worked-graph verification

```python
vertices = list("ABCDEFG")
edges = [
    ("A", "B"),
    ("B", "C"),
    ("C", "A"),
    ("B", "D"),
    ("D", "E"),
    ("E", "F"),
    ("F", "D"),
    ("D", "G"),
]
analysis = analyze_undirected_cuts(vertices, edges)
assert analysis.bridge_ids == (3, 7)
assert analysis.articulation_points == frozenset({"B", "D"})

parallel = analyze_undirected_cuts(["P", "Q"], [("P", "Q"), ("P", "Q")])
assert parallel.bridge_ids == ()
assert parallel.articulation_points == frozenset()

self_loop = analyze_undirected_cuts([0], [(0, 0)])
assert self_loop.bridge_ids == ()
assert self_loop.articulation_points == frozenset()
```

### Deletion-based differential oracle

For small random graphs, a slow definition-level implementation is a strong independent test oracle.

```python
def component_count(
    vertices: list[int],
    edges: list[tuple[int, int]],
    removed_vertex: int | None = None,
    removed_edge: int | None = None,
) -> int:
    active = [v for v in vertices if v != removed_vertex]
    graph = {v: [] for v in active}
    for edge_id, (a, b) in enumerate(edges):
        if edge_id == removed_edge or removed_vertex in (a, b):
            continue
        graph[a].append(b)
        graph[b].append(a)

    seen: set[int] = set()
    components = 0
    for start in active:
        if start in seen:
            continue
        components += 1
        stack = [start]
        seen.add(start)
        while stack:
            vertex = stack.pop()
            for neighbor in graph[vertex]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)
    return components


def cuts_by_deletion(
    vertices: list[int],
    edges: list[tuple[int, int]],
) -> tuple[set[int], set[int]]:
    baseline = component_count(vertices, edges)
    bridges = {
        edge_id
        for edge_id in range(len(edges))
        if component_count(vertices, edges, removed_edge=edge_id) > baseline
    }
    articulations = {
        vertex
        for vertex in vertices
        if component_count(vertices, edges, removed_vertex=vertex) > baseline
    }
    return bridges, articulations
```

Randomized tests should include disconnected graphs, repeated endpoint pairs, and self-loops.

```python
from random import Random


rng = Random(23)
for vertex_count in range(1, 9):
    vertices = list(range(vertex_count))
    for _ in range(250):
        edge_count = rng.randrange(0, 16)
        edges = [
            (rng.randrange(vertex_count), rng.randrange(vertex_count))
            for _ in range(edge_count)
        ]
        fast = analyze_undirected_cuts(vertices, edges)
        expected_bridges, expected_cuts = cuts_by_deletion(vertices, edges)
        assert set(fast.bridge_ids) == expected_bridges
        assert set(fast.articulation_points) == expected_cuts
```

### Recursion depth

A path graph can make the DFS recursion depth $\Theta(n)$.

Python's default recursion limit may be too small for large adversarial inputs.

Raising the limit moves the failure threshold but does not remove native-stack risk.

Production systems processing very deep graphs should use an explicit DFS stack that records neighbor position and performs the same postorder merge on exit.

That iterative conversion must preserve edge IDs, child counts, and the moment at which child low values become final.

## 5. Asymptotic Time & Space Complexity

Let $n=|V|$ and $m=|E|$.

Building the undirected adjacency structure inserts two incidences per edge.

That costs $\Theta(n+m)$ time and space.

Each vertex is discovered once.

Each undirected edge incidence is examined once by its endpoint loop.

Constant-time dictionary and set operations are expected under ordinary hashing assumptions.

The DFS phase therefore costs $\Theta(n+m)$ expected time.

Sorting the final bridge IDs costs $O(b\log b)$ for $b$ bridges in this implementation.

Because $b\le m$, that optional determinism step can exceed linear time.

If discovery order is an acceptable output order, omit sorting and retain strict $\Theta(n+m)$ time.

The adjacency lists use $\Theta(n+m)$ space.

The discovery and low maps use $\Theta(n)$ space.

The cut set uses at most $\Theta(n)$ space.

The bridge list uses at most $\Theta(m)$ space, although a simple undirected graph has at most $n-1$ bridges.

The recursive call stack reaches $O(n)$ depth in the worst case.

Total stored space is $\Theta(n+m)$.

The deletion oracle is intentionally slower.

It runs a component traversal once per vertex and once per edge.

Its time is $O((n+m)^2)$ at a coarse bound.

That makes it appropriate for small tests, not production analysis.

For a graph already stored in edge-ID adjacency form, the algorithm does not need to duplicate the whole graph.

It can operate directly on that representation and use $O(n+b)$ additional state plus traversal stack.

## 6. Systems Connections

### Network resilience

Bridges identify links whose single failure separates endpoints into different connectivity regions.

Articulation points identify devices whose removal partitions the topology.

This is a structural first pass, not a full reliability model.

Capacity, direction, protocol convergence, and correlated failures may change operational conclusions.

### Road and utility networks

A bridge edge may represent a unique road, pipe, or cable between regions.

Parallel physical links must remain distinct edge IDs or redundancy will be lost during modeling.

A geographical crossing is not automatically a graph vertex unless the modeled system permits transfer there.

### Biconnected decomposition

Articulation points separate vertex-biconnected regions.

Bridges separate edge-biconnected regions.

Maintaining an edge stack during DFS can recover complete biconnected components rather than only cut identities.

Contracting components after removing bridges produces a forest often called a bridge tree.

Queries about how many bridges lie between two vertices can then become tree-path queries.

### Strongly connected components are different

Tarjan's name also appears in algorithms for strongly connected components of directed graphs.

Those algorithms use discovery and low-like state but solve a different problem.

The bridge criteria in this article are for undirected graphs and must not be transplanted into a directed graph.

### Incremental topology

The static DFS algorithm assumes the edge set does not change during analysis.

Recomputing may be sufficient for occasional updates.

High-rate dynamic connectivity requires more specialized data structures and substantially more complex invariants.

### Distributed-system interpretation

A topology graph can reveal structural single points of failure before deployment.

It cannot prove service availability by itself.

Replica placement, quorum rules, failure domains, and traffic policy determine whether a structural cut becomes an application outage.

### Compiler and program graphs

Control-flow graphs are directed, so undirected articulation analysis answers only questions about their underlying undirected structure.

Dominators are often the more appropriate concept for mandatory control-flow passage.

Choosing the graph abstraction is as important as implementing the traversal correctly.

### Security analysis

An articulation point may represent a chokepoint for monitoring or an attractive denial target.

Attack graphs are frequently directed and state-dependent, so an undirected cut model can oversimplify them.

Treat cut analysis as evidence about the chosen model, not universal proof about the real system.

## 7. Practice Checklist

- Define a bridge using component count after edge deletion.
- Define an articulation point using vertex deletion.
- Distinguish graph edges from DFS-tree edges.
- Assign unique discovery times.
- State the low-link definition precisely.
- Explain why child low values are finalized in postorder.
- Derive the bridge condition $low[u]>tin[v]$.
- Derive the non-root articulation condition $low[u]\ge tin[v]$.
- Explain the strict-versus-nonstrict inequality difference.
- Handle DFS roots with a separate child-count rule.
- Start DFS from every undiscovered vertex.
- Include isolated vertices in the graph representation.
- Preserve unique edge identities.
- Skip only the exact parent edge.
- Test two parallel edges between the same vertices.
- Test a self-loop.
- Test a single isolated vertex.
- Test a path graph where every edge is a bridge.
- Test a cycle where no edge is a bridge.
- Test two cycles connected by one edge.
- Test a star whose center is an articulation point.
- Test a disconnected union of different graph shapes.
- Compare against deletion-based results on small random graphs.
- Decide whether deterministic output requires sorting.
- Account for sorting in the complexity statement.
- Protect recursive implementations from deep inputs.
- Preserve postorder semantics in an iterative DFS.
- Avoid applying undirected criteria to directed graphs.
- Document whether parallel edges and self-loops are supported.
- Return edge IDs when endpoint pairs are not unique.
- Keep topology immutable during a static analysis run.
- Validate vertex labels if results cross a trust boundary.
- Separate graph parsing from graph analysis.
- Confirm that the model represents real redundancy accurately.
- Use biconnected components when cut identities alone are insufficient.

## 8. Frequently Asked Questions

### Is every DFS-tree edge a bridge?

No.

A child subtree may have another edge reaching the parent or an ancestor, creating an alternate route.

### Can a non-tree edge be a bridge?

No in an undirected DFS.

The DFS-tree path already connects its endpoints without that non-tree edge.

### Why does the bridge test use `>`?

When $low[u]=tin[v]$, the child subtree has an alternate edge back to $v$.

Removing the tree edge still leaves that route, so the edge is not a bridge.

### Why does articulation use `>=`?

An edge returning only to $v$ does not help after $v$ itself is removed.

The child subtree must reach a strict ancestor to remain attached to the earlier region.

### Why is the DFS root special?

It has no ancestor side.

One child subtree remains connected after removing the root, while two or more DFS child subtrees become separated from each other.

### Why track a parent edge instead of a parent vertex?

Parallel edges can share endpoints.

Only the exact tree edge should be skipped; another parallel edge is a valid alternate route.

### Are self-loops bridges?

No.

Removing a self-loop cannot change connectivity between distinct vertices.

### Can an isolated vertex be an articulation point?

No under the standard definition based on increasing the graph's component count.

Removing it decreases the number of components rather than increasing it.

### Does the algorithm work on disconnected graphs?

Yes, if an outer loop launches DFS from every undiscovered vertex.

A single DFS call covers only one component.

### Is a bridge the same as a cut set?

A bridge is a cut set containing exactly one edge.

Graphs without bridges can still be disconnected by removing a larger collection of edges.

### Is an articulation point the same as a dominator?

No.

Articulation is an undirected connectivity property, while domination is defined relative to directed paths from a chosen start vertex.

### Can low-link values be computed with BFS?

The standard linear-time recurrence relies on DFS subtree nesting and postorder completion.

BFS does not provide the same ancestor/subtree structure for this criterion.

### Are timestamps unique across disconnected components?

They can be globally unique, as in the implementation here.

Restarting numbering per component can also work if comparisons never cross components.

### What if the graph changes during DFS?

The invariants no longer describe one fixed graph.

Take a stable snapshot, synchronize access, or use a dynamic connectivity algorithm designed for updates.

### What should a production API return for bridges?

Return stable edge identities and optionally their endpoints.

Endpoint pairs alone are ambiguous when the graph permits parallel edges.

### What is the best correctness test?

For small random multigraphs, compare the linear algorithm with literal edge and vertex deletion followed by component counting.

That oracle directly implements the definitions and catches parent-edge, root, and disconnected-component bugs.
