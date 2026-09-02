# Constraint Backtracking: Reversible State, Pruning & Complete Search

![Constraint Backtracking: Reversible State, Pruning & Complete Search](/images/dsa/backtracking-dark.jpg#dark)

## 1. Historical Context & Motivation

Some computational problems ask for one assignment satisfying many interacting constraints.

A locally reasonable choice can make a later requirement impossible.

When that happens, an algorithm must identify which decision created the dead end, undo it, and try an alternative.

**Backtracking** organizes this process as a depth-first search over partial assignments.

It extends a valid prefix, detects failure as early as possible, and restores state before exploring the next branch.

The method appears in puzzles, parsers, theorem provers, scheduling systems, configuration engines, exact combinatorial optimization, and constraint-satisfaction solvers.

Its roots predate modern programming terminology.

Systematic trial with reversible choices is a natural method for combinatorial search.

The word “backtrack” became associated with algorithmic search as early programming languages and symbolic computation made such procedures explicit.

Backtracking is not synonymous with “try every complete candidate.”

Brute-force enumeration might generate every length-$n$ assignment and validate only at the end.

A backtracking solver checks constraints on each prefix.

If a prefix cannot possibly lead to a solution, it discards the entire subtree beneath that prefix.

This early rejection is **pruning**.

Consider placing $n$ queens on an $n\times n$ chessboard so no two attack each other.

A naive binary enumeration considers whether to occupy each of $n^2$ squares.

That space has $2^{n^2}$ subsets before cardinality and attack constraints are applied.

A better formulation places exactly one queen per row.

At row $r$, it tries only columns not already attacked.

The search depth becomes $n$, and an illegal partial placement is abandoned immediately.

Representation choice can be more important than a clever recursive syntax.

Backtracking still has exponential worst cases.

Pruning can change the practical search tree dramatically without changing that worst-case classification.

A solver that is fast on one instance family may be slow on another because branch ordering determines how quickly contradictions or solutions appear.

The method must therefore be evaluated through:

- correctness of state transitions;
- completeness of the explored choices;
- soundness of pruning;
- restoration after every branch;
- search-tree size on representative inputs;
- resource limits and cancellation behavior.

The most dangerous implementation bug is not always a missed optimization.

It is state leakage: one failed branch leaves a mutation behind, causing a later branch to be rejected or accepted incorrectly.

The central engineering idea is:

**make a choice, establish the next invariant, recurse, and undo exactly that choice before considering a sibling.**

## 2. Core Mathematical Invariants

### Search state as a partial assignment

Let variables be:

$$
X_0,X_1,\ldots,X_{n-1}.
$$

Each variable $X_i$ has a domain $D_i$.

A complete solution assigns one value from each domain while satisfying every constraint.

At depth $k$, a conventional backtracking state assigns:

$$
X_0,\ldots,X_{k-1}
$$

and leaves the remaining variables undecided.

The prefix invariant is:

> every constraint whose required variables are already assigned is satisfied.

If a constraint is violated by the current prefix, adding more assignments cannot repair that prefix when assignments are immutable choices.

The solver may prune it soundly.

### Choice partition

At any search node, the outgoing branches must represent all legal next assignments exactly once.

If the next variable is $X_k$, the branch set is some filtered domain:

$$
C_k\subseteq D_k.
$$

Filtering is sound only if every removed value is proven unable to extend to a solution.

Filtering is complete if every value that could extend to a solution remains represented.

Duplicating a choice wastes work.

Omitting a viable choice makes the solver incomplete.

### Make–recurse–undo symmetry

Let state before a choice be $S$.

Let `apply(S, c)` produce state $S'$ for choice $c$.

After the recursive call returns, `undo(S', c)` must restore an observationally equivalent $S$:

$$
undo(apply(S,c),c)\equiv S.
$$

The equivalence covers every mutable structure consulted by sibling branches.

For N-Queens, it includes:

- the chosen column for the current row;
- the occupied-column set;
- the occupied descending-diagonal set;
- the occupied ascending-diagonal set.

Undoing only the board marker while retaining a diagonal bit corrupts the remaining search.

### N-Queens conflict encoding

Represent a queen at row $r$ and column $c$.

Two queens share a column if their $c$ values are equal.

They share one diagonal when:

$$
r-c
$$

is equal.

They share the other diagonal when:

$$
r+c
$$

is equal.

An array representation `placement[r] = c` already guarantees one queen per assigned row.

The prefix is legal exactly when all selected columns, all $r-c$ values, and all $r+c$ values are distinct.

### Bit-mask transition

For $n$ small enough to fit the implementation's integer policy, bit masks encode attacked columns.

Let `full = (1 << n) - 1` mark the $n$ usable columns.

At one row, maintain:

- `columns`: columns occupied by earlier queens;
- `diag_down`: columns attacked on this row by one diagonal direction;
- `diag_up`: columns attacked by the other direction.

Available positions are:

$$
available=full\;\&\;\neg(columns\;|\;diagDown\;|\;diagUp).
$$

Masking with `full` removes the unbounded leading ones produced by integer bitwise negation.

Choosing the lowest available bit:

```text
bit = available & -available
```

isolates one candidate column.

For the next row, diagonal attacks shift one column:

```text
next_down = ((diag_down | bit) << 1) & full
next_up   =  (diag_up   | bit) >> 1
```

The exact names are conventional; correctness depends on consistent shifts rather than which slash direction receives which name.

### Sound pruning

A pruning predicate $P(S)$ is sound when:

$$
P(S)=true\implies S\text{ has no solution extension}.
$$

Examples include:

- a chosen N-Queens column is already attacked;
- a Sudoku cell has an empty candidate set;
- a partial sum exceeds a nonnegative target;
- a scheduling prefix already violates a hard capacity constraint;
- a branch-and-bound lower bound is no better than the best known solution.

The last example requires care.

An incorrect bound can prune the optimal solution while still returning a plausible answer.

### Termination and progress

Every recursive step must advance a well-founded measure.

For row-by-row N-Queens, the row index increases from `0` to `n`.

At `row == n`, every row has one legal queen, so the state is a complete solution.

Because each depth has finitely many choices and depth is bounded, the search terminates.

### Completeness proof skeleton

Assume a valid solution $Q$ exists.

At row zero, the solver tries every column legal for an empty prefix, including $Q_0$.

Suppose it reaches the prefix $Q_0,\ldots,Q_{r-1}$.

Because $Q$ is valid, $Q_r$ is not attacked by that prefix.

Therefore the branch for $Q_r$ remains in the available set.

By induction, the solver can follow all choices in $Q$ and reaches depth $n$.

Thus exhaustive traversal finds every solution, provided pruning removes only conflicts implied by assigned queens.

### First solution versus all solutions

A solver returning the first solution can stop as soon as a complete assignment is found.

An enumerator must continue after recording that assignment.

The return contract changes control flow.

A boolean “found” result is useful for early exit.

A callback or generator is useful for enumeration without storing every solution.

Counting can avoid materializing assignments entirely.

## 3. Step-by-Step Execution Trace

### Problem instance

Solve the four-queens problem.

Columns use zero-based indices.

A placement tuple lists the chosen column for each completed row.

The expected two solutions are:

```text
(1, 3, 0, 2)
(2, 0, 3, 1)
```

The trace follows ascending columns and shows both failure and recovery.

### Begin at row 0

The empty prefix is `()`.

No column or diagonal is attacked.

Candidate columns are `0, 1, 2, 3`.

Choose column `0` first.

State becomes:

```text
placement = (0,)
columns = {0}
down diagonals = {0 - 0 = 0}
up diagonals = {0 + 0 = 0}
```

### Row 1 under prefix `(0,)`

Column `0` is occupied.

Column `1` shares a diagonal because `1 - 1 = 0`.

Columns `2` and `3` are legal.

Try `2` first.

Prefix becomes `(0, 2)`.

### Row 2 under prefix `(0, 2)`

Test each column:

- `0` is occupied;
- `1` is attacked by the queen at `(1,2)`;
- `2` is occupied;
- `3` is attacked by the queen at `(1,2)`.

The candidate set is empty.

This prefix cannot extend to a solution.

Backtrack from row 2.

Undo the queen at `(1,2)` completely.

The state must again represent only `(0,)`.

### Try row 1 column `3`

Column `3` is the next candidate under `(0,)`.

Prefix becomes `(0, 3)`.

At row 2, column `1` is legal, producing `(0, 3, 1)`.

At row 3, inspect all columns:

- `0` is occupied by row 0;
- `1` is occupied by row 2;
- `2` is attacked diagonally by row 2 column 1;
- `3` is occupied by row 1.

No candidate remains.

Undo row 2 column `1`.

No other row 2 candidate exists.

Undo row 1 column `3`.

No other row 1 candidate exists under `(0,)`.

Undo row 0 column `0`.

The entire subtree beginning with column zero is proven unsatisfiable.

### Choose row 0 column `1`

State becomes `(1,)`.

At row 1, ascending candidate inspection leaves only column `3`.

Choose it to obtain `(1, 3)`.

At row 2, column `0` is legal.

Choose it to obtain `(1, 3, 0)`.

At row 3, column `2` is legal.

Choose it to obtain:

```text
(1, 3, 0, 2)
```

Depth reaches four.

The prefix invariant now covers every row, so this is a complete solution.

An all-solutions enumerator records it and backtracks.

### Continue after the first solution

Undo row 3 column `2`.

There is no other candidate for row 3.

Undo row 2 column `0`.

There is no other candidate for row 2 under `(1,3)`.

Undo row 1 column `3`, then row 0 column `1`.

The state becomes empty again.

### Explore row 0 column `2`

By symmetry, a different branch succeeds:

```text
row 0 -> column 2
row 1 -> column 0
row 2 -> column 3
row 3 -> column 1
```

The second complete placement is:

```text
(2, 0, 3, 1)
```

### Finish row 0 column `3`

The remaining subtree mirrors the failed column-zero subtree and contains no solution.

After it is exhausted, the root has no untried choice.

Search terminates with exactly two solutions.

### Trace table

| Event | Prefix | Result |
| --- | --- | --- |
| choose | `(0,)` | legal prefix |
| choose | `(0,2)` | legal prefix |
| prune | `(0,2)` at row 2 | no available column |
| choose | `(0,3,1)` | legal prefix |
| prune | `(0,3,1)` at row 3 | no available column |
| undo | `()` after exhausting `0` | state restored |
| choose | `(1,3,0,2)` | first solution |
| undo | `()` after exhausting `1` | continue enumeration |
| choose | `(2,0,3,1)` | second solution |
| finish | `()` | all root branches exhausted |

The trace demonstrates that backtracking does not erase knowledge globally.

It returns to the nearest decision with an untried alternative while preserving the proof that completed sibling branches contain no solution.

## 4. Production-Ready Implementations

The first implementation exposes a reusable, cancellation-aware N-Queens enumerator.

It uses integer masks, yields immutable tuples, validates input, and avoids storing all solutions unless the caller chooses to collect them.

```python
from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass


class SearchCancelled(RuntimeError):
    pass


@dataclass(slots=True)
class SearchStats:
    visited_states: int = 0
    pruned_states: int = 0
    solutions: int = 0


def n_queens_solutions(
    n: int,
    *,
    cancelled: Callable[[], bool] = lambda: False,
    stats: SearchStats | None = None,
) -> Iterator[tuple[int, ...]]:
    if isinstance(n, bool) or not isinstance(n, int):
        raise TypeError("n must be an integer")
    if n < 0:
        raise ValueError("n must be nonnegative")
    if n > 32:
        raise ValueError("n above 32 is rejected by this operational policy")

    metrics = stats if stats is not None else SearchStats()
    full = (1 << n) - 1
    placement = [0] * n

    def search(
        row: int,
        columns: int,
        diag_down: int,
        diag_up: int,
    ) -> Iterator[tuple[int, ...]]:
        if cancelled():
            raise SearchCancelled("search was cancelled")
        metrics.visited_states += 1
        if row == n:
            metrics.solutions += 1
            yield tuple(placement)
            return

        available = full & ~(columns | diag_down | diag_up)
        if available == 0:
            metrics.pruned_states += 1
            return

        while available:
            bit = available & -available
            available ^= bit
            placement[row] = bit.bit_length() - 1
            yield from search(
                row + 1,
                columns | bit,
                ((diag_down | bit) << 1) & full,
                (diag_up | bit) >> 1,
            )

    yield from search(0, 0, 0, 0)


def validate_queen_solution(solution: tuple[int, ...]) -> None:
    n = len(solution)
    if any(isinstance(column, bool) or not isinstance(column, int) for column in solution):
        raise AssertionError("columns must be integers")
    if any(column < 0 or column >= n for column in solution):
        raise AssertionError("column is outside the board")
    if len(set(solution)) != n:
        raise AssertionError("two queens share a column")
    down = {row - column for row, column in enumerate(solution)}
    up = {row + column for row, column in enumerate(solution)}
    if len(down) != n or len(up) != n:
        raise AssertionError("two queens share a diagonal")
```

### Deterministic solution and count checks

Known counts provide strong regression tests for the enumerator.

The empty board has one empty placement, while boards of sizes two and three have none.

```python
known_counts = {
    0: 1,
    1: 1,
    2: 0,
    3: 0,
    4: 2,
    5: 10,
    6: 4,
    7: 40,
    8: 92,
}

for size, expected_count in known_counts.items():
    metrics = SearchStats()
    solutions = list(n_queens_solutions(size, stats=metrics))
    assert len(solutions) == expected_count
    assert metrics.solutions == expected_count
    for solution in solutions:
        validate_queen_solution(solution)

assert list(n_queens_solutions(4)) == [(1, 3, 0, 2), (2, 0, 3, 1)]
```

### A generic finite-domain backtracking kernel

Not every problem maps naturally to queen masks.

The next function separates variable choice, candidate generation, mutation, undo, completion, and snapshot policies.

Its callbacks make lifecycle obligations explicit.

It is intentionally single-threaded; shared callback state requires synchronization if parallel branches are introduced.

```python
from collections.abc import Callable, Iterable, Iterator
from typing import TypeVar

State = TypeVar("State")
Choice = TypeVar("Choice")
Result = TypeVar("Result")


def backtrack(
    state: State,
    *,
    complete: Callable[[State], bool],
    choices: Callable[[State], Iterable[Choice]],
    apply: Callable[[State, Choice], None],
    undo: Callable[[State, Choice], None],
    snapshot: Callable[[State], Result],
    cancelled: Callable[[], bool] = lambda: False,
) -> Iterator[Result]:
    if cancelled():
        raise SearchCancelled("search was cancelled")
    if complete(state):
        yield snapshot(state)
        return

    for choice in choices(state):
        apply(state, choice)
        try:
            yield from backtrack(
                state,
                complete=complete,
                choices=choices,
                apply=apply,
                undo=undo,
                snapshot=snapshot,
                cancelled=cancelled,
            )
        finally:
            undo(state, choice)
```

The `finally` block restores state even if a consumer stops iteration, cancellation raises, or a deeper callback fails.

That is stronger than placing `undo` after the recursive call, because generators can be closed before normal return.

### Verify the generic kernel on permutations

This small state produces permutations without duplicate choices.

It demonstrates that snapshots must copy mutable state rather than expose the same list repeatedly.

```python
@dataclass
class PermutationState:
    remaining: list[int]
    prefix: list[int]


state = PermutationState([1, 2, 3], [])


def permutation_choices(current: PermutationState) -> list[int]:
    return list(current.remaining)


def choose(current: PermutationState, value: int) -> None:
    current.remaining.remove(value)
    current.prefix.append(value)


def unchoose(current: PermutationState, value: int) -> None:
    popped = current.prefix.pop()
    if popped != value:
        raise AssertionError("undo order was corrupted")
    current.remaining.append(value)
    current.remaining.sort()


permutations = list(
    backtrack(
        state,
        complete=lambda current: not current.remaining,
        choices=permutation_choices,
        apply=choose,
        undo=unchoose,
        snapshot=lambda current: tuple(current.prefix),
    )
)

assert permutations == [
    (1, 2, 3),
    (1, 3, 2),
    (2, 1, 3),
    (2, 3, 1),
    (3, 1, 2),
    (3, 2, 1),
]
assert state == PermutationState([1, 2, 3], [])
```

### Operational safeguards

A public solver should bound input size, state count, wall time, output count, or some combination.

Cancellation checks should occur frequently enough to stop expensive branches.

Callbacks should not receive authority they do not need.

Untrusted predicates must not be executed inside a privileged process.

Streaming solutions avoids retaining an exponential output set.

Search statistics should distinguish visited states, pruned states, complete solutions, and cancellation.

Deterministic choice order improves reproducibility.

Randomized order can be useful for finding one solution but should accept an explicit seed.

## 5. Asymptotic Time & Space Complexity

### Search-tree model

Let depth be $d$ and let level $i$ have branching factor $b_i$ after pruning.

The number of complete root-to-leaf combinations is bounded by:

$$
\prod_{i=0}^{d-1} b_i.
$$

If every level has at most $b$ choices, this becomes $O(b^d)$.

That is an upper bound, not a prediction of actual runtime.

Constraint propagation can make many $b_i$ values small or zero.

### N-Queens

Row-by-row placement never reuses a column.

Ignoring diagonal pruning, the search explores at most:

$$
n!
$$

column permutations rather than $n^n$ arbitrary row assignments.

Diagonal checks reduce the explored set further, but the worst-case growth remains superpolynomial and commonly described with the $O(n!)$ upper bound for this formulation.

Bit masks make candidate computation and one transition constant-time in the machine-integer model for bounded $n$.

For unbounded big integers, bit-operation cost grows with the number of machine words representing the mask.

### Output-sensitive lower bound

Enumerating all $S$ solutions requires at least $\Omega(Sn)$ time if each length-$n$ placement is materialized.

No pruning technique can avoid the cost of emitting requested output.

Counting can be cheaper in memory because it accumulates an integer rather than storing every tuple.

### Space

Depth-first backtracking keeps one active path.

The N-Queens recursion depth is $n$.

The placement array uses $O(n)$ space.

The masks use $O(1)$ machine words under the article's explicit `n <= 32` policy.

Thus auxiliary space is $O(n)$, excluding yielded solutions.

The generic kernel's space depends on state representation and undo logs.

Copying the entire state at every branch can require $O(d\cdot |S|)$ memory along one path.

In-place mutation with exact undo usually needs $O(d)$ decision records plus the shared state.

### Constraint-check cost

If checking one candidate costs $C$, total time is proportional to visited candidate edges times $C$.

Scanning all earlier queens makes $C=O(n)$.

Sets reduce membership checks to expected $O(1)$.

Bit masks provide bounded integer operations and reduce allocation.

Optimization should target both tree size and per-node work.

### Heuristic ordering

For all-solutions enumeration, reordering choices does not remove valid leaves, so the full worst-case node count can remain exponential.

For first-solution search, ordering can change runtime by orders of magnitude.

Choosing the most constrained variable often reveals contradictions early.

Trying the least constraining value can preserve options for the remaining variables.

These are heuristics, not universal complexity guarantees.

### Memoization distinction

Backtracking revisits states when different decision sequences lead to the same subproblem.

Memoizing those states transforms the approach toward dynamic programming or graph search.

Memoization is valid only if the cache key captures all future-relevant state.

Caching on an incomplete key can return incorrect feasibility results.

## 6. Systems Connections

### Constraint programming

General CSP solvers combine backtracking with domain propagation.

Assigning one variable removes inconsistent values from neighbors.

If any domain becomes empty, the branch fails before all variables are assigned.

Maintaining arc consistency performs more work per node in exchange for a smaller search tree.

Modern solvers also learn from conflicts rather than merely returning to the immediately previous choice.

### SAT solving

The DPLL procedure selects a Boolean variable, explores assignments, and propagates forced clauses.

CDCL solvers add implication graphs, learned clauses, non-chronological backtracking, and restarts.

The make–propagate–conflict–undo skeleton remains recognizable, but production SAT solving is much more than naive recursive enumeration.

### Parsing and regular-expression engines

A parser may try one grammar alternative, consume input, and backtrack if later symbols fail.

Uncontrolled ambiguity can cause exponential behavior.

Packrat parsing uses memoization to avoid repeated work for suitable parsing-expression grammars.

Some regular-expression engines backtrack over alternatives and quantifiers; crafted input can trigger catastrophic backtracking.

Linear-time automaton-based engines make a different performance trade-off.

### Scheduling and configuration

A deployment planner assigns workloads to machines under capacity, affinity, topology, and policy constraints.

Early capacity checks prune impossible placements.

Variable ordering can choose the workload with the fewest eligible machines first.

Real schedulers often accept a good feasible assignment under a deadline rather than exhaustively proving optimality.

### Transactional mutation

The backtracking undo log resembles a transaction log at a smaller scope.

Each branch records enough information to roll back its writes.

Snapshotting the whole state is simpler but expensive.

Fine-grained reversible operations are faster but require strict ownership and exception safety.

The generic kernel's `finally` establishes rollback even when control exits abnormally.

### Security search

Policy engines may search combinations of grants, roles, or configurations.

Pruning must never assume an authorization merely because a branch is convenient.

Untrusted constraints should be data interpreted by a restricted evaluator rather than arbitrary code executed with service privileges.

Resource bounds prevent an adversarial instance from monopolizing CPU or memory.

### Parallel search

Independent top-level branches can run concurrently.

Workers need isolated state or immutable snapshots.

Sharing one mutable board and undo stack introduces races.

First-solution search needs coordinated cancellation after one worker succeeds.

All-solution search needs deterministic aggregation if output order is part of the API.

Work stealing can balance uneven branch sizes, but serialization overhead may dominate small subtrees.

### Observability

Useful metrics include states visited, branches pruned, maximum depth, candidate counts by depth, solutions found, cancellation latency, and elapsed time.

A large pruning ratio is not automatically good if the pruning predicate itself is expensive.

Profiles should attribute time to candidate generation, constraint propagation, copying or undo, and solution serialization.

## 7. Practice Checklist

### Formulate the state

- Identify variables and their domains.
- State what one recursion depth represents.
- Define the partial-assignment invariant.
- Choose a state representation that makes illegal choices cheap to detect.
- Separate logical state from diagnostic counters.
- Define whether one or all solutions are required.
- Define deterministic choice order.
- Decide how solutions are copied or streamed.

### Prove correctness

- Show that every emitted state satisfies all constraints.
- Show that each recursive call makes progress.
- Show that all viable next choices are enumerated.
- Prove every pruning rule is sound.
- Prove undo restores all sibling-visible state.
- Account for duplicate solutions caused by symmetric choices.
- Define behavior for an empty instance.
- Define behavior for an unsatisfiable instance.

### Implement reversible mutation

- Keep `apply` and `undo` operations structurally paired.
- Use `try/finally` when exceptions or generator closure can interrupt recursion.
- Undo fields in an order compatible with their invariants.
- Avoid returning references to mutable working state.
- Test that root state is unchanged after complete enumeration.
- Test that root state is unchanged after cancellation.
- Test that root state is unchanged after callback failure.
- Prefer small undo records over full copies when mutation is well controlled.

### Improve pruning

- Reject conflicts immediately after a choice.
- Maintain incremental constraint summaries.
- Choose the most constrained variable when appropriate.
- Order values with an explicit heuristic.
- Detect forced assignments.
- Detect empty domains.
- Add branch-and-bound only with a proven admissible bound.
- Cache repeated subproblems only with a complete state key.
- Break symmetries without removing distinct requested solutions.
- Measure tree reduction against predicate cost.

### Test N-Queens

- Verify counts for boards zero through eight.
- Verify every emitted column is in range.
- Verify columns are unique.
- Verify both diagonal signatures are unique.
- Verify the exact two four-queen solutions.
- Verify sizes two and three are unsatisfiable.
- Compare set-based and mask-based implementations.
- Test input type and size policies.
- Test cancellation.
- Record visited and pruned states.

### Operate safely

- Enforce size limits at API boundaries.
- Enforce time or state budgets.
- Check cancellation within deep search.
- Stream large output sets.
- Cap collected result counts.
- Do not execute untrusted predicates with ambient authority.
- Seed randomized ordering.
- Expose whether a result is complete or deadline-truncated.
- Distinguish “no solution” from “search cancelled.”
- Keep diagnostic logs free of sensitive assignment values when necessary.

## 8. Frequently Asked Questions

### Is backtracking just recursion?

No.

Recursion is one control-flow mechanism for implementing it.

Backtracking specifically explores alternatives while maintaining and restoring partial state.

An explicit stack can implement the same search iteratively.

### Is backtracking the same as brute force?

Backtracking is systematic search, but it usually validates partial assignments and prunes impossible subtrees early.

Brute force often refers to generating complete candidates before checking them.

The worst case can still be exponential for both.

### Why is undo necessary if local variables are copied?

If every recursive state is immutable and independently allocated, explicit undo may be unnecessary.

When branches share mutable sets, arrays, graphs, or domain tables, undo restores the parent state and avoids expensive full copies.

### Why use `finally` around undo?

Normal control flow is not the only way recursion ends.

A callback can raise, cancellation can interrupt, or a generator consumer can stop early.

`finally` preserves the restoration contract under all of those exits.

### Can pruning make the algorithm incorrect?

Yes.

A pruning rule that removes a state capable of reaching a valid solution makes the solver incomplete.

Every prune needs a sound logical justification, not merely a correlation observed on sample inputs.

### What is the best variable-ordering heuristic?

There is no universal best heuristic.

Choosing the variable with the fewest legal values often exposes failure early in CSPs.

The cost of computing that choice and the structure of the instance family also matter.

### Why do bit masks help N-Queens?

They combine several Boolean occupancy checks into integer operations and make candidate extraction cheap.

They reduce allocation compared with copying sets at every recursive call.

They do not change the exponential nature of enumerating the search tree.

### Does row-by-row N-Queens need an explicit row-occupancy set?

No.

Depth itself identifies the next row, so exactly one queen is placed in each completed row.

Only columns and two diagonal families need separate conflict tracking.

### Why is the empty board counted as one solution?

There is exactly one assignment of zero queens to zero rows: the empty assignment.

This identity case makes recursive counting composition consistent.

An application may choose a different UI convention, but its mathematical and API contract should be explicit.

### When should memoization be added?

Add it when distinct decision paths reach equivalent future subproblems and a compact complete cache key exists.

If every path produces a unique state, caching adds overhead without reuse.

If the key omits relevant state, caching produces wrong answers.

### How does branch-and-bound differ from feasibility backtracking?

Feasibility search asks whether constraints can be satisfied.

Branch-and-bound also tracks an objective and a bound on the best result reachable from a partial state.

It prunes when that bound cannot beat the incumbent solution.

### Can branches run in parallel?

Yes, when their state is isolated and result semantics are defined.

Parallel first-solution search needs cancellation and may become nondeterministic.

Parallel enumeration needs safe output aggregation and often loses simple depth-first memory bounds.

### How should a timeout be reported?

Do not report timeout as “unsatisfiable.”

A timeout means search did not establish the requested conclusion within its budget.

Return a distinct cancelled or incomplete status and include whether any solutions found so far are partial output from an unfinished enumeration.

### What makes a backtracking implementation trustworthy?

A precise state invariant, proven sound pruning, complete choice enumeration, exception-safe restoration, bounded operation, and differential or property-based tests together provide strong evidence.

Fast output on a few examples is not enough.
