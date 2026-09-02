# Tries & Prefix Trees: Character Paths, Prefix Queries & Compact Variants

![Trie paths sharing common prefixes](/images/dsa/trie-dark.jpg)

## 1. Historical Context & Motivation

A trie indexes keys by symbols.
Shared prefixes share paths.
Lookup time depends on key length.
Key count affects memory instead.
Dictionaries use tries for prefixes.
Routers use bitwise tries.
Editors use them for completion.
Spell systems enumerate nearby prefixes.
The root represents an empty prefix.
Each edge contributes one symbol.
A terminal marker distinguishes complete keys.
Without it, `car` disappears inside `cart`.
Tries avoid hash collisions.
They preserve lexicographic traversal order.
They can consume enormous memory.
Sparse child maps reduce empty slots.
Dense arrays speed fixed alphabets.
Radix trees compress unary paths.
Patricia tries compress bitwise paths.
Ternary search trees store symbols differently.
No representation dominates every alphabet.
Unicode requires a symbol policy.
Bytes, code points, and graphemes differ.
Normalization must precede insertion and lookup.
Mutable deletion needs careful pruning.
Shared prefixes must remain for other keys.
Counts support frequencies and ranking.
Top-k completion needs subtree summaries.
This article develops the basic exact trie.
It then explains compression and production trade-offs.

## 2. Core Mathematical Invariants

Every node represents one prefix.
Root prefix is empty.
Child edge $c$ appends symbol $c$.
Outgoing edge symbols are unique.
A key follows exactly one path.
Terminal state marks key completion.
Prefix existence differs from key existence.
`starts_with(p)` needs only the path.
`contains(p)` also needs terminal state.
Insertion creates missing edges.
Existing edges are reused.
Deletion clears terminal state first.
Pruning begins only below branching needs.
A node can be removed when nonterminal and childless.
Pruning proceeds toward root.
Stop at a terminal node.
Stop at a node with another child.
Duplicate insert semantics need definition.
A set leaves terminal unchanged.
A multiset increments terminal count.
Subtree count equals terminal multiplicity plus child counts.

$$
count(v)=terminal(v)+\sum_c count(child_c).
$$

This supports prefix counts.
Every mutation updates affected ancestors.
Lexicographic enumeration visits child symbols in order.
Hash-map iteration is not inherently lexical.
Sort keys or use ordered children.
For alphabet size $\sigma$, dense nodes reserve $\sigma$ pointers.
Sparse nodes reserve only existing edges.
Total uncompressed nodes are at most one plus total inserted symbol count.
Shared prefixes reduce that bound.
A radix edge stores a nonempty symbol sequence.
Internal nonroot radix nodes normally branch.
Insertion can split an edge at first mismatch.
The common segment remains above.
Both remainders begin with different symbols.
Bitwise Patricia tries store discriminating bit positions.
Bit positions increase down paths.
Longest-prefix matching tracks last terminal encountered.
It does not merely return deepest existing node.
IP routing uses that rule.
Normalization is part of identity.
Insert and query must use identical normalization.
Offsets into original text may change after normalization.
Concurrency requires snapshot or locks.
Partial mutations must not become visible.
Serialized nodes need bounds validation.
Untrusted depths require limits.

## 3. Step-by-Step Execution Trace

Insert `car`.
Root lacks edge `c`.
Create c node.
Create a child.
Create r child.
Mark r node terminal.
Insert `cart`.
Reuse c, a, r.
Create t child.
Mark t terminal.
Node r remains terminal.
Insert `cat`.
Reuse c and a.
At prefix `ca`, edge t is missing.
Create t node.
Mark it terminal.
Insert `dog`.
Create independent d path.
The trie contains four keys.
Query `car`.
Follow c, a, r.
Terminal is true.
Return true.
Query `ca`.
Path exists.
Terminal is false.
Exact lookup returns false.
Prefix lookup returns true.
Enumerate prefix `ca`.
Reach ca node.
Traverse child r before t lexically.
At r, emit `car`.
Then traverse r child t.
Emit `cart`.
Return and traverse ca child t.
Emit `cat`.
Results are `car`, `cart`, `cat`.
Delete `cart`.
Clear terminal at its final t.
That t has no children.
Prune it.
Parent r is terminal for `car`.
Stop pruning.
Delete `car`.
Clear r terminal.
Node r now has no children.
Prune r.
Node a still has t child for `cat`.
Stop.
Query prefix `car` now fails.
Query `cat` still succeeds.
Now compress initial trie.
Unary root-to-branch portions become string edges.
Path `dog` can be one edge.
Path `ca` leads to a branch.
Compression saves nodes.
Search compares segments instead of symbols.

