# Topological Sort: Dependency Order, Cycle Proofs & Incremental Scheduling

![Topological ordering of a directed acyclic graph](/images/dsa/topological-sort-dark.png)

## 1. Historical Context & Motivation

Dependencies turn a collection of tasks into a partial order.
A compiler must process prerequisites before dependent modules.
A build system must finish inputs before targets.
A course plan must place prerequisites before advanced classes.
A topological sort converts those constraints into one valid linear order.
It exists only for directed acyclic graphs.
If a directed cycle exists, every member waits indirectly for itself.
No linear arrangement can satisfy that contradiction.
The algorithm therefore solves two problems at once.
It produces an order when possible.
It proves cyclic inconsistency when impossible.
Kahn's algorithm repeatedly removes vertices with zero remaining indegree.
DFS-based ordering appends vertices after exploring all outgoing dependencies and then reverses completion order.
Both run in $O(V+E)$ time with adjacency lists.
They expose different operational properties.
Kahn's frontier shows tasks currently ready to run.
It naturally supports deterministic tie policies and parallel scheduling.
DFS exposes a cycle through a back edge to an active ancestor.
It can produce an order with one traversal stack.
A DAG can have many valid topological orders.
Independent tasks may appear in any relative order.
Tests should validate constraints rather than one incidental sequence unless tie-breaking is part of the API.
Lexicographically smallest order requires a priority queue for ready vertices.
That adds logarithmic frontier operations.
Topological order is not a shortest path, traversal level, or total dependency ranking.
It guarantees only that every directed edge points forward.
Disconnected DAG components are handled together.
Vertices with no edges are valid and can appear anywhere under the tie policy.
Real dependency systems also need diagnostics.
Reporting only “cycle exists” is less useful than returning one cycle or one unresolved subgraph.
Dynamic systems may add edges after an order is built.
Maintaining an order incrementally is a different problem from rerunning a static sort.
This article develops static sorting, deterministic readiness, cycle witnesses, and scheduling implications.

## 2. Core Mathematical Invariants

Let directed graph $G=(V,E)$.
A topological order is a bijection $position:V\to\{0,\ldots,|V|-1\}$ such that

$$
(u,v)\in E\implies position(u)<position(v).
$$

This edge-forward condition is the complete correctness criterion.
Kahn's algorithm tracks current indegree.
Initially, `indegree[v]` equals the number of incoming edges to $v$.
When vertex $u$ is emitted, every outgoing edge $u\to v$ is removed conceptually.
Decrement `indegree[v]` exactly once for that edge.
The indegree invariant says the stored count equals incoming edges from vertices not yet emitted.
A zero-indegree vertex has no remaining prerequisite.
It is safe to emit next.
Emitting it cannot violate any incoming edge because none remains.
Every emitted vertex appears once.
Every edge is processed once when its source is emitted.
If all vertices are emitted, their order satisfies every edge.
If the ready frontier becomes empty before all vertices are emitted, the remaining induced subgraph has no zero-indegree vertex.
Every finite directed acyclic graph has at least one zero-indegree vertex.
Therefore the remaining graph contains a cycle.
This is Kahn's cycle proof.
Duplicate edges require consistent semantics.
If parallel edges are stored, indegree counts and decrements must include each copy.
If dependencies are set semantics, deduplicate before counting.
Mixing deduplicated adjacency with duplicate indegree creates false cycles.
DFS ordering uses vertex states `unvisited`, `active`, and `finished`.
The active set is the current recursion or explicit DFS path.
An edge to an active vertex is a back edge and proves a directed cycle.
An edge to a finished vertex is safe because its descendants are already ordered.
Append a vertex only after all outgoing neighbors finish.
Then every dependency reachable through an outgoing edge appears earlier in completion list.
Reversing completion list makes every edge point forward.
The DFS invariant is postorder completion.
Color state must be global across disconnected DFS roots.
Resetting finished vertices between roots repeats work and can break reasoning.
For deterministic Kahn ordering, the frontier policy is explicit.
A FIFO queue yields one order dependent on insertion sequence.
A min-heap yields the lexicographically smallest available vertex at every step.
The greedy choice produces the lexicographically smallest full topological order.
At the first differing position, any alternative choosing a larger ready vertex cannot be lexicographically smaller.
Topological uniqueness has another invariant.
Under Kahn's process, if more than one ready vertex exists at any step, at least two valid next choices exist.
The final order is not unique.
If exactly one ready vertex exists at every step and all vertices emit, the order is unique.
A Hamiltonian edge between every consecutive pair in one topological order is an equivalent uniqueness characterization for DAGs.
Level scheduling groups vertices by longest prerequisite distance or Kahn rounds.
Vertices ready in the same round can run concurrently only if external resource constraints allow it.
The graph invariant addresses dependency safety, not CPU, memory, locks, or rate limits.

