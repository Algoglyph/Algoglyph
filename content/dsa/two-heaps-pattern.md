# Two Heaps Pattern: Dynamic Medians, Partition Balance & Streaming Order

![Two heaps maintaining lower and upper halves](/images/dsa/two-heaps-pattern-dark.jpg)

## 1. Historical Context & Motivation

Medians require order information.
Sorting after every insertion wastes prior work.
Two heaps maintain a dynamic partition.
A max-heap stores the lower half.
A min-heap stores the upper half.
Their roots expose middle values.
Insertion costs logarithmic time.
Median query costs constant time.
The pattern supports streaming statistics.
It also schedules from two priority regions.
Sliding medians need deletion support.
Ordinary heaps cannot remove arbitrary values efficiently.
Lazy deletion solves that with bookkeeping.
Duplicates make bookkeeping subtle.
Heap size and valid size differ.
Partition membership must be inferred carefully.
For insertion-only streams, the core pattern is compact.
It never stores a sorted full copy.
It still stores every value.
Approximate quantile sketches use much less memory.
Two heaps give an exact median.
Even counts require a policy.
Numeric median often averages two middles.
Generic ordered values may return a pair.
Averaging can overflow fixed-width integers.
This article develops insertion-only medians first.
It then explains sliding-window deletion and operational constraints.

## 2. Core Mathematical Invariants

Lower heap contains smaller values.
Upper heap contains larger values.
Every valid lower value is at most every valid upper value.
Lower is represented as max-heap.
Python uses negated values for that.
Upper is an ordinary min-heap.
Valid sizes differ by at most one.
This article lets lower hold the extra item.

$$
|lower|=|upper|\quad\text{or}\quad|lower|=|upper|+1.
$$

For odd total count, median is lower root.
For even total count, middle pair is lower root and upper root.
Insertion first chooses a side.
If value is at most lower maximum, push lower.
Otherwise push upper.
Rebalance by moving one root.
Ordering survives root movement.
If lower is too large, its maximum moves upper.
Remaining lower values are no greater.
If upper is larger, its minimum moves lower.
Remaining upper values are no smaller.
Empty state has no median.
Duplicate values can inhabit either heap.
The cross-order invariant still holds.
For lazy deletion, physical heap length includes stale entries.
Maintain logical valid sizes separately.
Delayed count maps values awaiting removal.
Prune a heap while its root is delayed.
Decrement delayed count and pop physical root.
Only valid roots may answer median.
Classifying a departing value by comparison to lower root works with a consistent invariant and subsequent pruning.
Duplicates at the boundary can make physical membership ambiguous.
Logical size accounting remains correct if deletion policy is consistent.
Indexed heaps provide an alternative with exact handles.
Balanced multisets provide simpler arbitrary deletion where available.
For weighted medians, ordinary counts are insufficient.
Track cumulative weights around a pivot.
That is a different augmented structure.
Quantile other than median needs uneven target sizes.
The same partition concept generalizes.
Floating NaN breaks total ordering.
Reject it or define an order.
Signed zero and infinities need explicit numeric semantics.

## 3. Step-by-Step Execution Trace

Insert values `5,2,10,4,8`.
Both heaps start empty.
Insert 5 into lower.
Lower valid values are `[5]`.
Median is 5.
Insert 2 into lower initially.
Lower size becomes two.
Upper is empty.
Move lower maximum 5 to upper.
Lower contains 2.
Upper contains 5.
Middle pair is 2 and 5.
Numeric median is 3.5.
Insert 10.
Ten exceeds lower maximum two.
Push it upper.
Upper size becomes two.
Move upper minimum five to lower.
Lower values are 2 and 5.
Upper contains 10.
Median is lower maximum 5.
Insert 4.
Four is at most lower maximum five.
Push lower.
Lower size becomes three.
Move maximum five to upper.
Lower contains 2 and 4.
Upper contains 5 and 10.
Median is `(4+5)/2=4.5`.
Insert 8.
Eight exceeds lower maximum four.
Push upper.
Upper size becomes three.
Move upper minimum five to lower.
Lower contains 2,4,5.
Upper contains 8,10.
Median is 5.
Ordering holds after every move.
Now consider sliding window size three.
First window `[5,2,10]` has median five.
Slide by removing 5 and adding 4.
Mark 5 for delayed deletion.
Its logical heap side loses one.
Add 4.
Rebalance and prune roots.
Valid window `[2,10,4]` has median four.
Slide by removing 2 and adding 8.
Stale values may remain below a root.
They consume physical storage temporarily.
They are pruned only when exposed.
Valid window `[10,4,8]` has median eight.
The logical-size invariant drives answers.
Physical array lengths cannot.
This is the core lazy-deletion distinction.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

