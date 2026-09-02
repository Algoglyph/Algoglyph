# Double Ended Deques: Two-Sided Queues, Ring Buffers & Amortized Growth

![Double ended deque operations](/images/dsa/double-ended-deques-dark.jpg#dark)

## 1. Historical Context & Motivation

A double ended deque is a sequence that supports insertion and removal at both ends.

The name deque is short for double-ended queue.

It is pronounced like "deck."

A queue exposes one end for insertion and the other for removal.

A stack exposes one end for both insertion and removal.

A deque exposes both ends for both operations.

That small API change makes it a flexible building block.

Sliding-window algorithms use deques to maintain candidate minima or maxima.

Breadth-first search variants use deques when some edges have cost zero and some have cost one.

Undo systems and schedulers use deques when work can be pushed or stolen from either side.

Language runtimes often provide a deque as a standard collection.

Python has `collections.deque`.

C++ has `std::deque`.

Java has `ArrayDeque`.

The implementations differ internally, but the abstract operation set is similar.

The core promise is fast access to both ends.

The structure is not designed for fast insertion in the middle.

It is also not always designed for contiguous storage.

The central question is:

How can a sequence support both front and back operations without shifting all elements?

The usual answers are linked blocks or a circular array.

For algorithm design, the most important model is the circular buffer deque.

It stores elements in an array and lets front and back indices wrap around.

## 2. Core Mathematical Invariants

A deque maintains a logical sequence:

$$
[x_0,x_1,\ldots,x_{m-1}].
$$

The front element is $x_0$.

The back element is $x_{m-1}$.

In a circular-array representation, elements live in a physical array of capacity $c$.

The structure stores `front` and `size`.

The logical element at index `i` is stored at:

$$
(front+i)\bmod c.
$$

This mapping is the central invariant.

It separates logical order from physical position.

Pushing to the front decrements `front` modulo capacity.

Then it writes the new value at that physical slot.

Pushing to the back writes at:

$$
(front+size)\bmod c.
$$

Then it increments `size`.

Popping from the front reads `front`.

Then it advances `front = (front + 1) mod c`.

Popping from the back reads:

$$
(front+size-1)\bmod c.
$$

Then it decrements `size`.

The deque is empty when `size == 0`.

The deque is full when `size == capacity`.

Many implementations resize before writing into a full array.

After resizing, logical order must be copied into a fresh contiguous range.

The new `front` is usually zero.

The representation invariant becomes simple again after growth.

No operation should leave `size` negative.

No operation should read an empty deque.

No operation should confuse wrapped physical order with logical order.

## 3. Step-by-Step Execution Trace

Use a circular array with capacity `5`.

Start empty:

```text
buffer: [_, _, _, _, _]
front:  0
size:   0
```

Push back `A`.

The write index is `(0 + 0) mod 5 = 0`.

```text
buffer: [A, _, _, _, _]
front:  0
size:   1
```

Push back `B`.

The write index is `(0 + 1) mod 5 = 1`.

```text
buffer: [A, B, _, _, _]
front:  0
size:   2
```

Push front `C`.

Decrement front modulo capacity.

The new front is `4`.

```text
buffer: [A, B, _, _, C]
front:  4
size:   3
```

The physical array appears split.

The logical sequence is:

```text
[C, A, B]
```

Pop back.

The back index is `(4 + 3 - 1) mod 5 = 1`.

Read `B` and decrease size.

```text
buffer: [A, _, _, _, C]
front:  4
size:   2
```

Push back `D`.

The write index is `(4 + 2) mod 5 = 1`.

```text
buffer: [A, D, _, _, C]
front:  4
size:   3
```

The logical sequence is:

```text
[C, A, D]
```

The trace shows why front and back arithmetic must use modulo.

The logical front is not necessarily at physical index zero.

The physical order may wrap around the end of the array.

Now trace a monotonic deque for sliding-window maximum.

Use values:

```text
[4, 2, 12, 3, 8]
```

with window size `3`.

Store indices, not values.

At index `0`, push `0`.

The deque holds candidate `[0]`, value `[4]`.

At index `1`, value `2` is smaller than `4`, so keep both.

The deque is `[0, 1]`.

At index `2`, value `12` removes indices `1` and `0` from the back.

Neither can be maximum in a future window while `12` is newer and larger.

Push `2`.

The first window maximum is `12`.

At index `3`, value `3` is smaller, so append it.

The deque is `[2, 3]`.

The second window maximum is still `12`.

At index `4`, value `8` removes index `3` from the back.

Index `2` remains because value `12` is larger.

Before reporting the window `[2, 4]`, index `2` is still inside it.

The maximum remains `12`.

Each index enters once and leaves once.

That is the deque invariant behind the linear-time result.

## 4. Production-Ready Implementations

The implementation below is a small circular-array deque.

It grows when full and preserves logical order during growth.

```python
from typing import Generic, TypeVar


T = TypeVar("T")


class ArrayDeque(Generic[T]):
    def __init__(self, initial_capacity: int = 8) -> None:
        if initial_capacity <= 0:
            raise ValueError("capacity must be positive")
        self._data: list[T | None] = [None] * initial_capacity
        self._front = 0
        self._size = 0

    def __len__(self) -> int:
        return self._size

    def _physical(self, logical_index: int) -> int:
        return (self._front + logical_index) % len(self._data)

    def _grow(self) -> None:
        old = self._data
        self._data = [None] * (2 * len(old))
        for i in range(self._size):
            self._data[i] = old[(self._front + i) % len(old)]
        self._front = 0

    def push_back(self, value: T) -> None:
        if self._size == len(self._data):
            self._grow()
        self._data[self._physical(self._size)] = value
        self._size += 1

    def push_front(self, value: T) -> None:
        if self._size == len(self._data):
            self._grow()
        self._front = (self._front - 1) % len(self._data)
        self._data[self._front] = value
        self._size += 1

    def pop_front(self) -> T:
        if self._size == 0:
            raise IndexError("pop from empty deque")
        value = self._data[self._front]
        self._data[self._front] = None
        self._front = (self._front + 1) % len(self._data)
        self._size -= 1
        assert value is not None
        return value

    def pop_back(self) -> T:
        if self._size == 0:
            raise IndexError("pop from empty deque")
        index = self._physical(self._size - 1)
        value = self._data[index]
        self._data[index] = None
        self._size -= 1
        assert value is not None
        return value

    def to_list(self) -> list[T]:
        result: list[T] = []
        for i in range(self._size):
            value = self._data[self._physical(i)]
            assert value is not None
            result.append(value)
        return result


deque = ArrayDeque[str](2)
deque.push_back("A")
deque.push_back("B")
deque.push_front("C")
assert deque.to_list() == ["C", "A", "B"]
assert deque.pop_back() == "B"
deque.push_back("D")
assert deque.to_list() == ["C", "A", "D"]
assert deque.pop_front() == "C"
assert deque.to_list() == ["A", "D"]
```

The `None` cleanup prevents popped objects from staying referenced inside the buffer.

That matters in garbage-collected languages.

The example disallows storing `None` as a deque value because it uses `None` as an empty marker.

A production generic container can use a private sentinel or a lower-level storage representation to allow any value.

In real applications, prefer the standard-library deque unless you are studying the structure or need special behavior.

For a monotonic sliding-window maximum, the standard-library deque is enough.

```python
from collections import deque


def sliding_window_max(values: list[int], width: int) -> list[int]:
    if width <= 0:
        raise ValueError("window width must be positive")
    candidates: deque[int] = deque()
    result: list[int] = []
    for index, value in enumerate(values):
        while candidates and candidates[0] <= index - width:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(index)
        if index >= width - 1:
            result.append(values[candidates[0]])
    return result


assert sliding_window_max([4, 2, 12, 3, 8], 3) == [12, 12, 12]
assert sliding_window_max([1, 3, 2, 5, 4], 2) == [3, 3, 5, 5]
```

This algorithm uses both ends for different reasons.

The front removes candidates that fall out of the window.

The back removes candidates dominated by the new value.

That is a stronger invariant than a normal FIFO queue can express.

## 5. Asymptotic Time & Space Complexity

`push_front`, `push_back`, `pop_front`, and `pop_back` are $O(1)$ in the usual case.

When the backing array grows, one operation copies $n$ elements.

With doubling growth, that expensive copy is amortized.

Across many pushes, each element is moved only a constant number of times per growth scale.

So each push remains $O(1)$ amortized.

Pops are $O(1)$.

Reading the front or back is $O(1)$.

Accessing an arbitrary logical index can be $O(1)$ in an array-backed deque.

However, some standard-library deque implementations use segmented blocks.

Their random access may still be constant time, but with different constants and locality.

Insertion or deletion in the middle is generally $O(n)$.

The circular buffer stores capacity $c$ and size $m`.

It uses $O(c)$ memory.

With geometric growth, $c$ is $O(m)$ after enough operations.

The unused capacity is the price of amortized growth.

A linked-list deque uses $O(n)$ memory but pays pointer overhead per node.

It also has worse cache locality.

The right implementation depends on whether the workload values compact memory, stable references, or frequent end operations.

For sliding-window maximum, the deque work is linear.

Each index is appended once.

Each index can be popped from the front at most once.

Each index can be popped from the back at most once.

That gives $O(n)$ time for all windows together.

The deque stores at most `width` indices.

The extra space is therefore $O(width)`.

## 6. Systems Connections

Deques power monotonic queue algorithms.

For sliding-window maximum, the deque stores candidate indices in decreasing value order.

The front is the best candidate for the current window.

The back removes candidates that can never win future windows.

The result is linear time because each index enters and leaves the deque at most once.

Zero-one BFS uses a deque for graphs whose edge weights are only zero or one.

A zero-cost relaxation goes to the front.

A one-cost relaxation goes to the back.

This preserves increasing distance order without a full priority queue.

Work-stealing schedulers often use double-ended queues.

The owner pushes and pops local work from one end.

Other workers steal from the opposite end.

Real implementations require careful synchronization.

Text editors and undo systems can use deque-like histories when edits are added and removed near both ends.

Streaming systems use ring buffers when fixed capacity and contiguous memory matter.

A bounded deque can provide backpressure by rejecting pushes when full.

An unbounded deque can grow until memory limits intervene.

That API choice should be explicit.

In performance-sensitive code, a deque is often chosen because it avoids shifting elements.

Adding to the front of a plain array normally requires moving existing elements.

A deque changes the front index instead.

That is a representation trick with very practical consequences.

Zero-one BFS is another place where the two ends have semantic meaning.

When relaxing a zero-weight edge, the neighbor belongs at the front because its distance did not increase.

When relaxing a one-weight edge, the neighbor belongs at the back because it is one layer later.

The deque is acting like a small integer priority queue.

Using a normal FIFO queue would process some distance-one states too early.

Using a heap works but adds unnecessary logarithmic overhead.

## 7. Practice Checklist

- Define whether the deque is bounded or growing.
- Track `front` and `size` rather than relying on physical order.
- Convert logical indices to physical indices with modulo arithmetic.
- Test wraparound at both ends.
- Test growth when the buffer is wrapped.
- Copy elements in logical order during resizing.
- Clear popped slots if references should be released.
- Decide whether `None` or null values are allowed.
- Use a private sentinel if every value must be storable.
- Throw cleanly on popping an empty deque.
- Test one-element push and pop from both ends.
- Test alternating front and back operations.
- Distinguish amortized and worst-case push cost.
- Avoid middle insertion unless the implementation is designed for it.
- Prefer standard-library deques for production unless custom behavior is needed.
- Use a monotonic deque for sliding-window extrema.
- Use a deque for zero-one BFS.
- Consider synchronization for work-stealing or shared queues.
- Document iteration order.
- Do not expose physical buffer layout as logical order.

## 8. Frequently Asked Questions

### Is a deque a stack or a queue?

It can behave like either.

Use one end for stack behavior.

Use opposite ends for queue behavior.

### Why not just use an array?

Adding or removing at the front of a plain array often shifts many elements.

A deque changes indices instead.

### What does wraparound mean?

The logical sequence may continue from the end of the physical array back to the beginning.

Modulo arithmetic maps logical positions to physical slots.

### Are deque operations always constant time?

End operations are usually $O(1)$ amortized.

A growing array deque occasionally copies elements during resize.

### Is `std::deque` a circular array?

Not typically.

C++ implementations usually use segmented storage.

The abstract deque operations are the same, but locality and allocation behavior differ.

### When is a linked-list deque better?

It can be useful when stable node references matter.

For most algorithmic workloads, an array-backed deque has better locality.

### Why clear popped slots?

Clearing releases references so garbage collectors can reclaim removed objects.

Otherwise the backing array may accidentally keep old values alive.

### What is the most common bug?

Copying physical order during growth instead of logical order.

That corrupts wrapped deques.

### Which algorithms should make me think of deques?

Sliding-window maxima, zero-one BFS, palindrome checks, and work queues with operations at both ends.
