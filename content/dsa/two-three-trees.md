# 2–3 Trees: Perfect Balance Through Split, Promotion & Merge

![A balanced 2–3 tree with multi-key nodes](/images/dsa/two-three-trees-dark.png)

## 1. Historical Context & Motivation

A binary search tree can become a linked list when keys arrive in sorted order.
That degeneration turns logarithmic lookup into linear lookup.
A 2–3 tree prevents degeneration by allowing nodes to hold one or two keys.
A one-key node is called a **2-node**.
A two-key node is called a **3-node**.
Every internal 2-node has two children.
Every internal 3-node has three children.
All leaves remain at the same depth.
Perfect leaf depth is the source of the worst-case guarantee.
Insertion repairs overflow locally instead of rotating around a binary node.
Deletion repairs underflow by borrowing or merging.
The structure is a small-order B-tree.
Its ideas generalize directly to disk-oriented B-trees.
The 2–3 tree is especially useful for understanding promotion.
Promotion moves a separator upward after a node splits.
That operation can cascade to the root.
A root split is the only insertion event that increases height.
The tree never relies on random input order.
Its height guarantee is deterministic.
Search follows separator intervals rather than a single binary comparison.
The representation costs more per node than an ordinary BST.
The repair rules are correspondingly more involved.
Red–black trees encode similar balance using binary nodes and colors.
2–3 trees expose the multiway structure directly.
That direct view makes balance proofs easier to see.
It also explains why database indexes use wide nodes.
This article treats keys as unique unless stated otherwise.
Duplicate handling must be an explicit container policy.
Values may be stored beside keys or in leaf records.
The algorithms below focus on ordered-set behavior.

## 2. Core Mathematical Invariants

Keys inside every node are strictly increasing.
A 2-node containing key $k$ partitions values into $(-\infty,k)$ and $(k,\infty)$.
A 3-node containing $k_0<k_1$ creates three intervals.
Its children cover $(-\infty,k_0)$, $(k_0,k_1)$, and $(k_1,\infty)$.
Every descendant must remain in its assigned interval.
Every non-root node contains one or two keys.
The root contains one or two keys unless the tree is empty.
An internal node with $q$ keys has exactly $q+1$ children.
Leaves have no children.
All leaves have equal depth $h$.
These conditions define a valid 2–3 tree.
The minimum number of keys at height $h$ occurs when every node is a 2-node.
That minimum is $2^{h+1}-1$.
The maximum occurs when every node is a 3-node.
That maximum is $3^{h+1}-1$.
Therefore height satisfies $\log_3(n+1)-1\le h\le\log_2(n+1)-1$.
Search inspects at most two keys per visited node.
The number of visited nodes is $h+1$.
Insertion first reaches a leaf at the common leaf depth.
A temporary three-key node is an overflow state, not a valid stored state.
Splitting `[a,b,c]` promotes $b$.
The left replacement stores $a$.
The right replacement stores $c$.
If children exist, the first two attach left and the last two attach right.
Promotion preserves the search intervals.
If the parent overflows, the same split repeats upward.
If the root overflows, a new root receives the promoted key.
Both split children then have equal height.
Deletion may create a zero-key non-root node.
That underflow is also a temporary repair state.
A sibling with two keys can lend through the parent separator.
The parent separator moves into the deficient node.
The sibling boundary key replaces the parent separator.
For internal nodes, one sibling child moves with that key.
If neither sibling can lend, merge with one sibling and a parent separator.
The merged node contains two keys and remains valid.
The parent then loses one key and one child.
Underflow may propagate upward.
An empty root with one child is replaced by that child.
Root contraction is the only deletion event that decreases height.
Every repair preserves equal leaf depth.

## 3. Step-by-Step Execution Trace

Insert the sequence `10, 20, 30, 40, 50, 60, 70`.
Begin with an empty tree.
Insert `10` into the root leaf.
The root is `[10]`.
Insert `20` into the same leaf.
The root becomes `[10,20]`.
Insert `30` and obtain temporary `[10,20,30]`.
Split around median `20`.
Create root `[20]`.
Its children are `[10]` and `[30]`.
Both leaves are at depth one.
Insert `40` by comparing against `20`.
Descend to the right leaf.
That leaf becomes `[30,40]`.
Insert `50` into the right leaf.
Temporary contents are `[30,40,50]`.
Promote `40` to the root.
The root becomes `[20,40]`.
Its leaves are `[10]`, `[30]`, and `[50]`.
Insert `60` into the third leaf.
It becomes `[50,60]`.
Insert `70` there and split `[50,60,70]`.
Promote `60` to the root.
The root temporarily becomes `[20,40,60]`.
That overflow must also split.
Promote median `40` into a new root.
The left internal node stores `[20]`.
Its leaves are `[10]` and `[30]`.
The right internal node stores `[60]`.
Its leaves are `[50]` and `[70]`.
Every leaf is now at depth two.
Search for `50` starts at `[40]`.
Because `50>40`, descend right.
At `[60]`, because `50<60`, descend left.
The leaf `[50]` contains the target.
Now delete `10` to demonstrate underflow.
Leaf `[10]` becomes empty.
Sibling `[30]` has only one key and cannot lend.
Merge the empty leaf, separator `20`, and sibling `[30]`.
The merged leaf becomes `[20,30]`.
The left internal parent becomes empty.
Its sibling `[60]` cannot lend.
Merge through root separator `40`.
The old root becomes empty.
The merged internal node stores `[40,60]`.
Its leaves are `[20,30]`, `[50]`, and `[70]`.
Contract the empty root.
The resulting tree has height one.
All search intervals remain correct.
All leaves still share a depth.
The trace shows that repair changes structure, not sorted order.

