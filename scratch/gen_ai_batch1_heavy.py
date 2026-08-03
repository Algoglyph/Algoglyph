import json
import os

blogs = {}

def create_heavy_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, sections, faqs):
    markdown = f"# {title}\n\n{tagline}\n\n---\n\n"
    for sec_title, sec_body in sections:
        markdown += f"## {sec_title}\n\n{sec_body}\n\n---\n\n"
    
    markdown += "## Frequently Asked Questions (FAQs)\n\n"
    for idx, (q, a) in enumerate(faqs, 1):
        markdown += f"### Q{idx}: {q}\n{a}\n\n"
        
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
        "markdown": markdown
    }

# ----------------------------------------------------------------------
# 1. mathematics-for-machine-learning
# ----------------------------------------------------------------------
blogs["mathematics-for-machine-learning"] = create_heavy_blog(
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
        ("1. Linear Algebra: Vector Spaces, Norms, and Inner Products", r"""A vector space $V$ over a field $\mathbb{R}$ is a set of elements (vectors) closed under vector addition and scalar multiplication. In Machine Learning, a data sample with $d$ continuous features is represented as a point $x \in \mathbb{R}^d$:

$$x = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_d \end{bmatrix}$$

The **Inner Product** (or dot product) between two vectors $u, v \in \mathbb{R}^d$ measures directional alignment and projects one vector onto another:

$$\langle u, v \rangle = u^T v = \sum_{i=1}^d u_i v_i = \|u\|_2 \|v\|_2 \cos(\theta)$$

where $\theta$ is the angle between $u$ and $v$. The $L_2$ norm $\|x\|_2 = \sqrt{x^T x}$ defines Euclidean distance, while the $L_1$ norm $\|x\|_1 = \sum_{i=1}^d |x_i|$ induces sparsity in regularized models like Lasso Regression. The General $p$-norm is expressed as:

$$\|x\|_p = \left( \sum_{i=1}^d |x_i|^p \right)^{1/p}$$

When $p=2$, we obtain the standard Euclidean distance metric. When $p \to \infty$, we obtain the Chebyshev norm $\|x\|_\infty = \max_i |x_i|$.

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
</svg>"""),
        ("2. Matrix Spectral Decomposition & Singular Value Decomposition (SVD)", r"""For any real symmetric matrix $A \in \mathbb{R}^{d \times d}$ (such as a feature covariance matrix $\Sigma = \frac{1}{n} X^T X$), the **Spectral Theorem** guarantees that $A$ can be diagonalized by an orthogonal matrix $Q$:

$$A = Q \Lambda Q^T = \sum_{i=1}^d \lambda_i q_i q_i^T$$

where $q_i$ are orthogonal eigenvectors ($q_i^T q_j = \delta_{ij}$) and $\lambda_i$ are corresponding eigenvalues representing scale along eigenvector axes.

For arbitrary rectangular matrices $X \in \mathbb{R}^{n \times d}$, **Singular Value Decomposition (SVD)** factorizes the dataset into:

$$X = U \Sigma V^T$$

- $U \in \mathbb{R}^{n \times n}$: Left singular vectors (orthonormal eigenvectors of $X X^T$, representing data sample embeddings).
- $\Sigma \in \mathbb{R}^{n \times d}$: Diagonal singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_r > 0$ where $\sigma_i = \sqrt{\lambda_i(X^T X)}$.
- $V \in \mathbb{R}^{d \times d}$: Right singular vectors (orthonormal eigenvectors of $X^T X$, representing feature principal components).

Truncating SVD to rank $k \ll d$ yields the optimal rank-$k$ approximation under the Frobenius norm $\|X - X_k\|_F$ (Eckart-Young-Mirsky Theorem), which powers Principal Component Analysis (PCA) and Latent Semantic Analysis (LSA)."""),
        ("3. Multivariate Calculus: Gradients, Jacobians, and Hessians", r"""Let $f: \mathbb{R}^d \to \mathbb{R}$ be a scalar loss function (e.g. Mean Squared Error). The **Gradient** $\nabla f(x)$ is the vector of first-order partial derivatives pointing in the direction of steepest rate of increase:

$$\nabla f(x) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_d} \end{bmatrix} \in \mathbb{R}^d$$

When composing functions $z = g(x)$ where $g: \mathbb{R}^d \to \mathbb{R}^m$ and $f: \mathbb{R}^m \to \mathbb{R}$, the multivariate **Chain Rule** evaluates via the **Jacobian Matrix** $J_g(x) \in \mathbb{R}^{m \times d}$:

$$J_g(x) = \begin{bmatrix} \frac{\partial g_1}{\partial x_1} & \cdots & \frac{\partial g_1}{\partial x_d} \\ \vdots & \ddots & \vdots \\ \frac{\partial g_m}{\partial x_1} & \cdots & \frac{\partial g_m}{\partial x_d} \end{bmatrix}$$

$$\nabla_x (f \circ g)(x) = J_g(x)^T \nabla_z f(z)$$

The **Hessian Matrix** $H_f(x) \in \mathbb{R}^{d \times d}$ collects second-order partial derivatives:

$$H_f(x)_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$$

By Schwarz's Theorem, if partial derivatives are continuous, $H_f(x)$ is symmetric. Taylor's second-order expansion approximates $f(x + \Delta x)$ locally as:

$$f(x + \Delta x) \approx f(x) + \nabla f(x)^T \Delta x + \frac{1}{2} \Delta x^T H_f(x) \Delta x$$"""),
        ("4. Convex Optimization: KKT Conditions and Duality", r"""A set $C \subseteq \mathbb{R}^d$ is convex if $\alpha x + (1-\alpha) y \in C$ for all $x, y \in C$ and $\alpha \in [0, 1]$. A function $f: C \to \mathbb{R}$ is convex if:

$$f(\alpha x + (1-\alpha) y) \le \alpha f(x) + (1-\alpha) f(y)$$

For twice-differentiable functions, convexity is equivalent to $H_f(x) \succeq 0$ (Hessian is Positive Semi-Definite everywhere).

Consider the constrained primal optimization problem:

$$\min_{x \in \mathbb{R}^d} f(x) \quad \text{subject to} \quad g_i(x) \le 0 \; (i=1..m), \quad h_j(x) = 0 \; (j=1..p)$$

The **Lagrangian Function** $\mathcal{L}(x, \lambda, \nu)$ combines objective and constraints:

$$\mathcal{L}(x, \lambda, \nu) = f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \nu_j h_j(x)$$

The **KKT Conditions** state that if $x^*$ is a local optimum and constraint qualifications hold, there exist dual multipliers $\lambda^*, \nu^*$ satisfying:

1. **Stationarity**: $\nabla_x \mathcal{L}(x^*, \lambda^*, \nu^*) = 0$
2. **Primal Feasibility**: $g_i(x^*) \le 0, \quad h_j(x^*) = 0$
3. **Dual Feasibility**: $\lambda_i^* \ge 0$
4. **Complementary Slackness**: $\lambda_i^* g_i(x^*) = 0 \quad \forall i=1..m$"""),
        ("5. Python Implementation: First-Order vs Second-Order Optimization Engines", r"""The complete Python script below benchmarks **Gradient Descent** against **Newton-Raphson Optimization** on an ill-conditioned non-linear surface $f(x, y) = 0.5 x^2 + 5.0 y^2$:

```python
import numpy as np

class OptimizationEngine:
    def __init__(self, A, b):
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

A = np.array([[1.0, 0.0], [0.0, 10.0]])
b = np.array([0.0, 0.0])
solver = OptimizationEngine(A, b)
x_start = np.array([5.0, 3.0])

gd_res = solver.gradient_descent(x_start)
newton_res = solver.newtons_method(x_start)

print(f"GD Steps to Converge: {len(gd_res)-1} | Final Loss: {solver.loss(gd_res[-1]):.8f}")
print(f"Newton Steps to Converge: {len(newton_res)-1} | Final Loss: {solver.loss(newton_res[-1]):.8f}")
```""")
    ],
    faqs=[
        ("Why do we prefer Gradient Descent over Newton's Method in Deep Learning?", "While Newton's method achieves quadratic convergence rate ($O(\\text{iterations}) = 1$ step for pure quadratics), computing and inverting the Hessian matrix $H \\in \\mathbb{R}^{d \\times d}$ costs $O(d^3)$ time and $O(d^2)$ space. In deep learning where parameters $d > 10^9$, storing and inverting an $10^9 \\times 10^9$ matrix is computationally intractable. First-order methods like Adam and SGD require only $O(d)$ memory."),
        ("What is the intuitive difference between Eigenvalues and Singular Values?", "Eigenvalues and eigenvectors are defined only for square matrices ($A x = \\lambda x$) and represent scaling factors along invariant directions. Singular values are defined for any $m \\times n$ matrix ($X v_i = \\sigma_i u_i$). The singular values of $X$ are the square roots of the non-zero eigenvalues of $X^T X$ (or $X X^T$)."),
        ("Why does L1 regularization cause weight sparsity while L2 regularization does not?", "L1 regularization adds $\|w\|_1 = \\sum |w_i|$ to the loss. Geometrically, the L1 constraint region is a diamond with sharp corners along coordinate axes. Contour lines of the loss function intersect the diamond at these axis corners, setting parameters to exactly 0. L2 regularization adds $\|w\|_2^2$, which forms a smooth sphere constraint, pulling weights toward zero without setting them strictly to zero."),
        ("What is the condition number of a matrix and why does it affect model training?", "The condition number $\\kappa(A) = \\frac{\\sigma_{\\max}(A)}{\\sigma_{\\min}(A)}$ measures sensitivity of linear equations to numerical errors. If $\\kappa(A)$ is large, the matrix is ill-conditioned, causing gradient descent optimization trajectories to oscillate wildly across steep ravine contours rather than heading directly toward the minimum."),
        ("How does Jensen's Inequality apply to Machine Learning?", "Jensen's Inequality states that for a convex function $f$ and a random variable $X$, $f(\\mathbb{E}[X]) \\le \\mathbb{E}[f(X)]$. For concave functions (like $\\log$), $\\mathbb{E}[\\log X] \\le \\log \\mathbb{E}[X]$. This inequality underpins the derivation of the Evidence Lower Bound (ELBO) in Variational Autoencoders (VAEs) and the Expectation-Maximization (EM) algorithm.")
    ]
)

print(f"Blog 1 len: {len(blogs['mathematics-for-machine-learning']['markdown'])}")
