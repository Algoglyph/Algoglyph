# Randomized Algorithms — Probability as a Computational Resource

> Toss a coin, make a choice, succeed with high probability. Randomness can be a *computational resource* as fundamental as time and space — and often beats determinism by polynomial factors.

---

## 1. Historical Context & Motivation

**Michael Rabin** pioneered randomized computation in **1976** with his probabilistic primality test, developed independently by **Gary Miller** (1975). Rabin received the **1976 Turing Award** (in part for this work). Their test was the first practical algorithm for primality running in polynomial time — albeit a *randomized* one with one-sided error.

**Solovay and Strassen (1977)** gave an alternative randomized primality test based on the Jacobi symbol. Both tests run in $O(\log^3 n)$ time and err only with probability $\le \frac{1}{2}$ per trial — amplifiable by repetition.

**Freivalds (1979)** showed that matrix multiplication can be *verified* in $O(n^2)$ time with high probability, even though computing the product takes $O(n^{2.37})$ — a stunning demonstration that *verification can be cheaper than computation*.

The complexity class **BPP** (Bounded-error Probabilistic Polynomial time) was formalized in the early 1980s. A central conjecture — supported by **Impagliazzo-Wigderson (1997)**, who proved $\text{BPP} = \text{P}$ if certain circuit lower bounds hold — is that **BPP = P**. The derandomization program, led by **Nisan, Wigderson, Impagliazzo**, has nearly resolved this.

The PCP theorem (1992) and the **Karp-Lipton-style** results extended randomized techniques to inapproximability. Randomization is now central to algorithms (skip lists, hashing, min-cut), cryptography (zero-knowledge), and distributed computing.

---

## 2. Core Mathematical Invariants

### The Randomized Complexity Classes

| Class | Error type | Accept / Reject behavior |
|-------|------------|--------------------------|
| **RP** (Randomized Polynomial) | One-sided: false positives | $x \in L \Rightarrow$ accept w.p. $\ge \frac{1}{2}$; $x \notin L \Rightarrow$ always reject |
| **coRP** | One-sided: false negatives | Inverse of RP |
| **ZPP** = RP ∩ coRP | Zero error (Las Vegas) | Always correct; expected poly time |
| **BPP** | Two-sided | Accept w.p. $\ge \frac{2}{3}$ if $x \in L$, $\le \frac{1}{3}$ otherwise |
| **PP** | Unbounded error | Accept w.p. $> \frac{1}{2}$ iff $x \in L$ |

### Containments

$$\text{P} \subseteq \text{ZPP} \subseteq \text{RP} \subseteq \text{BPP} \subseteq \text{P}/\text{poly}$$

$$\text{BPP} \subseteq \Sigma_2^P \cap \Pi_2^P \quad (\text{Sipser-Gács-Lautemann})$$

The **Impagliazzo-Wigderson theorem** (1997): if there exists a problem in $\text{E} = \text{DTIME}(2^{O(n)})$ requiring circuits of size $2^{\Omega(n)}$, then $\text{BPP} = \text{P}$.

### The Amplification Lemma

For BPP, repeating an algorithm $k$ times and taking the majority vote drives the error down exponentially:

$$\Pr[\text{majority wrong}] \le \exp(-2k(\tfrac{1}{2} - \tfrac{1}{3})^2) = e^{-k/18}$$

(by **Chernoff bound**). So $k = O(\log \frac{1}{\delta})$ gives error $\le \delta$.

```svg
<svg viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="400" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Randomized Complexity Classes</text>

  <!-- PP -->
  <rect x="30" y="60" width="620" height="310" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="50" y="80" font-family="monospace" font-size="13" fill="#f85149">PP — unbounded error (contains NP)</text>

  <!-- PSPACE -->
  <rect x="60" y="100" width="560" height="250" fill="none" stroke="#d2a8ff" stroke-width="2"/>
  <text x="80" y="120" font-family="monospace" font-size="13" fill="#d2a8ff">PSPACE</text>

  <!-- BPP -->
  <rect x="100" y="150" width="480" height="180" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="120" y="170" font-family="monospace" font-size="13" fill="#3fb950">BPP — bounded two-sided error (≈ P, conjecturally)</text>

  <!-- RP -->
  <rect x="140" y="200" width="400" height="100" fill="none" stroke="#f0883e" stroke-width="2"/>
  <text x="160" y="220" font-family="monospace" font-size="13" fill="#f0883e">RP ∪ coRP — one-sided error</text>

  <!-- ZPP -->
  <rect x="200" y="250" width="280" height="40" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="220" y="275" font-family="monospace" font-size="12" fill="#58a6ff">ZPP — Las Vegas (zero error)</text>

  <!-- P -->
  <circle cx="340" cy="290" r="6" fill="#58a6ff"/>

  <text x="340" y="385" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">P ⊆ ZPP ⊆ RP ⊩ BPP ⊆ P/poly. Conjectured: BPP = P (Impagliazzo-Wigderson).</text>
</svg>
```

