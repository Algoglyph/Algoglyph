# Depth-First Tree Search: Path State, Backtracking & Bounded Iteration

![Depth-first traversal through a rooted tree](/images/dsa/tree-dfs-dark.png)

## 1. Historical Context & Motivation

Depth-first search follows one branch until it ends, then backtracks.
The call stack mirrors this rule naturally.
An explicit stack provides the same order with controlled storage and failure behavior.
Tree DFS underlies preorder, postorder, path aggregation, subtree computation, serialization, and backtracking.
It differs from general graph DFS because a proper rooted tree has no cycles and one parent per nonroot node.
No visited set is needed under that contract.
Untrusted object graphs may violate it.
Identity validation prevents infinite loops and repeated subtrees.
DFS memory depends on depth and pending siblings.
Recursive DFS uses one call frame per active root-to-current path.
An explicit stack may hold pending nodes across branches.
A chain risks recursion overflow but uses a small explicit worklist.
A wide shallow tree can place many siblings on an explicit stack at once.
Traversal order is not one concept.
Preorder visits a node before children.
Postorder visits after children.
Inorder applies specifically to ordered binary trees.
Euler tours record entry, between-child, and exit events.
The desired computation determines the event.
Subtree sizes require child results before parent finalization, so postorder is natural.
Path strings and ancestor constraints require state while descending.
Early DFS search returns the first match in traversal order, not necessarily the shallowest.
BFS is required for minimum edge depth.
Recursive clarity is valuable when maximum height is bounded.
Iterative frames are safer when shape is user-controlled.
This article focuses on generic rooted-tree DFS, explicit entry/exit frames, path invariants, cycle validation, and depth limits.

## 2. Core Mathematical Invariants

At any moment, recursive active calls form one root-to-current path.
Each frame stores the current node and progress through its children.
The path invariant says every adjacent pair is a parent-child edge.
Preorder emits a node on frame entry.
Postorder emits it after every child frame completes.
An explicit event stack can encode `(node, entering)`.
Push an exit event, then child entry events in reverse order.
LIFO processing visits children in original order before the exit event.
Every valid tree node receives exactly one entry and one exit event.
An ancestor accumulator must be restored on backtracking.
Recursive local variables provide this restoration automatically.
Mutable shared accumulators need explicit undo.
For a root-to-node path sum, pass a new scalar sum downward.
For a mutable path list, append on entry and pop on exit.
The list invariant says it equals exactly the active path.
Failing to pop leaks one branch into the next branch's state.
Subtree size satisfies

$$
size(v)=1+\sum_{c\in children(v)}size(c).
$$

It can be finalized only after every child size is known.
Tree height satisfies

$$
height(v)=1+\max_c height(c)
$$

under node-count convention, with leaf height one.
Edge-height conventions instead give a leaf height zero.
Choose one explicitly.
Identity validation uses three logical states when diagnostics distinguish cycles from sharing.
An identity on the active path indicates a cycle.
An identity seen earlier but not active indicates a shared child and therefore a DAG.
A single global seen set can reject both at the second encounter.
For graph DFS, repeated identities are normal and should be skipped rather than called malformed.
The API contract determines behavior.
Depth limit should be checked before descending beyond it.
If root depth is zero and maximum allowed depth is $D$, accept nodes with depth at most $D$.
Node limits and depth limits protect different shapes.
A wide tree stays shallow but can contain huge total nodes.
A chain stays narrow but violates depth.
DFS preorder order depends on child sequence.
To preserve left-to-right order with an explicit stack, push children in reverse.
Pushing them forward reverses traversal.
Postorder cannot be obtained by merely reversing preorder in all labeled ordered contexts unless child ordering is transformed carefully.
Use explicit exit events for clarity.
Early exit must unwind or discard pending state without violating external cleanup.
Pure local traversal state makes that safe.
Side effects may require explicit compensation.
Recursive DFS maximum call depth equals tree height $h$.
Its stack space is $O(h)$ for constant frames.
An explicit event stack can hold $O(n)$ entries on a wide node because many child events are pushed together.
Iterators inside frames can reduce pending sibling storage to $O(h)$ plus iterator state.

## 3. Step-by-Step Execution Trace

