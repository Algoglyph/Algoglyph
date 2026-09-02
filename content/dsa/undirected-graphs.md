# Undirected Graphs: Symmetric Edges, Components & Cycle Structure

![Undirected graph vertices and symmetric edges](/images/dsa/undirected-graphs-dark.png)

## 1. Historical Context & Motivation

Undirected graphs model symmetric relationships.
Roads may permit both directions.
Friendship is commonly mutual.
Network links connect two endpoints.
An edge has no source and destination.
Its endpoints form an unordered pair.
This symmetry changes traversal and cycle logic.
Every stored adjacency often appears twice.
Degree counts incident edges.
Connected components partition vertices.
Trees are connected acyclic undirected graphs.
Forests are acyclic component collections.
Paths can be traversed in either direction.
Bridges disconnect components when removed.
Articulation vertices do likewise when removed.
Bipartite graphs admit two-coloring.
Odd cycles prevent it.
Parallel edges and self-loops require explicit policy.
A self-loop contributes two to degree under standard graph theory.
Two parallel edges form a length-two cycle in multigraph semantics.
Simple graphs forbid both.
Data structures often accidentally mix simple and multigraph rules.
This article defines a simple undirected graph and highlights where multigraphs differ.
It covers representation, components, cycle detection, and system modeling.

## 2. Core Mathematical Invariants

An undirected graph is $G=(V,E)$.
Each edge is unordered set `{u,v}`.
For simple graphs, $u\ne v$.
No edge pair repeats.
Adjacency is symmetric.

$$
v\in adj(u)\iff u\in adj(v).
$$

Degree is adjacency-set size.
The handshaking lemma states

$$
\sum_{v\in V}degree(v)=2|E|.
$$

Every edge contributes twice.
Therefore odd-degree vertex count is even.
A path is a vertex sequence joined by edges.
Connectivity is an equivalence relation.
It is reflexive, symmetric, and transitive.
Connected components are equivalence classes.
DFS or BFS marks one class per start.
In undirected DFS, edge to parent is not a cycle by itself.
An edge to any other visited vertex indicates a cycle in a simple graph.
Parent identity must be tracked.
For multigraphs, a second parallel parent edge can form a cycle.
Edge identifiers are then needed.
A connected simple graph is a tree iff $|E|=|V|-1$.
A forest with $c$ components satisfies $|E|=|V|-c$.
Adding an edge within one component creates a cycle.
Adding an edge between components merges them without a cycle.
Union-find captures this invariant.
A graph is bipartite iff it has no odd cycle.
BFS colors each edge's endpoints oppositely.
An edge joining equal colors proves failure.
Shortest unweighted distance comes from BFS levels.
DFS does not guarantee shortest paths.
Adjacency matrices enforce symmetric cells.
`matrix[u][v] == matrix[v][u]`.
They use $O(V^2)$ space.
Adjacency lists use $O(V+E)$ entries, counting two directed slots per undirected edge.
Edge count must divide total adjacency lengths by two.
Mutation must update both endpoint sets atomically.
Half-added edges violate representation.
Snapshot or locking preserves coherent traversal.

## 3. Step-by-Step Execution Trace

Use vertices A through F.
Add edges A-B, B-C, C-A, D-E.
F is isolated.
Adjacency A contains B and C.
Adjacency B contains A and C.
Adjacency C contains B and A.
D contains E.
E contains D.
F contains none.
Start component DFS at A.
Visit A, then B.
From B, skip parent A.
Visit C.
C sees B as parent.
C also sees visited A.
A is not C's parent.
This proves cycle A-B-C-A.
Component contains A, B, C.
Next unvisited vertex D starts another component.
Visit E through D-E.
E sees only parent D.
No cycle appears.
F creates singleton component.
There are three components.
Degrees are A=2, B=2, C=2, D=1, E=1, F=0.
Degree sum is eight.
Twice edge count is also eight.
Odd-degree vertices D and E number two.
Now run BFS from D.
Distance D is zero.
Distance E is one.
A, B, C, and F remain unreachable.
Now add edge C-D.
Components ABC and DE merge.
The new edge connects previously separate components.
It creates no new cycle across that bridge.
Removing C-D separates them again.
Thus C-D is a bridge.
Now add edge E-A as well.
There are two distinct connections between former regions.
Neither C-D nor E-A alone is now a bridge.
A cycle crosses both regions.
This trace distinguishes cycle edges, bridges, and components.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