### Pseudorandom Generators (PRGs)

A PRG $G: \{0,1\}^s \to \{0,1\}^n$ stretches a short random seed to a long "pseudorandom" string indistinguishable from truly random by polynomial-time algorithms. If we have a PRG that fools BPP algorithms, then we can derandomize them: try all $2^s$ seeds (only polynomially many).

The **Nisan-Wigderson generator** (1994) achieves this under hardness assumptions, giving $\text{BPP} \subseteq \text{DTIME}(2^{(\log n)^{O(1)}})$.

---

## 3. Step-by-Step Execution Trace

### Miller-Rabin Primality Test on $n = 561$ (the smallest Carmichael number)

$561 = 3 \cdot 11 \cdot 17$. Carmichael numbers fool the Fermat test but not Miller-Rabin.

| Step | Action | Result |
|------|--------|--------|
| 1 | $n - 1 = 560 = 2^4 \cdot 35$, so $s = 4, d = 35$ | |
| 2 | Pick random $a \in [2, n-2]$, say $a = 2$ | |
| 3 | Compute $x = a^d \bmod n = 2^{35} \bmod 561$ | $2^{35} \bmod 561 = 263$ |
| 4 | Is $x \equiv 1 \pmod n$ or $x \equiv -1$? No | Continue |
| 5 | Square: $x = 263^2 \bmod 561 = 166$ | Is $x \equiv -1$? No |
| 6 | Square: $x = 166^2 \bmod 561 = 67$ | Is $x \equiv -1$? No |
| 7 | Square: $x = 67^2 \bmod 561 = 1$ | The previous value was neither $1$ nor $-1$, so this nontrivial square root of $1$ proves compositeness |
| 8 | **Witness found: $n$ is composite.** | Probability this fails for composite $n$ is $\le \frac{1}{4}$ |

### Freivalds' Matrix Multiplication Verification

Given $A, B, C \in \mathbb{F}^{n \times n}$, verify $AB = C$ without computing $AB$.

1. Pick random $x \in \{0,1\}^n$, each entry uniform in $\{0,1\}$.
2. Compute $y = A(Bx) - Cx$ in $O(n^2)$ time.
3. If $y \ne 0$, output "WRONG". Otherwise output "CORRECT".

**Soundness**: if $AB \ne C$, then $D = AB - C \ne 0$, so some row of $D$ is nonzero. For that row, $\Pr[D_i \cdot x = 0] \le \frac{1}{2}$ by **Schwartz-Zippel**. So the verifier catches the bug with probability $\ge \frac{1}{2}$ — repeat $k$ times for error $\le 2^{-k}$.

