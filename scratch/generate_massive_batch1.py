import json
import os

blogs = {}

def create_massive_article(slug, title, tagline, category, read_time, prereqs, related, practice_probs, sections, faqs):
    md = f"# {title}\n\n{tagline}\n\n---\n\n"
    for stitle, sbody in sections:
        md += f"## {stitle}\n\n{sbody}\n\n---\n\n"
    md += "## Frequently Asked Questions (FAQs)\n\n"
    for i, (q, a) in enumerate(faqs, 1):
        md += f"### Q{i}: {q}\n{a}\n\n"
    
    return {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": category,
        "readTime": read_time,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": related,
        "practiceProblems": practice_probs,
        "markdown": md
    }

# ---------------------------------------------------------
# BLOG 1: mathematics-for-machine-learning
# ---------------------------------------------------------
m1_sec1 = r"""Linear Algebra is the fundamental mathematical language of machine learning. In modern data science, datasets are represented as matrix structures $X \in \mathbb{R}^{n \times d}$, where $n$ represents the number of independent samples and $d$ represents the feature space dimension.

### 1.1 Vector Spaces and Inner Products
A vector space $V$ over a field $\mathbb{R}$ is a set of elements closed under addition and scalar multiplication. For vectors $u, v \in \mathbb{R}^d$, the inner product (dot product) evaluates directional alignment:

$$\langle u, v \rangle = u^T v = \sum_{i=1}^d u_i v_i = \|u\|_2 \|v\|_2 \cos(\theta)$$

When $\langle u, v \rangle = 0$, vectors $u$ and $v$ are orthogonal ($\theta = 90^\circ$).

### 1.2 Metric Norms and Regularization Geometry
Vector norms map high-dimensional vectors to non-negative real numbers, measuring magnitude and enforcing regularized model behavior:
- **$L_1$ Norm (Manhattan)**: $\|x\|_1 = \sum_{i=1}^d |x_i|$ (creates sharp diamond constraint contours that force feature weights to exact zero).
- **$L_2$ Norm (Euclidean)**: $\|x\|_2 = \sqrt{x^T x} = \sqrt{\sum_{i=1}^d x_i^2}$ (creates spherical constraint contours that shrink weights smoothly).
- **$L_\infty$ Norm (Chebyshev)**: $\|x\|_\infty = \max_{1 \le i \le d} |x_i|$.

### Vector Projection Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#60a5fa" font-size="13" font-family="sans-serif" font-weight="bold">Vector Projection onto Subspace V</text>
  <g transform="translate(40, 60)">
    <line x1="0" y1="120" x2="450" y2="120" stroke="#52525b" stroke-width="2"/>
    <text x="460" y="124" fill="#71717a" font-size="11" font-family="monospace">Subspace V</text>
    <line x1="50" y1="120" x2="260" y2="20" stroke="#3b82f6" stroke-width="2.5" marker-end="url(#arrow-blue)"/>
    <text x="140" y="45" fill="#60a5fa" font-size="12" font-family="monospace" font-weight="bold">Vector u</text>
    <line x1="260" y1="20" x2="260" y2="120" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x="270" y="65" fill="#ef4444" font-size="10" font-family="monospace">Orthogonal Error e = u - proj(u)</text>
    <line x1="50" y1="120" x2="260" y2="120" stroke="#10b981" stroke-width="3"/>
    <text x="100" y="140" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">proj_V(u) = (u^T v / v^T v) v</text>
  </g>
  <defs>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
    </marker>
  </defs>
</svg>"""

