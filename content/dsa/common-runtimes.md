# Common Runtime Classes: Growth Rates, Feasibility Estimates & Algorithm Selection

![Common asymptotic runtime curves](/images/dsa/common-runtimes-dark.png#dark)

## 1. Historical Context & Motivation

Runtime classes describe how work grows as an input becomes larger.

They are not stopwatch readings.

They ignore constant factors only after the underlying cost model is stated.

They are still among the most useful tools for rejecting an algorithm before it reaches production.

An operation that is fast for one thousand elements may be impossible for one billion.

Growth class explains that change better than a benchmark from one laptop.

The common classes are constant, logarithmic, linear, linearithmic, quadratic, polynomial, exponential, and factorial.

Each class arises from a characteristic algorithmic structure.

Constant work often performs a fixed number of array accesses.

Logarithmic work repeatedly discards a constant fraction.

Linear work visits each item once.

Linearithmic work often combines divide-and-conquer levels with linear work per level.

Quadratic work often compares pairs.

Exponential and factorial work often enumerate subsets, assignments, or orderings.

The input variable matters.

Graph algorithms commonly use $n$ vertices and $m$ edges.

Matrix operations use dimensions such as $r$, $c$, and $k$.

Claims like “linear” are incomplete unless they identify the relevant size measure.

Asymptotic analysis is a planning model.

Profiling is a measurement tool.

Neither replaces the other.

The central question is:

Which common runtime class follows from an algorithm's structure, and what does that class imply for feasible input sizes?

## 2. Core Mathematical Invariants

For eventually positive functions, $f(n)$ grows more slowly than $g(n)$ when:

$$
\lim_{n\to\infty}\frac{f(n)}{g(n)}=0.
$$

The familiar ordering is:

$$
1\prec\log n\prec n\prec n\log n\prec n^2\prec n^3\prec 2^n\prec n!.
$$

This order compares sufficiently large inputs.

It does not promise that one implementation always wins at every small size.

### Constant-time invariant

$O(1)$ means operation count is bounded independently of $n$.

Indexing a fixed-width array cell is commonly modeled as $O(1)$.

Reading an arbitrary-length string or copying a large object is not $O(1)$ merely because it is one language-level expression.

### Logarithmic invariant

If remaining problem size is divided by $b>1$ each step, after $k$ steps it is $n/b^k$.

Reaching a constant base case requires:

$$
k\in\Theta(\log_b n).
$$

Logarithm base changes only a constant factor because:

$$
\log_b n=\frac{\log_a n}{\log_a b}.
$$

### Linear invariant

Visiting every one of $n$ records a constant number of times costs $\Theta(n)$.

No algorithm can explicitly read an arbitrary length-$n$ input in $o(n)$ time under the usual sequential-access model.

### Linearithmic invariant

If $\Theta(n)$ work occurs across $\Theta(\log n)$ balanced recursion levels, total work is:

$$
\Theta(n\log n).
$$

Merge sort is the standard example.

### Quadratic invariant

All unordered pairs of $n$ items number:

$$
\binom n2=\frac{n(n-1)}2\in\Theta(n^2).
$$

Pairwise comparison or all-pairs distance code naturally has this scale.

### Exponential invariant

Every subset of $n$ indexed items corresponds to one bit mask.

There are $2^n$ masks.

Any complete subset enumeration therefore has at least exponential output-space possibilities, even when each candidate check is constant time.

### Factorial invariant

Every ordering of $n$ distinct items is a permutation.

There are:

$$
n!=n(n-1)\cdots1
$$

permutations.

Permutation enumeration grows faster than $2^n$.

### Multi-parameter invariant

BFS with adjacency lists costs $\Theta(n+m)$ because it examines vertices and edge incidences.

Writing $O(n)$ would hide density.

An adjacency matrix scan costs $\Theta(n^2)$ even when the graph has few edges.

Representation changes the runtime model.

## 3. Step-by-Step Execution Trace

Compare several operation counts as $n$ doubles.

| $n$ | $\log_2 n$ | $n$ | $n\log_2 n$ | $n^2$ | $2^n$ |
|---:|---:|---:|---:|---:|---:|
| 8 | 3 | 8 | 24 | 64 | 256 |
| 16 | 4 | 16 | 64 | 256 | 65,536 |
| 32 | 5 | 32 | 160 | 1,024 | 4,294,967,296 |

Doubling $n$ adds one to $\log_2 n$.

It doubles linear work.

It roughly doubles linearithmic work with a small additional logarithmic factor.

It quadruples quadratic work.

It squares the exponential value $2^n$.

That last transition is why brute force changes from convenient to infeasible abruptly.

### Binary-search trace

For a sorted array of 32 items, binary search chooses a midpoint.

One comparison leaves at most 16 candidates.

The next leaves at most 8.

Then 4, then 2, then 1.

At most five comparisons reduce the interval to a base case.

The invariant is not “use a midpoint.”

It is “discard a constant fraction after every comparison.”

### Pairwise trace

For five records, unordered-pair work visits:

$$
(0,1),(0,2),(0,3),(0,4),(1,2),(1,3),(1,4),(2,3),(2,4),(3,4).
$$

There are ten pairs.

The exact formula gives $5\cdot4/2=10$.

For one thousand records, the same structure reaches 499,500 pairs.

The code has not changed; the workload has.

### Feasibility trace

Suppose a system can perform one hundred million simple operations per second.

That figure is only an illustrative model, not a benchmark guarantee.

At $n=10^6$, linear work is on the order of one million operations.

Quadratic work is on the order of one trillion operations.

Even a large constant-factor improvement cannot bridge six orders of magnitude reliably.

Changing the algorithmic class is the relevant optimization.

## 4. Production-Ready Implementations

This helper computes exact candidate counts for selected structures using integer arithmetic.

```python
from math import factorial


def unordered_pair_count(n: int) -> int:
    if n < 0:
        raise ValueError("n must be nonnegative")
    return n * (n - 1) // 2


def subset_count(n: int) -> int:
    if n < 0:
        raise ValueError("n must be nonnegative")
    return 1 << n


def permutation_count(n: int) -> int:
    if n < 0:
        raise ValueError("n must be nonnegative")
    return factorial(n)


assert unordered_pair_count(5) == 10
assert subset_count(10) == 1024
assert permutation_count(5) == 120
```

These functions estimate combinatorial candidate counts.

They do not account for candidate generation, verification, memory allocation, I/O, or parallel coordination.

### Growth experiment

```python
def doubling_steps(n: int) -> int:
    steps = 0
    value = 1
    while value < n:
        value *= 2
        steps += 1
    return steps


for n in [1, 2, 3, 8, 9, 32]:
    steps = doubling_steps(n)
    if n > 1:
        assert 2 ** (steps - 1) < n <= 2 ** steps
```

### Input-size guard

```python
def require_subset_budget(n: int, maximum_candidates: int) -> None:
    if n < 0 or maximum_candidates < 1:
        raise ValueError("invalid bound")
    if subset_count(n) > maximum_candidates:
        raise ValueError("subset search exceeds candidate budget")


require_subset_budget(20, 2_000_000)
try:
    require_subset_budget(60, 2_000_000)
except ValueError:
    pass
else:
    raise AssertionError("unsafe search should be rejected")
```

The guard checks work-space size before allocating or launching a search.

Real systems should enforce time, memory, and output budgets as well.

## 5. Asymptotic Time & Space Complexity

| Class | Typical structure | Example |
|---|---|---|
| $\Theta(1)$ | fixed work | array index access |
| $\Theta(\log n)$ | constant-factor shrinkage | binary search |
| $\Theta(n)$ | one pass | scan or filter |
| $\Theta(n\log n)$ | balanced levels | merge sort |
| $\Theta(n^2)$ | all pairs | simple comparison sort |
| $\Theta(2^n)$ | all subsets | subset enumeration |
| $\Theta(n!)$ | all orderings | permutation search |

Time and space can have different classes.

Heap sort has $O(n\log n)$ time and $O(1)$ auxiliary space.

Merge sort commonly has $O(n\log n)$ time and $O(n)$ auxiliary merge storage.

Depth-first traversal has $O(n+m)$ time and can have $O(n)$ stack depth.

Expected bounds require a distribution or randomized-hash assumption.

Worst-case bounds remain important for externally controlled input.

Amortized bounds average cost over a sequence without assuming random inputs.

An occasional resize may cost $O(n)$ while dynamic-array append remains amortized $O(1)$.

Output-sensitive bounds include result size explicitly.

Convex hull computation can be $O(n\log h)$ where $h$ is number of output vertices.

An algorithm that emits $k$ results requires at least $\Omega(k)$ time simply to produce them.

## 6. Systems Connections

### Product limits

Maximum upload sizes, pagination limits, and query budgets should reflect algorithmic growth.

Allowing a user to request every permutation of 20 items is not made safe by a fast machine.

### Databases

Index choice changes lookup from table scans toward logarithmic or expected-constant behavior under the relevant model.

Join strategy depends on relation sizes, indexes, memory, and data distribution.

### Security

Algorithmic-complexity attacks seek inputs that trigger expensive paths.

Resource limits, hardened data structures, and worst-case analysis reduce that exposure.

### Distributed systems

Network round trips and serialization can dominate local CPU complexity.

Use a communication-cost model when moving data is the expensive operation.

### Profiling

Profiling finds a current bottleneck.

Complexity predicts how that bottleneck changes with scale.

Use both before committing to an optimization.

### Caches and locality

Two algorithms in the same asymptotic class can have different cache behavior.

Sequential scans often benefit from prefetching and compact arrays.

Pointer-heavy structures can incur cache misses despite similar operation counts.

That difference is a constant-factor and machine-model concern, not a reason to ignore asymptotic growth.

### Parallel work and span

Total work counts all operations across workers.

Span counts the longest dependency chain.

An algorithm may have $O(n)$ work but $O(\log n)$ span when balanced independent tasks run in parallel.

Speedup is limited by span, scheduling overhead, memory bandwidth, and skew.

Parallelism does not turn exponential total work into polynomial work.

### Streaming algorithms

Some tasks can process a record once and retain only a compact summary.

That can give linear time with constant or logarithmic auxiliary space.

Exact median, duplicate detection, and arbitrary sorting have different information requirements.

Do not claim a streaming bound without stating what accuracy or output is preserved.

### Parameterized complexity

A bound such as $O(2^k n)$ can be practical when parameter $k$ is small even if $n$ is large.

It is different from unrestricted $O(2^n)$ search.

The parameter must be tied to a product-relevant property and constrained in practice.

### Numerical operations

Fixed-width integer addition is often modeled as constant time.

Multiplying huge arbitrary-precision integers has a cost that grows with bit length.

Algorithms involving cryptography, symbolic algebra, or big integers need a bit-complexity model.

### Recursion depth

Balanced divide-and-conquer can have logarithmic depth.

One-step recursion such as `f(n-1)` has linear depth.

Language recursion limits and stack size can make the latter fail before its time bound becomes the main issue.

### Practical estimation workflow

First calculate candidate count or visited-element count.

Then identify the dominant unit cost: CPU, allocation, storage I/O, network, or synchronization.

Then set an explicit latency and memory budget.

Finally test at sizes near the intended limit, including adversarial distributions.

This sequence keeps a benchmark from becoming an unexplained anecdote.

### Data-dependent branches

Some algorithms have a fixed iteration structure but variable work inside each iteration.

Early exit can improve best-case time without changing the worst-case class.

Branch prediction and vectorization can change measured constant factors.

They do not alter the number of candidates that a complete worst-case search must consider.

When data distribution is important, report it as part of the bound rather than leaving it implicit.

### Memory-time trade-offs

Precomputing an index can change repeated lookup from linear to logarithmic or expected constant time.

That index itself costs construction time and memory.

Caching can reduce CPU work while increasing stale-data risk and invalidation complexity.

Memoization changes recursion only when overlapping subproblems actually repeat.

State the preprocessing and query costs separately.

### Approximation trade-offs

Some intractable optimization problems use approximation algorithms or heuristics.

An approximation ratio is a mathematical guarantee and should not be confused with a benchmark result.

A heuristic may be useful without offering a guaranteed ratio.

The acceptable trade depends on whether the application needs optimality, a deadline, or a feasible answer.

## 7. Practice Checklist

- Name every independent input-size variable.
- Derive counts from loop bounds or recurrences.
- Distinguish worst, expected, and amortized bounds.
- Keep output size visible.
- Use summations for dependent loops.
- Use logarithms for multiplicative progress.
- Count graph edges as well as vertices.
- Check representation assumptions.
- Reject unsafe combinatorial requests early.
- Benchmark only after deriving the growth class.
- Include memory and I/O where they dominate.
- Avoid claiming a universal runtime from one measurement.
- Test formulas on small concrete inputs.
- Prefer a lower growth class over micro-optimizing a bad one.
- Document the assumptions behind expected performance.
- Separate total parallel work from dependency span.
- Include cache and allocation behavior in practical testing.
- Use bit complexity for arbitrary-precision arithmetic.
- Bound recursion depth as well as recursion time.
- Specify error tolerance for approximate streaming methods.
- Estimate output volume before enumerating results.
- Test adversarial distributions, not only average data.
- Set product limits from the actual latency and memory budget.
- Report preprocessing and query complexity separately.
- Keep best-case early exits distinct from worst-case guarantees.
- Measure memory pressure alongside CPU time.
- Identify whether repeated subproblems justify memoization.
- State approximation guarantees precisely when using them.
- Do not confuse a heuristic's typical behavior with a proof.
- Account for cache invalidation in precomputation designs.
- Verify that benchmark data represents expected and hostile inputs.

## 8. Frequently Asked Questions

### Is $O(1)$ always fast?

No.

It is independent of input size, but its constant cost may still be large.

### Is $O(n\log n)$ always better than $O(n^2)$?

For sufficiently large comparable inputs, yes.

Small inputs can be dominated by constants and locality.

### Why does log base not matter in Big-O?

Changing bases multiplies by a constant factor.

Asymptotic classes ignore fixed positive constants.

### Is a nested loop always quadratic?

No.

The inner bound may be logarithmic, dependent, or often empty.

### Can hardware make exponential search practical?

It can increase the feasible boundary modestly.

It cannot remove exponential growth.

### Why are graph bounds often $O(n+m)$?

Adjacency-list traversals examine each vertex and each edge incidence a bounded number of times.

### What should I do when a bound is too large?

Change the algorithm, reduce the problem, use approximation, add pruning with a proof, or impose a product limit.

### Is average-case the same as expected complexity?

Both use probability models, but the model must be stated.

Do not present either as a worst-case guarantee.

### Why can two linear algorithms have very different latency?

They may allocate differently, access memory with different locality, perform different constant-time operations, or wait on I/O.

The shared $O(n)$ class describes growth, not every machine-level cost.

### Does parallelism change Big-O?

It can change elapsed-time bounds under a parallel model, but total work still matters.

Report both work and dependency span when parallel execution is relevant.

### When is an exponential algorithm acceptable?

When the input or a controlling parameter is strictly small, the candidate count fits a measured budget, and failure behavior is bounded.

### Should I optimize the highest Big-O function first?

Usually investigate the actual bottleneck first.

At expected future scale, a worse growth class often becomes the right redesign target even if it is not today's bottleneck.

### What is output-sensitive complexity?

It includes the amount of result produced, such as $O(n\log h)$ for a hull with $h$ vertices.

It is useful when output size varies widely across inputs of equal size.

### Why include I/O in analysis?

Moving data across storage or a network can dominate local computation by orders of magnitude.

Use a model that counts the resource the system is actually limited by.

### Does precomputation make an algorithm faster for free?

No.

It moves work and memory to an earlier stage.

The correct comparison includes build cost, storage, invalidation, and number of later queries.

### What does “practical” mean for an exponential algorithm?

It means the actual bounded parameter and operation cost fit a declared resource budget.

It should never mean that exponential growth has disappeared.

### How should I present runtime to users?

Give the relevant input limit, expected latency range from measurement, and behavior when the limit is exceeded.

Use asymptotic notation in engineering documentation to explain why those limits exist.

### Can an algorithm be fast but use too much memory?

Yes.

Time and peak live memory are independent resource dimensions.

Plan for both, plus storage and network costs where applicable.

### Review questions

Ask which input parameter can grow in the deployed system.

Ask whether an attacker controls that parameter or its distribution.

Ask whether output itself can exceed the response budget.

Ask whether preprocessing is paid once or repeatedly.

Ask whether a lower bound prevents a hoped-for improvement.

Ask whether the data structure changes the cost of a primitive operation.

Ask whether cancellation can stop work before a resource limit is exceeded.

Ask whether a correct approximation is acceptable when exact search is not.

These questions connect notation to an engineering decision.

They also make performance assumptions reviewable.

Record the chosen model with the implementation.

Revisit it when workload shape changes.

Do not hide an exceeded budget behind an optimistic average.

Prefer explicit failure modes to unbounded resource consumption.

Make the limit observable to operators and callers.

Treat a changed workload as a reason to repeat the analysis.
