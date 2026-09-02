# Dynamic Vectors: Contiguous Growth, Amortized Append & Capacity Invariants

![Dynamic vector capacity growth](/images/dsa/dynamic-vectors-dark.jpg#dark)

## 1. Historical Context & Motivation

A dynamic vector is an array-like sequence that grows as elements are appended.

It preserves the most important property of arrays: contiguous storage.

Logical index `i` maps directly to physical slot `i`.

That gives constant-time random access.

The problem is that fixed arrays cannot grow in place once their storage is full.

A dynamic vector solves this by separating size from capacity.

Size is the number of live elements.

Capacity is the number of slots currently allocated.

When size reaches capacity, the vector allocates a larger block, moves or copies existing elements, and then continues.

That occasional expensive resize is the price of fast indexing and compact memory.

Dynamic vectors appear everywhere.

C++ has `std::vector`.

Rust has `Vec<T>`.

Java has `ArrayList`.

JavaScript arrays behave partly like dynamic arrays, though their engine internals are more complex.

Python lists are dynamic arrays too.

The structure is popular because it matches hardware well.

Sequential traversal is cache-friendly.

Random access is arithmetic.

Appending is usually cheap.

The central question is:

How can a contiguous array grow while keeping appends efficient over a long sequence of operations?

The answer is geometric growth and amortized analysis.

## 2. Core Mathematical Invariants

A vector stores elements in a contiguous buffer.

It maintains:

```text
0 <= size <= capacity
```

The live elements occupy positions:

```text
0, 1, ..., size - 1
```

Slots from `size` to `capacity - 1` are reserved but not logically part of the vector.

The logical index invariant is:

$$
element(i)=buffer[i]\quad\text{for }0\le i<size.
$$

Access outside that range is invalid even if capacity exists.

Capacity is not public sequence length.

Appending when `size < capacity` writes into `buffer[size]` and increments size.

Appending when `size == capacity` first grows the buffer.

A common growth rule is:

$$
newCapacity = max(1, 2 \cdot oldCapacity).
$$

After growth, all existing elements must preserve order.

For every old index `i`:

$$
newBuffer[i] = oldBuffer[i].
$$

Then the append writes the new value at the old size.

The vector may expose references, pointers, or iterators to elements.

After reallocation, those references may become invalid.

That invalidation is a semantic invariant in languages like C++.

In garbage-collected languages, object identities may remain, but internal array positions still move.

Removal from the back decrements size.

Removal from the middle shifts later elements left.

The vector remains contiguous after every operation.

The cost of preserving contiguity is movement during growth and middle edits.

## 3. Step-by-Step Execution Trace

Start with an empty vector.

Use doubling capacity.

```text
size = 0
capacity = 0
buffer = []
```

Append `A`.

Capacity is zero, so allocate capacity `1`.

Write `A` at index `0`.

```text
size = 1
capacity = 1
buffer = [A]
```

Append `B`.

Size equals capacity.

Allocate capacity `2`.

Copy `A` to the new buffer.

Write `B`.

```text
size = 2
capacity = 2
buffer = [A, B]
```

Append `C`.

Size equals capacity again.

Allocate capacity `4`.

Copy `A` and `B`.

Write `C`.

```text
size = 3
capacity = 4
buffer = [A, B, C, _]
```

Append `D`.

There is spare capacity.

Write directly at index `3`.

```text
size = 4
capacity = 4
buffer = [A, B, C, D]
```

Append `E`.

Grow to capacity `8`.

Copy four elements.

Write `E`.

```text
size = 5
capacity = 8
buffer = [A, B, C, D, E, _, _, _]
```

The fifth append was expensive.

The previous append was cheap.

Amortized analysis spreads the resize work over the many cheap appends that created the need for growth.

The logical sequence is always:

```text
[A, B, C, D, E]
```

Unused capacity is not part of the sequence.

Now trace a middle deletion.

Start with:

```text
[A, B, C, D, E]
```

Remove index `1`.

The removed value is `B`.

To keep the vector contiguous, shift `C`, `D`, and `E` one slot left.

The result is:

```text
[A, C, D, E]
```

The operation touched three later elements.

That is why middle deletion is linear even though back deletion is constant.

Contiguity is the invariant, and shifting is the cost of preserving it.

## 4. Production-Ready Implementations

The implementation below is educational.

Real systems should usually use the language's built-in vector or list.

```python
from typing import Generic, TypeVar


T = TypeVar("T")


class DynamicVector(Generic[T]):
    def __init__(self) -> None:
        self._data: list[T | None] = []
        self._size = 0

    def __len__(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return len(self._data)

    def _grow(self) -> None:
        old_capacity = len(self._data)
        new_capacity = max(1, old_capacity * 2)
        new_data: list[T | None] = [None] * new_capacity
        for index in range(self._size):
            new_data[index] = self._data[index]
        self._data = new_data

    def append(self, value: T) -> None:
        if self._size == len(self._data):
            self._grow()
        self._data[self._size] = value
        self._size += 1

    def pop(self) -> T:
        if self._size == 0:
            raise IndexError("pop from empty vector")
        self._size -= 1
        value = self._data[self._size]
        self._data[self._size] = None
        assert value is not None
        return value

    def get(self, index: int) -> T:
        if not 0 <= index < self._size:
            raise IndexError("vector index out of range")
        value = self._data[index]
        assert value is not None
        return value

    def set(self, index: int, value: T) -> None:
        if not 0 <= index < self._size:
            raise IndexError("vector index out of range")
        self._data[index] = value

    def to_list(self) -> list[T]:
        result: list[T] = []
        for index in range(self._size):
            result.append(self.get(index))
        return result


vector = DynamicVector[str]()
for value in ["A", "B", "C", "D", "E"]:
    vector.append(value)
assert vector.to_list() == ["A", "B", "C", "D", "E"]
assert len(vector) == 5
assert vector.capacity == 8
assert vector.get(2) == "C"
vector.set(2, "X")
assert vector.to_list() == ["A", "B", "X", "D", "E"]
assert vector.pop() == "E"
assert vector.to_list() == ["A", "B", "X", "D"]
```

The implementation clears a popped slot.

That allows the removed object to be garbage-collected.

It uses `None` as an internal empty marker, so it cannot store `None` safely as a value.

A production generic implementation should use a private sentinel or lower-level uninitialized storage.

The example exposes capacity for learning.

Most application code should not depend on exact capacity growth.

Different runtimes use different growth factors.

The code is intentionally small, but it exposes real API choices.

Some vectors support `insert(index, value)`.

That operation must shift all elements from `index` onward to the right.

Some vectors support `remove(index)`.

That operation must shift all later elements left.

Some vectors support unordered removal by swapping the last element into the removed slot.

That makes removal $O(1)$ but destroys order.

The API should name that trade-off clearly.

Game engines often use unordered removal for dense component arrays.

User-facing lists usually cannot.

## 5. Asymptotic Time & Space Complexity

Random access by index is $O(1)$.

Setting an existing index is $O(1)$.

Appending without growth is $O(1)$.

Appending with growth is $O(n)$ because existing elements are copied or moved.

With geometric growth, append is $O(1)$ amortized.

To see why, consider capacities:

```text
1, 2, 4, 8, 16, ...
```

Before reaching capacity `16`, the total copied elements across earlier growth steps is:

$$
1+2+4+8=15.
$$

That total is less than the final capacity.

Across many appends, resize copying contributes only constant average extra work per append.

Removing from the back is $O(1)$.

Removing from the front or middle is $O(n)$ because later elements must shift left.

Insertion in the middle is $O(n)$ for the same reason.

The vector uses $O(n)$ live element storage.

It may allocate more than $n$ slots.

With geometric growth, capacity remains $O(n)$ after enough appends.

The unused capacity buys fewer reallocations.

Shrinking capacity after pops is optional.

Aggressive shrinking can cause repeated grow-shrink thrashing.

Many implementations shrink only when size falls far below capacity.

The amortized proof can be seen with accounting.

Charge each append a small constant number of credits.

One credit pays for the direct write.

The extra credits are saved on elements already in the vector.

When a growth copy happens, saved credits pay to move the old elements.

Because capacity doubles, enough cheap appends occur between expensive copies to pay for the next copy.

That is the intuition behind amortized $O(1)$.

It is not saying every append is cheap.

It is saying expensive appends are rare enough across a long sequence.

## 6. Systems Connections

Dynamic vectors are the default sequence structure in many programs.

They are fast for iteration because memory is contiguous.

They are fast for indexing because address calculation is simple.

They are compact compared with linked structures.

Serialization systems often store repeated fields in vector-like containers.

Game engines store components and entity IDs in arrays for cache locality.

Compilers store tokens, instructions, and syntax children in vectors.

Databases use vector-like buffers for batches of rows or column values.

The main systems caveat is reallocation.

When a vector grows, element addresses may change.

In C++, pointers, references, and iterators can be invalidated.

APIs must document that.

Rust encodes many of these aliasing concerns in its borrowing rules.

Java and Python hide physical addresses but still pay copy costs during growth.

Reserve operations exist to reduce reallocations when the final size is known.

Calling `reserve(n)` before appending `n` elements can turn many growth checks into one allocation.

Over-reserving wastes memory.

Under-reserving may still be fine because amortized growth is efficient.

The correct choice depends on whether size is predictable.

Vectors are also a reminder that Big-O and hardware agree only sometimes.

A linked list has $O(1)$ insertion at a known node.

A vector may still be faster for many workloads because it keeps data close together.

Reference invalidation is especially important in native code.

If one part of a program stores a pointer to `vector[3]`, a later append may reallocate the buffer.

The pointer still points to the old memory.

Using it after reallocation is unsafe.

In managed runtimes, the failure mode is usually not a dangling pointer.

It may instead be a stale index, stale view, or unexpected copy cost.

The lesson is the same: growth is a semantic event, not only a performance event.

Capacity planning should be visible at API boundaries.

If a parser knows a file has 50,000 tokens, reserving near that count avoids repeated growth.

If a network request claims a huge count, trusting it blindly can waste memory.

Reserve based on credible limits.

Combine it with maximum-size validation when input is untrusted.

## 7. Practice Checklist

- Distinguish size from capacity.
- Treat only indices below size as live elements.
- Preserve element order during reallocation.
- Use geometric growth for amortized append.
- Clear popped reference slots when needed.
- Document iterator or reference invalidation.
- Use `reserve` when a good final-size estimate exists.
- Avoid exposing capacity as logical length.
- Test append across multiple growth boundaries.
- Test random access after growth.
- Test pop until empty.
- Test middle insertion or deletion separately if supported.
- Avoid aggressive shrinking that causes thrashing.
- Consider cache locality when comparing with linked lists.
- Remember that append worst case is still linear.
- Explain amortized cost honestly.
- Do not depend on a runtime's exact growth factor unless documented.
- Validate bounds before indexing.
- Prefer built-in vectors for production code.
- Use linked structures only when their operation pattern really fits.
- Test insertion at the beginning, middle, and end if supported.
- Test ordered removal separately from unordered removal.
- Document whether growth invalidates handles or views.
- Treat growth as both a performance and API event.
- Keep amortized proof separate from worst-case latency claims.
- Reserve capacity when the size estimate is trustworthy.
- Cap reservation sizes for untrusted inputs.
- Test growth exactly at the capacity boundary.

## 8. Frequently Asked Questions

### Is a dynamic vector the same as an array?

It is array-backed and provides array-like indexing.

Unlike a fixed array, it can grow by allocating larger storage.

### What is the difference between size and capacity?

Size is the number of live elements.

Capacity is the number of allocated slots.

### Why is append amortized constant time?

Most appends write into spare capacity.

Occasional growth copies elements, but geometric growth spreads that work over many appends.

### Is append always $O(1)$?

No.

An append that triggers reallocation is $O(n)$.

The amortized cost over many appends is $O(1)$.

### Why not grow by one slot each time?

Growing by one copies the whole array on almost every append.

That makes a sequence of appends quadratic.

### Why can references become invalid?

Growth may move elements into a new buffer.

Pointers or iterators into the old buffer no longer point to the live storage.

### Should I call reserve?

Call it when you have a reliable size estimate.

It reduces reallocations but can waste memory if the estimate is too high.

### Are vectors better than linked lists?

Often, yes, for scanning and indexing.

Linked lists are better only when local splicing dominates and node references are already known.

### What should I draw for this structure?

Show live size, unused capacity, and the copy into a larger contiguous buffer during growth.