## 3. Step-by-Step Execution Trace

Use tasks `parse`, `typecheck`, `compile`, `test`, `package`, and `deploy`.
Edges are `parse->typecheck`, `typecheck->compile`, `compile->test`, `compile->package`, `test->deploy`, and `package->deploy`.
Initial indegrees are zero for parse.
Typecheck has indegree one.
Compile has indegree one.
Test and package each have indegree one.
Deploy has indegree two.
The ready frontier initially contains only parse.
Emit parse.
Remove edge parse to typecheck.
Typecheck indegree becomes zero and enters the frontier.
Emit typecheck.
Compile becomes ready.
Emit compile.
Both test and package become ready.
Their relative order is unconstrained by graph edges.
Suppose a lexical heap chooses package before test.
Emit package and decrement deploy from two to one.
Deploy is not ready yet.
Emit test and decrement deploy from one to zero.
Deploy enters the frontier.
Emit deploy.
One valid order is `[parse, typecheck, compile, package, test, deploy]`.
Swapping package and test gives another valid order.
Every edge points from an earlier to a later position.
Now add edge `deploy->compile`.
Compile indegree becomes two initially.
Kahn emits parse and typecheck.
Compile still has one incoming edge from deploy.
No other vertex is ready.
The frontier becomes empty with four vertices unprocessed.
The remaining cycle is `compile->test->deploy->compile`, also with package feeding deploy.
Kahn proves at least one cycle but does not directly identify its exact path.
Run DFS to extract a witness.
Enter compile and mark it active.
Follow compile to test and mark test active.
Follow test to deploy and mark deploy active.
Follow deploy to compile.
Compile is active, so this is a back edge.
Parent links reconstruct cycle compile, test, deploy, compile.
Now examine duplicate edge semantics.
If `compile->test` appears twice, test indegree is two.
Processing compile must decrement it twice if both copies remain.
It then reaches zero correctly.
If adjacency is deduplicated but indegree counted two, test remains falsely blocked at one.
Finally derive parallel rounds from the acyclic graph.
Round zero contains parse.
Round one contains typecheck.
Round two contains compile.
Round three contains test and package.
Round four contains deploy.
At most test and package are dependency-parallel in this example.

## 4. Production-Ready Implementations

This deterministic Kahn implementation deduplicates dependencies, includes destination-only vertices, and returns unresolved vertices on failure.

```python
from __future__ import annotations

import heapq
from collections.abc import Hashable, Iterable, Mapping
from dataclasses import dataclass
from typing import Generic, TypeVar


V = TypeVar("V", bound=Hashable)


@dataclass(frozen=True)
class TopologicalResult(Generic[V]):
    order: list[V]
    unresolved: set[V]

    @property
    def acyclic(self) -> bool:
        return not self.unresolved


def topological_sort(graph: Mapping[V, Iterable[V]]) -> TopologicalResult[V]:
    adjacency: dict[V, set[V]] = {vertex: set(neighbors) for vertex, neighbors in graph.items()}
    for neighbors in list(adjacency.values()):
        for neighbor in neighbors:
            adjacency.setdefault(neighbor, set())

    indegree = {vertex: 0 for vertex in adjacency}
    for neighbors in adjacency.values():
        for neighbor in neighbors:
            indegree[neighbor] += 1

    ready = [vertex for vertex, degree in indegree.items() if degree == 0]
    try:
        heapq.heapify(ready)
    except TypeError as error:
        raise TypeError("vertices must be mutually orderable for deterministic heap output") from error

    order: list[V] = []
    while ready:
        vertex = heapq.heappop(ready)
        order.append(vertex)
        for neighbor in adjacency[vertex]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                heapq.heappush(ready, neighbor)

    unresolved = {vertex for vertex, degree in indegree.items() if degree > 0}
    return TopologicalResult(order, unresolved)


def demo() -> None:
    graph = {
        "parse": ["typecheck"],
        "typecheck": ["compile"],
        "compile": ["test", "package"],
        "test": ["deploy"],
        "package": ["deploy"],
    }
    result = topological_sort(graph)
    assert result.acyclic
    position = {vertex: index for index, vertex in enumerate(result.order)}
    for source, targets in graph.items():
        for target in targets:
            assert position[source] < position[target]


if __name__ == "__main__":
    demo()
```

