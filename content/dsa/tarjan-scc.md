# Tarjan SCC: Low-Link Invariants, Active Stacks & One-Pass Condensation

![Tarjan SCC discovery and low-link updates](/images/dsa/tarjan-scc-dark.png)

## 1. Historical Context & Motivation

A directed graph can contain cycles nested inside a larger one-way flow.
Within a strongly connected component, every vertex can reach every other vertex.
Contracting each component produces a directed acyclic graph called the condensation graph.
This decomposition turns a cyclic system into an ordered structure.
It supports dependency analysis, compiler optimization, model checking, build systems, and graph algorithms.
One approach runs depth-first search twice, as in Kosaraju's algorithm.
Tarjan's algorithm discovers every component in one DFS pass.
It assigns each vertex a discovery index.
It tracks the earliest active discovery index reachable from that vertex.
It keeps unfinished vertices on a dedicated stack.
When a vertex cannot reach an earlier active ancestor, it is the root of one complete component.
Popping through that root emits exactly the component.
The algorithm is linear in vertices plus edges.
Its compactness hides subtle distinctions.
The stack is not simply the language's recursion stack.
It contains discovered vertices whose final components are unresolved.
A directed edge to a completed component must not lower low-link state.
An edge to an active stack vertex can.
An edge to an unvisited child propagates the child's final low-link value after recursion.
Mixing those cases is the most common correctness error.
The method was introduced by Robert Tarjan as part of a broader family of DFS low-link algorithms.
Similar vocabulary appears in bridge and articulation-point algorithms for undirected graphs.
The formulas are related but not interchangeable.
SCC low links reason about active directed DFS structure.
Bridge low values reason about undirected ancestor reachability.
This article focuses on the SCC invariant and includes an iterative implementation.
The iterative form avoids native recursion overflow on adversarial deep graphs.
It makes DFS entry, edge processing, and child return explicit.
That extra machinery is worthwhile in production graph services where input depth is not trusted.

## 2. Core Mathematical Invariants

Let `index[v]` be the DFS discovery number of vertex $v$.
Indices are unique and increase monotonically.
Let `on_stack[v]` indicate whether $v$ belongs to the unresolved Tarjan stack.
Let `low[v]` be the minimum discovery index reachable from $v$ through a path consisting of zero or more DFS-tree edges followed by at most one edge to an active vertex, under the standard operational recurrence.
The implementation invariant is easier to apply than an overly broad path paraphrase.
On entry, set `index[v] = low[v]` and push $v$.
For an edge $v\to w$, three cases exist.
If $w$ is unvisited, recursively explore it and then set

$$
low[v]=\min(low[v],low[w]).
$$

If $w$ is already on the unresolved stack, set

$$
low[v]=\min(low[v],index[w]).
$$

If $w$ has been assigned to a completed component, do not change `low[v]`.
Using `low[w]` for an already visited active neighbor is a tempting variation.
The canonical proof and implementation use `index[w]` for that edge case.
The DFS-child case uses `low[w]` only after the child's exploration is complete.
Every vertex on the Tarjan stack belongs to an SCC not yet emitted.
Stack order follows discovery nesting sufficiently that one component forms a contiguous suffix when its root is recognized.
The root condition is

$$
low[v]=index[v].
$$

It means $v$ cannot reach an earlier active vertex through the relevant DFS paths.
Every active descendant above $v$ that can return to $v$ belongs to the same SCC.
Pop vertices until $v$ is removed.
Those popped vertices form one maximal strongly connected component.
After popping, their `on_stack` flags become false.
No future low-link update may use them as active ancestors.
Every vertex is pushed exactly once and popped exactly once.
Every vertex belongs to exactly one emitted component.
The SCC partition is independent of DFS adjacency order.
Component emission order can vary with traversal order.
Within one DFS tree, components are emitted in reverse topological tendencies of the condensation graph.
Do not depend on a specific component numbering unless the API defines a normalization step.
A singleton vertex with no self-loop is still an SCC.
Reachability from a vertex to itself includes the zero-length path.
A singleton with a self-loop is also one SCC, with the loop internal to it.
Parallel edges do not change component membership.
They can appear in input and should not break bookkeeping.
Disconnected directed graphs require starting DFS from every still-unvisited vertex.
The condensation graph has one node per component.
For every original edge $u\to v$ with different component identifiers, add a condensation edge.
The condensation graph is acyclic.
If it contained a directed cycle, all components on that cycle could reach one another and should have been one maximal SCC.
This contradiction proves acyclicity.
Recursion stack and Tarjan stack serve different lifetimes.
A DFS call may return while its vertex remains on the Tarjan stack, waiting for an ancestor's component to close.
An iterative implementation must model both notions explicitly.
Its frame stores the vertex, next neighbor index, and parent relation.
Its unresolved stack stores component candidates.
Conflating them can pop vertices too early.

