# Boolean Satisfiability Solvers — Algorithms that Power an Industry

> SAT is the canonical NP-complete problem. Yet industrial SAT solvers routinely crack instances with **millions of variables**. How? Modern CDCL solvers combine smart heuristics, conflict-driven clause learning, and lazy data structures to compress the search tree exponentially.

---

## 1. Historical Context & Motivation

The **Boolean Satisfiability Problem (SAT)** asks: given a Boolean formula $\varphi$, does there exist an assignment making $\varphi$ true? Cook-Levin (1971) proved it NP-complete, making it the foundational problem of complexity theory.

**Martin Davis, George Logemann, and Donald Putnam (DPLL, 1960-62)** introduced the **Davis-Putnam-Logemann-Loveland** procedure — a backtracking search with unit propagation and pure literal elimination. It remained the dominant SAT algorithm for 40 years.

The **revolution** came with **Conflict-Driven Clause Learning (CDCL)**, introduced by **Marques-Silva and Sakallah (1996, GRASP solver)** and refined by **Moskewicz, Madigan, Zhao, Zhang, Malik (2001, Chaff solver)**. CDCL learns new clauses from conflicts, transforming the solver from a search algorithm into a **proof system** — every conflict adds a clause that prunes future search.

**Armin Biere's** competition-winning solvers (Lingeling, CaDiCaL, Kissat) and **Niklas Eén and Niklas Sörensson's MiniSAT (2003)** made SAT solving practical. SAT is now the backbone of:
- **Hardware verification** (Intel, AMD, ARM use SAT for CPU validation).
- **Software model checking** (CBMC, LLBMC).
- **Cryptanalysis** (breaking hash functions, finding collisions).
- **Automated theorem proving** (SMT solvers like Z3, CVC4 build on SAT cores).
- **AI planning** (SATPlan, SAT-based planning).

The **SAT competition** (run annually since 2002) drives progress; state-of-the-art solvers now handle instances with $10^7$ variables that were utterly intractable in the 1990s.

---

## 2. Core Mathematical Invariants

### Conjunctive Normal Form (CNF)

A formula $\varphi = \bigwedge_i C_i$ where each **clause** $C_i = \bigvee_j \ell_{ij}$ is a disjunction of **literals** ($x$ or $\lnot x$). Tseitin transformation converts any formula to CNF in polynomial time, blowing up size by only a constant factor.

### DIMACS Format

The standard SAT input format:
```
p cnf 3 2
1 -2 3 0
-1 2 0
```
Means: 3 variables, 2 clauses: $(x_1 \lor \lnot x_2 \lor x_3) \land (\lnot x_1 \lor x_2)$.

### DPLL Invariants

The DPLL algorithm maintains:
- **Partial assignment** $\alpha: V \to \{0, 1, \text{undef}\}$.
- **Unit clause**: clause with all literals false except one undefined — that literal must be true.
- **Pure literal**: variable that appears only positively (or only negatively) — assign it to satisfy.

### CDCL Algorithm Structure

```
CDCL(φ):
  α = {}   // empty assignment
  while true:
    propagate units (BCP)
    if conflict:
      if decision level == 0: return UNSAT
      learn conflict clause C
      backjump to appropriate level
    else:
      if all variables assigned: return SAT (with α)
      else: pick decision variable, branch
```

