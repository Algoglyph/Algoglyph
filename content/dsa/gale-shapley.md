# Gale-Shapley Algorithm: Stable Matching Through Deferred Acceptance

![Deferred acceptance proposal flow](/images/dsa/gale-shapley-dark.jpg#dark)

## 1. Historical Context & Motivation

A matching can pair every participant and still be structurally unstable.

Suppose a student is assigned to school `Y` and a school holds student `B`.

If that student prefers school `X` and `X` prefers the student to its assigned candidate, the pair can bypass the announced assignment.

That pair is a **blocking pair**.

Stable matching asks for an assignment with no blocking pair.

The input contains two disjoint sides.

Call them proposers and receivers.

Every proposer ranks the receivers.

Every receiver ranks the proposers.

The classical balanced model has $n$ participants on each side and strict, complete preference lists.

The output is a bijection between the sides.

The difficult part is not finding a bijection.

There are $n!$ possible bijections.

The difficult part is guaranteeing stability without enumerating them.

Gale-Shapley solves that problem with **deferred acceptance**.

A receiver may hold one proposal without committing permanently.

Later, a preferred proposer can replace the current tentative match.

Rejected proposers continue down their own lists.

This local process produces a global stability guarantee.

The algorithm is asymmetric by design.

Whichever side proposes receives its best achievable partners among all stable matchings.

The receiving side receives its least-preferred partners among all stable matchings.

That asymmetry matters in market design.

Choosing the proposing side is a policy decision, not an implementation detail.

The basic algorithm does not encode fairness beyond the supplied rankings and stability condition.

It does not decide how preferences should be collected.

It does not handle capacities, ties, or unacceptable partners without modification.

It does give a precise foundation on which those variants can be built.

The central computational question is:

How can repeated local proposals eliminate every possible blocking pair in at most quadratic work?

The answer follows from two monotone movements.

Proposers move downward through their rankings.

Receivers move upward through theirs.

Neither movement ever reverses.

## 2. Core Mathematical Invariants

Let $P$ be the proposer set and $R$ be the receiver set.

Assume $|P|=|R|=n$.

For proposer $p$, let $\operatorname{pref}_P(p)$ list receivers from best to worst.

For receiver $r$, let $\operatorname{rank}_R(r,p)$ be the position of proposer $p$ in $r$'s preference list.

Smaller rank values mean stronger preference.

A matching $M$ maps each proposer to one receiver.

Its inverse maps each receiver to one proposer.

An unmatched pair $(p,r)$ blocks $M$ when both inequalities hold:

$$
r \succ_p M(p)
$$

and

$$
p \succ_r M^{-1}(r).
$$

A matching is stable exactly when no such pair exists.

### Every proposal is new

Each proposer stores an index into its preference list.

After proposing at index $i$, that index advances to $i+1$.

Therefore a proposer never proposes to the same receiver twice.

There are only $n^2$ proposer-receiver pairs.

The algorithm consequently makes at most $n^2$ proposals.

This is the termination measure.

The count of untried pairs decreases after every iteration.

### A receiver always holds its best proposal so far

When a receiver has no tentative match, it holds the new proposer.

When it already holds proposer $q$, it compares $q$ with the new proposer $p$.

It retains whichever has smaller rank.

After any number of proposals, its held proposer is therefore the best among all proposers who have approached it.

The receiver's tentative outcome can only improve.

It never returns to a less-preferred proposer.

### Rejection is final evidence

If receiver $r$ rejects proposer $p$, then $r$ currently holds someone it prefers to $p$.

Because receivers only trade upward, its final partner is at least as preferred as that current holder.

Thus $r$ will never prefer $p$ to its final partner.

This observation is the core of the stability proof.

### Free proposers continue from the correct frontier

A rejected proposer does not restart at the top.

Every receiver above its current frontier has already rejected it.

Retrying those receivers cannot change their conclusions.

The next untried receiver is the only productive proposal.

This frontier makes the state compact.

The algorithm needs an integer per proposer rather than a set of attempted edges.

### Tentative matches form a partial matching

Each receiver holds at most one proposer.

Each proposer is either free or held by exactly one receiver.

When a receiver trades up, its former holder becomes free before reentering the queue.

No proposer or receiver can appear in two tentative pairs.

At every iteration, the held edges form a valid partial matching.

### Stability follows by contradiction

Assume the final matching contains a blocking pair $(p,r)$.

Proposer $p$ prefers $r$ to its final partner.

Proposers visit receivers in preference order.

Therefore $p$ must have proposed to $r$ before proposing to its final partner.

Receiver $r$ either rejected $p$ immediately or held and later rejected $p$.

In both cases, rejection is evidence that $r$ obtained someone it preferred to $p$.

Receiver outcomes only improve afterward.

So $r$ cannot prefer $p$ to its final partner.

That contradicts the definition of a blocking pair.

Hence the final matching is stable.

### Proposer optimality

Call a receiver feasible for proposer $p$ if some stable matching pairs them.

In proposer-driven deferred acceptance, no proposer is rejected by its best feasible receiver.

The resulting partner is therefore the best partner that proposer can obtain in any stable matching.

Switching the roles reverses this advantage.

The stable matching need not be unique.

The proposer-optimal stable matching is uniquely determined by the preference profile, even if processing free proposers in a different order.

## 3. Step-by-Step Execution Trace

Use proposers `A`, `B`, and `C` and receivers `X`, `Y`, and `Z`.

Their preference lists are:

| Participant | Preference order |
|---|---|
| `A` | `X`, `Y`, `Z` |
| `B` | `Y`, `X`, `Z` |
| `C` | `X`, `Y`, `Z` |
| `X` | `B`, `A`, `C` |
| `Y` | `A`, `B`, `C` |
| `Z` | `A`, `B`, `C` |

Initially every proposer is free.

Every proposal frontier is at index `0`.

No receiver holds a proposal.

### Proposal 1: `A` approaches `X`

`X` is `A`'s first choice.

`X` is free.

`X` tentatively holds `A`.

The held set becomes `{X: A}`.

`A`'s frontier advances past `X`.

### Proposal 2: `B` approaches `Y`

`Y` is `B`'s first choice.

`Y` is free.

`Y` tentatively holds `B`.

The held set becomes `{X: A, Y: B}`.

`B`'s frontier advances past `Y`.

### Proposal 3: `C` approaches `X`

`X` is `C`'s first choice.

`X` currently holds `A`.

`X` ranks `A` ahead of `C`.

`X` rejects `C` and retains `A`.

The held set is unchanged.

`C` remains free.

Its frontier advances from `X` to `Y`.

### Proposal 4: `C` approaches `Y`

`Y` currently holds `B`.

`Y` ranks `B` ahead of `C`.

`Y` rejects `C` and retains `B`.

`C` remains free.

Its only untried receiver is `Z`.

### Proposal 5: `C` approaches `Z`

`Z` is free.

`Z` tentatively holds `C`.

The held set becomes `{X: A, Y: B, Z: C}`.

No proposer remains free.

The final matching is:

$$
M=\{(A,X),(B,Y),(C,Z)\}.
$$

### Explicit blocking-pair check

`A` already has its first choice, so `A` cannot participate in a blocking pair.

`B` also has its first choice.

`C` prefers `X` and `Y` to `Z`.

`X` prefers its partner `A` to `C`.

`Y` prefers its partner `B` to `C`.

Neither pair `(C, X)` nor `(C, Y)` is mutually improving.

No other unmatched pair can block the assignment.

The rejection history supplied exactly the evidence used in this check.

### A trade-up transition

The previous trace contains rejections but no displaced proposer.

Consider a receiver `X` currently holding `A` with ranking `B`, `A`, `C`.

If `B` later proposes to `X`, `X` compares ranks `0` and `1`.

`X` retains `B` and releases `A`.

`A` reenters the free queue at its next preference.

`A` never proposes to `X` again.

This transition preserves the partial-matching invariant.

It also demonstrates receiver monotonicity: `X` moved upward from `A` to `B`.

## 4. Production-Ready Implementations

The implementation below targets the strict, complete, balanced model.

It validates the domain before starting.

That prevents a misspelled participant from turning into an obscure lookup error midway through matching.

```python
from collections import deque
from collections.abc import Hashable, Mapping, Sequence
from typing import TypeVar

P = TypeVar("P", bound=Hashable)
R = TypeVar("R", bound=Hashable)


def _validate_preferences(
    proposer_preferences: Mapping[P, Sequence[R]],
    receiver_preferences: Mapping[R, Sequence[P]],
) -> None:
    proposers = set(proposer_preferences)
    receivers = set(receiver_preferences)

    if len(proposers) != len(receivers):
        raise ValueError("the strict balanced model needs equal side sizes")

    for proposer, preferences in proposer_preferences.items():
        if len(preferences) != len(receivers) or set(preferences) != receivers:
            raise ValueError(f"invalid receiver ranking for {proposer!r}")

    for receiver, preferences in receiver_preferences.items():
        if len(preferences) != len(proposers) or set(preferences) != proposers:
            raise ValueError(f"invalid proposer ranking for {receiver!r}")


def gale_shapley(
    proposer_preferences: Mapping[P, Sequence[R]],
    receiver_preferences: Mapping[R, Sequence[P]],
) -> dict[P, R]:
    """Return the proposer-optimal stable matching."""
    _validate_preferences(proposer_preferences, receiver_preferences)

    receiver_rank = {
        receiver: {proposer: rank for rank, proposer in enumerate(preferences)}
        for receiver, preferences in receiver_preferences.items()
    }
    next_choice = {proposer: 0 for proposer in proposer_preferences}
    free = deque(proposer_preferences)
    held_by_receiver: dict[R, P] = {}

    while free:
        proposer = free.popleft()
        choice_index = next_choice[proposer]
        receiver = proposer_preferences[proposer][choice_index]
        next_choice[proposer] = choice_index + 1

        incumbent = held_by_receiver.get(receiver)
        if incumbent is None:
            held_by_receiver[receiver] = proposer
            continue

        if receiver_rank[receiver][proposer] < receiver_rank[receiver][incumbent]:
            held_by_receiver[receiver] = proposer
            free.append(incumbent)
        else:
            free.append(proposer)

    return {proposer: receiver for receiver, proposer in held_by_receiver.items()}
```

The queue contains only free proposers.

The `next_choice` map records each proposal frontier.

`receiver_rank` converts an ordered preference list into constant-time comparisons.

The output is inverted once so callers receive proposer-to-receiver pairs.

### Verify stability independently

Testing only the expected sample result is too weak.

An independent checker catches duplicate matches and blocking pairs.

```python
def is_stable(
    matching: Mapping[P, R],
    proposer_preferences: Mapping[P, Sequence[R]],
    receiver_preferences: Mapping[R, Sequence[P]],
) -> bool:
    if set(matching) != set(proposer_preferences):
        return False

    if len(set(matching.values())) != len(matching):
        return False

    partner_of_receiver = {receiver: proposer for proposer, receiver in matching.items()}
    receiver_rank = {
        receiver: {proposer: rank for rank, proposer in enumerate(preferences)}
        for receiver, preferences in receiver_preferences.items()
    }

    for proposer, current_receiver in matching.items():
        for preferred_receiver in proposer_preferences[proposer]:
            if preferred_receiver == current_receiver:
                break

            incumbent = partner_of_receiver[preferred_receiver]
            if (
                receiver_rank[preferred_receiver][proposer]
                < receiver_rank[preferred_receiver][incumbent]
            ):
                return False

    return True
```

The checker examines only receivers that a proposer ranks above its assigned partner.

If any such receiver also prefers that proposer to its own partner, it finds a blocking pair.

### Executable example

```python
proposer_preferences = {
    "A": ["X", "Y", "Z"],
    "B": ["Y", "X", "Z"],
    "C": ["X", "Y", "Z"],
}

receiver_preferences = {
    "X": ["B", "A", "C"],
    "Y": ["A", "B", "C"],
    "Z": ["A", "B", "C"],
}

matching = gale_shapley(proposer_preferences, receiver_preferences)

assert matching == {"A": "X", "B": "Y", "C": "Z"}
assert is_stable(matching, proposer_preferences, receiver_preferences)
```

For deterministic output serialization, sort the returned pairs explicitly.

Correctness does not depend on dictionary display order.

### Model boundaries

Incomplete preference lists require an explicit unmatched state.

Ties require a chosen stability definition and tie-breaking policy.

Many-to-one matching requires receiver capacities.

Coupled preferences can invalidate the substitutability assumptions behind simple deferred acceptance.

Those cases should not be hidden behind the strict-model function.

Give each model its own validated interface and documented guarantees.

## 5. Asymptotic Time & Space Complexity

Let each side contain $n$ participants.

Each proposer contacts a receiver at most once.

There are $n$ choices for each of $n$ proposers.

Thus the total number of proposals is bounded by:

$$
\sum_{p \in P} n = n^2.
$$

Each proposal performs constant-time queue, frontier, match, and rank-table operations.

The matching loop therefore takes $O(n^2)$ time.

Building the receiver rank table also reads $n^2$ preference entries.

Input validation reads both complete preference matrices.

The complete end-to-end time remains $O(n^2)$.

The preference input itself occupies $\Theta(n^2)$ space.

The rank table adds $\Theta(n^2)$ auxiliary space.

The queue, frontiers, and tentative matching require $O(n)$ space.

If a caller already supplies inverse ranks, the algorithm-specific auxiliary space can be reduced to $O(n)$.

The input representation still contains quadratic information in the complete-list model.

| Operation | Bound | Reason |
|---|---:|---|
| Validate complete rankings | $O(n^2)$ | Inspect every preference entry |
| Build receiver ranks | $O(n^2)$ | Invert every receiver list |
| Process proposals | $O(n^2)$ | At most one proposal per pair |
| Store tentative matching | $O(n)$ | At most one holder per receiver |
| Store inverse ranks | $O(n^2)$ | One rank per possible pair |

The quadratic bound is worst-case, not merely average-case.

Some inputs finish after exactly $n$ proposals because every first choice is distinct.

Adversarial preference profiles force many proposers far down their lists.

Using `list.pop(0)` for the free set would add avoidable element shifts.

A deque keeps each removal and requeue operation constant-time.

Scanning a receiver's preference list on every proposal would introduce another factor of $n$.

The inverse rank table prevents that accidental $O(n^3)$ implementation.

## 6. Systems Connections

Deferred acceptance separates three concerns that production systems often mix together.

Preferences describe participant priorities.

Eligibility rules decide which pairs may appear.

The matching mechanism decides how eligible rankings become assignments.

Keeping those layers separate makes audits possible.

### Capacitated allocation

Schools, hospitals, and teams usually accept multiple participants.

A receiver with capacity $c_r$ can tentatively hold its best $c_r$ proposals.

When a stronger proposal arrives at full capacity, it releases its least-preferred holder.

This is the many-to-one deferred-acceptance pattern.

The capacity sum determines whether every proposer can be placed.

### Distributed proposal protocols

The algorithm can be viewed as message passing.

A proposal is a request message.

Holding is provisional state.

Rejection is a monotone response that advances the sender's frontier.

An implementation still needs a consistent owner for each receiver's current decision.

Concurrent proposals must be serialized or compared atomically.

Otherwise two proposers may both believe they are held.

### Audit logs

The proposal sequence is a compact explanation of the outcome.

For each rejection, the log can record the incumbent and rank comparison.

That history helps distinguish an algorithmic result from malformed input or an incorrectly applied policy.

Sensitive preference data should not be copied indiscriminately into logs.

An audit identifier and reason code may be safer than raw rankings.

### Stability is not universal fairness

Stability prevents mutually preferable deviations under the recorded preferences.

It does not guarantee equal outcomes across groups.

It does not guarantee strategy-proofness for both sides.

It does not repair biased priorities or missing options.

The proposer-optimal result may systematically favor the side allowed to propose.

Mechanism selection must therefore be reviewed alongside policy goals.

### Dynamic markets

Classic Gale-Shapley assumes a fixed participant set and fixed preferences.

Late arrivals or withdrawn participants change the instance.

Patching one pair locally can introduce a blocking pair elsewhere.

Systems may rerun the mechanism, maintain waiting lists, or define controlled rematching windows.

Each choice trades stability against disruption.

### Where the basic model breaks

Stable roommates uses one participant set rather than two sides.

It needs a different algorithm and may have no stable solution.

Couples who submit joint preferences create complementarities.

Simple independent proposals do not capture those constraints.

Ties create multiple notions such as weak, strong, and super stability.

The implementation must state which notion it promises.

## 7. Practice Checklist

- Define the two participant sets explicitly.
- Confirm whether their sizes are equal.
- Decide whether unmatched participants are permitted.
- Validate that every referenced participant exists.
- Reject duplicate entries inside a preference list.
- Distinguish strict rankings from rankings with ties.
- Identify the proposing side before claiming optimality.
- Build inverse receiver ranks for constant-time comparison.
- Give every proposer a monotone next-choice frontier.
- Keep only free proposers in the work queue.
- Ensure each receiver holds at most one proposer in the balanced model.
- Release the displaced incumbent before requeueing it.
- Never reset a rejected proposer's frontier.
- Bound proposals by the number of eligible pairs.
- Test an instance where all first choices are distinct.
- Test an instance containing repeated receiver contention.
- Test a transition that displaces an incumbent.
- Verify the result is a bijection when complete matching is required.
- Search independently for blocking pairs.
- Run randomized small cases against the stability checker.
- Compare proposer-driven and receiver-driven outcomes.
- Document that proposing-side optimality is one-sided.
- Do not describe stability as a complete fairness guarantee.
- Treat capacities as a separate many-to-one model.
- Treat incomplete lists as an explicit acceptability model.
- Choose a documented policy before breaking ties.
- Avoid printing private preference lists in production logs.
- Record enough proposal history to diagnose policy mistakes.
- Serialize concurrent decisions for the same receiver.
- Define what happens when participants withdraw.
- Revalidate stability after any manual override.

## 8. Frequently Asked Questions

### Why is acceptance called deferred?

A receiver's current choice is tentative.

It may replace that proposer when a more-preferred proposal arrives.

Only termination turns the held proposals into the final matching.

### Does the order of free proposers change the result?

Not in the strict complete model with a fixed proposing side.

Different processing orders may produce different proposal traces, but they reach the same proposer-optimal stable matching.

### Is every stable matching unique?

No.

One preference profile can admit several stable matchings.

Gale-Shapley selects an extreme one: optimal for the proposing side and pessimal for the receiving side among stable outcomes.

### Can the output contain a blocking pair?

Not when the strict model and implementation assumptions hold.

Any proposer who prefers a receiver over its final partner must already have been rejected by that receiver.

The receiver finishes with someone it prefers at least as much as the proposer it rejected.

### Why not compare preference lists directly during every proposal?

Searching a list costs $O(n)$.

Doing that for up to $n^2$ proposals can produce $O(n^3)$ time.

An inverse rank table makes each receiver decision constant-time.

### What if the two sides have different sizes?

The balanced implementation deliberately rejects that input.

A generalized model can add unmatched outcomes, dummy participants, or receiver capacities.

Those choices affect the meaning of stability and should be explicit.

### What happens when preferences contain ties?

The basic proof assumes strict order.

Breaking ties arbitrarily yields a stable result for the refined strict preferences, but it may not satisfy stronger stability notions for the original tied instance.

### Is truthful reporting always the best strategy?

Truthful reporting has strong guarantees for the proposing side in the classical mechanism.

The receiving side does not receive the same general protection.

Strategic behavior and policy constraints need analysis beyond runtime correctness.

### Can Gale-Shapley solve the stable-roommates problem?

No.

Stable roommates has one set of participants and different structural constraints.

A stable solution may not exist for that problem.

### How should an implementation be tested?

Check input validity, matching uniqueness, and coverage first.

Then run an independent blocking-pair detector.

For small $n$, enumerate all bijections and confirm that the returned result is stable and proposer-optimal among stable candidates.

### When should the algorithm not be used?

Do not apply the unmodified algorithm when preferences are coupled, capacities matter, ties require a specific stability notion, or eligibility changes during execution.

Choose a model whose proof matches the real constraints rather than forcing the constraints into a convenient interface.
