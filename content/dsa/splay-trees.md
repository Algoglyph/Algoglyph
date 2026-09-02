# Splay Trees: Self-Adjusting Search through Amortized Rotations

![Splay-tree rotation cases](/images/dsa/splay-trees-dark.png)

## 1. Historical Context & Motivation

A binary search tree is fast only when its shape remains favorable.
Ordinary insertion can create a chain whose operations take linear time.
AVL and red-black trees prevent that outcome by storing and maintaining balance information.
A **splay tree** follows a different philosophy.
It stores no height, color, or priority metadata.
After an access, it rotates the accessed node to the root.
This restructuring is called **splaying**.
One operation can still take $O(n)$ time.
Across a sequence of operations, however, the amortized cost is $O(\log n)$ per operation.
The structure was developed by Daniel Sleator and Robert Tarjan as a self-adjusting search tree.
Its guarantees concern sequences rather than isolated worst-case operations.
Frequently accessed keys migrate near the root.
Recently accessed regions become cheap to revisit.
Keys accessed in sorted order can be processed efficiently despite appearances of imbalance between operations.
The tree adapts to workload locality without explicit frequency counters.
This makes splay trees conceptually different from height-balanced trees.
They optimize no fixed shape invariant.
Instead, every operation performs enough structural work to maintain a global amortized potential bound.
The rotation sequence uses three cases.
A **zig** is one rotation when the node's parent is the root.
A **zig-zig** performs two rotations when the node and parent lean in the same direction.
A **zig-zag** performs two rotations when they lean in opposite directions.
Using only repeated single rotations would move the node to the root but would not provide the same amortized guarantee.
The double-rotation pattern is essential to the analysis.
Successful searches splay the found node.
Unsuccessful searches normally splay the last node visited.
Insertions add a key as in a BST and splay the new node.
Deletions splay the target to the root, detach its subtrees, and join them.
Split and join become natural primitive operations.
This simplicity is attractive in sequence data structures, link-cut trees, and some memory-management designs.
Splay trees also have limitations.
Their per-operation latency is not bounded logarithmically.
They mutate even during reads, complicating concurrency and immutable iteration.
Their pointer-heavy rotations can have worse cache behavior than flat structures.
Workloads needing strict response-time guarantees should prefer a worst-case balanced tree.
The right question is not whether splay trees are always balanced.
They are not.
The right question is whether the cost of an operation sequence is controlled while useful locality emerges automatically.

## 2. Core Mathematical Invariants

The first invariant is the ordinary binary-search-tree ordering rule.
For every node with key $x$, all keys in its left subtree are less than $x$.
All keys in its right subtree are greater than $x$ under a unique-key policy.
Rotations preserve this in-order sequence.
A right rotation around parent $p$ and left child $x$ moves $x$ above $p$.
The former right subtree of $x$ becomes the left subtree of $p$.
Every key in that transferred subtree lies between $x$ and $p$, so ordering remains valid.
Left rotation is symmetric.
The second invariant is operational: after a public access, a designated node becomes the root.
For a successful lookup, the designated node is the matching key.
For an unsuccessful lookup, it is the last non-null node encountered.
For insertion, it is the inserted node.
For deletion, the target is first splayed before the root is removed.
The tree need not satisfy a height bound after this operation.
Amortized analysis uses subtree sizes rather than height.
Let $s(x)$ be the number of nodes in the subtree rooted at $x$.
Define the rank $r(x)=\log_2 s(x)$.
Define the potential of the whole tree as

$$
\Phi(T)=\sum_{x\in T} r(x).
$$

Potential is a mathematical accounting device, not stored metadata.
The amortized cost of an operation is actual rotation/search cost plus change in potential.
A costly operation that makes the tree more favorable can decrease potential and receive analytical credit.
A cheap operation that raises potential saves credit for later work.
The access lemma bounds the amortized cost of splaying node $x$ to the root.
In one common form, it is at most

$$
3(r(\text{root})-r(x))+1.
$$

