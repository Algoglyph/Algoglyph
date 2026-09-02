# How to Calculate Complexity: Operation Counts, Summations & Recurrence Models

![Complexity analysis recursion tree](/images/dsa/calculate-complexity-dark.png#dark)

## 1. Historical Context & Motivation

Asymptotic analysis compares algorithms by how their resource use grows with input size.

It deliberately does not promise an exact elapsed time.

Wall-clock time depends on hardware, compiler choices, data layout, cache state, input distribution, and surrounding load.

Counting a dominant operation gives a portable model before benchmarking exists.

That model helps eliminate impossible designs early.

It also reveals which optimization can matter at scale.

Complexity analysis begins with a precise input-size variable.

For an array, $n$ may be its length.

For a graph, both vertices $n$ and edges $m$ may matter.

For a matrix, rows $r$ and columns $c$ should remain distinct unless the problem guarantees a square matrix.

For a string algorithm, text length $n$ and pattern length $m$ often have different roles.

Collapsing variables too early hides important costs.

The next step is choosing a cost model.

On a RAM-style model, integer arithmetic on bounded words, indexing, comparison, and assignment are commonly treated as constant-time operations.

That assumption is useful but conditional.

Arbitrary-precision arithmetic, long string comparison, disk access, and network requests are not constant merely because they appear on one line of code.

The goal is not to label loops by sight.

The goal is to count how often each relevant statement executes, express that count as a function, and simplify it honestly.

Nested loops multiply only when the inner iteration count is independent of the outer value.

An inner loop whose upper bound is `i` produces a sum, not $n\cdot n$ by default.

A loop that doubles an index is logarithmic because the index reaches $n$ after $\log_2 n$ multiplications.

A recurrence must be derived from actual subproblem calls and nonrecursive work.

The Master Theorem applies only to a particular family of balanced divide-and-conquer recurrences.

It is not a universal recursion button.

Space analysis requires a separate accounting.

An $O(n\log n)$ algorithm may use $O(n)$ temporary memory, $O(\log n)$ stack depth, or both.

Output storage should be reported separately when callers must retain it.

The central question is:

How can we turn program structure into justified time and space bounds without confusing notation, data-dependent behavior, or a benchmark with a proof?

## 2. Core Mathematical Invariants

Let $T(n)$ be the number of selected primitive operations for an input of size $n$.

Big-O states an eventual upper bound:

$$
T(n)\in O(f(n))\iff \exists c,n_0>0:\ 0\le T(n)\le cf(n)\ \forall n\ge n_0.
$$

Big-Omega states an eventual lower bound:

$$
T(n)\in\Omega(f(n))\iff \exists c,n_0>0:\ 0\le cf(n)\le T(n)\ \forall n\ge n_0.
$$

Big-Theta states both:

$$
T(n)\in\Theta(f(n))\iff T(n)\in O(f(n))\cap\Omega(f(n)).
$$

### Dominant-term invariant

For nonnegative functions, a sequential composition has cost:

$$
T(n)=T_1(n)+T_2(n).
$$

If $T_1\in O(f)$ and $T_2\in O(g)$, then total cost is $O(f+g)$.

When one term eventually dominates, simplify only after proving that relationship.

For example:

$$
3n^2+8n+11\in\Theta(n^2).
$$

The quadratic term dominates because $n\le n^2$ and $1\le n^2$ for $n\ge1$.

### Loop-count invariant

The cost of a loop is the sum of its body cost over the values actually visited.

For:

```text
for i in 0 .. n-1:
    work()
```

the count is $\sum_{i=0}^{n-1}1=n$.

For an inner loop bounded by `i`:

$$
\sum_{i=0}^{n-1}i=\frac{n(n-1)}2\in\Theta(n^2).
$$

The triangular sum is not exactly $n^2$, but it has quadratic growth.

### Geometric-progress invariant

If a positive loop variable starts at 1 and is multiplied by constant $b>1$ until reaching $n$, then after $k$ iterations it equals $b^k$.

The stopping condition gives:

$$
b^k\ge n\implies k\ge\log_b n.
$$

Thus the loop executes $\Theta(\log n)$ times.

If an outer loop runs $n$ times independently, the combined cost is $\Theta(n\log n)$.

### Halving invariant

If a problem size is divided by a constant factor each iteration, there are logarithmically many states before reaching a base case.

Binary search is logarithmic only when each comparison discards a constant fraction of the remaining search interval.

Scanning one half and then the other is not binary search.

### Recurrence invariant

For divide-and-conquer code, write:

$$
T(n)=aT(n/b)+g(n)
$$

only when it creates $a$ independent subproblems of size $n/b$ and performs $g(n)$ nonrecursive work per call.

The recursion-tree level $j$ has $a^j$ nodes of size $n/b^j$.

Its work is:

$$
a^j g(n/b^j).
$$

The recursion stops after $\Theta(\log_b n)$ levels under exact balanced shrinkage.

### Master-Theorem boundary

For $T(n)=aT(n/b)+\Theta(n^d)$, compare $d$ with $\log_b a$.

If $d<\log_b a$, leaf work dominates and $T(n)=\Theta(n^{\log_b a})$.

If $d=\log_b a$, levels balance and $T(n)=\Theta(n^d\log n)$.

If $d>\log_b a$ plus the theorem's regularity condition, root work dominates and $T(n)=\Theta(n^d)$.

Unequal splits, changing branch counts, and recurrences such as $T(n)=T(n-1)+n$ need other methods.

### Auxiliary-space invariant

Peak auxiliary space is the maximum simultaneously live memory excluding input and, by convention, sometimes excluding required output.

Sequential temporary allocations do not add if one is freed before the next begins.

Recursive calls do add along one active call chain.

Two recursive calls executed sequentially do not generally double peak stack space.

### Input-sensitive invariant

Worst-case, best-case, expected, and amortized bounds answer different questions.

State which one is being claimed.

An early-exit linear search has best-case $\Theta(1)$ and worst-case $\Theta(n)$.

Hash-table lookup is expected $O(1)$ under assumptions about hashing and load, not unconditional worst-case $O(1)$.

## 3. Step-by-Step Execution Trace

Analyze this function:

```python
def count_pairs(values: list[int]) -> int:
    total = 0
    n = len(values)
    for i in range(n):
        j = 1
        while j < n:
            total += values[i] & j
            j *= 2
    return total
```

For each fixed `i`, `j` takes values:

$$
1,2,4,8,\ldots,2^{k-1}.
$$

The loop stops when $2^k\ge n$.

Therefore $k=\lceil\log_2 n\rceil$ for $n>1$.

The outer loop has exactly $n$ iterations.

The inner count does not depend on `i`.

The body executes:

$$
n\lceil\log_2 n\rceil
$$

times.

The time bound is $\Theta(n\log n)$.

The function stores `total`, `n`, `i`, and `j`.

Ignoring the input list, auxiliary space is $\Theta(1)$.

### Dependent-loop trace

Now analyze:

```python
def triangular_work(n: int) -> int:
    steps = 0
    for i in range(n):
        for j in range(i):
            steps += 1
    return steps
```

For `i = 0`, the inner body executes 0 times.

For `i = 1`, it executes once.

For `i = 2`, it executes twice.

For `i = n-1`, it executes $n-1$ times.

The exact count is:

$$
0+1+\cdots+(n-1)=\frac{n(n-1)}2.
$$

The time is $\Theta(n^2)$.

Calling it “two nested loops, therefore $n^2$” reaches the right class here but misses the reason and fails on many variants.

### Merge-sort recurrence trace

Merge sort makes two subproblems of size $n/2$ and merges in linear time:

$$
T(n)=2T(n/2)+cn.
$$

At level zero, work is $cn$.

At level one, two nodes each do $c(n/2)$, totaling $cn$.

At level two, four nodes each do $c(n/4)$, again totaling $cn$.

There are $\log_2 n$ non-leaf levels.

Their total is $cn\log_2 n$.

Leaves contribute $\Theta(n)$ base-case work.

Thus:

$$
T(n)\in\Theta(n\log n).
$$

### A recurrence that is not Master-Theorem shaped

For:

$$
T(n)=T(n-1)+n,
$$

expand directly:

$$
T(n)=T(1)+2+3+\cdots+n\in\Theta(n^2).
$$

There is one subproblem whose size decreases by one, not a fixed fraction.

Applying the Master Theorem here would be invalid.

## 4. Production-Ready Implementations

Small empirical counters help validate a derived count on concrete sizes.

They do not replace the proof.

```python
def logarithmic_iterations(n: int) -> int:
    if n < 1:
        return 0
    count = 0
    value = 1
    while value < n:
        value *= 2
        count += 1
    return count


def triangular_iterations(n: int) -> int:
    count = 0
    for i in range(n):
        for _ in range(i):
            count += 1
    return count


assert logarithmic_iterations(1) == 0
assert logarithmic_iterations(2) == 1
assert logarithmic_iterations(9) == 4
assert triangular_iterations(0) == 0
assert triangular_iterations(5) == 10
```

The logarithmic counter uses a well-defined behavior for `n <= 1`.

The triangular count agrees with the closed form.

```python
from random import Random


rng = Random(43)
for _ in range(500):
    n = rng.randrange(0, 500)
    assert triangular_iterations(n) == n * (n - 1) // 2

    k = logarithmic_iterations(n)
    if n > 1:
        assert 2 ** (k - 1) < n <= 2 ** k
```

### A measured merge sort

This implementation counts comparisons and temporary-buffer allocations separately.

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class MergeMetrics:
    comparisons: int
    maximum_buffer_items: int


def merge_sort_with_metrics(values: list[int]) -> tuple[list[int], MergeMetrics]:
    comparisons = 0
    maximum_buffer_items = 0

    def sort(items: list[int]) -> list[int]:
        nonlocal comparisons, maximum_buffer_items
        if len(items) <= 1:
            return items
        middle = len(items) // 2
        left = sort(items[:middle])
        right = sort(items[middle:])
        merged: list[int] = []
        maximum_buffer_items = max(maximum_buffer_items, len(left) + len(right))
        i = j = 0
        while i < len(left) and j < len(right):
            comparisons += 1
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged

    result = sort(values)
    return result, MergeMetrics(comparisons, maximum_buffer_items)


result, metrics = merge_sort_with_metrics([5, 1, 4, 2, 8])
assert result == [1, 2, 4, 5, 8]
assert metrics.comparisons <= 5 * 3
assert metrics.maximum_buffer_items == 5
```

The code's slicing changes constant factors and allocates additional short-lived lists.

The peak scale remains linear for this straightforward implementation, while stack depth remains logarithmic.

### Analysis workflow

1. Name every independent input-size variable.
2. State the operation model and assumptions.
3. Find exact or bounded iteration counts using sums, products, or recurrences.
4. Include work hidden in helper calls, comparisons, and data movement when it scales.
5. Simplify only after the expression is correct.
6. Analyze auxiliary and output space separately.
7. State worst, best, expected, or amortized conditions.
8. Validate a few small sizes with counters or tests.

## 5. Asymptotic Time & Space Complexity

Common growth classes form an eventual ordering:

$$
1\prec\log n\prec n\prec n\log n\prec n^2\prec n^3\prec 2^n\prec n!.
$$

The ordering is not a prediction of runtime without constants and hardware.

It explains what happens as $n$ grows while the model remains applicable.

For sequential code, add costs.

For independent nested loops, multiply iteration counts.

For dependent loops, write a summation.

For geometric progress, solve an exponential inequality.

For recursive calls, derive and solve a recurrence.

For amortized structures, sum the cost over a sequence of operations rather than demand the same bound per operation.

Space complexity counts peak simultaneously live memory.

An iterative binary search takes $O(1)$ auxiliary space.

A recursive binary search has $O(\log n)$ call-stack space even though it still examines logarithmically many elements.

Merge sort commonly takes $O(n)$ auxiliary merge storage.

In-place heap sort uses $O(1)$ auxiliary space but has different stability and locality properties.

An output-producing algorithm can require $\Omega(k)$ space merely to return $k$ results.

Never hide output size by calling an enumerator constant-space simply because its traversal state is constant.

For graph traversal, $O(n+m)$ time assumes adjacency lists and visits each vertex and edge a constant number of times.

With an adjacency matrix, scanning neighbors alone costs $O(n^2)$.

Representation is part of the analysis.

Expected complexity needs a probability model.

Average-case complexity needs a distribution over inputs.

Amortized complexity needs a sequence-level accounting argument.

These labels are not interchangeable.

## 6. Systems Connections

### Capacity planning

Complexity bounds estimate whether a workload can grow by ten or one hundred times without a redesign.

Benchmarking converts the model into device-specific latency and cost measurements.

Both are necessary for an operational decision.

### Compiler optimization

Loop unrolling can reduce branch overhead for a fixed small trip count.

It does not change an $O(n)$ loop into $O(1)$ when the trip count depends on input size.

Vectorization may process several elements per instruction but preserves the same asymptotic class.

### Databases

Nested-loop joins, hash joins, and sort-merge joins have different cost models involving relation sizes, indexes, memory, and I/O.

Writing $O(n^2)$ without naming both relations is often inadequate.

### Networking and storage

One disk seek or network round trip can dominate millions of arithmetic operations.

Use an I/O or communication cost model when those resources are relevant.

### Security

Algorithmic-complexity attacks choose inputs that trigger expensive paths, such as hash collisions or pathological regular expressions.

Worst-case analysis, size limits, deadlines, and resource accounting are defenses, not academic extras.

### API design

An API that returns all combinations has output that may be exponential.

Pagination limits transferred output, but it does not automatically limit computation unless traversal itself is budgeted.

### Profiling

Profiling identifies where one actual workload spends time.

It can reveal a high constant factor, cache miss pattern, allocation bottleneck, or unexpected helper cost.

It cannot prove a general growth bound from a few samples.

## 7. Practice Checklist

- Name input sizes before counting.
- Keep $n$, $m$, $r$, and $c$ separate when they vary independently.
- Define the relevant primitive operation.
- Count actual loop iterations, not visual nesting alone.
- Use summations for dependent bounds.
- Use products only for independent nested counts.
- Solve doubling and halving loops with logarithms.
- Check loop initialization and stopping conditions.
- Include the case $n=0$ where the API permits it.
- Derive recurrences from real recursive calls.
- Draw two or three recursion-tree levels before applying a theorem.
- Verify Master-Theorem prerequisites.
- Expand $T(n)=T(n-1)+n$ directly instead.
- State base cases.
- Distinguish exact counts from asymptotic classes.
- Simplify lower-order terms only after forming the sum.
- Include helper-operation cost when it is nonconstant.
- Include string length in string-comparison cost when relevant.
- Include data-structure representation in graph bounds.
- Analyze peak live memory, not total allocation over time.
- Count recursion stack depth.
- State whether output storage is excluded.
- Label worst-case, best-case, expected, or amortized claims.
- State the distribution behind an average claim.
- State the assumptions behind expected hash-table claims.
- Test derived formulas on small inputs.
- Benchmark after, not instead of, proving growth.
- Watch for integer overflow in exact operation counters.
- Bound untrusted inputs before expensive algorithms run.
- Revisit the model when I/O or network cost dominates.

## 8. Frequently Asked Questions

### Is Big-O an exact runtime?

No.

It is an eventual asymptotic upper bound under a stated model.

### Why ignore constants?

Constants matter in engineering, but asymptotic notation isolates growth-rate differences that dominate at sufficiently large sizes.

### Do nested loops always mean quadratic time?

No.

Their bounds may be logarithmic, dependent, empty, or otherwise constrained.

### Why is a doubling loop logarithmic?

After $k$ iterations it has grown by a factor of $2^k$.

Reaching $n$ requires only $\Theta(\log n)$ doublings.

### Can the Master Theorem solve every recurrence?

No.

It applies to a restricted balanced form; unequal or additive-size recurrences need other tools.

### What does amortized mean?

It bounds the average cost over a sequence without assuming random inputs.

An individual operation may still be expensive.

### Is expected complexity the same as amortized complexity?

No.

Expected analysis uses probability; amortized analysis uses sequence-level accounting.

### Why report space separately?

Algorithms with identical time bounds can have radically different memory needs and failure modes.

### Does recursion always use linear space?

No.

Space follows maximum call depth, which is logarithmic for balanced divide-and-conquer and linear for one-step shrinkage.

### Is $O(n\log n)$ always faster than $O(n^2)$?

For sufficiently large comparable inputs under comparable constants, yes.

For small inputs, constants, locality, and implementation can reverse observed timings.

### What is the best way to avoid analysis mistakes?

Write an exact count or recurrence first, test it on small cases, state assumptions, and only then simplify to asymptotic notation.
