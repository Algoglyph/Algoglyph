# Suffix Arrays: Lexicographic Suffix Order, Rank Doubling & LCP Queries

![Suffix array ordering for a sample string](/images/dsa/suffix-arrays-dark.jpg)

## 1. Historical Context & Motivation

Substring queries become expensive when the same text is scanned repeatedly.
A suffix array indexes every suffix of a fixed text in lexicographic order.
It stores starting positions rather than explicit suffix copies.
That compact choice retains enough order to search patterns by binary search.
For text `banana`, suffix starting at index three is `ana` and suffix starting at five is `a`.
Sorting all such suffixes creates contiguous groups sharing prefixes.
Pattern occurrences form one interval in that sorted order.
The structure emerged as a space-conscious alternative to suffix trees.
Suffix trees provide linear-time pattern navigation but have large constants and complex pointer-rich nodes.
Suffix arrays use one integer per suffix plus optional auxiliary arrays.
They are cache-friendly and straightforward to serialize.
The naïve construction is deceptively expensive.
Materializing every suffix creates quadratic total characters.
Comparing long suffixes repeatedly can add another factor.
Efficient algorithms sort suffixes through ranks rather than copies.
The prefix-doubling method sorts by the first one symbol, then two, four, eight, and so on.
At each round, a suffix is represented by a pair of prior ranks.
More advanced algorithms such as SA-IS achieve linear construction for suitable integer alphabets.
The Burrows-Wheeler transform, compressed indexes, and many repeat analyses build on suffix ordering.
The longest-common-prefix array adds the shared prefix length of adjacent sorted suffixes.
It supports repeated-substring discovery and accelerates comparison-driven queries.
A suffix array is immutable with respect to the indexed text.
Inserting one character changes many suffix identities and order relations.
Dynamic text needs a different index or batched rebuilding.
Encoding semantics matter here as in every string structure.
Sorting bytes, Unicode code points, and locale-collated user strings produces different orders.
Suffix indexing normally uses an exact finite alphabet order rather than locale-dependent collation.
The public contract must define the unit and return offsets in that same unit.
This article develops rank doubling, pattern intervals, and Kasai's LCP construction.
It emphasizes why each stored integer corresponds to a precise lexicographic invariant.

## 2. Core Mathematical Invariants

Let text $T$ have length $n$.
Suffix $S_i$ is the sequence $T[i\ldots n-1]$.
The suffix array `SA` is a permutation of indices $0,1,\ldots,n-1$.
Its defining invariant is

$$
S_{SA[0]}<S_{SA[1]}<\cdots<S_{SA[n-1]}
$$

under lexicographic order.
No suffix content is duplicated in the index.
Each `SA[k]` identifies one suffix in the original text.
The inverse rank array satisfies `rank[SA[k]] = k`.
Prefix doubling maintains ranks for prefixes of length $2^h$.
At round $h$, `rank[i]` identifies the equivalence class of the first $2^h$ symbols of suffix $i$.
Suffixes with equal represented prefixes have equal ranks.
Order of rank values matches lexicographic order of represented prefixes.
To extend to length $2^{h+1}$, represent suffix $i$ by

$$
(rank[i],rank[i+2^h]).
$$

The second component uses a sentinel rank smaller than every real symbol when the suffix ends early.
Sorting these pairs gives the correct order for prefixes of doubled length.
Assign new equal ranks exactly to equal pairs.
Once $2^h\ge n$, represented prefixes include every entire suffix.
Ranks are then unique and the sorted index order is the suffix array.
The sentinel convention ensures a shorter equal-prefix suffix sorts first.
For example, `a` sorts before `ana`.
Pattern $P$ of length $m$ matches suffix $S_i$ when $P$ is a prefix of $S_i$.
All matching suffixes are contiguous in suffix-array order.
If two suffixes begin with $P$, every suffix lexicographically between them must also begin with $P$.
Otherwise its first differing symbol would place it outside that interval.
This contiguity enables two boundary searches.
The lower boundary is the first suffix not lexicographically less than $P$ under prefix-aware comparison.
The upper boundary is the first suffix lexicographically greater than every sequence beginning with $P$.
Implementations can use custom comparisons or search for $P$ and a conceptual upper sentinel.
Directly creating `P + maximum_character` is unsafe when the alphabet has no reserved maximum.
An explicit prefix comparator is clearer.
The LCP array records common-prefix length of adjacent sorted suffixes.
One convention sets `LCP[0] = 0` and

