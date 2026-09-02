# Hierarchical Tree Traversals: One Event Model for Preorder, Inorder & Postorder

![Unified tree traversal orders](/images/dsa/tree-traversal-dark.png)

## 1. Historical Context & Motivation

Tree algorithms differ mainly in when they process a node.
Preorder processes before descendants.
Postorder processes after descendants.
Binary inorder processes between left and right subtrees.
Level order uses a queue instead of depth-first nesting.
Treating these as unrelated memorized lists hides their common mechanism.
A traversal frame has entry, child-boundary, and exit events.
Choosing the processing event produces the named order.
This event model supports syntax trees, expression trees, filesystems, scene graphs, and indexes.
It also clarifies iterative implementations.
An ordinary node stack reproduces preorder easily.
Postorder needs visited state or exit markers.
Inorder needs a left-descent invariant.
Morris traversal temporarily threads pointers to use constant auxiliary space.
That mutation is risky on shared or immutable trees.
Traversal order must match computation dependencies.
Serialization often uses preorder plus null markers.
Expression evaluation uses postorder.
BST sorted enumeration uses inorder.
Ancestor propagation uses preorder.
Subtree aggregation uses postorder.
Breadth-first layout uses level order.
No order is universally best.
This article unifies traversal semantics while leaving detailed BFS and DFS mechanics to their dedicated articles.
It emphasizes binary trees because inorder requires an ordered child distinction.
General rooted trees have preorder and postorder but no single canonical inorder.
Malformed object graphs require identity handling.
Mutable traversal requires snapshot or mutation rules.
Output size is linear when every node is reported.
Generators avoid retaining that output.
Traversal is simple only after its contract is precise.

## 2. Core Mathematical Invariants

For binary node $v$, let left subtree be $L$ and right subtree $R$.
Preorder is `[v] + preorder(L) + preorder(R)`.
Inorder is `inorder(L) + [v] + inorder(R)`.
Postorder is `postorder(L) + postorder(R) + [v]`.
These recursive equations define the orders.
Level order groups by edge distance from root.
Each DFS frame passes through states before left, between children, and after right.
Process at the first state for preorder.
Process at the middle state for inorder.
Process at the final state for postorder.
Every valid node appears exactly once in each complete order.
Relative subtree order is preserved.
All nodes in L precede all nodes in R in the three standard left-first DFS orders, except root placement differs.
For a BST with strict ordering, inorder keys are sorted.
Sorted inorder does not alone prove balance.
It also does not prove unique node ownership.
Preorder plus inorder can reconstruct a binary tree when values are unique.
Postorder plus inorder can also reconstruct it.
Preorder plus postorder is not generally sufficient without additional shape constraints.
Duplicate values require unique identifiers or occurrence conventions.
Serialization with preorder and null markers reconstructs arbitrary binary shape.
Without null markers, different shapes can share the same preorder values.
An iterative inorder stack contains ancestors whose left subtree is complete or being explored but whose own processing is pending.
Repeatedly descend left, pushing nodes.
Pop the nearest pending node, emit it, then traverse right.
The invariant reproduces `left, node, right`.
Two-stack postorder stores reverse root-right-left and reverses it.
One-stack postorder uses previous-node or exit-event state.
Exit events are easier to audit.
Morris inorder creates a temporary thread from a node's inorder predecessor to the node.
The first encounter installs the thread and descends left.
The second encounter removes it, emits the node, and goes right.
Every temporary pointer must be restored.
An exception or concurrent reader can observe corruption if cleanup fails.
Use Morris only when mutation is exclusive and restoration guaranteed.
For a strict tree, edges equal $n-1$.
Traversal visits every edge a constant number of times.
Cycle detection is unnecessary only under that ownership guarantee.
Traversal of a DAG requires a semantic choice.
Visit shared nodes once, or once per root-to-node path.
Those produce different outputs.
Calling the input a tree avoids the ambiguity.

## 3. Step-by-Step Execution Trace