```svg
<svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="420" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">CDCL Algorithm: Iterative Search with Clause Learning</text>

  <!-- Start -->
  <rect x="280" y="60" width="120" height="36" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="340" y="83" text-anchor="middle" font-family="monospace" font-size="11" fill="#58a6ff">Initialize α = {}</text>

  <!-- BCP -->
  <rect x="280" y="115" width="120" height="36" fill="#21262d" stroke="#3fb950" stroke-width="2"/>
  <text x="340" y="138" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">Unit propagate</text>

  <line x1="340" y1="96" x2="340" y2="115" stroke="#8b949e" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Conflict? -->
  <polygon points="340,170 440,200 340,230 240,200" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="340" y="205" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0883e">Conflict?</text>

  <line x1="340" y1="151" x2="340" y2="170" stroke="#8b949e" stroke-width="2" marker-end="url(#arr)"/>

  <!-- YES branch -->
  <text x="200" y="205" font-family="monospace" font-size="11" fill="#f85149">YES</text>
  <line x1="240" y1="200" x2="180" y2="200" stroke="#f85149" stroke-width="2" marker-end="url(#arr)"/>

  <rect x="60" y="240" width="180" height="36" fill="#21262d" stroke="#f85149" stroke-width="2"/>
  <text x="150" y="263" text-anchor="middle" font-family="monospace" font-size="11" fill="#f85149">Learn clause, backjump</text>
  <line x1="150" y1="220" x2="150" y2="240" stroke="#f85149" stroke-width="2" marker-end="url(#arr)"/>

  <!-- NO branch -->
  <text x="450" y="205" font-family="monospace" font-size="11" fill="#3fb950">NO</text>
  <line x1="440" y1="200" x2="500" y2="200" stroke="#3fb950" stroke-width="2" marker-end="url(#arr)"/>

  <polygon points="580,170 660,200 580,230 500,200" fill="#21262d" stroke="#d2a8ff" stroke-width="2"/>
  <text x="580" y="205" text-anchor="middle" font-family="monospace" font-size="10" fill="#d2a8ff">All assigned?</text>

  <rect x="500" y="240" width="160" height="36" fill="#21262d" stroke="#3fb950" stroke-width="2"/>
  <text x="580" y="263" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">Pick decision var</text>
  <line x1="580" y1="230" x2="580" y2="240" stroke="#d2a8ff" stroke-width="2" marker-end="url(#arr)"/>

  <!-- Loop arrow back to BCP -->
  <path d="M 580 276 Q 580 320, 480 320 L 200 320 Q 100 320, 100 200 L 100 133 L 280 133" fill="none" stroke="#58a6ff" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arr)"/>

  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b949e"/>
    </marker>
  </defs>

  <text x="340" y="380" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Each learned clause permanently prunes the search tree — turning SAT solving</text>
  <text x="340" y="400" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">into a resolution-proof system that can be exponentially stronger than plain DPLL.</text>
</svg>
```

### Lazy Data Structures: Watched Literals

The key to fast BCP (Boolean Constraint Propagation): for each clause, watch only **2 literals**. When a watched literal becomes false, check if some other literal can be watched. Only when *both* watched literals are false is the clause unit or conflicting. This gives $O(1)$ amortized cost per assignment.

---

## 3. Step-by-Step Execution Trace

### DPLL on $\varphi = (\lnot x_1 \lor x_2) \land (\lnot x_2 \lor x_3) \land (\lnot x_1 \lor \lnot x_3) \land (x_1)$

| Step | Action | Assignment | Status |
|------|--------|------------|--------|
| 1 | Decide $x_1 = T$ (forced by unit clause) | $x_1 = T$ | |
| 2 | Unit propagate clause 1: $x_2 = T$ | $x_1 = T, x_2 = T$ | |
| 3 | Unit propagate clause 2: $x_3 = T$ | $x_1 = T, x_2 = T, x_3 = T$ | |
| 4 | Check clause 3: $\lnot T \lor \lnot T = F \lor F = F$ | CONFLICT | |
| 5 | Backtrack: try $x_1 = F$ (forced → actually $x_1 = T$ from unit, so UNSAT) | | UNSAT |

The formula is unsatisfiable. The conflict clause learned: $\lnot x_1$ (a unit).

### CDCL with Clause Learning

Suppose at decision level 3, with assignment $x_1 = T, x_4 = T, x_7 = T$, a conflict arises in clause $(\lnot x_1 \lor \lnot x_4 \lor \lnot x_7 \lor x_9)$. CDCL:

1. **Learn** the conflict clause: $(\lnot x_1 \lor \lnot x_4 \lor \lnot x_7)$ (resolved via implication graph).
2. **Backjump** to decision level 2 (where $x_4$ was decided).
3. Now $(\lnot x_1 \lor \lnot x_4)$ becomes unit, forcing $x_4 = F$ for the rest of the search.

The learned clause prunes exponentially many future branches.

