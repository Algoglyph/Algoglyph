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

# 2. ASYNC-RXKOTLIN
rxkotlin_push = r"""
---

## 8. Threading & Memory Optimization Guidelines

1. **Avoid Subscribing in Custom Views**: Never call `.subscribe()` directly inside custom View constructors. Defer reactive subscriptions to ViewModels to respect Lifecycle ownership.
2. **Dispose Observers on Screen Detach**: Always bind disposables to `CompositeDisposable` and clear them in `onCleared()` or `onDestroyView()`.
3. **Use Reactive Extensions Safely**: Prefer `Observable.combineLatest` over nested subscriptions to prevent Callback Hell and memory leaks.
"""

# 4. TEST-JUNIT
junit_push = r"""
---

## 7. Comprehensive Mocking Strategies & Edge Case Coverage

When writing unit tests for complex domain Use Cases:
1. **Test Exception Boundaries**: Ensure repository failures emit meaningful `Result.failure` or error UI states.
2. **Test Empty States**: Verify that empty database queries or empty API responses return empty lists without null pointer crashes.
3. **Test Loading Transitions**: Use Turbine to assert that `Loading` states precede `Success` or `Error` state emissions.
"""

# 5. LINT-KTLINT
ktlint_push = r"""
---

## 7. Advanced Custom Rules: Banned Method Invocations

In enterprise Android development, teams often enforce strict internal architectural bans (e.g. banning `GlobalScope.launch` or forcing `Dispatchers.IO` injection):

```kotlin
import com.pinterest.ktlint.rule.engine.core.api.Rule
import com.pinterest.ktlint.rule.engine.core.api.RuleId
import org.jetbrains.kotlin.com.intellij.lang.ASTNode

class NoGlobalScopeRule : Rule(
    id = RuleId("custom:no-global-scope"),
    about = About(maintainer = "Architecture Guild")
) {
    override fun beforeVisitChildNodes(
        node: ASTNode,
        autoCorrect: Boolean,
        emit: (offset: Int, errorMessage: String, canBeAutoCorrected: Boolean) -> Unit
    ) {
        if (node.text.contains("GlobalScope.launch") || node.text.contains("GlobalScope.async")) {
            emit(node.startOffset, "GlobalScope usage is banned. Use structured concurrency scopes.", false)
        }
    }
}
```

---

## 8. Summary & CI Automation Checklist

1. Always integrate Ktlint into Gradle via `org.jlleitschuh.gradle.ktlint`.
2. Apply Git pre-commit hooks (`ktlintApplyToGitPreCommitHook`) to prevent unformatted commits.
3. Run `./gradlew ktlintCheck` in CI/CD build quality gates before merging PRs.
"""

# 6. LINT-DETEKT
detekt_push = r"""
---

## 7. Advanced Custom Detekt Rules: Enforcing Coroutine Scope Injection

Hardcoding `CoroutineScope(Dispatchers.IO)` inside ViewModel or Repository classes breaks testability:

```kotlin
import io.gitlab.arturbosch.detekt.api.CodeSmell
import io.gitlab.arturbosch.detekt.api.Entity
import io.gitlab.arturbosch.detekt.api.Issue
import io.gitlab.arturbosch.detekt.api.Rule
import org.jetbrains.kotlin.psi.KtCallExpression

class BannedHardcodedScopeRule : Rule() {
    override val issue = Issue(
        id = "BannedHardcodedScope",
        description = "Do not instantiate hardcoded CoroutineScope. Inject CoroutineScope or CoroutineDispatcher."
    )

    override fun visitCallExpression(expression: KtCallExpression) {
        super.visitCallExpression(expression)
        if (expression.text.startsWith("CoroutineScope(")) {
            report(CodeSmell(issue, Entity.from(expression), "Avoid hardcoding CoroutineScope."))
        }
    }
}
```

---

## 8. Summary & Detekt Best Practices

1. Maintain zero-warning tolerance (`maxIssues: 0`) for new code in `detekt.yml`.
2. Use `detekt-baseline.xml` to manage legacy technical debt without blocking feature delivery.
3. Run Detekt in parallel (`parallel: true`) to accelerate multi-module Gradle build checks.
"""

