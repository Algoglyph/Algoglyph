# Static Arrays: Fixed Extents, Address Arithmetic & Layout Guarantees

![Static array memory layout](/images/dsa/static-arrays-dark.jpg)

## 1. Historical Context & Motivation

An array stores equal-sized elements in one contiguous logical sequence.
A **static array** has a fixed extent determined when its storage is created.
Its length does not grow through append operations.
That restriction enables direct address arithmetic, compact representation, and predictable capacity.
Machine memory is naturally addressable in fixed-size units, so arrays map cleanly onto hardware.
Early scientific programs relied on fixed arrays for vectors, matrices, and tables.
Systems code still uses them for protocol fields, embedded buffers, register maps, and compile-time lookup data.
Dynamic vectors build on the same representation but add size, capacity, and reallocation policy.
The static form isolates the core invariant without those ownership transitions.
Random access is constant time because the address of element $i$ is computed directly.
Iteration is cache-friendly because neighboring elements occupy neighboring locations.
The cost is inflexibility.
Capacity must be known or bounded before allocation.
Insertion in the middle requires shifting elements.
Adding an element beyond the fixed extent requires a new array or a different representation.
Bounds errors are especially dangerous in languages without automatic checking.
An out-of-range write can corrupt unrelated objects or control data.
Memory-safe languages convert that error into an exception, trap, or rejected operation.
Static arrays also clarify the difference between logical shape and physical layout.
A two-dimensional matrix may be row-major, column-major, padded, strided, or represented as pointers to rows.
Only some of those forms are one contiguous static allocation.
The layout controls address formulas and locality.
Array values may be embedded directly inside another object.
They may live in static storage, an automatic frame, or a heap allocation whose extent never changes.
“Static” describes fixed length here, not necessarily the C storage-class keyword `static`.
That terminology must be stated because the words overlap.
Fixed extent can improve reliability.
Embedded programs avoid surprise allocation.
Network parsers can reject messages before copying into bounded fields.
Real-time systems can calculate worst-case storage before execution.
Compilers can unroll small fixed loops and vectorize contiguous operations.
The array remains one of the clearest examples of a representation invariant yielding an algorithmic guarantee.
Index validity and element size are sufficient to locate any member without traversal.

## 2. Core Mathematical Invariants

Let an array contain $n$ elements of fixed representation size $w$ bytes.
Let its base address be $B$.
Under contiguous layout, element $i$ begins at

$$
\operatorname{address}(i)=B+i\cdot w.
$$

The valid zero-based index domain is $0\le i<n$.
The length $n$ remains unchanged for the array's lifetime.
Every valid element occupies exactly one non-overlapping slot.
Slot $i$ covers byte offsets `[i*w, (i+1)*w)` relative to the base.
This is the central representation invariant.
The address formula uses a constant number of arithmetic operations.
Index access is therefore $O(1)$ under the word-RAM model.
It does not depend on the value of $i$.
The total payload size is $n\cdot w$ bytes.
Alignment may add padding before the whole array or inside each element type.
The effective stride is the language's `sizeof` representation, including per-element padding.
Checked multiplication is required when $n$ and $w$ come from untrusted or large inputs.
Overflow could make a too-small allocation appear sufficient.
For row-major matrix dimensions $r\times c$, element `(i, j)` has linear index

$$
i\cdot c+j.
$$

Its byte address is $B+(i c+j)w$.
Valid coordinates satisfy $0\le i<r$ and $0\le j<c$.
For column-major layout, the linear index is $j\cdot r+i$.
Algorithms should state which convention they assume.
A strided view generalizes the formula.
For dimensions $d_0,\ldots,d_{k-1}$ and strides $s_0,\ldots,s_{k-1}$, offset is

$$
\sum_{q=0}^{k-1} i_q s_q.
$$

