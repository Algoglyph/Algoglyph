# Ternary Search: Unimodal Optimization, Discrete Bounds & Precision Contracts

![Ternary search shrinking a unimodal interval](/images/dsa/ternary-search-dark.jpg)

## 1. Historical Context & Motivation

Binary search removes half a monotone decision space after one comparison against a target or predicate boundary.
Ternary search addresses a different shape: a function that rises then falls, or falls then rises.
Such a function is **unimodal** over the search interval.
Comparing two interior points reveals which outer third cannot contain the optimum.
Repeated elimination shrinks the candidate interval.
The technique appears in geometry, scheduling, parameter tuning, and dynamic-programming optimizations when unimodality is proven.
It is also sometimes taught as a way to search a sorted array by splitting into three parts.
That use is rarely beneficial.
Sorted-array ternary search needs two comparisons per level and has the same $O(\log n)$ asymptotic class as binary search.
Binary search is simpler and normally faster.
Optimization over a unimodal objective is the compelling application.
The word unimodal needs precision.
A strict maximum has one increasing region followed by one decreasing region.
A weakly unimodal function may have a plateau of equally optimal values.
Discrete domains and continuous domains need different stopping rules.
For integers, stop when only a small candidate interval remains and scan it exactly.
For real numbers, stop by interval width or a fixed iteration count.
Floating-point equality is not a reliable termination condition.
Function evaluations may be expensive.
Caching one interior evaluation between iterations can reduce calls in variants, though ordinary thirds move both points each round.
Noisy observations can break the comparison invariant.
An optimizer cannot infer which third to discard when measurement noise reverses the true ordering.
Multimodal functions are even more dangerous.
Ternary search may converge to a local region and discard the global optimum.
The algorithm's speed comes entirely from the shape guarantee.
It cannot test that guarantee cheaply from a few samples.
Production use therefore begins with a proof or domain argument, not a graph that appears hill-shaped.
This article treats maximum search; minimum search reverses the comparison.
It covers strict and plateau cases, integer and floating domains, expensive objectives, and failure modes.

## 2. Core Mathematical Invariants

Let $f$ be unimodal for maximization on interval $[L,R]$.
In a strict discrete form, there exists optimum index $p$ such that values increase up to $p$ and decrease after $p$.
A weak form allows a plateau $[p_1,p_2]$ of equal maxima.
Choose interior points

$$
m_1=L+\left\lfloor\frac{R-L}{3}\right\rfloor
$$

and

$$
m_2=R-\left\lfloor\frac{R-L}{3}\right\rfloor.
$$

They satisfy $L\le m_1\le m_2\le R$.
When the interval is large enough, they are distinct interior points.
If $f(m_1)<f(m_2)$, the function is still rising somewhere between those points or has its optimum to their right.
No point strictly left of $m_1$ can be the unique better maximum.
The next interval can discard `[L,m1]` under a strict convention or move `L = m1 + 1` in a discrete implementation.
If $f(m_1)>f(m_2)$, symmetrically discard the right outer third.
If values are equal, the strict-unimodal optimum lies between them.
For weak plateaus, an optimum may fill part of that middle region.
Discarding both outer thirds retains at least one optimum when the assumptions hold.
Some implementations use one-sided tie handling and finish with an exact scan.
The preservation invariant is that the active interval contains at least one global optimum.
Every update must preserve that statement.
For integer domains, rounding can make interior points repeat.
Continuing while `right - left > small_constant` prevents a stalled update.
After termination, evaluate every remaining integer candidate.
This exact scan resolves ties and off-by-one rounding.
For continuous domains, define

$$
m_1=L+(R-L)/3,\quad m_2=R-(R-L)/3.
$$

Each iteration retains an interval of length at most $2/3$ of the previous length.
After $k$ iterations, width is at most

$$
(R_0-L_0)(2/3)^k.
$$

To make width at most $\varepsilon$, it suffices that

$$
k\ge\frac{\log((R_0-L_0)/\varepsilon)}{\log(3/2)}.
$$

A fixed iteration count avoids edge cases where floating-point endpoints stop changing.
The returned point is approximate.
Objective-value error depends on function smoothness, not only coordinate width.
If $f$ is Lipschitz with constant $K$, coordinate error $\varepsilon$ implies value error at most $K\varepsilon$.
Without such a bound, do not promise a specific objective error.
For minimization, reverse the direction decisions or search maximum of $-f$.
For a convex function, minimizing over one dimension matches the unimodal valley model.
For a concave function, maximizing matches the hill model.
Convexity or concavity is stronger than unimodality and often easier to prove analytically.
Discrete convexity can be expressed through monotone first differences.
If $f(i+1)-f(i)$ changes sign once, the maximum region is unimodal.
An alternative discrete binary search finds the sign change by comparing adjacent values.
It uses one fresh comparison location per iteration and is often preferable.
Ternary search remains useful when its direct interval logic is clearer.
Sorted-array target search has a different invariant.
Comparing target with two pivots identifies one of three sorted regions.
The recurrence is $T(n)=T(n/3)+O(1)$, giving $O(\log n)$.
Two pivot comparisons per level usually erase the shallower depth advantage over binary search.
Do not confuse target monotonicity with objective unimodality.

