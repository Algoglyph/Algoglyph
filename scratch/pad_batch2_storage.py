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

# 9. STORAGE-SHARED-PREFERENCES (Fully Expanded)
prefs_md = r"""# Comprehensive Guide to SharedPreferences in Android: XML Persistence, Threading & Security Pitfalls

**SharedPreferences** is an early key-value storage framework provided by the Android SDK for saving primitive data types (`Booleans`, `Floats`, `Ints`, `Longs`, `Strings`) to disk as XML files. While widely used in legacy applications, improper usage can cause UI thread blocking, ANR (Application Not Responding) crashes, and memory leaks.

---

## 1. Storage Architecture & Execution Model

SharedPreferences reads data from an XML file located in `/data/data/<package_name>/shared_prefs/`. Upon initialization, the entire XML file is parsed into an in-memory `HashMap`.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="prefBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#prefBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">SharedPreferences Internal Execution Architecture</text>

  <!-- Memory HashMap -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="15">In-Memory HashMap</text>
    <text x="15" y="75" fill="#fef9c3" font-family="system-ui" font-size="12">• Fast Key Lookup O(1)</text>
    <text x="15" y="105" fill="#fef9c3" font-family="system-ui" font-size="12">• Holds All App Prefs</text>
    <text x="15" y="135" fill="#fef9c3" font-family="system-ui" font-size="12">• Parsed at Init</text>
  </g>

  <!-- Commit vs Apply -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Editor API</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• commit(): Sync Disk</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• apply(): Async Disk</text>
    <text x="15" y="135" fill="#94a3b8" font-family="system-ui" font-size="12">• Updates Memory First</text>
  </g>

  <!-- XML Storage -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#fca5a5" font-family="monospace" font-weight="700" font-size="15">Disk XML File</text>
    <text x="15" y="75" fill="#f87171" font-family="system-ui" font-size="12">• Plain-Text Format</text>
    <text x="15" y="105" fill="#f87171" font-family="system-ui" font-size="12">• Readable on Root</text>
    <text x="15" y="135" fill="#f87171" font-family="system-ui" font-size="12">• Re-written on Save</text>
  </g>
</svg>

---

## 2. Thread Synchronization: `commit()` vs `apply()`

| Feature | `commit()` | `apply()` |
| :--- | :--- | :--- |
| **Execution Model** | Synchronous (Disk Blocking) | Asynchronous (In-Memory first) |
| **Return Status** | `Boolean` (True on disk write success) | `Void` (No return status) |
| **Thread Safety** | Blocks calling thread until disk I/O finishes | Updates memory state immediately; writes disk in background |
| **Main Thread Safety** | ❌ Can cause UI lag / ANR | ✅ Safe for Main Thread invocation |

---

## 3. Production SharedPreferences Wrapper

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

    fun saveUserAge(age: Int) {
        prefs.edit().putInt("KEY_USER_AGE", age).apply()
    }

    fun getUserAge(): Int {
        return prefs.getInt("KEY_USER_AGE", 18)
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

# 10. STORAGE-DATASTORE (Fully Expanded)
datastore_md = r"""# Comprehensive Guide to Jetpack DataStore in Android: Preferences & Proto DataStore

**Jetpack DataStore** is Google's modern data storage solution designed to replace legacy `SharedPreferences`. Built asynchronously using Kotlin Coroutines and Flows, DataStore resolves all threading pitfalls, guarantees transactional consistency, and provides robust migration paths.

---

## 1. Architectural Pipeline & Type Safety

DataStore operates asynchronously on background dispatchers (`Dispatchers.IO`), returning a reactive `Flow` stream of data items.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#dsBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Jetpack DataStore Flow-Based Architecture</text>

  <!-- App Code -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">UI / ViewModel</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• Observes Data Flow</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• Non-blocking Read</text>
    <text x="15" y="135" fill="#94a3b8" font-family="system-ui" font-size="12">• Dispatches Edit Job</text>
  </g>

  <!-- DataStore Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">DataStore Engine</text>
    <text x="15" y="75" fill="#bae6fd" font-family="system-ui" font-size="12">• Coroutines I/O Pool</text>
    <text x="15" y="105" fill="#bae6fd" font-family="system-ui" font-size="12">• Atomic Write Transactions</text>
    <text x="15" y="135" fill="#bae6fd" font-family="system-ui" font-size="12">• CorruptionHandler</text>
  </g>

  <!-- Disk File -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Disk Storage</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• Preferences File</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• Proto Binary Buffer</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Transaction Safety</text>
  </g>
</svg>

---

## 2. Preferences DataStore vs Proto DataStore

| Feature | Preferences DataStore | Proto DataStore |
| :--- | :--- | :--- |
| **Schema Definition** | Key-Value Pairs (No pre-defined schema) | Typed Schema defined via Protocol Buffers |
| **Type Safety** | Moderate (String/Int keys) | Full Type Safety (Generated Kotlin/Java classes) |
| **Serialization** | Key-Value primitive mapping | Protocol Buffers (Binary Serialization) |
| **Performance** | High | Maximum (Fast binary parsing) |

---

## 3. Production Preferences DataStore Implementation

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

inject_into_de_blog_data('storage-shared-preferences', prefs_md)
inject_into_de_blog_data('storage-datastore', datastore_md)

print("Batch 2 Storage Articles Fully Padded!")
