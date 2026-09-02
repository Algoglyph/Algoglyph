# Hash-Table Load Factor: Scaling Capacity Without Losing Lookup Guarantees

![Hash-table load factor scaling](/images/dsa/load-factor-scaling-dark.png#dark)

Load factor measures how densely a hash table uses its bucket or slot capacity.
It connects memory policy to collision cost.
A table that never resizes eventually turns expected constant-time lookup into long probes or long chains, while a table that resizes too eagerly wastes memory and copies data repeatedly.

## 1. Historical Context & Motivation

### Hashing needs spare structure

A hash function maps a large key space into a finite table.
Different keys inevitably share bucket indices.
Collision handling determines whether they form chains, probe alternative slots, or use another scheme.

As more keys enter a fixed-capacity table, collisions become more frequent.
Load factor summarizes that pressure.

For $n$ stored entries and capacity $m$, define

$$
\alpha=\frac{n}{m}.
$$

The interpretation of $m$ differs by collision strategy.
For separate chaining, it is bucket count and $\alpha$ may exceed one.
For open addressing, it is slot count and ordinary insertion requires $\alpha<1$.

### Why resizing exists

Dynamic hash tables increase capacity before density makes operations too costly or insertion impossible.
They allocate a new table and reinsert existing entries under the new capacity.

Reinsertion is required because bucket position commonly depends on capacity:

$$
\operatorname{index}=h(key)\bmod m.
$$

Copying entries to the same numeric positions is not generally correct.

### Policy, not universal constant

There is no universally optimal maximum load factor.
The choice depends on:

- separate chaining or open addressing;
- probing strategy;
- hash quality;
- key and value size;
- cache behavior;
- latency requirements;
- deletion policy;
- memory limits.

A threshold such as $0.75$ is a common implementation choice, not a mathematical law.

### Growth and shrinkage

Capacity usually grows geometrically, often by roughly two.
Geometric growth keeps the total cost of repeated rebuilds amortized linear across many insertions.

Shrinking needs a lower threshold distinct from the growth threshold.
Using one threshold can make the table oscillate between sizes under alternating insertions and deletions.
This separation is hysteresis.

### Scope

This article focuses on dynamic load-factor policy for chained and open-addressed hash tables.
It does not claim worst-case constant time against adversarial hashing.
Security-sensitive maps need randomized or otherwise attack-resistant hashing and resource limits.

## 2. Core Mathematical Invariants

### Capacity invariant

Let `size` count active entries and `capacity` count addressable buckets or slots.
The implementation maintains

$$
0\le size
$$

and positive capacity after initialization.
For open addressing,

$$
size\le capacity.
$$

Tombstones may occupy additional slots and require a second occupancy metric.

### Resize-before-insert invariant

If maximum permitted load is $\alpha_{max}$, an insertion of a new key should ensure

$$
\frac{size+1}{capacity}\le\alpha_{max}
$$

after any required growth.

Checking only current load can allow the insertion itself to cross the promised bound.
Updating an existing key does not increase size and should not trigger growth solely as a new-entry operation.

### Separate-chaining expectation

Under uniform hashing, expected chain length is $\alpha$.
Expected unsuccessful search examines approximately $\alpha$ chain entries plus constant bucket work.
Expected successful search is also $O(1+\alpha)$.

Keeping $\alpha=O(1)$ preserves expected constant-time operations.
Individual chains can still be longer.

### Open-addressing pressure

Open addressing stores entries directly in slots.
As $\alpha$ approaches one, empty slots become rare and probes grow rapidly.

Under idealized uniform hashing, expected unsuccessful probes are bounded around

$$
\frac{1}{1-\alpha}.
$$

At $\alpha=0.5$, this expression is two.
At $\alpha=0.9$, it is ten.
Real probing strategies have their own clustering behavior.

### Rehash invariant

During a stop-the-world resize, the old table remains authoritative until every active entry has been inserted into the new table.
After publication, every active key must be found exactly once under the new capacity.

Tombstones are not active keys and should not be copied.
Rehashing therefore also cleans deleted-slot markers.

### Amortized growth invariant

Suppose capacity multiplies by factor $g>1$ when full enough.
An entry can be moved only when capacity crosses a geometric sequence.
Across $N$ insertions, total moved entries are bounded by

$$
N+\frac{N}{g}+\frac{N}{g^2}+\cdots=O(N).
$$

Thus average resize work per insertion is $O(1)$, excluding key hashing cost.

### Hysteresis invariant

Choose shrink threshold $\alpha_{min}$ below the post-growth load.
After growing by factor $g$, load drops from near $\alpha_{max}$ to roughly $\alpha_{max}/g$.
Require

$$
\alpha_{min}<\frac{\alpha_{max}}{g}
$$

to prevent an immediate shrink.

Maintain a minimum capacity so tiny maps do not repeatedly allocate.

### Tombstone invariant

In open addressing, deletion cannot simply turn a slot empty if later keys' probe sequences pass through it.
A tombstone preserves probe continuity.

Track both:

$$
\alpha_{active}=\frac{size}{capacity}
$$

and

$$
\alpha_{occupied}=\frac{size+tombstones}{capacity}.
$$

High occupied load can require rehashing even when active load is modest.

## 3. Step-by-Step Execution Trace

### Configuration

Use an open-addressed table with:

```text
initial capacity = 8
maximum active load = 0.75
growth factor = 2
```

The table grows before a new insertion would make load exceed $0.75$.

### Insert first entries

After inserting four distinct keys:

$$
size=4,\quad capacity=8,\quad\alpha=0.5.
$$

No resize is needed.

### Insert fifth and sixth keys

Before key five, projected load is $5/8=0.625$.
Insert directly.

Before key six, projected load is $6/8=0.75$.
The bound permits equality.
Insert directly.

### Attempt seventh insertion

Projected load is

$$
\frac{7}{8}=0.875.
$$

This exceeds the threshold.
Allocate capacity sixteen before inserting the new key.

### Rehash existing entries

For each of the six active entries:

1. recompute its starting index using capacity sixteen;
2. follow the new probe sequence;
3. place it in the new table;
4. do not copy any empty or tombstone slot.

The physical order can change.
The key-value mapping must not.

### Publish new table

After all six entries move, replace the active storage reference.
Insert the seventh key into capacity sixteen.

New load is

$$
\alpha=\frac{7}{16}=0.4375.
$$

Growth restored spare capacity.

### Update an existing key

Update the value of one existing key.
Size remains seven.
Projected new-entry load is irrelevant because no entry is added.
The active load remains $7/16$.

### Delete entries with tombstones

Delete three keys.
Suppose open addressing leaves three tombstones.

Then

$$
\alpha_{active}=\frac{4}{16}=0.25
$$

but

$$
\alpha_{occupied}=\frac{4+3}{16}=0.4375.
$$

Search probes can still cross tombstones.
A cleanup rehash may be triggered by occupied load or tombstone count.

### Hysteresis example

Assume shrinking occurs below active load $0.20$ and never below capacity eight.
At four active entries in capacity sixteen, load is $0.25$, so no shrink occurs.
Delete one more entry: load becomes $3/16=0.1875$.
Shrink to capacity eight if the policy permits it.

After shrinking, load is $3/8=0.375$.
It is far below the growth threshold, so one insertion cannot immediately regrow the table.

### Why exact position copying fails

A key with hash value ten maps to index two when capacity is eight:

$$
10\bmod8=2.
$$

At capacity sixteen it maps to index ten:

$$
10\bmod16=10.
$$

Leaving it at slot two could make lookup begin at ten and stop at an empty slot before ever seeing it.
Rehashing is required.

## 4. Production-Ready Implementations

### Educational chained hash map in Python

```python
from __future__ import annotations

from typing import Generic, Iterator, TypeVar


K = TypeVar("K")
V = TypeVar("V")


class ChainedMap(Generic[K, V]):
    def __init__(self, initial_capacity: int = 8, max_load: float = 0.75) -> None:
        if initial_capacity <= 0:
            raise ValueError("capacity must be positive")
        if not 0.0 < max_load:
            raise ValueError("max_load must be positive")
        self._buckets: list[list[tuple[K, V]]] = [
            [] for _ in range(initial_capacity)
        ]
        self._size = 0
        self._max_load = max_load

    def _index(self, key: K) -> int:
        return hash(key) % len(self._buckets)

    def __len__(self) -> int:
        return self._size

    @property
    def load_factor(self) -> float:
        return self._size / len(self._buckets)

    def __setitem__(self, key: K, value: V) -> None:
        bucket = self._buckets[self._index(key)]
        for index, (stored_key, _) in enumerate(bucket):
            if stored_key == key:
                bucket[index] = (key, value)
                return

        if (self._size + 1) / len(self._buckets) > self._max_load:
            self._resize(len(self._buckets) * 2)
            bucket = self._buckets[self._index(key)]
        bucket.append((key, value))
        self._size += 1

    def __getitem__(self, key: K) -> V:
        for stored_key, value in self._buckets[self._index(key)]:
            if stored_key == key:
                return value
        raise KeyError(key)

    def _resize(self, capacity: int) -> None:
        entries = list(self.items())
        self._buckets = [[] for _ in range(capacity)]
        self._size = 0
        for key, value in entries:
            bucket = self._buckets[self._index(key)]
            bucket.append((key, value))
            self._size += 1

    def items(self) -> Iterator[tuple[K, V]]:
        for bucket in self._buckets:
            yield from bucket


table = ChainedMap[str, int](initial_capacity=4, max_load=0.75)
table["a"] = 1
table["b"] = 2
table["c"] = 3
table["d"] = 4
assert len(table._buckets) == 8
assert table["a"] == 1 and table["d"] == 4
table["a"] = 9
assert len(table) == 4 and table["a"] == 9
```

This is instructional code, not a replacement for a language's hardened standard map.
It lacks deletion, concurrency, iterator invalidation rules, and collision-attack defenses beyond the runtime hash.

### Avoid recursive public insertion during resize

The resize routine inserts directly into fresh buckets.
Calling the normal public setter can trigger nested threshold checks and obscure size accounting.
Use an internal insertion path whose preconditions are explicit.

### Integer threshold comparison

Floating-point load checks can be replaced with cross multiplication:

```text
(size + 1) * denominator > capacity * numerator
```

for rational threshold `numerator / denominator`.
Use a type wide enough to avoid multiplication overflow.

### Incremental rehashing

Stop-the-world rehashing causes an $O(n)$ latency spike.
An incremental design keeps old and new tables simultaneously and migrates a bounded number of buckets per operation.

Lookups consult both tables until migration completes.
Insertions normally target the new table.
The implementation needs an invariant preventing duplicate active copies.

### Iterator policy

Resizing invalidates bucket positions and often iterators.
Document whether mutation during iteration is forbidden, detected, or supported through snapshots.
Do not expose internal slot indices as stable identities.

## 5. Asymptotic Time & Space Complexity

### Expected operations

With a suitable hash distribution and bounded load factor, lookup, insertion, and deletion are expected $O(1)$.
This is an expectation, not an unconditional worst-case guarantee.

Separate chaining has expected cost $O(1+\alpha)$.
Open addressing depends more sharply on distance from full capacity and probing strategy.

### Worst case

If every key collides, a chained bucket can contain $n$ entries.
Lookup becomes $O(n)$.
Open addressing can similarly inspect a linear number of slots.

Balanced-tree collision buckets can improve worst-case behavior under suitable key ordering, but add complexity and thresholds.

### Resize cost

One full resize takes $O(n+m')$ time when allocating capacity $m'$ and reinserting $n$ entries.
It uses $O(m')$ new storage while the old table remains live.

Geometric growth makes insertion $O(1)$ amortized under expected constant reinsert cost.
Individual insertion latency can still be $O(n)$.

### Memory

Separate chaining uses $O(m+n)$ storage plus per-node overhead.
Open addressing uses $O(m)$ slots and often has better locality.
Lower load uses more empty capacity to reduce collision cost.

### Shrink cost

Shrinking is another $O(n)$ rehash.
Hysteresis bounds repeated grow-shrink oscillation.
A minimum capacity avoids churn for small tables.

### Hash cost

If hashing a key of length $L$ costs $O(L)$, table lookup is expected $O(L)$ rather than literal constant time with respect to key size.
Cached hashes trade memory and invalidation complexity for repeated-key speed.

## 6. Systems Connections

### Runtime dictionaries

Language dictionaries tune thresholds for their slot representation, ordering promises, deletion strategy, and memory allocator.
Application code should not assume one internal maximum load factor across runtimes.

### Caches

A cache map combines hashing with eviction and often concurrency.
Resize latency can appear on request paths.
Pre-sizing from expected cardinality can reduce rebuilds.

### Database hash joins

A hash join builds buckets for one relation and probes with another.
Cardinality estimation influences table sizing.
If memory is insufficient, partitioning and spilling dominate the simple in-memory load-factor model.

### Distributed partitioning

Distributed hash tables use “load” in a broader sense involving keys per node and skew across partitions.
Local table load factor does not solve hot-key imbalance between machines.

### Concurrent maps

Resizing while readers and writers proceed requires synchronization, versioning, or cooperative migration.
Publishing partially migrated state can lose keys or duplicate updates.
Use established concurrent-map designs rather than adding locks casually to an educational table.

### Security

Chosen keys can create collision floods when hashing is predictable.
Randomized hashing, keyed hashes, collision-tree fallback, input limits, and request throttling mitigate attacks.
Resizing alone does not fix adversarial collisions.

### Observability

Useful metrics include active load, occupied load, maximum chain length, probe distribution, resize count, resize duration, and capacity.
Average load alone can hide one pathological bucket.

## 7. Practice Checklist

### Define metrics

- Count active entries accurately.
- Define capacity for the collision scheme.
- Track tombstones separately.
- Compute active load.
- Compute occupied load when needed.
- Observe chain or probe distributions.

### Grow safely

- Check projected load for a new key.
- Do not grow for value-only updates.
- Use geometric capacity growth.
- Rehash every active key.
- Discard tombstones.
- Publish only complete new state.
- Check capacity arithmetic for overflow.

### Shrink safely

- Use a lower threshold than growth.
- Maintain minimum capacity.
- Avoid immediate regrowth.
- Rehash active entries.
- Consider whether releasing memory is worth latency.
- Test alternating insert-delete workloads.

### Test cases

- Empty table.
- Insert below threshold.
- Insert exactly at threshold.
- Insert crossing threshold.
- Update existing key.
- Duplicate hash values.
- Delete and reinsert.
- Tombstone accumulation.
- Multiple growth cycles.
- Shrink boundary.
- Adversarial collision keys.

### Validate rehash

- Every old active key remains findable.
- Every value remains paired with its key.
- No key appears twice.
- Size is unchanged by pure resize.
- Capacity changes as intended.
- Tombstones disappear.
- Iteration policy is respected.

### Tune from evidence

- Measure lookup latency.
- Measure insertion tail latency.
- Measure memory per entry.
- Measure probe counts.
- Measure maximum chain length.
- Pre-size known workloads.
- Do not copy thresholds across implementations blindly.

## 8. Frequently Asked Questions

### What is load factor?

It is active entry count divided by bucket or slot capacity.

### Can load factor exceed one?

Yes for separate chaining because buckets can contain several entries.
Ordinary open addressing requires at least one available slot and therefore active load below one.

### Why is $0.75$ common?

It is a practical compromise used by some implementations.
It is not universally optimal or required for correctness.

### Why must keys be rehashed during resize?

Bucket or probe positions depend on capacity.
Changing capacity changes the position calculation.

### Is rehashing the same as recomputing the raw hash?

Not necessarily.
An implementation can cache a raw hash but must still derive new slot placement from the new capacity.

### Why grow geometrically?

It makes capacities form a geometric sequence, bounding total movement across many insertions by $O(n)$.

### Why use separate shrink and grow thresholds?

The gap prevents repeated resizing when size oscillates near one boundary.

### What are tombstones?

Markers for deleted open-addressed slots that preserve probe-chain continuity.
Too many tombstones increase probes and motivate cleanup rehashing.

### Does expected $O(1)$ mean guaranteed constant time?

No.
Poor or adversarial collisions can produce linear operations.

### Can resizing be incremental?

Yes.
Migrate bounded work per operation while lookups consult old and new tables under a carefully maintained invariant.

### Should a table shrink automatically?

It depends on workload and latency goals.
Shrinking releases memory but adds rebuild cost and can cause churn.

### How should initial capacity be chosen?

If expected entry count $n$ and maximum load $\alpha$ are known, choose capacity at least $\lceil n/\alpha\rceil$, adjusted to implementation constraints.

### What if keys are expensive to hash?

Hash cost becomes part of every operation.
Cached hashes or alternate key representations may help if immutability and memory trade-offs are acceptable.

### What is the most common resize bug?

Copying entries to old numeric positions or forgetting that an existing-key update does not increase size.

### What should I study next?

Study open-addressing probe strategies, Robin Hood hashing, separate chaining, universal hashing, incremental rehashing, and collision-denial defenses.
