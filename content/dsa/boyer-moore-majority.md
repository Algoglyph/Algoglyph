# Boyer–Moore Majority Vote: Pair Cancellation, Candidate Survival & Verification

![Boyer–Moore Majority Vote: Pair Cancellation, Candidate Survival & Verification](/images/dsa/boyer-moore-majority-dark.jpg#dark)

## 1. Historical Context & Motivation

Finding the most frequent value can be solved by counting every distinct item in a hash table.

That approach uses linear time and storage proportional to the number of distinct values.

The **majority element** problem has a stronger promise: determine whether some value appears more than half the time.

The strict threshold enables a constant-space cancellation algorithm.

Robert Boyer and J Strother Moore developed the majority vote algorithm in the early 1980s and later published a formal treatment.

The algorithm keeps one candidate and one balance counter.

Matching observations increase the balance.

Different observations decrease it.

When the balance reaches zero, the processed prefix has been partitioned into cancelled pairs of unequal values, so a later value can start a new candidate segment.

If a true strict majority exists, it survives every possible cancellation of unequal pairs.

This is why one pass can identify the only possible majority using $O(1)$ auxiliary state.

The first pass does not prove that the final candidate is a majority.

For input `[1,2,3]`, the algorithm still ends with a candidate even though no value appears twice.

If the input contract does not guarantee existence, a second pass must count the candidate and compare against $\lfloor n/2\rfloor$.

This distinction is operationally important.

Returning an unverified candidate can silently turn “no majority” into a plausible but false answer.

The method is designed for equality-based streams.

It does not require ordering, hashing, or random access.

The candidate pass can process an iterator once.

Verification requires either replaying the stream, retaining the data, or obtaining a separate count from the source.

For non-replayable streams, the API must say whether majority existence is guaranteed.

The method generalizes through Misra–Gries counters: with $k-1$ candidate slots, any value occurring more than $n/k$ times must survive.

As with the single-candidate version, surviving candidates require verification for exact frequencies.

The central insight is:

**a strict majority cannot be eliminated by pairing each removed occurrence with a different value, but survival alone is not proof of frequency.**

## 2. Core Mathematical Invariants

### Strict majority definition

For sequence $A$ of length $n$, value $m$ is a strict majority when:

$$
count_A(m)>\frac n2.
$$

Because counts are integers, the equivalent threshold is:

$$
count_A(m)\ge\left\lfloor\frac n2\right\rfloor+1.
$$

At most one strict majority can exist.

If two distinct values each occurred more than $n/2$ times, their combined count would exceed $n$.

### Cancellation lemma

Remove one occurrence of value $x$ and one occurrence of a different value $y$.

If $m$ was a strict majority before removal, it remains a strict majority among the remaining elements.

If neither removed item is $m$, its count is unchanged while length decreases by two.

If exactly one removed item is $m$, both its count and the non-$m$ count decrease by one.

The positive excess of majority occurrences over all other occurrences remains positive.

Thus repeated unequal-pair cancellation cannot eliminate a true majority completely.

### State interpretation

After processing a prefix, the algorithm's state can be interpreted as:

- zero or more cancelled pairs of unequal values;
- `balance` unpaired occurrences of `candidate`.

The physical order of cancellation need not be stored.

When the next value equals the candidate, it adds one unmatched candidate occurrence.

When it differs, it pairs with and cancels one unmatched candidate occurrence.

When balance is zero, no unmatched candidate remains in the reduced prefix.

### Transition invariant

For each item `value`:

```text
if balance == 0:
    candidate = value
    balance = 1
elif value == candidate:
    balance += 1
else:
    balance -= 1
```

Assigning a new candidate and then comparing it in separate logic is equivalent when done carefully.

The explicit branches make the reduced-prefix interpretation visible.

### Candidate survival theorem

Assume strict majority $m$ exists.

Cancel unequal pairs represented by all decrement operations.

By the cancellation lemma, $m$ remains a strict majority of the uncancelled multiset whenever it is nonempty.

The final reduced multiset contains only repetitions of the final candidate.

Therefore that candidate must equal $m$.

This proves candidate identification under the existence promise.

### Why verification is separate

Without a majority promise, the reduced multiset can contain a survivor unrelated to a global frequency threshold.

Cancellation proves only:

> if a strict majority exists, it equals the survivor.

It does not prove:

> every survivor is a strict majority.

The second implication is false.

An exact API counts survivor occurrences and checks the threshold.

### Segment reset interpretation

Whenever balance becomes zero, the processed segment since the previous reset has equal numbers of candidate and non-candidate observations under the algorithm's pairing.

Discarding that balanced segment cannot change the identity of a strict majority in the total sequence.

The next item can safely become a fresh candidate.

### Equality requirements

The method needs a stable equivalence relation.

Equality should be reflexive, symmetric, and transitive over the stream's values.

Values whose equality changes after mutation can invalidate both candidate and verification passes.

Approximate floating equality is not automatically an equivalence relation and can make cancellation order-dependent.

### Misra–Gries invariant

For threshold $n/k$, keep at most $k-1$ counters.

When a new item has no counter and all slots are occupied, decrement every counter and remove zeros.

That step cancels a group of $k$ distinct represented items.

Any value occurring more than $n/k$ times cannot be eliminated from all candidate slots.

Final survivors are a superset of true heavy hitters and require exact counting.

## 3. Step-by-Step Execution Trace

### Input

Use:

```text
[A, B, A, C, A, B, A, A, D, A, A]
```

Length is eleven.

`A` occurs seven times, exceeding $\lfloor11/2\rfloor=5$.

Expected majority is `A`.

### Step table

| Index | Value | Candidate before | Balance before | Action | Candidate after | Balance after |
| ---: | --- | --- | ---: | --- | --- | ---: |
| `0` | `A` | none | `0` | start candidate | `A` | `1` |
| `1` | `B` | `A` | `1` | cancel unequal pair | `A` | `0` |
| `2` | `A` | `A` | `0` | start candidate | `A` | `1` |
| `3` | `C` | `A` | `1` | cancel unequal pair | `A` | `0` |
| `4` | `A` | `A` | `0` | start candidate | `A` | `1` |
| `5` | `B` | `A` | `1` | cancel unequal pair | `A` | `0` |
| `6` | `A` | `A` | `0` | start candidate | `A` | `1` |
| `7` | `A` | `A` | `1` | match | `A` | `2` |
| `8` | `D` | `A` | `2` | cancel unequal pair | `A` | `1` |
| `9` | `A` | `A` | `1` | match | `A` | `2` |
| `10` | `A` | `A` | `2` | match | `A` | `3` |

### Interpret the first cancellations

Positions zero and one form unequal pair `(A,B)` and cancel.

Positions two and three form `(A,C)` and cancel.

Positions four and five form `(A,B)` and cancel.

Six prefix items reduce to an empty multiset.

The remaining suffix is:

```text
[A, A, D, A, A]
```

Within it, one `A` cancels with `D`.

Three unmatched `A` occurrences remain, matching final balance three.

### Verification pass

Count candidate `A` in the original input.

Occurrences appear at indices:

```text
0, 2, 4, 6, 7, 9, 10
```

Count is seven.

Check:

$$
7>11/2.
$$

The candidate is confirmed.

### No-majority trace

Process:

```text
[A, B, C, A, B, C, D]
```

Pairs cancel through several resets.

The final item `D` becomes the survivor with balance one.

`D` occurs once out of seven.

Verification checks:

$$
1\not>7/2.
$$

The correct result is no majority, not `D`.

### Even-length boundary

For:

```text
[X, X, Y, Y]
```

`X` appears exactly half the time.

Strict majority requires more than half, so no majority exists.

An implementation using `>= n/2` would incorrectly accept both possible candidates depending on traversal order.

### Cancellation order insight

Different valid unequal-pair cancellations can leave different survivors when no majority exists.

When a strict majority exists, every complete cancellation process leaves that majority among survivors.

This explains both the theorem and the need for verification outside its promise.

## 4. Production-Ready Implementations

The implementation separates one-pass candidate selection from exact verification.

The exact function consumes a replayable iterable by materializing it once, making its memory contract explicit.

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Generic, Iterable, Optional, Sequence, TypeVar

T = TypeVar("T")


@dataclass(frozen=True, slots=True)
class VoteResult(Generic[T]):
    found: bool
    majority: Optional[T]
    count: int
    total: int


@dataclass(frozen=True, slots=True)
class CandidateVote(Generic[T]):
    found: bool
    candidate: Optional[T]


def majority_candidate(values: Iterable[T]) -> CandidateVote[T]:
    candidate: Optional[T] = None
    balance = 0
    for value in values:
        if balance == 0:
            candidate = value
            balance = 1
        elif value == candidate:
            balance += 1
        else:
            balance -= 1
    return CandidateVote(balance > 0, candidate)


def strict_majority(values: Sequence[T]) -> VoteResult[T]:
    vote = majority_candidate(values)
    total = len(values)
    if not vote.found:
        return VoteResult(False, None, 0, total)
    candidate = vote.candidate
    count = sum(1 for value in values if value == candidate)
    if count > total // 2:
        return VoteResult(True, candidate, count, total)
    return VoteResult(False, None, count, total)


def strict_majority_from_iterable(values: Iterable[T]) -> VoteResult[T]:
    snapshot = tuple(values)
    return strict_majority(snapshot)
```

### Verify promised and unpromised cases

```python
trace = ["A", "B", "A", "C", "A", "B", "A", "A", "D", "A", "A"]
assert majority_candidate(trace) == CandidateVote(True, "A")
assert strict_majority(trace) == VoteResult(True, "A", 7, 11)

no_majority = ["A", "B", "C", "A", "B", "C", "D"]
assert majority_candidate(no_majority) == CandidateVote(True, "D")
assert strict_majority(no_majority) == VoteResult(False, None, 1, 7)

assert strict_majority([]) == VoteResult(False, None, 0, 0)
assert strict_majority(["X"]) == VoteResult(True, "X", 1, 1)
assert strict_majority(["X", "X", "Y", "Y"]).majority is None
assert strict_majority([None, None, "X"]) == VoteResult(True, None, 2, 3)
```

### Misra–Gries candidate reduction

The generic heavy-hitter reducer accepts $k\ge2$ and keeps at most $k-1$ candidates.

Its survivors are verified in a second pass.

```python
def misra_gries_candidates(values: Iterable[T], k: int) -> set[T]:
    if isinstance(k, bool) or not isinstance(k, int):
        raise TypeError("k must be an integer")
    if k < 2:
        raise ValueError("k must be at least 2")
    counters: dict[T, int] = {}
    for value in values:
        if value in counters:
            counters[value] += 1
        elif len(counters) < k - 1:
            counters[value] = 1
        else:
            expired = []
            for candidate in counters:
                counters[candidate] -= 1
                if counters[candidate] == 0:
                    expired.append(candidate)
            for candidate in expired:
                del counters[candidate]
    return set(counters)


def heavy_hitters(values: Sequence[T], k: int) -> dict[T, int]:
    candidates = misra_gries_candidates(values, k)
    exact = {candidate: 0 for candidate in candidates}
    for value in values:
        if value in exact:
            exact[value] += 1
    threshold = len(values) // k
    return {
        candidate: count
        for candidate, count in exact.items()
        if count > threshold
    }
```

### Verify heavy hitters and the majority special case

```python
values = ["a"] * 8 + ["b"] * 5 + ["c"] * 3 + ["d", "e", "f"]
assert heavy_hitters(values, 3) == {"a": 8}
assert heavy_hitters(values, 4) == {"a": 8, "b": 5}

for sample in [trace, no_majority, [], [1, 1, 2, 1]]:
    majority = strict_majority(sample).majority
    hitters = heavy_hitters(sample, 2)
    assert (next(iter(hitters)) if hitters else None) == majority
```

### Randomized differential verification

```python
from collections import Counter
import random

rng = random.Random(20260830)
for length in range(0, 300):
    for _ in range(20):
        sample = [rng.randrange(0, 12) for _ in range(length)]
        counts = Counter(sample)
        expected = None
        for value, count in counts.items():
            if count > length // 2:
                expected = value
                break
        actual = strict_majority(sample)
        assert actual.majority == expected
        for k in range(2, 8):
            expected_heavy = {
                value: count
                for value, count in counts.items()
                if count > length // k
            }
            assert heavy_hitters(sample, k) == expected_heavy
```

### Stream contract

`majority_candidate` truly uses one pass and constant auxiliary state.

`strict_majority_from_iterable` materializes input to make replay possible, so it uses linear memory.

A production stream processor can instead ask the source to replay, maintain an external exact counter for the final candidate, or rely on a documented majority-exists promise.

It must not pretend exact verification occurred when only candidate selection ran.

## 5. Asymptotic Time & Space Complexity

Let $n$ be sequence length and $u$ the number of distinct values.

### Candidate pass

Each value triggers one equality comparison and one counter transition.

Time is $\Theta(n)$.

The algorithm stores one candidate and one integer balance, so auxiliary space is $\Theta(1)$.

The candidate value itself may reference an existing object rather than copy its full representation.

### Verification

Counting the candidate requires another $\Theta(n)$ pass.

Total exact-majority time remains $\Theta(n)$ because two linear passes add.

For a replayable sequence, auxiliary state remains $\Theta(1)$.

Materializing a non-replayable iterable uses $\Theta(n)$ additional references.

### Hash counting comparison

A frequency table uses expected $\Theta(n)$ time under ordinary hashing assumptions and $O(u)$ space.

It finds all exact frequencies in one pass.

Boyer–Moore uses less state because the strict-majority threshold guarantees at most one answer.

### Misra–Gries

At most $k-1$ counters are stored.

A straightforward decrement step touches $O(k)$ counters.

Worst-case candidate-pass time is $O(nk)$ and space is $O(k)$.

When $k$ is treated as a fixed threshold parameter, time is $O(n)$.

Verification counts only surviving candidates and adds $O(n+k)$ expected-time dictionary work under hashing assumptions.

### Lower bound

Exact majority detection has a worst-case $\Omega(n)$ inspection lower bound in the ordinary sequence model.

An unseen final item can change whether a value crosses the strict threshold for carefully chosen prefixes.

The two-pass algorithm is therefore asymptotically optimal in input inspections, though one-pass hash counting offers different memory and output trade-offs.

### Parallel reduction

Candidate states are not combined by simply choosing the larger local balance without respecting candidate identities.

A valid segment summary can represent residual candidate and balance, and summaries can be merged by cancellation rules.

Exact verification still requires global frequency aggregation.

Distributed implementation complexity includes partition reading and communication, not only arithmetic operations.

## 6. Systems Connections

### Streaming telemetry

A stream can nominate a possible majority with constant state.

If exactness is required and the stream cannot be replayed, the first-pass survivor cannot be verified retrospectively without retained counts.

Systems should label an unverified survivor as a candidate, not a confirmed majority.

### Distributed voting

Local majority candidates cannot be accepted as the global majority independently.

Partitions have different sizes, and a value can lose locally while win globally or win one partition without winning overall.

Combine valid cancellation summaries and then count the global survivor exactly.

### Database aggregation

A general `GROUP BY value` computes all frequencies and may require memory, spilling, or sorting.

When the query asks only for a strict majority, cancellation can reduce candidate state before a verification scan.

The storage engine may obtain exact count through an index or second scan.

### Fault and anomaly detection

A majority vote can choose the value supported by more than half of redundant observations.

This is meaningful only when equality, independence, and fault assumptions are defined.

Boyer–Moore identifies a frequency majority; it does not prove the majority value is correct or trustworthy.

### Heavy-hitter sketches

Misra–Gries provides deterministic candidate guarantees for thresholds above $n/k$.

Count-Min Sketch provides approximate frequency estimates with probabilistic error bounds.

Space-Saving targets frequent-item estimation with different error behavior.

Choose based on exactness, deletion support, mergeability, and reporting thresholds.

### API semantics

An API returning `Optional[T]` can distinguish no majority from a value only if stored values do not use the same absence sentinel ambiguously.

Languages with option types handle this cleanly.

Returning count and total alongside the value makes verification auditable.

### Adversarial equality and hashing

The single-candidate algorithm needs equality but not hashing, avoiding collision attacks on a frequency table.

Misra–Gries dictionary implementations use hashing and inherit their language's collision and key-mutation concerns.

Untrusted custom equality can be expensive or stateful and should not execute with unnecessary authority.

## 7. Practice Checklist

### Define the threshold

- Use strictly more than half for majority.
- Translate it to `count > n // 2`.
- Define empty-input behavior.
- Define equality semantics.
- State whether majority existence is guaranteed.
- State whether the input is replayable.

### Implement the vote

- Reset the candidate when balance is zero.
- Increment on equality.
- Decrement on inequality.
- Keep balance nonnegative under the chosen transition form.
- Return a candidate label distinct from a verified result.
- Avoid hashing when only one majority candidate is needed.

### Verify exactness

- Count the final candidate on the original data.
- Compare with the strict integer threshold.
- Test exactly-half frequency.
- Test no-majority input with a survivor.
- Test one item.
- Test empty input.
- Test all equal values.
- Test the majority concentrated at the end.

### Test generalized counters

- Keep at most `k - 1` slots.
- Decrement all slots only when a new untracked item arrives to a full table.
- Remove zero counters after decrement.
- Verify every survivor's exact count.
- Report only counts greater than `n // k`.
- Differential-test against exact frequencies.
- Test several values above and below the boundary.

### Document operational limits

- Distinguish one-pass nomination from exact confirmation.
- Report materialization memory for one-shot iterables.
- Define tie or equal-key behavior.
- Bound value size and equality cost for untrusted input.
- Do not interpret frequency majority as semantic correctness.
- Plan global verification for distributed data.

## 8. Frequently Asked Questions

### What does the balance counter count?

It counts unmatched occurrences of the current candidate after conceptual cancellation of unequal pairs in the processed prefix.

It is not the candidate's total frequency.

### Why does the candidate change only at balance zero?

At zero, the current reduced prefix has no unmatched candidate occurrences.

That cancelled segment cannot determine a strict majority's identity in the remaining processing.

### Does the final candidate always exist?

For nonempty input, the transition form may finish with a survivor or balance zero depending on the sequence.

Even a survivor may fail verification.

### Why is a second pass necessary?

The first pass proves only that any strict majority must be the final survivor.

Inputs without a majority can still produce a survivor.

Counting establishes the frequency threshold.

### Can verification be skipped?

Only when the input contract guarantees that a strict majority exists and that contract is trusted.

Otherwise skipping it changes the problem from exact majority detection to candidate nomination.

### Does the algorithm find the mode?

No.

If no value exceeds half, the mode can differ from the survivor.

Finding an arbitrary exact mode generally requires more frequency information.

### What if two values each occur half the time?

Neither is a strict majority.

Verification rejects any survivor because the test is `>` rather than `>=`.

### Can values be unhashable?

The single-candidate algorithm needs only equality, so unhashable values can work.

The dictionary-based Misra–Gries implementation requires hashable keys.

### Is the algorithm stable under reordering?

If a true majority exists, candidate identity remains that majority under every ordering.

Without a majority, the survivor can change when order changes.

### How does Misra–Gries generalize it?

Boyer–Moore keeps one slot and cancels groups of two distinct values.

Misra–Gries keeps $k-1$ slots and cancels groups represented by $k$ distinct observations, preserving all values above frequency $n/k$ as candidates.

### Can candidate summaries be merged?

Yes, residual `(candidate, balance)` summaries can be combined by weighted cancellation.

The implementation must preserve multiplicities, and the resulting candidate still needs exact global verification.

### Why not always use a hash table?

A hash table provides complete frequencies but uses space proportional to distinct values and depends on hashing.

Boyer–Moore exploits the strict-majority promise to use constant candidate state.

### What happens when equality is approximate?

Approximate comparison may fail transitivity, so cancellation can depend on order and lose its equivalence-class proof.

Canonicalize values into stable classes before voting if approximate grouping is required.

### What is the strongest result contract?

Return a verified optional majority together with its exact count and total, while exposing candidate-only streaming as a separately named operation.