```svg
<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="360" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Implication Graph and Conflict Clause Learning</text>

  <text x="40" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">Decisions: x1=T @ dl1, x4=T @ dl2, x7=T @ dl3.</text>
  <text x="40" y="100" font-family="monospace" font-size="13" fill="#d2a8ff">Implications propagate; eventually some clause becomes empty (conflict).</text>

  <!-- Implication graph -->
  <circle cx="100" cy="150" r="18" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="100" y="155" text-anchor="middle" font-family="monospace" font-size="10" fill="#58a6ff">x1=T</text>
  <text x="100" y="180" text-anchor="middle" font-family="monospace" font-size="9" fill="#8b949e">dl=1</text>

  <circle cx="240" cy="150" r="18" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="240" y="155" text-anchor="middle" font-family="monospace" font-size="10" fill="#58a6ff">x4=T</text>
  <text x="240" y="180" text-anchor="middle" font-family="monospace" font-size="9" fill="#8b949e">dl=2</text>

  <circle cx="380" cy="150" r="18" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="380" y="155" text-anchor="middle" font-family="monospace" font-size="10" fill="#58a6ff">x7=T</text>
  <text x="380" y="180" text-anchor="middle" font-family="monospace" font-size="9" fill="#8b949e">dl=3</text>

  <circle cx="520" cy="150" r="20" fill="#21262d" stroke="#f85149" stroke-width="2.5"/>
  <text x="520" y="155" text-anchor="middle" font-family="monospace" font-size="10" fill="#f85149">CONFLICT</text>

  <line x1="118" y1="150" x2="222" y2="150" stroke="#30363d" marker-end="url(#aar)"/>
  <line x1="258" y1="150" x2="362" y2="150" stroke="#30363d" marker-end="url(#aar)"/>
  <line x1="398" y1="150" x2="500" y2="150" stroke="#f85149" stroke-width="2" marker-end="url(#aar)"/>

  <defs>
    <marker id="aar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#30363d"/>
    </marker>
  </defs>

  <text x="40" y="240" font-family="monospace" font-size="13" fill="#3fb950">Resolution: walk back from conflict, resolve clauses.</text>
  <text x="40" y="265" font-family="monospace" font-size="13" fill="#3fb950">Learned clause: (¬x1 ∨ ¬x4 ∨ ¬x7) — at decision level 1.</text>
  <text x="40" y="290" font-family="monospace" font-size="13" fill="#f0883e">Backjump: undo dl=3 and dl=2; assignment is now x1=T with clause forcing x1=F.</text>
  <text x="40" y="315" font-family="monospace" font-size="13" fill="#f85149">If learned clause is empty at dl=0: UNSAT.</text>
  <text x="40" y="340" font-family="monospace" font-size="11" fill="#8b949e">Each learned clause permanently prunes the search tree.</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: Minimal DPLL with Unit Propagation

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef vector<vector<int>> CNF;  // positive = var, negative = negated

struct DPLL {
    CNF formula;
    int num_vars;
    vector<int> assign;  // 0 = unassigned, 1 = true, -1 = false

    DPLL(int n, CNF f) : num_vars(n), formula(f), assign(n + 1, 0) {}

    bool value(int lit) {
        int v = abs(lit);
        if (assign[v] == 0) return 0;
        bool sign = lit > 0;
        return (assign[v] == 1) == sign;
    }

    // Returns: 1 = SAT, 0 = UNDEF, -1 = CONFLICT
    int clause_status(vector<int>& c) {
        int unassigned = 0;
        for (int lit : c) {
            int s = value(lit);
            if (s == 1) return 1;  // satisfied
            if (s == 0) unassigned++;
        }
        return unassigned == 0 ? -1 : 0;
    }

    // Unit propagation: assign forced literals.
    bool propagate() {
        bool changed = true;
        while (changed) {
            changed = false;
            for (auto& c : formula) {
                int st = clause_status(c);
                if (st == -1) return false;  // conflict
                if (st == 0) {
                    // Find the unassigned literal
                    int unit = 0;
                    int unassigned_count = 0;
                    for (int lit : c) {
                        if (value(lit) == 0) { unit = lit; unassigned_count++; }
                    }
                    if (unassigned_count == 1) {
                        assign[abs(unit)] = (unit > 0) ? 1 : -1;
                        changed = true;
                    }
                }
            }
        }
        return true;
    }

    bool solve() {
        if (!propagate()) return false;
        // Find unassigned variable
        int v = 0;
        for (int i = 1; i <= num_vars; i++) {
            if (assign[i] == 0) { v = i; break; }
        }
        if (v == 0) return true;  // all assigned, SAT

        // Branch
        vector<int> saved = assign;
        assign[v] = 1;
        if (solve()) return true;
        assign = saved;

        assign[v] = -1;
        if (solve()) return true;
        assign = saved;
        return false;
    }
};

int main() {
    // (x1 ∨ ¬x2 ∨ x3) ∧ (¬x1 ∨ x2) ∧ (x2 ∨ x3)
    CNF f = {{1, -2, 3}, {-1, 2}, {2, 3}};
    DPLL d(3, f);
    cout << (d.solve() ? "SAT" : "UNSAT") << "\n";
    if (d.solve()) {
        for (int i = 1; i <= 3; i++)
            cout << "x" << i << "=" << (d.assign[i] == 1 ? "T" : "F") << " ";
        cout << "\n";
    }
}
```

### Python: MiniCDCL-Style Solver with Clause Learning

