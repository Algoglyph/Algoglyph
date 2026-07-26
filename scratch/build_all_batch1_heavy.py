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

# ----------------------------------------------------
# BLOG 1: mathematics-for-machine-learning
# ----------------------------------------------------
sec_1_1 = r"""Linear Algebra is the mathematics of high-dimensional vector spaces. In machine learning, every data sample with $d$ features is a vector $x \in \mathbb{R}^d$:

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
</svg>"""

sec_1_2 = r"""For a symmetric matrix $A \in \mathbb{R}^{d \times d}$ (such as feature covariance matrix $\Sigma = \frac{1}{n} X^T X$), the Spectral Theorem guarantees diagonalization:

$$A = Q \Lambda Q^T = \sum_{i=1}^d \lambda_i q_i q_i^T$$

where $q_i$ are orthonormal eigenvectors ($q_i^T q_j = \delta_{ij}$) and $\lambda_i$ are corresponding eigenvalues.

### Singular Value Decomposition (SVD)
For arbitrary rectangular matrix $X \in \mathbb{R}^{n \times d}$:

$$X = U \Sigma V^T$$

- $U \in \mathbb{R}^{n \times n}$: Left singular vectors (eigenvectors of $X X^T$).
- $\Sigma \in \mathbb{R}^{n \times d}$: Singular values $\sigma_i = \sqrt{\lambda_i(X^T X)}$.
- $V \in \mathbb{R}^{d \times d}$: Right singular vectors (eigenvectors of $X^T X$).

Truncating SVD to rank $k \ll d$ yields optimal low-rank matrix approximation under Frobenius norm $\|X - X_k\|_F$ (Eckart-Young-Mirsky Theorem)."""

sec_1_3 = r"""The gradient $\nabla f(x)$ of scalar function $f: \mathbb{R}^d \to \mathbb{R}$ collects first-order partial derivatives:

$$\nabla f(x) = \begin{bmatrix} \frac{\partial f}{\partial x_1} \\ \frac{\partial f}{\partial x_2} \\ \vdots \\ \frac{\partial f}{\partial x_d} \end{bmatrix} \in \mathbb{R}^d$$

When composing functions $z = g(x)$ where $g: \mathbb{R}^d \to \mathbb{R}^m$, the multivariate chain rule multiplies Jacobian matrices $J_g(x) \in \mathbb{R}^{m \times d}$:

$$J_g(x) = \begin{bmatrix} \frac{\partial g_1}{\partial x_1} & \cdots & \frac{\partial g_1}{\partial x_d} \\ \vdots & \ddots & \vdots \\ \frac{\partial g_m}{\partial x_1} & \cdots & \frac{\partial g_m}{\partial x_d} \end{bmatrix}$$

$$\nabla_x (f \circ g)(x) = J_g(x)^T \nabla_z f(z)$$

The Hessian Matrix $H_f(x) \in \mathbb{R}^{d \times d}$ collects second-order partial derivatives:

$$H_f(x)_{ij} = \frac{\partial^2 f}{\partial x_i \partial x_j}$$

Taylor's second-order local quadratic approximation is given by:

$$f(x + \Delta x) \approx f(x) + \nabla f(x)^T \Delta x + \frac{1}{2} \Delta x^T H_f(x) \Delta x$$"""

sec_1_4 = r"""A function $f: C \to \mathbb{R}$ on a convex set $C$ is convex if:

$$f(\alpha x + (1-\alpha) y) \le \alpha f(x) + (1-\alpha) f(y) \quad \forall x, y \in C, \alpha \in [0, 1]$$

For twice-differentiable functions, convexity is equivalent to $H_f(x) \succeq 0$ (PSD Hessian). In convex optimization, every local minimum is a global minimum.

### Karush-Kuhn-Tucker (KKT) Conditions
For constrained optimization $\min_x f(x)$ subject to $g_i(x) \le 0$ and $h_j(x) = 0$:

$$\mathcal{L}(x, \lambda, \nu) = f(x) + \sum_{i=1}^m \lambda_i g_i(x) + \sum_{j=1}^p \nu_j h_j(x)$$

1. **Stationarity**: $\nabla_x \mathcal{L}(x^*, \lambda^*, \nu^*) = 0$
2. **Primal Feasibility**: $g_i(x^*) \le 0, \quad h_j(x^*) = 0$
3. **Dual Feasibility**: $\lambda_i^* \ge 0$
4. **Complementary Slackness**: $\lambda_i^* g_i(x^*) = 0 \quad \forall i=1..m$"""