## 4. Production-Ready Implementations

The following Python implementation provides lookup and insertion.
It rejects duplicates to keep the contract unambiguous.
Recursive insertion returns a promoted separator when a split occurs.

```python
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Generic, Optional, TypeVar

K = TypeVar("K")


@dataclass
class Node(Generic[K]):
    keys: list[K] = field(default_factory=list)
    children: list["Node[K]"] = field(default_factory=list)

    @property
    def leaf(self) -> bool:
        return not self.children


@dataclass
class Split(Generic[K]):
    key: K
    left: Node[K]
    right: Node[K]


class TwoThreeTree(Generic[K]):
    def __init__(self) -> None:
        self.root: Optional[Node[K]] = None
        self.size = 0

    def __contains__(self, key: K) -> bool:
        node = self.root
        while node is not None:
            i = 0
            while i < len(node.keys) and key > node.keys[i]:
                i += 1
            if i < len(node.keys) and key == node.keys[i]:
                return True
            if node.leaf:
                return False
            node = node.children[i]
        return False

    def add(self, key: K) -> bool:
        if self.root is None:
            self.root = Node([key])
            self.size = 1
            return True
        if key in self:
            return False
        split = self._insert(self.root, key)
        if split is not None:
            self.root = Node([split.key], [split.left, split.right])
        self.size += 1
        return True

    def _insert(self, node: Node[K], key: K) -> Optional[Split[K]]:
        if node.leaf:
            node.keys.append(key)
            node.keys.sort()
        else:
            index = 0
            while index < len(node.keys) and key > node.keys[index]:
                index += 1
            child_split = self._insert(node.children[index], key)
            if child_split is not None:
                node.keys.insert(index, child_split.key)
                node.children[index] = child_split.left
                node.children.insert(index + 1, child_split.right)
        if len(node.keys) <= 2:
            return None
        middle = node.keys[1]
        left_children = node.children[:2] if node.children else []
        right_children = node.children[2:] if node.children else []
        return Split(
            middle,
            Node([node.keys[0]], left_children),
            Node([node.keys[2]], right_children),
        )

    def inorder(self) -> list[K]:
        out: list[K] = []

        def visit(node: Node[K]) -> None:
            if node.leaf:
                out.extend(node.keys)
                return
            for i, key in enumerate(node.keys):
                visit(node.children[i])
                out.append(key)
            visit(node.children[-1])

        if self.root is not None:
            visit(self.root)
        return out


tree = TwoThreeTree[int]()
for value in [10, 20, 30, 40, 50, 60, 70]:
    assert tree.add(value)
assert tree.inorder() == [10, 20, 30, 40, 50, 60, 70]
assert 50 in tree
assert 99 not in tree
assert not tree.add(50)
```

Production containers also need deletion.
Deletion should be implemented with explicit borrow-left, borrow-right, and merge helpers.
Each helper should assert its preconditions.
Mutation should not expose a temporarily invalid tree to readers.
Concurrent access therefore needs locking or copy-on-write publication.
Stored records often separate keys from payloads.
Comparators must define a total order.
Mutable keys are unsafe because mutation can violate node ordering.
Persistence needs checksums, page identifiers, and crash-safe update ordering.
Large nodes should use arrays rather than pointer-heavy child objects.
Tests should compare results against a trusted ordered set.
Property tests should validate every invariant after every operation.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of stored keys.
Let $h$ be the tree height measured in edges.
The height is $\Theta(\log n)$.
Search visits one node per level.
Each 2–3 node performs at most two key comparisons.
Search therefore costs $O(\log n)$ worst case.
Successful and unsuccessful searches share that bound.
Insertion descends one root-to-leaf path.
It may split once per level while returning.
Each split manipulates a constant number of keys and children.
Insertion is $O(\log n)$ worst case.
Deletion follows one path and may repair once per level.
Deletion is also $O(\log n)$ worst case.
Minimum and maximum key queries cost $O(\log n)$ by following an extreme child.
An ordered traversal visits every key once.
Traversal costs $O(n)$ time.
The nodes collectively use $O(n)$ space.
Recursive operations use $O(\log n)$ call-stack space.
An iterative implementation uses the same amount for a parent path.
Bulk construction from sorted keys can be $O(n)$ with a dedicated builder.
Repeated insertion costs $O(n\log n)$ in the worst case.
Node occupancy lies between one and two keys outside temporary states.
That yields predictable but not perfect memory utilization.
Compared with a binary tree, each visit performs more local comparisons.
Compared with a wide B-tree, height is larger.
The asymptotic bound hides cache and allocation costs.
Disk indexes choose much larger node capacities to reduce I/O height.

