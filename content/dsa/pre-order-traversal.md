# Pre-Order Traversal: Parent-First Discovery, Explicit Stacks & Hierarchical Serialization

![Pre-order tree traversal](/images/dsa/pre-order-traversal-dark.png#dark)

## 1. Historical Context & Motivation

Pre-order traversal visits a node before traversing its children.

For a binary tree, the conventional order is node, left subtree, right subtree.

The abbreviation is `NLR`.

Parent-first order matches discovery and hierarchical presentation.

A directory can be printed before its indented contents.

A scene node can establish inherited state before drawing descendants.

A parser can serialize an operator before its operands in prefix notation.

Access-control rules can flow from a parent scope into child scopes.

The root is always the first emitted node for a nonempty tree.

Each subtree occupies one contiguous interval of the traversal sequence.

That interval property supports indexing and serialization schemes.

Pre-order is a depth-first traversal.

It differs from breadth-first traversal, which processes nodes by depth.

It also differs from in-order and post-order in when the parent is emitted.

The recursive definition is concise.

Process the current node.

Traverse the left child recursively.

Traverse the right child recursively.

The implementation inherits depth limits from the call stack.

An explicit stack provides the same order without recursive calls.

Because a stack is last-in, first-out, child push order matters.

Push the right child before the left child.

The left child then becomes the next item popped.

Pushing left first silently produces node-right-left order.

This is one of the most frequent iterative traversal mistakes.

Pre-order alone does not generally preserve full binary-tree shape.

Different trees can produce the same value sequence.

Including null-child markers makes the representation unambiguous.

Unique values plus a compatible in-order sequence can also reconstruct shape.

For a binary search tree with distinct keys, pre-order and bound constraints suffice.

Those reconstruction claims depend on their exact assumptions.

As with post-order, a general graph needs visitation state.

Without it, cycles can make traversal nonterminating.

Shared descendants can be emitted multiple times through distinct paths.

The tree contract should be explicit before choosing the simple algorithm.

## 2. Core Mathematical Invariants

### Recursive definition

For a null reference:

$$
pre(\varnothing)=\langle\rangle.
$$

For node `v` with left child `l` and right child `r`:

$$
pre(v)=\langle v\rangle\mathbin{\Vert}pre(l)\mathbin{\Vert}pre(r).
$$

The parent contributes the first item in its subtree sequence.

The left subtree sequence precedes the right subtree sequence.

### Ancestor-before-descendant invariant

Every ancestor appears before each of its proper descendants.

For every tree edge `v -> c`, node `v` precedes node `c`.

This makes parent state available when a child is discovered.

It does not require all nodes at one depth to be processed together.

### Contiguous-subtree invariant

All nodes in a subtree rooted at `v` occupy a contiguous pre-order interval.

The interval starts at the position of `v`.

Its length equals the subtree size of `v`.

If `tin[v]` is the discovery index and `size[v]` is subtree size, then:

$$
subtree(v)=[tin[v],tin[v]+size[v]).
$$

This flattening supports subtree range operations.

### Exactly-once invariant

For a proper finite tree, every reachable node is emitted once.

The root is emitted by the current call.

The disjoint left and right subtrees are each traversed exactly once.

Null references emit nothing.

Structural induction proves the full result.

### Recursive frame invariant

On entry to the call for `v`, no node in `v`'s subtree has been emitted by that call.

The call emits `v` immediately.

Before entering the right child, the entire left subtree is complete.

On return, the entire subtree of `v` is complete.

### Explicit-stack invariant

The stack contains roots of discovered but unprocessed subtrees.

The top entry is the next node in pre-order.

When node `v` is popped, emit it before adding its children.

Push `v.right` first and `v.left` second.

That preserves left-before-right execution under LIFO behavior.

### Depth invariant

If the stack stores `(node, depth)`, root depth is zero.

Every child of a node at depth `d` receives depth `d+1`.

At emission, the stored depth equals the number of parent edges to the root.

This supports indentation and depth-indexed processing.

### Serialization invariant

Emit each node value followed by serialized left and right subtrees.

Emit a distinguished null marker for every missing child.

The resulting token stream has an unambiguous recursive parse.

For `n` binary nodes, it contains `n` value tokens and `n+1` null markers.

The marker must not collide with valid encoded values.

### BST bound invariant

For a BST with distinct keys, each subtree has an allowed interval `(low, high)`.

The next pre-order key belongs to the subtree only if it lies inside that interval.

The left subtree tightens the upper bound to the parent key.

The right subtree tightens the lower bound to the parent key.

Duplicate-key policies must be specified before using inclusive bounds.

## 3. Step-by-Step Execution Trace

Use the binary tree:

```text
        A
       / \
      B   C
     / \   \
    D   E   F
       /
      G
```

Initialize an explicit stack with root `A`.

The stack is `[A]` with its top on the right.

Pop `A` and emit it.

Push right child `C`.

Push left child `B`.

The stack is `[C, B]`.

Pop `B` and emit it.

Push right child `E`.

Push left child `D`.

The stack is `[C, E, D]`.

Pop `D` and emit it.

Node `D` has no children.

The stack remains `[C, E]`.

Pop `E` and emit it.

Node `E` has no right child.

Push its left child `G`.

The stack is `[C, G]`.

Pop `G` and emit it.

Node `G` has no children.

Pop `C` and emit it.

Push right child `F`.

There is no left child to push.

Pop `F` and emit it.

The stack is empty, so traversal ends.

The final sequence is:

```text
A, B, D, E, G, C, F
```

Every parent appears before its children.

The complete `B` subtree forms contiguous interval `[1,5)`.

The complete `C` subtree forms contiguous interval `[5,7)`.

### Discovery indices

Assign each emitted node its zero-based position.

Node `A` receives `tin = 0`.

Node `B` receives `tin = 1`.

Node `D` receives `tin = 2`.

Node `E` receives `tin = 3`.

Node `G` receives `tin = 4`.

Node `C` receives `tin = 5`.

Node `F` receives `tin = 6`.

Subtree sizes are `size[B] = 4` and `size[C] = 2`.

Therefore `B` maps to `[1,5)` and `C` maps to `[5,7)`.

The root maps to `[0,7)`.

### Serialization trace

Use `#` as the null marker.

Emit `A`, then serialize its left subtree.

Emit `B`, `D`, then `#`, `#` for `D`'s children.

Emit `E`, then `G`, `#`, `#`, followed by `#` for `E.right`.

Serialize the root's right subtree as `C`, `#`, `F`, `#`, `#`.

The complete stream is:

```text
A B D # # E G # # # C # F # #
```

A recursive decoder consumes exactly one subtree at a time.

Null markers prevent ambiguity about absent left versus right children.

## 4. Production-Ready Implementations

The implementation below includes iteration and shape-preserving serialization.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, Optional, TypeVar

T = TypeVar("T")


@dataclass(slots=True)
class Node(Generic[T]):
    value: T
    left: Optional[Node[T]] = None
    right: Optional[Node[T]] = None


def preorder(root: Optional[Node[T]]) -> Iterator[T]:
    if root is None:
        return
    stack = [root]
    while stack:
        node = stack.pop()
        yield node.value
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)


