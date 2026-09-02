# Viterbi Algorithm: Most-Likely Paths Through Hidden-State Models

![A trellis showing Viterbi state transitions](/images/dsa/viterbi-algorithm-dark.jpg)

## 1. Historical Context & Motivation

Many sequences reveal observations while hiding the process that produced them.
Speech exposes acoustic frames but hides phonetic states.
A communication receiver observes noisy symbols but not the transmitted path.
Part-of-speech tagging observes words but treats grammatical states as latent.
A hidden Markov model gives these relationships probabilities.
The decoding question asks for the single most probable hidden-state sequence.
Enumerating every path is exponential in sequence length.
Andrew Viterbi introduced the dynamic program in convolutional-code decoding.
The same recurrence now appears across signal processing and sequence modeling.
The algorithm works because future scores depend on the past only through the current state.
That property is the Markov assumption.
It also requires path probability to factor into local terms.
Viterbi keeps the best prefix ending at each state.
Inferior prefixes ending at the same state can never recover later.
They have identical future choices and smaller accumulated probability.
This dominance rule removes exponentially many candidates.
The retained values form a time-by-state trellis.
Backpointers remember which predecessor achieved each best score.
A final backward pass reconstructs the winning path.
Ordinary probability multiplication underflows on long sequences.
Production implementations therefore use logarithms.
Multiplication becomes addition in log space.
Impossible events receive score $-\infty$.
Tie behavior must be deterministic when reproducibility matters.
Viterbi is a maximum-path algorithm, not a marginal-probability algorithm.
The forward algorithm sums over paths instead.
Posterior decoding chooses likely states individually and may produce an unlikely joint path.
Beam search approximates decoding by discarding low-scoring states globally.
Exact Viterbi retains one winner for every reachable state.
Its usefulness depends on whether the model assumptions fit the data.
No decoding algorithm repairs a badly calibrated model.

## 2. Core Mathematical Invariants

Let hidden states be $S=\{1,\ldots,m\}$.
Let observations be $o_1,\ldots,o_T$.
Let initial probability be $\pi_s=P(q_1=s)$.
Let transition probability be $a_{rs}=P(q_t=s\mid q_{t-1}=r)$.
Let emission probability be $b_s(o)=P(o_t=o\mid q_t=s)$.
For a path $q_1,\ldots,q_T$, the joint score is

$$
\pi_{q_1}b_{q_1}(o_1)\prod_{t=2}^{T}a_{q_{t-1}q_t}b_{q_t}(o_t).
$$

Define $\delta_t(s)$ as the best path score ending in state $s$ at time $t$.
The initialization is $\delta_1(s)=\pi_s b_s(o_1)$.
The recurrence is

$$
\delta_t(s)=b_s(o_t)\max_{r\in S}\left(\delta_{t-1}(r)a_{rs}\right).
$$

The backpointer is

$$
\psi_t(s)=\arg\max_{r\in S}\left(\delta_{t-1}(r)a_{rs}\right).
$$

The invariant says $\delta_t(s)$ is optimal among all length-$t$ paths ending at $s$.
The base case considers every possible first state.
The inductive step partitions paths by their predecessor state.
Each partition only needs its best prefix.
Multiplying all members by the same local factors preserves their ordering.
Therefore discarded prefixes cannot become optimal later.
At time $T$, the best final state maximizes $\delta_T(s)$.
Following $\psi$ backward recovers the corresponding predecessors.
In log space, define $D_t(s)=\log\delta_t(s)$.
The recurrence becomes

$$
D_t(s)=\log b_s(o_t)+\max_r\left(D_{t-1}(r)+\log a_{rs}\right).
$$

Zero probabilities map to $-\infty$.
Adding $-\infty$ keeps impossible paths impossible.
Transition rows should sum to one for a probabilistic HMM.
Emission distributions should also be normalized over their support.
Decoding can still rank unnormalized nonnegative potentials.
In that case the model is a weighted finite-state system rather than a normalized HMM.
Sparse transitions restrict the predecessor set.
The recurrence then considers only incoming edges.
Tie-breaking is not specified by probability theory.
An implementation must choose first state, lowest identifier, or another stable rule.
Backpointers require $O(Tm)$ storage in the direct implementation.
Scores need only the previous and current columns.
The decoded path must be legal under every selected transition.

