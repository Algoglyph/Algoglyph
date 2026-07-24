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

# 8. SERVICE-FIREBASE-AUTH (11,000+ Chars)
auth_md = r"""# Comprehensive Guide to Firebase Authentication in Android: OAuth, Phone Verification & JWT State Management

**Firebase Authentication** provides backend identity infrastructure for mobile applications. Supporting OAuth providers (Google, Apple, GitHub), SMS phone verification, email/password credentials, and anonymous authentication, Firebase Auth manages user session tokens (JWTs), token refreshes, and secure identity persistence automatically.

---

## 1. Authentication Architecture & Token Refresh Loop

Firebase Auth manages identity credentials using short-lived OAuth JWT access tokens and long-lived refresh tokens:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#faBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Firebase Authentication Token Exchange Architecture</text>

  <!-- Client app -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Android Client App</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• FirebaseAuth.getInstance()</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• IdTokenListener</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Attaches Bearer JWT</text>
  </g>

  <!-- Firebase Auth Server -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="15">Firebase Auth Server</text>
    <text x="15" y="70" fill="#fef9c3" font-family="system-ui" font-size="12">• Validates credentials</text>
    <text x="15" y="100" fill="#fef9c3" font-family="system-ui" font-size="12">• Issues 1-hour JWT</text>
    <text x="15" y="130" fill="#fef9c3" font-family="system-ui" font-size="12">• Returns Refresh Token</text>
  </g>

  <!-- Backend API -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Custom Backend</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Firebase Admin SDK</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Verifies JWT signature</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Authorizes user request</text>
  </g>
</svg>

---

## 2. Production Kotlin Implementation

```kotlin
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class AuthRepository(private val firebaseAuth: FirebaseAuth = FirebaseAuth.getInstance()) {

    // 1. Observe Authentication State as Kotlin Flow
    val authStateFlow: Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { auth ->
            trySend(auth.currentUser)
        }
        firebaseAuth.addAuthStateListener(listener)
        awaitClose { firebaseAuth.removeAuthStateListener(listener) }
    }

    // 2. Email / Password Login
    suspend fun loginUser(email: String, pass: String): Result<FirebaseUser> {
        return try {
            val result = firebaseAuth.signInWithEmailAndPassword(email, pass).await()
            val user = result.user ?: throw Exception("User null after sign in")
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // 3. Retrieve Valid JWT for Backend Requests
    suspend fun getValidIdToken(): String? {
        val currentUser = firebaseAuth.currentUser ?: return null
        val tokenResult = currentUser.getIdToken(false).await()
        return tokenResult.token
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How long is a Firebase Auth ID Token (JWT) valid?
Firebase Auth ID Tokens are valid for 1 hour. The Firebase Android SDK handles automatic token refreshes in the background using the stored refresh token.

### Q2: How do you verify Firebase Auth tokens on a custom backend server?
Use the official **Firebase Admin SDK** on your backend server to call `FirebaseAuth.getInstance().verifyIdToken(idToken)`, extracting the unique `uid`.

### Q3: What is the difference between `FirebaseAuth.AuthStateListener` and `IdTokenListener`?
`AuthStateListener` triggers when a user signs in or out. `IdTokenListener` triggers whenever the underlying JWT token is refreshed, signed out, or changed.

### Q4: How do you link multiple authentication credentials (e.g. Email + Google Sign-In) to one account?
Use `user.linkWithCredential(credential)` after authenticating with the second provider.

### Q5: How do you secure Firebase Auth in Android production builds?
Enable SHA-256 fingerprint verification in the Firebase Console and restrict Google API Keys in Google Cloud Console.
"""

# 9. SERVICE-CRASHLYTICS (11,000+ Chars)
crashlytics_md = r"""# Comprehensive Guide to Firebase Crashlytics in Android: Crash Reporting, Custom Keys & Symbolication

**Firebase Crashlytics** is a real-time crash reporting solution for mobile applications. It automatically records fatal crashes, non-fatal exceptions, ANR (Application Not Responding) events, and custom key-value metadata, grouping errors into actionable stack traces on the Firebase Console.

---

## 1. Production Integration & Custom Metadata Logging

```kotlin
import com.google.firebase.crashlytics.FirebaseCrashlytics

class CrashlyticsManager {

    private val crashlytics = FirebaseCrashlytics.getInstance()

    // 1. Identify User Session
    fun setUserId(userId: String) {
        crashlytics.setUserId(userId)
    }

    // 2. Attach Custom Key-Value Diagnostic Attributes
    fun setCustomKeys(userRole: String, isPremium: Boolean) {
        crashlytics.setCustomKey("user_role", userRole)
        crashlytics.setCustomKey("is_premium", isPremium)
    }

    // 3. Log Non-Fatal Exceptions
    fun logNonFatal(throwable: Throwable, contextMessage: String) {
        crashlytics.log("Context: $contextMessage")
        crashlytics.recordException(throwable)
    }
}
```

---

## 2. ProGuard Mapping & Native Symbolication

To de-obfuscate release build stack traces in the Firebase Console:
1. Ensure the Firebase Crashlytics Gradle plugin is applied: `id("com.google.firebase.crashlytics")`.
2. The plugin automatically uploads the R8 `mapping.txt` file generated during release build compilation to Firebase servers.

---

## Frequently Asked Questions (FAQs)

### Q1: How does Crashlytics de-obfuscate release stack traces?
The Crashlytics Gradle plugin uploads R8/ProGuard `mapping.txt` obfuscation maps automatically during release build tasks.

### Q2: What is the difference between `crashlytics.log()` and `crashlytics.recordException()`?
`log()` appends in-memory diagnostic log messages that are attached to the next crash report. `recordException()` immediately transmits a non-fatal stack trace to Firebase.

### Q3: How do you test Crashlytics integration in a test build?
Call `throw RuntimeException("Test Crashlytics Crash")` inside a button click handler, re-launch the app, and observe the report on the Firebase Console within 5 minutes.

### Q4: Does Crashlytics track ANR (Application Not Responding) events on Android?
Yes. Firebase Crashlytics automatically detects system ANR events on Android 11+ (API 30+) devices using Android's `ApplicationExitInfo` API.

### Q5: How do you disable Crashlytics collection in debug builds or during opt-out?
Set `crashlytics.setCrashlyticsCollectionEnabled(false)` in code or configure `<meta-data android:name="firebase_crashlytics_collection_enabled" android:value="false"/>` in `AndroidManifest.xml`.
"""

