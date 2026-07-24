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

# 6. NETWORK-APOLLO (Deep Expanded)
apollo_md = r"""# Comprehensive Guide to Apollo-Android: GraphQL Client, Mutations & Normalized Caching

**Apollo-Android** (Apollo Kotlin) is a specialized GraphQL client library engineered specifically for Android and Kotlin applications. Unlike traditional REST API clients that fetch static endpoints with fixed JSON response payloads, Apollo parses `.graphql` query files during compilation, generating strongly-typed, immutable Kotlin data models. It manages GraphQL queries, mutations, real-time WebSocket subscriptions, and normalized graph caching.

---

## 1. Architectural Pipeline: Normalized In-Memory & SQLite Caching

In traditional REST architectures, fetching nested object graphs often requires multiple endpoint queries (`/users/123`, `/users/123/orders`), leading to over-fetching or under-fetching of data. GraphQL solves this by allowing mobile clients to request exact fields in a single query payload.

Apollo-Android enhances GraphQL performance by maintaining a **Normalized Graph Cache**:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="apBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#312e81"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#apBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Apollo GraphQL Normalized Cache Architecture</text>

  <!-- GraphQL Query -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">GraphQL Query</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Parsed from .graphql</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Generated Code Model</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Type-safe Arguments</text>
  </g>

  <!-- Apollo Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">Apollo Client Engine</text>
    <text x="15" y="70" fill="#a5b4fc" font-family="system-ui" font-size="12">• Normalizes Response</text>
    <text x="15" y="100" fill="#a5b4fc" font-family="system-ui" font-size="12">• Splits into Records</text>
    <text x="15" y="130" fill="#a5b4fc" font-family="system-ui" font-size="12">• Key: "User:123"</text>
  </g>

  <!-- Cache Storage -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Normalized Cache</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• MemoryCacheFactory</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• SqlNormalizedCache</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Auto UI Flow Updates</text>
  </g>
</svg>

---

## 2. Production Apollo Kotlin Implementation

```kotlin
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.cache.normalized.FetchPolicy
import com.apollographql.apollo3.cache.normalized.api.MemoryCacheFactory
import com.apollographql.apollo3.cache.normalized.fetchPolicy
import com.apollographql.apollo3.cache.normalized.normalizedCache
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class UserRepository(private val apolloClient: ApolloClient) {

    // 1. Query Execution with Cache-First Policy returning Kotlin Flow
    fun observeUserProfile(userId: String): Flow<UserProfileData> {
        return apolloClient.query(GetUserProfileQuery(id = userId))
            .fetchPolicy(FetchPolicy.CacheFirst)
            .toFlow()
            .map { response ->
                val user = response.data?.user
                UserProfileData(
                    id = user?.id.orEmpty(),
                    name = user?.name.orEmpty(),
                    email = user?.email.orEmpty()
                )
            }
    }

    // 2. Mutation Execution (Automatically updates Normalized Cache records)
    suspend fun updateUserName(userId: String, newName: String): Boolean {
        val mutation = UpdateUserNameMutation(id = userId, name = newName)
        val response = apolloClient.mutation(mutation).execute()
        return !response.hasErrors()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is Apollo GraphQL preferred over REST Retrofit for complex UI screens?
GraphQL allows the client app to request only the exact fields required for a UI screen in a single query, preventing over-fetching of data and eliminating multiple REST roundtrips.

### Q2: What is Normalized Caching in Apollo-Android?
Normalized caching breaks down GraphQL responses into individual objects identified by key (e.g. `User:42`). If a mutation updates `User:42`, all active UI queries referencing `User:42` receive updated emissions automatically.

### Q3: How does Apollo Kotlin compile GraphQL queries into Kotlin code?
Apollo uses a Gradle plugin that reads local `.graphql` schema and query files during compilation, generating immutable Kotlin data classes with full nullability support.

### Q4: How are GraphQL Subscriptions handled in Apollo?
Subscriptions use WebSocket connections (`WebSocketNetworkTransport`) to stream real-time server events (such as chat messages) directly into Kotlin Flows.

### Q5: How do you pass authentication headers in Apollo Kotlin?
Add an `HttpInterceptor` to the `ApolloClient.Builder()` to inject authorization headers (e.g. `Authorization: Bearer Token`) into HTTP POST payloads.
"""

