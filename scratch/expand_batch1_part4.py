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

# 5. PATTERN-ANDROID-REPOSITORY
repo_md = r"""# Comprehensive Guide to the Repository Pattern in Android: Offline-First Caching & Single Source of Truth

The **Repository Pattern** is a foundational architectural pattern in Android development that decouples domain and UI layers from underlying data access implementations (such as Room SQLite databases, DataStore key-value pairs, and Retrofit REST APIs). By exposing a clean interface and maintaining an **Offline-First Single Source of Truth**, repositories ensure application resilience, seamless offline operation, and simplified unit testing.

---

## 1. Single Source of Truth & Offline-First Pipeline

In an offline-first architecture, the UI layer never observes network responses directly. Instead, network payloads are persisted to the local database, and the UI observes a reactive stream (e.g. `Flow<List<T>>`) originating exclusively from the local database.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="repoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#repoBg)" stroke="#10b981" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Offline-First Repository Architecture</text>

  <!-- ViewModel -->
  <g transform="translate(60, 110)">
    <rect width="180" height="180" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="90" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">ViewModel</text>
    <text x="15" y="80" fill="#a5b4fc" font-family="system-ui" font-size="12">• Observes Flow</text>
    <text x="15" y="110" fill="#a5b4fc" font-family="system-ui" font-size="12">• Agnostic of Source</text>
  </g>

  <!-- Repository -->
  <g transform="translate(330, 110)">
    <rect width="240" height="180" rx="8" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
    <text x="120" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">Repository</text>
    <text x="15" y="80" fill="#a7f3d0" font-family="system-ui" font-size="12">• Manages Cache Policy</text>
    <text x="15" y="110" fill="#a7f3d0" font-family="system-ui" font-size="12">• Fetches Network -> DB</text>
    <text x="15" y="140" fill="#a7f3d0" font-family="system-ui" font-size="12">• Exposes Local Flow</text>
  </g>

  <!-- Sources -->
  <g transform="translate(650, 70)">
    <rect width="190" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="95" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="13">Room Local DB</text>
    <text x="95" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="11">Single Source of Truth</text>
  </g>

  <g transform="translate(650, 200)">
    <rect width="190" height="90" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="95" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-size="13">Retrofit API</text>
    <text x="95" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="11">Remote Data</text>
  </g>
</svg>

---

## 2. Production Kotlin Implementation

```kotlin
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class NewsRepositoryImpl(
    private val newsDao: NewsDao,
    private val newsApi: NewsApiService
) : NewsRepository {

    // Expose local database as reactive Flow stream (Single Source of Truth)
    override fun getArticles(): Flow<List<ArticleDomainModel>> {
        return newsDao.observeArticles().map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    override suspend fun refreshArticles() {
        withContext(Dispatchers.IO) {
            try {
                val remoteDTOs = newsApi.fetchLatestNews()
                val entities = remoteDTOs.map { it.toEntity() }
                
                // Write network payloads directly to database
                newsDao.clearAndInsert(entities)
            } catch (e: Exception) {
                // If offline or API fails, local Room DB cache remains intact
                e.printStackTrace()
            }
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What does "Single Source of Truth" mean in the Repository Pattern?
It means the UI observes data coming exclusively from local storage (e.g. Room DB). Network calls update the local database, which automatically triggers reactive Flow emissions to the UI.

### Q2: Should a Repository return Domain Models or Data Entities?
A Repository should transform raw API DTOs and Database Entities into clean Domain Models before returning them to the domain/ViewModel layer.

### Q3: How do you mock a Repository for ViewModel unit tests?
By defining a Kotlin `interface NewsRepository` and supplying a fake or mock implementation (`FakeNewsRepository`) during testing.

### Q4: Should a Repository manage thread dispatching?
Yes. Operations inside a Repository should be main-safe, using `withContext(Dispatchers.IO)` for database and network execution.

### Q5: Is a Repository required for simple apps with no local database?
Yes. Even without a local database, a Repository abstracts API clients, enabling easy swapping of network providers or adding caching later.
"""

