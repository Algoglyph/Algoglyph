# Greedy Algorithms: Local Choices, Exchange Proofs & Failure Boundaries

![Greedy algorithm decision sequence](/images/dsa/greedy-dark.jpg#dark)

## 1. Historical Context & Motivation

A greedy algorithm commits to the best-looking available choice and never revisits it.

That sounds reckless because, without proof, it is reckless.

Many optimization problems contain locally attractive choices that destroy the global optimum.

Other problems have enough structure that one local choice can always be extended to an optimal solution.

Greedy algorithm design is the task of distinguishing those two worlds.

The method usually has three parts.

Define a feasible partial solution.

Choose one candidate using a fixed rule.

Prove that committing to it cannot exclude every optimum.

When the proof works, greedy algorithms are often simpler and faster than dynamic programming or exhaustive search.

Interval scheduling chooses the compatible interval that finishes earliest.

Kruskal chooses the lightest edge that does not create a cycle.

Prim chooses the lightest edge crossing the current tree cut.

Huffman coding repeatedly joins the two least frequent symbols or subtrees.

Dijkstra settles the smallest tentative distance only because all edge weights are nonnegative.

These algorithms look similar operationally.

Their correctness arguments are different.

The phrase “take the minimum” is not a proof technique.

The same-looking rule fails for `0/1` knapsack, arbitrary coin systems, and shortest paths with negative edges.

Greedy methods do not compare all complete solutions.

They compress the search by declaring earlier decisions final.

That finality creates both their speed and their risk.

A valid greedy choice normally rests on one of several structures.

An exchange argument transforms an optimum to contain the greedy choice.

A cut property identifies a safe boundary-crossing decision.

A stays-ahead argument shows the greedy prefix is never worse than any competing prefix.

A matroid exchange property makes every maximum-weight independent set accessible through sorted choices.

Optimal substructure is also necessary after the choice is fixed.

The remaining suffix must itself form the same kind of optimization problem.

Optimal substructure alone is not sufficient.

Dynamic programming also relies on it but keeps multiple competing states.

Greedy keeps only one.

The central question is:

What property makes one irreversible local choice safe for every possible continuation?

## 2. Core Mathematical Invariants

Let the candidate universe be $U$.

Let $\mathcal{F}\subseteq 2^U$ be the family of feasible subsets.

Let $w(S)$ be the objective value of feasible set $S$.

For maximization, the goal is:

$$
\max_{S\in\mathcal{F}} w(S).
$$

A greedy algorithm maintains a partial solution $G_i$ after $i$ accepted choices.

It considers candidates in a priority order and accepts a candidate only when feasibility is preserved.

### Feasibility invariant

Every prefix produced by the algorithm is feasible.

Formally:

$$
G_i\in\mathcal{F}
$$

for every iteration $i$.

This prevents an attractive choice from creating an invalid partial result.

For interval scheduling, accepted intervals never overlap.

For Kruskal, accepted edges never contain a cycle.

For a capacity problem, total selected weight never exceeds capacity.

Feasibility alone does not imply optimality.

It only ensures the algorithm returns a legal solution.

### Greedy-choice property

A problem has the greedy-choice property for a rule when some optimal solution contains the rule's first choice.

The claim is existential.

Not every optimum must contain that choice.

At least one must.

After fixing the choice, the same property must apply recursively to the residual problem.

### Exchange argument

Let $g$ be the greedy first choice.

Take an optimal solution $O$ that may omit $g$.

Identify a choice $o\in O$ that conflicts with or occupies the role of $g$.

Construct:

$$
O'=(O-\{o\})\cup\{g\}.
$$

Prove that $O'$ remains feasible.

Prove that $w(O')$ is no worse than $w(O)$.

Then $O'$ is also optimal and contains $g$.

This justifies the irreversible commitment.

Repeating the argument aligns an optimum with every greedy prefix.

### Stays-ahead invariant

Some sequence problems compare prefix progress.

Let greedy choices finish at values $g_1,g_2,\ldots$.

Let an arbitrary optimal solution finish at $o_1,o_2,\ldots$.

If one can prove:

$$
g_i\le o_i
$$

for every prefix index $i$, the greedy schedule never consumes more of the remaining resource.

It can accept at least as many future choices.

Earliest-finish interval scheduling uses exactly this argument.

### Cut invariant

Graph greedy algorithms often maintain a partial structure and reason about a cut.

For a minimum spanning tree, the lightest edge crossing a cut that respects the current forest is safe.

Adding that edge preserves the existence of an MST containing the growing forest.

The invariant is not merely “choose a light edge.”

It is “choose a light edge certified by a valid cut.”

### Optimal substructure after commitment

Once a safe choice $g$ is fixed, the remaining decisions form a smaller instance.

If $S^*$ is optimal for that residual instance, then $\{g\}\cup S^*$ must be optimal for the original constrained instance.

The greedy proof combines this decomposition with the greedy-choice property.

### Monotone progress

Each iteration permanently accepts or rejects at least one candidate.

The unprocessed candidate set shrinks.

Accepted choices are never removed in a basic greedy algorithm.

This monotonicity bounds the number of iterations.

### Counterexample obligation

Before trusting a rule, search for the smallest instance where it could fail.

Tie choices deserve special attention.

So do choices that consume a scarce resource.

A proof must cover all inputs satisfying the assumptions, not only representative examples.

## 3. Step-by-Step Execution Trace

Consider unweighted interval scheduling.

Each interval represents one job requiring exclusive use of a resource.

The objective is to accept the maximum number of pairwise non-overlapping jobs.

Use half-open intervals `[start, finish)` so touching endpoints are compatible.

The input is:

| Job | Interval |
|---|---|
| `A` | `[1, 4)` |
| `B` | `[3, 5)` |
| `C` | `[0, 6)` |
| `D` | `[5, 7)` |
| `E` | `[3, 9)` |
| `F` | `[5, 9)` |
| `G` | `[6, 10)` |
| `H` | `[8, 11)` |
| `I` | `[8, 12)` |
| `J` | `[2, 14)` |
| `K` | `[12, 16)` |

The greedy rule chooses compatible jobs in ascending finish time.

### Sort by finish time

The ordered sequence is:

```text
A(1,4), B(3,5), C(0,6), D(5,7), E(3,9), F(5,9),
G(6,10), H(8,11), I(8,12), J(2,14), K(12,16)
```

Initialize `last_finish = -∞`.

The selected schedule is empty.

### Consider `A(1,4)`

Its start `1` is at least `-∞`.

Accept `A`.

Set `last_finish = 4`.

Selected schedule: `[A]`.

The greedy schedule has the smallest possible first finishing time.

### Consider `B(3,5)`

Its start `3` is less than `4`.

It overlaps `A`.

Reject `B`.

The feasibility invariant remains true.

### Consider `C(0,6)`

Its start `0` is less than `4`.

Reject `C`.

Although `C` is long, duration is not the objective.

### Consider `D(5,7)`

Its start `5` is at least `4`.

Accept `D`.

Set `last_finish = 7`.

Selected schedule: `[A, D]`.

### Consider `E(3,9)`

Its start `3` is less than `7`.

Reject `E`.

### Consider `F(5,9)`

Its start `5` is less than `7`.

Reject `F`.

### Consider `G(6,10)`

Its start `6` is less than `7`.

Reject `G`.

### Consider `H(8,11)`

Its start `8` is at least `7`.

Accept `H`.

Set `last_finish = 11`.

Selected schedule: `[A, D, H]`.

### Consider `I(8,12)`

Its start `8` is less than `11`.

Reject `I`.

### Consider `J(2,14)`

Its start `2` is less than `11`.

Reject `J`.

### Consider `K(12,16)`

Its start `12` is at least `11`.

Accept `K`.

The final schedule is `[A, D, H, K]` with four jobs.

### Why the first choice is safe

Let an optimal schedule's first job be `X`.

`A` finishes no later than `X` because `A` is the earliest-finishing input job.

Replace `X` with `A`.

Every later job compatible with `X` starts at or after `X` finishes.

It therefore also starts at or after `A` finishes.

The replacement preserves feasibility and schedule size.

An optimal schedule exists whose first job is `A`.

Apply the same argument after time `4`, then after each greedy finish.

### A rule that fails

Choosing the shortest-duration interval is not safe.

Consider intervals `[0,3)`, `[3,6)`, and `[2,4)`.

The shortest interval `[2,4)` has duration two.

Choosing it blocks both three-unit intervals.

The result contains one job.

Choosing `[0,3)` and `[3,6)` produces two jobs.

Local duration does not measure how much future schedule remains.

Earliest finish does.

### Greedy also fails for `0/1` knapsack

Capacity is `50`.

Items have `(weight, value)` pairs `(10,60)`, `(20,100)`, and `(30,120)`.

Value densities are `6`, `5`, and `4`.

Density-first greedy chooses the first two items for value `160`.

The optimal indivisible choice uses the last two items for value `220`.

Density greedy is correct for fractional knapsack because fractions preserve the exchange argument.

Indivisibility breaks it.

## 4. Production-Ready Implementations

The interval scheduler below makes endpoint semantics explicit.

It returns original job identities rather than only coordinates.

```python
from dataclasses import dataclass
from math import inf
from typing import Iterable


@dataclass(frozen=True)
class Interval:
    name: str
    start: int
    finish: int

    def __post_init__(self) -> None:
        if self.finish < self.start:
            raise ValueError(f"invalid interval {self.name!r}")


def maximum_compatible_schedule(intervals: Iterable[Interval]) -> list[Interval]:
    ordered = sorted(intervals, key=lambda item: (item.finish, item.start, item.name))
    selected: list[Interval] = []
    last_finish = -inf

    for interval in ordered:
        if interval.start >= last_finish:
            selected.append(interval)
            last_finish = interval.finish

    return selected
```

The secondary sort keys make output deterministic when finish times tie.

They are not needed for cardinality optimality.

Half-open endpoint semantics are encoded by `start >= last_finish`.

For closed intervals where touching endpoints conflict, use `start > last_finish`.

### Execute the trace

```python
jobs = [
    Interval("A", 1, 4),
    Interval("B", 3, 5),
    Interval("C", 0, 6),
    Interval("D", 5, 7),
    Interval("E", 3, 9),
    Interval("F", 5, 9),
    Interval("G", 6, 10),
    Interval("H", 8, 11),
    Interval("I", 8, 12),
    Interval("J", 2, 14),
    Interval("K", 12, 16),
]

schedule = maximum_compatible_schedule(jobs)

assert [job.name for job in schedule] == ["A", "D", "H", "K"]
assert all(left.finish <= right.start for left, right in zip(schedule, schedule[1:]))
```

### Verify optimal cardinality on small instances

A brute-force oracle is useful in tests, not in production scheduling.

```python
from itertools import combinations


def brute_force_schedule(intervals: list[Interval]) -> list[Interval]:
    best: list[Interval] = []

    for size in range(len(intervals) + 1):
        for subset in combinations(intervals, size):
            ordered = sorted(subset, key=lambda item: (item.start, item.finish))
            compatible = all(
                left.finish <= right.start
                for left, right in zip(ordered, ordered[1:])
            )
            if compatible and len(ordered) > len(best):
                best = ordered

    return best


assert len(schedule) == len(brute_force_schedule(jobs))
```

Randomized small cases can compare the greedy result's length with this oracle.

That test checks the implementation, while the exchange argument proves the algorithm for arbitrary input size.

### Weighted intervals need another algorithm

If jobs have different profits, maximizing job count is no longer the objective.

Earliest finish can discard a long, valuable job for several nearly worthless jobs.

Weighted interval scheduling uses dynamic programming with predecessor lookup.

Changing the objective can invalidate a previously correct greedy rule.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the number of intervals.

Validating each interval costs $O(n)$ total during construction.

Sorting by finish time costs $O(n\log n)$.

The selection scan examines each interval once.

That scan costs $O(n)$.

The total running time is:

$$
O(n\log n)+O(n)=O(n\log n).
$$

The returned schedule contains at most $n$ intervals.

The implementation stores a sorted copy and the result, so its explicit auxiliary space is $O(n)$.

If input is already sorted and may be consumed in that order, selection takes $O(n)$ time.

Sort implementation memory depends on the language and library.

The proof does not depend on a comparison sort specifically.

If finish times are small bounded integers, another ordering method may be possible.

For a general greedy framework, complexity often separates into three costs:

1. Candidate prioritization.
2. Feasibility testing.
3. State updates after acceptance.

Kruskal sorts $m$ edges and performs near-constant amortized disjoint-set operations.

Its total is $O(m\log m)$ or equivalently $O(m\log n)$ under standard graph bounds.

Huffman coding performs repeated priority-queue operations and costs $O(n\log n)$.

Fractional knapsack sorts by density and costs $O(n\log n)$.

A greedy algorithm is not automatically linear.

The data structure supporting the choice rule often dominates.

| Interval scheduling stage | Time | Extra space |
|---|---:|---:|
| Validate intervals | $O(n)$ | $O(1)$ per object |
| Sort candidates | $O(n\log n)$ | Implementation-dependent |
| Feasibility scan | $O(n)$ | $O(1)$ excluding output |
| Store selected jobs | $O(1)$ each | $O(k)$ total |

Here $k$ is the number of selected intervals.

## 6. Systems Connections

### Resource reservation

Unweighted interval scheduling models one exclusive resource and equal-value requests.

Real reservation systems add priorities, cancellation risk, setup times, and multiple resources.

Those changes can invalidate earliest-finish optimality.

The proof must match the production objective exactly.

### Network routing

Dijkstra's algorithm is greedy because it permanently settles the smallest tentative distance.

Nonnegative edge weights ensure that no future path through unsettled vertices can improve it.

A negative edge destroys that invariant.

Bellman-Ford retains repeated relaxation instead of finalizing vertices greedily.

### Compression

Huffman coding greedily merges the two lowest-frequency trees.

Its exchange proof shows that two least-frequent symbols can be siblings at maximum depth in some optimal prefix code.

The residual problem replaces them with their combined frequency.

This is greedy choice plus optimal substructure in a different form.

### Spanning networks

Kruskal and Prim both build minimum spanning trees.

Their safe choices are certified by cut properties.

Cycle avoidance or cut membership is essential.

Selecting globally light edges without feasibility checks can produce a cycle and omit a vertex.

### Online decisions

Greedy algorithms are attractive when decisions must be made quickly.

Offline correctness proofs often assume the full candidate set is known and sortable.

An online algorithm sees arrivals incrementally and cannot reorder them.

Its quality may need a competitive-ratio analysis rather than an optimality proof.

### Approximation

Some greedy rules are not exact but have provable approximation ratios.

Set cover's standard greedy rule repeatedly chooses the set covering the most uncovered elements per unit cost.

It does not always find the optimum.

It does have a logarithmic approximation guarantee.

Label exact and approximate guarantees separately.

### Operational safeguards

Tie-breaking should be deterministic when results affect users or persisted state.

Log the objective, eligibility filters, and chosen priority key.

Do not describe a business heuristic as mathematically optimal unless its real constraints satisfy the proof.

Re-run counterexample tests whenever the objective or feasibility rule changes.

## 7. Practice Checklist

- Write the optimization objective before choosing a rule.
- Define the feasible family precisely.
- Identify which decisions become irreversible.
- State the greedy priority key.
- State the tie-breaking policy.
- Prove every accepted prefix remains feasible.
- Attempt an exchange argument for the first choice.
- Show that the exchange preserves objective value.
- Confirm the residual instance has the same structure.
- Consider a stays-ahead proof for sequence problems.
- Consider a cut proof for spanning structures.
- Search for a smallest counterexample before coding.
- Test scarce-resource conflicts.
- Test equal-priority candidates.
- Test empty input.
- Test one candidate.
- Test all mutually conflicting candidates.
- Test all mutually compatible candidates.
- Separate weighted and unweighted objectives.
- Separate fractional and indivisible choices.
- Verify numeric comparisons do not lose precision.
- Use a heap when the best candidate changes dynamically.
- Use sorting when a fixed global priority order suffices.
- Make feasibility checks efficient enough for the target bound.
- Compare small random instances with an exhaustive oracle.
- Document all assumptions used by the proof.
- Re-evaluate correctness after adding capacities or priorities.
- Distinguish exact greedy algorithms from approximations.
- Distinguish offline algorithms from online heuristics.
- Never infer correctness from passing examples alone.

## 8. Frequently Asked Questions

### What makes an algorithm greedy?

It repeatedly makes a locally prioritized feasible choice and treats that choice as final.

It does not retain multiple competing partial solutions for later comparison.

### Is every greedy algorithm optimal?

No.

Optimality requires a problem-specific proof such as an exchange, stays-ahead, or cut argument.

Without that proof, the method is a heuristic.

### How is greedy different from dynamic programming?

Greedy keeps one chosen prefix.

Dynamic programming preserves values for multiple states because an early local winner may not lead to the global optimum.

### Is optimal substructure enough for greedy correctness?

No.

`0/1` knapsack has optimal substructure but density-first greedy fails.

The greedy-choice property is also required.

### Why does earliest finish solve interval scheduling?

Replacing the first job of any optimum with the earliest-finishing job leaves at least as much time for every later job.

The exchange preserves feasibility and schedule cardinality.

### Why not choose the earliest starting interval?

An early-starting interval may run for a long time and block many short compatible intervals.

Its start time does not maximize the remaining scheduling region.

### Why does density work for fractional knapsack but not `0/1` knapsack?

Fractions let the solution exchange arbitrary amounts of lower-density material for higher-density material.

Indivisible items prevent that continuous exchange.

### Do negative edge weights break every greedy graph algorithm?

They specifically break Dijkstra's settlement proof.

Other greedy graph algorithms have different assumptions; minimum spanning tree algorithms can handle negative edge weights.

### Can a greedy algorithm provide a useful nonoptimal result?

Yes.

Some greedy approximation algorithms have formal quality bounds, while other heuristics are useful empirically.

State the guarantee honestly.

### How should ties be handled?

Use any tie choice covered by the proof, or impose a deterministic secondary key.

If only some tie choices are safe, the proof and implementation must identify them.

### How do I validate a new greedy rule?

Formalize feasibility and objective, search exhaustively for small counterexamples, and construct a proof that transforms an arbitrary optimum to agree with the greedy choice.

Testing finds bugs and counterexamples; it does not replace the proof.
