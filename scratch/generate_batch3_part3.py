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

# 5. NETWORK-OKHTTP
okhttp_md = r"""# Comprehensive Guide to OkHttp Engine in Android: Connection Pooling, HTTP/2 Multiplexing & Caching Mechanics

**OkHttp** is an efficient HTTP client engine developed by Square that serves as the default network transport layer across Android. OkHttp manages raw TCP socket connections, TLS handshakes, HTTP/2 multiplexing, connection pooling, and transparent GZIP decompression.

---

## 1. Architectural Connection Pooling & HTTP/2 Multiplexing

Establishing a secure HTTPS connection requires expensive TCP 3-way handshakes and TLS cryptographic key exchanges. OkHttp optimizes latency through two primary mechanisms:
1. **Connection Pooling**: Reuses existing open TCP sockets for subsequent HTTP requests to the same host, avoiding handshake overhead.
2. **HTTP/2 Multiplexing**: Sends multiple concurrent HTTP requests and responses simultaneously over a single TCP connection stream.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="okBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#okBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">OkHttp Socket Connection Pool Architecture</text>

  <!-- App Request Queue -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Request Dispatcher</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Async Call Queue</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Max Requests (64)</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Max Per Host (5)</text>
  </g>

  <!-- ConnectionPool -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">ConnectionPool</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Reuses Open Sockets</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Keep-Alive Duration</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Cleanup Runnable</text>
  </g>

  <!-- Remote Server Socket -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">HTTP/2 Server</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Multiplexed Streams</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• TLS 1.3 Session</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Single TCP Connection</text>
  </g>
</svg>

---

## 2. Production OkHttp Setup: Disk Cache & Custom Interceptors

```kotlin
import okhttp3.*
import java.io.File
import java.util.concurrent.TimeUnit

class OkHttpClientManager(private val cacheDir: File) {

    val client: OkHttpClient by lazy {
        // 10 MB Disk Cache setup
        val cache = Cache(File(cacheDir, "http_cache"), 10 * 1024 * 1024L)

        OkHttpClient.Builder()
            .cache(cache)
            .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .addInterceptor(CacheControlInterceptor())
            .build()
    }
}

// Custom Interceptor enforcing offline cache reads
class CacheControlInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        if (!isNetworkAvailable()) {
            request = request.newBuilder()
                .header("Cache-Control", "public, only-if-cached, max-stale=" + 60 * 60 * 24 * 7) // 7 days stale
                .build()
        }
        return chain.proceed(request)
    }

    private fun isNetworkAvailable(): Boolean {
        // ConnectivityManager check
        return true
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does OkHttp Connection Pooling reduce HTTP latency?
OkHttp maintains a pool of open TCP connections (`ConnectionPool`). When a request finishes, the connection remains open for up to 5 minutes, allowing subsequent requests to bypass TCP and TLS handshakes.

### Q2: How does HTTP/2 Multiplexing differ from HTTP/1.1 pipelining?
HTTP/1.1 requires responses to be returned in sequential order (head-of-line blocking). HTTP/2 splits requests into independent binary frames transmitted concurrently over a single TCP stream.

### Q3: What is the difference between OkHttp `Cache` and memory caching?
OkHttp `Cache` stores HTTP response headers and bodies on disk according to standard `Cache-Control` headers (e.g. `max-age`, `e-tag`), persisting across app restarts.

### Q4: How do you configure OkHttp Certificate Pinning to prevent MITM attacks?
Use `CertificatePinner.Builder().add("api.example.com", "sha256/HASH...").build()` to verify that the server's public key fingerprint matches expected pins during TLS negotiation.

### Q5: What is the role of OkHttp `Dispatcher`?
The `Dispatcher` controls asynchronous request execution limits, restricting concurrent requests across the app (default max: 64 overall, 5 per host).
"""

# 6. NETWORK-APOLLO
apollo_md = r"""# Comprehensive Guide to Apollo-Android: GraphQL Client, Mutations & Normalized Caching

**Apollo-Android** (Apollo Kotlin) is a specialized GraphQL client library designed for Android. Unlike REST clients that fetch fixed endpoints, Apollo compiles `.graphql` query files into strongly-typed Kotlin data models, handling queries, mutations, real-time WebSocket subscriptions, and normalized graph caching.

---

## 1. Architectural Pipeline & GraphQL Normalization

Apollo parses GraphQL query responses and stores individual entities in a **Normalized In-Memory Cache** indexed by unique record keys (such as `User:123`), ensuring UI components observing cached GraphQL queries update automatically when a mutation alters underlying objects.

```kotlin
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.cache.normalized.FetchPolicy
import com.apollographql.apollo3.cache.normalized.fetchPolicy
import com.apollographql.apollo3.cache.normalized.normalizedCache
import com.apollographql.apollo3.cache.normalized.api.MemoryCacheFactory

// 1. Apollo Client Builder with Normalized Cache
val apolloClient = ApolloClient.Builder()
    .serverUrl("https://api.example.com/graphql")
    .normalizedCache(MemoryCacheFactory(maxSizeBytes = 10 * 1024 * 1024))
    .build()

// 2. Executing a GraphQL Query with Cache-First Policy
suspend fun fetchUserProfile(userId: String) {
    val response = apolloClient.query(GetUserProfileQuery(id = userId))
        .fetchPolicy(FetchPolicy.CacheFirst)
        .execute()

    if (!response.hasErrors()) {
        val user = response.data?.user
        println("User: ${user?.name}")
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

inject_into_de_blog_data('network-okhttp', okhttp_md)
inject_into_de_blog_data('network-apollo', apollo_md)

print("Part 3 Articles 5 and 6 Injected!")
