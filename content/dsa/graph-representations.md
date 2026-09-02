# Graph Representations: Encoding Edges for the Operations You Actually Run

![Graph represented as a matrix and adjacency lists](/images/dsa/graph-representations-dark.png#dark)

## 1. Historical Context & Motivation

A graph is an abstract pair $G=(V,E)$.

Software cannot traverse an abstract set.

It needs a concrete encoding of vertices, edges, directions, weights, and multiplicity.

That encoding determines which operations are cheap.

An edge list stores the graph as records.

An adjacency list groups outgoing edges by source.

An adjacency matrix reserves one cell for every possible ordered pair.

A compressed sparse row structure packs adjacency lists into contiguous arrays.

No representation dominates every workload.

An adjacency matrix answers `has_edge(u, v)` in constant time.

It pays $\Theta(|V|^2)$ space even when almost every cell is empty.

An adjacency list uses $\Theta(|V|+|E|)$ space.

It enumerates a vertex's neighbors efficiently.

Testing one arbitrary edge may require scanning a whole neighbor list.

An edge list is ideal for sorting or streaming all edges.

It is poor for repeatedly asking which edges leave one vertex unless an index is built.

Representation choices therefore belong to algorithm design.

Breadth-first search needs repeated neighbor iteration.

Kruskal's algorithm wants one sortable edge sequence.

Dense dynamic programming over reachability can benefit from matrix rows or bitsets.

Static graph analytics often prefers compressed arrays for locality and low overhead.

The same logical graph can be losslessly converted among these forms when the model is known.

The model includes more than endpoints.

Directed and undirected graphs encode edges differently.

Weighted graphs need payloads.

Multigraphs may contain parallel edges.

Some applications distinguish self-loops.

A Boolean matrix cannot represent parallel edges without changing the cell type.

A careless conversion can silently discard information.

The central question is not “Which graph representation is best?”

It is:

Which representation makes the dominant operations cheap while preserving every graph property the application needs?

## 2. Core Mathematical Invariants

Let $n=|V|$ and $m=|E|$.

Assume vertices are mapped to integer identifiers in $[0,n)$.

For a directed graph, an edge $(u,v)$ leaves $u$ and enters $v$.

For an undirected graph, the unordered edge $\{u,v\}$ has no direction.

### Edge-list invariant

An edge list contains one record per logical directed edge.

For a simple directed graph:

$$
E_{list}=[(u_0,v_0),(u_1,v_1),\ldots,(u_{m-1},v_{m-1})].
$$

A weighted record may be `(u, v, weight)`.

For an undirected graph, choose one canonical endpoint order or document that records are unordered.

Storing both `(u, v)` and `(v, u)` in an edge list changes the record count and can double-count algorithms.

The representation invariant must say whether records are logical edges or directed arcs.

### Adjacency-list invariant

For every vertex $u$, `adj[u]` contains exactly the outgoing neighbors of $u$.

In a directed graph:

$$
\sum_{u\in V}|\operatorname{adj}[u]|=m.
$$

In a simple undirected graph stored symmetrically:

$$
\sum_{u\in V}|\operatorname{adj}[u]|=2m.
$$

This is the handshake identity in storage form.

Every non-loop undirected edge appears once in each endpoint's list.

A self-loop policy must define whether it contributes one or two stored entries.

### Matrix invariant

An unweighted adjacency matrix $A$ has shape $n\times n$.

For a simple directed graph:

$$
A_{uv}=\begin{cases}
1 & \text{if }(u,v)\in E,\\
0 & \text{otherwise.}
\end{cases}
$$

An undirected simple graph produces a symmetric matrix:

$$
A_{uv}=A_{vu}.
$$

The diagonal records self-loops.

For a multigraph, cells can store counts rather than Booleans.

For a weighted graph, a separate presence marker avoids confusing “no edge” with a valid zero-weight edge.

### Degree identities

In a directed adjacency list, `len(adj[u])` is the outdegree of $u$.

Indegree requires reverse lists, counters, or a scan over all outgoing entries.

For every directed graph:

$$
\sum_{u\in V}\deg^+(u)=\sum_{u\in V}\deg^-(u)=m.
$$

For an undirected graph without unusual loop accounting:

$$
\sum_{u\in V}\deg(u)=2m.
$$

These equalities are useful conversion checks.

### CSR invariant

Compressed sparse row stores two main arrays.

`offsets` has length $n+1$.

`neighbors` has one entry per stored arc.

Neighbors of vertex $u$ occupy:

$$
\operatorname{neighbors}[\operatorname{offsets}[u]:\operatorname{offsets}[u+1]].
$$

Offsets are monotone.

`offsets[0] = 0`.

`offsets[n] = len(neighbors)`.

This representation removes per-list object overhead.

It is compact and cache-friendly for static traversal.

Inserting an edge can require shifting a suffix, so mutation is expensive.

### Conversion must preserve semantics

A representation conversion is correct when it preserves vertex identity and every logical edge payload.

For directed graphs, direction must survive.

For weighted graphs, weights must survive.

For multigraphs, multiplicity must survive.

For algorithms whose output depends on neighbor order, either preserve order or define a canonical order.

Set-based adjacency loses insertion order but supports expected constant-time membership.

List-based adjacency preserves order and duplicates unless explicitly checked.

The chosen container becomes part of the representation contract.

## 3. Step-by-Step Execution Trace

Use the directed graph with vertices `0` through `4` and edges:

$$
E=\{(0,1),(0,3),(1,2),(2,0),(2,3),(3,4)\}.
$$

It has $n=5$ and $m=6$.

### Build the edge list

Read each input edge once.

The edge list is:

```text
[(0, 1), (0, 3), (1, 2), (2, 0), (2, 3), (3, 4)]
```

Every logical edge occupies one record.

The list supports a complete edge scan in six steps.

Finding all outgoing edges of vertex `2` requires inspecting every record without an index.

### Build adjacency lists

Allocate five empty lists.

Process `(0, 1)` and append `1` to `adj[0]`.

Process `(0, 3)` and append `3` to `adj[0]`.

Process `(1, 2)` and append `2` to `adj[1]`.

Process `(2, 0)` and append `0` to `adj[2]`.

Process `(2, 3)` and append `3` to `adj[2]`.

Process `(3, 4)` and append `4` to `adj[3]`.

The result is:

```text
0: [1, 3]
1: [2]
2: [0, 3]
3: [4]
4: []
```

The stored-entry count is $2+1+2+1+0=6=m$.

Outgoing neighbors of `2` are available directly as `[0, 3]`.

Testing whether `(2, 4)` exists requires scanning that two-element list.

### Build the adjacency matrix

Allocate a `5 × 5` grid initialized to zero.

For every edge `(u, v)`, set `matrix[u][v] = 1`.

The result is:

```text
    0 1 2 3 4
0:  0 1 0 1 0
1:  0 0 1 0 0
2:  1 0 0 1 0
3:  0 0 0 0 1
4:  0 0 0 0 0
```

The matrix contains 25 cells to represent six edges.

`matrix[2][3]` answers edge membership immediately.

Row `2` must still be scanned across five cells to enumerate its neighbors.

The matrix is not symmetric because the graph is directed.

For example, `matrix[0][1] = 1` while `matrix[1][0] = 0`.

### Pack adjacency into CSR

Concatenate adjacency rows:

```text
neighbors = [1, 3, 2, 0, 3, 4]
```

Record each row's starting position:

```text
offsets = [0, 2, 3, 5, 6, 6]
```

Vertex `0` uses `neighbors[0:2]`.

Vertex `1` uses `neighbors[2:3]`.

Vertex `2` uses `neighbors[3:5]`.

Vertex `3` uses `neighbors[5:6]`.

Vertex `4` uses `neighbors[6:6]`, an empty slice.

The final offset equals six, the stored-arc count.

### Traverse from vertex `0`

Breadth-first search reads adjacency rows.

Start with queue `[0]` and visited set `{0}`.

Read row `0`: discover `1` and `3`.

Queue becomes `[1, 3]`.

Read row `1`: discover `2`.

Queue becomes `[3, 2]`.

Read row `3`: discover `4`.

Queue becomes `[2, 4]`.

Read row `2`: neighbors `0` and `3` are already visited.

Read row `4`: no outgoing neighbors.

Traversal order is `[0, 1, 3, 2, 4]` for the stored neighbor order.

An adjacency list or CSR reads exactly the stored outgoing entries.

A matrix implementation examines all five cells for every visited vertex.

## 4. Production-Ready Implementations

The following builder makes direction and vertex count explicit.

It validates endpoints before mutating any representation.

```python
from dataclasses import dataclass
from typing import Iterable

Edge = tuple[int, int]


def validate_edges(vertex_count: int, edges: Iterable[Edge]) -> list[Edge]:
    if vertex_count < 0:
        raise ValueError("vertex_count must be nonnegative")

    materialized = list(edges)
    for source, target in materialized:
        if not (0 <= source < vertex_count and 0 <= target < vertex_count):
            raise ValueError(f"edge {(source, target)} has an invalid endpoint")

    return materialized


def adjacency_list(
    vertex_count: int,
    edges: Iterable[Edge],
    *,
    directed: bool,
) -> list[list[int]]:
    valid_edges = validate_edges(vertex_count, edges)
    result = [[] for _ in range(vertex_count)]

    for source, target in valid_edges:
        result[source].append(target)
        if not directed and source != target:
            result[target].append(source)

    return result


def adjacency_matrix(
    vertex_count: int,
    edges: Iterable[Edge],
    *,
    directed: bool,
) -> list[list[bool]]:
    valid_edges = validate_edges(vertex_count, edges)
    result = [[False] * vertex_count for _ in range(vertex_count)]

    for source, target in valid_edges:
        result[source][target] = True
        if not directed:
            result[target][source] = True

    return result
```

The Boolean matrix intentionally models a simple graph.

Repeated edges collapse into one true cell.

If multiplicity matters, replace Boolean cells with counts.

If weights matter, use edge payload records and a separate absent marker.

### CSR conversion

```python
@dataclass(frozen=True)
class CSRGraph:
    offsets: tuple[int, ...]
    neighbors: tuple[int, ...]

    @property
    def vertex_count(self) -> int:
        return len(self.offsets) - 1

    def neighbors_of(self, vertex: int) -> tuple[int, ...]:
        if not 0 <= vertex < self.vertex_count:
            raise IndexError("vertex is outside the graph")

        start = self.offsets[vertex]
        stop = self.offsets[vertex + 1]
        return self.neighbors[start:stop]


def to_csr(adjacency: list[list[int]]) -> CSRGraph:
    offsets = [0]
    neighbors: list[int] = []

    for row in adjacency:
        neighbors.extend(row)
        offsets.append(len(neighbors))

    return CSRGraph(tuple(offsets), tuple(neighbors))
```

Immutable tuples make accidental structural mutation impossible after packing.

A mutable CSR design needs insertion buffers or periodic rebuilding.

### Execute the shared trace

```python
edges = [(0, 1), (0, 3), (1, 2), (2, 0), (2, 3), (3, 4)]

adj = adjacency_list(5, edges, directed=True)
matrix = adjacency_matrix(5, edges, directed=True)
csr = to_csr(adj)

assert adj == [[1, 3], [2], [0, 3], [4], []]
assert matrix[2][3]
assert not matrix[3][2]
assert csr.offsets == (0, 2, 3, 5, 6, 6)
assert csr.neighbors == (1, 3, 2, 0, 3, 4)
assert csr.neighbors_of(2) == (0, 3)
assert sum(len(row) for row in adj) == len(edges)
```

### Membership-sensitive adjacency

When edge membership dominates and neighbor order is irrelevant, use sets per vertex.

Expected membership becomes $O(1)$.

Memory overhead rises because hash tables reserve spare capacity and store metadata.

Sorted vectors offer $O(\log \deg(u))$ membership with compact contiguous storage.

They make insertion more expensive.

The outer label “adjacency list” does not settle the inner-container trade-off.

## 5. Asymptotic Time & Space Complexity

Let $n=|V|$, $m=|E|$, and $d(u)$ be the outgoing degree of vertex $u$.

An edge list occupies $O(m)$ space.

Enumerating all edges costs $O(m)$.

Finding all neighbors of one vertex costs $O(m)$ without an index.

Testing one edge also costs $O(m)$ in the worst case.

An adjacency list occupies $O(n+m)$ space for a directed graph.

Enumerating neighbors of $u$ costs $O(d(u))$.

Membership in an unsorted vector costs $O(d(u))$.

Membership in a hash-set row is expected $O(1)$.

Membership in a sorted-vector row costs $O(\log d(u))$.

An adjacency matrix occupies $\Theta(n^2)$ cells.

Edge membership costs $O(1)$.

Enumerating neighbors of one vertex costs $O(n)$ because the row must be scanned.

Adding or removing an edge costs $O(1)$ once endpoint validation is complete.

CSR occupies $O(n+m)$ space.

Neighbor enumeration costs $O(d(u))$ with contiguous reads.

Arbitrary insertion may cost $O(n+m)$ because offsets and neighbor storage shift.

| Operation | Edge list | List adjacency | Matrix | CSR |
|---|---:|---:|---:|---:|
| Space | $O(m)$ | $O(n+m)$ | $O(n^2)$ | $O(n+m)$ |
| Enumerate all edges | $O(m)$ | $O(n+m)$ | $O(n^2)$ | $O(n+m)$ |
| Enumerate neighbors of $u$ | $O(m)$ | $O(d(u))$ | $O(n)$ | $O(d(u))$ |
| Test edge $(u,v)$ | $O(m)$ | $O(d(u))$ | $O(1)$ | $O(d(u))$ |
| Append an edge | $O(1)$ amortized | $O(1)$ amortized | $O(1)$ | Expensive |

For undirected adjacency, stored arcs are usually $2m$.

The asymptotic space remains $O(n+m)$.

Constants matter at graph scale.

Millions of small list and integer objects can consume far more memory than two packed integer arrays.

A bit matrix uses $n^2$ bits rather than $n^2$ byte-sized or object-sized cells.

Bitwise row operations can process many potential neighbors per machine word.

Density alone does not decide the representation.

Workload, mutation frequency, payloads, and hardware locality matter too.

## 6. Systems Connections

### Graph databases

Graph databases need fast neighborhood expansion and mutable relationships.

They often maintain endpoint indexes plus adjacency-like edge groupings.

Persistence, transaction visibility, and property payloads make the physical layout more complex than a classroom vector of vectors.

The same operation-first reasoning still applies.

### Routing and dependency systems

Routing tables and build graphs frequently traverse outgoing dependencies.

Sparse adjacency is a natural fit because each node touches a small fraction of all possible nodes.

Reverse dependency queries require reverse adjacency as a separate index.

Scanning the whole graph for predecessors is usually unacceptable.

### Static analytics

Analytics engines process large immutable snapshots.

CSR reduces pointer chasing and keeps each vertex's neighbors contiguous.

Parallel workers can divide vertex ranges using offsets.

Skewed high-degree vertices still create load imbalance.

Partitioning policy remains important.

### Dense Boolean algorithms

Transitive closure, triangle detection, and frontier propagation can exploit bitset rows.

Intersecting two neighbor sets becomes a sequence of machine-word `AND` operations.

This can beat pointer-heavy lists well before a graph reaches mathematical density.

### Serialization boundaries

Edge lists are simple interchange formats.

They stream naturally and do not require knowing all row offsets in advance.

Consumers can build workload-specific indexes after loading.

For repeated startup, storing a prebuilt CSR snapshot avoids reconstruction cost.

Version the file format and record direction, weight type, and vertex mapping.

### Security and validation

Untrusted graph input can claim huge vertex identifiers or matrix dimensions.

Validate bounds before allocating $n^2$ cells.

Impose resource limits appropriate to the representation.

Duplicate edges may amplify work even when they do not change simple-graph semantics.

Normalize or reject them according to the contract.

## 7. Practice Checklist

- State whether the graph is directed.
- State whether parallel edges are allowed.
- State whether self-loops are allowed.
- Define the weight or payload type.
- Distinguish absent edges from zero-weight edges.
- Map external vertex labels to bounded internal identifiers.
- Validate every endpoint before insertion.
- Choose logical-edge or stored-arc counting consistently.
- Use degree-sum identities as conversion checks.
- Choose edge lists for whole-edge scans and sorting.
- Choose adjacency lists for sparse neighborhood traversal.
- Choose matrices for dense constant-time membership workloads.
- Choose CSR for static compact traversal.
- Consider bitsets for dense Boolean set operations.
- Decide whether neighbor order is meaningful.
- Decide whether duplicate neighbor entries are meaningful.
- Use sets only when their memory cost and unordered iteration are acceptable.
- Use sorted vectors when compact membership queries dominate mutation.
- Build reverse adjacency for frequent predecessor queries.
- Avoid scanning every edge to compute repeated indegrees.
- Test a graph with isolated vertices.
- Test a graph with one vertex and a self-loop.
- Test directed asymmetry.
- Test an undirected symmetry invariant.
- Test duplicate-edge handling.
- Test zero-weight edges separately from missing edges.
- Verify CSR offsets are monotone.
- Verify the final CSR offset equals stored-neighbor count.
- Measure real memory usage, not only asymptotic notation.
- Revisit representation when the graph becomes static or dynamic.

## 8. Frequently Asked Questions

### Which graph representation should I use for BFS?

For a sparse graph, an adjacency list or CSR usually fits best because BFS repeatedly enumerates outgoing neighbors.

A matrix makes each visited vertex scan all $n$ possible neighbors.

### Is an adjacency list always implemented with linked lists?

No.

The name describes grouping by vertex, not the inner container.

Dynamic arrays, sets, sorted vectors, and packed CSR slices are common choices.

### Why does an undirected adjacency list use twice as many entries?

Each non-loop edge must be discoverable from both endpoints.

Storing one arc in each endpoint's row gives $2m$ stored arcs for $m$ logical edges.

### Can a Boolean matrix represent weighted edges?

Not by itself.

A weighted matrix needs payload cells plus an unambiguous representation of absence.

Zero cannot mean “absent” when zero-weight edges are valid.

### When is an adjacency matrix reasonable?

It fits dense graphs, small bounded vertex sets, and workloads dominated by arbitrary edge-membership queries or bit-parallel row operations.

It is usually wasteful for large sparse graphs.

### Why is CSR hard to update?

Rows share one contiguous neighbor array.

Inserting into one row can shift later entries and change every later offset.

CSR trades mutation convenience for compact static traversal.

### Does neighbor order affect graph correctness?

It does not change reachability, but it can change deterministic traversal order, chosen DFS trees, tie outcomes, and serialized results.

Define or normalize order when reproducibility matters.

### How should multigraphs be represented?

Use edge records or adjacency entries that retain a distinct edge identifier and payload.

A Boolean matrix collapses parallel edges and is therefore lossy.

### What is the best representation for Kruskal's algorithm?

Kruskal primarily sorts and scans all weighted edges.

An edge list directly matches that access pattern.

### Should I store both outgoing and incoming adjacency?

Do so when both successor and predecessor queries are frequent and the extra $O(n+m)$ space is acceptable.

Otherwise derive the less common direction when needed.

### How do I detect a broken conversion?

Compare vertex counts, edge counts, degree sums, direction, weights, multiplicities, and self-loop policy.

Then round-trip small randomized graphs and compare normalized logical edge multisets.