## 3. Step-by-Step Execution Trace

Consider integer function $f(x)=-(x-7)^2+30$ on `[0, 15]`.
Its unique maximum is at $x=7$ with value 30.
Start with `left = 0`, `right = 15`.
The interval difference is 15.
Choose `m1 = 5` and `m2 = 10`.
Evaluate `f(5)=26` and `f(10)=21`.
Because the left interior value is larger, the peak lies before `m2` under unimodality.
Set `right = m2 - 1 = 9`.
The active interval `[0,9]` still contains seven.
Choose `m1 = 3` and `m2 = 6`.
Evaluate `f(3)=14` and `f(6)=29`.
The right interior value is larger.
Discard through `m1` and set `left = 4`.
The active interval becomes `[4,9]`.
Suppose the loop stops when at most six candidates remain.
Scan integers four through nine.
Their values are 21, 26, 29, 30, 29, and 26.
The exact maximum is `(7,30)`.
The scan handles every rounding decision safely.
Now use plateau function with values `[1,3,5,5,5,4,2]` over indices zero through six.
The optimal plateau is indices two through four.
Interior values may compare equal.
When equal, shrinking toward the middle retains some optimum.
If the API requests the leftmost optimum, ordinary ternary search alone does not enforce that tie rule.
After finding the maximum value, use boundary search or scan the retained region according to the contract.
Now trace continuous search for maximum of $f(x)=-(x-2)^2+5$ on `[-4,8]`.
Initial width is 12.
Interior points are zero and four.
Both values equal one.
The optimum lies between them, so retain `[0,4]`.
New interior points are $4/3$ and $8/3$.
They again have symmetric equal values around two.
Retain that middle interval.
The width shrinks by a factor of one third on equal comparisons in this case.
Repeated steps surround two ever more tightly.
After a fixed number of iterations, return the midpoint.
Now violate unimodality with values `[0,10,1,2,9,0]`.
There are two peaks.
Interior comparisons can cause the algorithm to discard the region containing value ten and converge near value nine.
The steps remain syntactically valid.
The answer is globally wrong because the preservation invariant was false from the start.
This counterexample is a required part of understanding the technique.
Finally, consider a noisy benchmark objective.
True runtime is minimized near parameter 64, but each measurement varies by 20 percent.
One unlucky pair of samples can reverse `f(m1)` and `f(m2)`.
The algorithm permanently discards the true optimum region.
Repeated sampling and confidence rules may reduce risk, but the problem becomes stochastic optimization rather than ordinary ternary search.

## 4. Production-Ready Implementations

These implementations separate exact integer optimization from approximate continuous optimization.

```python
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import TypeVar


T = TypeVar("T")


@dataclass(frozen=True)
class IntegerOptimum:
    argument: int
    value: float


def ternary_max_integer(left: int, right: int, objective: Callable[[int], float]) -> IntegerOptimum:
    if left > right:
        raise ValueError("integer interval must be nonempty")

    while right - left > 6:
        third = (right - left) // 3
        middle_left = left + third
        middle_right = right - third
        value_left = objective(middle_left)
        value_right = objective(middle_right)

        if value_left < value_right:
            left = middle_left + 1
        elif value_left > value_right:
            right = middle_right - 1
        else:
            left = middle_left
            right = middle_right

    best_argument = left
    best_value = objective(left)
    for argument in range(left + 1, right + 1):
        value = objective(argument)
        if value > best_value:
            best_argument = argument
            best_value = value
    return IntegerOptimum(best_argument, best_value)


def ternary_max_real(
    left: float,
    right: float,
    objective: Callable[[float], float],
    *,
    iterations: int = 100,
) -> tuple[float, float]:
    if not left <= right:
        raise ValueError("real interval must be nonempty")
    if iterations < 0:
        raise ValueError("iterations must be non-negative")

    for _ in range(iterations):
        third = (right - left) / 3.0
        middle_left = left + third
        middle_right = right - third
        if objective(middle_left) < objective(middle_right):
            left = middle_left
        else:
            right = middle_right

    argument = (left + right) / 2.0
    return argument, objective(argument)


def demo() -> None:
    discrete = ternary_max_integer(0, 15, lambda x: -(x - 7) ** 2 + 30)
    assert discrete == IntegerOptimum(7, 30)

    argument, value = ternary_max_real(-4.0, 8.0, lambda x: -(x - 2.0) ** 2 + 5.0)
    assert abs(argument - 2.0) < 1e-7
    assert abs(value - 5.0) < 1e-9


if __name__ == "__main__":
    demo()
```

