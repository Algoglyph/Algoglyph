# Treaps: Random Priorities, Split–Merge Algebra & Expected Balance

![Treap satisfying key and priority order](/images/dsa/treaps-dark.png)

## 1. Historical Context & Motivation

A treap combines two familiar trees in one set of nodes.
Keys obey binary-search-tree order.
Random priorities obey heap order.
The resulting shape is determined by key-priority pairs.
If priorities are independent and random, expected height is $O(\log n)$.
No color or explicit balance factor is stored.
Insertion and deletion can be expressed through rotations or through split and merge.
The split–merge formulation is especially powerful.
It turns ordered-set updates into small algebraic transformations.
Augmented treaps support sequence editing, range aggregates, lazy reversal, and order statistics.
An implicit treap uses subtree sizes as positions rather than explicit keys.
This makes it a flexible rope-like sequence structure.
Randomization is not decoration.
Adversarial or correlated priorities can create a linear chain.
Priority generation and collision policy are part of the guarantee.
Deterministic pseudo-random priorities are reproducible but may be predictable to an attacker.
Hash-derived priorities can make shape a deterministic function of keys while requiring a keyed hash for adversarial resistance.
Treaps provide expected rather than worst-case per-operation bounds.
AVL and red-black trees offer deterministic height guarantees.
Splay trees offer amortized adaptive locality.
Treaps offer unusually simple split, merge, and persistence.
Those operations justify them in competitive programming, immutable structures, interval sets, and randomized search trees.
A treap is also equivalent in distribution to a BST built by inserting keys in random priority order.
That equivalence supports its expected-height analysis.
The structure assumes distinct priorities for a unique Cartesian-tree shape.
Collisions can be resolved by pairing a random value with a unique sequence number.
Duplicate keys need an explicit set or multiset policy.
This article uses unique keys and a max-heap priority convention.
Higher numeric priority means closer to the root.
Changing to min-heap is fine if every operation changes consistently.

## 2. Core Mathematical Invariants

For every node $x$, keys in its left subtree are less than `x.key`.
Keys in its right subtree are greater under the unique-key policy.
For every child $c$ of $x$, `x.priority > c.priority` under max-heap order.
These two invariants uniquely determine the tree when keys and priorities are distinct.
The root is the node with maximum priority among all keys.
Its left subtree contains exactly smaller keys.
Its right subtree contains exactly larger keys.
The same rule applies recursively.
A subtree size augmentation satisfies

$$
size(x)=1+size(left(x))+size(right(x)).
$$

Every structural mutation must recompute affected nodes bottom-up.
`split(root, key)` returns trees $A$ and $B$.
Every key in $A$ is less than `key`.
Every key in $B$ is at least `key`.
Both outputs preserve BST and heap invariants.
If `root.key < key`, root belongs to A.
Split its right subtree.
The smaller result becomes root's new right child.
The larger result becomes B.
If `root.key >= key`, the symmetric operation splits the left subtree.
`merge(A,B)` requires every key in A to be less than every key in B.
Compare root priorities.
The higher-priority root must remain above the other tree.
If A wins, recursively merge `A.right` with B and attach the result to A.
If B wins, recursively merge A with `B.left` and attach to B.
The precondition preserves key order.
Priority selection preserves heap order.
Insertion can split the existing tree around the new key and merge left, node, and right.
Deletion can split around a key interval or recursively merge the deleted node's children.
For integer unique keys, splitting at `key` and `key+1` risks overflow and assumes discrete order.
Comparator-generic deletion should locate the key or use lower/upper split variants.
Search follows ordinary BST comparisons.
Order statistic `kth(k)` uses left subtree size.
If $k<size(left)$, descend left.
If equal, current node is the answer.
Otherwise descend right with adjusted rank.
Expected balance follows random priority order.
For sorted keys, node $i$ is an ancestor of node $j$ exactly when its priority is maximum over the key interval between them under the relevant direction.
The probability of that event is reciprocal to interval length.
Summing ancestor probabilities gives expected depth $O(\log n)$.
Worst-case depth remains $n$.
The randomness must be independent of key order for the standard analysis.
Persistence copies only nodes on changed split and merge paths.
Unchanged subtrees can be shared because their structure and augmentation remain immutable.
Expected copied nodes per operation are $O(\log n)$.
Mutable lazy tags require careful copy-on-write before propagation in a persistent treap.
Implicit treaps replace key comparisons with subtree counts.
Split by position $k$ returns the first $k$ sequence elements and the remainder.
In-order traversal defines sequence order.
Lazy reversal swaps children and toggles a flag.
Push the flag before descending or comparing positions.