# 7. PATTERN-ANDROID-LIVEDATA
livedata_md = r"""# Comprehensive Guide to LiveData in Android: Lifecycle Awareness & Reactive UI Observers

**LiveData** is an observable data holder class introduced in Android Jetpack. Unlike standard Java/Kotlin observables, LiveData is **lifecycle-aware**, meaning it respects the active state of Android UI components (Activities, Fragments, or Services). LiveData ensures observers only receive updates when their host component is in an active lifecycle state (`STARTED` or `RESUMED`), eliminating null pointer exceptions and memory leaks.

---

## 1. Lifecycle Awareness Mechanics

<svg viewBox="0 0 900 320" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="liveDataBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="320" rx="12" fill="url(#liveDataBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">LiveData Lifecycle Awareness</text>

  <!-- LiveData -->
  <g transform="translate(100, 100)">
    <rect width="220" height="160" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="16">MutableLiveData</text>
    <text x="15" y="75" fill="#fef9c3" font-family="system-ui" font-size="12">• setValue() (Main Thread)</text>
    <text x="15" y="105" fill="#fef9c3" font-family="system-ui" font-size="12">• postValue() (Background)</text>
    <text x="15" y="135" fill="#fef9c3" font-family="system-ui" font-size="12">• Holds Single Value</text>
  </g>

  <!-- Observer -->
  <g transform="translate(580, 100)">
    <rect width="220" height="160" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="16">Activity Observer</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">Lifecycle: STARTED / RESUMED</text>
    <text x="15" y="105" fill="#22c55e" font-family="system-ui" font-weight="700" font-size="12">✅ Receives Data Update</text>
    <text x="15" y="130" fill="#ef4444" font-family="system-ui" font-size="11">STOPPED -> Pauses Updates</text>
  </g>

  <path d="M 320 180 L 580 180" stroke="#fde047" stroke-width="2.5"/>
</svg>

---

## 2. Production Kotlin Implementation & Transformations

```kotlin
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map
import androidx.lifecycle.switchMap

class OrderViewModel(
    private val repository: OrderRepository
) : ViewModel() {

    private val _orderId = MutableLiveData<String>()
    
    // LiveData transformation via switchMap
    val orderDetails: LiveData<OrderDetails> = _orderId.switchMap { id ->
        repository.observeOrderDetails(id)
    }

    fun selectOrder(id: String) {
        _orderId.value = id // Main thread assignment
    }

    fun updateDataFromBackground(id: String) {
        _orderId.postValue(id) // Thread-safe background assignment
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between `setValue()` and `postValue()` in LiveData?
`setValue()` must be called from the main thread and updates observers synchronously. `postValue()` can be called from any background thread and posts a task to the main thread looper.

### Q2: Why does LiveData prevent Activity memory leaks?
Observers are bound to a `LifecycleOwner`. When the Activity reaches the `DESTROYED` state, LiveData automatically removes the observer reference.

### Q3: Is LiveData still recommended over Kotlin StateFlow?
Google recommends StateFlow for new Android development, especially with Jetpack Compose. LiveData remains heavily used in legacy XML projects.

### Q4: Can LiveData handle complex asynchronous stream transformations?
LiveData supports basic `map` and `switchMap` transformations, but lacks advanced reactive operators (like `debounce`, `combine`, or `zip`) available in Kotlin Flow.

### Q5: How do you convert LiveData to Flow?
Use the `asFlow()` extension function provided by the `androidx.lifecycle` library.
"""

