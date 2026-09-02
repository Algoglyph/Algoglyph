# Time Complexity Analysis: Cost Models, Summations & Tight Runtime Bounds

![Runtime growth curves and operation counts](/images/dsa/time-complexity-analysis-dark.png)

## 1. Historical Context & Motivation

Wall-clock time changes with processors, compilers, inputs, caches, and system load.
Algorithm analysis needs a more stable way to predict how work grows.
Time complexity counts abstract operations as functions of input parameters.
It does not replace measurement.
It explains scaling before a specific machine is chosen and guides what measurements should reveal.
An algorithm taking one microsecond for ten records may still be unusable for ten million records.
Another with higher setup cost may scale far better.
Asymptotic notation separates growth from machine-dependent constants.
Big-O gives an eventual upper bound.
Big-Omega gives an eventual lower bound.
Big-Theta gives matching upper and lower growth.
These symbols are frequently misused as labels rather than mathematical claims.
Saying an algorithm is `O(n^2)` does not mean it always performs exactly $n^2$ operations.
It may be linear and still satisfy that loose upper bound.
The useful goal is the tightest justified bound under a stated case and model.
Worst-case analysis protects against adversarial or unlucky input.
Average-case analysis requires a probability distribution.
Expected analysis may average the algorithm's own randomness for each fixed input.
Amortized analysis bounds a sequence without probability.
Best-case analysis is rarely a capacity guarantee but can reveal adaptivity.
Input size itself needs definition.
For graphs, vertices and edges are separate parameters.
For numeric algorithms, bit length can matter more than numeric magnitude.
For output-sensitive algorithms, result count is a parameter.
For matrix work, rows, columns, and inner dimension should remain visible.
Collapsing everything into $n$ can conceal the actual constraint.
Time analysis begins with a cost model.
The word-RAM model treats fixed-word arithmetic and indexed memory access as constant time.
Comparison models count ordering comparisons.
Bit complexity charges operations according to operand length.
External-memory models count block transfers.
Parallel models track work and span.
No model is universally correct.
The model should match the bottleneck relevant to the claim.
This article develops loop sums, recursion trees, substitution, Master-theorem use, amortized reasoning, and empirical validation.

## 2. Core Mathematical Invariants

Let $T(n)$ denote the operation count or bounded cost for inputs of size $n$.
Big-O means there exist constants $c>0$ and $n_0$ such that

$$
0\le T(n)\le c g(n)\quad\text{for all }n\ge n_0.
$$

Big-Omega reverses the bound with a positive constant.
Big-Theta requires both.
Constants and lower-order terms vanish only after the inequality is proven.
For `3n^2 + 7n + 20`, the dominant term gives $\Theta(n^2)$.
For two independent input sizes, `3nm + 2n` is $\Theta(nm+n)$.
It cannot always be simplified to $\Theta(nm)$ if $m$ may be zero or bounded independently.
A sequential composition adds costs.
If one phase is $T_1$ and another is $T_2$, total is $T_1+T_2$.
For nonnegative functions, a dominant term may simplify the sum.
A conditional takes the maximum branch for worst-case analysis plus condition cost.
Average-case branch cost requires branch probabilities.
A loop cost is the sum of body costs over its executed iterations.
A loop from zero to $n-1$ with constant body cost is $\Theta(n)$.
A triangular nested loop with inner range zero through $i-1$ costs

$$
\sum_{i=0}^{n-1}i=\frac{n(n-1)}{2}=\Theta(n^2).
$$

Nested loops do not automatically multiply to $n^2$.
If an inner pointer advances only forward across all outer iterations, aggregate work may be linear.
This is the two-pointer amortization invariant.
A loop doubling `i` until it reaches $n$ executes $\Theta(\log n)$ times.
A loop dividing a positive quantity by two has the same bound.
The logarithm base changes only a constant factor.
A loop doing $n/i$ work for each $i$ can yield a harmonic sum.

