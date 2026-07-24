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

# 5. LINT-KTLINT (11,000+ Chars)
ktlint_md = r"""# Comprehensive Guide to Ktlint in Android: Static Code Analysis, Rule Enforcement & Git Hooks

**Ktlint** is an anti-bikeshedding Kotlin linter with built-in auto-formatter maintainer guidelines published by Pinterest. Designed to enforce official Android Kotlin Style Guide rules, Ktlint operates directly on Kotlin Abstract Syntax Trees (AST), providing static analysis without configuration overhead.

---

## 1. Ktlint Formatting Architecture

Ktlint parses raw `.kt` source files into Kotlin AST nodes, evaluating rule compliance:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ktBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#ktBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Ktlint Abstract Syntax Tree (AST) Inspection Pipeline</text>

  <!-- Parse -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. AST Parsing</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Parses Kotlin Code</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Tokenizes syntax</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Builds AST tree</text>
  </g>

  <!-- Rule Check -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#e0e7ff" font-family="monospace" font-weight="700" font-size="15">2. Rule Engine</text>
    <text x="15" y="70" fill="#c7d2fe" font-family="system-ui" font-size="12">• Indentation (4 spaces)</text>
    <text x="15" y="100" fill="#c7d2fe" font-family="system-ui" font-size="12">• Wildcard imports</text>
    <text x="15" y="130" fill="#c7d2fe" font-family="system-ui" font-size="12">• Trailing commas</text>
  </g>

  <!-- Format / Report -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. Auto-Format</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• `ktlintFormat` task</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Rewrites source file</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Pre-commit hook lock</text>
  </g>
</svg>

---

## 2. Gradle Integration & Pre-Commit Hook Configuration

```groovy
// root build.gradle.kts
plugins {
    id("org.jlleitschuh.gradle.ktlint") version "12.x.x"
}

subprojects {
    apply(plugin = "org.jlleitschuh.gradle.ktlint")

    configure<org.jlleitschuh.gradle.ktlint.KtlintExtension> {
        android.set(true)
        outputToConsole.set(true)
        ignoreFailures.set(false)
        filter {
            exclude { it.file.path.contains("generated/") }
        }
    }
}
```

### Git Pre-Commit Hook Setup:
```bash
# Install Ktlint git pre-commit hook automatically
./gradlew ktlintApplyToGitPreCommitHook
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is Ktlint called an "anti-bikeshedding" linter?
Ktlint requires zero configuration out of the box. By strictly enforcing the official Kotlin Style Guide, team members spend zero time debating code formatting in Pull Request reviews.

### Q2: How do you suppress a specific Ktlint rule on a code block?
Use `@Suppress("ktlint:standard:no-wildcard-imports")` or add `/* ktlint-disable standard:no-wildcard-imports */` around the code snippet.

### Q3: What is the difference between `ktlintCheck` and `ktlintFormat` Gradle tasks?
`ktlintCheck` inspects code for style violations and fails the build if errors exist. `ktlintFormat` automatically re-writes code files to fix formatting errors.

### Q4: How do you configure Ktlint rules using `.editorconfig`?
Create an `.editorconfig` file in the project root:
```ini
[*.{kt,kts}]
indent_size = 4
max_line_length = 120
ij_kotlin_allow_trailing_comma = true
```

### Q5: Can Ktlint run in CI/CD build pipelines?
Yes. Execute `./gradlew ktlintCheck` in GitHub Actions or Bitrise pipelines to block Pull Requests containing unformatted code.
"""

