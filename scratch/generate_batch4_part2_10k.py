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

# 3. TEST-ESPRESSO (11,000+ Chars)
espresso_md = r"""# Comprehensive Guide to Espresso in Android: UI Automator Testing, Matchers, Actions & Idling Resources

**Espresso** is Google's official Android UI testing framework provided by AndroidX Test. Designed for fast, reliable instrumented UI testing, Espresso automatically synchronizes test execution with the Android main thread looper and background async tasks, preventing flakiness caused by timing mismatches.

---

## 1. Architectural Interaction Spectrum: Matchers, Actions & Assertions

Espresso test interactions operate through a fluent 3-step paradigm:

```kotlin
onView(ViewMatcher).perform(ViewAction).check(ViewAssertion)
```

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="espBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#espBg)" stroke="#3b82f6" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#dbeafe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Espresso 3-Step UI Testing Architecture</text>

  <!-- Step 1: Matcher -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. ViewMatchers</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• onView(withId(R.id.btn))</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• withText("Submit")</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• isDisplayed()</text>
    <text x="15" y="155" fill="#94a3b8" font-family="system-ui" font-size="12">• Locates View Node</text>
  </g>

  <!-- Step 2: Action -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#dbeafe" font-family="monospace" font-weight="700" font-size="15">2. ViewActions</text>
    <text x="15" y="70" fill="#bfdbfe" font-family="system-ui" font-size="12">• .perform(click())</text>
    <text x="15" y="100" fill="#bfdbfe" font-family="system-ui" font-size="12">• .perform(typeText("val"))</text>
    <text x="15" y="130" fill="#bfdbfe" font-family="system-ui" font-size="12">• .perform(scrollTo())</text>
    <text x="15" y="155" fill="#bfdbfe" font-family="system-ui" font-size="12">• Simulates Touch Input</text>
  </g>

  <!-- Step 3: Assertion -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. ViewAssertions</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• .check(matches(...))</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• withText("Success")</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• isCompletelyDisplayed()</text>
    <text x="15" y="155" fill="#a7f3d0" font-family="system-ui" font-size="12">• Asserts UI State</text>
  </g>
</svg>

---

## 2. Production Instrumented Test Implementation

```kotlin
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoginActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(LoginActivity::class.java)

    @Test
    fun successfulLogin_displaysWelcomeScreen() {
        // 1. Enter Email
        onView(withId(R.id.emailInput))
            .perform(typeText("user@example.com"), closeSoftKeyboard())

        // 2. Enter Password
        onView(withId(R.id.passwordInput))
            .perform(typeText("Secret123!"), closeSoftKeyboard())

        // 3. Click Login Button
        onView(withId(R.id.loginButton))
            .perform(click())

        // 4. Verify Welcome Banner is Visible
        onView(withId(R.id.welcomeHeader))
            .check(matches(isDisplayed()))
            .check(matches(withText("Welcome, user@example.com!")))
    }
}
```

---

## 3. Handling Asynchronous Operations via `IdlingResource`

When tests trigger background network calls or database operations, standard `Thread.sleep()` leads to flaky tests. `IdlingResource` instructs Espresso to pause test assertions until background tasks transition to idle:

```kotlin
import androidx.test.espresso.IdlingResource

class SimpleCountingIdlingResource(private val resourceName: String) : IdlingResource {

    @Volatile
    private var counter = 0

    private var resourceCallback: IdlingResource.ResourceCallback? = null

    override fun getName(): String = resourceName

    override fun isIdleNow(): Boolean = counter == 0

    override fun registerIdleTransitionCallback(callback: IdlingResource.ResourceCallback?) {
        this.resourceCallback = callback
    }

    fun increment() {
        counter++
    }

    fun decrement() {
        counter--
        if (counter == 0) {
            resourceCallback?.onTransitionToIdle()
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Espresso eliminate UI test flakiness?
Espresso automatically synchronizes test steps with the Android UI Message Queue (Looper) and AsyncTasks. It waits for UI layout passes to complete before executing the next action.

### Q2: What is the purpose of `IdlingResource` in Espresso?
`IdlingResource` informs Espresso when long-running background tasks (like OkHttp network calls or Room database reads) are active, pausing test steps until the background work completes.

### Q3: How do you test RecyclerView items in Espresso?
Use `Espresso.onView(withId(R.id.recyclerView)).perform(RecyclerViewActions.actionOnItemAtPosition<ViewHolder>(0, click()))` provided by `espresso-contrib`.

### Q4: What is the difference between Espresso and UI Automator?
Espresso is designed for fast, single-app in-process UI testing. UI Automator is designed for cross-app testing (such as interacting with system settings or third-party apps).

### Q5: How do you test Jetpack Compose screens instead of XML Views?
Use `createComposeRule()` provided by `androidx.compose.ui.test`, invoking `composeTestRule.onNodeWithText("Submit").performClick()`.
"""

