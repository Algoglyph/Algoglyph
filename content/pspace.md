# PSPACE — Polynomial Space Complexity Class

> If a problem can be solved using a polynomial amount of memory — even if it takes exponential time — it lives in PSPACE. And surprisingly, PSPACE is one of the most natural "ceiling" classes in complexity theory.

---

## 1. Historical Context

The study of **space complexity** began in earnest with **Walter Savitch's 1970 theorem**, which proved that nondeterminism buys you nothing in space beyond a quadratic blowup: $\text{NSPACE}(s(n)) \subseteq \text{DSPACE}(s(n)^2)$. This immediately implied $\text{PSPACE} = \text{NPSPACE}$ — a clean separation from the time world, where $\text{P}$ vs $\text{NP}$ remains wide open.

The class **PSPACE** became a focal point with two landmark results:

- **Shamir (1992)**: $\text{IP} = \text{PSPACE}$ — every PSPACE problem has an interactive proof where a polynomial-time verifier interacts with an all-powerful prover. This was astonishing: interaction plus randomness unlocks the full power of polynomial space.
- **Stockmeyer & Meyer (1973)**: **QBF** (Quantified Boolean Formula) is PSPACE-complete. The problem "given a fully quantified Boolean formula, is it true?" is the canonical PSPACE-complete problem — the analogue of SAT for NP.

The complexity zoo places PSPACE as a "catch-all" for problems that are not necessarily easy to *find* but easy to *exhaust in a bounded-memory way*: games like generalized chess, Go, and Hex; planning in AI; model checking of temporal logics.

---

## 2. Core Mathematical Invariants

### Definition

$$\text{PSPACE} = \bigcup_{k \ge 1} \text{DSPACE}(n^k)$$

$$\text{NPSPACE} = \bigcup_{k \ge 1} \text{NSPACE}(n^k)$$

$$\text{Savitch:} \quad \text{NPSPACE} = \text{PSPACE}$$

### Configuration Graph

For a Turing machine using space $s(n)$ on input $w$ of length $n$, the total number of *distinct configurations* is bounded:

$$N = |Q| \cdot |\Gamma|^{s(n)} \cdot s(n)$$

- $|Q|$ states, $|\Gamma|^{s(n)}$ tape contents, $s(n)$ head positions.

Any computation that uses space $s(n)$ must terminate within $N$ steps — otherwise it has entered a loop and never halts. Hence $\text{DSPACE}(s) \subseteq \text{DTIME}(2^{O(s)})$ and PSPACE $\subseteq$ EXP.

### The Classical Chain

$$\text{P} \subseteq \text{NP} \subseteq \text{PSPACE} \subseteq \text{EXP}$$

```svg
<svg viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="420" fill="#0d1117"/>
  <text x="320" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Space vs Time: where PSPACE sits</text>

  <!-- EXP -->
  <rect x="40" y="60" width="560" height="320" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="60" y="80" font-family="monospace" font-size="13" fill="#f85149">EXP = DTIME(2^poly) — every PSPACE problem is decidable in exp time</text>

  <!-- PSPACE -->
  <rect x="80" y="120" width="480" height="240" fill="none" stroke="#d2a8ff" stroke-width="2.5"/>
  <text x="100" y="140" font-family="monospace" font-size="13" fill="#d2a8ff">PSPACE = NPSPACE — polynomial space</text>

  <!-- NP -->
  <rect x="140" y="180" width="360" height="140" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="160" y="200" font-family="monospace" font-size="13" fill="#3fb950">NP — nondeterministic poly-time</text>

  <!-- P -->
  <rect x="200" y="240" width="240" height="60" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="220" y="275" font-family="monospace" font-size="13" fill="#58a6ff">P — poly-time</text>

  <!-- PSPACE-complete marker -->
  <circle cx="490" cy="200" r="6" fill="#f0883e"/>
  <text x="500" y="204" font-family="monospace" font-size="11" fill="#f0883e">QBF (PSPACE-complete)</text>

  <text x="320" y="400" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">P ⊆ NP ⊆ PSPACE ⊆ EXP — all inclusions believed strict, none proven.</text>
</svg>
```

### Savitch's Theorem — Proof Sketch

To decide whether an NTM $M$ can go from configuration $c_1$ to $c_2$ in $\le 2^t$ steps, recursively check: is there a midpoint $m$ such that $c_1 \to^* m$ in $2^{t-1}$ AND $m \to^* c_2$ in $2^{t-1}$? The recursion depth is $t$; each level stores $O(s)$ bits per configuration; total space $O(s \cdot t) = O(s^2)$ when $t = 2^{O(s)}$.

