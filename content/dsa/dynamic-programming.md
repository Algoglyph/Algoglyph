# Dynamic Programming: State Definitions, Transition Graphs & Overlap Control

![Dynamic programming state table](/images/dsa/dynamic-programming-dark.jpg#dark)

## 1. Historical Context & Motivation

Dynamic programming solves problems by reusing answers to overlapping subproblems.

The phrase comes from Richard Bellman's work on sequential decision processes.

In everyday algorithm design, DP means more than "recursion with a cache."

It means choosing states that summarize exactly the information future decisions need.

A brute-force recursive search may revisit the same situation many times.

DP names that situation as a state.

Then it computes the state once.

The saved value is reused whenever the same state appears again.

This is why Fibonacci is the classroom example.

Naive recursion recomputes the same smaller Fibonacci numbers repeatedly.

Memoization stores them.

But real DP problems are more interesting.

Edit distance stores the cost of converting prefixes.

Knapsack stores the best value for a prefix of items and remaining capacity.

Shortest paths in a DAG store the best distance after dependencies are resolved.

Sequence alignment stores best scores for prefix pairs.

The hard part is not filling a table.

The hard part is defining the table correctly.

A good state is small enough to compute and rich enough to make the next transition valid.

The central question is:

What information must be remembered so the rest of the problem no longer depends on the full past?

## 2. Core Mathematical Invariants

A DP solution has states, base cases, transitions, and an evaluation order.

A state is a compact description of a subproblem.

For 0/1 knapsack, a common state is:

$$
dp[i][w]
$$

meaning the best value obtainable using the first $i$ items with capacity $w$.

The state invariant must be precise.

If `dp[i][w]` accidentally means "considering item i" in one paragraph and "first i items" in code, the transition will drift.

For 0/1 knapsack, the transition is:

$$
dp[i][w] = \max(dp[i-1][w], value_i + dp[i-1][w-weight_i])
$$

when `weight_i <= w`.

The first term skips the item.

The second term takes the item.

Both depend only on row `i - 1`.

That dependency creates an acyclic state graph.

DP evaluation must respect this dependency order.

A state can be computed only after all states it depends on are known.

Memoized recursion computes states on demand.

Tabulation computes states in a planned order.

Both are valid when they obey the same recurrence.

Optimal substructure means an optimal answer can be assembled from optimal subproblem answers.

Overlapping subproblems mean many branches ask for the same state.

DP needs both.

If subproblems do not overlap, divide and conquer may be enough.

If optimal substructure fails, caching wrong summaries will not fix the model.

The core invariant is:

Every stored value must equal the answer to its stated subproblem.

Every transition must consider all legal ways the final decision can arise.

## 3. Step-by-Step Execution Trace

Use 0/1 knapsack with capacity `5`.

Items are:

| Item | Weight | Value |
|---:|---:|---:|
| 1 | 2 | 6 |
| 2 | 3 | 10 |
| 3 | 4 | 12 |

State `dp[i][w]` means best value using the first `i` items and capacity `w`.

Row `0` is all zero because no items are available.

For item `1` with weight `2` and value `6`, capacities `0` and `1` cannot take it.

Capacities `2` through `5` can take it.

Row `1` is:

```text
w:        0  1  2  3  4  5
dp[1][w]: 0  0  6  6  6  6
```

For item `2` with weight `3` and value `10`, capacity `3` can choose:

Skip item `2`: `dp[1][3] = 6`.

Take item `2`: `10 + dp[1][0] = 10`.

So `dp[2][3] = 10`.

At capacity `5`, choose:

Skip item `2`: `dp[1][5] = 6`.

Take item `2`: `10 + dp[1][2] = 16`.

So `dp[2][5] = 16`.

Row `2` is:

```text
w:        0  1  2  3  4  5
dp[2][w]: 0  0  6 10 10 16
```

For item `3` with weight `4` and value `12`, capacity `4` chooses:

Skip: `dp[2][4] = 10`.

Take: `12 + dp[2][0] = 12`.

So `dp[3][4] = 12`.

At capacity `5`, choose:

Skip: `dp[2][5] = 16`.

Take: `12 + dp[2][1] = 12`.

So `dp[3][5] = 16`.

The final answer is `16`.

It comes from taking items `1` and `2`.

The trace shows the DP habit:

Do not ask "what seems best now?"

Ask "which previously solved states define this state?"

Now trace edit distance for the prefixes `cat` and `cut`.

The goal is to convert one string into the other using insertion, deletion, and replacement.

The state `dp[i][j]` means the cost to convert the first `i` characters of `cat` into the first `j` characters of `cut`.

The first row represents converting the empty prefix into a prefix of `cut`.

That requires insertions.

The first column represents converting a prefix of `cat` into the empty string.

That requires deletions.

For the first characters, `c` matches `c`.

So `dp[1][1] = dp[0][0] = 0`.

For prefixes `ca` and `cu`, the last characters differ.

The transition considers delete, insert, and replace.

Replacing `a` with `u` gives cost `1`.

For full strings `cat` and `cut`, the final `t` matches `t`.

So the last state inherits the diagonal value.

The final edit distance is `1`.

The important point is not the number itself.

The important point is that a prefix-pair state fully summarizes the past.

Once the algorithm knows `dp[i][j]`, it does not need the full edit script that produced it unless reconstruction is requested.

A third way to view the table is as a directed acyclic graph of states.

Each cell points to the cells it depends on.

For edit distance, `dp[i][j]` may depend on `dp[i-1][j]`, `dp[i][j-1]`, and `dp[i-1][j-1]`.

Those arrows all move toward smaller prefixes.

That is why filling rows from top to bottom and left to right works.

For a different recurrence, the correct fill order may be diagonal, reverse, or based on graph topological order.

The table shape alone does not decide the loop order.

The dependency arrows do.

## 4. Production-Ready Implementations

The tabulated knapsack implementation below stores only one row.

It iterates capacities backward so each item is used at most once.

```python
def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    if len(weights) != len(values):
        raise ValueError("weights and values must have equal length")
    if capacity < 0:
        raise ValueError("capacity must be nonnegative")
    if any(weight <= 0 for weight in weights):
        raise ValueError("weights must be positive")

    dp = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for remaining in range(capacity, weight - 1, -1):
            dp[remaining] = max(dp[remaining], value + dp[remaining - weight])
    return dp[capacity]


assert knapsack_01([2, 3, 4], [6, 10, 12], 5) == 16
assert knapsack_01([1, 2, 3], [6, 10, 12], 0) == 0
assert knapsack_01([5], [99], 4) == 0
```

The backward loop is not a micro-optimization.

It is the invariant that prevents reusing the same item multiple times in one row.

For unbounded knapsack, the capacity loop goes forward instead.

Reconstructing choices requires extra information.

A compressed one-row DP can compute the best value but may not preserve enough history to list the selected items cleanly.

If reconstruction is required, store parent choices or keep the full table.

That is not wasteful when the product needs the actual solution, not only its value.

Memoization is often clearer when only a small portion of the state graph is reachable.

```python
from functools import cache


def edit_distance(a: str, b: str) -> int:
    @cache
    def solve(i: int, j: int) -> int:
        if i == len(a):
            return len(b) - j
        if j == len(b):
            return len(a) - i
        if a[i] == b[j]:
            return solve(i + 1, j + 1)
        return 1 + min(
            solve(i + 1, j),
            solve(i, j + 1),
            solve(i + 1, j + 1),
        )

    return solve(0, 0)


assert edit_distance("kitten", "sitting") == 3
assert edit_distance("", "abc") == 3
assert edit_distance("same", "same") == 0
```

Production DP code should name state dimensions plainly.

It should document iteration order when space compression is used.

It should also guard input sizes because state spaces can grow quickly.

An $O(nW)$ knapsack table is not safe when `W` comes from an unbounded user value.

The transition direction should be reviewed as part of code correctness.

In 0/1 knapsack, forward capacity iteration accidentally turns the algorithm into unbounded knapsack.

The code may still pass small happy-path tests.

It fails when taking the same item twice becomes attractive.

For example, one item with weight `2`, value `5`, and capacity `4` should produce `5` in 0/1 knapsack.

A mistaken forward loop produces `10`.

That is a state-ordering bug, not a syntax bug.

Memoized recursion has its own failure mode.

If the state key omits information that affects future choices, the cache returns answers for the wrong subproblem.

If the state key includes irrelevant history, the cache becomes too large and overlap disappears.

For example, a path-counting DP on a grid usually needs only `(row, column)`.

Including the entire path prefix in the state prevents reuse.

Excluding whether a cell has been visited in a problem that forbids revisits may make the recurrence incorrect.

State design is the algorithm.

## 5. Asymptotic Time & Space Complexity

DP complexity is usually the number of states times the transition cost per state.

For 0/1 knapsack with $n$ items and capacity $W$, there are $n(W+1)$ conceptual states.

Each state considers a constant number of choices.

The full-table time complexity is:

$$
O(nW).
$$

The one-row implementation still does $O(nW)$ work.

Its auxiliary space is:

$$
O(W).
$$

This is pseudo-polynomial.

The complexity depends on the numeric capacity, not just the number of bits needed to write it.

Edit distance over strings of lengths $n$ and $m$ has $nm$ states.

Each state considers at most three operations.

Its time complexity is $O(nm)$.

Its memo table or tabulation table uses $O(nm)$ space unless compressed.

Space compression is valid only when future transitions no longer need overwritten states.

For knapsack, backward iteration preserves the previous-row values.

For edit distance, row compression must preserve left, up, and diagonal information.

Reconstruction changes the space discussion.

The value-only answer can often be compressed.

The actual selected path may need parent pointers.

For edit distance, producing the edit script requires remembering whether each state came from insert, delete, replace, or match.

For knapsack, producing item choices requires remembering which item decisions created the final value.

Some implementations recompute choices by walking the original full table.

Some store compact parent directions.

Some rerun parts of the DP during reconstruction.

Each choice changes memory or runtime.

The general formula is:

$$
time = states \times transitionCost.
$$

That formula is more reliable than memorizing individual DP results.

A second useful classification is pseudo-polynomial versus polynomial.

Knapsack with numeric capacity $W$ is $O(nW)$.

If $W$ is encoded in binary, the number of bits needed to write it is $\log W$.

That means $O(nW)$ is not polynomial in the encoded input length.

Edit distance $O(nm)$ is polynomial in the string lengths.

This distinction matters in complexity theory and in production APIs that accept large numeric budgets.

## 6. Systems Connections

Dynamic programming appears in compilers, bioinformatics, robotics, caching, and planning.

Compilers use DP in instruction selection and parsing.

Bioinformatics uses sequence alignment, which is an edit-distance-like DP with domain-specific scoring.

Robotics and control systems use value iteration over state spaces.

Search systems use DP-like recurrence in ranking, segmentation, and decoding problems.

The Viterbi algorithm is DP over hidden states and observation positions.

Resource allocation systems use knapsack-like models.

A scheduler may choose jobs under capacity constraints.

A cache may choose objects under memory constraints, though real cache policies often require online approximations.

The systems risk is state explosion.

Adding one more dimension can multiply memory and runtime.

A DP over users, time, budget, and inventory can become impossible quickly.

Good production DP starts with state minimization.

Remove information that does not affect future decisions.

Compress dimensions only after proving the dependency order permits it.

If the state graph is sparse, memoization can avoid unreachable states.

If nearly every state is needed, tabulation often has lower overhead.

DP also interacts with numeric safety.

Counts may overflow fixed-width integers.

Floating-point scoring can accumulate precision error.

Sentinel values such as infinity must be chosen so transitions cannot overflow them accidentally.

Some DP problems have monotonicity or convexity that enables further optimization.

Divide-and-conquer DP optimization, Knuth optimization, and monotone queues all exploit extra recurrence structure.

Those techniques are not automatic.

They require proof that the required ordering property holds.

Applying them because a table is slow can silently produce wrong answers.

Start with the clear recurrence.

Optimize only after the invariant is stable and tested.

DP is also common in dynamic resource allocation.

Autoscaling, admission control, and budget allocation often resemble constrained optimization.

The exact production systems may use heuristics, linear programming, or online algorithms instead of textbook DP.

Still, DP provides the clean baseline model.

It clarifies which information is state, which choices are legal, and which objective is being optimized.

That clarity is useful even when the final system uses an approximation.

## 7. Practice Checklist

- Define the state in one precise sentence.
- State what each dimension means.
- Write base cases before transitions.
- Prove the transition covers every legal final choice.
- Check that every transition depends on already-computed states.
- Draw the state dependency graph for confusing problems.
- Count states.
- Count transition work per state.
- Distinguish memoization from tabulation.
- Use memoization when reachable states are sparse.
- Use tabulation when evaluation order is simple and dense.
- Compress space only after proving overwritten states are no longer needed.
- For 0/1 knapsack one-row DP, iterate capacity backward.
- For unbounded knapsack one-row DP, iterate capacity forward.
- Test minimum-size inputs.
- Test impossible cases.
- Test ties between choices.
- Test reconstruction separately from value computation.
- Guard state-space size for user-controlled inputs.
- Avoid calling every recursion-with-cache "DP" without a state invariant.
- Decide whether the caller needs only the optimal value or also the choices.
- Store parent pointers when reconstruction is required.
- Add a test that catches wrong capacity-loop direction.
- Verify sentinel infinity values cannot overflow during transitions.
- Separate state definition from storage optimization.
- Treat pseudo-polynomial bounds honestly.
- Draw dependency arrows before choosing loop order.
- Keep state keys minimal but complete.
- Do not apply DP optimizations without their required monotonicity or quadrangle conditions.
- Compare memoized and tabulated results on small exhaustive inputs.
- Use brute force as an oracle for tiny cases when designing a new recurrence.
- Check empty-prefix rows explicitly.
- Check zero-capacity columns explicitly.
- Test impossible states separately from low-value states.

## 8. Frequently Asked Questions

### Is dynamic programming just memoization?

No.

Memoization is one implementation strategy.

DP is the state-and-transition method that makes memoization or tabulation correct.

### What is the hardest part of DP?

Choosing the state.

The state must remember enough information for future choices while staying small enough to compute.

### What is optimal substructure?

It means an optimal answer can be built from optimal answers to smaller subproblems.

### What are overlapping subproblems?

They are repeated states reached through multiple branches of the computation.

Caching helps only when overlap exists.

### Why does 0/1 knapsack iterate backward in one-row DP?

Backward iteration prevents the current item from being used more than once in the same item pass.

### Is $O(nW)$ polynomial?

It is pseudo-polynomial.

It depends on numeric capacity $W$, not only on input encoding length.

### When should I prefer tabulation?

Prefer it when the state space is dense and the dependency order is easy to express.

### When should I prefer memoization?

Prefer it when many possible states are unreachable or recursion expresses the dependency structure more clearly.

### What should I draw for a DP diagram?

Draw state dimensions, base cases, arrows showing dependencies, and the order in which states become valid.