import heapq
import math


class StreamingMedian:
    def __init__(self) -> None:
        self._lower: list[float] = []
        self._upper: list[float] = []

    def __len__(self) -> int:
        return len(self._lower) + len(self._upper)

    def add(self, value: float) -> None:
        if math.isnan(value):
            raise ValueError("NaN has no supported total order")
        if not self._lower or value <= -self._lower[0]:
            heapq.heappush(self._lower, -value)
        else:
            heapq.heappush(self._upper, value)
        self._rebalance()

    def _rebalance(self) -> None:
        if len(self._lower) > len(self._upper) + 1:
            heapq.heappush(self._upper, -heapq.heappop(self._lower))
        elif len(self._upper) > len(self._lower):
            heapq.heappush(self._lower, -heapq.heappop(self._upper))

    def middle_pair(self) -> tuple[float, float]:
        if not self:
            raise LookupError("median of empty stream")
        lower = -self._lower[0]
        upper = lower if len(self._lower) > len(self._upper) else self._upper[0]
        return lower, upper

    def median(self) -> float:
        lower, upper = self.middle_pair()
        return lower + (upper - lower) / 2.0


def demo() -> None:
    stream = StreamingMedian()
    expected = [5.0, 3.5, 5.0, 4.5, 5.0]
    for value, median in zip([5, 2, 10, 4, 8], expected):
        stream.add(value)
        assert stream.median() == median


if __name__ == "__main__":
    demo()
