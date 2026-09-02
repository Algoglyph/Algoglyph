# Knuth–Morris–Pratt: Linear Pattern Matching Through Borders

![KMP pattern matching](/images/dsa/kmp-algorithm-dark.png#dark)

Knuth–Morris–Pratt searches for a pattern without moving the text cursor backward.
After a mismatch, it reuses the structure of the characters already matched instead of comparing them again.
The result is deterministic $O(n+m)$ preprocessing and search for a text of length $n$ and a pattern of length $m$.

## 1. Historical Context & Motivation

### The work hidden inside naive matching

Suppose a pattern is aligned with a text and its first ten characters match.
If character eleven mismatches, naive search shifts the pattern by one position and starts again.
Those ten successful comparisons are largely forgotten.
On repetitive inputs, the same text positions can be inspected many times.

For text `AAAAAAAAAB` and pattern `AAAAB`, several alignments repeat almost identical work.
The worst-case cost of straightforward alignment is $O(nm)$.
That bound is undesirable for long streams, large files, and adversarial repetitive data.

### The key question

After matching a prefix of the pattern, what do those successful comparisons prove about the next possible alignment?
The answer depends only on the pattern.
If a suffix of the matched prefix is also a prefix of the pattern, that suffix can remain matched after the shift.
Every other candidate alignment is already contradicted by known characters.

### The KMP result

Donald Knuth, Vaughan Pratt, and James Morris developed the ideas behind the algorithm independently before their joint publication in 1977.
KMP preprocesses the pattern into a failure table, often called the prefix-function or LPS table.
The table tells the matcher which shorter prefix remains viable after a mismatch.

The text index never decreases.
The pattern index may fall through a chain of borders, but the total number of such falls is linear.
This accounting produces the $O(n+m)$ guarantee.

### Where KMP is useful

KMP is a good fit when:

- one pattern is searched in one or more texts;
- deterministic worst-case time matters;
- input arrives incrementally;
- the alphabet is large or not known in advance;
- only $O(m)$ pattern state should be retained.

It is not always the fastest practical matcher.
Boyer–Moore-style methods can skip farther on ordinary text.
Vectorized library routines can outperform textbook code.
For many patterns, Aho–Corasick shares work more effectively.
KMP remains the clean baseline for proving that single-pattern matching is linear.

### Problem definition

Given text $T$ of length $n$ and pattern $P$ of length $m$, report every index $s$ satisfying

$$
T[s:s+m]=P.
$$

Overlapping matches must be retained.
For example, pattern `ANA` occurs at indices $1$ and $3$ in `BANANA`.
An empty-pattern policy must be defined by the calling API; this article treats it as matching at every boundary.

## 2. Core Mathematical Invariants

### Borders

A **border** of a string is a proper prefix that is also a suffix.
For `ABABA`, the nonempty borders are `A` and `ABA`.
The whole string is excluded because a border is proper.

For every pattern prefix $P[0:i+1]$, define the prefix function

$$
\pi[i]=\max\{k:0\le k<i+1\text{ and }P[0:k]=P[i-k+1:i+1]\}.
$$

Thus $\pi[i]$ is the length of the longest proper border of the prefix ending at $i$.
Many implementations call the same array `lps`, for longest proper prefix that is also a suffix.

### Prefix-table invariant

While computing $\pi[i]$, let $j$ be the length of the longest border currently under consideration.
Before comparing $P[i]$ with $P[j]$, the invariant is

$$
P[0:j]=P[i-j:i].
$$

If the characters match, the border extends and $\pi[i]=j+1$.
If they differ, a border of length $j$ cannot extend.
The next possible candidate is the longest border of that border:

$$
j\leftarrow\pi[j-1].
$$

This fallback is complete.
Any longer candidate has already failed, and any viable shorter border appears in the border chain reached through repeated prefix-function links.

### Search invariant

During the text scan, let $i$ be the next text index and $j$ the number of pattern characters currently matched.
The central invariant is

$$
T[i-j:i]=P[0:j].
$$

If $T[i]=P[j]$, increment both positions.
If they differ and $j>0$, replace $j$ with $\pi[j-1]$ without changing $i$.
The suffix represented by the new $j$ is known to match from the invariant and the border definition.

If they differ and $j=0$, no nonempty prefix survives.
Increment $i$.

### Why alignments are not skipped

Assume $j$ characters matched before a mismatch.
Any candidate alignment ending at the same text position must make its matched portion both:

- a suffix of the already matched text segment; and
- a prefix of the pattern.

Those are exactly the borders encoded by the failure chain.
KMP tests them from longest to shortest.
Therefore it never discards a possible occurrence.

### Overlapping matches

When $j=m$, a full match ends at text position $i-1$ and starts at $i-m$.
The next viable state is not necessarily zero.
Set

$$
j\leftarrow\pi[m-1].
$$

This preserves a border of the matched pattern and enables overlap.
For pattern `AAA`, the fallback after one match is length two, allowing matches at consecutive starting positions.

### Amortized linearity

The text index $i$ increases at most $n$ times.
Each successful pattern extension increases $j$.
A fallback strictly decreases $j$.
Across the entire search, $j$ cannot decrease more often than it previously increased.
Therefore the total number of comparisons and state transitions is $O(n)$.

The same potential argument applies while building $\pi$.
The construction index advances $m-1$ times, and all fallback decreases are paid for by earlier increases.
Preprocessing is $O(m)$.

### Automaton interpretation

The state $j$ means that the longest pattern prefix matching a suffix of the text consumed so far has length $j$.
On a character, KMP either advances to $j+1$ or follows failure links until a transition becomes possible.
This is a compact deterministic automaton whose fallback transitions are represented implicitly.

Unlike a full transition table, it does not allocate one entry for every state-symbol pair.
That is useful for Unicode or other large alphabets.

### Equality semantics

KMP only requires a consistent equality relation between sequence elements.
It works on bytes, characters, tokens, integers, and structured symbols.
For Unicode text, the application must decide whether matching operates on bytes, code points, grapheme clusters, or normalized text.
The algorithm cannot repair inconsistent normalization semantics.

## 3. Step-by-Step Execution Trace

### Build the prefix table

Use pattern

```text
P = ABABCABAB
```

Its indices are:

| Index | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---:|---|---|---|---|---|---|---|---|---|
| Character | A | B | A | B | C | A | B | A | B |

Start with $\pi[0]=0$ and candidate border length $j=0$.

At $i=1$, compare `B` with `A`.
They differ and $j=0$, so $\pi[1]=0$.

At $i=2$, compare `A` with `A`.
They match, so $j=1$ and $\pi[2]=1$.
The prefix `A` is also the suffix of `ABA`.

At $i=3$, compare `B` with $P[1]=B$.
They match, so $j=2$ and $\pi[3]=2$.
The border is `AB`.

At $i=4$, compare `C` with $P[2]=A$.
They differ.
Fallback to $j=\pi[1]=0$.
Compare `C` with $P[0]=A$; they still differ.
Therefore $\pi[4]=0$.

At $i=5$, `A` matches $P[0]$.
Set $\pi[5]=1$.

At $i=6$, `B` matches $P[1]$.
Set $\pi[6]=2$.

At $i=7$, `A` matches $P[2]$.
Set $\pi[7]=3$.

At $i=8$, `B` matches $P[3]$.
Set $\pi[8]=4$.

The final table is

```text
index: 0 1 2 3 4 5 6 7 8
char:  A B A B C A B A B
pi:    0 0 1 2 0 1 2 3 4
```

### Search a text

Use text

```text
T = ABABDABACDABABCABAB
```

and the same pattern `ABABCABAB`.
Initially $i=0$ and $j=0$.

The first four text characters `ABAB` match the first four pattern characters.
The state becomes $i=4$, $j=4$.
The invariant says `T[0:4] == P[0:4] == ABAB`.

At $T[4]=D$, the expected pattern character is $P[4]=C$.
They mismatch.
Fallback to $j=\pi[3]=2$ while keeping $i=4$.
The suffix `AB` of the matched text is already equal to pattern prefix `AB`.

Compare $T[4]=D$ with $P[2]=A$.
They mismatch again.
Fallback to $j=\pi[1]=0$.
Compare with $P[0]=A$; still no match.
Advance the text index to $i=5$.

From $i=5$, the scan matches `ABAB` again.
At the following text character `A`, the pattern expects `C`, so fallback occurs.
The border `AB` survives, and matching continues without returning to the start of that text region.

The partial run eventually reaches the segment beginning at text index $10$:

```text
text:    ABABCABAB
pattern: ABABCABAB
```

All nine characters match.
The matcher reports start index $10$.
After reporting, it sets $j=\pi[8]=4$ rather than zero.
That state represents the border `ABAB` and would allow an overlapping continuation.

### Compact transition table

| Event | Text index $i$ | Pattern state $j$ before | Action | State after |
|---|---:|---:|---|---:|
| match `A` | 0 | 0 | consume | 1 |
| match `B` | 1 | 1 | consume | 2 |
| match `A` | 2 | 2 | consume | 3 |
| match `B` | 3 | 3 | consume | 4 |
| mismatch `D/C` | 4 | 4 | fallback to $\pi[3]$ | 2 |
| mismatch `D/A` | 4 | 2 | fallback to $\pi[1]$ | 0 |
| mismatch `D/A` | 4 | 0 | consume text only | 0 |
| full match | 19 | 9 | report index 10 | 4 |

### Why the fallback was safe

Before the first mismatch, `ABAB` had matched.
Its longest proper border is `AB`.
Any alignment that could still match while ending at the same place must begin with that suffix.
Trying pattern state two tests exactly that possibility.
When it also fails, the next border is empty.
No potential start between those states is omitted.

### Overlap trace

Search for `AAA` in `AAAAA`.
The prefix table is `[0, 1, 2]`.
After consuming text indices $0,1,2$, report match $0$.
Fallback to $j=2$.
Consume text index $3$, report match $1$, and fall back to $2$ again.
Consume text index $4$ and report match $2$.
The result is `[0, 1, 2]`, demonstrating why post-match fallback matters.

## 4. Production-Ready Implementations

### Python implementation

```python
from collections.abc import Sequence
from typing import TypeVar


T = TypeVar("T")


def prefix_function(pattern: Sequence[T]) -> list[int]:
    pi = [0] * len(pattern)
    for i in range(1, len(pattern)):
        j = pi[i - 1]
        while j > 0 and pattern[i] != pattern[j]:
            j = pi[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        pi[i] = j
    return pi


def kmp_find_all(text: Sequence[T], pattern: Sequence[T]) -> list[int]:
    if len(pattern) == 0:
        return list(range(len(text) + 1))

    pi = prefix_function(pattern)
    matches: list[int] = []
    j = 0

    for i, item in enumerate(text):
        while j > 0 and item != pattern[j]:
            j = pi[j - 1]
        if item == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - len(pattern) + 1)
            j = pi[j - 1]

    return matches


assert prefix_function("ABABCABAB") == [0, 0, 1, 2, 0, 1, 2, 3, 4]
assert kmp_find_all("ABABDABACDABABCABAB", "ABABCABAB") == [10]
assert kmp_find_all("AAAAA", "AAA") == [0, 1, 2]
assert kmp_find_all("ABC", "") == [0, 1, 2, 3]
```

The generic sequence type makes the same code usable for strings, bytes, and token arrays.
The empty pattern is defined to match every boundary.
If an API uses a different convention, change that branch explicitly rather than letting indexing fail.

### Incremental stream matcher

KMP state can persist across chunks because only $j$, the prefix table, and the total offset are required.

```python
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from typing import Generic, TypeVar


S = TypeVar("S")


@dataclass
class KMPStream(Generic[S]):
    pattern: Sequence[S]
    pi: list[int] = field(init=False)
    matched: int = field(default=0, init=False)
    consumed: int = field(default=0, init=False)

    def __post_init__(self) -> None:
        if not self.pattern:
            raise ValueError("stream matcher requires a nonempty pattern")
        self.pi = prefix_function(self.pattern)

    def feed(self, chunk: Iterable[S]) -> list[int]:
        starts: list[int] = []
        for item in chunk:
            while self.matched > 0 and item != self.pattern[self.matched]:
                self.matched = self.pi[self.matched - 1]
            if item == self.pattern[self.matched]:
                self.matched += 1
            self.consumed += 1
            if self.matched == len(self.pattern):
                starts.append(self.consumed - len(self.pattern))
                self.matched = self.pi[self.matched - 1]
        return starts


stream = KMPStream("ABABA")
assert stream.feed("XXAB") == []
assert stream.feed("AB") == []
assert stream.feed("AY") == [2]
```

Chunk boundaries do not reset the matched prefix.
The caller may discard earlier text bytes while keeping absolute match offsets.

### C++ implementation

```cpp
#include <cstddef>
#include <string_view>
#include <vector>

std::vector<std::size_t> prefix_function(std::string_view pattern) {
    std::vector<std::size_t> pi(pattern.size(), 0);
    for (std::size_t i = 1; i < pattern.size(); ++i) {
        std::size_t j = pi[i - 1];
        while (j > 0 && pattern[i] != pattern[j]) {
            j = pi[j - 1];
        }
        if (pattern[i] == pattern[j]) {
            ++j;
        }
        pi[i] = j;
    }
    return pi;
}

std::vector<std::size_t> kmp_find_all(
    std::string_view text,
    std::string_view pattern
) {
    std::vector<std::size_t> matches;
    if (pattern.empty()) {
        matches.reserve(text.size() + 1);
        for (std::size_t i = 0; i <= text.size(); ++i) {
            matches.push_back(i);
        }
        return matches;
    }

    const auto pi = prefix_function(pattern);
    std::size_t j = 0;
    for (std::size_t i = 0; i < text.size(); ++i) {
        while (j > 0 && text[i] != pattern[j]) {
            j = pi[j - 1];
        }
        if (text[i] == pattern[j]) {
            ++j;
        }
        if (j == pattern.size()) {
            matches.push_back(i + 1 - pattern.size());
            j = pi[j - 1];
        }
    }
    return matches;
}
```

`std::string_view` avoids copying inputs but requires their backing storage to outlive the call.
For arbitrary element sequences, use iterator or span-based interfaces.

### API and correctness decisions

Document whether indices count bytes, code points, or user-visible characters.
Return all matches, the first match, or an iterator according to the caller's memory needs.
For huge result sets, a callback or generator avoids storing $O(k)$ output indices.

Precompute the prefix table once when the same pattern is reused.
Do not rebuild it for every stream chunk.
Do not concatenate chunks solely to search across their boundary.

## 5. Asymptotic Time & Space Complexity

### Prefix construction

The loop index advances from $1$ to $m-1$.
Fallback transitions decrease $j$ and can be charged to previous increments of $j$.
The total time is $O(m)$.
The table requires $O(m)$ space.

### Searching

The scan consumes each of the $n$ text elements once.
Failure transitions do not consume text, but each strictly decreases the matched-prefix length.
Across the scan there are at most $O(n)$ such decreases.
Search time is therefore $O(n)$ after preprocessing.

The complete one-shot cost is

$$
O(n+m).
$$

Auxiliary search state beyond the table is $O(1)$.
Storing $k$ reported matches adds $O(k)$ output space.

### Best and worst cases

The asymptotic bound is linear in both easy and adversarial cases.
The number of actual comparisons varies.
A text with immediate mismatches performs roughly one comparison per character.
A repetitive near-match performs extra failure transitions, but amortization keeps their total linear.

### Preprocessing reuse

For $q$ independent texts searched with one pattern, the total is

$$
O\left(m+\sum_{r=1}^{q}n_r\right).
$$

Rebuilding the table for every text changes this to $O(qm+\sum n_r)$.
That may be acceptable for tiny patterns but should be an explicit choice.

### Comparison with related matchers

| Method | Preprocessing | Search worst case | Characteristic |
|---|---:|---:|---|
| Naive alignment | $O(1)$ | $O(nm)$ | simplest baseline |
| KMP | $O(m)$ | $O(n)$ | deterministic failure links |
| Rabin–Karp | $O(m)$ | $O(nm)$ without safeguards | rolling-hash filtering |
| Boyer–Moore family | pattern-dependent | often sublinear inspections | skips from mismatch information |
| Aho–Corasick | total pattern size | text plus matches | many-pattern automaton |

Output itself can dominate when many matches exist.
Pattern `A` in a text of $n$ `A` characters produces $n$ results, so $Omega(n)$ reporting time is unavoidable.

## 6. Systems Connections

### Streaming protocols

A protocol signature may begin near the end of one network buffer and finish in the next.
An incremental KMP matcher carries only the current prefix state across buffers.
It does not need to retain the entire historical stream.
The protocol layer must still handle encoding and framing before applying character matching.

### Token and event sequences

The elements need not be characters.
A compiler tool can search token kinds for a syntactic pattern.
An observability system can search event categories for a known sequence.
Equality must reflect the semantic unit being matched.

### Prefix functions as structural data

The prefix table solves more than substring search.
It can identify periods, repetitions, and borders of a string.
If a string of length $m$ has longest border $b=\pi[m-1]$, a candidate period is $m-b$.
The candidate is an exact repeating period when $m\bmod(m-b)=0$.

### Memory-mapped and large files

KMP's forward-only text access suits sequential file scanning.
Memory mapping may improve operating-system paging behavior, but it does not change the algorithmic bound.
For very large outputs, emit matches incrementally rather than accumulating them.

### Intrusion detection limitations

Single-pattern KMP can scan for an exact byte signature with predictable work.
Real intrusion detection often needs many patterns, wildcards, regular expressions, and protocol awareness.
Aho–Corasick or specialized automata are more appropriate there.
Exact matching alone should not be marketed as complete threat detection.

### Unicode and normalization

Visually identical strings may have different code-point sequences.
Case folding can change length and is locale-sensitive.
Normalize both text and pattern under the same policy before matching when canonical equivalence matters.
If returned offsets must refer to the original text, preserve a mapping through normalization.

### Denial-of-service resistance

Unlike naive matching, KMP keeps deterministic linear behavior on repetitive adversarial input.
That property is useful when users control both text and pattern.
Resource limits are still needed for enormous patterns, output floods, and expensive normalization.

## 7. Practice Checklist

### Understand the table

- Define a proper prefix.
- Define a suffix.
- List every border of a short pattern by hand.
- Compute $\pi$ for a pattern with no repetition.
- Compute $\pi$ for `AAAAA`.
- Compute $\pi$ for `ABACABAB`.
- Follow the chain $j,\pi[j-1],\ldots,0$.
- Explain why only border lengths are viable fallbacks.

### Implement safely

- Handle an empty pattern explicitly.
- Keep text and pattern indices conceptually separate.
- Use `while`, not a single `if`, for repeated fallback.
- Do not increment the text index during a nonzero fallback.
- Fall back after reporting a match to preserve overlap.
- Reuse the table when the pattern is reused.
- Define the sequence element and index semantics.
- Avoid copying large text inputs unnecessarily.

### Test prefix construction

- Test an empty pattern.
- Test a one-element pattern.
- Test all distinct characters.
- Test all equal characters.
- Test alternating characters.
- Test nested borders.
- Compare each table entry with a brute-force border checker.

### Test matching

- Pattern absent from text.
- Pattern equal to text.
- Pattern longer than text.
- Match at the beginning.
- Match at the end.
- Multiple disjoint matches.
- Multiple overlapping matches.
- Repetitive near-matches.
- Token arrays rather than strings.
- Matches crossing stream chunk boundaries.

### Prove the implementation

- State the suffix-prefix invariant at every loop entry.
- Show that a successful comparison preserves it.
- Show that fallback preserves it.
- Show that the border chain contains every viable alignment.
- Show that text progress or pattern fallback happens each iteration.
- Charge every fallback to an earlier pattern advance.

### Choose the right algorithm

- Use a standard library search when it already meets requirements.
- Consider Boyer–Moore variants for ordinary in-memory text.
- Use Aho–Corasick for many exact patterns.
- Use a regex engine for regular-language patterns.
- Use rolling hashes when hash-based comparison is the real goal.
- Benchmark representative inputs after correctness is established.

## 8. Frequently Asked Questions

### What does LPS mean?

It means longest proper prefix that is also a suffix.
The LPS array described here is the same object as the prefix-function array $\pi$.

### Why must the prefix be proper?

Allowing the whole current string would point a state back to itself.
Fallback must move to a strictly shorter viable prefix.

### Does KMP move backward in the text?

No.
It changes only the pattern state during fallback and consumes each text element in forward order.

### Can the pattern index move backward many times for one text character?

Yes, but not often enough to make the whole scan quadratic.
Every fallback decreases a state that earlier comparisons increased.

### Why is the post-match fallback necessary?

It preserves the longest border of the complete pattern, allowing overlapping occurrences to be reported.
Resetting to zero can miss them.

### Does KMP require strings?

No.
It works for any finite sequences whose elements support consistent equality.

### What should an empty pattern return?

Mathematically, the empty sequence occurs at every boundary.
Some APIs instead return index zero or reject it.
Choose and document one policy.

### Is KMP always faster than naive search?

No.
For short patterns and ordinary inputs, simpler loops and optimized library routines may have lower constants.
KMP's strongest advantage is its deterministic bound and reusable state.

### Is the prefix table built from the text?

No.
It is built only from the pattern, which is why it can be reused across texts.

### How does KMP differ from the Z algorithm?

The prefix function records the longest prefix ending at each position as a suffix.
The Z array records the longest prefix beginning at each position.
Both can support linear pattern matching through different representations.

### Can KMP perform case-insensitive matching?

Yes, if both sequences are transformed under a well-defined case-folding policy.
Offsets can become difficult when the transformation changes sequence length.

### Can KMP search a stream indefinitely?

Yes.
Maintain the pattern, prefix table, current state, and consumed offset; feed each chunk in order.

### What bug most often causes missed matches?

Resetting the state to zero after a full match or using only one fallback step after a mismatch.
Both mistakes ignore valid borders.

### How can I validate a prefix table?

For each position, brute-force every proper prefix length and compare it with the corresponding suffix.
Use that slow oracle on many small random patterns.

### What should I study next?

Study the Z algorithm for a complementary prefix representation and Aho–Corasick for simultaneous matching of many patterns.
