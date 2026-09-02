# Cooley-Tukey FFT: Even-Odd Decomposition, Roots of Unity & Fast Convolution

![Cooley-Tukey FFT butterfly stages](/images/dsa/cooley-tukey-fft-dark.jpg#dark)

## 1. Historical Context & Motivation

The discrete Fourier transform converts a finite sequence into coefficients describing cyclic frequency components.

The direct definition for $n$ samples evaluates $n$ output sums of length $n$.

Its straightforward cost is $\Theta(n^2)$.

The fast Fourier transform is a family of algorithms that computes the same transform by reusing repeated structure.

The Cooley-Tukey family factors a transform length into smaller transforms.

The radix-2 form repeatedly splits an even-length sequence into even-indexed and odd-indexed subsequences.

This reduces time to $\Theta(n\log n)$ when the length is a power of two.

The idea has roots in earlier work, while the 1965 Cooley-Tukey publication made the method widely influential in scientific and engineering computation.

FFT algorithms power spectral analysis, digital filters, polynomial multiplication, image processing, audio processing, and fast convolution.

They do not magically make every frequency problem simple.

The transform convention, sample rate, windowing, boundary behavior, and numerical precision determine whether the result answers the intended question.

The radix-2 implementation has a strict input-shape assumption.

Its recursive split is simplest when $n=2^k$.

Other mixed-radix, split-radix, Bluestein, and Rader variants cover other lengths.

Padding a signal with zeros can enable a convenient length, but it changes frequency sampling and convolution extent.

The central question is:

How does the even-odd decomposition reuse roots of unity so that a length-$n$ transform costs $O(n\log n)$ rather than $O(n^2)$?

## 2. Core Mathematical Invariants

For complex input $x_0,\ldots,x_{n-1}$, the forward DFT is:

$$
X_k=\sum_{j=0}^{n-1}x_j\omega_n^{jk},\qquad \omega_n=e^{-2\pi i/n}.
$$

The $n$th roots of unity satisfy:

$$
\omega_n^n=1.
$$

For even $n$:

$$
\omega_n^{2}=\omega_{n/2}.
$$

Split indices into $j=2r$ and $j=2r+1$.

Then:

$$
X_k=\sum_r x_{2r}\omega_{n/2}^{rk}+\omega_n^k\sum_r x_{2r+1}\omega_{n/2}^{rk}.
$$

Define the two half-size transforms as $E_k$ and $O_k$.

The butterfly equations are:

$$
X_k=E_k+\omega_n^kO_k,
$$

and:

$$
X_{k+n/2}=E_k-\omega_n^kO_k.
$$

Only $k=0,\ldots,n/2-1$ need independent twiddle factors.

### Transform invariant

At a recursive call of length $m$, the returned sequence is the DFT of that call's input under the selected sign convention.

The base case $m=1$ is its own transform.

The butterfly equations combine correct half transforms into the correct full transform.

Induction proves correctness for every power-of-two length.

### Root-reuse invariant

The same half-transform values contribute to two output coefficients.

The second output differs only by a sign because:

$$
\omega_n^{k+n/2}=-\omega_n^k.
$$

This paired reuse is the source of the divide-and-conquer saving.

### Inverse invariant

The inverse DFT uses the opposite sign:

$$
x_j=\frac1n\sum_{k=0}^{n-1}X_k e^{2\pi ijk/n}.
$$

An implementation can compute inverse FFT by conjugating inputs, applying forward FFT, conjugating outputs, and dividing by $n$.

The normalization factor must appear exactly once.

### Convolution invariant

For sequences $a$ and $b$, linear convolution is:

$$
c_t=\sum_j a_jb_{t-j}.
$$

Zero-pad both sequences to length at least $|a|+|b|-1$.

Then pointwise multiplication in Fourier space followed by inverse transform yields the linear convolution coefficients.

Padding prevents cyclic wraparound from mixing high-index terms into early output positions.

### Numerical invariant

Floating-point FFT output approximates exact complex arithmetic.

Small imaginary residuals near zero and small roundoff differences are expected.

Tests should use absolute and relative tolerances rather than exact equality for nontrivial transforms.

## 3. Step-by-Step Execution Trace

Transform $x=[1,2,3,4]$.

Split into even samples $[1,3]$ and odd samples $[2,4]$.

Their length-two transforms are:

$$
E=[4,-2],\qquad O=[6,-2].
$$

For $n=4$, roots used by the first butterfly half are:

$$
\omega_4^0=1,\qquad \omega_4^1=-i.
$$

For $k=0$:

$$
X_0=4+1\cdot6=10,
$$

and:

$$
X_2=4-1\cdot6=-2.
$$

For $k=1$:

$$
X_1=-2+(-i)(-2)=-2+2i,
$$

and:

$$
X_3=-2-(-i)(-2)=-2-2i.
$$

The final transform is:

$$
[10,-2+2i,-2,-2-2i].
$$

An inverse transform returns $[1,2,3,4]$ up to floating-point tolerance.

### Convolution trace

Let $a=[1,2]$ and $b=[3,4]$.

The required linear output length is $2+2-1=3$.

Choose padded length 4.

After transform, pointwise multiplication, and inverse transform, the real coefficients are:

$$
[3,10,8,0].
$$

Discard the padded trailing zero.

The result matches direct convolution:

$$
1\cdot3=3,
$$

$$
1\cdot4+2\cdot3=10,
$$

and:

$$
2\cdot4=8.
$$

## 4. Production-Ready Implementations

```python
from cmath import exp, pi
from math import isclose


def fft(values: list[complex]) -> list[complex]:
    n = len(values)
    if n == 0:
        return []
    if n & (n - 1):
        raise ValueError("radix-2 FFT length must be a power of two")
    if n == 1:
        return values.copy()

    even = fft(values[::2])
    odd = fft(values[1::2])
    result = [0j] * n
    for k in range(n // 2):
        twiddle = exp(-2j * pi * k / n) * odd[k]
        result[k] = even[k] + twiddle
        result[k + n // 2] = even[k] - twiddle
    return result


def ifft(values: list[complex]) -> list[complex]:
    n = len(values)
    if n == 0:
        return []
    transformed = fft([value.conjugate() for value in values])
    return [value.conjugate() / n for value in transformed]


def next_power_of_two(n: int) -> int:
    if n < 1:
        return 1
    return 1 << (n - 1).bit_length()


def convolve(left: list[float], right: list[float]) -> list[float]:
    if not left or not right:
        return []
    result_length = len(left) + len(right) - 1
    size = next_power_of_two(result_length)
    a = [complex(value) for value in left] + [0j] * (size - len(left))
    b = [complex(value) for value in right] + [0j] * (size - len(right))
    product = [x * y for x, y in zip(fft(a), fft(b))]
    return [value.real for value in ifft(product)[:result_length]]


actual = fft([1 + 0j, 2 + 0j, 3 + 0j, 4 + 0j])
expected = [10 + 0j, -2 + 2j, -2 + 0j, -2 - 2j]
assert all(abs(x - y) < 1e-9 for x, y in zip(actual, expected))
assert all(abs(x - y) < 1e-9 for x, y in zip(ifft(actual), [1, 2, 3, 4]))
assert all(isclose(x, y, abs_tol=1e-9) for x, y in zip(convolve([1, 2], [3, 4]), [3, 10, 8]))
```

The recursive code is clear but allocates slices at every level.

Production FFT libraries use iterative bit-reversal, precomputed twiddles, SIMD, and carefully chosen radices to reduce overhead.

Do not use the displayed code as a benchmark for optimized numerical libraries.

### Direct DFT differential test

```python
def dft(values: list[complex]) -> list[complex]:
    n = len(values)
    return [
        sum(values[j] * exp(-2j * pi * j * k / n) for j in range(n))
        for k in range(n)
    ]


samples = [complex(2, -1), complex(-3, 4), complex(0, 2), complex(5, 0)]
assert all(abs(a - b) < 1e-9 for a, b in zip(fft(samples), dft(samples)))

try:
    fft([1 + 0j, 2 + 0j, 3 + 0j])
except ValueError:
    pass
else:
    raise AssertionError("non-power-of-two radix-2 input must be rejected")
```

### Engineering considerations

Use real-input FFT variants when inputs are known real and memory or throughput matters.

Choose transform normalization consistently across every pipeline stage.

Window finite signal segments before spectral estimation when leakage behavior matters.

Use overlap-add or overlap-save for long streaming convolution.

Avoid converting large integer convolution results through low-precision floating point without error analysis.

## 5. Asymptotic Time & Space Complexity

The radix-2 recurrence is:

$$
T(n)=2T(n/2)+\Theta(n).
$$

Each recursion level performs $\Theta(n)$ butterfly work across all subproblems.

There are $\Theta(\log n)$ levels.

Therefore time is:

$$
\Theta(n\log n).
$$

The direct DFT requires $n$ outputs, each summing $n$ terms, for $\Theta(n^2)$ time.

The recursive implementation allocates slices and result arrays across calls.

Its peak auxiliary storage is $O(n\log n)$ under a conservative accounting of simultaneously retained slices, although optimized in-place iterative FFTs use $O(n)$ data storage and $O(1)$ or small auxiliary indexing state.

Convolution of lengths $p$ and $q$ pads to $N\ge p+q-1$ and costs $O(N\log N)$ time.

Direct convolution costs $\Theta(pq)$.

For very short sequences, direct convolution can be faster because FFT setup and complex arithmetic have larger constants.

## 6. Systems Connections

### Signal processing

FFT bins represent sampled frequency components, not automatically physical frequencies.

Map bin index to frequency using sample rate and transform length.

Windowing and zero padding affect interpretation.

### Polynomial multiplication

Polynomial coefficients convolve under multiplication.

FFT convolution can accelerate large products, subject to numerical-rounding safeguards.

### Image processing

Two-dimensional FFTs apply one-dimensional transforms along rows and columns.

Frequency-domain filtering can emphasize or attenuate spatial patterns.

Boundary assumptions still affect visible artifacts.

### Cryptography and number theory

Number-theoretic transforms use modular roots of unity to avoid floating-point rounding for suitable integer convolutions.

They require carefully selected moduli and length constraints.

### Performance engineering

Memory layout, twiddle reuse, cache blocking, and vector instructions often dominate practical FFT speed.

Select a mature library for production numerical workloads unless the transform variant is genuinely specialized.

### Spectral interpretation

The FFT output index is periodic modulo transform length.

For sampled real signals, bins above the Nyquist frequency represent negative-frequency partners under the usual ordering.

Magnitude is often computed as absolute complex value.

Phase is the complex argument and becomes unreliable when magnitude is near zero.

Zero padding interpolates the sampled frequency grid; it does not create new information from the original finite window.

Increasing transform length without increasing acquired samples can make a plot smoother while leaving spectral resolution determined by observation duration.

### Filtering

Multiplication by a frequency response corresponds to convolution in the time domain.

Circular convolution is appropriate only when the boundary model is periodic.

Linear filtering of finite blocks needs padding and overlap handling to avoid edge contamination.

An inverse transform of a non-Hermitian spectrum will generally be complex even when a real output was intended.

Maintain conjugate symmetry when constructing spectra for real signals.

### Algorithm variants

Mixed-radix Cooley-Tukey factors lengths such as $12=3\cdot2\cdot2$.

Split-radix variants reduce arithmetic count for some power-of-two transforms.

Bluestein's algorithm converts arbitrary-length DFTs into convolution problems.

Rader's algorithm targets prime lengths through a different permutation structure.

The best variant depends on length, hardware, precision, and library implementation.

### Testing numerical code

Test impulse input, whose transform is constant.

Test a constant input, whose nonzero energy appears in the zero-frequency bin.

Test a single complex sinusoid aligned to a bin.

Test forward-inverse round trips across several power-of-two lengths.

Test convolution against direct multiplication for small random sequences.

Use tolerance scaled to expected magnitude rather than a universal literal in large computations.

Test exceptional values deliberately; NaN values should not be silently treated as meaningful spectrum samples.

## 7. Practice Checklist

- State the DFT sign and normalization convention.
- Require power-of-two length for radix-2 code.
- Verify even and odd decomposition algebra.
- Test transform followed by inverse.
- Differential-test small inputs against direct DFT.
- Pad linear convolution to at least $p+q-1$.
- Trim padded convolution output deliberately.
- Use tolerances for floating-point checks.
- Test zero and one-length input behavior.
- Test non-power-of-two rejection or select another algorithm.
- Document sample-rate interpretation for spectra.
- Window signals when spectral leakage matters.
- Measure direct convolution before using FFT on short inputs.
- Use an optimized library for high-throughput production work.
- Consider integer-safe transforms for exact coefficient requirements.
- Test impulse, constant, and aligned-sinusoid inputs.
- Document bin ordering and sample-rate mapping.
- Preserve normalization convention across library boundaries.
- Use overlap methods for long streaming convolution.
- Avoid interpreting zero padding as increased physical resolution.
- Choose tolerance relative to signal magnitude.
- Verify real-spectrum conjugate symmetry when applicable.
- Keep transform planning and execution separate in performance-critical code.

## 8. Frequently Asked Questions

### Is FFT the same as DFT?

FFT is an algorithm family for computing the DFT efficiently.

The mathematical transform is the same when conventions match.

### Why must radix-2 length be a power of two?

Its recursive decomposition repeatedly halves the length until one-element base cases.

Other Cooley-Tukey factorizations support other composite lengths.

### Why are FFT results complex for real input?

Frequency components carry magnitude and phase.

Real input has conjugate symmetry, which specialized real FFTs exploit.

### Why is padding needed for convolution?

Without sufficient padding, transform multiplication computes cyclic convolution and wraps high-index terms around.

### Is $O(n\log n)$ always faster than direct convolution?

Not for very short vectors.

The crossover depends on implementation and hardware.

### What causes small imaginary parts in expected-real results?

Floating-point rounding accumulates through complex arithmetic.

Treat tiny residuals with a documented tolerance.

### Can FFT multiply integers exactly?

Floating-point FFT needs rounding analysis.

Number-theoretic transforms provide exact modular alternatives when their constraints fit.

### What is the main implementation risk?

Mixing sign, normalization, indexing, or padding conventions can produce plausible but incorrect output.

### Why does a constant signal produce one large bin?

Every sample contributes in phase to the zero-frequency sum.

At other roots of unity, the evenly spaced complex contributions cancel in exact arithmetic.

### What is spectral leakage?

A finite observation window may cut a waveform between periods.

Its energy then spreads across neighboring frequency bins rather than remaining in one bin.

### Does zero padding reduce leakage?

No.

It samples the existing windowed spectrum more densely but does not change the original window discontinuity.

### Why use a window function?

Windows trade main-lobe width against sidelobe level when estimating spectra from finite observations.

Choose one according to the measurement objective rather than applying it blindly.

### What happens if I omit inverse normalization?

The recovered sequence is scaled by transform length.

Some libraries normalize the forward transform, some the inverse, and some neither.

### Can I transform a length of zero?

The displayed implementation returns an empty list as an API convenience.

Mathematical DFT definitions are normally stated for positive length, so document the application-level convention.

### Precision selection

Single precision reduces bandwidth and storage but accumulates roundoff sooner than double precision.

Choose precision from required error tolerance, dynamic range, and transform length.

Scaling intermediate stages can reduce overflow risk in fixed-point implementations.

Fixed-point FFTs also need an explicit rounding and saturation policy.

### API boundaries

Accepting arbitrary sequence lengths should select a supported algorithm or return a clear error.

Do not silently truncate samples to reach a convenient radix.

Do not silently pad when padding changes the caller's intended mathematical result.

Return or document the transform length so downstream code can interpret bin spacing correctly.

Record the forward sign convention in serialized spectral data.

Record whether coefficients are normalized.

Keep sample rate with any spectrum intended for later analysis.

Verify boundary behavior in every convolution API.

Prefer tested library plans for repeated transforms of the same size.

Measure end-to-end pipeline cost rather than transform cost alone.

Validate numerical results against known signals before deployment.

Keep exact reference cases in the test suite as conventions evolve.