## 4. Production-Ready Implementations

```python
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class TrieNode:
    children: dict[str, TrieNode] = field(default_factory=dict)
    terminal: bool = False
    subtree_words: int = 0


class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def add(self, word: str) -> bool:
        node = self.root
        path = [node]
        for symbol in word:
            node = node.children.setdefault(symbol, TrieNode())
            path.append(node)
        if node.terminal:
            return False
        node.terminal = True
        for item in path:
            item.subtree_words += 1
        return True

    def contains(self, word: str) -> bool:
        node = self._node(word)
        return node is not None and node.terminal

    def starts_with(self, prefix: str) -> bool:
        return self._node(prefix) is not None

    def prefix_count(self, prefix: str) -> int:
        node = self._node(prefix)
        return 0 if node is None else node.subtree_words

    def _node(self, text: str) -> TrieNode | None:
        node = self.root
        for symbol in text:
            node = node.children.get(symbol)
            if node is None:
                return None
        return node

    def discard(self, word: str) -> bool:
        node = self.root
        path: list[tuple[TrieNode, str, TrieNode]] = []
        nodes = [node]
        for symbol in word:
            child = node.children.get(symbol)
            if child is None:
                return False
            path.append((node, symbol, child))
            node = child
            nodes.append(node)
        if not node.terminal:
            return False
        node.terminal = False
        for item in nodes:
            item.subtree_words -= 1
        for parent, symbol, child in reversed(path):
            if child.terminal or child.children:
                break
            del parent.children[symbol]
        return True

    def completions(self, prefix: str, limit: int = 10) -> list[str]:
        if limit < 0:
            raise ValueError("limit must be non-negative")
        start = self._node(prefix)
        if start is None:
            return []
        output: list[str] = []
        stack = [(start, prefix)]
        while stack and len(output) < limit:
            node, word = stack.pop()
            if node.terminal:
                output.append(word)
            for symbol in sorted(node.children, reverse=True):
                stack.append((node.children[symbol], word + symbol))
        return output


def demo() -> None:
    trie = Trie()
    for word in ["car", "cart", "cat", "dog"]:
        assert trie.add(word)
    assert trie.contains("car")
    assert not trie.contains("ca")
    assert trie.prefix_count("ca") == 3
    assert trie.completions("ca") == ["car", "cart", "cat"]
    assert trie.discard("cart")
    assert trie.contains("car")


if __name__ == "__main__":
    demo()
```

This implementation treats Python characters as code points.
It performs no normalization.
Applications must normalize externally.
Empty string is a valid key.
It marks the root terminal.
Set semantics reject duplicate adds.
Subtree counts change only on new keys.
Deletion updates every path count.
Pruning removes dead suffix nodes.
Completion sorts children at query time.
That adds comparison work.
An ordered child structure avoids repeated sorting.
Stored top-k summaries speed frequent completion.
They increase update work.
Limit prevents unbounded output.
Constructed strings add output allocation.
For bytes, use integer child keys.
For fixed alphabets, arrays may be faster.
For huge tries, radix compression matters.
Persistent tries copy one path.
Concurrent mutation needs synchronization.
Validate counts in tests.
Compare keys with a reference set.
Bound word length and node count.

## 5. Asymptotic Time & Space Complexity