## 3. Step-by-Step Execution Trace

Insert key-priority pairs `(40,90)`, `(20,70)`, `(60,80)`, `(10,30)`, and `(30,50)`.
Key 40 with priority 90 becomes root.
Insert key 20 with priority 70.
It belongs left of 40 and has lower priority, so it becomes the left child.
Insert key 60 with priority 80.
It belongs right of 40 and remains below priority 90.
Insert key 10 with priority 30.
It follows left from 40 and left from 20.
Insert key 30 with priority 50.
It follows left from 40 and right from 20.
The BST in-order order is `[10,20,30,40,60]`.
Every parent priority exceeds its children.
Subtree sizes are one at leaves.
Node 20 has size three.
Root 40 has size five.
Now split at key 30.
At root 40, key 40 is at least 30, so root belongs to right output.
Split root's left subtree at 30.
At node 20, key 20 is below 30, so it belongs to left output.
Split node 20's right subtree, node 30, at 30.
Node 30 belongs to the right output.
Its left subtree is empty.
Attach the smaller split result to node 20's right, making it empty.
Attach the larger result, node 30, as root 40's left subtree through returned recursion.
Left output contains keys `[10,20]`.
Right output contains `[30,40,60]`.
Both retain heap order.
Now merge those outputs.
Compare root priorities 70 for node 20 and 90 for node 40.
Node 40 wins as merged root.
Recursively merge left tree rooted at 20 with node 40's left tree rooted at 30.
Node 20 priority 70 exceeds node 30 priority 50.
Node 20 remains root of that merge.
Merge its empty right child with node 30, yielding node 30.
Attach node 20 as left child of 40.
The original shape is restored.
Now delete key 20.
Find node 20 by BST descent.
Replace it with merge of its left subtree rooted at 10 and right subtree rooted at 30.
Priority 50 at node 30 exceeds priority 30 at node 10.
Node 30 becomes merged root with node 10 as left child.
Attach this subtree under node 40.
In-order keys become `[10,30,40,60]`.
Heap order still holds.
Find zero-based rank two.
Root 40 has left size two.
Rank two equals that size, so key 40 is returned.
Now imagine priorities assigned in increasing order with sorted keys.
Every new key becomes a higher-priority root with the old tree as left child.
The result is a chain.
Random independence prevents that pattern in expectation but cannot make it impossible.

## 4. Production-Ready Implementations

This implementation provides a unique-key treap set with split, merge, insertion, deletion, membership, and rank selection.

```python
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Generic, TypeVar


K = TypeVar("K")


@dataclass
class Node(Generic[K]):
    key: K
    priority: int
    left: Node[K] | None = None
    right: Node[K] | None = None
    size: int = 1


def size(node: Node[K] | None) -> int:
    return 0 if node is None else node.size


def update(node: Node[K]) -> None:
    node.size = 1 + size(node.left) + size(node.right)


def split(root: Node[K] | None, key: K) -> tuple[Node[K] | None, Node[K] | None]:
    if root is None:
        return None, None
    if root.key < key:
        smaller, larger = split(root.right, key)
        root.right = smaller
        update(root)
        return root, larger
    smaller, larger = split(root.left, key)
    root.left = larger
    update(root)
    return smaller, root


def merge(left: Node[K] | None, right: Node[K] | None) -> Node[K] | None:
    if left is None:
        return right
    if right is None:
        return left
    if left.priority > right.priority:
        left.right = merge(left.right, right)
        update(left)
        return left
    right.left = merge(left, right.left)
    update(right)
    return right


class TreapSet(Generic[K]):
    def __init__(self, *, seed: int | None = None) -> None:
        self.root: Node[K] | None = None
        self._random = random.Random(seed)
        self._serial = 0

    def __contains__(self, key: K) -> bool:
        current = self.root
        while current is not None:
            if key == current.key:
                return True
            current = current.left if key < current.key else current.right
        return False

    def add(self, key: K) -> bool:
        if key in self:
            return False
        self._serial += 1
        priority = (self._random.getrandbits(64) << 64) | self._serial
        left, right = split(self.root, key)
        self.root = merge(merge(left, Node(key, priority)), right)
        return True

    def discard(self, key: K) -> bool:
        def remove(root: Node[K] | None) -> tuple[Node[K] | None, bool]:
            if root is None:
                return None, False
            if key == root.key:
                return merge(root.left, root.right), True
            if key < root.key:
                root.left, removed = remove(root.left)
            else:
                root.right, removed = remove(root.right)
            update(root)
            return root, removed

        self.root, removed = remove(self.root)
        return removed

    def kth(self, rank: int) -> K:
        if not 0 <= rank < size(self.root):
            raise IndexError("rank outside set")
        current = self.root
        while current is not None:
            left_size = size(current.left)
            if rank < left_size:
                current = current.left
            elif rank == left_size:
                return current.key
            else:
                rank -= left_size + 1
                current = current.right
        raise RuntimeError("unreachable")


def demo() -> None:
    treap = TreapSet[int](seed=7)
    for key in [40, 20, 60, 10, 30]:
        assert treap.add(key)
    assert not treap.add(20)
    assert treap.kth(2) == 30
    assert treap.discard(20)
    assert not treap.discard(20)
    assert [treap.kth(i) for i in range(4)] == [10, 30, 40, 60]


if __name__ == "__main__":
    demo()
```

