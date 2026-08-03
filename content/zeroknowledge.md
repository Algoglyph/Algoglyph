# Zero-Knowledge Proofs — Verification Without Revelation

> "I can prove to you that I know a secret, in such a way that you learn absolutely nothing about the secret itself." Zero-knowledge proofs turn verification into an information-theoretic paradox.

---

## 1. Historical Context

**Zero-knowledge proofs (ZKPs)** were introduced in the landmark **1985 paper "The Knowledge Complexity of Interactive Proof Systems"** by **Shafi Goldwasser, Silvio Micali, and Charles Rackoff**. The paper introduced three orthogonal properties — **completeness, soundness, zero-knowledge** — that have since defined the field. Goldwasser and Micali received the **2012 Turing Award** for this work.

A pivotal follow-up was the **Goldreich-Micali-Wigderson (GMW) 1986 paper**, which proved that every language in **NP** has a zero-knowledge proof under the assumption that **one-way functions exist**. They demonstrated this by giving a ZKP for **Graph 3-Coloring** — an NP-complete problem — which by reduction extends ZK to all of NP.

The field exploded in the 2010s with the invention of **succinct ZK arguments**:
- **Groth16** (2016): extremely short proofs (~200 bytes), fast verification, but a trusted setup.
- **PLONK** (2019): universal and updatable trusted setup.
- **STARKs** (2018, Ben-Sasson et al.): transparent (no trusted setup), post-quantum, but larger proofs.
- **Bulletproofs** (2018): no trusted setup, short proofs, but slower verification.

These power **zk-Rollups** on Ethereum (zkSync, Scroll, StarkNet, Polygon zkEVM) and privacy coins (Zcash, Tornado Cash conceptually).

---

## 2. Core Mathematical Invariants

### Three Properties

A zero-knowledge proof system for language $L$ satisfies:

1. **Completeness**: If $x \in L$, an honest prover convinces an honest verifier with probability $\ge \frac{2}{3}$.
2. **Soundness**: If $x \notin L$, no cheating prover convinces the verifier with probability $> \frac{1}{3}$.
3. **Zero-knowledge**: There exists a polynomial-time **simulator** $S$ such that for every verifier $V^*$, the output of $V^*$ interacting with the honest prover is *computationally indistinguishable* from $S(x)$.

$$\text{View}_{P,V^*}(x) \approx_c S(x) \quad (\text{or } \approx_s \text{ for statistical ZK})$$

### Variants by ZK strength

| Type | Simulator indistinguishability | Cryptographic assumption |
|------|--------------------------------|--------------------------|
| **Computational ZK** | Computational | one-way functions |
| **Statistical ZK (SZK)** | Statistical (negligible gap) | none |
| **Perfect ZK** | Identical distribution | none |
| **Zero-knowledge with auxiliary input** | Robust to any auxiliary info | standard |

### Commitment Schemes

Most ZK protocols rely on a **commitment scheme** with two properties:
- **Binding**: After committing, the prover cannot change the committed value.
- **Hiding**: The commitment reveals nothing about the value before opening.

$$\text{Commit}(m; r) = c \qquad \text{Open}(c, m, r) \in \{0, 1\}$$

The classic example is **Pedersen commitments**: $C = g^m h^r \pmod p$, which is perfectly hiding and computationally binding under the discrete-log assumption.

