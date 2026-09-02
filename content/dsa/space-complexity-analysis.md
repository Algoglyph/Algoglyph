# Space Complexity Analysis: Peak Memory, Lifetime & Practical Bounds

![Memory-lifetime view of auxiliary space](/images/dsa/space-complexity-analysis-dark.png)

## 1. Historical Context & Motivation

Early algorithm analysis emphasized running time because arithmetic was expensive and main memory was tiny.
Memory nevertheless determined whether a program could run at all.
An algorithm needing one megabyte could be impossible on a machine containing only kilobytes.
Modern machines have more memory, but data sets have grown even faster.
Memory pressure now appears as allocation latency, cache misses, paging, garbage-collection pauses, and out-of-memory failures.
Space analysis asks how much storage is simultaneously live during an execution.
The word **simultaneously** matters: allocations made at different times need not contribute to the same peak.
A program may allocate a gigabyte in total while reusing a ten-megabyte buffer throughout its lifetime.
Conversely, two individually modest structures can produce a large peak if their lifetimes overlap.
Space complexity turns these operational facts into a growth function of input parameters.
It lets engineers compare algorithms independently of a particular machine size.
It also exposes hidden costs that asymptotic running-time analysis can miss.
Recursive call frames are storage.
Hash-table slack is storage.
Buffered input and deferred output are storage.
Copies caused by immutable APIs are storage.
Metadata, pointers, alignment, and allocator headers are storage even when a textbook drawing omits them.
The primary analytical distinction is between **total space** and **auxiliary space**.
Total space includes the representation of the input and output when they reside in memory.
Auxiliary space counts additional working memory used by the algorithm.
For an in-place sort, auxiliary space may be constant even though the array itself occupies linear total space.
For a transformation returning a second array, the output is usually excluded from auxiliary space only when the interface requires it.
That convention must be stated, not assumed.
Space analysis is especially important for embedded software, mobile applications, browser tabs, databases, and distributed workers.
These environments enforce hard budgets or suffer severe degradation before physical memory is exhausted.
A service can meet its latency target in isolation yet collapse when many requests multiply its per-request working set.
Choosing an $O(n)$ algorithm over an $O(1)$-auxiliary alternative can therefore reduce safe concurrency by a factor proportional to $n$.
The reverse trade-off also occurs: extra indexing memory can save enough computation or I/O to be worthwhile.
The goal is not always to minimize bytes.
The goal is to understand the memory-time trade-off accurately enough to choose deliberately.
A useful analysis separates mathematical growth, implementation constants, allocation schedule, and machine-level effects.
Asymptotic notation answers how memory scales.
Concrete accounting estimates whether a particular workload fits.
Lifetime analysis explains when the peak occurs.
Systems profiling confirms whether the implementation matches the model.
All four views are complementary.

## 2. Core Mathematical Invariants

