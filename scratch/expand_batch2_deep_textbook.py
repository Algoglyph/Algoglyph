import os
import re

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

# BATCH 2 DEEP TEXTBOOK ARTICLES

# 1. PATTERN-ANDROID-BUILDER
builder_md = r"""# Comprehensive Guide to the Builder Pattern in Android: Creational Abstraction, Fluent APIs & Object Immutability

The **Builder Pattern** is a creational design pattern heavily embedded across the Android SDK and modern Android Jetpack libraries (such as `NotificationCompat.Builder`, `AlertDialog.Builder`, `OkHttpClient.Builder`, `WorkRequest.Builder`, and `MediaItem.Builder`). The pattern isolates the complex construction logic of an object from its final representation. This allows developers to build immutable, highly configurable objects step-by-step using fluent method chaining, eliminating constructor parameter pollution and runtime invariant violations.

---

## 1. Architectural Motivation: Resolving Constructor Telescoping

In traditional Object-Oriented Programming (OOP), when a class requires multiple optional parameters, developers historically relied on overloaded constructors—a practice known as the **Telescoping Constructor Anti-Pattern**:

```java
// Anti-Pattern: Telescoping Constructors
public User(String id) { ... }
public User(String id, String name) { ... }
public User(String id, String name, String email) { ... }
public User(String id, String name, String email, int age) { ... }
public User(String id, String name, String email, int age, String phone) { ... }
```

### Problems with Telescoping Constructors:
1. **Unreadable Call Sites**: Callers struggle to identify which `String` argument corresponds to `name`, `email`, or `phone`, increasing positional bug risks.
2. **Combinatorial Explosion**: Supporting `N` optional fields requires $2^N$ constructor overloads to cover every parameter permutation.
3. **Mutability Risks**: To bypass constructor overloads, developers often resort to mutable setter methods (`user.setName(...)`), leaving objects in partially initialized, inconsistent states across threads.

The Builder Pattern resolves all these issues by separating configuration state from the final immutable target class.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="builderBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#builderBg)" stroke="#3b82f6" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#dbeafe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Builder Pattern Construction Pipeline</text>

  <!-- Step 1 -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. Builder Instantiation</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Pass Mandatory Params</text>
    <text x="15" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">• Private Target Constructor</text>
    <text x="15" y="125" fill="#94a3b8" font-family="system-ui" font-size="12">• Internal Mutable State</text>
  </g>

  <!-- Step 2 -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#dbeafe" font-family="monospace" font-weight="700" font-size="15">2. Fluent Method Chaining</text>
    <text x="15" y="65" fill="#bfdbfe" font-family="system-ui" font-size="12">• .setMethod("POST")</text>
    <text x="15" y="95" fill="#bfdbfe" font-family="system-ui" font-size="12">• .addHeader(k, v)</text>
    <text x="15" y="125" fill="#bfdbfe" font-family="system-ui" font-size="12">• Returns "this" (apply)</text>
  </g>

  <!-- Step 3 -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. Validation & Build</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Validates Invariants</text>
    <text x="15" y="95" fill="#a7f3d0" font-family="system-ui" font-size="12">• Instantiates Immutable</text>
    <text x="15" y="125" fill="#a7f3d0" font-family="system-ui" font-size="12">• Read-Only Product</text>
  </g>

  <path d="M 270 160 L 345 160" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 555 160 L 630 160" stroke="#60a5fa" stroke-width="2"/>
</svg>

---

## 2. Deep Dive: Component Mechanics & Invariant Protection

A robust Builder implementation consists of three key architectural rules:
1. **Private Target Constructor**: The product class constructor must be `private`, preventing direct instantiation from outside the Builder.
2. **Immutable Read-Only Fields**: All properties on the target class are declared as `val` (or `private final` in Java) to guarantee thread safety.
3. **Enforced Pre-condition Checks**: The `.build()` method executes validation assertions (such as `require()` or `check()`) to verify parameter combinations before creating the target instance.

---

## 3. Production Kotlin Implementation: Custom Network Request Builder

Below is a complete, production-grade implementation of a custom HTTP Network Request configuration using the Builder Pattern in Kotlin:

```kotlin
class NetworkRequest private constructor(
    val url: String,
    val method: String,
    val headers: Map<String, String>,
    val body: String?,
    val timeoutMs: Long,
    val retryCount: Int
) {
    // Nested Builder Class
    class Builder(private val url: String) {
        private var method: String = "GET"
        private val headers = mutableMapOf<String, String>()
        private var body: String? = null
        private var timeoutMs: Long = 10_000L
        private var retryCount: Int = 3

        fun setMethod(method: String) = apply { 
            this.method = method.uppercase() 
        }

        fun addHeader(key: String, value: String) = apply { 
            this.headers[key] = value 
        }

        fun setBody(body: String) = apply { 
            this.body = body 
        }

        fun setTimeout(timeoutMs: Long) = apply { 
            this.timeoutMs = timeoutMs 
        }

        fun setRetryCount(count: Int) = apply {
            this.retryCount = count
        }

        // Final Construction Phase with Runtime Invariant Validation
        fun build(): NetworkRequest {
            require(url.isNotBlank()) { "URL cannot be blank" }
            require(url.startsWith("http://") || url.startsWith("https://")) { 
                "URL must use HTTP or HTTPS protocol" 
            }
            if (method == "POST" || method == "PUT" || method == "PATCH") {
                requireNotNull(body) { "HTTP $method requests require a non-null request body" }
            }
            require(timeoutMs > 0) { "Timeout must be greater than 0ms" }
            require(retryCount >= 0) { "Retry count cannot be negative" }

            return NetworkRequest(
                url = url,
                method = method,
                headers = headers.toMap(), // Defensive copy for immutability
                body = body,
                timeoutMs = timeoutMs,
                retryCount = retryCount
            )
        }
    }
}

// Client Call Site Usage
fun main() {
    val request = NetworkRequest.Builder("https://api.example.com/v1/users")
        .setMethod("POST")
        .addHeader("Authorization", "Bearer eyJhbGciOiJKV1Qi...")
        .addHeader("Content-Type", "application/json")
        .setBody("{\"username\": \"varun\"}")
        .setTimeout(5000)
        .setRetryCount(2)
        .build()

    println("Request initialized: ${request.method} ${request.url}")
}
```

---

## 4. Line-by-Line Code Walkthrough

1. `class NetworkRequest private constructor(...)`: Declares a private primary constructor. External classes cannot call `NetworkRequest(...)` directly.
2. `class Builder(private val url: String)`: Mandatory parameters (like the target `url`) are enforced directly inside the `Builder` constructor.
3. `fun setMethod(method: String) = apply { ... }`: The `apply` scoping function modifies internal state and returns `this` (`Builder`), enabling method chaining.
4. `headers.toMap()`: Performs a defensive copy of the mutable map into an immutable read-only Map, preventing callers from mutating headers post-construction.
5. `requireNotNull(body)`: Validates that HTTP state transitions satisfy protocol requirements before returning the final object.

---

## 5. Builder Pattern vs Kotlin Data Class Copy

| Feature | Builder Pattern | Kotlin Data Class Default Args / `.copy()` |
| :--- | :--- | :--- |
| **Java Interoperability** | Flawless (Standard Java `.builder().setX().build()`) | Cumbersome (Java callers cannot use default arguments) |
| **Complex Validation** | Centralized inside `.build()` method | Must be executed inside `init { }` block |
| **Step-by-Step Assembly** | Ideal for progressive construction across multiple steps | Must construct all properties in a single expression |
| **SDK Framework Integration** | Native standard across Android Jetpack APIs | Used for internal Kotlin-first domain models |

---

## 6. Anti-Patterns & Common Pitfalls

1. **Leaking Mutable Collections**: Assigning a mutable list or map directly to the target object allows external callers to modify the object post-creation. Always make defensive immutable copies (`toList()`, `toMap()`).
2. **Missing Invariant Checks**: Omitting parameter validation in `.build()` allows invalid object configurations to silently propagate through the system.
3. **Overusing Builders for Simple Data Classes**: For internal Kotlin data objects with 2-3 fields, standard Kotlin default arguments (`data class User(val name: String, val age: Int = 18)`) are simpler and less verbose.

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

inject_into_de_blog_data('pattern-android-builder', builder_md)

print("Builder article fully expanded with textbook depth!")
