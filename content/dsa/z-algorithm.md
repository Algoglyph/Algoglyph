# Z-Algorithm: Linear-Time Prefix Matching Across a String

![Z-boxes and prefix matches along a string](/images/dsa/z-algorithm-dark.png)

## 1. Historical Context & Motivation

String matching repeatedly asks how much of a known prefix appears elsewhere.
A naive solution compares from the beginning at every position.
On repetitive text, those comparisons redo nearly identical work.
For a length-$n$ string, the naive cost can reach $O(n^2)$.
The Z-algorithm records the reusable information explicitly.
For every position, it computes the longest substring matching the whole-string prefix.
The resulting **Z-array** supports exact pattern search.
It also reveals borders, periods, and repeated prefix structure.
The key optimization is a rightmost verified match interval.
That interval is commonly called a **Z-box**.
Positions inside the box inherit lower bounds from earlier Z-values.
Only comparisons extending beyond the box inspect new characters.
The right boundary moves at most $n$ times.
That monotonic movement yields linear total time.
The technique is related to the prefix function used by KMP.
Both preprocess self-similarity to avoid rescanning.
They encode different questions.
KMP stores longest proper-border information for prefixes.
Z stores prefix-match length beginning at each position.
Conversions between the arrays are possible but not always worth implementing.
Z-values are especially natural when a task asks about prefix occurrences.
Pattern search concatenates pattern, a separator, and text.
A Z-value equal to pattern length marks a match.
The separator must not occur in either input.
Alternatively, an implementation can operate on token sequences with a unique sentinel object.
Unicode strings require clarity about code points versus grapheme clusters.
Byte-oriented protocols should operate on bytes.
The basic algorithm requires only equality comparisons.
It does not need hashing and therefore has no collision risk.
Its loop is compact, but boundary mistakes are common.
Half-open interval notation makes the implementation easier to verify.

## 2. Core Mathematical Invariants

For string $s$ of length $n$, define

$$
Z[i]=\max\{\ell\mid s[0:\ell]=s[i:i+\ell]\}.
$$

By convention, implementations often set $Z[0]=0$.
Some definitions set $Z[0]=n$.
The choice does not affect later entries.
Use a rightmost half-open Z-box $[L,R)$.
Its invariant is $s[L:R]=s[0:R-L]$.
No previously discovered Z-box extends farther right than $R$.
When $i\ge R$, position $i$ is outside the box.
Matching must begin explicitly from length zero.
If characters agree, extend $R$ one step at a time.
When $i<R$, map position $i$ to prefix index $k=i-L$.
The known box proves at least `min(Z[k], R-i)` matching characters.
If $Z[k]<R-i$, the earlier match ends before the box boundary.
Then $Z[i]=Z[k]$ exactly.
Why exactly?
The mismatch that stopped $Z[k]$ is reproduced inside the equal Z-box.
No new comparison is necessary.
If $Z[k]\ge R-i$, the inherited match reaches the boundary.
The true value may extend farther.
Start comparisons at $R$ rather than repeating the known prefix.
After extension, set $L=i$ and update $R=i+Z[i]$.
Every successful explicit comparison outside an old box increases $R$.
$R$ never decreases.
Therefore at most $n$ such successful extensions occur.
Failed extension comparisons occur at most once per loop position.
Together these facts prove linear time.
All Z-values satisfy $0\le Z[i]\le n-i$.
If $Z[i]=n-i$, suffix `s[i:]` is a prefix.
That condition identifies a border of length $n-i$.
For pattern search, build `pattern + sentinel + text`.
No match can cross the unique sentinel.
A text match beginning at $j$ corresponds to combined index $m+1+j$.
It is a full match exactly when the Z-value there is at least $m$.
For ordinary strings it will equal $m$ because the sentinel blocks further equality.
Overlapping matches are retained because every position receives a Z-value.

## 3. Step-by-Step Execution Trace

Compute Z-values for `aabcaabxaaaz`.
Use zero-based positions.
Initialize every Z-value to zero.
Start with empty box `[0,0)`.
At `i=1`, the position is outside the box.
Compare prefix `a` with `s[1]=a` and match.
Next compare prefix `a` with `s[2]=b` and stop.
Set `Z[1]=1` and box `[1,2)`.
At `i=2`, start outside the box.
Prefix `a` differs from `b`.
Set `Z[2]=0`.
At `i=3`, prefix `a` differs from `c`.
Set `Z[3]=0`.
At `i=4`, compare explicitly.
The substring begins `aab` like the prefix.
Three characters match.
The next comparison is prefix `c` against `x` and fails.
Set `Z[4]=3` and box `[4,7)`.
At `i=5`, position lies inside the box.
Its mirrored prefix index is `1`.
`Z[1]=1` and remaining box length is `2`.
Because one is smaller than two, copy it exactly.
Set `Z[5]=1` without new comparisons.
At `i=6`, mirrored prefix index is `2`.
`Z[2]=0`, so set `Z[6]=0`.
At `i=7`, begin outside the box.
Prefix `a` differs from `x`.
Set `Z[7]=0`.
At `i=8`, explicit comparison begins.
Characters `a` and `a` match.
The second prefix character `a` also matches.
The third prefix character `b` differs from `a`.
Set `Z[8]=2` and box `[8,10)`.
At `i=9`, use mirror index `1`.
The inherited value reaches the current boundary.
Start extension at index ten.
Prefix position one is `a`, matching `s[10]=a`.
Prefix position two is `b`, differing from `s[11]=z`.
Set `Z[9]=2` and update box `[9,11)`.
At `i=10`, mirror index is `1`.
Only one character remains inside the box.
Inherited matching reaches the boundary.
Compare prefix position one `a` with final `z` and fail.
Set `Z[10]=1`.
At `i=11`, prefix `a` differs from `z`.
Set `Z[11]=0`.
The final array is `[0,1,0,0,3,1,0,0,2,2,1,0]`.
The long value at index four exposes a repeated prefix `aab`.
Copied values avoided comparisons inside the established box.
Extension occurred only at the right boundary.

