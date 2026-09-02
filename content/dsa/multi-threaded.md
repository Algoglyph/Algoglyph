# Multithreaded Algorithms: Shared-State Discipline, Parallel Work & Correctness

![Multithreaded execution lanes](/images/dsa/multi-threaded-dark.jpg#dark)

## 1. Historical Context & Motivation

A thread is an independently scheduled execution path inside a process.

Threads commonly share code, heap objects, and operating-system resources.

Each thread still has its own call stack, registers, and instruction pointer.

Shared memory makes communication cheap because data need not be copied.

The same sharing makes correctness harder because operations may interleave.

Early computers gained throughput mainly by increasing clock frequency.

Power and thermal limits made that strategy increasingly expensive.

Modern processors therefore expose several cores and hardware threads.

Algorithms must reveal independent work to use those execution resources.

Concurrency and parallelism are related but not identical.

Concurrency means several tasks can make progress over overlapping periods.

Parallelism means several tasks execute at the same physical instant.

A single-core scheduler can provide concurrency without true parallelism.

A multicore machine can provide both.

Multithreading is useful for two broad workloads.

CPU-bound workloads divide computation across cores.

I/O-bound workloads overlap waiting for disks, sockets, or services.

The best design depends on which resource is limiting throughput.

Adding threads does not automatically accelerate an algorithm.

Coordination, cache traffic, scheduling, and serial work impose overhead.

Some runtimes also restrict simultaneous execution of language-level code.

For example, implementation details can limit CPU parallelism in Python threads.

Native extensions or process-based parallelism may behave differently.

A correct sequential algorithm can become incorrect after naive partitioning.

The source is usually an unstated ordering or ownership assumption.

Two increments that look independent may both read the same old value.

One write can then overwrite the other.

This is a lost-update data race.

Other failures include stale reads, torn invariants, deadlock, and starvation.

A multithreaded algorithm therefore needs two proofs.

It needs the ordinary functional proof for its mathematical result.

It also needs a synchronization proof for every shared transition.

The goal is not merely “use many threads.”

The goal is to expose useful parallel work while preserving a precise order.

## 2. Core Mathematical Invariants

### Program order and happens-before

Within one thread, operations have a program order.

Across threads, wall-clock intuition is not a correctness rule.

A **happens-before** relation establishes which effects must be visible.

Program order contributes happens-before edges within a thread.

Synchronization operations contribute edges between threads.

For a mutex, an unlock happens before a later successful lock of that mutex.

For a joined thread, its completed actions happen before the join returns.

If conflicting accesses are unordered and at least one is a write, a race exists.

Language memory models define the exact consequences of such races.

In C and C++, a data race on non-atomic memory is undefined behavior.

Correct code must not depend on a favorable scheduler or observed test order.

### Mutual exclusion invariant

A mutex protects a stated set of data and relationships.

The central invariant is:

$$
\text{at most one thread executes the protected critical section at a time}
$$

The lock is meaningful only when every relevant access follows the protocol.

Protecting writes but leaving racing reads outside is not sufficient.

The critical section should restore the shared invariant before unlocking.

For a bank transfer, a suitable invariant may be conservation of total balance.

For a queue, it may be consistency among head, tail, size, and storage.

The lock does not define the invariant; the data structure does.

### Atomicity and linearization

An operation is **linearizable** when it appears to take effect at one instant.

That instant lies between invocation and response.

The chosen instant is called the linearization point.

For a locked counter increment, it can be the write while holding the mutex.

For an atomic compare-and-swap loop, it is the successful atomic instruction.

Linearizability simplifies reasoning because operations admit a legal serial order.

It does not guarantee fairness or freedom from starvation.

### Work partition invariant

Suppose indices `[0,n)` are partitioned among `p` workers.

A correct static partition satisfies coverage:

$$
\bigcup_{t=0}^{p-1} R_t=[0,n)
$$

and disjointness:

$$
i\ne j \Longrightarrow R_i\cap R_j=\varnothing.
$$

Coverage prevents omitted work.

Disjointness prevents duplicate writes when each index has one owner.

For contiguous chunks, worker `t` can receive:

$$
L_t=\left\lfloor\frac{tn}{p}\right\rfloor,
\qquad
R_t=\left\lfloor\frac{(t+1)n}{p}\right\rfloor.
$$

These half-open ranges cover every index exactly once.

### Reduction invariant

Parallel reductions compute partial summaries and combine them.

The combine operation should be associative:

$$
(a\circ b)\circ c=a\circ(b\circ c).
$$

An identity element `e` should satisfy $e\circ a=a\circ e=a$.

Integer sum, minimum, maximum, and set union fit this pattern.

Floating-point addition is not exactly associative because of rounding.

Parallel regrouping may therefore change low-order bits.

Reproducible systems must specify a stable reduction tree or compensated method.

### Queue invariant

A producer-consumer queue separates task creation from task execution.

Every accepted task must be processed exactly once or explicitly cancelled.

No worker may observe a partially initialized task.

Shutdown must distinguish “temporarily empty” from “no more work.”

A sentinel, closed flag, or cancellation token can encode that distinction.

Condition-variable waits must test a predicate in a loop.

Spurious wakeups and competing consumers can invalidate a one-time test.

### Liveness properties

Safety says something bad never happens.

Liveness says something good eventually happens.

Deadlock violates liveness because threads wait in a cycle.

Starvation violates liveness when one thread is indefinitely denied progress.

Livelock occurs when threads keep acting but never complete useful work.

A global lock order prevents a common class of deadlocks.

If locks have ranks, threads must acquire them in increasing rank order.

This prevents a directed cycle in the wait-for graph.

### Performance bound

Let fraction `s` of execution remain serial.

Amdahl's law gives the idealized speedup on `p` processors:

$$
S(p)=\frac{1}{s+\frac{1-s}{p}}.
$$

As $p\to\infty$, speedup is bounded by $1/s$.

Real systems add thread startup, synchronization, and memory costs.

Therefore Amdahl's value is an optimistic upper bound for a fixed workload.

## 3. Step-by-Step Execution Trace

Consider summing the array `[4, 1, 7, 3, 6, 2, 5, 8]` with four workers.

The objective is the exact total `36`.

The array has `n = 8` elements and `p = 4` workers.

Static partitioning assigns two elements to each worker.

Worker 0 owns `[0,2)` and reads `[4,1]`.

Worker 1 owns `[2,4)` and reads `[7,3]`.

Worker 2 owns `[4,6)` and reads `[6,2]`.

Worker 3 owns `[6,8)` and reads `[5,8]`.

The ranges are disjoint.

Their union is `[0,8)`.

Worker 0 computes local sum `5`.

Worker 1 computes local sum `10`.

Worker 2 computes local sum `8`.

Worker 3 computes local sum `13`.

Each worker writes only its own partial slot.

No mutex is required for those four writes because ownership is exclusive.

The main thread joins all workers before reading the slots.

The joins create the necessary visibility order.

The reduction begins with `[5,10,8,13]`.

At the first tree level, compute `5 + 10 = 15`.

In parallel, compute `8 + 13 = 21`.

At the second level, compute `15 + 21 = 36`.

The final result is `36`.

Coverage proves that no input element was omitted.

Disjoint ownership proves that no element was counted twice.

Associativity of integer addition validates the reduction grouping.

Join ordering proves that every partial is visible before combination.

Now contrast this design with a shared counter.

Suppose two workers both execute `total = total + value` without synchronization.

Assume `total` initially equals `0`.

Worker A reads `0` and plans to add `4`.

Worker B reads `0` and plans to add `7`.

Worker A writes `4`.

Worker B writes `7`.

The observed total is `7`, not `11`.

The compound statement contained a read, computation, and write.

Those steps were not one atomic operation.

A mutex could serialize the updates and produce `11`.

An atomic fetch-add could also provide a single linearization point.

Per-worker partials avoid contention entirely during the main computation.

That is why ownership is often preferable to frequent synchronization.

### Deadlock trace

Consider mutexes `A` and `B`.

Thread 1 locks `A`.

Thread 2 locks `B`.

Thread 1 attempts to lock `B` and waits.

Thread 2 attempts to lock `A` and waits.

Neither can reach its unlock instruction.

The wait-for graph contains a cycle.

A rank rule `A < B` forbids Thread 2's acquisition order.

Both threads must acquire `A` before `B`.

That removes this cycle while preserving mutual exclusion.

## 4. Production-Ready Implementations

The following C++ implementation performs a deterministic parallel integer sum.

Each thread owns one output slot, so the hot loop needs no shared lock.

```cpp
#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <thread>
#include <vector>

std::int64_t parallel_sum(const std::vector<std::int64_t>& values,
                          std::size_t requested_threads) {
    if (values.empty()) {
        return 0;
    }
    if (requested_threads == 0) {
        throw std::invalid_argument("thread count must be positive");
    }

    const std::size_t p = std::min(requested_threads, values.size());
    std::vector<std::int64_t> partial(p, 0);
    std::vector<std::thread> workers;
    workers.reserve(p);

    for (std::size_t t = 0; t < p; ++t) {
        const std::size_t left = (t * values.size()) / p;
        const std::size_t right = ((t + 1) * values.size()) / p;

        workers.emplace_back([&, t, left, right] {
            std::int64_t local = 0;
            for (std::size_t i = left; i < right; ++i) {
                local += values[i];
            }
            partial[t] = local;
        });
    }

    for (std::thread& worker : workers) {
        worker.join();
    }

    std::int64_t total = 0;
    for (std::int64_t value : partial) {
        total += value;
    }
    return total;
}

int main() {
    const std::vector<std::int64_t> values{4, 1, 7, 3, 6, 2, 5, 8};
    std::cout << parallel_sum(values, 4) << '\n';
}
```

The vector sizes are fixed before threads start.

No worker changes vector capacity or invalidates references.

Every worker writes to a distinct `partial[t]` object.

The main thread reads partials only after every `join` returns.

Integer overflow remains a domain concern despite the wider accumulator.

For untrusted sizes or values, use checked arithmetic.

Thread construction can dominate small inputs.

A long-lived thread pool is preferable for repeated short tasks.

### Bounded worker queue pattern

A production pool needs a synchronized queue, shutdown semantics, and backpressure.

The queue's lock should protect both storage and its closed state.

Producers wait or reject work when capacity is exhausted.

Consumers wait while the queue is empty and still open.

Closing wakes every waiter.

Workers exit only when the queue is both closed and empty.

Exceptions from tasks must be captured rather than escaping a thread entry point.

Futures or result channels can carry success and failure to the submitter.

Cancellation must define what happens to queued and currently running work.

### Atomics are not universal replacements

An atomic counter is suitable for an independent scalar statistic.

It is not enough for a compound invariant spanning several fields.

Updating `balance` and `transaction_count` separately can expose an invalid pair.

A mutex or transactional design may be needed for the pair.

Memory-order choices below sequential consistency require specialist reasoning.

Use the strongest simple order unless measurement justifies added complexity.

### False sharing

Distinct partial slots can occupy the same cache line.

Frequent writes may then bounce that line between cores.

Padding or cache-line alignment can separate hot per-thread counters.

Apply that optimization only after profiling on the target machine.

It increases memory usage and depends on hardware details.

### Testing strategy

Run deterministic functional tests across thread counts `1`, `2`, and above `n`.

Test empty input, one element, negative values, and overflow boundaries.

Use thread sanitizers where the toolchain supports them.

Stress tests should randomize scheduling and repeat operations many times.

A passing stress test is evidence, not a proof of race freedom.

Review synchronization invariants independently of observed outcomes.

## 5. Asymptotic Time & Space Complexity

Let `n` be the number of input elements and `p` the active worker count.

Static partition construction takes $O(p)$ time.

Each worker processes about $n/p$ elements.

Under ideal parallel execution, the scan span is $O(n/p)$.

Joining `p` threads and combining partials takes $O(p)$ in this implementation.

The ideal parallel time is therefore:

$$
T_p(n)=O\left(\frac{n}{p}+p\right).
$$

Total computational work remains $O(n)$.

The partial array and worker handles require $O(p)$ auxiliary space.

Each thread also consumes implementation-defined stack and runtime state.

Creating new threads costs substantially more than a normal function call.

With a pool, startup cost is amortized across many tasks.

If a mutex protects every addition, the critical path can approach $O(n)$.

Contention may eliminate the expected parallel speedup.

Tree reduction can combine `p` partials in $O(\log p)$ span.

It still performs $O(p)$ total additions.

The sequential combine shown above has $O(p)$ span.

For typical `p` much smaller than `n`, the scan dominates.

Load imbalance changes the scan term to the largest assigned workload.

If worker costs are $W_0,\ldots,W_{p-1}$, completion waits for:

$$
\max_t W_t.
$$

Dynamic scheduling can improve balance for irregular tasks.

It adds queue synchronization and can reduce locality.

Memory bandwidth can become the limiting resource before all cores are busy.

At that point, more threads increase contention without increasing throughput.

The asymptotic model does not capture cache misses or NUMA placement.

Production tuning must measure wall time, throughput, and tail latency.

## 6. Systems Connections

Web servers use worker threads to overlap independent requests.

Database engines parallelize scans, joins, aggregation, and background maintenance.

Operating systems schedule kernel and user threads across available cores.

GUI applications keep long work away from the event thread.

Compilers parallelize independent translation units and analysis passes.

Build systems model prerequisites as a dependency graph.

Ready nodes can run concurrently when their inputs are complete.

MapReduce separates parallel mapping from an associative reduction.

Scientific software partitions grids, particles, or matrix blocks.

Game engines use job systems for animation, physics, and asset processing.

Network stacks distribute packet processing while preserving flow ordering.

Logging systems often use producer-consumer queues to keep callers responsive.

Garbage collectors may use concurrent marking and parallel evacuation.

Lock-free structures use atomic primitives and carefully defined memory order.

They can improve progress properties but are difficult to design and reclaim safely.

Read-copy-update favors cheap readers and deferred reclamation.

Actor systems reduce shared-state access by communicating through messages.

Actors still run on threads underneath and can face mailbox backpressure.

Structured concurrency ties child task lifetime to a lexical parent scope.

This makes cancellation, error propagation, and cleanup easier to reason about.

NUMA machines make memory location part of the performance model.

A thread may access remote memory at higher latency than local memory.

Pinning and first-touch allocation can matter for large scientific workloads.

Thread-local storage avoids sharing but complicates aggregation and lifecycle.

Deterministic parallelism restricts interactions to make reruns reproducible.

Security-sensitive code must also consider shared-resource side channels.

Timing and cache behavior can reveal information across protection boundaries.

Multithreading is thus an algorithmic, runtime, and systems-design concern.

## 7. Practice Checklist

- State whether the workload is CPU-bound, I/O-bound, or mixed.
- Measure the sequential baseline before adding threads.
- Identify the serial fraction and expected upper-bound speedup.
- Define ownership for every mutable object.
- Prefer disjoint writes over a contended shared accumulator.
- Name the invariant protected by each mutex.
- Ensure every access follows the same synchronization protocol.
- Establish a clear happens-before edge before reading worker output.
- Keep critical sections small but invariant-complete.
- Avoid calling unknown or blocking code while holding a lock.
- Use a consistent global order when acquiring multiple locks.
- Recheck condition-variable predicates after every wakeup.
- Define queue capacity and overload behavior.
- Define normal shutdown, cancellation, and failure propagation.
- Do not detach threads whose resource lifetime is unclear.
- Join or otherwise account for every started thread.
- Check that partition ranges cover all work exactly once.
- Handle a requested thread count of zero.
- Cap worker count relative to work and machine resources.
- Consider thread-pool reuse for repeated tasks.
- Verify whether the language runtime permits CPU parallelism.
- Document nondeterminism and reproducibility requirements.
- Treat floating-point reduction order as observable behavior.
- Use atomics only for invariants they can actually express.
- Prefer simple memory ordering until profiling proves a need.
- Test with one worker to preserve a useful debugging mode.
- Test with more workers than tasks.
- Test empty, tiny, skewed, and adversarial workloads.
- Run race-detection tooling where available.
- Stress shutdown while producers and consumers are active.
- Profile contention, cache misses, and scheduling overhead.
- Watch tail latency rather than only average throughput.
- Reassess memory bandwidth and NUMA effects at higher core counts.
- Keep correctness independent of sleep durations and scheduler luck.
- Write down the linearization point for concurrent operations.

## 8. Frequently Asked Questions

### Are more threads always faster?

No.

Serial work, startup, synchronization, cache traffic, and bandwidth impose limits.

Small tasks can become slower because overhead exceeds useful parallel work.

### What is the difference between a process and a thread?

Processes normally have separate address spaces and stronger isolation.

Threads share a process address space and communicate through shared memory.

The exact resource model is operating-system dependent.

### Does a mutex make an entire object thread-safe?

Only if every operation that can violate the object's invariant uses it correctly.

Thread safety is a protocol, not a property conferred by owning a mutex field.

### When should I use atomics?

Use them for small, precisely defined state transitions such as counters or flags.

Compound invariants often need a lock, transaction, or different ownership model.

### What is a data race?

It is an unordered pair of conflicting memory accesses from different threads.

At least one access is a write, and synchronization does not order them.

### Why wait on a condition variable in a loop?

Wakeups can be spurious, or another consumer can take the available work first.

The protected predicate—not the notification alone—decides whether to proceed.

### What is false sharing?

Independent variables on one cache line can cause coherence traffic between cores.

The program shares a cache line even though it does not logically share fields.

### Is lock-free always better than lock-based?

No.

Lock-free algorithms can reduce blocking but increase complexity and retry traffic.

Correct memory reclamation is especially difficult.

### Why can parallel floating-point sums differ?

Floating-point addition rounds after each operation and is not exactly associative.

Changing the reduction tree changes the sequence of rounding decisions.

### What is the safest first parallel design?

Partition immutable input, give workers disjoint output, then combine after joining.

This minimizes shared mutable state and makes the proof explicit.