Use binary tree with root 4.
Its left child is 2 and right child is 6.
Node 2 has children 1 and 3.
Node 6 has children 5 and 7.
Preorder processes 4 first.
Then it traverses left subtree as 2,1,3.
Then right subtree as 6,5,7.
Preorder is `[4,2,1,3,6,5,7]`.
Inorder first descends to node 1.
Emit 1.
Return to 2 and emit 2.
Traverse and emit 3.
Return to 4 and emit 4.
Traverse right as 5,6,7.
Inorder is `[1,2,3,4,5,6,7]`.
The sorted output confirms BST ordering for this example.
Postorder processes leaves before parents.
Left subtree emits 1,3,2.
Right subtree emits 5,7,6.
Root 4 emits last.
Postorder is `[1,3,2,5,7,6,4]`.
Level order starts queue `[4]`.
It emits 4 and enqueues 2 and 6.
It emits 2 and 6, adding 1,3,5,7.
It emits the four leaves.
Level order is `[4,2,6,1,3,5,7]`.
Now trace iterative inorder.
Push 4, then 2, then 1 while descending left.
Node 1 has no left child.
Pop and emit 1.
Move to its right, which is null.
Pop and emit 2.
Move to node 3.
Push then pop 3 and emit it.
Pop 4 and continue right.
The stack always stores pending ancestors.
Now serialize preorder with null markers.
Emit 4,2,1,null,null,3,null,null,6,5,null,null,7,null,null.
Each leaf contributes two null child markers.
A decoder consumes tokens recursively.
Null returns no node.
A value creates a node then decodes its two children.
The exact original shape is recovered.
Remove null markers and sequence `[4,2,1,3,6,5,7]` no longer uniquely determines where missing children were.
This trace shows that traversal values and structural encoding are distinct products.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, TypeVar


T = TypeVar("T")


@dataclass
class BinaryNode(Generic[T]):
    value: T
    left: BinaryNode[T] | None = None
    right: BinaryNode[T] | None = None


def preorder(root: BinaryNode[T] | None) -> Iterator[T]:
    if root is None:
        return
    stack = [root]
    seen: set[int] = set()
    while stack:
        node = stack.pop()
        identity = id(node)
        if identity in seen:
            raise ValueError("input is not a tree")
        seen.add(identity)
        yield node.value
        if node.right is not None:
            stack.append(node.right)
        if node.left is not None:
            stack.append(node.left)


def inorder(root: BinaryNode[T] | None) -> Iterator[T]:
    stack: list[BinaryNode[T]] = []
    current = root
    seen: set[int] = set()
    while current is not None or stack:
        while current is not None:
            identity = id(current)
            if identity in seen:
                raise ValueError("input is not a tree")
            seen.add(identity)
            stack.append(current)
            current = current.left
        current = stack.pop()
        yield current.value
        current = current.right


def postorder(root: BinaryNode[T] | None) -> Iterator[T]:
    if root is None:
        return
    stack: list[tuple[BinaryNode[T], bool]] = [(root, False)]
    seen: set[int] = set()
    while stack:
        node, exiting = stack.pop()
        if exiting:
            yield node.value
            continue
        identity = id(node)
        if identity in seen:
            raise ValueError("input is not a tree")
        seen.add(identity)
        stack.append((node, True))
        if node.right is not None:
            stack.append((node.right, False))
        if node.left is not None:
            stack.append((node.left, False))


def demo() -> None:
    root = BinaryNode(4, BinaryNode(2, BinaryNode(1), BinaryNode(3)), BinaryNode(6, BinaryNode(5), BinaryNode(7)))
    assert list(preorder(root)) == [4, 2, 1, 3, 6, 5, 7]
    assert list(inorder(root)) == [1, 2, 3, 4, 5, 6, 7]
    assert list(postorder(root)) == [1, 3, 2, 5, 7, 6, 4]


if __name__ == "__main__":
    demo()
