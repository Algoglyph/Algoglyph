# Manacher's Algorithm: Every Palindromic Radius in Linear Time

![Manacher palindrome radii](/images/dsa/manacher-substrings-dark.png#dark)

Manacher's algorithm computes the longest palindrome centered at every position in linear time.
It avoids rechecking mirrored characters inside the rightmost palindrome already known.
The resulting radius arrays answer longest-palindromic-substring and palindrome-query questions without quadratic center expansion.

## 1. Historical Context & Motivation

### Center expansion repeats work

A palindrome reads identically forward and backward.
The direct substring algorithm expands around each possible center while the two sides match.
There are $n$ odd centers and $n-1$ even gaps.

Center expansion uses $O(1)$ extra space and is often practical.
Its worst case is $O(n^2)$ on strings such as `AAAAAAAA` because neighboring centers rediscover nearly the same matching region.

### Manacher's observation

Glenn Manacher published a linear-time palindrome algorithm in 1975.
When a center lies inside a previously discovered palindrome, its mirror across that palindrome's center already supplies a lower bound for the new radius.

The known information can be copied until it reaches the current right boundary.
Only comparisons extending beyond that boundary are genuinely new.
Since the boundary moves right at most $n$ times, total extension work is linear.

### Two common formulations

One formulation transforms the string by inserting separators so odd and even palindromes share one representation.
Another computes two arrays directly:

- `odd[i]`: radius of the longest odd palindrome centered at character $i$;
- `even[i]`: radius of the longest even palindrome centered between $i-1$ and $i$.

The direct two-array form avoids choosing separator and sentinel characters that might collide with input.
This article uses it.

### Result semantics

For odd radii, `odd[i] = k` means substring

$$
s[i-k+1:i+k]
$$

has length $2k-1$.

For even radii, `even[i] = k` means substring

$$
s[i-k:i+k]
$$

has length $2k$ and is centered before index $i$.

The minimum odd radius is one because a character is a palindrome.
The minimum even radius is zero.

### Appropriate uses

Manacher is valuable when:

- worst-case linear preprocessing matters;
- all centers or many palindrome queries are needed;
- the longest palindromic substring is required on a large string;
- repeated center expansion is demonstrably expensive.

For one short string, center expansion may be easier to maintain.
For arbitrary substring equality or dynamic edits, hashes, suffix structures, or specialized dynamic methods may fit better.

## 2. Core Mathematical Invariants

### Rightmost odd palindrome

During the odd-radius pass, maintain interval $[l,r]$ for the palindrome with the greatest right endpoint processed so far.
Both endpoints are inclusive.
If no interval exists initially, use $l=0,r=-1$.

For each center $i$:

- if $i>r$, begin with radius one;
- otherwise mirror $i$ across the interval center to

$$
j=l+r-i.
$$

Use

$$
k=\min(odd[j],r-i+1).
$$

### Why mirrored radius is safe

The substring $s[l:r+1]$ is a palindrome.
Positions $i$ and $j$ are symmetric within it.
Any palindrome around $j$ lying entirely inside $[l,r]$ has an identical mirrored palindrome around $i$.

If `odd[j]` remains inside the boundary, its full radius is known.
If it crosses the left boundary, only the portion through $r$ is guaranteed at $i$.
That is why the initialization is capped by $r-i+1$.

### Extension invariant

After initialization, all character pairs within radius $k$ are already known equal.
Compare only the next pair:

$$
s[i-k]\stackrel{?}{=}s[i+k].
$$

While indices are valid and characters match, increment $k$.
On termination, $k$ is the exact odd radius.

### Boundary update

The discovered odd palindrome ends at $i+k-1$.
If this exceeds $r$, set

$$
l=i-k+1,
$$

$$
r=i+k-1.
$$

The maintained interval again has the greatest known right endpoint.

### Even-center symmetry

For `even[i]`, center lies between $i-1$ and $i$.
The palindrome spans `[i-k, i+k-1]`.

Inside maintained even palindrome `[l,r]`, mirror initialization uses

$$
j=l+r-i+1
$$

and cap

$$
r-i+1.
$$

Extension compares

$$
s[i-k-1]\stackrel{?}{=}s[i+k].
$$

The offset difference from the odd formula is a common source of bugs.

### Linear-time invariant

Mirror initialization costs $O(1)$ per center.
Successful comparisons that extend beyond the maintained boundary increase $r$.
The boundary starts before the string and never decreases.
It increases at most $n$ times per pass.

Failed extension contributes at most one comparison per center.
Therefore both passes together take $O(n)$ time.

### Palindrome-query condition

A substring `[a,b]` of odd length has center $c=(a+b)/2$ and half-length requirement $(b-a)/2+1$.
It is palindromic exactly when

$$
odd[c]\ge\frac{b-a}{2}+1.
$$

For even length, center index is $c=(a+b+1)/2$ in the `even` convention.
It is palindromic exactly when

$$
even[c]\ge\frac{b-a+1}{2}.
$$

After preprocessing, each query is $O(1)$.

## 3. Step-by-Step Execution Trace

### Input

Use string

```text
ABACABA
```

Indices are zero through six.
The entire string is an odd palindrome centered at index three.

### Center zero

No rightmost interval exists.
Begin with $k=1$.
The next comparison would use index negative one, so stop.

Set `odd[0] = 1`.
Update interval to `[0,0]`.

### Center one

Index one lies beyond $r=0$.
Begin with one.
Compare `s[0] = A` with `s[2] = A`.
They match, so increase radius to two.

The next pair is out of bounds on the left.
Set `odd[1] = 2` and interval `[0,2]`.
This represents palindrome `ABA`.

### Center two

Index two lies inside `[0,2]`.
Its mirror is

$$
j=0+2-2=0.
$$

Initialize

$$
k=\min(odd[0],2-2+1)=1.
$$

Compare `s[1] = B` with `s[3] = C`.
They differ.
Set `odd[2] = 1`; the right boundary remains two.

### Center three

Index three lies beyond the right boundary.
Begin with one.

Compare positions two and four: `A == A`.
Radius becomes two.

Compare positions one and five: `B == B`.
Radius becomes three.

Compare positions zero and six: `A == A`.
Radius becomes four.

The next pair is out of bounds.
Set `odd[3] = 4` and interval `[0,6]`.

### Center four

Center four is inside the full palindrome.
Its mirror is index two.
Initialize with

$$
\min(odd[2],6-4+1)=\min(1,3)=1.
$$

The next characters `C` and `B` differ.
Set `odd[4] = 1`.

### Centers five and six

Center five mirrors center one.
Its known radius two fits inside the boundary, so `odd[5] = 2` without successful boundary extension.

Center six mirrors center zero.
Set `odd[6] = 1`.

### Final odd radii

```text
index: 0 1 2 3 4 5 6
char:  A B A C A B A
odd:   1 2 1 4 1 2 1
```

The largest radius is four at center three.
Its palindrome length is

$$
2\cdot4-1=7.
$$

### Even radii

No adjacent symmetric pair exists in `ABACABA`.
Every even radius is zero:

```text
even: 0 0 0 0 0 0 0
```

For input `ABBA`, `even[2] = 2` because center two lies between the two `B` characters and spans `[0,3]`.

### Mirror savings

After center three reaches the end, centers four through six inherit safe radii from centers two through zero.
They do not rescan every character inside `ABACABA`.
Only comparisons capable of extending beyond the boundary are new.

## 4. Production-Ready Implementations

### Python radius computation

```python
def manacher_radii(text: str) -> tuple[list[int], list[int]]:
    n = len(text)
    odd = [0] * n
    left, right = 0, -1

    for center in range(n):
        radius = 1 if center > right else min(
            odd[left + right - center], right - center + 1
        )
        while (
            center - radius >= 0
            and center + radius < n
            and text[center - radius] == text[center + radius]
        ):
            radius += 1
        odd[center] = radius
        if center + radius - 1 > right:
            left = center - radius + 1
            right = center + radius - 1

    even = [0] * n
    left, right = 0, -1
    for center in range(n):
        radius = 0 if center > right else min(
            even[left + right - center + 1], right - center + 1
        )
        while (
            center - radius - 1 >= 0
            and center + radius < n
            and text[center - radius - 1] == text[center + radius]
        ):
            radius += 1
        even[center] = radius
        if center + radius - 1 > right:
            left = center - radius
            right = center + radius - 1

    return odd, even


assert manacher_radii("ABACABA") == ([1, 2, 1, 4, 1, 2, 1], [0] * 7)
assert manacher_radii("ABBA")[1] == [0, 0, 2, 0]
assert manacher_radii("") == ([], [])
```

### Longest palindrome extraction

```python
def longest_palindrome(text: str) -> str:
    if not text:
        return ""
    odd, even = manacher_radii(text)
    best_start = 0
    best_length = 1

    for center, radius in enumerate(odd):
        length = 2 * radius - 1
        start = center - radius + 1
        if length > best_length:
            best_start, best_length = start, length

    for center, radius in enumerate(even):
        length = 2 * radius
        start = center - radius
        if length > best_length:
            best_start, best_length = start, length

    return text[best_start:best_start + best_length]


assert longest_palindrome("forgeeksskeegfor") == "geeksskeeg"
assert longest_palindrome("ABACABA") == "ABACABA"
assert longest_palindrome("") == ""
```

This tie rule keeps the first longest palindrome encountered because only strictly larger lengths replace the result.

### Query helper

```python
def is_palindrome(odd: list[int], even: list[int], start: int, end: int) -> bool:
    if not 0 <= start <= end < len(odd):
        raise IndexError("substring outside text")
    length = end - start + 1
    if length % 2 == 1:
        center = (start + end) // 2
        return odd[center] >= length // 2 + 1
    center = (start + end + 1) // 2
    return even[center] >= length // 2
```

Keep the original text length aligned with the radius arrays.

### Unicode semantics

Python strings index code points, not user-perceived grapheme clusters.
Combining marks can make visually identical text differ as sequences.
Normalize or segment input according to application requirements before computing palindromes.

## 5. Asymptotic Time & Space Complexity

### Time

Each pass visits $n$ centers.
Mirror initialization is constant work.
Successful comparisons extending the right boundary occur at most $n$ times.
Failed extensions occur at most once per center.

Odd radii cost $O(n)$.
Even radii cost $O(n)$.
Total preprocessing is $O(n)$.

### Space

The two radius arrays use $O(n)$ space.
The algorithm otherwise keeps constant state.

If only the single longest palindrome is needed, standard implementations still retain radii needed by future mirrors.
The $O(n)$ array is part of the linear-time trade-off.

### Query complexity

After preprocessing, checking whether one fixed substring is a palindrome costs $O(1)$ using the appropriate radius.
Returning the substring itself costs proportional to output length if the language copies slices.

### Center expansion comparison

Center expansion uses $O(1)$ extra space and $O(n^2)$ worst-case time.
It can be preferable for short inputs or when simplicity matters more than the worst-case bound.

### Dynamic strings

Changing one character can alter radii across a large region.
Manacher preprocessing is static; rebuilding costs $O(n)$.
It does not provide an efficient general dynamic-palindrome data structure.

## 6. Systems Connections

### Text analytics

Palindromic spans can be extracted as structural features in sequence analysis.
The algorithm finds exact sequence symmetry, not semantic or approximate similarity.

### Bioinformatics caution

Biological reverse complements are not ordinary character palindromes.
DNA applications need a complement mapping and domain-specific constraints.
Manacher's equality rule must be adapted or replaced accordingly.

### Query engines

When many substring-palindrome queries target one immutable string, radius preprocessing provides $O(1)$ answers.
Hashes provide another approach with collision considerations and different update possibilities.

### Compression and runs

Palindrome structure relates to repetitions and runs, but a radius array is not itself a compression scheme.
Highly repetitive strings create large radii while output remains only $O(n)$ integers.

### Security

Quadratic center expansion can become a denial-of-service risk on long repeated input.
Manacher bounds exact processing linearly.
Input length and Unicode normalization still require resource limits.

### Streaming limitation

Future characters can extend palindromes centered far in the past.
The standard algorithm assumes random access to the complete string.
It is not a bounded-memory online palindrome detector for arbitrary streams.

## 7. Practice Checklist

### Definitions

- Define odd radius precisely.
- Define even center index precisely.
- Define substring endpoints.
- Define tie behavior.
- Define empty-string result.
- Define text unit: byte, code point, or grapheme.

### Odd pass

- Initialize `[left,right]` as empty.
- Start radius at one outside boundary.
- Compute mirror as `left + right - center`.
- Cap inherited radius at boundary.
- Expand only while both indices are valid.
- Update boundary only when extended.

### Even pass

- Start radius at zero outside boundary.
- Use mirror offset `+1`.
- Compare `center-radius-1` with `center+radius`.
- Store center before the right half.
- Update left as `center-radius`.
- Test two-character palindromes.

### Tests

- Empty string.
- One character.
- Two equal characters.
- Two unequal characters.
- All equal characters.
- No palindrome longer than one.
- Odd longest palindrome.
- Even longest palindrome.
- Multiple equal longest palindromes.
- Unicode-normalized input.

### Validation

- Compare every radius with brute-force expansion.
- Compare longest result with brute force.
- Verify radius boundaries.
- Verify represented substring reverses identically.
- Test random small strings.
- Test repeated strings for linear behavior.

## 8. Frequently Asked Questions

### What does a radius include?

Odd radius includes the center character.
Even radius counts characters on either side of the center gap.

### Why are there two arrays?

Character-centered and gap-centered palindromes have different index formulas.
Separate arrays avoid transformed-string sentinels.

### Can separators combine both cases?

Yes.
Insert a separator between characters and around the ends, then run one odd-style algorithm on the transformed sequence.

### Why cap the mirrored radius?

Symmetry is guaranteed only inside the current rightmost palindrome.
Beyond its boundary, characters have not yet been compared for the new center.

### Why is the algorithm linear?

Inherited work is constant per center, and successful comparisons beyond the boundary can advance that boundary only $n$ times.

### Does it return every palindromic substring?

The radii encode them compactly.
Explicitly enumerating all palindromic occurrences can require $\Theta(n^2)$ output.

### How do I get the longest length?

Take the maximum of `2*odd[i]-1` and `2*even[i]` across centers.

### How do I count palindromic substrings?

Sum all odd radii and all even radii.
Each radius counts one palindrome for every possible expansion depth at that center.

### Does Manacher handle approximate palindromes?

No.
It requires exact equality and does not permit mismatches or edit distance.

### Is it better than dynamic programming?

For all radii or the longest substring on static text, it improves $O(n^2)$ DP time and space.
DP can be easier to adapt to other interval properties.

### What is the most common bug?

Mixing inclusive and exclusive right boundaries or applying the odd mirror formula to even centers.

### Can I use it on arrays?

Yes.
Only equality and random access are required.

### What should I study next?

Study rolling-hash palindrome queries, palindromic trees, suffix structures, and dynamic string algorithms.
