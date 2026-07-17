# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 6 articles

ANDROID_BATCH6_ARTICLES = [
    {
        "slug": "android-coroutines-flow",
        "title": "Kotlin Cold Flow Streams",
        "tagline": "Configure cold asynchronous streams, apply intermediate map/filter operators, and collect values.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-coroutines"],
        "related": ["android-coroutines-sharedflow"],
        "practiceProblems": [],
        "markdown": """# Kotlin Cold Flow Streams

When retrieving values asynchronously, a suspend function returns only a single value (e.g. a finished network response packet). To stream multiple values over time asynchronously (like progress percentages or continuous GPS coordinates), Kotlin provides **Flow**. Flow is a **cold stream**—the builder block does not execute or occupy memory until a terminal collector starts. This chapter covers flow builders, transformation operators, and collectors.

---

## 1. Flow Construction and Collection

A Flow pipeline consists of three stages:
1. **Producer:** Emits data elements into the stream using the `flow { ... }` builder and `emit()` method.
2. **Intermediaries:** Transform the stream using operators (like `map` or `filter`) without executing the flow.
3. **Consumer:** Collects emitted values using a terminal operator (like `collect`). This triggers the producer block to start executing.

---

## 2. Cold Flow Lifecycle Pipeline

Because Flows are cold, adding intermediate operators does not trigger execution. The entire pipeline remains dormant until `collect` is called:

### Flow Processing Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Cold Flow Emission Pipeline</text>

  {/* Producer */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Producer</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">flow { emit(x) }</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Dormant initially</text>
  </g>

  {/* Intermediaries */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Operators</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">.filter { x > 2 }</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Lazy configuration</text>
  </g>

  {/* Consumer */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Consumer</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">.collect { }</text>
    <text x="65" y="70" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Triggers execution!</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#fl-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#fl-arrow)"/>

  <defs>
    <marker id="fl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Suspend Function | Kotlin Flow |
| :--- | :--- | :--- |
| **Return Quantity** | Single value ($T$) | Multiple values stream ($Flow<T>$) |
| **Execution Model** | Active execution | Cold (lazy execution) |
| **Thread Switching** | `withContext` | `.flowOn` operator |
| **Cancellation** | Checked at suspension points | Checked at emission points |

---

## 4. Kotlin Flow Implementation Example

Below is a Kotlin program demonstrating how to build, transform, and collect a cold flow of data:

```kotlin
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.runBlocking

// 1. Build a cold flow emitting values
fun getCountdownFlow(start: Int): Flow<Int> = flow {
    var count = start
    while (count > 0) {
        delay(500) // Simulate delay
        emit(count) // Emit value
        count--
    }
}

fun main() = runBlocking {
    val countdown = getCountdownFlow(5)

    // 2. Transform values using lazy operators
    val formattedCountdown = countdown
        .filter { it % 2 != 0 } // Keep only odd values
        .map { "Count: $it" }

    // 3. Collect triggers execution
    formattedCountdown.collect { value ->
        println(value)
    }
}
```

---

## 5. Conceptual Check Questions

1. **What makes Flow "cold" compared to other streaming libraries?**
   *Answer:* A Flow does not execute its producer block or emit any values until a terminal operator (like `collect`) is called. Each call to `collect` starts a fresh execution of the flow.

2. **How does flowOn() differ from withContext() inside a Flow?**
   *Answer:* `withContext` is used to switch threads inside a block of code. In contrast, `flowOn(Dispatchers.IO)` switches the execution thread for the *upstream* elements of the Flow pipeline, keeping downstream collection on the collector's thread.
""",
        "content": {
            "introduction": "Flow streams multiple values asynchronously, acting as a cold stream that runs only when a terminal collector is called.",
            "whyImportant": "Streaming database updates or download progress bars requires using asynchronous Flow structures.",
            "realWorldApps": ["Emitting progress percentages during file downloads.", "Streaming real-time database changes from local caches to views."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-coroutines-sharedflow",
        "title": "StateFlow & SharedFlow",
        "tagline": "Master hot streams, coordinate StateFlow state holders, and broadcast event streams using SharedFlow.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-coroutines-flow"],
        "related": ["compose-viewmodel-state"],
        "practiceProblems": [],
        "markdown": """# StateFlow & SharedFlow

While standard `Flow` is a cold stream, architecture layers (like ViewModels) require **hot streams** that exist independently of subscribers. These hot streams can broadcast values to multiple observers simultaneously. In Kotlin, this is managed by **StateFlow** and **SharedFlow**. This chapter covers state holders, event broadcasters, and flow collection.

---

## 1. Hot Streams: StateFlow vs. SharedFlow

* **`StateFlow`:** A state-holder observable flow that emits the current state to new collectors immediately. It requires an initial value, stores only the latest value (conflated), and is ideal for maintaining UI states.
* **`SharedFlow`:** A highly configurable event broadcaster. It does not require an initial value, does not store values (unless configured with a replay cache), and is ideal for one-time events (like navigation clicks or snackbar messages).

---

## 2. Emission Models comparison

### StateFlow vs. SharedFlow Structures
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">StateFlow vs. SharedFlow Models</text>

  {/* StateFlow (Cache Box) */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">StateFlow (State Holder)</text>
    
    <rect x="25" y="45" width="130" height="30" fill="#111" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="63" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Cache Value: "Active"</text>
    <text x="15" y="105" fill="#94a3b8" font-size="6" font-family="monospace">Emits current value on connect</text>
  </g>

  {/* SharedFlow (Broadcaster) */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">SharedFlow (Events)</text>
    
    <circle cx="50" cy="65" r="8" fill="#f59e0b"/>
    <circle cx="90" cy="65" r="8" fill="#f59e0b"/>
    <circle cx="130" cy="65" r="8" fill="#f59e0b"/>
    <text x="90" y="90" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Broadcast Packets</text>
    <text x="15" y="105" fill="#94a3b8" font-size="6" font-family="monospace">No initial cache. Events skip</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | StateFlow | SharedFlow |
| :--- | :--- | :--- |
| **Initial Value** | Required | None |
| **Value History** | Cache size of 1 (latest value only) | Configurable replay cache |
| **Duplicate Values**| Conflated (consecutive duplicates are ignored)| All emissions are broadcast |
| **Best For** | Screen UI state | Actions, alerts, navigations |

---

## 4. Kotlin Hot Flows Example

Below is a Kotlin ViewModel implementing both `StateFlow` (for UI state) and `SharedFlow` (for temporary events):

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ScreenViewModel : ViewModel() {

    // 1. StateFlow: Holds current UI state, requires initial value
    private val _uiState = MutableStateFlow("Default State")
    val uiState: StateFlow<String> = _uiState.asStateFlow()

    // 2. SharedFlow: Broadcasts one-time events, no initial value
    private val _events = MutableSharedFlow<String>()
    val events: SharedFlow<String> = _events.asSharedFlow()

    fun triggerStateUpdate(newState: String) {
        _uiState.value = newState
    }

    fun dispatchNavigationAlert(screenRoute: String) {
        viewModelScope.launch {
            // Emits temporary navigation event to collectors
            _events.emit(screenRoute)
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does StateFlow ignore consecutive duplicate emissions?**
   *Answer:* StateFlow uses equality checks (`equals()`) to conflate emissions. If the new value is equal to the current value, it skips emission to prevent redundant UI recompositions.

2. **What does stateIn() accomplish?**
   *Answer:* It is an extension operator that converts a cold Flow into a hot StateFlow inside a specified coroutine scope (typically `viewModelScope`), making cold flows reusable across multiple collectors.
""",
        "content": {
            "introduction": "StateFlow and SharedFlow act as hot observable streams, separating state preservation from dynamic action event broadcasts.",
            "whyImportant": "Preventing redundant view updates while managing one-time navigation events requires utilizing hot flows.",
            "realWorldApps": ["Exposing read-only screen states from ViewModels.", "Broadcasting toast messages or dialog alerts using SharedFlow events."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-shared-preferences",
        "title": "Legacy SharedPreferences",
        "tagline": "Configure key-value persistent storage, open XML files, and study commit vs apply operations.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-data-file-internal", "android-data-datastore"],
        "practiceProblems": [],
        "markdown": """# Legacy SharedPreferences

For simple key-value settings (like user settings, theme preferences, or session tokens), Android provides **SharedPreferences**. SharedPreferences writes data to an XML file inside the application's private storage sandbox directory. This chapter covers the preferences editor, read/write APIs, and the differences between `apply()` and `commit()`.

---

## 1. Reading and Writing Preferences

To modify SharedPreferences, you must request an instance of the editor via `edit()`, write your changes, and save them. You access stored preferences by calling getter methods directly on the SharedPreferences instance.

---

## 2. Editor Transaction Pipelines

When saving changes, you use either `commit()` or `apply()`. They use different thread execution patterns:

### Saving Transactions
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">commit() vs. apply() execution</text>

  {/* commit() Route */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="90" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">commit() (Synchronous)</text>
    <text x="15" y="60" fill="#fff" font-size="7" font-family="monospace">1. Blocks calling thread</text>
    <text x="15" y="80" fill="#fff" font-size="7" font-family="monospace">2. Writes to disk immediately</text>
    <text x="15" y="100" fill="#fca5a5" font-size="7" font-family="monospace">Risk: UI lag on Main Thread</text>
  </g>

  {/* apply() Route */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">apply() (Asynchronous)</text>
    <text x="15" y="60" fill="#fff" font-size="7" font-family="monospace">1. Updates memory cache</text>
    <text x="15" y="80" fill="#fff" font-size="7" font-family="monospace">2. Writes to disk in background</text>
    <text x="15" y="100" fill="#a7f3d0" font-size="7" font-family="monospace">Safe: Free from UI lags</text>
  </g>
</svg>

---

## 3. Comparison Table

| Save Method | Thread Behavior | Return Type | disk Write |
| :--- | :--- | :--- | :--- |
| **`commit()`** | Synchronous (blocks thread) | `Boolean` (true if successful) | Immediate |
| **`apply()`** | Asynchronous (non-blocking) | `Void` | Delayed background write |

---

## 4. Kotlin SharedPreferences Example

Below is a Kotlin helper class demonstrating how to read and write persistent settings:

```kotlin
import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {
    // 1. Get private SharedPreferences reference
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "app_settings_file", 
        Context.MODE_PRIVATE
    )

    fun saveUserLoginToken(token: String) {
        // 2. Open editor transaction
        prefs.edit().apply {
            putString("auth_token_key", token)
            // 3. apply() saves asynchronously in background thread
            apply()
        }
    }

    fun getUserLoginToken(): String {
        // 4. Read directly from local instance (defaulting to empty string)
        return prefs.getString("auth_token_key", "") ?: ""
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it recommended to use apply() instead of commit() on the Main Thread?**
   *Answer:* `commit()` writes data to the disk synchronously. Disk operations are slow and block the Main Thread, which can cause layout jank or ANR crashes. `apply()` updates the in-memory cache instantly and queues the disk write on a background thread.

2. **What does Context.MODE_PRIVATE ensure?**
   *Answer:* It restricts access to the preferences file, ensuring it can only be read or written to by the application that created it.
""",
        "content": {
            "introduction": "SharedPreferences stores key-value pairs persistently in XML files, offering commit and apply transactions.",
            "whyImportant": "Saving user settings and small flags persistently requires implementing preference managers.",
            "realWorldApps": ["Caching authentication tokens during session storage.", "Saving dark/light theme choices across application reboots."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-file-internal",
        "title": "Internal File Storage",
        "tagline": "Configure isolated private directories, read files, and manage cache files.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-data-file-external", "android-data-sqlite"],
        "practiceProblems": [],
        "markdown": """# Internal File Storage

Android applications run inside a secure sandbox. Every app is allocated a **private directory** inside the internal storage filesystem. Files saved here are isolated—other apps cannot access them, and the OS deletes them when the user uninstalls the app. This chapter covers internal directories, cache files, and file stream handling.

---

## 1. Files Directory vs. Cache Directory

Android defines two primary private directory paths:
* **`context.filesDir`:** Persistent storage directory. Used for files that must persist across app relaunches (e.g. user-generated drafts).
* **`context.cacheDir`:** Temporary cache directory. The operating system may automatically delete files here if the device runs low on storage. You should keep this directory below a strict limit (e.g., `1MB`).

---

## 2. Directory Sandbox Model

### Secure App Sandbox
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Private App Sandbox File Scope</text>

  {/* Sandbox Boundary */}
  <g transform="translate(150, 45)">
    <rect width="300" height="160" fill="#111" rx="4" stroke="#475569" stroke-width="2"/>
    <text x="150" y="25" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle">Private Directory (data/data/app_package/)</text>

    {/* filesDir */}
    <rect x="20" y="50" width="115" height="80" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="77" y="75" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle">filesDir</text>
    <text x="77" y="95" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Persistent Drafts</text>

    {/* cacheDir */}
    <rect x="165" y="50" width="115" height="80" fill="#1c1917" rx="2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="222" y="75" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle">cacheDir</text>
    <text x="222" y="95" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Temporary Cache</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Directory | Persistence | System Cleanup | Best For |
| :--- | :--- | :--- | :--- |
| **`filesDir`** | Permanent until uninstall | No | Text logs, local database files, user data |
| **`cacheDir`** | Temporary | Yes (automatic if disk space is low) | Downloaded avatar images, temporary cache |

---

## 4. Kotlin Internal Storage Example

Below is a Kotlin class demonstrating how to write and read text files in internal storage:

```kotlin
import android.content.Context
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

class InternalStorageManager(private val context: Context) {

    fun writeTextToFile(filename: String, content: String) {
        // 1. Create file reference relative to private filesDir path
        val targetFile = File(context.filesDir, filename)
        
        // 2. Open output stream to write bytes
        FileOutputStream(targetFile).use { stream ->
            stream.write(content.toByteArray())
        }
    }

    fun readTextFromFile(filename: String): String {
        val targetFile = File(context.filesDir, filename)
        if (!targetFile.exists()) return ""

        // 3. Open input stream to read bytes
        return FileInputStream(targetFile).bufferedReader().use { reader ->
            reader.readText()
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Do you need runtime storage permissions to write files inside filesDir?**
   *Answer:* No. Applications have full read and write permissions inside their own private sandbox folders. No permissions need to be declared in the Manifest.

2. **What happens to files inside filesDir when an app is uninstalled?**
   *Answer:* The OS completely deletes the app's entire sandbox directory (including `filesDir` and `cacheDir`), removing all files associated with the application.
""",
        "content": {
            "introduction": "Internal storage provides isolated directories for app files, keeping data secure inside a sandbox.",
            "whyImportant": "Saving private data structures and caching media safely requires utilizing internal storage APIs.",
            "realWorldApps": ["Saving local user profile details offline.", "Caching downloaded images inside cache directories to prevent redundant network usage."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-file-external",
        "title": "External Shared Storage",
        "tagline": "Configure shared file permissions, request directory access, and utilize Scoped Storage.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-data-file-internal"],
        "related": ["android-data-sqlite"],
        "practiceProblems": [],
        "markdown": """# External Shared Storage

While internal storage is perfect for private files, apps also need to store files that are accessible to other apps or the user directly (like downloaded photos or shared documents). This is managed by **External Storage**. To protect user privacy, modern Android versions enforce **Scoped Storage**. This chapter covers Scoped Storage guidelines, permissions, and directory access.

---

## 1. Scoped Storage Guidelines

Starting with Android 10 (API 29), the OS introduced **Scoped Storage** to restrict wide access to external storage:
* **Private Scopes:** Apps have unrestricted access to their own external directory (`getExternalFilesDir()`).
* **Shared Collections:** To save files globally (like in the Downloads, Pictures, or Music directories), apps must use the **MediaStore API**.
* **Direct File Access:** To access arbitrary folders, the app must request permission from the user via the **Storage Access Framework (SAF)** picker.

---

## 2. Storage Access Scope Rings

### Scoped Storage Rings
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">External Storage Access Boundaries</text>

  {/* Outer Ring: Shared SAF */}
  <circle cx="300" cy="130" r="90" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
  <text x="300" y="55" fill="#fca5a5" font-size="6" font-family="monospace" text-anchor="middle">Public Storage (Requires SAF picker)</text>

  {/* Middle Ring: MediaStore */}
  <circle cx="300" cy="130" r="60" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="300" y="85" fill="#93c5fd" font-size="6" font-family="monospace" text-anchor="middle">MediaStore (Shared Media)</text>

  {/* Inner Ring: Private App Folder */}
  <circle cx="300" cy="130" r="30" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="300" y="133" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Private</text>
</svg>

---

## 3. Comparison Matrix

| Storage Category | Access API | Requires Manifest Permission? | survives Uninstall? |
| :--- | :--- | :--- | :--- |
| **Private External** | `getExternalFilesDir()` | No | No |
| **Shared Media** | `MediaStore` | No (for adding own items) | Yes |
| **Public Arbitrary** | `Storage Access Framework` | No (user chooses via UI) | Yes |

---

## 4. Kotlin MediaStore Injection Example

Below is a Kotlin program demonstrating how to save an image file into the shared Pictures directory using the MediaStore API:

```kotlin
import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import java.io.OutputStream

class ExternalStorageManager(private val context: Context) {

    fun saveImageToSharedFolder(filename: String, imageData: ByteArray): Uri? {
        val resolver = context.contentResolver

        // 1. Configure metadata keys for MediaStore
        val imageDetails = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
            // Target public Pictures directory
            put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/MyApplication")
        }

        // 2. Insert metadata to retrieve target URI
        val contentUri = resolver.insert(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI, 
            imageDetails
        )

        // 3. Write binary data into content stream
        contentUri?.let { uri ->
            resolver.openOutputStream(uri)?.use { stream ->
                stream.write(imageData)
            }
        }
        return contentUri
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why was Scoped Storage introduced to replace legacy storage permissions?**
   *Answer:* Historically, requesting `READ_EXTERNAL_STORAGE` gave an app read access to the user's entire external storage (including private files belonging to other apps). Scoped Storage protects user privacy by isolating app files and requiring explicit permission for shared folders.

2. **Can you read a file saved by another app inside the Downloads directory?**
   *Answer:* Yes, but you cannot access it directly using standard File paths. You must query it through the `MediaStore` API or prompt the user to select the file using the Storage Access Framework (SAF) document picker.
""",
        "content": {
            "introduction": "External shared storage manages public file storage, enforcing Scoped Storage guidelines and MediaStore APIs to safeguard user files.",
            "whyImportant": "Saving photos or shared files without violating Android privacy guidelines requires using Scoped Storage.",
            "realWorldApps": ["Saving camera photos directly to the system gallery.", "Exporting spreadsheet files to the Downloads folder using SAF."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-sqlite",
        "title": "SQLite Databases",
        "tagline": "Configure SQLiteOpenHelpers, execute raw queries, and parse database results using cursors.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-data-room"],
        "practiceProblems": [],
        "markdown": """# SQLite Databases

For structured local data storage (like tables of contacts or user logs), Android includes support for the **SQLite** database engine. At the framework level, you manage databases using **SQLiteOpenHelper** and read data using **Cursors**. This chapter covers table creation, database updates, raw queries, and cursor traversal.

---

## 1. SQLiteOpenHelper Lifecycle

To manage database creation and schema version updates, you extend `SQLiteOpenHelper`:
* **`onCreate():`** Called when the database is created for the first time. This is where you run your `CREATE TABLE` SQL statements.
* **`onUpgrade():`** Called when the schema version increases. This is where you run migration scripts (like dropping or altering tables).

---

## 2. Cursor Data Extraction Loop

When you run a query using raw SQL (`rawQuery`), it returns a **Cursor**. A Cursor is a pointer to the query result set. You traverse the rows by calling `moveToNext()` in a loop:

### Cursor Iteration Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">SQLite Cursor Loop</text>

  {/* Database Table */}
  <g transform="translate(40, 60)">
    <rect width="140" height="120" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="70" y="20" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">Database Table</text>
    
    <rect x="10" y="35" width="120" height="20" fill="#111" stroke="#3b82f6" stroke-width="1"/>
    <text x="70" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Row 0: User A</text>

    <rect x="10" y="60" width="120" height="20" fill="#111" stroke="#3b82f6" stroke-width="1"/>
    <text x="70" y="72" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Row 1: User B</text>

    <rect x="10" y="85" width="120" height="20" fill="#111" stroke="#3b82f6" stroke-width="1"/>
    <text x="70" y="97" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Row 2: User C</text>
  </g>

  {/* Cursor Pointer */}
  <g transform="translate(230, 80)">
    <rect width="140" height="80" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">cursor.moveToNext()</text>
    <text x="70" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Reads column data</text>
    <text x="70" y="62" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">cursor.close() on complete</text>
  </g>

  {/* Output Entities */}
  <g transform="translate(430, 95)">
    <rect width="130" height="50" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="28" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">Kotlin Entities</text>
  </g>

  {/* Connections */}
  <path d="M 180,120 L 230,120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#sq-arrow)"/>
  <path d="M 370,120 L 430,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#sq-arrow)"/>

  <defs>
    <marker id="sq-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Query Execution Method | Returns | Transaction support? | Performance |
| :--- | :--- | :--- | :--- |
| **`db.rawQuery(sql)`** | `Cursor` pointer | Yes | Fast, but requires manual parsing |
| **`db.insert(table, ...)`** | Row ID (`Long`) | Yes | Safe, auto-compiles insert statements |

---

## 4. SQLiteOpenHelper Code Example

Below is a Kotlin helper class demonstrating how to manage database schemas and queries using SQLite:

```kotlin
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class UserDbHelper(context: Context) : SQLiteOpenHelper(context, "users.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase) {
        // 1. Execute table creation query
        db.execSQL(
            "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS users")
        onCreate(db)
    }

    fun getAllUsernames(): List<String> {
        val usernames = mutableListOf<String>()
        val db = this.readableDatabase
        
        // 2. Query database and retrieve Cursor reference
        val cursor = db.rawQuery("SELECT name FROM users", null)
        
        // 3. Loop through cursor rows to extract column data
        cursor.use { c ->
            while (c.moveToNext()) {
                val index = c.getColumnIndexOrThrow("name")
                usernames.add(c.getString(index))
            }
        } // cursor.use automatically closes the cursor
        return usernames
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it critical to close Cursors using a try-with-resources or use block?**
   *Answer:* Cursors reference native database connection objects. Failing to close them keeps native memory allocations open, leading to memory leaks and sqlite transaction locks.

2. **How does SQL injection occur in rawQuery?**
   *Answer:* If you build SQL strings using concatenation (e.g. `"SELECT * FROM users WHERE name = '" + input + "'"`), a user can inject malicious SQL commands. To prevent this, use selection arguments (using `?` placeholders) to sanitize inputs.
""",
        "content": {
            "introduction": "SQLite manages local relational databases in Android, relying on SQLiteOpenHelpers and Cursor loops to query data.",
            "whyImportant": "Maintaining legacy SQL schemas and executing raw database queries requires understanding SQLite helper lifecycles.",
            "realWorldApps": ["Querying off-line system catalogs inside legacy apps.", "Migrating local database schemas using onUpgrade transactions."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-room",
        "title": "Room ORM Library",
        "tagline": "Configure database schemas, design DAO interfaces, and write compiled SQLite queries.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-data-sqlite"],
        "related": ["android-data-datastore"],
        "practiceProblems": [],
        "markdown": """# Room ORM Library

While raw SQLite is powerful, writing SQL queries manually is error-prone. You must write significant boilerplate code to convert cursors to data classes, and the compiler cannot verify SQL queries at compile time. To resolve these challenges, Android recommends **Room**. Room is an Object Relational Mapping (ORM) library that acts as an abstraction layer over SQLite. This chapter covers Entities, DAOs, and database configurations.

---

## 1. Room Architecture Components

Room uses three primary annotations to build databases:

* **`@Entity`:** Annotates data classes to define database tables. Each field represents a column, and you must define a `@PrimaryKey`.
* **`@Dao` (Data Access Object):** Defines the interface for querying the database. You define methods (like `@Insert` or `@Query`) here, and Room generates the implementation.
* **`@Database`:** The main entry point. It defines the database configuration, lists the entities, and provides access to the DAOs.

---

## 2. Room Data Mapping Model

Room translates data classes into database rows, and query results back into data classes automatically:

### ORM Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Room ORM Pipeline</text>

  {/* Kotlin Object */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Kotlin Entity</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">@Entity class User</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">id: Int, name: String</text>
  </g>

  {/* DAO Interface */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">DAO Interface</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">@Query("SELECT...")</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">fun getUsers()</text>
  </g>

  {/* SQLite Database */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">SQLite DB</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Tables: User</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">Columns: id, name</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#rm-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#rm-arrow)"/>

  <defs>
    <marker id="rm-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Raw SQLite | Room ORM Library |
| :--- | :--- | :--- |
| **SQL Verification** | Runtime only (throws crash on execution) | Compile-time check (fails build if syntax is wrong) |
| **Data Parsing** | Manual Cursor extraction loop | Automatic mapping to Kotlin data classes |
| **Reactive Streams** | Requires manual content observers | Native support for Flow and LiveData |

---

## 4. Room Implementation Example

Below is a Kotlin code block demonstrating Room entities, DAO interfaces, and database configurations:

```kotlin
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// 1. Define Entity
@Entity(tableName = "users_table")
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String
)

// 2. Define Data Access Object
@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    // Room compiles and verifies this query at build time
    @Query("SELECT * FROM users_table")
    fun observeAllUsers(): Flow<List<UserEntity>>
}

// 3. Define Database Config
@Database(entities = [UserEntity::class], version = 1, exportSchema = false)
abstract class AppRoomDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

---

## 5. Conceptual Check Questions

1. **Why does Room fail the project build if you make a typo in a DAO query string?**
   *Answer:* During compilation, Room runs an annotation processor that parses your DAO interface methods and validates your SQL queries against the schema definitions, catching syntax errors before the app runs.

2. **Can you query a Room database on the Main Thread?**
   *Answer:* No. By default, Room throws an exception if you attempt a database query on the Main Thread to prevent UI lag. You must mark queries as `suspend` functions or return reactive Streams (like Flow).
""",
        "content": {
            "introduction": "Room abstracts raw SQLite databases, verifying SQL queries at compile time and mapping tables directly to Kotlin entities.",
            "whyImportant": "Writing type-safe, compiled database logic without boilerplate cursor loops requires using Room.",
            "realWorldApps": ["Caching server news feeds locally to display offline.", "Creating database tables with reactive flow queries."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-data-datastore",
        "title": "Jetpack DataStore Preferences",
        "tagline": "Configure asynchronous preference datastores, define keys, and collect configurations.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-data-shared-preferences"],
        "related": ["android-data-room"],
        "practiceProblems": [],
        "markdown": """# Jetpack DataStore Preferences

For key-value settings, Android deprecated SharedPreferences in favor of **Jetpack DataStore**. DataStore uses Kotlin Coroutines and Flow to store data asynchronously, resolving the UI thread blocking issues of SharedPreferences. This chapter covers the Preferences DataStore, asynchronous read/write operations, and key declarations.

---

## 1. Preferences DataStore Foundations

Unlike SharedPreferences, which can block the Main Thread during disk writes, DataStore:
* **Async Operations:** Uses Kotlin Flows to expose values, ensuring reads and writes occur asynchronously.
* **Thread Safety:** Uses `Dispatchers.IO` under the hood to perform disk operations safely off the Main Thread.
* **Data Consistency:** Implements a transactional API to prevent corrupted preferences files.

---

## 2. DataStore Event Loop

### Non-Blocking Config Flows
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">DataStore Non-Blocking Queue</text>

  {/* UI Page */}
  <g transform="translate(40, 75)">
    <rect width="100" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="50" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">UI Screen</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Collect Flow</text>
  </g>

  {/* DataStore Transaction */}
  <g transform="translate(190, 65)">
    <rect width="200" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="100" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">DataStore Manager</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">edit { prefs -> ... }</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Asynchronous disk I/O</text>
  </g>

  {/* Disk Storage */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Disk Storage</text>
    <text x="60" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Protobuf file</text>
  </g>

  {/* Connections */}
  <path d="M 140,120 L 190,120" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 390,120 L 440,120" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | SharedPreferences | Preferences DataStore |
| :--- | :--- | :--- |
| **API Model** | Synchronous and Asynchronous | Asynchronous only (Coroutines Flow) |
| **Main Thread Safety**| Poor (`commit()` blocks UI thread) | Safe (disk writes run on `Dispatchers.IO`) |
| **Error Handling** | Throws uncaught runtime exceptions | Exposes `IOException` catches in flows |
| **File Format** | XML flat files | Protocol Buffer binary |

---

## 4. Kotlin DataStore Example

Below is a Kotlin manager implementing DataStore Preferences to save and read theme configuration options:

```kotlin
import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.io.IOException

// 1. Instantiate DataStore property delegate
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_settings")

class UserSettings(private val context: Context) {

    // 2. Define typesafe Preference Key
    companion object {
        val DARK_MODE_KEY = booleanPreferencesKey("dark_mode_enabled")
    }

    // 3. Read value as flow stream
    val isDarkModeEnabled: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[DARK_MODE_KEY] ?: false
        }

    // 4. Update preference asynchronously
    suspend fun setDarkMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[DARK_MODE_KEY] = enabled
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does DataStore resolve the runtime exception crashes of SharedPreferences?**
   *Answer:* SharedPreferences throws uncaught exceptions when parsing invalid types or during disk errors. DataStore models data retrieval using Flows, allowing you to catch I/O errors using standard coroutine operators like `catch()`.

2. **What is the difference between Preferences DataStore and Proto DataStore?**
   *Answer:* Preferences DataStore uses key-value pairs (like SharedPreferences). Proto DataStore stores custom data structures using Protocol Buffers, providing compile-time type safety for complex configurations.
""",
        "content": {
            "introduction": "Jetpack DataStore replaces legacy SharedPreferences, providing an asynchronous, coroutine-based key-value storage solution.",
            "whyImportant": "Avoiding main thread blocks when saving user preferences requires using DataStore.",
            "realWorldApps": ["Saving local feature flags asynchronously.", "Caching user setting preferences using Flow properties."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-net-http-connection",
        "title": "HttpURLConnection Networking",
        "tagline": "Configure HTTP headers, read response streams, and manage socket connections.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-thread-basics"],
        "related": ["android-net-okhttp", "android-net-retrofit"],
        "practiceProblems": [],
        "markdown": """# HttpURLConnection Networking

To retrieve updates and sync with server endpoints, Android apps use HTTP network clients. The built-in framework class for making HTTP requests is **HttpURLConnection**. Although lower-level than modern libraries, understanding it is critical to learn how network sockets, headers, and input streams operate. This chapter covers headers, input streams, and connection recycling.

---

## 1. Connection Lifecycle

An HTTP request using `HttpURLConnection` flows through the following steps:
1. **Instantiation:** Create a `URL` object and call `openConnection()` to retrieve an `HttpURLConnection` instance.
2. **Configuration:** Set connection properties (e.g. `requestMethod`, `connectTimeout`, request headers).
3. **Execution:** Calling `inputStream` opens the network socket, sending the request to the server.
4. **Stream Parsing:** Read the response bytes from the input stream and parse them into a string or buffer.
5. **Teardown:** Call `disconnect()` to close the socket and release resources.

---

## 2. HTTP Socket Exchange Model

### Connection Handshake
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">HttpURLConnection Flow</text>

  {/* Client */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Android Client</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">openConnection()</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">reads InputStream</text>
  </g>

  {/* Socket Pipeline */}
  <g transform="translate(220, 95)">
    <rect width="160" height="40" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 1"/>
    <text x="80" y="25" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Network Socket (TCP)</text>
  </g>

  {/* Server */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Server Node</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Response: 200 OK</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">Payload: JSON data</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 220,115" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 380,115 L 430,115" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | HttpURLConnection | Modern HTTP Libraries (OkHttp) |
| :--- | :--- | :--- |
| **Boilerplate Code** | High (manual stream conversions) | Low (automatic conversions) |
| **Connection Pooling** | Primitive | Automatic pooling and recycling |
| **HTTP/2 Support** | No (limited to HTTP/1.1) | Full support |
| **Thread Switching** | Manual | Integrated callback dispatching |

---

## 4. Kotlin HttpURLConnection Example

Below is a Kotlin program demonstrating how to make a GET request using HttpURLConnection:

```kotlin
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

fun getResponseFromUrl(urlString: String): String {
    val url = URL(urlString)
    // 1. Open connection instance
    val connection = url.openConnection() as HttpURLConnection
    
    try {
        // 2. Configure request parameters
        connection.requestMethod = "GET"
        connection.connectTimeout = 5000
        connection.readTimeout = 5000
        
        // 3. Connect to target socket
        connection.connect()

        val responseCode = connection.responseCode
        if (responseCode == HttpURLConnection.HTTP_OK) {
            // 4. Read response stream byte-by-byte
            val stream: InputStream = connection.inputStream
            return stream.bufferedReader().use { it.readText() }
        } else {
            return "Error: $responseCode"
        }
    } finally {
        // 5. Close connection safely to release sockets
        connection.disconnect()
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why must network calls run on a background thread in Android?**
   *Answer:* Making a network call on the Main Thread blocks the UI loop, freezing the screen and causing the OS to throw a `NetworkOnMainThreadException` crash.

2. **What does setting a connection timeout accomplish?**
   *Answer:* It defines the maximum time (in milliseconds) the client will wait to establish a connection with the server. If the server does not respond within this window, the client aborts the request, preventing indefinite hangs.
""",
        "content": {
            "introduction": "HttpURLConnection manages low-level HTTP socket connections in Android, requiring manual input stream parsing and socket cleanup.",
            "whyImportant": "Understanding how network sockets, headers, and timeouts operate at the system level requires learning HttpURLConnection.",
            "realWorldApps": ["Implementing lightweight, dependency-free API calls.", "Testing basic network endpoint connectivity offline."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-net-okhttp",
        "title": "OkHttp Networking Client",
        "tagline": "Configure HTTP clients, implement interceptors, and handle connection pooling.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-net-http-connection"],
        "related": ["android-net-retrofit"],
        "practiceProblems": [],
        "markdown": """# OkHttp Networking Client

While `HttpURLConnection` is built into Android, writing raw input streams for complex operations (like authorization headers, caching, or logging) requires significant boilerplate. To simplify networking, Android developers use **OkHttp**. OkHttp is a high-performance HTTP client library that manages connection pooling, caching, and request modifications. This chapter covers client configuration, asynchronous requests, and **Interceptors**.

---

## 1. OkHttp Architecture Features

OkHttp includes several performance optimizations by default:
* **Connection Pooling:** Automatically reuses existing TCP sockets for subsequent requests to the same server, avoiding the latency of opening new sockets.
* **Response Caching:** Stores response payloads locally to serve repeating queries without making network requests.
* **Multiplexing:** Supports HTTP/2, allowing multiple requests and responses to share a single TCP connection.

---

## 2. The Interceptor Pipeline

A key feature of OkHttp is its **Interceptor** API. Interceptors act as middleware, intercepting outgoing requests and incoming responses to add headers, log data, or handle error conditions:

### Interceptor Pipeline Graph
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">OkHttp Interceptor Chain</text>

  {/* Client Request */}
  <g transform="translate(30, 80)">
    <rect width="100" height="60" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="50" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle">Request</text>
    <text x="50" y="42" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Outgoing API</text>
  </g>

  {/* Interceptor */}
  <g transform="translate(170, 70)">
    <rect width="260" height="80" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="130" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Logging/Auth Interceptor</text>
    <text x="130" y="45" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Appends header: Bearer token</text>
    <text x="130" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Logs response code</text>
  </g>

  {/* Socket */}
  <g transform="translate(470, 80)">
    <rect width="100" height="60" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="50" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">Server Socket</text>
    <text x="50" y="42" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">TCP Stream</text>
  </g>

  {/* Paths */}
  <path d="M 130,110 L 170,110" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ok-arrow)"/>
  <path d="M 430,110 L 470,110" stroke="#10b981" stroke-width="1.5" marker-end="url(#ok-arrow)"/>

  <defs>
    <marker id="ok-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | HttpURLConnection | OkHttp Client |
| :--- | :--- | :--- |
| **Timeout Configuration** | Set manually per request | Configured once on client initialization |
| **Interceptors Middleware** | Manual wrapper methods | Native `addInterceptor` support |
| **HTTP/2 & WebSockets** | Unsupported | Supported out of the box |

---

## 4. Kotlin OkHttp Implementation

Below is a Kotlin program configuring an OkHttp client with a custom logging interceptor and executing an async request:

```kotlin
import okhttp3.*
import java.io.IOException

class NetworkManager {

    // 1. Build client with configurations and interceptors
    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            // Add authorization header to all outgoing requests
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer token_secret")
                .build()
            chain.proceed(request)
        }
        .build()

    fun fetchUserData(url: String) {
        val request = Request.Builder().url(url).build()

        // 2. Queue asynchronous call
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                // Handle socket failure
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (response.isSuccessful) {
                        val body = response.body?.string()
                        println(body)
                    }
                }
            }
        })
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why must response bodies be closed inside onResponse?**
   *Answer:* The response body holds open connection resources that stream data from the network. Failing to close the response (e.g. using `response.close()` or `use` block) leaks the connection socket, eventually exhausting the client's connection pool.

2. **What is the difference between an Application Interceptor and a Network Interceptor?**
   *Answer:* Application interceptors execute once for each request, regardless of whether it is served from the cache or the network. Network interceptors run on the network layer, capturing actual TCP traffic, redirects, and intermediate retries.
""",
        "content": {
            "introduction": "OkHttp is an optimized HTTP client library that manages socket pooling and request/response interceptors.",
            "whyImportant": "Adding authorization headers and logging responses consistently across API calls requires using OkHttp.",
            "realWorldApps": ["Adding Bearer tokens to all outgoing server queries.", "Logging network request bodies during debug builds."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-net-retrofit",
        "title": "Retrofit REST Client",
        "tagline": "Configure Retrofit clients, define API interfaces, and parse JSON payloads using converters.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-net-okhttp"],
        "related": ["compose-viewmodel-state"],
        "practiceProblems": [],
        "markdown": """# Retrofit REST Client

While `OkHttp` handles low-level networking, developers still need to serialize and deserialize JSON data manually, and write boilerplate code to map URLs to functions. To simplify REST API integration, Android developers use **Retrofit**. Retrofit is a type-safe HTTP client library that abstracts network endpoints into Kotlin interfaces. This chapter covers API interfaces, annotation mappings, and JSON converters.

---

## 1. Retrofit Interface Architecture

Retrofit uses annotations to configure HTTP requests:
* **Interface Methods:** You define your API endpoints as standard Kotlin interface methods.
* **HTTP Annotations:** Annotate methods to set HTTP verbs and paths (e.g. `@GET("users/{id}")`).
* **Parameter Mapping:** Use `@Path` or `@Query` annotations to inject variables into URL paths dynamically.
* **Converters:** Serialization libraries (like Gson or Moshi) translate JSON response payloads into Kotlin data classes automatically.

---

## 2. API Dynamic Proxy Model

Retrofit uses Java's Dynamic Proxy pattern to generate implementation code for your interface at runtime:

### Dynamic Proxy Mapping
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Retrofit Client Pipeline</text>

  {/* Interface */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Kotlin Interface</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">@GET("posts/{id}")</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">fun getPost(id)</text>
  </g>

  {/* Retrofit Dynamic Proxy */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Dynamic Proxy</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Translates method</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">to OkHttp request</text>
  </g>

  {/* Converter Converter */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Moshi / Gson</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Parses JSON bytes</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">to Data Class</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#rt-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#rt-arrow)"/>

  <defs>
    <marker id="rt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | OkHttp Call | Retrofit Client |
| :--- | :--- | :--- |
| **API Declaration** | Built manually using Builders | Declared as interface methods with annotations |
| **Deserialization** | Manually parsed from JSON strings | Automatically converted to target data classes |
| **Coroutine integration** | Requires callback wrappers | Native `suspend` function support |

---

## 4. Retrofit Client Example

Below is a Kotlin code block defining a Retrofit service interface, configuring the builder, and executing a request:

```kotlin
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

// 1. Declare Data Class
data class UserProfile(val id: Int, val name: String)

// 2. Define Endpoint Interface
interface UserApiService {
    @GET("users/{userId}")
    suspend fun getUserProfile(
        @Path("userId") id: Int,
        @Query("apiKey") key: String
    ): UserProfile
}

// 3. Configure Retrofit Instance
object RetrofitClient {
    private const val BASE_URL = "https://api.example.com/"

    val service: UserApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            // Add JSON parser converter
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(UserApiService::class.java)
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does Retrofit integrate with Kotlin Coroutines?**
   *Answer:* You simply add the `suspend` keyword to your interface method definitions. Retrofit automatically executes the request on a background thread and returns the deserialized data class when the coroutine resumes, avoiding the need for manual callback interfaces.

2. **What is the purpose of the @Path annotation compared to @Query?**
   *Answer:* `@Path` swaps placeholder tokens directly inside the URL path string (e.g. replacing `{id}` with `123` in `users/123`). `@Query` appends URL query parameters at the end of the URL (e.g., adding `?apiKey=abc` in `users/123?apiKey=abc`).
""",
        "content": {
            "introduction": "Retrofit maps REST API endpoints to Kotlin interfaces, using annotations and converters to parse JSON data automatically.",
            "whyImportant": "Connecting apps to REST APIs and parsing JSON payloads efficiently requires using Retrofit clients.",
            "realWorldApps": ["Fetching items dynamically from e-commerce backend APIs.", "Uploading user profiles using POST query interfaces."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    }
]
