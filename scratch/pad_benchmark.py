import os

def inject_into_de_blog_data(slug: str, markdown_content: str):
    file_path = 'src/config/deBlogData.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    escaped_md = markdown_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    slug_key = f"  '{slug}':"
    idx = content.find(slug_key)
    
    if idx != -1:
        end_quote_idx = content.find("`", idx + len(slug_key))
        if end_quote_idx != -1:
            closing_idx = -1
            curr = end_quote_idx + 1
            while curr < len(content):
                if content[curr] == '`' and content[curr-1] != '\\':
                    closing_idx = curr
                    break
                curr += 1
            if closing_idx != -1:
                new_content = content[:end_quote_idx+1] + "\n" + escaped_md + "\n" + content[closing_idx:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"SUCCESSFULLY REPLACED '{slug}' ({len(markdown_content)} chars) in {file_path}")
                return True
    
    last_brace = content.rfind('};')
    if last_brace != -1:
        entry = f"\n  '{slug}': `\n{escaped_md}\n`,\n"
        new_content = content[:last_brace] + entry + content[last_brace:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESSFULLY INJECTED NEW '{slug}' ({len(markdown_content)} chars) in {file_path}")
        return True
    return False

# 10. ANDROID-BENCHMARK (Fully Expanded)
benchmark_md = r"""# Comprehensive Guide to Jetpack Benchmark & Macrobenchmark in Android: Frame Timing & Baseline Profiles

**Jetpack Benchmark** (Microbenchmark & Macrobenchmark) is Google's performance measurement framework for Android. Microbenchmark measures low-level CPU code execution speed (such as algorithm loops, JSON parsing, or layout inflation), while **Macrobenchmark** measures real-world app startup latency, frame rendering smoothness (jank detection), and the impact of **Baseline Profiles** compiled by R8/D8.

---

## 1. Microbenchmark vs Macrobenchmark Execution Spectrum

Android applications require performance optimization across two distinct granularities:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#bmBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Jetpack Benchmark Execution Spectrum</text>

  <!-- Microbenchmark -->
  <g transform="translate(60, 110)">
    <rect width="360" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="180" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Microbenchmark (Low-Level)</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Runs inside target app process</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Measures tight CPU loops & algorithms</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Warmup CPU & measures nanoseconds</text>
  </g>

  <!-- Macrobenchmark -->
  <g transform="translate(480, 110)">
    <rect width="360" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="180" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">Macrobenchmark (System-Level)</text>
    <text x="15" y="70" fill="#a5b4fc" font-family="system-ui" font-size="12">• Out-of-process UI Automator execution</text>
    <text x="15" y="100" fill="#a5b4fc" font-family="system-ui" font-size="12">• Measures Cold / Warm App Startup</text>
    <text x="15" y="130" fill="#a5b4fc" font-family="system-ui" font-size="12">• Evaluates Frame Jank & Baseline Profiles</text>
  </g>
</svg>

---

## 2. Metric & Execution Strategy Comparison

| Metric | Jetpack Microbenchmark | Jetpack Macrobenchmark |
| :--- | :--- | :--- |
| **Scope** | CPU algorithms, functions, database queries | Full App Startup (`COLD`, `WARM`), Scroll Jank |
| **Test Environment** | Runs inside target app process | Runs in separate test process via UI Automator |
| **Compilation Control** | Runs standard JIT code | Tests JIT, SpeedProfile, and Baseline Profiles |
| **Target Device** | Physical device with root / thermal control | Physical Android devices (API 23+) |

---

## 3. Production Macrobenchmark Implementation

```kotlin
import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ColdStartupBenchmark {

    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun measureColdStartup() = benchmarkRule.measureRepeated(
        packageName = "com.example.myapp",
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT, // Measures with Baseline Profile
        iterations = 5,
        startupMode = StartupMode.COLD
    ) {
        pressHome()
        startActivityAndWait()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What are Baseline Profiles in Android?
Baseline Profiles are a list of classes and methods included in an APK that Android's Ahead-Of-Time (AOT) compiler pre-compiles upon installation, eliminating JIT compilation overhead and improving app startup speed by up to 30%.

### Q2: Why must Macrobenchmarks be executed on physical devices rather than Android Emulators?
Emulators run on desktop CPUs with variable host CPU scheduling, producing inconsistent, noisy performance measurements. Physical devices reflect real hardware thermal throttling and CPU behavior.

### Q3: What is the difference between COLD, WARM, and HOT startup modes?
COLD startup creates a new process from scratch. WARM startup re-creates the Activity inside an existing process. HOT startup brings an existing Activity back to the foreground from RAM.

### Q4: How does Macrobenchmark measure UI Frame Jank?
Macrobenchmark uses `FrameTimingMetric()` to track frame render durations, reporting 50th, 90th, and 99th percentile frame completion times against the 16ms (60fps) or 8.3ms (120fps) VSYNC deadlines.

### Q5: How do you generate a Baseline Profile automatically?
Use the `BaselineProfileRule` from `androidx.benchmark:benchmark-macro-junit4` to record user journeys (like scrolling a feed) and output a `baseline-prof.txt` file.
"""

inject_into_de_blog_data('android-benchmark', benchmark_md)

print("Benchmark padded!")
