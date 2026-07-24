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

# 1. PATTERN-ANDROID-BUILDER
builder_md = r"""# Comprehensive Guide to the Builder Pattern in Android: Creational Abstraction & Fluent APIs

The **Builder Pattern** is a creational design pattern widely utilized across the Android SDK (e.g. `NotificationCompat.Builder`, `AlertDialog.Builder`, `OkHttpClient.Builder`, and `WorkRequest.Builder`). It separates the construction of a complex object from its representation, allowing the step-by-step construction of immutable objects with optional parameter configurations without constructor overloading pollution.

---

## 1. Architectural Motivation & Constructor Pollution Solution

In traditional object-oriented design, creating objects with numerous optional configuration parameters leads to the **Telescoping Constructor Anti-Pattern**, where classes must define dozens of overloaded constructors:

```java
// Anti-Pattern: Telescoping Constructors
public User(String name) { ... }
public User(String name, String email) { ... }
public User(String name, String email, int age) { ... }
public User(String name, String email, int age, String phone) { ... }
```

The Builder Pattern resolves this by using fluent method chaining:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="builderBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#builderBg)" stroke="#3b82f6" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#dbeafe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Builder Pattern Step-by-Step Construction Pipeline</text>

  <!-- Step 1 -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. Builder Instantiation</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• Set Required Params</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• Internal Mutable State</text>
  </g>

  <!-- Step 2 -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="105" y="35" text-anchor="middle" fill="#dbeafe" font-family="monospace" font-weight="700" font-size="15">2. Fluent Chaining</text>
    <text x="15" y="75" fill="#bfdbfe" font-family="system-ui" font-size="12">• .setOptionA(val)</text>
    <text x="15" y="105" fill="#bfdbfe" font-family="system-ui" font-size="12">• .setOptionB(val)</text>
    <text x="15" y="135" fill="#bfdbfe" font-family="system-ui" font-size="12">• Returns "this"</text>
  </g>

  <!-- Step 3 -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. build() Invocation</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• Validates Invariants</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• Instantiates Immutable</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Returns Product Object</text>
  </g>
</svg>

---

## 2. Production Kotlin Implementation

### Custom HTTP Client Builder Example
```kotlin
class NetworkRequest private constructor(
    val url: String,
    val method: String,
    val headers: Map<String, String>,
    val body: String?,
    val timeoutMs: Long
) {
    class Builder(private val url: String) {
        private var method: String = "GET"
        private val headers = mutableMapOf<String, String>()
        private var body: String? = null
        private var timeoutMs: Long = 10_000L

        fun setMethod(method: String) = apply { this.method = method.uppercase() }
        fun addHeader(key: String, value: String) = apply { this.headers[key] = value }
        fun setBody(body: String) = apply { this.body = body }
        fun setTimeout(timeoutMs: Long) = apply { this.timeoutMs = timeoutMs }

        fun build(): NetworkRequest {
            require(url.isNotBlank()) { "URL cannot be blank" }
            if (method == "POST" || method == "PUT") {
                requireNotNull(body) { "HTTP $method requests require a non-null payload body" }
            }
            return NetworkRequest(url, method, headers.toMap(), body, timeoutMs)
        }
    }
}

// Usage in Android Application
val request = NetworkRequest.Builder("https://api.example.com/v1/user")
    .setMethod("POST")
    .addHeader("Authorization", "Bearer token_xyz")
    .addHeader("Content-Type", "application/json")
    .setBody("{\"user\": \"alice\"}")
    .setTimeout(5000)
    .build()
```

---

## Frequently Asked Questions (FAQs)

### Q1: When should you use the Builder Pattern over Kotlin Named Arguments & Default Parameters?
Kotlin default arguments (`data class User(val name: String, val age: Int = 18)`) eliminate telescoping constructors for simple data classes. However, the Builder pattern is superior when complex validation invariants must be enforced before instantiation or when constructing framework objects in Java-interop codebases.

### Q2: Why is `apply { }` in Kotlin ideal for implementing Builders?
Kotlin's `apply` scoping function executes a block of code with the object as its receiver (`this`) and returns the receiver object itself, allowing effortless method chaining.

### Q3: Where is the Builder pattern used in the official Android Framework?
Major Android Jetpack libraries rely on Builders, including `NotificationCompat.Builder`, `AlertDialog.Builder`, `WorkRequest.Builder`, `NavDeepLinkRequest.Builder`, and `MediaItem.Builder`.

### Q4: How does the Builder pattern enforce object immutability?
The target class constructor is made `private`, and properties are declared as read-only (`val` in Kotlin or `final` fields in Java). The Builder copies its internal state into the immutable class during the `.build()` execution.

### Q5: How can a Builder prevent invalid configuration states at runtime?
Validation checks inside the `.build()` method (such as `require()` or `check()`) ensure that mutually exclusive parameters or missing required fields raise an `IllegalArgumentException` before the target object is created.
"""