```svg
<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="320" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Freivalds: Verify AB = C in O(n^2) randomized</text>

  <text x="40" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">Given A, B, C ∈ F^(n×n), check AB = C?</text>

  <text x="40" y="120" font-family="monospace" font-size="13" fill="#3fb950">1. Sample random x ∈ {0,1}^n.</text>
  <text x="40" y="145" font-family="monospace" font-size="13" fill="#3fb950">2. Compute y = A·(B·x) - C·x in O(n^2).</text>
  <text x="40" y="170" font-family="monospace" font-size="13" fill="#3fb950">3. If y ≠ 0: AB ≠ C (certain).</text>
  <text x="40" y="195" font-family="monospace" font-size="13" fill="#3fb950">4. If y = 0: AB = C with prob ≥ 1 - 1/|F|.</text>

  <text x="40" y="240" font-family="monospace" font-size="13" fill="#f0883e">Repeat k times → error ≤ |F|^(-k).</text>
  <text x="40" y="270" font-family="monospace" font-size="13" fill="#8b949e">Schwartz-Zippel: for nonzero D, Pr[D·x = 0] ≤ 1/|F|.</text>
  <text x="40" y="295" font-family="monospace" font-size="11" fill="#8b949e">Randomization beats Strassen's O(n^2.37) when we only need to VERIFY.</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: Miller-Rabin Primality Test

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef __int128 lll;
typedef long long ll;

lll mod_pow(lll a, lll b, lll m) {
    lll r = 1; a %= m;
    while (b > 0) {
        if (b & 1) r = r * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return r;
}

bool miller_rabin_witness(lll n, lll a) {
    if (n < 2) return false;
    if (n % a == 0) return n == a;
    lll d = n - 1; int s = 0;
    while (d % 2 == 0) { d /= 2; s++; }
    lll x = mod_pow(a, d, n);
    if (x == 1 || x == n - 1) return true;
    for (int i = 0; i < s - 1; i++) {
        x = x * x % n;
        if (x == n - 1) return true;
    }
    return false;
}

bool is_prime(lll n, int rounds = 40) {
    if (n < 2) return false;
    for (lll p : {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}) {
        if (n == p) return true;
        if (n % p == 0) return false;
    }
    mt19937_64 rng(chrono::steady_clock::now().time_since_epoch().count());
    for (int i = 0; i < rounds; i++) {
        lll a = 2 + rng() % (n - 3);
        if (!miller_rabin_witness(n, a)) return false;
    }
    return true;
}

int main() {
    vector<ll> tests = {561, 563, 1105, 1729, 7919, 104729, 999999999989LL};
    for (ll n : tests) {
        cout << n << " is " << (is_prime(n) ? "PRIME" : "COMPOSITE") << "\n";
    }
    // 561: COMPOSITE (Carmichael), 563: PRIME, 1105: COMPOSITE,
    // 1729: COMPOSITE (Ramanujan), 7919: PRIME, 104729: PRIME (10000th prime)
}
```

### Python: Freivalds' Matrix Multiplication Verification

```python
import random

def matmul(A, B):
    """Naive matrix multiplication for completeness."""
    n = len(A)
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
    return C

def matvec(A, x):
    """Matrix-vector product, O(n^2)."""
    return [sum(A[i][j] * x[j] for j in range(len(x))) for i in range(len(A))]

def freivalds_verify(A, B, C, field_size=2, repetitions=20):
    """
    Verify AB = C in O(n^2 * repetitions).
    Error probability per rep: 1/field_size.
    """
    n = len(A)
    for _ in range(repetitions):
        x = [random.randrange(field_size) for _ in range(n)]
        # y = A(Bx) - Cx
        Bx = matvec(B, x)
        ABx = matvec(A, Bx)
        Cx = matvec(C, x)
        y = [(ABx[i] - Cx[i]) % field_size for i in range(n)]
        if any(yi != 0 for yi in y):
            return False  # definitely AB != C
    return True  # AB = C with high probability

# Test
n = 5
random.seed(0)
A = [[random.randint(0, 9) for _ in range(n)] for _ in range(n)]
B = [[random.randint(0, 9) for _ in range(n)] for _ in range(n)]
C_correct = matmul(A, B)
C_wrong = [row[:] for row in C_correct]
C_wrong[0][0] = (C_wrong[0][0] + 1) % 10

print("Verify correct product:", freivalds_verify(A, B, C_correct))
print("Verify wrong product:  ", freivalds_verify(A, B, C_wrong))
```

---

## 5. Asymptotic Time & Space Complexity

| Algorithm | Type | Time | Error |
|-----------|------|------|-------|
| Miller-Rabin primality | RP / coRP | $O(k \log^3 n)$ | $\le 4^{-k}$ |
| Freivalds matrix verify | RP | $O(k n^2)$ | $\le 2^{-k}$ |
| Karger's min cut | Monte Carlo | $O(n^2 \log n)$ per trial | $O(1/n)$ |
| Randomized Quicksort | Las Vegas | $O(n \log n)$ expected | 0 (always correct) |
| Pollard's rho factoring | Las Vegas | $O(n^{1/4})$ expected | 0 |
| Randomized bipartite matching | Las Vegas | $O(n^{2.5})$ expected | 0 |
| Hashing (universal) | Las Vegas expected | $O(1)$ | 0 |

### Derandomization

