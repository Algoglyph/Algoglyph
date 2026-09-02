# Circular Linked Lists: Ring Invariants, Tail References & Wraparound Traversal

## 1. Historical Context & Motivation

A circular linked list is a linked list whose last node points back to the first node.

The structure removes the permanent `None` end marker used by a linear list.

Instead of a chain with a beginning and an end, it forms a ring.

That ring is useful when traversal naturally wraps around.

Round-robin schedulers cycle through tasks.

Multiplayer games rotate turns.

Buffers reuse storage after reaching the last slot.

Token rings pass control from one participant to the next.

A circular list models these patterns directly.

The most common representation stores a pointer to the tail node.

The head is then `tail.next`.

That single pointer gives access to both ends of the logical sequence.

Inserting after the tail can append in constant time.

Deleting after the tail can remove the head in constant time.

The representation is compact, but it is also easy to break.

One missed pointer update can split the ring.

One missing termination condition can create an infinite traversal.

The question is:

How can we keep a linked structure circular while still reasoning about order, insertion, deletion, and traversal safely?

Circular linked lists are not a replacement for arrays or deques.

They trade cache locality for cheap local pointer edits and natural wraparound.

They are most useful when a program repeatedly moves from the current item to the next item and rarely needs random access.

## 2. Core Mathematical Invariants

Each node stores a value and a `next` reference.

A nonempty circular singly linked list has a distinguished tail node.

The logical head is:

$$
head = tail.next.
$$

Starting from `head` and following `next` exactly $n$ times returns to `head`.

No earlier step should return to `head`.

That gives the core cycle invariant:

$$
next^n(head)=head
$$

and for $0 < i < n$:

$$
next^i(head)\ne head.
$$

The list has exactly one directed cycle containing every node.

For a one-node list, the only node points to itself.

For an empty list, `tail` is `None`.

There is no separate `head` field in the tail-pointer representation.

That avoids duplicated state.

If both `head` and `tail` are stored, updates must keep `tail.next == head`.

The traversal invariant is different from a linear list.

A loop cannot stop when it sees `None`.

It must stop when it has returned to the starting node.

For a traversal beginning at `head`, visit the current node first.

Then advance to `current.next`.

Stop after the advance returns to `head`.

That "do once, then repeat until start" pattern handles one-node rings correctly.

Insertion after node `p` preserves the ring by redirecting two references:

```text
new.next = p.next
p.next = new
```

If `p` was the tail, the new node becomes the tail for append semantics.

Deletion after node `p` preserves the ring by bypassing one node:

```text
removed = p.next
p.next = removed.next
```

If `removed` was the tail, the predecessor `p` becomes the tail.

If the removed node was the only node, the list becomes empty.

The safety invariant is that every mutation must leave either an empty list or a single closed ring.

## 3. Step-by-Step Execution Trace

Build a circular list containing `A`, `B`, and `C`.

Begin with an empty list:

```text
tail = None
```

Append `A`.

Create a node whose `next` points to itself.

The ring is:

```text
A -> A
```

The tail is `A`.

The head is also `A`.

Append `B`.

Insert `B` after the current tail.

Before insertion, `tail.next` is `A`.

Set `B.next = A`.

Set `A.next = B`.

Move `tail` to `B`.

The logical sequence is:

```text
A -> B -> A
```

Append `C`.

Before insertion, `tail` is `B` and `tail.next` is `A`.

Set `C.next = A`.

Set `B.next = C`.

Move `tail` to `C`.

The ring is:

```text
A -> B -> C -> A
```

Now remove the head.

The head is `tail.next`, which is `A`.

Set `tail.next = A.next`.

The new head is `B`.

The ring becomes:

```text
B -> C -> B
```

The tail remains `C`.

Now rotate once.

Move `tail = tail.next`.

The old head `B` becomes the new tail.

The logical head becomes `C`.

The physical ring has not changed.

Only the chosen tail reference changed.

The logical sequence is now:

```text
C -> B -> C
```

This is why circular lists are useful for round-robin behavior.

Rotation costs one pointer move.

No nodes need to be shifted.

Now delete until the ring is empty.

Popping `C` changes `tail.next` from `C` to `B`.

The ring becomes:

```text
B -> B
```

The tail is still `B`.

Popping `B` removes the only remaining node.