## 4. Production-Ready Implementations

The core function accepts any indexable sequence with equality.
Pattern search uses a unique object sentinel so input tokens cannot collide with it.

```python
from __future__ import annotations

from collections.abc import Sequence
from typing import TypeVar

T = TypeVar("T")


def z_array(sequence: Sequence[T]) -> list[int]:
    n = len(sequence)
    z = [0] * n
    left = 0
    right = 0
    for index in range(1, n):
        if index < right:
            mirror = index - left
            z[index] = min(z[mirror], right - index)
        while (
            index + z[index] < n
            and sequence[z[index]] == sequence[index + z[index]]
        ):
            z[index] += 1
        if index + z[index] > right:
            left = index
            right = index + z[index]
    return z


def find_all(text: Sequence[T], pattern: Sequence[T]) -> list[int]:
    if len(pattern) == 0:
        return list(range(len(text) + 1))
    sentinel = object()
    combined: list[object] = list(pattern) + [sentinel] + list(text)
    z = z_array(combined)
    offset = len(pattern) + 1
    return [
        index - offset
        for index in range(offset, len(combined))
        if z[index] >= len(pattern)
    ]


assert z_array("aabcaabxaaaz") == [0, 1, 0, 0, 3, 1, 0, 0, 2, 2, 1, 0]
assert find_all("bananana", "ana") == [1, 3, 5]
assert find_all("aaaa", "aa") == [0, 1, 2]
assert find_all("abc", "") == [0, 1, 2, 3]
assert find_all("abc", "xyz") == []
```

The empty-pattern contract must be decided deliberately.
This implementation reports every boundary, matching common string APIs.
Applications may instead reject empty patterns.
For byte streams, pass `bytes` values directly.
For token streams, pass a list of comparable tokens.
The combined list copies both inputs.
A specialized search can avoid that copy with a virtual indexed view.
The asymptotic bound remains linear either way.
Very large inputs may benefit from integer arrays for Z-values.
Choose an integer width that can represent the sequence length.
Streaming Z computation is not naturally online because comparisons refer to the global prefix.
Chunk boundaries therefore require retained prefix and unresolved-match state.
Parallel block computation also needs reconciliation across boundaries.
For most in-memory strings, the sequential loop is simpler and fast.
Tests should compare against naive matching on random short inputs.
Include repetitive inputs because they stress the reuse logic.
Include Unicode tests under the intended unit of indexing.

## 5. Asymptotic Time & Space Complexity

Let $n$ be the sequence length.
The outer loop runs $n-1$ iterations.
Copying an internal Z-value is constant time.
Each failed explicit comparison contributes constant work to one iteration.
Each successful comparison beyond the old box increases $R$.
Since $R$ begins at zero and never exceeds $n$, there are at most $n$ such increases.
Total core running time is therefore $O(n)$.
The Z-array occupies $O(n)$ space.
Aside from output, the algorithm uses $O(1)$ scalar state.
Thus auxiliary space excluding the result is $O(1)$.
Pattern search combines lengths $m$ and $n$.
Its preprocessing and scan cost $O(m+n)$ time.
The explicit combined sequence costs $O(m+n)$ additional space here.
The Z-array also costs $O(m+n)$.
The returned match list costs $O(k)$ for $k$ matches.
Overlapping matches can make $k=\Theta(n)$.
The naive per-position method can take $\Theta(mn)$ time.
That worst case occurs on repetitive prefixes followed by mismatches.
Rolling-hash search can also be linear expected time.
It must handle collision risk or verify candidates.
KMP uses $O(m)$ preprocessing space when searching a text.
The concatenated Z approach uses space proportional to text as written.
A specialized online matcher may therefore prefer KMP.
Constant factors depend on equality cost.
For long structured tokens, one comparison may not be constant time.
The formal bound assumes constant-time element equality.

## 6. Systems Connections

