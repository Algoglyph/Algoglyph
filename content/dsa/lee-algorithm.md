# Lee Algorithm: Shortest Paths Through Unweighted Grids

![Lee grid pathfinding](/images/dsa/lee-algorithm-dark.jpg#dark)

The Lee algorithm finds a shortest route through a grid by expanding a breadth-first wave from the source.
Every cell is labeled with the minimum number of moves needed to reach it.
Backtracking through decreasing labels reconstructs one shortest path, if a path exists.

## 1. Historical Context & Motivation

### Routing through discrete space

Many routing problems are naturally grids.
A maze occupies square cells.
A printed-circuit board uses discrete tracks.
A warehouse robot moves between neighboring locations.
Obstacles block some cells while the remaining cells permit uniform-cost moves.

The challenge is not merely to find a route.
It is to find one with the fewest allowed moves.
Depth-first search can discover a route quickly and still return a long detour.
Greedy movement toward the goal can become trapped behind a wall.

### Lee's wave expansion

C. Y. Lee described a path-connection algorithm for printed-circuit layouts in 1961.
The method propagates a numbered wave through free grid cells.
The source receives distance zero.
Its free neighbors receive one.
Their previously unseen neighbors receive two, and expansion continues layer by layer.

The first time the destination is reached, its label is the shortest path length.
This is breadth-first search specialized to a grid graph.

### Why the name still matters

Calling the method “Lee algorithm” emphasizes two operational phases:

1. **wave propagation** labels reachable cells;
2. **traceback** follows decreasing labels to recover a route.

Generic BFS often stores parent pointers during discovery instead.
Both approaches rely on the same shortest-path theorem for unweighted graphs.

### Appropriate movement model

The classic form uses four orthogonal moves:

$$
(-1,0),(1,0),(0,-1),(0,1).
$$

Diagonal movement can be added if every diagonal has the same unit cost and corner-cutting rules are explicit.
If orthogonal and diagonal moves have different costs, ordinary BFS is no longer correct.
Dijkstra's algorithm is then the proper baseline.

### Problem statement

Given a grid with $R$ rows and $C$ columns, a start cell $s$, a destination $t$, and a predicate identifying passable cells, return:

- a shortest valid path from $s$ to $t$;
- its number of moves; or
- an unreachable result when no path exists.

Every move in the classic model has cost one.
The grid is static during a single search.

### Strengths and limits

Lee's algorithm is complete and optimal for finite unweighted grids.
It will find a path whenever one exists and return a minimum-move path.
Its main limitation is memory and search breadth.
In an open $R\times C$ grid, it may label nearly all $RC$ cells.

A* can inspect fewer cells when a consistent heuristic points toward one destination.
Bidirectional BFS can reduce the effective radius for a single source-target query.
Lee remains the dependable reference because its correctness does not depend on heuristic quality.

## 2. Core Mathematical Invariants

### The implicit graph

Treat every passable cell as a vertex.
Add an undirected edge between two cells when one legal move connects them.
The grid does not need an explicit adjacency list because neighbors can be generated from coordinates.

For four-way movement, the graph has at most $RC$ vertices and fewer than $2RC$ undirected edges up to boundary terms.
Lee's algorithm is therefore BFS on this implicit graph.

### Distance definition

Let $\delta(s,v)$ be the minimum number of legal moves from source $s$ to cell $v$.
If $v$ is unreachable, define $\delta(s,v)=\infty$.

The distance array begins with

$$
d[s]=0
$$

and every other cell marked unvisited.
When a cell $v$ is first discovered from cell $u$, assign

$$
d[v]=d[u]+1.
$$

### Queue-layer invariant

At every point in BFS, queued cells appear in nondecreasing distance order.
When a cell of distance $k$ is removed, every cell with distance below $k$ has already been removed.
Newly discovered neighbors receive distance $k+1$ and enter behind all earlier layers.

This ordering comes from the FIFO queue.
A stack would destroy it.
A priority queue is unnecessary while every edge cost equals one.

### First-discovery optimality

When a cell $v$ is first discovered with label $k$, there is a concrete path of length $k$ through its discovering parent.
Suppose a shorter path of length below $k$ existed.
Its predecessor would lie in an earlier BFS layer and would have discovered $v$ first.
That contradiction proves

$$
d[v]=\delta(s,v).
$$

The cell should therefore be marked visited when enqueued, not when dequeued.
Late marking can enqueue the same cell several times and complicate parent assignment.

### Wavefront invariant

After all cells with label at most $k$ have been processed, every reachable cell at distance at most $k+1$ has been discovered.
The frontier separates the known ball around the source from unexplored cells.

Obstacles do not receive labels.
They shape the wave by forcing it around blocked regions.

### Parent invariant

Instead of retaining all numeric labels, store one parent for every discovered cell other than the source.
If `parent[v] = u`, then $u$ is adjacent to $v$ and

$$
d[u]+1=d[v].
$$

Following parents from destination to source strictly decreases distance.
It must terminate after exactly $d[t]$ links.

### Label-only traceback

The historical traceback can omit parent pointers.
From destination at label $k$, choose any passable neighbor labeled $k-1$.
Repeat until reaching zero.

Such a neighbor must exist because the discovery path established one.
Multiple choices indicate multiple shortest paths.
A fixed direction order provides deterministic tie-breaking.

### Early termination

For a single destination, the search may stop when the destination is discovered.
At that moment its distance is final by first-discovery optimality.
Stopping when it is dequeued is also correct but can process more cells in the same layer.

For a complete distance map or multiple future targets, continue until the queue empties.

### Unreachable invariant

If the queue becomes empty without discovering $t$, every cell reachable from $s$ has been processed.
Any path to $t$ would have caused it to be discovered from its predecessor.
Therefore no valid path exists under the supplied movement model.

### Multiple sources

Insert every source into the queue with distance zero before expansion.
The same invariant then computes distance to the nearest source.
Each cell is claimed by the first wave that reaches it, with ties resolved by source and neighbor insertion order.

## 3. Step-by-Step Execution Trace

### Grid and objective

Use `S` for the start, `T` for the target, `#` for a wall, and `.` for a free cell:

```text
S . # . .
# . # . #
. . . . #
. # # . .
. . . . T
```

Coordinates are `(row, column)` with zero-based indexing.
The start is $s=(0,0)$ and target is $t=(4,4)$.
Movement is orthogonal.

### Initialization

Set `distance[0][0] = 0`.
Every other cell has distance `-1`, meaning undiscovered.
Enqueue `(0,0)`.

```text
queue: [(0,0)]
```

The start's upper and left neighbors are outside the grid.
Its lower neighbor `(1,0)` is blocked.
Its right neighbor `(0,1)` is free.

### Distance one

Discover `(0,1)` with label one and parent `(0,0)`.

```text
0 1 # . .
# . # . #
. . . . #
. # # . .
. . . . T
```

The queue now contains `(0,1)`.

### Distance two

Remove `(0,1)`.
Its left neighbor is already visited.
Its right neighbor is blocked.
Its lower neighbor `(1,1)` is free.
Assign label two.

```text
0 1 # . .
# 2 # . #
. . . . #
. # # . .
. . . . T
```

### Distances three and four

From `(1,1)`, discover `(2,1)` with distance three.
From `(2,1)`, discover `(2,0)` and `(2,2)` with distance four.

```text
0 1 # . .
# 2 # . #
4 3 4 . #
. # # . .
. . . . T
```

Both distance-four cells enter the queue.
Their order depends on the configured direction list.

### Continue around obstacles

From `(2,0)`, discover `(3,0)` at distance five.
From `(2,2)`, discover `(2,3)` at distance five.

The wave has split around different local passages.
The branch through `(3,0)` reaches lower-left cells.
The branch through `(2,3)` reaches the corridor toward the target.

### Reach the lower corridor

From `(2,3)`, discover `(1,3)` and `(3,3)` at distance six.
From `(3,3)`, discover `(3,4)` and `(4,3)` at distance seven.

The relevant labels are now:

```text
0 1 # . .
# 2 # 6 #
4 3 4 5 #
5 # # 6 7
6 7 8 7 T
```

Some lower-left labels may be produced in a different order, but their minimum values remain the same.

### Discover the target

Cell `(3,4)` is adjacent to target `(4,4)`.
When `(3,4)` is processed, assign

$$
d[4][4]=d[3][4]+1=8.
$$

The first-discovery invariant proves that eight is the minimum move count.
The search can stop.

### Reconstruct the route

Follow parents backward from `(4,4)`:

```text
(4,4) <- (3,4) <- (3,3) <- (2,3) <- (2,2)
      <- (2,1) <- (1,1) <- (0,1) <- (0,0)
```

Reverse that sequence:

```text
(0,0), (0,1), (1,1), (2,1), (2,2),
(2,3), (3,3), (3,4), (4,4)
```

It contains nine cells and therefore eight moves.

### Validate the path

Every consecutive pair differs by one in exactly one coordinate.
No listed cell is blocked.
The first cell is the source and the last is the target.
Distance increases by one along the forward path.

Those checks validate the reconstructed route independently of its visual appearance.

### Unreachable variation

Block `(2,2)` and `(3,0)`.
The wave from the start can reach `(2,1)` but cannot cross into the right or lower regions.
The queue eventually empties while the target remains `-1`.
The correct result is unreachable, not an empty path ambiguously representing source equals target.

### Source equals destination

If $s=t$, return path `[s]` and distance zero immediately.
No wave expansion is needed.
This differs from unreachable, which returns no path and no finite distance.

## 4. Production-Ready Implementations

### Python implementation with parent reconstruction

```python
from collections import deque
from collections.abc import Sequence


Cell = tuple[int, int]
DIRECTIONS: tuple[Cell, ...] = ((-1, 0), (0, 1), (1, 0), (0, -1))


def lee_shortest_path(
    grid: Sequence[Sequence[int]],
    start: Cell,
    target: Cell,
) -> tuple[int, list[Cell]] | None:
    rows = len(grid)
    if rows == 0:
        raise ValueError("grid must contain at least one row")
    columns = len(grid[0])
    if columns == 0 or any(len(row) != columns for row in grid):
        raise ValueError("grid must be nonempty and rectangular")

    def inside(cell: Cell) -> bool:
        row, column = cell
        return 0 <= row < rows and 0 <= column < columns

    if not inside(start) or not inside(target):
        raise ValueError("start and target must be inside the grid")
    if grid[start[0]][start[1]] != 0 or grid[target[0]][target[1]] != 0:
        return None
    if start == target:
        return 0, [start]

    distance = [[-1] * columns for _ in range(rows)]
    parent: dict[Cell, Cell] = {}
    distance[start[0]][start[1]] = 0
    queue = deque([start])

    while queue:
        row, column = queue.popleft()
        for delta_row, delta_column in DIRECTIONS:
            neighbor = (row + delta_row, column + delta_column)
            if not inside(neighbor):
                continue
            nr, nc = neighbor
            if grid[nr][nc] != 0 or distance[nr][nc] != -1:
                continue

            distance[nr][nc] = distance[row][column] + 1
            parent[neighbor] = (row, column)
            if neighbor == target:
                path = [target]
                while path[-1] != start:
                    path.append(parent[path[-1]])
                path.reverse()
                return distance[nr][nc], path
            queue.append(neighbor)

    return None


maze = [
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
]
answer = lee_shortest_path(maze, (0, 0), (4, 4))
assert answer is not None
assert answer[0] == 8
assert len(answer[1]) == 9
assert lee_shortest_path([[0]], (0, 0), (0, 0)) == (0, [(0, 0)])
assert lee_shortest_path([[0, 1, 0]], (0, 0), (0, 2)) is None
```

The code marks a cell when enqueued.
It returns immediately after discovering the destination because the assigned distance is already final.
The value zero means passable and every other value means blocked; adapt the predicate rather than scattering alternate conventions through the loop.

### Distance-only implementation

If no path is needed, parent storage can be removed.
The distance matrix alone answers the minimum move count and supports wave visualization.
For a single query, a one-dimensional packed distance array can improve locality.

### C++ implementation

```cpp
#include <algorithm>
#include <array>
#include <optional>
#include <queue>
#include <stdexcept>
#include <utility>
#include <vector>

using Cell = std::pair<int, int>;

struct PathResult {
    int distance;
    std::vector<Cell> path;
};

std::optional<PathResult> lee_path(
    const std::vector<std::vector<int>>& grid,
    Cell start,
    Cell target
) {
    if (grid.empty() || grid.front().empty()) {
        throw std::invalid_argument("grid must be nonempty");
    }
    const int rows = static_cast<int>(grid.size());
    const int columns = static_cast<int>(grid.front().size());
    for (const auto& row : grid) {
        if (static_cast<int>(row.size()) != columns) {
            throw std::invalid_argument("grid must be rectangular");
        }
    }

    auto inside = [rows, columns](Cell cell) {
        return cell.first >= 0 && cell.first < rows &&
               cell.second >= 0 && cell.second < columns;
    };
    if (!inside(start) || !inside(target)) {
        throw std::out_of_range("endpoint outside grid");
    }
    if (grid[start.first][start.second] != 0 ||
        grid[target.first][target.second] != 0) {
        return std::nullopt;
    }

    std::vector<std::vector<int>> distance(rows, std::vector<int>(columns, -1));
    std::vector<std::vector<Cell>> parent(
        rows, std::vector<Cell>(columns, Cell{-1, -1})
    );
    std::queue<Cell> queue;
    queue.push(start);
    distance[start.first][start.second] = 0;

    constexpr std::array<Cell, 4> directions = {
        Cell{-1, 0}, Cell{0, 1}, Cell{1, 0}, Cell{0, -1}
    };

    while (!queue.empty()) {
        const Cell current = queue.front();
        queue.pop();
        if (current == target) break;

        for (Cell delta : directions) {
            Cell next{current.first + delta.first, current.second + delta.second};
            if (!inside(next) || grid[next.first][next.second] != 0 ||
                distance[next.first][next.second] != -1) {
                continue;
            }
            distance[next.first][next.second] =
                distance[current.first][current.second] + 1;
            parent[next.first][next.second] = current;
            queue.push(next);
        }
    }

    if (distance[target.first][target.second] == -1) {
        return std::nullopt;
    }
    std::vector<Cell> path;
    for (Cell at = target; at != Cell{-1, -1};
         at = parent[at.first][at.second]) {
        path.push_back(at);
        if (at == start) break;
    }
    std::reverse(path.begin(), path.end());
    return PathResult{distance[target.first][target.second], std::move(path)};
}
```

The C++ version stops when the destination is dequeued rather than discovered.
Both choices are correct for BFS.

### Deterministic tie-breaking

Several shortest paths may exist.
The direction order determines which parent is recorded first.
If reproducibility matters, keep the direction order fixed and document it.
Do not promise lexicographically smallest paths unless the traversal order and proof establish that property.

### Memory reductions

If only reachability is needed, use a bitset for visited cells.
If distance is bounded, choose the smallest safe integer type and define overflow behavior.
If only a path is needed, parent directions can be encoded in two or three bits per cell instead of storing coordinate pairs.

## 5. Asymptotic Time & Space Complexity

### Time complexity

Each passable cell is enqueued at most once.
When removed, at most four neighbors are examined in the orthogonal model.
Thus the running time is

$$
O(RC).
$$

More generally, for the implicit graph it is $O(V+E)$.
Because grid degree is bounded by a constant, $E=O(V)$.

The best case for source equal to target is $O(1)$.
Early discovery can stop before scanning the whole grid, but worst-case unreachable targets still require exploring every reachable cell.

### Space complexity

The distance matrix uses $O(RC)$ space.
Parent information uses $O(RC)$ in the worst case.
The queue can contain $O(RC)$ cells, although ordinary two-dimensional wavefronts are often smaller.

Total auxiliary space is

$$
O(RC).
$$

Removing either distances or parents can reduce constants, not the worst-case order when every cell needs a visited mark.

### Path reconstruction

If the returned path has length $L$, reconstruction costs $O(L)$ time and output space.
Since $L\le RC-1$ for a simple shortest path, this is within the search bound.

### Weighted alternatives

For edge weights in $\{0,1\}$, use 0–1 BFS with a deque in $O(V+E)$.
For arbitrary nonnegative weights, Dijkstra runs in $O((V+E)\log V)$ with a binary heap.
For a consistent A* heuristic, worst-case exploration can still be large, but typical directed search may improve.

### Bidirectional BFS

Running waves from both endpoints can reduce explored volume in open spaces.
It still has $O(RC)$ worst-case time and space.
Correct path reconstruction requires detecting a meeting edge or cell and joining two parent chains.

## 6. Systems Connections

### Printed-circuit routing

Lee's original context was routing connections through a grid while avoiding occupied regions.
Shortest geometric length is only one objective in modern layout.
Layer changes, congestion, electrical rules, and multiple nets introduce weights and constraints beyond classic Lee routing.

### Maze and game navigation

For tile maps with uniform movement cost, Lee labels give exact shortest paths.
Large games often use hierarchical navigation, A*, navigation meshes, or cached flow fields because running a full grid wave per agent is expensive.

### Warehouse robotics

A grid can encode shelves as obstacles and aisles as free cells.
Lee returns a shortest path in the static map.
Moving robots require time-expanded reservations or conflict-resolution algorithms; shortest spatial paths alone can collide.

### Distance transforms and flow fields

Run multi-source BFS from all goals or hazards.
The resulting labels give each cell's distance to the nearest source.
Choosing a neighbor with decreasing distance creates a flow toward the closest source.
Uniform edge cost is still required.

### Image processing

Binary images can be treated as grids of foreground and background pixels.
BFS labels connected regions or computes city-block distance under four-neighbor movement.
Euclidean distance transforms require different methods because grid-step count is not Euclidean distance.

### Dynamic obstacles

If one obstacle changes, recomputing the complete wave is simple but potentially expensive.
For occasional updates on moderate grids, simplicity may win.
High-frequency dynamic planning calls for incremental search methods such as D* Lite or Lifelong Planning A*.

### Parallel wave propagation

All cells in one distance layer can be expanded in parallel.
Deduplicating claims to the same next-layer cell requires atomic marking or partition-aware merging.
GPU implementations benefit from regular grids but can suffer from irregular frontier sizes and memory contention.

### Security boundaries

Untrusted dimensions can trigger huge allocations through $R\times C$ multiplication.
Validate dimensions, multiplication overflow, endpoint coordinates, and maximum cell count before allocating.
Bound path output when an API cannot safely return enormous results.

## 7. Practice Checklist

### Define movement

- Choose four-way or eight-way neighbors.
- Define diagonal corner-cutting.
- Confirm every legal move has equal cost.
- Define passable and blocked cell values.
- Define whether endpoints may be blocked.
- Define deterministic direction order.

### Initialize correctly

- Validate a nonempty rectangular grid.
- Validate source and target coordinates.
- Handle source equal to target.
- Mark source visited before enqueueing.
- Initialize all other distances as undiscovered.
- Keep parent state separate from obstacle state.

### Expand safely

- Use a FIFO queue.
- Generate only legal neighbors.
- Check bounds before indexing.
- Skip blocked cells.
- Skip already discovered cells.
- Mark cells when enqueued.
- Assign distance as parent distance plus one.
- Stop early only when one target is sufficient.

### Reconstruct correctly

- Return unreachable distinctly from an empty path.
- Begin at the target.
- Follow parent links to the source.
- Ensure every link decreases distance by one.
- Reverse the collected sequence.
- Include both source and target.
- Define tie behavior when several shortest paths exist.

### Test cases

- One free cell.
- Blocked source.
- Blocked target.
- Adjacent endpoints.
- Straight corridor.
- Open grid with many shortest paths.
- Unreachable target.
- Narrow route around walls.
- Non-square grid.
- Malformed ragged grid.
- Largest supported dimensions.

### Validate output

- Path starts at source.
- Path ends at target.
- Every path cell is passable.
- Consecutive cells are legal neighbors.
- Path moves equal returned distance.
- Distance matches an independent BFS.
- Removing one path edge breaks that exact sequence.
- Unreachable cases return no finite distance.

### Choose another algorithm when needed

- Use 0–1 BFS for zero/one costs.
- Use Dijkstra for general nonnegative costs.
- Use A* for goal-directed search with a sound heuristic.
- Use bidirectional BFS for one distant target.
- Use dynamic planners for changing maps.
- Use multi-source BFS for nearest-source fields.

## 8. Frequently Asked Questions

### Is Lee's algorithm different from BFS?

It is BFS applied to grid routing, traditionally described as wave propagation followed by traceback.
The shortest-path theorem is the standard unweighted BFS theorem.

### Why does the first visit give the shortest distance?

The FIFO queue processes cells by nondecreasing distance.
A shorter path would have reached the cell from an earlier layer first.

### Why mark a cell when enqueueing it?

That prevents multiple frontier cells from enqueueing the same neighbor.
Its first discovery already has minimum distance.

### Can the algorithm use diagonal moves?

Yes if diagonal moves are legal and have the same cost as every other move.
If costs differ, use a weighted shortest-path algorithm.

### Does it always return the same shortest path?

Only with a fixed neighbor order and deterministic queue behavior.
Several paths can have the same minimum length.

### Do I need both distance and parent arrays?

No.
Parents reconstruct a path directly; distance labels can reconstruct by moving to a neighbor with label one lower.
Keeping both can simplify diagnostics.

### Can I stop when the target is discovered?

Yes for uniform-cost BFS and a single target.
The discovery distance is already final.

### What if the target is unreachable?

The queue empties without labeling it.
Return an explicit unreachable result rather than a misleading zero distance.

### Does Lee minimize turns?

No.
It minimizes the number of moves.
Among equal-length paths, turn count depends on tie order unless direction is included in a weighted state model.

### Does Lee minimize Euclidean distance?

No.
Four-way movement minimizes Manhattan step count under the grid model.
That is not the same as continuous Euclidean length.

### How can several targets be handled?

Continue one BFS until every desired target is discovered, or compute a complete distance map.
For distance to the nearest of several sources, initialize the queue with all sources.

### Why can DFS return a longer path?

DFS follows one branch deeply before exploring alternatives.
Its first discovered target has no guarantee of minimum depth.

### When is A* preferable?

When one destination is known, movement costs are nonnegative, and an admissible heuristic can focus exploration.
Lee is simpler and provides a heuristic-free baseline.

### How should huge grids be represented?

Use packed obstacle and visited arrays, compact parent directions, and checked linear indexing.
Sparse worlds may benefit from storing only reachable cells rather than a dense matrix.

### What is the most common implementation bug?

Using a stack or marking visited only after dequeueing.
The first loses shortest-layer order; the second causes repeated queue entries.

### What should I study next?

Study multi-source BFS, bidirectional BFS, 0–1 BFS, Dijkstra, and A* to see how queue discipline changes with the movement-cost model.
