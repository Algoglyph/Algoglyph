# Red-Black Trees: Black-Height Invariants, Rotations & Bounded Search Paths

![Red-black tree colors and rotations](/images/dsa/red-black-trees-dark.png#dark)

## 1. Historical Context & Motivation

A binary search tree provides ordered lookup through left and right comparisons.

Its running time depends on tree height.

Sorted insertion can turn an ordinary BST into a linear chain.

Red-black trees prevent that degeneration with one color bit per node.

Their local color rules constrain every root-to-leaf path.

Insertion and deletion restore those rules through recoloring and rotations.

Rudolf Bayer's symmetric binary B-tree inspired the structure.

Guibas and Sedgewick developed the red-black formulation in the 1970s.

The structure is less rigidly balanced than an AVL tree.

That flexibility often reduces rotations during updates.

Search remains logarithmic because no path can be more than twice another's black depth.

Red-black trees back ordered maps and sets in many standard libraries.

They support predecessor, successor, minimum, maximum, and ordered iteration.

Unlike hash tables, they preserve sorted key order.

Unlike B-trees, binary nodes may use more pointer traversals on external storage.

The balancing rules are easy to state but deletion repair is intricate.

Color belongs to structure, not to application data.

Red does not mean “larger,” “newer,” or “invalid.”

Sentinel leaves simplify reasoning by giving every child a black node.

Implementations often share one black `NIL` sentinel.

The root's parent can also be `NIL`.

This removes many null-specific branches.

Rotations preserve in-order key sequence.

They change parent-child topology without changing the represented map.

Recoloring preserves topology but changes black-height accounting.

Update repair combines those operations according to local cases.

Duplicate keys need an explicit policy.

A map can replace the existing value.

A multiset can store counts or order duplicates consistently.

This article uses unique keys and value replacement.

The central lesson is to separate the BST ordering invariant from color invariants.

Both must hold after every public operation.

## 2. Core Mathematical Invariants

### Binary-search ordering

For node `v`, every key in its left subtree is less than `v.key`.

Every key in its right subtree is greater than `v.key`.

In-order traversal therefore yields keys in ascending order.

Rotations must preserve this ordering.

### Color domain

Every ordinary node is red or black.

Every sentinel leaf is black.

The color bit does not affect key comparison.

### Root rule

The root is black in the conventional invariant set.

Some proofs temporarily permit a red root and blacken it at operation end.

Blackening the root cannot create a red-red violation.

It increases every root-to-leaf black count equally.

### Red-parent rule

A red node has black children.

Equivalently, no red node has a red parent.

Thus red nodes cannot appear consecutively on one downward path.

### Black-height rule

Every path from a node to a descendant `NIL` leaf contains the same number of black nodes.

Define black height `bh(v)` excluding `v` but including the terminal sentinel consistently.

For each internal node:

$$
bh(v.left)=bh(v.right).
$$

The exact counting convention can vary, but it must remain consistent.

### Height bound

Let a tree have `n` internal nodes and height `h`.

A subtree with black height `b` has at least $2^b-1$ internal nodes.

Therefore black height is at most $\log_2(n+1)$.

No two red nodes are adjacent.

At least half the nodes on any root-to-leaf path are black.

Hence:

$$
h\le 2\log_2(n+1).
$$

Search, insertion descent, and deletion descent are logarithmic.

### Rotation invariant

A left rotation at `x` promotes `x.right = y`.

The subtree `y.left` becomes `x.right`.

Node `x` becomes `y.left`.

The in-order sequence remains:

$$
keys(x.left),x,keys(y.left),y,keys(y.right).
$$

A right rotation is symmetric.

Every moved child's parent pointer must be updated.

The root pointer must change when rotating at the root.

### Insertion repair invariant

A new BST leaf is initially red.

This preserves black height because no new black node enters a path.

Only a red-parent violation can arise.

Repair moves that violation upward or removes it locally.

The root is blackened at the end.

### Deletion deficit

Deleting a red node preserves black heights immediately.

Deleting a black node creates one missing black on paths through its replacement.

Repair moves or resolves this “double-black” deficit.

Double black is a reasoning state, not usually a stored third color.

Sibling color and nephew colors determine each repair case.

## 3. Step-by-Step Execution Trace

Insert keys `10`, `5`, `1`, `7`, `40`, and `50`.

Start with an empty tree.

Insert `10` as a red BST leaf.

It is the root, so recolor it black.

Insert `5` as the left child of `10`.

New node `5` is red.

Its parent `10` is black, so no repair is needed.

Insert `1` as the left child of `5`.

Node `1` and parent `5` are both red.

Grandparent is `10` and uncle is the black `NIL` right child.

This is a left-left configuration.

Right-rotate at grandparent `10`.

Node `5` becomes the subtree root.

Node `10` becomes its right child.

Recolor `5` black and `10` red.

Tree root is now black `5` with red children `1` and `10`.

Insert `7`.

BST search places it as the left child of `10`.

Parent `10` is red.

Uncle `1` is also red.

Recolor parent `10` and uncle `1` black.

Recolor grandparent `5` red.

The violation moves to root `5`.

Blacken the root.

All root-to-leaf paths retain equal black height.

Insert `40` as the right child of `10`.

Parent `10` is black, so no repair occurs.

Insert `50` as the right child of `40`.

Parent `40` is red and uncle `7` is red.

Recolor `40` and `7` black.

Recolor grandparent `10` red.

Parent of `10` is black root `5`, so repair ends.

The final in-order sequence is `[1,5,7,10,40,50]`.

No red node has a red child.

Every path to a sentinel has consistent black count.

### Triangle insertion trace

Suppose black grandparent `20` has red left child `10`.

Insert `15` as the right child of `10`.

The uncle is black.

This is a left-right triangle.

Left-rotate at parent `10` to convert it into a left-left line.

Then right-rotate at grandparent `20`.

Recolor promoted `15` black and demoted `20` red.

The keys remain in order `10,15,20`.

### Black-leaf deletion intuition

If a black leaf is removed, its replacement sentinel lacks one black.

A red sibling can be rotated and recolored to expose a black sibling case.

A black sibling with black children passes the deficit upward after recoloring red.

A sibling with a far red child resolves the deficit through rotation and recoloring.

Every case preserves BST order while restoring path counts.

## 4. Production-Ready Implementations

The following Python map implements search and insertion repair.

Deletion is intentionally not mislabeled as complete; production deletion requires the full deficit cases.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")
RED = True
BLACK = False


@dataclass(slots=True)
class Node(Generic[K, V]):
    key: K
    value: V
    color: bool = RED
    left: Optional[Node[K, V]] = None
    right: Optional[Node[K, V]] = None
    parent: Optional[Node[K, V]] = None


class RedBlackMap(Generic[K, V]):
    def __init__(self) -> None:
        self.root: Optional[Node[K, V]] = None

    @staticmethod
    def _color(node: Optional[Node[K, V]]) -> bool:
        return BLACK if node is None else node.color

    def get(self, key: K) -> V:
        node = self.root
        while node is not None:
            if key < node.key:
                node = node.left
            elif node.key < key:
                node = node.right
            else:
                return node.value
        raise KeyError(key)

    def _rotate_left(self, x: Node[K, V]) -> None:
        y = x.right
        assert y is not None
        x.right = y.left
        if y.left is not None:
            y.left.parent = x
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x is x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _rotate_right(self, y: Node[K, V]) -> None:
        x = y.left
        assert x is not None
        y.left = x.right
        if x.right is not None:
            x.right.parent = y
        x.parent = y.parent
        if y.parent is None:
            self.root = x
        elif y is y.parent.right:
            y.parent.right = x
        else:
            y.parent.left = x
        x.right = y
        y.parent = x

    def put(self, key: K, value: V) -> None:
        parent: Optional[Node[K, V]] = None
        current = self.root
        while current is not None:
            parent = current
            if key < current.key:
                current = current.left
            elif current.key < key:
                current = current.right
            else:
                current.value = value
                return

        node = Node(key, value, parent=parent)
        if parent is None:
            self.root = node
        elif key < parent.key:
            parent.left = node
        else:
            parent.right = node
        self._fix_insert(node)

    def _fix_insert(self, node: Node[K, V]) -> None:
        while node.parent is not None and node.parent.color == RED:
            parent = node.parent
            grand = parent.parent
            assert grand is not None
            if parent is grand.left:
                uncle = grand.right
                if self._color(uncle) == RED:
                    parent.color = BLACK
                    assert uncle is not None
                    uncle.color = BLACK
                    grand.color = RED
                    node = grand
                else:
                    if node is parent.right:
                        node = parent
                        self._rotate_left(node)
                        parent = node.parent
                        assert parent is not None
                        grand = parent.parent
                        assert grand is not None
                    parent.color = BLACK
                    grand.color = RED
                    self._rotate_right(grand)
            else:
                uncle = grand.left
                if self._color(uncle) == RED:
                    parent.color = BLACK
                    assert uncle is not None
                    uncle.color = BLACK
                    grand.color = RED
                    node = grand
                else:
                    if node is parent.left:
                        node = parent
                        self._rotate_right(node)
                        parent = node.parent
                        assert parent is not None
                        grand = parent.parent
                        assert grand is not None
                    parent.color = BLACK
                    grand.color = RED
                    self._rotate_left(grand)
        assert self.root is not None
        self.root.color = BLACK
```

The code uses null children as black rather than allocating sentinels.

That reduces setup but increases boundary branches in deletion.

For a complete mutable map, use a well-tested standard-library tree or implement and test deletion separately.

Validators should check ordering, parent pointers, red-parent rules, and black height.

Property tests can compare map contents with a trusted ordered model.

Rotations should have focused unit tests at root and internal positions.

## 5. Asymptotic Time & Space Complexity

The red-black height bound is:

$$
h\le2\log_2(n+1).
$$

Search follows one root-to-leaf path and takes $O(\log n)$ time.

Insertion search takes $O(\log n)$ time.

Insertion repair recolors along at most one root path.

It performs at most a constant number of rotations.

Total insertion time is $O(\log n)$.

Deletion search and successor selection take $O(\log n)$.

Deletion repair moves the deficit upward at most `h` levels.

Total deletion time is $O(\log n)$.

Minimum and maximum take $O(\log n)$ worst-case time.

Successor and predecessor take $O(\log n)$ worst-case time.

Ordered iteration visits every node in $O(n)$ time.

An explicit iterator stack uses $O(h)=O(\log n)$ space.

The tree stores one node per key and uses $O(n)$ space.

Each node stores key, value, color, children, and often parent.

Color may fit into pointer tagging in low-level implementations.

Node allocation and poor locality add practical overhead.

A sorted contiguous array has faster iteration but linear insertion.

A B-tree stores more keys per node and better matches cache lines or pages.

AVL trees enforce a tighter height bound and can improve lookup constants.

Red-black trees often perform fewer structural changes under updates.

These are workload-dependent engineering trade-offs.

## 6. Systems Connections

Ordered map and set containers frequently use red-black trees.

Linux uses red-black trees in several scheduling and virtual-memory indexes.

Event schedulers order timers by expiration key.

Memory managers index address ranges for lookup and update.

Language runtimes use ordered trees where deterministic iteration matters.

Databases generally prefer B-trees because nodes align with storage pages.

In-memory secondary indexes may still use balanced binary trees.

Interval trees augment balanced nodes with subtree maximum endpoints.

Order-statistic trees augment nodes with subtree sizes.

Augmented fields must be updated during every rotation.

The rotation touches only local topology, enabling local aggregate repair.

Concurrent ordered maps require synchronization beyond balancing correctness.

Readers cannot safely traverse pointers during unsynchronized rotations.

Persistent balanced trees path-copy nodes instead of mutating shared structure.

That supports snapshots at additional allocation cost.

Intrusive trees store linkage fields inside application objects.

Ownership and object lifetime then become caller responsibilities.

Serialization should record keys and values, not raw color topology unless exact shape matters.

Rebuilding by insertion can produce another valid shape with the same contents.

Security-sensitive maps avoid comparator inconsistency and mutable keys.

A key changing while stored can violate search ordering silently.

## 7. Practice Checklist

- Preserve BST ordering independently from colors.
- Treat null or sentinel leaves as black.
- Keep the root black after public operations.
- Prohibit red nodes with red children.
- Keep equal black height on every path.
- Define black-height counting consistently.
- Update parent pointers during rotations.
- Update the root pointer during root rotations.
- Preserve middle subtrees during rotations.
- Insert new leaves as red.
- Distinguish red-uncle recoloring from black-uncle rotation.
- Convert triangle cases into line cases first.
- Mirror left and right repair cases carefully.
- Model black deletion as a path deficit.
- Implement every deletion sibling/nephew case.
- Do not ship insertion-only code as a complete mutable map.
- Define duplicate-key behavior.
- Keep keys immutable while stored.
- Require comparator transitivity.
- Test ascending and descending insertion.
- Test zigzag insertion patterns.
- Test repeated replacement of an existing key.
- Test root rotations.
- Test deletion of red and black leaves.
- Test deletion with zero, one, and two ordinary children.
- Validate in-order output against sorted keys.
- Validate every parent pointer.
- Compute black heights recursively in tests.
- Assert no red-red edge.
- Compare randomized operations against a trusted map.
- Update augmented metadata during rotations.
- Synchronize readers and writers explicitly.

## 8. Frequently Asked Questions

### Why are the nodes colored?

Color rules constrain path lengths while allowing local update repair.

The color is structural metadata.

### Is a red-black tree perfectly balanced?

No.

Its longest root-to-leaf path is bounded to at most twice the shortest black depth.

### Why insert a new node as red?

A red node does not change black height on any path.

Only a local red-parent violation may need repair.

### Are searches different from an ordinary BST?

No.

Search follows key comparisons; balance merely bounds the path length.

### Are duplicate keys supported?

Only under an explicit policy such as value replacement, counts, or consistent placement.

### How many rotations does insertion need?

At most a constant number, though recoloring can propagate toward the root.

### Why is deletion harder?

Removing a black node changes black height and can propagate a deficit upward.

### Red-black or AVL?

AVL is more tightly balanced; red-black often changes structure less during updates.

Benchmark the actual workload.

### Why do databases use B-trees instead?

B-tree nodes hold many keys and reduce cache or storage-page accesses.

### What is the core height proof?

Equal black height plus prohibition of consecutive red nodes bounds height by twice black height.