def preorder_with_depth(root: Optional[Node[T]]) -> Iterator[tuple[T, int]]:
    if root is None:
        return
    stack = [(root, 0)]
    while stack:
        node, depth = stack.pop()
        yield node.value, depth
        if node.right is not None:
            stack.append((node.right, depth + 1))
        if node.left is not None:
            stack.append((node.left, depth + 1))


def serialize(root: Optional[Node[str]]) -> list[str]:
    tokens: list[str] = []

    def visit(node: Optional[Node[str]]) -> None:
        if node is None:
            tokens.append("#")
            return
        if node.value == "#":
            raise ValueError("node value collides with null marker")
        tokens.append(node.value)
        visit(node.left)
        visit(node.right)

    visit(root)
    return tokens


def deserialize(tokens: list[str]) -> Optional[Node[str]]:
    position = 0

    def parse() -> Optional[Node[str]]:
        nonlocal position
        if position >= len(tokens):
            raise ValueError("truncated pre-order stream")
        token = tokens[position]
        position += 1
        if token == "#":
            return None
        node = Node(token)
        node.left = parse()
        node.right = parse()
        return node

    root = parse()
    if position != len(tokens):
        raise ValueError("extra tokens after complete tree")
    return root


root = Node(
    "A",
    Node("B", Node("D"), Node("E", Node("G"))),
    Node("C", None, Node("F")),
)
expected = ["A", "B", "D", "E", "G", "C", "F"]
assert list(preorder(root)) == expected
encoded = serialize(root)
decoded = deserialize(encoded)
assert list(preorder(decoded)) == expected
assert serialize(decoded) == encoded
```

The iterative traversal does not modify the tree.

It streams values and uses memory proportional to pending subtrees.

The serializer uses recursion for clarity and exact shape encoding.

Use an explicit frame stack when untrusted height can exceed recursion limits.

The decoder rejects truncated and overlong streams.

It also separates parsing position from node values.

Real formats should use length-prefixing or escaping rather than a reserved string.

For binary payloads, encode a tag before each optional node.

Do not deserialize untrusted trees without node and depth limits.

An attacker can otherwise force excessive memory or recursion.

General graph serialization requires object identifiers to preserve sharing and cycles.

Duplicating a shared child changes the structure's semantics.

### Visitor design

A visitor may stop early by returning a control result.

Early termination should leave the tree unchanged.

Mutation during traversal can invalidate pending child references.

Either prohibit mutation or define snapshot semantics.

Concurrent trees need synchronization or immutable snapshots.

## 5. Asymptotic Time & Space Complexity

Let `n` be the number of reachable nodes.

Pre-order visits each node once, giving $O(n)$ time.

Each edge is followed once in a proper tree.

Let `h` be the tree height.

Recursive traversal uses $O(h)$ call-stack space.

The explicit stack uses $O(h)$ pending-node space for depth-first traversal.

For a balanced binary tree, height is $O(\log n)$.

For a one-child chain, height is $O(n)$.

Materializing the emitted sequence adds $O(n)$ output space.

A generator avoids storing that sequence.

Serialization emits `2n+1` tokens for a binary tree with null markers.

Its time and output size are both $O(n)$.

Deserialization consumes each token once and takes $O(n)$ time.

The reconstructed nodes occupy $O(n)$ space.

Depth tracking adds constant metadata per stack entry.

Computing subtree intervals also requires subtree sizes.

If sizes are precomputed, each interval lookup is $O(1)$.

Computing all sizes by post-order takes $O(n)$ time.

A malformed cyclic input breaks the tree bound without visited detection.

Graph DFS instead takes $O(V+E)$ time and $O(V)$ visitation space.

Pre-order on a BST does not accelerate arbitrary key search by itself.

Search still follows comparisons and takes $O(h)$.

Reconstructing a distinct-key BST from pre-order can take $O(n)$ with bounds.

Naively searching partition points at every subtree can degrade to $O(n^2)$.

These reconstruction costs are separate from traversal.

## 6. Systems Connections

Prefix expression notation places operators before operands.

Pre-order converts an expression tree directly into prefix form.

Outline renderers print a heading before nested sections.

File browsers display a directory before recursively listing contents.

Scene graphs apply parent transforms before child-local transforms.

UI trees propagate inherited themes and layout constraints downward.

Access-control systems can combine parent policy before entering descendants.

Compiler symbol-table scopes are established before child declarations are analyzed.

Trie enumeration visits a prefix before its longer completions.

Routing tables can apply prefix policy while descending a hierarchy.

Pre-order discovery numbers support Euler-tour flattening techniques.

Subtree updates become range updates when subtree nodes are contiguous.

Version-control tree objects encode directory-like hierarchy.

Serialization must preserve object type, child order, and missing children.

DOM event propagation has a capture phase that travels ancestor to descendant.

It resembles pre-order but follows platform-specific event rules.

Game engines update hierarchical state parent-first when children inherit transforms.

Network multicast can disseminate state from a root toward descendants.

Distributed traversal must account for latency, failures, and duplicate delivery.

Recursive interpreters often execute a statement node before entering nested bodies.

Memory profilers can report an owner before objects it dominates.

The parent-first pattern is useful whenever context must exist before dependent work.

## 7. Practice Checklist

- State the order as node-left-right.
- Define output for a null root.
- Emit the node before scheduling child work.
- Push right before left on a LIFO stack.
- Confirm every ancestor precedes descendants.
- Confirm each subtree occupies one contiguous interval.
- Visit every proper tree node exactly once.
- Distinguish a tree from a graph with cycles or sharing.
- Add identity-based visited state for graph semantics.
- Choose recursion only when height is bounded safely.
- Use explicit stacks for adversarial depth.
- Test empty and singleton trees.
- Test left-only and right-only chains.
- Test balanced trees and duplicate values.
- Assert the complete order, not merely the visited set.
- Track depth from zero or document another convention.
- Push children with depth plus one.
- Include null markers when serializing arbitrary shape.
- Escape or length-prefix values that can collide with markers.
- Reject truncated serialized input.
- Reject extra serialized input.
- Bound deserialization depth and node count for untrusted data.
- Define mutation behavior during traversal.
- Prefer immutable snapshots for concurrent readers.
- Do not claim pre-order alone reconstructs every binary tree.
- State uniqueness and BST assumptions for bound reconstruction.
- Precompute subtree sizes before using flattened ranges.
- Keep traversal space analysis in terms of height.
- Separate output storage from auxiliary stack storage.
- Use generators when consumers can process values incrementally.
- Verify parent-derived state before entering each child.
- Document whether left-right order is semantically significant.

## 8. Frequently Asked Questions

### What is pre-order traversal?

Visit the current node, then its left subtree, then its right subtree.

### Why push the right child first?

A stack pops the most recently pushed item.

Pushing right first leaves the left child on top.

### What appears first in a nonempty traversal?

The root always appears first.

### Is pre-order breadth-first?

No.

It follows one subtree deeply before moving to a sibling subtree.

### Can pre-order serialize a binary tree?

Yes, if shape information such as null-child markers is included.

Values alone are generally ambiguous.

### Does pre-order sort a binary search tree?

No.

In-order traversal yields ascending keys under the normal BST invariant.

### What is the space complexity?

Traversal state is $O(h)$, where `h` is height.

Materialized output adds $O(n)$.

### Why are subtree nodes contiguous?

Traversal completely finishes a node's subtree before moving to its next sibling.

### Can pre-order traverse a graph?

Depth-first discovery order is pre-order-like, but a visited set is necessary.

Neighbor ordering determines the exact sequence.

### What is the central invariant?

Emit each node before any descendant while preserving the chosen child order.
