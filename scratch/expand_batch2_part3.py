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

# 6. DI-DAGGER
dagger_md = r"""# Comprehensive Guide to Dagger 2 in Android: Compile-Time Dependency Injection & Graph Generation

**Dagger 2** is a fully static, compile-time dependency injection framework for Java and Android. Developed by Google, Dagger eliminates the runtime reflection overhead associated with traditional DI frameworks (like Spring) by validating the dependency graph and generating pure Java boilerplate code during compilation via annotation processors (KAPT/KSP).

---

## 1. Architectural Components: Component, Module & Scope

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dagBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#831843"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#dagBg)" stroke="#f43f5e" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ffe4e6" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Dagger 2 Compile-Time Graph Architecture</text>

  <!-- Module -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-weight="700" font-size="15">@Module</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Provides Third-Party Objects</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• @Provides Functions</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• @Binds Interface Mappings</text>
  </g>

  <!-- Component -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#831843" stroke="#fda4af" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ffe4e6" font-family="monospace" font-weight="700" font-size="15">@Component</text>
    <text x="15" y="70" fill="#fecdd3" font-family="system-ui" font-size="12">• Dependency Injector Bridge</text>
    <text x="15" y="100" fill="#fecdd3" font-family="system-ui" font-size="12">• Validates Graph at Compile</text>
    <text x="15" y="130" fill="#fecdd3" font-family="system-ui" font-size="12">• Generates DaggerAppComponent</text>
  </g>

  <!-- Target -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Target Container</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• @Inject lateinit var</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Activity / Fragment</text>
  </g>
</svg>

---

## 2. Production Dagger 2 Implementation

```kotlin
import dagger.Component
import dagger.Module
import dagger.Provides
import javax.inject.Singleton

// 1. Module providing Network dependencies
@Module
class NetworkModule {
    @Provides
    @Singleton
    fun provideRetrofit(): RetrofitService = RetrofitService.create()
}

// 2. Component Bridge
@Singleton
@Component(modules = [NetworkModule::class])
interface AppComponent {
    fun inject(activity: MainActivity)
}

// 3. Application setup
class MainApplication : Application() {
    val appComponent: AppComponent by lazy {
        DaggerAppComponent.builder().build()
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

# 7. DI-HILT
hilt_md = r"""# Comprehensive Guide to Hilt in Android: Standardized Android Dependency Injection

**Hilt** is Google's official dependency injection library for Android, built on top of Dagger 2. Hilt simplifies Dagger implementation by automatically generating predefined components, managing component lifecycles alongside Android classes (`Application`, `Activity`, `Fragment`, `ViewModel`), and providing standard annotations for seamless dependency injection.

---

## 1. Pre-defined Hilt Component Hierarchy & Lifecycles

| Hilt Component | Android Lifecycle Owner | Generated Scope |
| :--- | :--- | :--- |
| **`SingletonComponent`** | `Application` | `@Singleton` |
| **`ActivityRetainedComponent`** | `ViewModel` / Retained State | `@ActivityRetainedScoped` |
| **`ActivityComponent`** | `Activity` | `@ActivityScoped` |
| **`FragmentComponent`** | `Fragment` | `@FragmentScoped` |

---

## 2. Production Hilt Kotlin Implementation

