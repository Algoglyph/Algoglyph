# Minimum Spanning Trees with Union–Find: Kruskal's Connectivity Engine

![MST with union-find](/images/dsa/mst-union-find-dark.jpg#dark)

Union–find turns Kruskal's cycle test from repeated graph traversal into near-constant amortized partition updates.
The minimum-spanning-tree proof still comes from safe edges and cuts.
The data structure supplies an efficient implementation of the evolving forest invariant.

## 1. Historical Context & Motivation

### The algorithmic partnership

Kruskal's algorithm scans undirected edges by increasing weight.
It accepts an edge when that edge joins two different components of the partial forest.

The expensive question is repeated connectivity:

```text
Are u and v already connected by accepted edges?
```

Running DFS for every edge can cost $O(EV)$ or worse depending on representation.
Disjoint-set union answers the question without storing the forest paths explicitly.

### Partition rather than topology

For cycle prevention, Kruskal does not need the exact accepted path between two vertices.
It only needs to know whether both vertices belong to the same connected component.

DSU maintains exactly that partition.
Each set has one representative.
`find(v)` returns the representative.
`union(u,v)` merges representatives when they differ.

### Optimizations

A parent-pointer forest implements the sets.
Two classic optimizations keep it shallow:

- union by size or rank attaches the smaller tree under the larger;
- path compression rewrites visited parent pointers toward the root.

Together they give $O(\alpha(V))$ amortized time per operation, where $\alpha$ is the inverse Ackermann function.

### Scope

This article focuses on the DSU machinery inside Kruskal and the invariant connecting both structures.
The broader MST cut proof remains essential.
Union–find alone does not choose minimum-weight edges.

### Problem statement

Given weighted undirected graph $G=(V,E)$, compute an MST if connected or a minimum spanning forest otherwise.
Return selected edges, total weight, and enough status to distinguish tree from forest.

## 2. Core Mathematical Invariants

### Accepted-edge forest

Let $A$ be accepted edges.
Initially $A=\varnothing$.
At every step, $(V,A)$ is acyclic.

If endpoints have different DSU representatives, adding the edge joins two trees and remains acyclic.
If representatives match, an accepted path already exists and the edge would close a cycle.

### Partition correspondence

For every vertices $u,v$:

$$
find(u)=find(v)
$$

if and only if $u$ and $v$ are connected in $(V,A)$.

This correspondence is initialized by singleton sets.
Every successful edge acceptance and DSU union preserves it.

### Parent forest

Every DSU element stores a parent.
A representative is a root satisfying

$$
parent[root]=root.
$$

Following parents must terminate at exactly one root.
Parent pointers must never form a directed cycle among distinct nodes.

### Union by size

Store `size[root]` as the number of elements represented by that root.
On union, attach the smaller root beneath the larger root.
Update only the surviving root's size.

Without path compression, a node's depth increases only when its tree at least doubles.
Its depth is therefore $O(\log V)$.

### Path compression

During `find(x)`, discover the root, then redirect nodes on the traversed path to that root.
Set membership does not change.
Future finds become shorter.

Size values on nonroots are irrelevant.
Only roots carry authoritative set size.

### Safe-edge invariant

Before accepting an edge, $A$ is contained in some minimum spanning forest.
For edge $(u,v)$ joining distinct components, take the cut defined by $u$'s DSU component.

The scan's nondecreasing order makes the edge a light eligible crossing edge.
The cut property says it is safe.
After acceptance, the invariant continues to hold.

### Edge-count invariant

Every successful union reduces component count by one and adds one selected edge.
Thus

$$
|A|=|V|-components.
$$

For a connected graph, completion has one component and $|V|-1$ edges.

### Equal weights

Equal-weight crossing edges can all be safe alternatives.
DSU and tie order select one valid MST among possibly many.
Deterministic endpoint tie-breaking provides reproducibility, not uniqueness.

### Invalid directed use

DSU connectivity is symmetric.
It does not model directed reachability.
Kruskal and this invariant apply to undirected MSTs, not directed arborescences.

## 3. Step-by-Step Execution Trace

### Graph

Use vertices `A` through `E` and edges:

```text
A-B 1
B-C 2
A-C 3
C-D 4
B-D 5
D-E 6
C-E 7
```

Edges are already sorted by weight.

### Initialize

DSU sets are:

```text
{A} {B} {C} {D} {E}
```

Component count is five.
Selected edge count is zero.

### Process A-B

`find(A)` and `find(B)` differ.
Accept weight-one edge.
Union the two singleton sets.

```text
{A,B} {C} {D} {E}
cost = 1
```

### Process B-C

B belongs to `{A,B}` and C is separate.
Accept weight-two edge.
Attach C's root under the larger component root.

```text
{A,B,C} {D} {E}
cost = 3
```

### Process A-C

Both finds return the same representative.
Accepted edges already contain path `A-B-C`.
Reject `A-C`; otherwise it would create a cycle.

Cost remains three.

### Process C-D

C and D have different representatives.
Accept weight-four edge and union.

```text
{A,B,C,D} {E}
cost = 7
```

### Process B-D

Path compression may make both B and D point directly to the component root.
Their representatives match.
Reject weight-five edge.

### Process D-E

E remains separate.
Accept weight-six edge and union.

```text
{A,B,C,D,E}
cost = 13
```

Four edges are selected for five vertices.
Stop.

### Result

Selected edges are:

```text
A-B, B-C, C-D, D-E
```

Total weight is thirteen.
The DSU has one component.

### Path compression trace

Suppose parent chain before a find is `E -> D -> A`.
Finding E first discovers root A.
Compression rewrites E directly to A and can rewrite D to A.

The represented set does not change.
Later finds traverse fewer pointers.

### Disconnected case

Remove both edges incident to E.
The scan ends with components `{A,B,C,D}` and `{E}`.
Three edges are selected, equal to $5-2$.
The result is a minimum spanning forest with two components.

## 4. Production-Ready Implementations

### Python implementation

```python
from dataclasses import dataclass
from typing import Hashable, TypeVar


V = TypeVar("V", bound=Hashable)


@dataclass(frozen=True)
class Edge:
    weight: int
    u: V
    v: V


class DisjointSet:
    def __init__(self, vertices: list[V]) -> None:
        self.parent = {vertex: vertex for vertex in vertices}
        self.size = {vertex: 1 for vertex in vertices}
        self.components = len(vertices)

    def find(self, vertex: V) -> V:
        if vertex not in self.parent:
            raise KeyError(vertex)
        root = vertex
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[vertex] != vertex:
            next_vertex = self.parent[vertex]
            self.parent[vertex] = root
            vertex = next_vertex
        return root

    def union(self, a: V, b: V) -> bool:
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


def minimum_spanning_forest(vertices: list[V], edges: list[Edge]) -> tuple[list[Edge], int, int]:
    unique = list(dict.fromkeys(vertices))
    dsu = DisjointSet(unique)
    chosen: list[Edge] = []
    total = 0

    for edge in sorted(edges, key=lambda item: item.weight):
        if edge.u not in dsu.parent or edge.v not in dsu.parent:
            raise ValueError("edge references undeclared vertex")
        if dsu.union(edge.u, edge.v):
            chosen.append(edge)
            total += edge.weight
            if dsu.components == 1:
                break
    return chosen, total, dsu.components


vertices = list("ABCDE")
edges = [Edge(1,"A","B"), Edge(2,"B","C"), Edge(3,"A","C"),
         Edge(4,"C","D"), Edge(5,"B","D"), Edge(6,"D","E"),
         Edge(7,"C","E")]
chosen, cost, components = minimum_spanning_forest(vertices, edges)
assert cost == 13 and len(chosen) == 4 and components == 1
```

### Iterative find

The implementation avoids recursive `find` so a malformed or unoptimized deep chain cannot overflow the call stack.
Union by size prevents deep valid chains, but iterative code is still straightforward.

### Stable output

For deterministic equal weights, sort by `(weight, normalized_u, normalized_v)` when vertices have a stable total order.
Do not compare arbitrary heterogeneous identifiers unless the language defines it.

### Overflow

Total MST weight can exceed one edge's numeric range.
Use a wider accumulator or checked addition.
Negative weights are valid.

### Validation

Independently verify selected edges are input edges, acyclic, and span every original connected component.
Compare total weight with Prim on random connected graphs.
Brute-force all spanning trees for tiny graphs.

## 5. Asymptotic Time & Space Complexity

### Sorting

Sorting $E$ edges costs

$$
O(E\log E).
$$

This dominates ordinary Kruskal execution.

### DSU operations

There are at most two finds and one union per edge.
With both optimizations, total DSU time is

$$
O(E\alpha(V)).
$$

The inverse Ackermann factor is tiny but not formally constant.

### Total

Overall time is

$$
O(E\log E+E\alpha(V))=O(E\log E).
$$

If edges arrive sorted, processing is $O(E\alpha(V))$.

### Space

Parent and size maps use $O(V)$.
Selected edges use $O(V)$.
Edge sorting uses implementation-dependent auxiliary storage up to $O(E)$.

### Without optimizations

Arbitrary union can create a chain of length $V$.
One find can then cost $O(V)$.
Union by size alone gives $O(\log V)$ finds.
Path compression plus ranked union gives the inverse-Ackermann amortized bound.

### Dense graphs

For $E=\Theta(V^2)$, sorting costs $O(V^2\log V)$.
An adjacency-matrix Prim algorithm can run in $O(V^2)$ and may be more appropriate.

## 6. Systems Connections

### Offline connectivity

Sort edges by threshold and union them as the threshold increases.
Queries asking whether vertices are connected below a cost can be sorted and answered alongside edges.

### Clustering

Kruskal's component evolution supports single-linkage clustering.
Stop when a desired number of components remains or cut heavy MST edges.
Chaining effects can join elongated groups.

### Image segmentation

Pixels or regions become vertices and similarity costs become edges.
Component merging resembles Kruskal, but domain-specific thresholds decide when to stop.

### Rollback DSU

Offline dynamic connectivity may need undo.
Ordinary path compression is difficult to roll back because it changes many pointers.
Rollback DSU often uses union by size without compression and records changes on a stack.

### Parallelism

Global sorted processing and shared representatives create synchronization.
Borůvka-style phases expose more parallel component merges.
Parallel Kruskal variants partition edges and reconcile forests carefully.

### Security

Validate endpoints and edge counts.
Bound allocations.
Use overflow-safe comparators and weight accumulation.
Predictable vertex hashing may need collision defenses.

### Certifying the result

A returned tree can carry a lightweight structural certificate.
List its selected edges and total weight.
Verify with a fresh DSU that those edges are acyclic and connect each original component.

Optimality needs more than structural validity.
For every non-tree edge $(u,v,w)$, inspect the maximum edge weight on the unique tree path from $u$ to $v$.
If that maximum exceeds $w$, replacing it would create a cheaper spanning tree.

After preprocessing tree paths for maximum-edge queries, this cycle-property check can validate optimality efficiently.
It is independent of the DSU state used during construction.

Keeping construction and verification separate catches implementation errors in sorting, union decisions, and weight accumulation.
For critical outputs, prefer an independently implemented verifier over reusing the same helper functions.

Record the component count when the source graph is disconnected.
A structurally valid forest must span every source component, not arbitrarily leave connectable vertices apart.

## 7. Practice Checklist

### DSU

- Initialize every vertex.
- Root points to itself.
- Find returns a root.
- Compress traversed paths.
- Union roots only.
- Attach smaller set below larger.
- Update surviving size.
- Decrement component count once.

### Kruskal

- Treat graph as undirected.
- Sort by nondecreasing weight.
- Validate endpoints.
- Accept only distinct representatives.
- Union immediately after acceptance.
- Stop at one component when connected.
- Report forest status otherwise.

### Tests

- Empty graph.
- One vertex.
- One edge.
- Tree input.
- One cycle.
- Parallel edges.
- Self-loops.
- Negative weights.
- Equal weights.
- Disconnected graph.

### Validation

- Edge count equals $V-c$.
- DSU components match selected forest.
- No selected cycle exists.
- Original components are spanned.
- Cost matches Prim.
- Tiny graphs match brute force.

### Engineering

- Use wide total weight.
- Define tie determinism.
- Avoid recursive deep find.
- Define vertex identity.
- Pre-size maps when useful.
- Do not reuse stale DSU across runs.

## 8. Frequently Asked Questions

### What does union–find contribute?

It tracks connected components of accepted edges so cycle tests are near-constant amortized time.

### Does DSU prove minimum weight?

No.
Sorting plus the cut property proves safe choices; DSU only enforces forest connectivity.

### Why compare representatives?

Equal representatives mean an accepted path already connects the endpoints, so another edge would form a cycle.

### Why path compression?

It redirects traversed nodes toward the root and speeds future finds without changing set membership.

### Why union by size?

It prevents small trees from becoming parents of large ones and controls depth.

### Can weights be negative?

Yes.
Kruskal relies on ordering, not nonnegativity.

### What happens on disconnected input?

It returns one minimum tree per connected component: a minimum spanning forest.

### Is the MST unique?

Not necessarily.
Equal-weight alternatives can produce several MSTs with equal total cost.

### Can DSU handle directed reachability?

No.
It represents symmetric connectivity, not directional paths.

### Why not compress paths in rollback DSU?

Compression changes many parents, making undo expensive.
Rollback variants prefer easily recorded ranked unions.

### What is the most common bug?

Unioning original vertices instead of their roots or failing to update component count only on successful merges.

### What should I study next?

Study Prim, Borůvka, rollback DSU, offline connectivity, and second-best spanning trees.
