# Brent's Cycle Detection: Power-of-Two Checkpoints, Period Length & Entry Recovery

![Brent's Cycle Detection: Power-of-Two Checkpoints, Period Length & Entry Recovery](/images/dsa/brents-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

Repeatedly applying a deterministic function creates a sequence:

$$
x_0,\;x_1=f(x_0),\;x_2=f(x_1),\ldots
$$

If the reachable state space is finite, some state must eventually repeat.

From that point onward, determinism forces the sequence to cycle.

Cycle detection appears in linked structures, pseudorandom generators, Pollard-style factorization, state machines, iterative numerical processes, and tests for accidental repetition.

Storing every visited state in a hash table finds the first repeat directly but uses memory proportional to the nonrepeating tail and cycle.

Floyd's tortoise-and-hare method uses constant space by moving two references at different speeds.

Richard Brent described another constant-space method in 1980.

**Brent's cycle-detection algorithm** compares a moving hare with a checkpoint tortoise.

The checkpoint remains fixed for blocks whose lengths double as powers of two.

When a block is exhausted without equality, the hare's current state becomes the next checkpoint and the block allowance doubles.

Once equality occurs, the number of steps since the checkpoint is the cycle length $\lambda$.

A second phase offsets one pointer by $\lambda$ steps and advances both at equal speed to recover the tail length $\mu$.

Brent's method often evaluates the transition function fewer times than Floyd's method.

That matters when `f` is expensive, such as modular polynomial evaluation with large integers.

It does not remove the need for stable equality.

It also does not guarantee termination on an infinite nonrepeating state sequence.

A production API should accept a function-evaluation budget or cancellation policy when finiteness is not trusted.

The name “Brent's algorithm” is ambiguous.

Brent also developed a root-finding method combining bisection, secant, and inverse quadratic interpolation.

This DSA article concerns cycle detection, not numeric root finding.

The central mechanism is:

**use exponentially growing checkpoint blocks to discover the period, then use a period-sized offset to locate the cycle entry.**

## 2. Core Mathematical Invariants

### Tail and cycle parameters

For an eventually periodic sequence, define $\mu$ as the smallest nonnegative index at which the cycle begins.

Define $\lambda$ as the smallest positive cycle length satisfying:

$$
x_{\mu}=x_{\mu+\lambda}.
$$

Then for every $k\ge0$:

$$
x_{\mu+k}=x_{\mu+k+\lambda}.
$$

The reachable structure resembles the Greek letter rho: a tail of length $\mu$ entering a cycle of length $\lambda$.

### Deterministic-transition invariant

If $x_i=x_j$, then:

$$
x_{i+t}=x_{j+t}
$$

for every $t\ge0$ because both sides apply the same deterministic function repeatedly.

One equality therefore proves all future states repeat with period dividing $|j-i|$.

The first-phase block construction ensures the reported distance is the fundamental period $\lambda$, not merely an arbitrary multiple.

### Power checkpoint

Maintain:

- `power`, a positive power of two;
- `lam`, hare steps since the current checkpoint;
- `tortoise`, the checkpoint state;
- `hare`, the moving state.

At the start of one block:

```text
lam = 0
power = block capacity
tortoise = current hare state
```

Each hare transition increments `lam`.

If `lam == power` without equality, double `power`, copy hare to tortoise, and begin a new block.

### First-phase equality

Within a sufficiently large block, the fixed checkpoint and moving hare both lie on the cycle.

As hare advances around a cycle of length $\lambda$, it must return to the checkpoint within $\lambda$ steps.

The first return distance within that cycle is exactly the fundamental period.

Thus equality yields `lam = lambda`.

### Why doubling reaches a sufficient block

Block capacities are:

$$
1,2,4,8,\ldots
$$

Eventually a checkpoint is placed after the tail and the capacity is at least $\lambda$.

That block cannot finish without hare completing enough cycle steps to meet the checkpoint.

The geometric sum of earlier block lengths is less than twice the final block capacity.

This keeps first-phase work linear in $\mu+\lambda$.

### Entry-recovery invariant

After discovering $\lambda$, set both pointers to $x_0$.

Advance hare $\lambda$ times:

$$
tortoise=x_0,\qquad hare=x_{\lambda}.
$$

Then advance both one step per iteration.

After $i$ joint steps:

$$
tortoise=x_i,
$$

$$
hare=x_{i+\lambda}.
$$

At $i=\mu$ the two states are equal by periodicity.

For $i<\mu$, equality would imply an earlier cycle entry, contradicting minimality of $\mu$.

Therefore the first equality occurs exactly at the entry index.

### Equality versus identity

For linked-list nodes, cycle detection usually compares object identity.

Two different nodes may hold equal payloads without being the same state.

For numeric iterates, value equality may define state identity.

The API must use the equivalence relation appropriate to the state machine.

### Mutation stability

The transition relation must remain deterministic during the run.

Concurrent mutation of next pointers or externally changing state can invalidate both phases.

If `f(x)` returns mutable objects whose equality changes later, a checkpoint may no longer represent a stable past state.

### Budget invariant

A bounded implementation counts every call to `f`.

Before each call, it checks whether the configured maximum has been reached.

Exceeding the budget produces a distinct incomplete-search result or exception.

It must not be reported as “no cycle,” because the algorithm did not establish absence.

## 3. Step-by-Step Execution Trace

### State machine

Use transition table:

```text
0 -> 1
1 -> 2
2 -> 3
3 -> 4
4 -> 2
```

Starting at zero, the sequence is:

```text
0, 1, 2, 3, 4, 2, 3, 4, ...
```

Cycle entry is state `2`.

Tail length is:

$$
\mu=2.
$$

Cycle length is:

$$
\lambda=3.
$$

### Initialize phase one

Set:

```text
power = 1
lam = 1
tortoise = x0 = 0
hare = f(x0) = 1
```

`tortoise != hare`.

### Begin capacity-two block

Because `power == lam == 1`, promote the current hare to checkpoint:

```text
tortoise = 1
power = 2
lam = 0
```

Advance hare to `2` and set `lam = 1`.

States differ.

Advance hare to `3` and set `lam = 2`.

States still differ.

The block is exhausted.

### Begin capacity-four block

Promote checkpoint:

```text
tortoise = 3
power = 4
lam = 0
```

Advance hare:

```text
3 -> 4, lam = 1
```

No equality.

Advance again:

```text
4 -> 2, lam = 2
```

No equality.

Advance again:

```text
2 -> 3, lam = 3
```

Now hare equals checkpoint state `3`.

Phase one reports:

$$
\lambda=3.
$$

### Initialize phase two

Reset both pointers to zero.

Advance hare three times:

```text
hare: 0 -> 1 -> 2 -> 3
tortoise: 0
```

The pointers are one full period apart in sequence index.

### Recover `mu`

At joint step zero, compare `0` and `3`; they differ.

Advance both:

```text
tortoise: 0 -> 1
hare:     3 -> 4
mu = 1
```

They differ.

Advance both again:

```text
tortoise: 1 -> 2
hare:     4 -> 2
mu = 2
```

They meet at state `2`.

Return:

```text
entry = 2
mu = 2
lambda = 3
```

### Self-loop boundary

For transition `A -> A`, initialization gives tortoise and hare both `A`.

Phase one returns $\lambda=1$.

Phase two offsets hare by one transition, which remains `A`.

Pointers already agree, so $\mu=0$.

### No trusted finiteness

For `f(x)=x+1` over unbounded integers, no state repeats.

Unbounded Brent search never terminates.

A budgeted implementation raises an incomplete-search exception after the allowed number of evaluations.

That outcome does not prove no cycle exists beyond the explored prefix.

## 4. Production-Ready Implementations

The implementation below accepts a transition function, starting state, equality predicate, and maximum number of transition evaluations.

It reports tail length, period, entry state, and evaluation count.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Generic, TypeVar

T = TypeVar("T")


class CycleSearchLimit(RuntimeError):
    pass


@dataclass(frozen=True, slots=True)
class CycleInfo(Generic[T]):
    entry: T
    mu: int
    period: int
    evaluations: int


def brent_cycle(
    transition: Callable[[T], T],
    start: T,
    *,
    equal: Callable[[T, T], bool] = lambda left, right: left == right,
    max_evaluations: int = 1_000_000,
) -> CycleInfo[T]:
    if isinstance(max_evaluations, bool) or not isinstance(max_evaluations, int):
        raise TypeError("max_evaluations must be an integer")
    if max_evaluations < 1:
        raise ValueError("max_evaluations must be positive")

    evaluations = 0

    def advance(state: T) -> T:
        nonlocal evaluations
        if evaluations >= max_evaluations:
            raise CycleSearchLimit("cycle search exceeded transition budget")
        evaluations += 1
        return transition(state)

    power = 1
    period = 1
    tortoise = start
    hare = advance(start)

    while not equal(tortoise, hare):
        if power == period:
            tortoise = hare
            power *= 2
            period = 0
        hare = advance(hare)
        period += 1

    tortoise = start
    hare = start
    for _ in range(period):
        hare = advance(hare)

    mu = 0
    while not equal(tortoise, hare):
        tortoise = advance(tortoise)
        hare = advance(hare)
        mu += 1

    return CycleInfo(tortoise, mu, period, evaluations)
```

### Verify the worked trace

```python
next_state = [1, 2, 3, 4, 2]
result = brent_cycle(lambda state: next_state[state], 0)
assert result.entry == 2
assert result.mu == 2
assert result.period == 3

self_loop = brent_cycle(lambda state: state, "A")
assert self_loop == CycleInfo("A", 0, 1, self_loop.evaluations)
```

### Linked-list identity wrapper

Payload equality is not node identity, so the wrapper supplies `is` comparison.

```python
@dataclass(slots=True)
class ListNode:
    value: int
    next: "ListNode | None" = None


def linked_cycle(head: ListNode, max_evaluations: int = 1_000_000) -> CycleInfo[ListNode]:
    def next_node(node: ListNode) -> ListNode:
        if node.next is None:
            raise ValueError("list terminates before entering a cycle")
        return node.next

    return brent_cycle(
        next_node,
        head,
        equal=lambda left, right: left is right,
        max_evaluations=max_evaluations,
    )


nodes = [ListNode(index) for index in range(8)]
for current, following in zip(nodes, nodes[1:]):
    current.next = following
nodes[-1].next = nodes[3]
linked = linked_cycle(nodes[0])
assert linked.entry is nodes[3]
assert linked.mu == 3
assert linked.period == 5
```

The wrapper's terminating-list error is distinct from budget exhaustion.

Brent's cycle algorithm assumes an infinite successor sequence; a nullable linked list adds a separate acyclic termination state.

### Randomized differential verification

Compare with a visited-index reference on random finite functional graphs.

```python
import random


def reference_cycle(next_state: list[int], start: int) -> tuple[int, int, int]:
    first_index: dict[int, int] = {}
    state = start
    step = 0
    while state not in first_index:
        first_index[state] = step
        state = next_state[state]
        step += 1
    mu = first_index[state]
    return state, mu, step - mu


rng = random.Random(20260830)
for size in range(1, 300):
    transitions = [rng.randrange(size) for _ in range(size)]
    for _ in range(20):
        start = rng.randrange(size)
        expected = reference_cycle(transitions, start)
        actual = brent_cycle(lambda state: transitions[state], start)
        assert (actual.entry, actual.mu, actual.period) == expected
```

### Verify budget behavior

```python
try:
    brent_cycle(lambda value: value + 1, 0, max_evaluations=100)
    raise AssertionError("nonrepeating sequence should exhaust the budget")
except CycleSearchLimit:
    pass
```

The transition function should be free of external side effects because phase two reevaluates prefix transitions.

If transitions perform I/O or consume a stream, replay may not reproduce the same state sequence.

## 5. Asymptotic Time & Space Complexity

Let tail length be $\mu$ and cycle length $\lambda$.

### Phase one

Power-of-two blocks grow geometrically until one checkpoint block contains enough cycle movement to repeat.

Total hare transitions are $O(\mu+\lambda)$.

Equality comparisons have the same order.

### Phase two

Offsetting hare costs $\lambda$ transitions.

Advancing both pointers for $\mu$ joint steps costs $2\mu$ transition evaluations.

Total remains:

$$
O(\mu+\lambda).
$$

### Space

The algorithm stores two states and constant counters.

Auxiliary space is $O(1)$ when a state reference has constant-size representation.

The transition function may allocate new state objects; that storage behavior belongs to the state generator and runtime, not the pointer-count proof alone.

### Comparison with visited storage

A hash-map reference also runs in expected $O(\mu+\lambda)$ time under hashing assumptions.

It uses $O(\mu+\lambda)$ auxiliary entries and directly records first indices.

Brent trades that memory for a second traversal phase.

### Comparison with Floyd

Floyd also uses $O(1)$ space and $O(\mu+\lambda)$ transition-scale time.

It advances one pointer once and another twice per detection iteration.

Brent advances only the hare during period detection and can use fewer expensive function evaluations.

Exact constants depend on $\mu$, $\lambda$, and implementation.

### Budgeted search

With maximum $B$ evaluations, runtime is $O(B)$ before success or a limit exception.

The exception reports incomplete exploration, not an asymptotic absence proof.

## 6. Systems Connections

### Pollard's rho factorization

Pollard's rho iterates a modular function and looks for a collision modulo an unknown factor.

Cycle detection avoids storing every iterate.

The equality test is replaced or supplemented by greatest-common-divisor checks on iterate differences.

Brent-style batching can reduce expensive GCD operations in optimized variants.

The factorization algorithm has additional restart and failure behavior beyond generic cycle recovery.

### Pseudorandom generator analysis

A finite-state deterministic generator eventually cycles.

Cycle length and preperiod help diagnose poor parameters.

Observing a long period does not establish cryptographic unpredictability.

State secrecy, prediction resistance, and statistical properties require separate analysis.

### Linked structures

Brent detects cycles in a successor chain using identity comparison and constant references.

A terminating nullable list needs explicit handling because the mathematical functional sequence ends.

Concurrent pointer mutation makes results unstable and requires synchronization or a snapshot.

### State-machine testing

Repeated deterministic simulations can enter an unintended loop.

Cycle detection reports entry and period without retaining all states.

A transition budget prevents a test from hanging when state is effectively unbounded or equality is wrong.

### Duplicate-state detection

If state equality uses a hash or compressed fingerprint rather than exact state, collisions can report a false cycle.

Use exact equality after a hash match when correctness matters.

Canonical serialization must include every future-relevant state field.

### Expensive transitions

Brent is attractive when evaluating $f$ dominates equality and counter work.

If equality is extremely expensive, hash-assisted visited storage may perform differently.

Measure transition evaluations, equality checks, allocations, and wall time separately.

### Cancellation and service limits

An API exposed to arbitrary transition definitions must enforce execution isolation and budgets.

Do not execute untrusted callbacks with filesystem, network, or process authority.

Return timeout or budget exhaustion distinctly from cycle results.

## 7. Practice Checklist

### Define the sequence

- Specify the start state.
- Specify deterministic transition semantics.
- Choose identity or value equality.
- Ensure state does not mutate behind stored references.
- Decide how a terminating successor is represented.
- Decide whether finiteness is guaranteed.
- Set a transition-evaluation budget.

### Implement phase one

- Initialize `power = 1` and `period = 1`.
- Advance hare once before comparison.
- Reset checkpoint when `power == period`.
- Double power at each reset.
- Reset period to zero for the new block.
- Advance hare and increment period together.
- Stop only on state equality.

### Implement phase two

- Reset both pointers to the start.
- Advance hare exactly one period.
- Move both pointers at equal speed.
- Count joint steps as `mu`.
- Return the first equal state as entry.
- Keep the period from phase one unchanged.

### Test boundaries

- Test a self-loop.
- Test a pure cycle with `mu = 0`.
- Test a long tail and short cycle.
- Test a short tail and long cycle.
- Test identity-distinct nodes with equal payloads.
- Test a terminating linked list.
- Test budget exhaustion.
- Differential-test random functional graphs.

### Operate safely

- Count every transition evaluation.
- Distinguish incomplete search from no cycle.
- Avoid transition side effects.
- Avoid mutable equality keys.
- Bound state size as well as step count.
- Support external cancellation when callbacks are expensive.
- Do not expose untrusted executable transitions in privileged services.

## 8. Frequently Asked Questions

### What do `mu` and `lambda` mean?

$\mu$ is the number of transitions before first entering the cycle.

$\lambda$ is the number of distinct states around the cycle.

### Why does a finite deterministic sequence eventually cycle?

There are finitely many states but infinitely many iterates.

Some state repeats by the pigeonhole principle, and determinism makes every subsequent transition repeat.

### How does Brent differ from Floyd?

Floyd moves a tortoise one step and a hare two steps.

Brent keeps one checkpoint fixed while the hare traverses power-of-two blocks.

Both use constant auxiliary references.

### Why use power-of-two blocks?

Doubling reaches a block at least as large as the period while the sum of earlier block lengths remains within a constant factor of the final scale.

It provides efficient exponential exploration without knowing the period.

### Does the first equality directly give the entry?

No.

It gives the period length through the current block distance.

A second offset-and-lockstep phase finds the earliest entry index.

### Can it prove an infinite sequence has no cycle?

No finite execution can generally prove that for an arbitrary black-box transition.

A budget can stop the search but yields an incomplete result.

### Why compare node identity in a linked list?

Two nodes can store the same value while occupying different positions.

A structural cycle repeats the same node object, not merely an equal payload.

### What if the transition returns newly allocated equal objects?

Value equality may detect a repeated abstract state while identity equality will not.

Choose equality according to whether abstract value or object identity defines the state machine.

### Can the transition have side effects?

It should not when exact recovery is required.

Phase two replays transitions from the start, and side effects can produce a different sequence.

### Why track evaluation count?

Transition calls often dominate runtime and are the resource controlled by the budget.

The count also enables fair comparison with Floyd's method.

### What happens for a nullable list without a cycle?

The successor chain terminates rather than repeating.

A wrapper should return a separate acyclic result or raise a documented termination signal, not call `f(None)` indefinitely.

### Is this Brent's root-finding algorithm?

No.

The same researcher developed both methods, but cycle detection and numeric root finding have different states, invariants, and guarantees.

### When should a visited map be preferred?

Use it when memory is available and direct first-seen indices, full history, or simpler diagnostics matter more than constant-space operation.

### What is the most common implementation error?

Resetting the checkpoint or period counter in the wrong order can return a multiple or incorrect period.

Random functional-graph differential tests catch these boundary mistakes effectively.