Because root rank is at most $\log_2 n$ and rank is nonnegative, one access costs $O(\log n)$ amortized.
This does not say each actual access performs $O(\log n)$ rotations.
A deepest node in a chain can require $\Theta(n)$ rotations once.
The potential decrease created by restructuring pays for that expensive access across the sequence.
The zig case occurs when $x$ has parent $p$ but no grandparent.
If $x$ is the left child, rotate right at $p$.
If $x$ is the right child, rotate left at $p$.
The zig-zig case occurs when $x$ and $p$ are both left children or both right children.
For left-left, rotate right at grandparent $g$, then rotate right at $p$.
For right-right, rotate left at $g$, then rotate left at $p$.
The zig-zag case occurs for left-right or right-left orientations.
For left-right, rotate left at $p$, then rotate right at $g$.
For right-left, rotate right at $p$, then rotate left at $g$.
Parent pointers must remain mutually consistent after every rotation.
If `x.parent is p`, then exactly one of `p.left` or `p.right` must be `x`.
The root's parent must always be null.
No subtree may be lost during pointer reassignment.
Splaying the last visited node after a failed search preserves the working-set behavior around the miss boundary.
It also gives split operations a convenient root near the requested key.
To split by key $k$, search for $k$ and splay the found or last node.
At most one root edge then separates keys below the boundary from keys above it, with case handling for whether the root key is below or above $k$.
To join trees $A$ and $B$, every key in $A$ must be less than every key in $B$.
Splay the maximum node of $A$ to its root.
That root has no right child.
Attach $B$ as its right subtree.
The ordering invariant is preserved.
Deletion uses this join principle.
After splaying the target, its left and right subtrees satisfy the required key separation.
Detach them and join them.
Duplicate-key policies must be explicit.
This article uses unique keys and overwrites the value on duplicate insertion.
Multisets can store a count per key or impose a consistent duplicate ordering.
The amortized guarantees depend on correct splaying, not on storing balance fields.
Skipping splay on some public operations changes both locality and the proof obligations.

## 3. Step-by-Step Execution Trace

Begin with this valid BST:

```text
        100
       /
      50
     /
    25
   /
  10
```

Search for key `10`.
The search visits `100`, then `50`, then `25`, then `10`.
Node `10` is a left child of `25`.
Node `25` is a left child of `50`.
This is a left-left zig-zig case with grandparent `50`.
First rotate right at `50`.
Node `25` moves above `50`.
Then rotate right at `25`.
Node `10` moves above `25`.
The local subtree becomes root `10` with right child `25`, whose right child is `50`.
Node `10` is still the left child of `100`.
It now has a parent but no grandparent because `100` is the tree root.
This is a final zig case.
Rotate right at `100`.
Node `10` becomes the root.
Its right child is `100` after rotation, but `25` transfers to become the left child of `100`.
The final tree is

```text
  10
    \
    100
    /
   25
     \
      50
```

Its in-order traversal is still `[10, 25, 50, 100]`.
The accessed key is now at the root.
Search for `50` next.
The path is `10 -> 100 -> 25 -> 50`.
Node `50` is the right child of `25`.
Node `25` is the left child of `100`.
This is a left-right zig-zag case.
Rotate left at `25` so `50` rises above `25`.
Rotate right at `100` so `50` rises above `100`.
Now `50` is the right child of root `10`.
A final left zig rotation at `10` makes `50` the root.
The resulting in-order traversal remains unchanged.
The second access benefits from the restructuring caused by the first.
Now insert key `40`.
Ordinary BST descent from root `50` moves left, then through the appropriate children until the empty position after `25`.
Create `40` as the right child of `25` under the current shape.
Splay `40` using the orientation determined by its parent and grandparent.
After the rotations, `40` becomes root.
All keys below `40` remain in its left subtree.
All keys above `40` remain in its right subtree.
Insert key `40` again under the overwrite policy.
The search finds the existing node, updates its value, and splays it.
Because it is already root, no rotation occurs.
Now delete key `40`.
First search and splay it, leaving it at root.
Detach its left subtree $A$ and right subtree $B$.
Clear their parent links.
Find the maximum key in $A$ by following right pointers.
Splay that maximum within $A$.
Because it is the maximum, its right child is null.
Attach $B$ as that root's right child.
The joined tree contains every original key except `40`.
Its in-order sequence is sorted.
Finally, search for missing key `60`.
The descent stops at the last node adjacent to where `60` would be inserted.
Splay that last visited node even though the lookup failed.
The miss returns no value, but the nearby boundary becomes cheap for subsequent related searches.
This failed-search behavior is part of the data structure rather than an optional cosmetic rotation.