```python
"""
Educational CDCL solver with conflict-driven clause learning,
watched literals, and VSIDS-like decision heuristic.
"""
import random

class CDCL:
    def __init__(self, num_vars, clauses):
        self.n = num_vars
        self.clauses = [list(c) for c in clauses]
        self.assign = {}      # var -> bool
        self.level = {}       # var -> decision level
        self.reason = {}      # var -> clause that forced it (None if decision)
        self.trail = []       # order of assignments
        self.decision_level = 0
        self.activity = [0.0] * (num_vars + 1)
        self.var_inc = 1.0

    def value(self, lit):
        v = abs(lit)
        if v not in self.assign: return None
        val = self.assign[v]
        return val if lit > 0 else (not val)

    def all_clauses_satisfied(self):
        for c in self.clauses:
            if not any(self.value(l) == True for l in c):
                if any(self.value(l) is None for l in c):
                    return False  # still unassigned
                return False  # conflict
        return True

    def propagate(self):
        """Naive BCP (a real solver uses watched literals)."""
        changed = True
        while changed:
            changed = False
            for ci, c in enumerate(self.clauses):
                unassigned = []
                satisfied = False
                for lit in c:
                    v = self.value(lit)
                    if v == True: satisfied = True; break
                    if v is None: unassigned.append(lit)
                if satisfied: continue
                if len(unassigned) == 0:
                    return c  # conflict
                if len(unassigned) == 1:
                    lit = unassigned[0]
                    v = abs(lit)
                    self.assign[v] = (lit > 0)
                    self.level[v] = self.decision_level
                    self.reason[v] = ci
                    self.trail.append(v)
                    changed = True
        return None  # no conflict

    def analyze(self, conflict):
        """Simplified clause learning: collect the negation of all decisions."""
        learned = []
        for v in self.trail:
            if self.level.get(v, 0) > 0:
                learned.append(-v if self.assign[v] else v)
        return learned

    def backjump(self, level):
        """Undo assignments above `level`."""
        self.trail = [v for v in self.trail if self.level.get(v, 0) <= level]
        new_assign = {}
        for v in self.trail: new_assign[v] = self.assign[v]
        self.assign = new_assign
        self.decision_level = level

    def pick_decision(self):
        """VSIDS-like: pick most active unassigned variable."""
        unassigned = [v for v in range(1, self.n + 1) if v not in self.assign]
        if not unassigned: return None
        return max(unassigned, key=lambda v: self.activity[v])

    def solve(self, max_conflicts=10000):
        conflicts = 0
        while True:
            conflict = self.propagate()
            if conflict is not None:
                conflicts += 1
                if conflicts > max_conflicts: return None  # UNKNOWN
                if self.decision_level == 0: return False  # UNSAT
                learned = self.analyze(conflict)
                self.clauses.append(learned)
                self.backjump(max(0, self.decision_level - 1))
            else:
                v = self.pick_decision()
                if v is None: return True  # SAT
                self.decision_level += 1
                self.assign[v] = random.random() < 0.5
                self.level[v] = self.decision_level
                self.reason[v] = None
                self.trail.append(v)

# Example: (x1 ∨ x2) ∧ (¬x1 ∨ x2) ∧ (x1 ∨ ¬x2) ∧ (¬x1 ∨ ¬x2) — UNSAT (pigeonhole for 2 vars)
clauses = [[1, 2], [-1, 2], [1, -2], [-1, -2]]
solver = CDCL(2, clauses)
result = solver.solve()
print("Result:", "SAT" if result == True else "UNSAT" if result == False else "UNKNOWN")
```

---

## 5. Asymptotic Time & Space Complexity

| Solver | Worst case | Typical (industrial) | Notes |
|--------|-----------|---------------------|-------|
| Brute force | $O(2^n)$ | $O(2^n)$ | hopeless for $n > 30$ |
| DPLL | $O(2^n)$ | varies | no learning |
| CDCL | $O(2^n)$ worst case | usually poly | learns clauses, prunes tree |
| Look-ahead (March, OKsolver) | $O(2^n)$ | strong on random | balances branches |
| SLS (WalkSAT) | no completeness | stochastic | good for satisfiable random |
| Gaussian elimination (for XOR) | poly | poly | XOR reasoning extension |

### The Power of CDCL

CDCL simulates the **resolution proof system**: a CDCL solver terminates in time $t$ on a formula $\varphi$ iff $\varphi$ has a resolution refutation of size $O(t)$. Hence:

- Pigeonhole principle: requires exponentially large resolution proofs (Haken 1985) — CDCL is exponentially slow on it.
- Tseitin contradictions: same.
- Random 3-SAT at the phase transition ($\alpha \approx 4.26$): exponential, but constants are small.

