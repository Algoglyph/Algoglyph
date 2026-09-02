# Fibonacci Heaps: Lazy Consolidation, Amortized Decrease-Key & Meldable Priority Queues

![Fibonacci heap root list and marked nodes](/images/dsa/fibonacci-heaps-dark.png#dark)

## 1. Historical Context & Motivation

A Fibonacci heap is a priority queue designed for excellent amortized performance on meld and decrease-key operations.

It was introduced by Fredman and Tarjan in the 1980s.

The structure is famous because it improves theoretical bounds for algorithms such as Dijkstra's shortest path and Prim's minimum spanning tree.

Binary heaps make `insert`, `extract-min`, and `decrease-key` logarithmic or near logarithmic depending on implementation.

Fibonacci heaps make `insert`, `find-min`, `meld`, and `decrease-key` amortized $O(1)$.

They keep `extract-min` at amortized $O(\log n)$.

That trade-off is valuable when decrease-key is frequent.

Shortest-path algorithms can relax edges many times.

Each successful relaxation may need to reduce a priority.

The Fibonacci heap obtains its bounds by delaying work.

It keeps a loose collection of heap-ordered trees.

It does not eagerly merge trees after every insertion.

It consolidates trees mainly during `extract-min`.

It also allows a node to lose one child before cutting it from its parent.

Marks track that history.

The name comes from a size-degree bound related to Fibonacci numbers.

A node of degree $d$ has a subtree size at least roughly the $d$th Fibonacci number.

Therefore degrees are logarithmic in heap size.

The central question is:

How can a priority queue defer structural cleanup while still guaranteeing logarithmic extract-min work over time?

Fibonacci heaps are elegant theory and demanding engineering.

In production, simpler heaps often win on constants.

But the invariants are worth studying because they show how amortized data structures buy speed by storing controlled disorder.

## 2. Core Mathematical Invariants

A Fibonacci heap stores heap-ordered trees.

For every parent-child edge:

```text
parent.key <= child.key
```

The minimum pointer references a root with the smallest key in the heap.

The root list contains all tree roots.

Children of a node are usually stored in circular doubly linked lists.

The heap supports meld by concatenating root lists and updating the minimum pointer.

No consolidation is needed for meld.

A node's degree is its number of children.

During `extract_min`, the removed minimum's children are promoted to the root list.

Then roots with equal degrees are repeatedly linked until no two roots share the same degree.

Linking makes the larger-key root a child of the smaller-key root.

That preserves heap order.

Decrease-key may violate heap order if a child becomes smaller than its parent.

The child is cut from its parent and moved to the root list.

If the parent was already marked, it is also cut.

This cascading cut continues upward.

If an unmarked non-root parent loses its first child, it becomes marked instead of being cut immediately.

The mark invariant is:

A marked non-root node has lost one child since it became a child of its current parent.

If it loses another child, it must be cut.

This rule prevents high-degree nodes from losing too many children while remaining deep in a tree.

That is what preserves the logarithmic degree bound.

The potential function often used for analysis is:

$$
\Phi = t + 2m
$$

where $t$ is the number of trees in the root list and $m$ is the number of marked nodes.

Cheap operations may increase potential.

Expensive consolidation spends potential.

## 3. Step-by-Step Execution Trace

Start with an empty heap.

Insert keys `7`, `3`, `18`, and `24`.

Each insert creates a one-node tree in the root list.

The minimum pointer references key `3`.

The root list conceptually contains:

```text
3, 7, 18, 24
```

Now call `extract_min`.

Remove root `3`.

It has no children in this simple trace.

The remaining roots are:

```text
7, 18, 24
```

Consolidation links roots with equal degree.

Initially all three have degree zero.

Link `18` under `7`.

Now root `7` has degree one.

Root `24` still has degree zero.

No two roots have the same degree.

The minimum is `7`.

Now insert key `2`.

It becomes a new root.

The minimum pointer changes to `2`.

No consolidation happens.

Now decrease a child key from `18` to `1`.

The node becomes smaller than its parent `7`.

Cut it from `7`.

Move it to the root list.

The minimum pointer changes to `1`.

Because `7` is a root, no cascading cut continues upward.

The root list now contains multiple trees again.

That is allowed.

The heap delays cleanup until the next `extract_min`.

The trace shows the personality of Fibonacci heaps.

They are deliberately messy between extract-min operations.

The mess is measured by the potential function.

Now trace consolidation by degree.

Suppose after removing the minimum, the root list contains roots with degrees:

```text
degree 0: A, B
degree 1: C, D
degree 3: E
```

Two degree-zero roots cannot both remain roots after consolidation.

Compare keys of `A` and `B`.

Make the larger-key root a child of the smaller-key root.

The surviving root now has degree one.

That may collide with existing degree-one root `C`.

Link those two roots as well.

The survivor becomes degree two.

Now process root `D`, which still has degree one.

If no other degree-one root remains, it stays.

Root `E` with degree three stays if no other degree-three root remains.

The final root list has at most one root of each degree.

The degree table is temporary.

It is rebuilt during extract-min.

This is why insert can be lazy.

The cleanup is concentrated where the minimum is removed.

## 4. Production-Ready Implementations

A full Fibonacci heap implementation is long because it must maintain circular lists, parent pointers, marks, and degree consolidation.

For most production systems, use a well-tested library or choose a simpler heap unless the workload truly needs amortized decrease-key.

The educational implementation below models the key operation that gives Fibonacci heaps their graph-algorithm value: decrease-key with cascading cuts.

It does not pretend to be a complete heap package.

```python
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class FibNode:
    key: int
    parent: "FibNode | None" = None
    children: list["FibNode"] = field(default_factory=list)
    marked: bool = False


class CutModel:
    def __init__(self) -> None:
        self.roots: list[FibNode] = []

    def add_root(self, node: FibNode) -> None:
        node.parent = None
        node.marked = False
        self.roots.append(node)

    def link_child(self, parent: FibNode, child: FibNode) -> None:
        child.parent = parent
        child.marked = False
        parent.children.append(child)

    def cut(self, node: FibNode) -> None:
        parent = node.parent
        if parent is None:
            return
        parent.children.remove(node)
        self.add_root(node)
        if parent.parent is not None:
            if not parent.marked:
                parent.marked = True
            else:
                self.cut(parent)

    def decrease_key(self, node: FibNode, new_key: int) -> None:
        if new_key > node.key:
            raise ValueError("new key must not increase")
        node.key = new_key
        parent = node.parent
        if parent is not None and node.key < parent.key:
            self.cut(node)


heap = CutModel()
root = FibNode(10)
child = FibNode(20)
grandchild = FibNode(30)
heap.add_root(root)
heap.link_child(root, child)
heap.link_child(child, grandchild)

heap.decrease_key(grandchild, 5)
assert grandchild.parent is None
assert child.marked
assert grandchild in heap.roots

another = FibNode(25)
heap.link_child(child, another)
heap.decrease_key(another, 1)
assert another.parent is None
assert child.parent is None
assert child in heap.roots
```

The model shows the mark rule without burying it under list-splicing mechanics.

Complete implementations need additional operations:

- `insert`
- `find_min`
- `meld`
- `extract_min`
- degree-table consolidation
- root-list concatenation
- child-list promotion

Those operations must update parent pointers, marks, degrees, and the minimum pointer consistently.

If any of those fields drift, the amortized proof no longer describes the code.

Node handles are part of the API.

Decrease-key requires a direct reference to the node whose key changes.

If callers only provide a value, the heap must first search for it, which ruins the promised cost.

Graph algorithms usually store the heap node handle for each vertex.

When a distance improves, the algorithm calls decrease-key on that handle.

If an implementation instead inserts a second entry for the same vertex, it is no longer using Fibonacci-heap decrease-key.

That duplicate-entry approach can be practical, but it is a different priority-queue contract.

## 5. Asymptotic Time & Space Complexity

Fibonacci heap bounds are amortized.

`find_min` is $O(1)$ worst case.

`insert` is $O(1)$ amortized.

`meld` is $O(1)$ amortized because root lists are concatenated.

`decrease_key` is $O(1)$ amortized.

`extract_min` is $O(\log n)$ amortized.

The logarithmic extract-min bound depends on the degree bound.

A node with degree $d$ has a subtree containing at least $F_{d+2}$ nodes, where $F$ is the Fibonacci sequence.

Since Fibonacci numbers grow exponentially, degree is $O(\log n)$.

Consolidation after removing the minimum only needs a degree table of logarithmic size.

The potential function accounts for delayed work.

Inserting a node increases the number of root trees.

Decrease-key can add roots and remove marks through cascading cuts.

Extract-min pays to consolidate accumulated roots.

Over a sequence of operations, the saved potential covers the deferred cleanup.

Space is $O(n)$.

Each node stores key, degree, mark, parent pointer, child pointer, and sibling-list links in a full implementation.

That metadata is heavier than a binary heap array.

The theoretical operation bounds are better for some workloads.

The constant factors and implementation complexity are also higher.

The amortized table is:

| Operation | Amortized Cost |
|---|---:|
| `find_min` | $O(1)$ |
| `insert` | $O(1)$ |
| `meld` | $O(1)$ |
| `decrease_key` | $O(1)$ |
| `extract_min` | $O(\log n)$ |
| `delete` | $O(\log n)$ |

Delete is commonly implemented by decreasing the key to negative infinity and extracting the minimum.

That requires a key domain with a valid sentinel or a comparator that can represent absolute priority.

If the key domain cannot express such a sentinel, delete needs a more explicit implementation.

Meld is the other operation that separates Fibonacci heaps from binary heaps.

A binary heap usually stores one array.

Melding two binary heaps normally requires rebuilding or inserting many elements.

A Fibonacci heap can concatenate two root lists and compare two minimum pointers.

The operation is constant time because no heap-ordered tree needs to be rearranged immediately.

That benefit matters in algorithms that repeatedly combine priority queues.

It matters less when a program only maintains one queue.

## 6. Systems Connections

Fibonacci heaps are famous in graph algorithms.

Dijkstra's algorithm with a Fibonacci heap has running time:

$$
O(E + V\log V)
$$

for nonnegative edge weights when decrease-key is used.

A binary heap implementation is commonly:

$$
O((E+V)\log V).
$$

The improvement appears when many edge relaxations decrease priorities.

Prim's minimum spanning tree algorithm has a similar story.

The heap can reduce the amortized cost of priority updates.

In practice, pairing heaps, binary heaps with duplicate entries, or specialized radix heaps may be faster.

Fibonacci heaps are difficult to implement correctly and are pointer-heavy.

Pointer-heavy structures often lose cache locality.

Many production shortest-path systems choose simpler priority queues for this reason.

Still, Fibonacci heaps matter.

They separate asymptotic possibility from practical engineering.

They also teach amortized analysis with a rich example.

Lazy work is not the same as ignored work.

The marks and potential function define exactly how disorder is controlled.

If a system claims Fibonacci-heap bounds, it must implement real decrease-key, not merely insert duplicate priorities and skip stale entries later.

That duplicate-entry approach is valid and often practical.

It has different bounds and memory behavior.

The memory behavior matters in long-running services.

Duplicate-entry Dijkstra may keep stale heap entries until they are popped.

That can grow memory when many relaxations improve the same vertex.

A real decrease-key heap updates the existing node instead.

The trade-off is handle management and more complex pointer manipulation.

In codebases where graph searches are short-lived, duplicate entries may be acceptable.

In systems with strict memory limits, the distinction deserves measurement.

Fibonacci heaps are therefore a useful design benchmark even when not chosen.

They identify what performance would be possible if decrease-key were cheap.

Instrumentation should separate operation counts.

Count inserts, extracts, decreases, and melds independently.

A workload dominated by extract-min may not benefit much.

A workload dominated by decrease-key may.

The data structure choice should follow the operation mix, not the reputation of the heap.

## 7. Practice Checklist

- Keep the minimum pointer accurate after every operation.
- Maintain heap order between parents and children.
- Concatenate root lists for meld.
- Promote all children of the removed minimum during extract-min.
- Consolidate roots by degree after extract-min.
- Link the larger-key root under the smaller-key root.
- Clear marks when nodes become roots.
- Mark a non-root parent after its first child loss.
- Cascading-cut a marked parent after another child loss.
- Treat bounds as amortized, not worst-case for every operation.
- Use decrease-key only with a real node handle.
- Do not increase a key through decrease-key.
- Test insert and find-min.
- Test extract-min after many inserts.
- Test decrease-key on a child.
- Test cascading cuts across multiple levels.
- Test meld of two nonempty heaps.
- Test operations on an empty heap.
- Compare graph-algorithm results with a simpler heap implementation.
- Consider constant factors before choosing Fibonacci heaps in production.
- Store node handles when decrease-key is part of the API.
- Do not claim Fibonacci bounds for duplicate-entry heaps.
- Test consolidation collisions across several equal degrees.
- Verify marks are cleared when a node becomes a root.
- Track stale-entry memory separately if using a simpler heap workaround.
- Choose Fibonacci heaps only when meld or decrease-key frequency justifies them.
- Measure operation mix before replacing a simpler heap.

## 8. Frequently Asked Questions

### Why is it called a Fibonacci heap?

The degree bound relies on subtree sizes growing at least as fast as Fibonacci numbers.

That bound keeps consolidation logarithmic.

### Are Fibonacci heaps fast in practice?

Not always.

They have excellent amortized theory but high pointer and implementation overhead.

### What operation makes them special?

Amortized $O(1)$ decrease-key is the main attraction.

That matters in graph algorithms with many priority decreases.

### Why delay consolidation?

Delaying work makes insert and meld cheap.

The deferred cleanup is paid for during extract-min using amortized analysis.

### What is a cascading cut?

When a marked node loses another child, it is cut from its parent too.

The process can continue upward.

### What does a mark mean?

A marked non-root node has lost one child since becoming a child of its current parent.

### Should I implement one from scratch?

Usually no.

Use a tested implementation or choose a simpler heap unless the theoretical bound is truly needed.

### Can I use duplicate heap entries instead of decrease-key?

Yes, many Dijkstra implementations do that with binary heaps.

It is simpler but has different memory and runtime behavior.

### What should a diagram show?

Show the root list, the minimum pointer, child trees, marked nodes, and a cascading cut after decrease-key.
