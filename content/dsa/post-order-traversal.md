# Post-Order Traversal: Child Completion, Stack Frames & Bottom-Up Tree Computation

![Post-order tree traversal](/images/dsa/post-order-traversal-dark.png#dark)

## 1. Historical Context & Motivation

Tree traversal turns a hierarchical structure into a controlled sequence of visits.

Post-order visits every child before visiting its parent.

For a binary tree, the order is left subtree, right subtree, then node.

This is commonly abbreviated `LRN`.

The ordering is naturally bottom-up.

A parent is processed only after results from both children are available.

That property makes post-order suitable for aggregation and destruction.

Directory sizes require all descendant sizes before computing the parent total.

Expression evaluation requires operand values before applying an operator.

Tree deletion should release children before releasing their owner node.

Compiler syntax trees use post-order for many synthesis passes.

Dynamic programming on trees usually follows the same dependency direction.

The recursive algorithm mirrors the definition directly.

It recursively traverses the left child.

It recursively traverses the right child.

It then processes the current node.

The simplicity can hide an important runtime mechanism.

Every active call remembers which child should run next.

That state occupies the program's call stack.

An iterative implementation must represent the same continuation explicitly.

Merely pushing children is not sufficient because parent visits must be delayed.

Common iterative strategies use two stacks.

Another uses one stack plus a last-visited reference.

A third attaches an expanded flag to each stack entry.

All implement the same dependency graph with different state representations.

Traversal terminology assumes a rooted tree.

In a general graph, child references can lead to cycles or shared descendants.

A visited set is then required, and the result becomes depth-first finishing order.

For a proper tree, every non-root node has exactly one parent.

That uniqueness prevents duplicate visits without extra marking.

Post-order is not inherently sorted.

On a binary search tree, post-order does not yield keys in ascending order.

Its guarantee is structural dependency, not key order.

The chosen left-before-right convention is also observable.

Reversing child order produces a different valid child-before-parent traversal.

APIs and tests should specify the intended convention.

## 2. Core Mathematical Invariants

### Recursive definition

Let `post(v)` denote the post-order sequence rooted at node `v`.

For a null node:

$$
post(\varnothing)=\langle\rangle.
$$

For binary node `v` with children `l` and `r`:

$$
post(v)=post(l)\mathbin{\Vert}post(r)\mathbin{\Vert}\langle v\rangle.
$$

The operator $\Vert$ denotes sequence concatenation.

This recurrence is both specification and recursive algorithm.

### Descendant-before-ancestor invariant

For every proper descendant `u` of `v`, `u` appears before `v`.

Equivalently, each tree edge `v -> c` imposes `c` before `v`.

Post-order is a topological ordering of this reversed dependency relation.

The left subtree additionally precedes the right subtree under the chosen convention.

### Exactly-once invariant

Every reachable tree node appears exactly once.

No null reference contributes an output item.

Induction proves the property for a proper finite tree.

Each child traversal visits its disjoint subtree exactly once.

Appending the parent adds the one remaining node.

### Recursive frame invariant

When a call for node `v` reaches its processing statement:

1. every node in `v.left` has been processed;
2. every node in `v.right` has been processed;
3. `v` itself has not yet been processed.

Processing `v` completes its entire subtree.

The caller can then treat that subtree as resolved.

### One-stack invariant

In a one-stack traversal, the stack stores the path to unresolved ancestors.

The top node may be processed only if its right subtree is absent or completed.

`last_visited` identifies the root of the most recently completed subtree.

If `top.right is last_visited`, the right dependency has been satisfied.

Otherwise traversal must descend into that right subtree first.

### Expanded-entry invariant

Push `(node, false)` when the node is discovered but unresolved.

Push `(node, true)` when its children have been scheduled before it.

An expanded entry can be emitted immediately when popped.

To obtain left-right-node with a LIFO stack, push in reverse execution order:

1. `(node, true)`;
2. `(right, false)`;
3. `(left, false)`.

The left entry is then popped first.

### Aggregation invariant

Suppose each node result is:

$$
R(v)=F(v.value,R(v.left),R(v.right)).
$$

At the post-order visit of `v`, both child results already exist.

This is the essential invariant for height, size, balance, and subtree sums.

For height, define null height as zero and use:

$$
H(v)=1+\max(H(v.left),H(v.right)).
$$

### Structural assumptions

The standard algorithm assumes a finite acyclic rooted structure.

Shared child objects turn a tree into a directed acyclic graph.

Without a visited policy, a shared node is processed once per incoming path.

Cycles cause nontermination or unbounded stack growth.

The caller must either guarantee a tree or request graph semantics explicitly.

## 3. Step-by-Step Execution Trace

Consider the binary tree:

```text
        A
       / \
      B   C
     / \   \
    D   E   F
       /
      G
```

The objective is left-right-node post-order.

Start at root `A`.

The root cannot be emitted because both child subtrees are unresolved.

Descend into left child `B`.

Node `B` cannot be emitted because `D` and `E` are unresolved.

Descend into `D`.

Node `D` has no children.

Emit `D`.

Return to `B` and descend into `E`.

Node `E` has unresolved left child `G`.

Descend into `G`.

Node `G` has no children.

Emit `G`.

Return to `E`.

Its left subtree is complete and its right child is absent.

Emit `E`.

Return to `B`.

Both child subtrees of `B` are complete.

Emit `B`.

The left subtree of `A` is now complete.

Descend into right child `C`.

The left child of `C` is absent.

Its right child `F` is unresolved.

Descend into `F`.

Node `F` has no children.

Emit `F`.

Return to `C` and emit `C`.

Return to `A`.

Both root subtrees are complete.

Emit `A`.

The final sequence is:

```text
D, G, E, B, F, C, A
```

Every child precedes its parent.

Every left subtree precedes its sibling right subtree.

Every node appears once.

### Expanded-stack trace

Push `(A,false)`.

Pop unresolved `A`.

Push `(A,true)`, `(C,false)`, then `(B,false)`.

Pop unresolved `B`.

Push `(B,true)`, `(E,false)`, then `(D,false)`.

Pop unresolved `D`.

Push `(D,true)` because it has no children.

Pop expanded `D` and emit `D`.

Pop unresolved `E`.

Push `(E,true)` and `(G,false)`.

Pop unresolved `G`, then schedule `(G,true)`.

Pop expanded `G` and emit `G`.

Pop expanded `E` and emit `E`.

Pop expanded `B` and emit `B`.

The stack now exposes unresolved `C`.

Schedule `(C,true)` and `(F,false)`.

Resolve and emit `F`.

Emit expanded `C`.

Finally emit expanded `A`.

The explicit flag reproduces the return point of recursion.

## 4. Production-Ready Implementations

The following Python implementation provides recursive and iterative forms.

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


def postorder_recursive(root: Optional[Node[T]]) -> Iterator[T]:
    if root is None:
        return
    yield from postorder_recursive(root.left)
    yield from postorder_recursive(root.right)
    yield root.value


def postorder_iterative(root: Optional[Node[T]]) -> Iterator[T]:
    if root is None:
        return

    stack: list[tuple[Node[T], bool]] = [(root, False)]
    while stack:
        node, expanded = stack.pop()
        if expanded:
            yield node.value
            continue

        stack.append((node, True))
        if node.right is not None:
            stack.append((node.right, False))
        if node.left is not None:
            stack.append((node.left, False))


def subtree_sizes(root: Optional[Node[T]]) -> dict[int, int]:
    sizes: dict[int, int] = {}
    if root is None:
        return sizes

    stack: list[tuple[Node[T], bool]] = [(root, False)]
    while stack:
        node, expanded = stack.pop()
        if not expanded:
            stack.append((node, True))
            if node.right is not None:
                stack.append((node.right, False))
            if node.left is not None:
                stack.append((node.left, False))
            continue

        left_size = 0 if node.left is None else sizes[id(node.left)]
        right_size = 0 if node.right is None else sizes[id(node.right)]
        sizes[id(node)] = 1 + left_size + right_size
    return sizes


root = Node(
    "A",
    Node("B", Node("D"), Node("E", Node("G"))),
    Node("C", None, Node("F")),
)

expected = ["D", "G", "E", "B", "F", "C", "A"]
assert list(postorder_recursive(root)) == expected
assert list(postorder_iterative(root)) == expected
assert subtree_sizes(root)[id(root)] == 7
```

Generators stream results rather than allocating an output list.

The recursive generator remains limited by interpreter recursion depth.

The iterative version stores explicit frames on the heap-backed list.

The expanded flag avoids identity comparisons and duplicate output reversal.

Subtree results are keyed by node identity rather than possibly duplicated values.

A production API may place computed fields directly on nodes.

That mutation should be documented and synchronized if trees are shared.

For untrusted structures, add cycle detection before traversal.

Cycle checking needs an identity-based color map.

White means unseen, gray means active, and black means completed.

Encountering a gray child proves a directed cycle.

Encountering a black child reveals sharing rather than a strict tree.

The API must decide whether sharing is allowed and whether to recompute it.

Exceptions in a visitor can leave external aggregation state partially updated.

Prefer pure result construction or transactional updates when partial effects are unsafe.

## 5. Asymptotic Time & Space Complexity

Let `n` be the number of reachable nodes.

Every proper tree node is pushed, visited, and emitted a constant number of times.

Recursive post-order therefore takes $O(n)$ time.

Expanded-stack post-order also takes $O(n)$ time.

Let `h` be tree height measured in nodes.

The recursive call stack uses $O(h)$ auxiliary space.

The explicit stack also uses $O(h)$ frames for depth-first traversal.

The expanded variant can hold deferred siblings and markers.

Its asymptotic bound remains $O(h)$ for a binary tree under depth-first scheduling.

A balanced tree has $h=O(\log n)$.

A degenerate one-child chain has $h=O(n)$.

Materializing all output values adds $O(n)$ result space.

Streaming through an iterator avoids that result allocation.

It does not reduce traversal stack space.

Computing subtree sizes takes $O(n)$ time.

The demonstrated identity map stores one result per node and uses $O(n)$ space.

Storing each result directly in its parent frame can sometimes use $O(h)$ space.

Cycle detection with a color map takes $O(n)$ additional space.

For a graph with `m` edges, DFS finishing order takes $O(n+m)$ time.

That graph bound should not be confused with binary-tree traversal.

Repeatedly recomputing child aggregates from scratch can cause quadratic time.

Post-order dynamic programming computes each child result once.

For a complete binary tree, left and right work can sometimes run in parallel.

The work remains $O(n)$ while ideal span approaches $O(h)$.

Thread creation and aggregation overhead affect practical parallelism.

## 6. Systems Connections

Expression evaluators process operands before applying an operator.

For `(2 + 3) * 4`, post-order yields `2 3 + 4 *`.

Stack evaluation of that sequence produces the same result.

Compilers synthesize types, constants, and code from child syntax nodes.

Directory cleanup removes contents before removing their directory.

Package uninstallers should remove dependents before prerequisites when ownership requires it.

Scene graphs compute child bounds before parent bounds.

DOM layout may aggregate descendant measurements into containers.

Merkle trees hash children before hashing the parent record.

File-system usage tools sum descendants before reporting directory totals.

Decision trees can compute subtree statistics after observing leaves.

Garbage collectors use related graph traversals, though cycles require marking.

Build systems execute prerequisites before dependent targets.

That is a DAG topological problem rather than necessarily a tree walk.

Database query plans execute child operators before a blocking parent consumes completion.

Recursive descent interpreters unwind calls in a post-order-like dependency sequence.

Tree serialization formats sometimes include null markers to preserve shape.

Plain post-order values alone cannot reconstruct arbitrary binary trees with duplicate values.

Post-order plus in-order and unique keys can determine the tree.

Destructors in manual-memory trees commonly follow post-order.

Releasing a parent first would discard the only references to its children.

Distributed aggregation forms a reduction tree with the same child-before-parent rule.

Failures and retries add semantics absent from an in-memory traversal.

## 7. Practice Checklist

- State the child order explicitly.
- Use left-right-node for conventional binary post-order.
- Define behavior for a null root.
- Confirm every child is processed before its parent.
- Confirm every node is emitted exactly once.
- Distinguish tree input from general graph input.
- Add identity-based visitation when cycles or sharing are possible.
- Choose recursion only when maximum height is safe.
- Use an explicit stack for adversarial depth.
- Push stack entries in reverse execution order.
- Preserve a continuation state for delayed parent visits.
- Test empty and one-node trees.
- Test left-only and right-only chains.
- Test balanced and highly skewed trees.
- Test nodes with duplicate values.
- Compare node identity rather than value for structural state.
- Verify the complete expected sequence in tests.
- Check aggregation base cases for null children.
- Compute each subtree result once.
- Avoid materializing output when streaming is sufficient.
- Document whether visitors may mutate the tree.
- Define iterator behavior under concurrent mutation.
- Handle visitor exceptions without corrupting external state.
- Use post-order for child-owned resource destruction.
- Do not claim post-order sorts a search tree.
- Distinguish traversal auxiliary space from output storage.
- Include height `h` in the space analysis.
- Validate recursive depth against runtime limits.
- Use color states for directed-cycle detection.
- Define semantics for shared subtrees in a DAG.
- Verify left and right results exist before parent aggregation.
- Test subtree formulas against hand-computed examples.

## 8. Frequently Asked Questions

### What is the post-order sequence for a binary tree?

Visit the left subtree, then the right subtree, then the node.

### Why is post-order useful for deletion?

Children are released before the parent that owns their references.

### Is recursive post-order always safe?

No.

A very deep tree can exceed the language runtime's call-stack limit.

### Why does an iterative algorithm need extra state?

The parent must be delayed until both child traversals complete.

The call stack stores that continuation implicitly in recursion.

### Can post-order evaluate an expression tree?

Yes.

Operand results exist before their operator node is evaluated.

### Does post-order of a BST produce sorted keys?

No.

In-order traversal provides ascending order for a valid BST.

### Can values alone reconstruct a tree from post-order?

Not generally.

Additional shape information or another traversal is required.

### What is the space complexity?

Traversal state uses $O(h)$ space, where `h` is tree height.

Stored output adds $O(n)$ if results are materialized.

### How is graph finishing order related?

DFS records a vertex after exploring outgoing neighbors, which is post-order semantics.

A visited-state policy is required because graphs can cycle or share paths.

### What invariant matters most?

A node becomes eligible exactly after every required child subtree is complete.