$$
\sum_{i=1}^{n}\frac{n}{i}=nH_n=\Theta(n\log n).
$$

Recursive algorithms produce recurrences.
Binary search satisfies $T(n)=T(n/2)+\Theta(1)$ and solves to $\Theta(\log n)$.
Merge sort satisfies $T(n)=2T(n/2)+\Theta(n)$ and solves to $\Theta(n\log n)$.
A naïve Fibonacci recurrence $T(n)=T(n-1)+T(n-2)+\Theta(1)$ grows exponentially.
The Master theorem applies to recurrences of form

$$
T(n)=aT(n/b)+f(n)
$$

under its regularity assumptions.
It does not directly solve unequal subproblem sizes, changing $a$, or arbitrary dependencies.
Recursion trees or substitution handle broader cases.
The recursion-tree invariant assigns nonrecursive work to every node and sums levels.
For merge sort, each level processes total size $n$.
There are $\Theta(\log n)$ levels.
The sum is $\Theta(n\log n)$.
For quicksort, partition costs linear work.
Balanced partitions create logarithmic depth and $\Theta(n\log n)$ total.
Repeated one-versus-rest partitions create linear depth and $\Theta(n^2)$ total.
Expected random-pivot analysis averages over pivot choices, not over an unspecified “random input.”
Amortized analysis assigns sequence cost.
A dynamic array append occasionally copies all current elements.
With geometric capacity growth, total copies across $n$ appends form a geometric series and remain $O(n)$.
Thus append is $O(1)$ amortized.
One resize is still $O(n)$ actual time.
Aggregate, accounting, and potential methods are equivalent proof techniques for suitable problems.
Output complexity imposes a lower bound.
If an algorithm must emit $k$ items, it needs $\Omega(k)$ time merely to write them.
Comparison sorting has an $\Omega(n\log n)$ worst-case lower bound because a decision tree needs at least $n!$ leaves.
Noncomparison sorts escape that model by exploiting key structure and paying for range or digits.
Hash-table lookup is expected $O(1)$ under hashing assumptions, not deterministic worst-case constant time in a basic chained table.
Every complexity statement should attach its assumptions.

## 3. Step-by-Step Execution Trace

Analyze this conceptual loop:

```text
left = 0
for right from 0 to n - 1:
    add item[right]
    while window is invalid:
        remove item[left]
        left += 1
```

The outer loop executes exactly $n$ iterations.
The inner loop appears nested and might suggest quadratic time.
Track `left` across the entire execution.
It begins at zero.
It never decreases.
It can advance at most $n$ times.
Every inner iteration advances it once.
Therefore all inner iterations across all outer iterations total at most $n$.
If add, remove, and validity checks are constant time, total work is $O(n)$.
A lower bound of $\Omega(n)$ holds because every item is read.
The tight bound is $\Theta(n)$.
Now analyze merge sort on eight elements.
Level zero has one problem of size eight and merge work eight.
Level one has two problems of size four and total merge work eight.
Level two has four problems of size two and total merge work eight.
Base cases contain eight size-one problems with constant work.
There are three splitting levels because $\log_2 8=3$.
Total merge work is about $8\cdot3=24$ plus base overhead.
For general $n$, each of $\Theta(\log n)$ levels costs $\Theta(n)$.
The result is $\Theta(n\log n)$.
Now analyze a geometric loop.
Start `value = 1` and repeatedly multiply by two while `value < n`.
After $k$ iterations, value is $2^k$.
The loop stops at the smallest $k$ with $2^k\ge n$.
Therefore $k=\lceil\log_2 n\rceil$.
The loop is $\Theta(\log n)$.
Now analyze dynamic-array appends from empty capacity one.
Appending the first element performs no copy beyond placement.
Growing from one to two copies one element.
Growing from two to four copies two.
Growing from four to eight copies four.
Before capacity reaches at least $n$, total resize copies are less than $1+2+4+\cdots<n$.
The geometric sum is less than $2n$.
Add $n$ ordinary placements.
Total work across $n$ appends is $O(n)$.
Average sequence cost is $O(1)$ amortized per append.
Now expose a misleading benchmark.
Algorithm A performs $1000n$ operations.
Algorithm B performs $n^2$ operations.
At $n=10$, A's abstract count is 10,000 while B's is 100.
B can be faster for small inputs.
At $n=10,000$, A is ten million while B is one hundred million.
The crossover depends on constants.
Asymptotics predict eventual growth, not the smallest-input winner.
Finally analyze graph BFS.
Each vertex enters the queue at most once under a visited invariant.
Each adjacency entry is examined once when its source is removed.
For adjacency lists, time is $\Theta(V+E)$.
Calling it simply $O(n)$ would hide graph density.

