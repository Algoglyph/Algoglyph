# LIFO Stacks: Controlling Nested Work with One Accessible End

![LIFO stack](/images/dsa/lifo-stacks-dark.jpg#dark)

A stack exposes only its most recently inserted element.
That last-in, first-out rule is simple enough to implement with an array and powerful enough to model recursion, parsing, undo, backtracking, and monotonic data structures.
Correct stack use depends less on the container than on defining what every stored entry represents.

## 1. Historical Context & Motivation

### Nested work needs a return order

When one computation pauses to begin another, the newer computation must finish before the older one resumes.
Function calls behave this way.
Opening delimiters behave this way.
Depth-first search behaves this way.

The required order is

$$
\text{last inserted}\rightarrow\text{first removed}.
$$

This is LIFO discipline.

### From physical stacks to machine stacks

The metaphor comes from objects placed on top of one another.
Only the top item is immediately accessible.
Early computer architectures and programming-language runtimes made the same discipline explicit through pushdown storage and call stacks.

A stack is an abstract data type.
It specifies operations and behavior, not one memory representation.
Arrays, linked nodes, persistent lists, and bounded machine regions can all implement it.

### Basic operations

The conventional interface provides:

- `push(x)`: place $x$ on top;
- `pop()`: remove and return the top item;
- `peek()` or `top()`: inspect the top without removal;
- `is_empty()`: report whether any item exists;
- `size()`: report the number of items.

Underflow behavior must be defined.
An empty pop can raise an exception, return an optional value, or produce an error result.
A sentinel is dangerous when it can also be a valid stored value.

### Why not use a queue?

A queue removes the oldest item first.
That is correct for breadth-first layers and arrival-order service.
It is wrong for closing the most recent unmatched delimiter or resuming the most recent suspended call.

Choosing between stack and queue is choosing an ordering invariant.
Interchanging them changes the algorithm, not merely performance.

### Appropriate and inappropriate uses

Stacks fit nested, reversible, or depth-first work.
They do not support efficient access to the oldest element or arbitrary middle positions.
If an algorithm repeatedly searches the entire stack, the container is probably not expressing enough structure.

## 2. Core Mathematical Invariants

### Sequence model

Model stack state as a finite sequence

$$
S=(s_0,s_1,\ldots,s_{m-1}),
$$

where $s_{m-1}$ is the top.
Pushing $x$ produces

$$
S'=(s_0,s_1,\ldots,s_{m-1},x).
$$

Popping a nonempty stack returns $s_{m-1}$ and leaves

$$
(s_0,s_1,\ldots,s_{m-2}).
$$

This specification is independent of implementation.

### LIFO theorem

Suppose $a$ is pushed before $b$ and neither is removed before both are present.
Then $b$ must be popped before $a$.

Every valid implementation must preserve that observable order.
Capacity growth, node allocation, and internal indices cannot alter it.

### Array representation invariant

For a dynamic-array stack:

- active entries occupy indices $0$ through `size - 1`;
- `size` is the number of active elements;
- the top is at index `size - 1` when nonempty;
- capacity is at least size;
- entries at indices at or above size are not part of the abstract stack.

Appending and removing at the array end preserve this invariant.
Removing at index zero would require shifting elements and would reverse the intended efficient end.

### Linked representation invariant

For a singly linked stack, `head` is the top node.
Each node's `next` pointer refers to the item immediately below it.
Following `next` visits elements in pop order.

Push prepends one node.
Pop removes the head.
Both update a constant number of references.

### Size invariant

After a successful push,

$$
|S'|=|S|+1.
$$

After a successful pop,

$$
|S'|=|S|-1.
$$

Peek leaves size unchanged.
Failed operations must not partially mutate state.

### Balanced-delimiter invariant

While scanning an expression left to right, a delimiter stack contains exactly the opening symbols not yet matched by a closing symbol.
Their order is nesting order, with the innermost unmatched opener on top.

On a closing delimiter, correctness requires that the stack be nonempty and its top be the matching opener.
At end of input, the expression is balanced exactly when the stack is empty.

### DFS frontier invariant

In iterative depth-first search, the stack contains discovered work that has not yet been fully expanded according to the chosen traversal convention.
Pushing neighbors in reverse desired visit order makes the next pop follow the intended order.

Marking on push avoids duplicate pending entries.
Marking on pop allows duplicates and may change parent selection.
Both can be made correct, but their invariants differ.

### Monotonic-stack invariant

A monotonic stack adds an ordering constraint.
For a decreasing stack of indices, represented values decrease from bottom to top.
When a new value violates that property, pop until the order is restored.

Every element is pushed once and popped at most once.
That fact gives linear total time even though one iteration can perform many pops.

### Call-stack invariant

Each activation record stores the continuation state needed to resume one call.
The top frame belongs to the currently executing call.
Returning removes that frame and exposes its caller.

Unbounded recursion can exhaust finite stack memory despite a correct algorithm.
Converting recursion to an explicit stack moves control over representation and capacity into the program.

## 3. Step-by-Step Execution Trace

### Delimiter example

Validate expression

```text
{a + [b * (c + d)]}
```

Ignore nondelimiter characters.
Use a stack of opening symbols.

### Read the opening brace

Input `{` is an opener.
Push it.

```text
stack bottom -> top: {
```

The unmatched-opening invariant holds.

### Read the opening bracket

After scanning `a +`, encounter `[`.
Push it above `{`.

```text
stack bottom -> top: { [
```

The bracket is nested inside the brace.

### Read the opening parenthesis

After `b *`, encounter `(`.
Push it.

```text
stack bottom -> top: { [ (
```

The innermost unmatched opener is now `(`.

### Read the closing parenthesis

Encounter `)` after `c + d`.
The stack is nonempty and top is matching `(`.
Pop it.

```text
stack bottom -> top: { [
```

### Read the closing bracket

Encounter `]`.
Top is matching `[`.
Pop it.

```text
stack bottom -> top: {
```

### Read the closing brace

Encounter `}`.
Top is matching `{`.
Pop it.

```text
stack: empty
```

The scan ends with no unmatched opener.
The expression is balanced.

### Failure by wrong nesting

Now scan

```text
([)]
```

Push `(`, then push `[`.
When `)` arrives, the top is `[` rather than `(`.
Reject immediately.

Counting delimiter types would miss this error because counts can balance while nesting is wrong.
LIFO order captures nesting.

### Failure by early closer

For `a+b)`, the stack is empty when `)` arrives.
There is no opener available to match it.
Reject without popping.

### Failure by remaining opener

For `((a+b)`, one `(` remains after the scan.
No closing delimiter matched it.
Reject because the final stack is nonempty.

### Array-operation trace

Start with empty stack capacity four.

| Operation | Active array | Returned |
|---|---|---|
| `push(10)` | `[10]` | — |
| `push(20)` | `[10,20]` | — |
| `peek()` | `[10,20]` | 20 |
| `push(30)` | `[10,20,30]` | — |
| `pop()` | `[10,20]` | 30 |
| `pop()` | `[10]` | 20 |
| `push(40)` | `[10,40]` | — |

The most recently active value is always removed first.

### Monotonic-stack trace

Find the next greater value to the right for `[2,1,5,3,4]`.
Store unresolved indices in a decreasing stack.

Read two: push index zero.
Read one: one does not exceed two, so push index one.
Read five: pop index one and answer five; pop index zero and answer five; push index two.
Read three: push index three below unresolved five.
Read four: pop index three and answer four; push index four.
At end, indices two and four have no greater value.

Each index was pushed once and popped at most once.

## 4. Production-Ready Implementations

### Generic Python stack

```python
from collections.abc import Iterable, Iterator
from typing import Generic, TypeVar


T = TypeVar("T")


class Stack(Generic[T]):
    def __init__(self, values: Iterable[T] = ()) -> None:
        self._items = list(values)

    def push(self, value: T) -> None:
        self._items.append(value)

    def pop(self) -> T:
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self) -> T:
        if not self._items:
            raise IndexError("peek from empty stack")
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)

    def __bool__(self) -> bool:
        return bool(self._items)

    def top_to_bottom(self) -> Iterator[T]:
        return reversed(self._items)


stack = Stack([1, 2])
stack.push(3)
assert stack.peek() == 3
assert stack.pop() == 3
assert list(stack.top_to_bottom()) == [2, 1]
```

Python's list already supplies an efficient dynamic-array stack at its end.
A wrapper is justified when domain-specific error handling or interface restrictions matter.

### Balanced delimiters

```python
def delimiters_are_balanced(text: str) -> bool:
    closing_to_opening = {")": "(", "]": "[", "}": "{"}
    openings = set(closing_to_opening.values())
    stack: list[str] = []

    for character in text:
        if character in openings:
            stack.append(character)
        elif character in closing_to_opening:
            if not stack or stack[-1] != closing_to_opening[character]:
                return False
            stack.pop()

    return not stack


assert delimiters_are_balanced("{a + [b * (c + d)]}")
assert not delimiters_are_balanced("([)]")
assert not delimiters_are_balanced("a+b)")
assert not delimiters_are_balanced("((a+b)")
```

Real parsers must ignore delimiters inside string literals, comments, or escaped regions according to their grammar.
Character filtering alone is not a complete language parser.

### Next-greater values

```python
from collections.abc import Sequence


def next_greater(values: Sequence[int]) -> list[int | None]:
    answer: list[int | None] = [None] * len(values)
    unresolved: list[int] = []

    for index, value in enumerate(values):
        while unresolved and values[unresolved[-1]] < value:
            answer[unresolved.pop()] = value
        unresolved.append(index)

    return answer


assert next_greater([2, 1, 5, 3, 4]) == [5, 5, None, 4, None]
```

Store indices when the answer must be written to earlier positions or distance is required.

### Linked stack in C++

```cpp
#include <cstddef>
#include <memory>
#include <stdexcept>
#include <utility>

template <class T>
class LinkedStack {
    struct Node {
        T value;
        std::unique_ptr<Node> next;
    };

public:
    bool empty() const noexcept { return head_ == nullptr; }
    std::size_t size() const noexcept { return size_; }

    void push(T value) {
        head_ = std::make_unique<Node>(Node{std::move(value), std::move(head_)});
        ++size_;
    }

    const T& top() const {
        if (!head_) throw std::underflow_error("top of empty stack");
        return head_->value;
    }

    T pop() {
        if (!head_) throw std::underflow_error("pop from empty stack");
        T value = std::move(head_->value);
        head_ = std::move(head_->next);
        --size_;
        return value;
    }

private:
    std::unique_ptr<Node> head_;
    std::size_t size_ = 0;
};
```

An array-backed `std::vector` is usually more cache-friendly.
The linked version demonstrates stable constant-time end operations without capacity growth.

## 5. Asymptotic Time & Space Complexity

### Array-backed stack

Peek and size are $O(1)$.
Pop from the end is $O(1)$.
Push is $O(1)$ amortized and $O(n)$ during a capacity growth that copies or moves existing elements.

Across $m$ pushes with geometric capacity growth, total relocation work is $O(m)$.
Amortized push time is therefore $O(1)$.

Storage is $O(n)$ for $n$ elements plus unused capacity.
Geometric growth keeps capacity within a constant factor of size under ordinary policies.

### Linked stack

Push, pop, and peek are worst-case $O(1)$ once allocation cost is treated as part of the operation.
Storage is $O(n)$ with one pointer and allocator metadata per node.
Poor locality often makes it slower than an array despite the same Big-O.

### Delimiter validation

Scanning $n$ characters takes $O(n)$ time.
In the worst case, every character is an opener, so stack space is $O(n)$.

### Monotonic stack

One loop iteration may pop many entries.
Every entry is pushed once and popped at most once.
Total time is $O(n)$ and auxiliary space is $O(n)$.

### Recursive call stacks

A recursion of depth $d$ uses $O(d)$ activation records.
Tail-call elimination is not guaranteed in many languages.
An algorithm with $O(n)$ recursion depth can fail from stack exhaustion before heap memory is exhausted.

### Bounded stacks

An array with fixed capacity $C$ uses $O(C)$ reserved space and makes push worst-case $O(1)$ until overflow.
The API must report overflow rather than writing beyond bounds.
Bounded storage is common in embedded systems and protocol parsers with explicit nesting limits.

## 6. Systems Connections

### Function calls

Call stacks store return addresses, parameters, saved registers, and local state according to an ABI and compiler decisions.
The abstract LIFO relation explains return order without claiming every runtime uses one identical frame layout.

### Parsing

Pushdown automata extend finite-state machines with a stack and can recognize nested context-free structure.
Practical parsers use stacks for states, grammar symbols, or partially constructed syntax nodes.
Delimiter matching is the smallest example of this larger idea.

### Undo and redo

An undo stack stores inverse actions or previous states.
Undo pops the latest committed change.
Redo commonly uses a second stack and is cleared when a new branch of edits is committed.

### Depth-first search

An explicit stack replaces recursive traversal and avoids call-stack limits.
Neighbor push order determines observable visitation order.
Graph correctness also needs a visited policy to handle cycles.

### Backtracking

Search algorithms push choices or state deltas, explore one branch, and pop to restore the prior state.
Copying complete states is simple but expensive.
Recording reversible deltas reduces memory and increases restoration complexity.

### Expression evaluation

Operator-precedence algorithms use stacks for operators and operands.
Postfix evaluation pushes operands and pops them when an operator appears.
Operand pop order matters for subtraction and division.

### Security limits

Deeply nested input can exhaust a parser's stack.
Enforce nesting limits before memory exhaustion.
Never treat stack overflow or underflow as impossible merely because ordinary input is shallow.

## 7. Practice Checklist

### Interface

- Define top orientation.
- Define empty-pop behavior.
- Define empty-peek behavior.
- Define capacity behavior.
- Define whether iteration is top-to-bottom.
- Define thread-safety expectations.

### Array implementation

- Store active items contiguously.
- Append at the end.
- Pop from the end.
- Do not shift the array on every operation.
- Keep size consistent.
- Test capacity growth.
- Release removed references when required.

### Linked implementation

- Make head the top.
- Link new nodes to the old head.
- Advance head on pop.
- Update size once.
- Handle ownership safely.
- Avoid memory leaks.
- Test destruction of long stacks.

### Algorithm use

- State what one entry represents.
- State the stack invariant.
- Choose marking time in graph traversal.
- Preserve operand order.
- Push neighbors in deliberate order.
- Bound nesting for untrusted input.
- Prove amortized pop counts when monotonic.

### Tests

- New stack is empty.
- Push then peek.
- Push then pop.
- Multiple values pop in reverse order.
- Duplicate values.
- Underflow.
- Alternating push and pop.
- Large capacity growth.
- Iteration does not mutate state.
- Clear or destruction releases references.

## 8. Frequently Asked Questions

### What does LIFO mean?

Last in, first out.
The most recently pushed active element is the next one popped.

### Is a stack the same as an array?

No.
A stack is an abstract interface; an array is one representation.

### Which end of an array should be the top?

Usually the end supporting constant-time append and removal.
Using the front can require shifting every element.

### Why is array push amortized $O(1)$?

Occasional geometric resizing costs $O(n)$, but the total copying across many pushes is linear in the number of pushes.

### When is a linked stack preferable?

When stable node-based allocation, persistent sharing, or no relocation is more important than locality and pointer overhead.

### Can a stack contain duplicates?

Yes.
Position and insertion order distinguish entries even when values are equal.

### Why does delimiter matching need a stack?

The next closing symbol must match the most recent unmatched opening symbol.
That is exactly LIFO nesting.

### Can BFS use a stack?

Replacing its queue with a stack produces depth-first behavior and loses the ordinary unweighted shortest-path guarantee.

### Is recursion always equivalent to an explicit stack?

Recursive control can be simulated with frames on an explicit stack, but those frames must preserve every continuation variable and return phase.

### Why store indices in monotonic stacks?

Indices support distances, answer placement, and access to related arrays while still permitting value comparisons.

### Is `pop` from an empty stack allowed?

Only according to an explicit API policy.
Safe implementations return an error or raise an exception rather than reading invalid memory.

### Are stacks thread-safe?

Not automatically.
Concurrent operations need locking or a specifically designed concurrent stack with safe memory reclamation.

### What causes stack overflow?

Exceeding finite capacity through deep recursion, excessive nesting, or unchecked pushes.
Heap-allocated containers can also exhaust memory, though the failure mechanism differs.

### What is the most common algorithmic stack bug?

Failing to define what entries mean, which leads to incorrect pop timing, duplicate work, or reversed operand order.

### What should I study next?

Study queues, deques, monotonic stacks, iterative DFS, expression parsing, and pushdown automata to see how access order shapes computation.
