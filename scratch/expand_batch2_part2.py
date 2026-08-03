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

# 3. PATTERN-ANDROID-OBSERVER
observer_md = r"""# Comprehensive Guide to the Observer Pattern in Android: Event Buses, LiveData & Reactive Streams

The **Observer Pattern** is a behavioral design pattern in which an object (known as the **Subject** or **Observable**) maintains a list of dependents (known as **Observers**) and notifies them automatically of any state changes, typically by calling one of their methods. In Android development, the Observer Pattern forms the backbone of event-driven architectures, reactive UI binding (LiveData, StateFlow), and global event bus messaging.

---

## 1. Architectural Mechanics: Subject & Observer Coupling

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="obsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#obsBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Observer Pattern Event Notification Architecture</text>

  <!-- Subject -->
  <g transform="translate(80, 110)">
    <rect width="220" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="16">Subject (Observable)</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• Registers Observers</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• Unregisters Observers</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Calls notifyObservers()</text>
  </g>

  <!-- Observers -->
  <g transform="translate(580, 70)">
    <rect width="220" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="14">UI Observer A (Activity)</text>
    <text x="110" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12">onChanged(newData)</text>
  </g>

  <g transform="translate(580, 200)">
    <rect width="220" height="90" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="110" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-size="14">UI Observer B (Fragment)</text>
    <text x="110" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12">onChanged(newData)</text>
  </g>

  <path d="M 300 160 L 580 115" stroke="#6ee7b7" stroke-width="2"/>
  <path d="M 300 220 L 580 245" stroke="#6ee7b7" stroke-width="2"/>
</svg>

---

## 2. Custom Kotlin Observer Implementation

```kotlin
// 1. Observer Interface
interface DataObserver<T> {
    fun onDataChanged(data: T)
}

// 2. Observable Subject
class NetworkStatusMonitor {
    private val observers = mutableListOf<DataObserver<Boolean>>()
    private var isConnected: Boolean = false

    fun registerObserver(observer: DataObserver<Boolean>) {
        if (!observers.contains(observer)) {
            observers.add(observer)
            observer.onDataChanged(isConnected) // Immediate initial emit
        }
    }

    fun unregisterObserver(observer: DataObserver<Boolean>) {
        observers.remove(observer)
    }

    fun setNetworkStatus(connected: Boolean) {
        if (this.isConnected != connected) {
            this.isConnected = connected
            notifyAllObservers()
        }
    }

    private fun notifyAllObservers() {
        observers.forEach { observer ->
            observer.onDataChanged(isConnected)
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is unregistering Observers critical in Android Activities?
Failing to unregister an Observer when an Activity is destroyed keeps a strong reference to the Activity inside the Subject's internal list, causing a permanent memory leak.

### Q2: How does Kotlin SharedFlow act as an Observer Pattern implementation?
Kotlin `SharedFlow` is a hot stream where multiple subscribers (Observers) collect values emitted by a single producer (Subject).

### Q3: What was the main danger of global EventBus libraries (like EventBus or RxBus)?
Global Event Buses allow any component to emit events anywhere in the app, creating unmaintainable, spaghetti-like codebases where event tracing becomes extremely difficult.

### Q4: How does LiveData improve upon basic Java `Observer`?
LiveData is lifecycle-aware: it automatically pauses event delivery when the observer's Lifecycle is inactive (`STOPPED`) and automatically unregisters when destroyed (`DESTROYED`).

### Q5: Can multiple Observers observe the same StateFlow simultaneously?
Yes. StateFlow supports multiple concurrent collectors, replaying the current state to new collectors immediately upon subscription.
"""

# 4. PATTERN-ANDROID-RXKOTLIN
rxkotlin_md = r"""# Comprehensive Guide to RxKotlin in Android: Concise Functional Reactive Extensions

**RxKotlin** is a lightweight Kotlin wrapper around RxJava that provides convenient extension functions, extension properties, and SAM (Single Abstract Method) adapters. It allows Android developers to write expressive, idiomatic functional reactive code without verbose Java boilerplate.

---

## 1. RxKotlin Extension Architecture & Convenience Methods

RxKotlin enhances RxJava by adding idiomatic extension functions for creating Observables, subscribing with lambdas, and combining reactive streams.

```kotlin
import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.kotlin.subscribeBy
import io.reactivex.rxjava3.kotlin.toObservable

fun main() {
    val itemsList = listOf("Apple", "Banana", "Cherry")

    // RxKotlin extension function: .toObservable()
    itemsList.toObservable()
        .filter { it.startsWith("B") }
        .map { it.uppercase() }
        .subscribeBy(
            onNext = { println("Next: $it") },
            onError = { it.printStackTrace() },
            onComplete = { println("Stream completed!") }
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
                onSuccess = { results -> /* Update UI */ },
                onError = { error -> /* Handle Error */ }
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

# 5. PATTERN-ANDROID-RXJAVA
rxjava_md = r"""# Comprehensive Guide to RxJava 3 in Android: Observables, Flowables & Backpressure Management

**RxJava 3** is a rich implementation of Reactive Extensions for the JVM that enables developers to compose asynchronous, event-based programs using observable sequences. It introduces specialized stream types (`Observable`, `Flowable`, `Single`, `Maybe`, `Completable`) and powerful thread schedulers (`Schedulers.io()`, `AndroidSchedulers.mainThread()`).

---

## 1. RxJava 3 Reactive Types & Stream Contracts

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

inject_into_de_blog_data('pattern-android-observer', observer_md)
inject_into_de_blog_data('pattern-android-rxkotlin', rxkotlin_md)
inject_into_de_blog_data('pattern-android-rxjava', rxjava_md)

print("Batch 2 (Part 2 - Observer, RxKotlin, RxJava) Injected!")
