# Two Pointers: Monotone Boundaries, Pair Search & In-Place Compaction

![Two pointers moving across an ordered sequence](/images/dsa/two-pointer-technique-dark.jpg)

## 1. Historical Context & Motivation

Two pointers replace repeated rescanning with coordinated boundaries.
They solve pair search in sorted arrays.
They compact arrays in place.
They compare sequences at different rates.
They partition ranges.
The technique is not one algorithm.
Its guarantee comes from monotone pointer movement.
Each pointer advances or retreats without undoing progress.
Total movement is linear.
Sorted two-sum is the canonical example.
If the endpoint sum is too small, move the left pointer right.
If too large, move the right pointer left.
Ordering proves discarded pairs cannot work.
Without sorting, that proof fails.
Hashing is then a common alternative.
Same-direction pointers support compaction.
One pointer reads.
One pointer writes accepted values.
Fast–slow cycle detection is related but has modular motion rather than interval elimination.
Sliding windows are a specialized two-boundary pattern with maintained range state.
Two-pointer code is short and frequently wrong.
Off-by-one conditions matter.
Duplicate handling matters.
Output semantics matter.
Mutation can overwrite unread data.
This article develops the proof obligations behind the pattern.

## 2. Core Mathematical Invariants

For sorted pair sum, active candidates lie in rectangle of indices $l\le i<j\le r$.
If `a[l] + a[r] < target`, then `a[l] + a[j]` is too small for every $j\le r$.
Index $l$ can be discarded.
If endpoint sum is too large, every pair using $r$ and $i\ge l$ is too large.
Index $r$ can be discarded.
One candidate boundary disappears each step.
The target pair, if present, remains active.
Pointers move at most $n$ total positions.
For compaction, read scans every input position.
Write marks the next accepted output slot.
Before each read step, prefix `[0,write)` contains exactly accepted elements from processed input.
Their relative order is preserved.
Write never exceeds read plus one.
Writing cannot destroy an unread element.
After completion, write is new logical length.
For palindrome checking, left and right delimit the unchecked interval.
All symbols outside it have matched symmetrically.
Skipping punctuation must preserve the same normalization policy on both sides.
For merge, pointers identify first unconsumed values in two sorted inputs.
The smaller front is globally next.
Each input pointer advances once per emitted element.
For duplicate pair enumeration, skipping repeated values prevents duplicate value pairs.
Skip only after recording or rejecting according to the contract.
Index-pair enumeration has different output size.
Many equal values can produce quadratic index pairs.
No linear algorithm can materialize quadratic output in linear time.
Pointer progress is a termination invariant.
Every loop branch must move at least one pointer or return.
Otherwise equality cases can loop forever.
Sorting as preprocessing costs $O(n\log n)$.
Do not claim overall linear time when sorting was required.
If original indices are needed, sort decorated `(value,index)` records.
That uses extra storage and changes tie handling.
Signed arithmetic can overflow in fixed-width endpoint sums.
Compare safely or widen the type.

## 3. Step-by-Step Execution Trace

Use sorted array `[1,2,4,7,11,15]` and target 15.
Start left zero at value one.
Start right five at value fifteen.
Sum is sixteen, too large.
Discard right index five.
Move right to four, value eleven.
Sum one plus eleven is twelve, too small.
Discard left index zero.
Move left to one, value two.
Sum two plus eleven is thirteen.
Move left to two, value four.
Sum four plus eleven is fifteen.
Return indices two and four.
Every discarded endpoint was proven impossible.
Now compact `[1,1,2,2,2,3]` to unique values.
Read starts at zero.
Write starts at zero.
Read first one and write it at zero.
Write becomes one.
Read second one and reject duplicate.
Read two and compare with last accepted one.
Write two at index one.
Write becomes two.
Reject the next two values.
Read three and write at index two.
New logical prefix is `[1,2,3]`.
New length is three.
Unread values were never overwritten prematurely.
Now test palindrome text `A man, a plan, a canal: Panama`.
Left skips spaces and punctuation.
Right does the same.
Case-folded endpoint symbols match.
Move inward repeatedly.
When pointers cross, every relevant pair matched.
Return true.
Now remove sorting from pair example.
Array `[11,1,15,4,2,7]` has same values.
Endpoint comparison no longer bounds interior values.
Moving one endpoint can discard a valid pair without proof.
The algorithm is invalid despite identical code structure.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

