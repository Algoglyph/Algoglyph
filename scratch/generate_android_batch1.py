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
                print(f"SUCCESSFULLY REPLACED '{slug}' in {file_path}")
                return True
    
    last_brace = content.rfind('};')
    if last_brace != -1:
        entry = f"\n  '{slug}': `\n{escaped_md}\n`,\n"
        new_content = content[:last_brace] + entry + content[last_brace:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESSFULLY INJECTED NEW '{slug}' in {file_path}")
        return True
    return False

# BATCH 1 ARTICLES

arch_mvvm_md = r"""# MVVM Architecture in Android: Model-View-ViewModel & StateFlow Integration

**Model-View-ViewModel (MVVM)** is the industry-standard architectural pattern recommended by Google for modern Android application development. By decoupling user interface code (Views / Composables) from domain logic and data fetching, MVVM ensures testability, maintainability, and survivability across Activity configuration changes (such as screen rotations).

---

## 1. Architectural Components & Unidirectional Data Flow

In MVVM, data flows in a single direction while events propagate upward from the View to the ViewModel.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvvmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvvmBg)" stroke="#6366f1" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MVVM Architecture Data & Event Flow</text>

  <!-- View Layer -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View / UI</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Jetpack Compose</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Renders State</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Sends User Events</text>
  </g>

  <!-- ViewModel Layer -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">ViewModel</text>
    <text x="15" y="70" fill="#a5b4fc" font-family="system-ui" font-size="12">• Holds StateFlow</text>
    <text x="15" y="100" fill="#a5b4fc" font-family="system-ui" font-size="12">• Survived Rotations</text>
    <text x="15" y="130" fill="#a5b4fc" font-family="system-ui" font-size="12">• Executes Coroutines</text>
  </g>

  <!-- Model / Repository Layer -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model Layer</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Repository Pattern</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Room Database</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Retrofit REST API</text>
  </g>

  <!-- Arrows -->
  <path d="M 270 160 L 345 160" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="307" y="150" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11">Events</text>

  <path d="M 345 230 L 270 230" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="307" y="245" text-anchor="middle" fill="#818cf8" font-family="monospace" font-size="11">StateFlow</text>

  <path d="M 555 160 L 630 160" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="592" y="150" text-anchor="middle" fill="#818cf8" font-family="monospace" font-size="11">Fetch</text>

  <path d="M 630 230 L 555 230" stroke="#34d399" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="592" y="245" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="11">Data</text>
</svg>

---

## 2. Production Kotlin Implementation

### User UiState Data Class
```kotlin
data class UserUiState(
    val isLoading: Boolean = false,
    val username: String = "",
    val errorMessage: String? = null
)
```

### Android Jetpack ViewModel
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class UserProfileViewModel(
    private val userRepository: UserRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun fetchUserProfile(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val user = userRepository.getUserById(userId)
                _uiState.update { it.copy(isLoading = false, username = user.name) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, errorMessage = e.localizedMessage) }
            }
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why does Android ViewModel survive configuration changes like screen rotation?
The ViewModel instance is managed by the `ViewModelStoreOwner` (such as an Activity or Fragment). When a configuration change occurs, the Activity is destroyed and recreated, but the `ViewModelStore` retains the existing ViewModel instance until the Activity is explicitly finished.

### Q2: What is the difference between LiveData and StateFlow in MVVM?
LiveData is lifecycle-aware and tightly bound to Android UI frameworks. StateFlow is part of Kotlin Coroutines, platform-agnostic, requires an initial value, and integrates natively with Jetpack Compose `collectAsStateWithLifecycle()`.

### Q3: Should a ViewModel ever reference a Context or View?
No. Holding references to `Context`, `View`, or `Activity` in a ViewModel creates memory leaks because the ViewModel outlives the Activity lifecycle during rotation. Use `AndroidViewModel` with `Application` context only if system context is mandatory.

### Q4: How should one-shot events (like Navigation or Toasts) be handled in MVVM?
One-shot events should be exposed using a `Channel` or `SharedFlow` with `replay = 0`, ensuring that screen rotations do not re-trigger navigation actions.

### Q5: How do unit tests inspect ViewModel state changes?
Unit tests instantiate the ViewModel with mock repositories, launch coroutines on `TestDispatcher` (from `kotlinx-coroutines-test`), and verify emitted `uiState` values without requiring Android emulators.
"""

arch_mvi_md = r"""# MVI Architecture in Android: Model-View-Intent & Unidirectional State Reduction

**Model-View-Intent (MVI)** is a reactive architectural pattern designed to enforce immutable state management and strict Unidirectional Data Flow (UDF). Unlike MVVM where state can be updated incrementally across multiple properties, MVI represents the UI state as a single immutable object reduced from discrete user **Intents** (User Actions).

---

## 1. The Core MVI Loop: Intent -> Model -> View

In MVI, every UI change is the result of a functional state reduction: `State_new = reduce(State_old, Intent)`.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mviBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mviBg)" stroke="#a855f7" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MVI Unidirectional State Reduction Loop</text>

  <!-- View -->
  <g transform="translate(80, 110)">
    <rect width="200" height="180" rx="8" fill="#1e1b4b" stroke="#c084fc" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#c084fc" font-family="monospace" font-weight="700" font-size="16">1. View</text>
    <text x="15" y="80" fill="#e9d5ff" font-family="system-ui" font-size="12">• Renders Immutable State</text>
    <text x="15" y="110" fill="#e9d5ff" font-family="system-ui" font-size="12">• Dispatches User Intent</text>
  </g>

  <!-- Intent / Reducer -->
  <g transform="translate(350, 110)">
    <rect width="200" height="180" rx="8" fill="#3b0764" stroke="#a855f7" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#e9d5ff" font-family="monospace" font-weight="700" font-size="16">2. Intent / Reducer</text>
    <text x="15" y="80" fill="#f3e8ff" font-family="system-ui" font-size="12">• Processes Actions</text>
    <text x="15" y="110" fill="#f3e8ff" font-family="system-ui" font-size="12">• Pure Functional State</text>
  </g>

  <!-- Model / State -->
  <g transform="translate(620, 110)">
    <rect width="200" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="16">3. State / Model</text>
    <text x="15" y="80" fill="#94a3b8" font-family="system-ui" font-size="12">• Single Source of Truth</text>
    <text x="15" y="110" fill="#94a3b8" font-family="system-ui" font-size="12">• Emits New State</text>
  </g>

  <!-- Flow Arrows -->
  <path d="M 280 160 L 350 160" stroke="#c084fc" stroke-width="2"/>
  <text x="315" y="150" text-anchor="middle" fill="#c084fc" font-family="monospace" font-size="11">Intent</text>

  <path d="M 550 160 L 620 160" stroke="#a855f7" stroke-width="2"/>
  <text x="585" y="150" text-anchor="middle" fill="#a855f7" font-family="monospace" font-size="11">Reduce</text>

  <path d="M 720 290 Q 450 360 180 290" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>
  <text x="450" y="325" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12">Emit State to View</text>
</svg>

---

## 2. Complete Kotlin MVI Implementation

### Sealed Intent & Immutable State
```kotlin
sealed interface MainIntent {
    data object RefreshData : MainIntent
    data class ToggleBookmark(val itemId: String) : MainIntent
}

data class MainViewState(
    val items: List<String> = emptyList(),
    val isRefreshing: Boolean = false,
    val error: String? = null
)
```

### MVI ViewModel with Reducer
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainMviViewModel(
    private val repository: ItemRepository
) : ViewModel() {

    private val _state = MutableStateFlow(MainViewState())
    val state: StateFlow<MainViewState> = _state.asStateFlow()

    fun processIntent(intent: MainIntent) {
        when (intent) {
            is MainIntent.RefreshData -> loadData()
            is MainIntent.ToggleBookmark -> handleBookmark(intent.itemId)
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isRefreshing = true)
            val data = repository.getItems()
            _state.value = _state.value.copy(isRefreshing = false, items = data)
        }
    }

    private fun handleBookmark(id: String) {
        // Pure state mutation via copy()
        _state.value = _state.value.copy(
            items = _state.value.items.map { if (it == id) "$it [Bookmarked]" else it }
        )
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does MVI differ from MVVM?
In MVVM, the ViewModel may expose multiple independent `StateFlow` or `LiveData` properties. In MVI, the UI state is consolidated into a single immutable data class, and UI actions are sent via explicit sealed `Intent` commands.

### Q2: What are Side-Effects (Single-Event Effects) in MVI?
Side-effects refer to transient events that should not be re-rendered on configuration changes, such as showing a Snackbar or opening a new screen. These are typically handled via a separate `Channel` or `SharedFlow` alongside the main state flow.

### Q3: What is the main advantage of MVI in complex apps?
MVI eliminates race conditions and unpredictable state combinations by guaranteeing that state transitions occur sequentially via pure functions.

### Q4: Does MVI cause performance degradation due to object creation?
No. Modern JVM garbage collectors and Kotlin `data class copy()` operations are highly optimized for short-lived immutable instances.

### Q5: How do you record and replay user sessions with MVI?
Because MVI streams explicit `Intent` instances through a single entry point, developer tools can record the stream of Intents and replay them sequentially to reproduce user bugs deterministically.
"""

arch_mvp_md = r"""# MVP Architecture in Android: Model-View-Presenter & Interface-Driven UI Design

**Model-View-Presenter (MVP)** is a classic Android architectural pattern that cleanly separates UI rendering from business logic through explicit Kotlin/Java interfaces. Prior to the introduction of Jetpack ViewModels and Jetpack Compose, MVP was the primary pattern for eliminating massive `Activity` files.

---

## 1. Structural Component Responsibilities

In MVP, the Presenter holds a direct reference to the View interface, acting as a two-way mediator between the View and the Model.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvpBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Model-View-Presenter Interface Contract</text>

  <!-- View -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View (Activity/Fragment)</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Implements Contract.View</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Displays Data</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Captures Button Clicks</text>
  </g>

  <!-- Presenter -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#075985" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">Presenter</text>
    <text x="15" y="70" fill="#bae6fd" font-family="system-ui" font-size="12">• Contains Business Logic</text>
    <text x="15" y="100" fill="#bae6fd" font-family="system-ui" font-size="12">• Calls view.showLoading()</text>
    <text x="15" y="130" fill="#bae6fd" font-family="system-ui" font-size="12">• No Android Framework Dependency</text>
  </g>

  <!-- Model -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• DB / Network Provider</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Business Entities</text>
  </g>
</svg>

---

## 2. Kotlin Contract & Implementation

### Contract Definition
```kotlin
interface LoginContract {
    interface View {
        fun showLoading()
        fun hideLoading()
        fun showLoginSuccess()
        fun showError(message: String)
    }

    interface Presenter {
        fun attachView(view: View)
        fun detachView()
        fun performLogin(user: String, pass: String)
    }
}
```

### Presenter Implementation
```kotlin
class LoginPresenter(
    private val authService: AuthService
) : LoginContract.Presenter {

    private var view: LoginContract.View? = null

    override fun attachView(view: LoginContract.View) {
        this.view = view
    }

    override fun detachView() {
        this.view = null // Prevents memory leak when Activity destroys
    }

    override fun performLogin(user: String, pass: String) {
        view?.showLoading()
        authService.login(user, pass) { success, error ->
            view?.hideLoading()
            if (success) {
                view?.showLoginSuccess()
            } else {
                view?.showError(error ?: "Authentication failed")
            }
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why must the Presenter detach the View in `onDestroy()`?
Because the Presenter holds a direct reference to the `View` interface (implemented by the Activity), failing to set `view = null` on Activity destruction causes the Presenter to leak the entire Activity context.

### Q2: What is the main drawback of MVP compared to MVVM?
MVP requires a 1:1 bi-directional coupling between the Presenter and View interface. In contrast, MVVM allows multiple Views to observe a single ViewModel via reactive data streams without interface boilerplate.

### Q3: Can MVP be easily unit-tested?
Yes. Because the Presenter depends only on a Kotlin `View` interface and domain interfaces, unit tests can mock the View interface using Mockito/MockK to verify UI callbacks without Android framework dependencies.

### Q4: Does MVP survive screen rotation automatically?
No. When an Activity rotates in standard MVP, the Presenter is destroyed unless manually retained in a custom instance holder or retained Fragment.

### Q5: Is MVP still recommended for new Jetpack Compose apps?
No. Modern Android development favors MVVM/MVI using Jetpack `ViewModel` and `StateFlow` designed specifically for declarative UI frameworks.
"""

arch_mvc_md = r"""# MVC Architecture in Android: Model-View-Controller & Historical Evolution

**Model-View-Controller (MVC)** is one of the earliest architectural patterns applied to Android software development. In traditional desktop MVC, the Controller handles input, the Model manages application logic, and the View displays data. However, in classic Android development, the `Activity` or `Fragment` often assumed both View and Controller roles, creating maintainability challenges.

---

## 1. Component Interactions in Android MVC

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvcBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvcBg)" stroke="#94a3b8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Classic Android MVC Structure</text>

  <!-- View XML -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View (XML Layout)</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Defines Layout Elements</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Passive Component</text>
  </g>

  <!-- Controller Activity -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-weight="700" font-size="15">Controller (Activity)</text>
    <text x="15" y="70" fill="#f43f5e" font-family="system-ui" font-size="12">• Receives UI Inputs</text>
    <text x="15" y="100" fill="#f43f5e" font-family="system-ui" font-size="12">• Controls Model & View</text>
    <text x="15" y="130" fill="#f43f5e" font-family="system-ui" font-size="12">• Tight Framework Coupling</text>
  </g>

  <!-- Model -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Business Logic</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Data Storage & Network</text>
  </g>
</svg>

---

## 2. Typical Android MVC Implementation

```kotlin
// Controller + View coupled inside Activity
class UserActivity : AppCompatActivity() {

    private lateinit var statusTextView: TextView
    private val userModel = UserModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)

        statusTextView = findViewById(R.id.statusTextView)

        findViewById<Button>(R.id.loadButton).setOnClickListener {
            // Controller fetches data from Model
            userModel.fetchData { result ->
                // Controller directly updates View
                statusTextView.text = result
            }
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the "God Activity" issue in Android MVC?
Because `Activity` handles both lifecycle events, view binding, navigation, and user input, MVC applications frequently suffer from bloated Activity files containing thousands of lines of mixed code.

### Q2: Can Model notify View directly in Android MVC?
In traditional desktop MVC, the Model notifies the View via Observers. In Android MVC, the Activity acts as the Controller that updates the View directly upon receiving data from the Model.

### Q3: Why is automated testing difficult in Android MVC?
Because the Controller is tied to Android `Activity` lifecycle methods, unit tests require Robolectric or device emulators instead of running as pure local JVM tests.

### Q4: How does MVC compare to MVVM in Jetpack Compose?
MVC relies on imperative UI manipulation (`findViewById` / `setText`). MVVM with Jetpack Compose uses declarative state binding where the UI automatically recomposes when state changes.

### Q5: Is MVC still used in modern Android projects?
No. Modern Android engineering utilizes MVVM, MVI, or Clean Architecture recommended by Google Architecture Guidelines.
"""

pattern_android_repository_md = r"""# Repository Pattern in Android: Offline-First Data Caching & Source Abstraction

The **Repository Pattern** acts as a mediator between domain/business logic and data sources (such as local SQLite Room databases and remote REST APIs). It abstracts data access details, presenting a unified API to the ViewModel while managing offline caching policies.

---

## 1. Single Source of Truth Architecture

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="repoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#repoBg)" stroke="#10b981" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Offline-First Repository Architecture</text>

  <!-- ViewModel -->
  <g transform="translate(60, 110)">
    <rect width="180" height="180" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="90" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">ViewModel</text>
    <text x="15" y="80" fill="#a5b4fc" font-family="system-ui" font-size="12">• Observes Flow</text>
    <text x="15" y="110" fill="#a5b4fc" font-family="system-ui" font-size="12">• Agnostic of Source</text>
  </g>

  <!-- Repository -->
  <g transform="translate(330, 110)">
    <rect width="240" height="180" rx="8" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
    <text x="120" y="35" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">Repository</text>
    <text x="15" y="80" fill="#a7f3d0" font-family="system-ui" font-size="12">• Manages Cache Policy</text>
    <text x="15" y="110" fill="#a7f3d0" font-family="system-ui" font-size="12">• Fetches Network -> DB</text>
    <text x="15" y="140" fill="#a7f3d0" font-family="system-ui" font-size="12">• Exposes Local Flow</text>
  </g>

  <!-- Sources -->
  <g transform="translate(650, 70)">
    <rect width="190" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="95" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="13">Room Local DB</text>
    <text x="95" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="11">Single Source of Truth</text>
  </g>

  <g transform="translate(650, 200)">
    <rect width="190" height="90" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="95" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-size="13">Retrofit API</text>
    <text x="95" y="60" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="11">Remote Data</text>
  </g>
</svg>

---

## 2. Production Kotlin Offline-First Repository

```kotlin
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class NewsRepositoryImpl(
    private val newsDao: NewsDao,
    private val newsApi: NewsApiService
) : NewsRepository {

    // Expose local database as stream (Single Source of Truth)
    override fun getArticles(): Flow<List<ArticleEntity>> = newsDao.observeArticles()

    override suspend fun refreshArticles() {
        withContext(Dispatchers.IO) {
            try {
                val remoteArticles = newsApi.fetchLatestNews()
                // Update local cache
                newsDao.clearAndInsert(remoteArticles.map { it.toEntity() })
            } catch (e: Exception) {
                // Network failure falls back to existing database cache
                e.printStackTrace()
            }
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What does "Single Source of Truth" mean in the Repository Pattern?
It means the UI observes data coming exclusively from local storage (e.g. Room DB). Network calls update the local database, which automatically triggers reactive Flow emissions to the UI.

### Q2: Should a Repository return Domain Models or Data Entities?
A Repository should transform raw API DTOs and Database Entities into clean Domain Models before returning them to the domain/ViewModel layer.

### Q3: How do you mock a Repository for ViewModel unit tests?
By defining a Kotlin `interface NewsRepository` and supplying a fake or mock implementation (`FakeNewsRepository`) during testing.

### Q4: Should a Repository manage thread dispatching?
Yes. Operations inside a Repository should be main-safe, using `withContext(Dispatchers.IO)` for database and network execution.

### Q5: Is a Repository required for simple apps with no local database?
Yes. Even without a local database, a Repository abstracts API clients, enabling easy swapping of network providers or adding caching later.
"""

pattern_android_flow_md = r"""# Kotlin Flows in Android: StateFlow, SharedFlow & Asynchronous Streams

**Kotlin Flow** is a cold asynchronous data stream built on Coroutines that sequentially emits values and completes normally or with an exception. In modern Android development, **StateFlow** and **SharedFlow** serve as hot streams for reactive UI state updates and single-event emissions.

---

## 1. Architectural Stream Types: Cold Flow vs StateFlow vs SharedFlow

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="flowBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#flowBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Kotlin Flow Types & Stream Mechanics</text>

  <!-- Cold Flow -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Cold Flow</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">• Triggers on collect()</text>
    <text x="15" y="105" fill="#94a3b8" font-family="system-ui" font-size="12">• Independent per collector</text>
    <text x="15" y="135" fill="#94a3b8" font-family="system-ui" font-size="12">• Network & DB Queries</text>
  </g>

  <!-- StateFlow -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">StateFlow</text>
    <text x="15" y="75" fill="#bae6fd" font-family="system-ui" font-size="12">• Hot Observable State</text>
    <text x="15" y="105" fill="#bae6fd" font-family="system-ui" font-size="12">• Holds initial value</text>
    <text x="15" y="135" fill="#bae6fd" font-family="system-ui" font-size="12">• Replays latest value (1)</text>
  </g>

  <!-- SharedFlow -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">SharedFlow</text>
    <text x="15" y="75" fill="#a7f3d0" font-family="system-ui" font-size="12">• Hot Broadcast Stream</text>
    <text x="15" y="105" fill="#a7f3d0" font-family="system-ui" font-size="12">• Configurable replay</text>
    <text x="15" y="135" fill="#a7f3d0" font-family="system-ui" font-size="12">• Navigation / One-Shot</text>
  </g>
</svg>

---

## 2. Stream Comparison Matrix

| Feature | Cold Flow | StateFlow | SharedFlow |
| :--- | :--- | :--- | :--- |
| **Execution Model** | Cold (Lazy on `.collect()`) | Hot (Active in scope) | Hot (Active in scope) |
| **Initial Value** | Not required | Mandatory | Optional |
| **Replay Buffer** | None | Exactly 1 | Configurable (`replay >= 0`) |
| **Use Case** | Room queries, REST calls | UI State representation | One-shot events (Toasts/Nav) |

---

## 3. Production Kotlin Flow Operations

```kotlin
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    // 1. Cold Flow emitting items
    val numberFlow: Flow<Int> = flow {
        for (i in 1..5) {
            emit(i)
        }
    }

    // 2. Transformation & Filtering Operators
    numberFlow
        .map { it * 10 }
        .filter { it > 20 }
        .debounce(300)
        .catch { e -> println("Error: ${e.message}") }
        .collect { value ->
            println("Collected transformed value: $value")
        }
}
```

### StateFlow & SharedFlow ViewModel Integration
```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class SearchViewModel : ViewModel() {

    // Persistent StateFlow for UI Search Query State
    private val _searchState = MutableStateFlow("")
    val searchState: StateFlow<String> = _searchState.asStateFlow()

    // SharedFlow for One-Shot Navigation Event
    private val _eventFlow = MutableSharedFlow<String>()
    val eventFlow: SharedFlow<String> = _eventFlow.asSharedFlow()

    fun updateQuery(query: String) {
        _searchState.value = query
    }

    fun submitSearch() {
        viewModelScope.launch {
            _eventFlow.emit("NavigateToResultsScreen")
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between a Cold Flow and a Hot Flow?
A Cold Flow does not produce items until a collector explicitly invokes `.collect()`. Each collector executes the flow block independently. A Hot Flow (like StateFlow or SharedFlow) emits values regardless of whether active collectors exist.

### Q2: Why use `repeatOnLifecycle` when collecting Flows in Android Activities?
`repeatOnLifecycle(Lifecycle.State.STARTED)` automatically pauses Flow collection when the Activity or Fragment moves into the background (`ON_STOP`), preventing background battery drain and crashes.

### Q3: What is the difference between StateFlow and SharedFlow?
`StateFlow` always retains and emits the latest state value (`replay = 1`), requires an initial value, and enforces equality check updates. `SharedFlow` can replay zero or more items and is optimized for broadcasting single-time events.

### Q4: How does `stateIn()` convert a Cold Flow to a StateFlow?
The `stateIn(scope, started, initialValue)` operator converts a cold Flow into a hot StateFlow bound to a designated `CoroutineScope` (such as `viewModelScope`).

### Q5: How do you handle exceptions inside a Kotlin Flow?
Exceptions inside Flows are caught using the `.catch { exception -> emit(...) }` operator or standard try-catch blocks surrounding `.collect()`.
"""

pattern_android_livedata_md = r"""# LiveData in Android: Lifecycle Awareness & Reactive UI Binding

**LiveData** is an observable data holder class designed specifically for Android. Unlike regular observables, LiveData is lifecycle-aware, meaning it respects the active state of Android components (Activities, Fragments, or Services), ensuring UI observers only receive updates when in an active lifecycle state (`STARTED` or `RESUMED`).

---

## 1. Lifecycle-Aware Emission Mechanism

<svg viewBox="0 0 900 320" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="liveDataBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="320" rx="12" fill="url(#liveDataBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">LiveData Lifecycle Awareness</text>

  <!-- LiveData -->
  <g transform="translate(100, 100)">
    <rect width="220" height="160" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="16">MutableLiveData</text>
    <text x="15" y="80" fill="#fef9c3" font-family="system-ui" font-size="12">• setValue() (Main Thread)</text>
    <text x="15" y="110" fill="#fef9c3" font-family="system-ui" font-size="12">• postValue() (Background)</text>
  </g>

  <!-- Observer -->
  <g transform="translate(580, 100)">
    <rect width="220" height="160" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="16">Activity Observer</text>
    <text x="15" y="75" fill="#94a3b8" font-family="system-ui" font-size="12">Lifecycle: STARTED / RESUMED</text>
    <text x="15" y="110" fill="#22c55e" font-family="system-ui" font-weight="700" font-size="12">✅ Receives Data Update</text>
    <text x="15" y="135" fill="#ef4444" font-family="system-ui" font-size="11">STOPPED -> Pauses Updates</text>
  </g>

  <path d="M 320 180 L 580 180" stroke="#fde047" stroke-width="2.5" marker-end="url(#arrow)"/>
</svg>

---

## 2. Kotlin Implementation & Transformations

```kotlin
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.map

class UserViewModel : ViewModel() {

    private val _userName = MutableLiveData<String>()
    val userName: LiveData<String> = _userName

    // LiveData transformation
    val upperCaseName: LiveData<String> = _userName.map { it.uppercase() }

    fun updateName(newName: String) {
        _userName.value = newName // Main Thread
    }

    fun updateNameFromBackground(newName: String) {
        _userName.postValue(newName) // Background Thread safe
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between `setValue()` and `postValue()` in LiveData?
`setValue()` must be called from the main thread and updates observers synchronously. `postValue()` can be called from any background thread and posts a task to the main thread looper.

### Q2: Why does LiveData prevent Activity memory leaks?
Observers are bound to a `LifecycleOwner`. When the Activity reaches the `DESTROYED` state, LiveData automatically removes the observer reference.

### Q3: Is LiveData still recommended over Kotlin StateFlow?
Google recommends StateFlow for new Android development, especially with Jetpack Compose. LiveData remains heavily used in legacy XML projects.

### Q4: Can LiveData handle complex asynchronous stream transformations?
LiveData supports basic `map` and `switchMap` transformations, but lacks advanced reactive operators (like `debounce`, `combine`, or `zip`) available in Kotlin Flow.

### Q5: How do you convert LiveData to Flow?
Use the `asFlow()` extension function provided by the `androidx.lifecycle` library.
"""

async_coroutines_md = r"""# Kotlin Coroutines in Android: Dispatchers, Suspend Functions & Scope Management

**Kotlin Coroutines** provide light-weight, non-blocking asynchronous programming for Android. Built around the concept of **Structured Concurrency**, coroutines allow developers to write sequential asynchronous code without callback hell while ensuring background tasks are cancelled when parent UI scopes are destroyed.

---

## 1. Coroutine Architecture & Dispatchers

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coroutineBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#coroutineBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Kotlin Coroutine Dispatchers</text>

  <!-- Main -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Dispatchers.Main</text>
    <text x="15" y="80" fill="#94a3b8" font-family="system-ui" font-size="12">• Android UI Thread</text>
    <text x="15" y="110" fill="#94a3b8" font-family="system-ui" font-size="12">• Jetpack Compose / Views</text>
    <text x="15" y="140" fill="#94a3b8" font-family="system-ui" font-size="12">• Light UI tasks</text>
  </g>

  <!-- IO -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">Dispatchers.IO</text>
    <text x="15" y="80" fill="#a5b4fc" font-family="system-ui" font-size="12">• Network REST Requests</text>
    <text x="15" y="110" fill="#a5b4fc" font-family="system-ui" font-size="12">• Room DB Queries</text>
    <text x="15" y="140" fill="#a5b4fc" font-family="system-ui" font-size="12">• File Disk I/O</text>
  </g>

  <!-- Default -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Dispatchers.Default</text>
    <text x="15" y="80" fill="#a7f3d0" font-family="system-ui" font-size="12">• CPU-Intensive Work</text>
    <text x="15" y="110" fill="#a7f3d0" font-family="system-ui" font-size="12">• Sorting / JSON Parsing</text>
    <text x="15" y="140" fill="#a7f3d0" font-family="system-ui" font-size="12">• Image Processing</text>
  </g>
</svg>

---

## 2. Production Kotlin Coroutine Code

```kotlin
import kotlinx.coroutines.*

class UserDataUseCase(
    private val api: ApiService,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    // Suspend function
    suspend fun fetchAndProcessUserData(userId: String): UserProfile = withContext(ioDispatcher) {
        // Parallel execution with async
        val deferredDetails = async { api.getUserDetails(userId) }
        val deferredOrders = async { api.getUserOrders(userId) }

        val details = deferredDetails.await()
        val orders = deferredOrders.await()

        UserProfile(details, orders)
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why are Kotlin Coroutines described as "light-weight threads"?
Thousands of coroutines can run concurrently on a small thread pool without exceeding memory limits because coroutines suspend execution without blocking underlying OS threads.

### Q2: What is Structured Concurrency in Coroutines?
Structured Concurrency guarantees that when a parent scope (e.g. `viewModelScope`) is cancelled, all child coroutines launched within that scope are automatically cancelled.

### Q3: What is the difference between `launch` and `async`?
`launch` starts a coroutine that returns a `Job` (fire-and-forget). `async` starts a coroutine that returns a `Deferred<T>`, allowing callers to call `.await()` to retrieve a result value.

### Q4: What happens when an exception is thrown inside a CoroutineScope?
By default, an unhandled exception in a coroutine cancels its parent and all sibling coroutines. Use `SupervisorJob` or `supervisorScope` to isolate failures.

### Q5: How do suspend functions work under the hood in bytecode?
Kotlin compiles suspend functions into a State Machine, passing a `Continuation` object that stores local state when execution suspends.
"""

async_threads_md = r"""# Android Threading & HandlerThread: Looper, MessageQueue & Thread Execution

Understanding **Android Threading** fundamentals—including the **Main UI Thread**, **Handler**, **Looper**, and **MessageQueue**—is essential for avoiding Application Not Responding (ANR) dialogs and managing low-level background execution.

---

## 1. The Android Handler - Looper - MessageQueue Loop

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="threadBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#threadBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android Main Thread Looper Architecture</text>

  <!-- Handler -->
  <g transform="translate(60, 110)">
    <rect width="200" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Handler</text>
    <text x="15" y="80" fill="#94a3b8" font-family="system-ui" font-size="12">• Posts Runnable/Message</text>
    <text x="15" y="110" fill="#94a3b8" font-family="system-ui" font-size="12">• Enqueues to Queue</text>
  </g>

  <!-- MessageQueue -->
  <g transform="translate(350, 110)">
    <rect width="200" height="180" rx="8" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">MessageQueue</text>
    <text x="15" y="80" fill="#a5b4fc" font-family="system-ui" font-size="12">• FIFO Queue</text>
    <text x="15" y="110" fill="#a5b4fc" font-family="system-ui" font-size="12">• Holds Messages</text>
  </g>

  <!-- Looper -->
  <g transform="translate(640, 110)">
    <rect width="200" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="100" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Looper</text>
    <text x="15" y="80" fill="#a7f3d0" font-family="system-ui" font-size="12">• Infinite Loop</text>
    <text x="15" y="110" fill="#a7f3d0" font-family="system-ui" font-size="12">• Dispatches to Handler</text>
  </g>
</svg>

---

## 2. Kotlin Handler & Background Thread Example

```kotlin
import android.os.Handler
import android.os.HandlerThread
import android.os.Looper

class CustomBackgroundWorker {

    private val handlerThread = HandlerThread("BackgroundWorkerThread").apply { start() }
    private val backgroundHandler = Handler(handlerThread.looper)
    private val mainHandler = Handler(Looper.getMainLooper())

    fun executeBackgroundTask(onComplete: (String) -> Unit) {
        backgroundHandler.post {
            // Heavy computation on background thread
            Thread.sleep(1000)
            val result = "Processing complete"

            // Post result back to Main UI Thread
            mainHandler.post {
                onComplete(result)
            }
        }
    }

    fun stop() {
        handlerThread.quitSafely()
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What causes an Application Not Responding (ANR) error in Android?
An ANR is triggered when the Main UI Thread is blocked for more than 5 seconds by long-running operations like disk I/O, heavy computation, or database queries.

### Q2: What is the role of `Looper.prepare()` and `Looper.loop()`?
`Looper.prepare()` initializes a `MessageQueue` for the current thread. `Looper.loop()` starts the infinite loop processing incoming messages.

### Q3: Why is `AsyncTask` deprecated in Android?
`AsyncTask` led to memory leaks, incorrect cancellation handling, and crashes on screen orientation changes. It was superseded by Kotlin Coroutines and RxJava.

### Q4: What is the difference between `Handler.post()` and `Handler.sendMessage()`?
`post()` accepts a `Runnable` object. `sendMessage()` accepts a `Message` object containing data fields (e.g. `what`, `arg1`, `obj`).

### Q5: How do you safely stop a `HandlerThread`?
Call `handlerThread.quitSafely()`, which finishes processing all pending messages already queued before terminating the thread.
"""

async_workmanager_md = r"""# WorkManager in Android: Persistent Background Tasks & Constraints

**WorkManager** is the official Jetpack library for deferrable, guaranteed background work in Android. It automatically chooses the optimal execution engine (such as `JobScheduler` or `AlarmManager`) based on device API level and system battery state, ensuring tasks execute even if the app process is killed or the device reboots.

---

## 1. WorkManager Task Types & Execution Flow

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#wmBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">WorkManager Persistent Task Pipeline</text>

  <!-- WorkRequest -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">WorkRequest</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• OneTimeWorkRequest</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• PeriodicWorkRequest</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Network/Battery Constraints</text>
  </g>

  <!-- WorkManager Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">WorkManager Engine</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Persists in SQLite DB</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Evaluates System State</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• JobScheduler Fallback</text>
  </g>

  <!-- CoroutineWorker -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">CoroutineWorker</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• doWork(): Result</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Result.success()</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Result.retry()</text>
  </g>
</svg>

---

## 2. Production Kotlin CoroutineWorker & Enqueue

```kotlin
import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

// 1. Worker Class
class ImageUploadWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // Upload logic here
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// 2. Enqueueing with Constraints
fun scheduleUpload(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.UNMETERED) // Wi-Fi only
        .setRequiresBatteryNotLow(true)
        .build()

    val uploadWorkRequest = OneTimeWorkRequestBuilder<ImageUploadWorker>()
        .setConstraints(constraints)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.MINUTES)
        .build()

    WorkManager.getInstance(context).enqueue(uploadWorkRequest)
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: When should WorkManager be used instead of Kotlin Coroutines?
Use Coroutines for tasks that should only execute while the app is active in the foreground. Use WorkManager for guaranteed persistent tasks (like syncing data or uploading logs) that must finish even if the user exits the app.

### Q2: What is the minimum interval for PeriodicWorkRequest?
The minimum repeat interval for `PeriodicWorkRequest` is **15 minutes**.

### Q3: How does WorkManager handle task failures?
If `doWork()` returns `Result.retry()`, WorkManager reschedules execution using exponential or linear backoff policies based on configured criteria.

### Q4: Can WorkManager tasks be chained sequentially?
Yes. You can chain requests using `WorkManager.beginWith(taskA).then(taskB).enqueue()`.

### Q5: How do you pass input data to a WorkWorker?
Input data is passed using `Data.Builder()` via `setInputData()`, and retrieved inside the worker using `inputData.getString(...)`.
"""

print("Injecting Android Batch 1 Articles into deBlogData.ts...")
inject_into_de_blog_data('arch-mvvm', arch_mvvm_md)
inject_into_de_blog_data('arch-mvi', arch_mvi_md)
inject_into_de_blog_data('arch-mvp', arch_mvp_md)
inject_into_de_blog_data('arch-mvc', arch_mvc_md)
inject_into_de_blog_data('pattern-android-repository', pattern_android_repository_md)
inject_into_de_blog_data('pattern-android-flow', pattern_android_flow_md)
inject_into_de_blog_data('pattern-android-livedata', pattern_android_livedata_md)
inject_into_de_blog_data('async-coroutines', async_coroutines_md)
inject_into_de_blog_data('async-threads', async_threads_md)
inject_into_de_blog_data('async-workmanager', async_workmanager_md)
print("Android Batch 1 complete!")
