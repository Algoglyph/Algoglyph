# Circular Buffers: Modular Indices, Bounded Queues & Full-Empty Invariants

![Circular buffer ring layout](/images/dsa/circular-buffers-dark.jpg#dark)

## 1. Historical Context & Motivation

A circular buffer stores a bounded sequence in a fixed-size array while reusing positions at the beginning after reaching the end.

It is also called a ring buffer.

The structure avoids moving every remaining item after a dequeue.

Instead, read and write positions advance modulo capacity.

This makes it useful for queues with predictable memory use.

Audio capture, network receive paths, telemetry, keyboard input, producer-consumer pipelines, and embedded systems commonly use the pattern.

The capacity bound is not merely an implementation detail.

It defines what happens when producers outpace consumers.

Some systems reject new items.

Some block producers.

Some overwrite the oldest item.

Some drop the newest item and report loss.

Each policy has different correctness and observability implications.

A ring buffer is not automatically thread-safe.

The simple index arithmetic describes storage organization.

Concurrent publication, visibility, ownership, and memory ordering require an additional synchronization design.

The basic API needs an unambiguous distinction between empty and full.

If only `head` and `tail` indices are stored, both states can have equal indices.

There are two common solutions.

Store an explicit size counter.

Or reserve one physical slot and define full as the condition that advancing tail would meet head.

This article uses an explicit size because its logical capacity equals its allocated array length.

The central question is:

How do modular indices preserve FIFO order without shifting elements, and how do we prove full and empty states are never confused?

## 2. Core Mathematical Invariants

Let capacity be $C>0$.

Let `head` identify the oldest live item.

Let `tail` identify the next physical position to write.

Let `size` be the number of live items.

All indices satisfy:

$$
0\le head<C,\qquad 0\le tail<C.
$$

The size invariant is:

$$
0\le size\le C.
$$

The buffer is empty exactly when $size=0$.

The buffer is full exactly when $size=C$.

Thus equal head and tail indices are harmless: size disambiguates the states.

### Logical-to-physical mapping

For logical offset $i$ from the oldest item, where $0\le i<size$, the physical slot is:

$$
(head+i)\bmod C.
$$

This mapping identifies every live item exactly once.

No live item lies outside these `size` positions.

### Enqueue invariant

Before an accepted enqueue, $size<C$.

Write the new item at `tail`.

Then update:

$$
tail\leftarrow(tail+1)\bmod C,\qquad size\leftarrow size+1.
$$

Existing logical offsets are unchanged.

The inserted item gains logical offset equal to the old size.

FIFO order is preserved.

### Dequeue invariant

Before a dequeue, $size>0$.

Read the item at `head`.

Then update:

$$
head\leftarrow(head+1)\bmod C,\qquad size\leftarrow size-1.
$$

Every remaining item shifts one logical offset toward zero without moving physically.

The returned item was the unique logical offset zero item.

### Wrap invariant

Modulo arithmetic maps an increment after slot $C-1$ back to slot zero.

It does not change logical order.

For any integer $q$:

$$
(q+C)\bmod C=q\bmod C.
$$

This equality is why reused physical slots do not imply reused logical positions too early.

### FIFO invariant

At all times, iteration by logical offsets yields items in successful-enqueue order minus items already dequeued.

An enqueue appends exactly one item to that sequence.

A dequeue removes exactly its first item.

Induction over operations proves FIFO behavior.

### Overwrite policy invariant

If a full buffer accepts a new item by overwriting, it must also advance head.

Otherwise the overwritten oldest slot would still be considered live.

Under overwrite-oldest policy, size remains $C$ and the new item becomes logically newest.

The loss event should be observable because consumers cannot reconstruct the discarded item.

### Representation invariant

Slots outside the logical live range are unspecified storage.

Clearing a removed slot can release object references for garbage collection.

It is not required for FIFO correctness.

## 3. Step-by-Step Execution Trace

Use capacity $C=4$.

Initially:

$$
head=0,\ tail=0,\ size=0.
$$

Enqueue `A`.

Write slot 0, then set `tail=1`, `size=1`.

Logical sequence is `[A]`.

Enqueue `B` and `C`.

Physical slots are `[A,B,C,_]`.

State is `head=0`, `tail=3`, `size=3`.

Dequeue returns `A`.

State becomes `head=1`, `tail=3`, `size=2`.

Physical slot 0 may be cleared, but the logical sequence is `[B,C]`.

Enqueue `D`.

Write slot 3.

State becomes `head=1`, `tail=0`, `size=3`.

The tail has wrapped, yet no item has moved.

Enqueue `E`.

Write slot 0.

State becomes `head=1`, `tail=1`, `size=4`.

The physical array is `[E,B,C,D]`.

The logical FIFO sequence is `[B,C,D,E]`.

Equal indices now mean full because size equals capacity.

Dequeuing four times returns `B`, `C`, `D`, then `E`.

After the final dequeue, `head=1`, `tail=1`, `size=0`.

Equal indices now mean empty because size is zero.

The same pair of indices represents different states, which is why `size` is required in this representation.

### Overwrite trace

Start from full logical sequence `[B,C,D,E]`.

An overwrite-oldest enqueue of `F` writes at tail slot 1.

Slot 1 previously held `B`.

Advance both tail and head to 2 while retaining `size=4`.

The new logical sequence is `[C,D,E,F]`.

The event must record that `B` was dropped.

## 4. Production-Ready Implementations

```python
from collections.abc import Iterator
from typing import Generic, TypeVar


Item = TypeVar("Item")


class CircularBuffer(Generic[Item]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._slots: list[Item | None] = [None] * capacity
        self._head = 0
        self._tail = 0
        self._size = 0

    @property
    def capacity(self) -> int:
        return len(self._slots)

    def __len__(self) -> int:
        return self._size

    def put(self, item: Item) -> None:
        if self._size == self.capacity:
            raise OverflowError("circular buffer is full")
        self._slots[self._tail] = item
        self._tail = (self._tail + 1) % self.capacity
        self._size += 1

    def get(self) -> Item:
        if self._size == 0:
            raise IndexError("circular buffer is empty")
        item = self._slots[self._head]
        self._slots[self._head] = None
        self._head = (self._head + 1) % self.capacity
        self._size -= 1
        assert item is not None
        return item

    def __iter__(self) -> Iterator[Item]:
        for offset in range(self._size):
            item = self._slots[(self._head + offset) % self.capacity]
            assert item is not None
            yield item
```

The `None` slot marker means this generic version cannot safely store `None` as a normal item.

A production generic container can use a private sentinel object instead.

The API rejects overflow rather than silently dropping data.

That is appropriate when loss must be visible to the caller.

```python
queue = CircularBuffer[str](4)
for value in ["A", "B", "C"]:
    queue.put(value)
assert queue.get() == "A"
queue.put("D")
queue.put("E")
assert list(queue) == ["B", "C", "D", "E"]
assert [queue.get() for _ in range(4)] == ["B", "C", "D", "E"]
assert len(queue) == 0

try:
    queue.get()
except IndexError:
    pass
else:
    raise AssertionError("empty dequeue must fail")
```

### Differential operation test

```python
from collections import deque
from random import Random


rng = Random(53)
for capacity in range(1, 12):
    ring = CircularBuffer[int](capacity)
    reference: deque[int] = deque()
    for _ in range(1_000):
        if rng.random() < 0.55 and len(reference) < capacity:
            value = rng.randrange(-100, 101)
            ring.put(value)
            reference.append(value)
        elif reference:
            assert ring.get() == reference.popleft()
        assert list(ring) == list(reference)
        assert len(ring) == len(reference)
```

### Overwrite-oldest variant

```python
def put_overwriting(buffer: CircularBuffer[Item], item: Item) -> Item | None:
    dropped = buffer.get() if len(buffer) == buffer.capacity else None
    buffer.put(item)
    return dropped


ring = CircularBuffer[str](2)
ring.put("A")
ring.put("B")
assert put_overwriting(ring, "C") == "A"
assert list(ring) == ["B", "C"]
```

This wrapper makes discard behavior explicit.

For a real concurrent producer-consumer queue, do not compose `len`, `get`, and `put` this way without synchronization; the full check and update must be one atomic protocol.

## 5. Asymptotic Time & Space Complexity

`put` performs one slot write, modular increment, and size update.

`get` performs one slot read, optional clearing write, modular increment, and size update.

Both take $\Theta(1)$ time.

Iteration over $k$ live items takes $\Theta(k)$ time.

Copying contents into a contiguous array also takes $\Theta(k)$ time.

The backing storage has fixed capacity $C$.

Space usage is $\Theta(C)$ regardless of current occupancy.

This fixed allocation is useful when predictable latency and memory are more important than elastic growth.

An unbounded queue instead uses space proportional to queued items, often with resizing or linked-node overhead.

Modulo can be replaced by a bit mask only when capacity is a power of two and indices use compatible unsigned arithmetic.

That changes constants, not asymptotic complexity.

Clearing a slot may affect garbage-collection behavior but remains constant work.

Concurrent variants can retain $O(1)$ logical operations while adding atomic instructions, cache-line padding, retry loops, or blocking waits.

Those synchronization costs matter in throughput and latency measurements.

## 6. Systems Connections

### Audio and video

Capture threads can write fixed-size samples while playback threads consume them.

Underflow may cause glitches; overflow may drop audio or increase latency depending on policy.

### Networking

Receive rings bound packet buffering and prevent unlimited memory use under burst traffic.

Drops must be counted so operators can distinguish loss from an idle link.

### Logging and telemetry

An overwrite-oldest ring retains the most recent events with fixed memory.

It is useful for crash diagnostics when older history is less valuable than recent state.

### Single-producer single-consumer queues

An SPSC ring can avoid locks with carefully placed atomic index publication and acquire-release ordering.

The simple class here does not supply those guarantees.

### Backpressure

Full-buffer behavior is a product decision as well as a data-structure decision.

Blocking, rejecting, dropping, or overwriting each changes latency, correctness, and observability.

### Cache locality

The contiguous array is cache-friendly compared with per-node linked queues.

False sharing between producer and consumer indices can still reduce throughput in concurrent designs.

### Scheduling and latency

A fixed ring separates short producer bursts from a slower consumer.

Its capacity represents a finite latency budget measured in queued items.

Increasing capacity can reduce drops while increasing the time an item waits before consumption.

For real-time media, lower latency may be more valuable than retaining every old sample.

For audit logs, retaining history may be more important than immediate processing.

The correct overflow policy follows the semantics of the data, not the convenience of the implementation.

### Memory ownership

The producer must not mutate a record after publishing it unless the API explicitly permits shared mutable ownership.

The consumer must not retain references into a reusable byte buffer after that buffer is recycled.

For binary protocols, a ring may store descriptors into a separate slab allocator rather than whole payloads.

That arrangement makes ownership transfer and reclamation part of the queue contract.

### Observability

Useful metrics include current occupancy, maximum occupancy, rejected writes, overwritten items, consumer lag, and wait duration.

An occupancy graph can reveal whether a buffer is absorbing occasional bursts or hiding a permanently overloaded consumer.

Loss counters should carry the interval over which they were measured.

### Testing concurrent versions

Unit tests of FIFO order do not prove memory-order correctness.

Concurrent implementations need stress tests, race detectors where available, and a proof or review of publication ordering.

Test wraparound far beyond one capacity cycle because index bugs often appear only after reuse.

Test shutdown while a producer is blocked or while a consumer is waiting for data.

### Alternatives

Use a linked queue when capacity need not be bounded and allocation overhead is acceptable.

Use a priority queue when dequeue order should follow priority rather than arrival.

Use a deque when both ends need insertion or removal.

Use a channel abstraction when synchronization and cancellation semantics should be owned by a runtime library.

### Capacity sizing

Capacity should be derived from a maximum expected burst, consumer service rate, and permitted delay.

It should not be selected only because a power of two looks convenient.

If arrival rate exceeds service rate indefinitely, every finite buffer eventually fills.

Increasing capacity delays that event but does not solve the imbalance.

Admission control, sampling, batching, or faster consumption may be required.

For lossless pipelines, backpressure must reach the producer before capacity is exhausted.

Capacity tests should include sustained overload, not only one short burst.

They should verify both loss accounting and recovery after the consumer catches up.

The correct capacity is therefore a measured systems parameter, not an algorithmic constant.

Re-evaluate it whenever producer rate, consumer latency, or loss requirements change.

Document the resulting trade-off alongside the queue's public contract.

## 7. Practice Checklist

- Require positive capacity.
- Define head, tail, and size semantics.
- Prove $0\le size\le C$.
- Distinguish full from empty explicitly.
- Use modulo capacity after every index advance.
- Prove FIFO mapping from logical offset to physical slot.
- Test wraparound.
- Test capacity one.
- Test repeated fill-drain cycles.
- Decide overflow policy.
- Make drops observable.
- Clear removed object references when appropriate.
- Avoid using `None` as both data and empty sentinel.
- Separate single-threaded logic from concurrent guarantees.
- Define memory ordering for lock-free variants.
- Avoid multi-step full checks without synchronization.
- Measure occupancy and drop counts.
- Bound untrusted producer rates.
- Document whether iteration is a snapshot or live view.
- Test against a reference deque.
- Measure both occupancy and consumer lag.
- Test full and empty states with equal indices.
- Test discard reporting in overwrite mode.
- Test long-running index wraparound.
- Define ownership of mutable payloads.
- Document whether `put` can block.
- Keep capacity and overflow policy visible in metrics.
- Size capacity from an explicit burst and latency model.
- Verify that overload policy propagates to producers where required.

## 8. Frequently Asked Questions

### Why is it circular?

Indices wrap from the final array slot to zero, allowing freed front slots to be reused.

### Why store size?

With only head and tail, equal indices can mean either empty or full.

Size removes that ambiguity.

### Can I reserve one slot instead?

Yes.

Then full means advancing tail would equal head, but usable capacity is one less than allocated capacity.

### Is a ring buffer always FIFO?

It is FIFO under reject-or-block overflow policy.

Overwrite-oldest mode intentionally discards old items, so it retains FIFO order only among surviving items.

### Is it thread-safe?

Not automatically.

Concurrent use requires locks or a formally designed atomic protocol.

### What happens on overflow?

That depends on the chosen policy: reject, block, drop-newest, or overwrite-oldest.

The choice must be explicit.

### Is modulo slow?

It is constant-time in the asymptotic model.

Power-of-two capacities can use masking in performance-critical implementations after careful profiling.

### Can it grow automatically?

It can, but resizing removes the fixed-capacity guarantee and needs copying or reallocation.

### Why clear dequeued slots?

It releases references to removed objects in garbage-collected runtimes.

It does not affect the FIFO proof.

### What is the most common bug?

Confusing physical array order with logical queue order after wraparound.

Always iterate from head for exactly size positions.
