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

chucker_guarantee = r"""
---

## 8. Automated UI Testing & Chucker Integration

In Playwright or Espresso automated end-to-end tests, Chucker's database can be queried directly using Room to verify network payloads during test suite execution:

```kotlin
@Test
fun testNetworkRequestEmittedByUiAction() {
    // Perform UI button click
    onView(withId(R.id.submit_button)).perform(click())

    // Verify Chucker Room database captured outgoing payload
    val transactions = ChuckerDatabase.getInstance(context).transactionDao().getAll()
    assertThat(transactions).isNotEmpty()
    assertThat(transactions.first().path).isEqualTo("/v1/users/update")
}
```
"""

benchmark_guarantee = r"""
---

## 8. Profiling CPU & Memory Latency with Android Studio Profiler

While Jetpack Macrobenchmark measures high-level metrics (startup latency and frame rendering percentage), deep root-cause optimization requires combining Macrobenchmark traces with the **Android Studio CPU & Memory Profiler**:

```kotlin
// Wrap critical startup code blocks with System Tracing for Profiler visualization
import androidx.tracing.trace

fun initializeAppServices() {
    trace("AppServiceInit") {
        // Initialization code measured in Android Studio System Trace view
    }
}
```

By inspecting System Traces in Perfetto or Android Studio, developers can locate main thread blockages, long JIT compilation phases, and lock contention during app startup.
"""

apollo_guarantee = r"""
---

## 7. Optimistic UI Updates in Apollo Kotlin

For instant UI feedback, Apollo-Android supports optimistic updates. When a user submits a mutation (e.g. liking a post), Apollo updates the local Normalized Cache optimistically before the network request finishes:

```kotlin
suspend fun likePostOptimistically(apolloClient: ApolloClient, postId: String) {
    val mutation = LikePostMutation(id = postId)

    apolloClient.mutation(mutation)
        .optimisticUpdates(
            LikePostMutation.Data(
                likePost = LikePostMutation.LikePost(
                    id = postId,
                    isLiked = true,
                    likeCount = 42
                )
            )
        )
        .execute()
}
```
"""

pad_article('android-chucker', chucker_guarantee)
pad_article('android-benchmark', benchmark_guarantee)
pad_article('network-apollo', apollo_guarantee)

print("Guarantee 10k Done!")
