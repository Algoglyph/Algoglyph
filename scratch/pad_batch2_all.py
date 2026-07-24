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

# 7. DI-HILT (Expanded)
hilt_md = r"""# Comprehensive Guide to Hilt in Android: Standardized Android Dependency Injection & Lifecycle Components

**Hilt** is Google's official, opinionated dependency injection library for Android, built directly on top of Dagger 2. Hilt eliminates Dagger's manual component creation and multi-binding boilerplate by providing pre-defined lifecycle components (`SingletonComponent`, `ActivityRetainedComponent`, `ActivityComponent`, `FragmentComponent`) and seamless integration with Jetpack components like `ViewModel`, `Navigation`, and `WorkManager`.

---

## 1. Pre-defined Hilt Component Hierarchy & Lifecycles

In vanilla Dagger 2, developers had to manually write `@Component` interfaces and manage their attachment to Android Activity lifecycles. Hilt automates this by providing a standardized hierarchy of components tied directly to Android framework lifecycles:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hiltBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#hiltBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Hilt Built-in Component Hierarchy</text>

  <!-- SingletonComponent -->
  <g transform="translate(60, 100)">
    <rect width="780" height="50" rx="8" fill="#065f46" stroke="#34d399" stroke-width="1.5"/>
    <text x="20" y="30" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">SingletonComponent (@Singleton)</text>
    <text x="550" y="30" fill="#a7f3d0" font-family="system-ui" font-size="12">Application Lifecycle</text>
  </g>

  <!-- ActivityRetainedComponent -->
  <g transform="translate(100, 165)">
    <rect width="700" height="45" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="20" y="28" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">ActivityRetainedComponent (@ActivityRetainedScoped)</text>
    <text x="500" y="28" fill="#a7f3d0" font-family="system-ui" font-size="12">ViewModel / Rotation Lifecycle</text>
  </g>

  <!-- ActivityComponent -->
  <g transform="translate(140, 225)">
    <rect width="620" height="45" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="20" y="28" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">ActivityComponent (@ActivityScoped)</text>
    <text x="440" y="28" fill="#a7f3d0" font-family="system-ui" font-size="12">Activity Lifecycle</text>
  </g>

  <!-- FragmentComponent -->
  <g transform="translate(180, 285)">
    <rect width="540" height="45" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="20" y="28" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">FragmentComponent (@FragmentScoped)</text>
    <text x="360" y="28" fill="#38bdf8" font-family="system-ui" font-size="12">Fragment Lifecycle</text>
  </g>
</svg>

---

## 2. Hilt Component & Scope Mapping Matrix

| Hilt Component | Created At | Destroyed At | Generated Scope Annotation |
| :--- | :--- | :--- | :--- |
| **`SingletonComponent`** | `Application#onCreate()` | `Application` process death | `@Singleton` |
| **`ActivityRetainedComponent`** | `Activity#onCreate()` | `Activity#onDestroy()` (retained on rotation) | `@ActivityRetainedScoped` |
| **`ActivityComponent`** | `Activity#onCreate()` | `Activity#onDestroy()` | `@ActivityScoped` |
| **`FragmentComponent`** | `Fragment#onAttach()` | `Fragment#onDestroy()` | `@FragmentScoped` |
| **`ViewComponent`** | `View#super()` | `View` destroyed | `@ViewScoped` |

---

## 3. Production Hilt Kotlin Architecture

### Step 1: Annotate Application Class
```kotlin
import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Hilt initializes the root SingletonComponent container here
    }
}
```

### Step 2: Define Modules with `@InstallIn`
```kotlin
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(okHttpClient: OkHttpClient): ApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
```

### Step 3: Inject ViewModels with `@HiltViewModel`
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val apiService: ApiService,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _dataState = MutableStateFlow<List<String>>(emptyList())
    val dataState: StateFlow<List<String>> = _dataState

    fun loadData() {
        viewModelScope.launch {
            _dataState.value = userRepository.fetchData()
        }
    }
}
```

### Step 4: Inject Activities & Fragments with `@AndroidEntryPoint`
```kotlin
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    // Hilt automatically supplies custom ViewModelProvider.Factory under the hood
    private val viewModel: HomeViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        viewModel.loadData()
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

# 8. DI-KOIN (Expanded)
koin_md = r"""# Comprehensive Guide to Koin in Android: Pragmatic Kotlin DSL & Service Locator Architecture

