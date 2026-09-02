# Strongly Connected Components & Bridges: Low-Link Meaning Across Directed and Undirected Graphs

![SCC condensation and graph bridges](/images/dsa/scc-bridges-dark.png#dark)

## 1. Historical Context & Motivation

Graph connectivity means different things in directed and undirected graphs.

In a directed graph, reachability may work one way but not the other.

A strongly connected component is a maximal vertex set with mutual reachability.

Contracting SCCs produces an acyclic condensation graph.

In an undirected graph, a bridge is an edge whose removal increases component count.

An articulation point is a vertex whose removal increases component count.

Both topics use depth-first search and low-link values.

Their low-link meanings are not interchangeable.

Tarjan's SCC algorithm considers edges to vertices active on a DFS stack.

The bridge algorithm considers ancestor back edges while ignoring only the parent edge instance.

Copying one update rule into the other causes incorrect components or bridges.

SCC decomposition helps analyze dependencies, call graphs, state machines, and deadlocks.

Bridges expose single-edge failure points in undirected infrastructure.

The SCC relation is an equivalence relation.

Every vertex belongs to exactly one SCC.

Bridges do not partition vertices by themselves.

Removing all bridges yields two-edge-connected components.

Parallel undirected edges matter.

If two vertices have two parallel edges, removing one does not disconnect them.

An algorithm that skips every edge to the parent falsely labels either edge a bridge.

Edge identities solve that problem.

Self-loops never form bridges.

They remain within one SCC in directed graphs.

Disconnected graphs require DFS from every unvisited vertex.

Recursion depth can reach the number of vertices.

Large production graphs may need iterative DFS or an increased, controlled stack.

The output representation also matters.

Component IDs should support building the condensation DAG.

Bridge output should retain original edge IDs when parallel edges exist.

This article derives both algorithms side by side without conflating their invariants.

## 2. Core Mathematical Invariants

### Strong connectivity

Vertices `u` and `v` are strongly connected when paths exist both ways.

Write:

$$
u\sim v\iff u\leadsto v\land v\leadsto u.
$$

The relation is reflexive, symmetric, and transitive.

Its equivalence classes are the SCCs.

Maximality means no outside vertex can join while preserving mutual reachability.

### Condensation invariant

Create one node per SCC.

Add an edge between component nodes when an original edge crosses components.

The resulting condensation graph is a DAG.

If it contained a directed cycle, those cycle components would be mutually reachable.

They should therefore have been one SCC, a contradiction.

### SCC discovery index

Tarjan assigns increasing discovery index `index[v]`.

`low[v]` is the smallest discovery index reachable from `v` through:

1. zero or more DFS-tree edges; then
2. at most one edge to a vertex still active on the SCC stack.

The active-stack condition is essential.

Edges to completed SCCs must not lower the current value.

### SCC root invariant

If `low[v] == index[v]`, node `v` is the root of one SCC in the DFS tree.

Pop active vertices until `v` is removed.

Those popped vertices form exactly one maximal SCC.

Every popped vertex becomes inactive and is never assigned again.

### Undirected bridge low value

For undirected DFS, `tin[v]` is discovery time.

`low[v]` is the minimum discovery time reachable from `v`'s subtree using:

1. any number of tree edges; and
2. at most one back edge.

An edge from child `to` to parent `v` is a bridge exactly when:

$$
low[to]>tin[v].
$$

The strict inequality means the child's subtree cannot reach `v` or any ancestor without that edge.

### Back-edge update

For an already visited undirected neighbor reached through a nonparent edge:

$$
low[v]=\min(low[v],tin[to]).
$$

Use the neighbor's discovery time, not its low value.

The one-back-edge definition justifies this update.

### Parallel-edge invariant

Track the exact edge ID used to enter a vertex.

Skip only that edge ID during adjacency scanning.

A parallel edge back to the parent is then processed as a valid back edge.

This prevents false bridge reports.

### DFS completion invariant

When returning from child `to`, its low value is final.

The parent may use it for its own low update and bridge test.

Every edge is examined a constant number of times.

## 3. Step-by-Step Execution Trace

### Directed SCC trace

Use directed edges `A->B`, `B->C`, `C->A`, `C->D`, `D->E`, `E->D`, and `E->F`.

Start DFS at `A`.

Assign `index[A]=0` and push `A`.

Visit `B`, assign index `1`, and push it.

Visit `C`, assign index `2`, and push it.

Edge `C->A` reaches an active vertex.

Update `low[C]` from `2` to `0`.

Follow `C->D`.

Assign `index[D]=3` and push `D`.

Visit `E`, assign index `4`, and push `E`.

Edge `E->D` reaches active `D`.

Update `low[E]` to `3`.

Visit `F` from `E`.

Assign `index[F]=5` and push `F`.

Node `F` has no outgoing edge.

Its low equals its index.

Pop `F` as singleton SCC `{F}`.

Return to `E`; its low remains `3`.

Return to `D` and update `low[D]=3`.

Because `low[D]==index[D]`, pop until `D`.

Pop `E`, then `D`, forming SCC `{D,E}`.

Return to `C`; edge into completed `D` does not lower `low[C]`.

Return to `B`, propagating low value `0`.

Return to `A`, also retaining low `0`.

Node `A` is an SCC root.

Pop `C`, `B`, and `A` to form `{A,B,C}`.

Condensation edges are `{A,B,C}->{D,E}->{F}`.

That condensation is acyclic.

### Undirected bridge trace

Use undirected triangle `A-B-C-A` plus edges `C-D`, `D-E`, and `D-F`, with edge `E-F`.

DFS discovers `A=0`, `B=1`, and `C=2`.

Edge `C-A` is a back edge, so `low[C]=0`.

Return through `B`; `low[B]` becomes `0`.

Edge `C-D` enters vertex `D` at time `3`.

From `D`, visit `E=4` and `F=5`.

Edge `F-D` or `F-E` behavior depends on the listed triangle; here `E-F` links the subtree back to `E`.

The `{D,E,F}` portion contains a cycle among `D-E`, `E-F`, and `F-D` when all three are present.

Its child low values reach `tin[D]`.

Therefore internal cycle edges are not bridges.

For child `D` of `C`, no edge reaches `C` or an ancestor.

Thus `low[D] > tin[C]`.

Edge `C-D` is a bridge.

Removing it separates the two cyclic blocks.

## 4. Production-Ready Implementations

The following Python functions separate directed SCC and undirected bridge logic.

```python
from __future__ import annotations


def strongly_connected_components(graph: list[list[int]]) -> list[list[int]]:
    n = len(graph)
    index = [-1] * n
    low = [0] * n
    active = [False] * n
    stack: list[int] = []
    components: list[list[int]] = []
    clock = 0

    def dfs(v: int) -> None:
        nonlocal clock
        index[v] = low[v] = clock
        clock += 1
        stack.append(v)
        active[v] = True

        for to in graph[v]:
            if not 0 <= to < n:
                raise ValueError("directed endpoint outside graph")
            if index[to] == -1:
                dfs(to)
                low[v] = min(low[v], low[to])
            elif active[to]:
                low[v] = min(low[v], index[to])

        if low[v] == index[v]:
            component: list[int] = []
            while True:
                node = stack.pop()
                active[node] = False
                component.append(node)
                if node == v:
                    break
            components.append(component)

    for vertex in range(n):
        if index[vertex] == -1:
            dfs(vertex)
    return components


def bridges(vertex_count: int, edges: list[tuple[int, int]]) -> list[int]:
    adjacency: list[list[tuple[int, int]]] = [[] for _ in range(vertex_count)]
    for edge_id, (u, v) in enumerate(edges):
        if not 0 <= u < vertex_count or not 0 <= v < vertex_count:
            raise ValueError("undirected endpoint outside graph")
        adjacency[u].append((v, edge_id))
        adjacency[v].append((u, edge_id))

    tin = [-1] * vertex_count
    low = [0] * vertex_count
    answer: list[int] = []
    clock = 0

    def dfs(v: int, parent_edge: int) -> None:
        nonlocal clock
        tin[v] = low[v] = clock
        clock += 1
        for to, edge_id in adjacency[v]:
            if edge_id == parent_edge:
                continue
            if tin[to] != -1:
                low[v] = min(low[v], tin[to])
            else:
                dfs(to, edge_id)
                low[v] = min(low[v], low[to])
                if low[to] > tin[v]:
                    answer.append(edge_id)

    for vertex in range(vertex_count):
        if tin[vertex] == -1:
            dfs(vertex, -1)
    return answer
```

Recursive depth can equal vertex count.

Use iterative frames for very large or adversarial graphs.

The bridge result uses edge IDs, preserving parallel-edge identity.

Self-loops are scanned but never satisfy a tree-edge bridge condition.

SCC output order depends on DFS adjacency order.

Component membership is stable even when component numbering changes.

Build a component-ID array before constructing a deduplicated condensation graph.

Validate SCC results by checking mutual reachability only on tiny oracle graphs.

Compare bridges with brute-force edge removal on small multigraphs.

## 5. Asymptotic Time & Space Complexity

Let `V` be vertex count and `E` edge count.

Tarjan SCC visits each vertex once.

It examines every directed edge once.

Time complexity is $O(V+E)$.

Arrays and the active stack use $O(V)$ space.

The output stores all vertices and uses $O(V)$ additional space.

Recursive call depth can be $O(V)$.

The undirected bridge algorithm also visits every vertex once.

Each undirected edge appears in two adjacency entries.

Both entries are examined a constant number of times.

Its time is $O(V+E)$.

Adjacency, discovery arrays, and recursion use $O(V+E)$ total space.

Building the SCC condensation scans all original edges in $O(E)$ time.

Deduplicating component edges with hash sets uses up to $O(E)$ space.

Sorting and uniquing edges costs $O(E\log E)$ instead.

Brute-force bridge testing removes each edge and reruns connectivity.

That takes $O(E(V+E))$ time.

Low-link values collapse all those tests into one DFS.

Dynamic graphs require different data structures or recomputation.

One update can change many SCCs or bridge statuses.

Parallel DFS is difficult because discovery order defines low-link dependencies.

Decomposition across known partitions can still support higher-level parallelism.

## 6. Systems Connections

Build systems collapse cyclic dependency groups into SCCs.

Package managers report mutually dependent packages as components.

Compilers analyze mutually recursive functions through call-graph SCCs.

Dataflow analysis can process the acyclic condensation in topological order.

Deadlock analysis finds cycles in resource wait graphs.

A cycle is related to SCC structure but policy determines whether it proves deadlock.

Web crawlers group mutually reachable pages.

State-machine analysis identifies recurrent regions.

Model checkers use SCCs for liveness and acceptance conditions.

Social-network directionality makes SCCs more informative than undirected components.

Bridges identify single-link failures in physical networks.

Real resilience also depends on capacity, direction, and correlated failure domains.

Road networks use bridge-like structure, though intersections and one-way roads alter the model.

Articulation points expose single-vertex dependencies.

Two-edge-connected components remain connected after any one edge removal.

The bridge tree contracts each such component.

Version-control histories are DAGs and therefore have singleton SCCs under ordinary parent edges.

Unexpected nontrivial SCCs can reveal malformed dependency data.

Graph databases can precompute SCC IDs for reachability summaries.

Updates may invalidate those summaries globally.

## 7. Practice Checklist

- State whether the graph is directed or undirected.
- Do not share low-link update rules blindly between the two cases.
- Assign discovery indices exactly once.
- Keep active-stack membership separate from visited status for SCCs.
- Lower SCC low values only through active vertices.
- Pop an SCC only when low equals discovery index.
- Mark every popped vertex inactive.
- Run DFS from every unvisited vertex.
- Build condensation edges only across different components.
- Verify the condensation is acyclic.
- Track undirected parent edge by ID.
- Skip only the exact parent edge instance.
- Process parallel edges back to the parent as back edges.
- Use discovery time for an undirected visited-neighbor update.
- Use strict `low[child] > tin[parent]` for bridges.
- Keep self-loops from becoming tree bridges.
- Test singleton and empty graphs.
- Test one directed cycle.
- Test one-way edges between SCCs.
- Test disconnected directed graphs.
- Test undirected trees where every edge is a bridge.
- Test undirected cycles where no edge is a bridge.
- Test parallel edges.
- Test self-loops.
- Compare small SCCs with mutual-reachability closure.
- Compare bridges with brute-force removals.
- Bound recursion depth on untrusted graphs.
- Preserve edge IDs in output.
- Document component-order nondeterminism.
- Include adjacency storage in complexity analysis.

## 8. Frequently Asked Questions

### Which low-link mistakes are most dangerous?

Using `low[to]` for an undirected back edge can jump through more than one back edge.

Skipping every neighbor equal to the parent breaks multigraph bridge detection.

Tracking parent edge ID fixes that ambiguity.

Lowering Tarjan low values through completed vertices can merge separate SCCs.

Using a visited flag without active-stack state cannot express that distinction.

Popping only the root leaves the rest of an SCC incorrectly active.

Reusing discovery clocks across tests without reset can corrupt sentinel assumptions.

Starting DFS from only vertex zero misses disconnected components.

Treating directed edges as undirected changes reachability and component identity.

Running the ordinary bridge test on directed edges has no valid theorem behind it.

Deduplicating parallel edges before bridge analysis can change whether an edge is critical.

Discarding self-loops is safe for bridges but may lose original edge accounting.

Recursive implementations can fail on a long path despite linear algorithmic time.

Iterative conversion must preserve child-return timing for low-value propagation.

Component numbers are not canonical unless a postprocessing order is specified.

Tests should compare sets of vertex sets rather than incidental IDs.

Condensation construction should suppress or tolerate repeated cross-component edges.

Bridge output should identify edges, not only endpoint pairs, in multigraphs.

Articulation-root rules differ from nonroot articulation rules.

Strong bridges in directed graphs need a separate algorithm.

Incremental updates cannot generally reuse stale low values safely.

Every optimization should preserve the precise reachability summarized by low links.

Draw the DFS tree and one permitted non-tree edge when debugging a disputed value.

The meaning of `low` should be written beside the update formula during review.

### What is an SCC?

It is a maximal set where every vertex can reach every other vertex.

### Why is the condensation graph acyclic?

A cycle among components would make them mutually reachable and therefore one SCC.

### What is a bridge?

An undirected edge whose removal increases the number of connected components.

### Are SCC low values and bridge low values identical?

No.

They use related DFS summaries but different edge eligibility rules.

### Why track an undirected edge ID?

It distinguishes the DFS parent edge from parallel edges joining the same vertices.

### Can a directed edge be called a bridge?

Directed graphs have different notions such as strong bridges.

The standard condition here is for undirected graphs.

### Why use a strict bridge inequality?

Equality means the child subtree can reach the parent through another route.

### What is the runtime?

Both static algorithms run in $O(V+E)$ time.

### Does DFS order change the answer?

It can change IDs and output order, not the mathematical SCC or bridge sets.

### What is the key warning?

Name the graph model and low-link meaning before implementing updates.
