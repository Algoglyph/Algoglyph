# Fast & Slow Pointers: Relative Motion, Cycle Detection & Linked-List Structure

![Fast and slow pointers cycle detection](/images/dsa/fast-slow-pointers-dark.jpg#dark)

## 1. Historical Context & Motivation

The fast and slow pointers pattern uses two cursors moving through a structure at different speeds.

It is most famous as Floyd's cycle detection algorithm.

One pointer moves one step at a time.

The other pointer moves two steps at a time.

If a linked list contains a cycle, the faster pointer eventually catches the slower pointer inside the cycle.

If the list ends, the faster pointer reaches `None` first.

This solves cycle detection without a hash set.

The pattern is also used to find the middle of a linked list.

When the fast pointer reaches the end, the slow pointer is near the middle.

It appears in palindrome checks, list splitting, cycle-entry detection, and repeated-function iteration.

The idea is simple, but the proof is not hand-wavy.

It depends on relative speed.

Inside a cycle, the fast pointer gains one node per iteration on the slow pointer.

In a cycle of length $c$, gaining one position per step guarantees a meeting within $c$ iterations.

The central question is:

How can two local cursors reveal global structure without storing every visited node?

Fast and slow pointers are useful when the data structure supports repeated next-step movement but not efficient random access.

That is why linked lists are the natural setting.

The technique turns movement over time into information about shape.

## 2. Core Mathematical Invariants

Let `slow` move one edge per loop iteration.

Let `fast` move two edges per loop iteration.

In an acyclic linked list, some `next` pointer eventually becomes `None`.

If `fast` reaches `None`, there is no cycle reachable from the head.

In a cyclic linked list, both pointers eventually enter the cycle.

Once both are inside, consider their positions modulo the cycle length $c$.

Each iteration changes the distance from fast to slow by one modulo $c$.

That is because fast moves two steps and slow moves one step.

The relative gain is:

$$
2-1=1.
$$

Modulo $c$, repeatedly adding one must eventually hit zero.

Zero distance means both pointers are at the same node.

That proves a meeting occurs.

To find the cycle entry after a meeting, reset one pointer to the head.

Leave the other pointer at the meeting point.

Move both one step at a time.

They meet at the cycle entry.

The proof uses:

Let $\mu$ be the number of nodes before the cycle.

Let $\lambda$ be the cycle length.

At the first meeting, the slow pointer has moved $t$ steps.

The fast pointer has moved $2t$ steps.

Their difference $t$ is a multiple of $\lambda$.

So $t \equiv 0 \pmod{\lambda}$ after accounting for cycle position.

Moving one pointer from head and one from meeting advances both by $\mu$ steps.

Both land at the cycle entry.

For middle finding, the invariant is simpler.

After $k$ iterations, slow has moved $k$ steps and fast has moved $2k$ steps.

When fast cannot move two more steps, slow has crossed half the list.

## 3. Step-by-Step Execution Trace

Use a linked list:

```text
A -> B -> C -> D -> E
          ^         |
          |_________|
```

The cycle entry is `C`.

Start both pointers at `A`.

Iteration `0`:

```text
slow = A
fast = A
```

Iteration `1`:

```text
slow = B
fast = C
```

Iteration `2`:

```text
slow = C
fast = E
```

Iteration `3`:

```text
slow = D
fast = D
```

The pointers meet at `D`.

That proves a cycle exists.

Now find the entry.

Reset one pointer to `A`.

Keep the other at `D`.

Move both one step at a time.

Step `1`:

```text
from_head = B
from_meeting = E
```

Step `2`:

```text
from_head = C
from_meeting = C
```

They meet at `C`.

That is the cycle entry.

Now trace middle finding on:

```text
A -> B -> C -> D -> E
```

Start both at `A`.

After one iteration, slow is `B` and fast is `C`.

After two iterations, slow is `C` and fast is `E`.

Fast cannot move two more steps.

Slow is at `C`, the middle node.

For an even-length list, the exact returned middle depends on loop condition.

The API should document whether it returns the first middle or second middle.

Now trace a palindrome check for:

```text
R -> A -> D -> A -> R
```

Use fast and slow pointers to find the middle.

Slow stops at `D`.

Reverse the second half after the middle:

```text
R -> A
```

Compare from the head and from the reversed half.

First compare `R` with `R`.

Then compare `A` with `A`.

All compared values match.

The list is a palindrome.

If caller code expects the original list, reverse the second half again to restore it.

That restoration step is part of the contract.

Leaving the list half-reversed is a hidden mutation bug.

Now split an even-length list:

```text
A -> B -> C -> D
```

With the second-middle convention, slow reaches `C`.

To split into `[A, B]` and `[C, D]`, the algorithm must track the node before slow.

Set `previous_to_slow.next = None`.

The midpoint pointer alone is not enough to cut a singly linked list.

## 4. Production-Ready Implementations

The implementation below detects a cycle and returns its entry node.

It uses object identity rather than node value equality.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import TypeVar


T = TypeVar("T")


@dataclass(eq=False)
class Node:
    value: str
    next: "Node | None" = None


def cycle_entry(head: Node | None) -> Node | None:
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next if slow is not None else None
        fast = fast.next.next
        if slow is fast:
            finder = head
            while finder is not slow:
                assert finder is not None
                assert slow is not None
                finder = finder.next
                slow = slow.next
            return finder

    return None


a = Node("A")
b = Node("B")
c = Node("C")
d = Node("D")
e = Node("E")
a.next = b
b.next = c
c.next = d
d.next = e
e.next = c
assert cycle_entry(a) is c

x = Node("X", Node("Y", Node("Z")))
assert cycle_entry(x) is None
```

Middle finding is shorter.

```python
def second_middle(head: Node | None) -> Node | None:
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        assert slow is not None
        slow = slow.next
        fast = fast.next.next
    return slow


m1 = Node("A", Node("B", Node("C", Node("D"))))
assert second_middle(m1).value == "C"
m2 = Node("A", Node("B", Node("C")))
assert second_middle(m2).value == "B"
```

For even lengths, this function returns the second middle.

Changing the loop initialization or condition can return the first middle.

That choice affects palindrome and split-list algorithms.

Production code should use identity comparisons for nodes.

Two different nodes may store equal values.

Value equality cannot prove pointer meeting.

For list splitting, carry a predecessor pointer.

```python
def split_before_second_middle(head: Node | None) -> tuple[Node | None, Node | None]:
    if head is None or head.next is None:
        return head, None

    previous: Node | None = None
    slow: Node | None = head
    fast: Node | None = head
    while fast is not None and fast.next is not None:
        previous = slow
        assert slow is not None
        slow = slow.next
        fast = fast.next.next

    assert previous is not None
    previous.next = None
    return head, slow


s = Node("A", Node("B", Node("C", Node("D"))))
left, right = split_before_second_middle(s)
assert left is not None and right is not None
assert left.value == "A"
assert left.next is not None and left.next.value == "B"
assert left.next.next is None
assert right.value == "C"
```

This is a deliberate mutation.

Use it in merge sort or partitioning code where the split is expected.

Do not call it inside a read-only inspection function.

## 5. Asymptotic Time & Space Complexity

Cycle detection visits nodes at most a linear number of times.

Let $n$ be the number of nodes reachable before repetition or termination.

The time complexity is:

$$
O(n).
$$

The extra space complexity is:

$$
O(1).
$$

A hash-set approach also detects cycles in $O(n)$ time.

It uses $O(n)$ extra space.

Fast and slow pointers trade stored history for relative motion.

Finding the cycle entry is also $O(n)$.

The second phase moves at most the number of nodes before the cycle.

Middle finding is $O(n)$ time and $O(1)$ space.

The fast pointer makes roughly half as many loop iterations as a one-step traversal.

That does not change Big-O.

It can still reduce constant loop overhead.

The algorithm assumes moving to the next node is $O(1)$.

If "next" is computed through an expensive generator or remote lookup, the practical cost changes.

For repeated-function cycle detection, the same analysis uses function evaluations instead of node hops.

Floyd's algorithm remains constant-space.

Brent's algorithm is another constant-space cycle detector with a different movement schedule.

The cycle-entry proof also explains the reset step.

Let the distance from head to entry be $\mu$.

Let the meeting point be $r$ steps after the entry inside the cycle.

Because the fast pointer traveled twice as far as slow, the slow distance at meeting is a multiple of the cycle length after subtracting the shared prefix.

That implies:

$$
\mu + r \equiv 0 \pmod{\lambda}.
$$

So:

$$
\mu \equiv -r \pmod{\lambda}.
$$

Starting from the meeting point and walking $\mu$ steps moves exactly from offset $r$ to the entry.

Starting from the head and walking $\mu$ steps also reaches the entry.

That is why both one-step pointers meet there.

## 6. Systems Connections

Cycle detection appears in runtime and systems work.

A linked structure corrupted into a cycle can make cleanup or traversal loop forever.

Fast and slow pointers can diagnose that shape without storing all visited nodes.

Repeated-function iteration appears in pseudorandom generators and number theory algorithms.

Pollard's rho factorization uses cycle behavior in generated sequences.

Garbage collectors and serializers must guard against cyclic object graphs.

They usually need visited sets because graphs branch, not only a single `next` chain.

Fast and slow pointers apply directly to functional graphs where each node has one outgoing successor.

Linked-list palindrome checks use the middle-finding variant.

Find the middle, reverse the second half, compare halves, and optionally restore the list.

Merge sort on linked lists also uses fast and slow pointers to split the list.

The slow pointer identifies a midpoint without knowing length first.

In streaming contexts, the pattern is less useful because it needs two cursors into the same structure.

It is strongest when the structure is already materialized as next pointers.

The systems lesson is that pointer identity matters.

Detecting that two cursors reached equal values is not enough.

They must reach the same object.

Fast and slow pointers also appear in API pagination checks.

If a service accidentally returns a `nextPageToken` cycle, a client can loop forever.

When tokens form a single successor chain, cycle detection can reveal the bug without storing every token.

Many clients still choose a visited set because tokens are strings and memory limits are acceptable.

The same trade-off appears again: constant-space detection versus simpler stored-history diagnostics.

## 7. Practice Checklist

- Move slow by one step and fast by two steps.
- Check `fast` and `fast.next` before advancing fast.
- Use node identity, not value equality.
- Return no cycle when fast reaches the end.
- After a meeting, reset one pointer to the head to find the entry.
- Move both entry-finding pointers one step at a time.
- Document first-middle versus second-middle behavior.
- Test an empty list.
- Test a one-node acyclic list.
- Test a one-node self-cycle.
- Test a cycle starting at the head.
- Test a cycle starting in the middle.
- Test an even-length list for middle behavior.
- Test an odd-length list for middle behavior.
- Avoid mutating links during detection.
- Use a visited set instead for branching graphs.
- Consider recursion-free code for pointer algorithms.
- Compare with Brent's algorithm when function evaluations are expensive.
- Restore list structure after palindrome checks if callers expect it.
- Treat generated successor functions like linked lists only when each state has one successor.
- Track the predecessor when splitting a singly linked list.
- Treat palindrome checking as mutating if it reverses links.
- Restore reversed halves before returning from read-like APIs.
- Test cycle-entry detection separately from cycle existence.
- Prefer a visited set when detailed cycle diagnostics are more important than constant space.
- Test equal values stored in different nodes.
- Test a two-node cycle.
- Test split behavior on length two.

## 8. Frequently Asked Questions

### Why does the fast pointer catch the slow pointer?

Inside a cycle, fast gains one position per iteration modulo the cycle length.

Eventually the relative distance becomes zero.

### Does this work on any graph?

No.

It works directly on structures where each state has one next state.

General graphs need visited sets or graph-specific algorithms.

### Why compare nodes by identity?

Two different nodes can store the same value.

Cycle detection needs to know whether the cursors reached the same node object.

### How do we find the cycle entry?

After a meeting, move one pointer to the head.

Move both pointers one step at a time.

Their next meeting is the entry.

### What happens if there is no cycle?

The fast pointer reaches the end of the list.

The algorithm returns no cycle.

### Which middle does the slow pointer return?

It depends on the loop condition.

The common `while fast and fast.next` version returns the second middle for even-length lists.

### Why not always use a hash set?

A hash set is simpler to reason about in some cases, but it uses linear extra memory.

Fast and slow pointers use constant extra space.

### What is the main implementation bug?

Advancing `fast.next.next` without first checking that `fast` and `fast.next` exist.

That turns a no-cycle list into a null-reference crash.