## 6. Systems Connections

2–3 trees are the conceptual bridge from BSTs to B-trees.
Database indexes widen the same multiway-node idea to page-sized fanout.
Filesystem directories use balanced multiway indexes for similar reasons.
Red–black trees can represent 2–3 or 2–3–4 trees with colored links.
A black node plus a red child acts like one multi-key node.
That correspondence explains red–black height bounds.
Persistent ordered maps can path-copy the nodes touched by an update.
Only $O(\log n)$ nodes need new versions.
Immutable versions support snapshots without locking readers.
Storage engines must make splits durable before publishing new parent links.
Otherwise a crash can orphan a page.
Write-ahead logging records enough information to replay or undo repairs.
Latch coupling protects adjacent levels during concurrent modification.
Optimistic trees validate that separators did not change during descent.
Range scans benefit when leaves are linked, as in a B+ tree.
A plain 2–3 tree does not require leaf links.
Memory allocators can pool fixed node shapes to reduce fragmentation.
Compact key arrays improve cache locality.
Pointer-rich educational representations prioritize clarity instead.
Serialization must preserve child order exactly.
Deserialization should reject malformed key counts and unequal leaf depths.
Untrusted persisted trees require bounds checks before allocating children.
Metrics should track height, occupancy, split rate, and merge rate.
An increasing split rate can reveal adversarial or shifting workloads.
The deterministic guarantee makes the structure suitable when tail latency matters.
In practice, mature language libraries usually expose red–black or B-tree maps instead.
The 2–3 model remains valuable because their repair logic becomes understandable through it.

## 7. Practice Checklist

- Define the duplicate-key policy before implementing updates.
- State whether values live beside separators or only in leaves.
- Keep keys sorted within every node.
- Ensure an internal node has exactly one more child than keys.
- Verify every descendant lies inside its separator interval.
- Verify all leaves have the same depth.
- Treat three-key nodes as temporary overflow only.
- Promote the median during every split.
- Preserve child order when splitting an internal node.
- Handle root splits separately.
- Treat zero-key non-root nodes as temporary underflow only.
- Borrow only from a sibling with two keys.
- Move the parent separator during borrowing.
- Move the correct child when repairing internal nodes.
- Merge through a parent separator when borrowing is impossible.
- Contract an empty root with one child.
- Test insertion sequences in increasing order.
- Test insertion sequences in decreasing order.
- Test repeated root splits.
- Test deletion cascades to the root.
- Compare in-order output with a sorted reference set.
- Validate invariants after every randomized operation.
- Test minimum and maximum representable keys.
- Avoid mutable keys.
- Document comparator consistency requirements.
- Measure occupancy as well as operation latency.
- Use a wider B-tree for page-oriented storage.
- Prefer an established ordered-map library in production.
- Explain why every repair preserves leaf depth.
- Distinguish structural height from the number of levels.

## 8. Frequently Asked Questions

### Is a 2–3 tree a binary search tree?

No.
It is a multiway search tree because a node can have three children.
It represents the same ordered-set abstraction but uses different structural rules.

### Why are all leaves required at the same depth?

That condition prevents long and short search paths from diverging.
It yields the deterministic logarithmic height bound.

### What happens when a node receives a third key?

The node splits around its median.
The median moves to the parent and the two remaining keys become separate nodes.

### Can insertion split every level?

Yes.
The cascade still touches only one node per level, so time remains logarithmic.

### How does deletion differ from insertion?

Insertion repairs overflow by splitting upward.
Deletion repairs underflow by borrowing or merging upward.

### Are duplicate keys allowed?

They can be, but the representation needs a policy such as counts or composite keys.
The implementation above uses unique keys.

### How is this related to a red–black tree?

Red links can encode keys that conceptually share a multi-key node.
The binary representation is often easier to integrate with BST code.

### Why do databases use B-trees rather than 2–3 trees?

Disk and SSD pages favor much higher fanout.
Higher fanout reduces the number of page reads per lookup.

### Is the tree always perfectly full?

No.
Leaves share a depth, but nodes may contain either one or two keys.

### What is the hardest implementation bug?

Internal-node repair is the usual source of errors.
Keys and child pointers must move together while preserving interval order.

### Can the structure support order statistics?

Yes.
Store subtree key counts and update them after every split, borrow, and merge.

### When should I implement one myself?

Implement it for learning, specialized persistence, or verified systems work.
For ordinary applications, use a tested ordered-map implementation.