```

Generator functions avoid materializing output.
They still retain traversal stacks.
Seen sets validate strict ownership.
Trusted trees can omit them.
Inorder marks identity during left descent.
A right edge back to an ancestor is detected later.
Postorder exit markers avoid reverse-output storage.
Mutation during iteration is unsupported.
Immutable snapshots are safest.
For BST iteration, expose key-value pairs.
Do not allow key mutation.
For serialization, include format version.
Encode null shape explicitly.
Avoid recursive decoding of untrusted depth.
Use iterative frames and node limits.
Reject extra tokens and truncated input.
Duplicate values are valid when structure markers exist.
For reconstruction from order pairs, require unique IDs.
Morris traversal should not be used on shared immutable nodes.
If used, guarantee restoration through all exits.
Standard explicit stacks are usually worth their memory.

## 5. Asymptotic Time & Space Complexity

Every full traversal visits $n$ nodes.
Time is $\Theta(n)$.
Recursive DFS uses $O(h)$ call-stack space.
Iterative stacks use $O(h)$ for balanced path-oriented implementations and $O(n)$ worst case.
Validation adds $O(n)$ identity storage.
Without validation, auxiliary space follows the traversal stack.
Morris traversal uses $O(1)$ auxiliary pointers.
It temporarily mutates edges.
Each edge is threaded and restored a constant number of times.
Its time remains $O(n)$.
Level order uses frontier space $O(w)$ and $O(n)$ worst case.
Materialized output adds $O(n)$.
Streaming output adds only consumer-retained values.
Preorder serialization with null markers emits $2n+1$ tokens for a binary tree.
That is $\Theta(n)$ time and output space.
Reconstruction from preorder and inorder uses $O(n)$ time with an index map and unique values.
Naïvely scanning inorder for each root costs $O(n^2)$ worst case.
BST inorder yields sorted keys in linear time.
Finding the $k$th key by scanning costs $O(h+k)$.
Subtree-size augmentation answers selection in $O(h)$.
Traversal is not a replacement for indexing when repeated rank queries matter.

## 6. Systems Connections

Expression trees evaluate in postorder.
Prefix notation corresponds to preorder.
Infix notation resembles inorder with parentheses.
Compilers use visitor events across syntax trees.
Inherited attributes flow on entry.
Synthesized attributes finalize on exit.
Filesystems serialize hierarchies with explicit boundaries.
Symbolic links turn them into graphs.
Database indexes expose ordered leaf iteration akin inorder.
Scene graphs propagate transforms downward.
Bounds aggregate upward.
Merkle trees hash children before parents.
DOM renderers use preorder-like walks for document order.
Mutation observers complicate live traversal.
Garbage collectors traverse graphs with visited state.
They do not assume unique parents.
Network protocol trees require depth and node limits.
Null-marker formats must resist oversized declarations.
Diff algorithms compare traversal-derived hashes before descending.
Parallel postorder can process independent subtrees.
Parent combination waits for both results.
Traversal order encodes dependency, observability, and serialization semantics across systems.

## 7. Practice Checklist

- Name the traversal order explicitly.
- Define binary child order.
- Use preorder for parent-before-child work.
- Use postorder for child-before-parent work.
- Use inorder only where left/right semantics exist.
- Use level order for depth layers.
- Handle a null root.
- Visit every node exactly once.
- Preserve original child order.
- Push right before left on a LIFO stack.
- Use exit markers for postorder.
- Maintain the left-descent invariant for inorder.
- Validate identity on untrusted objects.
- Distinguish trees from DAGs.
- Define shared-node semantics if DAGs are allowed.
- Snapshot mutable structure.
- Avoid key mutation in BST traversal.
- Stream output when possible.
- Include materialized output in space analysis.
- Add depth and node limits to decoders.
- Encode null children for structural serialization.
- Version serialized formats.
- Reject truncated input.
- Reject surplus tokens.
- Require unique identifiers for reconstruction from traversal pairs.
- Test empty and singleton trees.
- Test left and right chains.
- Test a full balanced tree.
- Test duplicate values.
- Test malformed cycles.
- Test shared children.
- Compare recursive and iterative orders.
- Verify BST inorder sorting.
- Use Morris only with exclusive mutation.
- Restore every temporary thread.
- Avoid Morris on immutable shared trees.
- Property-test serialization round trips.
- Keep traversal separate from rendering effects.
- Choose augmentation for repeated queries.
- Match processing time to data dependencies.

## 8. Frequently Asked Questions

### What is preorder?

Node, then left subtree, then right subtree.

### What is inorder?

Left subtree, then node, then right subtree for a binary tree.

### What is postorder?

Left subtree, then right subtree, then node.

### Why is BST inorder sorted?

Every left key is lower and every right key is higher, recursively.

### Which order evaluates expressions?

Postorder evaluates operands before their operator.

### Which order serializes hierarchy naturally?

Preorder works well when null or child-count markers preserve shape.

### Can preorder alone reconstruct a tree?

Not generally without shape markers or another traversal.

### Why use iterative traversal?

It avoids native recursion overflow and exposes state limits explicitly.

### What is Morris traversal?

It temporarily threads predecessor pointers to traverse with constant auxiliary space.

### Is Morris always preferable?

No.
Temporary mutation complicates safety, sharing, exceptions, and concurrency.

### Does traversal require $O(n)$ extra space?

Not necessarily; output streaming and path stacks can use less, though validation or wide frontiers may be linear.

### What unifies the DFS orders?

They process the same frame at entry, between children, or exit.