```svg
<svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="420" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Zero-Knowledge Protocol Skeleton</text>

  <!-- Prover -->
  <rect x="30" y="70" width="280" height="320" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="170" y="92" text-anchor="middle" font-family="monospace" font-size="13" fill="#58a6ff" font-weight="bold">PROVER P</text>
  <text x="170" y="112" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">knows witness w</text>
  <text x="50" y="145" font-family="monospace" font-size="11" fill="#3fb950">1. Pick random r, compute</text>
  <text x="50" y="163" font-family="monospace" font-size="11" fill="#3fb950">   commitment a = Commit(r)</text>
  <text x="50" y="200" font-family="monospace" font-size="11" fill="#3fb950">3. Receive challenge c</text>
  <text x="50" y="220" font-family="monospace" font-size="11" fill="#3fb950">4. Compute response</text>
  <text x="50" y="238" font-family="monospace" font-size="11" fill="#3fb950">   z = f(w, r, c)</text>
  <text x="50" y="280" font-family="monospace" font-size="11" fill="#3fb950">5. Send z</text>

  <!-- Verifier -->
  <rect x="370" y="70" width="280" height="320" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="510" y="92" text-anchor="middle" font-family="monospace" font-size="13" fill="#f0883e" font-weight="bold">VERIFIER V</text>
  <text x="510" y="112" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">randomized, polynomial time</text>
  <text x="390" y="165" font-family="monospace" font-size="11" fill="#d2a8ff">2. Receive commitment a</text>
  <text x="390" y="200" font-family="monospace" font-size="11" fill="#d2a8ff">   Pick random challenge c</text>
  <text x="390" y="220" font-family="monospace" font-size="11" fill="#d2a8ff">   Send c to P</text>
  <text x="390" y="280" font-family="monospace" font-size="11" fill="#d2a8ff">6. Receive z</text>
  <text x="390" y="300" font-family="monospace" font-size="11" fill="#d2a8ff">   Verify V(a, c, z) = 1</text>

  <!-- Arrows -->
  <line x1="310" y1="160" x2="370" y2="160" stroke="#3fb950" stroke-width="2" marker-end="url(#aar)"/>
  <text x="340" y="152" text-anchor="middle" font-family="monospace" font-size="10" fill="#3fb950">a</text>
  <line x1="370" y1="210" x2="310" y2="210" stroke="#d2a8ff" stroke-width="2" marker-end="url(#aar)"/>
  <text x="340" y="202" text-anchor="middle" font-family="monospace" font-size="10" fill="#d2a8ff">c</text>
  <line x1="310" y1="285" x2="370" y2="285" stroke="#3fb950" stroke-width="2" marker-end="url(#aar)"/>
  <text x="340" y="277" text-anchor="middle" font-family="monospace" font-size="10" fill="#3fb950">z</text>

  <defs>
    <marker id="aar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3fb950"/>
    </marker>
  </defs>

  <text x="340" y="410" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Commit-challenge-response: Sigma protocol structure.</text>
</svg>
```

### The Sigma Protocol Format

Most ZK proofs for NP follow a 3-move **Sigma protocol** structure:

1. **Commitment** $a$: prover commits to random info.
2. **Challenge** $c$: verifier sends random bits.
3. **Response** $z$: prover opens parts of the commitment conditioned on $c$.

**Special soundness**: From any two accepting transcripts $(a, c, z)$ and $(a, c', z')$ with $c \ne c'$, one can extract the witness $w$. This guarantees the prover actually *knows* $w$.

---

## 3. Step-by-Step Execution Trace

### Schnorr's Protocol: Prove Knowledge of Discrete Log

Let $p$ be a large prime, $g$ a generator of a group of order $q$. Public: $y = g^x \pmod p$. Prover wants to convince verifier they know $x$.

| Step | Prover | Verifier |
|------|--------|----------|
| 1 | Pick random $r \in \mathbb{Z}_q$. Compute $t = g^r$. | |
| 2 | | Pick random $c \in \mathbb{Z}_q$. Send $c$. |
| 3 | Compute $s = r + c \cdot x \pmod q$. Send $s$. | |
| 4 | | Check $g^s \stackrel{?}{=} t \cdot y^c \pmod p$. |

**Verification math**: $g^s = g^{r + cx} = g^r \cdot (g^x)^c = t \cdot y^c$. ✓

**Zero-knowledge**: A simulator who doesn't know $x$ can pick random $s, c$ first, then compute $t = g^s \cdot y^{-c}$. The transcript $(t, c, s)$ has the same distribution as a real one — so the verifier learns nothing.

### GMW Graph 3-Coloring Protocol (Conceptual Trace)

Prove that graph $G$ is 3-colorable without revealing the coloring.

| Round | Action |
|-------|--------|
| 1 | Prover picks a random permutation $\pi$ of colors, commits to $\pi(c_v)$ for each vertex $v$. |
| 2 | Verifier picks a random edge $(u, v)$. |
| 3 | Prover opens the commitments for $u$ and $v$. |
| 4 | Verifier checks the two colors are different. |

Repeating $O(|E|^2)$ times drives soundness error to negligible. If $G$ is not 3-colorable, every round has at least one edge where colors clash, and the verifier catches it with probability $\ge 1/|E|$.

---

## 4. Production-Ready Implementations

### C++: Schnorr Identification Protocol (Pedersen-style)

