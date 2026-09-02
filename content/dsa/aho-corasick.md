# Aho-Corasick: Trie States, Failure Links & Multi-Pattern Matching

![Aho-Corasick trie and failure transitions](/images/dsa/aho-corasick-dark.jpg#dark)

Searching one text for one pattern is a solved linear-time problem.

Searching the same text independently for ten thousand patterns can repeat nearly identical prefix work ten thousand times.

Aho-Corasick compiles the entire pattern dictionary into one finite-state machine, then scans the text once while reporting every matched pattern.

Its central invariant is precise: after each input character, the automaton state represents the longest suffix of the processed text that is also a prefix of some dictionary pattern.

## 1. Historical Context & Motivation

### The dictionary-matching problem

Let the dictionary contain patterns $P_1,P_2,\ldots,P_k$.

Given a text $T$, the task is to report every triple

$$
(i,j,r)
$$

such that substring $T[i:j]$ equals pattern $P_r$.

Matches may overlap.

One pattern may be a suffix of another.

Patterns may share long prefixes.

The output itself can be large, so any realistic complexity statement must include the number of reported occurrences.

Running a separate linear matcher for each pattern costs roughly

$$
O\left(\sum_{r=1}^{k}(|T|+|P_r|)\right).
$$

The text term is paid $k$ times.

When patterns share prefixes such as `he`, `her`, `hers`, and `hero`, their preprocessing also duplicates structure.

### Compiling patterns into a machine

Alfred V. Aho and Margaret J. Corasick presented the algorithm in the 1975 paper [*Efficient String Matching: An Aid to Bibliographic Search*](https://doi.org/10.1145/360825.360855).

Their design has two phases.

First, construct a pattern-matching machine from the finite keyword set.

Second, feed the text through that machine in one pass.

The trie stores shared dictionary prefixes.

Failure links provide the fallback behavior needed after a mismatch.

Output sets identify patterns ending at the current state, including suffix patterns inherited through failure links.

This combination generalizes the prefix-fallback idea behind single-pattern matching to an entire dictionary.

### Why a trie alone is insufficient

A trie follows characters while the text matches a dictionary prefix.

Suppose patterns are `he`, `she`, `his`, and `hers`, and the text contains `ushers`.

After following `s -> h -> e`, the machine has matched `she`.

The same processed suffix also ends with `he`.

A plain trie node for `she` does not automatically report the pattern stored at node `he`.

Now consider a next character that has no trie edge from the current node.

Restarting from the text character after the original start can rescan characters repeatedly.

Failure links answer both issues.

They identify the longest proper suffix that remains a dictionary prefix, so already-read characters keep contributing to the next candidate.

### Where the algorithm fits

Aho-Corasick is appropriate when:

- the dictionary is known before scanning;
- exact matching is required;
- many patterns share the same text stream;
- overlapping matches matter;
- preprocessing can be amortized over one or more texts.

It is not automatically the best tool when:

- there is only one short pattern;
- patterns change after every character;
- approximate edits are allowed;
- token or word boundaries require semantics beyond character equality;
- the compiled automaton exceeds the memory budget.

The algorithm solves exact dictionary matching over a defined alphabet.

Normalization, case folding, encoding, and tokenization are separate input-model decisions.

### Batch dictionaries and streaming texts

The machine's state is sufficient to continue across text chunks.

A match can begin near the end of one chunk and finish near the beginning of the next.

Resetting the state at every chunk boundary would miss it.

This makes Aho-Corasick useful for streaming inspection, but only if the surrounding system also preserves the absolute text offset and the exact normalization behavior.

Changing the pattern dictionary requires rebuilding or using a more specialized dynamic dictionary structure.

## 2. Core Mathematical Invariants

### Trie-state meaning

Build a rooted trie containing every pattern.

Each state $v$ corresponds to the string spelled by the root-to-$v$ path.

Call that string $S(v)$.

The root represents the empty string $\epsilon$.

A trie edge labeled $a$ from $u$ to $v$ means

$$
S(v)=S(u)a.
$$

Every pattern terminates at exactly one state, though duplicate input patterns may share that same state.

The trie contains at most

$$
1+\sum_{r=1}^{k}|P_r|
$$

states because each inserted character creates at most one new state.

### Failure-link invariant

For every non-root state $v$, the failure link $fail(v)$ points to the state whose string is the longest **proper suffix** of $S(v)$ that is also a trie prefix.

Formally,

$$
S(fail(v))=\max_{\text{length}}\{x:x\text{ is a proper suffix of }S(v)\text{ and a trie prefix}\}.
$$

The root fails to itself.

A depth-one state fails to the root because its only proper suffix is empty.

Failure links always move to a strictly smaller trie depth for non-root states.

Therefore repeatedly following them must terminate at the root.

### Breadth-first construction invariant

Failure links are constructed in breadth-first trie order.

When processing state $u$, the failure link of $u$ is already known.

Every shallower state needed to compute a child's fallback is also known.

For trie edge $u \xrightarrow{a} v$, begin at $fail(u)$.

Follow failure links until finding a state with an outgoing $a$ edge or reaching the root.

The resulting transition target is $fail(v)$.

This works because any proper suffix of $S(u)a$ ending in $a$ arises from a suffix candidate of $S(u)$ followed by $a$.

Breadth-first order is not an incidental implementation choice.

It is the dependency order of the failure recurrence.

### Output-link invariant

Let $direct(v)$ contain pattern identifiers whose complete pattern equals $S(v)$.

The full output set is

$$
output(v)=direct(v)\cup output(fail(v)).
$$

If a text prefix ends in $S(v)$, it also ends in every suffix represented along the failure chain.

Those suffix states may terminate shorter patterns.

Copying or linking their outputs ensures that `she` also reports `he` at the same text position.

Duplicate dictionary entries can be preserved as distinct identifiers in `direct(v)`.

Deduplicating them is an API policy, not an automaton requirement.

### Scan-state invariant

After processing text prefix $T[0:i)$, current state $q$ satisfies:

> $S(q)$ is the longest suffix of $T[0:i)$ that is also a prefix of at least one pattern.

Before reading the first character, $q$ is the root and the invariant holds for the empty prefix.

When next character $a$ has a trie edge from $q$, following it extends the represented suffix.

When no such edge exists, $S(q)a$ cannot remain a trie prefix.

Following failure links tries shorter suffixes in decreasing length order.

The first state with an $a$ edge yields the longest valid new suffix.

If none exists, the next state is the root unless the root itself has an $a$ edge.

This proves maintenance of the invariant.

### Match-position invariant

Suppose pattern $P_r$ has length $m_r$ and appears in `output(q)` after reading text index $i$ inclusively.

The match ends at $i$ and starts at

$$
i-m_r+1.
$$

The corresponding half-open interval is

$$
[i-m_r+1,i+1).
$$

Reporting half-open positions avoids ambiguity for slicing APIs.

The implementation must define whether positions count bytes, Unicode code points, or another token unit.

Python string indexing counts Unicode code points, not encoded UTF-8 bytes or user-perceived grapheme clusters.

### Suffix inheritance does not consume text

A failure transition is not a text transition.

It changes the interpretation of characters already processed.

The current input character is retried after failure unless the implementation uses precomputed complete transitions.

Advancing the text index during failure would skip possible matches.

This distinction is the most important control-flow invariant in a sparse implementation.

### Amortized scan argument

Let $d(q)$ be the trie depth of state $q$.

A successful trie transition increases depth by one.

A failure transition decreases depth by at least one.

Depth never becomes negative.

Across a text of length $n$, successful transitions can increase depth at most $n$ times.

Therefore the total number of failure steps during scanning is $O(n)$.

Reporting $z$ matches adds $O(z)$ unavoidable work.

The sparse scan therefore runs in

$$
O(n+z)
$$

expected time when outgoing-edge dictionary operations are expected $O(1)$.

### Alphabet and normalization invariant

Pattern construction and text scanning must use the same symbol transformation.

If patterns are lowercased but text is not, the machine recognizes a different language than intended.

Unicode case folding can change string length and position correspondence.

Normalization forms can make visually identical text use different code-point sequences.

If original offsets are required, normalization must preserve or explicitly map positions.

The automaton cannot repair inconsistent preprocessing.

## 3. Step-by-Step Execution Trace

### Dictionary and text

Use patterns in insertion order:

```text
0: he
1: she
2: his
3: hers
```

Scan:

```text
ushers
```

### Trie construction

Inserting `he` creates states for `h` and `he`.

Pattern `0` terminates at `he`.

Inserting `she` creates `s`, `sh`, and `she`.

Pattern `1` terminates at `she`.

Inserting `his` reuses `h` and creates `hi`, then `his`.

Pattern `2` terminates at `his`.

Inserting `hers` reuses `h` and `he`, then creates `her` and `hers`.

Pattern `3` terminates at `hers`.

The trie strings are:

```text
epsilon
|- h
|  |- he [0]
|  |  `- her
|  |     `- hers [3]
|  `- hi
|     `- his [2]
`- s
   `- sh
      `- she [1]
```

### Failure links at depth one

States `h` and `s` are root children.

Set both failure links to the root:

```text
fail(h) = epsilon
fail(s) = epsilon
```

Their direct output sets are empty.

### Failure link for `he`

Parent state is `h`, whose failure is the root.

The root has no `e` transition.

Therefore

```text
fail(he) = epsilon
output(he) = [0]
```

### Failure link for `hi`

Again start from `fail(h)`, the root.

The root has no `i` transition.

Therefore

```text
fail(hi) = epsilon
```

### Failure link for `sh`

Parent is `s`, whose failure is root.

The root has an `h` transition.

Therefore the longest proper suffix-prefix of `sh` is `h`:

```text
fail(sh) = h
```

### Failure link and outputs for `she`

Parent is `sh`, whose failure is `h`.

State `h` has an `e` transition to `he`.

Therefore

```text
fail(she) = he
```

Direct output at `she` is pattern `1`.

Inherited output from `he` is pattern `0`.

Thus

```text
output(she) = [1, 0]
```

The order is an implementation detail; both identifiers must be reported.

### Remaining failure links

State `her` extends `he` with `r`.

The root has no `r` edge, so `fail(her)=epsilon`.

State `hers` extends `her` with `s`.

The root has an `s` edge, so `fail(hers)=s`.

State `his` extends `hi` with `s`.

The root also has an `s` edge, so `fail(his)=s`.

Neither `s` state carries a direct pattern output here.

### Scan index 0: `u`

Current state is root.

The root has no `u` edge.

Remain at root.

No output is reported.

Processed prefix is `u`; its longest dictionary-prefix suffix is empty.

### Scan index 1: `s`

The root has an `s` edge.

Move to state `s`.

No pattern ends there.

Processed prefix is `us`; longest relevant suffix is `s`.

### Scan index 2: `h`

State `s` has an `h` edge.

Move to `sh`.

No output is reported.

Processed prefix is `ush`; longest relevant suffix is `sh`.

### Scan index 3: `e`

State `sh` has an `e` edge.

Move to `she`.

Its outputs are `[1,0]`.

Pattern `she` has length $3$, so its interval is

$$
[3-3+1,3+1)=[1,4).
$$

Pattern `he` has length $2$, so its interval is

$$
[3-2+1,3+1)=[2,4).
$$

Both matches end at the same character.

### Scan index 4: `r`

State `she` has no `r` trie edge.

Follow `fail(she)` to `he` without consuming `r`.

State `he` has an `r` edge.

Consume `r` and move to `her`.

No output is reported.

The state invariant now represents suffix `her` of processed prefix `usher`.

### Scan index 5: `s`

State `her` has an `s` edge.

Move to `hers`.

Output pattern `3`.

Its length is $4$, giving interval

$$
[5-4+1,5+1)=[2,6).
$$

The matched substring is `text[2:6] == "hers"`.

### Final occurrence list

Using `(start, end, pattern_id)` with half-open positions:

```text
(1, 4, 1) -> she
(2, 4, 0) -> he
(2, 6, 3) -> hers
```

Pattern `his` does not occur.

The trace demonstrates prefix sharing, suffix output inheritance, and a mismatch recovered without rescanning the text.

## 4. Production-Ready Implementations

### Sparse Python automaton

```python
from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from typing import Iterator


@dataclass
class _State:
    edges: dict[str, int] = field(default_factory=dict)
    fail: int = 0
    output: list[int] = field(default_factory=list)


@dataclass(frozen=True)
class Match:
    start: int
    end: int
    pattern_id: int
    pattern: str


class AhoCorasick:
    def __init__(self, patterns: list[str]) -> None:
        if any(pattern == "" for pattern in patterns):
            raise ValueError("empty patterns require an explicit match policy")

        self.patterns = tuple(patterns)
        self.states = [_State()]

        for pattern_id, pattern in enumerate(self.patterns):
            self._insert(pattern, pattern_id)

        self._build_failure_links()

    def _insert(self, pattern: str, pattern_id: int) -> None:
        state = 0
        for symbol in pattern:
            next_state = self.states[state].edges.get(symbol)
            if next_state is None:
                next_state = len(self.states)
                self.states[state].edges[symbol] = next_state
                self.states.append(_State())
            state = next_state
        self.states[state].output.append(pattern_id)

    def _build_failure_links(self) -> None:
        queue: deque[int] = deque()

        for child in self.states[0].edges.values():
            self.states[child].fail = 0
            queue.append(child)

        while queue:
            state = queue.popleft()

            for symbol, child in self.states[state].edges.items():
                fallback = self.states[state].fail

                while fallback and symbol not in self.states[fallback].edges:
                    fallback = self.states[fallback].fail

                self.states[child].fail = self.states[fallback].edges.get(
                    symbol,
                    0,
                )
                inherited = self.states[self.states[child].fail].output
                self.states[child].output.extend(inherited)
                queue.append(child)

    def finditer(self, text: str) -> Iterator[Match]:
        state = 0

        for index, symbol in enumerate(text):
            while state and symbol not in self.states[state].edges:
                state = self.states[state].fail

            state = self.states[state].edges.get(symbol, 0)

            for pattern_id in self.states[state].output:
                pattern = self.patterns[pattern_id]
                yield Match(
                    start=index - len(pattern) + 1,
                    end=index + 1,
                    pattern_id=pattern_id,
                    pattern=pattern,
                )
```

### Verifying the worked trace

```python
matcher = AhoCorasick(["he", "she", "his", "hers"])
matches = list(matcher.finditer("ushers"))

assert matches == [
    Match(1, 4, 1, "she"),
    Match(2, 4, 0, "he"),
    Match(2, 6, 3, "hers"),
]

assert ["ushers"[match.start:match.end] for match in matches] == [
    "she",
    "he",
    "hers",
]
```

### Boundary tests

```python
def self_test() -> None:
    assert list(AhoCorasick([]).finditer("anything")) == []

    repeated = list(AhoCorasick(["a", "aa"]).finditer("aaa"))
    assert [(m.start, m.end, m.pattern) for m in repeated] == [
        (0, 1, "a"),
        (0, 2, "aa"),
        (1, 2, "a"),
        (1, 3, "aa"),
        (2, 3, "a"),
    ]

    duplicates = list(AhoCorasick(["x", "x"]).finditer("x"))
    assert [match.pattern_id for match in duplicates] == [0, 1]

    unicode_matches = list(AhoCorasick(["cafe", "cafe\u0301"]).finditer("cafe\u0301"))
    assert [match.pattern for match in unicode_matches] == ["cafe", "cafe\u0301"]


self_test()
```

The Unicode test deliberately uses `e` followed by a combining acute accent.

It shows exact code-point matching, not linguistic equivalence with precomposed `é`.

### Streaming without losing cross-chunk matches

The current state and absolute offset can be made explicit:

```python
@dataclass
class StreamCursor:
    state: int = 0
    consumed: int = 0


def scan_chunk(
    matcher: AhoCorasick,
    cursor: StreamCursor,
    chunk: str,
) -> list[Match]:
    found: list[Match] = []

    for local_index, symbol in enumerate(chunk):
        while (
            cursor.state
            and symbol not in matcher.states[cursor.state].edges
        ):
            cursor.state = matcher.states[cursor.state].fail

        cursor.state = matcher.states[cursor.state].edges.get(symbol, 0)
        absolute_end = cursor.consumed + local_index + 1

        for pattern_id in matcher.states[cursor.state].output:
            pattern = matcher.patterns[pattern_id]
            found.append(
                Match(
                    start=absolute_end - len(pattern),
                    end=absolute_end,
                    pattern_id=pattern_id,
                    pattern=pattern,
                )
            )

    cursor.consumed += len(chunk)
    return found


stream_matcher = AhoCorasick(["boundary"])
cursor = StreamCursor()
assert scan_chunk(stream_matcher, cursor, "chunk-boun") == []
assert scan_chunk(stream_matcher, cursor, "dary-end") == [
    Match(6, 14, 0, "boundary")
]
```

The cursor is tied to one automaton and one normalization policy.

Reusing it with a rebuilt dictionary would give meaningless state indices.

### Representation choices

The sparse dictionary representation allocates edges only for symbols that occur in trie prefixes.

It is convenient for large or Unicode alphabets.

For a small fixed alphabet, an array of transitions per state can avoid hash lookups.

Completing every missing transition during construction makes scanning one table lookup per character.

That trades memory $O(S|\Sigma|)$ for predictable transition cost, where $S$ is state count.

A compressed or double-array trie can improve locality at the price of more complex construction.

Choose from measured dictionary size, alphabet, update frequency, and scan throughput.

### Output storage choices

Copying inherited output lists is simple and makes reporting direct.

If many patterns are suffixes of many others, copied lists consume substantial memory.

An alternative stores direct outputs and follows a separate dictionary-suffix link while reporting.

That reduces duplicated storage but adds pointer traversal per matching state.

Counting matches without enumerating them may aggregate terminal counts through failure relationships.

The API requirement determines which output representation is appropriate.

### Empty-pattern policy

The implementation rejects an empty pattern.

Mathematically, the empty string matches at every boundary, including before the first character and after the last.

That would create $|T|+1$ occurrences per empty dictionary entry.

Silently attaching it to the root often causes surprising output on every character.

A production API should either reject empty patterns or document and implement their boundary semantics explicitly.

## 5. Asymptotic Time & Space Complexity

### Definitions

Let

$$
L=\sum_{r=1}^{k}|P_r|
$$

be total pattern length.

Let $S$ be the number of trie states, so $S\le L+1$.

Let $n=|T|$ be text length.

Let $z$ be the number of reported occurrences.

Let $\Sigma$ be the alphabet used by a dense transition table.

### Trie insertion

Every pattern symbol causes one edge lookup and possibly one state creation.

With expected constant-time dictionary operations, insertion takes expected

$$
O(L)
$$

time and $O(S)$ states plus stored edges.

With ordered maps, transition operations add a logarithmic factor in node degree.

### Failure construction

A dense completed transition table can be built in

$$
O(S|\Sigma|)
$$

time and space for transitions.

The sparse implementation stores only trie edges and follows failure chains while constructing links.

Its memory is $O(S+L+Z_o)$, where $Z_o$ is the total size of copied output lists.

Its construction time depends on failure-walk and map behavior; without memoized complete transitions, a conservative bound includes repeated walks up trie depth.

This distinction is why “construction is always linear” should not be attached blindly to every representation.

The original finite-state formulation can achieve linear pattern processing under its transition construction assumptions.

### Text scanning

In sparse scanning, each successful edge increases current depth and each failure step decreases it.

The amortized number of state changes is $O(n)$.

Expected scan time is therefore

$$
O(n+z)
$$

with expected constant-time edge lookup.

A dense completed table also scans in $O(n+z)$, with one transition lookup per input symbol before output reporting.

The $z$ term cannot be removed when the caller requires every occurrence.

### Output explosion

For patterns `a`, `aa`, `aaa`, and so on, scanned against a long run of `a`, many patterns end at each position.

The number of occurrences can be $\Theta(nk)$.

No enumerating algorithm can return them in $O(n)$ total time because writing the output already costs $\Omega(z)$.

If the consumer needs only existence, counts, or the first match, use an API that avoids materializing all occurrences.

### Memory accounting

Core automaton memory includes:

- one state record per trie node;
- one stored trie edge per non-root state;
- one failure index per state;
- direct or inherited output identifiers;
- pattern strings or external pattern metadata.

Python object and dictionary overhead can dominate character data for many small states.

A packed native representation may use much less memory even with the same asymptotic bound.

Measure resident size on the real dictionary rather than multiplying only logical field widths.

### Reuse economics

If one automaton scans $q$ texts of total length $N$, preprocessing is paid once.

The combined work is approximately

$$
\text{build}(L)+O(N+Z),
$$

where $Z$ is total reported output.

Rebuilding for every small text can erase the benefit.

Cache reuse must be keyed by the exact pattern set, matching mode, alphabet transformation, and automaton version.

## 6. Systems Connections

### Intrusion and content inspection

Security scanners may look for many fixed signatures in byte streams.

Aho-Corasick can share traversal across those signatures.

Real systems must define whether matches cross packet, record, or decompression boundaries.

They must also cap or stream output when adversarial input can trigger enormous match counts.

Exact signature matching is one layer; it does not replace protocol parsing or semantic detection.

### Lexers and token recognition

A dictionary automaton can recognize fixed keywords and operators.

Lexers additionally need longest-token rules, identifier classes, numbers, comments, and stateful modes.

Aho-Corasick can participate in such a pipeline without representing the entire lexical grammar.

Boundary checks may be required so pattern `he` does not match inside identifier `theorem` when only whole words count.

### Search, moderation, and redaction

Multi-term highlighting and rule-based redaction need occurrence positions.

Overlapping patterns require an explicit resolution policy.

Should `secret` and `secret-key` both be redacted?

Should the longest match win?

Should all matches be retained for audit?

The automaton reports candidates; policy resolves conflicts.

Applying replacements while scanning can shift later indices, so collect intervals against the original text before mutation.

### Bioinformatics

Exact motif dictionaries can be scanned against sequences with Aho-Corasick.

The alphabet is small, making dense transitions plausible.

Ambiguous symbols and approximate mutations require additional semantics.

Reverse complements may need insertion as separate patterns or normalization into a canonical representation.

Output volume can dominate when motifs are short and sequences are repetitive.

### Streaming service architecture

An immutable automaton can be shared across concurrent scans because search state lives in a per-stream cursor.

Rebuilding a new automaton can occur off the request path.

An atomic version swap lets new streams use the new dictionary while existing streams finish consistently on the old version.

Cursor checkpoints must record automaton version, state, offset, and normalization version.

Restoring a state index against the wrong machine is a silent correctness failure.

### Database and log pipelines

Scanning compressed or encoded logs requires deciding at which layer matching occurs.

Byte offsets before decoding differ from code-point offsets after decoding.

Line-based partitioning prevents cross-line matches by design; arbitrary chunking should not.

Distributed partitions need overlap of up to `max_pattern_length - 1` symbols or a carried automaton state to preserve boundary matches.

Deduplication is then required when overlap causes the same occurrence to be observed twice.

### Dynamic dictionaries

Basic Aho-Corasick is optimized for a relatively stable pattern set.

Adding a pattern can affect failure and output relationships beyond its new trie path.

For occasional updates, rebuilding an immutable machine is often simpler and safer.

For frequent updates, one option is a hierarchy of automata over batches, analogous to logarithmic merging.

That complicates query aggregation and duplicate policy.

Dynamic dictionary matching should be chosen as a separate design, not approximated by mutating a built machine in place.

## 7. Practice Checklist

### Establish semantics

- Define the symbol unit: byte, code point, normalized character, or token.
- Decide case-sensitive or case-folded matching.
- Define Unicode normalization.
- Decide whether matches may overlap.
- Define duplicate-pattern behavior.
- Define empty-pattern behavior.
- Define whole-word or boundary requirements.
- Choose half-open or inclusive output positions.

### Build the trie

- Keep the root at a stable index.
- Reuse existing prefix edges during insertion.
- Attach pattern identifiers only at terminal states.
- Preserve input identity if duplicate patterns must be reported separately.
- Record pattern lengths in the same indexing unit as text positions.
- Check the state-count bound against total pattern length.

### Build failure and output links

- Process states breadth-first.
- Set root-child failures to root.
- Follow known failure links when computing each child.
- Ensure every non-root failure moves to smaller depth.
- Inherit suffix outputs or maintain an equivalent output-link structure.
- Test a pattern that is a suffix of another pattern.
- Test failure to a non-root state.

### Scan correctly

- Retry the same input symbol after following a failure link.
- Consume each text symbol once.
- Preserve state across arbitrary stream chunks.
- Report every output attached to the resulting state.
- Convert end positions using the correct pattern length.
- Do not reset after a match unless the required semantics demand it.
- Avoid materializing unbounded output when a callback or count suffices.

### Test adversarial dictionaries

- Empty dictionary.
- One pattern and empty text.
- Duplicate patterns.
- Patterns that are prefixes of others.
- Patterns that are suffixes of others.
- Deep shared prefixes.
- Repeated single-character patterns such as `a`, `aa`, `aaa`.
- Text with no dictionary symbols.
- Unicode sequences in multiple normalization forms.
- Matches crossing every possible chunk boundary.

### Measure the implementation

- Total pattern length.
- Number of states and edges.
- Failure-link build time.
- Output identifiers stored after inheritance.
- Bytes per state in the chosen runtime.
- Characters scanned per second.
- Failure transitions per input character.
- Matches emitted and downstream processing time.
- Peak output buffering.

### Extend only with a proof

1. Replace sparse maps with fixed arrays for a measured small alphabet.
2. Add completed transitions and compare build memory with scan throughput.
3. Replace copied outputs with dictionary-suffix links.
4. Add a streaming cursor tagged with automaton version.
5. Add whole-word filtering using explicit boundary symbols or post-checks.
6. Add longest-match resolution outside the automaton.
7. Compare exact code-point matching with normalized matching and offset maps.
8. Differential-test against independent per-pattern search on small random inputs.

## 8. Frequently Asked Questions

### Is Aho-Corasick a trie?

It starts with a trie, but the complete matcher also has failure transitions and output relationships.

A trie alone cannot recover efficiently after mismatches or automatically report suffix patterns.

### How is it related to KMP?

Both avoid rescanning text by falling back to a longest useful prefix after mismatch.

KMP preprocesses one pattern.

Aho-Corasick performs analogous fallback over trie states representing prefixes of an entire dictionary.

### Why are failure links built with breadth-first search?

A child's failure depends on its parent's failure and on shallower states.

Breadth-first order guarantees those dependencies are ready before the child is processed.

Depth-first construction would need additional recursion or deferred computation to enforce the same dependency order.

### Can matches overlap?

Yes.

The automaton reports terminal outputs at every text position without skipping past a match.

Patterns `a` and `aa` both produce multiple overlapping matches in `aaa`.

### Why does `she` also report `he`?

State `she` fails to state `he` because `he` is its longest proper suffix that is a trie prefix.

The output set inherits the terminal pattern at `he`.

Both patterns end at the same text position.

### Is matching always $O(n)$?

State traversal is linear in text length under the stated transition assumptions.

Reporting adds $O(z)$ for $z$ occurrences.

When output is huge, total runtime cannot remain independent of match count.

### Should transitions use arrays or maps?

Arrays are attractive for small fixed alphabets and high-throughput scans.

Maps avoid allocating every alphabet slot for sparse or large alphabets.

The best choice depends on memory, cache behavior, alphabet size, and dictionary shape.

### Can patterns be added after construction?

Not safely by merely adding trie edges.

Failure and inherited-output relationships may need recomputation.

Rebuild an immutable automaton or use a design intended for dynamic dictionaries.

### How should empty patterns be handled?

Choose an explicit API policy.

The empty string matches at every boundary, producing $n+1$ matches in text of length $n$ per empty pattern.

Rejecting it is often less surprising than silently attaching output to the root.

### Does Aho-Corasick handle case-insensitive Unicode matching?

Only after a defined normalization and case-folding layer.

Those transformations can change code-point length, so original offsets may require a mapping.

The same transformation must be applied to patterns and text.

### How are chunk-boundary matches preserved?

Keep the automaton state between chunks and maintain an absolute consumed offset.

Resetting to root treats each chunk as a separate text and loses matches that span the boundary.

### What if I only need to know whether any pattern occurs?

Stop on the first nonempty output state.

You may also store a boolean terminal-reachable flag instead of full output lists if pattern identity is unnecessary.

Specializing the output contract can substantially reduce memory and reporting work.

### How can I verify an implementation?

For small random dictionaries and texts, compare its full occurrence tuples with independent exact substring searches for every pattern.

Include duplicates, overlaps, suffix patterns, and arbitrary chunk splits.

Also assert that each reported slice equals its identified pattern.
