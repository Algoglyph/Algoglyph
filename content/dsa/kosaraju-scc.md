# Kosaraju's Algorithm: Strongly Connected Components in Two Graph Sweeps

![Kosaraju strongly connected components](/images/dsa/kosaraju-scc-dark.png#dark)

Kosaraju's algorithm partitions a directed graph into maximal regions whose vertices can all reach one another.
It uses two complete graph traversals, with every edge reversed between them.
The surprising part is not the $O(V+E)$ running time; it is why finishing order from the first traversal reveals the correct order for the second.

## 1. Historical Context & Motivation

### Reachability is not symmetric

In an undirected graph, a connected component is straightforward.
If a path connects $u$ to $v$, the same edges connect $v$ back to $u$.
A directed edge has no such symmetry.
One service may call another without any return path through the dependency graph.

This produces a more demanding equivalence relation.
Vertices $u$ and $v$ belong together only when

$$
u\leadsto v\quad\text{and}\quad v\leadsto u.
$$

The maximal sets satisfying mutual reachability are **strongly connected components**, abbreviated SCCs.

### Why SCCs are a useful abstraction

Inside one SCC, every vertex participates in a directed cycle with every other vertex through some path.
Between SCCs, cycles disappear.
Contracting each SCC into a single supervertex produces a directed acyclic graph called the condensation graph.

That transformation separates two kinds of structure:

- cyclic regions that must be considered together;
- acyclic dependencies between those regions.

Build systems use it to isolate dependency cycles.
Compilers use it when analyzing recursive call groups.
Graph databases use it to summarize reachability.
Model checkers use it when detecting recurrent state sets.

### The two-pass idea

Kosaraju's algorithm performs:

1. a depth-first traversal of the original graph, recording vertices by finish time;
2. a depth-first traversal of the transposed graph, processing vertices in decreasing finish time.

Every tree produced by the second pass is exactly one SCC.
The transpose reverses every edge but preserves SCC membership.
The first-pass order ensures that the second pass cannot escape into an unassigned component.

### Historical attribution

The algorithm is commonly attributed to S. Rao Kosaraju, with Micha Sharir independently describing the method.
Its appeal is structural simplicity.
Unlike Tarjan's algorithm, it does not need low-link values or an active stack invariant.
Its trade-off is the explicit transpose or an equivalent reverse-edge representation.

### Problem statement

Given a directed graph $G=(V,E)$, return a partition

$$
V=C_1\cup C_2\cup\cdots\cup C_k
$$

such that each $C_i$ is maximal under mutual reachability.
Every vertex must occur in exactly one component.
The order of components and the order of vertices inside each component are normally unspecified.

## 2. Core Mathematical Invariants

### Strong connectivity is an equivalence relation

Define $u\sim v$ when $u\leadsto v$ and $v\leadsto u$.
The relation is reflexive because a zero-length path reaches the same vertex.
It is symmetric by definition.
It is transitive because reachability paths concatenate.

Therefore $\sim$ partitions the vertex set into equivalence classes.
Those classes are precisely the SCCs.
An algorithm must discover this unique partition even though traversal trees may vary with adjacency order.

### The condensation graph is a DAG

Let $G^{\ast}$ have one vertex for every SCC of $G$.
Add an edge $A\rightarrow B$ when $G$ has an edge from a vertex in component $A$ to a vertex in distinct component $B$.

If $G^{\ast}$ contained a directed cycle, every component on that cycle could reach every other component.
They would form one larger SCC, contradicting maximality.
Thus $G^{\ast}$ is acyclic.

Kosaraju's correctness is easiest to understand on this DAG rather than on individual original vertices.

### Transposition preserves components

The transpose graph $G^T=(V,E^T)$ contains edge $(v,u)$ for every edge $(u,v)$ in $G$.
If $u\leadsto v$ in $G$, reversing every edge of that path gives $v\leadsto u$ in $G^T$.

Therefore

$$
u\sim_G v\iff u\sim_{G^T}v.
$$

The SCC partition is identical in both graphs.
Only the edges between components reverse direction.

### DFS finish times

A depth-first search assigns a finish time when all outgoing neighbors of a vertex have been completely processed.
Let $f(v)$ be that finish time.
For a component $C$, define

$$
F(C)=\max_{v\in C}f(v).
$$

The component with greatest $F(C)$ among an unprocessed region behaves like a source of the original condensation graph under the standard finishing-time theorem.
Equivalently, it is a sink in the transposed condensation graph.

### The ordering lemma

Suppose the condensation graph contains edge $C\rightarrow D$ with $C\ne D$.
If DFS first enters $C$ before $D$ has been completed, it can reach $D$, finish all of $D$, return, and finish $C$ later.
If DFS first completes $D$ in another tree, its finish time is already below the later finish of $C$ when $C$ is eventually explored.

In either case, the maximum finish time respects

$$
F(C)>F(D)
$$

for the relevant cross-component reachability order.
Decreasing finish time therefore selects source components of $G^{\ast}$ first.

### Why the second pass cannot escape

Consider the next unassigned component $C$ selected by maximum first-pass finish time.
In $G^T$, every intercomponent edge incident from $C$ corresponds to an incoming edge to $C$ in $G$.
If a second-pass DFS could reach another unassigned component $D$, then $G$ would contain a path $D\leadsto C$.
The finish-order theorem would require $D$ to have been selected before $C$.
That contradicts the choice of $C$.

The traversal may encounter already assigned vertices, but the visited guard stops there.
Among unassigned vertices, it remains exactly inside $C$.

### First-pass invariant

At every DFS return, the appended vertex has no unfinished descendant.
The `order` list records increasing finish time.
Reading it backward produces decreasing finish time.

The first pass must start DFS from every unvisited vertex.
A directed graph can be disconnected even when edge directions are ignored.
Starting from only vertex zero can omit entire SCCs.

### Second-pass invariant

Before starting a new transposed DFS, all components with greater first-pass finish priority have been assigned.
The new DFS reaches every vertex in its chosen SCC because transposition preserves mutual reachability.
It reaches no other unassigned SCC because of the ordering lemma.
Thus the collected set is one complete SCC.

### Self-loops and singleton components

A vertex with a self-loop forms an SCC of size one unless it is mutually reachable with other vertices.
A vertex without any incident edges is also a valid singleton SCC.
Component size alone does not indicate whether a cycle exists: a singleton is cyclic only if it has a self-loop under the nonempty-cycle definition.

## 3. Step-by-Step Execution Trace

### Example graph

Let the directed graph have vertices $0$ through $7$ and edges:

```text
0 -> 1
1 -> 2
2 -> 0
2 -> 3
3 -> 4
4 -> 5
5 -> 3
5 -> 6
6 -> 7
7 -> 6
```

The expected SCCs are:

$$
A=\{0,1,2\},\qquad B=\{3,4,5\},\qquad C=\{6,7\}.
$$

The condensation graph is the chain

$$
A\rightarrow B\rightarrow C.
$$

### First DFS begins at vertex zero

Visit $0$, then follow $0\rightarrow1$.
Visit $1$, then follow $1\rightarrow2$.
Visit $2$.
The edge $2\rightarrow0$ returns to an already visited vertex.
The edge $2\rightarrow3$ enters the next component.

Visit $3$, then $4$, then $5$.
The edge $5\rightarrow3$ closes a cycle within $B$.
The edge $5\rightarrow6$ enters component $C$.

Visit $6$, then $7$.
The edge $7\rightarrow6$ returns to a visited vertex.
Vertex $7$ has no remaining outgoing neighbor, so it finishes first.
Append $7$ to `order`.

Return to $6$.
All its outgoing work is complete, so append $6$.
Return to $5$ and append $5$.
Then append $4$, $3$, $2$, $1$, and finally $0$.

For this adjacency order, increasing finish order is

```text
[7, 6, 5, 4, 3, 2, 1, 0]
```

and decreasing finish order is

```text
[0, 1, 2, 3, 4, 5, 6, 7].
```

Different neighbor ordering can change vertex-level finish times.
It cannot violate the component-level ordering required by the proof.

### Build the transpose

Reverse every edge:

```text
1 -> 0
2 -> 1
0 -> 2
3 -> 2
4 -> 3
5 -> 4
3 -> 5
6 -> 5
7 -> 6
6 -> 7
```

The internal cycles remain internal cycles.
The condensation chain reverses:

$$
C\rightarrow B\rightarrow A.
$$

### Second pass starts from zero

Process vertices in decreasing first-pass finish time.
Start a transposed DFS at $0$.
It reaches $2$ through $0\rightarrow2$.
From $2$, it reaches $1$.
From $1$, it returns to $0$.

No transposed edge leaves this set toward $B$.
The collected component is

```text
[0, 2, 1]
```

which equals $A$ regardless of internal ordering.

### Skip assigned vertices

The next order entries $1$ and $2$ are already visited in the second pass.
They are skipped.

### Discover the middle component

Start at $3$.
In the transpose, $3$ reaches $5$, and $5$ reaches $4$.
The edge $3\rightarrow2$ points into already assigned component $A$.
The visited guard prevents merging it with the new component.

The second component is

```text
[3, 5, 4]
```

which is $B$.

### Discover the final component

Entries $4$ and $5$ are skipped because they are assigned.
Start at $6$.
It reaches $7$, and $7$ reaches $6$.
The edge $6\rightarrow5$ enters an assigned component and stops.

The third component is

```text
[6, 7]
```

which is $C$.

### Final partition

Ignoring internal list order, the algorithm returns

$$
\big\{\{0,1,2\},\{3,4,5\},\{6,7\}\big\}.
$$

Every vertex appears once.
Each set is mutually reachable.
No two returned sets can be merged while preserving mutual reachability.

### What goes wrong without finish order

Suppose the second pass on $G^T$ began at vertex $6$.
It could follow $6\rightarrow5$, enter $B$, then continue through $3\rightarrow2$ into $A$.
One traversal would incorrectly merge all components.
Decreasing first-pass finish order starts at $A$, a sink of the transposed condensation graph, preventing that escape.

### What goes wrong without transposition

If the second pass reused the original graph and started at $0$, it could traverse $A\rightarrow B\rightarrow C$.
Finish order alone is not sufficient.
The reversed edges and the ordering theorem work as a pair.

## 4. Production-Ready Implementations

### Iterative Python implementation

Recursive DFS can overflow the language call stack on a long path.
The implementation below uses explicit stacks and records finish order correctly.

```python
from collections.abc import Iterable, Sequence


def strongly_connected_components(
    adjacency: Sequence[Iterable[int]],
) -> list[list[int]]:
    n = len(adjacency)
    graph = [list(neighbors) for neighbors in adjacency]

    for source, neighbors in enumerate(graph):
        for target in neighbors:
            if not 0 <= target < n:
                raise ValueError(f"edge {source}->{target} is outside 0..{n - 1}")

    transpose: list[list[int]] = [[] for _ in range(n)]
    for source, neighbors in enumerate(graph):
        for target in neighbors:
            transpose[target].append(source)

    visited = [False] * n
    finish_order: list[int] = []

    for root in range(n):
        if visited[root]:
            continue
        visited[root] = True
        stack: list[tuple[int, int]] = [(root, 0)]

        while stack:
            vertex, next_index = stack[-1]
            if next_index < len(graph[vertex]):
                neighbor = graph[vertex][next_index]
                stack[-1] = (vertex, next_index + 1)
                if not visited[neighbor]:
                    visited[neighbor] = True
                    stack.append((neighbor, 0))
            else:
                finish_order.append(vertex)
                stack.pop()

    assigned = [False] * n
    components: list[list[int]] = []

    for root in reversed(finish_order):
        if assigned[root]:
            continue
        assigned[root] = True
        component: list[int] = []
        stack = [root]

        while stack:
            vertex = stack.pop()
            component.append(vertex)
            for neighbor in transpose[vertex]:
                if not assigned[neighbor]:
                    assigned[neighbor] = True
                    stack.append(neighbor)

        components.append(component)

    return components


def normalized(parts: list[list[int]]) -> list[list[int]]:
    return sorted(sorted(part) for part in parts)


example = [
    [1],       # 0
    [2],       # 1
    [0, 3],    # 2
    [4],       # 3
    [5],       # 4
    [3, 6],    # 5
    [7],       # 6
    [6],       # 7
]

assert normalized(strongly_connected_components(example)) == [
    [0, 1, 2], [3, 4, 5], [6, 7]
]
assert normalized(strongly_connected_components([[], [], []])) == [[0], [1], [2]]
assert strongly_connected_components([]) == []
```

The first-pass stack stores `(vertex, next_neighbor_index)`.
That detail distinguishes finishing a vertex from merely discovering it.
Appending on discovery would produce preorder, which does not satisfy the SCC ordering proof.

### Recursive C++ implementation

```cpp
#include <cstddef>
#include <stdexcept>
#include <vector>

class Kosaraju {
public:
    explicit Kosaraju(std::vector<std::vector<int>> graph)
        : graph_(std::move(graph)), reverse_(graph_.size()) {
        const int n = static_cast<int>(graph_.size());
        for (int u = 0; u < n; ++u) {
            for (int v : graph_[u]) {
                if (v < 0 || v >= n) {
                    throw std::out_of_range("edge endpoint outside graph");
                }
                reverse_[v].push_back(u);
            }
        }
    }

    std::vector<std::vector<int>> run() {
        const int n = static_cast<int>(graph_.size());
        std::vector<bool> seen(n, false);
        std::vector<int> order;
        order.reserve(n);

        for (int u = 0; u < n; ++u) {
            if (!seen[u]) {
                finish_dfs(u, seen, order);
            }
        }

        std::fill(seen.begin(), seen.end(), false);
        std::vector<std::vector<int>> components;
        for (auto it = order.rbegin(); it != order.rend(); ++it) {
            if (!seen[*it]) {
                components.emplace_back();
                collect_dfs(*it, seen, components.back());
            }
        }
        return components;
    }

private:
    void finish_dfs(int u, std::vector<bool>& seen, std::vector<int>& order) {
        seen[u] = true;
        for (int v : graph_[u]) {
            if (!seen[v]) {
                finish_dfs(v, seen, order);
            }
        }
        order.push_back(u);
    }

    void collect_dfs(int u, std::vector<bool>& seen, std::vector<int>& part) {
        seen[u] = true;
        part.push_back(u);
        for (int v : reverse_[u]) {
            if (!seen[v]) {
                collect_dfs(v, seen, part);
            }
        }
    }

    std::vector<std::vector<int>> graph_;
    std::vector<std::vector<int>> reverse_;
};
```

For graphs with millions of vertices or adversarial depth, replace recursion with explicit stacks.
C++ does not guarantee enough call-stack capacity for a path of length $V$.

### Building the condensation graph

After discovering components, map each vertex to its component identifier.
For every original edge $u\rightarrow v$, add component edge `id[u] -> id[v]` when the identifiers differ.
Deduplicate those edges if downstream algorithms assume a simple DAG.

Do not infer component identifiers from output order unless the API promises that order.
Build the mapping explicitly.

### Input representation choices

Adjacency lists give $O(V+E)$ traversal and storage.
An adjacency matrix forces $O(V^2)$ neighbor scanning even for sparse graphs.
Compressed sparse row storage can improve locality for immutable large graphs.
If both forward and reverse traversals are common, retaining both orientations may be worth the memory.

## 5. Asymptotic Time & Space Complexity

### Time complexity

The first DFS visits every vertex once and inspects every outgoing edge once.
Its cost is $O(V+E)$.

Building the transpose creates one reversed entry per original edge.
Its cost is $O(V+E)$ including allocation of vertex lists.

The second DFS again visits every vertex once and inspects every reversed edge once.
Its cost is $O(V+E)$.

Adding the three phases gives

$$
O(V+E).
$$

The constant factor includes two traversals and one edge-copy pass.

### Space complexity

The original adjacency list occupies $O(V+E)$ input space.
The explicit transpose requires another $O(V+E)$.
Visited arrays, finish order, component identifiers, and explicit DFS stacks require $O(V)$.

Auxiliary space beyond the input is therefore

$$
O(V+E).
$$

If a graph store already supports efficient incoming-edge iteration, the transpose need not be copied.
The logical requirement is access to reversed adjacency, not a particular allocation.

### Output complexity

Listing component membership uses $O(V)$ output space.
Building the condensation graph can add up to $O(E)$ before cross-component edge deduplication.
The number of distinct condensation edges is bounded by both $E$ and $k(k-1)/2$ for $k$ components in a simple DAG orientation.

### Comparison with Tarjan and Gabow

| Algorithm | Time | Extra graph copy | Traversal style |
|---|---:|---:|---|
| Kosaraju | $O(V+E)$ | transpose or reverse access | two DFS passes |
| Tarjan | $O(V+E)$ | no | one DFS with low links |
| Gabow | $O(V+E)$ | no | one DFS with two stacks |

Kosaraju is often easiest to explain and test.
Tarjan can use less memory when reverse adjacency is unavailable.
The best choice depends on graph representation, recursion constraints, and team familiarity.

### Dense graphs

With an adjacency matrix, reading all possible edges already costs $\Theta(V^2)$.
The algorithm remains linear in the representation size, which is $\Theta(V^2)$ rather than $V+E$ storage.
Complexity claims should state the representation assumption.

## 6. Systems Connections

### Build dependency cycles

Represent each build target as a vertex and each dependency as a directed edge.
An SCC with more than one target identifies a mutually recursive dependency group.
The condensation graph provides a valid acyclic scheduling structure once cyclic groups are handled or rejected.

### Compiler call graphs

Mutually recursive functions belong to one SCC of the call graph.
An optimizer can process the condensation DAG bottom-up, summarizing each recursive group as a unit.
Indirect calls and dynamic dispatch make the constructed graph conservative, so an SCC may reflect possible rather than guaranteed recursion.

### Package managers

Package dependencies form a directed graph.
SCC detection separates genuine dependency cycles from long acyclic chains.
The component graph can then be topologically ordered for installation or analysis.
Version constraints are a separate satisfiability problem; SCCs alone do not resolve them.

### Distributed service dependencies

Telemetry can produce a directed service-call graph.
Large SCCs reveal feedback paths in which requests or messages can circulate.
Observed edges depend on sampling and time windows, so absence of an SCC is not proof that no cycle is possible.

### Model checking

State-transition systems use SCCs to find recurrent regions.
Liveness analysis often asks whether a reachable SCC contains a cycle satisfying an acceptance condition.
The graph may be generated on demand, making storage and traversal order as important as the abstract algorithm.

### Web and social graphs

SCCs distinguish mutually reachable clusters from one-way influence paths.
At web scale, holding both graph orientations can be expensive.
External-memory and distributed SCC algorithms reorganize the computation around partitioning and communication costs.
The two-pass theorem remains conceptually useful even when the implementation is not an in-memory DFS.

### Incremental limitations

Kosaraju is a static algorithm.
Adding or deleting one edge can merge or split components across a large region.
Rerunning in $O(V+E)$ may be acceptable for batch snapshots but not for every high-frequency update.
Dynamic SCC maintenance requires more specialized data structures and different complexity guarantees.

## 7. Practice Checklist

### Model the graph correctly

- Confirm edges are directed.
- Define what each vertex represents.
- Include isolated vertices.
- Validate every edge endpoint.
- Decide whether parallel edges are retained.
- Decide whether self-loops matter downstream.
- Choose adjacency lists for sparse graphs.

### First-pass checks

- Start from every unvisited vertex.
- Mark a vertex when discovered.
- Append it only after all outgoing neighbors finish.
- Distinguish preorder from finish order.
- Preserve the complete finish list.
- Avoid recursion overflow on deep graphs.

### Transpose checks

- Reverse every edge exactly once.
- Keep the same vertex set.
- Preserve isolated vertices.
- Do not reverse only DFS-tree edges.
- Confirm SCC membership is unchanged on small examples.
- Reuse stored incoming adjacency when available.

### Second-pass checks

- Reset or replace the visited array.
- Process finish order in reverse.
- Traverse the transposed graph, not the original.
- Create one component per new root.
- Skip vertices assigned by earlier roots.
- Include singleton components.

### Test cases

- Empty graph.
- One isolated vertex.
- One self-loop.
- A directed acyclic graph.
- One directed cycle containing every vertex.
- Several disconnected cycles.
- A chain of SCCs.
- Parallel edges.
- Isolated vertices mixed with cycles.
- A long path that would overflow recursive DFS.

### Validate the result

- Every input vertex appears exactly once.
- Vertices inside each component reach each other.
- No two returned components can be mutually reachable.
- Contracted cross-component edges form a DAG.
- Results match Tarjan's algorithm on random small graphs.
- Component order is not assumed unless normalized.

### Reason about correctness

- Prove strong connectivity is an equivalence relation.
- Prove the condensation graph is acyclic.
- Prove transposition preserves SCCs.
- Prove decreasing finish order selects a safe component.
- Prove second-pass DFS reaches its entire SCC.
- Prove it reaches no other unassigned SCC.

## 8. Frequently Asked Questions

### Why are two DFS passes necessary?

The first establishes a component priority through finish times.
The second uses reversed edges so each priority root is trapped inside one unassigned SCC.

### Why not run the second pass on the original graph?

A source component can reach downstream components in the original condensation graph.
The second traversal could merge several SCCs incorrectly.

### Why reverse the finish-order list?

Vertices are appended when they finish, so the list is in increasing finish time.
Kosaraju needs decreasing finish time.

### Can breadth-first search replace DFS in the first pass?

Not directly.
The proof depends on DFS finishing times and descendant completion.
BFS discovery levels do not provide the same ordering theorem.

### Does adjacency order change the answer?

It can change finish times, traversal trees, component order, and member order.
It cannot change the unique SCC partition.

### Is a singleton vertex strongly connected?

Yes.
It reaches itself by a zero-length path, so every vertex belongs to some SCC.

### Is every singleton SCC a directed cycle?

No.
Under the usual nonempty-cycle definition, a singleton requires a self-loop to contain a cycle.

### Must I allocate a transpose graph?

No, if the graph representation already supports incoming-neighbor iteration.
The second pass only requires efficient traversal of reversed edges.

### Why is the condensation graph acyclic?

A cycle among distinct components would make them mutually reachable.
They would then be one SCC, contradicting maximality.

### How does Kosaraju differ from Tarjan's algorithm?

Kosaraju uses finish order, reverse edges, and two traversals.
Tarjan discovers SCC roots in one traversal using discovery indices, low-link values, and an active stack.

### Which algorithm should production code use?

Use Kosaraju when reverse adjacency is cheap and clarity is valuable.
Use Tarjan or Gabow when avoiding the transpose matters and the team can maintain their invariants safely.

### Can components be returned in topological order?

Kosaraju's discovery order has a relationship to condensation order, but APIs should not rely on incidental vertex ordering.
Build the condensation DAG and topologically sort it when a documented order is required.

### Does the algorithm work with parallel edges?

Yes.
They add redundant neighbor inspections but do not change reachability or the SCC partition.

### What is the most common iterative-DFS bug?

Appending a vertex when it is first pushed rather than when all its outgoing neighbors have finished.
That records discovery order, not finish order.

### Can Kosaraju update SCCs after one edge changes?

Not incrementally by itself.
It recomputes the partition; dynamic SCC algorithms are needed when updates must be cheaper than a full traversal.

### What should I study next?

Implement Tarjan's SCC algorithm and compare its low-link invariant with Kosaraju's finish-order theorem.
Then build and topologically process the condensation graph.
