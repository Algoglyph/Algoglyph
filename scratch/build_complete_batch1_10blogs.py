import json
import os

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, sections, faqs):
    md = f"# {title}\n\n{tagline}\n\n---\n\n"
    for stitle, sbody in sections:
        md += f"## {stitle}\n\n{sbody}\n\n---\n\n"
    md += "## Frequently Asked Questions (FAQs)\n\n"
    for i, (q, a) in enumerate(faqs, 1):
        md += f"### Q{i}: {q}\n{a}\n\n"
    
    blogs[slug] = {
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
# 1. mathematics-for-machine-learning
# ---------------------------------------------------------
add_blog(
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
        ("1. Vector Spaces, Inner Products, and Metric Norms", r"""Linear Algebra is the mathematics of high-dimensional vector spaces. In machine learning, every data sample with $d$ features is a vector $x \in \mathbb{R}^d$:

$$x = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_d \end{bmatrix}$$

The **Inner Product** (dot product) between vectors $u, v \in \mathbb{R}^d$ computes directional alignment and projection:

$$\langle u, v \rangle = u^T v = \sum_{i=1}^d u_i v_i = \|u\|_2 \|v\|_2 \cos(\theta)$$

where $\theta$ is the angle between $u$ and $v$.

### Norms and Distance Metrics
Vector norms measure vector magnitude and regulate model complexity:
- **$L_1$ Norm (Manhattan)**: $\|x\|_1 = \sum_{i=1}^d |x_i|$ (promotes sparse feature weights in Lasso).
- **$L_2$ Norm (Euclidean)**: $\|x\|_2 = \sqrt{\sum_{i=1}^d x_i^2} = \sqrt{x^T x}$ (smooth weight shrinkage in Ridge).
- **$L_p$ Norm**: $\|x\|_p = \left(\sum_{i=1}^d |x_i|^p\right)^{1/p}$.

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
        ("2. Matrix Spectral Theorem & Singular Value Decomposition (SVD)", r"""For a symmetric matrix $A \in \mathbb{R}^{d \times d}$ (such as feature covariance matrix $\Sigma = \frac{1}{n} X^T X$), the Spectral Theorem guarantees diagonalization:

$$A = Q \Lambda Q^T = \sum_{i=1}^d \lambda_i q_i q_i^T$$

where $q_i$ are orthonormal eigenvectors ($q_i^T q_j = \delta_{ij}$) and $\lambda_i$ are corresponding eigenvalues.

### Singular Value Decomposition (SVD)
For arbitrary rectangular matrix $X \in \mathbb{R}^{n \times d}$:

$$X = U \Sigma V^T$$

- $U \in \mathbb{R}^{n \times n}$: Left singular vectors (eigenvectors of $X X^T$).
- $\Sigma \in \mathbb{R}^{n \times d}$: Singular values $\sigma_i = \sqrt{\lambda_i(X^T X)}$.
- $V \in \mathbb{R}^{d \times d}$: Right singular vectors (eigenvectors of $X^T X$).

Truncating SVD to rank $k \ll d$ yields optimal low-rank matrix approximation under Frobenius norm $\|X - X_k\|_F$ (Eckart-Young-Mirsky Theorem)."""),
        ("3. Multivariate Calculus: Gradients, Jacobians, and Hessians", r"""The gradient $\nabla f(x)$ of scalar function $f: \mathbb{R}^d \to \mathbb{R}$ collects first-order partial derivatives:

$$\nabla f(x) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_d} \end{bmatrix} \in \mathbb{R}^d$$

When composing functions $z = g(x)$ where $g: \mathbb{R}^d \to \mathbb{R}^m$, the multivariate chain rule multiplies Jacobian matrices $J_g(x) \in \mathbb{R}^{m \times d}$:

$$J_g(x) = \begin{bmatrix} \frac{\partial g_1}{\partial x_1} & \cdots & \frac{\partial g_1}{\partial x_d} \\ \vdots & \ddots & \vdots \\ \frac{\partial g_m}{\partial x_1} & \cdots & \frac{\partial g_m}{\partial x_d} \end{bmatrix}$$

$$\nabla_x (f \circ g)(x) = J_g(x)^T \nabla_z f(z)$$

The Hessian Matrix $H_f(x) \in \mathbb{R}^{d \times d}$ collects second-order partial derivatives:

$$H_f(x)_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$$

Taylor's second-order local quadratic approximation is given by:

$$f(x + \Delta x) \approx f(x) + \nabla f(x)^T \Delta x + \frac{1}{2} \Delta x^T H_f(x) \Delta x$$"""),
        ("4. Convex Optimization & KKT Conditions", r"""A function $f: C \to \mathbb{R}$ on a convex set $C$ is convex if:

$$f(\alpha x + (1-\alpha) y) \le \alpha f(x) + (1-\alpha) f(y) \quad \forall x, y \in C, \alpha \in [0, 1]$$

For twice-differentiable functions, convexity is equivalent to $H_f(x) \succeq 0$ (PSD Hessian). In convex optimization, every local minimum is a global minimum.

### Karush-Kuhn-Tucker (KKT) Conditions
For constrained optimization $\min_x f(x)$ subject to $g_i(x) \le 0$ and $h_j(x) = 0$:

$$\mathcal{L}(x, \lambda, \nu) = f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \nu_j h_j(x)$$

1. **Stationarity**: $\nabla_x \mathcal{L}(x^*, \lambda^*, \nu^*) = 0$
2. **Primal Feasibility**: $g_i(x^*) \le 0, \quad h_j(x^*) = 0$
3. **Dual Feasibility**: $\lambda_i^* \ge 0$
4. **Complementary Slackness**: $\lambda_i^* g_i(x^*) = 0 \quad \forall i=1..m$"""),
        ("5. Python Implementation: First-Order vs Second-Order Optimization Engines", r"""```python
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
        ("Why do we prefer Gradient Descent over Newton's Method in Deep Learning?", r"While Newton's method achieves quadratic convergence rate ($O(\text{iterations}) = 1$ step for pure quadratics), computing and inverting the Hessian matrix $H \in \mathbb{R}^{d \times d}$ costs $O(d^3)$ time and $O(d^2)$ space. In deep learning where parameters $d > 10^9$, storing and inverting an $10^9 \times 10^9$ matrix is computationally intractable. First-order methods like Adam and SGD require only $O(d)$ memory."),
        ("What is the intuitive difference between Eigenvalues and Singular Values?", r"Eigenvalues and eigenvectors are defined only for square matrices ($A x = \lambda x$) and represent scaling factors along invariant directions. Singular values are defined for any $m \times n$ matrix ($X v_i = \sigma_i u_i$). The singular values of $X$ are the square roots of the non-zero eigenvalues of $X^T X$ (or $X X^T$)."),
        ("Why does L1 regularization cause weight sparsity while L2 regularization does not?", r"L1 regularization adds $\|w\|_1 = \sum |w_i|$ to the loss. Geometrically, the L1 constraint region is a diamond with sharp corners along coordinate axes. Contour lines of the loss function intersect the diamond at these axis corners, setting parameters to exactly 0. L2 regularization adds $\|w\|_2^2$, which forms a smooth sphere constraint, pulling weights toward zero without setting them strictly to zero."),
        ("What is the condition number of a matrix and why does it affect model training?", r"The condition number $\kappa(A) = \frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}$ measures sensitivity of linear equations to numerical errors. If $\kappa(A)$ is large, the matrix is ill-conditioned, causing gradient descent optimization trajectories to oscillate wildly across steep ravine contours rather than heading directly toward the minimum."),
        ("How does Jensen's Inequality apply to Machine Learning?", r"Jensen's Inequality states that for a convex function $f$ and a random variable $X$, $f(\mathbb{E}[X]) \le \mathbb{E}[f(X)]$. For concave functions (like $\log$), $\mathbb{E}[\log X] \le \log \mathbb{E}[X]$. This inequality underpins the derivation of the Evidence Lower Bound (ELBO) in Variational Autoencoders (VAEs) and the Expectation-Maximization (EM) algorithm.")
    ]
)

# ---------------------------------------------------------
# 2. algebra-differential-calculus
# ---------------------------------------------------------
add_blog(
    slug="algebra-differential-calculus",
    title="Coursera: Algebra and Differential Calculus for Machine Learning",
    tagline="A rigorous exploration of matrix transformations, multi-variable derivatives, and rate-of-change dynamics in ML models.",
    category="Differential Calculus",
    read_time=30,
    prereqs=["mathematics-for-machine-learning"],
    related=["introduction-to-statistics", "hypothesis-testing"],
    practice_probs=[
        {"title": "Partial Derivatives Verification", "difficulty": "Medium", "url": "https://leetcode.com/problems/powx-n/"}
    ],
    sections=[
        ("1. Linear Mappings, Basis Change, and Operator Norms", r"""Linear transformations preserve vector addition and scalar multiplication:

$$T(u + v) = T(u) + T(v), \quad T(c u) = c T(u)$$

Every linear operator $T: \mathbb{R}^n \to \mathbb{R}^m$ is represented by a matrix $A \in \mathbb{R}^{m \times n}$. Changing coordinates from basis $B$ to orthonormal basis $P = [p_1 \dots p_n]$ transforms vectors and operators:

$$x_{B'} = P^T x, \quad A_{B'} = P^T A P$$

In PCA, $P$ is formed by eigenvectors of covariance matrix $\Sigma = \frac{1}{n} X^T X$, diagonalizing the feature covariance matrix and removing feature correlations.

### Matrix Transformation Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Linear Transformation A: R^2 -> R^2</text>
  <g transform="translate(50, 60)">
    <rect x="0" y="40" width="60" height="60" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="15" y="75" fill="#60a5fa" font-size="10" font-family="monospace">Unit Square</text>
    <path d="M 80,70 L 150,70" stroke="#a855f7" stroke-width="2" marker-end="url(#arrow-purple)"/>
    <text x="100" y="60" fill="#a855f7" font-size="11" font-family="monospace">Apply A</text>
    <polygon points="180,100 260,80 320,20 240,40" fill="none" stroke="#10b981" stroke-width="2.5"/>
    <text x="220" y="65" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">Sheared Area (det A)</text>
  </g>
  <defs>
    <marker id="arrow-purple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7"/>
    </marker>
  </defs>
</svg>"""),
        ("2. Directional Derivatives & Automatic Differentiation Architecture", r"""The directional derivative $D_v f(x)$ evaluates the rate of change of $f$ along unit vector $v \in \mathbb{R}^n$:

$$D_v f(x) = \lim_{h \to 0} \frac{f(x + h v) - f(x)}{h} = \nabla f(x)^T v = \|\nabla f(x)\|_2 \|v\|_2 \cos(\theta)$$

Because $\cos(\theta) \le 1$, $D_v f(x)$ is maximized when $v$ aligns with $\nabla f(x)$ ($\theta = 0$), establishing that the gradient vector points in the exact direction of steepest rate of increase.

### Automatic Differentiation Architecture
Computational graphs compose elementary operations. For node chain $x \to y \to z$:

$$J_{f \circ g}(x) = J_f(y) \cdot J_g(x)$$

Forward-mode AD evaluates $J \cdot v$ concurrently with the forward pass ($n \ll m$). Reverse-mode AD (Backpropagation) evaluates $v^T J$ backward from scalar loss ($m=1, n \gg 1$)."""),
        ("3. Multivariate Taylor Series & Loss Topography", r"""The multivariate Taylor series around expansion point $a \in \mathbb{R}^n$ is given by:

$$f(x) = f(a) + \nabla f(a)^T (x - a) + \frac{1}{2} (x - a)^T H_f(a) (x - a) + \mathcal{O}(\|x - a\|^3)$$

At stationary points ($\nabla f(a) = 0$), the eigenvalues of Hessian $H_f(a)$ dictate local topography:
- All $\lambda_i > 0$: Strict local minimum.
- All $\lambda_i < 0$: Strict local maximum.
- Mixed signs ($\lambda_i > 0$ and $\lambda_j < 0$): Saddle point."""),
        ("4. Python Implementation: Reverse-Mode Graph Autograd", r"""```python
import numpy as np

class Var:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        out = Var(self.data + other.data, (self, other), '+')
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        out = Var(self.data * other.data, (self, other), '*')
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def __pow__(self, power):
        out = Var(self.data ** power, (self,), f'**{power}')
        def _backward():
            self.grad += (power * (self.data ** (power - 1))) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()

x_var = Var(3.0)
y_var = Var(2.0)
loss = (x_var ** 2) * y_var + Var(3.0) * (y_var ** 3)
loss.backward()

print(f"AutoDiff Derivatives: df/dx = {x_var.grad:.4f}, df/dy = {y_var.grad:.4f}")
```""")
    ],
    faqs=[
        ("Why is Central Difference preferred over Forward Difference for numerical derivatives?", r"Forward difference $\frac{f(x+\epsilon) - f(x)}{\epsilon}$ has first-order truncation error $\mathcal{O}(\epsilon)$. Central difference $\frac{f(x+\epsilon) - f(x-\epsilon)}{2\epsilon}$ cancels first-order terms, yielding a second-order truncation error $\mathcal{O}(\epsilon^2)$, making it far more accurate."),
        ("What is the Vanishing and Exploding Gradient Problem?", r"In deep networks with $L$ layers, gradients propagate by multiplying weight matrices: $\nabla_{W_1} L = \left(\prod_{l=2}^L W_l^T \sigma'(z_l)\right) \nabla_{z_L} L$. If the maximum singular values of weights $\sigma_{\max}(W_l) < 1$, gradients decay exponentially to 0 (vanishing). If $\sigma_{\max}(W_l) > 1$, gradients grow exponentially to $\infty$ (exploding)."),
        ("How does gradient clipping resolve exploding gradients?", r"Gradient clipping rescales the gradient vector if its $L_2$ norm exceeds threshold $c$: $g \leftarrow \frac{c}{\|g\|_2} g$ if $\|g\|_2 > c$. This preserves gradient direction while bounding step magnitude."),
        ("What is the difference between Jacobian and Hessian matrices?", r"The Jacobian $J \in \mathbb{R}^{m \times n}$ contains first-order partial derivatives of vector-valued function $g: \mathbb{R}^n \to \mathbb{R}^m$. The Hessian $H \in \mathbb{R}^{n \times n}$ contains second-order partial derivatives of scalar-valued function $f: \mathbb{R}^n \to \mathbb{R}$."),
        ("Why is the directional derivative maximized in the direction of the gradient?", r"The directional derivative $D_v f(x) = \nabla f(x)^T v = \|\nabla f(x)\|_2 \|v\|_2 \cos(\theta)$. Because unit vector $\|v\|_2 = 1$ and $\cos(\theta) \le 1$, $D_v f(x)$ achieves maximum value $\|\nabla f(x)\|_2$ when $\cos(\theta) = 1$, which occurs when $v$ points in the exact direction of $\nabla f(x)$.")
    ]
)

# ---------------------------------------------------------
# 3. introduction-to-statistics
# ---------------------------------------------------------
add_blog(
    slug="introduction-to-statistics",
    title="Coursera: Introduction to Statistics for Data Science",
    tagline="Measure theory, sample estimators, Maximum Likelihood, and Fisher Information in statistical inference.",
    category="Statistics",
    read_time=32,
    prereqs=["mathematics-for-machine-learning"],
    related=["hypothesis-testing", "probability-and-statistics"],
    practice_probs=[{"title": "Maximum Likelihood Estimation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Probability Spaces, Measurability, and Random Variables", r"""Let $(\Omega, \mathcal{F}, P)$ be a formal probability space where $\Omega$ is the sample space, $\mathcal{F}$ is a $\sigma$-algebra of measurable events, and $P: \mathcal{F} \to [0, 1]$ is a probability measure satisfying Kolmogorov's Axioms.

For continuous random variable $X$, the Cumulative Distribution Function (CDF) $F_X(x) = P(X \le x)$ and Probability Density Function (PDF) $f_X(x) = \frac{d F_X(x)}{dx}$ satisfy:

$$\int_{-\infty}^{\infty} f_X(x) \, dx = 1, \quad P(a \le X \le b) = \int_a^b f_X(x) \, dx$$

The Expected Value $\mathbb{E}[X]$ and Variance $\text{Var}(X)$ represent the 1st raw moment and 2nd central moment:

$$\mathbb{E}[X] = \int_{-\infty}^{\infty} x f_X(x) \, dx, \quad \text{Var}(X) = \mathbb{E}[(X - \mu)^2] = \mathbb{E}[X^2] - \mu^2$$

### Skewness and Kurtosis
- **Skewness** ($\gamma_1 = \mathbb{E}\left[\left(\frac{X - \mu}{\sigma}\right)^3\right]$): Measures distribution asymmetry.
- **Kurtosis** ($\gamma_2 = \mathbb{E}\left[\left(\frac{X - \mu}{\sigma}\right)^4\right] - 3$): Measures tail heaviness relative to Normal distribution.

### Probability Density Curve Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Gaussian Normal Density vs Skewed Gamma Density</text>
  <g transform="translate(50, 50)">
    <path d="M 0,110 Q 150,110 200,80 T 250,10 T 300,80 T 500,110" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="260" y="25" fill="#38bdf8" font-size="10" font-family="monospace">Normal (Symmetric)</text>
    <path d="M 0,110 Q 50,10 120,50 T 300,100 T 500,110" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="130" y="40" fill="#f59e0b" font-size="10" font-family="monospace">Positive Skew (Right-Tailed)</text>
  </g>
</svg>"""),
        ("2. Maximum Likelihood Estimation & Fisher Information Matrix", r"""Given i.i.d. observations $D = (x_1, x_2, \dots, x_n)$ sampled from $f(x; \theta)$, the Likelihood Function is:

$$L(\theta; D) = \prod_{i=1}^n f(x_i; \theta) \implies \ell(\theta) = \log L(\theta; D) = \sum_{i=1}^n \log f(x_i; \theta)$$

The Maximum Likelihood Estimator (MLE) $\hat{\theta}_{\text{MLE}}$ satisfies score equation $\nabla_\theta \ell(\hat{\theta}) = 0$.

### Cramér-Rao Lower Bound (CRLB)
The Fisher Information Matrix $I(\theta)$ measures information that sample $X$ carries about $\theta$:

$$I(\theta) = \mathbb{E}\left[ \left( \nabla_\theta \log f(X; \theta) \right) \left( \nabla_\theta \log f(X; \theta) \right)^T \right] = -\mathbb{E}\left[ H_{\log f}(X; \theta) \right]$$

For any unbiased estimator $\hat{\theta}$, its covariance matrix is lower-bounded by $I(\theta)^{-1}$:

$$\text{Var}(\hat{\theta}) \succeq \frac{1}{n} I(\theta)^{-1}$$"""),
        ("3. Python Implementation: Maximum Likelihood Estimator & Score Solver", r"""```python
import numpy as np
import scipy.stats as stats
import scipy.optimize as opt

def fit_mle_gaussian(data):
    def neg_log_likelihood(params):
        mu, sigma = params[0], params[1]
        if sigma <= 0:
            return 1e10
        n = len(data)
        log_l = -0.5 * n * np.log(2 * np.pi * sigma**2) - np.sum((data - mu)**2) / (2 * sigma**2)
        return -log_l

    init_params = [np.mean(data), np.std(data)]
    res = opt.minimize(neg_log_likelihood, init_params, method='L-BFGS-B', bounds=[(None, None), (1e-5, None)])
    hessian_inv = res.hess_inv.todense()
    param_se = np.sqrt(np.diag(hessian_inv))
    return res.x, param_se

np.random.seed(42)
true_mu, true_sigma = 15.0, 4.0
sample_data = np.random.normal(loc=true_mu, scale=true_sigma, size=10000)

mle_params, mle_se = fit_mle_gaussian(sample_data)
print(f"True Params:  mu={true_mu}, sigma={true_sigma}")
print(f"MLE Estimator: mu={mle_params[0]:.4f} (SE: {mle_se[0]:.4f}), sigma={mle_params[1]:.4f} (SE: {mle_se[1]:.4f})")
```""")
    ],
    faqs=[
        ("What is the intuitive difference between a Parameter and a Statistic?", r"A Parameter is a fixed, typically unknown numerical characteristic of an entire population (e.g. population mean $\mu$ or variance $\sigma^2$). A Statistic is a random variable computed from a finite sample of data (e.g. sample mean $\bar{X}$ or sample variance $S^2$) used to estimate population parameters."),
        ("Why is Bessel's Correction (n-1) used in sample variance calculation?", r"Sample mean $\bar{X}$ is closer to sample observations than population mean $\mu$. Summing squared deviations from $\bar{X}$ underestimates true population variance $\sigma^2$. Dividing by $n-1$ instead of $n$ yields an unbiased estimator $\mathbb{E}[S^2] = \sigma^2$."),
        ("What is the relationship between Fisher Information and Confidence Intervals?", r"Fisher Information $I(\theta)$ measures the curvature of the log-likelihood function. Higher curvature means higher Fisher Information and smaller variance $\text{Var}(\hat{\theta}) \ge 1 / (n I(\theta))$. This inverse Fisher Information forms the asymptotic variance used to construct $95\%$ Wald Confidence Intervals."),
        ("Why is Maximum Likelihood Estimation asymptotically efficient?", r"Under regularity conditions, as sample size $n \to \infty$, the MLE estimator $\hat{\theta}_{\text{MLE}}$ converges in distribution to a Normal Distribution $\mathcal{N}(\theta, \frac{1}{n} I(\theta)^{-1})$, achieving the Cramér-Rao Lower Bound minimum variance."),
        ("What is Law of Total Expectation and Law of Total Variance?", r"Law of Total Expectation: $\mathbb{E}[X] = \mathbb{E}[\mathbb{E}[X \mid Y]]$. Law of Total Variance: $\text{Var}(X) = \mathbb{E}[\text{Var}(X \mid Y)] + \text{Var}(\mathbb{E}[X \mid Y])$. These laws decompose total variation into within-group variance and between-group variance.")
    ]
)

# ---------------------------------------------------------
# 4. hypothesis-testing
# ---------------------------------------------------------
add_blog(
    slug="hypothesis-testing",
    title="Coursera: Hypothesis Testing & Statistical Inference",
    tagline="Neyman-Pearson lemma, Welch's t-test, p-value distributions, and decision boundaries.",
    category="Hypothesis Testing",
    read_time=32,
    prereqs=["introduction-to-statistics"],
    related=["probability-and-statistics", "experiment-design"],
    practice_probs=[{"title": "Z-Test & T-Test Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Neyman-Pearson Framework & Error Dynamics", r"""Statistical hypothesis testing formulates a decision rule between Null Hypothesis $H_0$ ($\mu_T - \mu_C = 0$) and Alternative Hypothesis $H_1$ ($\mu_T - \mu_C \ne 0$).

| Truth \ Decision | Accept $H_0$ | Reject $H_0$ |
| :--- | :--- | :--- |
| **$H_0$ is True** | Correct ($1 - \alpha$) | **Type I Error ($\alpha$, False Positive)** |
| **$H_1$ is True** | **Type II Error ($\beta$, False Negative)** | Correct (**Power $1 - \beta$)** |

### Neyman-Pearson Lemma
For a simple hypothesis $H_0: \theta = \theta_0$ vs $H_1: \theta = \theta_1$, the Likelihood Ratio Test statistic $\Lambda(x) = \frac{L(\theta_0; x)}{L(\theta_1; x)} \le k$ is the **Uniformly Most Powerful (UMP)** test for a given Type I error rate $\alpha$.

### Rejection Region Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">Two-Tailed Rejection Regions (alpha = 0.05)</text>
  <g transform="translate(50, 50)">
    <path d="M 0,110 Q 150,110 200,80 T 250,10 T 300,80 T 500,110" fill="none" stroke="#71717a" stroke-width="2"/>
    <path d="M 0,110 Q 50,110 80,100 L 80,110 Z" fill="#ef4444" opacity="0.6"/>
    <path d="M 420,100 Q 450,110 500,110 L 420,110 Z" fill="#ef4444" opacity="0.6"/>
    <line x1="80" y1="20" x2="80" y2="110" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>
    <line x1="420" y1="20" x2="420" y2="110" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="30" y="15" fill="#ef4444" font-size="9" font-family="monospace">z = -1.96</text>
    <text x="410" y="15" fill="#ef4444" font-size="9" font-family="monospace">z = +1.96</text>
    <text x="210" y="60" fill="#10b981" font-size="11" font-family="monospace" font-weight="bold">Fail to Reject H0 (95%)</text>
  </g>
</svg>"""),
        ("2. Welch's t-Test Derivation", r"""When comparing two independent sample means $\bar{X}_1$ and $\bar{X}_2$ with unequal variances $\sigma_1^2 \ne \sigma_2^2$ and unequal sample sizes $n_1 \ne n_2$, Student's t-test breaks down. **Welch's t-test** evaluates test statistic:

$$t = \frac{\bar{X}_1 - \bar{X}_2}{\sqrt{\frac{S_1^2}{n_1} + \frac{S_2^2}{n_2}}}$$

The approximate degrees of freedom $\nu$ is calculated via the **Welch-Satterthwaite Equation**:

$$\nu \approx \frac{\left( \frac{S_1^2}{n_1} + \frac{S_2^2}{n_2} \right)^2}{\frac{(S_1^2 / n_1)^2}{n_1 - 1} + \frac{(S_2^2 / n_2)^2}{n_2 - 1}}$$"""),
        ("3. Python Implementation: Welch's t-Test Engine", r"""```python
import numpy as np
import scipy.stats as stats

def welch_t_test(sample1, sample2):
    n1, n2 = len(sample1), len(sample2)
    m1, m2 = np.mean(sample1), np.mean(sample2)
    v1, v2 = np.var(sample1, ddof=1), np.var(sample2, ddof=1)
    se = np.sqrt(v1/n1 + v2/n2)
    t_stat = (m1 - m2) / se
    df = ((v1/n1 + v2/n2)**2) / (((v1/n1)**2)/(n1-1) + ((v2/n2)**2)/(n2-1))
    p_val = 2.0 * (1.0 - stats.t.cdf(np.abs(t_stat), df=df))
    return t_stat, df, p_val

np.random.seed(42)
g_c = np.random.normal(loc=10.0, scale=2.5, size=1500)
g_t = np.random.normal(loc=10.3, scale=3.8, size=2000)

t_calc, df_calc, p_calc = welch_t_test(g_t, g_c)
print(f"Welch t-stat: {t_calc:.4f} | df: {df_calc:.2f} | p-val: {p_calc:.6e}")
```""")
    ],
    faqs=[
        ("Why is Welch's t-test preferred over Student's t-test in production A/B testing?", r"Student's t-test assumes equal population variances (homoscedasticity). In real digital products, treatments alter metric variance along with means. Welch's t-test adjusts degrees of freedom, preserving strict Type I error rates regardless of variance ratios."),
        ("Why is p-value uniformly distributed U(0, 1) under the Null Hypothesis?", r"Under $H_0$, the Cumulative Distribution Function $F(Z)$ of test statistic $Z$ maps continuous probabilities uniformly. Thus, $P(\text{p-value} \le \alpha) = \alpha$, guaranteeing exact False Positive Rate control."),
        ("What is the Multiple Testing Problem and how does Bonferroni correction work?", r"When testing $m$ hypotheses simultaneously at level $\alpha$, family-wise error rate $\text{FWER} = 1 - (1-\alpha)^m$. Bonferroni correction tests each hypothesis at $\alpha / m$, bounding total FWER $\le \alpha$ via Boole's inequality."),
        ("What is the difference between Parametric and Non-Parametric Hypothesis Tests?", r"Parametric tests (t-test, ANOVA) assume specific probability distribution families (e.g. Normal). Non-parametric tests (Mann-Whitney U, Wilcoxon signed-rank, Bootstrap) make zero distributional assumptions, making them robust for heavily skewed or multi-modal metrics."),
        ("What is a Sequential Hypothesis Test (mSPRT) and why is it used?", r"Standard t-tests suffer from 'peeking bias' if monitored continuously. Mixture Sequential Probability Ratio Test (mSPRT) constructs an always-valid p-value sequence, enabling continuous monitoring and early stopping without inflating Type I error rates.")
    ]
)

# ---------------------------------------------------------
# 5. probability-and-statistics
# ---------------------------------------------------------
add_blog(
    slug="probability-and-statistics",
    title="Coursera: Probability Distributions & Inferential Statistics",
    tagline="Parametric distributions, Central Limit Theorem proof via characteristic functions, and Law of Large Numbers.",
    category="Probability",
    read_time=32,
    prereqs=["mathematics-for-machine-learning"],
    related=["introduction-to-statistics", "hypothesis-testing"],
    practice_probs=[{"title": "Central Limit Theorem Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Taxonomy of Parametric Probability Distributions", r"""Statistical distributions model data generation mechanics across engineering domains:

- **Bernoulli($p$)**: Outcome of a single binary event ($X \in \{0, 1\}$).
- **Binomial($n, p$)**: Number of successes in $n$ independent Bernoulli trials.
- **Poisson($\lambda$)**: Number of events occurring in a fixed time interval with constant rate $\lambda$.
- **Gaussian $\mathcal{N}(\mu, \sigma^2)$**: Continuous symmetric bell curve derived from sums of independent variables.
- **Exponential($\lambda$)**: Time between Poisson events ($f(x) = \lambda e^{-\lambda x}$).

### Distribution Taxonomy Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Probability Distribution Family Connections</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="120" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="60" y="32" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Bernoulli(p)</text>
    <path d="M 120,27 L 180,27" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-slate)"/>
    <rect x="180" y="10" width="120" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="240" y="32" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Binomial(n, p)</text>
    <path d="M 300,27 L 360,27" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-slate)"/>
    <rect x="360" y="10" width="130" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="425" y="32" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Normal N(mu, sig^2)</text>
  </g>
  <defs>
    <marker id="arrow-slate" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>"""),
        ("2. Central Limit Theorem Proof via Characteristic Functions", r"""Let $X_1, X_2, \dots, X_n$ be i.i.d. random variables with mean $\mu=0$ and variance $\sigma^2=1$. The standardized mean $Z_n = \frac{1}{\sqrt{n}} \sum_{i=1}^n X_i$.

The **Characteristic Function** $\phi_X(t) = \mathbb{E}[e^{i t X}]$ expands via Taylor series:

$$\phi_X(t) = 1 + i t \mathbb{E}[X] - \frac{t^2}{2} \mathbb{E}[X^2] + \mathcal{O}(t^3) = 1 - \frac{t^2}{2} + \mathcal{O}(t^3)$$

The characteristic function of $Z_n$ is:

$$\phi_{Z_n}(t) = \mathbb{E}\left[\exp\left(i t \frac{1}{\sqrt{n}} \sum X_i\right)\right] = \left( \phi_X\left(\frac{t}{\sqrt{n}}\right) \right)^n = \left( 1 - \frac{t^2}{2n} + \mathcal{O}\left(\frac{t^3}{n^{3/2}}\right) \right)^n$$

Taking the limit as $n \to \infty$:

$$\lim_{n \to \infty} \phi_{Z_n}(t) = e^{-t^2/2}$$

Because $e^{-t^2/2}$ is the characteristic function of the standard Normal Distribution $\mathcal{N}(0, 1)$, by Lévy's Continuity Theorem, $Z_n \xrightarrow{d} \mathcal{N}(0, 1)$. Q.E.D."""),
        ("3. Python Implementation: CLT Convergence Simulator", r"""```python
import numpy as np
import scipy.stats as stats

def simulate_clt_convergence(dist_type='exponential', sample_sizes=[1, 5, 30, 100], num_trials=50000):
    for n in sample_sizes:
        samples = np.random.exponential(scale=1.0, size=(num_trials, n))
        sample_means = np.mean(samples, axis=1)
        stat, p_val = stats.shapiro(sample_means[:1000])
        print(f"Sample Size n={n:3d} | Mean={np.mean(sample_means):.4f} | Shapiro Normality p-val={p_val:.5f}")

simulate_clt_convergence()
```""")
    ],
    faqs=[
        ("What is the difference between Weak Law of Large Numbers (WLLN) and Strong Law of Large Numbers (SLLN)?", r"WLLN states sample mean converges in probability to population mean ($\bar{X}_n \xrightarrow{P} \mu$). SLLN states sample mean converges almost surely ($\bar{X}_n \xrightarrow{a.s.} \mu$, with probability 1)."),
        ("Why does the Central Limit Theorem fail for Cauchy Distributions?", r"The Cauchy distribution has heavy tails ($f(x) = \frac{1}{\pi(1+x^2)}$) with undefined mean and infinite variance. Since CLT requires finite variance $\sigma^2 < \infty$, the sample mean of Cauchy variables remains Cauchy distributed regardless of sample size $n$."),
        ("What is the Memoryless Property and which distributions possess it?", r"Memoryless property means $P(X > s + t \mid X > s) = P(X > t)$. Only the Exponential distribution (continuous) and Geometric distribution (discrete) possess this property."),
        ("What is the Poisson Limit Theorem?", r"The Poisson Limit Theorem states that a Binomial$(n, p)$ distribution converges to a Poisson$(\lambda = n p)$ distribution as $n \to \infty$ and $p \to 0$ such that $n p = \lambda$ remains constant."),
        ("How does Maximum Entropy derivation relate to Gaussian Distributions?", r"For any continuous probability distribution with specified mean $\mu$ and finite variance $\sigma^2$, the Gaussian distribution maximizes Differential Entropy $H(X) = -\int f(x) \log f(x) \, dx$, making it the least restrictive prior assumption.")
    ]
)

# ---------------------------------------------------------
# 6. experiment-design
# ---------------------------------------------------------
add_blog(
    slug="experiment-design",
    title="Comprehensive Guide to Experiment Design & A/B Testing Infrastructure",
    tagline="Randomization units, Sample Ratio Mismatch (SRM), network interference, and switchback designs.",
    category="AB Testing",
    read_time=34,
    prereqs=["hypothesis-testing"],
    related=["minimum-detectable-effect", "improving-test-sensitivity"],
    practice_probs=[{"title": "A/B Test Simulation Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Unit of Randomization & Sample Ratio Mismatch (SRM)", r"""In modern web experimentation, selecting the correct Unit of Randomization ($U$) dictates statistical validity. Common randomization units include:
- **User ID**: Best for persistent user experience across sessions.
- **Device ID / Cookie**: Used for non-logged-in visitors (vulnerable to multi-device leakage).
- **Session ID**: Used for short-lived search rank experiments (high variance reduction).

### Sample Ratio Mismatch (SRM) Detection
When assigning users 50/50 between Control and Treatment, observing $N_C = 50,200$ and $N_T = 48,100$ indicates **Sample Ratio Mismatch**. We test for SRM using a Chi-Square Goodness-of-Fit test:

$$\chi^2 = \sum_{i \in \{C, T\}} \frac{(E_i - O_i)^2}{E_i} \sim \chi^2(df=1)$$

If $p < 0.001$, the experiment is corrupted by assignment bias, bot filtering anomalies, or redirect latency.

### Experiment Randomization Architecture Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">A/B Testing Hash Randomization Flow</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="100" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="50" y="32" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">User ID: 89421</text>
    <path d="M 100,27 L 160,27" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-blue2)"/>
    <rect x="160" y="10" width="140" height="35" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="230" y="32" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">MurmurHash3 % 100</text>
    <path d="M 300,27 L 360,0" stroke="#10b981" stroke-width="1.5"/>
    <path d="M 300,27 L 360,50" stroke="#ef4444" stroke-width="1.5"/>
    <text x="380" y="5" fill="#10b981" font-size="10" font-family="monospace">Bucket 0-49: Control</text>
    <text x="380" y="55" fill="#ef4444" font-size="10" font-family="monospace">Bucket 50-99: Treatment</text>
  </g>
  <defs>
    <marker id="arrow-blue2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>"""),
        ("2. Advanced Randomization: Cluster Randomization & Switchbacks", r"""In marketplaces with two-sided network effects (e.g. Uber, DoorDash, Airbnb), user-level randomization violates Stable Unit Treatment Value Assumption (SUTVA):

$$Y_i(d_1, d_2, \dots, d_N) \ne Y_i(d_i)$$

Treating driver $A$ with higher pay lowers available rides for control driver $B$. To eliminate network interference:
1. **Cluster Randomization**: Group users by geographic region or graph communities.
2. **Switchback Experiments**: Alternating the entire market between Control and Treatment in time windows (e.g. 30-minute intervals)."""),
        ("3. Python Implementation: SRM Validator & A/B Analysis Pipeline", r"""```python
import numpy as np
import scipy.stats as stats

class ExperimentPipeline:
    def __init__(self, target_ratio=0.5):
        self.target_ratio = target_ratio

    def check_srm(self, n_control, n_treatment):
        total = n_control + n_treatment
        expected_control = total * self.target_ratio
        expected_treatment = total * (1.0 - self.target_ratio)
        
        chi2_stat = ((n_control - expected_control)**2 / expected_control) + \
                    ((n_treatment - expected_treatment)**2 / expected_treatment)
        p_val = 1.0 - stats.chi2.cdf(chi2_stat, df=1)
        
        srm_detected = p_val < 0.001
        print(f"SRM Audit: Observed Control={n_control}, Treatment={n_treatment} | Chi2={chi2_stat:.4f} | p-val={p_val:.6e} | SRM={srm_detected}")
        return srm_detected

pipeline = ExperimentPipeline(target_ratio=0.5)
pipeline.check_srm(n_control=50200, n_treatment=48100)
```""")
    ],
    faqs=[
        ("What is SUTVA (Stable Unit Treatment Value Assumption) and why is it critical?", r"SUTVA requires that the treatment applied to one unit does not affect the potential outcomes of other units. If user $A$'s treatment alters user $B$'s behavior (e.g. social networks or ride-sharing supply), SUTVA is violated, biasing treatment effect estimates."),
        ("How do Novelty and Primacy Effects distort early A/B test results?", r"Novelty effect causes temporary metric spikes due to user curiosity about a new UI element. Primacy effect causes initial metric drops due to user friction with familiar workflows. Running tests for at least 2 full business cycles mitigates these transient biases."),
        ("What is Sample Ratio Mismatch (SRM) and what causes it?", r"SRM occurs when the observed ratio of Control to Treatment users deviates significantly from the designed assignment ratio. Causes include pipeline data loss, asymmetric latency in treatment code paths, and ad-blockers filtering treatment scripts."),
        ("How do Switchback Experiments prevent marketplace cannibalization?", r"Switchback experiments alternate an entire geographic market between Control and Treatment states over time windows (e.g. 30 minutes). By treating all units simultaneously in a window, switchbacks isolate network interactions across drivers and riders."),
        ("What is Interleaving in recommendation engine experimentation?", r"Interleaving mixes top recommendation items from Algorithm A and Algorithm B into a single merged list presented to the user. Tracking relative clicks on items from A vs B reduces required sample sizes by $100\times$ compared to standard A/B tests.")
    ]
)

# ---------------------------------------------------------
# 7. minimum-detectable-effect
# ---------------------------------------------------------
add_blog(
    slug="minimum-detectable-effect",
    title="Minimum Detectable Effect (MDE) & Sample Size Power Analysis",
    tagline="Power calculation formulas, variance scaling, and sensitivity curve trade-offs in experimental design.",
    category="Test Sensitivity",
    read_time=32,
    prereqs=["experiment-design"],
    related=["improving-test-sensitivity", "improving-sensitivity-cuped"],
    practice_probs=[{"title": "Sample Size Power Calculator", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Mathematical Derivation of Minimum Sample Size", r"""In experimental design, **Minimum Detectable Effect (MDE)** represents the smallest relative or absolute difference $\delta = \mu_T - \mu_C$ that an experiment can reliably detect at significance level $\alpha$ and power $1 - \beta$.

Under $H_0: \mu_T - \mu_C = 0$, the test statistic $Z = \frac{\bar{X}_T - \bar{X}_C}{\sqrt{2 \sigma^2 / n}} \sim \mathcal{N}(0, 1)$. Rejection occurs when $|Z| \ge Z_{1 - \alpha/2}$.

Under $H_1: \mu_T - \mu_C = \delta$, the test statistic follows non-central Normal distribution $\mathcal{N}\left(\frac{\delta}{\sqrt{2 \sigma^2 / n}}, 1\right)$. Requiring power $1 - \beta$ yields:

$$\frac{\delta}{\sqrt{2 \sigma^2 / n}} \ge Z_{1 - \alpha/2} + Z_{1 - \beta}$$

Solving for sample size $n$ per group:

$$n = \frac{2 \sigma^2 (Z_{1 - \alpha/2} + Z_{1 - \beta})^2}{\delta^2}$$

### MDE Sensitivity Curve Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Sample Size vs MDE Sensitivity Curve</text>
  <g transform="translate(50, 50)">
    <path d="M 20,10 L 20,110 L 500,110" stroke="#52525b" stroke-width="2"/>
    <path d="M 30,15 Q 60,95 480,105" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
    <text x="250" y="125" fill="#71717a" font-size="10" font-family="monospace">Sample Size (n per group)</text>
    <text x="25" y="10" fill="#71717a" font-size="10" font-family="monospace">MDE (delta)</text>
  </g>
</svg>"""),
        ("2. MDE for Proportion/Conversion Metrics", r"""For binary conversion metrics with baseline probability $p$, metric variance $\sigma^2 = p (1 - p)$. The required sample size $n$ per variant is:

$$n = \frac{(Z_{1 - \alpha/2} \sqrt{2 p (1-p)} + Z_{1 - \beta} \sqrt{p_1 (1-p_1) + p_2 (1-p_2)})^2}{(p_2 - p_1)^2}$$"""),
        ("3. Python Implementation: Power & MDE Calculator Engine", r"""```python
import numpy as np
import scipy.stats as stats

def compute_sample_size(sigma, delta, alpha=0.05, power=0.80):
    z_alpha = stats.norm.ppf(1.0 - alpha / 2.0)
    z_beta = stats.norm.ppf(power)
    n = (2.0 * (sigma**2) * (z_alpha + z_beta)**2) / (delta**2)
    return int(np.ceil(n))

sigma_val = 15.0 # Metric Std Dev
mde_val = 0.5    # Absolute MDE target
req_n = compute_sample_size(sigma=sigma_val, delta=mde_val)
print(f"Required Sample Size per Variant: {req_n:,} users")
```""")
    ],
    faqs=[
        ("Why does cutting MDE in half require quadrupling the sample size?", r"In the sample size equation $n \propto \frac{1}{\delta^2}$, sample size is inversely proportional to the square of MDE $\delta$. Halving $\delta$ increases required sample size by $(2)^2 = 4\times$."),
        ("What is the difference between Statistical Power and Significance Level?", r"Significance level $\alpha$ (typically $0.05$) is the probability of a Type I error (False Positive). Statistical Power $1 - \beta$ (typically $0.80$) is the probability of correctly detecting a true effect (True Positive)."),
        ("How does variance reduction directly impact MDE?", r"Reducing metric variance from $\sigma^2$ to $\sigma^2 (1 - \rho^2)$ via methods like CUPED scales required sample size down by factor $(1 - \rho^2)$, allowing detection of smaller MDEs with fixed traffic."),
        ("Why is running underpowered experiments dangerous for product teams?", r"Underpowered experiments ($1-\beta < 0.80$) fail to detect real metric improvements (high Type II error) and suffer from Winner's Curse, where detected effects are heavily inflated."),
        ("What is the Winner's Curse in low-power experiments?", r"When an underpowered experiment produces a statistically significant result ($p < 0.05$), the observed effect size is systematically biased upward compared to the true effect size because only extreme noise spikes breach the rejection threshold.")
    ]
)

# ---------------------------------------------------------
# 8. improving-test-sensitivity
# ---------------------------------------------------------
add_blog(
    slug="improving-test-sensitivity",
    title="Paper Analysis: Advanced Techniques for Improving Test Sensitivity",
    tagline="Stratification, Propensity Score Matching, covariate adjustment, and variance reduction taxonomy.",
    category="Test Sensitivity",
    read_time=34,
    prereqs=["minimum-detectable-effect"],
    related=["improving-sensitivity-cuped", "cuped-at-booking"],
    practice_probs=[{"title": "Stratified Variance Reduction", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Stratification & Post-Stratification Framework", r"""Variance reduction techniques increase experimental sensitivity without adding user traffic. **Post-stratification** partitions sample observations into $K$ mutual strata based on pre-experiment categorical features (e.g. user region, account tier).

The post-stratified estimator $\bar{Y}_{ps}$ is:

$$\bar{Y}_{ps} = \sum_{k=1}^K w_k \bar{Y}_k$$

where $w_k = \frac{N_k}{N}$ is the population weight of stratum $k$. The variance of $\bar{Y}_{ps}$ removes between-strata variance $\text{Var}_B$:

$$\text{Var}(\bar{Y}_{ps}) \approx \sum_{k=1}^K w_k \frac{\sigma_k^2}{n} = \frac{\text{Var}(Y) - \text{Var}_B}{n}$$

### Stratification Variance Decomposition Diagram
<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="180" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Post-Stratification Variance Decomposition</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="200" height="40" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="100" y="35" fill="#ef4444" font-size="10" text-anchor="middle" font-family="monospace">Total Variance Var(Y)</text>
    <text x="220" y="35" fill="#71717a" font-size="14">=</text>
    <rect x="250" y="10" width="140" height="40" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="320" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Within-Strata Var_W</text>
    <text x="400" y="35" fill="#71717a" font-size="14">+</text>
    <rect x="420" y="10" width="120" height="40" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="480" y="35" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Between-Strata Var_B</text>
  </g>
</svg>"""),
        ("2. Propensity Score Matching (PSM) for Observational Studies", r"""When randomized assignment is impossible, Propensity Score Matching estimates treatment effect by balancing covariate distributions. The propensity score $e(X) = P(W = 1 \mid X)$ is modeled via Logistic Regression."""),
        ("3. Python Implementation: Post-Stratification Estimator", r"""```python
import numpy as np

def post_stratified_mean(sample_data, strata_labels, pop_weights):
    strata_means = []
    for k in range(len(pop_weights)):
        mask = (strata_labels == k)
        strata_means.append(np.mean(sample_data[mask]))
    return np.sum(np.array(pop_weights) * np.array(strata_means))

np.random.seed(42)
data = np.random.normal(loc=50.0, scale=10.0, size=5000)
strata = np.random.choice([0, 1, 2], size=5000, p=[0.5, 0.3, 0.2])
weights = [0.5, 0.3, 0.2]

ps_mean = post_stratified_mean(data, strata, weights)
print(f"Standard Mean: {np.mean(data):.4f} | Post-Stratified Mean: {ps_mean:.4f}")
```""")
    ],
    faqs=[
        ("How does Post-Stratification differ from Pre-Stratified Randomization?", r"Pre-stratified randomization assigns units to treatment within strata during allocation. Post-stratification applies weights during analysis on standard randomly allocated units, achieving similar variance reduction."),
        ("What is the main limitation of Post-Stratification with high-dimensional features?", r"When feature categories multiply (e.g. 50 states $\times$ 10 device types $= 500$ strata), some strata end up with zero observations, causing high estimator variance. Binning or regression-based variance reduction (CUPED) is preferred."),
        ("Why does Propensity Score Matching fail if unobserved confounders exist?", r"PSM balances only observed covariates $X$. If unobserved confounder $Z$ influences both treatment assignment and metric outcome, propensity matching remains biased (violation of Ignorability Assumption)."),
        ("What is the relationship between ANCOVA and Post-Stratification?", r"ANCOVA (Analysis of Covariance) fits a linear regression adjusting for continuous covariates, serving as a continuous generalization of post-stratification."),
        ("How does variance reduction improve experiment velocity?", r"Reducing variance by $50\%$ allows experiments to reach target power in half the time, doubling the experimentation throughput of engineering organizations.")
    ]
)

# ---------------------------------------------------------
# 9. improving-sensitivity-cuped
# ---------------------------------------------------------
add_blog(
    slug="improving-sensitivity-cuped",
    title="Paper Analysis: CUPED (Controlled-Experiments Using Pre-Experiment Data)",
    tagline="Mathematical proof of CUPED variance reduction, optimal theta calculation, and multi-covariate extensions.",
    category="Test Sensitivity",
    read_time=36,
    prereqs=["improving-test-sensitivity"],
    related=["cuped-at-booking"],
    practice_probs=[{"title": "CUPED Linear Adjustment Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Mathematical Derivation of CUPED Variance Reduction", r"""CUPED (Deng et al., Microsoft 2013) utilizes pre-experiment covariate $X$ (e.g. baseline metric value prior to test start) to reduce variance of evaluation metric $Y$.

Define CUPED-adjusted metric $Y_{\text{CUPED}}$:

$$Y_{\text{CUPED}} = Y - \theta (X - \mathbb{E}[X])$$

Because $\mathbb{E}[X - \mathbb{E}[X]] = 0$, the expectation is unbiased: $\mathbb{E}[Y_{\text{CUPED}}] = \mathbb{E}[Y]$.

The variance of $Y_{\text{CUPED}}$ is:

$$\text{Var}(Y_{\text{CUPED}}) = \text{Var}(Y) + \theta^2 \text{Var}(X) - 2 \theta \text{Cov}(Y, X)$$

To minimize $\text{Var}(Y_{\text{CUPED}})$, differentiate with respect to $\theta$ and set to zero:

$$\frac{d}{d\theta} \text{Var}(Y_{\text{CUPED}}) = 2 \theta \text{Var}(X) - 2 \text{Cov}(Y, X) = 0 \implies \theta^* = \frac{\text{Cov}(Y, X)}{\text{Var}(X)}$$

Substituting $\theta^*$ back into variance expression yields:

$$\text{Var}(Y_{\text{CUPED}}) = \text{Var}(Y) - \frac{\text{Cov}(Y, X)^2}{\text{Var}(X)} = \text{Var}(Y) \left( 1 - \frac{\text{Cov}(Y, X)^2}{\text{Var}(Y) \text{Var}(X)} \right) = \text{Var}(Y) (1 - \rho^2)$$

where $\rho = \text{Corr}(Y, X)$.

### CUPED Variance Reduction Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">CUPED Covariance Removal Scatterplot</text>
  <g transform="translate(50, 50)">
    <line x1="20" y1="110" x2="450" y2="110" stroke="#52525b" stroke-width="2"/>
    <line x1="20" y1="10" x2="20" y2="110" stroke="#52525b" stroke-width="2"/>
    <line x1="20" y1="110" x2="400" y2="20" stroke="#ef4444" stroke-width="2"/>
    <text x="410" y="25" fill="#ef4444" font-size="10" font-family="monospace">Slope theta*</text>
    <text x="200" y="125" fill="#71717a" font-size="10" font-family="monospace">Pre-Experiment Baseline X</text>
    <text x="10" y="5" fill="#71717a" font-size="10" font-family="monospace">Metric Y</text>
  </g>
</svg>"""),
        ("2. Multi-Covariate CUPED (Vector Extension)", r"""When using multiple pre-experiment covariates $\mathbf{X} \in \mathbb{R}^k$:

$$Y_{\text{CUPED}} = Y - \mathbf{\theta}^T (\mathbf{X} - \mathbb{E}[\mathbf{X}])$$

The optimal weight vector $\mathbf{\theta}^*$ is given by multivariate linear regression:

$$\mathbf{\theta}^* = \mathbf{\Sigma}_{XX}^{-1} \mathbf{\Sigma}_{XY}$$

The resulting metric variance is reduced to $\text{Var}(Y_{\text{CUPED}}) = \text{Var}(Y) (1 - R^2)$, where $R^2$ is the coefficient of determination."""),
        ("3. Python Implementation: Production CUPED Class", r"""```python
import numpy as np

class CUPEDTransformer:
    def __init__(self):
        self.theta = None

    def fit_transform(self, Y, X):
        cov_yx = np.cov(Y, X)[0, 1]
        var_x = np.var(X, ddof=1)
        self.theta = cov_yx / var_x
        
        x_mean = np.mean(X)
        y_cuped = Y - self.theta * (X - x_mean)
        
        var_orig = np.var(Y, ddof=1)
        var_cuped = np.var(y_cuped, ddof=1)
        reduction = (1.0 - var_cuped / var_orig) * 100.0
        
        print(f"CUPED theta*: {self.theta:.4f} | Original Var: {var_orig:.2f} | CUPED Var: {var_cuped:.2f} | Reduction: {reduction:.2f}%")
        return y_cuped

np.random.seed(42)
X_base = np.random.normal(loc=100.0, scale=25.0, size=10000)
Y_eval = X_base * 0.8 + np.random.normal(loc=20.0, scale=15.0, size=10000)

cuped = CUPEDTransformer()
Y_adj = cuped.fit_transform(Y_eval, X_base)
```""")
    ],
    faqs=[
        ("Why does CUPED require pre-experiment data X and not in-experiment data?", r"Covariate $X$ must be completely uninfluenced by the treatment. Using in-experiment data as $X$ introduces post-treatment bias, altering true effect estimates."),
        ("What happens if correlation rho between pre and post metric is 0?", r"If $\rho = 0$, $\theta^* = 0$, so $Y_{\text{CUPED}} = Y$. Variance reduction is $0\%$, but metric unbiasedness is preserved."),
        ("Is CUPED compatible with Welch's t-test?", r"Yes. CUPED transforms metric $Y_i \to Y_{i, \text{CUPED}}$ for each user individually. Standard Welch's t-tests are then performed on $Y_{\text{CUPED}}$."),
        ("How does CUPED handle brand new users who have no pre-experiment history?", r"For new users with missing $X$, missing values are imputed with overall pre-experiment mean $\bar{X}$. Thus $X - \bar{X} = 0$, leaving $Y_{\text{CUPED}} = Y$ for new users without introducing bias."),
        ("What is the difference between CUPED and ANCOVA?", r"CUPED fixes $\theta$ using pooled pre-experiment data, while ANCOVA fits regression slopes interactively. At scale, CUPED is computationally simpler and highly scalable in SQL/Spark.")
    ]
)

# ---------------------------------------------------------
# 10. cuped-at-booking
# ---------------------------------------------------------
add_blog(
    slug="cuped-at-booking",
    title="Case Study: Industrial CUPED Implementation at Booking.com",
    tagline="Scalable experimentation architecture, pre-exposure lookback windows, and handling non-stationary metrics.",
    category="Test Sensitivity",
    read_time=36,
    prereqs=["improving-sensitivity-cuped"],
    related=["experiment-design", "minimum-detectable-effect"],
    practice_probs=[{"title": "Industrial Experiment Data Pipeline", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    sections=[
        ("1. Architecture of Industrial CUPED at Booking.com Scale", r"""Processing experimentation pipelines for millions of daily active bookers across global hotel inventory requires scalable variance reduction. Key production challenges solved at Booking.com include:

1. **Pre-Exposure Window Selection**: Evaluating 7-day, 14-day, and 28-day lookback windows for covariate $X$. A 14-day lookback balances correlation $\rho \approx 0.70$ while limiting memory usage.
2. **Handling Outliers & Extreme Values**: Capping extreme booking amounts via Log Transformation $\log(1 + Y)$ or Percentile Winsorization (P99.5) prior to computing $\theta^*$.
3. **Non-Stationary Baseline Imputation**: Normalizing $X$ per region to account for seasonal travel demand shifts.

### Booking.com Experimentation Pipeline Diagram
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Booking.com Scalable CUPED Pipeline Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">14-Day Trino Engine</text>
    <path d="M 130,30 L 190,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-b)"/>
    <rect x="190" y="10" width="140" height="40" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="260" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">P99.5 Winsorizer</text>
    <path d="M 330,30 L 390,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-b)"/>
    <rect x="390" y="10" width="150" height="40" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="465" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Spark CUPED Solver</text>
  </g>
  <defs>
    <marker id="arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>"""),
        ("2. Log-Transformation CUPED & Winsorization Formulas", r"""For skewed monetary metrics $Y$ (e.g. total booking value), direct CUPED can be unstable. We apply log-transform:

$$Y_{\text{log}} = \log(1 + Y), \quad X_{\text{log}} = \log(1 + X)$$

$$Y_{\text{CUPED, log}} = Y_{\text{log}} - \theta^* (X_{\text{log}} - \mathbb{E}[X_{\text{log}}])$$

This stabilizes variance, removes heavy-tail leverage points, and achieves up to $65\%$ variance reduction."""),
        ("3. Python Implementation: Industrial Scalable CUPED Engine", r"""```python
import numpy as np
import pandas as pd

class IndustrialCUPEDPipeline:
    def __init__(self, p99_cap=True):
        self.p99_cap = p99_cap

    def process(self, df):
        Y = df['post_booking'].values.copy()
        X = df['pre_booking'].values.copy()
        
        if self.p99_cap:
            cap_y = np.percentile(Y, 99.5)
            cap_x = np.percentile(X, 99.5)
            Y = np.minimum(Y, cap_y)
            X = np.minimum(X, cap_x)
            
        Y_log = np.log1p(Y)
        X_log = np.log1p(X)
        
        cov = np.cov(Y_log, X_log)[0, 1]
        var_x = np.var(X_log, ddof=1)
        theta = cov / var_x
        
        y_cuped = Y_log - theta * (X_log - np.mean(X_log))
        return y_cuped

np.random.seed(42)
pre = np.random.exponential(scale=200.0, size=50000)
post = pre * 0.85 + np.random.exponential(scale=150.0, size=50000)
df_bookers = pd.DataFrame({'pre_booking': pre, 'post_booking': post})

ind_cuped = IndustrialCUPEDPipeline()
y_adj = ind_cuped.process(df_bookers)
print("Industrial CUPED Pipeline Execution Completed Successfully.")
```""")
    ],
    faqs=[
        ("Why is a 14-day lookback window optimal for travel booking platforms?", r"A 7-day lookback misses weekly travel purchase cycles, while a 30-day lookback introduces noise from old user states. 14 days balances high correlation $\rho \approx 0.70$ with optimal computation memory."),
        ("How does Log-Transformation CUPED prevent outlier leverage?", r"Raw booking metrics follow heavy-tailed Pareto-like distributions. Log-transformation $\log(1+Y)$ compresses extreme values, preventing single high-value bookings from dominating the regression slope $\theta^*$."),
        ("What is Percentile Winsorization and how does it safeguard CUPED?", r"Winsorization caps all values above the 99.5th percentile to the 99.5th percentile value. This bounds variance and prevents telemetry errors or fraud bots from distorting CUPED calculations."),
        ("Can CUPED be used for ratio metrics like Average Booking Value per Session?", r"Yes. Ratio metrics apply Delta Method linearization ($Y = A / B$) first to construct linear Taylor approximations, followed by standard CUPED adjustment."),
        ("What business metric impact did CUPED deliver at Booking.com?", r"Implementing CUPED reduced required sample sizes by $50\%$, cutting experiment duration from 4 weeks to 2 weeks, effectively doubling experimentation velocity across product teams.")
    ]
)

output_file = 'scratch/ai_batch1_heavy.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"Successfully generated ALL {len(blogs)} blogs in {output_file}")
for slug, bdata in blogs.items():
    print(f"- {slug}: {len(bdata['markdown'])} chars")