Contiguity corresponds to a particular stride relationship.
A slice can share backing storage while presenting a shorter fixed extent.
Its base is offset from the original base and its stride may differ.
Mutating a shared view mutates the underlying array.
Ownership and aliasing rules therefore matter even when length is fixed.
An immutable static array preserves both length and element values.
A mutable static array preserves length but allows replacement within slots.
Replacing `a[i]` must not change the address or extent of other slots.
Insertion semantics require distinguishing replacement from structural insertion.
Writing a new value at index three is $O(1)$ replacement.
Inserting before index three while preserving every existing value requires shifting a suffix.
If logical used length is smaller than capacity, a fixed-capacity buffer can support such insertion.
The physical array is static while its logical occupancy varies.
That design needs a separate `size` invariant with $0\le size\le capacity$.
Deletion similarly shifts elements or leaves a tombstone.
Tombstones change iteration and lookup semantics and need explicit state.
The array itself does not encode which slots are initialized unless the element representation includes such markers.
Languages enforce initialization differently.
Reading an uninitialized primitive in unsafe code is invalid or indeterminate.
Safe containers ensure every exposed slot contains a valid value.
Indexing from the end, as in Python negative indices, is an API transformation.
Index `-1` becomes `n-1` after a bounds rule.
It does not alter physical layout.
Array covariance can threaten type safety when a runtime permits storing a subtype array through a supertype reference.
Sound systems either reject the assignment statically or perform runtime store checks.
Fixed extent alone does not guarantee type-safe mutation.

## 3. Step-by-Step Execution Trace

Consider a static array of six 32-bit integers.
Let the base address be 1,000.
Each integer occupies four bytes.
The array values are `[12, 7, 9, 4, 15, 2]`.
Index zero begins at address $1000+0\cdot4=1000$.
Index one begins at address 1004.
Index two begins at address 1008.
Index five begins at address 1020.
The allocation covers addresses 1000 through 1023 inclusive.
To read index four, check that $0\le4<6$.
Compute $1000+4\cdot4=1016$.
Load four bytes using the representation's byte order.
The decoded value is 15.
No preceding element is traversed.
Now replace index two with value 20.
The target address remains 1008.
Only bytes for slot two change.
The length remains six.
The array becomes `[12, 7, 20, 4, 15, 2]`.
Now request index six.
The validity test fails because six is not less than length six.
A safe API rejects the request before address calculation or memory access.
Unsafe unchecked arithmetic would compute address 1024, immediately beyond the allocation.
That address does not belong to the array.
Now model insertion of value 5 before logical index two in a fixed-capacity array of capacity eight and current size six.
The physical buffer has two unused slots.
Move element at logical index five to index six.
Move index four to five.
Move index three to four.
Move index two to three.
Write 5 at index two.
Increase logical size from six to seven.
The occupied prefix becomes `[12, 7, 5, 20, 4, 15, 2]`.
Four existing elements moved.
The operation is linear in the suffix length.
The physical capacity remained eight.
Now examine row-major matrix `M` with two rows and three columns.
Its flat values are `[a, b, c, d, e, f]`.
Coordinate `(0, 2)` maps to $0\cdot3+2=2$, which is `c`.
Coordinate `(1, 0)` maps to $1\cdot3+0=3$, which is `d`.
Coordinate `(1, 2)` maps to index five, which is `f`.
Walking columns visits flat indices zero, three, then one, four, then two, five.
Those jumps are less contiguous than walking rows.
This trace explains why loop order affects cache behavior.
A final trace examines overflow.
Suppose an allocator uses 32-bit unsigned arithmetic for count and element size.
An attacker supplies count $2^{30}$ and element width eight.
The mathematical product is $2^{33}$ bytes.
Truncated 32-bit multiplication yields zero.
Allocating zero bytes and then writing $2^{30}$ elements would be catastrophic.
Checked multiplication must reject the request before allocation.

## 4. Production-Ready Implementations

This fixed-capacity Python container separates immutable capacity from mutable logical size.
It supports checked replacement, insertion, deletion, and iteration over initialized slots.

