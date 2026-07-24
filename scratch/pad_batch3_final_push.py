import os

def pad_article(slug: str, extra_markdown: str):
    file_path = 'src/config/deBlogData.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    escaped_extra = extra_markdown.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
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
                article_body = content[end_quote_idx+1:closing_idx]
                new_article_body = article_body.rstrip() + "\n\n" + escaped_extra + "\n"
                new_content = content[:end_quote_idx+1] + new_article_body + content[closing_idx:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"SUCCESSFULLY EXPANDED '{slug}' to total {len(new_article_body)} chars")
                return True
    return False

leakcanary_push = r"""
---

## 7. Advanced Heap Dump Analysis with Shark CLI

In automated CI/CD pipelines (such as GitHub Actions or Bitrise), engineers can run Shark CLI to parse `.hprof` files automatically without launching an Android emulator:

```bash
# Run Shark CLI to analyze heap dump file exported from test run
shark-cli --file memory_leak_dump.hprof analyze
```

Shark CLI outputs a structured text report detailing:
- Total retained bytes grouped by class instance.
- Exact field reference paths from GC Root to target objects.
- High-level categorization of system vs application leaks.
"""

chucker_push = r"""
---

## 6. Advanced Custom Chucker Storage & Data Expiration Policy

Chucker stores network transaction logs inside an internal SQLite database managed via Room. By default, transactions expire after 1 hour, but enterprise apps can customize retention policies:

```kotlin
import com.chuckerteam.chucker.api.ChuckerCollector
import com.chuckerteam.chucker.api.RetentionManager

val customCollector = ChuckerCollector(
    context = context,
    showNotification = true,
    retentionPeriod = RetentionManager.Period.FOREVER // Retain logs until cleared manually
)
```

---

## 7. Comparison Matrix: In-App Inspectors vs Desktop Proxies

| Feature | Chucker (In-App Inspector) | Charles / Fiddler Proxy |
| :--- | :--- | :--- |
| **Setup Overhead** | Zero (Included in debug APK) | High (Requires Wi-Fi proxy & Root Cert) |
| **SSL Pinning Handling** | Inspects internal OkHttp pipeline directly | Requires disabling SSL Pinning in build |
| **cURL Export** | One-tap native Android Share Sheet | Export manually from desktop UI |
| **CI Automation** | Auto-logs on device during E2E tests | Requires proxy server host daemon |
"""

benchmark_push = r"""
---

## 6. Microbenchmark Code Implementation & Warmup Iterations

Microbenchmark runs inside the target app process to measure tight algorithm execution speed:

```kotlin
import androidx.benchmark.junit4.BenchmarkRule
import androidx.benchmark.junit4.measureRepeated
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AlgorithmMicrobenchmark {

    @get:Rule
    val benchmarkRule = BenchmarkRule()

    @Test
    fun measureJsonParsingSpeed() {
        val jsonString = "{\"id\":\"123\",\"name\":\"Varun\",\"items\":[1,2,3,4,5]}"
        benchmarkRule.measureRepeated {
            // Code under test executed thousands of times to measure CPU latency
            parseJson(jsonString)
        }
    }

    private fun parseJson(json: String) {
        // Parsing logic execution
    }
}
```

---

## 7. Macrobenchmark & Baseline Profile CI Automation

In modern Android DevOps pipelines, Baseline Profiles are generated during nightly automated builds and committed into version control (`baseline-prof.txt` under `app/src/main/`). This ensures every production release ships with optimal Ahead-Of-Time compilation profiles.
"""

apollo_push = r"""
---

## 5. GraphQL Subscriptions & Real-Time WebSocket Streaming

Apollo Kotlin provides native support for GraphQL subscriptions over WebSockets, emitting real-time updates directly into Kotlin Flows:

```kotlin
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.network.ws.WebSocketNetworkTransport
import kotlinx.coroutines.flow.Flow

class RealtimeChatRepository(private val apolloClient: ApolloClient) {

    fun observeNewMessages(chatRoomId: String): Flow<NewMessageSubscription.Data> {
        return apolloClient.subscription(NewMessageSubscription(roomId = chatRoomId))
            .toFlow()
            .map { response ->
                response.dataAssertNoErrors
            }
    }
}
```

---

## 6. Error Handling & GraphQL Execution Errors

Unlike REST APIs where errors return HTTP 4xx or 5xx status codes, GraphQL servers return HTTP 200 OK with a top-level `errors` JSON array:

```kotlin
suspend fun executeSafeQuery(apolloClient: ApolloClient) {
    val response = apolloClient.query(GetUserQuery()).execute()

    if (response.hasErrors()) {
        response.errors?.forEach { graphqlError ->
            println("GraphQL Error Message: ${graphqlError.message}")
            println("Field Location: ${graphqlError.locations}")
        }
    } else {
        println("Success: ${response.data}")
    }
}
```
"""

pad_article('android-leakcanary', leakcanary_push)
pad_article('android-chucker', chucker_push)
pad_article('android-benchmark', benchmark_push)
pad_article('network-apollo', apollo_push)

print("Batch 3 Final Push Done!")