m1_sec2 = r"""Spectral decomposition and Singular Value Decomposition (SVD) perform fundamental coordinate transformations that expose low-rank data geometry.

### 2.1 Eigendecomposition of Symmetric Covariance Matrices
For a symmetric positive semi-definite matrix $A \in \mathbb{R}^{d \times d}$ (such as feature covariance matrix $\Sigma = \frac{1}{n} X^T X$), the Spectral Theorem guarantees orthogonal factorization:

$$A = Q \Lambda Q^T = \sum_{i=1}^d \lambda_i q_i q_i^T$$

where $Q = [q_1 \dots q_d]$ contains orthonormal eigenvectors ($Q^T Q = I$) and $\Lambda = \text{diag}(\lambda_1, \dots, \lambda_d)$ contains non-negative eigenvalues sorted in descending order ($\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_d \ge 0$).

### 2.2 Singular Value Decomposition (SVD) Theorem
For an arbitrary rectangular dataset $X \in \mathbb{R}^{n \times d}$, SVD generalizes eigendecomposition:

$$X = U \Sigma V^T$$

- $U \in \mathbb{R}^{n \times n}$: Left singular vectors (orthonormal eigenvectors of $X X^T$, representing data sample embeddings).
- $\Sigma \in \mathbb{R}^{n \times d}$: Diagonal singular values $\sigma_i = \sqrt{\lambda_i(X^T X)}$.
- $V \in \mathbb{R}^{d \times d}$: Right singular vectors (orthonormal eigenvectors of $X^T X$, representing principal feature axes).

Truncating SVD to rank $k < d$ yields the optimal low-rank matrix approximation $X_k = \sum_{i=1}^k \sigma_i u_i v_i^T$, minimizing the Frobenius norm error $\|X - X_k\|_F$ according to the Eckart-Young-Mirsky Theorem."""

m1_sec3 = r"""Multivariate calculus models sensitivity and rate-of-change across continuous parameters.

### 3.1 Gradients and Jacobians
For a scalar loss function $f: \mathbb{R}^d \to \mathbb{R}$, the gradient $\nabla f(x) \in \mathbb{R}^d$ contains first-order partial derivatives:

$$\nabla f(x) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_d} \end{bmatrix}$$

When evaluating vector-valued function mappings $g: \mathbb{R}^d \to \mathbb{R}^m$, the Jacobian matrix $J_g(x) \in \mathbb{R}^{m \times d}$ organizes all first-order partial derivatives:

$$J_g(x) = \begin{bmatrix} \frac{\partial g_1}{\partial x_1} & \cdots & \frac{\partial g_1}{\partial x_d} \\ \vdots & \ddots & \vdots \\ \frac{\partial g_m}{\partial x_1} & \cdots & \frac{\partial g_m}{\partial x_d} \end{bmatrix}$$

The multivariate chain rule evaluates compound gradients via Jacobian multiplication: $\nabla_x (f \circ g)(x) = J_g(x)^T \nabla_z f(z)$.

### 3.2 Hessian Matrix and Curvature
The Hessian matrix $H_f(x) \in \mathbb{R}^{d \times d}$ collects second-order partial derivatives:

$$H_f(x)_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$$

Taylor's second-order expansion approximates local loss surface geometry:

$$f(x + \Delta x) \approx f(x) + \nabla f(x)^T \Delta x + \frac{1}{2} \Delta x^T H_f(x) \Delta x$$

- If $H_f(x) \succ 0$ (Positive Definite), the stationary point is a strict local minimum.
- If $H_f(x)$ has indefinite eigenvalues (mixed positive and negative), the stationary point is a saddle point."""

