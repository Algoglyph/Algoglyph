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

# 3. ARCH-MVP
arch_mvp_md = r"""# Comprehensive Guide to MVP Architecture in Android: Model-View-Presenter & Contract Interfaces

**Model-View-Presenter (MVP)** is a classic Android architectural pattern designed to decouple user interface rendering from business logic through explicit bidirectional Kotlin/Java contract interfaces. Prior to the introduction of Jetpack ViewModels and Jetpack Compose, MVP served as the primary architecture for eliminating massive Activity files and enabling fast local JVM unit testing.

---

## 1. Architectural Components & Component Coupling

In MVP, the Presenter holds a direct reference to a passive View interface. It receives user events from the View, communicates with the Model layer, and manually instructs the View to update its UI via interface callbacks.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvpBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MVP Contract & Interface Interactions</text>

  <!-- View -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View (Activity)</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Implements Contract.View</text>
    <text x="15" y="90" fill="#94a3b8" font-family="system-ui" font-size="12">• Passive Component</text>
    <text x="15" y="115" fill="#94a3b8" font-family="system-ui" font-size="12">• Forwards UI Events</text>
    <text x="15" y="140" fill="#94a3b8" font-family="system-ui" font-size="12">• Manages Android Lifecycle</text>
  </g>

  <!-- Presenter -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#075985" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#e0f2fe" font-family="monospace" font-weight="700" font-size="15">Presenter</text>
    <text x="15" y="65" fill="#bae6fd" font-family="system-ui" font-size="12">• Contains Business Logic</text>
    <text x="15" y="90" fill="#bae6fd" font-family="system-ui" font-size="12">• Calls view.showLoading()</text>
    <text x="15" y="115" fill="#bae6fd" font-family="system-ui" font-size="12">• Agnostic of Android Framework</text>
    <text x="15" y="140" fill="#bae6fd" font-family="system-ui" font-size="12">• Pure JVM Instance</text>
  </g>

  <!-- Model -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model Layer</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Database / Network Services</text>
    <text x="15" y="90" fill="#a7f3d0" font-family="system-ui" font-size="12">• Business Entities</text>
    <text x="15" y="115" fill="#a7f3d0" font-family="system-ui" font-size="12">• Repositories & Data Sources</text>
  </g>
</svg>

---

## 2. Production Kotlin Implementation & Contract Protocol

### Step 1: Define Interface Contract
```kotlin
interface LoginContract {
    interface View {
        fun showProgress()
        fun hideProgress()
        fun setUsernameError(error: String?)
        fun setPasswordError(error: String?)
        fun navigateToDashboard()
        fun showLoginError(message: String)
    }

    interface Presenter {
        fun attachView(view: View)
        fun detachView()
        fun login(user: String, pass: String)
    }
}
```

### Step 2: Implement Presenter with Detach Protection
```kotlin
class LoginPresenter(
    private val authRepository: AuthRepository
) : LoginContract.Presenter {

    private var view: LoginContract.View? = null

    override fun attachView(view: LoginContract.View) {
        this.view = view
    }

    override fun detachView() {
        this.view = null // CRITICAL: Prevents Memory Leak when Activity finishes
    }

    override fun login(user: String, pass: String) {
        if (user.isBlank()) {
            view?.setUsernameError("Username cannot be empty")
            return
        }
        if (pass.isBlank()) {
            view?.setPasswordError("Password cannot be empty")
            return
        }

        view?.showProgress()
        authRepository.login(user, pass) { success, error ->
            view?.hideProgress()
            if (success) {
                view?.navigateToDashboard()
            } else {
                view?.showLoginError(error ?: "Authentication failed")
            }
        }
    }
}
```

### Step 3: Implement Activity View
```kotlin
class LoginActivity : AppCompatActivity(), LoginContract.View {

    private lateinit var presenter: LoginContract.Presenter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        presenter = LoginPresenter(AuthRepositoryImpl())
        presenter.attachView(this)

        findViewById<Button>(R.id.loginBtn).setOnClickListener {
            val user = findViewById<EditText>(R.id.userEdt).text.toString()
            val pass = findViewById<EditText>(R.id.passEdt).text.toString()
            presenter.login(user, pass)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        presenter.detachView() // Prevent Activity Memory Leak
    }

    override fun showProgress() { /* Show ProgressBar */ }
    override fun hideProgress() { /* Hide ProgressBar */ }
    override fun setUsernameError(error: String?) { /* Update UI Error */ }
    override fun setPasswordError(error: String?) { /* Update UI Error */ }
    override fun navigateToDashboard() { /* Start DashboardActivity */ }
    override fun showLoginError(message: String) { /* Show Toast */ }
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

# 4. ARCH-MVC
arch_mvc_md = r"""# Comprehensive Guide to MVC Architecture in Android: Model-View-Controller & Legacy Codebases

**Model-View-Controller (MVC)** is one of the foundational software design patterns historically used in mobile and desktop applications. In Android development, classic MVC splits application logic between XML layouts (View), `Activity` / `Fragment` classes (Controller), and Data Entities/APIs (Model). However, due to Android lifecycle constraints, `Activity` classes frequently doubled as both View and Controller, giving rise to maintenance bottlenecks.

---

## 1. Component Structure & Architectural Pitfalls

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mvcBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mvcBg)" stroke="#94a3b8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android MVC Architecture & Coupling Breakdown</text>

  <!-- View XML -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">View (XML Layout)</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Passive UI Markup</text>
    <text x="15" y="90" fill="#94a3b8" font-family="system-ui" font-size="12">• Inflatable XML Views</text>
    <text x="15" y="115" fill="#94a3b8" font-family="system-ui" font-size="12">• Lacks Dynamic Logic</text>
  </g>

  <!-- Controller Activity -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fb7185" font-family="monospace" font-weight="700" font-size="15">Controller (Activity)</text>
    <text x="15" y="65" fill="#f43f5e" font-family="system-ui" font-size="12">• Handles Touch Events</text>
    <text x="15" y="90" fill="#f43f5e" font-family="system-ui" font-size="12">• Fetches Data from Model</text>
    <text x="15" y="115" fill="#f43f5e" font-family="system-ui" font-size="12">• Imperative View Updates</text>
    <text x="15" y="140" fill="#f43f5e" font-family="system-ui" font-size="12">• Tight Framework Coupling</text>
  </g>

  <!-- Model -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Model Layer</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Business & Data Logic</text>
    <text x="15" y="90" fill="#a7f3d0" font-family="system-ui" font-size="12">• SQLite / REST Endpoints</text>
    <text x="15" y="115" fill="#a7f3d0" font-family="system-ui" font-size="12">• Data Structs & Entities</text>
  </g>
</svg>

---

## 2. Legacy Android MVC Implementation

```kotlin
// Controller + View coupled inside Activity
class LegacyUserActivity : AppCompatActivity() {

    private lateinit var statusTextView: TextView
    private lateinit var progressBar: ProgressBar
    private val userModel = UserModel()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user)

        statusTextView = findViewById(R.id.statusTextView)
        progressBar = findViewById(R.id.progressBar)

        findViewById<Button>(R.id.loadButton).setOnClickListener {
            // Controller triggers Model operation
            progressBar.visibility = View.VISIBLE
            userModel.fetchUserData { result ->
                // Controller directly manipulates View elements
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    statusTextView.text = result
                }
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

inject_into_de_blog_data('arch-mvp', arch_mvp_md)
inject_into_de_blog_data('arch-mvc', arch_mvc_md)

print("Batch 1 (Part 3 - MVP & MVC) Injected!")