## 3. Step-by-Step Execution Trace

Consider weather states `Rainy` and `Sunny`.
Observations are `walk`, `shop`, `clean`.
Initial probabilities are `Rainy: 0.6` and `Sunny: 0.4`.
From `Rainy`, transitions are `Rainy: 0.7`, `Sunny: 0.3`.
From `Sunny`, transitions are `Rainy: 0.4`, `Sunny: 0.6`.
Rainy emissions are `walk: 0.1`, `shop: 0.4`, `clean: 0.5`.
Sunny emissions are `walk: 0.6`, `shop: 0.3`, `clean: 0.1`.
At time one, observation is `walk`.
The Rainy score is $0.6\cdot0.1=0.06$.
The Sunny score is $0.4\cdot0.6=0.24$.
No backpointer is needed for the first column.
At time two, observation is `shop`.
For ending Rainy, predecessor Rainy gives $0.06\cdot0.7=0.042$.
Predecessor Sunny gives $0.24\cdot0.4=0.096$.
Sunny is the better predecessor.
Apply Rainy emission `0.4` to obtain $0.0384$.
Set Rainy's backpointer to Sunny.
For ending Sunny, predecessor Rainy gives $0.06\cdot0.3=0.018$.
Predecessor Sunny gives $0.24\cdot0.6=0.144$.
Sunny again wins.
Apply Sunny emission `0.3` to obtain $0.0432$.
Set Sunny's backpointer to Sunny.
At time three, observation is `clean`.
For ending Rainy, predecessor Rainy gives $0.0384\cdot0.7=0.02688$.
Predecessor Sunny gives $0.0432\cdot0.4=0.01728$.
Rainy wins before emission.
Multiply by `0.5` to obtain $0.01344$.
Rainy's backpointer is Rainy.
For ending Sunny, predecessor Rainy gives $0.0384\cdot0.3=0.01152$.
Predecessor Sunny gives $0.0432\cdot0.6=0.02592$.
Sunny wins before emission.
Multiply by `0.1` to obtain $0.002592$.
Sunny's backpointer is Sunny.
The best final state is Rainy.
Backtrack from Rainy at time three.
Its predecessor is Rainy at time two.
Rainy at time two points to Sunny at time one.
Reverse the collected states.
The decoded path is `Sunny, Rainy, Rainy`.
Its probability is $0.01344$.
The locally most likely first state happens to be Sunny.
The method did not greedily commit to it.
It retained the best prefix for both ending states.
That preserved the alternative needed by later observations.

## 4. Production-Ready Implementations

This implementation works in log space and validates model shape.
It accepts any hashable state and observation labels.
Missing probabilities are treated as impossible events.

