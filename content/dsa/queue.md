# FIFO Message Queues: Ordering, Backpressure & Ring-Buffer Invariants

![FIFO queue enqueue and dequeue](/images/dsa/fifo-queues-dark.jpg#dark)

## 1. Historical Context & Motivation

A queue stores items in first-in, first-out order.

The earliest item still present is the next item removed.

This policy models waiting lines, work dispatch, and breadth-first exploration.

An enqueue operation adds an item at the logical rear.

A dequeue operation removes an item from the logical front.

The abstraction separates ordering semantics from physical representation.

A queue can use linked nodes, a dynamic array, or a circular buffer.

Each representation preserves FIFO order through different invariants.

Queues appear whenever arrival order is meaningful.

Operating systems queue runnable work and device requests.

Network stacks queue packets awaiting transmission or processing.

Servers place tasks between producers and workers.

Graph algorithms use queues to visit vertices by increasing edge distance.

Event loops use queues to schedule callbacks.

The simplest classroom queue is unbounded.

Real systems cannot allocate without limit.

A bounded queue needs an explicit overload policy.

It may block producers, reject new items, drop old items, or spill to storage.

Those choices change observable behavior.

Backpressure is therefore part of queue semantics, not an implementation afterthought.

Durable message brokers add acknowledgement, retry, and persistence rules.

They may provide at-most-once, at-least-once, or transactional delivery.

None of those guarantees follows from FIFO order alone.

Multiple producers also complicate global ordering.

A broker may preserve order only within one partition or producer stream.

Concurrent consumers can complete work out of dequeue order.

The queue can preserve removal order while the system does not preserve completion order.

This article focuses first on an in-memory bounded FIFO queue.

It then connects that invariant to concurrent and distributed message systems.

The central engineering question is not merely how to append and remove.

It is how to preserve ordering, capacity, and ownership across every boundary state.

## 2. Core Mathematical Invariants

### Abstract sequence invariant

Model the queue as a finite sequence:

$$
Q=\langle q_0,q_1,\ldots,q_{n-1}\rangle.
$$

The front is $q_0$ when `n > 0`.

Enqueue of `x` produces:

$$
Q'=Q\mathbin{\Vert}\langle x\rangle.
$$

Dequeue returns $q_0$ and leaves:

$$
Q'=\langle q_1,\ldots,q_{n-1}\rangle.
$$

These equations define FIFO behavior independently of storage.

### Ring-buffer state

Let array capacity be `C`.

Maintain `head`, `tail`, and `size`.

`head` indexes the next element to dequeue.

`tail` indexes the next free slot for enqueue.

The capacity invariant is:

$$
0\le size\le C.
$$

Indices always satisfy:

$$
0\le head<C,\qquad 0\le tail<C.
$$

Logical element `i` resides at physical index:

$$
(head+i)\bmod C.
$$

### Enqueue transition

Enqueue requires `size < C`.

Write the new value at `buffer[tail]`.

Advance:

$$
tail=(tail+1)\bmod C.
$$

Increment size exactly once.

The previous logical sequence remains a prefix of the new sequence.

### Dequeue transition

Dequeue requires `size > 0`.

Read and logically remove `buffer[head]`.

Advance:

$$
head=(head+1)\bmod C.
$$

Decrement size exactly once.

The returned value was the oldest remaining enqueue.

### Empty and full disambiguation

With only head and tail, `head == tail` can mean empty or full.

The implementation must add information.

A size field disambiguates both states directly.

Another design leaves one physical slot unused.

A third stores a generation or wrap bit.

Mixing these conventions causes off-by-one capacity defects.

### Ownership invariant

Every queued item is owned by exactly one queue slot or node.

A successful dequeue transfers that ownership to the caller.

A failed enqueue must leave ownership with the producer.

Clearing removed slots releases references in managed runtimes.

Without clearing, logically removed objects can remain unintentionally reachable.

### Boundedness invariant

A bounded queue never stores more than `C` live items.

When full, its documented policy decides the transition.

Reject policy leaves the queue unchanged.

Block policy waits until a dequeue creates capacity.

Overwrite policy deliberately removes an old item before insertion.

These policies are not interchangeable.

### Concurrent happens-before invariant

For a synchronized queue, publication of an item happens before a consumer receives it.

The consumer must not observe a partially initialized payload.

Queue metadata updates must be atomic under the chosen synchronization protocol.

Condition-variable waits recheck predicates after waking.

Spurious wakeups do not imply that data or capacity exists.

### Shutdown invariant

An empty open queue may receive future items.

An empty closed queue will never receive another item.

Consumers need to distinguish those states.

Closing should wake blocked producers and consumers.

The API must define whether already queued items drain before termination.

## 3. Step-by-Step Execution Trace

Use a circular buffer with capacity `4`.

Initialize `head = 0`, `tail = 0`, and `size = 0`.

All physical slots are empty.

Enqueue `A`.

Write `A` at physical slot `0`.

Advance tail to `1`.

Increment size to `1`.

The logical queue is `[A]`.

Enqueue `B`.

Write `B` at slot `1`.

Advance tail to `2`.

Size becomes `2`.

The logical queue is `[A,B]`.

Enqueue `C`.

Write `C` at slot `2`.

Advance tail to `3`.

Size becomes `3`.

Dequeue one item.

Read slot `0` and return `A`.

Clear slot `0`.

Advance head to `1`.

Size becomes `2`.

The logical queue is `[B,C]`.

Enqueue `D`.

Write `D` at slot `3`.

Advance tail using `(3 + 1) mod 4 = 0`.

Size becomes `3`.

Enqueue `E`.

Write `E` at wrapped slot `0`.

Advance tail to `1`.

Size becomes `4`.

The queue is now full.

Physical storage is `[E,B,C,D]`.

Logical order is `[B,C,D,E]` from head `1`.

Physical array order is not queue order after wrapping.

Attempt to enqueue `F` under reject policy.

Because size equals capacity, reject the operation.

No index and no slot changes.

Dequeue returns `B` from slot `1`.

Head advances to `2` and size becomes `3`.

Next dequeue returns `C` from slot `2`.

Head advances to `3` and size becomes `2`.

Next dequeue returns `D` from slot `3`.

Head wraps to `0` and size becomes `1`.

Final dequeue returns `E` from slot `0`.

Head advances to `1` and size becomes `0`.

Now head equals tail again.

The size field proves that this equality means empty, not full.

### Breadth-first trace

Consider graph edges `A-B`, `A-C`, `B-D`, and `C-E`.

Enqueue start vertex `A` and mark it discovered.

Dequeue `A` and enqueue undiscovered neighbors `B` then `C`.

Queue becomes `[B,C]`.

Dequeue `B` and enqueue `D`.

Queue becomes `[C,D]`.

Dequeue `C` and enqueue `E`.

Queue becomes `[D,E]`.

Vertices at distance one were removed before vertices at distance two.

FIFO order preserves the BFS layer invariant.

## 4. Production-Ready Implementations

The following generic Python queue uses fixed-capacity circular storage.

```python
from __future__ import annotations

from collections.abc import Iterator
from typing import Generic, Optional, TypeVar, cast

T = TypeVar("T")


class QueueFull(Exception):
    pass


class QueueEmpty(Exception):
    pass


class RingQueue(Generic[T]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._buffer: list[Optional[T]] = [None] * capacity
        self._head = 0
        self._tail = 0
        self._size = 0

    @property
    def capacity(self) -> int:
        return len(self._buffer)

    def __len__(self) -> int:
        return self._size

    def __bool__(self) -> bool:
        return self._size != 0

    def enqueue(self, item: T) -> None:
        if self._size == self.capacity:
            raise QueueFull("queue capacity is exhausted")
        self._buffer[self._tail] = item
        self._tail = (self._tail + 1) % self.capacity
        self._size += 1

    def dequeue(self) -> T:
        if self._size == 0:
            raise QueueEmpty("queue contains no items")
        item = cast(T, self._buffer[self._head])
        self._buffer[self._head] = None
        self._head = (self._head + 1) % self.capacity
        self._size -= 1
        return item

    def peek(self) -> T:
        if self._size == 0:
            raise QueueEmpty("queue contains no items")
        return cast(T, self._buffer[self._head])

    def __iter__(self) -> Iterator[T]:
        expected_size = self._size
        for offset in range(expected_size):
            index = (self._head + offset) % self.capacity
            yield cast(T, self._buffer[index])

    def validate(self) -> None:
        assert 0 <= self._head < self.capacity
        assert 0 <= self._tail < self.capacity
        assert 0 <= self._size <= self.capacity
        assert self._tail == (self._head + self._size) % self.capacity


queue = RingQueue[str](4)
for value in ["A", "B", "C"]:
    queue.enqueue(value)
assert queue.dequeue() == "A"
queue.enqueue("D")
queue.enqueue("E")
assert list(queue) == ["B", "C", "D", "E"]
assert [queue.dequeue() for _ in range(4)] == ["B", "C", "D", "E"]
queue.validate()
```

The buffer allows `None` as an internal empty marker while still accepting `None` conceptually through typing caveats.

A private sentinel object avoids ambiguity if exact slot inspection matters.

The iterator is not safe against concurrent mutation.

A version counter could make mutation fail fast.

The class is not thread-safe.

Use a mutex plus not-empty and not-full conditions for blocking multi-thread access.

The state transition should occur while holding one queue mutex.

Signal not-empty after a successful enqueue.

Signal not-full after a successful dequeue.

Wait in a loop while the corresponding predicate is false.

Cancellation and closure should be part of that predicate.

### Linked representation trade-off

A linked queue stores head and tail node references.

Enqueue links a new tail in $O(1)$ time.

Dequeue removes the head in $O(1)$ time.

It grows until allocation fails unless another capacity policy is added.

It also pays per-node references and poorer cache locality.

## 5. Asymptotic Time & Space Complexity

Ring-buffer enqueue takes $O(1)$ worst-case time.

Ring-buffer dequeue takes $O(1)$ worst-case time.

Peek takes $O(1)$ worst-case time.

Length takes $O(1)$ because size is cached.

Iteration over `n` queued items takes $O(n)$ time.

The fixed buffer uses $O(C)$ space for capacity `C`.

Live logical content uses `n <= C` slots.

Indices and size require $O(1)$ metadata.

A linked queue uses $O(n)$ node storage.

Each node adds at least one successor reference.

A dynamic-array queue that shifts on every dequeue takes $O(n)$ per removal.

Maintaining a moving head avoids that shift.

Occasional compaction can amortize reclaimed prefix storage.

Deque-based standard libraries commonly use block or ring strategies.

Concurrent queue complexity depends on contention and progress guarantees.

A mutex-protected operation is algorithmically $O(1)$ but may wait unbounded time.

Lock-free does not mean wait-free.

Lock-free guarantees system-wide progress under its formal model.

Wait-free guarantees each operation completes in bounded steps.

Distributed queue latency includes serialization, networking, persistence, and acknowledgement.

Those costs dominate local pointer or index operations.

At-least-once delivery can increase total processing through duplicates.

Backpressure bounds memory but can increase producer latency.

Dropping preserves producer latency but loses work.

Capacity selection is therefore an operational trade-off.

## 6. Systems Connections

Breadth-first search uses FIFO order to preserve nondecreasing unweighted distance.

Topological sorting with Kahn's algorithm queues zero-indegree vertices.

Operating systems keep run queues for schedulable threads.

Network interfaces use transmit and receive rings.

Audio systems use circular buffers between capture and playback stages.

Event loops queue tasks and microtasks under distinct scheduling rules.

Thread pools place submitted work in bounded or unbounded queues.

Web servers need overload behavior before queues consume all memory.

Message brokers persist records and track consumer positions.

Kafka-style logs preserve order within a partition rather than globally.

AMQP brokers add routing, acknowledgements, and redelivery.

Cloud queues often provide visibility timeouts rather than destructive reads.

A message reappears if processing is not acknowledged in time.

At-least-once systems require idempotent consumers or deduplication.

Dead-letter queues isolate repeatedly failing messages.

Priority queues are not FIFO queues even when equal priorities are stable.

Dequeues can support work stealing when workers take from opposite ends.

Actor mailboxes serialize message reception per actor.

Completion order can still differ when actors spawn asynchronous work.

Database write-ahead logs resemble append-only sequences, not destructive FIFO queues.

Observability should track depth, age, enqueue rate, dequeue rate, and rejection count.

Oldest-item age often exposes trouble earlier than average depth.

## 7. Practice Checklist

- Define FIFO ordering precisely.
- Decide whether capacity is bounded.
- Define behavior when the queue is full.
- Define behavior when the queue is empty.
- Distinguish rejection, blocking, dropping, and overwriting.
- Maintain head as the next dequeue position.
- Maintain tail as the next enqueue position.
- Keep size between zero and capacity.
- Wrap indices with the same modulus.
- Clear removed reference slots.
- Test the empty state where head equals tail.
- Test the full state where head also equals tail.
- Use size or another explicit disambiguator.
- Test wraparound in both indices.
- Verify logical order independently from physical array order.
- Test capacity one.
- Test repeated fill-and-drain cycles.
- Leave state unchanged after rejected operations.
- Define iterator behavior under mutation.
- Synchronize all shared metadata together.
- Recheck condition predicates after wakeup.
- Publish payload state before making an item visible.
- Define queue closure and draining semantics.
- Wake blocked operations during shutdown.
- Bound memory in production pipelines.
- Instrument queue depth and oldest-item age.
- Define retry and duplicate handling for durable messages.
- Make consumers idempotent under at-least-once delivery.
- Do not equate dequeue order with completion order.
- State partition-level versus global ordering.
- Include persistence and network costs in distributed analysis.
- Choose a deque when both ends require operations.
- Choose a priority queue when priority overrides arrival time.
- Validate BFS discovery marking occurs before duplicate enqueue.

## 8. Frequently Asked Questions

### What does FIFO guarantee?

Among items still present, the earliest enqueued item is removed first.

It does not automatically guarantee processing completion order.

### Why use a circular buffer?

It reuses fixed storage without shifting elements after dequeue.

Both primary operations remain constant time.

### Why store size?

Head equal to tail is otherwise ambiguous between empty and full states.

### Is a queue thread-safe by default?

No.

Thread safety requires synchronization or a proven concurrent algorithm.

### What is backpressure?

It slows or rejects producers when consumers cannot keep up.

This prevents unbounded queued work.

### Why clear a dequeued slot?

It releases references so removed objects can be reclaimed.

### Does at-least-once mean exactly once?

No.

Retries can deliver duplicates, so consumers must account for them.

### When is a linked queue preferable?

When variable growth and stable nodes matter more than locality and bounded memory.

### Why does BFS need a queue?

FIFO processing visits all vertices at distance `d` before those at distance `d+1`.

### What is the most important production decision?

Define what happens when arrival rate exceeds service capacity.