## 4. Production-Ready Implementations

This utility counts representative operations instead of timing them, making growth visible without clock noise.

```python
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Counts:
    outer_steps: int
    inner_steps: int

    @property
    def total(self) -> int:
        return self.outer_steps + self.inner_steps


def monotone_window_counts(values: list[int], limit: int) -> Counts:
    if limit < 0:
        raise ValueError("limit must be non-negative")
    left = 0
    current_sum = 0
    outer_steps = 0
    inner_steps = 0

    for value in values:
        if value < 0:
            raise ValueError("non-negative values are required")
        outer_steps += 1
        current_sum += value
        while current_sum > limit and left < len(values):
            current_sum -= values[left]
            left += 1
            inner_steps += 1

    return Counts(outer_steps, inner_steps)


def triangular_counts(n: int) -> int:
    if n < 0:
        raise ValueError("n must be non-negative")
    operations = 0
    for outer in range(n):
        for _ in range(outer):
            operations += 1
    return operations


def geometric_counts(n: int) -> int:
    if n <= 0:
        return 0
    value = 1
    operations = 0
    while value < n:
        value *= 2
        operations += 1
    return operations


def demo() -> None:
    counts = monotone_window_counts([2, 1, 3, 1, 2], 4)
    assert counts.outer_steps == 5
    assert counts.inner_steps <= 5
    assert triangular_counts(5) == 10
    assert geometric_counts(1) == 0
    assert geometric_counts(8) == 3
    assert geometric_counts(9) == 4


if __name__ == "__main__":
    demo()
```

Operation counters test an analytical claim directly.
They should not remain in hot production code unless observability justifies the overhead.
Select operations relevant to the cost model.
Counting loop iterations while ignoring expensive hash or comparison work can mislead.
For comparison algorithms, wrap comparators to count calls.
For data movement, count element assignments or bytes copied.
For external algorithms, count block reads and writes.
For parallel algorithms, record total work and critical-path span.
Benchmark after deriving the expected shape.
Use multiple input sizes spanning meaningful orders of magnitude.
Warm JIT compilers, caches, and reusable workers when measuring steady state.
Separate setup from query cost when preprocessing is reusable.
Use representative and adversarial distributions.
Report medians and tail percentiles when system noise matters.
Plot log-scaled input and time carefully.
A straight line on a log-log plot suggests a power law, but finite ranges can deceive.
Normalize candidate curves, such as time divided by $n$, $n\log n$, or $n^2$.
Stable normalized values support the corresponding hypothesis.
Do not infer a theorem from benchmarking.
Measurements validate implementation behavior over tested ranges.
The proof establishes growth under stated assumptions.
Include allocation, parsing, and serialization in end-to-end latency when users pay for them.
Exclude them only when the claim explicitly concerns an internal kernel.
Compiler optimization can remove benchmark work whose result is unused.
Consume outputs and inspect generated code when necessary.
Random data generation must not dominate the measured region.
Prepare inputs outside the timing boundary.
Use fixed seeds for reproducibility while testing multiple distributions.
Guard against integer overflow in operation counters.