---

## 3. Step-by-Step Execution Trace

### Solving QBF: $\forall x . \exists y . (x \land y) \lor (\lnot x \land \lnot y)$

The recursive evaluation uses polynomial space (depth = number of variables) but exponential time.

| Step | Formula to evaluate | Action |
|------|---------------------|--------|
| 1 | $\forall x.\, \exists y.\, (x \land y) \lor (\lnot x \land \lnot y)$ | Set $x = T$, recurse |
| 2 | $\exists y.\, (T \land y) \lor (F \land \lnot y) = \exists y.\, y$ | Set $y = T$, recurse |
| 3 | $(T \land T) \lor (F \land F) = T$ | Return $T$ |
| 4 | (back at step 1) Set $x = F$, recurse | |
| 5 | $\exists y.\, (F \land y) \lor (T \land \lnot y) = \exists y.\, \lnot y$ | Set $y = F$, recurse |
| 6 | $(F \land F) \lor (T \land T) = T$ | Return $T$ |
| 7 | Both $x$-branches return $T$ → $\forall$ holds | Return TRUE |

The recursion stack depth is 2 (number of variables); at each level we store only the current variable assignment. Total space: $O(n)$ — polynomial. Total time: $O(2^n)$ — exponential.

### Savitch's Reachability — Trace

```svg
<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="360" fill="#0d1117"/>
  <text x="340" y="25" text-anchor="middle" font-family="monospace" font-size="14" fill="#58a6ff" font-weight="bold">Savitch REACH(c1, c2, t): does c1 reach c2 in 2^t steps?</text>

  <rect x="20" y="60" width="640" height="80" fill="none" stroke="#d2a8ff" stroke-width="1.5"/>
  <text x="40" y="80" font-family="monospace" font-size="12" fill="#d2a8ff">REACH(c1, c2, t):</text>
  <text x="40" y="100" font-family="monospace" font-size="11" fill="#8b949e">  if t = 0: return (c1 == c2) OR (c1 -> c2 in one step)</text>
  <text x="40" y="118" font-family="monospace" font-size="11" fill="#8b949e">  for each midpoint m (configurations c1, c2 have ≤ 2^s of them):</text>
  <text x="40" y="135" font-family="monospace" font-size="11" fill="#8b949e">    if REACH(c1, m, t-1) AND REACH(m, c2, t-1): return TRUE</text>

  <text x="40" y="170" font-family="monospace" font-size="12" fill="#f0883e">Recursion tree:</text>

  <rect x="40" y="185" width="600" height="40" fill="#21262d" stroke="#58a6ff"/>
  <text x="340" y="210" text-anchor="middle" font-family="monospace" font-size="12" fill="#58a6ff">REACH(c1, c2, s)   [depth s, space: O(s·log config) = O(s^2)]</text>

  <line x1="200" y1="225" x2="160" y2="245" stroke="#30363d"/>
  <line x1="480" y1="225" x2="520" y2="245" stroke="#30363d"/>

  <rect x="80" y="245" width="280" height="40" fill="#21262d" stroke="#3fb950"/>
  <text x="220" y="270" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">REACH(c1, m, s-1)</text>

  <rect x="380" y="245" width="280" height="40" fill="#21262d" stroke="#3fb950"/>
  <text x="520" y="270" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">REACH(m, c2, s-1)</text>

  <text x="340" y="320" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Each call stores O(s) bits for the configuration c, m, c2.</text>
  <text x="340" y="340" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Recursion depth s → total space O(s^2). Time: O(2^(2s)).</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: QBF Solver (PSPACE-complete, polynomial space)

```cpp
#include <bits/stdc++.h>
using namespace std;

// Tokenizer + recursive QBF evaluator.
// Variables: x0, x1, ... Quantifiers: E (exists), A (forall).
// Boolean connectives: & | ! and parens.

struct QBF {
    // quantifier list: (var_index, is_forall)
    vector<pair<int,bool>> quants;
    int num_vars;
    string expr;  // propositional part after quantifiers, var = "xN"
};

map<string, bool> env;  // current variable assignment

// Simple recursive-descent parser for: E|A var . formula | formula
// formula := term ('|' term)*
// term := factor ('&' factor)*
// factor := '!' factor | '(' formula ')' | var
struct Parser {
    string s; size_t i = 0;
    Parser(string s): s(s) {}

