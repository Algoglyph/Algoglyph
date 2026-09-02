# Brute Force: Complete Search Spaces, Correct Baselines & Controlled Exhaustion

![Brute-force state-space exploration](/images/dsa/brute-force-dark.jpg#dark)

## 1. Historical Context & Motivation

Brute force solves a problem by examining every candidate permitted by a clearly defined search space.

It is sometimes dismissed as “trying everything,” but that phrase hides the algorithmic work that makes exhaustive search correct.

The candidate universe must be finite or otherwise bounded.

Every valid solution must be represented.

No candidate should be missed by the generator.

The verifier must accept exactly the candidates satisfying the specification.

The search must also stop according to a stated rule.

Long before modern computers, exhaustive enumeration appeared in combinatorial reasoning, code breaking, game analysis, and systematic case proofs.

Electronic computation made much larger enumerations possible.

It did not remove exponential growth.

Brute force remains useful because it provides a direct bridge from a mathematical definition to executable code.

For small inputs, the simplest complete method may be the safest production choice.

For larger inputs, an exhaustive solver is often a trusted oracle for testing an optimized algorithm.

It can reveal missing cases in a greedy rule.

It can validate dynamic-programming recurrences on small instances.

It can measure how much pruning a backtracking solver actually achieves.

It can establish that a proposed counterexample does or does not exist within a bounded domain.

Brute force is not one specific loop.

Different problems induce different candidate spaces.

Searching an array enumerates indices.

Subset selection enumerates $2^n$ inclusion masks.

Ordering problems enumerate $n!$ permutations.

Assignments of $n$ variables over a domain of size $d$ create $d^n$ candidates.

Graph path enumeration may be finite only after forbidding repeated vertices or imposing a length bound.

The candidate count, not the informal label “brute force,” determines feasibility.

A complete search can stop early for a decision or witness problem.

An optimization problem usually must examine every candidate unless a sound bound proves the remaining region cannot improve the incumbent.

Adding such pruning leads toward backtracking or branch and bound.

The unpruned enumerator still defines the correctness baseline.

Security-sensitive uses require special care.

A password search may be mathematically straightforward but legally and ethically constrained.

This article treats exhaustive search as a general algorithm design technique, not as authorization to attack systems.

Another practical risk is resource exhaustion.

An API accepting untrusted input must not launch an unbounded combinatorial search.

Budgets, cancellation, deadlines, and candidate-count estimates are part of a responsible implementation.

The central question is:

How can an exhaustive algorithm prove completeness, avoid accidental duplication, and expose its true computational cost before it runs?

## 2. Core Mathematical Invariants

Let $C(x)$ be the finite candidate set induced by input $x$.

Let $P(x,c)$ be the predicate that states whether candidate $c$ solves the problem.

A brute-force decision algorithm computes:

$$
\exists c\in C(x):P(x,c).
$$

An enumeration algorithm may instead return:

$$
\{c\in C(x)\mid P(x,c)\}.
$$

An optimization algorithm with score $f(x,c)$ computes a minimum or maximum over the feasible candidates.

### Coverage invariant

At iteration $k$, the generator has produced a well-defined prefix $C_k$ of the candidate traversal.

Every element of $C_k$ has been considered exactly as required by the algorithm.

When traversal finishes, $C_k=C(x)$.

Coverage is the foundation of completeness.

If the generator omits even one candidate, a valid witness may be missed.

### No-unjustified-acceptance invariant

Every returned witness has passed $P(x,c)$.

Generation alone is not proof of validity unless every generated candidate is valid by construction.

For example, permutation generation produces valid orderings by construction.

Testing whether an ordering satisfies scheduling constraints still requires a verifier.

### Decision-search invariant

For an existential decision problem, if a witness has not yet been found, every processed candidate has failed the predicate.

Returning `False` is justified only after all candidates have failed.

Returning `True` may occur immediately after the first accepted witness.

### Optimization incumbent invariant

For minimization, maintain an incumbent pair $(c^*,s^*)$.

After processing candidate prefix $C_k$:

$$
s^*=\min\{f(x,c):c\in C_k\text{ and }P(x,c)\}.
$$

If no feasible processed candidate exists, the incumbent is absent.

At exhaustion, the prefix is the entire candidate set, so the incumbent is globally optimal.

Tie policy is part of the contract.

Keeping the first minimum gives deterministic output when traversal order is deterministic.

Keeping all tied minima changes output space requirements.

### Representation uniqueness

Ideally each semantic candidate has exactly one representation.

Duplicates do not usually destroy correctness, but they waste time and can duplicate output.

For subsets of an indexed collection, an $n$-bit mask gives one representation per index subset.

If input values repeat, different index subsets may still have equal value sequences.

The application must distinguish index identity from value identity.

### Finite-bound invariant

The search domain must have a proven bound.

For a mask loop over $n$ items:

$$
0\le mask<2^n.
$$

For strings of length exactly $k$ over alphabet $\Sigma$:

$$
|C|=|\Sigma|^k.
$$

For lengths zero through $k$:

$$
|C|=\sum_{i=0}^{k}|\Sigma|^i.
$$

Without a finite length bound, string enumeration does not terminate.

### Cost decomposition

If candidate generation costs $G(c)$ and verification costs $V(c)$, total work is:

$$
T(x)=\sum_{c\in C(x)}(G(c)+V(c))
$$

for a complete run.

Writing only $O(|C|)$ can be misleading when each candidate takes $\Theta(n)$ to materialize or verify.

Subset enumeration that constructs each subset explicitly may cost $\Theta(n2^n)$.

### Budget invariant

A bounded production search tracks consumed work.

Before evaluating the next candidate, consumed work is at most the declared budget.

When the budget is exhausted, the result must distinguish “no solution exists” from “search incomplete.”

Returning `False` after a timeout is logically incorrect.

Use a separate outcome such as `UNKNOWN`, an exception, or a structured incomplete result.

### Symmetry invariant

Some candidate spaces contain equivalent states under rotation, reflection, label renaming, or order.

Symmetry breaking is safe only when each equivalence class retains at least one representative.

An unproved symmetry shortcut can silently violate completeness.

The plain brute-force space provides the reference against which such reductions are justified.

## 3. Step-by-Step Execution Trace

Consider the subset-sum instance:

$$
values=[3,1,4,2],\qquad target=6.
$$

Use a four-bit mask.

Bit $i$ indicates whether `values[i]` belongs to the candidate subset.

There are $2^4=16$ masks.

Traverse masks in ascending numeric order and stop at the first witness.

| Mask | Selected indices | Selected values | Sum | Decision |
|---|---|---|---:|---|
| `0000` | $\varnothing$ | $[]$ | 0 | reject |
| `0001` | $\{0\}$ | $[3]$ | 3 | reject |
| `0010` | $\{1\}$ | $[1]$ | 1 | reject |
| `0011` | $\{0,1\}$ | $[3,1]$ | 4 | reject |
| `0100` | $\{2\}$ | $[4]$ | 4 | reject |
| `0101` | $\{0,2\}$ | $[3,4]$ | 7 | reject |
| `0110` | $\{1,2\}$ | $[1,4]$ | 5 | reject |
| `0111` | $\{0,1,2\}$ | $[3,1,4]$ | 8 | reject |
| `1000` | $\{3\}$ | $[2]$ | 2 | reject |
| `1001` | $\{0,3\}$ | $[3,2]$ | 5 | reject |
| `1010` | $\{1,3\}$ | $[1,2]$ | 3 | reject |
| `1011` | $\{0,1,3\}$ | $[3,1,2]$ | 6 | accept |

The search returns indices $[0,1,3]$ and values $[3,1,2]$.

Masks `1100` through `1111` are not examined because the contract requests any witness.

At every rejected row, all previously processed masks are known not to solve the instance.

At mask `1011`, the verifier establishes the returned sum exactly.

If the question instead requested all subsets summing to six, early termination would be invalid.

The search would continue and also encounter mask `1100`, representing values $[4,2]$.

### Why the mask covers every index subset

Every subset $S\subseteq\{0,1,2,3\}$ has a characteristic vector.

Its bit $i$ is one exactly when $i\in S$.

That vector is a unique four-bit integer from 0 through 15.

Therefore the mask traversal is complete and duplicate-free for index subsets.

Equal values would not change this index-level proof.

### Optimization trace

Suppose the objective is to meet or exceed target 6 with minimum total sum.

The feasible masks with sums 6, 7, 8, and 10 compete for the incumbent.

When mask `0101` produces sum 7, it becomes the first incumbent.

Mask `0111` produces 8 and does not improve it.

Mask `1011` produces 6 and replaces it.

No feasible candidate can score below 6 because feasibility requires a sum of at least 6.

That problem-specific lower bound permits safe early termination at score 6.

Without the bound, exhaustion would be needed to prove optimality.

### Budgeted trace

If the budget allows only eight predicate evaluations, the decision run stops after mask `0111`.

No witness has appeared in the processed prefix.

The correct outcome is incomplete, not `False`.

The unprocessed mask `1011` is in fact a witness.

This example shows why operational cancellation must not be confused with mathematical nonexistence.

## 4. Production-Ready Implementations

The first implementation returns one subset of indices whose values sum to the target.

It rejects instance sizes that would make accidental exhaustive execution unreasonable for this API.

```python
from dataclasses import dataclass
from enum import Enum, auto
from typing import Iterable


class SearchStatus(Enum):
    FOUND = auto()
    EXHAUSTED = auto()
    INCOMPLETE = auto()


@dataclass(frozen=True)
class SubsetSearchResult:
    status: SearchStatus
    indices: tuple[int, ...] | None
    candidates_checked: int


def brute_force_subset_sum(
    values: Iterable[int],
    target: int,
    *,
    candidate_budget: int | None = None,
    maximum_items: int = 25,
) -> SubsetSearchResult:
    numbers = tuple(values)
    n = len(numbers)
    if n > maximum_items:
        raise ValueError("instance exceeds configured exhaustive-search limit")
    if candidate_budget is not None and candidate_budget < 0:
        raise ValueError("candidate budget must be nonnegative")

    checked = 0
    for mask in range(1 << n):
        if candidate_budget is not None and checked >= candidate_budget:
            return SubsetSearchResult(SearchStatus.INCOMPLETE, None, checked)

        checked += 1
        total = 0
        indices: list[int] = []
        for index, value in enumerate(numbers):
            if mask & (1 << index):
                total += value
                indices.append(index)

        if total == target:
            return SubsetSearchResult(
                SearchStatus.FOUND,
                tuple(indices),
                checked,
            )

    return SubsetSearchResult(SearchStatus.EXHAUSTED, None, checked)
```

The empty subset is a legitimate candidate.

Therefore target zero returns an empty witness immediately.

The API distinguishes a completed negative answer from a stopped search.

It also returns indices so duplicate input values remain unambiguous.

```python
result = brute_force_subset_sum([3, 1, 4, 2], 6)
assert result.status is SearchStatus.FOUND
assert result.indices == (0, 1, 3)
assert sum([3, 1, 4, 2][i] for i in result.indices) == 6

missing = brute_force_subset_sum([2, 4, 8], 7)
assert missing.status is SearchStatus.EXHAUSTED
assert missing.candidates_checked == 8

stopped = brute_force_subset_sum([3, 1, 4, 2], 6, candidate_budget=8)
assert stopped.status is SearchStatus.INCOMPLETE
assert stopped.candidates_checked == 8

zero = brute_force_subset_sum([5, -5], 0)
assert zero.status is SearchStatus.FOUND
assert zero.indices == ()
```

### Generic finite-space search

A reusable exhaustive-search primitive should accept an iterable rather than assume how candidates are encoded.

It should also permit cooperative cancellation without converting cancellation into a negative result.

```python
from collections.abc import Callable, Iterable
from typing import Generic, TypeVar


Candidate = TypeVar("Candidate")


@dataclass(frozen=True)
class SearchResult(Generic[Candidate]):
    status: SearchStatus
    witness: Candidate | None
    candidates_checked: int


def find_first(
    candidates: Iterable[Candidate],
    accepts: Callable[[Candidate], bool],
    *,
    should_cancel: Callable[[], bool] = lambda: False,
    candidate_budget: int | None = None,
) -> SearchResult[Candidate]:
    checked = 0
    for candidate in candidates:
        if should_cancel():
            return SearchResult(SearchStatus.INCOMPLETE, None, checked)
        if candidate_budget is not None and checked >= candidate_budget:
            return SearchResult(SearchStatus.INCOMPLETE, None, checked)
        checked += 1
        if accepts(candidate):
            return SearchResult(SearchStatus.FOUND, candidate, checked)
    return SearchResult(SearchStatus.EXHAUSTED, None, checked)
```

The generator may itself perform expensive work before yielding.

If prompt cancellation is required, cancellation must also be checked inside that generator.

Exceptions from the predicate are not silently converted into rejection.

That choice prevents data or programming errors from masquerading as “no witness.”

### Independent subset-sum test oracle

For small inputs, compare the mask implementation with combinations from the standard library.

```python
from itertools import combinations
from random import Random


def reference_subset_exists(values: tuple[int, ...], target: int) -> bool:
    return any(
        sum(values[index] for index in chosen) == target
        for size in range(len(values) + 1)
        for chosen in combinations(range(len(values)), size)
    )


rng = Random(41)
for n in range(9):
    for _ in range(150):
        values = tuple(rng.randrange(-8, 9) for _ in range(n))
        target = rng.randrange(-15, 16)
        actual = brute_force_subset_sum(values, target, maximum_items=10)
        expected = reference_subset_exists(values, target)
        assert (actual.status is SearchStatus.FOUND) == expected
        if actual.indices is not None:
            assert sum(values[i] for i in actual.indices) == target
```

### Input and operational safeguards

Estimate candidate count before allocating or launching work.

Do not compute an enormous materialized candidate list when streaming is possible.

Set deadlines at the request boundary as well as candidate budgets inside the loop.

Check cancellation often enough for the verifier's cost.

Cap output separately when enumerating all solutions.

Record whether the result is complete.

Avoid logging sensitive candidate values.

Do not parallelize a tiny search whose coordination cost exceeds verification work.

When parallelizing a large search, partition the space without gaps or overlaps and define deterministic winner selection if reproducibility matters.

## 5. Asymptotic Time & Space Complexity

Complexity follows from candidate count multiplied by per-candidate cost.

For linear search over $n$ array entries with $O(1)$ comparison cost, time is $O(n)$.

That method is brute force but not exponential.

For subset enumeration over $n$ indexed items, there are $2^n$ candidates.

The implementation scans all $n$ bits and may construct $O(n)$ indices per candidate.

Its worst-case time is:

$$
\Theta(n2^n).
$$

It stores one candidate's index list, so auxiliary space is $O(n)$ beyond the input.

If every solution is retained, output space can itself be $\Theta(n2^n)$.

Incrementally maintaining a subset sum across a Gray-code mask order can reduce arithmetic update work.

The candidate count remains $2^n$.

For permutations, the space contains $n!$ orderings.

Materializing or checking an ordering in $\Theta(n)$ time gives $\Theta(n\cdot n!)$ total time.

For $n$ variables each taking $d$ values, full assignment search examines $d^n$ candidates.

If verification costs $q(n)$, total time is $O(d^nq(n))$.

Early success changes observed runtime but not the worst-case bound.

An unsuccessful decision instance forces complete exhaustion.

Traversal order affects expected time when witnesses are distributed nonuniformly.

It does not affect the proof of the complete worst case.

A budget of $B$ candidate evaluations gives $O(B\cdot q(n))$ bounded runtime after setup.

The outcome may be incomplete.

Parallel execution across $p$ workers can ideally reduce elapsed candidate-processing time by a factor near $p$.

It does not reduce total work and rarely achieves perfect scaling.

Generation, communication, imbalance, cancellation, and shared-resource contention add overhead.

Exponential growth dominates constant-factor optimization.

At $n=20$, a subset space contains about one million masks.

At $n=40$, it contains about one trillion.

Doubling hardware throughput gains roughly one additional binary decision variable at the same runtime.

That calculation should guide feasibility decisions before implementation tuning.

## 6. Systems Connections

### Correctness oracles

Optimized algorithms often have subtle invariants.

A small exhaustive solver can compare outputs across thousands of random instances.

This differential-testing role is one of brute force's highest-value uses.

The oracle should be structurally independent from the optimized implementation to avoid sharing the same bug.

### Constraint solving

SAT, scheduling, and configuration problems can be viewed as assignment spaces plus predicates.

Modern solvers add propagation, learned constraints, bounds, and specialized branching.

The raw assignment enumerator remains the conceptual baseline for completeness.

### Cryptography and key search

Security parameters are chosen so exhaustive key search is infeasible under a threat model.

Estimating the space requires accounting for entropy, not merely nominal password length.

Rate limiting and memory-hard password hashing increase attack cost.

Legitimate auditing requires explicit authorization and controlled scope.

### Model checking

Finite-state systems can be explored exhaustively to find a state violating a property.

The challenge shifts from candidate generation to state explosion and duplicate-state detection.

Symbolic representations and partial-order reductions preserve coverage while compressing work.

### Game search

A complete game tree is an exhaustive search over legal move sequences.

Minimax summarizes terminal outcomes rather than merely finding any witness.

Alpha-beta pruning removes branches that cannot change the result while preserving minimax correctness.

### Fuzzing and combinatorial testing

Exhaustive enumeration is practical for small input alphabets and bounded lengths.

Pairwise and covering-array methods trade full combination coverage for manageable test suites.

The required assurance level determines whether that trade is acceptable.

### Database query planning

A query optimizer may enumerate possible join orders for a small number of relations.

Because order count grows factorially, larger queries require dynamic programming, pruning, or heuristics.

The cost model's accuracy matters as much as search completeness.

### Reproducibility

Deterministic candidate order makes failures replayable and tie behavior stable.

Parallel workers can preserve completeness while changing which witness arrives first.

If the witness identity is externally visible, define whether any witness or the first canonical witness is required.

### Denial-of-service boundaries

Combinatorial input parameters are resource multipliers.

Validate sizes before shifts, allocations, recursion, or task fan-out.

Enforce server-side budgets even when clients provide their own smaller limits.

Cancellation should propagate to generators, verifiers, and worker processes.

## 7. Practice Checklist

- Define the candidate set mathematically before coding.
- Prove every valid solution has a candidate representation.
- Decide whether representations are unique.
- Separate candidate generation from verification.
- State whether the task needs any witness, all witnesses, or an optimum.
- Define a deterministic traversal order where reproducibility matters.
- Include the empty candidate when the domain requires it.
- Distinguish index subsets from equal-valued subsets.
- Derive the candidate count.
- Include candidate-construction cost in runtime analysis.
- Include verifier cost in runtime analysis.
- Account for output size when returning every solution.
- Maintain an incumbent invariant for optimization.
- Specify tie handling for equal optima.
- Prove every pruning rule preserves at least one relevant candidate.
- Do not call an incomplete search unsuccessful.
- Return an explicit incomplete status after cancellation.
- Enforce a candidate budget.
- Enforce an elapsed-time deadline at the operation boundary.
- Check cancellation inside expensive generators and predicates.
- Estimate feasibility before starting.
- Avoid materializing the entire search space.
- Limit retained output independently from work budget.
- Test zero-size and one-candidate spaces.
- Test an instance whose witness is first.
- Test an instance whose witness is last.
- Test an unsatisfiable instance.
- Test duplicate input values.
- Test negative values where applicable.
- Compare an optimized solver against brute force on small random inputs.
- Keep the oracle implementation independent.
- Validate partition coverage before parallel search.
- Decide how parallel workers select among simultaneous witnesses.
- Bound untrusted combinatorial parameters.
- Avoid exposing sensitive candidates in logs.
- Document whether observed early exits affect only average behavior.
- Preserve exact arithmetic when the predicate requires it.
- Measure predicate cost separately from enumeration cost.
- Use symmetry breaking only with a completeness proof.
- Replace exhaustive search when growth exceeds the operational budget.

## 8. Frequently Asked Questions

### Is brute force always exponential?

No.

Linear search is exhaustive over array positions and runs in $O(n)$ time.

The complexity depends on the candidate space.

### Why use brute force when faster algorithms exist?

For small instances it can be easier to verify and maintain.

It is also valuable as a correctness oracle for testing faster methods.

### Does early exit improve the worst case?

Not for an existential search.

The witness may be last, or no witness may exist, forcing complete traversal.

### Can a timeout mean no solution exists?

No.

A timeout proves only that the configured run did not finish; the result must remain incomplete or unknown.

### Is generating every candidate enough for correctness?

Only if generated candidates are valid by construction and the task is pure enumeration.

Most search problems still need a correct acceptance predicate.

### How do I know the generator is complete?

Give a mapping from every semantic candidate to at least one generated representation.

A bijection, such as bit masks to index subsets, proves both coverage and uniqueness.

### Are duplicate candidates incorrect?

They may preserve the final decision but waste work and can duplicate returned results.

They also complicate probability and performance analysis.

### What is the difference between brute force and backtracking?

Plain brute force examines the full candidate space.

Backtracking builds partial candidates and abandons a branch after a sound constraint proves no completion can work.

### What is branch and bound?

It is an optimization-search technique that discards a region when a proven bound shows it cannot beat the incumbent.

The correctness of that bound is crucial.

### Does parallelism solve exponential growth?

No.

It offers at most a multiplicative speedup, while the candidate count may multiply by two with each additional binary variable.

### Should candidates be precomputed?

Usually not.

Streaming reduces memory, supports early exit, and permits cancellation.

### How should all-solution output be bounded?

Separate the search-completeness status from the number of results retained or returned.

Truncating output must be explicit even if the search itself completes.

### Can brute force prove optimality?

Yes, if every feasible candidate is covered and the final incumbent is compared against the entire space, or sound bounds justify skipped regions.

### What is a good maximum subset size?

There is no universal value.

It depends on verifier cost, latency budget, hardware, concurrency, and whether worst-case inputs are user-controlled.

### Why return indices for subset sum?

Indices preserve candidate identity when equal values occur multiple times.

Returning only values can make it unclear which input occurrences were selected.

### When should brute force be replaced?

Replace or augment it when the proven candidate count and verification cost exceed the available resource budget.

Choose dynamic programming, greedy methods, meet-in-the-middle, constraint propagation, or approximation only when their assumptions match the problem.
