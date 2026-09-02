# Binary Search Trees: Ordered Subtrees, Successor Deletion & Shape Sensitivity

![Binary Search Trees: Ordered Subtrees, Successor Deletion & Shape Sensitivity](/images/dsa/binary-search-trees-dark.jpg#dark)

## 1. Historical Context & Motivation

An ordered array supports logarithmic lookup but needs linear movement for insertion into the middle.

A linked list supports local insertion but cannot discard half of its nodes by key comparison.

A **binary search tree (BST)** stores an ordering decision in every node:

- smaller keys belong to the left subtree;
- larger keys belong to the right subtree.

Following those decisions can locate, insert, or delete a key without shifting an array suffix.

The structure underlies ordered maps, ordered sets, symbol tables, range indexes, and many balanced-tree variants.

Its most important limitation is equally fundamental.

Ordering does not imply balance.

Inserting `1,2,3,4,5` into a plain BST creates a rightward chain.

Lookup then takes linear time in the worst case.

Inserting a median-first order can create a shallow tree containing the same keys.

Thus plain BST complexity depends on shape, which depends on update history.

Balanced trees such as AVL and red-black trees add invariants that guarantee logarithmic height.

Randomized treaps make shape independent of key arrival order under a priority model.

B-trees adapt ordered search to storage pages.

The unbalanced BST remains essential because it exposes the ordering invariant those structures preserve during rotations, splits, and merges.

Deletion is the operation that tests whether that invariant is genuinely understood.

Removing a leaf is local.

Removing a one-child node splices its child upward.

Removing a two-child node requires replacing it with an entry that fits between the entire left and right ranges.

The in-order successor—the minimum node in the right subtree—is one such replacement.

The predecessor from the left subtree is the symmetric alternative.

Duplicate keys also require a policy.

This article implements map semantics: inserting an existing key replaces its value and does not allocate a second node.

A multimap should store a value collection at one key or use a composite ordering key rather than quietly scattering indistinguishable duplicates.

The central idea is:

**every operation must preserve global subtree bounds, not merely compare a node with its immediate children.**

## 2. Core Mathematical Invariants

### Strict ordering

For each node $u$:

$$
\forall x\in u.left,\quad x.key<u.key
$$

and:

$$
\forall y\in u.right,\quad u.key<y.key.
$$

The quantifiers range over entire subtrees.

A node can be smaller than its parent while still violating an ancestor's lower bound.

Validation must propagate an interval from the root.

### Search interval

Begin with unbounded key interval:

$$
(-\infty,+\infty).
$$

At node key $k$:

- descending left changes the upper bound to $k$;
- descending right changes the lower bound to $k$.

Every visited node must lie strictly between its inherited bounds.

This interval interpretation proves that one comparison selects the only subtree that can contain the target.

### Shape and height

Use height zero for an empty tree and one for a leaf.

For node $u$:

$$
h(u)=1+\max(h(u.left),h(u.right)).
$$

Every search path has length at most $h$ nodes.

The best possible height for $n$ nodes is $\Theta(\log n)$.

The worst possible height is $n$.

A plain BST has no invariant excluding the worst shape.

### Unique ownership

In a mutable pointer tree, each non-root node has exactly one parent.

No child pointer forms a cycle.

Sharing one mutable child from two parents would make deletion and updates ambiguous.

Persistent immutable trees intentionally share unchanged subtrees across versions and need a different ownership validator.

### Size invariant

Stored size equals the number of reachable nodes.

Replacing an existing key preserves size.

Inserting a new key increments size once.

Successful deletion decrements size once, even when a two-child deletion internally copies a successor and removes its original node.

Failed deletion leaves size and shape unchanged.

### In-order invariant

In-order traversal visits:

1. the left subtree;
2. the current node;
3. the right subtree.

By the ordering invariant, its key output is strictly increasing.

Conversely, a strictly increasing in-order traversal is useful evidence but does not alone defend against cycles or shared objects.

### Minimum and maximum

The minimum node is reached by following left pointers until none remains.

The maximum is reached symmetrically through right pointers.

Each operation costs $O(h)$ in the worst case.

The successor of a node with a right subtree is the right-subtree minimum.

If parent links exist and no right subtree exists, successor is the first ancestor for which the node lies in the ancestor's left subtree.

### Two-child deletion

Let target node $z$ have nonempty left and right children.

Let $s$ be the minimum node in $z.right$.

Then $s$ has no left child.

Every key in $z.left$ is smaller than $z.key$, and $z.key<s.key$.

Every other key in $z.right$ is at least $s.key$ and, under unique keys, strictly larger unless it is $s$ itself.

Replacing $z$'s entry with $s$'s entry preserves the boundary between left and right ranges.

Then remove the original successor node, which has at most one child.

### Iterator stack invariant

An iterative in-order iterator stores a path of nodes whose left subtrees have been exhausted but whose own entries have not all been emitted.

Pushing the left spine establishes the next smallest key at the stack top.

After emitting a node, pushing the left spine of its right child restores the invariant.

The stack size is at most tree height.

## 3. Step-by-Step Execution Trace

### Build the tree

Insert keys with values in this order:

```text
50, 30, 70, 20, 40, 60, 80, 35, 45, 65
```

The resulting shape is:

```text
             50
          /      \
        30        70
       /  \      /  \
     20   40    60   80
         /  \     \
        35  45     65
```

In-order traversal yields:

```text
20, 30, 35, 40, 45, 50, 60, 65, 70, 80
```

### Search for `45`

Compare with root `50`.

`45 < 50`, so only the left subtree can contain it.

Compare with `30`.

`45 > 30`, so descend right.

Compare with `40`.

`45 > 40`, so descend right.

The next node is `45`, so lookup succeeds after four node visits.

The inherited interval narrows as:

```text
(-inf, +inf)
(-inf, 50)
(30, 50)
(40, 50)
```

### Replace key `40`

Searching `40` follows `50 -> 30 -> 40`.

Because the key exists, replace its value in place.

No node is added.

Tree shape and size remain unchanged.

### Delete leaf `20`

Search follows `50 -> 30 -> 20`.

Node `20` has no children.

Set `30.left` to empty.

All other links remain unchanged.

### Delete one-child node `60`

After the previous deletion, find `60` via `50 -> 70 -> 60`.

Node `60` has only right child `65`.

Replace the parent link `70.left` with `65`.

```text
             50
          /      \
        30        70
          \      /  \
          40    65   80
         /  \
        35  45
```

The child subtree remains within inherited bounds `(50,70)`.

### Delete two-child node `30`

Node `30` now has only right child after deleting `20`, so it would no longer demonstrate the two-child case.

Instead delete root `50`, which has two children.

The right subtree is rooted at `70`.

Its minimum is `65`, reached by one left step.

Copy key and value from `65` into the root position.

The root entry becomes `65`.

Now remove the original `65` node from `70.left`.

That node is a leaf after the earlier splice.

Final tree:

```text
             65
          /      \
        30        70
          \         \
          40         80
         /  \
        35  45
```

Final in-order sequence:

```text
30, 35, 40, 45, 65, 70, 80
```

Every key left of `65` is smaller.

Every key right of `65` is larger.

The copied successor did not create a duplicate because its original node was removed.

### Degenerate insertion trace

Insert `1,2,3,4,5` into an empty plain BST.

Every comparison chooses the right child.

The height grows from one through five:

```text
1
 \
  2
   \
    3
     \
      4
       \
        5
```

Searching for `5` visits all five nodes.

The ordering invariant is valid, but logarithmic performance is absent.

This trace separates correctness from balance guarantees.

## 4. Production-Ready Implementations

The following Python map uses iterative lookup, insertion, deletion, and in-order traversal.

It keeps no parent pointers, so deletion tracks the parent during search.

Its validator checks global bounds, identity ownership, size, and height.

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


class BinarySearchTreeMap(Generic[K, V]):
    def __init__(self) -> None:
        self._root: Optional[_Node[K, V]] = None
        self._size = 0

    def __len__(self) -> int:
        return self._size

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

    def put(self, key: K, value: V) -> Optional[V]:
        if self._root is None:
            self._root = _Node(key, value)
            self._size = 1
            return None

        current = self._root
        while True:
            if key < current.key:
                if current.left is None:
                    current.left = _Node(key, value)
                    self._size += 1
                    return None
                current = current.left
            elif key > current.key:
                if current.right is None:
                    current.right = _Node(key, value)
                    self._size += 1
                    return None
                current = current.right
            else:
                previous = current.value
                current.value = value
                return previous

    def delete(self, key: K) -> V:
        parent: Optional[_Node[K, V]] = None
        current = self._root
        while current is not None and current.key != key:
            parent = current
            current = current.left if key < current.key else current.right
        if current is None:
            raise KeyError(key)

        removed_value = current.value
        if current.left is not None and current.right is not None:
            successor_parent = current
            successor = current.right
            while successor.left is not None:
                successor_parent = successor
                successor = successor.left
            current.key, current.value = successor.key, successor.value
            parent = successor_parent
            current = successor

        replacement = current.left if current.left is not None else current.right
        if parent is None:
            self._root = replacement
        elif parent.left is current:
            parent.left = replacement
        elif parent.right is current:
            parent.right = replacement
        else:
            raise AssertionError("parent does not reference deletion node")

        self._size -= 1
        return removed_value

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
            return 1 + max(left_height, right_height), 1 + left_count + right_count

        height, count = audit(self._root, None, None)
        if count != self._size:
            raise AssertionError("stored size does not match reachable nodes")
        return height
```

### Verify the worked trace

```python
tree: BinarySearchTreeMap[int, str] = BinarySearchTreeMap()
for key in [50, 30, 70, 20, 40, 60, 80, 35, 45, 65]:
    assert tree.put(key, f"v{key}") is None
    tree.validate()

assert [key for key, _ in tree.items()] == [20, 30, 35, 40, 45, 50, 60, 65, 70, 80]
assert tree.get(45) == "v45"
assert tree.put(40, "updated") == "v40"
assert len(tree) == 10
assert tree.get(40) == "updated"

assert tree.delete(20) == "v20"
tree.validate()
assert tree.delete(60) == "v60"
tree.validate()
assert tree.delete(50) == "v50"
tree.validate()
assert [key for key, _ in tree.items()] == [30, 35, 40, 45, 65, 70, 80]
```

### Differential randomized verification

The test compares map behavior with a reference dictionary and sorted iteration after every mixed operation.

```python
import random

rng = random.Random(20260830)
subject: BinarySearchTreeMap[int, int] = BinarySearchTreeMap()
reference: dict[int, int] = {}

for step in range(3_000):
    key = rng.randrange(0, 400)
    if rng.random() < 0.64:
        value = step - key
        assert subject.put(key, value) == reference.get(key)
        reference[key] = value
    elif key in reference:
        assert subject.delete(key) == reference.pop(key)
    else:
        try:
            subject.delete(key)
            raise AssertionError("missing deletion should fail")
        except KeyError:
            pass
    subject.validate()
    assert list(subject.items()) == sorted(reference.items())
    assert len(subject) == len(reference)
```

### Degeneration verification

```python
chain: BinarySearchTreeMap[int, int] = BinarySearchTreeMap()
for key in range(1, 501):
    chain.put(key, key)
assert chain.validate() == 500
assert chain.get(500) == 500
```

The height check is intentional.

This implementation promises ordered-map correctness, not balance.

Applications accepting adversarial or sorted insertion orders should select a structure with a height guarantee or randomization policy.

### API cautions

The optional return from `put` cannot distinguish an absent key from a previous stored value of `None` if `None` is permitted.

A sentinel or `(replaced, previous)` result solves that ambiguity.

Keys must provide a consistent strict ordering.

Mutation of a key's comparison fields after insertion corrupts placement.

Concurrent mutation requires synchronization or an immutable/persistent design.

## 5. Asymptotic Time & Space Complexity

Let $h$ be tree height and $n$ stored nodes.

### Search

One comparison chooses one child per visited level.

Time is $O(h)$.

In a balanced shape, $h=\Theta(\log n)$.

In a chain, $h=n$, so search is $\Theta(n)$ in the worst case.

Iterative search uses $O(1)$ auxiliary space.

### Insertion

Insertion follows one search path and links one node, so time is $O(h)$.

Value replacement follows the same path without allocation.

The iterative implementation uses $O(1)$ auxiliary space.

No balancing work changes the shape guarantee.

### Deletion

Finding the target costs $O(h)$.

For a two-child node, finding the right-subtree minimum follows another downward path contained within the same height bound.

Splicing changes constant many links.

Total time is $O(h)$.

Auxiliary space is $O(1)$ for the iterative implementation.

### Ordered traversal

Every node is pushed and popped once.

Producing all entries costs $\Theta(n)$ time.

The stack uses $O(h)$ space.

In a balanced tree this is $O(\log n)$; in a chain it is $O(n)$.

### Validation

The validator visits every reachable node once.

Time is $O(n)$.

Its identity set uses $O(n)$ space.

The recursive stack uses $O(h)$ additional space.

The degeneration test at height 500 stays below ordinary Python recursion limits, but larger corrupt or chained trees may require an iterative auditor.

### Range reporting

Finding the lower boundary costs $O(h)$.

Reporting $k$ consecutive keys through a successor-aware iterator costs $O(h+k)$ in a typical stack traversal formulation.

Output itself requires $\Omega(k)$ work when all entries are materialized.

### Expected shape under random insertion

For distinct keys inserted in uniformly random order, expected height and expected operation cost are logarithmic.

That is an average over an insertion-order distribution, not a worst-case guarantee.

Real identifiers may be sorted, clustered, or adversarial, so relying on random shape needs an explicit workload assumption.

## 6. Systems Connections

### Ordered maps and sets

A BST naturally supports predecessor, successor, minimum, maximum, range iteration, and sorted output.

A hash table usually offers stronger expected equality lookup constants but no intrinsic key order.

The API's ordering requirements should drive the choice.

### Balanced-tree foundations

AVL, red-black, splay, and treap implementations preserve the same BST key-order invariant while changing shape.

Rotations alter ancestry but preserve in-order sequence.

Understanding global bounds makes rotation correctness easier to prove.

### Expression and syntax trees

Not every binary tree is a binary search tree.

Expression trees encode operators and operands by syntax, not key order.

Applying BST search assumptions to an arbitrary binary tree can miss values.

Data-structure names should follow their invariants, not merely node arity.

### In-memory indexes

Plain BSTs can be adequate for controlled construction, small data, or ephemeral teaching tools.

Production indexes exposed to arbitrary insertion order usually need balance.

Pointer allocation also affects cache locality and memory overhead.

A sorted vector can outperform a tree for read-mostly snapshots.

### Persistence

An immutable BST update copies nodes along the search path and shares unchanged subtrees.

Cost is $O(h)$ new nodes per version.

Shared immutable subtrees are safe, while the mutable validator's exclusive-ownership rule would reject them.

Representation and validation contracts must align.

### Concurrency

Concurrent readers can traverse an immutable tree safely.

Mutable insertion and deletion can race with readers and expose disconnected or partially updated paths.

Coarse locks, fine-grained protocols, copy-on-write roots, and specialized concurrent trees offer different trade-offs.

Adding unsynchronized parent pointers or rotations is not sufficient.

### Serialization

Serializing only in-order keys loses shape but preserves sorted content.

Reinserting them in sorted order recreates the worst possible chain.

To preserve performance, store shape, rebuild from medians, or load into a balanced structure.

Untrusted serialized object graphs need size, depth, key, cycle, and ownership checks.

### Augmentation

Storing subtree sizes supports rank and selection.

Storing interval maxima supports interval overlap queries.

Every mutation must update augmentation metadata along the affected path.

Plain BST ordering proves navigation; augmentation supplies problem-specific summaries.

## 7. Practice Checklist

### Define semantics

- Choose map or multimap behavior.
- Define duplicate-key handling.
- Define the comparator contract.
- Define absence behavior.
- Decide whether values may be `None`.
- Decide whether iteration order is part of the API.
- State whether balance is guaranteed.
- State concurrency expectations.

### Preserve ordering

- Propagate strict lower and upper bounds in validation.
- Descend left only for smaller keys.
- Descend right only for larger keys.
- Replace values on equal keys under map semantics.
- Verify in-order output is increasing.
- Prevent key mutation that changes ordering.
- Reject comparator inconsistency.

### Implement deletion

- Handle leaf deletion.
- Handle left-only nodes.
- Handle right-only nodes.
- Handle two-child nodes.
- Find the right-subtree minimum correctly.
- Copy both key and value from the successor.
- Remove the successor's original node.
- Reconnect the successor's possible right child.
- Handle root deletion.
- Decrement size exactly once.
- Preserve state on missing deletion.

### Validate object safety

- Detect pointer cycles.
- Detect shared mutable children.
- Compare reachable count with stored size.
- Measure height.
- Bound recursive validation depth for untrusted input.
- Test malformed deep ordering violations.
- Test a self-cycle.
- Test a shared child.

### Test shape sensitivity

- Insert ascending keys.
- Insert descending keys.
- Insert median-first keys.
- Insert random permutations.
- Measure height after each pattern.
- Compare with AVL or red-black height.
- Rebuild serialized sorted input safely.
- Avoid claiming logarithmic worst-case cost for the plain tree.

## 8. Frequently Asked Questions

### Is every binary tree a binary search tree?

No.

A binary tree limits each node to at most two children.

A BST additionally imposes a global key-order invariant on entire subtrees.

### Is BST search always $O(\log n)$?

No.

It is $O(h)$, where $h$ is height.

Without balancing, height can be $n$.

### Why can sorted insertion be bad?

Each new maximum follows only right pointers and becomes the final right child.

The tree becomes a linked chain rather than a branching search structure.

### How do balanced trees help?

They add shape invariants and local restructuring so height stays logarithmic.

They preserve the same in-order key sequence while changing ancestry.

### What happens when inserting a duplicate key?

This article's map replaces the existing value.

A set can ignore the duplicate.

A multimap can store multiple values at one node or use composite keys.

The policy must be explicit.

### Why use the successor for two-child deletion?

It is the smallest key greater than the target within the right subtree.

It fits above the entire left range and below every remaining right-subtree key.

It also has no left child, making its original position easy to splice.

### Can the predecessor be used instead?

Yes.

Use the maximum node in the left subtree and then remove its original position.

The implementation should choose one policy consistently.

### Does copying the successor create a duplicate?

Only temporarily inside the update procedure.

The original successor node is removed before deletion completes, restoring unique-key ownership.

### Why is checking only immediate children insufficient?

A node deep in the left subtree can be smaller than its parent but larger than the root, violating the root's upper bound.

Global interval propagation catches this defect.

### What does in-order traversal produce?

For a valid unique-key BST, it produces keys in strictly increasing order.

For a defined duplicate policy, it produces nondecreasing order according to that policy.

### Is a hash table better than a BST?

For equality-only lookup, a hash table often has better expected constants.

A BST supports sorted iteration and ordered queries naturally.

Worst-case guarantees depend on whether the chosen tree is balanced and whether hashing is protected from adversarial collisions.

### Should a production system use this plain tree?

Use it only when uncontrolled shape is acceptable or construction guarantees a suitable shape.

For arbitrary updates with predictable latency, choose a balanced or randomized ordered structure.

### Can a BST be stored in an array?

A complete or nearly complete tree can use heap-like indices efficiently.

An arbitrary sparse shape wastes slots under that layout.

Compact node arrays with child indices can improve locality without requiring complete-tree positions.

### How is range search performed?

Navigate toward the lower bound, then traverse successors while keys remain within the upper bound.

Subtrees known to lie entirely outside the range can be skipped.

### What is the core deletion test?

After every deletion, verify sorted in-order output, exact size, global bounds, and reachability of all expected keys.

Randomized differential testing against a trusted ordered model catches many link-reconnection errors.