```kotlin
import android.app.Application
import androidx.lifecycle.ViewModel
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton

// 1. Application Class
@HiltAndroidApp
class MainApp : Application()

// 2. Network Module
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideApiService(): ApiService {
        return RetrofitClient.create()
    }
}

// 3. Injectable ViewModel
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {
    // ViewModel Logic
}

// 4. Injectable Activity
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private val viewModel: HomeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is `@HiltAndroidApp` mandatory in the Application class?
`@HiltAndroidApp` triggers Hilt's code generation, instantiating the top-level `SingletonComponent` that acts as the root dependency container for the entire application.

### Q2: What is the purpose of `@AndroidEntryPoint`?
`@AndroidEntryPoint` marks Android framework classes (`Activity`, `Fragment`, `Service`, `View`) so that Hilt can inject dependencies into fields marked with `@Inject`.

### Q3: How does `@HiltViewModel` assist in ViewModel injection?
`@HiltViewModel` generates a custom `ViewModelProvider.Factory` under the hood, enabling seamless ViewModel injection without manual factory boilerplate.

### Q4: Can Hilt inject constructor parameters into Compose Composables directly?
Composables obtain Hilt ViewModels using the `hiltViewModel()` function provided by `androidx.hilt:hilt-navigation-compose`.

### Q5: How do you perform unit testing with Hilt?
Use `@HiltAndroidTest`, `@UninstallModules`, and `HiltTestActivity` to replace production modules with test fakes during instrumented Android tests.
"""

# 8. DI-KOIN
koin_md = r"""# Comprehensive Guide to Koin in Android: Pragmatic Service Locator & Kotlin DSL

**Koin** is a pragmatic lightweight dependency injection framework designed specifically for Kotlin developers. Unlike Dagger or Hilt, Koin does not rely on compile-time code generation or annotation processing (KAPT/KSP); instead, it utilizes a clean Kotlin Domain Specific Language (DSL) to resolve dependencies at runtime using a Service Locator pattern.

---

## 1. Koin DSL Fundamentals & Modules

```kotlin
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val appModule = module {
    // Factory: Creates a new instance on every injection
    factory { AnalyticsTracker() }

    // Single: Creates a singleton instance (retained across app)
    single<UserRepository> { UserRepositoryImpl(apiService = get()) }

    // ViewModel: Injected and retained via Jetpack ViewModelStore
    viewModel { UserProfileViewModel(userRepository = get()) }
}
```

---

## 2. Production Koin Application Setup

```kotlin
import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger()
            androidContext(this@MainApplication)
            modules(appModule)
        }
    }
}

