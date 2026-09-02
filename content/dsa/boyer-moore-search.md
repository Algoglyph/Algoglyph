# Boyer–Moore String Search: Right-to-Left Matching & Safe Pattern Shifts

![Boyer–Moore String Search: Right-to-Left Matching & Safe Pattern Shifts](/images/dsa/boyer-moore-search-dark.jpg#dark)

## 1. Historical Context & Motivation

Naive substring search aligns a pattern at each text position and compares from left to right.

After a mismatch, it usually advances by one.

Robert Boyer and J Strother Moore published a more aggressive exact string-search method in 1977.

**Boyer–Moore search** compares the pattern from right to left and uses mismatch information to skip alignments that cannot match.

Two rules drive the shift:

- the **bad-character rule** uses the mismatching text symbol;
- the **good-suffix rule** uses the pattern suffix already matched before the mismatch.

The search takes the larger shift proven safe by either rule.

On ordinary text and sufficiently long patterns, it often inspects fewer text characters than the text length.

That sublinear comparison behavior is practical, not a claim that input can always be searched without reading relevant storage.

Worst-case behavior depends on the exact Boyer–Moore variant, preprocessing, alphabet, and whether additional linear-time safeguards are used.

Simplified algorithms are often mislabeled as full Boyer–Moore.

Boyer–Moore–Horspool uses a simpler bad-character table based mainly on the aligned final character.

It is useful, but it omits the full strong good-suffix rule.

This article implements both classic shift families.

String representation matters.

Searching Unicode code points is different from searching user-perceived grapheme clusters or normalized text.

The algorithm finds exact sequences under the representation it receives.

Case folding and normalization should happen before preprocessing, with returned indices defined against either normalized or original storage.

Byte-oriented search is appropriate for protocols and binary files when byte equality is the desired relation.

The method is strongest for repeated searches with a reusable pattern because preprocessing cost can be amortized.

For a tiny pattern or one short text, a standard-library routine may use a better tuned hybrid.

The governing insight is:

**a mismatch can rule out several future alignments when the pattern's own occurrences and suffix borders are precomputed correctly.**

## 2. Core Mathematical Invariants

### Alignment model

Let text length be $n$ and pattern length be $m$.

At alignment $s$, pattern index $j$ compares with text index:

$$
s+j.
$$

Valid alignments satisfy:

$$
0\le s\le n-m.
$$

Comparison begins at $j=m-1$ and moves left while symbols match.

If $j<0$, every pattern symbol matched and $s$ is an occurrence.

### Search-progress invariant

Every alignment smaller than current $s$ has been proven not to start a match, except alignments already reported when overlapping matches are allowed.

After a mismatch, the shift must be at least one.

It may skip several positions only when preprocessing proves none can contain a match consistent with observed symbols.

### Bad-character rule

Suppose mismatch occurs at pattern index $j$ against text symbol $c$.

Let:

$$
last(c)
$$

be the rightmost index of $c$ in the pattern, or $-1$ if absent.

A basic bad-character shift is:

$$
j-last(c).
$$

If the rightmost occurrence lies to the right of $j$, this value can be nonpositive.

The combined shift is clamped to at least one.

More refined tables can precompute occurrence information by pattern position, but the rightmost table is correct with the clamp and other shift rules.

The rule aligns a plausible pattern occurrence of $c$ with the mismatching text symbol.

If no occurrence exists, it shifts past that text symbol relative to mismatch position.

### Matched suffix

At mismatch index $j$, pattern suffix:

$$
P[j+1\ldots m-1]
$$

has already matched the aligned text.

Call this the **good suffix**.

A safe shift tries to align another occurrence of that suffix in the pattern, preferably one preceded by a different symbol than the mismatch context.

If no internal occurrence works, align the longest suffix of the matched portion that is also a prefix of the pattern.

If no nonempty border exists, shift the pattern completely past the matched suffix.

### Strong good-suffix table

The implementation stores `shift[q]` for mismatch state `q = j + 1`.

Index zero is used after a complete match.

Preprocessing computes pattern border positions and fills shifts that preserve possible matches.

The table must handle:

- repeated symbols;
- overlapping borders;
- suffixes with several internal occurrences;
- patterns whose prefix is also a suffix;
- complete-match advancement.

An incorrect table can skip real matches, making failures harder to detect than a merely slow shift.

### Combined mismatch shift

At mismatch:

$$
bad=j-last(c),
$$

$$
good=shift[j+1].
$$

Advance by:

$$
\max(1,bad,good).
$$

Each component independently rules out all smaller shifts up to its value under its proof.

Taking their maximum remains safe because both constraints must be satisfied by a possible next match.

### Complete-match shift

After reporting an occurrence, advance by `shift[0]`.

This value aligns the longest proper border and preserves overlapping matches.

For pattern `ANA` in text `ANANA`, shifting by three after the first match would miss the occurrence beginning at index two.

The border-aware complete shift is two.

### Empty-pattern contract

Mathematical and library conventions differ.

This implementation reports the empty pattern at every boundary:

$$
0,1,\ldots,n.
$$

Another API may report only index zero or reject empty patterns.

The choice must be explicit because preprocessing assumes $m>0$.

### Representation invariant

Preprocessing and search must observe identical symbol sequences.

If text is normalized after the table is built, shift proofs no longer refer to the same pattern.

Returned indices count positions in the searched representation: Python string code-point indices in this implementation.

## 3. Step-by-Step Execution Trace

### Text and pattern

Search:

```text
text    = "HERE IS A SIMPLE EXAMPLE"
pattern = "EXAMPLE"
```

Pattern length is seven.

The match begins at text index seventeen.

Relevant rightmost pattern indices are:

```text
E -> 6
X -> 1
A -> 2
M -> 3
P -> 4
L -> 5
```

### Alignment `s = 0`

Compare pattern's final `E` with text index six, which is `S`.

Mismatch occurs immediately at `j = 6`.

`S` does not occur in the pattern, so `last(S) = -1`.

Bad-character shift is:

$$
6-(-1)=7.
$$

Good-suffix rule has no matched suffix and contributes only its baseline shift.

Advance to `s = 7`.

Alignments one through six cannot match because each would place the mismatching `S` under a pattern position without a compatible occurrence for this mismatch.

### Alignment `s = 7`

Pattern final `E` compares with text index thirteen, `P`.

Mismatch at `j = 6`.

Rightmost pattern `P` is at index four.

Bad-character shift is:

$$
6-4=2.
$$

Advance to `s = 9`.

### Alignment `s = 9`

Compare right to left:

```text
pattern E at j=6 == text E at 15
pattern L at j=5 == text L at 14
pattern P at j=4 == text P at 13
pattern M at j=3 == text M at 12
```

Four-symbol suffix `MPLE` matched.

Next compare pattern `A` at `j=2` with text `I` at index eleven.

They differ.

`I` is absent from the pattern, giving bad-character shift three from this mismatch position.

The strong good-suffix table recognizes that `MPLE` has no other compatible internal occurrence and no useful border with the pattern prefix.

Its safe shift is six.

Take the maximum and advance to:

```text
s = 15
```

This is where suffix knowledge skips more than the bad-character rule alone.

### Alignment `s = 15`

Pattern final `E` compares with text index twenty-one, `P`.

Rightmost `P` in the pattern is index four.

Shift is two.

Advance to `s = 17`.

### Alignment `s = 17`

Compare from right to left:

```text
E == E
L == L
P == P
M == M
A == A
X == X
E == E
```

Index becomes `j = -1`.

Report occurrence at seventeen.

The complete-match shift then advances by the pattern's border rule.

No further full alignment fits before the text ends.

### Overlap trace

Search pattern `ANA` in `ANANA`.

At `s = 0`, all three symbols match and index zero is reported.

Pattern prefix `A` equals suffix `A`.

The complete-match shift is two rather than three.

At `s = 2`, all symbols match again.

Occurrences are:

```text
[0, 2]
```

### Absent pattern

Search `XYZ` in the example text.

Every mismatch produces a positive shift.

When `s > n - m`, no complete alignment remains.

Return an empty occurrence list, distinct from the empty-pattern boundary list.

## 4. Production-Ready Implementations

The following Python implementation builds a bad-character table and the strong good-suffix table, reports overlapping matches, and exposes a compiled reusable pattern object.

```python
from __future__ import annotations

from dataclasses import dataclass


def _good_suffix_shifts(pattern: str) -> list[int]:
    length = len(pattern)
    shift = [0] * (length + 1)
    border = [0] * (length + 1)
    i = length
    j = length + 1
    border[i] = j

    while i > 0:
        while j <= length and pattern[i - 1] != pattern[j - 1]:
            if shift[j] == 0:
                shift[j] = j - i
            j = border[j]
        i -= 1
        j -= 1
        border[i] = j

    j = border[0]
    for i in range(length + 1):
        if shift[i] == 0:
            shift[i] = j
        if i == j:
            j = border[j]
    return shift


@dataclass(frozen=True, slots=True)
class BoyerMoorePattern:
    pattern: str
    last: dict[str, int]
    good_suffix: tuple[int, ...]

    @classmethod
    def compile(cls, pattern: str) -> "BoyerMoorePattern":
        if not isinstance(pattern, str):
            raise TypeError("pattern must be a string")
        last = {symbol: index for index, symbol in enumerate(pattern)}
        shifts = () if not pattern else tuple(_good_suffix_shifts(pattern))
        return cls(pattern, last, shifts)

    def find_all(self, text: str) -> list[int]:
        if not isinstance(text, str):
            raise TypeError("text must be a string")
        length = len(self.pattern)
        if length == 0:
            return list(range(len(text) + 1))
        if length > len(text):
            return []

        matches: list[int] = []
        alignment = 0
        last_alignment = len(text) - length
        while alignment <= last_alignment:
            index = length - 1
            while index >= 0 and self.pattern[index] == text[alignment + index]:
                index -= 1
            if index < 0:
                matches.append(alignment)
                alignment += self.good_suffix[0]
                continue

            symbol = text[alignment + index]
            bad_shift = index - self.last.get(symbol, -1)
            good_shift = self.good_suffix[index + 1]
            alignment += max(1, bad_shift, good_shift)
        return matches

    def find_first(self, text: str) -> int:
        if not isinstance(text, str):
            raise TypeError("text must be a string")
        length = len(self.pattern)
        if length == 0:
            return 0
        if length > len(text):
            return -1

        alignment = 0
        last_alignment = len(text) - length
        while alignment <= last_alignment:
            index = length - 1
            while index >= 0 and self.pattern[index] == text[alignment + index]:
                index -= 1
            if index < 0:
                return alignment
            symbol = text[alignment + index]
            alignment += max(
                1,
                index - self.last.get(symbol, -1),
                self.good_suffix[index + 1],
            )
        return -1
```

### Verify the worked and overlap traces

```python
compiled = BoyerMoorePattern.compile("EXAMPLE")
assert compiled.find_all("HERE IS A SIMPLE EXAMPLE") == [17]
assert compiled.find_first("HERE IS A SIMPLE EXAMPLE") == 17

overlap = BoyerMoorePattern.compile("ANA")
assert overlap.find_all("ANANA") == [0, 2]
assert overlap.find_first("ANANA") == 0

assert BoyerMoorePattern.compile("").find_all("abc") == [0, 1, 2, 3]
assert BoyerMoorePattern.compile("long").find_all("no") == []
assert BoyerMoorePattern.compile("XYZ").find_first("HERE") == -1
```

### Instrument alignment shifts

This diagnostic helper reuses the compiled tables and records only alignment positions.

It confirms the trace without changing the search result.

```python
def alignment_trace(compiled: BoyerMoorePattern, text: str) -> list[int]:
    pattern = compiled.pattern
    if not pattern or len(pattern) > len(text):
        return []
    positions: list[int] = []
    alignment = 0
    while alignment <= len(text) - len(pattern):
        positions.append(alignment)
        index = len(pattern) - 1
        while index >= 0 and pattern[index] == text[alignment + index]:
            index -= 1
        if index < 0:
            alignment += compiled.good_suffix[0]
        else:
            alignment += max(
                1,
                index - compiled.last.get(text[alignment + index], -1),
                compiled.good_suffix[index + 1],
            )
    return positions


assert alignment_trace(compiled, "HERE IS A SIMPLE EXAMPLE") == [0, 7, 9, 15, 17]
```

### Randomized differential verification

Compare all overlapping occurrences with a straightforward reference.

```python
import random


def naive_occurrences(text: str, pattern: str) -> list[int]:
    if pattern == "":
        return list(range(len(text) + 1))
    return [
        index
        for index in range(0, len(text) - len(pattern) + 1)
        if text.startswith(pattern, index)
    ]


rng = random.Random(20260830)
alphabet = "ABCD"
for text_length in range(0, 100):
    for pattern_length in range(0, 16):
        for _ in range(20):
            text = "".join(rng.choice(alphabet) for _ in range(text_length))
            pattern = "".join(rng.choice(alphabet) for _ in range(pattern_length))
            subject = BoyerMoorePattern.compile(pattern)
            expected = naive_occurrences(text, pattern)
            assert subject.find_all(text) == expected
            assert subject.find_first(text) == (expected[0] if expected else -1)
```

### Production boundaries

Compile once when searching many texts for the same pattern.

Set maximum text, pattern, result-count, and processing budgets for untrusted input.

If case-insensitive or normalization-aware search is required, define preprocessing and index mapping explicitly.

Do not execute user-provided comparison callbacks inside a privileged search service.

Use standard-library or specialized byte-search implementations when their optimized native code and tested edge semantics fit the requirement.

## 5. Asymptotic Time & Space Complexity

Let text length be $n$, pattern length $m$, and alphabet symbols observed in the pattern $\sigma_P$.

### Preprocessing

Building the rightmost-occurrence dictionary takes $O(m)$ time and $O(\sigma_P)$ space.

Strong good-suffix preprocessing takes $O(m)$ time and stores two arrays of length $m+1$ during construction.

The compiled object retains one shift array, so retained preprocessing space is $O(m+\sigma_P)$.

### Search

Boyer–Moore often makes large shifts and may inspect fewer than $n$ text positions on favorable inputs.

The simple implementation here does not include every refinement used to prove the strongest linear worst-case bounds.

A conservative worst-case bound for this implementation is $O(nm)$ character comparisons.

Its practical average behavior on suitable text can be much better.

Do not advertise “always linear” without naming the variant and proof conditions.

### Output

If there are $z$ reported occurrences, storing the result list costs $O(z)$ space.

The empty pattern produces $n+1$ boundaries, so output cost alone is $\Theta(n)$.

A generator interface can stream matches but does not eliminate the time required to emit them.

### Repeated searches

For $q$ texts with total length $N$, one pattern compilation costs $O(m)$ and searches cost their combined comparison work.

Recompiling for every text adds $O(qm)$ avoidable preprocessing.

### Comparison with naive search

Naive alignment checks have worst-case $O(nm)$ time and $O(1)$ auxiliary space.

Boyer–Moore shares that conservative worst-case bound in this implementation but uses $O(m+\sigma_P)$ preprocessing space to obtain larger practical shifts.

### Comparison with KMP

Knuth–Morris–Pratt guarantees $O(n+m)$ time using a prefix-function table and left-to-right scanning.

Boyer–Moore can skip ahead more aggressively in common cases and is often attractive for longer patterns over larger alphabets.

Implementation constants and workload determine the winner.

## 6. Systems Connections

### Text editors and search tools

Interactive search reuses a pattern while scanning buffers or files.

Compiled tables can be cached for repeated “find next” operations.

Editors must define Unicode normalization, case folding, whole-word rules, and index units for cursor placement.

### Binary and protocol scanning

The algorithm applies to byte sequences when symbols are bytes.

Bad-character tables can then use a fixed 256-entry array instead of a dictionary.

Protocol parsers must still validate framing; finding a marker does not prove the surrounding message is trustworthy.

### Intrusion detection

Signature scanners search payloads for many patterns.

Single-pattern Boyer–Moore may be useful, while Aho–Corasick or other multi-pattern automata can share work across signatures.

Evasion, encoding, stream boundaries, and normalization are part of security semantics.

### Database substring predicates

A full scan can use optimized substring search inside each value.

An ordinary B-tree cannot generally accelerate a leading-wildcard substring predicate.

Trigram indexes, suffix structures, or full-text indexes offer different preprocessing and query trade-offs.

### Search in compressed or remote data

Large shifts in logical offsets do not automatically avoid decompression or page reads.

The storage layer may need preceding blocks to decode the target region.

Performance analysis should count I/O and decoding work, not only character comparisons.

### SIMD and native libraries

Standard libraries may use vectorized first-byte filters, two-way string matching, or architecture-specific hybrids rather than textbook Boyer–Moore.

Calling a tuned routine is often preferable unless custom shift behavior or teaching transparency is required.

### Pattern caching

Caching compiled patterns saves preprocessing but can consume memory under unbounded user input.

Use size limits, eviction, normalized cache keys, and tenant isolation.

Never use a cache key inconsistent with the actual normalized pattern representation.

## 7. Practice Checklist

### Define representation

- Choose bytes, code points, or grapheme clusters.
- Define case sensitivity.
- Define Unicode normalization.
- Define returned index units.
- Define empty-pattern behavior.
- Define overlapping-match behavior.
- Keep preprocessing and search representations identical.

### Build shift tables

- Record rightmost pattern occurrence for each symbol.
- Build strong good-suffix borders.
- Fill every shift entry with a positive value.
- Include a complete-match shift.
- Test repeated-character patterns.
- Test patterns with prefix/suffix borders.
- Test symbols absent from the pattern.

### Preserve search correctness

- Compare from pattern right to left.
- Keep alignment within `0..n-m`.
- Use mismatch index for the bad-character shift.
- Use `j + 1` for the good-suffix state.
- Clamp combined shift to at least one.
- Report before applying complete-match shift.
- Preserve overlapping occurrences.

### Test comprehensively

- Test empty text and pattern.
- Test pattern longer than text.
- Test match at index zero.
- Test match at the final alignment.
- Test absent pattern.
- Test all-equal symbols.
- Test overlapping matches.
- Test multiple distinct matches.
- Differential-test randomized strings.
- Compare first-match and all-match semantics.

### Operate safely

- Reuse compiled patterns.
- Bound text, pattern, and result sizes.
- Avoid logging sensitive source text.
- Define cancellation for large scans.
- Use a fixed byte table for byte alphabets when appropriate.
- Prefer mature native routines when requirements match.
- Measure preprocessing separately from search.

## 8. Frequently Asked Questions

### Why compare from right to left?

A mismatch near the pattern's right edge exposes a text symbol that can justify a large alignment shift.

It also reveals a matched suffix for the good-suffix rule.

### What is a bad character?

It is the text symbol that mismatched the current pattern position.

The rule uses its rightmost compatible occurrence in the pattern to compute a safe shift.

### What is a good suffix?

It is the pattern suffix already matched immediately before a mismatch farther left.

The shift tries to align another compatible occurrence or a pattern prefix matching part of that suffix.

### Why take the maximum of two shifts?

Each rule independently proves that smaller alignments in its excluded range cannot match.

The next possible match must satisfy both constraints, so the larger required shift is safe.

### Is Boyer–Moore always sublinear?

No.

It can inspect fewer than $n$ characters on favorable inputs, but worst-case comparison behavior depends on the variant and pattern/text structure.

### Is Horspool the same algorithm?

Horspool is a simplified Boyer–Moore-family method using a bad-character shift centered on the aligned final text symbol.

It does not implement the full strong good-suffix rule.

### Can it find overlapping matches?

Yes, if the complete-match shift respects pattern borders.

Advancing by the full pattern length can miss overlaps.

### Why can an absent character cause a large shift?

If the mismatching text symbol does not appear anywhere in the pattern, alignments that would still place that symbol under the compared pattern prefix cannot match.

The pattern can move past it relative to the mismatch.

### What happens with an empty pattern?

This implementation reports every text boundary.

Other APIs choose index zero or reject the case; callers should rely on documented semantics.

### Does the algorithm understand human characters?

It compares the symbols supplied by the string representation.

Python iteration uses Unicode code points, which are not always user-perceived grapheme clusters.

### When is KMP preferable?

KMP provides a simple $O(n+m)$ worst-case guarantee and streams left to right without backward text access.

It is attractive for streaming or adversarial worst-case requirements.

### When is Boyer–Moore attractive?

Longer patterns, reusable preprocessing, random access, and alphabets that produce informative mismatches often favor its large shifts.

Benchmark against the standard library on representative data.

### Can preprocessing be shared across normalized searches?

Only if every text is transformed by the same deterministic normalization and indices are interpreted in that transformed representation or mapped back correctly.

### What is the most dangerous bug?

An incorrect good-suffix table can skip a real occurrence while most tests still pass.

Randomized differential testing plus adversarial border patterns is essential.
