# Skip Lists: Random Towers, Ordered Levels & Expected Logarithmic Search

![Skip list promoted levels](/images/dsa/skip-lists-dark.jpg#dark)

## 1. Historical Context & Motivation

A sorted linked list supports ordered iteration but linear search.

A skip list adds sparse express lanes above the base list.

Every key appears at level zero.

A random subset is promoted to level one.

Smaller subsets continue to higher levels.

Search moves right while the next key remains below the target.

When no safe right move remains, it drops one level.

The shape resembles several linked lists stacked by decreasing density.

William Pugh introduced skip lists in 1989.

Random promotion replaces deterministic tree rotations.

Expected search, insertion, and deletion time is logarithmic.

Worst-case shape can still be a plain linked list.

Probability makes that event unlikely under standard independent promotion.

Skip lists are attractive for concurrent ordered indexes.

Updates change a local set of forward pointers rather than rotating a tree.

That does not make concurrency trivial.

Memory reclamation and atomic publication remain difficult.

The base level defines the authoritative sorted set.

Higher levels are acceleration indexes.

Every high-level link must skip only keys already present below.

Promotion probability `p` controls height and memory.

With `p = 1/2`, about half the nodes reach level one.

About one quarter reach level two.

Expected pointers per node remain constant.

A maximum level bounds allocation and search arrays.

Duplicate-key behavior needs an explicit policy.

A set can reject duplicates.

A map can replace values.

A multimap can order equal-key records by an additional sequence number.

This article implements a map with value replacement.

The random generator is injected for reproducible tests.

The central proof follows the geometric distribution of tower heights.

## 2. Core Mathematical Invariants

### Level-zero ordering

Level zero contains every stored key exactly once.

Following forward pointers yields strictly increasing keys.

The header sentinel precedes every valid key.

No ordinary node precedes the header.

### Tower invariant

A node with height `h` participates in levels `0` through `h`.

Participation is contiguous downward.

A node cannot appear at level three while missing level two.

Its forward array length is `h+1`.

### Subsequence invariant

Every level `l+1` is a subsequence of level `l`.

Keys maintain the same sorted relative order across levels.

Higher links never introduce keys absent from level zero.

### Search-path invariant

At each level, current key is less than target.

Every skipped key behind current is also less than target.

Move right while the next key is less than target.

Dropping a level preserves the best known predecessor.

After level zero, `current.forward[0]` is the first key not less than target.

### Update-array invariant

During insertion search, `update[l]` stores the final predecessor at level `l`.

If a new node reaches level `l`, splice it after `update[l]`.

Its forward pointer receives the predecessor's former successor.

Then the predecessor points to the new node.

All other links remain unchanged.

### Random height distribution

Start every node at level zero.

Promote once with probability `p`, independently at each step.

Then:

$$
\Pr[level\ge k]=p^k.
$$

Expected nodes at level `k` are $np^k$.

The expected useful maximum height is logarithmic in base `1/p`.

### Expected pointer count

Expected levels per node are:

$$
\sum_{k\ge0}\Pr[level\ge k]=\sum_{k\ge0}p^k=\frac{1}{1-p}.
$$

For `p = 1/2`, the expectation is two forward pointers per node.

### Deletion invariant

Find predecessors exactly as for insertion.

For every level containing target, bypass it.

Levels above target height cannot reference target.

After deletion, trim empty top levels from the list's current level.

Level zero still contains every remaining key once.

### Maximum-level invariant

No generated tower exceeds configured maximum.

The header owns forward slots through that maximum.

All array accesses use levels available on the relevant node.

## 3. Step-by-Step Execution Trace

Use keys `[10,20,30,40,50]` with predetermined tower levels.

Let `10` have level zero.

Let `20` have level two.

Let `30` have level zero.

Let `40` have level one.

Let `50` have level three.

Level three is `HEAD -> 50`.

Level two is `HEAD -> 20 -> 50`.

Level one is `HEAD -> 20 -> 40 -> 50`.

Level zero is `HEAD -> 10 -> 20 -> 30 -> 40 -> 50`.

Search for key `30`.

Start at header on level three.

Next key is `50`, which is greater than target.

Drop to level two without moving right.

Next key is `20`, which is less than `30`.

Move right to node `20`.

Next level-two key is `50`, too large.

Drop to level one at node `20`.

Next key is `40`, too large.

Drop to level zero.

Next key is `30`, not less than target.

Stop horizontal movement.

Advance once at level zero and compare equality.

Key `30` is found.

### Absent search trace

Search for `35` follows the same top path to `20`.

At level zero, move from `20` to `30` because `30 < 35`.

Next key is `40`, which is not less than target.

The candidate is `40`, not `35`.

Report absence and insertion predecessor `30`.

### Insertion trace

Insert key `35` with generated level one.

Search records `update[3] = HEAD`.

At level two, predecessor becomes `20`.

At level one, predecessor remains `20` because next is `40`.

At level zero, predecessor becomes `30`.

At level zero, set new forward to `40` and `30.forward` to new node.

At level one, set new forward to `40` and `20.forward` to new node.

New key appears in both levels while preserving order.

### Deletion trace

Delete key `20`, whose level is two.

Predecessors at levels zero through two are all header or `10` as appropriate.

Bypass `20` on each participating level.

Level two becomes `HEAD -> 50`.

Level one becomes `HEAD -> 35 -> 40 -> 50`.

Level zero becomes `HEAD -> 10 -> 30 -> 35 -> 40 -> 50`.

No higher level referenced `20`.

## 4. Production-Ready Implementations

The following Python map uses bounded geometric promotion.

```python
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Generic, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")


@dataclass(slots=True)
class _Node(Generic[K, V]):
    key: Optional[K]
    value: Optional[V]
    forward: list[Optional[_Node[K, V]]]


class SkipListMap(Generic[K, V]):
    def __init__(self, max_level: int = 24, probability: float = 0.5, seed: int | None = None) -> None:
        if max_level < 0:
            raise ValueError("maximum level cannot be negative")
        if not 0.0 < probability < 1.0:
            raise ValueError("probability must lie strictly between zero and one")
        self.max_level = max_level
        self.probability = probability
        self.level = 0
        self.header: _Node[K, V] = _Node(None, None, [None] * (max_level + 1))
        self.rng = random.Random(seed)

    def _random_level(self) -> int:
        level = 0
        while level < self.max_level and self.rng.random() < self.probability:
            level += 1
        return level

    def get(self, key: K) -> V:
        current = self.header
        for level in range(self.level, -1, -1):
            while current.forward[level] is not None and current.forward[level].key < key:  # type: ignore[operator]
                current = current.forward[level]  # type: ignore[assignment]
        candidate = current.forward[0]
        if candidate is None or candidate.key != key:
            raise KeyError(key)
        return candidate.value  # type: ignore[return-value]

    def put(self, key: K, value: V) -> None:
        update = [self.header] * (self.max_level + 1)
        current = self.header
        for level in range(self.level, -1, -1):
            while current.forward[level] is not None and current.forward[level].key < key:  # type: ignore[operator]
                current = current.forward[level]  # type: ignore[assignment]
            update[level] = current

        candidate = current.forward[0]
        if candidate is not None and candidate.key == key:
            candidate.value = value
            return

        node_level = self._random_level()
        if node_level > self.level:
            for level in range(self.level + 1, node_level + 1):
                update[level] = self.header
            self.level = node_level

        node = _Node(key, value, [None] * (node_level + 1))
        for level in range(node_level + 1):
            node.forward[level] = update[level].forward[level]
            update[level].forward[level] = node

    def delete(self, key: K) -> None:
        update = [self.header] * (self.max_level + 1)
        current = self.header
        for level in range(self.level, -1, -1):
            while current.forward[level] is not None and current.forward[level].key < key:  # type: ignore[operator]
                current = current.forward[level]  # type: ignore[assignment]
            update[level] = current
        target = current.forward[0]
        if target is None or target.key != key:
            raise KeyError(key)
        for level in range(len(target.forward)):
            if update[level].forward[level] is target:
                update[level].forward[level] = target.forward[level]
        while self.level > 0 and self.header.forward[self.level] is None:
            self.level -= 1
```

The code replaces values for duplicate keys.

The seed supports deterministic structural tests.

Do not use predictable randomness for adversarially exposed structures without reviewing the threat model.

The implementation is not thread-safe.

Concurrent skip lists need atomic links, logical deletion, and safe reclamation.

Production code should reduce typing ignores through a dedicated sentinel key strategy.

Property tests can compare contents with a trusted sorted dictionary model.

## 5. Asymptotic Time & Space Complexity

Expected tower height is $O(\log_{1/p} n)$.

Expected search time is $O(\log n)$.

Expected insertion time is $O(\log n)$ including predecessor search.

Expected deletion time is $O(\log n)$.

Worst-case time for each operation is $O(n)$.

That worst case occurs when promotions produce an unhelpful shape.

Expected pointers per node are $1/(1-p)$.

Expected total storage is therefore $O(n)$ for fixed `p < 1`.

The header stores `max_level + 1` pointers.

Insertion uses an update array of $O(max\_level)$ space.

With maximum chosen as $O(\log n)$, operation workspace is logarithmic.

Fixed configured maximum makes it constant relative to runtime `n`, but imposes a scale ceiling on useful levels.

Ordered iteration follows level zero in $O(n)$ time.

Range scan after locating its lower bound takes $O(\log n+k)$ expected time for `k` outputs.

Promotion generation has expected constant iterations:

$$
\mathbb{E}[levels]=\frac{1}{1-p}.
$$

Smaller `p` reduces pointers but increases horizontal travel.

Larger `p` increases index density and memory.

The practical optimum depends on cache, key size, and workload.

Balanced trees provide deterministic logarithmic worst-case operations.

Skip lists trade that guarantee for simpler randomized structure.

## 6. Systems Connections

LevelDB uses a skip list for its in-memory ordered table.

The structure supports inserts and ordered iteration before immutable flushing.

Redis sorted sets historically combine multiple structures including skip-list indexing.

Concurrent ordered maps use skip-list designs because pointer updates are local.

Java provides a concurrent skip-list map with sorted-map semantics.

Lock-free implementation still requires careful linearization points.

Logical deletion can precede physical unlinking.

Readers may encounter marked nodes and help complete cleanup.

Memory cannot be reclaimed while another thread can still reference a node.

Garbage-collected runtimes simplify reclamation but not atomic ordering.

LSM storage engines use the base level for range iteration.

Higher levels accelerate point lookup and starting-position search.

Deterministic skip lists derive height from key hashes or positions.

That can aid reproducibility but changes adversarial assumptions.

Indexed skip lists augment links with spans to support rank queries.

Every insertion then updates both pointers and distance metadata.

Persistent skip lists can path-copy changed links but are less common than persistent trees.

Network routing and layered indexes use similar sparse-forward-link ideas.

The essential systems trade-off is local update simplicity versus probabilistic shape.

### Probability and height tuning

The promotion probability controls both tower height and pointer density.
With $p=1/2$, each node has about two forward pointers in expectation.
With $p=1/4$, towers are shorter and use fewer pointers, but level-zero searches travel farther between promoted nodes.
A maximum level caps pathological random towers and simplifies fixed-array node layouts.
Choose it from an expected capacity rather than an arbitrary small constant.
For capacity $N$ and promotion probability $p$, a practical scale is logarithmic in base $1/p$.
The cap does not replace randomness; it only bounds representation size.
Changing probability after construction creates a mixed distribution.
That can remain correct but invalidates simple performance expectations.
Rebuilding is cleaner when tuning changes materially.
A deterministic random seed is useful in tests.
Production structures should not rely on predictable randomness for adversarial resistance unless their threat model permits it.
Skip-list correctness never depends on a balanced random outcome.
Only expected efficiency does.
An unlucky run can create a near-linked-list shape.
Latency-sensitive systems may need tail bounds, rebuilding policy, or a worst-case balanced tree instead.
Memory accounting should count every forward slot, not only nodes.
Object headers and separately allocated pointer arrays can dominate small keys.
Compact contiguous node layouts improve locality but complicate variable-height allocation.
Arena allocation can reduce fragmentation when node lifetimes align.
Deletion must still retire nodes safely under concurrent readers.

## 7. Practice Checklist

- Keep every key on level zero.
- Keep higher levels as sorted subsequences.
- Ensure tower participation is contiguous downward.
- Define duplicate-key behavior.
- Use strict key ordering during predecessor search.
- Record one predecessor per active level.
- Splice the new node at every tower level.
- Preserve predecessor's old successor.
- Bound random levels by maximum.
- Validate probability strictly between zero and one.
- Inject random state for deterministic tests.
- Avoid reseeding on every insertion.
- Trim empty top levels after deletion.
- Bypass a deleted node on every level it owns.
- Test empty and singleton lists.
- Test ascending and descending insertion order.
- Test value replacement for duplicate keys.
- Test deletion at first, middle, and final positions.
- Verify level-zero order and uniqueness.
- Verify every higher key appears below.
- Verify every forward link increases key order.
- Compare operations with a trusted map.
- Separate expected from worst-case complexity.
- Measure pointer overhead at the chosen probability.
- Define concurrency linearization points.
- Use safe memory reclamation for lock-free deletion.
- Document adversary visibility into random choices.
- Support range iteration from a lower-bound search.
- Keep augmented spans synchronized if rank queries are added.
- Log seeds only when they are not security-sensitive.

## 8. Frequently Asked Questions

### Why is it called a skip list?

Higher levels skip over many base-level nodes during search.

### Are operations guaranteed logarithmic?

They are expected logarithmic under the random-height model.

Worst-case time is linear.

### Does every key appear at every level?

No.

Every key appears at level zero, and random promotion selects higher participation.

### Why use an update array?

Insertion and deletion need the predecessor link at every affected level.

### How much memory does it use?

Expected memory is linear, with expected pointers per node $1/(1-p)$.

### Is it easier than a red-black tree?

The update cases are often simpler, though randomized analysis and concurrency remain subtle.

### Can it support duplicates?

Yes under an explicit multimap policy or composite key.

### Is it thread-safe naturally?

No.

Concurrent implementations require atomic algorithms and reclamation rules.

### What should `p` be?

One half is common; lower values reduce memory and higher values add express links.

### What is the central invariant?

Every level is a sorted subsequence of the complete sorted level below it.