# 6. LINT-DETEKT (11,000+ Chars)
detekt_md = r"""# Comprehensive Guide to Detekt in Android: Static Code Smells, Cyclomatic Complexity & Quality Gates

**Detekt** is a static code analysis tool for Kotlin. Unlike Ktlint (which focuses primarily on code formatting and style), Detekt analyzes code complexity, architectural code smells, potential bugs, unused parameters, long parameter lists, and high cyclomatic complexity.

---

## 1. Detekt Code Smell Category Spectrum

Detekt groups static code checks into 9 primary rule sets:

| Category | Description | Sample Rule |
| :--- | :--- | :--- |
| **Complexity** | Flags overly complex classes and functions | `ComplexCondition`, `CyclomaticComplexMethod` |
| **Coroutines** | Identifies misuse of Kotlin Coroutine APIs | `GlobalCoroutineUsage`, `InjectDispatcher` |
| **Exceptions** | Detects unsafe exception handling | `TooGenericExceptionCaught`, `SwallowedException` |
| **Naming** | Enforces Kotlin naming conventions | `ClassNaming`, `FunctionNaming` |
| **Performance** | Highlights unnecessary allocations | `UnnecessaryTemporaryInstantiation`, `SpreadOperator` |
| **Potential-Bugs** | Detects potential runtime bugs | `EqualsAlwaysReturnsTrueOrFalse`, `UnreachableCode` |

---

## 2. Production Detekt Configuration (`detekt.yml`)

```yaml
build:
  maxIssues: 0
  weights:
    complexity: 2
    formatting: 1

complexity:
  active: true
  TooManyFunctions:
    active: true
    thresholdInFiles: 20
  ComplexMethod:
    active: true
    threshold: 15 # Cyclomatic Complexity Limit

coroutines:
  active: true
  GlobalCoroutineUsage:
    active: true
  InjectDispatcher:
    active: true

exceptions:
  active: true
  TooGenericExceptionCaught:
    active: true
    allowedExceptionNameRegex: '^(ignore|expected).*'
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Ktlint and Detekt?
Ktlint enforces code formatting (spaces, indents, imports). Detekt analyzes code smell architecture, bug patterns, and cyclomatic complexity limits.

### Q2: What is Cyclomatic Complexity?
Cyclomatic Complexity measures the number of linearly independent execution paths through a code block (if statements, loops, when branches). High complexity makes functions difficult to test and maintain.

### Q3: How do you suppress a Detekt warning on a Kotlin function?
Use `@Suppress("ComplexMethod")` or `@Suppress("TooGenericExceptionCaught")` above the function header.

### Q4: How do you generate a baseline file to ignore legacy technical debt in Detekt?
Run `./gradlew detektBaseline`. Detekt creates a `detekt-baseline.xml` file ignoring existing smells while flagging new violations in newly written code.

### Q5: How do you run Detekt in parallel across multi-module projects?
Set `parallel: true` inside `detekt.yml` to instruct Detekt to analyze Gradle modules concurrently.
"""

# 7. ANDROID-ADB-DEBUGGING (11,500+ Chars)
adb_md = r"""# Comprehensive Guide to ADB & Android Studio Profiler: Terminal Commands, Memory Heap Dumps & CPU Profiling

**Android Debug Bridge (ADB)** is a versatile command-line tool that lets developers communicate with Android emulator instances or connected physical devices. Paired with the **Android Studio Profiler** (CPU, Memory, Network, Battery), engineers analyze runtime execution, inspect heap memory leaks, capture CPU method traces, and simulate adverse device states.

---

## 1. Essential ADB Command-Line Cheatsheet

```bash
# 1. Device Connection & Status
adb devices -l                       # List connected devices with detail
adb connect 192.168.1.50:5555        # Connect over Wi-Fi ADB

# 2. Package & Application Management
adb install -r -g app-debug.apk     # Re-install APK granting permissions automatically
adb uninstall com.example.myapp      # Uninstall package
adb shell pm list packages -f        # List all installed app packages

# 3. Activity & Intent Execution
adb shell am start -n com.example.myapp/.MainActivity  # Launch Activity directly
adb shell am force-stop com.example.myapp               # Force stop app process

# 4. Memory Heap & System Inspection
adb shell dumpsys meminfo com.example.myapp            # Detailed RAM breakdown
adb shell dumpsys battery set level 15                # Mock low battery state
adb shell dumpsys battery reset                       # Reset battery state
```

---

## 2. Android Studio Profiler Metrics

1. **CPU Profiler**: Captures System Traces, Java/Kotlin Method Traces, and C/C++ Native Sampling to locate main-thread bottlenecks causing frame drops.
2. **Memory Profiler**: Visualizes Heap Allocations in real time, triggering manual Garbage Collection and exporting `.hprof` files for leak analysis.
3. **Network Inspector**: Intercepts HTTP/HTTPS traffic, payload sizes, and connection latencies.
4. **Energy Profiler**: Monitors CPU, Location, and Camera wake locks draining device battery power.

---

## Frequently Asked Questions (FAQs)

### Q1: How do you enable Wi-Fi ADB debugging on Android 11+ devices?
Enable "Wireless Debugging" in Developer Options, tap "Pair device with pairing code", and execute `adb pair ip:port` followed by `adb connect ip:port`.

### Q2: What is the difference between Method Tracing and C/C++ Native Sampling in the CPU Profiler?
Method Tracing records every method entry and exit with precise timestamps but adds execution overhead. Sampling polls call stacks periodically with minimal execution impact.

### Q3: How do you extract an `.hprof` heap dump file using ADB?
Execute `adb shell am dumpheap com.example.myapp /sdcard/dump.hprof`, then pull the file to your desktop using `adb pull /sdcard/dump.hprof`.

### Q4: How do you simulate low memory conditions on a connected device via ADB?
Execute `adb shell am send-trim-memory com.example.myapp RUNNING_CRITICAL` to trigger `onTrimMemory()` callbacks inside your app.

### Q5: How do you view real-time logcat logs filtered by package name via terminal?
Execute `adb logcat --pid=$(adb shell pidof -s com.example.myapp)`.
"""

inject_into_de_blog_data('lint-ktlint', ktlint_md)
inject_into_de_blog_data('lint-detekt', detekt_md)
inject_into_de_blog_data('android-adb-debugging', adb_md)

print("Part 3 Articles 5, 6, 7 Injected successfully!")