# 9. ANDROID-CHUCKER (Deep Expanded)
chucker_md = r"""# Comprehensive Guide to Chucker in Android: In-App HTTP Inspection & Security Redaction

**Chucker** is an in-app HTTP inspection utility for Android applications. Operating directly inside the OkHttp interceptor chain, Chucker captures outgoing HTTP requests and incoming responses on test devices, displaying full headers, bodies, status codes, and execution timing in an interactive notification UI without requiring external desktop proxies (like Charles or Fiddler).

---

## 1. Architectural Pipeline & Interceptor Integration

Chucker hooks into OkHttp's interceptor pipeline:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chkBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#chkBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Chucker In-App HTTP Interceptor Flow</text>

  <!-- OkHttp Chain -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">OkHttp Pipeline</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Intercepts Request</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Captures Payload</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Measures Latency</text>
  </g>

  <!-- Chucker Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="15">Chucker Engine</text>
    <text x="15" y="70" fill="#fef9c3" font-family="system-ui" font-size="12">• Redacts Auth Headers</text>
    <text x="15" y="100" fill="#fef9c3" font-family="system-ui" font-size="12">• Formats JSON/XML</text>
    <text x="15" y="130" fill="#fef9c3" font-family="system-ui" font-size="12">• Stores in Room DB</text>
  </g>

  <!-- Notification UI -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">In-App UI</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Status Notification</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Searchable Network Log</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Export as cURL</text>
  </g>
</svg>

---

## 2. Production Chucker Implementation

```kotlin
import android.content.Context
import com.chuckerteam.chucker.api.ChuckerCollector
import com.chuckerteam.chucker.api.ChuckerInterceptor
import com.chuckerteam.chucker.api.RetentionManager
import okhttp3.OkHttpClient

fun createOkHttpClient(context: Context): OkHttpClient {
    // 1. Configure Notification Collector
    val chuckerCollector = ChuckerCollector(
        context = context,
        showNotification = true,
        retentionPeriod = RetentionManager.Period.ONE_HOUR
    )

    // 2. Build Chucker Interceptor with Security Redaction
    val chuckerInterceptor = ChuckerInterceptor.Builder(context)
        .collector(chuckerCollector)
        .maxContentLength(250_000L)
        .redactHeaders(setOf("Authorization", "Bearer", "Set-Cookie"))
        .alwaysReadResponseBody(true)
        .build()

    // 3. Attach to OkHttp Client Builder
    return OkHttpClient.Builder()
        .addInterceptor(chuckerInterceptor)
        .build()
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is Chucker preferred over desktop HTTP proxies (Charles / Fiddler) during mobile development?
Chucker operates directly on the test device, eliminating the need to set up manual Wi-Fi proxy settings, install custom SSL root certificates, or connect to desktop machines.

### Q2: How do you ensure sensitive user passwords or Auth tokens are not exposed in Chucker UI?
Use `.redactHeaders(setOf("Authorization", "Cookie"))` on `ChuckerInterceptor.Builder` to replace sensitive header string values with `**REDACTED**`.

### Q3: How do you exclude Chucker completely from production release builds?
Use Gradle's `debugImplementation` for full Chucker and `releaseImplementation` for `chucker-no-op`:
`debugImplementation("com.github.chuckerteam.chucker:library:4.x")`
`releaseImplementation("com.github.chuckerteam.chucker:library-no-op:4.x")`

### Q4: Can HTTP traffic recorded by Chucker be exported for debugging?
Yes. Chucker provides a built-in export action that allows developers to share request details as raw text or standard `curl` commands directly via Android's native share sheet.

### Q5: Does Chucker support HTTP/2 and WebSocket connections?
Chucker inspects all requests passing through the OkHttp Interceptor chain, fully supporting HTTP/1.1 and HTTP/2 requests.
"""

# 10. ANDROID-BENCHMARK (Deep Expanded)
benchmark_md = r"""# Comprehensive Guide to Jetpack Benchmark & Macrobenchmark in Android: Frame Timing & Baseline Profiles

**Jetpack Benchmark** (Microbenchmark & Macrobenchmark) is Google's performance measurement framework for Android. Microbenchmark measures low-level CPU code execution speed (such as algorithm loops or layout inflation), while **Macrobenchmark** measures real-world app startup latency, frame rendering smoothness (jank detection), and the impact of **Baseline Profiles** compiled by R8/D8.

---

## 1. Microbenchmark vs Macrobenchmark Execution Spectrum

| Metric | Jetpack Microbenchmark | Jetpack Macrobenchmark |
| :--- | :--- | :--- |
| **Scope** | CPU algorithms, functions, database queries | Full App Startup (`COLD`, `WARM`), Scroll Jank |
| **Test Environment** | Runs inside target app process | Runs in separate test process via UI Automator |
| **Compilation Control** | Runs standard JIT code | Tests JIT, SpeedProfile, and Baseline Profiles |
| **Target Device** | Physical device with root / thermal control | Physical Android devices (API 23+) |

---

## 2. Production Macrobenchmark Implementation

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

inject_into_de_blog_data('network-apollo', apollo_md)
inject_into_de_blog_data('android-chucker', chucker_md)
inject_into_de_blog_data('android-benchmark', benchmark_md)

print("Part 4 Deep Padding Completed!")