The integer API assumes a unimodal objective but cannot verify that property.
It performs an exact final scan and returns the first maximum encountered in that retained range.
That is not necessarily the globally leftmost plateau point if earlier narrowing discarded other equal optima.
Add a boundary-recovery step when a global tie policy matters.
Objective evaluation should be deterministic and side-effect free.
If it is expensive, memoize evaluated integer points in a bounded local dictionary.
Continuous pivots usually change every iteration, so exact cache hits are uncommon.
The fixed 100 iterations shrink a double-precision interval far beyond useful resolution for ordinary scales.
Choose iterations from initial width and required coordinate tolerance rather than copying 100 blindly.
Stop if new interior points equal endpoints due to floating-point rounding.
Fixed iteration already prevents an infinite loop.
Check objective results for NaN.
Comparisons with NaN are false and can drive arbitrary branch behavior.
Define whether infinities are allowed.
Scale variables when huge or tiny coordinate magnitudes make subtraction inaccurate.
For analytic convex functions, derivative-based root finding can converge faster.
It requires trustworthy derivatives and suitable smoothness.
Golden-section search reuses one function evaluation per iteration and is often preferable for expensive continuous objectives.
It relies on the same unimodal assumption.
Brent's method combines parabolic interpolation with golden-section safeguards for scalar minimization.
Use mature numerical libraries when precision and evaluation cost matter.
For integer concave sequences, binary search on adjacent differences is often simpler.
For noisy objectives, use experimental-design or stochastic-optimization methods.
Do not hide measurement variance behind deterministic ternary code.
Bound input interval and evaluation time for untrusted callbacks.
Callback exceptions should propagate or be translated according to API policy without corrupting search state.
Record evaluated points during debugging to confirm interval preservation.

## 5. Asymptotic Time & Space Complexity

Each iteration retains at most two thirds of the previous interval.
For an integer domain of size $N$, iteration count is $O(\log_{3/2}N)$.
Asymptotically this is $O(\log N)$.
Each ordinary iteration evaluates the objective twice.
The final constant-size scan costs $O(1)$ evaluations under a fixed threshold.
Total objective calls are $O(\log N)$.
If one objective evaluation costs $C$, total time is $O(C\log N)$.
Auxiliary state is $O(1)$ without memoization.
Caching evaluated integer points uses $O(\log N)$ space in the worst case.
Continuous iteration count for coordinate width $\varepsilon$ is

$$
O\left(\log\frac{R-L}{\varepsilon}\right).
$$

This is a numerical accuracy statement, not an exact real-arithmetic result.
Floating-point precision places a lower useful bound on $\varepsilon$.
Objective-value accuracy additionally depends on function behavior.
A fixed iteration count $k$ costs exactly $2k+1$ evaluations in the shown real implementation, including the final midpoint.
Golden-section search reuses one interior value and needs roughly one new evaluation per iteration after initialization.
That can halve expensive callback work.
Binary search on a monotone derivative or discrete adjacent comparison also uses $O(\log N)$ iterations.
It usually performs fewer objective evaluations for suitable discrete functions.
Sorted-array ternary target search satisfies $T(N)=T(N/3)+O(1)$.
Its depth is $O(\log_3 N)$.
It performs up to two pivot comparisons per level.
Binary search depth is $O(\log_2 N)$ with roughly one ordering comparison per level.
The total comparison constants favor binary search in ordinary implementations.
Neither algorithm beats the comparison-model logarithmic search class.
If objective evaluation scans $n$ records, calling it $O(\log N)$ times yields $O(n\log N)$ end-to-end work unless summaries are reused.
Precomputing sufficient statistics can change $C$.
Include that preprocessing and storage in the trade-off.
Parallel evaluation of the two pivots can reduce wall time when callbacks are independent and expensive.
It uses additional resources and still requires both results before narrowing.
Do not parallelize cheap arithmetic where scheduling dominates.

## 6. Systems Connections

