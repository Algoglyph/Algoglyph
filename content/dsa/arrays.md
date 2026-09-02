# Contiguous Arrays: Address Arithmetic, Strides & Cache-Aware Traversal

![Contiguous array and row-major matrix layout](/images/dsa/static-arrays-dark.jpg#dark)

An array is not merely “a list of values.”

Its defining representation is a fixed-stride sequence of equal-sized elements stored in one contiguous address interval.

That representation makes random access arithmetic possible, gives iteration predictable locality, and makes insertion in the middle expensive for the same reason: later elements physically occupy the next slots.

This article connects the logical index model to bytes, multidimensional strides, dynamic capacity, safe bounds, and the costs that array APIs sometimes hide.

## 1. Historical Context & Motivation

### Why contiguous storage became fundamental

Machine memory is addressed linearly.

When a program needs many values of the same representation, placing them at equal byte intervals turns a lookup problem into arithmetic.

The processor does not need to follow links from the first element to the $i$th element.

It computes an offset from a base address.

This simple mechanism supports tables, image buffers, matrices, stacks, heaps, hash-table buckets, adjacency storage, and much of the implementation machinery behind higher-level collections.

The array abstraction predates modern cache hierarchies, but contiguous traversal happens to match them well.

Fetching one address typically brings a surrounding cache line into a nearby level of the memory hierarchy.

Visiting adjacent elements can reuse those fetched bytes.

Hardware prefetchers also recognize regular access patterns more easily than pointer-chasing patterns.

Contiguity is therefore both a semantic property and a performance property.

### The problem arrays solve

Suppose a program stores $n$ fixed-size records and needs to access record $i$ directly.

A linked representation requires following up to $i$ references unless it maintains an additional index.

An array computes the record's location in constant arithmetic time.

The trade-off is equally direct.

To keep the sequence contiguous and ordered, inserting at index $i$ requires moving the suffix $[i,n)$ unless spare semantics allow an unordered replacement.

Deleting from the middle has the same suffix-compaction cost.

Arrays optimize positional lookup and sequential scans, not arbitrary structural mutation.

### Three different things called an array

A **fixed array** has a length determined at creation and storage reserved for exactly that many elements.

A **dynamic array** owns a contiguous allocation whose capacity may exceed its logical size.

When capacity is exhausted, it allocates a larger block and relocates or copies existing elements.

A **language-level list** may or may not store element values contiguously.

For example, a runtime can store a contiguous array of references whose pointed-to objects live elsewhere.

The indices are still array-like, but scanning may involve a second memory access per element.

Performance reasoning must identify what is contiguous: values, references, headers, or none of them.

### Logical grids on linear memory

A matrix appears two-dimensional in notation.

Ordinary memory remains a one-dimensional byte sequence.

The implementation maps coordinates to a linear offset using **strides**.

The chosen layout determines which dimension is contiguous.

Loop order that agrees with the layout usually has better spatial locality.

Loop order that jumps by a large stride may touch a new cache line for nearly every element.

The mathematical result can be identical while the memory traffic differs substantially.

### What constant-time access really means

Array indexing is $O(1)$ in the random-access machine model because the number of address-arithmetic operations does not grow with $n$.

That does not mean every access has equal physical latency.

A cache hit and a page fault are both one abstract array operation.

Bounds checks, address translation, cache state, NUMA placement, and storage medium affect wall-clock cost.

Asymptotic analysis and locality analysis answer different questions.

Both matter in production code.

### Questions to answer before choosing an array

- Is the number of elements fixed, bounded, or unbounded?
- Are positions stable identifiers or merely current order?
- Are insertions concentrated at the end or spread through the sequence?
- Does the element type have fixed width?
- Must memory remain contiguous for an external API?
- Can relocation invalidate references, pointers, or iterators?
- Does a matrix need row-major, column-major, tiled, or sparse storage?
- Can the product of dimensions overflow the index type?

An array is an excellent default only when its invariants match the workload.

## 2. Core Mathematical Invariants

### One-dimensional address invariant

Let an array begin at byte address $B$.

Let each element occupy exactly $w$ bytes.

For zero-based index $i$, the element address is

$$
\operatorname{addr}(A[i])=B+i\cdot w.
$$

The legal index invariant is

$$
0\le i<n,
$$

where $n$ is logical length.

The occupied byte interval for element $i$ is

$$
[B+iw, B+(i+1)w).
$$

Equal width makes this interval computable without examining another element.

If $i$ is outside the legal range, the arithmetic still produces an address, but that address is not an array element.

In an unchecked language, dereferencing it can be undefined behavior or memory corruption.

### Size and capacity invariant

A dynamic array distinguishes logical size $n$ from allocated capacity $c$.

The invariant is

$$
0\le n\le c.
$$

Elements exist only in slots $[0,n)$.

Slots $[n,c)$ are storage reserved for possible future elements, not initialized logical members.

Appending without reallocation is legal only when $n<c$.

After constructing the new element in slot $n$, size becomes $n+1$.

Capacity does not change.

When $n=c$, append must obtain more storage or fail according to the API contract.

### Geometric-growth invariant

Suppose full capacity grows by a factor $\alpha>1$.

Capacities follow approximately

$$
1,\alpha,\alpha^2,\ldots.
$$

Growing by one slot each time would copy

$$
1+2+\cdots+(n-1)=\Theta(n^2)
$$

elements over $n$ appends.

Geometric growth copies a series bounded by a constant multiple of $n$:

$$
1+\alpha+\alpha^2+\cdots+\alpha^{k-1}
<\frac{\alpha^k}{\alpha-1}=O(n).
$$

Therefore $n$ appends take $O(n)$ aggregate relocation work.

The amortized append cost is $O(1)$ even though one append can cost $\Theta(n)$.

The growth factor controls a trade-off between unused capacity and reallocation frequency.

It is an implementation policy, not a universal language guarantee unless the API explicitly specifies it.

### Iterator and reference invalidation

When a dynamic array reallocates, its base address changes.

Every pointer, reference, span, or iterator into the old allocation may become invalid.

The logical values can be preserved while external aliases are not.

Code that stores `&array[0]`, appends, and then uses the saved pointer must know the container's invalidation contract.

Reserving adequate capacity can avoid some reallocations, but reserve itself may relocate existing elements.

### Ordered insertion invariant

To insert value $x$ at index $i$ while preserving order, the original suffix must shift right:

$$
A'[j+1]=A[j]\quad\text{for }i\le j<n.
$$

The new value occupies $A'[i]=x$.

Copying from left to right would overwrite values before they are moved.

An in-place implementation moves the suffix from right to left.

The number of moved elements is $n-i$.

Insertion at the end moves zero existing elements.

Insertion at the front moves all $n$.

### Ordered deletion invariant

Deleting index $i$ while preserving order shifts the later prefix of the suffix left:

$$
A'[j]=A[j+1]\quad\text{for }i\le j<n-1.
$$

The new logical size is $n-1$.

The number of moved elements is $n-i-1$.

If order is irrelevant, replacing $A[i]$ with the final element and decrementing size performs constant data movement.

That alternative changes the sequence order and must be exposed in the operation contract.

### Row-major stride invariant

Consider a logical matrix with $R$ rows and $C$ columns stored row-major.

Coordinate $(r,c)$ maps to linear index

$$
\operatorname{index}_{row}(r,c)=rC+c.
$$

The legal coordinate conditions are

$$
0\le r<R,\qquad 0\le c<C.
$$

The row stride is $C$ elements or $Cw$ bytes.

Incrementing $c$ by one advances one element.

Incrementing $r$ by one advances $C$ elements.

Rows are contiguous; columns are strided.

### Column-major stride invariant

For column-major storage,

$$
\operatorname{index}_{col}(r,c)=cR+r.
$$

The column stride is $R$ elements.

Incrementing $r$ advances one element.

Incrementing $c$ advances $R$ elements.

Neither layout changes matrix mathematics.

The layout changes coordinate-to-address mapping and preferred traversal order.

### General multidimensional strides

For dimensions $(d_0,d_1,\ldots,d_{k-1})$ in row-major order, define strides

$$
s_j=\prod_{m=j+1}^{k-1}d_m.
$$

Then coordinate $(i_0,\ldots,i_{k-1})$ maps to

$$
\sum_{j=0}^{k-1}i_js_j.
$$

The last stride is $1$.

Every coordinate must satisfy $0\le i_j<d_j$.

A view can use nonstandard strides to represent a slice or transpose without copying.

Such a view may no longer be contiguous even though its underlying allocation is.

### Dimension-product safety

Allocating an $R\times C$ matrix needs $RC$ elements.

The multiplication must be checked before allocation.

For maximum representable element count $M$, the safe condition is

$$
R=0\quad\text{or}\quad C\le\left\lfloor\frac{M}{R}\right\rfloor.
$$

Computing `R * C` first and checking afterward is too late if unsigned multiplication wrapped.

The same rule applies when multiplying by element width to obtain bytes.

### Cache-line locality invariant

If a cache line contains $L$ bytes and elements occupy $w$ bytes, a line can contain roughly $L/w$ adjacent elements, subject to alignment.

A sequential scan uses most fetched elements.

A scan with stride much larger than $L$ may use one element per fetched line.

Big-O treats both scans as $O(n)$.

The second can transfer far more bytes from slower memory levels.

Locality does not change algorithmic correctness, but it changes the constant that often dominates numeric workloads.

### Array-of-structures versus structure-of-arrays

An array of structures stores all fields of one record together:

```text
x0 y0 mass0 | x1 y1 mass1 | x2 y2 mass2
```

A structure of arrays stores each field contiguously:

```text
x0 x1 x2 | y0 y1 y2 | mass0 mass1 mass2
```

The first layout favors operations using all fields of one record.

The second favors bulk operations over one field and can simplify vectorization.

Both are arrays; their element definition and access pattern differ.

## 3. Step-by-Step Execution Trace

### Matrix and storage assumptions

Use a $3\times4$ matrix of 32-bit integers.

Assume the first byte is at illustrative address `1000`.

Each integer occupies $w=4$ bytes.

The logical matrix is

$$
M=
\begin{bmatrix}
10 & 11 & 12 & 13\\
20 & 21 & 22 & 23\\
30 & 31 & 32 & 33
\end{bmatrix}.
$$

Row-major storage contains

```text
[10, 11, 12, 13, 20, 21, 22, 23, 30, 31, 32, 33]
```

### Flatten coordinate `(0, 0)`

The linear index is

$$
0\cdot4+0=0.
$$

The byte address is

$$
1000+0\cdot4=1000.
$$

The stored value is `10`.

This establishes the base case: the logical first coordinate maps to the allocation base.

### Flatten coordinate `(0, 3)`

The linear index is

$$
0\cdot4+3=3.
$$

The address is

$$
1000+3\cdot4=1012.
$$

The stored value is `13`.

Advancing across a row changes the address by one element width each time.

### Cross the row boundary

Coordinate `(1, 0)` maps to

$$
1\cdot4+0=4.
$$

Its address is

$$
1000+4\cdot4=1016.
$$

The previous coordinate `(0,3)` occupied bytes `[1012,1016)`.

The new coordinate begins exactly at `1016`.

Rows are logical groupings; no padding exists between them in this packed example.

### Access coordinate `(2, 1)`

The row-major index is

$$
2\cdot4+1=9.
$$

The byte offset is

$$
9\cdot4=36.
$$

The address is `1036`, and the value is `31`.

No earlier matrix value must be read to compute it.

### Trace a row-major scan

Use loops with rows outside and columns inside:

```text
for r = 0..2
    for c = 0..3
        visit M[r,c]
```

The linear index sequence is

```text
0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
```

The address sequence advances by four bytes every visit.

The scan agrees with storage order.

### Trace a column-first scan

Swap the loop order:

```text
for c = 0..3
    for r = 0..2
        visit M[r,c]
```

The linear index sequence becomes

```text
0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11
```

Within a column, each access jumps by four elements or sixteen bytes.

The result of summing every element is unchanged.

The memory-access pattern is different.

For a much wider matrix, that stride can exceed a cache line and reduce spatial reuse.

### Produce a transposed copy

The transpose has shape $4\times3$.

For every source coordinate $(r,c)$, write

$$
T[c,r]=M[r,c].
$$

Source `(2,1)` with value `31` becomes destination `(1,2)`.

The destination row-major index is

$$
1\cdot3+2=5.
$$

After processing all coordinates, destination storage is

```text
[10, 20, 30, 11, 21, 31, 12, 22, 32, 13, 23, 33]
```

The logical transpose is

$$
T=
\begin{bmatrix}
10 & 20 & 30\\
11 & 21 & 31\\
12 & 22 & 32\\
13 & 23 & 33
\end{bmatrix}.
$$

### Validate the final state

The source retains shape $3\times4$ and twelve elements.

The destination has shape $4\times3$ and twelve elements.

Every source element appears once at coordinates with indices exchanged.

The index invariant proves that neither calculation accesses outside `[0,12)`.

The trace connects logical coordinates, linear indices, byte addresses, traversal strides, and copying semantics.

## 4. Production-Ready Implementations

### Checked row-major matrix in C++

```cpp
#include <cassert>
#include <cstddef>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <utility>
#include <vector>

class IntMatrix {
public:
    IntMatrix(std::size_t rows, std::size_t columns, int initial = 0)
        : rows_(rows),
          columns_(columns),
          values_(checked_size(rows, columns), initial) {}

    std::size_t rows() const noexcept { return rows_; }
    std::size_t columns() const noexcept { return columns_; }
    std::size_t size() const noexcept { return values_.size(); }

    int& at(std::size_t row, std::size_t column) {
        return values_.at(index(row, column));
    }

    const int& at(std::size_t row, std::size_t column) const {
        return values_.at(index(row, column));
    }

    const std::vector<int>& storage() const noexcept {
        return values_;
    }

    IntMatrix transposed() const {
        IntMatrix result(columns_, rows_);
        for (std::size_t row = 0; row < rows_; ++row) {
            for (std::size_t column = 0; column < columns_; ++column) {
                result.at(column, row) = at(row, column);
            }
        }
        return result;
    }

private:
    static std::size_t checked_size(
        std::size_t rows,
        std::size_t columns
    ) {
        const std::size_t maximum =
            std::numeric_limits<std::size_t>::max();
        if (rows != 0 && columns > maximum / rows) {
            throw std::length_error("matrix dimensions overflow size_t");
        }
        return rows * columns;
    }

    std::size_t index(
        std::size_t row,
        std::size_t column
    ) const {
        if (row >= rows_ || column >= columns_) {
            throw std::out_of_range("matrix coordinate out of range");
        }
        return row * columns_ + column;
    }

    std::size_t rows_;
    std::size_t columns_;
    std::vector<int> values_;
};


int main() {
    IntMatrix matrix(3, 4);

    for (std::size_t row = 0; row < matrix.rows(); ++row) {
        for (std::size_t column = 0; column < matrix.columns(); ++column) {
            matrix.at(row, column) =
                static_cast<int>((row + 1) * 10 + column);
        }
    }

    assert(matrix.at(0, 0) == 10);
    assert(matrix.at(2, 1) == 31);
    assert(matrix.storage() == std::vector<int>({
        10, 11, 12, 13,
        20, 21, 22, 23,
        30, 31, 32, 33,
    }));

    const IntMatrix transposed = matrix.transposed();
    assert(transposed.rows() == 4);
    assert(transposed.columns() == 3);
    assert(transposed.storage() == std::vector<int>({
        10, 20, 30,
        11, 21, 31,
        12, 22, 32,
        13, 23, 33,
    }));

    bool rejected = false;
    try {
        static_cast<void>(matrix.at(3, 0));
    } catch (const std::out_of_range&) {
        rejected = true;
    }
    assert(rejected);

    std::cout << "matrix checks passed\n";
}
```

### Why the implementation uses one vector

A `vector<vector<int>>` represents rows as separate dynamic allocations.

Each row may be contiguous, but the full matrix is not guaranteed to be one contiguous block.

The flat vector gives one allocation and explicit row-major indexing.

It can be passed to APIs expecting a contiguous element buffer.

The class uses `at` for checked access at the public boundary.

An optimized internal kernel can use prevalidated unchecked indexing if profiling justifies it and the bounds proof remains local.

### Checked multiplication before allocation

`checked_size` divides before multiplying.

If `rows` is nonzero and `columns > max / rows`, the product cannot fit.

The implementation throws before unsigned wrap can create a deceptively small allocation.

The vector constructor can still reject an allocation that exceeds its own maximum size or available memory.

Arithmetic safety and allocation success are separate conditions.

### Empty matrices

Shapes `0 x C` and `R x 0` both have zero elements.

The class preserves the requested dimensions even though storage is empty.

No coordinate is legal when either dimension is zero.

Transposing `0 x C` produces `C x 0`.

Explicit shape matters because zero storage alone cannot distinguish those cases.

### In-place insertion for a bounded buffer

When capacity is already available, ordered insertion requires backward movement:

```cpp
void insert_into_buffer(
    std::vector<int>& storage,
    std::size_t& logical_size,
    std::size_t index,
    int value
) {
    if (logical_size >= storage.size()) {
        throw std::length_error("buffer capacity exhausted");
    }
    if (index > logical_size) {
        throw std::out_of_range("insertion index out of range");
    }

    for (std::size_t cursor = logical_size; cursor > index; --cursor) {
        storage[cursor] = storage[cursor - 1];
    }
    storage[index] = value;
    ++logical_size;
}
```

The loop condition avoids unsigned underflow.

At iteration `cursor`, slot `cursor` receives the old value from `cursor-1` before that source is overwritten.

The function treats the vector's existing size as initialized storage capacity for simplicity.

That differs from a real dynamic array implementation, which constructs objects in raw capacity slots.

### Testing insertion transitions

```cpp
void test_insert_into_buffer() {
    std::vector<int> buffer(6, 0);
    buffer[0] = 10;
    buffer[1] = 20;
    buffer[2] = 30;
    std::size_t logical_size = 3;

    insert_into_buffer(buffer, logical_size, 1, 15);

    assert(logical_size == 4);
    assert((std::vector<int>(buffer.begin(), buffer.begin() + 4) ==
            std::vector<int>{10, 15, 20, 30}));
}
```

The test checks logical size and retained suffix order.

A value-only check at the insertion position would miss overwritten elements.

### Ownership and views

An owning matrix controls the lifetime of its allocation.

A view stores a pointer or span plus shape and strides but does not own elements.

Views enable zero-copy submatrices and transposes.

They also create lifetime obligations: the owner must outlive every view, and owner reallocation can invalidate them.

A transpose view swaps strides without moving values.

Code consuming the view must not assume `stride[last] == 1` unless contiguity is part of its contract.

### Exception and relocation behavior

Dynamic-array growth for nontrivial objects may invoke move or copy constructors.

Exception guarantees depend on the element type and container API.

Relocation can be much more expensive than copying an integer word.

For large objects, storing stable owning pointers in the array trades contiguous object storage for cheap pointer relocation.

That decision changes locality and ownership, so it should follow workload measurements rather than folklore.

## 5. Asymptotic Time & Space Complexity

### Fixed-array operations

Index lookup performs constant arithmetic:

$$
O(1).
$$

Updating an existing index is also $O(1)$ after bounds validation.

Scanning all $n$ elements is $\Theta(n)$ because each element is visited once.

Searching an unsorted array by value is $O(n)$ in the worst case.

Binary search is $O(\log n)$ only when the ordering precondition is available and compatible with the comparison.

### Insertion and deletion

Ordered insertion at index $i$ moves $n-i$ elements.

Its time is

$$
\Theta(n-i+1),
$$

including writing the new value.

Ordered deletion moves $n-i-1$ elements and takes $\Theta(n-i)$.

At the front, both are $\Theta(n)$.

At the end, insertion is $O(1)$ when capacity exists and deletion is $O(1)$ for trivial destruction.

Unordered deletion by swapping with the last element is $O(1)$ but changes order.

### Dynamic append

One append without growth is $O(1)$.

One append that reallocates is $\Theta(n)$ because existing elements move.

Under geometric capacity growth, a sequence of $n$ appends takes $O(n)$ total relocation and construction work.

The amortized append time is $O(1)$.

The worst-case latency of an individual append remains linear.

Latency-sensitive code may reserve capacity, use segmented storage, or schedule growth away from a critical path.

### Matrix operations

Coordinate access in a packed matrix is $O(1)$.

Scanning an $R\times C$ matrix is $\Theta(RC)$.

Creating a transposed copy is $\Theta(RC)$ time and $\Theta(RC)$ additional storage.

Creating a transpose view can be $O(1)$ time and space because it swaps shape and strides.

Algorithms consuming that view may experience noncontiguous access.

### Allocation and initialization

Allocating space for $n$ trivial elements may be treated differently from initializing $n$ elements.

Constructing a vector with $n$ initialized integers is $\Theta(n)$ because each logical element receives a value.

Obtaining virtual address space does not imply every page has been physically touched.

Language-level complexity should follow the container contract rather than assuming operating-system allocation behavior.

### Space overhead

A fixed array of $n$ values of width $w$ requires approximately $nw$ payload bytes, plus alignment or surrounding object metadata.

A dynamic array requires payload capacity $cw$ and a small metadata record such as pointer, size, and capacity.

Unused reserved payload is $(c-n)w$ bytes.

An array of references includes contiguous reference slots plus separately allocated referents.

Counting only slot width understates the total object graph.

### Locality is outside Big-O

Row-first and column-first scans of a row-major matrix both perform $RC$ visits.

Both are $\Theta(RC)$.

The column-first scan may transfer more cache lines and incur more translation misses.

Blocked traversal can improve reuse by operating on submatrices sized for cache.

This changes constants and memory traffic without changing the asymptotic element count.

Performance explanations should report both when relevant.

### Copy cost and element type

Moving $n$ bytes is not the same as moving $n$ complex objects.

For trivially copyable values, optimized bulk movement may use vectorized memory operations.

For objects with ownership, each relocation may run user-defined logic.

The asymptotic count is still linear, but the per-element cost and exception behavior differ.

## 6. Systems Connections

### Image and tensor buffers

An image often stores pixels in a flat buffer with row stride.

Rows may include padding to satisfy alignment, so row stride can exceed `width * pixel_size`.

Assuming packed rows when an API supplies a larger stride produces skewed images or out-of-bounds access.

Tensor libraries generalize the same shape-and-stride model to more dimensions.

A reshape can be zero-copy only when the requested logical order is compatible with underlying strides.

### Network and file formats

Binary protocols frequently encode repeated fixed-width records contiguously.

Parsing must account for byte order, alignment, length validation, and integer overflow.

Casting an arbitrary byte pointer to a structure array may violate alignment or representation rules.

Safe parsers validate the declared count against available bytes before computing offsets.

The familiar array formula becomes a security boundary when counts come from untrusted input.

### Database pages and columnar storage

Database pages pack entries into bounded byte regions to reduce I/O.

Row-oriented layouts cluster fields from one record.

Columnar layouts cluster values from one attribute, improving scans that touch a subset of columns and enabling compression over similar values.

This mirrors array-of-structures versus structure-of-arrays at storage-system scale.

Variable-length fields require offsets or indirection because equal-width arithmetic no longer locates each payload directly.

### Memory-mapped arrays

A file can be mapped into a process address space and interpreted as an array when representation, alignment, and lifetime constraints are satisfied.

Indexing remains address arithmetic.

Access can trigger page faults and storage reads.

The abstract operation is $O(1)$ while its physical latency depends on residency.

Durability and synchronization rules are not provided by the array abstraction itself.

### SIMD and accelerators

Contiguous homogeneous values are natural inputs to SIMD instructions.

Structure-of-arrays layouts often make one field available in adjacent lanes.

Alignment can affect which load instructions are efficient or legal on a target.

GPU kernels also rely on access patterns that let neighboring threads coalesce memory transactions.

Changing layout can improve throughput without changing the mathematical algorithm.

### Ring buffers

A ring buffer uses a fixed array and logical indices that wrap modulo capacity.

For capacity $c$, advancing an index uses

$$
next(i)=(i+1)\bmod c.
$$

The buffer must distinguish empty from full, often through a size counter, an unused slot, or monotonic sequence numbers.

Physical contiguity does not mean the logical sequence occupies one contiguous interval after wrapping.

Consumers may need two spans: tail-to-end and beginning-to-head.

### Security consequences of unchecked indexing

An out-of-range write can corrupt adjacent objects, allocator metadata, control data, or another array element.

Modern mitigations reduce exploitability but do not turn undefined access into correct behavior.

Bounds-safe interfaces, checked dimension multiplication, fuzzing, sanitizers, and memory-safe languages address different layers of the risk.

Eliminating one bounds check in a hot loop is justified only when a nearby proof or prior validation guarantees every computed index.

### Foreign-function interfaces

Native libraries often accept a base pointer, element count, shape, and strides.

The caller must keep the allocation alive and prevent relocation during the call.

Element layout and alignment must match the foreign ABI.

A language's high-level collection may need pinning or copying before exposing a pointer.

Zero-copy exchange is valuable precisely because its lifetime and representation contracts are strict.

## 7. Practice Checklist

### Representation questions

- Identify whether values or references are contiguous.
- Record element width and alignment.
- Separate logical size from capacity.
- Define ownership of the allocation.
- Document pointer and iterator invalidation.
- Choose row-major, column-major, tiled, or sparse matrix storage deliberately.
- Preserve shape even when total element count is zero.
- Include strides in every nonpacked view.

### Index safety

- Validate `0 <= index < size` before access.
- Validate every multidimensional coordinate independently.
- Check dimension multiplication before multiplying.
- Check byte-count multiplication separately when necessary.
- Avoid signed/unsigned conversions that turn negative indices into huge values.
- Keep half-open range conventions consistent.
- Test the final legal index and the first illegal index.
- Treat untrusted counts as input-validation concerns.

### Dynamic-array operations

- Reserve only when a useful upper bound is known.
- Do not use saved pointers after possible reallocation.
- Distinguish amortized append cost from worst-case append latency.
- Move insertion suffixes in the direction that avoids overwrite.
- Decide whether deletion must preserve order.
- Consider element move/copy cost, not just element count.
- Reset or destroy removed logical elements according to ownership semantics.
- Test size zero, size one, full capacity, and growth boundaries.

### Matrix correctness

- Write down the coordinate-to-index formula.
- Derive strides from shape and layout.
- Verify index results are in `[0, product(shape))`.
- Test rectangular matrices, not only squares.
- Test `0 x C`, `R x 0`, `1 x C`, and `R x 1`.
- Verify transpose swaps shape and coordinates.
- Keep source and destination aliases in mind for in-place operations.
- Match loop order to layout when locality matters.

### Performance investigation

- Measure row-first and column-first traversal on realistic dimensions.
- Record element type and total working-set bytes.
- Check whether data fits in relevant cache levels.
- Separate allocation, initialization, and processing time.
- Compare array-of-structures with structure-of-arrays for the actual kernel.
- Inspect unnecessary copies at API boundaries.
- Track reallocations and peak unused capacity.
- Use a profiler before removing safety checks.

### Tests to implement

1. Direct address/index examples with known offsets.
2. Ordered insertion at front, middle, and end.
3. Ordered deletion at front, middle, and end.
4. Reallocation with saved-alias invalidation checks where supported.
5. Matrix flattening and inverse coordinate recovery.
6. Transpose of square and rectangular matrices.
7. Overflowing dimension products.
8. Random coordinate comparisons against nested reference storage.
9. Sanitizer runs for native boundary code.
10. Fuzzed binary counts and lengths at parser boundaries.

### Problems that build array intuition

- In-place compaction with read and write indices.
- Rotation through reversal or cycle decomposition.
- Prefix sums and difference arrays.
- Sliding windows over contiguous ranges.
- Matrix spiral traversal with shrinking boundaries.
- Image convolution with row strides.
- Cache-aware matrix transpose by blocks.
- Ring-buffer enqueue and dequeue with wraparound.
- Stable versus unstable deletion.
- Coordinate compression into dense index arrays.

## 8. Frequently Asked Questions

### Why is array access constant time?

Equal-width contiguous elements let the implementation compute `base + index * width` with a fixed number of arithmetic operations.

No traversal through earlier elements is required.

Bounds checking and physical memory latency do not change the asymptotic operation count.

### Are Python lists contiguous arrays?

The language-level list provides dynamic-array indexing semantics, but implementations commonly store a contiguous array of object references rather than inline object values.

The referenced objects may live elsewhere.

Do not infer a language implementation contract beyond what that language specifies.

### Why is insertion at the front linear?

Preserving order requires shifting every existing element one slot right.

For size $n$, that moves $n$ elements before writing the new first value.

Use a deque or another representation when front insertion is frequent.

### Does amortized $O(1)$ append mean every append is fast?

No.

Most appends write into reserved capacity in constant time.

An append that triggers growth may allocate and relocate all current elements, taking $\Theta(n)$ time.

Amortization averages that work over a sequence.

### What is the difference between size and capacity?

Size counts logical constructed elements.

Capacity counts how many elements fit in the current allocation before another allocation is required.

Access is legal only below size, not merely below capacity.

### Why can append invalidate a pointer to an element?

Growth may move the entire array to a new allocation.

The old address then no longer identifies the preserved logical element.

Consult the container's invalidation rules even when no growth appears likely.

### Is a two-dimensional array really contiguous?

It depends on representation.

A flat allocation with row-major or column-major indexing is contiguous.

An array of separately allocated row arrays is not one contiguous matrix, even if each row is contiguous.

### What is a stride?

A stride is the number of elements or bytes the address changes when one coordinate increases by one.

In a packed row-major $R\times C$ matrix, column stride is one element and row stride is $C$ elements.

### Why does loop order affect performance?

The contiguous dimension reuses bytes already fetched in cache lines and suits sequential prefetching.

A large-stride traversal may fetch many lines while using little data from each.

Both loop orders can have the same Big-O complexity.

### Can a transpose be constant time?

A transpose **view** can swap shape and strides in $O(1)$ without moving elements.

A packed transposed **copy** must visit and write every element, taking $\Theta(RC)$ time and storage.

The view may be noncontiguous for downstream consumers.

### Why check dimensions before multiplication?

The product can overflow the integer type and wrap to a smaller value.

Allocating that smaller size and then indexing under the original dimensions can cause out-of-bounds access.

Compare one factor with `maximum / other` before multiplying.

### When is a linked list better than an array?

When operations already hold stable node positions and frequently splice elements without requiring positional random access or dense locality.

Even then, allocation and cache costs matter.

Choose from the complete workload rather than one operation's asymptotic bound.

### What is the difference between a slice and a copy?

A copy owns separate elements and remains valid independently.

A slice view refers to an owner's storage through an offset, length, and possibly stride.

Mutations, lifetime, and reallocation behavior depend on the API's aliasing contract.

### How should array performance be measured?

Measure the real element representation, working-set size, traversal order, allocation behavior, and compiler/runtime configuration.

Report cache-sensitive results separately from asymptotic analysis.

Avoid conclusions from tiny arrays that never leave the fastest cache level.
