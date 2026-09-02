# AVL vs. Red-Black Trees: Balance Invariants, Rotation Pressure & Selection Trade-offs

AVL and red-black trees solve the same structural failure: an ordinary binary search tree can degrade into a chain under ordered updates.

They do not enforce the same notion of balance.

AVL trees bound the height difference at every node, producing a tighter shape and more eager rotations.

Red-black trees encode a looser black-height invariant, permitting taller local shapes while limiting update repair.

Choosing between them requires understanding those contracts rather than memorizing that both operations are $O(\log n)$.

## 1. Historical Context & Motivation

### The unbalanced search-tree failure

A binary search tree orders keys so that every key in a node's left subtree is smaller and every key in its right subtree is larger under a strict-key policy.

Search follows one child per comparison.

Its cost is proportional to tree height $h$.

If keys `1,2,3,4,5,6` are inserted without balancing, every node becomes a right child.

The height is $6$ rather than approximately $\log_2 6$.

Search, insertion, and deletion then take $\Theta(n)$ time in the worst case.

The ordering invariant alone does not control shape.

### AVL trees made height balance explicit

Georgy Adelson-Velsky and Evgenii Landis published [*An Algorithm for Organization of Information*](https://www.mathnet.ru/php/archive.phtml?jrnid=dan&option_lang=eng&paperid=26964&wshow=paper) in 1962.

Their structure augments the search-tree invariant with a local height condition.

After an update, rotations restore that condition near the modified path.

The result guarantees logarithmic height.

AVL balance is strict enough that successful lookups often traverse fewer levels than in a red-black tree storing the same number of keys.

That strictness can require more repair during deletion and can update height metadata along the search path.

### The dichromatic view

Rudolf Bayer's symmetric binary B-tree work led to a binary encoding of multiway balance.

Leonidas Guibas and Robert Sedgewick developed the red-and-black framework in their 1978 paper [*A Dichromatic Framework for Balanced Trees*](https://sedgewick.io/wp-content/themes/sedgewick/papers/1978Dichromatic.pdf).

A color bit groups red-linked nodes conceptually into multi-key nodes while black levels correspond to the multiway tree's height.

The color rules constrain every root-to-leaf path without requiring sibling subtree heights to differ by at most one.

The looser shape bound usually means fewer rotations during mixed update workloads.

### The comparison is about workload, not a universal winner

Both structures provide worst-case logarithmic search, insertion, and deletion.

That shared asymptotic row hides useful differences:

- AVL has a tighter maximum height;
- red-black stores one color bit rather than an exact or encoded height/balance value;
- AVL insertion may need one single or double rotation at the first unbalanced ancestor;
- AVL deletion may propagate height decreases and rebalance multiple ancestors;
- red-black insertion and deletion use color changes plus bounded local rotations under standard algorithms;
- exact implementation complexity and constants depend on the chosen variant.

A read-heavy in-memory index can value AVL's shallower searches.

A mutation-heavy ordered map can value red-black's relaxed balance and established library implementations.

Measured cache behavior, allocator choice, key comparison cost, and concurrency strategy can outweigh a one-level height difference.

### What this article compares

The comparison assumes:

- one unique key per node;
- a strict weak ordering;
- parent/child links form a finite tree;
- subtree metadata is updated with structural changes;
- empty children act as black leaves in the red-black model.

Duplicate keys need an explicit policy such as replacement, a count, a bucket, or a deterministic side.

Silently switching duplicate policy breaks ordering proofs and API expectations.

## 2. Core Mathematical Invariants

### Shared binary-search invariant

For node $v$ with key $k(v)$, every key $x$ in its left subtree satisfies

$$
x<k(v),
$$

and every key $y$ in its right subtree satisfies

$$
k(v)<y.
$$

This must hold recursively.

Checking only immediate children is insufficient.

A node in the right child's left subtree can still be smaller than the root.

A validator should carry lower and upper bounds through recursion.

Rotations preserve in-order key order because they rearrange local parent relationships without changing the in-order sequence.

### Height convention

Define the empty subtree height as $0$ and a leaf height as $1$.

Then

$$
h(v)=1+\max(h(v.left),h(v.right)).
$$

Other conventions use empty height $-1$ and leaf height $0$.

Either works if every formula and stored field follows the same convention.

Mixing conventions produces false imbalance reports and incorrect metadata.

### AVL balance factor

Define

$$
BF(v)=h(v.left)-h(v.right).
$$

The AVL invariant requires

$$
BF(v)\in\{-1,0,1\}
$$

for every node.

After insertion, walk back toward the root, recompute heights, and identify the first ancestor with $|BF|=2$.

The direction of the heavy child and grandchild selects one of four cases:

| Case | Heavy path | Repair |
| --- | --- | --- |
| LL | left then left | right rotation |
| RR | right then right | left rotation |
| LR | left then right | left child rotation, then right rotation |
| RL | right then left | right child rotation, then left rotation |

The labels describe the insertion path from the unbalanced node, not rotation directions.

### Why AVL height is logarithmic

Let $N(h)$ be the minimum number of nodes in an AVL tree of height $h$ under the empty-height-zero convention.

The sparsest valid height-$h$ tree has child heights $h-1$ and $h-2$.

Therefore

$$
N(h)=1+N(h-1)+N(h-2),
$$

with $N(0)=0$ and $N(1)=1$.

This recurrence grows like Fibonacci numbers.

Consequently $N(h)$ grows exponentially in $h$, so

$$
h=O(\log n).
$$

A commonly cited tighter bound is roughly $h\le1.44\log_2(n+2)$ up to additive constants under standard conventions.

The recurrence, rather than the decimal constant, is the important proof mechanism.

### AVL rotation invariants

A rotation must preserve:

- the binary-search ordering;
- every existing key exactly once;
- connectivity of the rotated subtree to its former parent;
- child-parent links when parent pointers exist;
- correct height metadata bottom-up;
- the balance condition after the selected repair.

For a right rotation at `z` with left child `y`, `y.right` becomes `z.left`, then `z` becomes `y.right`.

The transferred subtree contains keys between `y` and `z`, so it remains valid in its new position.

Metadata for `z` must be updated before metadata for `y` because `y`'s new height depends on `z`'s new height.

### Red-black color invariants

One standard formulation requires:

1. every node is red or black;
2. the root is black;
3. every conceptual null leaf is black;
4. a red node has no red child;
5. every path from a node to descendant null leaves contains the same number of black nodes.

The final quantity is the node's **black height**.

Some texts count the current node, some exclude it, and some include the terminal null leaf.

The equality invariant survives those convention choices when used consistently.

### Why red-black height is logarithmic

Collapse each red node into its black parent conceptually.

Because red nodes cannot have red children, at most one red node occurs between consecutive black nodes on a path.

Every root-to-null path has the same black height.

Therefore the longest path is at most twice the shortest path in node levels.

A subtree of black height $b$ contains at least $2^b-1$ internal nodes under the usual counting convention.

Thus a red-black tree with $n$ nodes has height bounded by

$$
h\le2\log_2(n+1).
$$

This bound is looser than AVL's, but it remains logarithmic.

### Red-black insertion repair

Insert the key as in an ordinary BST and color the new node red.

Red avoids immediately changing black height.

If the parent is black, all invariants already hold.

If the parent is red, the no-red-red invariant is violated.

Let the parent's sibling relative to the grandparent be the uncle.

If the uncle is red, recolor parent and uncle black and grandparent red, then continue from the grandparent.

If the uncle is black, one or two rotations align and elevate the parent, accompanied by recoloring.

Finally force the root black.

Color flips can propagate upward without rotating at every level.

### Red-black deletion invariant

Deleting a red leaf does not change black height.

Deleting a black node can remove one black unit from paths through its replacement.

Standard repair treats that replacement position as carrying an extra black deficit.

Sibling color and sibling-child colors determine whether repair recolors, rotates, or propagates upward.

Deletion code is where sentinel policy, parent links, and color conventions most often collide.

Use a proved variant consistently rather than mixing cases from different formulations.

### Metadata cost comparison

AVL nodes need enough information to recover balance, commonly an exact height or a balance factor.

A balance factor can be encoded in a few states, but implementations may store a machine integer for convenience.

Red-black nodes need a color bit logically, though structure padding can make the physical overhead larger than one bit.

Some implementations encode color in a pointer tag when alignment safely leaves low bits unused.

That is a representation optimization with portability and tooling consequences.

### Rank and augmentation invariants

Either tree can be augmented with subtree size, sum, maximum, interval endpoint, or another associative summary.

For subtree size,

$$
size(v)=1+size(v.left)+size(v.right).
$$

Every rotation must repair the augmentation for affected nodes in dependency order.

Balancing correctness does not automatically preserve application metadata.

An order-statistics query is only as correct as the size fields maintained during updates.

## 3. Step-by-Step Execution Trace

### Shared insertion sequence

Insert unique keys in this order:

```text
1, 2, 3, 4, 5, 6
```

The sequence is deliberately sorted.

An unbalanced BST would become a six-node right chain.

Tracing both balanced trees shows where their policies diverge.

### Insert `1`

AVL creates a leaf `1` of height $1$.

Its balance factor is $0$.

Red-black creates `1` red, then forces the root black.

Both shapes are:

```text
1
```

Red-black color is `1B`.

### Insert `2`

BST ordering places `2` as the right child of `1`.

AVL heights are `h(2)=1` and `h(1)=2`.

The root balance factor is $0-1=-1$, still valid.

Red-black colors new node `2R`.

Its parent `1B` is black, so no repair is required.

Both shapes are:

```text
1
 `- 2
```

### Insert `3`: both rotate

The ordinary BST path is `1 -> 2 -> 3`.

AVL computes $BF(1)=-2$ with a right-right heavy path.

A left rotation at `1` produces:

```text
   2
  / \
 1   3
```

All three AVL balance factors become zero.

Red-black inserts `3R` under parent `2R`.

The uncle is a black null leaf.

This is the aligned right-right case.

Rotate left at grandparent `1`, color `2` black, and color `1` red.

The red-black tree is:

```text
   2B
  /  \
 1R  3R
```

The shapes still match.

### Insert `4`: red-black recolors, AVL accepts

AVL places `4` as the right child of `3`.

Node `3` has balance $-1$ and root `2` has balance $-1$.

No AVL rotation occurs.

Red-black inserts `4R` under `3R`.

Parent `3R` and uncle `1R` are both red.

Recolor `1` and `3` black, color grandparent `2` red, then force root `2` black.

The common shape is:

```text
   2
  / \
 1   3
      \
       4
```

Red-black colors are `2B`, `1B`, `3B`, `4R`.

### Insert `5`: local rotation under both policies

AVL inserts `5` to the right of `4`.

Node `3` becomes right-right heavy with balance $-2$.

Rotate left at `3`.

The AVL tree becomes:

```text
    2
   / \
  1   4
     / \
    3   5
```

Red-black inserts `5R` under `4R`.

The uncle is a black null leaf.

Rotate left at `3`, color `4` black, and color `3` red.

It obtains the same shape with colors:

```text
    2B
   /  \
  1B   4B
      /  \
     3R  5R
```

### Insert `6`: the policies diverge

AVL inserts `6` as the right child of `5`.

Subtree rooted at `4` has height $3$.

Root `2` has left height $1$ and right height $3$.

Its balance factor becomes $-2$.

The heavy path is right-right, so rotate left at `2`.

Final AVL tree:

```text
       4
      / \
     2   5
    / \   \
   1   3   6
```

Its height is $3$.

Red-black inserts `6R` under `5R`.

Parent `5R` and uncle `3R` are red.

Recolor `3` and `5` black and color `4` red.

Parent of `4R` is root `2B`, so repair stops without rotation.

Final red-black tree:

```text
   2B
  /  \
 1B   4R
     /  \
    3B  5B
          \
           6R
```

Its height is $4$.

### Verify AVL invariants

The in-order sequence is `1,2,3,4,5,6`.

At root `4`, left height is $2$ and right height is $2$.

At node `2`, both children have height $1$.

At node `5`, left height is $0$ and right height is $1$.

Every balance factor lies in `{-1,0,1}`.

### Verify red-black invariants

The in-order sequence is also `1,2,3,4,5,6`.

Root `2` is black.

Red node `4` has black children `3` and `5`.

Red node `6` has black null children.

Each root-to-null path has three black nodes if root and terminal null are counted:

```text
2B -> 1B -> NIL
2B -> 4R -> 3B -> NIL
2B -> 4R -> 5B -> NIL
2B -> 4R -> 5B -> 6R -> NIL
```

The red-black tree is taller but valid.

### What the trace proves about the trade-off

Both policies prevented a six-node chain.

AVL performed an additional root rotation after inserting `6` because local subtree heights differed by two.

Red-black accepted the extra level because black heights remained equal and no red node had a red child.

This is the operational difference behind “AVL is more strictly balanced.”

It is not a claim that every AVL tree is shorter than every red-black tree of the same keys and insertion order.

It is a stronger worst-case shape constraint.

## 4. Production-Ready Implementations

### An invariant auditor rather than another partial map

A comparison article should not disguise insertion-only demonstration code as a complete ordered map.

The implementation below is a reusable tree auditor.

It validates global BST ordering, detects cycles/shared nodes, checks stored AVL heights, checks red-black colors, and returns structural metrics.

Such an auditor is useful in tests, debug builds, import validation, and differential testing of any mutation implementation.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Color = Literal["red", "black"]


@dataclass
class Node:
    key: int
    left: Node | None = None
    right: Node | None = None
    height: int = 1
    color: Color = "black"


@dataclass(frozen=True)
class TreeMetrics:
    size: int
    height: int
    black_height: int | None = None


def _check_order(key: int, lower: int | None, upper: int | None) -> None:
    if lower is not None and key <= lower:
        raise ValueError(f"key {key} violates lower bound {lower}")
    if upper is not None and key >= upper:
        raise ValueError(f"key {key} violates upper bound {upper}")


def validate_avl(root: Node | None) -> TreeMetrics:
    seen: set[int] = set()

    def visit(
        node: Node | None,
        lower: int | None,
        upper: int | None,
    ) -> tuple[int, int]:
        if node is None:
            return 0, 0

        identity = id(node)
        if identity in seen:
            raise ValueError("tree contains a cycle or shared child")
        seen.add(identity)
        _check_order(node.key, lower, upper)

        left_size, left_height = visit(node.left, lower, node.key)
        right_size, right_height = visit(node.right, node.key, upper)
        expected_height = 1 + max(left_height, right_height)

        if node.height != expected_height:
            raise ValueError(
                f"key {node.key} stores height {node.height}, "
                f"expected {expected_height}"
            )
        if abs(left_height - right_height) > 1:
            raise ValueError(
                f"key {node.key} has AVL balance "
                f"{left_height - right_height}"
            )

        return 1 + left_size + right_size, expected_height

    size, height = visit(root, None, None)
    return TreeMetrics(size=size, height=height)


def validate_red_black(root: Node | None) -> TreeMetrics:
    if root is not None and root.color != "black":
        raise ValueError("red-black root must be black")

    seen: set[int] = set()

    def visit(
        node: Node | None,
        lower: int | None,
        upper: int | None,
    ) -> tuple[int, int, int]:
        if node is None:
            return 0, 0, 1  # conceptual NIL contributes one black

        identity = id(node)
        if identity in seen:
            raise ValueError("tree contains a cycle or shared child")
        seen.add(identity)
        _check_order(node.key, lower, upper)

        if node.color not in ("red", "black"):
            raise ValueError(f"key {node.key} has invalid color")
        if node.color == "red":
            if node.left is not None and node.left.color == "red":
                raise ValueError(f"red key {node.key} has red left child")
            if node.right is not None and node.right.color == "red":
                raise ValueError(f"red key {node.key} has red right child")

        left_size, left_height, left_black = visit(
            node.left,
            lower,
            node.key,
        )
        right_size, right_height, right_black = visit(
            node.right,
            node.key,
            upper,
        )

        if left_black != right_black:
            raise ValueError(
                f"key {node.key} has black heights "
                f"{left_black} and {right_black}"
            )

        black_height = left_black + (node.color == "black")
        return (
            1 + left_size + right_size,
            1 + max(left_height, right_height),
            black_height,
        )

    size, height, black_height = visit(root, None, None)
    return TreeMetrics(
        size=size,
        height=height,
        black_height=black_height,
    )
```

### Construct and validate the traced trees

```python
avl = Node(
    4,
    left=Node(2, left=Node(1), right=Node(3), height=2),
    right=Node(5, right=Node(6), height=2),
    height=3,
)

red_black = Node(
    2,
    left=Node(1, color="black"),
    right=Node(
        4,
        left=Node(3, color="black"),
        right=Node(
            5,
            right=Node(6, color="red"),
            color="black",
        ),
        color="red",
    ),
    color="black",
)

assert validate_avl(avl) == TreeMetrics(size=6, height=3)
assert validate_red_black(red_black) == TreeMetrics(
    size=6,
    height=4,
    black_height=3,
)
```

### Reject structures that look locally plausible

```python
def expect_invalid(check, root: Node, message_fragment: str) -> None:
    try:
        check(root)
    except ValueError as error:
        assert message_fragment in str(error)
    else:
        raise AssertionError("invalid tree was accepted")


# Key 9 is below 12 but illegally lies in root 10's right subtree.
bad_order = Node(10, right=Node(12, left=Node(9), height=2), height=3)
expect_invalid(validate_avl, bad_order, "lower bound")

# Stored heights claim balance that the computed structure does not have.
bad_avl = Node(
    1,
    right=Node(2, right=Node(3), height=2),
    height=3,
)
expect_invalid(validate_avl, bad_avl, "AVL balance")

# Root-to-NIL black counts differ across the two branches.
bad_black_height = Node(
    2,
    left=Node(1, color="black"),
    right=Node(3, color="red"),
    color="black",
)
expect_invalid(validate_red_black, bad_black_height, "black heights")

# A shared node is not a tree even if its key seems reachable twice.
shared = Node(1)
bad_alias = Node(2, left=shared, right=shared)
expect_invalid(validate_red_black, bad_alias, "cycle or shared child")
```

The alias fixture reaches the same object from a second parent and is rejected by identity tracking.

A separate cycle fixture can exercise identity detection directly.

```python
cycle = Node(1)
cycle.right = cycle
expect_invalid(validate_red_black, cycle, "cycle or shared child")
```

### Why bounds are propagated

Comparing a node only with its children misses deep ordering errors.

The recursive lower bound represents every ancestor that requires the current key to be larger.

The upper bound represents every ancestor that requires it to be smaller.

Each left descent tightens the upper bound to the parent key.

Each right descent tightens the lower bound.

This validates the global BST invariant in one traversal.

### Why identity tracking matters

A malformed pointer structure can contain a cycle.

Naive recursion then never terminates.

Two parents can also share one child, forming a directed acyclic graph rather than a tree.

The `seen` set rejects both.

Production debug validation should fail clearly instead of exhausting the call stack.

### Recursive depth of the auditor

Valid balanced trees have logarithmic recursion depth.

The validator may receive an invalid chain whose depth is linear.

In environments with a small recursion limit, a production import validator should use an explicit stack.

The recursive version keeps the invariants visible for teaching and normal debug checks.

Do not run it on untrusted million-node malformed inputs without resource controls.

### Mutation implementation guidance

For an application map, prefer a mature standard-library or audited implementation unless custom augmentation is necessary.

A complete custom implementation must cover:

- insertion and duplicate policy;
- deletion of zero-, one-, and two-child nodes;
- rotations at the root and internal nodes;
- parent-link maintenance if present;
- metadata and augmentation repair;
- allocation failure and exception guarantees;
- iterators and invalidation;
- randomized differential tests against a reference ordered map.

Insertion-only code is not a production replacement for that surface.

## 5. Asymptotic Time & Space Complexity

### Search

Both structures follow one root-to-leaf path.

AVL height and red-black height are $O(\log n)$.

Therefore worst-case search is

$$
O(\log n)
$$

for both.

AVL's tighter height bound can reduce comparisons in the worst shape.

If key comparison is expensive, that difference may matter more than rotation cost.

If memory latency dominates, node placement may matter more than theoretical height.

### Insertion

Both first perform a BST search taking $O(\log n)$.

AVL updates height or balance metadata on the ancestor path.

Standard AVL insertion needs at most one single or double rotation at the first unbalanced ancestor, after which subtree height is restored for insertion.

A double rotation consists of two primitive rotations.

Red-black insertion may recolor along the ancestor path and uses a constant number of rotations in standard formulations.

Total insertion time remains

$$
O(\log n).
$$

### Deletion

Finding the deletion location and any successor takes $O(\log n)$.

AVL deletion can reduce subtree height and expose imbalance at multiple ancestors.

It may therefore perform $O(\log n)$ local rebalancing work and rotations in the worst case.

Standard red-black deletion also propagates a black-height deficit up the tree through recoloring cases, while its number of rotations is bounded by a constant for common algorithms.

Total deletion time is $O(\log n)$ for both.

Exact rotation counts depend on the specified variant.

### Minimum, maximum, predecessor, successor

Minimum follows left children to a leaf.

Maximum follows right children.

Predecessor and successor follow a child subtree or ancestors.

Each operation is $O(h)=O(\log n)$ in the worst case.

Maintaining explicit first/last pointers can make repeated endpoint access $O(1)$ while adding update obligations.

### Traversal

In-order traversal visits every node exactly once and returns sorted keys.

Its time is

$$
\Theta(n).
$$

Recursive auxiliary stack depth is $O(\log n)$ for a valid balanced tree.

Returning all keys requires $\Theta(n)$ output storage regardless of tree type.

### Build strategies

Inserting $n$ keys one by one costs $O(n\log n)$ in the worst case for either balanced tree.

If keys are already sorted and the entire set is known, a balanced BST can be built directly in $O(n)$ time by choosing recursive midpoints.

That bulk build avoids per-key rotations.

It must assign correct AVL heights or red-black colors for the constructed shape.

### Space

Both store $n$ nodes, so core space is $O(n)$.

Each node stores key/value payload, two child references, and balance metadata.

Parent pointers, allocator headers, alignment, augmentation, and object overhead often dwarf the logical difference between one color bit and a small balance field.

Measure actual bytes per node in the target implementation.

### Auditor complexity

The validators visit each reachable node once.

Hash-set operations are expected $O(1)$.

Validation time is expected $O(n)$ and identity-tracking space is $O(n)$.

Recursion uses $O(h)$ call frames.

Removing cycle detection would reduce auxiliary storage but make malformed input unsafe to traverse.

### Comparison table

| Property | AVL | Red-black |
| --- | --- | --- |
| Ordering | strict BST | strict BST |
| Balance metadata | height or balance factor | color |
| Local balance | child heights differ by at most 1 | equal black height; no red-red edge |
| Worst-case height | tighter, about $1.44\log_2 n$ plus constants | at most $2\log_2(n+1)$ |
| Search | $O(\log n)$ | $O(\log n)$ |
| Insert | $O(\log n)$ | $O(\log n)$ |
| Delete | $O(\log n)$ | $O(\log n)$ |
| Typical design bias | lookup-heavy | update-heavy/general ordered map |

The final row is a workload heuristic, not a theorem.

## 6. Systems Connections

### Ordered maps and sets

Balanced BSTs implement ordered dictionaries where callers need more than exact-key lookup.

They support lower bounds, upper bounds, predecessor, successor, and ordered iteration naturally.

A hash table may offer expected constant-time exact lookup but does not inherently preserve key order.

Library contracts often specify complexity and ordering without promising one internal tree variant.

Do not depend on node color or rotation behavior unless the API exposes it.

### Memory allocators and locality

Pointer-based trees allocate nodes separately unless a pool or arena is used.

Search follows data-dependent addresses, which can cause cache and translation misses.

A slightly shorter AVL path can help, but tightly packed B-trees may outperform both by storing several keys per cache-friendly node.

The binary-tree comparison is incomplete for disk and cache-sensitive indexes.

### Database indexes

Databases generally favor B-tree-family structures over binary trees because one storage-page read should branch across many keys.

Red-black trees can still appear in in-memory metadata, lock tables, schedulers, or per-page structures.

AVL can suit read-heavy in-memory indexes with predictable key order.

Durability, concurrency, and page layout are outside the guarantees of either bare tree.

### Interval and order-statistics trees

Augmenting a balanced tree turns it into a specialized index.

An interval tree stores a subtree maximum endpoint to prune overlap queries.

An order-statistics tree stores subtree sizes to answer rank and selection.

AVL and red-black rotations are local, so affected aggregates can be recomputed locally.

Forgetting augmentation repair produces queries that are wrong even while ordering and balance validators pass.

### Concurrent updates

Rotations modify multiple links and metadata fields.

A concurrent reader must not observe a partially applied rotation as if it were a stable tree.

Coarse locks are simple but limit parallelism.

Fine-grained locking, optimistic validation, copy-on-write, persistent trees, and read-copy-update techniques introduce additional invariants.

Replacing a mutex with atomic pointers does not make a rotation protocol correct.

### Persistent trees

An immutable balanced tree can create a new root while sharing unchanged subtrees.

An update copies $O(\log n)$ nodes along the search and repair path.

Old versions remain readable.

Rotations create new local nodes rather than mutating shared ones.

Reference management and allocator behavior become part of the complexity and memory model.

### Serialization and recovery

Serializing only in-order keys discards the existing shape but permits reconstruction.

Serializing shape and metadata allows exact recovery but requires validation before use.

The auditor in this article can detect ordering, balance, color, and alias corruption after decoding.

Untrusted serialized pointers or indices require bounds checks before links are formed.

### Choosing a tree in practice

Prefer the implementation whose complete behavior is understood and tested.

Measure:

- lookup/update ratio;
- successful and unsuccessful search depth;
- rotations and recolors per update;
- bytes per node;
- allocator time;
- cache misses;
- comparison cost;
- concurrency overhead.

Changing from red-black to AVL based only on theoretical height can be a net regression when allocation and locking dominate.

## 7. Practice Checklist

### Shared BST checks

- Define duplicate-key behavior.
- Carry global lower and upper bounds during validation.
- Verify in-order traversal is strictly sorted under the chosen policy.
- Test root replacement during rotation.
- Repair parent pointers for every moved subtree.
- Reject cycles and shared children in imported structures.
- Test minimum, maximum, predecessor, and successor.
- Differential-test key/value behavior against a reference ordered map.

### AVL checks

- Fix one height convention.
- Recompute child heights before the parent height.
- Verify every balance factor is `-1`, `0`, or `1`.
- Test LL, RR, LR, and RL insertion cases.
- Test deletion that rebalances more than one ancestor.
- Update augmented fields in rotation dependency order.
- Validate stored height against computed height.
- Test sorted insertion and reverse-sorted insertion.

### Red-black checks

- Represent conceptual null leaves consistently.
- Force the root black after insertion repair.
- Reject red nodes with red children.
- Compare left and right black heights at every node.
- Test red-uncle recoloring.
- Test inner and outer black-uncle insertion cases.
- Test deletion with red sibling, black sibling, and near/far red nephews.
- Do not mix sentinel assumptions from different algorithms.

### Comparative experiments

1. Insert sorted keys into both structures and record height after every update.
2. Insert random permutations and compare average successful search depth.
3. Run a lookup-heavy workload and measure comparisons.
4. Run an update-heavy workload and measure rotations and recolors.
5. Repeat with expensive string keys.
6. Repeat with a node-pool allocator.
7. Add subtree sizes and verify rank/select after every rotation.
8. Serialize, corrupt one invariant, and verify the auditor rejects it.

### Failure-focused tests

- A deep key that violates an ancestor bound but not its parent.
- Incorrect stored AVL height with an otherwise valid shape.
- AVL balance magnitude two.
- Red root.
- Red parent with red child.
- Unequal black-height paths.
- Child referenced by two parents.
- Direct and indirect cycles.
- Empty tree and one-node tree.
- Maximum supported node count and allocator failure.

### Selection questions

- Are lookups much more frequent than mutations?
- Is the key comparison more expensive than rotations?
- Are stable node addresses required?
- Is ordered range iteration required?
- Would a B-tree layout fit the cache or storage medium better?
- Is a mature library implementation available?
- Is custom augmentation worth owning deletion and concurrency complexity?
- Does worst-case latency matter more than average throughput?

## 8. Frequently Asked Questions

### Which tree is more balanced?

AVL is more strictly height-balanced.

Every node's child heights differ by at most one.

Red-black balance constrains black heights and red adjacency, allowing a taller valid shape.

### Are AVL searches always faster?

No.

AVL offers a tighter height bound and can reduce comparisons.

Actual time also depends on shape, key comparison, cache locality, allocation, branch prediction, and implementation quality.

### Do red-black trees always perform fewer rotations?

Standard red-black updates have favorable rotation bounds, especially deletion compared with AVL's possible upward cascade.

Exact counts depend on the algorithm variant and operation sequence.

Measure the implementation rather than turning a common tendency into an absolute statement.

### Why is a new red-black node inserted red?

Adding a red node does not increase black height on its root-to-leaf path.

It may create a red-red violation with its parent, which can be repaired locally through recoloring and rotation.

Inserting black would immediately unbalance black heights.

### Why can AVL deletion rebalance multiple ancestors?

Deletion can reduce a subtree's height.

After one repair, the repaired subtree may remain shorter than before, causing the parent to become unbalanced.

That height change can continue toward the root.

### Does a double rotation count as one rotation?

It is one named rebalancing case composed of two primitive rotations.

State which counting convention is used when comparing rotation statistics.

### Can either tree store duplicate keys?

Yes, with an explicit policy.

Options include replacing the value, storing a multiplicity, keeping a value bucket, or ordering by `(key, unique_id)`.

The strict-key invariants in this article reject duplicates intentionally.

### Why not use a hash table instead?

A hash table is strong for exact lookup under its assumptions.

Balanced trees additionally provide sorted iteration, range queries, predecessor/successor, and worst-case logarithmic operations.

Choose from required operations and adversarial guarantees.

### Are standard ordered maps always red-black trees?

Do not assume an internal representation unless the language or library contract specifies it.

Many implementations use red-black trees, but callers should rely on documented ordering, complexity, iterator, and invalidation guarantees.

### How is a red-black tree related to a 2-3-4 tree?

Red links can be interpreted as joining binary nodes into conceptual multi-key nodes.

Black levels correspond to levels in the multiway representation.

Equal black height expresses uniform multiway leaf depth.

### Can AVL or red-black trees be stored in arrays?

They can use index-based node pools rather than raw pointers.

Unlike a complete heap, their dynamic shapes do not map compactly through simple `2i+1` child formulas without gaps or relocation.

A pool can still improve locality and serialization.

### What should be validated after every custom update?

Validate global ordering, reachability without cycles, the structure's balance invariant, metadata, augmentation, and parent links.

Then compare observable map behavior with a trusted reference implementation over randomized operation sequences.

### When should AVL be preferred?

AVL is a reasonable candidate for lookup-heavy ordered indexes where tighter search depth matters and mutation cost is acceptable.

The decision should be confirmed against the actual key, allocator, and workload.

### When should red-black be preferred?

Red-black is a common general-purpose choice for mixed ordered-map workloads because its looser balance supports efficient updates with logarithmic guarantees.

Availability of a mature implementation is often more valuable than a theoretical micro-advantage.