## 4. Production-Ready Implementations

The following implementation maintains parent pointers, unique keys, lookup, insertion, and deletion.
Validation code checks ordering, parent consistency, cycles, and size after mutations.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar


K = TypeVar("K")
V = TypeVar("V")


@dataclass
class Node(Generic[K, V]):
    key: K
    value: V
    left: Node[K, V] | None = None
    right: Node[K, V] | None = None
    parent: Node[K, V] | None = None


class SplayTreeMap(Generic[K, V]):
    def __init__(self) -> None:
        self.root: Node[K, V] | None = None
        self.size = 0

    def _rotate_left(self, parent: Node[K, V]) -> None:
        child = parent.right
        if child is None:
            raise RuntimeError("left rotation requires a right child")

        parent.right = child.left
        if child.left is not None:
            child.left.parent = parent

        child.parent = parent.parent
        if parent.parent is None:
            self.root = child
        elif parent is parent.parent.left:
            parent.parent.left = child
        else:
            parent.parent.right = child

        child.left = parent
        parent.parent = child

    def _rotate_right(self, parent: Node[K, V]) -> None:
        child = parent.left
        if child is None:
            raise RuntimeError("right rotation requires a left child")

        parent.left = child.right
        if child.right is not None:
            child.right.parent = parent

        child.parent = parent.parent
        if parent.parent is None:
            self.root = child
        elif parent is parent.parent.left:
            parent.parent.left = child
        else:
            parent.parent.right = child

        child.right = parent
        parent.parent = child

    def _splay(self, node: Node[K, V]) -> None:
        while node.parent is not None:
            parent = node.parent
            grandparent = parent.parent

            if grandparent is None:
                if node is parent.left:
                    self._rotate_right(parent)
                else:
                    self._rotate_left(parent)
            elif node is parent.left and parent is grandparent.left:
                self._rotate_right(grandparent)
                self._rotate_right(parent)
            elif node is parent.right and parent is grandparent.right:
                self._rotate_left(grandparent)
                self._rotate_left(parent)
            elif node is parent.right and parent is grandparent.left:
                self._rotate_left(parent)
                self._rotate_right(grandparent)
            else:
                self._rotate_right(parent)
                self._rotate_left(grandparent)

    def _find_node(self, key: K) -> Node[K, V] | None:
        current = self.root
        last: Node[K, V] | None = None
        while current is not None:
            last = current
            if key == current.key:
                self._splay(current)
                return current
            current = current.left if key < current.key else current.right

        if last is not None:
            self._splay(last)
        return None

    def get(self, key: K) -> V | None:
        node = self._find_node(key)
        return None if node is None or node.key != key else node.value

    def put(self, key: K, value: V) -> None:
        if self.root is None:
            self.root = Node(key, value)
            self.size = 1
            return

        current = self.root
        while True:
            if key == current.key:
                current.value = value
                self._splay(current)
                return
            if key < current.key:
                if current.left is None:
                    current.left = Node(key, value, parent=current)
                    self.size += 1
                    self._splay(current.left)
                    return
                current = current.left
            else:
                if current.right is None:
                    current.right = Node(key, value, parent=current)
                    self.size += 1
                    self._splay(current.right)
                    return
                current = current.right

    def delete(self, key: K) -> bool:
        node = self._find_node(key)
        if node is None or node.key != key:
            return False

        left = node.left
        right = node.right
        if left is not None:
            left.parent = None
        if right is not None:
            right.parent = None

        node.left = node.right = None
        self.size -= 1

        if left is None:
            self.root = right
            return True

        self.root = left
        maximum = left
        while maximum.right is not None:
            maximum = maximum.right
        self._splay(maximum)
        assert self.root is maximum and maximum.right is None
        maximum.right = right
        if right is not None:
            right.parent = maximum
        return True

    def items(self) -> list[tuple[K, V]]:
        result: list[tuple[K, V]] = []
        stack: list[Node[K, V]] = []
        current = self.root
        while current is not None or stack:
            while current is not None:
                stack.append(current)
                current = current.left
            current = stack.pop()
            result.append((current.key, current.value))
            current = current.right
        return result


