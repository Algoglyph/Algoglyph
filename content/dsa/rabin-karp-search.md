# Rabin-Karp Search: Rolling Hashes, Collision Verification & Multi-Pattern Scanning

![Rabin-Karp rolling hash window](/images/dsa/rabin-karp-search-dark.png#dark)

## 1. Historical Context & Motivation

Substring search asks where a pattern occurs inside a longer text.

Direct comparison can retry many characters at every candidate position.

Rabin-Karp replaces most full comparisons with a compact rolling fingerprint.

It hashes the pattern once.

It hashes each text window of the same length.

Different hashes prove the strings differ.

Equal hashes identify candidates that require exact verification.

The verification step is mandatory because hashes can collide.

Michael Rabin and Richard Karp published the algorithm in 1987.

Its distinctive advantage is efficient hash reuse between overlapping windows.

Removing the outgoing character and adding the incoming character takes constant arithmetic work.

The algorithm is especially natural for searching many equal-length patterns.

Store all pattern hashes in a lookup table.

Each text window is hashed once and checked against candidate patterns.

For one pattern, KMP often gives stronger deterministic worst-case behavior.

Rabin-Karp remains valuable when hashing integrates with a broader pipeline.

Document similarity systems use related fingerprints over many substrings.

Plagiarism detection and data deduplication use rolling-hash families.

Content-defined chunking rolls a hash across byte boundaries.

The exact hash design differs by application and threat model.

A small modulus makes collisions frequent.

Fixed machine overflow can be fast but needs carefully defined arithmetic.

Double hashing reduces accidental collision probability.

No unkeyed noncryptographic hash should be trusted against hostile collision construction.

Cryptographic authentication requires a different primitive.

Unicode adds representation questions.

Searching code points differs from searching encoded bytes or grapheme clusters.

Normalization can make visually equivalent strings encode differently.

The API must specify its text unit and normalization policy.

Empty-pattern semantics also need definition.

Many libraries define an empty pattern as matching at every boundary.

This article returns every start position from `0` through text length.

The mechanism is probabilistic filtering plus deterministic confirmation.

That separation is the central correctness idea.

## 2. Core Mathematical Invariants

### Polynomial hash

Encode a length-`m` sequence $s_0,\ldots,s_{m-1}$ with base `b` and modulus `q`:

$$
H(s)=\sum_{i=0}^{m-1}s_i b^{m-1-i}\bmod q.
$$

The leading character has coefficient $b^{m-1}$.

The trailing character has coefficient one.

Precompute:

$$
h=b^{m-1}\bmod q.
$$

### Rolling invariant

Let current text window start at `i` with hash `t_i`.

Remove outgoing value $x_i h$.

Multiply the remaining polynomial by base `b`.

Add incoming value $x_{i+m}$.

The update is:

$$
t_{i+1}=\bigl(b(t_i-x_i h)+x_{i+m}\bigr)\bmod q.
$$

After normalization, `t_i` equals the direct polynomial hash of window `T[i:i+m]`.

This is the rolling-hash invariant.

### Candidate invariant

If window hash differs from pattern hash, the window cannot equal the pattern.

Equal strings always produce equal deterministic hashes under the same parameters.

The converse is false.

Equal hashes do not prove equal strings.

Therefore every reported match must pass exact character comparison.

### Window invariant

Before iteration `i`, the maintained hash corresponds exactly to text indices `[i,i+m)`.

Only valid full-length windows are considered.

There are:

$$
n-m+1
$$

such windows when `m <= n`.

After processing the final start `n-m`, no incoming character exists.

The rolling update must not run beyond that point.

### Modulo normalization

Some languages produce negative remainders for negative operands.

Normalize into `[0,q)` after subtraction.

Python's positive modulus already returns a nonnegative value for positive `q`.

Portable pseudocode should still state the invariant.

### Collision probability

Under suitable random or independent hash assumptions, collision probability is about $1/q$ for one modulus.

Two independent moduli reduce accidental probability toward $1/(q_1q_2)$.

These are probabilistic claims with assumptions.

Exact verification makes reported matches deterministic regardless of collisions.

Collisions can still increase running time.

### Multi-pattern invariant

Group patterns by length.

Windows can only match patterns of the same length.

For each length, map hash values to the patterns producing them.

Exact verification distinguishes patterns sharing a hash bucket.

## 3. Step-by-Step Execution Trace

Search pattern `314` inside text `27143145`.

Use decimal digits as values.

Choose base `10` and modulus `101` for a small trace.

Pattern length is `m = 3`.

Compute $h=10^{2}\bmod101=100$.

Pattern hash is:

$$
(3\cdot100+1\cdot10+4)\bmod101=314\bmod101=11.
$$

The first text window is `271`.

Its hash is $271\bmod101=69$.

Hash `69` differs from pattern hash `11`.

Therefore window `271` is not a match.

Roll from `271` to `714`.

Outgoing digit is `2` and incoming digit is `4`.

Subtract outgoing contribution:

$$
69-2\cdot100=-131.
$$

Multiply by base and add incoming digit:

$$
10(-131)+4=-1306.
$$

Normalize modulo `101` to obtain `7`.

Direct check gives $714\bmod101=7$, confirming the rolling invariant.

Hash `7` differs from `11`.

Roll from `714` to `143`.

Outgoing digit is `7` and incoming digit is `3`.

The resulting hash is $143\bmod101=42$.

It differs from `11`.

Roll from `143` to `431`.

The resulting hash is $431\bmod101=27$.

It differs from `11`.

Roll from `431` to `314`.

The resulting hash is $314\bmod101=11$.

The hashes match, so this is only a candidate.

Compare text positions `4`, `5`, and `6` with pattern characters.

They are `3`, `1`, and `4`.

Every character matches.

Report start index `4`.

Roll once more to window `145`.

Its hash is $145\bmod101=44$.

No match is reported.

The final result is `[4]`.

### Collision trace

With the same small modulus, decimal values `314` and `11` both hash to `11` under a simplistic integer interpretation.

A hash-only implementation could report a false match.

Exact window comparison rejects unequal candidates.

The result remains correct while extra comparison work is incurred.

### Empty pattern trace

For text length `3`, there are four boundaries: `0`, `1`, `2`, and `3`.

Under the chosen convention, the empty pattern matches at all four.

No rolling arithmetic is needed.

## 4. Production-Ready Implementations

The following implementation hashes Unicode code points and verifies every candidate.

```python
from __future__ import annotations


def rabin_karp(
    text: str,
    pattern: str,
    *,
    base: int = 1_114_113,
    modulus: int = 2_305_843_009_213_693_951,
) -> list[int]:
    if modulus <= 1:
        raise ValueError("modulus must be greater than one")
    if not 1 < base < modulus:
        raise ValueError("base must lie between one and modulus")

    n = len(text)
    m = len(pattern)
    if m == 0:
        return list(range(n + 1))
    if m > n:
        return []

    high = pow(base, m - 1, modulus)
    pattern_hash = 0
    window_hash = 0

    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % modulus
        window_hash = (window_hash * base + ord(text[i])) % modulus

    matches: list[int] = []
    for start in range(n - m + 1):
        if window_hash == pattern_hash and text.startswith(pattern, start):
            matches.append(start)

        if start == n - m:
            break
        outgoing = ord(text[start])
        incoming = ord(text[start + m])
        window_hash = (window_hash - outgoing * high) % modulus
        window_hash = (window_hash * base + incoming) % modulus

    return matches


assert rabin_karp("27143145", "314") == [4]
assert rabin_karp("aaaaa", "aa") == [0, 1, 2, 3]
assert rabin_karp("abc", "") == [0, 1, 2, 3]
assert rabin_karp("short", "longer") == []
```

The modulus is a large Mersenne prime, though Python still performs ordinary modular arithmetic here.

Exact verification protects correctness from collision.

The base exceeds the Unicode scalar range represented by ordinary code points.

The function searches Python code-point sequences.

It does not normalize canonically equivalent Unicode strings.

Callers can normalize text and pattern with the same Unicode normalization form.

Reported indices then refer to the normalized string, not necessarily original storage offsets.

Byte-oriented systems should hash bytes directly.

For hostile inputs, a caller can use two independently keyed hashes or a deterministic linear-time matcher.

Even with exact verification, deliberate collisions can force repeated $O(m)$ comparisons.

Use KMP when a deterministic $O(n+m)$ bound is required.

### Multi-pattern extension

Group patterns by their lengths.

Compute a rolling stream once for each distinct length.

Map each hash to all patterns with that hash.

Verify candidate patterns against the current window.

Aho-Corasick is usually preferable when many patterns have varied lengths.

## 5. Asymptotic Time & Space Complexity

Let text length be `n` and pattern length be `m`.

Initial pattern and window hashing takes $O(m)$ time.

There are `n-m+1` windows when `m <= n`.

Each rolling update takes $O(1)$ modular operations in the word-RAM abstraction.

Without collisions, scanning takes $O(n+m)$ expected time.

Every hash match triggers exact verification costing up to $O(m)$.

If `c` candidates share the pattern hash, total time is:

$$
O(n+m+cm).
$$

In the worst case `c = O(n)`.

Worst-case time is therefore $O(nm)$.

Exact verification preserves correctness but not the linear expected bound under adversarial collisions.

The rolling state uses $O(1)$ auxiliary space.

The returned match positions use $O(k)$ output space for `k` matches.

Streaming matches through an iterator avoids materializing those positions.

Large-integer modular arithmetic has costs beyond the unit-word model.

The chosen modulus fits within a bounded machine word in lower-level implementations.

Multiplication may require widened intermediates to avoid unintended overflow.

Using natural unsigned overflow defines arithmetic modulo $2^w$.

That can be fast but changes collision properties.

Double hashing performs two rolling updates and stores two hash values.

Its asymptotic complexity is unchanged.

Multi-pattern searching by `d` distinct lengths performs roughly `d` rolling scans.

Its time includes $O(dn)$ plus candidate verification.

Grouping equal-length patterns avoids one scan per individual pattern.

## 6. Systems Connections

Plagiarism detection hashes document shingles to find shared passages.

Near-duplicate systems sample or sketch large sets of fingerprints.

Backup software uses rolling fingerprints for content-defined chunk boundaries.

Chunks remain aligned after insertions better than fixed-size blocks.

Data-deduplication systems hash chunks cryptographically after boundary detection.

The rolling fingerprint is not itself sufficient for identity or integrity.

Version-control and synchronization tools detect reused blocks between files.

Malware scanners search for many byte signatures.

Aho-Corasick or SIMD matching may be preferable for large pattern sets.

Network intrusion detection must assume adversarial traffic.

Unkeyed collision behavior can become a denial-of-service surface.

Database text indexes precompute richer structures for repeated queries.

Rabin-Karp is more natural for one pass over transient data.

Bioinformatics uses rolling encodings over DNA k-mers.

Small alphabets allow compact exact encodings for bounded k.

Streaming systems can maintain a window hash without retaining the entire stream.

Exact verification still requires access to the candidate window.

Merkle trees use cryptographic hashes for authenticated structure, not rolling search.

Checksums detect accidental corruption under different guarantees.

Hash purpose determines acceptable collision assumptions.

Search interfaces must specify byte, code-point, or grapheme indices.

That choice affects interoperability and display highlighting.

## 7. Practice Checklist

- Define the sequence unit: bytes, code points, or another token type.
- Define Unicode normalization behavior.
- Choose a base and modulus appropriate to the alphabet.
- Precompute the leading coefficient correctly.
- Hash pattern and first window with identical recurrence.
- Maintain the exact current-window hash invariant.
- Remove the outgoing contribution before shifting.
- Add the incoming value after multiplying by the base.
- Normalize negative remainders portably.
- Stop rolling after the final complete window.
- Verify every equal-hash candidate exactly.
- Never report hash equality as string equality.
- Test empty pattern semantics.
- Test pattern longer than text.
- Test equal text and pattern.
- Test overlapping matches.
- Test repeated characters.
- Test a match at index zero.
- Test a match at the final possible index.
- Force collisions with a tiny test modulus.
- Confirm collision candidates are rejected.
- Use deterministic matching for hostile worst-case inputs.
- Consider double hashing for accidental collision reduction.
- Do not use a rolling hash as a cryptographic authenticator.
- Use widened arithmetic when machine multiplication can overflow unexpectedly.
- Group multiple patterns by length.
- Compare Aho-Corasick for many varied-length patterns.
- Include candidate verification in the complexity analysis.
- Report output index units clearly.
- Preserve access to the candidate window in streaming designs.
- Benchmark modulus arithmetic on the target runtime.

## 8. Frequently Asked Questions

### Which failures should a review catch?

Recomputing every window hash discards the algorithm's central advantage.

Removing the outgoing character with the wrong power corrupts every later window.

Updating after the final window reads beyond the text.

Using different encodings for pattern and text makes equal strings hash differently.

Skipping exact verification permits collision false positives.

Reporting normalized-string indices as original offsets can highlight the wrong text.

Using a tiny fixed modulus makes accidental and adversarial collisions much easier.

Assuming two hashes are independent without constructing them independently overstates reliability.

Overflow must be deliberate modular arithmetic rather than language-dependent accident.

A signed remainder must be normalized before hash comparison.

Empty-pattern behavior should be tested rather than inherited accidentally from loop bounds.

Multi-pattern buckets must retain every pattern sharing one fingerprint.

Streaming implementations must retain enough window data for exact verification.

Security review should reject noncryptographic hashes for authentication claims.

Benchmarks should include repetitive text that produces many candidate checks.

### Why verify when hashes match?

Different strings can have the same finite hash value.

Verification prevents false-positive matches.

### Is Rabin-Karp always linear time?

No.

It is expected linear under suitable collision behavior but can take $O(nm)$ worst-case time.

### What makes the hash rolling?

The next window hash is derived by removing one character and adding one character.

The shared middle does not need to be rehashed.

### Can it find overlapping matches?

Yes.

The algorithm advances by one start position after every window.

### Which modulus should I use?

Use a large modulus supported efficiently by the numeric representation.

Threat models may require randomized or deterministic alternatives.

### Is double hashing collision-free?

No.

It reduces probability under independence assumptions but remains finite hashing.

### How does it compare with KMP?

KMP guarantees $O(n+m)$ time for one pattern.

Rabin-Karp is attractive for rolling and equal-length multi-pattern use.

### Can it search Unicode text?

Yes, after defining code units and normalization consistently.

### Is it suitable for cryptographic integrity?

No.

Use an authenticated cryptographic primitive for adversarial integrity.

### What is the core invariant?

The maintained hash equals the direct hash of the current full-length window.
