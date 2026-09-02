# Heap Allocation: Dynamic Lifetime, Allocator Metadata & Fragmentation

![Heap allocation and free-block reuse](/images/dsa/heap-allocation-dark.png#dark)

## 1. Historical Context & Motivation

Some objects outlive the function that creates them.

Some arrays have sizes known only after reading input.

Some data structures grow and shrink in patterns the compiler cannot predict.

Heap allocation supplies storage for those dynamic lifetimes.

The term **heap** here means a managed region of process memory.

It is unrelated to the binary-heap priority-queue data structure.

A program asks an allocator for a block of at least a requested size.

The allocator finds or creates a suitable free region.

It records enough metadata to reclaim or resize that region later.

The program receives an address or language-level reference.

The allocation remains live until explicit deallocation, ownership destruction, tracing garbage collection, or process termination.

Dynamic lifetime is useful but not free.

An allocator must synchronize shared state, search free structures, split blocks, coalesce neighbors, and interact with the operating system.

Each allocation may consume more bytes than requested.

Alignment rounds sizes upward.

Headers or side metadata track block state.

Free space can become fragmented.

The program can also misuse ownership.

Access after free, double free, memory leaks, and out-of-bounds writes are correctness and security defects in manual-memory languages.

Managed runtimes prevent some of these defects but add tracing, reference counting, pauses, or background reclamation.

Data-structure design affects allocator pressure.

A linked list may allocate one node per element.

A dynamic vector allocates fewer, larger contiguous buffers.

A tree with per-node allocation has different locality from a packed array representation.

Object pools and arenas trade generality for predictable bulk allocation and reclamation.

The right question is not whether heap allocation is “slow.”

The question is which lifetime, size distribution, sharing pattern, and locality requirements the allocator must support.

The central mechanism is a partition of managed memory into live blocks and reusable free regions.

Every allocator operation must preserve that partition.

## 2. Core Mathematical Invariants

Model an allocator arena as the half-open address interval $[0,C)$ with capacity $C$ bytes.

Each block is a half-open interval $[s,s+\ell)$.

Half-open intervals make adjacent blocks unambiguous.

Blocks $[a,b)$ and $[b,c)$ touch but do not overlap.

### Partition invariant

At every valid state, live and free blocks form a disjoint partition of the managed arena.

No byte belongs to two blocks.

No managed byte belongs to neither category.

For block set $B$:

$$
\bigcup_{b\in B} b=[0,C)
$$

and every distinct pair has empty intersection.

Metadata stored outside the modeled arena can be excluded explicitly.

If headers occupy arena bytes, they must be included in block sizes.

### Alignment invariant

An allocation returned for alignment $a$ starts at an address divisible by $a$.

For power-of-two alignment:

$$
\operatorname{alignUp}(x,a)=(x+a-1)\ \&\ \sim(a-1).
$$

The request size is commonly rounded to an allocator size class.

The difference between requested and reserved size contributes to internal fragmentation.

### Ownership invariant

Each live allocation has exactly one allocator-recognized identity.

A deallocation must refer to a currently live identity created by the same allocator domain.

Freeing an interior pointer violates this invariant.

Freeing the same allocation twice violates it.

Generation-tagged handles can detect stale reuse in pools.

Raw addresses alone cannot distinguish an old object from a new object later placed at the same address.

### Free-list invariant

Every free-list entry describes a reusable, currently unallocated region.

Free-list entries do not overlap.

If the allocator eagerly coalesces, adjacent free blocks must not remain separate.

For sorted free blocks $F_i=[s_i,e_i)$:

$$
e_i < s_{i+1}
$$

under an eager-coalescing policy.

Without eager coalescing, the weaker condition is $e_i\le s_{i+1}$.

### Splitting invariant

Suppose a free block has size $b$ and the aligned request uses size $r\le b$.

Allocation replaces it with one live block of size $r$ and possibly one free remainder of size $b-r$.

The total covered size remains $b$.

No bytes disappear during splitting.

Very small remainders may be absorbed into the live block when they cannot represent a useful free block.

That policy increases internal fragmentation but preserves the partition.

### Coalescing invariant

When a live block becomes free, neighboring free regions can merge.

If `[a, b)` and `[b, c)` are free, replace them with `[a, c)`.

The union is unchanged.

The number of free fragments decreases.

Boundary tags or address-ordered structures help locate adjacent blocks.

### Conservation equation

Let $L$ be bytes reserved in live blocks and $F$ bytes in free blocks.

Ignoring external metadata:

$$
L+F=C.
$$

Requested payload bytes $P$ can be smaller than $L$.

Internal fragmentation is $L-P$.

External fragmentation concerns the distribution of $F$ across separate holes.

An allocation of size $r$ can fail even when $F\ge r$ if no single suitable free block exists.

### Lifetime invariant

An object may be accessed only while its allocation is live and while the access stays inside its bounds.

Deallocation ends the lifetime.

Returning storage to a pool does not preserve object validity merely because the bytes still contain old values.

## 3. Step-by-Step Execution Trace

Use a 64-byte arena with first-fit placement and 8-byte size alignment.

The initial free list is:

```text
[0, 64) free
```

No live blocks exist.

### Allocate `A` with requested size 13

Round 13 upward to 16.

The first free block has 64 bytes.

Split it into live `[0,16)` and free `[16,64)`.

State:

```text
A: [0, 16) live, requested 13
free: [16, 64)
```

Internal fragmentation for `A` is three bytes.

### Allocate `B` with requested size 20

Round 20 upward to 24.

First-fit selects `[16,64)`.

Split it into `B=[16,40)` and free `[40,64)`.

State:

```text
A: [0, 16) live
B: [16, 40) live
free: [40, 64)
```

### Allocate `C` with requested size 8

Eight already satisfies alignment.

Allocate `C=[40,48)`.

The free remainder is `[48,64)`.

Live reserved bytes total $16+24+8=48$.

Free bytes total 16.

The conservation equation gives $48+16=64$.

### Free `B`

Region `[16,40)` becomes free.

Its neighbors `A` and `C` are live.

No coalescing is possible.

Free list:

```text
[16, 40), [48, 64)
```

Total free space is 40 bytes.

The largest free block is only 24 bytes.

### Request `D` with size 32

The aligned size is 32.

Neither free block is large enough.

The allocation fails within this fixed arena.

It fails even though total free space is 40 bytes.

This is external fragmentation.

### Free `C`

Region `[40,48)` becomes free.

It touches free block `[16,40)` on the left.

It touches free block `[48,64)` on the right.

Coalescing produces one free block `[16,64)`.

The free space remains 48 bytes.

The largest free block grows from 24 to 48 bytes.

### Retry `D`

Allocate 32 bytes from `[16,64)`.

`D` occupies `[16,48)`.

The free remainder is `[48,64)`.

The request now succeeds because coalescing restored contiguity.

### Free `A` and `D`

Freeing `A` creates `[0,16)`.

Freeing `D` creates `[16,48)`.

These blocks merge with each other and `[48,64)`.

The arena returns to one free block `[0,64)`.

The trace demonstrates alignment, splitting, fragmentation, failure, and coalescing without changing total capacity.

### Stale-reference failure

Suppose a caller retains `B`'s old address `16` after freeing `B`.

Later `D` begins at address `16`.

Dereferencing the stale address now accesses `D`, not `B`.

Address equality cannot prove object identity across reuse.

This is why use-after-free can corrupt unrelated later allocations.

## 4. Production-Ready Implementations

General-purpose allocators are platform components, not short tutorial projects.

The following fixed-block pool demonstrates safe ownership for equal-size slots.

It is suitable as an application-level pool when its constraints fit.

It is not a replacement for the process allocator.

Generation-tagged handles reject stale frees after slot reuse.

```python
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class Handle:
    slot: int
    generation: int


class FixedBlockPool(Generic[T]):
    def __init__(self, capacity: int) -> None:
        if capacity < 0:
            raise ValueError("capacity must be nonnegative")

        self._values: list[T | None] = [None] * capacity
        self._generations = [0] * capacity
        self._live = [False] * capacity
        self._free = list(reversed(range(capacity)))

    @property
    def capacity(self) -> int:
        return len(self._values)

    def __len__(self) -> int:
        return self.capacity - len(self._free)

    def allocate(self, value: T) -> Handle:
        if not self._free:
            raise MemoryError("fixed block pool is full")

        slot = self._free.pop()
        self._values[slot] = value
        self._live[slot] = True
        return Handle(slot, self._generations[slot])

    def _validate(self, handle: Handle) -> None:
        if not 0 <= handle.slot < self.capacity:
            raise KeyError("handle slot is outside this pool")
        if not self._live[handle.slot]:
            raise KeyError("handle refers to a free slot")
        if self._generations[handle.slot] != handle.generation:
            raise KeyError("handle generation is stale")

    def get(self, handle: Handle) -> T:
        self._validate(handle)
        value = self._values[handle.slot]
        assert value is not None
        return value

    def release(self, handle: Handle) -> T:
        self._validate(handle)
        value = self._values[handle.slot]
        assert value is not None

        self._values[handle.slot] = None
        self._live[handle.slot] = False
        self._generations[handle.slot] += 1
        self._free.append(handle.slot)
        return value
```

Each free slot appears exactly once in `_free`.

Each live slot appears zero times there.

Generation increment occurs before the slot can be reused.

That order invalidates every older handle.

### Execute allocation and reuse

```python
pool: FixedBlockPool[str] = FixedBlockPool(2)

first = pool.allocate("node A")
second = pool.allocate("node B")

assert pool.get(first) == "node A"
assert pool.get(second) == "node B"
assert len(pool) == 2

assert pool.release(first) == "node A"
replacement = pool.allocate("node C")

assert replacement.slot == first.slot
assert replacement.generation == first.generation + 1
assert pool.get(replacement) == "node C"

try:
    pool.get(first)
except KeyError:
    pass
else:
    raise AssertionError("a stale handle was accepted")
```

### Validate pool accounting

```python
def pool_invariants(pool: FixedBlockPool[object]) -> bool:
    free_slots = set(pool._free)
    if len(free_slots) != len(pool._free):
        return False
    if any(not 0 <= slot < pool.capacity for slot in free_slots):
        return False

    for slot in range(pool.capacity):
        if pool._live[slot] == (slot in free_slots):
            return False
        if not pool._live[slot] and pool._values[slot] is not None:
            return False

    return len(pool) + len(pool._free) == pool.capacity


objects: FixedBlockPool[object] = FixedBlockPool(4)
assert pool_invariants(objects)
handles = [objects.allocate({"id": index}) for index in range(4)]
assert pool_invariants(objects)
objects.release(handles[1])
objects.release(handles[3])
assert pool_invariants(objects)
```

In lower-level languages, a pool also needs alignment, object construction and destruction, synchronization, and exception-safe rollback.

Use standard allocators unless profiling and lifetime structure justify a specialized pool.

## 5. Asymptotic Time & Space Complexity

The fixed-block pool uses a stack of free slot indices.

Allocation pops one index and writes one slot.

It costs $O(1)$ worst-case after pool construction.

Release validates the handle, clears one slot, increments one generation, and pushes one index.

It also costs $O(1)$.

Access through a valid handle costs $O(1)$.

Pool initialization touches every slot and costs $O(C)$ for capacity $C$.

Metadata and value storage consume $O(C)$ space.

General-purpose allocator bounds depend on design.

Size-segregated free lists can make common allocation paths close to constant-time.

Searching an address-ordered free list may be linear without another index.

Balanced trees or indexed bins change search costs and constants.

Coalescing may require neighbor metadata lookups.

Returning pages to the operating system is much more expensive than manipulating an in-process free list.

Allocator latency is a distribution, not one universal constant.

Contention, size class, cache state, and page faults affect it.

| Fixed-block pool operation | Time | Space change |
|---|---:|---:|
| Construct capacity $C$ | $O(C)$ | $O(C)$ |
| Allocate one slot | $O(1)$ | One fewer free slot |
| Access one handle | $O(1)$ | None |
| Release one slot | $O(1)$ | One more free slot |
| Validate all invariants | $O(C)$ | $O(C)$ temporary set |

For a variable-size arena, first-fit search can cost $O(f)$ where $f$ is the number of free blocks.

Splitting is constant-time once a block is found if metadata updates are constant-time.

Coalescing is constant-time only when adjacent block metadata is directly available.

## 6. Systems Connections

### Dynamic containers

Vectors allocate larger buffers as they grow.

Geometric capacity growth converts frequent appends into amortized constant time.

The strategy deliberately reserves unused capacity to reduce allocation frequency.

Linked structures instead allocate many independent nodes.

They avoid whole-buffer relocation but increase metadata and pointer-chasing costs.

### Arenas and regions

An arena serves many allocations from larger chunks.

Individual deallocation may be omitted.

The whole arena is reclaimed at a phase boundary.

Parsing, compilation, frame processing, and request-scoped work often have this lifetime shape.

Arena use is safe only when no object escapes the arena lifetime.

### Garbage collection

Tracing collectors determine liveness through reachability rather than explicit `free` calls.

They can compact objects and remove external fragmentation.

Compaction requires updating references or using handles.

Collection work, barriers, and pauses become part of runtime behavior.

Reference counting reclaims promptly when counts reach zero but cannot collect cycles without help.

### Operating-system pages

Process allocators obtain virtual memory in page-sized or larger units.

Small application allocations are suballocated from those regions.

An allocation need not cause a system call.

Touching a newly mapped page may incur a page fault later.

Virtual reservation and physical commitment are distinct.

### Thread-local caches

Shared allocator locks can become contention points.

Thread-local caches serve common sizes without global synchronization.

Cross-thread deallocation complicates ownership and cache balancing.

Unused cached blocks can inflate resident memory.

### Security hardening

Allocators may add guard pages, quarantines, canaries, delayed reuse, or randomized placement.

These measures trade memory and speed for stronger bug detection or exploit resistance.

Custom allocators must not silently discard platform hardening without a compelling reason.

### Observability

Useful metrics include live requested bytes, reserved bytes, allocation count, size-class distribution, and peak usage.

Sampling allocation call stacks can find churn without recording every event.

Instrumentation itself can perturb timing and allocation behavior.

## 7. Practice Checklist

- Distinguish heap memory from the binary-heap data structure.
- Define who owns each allocation.
- Define when ownership ends.
- Match every manual allocation with one deallocation path.
- Reject double frees.
- Reject pointers or handles from another allocator domain.
- Never access an object after its lifetime ends.
- Check multiplication and addition for size overflow.
- Honor the requested alignment.
- Account for metadata and rounded size.
- Preserve the live/free partition during splitting.
- Preserve total capacity during coalescing.
- Coalesce adjacent free blocks when the policy requires it.
- Test zero-size request semantics.
- Test exact-fit allocation.
- Test splitting with a remainder.
- Test allocation failure.
- Test freeing in forward order.
- Test freeing in reverse order.
- Test a fragmented failure with sufficient total free bytes.
- Test recovery after coalescing.
- Use generation tags when handles can outlive slot reuse.
- Synchronize shared allocator state.
- Prefer thread ownership where possible.
- Use arenas only when lifetimes share a clear boundary.
- Run memory sanitizers for manual-memory code.
- Measure allocation counts and sizes before specializing.
- Include page faults and contention in performance analysis.
- Preserve platform security hardening.
- Document whether allocation failure throws, returns null, or terminates.

## 8. Frequently Asked Questions

### Is heap allocation related to a heap priority queue?

No.

They share a historical word but describe different mechanisms.

Heap allocation manages dynamic memory; a binary heap maintains a partial order for priorities.

### Why is heap allocation slower than stack-pointer movement?

A general allocator tracks reusable blocks, alignment, metadata, fragmentation, and often synchronization.

Stack allocation commonly adjusts one pointer under strict last-in-first-out lifetime rules.

### What is internal fragmentation?

It is reserved space inside a live allocation that the payload does not use.

Alignment, size classes, and minimum block sizes create it.

### What is external fragmentation?

It is free space split into holes that are individually too small for a request.

Total free bytes can exceed the request while allocation still fails.

### Does coalescing eliminate all fragmentation?

It merges adjacent free regions.

Live blocks can still separate free regions, and internal fragmentation remains.

### Why can a stale pointer appear to work?

Freed bytes may remain mapped and unchanged temporarily.

The allocator can reuse them at any time, so apparent success is not valid lifetime.

### What is an arena allocator good for?

It fits groups of objects that share one reclamation boundary.

Allocation is fast, and bulk reset avoids individual free operations.

It is dangerous when references escape the arena.

### When should I build an object pool?

Only when the workload has many same-shaped objects, measured allocator overhead, and a clear capacity or growth policy.

Standard allocators are safer defaults.

### How does garbage collection change the model?

The runtime determines when unreachable objects can be reclaimed.

Programs still control references and can retain objects accidentally, producing logical leaks.

### Why add generations to handles?

A slot index can be reused for another object.

The generation distinguishes a current allocation from an older handle naming the same slot.

### Can allocation fail on a machine with available memory?

Yes.

Address-space limits, quotas, fragmentation, commitment policy, overflows, and allocator constraints can all cause failure.

### How should allocation-heavy code be optimized?

Measure call frequency, size distribution, lifetime, contention, and cache behavior first.

Then consider fewer allocations, contiguous containers, batching, arenas, or pools according to the measured pattern.