# 2. PATTERN-ANDROID-FACTORY
factory_md = r"""# Comprehensive Guide to the Factory Pattern in Android: ViewModelProvider.Factory & Creational Decoupling

The **Factory Pattern** (Factory Method and Abstract Factory) is a creational design pattern used extensively throughout Android architecture to instantiate objects without exposing the instantiation logic to the client. In modern Android development, **`ViewModelProvider.Factory`** and **`FragmentFactory`** are the primary mechanisms for instantiating classes that require custom constructor dependencies.

---

## 1. Architectural Motivation & Dependency Injection Integration

When an Android `Activity` or `Fragment` is recreated by the OS (e.g. during screen rotation), the framework requires a mechanism to re-instantiate ViewModels or Fragments with their required dependencies (like Repositories or Use Cases). Without a Factory, class constructors would be limited to parameterless default constructors.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="factoryBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#factoryBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">ViewModelProvider.Factory Creation Pipeline</text>

  <!-- Client Activity -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View (Activity)</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Requests ViewModel</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Delegates to Provider</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Agnostic of Dependencies</text>
  </g>

  <!-- Factory -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">Factory Interface</text>
    <text x="15" y="70" fill="#a5b4fc" font-family="system-ui" font-size="12">• Receives Dependencies</text>
    <text x="15" y="100" fill="#a5b4fc" font-family="system-ui" font-size="12">• Overrides create()</text>
    <text x="15" y="130" fill="#a5b4fc" font-family="system-ui" font-size="12">• Constructs ViewModel</text>
  </g>

  <!-- ViewModel -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">ViewModel Instance</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Injected with Repository</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Retained in Store</text>
  </g>
</svg>

---

## 2. Production Kotlin ViewModelProvider.Factory Implementation

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

// 1. Custom ViewModel requiring constructor dependencies
class OrderViewModel(
    private val orderRepository: OrderRepository,
    private val analyticsTracker: AnalyticsTracker
) : ViewModel() {
    // ViewModel Logic
}

// 2. Custom Factory Implementation
class OrderViewModelFactory(
    private val orderRepository: OrderRepository,
    private val analyticsTracker: AnalyticsTracker
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(OrderViewModel::class.java)) {
            return OrderViewModel(orderRepository, analyticsTracker) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
    }
}

// 3. Usage in Activity
class OrderActivity : AppCompatActivity() {

    private lateinit var viewModel: OrderViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val repository = OrderRepositoryImpl()
        val tracker = FirebaseAnalyticsTracker()
        val factory = OrderViewModelFactory(repository, tracker)

        // Instantiate ViewModel via ViewModelProvider & Factory
        viewModel = ViewModelProvider(this, factory)[OrderViewModel::class.java]
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why does Android require `ViewModelProvider.Factory` instead of direct constructor calls (`val vm = OrderViewModel(...)`)?
Directly instantiating a ViewModel via `OrderViewModel()` bypasses the Android `ViewModelStore`. As a result, the ViewModel will be destroyed and recreated every time the user rotates the screen, defeating the purpose of ViewModel lifecycle retention.

### Q2: How does Hilt / Dagger eliminate manual `ViewModelProvider.Factory` boilerplate?
Hilt generates multi-binding ViewModel factories under the hood at compile time using `@HiltViewModel` and `@Inject constructor()` annotations.

### Q3: What is the purpose of `FragmentFactory` in Jetpack Navigation?
`FragmentFactory` allows developers to pass custom constructor parameters (such as repositories or services) to Fragment instances, avoiding legacy parameterless `Fragment()` reflection calls.

### Q4: What is the difference between Simple Factory and Abstract Factory?
A Simple Factory creates instances of a single concrete class based on arguments. An Abstract Factory defines an interface for creating families of related or dependent objects without specifying their concrete classes.

### Q5: How do you unit test a custom Factory?
Pass mock dependencies into the Factory constructor, invoke `create(YourViewModel::class.java)`, and verify that the returned ViewModel instance is non-null and correctly initialized.
"""

inject_into_de_blog_data('pattern-android-builder', builder_md)
inject_into_de_blog_data('pattern-android-factory', factory_md)

print("Batch 2 (Part 1 - Builder & Factory) Injected!")