# 8. ASYNC-COROUTINES
coroutines_md = r"""# Comprehensive Guide to Kotlin Coroutines in Android: Suspend Functions, Dispatchers & Structured Concurrency

**Kotlin Coroutines** provide high-performance, non-blocking asynchronous programming for Android applications. Operating on top of the Java Virtual Machine, coroutines enable developers to write sequential asynchronous code without nested callback hell while ensuring background jobs are automatically cancelled when parent UI scopes are destroyed.

---

## 1. Coroutine Architecture & Dispatcher Execution Pools

Unlike Java OS threads (which consume ~1MB of stack memory per thread), Kotlin Coroutines are lightweight user-space tasks managed by a dispatcher thread pool.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coroutineBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#coroutineBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Kotlin Coroutine Dispatchers</text>

  <!-- Main -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Dispatchers.Main</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• Android UI Thread</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• Jetpack Compose / Views</text>
    <text x="15" y="135" fill="#94a3b8" font-family="system-ui" font-size="12">• Fast UI Events</text>
  </g>

  <!-- IO -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">Dispatchers.IO</text>
    <text x="15" y="75" fill="#a5b4fc" font-family="system-ui" font-size="12">• Disk File Operations</text>
    <text x="15" y="105" fill="#a5b4fc" font-family="system-ui" font-size="12">• Room DB Queries</text>
    <text x="15" y="135" fill="#a5b4fc" font-family="system-ui" font-size="12">• Retrofit REST Calls</text>
  </g>

  <!-- Default -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Dispatchers.Default</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• CPU-Intensive Tasks</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• Heavy Sorting & Math</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Large JSON Parsing</text>
  </g>
</svg>

---

## 2. Production Kotlin Coroutine Code

```kotlin
import kotlinx.coroutines.*

class UserDataUseCase(
    private val api: ApiService,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    suspend fun fetchAndProcessUserData(userId: String): UserProfile = withContext(ioDispatcher) {
        // Run network requests concurrently using async
        val deferredDetails = async { api.getUserDetails(userId) }
        val deferredOrders = async { api.getUserOrders(userId) }

        val details = deferredDetails.await()
        val orders = deferredOrders.await()

        UserProfile(details, orders)
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why are Kotlin Coroutines described as "light-weight threads"?
Thousands of coroutines can run concurrently on a small thread pool without exceeding memory limits because coroutines suspend execution without blocking underlying OS threads.

### Q2: What is Structured Concurrency in Coroutines?
Structured Concurrency guarantees that when a parent scope (e.g. `viewModelScope`) is cancelled, all child coroutines launched within that scope are automatically cancelled.

### Q3: What is the difference between `launch` and `async`?
`launch` starts a coroutine that returns a `Job` (fire-and-forget). `async` starts a coroutine that returns a `Deferred<T>`, allowing callers to call `.await()` to retrieve a result value.

### Q4: What happens when an exception is thrown inside a CoroutineScope?
By default, an unhandled exception in a coroutine cancels its parent and all sibling coroutines. Use `SupervisorJob` or `supervisorScope` to isolate failures.

### Q5: How do suspend functions work under the hood in bytecode?
Kotlin compiles suspend functions into a State Machine, passing a `Continuation` object that stores local state when execution suspends.
"""

# 9. ASYNC-THREADS
threads_md = r"""# Comprehensive Guide to Android Threading: Main Thread, Handler, Looper & MessageQueue

Understanding low-level **Android Threading** concepts—including the **Main UI Thread**, **Looper**, **MessageQueue**, and **HandlerThread**—is essential for diagnosing UI lag, avoiding Application Not Responding (ANR) dialogs, and understanding how modern async libraries execute underneath.

---

## 1. The Main UI Thread & Looper Architecture

Android UI rendering runs on a single main thread. To prevent blocking the UI, long-running operations are offloaded to background threads. The main thread executes an infinite event processing loop managed by a **Looper**.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="threadBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#threadBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android Main Thread Looper Architecture</text>

  <!-- Handler -->
  <g transform="translate(60, 110)">
    <rect width="200" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Handler</text>
    <text x="15" y="80" fill="#94a3b8" font-family="system-ui" font-size="12">• Posts Runnable/Message</text>
    <text x="15" y="110" fill="#94a3b8" font-family="system-ui" font-size="12">• Enqueues to Queue</text>
  </g>

  <!-- MessageQueue -->
  <g transform="translate(350, 110)">
    <rect width="200" height="180" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">MessageQueue</text>
    <text x="15" y="80" fill="#a5b4fc" font-family="system-ui" font-size="12">• FIFO Queue</text>
    <text x="15" y="110" fill="#a5b4fc" font-family="system-ui" font-size="12">• Holds Messages</text>
  </g>

  <!-- Looper -->
  <g transform="translate(640, 110)">
    <rect width="200" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Looper</text>
    <text x="15" y="80" fill="#a7f3d0" font-family="system-ui" font-size="12">• Infinite Loop</text>
    <text x="15" y="110" fill="#a7f3d0" font-family="system-ui" font-size="12">• Dispatches to Handler</text>
  </g>
</svg>

---

## 2. Production Kotlin HandlerThread Example

```kotlin
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper

class CustomBackgroundWorker {

    private val handlerThread = HandlerThread("BackgroundWorkerThread").apply { start() }
    private val backgroundHandler = Handler(handlerThread.looper)
    private val mainHandler = Handler(Looper.getMainLooper())

    fun executeBackgroundTask(onComplete: (String) -> Unit) {
        backgroundHandler.post {
            // Heavy computation on background thread
            Thread.sleep(1000)
            val result = "Processing complete"

            // Post result back to Main UI Thread
            mainHandler.post {
                onComplete(result)
            }
        }
    }

    fun stop() {
        handlerThread.quitSafely()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What causes an Application Not Responding (ANR) error in Android?
An ANR is triggered when the Main UI Thread is blocked for more than 5 seconds by long-running operations like disk I/O, heavy computation, or database queries.

### Q2: What is the role of `Looper.prepare()` and `Looper.loop()`?
`Looper.prepare()` initializes a `MessageQueue` for the current thread. `Looper.loop()` starts the infinite loop processing incoming messages.

### Q3: Why is `AsyncTask` deprecated in Android?
`AsyncTask` led to memory leaks, incorrect cancellation handling, and crashes on screen orientation changes. It was superseded by Kotlin Coroutines and RxJava.

### Q4: What is the difference between `Handler.post()` and `Handler.sendMessage()`?
`post()` accepts a `Runnable` object. `sendMessage()` accepts a `Message` object containing data fields (e.g. `what`, `arg1`, `obj`).

### Q5: How do you safely stop a `HandlerThread`?
Call `handlerThread.quitSafely()`, which finishes processing all pending messages already queued before terminating the thread.
"""