m1_sec4 = r"""Convexity guarantees global optimality in numerical optimization problems.

### 4.1 Convex Sets and Functions
A set $C \subseteq \mathbb{R}^d$ is convex if the line segment connecting any two points lies entirely inside $C$. A function $f: C \to \mathbb{R}$ is convex if:

$$f(\alpha x + (1-\alpha) y) \le \alpha f(x) + (1-\alpha) f(y) \quad \forall x, y \in C, \alpha \in [0, 1]$$

For twice-differentiable functions, convexity is equivalent to $H_f(x) \succeq 0$ (PSD Hessian) everywhere.

### 4.2 Constrained Optimization and KKT Conditions
Consider the primal optimization problem:

$$\min_{x \in \mathbb{R}^d} f(x) \quad \text{subject to} \quad g_i(x) \le 0 \; (i=1..m), \quad h_j(x) = 0 \; (j=1..p)$$

The Lagrangian function is:

$$\mathcal{L}(x, \lambda, \nu) = f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \nu_j h_j(x)$$

The Karush-Kuhn-Tucker (KKT) conditions specify necessary conditions for local optimality:
1. **Stationarity**: $\nabla_x \mathcal{L}(x^*, \lambda^*, \nu^*) = 0$
2. **Primal Feasibility**: $g_i(x^*) \le 0 \quad \forall i=1..m, \quad h_j(x^*) = 0 \quad \forall j=1..p$
3. **Dual Feasibility**: $\lambda_i^* \ge 0 \quad \forall i=1..m$
4. **Complementary Slackness**: $\lambda_i^* g_i(x^*) = 0 \quad \forall i=1..m$"""

m1_sec5 = r"""```python
import numpy as np

class NumericalOptimizationEngine:
    def __init__(self, A, b):
        # Quadratic Objective: f(x) = 0.5 * x^T A x - b^T x
        self.A = A
        self.b = b

    def loss(self, x):
        return 0.5 * np.dot(x, np.dot(self.A, x)) - np.dot(self.b, x)

    def gradient(self, x):
        return np.dot(self.A, x) - self.b

    def hessian(self, x):
        return self.A

    def gradient_descent(self, x0, lr=0.15, max_iters=100, tol=1e-6):
        history = [x0.copy()]
        x = x0.copy()
        for i in range(max_iters):
            g = self.gradient(x)
            if np.linalg.norm(g) < tol:
                break
            x = x - lr * g
            history.append(x.copy())
        return np.array(history)

    def newtons_method(self, x0, max_iters=20, tol=1e-6):
        history = [x0.copy()]
        x = x0.copy()
        for i in range(max_iters):
            g = self.gradient(x)
            H = self.hessian(x)
            if np.linalg.norm(g) < tol:
                break
            delta_x = np.linalg.solve(H, -g)
            x = x + delta_x
            history.append(x.copy())
        return np.array(history)

# Execute Solver Benchmark on Ill-Conditioned Quadratic Surface
A_mat = np.array([[1.0, 0.0], [0.0, 10.0]])
b_vec = np.array([0.0, 0.0])
solver = NumericalOptimizationEngine(A_mat, b_vec)
x_start = np.array([5.0, 3.0])

gd_history = solver.gradient_descent(x_start)
newton_history = solver.newtons_method(x_start)

print(f"Gradient Descent Steps: {len(gd_history)-1} | Final Loss: {solver.loss(gd_history[-1]):.8f}")
print(f"Newton's Method Steps:   {len(newton_history)-1} | Final Loss: {solver.loss(newton_history[-1]):.8f}")
```"""

m1_sec6 = r"""### 6.1 Matrix Ill-Conditioning and Ravines
The condition number $\kappa(A) = \frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}$ measures numerical sensitivity. High condition numbers ($\kappa > 10^4$) create steep, narrow ravine contours in loss surfaces.
- First-order gradient descent updates oscillate back and forth across ravine walls rather than making progress along the ravine floor.
- Direct matrix inversion $(X^T X)^{-1}$ becomes numerically unstable, amplifying floating-point rounding errors.

### 6.2 Solutions in Production Systems
1. **Feature Standardization**: Rescale all input features to zero mean and unit variance ($x_{new} = \frac{x - \mu}{\sigma}$), forcing condition number $\kappa(A) \approx 1$.
2. **L2 Regularization (Ridge Penalty)**: Add $\lambda I$ to $X^T X$. The matrix $(X^T X + \lambda I)$ is guaranteed to be strictly positive-definite, bounding the condition number to $\frac{\sigma_{\max}^2 + \lambda}{\sigma_{\min}^2 + \lambda}$ and ensuring stable inversion.
3. **Preconditioned Conjugate Gradient**: Use preconditioner matrix $M \approx A^{-1}$ to transform gradient updates into an isotropic space."""