$$
LCP[k]=\operatorname{lcp}(S_{SA[k-1]},S_{SA[k]})
$$

for $k>0$.
For any two suffix-array positions $p<q$, their common prefix equals the minimum LCP value over positions $p+1$ through $q$.
Every adjacent boundary on that interval must preserve the common prefix.
The smallest boundary length is exactly where the pair's shared prefix ends.
An RMQ structure over LCP therefore answers arbitrary suffix LCP queries efficiently.
Kasai's algorithm builds LCP in linear time.
If suffix $i$ has LCP length $k$ with its lexicographic predecessor, suffix $i+1$ has at least $k-1$ shared symbols with its own relevant neighbor before extension checks.
Dropping the first symbol can reduce a common prefix by at most one.
That amortizes character comparisons across suffixes.
The longest repeated substring length is the maximum adjacent LCP.
At least two suffixes sharing a prefix represent two occurrences of that substring.
Distinct-substring count follows another invariant.
Suffix $i$ contributes its length minus the LCP with its predecessor in sorted order.
Summing gives

$$
\frac{n(n+1)}{2}-\sum_{k=1}^{n-1}LCP[k].
$$

Empty text has an empty suffix array under this article's convention.
Some formal treatments include the empty suffix using a terminal sentinel.
Choose one convention and use it consistently.

## 3. Step-by-Step Execution Trace

Use text `banana` with indices zero through five.
The suffixes are `banana`, `anana`, `nana`, `ana`, `na`, and `a`.
Sorting them lexicographically gives `a`, `ana`, `anana`, `banana`, `na`, `nana`.
Their starting indices are `[5, 3, 1, 0, 4, 2]`.
That is the final suffix array.
Now trace prefix doubling.
Initial ranks reflect single characters.
Both `a` positions share one rank.
Both `n` positions share another rank.
`b` has its own rank.
At length two, suffix index five has pair `(rank(a), sentinel)`.
Index three has pair for `an`.
Index one also has pair for `an`.
Those last two remain tied at this stage.
Index zero has pair for `ba`.
Indices two and four have pair for `na`.
After sorting and reranking, some classes are still equal.
At length four, index three represents `ana` plus end padding.
Index one represents `anan`.
Their second-half ranks differ, so the tie breaks.
Indices two and four similarly separate because `nana` and `na` have different continuations.
Once the represented length reaches at least six, every suffix has a unique rank.
Now search pattern `ana`.
Compare it with suffix-array entries through binary search.
Suffix at position zero is `a`, which is shorter than the pattern after matching one symbol.
Suffix at position one is `ana`, which begins with the pattern.
Suffix at position two is `anana`, which also begins with the pattern.
Suffix at position three is `banana`, which is greater because `b > a`.
The matching interval is suffix-array positions one through two.
The occurrence starts are `[3, 1]` in lexicographic suffix order.
Sorting those starts numerically would produce text order `[1, 3]` if required by the API.
Now build the LCP values.
`a` and `ana` share one symbol, so the next LCP is 1.
`ana` and `anana` share three symbols, so the next LCP is 3.
`anana` and `banana` share zero.
`banana` and `na` share zero.
`na` and `nana` share two.
Using the leading-zero convention, LCP is `[0, 1, 3, 0, 0, 2]`.
The maximum value is three.
One longest repeated substring is `ana`.
It occurs at starts one and three.
Now query the LCP of suffixes at text indices one and five.
Their suffix-array ranks are two and zero.
Take minimum LCP over sorted positions one through two: `min(1, 3) = 1`.
Indeed `anana` and `a` share only `a`.
Count distinct substrings.
The total number of nonempty substrings with multiplicity is $6\cdot7/2=21$.
The LCP sum excluding the first zero is $1+3+0+0+2=6$.
The number of distinct substrings is 15.
This trace connects suffix order, search intervals, repeats, and combinatorial counting through the same index.