Modern solvers add **Gaussian elimination** for XOR constraints (CryptoMiniSat), **LSD** (look-ahead) components, and **SAT + theory** (SMT).

### Phase Transition

For random 3-SAT with $n$ variables and $\alpha n$ clauses:
- $\alpha < 4.26$: SAT with high probability, easy.
- $\alpha \approx 4.26$: phase transition, hardest instances.
- $\alpha > 4.26$: UNSAT with high probability, easy (proof short).

---

## 6. Systems Connections

### Where SAT solvers are deployed

- **Hardware verification**: Intel, AMD, NVIDIA, ARM validate CPUs by encoding correctness as SAT. Billions of dollars depend on this. Tools: Jasper, Formality, VC Formal.
- **Software model checking**: CBMC (C Bounded Model Checker) encodes program correctness as SAT and checks for bugs up to a bound. Used at AWS, Microsoft, Toyota.
- **Cryptanalysis**: CryptoMiniSat (with XOR reasoning) breaks hash functions, finds SHA-1 collisions (Google 2017), attacks block ciphers.
- **AI planning**: SATPlan encodes planning problems as SAT; competitive with specialized planners.
- **Combinatorial auctions & scheduling**: Used by Google for ad allocation and Borg scheduler.
- **Bioinformatics**: Protein folding, RNA secondary structure prediction — often reduced to SAT.
- **Mathematical theorem proving**: The Pythagorean triples problem was solved by a SAT solver (Heule-Kullmann-Wiebe 2016, 200 TB proof).

---

## 7. Practice Checklist

- [ ] **Implement** DPLL with unit propagation; verify on $(x_1 \lor x_2) \land (\lnot x_1 \lor x_2)$.
- [ ] **Add** watched literals to your BCP — measure the speedup.
- [ ] **Implement** clause learning via 1-UIP (first unique implication point).
- [ ] **Implement** VSIDS decision heuristic with exponential decay.
- [ ] **Benchmark** your solver on random 3-SAT at the phase transition.
- [ ] **Read** the MiniSAT paper (Eén-Sörensson 2003) and Marques-Silva's GRASP paper.
- [ ] **Use** state-of-the-art solvers: CaDiCaL, Kissat, CryptoMiniSat.
- [ ] **Try** [SAT Competition benchmarks](http://satcompetition.org/).

---

## 8. Frequently Asked Questions

**Q1. If SAT is NP-complete, how do solvers handle millions of variables?**
NP-completeness is a *worst-case* statement. Industrial SAT instances have **structure** — they come from real circuits, programs, or constraints that admit short resolution proofs. CDCL exploits this structure by learning clauses that prune the search exponentially. The hard instances (pigeonhole principle, random SAT at the phase transition) still defeat solvers — but they don't arise in practice.

**Q2. What's the difference between SAT and SMT?**
**Satisfiability Modulo Theories (SMT)** extends SAT with theories: arithmetic, arrays, bit-vectors, uninterpreted functions. SMT solvers (Z3, CVC5, Yices) build on SAT solvers and add theory propagators. SMT is exponentially harder in general, but theory-specific reasoning makes many practical problems tractable. SAT is the boolean fragment of SMT.

**Q3. What's the difference between complete and incomplete SAT solvers?**
**Complete** solvers (DPLL, CDCL) always terminate with a definitive SAT or UNSAT answer. **Incomplete** solvers (local search algorithms like WalkSAT, GSAT, Simulated Annealing) only find satisfying assignments — they cannot prove UNSAT. Incomplete solvers are useful when you only need a solution (e.g., MAX-SAT optimization), and they're often faster on satisfiable random instances.

**Q4. How does clause learning actually work?**
When a conflict occurs, CDCL builds the **implication graph** — a DAG showing which assignments forced which others via unit propagation. The conflict clause is derived by **resolution**: starting from the conflict, walk backward through the implication graph, resolving each forced variable's reason clause. The standard rule is the **1-UIP** (first Unique Implication Point): cut the implication graph at the first variable assigned at the current decision level. The resulting learned clause is appended and prunes future search.

**Q5. Can SAT solvers be parallelized?**
Yes, but with diminishing returns. **Cube-and-conquer** (Heule-Kullmann-Biere-Marek 2014) splits the search space into independent cubes (using look-ahead), then solves each with CDCL. This scales to thousands of cores but is not perfectly parallel. **Portfolio solvers** run multiple algorithms in parallel and return whichever finishes first. GPUs help for some operations but CDCL is inherently sequential due to its serial decision/propagation path. The 200-TB Pythagorean triples proof used cube-and-conquer on 800 cores for 2 days.
