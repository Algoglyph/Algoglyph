# Pattern Matching & String Invariants: Choosing the Right Search Model

![String matching prefixes, suffixes, and text windows](/images/dsa/string-algorithms-dark.png)

## 1. Historical Context & Motivation

Strings look like arrays, but their algorithms are shaped by repetition, alphabet semantics, and boundary conventions.
Searching a text for a pattern is the foundational problem.
A direct comparison at every alignment is correct but can repeat the same work.
KMP uses prefix-border information to avoid rechecking matched characters.
Z matching turns text search into prefix matching over a combined sequence.
Boyer-Moore uses information near the pattern's right edge to skip alignments.
Rabin-Karp replaces most character comparisons with rolling fingerprints.
Suffix arrays and suffix trees index one fixed text for many later queries.
No single algorithm dominates every workload.
Pattern length, text length, alphabet size, preprocessing reuse, streaming, memory, and adversarial input all matter.
Text encoding adds another layer.
A byte is not always a user-perceived character.
Unicode code points can combine into grapheme clusters.
Case folding can change length.
Normalization can make visually equivalent strings have different encoded sequences.
An algorithm is correct only relative to the symbol sequence it actually processes.
Binary protocols often search bytes.
Source tools may search Unicode scalar values.
User-facing editors may need grapheme-aware boundaries.
Clarifying that unit is more important than choosing a fashionable matcher.
String algorithms also extend beyond exact search.
They compute borders, periods, repetitions, palindromes, edit distance, lexicographic order, and compressed representations.
Many share a common design principle.
Record the strongest invariant known about a processed prefix.
Use that invariant to skip states that cannot produce a new answer.
This article compares exact matching mechanisms rather than duplicating the dedicated KMP, Boyer-Moore, Rabin-Karp, suffix-array, and suffix-tree articles.
Its goal is selection and composition.
It develops one reusable prefix-function implementation and places it among alternatives.
It also addresses overlapping matches, empty-pattern policy, streaming state, and validation.
Those details often decide whether textbook code survives production input.

## 2. Core Mathematical Invariants

Let pattern $P$ have length $m$ and text $T$ have length $n$.
An exact occurrence at start $s$ satisfies

$$
T[s+j]=P[j]\quad\text{for every }0\le j<m.
$$

Valid starts satisfy $0\le s\le n-m$.
The naïve algorithm tests this predicate independently at every start.
Its worst-case comparisons are $O(nm)$.
KMP preprocesses the pattern's **prefix function**.
For each position $i$, $\pi[i]$ is the length of the longest proper prefix of `P[0:i+1]` that is also its suffix.
A proper prefix is shorter than the entire string.
The bound satisfies $0\le\pi[i]\le i$.
During preprocessing, let $j=\pi[i-1]$ be the candidate border length.
If `P[i] != P[j]`, replace $j$ by $\pi[j-1]$.
This follows the chain of shorter borders.
When the characters match, increment $j$.
Set $\pi[i]=j$.
The invariant says `P[0:j]` equals the suffix of `P[0:i+1]` of length $j$.
During text search, $j$ records how many pattern symbols match the suffix of text processed so far.
Before reading `T[i]`, the last $j$ processed text symbols equal `P[0:j]`.
On mismatch, the already matched text suffix may still equal a shorter pattern prefix.
Following $\pi[j-1]$ selects the longest such candidate without moving backward in the text.
When $j=m$, an occurrence ends at text index $i$ and starts at $i-m+1$.
Set $j=\pi[m-1]$ after reporting to preserve overlapping matches.
The total number of fallback steps is linear because each fallback decreases $j$ and each successful extension increases it.
The Z function uses another invariant.
`Z[i]` is the longest prefix length matching the sequence starting at $i$.
Maintaining a rightmost matching interval reuses previously computed values.
Combining `P`, a separator not in the alphabet, and `T` converts pattern occurrences into positions with `Z[i] >= m`.
The separator prevents a match from crossing the pattern-text boundary.
Rabin-Karp maintains a fingerprint for each length-$m$ text window.
Rolling update removes the outgoing symbol and adds the incoming symbol.
Equal fingerprints are candidates, not proofs, unless the hash representation is collision-free for the domain.
Verification against the actual substring restores deterministic correctness.
Boyer-Moore aligns the pattern and compares from right to left.
Bad-character and good-suffix rules shift past alignments proven impossible.
Its practical skipping can be excellent on large alphabets and long patterns.
Its full worst-case analysis depends on the implemented variant.
A suffix index reverses the workload.
It preprocesses text rather than one pattern.
Every pattern occurrence corresponds to a suffix whose prefix equals the pattern.
A suffix array finds the matching suffix interval with lexicographic binary searches.
A suffix tree follows pattern symbols along edges.
Automata preprocess the pattern into transition state.
After each symbol, the state represents the longest relevant matched prefix.
KMP can be viewed as a compact automaton whose fallback transitions are computed through borders.
Multiple-pattern search calls for Aho-Corasick rather than repeating one-pattern KMP blindly.
The alphabet unit is an invariant shared by every method.
If preprocessing uses bytes and querying uses normalized code points, equality and indices no longer agree.
Normalization must occur before both sides are indexed.
Reported offsets must specify whether they count bytes, code points, or grapheme clusters.
Empty-pattern semantics are conventional rather than mathematically forced.
An API may report every boundary, only index zero, or reject the empty pattern.
Choose one policy explicitly.

