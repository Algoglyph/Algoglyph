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

# 1. ASYNC-RXJAVA
rxjava_extra = r"""
---

## 5. Advanced RxJava Operators & Error Recovery Strategies

RxJava provides specialized operators for error recovery and stream transformation:
1. **`retryWhen`**: Retries upstream emissions based on custom logic (e.g. exponential backoff on HTTP 503 errors).
2. **`onErrorReturn`**: Intercepts errors and returns a default value, keeping downstream subscribers active.
3. **`zip`**: Combines the emissions of multiple observables concurrently, emitting a single combined tuple.

```kotlin
// Exponential Backoff Retry Strategy in RxJava
fun <T : Any> io.reactivex.rxjava3.core.Single<T>.retryWithBackoff(
    maxRetries: Int = 3,
    initialDelayMs: Long = 1000
): io.reactivex.rxjava3.core.Single<T> {
    return this.retryWhen { errors ->
        errors.zipWith(io.reactivex.rxjava3.core.Flowable.range(1, maxRetries)) { error, attempt ->
            if (attempt >= maxRetries) throw error
            Math.pow(2.0, attempt.toDouble()).toLong() * initialDelayMs
        }.flatMap { delay ->
            io.reactivex.rxjava3.core.Flowable.timer(delay, java.util.concurrent.TimeUnit.MILLISECONDS)
        }
    }
}
```
"""

# 2. ASYNC-RXKOTLIN
rxkotlin_extra = r"""
---

## 4. Advanced RxKotlin SAM Adapters & Operator Extensions

RxKotlin introduces intuitive collection conversion extensions and type-safe operator overloads:

```kotlin
import io.reactivex.rxjava3.kotlin.toFlowable
import io.reactivex.rxjava3.kotlin.toObservable

fun processSensors(sensorStream: List<Float>) {
    sensorStream.toFlowable() // Direct list to Flowable converter
        .filter { it > 10.0f }
        .buffer(5) // Buffer into groups of 5
        .subscribeBy(
            onNext = { batch -> println("Batch: $batch") },
            onError = { e -> e.printStackTrace() }
        )
}
```

---

## 5. Migration Strategy: RxKotlin to Kotlin Coroutines Flow

For enterprise teams migrating from RxJava/RxKotlin to Kotlin Coroutines and Flow:
1. Replace `Observable<T>` with `Flow<T>`.
2. Replace `Single<T>` with `suspend fun () -> T`.
3. Replace `Completable` with `suspend fun () -> Unit`.
4. Replace `Schedulers.io()` with `Dispatchers.IO`.
5. Replace `CompositeDisposable` with `viewModelScope` structured concurrency cancellation.
"""

# 3. TEST-ESPRESSO
espresso_extra = r"""
---

## 4. Custom ViewMatchers & Complex Assertion Engineering

Standard Espresso matchers (`withId`, `withText`) cover basic UI elements. For complex custom Views (like custom progress bars or custom canvas views), developers create custom Hamcrest matchers:

```kotlin
import android.view.View
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher

fun withCustomDrawable(expectedResourceId: Int): Matcher<View> {
    return object : TypeSafeMatcher<View>(View::class.java) {
        override fun matchesSafely(target: View): Boolean {
            // Match custom drawable background resource ID
            return target.tag == expectedResourceId
        }

        override fun describeTo(description: Description) {
            description.appendText("with custom drawable resource ID: $expectedResourceId")
        }
    }
}
```

---

## 5. Page Object Pattern in Espresso Instrumented Testing

To keep UI test suites readable and maintainable, implement the **Page Object Pattern**:

```kotlin
class LoginPageRobot {
    fun enterEmail(email: String) = apply {
        onView(withId(R.id.emailInput)).perform(typeText(email), closeSoftKeyboard())
    }

    fun enterPassword(pass: String) = apply {
        onView(withId(R.id.passwordInput)).perform(typeText(pass), closeSoftKeyboard())
    }

    fun clickLogin() = apply {
        onView(withId(R.id.loginButton)).perform(click())
    }

    fun verifyErrorDisplayed(errorMsg: String) = apply {
        onView(withId(R.id.errorMessage)).check(matches(withText(errorMsg)))
    }
}

// Clean readable test
@Test
fun testInvalidPassword_showsError() {
    LoginPageRobot()
        .enterEmail("user@example.com")
        .enterPassword("short")
        .clickLogin()
        .verifyErrorDisplayed("Password too short")
}
```
"""

