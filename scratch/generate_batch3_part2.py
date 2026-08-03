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

# 3. ANDROID-SECURITY-KEYSTORE
keystore_md = r"""# Comprehensive Guide to Android Keystore & Cryptography: AES-GCM, Biometrics & Hardware Security

The **Android Keystore System** provides containerized cryptographic security for mobile applications. By storing cryptographic keys in hardware-backed isolated execution environments (such as a **Trusted Execution Environment (TEE)** or **StrongBox Hardware Security Module (HSM)**), Android ensures that private cryptographic keys cannot be extracted or dumped from device memory, even if the application process or operating system kernel is compromised by root access.

---

## 1. Hardware Isolation Model: TEE & StrongBox Key Guard

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ksBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#831843"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#ksBg)" stroke="#f43f5e" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ffe4e6" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android Keystore Hardware Boundary Architecture</text>

  <!-- App Process Sandbox -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Application Sandbox</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Plaintext Payload</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Key Alias Request</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Cannot See Raw Bytes</text>
  </g>

  <!-- Android OS Framework -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#831843" stroke="#fda4af" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#ffe4e6" font-family="monospace" font-weight="700" font-size="15">Keystore Service</text>
    <text x="15" y="70" fill="#fecdd3" font-family="system-ui" font-size="12">• Binds Cipher Instance</text>
    <text x="15" y="100" fill="#fecdd3" font-family="system-ui" font-size="12">• Checks Auth Policy</text>
    <text x="15" y="130" fill="#fecdd3" font-family="system-ui" font-size="12">• Biometric Prompt</text>
  </g>

  <!-- TEE / StrongBox Hardware -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Secure Hardware (TEE)</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Generates Master Keys</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Executes Encryption</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Key Never Exits Chip</text>
  </g>
</svg>

---

## 2. Production Implementation: Hardware-Backed AES-256 GCM Encryption Manager

Below is a complete, production-grade cryptography manager using Android Keystore with AES/GCM/NoPadding:

```kotlin
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class CryptoManager {

    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    private val encryptCipher: Cipher
        get() = Cipher.getInstance(TRANSFORMATION)

    private fun getSecretKey(): SecretKey {
        val existingKey = keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        return existingKey ?: createSecretKey()
    }

    private fun createSecretKey(): SecretKey {
        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )
        val keySpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setUserAuthenticationRequired(false) // Set to true to require Biometrics
        .build()

        keyGenerator.init(keySpec)
        return keyGenerator.generateKey()
    }

    fun encrypt(bytes: ByteArray): Pair<ByteArray, ByteArray> {
        val cipher = encryptCipher
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())
        val encryptedBytes = cipher.doFinal(bytes)
        val iv = cipher.iv // Initialization Vector mandatory for AES-GCM
        return Pair(encryptedBytes, iv)
    }

    fun decrypt(encryptedBytes: ByteArray, iv: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), spec)
        return cipher.doFinal(encryptedBytes)
    }

    companion object {
        private const val KEY_ALIAS = "secure_app_master_key"
        private const val TRANSFORMATION = "AES/GCM/NoPadding"
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why can cryptographic keys stored in Android Keystore never be extracted?
Android Keystore keys are generated and stored directly inside the hardware TEE (Trusted Execution Environment) or StrongBox HSM chip. Operations occur inside the chip, returning only encrypted results.

### Q2: What is the purpose of the Initialization Vector (IV) in AES-GCM?
AES-GCM requires a unique, non-repeating Initialization Vector for every encryption operation. Reusing an IV with the same key breaks GCM security and compromises secrecy.

### Q3: How do you require user Biometric Authentication to unlock a Keystore key?
Set `.setUserAuthenticationRequired(true)` on `KeyGenParameterSpec.Builder`. The key will only decrypt payload bytes when unlocked by a valid `BiometricPrompt` authentication result within a specified timeout.

### Q4: What is StrongBox Keymaster in Android?
StrongBox is a dedicated Hardware Security Module (HSM) with independent CPU, RAM, and flash storage, offering higher physical tamper resistance than standard CPU TEEs.

### Q5: What is the difference between AES-CBC and AES-GCM?
AES-CBC provides encryption only (confidentiality). AES-GCM provides Galois/Counter Mode, which combines encryption with an authentication tag (Authenticated Encryption), guaranteeing both confidentiality and tamper protection.
"""