## 3. Step-by-Step Execution Trace

Build the prefix function for pattern `ababaca`.
At index zero, no proper nonempty prefix exists, so `pi[0] = 0`.
At index one, compare `b` with `a`.
They differ, so `pi[1] = 0`.
At index two, compare `a` with pattern index zero `a`.
They match, so `pi[2] = 1`.
The border is `a`.
At index three, begin with candidate length one.
Compare `b` with pattern index one `b`.
They match, so `pi[3] = 2`.
The border is `ab`.
At index four, begin with candidate length two.
Compare `a` with pattern index two `a`.
They match, so `pi[4] = 3`.
The border is `aba`.
At index five, begin with candidate length three.
Compare `c` with pattern index three `b`.
They differ.
Fall back to `pi[2] = 1`.
Compare `c` with pattern index one `b`.
They differ again.
Fall back to `pi[0] = 0`.
Compare `c` with pattern index zero `a`.
They differ, so `pi[5] = 0`.
At index six, compare `a` with pattern index zero.
They match, so `pi[6] = 1`.
The complete prefix array is `[0, 0, 1, 2, 3, 0, 1]`.
Now search text `bacbababadababacambabacaddababacasdsd`.
Start with matched length zero.
Read `b`; it does not match pattern `a`, so state remains zero.
Read `a`; state becomes one.
Read `c`; compare with pattern index one `b` and fall back to zero.
Continue extending and falling back without rewinding the text index.
Eventually the processed suffix equals `ababa`, so state is five.
The next expected pattern symbol is `c`.
If the text provides `b`, fallback follows the border of `ababa`, whose length is three.
The same text symbol is compared against pattern index three.
This preserves a viable prefix instead of restarting from scratch.
When state reaches seven, the full pattern has matched.
The start is current text index minus six.
After reporting, state becomes `pi[6] = 1`.
That retained border allows an overlapping occurrence to begin at the final `a`.
Consider pattern `aaa` in text `aaaaa`.
The prefix function is `[0, 1, 2]`.
The first match starts at zero.
Fallback after reporting sets state to two.
The next `a` immediately completes a match starting at one.
The next completes a match starting at two.
All overlapping starts `[0, 1, 2]` are reported.
Resetting state to zero would incorrectly miss two matches.
Now examine Unicode normalization.
One input contains precomposed `é`.
Another contains `e` followed by a combining acute accent.
Their raw code-point sequences differ.
An exact code-point matcher correctly reports no match without normalization.
Normalizing both to the same canonical form makes their symbol sequences equal.
The algorithm did not become more correct; the application changed its equality semantics explicitly.