## 5. Asymptotic Time & Space Complexity

Analyzing a straight-line block takes time proportional to the number of statements in the source model, not runtime input.
Loop analysis requires deriving iteration domains and body costs.
For independent rectangular loops of sizes $n$ and $m$, cost is $\Theta(nm)$.
For triangular loops, summation gives $\Theta(n^2)$.
For multiplicative progress, inversion through logarithms gives $\Theta(\log n)$.
For harmonic work, integral bounds show $H_n=\Theta(\log n)$.
Recurrence analysis can use expansion, recursion trees, substitution, Akra-Bazzi, or specialized theorems.
The Master theorem is a convenience, not the definition of recursive complexity.
Memoization changes the unit from recursion-tree calls to distinct states plus transitions.
If a problem has $S$ states and each examines $D$ decisions, time is often $O(SD)$.
That requires each state to be computed once.
Without memoization, overlapping recursion can be exponential.
Graph algorithms should use $V$ and $E$.
Adjacency-matrix traversal may cost $\Theta(V^2)$ even for sparse graphs.
Adjacency-list traversal costs $\Theta(V+E)$.
Dense graphs have $E=\Theta(V^2)$, making the bounds coincide asymptotically.
String algorithms should use text length $n$, pattern length $m$, alphabet parameters where relevant, and output count $z$.
Numeric algorithms may use bit length $b=\lfloor\log_2 x\rfloor+1$.
Treating multiplication of arbitrary-size integers as $O(1)$ can hide significant work.
Sorting lower bounds apply only within the comparison model.
Counting and radix sort spend time on key structure.
Expected hash operations rely on distribution and collision assumptions.
Randomized quicksort gives expected $O(n\log n)$ for every fixed input when randomness chooses pivots appropriately.
Amortized bounds are deterministic sequence totals unless randomness is separately introduced.
Worst-case $O(1)$ and amortized $O(1)$ are not interchangeable latency promises.
Tight complexity does not specify constants.
Two $\Theta(n)$ algorithms can differ by orders of magnitude.
Memory hierarchy can make a higher-operation contiguous algorithm faster than pointer chasing.
External-memory analysis may better predict large-data performance.
Parallel time is at least both work divided by processors and critical-path span.
If work is $W$ and span is $D$, idealized time on $P$ processors is bounded below by $\max(W/P,D)$.
Synchronization and communication add real costs.
Complexity analysis selects the correct dimensions; measurement supplies constants and system effects.

## 6. Systems Connections

Service capacity planning multiplies per-request work by arrival rate and concurrency.
An asymptotic regression may remain invisible in small tests but dominate production growth.
Database query planners estimate cardinalities and choose join algorithms with different complexity and I/O behavior.
A nested-loop join, hash join, and sort-merge join trade preprocessing, memory, and ordering.
Incorrect cardinality estimates can select the wrong regime.
Storage systems count block transfers because disk and network access dominate arithmetic.
B-trees reduce I/O depth through high branching factors.
Cache-oblivious analysis studies transfer efficiency without fixing one block size.
Distributed systems distinguish local work, messages, bytes transferred, and synchronization rounds.
Calling a distributed operation $O(n)$ without naming communication is incomplete.
GPU algorithms consider total work, parallel depth, occupancy, and memory coalescing.
Branch divergence can dominate a low abstract operation count.
Cryptographic code sometimes requires data-independent timing.
Worst-case complexity alone does not guarantee constant-time behavior with respect to secrets.
Control flow and memory access must avoid secret-dependent variation.
Rate limiting and algorithmic complexity defenses protect public parsers, regex engines, hash maps, and compression handlers from crafted worst cases.
A linear-time algorithm can still be abused with enormous input, so absolute limits remain necessary.
Compilers choose representations and specialize loops using static size and alias information.
Profile-guided optimization changes constants while preserving language semantics.
Observability pipelines need bounded per-event work.
An accidental scan through accumulated history turns constant ingestion into growing latency.
Incremental algorithms preserve summaries to avoid that regression.
Frontend applications experience complexity through frame budgets.
An $O(n^2)$ layout pass may stutter only after documents become large.
Virtualization and indexing reduce processed elements per interaction.
Complexity is therefore not academic decoration.
It is a compact prediction of where a system will bend as its workload grows.