    void skip() { while (i < s.size() && isspace(s[i])) i++; }

    bool parse_formula() {
        bool v = parse_term();
        skip();
        while (i < s.size() && s[i] == '|') {
            i++; bool r = parse_term(); v = v || r; skip();
        }
        return v;
    }

    bool parse_term() {
        bool v = parse_factor();
        skip();
        while (i < s.size() && s[i] == '&') {
            i++; bool r = parse_factor(); v = v && r; skip();
        }
        return v;
    }

    bool parse_factor() {
        skip();
        if (s[i] == '!') { i++; return !parse_factor(); }
        if (s[i] == '(') {
            i++; bool v = parse_formula();
            skip(); if (s[i] == ')') i++;
            return v;
        }
        // variable: xN
        if (s[i] == 'x') {
            i++;
            string num;
            while (i < s.size() && isdigit(s[i])) { num += s[i]; i++; }
            return env["x" + num];
        }
        return false;
    }
};

// Recursive QBF evaluation: O(n) space, O(2^n) time.
bool eval_qbf(vector<pair<int,bool>>& quants, int qi, string& formula) {
    if (qi == (int)quants.size()) {
        Parser p(formula);
        return p.parse_formula();
    }
    auto [var, is_forall] = quants[qi];
    string key = "x" + to_string(var);
    env[key] = false;
    bool r_false = eval_qbf(quants, qi + 1, formula);
    env[key] = true;
    bool r_true = eval_qbf(quants, qi + 1, formula);
    return is_forall ? (r_false && r_true) : (r_false || r_true);
}

int main() {
    // ∀x0. ∃x1. (x0 & x1) | (!x0 & !x1)
    vector<pair<int,bool>> quants = {{0, true}, {1, false}};
    string formula = "(x0 & x1) | (!x0 & !x1)";
    cout << "QBF = " << (eval_qbf(quants, 0, formula) ? "TRUE" : "FALSE") << "\n";
    // Output: TRUE
}
```

### Python: Savitch's Reachability Algorithm

```python
"""
Savitch's reachability algorithm: solve ST-CONNECTIVITY
in O(log^2 n) space — demonstrating PSPACE-friendliness.
"""
import sys
sys.setrecursionlimit(100000)

def reach(graph, c1, c2, t):
    """
    Return True iff there is a path from c1 to c2 of length <= 2^t.
    Uses O(t * log n) stack space.
    """
    # Base: paths of length <= 1
    if t == 0:
        return c1 == c2 or c2 in graph.get(c1, [])

    # Recursive: try every midpoint m
    for m in graph:
        if reach(graph, c1, m, t - 1) and reach(graph, m, c2, t - 1):
            return True
    return False


def st_connectivity_savitch(graph, start, target):
    """O(log^2 |V|) space STCONN algorithm."""
    n = len(graph)
    t = 1
    while (1 << t) < 2 * n:
        t += 1
    return reach(graph, start, target, t)


if __name__ == "__main__":
    # 6-node graph
    graph = {
        0: [1], 1: [2, 3], 2: [4], 3: [4], 4: [5], 5: []
    }
    print("0 -> 5:", st_connectivity_savitch(graph, 0, 5))  # True
    print("5 -> 0:", st_connectivity_savitch(graph, 5, 0))  # False
