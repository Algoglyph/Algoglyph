# Linear Indexing: Mapping Structured Coordinates into Contiguous Storage

![Linear indexing](/images/dsa/linear-indexing-dark.jpg#dark)

Linear indexing converts a coordinate in a multidimensional structure into one integer offset.
The arithmetic looks small, but it defines the memory layout used by arrays, matrices, images, tensors, and serialized grids.
A wrong stride silently reads the right bytes from the wrong logical location.

## 1. Historical Context & Motivation

### Memory is addressed linearly

Computer memory exposes a linear address space even when a program models rows, columns, channels, batches, or higher-dimensional tensors.
A layout rule must translate a tuple such as $(r,c)$ into one element index.

For a dense matrix, the common choices are row-major and column-major order.
They store the same values in different sequences.
The choice affects interoperability, cache locality, and which traversal direction is contiguous.

### Row-major order

In row-major layout, all columns of row zero come first, followed by all columns of row one.
For $R$ rows and $C$ columns, coordinate $(r,c)$ maps to

$$
i=rC+c.
$$

C-family arrays and many image buffers use row-major conventions.
Exact language and library behavior should still be checked rather than inferred from language ancestry.

### Column-major order

In column-major layout, all rows of column zero come first.
Coordinate $(r,c)$ maps to

$$
i=cR+r.
$$

Fortran and several numerical environments traditionally use column-major storage.
Transferring raw data between layouts without conversion effectively transposes the coordinate interpretation.

### Beyond two dimensions

A tensor index is reduced with strides.
For dimensions $(d_0,d_1,\ldots,d_{k-1})$ in row-major order, define

$$
s_j=\prod_{t=j+1}^{k-1}d_t.
$$

Then coordinate $(x_0,\ldots,x_{k-1})$ maps to

$$
i=\sum_{j=0}^{k-1}x_js_j.
$$

The final dimension has stride one.

### What “linear indexing” can also mean

Some environments permit direct access to a multidimensional array using one linear index.
Others use the phrase for simple sequential lookup structures.
This article focuses on coordinate flattening into dense storage.
It is distinct from database indexing and from linear search.

### Why layout knowledge matters

Layout arithmetic appears in:

- matrix kernels;
- image processing;
- GPU buffers;
- network serialization;
- memory-mapped files;
- dynamic-programming tables;
- grid graph algorithms;
- tensor interoperability.

The formula is part of the data contract.
Changing it without migrating stored bytes changes the meaning of every offset.

## 2. Core Mathematical Invariants

### Coordinate domain

For a dense $k$-dimensional array, valid coordinates satisfy

$$
0\le x_j<d_j
$$

for every dimension $j$.
The total element count is

$$
N=\prod_{j=0}^{k-1}d_j.
$$

Every valid coordinate must map to an integer in $[0,N)$.

### Bijection invariant

For positive dimensions, standard dense strides create a bijection between valid coordinate tuples and linear indices $0$ through $N-1$.
No two coordinates collide.
Every linear index identifies exactly one coordinate.

This is the correctness condition for flattening.
Bounds checks alone do not detect a stride formula that produces collisions.

### Row-major strides

Set the last stride to one:

$$
s_{k-1}=1.
$$

Moving left through dimensions,

$$
s_j=d_{j+1}s_{j+1}.
$$

Increasing coordinate $x_j$ by one advances the linear index by $s_j$.
All later dimensions occupy one contiguous block of exactly that size.

### Column-major strides

Set the first stride to one:

$$
s_0=1.
$$

Moving right,

$$
s_j=d_{j-1}s_{j-1}.
$$

The first coordinate varies contiguously.

### Inverse mapping

For row-major dimensions and a valid linear index $i$, recover coordinates from left to right:

$$
x_j=\left\lfloor\frac{i}{s_j}\right\rfloor,
$$

then update

$$
i\leftarrow i\bmod s_j.
$$

At the final dimension, stride one returns the remaining index.
This is mixed-radix decomposition.

### Round-trip invariant

For every valid coordinate $x$,

$$
\operatorname{unflatten}(\operatorname{flatten}(x))=x.
$$

For every valid linear index $i$,

$$
\operatorname{flatten}(\operatorname{unflatten}(i))=i.
$$

Round-trip property tests catch stride-order errors effectively.

### Byte addressing

If each element occupies $b$ bytes and base address is $A$, element index $i$ resides at

$$
A+bi.
$$

The multiplication must not overflow the address or size type.
Alignment and padding can modify layouts for records, but dense primitive arrays ordinarily use a fixed element stride.

### Sliced views

A view need not be contiguous.
It can store a base offset $o$, shape, and arbitrary strides:

$$
i=o+\sum_j x_js_j.
$$

A transpose can swap shape entries and strides without moving data.
Negative strides can represent reversed axes when the buffer and language permit them.

### Zero-size dimensions

If any dimension is zero, total element count is zero and no coordinate is valid.
Stride values may still be representable, but flatten must reject every coordinate.
Inverse mapping has no valid input.

### Overflow invariant

Dimension products and index sums must be evaluated in a type wide enough for the maximum buffer.
Validate multiplication before allocation.
An overflowed total can lead to an undersized allocation followed by out-of-bounds access.

## 3. Step-by-Step Execution Trace

### Two-dimensional row-major example

Use a matrix with three rows and four columns:

```text
10 11 12 13
20 21 22 23
30 31 32 33
```

Its shape is $(3,4)$.
Row-major strides are $(4,1)$.

### Flatten coordinate `(2,1)`

Compute

$$
i=2\cdot4+1\cdot1=9.
$$

The row-major buffer is

```text
[10,11,12,13,20,21,22,23,30,31,32,33]
```

Index nine contains `31`, matching row two, column one.

### Neighbor offsets

Moving one column right changes index by one.
Coordinate `(2,2)` maps to ten.

Moving one row up changes index by negative four.
Coordinate `(1,1)` maps to five.

The stride vector encodes these moves directly.

### Invert index nine

First coordinate:

$$
r=\lfloor9/4\rfloor=2.
$$

Remainder:

$$
9\bmod4=1.
$$

Second coordinate is one.
The recovered tuple is `(2,1)`.

### Three-dimensional example

Use shape $(2,3,4)$.
Row-major strides are:

$$
s_2=1,
$$

$$
s_1=4,
$$

$$
s_0=3\cdot4=12.
$$

Coordinate $(1,2,3)$ maps to

$$
1\cdot12+2\cdot4+3=23.
$$

The total element count is $2\cdot3\cdot4=24$.
This coordinate is the final element.

### Invert index fourteen

For shape $(2,3,4)$ and strides $(12,4,1)$:

$$
x_0=\lfloor14/12\rfloor=1,
$$

with remainder two.

Then

$$
x_1=\lfloor2/4\rfloor=0,
$$

with remainder two.

Finally $x_2=2$.
Index fourteen maps to coordinate $(1,0,2)$.

Check:

$$
1\cdot12+0\cdot4+2=14.
$$

### Column-major contrast

For the original $3\times4$ matrix, column-major strides are $(1,3)$.
Coordinate `(2,1)` maps to

$$
2\cdot1+1\cdot3=5.
$$

Using row-major index nine against a column-major buffer would read a different logical coordinate.
The bytes are not self-describing.

### Transposed view

Start with row-major shape $(3,4)$ and strides $(4,1)$.
A transposed view has shape $(4,3)$ and strides $(1,4)$.

View coordinate `(1,2)` maps to source offset

$$
1\cdot1+2\cdot4=9.
$$

It reads the original coordinate `(2,1)` without moving element `31`.

### Boundary failures

Coordinate `(3,0)` is invalid because row index three equals the row count.
Coordinate `(0,-1)` is invalid because indices are nonnegative in this API.
Linear index twelve is invalid for a twelve-element matrix because the last valid index is eleven.

## 4. Production-Ready Implementations

### Checked Python layout

```python
from dataclasses import dataclass
from math import prod
from typing import Iterable


@dataclass(frozen=True)
class RowMajorLayout:
    shape: tuple[int, ...]
    strides: tuple[int, ...]
    size: int

    @classmethod
    def create(cls, dimensions: Iterable[int]) -> "RowMajorLayout":
        shape = tuple(dimensions)
        if any(dimension < 0 for dimension in shape):
            raise ValueError("dimensions must be nonnegative")

        strides = [1] * len(shape)
        for index in range(len(shape) - 2, -1, -1):
            strides[index] = strides[index + 1] * shape[index + 1]
        return cls(shape, tuple(strides), prod(shape))

    def flatten(self, coordinates: Iterable[int]) -> int:
        coordinate = tuple(coordinates)
        if len(coordinate) != len(self.shape):
            raise ValueError("coordinate rank differs from layout rank")
        offset = 0
        for value, dimension, stride in zip(coordinate, self.shape, self.strides):
            if not 0 <= value < dimension:
                raise IndexError("coordinate outside layout")
            offset += value * stride
        return offset

    def unflatten(self, offset: int) -> tuple[int, ...]:
        if not 0 <= offset < self.size:
            raise IndexError("linear index outside layout")
        coordinate = []
        remainder = offset
        for stride in self.strides:
            value, remainder = divmod(remainder, stride)
            coordinate.append(value)
        return tuple(coordinate)


layout = RowMajorLayout.create((2, 3, 4))
assert layout.strides == (12, 4, 1)
assert layout.flatten((1, 2, 3)) == 23
assert layout.unflatten(14) == (1, 0, 2)
for index in range(layout.size):
    assert layout.flatten(layout.unflatten(index)) == index
```

The zero-rank scalar case needs a separate convention if supported.
This implementation treats an empty shape as size one through `math.prod`.

### Checked multiplication in C++

```cpp
#include <cstddef>
#include <limits>
#include <stdexcept>
#include <vector>

std::vector<std::size_t> row_major_strides(
    const std::vector<std::size_t>& shape
) {
    std::vector<std::size_t> strides(shape.size(), 1);
    for (std::size_t i = shape.size(); i > 1; --i) {
        const std::size_t dimension = shape[i - 1];
        const std::size_t previous = strides[i - 1];
        if (dimension != 0 && previous >
            std::numeric_limits<std::size_t>::max() / dimension) {
            throw std::overflow_error("shape product overflows size_t");
        }
        strides[i - 2] = previous * dimension;
    }
    return strides;
}

std::size_t flatten(
    const std::vector<std::size_t>& coordinate,
    const std::vector<std::size_t>& shape,
    const std::vector<std::size_t>& strides
) {
    if (coordinate.size() != shape.size() || shape.size() != strides.size()) {
        throw std::invalid_argument("rank mismatch");
    }
    std::size_t offset = 0;
    for (std::size_t axis = 0; axis < shape.size(); ++axis) {
        if (coordinate[axis] >= shape[axis]) {
            throw std::out_of_range("coordinate outside shape");
        }
        const std::size_t term = coordinate[axis] * strides[axis];
        if (offset > std::numeric_limits<std::size_t>::max() - term) {
            throw std::overflow_error("offset addition overflows size_t");
        }
        offset += term;
    }
    return offset;
}
```

Production code should validate total byte size as well as element count.

### Property testing

Generate small positive shapes.
Enumerate every coordinate or every linear index.
Check both round-trip identities.
Also assert that flattened indices form exactly the set `0..N-1` without duplicates.

### Interoperability contracts

When serializing raw arrays, record shape, element type, byte order, and layout order.
Strides are necessary for arbitrary views.
Do not assume the receiver shares the producer's defaults.

## 5. Asymptotic Time & Space Complexity

### Flatten and unflatten

For a rank-$k$ tensor, flatten performs $k$ multiply-add steps.
Time is $O(k)$ and auxiliary space is $O(1)$ when coordinates are streamed.

Unflatten performs $k$ divisions and remainders.
Time is $O(k)$ and output space is $O(k)$.

For fixed-rank structures such as 2D images, these operations are $O(1)$ with respect to element count.

### Stride construction

Constructing dense strides takes $O(k)$ time and $O(k)$ storage.
Recompute them only when shape or layout changes.

### Traversal

Visiting all $N$ elements is $\Theta(N)$ regardless of coordinate formula.
Traversal order affects cache misses and prefetching.
Following the stride-one axis in the innermost loop ordinarily gives contiguous access.

### Transposition

Creating a transposed view by swapping shape and strides is $O(k)$.
Materializing a contiguous transposed copy is $\Theta(N)$ time and space for the destination.

### Bounds checking

Checking all $k$ coordinates adds $O(k)$ comparisons.
Compilers or libraries may eliminate repeated checks inside proven-safe loops.
Removing checks manually trades safety for a small constant and should be justified by a trusted boundary.

### Sparse alternatives

Dense indexing allocates $O(N)$ elements even when most logical entries are empty.
Sparse coordinate or compressed formats use storage proportional to nonzero entries but require different lookup and traversal costs.

## 6. Systems Connections

### Matrix kernels

Loop order should match layout.
For row-major matrices, iterating columns inside rows gives unit-stride access.
Reversing loops can touch one cache line per access on large matrices.

### Images

An image may use interleaved channels `(row,column,channel)` or planar channels `(channel,row,column)`.
The same pixel coordinate maps differently.
Metadata must specify channel order and row pitch, which can include padding.

### GPU tensors

GPU kernels receive shapes and strides to interpret buffers.
Coalesced access depends on adjacent threads touching adjacent addresses.
A mathematically correct layout can still perform poorly if thread mapping fights the stride-one axis.

### Dynamic programming

A 2D DP table can be flattened to one allocation using `row * columns + column`.
Rolling-array optimization can discard earlier rows when the recurrence only depends on a bounded history.
That changes storage, not the logical state definition.

### Grid graphs

Flattened cell indices make visited arrays and queues compact.
For four-neighbor movement, convert an index back to row and column or use boundary-aware offset arithmetic.
Blindly adding one across a row boundary creates a false edge.

### Serialization

Raw bytes without layout metadata are ambiguous.
Schema evolution must preserve or explicitly migrate shape order, strides, and element encoding.
Endianness matters for multibyte values but is separate from coordinate layout.

### Security

Untrusted dimensions can overflow products before allocation.
Validate each multiplication and byte-size conversion.
Reject coordinates before pointer arithmetic.

## 7. Practice Checklist

### Define layout

- State row-major or column-major order.
- State axis order.
- State coordinate origin.
- State shape.
- State element size.
- State byte order for serialization.
- State padding or pitch.

### Flatten safely

- Validate coordinate rank.
- Validate every coordinate bound.
- Precompute strides.
- Use a wide unsigned size type.
- Check products for overflow.
- Check additions for overflow.
- Distinguish element offset from byte offset.

### Invert safely

- Validate linear index below total size.
- Divide by strides in layout order.
- Carry the remainder.
- Handle zero-size layouts.
- Test first and last index.
- Verify round trips.

### Test cases

- One dimension.
- One-by-one matrix.
- Rectangular matrix.
- Three dimensions.
- Dimension of size one.
- Zero-size dimension.
- First coordinate.
- Last coordinate.
- Out-of-range coordinate.
- Overflowing shape product.

### Performance

- Put stride-one traversal inside.
- Avoid repeated division in hot loops.
- Hoist stable strides.
- Benchmark materialized versus view transposes.
- Consider cache blocking.
- Use sparse storage when density is low.

## 8. Frequently Asked Questions

### What is a linear index?

It is one integer identifying an element in a multidimensional layout's underlying sequence.

### What is a stride?

A stride is the change in linear element offset caused by increasing one coordinate by one.

### What is row-major order?

The last coordinate varies fastest; complete rows are contiguous in a 2D matrix.

### What is column-major order?

The first coordinate varies fastest; complete columns are contiguous in a 2D matrix.

### Does changing layout change matrix values?

The abstract values need not change, but their byte positions do.
Interpreting unchanged bytes under another layout changes which coordinate receives each value.

### Is transpose always $O(N)$?

Materializing transposed bytes is $O(N)$.
A strided view can transpose metadata in $O(k)$ without copying.

### Why can a view be noncontiguous?

Its strides may skip elements, reverse an axis, or visit source dimensions in another order.

### How do I flatten a 3D coordinate?

For row-major shape $(A,B,C)$, use $xBC+yC+z$.

### How do I avoid overflow?

Check each dimension multiplication before performing it and verify element-count-to-byte-count multiplication separately.

### Can negative indices be supported?

An API can normalize them relative to dimension size before flattening.
The core checked coordinate domain remains nonnegative after normalization.

### Why is traversal order important?

Contiguous accesses use cache lines and hardware prefetching more effectively than large-stride accesses.

### Is this a database index?

No.
This article concerns arithmetic mapping from coordinates to dense storage offsets.

### What is the most common bug?

Using row count where column stride is required, especially in rectangular matrices where the error cannot hide behind equal dimensions.

### How should I test layout code?

Use rectangular and higher-dimensional shapes, verify both round-trip identities, and compare flattened index sets with the complete expected range.

### What should I study next?

Study cache blocking, tensor strides, sparse matrix formats, Morton order, and memory-safe view abstractions.
