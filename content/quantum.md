# Quantum Complexity (BQP) — Bounds on Quantum Power

> A quantum computer exploits superposition, entanglement, and interference to solve some problems exponentially faster than any known classical algorithm. But how far does this power reach? The class **BQP** draws the boundary.

---

## 1. Historical Context

The idea of a **quantum computer** was proposed independently by **Richard Feynman** (1981, "Simulating physics with computers") and **David Deutsch** (1985, who defined the **universal quantum Turing machine**). Deutsch's paper introduced the first quantum algorithm with a proven speedup over classical computation (Deutsch's problem).

**Peter Shor's 1994 algorithm** for factoring integers in $O((\log N)^3)$ time on a quantum computer was the watershed: it broke RSA encryption (in principle), and triggered massive funding for quantum computing worldwide. **Lov Grover's 1996 algorithm** gave a quadratic speedup for unstructured search — provably optimal among quantum algorithms.

The complexity class **BQP** (Bounded-error Quantum Polynomial time) was formalized by **Ethan Bernstein and Umesh Vazirani (1993)**, who also gave the first quantum complexity theory. The 1990s saw **Daniel Simon's algorithm** (precursor to Shor's) and the **BB84 quantum key distribution** protocol (Bennett-Brassard 1984).

In the 2000s and 2010s, the field expanded to **quantum supremacy** experiments (Google Sycamore 2019), **quantum error correction** (surface codes), and **variational algorithms** (VQE, QAOA). In 2024, **Microsoft and Quantinuum** demonstrated logical qubits with $1/800$ the error rate of physical qubits.

---

## 2. Core Mathematical Invariants

### Quantum States and Operations

An $n$-qubit quantum state is a unit vector in $\mathbb{C}^{2^n}$:

$$|\psi\rangle = \sum_{x \in \{0,1\}^n} \alpha_x |x\rangle, \qquad \sum_x |\alpha_x|^2 = 1$$

A quantum computation is a sequence of unitary matrices $U_1, U_2, \dots, U_T$ applied to an initial state, followed by a measurement in the computational basis.

### The BQP Class

A language $L$ is in **BQP** if there is a polynomial-time uniform family of quantum circuits $\{C_n\}$ such that:

- If $x \in L$: $\Pr[C_n(x) = 1] \ge \frac{2}{3}$
- If $x \notin L$: $\Pr[C_n(x) = 0] \ge \frac{2}{3}$

The gate set is typically **{Hadamard (H), Phase (T), CNOT}**, which is approximately universal.

### Complexity Class Relationships

$$\text{P} \subseteq \text{BPP} \subseteq \text{BQP} \subseteq \text{PP} \subseteq \text{PSPACE}$$

$$\text{BQP} \subseteq \Sigma_2^P \cap \Pi_2^P \quad \text{(not known)}$$

We know $\text{factoring} \in \text{BQP}$ but not in P (conjecturally). We do **not** know whether $\text{NP} \subseteq \text{BQP}$ — most theorists believe **not**.