```python
from __future__ import annotations

from collections.abc import Iterable, Iterator
from typing import Generic, TypeVar, cast


T = TypeVar("T")
_EMPTY = object()


class FixedCapacityArray(Generic[T]):
    def __init__(self, capacity: int, values: Iterable[T] = ()) -> None:
        if capacity < 0:
            raise ValueError("capacity must be non-negative")
        initial = list(values)
        if len(initial) > capacity:
            raise ValueError("initial values exceed capacity")
        self._slots: list[T | object] = initial + [_EMPTY] * (capacity - len(initial))
        self._size = len(initial)

    @property
    def capacity(self) -> int:
        return len(self._slots)

    def __len__(self) -> int:
        return self._size

    def _check_index(self, index: int) -> None:
        if not 0 <= index < self._size:
            raise IndexError("index outside initialized range")

    def __getitem__(self, index: int) -> T:
        self._check_index(index)
        return cast(T, self._slots[index])

    def __setitem__(self, index: int, value: T) -> None:
        self._check_index(index)
        self._slots[index] = value

    def insert(self, index: int, value: T) -> None:
        if not 0 <= index <= self._size:
            raise IndexError("insertion index outside range")
        if self._size == self.capacity:
            raise OverflowError("fixed-capacity array is full")
        for position in range(self._size, index, -1):
            self._slots[position] = self._slots[position - 1]
        self._slots[index] = value
        self._size += 1

    def delete(self, index: int) -> T:
        self._check_index(index)
        removed = cast(T, self._slots[index])
        for position in range(index, self._size - 1):
            self._slots[position] = self._slots[position + 1]
        self._size -= 1
        self._slots[self._size] = _EMPTY
        return removed

    def __iter__(self) -> Iterator[T]:
        for index in range(self._size):
            yield cast(T, self._slots[index])


def demo() -> None:
    array = FixedCapacityArray(8, [12, 7, 20, 4, 15, 2])
    array.insert(2, 5)
    assert list(array) == [12, 7, 5, 20, 4, 15, 2]
    assert array.delete(3) == 20
    array[0] = 99
    assert list(array) == [99, 7, 5, 4, 15, 2]


if __name__ == "__main__":
    demo()
```

Python's underlying list is dynamic, so this class models fixed capacity at the API level.
Native implementations can embed an actual fixed-size array.
The sentinel distinguishes unused capacity from a stored `None` value.
Only the initialized prefix is exposed.
Insertion checks capacity before shifting, so failure leaves contents unchanged.
Deletion shifts left and clears the newly unused final slot.
That clear releases references promptly in a managed runtime.
Native generic arrays must construct and destroy elements according to their lifetime rules.
Byte copying is safe only for trivially copyable representations.
For overlapping shifts, use move direction carefully.
Right shifts proceed from high index to low index.
Left shifts proceed from low index to high index.
Native `memmove` handles overlap, while `memcpy` does not promise to.
Use checked index arithmetic before pointer arithmetic.
Use checked multiplication before allocating `count * element_size` bytes.
Expose slices with explicit ownership and lifetime contracts.
A mutable view should not outlive its backing array.
Concurrent writes to distinct elements may still share cache lines and cause false sharing.
Atomicity depends on element type and platform.
Do not infer thread safety from non-overlapping indices alone.
For protocol layouts, define endianness and padding explicitly rather than serializing native structs blindly.
For SIMD, ensure base alignment and tail handling meet instruction requirements.
For multidimensional arrays, preserve shape and stride metadata together.
A pointer plus element count is insufficient to interpret arbitrary strided views.
Prefer standard library spans, slices, and fixed-array types over raw pointer-length pairs when available.
Use immutable views for read-only APIs.
Return errors rather than wrapping out-of-range indices unless circular semantics are intentional.
Benchmark bulk operations with realistic element sizes.
Large objects may favor indirect storage even though it adds pointer chasing.

## 5. Asymptotic Time & Space Complexity