## 4. Production-Ready Implementations

This implementation searches arbitrary Python sequences, supports overlaps, and defines an explicit empty-pattern policy.

```python
from __future__ import annotations

from collections.abc import Sequence
from typing import Literal, TypeVar


T = TypeVar("T")
EmptyPolicy = Literal["reject", "first", "all"]


def prefix_function(pattern: Sequence[T]) -> list[int]:
    pi = [0] * len(pattern)
    for index in range(1, len(pattern)):
        matched = pi[index - 1]
        while matched > 0 and pattern[index] != pattern[matched]:
            matched = pi[matched - 1]
        if pattern[index] == pattern[matched]:
            matched += 1
        pi[index] = matched
    return pi


def find_all(
    text: Sequence[T],
    pattern: Sequence[T],
    *,
    empty: EmptyPolicy = "reject",
) -> list[int]:
    if not pattern:
        if empty == "reject":
            raise ValueError("empty pattern is not accepted")
        if empty == "first":
            return [0]
        if empty == "all":
            return list(range(len(text) + 1))
        raise ValueError("unsupported empty-pattern policy")

    pi = prefix_function(pattern)
    starts: list[int] = []
    matched = 0

    for index, symbol in enumerate(text):
        while matched > 0 and symbol != pattern[matched]:
            matched = pi[matched - 1]
        if symbol == pattern[matched]:
            matched += 1
        if matched == len(pattern):
            starts.append(index - len(pattern) + 1)
            matched = pi[matched - 1]

    return starts


def demo() -> None:
    assert prefix_function("ababaca") == [0, 0, 1, 2, 3, 0, 1]
    assert find_all("aaaaa", "aaa") == [0, 1, 2]
    assert find_all("abc", "x") == []
    assert find_all("abc", "", empty="all") == [0, 1, 2, 3]
    assert find_all([1, 2, 1, 2], [1, 2]) == [0, 2]


if __name__ == "__main__":
    demo()
```

The generic sequence interface makes the equality unit explicit through the supplied elements.
Passing bytes searches byte values.
Passing a Python string searches Unicode code points as represented by Python iteration.
Neither automatically provides grapheme-cluster semantics.
Normalize text and pattern before searching when canonical equivalence is required.
Case-insensitive search should use a documented case-folding policy.
Because folding can change length, mapping result offsets back to original text requires an offset map.
Do not lowercase independently and assume indices remain stable.
For streaming KMP, retain the pattern, prefix table, current matched length, and total symbols consumed.
Process each chunk without resetting matched length.
Report global starts using the accumulated offset.
Chunk boundaries must not change results.
For huge outputs, yield starts lazily rather than storing every occurrence.
Output size can be $\Theta(n)$ even for a short repeated pattern.
For multiple patterns, build Aho-Corasick once rather than running KMP independently when aggregate pattern volume is large.
For one fixed text and many patterns, consider a suffix array, suffix tree, suffix automaton, or full-text index.
For very short patterns, optimized library search may use vectorized byte operations and outperform a textbook implementation.
Use the standard library unless custom streaming or generic-sequence semantics are required.
If using rolling hashes, verify candidates when collisions cannot be tolerated.
Use adversarial-resistant hashing or bounded workload policies at trust boundaries.
Do not expose quadratic fallback through a supposedly safe convenience path.
Measure preprocessing separately when patterns are reused.
Cache preprocessed pattern state only with bounded memory and exact equality semantics.
An unbounded cache of attacker-selected patterns is a memory-exhaustion risk.
Property-test results against direct matching for random small sequences.
Include periodic patterns, all-equal symbols, no matches, and overlapping matches.
Test chunked streaming under every possible split for short examples.
Test normalization and offset reporting as separate application layers.

## 5. Asymptotic Time & Space Complexity

