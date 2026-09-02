# Cyclic Sort Pattern: Index-Value Placement, Missing Numbers & Duplicate Detection

## 1. Historical Context & Motivation

Cyclic sort is a pattern for arrays whose values are supposed to occupy predictable indices.

The classic setting is an array of length $n$ containing values from `1` to `n`.

In that setting, value `x` belongs at index `x - 1`.

If the array uses values from `0` to `n - 1`, value `x` belongs at index `x`.

The algorithm repeatedly swaps each value toward its home position.

It is not a general-purpose sorting algorithm.

It is a specialized placement technique.

Its strength is that it turns value constraints into direct index checks.

That makes it useful for interview-style problems about missing numbers, duplicates, corrupt pairs, and first missing positive values.

Comparison sorting would solve many of those problems.

But comparison sorting pays $O(n\log n)$ time.

A hash set would also work.

But a hash set pays extra space.

Cyclic placement often reaches $O(n)$ time with $O(1)$ extra space by using the input array as its own index map.

The cost is mutation.

The input order is destroyed.

The pattern only works when values can be mapped to valid target indices.

It also requires careful duplicate handling.

If two equal values claim the same home position, naive swapping can loop forever.

The guiding question is:

When does an array's value range let us place each value into its own index and then read errors directly from mismatches?

Cyclic sort is best understood as invariant repair.

Each swap increases the number of values sitting in valid homes.

Once no more legal swaps remain, every remaining mismatch reveals missing or duplicate information.

## 2. Core Mathematical Invariants

Assume an array `nums` of length $n$.

For the `1..n` variant, define the home index of value `v` as:

$$
home(v)=v-1.
$$

For the `0..n-1` variant, define:

$$
home(v)=v.
$$

A value is placeable only if its home index lies inside the array.

The central invariant is:

If a legal value `v` is not already at `home(v)`, and `nums[home(v)] != v`, then swapping `v` into `home(v)` increases the number of correctly placed values.

The duplicate guard `nums[home(v)] != v` is essential.

Without it, two identical values can keep swapping with each other or with themselves.

The loop position `i` advances only when the current value is either already placed, out of range, or blocked by a duplicate.

That rule prevents skipping a newly swapped-in value.

After a swap, the new `nums[i]` has not been inspected yet.

It may also belong somewhere else.

So the algorithm keeps `i` fixed until the current slot can no longer make progress.

The total number of successful swaps is at most $n$ for the simple permutation case.

More generally, each successful swap places at least one legal value into its final home.

Once a value is in its home, the duplicate guard prevents it from being displaced by the same value.

After placement terminates, any index `i` where `nums[i] != i + 1` in the `1..n` variant marks a violation.

If the problem promises one missing value and one duplicate, then:

The missing value is `i + 1`.

The duplicate is `nums[i]`.

For first missing positive, values outside `1..n` are ignored during placement.

The first index whose value is not `i + 1` gives the answer.

If all positions match, the answer is `n + 1`.

The invariant is not "the array is sorted after every pass."

The invariant is "every completed placement creates a truthful index-value witness."

## 3. Step-by-Step Execution Trace

Find the missing number in an array containing values from `1` to `n`.

Use:

```text
nums = [3, 1, 5, 4, 2]
```

The target order is:

```text
[1, 2, 3, 4, 5]
```

Start at index `0`.

The value is `3`.

Its home index is `2`.

`nums[2]` is `5`, not `3`.

Swap indices `0` and `2`.

The array becomes:

```text
[5, 1, 3, 4, 2]
```

Stay at index `0`.

The new value is `5`.

Its home index is `4`.

`nums[4]` is `2`, not `5`.

Swap indices `0` and `4`.

The array becomes:

```text
[2, 1, 3, 4, 5]
```

Stay at index `0`.

The value is `2`.

Its home index is `1`.

`nums[1]` is `1`, not `2`.

Swap indices `0` and `1`.

The array becomes:

```text
[1, 2, 3, 4, 5]
```

Now `nums[0]` is correct.

Advance through indices `1`, `2`, `3`, and `4`.

Every value is already home.

Now use a corrupt input:

```text
nums = [3, 1, 2, 5, 2]
```

Place `3` at index `2`.

Place the swapped-in `2` at index `1`.

Place the swapped-in `1` at index `0`.

The array becomes:

```text
[1, 2, 3, 5, 2]
```

At index `3`, value `5` belongs at index `4`.

But `nums[4]` is already `2`, so swapping is legal.

After the swap:

```text
[1, 2, 3, 2, 5]
```

At index `3`, value `2` belongs at index `1`.

`nums[1]` is already `2`.

The duplicate guard blocks the swap.

Advance.

Final scan finds index `3` has value `2` instead of `4`.

So `4` is missing and `2` is duplicated.

