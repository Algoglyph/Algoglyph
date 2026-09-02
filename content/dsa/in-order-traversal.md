# In-Order Traversal: Left-Node-Right Order, Explicit Stacks & Threaded Walks

![In-order traversal through a binary tree](/images/dsa/in-order-traversal-dark.png#dark)

## 1. Historical Context & Motivation

A tree stores hierarchy rather than a linear sequence.

Traversal defines the sequence in which that hierarchy becomes observable.

In-order traversal visits a binary node only after its left subtree and before its right subtree.

The rule is:

```text
left subtree -> node -> right subtree
```

That ordering is especially meaningful for binary search trees.

When every left key is smaller and every right key is larger, in-order traversal emits keys in sorted order.

The traversal itself does not sort them.

It reveals order already maintained by the tree invariant.

For an arbitrary binary tree, the output is still well-defined but need not be numerically sorted.

In-order traversal appears in expression trees, ordered indexes, binary-tree serialization tools, range queries, and tree iterators.

An infix expression can be derived by visiting a left operand, then an operator, then a right operand.

Parentheses remain necessary to preserve precedence encoded by tree shape.

The simplest implementation is recursive.

The language call stack remembers ancestors whose left subtrees are unfinished.

An iterative implementation stores those ancestors explicitly.

Morris traversal temporarily threads predecessor pointers through the tree to achieve constant auxiliary space.

Those versions emit the same logical sequence under the same tree model.

They differ in stack safety, mutation, implementation risk, and concurrency behavior.

Traversal correctness depends on structural assumptions.

A proper tree has no cycles and no shared child reached by multiple parent paths.

A cyclic pointer graph can make a naive traversal loop forever or recurse until stack exhaustion.

A directed acyclic graph with shared nodes may visit one object multiple times.

The API must say whether the input is a tree or a more general graph.

Traversal also needs a duplicate-key policy when used with a binary search tree.

Duplicates may be forbidden, counted inside nodes, or consistently placed on one side.

The in-order output follows that representation.

The central question is:

How do recursive, explicit-stack, and threaded implementations preserve the same left-node-right visitation invariant?

## 2. Core Mathematical Invariants

For a binary tree node $x$, let $L(x)$ be its left subtree and $R(x)$ its right subtree.

Define the in-order sequence recursively:

$$
I(x)=I(L(x))\ \Vert\ [x]\ \Vert\ I(R(x)),
$$

where $\Vert$ denotes sequence concatenation.

For an empty subtree:

$$
I(\varnothing)=[] .
$$

This recurrence is both the specification and the recursive algorithm.

### Recursive frame invariant

When a call for node $x$ emits `x`, every node in $L(x)$ has already been emitted.

No node in $R(x)$ has yet been emitted by that frame.

After the right recursive call returns, the entire subtree rooted at $x$ has been emitted exactly once.

Structural induction proves correctness.

The empty tree produces the empty sequence.

Assume both child traversals satisfy their specifications.

Concatenating left result, root, and right result gives $I(x)$.

### Explicit-stack invariant

The stack contains a path of ancestors whose left traversal is complete or in progress but whose node visitation is pending.

Before popping a node, the algorithm has followed left pointers as far as possible.

Thus no unvisited node remains in the popped node's left subtree.

After emitting the node, traversal continues at its right child.

The next descent again pushes the entire left spine.

### Exactly-once invariant

Each node is pushed once in the standard iterative traversal.

Each pushed node is popped once.

Each node is emitted exactly when popped.

No node is emitted during left descent.

No node is emitted merely because its right subtree finishes.

### Binary-search-tree ordering

Suppose every node satisfies:

$$
\forall y\in L(x),\ y.key < x.key
$$

and

$$
\forall z\in R(x),\ x.key < z.key.
$$

By induction, `I(L(x))` is sorted below `x.key` and `I(R(x))` is sorted above it.

Therefore their in-order concatenation is strictly increasing.

With a consistent duplicate policy, the result becomes nondecreasing instead.

Sorted output is a consequence of both traversal order and BST validity.

An in-order traversal cannot repair a malformed search tree.

### Space invariant

The recursive and explicit-stack variants retain at most one root-to-current path.

Their auxiliary space is $O(h)$ for tree height $h$.

A balanced binary tree has $h=O(\log n)$.

A completely skewed tree has $h=n$.

Recursive code can overflow the language call stack on a skewed tree.

### Morris-thread invariant

When a node has a left subtree, its in-order predecessor is the rightmost node in that left subtree.

That predecessor normally has no right child.

Morris traversal temporarily sets the predecessor's right pointer to the current node.

This thread records how to return after completing the left subtree.

On encountering the same predecessor again, the algorithm removes the thread before emitting the current node.

Every temporary mutation must be restored.

### Termination measure

Standard iterative traversal either pushes an unvisited node or pops one permanently.

With $n$ nodes, there are $n$ pushes and $n$ pops.

Morris traversal examines each relevant predecessor edge a bounded number of times and creates then removes each thread once.

## 3. Step-by-Step Execution Trace

Use this binary search tree:

```text
        8
      /   \
     3     10
    / \      \
   1   6      14
      / \    /
     4   7  13
```

The expected in-order output is:

```text
1, 3, 4, 6, 7, 8, 10, 13, 14
```

### Descend from root `8`

Push `8` because its own visit must wait for the left subtree.

Move to left child `3`.

Push `3`.

Move to left child `1`.

Push `1`.

Move to `1.left`, which is empty.

Stack from bottom to top is `[8, 3, 1]`.

### Visit `1`

Pop `1`.

Its left subtree is empty and therefore complete.

Emit `1`.

Move to `1.right`, which is empty.

The stack remains `[8, 3]`.

### Visit `3`

No current node remains to descend.

Pop `3`.

Emit `3`.

Move to right child `6`.

Output is `[1, 3]`.

### Descend through `6`

Push `6`.

Move to left child `4`.

Push `4`.

Its left child is empty.

Stack is `[8, 6, 4]`.

Pop and emit `4`.

Its right child is empty.

Pop and emit `6`.

Move to `6.right`, node `7`.

Push and then emit `7` because it has no left child.

The completed left subtree of `8` emitted `[1, 3, 4, 6, 7]`.

### Visit root `8`

Pop `8`.

Every node in its left subtree is complete.

Emit `8`.

Move to right child `10`.

Output is `[1, 3, 4, 6, 7, 8]`.

### Traverse the right subtree

Push `10`.

Its left child is empty, so pop and emit `10`.

Move to right child `14`.

Push `14`.

Move to its left child `13`.

Push `13`.

Pop and emit `13`.

Return to the pending ancestor `14`.

Pop and emit `14`.

The stack and current pointer are now empty.

Traversal terminates with the sorted key sequence.

### Stack-state summary

| Emitted node | Stack immediately afterward | Next current node |
|---:|---|---|
| `1` | `[8, 3]` | empty |
| `3` | `[8]` | `6` |
| `4` | `[8, 6]` | empty |
| `6` | `[8]` | `7` |
| `7` | `[8]` | empty |
| `8` | `[]` | `10` |
| `10` | `[]` | `14` |
| `13` | `[14]` | empty |
| `14` | `[]` | empty |

### A non-BST example

If root `8` had left child `12`, in-order would visit `12` before `8`.

The traversal would be correct for that tree shape.

The numeric output would not be sorted.

Traversal correctness and BST validation are separate concerns.

## 4. Production-Ready Implementations

The node type below is immutable after construction except for its child references during setup.

The iterative generator avoids recursion depth limits and yields lazily.

```python
from dataclasses import dataclass
from typing import Generic, Iterator, TypeVar

T = TypeVar("T")


@dataclass
class Node(Generic[T]):
    value: T
    left: "Node[T] | None" = None
    right: "Node[T] | None" = None


def inorder(root: Node[T] | None) -> Iterator[T]:
    stack: list[Node[T]] = []
    current = root

    while current is not None or stack:
        while current is not None:
            stack.append(current)
            current = current.left

        current = stack.pop()
        yield current.value
        current = current.right
```

The generator retains traversal state between yields.

Mutating the tree during iteration can invalidate assumptions and produce inconsistent output.

Document whether concurrent mutation is forbidden, synchronized, or snapshot-based.

### Recursive reference implementation

```python
def inorder_recursive(root: Node[T] | None) -> Iterator[T]:
    if root is None:
        return

    yield from inorder_recursive(root.left)
    yield root.value
    yield from inorder_recursive(root.right)
```

This version mirrors the mathematical recurrence directly.

It is a useful reference for small trees and tests.

The iterative version is safer for adversarial or unbalanced depth.

### Build and execute the trace

```python
root = Node(
    8,
    left=Node(
        3,
        left=Node(1),
        right=Node(6, left=Node(4), right=Node(7)),
    ),
    right=Node(10, right=Node(14, left=Node(13))),
)

expected = [1, 3, 4, 6, 7, 8, 10, 13, 14]

assert list(inorder(root)) == expected
assert list(inorder_recursive(root)) == expected
assert list(inorder(None)) == []
assert list(inorder(Node(5))) == [5]
```

### Validate BST order independently

```python
def is_strict_bst(root: Node[int] | None) -> bool:
    iterator = inorder(root)
    try:
        previous = next(iterator)
    except StopIteration:
        return True

    for current in iterator:
        if current <= previous:
            return False
        previous = current

    return True


assert is_strict_bst(root)
assert not is_strict_bst(Node(8, left=Node(12)))
```

This validator assumes strict keys and rejects duplicates.

A counted-node or one-sided duplicate policy needs a matching validator.

### Morris traversal caution

Morris traversal can achieve $O(1)$ auxiliary space by creating temporary predecessor threads.

It mutates tree links during execution.

An exception, early generator termination, or concurrent reader can observe the temporary structure unless restoration is carefully guaranteed.

Use it only when constant auxiliary memory outweighs those risks.

## 5. Asymptotic Time & Space Complexity

Every proper tree node is reached once.

The iterative variant pushes each node once and pops it once.

Each operation is constant-time.

Total time is:

$$
T(n)=O(n).
$$

The traversal cannot emit $n$ values in less than $\Omega(n)$ time.

Thus its time is $\Theta(n)$ when all values are consumed.

The stack stores at most one root-to-current path.

Auxiliary space is $O(h)$ for height $h$.

For a balanced tree, $h=O(\log n)$.

For a skewed tree, $h=n$.

The recursive version uses the language call stack with the same $O(h)$ asymptotic space.

Its practical maximum depth is constrained by runtime recursion limits and stack size.

Morris traversal uses $O(1)$ auxiliary pointer state.

It still takes $O(n)$ time because each temporary thread is created and removed once.

A generator that is only partially consumed visits only the prefix needed before suspension.

Worst-case work to yield the first item is $O(h)$ due to the initial left descent.

Subsequent yields have amortized $O(1)$ stack operations across the complete traversal.

| Variant | Time | Auxiliary space | Mutates tree |
|---|---:|---:|---|
| Recursive | $O(n)$ | $O(h)$ call stack | No |
| Explicit stack | $O(n)$ | $O(h)$ | No |
| Morris threaded | $O(n)$ | $O(1)$ | Temporarily |

Materializing output in a list adds $O(n)$ result space.

Yielding values lazily excludes consumer-owned output storage from traversal auxiliary space.

## 6. Systems Connections

### Ordered indexes

An in-order walk of a valid search tree produces keys in order.

Database and filesystem indexes use higher-branching trees for page efficiency, but the principle of ordered traversal remains.

Range scans start near a lower bound and continue through ordered successors rather than walking every key from the minimum.

### Tree iterators

An iterator can retain the explicit stack between calls.

Each `next` operation resumes at the pending node and descends the next right subtree's left spine.

This avoids materializing all keys.

Iterator invalidation rules must cover concurrent insertion, deletion, and rebalancing.

### Expression trees

In-order traversal places binary operators between operands.

A tree for `(a + b) * c` must emit parentheses to distinguish it from `a + b * c` when formatting.

Traversal order alone does not encode precedence in a flat string.

The formatter needs operator metadata and tree context.

### Persistent trees

Immutable persistent trees allow readers to traverse a stable root while writers create new path copies.

An iterator sees one structural version without locks over every node.

Memory reclamation must keep all nodes reachable from active versions alive.

### Serialization

In-order values alone cannot reconstruct an arbitrary binary tree.

Many shapes share the same in-order sequence.

Combining in-order with pre-order or post-order can reconstruct a tree when keys are unique and assumptions are stated.

BST insertion order is another source of shape information but can produce a different balanced structure.

### Stack safety

Untrusted tree depth can turn elegant recursion into denial of service through stack exhaustion.

Explicit stacks move that state to bounded, inspectable heap storage.

Applications should still enforce node-count and memory limits.

### Temporary threading hazards

Morris traversal rewires null right links.

A concurrent observer may mistake a thread for a real child and encounter a cycle.

Exceptions must not leave threads installed.

The method is algorithmically clever but operationally invasive.

## 7. Practice Checklist

- Confirm the input is a binary tree rather than a general graph.
- Define the node and empty-tree representation.
- State the left-node-right visitation rule.
- Keep traversal separate from BST validation.
- Define the duplicate-key policy for BSTs.
- Test an empty tree.
- Test a single node.
- Test a left-skewed tree.
- Test a right-skewed tree.
- Test a balanced tree.
- Test duplicate keys under the chosen policy.
- Test a binary tree that is not a BST.
- Compare recursive and iterative outputs.
- Push ancestors during left descent.
- Emit a node only after its left subtree is complete.
- Move to the right child after emission.
- Stop only when both current pointer and stack are empty.
- Avoid recursion for unbounded depth.
- Yield lazily when callers may stop early.
- Document mutation during iteration.
- Define iterator invalidation behavior.
- Detect cycles if inputs are not trusted to be trees.
- Avoid a visited set when a validated tree contract already guarantees unique paths.
- Include parentheses when formatting expression trees.
- Do not claim in-order output is sorted without the BST invariant.
- Do not use in-order alone as a complete tree serialization.
- Restore every Morris thread.
- Avoid Morris traversal with concurrent readers.
- Measure output storage separately from traversal stack space.
- Validate node-count limits for untrusted inputs.

## 8. Frequently Asked Questions

### What is in-order traversal?

It recursively visits the left subtree, then the node, then the right subtree.

The rule applies to binary trees because each node has distinguished left and right children.

### Why does it sort a binary search tree?

Every left-subtree key precedes and compares below the node, while every right-subtree key follows and compares above it.

Induction over subtrees yields globally ordered output.

### Does it sort every binary tree?

No.

It emits a deterministic structural order, but numeric sorting requires the binary-search-tree ordering invariant.

### Is recursion required?

No.

An explicit stack stores the same pending ancestors and avoids call-stack depth limits.

### What does the stack contain?

It contains ancestors whose left descent has begun but whose own value has not yet been emitted.

The top is the next node after the current left chain ends.

### Why is auxiliary space $O(h)$?

Only one root-to-current path is pending at a time.

Its maximum length is the tree height $h$.

### Can traversal stop early?

Yes with a generator or iterator.

For example, a BST range query can stop once values exceed the upper bound, though it should also avoid irrelevant left portions through bounded search.

### What is Morris traversal?

It uses temporary links from a node's in-order predecessor back to that node, replacing the explicit stack with threaded return paths.

It restores those links after use.

### Is Morris traversal always better?

No.

It saves auxiliary space but mutates the tree temporarily, complicates exception safety, and conflicts with concurrent readers.

### Can in-order output reconstruct the tree?

Not by itself.

Different binary-tree shapes can share the same in-order sequence.

Additional traversal or shape markers are required.

### How are duplicate BST keys handled?

The tree must define a policy: reject duplicates, count them in nodes, or consistently place them on one side.

Traversal and validation must use the same rule.

### How should deep untrusted trees be traversed?

Use an explicit stack, enforce node and memory limits, and detect cycles when the input contract does not guarantee a proper tree.