## 3. Step-by-Step Execution Trace

Use directed edges `A->B`, `B->C`, `C->A`, `B->D`, `D->E`, `E->D`, and `E->F`.
The expected SCCs are `{A,B,C}`, `{D,E}`, and `{F}`.
Begin DFS at A.
Assign `index[A]=0`, `low[A]=0`, and push A.
Follow edge A to unvisited B.
Assign B index one, low one, and push B.
Follow B to unvisited C.
Assign C index two, low two, and push C.
Process edge C to A.
A is on the unresolved stack.
Update `low[C] = min(2, index[A]=0) = 0`.
C finishes.
Propagate its child low value to B.
Set `low[B] = min(1, low[C]=0) = 0`.
B still has edge to D.
Visit D with index three and push it.
Visit E from D with index four and push it.
Process E to D.
D is active.
Set `low[E] = min(4, index[D]=3) = 3`.
Then visit F from E.
Assign F index five, low five, and push F.
F has no outgoing edges.
Its root condition holds because low and index both equal five.
Pop F and emit component `{F}`.
F is no longer on the Tarjan stack.
Return to E.
The child update with F leaves `low[E]` at three because `low[F]=5`.
E finishes with low three, not equal to index four.
Return to D and set `low[D] = min(3, low[E]=3) = 3`.
D's root condition holds.
Pop E, then D, stopping at D.
Emit component `{E,D}`.
Return to B.
Child D has low three, so B's low remains zero.
B finishes but is not a root because `low[B]=0` and `index[B]=1`.
Return to A and propagate B's low zero.
A finishes with low zero equal to index zero.
The unresolved stack currently contains A, B, and C in discovery order.
Pop C, then B, then A.
Emit `{C,B,A}`.
All vertices are assigned exactly once.
Now inspect edge E to F after F was popped.
If another active vertex later had an edge to F, F would be completed and `on_stack[F]` would be false.
That edge must not lower the active vertex's low value.
Otherwise a completed downstream SCC could incorrectly merge into an ancestor SCC.
Construct the condensation graph.
Component ABC has an edge to component DE through B to D.
Component DE has an edge to component F through E to F.
The condensation is `ABC -> DE -> F`.
It is acyclic.
Changing adjacency order may emit components in a different list order.
It cannot change the partition itself.

## 4. Production-Ready Implementations

This iterative implementation accepts a mapping from hashable vertices to outgoing iterables.
It includes vertices appearing only as destinations and returns deterministic component order when input iteration is deterministic.

```python
from __future__ import annotations

from collections.abc import Hashable, Iterable, Mapping
from typing import TypeVar


V = TypeVar("V", bound=Hashable)


def strongly_connected_components(graph: Mapping[V, Iterable[V]]) -> list[list[V]]:
    adjacency: dict[V, list[V]] = {vertex: list(neighbors) for vertex, neighbors in graph.items()}
    for neighbors in list(adjacency.values()):
        for neighbor in neighbors:
            adjacency.setdefault(neighbor, [])

    index: dict[V, int] = {}
    low: dict[V, int] = {}
    unresolved: list[V] = []
    on_stack: set[V] = set()
    components: list[list[V]] = []
    next_index = 0

    for start in adjacency:
        if start in index:
            continue

        index[start] = low[start] = next_index
        next_index += 1
        unresolved.append(start)
        on_stack.add(start)
        frames: list[tuple[V, int, V | None]] = [(start, 0, None)]

        while frames:
            vertex, edge_position, parent = frames[-1]
            neighbors = adjacency[vertex]

            if edge_position < len(neighbors):
                neighbor = neighbors[edge_position]
                frames[-1] = (vertex, edge_position + 1, parent)

                if neighbor not in index:
                    index[neighbor] = low[neighbor] = next_index
                    next_index += 1
                    unresolved.append(neighbor)
                    on_stack.add(neighbor)
                    frames.append((neighbor, 0, vertex))
                elif neighbor in on_stack:
                    low[vertex] = min(low[vertex], index[neighbor])
                continue

            frames.pop()
            if parent is not None:
                low[parent] = min(low[parent], low[vertex])

            if low[vertex] == index[vertex]:
                component: list[V] = []
                while True:
                    member = unresolved.pop()
                    on_stack.remove(member)
                    component.append(member)
                    if member == vertex:
                        break
                components.append(component)

    return components


def demo() -> None:
    graph = {
        "A": ["B"],
        "B": ["C", "D"],
        "C": ["A"],
        "D": ["E"],
        "E": ["D", "F"],
        "F": [],
    }
    actual = {frozenset(component) for component in strongly_connected_components(graph)}
    expected = {frozenset({"A", "B", "C"}), frozenset({"D", "E"}), frozenset({"F"})}
    assert actual == expected


if __name__ == "__main__":
    demo()
```