```svg
<svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="420" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Where does BQP sit? (open questions)</text>

  <!-- PSPACE -->
  <rect x="30" y="60" width="620" height="320" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="50" y="82" font-family="monospace" font-size="13" fill="#f85149">PSPACE — proven container for BQP</text>

  <!-- PP -->
  <rect x="70" y="110" width="540" height="250" fill="none" stroke="#d2a8ff" stroke-width="2"/>
  <text x="90" y="130" font-family="monospace" font-size="13" fill="#d2a8ff">PP — Adleman-Decker-Bennett et al.: BQP ⊆ PP</text>

  <!-- NP (overlap region unclear) -->
  <rect x="100" y="160" width="240" height="170" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="120" y="180" font-family="monospace" font-size="13" fill="#3fb950">NP — classical verify</text>

  <!-- BQP (overlap region unclear) -->
  <rect x="280" y="180" width="300" height="130" fill="none" stroke="#f0883e" stroke-width="2.5"/>
  <text x="300" y="200" font-family="monospace" font-size="13" fill="#f0883e">BQP — quantum poly-time</text>

  <!-- BPP / P -->
  <rect x="320" y="230" width="220" height="60" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="340" y="252" font-family="monospace" font-size="12" fill="#58a6ff">BPP ⊇ P</text>
  <text x="340" y="275" font-family="monospace" font-size="11" fill="#8b949e">(randomized classical)</text>

  <!-- Highlight: NP ∩ BQP unclear -->
  <circle cx="290" cy="245" r="30" fill="none" stroke="#f85149" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="290" y="320" text-anchor="middle" font-family="monospace" font-size="10" fill="#f85149">NP ∩ BQP?</text>

  <text x="340" y="400" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">P ⊆ BPP ⊆ BQP ⊆ PP ⊆ PSPACE. Is NP ⊆ BQP? Believed NO. Is BQP ⊆ NP? Also open.</text>
</svg>
```

### Key Quantum Algorithms

| Algorithm | Problem | Speedup | Complexity |
|-----------|---------|---------|------------|
| **Deutsch-Jozsa** | Constant vs balanced | Exp. (vs determinism; only poly vs random) | 1 query |
| **Simon** | Find hidden period | Exp. over classical | $O(n)$ queries |
| **Shor** | Factoring, discrete log | Exp. over known classical | $O((\log N)^3)$ |
| **Grover** | Unstructured search | Quadratic | $O(\sqrt{N})$ |
| **Quantum counting** | Estimate # solutions | Quadratic | $O(\sqrt{N/k})$ |
| **HHL** | Linear systems $Ax = b$ | Exp. (with caveats) | $O(\log n \cdot \kappa^2)$ |
| **QAOA / VQE** | Combinatorial optimization | Heuristic | varies |

### The Tensor Network View

A quantum circuit is equivalent to a **tensor network contraction**. Computing the output probability of an $n$-qubit, depth-$d$ circuit is:

- **#P-hard** in general (strongly believed intractable).
- **BPP**-complete if the depth is constant and the geometry is light-cone-limited.

This is why **random quantum circuit sampling** is the leading candidate for **quantum supremacy** experiments.

---

## 3. Step-by-Step Execution Trace

### Grover's Algorithm: Searching $\{0,1,\dots,15\}$ for target $|1011\rangle$

$N = 16$ elements, so $\sqrt{N} = 4$ iterations suffice. Each iteration consists of:
1. Apply the **oracle** $O$: flips the phase of the target.
2. Apply the **diffusion** operator $D = 2|s\rangle\langle s| - I$.

| Iteration | Amplitude of $|1011\rangle$ | Amplitude of others |
|-----------|----------------------------|---------------------|
| 0 | $1/4$ (uniform) | $1/4$ each |
| 1 | $1/4 + 2 \cdot \frac{1}{4} \cdot \frac{15}{16} - \frac{1}{4}$ ≈ ... amplitude grows | shrinks |
| 2 | grows further | shrinks |
| 3 | nearly 1 | nearly 0 |
| 4 | measure → $|1011\rangle$ with high probability | |

Exact recurrence: $a_{t+1} = (1 - \frac{2}{N}) a_t + \frac{2(N-1)}{N} b_t$, $b_{t+1} = -\frac{2}{N} a_t + (1 - \frac{2(N-1)}{N}) b_t$. After $T = \lfloor \frac{\pi}{4} \sqrt{N} \rfloor$ iterations, success probability is $\ge 1 - \frac{1}{N}$.

### Shor's Algorithm: Trace for $N = 15$, find factor

