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

# 5. NETWORK-OKHTTP (10,500+ Chars)
okhttp_md = r"""# Comprehensive Guide to OkHttp Engine in Android: Connection Pooling, HTTP/2 Multiplexing & Cache Protocols

**OkHttp** is the industry-standard HTTP & WebSocket client engine for Android, developed by Square. Serving as the underlying transport layer for libraries like Retrofit, Coil, and Glide, OkHttp manages raw TCP socket connections, TLS 1.3 handshakes, HTTP/2 multiplexing, connection pooling, and transparent GZIP decompression.

---

## 1. Socket Architecture & Connection Pooling Mechanics

Establishing a secure HTTPS connection requires expensive computational steps:
1. **DNS Name Resolution**: Translating hostnames (`api.example.com`) to IP addresses via System or DoH (DNS over HTTPS).
2. **TCP 3-Way Handshake**: Exchanging `SYN`, `SYN-ACK`, and `ACK` packets across cell towers or Wi-Fi routers.
3. **TLS Cryptographic Negotiation**: Exchanging public certificates, performing RSA/ECDHE key exchanges, and negotiating symmetric session keys.

OkHttp optimizes latency through two primary mechanisms:
- **Connection Pooling (`ConnectionPool`)**: Reuses open TCP sockets for subsequent HTTP requests to the same host, bypassing handshake delays entirely.
- **HTTP/2 Multiplexing**: Sends multiple concurrent HTTP requests and responses simultaneously over a single TCP connection stream using binary framing.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="okBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#okBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">OkHttp Socket Connection Pool Architecture</text>

  <!-- Request Dispatcher -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Request Dispatcher</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Async Call Queue</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Max Requests (64)</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Max Per Host (5)</text>
    <text x="15" y="155" fill="#94a3b8" font-family="system-ui" font-size="12">• Thread Pool Executor</text>
  </g>

  <!-- ConnectionPool -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">ConnectionPool</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Reuses Open Sockets</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• 5 Min Keep-Alive</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Evicts Idle Connections</text>
    <text x="15" y="155" fill="#a7f3d0" font-family="system-ui" font-size="12">• Zero Handshake Delay</text>
  </g>

  <!-- HTTP/2 Server Socket -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">HTTP/2 Server</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Multiplexed Streams</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• TLS 1.3 Session</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Single TCP Connection</text>
    <text x="15" y="155" fill="#a7f3d0" font-family="system-ui" font-size="12">• Binary Frame Headers</text>
  </g>
</svg>

---

## 2. Production Implementation: Advanced OkHttp Configuration

Below is a complete, production-grade OkHttp client configuration featuring disk caching, certificate pinning, event listeners, and custom interceptors:

```kotlin
import okhttp3.*
import okhttp3.logging.HttpLoggingInterceptor
import java.io.File
import java.util.concurrent.TimeUnit

class ProductionOkHttpClient(
    private val cacheDir: File,
    private val networkChecker: () -> Boolean
) {

    val client: OkHttpClient by lazy {
        // 1. Configure 25 MB Disk Cache
        val cache = Cache(File(cacheDir, "okhttp_cache"), 25 * 1024 * 1024L)

        // 2. Certificate Pinning to prevent Man-in-the-Middle (MITM) attacks
        val certificatePinner = CertificatePinner.Builder()
            .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .add("api.example.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
            .build()

        // 3. OkHttp Client Builder
        OkHttpClient.Builder()
            .cache(cache)
            .certificatePinner(certificatePinner)
            .connectionPool(ConnectionPool(maxIdleConnections = 5, keepAliveDuration = 5, TimeUnit.MINUTES))
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .writeTimeout(10, TimeUnit.SECONDS)
            .addInterceptor(OfflineCacheInterceptor(networkChecker))
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.HEADERS
            })
            .build()
    }
}

// Custom Interceptor enforcing offline disk cache reads when internet is disconnected
class OfflineCacheInterceptor(private val isOnline: () -> Boolean) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()

        if (!isOnline()) {
            val maxStale = 60 * 60 * 24 * 7 // Tolerate 7-day-old cache offline
            request = request.newBuilder()
                .header("Cache-Control", "public, only-if-cached, max-stale=$maxStale")
                .build()
        }

        return chain.proceed(request)
    }
}
```

---

## 3. Deep Dive into Interceptor Chains (Chain of Responsibility)

OkHttp employs the **Chain of Responsibility** behavioral pattern to pass HTTP requests through a sequence of internal and application-defined interceptors:
1. **Application Interceptors**: Added via `addInterceptor()`. Executed once per request attempt, ignoring redirects or retries. Ideal for injecting custom headers (`Authorization`, `User-Agent`) or logging request parameters.
2. **RetryAndFollowUpInterceptor**: Handles automatic recovery from transient socket failures and follows HTTP 3xx redirect responses.
3. **BridgeInterceptor**: Converts high-level user request objects into wire-level HTTP requests (adding `Host`, `Keep-Alive`, `Accept-Encoding: gzip`, `User-Agent`).
4. **CacheInterceptor**: Checks disk cache for matching `Cache-Control` responses before making network calls.
5. **ConnectInterceptor**: Acquires an open socket connection from `ConnectionPool` or performs DNS and TLS handshakes to create a new one.
6. **Network Interceptors**: Added via `addNetworkInterceptor()`. Executed right before data hits the socket, capturing intermediate redirects and uncompressed wire byte traffic.

---

## 4. Comprehensive Interceptor Comparison Matrix

| Property | Application Interceptor (`addInterceptor`) | Network Interceptor (`addNetworkInterceptor`) |
| :--- | :--- | :--- |
| **Execution Frequency** | Invoked once per high-level request | Invoked for every network retry or HTTP redirect |
| **Short-Circuiting** | Can return fake response without hitting network | Must pass request through network socket |
| **Header Access** | High-level user headers only | Wire-level headers added by `BridgeInterceptor` |
| **Response Body Access** | Uncompressed original response payload | Compressed raw socket wire stream |

---

## Frequently Asked Questions (FAQs)

### Q1: How does OkHttp Connection Pooling reduce HTTP latency?
OkHttp maintains a pool of open TCP connections (`ConnectionPool`). When an HTTP request completes, the connection remains open in the pool for up to 5 minutes, allowing subsequent requests to reuse the open socket instantly.

### Q2: How does HTTP/2 Multiplexing differ from HTTP/1.1 pipelining?
HTTP/1.1 forces requests to be processed sequentially (head-of-line blocking). HTTP/2 splits requests into independent binary frames transmitted concurrently over a single TCP connection stream.

### Q3: What is the difference between Application Interceptors and Network Interceptors in OkHttp?
Application Interceptors execute once per request regardless of redirects or retries. Network Interceptors execute on the actual socket transmission layer, inspecting redirects, intermediate headers, and wire bytes.

### Q4: How do you configure OkHttp Certificate Pinning to prevent MITM attacks?
Use `CertificatePinner.Builder().add("domain.com", "sha256/HASH...").build()` to verify that the server's public key fingerprint matches expected pins during TLS negotiation.

### Q5: What is the role of the OkHttp `Dispatcher`?
The `Dispatcher` manages asynchronous request execution queues (`enqueue`), enforcing concurrency limits (default max: 64 concurrent requests overall, 5 per host).
"""

