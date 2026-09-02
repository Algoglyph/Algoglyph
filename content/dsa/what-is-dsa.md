# Data Structures: Representation, Operations & Algorithmic Contracts

![Data structures organizing values for different operations](/images/dsa/what-is-dsa-dark.jpg)

## 1. Historical Context & Motivation

Programs do more than store values.
They must find, update, order, group, traverse, and discard those values.
The chosen representation determines how much work each operation requires.
A **data structure** is a representation plus rules that keep it meaningful.
An **algorithm** is a finite procedure operating under a stated contract.
The two are inseparable in real software.
Binary search needs random access and sorted order.
Dijkstra's algorithm benefits from a priority queue.
Breadth-first search needs a FIFO frontier.
Depth-first search needs a stack, explicit or recursive.
Early computers made memory layout impossible to ignore.
Arrays provided direct addressing through contiguous storage.
Linked structures traded locality for flexible insertion.
Trees organized ordered decisions hierarchically.
Hash tables used computed locations for expected constant-time lookup.
Graphs modeled relationships not confined to a hierarchy.
Abstract data types later separated behavior from representation.
A stack promises last-in, first-out behavior.
It may be implemented with an array or linked nodes.
That separation lets callers depend on operations rather than layout.
Complexity analysis makes representation choices comparable.
Correctness invariants make them trustworthy.
Neither asymptotic notation nor benchmark numbers are sufficient alone.
Asymptotics describe growth under a cost model.
Benchmarks expose constants, locality, allocation, and workload effects.
The right structure depends on the actual operation mix.
There is no universally fastest container.
A sorted vector can outperform a tree for read-heavy small data.
A hash table can lose ordering and worst-case guarantees.
A graph adjacency matrix can be excellent for dense graphs and wasteful for sparse ones.
DSA study builds the habit of connecting requirements to representations.
The goal is not memorizing names.
The goal is proving what a representation guarantees and where it fails.

## 2. Core Mathematical Invariants

Every useful data structure has an abstract state.
Its concrete memory representation encodes that state.
A representation invariant identifies which concrete states are valid.
For a sorted array, values satisfy $a_i\le a_{i+1}$.
For a min-heap, every parent key is no greater than its child keys.
For a BST, left keys precede the node and right keys follow it under the comparator.
For a queue, removal order matches insertion order among retained elements.
For union–find, each parent chain ends at a representative root.
An operation has preconditions and postconditions.
`push(x)` requires available memory and ends with `x` at the stack top.
`pop()` requires a nonempty stack or defines an empty-case result.
Correctness means every valid operation preserves the invariant.
An algorithm also maintains a loop or recursion invariant.
Binary search keeps every possible target position inside its active interval.
BFS keeps vertices in nondecreasing unweighted distance order.
Merge keeps its output prefix equal to the smallest consumed inputs in order.
Complexity attaches a cost to primitive operations.
Let $n$ describe input size.
Worst-case time bounds the maximum work over inputs of size $n$.
Amortized time distributes occasional expensive operations across a sequence.
Expected time averages over randomness or a stated distribution.
These terms are not interchangeable.
Space includes stored data, metadata, and temporary working memory.
Auxiliary space excludes the input and usually excludes required output.
Mutability changes which invariants callers may rely on.
Aliasing permits outside code to change shared objects unexpectedly.
Immutability simplifies reasoning but may allocate new paths or copies.
Ordering requires a comparator that behaves consistently.
Equality and hashing must agree for hashed containers.
If equal keys can hash differently, lookup may fail.
If a comparator is not transitive, ordered trees can become incoherent.
Capacity is distinct from logical size.
Dynamic arrays maintain $0\le size\le capacity$.
Resizing preserves element order while changing storage.
Graph representations must define directedness and edge multiplicity.
Indexing conventions must state whether positions are zero-based or one-based.
Ownership rules must state who may retain references.
The best design exposes a small contract and hides repair details.

## 3. Step-by-Step Execution Trace