Let $M(t,n)$ denote the number of live memory units at execution time $t$ for input size $n$.
The peak space function is $S(n)=\max_t M(t,n)$.
This maximum, rather than the sum of every allocation, is the central invariant of space analysis.
An object contributes to $M(t,n)$ only while it is reachable or otherwise reserved at time $t$.
If an allocation is freed before another allocation occurs, their sizes do not add at the peak.
If their lifetimes overlap, they do add.
The memory unit may be bits, bytes, words, records, nodes, or abstract cells.
Asymptotic analysis usually chooses a unit whose size is independent of $n$.
When integer values grow with $n$, word size must be modeled explicitly.
Under the word-RAM model, one word commonly stores an index into the input and therefore has $\Theta(\log n)$ bits.
Counting words can hide this logarithmic bit cost.
For ordinary fixed-width machine integers, counting words is often the useful engineering abstraction.
For arbitrary-precision arithmetic, operand bit length becomes an additional input parameter.
Total space can be decomposed as input, output, code, and auxiliary storage.
If $I(n)$ is resident input, $O(n)$ is resident output, and $A(n)$ is working storage, then peak total space is not automatically $I(n)+O(n)+A(n)$.
The correct sum depends on which lifetimes overlap.
When input remains live until output completion, the peak may indeed include all three.
When output is streamed and input chunks are released, the peak can be much smaller.
Auxiliary-space claims therefore require an execution model.
An algorithm is commonly called **in place** when it uses $O(1)$ or sometimes $O(\log n)$ auxiliary words while mutating its input.
The term has multiple conventions, so a careful article states which convention it uses.
Recursion contributes one frame per active call.
If each frame consumes $f(n)$ words and maximum recursion depth is $d(n)$, stack space is usually $O(f(n)d(n))$.
For constant-size frames, this becomes $O(d(n))$.
A recursive binary search has depth $O(\log n)$ and therefore $O(\log n)$ call-stack space.
Its iterative counterpart uses $O(1)$ auxiliary space.
A naïve depth-first traversal of a path-shaped tree reaches depth $n$.
Its stack use is $O(n)$ even though balanced instances use $O(\log n)$.
Worst-case structure, not average visual shape, controls the worst-case bound.
For divide-and-conquer algorithms, sibling recursive calls are normally sequential.
Their memory does not multiply merely because the recursion tree has many nodes.
The peak follows one active root-to-leaf chain plus any buffers retained by ancestors.
If a recurrence allocates a fresh $\Theta(n)$ buffer before two sequential half-size calls, its peak satisfies $S(n)=\Theta(n)+S(n/2)$.
That recurrence solves to $\Theta(n)$, not $\Theta(n\log n)$.
The total amount allocated across the whole run may be $\Theta(n\log n)$, but peak live space remains linear.
This distinction is one of the most common corrections in space analysis.
Breadth-first search stores its frontier and visited state.
On a graph, visited storage is $O(V)$ and the queue can hold $O(V)$ vertices.
On an implicit tree where visited states are unnecessary, frontier width may dominate depth.
Depth-first search instead stores a path and pending iterators, often $O(V)$ worst case but $O(h)$ on a tree of height $h$.
Container capacity differs from logical size.
A dynamic array containing $n$ elements may reserve $c\ge n$ slots.
Geometric growth keeps $c=O(n)$ while providing amortized insertion efficiency.
During reallocation, the old and new buffers may coexist temporarily.
If capacity doubles from $c$ to $2c$, the transient peak can approach $3c$ element slots before the old buffer is released.
The asymptotic bound remains $O(n)$ but the peak constant matters operationally.
Hash tables similarly reserve empty buckets to maintain a load-factor invariant.
A table with load factor at most $\alpha$ needs at least $n/\alpha$ buckets.
Incremental rehashing can smooth latency but may keep old and new tables live together.
Aliasing changes whether an operation copies data.
A slice may be a constant-size view into an existing buffer or a newly allocated linear-size copy.
The programming language and API semantics decide which model is correct.
Immutable updates may share persistent structure, copy a shallow path, or clone an entire collection.
Persistent trees often update $O(\log n)$ nodes while sharing untouched subtrees.
Garbage collection delays reclamation beyond the last semantic use.
Asymptotic analysis usually assumes prompt deallocation of unreachable objects.
Real peak resident memory may be higher because the runtime retains arenas or waits for a collection cycle.
That difference is a constant-factor or policy effect only when retained capacity stays proportional to live data.
Memory leaks violate the intended lifetime model and can make space grow with execution duration rather than input size.
Output-sensitive algorithms use a separate output parameter $k$.
Their total space may be $O(n+k)$ while auxiliary space is $O(n)$ or less.
Suppressing $k$ can make a bound misleading when output size dominates input size.
Streaming algorithms deliberately replace a whole-history representation with a compact state summary.
Their invariant says the summary contains exactly the information necessary for future decisions.
When that summary has size independent of stream length, auxiliary space is $O(1)$ with respect to processed items.
Approximate streaming structures trade exactness for sublinear memory.
Their space may depend on error probability and tolerance, such as $O(\varepsilon^{-2}\log(1/\delta))$.
Multiple input dimensions must remain separate when they affect memory differently.
A matrix algorithm might use $O(r+c)$ auxiliary space rather than collapsing everything into an ambiguous $O(n)$.
A graph algorithm should state $O(V+E)$ when both vertex and edge representations are resident.
The governing rule is simple: identify live structures, express each size in named parameters, account for overlapping lifetimes, and take the maximum.

## 3. Step-by-Step Execution Trace

