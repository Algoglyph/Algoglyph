# Island Traversal: Connected Components in an Implicit Grid Graph

![Grid cells grouped into connected islands](/images/dsa/island-traversal-dark.png#dark)

## 1. Historical Context & Motivation

A grid can encode a graph without storing a single explicit edge.

Each traversable cell is a vertex.

Its neighboring traversable cells define edges.

Counting islands is therefore connected-component discovery on an implicit graph.

The familiar binary version labels land with `1` and water with `0`.

An island is a maximal set of land cells connected under a chosen neighborhood rule.

Four-directional connectivity uses up, down, left, and right.

Eight-directional connectivity also includes diagonals.

Those rules produce different answers on the same grid.

They are part of the problem definition, not an implementation detail.

Island traversal appears in image segmentation, flood fill, map analysis, board games, occupancy grids, and connected-region cleanup.

The outer scan finds an unvisited component seed.

A DFS or BFS then consumes every cell in that component.

The next unvisited land cell begins another component.

This pattern generalizes beyond Boolean grids.

A predicate can decide whether neighboring cells belong to the same region.

Weights can track region area or cost.

Boundary edges can contribute perimeter.

Component labels can replace a simple count.

The implementation choice concerns visited state.

A separate Boolean matrix preserves the input.

A set stores only visited coordinates but adds hashing overhead.

In-place marking reuses the grid but destroys or transforms input values.

Recursive DFS mirrors graph theory but can overflow the call stack on a large component.

Iterative DFS and BFS move the frontier into explicit memory with controllable limits.

The algorithm must also handle malformed grids deliberately.

A rectangular matrix permits one shared column bound.

A ragged matrix needs row-specific bounds.

Empty input and empty rows require defined behavior.

The central question is:

How does a complete outer scan plus a component traversal guarantee that every land cell is visited exactly once and every island is counted exactly once?

## 2. Core Mathematical Invariants

Let the grid have $R$ rows and $C$ columns.

For a rectangular grid, the coordinate set is:

$$
V=\{(r,c)\mid 0\le r<R,\ 0\le c<C\}.
$$

Let $L\subseteq V$ be land coordinates.

Under four-directional connectivity, offsets are:

$$
D_4=\{(-1,0),(1,0),(0,-1),(0,1)\}.
$$

Two land vertices share an edge when their coordinate difference belongs to $D_4$.

An island is a connected component of graph $G=(L,E)$.

### Bounds invariant

Every coordinate placed on the traversal frontier is inside the grid.

Bounds are checked before reading a neighbor cell.

This is a memory-safety requirement in low-level languages.

It is also a correctness requirement in languages where negative indices wrap from the end.

In Python, reading `grid[-1][c]` does not fail; it reads the last row and creates a false edge.

### Frontier invariant

Every cell in the DFS stack or BFS queue is land discovered for the current component.

It has been marked visited before entering the frontier.

Mark-on-enqueue prevents two parents from adding the same neighbor repeatedly.

Marking only when removing from the frontier can inflate memory dramatically.

### Visited invariant

A visited land cell belongs to exactly one already started component.

It is never reconsidered as a new seed.

Water cells never enter a component frontier.

The visited state grows monotonically.

No operation turns a visited cell back into unvisited land during counting.

### Component-completeness invariant

When traversal from seed $s$ finishes, every land cell reachable from $s$ has been visited.

Proof follows path length.

The seed is visited initially.

If a reachable cell at path distance $k$ is visited, its valid land neighbor at distance $k+1$ is discovered and marked.

Thus all finite reachable paths are covered.

### One seed per component

The outer scan increments the count only for unvisited land.

Traversal then marks the seed's entire component.

Later cells in that component are skipped.

Every component contains at least one cell encountered by the complete scan.

Therefore every component increments the count exactly once.

### In-place marking invariant

If `1` means unvisited land, change it to a distinct visited value before enqueueing neighbors.

Using `0` makes visited land indistinguishable from water after traversal.

That is acceptable for count-only destructive APIs.

It is not acceptable when later logic needs original terrain classes.

The mutation contract must be explicit.

### Connectivity invariant

All code paths must use the same direction set.

Counting with four neighbors but computing area with eight neighbors describes inconsistent components.

Diagonal connectivity should be selected once and passed through the traversal.

### Work invariant

Each coordinate is scanned by the outer loop once.

Each land coordinate enters a frontier at most once.

Each visit examines a constant number of directions.

This yields linear time in grid area.

## 3. Step-by-Step Execution Trace

Use four-directional connectivity on this grid:

```text
1 1 0 0 0
1 0 0 1 1
0 0 1 0 1
0 0 0 0 0
1 1 0 1 0
```

There are five rows and five columns.

### Scan cell `(0,0)`

It is unvisited land.

Increment island count from zero to one.

Mark `(0,0)` visited and enqueue it.

Queue: `[(0,0)]`.

Remove `(0,0)`.

Its valid land neighbors are `(1,0)` and `(0,1)`.

Mark both before enqueueing.

Queue: `[(1,0),(0,1)]`.

Remove `(1,0)`.

Its land neighbor `(0,0)` is already visited.

Other neighbors are water or outside bounds.

Remove `(0,1)`.

Its only land neighbor `(0,0)` is visited.

The queue empties.

First island is `{(0,0),(1,0),(0,1)}` with area three.

### Continue first row

Cell `(0,1)` is visited.

Cells `(0,2)`, `(0,3)`, and `(0,4)` are water.

No new count occurs.

### Scan cell `(1,3)`

It is unvisited land.

Increment count to two.

Traversal reaches `(1,4)` and then `(2,4)`.

Cell `(2,2)` is diagonal from `(1,3)` but not four-connected.

It is not part of this island.

Second island is `{(1,3),(1,4),(2,4)}`.

### Scan cell `(2,2)`

It remains unvisited land.

Increment count to three.

Every orthogonal neighbor is water.

The component contains one cell.

### Scan final row

Cell `(4,0)` starts the fourth island.

Traversal also visits `(4,1)`.

Cell `(4,3)` is separated by water and starts the fifth island.

Final count is five.

### Compare eight-directional connectivity

With diagonal offsets included, `(1,3)` connects diagonally to `(2,2)`.

Those formerly separate components merge.

Cell `(4,3)` remains isolated from them because row `3` is all water.

The eight-directional count is four.

The result changed because the graph changed.

### Perimeter extension

For each land cell, inspect four sides.

A side contributes one perimeter unit when it faces out of bounds or water.

Sides facing another land cell contribute zero.

The same neighbor loop can compute perimeter while traversal computes area.

The component identity remains governed by the selected connectivity rule.

## 4. Production-Ready Implementations

The primary implementation preserves the input and supports four- or eight-directional connectivity.

It validates rectangular shape.

```python
from collections import deque
from collections.abc import Sequence

Grid = Sequence[Sequence[int]]

FOUR_DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))
EIGHT_DIRECTIONS = FOUR_DIRECTIONS + ((-1, -1), (-1, 1), (1, -1), (1, 1))


def count_islands(grid: Grid, *, diagonal: bool = False) -> int:
    if not grid:
        return 0

    columns = len(grid[0])
    if any(len(row) != columns for row in grid):
        raise ValueError("grid must be rectangular")
    if columns == 0:
        return 0

    rows = len(grid)
    directions = EIGHT_DIRECTIONS if diagonal else FOUR_DIRECTIONS
    visited = [[False] * columns for _ in range(rows)]
    islands = 0

    for start_row in range(rows):
        for start_column in range(columns):
            if grid[start_row][start_column] != 1 or visited[start_row][start_column]:
                continue

            islands += 1
            visited[start_row][start_column] = True
            frontier = deque([(start_row, start_column)])

            while frontier:
                row, column = frontier.popleft()
                for row_delta, column_delta in directions:
                    neighbor_row = row + row_delta
                    neighbor_column = column + column_delta
                    if not (0 <= neighbor_row < rows and 0 <= neighbor_column < columns):
                        continue
                    if visited[neighbor_row][neighbor_column]:
                        continue
                    if grid[neighbor_row][neighbor_column] != 1:
                        continue

                    visited[neighbor_row][neighbor_column] = True
                    frontier.append((neighbor_row, neighbor_column))

    return islands
```

Marking occurs when a cell enters the queue.

The caller's grid remains unchanged.

### Execute the trace

```python
sample = [
    [1, 1, 0, 0, 0],
    [1, 0, 0, 1, 1],
    [0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0],
]

assert count_islands(sample) == 5
assert count_islands(sample, diagonal=True) == 4
assert count_islands([]) == 0
assert count_islands([[]]) == 0
assert count_islands([[0, 0], [0, 0]]) == 0
assert count_islands([[1, 1], [1, 1]]) == 1
```

### Return component labels and areas

Applications often need more than a count.

This variant assigns positive component identifiers and returns their areas.

```python
def label_islands(grid: Grid) -> tuple[list[list[int]], dict[int, int]]:
    if not grid:
        return [], {}
    columns = len(grid[0])
    if any(len(row) != columns for row in grid):
        raise ValueError("grid must be rectangular")

    labels = [[0] * columns for _ in grid]
    areas: dict[int, int] = {}
    next_label = 0

    for start_row in range(len(grid)):
        for start_column in range(columns):
            if grid[start_row][start_column] != 1 or labels[start_row][start_column] != 0:
                continue

            next_label += 1
            area = 0
            stack = [(start_row, start_column)]
            labels[start_row][start_column] = next_label

            while stack:
                row, column = stack.pop()
                area += 1
                for row_delta, column_delta in FOUR_DIRECTIONS:
                    nr = row + row_delta
                    nc = column + column_delta
                    if not (0 <= nr < len(grid) and 0 <= nc < columns):
                        continue
                    if grid[nr][nc] == 1 and labels[nr][nc] == 0:
                        labels[nr][nc] = next_label
                        stack.append((nr, nc))

            areas[next_label] = area

    return labels, areas


labels, areas = label_islands(sample)
assert sorted(areas.values()) == [1, 1, 2, 3, 3]
assert max(labels[0]) == 1
```

For huge grids, labels consume substantial memory.

Streamed tile processing needs boundary-equivalence reconciliation between tiles rather than one global frontier.

## 5. Asymptotic Time & Space Complexity

Let $R$ be row count and $C$ be column count.

The outer scan inspects every cell once.

Every land cell enters the frontier at most once.

Each visited land cell checks four or eight neighbors, a constant number.

Total time is:

$$
O(RC).
$$

The input itself contains $RC$ cells, so a full count has a matching $\Omega(RC)$ lower bound when any cell may change the answer.

The visited matrix uses $O(RC)$ bits or Boolean slots conceptually.

The BFS queue can hold $O(RC)$ cells in the worst case.

Total auxiliary space is $O(RC)$.

Iterative DFS has the same worst-case frontier bound.

Recursive DFS has $O(RC)$ worst-case call-stack depth on a snake-shaped component.

In-place marking removes the separate visited matrix.

The explicit frontier still uses up to $O(RC)$ space.

Label output necessarily uses $O(RC)$ result space.

| Variant | Time | Auxiliary space | Preserves input |
|---|---:|---:|---|
| BFS plus visited matrix | $O(RC)$ | $O(RC)$ | Yes |
| Iterative DFS plus visited | $O(RC)$ | $O(RC)$ | Yes |
| In-place BFS/DFS | $O(RC)$ | $O(RC)$ frontier worst case | No |
| Recursive in-place DFS | $O(RC)$ | $O(RC)$ call stack worst case | No |

Counting only land cells does not remove the outer scan cost because water must be distinguished from undiscovered land.

Sparse-coordinate input is different.

If only $L$ land coordinates are provided in a set, component traversal can run in expected $O(L)$ time and space without scanning the empty rectangle.

## 6. Systems Connections

### Flood fill

Image editors start from one pixel and traverse neighbors matching a source color.

Unlike island counting, one seed is supplied and no complete outer scan is needed.

The target color must differ from the source color when in-place recoloring doubles as visited marking.

Otherwise the traversal can repeatedly rediscover pixels.

### Image segmentation

Connected-component labeling assigns region identifiers to foreground pixels.

Two-pass algorithms with union-find can exploit row-major locality.

The first pass assigns provisional labels and records equivalences.

The second resolves representatives.

This can be more cache-friendly than many independent flood fills.

### Game maps

Island analysis identifies walkable zones, unreachable rooms, or disconnected navigation regions.

Movement rules define adjacency.

Diagonal movement may forbid corner cutting even when eight directions exist.

The neighbor predicate must encode those game rules.

### Geographic rasters

Land-cover grids may contain millions or billions of cells.

Tiling reduces working memory.

Components crossing tile boundaries require equivalence merging.

Coordinate projection and no-data cells complicate interpretation.

### Distributed processing

Each worker can label local tile components.

Boundary records describe which local labels touch across partitions.

A global union-find merges those equivalences.

The final component identifiers require relabeling or representative mapping.

### Memory safety and denial of service

Recursive flood fill on attacker-controlled shapes can exhaust the call stack.

Explicit frontiers allow capacity monitoring and cancellation.

Grid dimensions must be checked before allocating visited or label matrices.

Multiplication overflow in `rows * columns` matters in fixed-width systems.

### Mutation and ownership

In-place marking is safe only when the traversal owns the grid or the caller explicitly permits destruction.

Shared readers can observe partially consumed terrain.

Copying preserves isolation but doubles grid storage.

Choose the contract rather than mutating silently.

## 7. Practice Checklist

- Define what cell values mean land and water.
- Choose four- or eight-directional connectivity explicitly.
- Keep one direction set across count, area, and labeling logic.
- Validate rectangular shape or support ragged rows deliberately.
- Handle an empty grid.
- Handle empty rows.
- Check bounds before reading neighbors.
- Remember that negative Python indices wrap.
- Mark cells when enqueuing, not when dequeuing.
- Ensure every frontier cell is valid land.
- Use iterative traversal for unbounded component depth.
- Decide whether input mutation is permitted.
- Use a separate visited structure when input must survive.
- Test all-water input.
- Test all-land input.
- Test one land cell.
- Test diagonal-only contact.
- Test a long snake-shaped island.
- Test multiple isolated cells.
- Test components touching grid boundaries.
- Compare DFS and BFS counts.
- Verify sum of component areas equals visited land count.
- Verify every positive label has one connected component.
- Use sparse coordinates when the bounding rectangle is mostly absent.
- Avoid materializing labels when only a count is needed.
- Bound grid dimensions for untrusted input.
- Support cancellation for very large interactive operations.
- Reconcile tile-boundary components in parallel processing.
- Distinguish component connectivity from perimeter directions.
- Document output-label numbering and determinism.

## 8. Frequently Asked Questions

### Why is island counting a graph problem?

Land cells are vertices and allowed neighboring moves are edges.

Each island is one connected component of that implicit graph.

### Should I use DFS or BFS?

Both produce the same component partition under the same adjacency rule.

Choose based on frontier behavior, recursion safety, and whether shortest unweighted distances are also needed.

### Why mark a cell when adding it to the frontier?

Multiple visited neighbors can discover the same cell.

Early marking ensures it enters the queue or stack only once.

### Does diagonal contact join islands?

Only under an eight-directional definition.

Under four-directional connectivity, corner-touching cells remain separate.

### Can the algorithm use $O(1)$ extra space?

In-place marking removes a visited matrix, but DFS or BFS still needs a frontier in the general case.

Special scanline or labeling methods have different storage trade-offs.

### Why avoid recursive DFS?

A large or snake-shaped island can create one call per cell and overflow the runtime stack.

An explicit stack stores the same state in controllable memory.

### How do I compute the largest island?

Accumulate an area counter during each component traversal and retain the maximum.

The asymptotic time remains $O(RC)$.

### How is island perimeter computed?

For each land cell, add one for every side facing water or the grid boundary.

Shared land sides add nothing.

### Can the grid be ragged?

It can if every neighbor bounds check uses the target row's length.

The presented implementation rejects ragged input to keep one rectangular contract.

### How do I process a grid too large for memory?

Process tiles, label local components, record cross-tile boundary equivalences, and merge them with union-find.

One ordinary global BFS assumes random access to the whole grid.

### Does in-place marking change the result?

It should not change the count, but it changes the input data.

Use it only when destructive ownership is part of the API contract.