sec_1_5 = r"""```python
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
```"""

faqs_1 = [
    ("Why do we prefer Gradient Descent over Newton's Method in Deep Learning?", "While Newton's method achieves quadratic convergence rate ($O(\\text{iterations}) = 1$ step for pure quadratics), computing and inverting the Hessian matrix $H \\in \\mathbb{R}^{d \\times d}$ costs $O(d^3)$ time and $O(d^2)$ space. In deep learning where parameters $d > 10^9$, storing and inverting an $10^9 \\times 10^9$ matrix is computationally intractable. First-order methods like Adam and SGD require only $O(d)$ memory."),
    ("What is the intuitive difference between Eigenvalues and Singular Values?", "Eigenvalues and eigenvectors are defined only for square matrices ($A x = \\lambda x$) and represent scaling factors along invariant directions. Singular values are defined for any $m \\times n$ matrix ($X v_i = \\sigma_i u_i$). The singular values of $X$ are the square roots of the non-zero eigenvalues of $X^T X$ (or $X X^T$)."),
    ("Why does L1 regularization cause weight sparsity while L2 regularization does not?", "L1 regularization adds $\|w\|_1 = \\sum |w_i|$ to the loss. Geometrically, the L1 constraint region is a diamond with sharp corners along coordinate axes. Contour lines of the loss function intersect the diamond at these axis corners, setting parameters to exactly 0. L2 regularization adds $\|w\|_2^2$, which forms a smooth sphere constraint, pulling weights toward zero without setting them strictly to zero."),
    ("What is the condition number of a matrix and why does it affect model training?", "The condition number $\\kappa(A) = \\frac{\\sigma_{\\max}(A)}{\\sigma_{\\min}(A)}$ measures sensitivity of linear equations to numerical errors. If $\\kappa(A)$ is large, the matrix is ill-conditioned, causing gradient descent optimization trajectories to oscillate wildly across steep ravine contours rather than heading directly toward the minimum."),
    ("How does Jensen's Inequality apply to Machine Learning?", "Jensen's Inequality states that for a convex function $f$ and a random variable $X$, $f(\\mathbb{E}[X]) \\le \\mathbb{E}[f(X)]$. For concave functions (like $\\log$), $\\mathbb{E}[\\log X] \\le \\log \\mathbb{E}[X]$. This inequality underpins the derivation of the Evidence Lower Bound (ELBO) in Variational Autoencoders (VAEs) and the Expectation-Maximization (EM) algorithm.")
]

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
        ("1. Vector Spaces, Inner Products, and Metric Norms", sec_1_1),
        ("2. Matrix Spectral Theorem & Singular Value Decomposition (SVD)", sec_1_2),
        ("3. Multivariate Calculus: Gradients, Jacobians, and Hessians", sec_1_3),
        ("4. Convex Optimization & KKT Conditions", sec_1_4),
        ("5. Python Implementation: First-Order vs Second-Order Optimization", sec_1_5)
    ],
    faqs=faqs_1
)

# ----------------------------------------------------------------------
# 2. algebra-differential-calculus
# ----------------------------------------------------------------------
sec_2_1 = r"""Linear transformations preserve vector addition and scalar multiplication:

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
</svg>"""

sec_2_2 = r"""The directional derivative $D_v f(x)$ evaluates the rate of change of $f$ along unit vector $v \in \mathbb{R}^n$:

$$D_v f(x) = \lim_{h \to 0} \frac{f(x + h v) - f(x)}{h} = \nabla f(x)^T v = \|\nabla f(x)\|_2 \|v\|_2 \cos(\theta)$$

Because $\cos(\theta) \le 1$, $D_v f(x)$ is maximized when $v$ aligns with $\nabla f(x)$ ($\theta = 0$), establishing that the gradient vector points in the exact direction of steepest rate of increase.

### Automatic Differentiation Architecture
Computational graphs compose elementary operations. For node chain $x \to y \to z$:

$$J_{f \circ g}(x) = J_f(y) \cdot J_g(x)$$

Forward-mode AD evaluates $J \cdot v$ concurrently with the forward pass ($n \ll m$). Reverse-mode AD (Backpropagation) evaluates $v^T J$ backward from scalar loss ($m=1, n \gg 1$)."""

