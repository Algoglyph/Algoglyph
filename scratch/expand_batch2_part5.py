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

# 3. PATTERN-ANDROID-OBSERVER (Expanded)
observer_md = r"""# Comprehensive Guide to the Observer Pattern in Android: Reactive UI Binding, Event Buses & Flow Subscribers

The **Observer Pattern** is a foundational behavioral design pattern in Android software engineering. It defines a 1-to-N dependency relationship between a single state holder (**Subject** or **Observable**) and multiple dependent components (**Observers**). When the state inside the Subject changes, all registered Observers are automatically notified and updated.

In modern Android architecture, the Observer Pattern underpins all reactive data binding mechanisms—including `StateFlow`, `SharedFlow`, `LiveData`, `RxJava`, and Jetpack Compose state tracking.

---

## 1. Architectural Mechanics & Decoupled State Observation

In non-reactive legacy architectures, components had to manually poll data sources or call imperative setter methods across layers, leading to tight coupling and synchronization bugs.

The Observer Pattern decouples subjects from observers:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="obsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#obsBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Observer Pattern Event Notification Flow</text>

  <!-- Subject -->
  <g transform="translate(80, 110)">
    <rect width="220" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="16">Subject (Observable)</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• Maintains Observer List</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• register / unregister</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Emits State Changes</text>
  </g>

  <!-- Observers -->
  <g transform="translate(580, 70)">
    <rect width="220" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="14">UI Observer A (Activity)</text>
    <text x="110" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12">onChanged(state)</text>
  </g>

  <g transform="translate(580, 200)">
    <rect width="220" height="90" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="110" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-size="14">UI Observer B (Fragment)</text>
    <text x="110" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12">onChanged(state)</text>
  </g>

  <path d="M 300 160 L 580 115" stroke="#6ee7b7" stroke-width="2"/>
  <path d="M 300 220 L 580 245" stroke="#6ee7b7" stroke-width="2"/>
</svg>

---

## 2. Custom Kotlin Observer Implementation & Memory Leak Management

Below is a complete, production-grade custom Observer implementation demonstrating thread-safe observer registration and memory leak prevention:

```kotlin
// 1. Observer Interface Contract
interface NetworkObserver {
    fun onNetworkStatusChanged(isConnected: Boolean)
}

// 2. Observable Subject
class NetworkMonitor {
    private val observers = mutableListOf<NetworkObserver>()
    private var isConnected: Boolean = false

    @Synchronized
    fun registerObserver(observer: NetworkObserver) {
        if (!observers.contains(observer)) {
            observers.add(observer)
            // Immediately notify new subscriber of current state
            observer.onNetworkStatusChanged(isConnected)
        }
    }

    @Synchronized
    fun unregisterObserver(observer: NetworkObserver) {
        observers.remove(observer)
    }

    fun updateNetworkStatus(connected: Boolean) {
        synchronized(this) {
            if (this.isConnected == connected) return
            this.isConnected = connected
        }
        notifyObservers()
    }

    private fun notifyObservers() {
        val currentObservers: List<NetworkObserver>
        synchronized(this) {
            currentObservers = ArrayList(observers) // Defensive copy for thread-safe iteration
        }
        currentObservers.forEach { observer ->
            observer.onNetworkStatusChanged(isConnected)
        }
    }
}

// 3. Android Component Usage
class ConnectivityActivity : AppCompatActivity(), NetworkObserver {

    private val networkMonitor = NetworkMonitor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_connectivity)
        
        networkMonitor.registerObserver(this)
    }

    override fun onNetworkStatusChanged(isConnected: Boolean) {
        // Update UI status banner
    }

    override fun onDestroy() {
        super.onDestroy()
        // CRITICAL: Unregister to prevent Memory Leak
        networkMonitor.unregisterObserver(this)
    }
}
```

---

## 3. Comparison of Observer Technologies in Android

| Observer Technology | Lifecycle Awareness | Multithreading Support | Backpressure | Recommended For |
| :--- | :--- | :--- | :--- | :--- |
| **Custom Observer Interface** | ❌ Manual (`onDestroy`) | ❌ Requires Manual Sync | ❌ None | Low-level C++/Native Wrappers |
| **`LiveData`** | ✅ Native (Automatic) | ✅ Main Thread Enforced | ❌ None | Legacy XML Views Architecture |
| **`StateFlow` / `SharedFlow`** | ✅ via `repeatOnLifecycle` | ✅ Coroutine Dispatchers | ✅ Buffer Strategies | Modern Jetpack & Compose Apps |
| **`RxJava 3` / `RxKotlin`** | ❌ Manual (`CompositeDisposable`) | ✅ Dedicated Schedulers | ✅ Flowable Strategies | Legacy Reactive Pipelines |

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

# 6. DI-DAGGER (Expanded)
dagger_md = r"""# Comprehensive Guide to Dagger 2 in Android: Static Compile-Time Graph Generation & Memory Management