Naïve exact search checks up to $m$ symbols at each of $n-m+1$ alignments.
Its worst-case time is $O(nm)$.
It uses $O(1)$ auxiliary state beyond output.
KMP prefix preprocessing takes $O(m)$ time.
Although the inner loop can repeat, matched length decreases on every fallback.
Across preprocessing, total advances and fallbacks are linear.
The prefix table uses $O(m)$ space.
KMP text scanning takes $O(n)$ time.
The text index never moves backward.
Matched length can increase at most once per consumed text symbol and fallbacks are amortized by prior increases.
Total KMP time is $O(n+m)$ plus output construction.
If there are $z$ matches, storing all positions adds $O(z)$ space.
A lazy iterator can use $O(m)$ retained preprocessing and $O(1)$ incremental state.
Z preprocessing and search also run in $O(n+m)$ time with $O(n+m)$ combined-array storage in a direct formulation.
More careful streaming forms have different constraints.
Rabin-Karp computes rolling fingerprints in $O(n+m)$ expected or average scanning work under a suitable model.
Candidate verification can produce $O(nm)$ worst-case time when collisions or repetitive candidates are frequent.
Double hashes reduce accidental collision probability but do not create mathematical certainty.
Boyer-Moore can skip many alignments and be sublinear in inspected text symbols on favorable inputs.
Simplified variants can still have quadratic worst cases.
State the exact preprocessing rules before claiming a bound.
A suffix array usually needs $O(n)$ retained indices plus the text, with construction complexity depending on algorithm.
Pattern search uses $O(m\log n)$ straightforward character work through binary search.
LCP-aware comparisons can reduce repeated work.
A suffix tree uses $O(n)$ nodes under a fixed-alphabet or suitable edge representation and answers pattern existence in $O(m)$ time after construction.
Its constants and implementation complexity are high.
Aho-Corasick preprocessing is linear in total pattern length plus transition representation cost.
Scanning is linear in text length plus reported matches.
Edit distance between lengths $n$ and $m$ uses $O(nm)$ dynamic-programming time in the standard algorithm.
Rolling rows reduce space to $O(\min(n,m))$ when reconstruction is unnecessary.
These are different problems from exact matching and should not be conflated.
Encoding conversion and normalization costs must be included in end-to-end analysis.
Normalization is typically linear in input representation length, but output length can differ.

## 6. Systems Connections

Text editors search buffers that may be ropes or piece tables rather than one contiguous string.
A matcher must traverse segments without assuming stable flat addresses.
Streaming KMP fits segmented input because it carries only matched-prefix state.
Search engines tokenize, normalize, and index terms rather than running raw substring matching over every document.
Inverted indexes answer a different semantic query efficiently.
Intrusion-detection systems match many byte patterns against network streams.
Aho-Corasick or compiled automata share prefix work across signatures.
They must maintain state across packet boundaries and bound pattern-set updates.
Compilers search tokens and parse grammar rather than treating source as undifferentiated text.
Lexers use finite automata for families of token patterns.
DNA algorithms process small alphabets and enormous sequences.
Suffix indexes, FM-indexes, and specialized approximate matching exploit that workload.
Compression and indexing often share suffix relationships.
Database substring queries may use trigram, full-text, or suffix indexes depending on operator semantics.
An ordinary B-tree cannot accelerate an unconstrained leading-wildcard search.
Log processors often search bytes to preserve exact offsets and avoid decoding malformed input.
User-facing display layers later interpret valid encoding.
Security filters must normalize consistently with downstream consumers.
If a validator and interpreter use different equivalence rules, attackers can exploit canonicalization gaps.
URL, path, and identifier normalization should occur once under a documented policy before matching.
Regular-expression engines solve a richer problem than fixed-pattern search.
Backtracking engines can exhibit catastrophic exponential behavior on crafted inputs.
Automata-based engines provide more predictable bounds for supported syntax.
Selecting KMP does not solve regex denial of service because the problem model is different.
Content-addressable storage and deduplication use rolling fingerprints to find candidate chunk boundaries or matches.
Collisions must be verified with full cryptographic or byte comparison according to integrity requirements.
Version-control diff tools use string and sequence algorithms but optimize for meaningful edit scripts rather than exact occurrence alone.
Unicode-aware applications rely on normalization libraries maintained with standard data tables.
Handwritten partial case conversion is rarely correct across languages.
String algorithms therefore connect abstract border invariants to encoding, indexing, streaming, and security boundaries.