```cpp
#include <bits/stdc++.h>
using namespace std;

// Modular arithmetic helpers.
long long mod_pow(long long a, long long b, long long m) {
    long long r = 1; a %= m;
    while (b > 0) {
        if (b & 1) r = (__int128)r * a % m;
        a = (__int128)a * a % m;
        b >>= 1;
    }
    return r;
}

// Schnorr identification: prover knows x such that y = g^x mod p.
struct Schnorr {
    long long p, q, g;  // p prime, q prime dividing p-1, g has order q
};

struct Prover {
    Schnorr params;
    long long x;  // secret witness

    // Step 1: commit
    pair<long long, long long> commit() {
        // Random r in [1, q)
        r = 1 + rand() % (params.q - 1);
        long long t = mod_pow(params.g, r, params.p);
        return {t, r};
    }
    // Step 3: respond
    long long respond(long long c) {
        return (r + c % params.q * x) % params.q;
    }
private:
    long long r;
};

struct Verifier {
    Schnorr params;
    long long y;  // public key

    long long challenge() {
        return rand() % params.q;
    }
    bool verify(long long t, long long c, long long s) {
        long long lhs = mod_pow(params.g, s, params.p);
        long long rhs = (__int128)t * mod_pow(y, c, params.p) % params.p;
        return lhs == rhs;
    }
};

int main() {
    // Small demo params (NOT secure — for educational use only)
    Schnorr s{23, 11, 2};  // p=23, q=11, g=2
    long long x = 3;       // secret
    long long y = mod_pow(2, 3, 23);  // y = 8

    Prover p{s, x};
    Verifier v{s, y};

    auto [t, r] = p.commit();
    long long c = v.challenge();
    long long resp = p.respond(c);
    bool ok = v.verify(t, c, resp);
    cout << "Schnorr proof: " << (ok ? "ACCEPT" : "REJECT") << "\n";
}
```

### Python: Graph 3-Coloring ZK Protocol

```python
"""
Zero-knowledge proof for Graph 3-Coloring (GMW protocol).
Educational version using hash-based commitments.
"""
import random
import hashlib

def H(*args):
    """Simple hash-based commitment."""
    s = "|".join(str(a) for a in args).encode()
    return hashlib.sha256(s).hexdigest()

class ZK3Coloring:
    def __init__(self, graph, coloring):
        self.graph = graph   # list of edges
        self.coloring = coloring  # dict vertex -> color in {0,1,2}

    def prover_commit(self):
        """Permute colors randomly and commit."""
        perm = list(range(3))
        random.shuffle(perm)
        self.perm = perm
        self.coloring_perm = {v: perm[c] for v, c in self.coloring.items()}
        self.nonces = {v: random.randint(0, 1 << 64) for v in self.coloring}
        self.commitments = {
            v: H(v, self.coloring_perm[v], self.nonces[v])
            for v in self.coloring
        }
        return self.commitments

    def verifier_challenge(self):
        """Pick a random edge to open."""
        return random.choice(self.graph)

    def prover_open(self, edge):
        u, v = edge
        return {
            'u_color': self.coloring_perm[u], 'u_nonce': self.nonces[u],
            'v_color': self.coloring_perm[v], 'v_nonce': self.nonces[v],
        }

    def verifier_check(self, edge, opening, commitments):
        u, v = edge
        if H(u, opening['u_color'], opening['u_nonce']) != commitments[u]:
            return False
        if H(v, opening['v_color'], opening['v_nonce']) != commitments[v]:
            return False
        return opening['u_color'] != opening['v_color'] \
               and opening['u_color'] in {0, 1, 2} \
               and opening['v_color'] in {0, 1, 2}

def run_zk_protocol(graph, coloring, rounds=100):
    """Run the protocol k times; accept iff all rounds pass."""
    zk = ZK3Coloring(graph, coloring)
    for _ in range(rounds):
        commitments = zk.prover_commit()
        edge = zk.verifier_challenge()
        opening = zk.prover_open(edge)
        if not zk.verifier_check(edge, opening, commitments):
            return False
    return True

# Triangle graph (3-colorable)
graph = [(0,1), (1,2), (0,2)]
coloring = {0: 0, 1: 1, 2: 2}
ok = run_zk_protocol(graph, coloring)
print(f"ZK 3-coloring proof: {'VALID' if ok else 'INVALID'}")
```

---

## 5. Asymptotic Time & Space Complexity

| Protocol | Rounds | Prover time | Verifier time | Proof size | Assumption |
|----------|--------|-------------|---------------|------------|------------|
| Schnorr identification | 3 | $O(\log p)$ | $O(\log p)$ | $O(\log p)$ | DLP |
| GMW 3-coloring | $O(|E|)$ | $O(|E|)$ | $O(|E|)$ | $O(|E| \log n)$ | OWF |
| Groth16 | 1 (NIZK) | $O(n)$ | $O(1)$ | $\approx 200$ bytes | q-PKE + trusted setup |
| PLONK | 1 (NIZK) | $O(n \log n)$ | $O(1)$ | $\approx 500$ bytes | q-PKE + universal SRS |
| STARK | 1 (NIZK) | $O(n \log n)$ | $O(\log n)$ | $O(\log n)$ | hash-based (post-quantum) |
| Bulletproofs | 1 (NIZK) | $O(n)$ | $O(n)$ | $O(\log n)$ | DLP only |

