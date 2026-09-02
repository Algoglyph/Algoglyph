# Binary Trees: Structural Recursion, Traversal Orders & Representation Contracts

![Binary Trees: Structural Recursion, Traversal Orders & Representation Contracts](/images/dsa/binary-tree-dark.jpg#dark)

## 1. Historical Context & Motivation

A binary tree is a hierarchical structure in which each node has at most two child positions, conventionally named left and right.

That definition describes shape, not key order.

Expression trees, decision trees, syntax trees, tournament trees, Huffman trees, binary heaps, and binary search trees are all binary trees with different additional invariants.

Confusing those invariants causes incorrect algorithms.

Searching an arbitrary binary tree cannot discard the left or right subtree based on one key comparison.

A binary-search tree can, because it adds an ordering contract.

A heap adds a parent-priority contract but does not make in-order output sorted.

An expression tree assigns meaning by operand position rather than numeric ordering.

Binary trees became central to programming because recursive structure matches recursive definitions naturally.

A tree is either empty or consists of one root and two smaller binary trees.

Many algorithms follow that decomposition:

- compute a property of the left subtree;
- compute it for the right subtree;
- combine both results with the root.

Traversal order changes when the root's action occurs relative to its subtrees.

Pre-order visits root before children.

In-order visits root between children.

Post-order visits root after children.

Breadth-first traversal organizes nodes by depth instead of recursive subtree completion.

Representation is part of correctness.

Pointer nodes express irregular shape directly but add allocation and pointer overhead.

Array indices are compact for complete trees but can waste space for sparse shapes.

Serialized level-order data needs explicit null markers to distinguish shapes that share the same non-null value sequence.

Mutable tree ownership also needs a contract.

In a conventional owned tree, one child node cannot belong to two parents and no pointer can lead back to an ancestor.

Without those rules, the object is a directed graph, and naive recursive traversal may repeat work or never terminate.

The core mental model is:

**a binary tree supplies two ordered child positions; every useful algorithm must state the additional semantic and ownership invariants it relies on.**

## 2. Core Mathematical Invariants

### Recursive structure

Let $T$ be a binary tree.

Either:

$$
T=\varnothing
$$

or:

$$
T=(value,T_L,T_R).
$$

Left and right positions are distinct even when values are equal.

Swapping them can change expression evaluation, traversal output, or decision semantics.

### Node count

Define size:

$$
size(\varnothing)=0
$$

and:

$$
size(T)=1+size(T_L)+size(T_R).
$$

Every valid owned node contributes exactly once.

If a node is shared, the recurrence counts paths rather than unique objects unless ownership is checked.

### Height

Use empty height zero and leaf height one:

$$
height(\varnothing)=0,
$$

$$
height(T)=1+\max(height(T_L),height(T_R)).
$$

Some texts count edges and assign empty height `-1` and leaf height zero.

Both conventions are valid.

Mixing them inside one implementation creates off-by-one defects.

### Depth

Root depth is zero.

A child's depth is its parent's depth plus one.

Under the node-count height convention, maximum depth is `height - 1` for a nonempty tree.

Depth belongs to a node relative to a root.

Height belongs to a subtree measured downward.

### Edge count

A nonempty owned tree with $n$ nodes has exactly:

$$
n-1
$$

parent-child edges.

Every non-root node has exactly one incoming parent edge.

This fact fails for shared children and helps distinguish a tree from a more general graph.

### Capacity by level

At depth $d$, a binary tree has at most:

$$
2^d
$$

nodes.

A tree of height $h$ has at most:

$$
1+2+\cdots+2^{h-1}=2^h-1
$$

nodes.

Therefore any $n$-node binary tree has height at least:

$$
\lceil\log_2(n+1)\rceil.
$$

The maximum possible height is $n$ under the node-count convention.

### Full, perfect, complete, and balanced

These terms are not synonyms.

A **full** binary tree gives each node either zero or two children.

A **perfect** binary tree fills every level completely.

A **complete** binary tree fills every level except possibly the last, whose nodes occupy leftmost positions.

A **height-balanced** tree constrains child-subtree height differences according to a chosen rule.

A tree can be full without being complete.

A complete tree need not be perfect.

### Traversal invariants

Pre-order emits:

$$
root,\;preorder(T_L),\;preorder(T_R).
$$

In-order emits:

$$
inorder(T_L),\;root,\;inorder(T_R).
$$

Post-order emits:

$$
postorder(T_L),\;postorder(T_R),\;root.
$$

Level-order emits nondecreasing depth using a FIFO queue.

All visit each node once in a valid owned tree.

Only an additional ordering invariant can make in-order values sorted.

### Serialization uniqueness

Values alone do not always determine shape.

These trees contain the same pre-order non-null values:

```text
  A        A
 /          \
B            B
```

Null markers distinguish them:

```text
A, B, null, null, null
A, null, B, null, null
```

A serialization format must encode missing child positions or use another shape-preserving scheme.

### Object-graph validity

For a mutable owned binary tree:

- root has no parent within the structure;
- each other node is reached from exactly one parent slot;
- no identity is visited twice;
- no pointer cycle exists;
- node count respects configured limits;
- traversal depth respects configured limits for untrusted input.

Value equality is not identity equality.

Two distinct nodes may legitimately store the same value.

## 3. Step-by-Step Execution Trace

### Example tree

Use this expression-shaped tree:

```text
          A
        /   \
       B     C
      / \     \
     D   E     F
        /     / \
       G     H   I
```

It has nine nodes and eight edges.

Its height is four under the leaf-height-one convention.

### Pre-order trace

Pre-order uses `root, left, right`.

Visit `A` first.

Descend to `B` and visit it.

Visit `D`; both of its children are empty.

Return to `B`, then visit `E`.

Visit `G` as `E`'s left child.

Return through `E` and `B`.

Visit `C`, then its right child `F`.

Visit `H`, then `I`.

Output:

```text
A, B, D, E, G, C, F, H, I
```

Pre-order is useful for copying structure or emitting an operator before its operands.

### In-order trace

In-order uses `left, root, right`.

For subtree `B`, visit `D`, then `B`.

For `E`, visit `G`, then `E`.

The complete left subtree emits:

```text
D, B, G, E
```

Then emit root `A`.

Subtree `C` has no left child, so emit `C`, then process `F` as `H, F, I`.

Output:

```text
D, B, G, E, A, C, H, F, I
```

The sequence is not alphabetically sorted.

No BST ordering was claimed.

### Post-order trace

Post-order uses `left, right, root`.

Subtree `B` emits `D`, then `G, E`, then `B`.

Subtree `F` emits `H, I, F`.

Subtree `C` emits `H, I, F, C` because it has no left child.

Emit root `A` last.

Output:

```text
D, G, E, B, H, I, F, C, A
```

Post-order is useful when children must be processed or released before a parent.

### Level-order trace

Initialize queue with `A` at depth zero.

Remove `A`; enqueue `B` and `C` at depth one.

Remove `B`; enqueue `D` and `E` at depth two.

Remove `C`; enqueue only `F` at depth two.

Queue now contains `D,E,F`, all in the same layer.

Removing them enqueues `G,H,I` at depth three.

Output by layers:

```text
depth 0: A
depth 1: B, C
depth 2: D, E, F
depth 3: G, H, I
```

Flat level-order output is:

```text
A, B, C, D, E, F, G, H, I
```

### Height trace

Leaves `D,G,H,I` return height one.

Node `E` combines left height one and right height zero, returning two.

Node `F` combines two leaf heights and returns two.

Node `B` combines heights one and two, returning three.

Node `C` combines zero and two, returning three.

Root `A` returns:

$$
1+\max(3,3)=4.
$$

### Serialization trace

Use pre-order with `#` for an empty child.

The prefix begins:

```text
A B D # # E G # # # C # F H # # I # #
```

Each non-null token creates one node.

Each `#` consumes one expected child slot without creating a node.

Deserialization reconstructs left before right, matching the encoding.

At completion no unused tokens or unfilled child slots may remain.

## 4. Production-Ready Implementations

The implementation below provides safe owned nodes, iterative traversals, structural statistics, and a pre-order codec with explicit null markers.

Traversal methods reject cycles or shared children instead of looping or duplicating nodes.

```python
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Generic, Iterator, Optional, TypeVar

T = TypeVar("T")


@dataclass(slots=True)
class BinaryNode(Generic[T]):
    value: T
    left: Optional["BinaryNode[T]"] = None
    right: Optional["BinaryNode[T]"] = None


def _claim(node: BinaryNode[T], seen: set[int]) -> None:
    identity = id(node)
    if identity in seen:
        raise ValueError("cycle or shared child detected")
    seen.add(identity)


def preorder(root: Optional[BinaryNode[T]]) -> Iterator[T]:
    if root is None:
        return
    stack = [root]
    seen: set[int] = set()
    while stack:
        node = stack.pop()
        _claim(node, seen)
        yield node.value
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)


def inorder(root: Optional[BinaryNode[T]]) -> Iterator[T]:
    stack: list[BinaryNode[T]] = []
    current = root
    seen: set[int] = set()
    while current is not None or stack:
        while current is not None:
            _claim(current, seen)
            stack.append(current)
            current = current.left
        current = stack.pop()
        yield current.value
        current = current.right


def postorder(root: Optional[BinaryNode[T]]) -> Iterator[T]:
    if root is None:
        return
    stack: list[tuple[BinaryNode[T], bool]] = [(root, False)]
    seen: set[int] = set()
    while stack:
        node, expanded = stack.pop()
        if expanded:
            yield node.value
            continue
        _claim(node, seen)
        stack.append((node, True))
        if node.right is not None:
            stack.append((node.right, False))
        if node.left is not None:
            stack.append((node.left, False))


def levels(root: Optional[BinaryNode[T]]) -> list[list[T]]:
    if root is None:
        return []
    queue = deque([(root, 0)])
    seen: set[int] = set()
    result: list[list[T]] = []
    while queue:
        node, depth = queue.popleft()
        _claim(node, seen)
        if depth == len(result):
            result.append([])
        result[depth].append(node.value)
        if node.left is not None:
            queue.append((node.left, depth + 1))
        if node.right is not None:
            queue.append((node.right, depth + 1))
    return result


@dataclass(frozen=True, slots=True)
class TreeStats:
    nodes: int
    height: int
    leaves: int
    full: bool
    perfect: bool
    complete: bool


def tree_stats(root: Optional[BinaryNode[T]]) -> TreeStats:
    if root is None:
        return TreeStats(0, 0, 0, True, True, True)
    queue = deque([(root, 0, 1)])
    seen: set[int] = set()
    count = 0
    leaves = 0
    height = 0
    full = True
    complete = True
    saw_gap = False
    while queue:
        node, depth, position = queue.popleft()
        _claim(node, seen)
        count += 1
        height = max(height, depth + 1)
        children = (node.left is not None) + (node.right is not None)
        if children == 0:
            leaves += 1
        if children == 1:
            full = False
        for child in (node.left, node.right):
            if child is None:
                saw_gap = True
            else:
                if saw_gap:
                    complete = False
                child_position = position * 2 if child is node.left else position * 2 + 1
                queue.append((child, depth + 1, child_position))
    perfect = count == (1 << height) - 1
    return TreeStats(count, height, leaves, full, perfect, complete)
```

The `position` field is retained as useful diagnostic context for extensions, while completeness is checked from the level-order null-gap rule.

### Codec for string values

Length-prefixing avoids ambiguity when values contain spaces, delimiters, or the null marker.

The parser enforces token, node, and depth limits before allocating unbounded structure.

```python
def serialize_strings(root: Optional[BinaryNode[str]]) -> str:
    tokens: list[str] = []
    stack: list[Optional[BinaryNode[str]]] = [root]
    seen: set[int] = set()
    while stack:
        node = stack.pop()
        if node is None:
            tokens.append("#")
            continue
        _claim(node, seen)
        encoded = node.value.encode("utf-8")
        tokens.append(f"{len(encoded)}:{encoded.hex()}")
        stack.append(node.right)
        stack.append(node.left)
    return " ".join(tokens)


def deserialize_strings(
    payload: str,
    *,
    max_nodes: int = 100_000,
    max_depth: int = 10_000,
) -> Optional[BinaryNode[str]]:
    if max_nodes < 0 or max_depth < 0:
        raise ValueError("limits must be nonnegative")
    tokens = payload.split()
    if not tokens:
        raise ValueError("payload is empty")
    index = 0
    nodes = 0

    def parse(depth: int) -> Optional[BinaryNode[str]]:
        nonlocal index, nodes
        if depth > max_depth:
            raise ValueError("tree exceeds depth limit")
        if index >= len(tokens):
            raise ValueError("payload ended before tree was complete")
        token = tokens[index]
        index += 1
        if token == "#":
            return None
        if ":" not in token:
            raise ValueError("node token lacks a length prefix")
        length_text, hex_text = token.split(":", 1)
        if not length_text.isdigit():
            raise ValueError("invalid byte length")
        try:
            raw = bytes.fromhex(hex_text)
        except ValueError as error:
            raise ValueError("invalid hexadecimal value") from error
        if len(raw) != int(length_text):
            raise ValueError("value byte length does not match prefix")
        try:
            value = raw.decode("utf-8")
        except UnicodeDecodeError as error:
            raise ValueError("value is not valid UTF-8") from error
        nodes += 1
        if nodes > max_nodes:
            raise ValueError("tree exceeds node limit")
        node = BinaryNode(value)
        node.left = parse(depth + 1)
        node.right = parse(depth + 1)
        return node

    root = parse(0)
    if index != len(tokens):
        raise ValueError("payload contains trailing tokens")
    return root
```

### Verify the trace and round trip

```python
root = BinaryNode(
    "A",
    left=BinaryNode(
        "B",
        left=BinaryNode("D"),
        right=BinaryNode("E", left=BinaryNode("G")),
    ),
    right=BinaryNode(
        "C",
        right=BinaryNode("F", left=BinaryNode("H"), right=BinaryNode("I")),
    ),
)

assert list(preorder(root)) == list("ABDEGCFHI")
assert list(inorder(root)) == list("DBGEACHFI")
assert list(postorder(root)) == list("DGEBHIFCA")
assert levels(root) == [["A"], ["B", "C"], ["D", "E", "F"], ["G", "H", "I"]]
assert tree_stats(root) == TreeStats(9, 4, 4, False, False, False)

encoded = serialize_strings(root)
decoded = deserialize_strings(encoded)
assert serialize_strings(decoded) == encoded
assert list(preorder(decoded)) == list(preorder(root))
assert list(inorder(decoded)) == list(inorder(root))
```

### Verify structural categories and malformed graphs

```python
perfect = BinaryNode(
    "r",
    BinaryNode("l", BinaryNode("ll"), BinaryNode("lr")),
    BinaryNode("q", BinaryNode("ql"), BinaryNode("qr")),
)
assert tree_stats(perfect) == TreeStats(7, 3, 4, True, True, True)

complete_not_full = BinaryNode("r", BinaryNode("l"), None)
assert tree_stats(complete_not_full) == TreeStats(2, 2, 1, False, False, True)

shared = BinaryNode("shared")
bad = BinaryNode("root", shared, shared)
try:
    list(preorder(bad))
    raise AssertionError("shared child should fail")
except ValueError:
    pass

cycle = BinaryNode("cycle")
cycle.left = cycle
try:
    tree_stats(cycle)
    raise AssertionError("cycle should fail")
except ValueError:
    pass
```

### Parser caution

The recursive decoder is bounded by `max_depth`, but Python's own recursion limit may be lower than a caller-supplied limit.

A production parser accepting very deep trees should use an explicit slot stack.

Limits must be capped by service policy rather than accepting arbitrary client-provided maxima.

## 5. Asymptotic Time & Space Complexity

Let $n$ be node count, $h$ height, and $w$ maximum level width.

### Depth-first traversals

Pre-order, in-order, and post-order each visit every node once.

Time is $\Theta(n)$.

The explicit stack holds $O(h)$ nodes or node-state pairs.

For a balanced tree, $h=O(\log n)$.

For a chain, $h=n$.

### Level-order traversal

Every node is enqueued and dequeued once, so time is $\Theta(n)$.

The queue holds at most $O(w)$ nodes.

A perfect tree's last level has about $n/2$ nodes, so worst-case queue space is $O(n)$.

### Structural statistics

The level-order stats pass visits each node and child slot once.

Time is $\Theta(n)$ and queue space is $O(w)$.

The identity set uses $O(n)$ additional space to detect malformed sharing and cycles.

### Serialization

Structural work is $\Theta(n)$ because an $n$-node binary tree has $n+1$ null child positions in its extended representation.

If encoded value bytes total $B$, serialization and parsing time are $\Theta(n+B)$.

Output storage is also $\Theta(n+B)$.

The decoder's recursive stack uses $O(h)$ space in addition to the constructed tree.

### Recursive property computation

A direct height recurrence visits every node once, giving $\Theta(n)$ time and $O(h)$ stack space.

Recomputing subtree height independently at every node can take $\Theta(n^2)$ on a chain.

Return all needed subtree summaries in one post-order pass to avoid repeated work.

### Array representation

For a complete tree, storing nodes in level order uses $\Theta(n)$ contiguous slots.

Children of zero-based index $i$ are `2i+1` and `2i+2` when present.

For a sparse tree with large conceptual positions, direct heap indexing can require space far beyond $n$.

Node objects or compact child-index arrays are safer for irregular shape.

## 6. Systems Connections

### Abstract syntax trees

Compilers represent unary and binary syntax through tree nodes, though real ASTs often have varying arity.

Post-order naturally evaluates child expressions before their parent operator.

Source order makes left and right positions semantically significant.

### Binary heaps

A heap is a complete binary tree with a priority invariant.

Completeness enables compact array storage.

Heap order does not make in-order traversal globally sorted.

Only the root is guaranteed to be an extreme according to min-heap or max-heap policy.

## 7. Practice Checklist

### Name the tree invariant

- Distinguish binary tree from binary search tree.
- Distinguish heap order from search order.
- Define whether child position matters.
- Define empty-tree, height, and ownership conventions.

### Implement traversals

- Test pre-order, in-order, post-order, and level order.
- Test an empty tree.
- Test one node.
- Test left, right, and irregular shapes.
- Confirm iterative stacks preserve recursive order.

### Validate structure

- Count reachable nodes.
- Check one incoming parent per non-root owned node.
- Reject cycles.
- Reject shared mutable children.
- Enforce node and depth limits.

### Serialize safely

- Encode missing children.
- Use an unambiguous value encoding.
- Validate declared lengths.
- Reject invalid text, truncated input, and trailing tokens.
- Bound input bytes before splitting or allocating.
- Round-trip shape and values.

### Analyze complexity

- Express DFS memory in terms of height.
- Express BFS memory in terms of width.
- Account for identity tracking and encoded value bytes.
- Avoid recomputing subtree summaries.
- Distinguish balanced and chained shapes.

## 8. Frequently Asked Questions

### What makes a tree binary?

Each node has at most two ordered child positions.

No key ordering or balance is implied.

### Is a binary search tree the same thing?

It is a specialized binary tree with a global key-order invariant.

Algorithms that use key comparisons to choose one subtree require that additional invariant.

### Is in-order traversal always sorted?

No.

It is sorted only for a valid BST under a compatible ordering and duplicate policy.

### What is the difference between depth and height?

Depth measures from the root down to a node.

Height measures from a node down to its deepest leaf.

Root depth is zero; tree height depends on the chosen node- or edge-count convention.

### Why are null markers needed in serialization?

Without them, different shapes can produce the same sequence of non-null values.

Markers preserve which child positions are absent.

### Why detect shared children?

In a mutable owned tree, a shared child has two parents and breaks single-owner update and destruction assumptions.

In immutable persistent structures sharing may be intentional, so a different validator is required.

### Can recursion overflow on a binary tree?

Yes.

An unbalanced tree can have height $n$.

Iterative traversals and explicit depth limits are safer for untrusted or highly skewed input.

### Why is BFS memory sometimes larger than DFS?

BFS stores a whole wide frontier, which can contain $\Theta(n)$ nodes.

DFS stores one path and pending siblings, bounded by height.

On a chain, the relationship reverses in constants because width is one and height is $n$.

### How do I prove a traversal visits every node once?

Use structural induction for a valid owned tree: the root is visited once, and the recursive or explicit-stack procedure visits each disjoint child subtree once.

Identity checks extend safety to malformed object graphs.