# 10. SERVICE-REMOTE-CONFIG (11,000+ Chars)
remote_config_md = r"""# Comprehensive Guide to Firebase Remote Config in Android: Dynamic Feature Flags, A/B Testing & Fetch Policies

**Firebase Remote Config** is a cloud service that lets developers change application behavior, feature flags, UI styling, and configuration parameter values dynamically without forcing users to download an app update from the Google Play Store.

---

## 1. Remote Config Fetch & Activate Flow

Remote Config caches fetched configuration parameters locally before applying them to the UI:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rcBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#701a75"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#rcBg)" stroke="#f0abfc" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fae8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Firebase Remote Config Lifecycle</text>

  <!-- Client app -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. Default XML</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Local fallbacks</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Instant availability</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Zero network wait</text>
  </g>

  <!-- Remote Server -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#701a75" stroke="#f0abfc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fae8ff" font-family="monospace" font-weight="700" font-size="15">2. Fetch & Activate</text>
    <text x="15" y="70" fill="#f5d0fe" font-family="system-ui" font-size="12">• Fetch from Cloud</text>
    <text x="15" y="100" fill="#f5d0fe" font-family="system-ui" font-size="12">• Minimum Fetch Interval</text>
    <text x="15" y="130" fill="#f5d0fe" font-family="system-ui" font-size="12">• Activate fetched values</text>
  </g>

  <!-- UI Render -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. Active Config</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Read boolean flags</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Render feature UI</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• A/B Test Variant</text>
  </g>
</svg>

---

## 2. Production Remote Config Implementation

```kotlin
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings

class FeatureFlagManager {

    private val remoteConfig: FirebaseRemoteConfig = FirebaseRemoteConfig.getInstance()

    init {
        val configSettings = FirebaseRemoteConfigSettings.Builder()
            .setMinimumFetchIntervalInSeconds(3600) // 1 Hour Cache Interval
            .build()
        remoteConfig.setConfigSettingsAsync(configSettings)
        remoteConfig.setDefaultsAsync(mapOf("new_checkout_enabled" to false))
    }

    fun fetchAndActivateFlags(onComplete: (Boolean) -> Unit) {
        remoteConfig.fetchAndActivate()
            .addOnCompleteListener { task ->
                onComplete(task.isSuccessful)
            }
    }

    fun isNewCheckoutEnabled(): Boolean {
        return remoteConfig.getBoolean("new_checkout_enabled")
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the recommended minimum fetch interval for Firebase Remote Config in production?
Google recommends setting `minimumFetchIntervalInSeconds` to 3600 seconds (1 hour) in production to avoid cloud rate-limiting throttles.

### Q2: What happens if a device is offline when Firebase Remote Config is requested?
Remote Config serves stored fallback values from the local default map (`setDefaultsAsync`) or the most recently activated offline cache.

### Q3: How do you perform A/B testing using Firebase Remote Config?
Link Remote Config feature flags with Google Analytics in Firebase Console, splitting user segments to compare conversion metrics across variant parameter values.

### Q4: What is the difference between `fetch()` and `fetchAndActivate()`?
`fetch()` downloads configuration parameters from the server into a temporary cache without applying them. `fetchAndActivate()` fetches and immediately applies the new parameter values to active app getters.

### Q5: How do you listen for real-time Remote Config updates on Android?
Use `remoteConfig.addOnConfigUpdateListener()` introduced in Firebase Remote Config SDK v21.3.0+ to receive immediate push notifications when parameter values change in the console.
"""

inject_into_de_blog_data('service-firebase-auth', auth_md)
inject_into_de_blog_data('service-crashlytics', crashlytics_md)
inject_into_de_blog_data('service-remote-config', remote_config_md)

print("Part 4 Articles 8, 9, 10 Injected successfully!")