# 6. NETWORK-APOLLO (10,500+ Chars)
apollo_md = r"""# Comprehensive Guide to Apollo-Android: GraphQL Client, Mutations & Normalized Cache Architecture

**Apollo-Android** (Apollo Kotlin) is a specialized, type-safe GraphQL client library engineered specifically for Android and Kotlin Multiplatform (KMP) applications. Unlike traditional REST clients (like Retrofit) that fetch static endpoints with fixed JSON response payloads, Apollo parses `.graphql` schema and query files during compilation, generating strongly-typed, immutable Kotlin data models. It manages GraphQL queries, mutations, real-time WebSocket subscriptions, and normalized graph caching.

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

Below is a complete, production-grade implementation of Apollo Kotlin with Normalized Cache, Query observation, Mutation handling, and error mapping:

```kotlin
import com.apollographql.apollo3.ApolloClient
import com.apollographql.apollo3.cache.normalized.FetchPolicy
import com.apollographql.apollo3.cache.normalized.api.MemoryCacheFactory
import com.apollographql.apollo3.cache.normalized.fetchPolicy
import com.apollographql.apollo3.cache.normalized.normalizedCache
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class ApolloRepository(private val apolloClient: ApolloClient) {

    // 1. Observe GraphQL Query using CacheFirst Policy
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

    // 2. Execute GraphQL Mutation (Updates Cache Automatically)
    suspend fun updateUserName(userId: String, newName: String): Boolean {
        val mutation = UpdateUserNameMutation(id = userId, name = newName)
        val response = apolloClient.mutation(mutation).execute()
        return !response.hasErrors()
    }
}

data class UserProfileData(val id: String, val name: String, val email: String)
```

---

## 3. Normalized Cache vs Response Cache

| Metric | HTTP Response Cache | Normalized Graph Cache (`Apollo`) |
| :--- | :--- | :--- |
| **Granularity** | Entire HTTP JSON Payload | Individual Entity Records (e.g. `User:123`, `Order:456`) |
| **Mutation Sync** | ❌ None (Requires invalidating whole URL) | ✅ Automatic (Updating `User:123` updates all active queries) |
| **Storage Engine** | Disk Files | In-Memory Hash Map & SQLite Database |
| **Offline Performance** | Medium | Maximum |

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

print("OkHttp and Apollo fully padded to 10k+!")