## 7. Practice Checklist

- Define whether symbols are bytes, code points, or grapheme clusters.
- Normalize both pattern and text under the same policy when required.
- Plan how normalized offsets map back to original input.
- Define case-sensitivity and case-folding behavior.
- Define empty-pattern semantics.
- Define whether overlapping matches are reported.
- Include output size in complexity.
- Use KMP for deterministic linear one-pattern streaming.
- Use Z matching when prefix comparisons serve additional analysis.
- Use Boyer-Moore variants only with accurately stated guarantees.
- Verify rolling-hash candidates when exactness is required.
- Use Aho-Corasick for many simultaneous fixed patterns.
- Index the text when many future patterns query one immutable corpus.
- Keep preprocessing ownership tied to the exact pattern.
- Bound caches of preprocessed untrusted patterns.
- Preserve matched state across stream chunks.
- Test every chunk split on short reference cases.
- Report global rather than chunk-local indices.
- Test pattern longer than text.
- Test empty text and singleton inputs.
- Test no match, one match, and many overlaps.
- Test all-equal and highly periodic strings.
- Test matches at both boundaries.
- Compare randomized cases with direct matching.
- Keep separator symbols outside the alphabet in combined Z constructions.
- Do not reset KMP state to zero after a match if overlaps matter.
- Use integer indices consistently.
- Avoid slicing the text inside a hot comparison loop.
- Include preprocessing in one-shot benchmarks.
- Exclude preprocessing appropriately when one pattern is reused.
- Benchmark optimized standard-library search as the baseline.
- Treat hash collision policy as a correctness decision.
- Bound adversarial regex or pattern-processing work.
- Keep normalization consistent across validation and interpretation.
- Do not confuse substring search with token or full-text search.
- Include encoding-conversion cost in end-to-end measurements.
- Use lazy output when matches may be numerous.
- Preserve deterministic tie and offset semantics.
- Document all alphabet assumptions.
- Choose the algorithm from the workload, not from name recognition.

## 8. Frequently Asked Questions

### Why is naïve matching sometimes still fast?

Short patterns, early mismatches, vectorized library code, and small inputs can make its low setup cost competitive despite quadratic worst-case behavior.

### What does KMP remember after a mismatch?

It retains the longest pattern prefix that is also a suffix of the text matched so far.
The prefix table identifies shorter viable borders without rewinding the text.

### Why reset KMP state to a border after a match?

The matched pattern may end with a suffix that is also its prefix.
Keeping that border allows overlapping occurrences to be found.

### Is Rabin-Karp exact?

It is exact when equal hashes are verified against the actual symbols.
Treating hash equality alone as proof introduces collision risk.

### Does Unicode case-insensitive search preserve indices?

Not necessarily.
Case folding and normalization can change sequence length, so applications may need an offset map to original text.

### When should a suffix index be built?

Build one when the same immutable text receives many pattern or substring queries and preprocessing memory is justified.

### Is Boyer-Moore always sublinear?

No.
It often inspects fewer text positions on favorable data, but guarantees depend on the complete variant and input.

### Can KMP process a stream?

Yes.
Retain the prefix table, current matched length, and global offset across chunks.

### What algorithm handles many patterns at once?

Aho-Corasick builds a trie with failure links and shares scanning work across the pattern set.

### Are bytes and characters interchangeable?

No.
Variable-width encodings and combining sequences mean byte offsets, code-point indices, and grapheme positions can differ.

### Why not use regular expressions for everything?

Regex provides richer semantics and may carry heavier or less predictable execution behavior.
Exact matching deserves a simpler bounded algorithm when that is the actual requirement.

### What is the first design decision for string matching?

Define equality and the symbol unit.
Every preprocessing table, index, and reported offset depends on that decision.