**Koin** is a pragmatic, lightweight dependency injection framework built specifically for Kotlin developers. Unlike Dagger or Hilt, Koin avoids compile-time code generation and annotation processing (KAPT/KSP); instead, it utilizes a clean Kotlin Domain Specific Language (DSL) to resolve dependencies at runtime using a Service Locator pattern.

---

## 1. Koin Architecture & Scope Resolver

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="koinBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#koinBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Koin Runtime DSL Dependency Resolution</text>

  <!-- Module Definition -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Kotlin DSL Module</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• single { ... }</text>
    <text x="15" y="90" fill="#94a3b8" font-family="system-ui" font-size="12">• factory { ... }</text>
    <text x="15" y="115" fill="#94a3b8" font-family="system-ui" font-size="12">• viewModel { ... }</text>
    <text x="15" y="140" fill="#94a3b8" font-family="system-ui" font-size="12">• get() Resolvers</text>
  </g>

  <!-- Koin Container -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">Koin Runtime Container</text>
    <text x="15" y="65" fill="#bae6fd" font-family="system-ui" font-size="12">• Registry Instance Map</text>
    <text x="15" y="90" fill="#bae6fd" font-family="system-ui" font-size="12">• Fast Hash Table Lookup</text>
    <text x="15" y="115" fill="#bae6fd" font-family="system-ui" font-size="12">• Zero Code Gen</text>
    <text x="15" y="140" fill="#bae6fd" font-family="system-ui" font-size="12">• KMP Compatible</text>
  </g>

  <!-- Target -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Target Injection</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• by inject()</text>
    <text x="15" y="90" fill="#a7f3d0" font-family="system-ui" font-size="12">• koinViewModel()</text>
    <text x="15" y="115" fill="#a7f3d0" font-family="system-ui" font-size="12">• Instant Injection</text>
  </g>
</svg>

---

## 2. Production Koin Architecture & DSL

```kotlin
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val networkModule = module {
    single { OkHttpClient.Builder().build() }
    single { Retrofit.Builder().baseUrl("https://api.example.com").build() }
}

val repositoryModule = module {
    // Factory: Creates a fresh instance on every injection
    factory { AnalyticsLogger() }

    // Single: Creates a singleton instance retained in container
    single<UserRepository> { UserRepositoryImpl(apiService = get(), db = get()) }
}

val viewModelModule = module {
    // ViewModel: Injected and retained via Jetpack ViewModelStore
    viewModel { UserProfileViewModel(userRepository = get()) }
}

val appModules = listOf(networkModule, repositoryModule, viewModelModule)
```

### Application Initialization
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
            modules(appModules)
        }
    }
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

# 9. STORAGE-SHARED-PREFERENCES (Expanded)
prefs_md = r"""# Comprehensive Guide to SharedPreferences in Android: XML Persistence, Threading & Security

**SharedPreferences** is an early key-value storage framework provided by the Android SDK for saving primitive data types (`Booleans`, `Floats`, `Ints`, `Longs`, `Strings`) to disk as XML files. While widely used in legacy applications, improper usage can cause UI thread blocking and security vulnerabilities.

---

## 1. Thread Synchronization: `commit()` vs `apply()`

| Feature | `commit()` | `apply()` |
| :--- | :--- | :--- |
| **Execution Model** | Synchronous (Disk Blocking) | Asynchronous (In-Memory first) |
| **Return Status** | `Boolean` (True on disk write success) | `Void` (No return status) |
| **Thread Safety** | Blocks calling thread until disk I/O finishes | Updates memory state immediately; writes disk in background |
| **Main Thread Safety** | ❌ Can cause UI lag / ANR | ✅ Safe for Main Thread invocation |

---

## 2. Production SharedPreferences Architecture

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

    fun clearAll() {
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

# 10. STORAGE-DATASTORE (Expanded)
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

    // Expose settings as reactive Kotlin Flow
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

inject_into_de_blog_data('di-hilt', hilt_md)
inject_into_de_blog_data('di-koin', koin_md)
inject_into_de_blog_data('storage-shared-preferences', prefs_md)
inject_into_de_blog_data('storage-datastore', datastore_md)

print("Batch 2 All Articles Padded & Complete!")