If $\text{BPP} = \text{P}$, every probabilistic polynomial-time algorithm can be replaced by a deterministic one with at most polynomial overhead. The Impagliazzo-Wigderson result reduces this question to circuit lower bounds.

---

## 6. Systems Connections

### Where randomness is indispensable in practice

- **Cryptography**: Every key exchange, signature scheme, and encryption relies on randomness. **/dev/urandom** and hardware RNGs (Intel RDRAND) provide entropy.
- **Hash tables**: Randomized hashing (universal hashing) avoids adversarial collisions; this is the basis of `std::unordered_map` guarantees.
- **Load balancing**: Randomized rounding, power-of-two-choices strategies in distributed systems (Yahoo, Google).
- **Skip lists** (William Pugh 1990): Randomized alternative to balanced trees with $O(\log n)$ expected operations. Used in Redis, LevelDB.
- **Monte Carlo simulations**: Physics (nuclear, fluid dynamics), quantitative finance (option pricing), all rely on randomized sampling.
- **Machine learning**: Stochastic gradient descent, dropout, random forests all rely on randomness — without it, training is brittle and overfits.
- **Markov Chain Monte Carlo (MCMC)**: Foundation of Bayesian inference; the algorithm is a random walk over the state space.

---

## 7. Practice Checklist

- [ ] **Prove** amplification for BPP using Chernoff bounds.
- [ ] **Implement** Miller-Rabin and test on Carmichael numbers (561, 1105, 1729).
- [ ] **Derive** Freivalds' $O(n^2)$ verification using Schwartz-Zippel.
- [ ] **Implement** Karger's randomized min-cut algorithm.
- [ ] **Show** $\text{BPP} \subseteq \Sigma_2^P \cap \Pi_2^P$ (Sipser-Gács-Lautemann).
- [ ] **Explain** why $\text{BPP} = \text{P}$ is conjectured via Impagliazzo-Wigderson.
- [ ] **Read** Motwani-Raghavan *Randomized Algorithms*; Mitzenmacher-Upfal *Probability and Computing*.
- [ ] **Try** implementing a universal hash family.

---

## 8. Frequently Asked Questions

**Q1. What's the difference between Las Vegas and Monte Carlo algorithms?**
**Las Vegas** algorithms always return the correct answer but have a *random running time* (e.g., Randomized Quicksort, Pollard's rho). They define the class **ZPP** (zero-error probabilistic polynomial). **Monte Carlo** algorithms have a fixed running time but may err with bounded probability (e.g., Miller-Rabin). They define **BPP** and **RP**. Las Vegas is preferable when correctness is critical; Monte Carlo when time is critical.

**Q2. Is randomness really necessary, or can we always derandomize?**
We believe $\text{BPP} = \text{P}$ — i.e., randomness doesn't add polynomial-time power — but we can't yet prove it for all BPP algorithms. The Impagliazzo-Wigderson theorem reduces this to circuit lower bounds: if any explicit function in E requires exponential-size circuits, then BPP = P. Practical derandomization uses pseudorandom generators (PRGs) like Nisan-Wigderson.

**Q3. Why does the Miller-Rabin test have one-sided error?**
If $n$ is prime, Miller-Rabin always returns "prime" (no false negatives). If $n$ is composite, each random witness catches it with probability $\ge \frac{3}{4}$. Hence Miller-Rabin is in **coRP** for the language PRIMES. After AKS (2002), we know PRIMES ∈ P — but Miller-Rabin is still far faster in practice.

**Q4. How do you generate truly random bits on a deterministic computer?**
You can't — but you can collect *entropy* from physical sources (clock jitter, keystroke timing, thermal noise, quantum effects) and feed it into a cryptographically secure PRG. `/dev/urandom` on Linux does this, accumulating entropy and using ChaCha20 to expand it. Modern Intel CPUs have `RDRAND`/`RDSEED` instructions that sample quantum noise on the chip.

**Q5. What's the role of randomness in cryptography?**
It's foundational. Every encryption scheme needs random nonces; every signature needs random blinding; every zero-knowledge proof needs random challenges; every key generation needs random bits. If randomness is predictable or biased (e.g., the Debian OpenSSL bug of 2008), the entire cryptographic system collapses. Cryptographic randomness is also the basis of pseudorandom functions (PRFs), which underlie symmetric ciphers like AES.