The heap requires mutually comparable vertices.
Production APIs often accept an explicit stable priority key instead.
Do not use object addresses or randomized hash order for persisted schedules.
Deduplication defines repeated dependencies as one logical edge.
If parallel-edge multiplicity has domain meaning, retain counts consistently.
The unresolved set may include vertices downstream of a cycle, not only vertices on cycles.
Run SCC or DFS witness extraction on the unresolved induced graph for precise diagnostics.
Return partial order only if consumers understand that it excludes blocked work.
Many APIs should raise a structured cycle error instead.
Snapshot mutable dependency state before sorting.
Concurrent edge changes can create an order for no coherent graph version.
Bound vertices and edges when graphs come from users.
The linear algorithm can still exhaust memory on huge input.
For scheduling, do not mark a vertex complete when merely dispatched.
Its outgoing dependents become runnable only after successful completion under execution semantics.
Kahn's static removal models completed prerequisites, not speculative starts.
On task failure, cancellation and retry policy sit above topological order.
Use ready queues with resource-aware admission control.
Dependency correctness does not prevent oversubscribing memory or external services.
Property-test random DAGs by generating a hidden order and only forward edges.
Verify every edge against returned positions.
Add one backward edge to create cycles and confirm rejection where appropriate.

## 5. Asymptotic Time & Space Complexity

Building adjacency and indegree maps costs $O(V+E)$ expected time with hash containers.
With a FIFO deque, each vertex enters and leaves the ready queue once.
Each edge decrements one indegree once.
Kahn's algorithm then runs in $O(V+E)$ time.
The min-heap version performs one push and pop per vertex.
Its time is $O(E+V\log V)$ after adjacency construction.
It pays this factor for deterministic lexical minimality.
Adjacency storage is $O(V+E)$.
Indegree, ready frontier, output, and unresolved state use $O(V)$ additional space.
DFS topological sort also runs in $O(V+E)$ time.
Its color, parent, output, and explicit or recursive stack use $O(V)$ space.
A recursive DFS can overflow the native stack on a path of length $V$.
An iterative frame stack avoids that failure mode.
Validating an existing proposed order takes $O(V+E)$ time.
Build a position map in $O(V)$, then scan every edge.
Detecting uniqueness through frontier size adds $O(1)$ work per step beyond queue operations.
Constructing one exact cycle witness with DFS remains $O(V+E)$.
SCC decomposition is also linear and can report all cyclic components.
Parallel execution span is at least the longest weighted dependency path.
Topological sorting itself does not reduce that critical path.
If each task takes unit time and unlimited processors exist, Kahn levels give schedule length equal to longest path in vertices.
Real resource constraints can increase completion time.
Incremental topological ordering algorithms can update faster than full recomputation on some edge changes.
Their complexity and implementation are substantially more involved.
For small or batch changes, rerunning linear static sorting is often safer.

## 6. Systems Connections

Build tools represent targets and prerequisites as DAGs when configurations are valid.
Ready targets can execute in parallel after dependencies finish.
Content hashes add incremental reuse beyond ordering.
Package managers face cycles, optional dependencies, versions, and platform constraints.
Topological order applies only after dependency resolution produces a concrete acyclic installation graph or an explicit cycle policy.
Compilers order declarations, passes, and generated artifacts.
Mutually recursive definitions require SCC grouping rather than a plain topological order of individual nodes.
Database migrations form dependencies between schema changes.
A deterministic order improves review and reproducibility.
Rollback order generally reverses dependency direction but still needs operation-specific safety.
Workflow engines keep durable indegree-like readiness state.
Crashes, retries, and idempotency determine whether a completed dependency can be counted safely.
Message delivery order alone does not implement a reliable DAG scheduler.
Spreadsheets evaluate formula dependencies topologically.
A reference cycle requires rejection or iterative calculation semantics.
Course planners use topological constraints but add semester availability and credit limits.
Those resource constraints make scheduling harder than ordering.
Git commit history is a DAG whose parent edges constrain ancestry.
Display order can choose among many valid topological arrangements while respecting timestamps or first-parent preferences.
Data pipelines order transformations and materializations.
Backfills may run a subgraph with versioned inputs.
Infrastructure provisioning tools derive dependency graphs from references.
Destroy order often reverses creation constraints.
Security policy compilers order rules or analyses only where semantic dependencies permit it.
An arbitrary topological order should not decide conflict precedence unless the policy explicitly says so.
Distributed schedulers must persist graph version and completion events atomically enough to avoid releasing work early.
Topological sorting gives the dependency core; fault tolerance supplies the rest.

