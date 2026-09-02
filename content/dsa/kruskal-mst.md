# Kruskal's Algorithm: Building Minimum Spanning Forests by Safe Edges

![Kruskal minimum spanning tree](/images/dsa/kruskal-mst-dark.jpg#dark)

Kruskal's algorithm builds a minimum spanning tree by considering edges from lightest to heaviest and accepting an edge exactly when it joins two previously disconnected components.
Its correctness comes from the cut property.
Its efficient implementation comes from disjoint-set union, which answers connectivity questions without repeatedly traversing the growing forest.

## 1. Historical Context & Motivation

### Connect everything without paying for cycles

Suppose sites must be connected by links with different construction costs.
Connectivity requires a path between every pair of sites.
A cycle is unnecessary for that narrow objective: removing the heaviest edge on a cycle keeps the sites connected and cannot increase total cost.

The desired structure is therefore a spanning tree with minimum total edge weight.
For a connected undirected graph $G=(V,E)$ and edge weights $w:E\to\mathbb{R}$, a minimum spanning tree, or MST, contains all vertices, exactly $|V|-1$ edges, no cycle, and minimum total weight.

If the graph is disconnected, no spanning tree exists.
The natural output is then a **minimum spanning forest**, one MST for each connected component.

### Kruskal's greedy choice

Joseph Kruskal published his algorithm in 1956.
The rule is remarkably small:

1. sort all edges by nondecreasing weight;
2. scan them in that order;
3. accept an edge if its endpoints currently belong to different trees;
4. merge those trees.

The accepted edges never form a cycle.
The cut property proves that each accepted edge is compatible with some optimal solution.

### Why the data structure matters

A naive implementation can run a graph traversal before every proposed edge to ask whether its endpoints are already connected.
That turns connectivity checking into the bottleneck.

Disjoint-set union, also called union–find, maintains a partition of vertices into connected components.
`find(v)` returns the representative of $v$'s component.
`union(u,v)` merges two components.
Path compression and union by size or rank make a sequence of operations almost linear.

### When Kruskal is a good choice

Kruskal is especially natural when:

- the graph is sparse;
- edges already arrive sorted or can be externally sorted;
- producing a minimum spanning forest is acceptable;
- the edge list is easier to store than full adjacency;
- connectivity evolves only through accepted edges.

Prim's algorithm is often preferable for dense graphs or when adjacency-based expansion is convenient.
Borůvka's algorithm exposes more component-level parallelism.
All three rely on the same family of safe-edge arguments.

### What an MST does not promise

An MST minimizes total selected edge weight.
It does not necessarily minimize:

- the longest path between two vertices;
- the diameter;
- the maximum vertex degree;
- latency under traffic;
- resilience after an edge failure;
- the number of hops from a chosen root.

A tree has no redundancy.
Real network design commonly adds reliability and capacity constraints that change the problem.

## 2. Core Mathematical Invariants

### Forest invariant

Let $A$ be the set of edges accepted so far.
Initially $A=\varnothing$.
Before and after every iteration, $(V,A)$ is a forest.

If an edge $(u,v)$ has endpoints in different components, adding it connects two trees and cannot form a cycle.
If both endpoints are in the same component, an existing path already joins them; adding the edge would close a cycle.

The disjoint-set partition must exactly match the connected components of $(V,A)$.
That is the implementation invariant linking the data structure to the mathematical forest.

### Cuts

A cut partitions the vertices into two nonempty sets $S$ and $V\setminus S$.
An edge crosses the cut when one endpoint lies in each side.

A cut **respects** $A$ when no accepted edge crosses it.
Every current tree component defines such a cut: place that component on one side and every other component on the other.

### Cut property

For any cut that respects a partial MST forest $A$, a minimum-weight edge crossing that cut is safe to add.
Safe means that some MST contains $A$ together with that edge.

The proof uses exchange.
Take an MST $T$ containing $A$.
If $T$ already contains the chosen edge $e$, nothing is required.
Otherwise add $e$ to $T$, creating one cycle.
That cycle contains another edge $f$ crossing the same cut.
Because $e$ is lightest across the cut, $w(e)\le w(f)$.
Replacing $f$ with $e$ yields a spanning tree no heavier than $T$ and still containing the enlarged safe set.

### Why global sorting produces a safe edge

When Kruskal considers edge $(u,v)$ connecting different forest components, consider the cut defined by $u$'s current component.
No accepted edge crosses this cut.

Any lighter crossing edge was processed earlier.
If it connected distinct components then, it would have been accepted and the current cut would no longer exist.
Therefore the current edge is a lightest eligible edge crossing the cut, up to ties.
The cut property makes it safe.

### Equal-weight edges

An MST need not be unique.
When several crossing edges have the same minimum weight, any one of them is safe.
A deterministic implementation can tie-break by normalized endpoints without changing total optimal weight.

Tie-breaking affects which MST is returned.
It does not affect correctness.
If downstream systems require reproducible output, the tie rule should be part of the API contract.

### Cycle property

For any cycle, an edge with strictly greater weight than every other edge on that cycle cannot belong to an MST.
Kruskal's rejection rule is compatible with this property.
When an edge joins vertices already connected by accepted edges, it closes a cycle whose accepted edges are no heavier because they were processed earlier.

With equal weights, the rejected edge may belong to a different MST.
Rejection means it is unnecessary for the chosen forest, not globally forbidden.

### Termination invariant

Every accepted edge reduces the number of disjoint components by one.
Starting with $|V|$ singleton components, a connected graph reaches one component after exactly $|V|-1$ successful unions.
At that point the forest is a spanning tree and scanning can stop.

For a graph with $c$ connected components, the minimum spanning forest has

$$
|V|-c
$$

edges.
The algorithm cannot merge across missing graph edges, so $c$ DSU components remain.

### Negative and zero weights

Kruskal does not require nonnegative weights.
Sorting places negative edges first, and the cut proof remains valid.
Adding the same constant to every edge can change which spanning tree is best because all spanning trees contain the same number of edges only within a fixed connected vertex set; for a connected graph it preserves ordering by total shift, while forest comparisons should retain the same component coverage policy.

### Parallel edges and self-loops

Parallel edges are valid.
The lighter one is considered first; a heavier parallel edge is later rejected after its endpoints become connected.
A self-loop has identical endpoint representatives and is always rejected.
Pre-filtering self-loops is an optimization, not a correctness requirement.

## 3. Step-by-Step Execution Trace

### Input graph

Consider vertices $A,B,C,D,E,F$ and weighted undirected edges:

| Edge | Weight |
|---|---:|
| $A-B$ | 4 |
| $A-C$ | 2 |
| $B-C$ | 1 |
| $B-D$ | 5 |
| $C-D$ | 8 |
| $C-E$ | 10 |
| $D-E$ | 2 |
| $D-F$ | 6 |
| $E-F$ | 3 |

The objective is to connect all six vertices with minimum total weight.

### Sort the edges

Nondecreasing order is:

```text
B-C:1
A-C:2
D-E:2
E-F:3
A-B:4
B-D:5
D-F:6
C-D:8
C-E:10
```

The two weight-two edges may appear in either order.
They concern disjoint components at this stage, so both will be accepted.

### Initial partition

The accepted set is empty.
Each vertex is its own disjoint set:

```text
{A} {B} {C} {D} {E} {F}
```

There are six components and zero accepted edges.

### Process $B-C$ with weight one

`find(B) != find(C)`.
The edge connects two trees and is accepted.
Union their sets.

```text
accepted: B-C
sets: {A} {B,C} {D} {E} {F}
cost: 1
```

The forest invariant holds.

### Process $A-C$ with weight two

$A$ is a singleton, while $C$ belongs to $\{B,C\}$.
Their representatives differ.
Accept the edge and merge.

```text
accepted: B-C, A-C
sets: {A,B,C} {D} {E} {F}
cost: 3
```

### Process $D-E$ with weight two

$D$ and $E$ are separate.
Accept and merge.

```text
accepted: B-C, A-C, D-E
sets: {A,B,C} {D,E} {F}
cost: 5
```

### Process $E-F$ with weight three

$E$ belongs to $\{D,E\}$ and $F$ is separate.
Accept and merge.

```text
accepted: B-C, A-C, D-E, E-F
sets: {A,B,C} {D,E,F}
cost: 8
```

Two trees remain.

### Reject $A-B$ with weight four

$A$ and $B$ already belong to $\{A,B,C\}$.
The accepted path $A-C-B$ connects them.
Adding $A-B$ would create cycle $A-C-B-A$.
Reject it without changing the partition or cost.

### Process $B-D$ with weight five

$B$ belongs to the first tree and $D$ to the second.
Accepting $B-D$ joins all vertices.

```text
accepted: B-C, A-C, D-E, E-F, B-D
sets: {A,B,C,D,E,F}
cost: 13
```

Five edges have been accepted, which equals $|V|-1$.
The algorithm can stop.

### Final tree

The MST edges are

$$
\{B-C,A-C,D-E,E-F,B-D\}
$$

with total weight

$$
1+2+2+3+5=13.
$$

Every vertex is connected and no cycle exists.

### Exchange argument for the connecting edge

Immediately before accepting $B-D$, the forest defines cut

$$
S=\{A,B,C\},\qquad V\setminus S=\{D,E,F\}.
$$

Crossing edges are $B-D$ with weight $5$, $D-F$ with weight $6$ only if endpoints cross according to this cut they do not because both are on right, $C-D$ with weight $8$, and $C-E$ with weight $10$.
The actual minimum crossing edge is $B-D$.
The cut property certifies its acceptance.

### Disconnected variant

Remove every edge between $\{A,B,C\}$ and $\{D,E,F\}$.
Kruskal accepts two edges in the first region and two in the second.
It finishes with two DSU components and four edges.
That is a minimum spanning forest, not a spanning tree.
An API that requires an MST should report disconnection instead of silently calling the forest a tree.

## 4. Production-Ready Implementations

### Python implementation

```python
from dataclasses import dataclass
from typing import Hashable, Iterable, TypeVar


Vertex = TypeVar("Vertex", bound=Hashable)


@dataclass(frozen=True)
class Edge:
    weight: float
    u: Vertex
    v: Vertex


class DisjointSet:
    def __init__(self, vertices: Iterable[Vertex]) -> None:
        self.parent = {vertex: vertex for vertex in vertices}
        self.size = {vertex: 1 for vertex in self.parent}
        self.components = len(self.parent)

    def find(self, vertex: Vertex) -> Vertex:
        if vertex not in self.parent:
            raise KeyError(f"unknown vertex: {vertex!r}")
        root = vertex
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[vertex] != vertex:
            parent = self.parent[vertex]
            self.parent[vertex] = root
            vertex = parent
        return root

    def union(self, a: Vertex, b: Vertex) -> bool:
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False
        if self.size[root_a] < self.size[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        self.components -= 1
        return True


def kruskal(
    vertices: Iterable[Vertex],
    edges: Iterable[Edge],
) -> tuple[list[Edge], float, int]:
    vertex_list = list(dict.fromkeys(vertices))
    dsu = DisjointSet(vertex_list)
    chosen: list[Edge] = []
    total = 0.0

    ordered = sorted(edges, key=lambda edge: edge.weight)
    for edge in ordered:
        if edge.u not in dsu.parent or edge.v not in dsu.parent:
            raise ValueError("edge references an undeclared vertex")
        if dsu.union(edge.u, edge.v):
            chosen.append(edge)
            total += edge.weight
            if dsu.components == 1:
                break

    return chosen, total, dsu.components


vertices = list("ABCDEF")
edges = [
    Edge(4, "A", "B"), Edge(2, "A", "C"), Edge(1, "B", "C"),
    Edge(5, "B", "D"), Edge(8, "C", "D"), Edge(10, "C", "E"),
    Edge(2, "D", "E"), Edge(6, "D", "F"), Edge(3, "E", "F"),
]
tree, cost, components = kruskal(vertices, edges)
assert cost == 13
assert len(tree) == len(vertices) - 1
assert components == 1
```

The function returns the remaining component count so callers can distinguish a tree from a forest.
Floating-point weights are accepted here, but NaN must be rejected in a stricter boundary because it has broken ordering semantics.

### C++ implementation

```cpp
#include <algorithm>
#include <cstddef>
#include <numeric>
#include <stdexcept>
#include <vector>

struct Edge {
    int u;
    int v;
    long long weight;
};

class DisjointSet {
public:
    explicit DisjointSet(int n) : parent_(n), size_(n, 1), components_(n) {
        std::iota(parent_.begin(), parent_.end(), 0);
    }

    int find(int x) {
        int root = x;
        while (parent_[root] != root) {
            root = parent_[root];
        }
        while (parent_[x] != x) {
            const int next = parent_[x];
            parent_[x] = root;
            x = next;
        }
        return root;
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (size_[a] < size_[b]) std::swap(a, b);
        parent_[b] = a;
        size_[a] += size_[b];
        --components_;
        return true;
    }

    int components() const { return components_; }

private:
    std::vector<int> parent_;
    std::vector<int> size_;
    int components_;
};

std::pair<std::vector<Edge>, long long> kruskal(int vertex_count, std::vector<Edge> edges) {
    if (vertex_count < 0) throw std::invalid_argument("negative vertex count");
    for (const Edge& edge : edges) {
        if (edge.u < 0 || edge.u >= vertex_count || edge.v < 0 || edge.v >= vertex_count) {
            throw std::out_of_range("edge endpoint outside graph");
        }
    }

    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        if (a.weight != b.weight) return a.weight < b.weight;
        if (a.u != b.u) return a.u < b.u;
        return a.v < b.v;
    });

    DisjointSet dsu(vertex_count);
    std::vector<Edge> chosen;
    long long total = 0;
    for (const Edge& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            chosen.push_back(edge);
            total += edge.weight;
            if (dsu.components() == 1) break;
        }
    }
    return {chosen, total};
}
```

Use a wider accumulator than the individual edge type when total weight can overflow.
For deterministic undirected ties, normalize each edge so `u <= v` before sorting.

### External sorting

When the edge list does not fit memory, sorting dominates the architecture.
Edges can be sorted in runs and merged from disk.
The DSU still needs efficient random access to vertex representatives.
The asymptotic comparison count remains familiar, but I/O complexity and storage layout determine practical performance.

### Validation strategy

For small graphs, enumerate all subsets of $|V|-1$ edges, retain spanning trees, and compare the minimum cost.
For larger random graphs, compare the total with an independent Prim implementation.
Always verify that accepted edges are acyclic and span every original connected component.

## 5. Asymptotic Time & Space Complexity

### Sorting cost

Sorting $E$ edges costs

$$
O(E\log E).
$$

Since a simple graph has $E\le V^2$, $\log E=O(\log V)$, so the bound is also often written $O(E\log V)$.
For multigraphs, retain the explicit $O(E\log E)$ statement.

### Disjoint-set cost

Each edge triggers at most two `find` operations and possibly one `union`.
With path compression and union by rank or size, $O(E+V)$ operations cost

$$
O((E+V)\alpha(V)),
$$

where $\alpha$ is the inverse Ackermann function.
It grows so slowly that it is below five for any practical input size.
It is not literally constant in the formal bound.

### Total time

Sorting dominates, giving

$$
O(E\log E+E\alpha(V))=O(E\log E).
$$

If edges are already sorted, the scan costs $O(E\alpha(V))$.
If integer weights lie in a small bounded range, a noncomparison sort may reduce the ordering cost.

### Space

DSU arrays require $O(V)$ space.
The chosen forest requires $O(V)$ edges.
Sorting may require $O(E)$ auxiliary storage depending on the language and algorithm.
If the input list is sorted in place, algorithm-specific extra space can be closer to $O(V)$ plus the sorting stack.

### Sparse and dense behavior

For a connected sparse graph with $E=O(V)$, time is $O(V\log V)$.
For a dense simple graph with $E=\Theta(V^2)$, sorting costs $O(V^2\log V)$.
An adjacency-matrix Prim implementation can run in $O(V^2)$ and may be preferable in that regime.

### Early stopping

On a connected graph, stop after $V-1$ accepted edges.
This can avoid scanning heavy edges after the tree is complete.
It does not avoid sorting them in an ordinary in-memory implementation.
Streaming already-sorted edges benefits more directly.

## 6. Systems Connections

### Network design

An MST models the cheapest way to connect sites when one scalar edge cost captures the objective.
Real networks need redundancy, capacities, geographic constraints, and failure domains.
The MST is a lower-cost baseline, not a complete resilient topology.

### Clustering

Single-linkage hierarchical clustering can be derived from an MST.
Sort or inspect MST edges by weight and cut the largest edges to form clusters.
This captures chaining behavior: sparse bridges can join elongated groups, which may be undesirable for some datasets.

### Image segmentation

Graph-based image methods treat pixels or regions as vertices and similarity differences as edge weights.
MST or Kruskal-like component merging can organize boundaries by increasing dissimilarity.
Domain-specific stopping criteria are required because a complete MST ultimately connects unlike regions.

### Offline connectivity queries

Sorting events by threshold and unioning edges as they become eligible answers questions such as: when do two vertices first become connected?
This is Kruskal's component evolution even when no final tree is requested.
Queries sorted by threshold can be interleaved with edge processing.

### Minimum bottleneck property

Every MST is a minimum bottleneck spanning tree: it minimizes the maximum selected edge weight.
The converse is not always true; a minimum bottleneck tree need not minimize total weight.
Kruskal's ordering makes the bottleneck result intuitive because it connects components using the earliest possible thresholds.

### Parallel and distributed variants

Global sorting and mutable DSU state limit naive parallelism.
Edges in independent components can be processed concurrently, while Borůvka phases select one cheapest outgoing edge per component and expose more parallel work.
Distributed graph systems often combine filtering, partition-local forests, and component contraction rather than execute the textbook loop verbatim.

### Security and input handling

Reject invalid endpoints and non-orderable weights.
Guard total-weight accumulation against overflow.
Bound edge counts before allocation when input is untrusted.
Deterministic tie-breaking helps reproducibility in audited infrastructure plans.

## 7. Practice Checklist

### Understand the proof

- Define a spanning tree.
- Define a forest.
- Define a cut and a crossing edge.
- Explain what it means for a cut to respect accepted edges.
- Prove the cut property with an exchange argument.
- Explain why every accepted Kruskal edge is light across a respecting cut.
- Explain why rejected edges close cycles.

### Implement DSU correctly

- Initialize one set per vertex.
- Make `find` return a stable representative.
- Apply path compression.
- Apply union by size or rank.
- Return whether a union actually merged sets.
- Track component count if disconnection matters.
- Test repeated unions.
- Test deep merge sequences.

### Handle graph details

- Treat edges as undirected.
- Validate endpoints.
- Allow negative weights.
- Reject or define NaN weights.
- Ignore self-loops.
- Permit parallel edges.
- Define tie-breaking for reproducibility.
- Use a wide total-weight type.

### Test cases

- Empty graph.
- One vertex.
- Two vertices with one edge.
- A tree input.
- A single cycle.
- Equal-weight complete graph.
- Negative edge weights.
- Parallel edges.
- Self-loops.
- Disconnected graph.
- Dense graph.
- Graph with several valid MSTs.

### Validate output

- Accepted edge count is $V-c$.
- Accepted edges are acyclic.
- Each original connected component is spanned.
- Every output edge came from the input.
- Total matches an independent Prim implementation.
- Brute-force small instances agree.
- Tie output is deterministic when promised.

### Choose among MST algorithms

- Use Kruskal for edge-list and sparse workflows.
- Use Prim when adjacency expansion is natural.
- Consider matrix Prim for dense graphs.
- Consider Borůvka for component-level parallelism.
- Consider external sorting when edges exceed memory.
- Do not use an MST when redundancy is a requirement.

## 8. Frequently Asked Questions

### Why does Kruskal sort edges globally?

The ordering ensures that the first edge capable of crossing a current component cut is a light edge for that cut.
The cut property then certifies it as safe.

### Why is union–find needed?

It answers whether two endpoints are already connected in the accepted forest and merges components after acceptance.
Without it, repeated graph traversals can make cycle checks expensive.

### Does Kruskal work on directed graphs?

Not for the directed analogue of spanning trees.
Directed minimum arborescences require algorithms such as Chu–Liu/Edmonds and a chosen root.

### Does it work with negative weights?

Yes.
The proof depends on relative ordering, not nonnegativity.

### What happens when the graph is disconnected?

The algorithm returns a minimum spanning forest.
If the API promises an MST, it should detect that more than one component remains and report failure.

### Is the MST unique?

It is unique when all edge weights are distinct, though distinctness is sufficient rather than necessary.
Equal weights can produce multiple MSTs with the same total.

### Why reject an edge whose endpoints share a representative?

The accepted forest already contains a path between those endpoints.
Adding the edge would create a cycle.

### Can I stop after accepting $V-1$ edges?

Yes, for a connected graph.
At that point one acyclic component spans all vertices.

### Does early stopping prove the graph is connected?

Reaching $V-1$ accepted edges proves it.
Failing to reach that count after all edges are processed proves disconnection.

### Is $O(E\log E)$ the same as $O(E\log V)$?

For simple graphs they are asymptotically equivalent up to constants because $E\le V^2$.
For unrestricted multigraphs, state $O(E\log E)$ directly.

### Is union–find constant time?

Not formally.
With standard optimizations, amortized operation time is $O(\alpha(V))$, which is extremely small in practice.

### Can Kruskal process a stream of edges?

Yes if the stream is already in nondecreasing weight order.
An unsorted stream needs storage, sorting, or a different online problem formulation.

### How do I obtain the second-best spanning tree?

First build an MST, then analyze non-tree edges against maximum-weight edges on their tree paths.
That is a separate algorithm requiring path-query support.

### What is the most common correctness mistake?

Checking only whether endpoints are directly adjacent in the partial forest instead of whether they belong to the same connected component.
DSU exists to answer the latter question.

### What should I study next?

Implement Prim's and Borůvka's algorithms, prove their safe-edge rules, and compare them across sparse, dense, parallel, and external-memory graph representations.
