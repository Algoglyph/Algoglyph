# Leftist Heaps: Priority Queues Designed Around Fast Meld

![Leftist heap](/images/dsa/leftist-heaps-dark.png#dark)

A leftist heap is a heap-ordered binary tree whose shape invariant keeps the right spine short.
That deliberate imbalance makes melding two priority queues an $O(\log n)$ operation.
Insertion and deletion of the minimum are then expressed as special cases of the same merge routine.

## 1. Historical Context & Motivation

### Binary heaps optimize a different operation set

An array binary heap supports minimum lookup in $O(1)$ and insertion or deletion in $O(\log n)$.
It is compact and cache-friendly.
Merging two unrelated binary heaps efficiently is not its natural strength.

Concatenating their arrays and rebuilding costs $O(n+m)$.
Inserting the smaller heap's elements individually costs $O(m\log(n+m))$.
Applications that repeatedly combine queues need a representation in which meld is primitive.

### Crane's meldable heap

Clark Crane introduced leftist trees in the 1970s.
The structure keeps ordinary heap order while adding a rank that measures the shortest route to a missing child.
Each node keeps the child with greater rank on the left.

The tree can lean dramatically left.
This is intentional.
Only the right spine is traversed by meld, so the invariant keeps that spine logarithmic.

### Core operations

A min-leftist heap supports:

- `find_min`: inspect the root;
- `meld`: combine two heaps;
- `insert`: meld with a singleton;
- `delete_min`: meld the root's children;
- `build`: meld singletons using a suitable schedule.

The structure does not provide fast arbitrary search.
Heap order only says ancestors do not exceed descendants.

### When leftist heaps fit

They are useful when queues are frequently split by ownership and later combined.
Examples include event queues, graph-algorithm variants, simulation branches, and persistent functional structures.

Pairing heaps may be simpler and faster empirically.
Binomial and Fibonacci heaps provide different theoretical trade-offs.
Array heaps remain preferable when meld is absent and locality dominates.

### Problem statement

Maintain a multiset of comparable keys under minimum lookup, insertion, deletion of one minimum, and destructive or persistent melding.
Duplicates are allowed.
For a mutable heap, melding must define whether input heap handles are consumed.

## 2. Core Mathematical Invariants

### Heap-order invariant

For every node $x$ and child $c$,

$$
\operatorname{key}(x)\le\operatorname{key}(c).
$$

Therefore the root stores a minimum key.
No relationship is required between siblings.

### Null-path length

Define the null-path length, abbreviated NPL, by

$$
\operatorname{npl}(\varnothing)=-1
$$

and

$$
\operatorname{npl}(x)=1+\min(\operatorname{npl}(x.left),\operatorname{npl}(x.right)).
$$

Some texts use zero for an empty subtree.
Either convention works if formulas and stored ranks remain consistent.

NPL is the number of edges on a shortest downward path from the node to a missing child.
It is not subtree height.

### Leftist invariant

Every node satisfies

$$
\operatorname{npl}(x.left)\ge\operatorname{npl}(x.right).
$$

The shortest null path therefore travels through the right child.
With the `-1` convention,

$$
\operatorname{npl}(x)=1+\operatorname{npl}(x.right).
$$

### Right-spine bound

If a node has NPL $r$, its subtree contains at least

$$
2^{r+1}-1
$$

nodes.
The proof is by induction because both children have NPL at least $r-1$.

For a heap with $n$ nodes,

$$
r\le\lfloor\log_2(n+1)\rfloor-1.
$$

The right spine has $O(\log n)$ nodes.
Meld follows only this spine.

### Meld invariant

Given two valid heaps $A$ and $B$, choose the smaller root as the result root.
Suppose $A.root\le B.root$.
Keep $A$ as root and recursively meld $A.right$ with $B$.

The recursive result preserves heap order because every key in both input subheaps is at least $A.root$.
After attaching it, swap children if the leftist rank order is violated.
Recompute the root's NPL from its right child.

### Structural repair is local

Only nodes on the chosen root's right spine can change during meld.
Left subtrees remain untouched.
At each returning stack frame, one comparison, an optional child swap, and one rank update restore both invariants.

### Duplicate keys

Heap order permits equality.
A deterministic implementation can select the first heap's root on ties.
Stability among equal priorities requires an additional sequence number in the key.

### Ownership invariant

In a destructive implementation, a node belongs to at most one live heap after melding.
Leaving both original handles active can create aliasing and double mutation.
Persistent implementations avoid mutation and share untouched subtrees safely.

## 3. Step-by-Step Execution Trace

### Two input heaps

Meld these min-leftist heaps, written as `key[npl]`:

```text
Heap A                 Heap B
      2[1]                   3[1]
     /    \                 /    \
  7[0]    9[0]           5[0]   11[0]
```

Both satisfy heap order.
Both roots have equal child ranks.

### Compare roots

Compare keys two and three.
Two is smaller, so node two remains the result root.
Its left child seven is untouched.

The unresolved operation is

```text
meld(heap rooted at 9, heap rooted at 3)
```

### Recursive root choice

Compare nine and three.
Three is smaller, so node three becomes the recursive result root.
Its left child five remains untouched.

Now compute

```text
meld(heap rooted at 11, heap rooted at 9)
```

### Singleton merge

Compare eleven and nine.
Nine becomes root.
Its original right child is empty.
Melding empty with eleven returns node eleven.

Temporarily node nine has:

```text
9
 \
  11
```

Its left rank is $-1$ and right rank is zero.
The leftist invariant is violated.
Swap the children:

```text
   9[0]
  /
11[0]
```

The new right child is empty, so NPL of nine is zero.

### Repair node three

Attach the subtree rooted at nine as node three's right child:

```text
      3
     / \
    5   9
       /
      11
```

Both children of three have NPL zero.
No swap is needed.
Set NPL of three to one.

### Repair node two

Attach the subtree rooted at three as node two's right child:

```text
      2
     / \
    7   3
       / \
      5   9
         /
        11
```

The left child seven has NPL zero.
The right child three has NPL one.
The leftist invariant is violated.
Swap the children.

### Final heap

```text
          2[1]
         /    \
      3[1]    7[0]
     /   \
  5[0]   9[0]
         /
      11[0]
```

Heap order holds on every parent-child edge.
At every node, left NPL is at least right NPL.

### Insert as meld

To insert key one, create singleton `1[0]` and meld it with the heap.
One becomes the new root.
The old heap attaches through its right side.
After the local swap, insertion completes in logarithmic time.

### Delete minimum as meld

Deleting two removes the root.
Its left subtree is rooted at three and its right subtree at seven.
Meld those two heaps.
No separate sift-down operation is needed.

### Trace connection to the bound

Every recursive call descended through a right child of one selected root.
It never traversed the large left subtrees.
The leftist invariant bounds each right spine by logarithmic length.

## 4. Production-Ready Implementations

### Mutable Python heap

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, TypeVar


T = TypeVar("T")


@dataclass
class Node(Generic[T]):
    key: T
    left: Node[T] | None = None
    right: Node[T] | None = None
    npl: int = 0


def rank(node: Node[T] | None) -> int:
    return -1 if node is None else node.npl


def meld(a: Node[T] | None, b: Node[T] | None) -> Node[T] | None:
    if a is None:
        return b
    if b is None:
        return a
    if b.key < a.key:
        a, b = b, a

    a.right = meld(a.right, b)
    if rank(a.left) < rank(a.right):
        a.left, a.right = a.right, a.left
    a.npl = rank(a.right) + 1
    return a


class LeftistHeap(Generic[T]):
    def __init__(self) -> None:
        self.root: Node[T] | None = None
        self.size = 0

    def push(self, key: T) -> None:
        self.root = meld(self.root, Node(key))
        self.size += 1

    def minimum(self) -> T:
        if self.root is None:
            raise IndexError("minimum from empty heap")
        return self.root.key

    def pop_minimum(self) -> T:
        if self.root is None:
            raise IndexError("pop from empty heap")
        key = self.root.key
        self.root = meld(self.root.left, self.root.right)
        self.size -= 1
        return key

    def absorb(self, other: LeftistHeap[T]) -> None:
        if other is self:
            raise ValueError("cannot meld a heap with itself")
        self.root = meld(self.root, other.root)
        self.size += other.size
        other.root = None
        other.size = 0


heap = LeftistHeap[int]()
for value in [9, 2, 7, 3, 11, 5]:
    heap.push(value)
assert [heap.pop_minimum() for _ in range(6)] == [2, 3, 5, 7, 9, 11]
```

`absorb` consumes the other heap explicitly.
That prevents two mutable wrappers from owning the same nodes.

### Structural validator

```python
def validate(node: Node[int] | None) -> tuple[int, int]:
    if node is None:
        return -1, 0
    left_rank, left_size = validate(node.left)
    right_rank, right_size = validate(node.right)
    if node.left is not None:
        assert node.key <= node.left.key
    if node.right is not None:
        assert node.key <= node.right.key
    assert left_rank >= right_rank
    assert node.npl == right_rank + 1
    return node.npl, left_size + right_size + 1
```

Run this oracle after randomized operations in tests.
Do not place a complete recursive validation on the production hot path.

### Iterative concerns

The recursive meld depth follows the right spines and is $O(\log n)$ for valid heaps.
That is ordinarily safe, unlike recursion on arbitrary tree height.
Corrupted ranks or structure can violate the bound, so serialized input should be validated before use.

### Bulk construction

Repeated insertion costs $O(n\log n)$ worst case.
A queue of singleton heaps can be melded pairwise in rounds.
This tournament-style construction limits repeated participation and can build in $O(n)$ time under the standard analysis.

### Persistent variant

A functional implementation creates new nodes along the meld path and shares untouched subtrees.
Each meld allocates $O(\log n)$ nodes.
Old heap versions remain valid because no shared node is mutated.

## 5. Asymptotic Time & Space Complexity

### Find minimum

The minimum is stored at the root.
Time is $O(1)$ and no auxiliary space is required.

### Meld

Meld descends through right spines.
Their lengths are $O(\log n)$ and $O(\log m)$.
Time is

$$
O(\log n+\log m)=O(\log(n+m)).
$$

Recursive stack space has the same logarithmic bound.

### Insert

Insertion melds with a singleton.
Worst-case time is $O(\log n)$.
The new node uses $O(1)$ heap storage plus recursive stack space.

### Delete minimum

Removing the root is constant work before melding its two children.
Worst-case time is $O(\log n)$.

### Build

Sequential insertion gives $O(n\log n)$ worst-case construction.
Pairwise tournament melding can construct a heap in $O(n)$ time.
The scheduling strategy therefore matters.

### Storage

Each element occupies one node with two child references and one rank.
Total heap storage is $O(n)$.
Compared with an array heap, pointer and allocator overhead are substantial.

### Comparison table

| Structure | Find min | Insert | Delete min | Meld |
|---|---:|---:|---:|---:|
| Binary heap | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(n+m)$ rebuild |
| Leftist heap | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(\log(n+m))$ |
| Binomial heap | $O(\log n)$ typical root scan | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ |
| Fibonacci heap | $O(1)$ amortized | $O(1)$ amortized | $O(\log n)$ amortized | $O(1)$ amortized |

Theoretical tables omit cache behavior and implementation complexity.

## 6. Systems Connections

### Event simulation

Separate simulation regions can maintain local event queues and later merge them.
A meldable heap expresses that operation directly.
Concurrent simulation still needs ownership rules and synchronization around queue merging.

### Graph algorithms

Priority queues appear in shortest-path and spanning-tree algorithms.
Leftist heaps support minimum extraction but do not provide a native constant-time decrease-key handle.
Lazy duplicate insertion can replace decrease-key at the cost of stale entries.

### Functional programming

Persistent leftist heaps are concise because meld copies only one logarithmic path.
Immutable versions avoid aliasing and make rollback or branching natural.
Allocation and garbage-collection costs replace mutation concerns.

### External schedulers

Schedulers may aggregate queues from workers or tenants.
Priority semantics usually include deadlines, fairness, and cancellation beyond a scalar minimum key.
A leftist heap is one component, not a full scheduling policy.

### Memory locality

Pointer-based nodes scatter across memory and cause cache misses.
An array binary heap often wins when meld is rare.
Pool allocation can improve locality but complicates lifetime management.

### Concurrency

Destructive meld touches a path in both heaps and cannot safely race with other operations on either heap.
Coarse locks are simple.
Fine-grained or lock-free meldable queues require different algorithms and careful reclamation.

## 7. Practice Checklist

### Invariants

- Root is a minimum.
- Parent keys do not exceed child keys.
- Empty rank convention is consistent.
- Left rank is at least right rank.
- Stored NPL equals right rank plus one.
- Right spine is logarithmically bounded.

### Meld implementation

- Handle either empty input.
- Put the smaller root first.
- Recurse on the first root's right child.
- Attach the recursive result.
- Swap children when ranks are reversed.
- Recompute rank after the swap.
- Define equal-key tie behavior.
- Define ownership after destructive meld.

### Operation tests

- Meld two empty heaps.
- Meld empty with nonempty.
- Meld two singletons.
- Insert ascending keys.
- Insert descending keys.
- Insert duplicate keys.
- Delete until empty.
- Meld highly unequal heap sizes.
- Reject self-meld in mutable wrappers.

### Structural tests

- Validate every heap-order edge.
- Validate every leftist rank inequality.
- Recompute ranks independently.
- Compare popped order with sorting.
- Randomly interleave insertion and deletion.
- Randomly meld independently built heaps.
- Confirm consumed heaps become empty.

### Design choices

- Choose min-heap or max-heap semantics.
- Choose mutable or persistent ownership.
- Choose stable tie keys if needed.
- Choose rank convention.
- Consider iterative allocation limits.
- Compare against a binary heap benchmark.
- Use pairwise melding for bulk build.

## 8. Frequently Asked Questions

### Why is it called leftist?

The rank invariant keeps the shorter null path on the right, so nodes tend to accumulate toward the left.
It does not require a complete or balanced binary-tree shape.

### Is a leftist heap a binary search tree?

No.
It maintains heap order, not left-less-than-root-right ordering.

### Why is the right spine important?

Meld recurses only through right children of selected roots.
Bounding that path bounds all major operations.

### Is NPL the same as height?

No.
NPL measures the shortest path to a missing child; height measures the longest path to a leaf.

### Why swap children after melding?

The new right subtree may have greater NPL than the left subtree.
Swapping restores the leftist invariant locally.

### Can keys repeat?

Yes.
Use a secondary sequence number if stable ordering among equal priorities matters.

### Does meld mutate both heaps?

The shown mutable version reuses their nodes and consumes the second wrapper.
A persistent implementation can preserve both originals through path copying.

### Is insertion $O(1)$?

Not in the worst-case leftist-heap bound.
It is a meld with a singleton and costs $O(\log n)$.

### Why not always use a Fibonacci heap?

Fibonacci heaps offer strong amortized bounds but have larger constants and more complex invariants.
Simpler heaps often perform better in actual workloads.

### Can I search for an arbitrary key quickly?

No.
Heap order does not direct a search toward one child, so arbitrary search can require $O(n)$.

### How is a skew heap different?

A skew heap swaps children unconditionally during meld and stores no rank.
It has amortized rather than the same per-operation structural guarantee.

### What is the most common bug?

Updating NPL before the possible child swap or using inconsistent empty-subtree rank conventions.

### How do I validate the logarithmic claim?

Prove a node of rank $r$ has at least $2^{r+1}-1$ descendants including itself.
Then solve the inequality for $r$ in terms of $n$.

### What should I study next?

Compare skew, pairing, binomial, and Fibonacci heaps, focusing on meld, decrease-key, memory layout, and amortized versus worst-case guarantees.