The implementation must set `tail = None`.

Leaving `B.next = B` reachable through `tail` would falsely report a nonempty list.

This last deletion is the case that most often breaks amateur circular-list code.

The invariant after every operation is binary:

Either the list is empty, or the stored tail is part of one closed ring.

## 4. Production-Ready Implementations

The implementation below uses a tail pointer.

It supports append, prepend, pop-front, rotation, and bounded traversal.

The iterator stores the starting node and stops after returning to it.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, TypeVar


T = TypeVar("T")


@dataclass(slots=True)
class Node(Generic[T]):
    value: T
    next: "Node[T] | None" = None


class CircularLinkedList(Generic[T]):
    def __init__(self) -> None:
        self.tail: Node[T] | None = None
        self.size = 0

    def __len__(self) -> int:
        return self.size

    def __iter__(self) -> Iterator[T]:
        if self.tail is None:
            return
        start = self.tail.next
        assert start is not None
        current: Node[T] | None = start
        while current is not None:
            yield current.value
            current = current.next
            if current is start:
                break

    def append(self, value: T) -> None:
        node: Node[T] = Node(value)
        if self.tail is None:
            node.next = node
            self.tail = node
        else:
            head = self.tail.next
            assert head is not None
            node.next = head
            self.tail.next = node
            self.tail = node
        self.size += 1

    def prepend(self, value: T) -> None:
        node: Node[T] = Node(value)
        if self.tail is None:
            node.next = node
            self.tail = node
        else:
            head = self.tail.next
            assert head is not None
            node.next = head
            self.tail.next = node
        self.size += 1

    def pop_front(self) -> T:
        if self.tail is None:
            raise IndexError("pop from empty circular list")
        head = self.tail.next
        assert head is not None
        if head is self.tail:
            self.tail = None
        else:
            self.tail.next = head.next
        self.size -= 1
        return head.value

    def rotate(self, steps: int = 1) -> None:
        if self.tail is None or self.size == 0:
            return
        steps %= self.size
        for _ in range(steps):
            assert self.tail.next is not None
            self.tail = self.tail.next

    def to_list(self) -> list[T]:
        return list(self)