# 4. TEST-JUNIT
junit_extra = r"""
---

## 3. Mocking Static Calls & Intercepting Exception Scenarios with MockK

MockK excels at handling complex Kotlin paradigms, such as object singletons, extension functions, and top-level package functions:

```kotlin
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.junit.Test

class SystemTimeTest {

    @Test
    fun testTimeDependentLogic() {
        // Mock top-level Kotlin extension function or System call
        mockkStatic(System::class)
        every { System.currentTimeMillis() } returns 1600000000000L

        // Code execution relying on System.currentTimeMillis()
        val formatted = formatTimestamp()
        org.junit.Assert.assertEquals("2020-09-13", formatted)

        unmockkStatic(System::class)
    }

    private fun formatTimestamp(): String {
        return "2020-09-13" // Demo formatted string
    }
}
```

---

## 4. Test Pyramid & CI Execution Strategy

A healthy Android testing architecture adheres to the **Test Pyramid**:
- **70% Unit Tests** (JUnit 5 + MockK running on local JVM in milliseconds).
- **20% Integration / Component Tests** (FragmentScenario + Hilt test bindings).
- **10% E2E UI Tests** (Espresso / Compose Test Rule running on physical devices).
"""

# 5. LINT-KTLINT
ktlint_extra = r"""
---

## 3. Custom Ktlint Rule Creation

Enterprise teams can write custom Ktlint rules to enforce company-specific coding standards (e.g. banning `android.util.Log` in favor of `Timber`):

```kotlin
import com.pinterest.ktlint.rule.engine.core.api.Rule
import com.pinterest.ktlint.rule.engine.core.api.RuleId
import org.jetbrains.kotlin.com.intellij.lang.ASTNode

class NoNativeAndroidLogRule : Rule(
    id = RuleId("custom:no-native-log"),
    about = About(maintainer = "Mobile Team")
) {
    override fun beforeVisitChildNodes(
        node: ASTNode,
        autoCorrect: Boolean,
        emit: (offset: Int, errorMessage: String, canBeAutoCorrected: Boolean) -> Unit
    ) {
        if (node.text.contains("Log.d(") || node.text.contains("Log.e(")) {
            emit(node.startOffset, "Use Timber instead of native android.util.Log", false)
        }
    }
}
```

---

## 4. CI/CD Integration & GitHub Actions Workflow

Add Ktlint verification to your `.github/workflows/android_ci.yml` pipeline:

```yaml
name: Android CI Quality Gate

on: [push, pull_request]

jobs:
  ktlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Run Ktlint Check
        run: ./gradlew ktlintCheck
```
"""

# 6. LINT-DETEKT
detekt_extra = r"""
---

## 3. Writing Custom Detekt Rules for Code Quality Enforcement

Developers can author custom Detekt rules to catch enterprise-specific code smells during compilation:

```kotlin
import io.gitlab.arturbosch.detekt.api.CodeSmell
import io.gitlab.arturbosch.detekt.api.Entity
import io.gitlab.arturbosch.detekt.api.Issue
import io.gitlab.arturbosch.detekt.api.Rule
import org.jetbrains.kotlin.psi.KtNamedFunction

class DirectDispatchersMainRule : Rule() {
    override val issue = Issue(
        id = "DirectDispatchersMain",
        description = "Do not hardcode Dispatchers.Main inside ViewModels. Inject CoroutineDispatchers instead."
    )

    override fun visitNamedFunction(function: KtNamedFunction) {
        super.visitNamedFunction(function)
        if (function.text.contains("Dispatchers.Main")) {
            report(CodeSmell(issue, Entity.from(function), "Inject CoroutineDispatchers for testability."))
        }
    }
}
```

---

## 4. Baseline Generation & Suppressing Architectural Smells

To handle legacy codebases with hundreds of existing code smells:
1. Run `./gradlew detektBaseline` to record current issues into `detekt-baseline.xml`.
2. New pull requests will only fail if new code smells are introduced.
"""

# 7. ANDROID-ADB-DEBUGGING
adb_extra = r"""
---

## 3. Advanced Memory Profiling & Leaked Hprof Parsing

When investigating out-of-memory (OOM) crashes on test devices:
1. Execute `adb shell dumpsys meminfo <package_name>` to view Native vs Java Heap allocation breakdowns.
2. If `Java Heap` continues growing after triggering back navigation, trigger a heap dump:
```bash
adb shell am dumpheap com.example.myapp /data/local/tmp/heap.hprof
adb pull /data/local/tmp/heap.hprof
hprof-conv heap.hprof converted_heap.hprof
```
3. Open `converted_heap.hprof` inside Android Studio or Eclipse MAT to inspect retained instance reference trees.

---

## 4. CPU Performance Profiling & Perfetto System Tracing

For in-depth frame jank analysis, run **Perfetto** system traces using ADB:

```bash
# Capture a 10-second Perfetto system trace
adb shell perfetto -o /data/misc/perfetto-traces/trace.perfetto-trace -t 10s sched freq idle am wm gfx view binder_driver
adb pull /data/misc/perfetto-traces/trace.perfetto-trace
```
Open `trace.perfetto-trace` in `ui.perfetto.dev` to inspect CPU core scheduling, main thread UI render locks, and surface flinger queue latency.
"""

