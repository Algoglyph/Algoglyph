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

# 2. ARCH-MVI (Massive Textbook)
arch_mvi_md = r"""# Comprehensive Guide to MVI Architecture in Android: Model-View-Intent, State Reduction & Reactive UDF

**Model-View-Intent (MVI)** is an advanced reactive architectural pattern that enforces strict Unidirectional Data Flow (UDF) and mathematical state immutability in modern Android applications. By representing user interactions as explicit **Intents** and calculating new screen states through a pure functional **Reducer** (`f(CurrentState, Intent) = NewState`), MVI eliminates race conditions, unpredictable state mutations, and inconsistent UI states in complex production applications.

---

## 1. Architectural Philosophy & Unidirectional State Reduction

In traditional Android architectures, multiple UI components or asynchronous callbacks might mutate different parts of the screen state simultaneously. This concurrent mutation leads to state corruption, hard-to-reproduce bugs, and UI glitching during rapid user interactions.

MVI resolves this by modeling the UI as a **Stateless View** driven by a single immutable stream of state objects:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mviBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mviBg)" stroke="#a855f7" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MVI Functional State Reduction Pipeline</text>

  <!-- View -->
  <g transform="translate(80, 110)">
    <rect width="200" height="180" rx="8" fill="#1e1b4b" stroke="#c084fc" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#c084fc" font-family="monospace" font-weight="700" font-size="16">1. View Layer</text>
    <text x="15" y="75" fill="#e9d5ff" font-family="system-ui" font-size="12">• Renders Single State</text>
    <text x="15" y="105" fill="#e9d5ff" font-family="system-ui" font-size="12">• Dispatches Intent</text>
    <text x="15" y="135" fill="#e9d5ff" font-family="system-ui" font-size="12">• Stateless Components</text>
  </g>

  <!-- Intent / Reducer -->
  <g transform="translate(350, 110)">
    <rect width="200" height="180" rx="8" fill="#3b0764" stroke="#a855f7" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#e9d5ff" font-family="monospace" font-weight="700" font-size="16">2. Intent / Reducer</text>
    <text x="15" y="75" fill="#f3e8ff" font-family="system-ui" font-size="12">• Receives Sealed Intent</text>
    <text x="15" y="105" fill="#f3e8ff" font-family="system-ui" font-size="12">• Executes Domain Logic</text>
    <text x="15" y="135" fill="#f3e8ff" font-family="system-ui" font-size="12">• Reduces Pure State</text>
  </g>

  <!-- Model / State -->
  <g transform="translate(620, 110)">
    <rect width="200" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="16">3. State / Model</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• Immutable State</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• Single Source of Truth</text>
    <text x="15" y="135" fill="#94a3b8" font-family="system-ui" font-size="12">• Emits to View Flow</text>
  </g>

  <!-- Flow Arrows -->
  <path d="M 280 160 L 350 160" stroke="#c084fc" stroke-width="2"/>
  <text x="315" y="150" text-anchor="middle" fill="#c084fc" font-family="monospace" font-size="11">Intent</text>

  <path d="M 550 160 L 620 160" stroke="#a855f7" stroke-width="2"/>
  <text x="585" y="150" text-anchor="middle" fill="#a855f7" font-family="monospace" font-size="11">Reduce</text>

  <path d="M 720 290 Q 450 360 180 290" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>
  <text x="450" y="325" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12">Emit State Stream</text>
</svg>

---

## 2. Detailed Component Responsibilities

1. **Intent**: A sealed hierarchy representing every possible user action or system event (e.g. `LoadFeed`, `LikePost`, `RetryNetworkCall`).
2. **ViewState**: A single immutable data class representing the complete UI representation of a screen (e.g. lists, progress indicators, active dialogs, errors).
3. **SideEffect / Single Event**: Transient non-persistent events (e.g. navigation triggers, displaying a Snackbar or Toast) communicated through buffered Kotlin Channels.
4. **Reducer**: A pure state transformation function that takes the previous `ViewState` and an `Intent` or domain result, returning a newly allocated `ViewState` via Kotlin `.copy()`.

---

## 3. Production MVI Implementation (Kotlin & Jetpack Compose)

### Step 1: Define Sealed Intents & Side Effects
```kotlin
sealed interface ECommerceIntent {
    data object LoadProducts : ECommerceIntent
    data class AddToCart(val productId: String) : ECommerceIntent
    data class UpdateSearchQuery(val query: String) : ECommerceIntent
}

sealed interface ECommerceSideEffect {
    data class ShowToast(val message: String) : ECommerceSideEffect
    data class NavigateToCheckout(val cartTotal: Double) : ECommerceSideEffect
}
```

### Step 2: Define Immutable Screen State
```kotlin
data class ECommerceViewState(
    val products: List<Product> = emptyList(),
    val searchQuery: String = "",
    val cartCount: Int = 0,
    val isLoading: Boolean = false,
    val error: String? = null
)
```

### Step 3: Implement MVI Reducer ViewModel
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ECommerceViewModel(
    private val repository: ProductRepository
) : ViewModel() {

    private val _viewState = MutableStateFlow(ECommerceViewState())
    val viewState: StateFlow<ECommerceViewState> = _viewState.asStateFlow()

    private val _sideEffectChannel = Channel<ECommerceSideEffect>(Channel.BUFFERED)
    val sideEffectFlow = _sideEffectChannel.receiveAsFlow()

    fun processIntent(intent: ECommerceIntent) {
        when (intent) {
            is ECommerceIntent.LoadProducts -> fetchProducts()
            is ECommerceIntent.AddToCart -> handleAddToCart(intent.productId)
            is ECommerceIntent.UpdateSearchQuery -> handleSearch(intent.query)
        }
    }

    private fun fetchProducts() {
        viewModelScope.launch {
            _viewState.update { it.copy(isLoading = true, error = null) }
            try {
                val items = repository.getProducts()
                _viewState.update { it.copy(isLoading = false, products = items) }
            } catch (e: Exception) {
                _viewState.update { it.copy(isLoading = false, error = e.localizedMessage) }
                _sideEffectChannel.send(ECommerceSideEffect.ShowToast("Network error"))
            }
        }
    }

    private fun handleAddToCart(productId: String) {
        viewModelScope.launch {
            _viewState.update { currentState ->
                currentState.copy(cartCount = currentState.cartCount + 1)
            }
            _sideEffectChannel.send(ECommerceSideEffect.ShowToast("Added to cart!"))
        }
    }

    private fun handleSearch(query: String) {
        _viewState.update { it.copy(searchQuery = query) }
    }
}
```

---

## 4. Architectural Comparison & Trade-Offs

| Aspect | MVVM | MVI |
| :--- | :--- | :--- |
| **State Organization** | Multiple `StateFlow` fields | Single consolidated `ViewState` class |
| **Event Dispatching** | Direct ViewModel method calls | Sealed `Intent` stream processor |
| **State Transformation** | Imperative / Incremental updates | Pure functional state reduction via `.copy()` |
| **Replay & Crash Logging** | Hard to record full screen state history | Easy to record intent stream and replay user session |
| **Boilerplate Level** | Moderate | High (requires Intents, Effects, Reducers) |

---

## Frequently Asked Questions (FAQs)

### Q1: How does MVI prevent state race conditions?
Because all user intents are processed sequentially through a single state stream using atomic `MutableStateFlow.update { }` calls, multiple background threads cannot corrupt or overwrite partial UI state.

### Q2: What are Side-Effects (Single-Event Effects) in MVI?
Side-effects refer to transient events that should not be re-rendered on configuration changes (like screen rotation), such as showing a Snackbar or performing navigation. These are handled via a separate `Channel` or `SharedFlow` alongside the main state stream.

### Q3: Does MVI cause performance degradation due to object creation?
No. Modern JVM garbage collectors and Kotlin `data class copy()` operations are highly optimized for short-lived immutable instances.

### Q4: How do you record and replay user sessions with MVI?
Because MVI streams explicit `Intent` instances through a single entry point (`processIntent`), developer tools can capture the stream of Intents and replay them sequentially to reproduce user bugs deterministically.

### Q5: Can MVI be combined with Clean Architecture Use Cases?
Yes. The Intent processor inside the ViewModel delegates complex domain tasks to Clean Architecture Use Cases, which return results that are then reduced into the final ViewState.
"""

inject_into_de_blog_data('arch-mvi', arch_mvi_md)

print("Batch 1 Expanded (Part 2)!")