The mismatch is not noise.

It is the diagnostic signal left after all legal placements are exhausted.

Now trace first missing positive on:

```text
[3, 4, -1, 1]
```

Index `0` holds `3`, whose home is index `2`.

Swap `3` with `-1`.

The array becomes:

```text
[-1, 4, 3, 1]
```

Index `0` now holds `-1`, which is out of range.

Advance to index `1`.

Value `4` belongs at index `3`.

Swap `4` with `1`.

The array becomes:

```text
[-1, 1, 3, 4]
```

Index `1` now holds `1`, whose home is index `0`.

Swap it with `-1`.

The array becomes:

```text
[1, -1, 3, 4]
```

The final scan finds index `1` missing value `2`.

So the first missing positive is `2`.

The negative value was not sorted.

It was merely moved out of the way of placeable values.

## 4. Production-Ready Implementations

The helper below performs cyclic placement for the `1..n` value convention.

It mutates the list intentionally.

It never swaps when the destination already holds the same value.

```python
from collections.abc import MutableSequence


def cyclic_place_one_to_n(nums: MutableSequence[int]) -> None:
    i = 0
    n = len(nums)
    while i < n:
        value = nums[i]
        target = value - 1
        if 1 <= value <= n and nums[target] != value:
            nums[i], nums[target] = nums[target], nums[i]
        else:
            i += 1


def find_missing_and_duplicate(nums: list[int]) -> tuple[int, int]:
    cyclic_place_one_to_n(nums)
    for index, value in enumerate(nums):
        expected = index + 1
        if value != expected:
            return expected, value
    raise ValueError("input did not contain a missing/duplicate mismatch")


data = [3, 1, 2, 5, 2]
assert find_missing_and_duplicate(data) == (4, 2)
assert data == [1, 2, 3, 2, 5]
```

The first missing positive problem uses the same placement idea with out-of-range values ignored.

```python
def first_missing_positive(nums: list[int]) -> int:
    i = 0
    n = len(nums)
    while i < n:
        value = nums[i]
        target = value - 1
        if 1 <= value <= n and nums[target] != value:
            nums[i], nums[target] = nums[target], nums[i]
        else:
            i += 1

    for index, value in enumerate(nums):
        if value != index + 1:
            return index + 1
    return n + 1


assert first_missing_positive([3, 4, -1, 1]) == 2
assert first_missing_positive([1, 2, 0]) == 3
assert first_missing_positive([7, 8, 9, 11, 12]) == 1
assert first_missing_positive([1, 2, 3]) == 4
```

The `0..n-1` convention is common for missing-number problems.

```python
def find_missing_zero_to_n(nums: list[int]) -> int:
    i = 0
    n = len(nums)
    while i < n:
        value = nums[i]
        if 0 <= value < n and nums[value] != value:
            nums[i], nums[value] = nums[value], nums[i]
        else:
            i += 1

    for index, value in enumerate(nums):
        if value != index:
            return index
    return n


assert find_missing_zero_to_n([4, 0, 3, 1]) == 2
assert find_missing_zero_to_n([0, 1, 2]) == 3
```

The production contract should state that the input list is rearranged.

If callers need the original order, copy the list before calling.

The pattern should not be hidden behind an API that appears nonmutating.

Also avoid using cyclic sort for arbitrary integers.

The direct home-index formula is the reason the method is linear.

Without that formula, the pattern collapses into either hashing or comparison sorting.

For library code, prefer names that expose the convention.

`place_one_to_n` is clearer than `sort`.

`first_missing_positive` is clearer still because it names the actual problem.

If an API accepts arbitrary arrays, document which values are ignored.

In first missing positive, values `<= 0` and values `> n` cannot be the answer's occupied slot.

They can safely remain wherever the placement process leaves them.

In duplicate-finding problems, ignored values may violate the problem contract.

Those should either raise an error or be handled explicitly by the problem-specific wrapper.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the array length.

The placement loop may revisit an index many times.

That does not make it quadratic.

Each successful swap puts at least one legal value into its correct home position.

There are only $n$ positions.

Therefore the total number of successful swaps is $O(n)$.

Every iteration either performs a successful swap or advances `i`.

The index `i` advances at most $n$ times.

So the placement phase costs $O(n)$.

The final scan also costs $O(n)$.

The total time is:

$$
O(n).
$$

For valid permutation sorting, the time is also $\Theta(n)$ because every element must at least be inspected.

The auxiliary space is:

$$
O(1).
$$

The algorithm uses a constant number of variables beyond the input array.

It does not allocate a hash set.

It does not allocate a sorted copy.

The hidden cost is mutation, not asymptotic memory.

If the input is immutable, the algorithm needs a copy and the space becomes $O(n)$.

