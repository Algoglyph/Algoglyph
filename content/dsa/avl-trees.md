# AVL Trees: Height Metadata, Local Rotations & Worst-Case Search

![AVL Trees: Height Metadata, Local Rotations & Worst-Case Search](/images/dsa/avl-trees-dark.jpg#dark)

## 1. Historical Context & Motivation

A binary-search tree orders keys, but ordering alone does not control its shape.

Inserting `10, 20, 30, 40, 50` into an ordinary unbalanced tree produces a rightward chain.

Searching that chain inspects up to five nodes.

With $n$ increasing keys, the same construction has height $n$ and worst-case search time $O(n)$.

G. M. Adelson-Velsky and E. M. Landis addressed this failure in their 1962 paper on an information-organization algorithm.

Their tree stores enough local height information to detect imbalance after an update.

It then changes a constant number of links near the first damaged region.

The data remain in sorted order throughout the repair.

The resulting structure is now called an **AVL tree**, using the authors' initials.

The original paper is catalogued by [Math-Net.Ru](https://www.mathnet.ru/php/archive.phtml?jrnid=dan&option_lang=eng&paperid=26964&wshow=paper).

AVL balancing solves a precise problem:

- preserve the binary-search ordering after every operation;
- prevent any root-to-leaf path from becoming much longer than another;
- repair the tree locally instead of rebuilding all $n$ nodes;
- guarantee logarithmic search even for adversarial insertion order.

This guarantee matters when a caller cannot assume random keys.

Timestamps, monotonically allocated identifiers, and sorted imports are common rather than exceptional inputs.

A randomized or periodically rebuilt tree can also perform well, but it offers a different operational contract.

An AVL tree makes its height promise after each completed mutation.

That promise has costs.

Each node normally stores a height or balance factor.

Insertion and deletion must update metadata on the path back to the root.

Rotations write several pointers and therefore complicate concurrent access and persistence.

Strict balancing can perform more repair work than a red-black tree on update-heavy workloads.

AVL trees are therefore most attractive when predictable lookup depth is more valuable than minimizing every update-side pointer write.

Typical fits include in-memory ordered indexes, read-heavy maps, interval indexes augmented with subtree data, and educational implementations that need an explicit balance invariant.

They are not automatically the best on-disk search tree.

Storage engines usually prefer multiway trees such as B-trees because one node can match a disk page and reduce I/O depth.

They are also not automatically lock-free or cache-optimal.

Balancing controls comparisons along a path; it does not make separately allocated nodes contiguous.

The important engineering lesson is narrower:

**a small local invariant can turn an unconstrained binary-search tree into a worst-case logarithmic dictionary.**

## 2. Core Mathematical Invariants

### Binary-search ordering

For every node $u$, every key in its left subtree is smaller than $u.key$.

Every key in its right subtree is larger than $u.key$.

This article implements unique keys.

Inserting an existing key replaces its value rather than creating a duplicate node.

That policy keeps the ordering rule strict and makes lookup semantics unambiguous.

Alternative duplicate policies are possible, but they must be encoded explicitly.

For example, a multimap can store a collection of values at one key.

Blindly sending equal keys to one side can make rotations and validation harder to reason about.

### Height convention

Let an empty subtree have height zero:

$$
h(\varnothing)=0.
$$

A leaf therefore has height one.

For a nonempty node $u$:

$$
h(u)=1+\max(h(u.left),h(u.right)).
$$

The implementation stores this value at each node.

Stored metadata avoids recursively recomputing subtree heights during every balance check.

After a child pointer changes, the parent height is stale until refreshed.

The correct update order is consequently bottom-up:

1. mutate or replace a child subtree;
2. refresh the current node's height;
3. inspect its balance factor;
4. rotate if necessary;
5. return the repaired subtree root to the parent.

Refreshing before children are final can preserve an incorrect height even when the pointers look correct.

### Balance-factor invariant

Define the balance factor of $u$ as:

$$
BF(u)=h(u.left)-h(u.right).
$$

Every valid AVL node satisfies:

$$
BF(u)\in\{-1,0,1\}.
$$

A factor of `1` means the left side is one level taller.

A factor of `-1` means the right side is one level taller.

A factor of `0` means the child subtrees have equal height.

An insertion can first expose a factor of `2` or `-2` while recursion unwinds.

Deletion can expose the same imbalance at several ancestors because shortening a subtree may propagate upward.

### Rotations preserve sorted order

Consider a right rotation around `y`, whose left child is `x`.

Name the ordered subtrees `A`, `B`, and `C`:

```text
        y                    x
       / \                  / \
      x   C      ->        A   y
     / \                      / \
    A   B                    B   C
```

Before rotation, the search-tree ordering is:

$$
A < x < B < y < C.
$$

After rotation, the in-order sequence is still:

$$
A, x, B, y, C.
$$

Only ancestry changes.

The key order does not.

A left rotation is the mirror image.

The demoted node must be refreshed before the promoted node.

The promoted node's new height depends on the demoted node's repaired height.

### Four imbalance shapes

The sign of the current node's factor and the sign of its heavy child's factor determine the repair.

| Current factor | Heavy child factor | Shape | Repair |
| ---: | ---: | --- | --- |
| `> 1` | `>= 0` | left-left | right rotation |
| `> 1` | `< 0` | left-right | left rotation on child, then right rotation |
| `< -1` | `<= 0` | right-right | left rotation |
| `< -1` | `> 0` | right-left | right rotation on child, then left rotation |

Using `>= 0` and `<= 0` is important during deletion.

After insertion, the heavy child commonly has factor `1` or `-1`.

After deletion, the heavy child may have factor zero.

A repair routine based only on the newly inserted key often handles insertion but fails for deletion.

The structural factor test works for both operations.

### Why the height is logarithmic

Let $N(h)$ be the minimum number of nodes in an AVL tree of height $h$.

The sparsest valid tree of height $h$ combines subtrees of heights $h-1$ and $h-2$.

If the shorter child had height at most $h-3$, the root's balance magnitude would exceed one.

Therefore:

$$
N(h)=1+N(h-1)+N(h-2),
$$

with:

$$
N(0)=0,\qquad N(1)=1.
$$

The recurrence grows like the Fibonacci sequence.

In fact:

$$
N(h)=F_{h+2}-1.
$$

Because Fibonacci numbers grow proportionally to $\varphi^h$, where $\varphi=(1+\sqrt{5})/2$:

$$
n\ge N(h)=\Omega(\varphi^h).
$$

Taking logarithms gives:

$$
h=O(\log n).
$$

Search, insertion descent, deletion descent, and the upward repair path are consequently logarithmic in the worst case.

### Object-graph validity

A production boundary should validate more than heights.

A valid in-memory AVL tree also needs:

- no pointer cycle;
- no child object owned by two parents;
- keys within strict lower and upper bounds;
- stored heights equal to computed heights;
- balance magnitude at most one;
- an item count matching the number of reachable nodes.

Without identity checks, malformed input can make recursive traversal loop forever.

Without bound propagation, checking only immediate children can miss a deep ordering violation.

## 3. Step-by-Step Execution Trace

### Initial state and objective

Insert these unique keys into an empty AVL tree:

```text
30, 10, 20, 40, 50, 25
```

Then delete `10`.

The objective is to preserve sorted order and the balance-factor invariant after every completed update.

### Insert `30`

The empty tree accepts `30` as its root.

```text
30(h=1)
```

Its left and right heights are both zero.

Thus $BF(30)=0$.

### Insert `10`

`10 < 30`, so descent follows the left pointer.

The new node becomes the left child.

```text
    30(h=2)
   /
10(h=1)
```

Refreshing `30` gives height two.

Its balance factor is $1-0=1$.

No rotation is required.

### Insert `20`: left-right repair

`20 < 30`, then `20 > 10`.

The provisional structure is:

```text
    30
   /
 10
   \
   20
```

Node `10` has factor `-1` and remains locally valid.

Node `30` has left height two and right height zero.

Therefore $BF(30)=2$.

The heavy child `10` has a negative factor.

This is a left-right shape.

First rotate left around `10`:

```text
    30
   /
 20
 /
10
```

Then rotate right around `30`:

```text
      20(h=2)
     /  \
10(h=1) 30(h=1)
```

The in-order sequence remains `10, 20, 30`.

The new subtree root is `20`.

All factors are zero.

### Insert `40`

Descent follows `20 -> 30 -> right`.

```text
      20(h=3)
     /  \
   10    30(h=2)
           \
           40(h=1)
```

Node `30` has factor `-1`.

Node `20` has left height one and right height two, so its factor is `-1`.

No rotation is needed.

### Insert `50`: right-right repair

Descent follows `20 -> 30 -> 40 -> right`.

Before repair, the subtree rooted at `30` is a right-right chain:

```text
30
  \
  40
    \
    50
```

Node `30` reaches factor `-2`.

Its right child `40` has factor `-1`.

A single left rotation around `30` produces:

```text
      20(h=3)
     /  \
   10    40(h=2)
        /  \
      30    50
```

The sorted sequence is `10, 20, 30, 40, 50`.

Both subtrees of `40` have height one.

The root factor is `1 - 2 = -1`.

### Insert `25`: right-left repair at the root

Descent follows `20 -> 40 -> 30 -> left`.

The provisional tree is:

```text
      20
     /  \
   10    40
        /  \
      30    50
     /
   25
```

Node `30` has factor `1`.

Node `40` has factor `1`.

Node `20` has left height one and right height three, so its factor is `-2`.

The root is right-heavy while its heavy child is left-heavy.

This is a right-left shape.

First rotate right around `40`:

```text
      20
     /  \
   10    30
        /  \
      25    40
              \
              50
```

Then rotate left around `20`:

```text
          30(h=3)
        /         \
    20(h=2)       40(h=2)
   /      \             \
10(h=1) 25(h=1)        50(h=1)
```

The final insertion result has in-order sequence:

```text
10, 20, 25, 30, 40, 50
```

Every node has balance factor in `{-1, 0, 1}`.

### Delete `10`

Search follows `30 -> 20 -> 10`.

Node `10` is a leaf, so deletion replaces it with an empty subtree.

After refreshing `20`, its left height is zero and right height is one.

Its factor becomes `-1`, which is valid.

After refreshing `30`, both children still have height two.

No rotation is required.

```text
          30(h=3)
        /         \
    20(h=2)       40(h=2)
        \                \
       25(h=1)          50(h=1)
```

The final in-order sequence is:

```text
20, 25, 30, 40, 50
```

The trace illustrates three distinct facts.

Rotations are chosen from subtree shape, not from a memorized key pattern.

Every repair returns a potentially new subtree root to its parent.

Deletion must still refresh and rebalance while unwinding even when the removed node was a leaf.

## 4. Production-Ready Implementations

The following Python implementation is a mutable unique-key map.

It supports lookup, insertion with value replacement, deletion, ordered iteration, and a full invariant audit.

The implementation is production-oriented in its contracts and checks, but real services may additionally require locks, memory accounting, serialization, metrics, and workload-specific key comparators.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")


@dataclass(slots=True)
class _Node(Generic[K, V]):
    key: K
    value: V
    left: Optional["_Node[K, V]"] = None
    right: Optional["_Node[K, V]"] = None
    height: int = 1


class AVLMap(Generic[K, V]):
    def __init__(self) -> None:
        self._root: Optional[_Node[K, V]] = None
        self._size = 0

    def __len__(self) -> int:
        return self._size

    @staticmethod
    def _height(node: Optional[_Node[K, V]]) -> int:
        return 0 if node is None else node.height

    @classmethod
    def _refresh(cls, node: _Node[K, V]) -> None:
        node.height = 1 + max(cls._height(node.left), cls._height(node.right))

    @classmethod
    def _balance(cls, node: _Node[K, V]) -> int:
        return cls._height(node.left) - cls._height(node.right)

    @classmethod
    def _rotate_right(cls, top: _Node[K, V]) -> _Node[K, V]:
        promoted = top.left
        if promoted is None:
            raise AssertionError("right rotation requires a left child")
        transferred = promoted.right
        promoted.right = top
        top.left = transferred
        cls._refresh(top)
        cls._refresh(promoted)
        return promoted

    @classmethod
    def _rotate_left(cls, top: _Node[K, V]) -> _Node[K, V]:
        promoted = top.right
        if promoted is None:
            raise AssertionError("left rotation requires a right child")
        transferred = promoted.left
        promoted.left = top
        top.right = transferred
        cls._refresh(top)
        cls._refresh(promoted)
        return promoted

    @classmethod
    def _rebalance(cls, node: _Node[K, V]) -> _Node[K, V]:
        cls._refresh(node)
        factor = cls._balance(node)
        if factor > 1:
            if node.left is None:
                raise AssertionError("left-heavy node has no left child")
            if cls._balance(node.left) < 0:
                node.left = cls._rotate_left(node.left)
            return cls._rotate_right(node)
        if factor < -1:
            if node.right is None:
                raise AssertionError("right-heavy node has no right child")
            if cls._balance(node.right) > 0:
                node.right = cls._rotate_right(node.right)
            return cls._rotate_left(node)
        return node

    def get(self, key: K) -> V:
        current = self._root
        while current is not None:
            if key < current.key:
                current = current.left
            elif key > current.key:
                current = current.right
            else:
                return current.value
        raise KeyError(key)

    def __contains__(self, key: object) -> bool:
        current = self._root
        while current is not None:
            try:
                if key < current.key:
                    current = current.left
                elif key > current.key:
                    current = current.right
                else:
                    return True
            except TypeError:
                return False
        return False

    def put(self, key: K, value: V) -> Optional[V]:
        previous: Optional[V] = None
        inserted = False

        def insert(node: Optional[_Node[K, V]]) -> _Node[K, V]:
            nonlocal previous, inserted
            if node is None:
                inserted = True
                return _Node(key, value)
            if key < node.key:
                node.left = insert(node.left)
            elif key > node.key:
                node.right = insert(node.right)
            else:
                previous = node.value
                node.value = value
                return node
            return self._rebalance(node)

        self._root = insert(self._root)
        if inserted:
            self._size += 1
        return previous

    @staticmethod
    def _minimum(node: _Node[K, V]) -> _Node[K, V]:
        current = node
        while current.left is not None:
            current = current.left
        return current

    def delete(self, key: K) -> V:
        removed: Optional[V] = None
        found = False

        def erase(node: Optional[_Node[K, V]], target: K) -> Optional[_Node[K, V]]:
            nonlocal removed, found
            if node is None:
                return None
            if target < node.key:
                node.left = erase(node.left, target)
            elif target > node.key:
                node.right = erase(node.right, target)
            else:
                if not found:
                    removed = node.value
                    found = True
                if node.left is None:
                    return node.right
                if node.right is None:
                    return node.left
                successor = self._minimum(node.right)
                node.key, node.value = successor.key, successor.value
                node.right = erase(node.right, successor.key)
            return self._rebalance(node)

        self._root = erase(self._root, key)
        if not found:
            raise KeyError(key)
        self._size -= 1
        return removed  # type: ignore[return-value]

    def items(self) -> Iterator[tuple[K, V]]:
        stack: list[_Node[K, V]] = []
        current = self._root
        while current is not None or stack:
            while current is not None:
                stack.append(current)
                current = current.left
            current = stack.pop()
            yield current.key, current.value
            current = current.right

    def validate(self) -> int:
        seen: set[int] = set()

        def audit(
            node: Optional[_Node[K, V]],
            lower: Optional[K],
            upper: Optional[K],
        ) -> tuple[int, int]:
            if node is None:
                return 0, 0
            identity = id(node)
            if identity in seen:
                raise AssertionError("cycle or shared child detected")
            seen.add(identity)
            if lower is not None and not (lower < node.key):
                raise AssertionError("key violates strict lower bound")
            if upper is not None and not (node.key < upper):
                raise AssertionError("key violates strict upper bound")
            left_height, left_count = audit(node.left, lower, node.key)
            right_height, right_count = audit(node.right, node.key, upper)
            expected_height = 1 + max(left_height, right_height)
            if node.height != expected_height:
                raise AssertionError("stored height is stale")
            if abs(left_height - right_height) > 1:
                raise AssertionError("AVL balance invariant violated")
            return expected_height, 1 + left_count + right_count

        height, count = audit(self._root, None, None)
        if count != self._size:
            raise AssertionError("stored size does not match reachable nodes")
        return height
```

### Exercising all update contracts

The following checks reproduce the trace, test replacement semantics, delete every structural case, and compare ordered output against a reference dictionary.

```python
tree: AVLMap[int, str] = AVLMap()
for key in [30, 10, 20, 40, 50, 25]:
    assert tree.put(key, f"v{key}") is None
    tree.validate()

assert [key for key, _ in tree.items()] == [10, 20, 25, 30, 40, 50]
assert tree.get(25) == "v25"
assert tree.validate() == 3

assert tree.put(25, "updated") == "v25"
assert len(tree) == 6
assert tree.get(25) == "updated"

assert tree.delete(10) == "v10"
assert [key for key, _ in tree.items()] == [20, 25, 30, 40, 50]
tree.validate()

assert tree.delete(40) == "v40"
assert tree.delete(30) == "v30"
assert [key for key, _ in tree.items()] == [20, 25, 50]
tree.validate()

try:
    tree.get(999)
    raise AssertionError("missing lookup should fail")
except KeyError:
    pass

try:
    tree.delete(999)
    raise AssertionError("missing deletion should fail")
except KeyError:
    pass
```

### Differential randomized verification

Fixed examples cover known shapes.

Randomized operation sequences help expose a missed deletion case or stale metadata update.

The seed makes this test reproducible.

```python
import random

rng = random.Random(20260830)
subject: AVLMap[int, int] = AVLMap()
reference: dict[int, int] = {}

for _ in range(2_000):
    key = rng.randrange(0, 250)
    if rng.random() < 0.62:
        value = rng.randrange(-10_000, 10_001)
        expected_previous = reference.get(key)
        assert subject.put(key, value) == expected_previous
        reference[key] = value
    elif key in reference:
        assert subject.delete(key) == reference.pop(key)
    else:
        try:
            subject.delete(key)
            raise AssertionError("deleting an absent key should fail")
        except KeyError:
            pass

    subject.validate()
    assert list(subject.items()) == sorted(reference.items())
    assert len(subject) == len(reference)
```

### API and implementation cautions

The nested recursive functions capture one operation's key and result.

They are not safe to call concurrently on the same map without synchronization.

Python's recursion depth is not a concern for ordinary AVL sizes because tree height is logarithmic.

A corrupted unbalanced object graph could still exceed recursion limits, which is one reason validation should occur at trusted boundaries.

The optional return from `put` cannot distinguish “absent key” from “previous value was `None`” if `None` is admitted as a value.

An application needing that distinction should return a `(replaced, old_value)` pair or use a sentinel.

The implementation relies on keys having a consistent strict ordering.

Comparators that change over time, violate transitivity, or compare some key pairs but not others invalidate the tree contract.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of stored keys and $h$ the tree height.

The AVL recurrence proves $h=O(\log n)$.

### Search

Search follows exactly one child at each level.

It performs at most $h+1$ key comparisons before finding a key or reaching an empty child.

Therefore worst-case search time is:

$$
O(h)=O(\log n).
$$

An iterative search uses $O(1)$ auxiliary space.

### Insertion

Insertion first descends one root-to-leaf path.

The descent costs $O(h)$ comparisons.

Recursion then refreshes at most one node per level.

Each refresh and factor calculation is constant time because child heights are stored.

AVL insertion needs at most one single or double rotation at the first unbalanced ancestor.

A double rotation still changes only a constant number of pointers.

Total insertion time is therefore $O(\log n)$.

The recursive implementation uses $O(\log n)$ call-stack space.

An iterative parent-pointer implementation can make auxiliary space $O(1)$, excluding the new node.

### Deletion

Finding the target costs $O(\log n)$.

For a two-child node, finding the successor follows the left spine of the right subtree and remains within $O(\log n)$.

Unlike insertion, deletion can decrease subtree height repeatedly and trigger repairs at multiple ancestors.

There are at most $O(h)$ such ancestors.

Every repair is constant time.

Worst-case deletion time is consequently $O(\log n)$, not $O(1)$ despite constant-time individual rotations.

The recursive auxiliary space is $O(\log n)$.

### Ordered iteration

In-order traversal visits each node exactly once.

Producing all $n$ pairs costs $O(n)$ time.

The explicit stack holds at most $h$ nodes, so auxiliary space is $O(\log n)$.

Stopping after the first $k$ outputs costs $O(\log n+k)$ in the worst case: descend to the minimum, then advance through $k$ successors represented by the stack.

### Full validation

The audit visits every reachable node once and uses a hash set of identities.

Its time is $O(n)$.

The identity set uses $O(n)$ space.

The recursion stack uses an additional $O(\log n)$ for a valid AVL tree.

Full validation should therefore be used in tests, imports, diagnostics, and trust boundaries rather than on every ordinary lookup.

### Storage

Each key occupies one node with two child references and one height integer in addition to the key and value.

Total structural storage is $O(n)$.

The asymptotic notation hides allocation overhead, object headers, alignment, and pointer width.

Those constants can make a node-based tree substantially larger than a sorted array containing the same keys.

## 6. Systems Connections

### Read-heavy ordered dictionaries

AVL trees provide a strong ceiling on comparison depth.

That makes them useful when tail lookup latency matters and updates are less frequent than reads.

A service can also augment each node with subtree size to support rank and selection.

Any augmentation must be refreshed in the same bottom-up order as height.

### Interval and spatial indexes

An interval tree can use an AVL tree as its balancing skeleton.

Each node stores the maximum interval endpoint in its subtree.

Rotations preserve search order but change subtree membership, so both height and maximum endpoint must be recomputed for rotated nodes.

The rotation remains local, but incomplete augmentation updates cause incorrect pruning.

### Allocators and schedulers

An allocator may index free extents by size and address.

A scheduler may index timers by deadline.

An AVL tree gives logarithmic insertion, removal, and minimum-key discovery under hostile ordering.

Real implementations must additionally define duplicate handling because many extents can share a size and many timers can share a deadline.

A composite key or per-key bucket is safer than an undocumented “equal goes right” rule.

### Database internals

An AVL tree can serve as an in-memory secondary structure, but it is usually a poor direct substitute for a B-tree on block storage.

Binary nodes have low fan-out.

Low fan-out increases the number of page reads needed to reach a key.

B-trees trade more comparisons within one page for far fewer I/O levels.

The workload and memory hierarchy, not asymptotic lookup alone, determine the correct index.

### Persistence and snapshots

A persistent AVL tree creates new nodes along the update path instead of mutating existing nodes.

Unchanged subtrees can be shared between versions.

Because an update touches $O(\log n)$ ancestors, path copying creates $O(\log n)$ new nodes per version.

Identity sharing is intentional in that design, unlike the mutable ownership invariant audited by the implementation above.

The validator must match the representation: mutable-tree validators should reject shared children, while persistent-version validators need version-aware acyclicity rules.

### Concurrency

Rotations modify parent-child relationships across several nodes.

Publishing an intermediate state to lock-free readers can violate ordering or disconnect a subtree.

A concurrent design needs a proven protocol such as coarse locking, hand-over-hand locks with ordered acquisition, copy-on-write roots, or a specialized concurrent tree algorithm.

Adding a mutex around public map operations is simple but serializes all access.

Fine-grained locking can increase parallelism while making rotation and reclamation correctness much harder.

### Cache behavior

AVL height reduces the number of visited nodes but does not guarantee good locality.

General-purpose allocators may scatter nodes across pages.

Pool allocation, compact indices instead of pointers, and cache-aware layouts can improve locality.

A sorted vector can outperform a tree for read-mostly data because binary search touches contiguous storage, even though both use $O(\log n)$ comparisons.

Updates and latency guarantees must be considered together.

### Observability and defensive checks

Useful metrics include current size, observed height, rotations by type, update failures, and validation failures.

The ratio of height to $\log_2(n+1)$ can expose metadata corruption or a bypassed update path.

Do not run an $O(n)$ audit in a latency-sensitive request by default.

Instead, validate after deserialization, in tests, under a diagnostic flag, or on sampled snapshots.

## 7. Practice Checklist

### Invariant reasoning

- Define whether empty height is zero or `-1` before writing rotations.
- Derive leaf height from that convention.
- State the duplicate-key policy.
- Prove that a rotation preserves the in-order sequence.
- Explain why the demoted node is refreshed first.
- Derive the minimum-node recurrence $N(h)$.
- Connect Fibonacci growth to logarithmic height.
- Explain why deletion can repair more than one ancestor.
- Distinguish tree height from stored node count.
- Include identity safety when validating imported object graphs.

### Rotation exercises

- Insert `30, 20, 10` and identify the left-left repair.
- Insert `10, 20, 30` and identify the right-right repair.
- Insert `30, 10, 20` and identify the left-right repair.
- Insert `10, 30, 20` and identify the right-left repair.
- Draw the transferred middle subtree for every rotation.
- Verify the in-order sequence before and after each drawing.
- Recompute heights from leaves upward.
- Test a deletion whose heavy child has factor zero.
- Test deletion of a leaf.
- Test deletion of a one-child node.
- Test deletion of a two-child node.

### Implementation review

- Return the new subtree root from every recursive mutation.
- Assign that returned root back to the caller's child link.
- Refresh metadata after child mutation and before factor inspection.
- Choose rotations from structural balance factors.
- Do not use insertion-key comparisons inside a shared deletion repair routine.
- Replace both key and value when copying a successor.
- Decrement size exactly once for a successful public deletion.
- Keep successor removal from overwriting the original returned value.
- Reject a missing key without changing size.
- Preserve size when replacing an existing value.
- Use iterative ordered traversal when callers may stop early.
- Document comparator requirements.

### Testing strategy

- Validate after every mutation in small deterministic tests.
- Compare in-order output with a trusted sorted map model.
- Use a fixed random seed for reproducibility.
- Exercise all four rotation shapes.
- Exercise root deletion repeatedly until the tree is empty.
- Insert already sorted keys.
- Insert reverse-sorted keys.
- Alternate low and high keys.
- Replace values at existing keys.
- Attempt missing lookup and deletion.
- Corrupt a stored height and confirm the auditor rejects it.
- Corrupt a deep ordering bound and confirm rejection.
- Construct a pointer cycle and confirm rejection.
- Construct a shared child and confirm rejection.
- Run property tests over long mixed-operation sequences.

### Design selection

- Compare AVL with a red-black tree for update frequency.
- Compare a node tree with a sorted vector for read-mostly data.
- Compare AVL with a B-tree for page-oriented storage.
- Account for allocation and pointer overhead.
- Decide whether range iteration is required.
- Decide whether rank/select augmentation is required.
- Decide whether snapshots require persistence.
- Choose a concurrency model before exposing shared mutation.
- Measure real cache misses instead of inferring them from Big-O.
- Keep full validation off the ordinary hot path unless required by trust boundaries.

## 8. Frequently Asked Questions

### Does an AVL tree remain perfectly balanced?

No.

It permits child-subtree heights to differ by one at each node.

This local rule is weaker than perfect balance but strong enough to guarantee logarithmic height.

### Why store height instead of computing it when needed?

Computing a subtree height recursively can visit many descendants.

Doing that at every ancestor during an update can turn a logarithmic operation into much more work.

Stored heights make each local balance decision constant time.

### Can a balance factor be stored instead of a full height?

Yes.

An implementation can encode `-1`, `0`, or `1` compactly and update it through carefully derived rotation cases.

Storing full heights is often easier to implement and audit, while balance-only representations may save metadata bits.

### Why does deletion use child balance signs rather than the deleted key?

The deleted key describes where search ended, not necessarily the shape of each damaged ancestor.

Deletion may propagate through multiple ancestors, and a heavy child can have factor zero.

Inspecting actual subtree factors selects the valid repair in both insertion and deletion.

### How many rotations can insertion perform?

Standard AVL insertion needs at most one repair at the first unbalanced ancestor.

That repair is either one single rotation or one double rotation.

After it restores the subtree's previous height, higher ancestors do not become newly unbalanced from that insertion.

### How many rotations can deletion perform?

Deletion may require repairs at multiple ancestors.

Removing a node can shorten a repaired subtree, allowing height reduction to continue toward the root.

The total work still remains $O(\log n)$.

### Why copy the in-order successor for a two-child deletion?

The successor is the smallest key in the right subtree.

It is greater than every key in the left subtree and no greater right-subtree key lies below it.

Copying its entry into the target position preserves ordering, after which the successor has at most one child and is easier to remove.

The predecessor from the left subtree is an equally valid symmetric choice.

### Is an AVL tree always faster than a red-black tree?

No.

AVL trees usually have a tighter height bound, which can reduce lookup comparisons.

Red-black trees often perform fewer structural repairs for update-heavy workloads.

Allocator behavior, key-comparison cost, cache locality, and concurrency can dominate the theoretical height difference.

### Can an AVL tree contain duplicate keys?

It can, but the policy must be explicit.

A map commonly replaces the value at an existing key.

A multimap can store multiple values at one node or use a composite key.

Creating indistinguishable duplicate nodes without a strict policy weakens validation and API semantics.

### Is recursive implementation safe?

For a valid AVL tree, recursion depth is $O(\log n)$.

That is modest for realistic in-memory sizes.

Untrusted or corrupted object graphs should be validated or parsed with explicit limits before recursive operations.

### Why can a sorted array outperform an AVL tree?

A sorted array is contiguous and cache-friendly.

Binary search needs logarithmic comparisons and often fewer cache misses.

Its insertion and deletion require shifting elements, so it is strongest when updates are rare or batched.

### Is an AVL tree appropriate for disk indexes?

Usually not as the primary page structure.

A binary node offers fan-out two, creating more levels and potential I/O operations.

B-trees and B+ trees store many separators per page and are designed for block-oriented storage.

### What should a validator check besides balance factors?

It should verify global key bounds, exact stored heights, object-graph acyclicity, exclusive mutable ownership, and size accounting.

A tree can have every local balance factor in range while still violating search order or containing stale metadata.

### What is the most common rotation bug?

Failing to reconnect the transferred middle subtree is especially destructive because it silently loses keys.

Another common bug refreshes the promoted node before the demoted node, storing an incorrect height.

Drawing `A < x < B < y < C` before coding makes both errors easier to catch.

### What is the best practical correctness oracle?

Use two layers.

Run a structural validator after every mutation in tests.

Also compare observable behavior—size, lookup results, and ordered iteration—with a trusted reference dictionary across randomized operation sequences.