```

---

## 5. Asymptotic Time & Space Complexity

| Problem | Class | Space | Time |
|---------|-------|-------|------|
| SAT (NP) | in NP | polynomial | exponential |
| QBF | PSPACE-complete | $\Theta(n)$ stack | $O(2^n)$ |
| Generalized chess ($n \times n$) | EXPTIME-complete | exponential | exponential |
| Generalized Go (japanese rules) | EXPTIME-complete | exponential | exponential |
| Model checking CTL (Kripke structures) | P-complete | polynomial | polynomial |
| Model checking LTL | PSPACE-complete | polynomial | exponential |
| Hex, Geography (positional games) | PSPACE-complete | polynomial | exponential |
| Planning (Strips) | PSPACE-complete | polynomial | exponential |

**Space hierarchy theorem**: $\text{DSPACE}(f(n)) \subsetneq \text{DSPACE}(g(n))$ whenever $g = \omega(f \log f)$. In particular $\text{L} \subsetneq \text{PSPACE}$ is provably strict.

**Key inclusions** (all believed strict, only the outer is provable):

$$\text{L} \subsetneq \text{PSPACE} \subsetneq \text{EXP}$$

---

## 6. Systems Connections

### Where PSPACE matters in practice

- **Model checking**: Tools like **SPIN**, **NuSMV**, and **TLA+** verify whether a finite-state system satisfies a temporal-logic property. The problem is in PSPACE (often PSPACE-complete); these tools use clever BDD-based symbolic representations to keep memory polynomial.
- **Game AI**: Chess, Go, Hex are PSPACE- or EXPTIME-complete on generalized boards. Minimax + alpha-beta pruning + iterative deepening is the practical deterministic solver — bounded by time, not space.
- **Automated planning**: The classical STRIPS planning problem is PSPACE-complete. Modern planners (Fast Downward, FF) use heuristic search with polynomial-space state representations.
- **Bounded Model Checking (BMC)**: Unroll a transition relation $k$ times and reduce to SAT — converts PSPACE problems into a sequence of NP problems solvable by SAT solvers.
- **DNA computing & quantum**: Many PSPACE problems are the natural target for unconventional computing models, but no real speedup has been demonstrated.

---

## 7. Practice Checklist

- [ ] **Prove** $\text{NP} \subseteq \text{PSPACE}$ by the certificate-on-tape argument (write the polynomial-size certificate, then verify in poly-space).
- [ ] **Implement** Savitch's reachability and measure its space vs the naive DFS.
- [ ] **Reduce** SAT to QBF (add $\exists$ quantifiers in front) — proves SAT $\in$ PSPACE.
- [ ] **Reduce** QBF to Generalized Geography (PSPACE-completeness via game-tree).
- [ ] **Show** that PSPACE $\subseteq$ EXP via the configuration-graph argument.
- [ ] **Code** a recursive QBF evaluator and verify on small formulas.
- [ ] **Read** Sipser §8 (Space Complexity), Arora-Barak Ch. 4-5.
- [ ] **Try** modeling a simple game (Tic-Tac-Toe generalization) as a PSPACE problem.

---

## 8. Frequently Asked Questions

**Q1. Why is PSPACE = NPSPACE but P vs NP is open?**
Savitch's theorem gives a constructive deterministic simulation of any nondeterministic space-$s$ computation using space $s^2$. The key trick — recursively bisecting the computation — works because we can *re-explore* subpaths without storing them. The analogous time-theorem would require time $t^2$, but the NTM can branch $b^t$ ways in time $t$, so no analog exists. The asymmetry between time and space is fundamental.

**Q2. Is PSPACE believed to equal NP?**
Most theorists believe $\text{NP} \subsetneq \text{PSPACE}$. We can prove $\text{P} \subsetneq \text{EXP}$ via the time hierarchy theorem, but the chain $\text{P} \subseteq \text{NP} \subseteq \text{PSPACE}$ has no proven strict inclusions. If $\text{NP} = \text{PSPACE}$, then by Savitch $\text{NP} = \text{coNP}$ (since PSPACE is closed under complement), which would be a massive surprise.

**Q3. What makes QBF harder than SAT?**
SAT asks "does there exist an assignment?" — one $\exists$ quantifier. QBF allows alternating $\forall$ and $\exists$ quantifiers, encoding a two-player game tree. The recursive evaluation has depth $n$ but $2^n$ leaves; SAT solvers can't directly handle the universal quantifier. Specialized QBF solvers (DepQBF, CAQE, QuAbS) use quantified CDCL but remain much less mature than SAT solvers.

**Q4. Why are games like generalized chess PSPACE/EXPTIME-complete?**
A game tree has alternating existential (my move) and universal (opponent's move) structure — naturally a QBF instance. Whether it's PSPACE or EXPTIME depends on whether the game length is polynomially bounded (PSPACE) or can run exponentially long (EXPTIME). Chess on $n \times n$ with $n$-step move rules is EXPTIME-complete; Hex on $n \times n$ is PSPACE-complete because the game must end in $n^2$ moves.

**Q5. Can a PSPACE problem ever be solved in polynomial time?**
If *any* PSPACE-complete problem were in P, then $\text{P} = \text{PSPACE}$, which would imply $\text{P} = \text{NP}$. Since most theorists believe $\text{P} \neq \text{NP}$, no PSPACE-complete problem is expected to have a polynomial-time algorithm. However, *individual instances* of PSPACE-complete problems (like specific SAT instances) are routinely solved fast by clever solvers — complexity theory measures worst-case difficulty, not typical-case.
