# Hash Collision Resolution: Chaining, Probing, Tombstones & Load-Factor Guarantees

![Hash collision resolution strategies](/images/dsa/collision-resolution-dark.jpg#dark)

## 1. Historical Context & Motivation

A hash table maps a large key domain into a finite array of slots.

Because the key domain is usually larger than the array, two distinct keys can map to the same slot.

That event is a collision.

Collisions are normal, not evidence that hashing failed.

Collision resolution determines whether lookup, insertion, and deletion remain correct after they occur.

Separate chaining stores a collection of entries at each array position.

Open addressing stores every entry in the array and searches alternative positions according to a probe rule.

The choice affects memory locality, deletion rules, resizing, worst-case behavior, and concurrency design.

Hash tables appear in dictionaries, symbol tables, caches, routing tables, deduplication sets, and compiler internals.

Their advertised constant-time operations are usually expected bounds.

They depend on a well-distributed hash function, bounded load factor, and an input model that does not force pathological collisions.

An attacker who can choose keys may deliberately create collisions.

Modern runtimes therefore may randomize hashes, cap chains, or change representations under collision stress.

Correctness starts before performance.

The hash function selects a starting bucket.

Key equality decides whether an encountered entry is the requested key.

These two functions must obey a compatibility law:

$$
x=y\implies hash(x)=hash(y).
$$

Equal keys with unequal hashes become unreachable through ordinary lookup.

The central question is:

How can a table preserve reachability of every stored key after collisions, updates, deletions, and resizing?

## 2. Core Mathematical Invariants

Let capacity be $M>0$ and let $h(k)$ return an integer hash.

The home index is:

$$
h(k)\bmod M.
$$

### Chaining invariant

Every live entry $(k,v)$ appears in exactly one chain: the chain at its home index.

Within that chain, equality determines whether a key is present.

Lookup computes the same home index and scans the complete chain.

Thus every stored key is reachable.

### Open-addressing reachability invariant

For key $k$, define a probe sequence:

$$
p(k,0),p(k,1),\ldots,p(k,M-1).
$$

An inserted key occupies one position in its own sequence.

Lookup visits the same sequence in the same order.

It may stop at a slot that has never been occupied.

It must not stop at a deleted slot because a later probe position may contain the target key.

### Linear probing invariant

For linear probing:

$$
p(k,i)=(h(k)+i)\bmod M.
$$

The sequence visits every slot exactly once when $i$ ranges from zero to $M-1$.

An insertion uses the first available empty or tombstone slot, unless it first encounters an equal key to update.

### Tombstone invariant

An open-addressing slot has three distinct states:

1. never used,
2. deleted tombstone,
3. live entry.

A tombstone is available for future insertion.

It is not proof that lookup may terminate.

Replacing a deleted slot with “empty” can make later colliding keys unreachable.

### Load-factor invariant

For $n$ live entries:

$$
\alpha=n/M.
$$

Open-addressing performance degrades as $\alpha$ approaches one.

Tables commonly resize before a selected threshold.

Tombstones also consume probe-path capacity, so a separate occupied count can trigger cleanup even when live load is moderate.

### Update invariant

Inserting an already present key changes its associated value without increasing entry count.

This keeps the table a map rather than a multimap.

### Resize invariant

Changing capacity changes every home index.

Entries must be reinserted into a new empty table using the new modulus.

Copying old physical slots directly breaks reachability.

## 3. Step-by-Step Execution Trace

Use capacity $M=7$ and linear probing.

Suppose keys `A`, `B`, and `C` all have home index 3.

Insert `A`.

Probe 3 is empty, so `A` occupies slot 3.

Insert `B`.

Probe 3 contains a different key.

Probe 4 is empty, so `B` occupies slot 4.

Insert `C`.

Probes 3 and 4 are occupied.

Probe 5 is empty, so `C` occupies slot 5.

The cluster is:

| Slot | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Value | empty | empty | empty | A | B | C | empty |

Delete `B`.

Slot 4 becomes a tombstone, not an empty slot.

Lookup for `C` probes 3, then tombstone 4, then finds `C` at 5.

If slot 4 had become empty, lookup would incorrectly stop there and report `C` absent.

Insert `D` with home index 3.

The probe sees occupied A, remembers tombstone 4, continues far enough to rule out a duplicate, and may reuse slot 4.

This example explains why lookup and insertion have related but not identical stopping rules.

### Chaining trace

With separate chaining, the same collision sequence makes bucket 3 contain:

$$
[(A,v_A),(B,v_B),(C,v_C)].
$$

Deleting `B` removes only its entry.

Lookup for `C` scans the remaining bucket chain and succeeds.

No tombstone state is needed because bucket traversal has no probe path to preserve.

## 4. Production-Ready Implementations

This compact linear-probing map uses a private tombstone sentinel and grows before high live load.

```python
from typing import Generic, TypeVar


Key = TypeVar("Key")
Value = TypeVar("Value")
_DELETED = object()


class LinearProbingMap(Generic[Key, Value]):
    def __init__(self, capacity: int = 8) -> None:
        if capacity < 2:
            raise ValueError("capacity must be at least two")
        self._slots: list[object | tuple[Key, Value] | None] = [None] * capacity
        self._size = 0
        self._used = 0

    def _find(self, key: Key) -> tuple[int, bool]:
        first_deleted: int | None = None
        capacity = len(self._slots)
        for offset in range(capacity):
            index = (hash(key) + offset) % capacity
            slot = self._slots[index]
            if slot is None:
                return (first_deleted if first_deleted is not None else index), False
            if slot is _DELETED:
                if first_deleted is None:
                    first_deleted = index
                continue
            stored_key, _ = slot
            if stored_key == key:
                return index, True
        if first_deleted is not None:
            return first_deleted, False
        raise RuntimeError("table has no available slot")

    def _rehash(self, capacity: int) -> None:
        old = self._slots
        self._slots = [None] * capacity
        self._size = self._used = 0
        for slot in old:
            if slot is not None and slot is not _DELETED:
                key, value = slot
                self[key] = value

    def __setitem__(self, key: Key, value: Value) -> None:
        if (self._used + 1) * 10 >= len(self._slots) * 7:
            self._rehash(len(self._slots) * 2)
        index, found = self._find(key)
        if not found:
            if self._slots[index] is None:
                self._used += 1
            self._size += 1
        self._slots[index] = (key, value)

    def __getitem__(self, key: Key) -> Value:
        index, found = self._find(key)
        if not found:
            raise KeyError(key)
        slot = self._slots[index]
        assert slot is not None and slot is not _DELETED
        return slot[1]

    def __delitem__(self, key: Key) -> None:
        index, found = self._find(key)
        if not found:
            raise KeyError(key)
        self._slots[index] = _DELETED
        self._size -= 1
```

The implementation rehashes based on used slots, including tombstones.

This prevents repeated deletions from turning short logical tables into long probe chains.

```python
table = LinearProbingMap[str, int](4)
table["a"] = 1
table["b"] = 2
table["a"] = 3
assert table["a"] == 3
del table["b"]
try:
    table["b"]
except KeyError:
    pass
else:
    raise AssertionError("deleted key must be absent")
```

### Collision-focused keys

```python
class SameHash:
    def __init__(self, value: int) -> None:
        self.value = value
    def __hash__(self) -> int:
        return 1
    def __eq__(self, other: object) -> bool:
        return isinstance(other, SameHash) and self.value == other.value


table = LinearProbingMap[SameHash, int](8)
keys = [SameHash(i) for i in range(5)]
for key in keys:
    table[key] = key.value
del table[keys[1]]
assert table[keys[4]] == 4
```

## 5. Asymptotic Time & Space Complexity

With uniform hashing and bounded load factor, chaining has expected $O(1+\alpha)$ lookup and insertion time.

At constant $\alpha$, this is expected $O(1)$.

Linear probing also has expected constant-time operations under distribution assumptions and controlled load.

Primary clustering can make linear probing sensitive to long occupied runs.

In the worst case, adversarial collisions produce $O(n)$ lookup, insertion, and deletion time.

Resizing costs $O(n)$ for one operation because every live entry is rehashed.

With geometric growth, that cost is amortized $O(1)$ per successful insertion.

The slot array uses $O(M)$ space.

Chaining additionally stores per-entry node or list overhead.

Open addressing uses contiguous slots but leaves tombstones until cleanup.

## 6. Systems Connections

### Language runtimes

Dictionary implementations balance locality, resizing, randomized hashing, and collision behavior.

Their exact guarantees depend on the runtime and key type.

### Security

Hash-flooding attacks supply many keys with colliding hashes to force long operations.

Randomized string hashing, collision-resistant policies, size limits, and CPU budgets reduce exposure.

Never assume expected $O(1)$ is a defense against hostile inputs by itself.

### Caches

Hash maps often index cache entries, while eviction policy lives separately.

Collision resolution preserves lookup correctness; it does not decide freshness or capacity eviction.

### Databases

Hash indexes are useful for equality lookup but do not naturally support ordered range scans.

The collision policy affects page layout and overflow handling.

### Concurrency

Concurrent resize, deletion, and publication require synchronization or specialized lock-free techniques.

The class above is intentionally single-threaded.

### Hash-function selection

The table should use a hash that distributes the key patterns it actually receives.

Sequential integer identifiers can be harmless under a power-of-two capacity only when low bits vary sufficiently.

Composite keys should combine fields without making common prefixes dominate the final hash.

Hashing is not encryption unless a cryptographic hash is specifically selected for that purpose.

Stable persisted hashes may need versioning because changing the function can invalidate stored indexes.

### Equality semantics

Equality should be reflexive, symmetric, and transitive for map keys.

Mutable keys are dangerous because changing a key after insertion can change its hash or equality behavior.

Such an entry may remain physically stored but become unreachable through normal lookup.

Use immutable keys or prevent mutation of hashed fields.

### Resizing policy

Growing at a live-load threshold preserves expected probe length.

Shrinking can save memory after large deletions but may cause resize oscillation if thresholds are too close.

Use separated growth and shrink thresholds.

Rebuilding after many tombstones can improve latency even when capacity remains unchanged.

Incremental rehashing can spread a large resize over later operations, but it complicates lookup because two tables may be live during migration.

### Alternative probing methods

Quadratic probing uses progressively larger offsets and reduces some clustering patterns.

Its capacity and probing parameters must ensure sufficient table coverage.

Double hashing derives a step size from a second hash and can reduce primary clustering.

The step must be relatively prime to capacity to visit every slot.

Robin Hood hashing moves entries to reduce variance in probe distances.

It improves predictable lookup behavior but makes insertion and deletion rules more intricate.

### Validation strategy

Compare map behavior against a trusted dictionary under randomized insert, update, lookup, and delete sequences.

Generate deliberately colliding keys as well as normally distributed keys.

Check that every retained key remains retrievable after each resize.

Check that deleted keys stay absent without hiding later cluster entries.

Measure probe length percentiles under representative and hostile workloads.

### Memory layout

Open addressing keeps entries in a compact array.

This can improve cache locality during ordinary lookup.

Chaining may allocate separate nodes or small arrays per bucket.

That can add pointer chasing but simplifies deletion.

Some implementations use short inline bucket arrays before spilling into another representation.

The best layout depends on entry size, allocator behavior, and observed load.

### Serialization and reproducibility

Physical slot order is an implementation detail.

Do not serialize a map by assuming its internal probe layout is stable.

Serialize logical key-value entries instead.

If deterministic iteration is required, store explicit ordering metadata or sort entries at output time.

Randomized hash seeds intentionally make physical order vary across processes.

### Error handling

Lookup failure should be distinguishable from a stored value equal to `None` or another sentinel-like application value.

Delete of an absent key may raise, return a status, or be idempotent according to API design.

Choose one policy and apply it consistently.

Avoid silently swallowing key-comparison exceptions because they can hide invalid custom key behavior.

### Operational limits

Set a maximum table size before multiplying capacity during growth.

Detect allocation failure and leave the old table intact if rehash cannot complete.

Large rehashes can cause latency spikes in request-serving code.

Schedule them outside critical paths when that latency matters.

For caches, an admission policy may avoid storing one-off keys that would inflate load factor.

For metrics, report resize count and collision-chain or probe statistics.

These signals make degraded hashing visible before it becomes an outage.

### Choosing a representation

Use separate chaining when deletion simplicity, stable entry references, or high load is important.

Use open addressing when compact contiguous storage and locality matter.

Use a balanced tree or sorted vector when ordered traversal is a primary requirement.

Use a hardened implementation rather than a teaching map at external trust boundaries.

Document the selected collision policy in the API contract.

Document whether iteration order is stable, randomized, or unspecified.

Keep resizing thresholds testable configuration rather than hidden constants.

Test performance after realistic deletion-heavy workloads.

Preserve map invariants before pursuing micro-optimizations.

Treat hash distribution as a measurable property of a workload.

Reassess it when key formats change.

## 7. Practice Checklist

- Require equal keys to have equal hashes.
- Define collision behavior explicitly.
- Keep lookup and insertion probe sequences identical.
- Distinguish empty slots from tombstones.
- Never terminate lookup at a tombstone.
- Rehash entries when capacity changes.
- Track live and used slot counts separately.
- Choose and enforce a load-factor threshold.
- Test keys with identical hashes.
- Test update without size growth.
- Test deletion in the middle of a probe cluster.
- Test resize after collisions.
- State expected versus worst-case guarantees.
- Harden externally reachable hash tables against flooding.
- Do not use this single-threaded implementation concurrently.
- Reject mutable key types when their hash-relevant fields can change.
- Test repeated tombstone creation and cleanup.
- Measure maximum and percentile probe lengths.
- Use separate grow and shrink thresholds.
- Document hash randomization and persistence behavior.
- Verify equality and hash compatibility for custom key classes.
- Consider a different data structure for ordered range queries.

## 8. Frequently Asked Questions

### Are collisions errors?

No.

They are inevitable when a large key domain maps into finite storage.

### Why not replace a deleted slot with empty?

Later colliding keys may be stored beyond it.

An empty marker would make them unreachable.

### Is chaining or open addressing better?

It depends on locality, allocation cost, deletion patterns, load targets, and worst-case requirements.

### Why rehash on resize?

Home indices depend on capacity through modulo arithmetic.

Old physical positions are not generally valid under the new capacity.

### Is expected constant time guaranteed?

No.

It depends on hashing and load assumptions; adversarial collisions can make operations linear.

### What is the key deletion rule for linear probing?

Leave a tombstone or repair the affected probe cluster using a correct alternative algorithm.

### Can a hash table preserve insertion order?

Yes, by maintaining additional ordering links or metadata.

Collision resolution alone does not provide that property.

### Why can mutable keys fail after insertion?

If mutation changes a key's hash or equality relation, lookup begins in a different probe sequence or bucket.

The stored entry can no longer be found reliably.

### What triggers a tombstone cleanup?

Use a threshold based on occupied slots or measured probe lengths.

Rehashing live entries into a fresh array removes accumulated tombstones.

### Are cryptographic hashes required?

Not for ordinary in-process maps.

Externally influenced keys may need randomized or hardened hashing to resist collision attacks.

### Can I use a hash table for prefix search?

Not efficiently by hash alone.

Tries, ordered trees, or specialized indexes are usually more appropriate for prefix and range queries.
