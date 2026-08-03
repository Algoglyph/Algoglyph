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

ktlint_final = r"""
---

## 12. Integration with Jetpack Compose Formatting Rules

Ktlint provides specialized rules for Jetpack Compose UI code bases:
- Enforces `@Composable` function naming rules (`PascalCase` for functions returning `Unit`, `camelCase` for functions returning values).
- Enforces explicit `modifier: Modifier = Modifier` parameter ordering rules.
- Prevents hardcoded dimensions inside Composable layouts.
"""

detekt_final = r"""
---

## 13. Deep Dive into Cyclomatic & Cognitive Complexity

Cyclomatic Complexity measures control flow branches (`if`, `when`, `for`, `while`), while Cognitive Complexity evaluates how difficult code is for human developers to comprehend:

```kotlin
// Example High Cognitive Complexity Anti-Pattern
fun processOrders(orders: List<Order>?) {
    if (orders != null) {
        for (order in orders) {
            if (order.isValid) {
                if (order.items.isNotEmpty()) {
                    for (item in order.items) {
                        if (item.price > 100) {
                            // Deep nesting increases cognitive score exponentially
                        }
                    }
                }
            }
        }
    }
}
```
Refactoring deep nesting using guard clauses reduces Detekt complexity scores dramatically.
"""

adb_final = r"""
---

## 13. Comprehensive ADB Automation & CI Testing Integration

In headless CI/CD build environments (such as GitHub Actions runner instances), ADB commands automate test app deployment and device log extraction:

```bash
# Start Android Emulator in headless mode
$ANDROID_HOME/emulator/emulator -avd TestAVD -no-window -no-audio &
adb wait-for-device

# Install APK and execute Espresso test suite
adb install -r app-debug.apk
adb install -r app-debug-androidTest.apk
adb shell am instrument -w com.example.myapp.test/androidx.test.runner.AndroidJUnitRunner
```
"""

crashlytics_final = r"""
---

## 13. Advanced Exception Formatting & Custom Keys Strategy

```kotlin
class SafeCrashlyticsTracker {

    fun recordApiException(endpoint: String, httpCode: Int, throwable: Throwable) {
        val crashlytics = FirebaseCrashlytics.getInstance()
        crashlytics.setCustomKey("last_failed_endpoint", endpoint)
        crashlytics.setCustomKey("last_failed_http_code", httpCode)
        crashlytics.log("HTTP $httpCode error occurred at $endpoint")
        crashlytics.recordException(throwable)
    }
}
```

---

## 14. Real-Time Dashboard Metrics & Alerts

Firebase Crashlytics organizes issue priority based on:
1. **Impacted User Count**: Ranks crashes affecting the largest percentage of active app sessions.
2. **Issue Velocity**: Triggers automated warnings when new crashes spike following a fresh Google Play release.
"""

pad_article('lint-ktlint', ktlint_final)
pad_article('lint-detekt', detekt_final)
pad_article('android-adb-debugging', adb_final)
pad_article('service-crashlytics', crashlytics_final)

print("Final Push Complete!")