Consider top-down merge sort on the eight-element array `[8, 3, 6, 2, 7, 1, 5, 4]`.
Assume each merge allocates one temporary buffer for its current subarray.
Assume the buffer is allocated only after both recursive children have returned.
The input array occupies eight element slots but is excluded from auxiliary-space accounting.
At the initial call, the active stack contains one frame for range `[0, 8)`.
No merge buffer exists yet.
The left recursive call for `[0, 4)` adds a second constant-size frame.
The call for `[0, 2)` adds a third frame.
The call for `[0, 1)` adds a fourth frame and immediately returns.
At this deepest point, four frames are live and no element buffer is live.
The sibling `[1, 2)` reuses the same recursion depth after the first leaf frame disappears.
The algorithm then merges `[0, 1)` and `[1, 2)`.
It allocates a two-element temporary buffer.
The live state is three active frames plus two buffer slots.
After copying the merged result back, the two-slot buffer is released.
The `[0, 2)` frame returns.
The same process sorts `[2, 4)` with a separate two-slot buffer.
The earlier two-slot buffer is no longer live, so the two buffers do not add.
To merge the sorted halves of `[0, 4)`, the algorithm allocates a four-slot buffer.
At that moment, the active stack has two frames and the auxiliary buffer has four slots.
The peak so far is approximately four element slots plus constant frame metadata.
After the left half is complete, its four-slot buffer is released.
The right half `[4, 8)` follows the same schedule.
Its buffers do not overlap with the left half's buffers.
Finally, the root merge allocates an eight-slot buffer.
Only the root frame remains active.
The auxiliary peak is therefore eight element slots plus $O(\log n)$ constant-size frames.
Because $n$ dominates $\log n$, peak auxiliary space is $O(n)$.
Now change the implementation so each call allocates its buffer before recursing.
The root allocates eight slots and keeps them live.
Its left child allocates four more slots.
The grandchild allocates two more slots.
The deepest nontrivial child allocates one more slot if the base case is defined that way.
Along one path, the live buffer sizes sum to $8+4+2+1=15$.
For general $n$ that geometric sum is less than $2n$.
The bound remains $O(n)$, but the peak constant nearly doubles.
Now imagine both recursive children execute concurrently.
Their buffers and stacks may overlap.
The peak recurrence changes because sibling branches can be live simultaneously.
Parallel execution can improve elapsed time while increasing memory demand.
The scheduling policy is therefore part of the space model.
A second trace illustrates why total allocation is not peak space.
Suppose a loop processes one million records in chunks of one thousand.
Each iteration allocates a thousand-record buffer, processes it, then releases it.
The total number of record slots allocated over the run is one million.
The maximum simultaneously live buffer contains only one thousand records.
Auxiliary peak space is $O(1000)$, effectively $O(1)$ with respect to the million-record input when chunk size is fixed.
If processed chunks are appended to an in-memory result list, however, output storage grows to one million records.
If the result is streamed to disk, resident output can stay bounded.
The API contract determines which trace describes the real program.
A third trace examines recursive versus iterative binary search on $n=16$ elements.
The recursive call searches a range of length 16.
Its child searches at most 8.
The next child searches at most 4.
Then 2, then 1.
At most five frames are simultaneously live.
The depth is $\lfloor\log_2 16\rfloor+1=5$.
For arbitrary $n$, recursive auxiliary space is $O(\log n)$.
The iterative version stores only `low`, `high`, and `mid`.
Those variables occupy a constant number of words regardless of $n$.
Its auxiliary space is $O(1)$.
Both versions perform the same asymptotic number of comparisons.
This is a genuine space improvement caused by eliminating retained call frames.

## 4. Production-Ready Implementations

The following utility models peak live storage for a schedule of allocate and release events.
It is not a language-runtime profiler.
It is a precise teaching tool for checking a manual lifetime analysis.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Literal


Action = Literal["allocate", "release"]


@dataclass(frozen=True)
class MemoryEvent:
    action: Action
    amount: int
    label: str

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("amount must be non-negative")


@dataclass(frozen=True)
class PeakReport:
    peak: int
    peak_after_event: int
    final_live: int


def peak_live_units(events: Iterable[MemoryEvent]) -> PeakReport:
    live = 0
    peak = 0
    peak_after = -1

    for index, event in enumerate(events):
        if event.action == "allocate":
            live += event.amount
        elif event.action == "release":
            live -= event.amount
            if live < 0:
                raise ValueError(
                    f"event {index} ({event.label}) releases more than is live"
                )
        else:
            raise ValueError(f"unsupported action: {event.action}")

        if live > peak:
            peak = live
            peak_after = index

    return PeakReport(peak=peak, peak_after_event=peak_after, final_live=live)


