# Linear Search: Sequential Lookup with Minimal Assumptions

![Linear search](/images/dsa/linear-search-dark.jpg#dark)

Linear search examines elements in sequence until it finds a match or exhausts the input.
It requires no sorting, index, hashing, or random access.
Its $O(n)$ worst case is not a failure of imagination; under those minimal assumptions, every unseen element may still be the answer.

## 1. Historical Context & Motivation

### The baseline lookup algorithm

Searching begins with a predicate and a sequence.
If nothing is known about element order or value distribution, inspect candidates one at a time.
That procedure is linear search.

The algorithm predates electronic computers as a general method of scanning records.
It remains the correct baseline for small collections, streams, linked structures, and one-time queries.

### Why simple algorithms matter

Binary search is faster asymptotically but requires sorted random-access data.
Hash lookup is fast on average but requires building and storing an index under suitable equality and hash semantics.
Linear search pays no preprocessing cost and preserves input order.

For a collection of ten elements searched once, constructing an elaborate index can cost more than scanning.
For millions of repeated queries, the trade-off reverses.

### Search variants

Linear scans can return:

- the first matching index;
- the first matching value;
- every matching position;
- a count;
- a boolean existence result;
- the minimum element satisfying a predicate;
- a streaming iterator of matches.

The required result determines whether scanning can stop early.

### Equality and predicates

Searching for a value uses equality.
Searching records often uses a predicate such as `record.id == target`.
The predicate can dominate runtime if it parses text, performs normalization, or accesses remote state.

Keep predicates pure when possible.
Side effects make early termination observable and complicate retries or parallelization.

### Problem statement

Given sequence $A=(a_0,\ldots,a_{n-1})$ and predicate $P$, return the smallest index $i$ satisfying $P(a_i)$, or report no match.

The first-match contract makes order significant.
Returning any match is a different interface.

## 2. Core Mathematical Invariants

### Prefix invariant

Before examining index $i$, every earlier index has been ruled out:

$$
\forall j<i,\;\neg P(a_j).
$$

If $P(a_i)$ is true, $i$ is therefore the first matching index.
If it is false, advancing to $i+1$ preserves the invariant.

### Initialization

At $i=0$, there are no earlier indices.
The invariant holds vacuously.

### Termination with success

When the algorithm returns index $i$, the predicate holds there and fails at every smaller index.
The result satisfies the first-match specification.

### Termination without success

If the loop reaches $i=n$, the prefix invariant covers the whole sequence:

$$
\forall j<n,\;\neg P(a_j).
$$

Reporting no match is correct.

### Comparison lower bound

In the worst case, the matching element is last or absent.
An algorithm that leaves one unconstrained element unseen cannot distinguish these two inputs:

- the unseen element does not match;
- the unseen element is the only match.

Therefore any exact search under no additional structure needs $\Omega(n)$ predicate evaluations in the worst case.
Linear search is asymptotically optimal for that model.

### Expected comparisons

If a unique match is equally likely at any position and guaranteed to exist, expected comparisons are

$$
\frac{1+2+\cdots+n}{n}=\frac{n+1}{2}.
$$

If absence has probability $q$, it contributes $qn$ comparisons.
Real distributions are rarely uniform; frequently requested values near the front improve average cost.

### Sentinel invariant

A sentinel variant temporarily places the target at the end so the inner loop omits a bounds check.
It must restore the overwritten value and distinguish a genuine final-position match from the sentinel.

This mutation is unsafe for immutable, shared, concurrent, or empty inputs.
Modern optimizers and branch predictors often make the ordinary bounded loop preferable.

### Iterator invariant

For a one-pass iterator, processed values cannot be revisited unless stored externally.
After consuming $i$ elements, the invariant applies to that consumed prefix.
Returning an index requires maintaining a counter because random-access position may not exist.

### Stable first match

Linear search naturally preserves sequence priority.
If multiple elements match, the earliest is returned.
Parallel chunk search must reduce local results by minimum global index to preserve that semantic.

### Mutation during search

Changing collection length or order during iteration can invalidate positions and skip elements.
APIs should forbid structural mutation, snapshot input, or specify iterator invalidation behavior.

## 3. Step-by-Step Execution Trace

### Input

Search for target $18$ in

```text
[7, 4, 18, 2, 18, 9]
```

The contract requests the first matching index.

### Index zero

Before inspection, no earlier position exists.
Compare $7$ with $18$.
They differ.
The ruled-out prefix becomes `[7]`.

### Index one

The invariant says index zero is not a match.
Compare $4$ with $18$.
They differ.
Indices zero and one are now ruled out.

### Index two

Compare $18$ with target $18$.
They match.
Return index two immediately.

The later $18$ at index four is never inspected.
That is correct for first-match semantics.

### Comparison count

The search made three equality comparisons.
It did not need to inspect the suffix `[2,18,9]`.
Best-case early termination is one comparison.

### Absent target

Search for $6$ in the same sequence.
Every element differs.
After six comparisons, the processed prefix is the entire sequence.
Return no match.

### Predicate search

Consider records:

```text
[("Ada", 12), ("Lin", 7), ("Sam", 15), ("Mia", 15)]
```

Find the first record with score at least ten.
The predicate succeeds for `("Ada", 12)` at index zero.
Return immediately even though other records also qualify.

### Find-all variation

To return every position of value $18$, early termination is invalid.
Scan all six values and collect indices two and four.

The invariant changes: after processing prefix $[0,i)$, the output list contains exactly every matching index in that prefix.

### Linked-list trace

For nodes `A -> B -> C -> null`, search for `C`.
Inspect `A`, advance the pointer.
Inspect `B`, advance.
Inspect `C`, return its node or logical index.

No random access is required.
Binary search would not help because reaching a midpoint itself takes linear traversal.

### Streaming trace

A log stream yields events one at a time.
Search for the first event whose severity is `critical`.
Once found, stop consuming the stream.
Values after that event may never be produced.

The algorithm's early termination can therefore save computation upstream, not only local comparisons.

## 4. Production-Ready Implementations

### Generic Python search

```python
from collections.abc import Callable, Iterable
from typing import TypeVar


T = TypeVar("T")


def find_index(values: Iterable[T], predicate: Callable[[T], bool]) -> int | None:
    for index, value in enumerate(values):
        if predicate(value):
            return index
    return None


assert find_index([7, 4, 18, 2, 18, 9], lambda value: value == 18) == 2
assert find_index([7, 4, 18], lambda value: value == 6) is None
assert find_index([], lambda value: True) is None
```

Returning `None` separates absence from valid index zero.
An API returning `-1` is also common but must be documented.

### Find all positions

```python
from collections.abc import Iterable, Iterator


def matching_indices(values: Iterable[T], predicate: Callable[[T], bool]) -> Iterator[int]:
    for index, value in enumerate(values):
        if predicate(value):
            yield index


assert list(matching_indices([7, 4, 18, 2, 18], lambda x: x == 18)) == [2, 4]
```

The generator avoids allocating a result list and can stop when the consumer has enough matches.

### C++ iterator implementation

```cpp
#include <algorithm>
#include <functional>
#include <iterator>

template <class InputIt, class Predicate>
InputIt linear_find_if(InputIt first, InputIt last, Predicate predicate) {
    for (; first != last; ++first) {
        if (std::invoke(predicate, *first)) {
            return first;
        }
    }
    return last;
}
```

This mirrors `std::find_if` semantics.
Returning the end iterator avoids inventing a sentinel value of the element type.

### Search with projection

Records often need key extraction before comparison.
Separate projection from equality so normalization and key semantics are testable.

```python
def find_by_key(
    values: Iterable[T],
    target: object,
    key: Callable[[T], object],
) -> T | None:
    for value in values:
        if key(value) == target:
            return value
    return None


records = [{"id": 10, "name": "Ada"}, {"id": 20, "name": "Lin"}]
assert find_by_key(records, 20, lambda record: record["id"]) == records[1]
```

### Avoid repeated expensive normalization

If every query lowercases every stored string, preprocessing normalized keys may be worthwhile.
That turns one scan into an indexed or cached design decision.
Preserve original values and define Unicode normalization deliberately.

### Concurrent collections

Do not iterate a mutable collection concurrently without its synchronization contract.
A snapshot provides stable first-match semantics at copying cost.
A lock protects consistency but can hold a critical section for $O(n)$ time.

## 5. Asymptotic Time & Space Complexity

### First-match search

Best case is $O(1)$ when the first element matches.
Worst case is $O(n)$ when the match is last or absent.
Average behavior depends on match-position distribution and predicate cost.

If one predicate evaluation costs $P$, worst-case time is

$$
O(nP).
$$

Do not hide an expensive predicate behind the phrase “linear search.”

### Space

An iterative search uses $O(1)$ auxiliary state.
The input itself is not auxiliary space.
Returning all $k$ matches requires $O(k)$ output if materialized.

### Repeated queries

$q$ independent scans cost $O(qn)$ in the worst case.
Building a hash index costs expected $O(n)$ time and $O(n)$ space, followed by expected $O(1)$ exact-key queries under ordinary assumptions.

The break-even point depends on constants, updates, memory, and predicate semantics.

### Sorted data

Binary search on sorted random-access data costs $O(\log n)$ per query.
Sorting unsorted data first costs $O(n\log n)$ and changes order.
For one query, linear search may still be cheaper.

### Cache behavior

Sequential array scanning has excellent locality and can be vectorized.
For small or moderate collections, it can outperform pointer-heavy indexes despite more comparisons.
Big-O does not model cache misses.

### Parallel scan

$p$ workers can scan chunks in roughly $O(n/p)$ local work plus coordination.
Preserving first-match semantics requires selecting the smallest matching global index and may limit early cancellation.
For cheap predicates, parallel overhead often outweighs benefit.

## 6. Systems Connections

### Small-table lookup

Compilers and protocol handlers often scan tiny fixed tables.
The code is compact and contiguous.
A hash table would add allocation and indirection without useful asymptotic benefit at that scale.

### SIMD scanning

Byte and numeric searches can compare several elements per instruction.
Library functions such as byte search exploit vector instructions and aligned loads.
The algorithm is still linear even when its constant improves substantially.

### Database scans

A database without a usable index scans rows and applies a predicate.
Storage engines process pages, visibility rules, and vectorized batches, so the physical scan is more complex than an array loop.
An index is beneficial only when maintenance and lookup costs fit the workload.

### Log streams

Sequential search can stop at the first event satisfying a condition.
If logs are remote or compressed, predicate order and early termination can save I/O and decompression.

### Linked structures

Linked lists lack constant-time midpoint access.
Linear search follows links naturally in $O(n)$ time.
Poor locality increases the constant compared with arrays.

### Security

Attacker-controlled input can force absent-match worst cases repeatedly.
Bound collection size and query rate.
Avoid predicates with catastrophic parsing behavior.

### Side channels

Early termination reveals match position through timing.
Cryptographic comparisons sometimes require constant-time scans that deliberately inspect all relevant bytes.
Ordinary linear search is not constant-time with respect to secret position.

### Self-organizing sequential search

When query frequencies are highly skewed, a mutable list can move successful items toward the front.
The **move-to-front** rule relocates every matched item to index zero.
The **transpose** rule swaps a matched item with its immediate predecessor.

These policies trade stable order for lower expected positions of frequently requested values.
They are valid only when sequence order has no independent semantic meaning.

Suppose keys are requested with probabilities $p_0,\ldots,p_{n-1}$ and stored at positions $r_0,\ldots,r_{n-1}$.
Expected comparisons are

$$
\sum_{i=0}^{n-1}p_i(r_i+1).
$$

If probabilities are known and fixed, ordering keys by decreasing probability minimizes this expression.
If they change over time, self-organizing rules adapt without maintaining exact frequency statistics.

Move-to-front can overreact to one unusual request.
Transpose adapts more slowly.
Neither replaces a hash index when many exact queries and extra memory are acceptable.

### Batched membership scans

Searching the same array independently for $q$ targets costs $O(qn)$.
If all targets are known together, place them in a hash set and scan the array once.
That finds which targets occur in expected $O(n+q)$ time under ordinary hashing assumptions.

The batched method changes output semantics.
To retain the first index of every target, store an index only on its first occurrence.
To preserve duplicate target requests, map one target key to every requested output position.

If the target batch is tiny, repeated vectorized scans can still be faster than building a hash set.
Representation size and cache behavior decide the practical crossover.

### Memory-mapped scanning

A file-backed array can be scanned without copying the complete file into a separate buffer.
Sequential access lets the operating system prefetch pages effectively.
Random index structures can cause more scattered page faults.

The algorithm remains $O(n)$ in elements, but storage performance is measured in page reads and bandwidth.
Stopping at an early match may avoid reading the remainder of the file.

### Cancellation and deadlines

Long scans in interactive systems should periodically observe cancellation.
Checking a cancellation token on every element may add overhead, so implementations often check once per block.

Cancellation changes the result type.
A cancelled search is not equivalent to “target absent” because the unexamined suffix may contain a match.
Return a distinct cancellation or timeout status.

## 7. Practice Checklist

### Contract

- Return first match or any match?
- Return index or value?
- Define absence result.
- Define equality.
- Define mutation behavior.
- Define iterator consumption.
- Define ordering guarantees.

### Correctness

- State the ruled-out-prefix invariant.
- Initialize at index zero.
- Advance exactly once after failure.
- Stop immediately for first-match success.
- Scan fully for find-all semantics.
- Preserve original order.

### Tests

- Empty input.
- One matching element.
- One nonmatching element.
- Match first.
- Match middle.
- Match last.
- Target absent.
- Duplicate matches.
- Predicate with structured records.
- One-pass generator input.

### Performance

- Count predicate cost.
- Avoid repeated normalization.
- Use contiguous storage when possible.
- Reconsider after many repeated queries.
- Compare with binary search only if sorted.
- Compare with hashing only if equality supports it.
- Measure before parallelizing.

### Safety

- Do not mutate during iteration.
- Avoid ambiguous sentinels.
- Bound adversarial scans.
- Consider timing leakage for secrets.
- Define exception behavior from predicates.
- Handle iterator exhaustion.

## 8. Frequently Asked Questions

### Why is it called linear search?

Worst-case work grows linearly with the number of elements inspected.

### Does the input need to be sorted?

No.
That is one of linear search's main advantages.

### Is $O(n)$ always slow?

No.
Sequential scans have low overhead and good locality, especially for small collections.

### When should I use binary search instead?

When data is sorted, random access is available, and query volume justifies maintaining order.

### When should I build a hash table?

For many exact-key queries when extra memory, hash semantics, and update maintenance are acceptable.

### What should absence return?

Use an option, end iterator, or documented sentinel such as `-1` that cannot be confused with a valid result.

### Can linear search work on a stream?

Yes.
It only needs the next value and can stop without materializing the stream.

### Why return the first match?

It provides deterministic order-based semantics and enables early termination.
Other contracts can return any or all matches.

### What if the predicate throws?

Unless the API catches it, the search stops and propagates the exception.
Previously inspected elements remain inspected but the input should not be partially mutated.

### Can a sentinel search be faster?

It removes an inner bounds check but mutates storage and complicates safety.
Use it only after profiling and under exclusive mutable ownership.

### Is a vectorized scan still linear search?

Yes.
It compares batches per instruction but still examines a linear amount of data in the worst case.

### How can first-match search be parallelized?

Scan chunks, report local first positions, and reduce by minimum global index.
Coordination can erase the benefit for cheap predicates.

### Why can an index be worse?

Indexes consume memory, cost time to build and update, and add indirection.
For few queries or tiny data, scanning is cheaper.

### What is the most common bug?

Using an absence sentinel that collides with valid index zero or failing to distinguish first-match from find-all semantics.

### What should I study next?

Study binary search, hash tables, database indexes, SIMD scanning, and string-search algorithms to understand which added structure buys faster lookup.