Use root A with children B and E.
B has children C and D.
E has child F.
Preorder recursive DFS enters A and emits A.
It descends to B and emits B.
It descends to C and emits C.
C has no children and returns.
The active path shrinks from `[A,B,C]` to `[A,B]`.
B advances to D and emits D.
D returns.
B has no remaining children and returns.
A advances to E and emits E.
E descends to F and emits F.
F returns, then E returns, then A returns.
Preorder is `[A,B,C,D,E,F]`.
Postorder emits only on return.
C emits first.
D emits second.
B emits after both children.
F emits next.
E emits after F.
A emits last.
Postorder is `[C,D,B,F,E,A]`.
Now trace explicit events.
Start with stack `[(A,enter)]`.
Pop A entry and emit A for preorder.
Push `(A,exit)`.
Push E entry, then B entry so B is on top.
Pop B entry and emit B.
Push B exit, then D entry, then C entry.
Pop C entry, emit C, and push C exit.
Pop C exit and emit C for postorder.
Continue until A exit is last.
The two event streams match recursion exactly.
Now compute root-to-leaf path sums with values A=5, B=2, C=4, D=1, E=3, F=7.
Enter A with sum five.
Enter B with sum seven.
Enter C with sum eleven and record leaf path sum eleven.
Backtrack to B's sum seven.
Enter D with sum eight and record eight.
Backtrack to A's sum five.
Enter E with sum eight.
Enter F with sum fifteen and record fifteen.
The sums are `[11,8,15]`.
If mutable path state failed to pop C, D's path would incorrectly include C.
Now introduce edge F to A.
When F tries to enter A, A identity is already seen and active.
Validation rejects a cycle.
Now make C also a child of E.
The second encounter finds C seen but not active.
That proves sharing, so the input is a DAG rather than a strict tree.
Finally compare early search for F and a shallow matching D value under alternative shapes.
DFS may descend a long first branch before visiting a shallower match on a later branch.
Its first match is traversal-first, not minimum-depth.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Generic, Iterator, Literal, TypeVar


T = TypeVar("T")
Event = Literal["enter", "exit"]


@dataclass
class TreeNode(Generic[T]):
    value: T
    children: list[TreeNode[T]] = field(default_factory=list)


def depth_first_events(
    root: TreeNode[T] | None,
    *,
    max_depth: int | None = None,
    node_limit: int | None = None,
) -> Iterator[tuple[Event, TreeNode[T], int]]:
    if root is None:
        return
    if max_depth is not None and max_depth < 0:
        raise ValueError("max_depth must include root depth zero")
    if node_limit is not None and node_limit < 1:
        raise ValueError("node_limit must allow root")

    stack: list[tuple[TreeNode[T], int, bool]] = [(root, 0, False)]
    seen: set[int] = set()
    count = 0

    while stack:
        node, depth, exiting = stack.pop()
        if exiting:
            yield "exit", node, depth
            continue

        identity = id(node)
        if identity in seen:
            raise ValueError("cycle or shared child detected")
        seen.add(identity)
        count += 1
        if node_limit is not None and count > node_limit:
            raise ValueError("tree exceeds node limit")
        if max_depth is not None and depth > max_depth:
            raise ValueError("tree exceeds depth limit")

        yield "enter", node, depth
        stack.append((node, depth, True))
        for child in reversed(node.children):
            stack.append((child, depth + 1, False))


def preorder(root: TreeNode[T] | None) -> list[T]:
    return [node.value for event, node, _ in depth_first_events(root) if event == "enter"]


def postorder(root: TreeNode[T] | None) -> list[T]:
    return [node.value for event, node, _ in depth_first_events(root) if event == "exit"]


def demo() -> None:
    root = TreeNode("A", [TreeNode("B", [TreeNode("C"), TreeNode("D")]), TreeNode("E", [TreeNode("F")])])
    assert preorder(root) == ["A", "B", "C", "D", "E", "F"]
    assert postorder(root) == ["C", "D", "B", "F", "E", "A"]


if __name__ == "__main__":
    demo()