from collections.abc import Sequence


def two_sum_sorted(values: Sequence[int], target: int) -> tuple[int, int] | None:
    left = 0
    right = len(values) - 1
    while left < right:
        total = values[left] + values[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None


def compact_unique(values: list[int]) -> int:
    write = 0
    for value in values:
        if write == 0 or values[write - 1] != value:
            values[write] = value
            write += 1
    return write


def is_ascii_palindrome(text: str) -> bool:
    left = 0
    right = len(text) - 1
    while left < right:
        while left < right and not text[left].isalnum():
            left += 1
        while left < right and not text[right].isalnum():
            right -= 1
        if text[left].casefold() != text[right].casefold():
            return False
        left += 1
        right -= 1
    return True


def demo() -> None:
    assert two_sum_sorted([1, 2, 4, 7, 11, 15], 15) == (2, 4)
    data = [1, 1, 2, 2, 2, 3]
    length = compact_unique(data)
    assert data[:length] == [1, 2, 3]
    assert is_ascii_palindrome("A man, a plan, a canal: Panama")


if __name__ == "__main__":
    demo()
```

Pair search assumes ascending order.
Validate or document that precondition.
Compaction assumes duplicates are adjacent.
That also requires sorted input for global uniqueness.
The palindrome name says ASCII intent.
Python methods accept broader Unicode.
True grapheme semantics require a dedicated segmentation policy.
Case folding can expand symbols.
For strict user-facing matching, normalize first.
In-place compaction leaves stale suffix values.
Consumers must honor returned length.
Optionally delete the suffix afterward.
That changes physical list length.
For original pair indices, decorate before sorting.
For all unique value pairs, continue after matches and skip duplicates.
For all index pairs, account for multiplicities.
Property-test sorted two-sum against nested loops.
Property-test compaction against stable filtering.
Use widened arithmetic in fixed-width languages.

## 5. Asymptotic Time & Space Complexity

Sorted pair search moves boundaries at most $n$ times.
Time is $O(n)$.
Auxiliary space is $O(1)$.
Sorting unsorted input first costs $O(n\log n)$ time.
Decorated sorting costs $O(n)$ extra records.
Hash two-sum costs expected $O(n)$ time and $O(n)$ space.
Compaction scans once.
Its time is $O(n)$.
Its auxiliary space is $O(1)$.
Palindrome scanning is $O(n)$.
Each endpoint crosses symbols once.
Merging two sorted arrays costs $O(n+m)$ time.
Output uses $O(n+m)$ space unless destination capacity permits backward in-place merge.
Enumerating $k$ answers costs at least $O(k)$.
Duplicate index pairs can make $k=\Theta(n^2)$.
Nested loops are not automatically avoided by two variables.
The linear proof requires monotone aggregate movement.
Sliding windows may maintain maps of $O(k)$ state.
Fast–slow pointers use $O(1)$ space.
Complexity follows the specific invariant, not the phrase “two pointers.”

## 6. Systems Connections

Two-pointer scans appear whenever a system consumes ordered runs.
Database merge joins advance through two sorted key streams.
If the left key is smaller, only the left cursor advances.
If the right key is smaller, only the right cursor advances.
Equal keys trigger the join's duplicate-group policy.
Log reconciliation compares ordered event identifiers similarly.
Storage compaction merges sorted immutable tables with one cursor per input.
A two-run merge is the basic case of a multiway heap merge.
Packet parsers use read and write cursors to decode in place.
The write cursor must not overtake unread bytes unless overlap permits it.
Garbage collectors use scanning and allocation cursors in copying spaces.
The scan cursor identifies copied objects whose references remain unprocessed.
The allocation cursor marks the end of copied data.
When the cursors meet, traversal of the reachable closure is complete.
Image pipelines trim borders using opposing row and column boundaries.
Columnar query engines compact qualifying rows with read and output positions.
SIMD implementations move logical cursors in blocks rather than scalar steps.
They must preserve the same invariant across lane masks.
Network receive buffers track consumed and produced offsets in circular storage.
Those cursors use modular arithmetic rather than a linear interval.
Concurrency makes cursor ownership part of the contract.
Single-producer single-consumer rings assign one cursor to each participant.
Memory ordering is then as important as index arithmetic.
External sorting merges disk runs sequentially and benefits from read-ahead.
The algorithm remains linear in records, but buffering determines throughput.
Text normalization must define character boundaries before opposite-end comparison.
UTF-8 byte reversal is not Unicode character reversal.
Security checks should normalize once under a documented policy.
Repeated ad hoc normalization can make the two sides disagree.
Interval algorithms also shrink feasible regions with left and right boundaries.
The technique applies only when discarded regions are provably irrelevant.
Without monotonicity, pointer movement can skip valid answers.
Telemetry should count scanned, emitted, and duplicate-skipped elements.
Those counts reveal selectivity and pathological workloads.
APIs should clarify whether pairs contain values or original indexes.
Sorting decorated records preserves indexes at extra space cost.
Stable compaction promises accepted elements retain input order.
Unstable compaction may swap from the end to reduce writes.
Neither policy is universally better.
Write-heavy storage may favor fewer assignments over stable ordering.
Read-only input requires separate output despite an in-place logical pattern.
Aliased input and output buffers need an overlap-safe direction.
The standard `memmove` problem is a direction-selection example.
Copy left-to-right when destination begins before the source.
Copy right-to-left when destination overlaps from the right.
That direction preserves bytes not yet read.
This is the same proof style as in-place compaction.
Production code should derive movement from overwrite and elimination invariants.
Benchmarks should include duplicate-heavy and no-solution inputs.
Tests should assert termination on every equality branch.
Code review should require a stated reason for each pointer movement.
Parsers scan delimiters from both ends.
Storage engines merge sorted runs with two read cursors.
Compactors copy live records with read and write positions.
Network buffers parse consumed and available boundaries.
Text editors compare common prefixes and suffixes.
Diff algorithms trim matching ends before deeper work.
Image processing compacts selected pixels.
Database merge joins advance sorted relation cursors.
They handle duplicate groups explicitly.
Garbage collectors use scan and allocation pointers in copying spaces.
Security parsers must avoid overflow and inconsistent normalization.
Streaming merges need backpressure and bounded output.
Two-pointer invariants appear wherever monotone cursors consume ordered regions.

## 7. Practice Checklist

- State sortedness requirements.
- Define pointer meanings.
- Define active candidate region.
- Prove each discard safe.
- Move a pointer every iteration.
- Use `left < right` for distinct pairs.
- Use `left <= right` only when self-pair semantics allow it.
- Handle empty input.
- Handle one element.
- Test target at boundaries.
- Test absent target.
- Test duplicates.
- Define one pair or all pairs.
- Define value pairs or index pairs.
- Include output size.
- Skip duplicates carefully.
- Preserve stable order during compaction.
- Return logical length.
- Do not read stale suffix.
- Widen sums against overflow.
- Normalize text consistently.
- Define symbol units.
- Compare with brute force.
- Test all-equal input.
- Test negative values.
- Include sorting cost.
- Preserve original indices if required.
- Use hashing when order is absent.
- Use sliding-window state only for contiguous ranges.
- Keep fast–slow logic separate.
- Verify monotone movement.
- Bound stream buffers.
- Avoid mutation of unread elements.
- Push output incrementally when large.
- Document tie order.
- Test crossing pointers.
- Test equality branch progress.
- Measure comparisons and writes.
- Choose pattern from proof.
- Reject cargo-cult pointer movement.

## 8. Frequently Asked Questions

### Why is sorted two-sum linear?

Each comparison safely discards one endpoint, and endpoints move at most $n$ positions.

### Does it work on unsorted arrays?

Not with the same discard proof.
Sort first or use hashing.

### Why use two pointers for compaction?

One scans every element while one marks the next accepted output slot.

### Is a sliding window the same pattern?

It is a specialized two-boundary technique with maintained contiguous-range state.

### How are duplicates handled?

The answer contract decides whether to skip repeated values or emit every index combination.

### Can output be quadratic?

Yes.
All index pairs among duplicates can number $\Theta(n^2)$.

### Why can sums overflow?

Adding two fixed-width endpoints may exceed the numeric range before comparison.

### Is palindrome comparison Unicode-safe?

Only under a defined normalization and symbol policy; code points are not always user-perceived characters.

### Why must pointers progress?

Without progress, equality or rejection branches can loop forever.

### What is the main proof obligation?

Show that every movement discards no possible required answer.

### When is hashing better?

For unsorted exact pair lookup when extra linear memory is acceptable.

### When should this technique be chosen?

Choose it when ordering or monotone consumption lets each boundary move only forward through the search state.