Consider a service that processes jobs in arrival order.
The initial requirement is `submit`, `process-next`, and `pending-count`.
Jobs must not overtake earlier jobs.
That semantic contract is FIFO.
A stack is rejected because it reverses arrival order.
A sorted set is rejected because priority is not part of the requirement.
A plain array with front deletion appears simple.
Start with empty storage `[]`.
Submit job `A` and obtain `[A]`.
Submit job `B` and obtain `[A,B]`.
Submit job `C` and obtain `[A,B,C]`.
Process-next returns `A`.
Deleting array index zero shifts `B` and `C` left.
One removal costs linear time in the pending count.
Repeated processing can therefore become quadratic.
Choose a deque or circular buffer instead.
Represent a bounded circular queue with array capacity four.
Track `head`, `size`, and derive tail as `(head + size) mod capacity`.
Initially `head=0`, `size=0`.
Submit `A` at index zero.
State is `[A,_,_,_]`, `head=0`, `size=1`.
Submit `B` at index one.
State is `[A,B,_,_]`, `head=0`, `size=2`.
Submit `C` at index two.
State is `[A,B,C,_]`, `head=0`, `size=3`.
Process-next reads index zero and returns `A`.
Clear index zero.
Advance head to one.
State is `[_,B,C,_]`, `head=1`, `size=2`.
Submit `D` at index three.
State is `[_,B,C,D]`, `head=1`, `size=3`.
Process `B` and advance head to two.
Submit `E` at `(2+2) mod 4 = 0`.
State is `[E,_,C,D]`, `head=2`, `size=3`.
Physical order now wraps around.
Logical order remains `C,D,E`.
The invariant maps logical offset $i$ to `(head+i) mod capacity`.
No removal shifts retained jobs.
Submission and processing each take constant time.
The structure matches the required semantics and operation mix.
If priorities are later introduced, this queue is no longer sufficient.
A changed contract may require a heap plus sequence-number tie breaking.
That is the central DSA workflow: requirements, invariant, representation, proof, measurement.

## 4. Production-Ready Implementations

This bounded circular queue makes the representation contract explicit.
It rejects overflow rather than silently overwriting pending jobs.

```python
from __future__ import annotations

from collections.abc import Iterator
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


class BoundedQueue(Generic[T]):
    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._items: list[Optional[T]] = [None] * capacity
        self._head = 0
        self._size = 0

    def __len__(self) -> int:
        return self._size

    @property
    def capacity(self) -> int:
        return len(self._items)

    def put(self, item: T) -> None:
        if self._size == self.capacity:
            raise OverflowError("queue is full")
        tail = (self._head + self._size) % self.capacity
        self._items[tail] = item
        self._size += 1

    def get(self) -> T:
        if self._size == 0:
            raise IndexError("queue is empty")
        item = self._items[self._head]
        self._items[self._head] = None
        self._head = (self._head + 1) % self.capacity
        self._size -= 1
        assert item is not None
        return item

    def peek(self) -> T:
        if self._size == 0:
            raise IndexError("queue is empty")
        item = self._items[self._head]
        assert item is not None
        return item

    def __iter__(self) -> Iterator[T]:
        for offset in range(self._size):
            item = self._items[(self._head + offset) % self.capacity]
            assert item is not None
            yield item


queue = BoundedQueue[str](4)
for job in ["A", "B", "C"]:
    queue.put(job)
assert queue.get() == "A"
queue.put("D")
assert queue.get() == "B"
queue.put("E")
assert list(queue) == ["C", "D", "E"]
assert queue.peek() == "C"
assert len(queue) == 3
```

Production selection starts with an operation table.
List operation frequency, latency target, ordering, concurrency, and durability needs.
Choose the simplest structure satisfying those constraints.
Use standard-library containers unless a specialized representation is justified.
Document empty, duplicate, overflow, and missing-key behavior.
Treat comparator and hash functions as part of the contract.
Cap adversarial inputs when operation cost can explode.
Concurrency needs synchronization around multi-step invariant changes.
Persistence needs versioning and corruption checks.
Serialization should not expose private pointer layout as a permanent format.
Instrumentation should measure size distribution and operation latency.
Property-based tests can compare behavior with a simpler reference model.
Fault injection is valuable for persistent and concurrent structures.
Microbenchmarks must resemble actual key sizes and access patterns.
The implementation above is educational and correct for one process.
It is not a durable distributed job queue.
Durability would require logging, acknowledgements, and recovery semantics.

## 5. Asymptotic Time & Space Complexity

Complexity is a function of both algorithm and representation.
Array indexing is $O(1)$ under random-access memory assumptions.
Searching an unsorted array is $O(n)$ worst case.
Searching a sorted array is $O(\log n)$ with binary search.
Inserting into its middle remains $O(n)$ because elements shift.
A linked-list insertion is $O(1)$ once the position node is known.
Finding that position may still cost $O(n)$.
A balanced search tree supports ordered lookup and update in $O(\log n)$.
A hash table usually offers expected $O(1)$ lookup.
Its worst case can be $O(n)$ without stronger collision guarantees.
A binary heap exposes minimum or maximum in $O(1)$.
Heap insertion and removal cost $O(\log n)$.
It does not support arbitrary ordered search efficiently.
Adjacency-list graph traversal costs $O(V+E)$.
An adjacency matrix scan costs $O(V^2)$.
The matrix provides $O(1)$ edge-existence queries.
The list uses $O(V+E)$ space for a sparse graph.
The matrix uses $O(V^2)$ space regardless of edge count.
The circular queue trace uses $O(c)$ allocated space for capacity $c$.
Its `put`, `get`, and `peek` operations are $O(1)$ worst case.
Iteration is $O(n)$ for $n$ queued elements.
Dynamic resizing would make insertion amortized $O(1)$ rather than worst-case $O(1)$.
Memory hierarchy changes real cost.
Contiguous arrays exploit cache lines and prefetching.
Pointer structures may incur allocation and cache misses.
Large constants can dominate small workloads.
Use asymptotic analysis to rule out bad scaling.
Use measurement to choose among asymptotically acceptable designs.