Materializing adjacency ensures destination-only vertices are included and each neighbor sequence can be indexed.
That costs $O(V+E)$ memory but avoids one-shot iterable surprises.
For huge streamed graphs, use a storage layer designed for repeatable adjacency access.
Vertex hashes and equality must remain stable throughout execution.
Mutable keys can corrupt dictionaries and sets.
The implementation avoids recursion depth failure.
Its explicit frame stack can still grow to $O(V)$ and must fit the heap budget.
Component member order follows pop order.
Normalize by sorting only when vertices have a defined order and consumers require deterministic presentation.
Sorting adds cost and is not part of Tarjan's algorithm.
To build a condensation graph, map every vertex to its component identifier.
Scan every original edge and add an edge when identifiers differ.
Use sets to deduplicate parallel condensation edges if required.
The resulting DAG can be topologically sorted.
Do not rely blindly on Tarjan emission numbers as a public topological numbering.
Define and test the exact direction if using that optimization internally.
For concurrent graph mutation, snapshot adjacency before analysis.
Adding or removing edges during DFS invalidates all reasoning.
For untrusted graphs, bound vertices, edges, and memory before materialization.
Use iterative parsing and checked identifiers.
Property-test small graphs by comparing mutual reachability groups from a slower reference algorithm.
Test self-loops, parallel edges, isolated vertices, destination-only vertices, one giant cycle, a DAG, and disconnected mixtures.

## 5. Asymptotic Time & Space Complexity

Every vertex receives one discovery index.
Every vertex is pushed once and popped once from the unresolved stack.
Every directed edge is examined once from its source adjacency list.
Dictionary and set operations are expected $O(1)$ for ordinary hash behavior.
Total expected running time is therefore $O(V+E)$.
With an adversarial hash implementation, map operations can degrade; production runtimes commonly protect strings or provide tree-backed alternatives.
For integer-indexed vertices, arrays give deterministic direct access.
The adjacency representation itself occupies $O(V+E)$ storage.
The algorithm adds index, low, on-stack, and component mappings of $O(V)$.
The unresolved stack holds at most $V$ vertices.
The explicit DFS frames hold at most $V$ active vertices.
Auxiliary algorithm space is $O(V)$ beyond adjacency and output.
A recursive implementation uses $O(V)$ worst-case call-stack space in addition to the Tarjan stack.
The iterative version moves that control state to a heap-backed list.
Output contains every vertex once, so component member storage is $O(V)$.
Building the condensation graph scans all edges in $O(V+E)$ expected time.
It stores up to $O(E)$ distinct intercomponent edges.
Deduplication may reduce that count.
Kosaraju's algorithm also runs in $O(V+E)$ time.
It needs a reverse graph or equivalent reversed traversal plus two DFS phases.
Tarjan avoids explicit transpose construction but has more delicate per-vertex state.
Gabow's path-based SCC algorithm is another one-pass linear alternative using two stacks.
Choice depends on implementation clarity, graph storage, and existing reverse edges.
SCC decomposition does not compute transitive closure.
Reachability among condensation nodes can still require graph traversal or additional indexing.
The linear bound assumes the graph is already represented for adjacency iteration.
Reading or decoding the graph is part of end-to-end cost.
Sorting component members or component lists adds logarithmic factors not required for correctness.

## 6. Systems Connections

