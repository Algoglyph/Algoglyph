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

# 4. PATTERN-ANDROID-RXKOTLIN (Fully Expanded)
rxkotlin_md = r"""# Comprehensive Guide to RxKotlin in Android: Idiomatic Reactive Extensions & Operators

**RxKotlin** is a lightweight Kotlin wrapper library built around RxJava that provides expressive extension functions, SAM (Single Abstract Method) adapters, and convenience extension properties. It enables Android developers to write clean, functional, reactive streams without Java's verbose boilerplate code.

---

## 1. Architectural Overview & RxKotlin Convenience Extensions

RxKotlin enhances standard RxJava by adding extension functions directly to native Kotlin collections, types, and reactive subjects.

```kotlin
import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.kotlin.subscribeBy
import io.reactivex.rxjava3.kotlin.toObservable

fun main() {
    val searchQueries = listOf("Android", "Kotlin", "Coroutines", "RxJava")

    // RxKotlin extension function: .toObservable()
    searchQueries.toObservable()
        .filter { it.length > 5 }
        .map { "Search Query: $it" }
        .subscribeBy(
            onNext = { println(it) },
            onError = { println("Error: ${it.localizedMessage}") },
            onComplete = { println("Search Stream Complete!") }
        )
}
```

---

## 2. Production Android Disposable Management

```kotlin
import androidx.lifecycle.ViewModel
import io.reactivex.rxjava3.disposables.CompositeDisposable
import io.reactivex.rxjava3.kotlin.addTo
import io.reactivex.rxjava3.kotlin.subscribeBy
import io.reactivex.rxjava3.schedulers.Schedulers
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers

class RxSearchViewModel(
    private val searchService: SearchApiService
) : ViewModel() {

    private val disposables = CompositeDisposable()

    fun performSearch(query: String) {
        searchService.search(query)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribeBy(
                onSuccess = { results -> /* Handle UI Update */ },
                onError = { error -> /* Handle Error State */ }
            )
            .addTo(disposables) // RxKotlin convenience extension
    }

    override fun onCleared() {
        super.onCleared()
        disposables.clear() // Prevent memory leaks on ViewModel destruction
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Is RxKotlin a standalone library or an extension of RxJava?
RxKotlin is a lightweight extension library built on top of RxJava. It requires RxJava as a core dependency and simply provides idiomatic Kotlin extensions.

### Q2: How does `subscribeBy` improve upon standard RxJava `.subscribe()`?
Standard `.subscribe()` requires positional consumer arguments. `subscribeBy` uses named parameters (`onNext`, `onError`, `onComplete`), improving code readability and safety.

### Q3: What is the purpose of `.addTo(compositeDisposable)`?
`.addTo(compositeDisposable)` is an extension function that cleanly appends a `Disposable` instance to a `CompositeDisposable` for bulk cancellation in `onCleared()`.

### Q4: Should new Android projects choose RxKotlin or Kotlin Coroutines & Flow?
Google recommends Kotlin Coroutines and Flow for new Android projects because they are natively built into the Kotlin language and integrate seamlessly with Jetpack Compose.

### Q5: How do you convert an RxKotlin Observable to a Kotlin Flow?
Use the `asFlow()` extension function provided by the `kotlinx-coroutines-rx3` integration library.
"""

# 5. PATTERN-ANDROID-RXJAVA (Fully Expanded)
rxjava_md = r"""# Comprehensive Guide to RxJava 3 in Android: Observables, Flowables & Backpressure Management

**RxJava 3** is a rich implementation of Reactive Extensions for the JVM that enables developers to compose asynchronous, event-based programs using observable sequences. It introduces specialized stream types (`Observable`, `Flowable`, `Single`, `Maybe`, `Completable`) and powerful thread schedulers (`Schedulers.io()`, `AndroidSchedulers.mainThread()`).

---

## 1. RxJava 3 Reactive Stream Contract Types

| Stream Type | Emissions | Backpressure Support | Common Use Case |
| :--- | :--- | :--- | :--- |
| **Observable** | 0 to Infinity | ❌ No | Button clicks, UI events, fast small streams |
| **Flowable** | 0 to Infinity | ✅ Yes (Backpressure strategy) | High-volume data streams (DB, Sensors, Sockets) |
| **Single** | Exactly 1 or Error | N/A | REST API Network Requests |
| **Maybe** | 0 or 1 item or Error | N/A | Database Query returning optional result |
| **Completable** | 0 items (Success or Error) | N/A | Write/Delete DB operations |

---

## 2. Production RxJava 3 Android Pipeline

```kotlin
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.core.Flowable
import io.reactivex.rxjava3.disposables.CompositeDisposable
import io.reactivex.rxjava3.schedulers.Schedulers
import java.util.concurrent.TimeUnit

class RxSensorManager {

    private val disposables = CompositeDisposable()

    fun observeSensorStream(sensorFlowable: Flowable<Float>) {
        val disposable = sensorFlowable
            .subscribeOn(Schedulers.io())
            .sample(200, TimeUnit.MILLISECONDS) // Rate limiting
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(
                { sensorValue -> println("UI Sensor Update: $sensorValue") },
                { error -> error.printStackTrace() }
            )
            
        disposables.add(disposable)
    }

    fun clear() {
        disposables.dispose()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is Backpressure in RxJava 3?
Backpressure occurs when an Observable produces items faster than an observer can consume them. `Flowable` handles backpressure by employing buffer policies (`DROP`, `LATEST`, `BUFFER`).

### Q2: What is the difference between `subscribeOn` and `observeOn`?
`subscribeOn()` specifies the thread on which the upstream source begins emitting items. `observeOn()` changes the thread on which downstream operators and subscribers receive items.

### Q3: Why is disposing subscriptions necessary in Android?
If a background RxJava stream is not disposed when an Activity or Fragment finishes, the stream continues running and holding references to the UI context, creating memory leaks.

### Q4: How does `.debounce()` differ from `.throttleFirst()`?
`.debounce()` waits for a specified pause duration before emitting the latest item. `.throttleFirst()` emits the first item in a window and suppresses subsequent items for the duration.

### Q5: How do you handle errors without terminating an RxStream?
Use operators like `.onErrorReturnItem()`, `.onErrorResumeNext()`, or `.retry()` to recover from errors and keep the reactive stream alive.
"""

inject_into_de_blog_data('pattern-android-rxkotlin', rxkotlin_md)
inject_into_de_blog_data('pattern-android-rxjava', rxjava_md)

print("RxKotlin and RxJava Padded!")
