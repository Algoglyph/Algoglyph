# Singly Linked Lists: Forward Links, Predecessor Search & Safe Chain Mutation

![Singly linked list nodes](/images/dsa/singly-linked-lists-dark.jpg#dark)

## 1. Historical Context & Motivation

A singly linked list stores a sequence as nodes connected in one direction.

Each node holds a payload and a `next` reference.

The list begins at `head`.

The final node points to `null` in an ordinary acyclic list.

Unlike an array, nodes need not occupy adjacent memory addresses.

This allows local insertion without shifting later payloads.

It also removes constant-time numeric indexing.

Reaching position `i` requires following `i` links from the head.

The structure predates modern contiguous container libraries.

It remains central to queues, adjacency structures, free lists, and chaining.

Singly linked lists minimize link metadata compared with doubly linked lists.

The trade-off is inability to move backward directly.

Deleting a known node generally requires its predecessor.

Appending requires traversal unless a tail reference is maintained.

A cached tail creates additional boundary invariants.

A sentinel head can simplify insertion and deletion at logical index zero.

The sentinel is structural and does not represent a user element.

This article uses a sentinel plus a cached tail and size.

That design keeps predecessor-based operations uniform.

Nodes are mutable and exclusively owned by one list.

Callers receive payload values rather than raw node references.

That prevents accidental external rewiring.

In managed runtimes, unreachable nodes become collectible.

In manual-memory languages, the list must release removed nodes explicitly.

Reference cycles can defeat simple destruction assumptions.

Concurrent mutation requires synchronization.

A singly linked shape alone does not make an operation atomic.

Cache locality is usually worse than a dynamic array.

Every traversal step depends on the previous pointer load.

Asymptotic notation hides allocator overhead and cache misses.

Use a list when stable nodes or known-position local mutation justify those costs.

Do not choose it solely from the phrase “constant-time insertion.”

Finding the insertion predecessor may still be linear.

## 2. Core Mathematical Invariants

### Reachability invariant

Logical elements are exactly the ordinary nodes reachable from `sentinel.next`.

Following `next` visits them in sequence order.

The sentinel itself is not counted.

No unreachable node is part of the list.

### Acyclicity

No reachable ordinary node may appear twice during successor traversal.

For sequence nodes $v_0,\ldots,v_{n-1}$:

$$
next(v_i)=v_{i+1}\quad\text{for }0\le i<n-1
$$

and $next(v_{n-1})=null$.

Traversal terminates after exactly `n` ordinary nodes.

### Size invariant

Cached size equals the reachable ordinary-node count.

Every successful insertion increases it by one.

Every successful removal decreases it by one.

Failed operations leave it unchanged.

### Tail invariant

For an empty list, tail references the sentinel in this design.

For a nonempty list, tail is the unique ordinary node with null successor.

The relation is:

$$
size=0\iff sentinel.next=null\iff tail=sentinel.
$$

Append links `tail.next` to the new node and advances tail.

Removing the final ordinary node restores tail to its predecessor.

### Predecessor invariant

To operate at logical index `i`, find the node immediately before it.

For `i = 0`, that predecessor is the sentinel.

For `i > 0`, it is logical node `i-1`.

Uniform predecessor search eliminates a separate head-rewiring branch.

### Insertion invariant

Let predecessor `p` currently point to successor `q`.

To insert node `x`:

```text
x.next = q
p.next = x
```

Saving `q` through `x.next` before overwriting the link preserves the suffix.

Old-node relative order remains unchanged.

### Removal invariant

Let target `q = p.next`.

Set `p.next = q.next`.

This bypasses exactly one node.

If `q` was tail, set tail to `p`.

Detach `q.next` when returned nodes could otherwise retain the suffix.

### Reversal invariant

Maintain reversed prefix headed by `previous`.

Maintain unreversed suffix headed by `current`.

Every original node belongs to exactly one chain.

Save `current.next` before reversing it.

At termination, the old first node is tail and `previous` is the new first node.

### Comparator-free identity

List topology does not depend on payload equality.

Two equal values can occupy distinct nodes.

Structural validation must use node identity rather than payload comparison.

## 3. Step-by-Step Execution Trace

Begin with sentinel `S`.

State is `S.next = null`, `tail = S`, and `size = 0`.

Append value `10` as node `A`.

Set `A.next = null`.

Set `tail.next = A`, which means `S.next = A`.

Set `tail = A`.

Set size to `1`.

Chain is `S -> A(10) -> null`.

Append value `30` as node `C`.

Set `A.next = C`.

Advance tail to `C`.

Size becomes `2`.

Insert value `20` at logical index `1`.

Find predecessor of index `1`, which is node `A`.

Allocate node `B`.

Set `B.next = A.next`, preserving node `C`.

Set `A.next = B`.

Size becomes `3`.

Tail remains `C`.

Chain is `S -> A(10) -> B(20) -> C(30) -> null`.

Remove logical index `0`.

Its predecessor is sentinel `S`.

Target is `S.next`, node `A`.

Set `S.next = A.next`, which is `B`.

Target is not tail.

Decrement size to `2`.

Return value `10`.

Remove logical index `1` from `[20,30]`.

Predecessor is node `B`.

Target is `C`, which equals tail.

Set `B.next = C.next`, which is null.

Set tail to predecessor `B`.

Decrement size to `1`.

Remove the remaining index `0`.

Predecessor is sentinel.

Target is tail node `B`.

Set sentinel successor to null.

Set tail back to sentinel.

Size becomes zero.

Every empty-state invariant is restored.

### Reversal trace

Build chain `10 -> 20 -> 30 -> null`.

Set `previous = null` and `current = 10`.

Save next node `20`.

Set `10.next = null` and advance both references.

Reversed prefix is `10` and suffix starts at `20`.

Save `30`, set `20.next = 10`, and advance.

Save null, set `30.next = 20`, and advance.

Current becomes null.

Set sentinel successor to `30`.

Set tail to old first node `10`.

Result is `30 -> 20 -> 10 -> null`.

## 4. Production-Ready Implementations

The sentinel-based implementation below keeps boundary mutation uniform.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterator, Optional, TypeVar, cast

T = TypeVar("T")


@dataclass(slots=True)
class _Node(Generic[T]):
    value: Optional[T] = None
    next: Optional[_Node[T]] = None


class SinglyLinkedList(Generic[T]):
    def __init__(self) -> None:
        self._sentinel: _Node[T] = _Node()
        self._tail: _Node[T] = self._sentinel
        self._size = 0

    def __len__(self) -> int:
        return self._size

    def __iter__(self) -> Iterator[T]:
        node = self._sentinel.next
        while node is not None:
            yield cast(T, node.value)
            node = node.next

    def _predecessor(self, index: int, allow_end: bool) -> _Node[T]:
        upper = self._size if allow_end else self._size - 1
        if not 0 <= index <= upper:
            raise IndexError("list index out of range")
        node = self._sentinel
        for _ in range(index):
            assert node.next is not None
            node = node.next
        return node

    def append(self, value: T) -> None:
        node = _Node(value)
        self._tail.next = node
        self._tail = node
        self._size += 1

    def insert(self, index: int, value: T) -> None:
        predecessor = self._predecessor(index, allow_end=True)
        node = _Node(value, predecessor.next)
        predecessor.next = node
        if predecessor is self._tail:
            self._tail = node
        self._size += 1

    def pop(self, index: int = 0) -> T:
        predecessor = self._predecessor(index, allow_end=False)
        target = predecessor.next
        assert target is not None
        predecessor.next = target.next
        if target is self._tail:
            self._tail = predecessor
        self._size -= 1
        target.next = None
        return cast(T, target.value)

    def reverse(self) -> None:
        old_first = self._sentinel.next
        previous: Optional[_Node[T]] = None
        current = old_first
        while current is not None:
            following = current.next
            current.next = previous
            previous = current
            current = following
        self._sentinel.next = previous
        self._tail = self._sentinel if old_first is None else old_first

    def validate(self) -> None:
        slow = self._sentinel.next
        fast = self._sentinel.next
        while fast is not None and fast.next is not None:
            slow = slow.next if slow is not None else None
            fast = fast.next.next
            if slow is fast:
                raise AssertionError("cycle detected")
        count = 0
        last: _Node[T] = self._sentinel
        node = self._sentinel.next
        while node is not None:
            count += 1
            last = node
            node = node.next
        assert count == self._size
        assert last is self._tail
```

The sentinel stores no logical payload.

`cast` separates that sentinel typing detail from public values.

The predecessor helper defines whether insertion at `size` is allowed.

Pop detaches the removed node's successor.

The class is not synchronized for concurrent writers.

Validation is intended for tests and debug builds.

Manual-memory versions need destructor, copy, and move contracts.

## 5. Asymptotic Time & Space Complexity

Head access takes $O(1)$ time.

Append takes $O(1)$ with cached tail.

Prepend through insertion at zero takes $O(1)$.

Index lookup takes $O(i)$ for index `i`.

Worst-case index lookup takes $O(n)$.

Value search takes $O(n)$ worst-case time.

Insertion after a known predecessor takes $O(1)$.

Insertion by numeric index takes $O(n)$ worst-case time.

Head removal takes $O(1)$.

Removal after a known predecessor takes $O(1)$.

Tail removal takes $O(n)$ because a singly linked list must find its predecessor.

Reversal takes $O(n)$ time.

Iterative reversal uses $O(1)$ auxiliary space.

Iteration takes $O(n)$ time.

The list stores `n` ordinary nodes and one sentinel.

Space is $O(n)$.

Each ordinary node adds one link reference.

Cached size and tail use constant metadata.

Recursive traversal adds $O(n)$ call-stack space on a full chain.

Dynamic arrays provide $O(1)$ indexed access and usually better locality.

Their middle insertion needs element movement.

The list's theoretical local update advantage applies only after locating the predecessor.

## 6. Systems Connections

Hash tables use singly linked chains for collision buckets in some designs.

Memory allocators link free blocks through embedded pointers.

Kernel structures use intrusive singly linked lists where backward navigation is unnecessary.

Adjacency lists represent sparse graph neighbors as sequences.

Compact vectors often outperform pointer nodes for static neighbor sets.

Linked queues maintain head and tail for constant-time operations.

Lock-free stacks update a singly linked head with compare-and-swap.

They require protection against ABA and unsafe reclamation.

Hazard pointers and epochs delay reclamation while readers may retain nodes.

Persistent functional lists share immutable suffixes.

Prepending then takes constant time without mutation.

Copy-on-write semantics differ from exclusive mutable ownership.

Network packet chains link buffers without copying payload bytes.

Scatter-gather I/O consumes related chained buffer descriptions.

Undo chains store links to prior states.

Garbage collectors traverse linked object graphs while detecting already visited objects.

Serialization writes values and order, never process-local pointer addresses.

Durable linked structures must order node and link writes for crash recovery.

A pointer to data not yet durable can corrupt the chain after restart.

The list teaches that navigation direction constrains available operations.

## 7. Practice Checklist

- Define whether a sentinel is present.
- Exclude the sentinel from size and iteration.
- Define empty-tail behavior.
- Keep reachable-node count equal to size.
- Keep tail at the unique null-successor node.
- Save successors before overwriting links.
- Use predecessor-based mutation consistently.
- Handle insertion at index `size`.
- Reject lookup and removal at index `size`.
- Update tail on append.
- Update tail when removing the final node.
- Restore sentinel-tail state when empty.
- Detach removed nodes when ownership transfers.
- Test empty insertion and removal rejection.
- Test one-node append and pop.
- Test head, middle, and tail insertion.
- Test head, middle, and tail removal.
- Test duplicate payloads by node identity.
- Test reversal for zero, one, two, and many nodes.
- Detect cycles in debug validation.
- Compare size with reachable count.
- Compare tail with final reachable node.
- Define iterator mutation semantics.
- Synchronize shared mutation explicitly.
- Include predecessor search in complexity claims.
- Avoid recursive traversal for unbounded chains.
- Define manual-memory destruction and copying.
- Use safe reclamation in lock-free designs.
- Benchmark against dynamic arrays.
- Account for allocator and cache overhead.

## 8. Frequently Asked Questions

### Why use a sentinel?

It gives logical index zero a predecessor and removes special link cases.

### Is append constant time?

Only when a valid tail reference is maintained.

### Why is tail deletion linear?

The list has no backward link to the tail's predecessor.

### Is insertion always constant time?

Only after the predecessor is already known.

Index-based location remains linear.

### Why detach a removed node?

It prevents the removed object from retaining an unintended reference to the suffix.

### Can it contain duplicate values?

Yes.

Payload equality does not merge node identity.

### How is it different from a doubly linked list?

It stores one link per node and cannot navigate backward directly.

### Is it thread-safe?

Not without an external lock or a proven concurrent algorithm.

### Why can arrays be faster to traverse?

Contiguous storage improves cache locality and prefetching.

### What is the central invariant?

One finite forward chain from the sentinel contains every logical node exactly once.