Compilers form call graphs and dependency graphs containing recursion cycles.
Each recursive SCC can be analyzed as one unit before processing the condensation DAG.
Module systems use SCCs to identify mutually dependent declarations or packages.
Initialization policies must define behavior within a cycle.
Build systems can report dependency cycles by extracting nontrivial SCCs.
A DAG of components permits ordered rebuild planning outside cycles.
Package managers use similar analysis for dependency diagnostics, though version constraints add more semantics.
Model checkers collapse strongly connected states to reason about liveness and recurrent behavior.
A reachable bottom SCC can represent behavior that continues indefinitely without leaving.
Distributed-service graphs use SCCs to expose mutual communication clusters.
That observation does not by itself prove failure coupling; domain semantics remain necessary.
Web crawlers analyze strongly connected regions of link graphs.
Large graphs require external-memory or distributed variants beyond an in-memory Python mapping.
Database query optimizers use dependency SCCs for recursive common-table expressions and fixpoint evaluation.
Each recursive component requires iterative semantics until convergence.
Garbage collectors can analyze object graphs, though tracing reachability alone usually suffices for ordinary collection.
Cycle-aware reference-counting supplements may use component-like reasoning.
Deadlock analysis constructs wait-for graphs.
A directed cycle is necessary for certain deadlocks, while an SCC of size greater than one identifies mutually reachable waits.
Resource-instance semantics determine whether the cycle is sufficient evidence.
State-machine validation can reject unintended cyclic transitions or classify terminal SCCs.
Condensation gives a canonical acyclic overview for visualization.
Security permission graphs may contain delegation cycles.
SCC contraction exposes equivalence-like reachability clusters before policy analysis.
Untrusted graph endpoints must be resource-bounded because a linear algorithm can still consume enormous memory.
Iterative traversal prevents call-stack denial of service but not heap exhaustion.
Snapshot consistency matters in live systems.
Analyzing a graph while edges change can produce a partition corresponding to no real instant.
Use versions, locks, or immutable snapshots according to scale.

## 7. Practice Checklist

- Include vertices that appear only as destinations.
- Start DFS from every unvisited vertex.
- Assign unique increasing discovery indices.
- Initialize low link to the discovery index.
- Push each newly discovered vertex exactly once.
- Track unresolved-stack membership separately from visitation.
- Use child low link after an unvisited child returns.
- Use neighbor discovery index for an edge to an active vertex.
- Ignore low-link influence from completed components.
- Test root condition only after all outgoing edges are processed.
- Pop until the root vertex itself is removed.
- Clear on-stack state for every popped member.
- Emit singleton vertices as valid SCCs.
- Handle self-loops and parallel edges.
- Do not conflate the DFS control stack with the Tarjan stack.
- Use iterative frames for untrusted graph depth.
- Keep adjacency immutable during analysis.
- Require stable vertex hashing and equality.
- Compare output as sets when order is unspecified.
- Normalize ordering only for a documented API need.
- Verify every vertex appears in exactly one component.
- Verify mutual reachability inside each component on small tests.
- Verify no two emitted components should merge.
- Build condensation edges only across component identifiers.
- Deduplicate condensation edges if consumers require a simple DAG.
- Verify condensation is acyclic.
- Test an empty graph.
- Test a graph with no edges.
- Test one directed cycle containing every vertex.
- Test a pure DAG where every SCC is singleton.
- Test disconnected combinations.
- Test edges into already completed SCCs.
- Test a deep chain for stack robustness.
- Bound untrusted vertex and edge counts.
- Include adjacency materialization in memory estimates.
- Prefer integer arrays for dense integer vertex identifiers.
- Avoid relying on incidental component emission order.
- Document whether returned members are pop order or normalized.
- Cross-check random small graphs with Kosaraju or transitive closure.
- Keep SCC logic distinct from undirected bridge low-link formulas.

## 8. Frequently Asked Questions

### What is a strongly connected component?

It is a maximal vertex set in which every vertex can reach every other through directed paths.

### What does `low[v]` represent operationally?

It records the earliest discovery index reachable through the DFS subtree while respecting unresolved active-component edges under Tarjan's recurrence.

### Why is `on_stack` necessary?

An edge to a completed component must not pull the current low link backward.
Stack membership distinguishes unresolved vertices from merely visited ones.

### Why use `index[w]` for an edge to an active neighbor?

That edge directly reaches the neighbor's discovery position.
Child low values are propagated only through DFS-tree child returns in the canonical algorithm.

### When is a component complete?

When a finished vertex satisfies `low[v] == index[v]`.
The contiguous unresolved-stack suffix through that vertex forms one SCC.

### Is a singleton vertex an SCC?

Yes.
Every vertex reaches itself through the empty path, whether or not it has a self-loop.

### Why is the condensation graph acyclic?

A cycle among distinct components would make them mutually reachable, contradicting their maximal separation.

### Is Tarjan better than Kosaraju?

Both are linear.
Tarjan uses one DFS and no explicit transpose, while Kosaraju can be easier to explain when reverse adjacency already exists.

### Can Tarjan be implemented iteratively?

Yes.
The frame must preserve neighbor position and child-return updates while the unresolved component stack remains separate.

### Does output order stay fixed?

It depends on vertex and adjacency iteration order.
The SCC partition is fixed, but list ordering should not be treated as canonical without normalization.

### Can the graph change during execution?

No safe ordinary implementation permits that.
Analyze an immutable snapshot or coordinate mutations explicitly.

### What is the most common bug?

Updating low links from every visited neighbor, including vertices already removed from the Tarjan stack, can merge components incorrectly.