Let key length be $m$.
Lookup takes $O(m)$ expected map operations.
Insertion takes $O(m)$.
Deletion takes $O(m)$.
Prefix lookup takes $O(m)$.
Prefix count takes $O(m)$ with stored counts.
Without counts, counting descendants costs output-subtree size.
Completion costs $O(m+v+z)$ traversal terms plus child sorting.
Here $v$ is visited nodes.
Here $z$ is output size.
Sorting sparse children adds degree logarithms.
Uncompressed storage is $O(L)$ nodes.
$L$ is total inserted key length.
Worst case shares no prefixes.
Best sharing can be substantial.
Dense nodes use $O(\sigma L)$ pointer slots worst case.
Sparse maps use edges actually present plus map overhead.
Radix compression stores $O(b)$ branching nodes and leaves.
Labels still reference or store total text segments.
A hash set uses expected $O(m)$ hashing and comparison.
It lacks native prefix enumeration.
A balanced BST uses $O(m\log n)$ worst-case symbol comparisons naïvely.
It supports ordered ranges.
Trie complexity is independent of key count only under bounded map lookup and fixed symbol operations.
Huge alphabets alter constants.
Normalization adds time proportional to encoded input.
Output cannot be faster than emitted symbols.

## 6. Systems Connections

Autocomplete stores vocabulary prefixes.
Frequency summaries rank candidates.
Personalization changes cache keys.
Routers use bitwise longest-prefix tries.
The deepest terminal route wins.
DNS names can be indexed by reversed labels.
Spell checking combines trie traversal with edit states.
Aho-Corasick adds failure links for multi-pattern scanning.
Finite dictionaries use minimal acyclic word graphs for compression.
Search engines often use finite-state transducers.
They compress sorted terms and outputs.
IP tables need updates and lock-safe reads.
Copy-on-write tries provide snapshots.
Language servers index symbols by prefix.
Unicode normalization must match identifiers.
Filesystems use radix-like name structures in some layers.
Memory overhead decides practicality.
Security filters must canonicalize consistently.
Otherwise equivalent strings bypass matches.
Untrusted completion prefixes need output limits.
Tries connect string identity, prefix sharing, and indexing.

## 7. Practice Checklist

- Define symbol unit.
- Define normalization.
- Apply it consistently.
- Mark complete keys explicitly.
- Distinguish keys from prefixes.
- Define empty-key behavior.
- Define duplicate semantics.
- Preserve unique child symbols.
- Update subtree counts.
- Prune only dead nodes.
- Stop pruning at branches.
- Stop pruning at terminals.
- Bound key length.
- Bound total nodes.
- Bound completion output.
- Define completion ordering.
- Use ordered children if needed.
- Use dense arrays only for suitable alphabets.
- Use sparse maps for sparse branching.
- Consider radix compression.
- Validate compressed edge splits.
- Keep source labels alive when referenced.
- Test one key prefixing another.
- Test duplicate values.
- Test empty string.
- Test missing prefix.
- Test deletion preserving siblings.
- Compare with a reference set.
- Validate counts recursively.
- Avoid recursive traversal on deep keys.
- Snapshot concurrent reads.
- Synchronize mutation.
- Version serialized nodes.
- Validate child offsets.
- Preserve comparator and encoding.
- Separate exact lookup from fuzzy search.
- Use longest terminal for routing.
- Include output cost.
- Measure node overhead.
- Choose representation from workload.

## 8. Frequently Asked Questions

### What does a trie node represent?

The prefix spelled by its root path.

### Why is a terminal marker needed?

A complete key may also prefix longer keys.

### How fast is lookup?

$O(m)$ expected child operations for key length $m$.

### Does lookup ignore key count?

Path length does, but child representation and memory still depend on the stored set.

### What is a radix tree?

A trie with unary paths compressed into multi-symbol edges.

### What is a Patricia trie?

A compressed trie commonly organized by discriminating bit positions.

### How does deletion work?

Clear terminal state, decrement counts, and prune nonterminal childless nodes upward.

### Are tries memory efficient?

Not automatically.
Child maps, pointers, and sparse branching can create large overhead.

### Can tries store Unicode?

Yes, after defining code-point or grapheme semantics and normalization.

### What is longest-prefix matching?

Return the deepest terminal encountered along the query path.

### When is a trie preferable to hashing?

When prefix enumeration, longest-prefix matching, or shared-prefix structure matters.

### What is the key production concern?

Choose a memory representation and normalization policy that match real keys.