from collections import deque
from collections.abc import Hashable
from typing import TypeVar


V = TypeVar("V", bound=Hashable)


class UndirectedGraph:
    def __init__(self) -> None:
        self.adjacency: dict[V, set[V]] = {}

    def add_vertex(self, vertex: V) -> None:
        self.adjacency.setdefault(vertex, set())

    def add_edge(self, first: V, second: V) -> bool:
        if first == second:
            raise ValueError("self-loops are not allowed in this simple graph")
        self.add_vertex(first)
        self.add_vertex(second)
        if second in self.adjacency[first]:
            return False
        self.adjacency[first].add(second)
        self.adjacency[second].add(first)
        return True

    def remove_edge(self, first: V, second: V) -> bool:
        if first not in self.adjacency or second not in self.adjacency[first]:
            return False
        self.adjacency[first].remove(second)
        self.adjacency[second].remove(first)
        return True

    def components(self) -> list[set[V]]:
        seen: set[V] = set()
        result: list[set[V]] = []
        for start in self.adjacency:
            if start in seen:
                continue
            component = {start}
            seen.add(start)
            queue = deque([start])
            while queue:
                vertex = queue.popleft()
                for neighbor in self.adjacency[vertex]:
                    if neighbor not in seen:
                        seen.add(neighbor)
                        component.add(neighbor)
                        queue.append(neighbor)
            result.append(component)
        return result

    def has_cycle(self) -> bool:
        seen: set[V] = set()
        for start in self.adjacency:
            if start in seen:
                continue
            stack: list[tuple[V, V | None]] = [(start, None)]
            seen.add(start)
            while stack:
                vertex, parent = stack.pop()
                for neighbor in self.adjacency[vertex]:
                    if neighbor == parent:
                        continue
                    if neighbor in seen:
                        return True
                    seen.add(neighbor)
                    stack.append((neighbor, vertex))
        return False


def demo() -> None:
    graph: UndirectedGraph[str] = UndirectedGraph()
    for edge in [("A", "B"), ("B", "C"), ("C", "A"), ("D", "E")]:
        graph.add_edge(*edge)
    graph.add_vertex("F")
    assert graph.has_cycle()
    assert {frozenset(c) for c in graph.components()} == {frozenset("ABC"), frozenset("DE"), frozenset("F")}


if __name__ == "__main__":
    demo()