**Dagger 2** is a fully static, compile-time dependency injection framework for Java, Kotlin, and Android. Maintained by Google, Dagger eliminates the runtime reflection performance penalty associated with traditional Java DI frameworks (like Spring) by building and validating the dependency graph at compile time via annotation processors (KAPT/KSP).

---

## 1. Architectural Components: `@Module`, `@Component` & Scope Management

Dagger 2 operates through three primary building blocks:
1. **`@Module`**: Classes containing `@Provides` or `@Binds` methods that instruct Dagger how to construct instances of classes (such as third-party SDK objects or interfaces).
2. **`@Component`**: The central bridge interface generated at compile time (`DaggerAppComponent`). It inspects modules and injects dependencies into target classes (`Activity`, `Fragment`).
3. **`@Scope`**: Annotations (like `@Singleton`) that anchor instance lifecycles to the lifetime of their owning `@Component`.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dagBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#831843"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#dagBg)" stroke="#f43f5e" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ffe4e6" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Dagger 2 Static Graph Generation Model</text>

  <!-- Module -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-weight="700" font-size="15">@Module</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• @Provides Functions</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• @Binds Interfaces</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Third-Party Libraries</text>
  </g>

  <!-- Component -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#831843" stroke="#fda4af" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ffe4e6" font-family="monospace" font-weight="700" font-size="15">@Component</text>
    <text x="15" y="70" fill="#fecdd3" font-family="system-ui" font-size="12">• Validates Graph Build</text>
    <text x="15" y="100" fill="#fecdd3" font-family="system-ui" font-size="12">• Generates Code</text>
    <text x="15" y="130" fill="#fecdd3" font-family="system-ui" font-size="12">• DaggerAppComponent</text>
  </g>

  <!-- Target -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Target Class</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• @Inject lateinit var</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Field Injection</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Instant Assignment</text>
  </g>
</svg>

---

## 2. Production Dagger 2 Architecture Implementation

```kotlin
import dagger.Component
import dagger.Module
import dagger.Provides
import javax.inject.Inject
import javax.inject.Singleton

// 1. Dependency Classes
class ApiService @Inject constructor() {
    fun fetchData(): String = "Data from API"
}

// 2. Module Definition
@Module
class NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofitService(): ApiService = ApiService()
}

// 3. Component Interface
@Singleton
@Component(modules = [NetworkModule::class])
interface AppComponent {
    fun inject(activity: MainActivity)
}

// 4. Custom Application Class
class MainApplication : Application() {
    val appComponent: AppComponent by lazy {
        DaggerAppComponent.builder().build()
    }
}

// 5. Target Activity Field Injection
class MainActivity : AppCompatActivity() {

    @Inject
    lateinit var apiService: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        (application as MainApplication).appComponent.inject(this)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        println(apiService.fetchData())
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What makes Dagger 2 faster than reflection-based DI frameworks?
Dagger 2 validates dependencies and generates pure Java factory code at compile time. It uses zero runtime reflection, resulting in fast application startup times.

### Q2: What is the difference between `@Provides` and `@Binds` in Dagger 2?
`@Provides` is used for instantiating third-party or complex objects requiring custom initialization logic. `@Binds` is an abstract method optimization that binds an implementation class to an interface without generating additional factory code.

### Q3: How does `@Singleton` scope work in Dagger 2?
Scopes in Dagger 2 are tied to the lifecycle of the `Component` instance that owns them. A `@Singleton` object remains a single instance as long as its host `AppComponent` instance stays alive in memory.

### Q4: What causes a "Dagger/MissingBinding" error at compile time?
This occurs when Dagger cannot locate a provider or `@Inject` constructor for a required dependency in the component graph.

### Q5: How does Dagger 2 compare to Hilt?
Hilt is an opinionated framework built on top of Dagger 2 that automatically manages Android component lifecycles, eliminating custom Component boilerplate.
"""

inject_into_de_blog_data('pattern-android-observer', observer_md)
inject_into_de_blog_data('di-dagger', dagger_md)

print("Part 5 Injected!")