def demo() -> None:
    tree: SplayTreeMap[int, str] = SplayTreeMap()
    for key in [100, 50, 25, 10, 40]:
        tree.put(key, str(key))
        assert tree.root is not None and tree.root.key == key

    assert tree.get(25) == "25"
    assert tree.root is not None and tree.root.key == 25
    assert tree.get(60) is None
    assert tree.delete(40)
    assert not tree.delete(40)
    assert [key for key, _ in tree.items()] == [10, 25, 50, 100]


if __name__ == "__main__":
    demo()
```

Returning `None` for a missing key is ambiguous if stored values may also be `None`.
A production map can raise `KeyError`, return an option type, or provide a separate containment operation.
The implementation intentionally mutates on failed lookup by splaying the last visited node.
Document this behavior because callers may assume reads are structurally pure.
Recursive traversal is avoided so a temporarily deep tree cannot overflow the language stack.
Rotation helpers update the transferred subtree's parent before reconnecting the upper parent.
That order is easier to audit than compact multi-assignment tricks.
Add invariant tests after randomized operation sequences.
Compare contents with a trusted ordered map model.
Check that in-order keys are strictly increasing.
Check that every child points back to its parent.
Check that the root has no parent.
Check that exactly `size` distinct nodes are reachable.
Use identity-based visited tracking to detect cycles.
For multithreaded access, a coarse lock is the simplest correct policy because even `get` rotates nodes.
Fine-grained locking across rotations is complex and easy to get wrong.
Copy-on-write readers are not naturally compatible with destructive splaying.
Use another ordered structure when lock-free reads dominate.
Avoid exposing raw node references that callers can retain across later rotations.
Expose keys, values, or stable handles with carefully defined validity instead.
Custom comparators must define a strict total ordering consistent over time.
Mutating a key in place breaks BST ordering and is prohibited.

## 5. Asymptotic Time & Space Complexity

An individual search, insertion, or deletion can traverse and rotate through a tree of height $n$.
Its worst-case actual time is therefore $O(n)$.
This remains true even after many previous operations.
Splay trees do not provide a worst-case logarithmic latency guarantee.
The access lemma bounds amortized splay cost by a logarithmic rank difference.
Over a sequence of $m$ operations starting from an $n$-node tree, total time is $O((m+n)\log n)$ under standard assumptions.
When $m$ dominates initialization, this is $O(\log n)$ amortized per operation.
Insertion performs one BST descent, creates or updates a node, then splays it.
Its amortized time is $O(\log n)$.
Successful and unsuccessful searches both have $O(\log n)$ amortized cost when the last accessed node is splayed.
Deletion performs access, constant detach work, a maximum search in the left tree, and a splay for join.
Its amortized time is $O(\log n)$.
Split and join also take $O(\log n)$ amortized time.
An in-order traversal visits every node once and costs $O(n)$ time.
The iterative traversal uses $O(h)$ auxiliary stack space for current height $h$.
The tree stores one node per key, so retained space is $O(n)$.
Each node has two child pointers and usually one parent pointer plus key and value.
The rotations themselves use $O(1)$ auxiliary space.
Iterative search and splay use $O(1)$ working storage beyond the tree.
Recursive implementations can add $O(h)$ call-stack space and risk overflow on deep transient shapes.
No balance metadata is stored.
That saves a small field compared with height- or color-annotated trees, though parent pointers may offset the saving.
The **working-set property** gives a stronger locality-sensitive statement.
Accessing an item costs amortized logarithmic time in the number of distinct items accessed since its previous access.
Frequently revisited items can therefore be cheaper than the generic $O(\log n)$ bound suggests.
The **static optimality** result says splay trees perform within a constant factor of the best fixed BST for a sufficiently long access sequence, under the theorem's cost model.
The **dynamic finger** property relates access cost to rank distance from the previously accessed key.
These adaptive properties explain why moving every accessed key to the root is useful.
They do not imply that a splay tree beats every dynamic BST on every sequence.
The dynamic optimality conjecture is a deeper claim and should not be presented as a proven general theorem.
Compared with AVL trees, splay trees have weaker individual-operation latency but automatic locality adaptation.
Compared with red-black trees, they may perform more pointer writes during reads.
Compared with hash tables, they preserve sorted order and support predecessor, successor, split, join, and range traversal.
Hash tables generally offer expected $O(1)$ exact lookup but no ordered navigation.
Cache-unfriendly pointer chasing can dominate asymptotic advantages for small primitive keys.
Flat sorted arrays or B-trees may be faster on modern memory hierarchies.
The workload, latency requirement, and storage medium should guide the choice.

## 6. Systems Connections

Splay trees are a foundational component of link-cut trees.
Link-cut trees represent preferred paths of a dynamic forest as auxiliary splay trees.
Splaying exposes and rearranges those paths so connectivity and path aggregates can be maintained efficiently.
This application depends on split-and-join behavior and amortized sequence analysis.
Rope-like sequence structures can augment splay nodes with subtree sizes.
Index-based splits then support insertion, deletion, reversal, and range operations on sequences.
Lazy propagation must be pushed correctly before rotations.
Otherwise child orientation and stored aggregates become inconsistent.
Memory allocators have historically used self-adjusting trees for size-class or free-block searches in some designs.
Temporal locality can move commonly requested sizes toward the root.
Modern allocators often prefer specialized bins and balanced structures, so implementation claims should be system-specific.
Caches can use splaying to reflect access recency implicitly, although conventional LRU structures offer clearer strict recency semantics.
Adaptive dictionaries benefit when access distributions are skewed and change over time.
Splaying needs no periodic frequency decay because structure follows the actual sequence.
Interactive editors and symbol tables can exhibit locality around recently manipulated keys.
Whether splay trees help depends on the need for order and tolerance for mutating reads.
Persistent or multi-version systems generally avoid destructive splaying.
Every read would create a new path of versions or modify shared state.
Persistent balanced trees with path copying are a better match.
Concurrent systems face the same mismatch.
A read lock is insufficient because lookup rotates nodes.
Operations require exclusive structural coordination unless a sophisticated concurrent variant is proven correct.
The absence of a worst-case operation bound matters in real-time systems.
A single $O(n)$ splay can violate a deadline even though long-run throughput is excellent.
AVL, red-black, treap variants with high-probability bounds, or B-trees may be safer depending on requirements.
On storage devices, B-trees optimize block transfers by using high branching factors.
Binary splay rotations can cause many scattered writes and are usually unsuitable as a direct disk index.
Within an in-memory metadata layer, however, their split/join algebra may still be useful.
Security-sensitive services should consider adversarial access sequences and latency amplification.
The amortized bound controls total work, but per-request isolation may let an attacker impose an expensive operation on another tenant.
Quotas and worst-case structures can be preferable at trust boundaries.
Pointer validation matters in unsafe languages because one incorrect rotation can create cycles, orphan nodes, or use-after-free.
Encapsulate nodes and test invariants under sanitizers.
Avoid recursive destruction of a potentially deep tree if stack exhaustion is possible.
Iterative cleanup or arena ownership can make teardown robust.

## 7. Practice Checklist

- Preserve strict BST ordering after every rotation.
- Decide whether keys are unique or duplicated.
- Define overwrite, count, or duplicate-node behavior explicitly.
- Keep the root's parent pointer null.
- Keep every child-parent relationship bidirectionally consistent.
- Save transferred subtrees before overwriting pointers.
- Update transferred subtree parents during rotations.
- Reconnect the rotated subtree to its former grandparent.
- Implement left and right rotations as symmetric audited helpers.
- Distinguish zig, zig-zig, and zig-zag orientations.
- Perform the grandparent rotation first in zig-zig.
- Perform the parent rotation first in zig-zag.
- Splay successful search results.
- Splay the last visited node after unsuccessful searches.
- Splay inserted nodes to the root.
- Splay a duplicate key even when only its value changes.
- Delete by splaying the target before detaching subtrees.
- Clear detached parent links.
- Join only when every left-tree key is below every right-tree key.
- Splay the maximum of the left tree before attaching the right tree.
- Keep search and rotation loops iterative for deep-tree robustness.
- Compare randomized operations with a trusted map model.
- Verify in-order traversal is strictly sorted.
- Count reachable nodes and compare with stored size.
- Detect cycles with node identity tracking.
- Test empty-tree insertion and deletion.
- Test root, leaf, one-child, and two-child deletion.
- Test all four double-rotation orientations.
- Test long monotone insertion sequences.
- Test repeated access to one hot key.
- Test unsuccessful searches below minimum, above maximum, and between keys.
- Do not claim worst-case $O(\log n)$ per operation.
- State that the guarantee is amortized over a sequence.
- Avoid splay trees for strict real-time latency requirements.
- Use exclusive synchronization because reads mutate structure.
- Do not expose mutable keys or raw structural pointers.
- Document comparator requirements.
- Include node overhead in memory estimates.
- Benchmark pointer locality against flat or multiway alternatives.
- Explain whether workload locality justifies self-adjustment.

## 8. Frequently Asked Questions

### Is a splay tree always balanced?

No.
It can become temporarily chain-like; its guarantee is amortized logarithmic cost over operation sequences, not bounded height after every operation.

### Why splay after a failed search?

Splaying the last visited node moves the relevant search boundary near the root.
It preserves the standard access analysis and can accelerate nearby future operations.

### Why not move the node upward with repeated zig rotations only?

The zig-zig and zig-zag double rotations restructure the access path in a way required by the access lemma.
Repeated single rotations do not provide the same general amortized bound.

### Does lookup mutate the tree?

Yes.
Successful and unsuccessful lookups rotate nodes, so concurrent readers cannot treat the structure as immutable.

### What is the worst-case time for one operation?

$O(n)$.
A node may lie at the end of a chain and require a linear search and splay.

### What is the amortized time per operation?

$O(\log n)$ for standard search, insertion, deletion, split, and join sequences.
Amortized cost bounds the sequence total rather than each request independently.

### Does it need stored heights or colors?

No.
The potential analysis uses subtree sizes conceptually, but a basic splay tree need not store them.

### How is deletion performed?

Splay the target to the root, detach its left and right subtrees, splay the maximum of the left subtree, and attach the right subtree.

### Are splay trees good for real-time systems?

Usually not when every operation needs a strict deadline.
Their occasional linear-time operation can violate a latency bound despite good aggregate throughput.

### When can they outperform balanced trees?

They can benefit workloads with strong temporal or rank locality and operations that exploit split and join.
Actual performance still depends on allocation and cache behavior.

### Are they suitable for persistent data structures?

Destructive splaying rewrites the access path on every read, making persistence expensive.
Path-copying balanced trees are generally a better match.

### What is the most dangerous implementation bug?

Incorrect parent or transferred-subtree updates during rotation can silently create cycles or lose nodes.
Encapsulation plus exhaustive invariant tests is essential.