```

The midpoint formula reduces overflow risk.
Python floats can still lose integer precision.
For exact integers, return the middle pair.
Use rational arithmetic if exact average matters.
The implementation is insertion-only.
Do not fake sliding deletion with linear heap removal.
Use lazy deletion or indexed heaps.
Lazy deletion needs valid-size counters.
Prune roots before comparisons and answers.
Periodically rebuild if stale storage grows too large.
For bounded windows, stale entries are bounded by operations but can accumulate physically.
A balanced multiset may be clearer.
C++ offers multiset iterators.
Python may use sorted containers from a trusted library.
Thread safety requires a lock around both heaps.
Median must observe one coherent partition.
Persist both heaps and their policy together.
Validate cross ordering after deserialization.
Property-test against sorting every prefix.
Include duplicates and infinities.
Reject NaN consistently.
Bound stream size when exact retention is unsafe.
Use quantile sketches for huge streams.

## 5. Asymptotic Time & Space Complexity

Insertion performs one heap push.
It may perform one pop and push for rebalancing.
Time is $O(\log n)$.
Median query reads one or two roots.
Time is $O(1)$.
Retained space is $O(n)$.
Exact median needs enough order information.
Two heaps retain all values.
Building from $n$ repeated insertions costs $O(n\log n)$.
Specialized bulk partitioning can build in linear time.
Sliding lazy deletion uses $O(\log k)$ amortized update time for window size $k$.
Each stale entry is eventually popped once.
Median stays $O(1)$ after required root pruning.
Physical stale storage can exceed $k$ temporarily.
Rebuild policies control constants.
Sorting each prefix costs $O(n\log n)$ per query naïvely.
Maintaining a sorted array inserts in $O(n)$ due to shifts.
Balanced order-statistic trees give $O(\log n)$ updates and queries.
Approximate sketches use sublinear memory depending on error guarantees.
They do not return exact medians.
Heap comparison cost may include large key comparisons.
Expose that when keys are not constant-size numbers.

## 6. Systems Connections

Streaming telemetry uses two heaps to report a continuously changing median.
The median resists isolated extreme values better than the arithmetic mean.
Schedulers can divide waiting work around a moving priority threshold.
Interactive dashboards can update a median without sorting every snapshot.
Sliding-window analytics adds deletion, which ordinary heaps do not support directly.
Lazy deletion records values scheduled for removal in a side table.
Before reading a heap top, prune entries whose delayed count is positive.
Logical heap sizes must exclude delayed entries while arrays retain them.
Duplicate values require delayed counts rather than a boolean marker.
Window expiration must determine which logical half owned the outgoing value.
Order-statistic trees are often simpler when arbitrary deletion is frequent.
Approximate quantile sketches are preferable when memory must be sublinear.
Two heaps compute an exact median but not arbitrary percentiles efficiently.
Serialization must preserve both heaps and lazy-deletion state consistently.
Monitoring should expose rebalance counts and stale-entry backlog.
Tests should compare every update with a sorted reference multiset.
Telemetry computes online latency medians.
Exact retention may be too expensive.
Production monitoring usually uses quantile sketches.
Sliding dashboards need expiration.
Lazy heaps or windowed sketches support it.
Scheduling uses two heaps for available and delayed jobs.
That pattern is related but not necessarily a median partition.
Running-median filters reduce impulse noise.
Window deletion dominates implementation complexity.
Load balancing can partition lower and upper priorities.
Business rules define which root is actionable.
Database percentile queries often sort or use selection algorithms.
Streaming approximate percentiles avoid raw retention.
Financial systems require exact decimal policies.
Floating average can be unacceptable.
Concurrent ingestion needs atomic partition updates.
Snapshots should not read heaps mid-rebalance.
Untrusted streams need memory limits.
Exact medians on infinite streams grow forever.
Two heaps show how an invariant delivers speed while a systems budget determines feasibility.

## 7. Practice Checklist

- Define lower max-heap.
- Define upper min-heap.
- Preserve cross ordering.
- Preserve size difference.
- Choose which heap holds odd extra.
- Define even-count result.
- Avoid integer overflow in averaging.
- Reject or order NaN.
- Test infinities.
- Test empty median.
- Test one value.
- Test ascending input.
- Test descending input.
- Test duplicates.
- Rebalance after every update.
- Move only roots.
- Validate lower root <= upper root.
- Compare each prefix with sorting.
- Separate physical and valid sizes for lazy deletion.
- Track delayed multiplicities.
- Prune stale roots.
- Rebalance using valid sizes.
- Rebuild excessive stale storage.
- Do not linearly remove heap interiors.
- Use handles for indexed deletion.
- Lock both heaps together.
- Snapshot coherent state.
- Bound exact retention.
- Use sketches for massive streams.
- Document approximation if used.
- Include key comparison cost.
- Return middle pair for generic values.
- Use rational arithmetic when required.
- Define duplicate boundary handling.
- Test sliding expiration.
- Test outgoing root values.
- Test stale buried values.
- Keep invariants in one helper.
- Persist policy with data.
- Choose exactness deliberately.

## 8. Frequently Asked Questions

### Why two heaps?

Their roots expose the largest lower value and smallest upper value.

### Where is the median?

At the lower root for odd size, or between both roots for even size.

### How fast is insertion?

$O(\log n)$ because heap push and possible rebalance dominate.

### How fast is median lookup?

$O(1)$ after invariants and root pruning hold.

### Does it support deletion?

Not arbitrary deletion directly.
Sliding windows need lazy deletion, indexed heaps, or balanced multisets.

### Why track logical sizes?

Lazy-deleted entries remain physically present until they reach a root.

### Can duplicate values be stored?

Yes.
They may occupy either side while cross ordering remains valid.

### Why reject NaN?

NaN comparisons do not define the total order required by heaps.

### Does exact streaming median use bounded memory?

No.
Insertion-only exact heaps retain every value.

### What handles huge streams?

Quantile sketches trade exactness for bounded memory and explicit error guarantees.

### Is averaging two integers safe?

Use an overflow-safe formula or return the pair; fixed-width addition can overflow.

### When should this pattern be chosen?

Choose it for exact dynamic medians when logarithmic updates and linear retained storage are acceptable.