```python
from __future__ import annotations

from math import inf, log
from typing import Hashable, Mapping, Sequence, TypeVar

State = TypeVar("State", bound=Hashable)
Obs = TypeVar("Obs", bound=Hashable)
NEG_INF = -inf


def log_probability(value: float) -> float:
    if value < 0.0:
        raise ValueError("probabilities cannot be negative")
    return NEG_INF if value == 0.0 else log(value)


def viterbi(
    observations: Sequence[Obs],
    states: Sequence[State],
    initial: Mapping[State, float],
    transition: Mapping[State, Mapping[State, float]],
    emission: Mapping[State, Mapping[Obs, float]],
) -> tuple[list[State], float]:
    if not observations:
        return [], 0.0
    if not states:
        raise ValueError("at least one state is required")
    ordered_states = list(states)
    if len(set(ordered_states)) != len(ordered_states):
        raise ValueError("states must be unique")

    previous: dict[State, float] = {}
    back: list[dict[State, State]] = []
    first = observations[0]
    for state in ordered_states:
        previous[state] = (
            log_probability(initial.get(state, 0.0))
            + log_probability(emission.get(state, {}).get(first, 0.0))
        )

    for observation in observations[1:]:
        current: dict[State, float] = {}
        column: dict[State, State] = {}
        for state in ordered_states:
            emit = log_probability(emission.get(state, {}).get(observation, 0.0))
            best_parent = ordered_states[0]
            best_score = NEG_INF
            for parent in ordered_states:
                candidate = previous[parent] + log_probability(
                    transition.get(parent, {}).get(state, 0.0)
                )
                if candidate > best_score:
                    best_score = candidate
                    best_parent = parent
            current[state] = best_score + emit
            column[state] = best_parent
        previous = current
        back.append(column)

    final_state = max(ordered_states, key=lambda state: previous[state])
    final_score = previous[final_state]
    if final_score == NEG_INF:
        raise ValueError("no legal state path emits the observation sequence")
    path = [final_state]
    for column in reversed(back):
        path.append(column[path[-1]])
    path.reverse()
    return path, final_score


states = ["Rainy", "Sunny"]
initial = {"Rainy": 0.6, "Sunny": 0.4}
transition = {
    "Rainy": {"Rainy": 0.7, "Sunny": 0.3},
    "Sunny": {"Rainy": 0.4, "Sunny": 0.6},
}
emission = {
    "Rainy": {"walk": 0.1, "shop": 0.4, "clean": 0.5},
    "Sunny": {"walk": 0.6, "shop": 0.3, "clean": 0.1},
}
path, score = viterbi(
    ["walk", "shop", "clean"], states, initial, transition, emission
)
assert path == ["Sunny", "Rainy", "Rainy"]
assert abs(score - log(0.01344)) < 1e-12
```

Real decoders often store transition matrices in dense arrays.
That removes dictionary overhead in numerical workloads.
Sparse models should store incoming transitions for each state.
Vectorized implementations compute all predecessor candidates in blocks.
Long sequences can keep backpointers in compact integer arrays.
Streaming output requires bounded-delay or checkpoint techniques.
Model validation should check normalization within a tolerance.
Unknown observations need an explicit emission policy.
Silently assigning arbitrary probability hides data-quality failures.
Ties should follow state order or an explicit comparator.
NaN probabilities must be rejected because comparisons become unreliable.
Tests should compare short cases with exhaustive path enumeration.

## 5. Asymptotic Time & Space Complexity

Let $T$ be the number of observations.
Let $m$ be the number of states.
The dense recurrence examines every predecessor for every destination state.
Each of $T-1$ later columns therefore costs $m^2$ comparisons.
Initialization and final selection each cost $O(m)$.
Dense running time is $O(Tm^2)$.
Let $e$ be the number of permitted transitions.
A sparse implementation costs $O(Te)$.
When each state has bounded in-degree, that approaches $O(Tm)$.
Two score columns require $O(m)$ working memory.
Full backpointers require $O(Tm)$ memory.
The final path itself requires $O(T)$ memory.
Storing every score column is unnecessary for ordinary decoding.
It may be useful for diagnostics or confidence analysis.
Logarithms can be precomputed for static model probabilities.
Precomputation costs $O(e)$ transitions plus emission-table size.
It removes repeated logarithm calls from the hot loop.
Beam width $b$ can reduce practical work but loses exactness.
Its complexity depends on candidate generation and pruning.
Higher-order Markov models can be converted to compound states.
That state expansion can multiply $m$ dramatically.
Factorial models have even larger joint state spaces.
The dominant limit is often model size, not observation count.
Parallelism is available across destination states within one time column.
Time columns themselves remain sequential because each depends on the previous one.

## 6. Systems Connections