## 6. Systems Connections

Data-layout decisions become interface commitments when bytes are persisted.
Changing an on-disk structure requires migration or versioned readers.
Distributed ownership adds routing metadata to familiar maps and trees.
Backpressure turns queue capacity into a system-level correctness decision.
Approximate structures trade exact answers for bounded memory or bandwidth.
Bloom filters and sketches must state their error behavior.
The invariant-first method still applies to probabilistic representations.
Database indexes are data structures governed by storage-page costs.
B+ trees trade comparisons for fewer page reads.
Operating systems maintain queues for scheduling and I/O.
Network stacks use ring buffers for bounded packet flow.
Compilers represent syntax as trees and control flow as graphs.
Garbage collectors traverse object graphs under reachability invariants.
Filesystems index paths, blocks, and free extents.
Search engines combine inverted indexes, heaps, and compression.
Caches combine hash lookup with recency or frequency structures.
Distributed systems add ownership and failure to ordinary container semantics.
A distributed queue must define delivery and acknowledgement behavior.
A distributed map must define consistency and conflict resolution.
Cryptographic software needs constant-time access patterns in sensitive paths.
Adversarial keys can turn weak hashing into denial of service.
Realtime systems care about worst-case bounds more than average throughput.
Embedded systems may reject dynamic allocation entirely.
Persistent structures make historical versions cheap through structural sharing.
Concurrent structures must specify linearization points.
Lock-free does not mean wait-free.
Memory reclamation can be harder than the data-structure operation itself.
APIs should expose semantics rather than internal nodes.
That allows representation changes without breaking callers.
Metrics reveal when workload assumptions stop being true.
For example, rising queue occupancy may invalidate a fixed capacity.
Data migration is often a change of representation under a preserved abstract contract.
DSA reasoning gives that migration a proof target.

## 7. Practice Checklist

- Write the required operations before choosing a structure.
- Estimate how frequently each operation occurs.
- State ordering requirements.
- State duplicate-key behavior.
- State empty and missing-value behavior.
- State mutability and ownership rules.
- Define the representation invariant.
- Define each operation's precondition.
- Define each operation's postcondition.
- Prove updates preserve the invariant.
- Identify the input-size variables.
- Separate worst-case, expected, and amortized bounds.
- Count auxiliary space separately from required output.
- Include preprocessing in the total cost.
- Consider cache locality.
- Consider allocation overhead.
- Consider adversarial inputs.
- Consider concurrency requirements.
- Consider persistence and recovery.
- Prefer a standard-library implementation when it fits.
- Test empty and singleton states.
- Test capacity boundaries.
- Test duplicates.
- Test invalid comparators or hashes where possible.
- Compare optimized behavior with a simple reference model.
- Use randomized operation sequences.
- Benchmark representative workloads.
- Revisit the choice when requirements change.
- Explain rejected alternatives.
- Keep the public abstraction smaller than the representation.

## 8. Frequently Asked Questions

### What is the difference between a data structure and an abstract data type?

An abstract data type specifies behavior.
A data structure is a concrete representation that implements that behavior.

### Is an algorithm part of a data structure?

Operations such as insertion and lookup are algorithms over the representation.
Studying them together exposes the real guarantees.

### Which data structure is fastest?

None is fastest for every workload.
The answer depends on required operations, input size, hardware, and guarantees.

### Why learn implementations when libraries already exist?

Implementation knowledge lets you choose correctly, diagnose misuse, and understand costs.
It does not imply rewriting tested libraries without cause.

### Does $O(1)$ mean instant?

No.
It means the modeled operation count does not grow with input size.

### Is expected constant time a guarantee?

No.
It depends on hashing assumptions, randomness, or input distribution.

### Why do invariants matter?

They describe what must remain true for operations and complexity claims to hold.
They are the bridge between code and proof.

### Are arrays always better for cache locality?

Contiguous arrays usually have an advantage during sequential access.
Other requirements may still justify trees, hashes, or linked structures.

### When should I optimize a representation?

After identifying a measured bottleneck or a proven scaling problem.
Keep the abstract contract stable while changing internals.

### What should a beginner learn first?

Start with arrays, stacks, queues, hash tables, trees, heaps, and graphs.
For each, learn its invariant, operations, costs, and failure cases.

### Is DSA only for coding interviews?

No.
Indexes, schedulers, parsers, caches, and storage engines depend on the same reasoning.

### How do I know my choice is correct?

Show that it satisfies semantics, prove acceptable bounds, and measure it under a representative workload.
Those three forms of evidence complement one another.
