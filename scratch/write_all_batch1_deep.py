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

# 1. ARCH-MVVM
arch_mvvm_md = r"""# Comprehensive Guide to MVVM Architecture in Android: Model-View-ViewModel, StateFlow & SavedStateHandle

**Model-View-ViewModel (MVVM)** is the official architectural pattern recommended by Google for robust, production-grade Android application development. MVVM strictly enforces the separation of concerns by isolating user interface logic (Jetpack Compose or XML Views) from business logic, domain use cases, and data persistence layers. This separation ensures code testability, maintainability, and complete resistance to Android Activity lifecycle destructions caused by screen rotations or system configuration changes.

---

## 1. Architectural Motivation & Unidirectional Data Flow (UDF)

Prior to modern Android architecture components, developers frequently placed networking, database queries, and UI rendering logic directly inside `Activity` or `Fragment` classes. This created massive, tightly coupled codebases known as "God Activities" that were virtually impossible to unit test and prone to memory leaks.

MVVM resolves these issues by introducing **Unidirectional Data Flow (UDF)**:
1. **User Events** (button clicks, text input, scroll gestures) originate in the **View** and are dispatched to the **ViewModel**.
2. The **ViewModel** receives the event, executes business logic, invokes the **Repository** layer, and updates an immutable state container.
3. The **View** observes the immutable state container (e.g. `StateFlow`) and automatically recomposes or redraws the UI whenever a new state is emitted.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvvmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvvmBg)" stroke="#6366f1" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MVVM Architecture Data & Event Flow Pipeline</text>

  <!-- View Layer -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View Layer</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Jetpack Compose / XML</text>
    <text x="15" y="90" fill="#94a3b8" font-family="system-ui" font-size="12">• Passive UI Rendering</text>
    <text x="15" y="115" fill="#94a3b8" font-family="system-ui" font-size="12">• Dispatches User Events</text>
    <text x="15" y="140" fill="#94a3b8" font-family="system-ui" font-size="12">• Observes StateFlow</text>
  </g>

  <!-- ViewModel Layer -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#c7d2fe" font-family="monospace" font-weight="700" font-size="15">ViewModel Layer</text>
    <text x="15" y="65" fill="#a5b4fc" font-family="system-ui" font-size="12">• Retains State on Rotation</text>
    <text x="15" y="90" fill="#a5b4fc" font-family="system-ui" font-size="12">• Manages MutableStateFlow</text>
    <text x="15" y="115" fill="#a5b4fc" font-family="system-ui" font-size="12">• Executes viewModelScope</text>
    <text x="15" y="140" fill="#a5b4fc" font-family="system-ui" font-size="12">• Agnostic of Android UI</text>
  </g>

  <!-- Model Layer -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model Layer</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Repository Abstraction</text>
    <text x="15" y="90" fill="#a7f3d0" font-family="system-ui" font-size="12">• Local Database (Room)</text>
    <text x="15" y="115" fill="#a7f3d0" font-family="system-ui" font-size="12">• Remote API (Retrofit)</text>
    <text x="15" y="140" fill="#a7f3d0" font-family="system-ui" font-size="12">• Business Entities</text>
  </g>

  <!-- Flow Arrows -->
  <path d="M 270 150 L 345 150" stroke="#38bdf8" stroke-width="2"/>
  <text x="307" y="140" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="11">User Action</text>

  <path d="M 345 220 L 270 220" stroke="#818cf8" stroke-width="2"/>
  <text x="307" y="235" text-anchor="middle" fill="#818cf8" font-family="monospace" font-size="11">StateFlow</text>

  <path d="M 555 150 L 630 150" stroke="#818cf8" stroke-width="2"/>
  <text x="592" y="140" text-anchor="middle" fill="#818cf8" font-family="monospace" font-size="11">Fetch Data</text>

  <path d="M 630 220 L 555 220" stroke="#34d399" stroke-width="2"/>
  <text x="592" y="235" text-anchor="middle" fill="#34d399" font-family="monospace" font-size="11">Domain Data</text>
</svg>

---

## 2. Layer Responsibilities & Memory Lifecycle

### View (UI Layer)
The View consists of Activities, Fragments, or Jetpack Compose composables. Its sole responsibility is to display UI components on screen and capture user inputs. It must contain zero business logic or direct database/network calls.

### ViewModel (State Holder)
The ViewModel retains application state and exposes it via observable streams (such as `StateFlow` or `LiveData`). The Android framework keeps ViewModel instances alive in memory during configuration changes (like screen rotation) by attaching them to a `ViewModelStoreOwner`.

### Model (Data Layer)
The Model encompasses repositories, data access objects (DAOs), network endpoints, and domain models. It acts as the single source of truth for application data.

---

## 3. Production MVVM Implementation (Kotlin & Jetpack Compose)

### Step 1: Define Immutable UI State
```kotlin
data class UserProfileUiState(
    val isLoading: Boolean = false,
    val username: String = "",
    val email: String = "",
    val avatarUrl: String = "",
    val errorMessage: String? = null
)
```

### Step 2: Implement Domain Repository Interface
```kotlin
interface UserRepository {
    suspend fun getUserProfile(userId: String): UserDomainModel
}
```

### Step 3: Implement Jetpack ViewModel
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

    private val _uiState = MutableStateFlow(UserProfileUiState())
    val uiState: StateFlow<UserProfileUiState> = _uiState.asStateFlow()

    fun loadUserProfile(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            try {
                val user = userRepository.getUserProfile(userId)
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        username = user.name,
                        email = user.email,
                        avatarUrl = user.avatarUrl
                    ) 
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        errorMessage = e.localizedMessage ?: "An unexpected error occurred"
                    ) 
                }
            }
        }
    }
}
```

### Step 4: Jetpack Compose UI Binding
```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun ComposableUserProfileScreen(
    viewModel: UserProfileViewModel
) {
    // Collect StateFlow safely with Android Lifecycle awareness
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when {
        uiState.isLoading -> LoadingSpinner()
        uiState.errorMessage != null -> ErrorMessage(uiState.errorMessage!!)
        else -> ProfileContent(uiState.username, uiState.email, uiState.avatarUrl)
    }
}
```

---

## 4. MVVM vs MVP vs MVI Comparison Matrix

| Metric | MVVM | MVP | MVI |
| :--- | :--- | :--- | :--- |
| **State Coupling** | Observable Streams (`StateFlow`) | 1:1 Interface Method Calls | Single Immutable State Object |
| **Component Binding** | Declarative Data Binding / Compose | Imperative Presenter Callbacks | Reactive Intent Reducer Loop |
| **Configuration Change Survival** | Native via `ViewModelStore` | Requires Custom Retained Presenter | Native via `ViewModelStore` |
| **Unit Testing Effort** | Low (Test StateFlow emissions) | Medium (Mock Interface calls) | Extremely Low (Pure Functions) |
| **Boilerplate Code** | Low to Moderate | High (Interface contracts) | Moderate (Sealed Intent hierarchy) |

---

## 5. Common Anti-Patterns & Pitfalls

1. **Leaking Context / Views in ViewModel**: Storing a reference to an `Activity`, `Fragment`, or `View` inside a ViewModel causes massive memory leaks because the ViewModel outlives Activity instances during screen rotation.
2. **Exposing `MutableStateFlow` Directly**: Always expose immutable `StateFlow<T>` via `.asStateFlow()`. Exposing `MutableStateFlow` allows external UI components to mutate state directly, violating Unidirectional Data Flow.
3. **Executing Heavy Work on `Dispatchers.Main`**: Launching network or database operations without switching to `Dispatchers.IO` causes UI stuttering and Application Not Responding (ANR) crashes.

---

## Frequently Asked Questions (FAQs)

### Q1: How does ViewModel survive Activity destruction during screen rotation?
The ViewModel is stored in a `ViewModelStore` owned by the `Activity`. When screen rotation occurs, the Activity instance is destroyed and recreated, but the `ViewModelStore` remains retained in memory until the user explicitly navigates away or finishes the Activity.

### Q2: What is the difference between LiveData and StateFlow in MVVM?
LiveData is lifecycle-aware and tightly bound to Android UI frameworks. StateFlow is part of Kotlin Coroutines, platform-agnostic, requires an initial value, and integrates natively with Jetpack Compose `collectAsStateWithLifecycle()`.

### Q3: Should a ViewModel ever reference an Android Context?
No. Holding references to `Context`, `View`, or `Activity` in a ViewModel creates memory leaks. If application-level resources (like system services) are required, inherit from `AndroidViewModel` to access the global `Application` context safely.

### Q4: How should one-shot events (like Toast messages or Navigation) be handled in MVVM?
One-shot events should be exposed using a `Channel` or `SharedFlow` with `replay = 0`, ensuring that screen rotations do not re-trigger navigation actions or duplicate toast popups.

### Q5: How do you write unit tests for an MVVM ViewModel?
Instantiate the ViewModel with mock repositories, launch coroutines on a `StandardTestDispatcher` (from `kotlinx-coroutines-test`), and verify emitted `uiState` values using testing tools like Turbine.
"""

inject_into_de_blog_data('arch-mvvm', arch_mvvm_md)

print("Batch 1 Deep Articles Injected Successfully!")