## 7. Practice Checklist

- Confirm every edge direction means prerequisite before dependent.
- Include isolated and destination-only vertices.
- Decide whether duplicate dependencies are sets or counted edges.
- Keep indegree calculation consistent with adjacency representation.
- Initialize every zero-indegree vertex in the frontier.
- Decrement each stored edge exactly once.
- Enqueue a vertex only when indegree reaches zero.
- Emit each vertex once.
- Verify output positions against every edge.
- Reject or report when fewer than $V$ vertices emit.
- Do not label every unresolved vertex as part of a cycle.
- Extract a DFS witness or SCC for precise diagnostics.
- Define deterministic tie-breaking when outputs are persisted.
- Use a heap only when lexical minimality is required.
- Accept an explicit priority key for noncomparable vertices.
- Test multiple valid orders by constraints, not exact list.
- Detect uniqueness from frontier size when needed.
- Handle empty graphs and one isolated vertex.
- Test disconnected DAG components.
- Test self-loops and multi-vertex cycles.
- Test parallel edges under the chosen semantics.
- Test one long chain for stack and latency behavior.
- Snapshot graphs before analysis.
- Bound untrusted graph size.
- Separate static readiness from successful task completion.
- Apply resource limits above dependency readiness.
- Define failure, retry, and cancellation behavior.
- Version durable workflow graphs.
- Use SCC grouping for mutually recursive units.
- Do not force a DAG model where cycles have defined fixpoint semantics.
- Keep topological order separate from shortest-path distance.
- Keep dependency order separate from priority.
- Validate imported orders before execution.
- Recompute safely after batch mutations.
- Use incremental algorithms only when change volume justifies complexity.
- Account for heap logarithms in deterministic complexity.
- Report partial results only under an explicit API contract.
- Preserve stable identifiers across persistence.
- Test cycle diagnostics for actionable output.
- Connect scheduling claims to actual resource constraints.

## 8. Frequently Asked Questions

### When does a topological order exist?

Exactly when the directed graph is acyclic.
Every directed cycle creates mutually contradictory before constraints.

### Can a DAG have multiple topological orders?

Yes.
Any unrelated ready vertices can often be swapped without violating edges.

### How does Kahn's algorithm detect a cycle?

If the zero-indegree frontier becomes empty before every vertex is emitted, the remaining graph must contain a directed cycle.

### Does the unresolved set equal the cycle?

Not necessarily.
It can include vertices downstream of a cycle that remain blocked.

### How can one exact cycle be reported?

Run DFS with active-state colors and parent links on the unresolved graph; a back edge reconstructs a witness.

### What is the difference between Kahn and DFS ordering?

Kahn removes ready vertices by indegree, while DFS reverses postorder and detects active-path back edges.

### How is the lexicographically smallest order produced?

Use a min-priority queue for the ready frontier and always emit its smallest vertex.

### How can uniqueness be detected?

If more than one ready vertex exists at any Kahn step, multiple valid orders exist.
Exactly one choice at every step implies uniqueness.

### Is topological order a schedule?

It is a dependency-valid sequence.
A real schedule must additionally handle duration, processors, memory, failures, and external constraints.

### Are isolated vertices allowed?

Yes.
They have zero indegree and may appear anywhere permitted by the tie policy.

### Can an order be updated after adding an edge?

Yes with specialized incremental algorithms, but full $O(V+E)$ recomputation is often simpler and safer for batch changes.

### What should tests assert?

Assert that every vertex appears once and every directed edge points forward, plus any documented deterministic tie rule.