Reading or replacing a valid element by index takes $O(1)$ time.
The address formula uses constant arithmetic and one memory access at the abstract level.
Bounds checking also takes $O(1)$ time.
Sequential traversal visits $n$ elements and takes $O(n)$ time.
Searching an unsorted static array takes $O(n)$ time in the worst case.
Binary search takes $O(\log n)$ time only when elements are sorted under the same comparator.
Appending into unused fixed capacity takes $O(1)$ time.
Appending when capacity is full is impossible without replacement storage.
Middle insertion into a used prefix shifts up to $n$ elements and takes $O(n)$ time.
Middle deletion similarly takes $O(n)$ time under compact-prefix semantics.
Replacement does not shift and remains $O(1)$.
The array payload occupies $\Theta(nw)$ bytes for element stride $w$.
With fixed-width elements, this is $\Theta(n)$ words.
The fixed-capacity wrapper adds $O(1)$ size metadata.
Unused capacity still occupies storage.
If capacity is $C$ and logical size is $n$, retained slots are $\Theta(C)$, not $\Theta(n)$.
Iteration uses $O(1)$ auxiliary space.
Copying the entire array takes $O(n)$ time and $O(n)$ destination space.
A non-owning slice can be represented with $O(1)$ metadata.
If slicing copies elements, it costs time and space proportional to slice length.
Language semantics decide which claim applies.
Row-major access traversing rows has favorable contiguous locality.
Column traversal of an $r\times c$ row-major matrix still performs $O(rc)$ accesses.
Its cache-miss constant can be much worse because stride is $c$ elements.
Blocking or tiling reorganizes loops to reuse cache lines.
Transposition takes $O(rc)$ time and usually $O(rc)$ extra space for a simple out-of-place implementation.
Some square matrices can be transposed in place with $O(1)$ auxiliary storage.
Fixed extent enables compile-time unrolling for small known $n$.
That changes constants and code size, not asymptotic operation count.
Compared with a linked list, arrays use less per-element metadata and provide $O(1)$ indexing.
Linked lists can splice after a known node in $O(1)$ but require traversal to find an index.
Compared with dynamic vectors, static arrays avoid reallocation and capacity growth.
They cannot absorb unknown-length input without a separate overflow policy.

## 6. Systems Connections

CPU caches fetch blocks containing adjacent array elements.
Sequential iteration uses most bytes in each fetched cache line.
Pointer-linked structures often fetch a line for only one node.
Hardware prefetchers also recognize regular array access patterns.
Vector instructions process multiple contiguous elements per operation.
Alignment and tail handling affect implementation details.
Embedded systems use fixed arrays to make memory budgets statically inspectable.
Interrupt handlers avoid unpredictable allocation by writing into bounded buffers.
When producer and consumer run concurrently, circular indexing can turn a fixed array into a ring buffer.
That structure requires separate head, tail, and fullness invariants.
Network packets contain fixed-width fields and bounded arrays.
Parsers must validate declared lengths before slicing input.
Never trust a packet count before checking multiplication and remaining bytes.
File formats often define row-major raster data or fixed-size directory entries.
Memory mapping can expose those arrays without copying when alignment and representation match.
Portable parsers still handle endianness and malformed offsets explicitly.
Databases store fixed-width columns densely and compute tuple positions through offsets.
Variable-width columns use offset arrays plus payload regions.
The offset array itself is a static or immutable indexed structure for a batch.
GPU kernels rely heavily on contiguous arrays.
Coalesced neighboring accesses combine memory transactions across threads.
Strided or scattered patterns waste bandwidth.
Numerical libraries encode shape, stride, data type, and base pointer in tensor descriptors.
A transposed tensor can be a view with swapped strides rather than copied storage.
Algorithms must respect noncontiguity unless they request a compact copy.
FFI boundaries commonly pass pointer and length.
Both must remain valid for the duration of the foreign call.
Ownership of the backing array must be clear.
Serialization should transmit logical elements, not uninitialized capacity or native padding.
Security-sensitive code uses constant-size arrays for keys, nonces, and hashes.
Compile-time extent prevents accidental truncation but does not guarantee erasure.
Bounds-safe types prevent many memory-corruption bugs.
Unsafe indexing may be justified only after a preceding proof that dominates every access.
Keep that proof local and test it under sanitizers.
Static arrays therefore connect elementary indexing to cache architecture, binary interfaces, and memory safety.