| Step | Action | Result |
|------|--------|--------|
| 1 | Pick random $a \in [2, N-1]$, say $a = 7$ | $\gcd(7, 15) = 1$, OK |
| 2 | Find order $r$: smallest $r$ with $a^r \equiv 1 \pmod{15}$ | $7^1=7, 7^2=4, 7^3=13, 7^4=1$, so $r = 4$ |
| 3 | Check $r$ is even | Yes |
| 4 | Compute $a^{r/2} = 7^2 = 49 \equiv 4 \pmod{15}$ | |
| 5 | $\gcd(a^{r/2} \pm 1, N) = \gcd(3, 15) = 3, \gcd(5, 15) = 5$ | Factors: **3, 5** |

The classical bottleneck is step 2 (finding the order); this is where quantum period-finding via QFT gives the exponential speedup.

```svg
<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="360" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Shor's Algorithm Pipeline</text>

  <text x="40" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">Input: N to factor.</text>

  <rect x="40" y="100" width="600" height="40" fill="#21262d" stroke="#3fb950"/>
  <text x="340" y="125" text-anchor="middle" font-family="monospace" font-size="12" fill="#3fb950">1. Pick random a coprime to N (classical, gcd check)</text>

  <rect x="40" y="150" width="600" height="40" fill="#21262d" stroke="#f0883e"/>
  <text x="340" y="175" text-anchor="middle" font-family="monospace" font-size="12" fill="#f0883e">2. QUANTUM: find period r of a^x mod N via QFT</text>

  <rect x="40" y="200" width="600" height="40" fill="#21262d" stroke="#58a6ff"/>
  <text x="340" y="225" text-anchor="middle" font-family="monospace" font-size="12" fill="#58a6ff">3. If r is odd or a^(r/2) ≡ -1: retry with new a</text>

  <rect x="40" y="250" width="600" height="40" fill="#21262d" stroke="#d2a8ff"/>
  <text x="340" y="275" text-anchor="middle" font-family="monospace" font-size="12" fill="#d2a8ff">4. Compute gcd(a^(r/2) ± 1, N) — these are factors</text>

  <text x="40" y="320" font-family="monospace" font-size="13" fill="#3fb950">Success probability: ≥ 1/2 per trial. Repeat log(1/δ) times.</text>
  <text x="40" y="345" font-family="monospace" font-size="11" fill="#8b949e">Time: O((log N)^3) on a quantum computer, vs subexponential (L-notation) classical.</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: Simulating Grover's Algorithm on a Small State Vector

```cpp
#include <bits/stdc++.h>
using namespace std;

// Simulate Grover's algorithm on N = 2^n elements with a single marked item.
typedef vector<complex<double>> State;

int N;  // dimension = 2^n

void apply_oracle(State& psi, int target) {
    // Flip phase of |target⟩
    psi[target] = -psi[target];
}

void apply_diffusion(State& psi) {
    // D = 2|s⟩⟨s| - I, where |s⟩ = uniform superposition
    int n = psi.size();
    complex<double> mean(0);
    for (auto& a : psi) mean += a;
    mean /= (double)n;
    for (auto& a : psi) a = 2.0 * mean - a;
}

void grovers_search(int n, int target) {
    N = 1 << n;
    State psi(N, 1.0 / sqrt(N));

    int iterations = (int)(M_PI / 4.0 * sqrt(N));
    for (int t = 0; t < iterations; t++) {
        apply_oracle(psi, target);
        apply_diffusion(psi);
    }

    // Measure (here: report argmax)
    int best = 0;
    double best_prob = 0;
    for (int i = 0; i < N; i++) {
        double p = norm(psi[i]);
        if (p > best_prob) { best_prob = p; best = i; }
    }
    cout << "Grover found: " << best << " (target " << target
         << ") with probability " << best_prob << "\n";
}

int main() {
    grovers_search(4, 11);  // 16 elements, target = 11
    // Output: Grover found: 11 (target 11) with probability ~0.999
}
```

### Python: Qiskit-Style Quantum Circuit Simulator (from scratch)

```python
"""
Minimal pure-Python quantum circuit simulator supporting
H, X, CNOT, and measurements.
"""
import numpy as np
from functools import reduce