## 4. Production-Ready Implementations

The following implementation constructs a suffix array by rank doubling, builds LCP with Kasai's algorithm, and finds all exact occurrences.

```python
from __future__ import annotations

from collections.abc import Sequence
from typing import TypeVar


T = TypeVar("T")


class SuffixArray:
    def __init__(self, text: str) -> None:
        self.text = text
        self.sa = self._build(text)
        self.rank = [0] * len(text)
        for order, start in enumerate(self.sa):
            self.rank[start] = order
        self.lcp = self._build_lcp(text, self.sa, self.rank)

    @staticmethod
    def _build(text: str) -> list[int]:
        n = len(text)
        if n == 0:
            return []
        sa = list(range(n))
        alphabet = {symbol: rank for rank, symbol in enumerate(sorted(set(text)))}
        ranks = [alphabet[symbol] for symbol in text]
        width = 1

        while width < n:
            sa.sort(key=lambda index: (ranks[index], ranks[index + width] if index + width < n else -1))
            next_ranks = [0] * n
            for order in range(1, n):
                previous = sa[order - 1]
                current = sa[order]
                previous_pair = (
                    ranks[previous],
                    ranks[previous + width] if previous + width < n else -1,
                )
                current_pair = (
                    ranks[current],
                    ranks[current + width] if current + width < n else -1,
                )
                next_ranks[current] = next_ranks[previous] + (current_pair != previous_pair)
            ranks = next_ranks
            if ranks[sa[-1]] == n - 1:
                break
            width *= 2
        return sa

    @staticmethod
    def _build_lcp(text: str, sa: Sequence[int], rank: Sequence[int]) -> list[int]:
        n = len(text)
        lcp = [0] * n
        matched = 0
        for start in range(n):
            order = rank[start]
            if order == 0:
                continue
            previous = sa[order - 1]
            while start + matched < n and previous + matched < n and text[start + matched] == text[previous + matched]:
                matched += 1
            lcp[order] = matched
            if matched:
                matched -= 1
        return lcp

    def find_all(self, pattern: str) -> list[int]:
        if pattern == "":
            raise ValueError("empty pattern is not supported")

        def compare_prefix(start: int) -> int:
            suffix_part = self.text[start:start + len(pattern)]
            if suffix_part < pattern:
                return -1
            if suffix_part > pattern:
                return 1
            if len(suffix_part) < len(pattern):
                return -1
            return 0

        low, high = 0, len(self.sa)
        while low < high:
            middle = (low + high) // 2
            if compare_prefix(self.sa[middle]) < 0:
                low = middle + 1
            else:
                high = middle
        first = low

        low, high = first, len(self.sa)
        while low < high:
            middle = (low + high) // 2
            if compare_prefix(self.sa[middle]) <= 0:
                low = middle + 1
            else:
                high = middle
        return self.sa[first:low]


def demo() -> None:
    index = SuffixArray("banana")
    assert index.sa == [5, 3, 1, 0, 4, 2]
    assert index.lcp == [0, 1, 3, 0, 0, 2]
    assert sorted(index.find_all("ana")) == [1, 3]
    assert index.find_all("xyz") == []


if __name__ == "__main__":
    demo()
```

Python's comparison and slicing make the query implementation clear but allocate temporary substrings.
A performance implementation compares pattern symbols directly against the text at a suffix start.
LCP-aware binary search can avoid repeating known-equal prefixes.
Rank doubling with a comparison sort costs $O(n\log^2 n)$ in this code.
Each of $O(\log n)$ rounds sorts $n$ indices in $O(n\log n)$ time.
Using counting or radix sort on integer rank pairs reduces construction to $O(n\log n)$.
SA-IS and related algorithms can achieve linear time with greater complexity.
Choose a mature library for large production indexes.
Keep the original text immutable for the index lifetime.
If the text is normalized, return offsets in normalized units or maintain an explicit source map.
For byte indexes, use unsigned byte order consistently.
For Unicode code-point indexes, persisted representation must preserve the same ordering and encoding version.
Validate serialized suffix indices as untrusted data.
Every entry must be in range and appear exactly once.
Ranks and LCP values must satisfy their bounds.
Tie the index to a cryptographic digest or version of the source text.
Memory-map large arrays when platform and lifetime requirements permit it.
Use fixed-width integer types large enough for text length.
Checked conversions prevent truncation beyond 32-bit limits.
Property-test suffix order against direct sorted suffixes on small random inputs.
Compare pattern results against direct scanning.
Test empty, one-symbol, all-equal, periodic, and full-alphabet texts.
Test patterns shorter than, equal to, and longer than the text.
Do not accidentally include a conceptual sentinel in reported source offsets.