# 8. SERVICE-FIREBASE-AUTH
auth_extra = r"""
---

## 3. Phone Number Authentication Pipeline in Kotlin

Firebase Auth provides automated SMS verification code handling for mobile phone authentication:

```kotlin
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import java.util.concurrent.TimeUnit

fun startPhoneAuth(phoneNumber: String, activity: Activity) {
    val options = PhoneAuthOptions.newBuilder(FirebaseAuth.getInstance())
        .setPhoneNumber(phoneNumber)
        .setTimeout(60L, TimeUnit.SECONDS)
        .setActivity(activity)
        .setCallbacks(object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                // Instant SMS auto-retrieval verification
            }

            override fun onVerificationFailed(e: FirebaseException) {
                // Handle invalid phone number or quota error
            }

            override fun onCodeSent(verificationId: String, token: PhoneAuthProvider.ForceResendingToken) {
                // Code sent to SMS, prompt user for OTP entry
            }
        })
        .build()

    PhoneAuthProvider.verifyPhoneNumber(options)
}
```

---

## 4. Security Hardening & Session Revocation

To secure Firebase Auth in enterprise Android apps:
1. Force SHA-256 certificate pin bindings in Firebase Console.
2. Enable Multi-Factor Authentication (MFA) for administrative accounts.
3. Validate user email verification status (`user.isEmailVerified`) before granting access to sensitive application features.
"""

# 9. SERVICE-CRASHLYTICS
crashlytics_extra = r"""
---

## 3. Custom Anomaly Tracking & Non-Fatal Error Categorization

Firebase Crashlytics allows developers to categorize non-fatal network failures and API errors cleanly:

```kotlin
class RepositoryErrorHandler {

    fun handleApiError(statusCode: Int, errorBody: String, throwable: Throwable) {
        val crashlytics = FirebaseCrashlytics.getInstance()
        crashlytics.setCustomKey("http_status_code", statusCode)
        crashlytics.setCustomKey("error_body", errorBody.take(500)) // Truncate payload
        crashlytics.recordException(throwable)
    }
}
```

---

## 4. NDK / C++ Native Crash Symbolication

For games or graphics apps using C/C++ native libraries (`.so` files), apply the `firebaseCrashlytics { nativeSymbolUploadEnabled = true }` Gradle DSL configuration to upload unstripped C++ symbols for native crash resolution.
"""

# 10. SERVICE-REMOTE-CONFIG
remote_config_extra = r"""
---

## 3. Real-Time Remote Config Listener Implementation

With Remote Config SDK v21.3.0+, applications can observe live configuration changes pushed directly from the Firebase Console:

```kotlin
import com.google.firebase.remoteconfig.ConfigUpdate
import com.google.firebase.remoteconfig.ConfigUpdateListener
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigException

fun registerLiveConfigUpdates(remoteConfig: FirebaseRemoteConfig) {
    remoteConfig.addOnConfigUpdateListener(object : ConfigUpdateListener {
        override fun onUpdate(configUpdate: ConfigUpdate) {
            if (configUpdate.updatedKeys.contains("new_checkout_enabled")) {
                remoteConfig.activate().addOnCompleteListener {
                    val isEnabled = remoteConfig.getBoolean("new_checkout_enabled")
                    // Dynamically update UI feature toggle
                }
            }
        }

        override fun onError(error: FirebaseRemoteConfigException) {
            // Suppress connection error
        }
    })
}
```

---

## 4. Enterprise Rollout Strategies & Personalization

1. **Percentage Rollout**: Dynamically enable a new feature flag for 10% of user bases, monitoring Crashlytics metrics before expanding to 100%.
2. **User Target Conditions**: Configure Remote Config parameter overrides targeting specific app version strings, user languages, or geographic regions.
"""

pad_article('async-rxjava', rxjava_extra)
pad_article('async-rxkotlin', rxkotlin_extra)
pad_article('test-espresso', espresso_extra)
pad_article('test-junit', junit_extra)
pad_article('lint-ktlint', ktlint_extra)
pad_article('lint-detekt', detekt_extra)
pad_article('android-adb-debugging', adb_extra)
pad_article('service-firebase-auth', auth_extra)
pad_article('service-crashlytics', crashlytics_extra)
pad_article('service-remote-config', remote_config_extra)

print("Mega Expand Batch 4 Completed!")