```

The generator returns immediately for a null root.
Because it contains `yield` elsewhere, ordinary iteration simply produces no events.
Exit events are pushed before reversed children.
This preserves original child order while guaranteeing postorder finalization.
The global seen set rejects cycles and shared children.
For a trusted tree, omitting it saves $O(n)$ validation memory.
For a graph, replace rejection with graph-specific visitation state.
The explicit event stack avoids Python recursion limits.
It may store many child events for a wide node.
A frame containing a child iterator uses less pending-sibling space but more complex code.
Node limits are checked on first entry.
Depth limits use root depth zero.
Consumers can compute subtree results on exit events.
Maintain a dictionary from node identity to result if parent frames need child values.
That dictionary adds linear storage.
Alternatively use richer explicit frames with partial accumulators.
Do not mutate child lists during traversal.
Snapshot or lock mutable trees.
If early consumer termination closes the generator, pending exit events do not run as application callbacks.
Keep resource cleanup outside traversal events or wrap it in guaranteed context management.
For persistent trees, immutable structure makes concurrent reads simpler.

## 5. Asymptotic Time & Space Complexity

Every node produces one enter and one exit event.
Every edge is examined once.
Full traversal time is $\Theta(n)$ for a tree with $n$ nodes.
Searching can stop early but remains $O(n)$ worst case.
Recursive DFS uses $O(h)$ call-stack space for height $h$ with constant frames.
A chain has $h=n$.
A balanced branching tree has logarithmic height.
The shown event stack can use $O(n)$ space in the worst case.
A root with $n-1$ children pushes them all.
Iterator-frame DFS can keep $O(h)$ frames while retaining child iterators.
The seen set adds $O(n)$ validation space.
Without validation on a guaranteed tree, it can be removed.
Materialized preorder or postorder output uses $O(n)$ result space.
Streaming events avoids that output retention.
Computing one path sum needs $O(h)$ path state or constant scalar state depending on output.
Collecting every root-to-leaf path can require $\Omega(k)$ output symbols, potentially $O(nh)$ across copied paths.
Subtree-size computation is $O(n)$ time.
Storing a size for every node uses $O(n)$ output or augmentation.
Computing only root size needs per-frame partial state but not a permanent map.
Sorting children changes time by degree-dependent sorting costs.
Graph DFS is $O(V+E)$ rather than tree-specific $O(n)$.
Iterative traversal changes failure behavior and constants, not mandatory asymptotic work.
BFS may use $O(w)$ frontier space and finds shallowest matches.
DFS favors path-oriented computation and depth-sized recursive state.

## 6. Systems Connections

Compilers traverse abstract syntax trees with preorder for declarations and postorder for synthesized properties.
Visitors expose entry and exit callbacks matching DFS events.
Filesystem tools recursively walk directories, but symbolic links can create cycles.
Device and inode identity may be needed instead of object identity.
DOM and UI trees use DFS for serialization, style propagation, and subtree invalidation.
Live mutation requires version checks or snapshots.
Garbage collectors use graph tracing rather than strict tree DFS because objects can share references and cycle.
The visited set is essential there.
Expression evaluators compute children before operators, a postorder pattern.
Query plans similarly evaluate child results before parent operators, though streaming changes materialization.
Merkle trees hash leaves and then parents in postorder.
Immutable child hashes make verification compositional.
Scene graphs propagate transforms from ancestors in preorder and compute bounds from children in postorder.
Both event phases may be needed in one walk.
Game trees use depth-first backtracking with alpha-beta pruning.
They are often graphs due to repeated positions, and search depth is bounded explicitly.
Configuration parsers cap nesting to prevent stack and CPU abuse.
Iterative DFS prevents native overflow but still needs node limits.
Authorization hierarchies must not assume tree ownership if roles can have multiple parents.
Applying tree algorithms to a DAG can duplicate effects.
Tree DFS connects recursion semantics to structured enter/exit lifecycle across many systems.

## 7. Practice Checklist

- Define preorder, postorder, inorder, or event semantics.
- Preserve child order deliberately.
- Push children in reverse for left-to-right explicit preorder.
- Use exit events for reliable postorder.
- Keep active path state synchronized on entry and exit.
- Undo mutable backtracking changes.
- Pass immutable scalar accumulators when possible.
- Confirm strict tree ownership or validate identity.
- Distinguish cycles from shared-child DAG structure if diagnostics require it.
- Use node identity, not repeated value, for structure checks.
- Handle a null root.
- Define root depth as zero or one.
- Apply depth limits consistently.
- Add node limits for wide inputs.
- Prefer iterative frames for untrusted depth.
- Consider iterator frames to bound pending sibling storage.
- Test one node, a chain, and a wide root.
- Test uneven branches.
- Test duplicate values in distinct nodes.
- Test cycle and shared-child rejection.
- Test preorder and postorder against hand traces.
- Verify every node has one entry and one exit.
- Verify exit follows all descendant exits.
- Do not use first DFS match as shallowest match.
- Use BFS for minimum edge depth.
- Snapshot mutable child collections.
- Avoid side effects that require generator exit events after early cancellation.
- Keep cleanup in guaranteed language constructs.
- Include result materialization in memory analysis.
- Stream events when consumers can process incrementally.
- Track parent links only when path reconstruction needs them.
- Use postorder for subtree aggregates.
- Use preorder for inherited ancestor state.
- Use both phases for scene or syntax visitors.
- Change to graph DFS when repeated nodes are valid.
- Bound branching work generated lazily.
- Avoid recursive destruction of deep trees.
- Keep traversal separate from application mutation.
- Property-test against a recursive reference on small trees.
- Choose DFS because the computation is path or subtree oriented.

## 8. Frequently Asked Questions

### Why does DFS use a stack?

LIFO state keeps the current branch active while postponing siblings until that branch completes.

### Does tree DFS need a visited set?

Not for a guaranteed strict tree.
Validation or general graph inputs require identity state.

### What is preorder?

It processes a node before its children, making it suitable for inherited state and root-first serialization.

### What is postorder?

It processes a node after every child, making it suitable for subtree aggregates and cleanup.

### Why push children in reverse?

An explicit LIFO stack removes the last pushed child first, so reversing the push preserves original left-to-right visitation.

### Is iterative DFS always $O(h)$ space?

Not with a simple pending-node stack; a wide node can push $O(n)$ siblings.
Iterator-based frames can keep state closer to height.

### Does first DFS match have minimum depth?

No.
DFS may explore a deep early branch before a shallow later branch.

### How are cycles detected?

Track active or seen node identities and reject an edge to an identity already encountered under a strict tree contract.

### What is backtracking?

It restores path-local state after finishing one choice so the next sibling begins from the correct ancestor state.

### Why use entry and exit events?

They represent recursive prologue and epilogue explicitly, supporting both preorder and postorder without native recursion.

### How is subtree size computed?

On each exit, combine already completed child sizes and add one for the current node.

### When should DFS be selected?

Use it for path constraints, subtree aggregation, serialization, and backtracking when depth memory and traversal order fit the workload.
