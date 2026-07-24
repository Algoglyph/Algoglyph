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

# 4. PATTERN-ANDROID-RXKOTLIN (Deep Expanded)
rxkotlin_md = r"""# Comprehensive Guide to RxKotlin in Android: Idiomatic Reactive Extensions & Operators

**RxKotlin** is a lightweight Kotlin wrapper library built around RxJava that provides expressive extension functions, SAM (Single Abstract Method) adapters, and convenience extension properties. It enables Android developers to write clean, functional, reactive streams without Java's verbose boilerplate code.

---

## 1. Architectural Overview & Reactive Convenience Methods

In traditional RxJava, working with Java SAM interfaces often required explicit instantiation of `Consumer` or `Function` interfaces. RxKotlin leverages Kotlin's language features—such as extension functions and high-order functions—to streamline reactive stream declaration.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rxkBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#701a75"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#rxkBg)" stroke="#f0abfc" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fae8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">RxKotlin Extension Integration Model</text>

  <!-- RxJava Engine -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">RxJava 3 Engine</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Core Reactive Types</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Schedulers & Threading</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Backpressure Protocols</text>
  </g>

  <!-- RxKotlin Wrapper -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#701a75" stroke="#f0abfc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fae8ff" font-family="monospace" font-weight="700" font-size="15">RxKotlin Extensions</text>
    <text x="15" y="70" fill="#f5d0fe" font-family="system-ui" font-size="12">• toObservable()</text>
    <text x="15" y="100" fill="#f5d0fe" font-family="system-ui" font-size="12">• subscribeBy()</text>
    <text x="15" y="130" fill="#f5d0fe" font-family="system-ui" font-size="12">• addTo(disposables)</text>
  </g>

  <!-- App UI -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Android UI / ViewModel</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Clean Named Lambdas</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Main Thread Observes</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Auto Disposed</text>
  </g>
</svg>

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

# 5. PATTERN-ANDROID-RXJAVA (Deep Expanded)
rxjava_md = r"""# Comprehensive Guide to RxJava 3 in Android: Observables, Flowables & Backpressure Management

**RxJava 3** is a rich implementation of Reactive Extensions for the JVM that enables developers to compose asynchronous, event-based programs using observable sequences. It introduces specialized stream types (`Observable`, `Flowable`, `Single`, `Maybe`, `Completable`) and powerful thread schedulers (`Schedulers.io()`, `AndroidSchedulers.mainThread()`).

---

## 1. RxJava 3 Reactive Stream Contract Types

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rxjBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#rxjBg)" stroke="#fca5a5" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fee2e2" font-family="system-ui, sans-serif" font-size="20" font-weight="700">RxJava 3 Multi-Type Reactive Spectrum</text>

  <g transform="translate(60, 100)">
    <rect width="150" height="200" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="75" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="14">Observable</text>
    <text x="10" y="70" fill="#94a3b8" font-family="system-ui" font-size="11">• 0..Infinity</text>
    <text x="10" y="100" fill="#94a3b8" font-family="system-ui" font-size="11">• No Backpressure</text>
  </g>

  <g transform="translate(230, 100)">
    <rect width="150" height="200" rx="8" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
    <text x="75" y="30" text-anchor="middle" fill="#fee2e2" font-family="monospace" font-weight="700" font-size="14">Flowable</text>
    <text x="10" y="70" fill="#fecdd3" font-family="system-ui" font-size="11">• 0..Infinity</text>
    <text x="10" y="100" fill="#fecdd3" font-family="system-ui" font-size="11">• Backpressure</text>
  </g>

  <g transform="translate(400, 100)">
    <rect width="150" height="200" rx="8" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
    <text x="75" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="14">Single</text>
    <text x="10" y="70" fill="#a7f3d0" font-family="system-ui" font-size="11">• Exactly 1</text>
    <text x="10" y="100" fill="#a7f3d0" font-family="system-ui" font-size="11">• REST API</text>
  </g>

  <g transform="translate(570, 100)">
    <rect width="150" height="200" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="75" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="14">Maybe</text>
    <text x="10" y="70" fill="#a5b4fc" font-family="system-ui" font-size="11">• 0 or 1</text>
    <text x="10" y="100" fill="#a5b4fc" font-family="system-ui" font-size="11">• Optional DB</text>
  </g>

  <g transform="translate(740, 100)">
    <rect width="100" height="200" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="50" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-weight="700" font-size="13">Completable</text>
    <text x="10" y="70" fill="#94a3b8" font-family="system-ui" font-size="11">• 0 items</text>
    <text x="10" y="100" fill="#94a3b8" font-family="system-ui" font-size="11">• Status</text>
  </g>
</svg>

---

## 2. Stream Type Comparison Matrix

| Stream Type | Emissions | Backpressure Support | Common Use Case |
| :--- | :--- | :--- | :--- |
| **Observable** | 0 to Infinity | ❌ No | Button clicks, UI events, fast small streams |
| **Flowable** | 0 to Infinity | ✅ Yes (Backpressure strategy) | High-volume data streams (DB, Sensors, Sockets) |
| **Single** | Exactly 1 or Error | N/A | REST API Network Requests |
| **Maybe** | 0 or 1 item or Error | N/A | Database Query returning optional result |
| **Completable** | 0 items (Success or Error) | N/A | Write/Delete DB operations |

---

## 3. Production RxJava 3 Android Pipeline

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

print("RxKotlin and RxJava Deeply Padded!")