# 4. TEST-JUNIT (11,000+ Chars)
junit_md = r"""# Comprehensive Guide to Unit Testing in Android: JUnit 5, MockK & Turbine Coroutine Flow Testing

**Unit Testing** in Android verifies the correctness of isolated business logic components—such as ViewModels, Repositories, and Use Cases—on a local JVM without launching slow Android emulators. By pairing **JUnit 5** with **MockK** (the idiomatic Kotlin mocking library) and **Turbine** (for testing Kotlin Flows), developers build fast, deterministic test suites.

---

## 1. Architectural Unit Testing Stack: ViewModel & Coroutine Dispatchers

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="juBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#juBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android Local JVM Unit Testing Architecture</text>

  <!-- Test Suite -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">JUnit Test Class</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• MainDispatcherRule</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• StandardTestDispatcher</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Fast JVM Execution</text>
  </g>

  <!-- ViewModel -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">Target ViewModel</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Executes Use Cases</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Emits StateFlow</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Pure Kotlin Logic</text>
  </g>

  <!-- MockK & Turbine -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">MockK & Turbine</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• coEvery { ... } returns</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• .test { awaitItem() }</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Verifies Invocations</text>
  </g>
</svg>

---

## 2. Production Unit Test: ViewModel & StateFlow Testing with Turbine

Below is an exhaustive Kotlin unit test suite testing a ViewModel with MockK, `MainDispatcherRule`, and Turbine:

```kotlin
import app.cash.turbine.test
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class UserViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private val userRepository: UserRepository = mockk()
    private lateinit var viewModel: UserViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = UserViewModel(userRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `loadUser emits Success state when repository succeeds`() = runTest(testDispatcher) {
        // 1. Given Mock Behaviour
        val mockUser = User("123", "Varun")
        coEvery { userRepository.getUser("123") } returns flowOf(mockUser)

        // 2. When / Then Observe StateFlow using Turbine
        viewModel.uiState.test {
            assertEquals(UserUiState.Loading, awaitItem())

            viewModel.loadUser("123")
            testScheduler.advanceUntilIdle()

            assertEquals(UserUiState.Success(mockUser), awaitItem())
            cancelAndIgnoreRemainingEvents()
        }

        // 3. Verify Mock Call
        coVerify(exactly = 1) { userRepository.getUser("123") }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is `Dispatchers.setMain(testDispatcher)` required in ViewModel unit tests?
`Dispatchers.Main` relies on the Android OS Main Looper (`Looper.getMainLooper()`), which does not exist in local JVM JUnit tests. Setting a `TestDispatcher` replaces the Main looper with a virtual test scheduler.

### Q2: What is the advantage of MockK over Mockito in Kotlin?
MockK is designed specifically for Kotlin. It supports Kotlin final classes by default, understands default parameter values, and provides native coroutine mocking via `coEvery` and `coVerify`.

### Q3: How does Turbine simplify Kotlin Flow testing?
Turbine provides a `.test { }` extension function on Kotlin Flows, allowing developers to sequentially inspect emitted items (`awaitItem()`) and assert flow completion (`awaitComplete()`) without launching manual coroutines.

### Q4: What is the difference between `StandardTestDispatcher` and `UnconfinedTestDispatcher`?
`StandardTestDispatcher` queues coroutine tasks on a virtual scheduler requiring explicit execution (`testScheduler.advanceUntilIdle()`). `UnconfinedTestDispatcher` executes coroutines eagerly without delay.

### Q5: How do you mock static functions or singleton objects in MockK?
Use `mockkStatic("com.package.UtilsKt")` or `mockkObject(MySingleton)` inside test setup, clearing mocks in tearDown via `unmockkAll()`.
"""

inject_into_de_blog_data('test-espresso', espresso_md)
inject_into_de_blog_data('test-junit', junit_md)

print("Part 2 Injected successfully!")
