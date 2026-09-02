# Randomized Algorithms: Probability Guarantees, Adversary Models & Reproducible Engineering

![Randomized algorithm branching outcomes](/images/dsa/randomized-algorithms-dark.jpg#dark)

## 1. Historical Context & Motivation

Randomized algorithms use random choices as part of computation.

The same input can produce different execution paths.

Randomness can simplify logic, avoid adversarial structure, or improve expected cost.

It can also estimate quantities too expensive to compute exactly.

Randomized quick sort chooses a pivot independently of input order.

Randomized hashing chooses a function that distributes unknown keys.

Reservoir sampling selects a uniform sample from a stream of unknown length.

Monte Carlo integration estimates an area through random points.

Primality testing uses random witnesses in some common formulations.

The analysis must specify what can be wrong and with what probability.

A Las Vegas algorithm always returns a correct answer.

Its running time is random.

Randomized quick sort is a Las Vegas algorithm when comparisons are exact.

A Monte Carlo algorithm has a bounded running time but may return an incorrect answer.

Repeated independent trials can reduce its error probability.

One-sided error permits mistakes in only one answer direction.

Two-sided error permits both false positives and false negatives within a bound.

Expected running time is not a worst-case deadline.

An algorithm can have small expectation and rare long executions.

High-probability bounds quantify tail behavior.

The probability space must identify which random variables are independent.

Pseudorandom generators produce deterministic bits from a seed.

They are sufficient for many simulations and algorithmic choices.

They are not automatically suitable for secrets or hostile prediction.

Cryptographic random generation has stronger unpredictability requirements.

Reproducibility conflicts with hidden global randomness.

Tests should inject or record seeds.

Production incidents should log enough randomness metadata to replay behavior safely.

The adversary model matters.

An oblivious adversary chooses input without seeing random choices.

An adaptive adversary reacts to observed behavior.

Guarantees proved for one model may fail in the other.

Randomization is not an excuse to omit correctness invariants.

It changes which performance or error statements are probabilistic.

## 2. Core Mathematical Invariants

### Probability space

A randomized algorithm maps input `x` and random bits `r` to output `A(x;r)`.

Analysis treats `r` as sampled from a specified distribution.

The input may be fixed while probability ranges over random choices.

This distinguishes randomized analysis from average-case input analysis.

### Las Vegas invariant

For every input and every random choice that terminates:

$$
A(x;r)=correct(x).
$$

The random variable is running time `T(x;r)`.

A typical guarantee is:

$$
\mathbb{E}_r[T(x;r)]\le f(|x|).
$$

Correctness is deterministic; performance is probabilistic.

### Monte Carlo invariant

Running time is bounded by a stated function.

For every input, output error probability is bounded:

$$
\Pr_r[A(x;r)\ne correct(x)]\le\varepsilon.
$$

The value `epsilon` must be explicit.

A “probably correct” claim without a bound is incomplete.

### Amplification

Suppose one independent trial fails with probability at most `p`.

Requiring all `k` trials to fail gives:

$$
p^k.
$$

Majority vote for two-sided error uses a binomial tail bound.

Independence is essential to the multiplication rule.

Reusing correlated random choices can invalidate amplification.

### Indicator variables

Let indicator $I_i$ equal one when event `i` occurs and zero otherwise.

Then:

$$
\mathbb{E}[I_i]=\Pr[I_i=1].
$$

Linearity of expectation gives:

$$
\mathbb{E}\left[\sum_i I_i\right]=\sum_i\mathbb{E}[I_i].
$$

Independence is not required for linearity of expectation.

This makes expected comparison analysis manageable.

### Reservoir-sampling invariant

After processing `t` stream items, the one-item reservoir contains each seen item with probability `1/t`.

At item `t+1`, replace the reservoir with probability `1/(t+1)`.

An old item survives with probability:

$$
\frac{1}{t}\left(1-\frac{1}{t+1}\right)=\frac{1}{t+1}.
$$

The new item is selected with the same probability.

Thus uniformity is preserved inductively.

### Randomized quick-sort invariant

The partition invariant is deterministic once a pivot is chosen.

Every pivot choice still produces a correctly sorted result.

Randomness affects only partition balance and running time.

Each pair of distinct ranked elements is compared only if one becomes the first pivot selected from their rank interval.

This yields expected $O(n\log n)$ comparisons.

### Unbiased sampling invariant

Selecting an integer in `[0,m)` requires a uniform primitive over that exact range.

Taking random bits modulo `m` can introduce modulo bias unless the source range divides evenly.

Rejection sampling discards the uneven tail.

Standard library range APIs generally handle this detail.

### Seed invariant

The same algorithm, input, implementation, and seed should reproduce the same pseudorandom sequence.

Cross-version or cross-language reproduction is not guaranteed unless the generator algorithm is fixed explicitly.

## 3. Step-by-Step Execution Trace

Use one-item reservoir sampling on stream `[A,B,C,D]`.

The objective is to retain each final item with probability `1/4`.

Process `A` as item one.

The reservoir is empty, so store `A` with probability `1`.

After one item, `A` has probability `1/1`.

Process `B` as item two.

Replace the reservoir with probability `1/2`.

If replacement occurs, reservoir becomes `B`.

If not, it remains `A`.

After two items, each has probability `1/2`.

Process `C` as item three.

Select `C` with probability `1/3`.

An existing item survives with probability `2/3`.

For `A`, its previous probability was `1/2`.

Its new probability is `(1/2)(2/3) = 1/3`.

The same calculation holds for `B`.

`C` enters with probability `1/3`.

Process `D` as item four.

Select `D` with probability `1/4`.

Every old item survives with probability `3/4`.

For `A`, final probability is `(1/3)(3/4) = 1/4`.

The same holds for `B` and `C`.

`D` enters with probability `1/4`.

All four final probabilities are equal.

The algorithm stored only one item and a count.

It never needed to know stream length in advance.

### Monte Carlo amplification trace

Suppose a one-sided test misses a witness with probability at most `1/2`.

Run it independently five times.

Return positive if any trial finds the witness.

An existing witness is missed only if all trials miss it.

The probability is at most:

$$
(1/2)^5=1/32.
$$

Ten independent trials reduce the bound to `1/1024`.

The runtime grows linearly with trial count.

### Random pivot trace

For sorted input `[1,2,3,4,5]`, always choosing the first pivot is maximally unbalanced.

A uniform random pivot chooses the middle rank with probability `1/5`.

It chooses one of the central three ranks with probability `3/5`.

Input order no longer deterministically forces the worst split.

Correctness remains unchanged for every chosen rank.

## 4. Production-Ready Implementations

The following reservoir sampler injects a random generator for reproducibility.

```python
from __future__ import annotations

import random
from collections.abc import Iterable
from typing import TypeVar

T = TypeVar("T")


def reservoir_one(items: Iterable[T], rng: random.Random) -> T:
    selected: T | None = None
    seen = 0

    for seen, item in enumerate(items, start=1):
        if rng.randrange(seen) == 0:
            selected = item

    if seen == 0:
        raise ValueError("cannot sample an empty stream")
    return selected  # type: ignore[return-value]


source = ["A", "B", "C", "D"]
assert reservoir_one(source, random.Random(7)) in source
```

`randrange(seen)` draws uniformly from valid integer positions.

Choosing zero implements replacement probability `1/seen`.

The function consumes the iterable once.

It works for generators whose final length is unknown.

The typing ignore arises because runtime logic proves selection after nonempty input.

A private sentinel can express that proof without allowing `None` ambiguity.

### Sampling `k` stream items

Fill a reservoir with the first `k` items.

At stream position `t > k`, draw `j` uniformly from `[0,t)`.

If `j < k`, replace reservoir slot `j`.

After `t` items, every seen item is included with probability `k/t`.

The reservoir uses $O(k)$ memory.

### Randomness API design

Accept a generator object instead of using hidden global state.

Tests can supply a deterministic seed.

Production can use a process-owned generator.

Security tokens must use the platform's cryptographic random API.

Do not reuse a simulation generator for credentials or nonces.

Log seeds only when they are not secrets.

Record algorithm version with the seed for reliable replay.

### Statistical testing

Functional tests verify the reservoir always contains a seen item.

Distribution tests run many seeds and compare frequencies.

Statistical tests can detect major bias but cannot prove perfect uniformity.

Use deterministic proofs for the sampling invariant.

Avoid flaky pass/fail thresholds with tiny sample counts.

## 5. Asymptotic Time & Space Complexity

One-item reservoir sampling processes each stream item once.

Its time is $O(n)$.

It uses $O(1)$ auxiliary storage.

Sampling `k` items takes $O(n)$ time and $O(k)$ space.

Randomized quick sort has expected $O(n\log n)$ time.

Its worst-case time remains $O(n^2)$.

With smaller-side recursion, active stack space is $O(\log n)$.

A Monte Carlo algorithm repeated `r` times multiplies base runtime by `r`.

If independent one-sided error is `p`, residual error is at most $p^r$.

Expected time alone does not bound every execution.

Markov's inequality gives a weak tail bound for nonnegative time:

$$
\Pr[T\ge a\mathbb{E}T]\le 1/a.
$$

Stronger concentration requires more structure or independence.

Chernoff bounds control sums of independent Bernoulli variables.

Hash-table expected $O(1)$ operations depend on hash-family and adversary assumptions.

Rehashing adds occasional linear work but can remain amortized.

Generating random bits also has a cost.

Cryptographic generators are usually slower than simple simulation PRNGs.

Seeding from the operating system can involve synchronization or system calls.

Create and reuse generators rather than reseeding every operation.

Parallel generators need independent streams or carefully split sequences.

Sharing one locked generator can become a contention point.

Memory usage includes stored generator state.

That state is normally constant-size per stream.

## 6. Systems Connections

Hash tables randomize seeds to resist crafted collision sets.

Load balancers use randomized choices to spread requests.

The power-of-two-choices strategy samples two servers and picks the less loaded.

It dramatically improves maximum-load behavior over one random choice under standard models.

Distributed consensus uses randomized timeouts to reduce repeated election collisions.

Exponential backoff randomizes retries after contention.

Without jitter, clients can synchronize into repeated traffic spikes.

Databases use sampling for query planning and approximate statistics.

Monitoring systems reservoir-sample events under bounded memory.

Bloom filters use multiple hash-derived positions and permit false positives.

Their false-positive probability is a Monte Carlo-style data-structure guarantee.

Skip lists use random heights for expected logarithmic search.

Treaps use random priorities to produce expected balanced trees.

Randomized work stealing chooses victims to distribute tasks.

Network protocols use randomized contention windows.

Differential privacy adds calibrated randomness for formal privacy guarantees.

That randomness requires a threat-appropriate generator and careful numeric implementation.

Cryptography relies on unpredictable keys, nonces, and salts.

Simulation reproducibility instead favors recorded deterministic seeds.

These goals require different generator policies.

Property-based testing generates varied inputs and records shrinking paths.

Random testing increases coverage but does not replace proof or targeted edge cases.

## 7. Practice Checklist

- Classify the algorithm as Las Vegas or Monte Carlo.
- State exactly which property is random.
- State the probability space.
- State the error probability numerically.
- Distinguish one-sided from two-sided error.
- Separate expected time from worst-case time.
- Provide tail bounds when deadlines matter.
- Verify independence before multiplying failure probabilities.
- Do not confuse randomized-input analysis with randomized algorithms.
- Inject random generators into testable functions.
- Record nonsecret seeds for reproducibility.
- Record algorithm and generator versions.
- Use cryptographic randomness for secrets.
- Do not use cryptographic generators by habit when simulation speed matters.
- Avoid reseeding per operation.
- Use unbiased integer-range APIs.
- Avoid naive modulo reduction of uneven random ranges.
- Define the adversary as oblivious or adaptive.
- Check whether outputs reveal future random choices.
- Use amplification only with valid independence.
- Include repeated-trial cost in complexity.
- Test deterministic invariants for every seed.
- Use statistical tests only as supplementary evidence.
- Test empty and singleton streams for reservoir sampling.
- Verify every sampled item came from the stream.
- Check empirical frequencies over many controlled seeds.
- Keep random choice separate from correctness logic.
- Bound retries in production systems.
- Add jitter to distributed backoff deliberately.
- Split parallel random streams safely.
- Avoid a single locked generator on hot parallel paths.
- Document reproducibility guarantees across versions.

## 8. Frequently Asked Questions

### What commonly invalidates a probability claim?

Choosing a favorable input distribution instead of analyzing every fixed input changes the question.

Treating correlated trials as independent makes amplification bounds too optimistic.

Reseeding from a low-resolution clock can repeat the same random sequence.

Sharing one seed across supposedly independent workers can correlate their behavior.

Modulo reduction from a nondivisible source range biases outcomes.

Discarding failed trials from metrics biases measured success probability.

Stopping an experiment only after a favorable result invalidates fixed-trial inference.

Logging secret generator state compromises future cryptographic outputs.

Using a predictable PRNG for session tokens turns randomness into guessable state.

Using a cryptographic generator does not repair an incorrect sampling algorithm.

A correct distribution proof must match the implemented range API.

Floating-point probability thresholds can create tiny boundary bias.

Integer draws are often easier to reason about exactly.

An adaptive adversary may infer pivots or hash seeds from timing.

Guarantees against an oblivious adversary do not automatically survive adaptation.

Expected linear time permits rare superlinear executions.

A real-time deadline needs a tail bound or deterministic fallback.

Restarting a Las Vegas algorithm changes the runtime distribution but not correctness.

Combining two-sided answers by “any positive” is not majority amplification.

One-sided and two-sided tests need different aggregation rules.

Statistical test failure can reveal bias, but passing does not prove uniformity.

Tiny sample counts make frequency checks noisy and flaky.

Reproducibility needs the input, seed, generator algorithm, and code version.

Randomized data structures also need deterministic structural validators.

Production metrics should separate random retries from ordinary workload retries.

Fallback paths should preserve the advertised error or correctness class.

Sampling without replacement differs from independent repeated sampling.

Reservoir sampling must count every observed item exactly once.

Filtered streams must define whether sampling occurs before or after filtering.

Weighted sampling requires a different invariant from uniform sampling.

Randomness is a resource with provenance, state, and lifecycle—not a magic function call.

### Does randomized mean incorrect?

No.

Las Vegas algorithms always return correct results and randomize their running time.

### What is a Monte Carlo algorithm?

It has a controlled runtime and a bounded probability of error.

### Can repetition eliminate error?

Finite repetition reduces error but does not usually make it mathematically zero.

The reduction assumes suitable independence.

### Is expected time a deadline guarantee?

No.

Expectation averages outcomes and can hide rare slow executions.

### Why inject a random generator?

It makes tests reproducible and prevents hidden global-state coupling.

### Is a fixed seed secure?

No.

Predictable seeds are useful for replay, not secret generation.

### What is reservoir sampling for?

It selects a uniform sample from a stream without knowing its final length.

### Does linearity of expectation require independence?

No.

It applies whenever the relevant expectations exist.

### Why add jitter to retries?

It prevents many clients from retrying at the same synchronized moments.

### What is the core engineering rule?

State the guarantee, probability, adversary, seed policy, and failure consequence explicitly.
