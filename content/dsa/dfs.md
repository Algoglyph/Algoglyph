# Depth-First Search: Stack Discipline, Discovery Order & Backtracking Invariants

![Depth-first search traversal stack](/images/dsa/dfs-dark.png#dark)

## 1. Historical Context & Motivation

Depth-first search explores a graph by going as far as possible along one path before backtracking.

It is one of the basic graph traversal algorithms.

The idea is older than modern programming language libraries because it is also a natural manual search strategy.

Enter a maze, keep following unexplored corridors, and backtrack when a corridor is exhausted.

That is DFS.

Breadth-first search spreads outward by distance layers.

DFS dives through adjacency choices and uses a stack of unfinished work.

The stack can be explicit.

It can also be the program call stack through recursion.

DFS is not only a way to visit all vertices.

It is a framework for reasoning about reachability, connected components, cycle detection, topological ordering, articulation points, bridges, strongly connected components, and backtracking search.

Many advanced algorithms are DFS plus extra state.

That extra state might be discovery time.

It might be low-link values.

It might be parent pointers.

It might be recursion-stack membership.

The shared mechanism is the same: a vertex is active while its unexplored descendants are being processed.

DFS is useful when structure depends on ancestry.

In a dependency graph, a back edge to an active ancestor signals a cycle.

In a tree, entering and leaving times encode ancestor relationships.

In a puzzle search, recursive DFS naturally represents choices and undo steps.

The central question is:

How does stack-based exploration turn local adjacency lists into global structure?

## 2. Core Mathematical Invariants

Let $G=(V,E)$ be a graph.

DFS maintains a visited set.

Once a vertex enters the visited set, it is never entered again.

That prevents infinite traversal on cyclic graphs.

In recursive DFS, the active call stack represents the current path from the DFS root to the current vertex.

Every vertex on that stack has been discovered but not finished.

Every finished vertex has had all outgoing adjacency choices examined.

This gives the color invariant:

`white` vertices are undiscovered.

`gray` vertices are discovered and active.

`black` vertices are finished.

For directed cycle detection, an edge from a gray vertex to a gray ancestor is a back edge.

That edge proves a directed cycle.

For undirected graphs, the parent edge must be ignored.

Otherwise every tree edge would look like a cycle when seen in reverse.

DFS also defines discovery and finish times.

When a vertex is first entered, assign `tin[v]`.

When all its descendants are processed, assign `tout[v]`.

For a DFS tree, vertex `u` is an ancestor of vertex `v` exactly when:

$$
tin[u]\le tin[v] < tout[v]\le tout[u].
$$

The strict nesting comes from stack discipline.

A child must finish before its parent finishes.

DFS forest construction handles disconnected graphs.

A full graph traversal starts DFS from every still-unvisited vertex.

Each start creates one DFS tree.

Together those trees form a DFS forest.

The algorithm's correctness depends on checking visited before descending.

If the check happens after recursion, cyclic graphs can overflow the stack.

The invariant is simple but unforgiving:

Mark a vertex as discovered before exploring its neighbors.

Then every directed edge is examined from a known traversal state.

## 3. Step-by-Step Execution Trace

Consider this directed graph:

```text
A -> B
A -> C
B -> D
B -> E
C -> F
E -> C
```

Use adjacency order as written.

Start DFS at `A`.

Mark `A` gray.

The stack is:

```text
[A]
```

Visit `B` from `A`.

Mark `B` gray.

The stack is:

```text
[A, B]
```

Visit `D` from `B`.

Mark `D` gray.

`D` has no outgoing neighbors.

Finish `D`.

The stack returns to:

```text
[A, B]
```

Now visit `E` from `B`.

Mark `E` gray.

The stack is:

```text
[A, B, E]
```

`E` points to `C`.

`C` is still white.

Visit `C`.

The stack becomes:

```text
[A, B, E, C]
```

`C` points to `F`.

Visit `F`.

The stack becomes:

```text
[A, B, E, C, F]
```

`F` has no outgoing neighbors.

Finish `F`.

Return to `C`.

`C` has no more neighbors.

Finish `C`.

Return to `E`.

Finish `E`.

Return to `B`.

Finish `B`.

Return to `A`.

Now inspect `A -> C`.

`C` is already black.

DFS does not recurse again.

Finish `A`.

One valid discovery order is:

```text
A, B, D, E, C, F
```

One valid finish order is:

```text
D, F, C, E, B, A
```

The finish order is not arbitrary.

Descendants finish before ancestors.

That property is why reversing DFS finish order can produce a topological order in a directed acyclic graph.

Now add discovery and finish times conceptually.

`A` receives the first discovery time.

`D` receives an early finish time because it has no descendants.

`A` receives the last finish time because all explored work is nested inside its call.

The intervals for `B`, `E`, `C`, and `F` nest according to the stack.

Those intervals let later algorithms ask ancestry questions in constant time after traversal.

If `tin[B] <= tin[F] < tout[F] <= tout[B]`, then `B` is an ancestor of `F` in the DFS tree.

If two intervals are disjoint, neither vertex is an ancestor of the other in that tree.

## 4. Production-Ready Implementations

Recursive DFS is concise and mirrors the mathematical description.

It is best when recursion depth is known to be safe.

```python
from collections.abc import Mapping, Sequence


Graph = Mapping[str, Sequence[str]]


def dfs_recursive(graph: Graph) -> tuple[list[str], list[str]]:
    visited: set[str] = set()
    discovery_order: list[str] = []
    finish_order: list[str] = []

    def visit(vertex: str) -> None:
        visited.add(vertex)
        discovery_order.append(vertex)
        for neighbor in graph.get(vertex, ()):
            if neighbor not in visited:
                visit(neighbor)
        finish_order.append(vertex)

    for vertex in graph:
        if vertex not in visited:
            visit(vertex)

    return discovery_order, finish_order


graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [],
    "E": ["C"],
    "F": [],
}

discovered, finished = dfs_recursive(graph)
assert discovered == ["A", "B", "D", "E", "C", "F"]
assert finished == ["D", "F", "C", "E", "B", "A"]
```

For large graphs, an explicit stack avoids recursion depth limits.

The implementation below preserves finish-order behavior by storing an iterator index with each stack frame.

```python
def dfs_iterative(graph: Graph) -> tuple[list[str], list[str]]:
    visited: set[str] = set()
    discovery_order: list[str] = []
    finish_order: list[str] = []

    for start in graph:
        if start in visited:
            continue
        visited.add(start)
        discovery_order.append(start)
        stack: list[tuple[str, int]] = [(start, 0)]

        while stack:
            vertex, index = stack[-1]
            neighbors = graph.get(vertex, ())
            if index >= len(neighbors):
                finish_order.append(vertex)
                stack.pop()
                continue

            neighbor = neighbors[index]
            stack[-1] = (vertex, index + 1)
            if neighbor not in visited:
                visited.add(neighbor)
                discovery_order.append(neighbor)
                stack.append((neighbor, 0))

    return discovery_order, finish_order


assert dfs_iterative(graph) == dfs_recursive(graph)
```

Directed cycle detection uses the gray/black distinction.

```python
def has_directed_cycle(graph: Graph) -> bool:
    color: dict[str, str] = {vertex: "white" for vertex in graph}

    def visit(vertex: str) -> bool:
        color[vertex] = "gray"
        for neighbor in graph.get(vertex, ()):
            state = color.get(neighbor, "white")
            if state == "gray":
                return True
            if state == "white":
                color[neighbor] = "white"
                if visit(neighbor):
                    return True
        color[vertex] = "black"
        return False

    for vertex in graph:
        if color[vertex] == "white" and visit(vertex):
            return True
    return False


assert not has_directed_cycle(graph)
assert has_directed_cycle({"A": ["B"], "B": ["C"], "C": ["A"]})
```

Production code should decide how to handle vertices that appear only as neighbors.

The examples treat them as implicit vertices with empty adjacency lists.

For deterministic output, normalize adjacency ordering before traversal.

For huge graphs, stream edges into an adjacency representation that fits the workload.

For untrusted graphs, bound recursion, node count, and edge count.

If graph construction happens separately from traversal, validate it before DFS begins.

A missing adjacency entry can be harmless when treated as an empty list.

It can also hide a data-ingestion bug.

The right behavior depends on whether the graph is closed by contract.

Library functions should document that choice.

## 5. Asymptotic Time & Space Complexity

Let $V$ be the number of vertices.

Let $E$ be the number of edges represented in adjacency lists.

DFS discovers each vertex at most once.

It examines each adjacency-list entry once.

The total running time is:

$$
O(V+E).
$$

This bound assumes adjacency lists.

With an adjacency matrix, checking all possible neighbors costs $O(V)$ per vertex.

The traversal then costs $O(V^2)$.

The visited set uses $O(V)$ space.

The recursion stack or explicit stack uses $O(V)$ space in the worst case.

The discovery and finish lists each use $O(V)$ space when stored.

If output is streamed instead of stored, those lists can be avoided.

The worst-case stack depth is $V$.

A path graph creates that worst case.

Recursive DFS may overflow the language call stack long before memory is exhausted.

An explicit stack is safer for deep or adversarial graphs.

DFS does not guarantee shortest paths in unweighted graphs.

Breadth-first search gives shortest edge counts.

DFS gives reachability and structural ancestry information.

Choosing between them is about the invariant needed by the downstream algorithm.

## 6. Systems Connections

DFS is the skeleton inside many compilers and build tools.

Dependency cycle detection is directed DFS with gray-stack checks.

Topological sorting is DFS finish order on a DAG.

Garbage collectors use graph traversal to discover reachable objects.

Some collectors use DFS-like stacks.

File-system walkers often behave like DFS when they descend into directories before scanning siblings.

Web crawlers may use DFS for focused exploration, though breadth and politeness constraints usually dominate production crawling.

Model checkers and search engines use DFS variants to explore state spaces.

Backtracking solvers use recursive DFS to choose, recurse, and undo.

Tarjan's strongly connected components algorithm extends DFS with low-link values.

Bridge and articulation-point algorithms extend DFS with discovery times and subtree reachability.

Maze generation and solving algorithms often use randomized DFS.

The common systems concern is resource control.

A recursive traversal over user-provided structure can blow the call stack.

An unbounded graph can consume memory in the visited set.

A cyclic graph without visited marking can loop forever.

Production graph traversal therefore needs explicit limits, cancellation, and observability.

DFS is simple enough to write quickly.

That makes it easy to underestimate.

The correctness of the algorithms built on it depends on exactly when vertices become discovered, active, and finished.

Observability also matters in production traversals.

For a large dependency graph, record how many vertices were reached.

Record the maximum stack depth.

Record whether traversal stopped because of cancellation or a configured limit.

Those measurements distinguish a real disconnected graph from a traversal that silently bailed out.

## 7. Practice Checklist

- Mark a vertex visited before exploring its neighbors.
- Use an explicit color state when active-stack information matters.
- Do not use DFS for unweighted shortest paths.
- Iterate over all vertices to cover disconnected graphs.
- Decide how to handle neighbor-only vertices.
- Normalize adjacency order when deterministic output is required.
- Track parent edges separately in undirected cycle detection.
- Use an explicit stack for very deep graphs.
- Store iterator state if iterative DFS must produce finish order.
- Test a single isolated vertex.
- Test a disconnected graph.
- Test a directed cycle.
- Test an undirected tree.
- Test a graph with cross edges.
- Test a graph where a neighbor appears before its own key.
- Confirm discovery order expectations depend on adjacency order.
- Confirm finish order places descendants before ancestors.
- Bound graph size for untrusted inputs.
- Add cancellation for long-running traversals.
- Document whether traversal mutates graph state.
- Track discovery and finish times when ancestry checks are required.
- Measure maximum stack depth for operational safety.
- Make implicit-neighbor handling an explicit API choice.
- Keep graph construction validation separate from DFS traversal.
- Prefer adjacency lists for sparse graphs.

## 8. Frequently Asked Questions

### Is DFS recursive by definition?

No.

Recursive DFS is common, but an explicit stack implements the same traversal discipline.

### Does DFS find the shortest path?

Not in general.

Use BFS for shortest paths in unweighted graphs.

Use Dijkstra or another weighted shortest-path algorithm when edge weights matter.

### Why do we need a visited set?

Graphs can contain cycles.

Without visited marking, DFS may revisit the same vertices forever.

### What is the difference between visited and finished?

A visited vertex has been discovered.

A finished vertex has had all outgoing neighbors processed.

The distinction matters for cycle detection and finish-order algorithms.

### Why does adjacency order matter?

DFS chooses the next unexplored neighbor from the adjacency list.

Different list orders can produce different valid traversal trees.

### How does DFS detect cycles in directed graphs?

An edge to a gray vertex reaches an active ancestor.

That proves a directed cycle.

### Why is undirected cycle detection different?

Every undirected tree edge appears in both directions.

The reverse edge to the parent must be ignored.

### When should I avoid recursive DFS?

Avoid it for very deep graphs, adversarial inputs, or runtimes with small call-stack limits.

An explicit stack gives better control.

### What is the main DFS invariant?

The active stack represents the current path, and every finished vertex has fully processed its reachable descendants under that DFS tree.