If values are not bounded by the array length, the home-index calculation is invalid.

The range check is therefore part of the algorithm, not merely input hygiene.

Duplicate handling is also part of the complexity proof.

Without the duplicate guard, a loop may never progress.

With the guard, blocked duplicates cause the algorithm to advance.

That preserves the linear bound.

The write count is also bounded.

Each successful swap writes two array cells.

In the permutation case, at most $n-1$ swaps are needed for one cycle and at most $n-c$ swaps for $c$ cycles.

That gives $O(n)$ writes.

This matters on storage-backed arrays or memory with limited write endurance.

Cyclic placement is not as write-minimal as cycle sort in the formal sense.

But it still has a predictable linear write budget under its value-range assumptions.

## 6. Systems Connections

Cyclic placement is a close cousin of table normalization.

When an ID directly determines a slot, the slot can store the object or a witness that the object is missing.

Sparse arrays, page tables, and direct-address tables use related thinking.

The difference is that cyclic sort reuses the data array itself as the table.

That reuse is why the space bound is constant.

The pattern is also useful in validation pipelines.

Given records that should contain every sequence number from `1` to `n`, placement can expose a missing sequence number and a duplicate sequence number without extra indexing.

In embedded systems, avoiding auxiliary memory can matter.

Cyclic placement gives predictable memory behavior.

In service code, mutation may be more dangerous than memory.

A caller might still need the original order for auditing, display, or replay.

In that case, the function should copy or document destructive behavior clearly.

Cyclic placement also connects to permutation decomposition.

A valid array containing `1..n` describes a permutation after subtracting one from every value.

Swapping each value into its home position resolves the permutation cycles.

The "cyclic" name comes from those underlying permutation cycles.

For corrupted arrays, some cycles are broken by duplicates and missing values.

The leftover mismatches are exactly the corruption evidence.

The pattern should not be confused with cycle sort.

Cycle sort is a comparison-based in-place sorting algorithm designed to minimize writes.

Cyclic sort pattern is usually a direct-index placement technique for constrained integer ranges.

The distinction matters in documentation.

If a codebase says "cyclic sort" for first missing positive, reviewers expect direct placement.

If it says "cycle sort," reviewers expect rank counting and minimal-write cycles.

Using the names interchangeably makes complexity and correctness discussions muddy.

In AlgoGlyph-style diagrams, draw cyclic sort as values moving into labeled index homes.

Draw cycle sort as permutation cycles over final ranks.

Those visuals teach different mechanisms.

## 7. Practice Checklist

- Identify whether the value convention is `1..n` or `0..n-1`.
- Write the home-index formula before coding.
- Check that a value is in range before indexing.
- Do not swap if the target already contains the same value.
- Keep the current index fixed after a successful swap.
- Advance only when the current slot cannot make progress.
- Run a final scan to interpret mismatches.
- Treat mutation as part of the API contract.
- Copy the array if caller order must be preserved.
- Test already ordered input.
- Test reverse ordered input.
- Test one missing and one duplicate.
- Test out-of-range positive values.
- Test negative values for first missing positive.
- Test all values blocked by duplicates.
- Test empty arrays when the problem permits them.
- Distinguish cyclic sort pattern from cycle sort.
- Explain why the number of successful swaps is linear.
- Avoid the pattern when no direct value-to-index mapping exists.
- Validate every array access before using a value as an index.
- State whether invalid values are ignored or rejected.
- Keep duplicate detection separate from range validation.
- Include a test where the answer is `n + 1`.
- Include a test where the first slot is already corrupted.
- Include a trace that shows why the index stays fixed after a swap.

## 8. Frequently Asked Questions

### Is cyclic sort a real sorting algorithm?

It is better described as a placement pattern.

It sorts only when values have a direct home-index mapping.

### Why does the loop not increment after every swap?

The swapped-in value at the current index has not been processed yet.

Keeping the index fixed lets the algorithm continue repairing that slot.

### Why is the duplicate guard necessary?

If the target already contains the same value, swapping cannot make progress.

The guard prevents infinite loops.

### Does cyclic sort preserve input order?

No.

It mutates the array and is not stable.

### Can it sort arbitrary integers?

No.

The method depends on mapping each valid value to a unique array index.

### Why is first missing positive a cyclic-sort problem?

Only values from `1` to `n` can affect the answer.

Placing those values exposes the first missing positive at the first mismatched index.

### What is the main advantage over a hash set?

It uses constant extra space.

The trade-off is destructive rearrangement of the input.

### What is the main advantage over comparison sorting?

It runs in linear time for its constrained domain.

Comparison sorting is more general but pays $O(n\log n)$ time.

### What should I verify in code review?

Check the range condition, duplicate guard, and index-advance rule.

Most bugs appear in one of those three lines.