## 5. Asymptotic Time & Space Complexity

Explicitly materializing all suffix strings uses $\Theta(n^2)$ symbols.
Sorting those copies can cost $O(n^2\log n)$ character work under naïve comparison.
An index-only suffix array uses $\Theta(n)$ integers.
The shown rank-doubling construction with comparison sorting costs $O(n\log^2 n)$ time.
It uses $O(n)$ auxiliary arrays per round, with arrays reused.
Radix-sorted doubling costs $O(n\log n)$ time and $O(n)$ auxiliary space.
Linear-time suffix-array algorithms exist for integer alphabets but have higher implementation complexity.
Kasai's LCP algorithm costs $O(n)$ time.
Its while-loop comparisons are amortized because the carried match length falls by at most one between adjacent text starts.
It uses $O(n)$ output plus $O(1)$ incremental state beyond rank and suffix arrays.
Straight binary search performs $O(\log n)$ suffix comparisons.
Each comparison can inspect up to $m$ pattern symbols.
Pattern search therefore costs $O(m\log n)$ in a straightforward implementation.
Reporting $z$ occurrences adds $O(z)$ output time.
LCP-enhanced search can approach $O(m+\log n+z)$ under suitable auxiliary information.
Sorting occurrence positions into text order adds $O(z\log z)$ unless the caller accepts suffix order.
Longest repeated substring is found by scanning LCP in $O(n)$ time after construction.
Distinct-substring count is also $O(n)$ after LCP.
An RMQ sparse table over LCP needs $O(n\log n)$ preprocessing space and answers arbitrary suffix LCP in $O(1)$.
A linear-space RMQ structure or segment tree offers different build-query trade-offs.
The base index retains text plus suffix array, rank array if kept, and LCP array.
That is $O(n)$ words and $O(n)$ text symbols.
Concrete memory can be several times text size because each integer may use four or eight bytes.
Compressed suffix arrays and FM-indexes reduce footprint while supporting richer compressed search trade-offs.
Dynamic insertion is not efficient because suffix starts and order change globally.
Rebuilding costs at least proportional to indexed text size.

## 6. Systems Connections

The Burrows-Wheeler transform is obtained from sorted cyclic or suffix-related order with a sentinel convention.
It groups similar preceding contexts and improves compressibility.
FM-indexes combine BWT with rank data to search compressed text.
Bioinformatics uses suffix arrays and FM-index descendants for large genome references.
The small alphabet and enormous corpus make compressed indexing valuable.
Read aligners extend exact seeds into approximate matches.
Suffix arrays provide exact-order foundations but are not the entire alignment pipeline.
Full-text systems may use suffix arrays for immutable corpora, source search, or specialized analytics.
General web search relies more often on tokenized inverted indexes because query semantics differ.
Plagiarism and repeat detection scan LCP for long shared regions.
Generalized suffix arrays concatenate multiple documents with distinct sentinels or ownership metadata.
Matches crossing document boundaries must be excluded.
Data deduplication can locate repeated substrings, although rolling chunking is often more scalable for storage systems.
Suffix order supports lexicographic enumeration of substrings and rotations.
Minimal rotations can also be found with specialized linear algorithms using less memory.
Databases can persist suffix indexes beside immutable text columns for substring workloads.
Update cost and storage amplification must be justified by query frequency.
Memory mapping improves startup time but requires safe file validation.
Corrupt indices can cause out-of-range reads in native code.
Check header lengths, integer widths, permutation validity, and source identity.
Distributed construction partitions text and merge work but must handle suffix comparisons spanning partition boundaries.
External-memory suffix sorting minimizes random I/O for corpora beyond RAM.
GPU construction exploits parallel ranking and sorting for selected algorithms.
Transfer and memory capacity remain constraints.
Suffix arrays expose the importance of representation-aware indexing.
One integer permutation turns an immutable text into a searchable ordered set without copying quadratic suffix content.