```

The class implements simple-graph semantics.
Sets deduplicate edges.
Self-loops are rejected.
Both directions update together.
In concurrent code, guard the pair mutation.
Vertex keys must remain hash-stable.
Iteration order is unspecified.
Sort only for presentation.
Cycle detection marks at push time.
That prevents duplicate scheduling.
Parent skip is valid for simple graphs.
Multigraphs need edge IDs.
Removing a vertex would remove all reciprocal entries.
Implement it transactionally.
Property-test symmetry after mutations.
Verify degree sum equals twice edge count.
Compare components with union-find.
Snapshot before traversal.
Bound untrusted size.

## 5. Asymptotic Time & Space Complexity

Hash-set edge insertion is expected $O(1)$.
Edge removal is expected $O(1)$.
Vertex insertion is expected $O(1)$.
Components traversal is $O(V+E)$ expected.
Cycle detection is $O(V+E)$ expected.
Adjacency-list storage is $O(V+E)$.
Each simple edge stores two neighbor entries.
Seen and traversal structures use $O(V)$.
Adjacency-matrix edge lookup is $O(1)$.
Its storage is $O(V^2)$.
Matrix neighbor enumeration costs $O(V)$ per vertex.
Union-find processes incremental connectivity in near-constant amortized time.
It does not enumerate paths.
It does not support deletions simply.
BFS shortest paths cost $O(V+E)$.
Dijkstra is needed for nonnegative weights.
Bridge and articulation algorithms are $O(V+E)$.
Minimum spanning tree costs depend on sorting or priority queues.
Output-sensitive enumeration adds output size.

## 6. Systems Connections

Physical topology is naturally undirected when a link supports both directions.
The model still needs separate capacities when directions differ operationally.
Social friendship is often modeled as an undirected relation.
Interaction and follow relationships may instead be directed.
Road adjacency is undirected only when travel is permitted both ways.
Electrical connectivity and circuit netlists use undirected components.
Package conflicts can form undirected incompatibility graphs.
Cluster discovery uses connected components to group reachable peers.
Spanning trees remove cycles while retaining component connectivity.
Minimum spanning trees additionally minimize total selected edge weight.
Bridge detection identifies single-link failure points.
Articulation vertices identify single-node failure points.
Operational systems distinguish configured topology from current reachability.
Network topology uses undirected links when direction is symmetric.
Real links can have asymmetric capacity.
Then directed attributes may be better.
Social friendship is symmetric by product contract.
Follower relationships are directed.
Road maps may mix one-way and two-way edges.
Electrical and physical connection graphs use components.
Failure analysis finds bridges and articulation points.
Cluster membership uses connectivity snapshots.
Distributed graphs require partition communication.
Filesystem hard links create graph sharing.
Dependency graphs are usually directed instead.
Security models must choose direction carefully.
Treating delegation as undirected grants false reachability.
Graph visualization often duplicates adjacency internally.
Stable edge IDs simplify selection and deletion.
Undirected graphs model reciprocity only when the domain truly guarantees it.

## 7. Practice Checklist

- Define simple or multigraph semantics.
- Define self-loop policy.
- Define parallel-edge policy.
- Store both adjacency directions.
- Update both atomically.
- Keep vertex hashes stable.
- Include isolated vertices.
- Count every edge once externally.
- Divide adjacency degree sum by two.
- Validate symmetry.
- Skip DFS parent edge.
- Use edge IDs for multigraph cycles.
- Mark discovered vertices early.
- Traverse every component.
- Use BFS for unweighted shortest paths.
- Use DFS or BFS for connectivity.
- Use union-find for incremental additions.
- Do not expect union-find deletions.
- Test empty graph.
- Test singleton graph.
- Test one edge.
- Test triangle cycle.
- Test chain.
- Test disconnected components.
- Test bridge addition.
- Test reciprocal removal.
- Snapshot mutable graphs.
- Bound vertices and edges.
- Sort only for deterministic output.
- Include output size.
- Choose adjacency matrix for dense small graphs.
- Choose adjacency lists for sparse graphs.
- Preserve stable edge identities when needed.
- Distinguish degree conventions for loops.
- Verify handshaking lemma.
- Verify forest edge formula.
- Keep directed and undirected APIs separate.
- Document weight symmetry.
- Test malformed imported adjacency.
- Model the domain honestly.

## 8. Frequently Asked Questions

### What makes an edge undirected?

Its endpoint relationship is symmetric and has no source direction.

### Why store each edge twice?

Adjacency-list traversal needs direct neighbor access from either endpoint.

### What is a connected component?

A maximal set whose vertices can reach one another through undirected paths.

### How is a cycle detected?

During DFS, an edge to a visited nonparent vertex proves a cycle in a simple graph.

### Why skip the parent edge?

The stored reciprocal edge returns to the vertex we just came from and is not a new cycle.

### What changes for parallel edges?

A second edge to the parent can form a multigraph cycle, so edge identity is required.

### What is a bridge?

An edge whose removal increases connected-component count.

### What is an articulation point?

A vertex whose removal increases component count under the graph's vertex-removal model.

### When is a graph a tree?

A finite simple undirected graph is a tree when connected and acyclic.

### What does degree sum equal?

Twice the edge count under standard undirected conventions.

### Which representation is best?

Adjacency lists suit sparse graphs; matrices suit dense graphs or constant pair queries.

### What is the most important modeling question?

Whether the real relationship is genuinely symmetric.
