# Competitive Programming Invariants: From Constraint Reading to Verified Solutions

![Competitive programming invariant workflow](/images/dsa/advanced-cp-dark.png#dark)

A competitive-programming solution is not complete when it passes the sample.

It is complete when the algorithm follows from the constraints, its invariant proves every state transition, and its implementation survives adversarial input within the time and memory limits.

This article treats contest problem solving as a disciplined chain:

```text
constraints -> model -> invariant -> algorithm -> proof -> implementation -> tests
```

Breaking any link creates a familiar failure mode: a correct idea that times out, a fast idea that solves a different problem, or code that violates the proof on one boundary case.

## 1. Historical Context & Motivation

### Why cleverness is an unreliable strategy

Timed contests reward fast recognition, but recognition is not guessing a fashionable algorithm from the nouns in a statement.

The words “array” and “query” do not automatically imply a segment tree.

The words “shortest path” do not automatically imply Dijkstra.

The usable evidence is structural:

- input size;
- operation mix;
- value range;
- monotonicity;
- graph direction and edge signs;
- whether updates are online or offline;
- whether an exact answer is required;
- total limits across all test cases.

A reliable contestant converts those facts into a budget before writing code.

If $n=20$, enumerating subsets may be the intended solution.

If $n=2\times10^5$, quadratic pair enumeration is almost certainly impossible.

If values lie in $[0,10^6]$, frequency indexing may replace comparison-based structures.

If every edge has unit cost, breadth-first search is more direct than a weighted priority queue.

Constraints are not administrative details at the bottom of a problem.

They are part of the algorithm specification.

### The role of an invariant

An **invariant** is a statement that remains true at a defined point in an algorithm.

It converts intuition into a local obligation.

Instead of arguing “the window seems to move correctly,” state what the window represents before and after each pointer movement.

Instead of arguing “the dynamic program has the answer so far,” define exactly which prefixes or states have already been solved.

Instead of arguing “union-find keeps the components,” define what each representative means after every union.

An invariant is valuable in a contest because it serves three jobs at once:

1. it guides the algorithm design;
2. it supplies the correctness proof;
3. it tells the programmer what assertions and tests should check.

### A contest submission is a bounded system

The judge controls the input.

The statement controls what outputs are accepted.

The runtime and memory limits constrain the implementation.

The language runtime contributes its own costs: allocation, hashing, recursion depth, integer width, and input parsing.

The same asymptotic algorithm can pass in one representation and fail in another.

An adjacency matrix and an adjacency list both represent a graph, but their memory and traversal behavior differ by orders of magnitude on sparse inputs.

A recursive depth-first search may be mathematically correct and still overflow the process stack on a chain of $200{,}000$ vertices.

A 32-bit accumulator may overflow even when every individual input value fits in 32 bits.

Competitive programming therefore connects mathematical reasoning to concrete machine limits unusually quickly.

### The main question before implementation

Before choosing a data structure, ask:

> What must be true after each operation so that the final answer follows?

For binary search, the invariant partitions impossible and still-possible answers.

For a sliding window, it characterizes the current interval and the candidates already discarded.

For greedy scheduling, it explains why one locally selected item leaves an optimal residual problem.

For graph relaxation, it distinguishes tentative bounds from finalized distances.

For dynamic programming, it defines the subproblem represented by every table entry.

The implementation should look like a mechanical maintenance procedure for that statement.

If the code cannot be explained in those terms, it is not yet ready for adversarial cases.

### A disciplined five-pass workflow

A strong first attempt usually follows five passes.

**Pass 1: normalize the statement.**

Rewrite the input as mathematical objects and the output as a predicate or optimization target.

**Pass 2: derive the budget.**

Estimate the largest acceptable operation count and memory footprint from all constraints.

**Pass 3: identify exploitable structure.**

Look for sortedness, positivity, bounded values, repeated queries, optimal substructure, or graph properties.

**Pass 4: state and prove an invariant.**

Prove initialization, preservation, and termination before committing to syntax.

**Pass 5: attack the implementation.**

Construct minimum, maximum, duplicate, degenerate, overflow, and no-solution cases.

This workflow is slower than guessing for the first minute and faster than debugging the wrong $O(n^2)$ idea for the next forty.

## 2. Core Mathematical Invariants

### Constraint-to-complexity reasoning

Let $T(n)$ be the number of dominant operations for one test case.

If there are $q$ cases with sizes $n_1,\ldots,n_q$, the true workload is

$$
\sum_{i=1}^{q} T(n_i),
$$

not simply $q\cdot T(n_{\max})$ unless every case can be maximal.

Statements often provide a total-size constraint such as

$$
\sum_i n_i \le 2\times 10^5.
$$

That permits a linear or $O(n\log n)$ algorithm across all cases even when $q$ itself is large.

Ignoring the aggregate bound can lead to unnecessary optimization.

Ignoring the absence of such a bound can lead to a time-limit failure.

### Initialization, maintenance, termination

Every loop-invariant proof has three parts.

**Initialization:** the invariant is true before the first iteration.

**Maintenance:** assuming it is true before an iteration, the body makes it true before the next.

**Termination:** when the loop condition becomes false, the invariant implies the desired result.

This structure is practical, not ceremonial.

Initialization exposes empty-input and index-zero mistakes.

Maintenance exposes pointer updates that discard an unexamined candidate.

Termination exposes algorithms that preserve a useful state but stop at the wrong event.

### Prefix-state invariant

Many array algorithms maintain a summary for a processed prefix.

After processing positions $[0,i)$, a prefix invariant may state:

$$
S_i = \sum_{j=0}^{i-1} a_j.
$$

The next transition is

$$
S_{i+1}=S_i+a_i.
$$

The statement defines both the range convention and the update.

Using half-open ranges $[l,r)$ often reduces boundary ambiguity because the length is $r-l$ and an empty range has $l=r$.

Prefix sums then answer a range sum through

$$
\operatorname{sum}(l,r)=S_r-S_l.
$$

The formula is correct because both prefixes include exactly the indices before their endpoints.

### Monotone-boundary invariant

Binary search is best understood as maintaining a boundary, not repeatedly “looking at the middle.”

Suppose a predicate $P(x)$ is false and then true over an ordered domain.

Maintain sentinels `lo` and `hi` such that

```text
P(lo) is false
P(hi) is true
lo < hi
```

Each midpoint evaluation replaces one sentinel while preserving those facts.

At termination `hi` is the first true position under the chosen interval convention.

The invariant prevents the common mixture of inclusive and exclusive endpoints.

It also generalizes binary search from sorted arrays to “binary search on the answer.”

The essential property is monotonicity of $P$, not physical storage.

### Sliding-window invariant

Two-pointer and sliding-window algorithms depend on one-way movement.

That movement requires a monotone relationship.

For positive array values, extending the right boundary never decreases the window sum.

Removing the leftmost value never increases it.

This permits an invariant for the minimum-length subarray with sum at least a target:

> Before advancing the right boundary, every start index smaller than `left` has already been paired with its shortest feasible ending position, and the stored sum equals the current half-open window `[left, right)`.

While the window is feasible, removing from the left tests progressively shorter candidates.

Once removal makes the sum too small, no still-shorter window ending at the same right boundary can be feasible because all values are positive.

The positivity condition is part of the proof.

Negative values destroy the monotonicity and require a different method.

### Greedy exchange invariant

A greedy algorithm needs more than a locally appealing score.

Its proof often shows an **exchange**: any optimal solution can be transformed to include the greedy choice without becoming worse.

After choosing an item, the invariant states that at least one optimal completion remains compatible with all choices made so far.

For interval scheduling by earliest finish time, replace the first interval of an optimal schedule with the compatible interval that finishes earliest.

The replacement leaves at least as much room for later intervals.

Without such an exchange, a greedy rule is a heuristic rather than a proved algorithm.

### Dynamic-programming state invariant

A DP table entry must have one exact meaning.

For example,

$$
dp[i]=\text{minimum cost to solve exactly the prefix }[0,i).
$$

The recurrence must enumerate every possible final transition into state $i$.

The base case must represent a real empty or initial subproblem.

The evaluation order must ensure dependencies are available before use, unless memoized recursion enforces that order dynamically.

If one branch interprets `dp[i]` as “using the first `i` items” and another as “ending at item `i`,” the table is not merely off by one; it has no coherent invariant.

### Graph-search invariant

Graph algorithms distinguish discovery from final knowledge.

In breadth-first search on an unweighted graph, the first discovery of a vertex fixes its shortest edge-count distance.

In Dijkstra's algorithm, discovery only creates a tentative upper bound; extraction at the current minimum score finalizes it when edges are non-negative.

In Bellman-Ford, a full pass invariant states which path edge counts have been considered.

In depth-first search, color or entry/exit state distinguishes unseen, active, and completed vertices.

Using one boolean `visited` without matching the algorithm's invariant is a common source of cycle, parent-edge, and relaxation bugs.

### Data-structure representation invariant

A data structure is correct when its representation remains valid after every operation.

For a binary heap stored in an array,

$$
a[\operatorname{parent}(i)] \le a[i]
$$

for every non-root index in a min-heap.

For disjoint-set union, each parent pointer leads to a representative and the representative points to itself.

For a segment tree, each internal value equals the merge of its children's represented ranges.

For a hash table with open addressing, lookup must follow the same probe sequence as insertion and distinguish never-used slots from tombstones.

These facts tell you exactly what a mutation must repair.

### Numeric invariant and overflow

Correct asymptotics do not prevent numeric overflow.

If $n$ values each have magnitude at most $M$, a sum may need to represent magnitude $nM$.

Before choosing an integer type, bound every aggregate:

$$
|S| \le \sum_{i=1}^{n}|a_i| \le nM.
$$

Products need the same treatment before multiplication occurs.

Casting the result after two 32-bit integers multiply is too late if overflow happened during the multiplication.

Modular arithmetic has its own invariants: normalize subtraction, avoid invalid modular division, and use an inverse only when the required algebraic conditions hold.

### The oracle invariant

For small instances, a slow brute-force solver can serve as an executable specification.

The invariant of differential testing is simple:

$$
\text{fast}(x)=\text{oracle}(x)
$$

for every generated valid small input $x$.

The oracle should be structurally simpler than the optimized solution.

Two implementations of the same flawed idea are not independent evidence.

Random testing does not replace a proof, but it finds violations of the claimed invariant with remarkable efficiency.

## 3. Step-by-Step Execution Trace

### Problem used for the trace

Given an array of **positive** integers and a positive target $K$, find the minimum length of a contiguous subarray whose sum is at least $K$.

Return `0` if no such subarray exists.

Use:

```text
values = [2, 1, 5, 2, 3, 2]
K = 7
```

The expected answer is `2`, produced by `[5, 2]` or `[2, 5]` is not contiguous in another order; here `[5, 2]` at indices `2..3` is the first length-two answer.

### Deriving the method from constraints

Assume $n$ is large enough that checking every pair of boundaries is too slow.

There are $\Theta(n^2)$ contiguous subarrays.

However, all values are positive.

For a fixed left boundary, moving right increases the sum.

For a fixed right boundary, moving left rightward decreases the sum.

This monotonicity allows both pointers to move only forward.

Maintain a half-open window `[left, right)` with exact `window_sum`.

After adding `values[right]`, advance `right` conceptually by one.

While the sum is feasible, record the length and remove `values[left]` to test a shorter ending-at-`right` candidate.

### Initial state

Before reading any element:

```text
left = 0
right = 0
window = [0, 0)
window_sum = 0
best = infinity
```

The sum invariant is true because the empty sum is zero.

No start index has been discarded.

### Read index 0

Add `values[0] = 2`.

The window becomes `[0, 1)` with sum `2`.

Because $2<7$, the window is infeasible.

Shrinking it cannot help because all values are positive.

State:

```text
[2] 1 5 2 3 2
 L
 R
sum = 2, best = infinity
```

### Read index 1

Add `values[1] = 1`.

The window becomes `[0, 2)` with sum `3`.

It is still infeasible.

State:

```text
[2 1] 5 2 3 2
 L  R
sum = 3, best = infinity
```

### Read index 2 and shrink

Add `values[2] = 5`.

The window `[0, 3)` has sum $2+1+5=8$.

It is feasible, so update `best = 3`.

Remove `values[0] = 2` and increment `left`.

The window `[1, 3)` now has sum $6$.

It is infeasible, so shrinking stops.

Every window ending at index `2` and starting before `1` has now been handled.

State:

```text
2 [1 5] 2 3 2
   L R
sum = 6, best = 3
```

### Read index 3 and shrink twice

Add `values[3] = 2`.

The window `[1, 4)` has sum $1+5+2=8$.

Its length is `3`, so `best` remains `3`.

Remove `values[1] = 1`.

The window `[2, 4)` has sum $7$.

It is still feasible.

Update `best = 2`.

Remove `values[2] = 5`.

The window `[3, 4)` has sum $2$ and is infeasible.

Shrinking stops.

State:

```text
2 1 5 [2] 3 2
      L R
sum = 2, best = 2
```

The window `[2,4)` is the first certified length-two solution.

### Read index 4

Add `values[4] = 3`.

The window `[3, 5)` has sum $5$.

It is infeasible, so no shrinking occurs.

State:

```text
2 1 5 [2 3] 2
      L   R
sum = 5, best = 2
```

### Read index 5 and finish

Add `values[5] = 2`.

The window `[3, 6)` has sum $7$ and length `3`.

`best` stays `2`.

Remove `values[3] = 2`.

The remaining window `[4, 6)` has sum $5$, so shrinking stops.

The right boundary has reached $n$.

Final state:

```text
2 1 5 2 [3 2]
          L  R
sum = 5, best = 2
```

### Why no candidate was skipped

For each right endpoint, the inner loop examined feasible windows in decreasing length order.

It stopped exactly when positivity made every further shrink infeasible.

Once `left` moved past a start index, the shortest feasible window for that start had already been considered.

Future right endpoints would only make a window from that old start longer, never improve its length.

Both pointers moved monotonically from `0` to at most `n`.

The final `best=2` follows from the invariant, not from recognizing `[5,2]` by inspection.

### Why the same code fails with negative values

Consider `[8, -100, 8]` with target `10`.

Extending a window can reduce its sum.

Removing a left value can increase or decrease the sum unpredictably.

The stopping argument no longer holds.

The input condition “positive integers” is therefore not a minor convenience.

It is the exact property that permits one-way elimination.

## 4. Production-Ready Implementations

### Linear sliding-window solution

```python
from __future__ import annotations

from collections.abc import Sequence


def minimum_subarray_length(target: int, values: Sequence[int]) -> int:
    """Return the shortest positive-value window with sum >= target.

    A return value of zero means no feasible window exists.
    """
    if target <= 0:
        raise ValueError("target must be positive")
    if any(value <= 0 for value in values):
        raise ValueError("all values must be positive")

    left = 0
    window_sum = 0
    best = len(values) + 1

    for right, value in enumerate(values):
        window_sum += value

        while window_sum >= target:
            best = min(best, right - left + 1)
            window_sum -= values[left]
            left += 1

    return 0 if best == len(values) + 1 else best
```

The input checks make the proof preconditions executable.

In a judge where validation cost is unwanted and the statement guarantees positivity, those checks can be omitted deliberately.

They should not be removed because the algorithm somehow supports negative values; it does not.

### Independent quadratic oracle

```python
def minimum_subarray_length_oracle(
    target: int,
    values: list[int],
) -> int:
    best = len(values) + 1

    for left in range(len(values)):
        total = 0
        for right in range(left, len(values)):
            total += values[right]
            if total >= target:
                best = min(best, right - left + 1)
                break

    return 0 if best == len(values) + 1 else best
```

This oracle is too slow for the largest input.

It is excellent for small tests because its nested-loop interpretation closely matches the problem definition.

### Differential tests with a fixed seed

```python
from random import Random


def self_test() -> None:
    assert minimum_subarray_length(7, [2, 1, 5, 2, 3, 2]) == 2
    assert minimum_subarray_length(4, [4]) == 1
    assert minimum_subarray_length(100, [1, 2, 3]) == 0
    assert minimum_subarray_length(6, [1, 1, 1, 1, 1, 1]) == 6

    rng = Random(20260830)
    for length in range(9):
        for _ in range(500):
            values = [rng.randint(1, 9) for _ in range(length)]
            target = rng.randint(1, 40)
            expected = minimum_subarray_length_oracle(target, values)
            actual = minimum_subarray_length(target, values)
            assert actual == expected, (target, values, expected, actual)


self_test()
```

The fixed seed makes a failure reproducible.

Varying lengths deliberately includes the empty array.

The optimized function and oracle differ structurally, so agreement provides useful evidence.

### Contest-oriented I/O wrapper

The algorithm should remain separate from parsing.

That separation makes it directly testable.

```python
import sys


def solve(data: bytes) -> str:
    tokens = list(map(int, data.split()))
    if len(tokens) < 2:
        raise ValueError("expected n, target, and array values")

    n, target = tokens[0], tokens[1]
    values = tokens[2:]
    if len(values) != n:
        raise ValueError(f"expected {n} values, received {len(values)}")

    return str(minimum_subarray_length(target, values))


if __name__ == "__main__":
    sys.stdout.write(solve(sys.stdin.buffer.read()))
```

The exact wrapper must match the judge's input format.

Do not copy a fast-I/O template whose assumptions differ from the statement.

Reading all bytes is appropriate for many bounded contest inputs but not for an unbounded stream.

### Implementation review at the proof boundary

The expression `right - left + 1` matches an inclusive loop variable `right` and inclusive current window endpoints in the code.

The prose trace used `[left, right)` after conceptual insertion.

Both conventions are valid because the conversion is explicit.

The sum is updated before feasibility is tested.

The left value is subtracted before `left` advances.

The sentinel `len(values) + 1` cannot be a valid answer.

Returning zero therefore cleanly distinguishes the no-solution case.

### When to remove defensive checks

Contest code often trusts statement guarantees to save time and characters.

That is a scoped decision.

For a reusable library function, rejecting invalid inputs documents the domain and prevents plausible-looking wrong answers.

For a judge-only submission, scanning `values` once for positivity adds $O(n)$ time but does not change asymptotic complexity.

It can still affect a tight constant-factor budget.

Choose intentionally and keep the proof assumption visible in a comment or function contract.

### Integer-width audit

Python integers expand automatically.

In C++, `window_sum` must hold up to $nM$, where $M$ is the maximum value.

If $n,M\le 10^9$ in a conceptual variant, the product can reach $10^{18}$.

The accumulator and target comparison would need a suitable 64-bit type under the stated bounds.

The indices may fit in 32 bits while the sum does not.

Use separate type reasoning for positions and arithmetic values.

### Submission hygiene

Compile with warnings locally.

Run the exact sample through the same `solve` entry point submitted to the judge.

Remove diagnostic output from standard output.

Keep assertions only if their runtime and failure behavior are acceptable.

Confirm that multiple test cases reset every per-case container and accumulator.

Avoid global state unless its lifecycle is explicit.

Do not seed randomized algorithms from an uncontrolled source when reproducibility or adversarial robustness matters.

## 5. Asymptotic Time & Space Complexity

### Deriving the sliding-window bound

The outer loop advances `right` exactly $n$ times.

The inner loop appears nested, but `left` never moves backward.

Across the entire run, `left` advances at most $n$ times.

Therefore the number of pointer movements is at most $2n$.

Every movement performs constant work.

The total running time is

$$
T(n)=O(n).
$$

This is an aggregate argument, sometimes called amortized analysis.

Multiplying the apparent loop bounds to claim $O(n^2)$ would ignore the monotone pointer invariant.

### Auxiliary space

The optimized function stores a fixed number of indices and integers.

It does not allocate storage proportional to input size.

Its auxiliary space is

$$
O(1).
$$

The input sequence itself occupies $O(n)$ but is not auxiliary storage created by the algorithm.

The `solve` wrapper shown above duplicates parsed tokens and values, so the complete program's memory use is $O(n)$.

Algorithm-space and parser-space claims should not be conflated.

### Oracle complexity

For each left boundary, the oracle may scan to the end.

Its worst-case number of additions is

$$
n+(n-1)+\cdots+1=\frac{n(n+1)}{2}.
$$

Therefore its time is $\Theta(n^2)$.

Its auxiliary space is $O(1)$ beyond the input.

The oracle is intentionally asymptotically worse because it optimizes for obviousness on small cases.

### Differential-test cost

If random tests use maximum generated length $m$ and $R$ cases per length, the oracle dominates at roughly

$$
O(Rm^3)
$$

when summing quadratic work over every length from $0$ through $m$.

Here $m=8$, so that cost is tiny.

Increasing fuzz size blindly can make test feedback slow without finding qualitatively new boundaries.

Use generators targeted at invariant transitions as well as uniform random cases.

### Translating operation counts to limits

Big-O removes constants and lower-order terms.

A contest limit does not.

Two $O(n\log n)$ solutions may differ because one allocates nodes, one uses contiguous arrays, and one invokes an expensive comparator.

Estimate:

- how many dominant operations occur at maximum input;
- how expensive each operation is in the chosen language;
- whether input parsing or output volume dominates;
- whether total test-case bounds multiply the work;
- whether memory layout causes avoidable overhead.

Do not rely on a universal “operations per second” constant.

Measure representative code in the target environment when limits are close.

### Common growth-rate decisions

For $n$ near a few dozen, exponential subset or state search may be appropriate.

For $n$ near a few thousand, quadratic algorithms may or may not fit depending on constants and test totals.

For $n$ near hundreds of thousands, linear, $O(n\log n)$, or occasionally carefully optimized near-linear work is typical.

These are design heuristics, not judge-independent laws.

The statement's actual time limit, language multiplier, and operation type remain decisive.

### Memory arithmetic

Memory should be estimated in bytes before selecting a table.

A table with $n\times m$ 64-bit entries needs approximately

$$
8nm\text{ bytes}
$$

before container overhead.

A million Python integers consume far more than eight megabytes because each is an object referenced by a list.

A vector of vectors adds per-row allocations and metadata.

Rolling-array DP can reduce $O(nm)$ state to $O(m)$ only when earlier rows are no longer needed for reconstruction or transitions.

The recurrence invariant tells you whether that compression is legal.

### Recursive depth

A recursion with $O(n)$ calls uses $O(n)$ call-stack space even if the algorithm's explicit data structures are constant-sized.

On a degenerate tree or graph chain, that may exceed runtime limits.

An iterative stack preserves DFS semantics while moving storage to a controllable heap allocation.

Tail recursion should not be assumed to be optimized unless the language specification and implementation guarantee it.

## 6. Systems Connections

### Invariants are executable design contracts

The same reasoning used in contests appears in production systems.

A queue consumer maintains an offset invariant: every acknowledged position corresponds to work whose durability condition is satisfied.

A database index maintains an ordering and reachability invariant across updates.

A memory allocator maintains ownership and free-list invariants.

A distributed protocol maintains relationships among terms, epochs, or committed prefixes.

Production adds concurrency and failure, but it does not replace invariants; it makes them more important.

### Constraint reading becomes capacity planning

Contest constraints are fixed by the setter.

Production constraints come from traffic, latency objectives, cost budgets, and growth forecasts.

The same question applies: which complexity term dominates at the expected and worst supported scale?

An $O(n^2)$ reconciliation loop may be invisible at one hundred records and catastrophic at one million.

A theoretically optimal structure may lose when its allocation and synchronization costs dominate small requests.

The contest habit of writing down $n$, operation mix, and memory before coding transfers directly to capacity-aware design.

### Brute-force oracles become reference models

A slow, obvious solver is useful beyond contests.

It can validate optimized query engines on reduced datasets.

It can serve as a model in property-based tests.

It can compare protocol state transitions under randomized event sequences.

The reference implementation should prioritize clarity and independence from the optimized path.

Deleting it after the fast implementation passes a few examples discards a valuable regression tool.

### Determinism shortens debugging

Fixed random seeds, deterministic tie-breaking, and serialized failing inputs make defects repeatable.

This matters in a five-minute contest debug cycle and in a production incident.

Randomization can improve expected complexity or test coverage without sacrificing reproducibility when seeds are recorded.

Iteration order from hash-based containers should not be used as an undocumented tie-break rule.

When multiple outputs are accepted, validators should check the required property rather than one incidental ordering.

### Fast I/O and batching

Contest fast I/O reduces per-token overhead by buffering work.

Production systems use the same principle in batched database writes, network frames, and vectorized processing.

Batching changes latency, memory, and failure granularity.

Reading an entire contest input is safe only because the input size is bounded.

Reading an unbounded production stream into memory applies the technique outside its preconditions.

### Adversarial thinking

Judges concentrate edge cases into hidden tests.

Public APIs receive malformed inputs, worst-case keys, retries, and concurrent operations.

The defensive habit is similar:

- state assumptions explicitly;
- validate at trust boundaries;
- choose data structures with known worst cases;
- cap resource use;
- make partial failure distinguishable from valid emptiness;
- test degenerate shapes, not only average random data.

Contest code can trust a statement's input grammar.

Production code must identify who enforces the equivalent contract.

### Proof and observability complement each other

A proof covers the modeled algorithm.

Telemetry checks whether the deployed system stays inside that model.

For the traced window algorithm, pointer-movement counts can reveal an accidental reset that turns linear work quadratic.

For a heap algorithm, queue size and stale-pop counts expose update behavior.

For dynamic programming, state counts reveal an unexpectedly broad memoization key.

Observability does not prove correctness, but it detects violated assumptions and scale drift.

## 7. Practice Checklist

### Before solving

- Rewrite the task as inputs, outputs, and validity conditions.
- Note whether the answer is exact, approximate, counted modulo a value, or any valid witness.
- Record every individual and aggregate constraint.
- Identify whether values can be negative, repeated, zero, or near integer limits.
- Determine whether order matters.
- Determine whether updates and queries are online or can be reordered offline.
- Sketch a brute-force solution before optimizing.
- Estimate its operation count at maximum input.

### During algorithm selection

- Name the structural property that enables the optimization.
- Reject algorithms whose preconditions do not match the statement.
- State one invariant in a complete sentence.
- Prove initialization, maintenance, and termination.
- Derive time from total state transitions, not loop indentation.
- Derive memory in bytes for the chosen language representation.
- Decide whether answer reconstruction changes the required state.
- Check whether multiple test cases reuse or reset data.

### Before coding

- Fix one indexing convention.
- Define empty-range and no-solution behavior.
- Choose integer widths from aggregate bounds.
- Decide how ties are handled.
- Separate parsing, algorithm, and formatting when practical.
- Keep the optimized routine callable from tests.
- Identify recursion depth at the worst graph or tree shape.
- Reserve container capacity when bounds are known and allocation matters.

### While coding

- Make variable names reflect the invariant: `left`, `right`, `window_sum`, `best`.
- Update coupled state in one visible block.
- Avoid macros or abstractions that hide boundary changes.
- Keep debug output off standard output.
- Assert invariant facts in local testing where useful.
- Do not mutate a container while iterating unless the operation is defined and intended.
- Normalize modular subtraction before storing it.
- Cast before multiplication when widening is required.

### Testing ladder

1. Empty or minimum permitted input.
2. One-element cases that do and do not satisfy the target.
3. All-equal values.
4. Strictly increasing and strictly decreasing values.
5. Maximum values and overflow-sensitive aggregates.
6. No-solution and all-solution cases.
7. Cases that force every branch of the transition logic.
8. A hand trace matched against program state.
9. Random small cases compared with a brute-force oracle.
10. Maximum-shape performance cases.

### After a wrong answer

- Save the failing input before editing code.
- Minimize the input while preserving the failure.
- Compare the optimized state with the oracle after each transition.
- Identify the first violated invariant, not only the final wrong value.
- Check whether the proof assumed positivity, uniqueness, connectivity, or sortedness absent from the statement.
- Check integer width and language-specific comparison behavior.
- Re-read whether the output asks for a value, index, count, or witness.
- Add the minimized case to permanent local tests.

### After a time-limit failure

- Confirm the algorithm actually follows the claimed complexity.
- Count transitions or data-structure operations on a worst-shape input.
- Look for hidden copying, slicing, string construction, and repeated clearing.
- Check aggregate test-case limits.
- Replace per-operation allocation only after measuring it.
- Verify that hashing cannot be driven into a poor case relevant to the environment.
- Distinguish input overhead from algorithm time.
- Do not replace a correct algorithm with an unproved heuristic merely to gain speed.

### Topics to practice through invariants

- Binary search as false/true boundary maintenance.
- Prefix sums as processed-prefix summaries.
- Sliding windows under monotone add/remove effects.
- Monotonic stacks as unresolved nearest-element candidates.
- Disjoint sets as representative forests.
- Heaps as partial-order maintenance.
- Graph traversals as discovered/active/completed state transitions.
- Shortest paths as upper-bound relaxation.
- Dynamic programming as exact subproblem semantics.
- Greedy algorithms as exchange-preserving prefixes.

## 8. Frequently Asked Questions

### Should I start from the constraints or from the topic name?

Start from the mathematical task and constraints.

Topic labels are hints, not proofs.

Constraints eliminate impossible complexities and expose useful properties such as small state dimensions or bounded values.

### How precise must an invariant be?

Precise enough that a reviewer can decide whether it is true at a specific program point.

“The window is valid” is weak.

“`window_sum` equals the sum of `[left, right)`, and every earlier left endpoint has had its shortest feasible ending tested” is actionable.

### Is passing random tests a proof of correctness?

No.

Random differential tests are strong bug detectors over sampled inputs.

They do not establish behavior for all valid inputs.

Use them to challenge a proof and implementation, not replace the proof.

### Why keep a brute-force solution after finding the optimized one?

The brute-force version is an independent oracle for small cases.

It helps find counterexamples, validates refactors, and clarifies the original specification.

Its slowness at full scale is irrelevant to that role.

### How do I know whether a nested loop is quadratic?

Count total iterations of the inner body across the whole run.

If a pointer only advances from `0` to `n`, a nested `while` may contribute only $O(n)$ aggregate work.

If it resets for every outer iteration, quadratic work may be real.

### When is binary search on the answer valid?

When candidate answers form an ordered domain and a feasibility predicate changes monotonically from false to true or true to false.

You must prove that monotonicity and define which boundary the search returns.

### Should I always use the asymptotically fastest algorithm?

No.

Choose the simplest proved algorithm that fits the actual limits with adequate margin.

A complex lower-order improvement increases implementation risk and may have worse constants.

### How should total constraints across test cases be used?

Sum the algorithm's work over the per-case sizes under the stated aggregate bound.

For a linear algorithm, $\sum_i O(n_i)=O(\sum_i n_i)$.

For nonlinear work, the distribution of sizes matters and should be bounded carefully.

### What is the most common source of off-by-one errors?

Mixing interval conventions.

Choose inclusive `[l,r]` or half-open `[l,r)` semantics and derive lengths, loops, and prefix formulas from that choice.

Write the meaning next to the variables before optimizing syntax.

### How should recursion limits influence algorithm choice?

Determine the maximum recursion depth from the worst input shape, not the average shape.

If the language stack cannot safely support it, use an explicit stack or another traversal structure.

Changing a recursion setting does not reduce memory consumed per frame.

### What should I do when samples pass but the judge says wrong answer?

Construct or generate cases around every proof assumption and transition boundary.

Compare against a simpler oracle.

Locate the first state where the implementation diverges from the invariant rather than staring only at the final output.

### How much optimization should fast I/O receive?

Enough to keep parsing below the problem's budget, but no more.

Do not use an opaque template before confirming input is the bottleneck.

Keep parsing assumptions aligned with the exact format.

### How do invariants help under contest time pressure?

They reduce the number of states you must hold mentally.

Once the invariant is fixed, each line either initializes it, preserves it, or extracts the answer from it.

That makes both implementation and debugging more local.

### What should a post-contest review record?

Record the missed structural clue, the intended invariant, the first incorrect assumption, the minimized counterexample, and the final complexity derivation.

That creates a reusable recognition pattern without memorizing a problem-specific code dump.