Deduplication tools use prefix matches while comparing candidate byte regions.
Suffix-oriented indexes reuse related common-prefix information at larger scale.
DNA alphabets are small, so repetitive sequences make rescanning expensive.
Exact matching remains distinct from approximate biological alignment.
Lexer generators search fixed tokens, though automata suit many patterns better.
Single-pattern Z search works best when pattern and text are available together.
Content-defined chunking uses rolling criteria, not exact prefix matching.
Binary scanners must avoid decoding that changes byte positions.
Memory safety requires checking `index + z[index]` before every access.
The half-open formulation makes that bound visible.
Foreign-function interfaces should validate lengths before allocation.
Very large mapped files may exceed 32-bit Z-value storage.
Sharding loses fixed-pattern matches crossing boundaries unless overlap is retained.
That overlap needs at least pattern length minus one characters.
Full Z construction cannot use a fixed overlap because prefix matches are unbounded.
This distinction matters in distributed string processing.
The deterministic linear bound remains reliable on adversarial repetition.
Resource limits are still necessary for untrusted input sizes.
Search tools use linear string matching to scan large code and log corpora.
Z-values are convenient for finding every occurrence of a prefix-derived pattern.
Bioinformatics uses related exact matching primitives on symbol sequences.
Compression tools detect repeated prefixes and back-references.
Protocol parsers can locate fixed delimiters in byte buffers.
Security filters must define normalization before matching Unicode text.
Matching code points is not the same as matching displayed graphemes.
Case folding can change string length and index mapping.
Network intrusion rules may require byte-exact semantics instead.
The unique-sentinel construction should not reserve a user-visible character unnecessarily.
An object sentinel avoids collision in an in-memory token sequence.
Serialized algorithms need a sentinel value outside the encoded alphabet.
Prefix analytics can use Z-values to find borders.
A border is a proper prefix that is also a suffix.
Position $i$ yields border length $n-i$ when $Z[i]=n-i$.
String-period tests combine border information with divisibility.
Runs and repetition algorithms use similar interval reuse ideas.
The Z-box is an example of amortization by a monotone frontier.
That reasoning also appears in two-pointer scans and Manacher's algorithm.
Library APIs should return indexes in clearly stated units.
UTF-8 byte offsets and Unicode scalar indexes are different.
Memory-mapped inputs avoid copying source bytes but still require an output strategy.
If only matches matter, a specialized variant can emit positions instead of retaining every Z-value.
Observability should record input sizes and rejected oversize requests.
Exact matching is safe from hash collisions but not from unbounded resource use.

## 7. Practice Checklist

- Define `Z[0]` convention explicitly.
- Use either closed or half-open boxes consistently.
- Define `Z[i]` as a prefix-match length.
- Maintain the rightmost known box.
- Copy only the part guaranteed by the box.
- Extend only when the inherited match reaches the boundary.
- Update both box endpoints after a farther extension.
- Prove the right endpoint never decreases.
- Count successful boundary extensions in the linear-time proof.
- Test the empty string.
- Test a one-character string.
- Test all-distinct characters.
- Test all-equal characters.
- Test overlapping repetitions.
- Test a match ending at the final character.
- Compare random cases with a naive Z implementation.
- Choose an explicit empty-pattern contract.
- Use a collision-free sentinel.
- Report text-relative rather than combined-string indexes.
- Include overlapping pattern matches unless the API says otherwise.
- State whether inputs are bytes, code points, or tokens.
- Include combination allocation in space analysis.
- Do not describe hashing collisions because the algorithm uses equality.
- Distinguish Z-values from the KMP prefix function.
- Use an integer type large enough for input length.
- Bound untrusted input sizes.
- Avoid quadratic slicing in the comparison loop.
- Validate image and trace labels against index convention.
- Derive border lengths from suffix positions carefully.
- Measure equality cost for structured tokens.

## 8. Frequently Asked Questions

### What does `Z[i]` mean?

It is the number of characters starting at `i` that equal the string's prefix.
It is a length, not an ending index.

### Why is `Z[0]` often zero?

The entire string trivially matches itself.
Setting it to zero avoids a special value that most applications do not need.

### What is a Z-box?

It is an interval known to equal a prefix interval.
The algorithm reuses values inside the rightmost such interval.

### Why is the algorithm linear despite a nested loop?

Successful extension comparisons move a global right boundary forward.
That boundary can advance at most $n$ times.

### How does it find a pattern in text?

Compute Z on pattern, a unique sentinel, and text.
Values reaching the pattern length identify match starts.

### Does it find overlapping matches?

Yes.
Every text position is evaluated independently within the shared linear scan.

### Is the Z-algorithm better than KMP?

Neither dominates every use.
Z is natural for prefix-occurrence questions, while KMP supports compact streaming search well.

### Does it use hashing?

No.
It performs exact equality comparisons and has no collision probability.

### Can it process arrays instead of strings?

Yes.
The elements only need a meaningful equality operation.

### How are borders found?

For every `i` where `Z[i] == n - i`, the suffix beginning at `i` is also a prefix.
Its border length is `n - i`.

### What is the most common bug?

Mixing inclusive and exclusive right boundaries causes off-by-one errors.
Write the invariant before translating formulas into code.

### Can it run directly on an infinite stream?

Not in its ordinary form because later comparisons refer back to the complete prefix.
Streaming pattern matching is usually better served by KMP or an automaton.
