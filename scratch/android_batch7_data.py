# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 7 articles

ANDROID_BATCH7_ARTICLES = [
    {
        "slug": "android-net-serialization-gson",
        "title": "Gson JSON Serialization",
        "tagline": "Configure Gson parsers, manage reflection costs, and build custom TypeAdapters.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-net-http-connection"],
        "related": ["android-net-serialization-moshi", "android-net-serialization-kotlin"],
        "practiceProblems": [],
        "markdown": """# Gson JSON Serialization

To read data returned from web APIs, applications must parse JSON string payloads into typed programming language objects. Historically, the most popular JSON library on Android is **Gson** (developed by Google). Gson parses JSON strings using Java reflection. This chapter covers field annotations, custom TypeAdapters, and reflection performance overheads.

---

## 1. Field mapping with SerializedName

By default, Gson maps JSON keys directly to class variables with matching names. If your Kotlin naming convention (camelCase) differs from the backend API naming convention (snake_case), you resolve the mismatch using the `@SerializedName` annotation:

```kotlin
data class User(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("email_address") val email: String
)
```

---

## 2. Gson Reflection Execution Model

Gson relies heavily on runtime reflection to read class schemas. When parsing JSON, it dynamically scans field types and inserts values into memory:

### Reflection Parsing
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Gson Runtime Reflection Pipeline</text>

  {/* JSON Input */}
  <g transform="translate(40, 75)">
    <rect width="120" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="60" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">JSON Input</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">"first_name": "Bob"</text>
  </g>

  {/* Reflection scan */}
  <g transform="translate(210, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#ef4444" stroke-width="1.5"/>
    <text x="90" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Runtime Reflection</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Scans fields dynamically</text>
    <text x="15" y="75" fill="#fca5a5" font-size="6" font-family="monospace">No compile-time adapters</text>
  </g>

  {/* Output Object */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Kotlin Instance</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">User(firstName="Bob")</text>
  </g>

  {/* Paths */}
  <path d="M 160,120 L 210,120" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 390,120 L 440,120" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | Gson Library | Custom TypeAdapter |
| :--- | :--- | :--- |
| **Parsing Model** | Runtime reflection | Sequential stream reading (tokenized) |
| **Performance** | Slower (requires schema lookup) | Faster (direct assignments) |
| **Memory Cost** | High (temporary allocation overheads) | Low |
| **Boilerplate** | None | High (requires manual token checks) |

---

## 4. Kotlin Gson TypeAdapter Example

Below is a Kotlin program declaring a custom TypeAdapter to parse user entities manually, avoiding reflection costs:

```kotlin
import com.google.gson.Gson
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonWriter

data class UserProfile(val id: Int, val name: String)

// Custom Adapter overrides read/write loops
class UserProfileAdapter : TypeAdapter<UserProfile>() {
    override fun write(out: JsonWriter, value: UserProfile?) {
        if (value == null) {
            out.nullValue()
            return
        }
        out.beginObject()
        out.name("id").value(value.id)
        out.name("name").value(value.name)
        out.endObject()
    }

    override fun read(reader: JsonReader): UserProfile {
        var id = 0
        var name = ""
        reader.beginObject()
        while (reader.hasNext()) {
            when (reader.nextName()) {
                "id" -> id = reader.nextInt()
                "name" -> name = reader.nextString()
                else -> reader.skipValue()
            }
        }
        reader.endObject()
        return UserProfile(id, name)
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is reflection-based parsing (like default Gson) slower on Android compared to code generation?**
   *Answer:* Reflection requires searching through class descriptors, fields, and constructors at runtime to locate target properties, which consumes CPU cycles. Code generation creates helper classes during compilation that directly parse JSON fields, avoiding runtime overhead.

2. **Does Gson support Kotlin's null-safety checks?**
   *Answer:* By default, Gson bypasses Kotlin's constructor checks. If a non-nullable property is missing in the JSON payload, Gson will instantiate the class with a null value anyway, which can cause a `NullPointerException` later.
""",
        "content": {
            "introduction": "Gson parses JSON strings using Java reflection, mapping properties dynamically using SerializedName annotations and TypeAdapters.",
            "whyImportant": "Handling API payload structures while managing reflection CPU costs requires configuring serialization tools.",
            "realWorldApps": ["Deserializing server API response strings to data classes.", "Writing custom adapters to parse dynamic payload keys."],
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
        "slug": "android-net-serialization-moshi",
        "title": "Moshi Serialization Library",
        "tagline": "Configure Moshi serializers, deploy annotation processors, and enforce null safety.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-net-serialization-gson"],
        "related": ["android-net-serialization-kotlin"],
        "practiceProblems": [],
        "markdown": """# Moshi Serialization Library

To avoid the performance costs of reflection-based libraries, modern Android applications use **Moshi** (developed by Square). Moshi is designed for Kotlin, enforcing Kotlin's null-safety rules and using compile-time code generation to parse JSON payloads quickly. This chapter covers Moshi annotations, adapters code generation, and null safety.

---

## 1. Code Generation with Moshi

To enable compile-time adapter generation, annotate your data classes with `@JsonClass(generateAdapter = true)`:
* **The Compiler:** During compilation, Moshi's annotation processor generates a custom JsonAdapter helper class (e.g. `UserJsonAdapter.kt`) for each annotated data class.
* **Execution:** At runtime, Moshi uses this generated helper class to read the JSON stream directly, avoiding reflection lookups.

---

## 2. Compile-Time Adapter Generation

### Code Generation Workflow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Moshi Codegen Pipeline</text>

  {/* Source File */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Source File</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">@JsonClass</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">data class User</text>
  </g>

  {/* KSP Compiler */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. KSP Compiler</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Generates adapter</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">during build step</text>
  </g>

  {/* Output Adapter */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Generated Code</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">UserJsonAdapter</text>
    <text x="15" y="70" fill="#a7f3d0" font-size="6" font-family="monospace">Zero reflection used</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#mo-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#mo-arrow)"/>

  <defs>
    <marker id="mo-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Gson Library | Moshi (Codegen) |
| :--- | :--- | :--- |
| **Kotlin Null Safety** | Ignored (can inject null to non-nullable fields) | Enforced (throws JsonDataException on missing keys) |
| **Parsing Engine** | Runtime reflection | Generated direct classes |
| **Build Time** | Faster (no code generation) | Slower (requires KSP compilation step) |

---

## 4. Kotlin Moshi Implementation

Below is a Kotlin program demonstrating how to configure Moshi to serialize and deserialize data classes:

```kotlin
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi

// 1. Annotate data class to generate adapter at compile time
@JsonClass(generateAdapter = true)
data class UserAccount(
    @Json(name = "account_id") val id: Int,
    val username: String,
    val email: String? // Nullable field
)

class SerializationService {
    // 2. Initialize Moshi instance
    private val moshi: Moshi = Moshi.Builder().build()
    private val adapter = moshi.adapter(UserAccount::class.java)

    fun jsonToUser(jsonString: String): UserAccount? {
        // 3. Deserialize JSON string (enforces null safety rules)
        return adapter.fromJson(jsonString)
    }

    fun userToJson(user: UserAccount): String {
        return adapter.toJson(user)
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does Moshi protect Kotlin's null safety rules?**
   *Answer:* If a field in a Kotlin data class is non-nullable (e.g. `val id: Int`) but is missing or null in the JSON payload, Moshi throws a `JsonDataException` immediately during parsing, preventing downstream null pointer crashes.

2. **Why is it recommended to use KSP (Kotlin Symbol Processing) instead of KAPT for generating Moshi adapters?**
   *Answer:* KAPT requires generating Java stubs before processing annotations, which slows down compilation. KSP processes Kotlin symbols directly, reducing compilation times.
""",
        "content": {
            "introduction": "Moshi generates parsing adapters at compile time, enforcing Kotlin null safety rules and avoiding runtime reflection overhead.",
            "whyImportant": "Optimizing API parsing performance and ensuring null safety in JSON processing requires using Moshi.",
            "realWorldApps": ["Parsing complex REST API payloads quickly.", "Enforcing schema validation rules on network data inputs."],
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
        "slug": "android-net-serialization-kotlin",
        "title": "Kotlinx Serialization",
        "tagline": "Configure Kotlin Multiplatform serialization, compile schemas, and parse JSON.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-net-serialization-moshi"],
        "related": ["android-net-retrofit"],
        "practiceProblems": [],
        "markdown": """# Kotlinx Serialization

For modern applications, especially those built using **Kotlin Multiplatform (KMP)**, the standard library provides **Kotlinx Serialization**. This library is maintained by JetBrains. It operates via a compiler plugin that generates serialization logic directly into class bytecode during compilation. This chapter covers the `@Serializable` annotation, JSON configuration options, and multiplatform support.

---

## 1. Bytecode Generation

Unlike libraries that generate source code files during compilation (like Moshi KSP), Kotlinx Serialization uses a **Kotlin Compiler Plugin**:
* **Bytecode Injection:** The plugin analyzes classes annotated with `@Serializable` and inserts serialization methods directly into the compiled class bytecode.
* **Multiplatform Support:** Because it is built directly into the Kotlin compiler, it works across all target platforms (Android, iOS, Desktop, and JavaScript).

---

## 2. Compiler Plugin Graph

### Compilation Stages
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Kotlinx Compiler Plugin Pipeline</text>

  {/* Kotlin Source */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Source Code</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">@Serializable</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">class User</text>
  </g>

  {/* Compiler Plugin */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Kotlin Compiler</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Injects helper methods</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">directly into bytecode</text>
  </g>

  {/* Compiled Bytecode */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Bytecode</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">User.class containing</text>
    <text x="15" y="70" fill="#a7f3d0" font-size="6" font-family="monospace">native serializers</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#kx-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#kx-arrow)"/>

  <defs>
    <marker id="kx-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Moshi (Codegen) | Kotlinx Serialization |
| :--- | :--- | :--- |
| **Target Platforms** | JVM & Android only | Multiplatform (JVM, JS, iOS native) |
| **Output Type** | Generates separate `.kt` classes | Injects methods into existing bytecode |
| **Format Support** | JSON only | JSON, Protocol Buffers, CBOR, properties |

---

## 4. Kotlinx Serialization Code Example

Below is a Kotlin code block showing how to configure a JSON parser to ignore unknown keys and deserialize data:

```kotlin
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString

// 1. Annotate data class for compiler processing
@Serializable
data class MemberProfile(
    @SerialName("member_id") val id: Int,
    val alias: String
)

class DataSerializer {

    // 2. Configure JSON configuration options
    private val jsonConfiguration = Json {
        // Skip unknown keys in response instead of throwing exception
        ignoreUnknownKeys = true
        // format output cleanly
        prettyPrint = true
    }

    fun deserialize(jsonString: String): MemberProfile {
        // 3. Decode string directly using generated bytecode methods
        return jsonConfiguration.decodeFromString(jsonString)
    }

    fun serialize(member: MemberProfile): String {
        return jsonConfiguration.encodeToString(member)
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does Kotlinx Serialization throw an exception if it encounters an unknown JSON key by default?**
   *Answer:* It enforces strict schema validation by default to verify that your data matches the server payload. To disable this validation and ignore unknown keys safely, set `ignoreUnknownKeys = true` in the JSON configuration builder.

2. **Does Kotlinx Serialization require reflection at runtime?**
   *Answer:* No. Because the compiler plugin injects the serialization methods directly into the class bytecode, it runs completely without runtime reflection.
""",
        "content": {
            "introduction": "Kotlinx Serialization injects serialization methods into class bytecode, offering type-safe, multiplatform JSON parsing.",
            "whyImportant": "Building Kotlin Multiplatform projects that share serialization logic across Android and iOS requires using Kotlinx Serialization.",
            "realWorldApps": ["Sharing network models in Kotlin Multiplatform projects.", "Parsing database states into Protocol Buffers format."],
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
        "slug": "android-di-manual",
        "title": "Manual Dependency Injection",
        "tagline": "Configure AppContainers, build dependency graphs manually, and manage class coupling.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-di-dagger", "android-di-hilt"],
        "practiceProblems": [],
        "markdown": """# Manual Dependency Injection

As applications grow, classes require references to other classes (dependencies). For example, a `ViewModel` needs a `Repository`, which in turn needs a `Database`. Instantiating dependencies directly inside classes makes the code coupled and difficult to test. **Dependency Injection (DI)** solves this by passing dependencies into a class's constructor. This chapter covers manual dependency graphs and AppContainers.

---

## 1. Constructor Injection and Containers

* **Constructor Injection:** A class lists all its dependencies in its constructor parameters. It does not instantiate them itself (e.g. `class Repository(val api: Api)`).
* **`AppContainer`:** An application-level class that acts as a container. It instantiates all shared dependencies (like databases or network clients) once and provides them to other components.

---

## 2. Dependency Graph Structure

In manual DI, the `AppContainer` manages the lifecycle of shared dependencies, passing them down the constructor chain:

### Manual Dependency Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Manual DI AppContainer Graph</text>

  {/* AppContainer */}
  <g transform="translate(40, 60)">
    <rect width="180" height="130" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">AppContainer</text>
    
    <rect x="15" y="45" width="150" height="25" fill="#111" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">val client = OkHttpClient()</text>

    <rect x="15" y="80" width="150" height="25" fill="#111" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="95" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">val repo = UserRepository(client)</text>
  </g>

  {/* ViewModels */}
  <g transform="translate(380, 80)">
    <rect width="180" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="30" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Activity / ViewModel</text>
    <text x="90" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">container.repo injected</text>
  </g>

  {/* Injection Path */}
  <path d="M 220,125 L 380,125" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#di-arrow)"/>
  <text x="300" y="115" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Inject</text>

  <defs>
    <marker id="di-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Tight Coupling (No DI) | Constructor Injection (Manual DI) |
| :--- | :--- | :--- |
| **Dependency Creation** | Instantiated inside the class body | Passed as constructor parameters |
| **Testing** | Hard (cannot mock dependencies) | Easy (can pass mock implementations) |
| **Boilerplate** | Low | High (requires manual container setups) |

---

## 4. Kotlin Manual DI Implementation

Below is a Kotlin program demonstrating how to build an `AppContainer` and inject dependencies manually:

```kotlin
import android.app.Application

// 1. Interface and implementations
interface ApiClient { fun fetchData(): String }
class RetrofitApiClient : ApiClient { override fun fetchData() = "data" }

class UserDataRepository(private val client: ApiClient) {
    fun getUserData() = client.fetchData()
}

// 2. AppContainer manages instances
class AppDependencyContainer {
    private val apiClient: ApiClient = RetrofitApiClient()
    
    // Instantiate repository with injected client
    val repository: UserDataRepository = UserDataRepository(apiClient)
}

// 3. Bind Container to Application class
class MyApplication : Application() {
    lateinit var container: AppDependencyContainer

    override fun onCreate() {
        super.onCreate()
        container = AppDependencyContainer()
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it bad practice to instantiate a Repository directly inside a ViewModel?**
   *Answer:* Instantiating a repository inside a ViewModel couples the two classes tightly. You cannot test the ViewModel in isolation (e.g. by passing a mock repository), and modifying the repository's constructor requires updating every ViewModel that uses it.

2. **Why does binding AppContainer to the Application class protect dependency lifecycles?**
   *Answer:* The Application instance persists as long as the app process is running, ensuring that dependencies stored inside the `AppContainer` (like databases) live across activity rotations.
""",
        "content": {
            "introduction": "Manual Dependency Injection resolves class coupling by passing dependencies into constructors and managing them inside AppContainers.",
            "whyImportant": "Decoupling classes to make them unit testable requires implementing dependency injection.",
            "realWorldApps": ["Configuring test databases instead of live databases during local testing.", "Managing single API client instances across multiple repositories."],
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
        "slug": "android-di-dagger",
        "title": "Dagger 2 Compile-Time DI",
        "tagline": "Configure dependency modules, build component interfaces, and compile graphs.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-di-manual"],
        "related": ["android-di-hilt"],
        "practiceProblems": [],
        "markdown": """# Dagger 2 Compile-Time DI

Manual DI is excellent for small apps, but as applications grow, writing dependency graphs manually requires significant boilerplate code. To automate this process, Android developers use **Dagger 2** (developed by Google). Dagger is a compile-time dependency injection library. This chapter covers Dagger annotations, Modules, and graph validation.

---

## 1. Dagger Annotations

Dagger uses annotations to generate the dependency graph:
* **`@Inject`:** Placed on constructor parameters to request a dependency, or on constructors to register the class with Dagger.
* **`@Module` & `@Provides`:** Used for classes that Dagger does not know how to instantiate directly (like third-party libraries, interface implementations, or builder classes).
* **`@Component`:** An interface that tells Dagger which modules to load to build the dependency graph.

---

## 2. Compile-Time Graph validation

Unlike runtime DI frameworks (like Guice) that throw exceptions at runtime if a dependency is missing, Dagger validates the **Directed Acyclic Graph (DAG)** of dependencies during compilation. If a dependency is missing, compilation fails:

### Dagger Compilation Check
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">Dagger DAG Validation</text>

  {/* Dependency Graph */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Graph compilation</text>
    
    <rect x="25" y="45" width="130" height="25" fill="#111" rx="2" stroke="#ef4444" stroke-width="1"/>
    <text x="90" y="60" fill="#ef4444" font-size="6" font-family="monospace" text-anchor="middle">Repository lacks Database!</text>
  </g>

  {/* Output: Build Fails */}
  <g transform="translate(360, 75)">
    <rect width="180" height="90" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="90" y="30" fill="#ef4444" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">Build Fails</text>
    <text x="90" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Dagger error alerts developers</text>
  </g>

  {/* Path */}
  <path d="M 240,120 L 360,120" stroke="#ef4444" stroke-width="1.5" marker-end="url(#dg-arrow)"/>

  <defs>
    <marker id="dg-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Annotation | Purpose | Declared On |
| :--- | :--- | :--- |
| **`@Inject`** | Requests or registers dependencies | Constructor, fields, or methods |
| **`@Module`** | Groups `@Provides` methods | Class |
| **`@Provides`** | Instantiates complex objects | Method inside a `@Module` |
| **`@Component`** | Defines the graph boundaries | Interface |

---

## 4. Dagger 2 Code Example

Below is a Kotlin program demonstrating how to configure Dagger modules, component interfaces, and inject dependencies:

```kotlin
import dagger.Component
import dagger.Module
import dagger.Provides
import javax.inject.Inject
import javax.inject.Singleton

// 1. Target class registered with Dagger via @Inject
class AuthRepository @Inject constructor() {
    fun getAuthSession() = "Session_Token"
}

// 2. Module provides dependencies Dagger cannot instantiate directly
@Module
class NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttpClient(): String = "OkHttpClient"
}

// 3. Component compiles and validates the graph
@Singleton
@Component(modules = [NetworkModule::class])
interface AppComponent {
    // Declares injection targets
    fun getAuthRepository(): AuthRepository
}
```

---

## 5. Conceptual Check Questions

1. **Why is compile-time graph validation preferred over runtime reflection for DI?**
   *Answer:* Runtime DI libraries scan classes using reflection when the app launches, which slows down app startup times and can cause crashes in production if a dependency is missing. Dagger validates the graph at compile time, catching configuration errors before the app runs.

2. **What does the @Singleton scope annotation accomplish?**
   *Answer:* It tells Dagger to instantiate the annotated dependency only once within the lifespan of that Component, reusing the same instance for all subsequent injection requests.
""",
        "content": {
            "introduction": "Dagger 2 automates dependency injection by validating dependency graphs at compile time, utilizing Inject, Module, and Component annotations.",
            "whyImportant": "Managing large dependency graphs without runtime crashes requires using compile-time validation.",
            "realWorldApps": ["Configuring app-wide singletons for database clients.", "Building modular Dagger networks across multi-module applications."],
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
        "slug": "android-di-hilt",
        "title": "Hilt Dependency Injection",
        "tagline": "Configure Hilt modules, utilize entry points, and manage Android component lifecycles.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-di-dagger"],
        "related": ["compose-viewmodel-state"],
        "practiceProblems": [],
        "markdown": """# Hilt Dependency Injection

While Dagger 2 is powerful, it has a steep learning curve and requires writing significant boilerplate code (components, subcomponents, and scopes) to coordinate with Android lifecycles. To simplify DI on Android, Google developed **Hilt**. Hilt is a wrapper built on top of Dagger that integrates directly with Android lifecycle components. This chapter covers Hilt annotations, lifecycles, and scopes.

---

## 1. Core Hilt Annotations

Hilt provides pre-configured components and annotations to simplify injection:
* **`@HiltAndroidApp`:** Annotated on your custom `Application` class to trigger Hilt code generation.
* **`@AndroidEntryPoint`:** Annotated on Android classes (Activities, Fragments, Views, Services) to enable field injection.
* **`@Inject`:** Injects dependencies into constructor parameters or fields.
* **`@ViewModelInject` (or `@HiltViewModel`):** Configures ViewModels for automatic dependency injection.

---

## 2. Hilt Component Lifecycles

Hilt automatically creates and destroys components in sync with Android lifecycles, preventing memory leaks:

### Lifecycle Component Hierarchy
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Hilt Lifecycle Components</text>

  {/* SingletonComponent */}
  <g transform="translate(40, 65)">
    <rect width="150" height="130" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="22" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">SingletonComponent</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bound: Application</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Lives: App lifetime</text>
  </g>

  {/* ActivityRetainedComponent */}
  <g transform="translate(225, 65)">
    <rect width="150" height="130" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="75" y="22" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">ActivityRetained</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bound: ViewModel</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Survives rotations</text>
  </g>

  {/* ActivityComponent */}
  <g transform="translate(410, 65)">
    <rect width="150" height="130" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="22" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">ActivityComponent</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bound: Activity</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Destroyed on rotation</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Hilt Component | Android Lifecycle Host | Scope Annotation |
| :--- | :--- | :--- |
| **`SingletonComponent`** | Application lifecycle | `@Singleton` |
| **`ActivityRetainedComponent`**| ViewModel scope | `@ActivityRetainedScoped` |
| **`ActivityComponent`** | Activity lifecycle | `@ActivityScoped` |
| **`FragmentComponent`** | Fragment lifecycle | `@FragmentScoped` |

---

## 4. Kotlin Hilt Implementation

Below is a Kotlin program demonstrating Hilt configuration in an application:

```kotlin
import android.app.Application
import androidx.lifecycle.ViewModel
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

// 1. Enable Hilt in the Application class
@HiltAndroidApp
class AppController : Application()

// 2. Inject dependency into a ViewModel
@HiltViewModel
class MainViewModel @Inject constructor(
    private val authRepo: AuthRepository
) : ViewModel() {
    fun fetchSession() = authRepo.getAuthSession()
}

// 3. Mark Activity as an entry point for field injection
@AndroidEntryPoint
class UserActivity : androidx.activity.ComponentActivity() {
    // Hilt handles field injection automatically
    @Inject lateinit var repository: AuthRepository
}
```

---

## 5. Conceptual Check Questions

1. **Why does Hilt require the @HiltAndroidApp annotation in the custom Application class?**
   *Answer:* `@HiltAndroidApp` serves as the entry point for Hilt's code generation, generating the base classes and dependencies container required to inject objects into your app.

2. **How does Hilt prevent memory leaks during device rotations?**
   *Answer:* Hilt injects dependencies using components bound to specific lifecycle scopes. For example, dependencies scoped to `ActivityComponent` are automatically destroyed when the Activity is destroyed, preventing context-related memory leaks.
""",
        "content": {
            "introduction": "Hilt simplifies dependency injection on Android by wrapping Dagger and integrating directly with Android components and lifecycles.",
            "whyImportant": "Avoiding manual Dagger boilerplate and managing lifecycle scopes safely requires using Hilt.",
            "realWorldApps": ["Injecting databases into ViewModels automatically.", "Configuring network clients across activities using field injection."],
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
        "slug": "android-architecture-mvc",
        "title": "MVC Architecture",
        "tagline": "Configure Model-View-Controller layers, analyze communication paths, and study limitations.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-architecture-mvp", "android-architecture-mvvm"],
        "practiceProblems": [],
        "markdown": """# MVC Architecture

To keep codebases maintainable, software engineering uses **architecture patterns** to separate responsibilities. The oldest of these patterns is **Model-View-Controller (MVC)**. While useful, applying MVC directly to Android introduces tight coupling. This chapter covers the MVC layers, communication paths, and limitations.

---

## 1. MVC Layer Roles

The MVC pattern divides responsibilities into three layers:
* **Model:** Handles business logic and data (e.g. database entities, network repositories).
* **View:** Displays the user interface. In legacy Android, this is defined by XML layout files.
* **Controller:** Intercepts user inputs and updates the Model. In Android, the Activity or Fragment acts as the Controller.

---

## 2. The MVC Communication Loop

In MVC, the Controller intercepts inputs and updates the Model. The View can read data directly from the Model to update the UI:

### MVC Communication Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">MVC Communication Loop</text>

  {/* View */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">View (XML)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Renders layout</text>
  </g>

  {/* Controller */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Controller (Activity)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Intercepts inputs</text>
  </g>

  {/* Model */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Model (Data)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Business logic</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#mvc-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#mvc-arrow)"/>

  <defs>
    <marker id="mvc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. The "Massive Activity" Limitation

On Android, MVC falls short because Activities and Fragments act as both the Controller and the View:
* **The Coupling:** XML files cannot implement drawing logic, click animations, or dynamic lists on their own. The Activity must handle these view updates.
* **The Result:** The Activity contains both UI code and controller logic, leading to large, unmaintainable classes (often called "Massive Activities") that are difficult to unit test.

---

## 4. Kotlin MVC Code Example

Below is a Kotlin program demonstrating an MVC structure:

```kotlin
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

// 1. Model holds data
data class CounterModel(var count: Int = 0)

// 2. Activity acts as the Controller, containing tight coupling to Views
class CounterActivity : AppCompatActivity() {
    private val model = CounterModel()
    private lateinit var counterText: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_counter)

        // View Binding
        counterText = findViewById(R.id.text_count)
        val button = findViewById<Button>(R.id.button_increment)

        // Controller intercepts input
        button.setOnClickListener {
            // Controller updates Model
            model.count++
            // Controller updates View directly
            renderView()
        }
    }

    private fun renderView() {
        counterText.text = "Count: ${model.count}"
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does MVC make unit testing difficult on Android?**
   *Answer:* The Controller logic is tightly coupled to the Android SDK (inside the Activity class). Running unit tests on these classes requires mocking the Android framework, which is slow and complex compared to testing pure Kotlin classes.

2. **How does the View receive updates in MVC?**
   *Answer:* The Controller (Activity) typically handles UI updates by modifying view properties (like TextView text) directly when the Model changes, which couples controller logic with the UI.
""",
        "content": {
            "introduction": "MVC separates applications into Model, View, and Controller layers, but can lead to tight coupling on Android since Activities act as both views and controllers.",
            "whyImportant": "Understanding legacy architecture patterns and their limitations is necessary to refactor old codebases.",
            "realWorldApps": ["Refactoring legacy activities to decoupled Presenter classes.", "Evaluating project structures to reduce Activity code bloat."],
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
        "slug": "android-architecture-mvp",
        "title": "MVP Architecture",
        "tagline": "Configure Model-View-Presenter layers, establish interfaces contracts, and decouple testing.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-architecture-mvc"],
        "related": ["android-architecture-mvvm"],
        "practiceProblems": [],
        "markdown": """# MVP Architecture

To resolve the tight coupling of MVC, developers created **Model-View-Presenter (MVP)**. MVP decouples the UI from the controller logic by replacing the Controller with a **Presenter** and using interfaces (contracts) to communicate with the View. This chapter covers Presenter contracts, View interfaces, and decoupled testing.

---

## 1. MVP Layer Roles

The MVP pattern defines clear boundaries between layers:
* **Model:** Handles business logic and data (e.g. repositories, network queries).
* **View:** Renders the UI and routes inputs. In Android, the Activity or Fragment implements a **View Interface**.
* **Presenter:** The coordinator. It receives user inputs from the View, queries the Model, and updates the View via its interface. The Presenter is pure Kotlin/Java, containing no references to the Android framework.

---

## 2. Presenter Contract Loop

The Presenter and View communicate using interface contracts:

### MVP Contract Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">MVP Interface Contract Pipeline</text>

  {/* View Activity */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">View (Activity)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Implements View</text>
  </g>

  {/* Presenter */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Presenter</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Calls View methods</text>
  </g>

  {/* Model */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Model</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Business logic</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#mvp-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#mvp-arrow)"/>

  <defs>
    <marker id="mvp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | MVC Architecture | MVP Architecture |
| :--- | :--- | :--- |
| **View Reference** | Coupled directly to the controller | Handled via a generic View interface contract |
| **Presenter Threading**| Bound to Android Activity | Pure Kotlin/Java (no Android references) |
| **Unit Testing** | Complex (requires Android emulator) | Simple (can test the Presenter using mocks) |

---

## 4. Kotlin MVP Contract Example

Below is a Kotlin program demonstrating an MVP contract:

```kotlin
// 1. Define Contract Interfaces
interface CounterContract {
    interface View {
        fun showCount(count: Int)
    }
    interface Presenter {
        fun onIncrementClicked()
    }
}

// 2. Presenter is pure Kotlin, holding a reference to the View interface
class CounterPresenter(
    private val view: CounterContract.View
) : CounterContract.Presenter {
    private var count = 0

    override fun onIncrementClicked() {
        count++
        // Update view using interface method
        view.showCount(count)
    }
}

// 3. Activity implements the View interface
class CounterActivity : androidx.activity.ComponentActivity(), CounterContract.View {
    private lateinit var presenter: CounterContract.Presenter

    fun setupPresenter() {
        presenter = CounterPresenter(this)
    }

    override fun showCount(count: Int) {
        // UI updates are decoupled from controller logic
        println("Count updated: $count")
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does MVP make Presenter unit tests simple?**
   *Answer:* The Presenter is a pure Kotlin class with no dependencies on Android framework classes (like Context or Activity). You can test it on a local JVM by passing a mock implementation of the View interface.

2. **What is a major limitation of MVP compared to MVVM?**
   *Answer:* The Presenter holds a direct reference to the View interface. If the Activity rotates and is recreated, the Presenter's reference can point to the destroyed Activity, causing memory leaks or crashes unless updated manually.
""",
        "content": {
            "introduction": "MVP architecture decouples UI layouts from logic using interface contracts, resolving MVC limitations.",
            "whyImportant": "Writing testable presenters without Android framework dependencies requires using MVP contracts.",
            "realWorldApps": ["Refactoring tightly coupled activities into testable interfaces.", "Testing business logic independently of UI layouts."],
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
        "slug": "android-architecture-mvvm",
        "title": "MVVM Architecture",
        "tagline": "Configure Model-View-ViewModel layers, implement state bindings, and handle configurations.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-architecture-mvp"],
        "related": ["compose-viewmodel-state"],
        "practiceProblems": [],
        "markdown": """# MVVM Architecture

The current industry standard for Android app development is **Model-View-ViewModel (MVVM)**. MVVM resolves the view lifecycle dependency issue of MVP by removing direct view references from the presenter layer. Instead, it exposes observable state variables that the View subscribes to. This chapter covers the ViewModel, state bindings, and how to handle configuration changes.

---

## 1. MVVM Layer Roles

The MVVM architecture divides responsibilities as follows:
* **Model:** Handles business logic and data access (e.g. database schemas, network APIs).
* **View:** Renders the UI and routes input events. In modern Android, this is built using Jetpack Compose or XML layout files.
* **ViewModel:** Exposes the UI state via observable variables (using `StateFlow`, `LiveData`, or Compose `State`). The ViewModel does not know which View is observing it, separating the two layers.

---

## 2. Unidirectional Data Flow Loop

The View sends input events to the ViewModel, and observes updates to the state variables:

### MVVM Flow Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">MVVM Unidirectional Loop</text>

  {/* View */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">View (UI)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Observes StateFlow</text>
  </g>

  {/* ViewModel */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">ViewModel</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Exposes StateFlow</text>
  </g>

  {/* Model */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Model</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Business logic</text>
  </g>

  {/* Paths */}
  {/* Event Up */}
  <path d="M 170,105 L 235,105" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#vm-arrow)"/>
  <text x="202" y="97" fill="#3b82f6" font-size="6" font-family="monospace" text-anchor="middle">Event</text>

  {/* State Down */}
  <path d="M 235,135 L 170,135" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#vm-arrow)"/>
  <text x="202" y="147" fill="#f59e0b" font-size="6" font-family="monospace" text-anchor="middle">State</text>

  <defs>
    <marker id="vm-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | MVP Presenter | MVVM ViewModel |
| :--- | :--- | :--- |
| **View Reference** | Holds a direct reference to the View interface | Holds no references to the View |
| **Lifecycle Awareness**| Manual updates needed on configuration changes | Retained across activity lifecycle rotations |
| **UI Bindings** | Manual updates via interface callbacks | Observable states (Flow, LiveData) |

---

## 4. Kotlin MVVM Example

Below is a Kotlin program demonstrating an MVVM implementation:

```kotlin
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

// 1. Define immutable UI State
data class UserUiState(
    val username: String = "",
    val isLoading: Boolean = false
)

// 2. ViewModel exposes read-only StateFlow
class UserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun updateUsername(newName: String) {
        _uiState.value = _uiState.value.copy(username = newName)
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does MVVM prevent memory leaks when activities are rotated?**
   *Answer:* The ViewModel holds no reference to the View (Activity). When the Activity is destroyed and recreated during a rotation, the ViewModel remains in memory, and the new Activity instance simply resubscribes to the ViewModel's observable StateFlow.

2. **Why is it recommended to make UI state classes immutable in MVVM?**
   *Answer:* Immutable state structures prevent threading conflicts and make debugging simple. Since the state can only be modified by emitting a copy of the state object, it creates a single, predictable state pipeline.
""",
        "content": {
            "introduction": "MVVM architecture decouples UI views from business logic by exposing observable state variables and retaining state across configuration changes.",
            "whyImportant": "Designing maintainable, lifecycle-safe Android apps requires implementing MVVM architectures.",
            "realWorldApps": ["Configuring ViewModels to retain data during device rotations.", "Binding active UI states to Composable layouts using StateFlows."],
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
        "slug": "android-architecture-mvi",
        "title": "MVI Architecture",
        "tagline": "Configure Model-View-Intent structures, implement state reducers, and manage state cycles.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-architecture-mvvm"],
        "related": ["android-coroutines-flow"],
        "practiceProblems": [],
        "markdown": """# MVI Architecture

As applications grow in complexity, managing multiple independent state variables inside a ViewModel can lead to conflicting UI states (e.g. displaying both a loading indicator and an error message simultaneously). To enforce a strict single source of truth, developers use **Model-View-Intent (MVI)**. MVI coordinates state updates using a unidirectional pipeline and state reduction. This chapter covers Intents, ViewState, and Reducers.

---

## 1. MVI Core Concepts

The MVI pattern is structured around three concepts:
* **Intent:** Represents the user's intent to perform an action (e.g., clicking a button).
* **ViewState:** An immutable data class representing the complete state of the screen at a single point in time.
* **Reducer:** A function that takes the current `ViewState` and an incoming `Intent` (or Action result) and merges them to output a new, updated `ViewState`.

---

## 2. Unidirectional MVI Loop

User interactions trigger Intents, which flow through the Reducer to update the ViewState. The View then renders the updated state:

### MVI Loop Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">MVI Unidirectional Loop</text>

  {/* View */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">View (Renders)</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Renders ViewState</text>
  </g>

  {/* Intent / Reducer */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Reducer</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Merges new changes</text>
  </g>

  {/* ViewState */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Immutable State</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">Single state source</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#ef4444" stroke-width="1.5" marker-end="url(#mvi-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#mvi-arrow)"/>

  <defs>
    <marker id="mvi-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | MVVM Architecture | MVI Architecture |
| :--- | :--- | :--- |
| **State Source** | Multiple independent observables | A single, unified `ViewState` object |
| **User Inputs** | Direct ViewModel method calls | Dispatched `Intent` events |
| **Debugging** | Complex (multiple variables update independently) | Simple (can track state changes sequentially) |

---

## 4. Kotlin MVI Implementation

Below is a Kotlin program demonstrating an MVI ViewModel with a State Reducer:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// 1. Define single immutable ViewState
data class LoginViewState(
    val email: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)

// 2. Define user Intents
sealed class LoginIntent {
    data class EmailChanged(val email: String) : LoginIntent()
    object Submit : LoginIntent()
}

class LoginViewModel : ViewModel() {
    private val _state = MutableStateFlow(LoginViewState())
    val state: StateFlow<LoginViewState> = _state.asStateFlow()

    // 3. Process incoming user intents
    fun processIntent(intent: LoginIntent) {
        when (intent) {
            is LoginIntent.EmailChanged -> {
                _state.value = reduce(_state.value, intent)
            }
            is LoginIntent.Submit -> {
                _state.value = _state.value.copy(isLoading = true)
                executeLogin()
            }
        }
    }

    // 4. Reducer combines state and intent
    private fun reduce(oldState: LoginViewState, intent: LoginIntent.EmailChanged): LoginViewState {
        return oldState.copy(email = intent.email, error = null)
    }

    private fun executeLogin() {}
}
```

---

## 5. Conceptual Check Questions

1. **How does MVI prevent conflicting UI states?**
   *Answer:* In MVI, the screen state is defined by a single immutable data class. Because all UI changes flow through a single Reducer that updates this object, it is impossible to have conflicting states (like showing both a success page and a loading indicator).

2. **What is a disadvantage of MVI compared to MVVM?**
   *Answer:* MVI requires significant boilerplate code to declare intents and copy state objects, and updating a single field requires recreating the entire `ViewState` object, which can cause performance overhead on complex screens.
""",
        "content": {
            "introduction": "MVI enforces a single source of truth using a unidirectional pipeline, coordinating Intents, ViewState, and Reducers.",
            "whyImportant": "Preventing conflicting UI states in complex applications requires implementing MVI pipelines.",
            "realWorldApps": ["Designing complex forms with strict validation states.", "Implementing undo/redo features by logging immutable ViewState changes."],
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
        "slug": "android-testing-junit",
        "title": "JUnit Unit Testing",
        "tagline": "Configure JUnit tests, run local JVM tests, and assert data changes.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-oop-basics"],
        "practiceProblems": [],
        "markdown": """# JUnit Unit Testing

To ensure code stability and catch bugs early, developers write automated tests. The most fundamental tests are **local unit tests**. Local unit tests run on your computer's Java Virtual Machine (JVM) without requiring an Android emulator or device, making them fast. In Android, local unit tests are written using **JUnit**. This chapter covers JUnit annotations, assertions, and test lifecycles.

---

## 1. JUnit Annotations and Lifecycle

JUnit uses annotations to configure test execution paths:
* **`@Test`:** Identifies a method as a test case.
* **`@Before` (or `@BeforeEach` in JUnit 5):** Runs setup code (like instantiating repositories) before each test method.
* **`@After` (or `@AfterEach`):** Runs cleanup code after each test method.

---

## 2. Test Execution Lifecycle

### Lifecycle Sequence
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">JUnit Test Lifecycle</text>

  {/* @Before Setup */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">1. Setup</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">@Before</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Instantiates objects</text>
  </g>

  {/* @Test Assert */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">2. Test</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">@Test</text>
    <text x="65" y="70" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Runs assertions</text>
  </g>

  {/* @After Teardown */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">3. Teardown</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">@After</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Releases resources</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#jt-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#jt-arrow)"/>

  <defs>
    <marker id="jt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Assertion Method | Expected Behavior | Failure Condition |
| :--- | :--- | :--- |
| **`assertEquals(expected, actual)`** | The two values are equal | The values differ |
| **`assertTrue(condition)`** | The condition is true | The condition evaluates to false |
| **`assertNull(object)`** | The reference is null | The reference points to an object |

---

## 4. Kotlin JUnit Test Example

Below is a Kotlin program demonstrating a local unit test using JUnit:

```kotlin
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

class MathCalculator {
    fun addValues(a: Int, b: Int): Int = a + b
}

class MathCalculatorTest {
    private lateinit var calculator: MathCalculator

    // 1. Setup code runs before each test method
    @Before
    fun setup() {
        calculator = MathCalculator()
    }

    // 2. Test method runs assertions
    @Test
    fun addValues_withValidInputs_returnsCorrectSum() {
        val result = calculator.addValues(2, 3)
        // Assert expected result matches actual output
        assertEquals(5, result)
    }

    // 3. Teardown runs after each test method
    @After
    fun teardown() {
        // Clear references if needed
    }
}
```

---

## 5. Conceptual Check Questions

1. **What is the difference between local unit tests and instrumented tests in Android?**
   *Answer:* Local unit tests run on your computer's JVM inside the `src/test/` directory, making them fast. Instrumented tests run on an Android device or emulator inside the `src/androidTest/` directory, allowing them to test Android framework features (like UI elements) at the cost of slower execution.

2. **Why should test methods be independent of each other?**
   *Answer:* If tests depend on each other (e.g. Test B requires Test A to modify a static variable first), the test suite becomes fragile. JUnit does not guarantee the execution order of test methods, so tests must remain isolated.
""",
        "content": {
            "introduction": "JUnit runs automated unit tests on local JVMs, utilizing annotations and assertions to verify code changes.",
            "whyImportant": "Catching logic bugs early without launching slow emulators requires writing unit tests.",
            "realWorldApps": ["Testing math utility functions in finance apps.", "Verifying ViewModel state transitions on user input events."],
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