Convolutional-code decoders interpret trellis edges as encoded symbol choices.
Edge metrics measure agreement with the received signal.
Speech recognizers combine acoustic likelihoods with pronunciation and language constraints.
Weighted finite-state transducers generalize the same best-path computation.
Sequence taggers use Viterbi when neighboring labels have transition scores.
Conditional random fields replace normalized HMM factors with learned potentials.
The max-sum recurrence remains similar.
Bioinformatics uses decoding for gene states and sequence annotation.
Robot localization can decode the most likely discrete mode history.
Monitoring systems can infer latent operational states from noisy telemetry.
These uses should distinguish diagnosis from certainty.
A most-likely path can still have very low posterior probability.
Production decoders record model version with every result.
Reproducibility also requires stable state ordering and floating-point behavior.
Batching sequences of similar length improves accelerator utilization.
Padding requires masks so fake observations do not affect scores.
Online services must cap sequence length to bound memory and latency.
Malformed probability tables should fail before accepting traffic.
Observability should include unreachable-state counts and impossible-sequence rates.
A sudden increase often indicates vocabulary or schema drift.
Backpointer compression reduces memory bandwidth on long recordings.
Checkpointed reconstruction trades recomputation for smaller memory.
Security-sensitive classifiers should not expose raw model likelihoods blindly.
They can reveal details about training distributions.
Viterbi supplies a path conditional on the model, not an explanation of reality.

## 7. Practice Checklist

- Define states and observations separately.
- State the initial distribution.
- State which transitions are legal.
- Define emission probabilities for every supported observation.
- Decide how unknown observations are handled.
- Validate that probabilities are finite and nonnegative.
- Check normalization when the model claims to be probabilistic.
- Use log scores for nontrivial sequence lengths.
- Map zero probability to negative infinity.
- Keep one best prefix per ending state.
- Store the winning predecessor for every later column.
- Choose a deterministic tie policy.
- Reject a sequence when every final score is impossible.
- Backtrack from the best final state.
- Reverse the recovered predecessor chain.
- Test a one-observation sequence.
- Test an empty sequence contract.
- Test unreachable states.
- Test zero-probability emissions.
- Test tied paths.
- Compare tiny models with exhaustive enumeration.
- Use sparse incoming edges for sparse transitions.
- Precompute logarithms for a fixed model.
- Avoid retaining all score columns unless needed.
- Document whether scores are probabilities or unnormalized potentials.
- Distinguish Viterbi decoding from forward probability.
- Distinguish joint-path decoding from per-position posterior decoding.
- Record model versions in production outputs.
- Monitor impossible-sequence frequency.
- Bound input length in services.

## 8. Frequently Asked Questions

### Does Viterbi return the probability of the observations?

No.
It returns the score of the best joint state path and observations.
The forward algorithm sums all paths to compute observation likelihood.

### Why can one prefix per state be discarded safely?

Prefixes ending in the same state have identical future options.
The smaller prefix score can never overtake the larger one after equal future factors.

### Why use logarithms?

Products of many probabilities underflow toward zero.
Log space converts products to stable sums while preserving order.

### Is Viterbi greedy?

No.
It keeps a best candidate for every current state rather than committing to one global state early.

### What happens when all paths are impossible?

Every final log score is negative infinity.
A production decoder should return an explicit error or fallback policy.

### Can transitions vary with time?

Yes.
Use the transition matrix for the current time step in the same recurrence.

### Can emissions depend on a transition instead of a state?

Yes.
Move that local score onto the corresponding trellis edge.

### How are ties handled?

The mathematical optimum may not be unique.
Stable state ordering provides deterministic output.

### Is beam search equivalent?

Only when its pruning happens not to remove the optimal path.
Finite beams are approximations.

### Can memory be less than $O(Tm)$?

Yes, with checkpointing, divide-and-conquer reconstruction, or bounded-delay output.
The simple exact implementation stores every backpointer.

### Does a high Viterbi score imply confidence?

Not by itself.
Confidence requires comparison with alternatives or posterior calculations.

### When should I not use Viterbi?

Do not use it when you need marginal state probabilities or when the model lacks local factorization.
Choose inference that matches the actual question and dependency structure.