blogs["mathematics-for-machine-learning"] = create_massive_article(
    slug="mathematics-for-machine-learning",
    title="Mathematics for Machine Learning: Fundamental Linear Algebra, Calculus & Optimization",
    tagline="Master vectors, matrices, gradients, Hessians, and convexity that form the core of ML algorithms.",
    category="Math & Stats",
    read_time=35,
    prereqs=["High School Algebra", "Basic Python"],
    related=["algebra-differential-calculus", "introduction-to-statistics", "probability-and-statistics"],
    practice_probs=[
        {"title": "Matrix Multiplication & Transpose Invariants", "difficulty": "Medium", "url": "https://leetcode.com/problems/matrix-diagonal-sum/"},
        {"title": "Gradient Descent Simulation", "difficulty": "Hard", "url": "https://leetcode.com/problems/minimum-path-sum/"}
    ],
    sections=[
        ("1. Vector Spaces, Inner Products, and Metric Norms", m1_sec1),
        ("2. Matrix Spectral Decomposition & Singular Value Decomposition (SVD)", m1_sec2),
        ("3. Multivariate Calculus: Gradients, Jacobians, and Hessians", m1_sec3),
        ("4. Convex Optimization & KKT Conditions", m1_sec4),
        ("5. Python Implementation: First-Order vs Second-Order Optimization Engines", m1_sec5),
        ("6. Industrial Gotchas: Ill-Conditioning and Numerical Stability", m1_sec6)
    ],
    faqs=[
        ("Why do we prefer Gradient Descent over Newton's Method in Deep Learning?", r"While Newton's method achieves quadratic convergence rate ($O(\text{iterations}) = 1$ step for pure quadratics), computing and inverting the Hessian matrix $H \in \mathbb{R}^{d \times d}$ costs $O(d^3)$ time and $O(d^2)$ space. In deep learning where parameters $d > 10^9$, storing and inverting an $10^9 \times 10^9$ matrix is computationally intractable. First-order methods like Adam and SGD require only $O(d)$ memory."),
        ("What is the intuitive difference between Eigenvalues and Singular Values?", r"Eigenvalues and eigenvectors are defined only for square matrices ($A x = \lambda x$) and represent scaling factors along invariant directions. Singular values are defined for any $m \times n$ matrix ($X v_i = \sigma_i u_i$). The singular values of $X$ are the square roots of the non-zero eigenvalues of $X^T X$ (or $X X^T$)."),
        ("Why does L1 regularization cause weight sparsity while L2 regularization does not?", r"L1 regularization adds $\|w\|_1 = \sum |w_i|$ to the loss. Geometrically, the L1 constraint region is a diamond with sharp corners along coordinate axes. Contour lines of the loss function intersect the diamond at these axis corners, setting parameters to exactly 0. L2 regularization adds $\|w\|_2^2$, which forms a smooth sphere constraint, pulling weights toward zero without setting them strictly to zero."),
        ("What is the condition number of a matrix and why does it affect model training?", r"The condition number $\kappa(A) = \frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}$ measures sensitivity of linear equations to numerical errors. If $\kappa(A)$ is large, the matrix is ill-conditioned, causing gradient descent optimization trajectories to oscillate wildly across steep ravine contours rather than heading directly toward the minimum."),
        ("How does Jensen's Inequality apply to Machine Learning?", r"Jensen's Inequality states that for a convex function $f$ and a random variable $X$, $f(\mathbb{E}[X]) \le \mathbb{E}[f(X)]$. For concave functions (like $\log$), $\mathbb{E}[\log X] \le \log \mathbb{E}[X]$. This inequality underpins the derivation of the Evidence Lower Bound (ELBO) in Variational Autoencoders (VAEs) and the Expectation-Maximization (EM) algorithm.")
    ]
)

print(f"Blog 1 generated. Length: {len(blogs['mathematics-for-machine-learning']['markdown'])} chars")
