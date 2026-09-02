# Doubly Linked Lists: Bidirectional Links, Sentinel Nodes & Constant-Time Splicing

![Doubly linked list previous and next pointers](/images/dsa/doubly-linked-lists-dark.jpg#dark)

## 1. Historical Context & Motivation

A doubly linked list stores a sequence as nodes connected in both directions.

Each node has a `next` pointer and a `prev` pointer.

The `next` pointer moves forward through the sequence.

The `prev` pointer moves backward.

This extra pointer is the difference from a singly linked list.

It costs memory.

It also makes deletion and splicing much easier when a node reference is already known.

In a singly linked list, deleting a node usually requires the predecessor.

In a doubly linked list, the node carries its own predecessor pointer.

That is why doubly linked lists appear in LRU caches, intrusive kernel lists, editor buffers, and linked hash maps.

The structure is useful when elements must be moved, removed, or spliced without shifting arrays.

It is not useful for random access.

Finding the element at index `i` still requires walking.

Modern processors also punish pointer-heavy structures because nodes may be scattered in memory.

An array often wins when traversal locality matters.

The central question is:

When is paying for backward links worthwhile, and how do we keep two directions consistent after every mutation?

A doubly linked list is simple only if every operation preserves both sides of every neighboring relationship.

The algorithmic power comes from local rewiring.

The risk comes from local rewiring too.

## 2. Core Mathematical Invariants

For every adjacent pair of nodes `a` and `b`, the list must satisfy:

```text
a.next == b
b.prev == a
```

Those two facts must agree.

If only one direction is updated, forward traversal and backward traversal describe different lists.

For a nonempty list without sentinels:

The head node has `prev = None`.

The tail node has `next = None`.

For every internal node, both pointers are non-null.

The list order is obtained by following `next` from the head.

The reverse order is obtained by following `prev` from the tail.

A sentinel-based list uses dummy boundary nodes.

The head sentinel is not a real value.

The tail sentinel is not a real value.

An empty sentinel list satisfies:

```text
head.next == tail
tail.prev == head
```

There are no special null cases for insertion or deletion between sentinels.

Every real node lies between `head` and `tail`.

Insertion between `left` and `right` must perform four pointer writes:

```text
node.prev = left
node.next = right
left.next = node
right.prev = node
```

Deletion of `node` must reconnect its neighbors:

```text
node.prev.next = node.next
node.next.prev = node.prev
```

Then the removed node's links can be cleared.

The size invariant is that the stored count equals the number of real nodes reachable from `head.next` before `tail`.

The bidirectional invariant is stronger than reachability.

Every forward edge must have a matching backward edge.

Every backward edge must have a matching forward edge.

That symmetry is the heart of the data structure.

## 3. Step-by-Step Execution Trace

Use a sentinel list.

Start empty:

```text
HEAD <-> TAIL
```

Append `A`.

Insert it between `HEAD` and `TAIL`.

```text
HEAD <-> A <-> TAIL
```

Append `B`.

Insert it between `A` and `TAIL`.

```text
HEAD <-> A <-> B <-> TAIL
```

Append `C`.

Insert it between `B` and `TAIL`.

```text
HEAD <-> A <-> B <-> C <-> TAIL
```

Now remove `B`.

The predecessor is `A`.

The successor is `C`.

Set `A.next = C`.

Set `C.prev = A`.

The list becomes:

```text
HEAD <-> A <-> C <-> TAIL
```

The removed node `B` can have its links cleared.

Now insert `B` at the front.

The insertion position is between `HEAD` and `A`.

Set `B.prev = HEAD`.

Set `B.next = A`.

Set `HEAD.next = B`.

Set `A.prev = B`.

The list becomes:

```text
HEAD <-> B <-> A <-> C <-> TAIL
```

Forward traversal yields:

```text
B, A, C
```

Backward traversal from the tail side yields:

```text
C, A, B
```

Both traversals describe the same sequence in opposite directions.

That agreement is the invariant to check after every mutation.

Now trace the LRU-cache movement pattern.

Suppose the recency list stores most recent at the front:

```text
HEAD <-> C <-> B <-> A <-> TAIL
```

Here `C` is most recent and `A` is least recent.

Access key `A`.

The hash map gives a direct reference to node `A`.

Remove `A` from before `TAIL`.

The list becomes:

```text
HEAD <-> C <-> B <-> TAIL
```

Insert `A` after `HEAD`.

The list becomes:

```text
HEAD <-> A <-> C <-> B <-> TAIL
```

No search through the list was needed.

That is the key point.

The list alone does not make cache access constant time.

The map and list together do.

If capacity is exceeded, remove the node before `TAIL`.

That node is now `B`.

Eviction is also constant time because the sentinel exposes the least-recent end.

## 4. Production-Ready Implementations

The implementation below uses head and tail sentinels.

It exposes append, append-left, pop, pop-left, and removal by node reference.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, TypeVar


T = TypeVar("T")


@dataclass(slots=True)
class Node(Generic[T]):
    value: T | None = None
    prev: "Node[T] | None" = None
    next: "Node[T] | None" = None


class DoublyLinkedList(Generic[T]):
    def __init__(self) -> None:
        self.head: Node[T] = Node()
        self.tail: Node[T] = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.size = 0

    def __len__(self) -> int:
        return self.size

    def __iter__(self) -> Iterator[T]:
        current = self.head.next
        while current is not self.tail:
            assert current is not None
            assert current.value is not None
            yield current.value
            current = current.next

    def _insert_between(self, value: T, left: Node[T], right: Node[T]) -> Node[T]:
        node = Node(value=value, prev=left, next=right)
        left.next = node
        right.prev = node
        self.size += 1
        return node

    def append(self, value: T) -> Node[T]:
        assert self.tail.prev is not None
        return self._insert_between(value, self.tail.prev, self.tail)

    def append_left(self, value: T) -> Node[T]:
        assert self.head.next is not None
        return self._insert_between(value, self.head, self.head.next)

    def remove(self, node: Node[T]) -> T:
        if node is self.head or node is self.tail:
            raise ValueError("cannot remove sentinel node")
        left = node.prev
        right = node.next
        if left is None or right is None:
            raise ValueError("node is not linked")
        left.next = right
        right.prev = left
        node.prev = None
        node.next = None
        self.size -= 1
        assert node.value is not None
        return node.value

    def pop_left(self) -> T:
        if self.size == 0:
            raise IndexError("pop from empty list")
        assert self.head.next is not None
        return self.remove(self.head.next)

    def pop(self) -> T:
        if self.size == 0:
            raise IndexError("pop from empty list")
        assert self.tail.prev is not None
        return self.remove(self.tail.prev)

    def to_list(self) -> list[T]:
        return list(self)


items = DoublyLinkedList[str]()
a = items.append("A")
b = items.append("B")
c = items.append("C")
assert items.to_list() == ["A", "B", "C"]
assert items.remove(b) == "B"
items.append_left("B")
assert items.to_list() == ["B", "A", "C"]
assert items.pop() == "C"
assert items.pop_left() == "B"
assert items.to_list() == ["A"]
assert len(items) == 1
```

Sentinels remove most edge-case branches.

Insertion at the front and insertion at the back use the same helper.

Deletion in the middle and deletion at either end use the same helper.

The implementation clears removed node links.

That prevents accidental reuse as if the node were still linked.

It also helps garbage collectors break chains of references.

If `None` must be a valid stored value, sentinel nodes need a separate flag or a private sentinel value.

The example keeps the code compact by treating sentinel values as `None`.

Node handles should be treated carefully.

Once a node is removed, calling `remove` on the same node again should fail.

That is why the example clears `prev` and `next`.

In an intrusive list, the containing object may have a boolean `linked` flag.

Without such a guard, double removal can corrupt neighboring nodes that have already changed.

If an API returns node handles to callers, document whether handles survive mutation.

Many containers avoid exposing handles at all.

LRU caches can keep them internally where invariants are easier to protect.

## 5. Asymptotic Time & Space Complexity

Insertion next to a known node is $O(1)$.

Deletion of a known node is $O(1)$.

Appending to either end is $O(1)$ with tail access or sentinels.

Popping from either end is $O(1)$.

Searching for a value is $O(n)$.

Accessing index `i` is $O(n)$.

Traversal is $\Theta(n)$.

Each node stores a value plus two links.

The memory cost is $\Theta(n)$.

Compared with a singly linked list, the extra `prev` pointer roughly doubles link storage.

Compared with a dynamic array, each node usually requires a separate allocation.

That allocation overhead can dominate for small values.

Cache locality is usually poor.

The CPU cannot assume the next logical node is near the current node in memory.

The asymptotic advantage appears when the program already has node references.

If deletion starts by searching for the node, the operation is still $O(n)$ overall.

This distinction matters in LRU caches.

The hash map finds the node in $O(1)$ average time.

The doubly linked list then moves or removes that known node in $O(1)$.

Without the hash map, the list alone would not give constant-time lookup.

Splicing a contiguous range can also be constant time when boundary nodes are known.

Detach the first and last nodes of the range.

Reconnect the gap they left behind.

Then connect the range into its new position.

The number of pointer writes is constant.

The number of moved logical elements may be large.

This is one reason linked lists are useful in some editor and scheduler internals.

## 6. Systems Connections

LRU caches are the signature use case.

A hash map stores key-to-node references.

A doubly linked list stores recency order.

When a key is accessed, its node is removed from its current position and moved to the front.

When capacity is exceeded, the least-recently-used node is removed from the back.

Both list operations are constant time because the node reference is already known.

Operating systems use linked lists for schedulers and kernel queues.

Some of those lists are intrusive.

An intrusive list stores link fields inside the object being linked rather than allocating separate wrapper nodes.

That improves control over allocation and ownership.

Text editors may use linked structures for buffers, although gap buffers, ropes, and piece tables are often better for large documents.

The useful property is local editing near known positions.

Databases and storage engines use linked pages or records in some indexing and free-list structures.

Again, the benefit is local splicing rather than random access.

In concurrent systems, doubly linked lists are difficult to make lock-free.

Updating two directions consistently requires careful synchronization.

A reader observing the list between pointer writes can see an impossible state.

For that reason, many high-performance systems prefer arrays, ring buffers, or specialized queues unless splicing is essential.

The structure is powerful, but it is not magically fast.

It wins only when its operation pattern matches the workload.

Memory ownership is the other systems concern.

Garbage-collected languages reclaim removed nodes when no references remain.

Manual-memory languages must free nodes exactly once.

Intrusive lists must not free the containing object merely because it was unlinked.

Those ownership rules belong in the API contract, not only in comments near pointer manipulation.

Debug builds can include a local consistency check.

Walk forward from `head` to `tail`.

At each step, verify `current.next.prev == current`.

Count real nodes during the walk.

The count should match `size`.

That check is linear, so it is not for every hot-path operation in production.

It is excellent for tests after complex splices.

## 7. Practice Checklist

- Check both `next` and `prev` after every mutation.
- Use sentinels to reduce empty-list edge cases.
- Do not remove sentinel nodes.
- Clear removed node links.
- Keep `size` synchronized with real nodes.
- Test empty insertion and deletion.
- Test one-node removal.
- Test removing the head real node.
- Test removing the tail real node.
- Test removing a middle node.
- Test forward traversal.
- Test backward traversal if exposed.
- Avoid claiming index access is constant time.
- Pair the list with a hash map for LRU caches.
- Distinguish node-reference deletion from value-based deletion.
- Document whether node handles remain valid after removal.
- Consider cache locality before using linked nodes.
- Use locks or another safety strategy for shared mutable lists.
- Avoid storing public sentinel values as real data.
- Prefer arrays when most operations scan the sequence.
- Test double removal of the same node.
- Keep node handles private unless callers truly need them.
- Document ownership after unlinking.
- In LRU caches, update the hash map and list in the same operation.
- Verify eviction removes the tail-side real node, not the sentinel.
- Add a debug consistency walk for complex pointer code.
- Confirm forward and backward traversals report reverse orders.

## 8. Frequently Asked Questions

### Why use a doubly linked list instead of a singly linked list?

Use it when you need efficient deletion or movement of a known node.

The backward pointer gives direct access to the predecessor.

### Why use sentinels?

Sentinels turn front, back, and middle operations into the same pointer-rewiring pattern.

They remove many null checks.

### Is deletion always constant time?

Only if you already have the node reference.

Finding a node by value is still linear.

### Why do LRU caches use doubly linked lists?

The hash map finds nodes quickly.

The list moves known nodes and removes the oldest node quickly.

Together they give efficient lookup and recency updates.

### Are doubly linked lists cache-friendly?

Usually no.

Nodes are often separate allocations, so traversal jumps around memory.

### What is the most common pointer bug?

Updating `next` but forgetting the matching `prev`, or the reverse.

Forward and backward traversal then disagree.

### Can a removed node be reused?

Only if the API clearly supports it.

Clearing links after removal prevents accidental double removal.

### When should I avoid this structure?

Avoid it for random access, dense scans, or workloads where arrays provide better locality and simpler memory behavior.

### What should a diagram show?

Show both directions between adjacent nodes and highlight the four pointer writes required for insertion.