**Fiat-Shamir transform**: any public-coin interactive ZK proof can be made non-interactive by replacing the verifier's challenges with hashes of the transcript. This is how NIZKs (Non-Interactive Zero-Knowledge proofs) are built in practice.

---

## 6. Systems Connections

### Where ZKPs are deployed today

- **Privacy cryptocurrencies**: Zcash uses zk-SNARKs to shield transactions. Monero uses Bulletproofs for range proofs.
- **Ethereum L2 rollups**: zkSync, StarkNet, Scroll, Polygon zkEVM, Aztec process thousands of transactions off-chain and post a single ZK proof to L1. The L1 verifier is cheap (polynomial-time, often $O(\log n)$).
- **Identity & credentials**: ZK email, anon-aadhaar, and Worldcoin use ZKPs to prove properties (age, citizenship, uniqueness) without revealing the underlying document.
- **Voting & governance**: MACI (Minimal Anti-Collusion Infrastructure) uses ZKPs to make voting private and uncensorable.
- **Compliance**: Proving you're on a whitelist, or that a transaction doesn't touch blacklisted addresses, without revealing your full transaction graph.
- **Trusted setup ceremonies**: Groth16's setup requires multiple participants; each adds randomness. As long as one participant is honest, the setup is secure.

---

## 7. Practice Checklist

- [ ] **Prove** the three properties (completeness, soundness, zero-knowledge) for Schnorr's protocol.
- [ ] **Implement** the simulator for Schnorr (pick $s, c$ random; compute $t$).
- [ ] **Reduce** an NP problem (Hamiltonian cycle) to 3-coloring for the GMW protocol.
- [ ] **Explain** the Fiat-Shamir transform and why it makes protocols non-interactive.
- [ ] **Sketch** why the GMW protocol is zero-knowledge: the simulator picks a random edge first, then "forwards" colors.
- [ ] **Compare** Groth16 vs PLONK vs STARK in terms of trusted setup, post-quantum security, and proof size.
- [ ] **Read** Goldwasser-Micali-Rackoff 1985; Boneh-Shoup *Graduate Course in Applied Cryptography* Ch. 19-20.
- [ ] **Try** building a toy zk-SNARK with arkworks-rs or gnark.

---

## 8. Frequently Asked Questions

**Q1. How can a proof reveal *literally nothing* about the witness?**
That's the simulator's job. We say the protocol is ZK if there's a polynomial-time algorithm $S$ that, given only the public statement $x$ (no witness), produces a transcript *indistinguishable* from a real transcript. Since $S$ doesn't use the witness, anything the verifier could compute from the transcript, they could also compute by just running $S$ — so the witness contributed zero extra information.

**Q2. What's the difference between computational and statistical ZK?**
In computational ZK, the simulator's transcript is *computationally* indistinguishable (no polynomial-time algorithm can tell them apart). In statistical ZK, the distributions are *statistically* close (total variation distance negligible), which is information-theoretically secure. Statistical ZK is stronger but harder to achieve; the class SZK contains problems like Graph Non-Isomorphism and Statistical Difference.

**Q3. Why do most zk-SNARKs need a trusted setup?**
The setup generates a structured reference string (SRS) containing random field elements. These elements must be *destroyed* — if anyone knows them, they can forge proofs. The "toxic waste" is the cryptographic randomness used to generate the SRS. Modern systems (PLONK, Sonic) use a *universal and updatable* setup: one ceremony supports all circuits up to a size bound, and new participants can add entropy. STARKs and Bulletproofs avoid trusted setup entirely.

**Q4. Are ZKPs post-quantum secure?**
Some are. STARKs use only symmetric-key primitives (hash functions, Reed-Solomon codes), which are believed secure against quantum attackers. Groth16, PLONK, and Bulletproofs rely on number-theoretic assumptions (discrete log, pairings) that Shor's algorithm breaks. So for post-quantum ZK, use STARK-based systems.

**Q5. Why are ZKPs used for scaling (rollups) and not just privacy?**
A zk-rollup's proof is *succinct*: a short, fast-to-verify certificate that an entire batch of transactions is valid. The L1 chain only verifies the proof (cheap), not every individual transaction. This is the "verifiable computation" angle of ZKPs — completely separate from the privacy angle. STARKs are especially good at this because they scale to millions of transactions with sublinear verification.