## 7. Practice Checklist

- Define every independent input-size parameter.
- State the computational cost model.
- Name worst, average, expected, amortized, or best case explicitly.
- Use Big-O for upper bounds, not exact equality.
- Prefer tight Big-Theta when both bounds are justified.
- Keep lower-order terms until dominance is established.
- Add costs of sequential phases.
- Take maximum branch cost for worst-case conditionals.
- Sum loop work over actual iteration domains.
- Do not multiply nested loops automatically.
- Track monotone pointers across the whole execution.
- Solve multiplicative progress with logarithms.
- Recognize triangular and harmonic sums.
- Write recurrences for recursive algorithms.
- Verify Master-theorem preconditions before applying it.
- Use recursion trees or substitution when the theorem does not fit.
- Distinguish recursion-tree size from active recursion depth.
- Count distinct memoized states and transitions.
- Include output size as a lower bound.
- Keep $V$ and $E$ separate for graphs.
- Keep text, pattern, alphabet, and output sizes separate for strings.
- Use bit complexity for unbounded numeric operands.
- State randomness source in expected analysis.
- State the input distribution in average-case analysis.
- Keep amortized guarantees distinct from per-operation worst case.
- Identify model-specific lower bounds.
- Include preprocessing and reuse assumptions.
- Include parsing and serialization in user-facing latency claims.
- Build operation counters for analytical validation.
- Benchmark multiple scales and distributions.
- Prepare inputs outside timing regions.
- Warm runtimes for steady-state claims.
- Report system variance with appropriate statistics.
- Prevent dead-code elimination in microbenchmarks.
- Compare normalized growth curves.
- Do not claim proof from finite measurements.
- Investigate deviations between model and measurement.
- Account for cache, I/O, communication, and synchronization where relevant.
- Attach resource limits even to asymptotically efficient public operations.
- Connect the final bound to a supported production scale.

## 8. Frequently Asked Questions

### What does Big-O actually mean?

It is an eventual upper bound up to a constant factor.
It does not mean exact running time or necessarily the tightest bound.

### Why ignore constants?

Asymptotic notation isolates growth across large scales and machines.
Constants still matter for real crossover points and must be measured.

### Are nested loops always quadratic?

No.
Their bounds depend on iteration ranges and whether inner work is shared or monotone across outer iterations.

### What is the difference between expected and average-case time?

Expected time may average the algorithm's randomness for a fixed input.
Average-case time averages over an explicitly defined input distribution.

### What is amortized complexity?

It bounds total cost across an operation sequence and assigns an average budget per operation without requiring probability.

### Why is dynamic-array append amortized $O(1)$?

Geometric growth makes all resize copies across $n$ appends sum to $O(n)$, even though one resize is linear.

### When can the Master theorem be used?

Use it for recurrences matching its divide-and-conquer form and regularity conditions.
It is not a universal recurrence solver.

### Why use multiple variables for graph complexity?

Graphs with the same vertex count can have edge counts from zero to quadratic.
The representation and algorithm often depend on both.

### Can benchmarks determine Big-O?

They can support or contradict a hypothesis over tested ranges, but they cannot replace a proof under stated assumptions.

### Is a lower asymptotic class always faster?

Not for every practical input.
Constants, preprocessing, locality, and system overhead determine crossover behavior.

### Why count output size?

Producing $k$ distinct results requires at least $\Omega(k)$ time, regardless of how quickly candidates are found.

### What makes a good final complexity statement?

It gives a tight bound where possible, names all parameters and cases, states model assumptions, and separates preprocessing, query, and output costs.