// Injecting into Compose Composable
@Composable
fun ProfileScreen(
    viewModel: UserProfileViewModel = koinViewModel()
) {
    // UI Logic
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Koin differ from Dagger/Hilt under the hood?
Dagger/Hilt resolves dependencies at compile time via code generation. Koin resolves dependencies at runtime using Kotlin DSL lookup maps (Service Locator pattern).

### Q2: What are the main performance trade-offs of Koin?
Koin offers zero build-time annotation processing penalty. However, resolving dependencies at runtime can introduce slight latency during initial app startup and may throw runtime `NoBeanDefFoundException` errors if a dependency is omitted.

### Q3: How do you verify Koin modules for missing dependencies?
Use Koin's `checkModules()` API inside local JVM JUnit tests to verify module configuration validity before deploying builds.

### Q4: What is the difference between `single` and `factory` in Koin DSL?
`single` creates a singleton instance retained in the Koin container. `factory` creates a fresh object instance every time it is injected.

### Q5: Is Koin compatible with Multiplatform (KMP)?
Yes. Because Koin relies purely on Kotlin code without JVM annotation processors, it is fully compatible with Kotlin Multiplatform (KMP) across Android, iOS, and Web.
"""

# 9. STORAGE-SHARED-PREFERENCES
prefs_md = r"""# Comprehensive Guide to SharedPreferences in Android: Key-Value Persistence & Anti-Patterns

**SharedPreferences** is an early key-value storage framework provided by the Android SDK for saving primitive data types (`Booleans`, `Floats`, `Ints`, `Longs`, `Strings`) to disk as XML files. While widely used in legacy applications, improper usage can cause UI thread blocking and memory issues.

---

## 1. Storage Execution & Thread Synchronization: `commit()` vs `apply()`

| Metric | `commit()` | `apply()` |
| :--- | :--- | :--- |
| **Execution Model** | Synchronous (Disk Blocking) | Asynchronous (In-Memory first) |
| **Return Value** | `Boolean` (True on disk success) | `Void` (No return status) |
| **Thread Safety** | Blocks caller thread | Safe for Main Thread |
| **Usage Recommendation** | Legacy code requiring instant disk verification | Default choice for SharedPreferences |

---

## 2. Production SharedPreferences Wrapper

```kotlin
import android.content.Context
import android.content.SharedPreferences

class UserPreferencesManager(context: Context) {

    private val prefs: SharedPreferences = 
        context.getSharedPreferences("user_settings", Context.MODE_PRIVATE)

    fun saveAuthToken(token: String) {
        prefs.edit().putString("KEY_AUTH_TOKEN", token).apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString("KEY_AUTH_TOKEN", null)
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why can `SharedPreferences.apply()` cause ANR (Application Not Responding) crashes?
Although `apply()` updates in-memory state asynchronously, Android's `ActivityThread` waits for pending `apply()` disk writes to finish during `onStop()` / `onDestroy()`, which can block the UI thread during activity navigation.

### Q2: Why is `SharedPreferences` insecure for sensitive user credentials?
SharedPreferences stores key-value pairs as unencrypted, plain-text XML files in the app's internal data directory. Rooted devices can read these files directly. Use `EncryptedSharedPreferences` or Jetpack DataStore instead.

### Q3: Why shouldn't large data structures be stored in SharedPreferences?
SharedPreferences parses the entire XML file into memory upon initialization. Large objects cause high memory allocation overhead and long initialization delays.

### Q4: What replaces SharedPreferences in modern Jetpack apps?
Google recommends **Jetpack DataStore** (Preferences DataStore or Proto DataStore).

### Q5: How do you listen for SharedPreferences key updates?
Register an `OnSharedPreferenceChangeListener` via `registerOnSharedPreferenceChangeListener()`.
"""

# 10. STORAGE-DATASTORE
datastore_md = r"""# Comprehensive Guide to Jetpack DataStore in Android: Preferences & Proto DataStore

**Jetpack DataStore** is Google's modern data storage solution designed to replace legacy `SharedPreferences`. Built asynchronously using Kotlin Coroutines and Flows, DataStore resolves all threading pitfalls, guarantees transactional consistency, and provides robust migration paths.

---

## 1. Preferences DataStore vs Proto DataStore

| Feature | Preferences DataStore | Proto DataStore |
| :--- | :--- | :--- |
| **Schema Definition** | Key-Value Pairs (No pre-defined schema) | Typed Schema defined via Protocol Buffers |
| **Type Safety** | Moderate (String/Int keys) | Full Type Safety (Generated Kotlin/Java classes) |
| **Serialization** | Key-Value primitive mapping | Protocol Buffers (Binary Serialization) |
| **Performance** | High | Maximum (Fast binary parsing) |

---

## 2. Production Preferences DataStore Implementation

```kotlin
import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

class UserSettingsRepository(private val context: Context) {

    private object PreferencesKeys {
        val USER_NAME = stringPreferencesKey("user_name")
        val IS_NIGHT_MODE = booleanPreferencesKey("is_night_mode")
    }

    // Expose settings as Kotlin Flow
    val userNameFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[PreferencesKeys.USER_NAME] ?: "Guest"
    }

    suspend fun updateUserName(name: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.USER_NAME] = name
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Jetpack DataStore prevent UI thread blocking?
DataStore handles all disk I/O operations asynchronously using Kotlin Coroutines on `Dispatchers.IO`, ensuring the Main UI thread is never blocked.

### Q2: How do you migrate legacy SharedPreferences to DataStore?
Pass `SharedPreferencesMigration(context, "legacy_prefs_name")` into the DataStore initialization builder.

### Q3: What happens if a DataStore file suffers corruption?
DataStore provides a `CorruptionHandler` interface that detects parsing errors and resets preferences to default values safely.

### Q4: Why is Proto DataStore preferred for complex data models?
Proto DataStore uses Protocol Buffers to enforce strict compile-time type safety, offering faster binary serialization and eliminating key string typos.

### Q5: Can DataStore be safely accessed across multiple processes?
Standard DataStore is single-process safe. For multi-process applications, use `MultiProcessDataStoreFactory`.
"""

inject_into_de_blog_data('di-dagger', dagger_md)
inject_into_de_blog_data('di-hilt', hilt_md)
inject_into_de_blog_data('di-koin', koin_md)
inject_into_de_blog_data('storage-shared-preferences', prefs_md)
inject_into_de_blog_data('storage-datastore', datastore_md)

print("Batch 2 Part 3 (Dagger, Hilt, Koin, Prefs, DataStore) Injected!")