Computational geometry often minimizes a convex distance or cost along one scalar parameter.
Proof of convexity or unimodality justifies interval elimination.
For distances involving square roots, compare squared distance when monotonic transformation preserves the optimum.
Scheduling can optimize a single resource allocation when marginal returns change monotonically.
Discrete convex optimization may permit adjacent-difference binary search instead.
Machine-learning hyperparameter tuning rarely guarantees unimodality.
Applying ternary search to validation loss without evidence can miss better regions.
Bayesian optimization, random search, or domain-specific sweeps are more honest for multimodal noisy surfaces.
Compiler autotuning also measures noisy runtimes.
Repeated samples, robust statistics, and experimental controls are necessary before any directional elimination.
Rate-limit and cache expensive builds during tuning.
Game physics can find closest approach along a trajectory when the distance function is unimodal over the interval.
Collision functions with multiple encounters violate the assumption.
Rendering and color optimization sometimes reduce to convex scalar objectives.
Use numerical libraries with documented tolerances.
Distributed parameter search can evaluate two points concurrently.
The coordinator must handle timeout and retry without comparing results gathered under inconsistent conditions.
Database cost models may appear convex over memory allocation but contain discontinuities from plan changes and spills.
Ternary search across such thresholds is unsafe without a stronger model.
Service capacity experiments are noisy and can affect production traffic.
Optimization needs safety bounds and rollback, not just an interval loop.
Security analysis treats user-provided objectives as code execution or resource consumption.
Bound callbacks and avoid exposing arbitrary evaluation through a public optimizer.
Floating-point reproducibility differs across architectures and compiler modes.
Return tolerances rather than promising bit-identical coordinates.
For exact integer domains, exhaustive final scanning gives deterministic correctness within the retained interval.
Ternary search connects a small algorithm to a larger discipline: prove structural shape before exploiting it computationally.

## 7. Practice Checklist

- Prove or justify unimodality before searching.
- State whether the objective is maximized or minimized.
- State whether the domain is integer or continuous.
- Define strict peak or plateau semantics.
- Define tie-breaking requirements.
- Keep an interval containing at least one optimum.
- Choose interior points without overflow.
- Ensure discrete pivots make progress.
- Stop discrete narrowing at a small interval.
- Scan every remaining integer candidate exactly.
- Use fixed iterations or width tolerance for real domains.
- Never terminate on floating-point equality alone.
- Derive iteration count from width and tolerance.
- Distinguish coordinate error from objective-value error.
- Reject or define NaN objective values.
- Handle infinities explicitly.
- Require deterministic callbacks for deterministic correctness.
- Memoize only when evaluation cost justifies it.
- Bound memoization storage.
- Prefer golden-section search for expensive continuous evaluations.
- Prefer derivative methods only with valid smooth derivatives.
- Consider adjacent-difference binary search for discrete concavity.
- Do not use ternary search on unproven multimodal functions.
- Do not treat noisy samples as exact comparisons.
- Use stochastic methods for noisy objectives.
- Test optima at both interval endpoints.
- Test a unique interior optimum.
- Test odd and even domain sizes.
- Test narrow intervals of zero through six width.
- Test plateaus and define expected returned point.
- Test very large coordinates for overflow.
- Test floating intervals near machine precision.
- Log interval updates when debugging.
- Verify discarded regions cannot contain a better point in proof examples.
- Include objective cost in total complexity.
- Compare against exhaustive search on small random unimodal sequences.
- Benchmark binary search for sorted target lookup instead.
- Bound callback time and failures.
- Keep optimization side effects isolated.
- Document the assumption more prominently than the code trick.

## 8. Frequently Asked Questions

### What property does ternary search require?

The objective must be unimodal over the active interval: it rises then falls for maximization, with an optional single plateau.

### Is ternary search better than binary search for sorted arrays?

Usually not.
It uses more pivot comparisons per level while remaining logarithmic; binary search is simpler and generally faster.

### Why use two interior points?

Their objective comparison reveals whether the left or right outer third cannot contain a better optimum under unimodality.

### How should integer search terminate?

Stop when only a small constant number of candidates remain, then evaluate every remaining integer exactly.

### How should real-valued search terminate?

Use a fixed iteration count or an interval-width tolerance.
Do not wait for floating-point endpoints to become exactly equal.

### What happens on a plateau?

The method can retain and return some optimum, but a specific leftmost or rightmost tie rule needs additional boundary logic.

### Can it optimize a noisy benchmark?

Ordinary ternary search assumes exact reliable comparisons.
Noise can discard the true optimum, so use repeated statistical sampling or a stochastic optimizer.

### Is convexity required?

No; unimodality is sufficient in one dimension.
Convexity or concavity is a stronger property that often supplies the needed proof.

### Why might golden-section search be preferable?

It reuses one interior evaluation between iterations, reducing calls when the objective is expensive.

### Can the optimum lie at an endpoint?

Yes under monotone-as-a-degenerate-unimodal conventions.
Implementations and tests must retain and evaluate endpoints correctly.

### What does the logarithmic bound count?

It counts interval reductions.
Total runtime multiplies that count by the cost of evaluating the objective.

### What is the most common misuse?

Applying ternary search because sampled values look hill-shaped without proving the whole objective has only one optimal region.
