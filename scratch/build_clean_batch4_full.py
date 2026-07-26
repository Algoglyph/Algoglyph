import json
import re

print("=== BUILDING ALL 10 HIGH-QUALITY BATCH 4 ARTICLES (#31 to #40) ===")

with open('scratch/build_clean_batch4_high_quality.py', 'r', encoding='utf-8') as f:
    text = f.read()

scope = {}
exec(text, scope)
batch4_blogs = scope['batch4_blogs']

# 33. machine-learning-specialization
batch4_blogs["machine-learning-specialization"] = {
    "slug": "machine-learning-specialization",
    "title": "Machine Learning Specialization: Supervised, Unsupervised & Recommender Systems",
    "tagline": "Andrew Ng's flagship curriculum on linear models, neural networks, decision trees, K-means, and recommender systems.",
    "category": "Machine Learning",
    "readTime": "25",
    "lastUpdated": "July 2026",
    "prerequisites": ["open-machine-learning-course"],
    "related": ["pattern-recognition-ml", "deep-learning-specialization"],
    "practiceProblems": [{"title": "Machine Learning Specialization Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Machine Learning Specialization: Supervised, Unsupervised & Recommender Systems

The Machine Learning Specialization by Andrew Ng covers foundational supervised learning (regression, logistic classification, neural networks, decision trees), unsupervised learning (clustering, anomaly detection), and practical recommender systems.

---

## 1. Logistic Regression & Binary Classification Loss

Logistic regression maps linear combinations $\mathbf{w}^T \mathbf{x} + b$ into probabilities using the Sigmoid function $\sigma(z) = \frac{1}{1 + e^{-z}}$ and minimizes Binary Cross-Entropy loss:

$$\mathcal{L}(\mathbf{w}, b) = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$

```python
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def compute_binary_cross_entropy(y_true, y_pred, eps=1e-15):
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))

# Demonstration
z = np.array([-2.0, 0.0, 2.5])
y_hat = sigmoid(z)
print(f"Sigmoid outputs: {y_hat}")
```

---

## 2. Neural Network Forward Propagation & Multi-Class Softmax

Multi-layer perceptron forward propagation passes activations $a^{[l]} = g(Z^{[l]})$ across hidden layers:

$$\text{Softmax}(z_i) = \frac{e^{z_i}}{\sum_{j=1}^K e^{z_j}}$$

```python
def softmax(Z):
    exp_Z = np.exp(Z - np.max(Z, axis=-1, keepdims=True))
    return exp_Z / np.sum(exp_Z, axis=-1, keepdims=True)

logits = np.array([2.0, 1.0, 0.1])
probs = softmax(logits)
print(f"Softmax Probabilities: {probs} (Sum = {np.sum(probs):.1f})")
```

---

## 3. Unsupervised K-Means Clustering & Distortion Cost Optimization

$K$-Means minimizes the intra-cluster inertia (distortion cost function):

$$J(c^{(1)}, \dots, c^{(N)}, \mu_1, \dots, \mu_K) = \frac{1}{N} \sum_{i=1}^N \| \mathbf{x}^{(i)} - \mu_{c^{(i)}} \|^2$$

```python
from sklearn.cluster import KMeans

X = np.random.randn(300, 2)
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans.fit(X)
print(f"Cluster Centroids:\n{kmeans.cluster_centers_}")
```

---

## 4. Recommender Systems: Collaborative Filtering & Matrix Factorization

Predicting user ratings $R_{ui} \approx \mathbf{x}_u^T \mathbf{w}_i + b_{ui}$ using learned user preference vectors $\mathbf{x}_u$ and item vectors $\mathbf{w}_i$:

```python
# Collaborative filtering cost function prototype
def cf_cost_function(X, W, b, Y, R, lambda_reg=0.1):
    prediction = np.dot(X, W.T) + b
    error = (prediction - Y) * R
    cost = 0.5 * np.sum(error**2) + (lambda_reg / 2) * (np.sum(W**2) + np.sum(X**2))
    return cost
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why use Binary Cross-Entropy loss instead of Mean Squared Error for classification?
Mean Squared Error with a sigmoid activation results in a non-convex loss function with many local minima. Binary Cross-Entropy produces a convex optimization landscape suitable for gradient descent.

### Q2: How do you choose the optimal number of clusters $K$ in $K$-Means?
Use the Elbow Method (plotting inertia $J$ vs $K$ to find the point of diminishing returns) or evaluate Silhouette Scores across cluster counts.

### Q3: What is the cold-start problem in Recommender Systems?
The cold-start problem occurs when new users or items enter the system with zero historical interaction data ($R_{ui}=0$). Content-based filtering or demographic priors are used to mitigate this.

### Q4: How does Feature Scaling affect Gradient Descent convergence?
When features have vastly different scales, the contours of the cost function become elongated ellipses, causing gradient descent to oscillate. Scaling features to mean 0 and variance 1 produces spherical contours for direct gradient paths.

### Q5: What is Collaborative Filtering vs Content-Based Filtering?
Collaborative filtering learns user and item embeddings based solely on user-item interaction histories ($R_{ui}$). Content-based filtering uses metadata features (item genre, user demographics) to predict ratings.
"""
}

# 34. pattern-recognition-ml
batch4_blogs["pattern-recognition-ml"] = {
    "slug": "pattern-recognition-ml",
    "title": "Pattern Recognition & Machine Learning: Bayesian Decision Theory & Probabilistic Graphical Models",
    "tagline": "Christopher Bishop's foundational treatise on Bayesian inference, Gaussian processes, and EM algorithms.",
    "category": "Machine Learning",
    "readTime": "26",
    "lastUpdated": "July 2026",
    "prerequisites": ["machine-learning-specialization"],
    "related": ["pattern-recognition-github", "deep-learning-book"],
    "practiceProblems": [{"title": "PRML Bayesian Inference Simulation", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Pattern Recognition & Machine Learning: Bayesian Decision Theory & Probabilistic Graphical Models

Christopher M. Bishop's *Pattern Recognition and Machine Learning* (PRML) is the seminal textbook establishing machine learning within a rigorous Bayesian probabilistic framework.

---

## 1. Bayesian Decision Theory & Conjugate Priors

Bayes' theorem updates prior parameter distributions $p(\boldsymbol{\theta})$ given observed evidence $\mathcal{D}$:

$$p(\boldsymbol{\theta} \mid \mathcal{D}) = \frac{p(\mathcal{D} \mid \boldsymbol{\theta}) p(\boldsymbol{\theta})}{p(\mathcal{D})}$$

```python
import numpy as np
from scipy.stats import beta

# Conjugate Beta-Binomial Updating
prior_alpha, prior_beta = 2, 2  # Beta prior
heads, tails = 8, 2             # Binomial observations

posterior_alpha = prior_alpha + heads
posterior_beta = prior_beta + tails

print(f"Prior Mean: {prior_alpha / (prior_alpha + prior_beta):.3f}")
print(f"Posterior Mean: {posterior_alpha / (posterior_alpha + posterior_beta):.3f}")
```

---

## 2. Gaussian Mixture Models & Expectation-Maximization (EM) Algorithm

The EM algorithm maximizes marginal likelihood for latent variable models:
- **E-Step**: Compute responsibilities $\gamma_{ik} = p(z_{ik}=1 \mid \mathbf{x}_i, \boldsymbol{\theta})$.
- **M-Step**: Update mixture parameters $\mu_k, \Sigma_k, \pi_k$.

$$\gamma_{ik} = \frac{\pi_k \mathcal{N}(\mathbf{x}_i \mid \boldsymbol{\mu}_k, \boldsymbol{\Sigma}_k)}{\sum_{j=1}^K \pi_j \mathcal{N}(\mathbf{x}_i \mid \boldsymbol{\mu}_j, \boldsymbol{\Sigma}_j)}$$

```python
from sklearn.mixture import GaussianMixture

X = np.random.randn(500, 2)
gmm = GaussianMixture(n_components=2, covariance_type="full", random_state=42)
gmm.fit(X)
print(f"GMM Weights: {gmm.weights_}")
print(f"GMM Means:\n{gmm.means_}")
```

---

## 3. Gaussian Processes & Kernel Functions

Gaussian Processes define distributions over functions $f(\mathbf{x}) \sim \mathcal{GP}(m(\mathbf{x}), k(\mathbf{x}, \mathbf{x}'))$ using covariance kernels:

$$k_{RBF}(\mathbf{x}, \mathbf{x}') = \sigma^2 \exp\left( -\frac{\|\mathbf{x} - \mathbf{x}'\|^2}{2 l^2} \right)$$

```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF

kernel = RBF(length_scale=1.0)
gpr = GaussianProcessRegressor(kernel=kernel, alpha=0.1)

X_train = np.array([[-2.0], [0.0], [1.5]])
y_train = np.sin(X_train).ravel()
gpr.fit(X_train, y_train)

y_pred, std_pred = gpr.predict(np.array([[0.5]]), return_std=True)
print(f"GP Prediction at x=0.5: {y_pred[0]:.4f} +/- {std_pred[0]:.4f}")
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is a Conjugate Prior?
A prior distribution $p(\boldsymbol{\theta})$ is conjugate to a likelihood $p(\mathcal{D} \mid \boldsymbol{\theta})$ if the posterior distribution $p(\boldsymbol{\theta} \mid \mathcal{D})$ belongs to the exact same parametric probability distribution family.

### Q2: Why is the Evidence $p(\mathcal{D})$ intractable in high dimensions?
Computing evidence $p(\mathcal{D}) = \int p(\mathcal{D} \mid \boldsymbol{\theta}) p(\boldsymbol{\theta}) d\boldsymbol{\theta}$ requires integrating over the full continuous parameter space, which scales exponentially in dimensions.

### Q3: What is the main benefit of Gaussian Processes over Parametric Regression?
Gaussian Processes are non-parametric models that provide principled, exact posterior uncertainty bounds $\sigma^2(\mathbf{x})$ alongside point predictions.

### Q4: How does Maximum Likelihood Estimation (MLE) differ from Maximum A Posteriori (MAP)?
MLE maximizes likelihood $p(\mathcal{D} \mid \boldsymbol{\theta})$. MAP incorporates prior probability $p(\boldsymbol{\theta})$ by maximizing $p(\mathcal{D} \mid \boldsymbol{\theta}) p(\boldsymbol{\theta})$.

### Q5: What is Variational Inference?
Variational Inference approximates intractable posterior distributions $p(\boldsymbol{\theta} \mid \mathcal{D})$ by selecting a tractable distribution family $q(\boldsymbol{\theta})$ that minimizes Kullback-Leibler (KL) divergence to the true posterior.
"""
}

# 35. pattern-recognition-github
batch4_blogs["pattern-recognition-github"] = {
    "slug": "pattern-recognition-github",
    "title": "Pattern Recognition GitHub: PyTorch & NumPy Implementations of PRML Algorithms",
    "tagline": "Code-first Bayesian inference, Gaussian Mixture Models, Variational Autoencoders, and MCMC sampling.",
    "category": "Machine Learning",
    "readTime": "22",
    "lastUpdated": "July 2026",
    "prerequisites": ["pattern-recognition-ml"],
    "related": ["deep-learning-specialization", "deep-learning-book"],
    "practiceProblems": [{"title": "PRML PyTorch Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Pattern Recognition GitHub: PyTorch & NumPy Implementations of PRML Algorithms

Practical Python and PyTorch code implementations translating theoretical algorithms from Christopher Bishop's PRML textbook into executable modules.

---

## 1. Pure NumPy Gaussian Mixture Model (EM Algorithm)

```python
import numpy as np

class GaussianMixtureNumPy:
    def __init__(self, n_components=2, max_iter=50):
        self.K = n_components
        self.max_iter = max_iter

    def fit(self, X):
        N, D = X.shape
        self.weights = np.ones(self.K) / self.K
        self.means = X[np.random.choice(N, self.K, replace=False)]
        self.covs = np.array([np.eye(D) for _ in range(self.K)])

        for _ in range(self.max_iter):
            # E-step
            resp = np.zeros((N, self.K))
            for k in range(self.K):
                diff = X - self.means[k]
                inv_cov = np.linalg.inv(self.covs[k])
                det_cov = np.linalg.det(self.covs[k])
                norm_const = 1.0 / np.sqrt(((2 * np.pi) ** D) * det_cov)
                exponent = -0.5 * np.sum(diff @ inv_cov * diff, axis=1)
                resp[:, k] = self.weights[k] * norm_const * np.exp(exponent)

            resp /= np.sum(resp, axis=1, keepdims=True)

            # M-step
            N_k = np.sum(resp, axis=0)
            self.weights = N_k / N
            for k in range(self.K):
                self.means[k] = np.sum(resp[:, k:k+1] * X, axis=0) / N_k[k]
                diff = X - self.means[k]
                self.covs[k] = (resp[:, k] * diff.T) @ diff / N_k[k]

X = np.random.randn(200, 2)
model = GaussianMixtureNumPy(n_components=2)
model.fit(X)
print("Fitted Means:\n", model.means)
```

---

## 2. PyTorch Variational Autoencoder (VAE) & ELBO Loss

Maximizing the Evidence Lower Bound (ELBO):

$$\text{ELBO} = \mathbb{E}_{q_\phi(\mathbf{z}\mid\mathbf{x})}[\log p_\theta(\mathbf{x}\mid\mathbf{z})] - D_{KL}(q_\phi(\mathbf{z}\mid\mathbf{x}) \parallel p(\mathbf{z}))$$

```python
import torch
import torch.nn as nn

class VAE(nn.Module):
    def __init__(self, input_dim=784, latent_dim=20):
        super().__init__()
        self.fc_enc = nn.Linear(input_dim, 128)
        self.fc_mu = nn.Linear(128, latent_dim)
        self.fc_logvar = nn.Linear(128, latent_dim)
        self.fc_dec = nn.Linear(latent_dim, input_dim)

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, x):
        h = torch.relu(self.fc_enc(x))
        mu, logvar = self.fc_mu(h), self.fc_logvar(h)
        z = self.reparameterize(mu, logvar)
        recon = torch.sigmoid(self.fc_dec(z))
        return recon, mu, logvar

vae = VAE()
x_dummy = torch.randn(16, 784)
recon, mu, logvar = vae(x_dummy)
print(f"Reconstructed Shape: {recon.shape}")
```

---

## 3. Frequently Asked Questions (FAQs)

### Q1: Why is the Reparameterization Trick necessary in VAEs?
Sampling $\mathbf{z} \sim \mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\sigma}^2)$ directly prevents backpropagation because stochastic node sampling is non-differentiable. The reparameterization trick computes $\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}$ with auxiliary noise $\boldsymbol{\epsilon} \sim \mathcal{N}(0, \mathbf{I})$, enabling backpropagation.

### Q2: What is KL Divergence in VAE loss functions?
KL Divergence measures relative entropy between learned posterior $q_\phi(\mathbf{z} \mid \mathbf{x})$ and unit Gaussian prior $p(\mathbf{z}) = \mathcal{N}(0, \mathbf{I})$, acting as a regularization constraint.

### Q3: How do you handle numerical instability in GMM covariance inversion?
Add a small diagonal regularization ridge $\lambda \mathbf{I}$ (e.g. $\lambda = 10^{-6}$) to covariance matrices $\boldsymbol{\Sigma}_k + \lambda \mathbf{I}$ prior to matrix inversion.

### Q4: What is Markov Chain Monte Carlo (MCMC) sampling?
MCMC draws samples from arbitrary probability distributions by generating a Markov chain whose stationary distribution matches the target distribution.

### Q5: What is Metropolis-Hastings sampling?
Metropolis-Hastings is an MCMC algorithm that proposes new state transitions from a proposal distribution $q(x' \mid x)$ and accepts them with probability $\alpha = \min\left(1, \frac{p(x') q(x \mid x')}{p(x) q(x' \mid x)}\right)$.
"""
}

# 36. deep-learning-specialization
batch4_blogs["deep-learning-specialization"] = {
    "slug": "deep-learning-specialization",
    "title": "Deep Learning Specialization: Neural Networks, CNNs, RNNs & Optimization",
    "tagline": "Andrew Ng's flagship deep learning series covering backpropagation, Adam optimization, ResNets, and LSTMs.",
    "category": "Deep Learning",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["pattern-recognition-github"],
    "related": ["deep-learning-book", "attention-is-all-you-need"],
    "practiceProblems": [{"title": "Deep Learning Specialization Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Deep Learning Specialization: Neural Networks, CNNs, RNNs & Optimization

The Deep Learning Specialization covers deep neural network architecture design, optimization mechanics (Adam, RMSProp), Convolutional Neural Networks (CNNs), and Recurrent Neural Networks (RNNs/LSTMs).

---

## 1. Backpropagation Mathematics & Chain Rule

For a L-layer network, weight gradients are computed using the multivariate chain rule:

$$\frac{\partial \mathcal{L}}{\partial \mathbf{W}^{[l]}} = \frac{1}{N} \mathbf{dZ}^{[l]} (\mathbf{A}^{[l-1]})^T, \quad \mathbf{dZ}^{[l]} = \mathbf{dA}^{[l]} \odot g'(\mathbf{Z}^{[l]})$$

```python
import torch

# Automatic differentiation verification in PyTorch
w = torch.tensor([2.0], requires_grad=True)
b = torch.tensor([1.0], requires_grad=True)

x = torch.tensor([3.0])
y_true = torch.tensor([10.0])

y_pred = w * x + b
loss = (y_pred - y_true) ** 2
loss.backward()

print(f"dL/dw = {w.grad.item()} (Expected: 2 * (7 - 10) * 3 = -18)")
```

---

## 2. Advanced Optimizers: Adam & RMSprop

Adam (Adaptive Moment Estimation) combines Exponential Moving Averages of first moments $m_t$ (momentum) and second raw moments $v_t$ (RMSprop):

$$m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t, \quad v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2$$

$$\theta_{t+1} = \theta_t - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$

```python
import torch.optim as optim

model = torch.nn.Linear(10, 1)
optimizer = optim.Adam(model.parameters(), lr=0.001, betas=(0.9, 0.999), eps=1e-8)
```

---

## 3. Residual Networks (ResNets) & Skip Connections

Skip connections $y = \mathcal{F}(x, \{W_i\}) + x$ prevent vanishing gradients in deep 100+ layer networks:

```python
import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return torch.relu(out)

block = ResidualBlock(64)
x_img = torch.randn(4, 64, 32, 32)
print("ResNet Block Output Shape:", block(x_img).shape)
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How do Residual Skip Connections solve Vanishing Gradients?
Skip connections allow identity gradient flow $\frac{\partial (F(x) + x)}{\partial x} = \frac{\partial F(x)}{\partial x} + 1$, ensuring gradients propagate backward without exponential attenuation.

### Q2: Why is Dropout disabled during model inference?
Dropout randomly zero-activates neurons during training to prevent co-adaptation. During inference, all neurons are kept active and scaled by $(1 - p)$ to compute deterministic predictions.

### Q3: What is the purpose of Batch Normalization?
Batch Normalization normalizes layer inputs across batch instances to zero mean and unit variance, stabilizing internal covariate shift and accelerating convergence.

### Q4: Why are Convolutional Networks better than Dense Networks for images?
CNNs leverage weight sharing and local spatial receptive fields, reducing parameter counts and providing translation invariance.

### Q5: What is the difference between LSTM and standard RNN?
Standard RNNs suffer from vanishing/exploding gradients across long time steps. LSTMs introduce cell state memory gates (Forget, Input, Output gates) to maintain gradient flow over extended sequences.
"""
}

# 37. deep-learning-book
batch4_blogs["deep-learning-book"] = {
    "slug": "deep-learning-book",
    "title": "Deep Learning Book: Mathematical Foundations & Theoretical Principles",
    "tagline": "Ian Goodfellow, Yoshua Bengio, and Aaron Courville's authoritative textbook on deep learning theory.",
    "category": "Deep Learning",
    "readTime": "26",
    "lastUpdated": "July 2026",
    "prerequisites": ["deep-learning-specialization"],
    "related": ["attention-is-all-you-need", "illustrated-transformer"],
    "practiceProblems": [{"title": "Deep Learning Book Theory Simulation", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Deep Learning Book: Mathematical Foundations & Theoretical Principles

Ian Goodfellow, Yoshua Bengio, and Aaron Courville's MIT Press textbook *Deep Learning* establishes mathematical foundations across linear algebra, probability, numerical optimization, and deep generative architectures.

---

## 1. Numerical Computation: Conditioning & Underflow/Overflow

Numerical conditioning measures function sensitivity to small input perturbations via condition number $\kappa$:

$$\kappa(\mathbf{A}) = \|\mathbf{A}\| \cdot \|\mathbf{A}^{-1}\| = \frac{\sigma_{\max}(\mathbf{A})}{\sigma_{\min}(\mathbf{A})}$$

Software implementations stabilize Softmax evaluation using Max-Subtraction:

```python
import numpy as np

def stable_softmax(x):
    z = x - np.max(x, axis=-1, keepdims=True)
    return np.exp(z) / np.sum(np.exp(z), axis=-1, keepdims=True)

unstable_logits = np.array([1000.0, 1001.0, 1002.0])
print("Stable Softmax:", stable_softmax(unstable_logits))
```

---

## 2. Information Theory: KL Divergence & Cross-Entropy

Kullback-Leibler (KL) Divergence quantifies relative entropy between distribution $p(x)$ and target $q(x)$:

$$D_{KL}(p \parallel q) = \int p(x) \log \frac{p(x)}{q(x)} dx = \mathbb{E}_{x \sim p}[\log p(x) - \log q(x)]$$

Cross-Entropy relates to KL divergence via $H(p, q) = H(p) + D_{KL}(p \parallel q)$.

---

## 3. Generative Adversarial Networks (GANs) Minimax Game

GANs formulate unsupervised generative learning as a two-player Minimax game:

$$\min_G \max_D V(D, G) = \mathbb{E}_{\mathbf{x} \sim p_{data}}[\log D(\mathbf{x})] + \mathbb{E}_{\mathbf{z} \sim p_{\mathbf{z}}}[\log(1 - D(G(\mathbf{z})))]$$

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the Universal Approximation Theorem?
The theorem states that a feedforward neural network with a single hidden layer containing a finite number of non-linear neurons can approximate any continuous function on compact subsets of $\mathbb{R}^n$ to arbitrary accuracy.

### Q2: Why is $D_{KL}(p \parallel q)$ non-symmetric?
$D_{KL}(p \parallel q) \neq D_{KL}(q \parallel p)$. Forward KL ($D_{KL}(p \parallel q)$) averages over $p$ (mean-covering), while reverse KL ($D_{KL}(q \parallel p)$) penalizes placing mass where $p$ is zero (mode-seeking).

### Q3: What is Mode Collapse in GANs?
Mode collapse occurs when the Generator $G$ produces images covering only a tiny subset of distribution modes, ignoring output diversity.

### Q4: Why does Gradient Descent fail at Saddle Points in high dimensions?
In high-dimensional spaces, local minima are rare; most zero-gradient points are saddle points where Hessian matrices contain both positive and negative eigenvalues.

### Q5: What is the Curse of Dimensionality in Machine Learning?
As input dimensions $D$ increase, volume grows exponentially, making data points extremely sparse and distance metrics ($L_2$ norm) uninformative.
"""
}

# 38. attention-is-all-you-need
batch4_blogs["attention-is-all-you-need"] = {
    "slug": "attention-is-all-you-need",
    "title": "Attention Is All You Need: Transformer Architecture & Self-Attention",
    "tagline": "Deep-dive into Vaswani et al. (2017): Scaled Dot-Product Attention, Multi-Head Attention, and Positional Encodings.",
    "category": "Deep Learning",
    "readTime": "25",
    "lastUpdated": "July 2026",
    "prerequisites": ["deep-learning-book"],
    "related": ["illustrated-transformer", "mlops-specialization"],
    "practiceProblems": [{"title": "Transformer Attention Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Attention Is All You Need: Transformer Architecture & Self-Attention

Vaswani et al. (2017) revolutionized natural language processing and deep learning by replacing recurrent architectures with the self-attention based Transformer model.

---

## 1. Scaled Dot-Product Attention Mechanics

Scaled Dot-Product Attention maps Query ($\mathbf{Q}$), Key ($\mathbf{K}$), and Value ($\mathbf{V}$) matrices:

$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Softmax}\left( \frac{\mathbf{Q} \mathbf{K}^T}{\sqrt{d_k}} \right) \mathbf{V}$$

Scaling by $\frac{1}{\sqrt{d_k}}$ prevents dot products from growing large in high dimensions, which would push Softmax gradients into vanishing regions.

```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    attn_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attn_weights, V)
    return output, attn_weights

Q = torch.randn(2, 8, 64) # Batch=2, Seq=8, Dim=64
K = torch.randn(2, 8, 64)
V = torch.randn(2, 8, 64)
output, weights = scaled_dot_product_attention(Q, K, V)
print("Attention Output Shape:", output.shape)
```

---

## 2. Multi-Head Attention (MHA) Layer

Multi-Head Attention projects Queries, Keys, and Values into $h$ subspace representations:

$$\text{MultiHead}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Concat}(\text{head}_1, \dots, \text{head}_h) \mathbf{W}^O$$

$$\text{head}_i = \text{Attention}(\mathbf{Q}\mathbf{W}_i^Q, \mathbf{K}\mathbf{W}_i^K, \mathbf{V}\mathbf{W}_i^V)$$

```python
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x):
        B, N, D = x.shape
        q = self.W_q(x).view(B, N, self.num_heads, self.d_k).transpose(1, 2)
        k = self.W_k(x).view(B, N, self.num_heads, self.d_k).transpose(1, 2)
        v = self.W_v(x).view(B, N, self.num_heads, self.d_k).transpose(1, 2)

        scores = torch.matmul(q, k.transpose(-2, -1)) / (self.d_k ** 0.5)
        attn = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn, v).transpose(1, 2).contiguous().view(B, N, D)
        return self.W_o(out)

mha = MultiHeadAttention()
x_seq = torch.randn(2, 16, 512)
print("Multi-Head Attention Output:", mha(x_seq).shape)
```

---

## 3. Sinusoidal Positional Encodings

Since self-attention is permutation invariant, positional encodings inject token sequence ordering:

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right), \quad PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why is scaling factor $\frac{1}{\sqrt{d_k}}$ essential in dot-product attention?
For large values of $d_k$, vector dot products grow large in magnitude, driving the Softmax function into regions with extremely small gradients. Dividing by $\sqrt{d_k}$ maintains unit variance.

### Q2: How does Causal Masking work in Decoder Self-Attention?
Causal masking sets future token interaction scores to $-\infty$ prior to Softmax, ensuring token predictions at position $t$ depend only on positions $< t$.

### Q3: What is the computational complexity of Self-Attention vs Recurrent layers?
Self-attention requires $O(N^2 \cdot D)$ per layer for sequence length $N$ and embedding dimension $D$. Recurrent layers require $O(N \cdot D^2)$ sequential steps.

### Q4: Why does Multi-Head Attention outperform Single-Head Attention?
Multi-head attention enables the model to jointly attend to information from different representation subspaces at different positions simultaneously.

### Q5: What is the difference between Encoder-Only and Decoder-Only Transformers?
Encoder-only architectures (BERT) use bidirectional attention for classification/extraction. Decoder-only architectures (GPT) use causal masked attention for autoregressive text generation.
"""
}

# 39. illustrated-transformer
batch4_blogs["illustrated-transformer"] = {
    "slug": "illustrated-transformer",
    "title": "The Illustrated Transformer: Visual & Intuitive Architectural Breakdown",
    "tagline": "Jay Alammar's visual breakdown of Transformer encoder-decoder stacks, attention matrices, and tensor flows.",
    "category": "Deep Learning",
    "readTime": "20",
    "lastUpdated": "July 2026",
    "prerequisites": ["attention-is-all-you-need"],
    "related": ["mlops-specialization"],
    "practiceProblems": [{"title": "Illustrated Transformer Simulation", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# The Illustrated Transformer: Visual & Intuitive Architectural Breakdown

Jay Alammar's *The Illustrated Transformer* provides a visual intuition for how Transformer encoder and decoder stacks process text sequences in parallel.

---

## 1. High-Level Pipeline: Encoder & Decoder Stacks

The Transformer consists of an Encoder stack (encoding input token embeddings into continuous representations) and a Decoder stack (generating output tokens autoregressively).

```
Input Tokens --> [ Embedding + Positional Encoding ]
                     |
                     v
             [ Encoder Stack (6x) ]
                     |
                     v
             [ Decoder Stack (6x) ] --> [ Linear + Softmax ] --> Output Words
```

---

## 2. Step-by-Step Self-Attention Computation

For each input token embedding $\mathbf{x}_i$:
1. Multiply $\mathbf{x}_i$ by projection matrices $\mathbf{W}^Q, \mathbf{W}^K, \mathbf{W}^V$ to obtain Query $\mathbf{q}_i$, Key $\mathbf{k}_i$, and Value $\mathbf{v}_i$.
2. Calculate score $s_{ij} = \mathbf{q}_i \cdot \mathbf{k}_j$.
3. Divide by $\sqrt{d_k}$ and pass through Softmax to obtain attention weights $\alpha_{ij}$.
4. Compute weighted sum $\mathbf{z}_i = \sum_j \alpha_{ij} \mathbf{v}_j$.

---

## 3. Frequently Asked Questions (FAQs)

### Q1: What is the role of the Feed-Forward Network (FFN) in each Transformer block?
Each attention block is followed by a position-wise Feed-Forward Network $\text{FFN}(x) = \max(0, x\mathbf{W}_1 + \mathbf{b}_1)\mathbf{W}_2 + \mathbf{b}_2$ that applies non-linear transformations to each token vector independently.

### Q2: How does Encoder-Decoder Attention differ from Self-Attention?
In Encoder-Decoder attention, Query vectors $\mathbf{Q}$ come from the previous Decoder layer, while Key ($\mathbf{K}$) and Value ($\mathbf{V}$) vectors come directly from the final output of the Encoder stack.

### Q3: Why are Residual Connections placed around Attention and FFN layers?
LayerNorm and Residual Connections ($x + \text{Sublayer}(x)$) stabilize optimization and allow deep networks to train without gradient degradation.

### Q4: How is text generated during Inference in Transformers?
During inference, text is generated autoregressively token-by-token. The model predicts the next token, appends it to decoder inputs, and repeats until an `<EOS>` (end-of-sequence) token is emitted.

### Q5: What is the difference between Pre-LN and Post-LN Transformer architectures?
Post-LN places Layer Normalization after residual addition ($\text{LN}(x + \text{Sublayer}(x))$). Pre-LN applies Layer Normalization before sublayers ($x + \text{Sublayer}(\text{LN}(x))$), providing superior optimization stability for ultra-deep models.
"""
}

# 40. mlops-specialization
batch4_blogs["mlops-specialization"] = {
    "slug": "mlops-specialization",
    "title": "MLOps Specialization: Data Engineering, Model Pipelines & Production Deployment",
    "tagline": "Machine Learning Engineering for Production (MLOps): TFDV data validation, MLflow model registries, and drift detection.",
    "category": "MLOps",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["illustrated-transformer"],
    "related": ["open-machine-learning-course"],
    "practiceProblems": [{"title": "MLOps Pipeline Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# MLOps Specialization: Data Engineering, Model Pipelines & Production Deployment

The Machine Learning Engineering for Production (MLOps) Specialization covers building production-grade ML pipelines, data validation, model tracking, automated CI/CD deployment, and drift monitoring.

---

## 1. Data Validation & Schema Contracts with TensorFlow Data Validation (TFDV)

Production MLOps pipelines validate incoming data streams against baseline statistical schemas to prevent training-serving skew:

```python
import pandas as pd

def validate_data_schema(df: pd.DataFrame, expected_columns: list):
    missing_cols = set(expected_columns) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Data Schema Violation! Missing columns: {missing_cols}")
    print("Data Schema Validation Passed cleanly.")

df_prod = pd.DataFrame({"user_id": [101, 102], "score": [0.85, 0.92]})
validate_data_schema(df_prod, ["user_id", "score"])
```

---

## 2. Experiment Tracking & Model Registry with MLflow

Tracking hyperparameters, metrics, and artifact checkpoints:

```python
import mlflow

def train_and_log_model(lr=0.01, epochs=10):
    with mlflow.start_run():
        mlflow.log_param("learning_rate", lr)
        mlflow.log_param("epochs", epochs)
        
        # Simulate metric
        accuracy = 0.945
        mlflow.log_metric("accuracy", accuracy)
        print(f"Logged experiment run with Accuracy: {accuracy}")

train_and_log_model()
```

---

## 3. Detecting Data Drift & Concept Drift in Production

- **Data Drift (Covariate Shift)**: Input distribution changes $P_{t1}(\mathbf{X}) \neq P_{t0}(\mathbf{X})$ while relationship $P(Y \mid \mathbf{X})$ remains fixed.
- **Concept Drift**: Underlying relationship changes $P_{t1}(Y \mid \mathbf{X}) \neq P_{t0}(Y \mid \mathbf{X})$.

```python
from scipy.stats import ks_2samp

# Kolmogorov-Smirnov test for continuous covariate shift detection
baseline_feature = np.random.normal(0, 1, 1000)
production_feature = np.random.normal(0.5, 1, 1000)

stat, p_value = ks_2samp(baseline_feature, production_feature)
if p_value < 0.05:
    print(f"ALERT: Covariate Shift Detected! (p-value = {p_value:.5f})")
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is Training-Serving Skew in MLOps?
Training-serving skew is a discrepancy between model performance during development vs. production, caused by differences in data processing pipelines or environment configurations.

### Q2: What is the difference between Data Drift and Concept Drift?
Data Drift is a shift in feature distributions $P(\mathbf{X})$ over time. Concept Drift is a change in the statistical relationship between input features and target labels $P(Y \mid \mathbf{X})$.

### Q3: What is a Feature Store in MLOps architecture?
A Feature Store (e.g. Feast, Hopsworks) is a centralized repository that manages, computes, and serves consistent features for both offline model training and real-time online inference.

### Q4: How does Canary Deployment work for ML Models?
Canary deployment routes a small percentage ($\sim 5\%$) of live traffic to a newly deployed model version to monitor production latency and error metrics before a full rollout.

### Q5: What is Shadow Deployment?
Shadow deployment routes real production traffic to a new model version in parallel without sending its predictions back to users, allowing validation against live data risk-free.
"""
}

# Clean all headers in all 10 Batch 4 blogs
def clean_markdown_headers_perfectly(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', header_text).strip()
            
            if not clean_title or clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

for slug, b in batch4_blogs.items():
    b['markdown'] = clean_markdown_headers_perfectly(b['markdown'])

output_json = 'scratch/ai_batch4_clean_quality.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(batch4_blogs, f, indent=2)

print(f"\nSUCCESSFULLY CREATED ALL 10 BATCH 4 BLOGS IN {output_json}!")
