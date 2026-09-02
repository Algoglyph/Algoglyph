# Karger's Algorithm: Random Contraction for Global Minimum Cuts

![Karger contractions preserving and destroying candidate cuts](/images/dsa/kargers-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

A cut partitions an undirected graph's vertices into two nonempty groups.

Its size is the number of edges crossing between those groups.

The global minimum cut is the smallest such boundary anywhere in the graph.

It measures the fewest edge failures needed to disconnect a network.

Deterministic algorithms can solve minimum cut.

Karger's algorithm demonstrates a different idea: random contraction.

Choose an edge uniformly at random.

Merge its endpoints into one supernode.

Remove self-loops.

Keep parallel edges because their multiplicity represents cut capacity.

Repeat until only two supernodes remain.

The edges between them define one cut of the original graph.

One run can fail badly.

If it contracts an edge belonging to a true minimum cut, that cut can never be recovered.

The insight is probabilistic.

When the graph still has many supernodes, a minimum cut occupies only a limited fraction of all edges.

There is a nontrivial chance that every random contraction avoids the target cut.

Repeating independent trials amplifies success probability.

The basic algorithm is a Monte Carlo algorithm.

It always returns a valid cut.

It may not return the minimum cut.

More trials reduce the error probability but do not produce a deterministic certificate by themselves.

The method assumes an undirected multigraph.

Parallel edges must survive contraction.

Deduplicating them changes selection probabilities and reported cut values.

Self-loops must be removed because they do not cross any current supernode partition.

Weighted integer capacities can be represented conceptually by parallel edges, though explicit weighted sampling is more practical for large weights.

Disconnected input has minimum cut zero and should be handled before contraction.

The central question is:

Why does avoiding one fixed minimum cut during random contractions happen with probability at least inverse quadratic in the vertex count?

## 2. Core Mathematical Invariants

Let the undirected multigraph have $n$ vertices.

Fix one particular minimum cut $C$ of size $\lambda$.

### Supernode partition invariant

At every contraction stage, each supernode represents a disjoint subset of original vertices.

All supernodes together partition the original vertex set.

An edge between supernodes represents one original edge whose endpoints lie in those subsets.

Self-loops represent original edges internal to one current subset and are discarded.

### Cut-preservation invariant

If no contracted edge belongs to fixed cut $C$, every supernode remains entirely on one side of $C$.

Therefore $C$ remains representable in the contracted graph with exactly $\lambda$ crossing edges.

Contracting any edge of $C$ merges vertices from opposite sides.

That destroys the fixed cut permanently.

### Degree lower bound

In a graph whose minimum cut has size $\lambda$, every vertex has degree at least $\lambda$.

Separating one vertex from all others is a valid cut with size equal to its degree.

If its degree were smaller than $\lambda$, $C$ would not be minimum.

This remains true for supernodes while fixed minimum cut $C$ survives: the contracted graph still has minimum cut at least and in fact equal to $\lambda$.

### Edge-count lower bound

With $r$ remaining supernodes, the sum of degrees is at least $r\lambda$.

Each undirected edge contributes two to that sum.

Thus the graph has at least:

$$
m_r\ge\frac{r\lambda}{2}
$$

edges counted with multiplicity.

### Safe-contraction probability

Exactly $\lambda$ edges belong to fixed cut $C$.

The probability of contracting one of them is at most:

$$
\frac{\lambda}{m_r}\le\frac{2}{r}.
$$

The probability of a safe contraction is at least:

$$
1-\frac{2}{r}=\frac{r-2}{r}.
$$

### One-trial success bound

To preserve $C$, safe contractions are needed for $r=n,n-1,\ldots,3$.

Multiplying conditional lower bounds gives:

$$
\prod_{r=3}^{n}\frac{r-2}{r}
=\frac{2}{n(n-1)}.
$$

Therefore one run succeeds with probability at least $2/(n(n-1))$.

The actual probability may be larger because several minimum cuts can exist.

### Repetition invariant

Let one-run success probability be at least $p$.

With $t$ independent trials, failure probability is at most:

$$
(1-p)^t\le e^{-pt}.
$$

Choosing $t=\Theta(n^2\log(1/\delta))$ makes failure probability at most $\delta$ under the basic bound.

Independence requires fresh random choices for each trial.

### Cut-validity invariant

Every final pair of supernodes defines a nonempty bipartition of original vertices.

The remaining parallel-edge count is exactly the cut size for that partition.

Even a failed trial returns a valid upper bound on the true minimum cut.

## 3. Step-by-Step Execution Trace

Use graph with vertices `A`, `B`, `C`, `D` and edges:

```text
A-B, A-C, B-C, B-D, C-D
```

This is two triangles sharing edge `B-C` except there is no `A-D` edge.

The global minimum cut has size two.

For example, separating `A` crosses `A-B` and `A-C`.

Separating `D` crosses `B-D` and `C-D`.

### Successful trial

Choose edge `B-C` first.

Merge `B` and `C` into supernode `BC`.

Edge `B-C` becomes a self-loop and is removed.

Edges `A-B` and `A-C` become two parallel edges `A-BC`.

Edges `B-D` and `C-D` become two parallel edges `BC-D`.

The contracted multigraph has three supernodes:

```text
A ==(2 edges)== BC ==(2 edges)== D
```

Choose one of the `BC-D` edges next.

Merge `BC` with `D` into `BCD`.

Both `BC-D` edges become self-loops and disappear.

Two parallel edges remain between `A` and `BCD`.

The resulting cut is `{A}` versus `{B,C,D}` with value two.

That is a global minimum cut.

### Failed trial

Choose edge `A-B` first.

Merge into `AB`.

Remaining edges are:

```text
AB-C (from A-C)
AB-C (from B-C)
AB-D (from B-D)
C-D
```

Now choose edge `C-D` and merge into `CD`.

The remaining cut between `AB` and `CD` has three edges:

```text
A-C, B-C, B-D
```

The trial returns cut value three.

It is valid but not minimum.

The first contraction destroyed the minimum cut isolating `A` because `A-B` crossed that cut.

### Parallel-edge significance

After contracting `B-C` in the successful trial, there are two edges from `A` to `BC`.

Replacing them with one simple edge would report cut value one.

It would also halve their combined chance of being sampled.

Both changes are incorrect.

### Trial aggregation

Suppose five trials return cut values:

```text
3, 2, 3, 2, 2
```

Return the smallest observed value, two, and its partition.

The larger outputs remain valid cuts but do not improve the incumbent.

### Disconnected input

If the graph begins with two connected components, a cut of value zero exists.

Ordinary edge contraction cannot merge components because no crossing edge exists.

Detect disconnection and return zero before attempting to choose random edges from an exhausted component structure.

## 4. Production-Ready Implementations

The implementation preserves an explicit list of parallel edges and tracks original vertices inside each supernode.

It accepts a random generator so tests can be deterministic.

```python
from dataclasses import dataclass
from random import Random
from typing import Hashable, Iterable, TypeVar

V = TypeVar("V", bound=Hashable)


@dataclass(frozen=True)
class Cut:
    value: int
    left: frozenset[V]
    right: frozenset[V]


def contract_once(
    vertices: Iterable[V],
    edges: Iterable[tuple[V, V]],
    rng: Random,
) -> Cut:
    groups = {vertex: {vertex} for vertex in vertices}
    multiedges = [(u, v) for u, v in edges if u != v]

    while len(groups) > 2:
        if not multiedges:
            components = list(groups.values())
            left = frozenset(components[0])
            right = frozenset().union(*components[1:])
            return Cut(0, left, right)

        u, v = rng.choice(multiedges)
        groups[u].update(groups.pop(v))

        rewritten: list[tuple[V, V]] = []
        for left_endpoint, right_endpoint in multiedges:
            if left_endpoint == v:
                left_endpoint = u
            if right_endpoint == v:
                right_endpoint = u
            if left_endpoint != right_endpoint:
                rewritten.append((left_endpoint, right_endpoint))
        multiedges = rewritten

    identifiers = list(groups)
    left_id, right_id = identifiers
    crossing = sum(
        1
        for u, v in multiedges
        if {u, v} == {left_id, right_id}
    )
    return Cut(crossing, frozenset(groups[left_id]), frozenset(groups[right_id]))
```

The code treats every edge-list entry as one unit of capacity.

It rewrites all edges after each contraction for clarity rather than optimal speed.

### Repeated trials

```python
def karger_min_cut(
    vertices: Iterable[V],
    edges: Iterable[tuple[V, V]],
    *,
    trials: int,
    seed: int | None = None,
) -> Cut:
    materialized_vertices = list(dict.fromkeys(vertices))
    materialized_edges = list(edges)
    if len(materialized_vertices) < 2:
        raise ValueError("minimum cut requires at least two vertices")
    if trials <= 0:
        raise ValueError("trials must be positive")

    vertex_set = set(materialized_vertices)
    if any(u not in vertex_set or v not in vertex_set for u, v in materialized_edges):
        raise ValueError("edge endpoint is outside the vertex set")

    rng = Random(seed)
    best: Cut | None = None
    for _ in range(trials):
        candidate = contract_once(materialized_vertices, materialized_edges, rng)
        if best is None or candidate.value < best.value:
            best = candidate
            if best.value == 0:
                break

    assert best is not None
    return best
```

### Executable checks

```python
vertices = ["A", "B", "C", "D"]
edges = [("A", "B"), ("A", "C"), ("B", "C"), ("B", "D"), ("C", "D")]

result = karger_min_cut(vertices, edges, trials=100, seed=7)
assert result.value == 2
assert result.left | result.right == frozenset(vertices)
assert not (result.left & result.right)

disconnected = karger_min_cut([0, 1, 2], [(0, 1)], trials=10, seed=1)
assert disconnected.value == 0
```

A faster implementation uses union-find to represent contractions and samples original edges until it finds endpoints in different current components.

That avoids rewriting the full edge list after every merge.

## 5. Asymptotic Time & Space Complexity

The clear edge-rewriting implementation performs up to $n-2$ contractions.

Each contraction scans the current multiedge list of size at most $m$.

One trial costs $O(nm)$ time in this representation.

It uses $O(n+m)$ storage.

A union-find implementation can process one trial more efficiently, though repeated rejected samples complicate the exact expected bound.

The classic simple analysis often quotes $O(n^2m)$ or improved implementation-dependent trial costs.

The central probabilistic cost is the number of trials.

One trial succeeds with probability at least:

$$
p\ge\frac{2}{n(n-1)}.
$$

To make failure at most $\delta$, choose:

$$
t\ge\frac{\ln(1/\delta)}{p}
=O(n^2\log(1/\delta)).
$$

Combining this with the explicit $O(nm)$ trial implementation gives a deliberately conservative total bound.

More advanced contraction schedules improve success and runtime.

Karger-Stein recursively contracts to an intermediate size and branches, yielding a much stronger expected complexity.

| Quantity | Bound |
|---|---:|
| One-run success | At least $2/(n(n-1))$ |
| Trials for constant success | $\Theta(n^2)$ |
| Trials for failure $\delta$ | $O(n^2\log(1/\delta))$ |
| Explicit one-trial space | $O(n+m)$ |
| Explicit rewrite trial time | $O(nm)$ |

Randomness quality and independence matter to the probability claim.

A fixed seed is useful for tests but should not be mistaken for independent production trials across repeated runs.

## 6. Systems Connections

### Network resilience

Minimum cuts identify small edge boundaries whose loss disconnects a topology.

The graph model must reflect actual failure units.

Shared physical links represented as independent logical edges can overstate resilience.

Capacities or failure correlations need richer models.

### Clustering

Cut objectives appear in graph partitioning and clustering.

Global minimum cut can isolate one low-degree vertex, which may be unhelpful as a balanced partition.

Balanced-cut and normalized-cut objectives solve different problems and are generally harder.

### Probability amplification

Karger's algorithm is a clean example of independent repetition turning a weak one-run guarantee into high confidence.

The pattern applies to randomized verification, hashing, sampling, and search.

The failure probability must be reported with the output when no deterministic verification is available.

### Parallel trials

Independent contraction trials can run in parallel.

Each worker needs its own random stream and mutable contraction state.

The final reduction chooses the smallest returned cut.

Copying a very large graph per trial can become the dominant memory cost.

### Multigraph representation

Parallel edges are semantic data, not duplicate noise.

Graph libraries that automatically deduplicate endpoint pairs cannot implement the algorithm directly without storing multiplicity weights.

Weighted sampling must choose edges proportional to multiplicity or capacity.

### Reproducibility

Record the seed, trial count, graph version, and sampling method when results need auditing.

Reproducible randomness helps diagnose a suspicious cut.

It does not raise the theoretical success probability unless more independent trials are run.

### Verification

Given a returned partition, computing its crossing capacity is deterministic and linear in edges.

That verifies the reported cut value.

It does not prove no smaller cut exists.

A deterministic min-cut algorithm can serve as an oracle in tests for small graphs.

## 7. Practice Checklist

- Confirm the graph is undirected.
- Preserve parallel edges.
- Remove self-loops after every contraction.
- Track original vertices inside supernodes.
- Choose edges uniformly by multiplicity.
- Use capacity-proportional sampling for weighted edges.
- Detect disconnected input.
- Require at least two vertices.
- Validate every endpoint.
- Initialize fresh contraction state per trial.
- Use independent random choices across trials.
- Keep the smallest observed cut.
- Retain its original-vertex partition.
- Verify returned sides are disjoint and exhaustive.
- Recount crossing edges deterministically.
- Test two vertices with parallel edges.
- Test a triangle.
- Test a cycle.
- Test a complete graph.
- Test a disconnected graph.
- Test duplicate edge entries.
- Test self-loop removal.
- Compare small random cases with a deterministic oracle.
- State the trial count.
- State or derive the failure bound.
- Record seeds for reproducibility.
- Avoid claiming certainty from Monte Carlo output.
- Parallelize only independent mutable trials.
- Bound memory used by concurrent graph copies.
- Consider Karger-Stein or deterministic methods for stronger requirements.

## 8. Frequently Asked Questions

### What problem does Karger's algorithm solve?

It finds a candidate global minimum cut in an undirected multigraph through repeated random edge contraction.

### Is one trial guaranteed to find the minimum cut?

No.

One trial always returns a valid cut but may contract an edge from every true minimum cut and return a larger value.

### Why keep parallel edges?

They represent the number or capacity of original edges crossing between supernodes.

They determine both sampling probability and final cut value.

### Why remove self-loops?

Their endpoints are already inside one supernode, so they cannot cross any future cut between supernodes.

### What is the success probability of one run?

For a graph with $n$ vertices, it is at least $2/(n(n-1))$ for preserving one fixed minimum cut.

### How do repeated trials help?

Independent failures multiply.

After $t$ trials, failure is at most $(1-p)^t$, where $p$ is the one-run success lower bound.

### Can the algorithm handle weighted graphs?

Yes when nonnegative integer capacity is treated as multiplicity or when edges are sampled proportional to capacity and cut values sum capacities.

### Does a returned partition verify optimality?

It verifies that the reported value is a real cut.

It does not prove that no smaller cut exists.

### Why does a disconnected graph have cut zero?

Place one connected component on one side and the others on the other side.

No edge crosses the partition.

### Can trials run in parallel?

Yes.

They are independent after sharing the immutable input graph, provided each has separate random and contraction state.

### When should a deterministic algorithm be preferred?

Use one when exact certainty is required, trial budgets are too large, or the graph model and capacities fit a deterministic min-cut implementation better.