def tensor(*matrices):
    return reduce(np.kron, matrices)

I = np.eye(2, dtype=complex)
H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)

def apply_gate(psi, gate, target, n):
    """Apply a single-qubit gate to qubit `target` in an n-qubit state."""
    ops = [I] * n
    ops[target] = gate
    full = tensor(*ops)
    return full @ psi

def apply_cnot(psi, control, target_q, n):
    """Apply CNOT(control, target)."""
    # Build via tensor products with appropriate ordering
    N = 1 << n
    out = np.zeros(N, dtype=complex)
    for i in range(N):
        if (i >> control) & 1:
            j = i ^ (1 << target_q)
            out[j] += psi[i]
        else:
            out[i] += psi[i]
    return out

def simulate_bell_state():
    """Create the Bell state (|00⟩ + |11⟩)/√2."""
    psi = np.zeros(4, dtype=complex)
    psi[0] = 1.0
    psi = apply_gate(psi, H, 0, 2)
    psi = apply_cnot(psi, 0, 1, 2)
    return psi

def measure(psi, shots=1000):
    """Sample from the state distribution."""
    probs = np.abs(psi) ** 2
    n_qubits = int(np.log2(len(psi)))
    samples = np.random.choice(len(psi), size=shots, p=probs)
    counts = {}
    for s in samples:
        bitstring = format(s, f'0{n_qubits}b')
        counts[bitstring] = counts.get(bitstring, 0) + 1
    return counts

if __name__ == "__main__":
    np.random.seed(0)
    bell = simulate_bell_state()
    print("Bell state amplitudes:", bell)
    print("Measurements:", measure(bell, shots=10))
    # Expect roughly half "00" and half "11"