## 7. Practice Checklist

- Define the indexed symbol unit and lexicographic order.
- Decide whether the empty suffix is included.
- Keep the text immutable for the index lifetime.
- Store suffix starts rather than copied suffix strings.
- Verify the suffix array is a permutation of `0..n-1`.
- Verify adjacent suffixes are strictly sorted.
- Use a sentinel rank below every real rank during doubling.
- Assign equal new ranks exactly to equal rank pairs.
- Stop doubling when ranks are unique or represented width covers text.
- Use radix sorting for scalable doubling construction.
- Prefer a tested library for linear-time construction.
- Build inverse ranks consistently.
- Keep one documented LCP indexing convention.
- Test Kasai output against direct adjacent LCP.
- Handle the first suffix-array position without a predecessor.
- Reject or define empty-pattern searches.
- Implement explicit lower and upper prefix boundaries.
- Avoid invented maximum alphabet sentinels in generic APIs.
- Return occurrence order explicitly: suffix order or text order.
- Include output count in query complexity.
- Test all-equal and periodic texts.
- Test suffixes where one is a prefix of another.
- Test pattern longer than remaining suffix.
- Test matches at start and end.
- Compare random searches against direct scanning.
- Use checked integer widths for large text.
- Bind persisted indexes to exact source versions.
- Validate mapped files before trusting offsets.
- Preserve normalization and offset semantics.
- Do not mix byte and code-point indices.
- Scan LCP for repeated-substring analysis.
- Use RMQ over LCP for arbitrary suffix-pair LCP queries.
- Exclude concatenation-boundary matches in generalized indexes.
- Estimate integer-array memory before indexing huge corpora.
- Benchmark construction separately from repeated queries.
- Compare suffix arrays with FM-indexes under memory pressure.
- Rebuild explicitly after source mutation.
- Keep serialization deterministic and versioned.
- Protect native queries with bounds checks.
- Explain why sorted matching suffixes form one interval.

## 8. Frequently Asked Questions

### Does a suffix array store every suffix string?

No.
It stores the starting index of each suffix in lexicographic order and refers back to one immutable text.

### Why do matching suffixes form a contiguous interval?

All strings sharing a fixed prefix are contiguous in lexicographic order.
Anything not sharing that prefix differs before or within it and sorts outside the group.

### What does the LCP array store?

It stores the longest-common-prefix length of adjacent suffixes in suffix-array order under a chosen indexing convention.

### Why does prefix doubling work?

Ranks summarize ordered prefixes of length $2^h$.
Two adjacent rank summaries describe a prefix twice as long, so pair sorting refines the order correctly.

### Is construction always linear?

No.
Linear algorithms exist, but straightforward comparison-sorted doubling is $O(n\log^2 n)$ and radix-sorted doubling is $O(n\log n)$.

### How fast is pattern search?

Straight binary search costs $O(m\log n+z)$ for pattern length $m$ and $z$ reported matches.
LCP-aware enhancements can reduce repeated symbol comparisons.

### Why is a suffix array smaller than a suffix tree?

It is primarily a flat integer permutation rather than a pointer-rich tree of nodes and edges.
Both still retain or reference the original text.

### Can it handle text updates?

Not cheaply in its basic form.
Changing text can alter many suffixes and their global order, so immutable or batch-rebuilt workloads fit best.

### What is the longest repeated substring?

Its length is the maximum LCP between adjacent sorted suffixes.
The corresponding text region gives one repeated substring.

### How are distinct substrings counted?

Start with $n(n+1)/2$ suffix-prefix substrings and subtract adjacent LCP contributions that duplicate earlier prefixes.

### Is locale-aware collation appropriate?

Usually not for algorithmic suffix indexes.
Use a stable exact alphabet order and perform user-facing linguistic search through a purpose-built text system.

### When should a suffix array be selected?

Select it for immutable text with many exact substring, repeat, or suffix-order queries when linear-word storage and cache-friendly representation matter.
