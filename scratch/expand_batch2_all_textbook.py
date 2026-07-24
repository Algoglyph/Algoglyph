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

# 2. PATTERN-ANDROID-FACTORY
factory_md = r"""# Comprehensive Guide to the Factory Pattern in Android: ViewModelProvider.Factory, FragmentFactory & Creational Decoupling

The **Factory Pattern** (encompassing Factory Method and Abstract Factory) is a fundamental creational design pattern used across Android system components and architecture libraries. It abstracts the instantiation process of objects, hiding the concrete implementation classes and parameter creation logic from the calling client. In modern Android engineering, **`ViewModelProvider.Factory`** and **`FragmentFactory`** serve as the primary mechanisms for instantiating components that require custom constructor dependencies while preserving framework lifecycle retention.

---

## 1. Architectural Motivation & Lifecycle Retention

When the Android Operating System destroys and recreates an `Activity` or `Fragment` due to a configuration change (such as screen rotation, dark mode toggling, or language change), the OS attempts to re-instantiate UI components. Without a Factory mechanism, the framework can only invoke parameterless default constructors via reflection (`Class.newInstance()`).

If a `ViewModel` or `Fragment` depends on custom constructor parameters (such as domain Use Cases, Repositories, or System Services), direct constructor instantiation by the client bypasses Android's `ViewModelStore`. As a result, the ViewModel would be destroyed on every rotation, defeating the purpose of lifecycle state retention.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="factoryBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#factoryBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">ViewModelProvider.Factory Execution Architecture</text>

  <!-- Client Activity -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Client Activity</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Requests ViewModel</text>
    <text x="15" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">• Passes Factory Instance</text>
    <text x="15" y="125" fill="#94a3b8" font-family="system-ui" font-size="12">• Ignores Constructor Code</text>
  </g>

  <!-- Factory -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">ViewModelFactory</text>
    <text x="15" y="65" fill="#a5b4fc" font-family="system-ui" font-size="12">• Holds Repositories</text>
    <text x="15" y="95" fill="#a5b4fc" font-family="system-ui" font-size="12">• Overrides create()</text>
    <text x="15" y="125" fill="#a5b4fc" font-family="system-ui" font-size="12">• Instantiates Target ViewModel</text>
  </g>

  <!-- Store -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">ViewModelStore</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Retains ViewModel Instance</text>
    <text x="15" y="95" fill="#a7f3d0" font-family="system-ui" font-size="12">• Survives Activity Rotation</text>
    <text x="15" y="125" fill="#a7f3d0" font-family="system-ui" font-size="12">• Manages Clear Signals</text>
  </g>

  <path d="M 270 160 L 345 160" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 555 160 L 630 160" stroke="#818cf8" stroke-width="2"/>
</svg>

---

## 2. Production Kotlin ViewModelProvider.Factory Implementation

Below is a complete, production-grade implementation of a custom `ViewModelProvider.Factory` in Kotlin:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider

// 1. Target ViewModel with non-empty constructor dependencies
class OrderViewModel(
    private val orderRepository: OrderRepository,
    private val analyticsTracker: AnalyticsTracker
) : ViewModel() {

    fun placeOrder(orderId: String) {
        analyticsTracker.logEvent("order_started")
        // Business logic execution
    }
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
        throw IllegalArgumentException(
            "Unknown ViewModel class: ${modelClass.name}. " +
            "Expected OrderViewModel::class.java"
        )
    }
}

// 3. Activity Call Site
class OrderActivity : AppCompatActivity() {

    private lateinit var viewModel: OrderViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_order)

        // Initialize dependencies
        val repository: OrderRepository = OrderRepositoryImpl()
        val analytics: AnalyticsTracker = FirebaseAnalyticsTracker()
        
        // Construct Factory
        val factory = OrderViewModelFactory(repository, analytics)

        // Retrieve ViewModel instance via ViewModelProvider bound to Activity ViewModelStore
        viewModel = ViewModelProvider(this, factory)[OrderViewModel::class.java]

        viewModel.placeOrder("ORDER_12345")
    }
}
```

---

## 3. Deep Line-by-Line Code Breakdown

1. `class OrderViewModel(private val orderRepository: ...)`: The ViewModel requires non-framework instances (`OrderRepository` and `AnalyticsTracker`), making direct `OrderViewModel()` call sites impossible without parameter providers.
2. `override fun <T : ViewModel> create(modelClass: Class<T>): T`: Overrides the framework factory method. `modelClass` represents the requested ViewModel class type.
3. `if (modelClass.isAssignableFrom(OrderViewModel::class.java))`: Verifies that the requested type matches the target class before casting.
4. `ViewModelProvider(this, factory)[OrderViewModel::class.java]`: Registers the Factory with the Activity's `ViewModelStore`. The provider checks if an instance already exists in memory. If yes, it returns the existing instance; if no, it delegates creation to `factory.create()`.

---

## 4. Factory Pattern Variants: Factory Method vs Abstract Factory vs Service Locator

| Metric | Factory Method Pattern | Abstract Factory Pattern | Service Locator (e.g. Koin) |
| :--- | :--- | :--- | :--- |
| **Creation Scope** | Creates a single product class via inheritance/interface | Creates a family of related products without specifying concrete classes | Resolves dependencies at runtime via hash table lookup |
| **Compile-Time Safety** | High (Direct class references) | High (Type-checked interfaces) | Medium (Throws runtime exception if binding missing) |
| **Use Case in Android** | `ViewModelProvider.Factory`, `FragmentFactory` | UI Theme Factories (Light/Dark themes), Multi-Platform Drivers | Dynamic Dependency Resolution |

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

inject_into_de_blog_data('pattern-android-factory', factory_md)

print("Factory article fully expanded!")