## 7. Practice Checklist

- State whether fixed extent or static storage duration is meant.
- Define element type and representation stride.
- Validate `0 <= index < length` before access.
- Use checked multiplication for allocation sizes.
- Include alignment padding in concrete storage estimates.
- Keep capacity distinct from logical initialized size.
- Enforce `0 <= size <= capacity`.
- Expose only initialized slots.
- Distinguish replacement from structural insertion.
- Shift right from high to low during insertion.
- Shift left from low to high during compact deletion.
- Clear removed managed references when appropriate.
- Run destructors for nontrivial native elements.
- Use overlap-safe movement primitives.
- Reject append when fixed capacity is full.
- Define whether negative indices are supported.
- Define row-major, column-major, or strided layout.
- Carry shape and stride metadata with multidimensional views.
- Keep slices within backing-storage lifetime.
- Document aliasing for mutable views.
- Do not serialize native padding accidentally.
- Define byte order for external representations.
- Test zero length and capacity.
- Test first and last valid indices.
- Test exactly one past the end.
- Test full-capacity insertion failure leaves state unchanged.
- Test middle shifts with duplicate and reference values.
- Compare randomized operations with a trusted list model.
- Measure row and column access separately for matrices.
- Tile large matrix operations for cache locality when appropriate.
- Check SIMD alignment and scalar tails.
- Avoid false sharing in concurrent element updates.
- Verify atomicity requirements per element type.
- Prefer standard fixed-array and span types.
- Minimize raw pointer arithmetic.
- Keep unchecked access behind a local proof.
- Run native implementations under bounds and address sanitizers.
- Include unused capacity in retained-memory budgets.
- Choose dynamic storage when input extent is genuinely unknown.
- Preserve the simple address invariant throughout every optimization.

## 8. Frequently Asked Questions

### What makes an array static?

Its physical element capacity is fixed for the lifetime of that array object.
This does not necessarily mean it uses a language's static storage duration.

### Why is indexing $O(1)$?

The address is computed as base plus index times fixed element stride.
No preceding element must be visited.

### Can a static array be mutable?

Yes.
Its values can be replaced while its extent remains fixed.

### Can it support insertion?

A fixed-capacity buffer can insert while unused slots remain, but preserving compact order requires shifting a suffix in $O(n)$ time.

### Is a two-dimensional array always contiguous?

No.
It may be one flat row-major allocation, a column-major block, a strided view, or an array of separately allocated rows.

### Why are row-major loop orders faster?

Walking adjacent columns inside one row accesses neighboring memory and uses cache lines efficiently.
Column-first traversal jumps by a row stride.

### Does slicing copy the data?

It depends on the language and API.
A slice may be a constant-size view or a newly allocated copy proportional to its length.

### Why is multiplication overflow dangerous?

If `count * element_size` wraps, an allocator may reserve too few bytes while later code writes the full logical element count.

### What is the difference between length and capacity?

Length counts initialized logical elements; capacity counts physical slots available.
A pure static array often exposes both as the same value, while fixed-capacity buffers separate them.

### Are arrays always faster than linked lists?

No universal claim holds, but arrays usually have better indexing and locality.
Linked structures can make some splices cheap once nodes are already known.

### Can multiple threads safely update different indices?

Only if the element operations and surrounding invariants are thread-safe.
Distinct indices can still share cache lines and create performance contention.

### When should a static array be chosen?

Choose it when extent is known or strictly bounded, compact contiguous storage matters, and predictable capacity is more valuable than structural growth.
