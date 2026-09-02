# Directed Graphs: Asymmetric Edges, Reachability & Dependency Structure

![Directed graph edges and reachability](/images/dsa/directed-graphs-dark.png#dark)

## 1. Historical Context & Motivation

A directed graph models relationships that have orientation.

An edge from `A` to `B` does not automatically imply an edge from `B` to `A`.

That one-way nature is the reason directed graphs appear throughout computer science.

A compiler dependency points from a module to the module it imports.

A web link points from one page to another.

A control-flow edge points from one program block to a possible next block.

A payment transfer points from sender to receiver.

A task prerequisite points from a task to the work that must happen before it.

Undirected graphs are useful when relationships are symmetric.

Friendship in a simplified social graph is often treated that way.

Road connectivity without one-way streets can also be treated that way.

Directed graphs are needed when reversing an edge changes the meaning.

That semantic direction affects every algorithm built on the graph.

Reachability becomes asymmetric.

Cycles become meaningful feedback loops.

Strongly connected components describe regions where every vertex can reach every other vertex.

Directed acyclic graphs describe dependency structures with no circular requirements.

Topological sorting exists only because direction gives a before-after relationship.

The central question is:

How do one-way edges change traversal, ordering, cycle detection, and representation choices?

Directed graphs are not harder because their edges are complicated.

They are harder because every missing reverse edge is information.

Ignoring direction usually changes the problem.

## 2. Core Mathematical Invariants

A directed graph is written:

$$
G=(V,E)
$$

where $V$ is a set of vertices and $E$ is a set of ordered pairs.

An edge $(u,v)$ means there is an edge from $u$ to $v$.

The pair $(u,v)$ is distinct from $(v,u)$.

Both may exist.

Neither may exist.

Exactly one may exist.

The out-neighbors of vertex $u$ are:

$$
N^+(u)=\{v:(u,v)\in E\}.
$$

The in-neighbors of vertex $u$ are:

$$
N^-(u)=\{v:(v,u)\in E\}.
$$

The out-degree is $|N^+(u)|$.

The in-degree is $|N^-(u)|$.

Traversal from `u` follows outgoing edges unless an algorithm explicitly uses incoming edges.

Reachability is directional.

Vertex `v` is reachable from `u` if there is a directed path:

$$
u \to \cdots \to v.
$$

That does not imply `u` is reachable from `v`.

A directed cycle is a path that follows edge directions and returns to its starting vertex.

A graph with no directed cycle is a directed acyclic graph, or DAG.

In a DAG, at least one vertex has in-degree zero.

That fact powers Kahn's topological sorting algorithm.

A strongly connected component is a maximal set of vertices where every vertex can reach every other vertex in the set.

Inside an SCC, direction still matters locally.

From a component-level view, SCCs collapse into a DAG.

That condensation graph is always acyclic.

These invariants separate directed graph reasoning from undirected graph reasoning.

Direction defines flow.

Flow defines reachability.

Reachability defines components and order.

## 3. Step-by-Step Execution Trace

Consider this directed graph:

```text
A -> B
B -> C
C -> A
C -> D
D -> E
```

There is a cycle among `A`, `B`, and `C`.

Starting from `A`, follow outgoing edges.

Visit `B`.

From `B`, visit `C`.

From `C`, there is an edge back to `A`.

Because `A` is already on the active DFS stack, this edge proves a directed cycle.

The vertices `A`, `B`, and `C` are mutually reachable.

`A` reaches `D` through:

```text
A -> B -> C -> D
```

`D` does not reach `A`.

The graph therefore has one strongly connected component:

```text
{A, B, C}
```

and singleton components:

```text
{D}, {E}
```

Now collapse each SCC into one component node.

The component graph is:

```text
ABC -> D -> E
```

That graph is a DAG.

The original graph has a cycle.

The condensed graph does not.

Now consider a different graph:

```text
compile-parser -> compile-ast
compile-lexer -> compile-parser
compile-types -> compile-codegen
compile-ast -> compile-types
```

If edges mean "must happen before," this graph can be topologically sorted.

One valid order is:

```text
compile-lexer, compile-parser, compile-ast, compile-types, compile-codegen
```

Reversing the edge meaning would reverse the interpretation.

That is why directed graph APIs must document edge semantics.

An edge may mean "depends on."

It may mean "unblocks."

It may mean "calls."

The algorithms see the same ordered pairs, but the product meaning changes.

A useful second trace is reverse reachability.

In the first graph, the transpose reverses every edge:

```text
B -> A
C -> B
A -> C
D -> C
E -> D
```

Starting from `D` in the original graph reaches `E`.

Starting from `D` in the transpose reaches `C`, then `B`, then `A`.

That answers a different question.

Original reachability asks what `D` can affect.

Transpose reachability asks what can eventually affect `D`.

Many systems need both questions.

A service owner may ask which downstream services fail if this service fails.

The same owner may also ask which upstream services can send requests here.

Those are not interchangeable traversals.

## 4. Production-Ready Implementations

The representation below stores outgoing adjacency lists.

It also computes incoming degree when needed for topological sorting.

```python
from collections import deque
from collections.abc import Iterable, Mapping, Sequence


Graph = Mapping[str, Sequence[str]]


def vertices_of(graph: Graph) -> set[str]:
    vertices = set(graph)
    for neighbors in graph.values():
        vertices.update(neighbors)
    return vertices


def has_directed_cycle(graph: Graph) -> bool:
    vertices = vertices_of(graph)
    color = {vertex: "white" for vertex in vertices}

    def visit(vertex: str) -> bool:
        color[vertex] = "gray"
        for neighbor in graph.get(vertex, ()):
            if color[neighbor] == "gray":
                return True
            if color[neighbor] == "white" and visit(neighbor):
                return True
        color[vertex] = "black"
        return False

    return any(color[vertex] == "white" and visit(vertex) for vertex in vertices)


cyclic = {"A": ["B"], "B": ["C"], "C": ["A", "D"], "D": ["E"]}
acyclic = {
    "compile-lexer": ["compile-parser"],
    "compile-parser": ["compile-ast"],
    "compile-ast": ["compile-types"],
    "compile-types": ["compile-codegen"],
}

assert has_directed_cycle(cyclic)
assert not has_directed_cycle(acyclic)
```

Kahn's algorithm produces a topological order for a DAG.

It fails when a directed cycle prevents all vertices from being removed.

```python
def topological_order(graph: Graph) -> list[str]:
    vertices = vertices_of(graph)
    indegree = {vertex: 0 for vertex in vertices}
    for neighbors in graph.values():
        for neighbor in neighbors:
            indegree[neighbor] += 1

    ready = deque(sorted(vertex for vertex, degree in indegree.items() if degree == 0))
    order: list[str] = []

    while ready:
        vertex = ready.popleft()
        order.append(vertex)
        for neighbor in graph.get(vertex, ()):
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                ready.append(neighbor)

    if len(order) != len(vertices):
        raise ValueError("directed graph contains a cycle")
    return order


assert topological_order(acyclic) == [
    "compile-lexer",
    "compile-parser",
    "compile-ast",
    "compile-types",
    "compile-codegen",
]

try:
    topological_order(cyclic)
    raise AssertionError("cycle was not detected")
except ValueError:
    pass
```

Reachability from one source is a standard directed traversal.

```python
def reachable_from(graph: Graph, source: str) -> set[str]:
    seen = {source}
    stack = [source]
    while stack:
        vertex = stack.pop()
        for neighbor in graph.get(vertex, ()):
            if neighbor not in seen:
                seen.add(neighbor)
                stack.append(neighbor)
    return seen


assert reachable_from(cyclic, "A") == {"A", "B", "C", "D", "E"}
assert reachable_from(cyclic, "D") == {"D", "E"}
```

The implementation treats vertices that appear only as targets as real vertices with empty outgoing lists.

That policy avoids dropping sinks.

For deterministic topological output, the initial zero-indegree queue is sorted.

Production systems may choose priority queues, stable insertion order, or domain-specific ordering instead.

If an API exposes both `add_vertex` and `add_edge`, `add_edge(u, v)` should normally ensure both endpoints exist.

Otherwise target-only vertices disappear from counts, route generation, or visualization.

For weighted directed graphs, store `(neighbor, weight)` pairs rather than only neighbors.

For multigraphs, allow multiple edges between the same ordered pair.

For simple graphs, reject or collapse duplicate edges.

The representation choice should match the graph model promised by the API.

## 5. Asymptotic Time & Space Complexity

Let $V$ be the number of vertices.

Let $E$ be the number of directed edges.

With adjacency lists, DFS cycle detection visits each vertex once and examines each edge once.

Its time complexity is:

$$
O(V+E).
$$

The color table uses $O(V)$ space.

The recursion stack can use $O(V)$ space.

Kahn's topological sort also runs in $O(V+E)$ time.

Computing indegrees examines every edge.

Removing vertices from the ready queue visits every vertex once.

Decrementing indegrees examines every outgoing edge once.

The indegree table and queue use $O(V)$ space.

The output order uses $O(V)$ space.

Reachability from one source is $O(V+E)$ in the worst case.

It may visit less when the source reaches only a small region.

An adjacency matrix changes the cost.

Checking all outgoing neighbors of one vertex takes $O(V)$.

A full traversal then costs $O(V^2)$.

The matrix uses $O(V^2)$ memory.

That can be acceptable for dense graphs.

It is wasteful for sparse dependency graphs.

Directed graphs often need both incoming and outgoing edges.

Storing both doubles edge references but improves algorithms that repeatedly ask for predecessors.

The right representation depends on query shape.

If most operations follow outgoing flow, store outgoing lists.

If reverse reachability is frequent, store a transpose graph too.

Maintaining both directions has an update cost.

Adding edge `(u, v)` must update `out[u]` and `in[v]`.

Removing the edge must update both structures.

If one side is missed, algorithms disagree about the same graph.

Immutable graph snapshots avoid that class of bug.

Mutable graphs need tests around every edge mutation.

## 6. Systems Connections

Build systems are directed graph engines.

An edge records that one target depends on another target or must run before another target.

The exact edge direction must be documented because both conventions are common.

Package managers use directed dependency graphs.

Cycles can make installation, initialization, or version solving harder.

Compilers use directed control-flow graphs.

Each basic block points to possible successor blocks.

Optimizations such as dominance, liveness, and loop detection are built on those edges.

Web crawlers see the web as a directed graph of links.

PageRank originally exploited incoming and outgoing link structure.

Workflow engines use directed graphs to model task dependencies.

A DAG workflow can schedule every ready task whose prerequisites are complete.

A cycle means the workflow is waiting on itself.

Distributed systems use directed graphs for causal relationships.

An event may happen before another event.

Tracing systems model spans and parent-child relationships as directed structures.

Security tools use directed attack graphs.

One compromised asset may enable access to another asset.

Direction is the difference between "can reach" and "can be reached from."

That difference is critical for blast-radius analysis.

Directed graphs also appear in recommendation and ranking systems.

A follow edge on a social platform is usually directed.

A user can follow another user without being followed back.

That asymmetry changes degree statistics and centrality measures.

In data lineage systems, a directed edge may point from an input table to a derived table.

Impact analysis follows outgoing edges.

Root-cause analysis often follows incoming edges.

Again, the graph is the same shape, but the traversal question selects the direction.

## 7. Practice Checklist

- Define what an edge means before choosing an algorithm.
- Distinguish outgoing neighbors from incoming neighbors.
- Include sink vertices that only appear as targets.
- Use DFS colors for directed cycle detection.
- Do not reuse undirected parent-edge logic for directed cycles.
- Use topological sorting only on DAGs.
- Decide whether deterministic traversal order matters.
- Prefer adjacency lists for sparse graphs.
- Prefer matrices only when density or constant-time edge lookup justifies them.
- Store reverse adjacency when predecessor queries are common.
- Test one-way reachability explicitly.
- Test a graph with reciprocal edges.
- Test a directed cycle.
- Test a DAG with multiple valid topological orders.
- Test disconnected directed components.
- Document whether self-loops are allowed.
- Treat a self-loop as a directed cycle.
- Bound graph size for untrusted input.
- Avoid silently ignoring neighbor-only vertices.
- Explain edge direction in diagrams and API docs.
- Build a transpose graph when reverse reachability is a common operation.
- Keep incoming and outgoing adjacency updates consistent.
- Decide whether duplicate directed edges are legal.
- Decide whether edge weights are part of the graph model.
- Use SCC condensation to reason about cyclic regions as DAG nodes.

## 8. Frequently Asked Questions

### Is a directed edge just an arrow?

Mathematically, yes.

Practically, the arrow's meaning must be defined by the domain.

It may mean "calls," "depends on," "unblocks," "transfers to," or "links to."

### Does `A -> B` imply `B -> A`?

No.

The reverse edge exists only if it is explicitly present.

### What is a DAG?

A DAG is a directed graph with no directed cycles.

It is the standard model for dependency ordering.

### Why does topological sorting require a DAG?

A directed cycle creates a circular before-after requirement.

No linear order can satisfy it.

### What is a strongly connected component?

It is a maximal group of vertices where every vertex can reach every other vertex in the group.

### Is reachability symmetric in directed graphs?

No.

`u` may reach `v` even when `v` cannot reach `u`.

### Should I store incoming edges?

Store them if predecessor queries are frequent.

Otherwise compute indegrees or transpose graphs when needed.

### Can an isolated vertex exist in a directed graph?

Yes.

It has in-degree zero and out-degree zero.

It still belongs to the vertex set.

### What is the most common implementation bug?

Dropping vertices that appear only as edge targets.

Those vertices are sinks, not invalid data.