The combined random bits and serial make priorities unique within one set.
The serial is not a substitute for unpredictable random bits.
For adversarial public keys, use a cryptographically keyed priority derivation or a deterministic balanced tree.
Python recursion can overflow on a rare or adversarial deep treap.
Production untrusted implementations should use iterative transformations or enforce depth and rebuild policies.
The comparator must define a stable strict total order.
Mutable keys are prohibited.
Recursive deletion recomputes size even when the key is absent.
That is correct but performs unnecessary writes; a tuned implementation can avoid them.
Property tests should compare in-order keys and rank results with a sorted reference set.
Validate heap priority, BST ordering, stored size, and node uniqueness after random operations.
For persistence, allocate new nodes along paths instead of mutating shared nodes.
For implicit treaps, replace key-based split with a count-based split.
Push lazy tags before descending or splitting.
Recompute aggregates after child changes.
Do not reuse this mutable implementation for concurrent readers without synchronization.
Split and merge rewrite many parent-child links.
A coarse lock is simpler than fine-grained rotation coordination.

## 5. Asymptotic Time & Space Complexity

Expected treap height is $O(\log n)$ under independent random priorities.
Search follows one root-to-leaf path and takes expected $O(\log n)$ time.
Split follows one path and takes expected $O(\log n)$ time.
Merge also follows one interleaved boundary path and takes expected $O(\log n)$ time.
Insertion composed from split and merge is expected $O(\log n)$.
Deletion is expected $O(\log n)$.
Order-statistic selection is expected $O(\log n)$ with subtree sizes.
Worst-case time for each is $O(n)$ when the tree is a chain.
The tree stores one node per key and uses $O(n)$ retained space.
Recursive operations use expected $O(\log n)$ call-stack space and $O(n)$ worst case.
Iterative variants can use explicit $O(h)$ state or pointer rewrites.
Persistent split and merge copy expected $O(\log n)$ nodes per version.
Unchanged subtrees are shared.
Keeping $q$ versions can use $O(n+q\log n)$ expected nodes under ordinary updates.
Lazy range operations in implicit treaps remain expected logarithmic for split, tag, and merge.
Traversing all elements takes $O(n)$ time.
Building by repeated insertion costs expected $O(n\log n)$.
If keys are already sorted and priorities known, a Cartesian-tree stack builds the treap in $O(n)$ time.
AVL and red-black trees guarantee $O(\log n)$ worst-case operations.
Treaps exchange that deterministic guarantee for simpler split–merge logic and expected bounds.
Splay trees offer $O(\log n)$ amortized operations and adapt to access locality.
Treaps do not move a searched key unless updates occur.
Hash sets offer expected $O(1)$ membership but lack sorted order and rank operations.
Concrete treap memory includes child pointers, priority, size, key, allocator metadata, and alignment.
Flat sorted arrays may outperform treaps for small immutable sets through locality.

## 6. Systems Connections