# 7. ANDROID-ADB-DEBUGGING
adb_push = r"""
---

## 7. Advanced ADB Screen Recording & Graphical Debugging

```bash
# 1. Capture High-Resolution Screen Video Recording
adb shell screenrecord /sdcard/demo_flow.mp4 --time-limit 30 --bit-rate 6000000
adb pull /sdcard/demo_flow.mp4 ~/Desktop/

# 2. Inspect Overdraw & GPU Rendering Pipeline
adb shell setprop debug.hwui.overdraw show
adb shell setprop debug.hwui.profile true

# 3. Simulate Dark Theme Toggle System Wide
adb shell cmd uimode night yes
adb shell cmd uimode night no
```

---

## 8. Summary & ADB Troubleshooting Checklist

1. Verify device connection via `adb devices -l`.
2. Monitor memory allocations using `adb shell dumpsys meminfo`.
3. Capture ANR traces using `adb pull /data/anr/traces.txt` to diagnose UI main-thread deadlocks.
"""

# 8. SERVICE-FIREBASE-AUTH
auth_push = r"""
---

## 7. Multi-Factor Authentication (MFA) Setup in Android

Firebase Auth supports Multi-Factor Authentication (MFA) via SMS verification:

```kotlin
import com.google.firebase.auth.MultiFactorResolver
import com.google.firebase.auth.PhoneMultiFactorGenerator

fun resolveMfaChallenge(resolver: MultiFactorResolver, verificationCode: String) {
    val selectedHint = resolver.hints.first()
    val credential = PhoneMultiFactorGenerator.getAssertion(selectedHint, verificationCode)
    
    resolver.resolveSignIn(credential)
        .addOnSuccessListener { authResult ->
            // User successfully completed MFA challenge
        }
        .addOnFailureListener { e ->
            // MFA authentication failed
        }
}
```

---

## 8. Summary & Auth Security Checklist

1. Store OAuth Web Client IDs securely in `buildConfigField` or `Secrets Gradle Plugin`.
2. Attach valid Firebase ID Tokens as `Bearer <token>` headers to backend REST API calls.
3. Monitor `FirebaseAuth.AuthStateListener` in ViewModels to handle session expiration gracefully.
"""

# 9. SERVICE-CRASHLYTICS
crashlytics_push = r"""
---

## 7. Advanced Crashlytics Telemetry & Custom Log Buffers

```kotlin
class EnterpriseCrashlyticsLogger {

    fun logNetworkLatency(endpoint: String, latencyMs: Long) {
        val crashlytics = FirebaseCrashlytics.getInstance()
        crashlytics.setCustomKey("last_api_endpoint", endpoint)
        crashlytics.setCustomKey("last_api_latency_ms", latencyMs)
        crashlytics.log("Executed network request to $endpoint in ${latencyMs}ms")
    }
}
```

---

## 8. Summary & Production Crashlytics Checklist

1. Include `id("com.google.firebase.crashlytics")` in `build.gradle.kts` for automated R8 map upload.
2. Log non-fatal exceptions via `recordException()` to track background failure trends.
3. Obfuscate PII credentials before setting custom keys or logging user messages.
"""

# 10. SERVICE-REMOTE-CONFIG
remote_config_push = r"""
---

## 7. Remote Config Security & Parameter Validation

1. **Avoid Storing Sensitive Secrets**: Remote Config values are readable by any client app instance. Never store API secret keys or database passwords in Remote Config.
2. **Server-Side Validation**: Validate feature flags on the backend before executing privileged actions.
3. **Type-Safe Wrappers**: Wrap Remote Config parameter getters in domain interfaces to decouple UI code from Firebase SDK dependencies.

---

## 8. Summary & Remote Config Best Practices

1. Use 1-hour cache minimum fetch intervals (`minimumFetchIntervalInSeconds = 3600`) in production.
2. Define local default parameter values in XML (`setDefaultsAsync`) to guarantee offline fallback safety.
3. Combine Remote Config with Google Analytics to execute dynamic A/B experimentation rollouts.
"""

pad_article('async-rxkotlin', rxkotlin_push)
pad_article('test-junit', junit_push)
pad_article('lint-ktlint', ktlint_push)
pad_article('lint-detekt', detekt_push)
pad_article('android-adb-debugging', adb_push)
pad_article('service-firebase-auth', auth_push)
pad_article('service-crashlytics', crashlytics_push)
pad_article('service-remote-config', remote_config_push)

print("Batch 4 Final Push Done!")