sec_2_3 = r"""The multivariate Taylor series around expansion point $a \in \mathbb{R}^n$ is given by:

$$f(x) = f(a) + \nabla f(a)^T (x - a) + \frac{1}{2} (x - a)^T H_f(a) (x - a) + \mathcal{O}(\|x - a\|^3)$$

At stationary points ($\nabla f(a) = 0$), the eigenvalues of Hessian $H_f(a)$ dictate local topography:
- All $\lambda_i > 0$: Strict local minimum.
- All $\lambda_i < 0$: Strict local maximum.
- Mixed signs ($\lambda_i > 0$ and $\lambda_j < 0$): Saddle point."""

sec_2_4 = r"""```python
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
```"""

faqs_2 = [
    ("Why is Central Difference preferred over Forward Difference for numerical derivatives?", "Forward difference $\\frac{f(x+\\epsilon) - f(x)}{\\epsilon}$ has first-order truncation error $\\mathcal{O}(\\epsilon)$. Central difference $\\frac{f(x+\\epsilon) - f(x-\\epsilon)}{2\\epsilon}$ cancels first-order terms, yielding a second-order truncation error $\\mathcal{O}(\\epsilon^2)$, making it far more accurate."),
    ("What is the Vanishing and Exploding Gradient Problem?", "In deep networks with $L$ layers, gradients propagate by multiplying weight matrices: $\\nabla_{W_1} L = \\left(\\prod_{l=2}^L W_l^T \\sigma'(z_l)\\right) \\nabla_{z_L} L$. If the maximum singular values of weights $\\sigma_{\\max}(W_l) < 1$, gradients decay exponentially to 0 (vanishing). If $\\sigma_{\\max}(W_l) > 1$, gradients grow exponentially to $\\infty$ (exploding)."),
    ("How does gradient clipping resolve exploding gradients?", "Gradient clipping rescales the gradient vector if its $L_2$ norm exceeds threshold $c$: $g \\leftarrow \\frac{c}{\|g\|_2} g$ if $\|g\|_2 > c$. This preserves gradient direction while bounding step magnitude."),
    ("What is the difference between Jacobian and Hessian matrices?", "The Jacobian $J \\in \\mathbb{R}^{m \\times n}$ contains first-order partial derivatives of vector-valued function $g: \\mathbb{R}^n \\to \\mathbb{R}^m$. The Hessian $H \\in \\mathbb{R}^{n \\times n}$ contains second-order partial derivatives of scalar-valued function $f: \\mathbb{R}^n \\to \\mathbb{R}$."),
    ("Why is the directional derivative maximized in the direction of the gradient?", "The directional derivative $D_v f(x) = \\nabla f(x)^T v = \|\nabla f(x)\|_2 \|v\|_2 \\cos(\\theta)$. Because unit vector $\|v\|_2 = 1$ and $\\cos(\\theta) \\le 1$, $D_v f(x)$ achieves maximum value $\|\nabla f(x)\|_2$ when $\\cos(\\theta) = 1$, which occurs when $v$ points in the exact direction of $\\nabla f(x)$.")
]

blogs["algebra-differential-calculus"] = create_heavy_blog(
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
        ("1. Linear Mappings, Basis Change, and Operator Norms", sec_2_1),
        ("2. Directional Derivatives & Automatic Differentiation Architecture", sec_2_2),
        ("3. Multivariate Taylor Series & Loss Topography", sec_2_3),
        ("4. Python Implementation: Reverse-Mode Graph Autograd", sec_2_4)
    ],
    faqs=faqs_2
)

# Generate JSON
with open('scratch/ai_batch1_heavy.json', 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"Generated {len(blogs)} heavy blogs in scratch/ai_batch1_heavy.json")