Implicit treaps represent editable sequences through in-order position.
Split at cursor positions and merge inserted fragments.
Subtree aggregates support range sums, minima, hashes, and lengths.
Lazy reversal swaps children and defers descendant work.
Text editors more commonly use ropes, piece tables, or B-tree variants, but treaps illustrate the same split–concatenate algebra.
Persistent treaps support immutable snapshots and undo history.
Structural sharing keeps unchanged regions common across versions.
Version publication becomes an atomic root-pointer change.
Memory reclamation must respect readers of old roots.
Interval sets use ordered treaps to locate neighbors and merge overlaps.
Augmented maximum endpoints support stabbing queries.
Competitive programming uses treaps because a compact implementation supports ordered sets and sequences without a large library.
That convenience should not obscure recursion and randomness risks.
Database and filesystem indexes usually prefer B-trees for block locality and deterministic depth.
Binary pointer trees waste storage-device transfers.
In-memory schedulers can use treap priorities as randomized balance, but application priority is a different field.
Do not conflate structural random priority with business scheduling priority.
Security-sensitive maps need denial-of-service analysis.
Predictable priorities let crafted keys force poor shapes if priority derives insecurely from keys.
Use keyed hashing or deterministic worst-case trees at trust boundaries.
Replicated systems need deterministic shapes only if tree structure itself is serialized or hashed.
Random seeds then become part of reproducibility.
Logical key-value contents can remain deterministic while internal shapes differ.
Concurrent treaps require coordination across split and merge paths.
Immutable persistent nodes simplify lock-free reads but still need safe reclamation.
Treaps connect randomized algorithms to practical ordered-sequence transformations through one pair of invariants.

## 7. Practice Checklist

- Choose max-heap or min-heap priority convention once.
- Preserve strict BST key order.
- Preserve strict heap priority order.
- Make priorities unique or define collision ordering.
- Use randomness independent of insertion key order.
- Protect priority generation against adversarial predictability when needed.
- Define unique-key or multiset semantics.
- Recompute subtree size after every child mutation.
- Validate `size = 1 + left + right`.
- Keep split boundary semantics explicit.
- Verify every left split key is below the boundary.
- Verify every right split key is at least the boundary.
- Call merge only when all left keys precede all right keys.
- Choose the higher-priority root during merge.
- Test empty-side split and merge.
- Test insertion at both key extremes.
- Test root, leaf, and absent deletion.
- Compare in-order traversal with a sorted model.
- Test `kth` at first and last ranks.
- Reject out-of-range ranks.
- Detect cycles and duplicate node identities in validators.
- Test deliberately monotone priorities for worst-case behavior.
- Avoid recursive implementations for hostile depth without safeguards.
- Keep random seed support for reproducible tests.
- Do not use predictable seeds as adversarial protection.
- Copy paths before mutation in persistent variants.
- Push lazy tags before positional descent.
- Update aggregates after lazy child changes.
- Separate structural priority from domain priority.
- Use Cartesian construction for sorted bulk input when useful.
- Benchmark pointer locality against flat containers.
- Prefer deterministic balanced trees for strict latency bounds.
- Use coarse synchronization before attempting fine-grained concurrency.
- Reclaim persistent nodes only after old readers finish.
- Version serialization with priority and comparator rules.
- Keep mutable keys out of ordered nodes.
- Include augmentation fields in memory estimates.
- Property-test split followed by merge reconstructs order.
- Property-test deletion preserves every other key.
- State expected and worst-case bounds separately.

## 8. Frequently Asked Questions

### Why is it called a treap?

It combines a search **tree** ordered by keys with a binary **heap** ordered by priorities.

### What keeps it balanced?

Independent random priorities make its shape distributed like a randomly built BST, giving expected logarithmic height.

### Is height always logarithmic?

No.
Worst-case height is linear; the logarithmic guarantee is expected under the priority model.

### What does split return?

Under this article's convention, it returns one treap with keys below the boundary and one with keys at least the boundary.

### What precondition does merge require?

Every key in the left treap must be less than every key in the right treap.

### How is deletion performed?

Find the node and replace it with the merge of its left and right subtrees, which already satisfy the merge key precondition.

### What is an implicit treap?

It uses subtree sizes and in-order rank as sequence position instead of storing an explicit search key.

### Can treaps be persistent?

Yes.
Copy nodes along split and merge paths and share unchanged immutable subtrees between versions.

### How are priority collisions handled?

Use a larger random domain or pair the random value with a unique serial so structural priority is strictly ordered.

### Are treaps safe against adversarial keys?

Only when priorities remain independent and unpredictable enough for the threat model.
A deterministic balanced tree offers stronger worst-case protection.

### Why store subtree sizes?

They enable rank, `kth`, positional split, and sequence augmentation while adding constant update work per visited node.

### When should a treap be chosen?

Choose it when expected bounds are acceptable and simple split, merge, persistence, or sequence augmentation is more valuable than deterministic worst-case height.
