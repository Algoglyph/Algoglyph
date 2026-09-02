# A* Search: Heuristic Frontiers, Optimality Conditions & Pathfinding Trade-offs

![A* search frontier guided toward a goal](/images/dsa/a-star-algorithm-dark.jpg#dark)

A* answers a focused shortest-path question: **which frontier state should be expanded next when the destination is known and the search can estimate what remains?**

It combines the exact cost already paid with a heuristic estimate of the remaining cost.

That combination can avoid large irrelevant regions of a graph without giving up optimality, but only when the heuristic and implementation satisfy precise conditions.

This article develops those conditions, traces a complete search, and implements a version that safely handles improved paths and stale priority-queue entries.

## 1. Historical Context & Motivation

### Why uninformed shortest-path search wastes work

Suppose a robot must travel from one room to a specific charging station.

Dijkstra's algorithm can find an optimal route when every edge cost is non-negative.

Its priority is the path cost accumulated from the start.

That rule is deliberately ignorant of where the goal lies.

On an open map, the explored region therefore grows roughly outward from the start in every promising direction.

Many settled locations may be farther from the charging station than the robot ever needs to travel.

Greedy best-first search makes the opposite trade-off.

It expands whichever state appears closest to the goal according to a heuristic.

This usually points the search in the right direction.

It can nevertheless commit to a cheap-looking corridor whose actual travel cost is terrible.

A useful pathfinder needs both pieces of information:

- what the chosen prefix has actually cost;
- what a defensible lower-bound estimate says may remain.

### The A* synthesis

Peter E. Hart, Nils J. Nilsson, and Bertram Raphael formalized A* in their 1968 paper, [*A Formal Basis for the Heuristic Determination of Minimum Cost Paths*](https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/astar.pdf).

Their framework compares search strategies through an evaluation function rather than treating every pathfinding rule as an unrelated trick.

For a frontier node $n$, A* uses

$$
f(n) = g(n) + h(n).
$$

The value $g(n)$ is the cost of the best start-to-$n$ path currently known.

The value $h(n)$ estimates the cheapest remaining cost from $n$ to a goal.

The value $f(n)$ is therefore an estimate of the cheapest complete solution constrained to pass through $n$.

If $h(n)=0$ for every node, A* reduces to Dijkstra's algorithm.

If the search ignores $g(n)$ and orders only by $h(n)$, it becomes greedy best-first search.

A* occupies the useful middle ground: goal-directed like greedy search, cost-accountable like Dijkstra.

### What the algorithm does and does not promise

A* is not “always fast.”

Its speed depends heavily on how informative the heuristic is.

A heuristic that is nearly equal to the true remaining cost can make the frontier narrow.

A heuristic that is always zero gives no guidance at all.

An overestimating heuristic may be faster yet return a suboptimal route.

A mathematically admissible heuristic can still be inconsistent, which affects whether expanded nodes must be reopened.

The original authors later published a [correction](https://cse.sc.edu/~MGV/csce580f12/astarHNR1972.pdf) clarifying their optimal-efficiency result and the practical role of consistency.

The correction matters to implementations: consistency lets graph-search A* finalize a node when it is expanded, while admissibility alone may require reopening it after a cheaper route appears.

### Where the graph comes from

A* does not require a visible graph stored as an adjacency list.

The state graph may be generated on demand.

In a tile map, a state is a walkable coordinate and successors are legal neighboring tiles.

In a road network, a state is an intersection and edges are road segments with travel costs.

In a puzzle, a state is a board configuration and edges are legal moves.

In robot motion planning, a state may include position, orientation, velocity, or time.

Choosing the state representation is part of the algorithm design.

If two states have the same position but different future constraints, merging them can make the search incorrect.

For example, a vehicle arriving at the same coordinate with different headings may have different legal turns.

The state key must preserve every property that changes successor generation or future cost.

## 2. Core Mathematical Invariants

### Weighted graph model

Let $G=(V,E)$ be a directed graph.

Each edge $(u,v)$ has a finite cost $c(u,v) \ge 0$.

Let $s$ be the start and $t$ the goal.

For any path $P=(v_0,v_1,\ldots,v_k)$, define

$$
C(P)=\sum_{i=0}^{k-1} c(v_i,v_{i+1}).
$$

Let $d(u,v)$ denote the minimum path cost from $u$ to $v$, or $+\infty$ when no path exists.

The desired answer has cost $C^*=d(s,t)$.

The non-negative edge requirement prevents a cheaper path from being manufactured by repeatedly traversing a negative cycle.

It also supports the frontier arguments used by Dijkstra and A*.

### Best-known prefix invariant

For every discovered node $n$, A* stores a score $g[n]$.

The score is the cost of a concrete path already found from $s$ to $n$.

Therefore

$$
g[n] \ge d(s,n).
$$

This direction is easy to reverse by mistake.

Because $g[n]$ comes from an actual path, it is an **upper bound** on the optimal prefix cost.

When relaxation discovers a cheaper prefix through $u$, it performs

$$
g_{\text{candidate}} = g[u] + c(u,n).
$$

If $g_{\text{candidate}} < g[n]$, the algorithm replaces $g[n]$ and records $u$ as the predecessor of $n$.

Every accepted relaxation strictly improves the stored prefix cost.

The predecessor map must be updated in the same operation as the score.

Otherwise path reconstruction can disagree with the cost that caused the node to win.

### Admissibility: a lower bound on the remaining cost

A heuristic $h$ is **admissible** when it never overestimates the true remaining cost:

$$
0 \le h(n) \le d(n,t)
$$

for every node that can reach the goal, with $h(t)=0$.

The non-negativity convention is common but the essential optimality condition is the upper inequality.

For a frontier node $n$ on an optimal path,

$$
f(n)=g(n)+h(n) \le C^*
$$

once $g(n)$ represents the optimal prefix to that node.

This is the lower-bound interpretation of $f$.

If the goal is removed from the frontier with cost $g(t)$ while some cheaper solution remains possible, an open node on that cheaper solution would have $f \le C^* < g(t)$.

That contradicts choosing the minimum-$f$ entry.

The argument assumes the implementation keeps improved frontier paths and can revisit a state when necessary.

### Consistency: a triangle inequality for the heuristic

A heuristic is **consistent**, also called monotone, when every edge satisfies

$$
h(u) \le c(u,v) + h(v).
$$

Rearranging the inequality along an edge gives

$$
g(u)+h(u) \le g(u)+c(u,v)+h(v).
$$

When $v$ is reached through $u$, the right side is its candidate $f$ value.

Thus $f$ does not decrease along a path generated by the search.

Consistency implies admissibility when $h(t)=0$ and the graph's relevant goal distances are finite.

The converse is not guaranteed.

An admissible heuristic may jump downward too sharply across one edge and violate consistency.

### Why consistency changes the closed-set rule

With a consistent heuristic, the first time a node is popped at its current best score, that score is optimal for the node.

It can be placed in a permanent closed set without later reopening.

With an admissible but inconsistent heuristic, a node may be expanded before its best prefix is known.

A later relaxation can then improve its $g$ score.

An implementation that refuses to reopen it can lose the optimal route.

The safest general implementation avoids treating expansion as irrevocable.

It pushes a fresh heap entry whenever $g[n]$ improves.

When an obsolete entry is popped, it compares the entry's stored $g$ with the current score and discards the stale entry.

This lazy-update pattern preserves improvements without needing an indexed decrease-key heap.

### Frontier ordering invariant

At every iteration, the priority queue contains at least one live entry for each discovered node whose best-known route still deserves consideration.

The next live entry minimizes

$$
(f(n),\tau(n)),
$$

where $\tau(n)$ is a deterministic tie-break value.

The tie-breaker does not change optimality when it only orders equal $f$ values.

It can change how many nodes are expanded.

Favoring larger $g$ among equal-$f$ nodes often drives more deeply toward the goal.

Favoring smaller $h$ has a similar effect because $f=g+h$.

An insertion counter provides predictable behavior without assuming that arbitrary node objects are comparable.

Python's official [`heapq` documentation](https://docs.python.org/3/library/heapq.html#priority-queue-implementation-notes) recommends a counter for exactly this priority-queue issue.

### Heuristic dominance

For two admissible heuristics $h_1$ and $h_2$, $h_2$ **dominates** $h_1$ when

$$
h_1(n) \le h_2(n) \le d(n,t)
$$

for every relevant node.

The dominating heuristic supplies a tighter lower bound.

Under comparable tie-breaking, it generally permits A* to avoid expansions that the weaker heuristic cannot rule out.

Dominance says nothing about the CPU cost of evaluating the heuristic.

A tighter estimate that takes milliseconds per state may lose to a cheap estimate that expands moderately more states.

The useful engineering quantity is total search cost, not expansion count alone.

### Deriving grid heuristics instead of guessing them

On a four-neighbor grid with minimum step cost $w_{\min}$, each move changes one coordinate by one.

The Manhattan lower bound is

$$
h_{\text{Manhattan}}(x,y)=w_{\min}(|x-x_t|+|y-y_t|).
$$

Obstacles can only make a valid path longer, so ignoring them keeps the estimate admissible.

On an eight-neighbor grid with axial cost $D$ and diagonal cost $D_2$, the octile bound is

$$
h_{\text{octile}}=D(dx+dy)+(D_2-2D)\min(dx,dy),
$$

where $dx=|x-x_t|$ and $dy=|y-y_t|$.

Euclidean distance is appropriate when edge cost lower-bounds physical straight-line travel.

Raw Euclidean distance is not automatically admissible when costs use unrelated units such as tolls, risk, or energy.

The heuristic and edge costs must share a compatible scale.

### A compact correctness statement

For a finite graph with non-negative edge costs, an admissible heuristic, correct relaxation, and reopening of improved states, A* returns a minimum-cost start-to-goal path if one exists.

If the heuristic is consistent, reopening is unnecessary after a node is expanded at its live best score.

If the heuristic overestimates, the same procedure becomes an informed search without the optimality guarantee.

If the heuristic returns `NaN` or infinity unexpectedly, the priority ordering itself becomes unreliable.

Those are algorithmic preconditions, not optional performance hints.

## 3. Step-by-Step Execution Trace

### Graph, costs, and heuristic

Consider the directed graph below.

The start is `S` and the goal is `G`.

The weighted edges are:

| From | To | Cost |
| --- | --- | ---: |
| `S` | `A` | 2 |
| `S` | `B` | 1 |
| `A` | `C` | 2 |
| `A` | `G` | 7 |
| `B` | `C` | 2 |
| `B` | `D` | 5 |
| `C` | `D` | 1 |
| `C` | `G` | 5 |
| `D` | `G` | 2 |

Use the heuristic values:

| Node | $h(n)$ | True remaining cost | Admissible? |
| --- | ---: | ---: | --- |
| `S` | 5 | 6 | yes |
| `A` | 4 | 5 | yes |
| `B` | 4 | 5 | yes |
| `C` | 2 | 3 | yes |
| `D` | 1 | 2 | yes |
| `G` | 0 | 0 | yes |

The heuristic is also consistent.

For example, edge `B -> C` satisfies $h(B)=4 \le 2+h(C)=4$.

Edge `C -> D` satisfies $h(C)=2 \le 1+h(D)=2$.

Every other edge satisfies the same triangle inequality.

### Initial state

Set $g[S]=0$.

All other scores are initially $+\infty$.

Push `S` with $f(S)=0+5=5$.

The predecessor map is empty.

The frontier is:

```text
[(f=5, g=0, node=S)]
```

### Expansion 1: remove `S`

`S` has the minimum live priority.

Relax `S -> A`.

The candidate score is $0+2=2$, improving $g[A]$ from infinity to $2$.

Record `came_from[A] = S`.

Push `A` with $f(A)=2+4=6$.

Relax `S -> B`.

The candidate score is $0+1=1$, improving $g[B]$ to $1$.

Record `came_from[B] = S`.

Push `B` with $f(B)=1+4=5$.

The frontier is now:

```text
[(f=5, g=1, node=B), (f=6, g=2, node=A)]
```

A goal-directed clue has already mattered: `B` wins even though both nodes are one edge from `S`.

### Expansion 2: remove `B`

Relax `B -> C`.

The candidate score is $1+2=3$.

Set $g[C]=3$ and `came_from[C] = B`.

Push `C` with $f(C)=3+2=5$.

Relax `B -> D`.

The candidate score is $1+5=6$.

Set $g[D]=6$ and `came_from[D] = B`.

Push `D` with $f(D)=6+1=7$.

The frontier is:

```text
[(f=5, g=3, node=C),
 (f=6, g=2, node=A),
 (f=7, g=6, node=D)]
```

### Expansion 3: remove `C`

Relax `C -> D`.

The candidate score is $3+1=4$.

This improves the existing $g[D]=6$.

Replace the predecessor with `came_from[D] = C`.

Push a new entry for `D` with $f(D)=4+1=5$.

The old `(f=7, g=6, D)` entry remains in the heap but is now stale.

Relax `C -> G`.

The candidate score is $3+5=8$.

Set $g[G]=8$ and `came_from[G] = C`.

Push `G` with $f(G)=8+0=8$.

The logical frontier is:

```text
[(f=5, g=4, node=D),
 (f=6, g=2, node=A),
 (f=7, g=6, node=D stale),
 (f=8, g=8, node=G)]
```

This step demonstrates why “visited means never reconsider” is unsafe as a general implementation rule.

The first discovered route to `D` was not the cheapest one.

### Expansion 4: remove the live `D`

The live entry for `D` stores $g=4$, matching the score table.

Relax `D -> G`.

The candidate score is $4+2=6$.

This improves $g[G]$ from $8$ to $6$.

Replace the predecessor with `came_from[G] = D`.

Push a new goal entry with $f(G)=6$.

The frontier contains:

```text
[(f=6, g=2, node=A),
 (f=6, g=6, node=G),
 (f=7, g=6, node=D stale),
 (f=8, g=8, node=G stale)]
```

With insertion-order tie-breaking, `A` was inserted before the new goal entry, so `A` is popped first.

Different equal-$f$ tie-breaking could pop `G` now without changing the optimal cost.

### Expansion 5: remove `A`

Relax `A -> C`.

The candidate score is $2+2=4$.

It does not improve the current $g[C]=3$, so nothing changes.

Relax `A -> G`.

The candidate score is $2+7=9$.

It does not improve $g[G]=6$.

The frontier's best live entry is now the goal at cost $6$.

### Expansion 6: remove `G`

The popped entry stores $g=6$, equal to the current `g_score[G]`.

It is live rather than stale.

Because `G` is the goal, reconstruct the path through predecessors:

```text
G <- D <- C <- B <- S
```

Reverse that sequence:

```text
S -> B -> C -> D -> G
```

Its cost is

$$
1+2+1+2=6.
$$

No route through `A` is cheaper.

The minimum-$f$ frontier rule, admissible heuristic, and score-improving relaxation jointly establish the result.

### What the trace reveals

The heuristic did not choose a path and force the algorithm to follow it.

It only ordered unresolved alternatives.

Exact $g$ scores still decided whether each new route was an improvement.

The heap temporarily contained duplicate entries for `D` and `G`.

Duplicates are not a correctness bug when stale entries are detected on removal.

The predecessor of a node changed when its score improved.

Stopping when `G` was first **discovered** would have returned cost $8$, which is wrong.

Stopping when the live minimum-priority `G` entry was **popped** returned cost $6$.

## 4. Production-Ready Implementations

### A reusable Python graph-search implementation

The implementation below accepts arbitrary hashable states.

The caller supplies successor generation and a heuristic.

It validates edge costs and heuristic values because silent `NaN`, infinity, or negative-edge behavior is harder to diagnose than a clear exception.

It does not use a permanent closed set.

That choice permits reopening when an admissible heuristic is inconsistent.

It uses lazy duplicate entries because Python's binary heap does not expose a general decrease-key operation.

```python
from __future__ import annotations

from collections.abc import Callable, Hashable, Iterable
from dataclasses import dataclass
from heapq import heappop, heappush
from itertools import count
from math import isfinite
from typing import Generic, TypeVar

State = TypeVar("State", bound=Hashable)


@dataclass(frozen=True)
class SearchResult(Generic[State]):
    path: list[State]
    cost: float
    expanded: int


def reconstruct_path(
    came_from: dict[State, State],
    goal: State,
) -> list[State]:
    path = [goal]
    current = goal

    while current in came_from:
        current = came_from[current]
        path.append(current)

    path.reverse()
    return path


def a_star(
    start: State,
    goal: State,
    neighbors: Callable[[State], Iterable[tuple[State, float]]],
    heuristic: Callable[[State, State], float],
) -> SearchResult[State] | None:
    """Return a minimum-cost path when the heuristic is admissible.

    Edge costs must be finite and non-negative. Improved states are
    reinserted, so an admissible heuristic need not be consistent.
    """
    start_h = float(heuristic(start, goal))
    if not isfinite(start_h):
        raise ValueError("heuristic(start, goal) must be finite")

    serial = count()
    frontier: list[tuple[float, int, float, State]] = []
    heappush(frontier, (start_h, next(serial), 0.0, start))

    came_from: dict[State, State] = {}
    g_score: dict[State, float] = {start: 0.0}
    expanded = 0

    while frontier:
        _, _, queued_g, current = heappop(frontier)

        # A cheaper route was pushed after this heap entry.
        if queued_g != g_score.get(current):
            continue

        if current == goal:
            return SearchResult(
                path=reconstruct_path(came_from, goal),
                cost=queued_g,
                expanded=expanded,
            )

        expanded += 1

        for neighbor, raw_cost in neighbors(current):
            edge_cost = float(raw_cost)
            if not isfinite(edge_cost) or edge_cost < 0:
                raise ValueError(
                    f"edge {current!r} -> {neighbor!r} has invalid cost"
                )

            candidate_g = queued_g + edge_cost
            if candidate_g >= g_score.get(neighbor, float("inf")):
                continue

            estimate = float(heuristic(neighbor, goal))
            if not isfinite(estimate):
                raise ValueError(
                    f"heuristic({neighbor!r}, {goal!r}) must be finite"
                )

            came_from[neighbor] = current
            g_score[neighbor] = candidate_g
            heappush(
                frontier,
                (
                    candidate_g + estimate,
                    next(serial),
                    candidate_g,
                    neighbor,
                ),
            )

    return None
```

### Exercising the implementation on the traced graph

```python
GRAPH = {
    "S": [("A", 2), ("B", 1)],
    "A": [("C", 2), ("G", 7)],
    "B": [("C", 2), ("D", 5)],
    "C": [("D", 1), ("G", 5)],
    "D": [("G", 2)],
    "G": [],
}

H = {"S": 5, "A": 4, "B": 4, "C": 2, "D": 1, "G": 0}


def adjacent(node: str):
    return GRAPH[node]


def lower_bound(node: str, goal: str) -> float:
    assert goal == "G"
    return H[node]


result = a_star("S", "G", adjacent, lower_bound)

assert result is not None
assert result.path == ["S", "B", "C", "D", "G"]
assert result.cost == 6
print(result)
```

The assertion checks the complete path, not only the final cost.

Testing both catches predecessor-map defects that a cost-only test misses.

### Adapting it to a four-neighbor grid

A grid adapter should define exactly which cells are states, which movements are edges, and how terrain contributes to cost.

```python
from collections.abc import Iterable

Cell = tuple[int, int]


def grid_neighbors(
    grid: list[list[int]],
    cell: Cell,
) -> Iterable[tuple[Cell, float]]:
    row, col = cell
    height = len(grid)
    width = len(grid[0])

    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = row + dr, col + dc
        if 0 <= nr < height and 0 <= nc < width:
            terrain_cost = grid[nr][nc]
            if terrain_cost >= 0:
                yield (nr, nc), float(terrain_cost)


def manhattan(cell: Cell, goal: Cell) -> float:
    row, col = cell
    goal_row, goal_col = goal
    return abs(row - goal_row) + abs(col - goal_col)


terrain = [
    [1, 1, 1, 1, 1],
    [1, -1, -1, -1, 1],
    [1, 1, 1, 1, 1],
]

grid_result = a_star(
    (0, 0),
    (0, 4),
    lambda cell: grid_neighbors(terrain, cell),
    manhattan,
)

assert grid_result is not None
assert grid_result.cost == 4
```

Here `-1` means blocked and every traversable cell costs at least `1` to enter.

That minimum is why unscaled Manhattan distance is admissible.

If traversable costs could be `0.25`, the heuristic would need to multiply Manhattan distance by `0.25` or another valid lower bound.

### Validation beyond a happy-path example

A production pathfinder needs tests for behavior at the boundaries of the contract.

At minimum, test:

- `start == goal`, which should return a one-state path of cost zero;
- an unreachable goal, which should return `None`;
- parallel alternatives where a later relaxation improves a state;
- zero-cost edges;
- an admissible but inconsistent heuristic that requires reopening;
- a zero heuristic, whose result should match Dijkstra;
- malformed `NaN`, infinite, and negative edge costs;
- state objects that are hashable but not orderable;
- deterministic tie behavior where reproducible traces matter.

For small random non-negative graphs, compare A*'s answer against an independent Dijkstra implementation.

Property-based comparison is especially valuable because hand-written examples rarely exercise every relaxation ordering.

### Deliberate implementation choices

The equality check on `queued_g` is exact because the queued value was copied directly from `g_score`.

It is not recomputed through a second floating-point expression.

If application costs accumulate significant floating-point error, the definition of “strictly cheaper” needs a domain-specific tolerance or exact numeric representation.

Using an arbitrary epsilon can itself discard a legitimately cheaper route.

The implementation permits negative heuristic values because admissibility does not logically forbid them.

Negative estimates usually provide worse guidance, so a stricter application may reject them as a policy.

The implementation counts expanded live non-goal states.

It does not count stale heap removals as expansions.

The successor callback is evaluated only after the stale-entry and goal checks.

That ordering avoids expensive neighbor generation for entries that cannot affect the result.

### When the graph changes during search

Ordinary A* assumes that the successor relation and edge costs remain stable for the duration of a query.

If traffic, obstacles, or reservations change concurrently, a previously valid result can become stale.

Applications can solve this by searching against an immutable snapshot, versioning the map, or using an incremental replanning algorithm.

Silently mixing edges from different map versions destroys the meaning of $g$ and $h$.

Cancellation is another production concern.

Long searches should accept a deadline or cancellation callback and check it at a controlled cadence.

Cancellation changes availability, not the correctness of a completed result.

## 5. Asymptotic Time & Space Complexity

### Why A* has no single input-independent running time

The phrase “A* is $O(E\log V)$” is only valid under specific finite-graph and heuristic assumptions.

For an implicit state space, $V$ and $E$ may not be materialized or even finite.

Search complexity is then often described using branching factor and solution depth.

The heuristic determines how much of that state space A* must examine.

Any honest bound must state the graph model, queue implementation, and reopening behavior.

### Finite graph with a consistent heuristic

Let $V_r$ be the reachable vertices actually relevant to the run and $E_r$ their examined outgoing edges.

With consistency, a node need not be expanded more than once after its live minimum entry is removed.

Each examined edge performs constant map work and may push or decrease a priority.

With an indexed binary heap supporting decrease-key, the time is

$$
O((V_r+E_r)\log V_r).
$$

For a connected sparse graph, this is commonly written as $O(E_r\log V_r)$.

With a Fibonacci heap, the textbook amortized bound becomes

$$
O(E_r + V_r\log V_r),
$$

although constant factors and memory behavior often favor a binary heap in application code.

### Lazy duplicate heap entries

The Python implementation pushes a new entry rather than decreasing an existing key.

Let $P$ be the number of successful score improvements and therefore heap pushes.

Its queue work is

$$
O(P\log P).
$$

With a consistent heuristic and ordinary relaxation, $P$ is at most on the order of examined edges.

The practical finite-graph expression is therefore

$$
O(E_r\log E_r)
$$

for queue operations, plus $O(E_r)$ successor processing.

The heap can contain stale entries, so its peak size may exceed the number of distinct frontier states.

This is the price paid for simple, safe priority updates.

### Inconsistent heuristics and reopening

An admissible inconsistent heuristic preserves optimality only if improved expanded states can re-enter consideration.

Reopening can cause the same node's outgoing edges to be processed multiple times.

The clean “one expansion per vertex” bound no longer applies.

The exact bound depends on how many distinct improving $g$ values occur.

In graphs with real-valued costs, that count cannot be summarized by $V$ alone without additional assumptions.

Consistency is therefore both a proof convenience and an operational performance property.

### Tree-search and implicit-space bounds

Let $b$ be the effective branching factor and $d$ the depth of an optimal solution.

With weak guidance, A* may generate a number of states exponential in $d$:

$$
O(b^d).
$$

The heuristic can reduce the effective branching factor, sometimes dramatically, but does not erase the exponential worst case for general search spaces.

Saying the algorithm runs in time proportional to the final path length is incorrect in general.

It may inspect many states that are absent from the returned path.

### Space consumption

A* retains frontier entries, best-known scores, and predecessors.

For a finite graph with indexed queue entries, auxiliary space is $O(V_r)$.

With lazy duplicate entries, it is $O(V_r+P)$ before stale entries are removed.

For implicit tree search, memory can also grow as $O(b^d)$.

This memory requirement is frequently the limiting resource.

Iterative Deepening A* trades repeated work for much smaller memory usage by performing depth-first searches under increasing $f$ thresholds.

### Heuristic evaluation cost

Let $T_h$ be the time to evaluate the heuristic once.

If the algorithm evaluates it for every successful relaxation, heuristic work contributes $O(P T_h)$.

A pattern-database lookup may be more informative than Manhattan distance but more expensive to build and access.

Caching $h(n)$ can help when states are improved repeatedly and the estimate depends only on the state and fixed goal.

Caching is unsafe if the heuristic depends on mutable world data not included in the cache key.

### Measuring the useful quantities

Wall-clock time alone cannot explain a pathfinder regression.

Useful counters include:

- live states expanded;
- edges examined;
- successful relaxations;
- stale queue entries discarded;
- maximum live frontier size;
- heuristic evaluations and their total time;
- reconstructed path length and cost.

Comparing these counters between heuristics shows whether time changed because of search effort or per-state overhead.

## 6. Systems Connections

### Navigation meshes in games

Large game worlds rarely run A* over every renderable point.

They build a navigation graph from walkable polygons, waypoints, or hierarchical regions.

The graph encodes topology while local steering handles continuous movement inside a region.

Straight-line distance can be a lower bound when traversal cost is at least physical distance.

Terrain multipliers, doors, jump links, and one-way passages belong in edge costs and successor rules.

Multiple agents introduce another layer: an individually shortest static path may cause crowd congestion or collisions.

A* solves the single-query graph problem presented to it; it does not solve multi-agent coordination automatically.

### Road routing and hierarchical search

Continental road graphs are too large for naive per-request exploration.

Production routers combine goal-directed search with preprocessing, hierarchies, landmarks, or bidirectional techniques.

An admissible landmark heuristic can use triangle inequalities between precomputed landmark distances.

Road restrictions require the state to capture more than the current intersection.

A turn restriction may require a state such as `(intersection, incoming_edge)`.

Time-dependent travel costs may require departure time in the state or a specialized time-dependent shortest-path model.

If the model omits those variables, even a perfect A* implementation optimizes the wrong graph.

### Robotics and configuration spaces

A mobile robot's state may be $(x,y,\theta)$ rather than merely $(x,y)$.

For a manipulator, a state may be a vector of joint angles.

Collision checking can dominate queue operations because validating one candidate motion is expensive.

A heuristic based on geometric distance ignores obstacles and is often admissible, but it may be weak in a maze-like environment.

Motion primitives encode what the machine can physically execute.

Their costs may combine time, energy, risk, and clearance.

The chosen scalar cost function determines what “optimal” means.

### Puzzle solving and pattern databases

Sliding-tile puzzles expose the value of heuristic dominance clearly.

The number of misplaced tiles is admissible but weak.

The sum of Manhattan distances of tiles is usually stronger.

A pattern database precomputes exact abstract distances for subsets of pieces.

Those values remain lower bounds for the full puzzle when the abstraction is constructed correctly.

Combining heuristics with `max(h1, h2)` preserves admissibility and dominates either component alone.

Adding two heuristics is admissible only when their represented costs are disjoint or another proof justifies the sum.

### Network and workflow planning

A* can search dependency or workflow state spaces when each transition has a cost and the goal condition is explicit.

The heuristic must estimate remaining cost, not merely correlate with desirable states.

For latency routing, geographic distance may be a poor lower bound because propagation, queuing, and policy costs dominate.

For a build planner, the state must represent completed prerequisites and reusable artifacts.

Cycles in the underlying dependency graph are not inherently a problem for graph-search A*, but state identity and non-negative transition costs still matter.

### Dynamic replanning

Repeatedly running A* from scratch is reasonable when maps are small or updates are rare.

When edge costs change frequently, incremental algorithms can reuse information from earlier searches.

Lifelong Planning A* and D* Lite are examples of algorithms designed around changed costs.

They are not drop-in heuristic functions for ordinary A*.

They maintain additional state and invariants across replanning episodes.

The right choice depends on whether queries, goals, starts, or edge costs change most often.

### Weighted A* and bounded compromise

Weighted A* uses

$$
f_w(n)=g(n)+w h(n)
$$

for $w>1$.

The larger heuristic influence often reduces expansions.

It also allows the algorithm to overlook the optimal path.

Under the appropriate admissibility assumptions, common weighted-A* formulations provide a multiplicative suboptimality bound rather than exact optimality.

This can be a sensible product decision when response time matters more than the last few percent of route cost.

The API and telemetry should expose that choice instead of calling every returned path “optimal.”

### Bidirectional A* is not two independent searches

Searching forward from the start and backward from the goal can reduce the effective depth.

Correct termination is subtler than stopping when the two frontiers first touch.

The forward and reverse heuristics must be compatible with the chosen termination bound.

Directed edges must be reversed correctly for backward expansion.

An early meeting can join two nonoptimal prefixes.

Bidirectional A* should therefore be implemented from a proved variant rather than improvised around ordinary A*.

## 7. Practice Checklist

### Model the problem before selecting a heuristic

- Identify the complete state, including orientation, resources, keys, or time when they affect future moves.
- Define the goal predicate separately from a visual notion of closeness.
- List every legal transition from a state.
- Assign one unit and meaning to edge cost.
- Verify that all edge costs are finite and non-negative.
- Decide whether the graph is explicit or generated lazily.
- Decide whether a path, only its cost, or all equally optimal paths are required.

### Prove the heuristic contract

- State what $h(n)$ estimates.
- Prove $h(n) \le d(n,t)$ rather than relying on intuition.
- Set or verify $h(t)=0$.
- Check cost units and scaling.
- Test the consistency inequality on representative edges.
- Use `max` to combine admissible heuristics when no additive proof exists.
- Treat heuristic caching as valid only when its inputs are immutable or fully keyed.
- Compare against the zero heuristic to isolate heuristic-related defects.

### Audit the implementation

- Keep a best-known `g_score` for each state.
- Update the predecessor whenever and only whenever the score improves.
- Do not stop when the goal is merely generated.
- Detect stale priority-queue entries.
- Reopen improved states unless consistency and the closed-set implementation are proved.
- Add a deterministic tie-breaker for non-orderable states.
- Keep goal testing and stale-entry checks in the intended order.
- Return an explicit no-path result when the frontier empties.
- Validate invalid numeric inputs at the graph boundary.
- Add cancellation without returning a partial route as a completed optimum.

### Test correctness with adversarial cases

- Start equal to goal.
- Goal unreachable from start.
- Multiple paths to one state, with the better path discovered later.
- Equal-cost alternative routes.
- Zero-cost edges.
- Directed edges whose reverse does not exist.
- Admissible inconsistent heuristic.
- Deliberately overestimating heuristic to confirm the test can detect suboptimality.
- Floating-point costs near the application's comparison tolerance.
- Hashable states with no ordering relation.
- Random small graphs checked against Dijkstra.

### Measure search behavior

- Record expanded states, not only elapsed time.
- Record successful relaxations and stale pops.
- Track peak frontier size.
- Time heuristic evaluation separately from neighbor generation.
- Compare path cost against a baseline solver.
- Test realistic obstacle and cost distributions.
- Include unreachable cases, which may exhaust the reachable graph.
- Profile cold caches and warm caches separately when heuristics use precomputed data.

### Explore the design space

1. Implement A* with $h=0$ and verify equivalence to Dijkstra.
2. Add a weak admissible heuristic and compare expansion counts.
3. Add a dominating admissible heuristic and measure its evaluation cost.
4. Construct an admissible inconsistent heuristic and observe reopening.
5. Change equal-$f$ tie-breaking and compare expansions without changing path cost.
6. Implement Iterative Deepening A* for a memory-constrained puzzle.
7. Evaluate Weighted A* and quantify route-cost versus latency trade-offs.
8. Model a turn-restricted road graph with edge-aware state identity.
9. Version a dynamic map and reject results computed from stale versions.
10. Add property-based tests that compare random cases with Dijkstra.

### Questions to answer during review

- What exactly makes two states equivalent?
- Can the heuristic ever see mutable information that edge generation cannot see?
- Is the heuristic admissible for the cheapest terrain type, not the average type?
- Does a closed set accidentally suppress a later cheaper route?
- Can duplicate heap entries make memory exceed the service budget?
- Does the timeout distinguish cancellation from “no path exists”?
- Is an approximate result labeled with its approximation policy?
- Are map version and cost-model version present in caches and telemetry?
- Can path reconstruction loop because predecessor data was corrupted?
- Is the returned route validated against the same graph snapshot searched?

## 8. Frequently Asked Questions

### Is A* just Dijkstra's algorithm with a heuristic?

Operationally, that is a useful description.

Dijkstra orders the frontier by $g(n)$, while A* orders it by $g(n)+h(n)$.

Setting $h(n)=0$ makes their priority rules identical.

The heuristic introduces additional proof obligations and can change expansion order dramatically.

### Does an admissible heuristic guarantee optimality by itself?

Not for every implementation called “A*.”

The search must also perform correct relaxation, preserve improved paths, terminate at the correct event, and handle reopened states when the heuristic is inconsistent.

Admissibility is a property of $h$; optimality is a property of the complete algorithm under its assumptions.

### What is the difference between admissible and consistent?

Admissibility compares $h(n)$ with the true cost from $n$ to the goal.

Consistency compares heuristic values across every edge using a triangle inequality.

Consistency implies that $f$ values do not decrease along generated paths.

That permits a simpler closed-set implementation without reopening.

### Why not stop as soon as the goal is inserted into the frontier?

The first discovered path to the goal may be expensive.

Another frontier state can still lead to a cheaper goal path.

The worked trace first inserts `G` at cost $8$ and later improves it to $6$.

Stopping on discovery would return the wrong answer.

### Why can the heap contain the same state more than once?

A cheaper route may be found after an earlier entry was pushed.

Python's `heapq` does not provide a general indexed decrease-key operation.

Pushing the improved entry and discarding the older one when popped is a standard lazy-update technique.

The `g_score` table identifies which entry is current.

### Is Manhattan distance always valid on a grid?

No.

It is appropriate for four-direction movement when each step costs at least the scale applied to the Manhattan distance.

Diagonal movement, teleportation, discounted terrain, and unrelated cost units can invalidate it.

Derive the lower bound from the movement and cost model.

### Can A* use negative edges?

Ordinary A* should not be used with negative edge costs.

Negative edges invalidate the finalization logic and can coexist with negative cycles for which no finite shortest path exists.

Transform the problem when valid or select an algorithm designed for negative weights.

### What happens if the heuristic overestimates?

The search may expand fewer states, but exact optimality is no longer guaranteed.

That can be deliberate, as in Weighted A*, when the application accepts bounded or empirical suboptimality.

The behavior should be documented and tested as approximation rather than silently presented as exact A*.

### Which tie-breaker should A* use?

Any deterministic rule confined to equal $f$ values preserves the primary ordering.

Favoring larger $g$ or smaller $h$ often explores more deeply toward the goal.

An insertion counter prevents comparisons between arbitrary state objects and makes runs reproducible.

Benchmark tie-breakers on the actual graph distribution.

### Why does A* sometimes run out of memory?

It retains the frontier and bookkeeping needed to reconstruct and improve paths.

Weak heuristics in broad implicit spaces can generate exponentially many states.

Lazy duplicate queue entries add further temporary memory.

Memory-bounded alternatives trade extra computation or weaker guarantees for a smaller retained frontier.

### Can the heuristic be cached?

Yes, when it is a deterministic function of the state, goal, and immutable cost model.

The cache key must include every input that affects the estimate.

For changing maps or goals, an underspecified cache key can preserve an obsolete value and break both guidance and admissibility.

### How should A* be validated in a real system?

Use Dijkstra as an oracle on small non-negative graphs, verify returned edges and total cost, and test unreachable and improved-path cases.

Instrument expansions, relaxations, stale entries, and peak frontier size.

Finally, validate the path against the same versioned graph snapshot used during search.

### When should another algorithm be preferred?

Use breadth-first search for unweighted graphs when no heuristic is needed.

Use Dijkstra when there is no defensible goal heuristic or when distances to many targets are required.

Use Iterative Deepening A* when memory dominates and repeated depth-first work is acceptable.

Use incremental methods when edge costs change between related searches.

Use a proved approximate variant when strict optimality costs more latency than the product can afford.