# 10. ASYNC-WORKMANAGER
wm_md = r"""# Comprehensive Guide to WorkManager in Android: Guaranteed Persistent Background Tasks & Constraints

**WorkManager** is the official Jetpack library for deferrable, guaranteed background processing in Android. It automatically chooses the optimal system execution engine (such as `JobScheduler` or `AlarmManager`) based on device API level and system power state, ensuring tasks execute even if the app process is terminated or the device reboots.

---

## 1. WorkManager Architecture & Execution Pipeline

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#wmBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">WorkManager Persistent Task Pipeline</text>

  <!-- WorkRequest -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">WorkRequest</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• OneTimeWorkRequest</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• PeriodicWorkRequest</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Network/Battery Constraints</text>
  </g>

  <!-- WorkManager Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">WorkManager Engine</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Persists in SQLite DB</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Evaluates System State</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• JobScheduler Fallback</text>
  </g>

  <!-- CoroutineWorker -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">CoroutineWorker</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• doWork(): Result</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Result.success()</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Result.retry()</text>
  </g>
</svg>

---

## 2. Production Kotlin CoroutineWorker Implementation

```kotlin
import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

// 1. CoroutineWorker Class
class SyncDataWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Perform background data sync
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// 2. Enqueue Task with System Constraints
fun scheduleSync(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED) // Wi-Fi only
        .setRequiresBatteryNotLow(true)
        .build()

    val syncRequest = OneTimeWorkRequestBuilder<SyncDataWorker>()
        .setConstraints(constraints)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
        .build()

    WorkManager.getInstance(context).enqueue(syncRequest)
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: When should WorkManager be used instead of Kotlin Coroutines?
Use Coroutines for tasks that should only execute while the app is active in the foreground. Use WorkManager for guaranteed persistent tasks (like syncing data or uploading logs) that must finish even if the user exits the app.

### Q2: What is the minimum interval for PeriodicWorkRequest?
The minimum repeat interval for `PeriodicWorkRequest` is **15 minutes**.

### Q3: How does WorkManager handle task failures?
If `doWork()` returns `Result.retry()`, WorkManager reschedules execution using exponential or linear backoff policies based on configured criteria.

### Q4: Can WorkManager tasks be chained sequentially?
Yes. You can chain requests using `WorkManager.beginWith(taskA).then(taskB).enqueue()`.

### Q5: How do you pass input data to a Worker?
Input data is passed using `Data.Builder()` via `setInputData()`, and retrieved inside the worker using `inputData.getString(...)`.
"""

inject_into_de_blog_data('pattern-android-repository', repo_md)
inject_into_de_blog_data('pattern-android-livedata', livedata_md)
inject_into_de_blog_data('async-coroutines', coroutines_md)
inject_into_de_blog_data('async-threads', threads_md)
inject_into_de_blog_data('async-workmanager', wm_md)

print("Batch 1 Remaining 5 Articles Injected!")
