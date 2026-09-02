# FIFO Queues: Arrival Order, Ring Buffers & Breadth-First Processing

![FIFO queue enqueue and dequeue order](/images/dsa/fifo-queues-dark.jpg#dark)

## 1. Historical Context & Motivation

A FIFO queue removes items in the same order they were inserted.

FIFO means first in, first out.

The first item to arrive is the first item to leave.

That rule appears in everyday lines, operating-system schedulers, network buffers, event loops, and graph traversal.

A stack gives last-in-first-out behavior.

A priority queue removes the most urgent item.

A FIFO queue preserves arrival order.

That makes it the natural structure when fairness or layer-by-layer processing matters.

Breadth-first search uses a FIFO queue to visit vertices in increasing distance from the source.

Producer-consumer systems use queues to decouple the rate at which work arrives from the rate at which workers process it.

Message brokers expose durable queue-like behavior at system scale.

The in-memory data structure is smaller than those systems, but the core invariant is the same.

Enqueue adds at the back.

Dequeue removes from the front.

Nothing jumps ahead unless the abstraction changes.

The central question is:

How can a collection support ordered arrival and removal without shifting every remaining element?

The usual answer is to track front and back positions.

For array-backed queues, a circular buffer avoids wasted space at the front.

For linked queues, head and tail pointers avoid traversal during enqueue.

The API is simple.

The operational behavior depends on capacity, blocking, growth, and concurrency choices.

## 2. Core Mathematical Invariants

A queue stores a logical sequence:

$$
[x_0,x_1,\ldots,x_{m-1}].
$$

The next dequeue returns $x_0$.

The next enqueue appends after $x_{m-1}$.

After `enqueue(y)`, the logical sequence becomes:

$$
[x_0,x_1,\ldots,x_{m-1},y].
$$

After `dequeue()`, the returned value is $x_0$ and the remaining sequence is:

$$
[x_1,\ldots,x_{m-1}].
$$

For a circular-array queue, store `front`, `size`, and `capacity`.

Logical index `i` maps to:

$$
(front+i)\bmod capacity.
$$

The back write position is:

$$
(front+size)\bmod capacity.
$$

The queue is empty when `size == 0`.

It is full when `size == capacity` for a bounded queue.

Some implementations store `front` and `back` instead.

Then they either keep a `size` field or reserve one empty slot to distinguish full from empty.

The key invariant is that logical order does not depend on physical array order.

When `front` wraps, the live sequence may be split across the end and beginning of the buffer.

For linked queues, the invariant is:

The head pointer references the next node to dequeue.

The tail pointer references the last node.

If the queue is empty, both are null.

If the queue has one node, head and tail reference the same node.

Every enqueue updates the old tail's `next` pointer and then moves tail.

Every dequeue moves head.

If head becomes null, tail must become null too.

## 3. Step-by-Step Execution Trace

Use a circular buffer of capacity four.

Start empty:

```text
buffer: [_, _, _, _]
front:  0
size:   0
```

Enqueue `A`.

Write at `(front + size) mod 4 = 0`.

```text
buffer: [A, _, _, _]
front:  0
size:   1
```

Enqueue `B`.

Write at index `1`.

```text
buffer: [A, B, _, _]
front:  0
size:   2
```

Dequeue.

Return `A`.

Advance front to `1`.

```text
buffer: [_, B, _, _]
front:  1
size:   1
```

Enqueue `C`.

Write at `(1 + 1) mod 4 = 2`.

Enqueue `D`.

Write at index `3`.

Enqueue `E`.

Write at `(1 + 3) mod 4 = 0`.

The physical buffer is:

```text
buffer: [E, B, C, D]
front:  1
size:   4
```

The logical queue is:

```text
[B, C, D, E]
```

The next dequeue returns `B`, not `E`.

The wraparound slot at physical index zero is the newest item.

This trace is the queue bug detector.

If code treats the physical array from index zero as the logical sequence, it will return the wrong item after wraparound.

Now trace BFS queue behavior on:

```text
A -> B, C
B -> D
C -> E
```

Start from `A`.

The queue is:

```text
[A]
```

Dequeue `A`.

Enqueue undiscovered neighbors `B` and `C`.

The queue becomes:

```text
[B, C]
```

Both vertices have distance one.

Dequeue `B`.

Enqueue `D`.

The queue becomes:

```text
[C, D]
```

Dequeue `C`.

Enqueue `E`.

The queue becomes:

```text
[D, E]
```

Vertices `D` and `E` have distance two.

The FIFO rule ensures all distance-one vertices are processed before distance-two vertices.

That is the invariant behind BFS shortest paths in unweighted graphs.

If the queue were replaced with a stack, the traversal could dive early and lose layer order.

## 4. Production-Ready Implementations

The implementation below is a bounded circular-array queue.

It raises on overflow instead of silently growing.

That behavior is useful for backpressure examples.

```python
from typing import Generic, TypeVar


T = TypeVar("T")


class BoundedQueue(Generic[T]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._data: list[T | None] = [None] * capacity
        self._front = 0
        self._size = 0

    def __len__(self) -> int:
        return self._size

    def is_empty(self) -> bool:
        return self._size == 0

    def is_full(self) -> bool:
        return self._size == len(self._data)

    def enqueue(self, value: T) -> None:
        if self.is_full():
            raise OverflowError("queue is full")
        index = (self._front + self._size) % len(self._data)
        self._data[index] = value
        self._size += 1

    def dequeue(self) -> T:
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        value = self._data[self._front]
        self._data[self._front] = None
        self._front = (self._front + 1) % len(self._data)
        self._size -= 1
        assert value is not None
        return value

    def to_list(self) -> list[T]:
        result: list[T] = []
        for offset in range(self._size):
            value = self._data[(self._front + offset) % len(self._data)]
            assert value is not None
            result.append(value)
        return result


queue = BoundedQueue[str](4)
queue.enqueue("A")
queue.enqueue("B")
assert queue.dequeue() == "A"
queue.enqueue("C")
queue.enqueue("D")
queue.enqueue("E")
assert queue.to_list() == ["B", "C", "D", "E"]
assert queue.dequeue() == "B"
```

A queue is also the core data structure in breadth-first search.

```python
from collections import deque


def bfs_distances(graph: dict[str, list[str]], source: str) -> dict[str, int]:
    distances = {source: 0}
    frontier: deque[str] = deque([source])
    while frontier:
        vertex = frontier.popleft()
        for neighbor in graph.get(vertex, []):
            if neighbor not in distances:
                distances[neighbor] = distances[vertex] + 1
                frontier.append(neighbor)
    return distances


graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["D", "E"],
    "D": [],
    "E": [],
}
assert bfs_distances(graph, "A") == {"A": 0, "B": 1, "C": 1, "D": 2, "E": 2}
```

Use standard-library queues or deques in production unless capacity behavior or synchronization needs are special.

For concurrent producers and consumers, use a thread-safe queue rather than sharing this simple class.

For queues that permit `None`, replace the internal empty marker with a private sentinel.

Bounded queues need an explicit overload contract.

Rejecting a push is simple.

Blocking the producer may be right in threaded code.

Dropping the newest item may be right for lossy telemetry.

Dropping the oldest item may be right for "latest state" dashboards.

Each policy preserves or changes FIFO semantics in a different way.

The data structure should not hide that decision.

## 5. Asymptotic Time & Space Complexity

Enqueue is $O(1)$ for a circular buffer when capacity is available.

Dequeue is $O(1)$.

Peeking at the front is $O(1)$ when implemented.

The queue stores up to `capacity` elements.

Space is:

$$
O(capacity).
$$

For an unbounded growing queue, append can be $O(1)$ amortized if geometric resizing is used.

For a linked queue, enqueue and dequeue are $O(1)$ with head and tail pointers.

Linked queues use $O(n)$ memory plus node-allocation overhead.

Circular buffers have better locality.

Linked queues can grow one node at a time.

Using a plain dynamic array with `pop(0)` is usually wrong for queues.

Removing index zero shifts all later elements.

That makes each dequeue $O(n)$.

A sequence of $n$ dequeues can become $O(n^2)$.

BFS with an efficient FIFO queue runs in:

$$
O(V+E)
$$

with adjacency lists.

Using an inefficient front-removal array can accidentally dominate traversal time.

Data-structure choice therefore changes the real algorithmic bound.

For producer-consumer workloads, throughput is not the only metric.

Queue length over time measures backlog.

Maximum queue length measures burst absorption.

Time spent waiting in the queue measures latency.

A queue can make a system look stable while latency grows.

That is why bounded queues and backpressure are systems-level invariants, not only implementation details.

## 6. Systems Connections

Queues are everywhere in systems because producers and consumers rarely run at exactly the same speed.

An event loop receives tasks and processes them later.

A web server may queue accepted requests before workers handle them.

A logging pipeline may queue records before flushing batches.

A message broker provides durable queue-like delivery across processes.

Operating systems use run queues to track schedulable work, though policies are often more complex than pure FIFO.

Network devices use queues for packets.

Queue capacity becomes a policy decision.

If a bounded queue fills, the system can block producers, drop work, reject requests, or apply backpressure upstream.

An unbounded queue avoids immediate rejection but can move failure to memory exhaustion.

That is usually worse.

The simple DSA queue therefore maps directly to production design questions.

What is the maximum backlog?

What happens when it is exceeded?

Is FIFO fairness required?

Can urgent work bypass the queue?

If priorities are introduced, the structure is no longer a pure FIFO queue.

That change should be explicit.

Fairness also has limits.

FIFO is fair with respect to arrival order inside one queue.

It is not fair across multiple producers if one producer floods the queue first.

Systems may use per-producer queues or weighted scheduling above the basic data structure.

The in-memory FIFO queue remains a component inside the larger policy.

## 7. Practice Checklist

- Enqueue at the back.
- Dequeue from the front.
- Preserve arrival order.
- Track size separately from capacity.
- Use modulo arithmetic for circular buffers.
- Test wraparound before and after full capacity.
- Clear dequeued slots if references should be released.
- Reject dequeue from an empty queue cleanly.
- Decide whether the queue is bounded or growing.
- Define overflow behavior for bounded queues.
- Do not implement queues with repeated `pop(0)` on arrays.
- Use a thread-safe queue for concurrent access.
- Use FIFO queues for BFS layer order.
- Use priority queues when priority can override arrival order.
- Test one-element enqueue and dequeue.
- Test full queue behavior.
- Test alternating enqueue and dequeue.
- Document whether `None` is a valid value.
- Prefer circular buffers for fixed-capacity locality.
- Prefer standard libraries unless custom behavior is required.
- Trace BFS by queue contents, not only visited order.
- Monitor queue length in producer-consumer systems.
- Treat latency in queue as a first-class metric.
- Decide whether overload should reject, block, or drop.
- Do not call a priority queue FIFO after adding bypass rules.
- Test that tail state resets after the final dequeue.
- Test that wraparound does not change dequeue order.
- Test overload policy explicitly.
- Test whether queue metrics include waiting time.
- Keep fairness claims scoped to one queue.
- Avoid exposing physical buffer slots as public state.

## 8. Frequently Asked Questions

### What does FIFO mean?

First in, first out.

The earliest enqueued item is removed first.

### Is a queue the same as a deque?

No.

A queue exposes enqueue at one end and dequeue at the other.

A deque supports insertion and removal at both ends.

### Why use a circular buffer?

It reuses freed front slots without shifting elements.

Modulo arithmetic preserves logical order.

### What happens when a bounded queue is full?

The implementation must choose a policy: reject, block, drop, or apply backpressure.

The simple example raises an overflow error.

### Why is `pop(0)` bad for queues?

It shifts every remaining array element left.

That makes dequeue linear instead of constant time.

### Why does BFS need FIFO order?

FIFO order processes vertices by discovery layer.

That gives shortest edge-count distances in unweighted graphs.

### Should production queues be unbounded?

Usually no.

Unbounded queues can hide overload until memory is exhausted.

### What is the most common circular-buffer bug?

Confusing physical array order with logical queue order after wraparound.

### What should a diagram show?

Show front, back, size, capacity, and wraparound when the newest element lands at an earlier physical index.