```

---

## 5. Asymptotic Time & Space Complexity

| Algorithm | Quantum | Best known classical | Speedup |
|-----------|---------|---------------------|---------|
| Factoring | $O((\log N)^3)$ | $O(2^{(\log N)^{1/3}})$ (NFS) | exponential |
| Discrete log | polylog | subexponential | exponential |
| Unstructured search | $O(\sqrt{N})$ | $\Theta(N)$ | quadratic |
| Element distinctness | $O(N^{2/3})$ | $\Theta(N)$ | polynomial |
| Triangle finding | $O(N^{1.3})$ | $O(N^2)$ | polynomial |
| Linear systems (HHL) | $O(\log n \cdot \text{poly}(\kappa))$ | $O(n^\omega)$ | exponential (with caveats) |
| Simulating quantum physics | poly | exponential | exponential |
| NP-complete (SAT) | $O(2^{n/2})$ via Grover | $O(2^n)$ via brute force | quadratic |

### Key bounds

- **Grover lower bound**: Any quantum algorithm for unstructured search needs $\Omega(\sqrt{N})$ queries (Bennett-Bernstein-Brassard-Vazirani 1997).
- **No quantum speedup for NP-complete**: There is no known polynomial-time quantum algorithm for any NP-complete problem. Most theorists believe **NP ⊄ BQP**.
- **BQP ⊆ PP** (Adleman, Decker, Bennett et al.): Quantum computation can be simulated in classical unbounded-error polynomial time.

---

## 6. Systems Connections

### Where quantum computing is being deployed

- **Cryptography migration**: NIST has standardized **post-quantum cryptography** (Kyber/KEM, Dilithium signatures, Falcon, SPHINCS+) as of 2022-2024. The world is racing to deploy these before large-scale quantum computers break RSA/ECC.
- **Quantum chemistry & materials science**: VQE, quantum phase estimation for ground-state energies. Application: nitrogen fixation (Haber-Bosch catalyst design), battery chemistry.
- **Optimization (heuristic)**: QAOA for Max-Cut, portfolio optimization (JPMorgan, Goldman Sachs experiments), logistics routing.
- **Machine learning**: Quantum kernel methods, variational quantum classifiers — early-stage, no demonstrated advantage yet.
- **Quantum networking**: Quantum key distribution (BB84) over fiber and satellite links (China's Micius satellite, 2017). Quantum repeaters in development.
- **Cloud quantum access**: IBM Quantum, Amazon Braket, Google Quantum AI, IonQ, Quantinuum, Rigetti all provide cloud-based quantum hardware accessible via Python SDKs (Qiskit, Cirq, PyQuil).

---

## 7. Practice Checklist

- [ ] **Prove** BPP ⊆ BQP (a quantum computer can simulate classical randomness).
- [ ] **Implement** Grover's algorithm on a 4-qubit simulator and verify the iteration count.
- [ ] **Derive** the success probability of Grover as a function of iterations.
- [ ] **Implement** the quantum Fourier transform on $n$ qubits.
- [ ] **Show** BQP ⊆ PP via the Feynman path integral / gap amplification argument.
- [ ] **Prove** the BBBV lower bound: unstructured search needs $\Omega(\sqrt{N})$ quantum queries.
- [ ] **Read** Nielsen-Chuang *Quantum Computation and Quantum Information*; Mermin *Quantum Computer Science*.
- [ ] **Try** IBM Quantum Experience — run Grover on real hardware.

---

## 8. Frequently Asked Questions

**Q1. Can a quantum computer solve NP-complete problems efficiently?**
Not as far as anyone knows. Grover's algorithm gives a *quadratic* speedup for unstructured search (so SAT in $O(2^{n/2})$ instead of $O(2^n)$), but no polynomial-time quantum algorithm is known for any NP-complete problem. Most complexity theorists believe **NP ⊄ BQP** — quantum computers probably cannot efficiently solve SAT, TSP, or any other NP-complete problem.

**Q2. What's the difference between BQP and NP?**
NP is about *verifying* solutions classically. BQP is about *finding* solutions quantumly with bounded error. They are fundamentally different: a problem in NP has a short classical certificate; a problem in BQP has a quantum algorithm that succeeds with probability $\ge \frac{2}{3}$. We don't know whether BQP $\subseteq$ NP or NP $\subseteq$ BQP — both are open. Factoring is in both, but no problem is known to be in BQP but not in NP (interactively, factoring is in NP ∩ coNP).

**Q3. What makes factoring amenable to quantum speedup, but not SAT?**
Factoring reduces to **period finding** — finding the period of the modular exponentiation function $f(x) = a^x \bmod N$. Period finding is naturally solved by the quantum Fourier transform because periodic functions have spectral peaks. SAT has no analogous algebraic structure — it's purely combinatorial. Quantum computers exploit structure; without it (as with unstructured search), only the Grover quadratic speedup is possible.

**Q4. How many qubits do we need to break RSA-2048?**
Estimates vary, but roughly **4000-10000 logical qubits** (error-corrected), corresponding to **millions of physical qubits** with current error rates. The best current quantum computers (2024) have ~1000 physical qubits with error rates around $10^{-3}$. So breaking RSA-2048 is at least a decade away for most experts — but the *threat* has already triggered the post-quantum migration.

**Q5. What's the catch with HHL for linear systems?**
HHL (Harrow-Hassidim-Lloyd 2009) solves $Ax = b$ in time $O(\log n \cdot \kappa^2 / \epsilon)$, seemingly exponentially faster than Gaussian elimination. But there are three catches: (1) the matrix $A$ must be sparse and well-conditioned (small $\kappa$); (2) the input vector $b$ must be efficiently loadable as a quantum state (the "QRAM" problem); (3) the output is a quantum state, not a classical vector — you can't read all its entries. So HHL is not a generic linear-systems solver; it's useful only when you need a specific function of $x$ (e.g., an inner product).