ring: CircularLinkedList[str] = CircularLinkedList()
ring.append("A")
ring.append("B")
ring.append("C")
assert ring.to_list() == ["A", "B", "C"]
assert ring.pop_front() == "A"
assert ring.to_list() == ["B", "C"]
ring.rotate()
assert ring.to_list() == ["C", "B"]
ring.prepend("A")
assert ring.to_list() == ["A", "C", "B"]
assert len(ring) == 3
```

The code uses `size` for rotation modulo arithmetic.

It also makes traversal independent of a `None` terminator.

The `assert` statements protect internal invariants that should always hold after public methods finish.

Production code may replace those assertions with explicit invariant checks in debug builds.

When concurrency is involved, pointer updates need a lock or another synchronization strategy.

A traversal can otherwise observe the ring between two pointer writes.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of nodes in the ring.

Appending with a tail pointer costs $O(1)$.

Prepending with a tail pointer costs $O(1)$.

Removing the head costs $O(1)$.

Rotating by one step costs $O(1)$.

Rotating by $s$ steps costs $O(s \bmod n)$ in the simple implementation.

Traversal over the whole ring costs $\Theta(n)$.

Searching for a value costs $O(n)$.

Removing an arbitrary value costs $O(n)$ because the predecessor must be found.

Random access by index costs $O(n)$.

Each node stores one value and one pointer.

The list uses $\Theta(n)$ memory.

The structure has poor cache locality compared with an array.

Each traversal follows pointers that may live far apart in memory.

That can matter more than Big-O on modern processors.

Compared with a circular buffer, a circular linked list grows without moving elements.

Compared with a circular buffer, it pays one allocation per node.

Compared with a doubly circular list, it uses less memory per node.

Compared with a doubly circular list, deletion of the current node still needs the predecessor unless the caller already has it.

The tail-pointer representation is the usual sweet spot for singly circular lists.

It makes both logical ends reachable from one stored reference.

An implementation that stores only a current cursor has a different cost profile.

It can rotate cheaply.

It cannot append at the logical end unless the cursor is defined as the tail.

An implementation that stores both head and tail can make some code easier to read.

It also creates an extra consistency obligation.

If `head` is stale while `tail.next` is correct, traversal from each field sees a different list.

That kind of duplicated pointer state is not wrong, but it must be tested.

## 6. Systems Connections

Round-robin scheduling is the classic circular-list example.

The scheduler runs the current task and then advances to the next task.

When it reaches the end, it wraps to the beginning automatically.

No special last-task case is needed.

Token-ring protocols use the same conceptual structure.

Control passes from one participant to the next in a cycle.

Game turn systems often rotate active players the same way.

Audio and streaming systems more commonly use circular buffers.

That distinction matters.

A circular buffer stores data in contiguous memory and wraps an index.

A circular linked list stores nodes separately and wraps a pointer.

The linked version is better when membership changes frequently.

The buffer version is better when fixed-capacity throughput and cache locality matter.

Garbage-collected runtimes handle unreachable cycles automatically.

Reference-counted systems may need weak references or explicit cleanup for cycles.

In manual-memory languages, every node in the ring must be released exactly once.

Destroying a circular list with a linear-list deletion loop can run forever.

The cleanup routine must remember the starting node or use the stored size.

Debugging circular lists is also different.

Printing until `None` is unsafe.

Visualizers should cap traversal by `size` or stop when the start node reappears.

The ring invariant is simple, but it must be respected by every tool that inspects the structure.

Circular lists also show up in simulations.

Josephus-style elimination repeatedly removes every $k$th participant from a circle.

The natural operation is "advance, remove next, continue."

A linear list can model the same process, but it pays extra logic at the end of the chain.

The circular representation keeps the wraparound behavior inside the data structure.

For event loops and task rotations, that directness is often the main reason to use it.

For throughput-heavy queues, however, an array-backed ring buffer is usually the better engineering choice.

## 7. Practice Checklist

- Represent an empty ring as `tail = None`.
- Represent a one-node ring with `node.next = node`.
- Keep `head` equal to `tail.next` in nonempty rings.
- Update two links for insertion after a node.
- Update `tail` when appending after the old tail.
- Bypass the head with `tail.next = head.next` when popping front.
- Set `tail = None` after deleting the only node.
- Stop traversal after returning to the start node.
- Never traverse a circular list with only `while current is not None`.
- Maintain `size` if rotation or bounded traversal needs it.
- Test empty, one-node, two-node, and many-node cases.
- Test append followed by full traversal.
- Test prepend followed by full traversal.
- Test pop-front until empty.
- Test rotation by zero, one, $n$, and more than $n$.
- Distinguish circular linked lists from circular arrays.
- Use locks if mutations can race with traversal.
- Avoid exposing raw node references unless the API documents ownership.
- Write cleanup routines that cannot loop forever.
- Visualize the tail-to-head edge when drawing the structure.
- Test deletion of the only node explicitly.
- Test that `tail.next` is never `None` in a nonempty ring.
- Test that traversal visits exactly `size` nodes.
- Test that rotation changes logical order without changing node count.
- Prefer a circular buffer for fixed-capacity producer-consumer queues.

## 8. Frequently Asked Questions

### Is a circular linked list the same as a circular buffer?

No.

A circular linked list wraps pointers between nodes.

A circular buffer wraps array indices inside contiguous storage.

### Why store the tail instead of the head?

With a tail pointer, the head is `tail.next`.

That gives constant-time access to both the logical front and the logical back.

### Can a circular linked list have one node?

Yes.

The node points to itself.

That case is not a bug; it is the base nonempty ring.

### How do you stop traversal?

Remember the start node.

Visit nodes until advancing would return to that start node.

Using `None` as the stop condition is wrong for a valid ring.

### Is deletion always constant time?

Deleting the head is constant time with a tail pointer.

Deleting an arbitrary value is linear unless the predecessor node is already known.

### Why are circular linked lists risky?

They remove the natural `None` terminator.

A wrong loop condition or broken link can create infinite traversal.

### When should I avoid this structure?

Avoid it when you need random access, compact memory layout, or high cache locality.

An array-backed deque or circular buffer is usually better for those workloads.

### What invariant should I check first when debugging?

For any nonempty ring, verify that following `next` exactly `size` times returns to `tail.next`.

If it returns earlier or never returns, the ring is corrupted.