# 4. NETWORK-RETROFIT
retrofit_md = r"""# Comprehensive Guide to Retrofit in Android: Type-Safe REST APIs, Interceptors & Coroutines

**Retrofit** is Square's type-safe HTTP client library for Android and Kotlin. Retrofit abstracts low-level socket connections, request encoding, and response decoding into concise Kotlin interface declarations, utilizing converters (Moshi, Gson) and OkHttp interceptor pipelines for enterprise network architectures.

---

## 1. Architectural Pipeline & Interceptor Chain

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="retBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#retBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Retrofit Type-Safe Network Architecture</text>

  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Kotlin Interface</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• @GET / @POST Annotations</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Suspend Functions</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Data Transfer Objects</text>
  </g>

  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">OkHttp Client</text>
    <text x="15" y="70" fill="#bae6fd" font-family="system-ui" font-size="12">• Auth Bearer Interceptor</text>
    <text x="15" y="100" fill="#bae6fd" font-family="system-ui" font-size="12">• HttpLoggingInterceptor</text>
    <text x="15" y="130" fill="#bae6fd" font-family="system-ui" font-size="12">• Connection Pool</text>
  </g>

  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Converter (Moshi)</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• JSON Stream Parsing</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Kotlin Nullability</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Safe Type Mapping</text>
  </g>
</svg>

---

## 2. Production Retrofit Architecture Setup

```kotlin
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

// 1. Data Model DTO
data class UserProfileDto(
    val id: String,
    val username: String,
    val email: String
)

// 2. Api Service Interface
interface UserApiService {
    @GET("users/{id}")
    suspend fun getUserProfile(
        @Path("id") userId: String
    ): Response<UserProfileDto>

    @POST("users/update")
    suspend fun updateUserProfile(
        @Body profile: UserProfileDto
    ): Response<Unit>
}

// 3. Auth Header Interceptor
class AuthInterceptor(private val tokenProvider: () -> String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val originalRequest = chain.request()
        val requestWithAuth = originalRequest.newBuilder()
            .header("Authorization", "Bearer ${tokenProvider()}")
            .header("Accept", "application/json")
            .build()
        return chain.proceed(requestWithAuth)
    }
}

// 4. Retrofit Client Builder
object NetworkClient {
    private const val BASE_URL = "https://api.example.com/v1/"

    fun createApiService(tokenProvider: () -> String): UserApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenProvider))
            .addInterceptor(loggingInterceptor)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
            .create(UserApiService::class.java)
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Retrofit process suspend functions without blocking threads?
Retrofit integrates natively with Kotlin Coroutines. Under the hood, it converts calls into OkHttp asynchronous callbacks (`enqueue`) and resumes continuation instances without thread blocking.

### Q2: What is the difference between `addInterceptor` and `addNetworkInterceptor` in OkHttp?
`addInterceptor` (Application Interceptor) executes once per request regardless of redirects or retries. `addNetworkInterceptor` executes on actual socket transmissions, inspecting wire-level headers and redirects.

### Q3: Why is Moshi preferred over Gson in modern Kotlin apps?
Moshi understands Kotlin nullability rules and default parameter values natively, whereas Gson uses unsafe Java reflection (`Unsafe.allocateInstance()`), which can bypass null-safety.

### Q4: How do you handle HTTP 401 Unauthorized token refresh automatically in Retrofit?
Implement OkHttp's `Authenticator` interface. When an HTTP 401 response occurs, `Authenticator.authenticate()` executes on a background thread to fetch a new OAuth token and re-emit the failed request transparently.

### Q5: How do you mock Retrofit endpoints for unit testing?
Use `MockWebServer` from Square. It allows developers to enqueue raw JSON response strings and verify HTTP request headers locally without internet connectivity.
"""

inject_into_de_blog_data('android-security-keystore', keystore_md)
inject_into_de_blog_data('network-retrofit', retrofit_md)

print("Part 2 Articles 3 and 4 Injected!")