def demo() -> None:
    schedule = [
        MemoryEvent("allocate", 8, "root merge buffer"),
        MemoryEvent("allocate", 4, "left-child buffer"),
        MemoryEvent("allocate", 2, "left grandchild buffer"),
        MemoryEvent("release", 2, "left grandchild complete"),
        MemoryEvent("release", 4, "left child complete"),
        MemoryEvent("allocate", 4, "right-child buffer"),
        MemoryEvent("release", 4, "right child complete"),
        MemoryEvent("release", 8, "root complete"),
    ]
    report = peak_live_units(schedule)
    assert report.peak == 14
    assert report.final_live == 0
    print(report)


if __name__ == "__main__":
    demo()
```

Production analysis begins with a memory ownership table rather than with a guessed Big-O label.
For each substantial object, record its size formula, owner, allocation point, last use, and release mechanism.
Include input views, decoded representations, temporary buffers, indexes, queues, caches, and outputs.
Mark whether each object is borrowed, shared, copied, or uniquely owned.
Draw lifetime intervals on a common execution timeline.
Sum sizes only where intervals overlap.
Identify the time at which that sum is largest.
Then simplify the peak expression asymptotically.
Keep the unsimplified expression for capacity planning.
For example, $8n+24V+16E$ bytes conveys more operational information than merely $O(n+V+E)$.
Treat language object overhead carefully.
A Python integer is not a four-byte C integer.
A JavaScript array may store boxed values or specialized packed elements depending on runtime state.
A C++ `vector<T>` owns capacity, not just logical length.
Use runtime-specific measurement when constants decide feasibility.
Measure resident set size only with awareness that allocators retain freed pages.
Heap profiler snapshots are better for finding live-object ownership.
Allocation profilers reveal churn even when peak live memory is modest.
Stack profilers or compiler reports help estimate per-frame costs in native code.
For managed runtimes, force-free measurements can distort normal collection behavior.
Observe representative steady-state workloads instead.
Include warm-up, cache population, and concurrent requests.
Test adversarial structures that maximize recursion depth or frontier width.
Set explicit memory budgets in integration tests when the platform supports them.
Fail predictably before the operating system begins destructive swapping.
Prefer streaming interfaces when consumers do not require materialized results.
Prefer iterators over intermediate lists when a single pass is sufficient.
Avoid retaining a tiny view that keeps a huge backing buffer reachable.
Release large references before long unrelated phases when the language permits it.
Reuse scratch buffers only when ownership and concurrency remain clear.
Pooling can reduce allocation churn but may raise the retained-memory floor.
Bound pools and caches by policy.
Do not call an algorithm in place if hidden library calls clone the input.
Document whether output storage is included in reported bounds.
Document expected and worst-case recursion depth.
Document whether parallel branches can overlap.
Document the representation assumptions behind every count.

## 5. Asymptotic Time & Space Complexity

Space analysis itself often follows the structure of the algorithm's control flow.
For a simple loop, enumerate persistent state and the largest per-iteration temporary.
If the loop releases each temporary before the next iteration, the peak is their maximum, not their sum.
For nested loops, iteration count affects time but not necessarily space.
Two nested loops using three scalar indices still require $O(1)$ auxiliary space.
If each iteration appends to a collection, retained output or history changes the bound.
For recursion, derive maximum active depth and per-frame storage.
The recurrence $S(n)=S(n-1)+O(1)$ yields $O(n)$ stack space.
The recurrence $S(n)=S(n/2)+O(1)$ yields $O(\log n)$ stack space.
When sequential child calls share no retained buffers, take the maximum child space rather than adding children.
When parent state remains live, add that retained state to the maximum child.
For concurrent child calls, add spaces of branches that can execute simultaneously.
For memoization, the memo table usually dominates the call stack.
A dynamic program with $n$ states and constant-sized values uses $O(n)$ table space.
Rolling-array optimization can reduce this to the number of dependency layers.
If each state depends only on the previous row of width $m$, two rows use $O(m)$ space.
In-place row updates may use one row when dependency direction permits it.
Correct traversal order is then part of the memory invariant.
Graph representations must distinguish vertices and edges.
An adjacency list uses $O(V+E)$ storage.
An adjacency matrix uses $O(V^2)$ storage.
For dense graphs where $E=\Theta(V^2)$, the asymptotic totals match even though constants and access patterns differ.
For sparse graphs, the list saves substantial space.
Comparison sorting can be done with $O(1)$ auxiliary words by heap sort or carefully implemented selection-based methods.
Merge sort usually uses $O(n)$ auxiliary storage for arrays.
Quicksort partitions in place but uses recursion stack space.
Balanced partitions give $O(\log n)$ depth; adversarial partitions give $O(n)$ without safeguards.
Tail-recursion elimination or processing the smaller side first can cap explicit stack depth at $O(\log n)$.
Space and time may depend on value range rather than element count.
Counting sort uses $O(n+k)$ total workspace when the key range contains $k$ values.
If $k$ is far larger than $n$, this can be unacceptable despite linear-looking notation.
External-memory algorithms add block buffers and indexes while intentionally keeping the main data on disk.
Their RAM space may be bounded even though total storage is large.
Communication buffers count toward resident memory at each participating process.
Distributed aggregate memory and per-worker peak answer different capacity questions.
Big-O suppresses constants, lower-order terms, and transient allocator behavior.
Big-Theta is appropriate when both upper and lower growth bounds are established.
Big-O alone is an upper bound and should not be presented as an exact usage formula.
An algorithm using $3n+100$ words is $O(n)$ and $\Theta(n)$.
An algorithm using at most $n^2$ words may still actually be $\Theta(n)$ if the bound is loose.
State the tightest justified bound.
Auxiliary-space improvements can change time complexity.
Recomputing values instead of storing them trades memory for computation.
Compressed representations trade CPU work for fewer bytes.
Externalization trades RAM for I/O.
The correct choice follows workload constraints rather than an isolated asymptotic ranking.

## 6. Systems Connections

Operating systems expose the difference between virtual address space and resident physical memory.
Reserving an address range need not commit all pages immediately.
Touching pages converts theoretical capacity into physical demand.
Copy-on-write can make a process fork appear cheap until either process modifies shared pages.
Memory-mapped files blur the line between input storage and page cache.
The asymptotic model still describes reachable data, while the OS decides placement and eviction.
CPU caches make compact representations faster as well as smaller.
Reducing a working set enough to fit in cache can dominate arithmetic-level optimizations.
Pointer-heavy structures pay for node headers and poor spatial locality.
Flat arrays often use fewer bytes and fewer cache lines.
Database query planners estimate operator memory for joins, sorts, and aggregation.
A hash join may build a table proportional to one input.
If it exceeds the memory grant, it spills partitions to disk.
An external merge sort keeps bounded runs and merge buffers in RAM.
Its algorithm is chosen specifically around a space budget.
Web services multiply request-local memory by concurrency.
A 50 MB temporary per request is manageable for one request but dangerous for hundreds.
Backpressure limits the number of simultaneously live work units.
Streaming parsers avoid retaining an entire payload when incremental semantics suffice.
Browsers may terminate tabs that exceed memory limits.
Canvas, image, and document applications must account for undo history as retained state.
Persistent snapshots can use structural sharing to avoid full duplication.
Security controls also consume memory deliberately.
Sandbox processes, validation copies, and bounded transcript buffers create isolation at a measurable cost.
The correct optimization preserves the protection while removing accidental duplicate retention.
Cryptographic code must sometimes retain fixed-size secrets and erase them promptly.
Copies made by immutable strings or logging can extend sensitive-data lifetime.
Space analysis therefore intersects with confidentiality, not only capacity.
Garbage-collected services tune heap targets to balance collection frequency against resident size.
A larger heap may improve throughput but lengthen some pauses and reduce host density.
Region or arena allocation makes lifetime explicit: release a whole phase at once.
It is effective when objects share a natural lifetime.
It is dangerous when long-lived references escape the region.
GPU workloads have distinct host and device memory budgets.
Moving tensors between them can create transient duplicate copies.
Training uses model parameters, activations, gradients, optimizer state, and communication buffers.
Peak memory often occurs at a particular forward or backward phase, so lifetime scheduling enables checkpointing.
Checkpointing stores fewer activations and recomputes them later, exchanging time for space.
Embedded systems may prohibit dynamic allocation after startup.
Worst-case static memory and maximum stack depth must then be proven or conservatively bounded.
Real-time systems care about both peak size and allocation predictability.
Container limits turn memory excess into termination rather than host-wide swapping.
Observability should distinguish requested memory, working set, heap live size, heap capacity, and allocation rate.
Each metric answers a different question.
An accurate asymptotic model guides which measurements should grow with workload.
Measurements then reveal constants and runtime effects absent from the model.

## 7. Practice Checklist

- Name every independent input-size parameter.
- State whether the analysis counts words, bytes, bits, records, or nodes.
- Separate resident input, required output, and auxiliary working storage.
- State explicitly whether output space is excluded from the auxiliary bound.
- List each substantial data structure created by the algorithm.
- Include recursion frames and explicit stacks.
- Include container capacity rather than only logical length when estimating bytes.
- Include hash-table slack and rehash overlap.
- Include transient copies made by APIs or immutable operations.
- Mark allocation and last-use points for every large object.
- Draw overlapping lifetimes before adding sizes.
- Take the maximum live sum rather than total allocated bytes.
- Analyze worst-case recursion depth on adversarial structure shapes.
- Distinguish sequential recursive branches from concurrent branches.
- Write and solve a space recurrence when parent buffers remain live.
- Check whether a slice is a view or a copy in the chosen language.
- Check whether views retain unexpectedly large backing stores.
- Treat arbitrary-precision numeric width as an input parameter when relevant.
- Distinguish stack, heap, device, and external storage budgets.
- State whether caches are bounded and whether they persist across requests.
- Account for memoization tables and visited sets.
- Include queue frontier width for breadth-first algorithms.
- Include output size $k$ for output-sensitive problems.
- Compare total space with auxiliary space.
- Give a tight bound rather than a merely valid loose upper bound.
- Preserve the unsimplified byte estimate for deployment planning.
- Test empty, singleton, deeply skewed, dense, and maximal-output cases.
- Profile representative warm workloads, not only startup.
- Measure concurrent peak, not just one isolated operation.
- Inspect allocation rate separately from live memory.
- Verify that released objects actually become unreachable.
- Confirm that pools and allocators do not retain unbounded capacity.
- Use memory limits in stress tests where practical.
- Document time-space trade-offs introduced by compression or recomputation.
- Prefer streaming only when consumers can accept incremental output.
- Verify that an in-place claim survives library calls and wrappers.
- Revisit the model when parallelizing previously sequential work.
- Explain both asymptotic growth and important constants.
- Connect the final bound to the actual production budget.
- Treat discrepancies between model and profile as evidence to investigate.

## 8. Frequently Asked Questions

### Is the input array counted in space complexity?

It depends on the stated convention.
Total space includes resident input, while auxiliary space normally excludes storage supplied as input.
Always name the convention so readers do not compare unlike quantities.

### Is recursion always $O(n)$ space?

No.
Recursion space is governed by maximum active depth times per-frame size.
Binary search uses $O(\log n)$ frames, while traversal of a skewed $n$-node tree can use $O(n)$.

### Why does merge sort use $O(n)$ space rather than $O(n\log n)$?

Its temporary buffers from different recursion-tree nodes are not all live simultaneously.
The peak live buffer volume is linear even though total allocation work across levels can be larger.

### Does an iterative algorithm always use less space than a recursive one?

No.
Iteration can eliminate call frames, but it may need an explicit stack containing the same logical state.
Some recursions also have constant or logarithmic depth.

### Does $O(1)$ space mean zero allocation?

No.
It means auxiliary storage is bounded independently of input size.
The implementation may allocate a fixed number of objects or a fixed-size buffer.

### Are output elements counted as auxiliary space?

Usually not when producing the output is required by the interface, but that convention must be declared.
Total resident space still includes the output, and output-sensitive analysis should expose its size $k$.

### Can garbage collection change the asymptotic bound?

A well-behaved collector usually changes constants and reclamation timing rather than the intended live-object bound.
Unbounded retention, leaks, or a growing runtime cache can change effective growth and must be analyzed separately.

### Why is total allocated memory different from peak memory?

Released storage can be reused.
Complexity measures the maximum simultaneously required storage, while allocation counters sum repeated use over time.

### Is a dynamic array with unused capacity still $O(n)$ space?

Yes when capacity grows geometrically and remains within a constant factor of logical size.
The unused slots affect constants and transient reallocation peaks.

### How should parallel algorithms be analyzed?

Add memory of tasks whose lifetimes can overlap under the scheduler.
Parallel execution may turn sequentially reused buffers into simultaneous buffers and raise the peak.

### What is the best way to verify a manual space analysis?

Create an ownership-and-lifetime model, derive the peak symbolically, then profile live allocations under representative and adversarial workloads.
Neither asymptotics nor profiling alone provides the complete answer.

### Can more memory make an algorithm faster?

Yes.
Memoization, indexing, buffering, and caching spend memory to avoid recomputation or I/O.
Space complexity makes that trade-off explicit rather than declaring one side universally superior.
