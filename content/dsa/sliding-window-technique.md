# Sliding Windows: Incremental Range State, Monotone Boundaries & Exact Shrink Conditions

![Sliding window over an array](/images/dsa/sliding-window-technique-dark.jpg#dark)

## 1. Historical Context & Motivation

Many sequence problems ask about every contiguous range of a fixed or constrained shape.

Recomputing each range from scratch repeats most work.

Adjacent windows overlap heavily.

A sliding-window algorithm reuses state from that overlap.

When the right boundary advances, add one item.

When the left boundary advances, remove one item.

If both updates are efficient, a quadratic enumeration can become linear.

Fixed-size windows have a predetermined length.

Variable-size windows expand until a condition fails, then shrink until validity returns.

The variable technique depends on monotonicity.

Moving the right boundary must change feasibility in a direction that left-boundary movement can repair.

For nonnegative sums, removing left values never increases the sum.

This supports minimum-length or maximum-length threshold problems.

Negative values break that monotonic behavior.

A window can become valid again by expansion alone or invalid through shrinking.

Different structures such as prefix sums and monotone queues are then required.

Substring problems maintain counts, frequencies, or last positions.

Window maximum uses a monotone deque rather than one scalar aggregate.

Distinct-element constraints maintain a frequency map.

The common pattern is boundary motion plus an exact state invariant.

“Use sliding window” is not a proof.

The update operations and validity monotonicity must be stated.

Off-by-one conventions are central.

This article uses half-open window `[left,right)` when describing invariants.

Many implementations extend `right` inclusively inside a loop.

Either convention works when length and updates stay consistent.

Each boundary should move only forward for linear time.

If a boundary retreats, the amortized proof changes.

The technique is best viewed as an online two-pointer scan over contiguous candidates.

## 2. Core Mathematical Invariants

### Window membership

At every step, the active window contains indices `[left,right)`.

Its length is `right-left`.

Indices below left are permanently excluded from future windows ending at or beyond right under monotone motion.

Indices at or above right are unprocessed.

### Fixed-size invariant

For target length `k`, after adding index `right-1`, shrink when length exceeds `k`.

Whenever length equals `k`, state summarizes exactly those `k` elements.

Advancing one step removes the old left item and adds one new right item.

### Sum invariant

Maintain:

$$
window\_sum=\sum_{i=left}^{right-1}A[i].
$$

Expanding with value `A[right]` adds it before incrementing right.

Shrinking subtracts `A[left]` before incrementing left.

No element enters or leaves without a matching state update.

### Frequency invariant

For each symbol `c`:

$$
freq[c]=|\{i\in[left,right):A[i]=c\}|.
$$

Delete zero counts if map size represents distinct symbols.

Then `len(freq)` equals number of distinct values in the window.

### Variable-window validity

For “at most `K` distinct,” expansion can only maintain or increase distinct count.

Shrinking can only maintain or decrease it.

While distinct count exceeds `K`, advance left.

After the loop, the window is valid.

Moreover, for the current right boundary, left is the smallest position retained by that shrinking policy.

### Counting invariant

If every window ending at `right-1` and starting in `[left,right)` is valid,

then exactly `right-left` valid subarrays end at that position.

This supports “at most” subarray counting.

Exactly-`K` counts can be derived as:

$$
atMost(K)-atMost(K-1).
$$

### Monotone deque invariant

For window maximum, deque stores candidate indices in increasing index order.

Their values are strictly decreasing or nonincreasing according to duplicate policy.

The front is the maximum candidate.

Remove front indices that fall before left.

Remove back indices whose values cannot beat the entering value now or later.

### Linear-motion invariant

Left and right begin at zero and never decrease.

Each advances at most `n` times.

Nested shrink loops therefore perform $O(n)$ total boundary increments.

This is an amortized argument, not `O(1)` per outer iteration.

### Nonnegative-sum precondition

For a threshold algorithm that shrinks while sum is large, all values must be nonnegative.

Removing the leftmost value cannot increase sum.

With negatives, the feasibility frontier is not monotone.

## 3. Step-by-Step Execution Trace

Find the longest substring with at most two distinct characters in `eceba`.

Initialize `left = 0`, empty frequencies, and best length zero.

Extend right to include index `0`, character `e`.

Frequency map is `{e:1}`.

Window `[0,1)` is `e` and valid.

Best length becomes `1`.

Include index `1`, character `c`.

Map becomes `{e:1,c:1}`.

Window `ec` has two distinct characters.

Best length becomes `2`.

Include index `2`, character `e`.

Map becomes `{e:2,c:1}`.

Window `ece` remains valid.

Best length becomes `3`.

Include index `3`, character `b`.

Map becomes `{e:2,c:1,b:1}`.

Three distinct characters violate the limit.

Shrink from the left.

Remove index `0`, character `e`.

Map becomes `{e:1,c:1,b:1}` and is still invalid.

Remove index `1`, character `c`.

Its count reaches zero, so delete key `c`.

Map becomes `{e:1,b:1}`.

Window is now `[2,4)`, substring `eb`.

It is valid, but length `2` does not improve best `3`.

Include index `4`, character `a`.

Map becomes `{e:1,b:1,a:1}`.

Shrink by removing index `2`, character `e`.

Delete zero count for `e`.

Window becomes `ba` with two distinct characters.

Final best substring length is `3`, represented by `ece`.

Both boundaries advanced only forward.

Each character was added once and removed at most once.

### Fixed-size sum trace

For `[2,1,5,1,3,2]` and `k = 3`, first sum is `2+1+5=8`.

Slide one position by removing `2` and adding `1`.

New sum is `7` for `[1,5,1]`.

Next remove `1` and add `3`, keeping sum `9` for `[5,1,3]`.

Next remove `5` and add `2`, giving `6` for `[1,3,2]`.

Maximum fixed-window sum is `9`.

## 4. Production-Ready Implementations

The following functions demonstrate frequency and monotone-deque windows.

```python
from __future__ import annotations

from collections import defaultdict, deque
from collections.abc import Sequence
from typing import Hashable, TypeVar

T = TypeVar("T", bound=Hashable)


def longest_at_most_k_distinct(values: Sequence[T], k: int) -> tuple[int, int]:
    if k < 0:
        raise ValueError("k cannot be negative")
    counts: dict[T, int] = defaultdict(int)
    left = 0
    best = (0, 0)

    for right, value in enumerate(values):
        counts[value] += 1
        while len(counts) > k:
            outgoing = values[left]
            counts[outgoing] -= 1
            if counts[outgoing] == 0:
                del counts[outgoing]
            left += 1
        if right + 1 - left > best[1] - best[0]:
            best = (left, right + 1)
    return best


def window_maximum(values: Sequence[int], k: int) -> list[int]:
    if not 1 <= k <= len(values):
        raise ValueError("window length must be within the sequence")
    candidates: deque[int] = deque()
    answer: list[int] = []

    for right, value in enumerate(values):
        left = right - k + 1
        while candidates and candidates[0] < left:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(right)
        if left >= 0:
            answer.append(values[candidates[0]])
    return answer


text = "eceba"
start, end = longest_at_most_k_distinct(text, 2)
assert text[start:end] == "ece"
assert window_maximum([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
```

The longest-substring function returns a half-open interval rather than copying data.

Tie policy keeps the earliest longest interval.

The maximum deque removes equal older values.

The newer equal value survives longer in future windows.

Store indices rather than values so expiry is testable.

Input validation makes impossible window lengths explicit.

For streaming fixed windows, retain only the state needed to remove outgoing values.

Variable windows may require retaining the entire active window.

Unicode strings are sequences of code points in Python.

Grapheme-cluster semantics require prior segmentation.

## 5. Asymptotic Time & Space Complexity

Both boundaries advance at most `n` times.

Frequency-window time is $O(n)$ expected with hash-map operations.

Its space is $O(k)$ for at-most-`k` distinct values, bounded by alphabet size.

The returned interval uses constant additional space.

For monotone maximum, each index enters the deque once.

Each index leaves from the front or back at most once.

Total deque operations are $O(n)$.

Deque space is $O(k)$ for window length `k`.

Output contains `n-k+1` maxima and uses that much result space.

A naive fixed-window maximum scans `k` values for every position.

Its time is $O(nk)$.

Fixed-window sum needs $O(1)$ state when outgoing values remain accessible.

For a stream, retaining a ring of `k` outgoing values uses $O(k)$ space.

Counting all valid windows can produce $\Theta(n^2)$ logical results.

The count can still be computed in $O(n)$ without materializing them.

Hash-map worst-case behavior depends on implementation and adversary assumptions.

Ordered maps change the bound to $O(n\log k)$.

Negative-sum alternatives may use prefix sums with balanced structures.

Their complexity differs from linear monotone-window scans.

## 6. Systems Connections

Network rate limiters track requests over recent time windows.

Exact sliding logs and bucketed approximations have different memory costs.

Monitoring systems compute rolling averages, minima, and maxima.

Stream processors use event-time windows and watermarks.

Late events complicate the simple forward-only model.

Audio and signal processing apply finite windows over sample streams.

Compression algorithms search recent history for repeated sequences.

TCP uses a sliding transmission window governed by acknowledgement and congestion state.

That protocol window is related conceptually but has richer semantics.

Databases execute moving aggregates over ordered rows.

Columnar engines vectorize add/remove or prefix-difference methods.

Security detectors count events within recent intervals.

An attacker may exploit approximate buckets near boundaries.

Image processing applies two-dimensional sliding kernels.

Separable filters reduce repeated work across rows and columns.

Cache eviction policies maintain recency windows of active objects.

Autocomplete and text editors inspect bounded context around a cursor.

The reusable systems idea is incremental maintenance of overlapping-range state.

### Classifying window constraints before coding

First decide whether the requested ranges must be contiguous.
If arbitrary subsequences are allowed, sliding windows are usually the wrong abstraction.
Next decide whether window length is fixed or variable.
A fixed-length window advances both boundaries in lockstep after initialization.
A variable window expands right and conditionally advances left.
Then identify the maintained summary.
Sums and counts support constant-time add and remove operations.
Maximum and minimum require a monotone deque or another ordered structure.
Median requires two balanced halves, indexed counts, or a specialized order-statistics structure.
Distinct-count constraints need frequencies, not just a set, because duplicates must be removed one occurrence at a time.
Finally, prove the constraint is monotone under the chosen boundary movement.
For nonnegative values, increasing right cannot decrease a sum.
That makes shrinking while the sum is too large safe.
With negative values, extending the window can lower the sum and invalidate that reasoning.
The same code shape may execute but miss valid intervals.
At-most-$k$ distinct values is monotone under removing left elements.
Exactly-$k$ distinct values is not directly a single monotone validity condition.
It can be counted as `atMost(k) - atMost(k - 1)`.
Minimum-length sum at least a target supports a positive-number window.
Maximum-length sum equal to a target with signed values is better handled by prefix sums and earliest-index mapping.
Writing this classification before implementation prevents most incorrect window applications.

### Expiration and state synchronization

Every item entering a window must have a symmetric expiration rule.
For a frequency map, increment on entry and decrement on exit.
Remove keys whose count becomes zero so distinct count remains exact.
For a monotone deque, remove expired indices from the front before using the maximum.
Remove dominated indices from the back when a new item enters.
Store indices rather than values when duplicate values can expire at different times.
For rolling sums, subtract the exact outgoing element.
A streaming implementation must retain enough history to identify that element.
A ring buffer of length $k$ is sufficient for a fixed-length stream window.
Event-time windows need timestamps and a watermark or lateness policy.
Arrival order is not necessarily event-time order.
Late events may reopen an earlier logical window unless the system explicitly drops or revises results.
Distributed stream processors use state stores and checkpointing because window summaries must survive failure.
The algorithmic invariant remains the same, but lifecycle and recovery become part of correctness.
State should be partitioned by the same key used to define independent windows.
Hot keys can create disproportionate memory and processing load.
Eviction policies must not silently discard active window state.

### Exactness, output size, and testing

Some problems ask for one optimum range.
Others ask for every valid range or the number of valid ranges.
Reporting every valid range can require quadratic output even when boundary movement is linear.
An $O(n)$ counting algorithm does not imply an $O(n)$ materialized result.
Tie-breaking must be explicit when multiple windows share the same optimum.
Choose earliest start, earliest end, shortest, or longest according to the contract.
Empty input and zero-length windows need defined behavior.
A negative `k` in an at-most-$k$ helper should return zero or raise according to API design.
Test windows that shrink multiple positions after one expansion.
Test repeated values whose count crosses zero.
Test the answer at the first and last possible window.
Test a window equal to the full input.
Test no valid window and every window valid.
For deques, compare every produced maximum with a direct scan on small random arrays.
For variable windows, brute-force all intervals for small inputs and compare results.
Property tests reveal off-by-one errors better than a few visually friendly examples.
Log left, right, summary, and validity transitions when debugging.
The trace should demonstrate that each boundary moves only forward.
For streaming inputs, tests should also cross chunk boundaries.
The result must not depend on how the same logical stream was partitioned into reads.

## 7. Practice Checklist

- Define window endpoints and inclusion.
- State fixed-size or variable-size semantics.
- Write the maintained state formula.
- Add entering items exactly once.
- Remove leaving items exactly once.
- Keep both boundaries monotone for linear amortization.
- Prove the validity condition is repairable by shrinking.
- Do not use nonnegative-sum logic with negative values.
- Delete zero frequency counts.
- Distinguish distinct map size from total frequency.
- Shrink in a loop, not a single conditional, when several removals may be needed.
- Update the answer at the correct validity moment.
- Define minimum versus maximum valid-window objective.
- Test empty input.
- Test window size one and full length.
- Test all-equal and all-distinct inputs.
- Test a violation requiring multiple left moves.
- Test optimum at the beginning and end.
- Store deque indices for expiry.
- Remove expired deque entries before reading the maximum.
- Remove dominated back entries under a defined equality policy.
- Include output size in complexity.
- Define code-point versus grapheme text semantics.
- Account for late events in event-time systems.
- Compare optimized results with brute force on small random inputs.
- Avoid materializing all valid subarrays when only a count is required.
- Bound state for untrusted streams.
- Document hash-map adversary assumptions.
- Use prefix or ordered methods when monotonicity fails.
- Explain why discarded left positions cannot become optimal later.

## 8. Frequently Asked Questions

### What makes a problem suitable for sliding windows?

Adjacent candidates overlap and their state supports efficient add and remove operations.

Variable windows also require a monotone validity frontier.

### Why can the nested loop still be linear?

The left boundary advances at most `n` times across the entire run.

### Do negative values break every sliding window?

No, but they break common sum-threshold monotonicity arguments.

### Why use a deque for maximum?

It retains only undominated candidates and expires them by index.

### How are exactly-`K` distinct subarrays counted?

Subtract the count with at most `K-1` distinct values from at most `K`.

### Should the window be inclusive?

Either convention works; half-open intervals make length arithmetic straightforward.

### Can windows process streams?

Yes, if enough state is retained to expire outgoing data.

### What is the most common bug?

Updating state or answers at a boundary moment inconsistent with the declared interval.

### When should I use prefix sums instead?

Use them for static additive ranges or when arbitrary endpoints are queried repeatedly.

### What is the central invariant?

The maintained state describes exactly the current contiguous range after every boundary move.
