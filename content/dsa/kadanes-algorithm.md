# Kadane's Algorithm: Maximum Subarrays from a One-State Dynamic Program

![Kadane scan extending and restarting subarrays](/images/dsa/kadanes-algorithm-dark.jpg#dark)

## 1. Historical Context & Motivation

The maximum-subarray problem asks for one contiguous segment with the greatest sum.

Contiguity is the defining constraint.

Selecting arbitrary positive values solves a different problem.

A brute-force method can enumerate every pair of endpoints.

With prefix sums, each segment sum is constant-time, but there are $\Theta(n^2)$ segments.

Kadane's algorithm reduces the problem to one scan.

At each position, it asks whether the best segment ending here should extend the previous segment or restart at the current value.

Only one previous state matters.

That state is the best sum of a subarray required to end at the preceding index.

The global answer is the largest endpoint-constrained state seen anywhere.

This is dynamic programming compressed to constant space.

The recurrence is short enough to memorize.

Its edge cases are easy to mishandle.

Initializing the running sum to zero often returns an empty segment for all-negative input.

That is correct only when the problem explicitly permits an empty subarray with sum zero.

The common nonempty problem must return the least-negative element.

Endpoint reconstruction also needs deliberate state.

Tracking only the best sum loses the chosen interval.

Tie behavior needs a contract when several segments share the maximum sum.

One implementation may prefer the earliest segment.

Another may prefer the shortest or longest.

The algorithm also generalizes.

Minimum subarray reverses the comparison.

Maximum circular subarray combines ordinary maximum and minimum-subarray information under careful all-negative handling.

Two-dimensional maximum submatrix compresses pairs of rows or columns and applies Kadane repeatedly.

Streaming data can maintain the best sum online when values arrive in order.

The central question is:

Why is the best subarray ending at the current index determined completely by one previous best-ending state?

## 2. Core Mathematical Invariants

Let the array be $A[0:n)$.

Define $E_i$ as the maximum sum of a nonempty subarray ending exactly at index $i$.

Every subarray ending at $i$ is either the single element $A_i$ or an earlier subarray ending at $i-1$ extended by $A_i$.

Therefore:

$$
E_i=\max(A_i,E_{i-1}+A_i).
$$

The base case is:

$$
E_0=A_0.
$$

### Ending-state invariant

After processing index $i$, `ending_sum` equals $E_i$.

It is not the best sum anywhere in the prefix.

It is constrained to include $A_i$.

That distinction allows the next element to extend a valid contiguous suffix.

### Global-best invariant

After processing index $i$, `best_sum` equals:

$$
\max_{0\le j\le i}E_j.
$$

Every nonempty subarray in prefix $A[0:i+1)$ ends at some index $j\le i$.

Thus the maximum of ending states is the maximum subarray sum for the prefix.

At termination, it is the answer for the whole array.

### Restart condition

Extending the previous ending segment is beneficial only when:

$$
E_{i-1}+A_i\ge A_i,
$$

equivalently when $E_{i-1}\ge0$.

If the previous ending sum is negative, carrying it forward makes every extension worse.

Restarting at $i$ discards a harmful prefix.

When it is zero, extension and restart tie.

The chosen comparison controls interval tie behavior.

### Endpoint invariant

Track `ending_start`, the start of the segment represented by `ending_sum`.

On restart, set it to current index.

On extension, leave it unchanged.

When the global best improves, copy `ending_start` and current index into the best interval.

These endpoints always describe the stored sums.

### Nonempty invariant

Initialize from the first element rather than zero.

Then every state represents at least one array element.

For all-negative input, each recurrence compares one negative singleton with a more-negative extension.

The maximum state becomes the least-negative singleton.

### Tie invariant

Using strict `>` for global replacement preserves the first interval achieving the best sum.

Using `>=` preserves the last.

Additional comparisons can prefer shortest or longest intervals.

Tie policy changes endpoints but not the optimal sum.

### Prefix-sum interpretation

Let prefix sums be $P_0=0$ and:

$$
P_j=\sum_{t=0}^{j-1}A_t.
$$

Subarray sum $A[l:r)$ is $P_r-P_l$.

For each right endpoint $r$, the best left endpoint uses the minimum prefix sum among $P_0$ through $P_{r-1}$.

Kadane's restart logic implicitly tracks the same opportunity without storing the prefix array.

### Termination and work invariant

The scan advances one index each iteration.

Every index performs a constant number of additions and comparisons.

No index is revisited.

## 3. Step-by-Step Execution Trace

Use array:

```text
[-2, 1, -3, 4, -1, 2, 1, -5, 4]
```

The expected maximum subarray is `[4, -1, 2, 1]` with sum `6`.

### Initialize index `0`

Value is `-2`.

`ending_sum = -2`.

`best_sum = -2`.

Both intervals are `[0,0]`.

### Process index `1`, value `1`

Extension sum is `-2 + 1 = -1`.

Restart sum is `1`.

Restart at index `1`.

`ending_sum = 1`, interval `[1,1]`.

It improves global best.

`best_sum = 1`, interval `[1,1]`.

### Process index `2`, value `-3`

Extension gives `1 - 3 = -2`.

Restart gives `-3`.

Extend because `-2` is larger.

Ending interval is `[1,2]` with sum `-2`.

Global best remains `1`.

### Process index `3`, value `4`

Extension gives `-2 + 4 = 2`.

Restart gives `4`.

Restart at index `3`.

Ending sum becomes `4`.

Global best becomes `4`, interval `[3,3]`.

### Process index `4`, value `-1`

Extension gives `3`.

Restart gives `-1`.

Extend interval to `[3,4]`.

Global best stays `4`.

### Process index `5`, value `2`

Extension gives `5`.

Restart gives `2`.

Extend to `[3,5]`.

Update global best to `5`.

### Process index `6`, value `1`

Extension gives `6`.

Restart gives `1`.

Extend to `[3,6]`.

Update global best to `6`.

### Process index `7`, value `-5`

Extension gives `1`.

Restart gives `-5`.

Extend to `[3,7]` with ending sum `1`.

Global best remains `6` for `[3,6]`.

The ending state may worsen without changing the historical best.

### Process index `8`, value `4`

Extension gives `5`.

Restart gives `4`.

Extend to `[3,8]` with ending sum `5`.

Global best remains `6`.

Final answer is indices `3` through `6` inclusive.

### State table

| Index | Value | Ending sum | Ending start | Best sum | Best interval |
|---:|---:|---:|---:|---:|---|
| `0` | `-2` | `-2` | `0` | `-2` | `[0,0]` |
| `1` | `1` | `1` | `1` | `1` | `[1,1]` |
| `2` | `-3` | `-2` | `1` | `1` | `[1,1]` |
| `3` | `4` | `4` | `3` | `4` | `[3,3]` |
| `4` | `-1` | `3` | `3` | `4` | `[3,3]` |
| `5` | `2` | `5` | `3` | `5` | `[3,5]` |
| `6` | `1` | `6` | `3` | `6` | `[3,6]` |
| `7` | `-5` | `1` | `3` | `6` | `[3,6]` |
| `8` | `4` | `5` | `3` | `6` | `[3,6]` |

### All-negative trace

For `[-8, -3, -6]`, initialize best to `-8`.

At `-3`, restart because `-3 > -11` and update best.

At `-6`, restart because `-6 > -9`, but do not update best.

Return `-3`, not zero.

## 4. Production-Ready Implementations

The function returns sum and half-open interval `[start, stop)`.

It rejects empty input because the contract requires a nonempty subarray.

```python
from dataclasses import dataclass
from collections.abc import Sequence


@dataclass(frozen=True)
class SubarrayResult:
    total: int
    start: int
    stop: int


def maximum_subarray(values: Sequence[int]) -> SubarrayResult:
    if not values:
        raise ValueError("maximum nonempty subarray requires at least one value")

    ending_sum = values[0]
    ending_start = 0
    best_sum = values[0]
    best_start = 0
    best_stop = 1

    for index in range(1, len(values)):
        value = values[index]
        if value > ending_sum + value:
            ending_sum = value
            ending_start = index
        else:
            ending_sum += value

        if ending_sum > best_sum:
            best_sum = ending_sum
            best_start = ending_start
            best_stop = index + 1

    return SubarrayResult(best_sum, best_start, best_stop)
```

The strict global comparison preserves the earliest interval that first reaches an optimal total.

Extension wins a zero-sum tie, which also favors an earlier start.

### Execute representative cases

```python
sample = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
result = maximum_subarray(sample)

assert result == SubarrayResult(6, 3, 7)
assert sample[result.start : result.stop] == [4, -1, 2, 1]
assert maximum_subarray([-8, -3, -6]) == SubarrayResult(-3, 1, 2)
assert maximum_subarray([5]) == SubarrayResult(5, 0, 1)
assert maximum_subarray([1, -1, 1]) == SubarrayResult(1, 0, 1)
```

### Brute-force test oracle

```python
def maximum_subarray_bruteforce(values: Sequence[int]) -> SubarrayResult:
    if not values:
        raise ValueError("input must be nonempty")

    best = SubarrayResult(values[0], 0, 1)
    for start in range(len(values)):
        total = 0
        for stop in range(start + 1, len(values) + 1):
            total += values[stop - 1]
            if total > best.total:
                best = SubarrayResult(total, start, stop)
    return best


cases = [
    [0, 0, 0],
    [3, -2, 5, -1],
    [-4, -1, -7],
    [2, -2, 2, -2, 2],
]
for case in cases:
    assert maximum_subarray(case) == maximum_subarray_bruteforce(case)
```

Random small arrays can be checked against the oracle to verify sums and the selected earliest interval.

### Failure boundaries worth preserving

Resetting whenever the running sum is merely nonpositive changes the documented tie policy.

Updating endpoints after overwriting the running start can pair the right sum with the wrong slice.

Comparing only against zero silently changes a nonempty problem into an empty-allowed problem.

Returning inclusive endpoints from a half-open API creates off-by-one slices even when the sum is correct.

The brute-force oracle checks these contract details together rather than checking only one numeric total.

## 5. Asymptotic Time & Space Complexity

The algorithm reads each of $n$ values once.

Every iteration performs constant-time arithmetic, comparison, and index updates.

Time complexity is:

$$
\Theta(n).
$$

Any correct algorithm must inspect every element in the worst case.

An unseen final positive value could change the optimum.

The linear bound is therefore asymptotically optimal.

The implementation keeps a fixed number of sums and indices.

Auxiliary space is $O(1)$.

Returning endpoints does not change that bound.

Brute-force endpoint enumeration with incremental sums costs $O(n^2)$ time and $O(1)$ auxiliary space.

Recomputing every segment sum from scratch would cost $O(n^3)$.

Prefix sums reduce that to $O(n^2)$ but use $O(n)$ additional storage.

| Approach | Time | Extra space |
|---|---:|---:|
| Recompute every segment | $O(n^3)$ | $O(1)$ |
| Prefix sums plus endpoints | $O(n^2)$ | $O(n)$ |
| Incremental brute force | $O(n^2)$ | $O(1)$ |
| Kadane | $O(n)$ | $O(1)$ |

For streaming values, the state update remains $O(1)$ per item.

Retaining the actual segment values requires access to the original stream or buffering the winning range.

## 6. Systems Connections

### Streaming metrics

Kadane can identify the strongest contiguous cumulative gain in an ordered metric sequence.

The interpretation depends on baseline and sampling semantics.

Missing intervals and irregular timestamps may require normalization before a contiguous index range has meaning.

### Financial series

Applying the algorithm to price differences finds the best single buy-sell gain interval under a simple model.

Transaction costs, multiple trades, position limits, and risk constraints change the problem.

The basic maximum-subarray result should not be mislabeled as a trading strategy.

### Image and matrix analysis

Maximum-sum submatrix algorithms fix pairs of row boundaries, compress columns into sums, and apply Kadane.

For an $R\times C$ matrix, choosing the smaller dimension for boundary pairs improves practical cost.

The resulting complexity is typically cubic in one dimension combination.

### Dynamic data

Kadane solves one static scan efficiently.

If values change and maximum-subarray queries repeat, a segment tree can store total sum, best prefix, best suffix, and best subarray per node.

Those four fields combine associatively.

Point updates and whole-range answers then take $O(\log n)$ and $O(1)$ respectively after tree maintenance.

### Numeric overflow

Running sums can exceed the element type's range.

Use wider or checked arithmetic for bounded integers.

Floating-point sums can accumulate rounding error and NaN values destroy ordinary comparison behavior.

Validate numeric policy when inputs are untrusted.

### Parallelization

The one-state scan is sequential in its simplest form.

Chunks can be summarized by total, best prefix, best suffix, and best subarray.

These summaries can be combined in a reduction tree.

That is the same monoid used by maximum-subarray segment trees.

## 7. Practice Checklist

- Define whether the chosen subarray must be nonempty.
- Reject empty input or define its result explicitly.
- Initialize from the first element for a nonempty contract.
- Distinguish best-ending-here from best-seen-anywhere.
- Restart when the singleton is better than extension.
- Track the current start on restart.
- Copy endpoints when the global best improves.
- Use half-open or closed endpoints consistently.
- Define tie behavior.
- Test all-negative input.
- Test all-positive input.
- Test one value.
- Test all zeros.
- Test alternating gains and losses.
- Test multiple optimal intervals.
- Test an optimum at the beginning.
- Test an optimum at the end.
- Compare small random arrays with brute force.
- Verify returned segment sum equals the reported total.
- Use wider arithmetic when sums can overflow.
- Define NaN handling for floating-point input.
- Do not allow an empty result accidentally.
- Do not confuse contiguous and arbitrary subsequences.
- Use circular logic only with explicit all-negative handling.
- Use segment-tree summaries for repeated dynamic queries.
- Preserve input order in streaming use.
- Account for missing time-series samples.
- Separate measurement interpretation from algorithm correctness.
- Prefer the linear scan over endpoint enumeration.
- Document whether input is mutated; this implementation does not mutate it.

## 8. Frequently Asked Questions

### What does Kadane's algorithm compute?

It computes the maximum sum of a contiguous nonempty subarray under the presented contract.

It can also reconstruct that subarray's endpoints.

### Why can a negative running prefix be discarded?

Adding a negative prefix makes every future extension smaller than starting at the same future position.

It cannot help an optimal continuation.

### Why track both ending and global sums?

The ending sum must include the current element so it can be extended.

The global sum remembers an earlier segment even after the current ending state worsens.

### What happens for all-negative arrays?

Initialization from the first element makes the algorithm return the least-negative single element.

Initializing to zero would incorrectly permit an empty result.

### Is Kadane greedy or dynamic programming?

It is commonly described as dynamic programming because `E_i` is defined from `E_{i-1}`.

The state compresses to one value and the restart decision has a greedy appearance.

### Can it return the actual subarray?

Yes.

Track the current start and copy it with the current stop whenever the global best improves.

### Is the algorithm stable?

Stability is a sorting concept and does not apply directly.

What matters here is the chosen tie policy among equal-sum intervals.

### How is circular maximum subarray solved?

Compare the ordinary maximum with total sum minus the minimum subarray.

Handle all-negative input separately because excluding the whole array would create an invalid empty segment.

### Can it handle two-dimensional matrices?

Yes as a subroutine.

Compress between pairs of boundaries and run one-dimensional Kadane on the resulting sums.

### Can it support point updates?

Not efficiently as a plain scan for repeated queries.

A segment tree storing total, prefix, suffix, and best-subarray summaries supports logarithmic updates.

### Is $O(n)$ optimal?

Yes in the worst case because every element can affect the answer and must be inspected.
