# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 2 articles

ANDROID_BATCH2_ARTICLES = [
    {
        "slug": "android-hello-world",
        "title": "Create a Basic Hello World App",
        "tagline": "Deconstruct the directory anatomy of an Android project and execute your first build.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-ide"],
        "related": ["android-gradle", "android-activity-lifecycle"],
        "practiceProblems": [],
        "markdown": """# Create a Basic Hello World App

Creating an Android project involves assembling several configuration files, source code components, and resource folders. This chapter details the anatomy of a newly initialized Android application project, explaining the roles of the Manifest, build files, and resources.

---

## 1. Project Directory Structure

A standard Android project is split into two major modules: the top-level **Project** settings and the **App (Module)** layer. Inside the App module, the directories are organized as follows:

* **`src/main/java/` (or `kotlin/`):** Contains the Kotlin or Java source files for your application logic.
* **`src/main/res/` (Resources):** Contains non-code assets:
  * `layout/`: XML files defining UI screens (legacy).
  * `drawable/`: Images, vector assets, and icons.
  * `values/`: Global constants like strings (`strings.xml`), colors (`colors.xml`), and styles.
* **`src/main/AndroidManifest.xml`:** The system configuration file. Every application must declare this file in its root directory.
* **`build.gradle.kts`:** Script containing compiler dependencies, SDK target settings, and build parameters.

---

## 2. Directory Layout Architecture

### Android Project Anatomy
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Android Project Layout</text>

  {/* Root Directory */}
  <g transform="translate(40, 60)">
    <rect width="130" height="150" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="15" y="20" fill="#3b82f6" font-size="8" font-family="monospace">MyProject/</text>
    <text x="25" y="40" fill="#fff" font-size="7" font-family="monospace">build.gradle.kts</text>
    <text x="25" y="55" fill="#fff" font-size="7" font-family="monospace">settings.gradle.kts</text>
    <text x="25" y="75" fill="#a7f3d0" font-size="7" font-family="monospace">app/ (Module)</text>
  </g>

  {/* App Module */}
  <g transform="translate(210, 60)">
    <rect width="160" height="150" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="15" y="20" fill="#3b82f6" font-size="8" font-family="monospace">app/</text>
    <text x="25" y="40" fill="#fff" font-size="7" font-family="monospace">AndroidManifest.xml</text>
    <text x="25" y="55" fill="#fff" font-size="7" font-family="monospace">build.gradle.kts</text>
    <text x="25" y="75" fill="#f59e0b" font-size="7" font-family="monospace">src/main/</text>
  </g>

  {/* Src Main */}
  <g transform="translate(410, 60)">
    <rect width="150" height="150" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="15" y="20" fill="#f59e0b" font-size="8" font-family="monospace">src/main/</text>
    
    <rect x="15" y="35" width="120" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="20" y="47" fill="#fff" font-size="7" font-family="monospace">kotlin/ (Logic)</text>
    
    <rect x="15" y="75" width="120" height="30" fill="#111" stroke="#a855f7" stroke-width="1"/>
    <text x="20" y="87" fill="#c084fc" font-size="7" font-family="monospace">res/ (Assets)</text>
  </g>

  {/* Connectors */}
  <path d="M 170,135 L 210,135" stroke="#3b82f6" stroke-width="1.2"/>
  <path d="M 370,135 L 410,135" stroke="#f59e0b" stroke-width="1.2"/>
</svg>

---

## 3. The Manifest Configuration

The `AndroidManifest.xml` acts as the directory index for the Android OS. If a component (Activity, Service, Receiver) is not declared here, the system will not run it:

```xml
<manifest xmlns:android="http://schemas.google.com/apk/res/android"
    package="com.example.hello">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.MyApplication">

        <!-- Entry point Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>
```

---

## 4. Conceptual Check Questions

1. **Why must the Launcher activity declare the android.intent.action.MAIN action inside its intent filter?**
   *Answer:* This action flags the Activity as the primary entry point for the application. When a user clicks the app icon on the device launcher, the Android OS searches the manifest for the activity carrying this action and category to boot.

2. **What is the difference between project-level and module-level build files?**
   *Answer:* The project-level `build.gradle.kts` manages global plugins and repository paths shared by all modules. The module-level `build.gradle.kts` configures compile settings and dependencies specific to that individual module (e.g. the `:app` module).
""",
        "content": {
            "introduction": "An Android project requires organizing Kotlin source files, XML resources, and setting declarations inside the manifest.",
            "whyImportant": "Troubleshooting compiler paths and resource references requires understanding the project directory layout.",
            "realWorldApps": ["Initializing a blank Android project in Android Studio.", "Declaring permissions and custom activities inside the Manifest file."],
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
        "slug": "android-activity-lifecycle",
        "title": "Activity Lifecycle",
        "tagline": "Deep-dive into activity callbacks and state transitions during runtime events.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-hello-world"],
        "related": ["android-state-changes", "android-tasks-backstack"],
        "practiceProblems": [],
        "markdown": """# Activity Lifecycle

An **Activity** represents a single screen with a user interface. Unlike desktop applications that launch at a main entry point and run continuously, the Android OS manages activities through a strict **lifecycle** to optimize memory and battery usage. This chapter covers the states and callbacks that coordinate activity execution.

---

## 1. Lifecycle States and Callbacks

An activity transitions through a series of states. Each transition triggers a specific callback method:

* **`onCreate():`** Called when the activity is first created. Perform static setups (views initialization, database binding) here.
* **`onStart():`** Called when the activity becomes visible to the user.
* **`onResume():`** Called when the activity enters the foreground and receives focus. The app is running.
* **`onPause():`** Called when another activity comes on top (e.g. a semi-transparent dialog). The activity remains partially visible but loses focus.
* **`onStop():`** Called when the activity is no longer visible. Releases heavy resources.
* **`onDestroy():`** Called before the activity is destroyed (e.g. when finishing or during rotation).

---

## 2. Transition Path Flow

### Standard Lifecycle Callback Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f97316" font-size="13" font-family="sans-serif" font-weight="bold">Activity Lifecycle Transitions</text>

  {/* Callbacks column */}
  <g transform="translate(40, 60)">
    <rect width="110" height="30" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="18" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">onCreate()</text>
    
    <rect x="0" y="45" width="110" height="30" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="63" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">onStart()</text>

    <rect x="0" y="90" width="110" height="30" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="108" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">onResume()</text>
  </g>

  {/* Active state */}
  <g transform="translate(230, 105)">
    <rect width="140" height="40" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="25" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Activity Running</text>
  </g>

  {/* Tear down callbacks */}
  <g transform="translate(450, 60)">
    <rect width="110" height="30" rx="2" fill="#1e293b" stroke="#ef4444" stroke-width="1"/>
    <text x="55" y="18" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">onPause()</text>
    
    <rect x="0" y="45" width="110" height="30" rx="2" fill="#1e293b" stroke="#ef4444" stroke-width="1"/>
    <text x="55" y="63" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">onStop()</text>

    <rect x="0" y="90" width="110" height="30" rx="2" fill="#1e293b" stroke="#ef4444" stroke-width="1"/>
    <text x="55" y="108" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">onDestroy()</text>
  </g>

  {/* Paths */}
  <path d="M 150,75 L 230,120" stroke="#3b82f6" stroke-width="1.2" marker-end="url(#lc-arrow)"/>
  <path d="M 370,120 L 450,75" stroke="#ef4444" stroke-width="1.2" marker-end="url(#lc-arrow)"/>
  
  {/* Return path */}
  <path d="M 505,105 L 505,160 L 95,160 L 95,100" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="2 1" marker-end="url(#lc-arrow)"/>
  <text x="300" y="153" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Restart Path (onRestart -&gt; onStart)</text>

  <defs>
    <marker id="lc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Callback | Activity State | Visible? | Focus? | Operation |
| :--- | :--- | :--- | :--- | :--- |
| **`onCreate`** | Created | No | No | Initialize data/view bindings |
| **`onStart`** | Started | Yes | No | Start UI update animations |
| **`onResume`** | Resumed | Yes | Yes | Capture inputs, start sensors |
| **`onPause`** | Paused | Yes (partial) | No | Suspend video/camera connections |
| **`onStop`** | Stopped | No | No | Save user drafts, write database |
| **`onDestroy`**| Destroyed | No | No | Release final memory locks |

---

## 4. Conceptual Check Questions

1. **Why should you avoid putting heavy work (like database writes or network calls) in onPause()?**
   *Answer:* The Android OS blocks screen navigation updates until the current activity completes its `onPause()` callback. If this callback is slow, it delays the launch of the next screen, causing user layout lags.

2. **When is onRestart() called?**
   *Answer:* `onRestart()` executes when an activity in the `Stopped` state (invisible) is brought back to the foreground by the user, skipping the `onCreate()` initialization pass.
""",
        "content": {
            "introduction": "The Android OS coordinates activities using lifecycle callbacks, allowing memory and resources to be managed dynamically.",
            "whyImportant": "Preventing memory leaks and resource conflicts requires initializing and releasing connections in matching lifecycle states.",
            "realWorldApps": ["Releasing database locks in onStop() and reclaiming them in onStart().", "Stopping background media playing engines when onPause() triggers."],
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
        "slug": "android-state-changes",
        "title": "State Changes & Persistence",
        "tagline": "Manage screen rotations and configuration changes using Bundle states.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-activity-lifecycle"],
        "related": ["android-tasks-backstack"],
        "practiceProblems": [],
        "markdown": """# State Changes & Persistence

When a device undergoes a configuration change (such as rotating the screen, changing language settings, or plugging in a keyboard), the Android OS destroys and recreates the active activity. If not managed, the application will lose all runtime states (e.g. text entered in fields, scrolling position). This chapter details state changes and recovery using Bundle objects.

---

## 1. The Configuration Lifecycle

When a rotation occurs, the OS executes a full teardown and rebuild cycle to reload matching resources (e.g. switching from portrait to landscape layouts):
1. **Destruction:** Activity calls `onPause()`, `onStop()`, then `onDestroy()`.
2. **State Saving:** Before destruction, the system calls `onSaveInstanceState(outState: Bundle)`.
3. **Recreation:** A new instance calls `onCreate(savedInstanceState: Bundle?)` and `onRestoreInstanceState(savedInstanceState: Bundle)`.

---

## 2. Configuration Recovery Flow

### Save and Restore Callback Chain
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Configuration State Saving Flow</text>

  {/* Activity 1 */}
  <g transform="translate(40, 60)">
    <rect width="140" height="120" rx="3" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="70" y="20" fill="#fca5a5" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Activity (Destroying)</text>
    <text x="70" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">1. onPause()</text>
    <text x="70" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">2. onStop()</text>
    <text x="70" y="90" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">3. onSaveInstanceState()</text>
  </g>

  {/* Bundle */}
  <g transform="translate(240, 95)">
    <rect width="120" height="50" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="22" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Bundle Map</text>
    <text x="60" y="38" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Key-Value Pairs</text>
  </g>

  {/* Activity 2 */}
  <g transform="translate(420, 60)">
    <rect width="140" height="120" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="20" fill="#a7f3d0" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Activity (Created)</text>
    <text x="70" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">1. onCreate(Bundle)</text>
    <text x="70" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">2. onStart()</text>
    <text x="70" y="90" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">3. onRestoreInstanceState()</text>
  </g>

  {/* Paths */}
  <path d="M 180,120 L 240,120" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M 360,120 L 420,120" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Persistence Method | Storage Type | Speed | Max Data Size | Lifetime |
| :--- | :--- | :--- | :--- | :--- |
| **`onSaveInstanceState`** | Bundle (RAM) | Extremely fast | ~50KB (strict limit) | System clears on app closure |
| **`ViewModel`** | Memory (RAM) | Fast | Limited by heap size | Saved across rotations, cleared on back |
| **`SharedPreferences`** | Disk (XML) | Slow (I/O) | Large (JSON/text) | Persistent until app is uninstalled |

---

## 4. State Persistence Implementation

Below is a Kotlin implementation of state saving and recovery inside an Activity:

```kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class CounterActivity : AppCompatActivity() {

    private var score = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_counter)

        // Recover state if it exists
        if (savedInstanceState != null) {
            score = savedInstanceState.getInt("KEY_SCORE", 0)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        
        // Write score value to the bundle
        outState.putInt("KEY_SCORE", score)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        
        // Alternative recovery location, runs after onStart()
        score = savedInstanceState.getInt("KEY_SCORE", 0)
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does onSaveInstanceState carry a strict data limit?**
   *Answer:* Bundle state is serialized and copied across OS processes (binder IPC). If you exceed the size limit, the app will crash with a `TransactionTooLargeException`.

2. **If an activity is destroyed because the user clicks the back button, does onSaveInstanceState run?**
   *Answer:* No. The back button indicates the user is explicitly closing the activity. The state is deleted, and the activity starts fresh next time it opens.
""",
        "content": {
            "introduction": "Android recreation destroys active screens during rotation, necessitating saving state values into Bundle storage.",
            "whyImportant": "Avoiding data loss during screen rotations requires implementing save and recovery loops.",
            "realWorldApps": ["Caching form entry fields during phone rotations.", "Saving shopping cart selections across device state shifts."],
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
        "slug": "android-tasks-backstack",
        "title": "Tasks & Backstack",
        "tagline": "Understand Task boundaries, Backstack navigation, and custom Launch Modes.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-activity-lifecycle"],
        "related": ["android-implicit-intents", "android-explicit-intents"],
        "practiceProblems": [],
        "markdown": """# Tasks & Backstack

An Android application is rarely a single activity. When users navigate, they jump across multiple screens. The OS manages this navigation history using **Tasks** (collections of activities) organized as a **Back Stack** (a Last-In, First-Out stack). This chapter details backstack behavior, intent flags, and custom **Launch Modes**.

---

## 1. Backstack Operations

By default, launching a new activity pushes it onto the current Task stack. Clicking the back button pops the active activity off the stack, destroying it and exposing the preceding screen:

* **Push (Navigate):** Pushes Activity C onto the stack containing [A -> B]. The stack becomes [A -> B -> C].
* **Pop (Back):** Pops Activity C off, leaving [A -> B] visible.

---

## 2. Launch Modes

You customize how activities are placed in the backstack using the `android:launchMode` attribute in the manifest:

### `standard` (Default)
Always creates a new instance of the activity.
* *Stack:* [A -> B] launching B becomes [A -> B -> B].

### `singleTop`
If an instance of the activity already exists at the top of the target task, the OS routes the intent to that instance via `onNewIntent()` rather than creating a new instance.
* *Stack:* [A -> B] launching B becomes [A -> B] (reused).

### `singleTask`
Creates a new task and instantiates the activity at the root. If the activity exists in an existing task, the system routes the intent to it and clears all other activities on top of it.
* *Stack:* [A -> B -> C] launching B clears C, leaving [A -> B].

---

## 3. Backstack Stack Diagrams

### standard vs. singleTop Launch Modes
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Launch Mode Stack Behaviors</text>

  {/* Standard Stack */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="20" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">standard (always new)</text>
    
    <rect x="20" y="35" width="140" height="25" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="50" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Activity B (New)</text>

    <rect x="20" y="65" width="140" height="25" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Activity B (Old)</text>

    <rect x="20" y="95" width="140" height="25" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="110" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Activity A</text>
  </g>

  {/* singleTop Stack */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">singleTop (reuse top)</text>
    
    <rect x="20" y="50" width="140" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="90" y="68" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">Activity B (Reused)</text>

    <rect x="20" y="90" width="140" height="30" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="108" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Activity A</text>
  </g>
</svg>

---

## 4. Comparison Matrix

| Launch Mode | Task Placement | Instance Restriction | Backstack Action |
| :--- | :--- | :--- | :--- |
| **`standard`** | Current task | None (unlimited instances) | Appends instance to top |
| **`singleTop`** | Current task | Reuses if already on top | Reuses top or appends |
| **`singleTask`** | New or existing task | Only one instance in system | Clears activities on top |
| **`singleInstance`**| Separate isolated task | Unique instance in system | Blocks other activities in task |

---

## 5. Conceptual Check Questions

1. **If an activity is launched in singleTop mode, where do parameters from incoming intents go?**
   *Answer:* Since the activity is reused, `onCreate()` does not run. The incoming intent payload is delivered to the activity via the `onNewIntent(intent: Intent)` callback, which you must override to capture the new parameters.

2. **What does the FLAG_ACTIVITY_CLEAR_TOP flag accomplish when added to an Intent?**
   *Answer:* It mirrors `singleTask` behavior dynamically. If the launched activity is already running in the current task, Git clears all activities on top of it, placing it at the top of the stack.
""",
        "content": {
            "introduction": "Tasks and the backstack manage navigation order, with launch modes customizing how screens are stacked and reused.",
            "whyImportant": "Building consistent app navigation requires managing launch states to avoid duplicate screens.",
            "realWorldApps": ["Configuring entry notifications to launch in singleTop to avoid duplicates.", "Designing home screens as singleTask to clear intermediate screens on return."],
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
        "slug": "android-implicit-intents",
        "title": "Implicit Intents",
        "tagline": "Utilize OS-level intent sharing to run web browsers, dialers, and cameras.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-tasks-backstack"],
        "related": ["android-explicit-intents", "android-intent-filters"],
        "practiceProblems": [],
        "markdown": """# Implicit Intents

An **Intent** is a messaging object used to request an action from another app component. When you do not know the exact class name of the target app component, you deploy an **Implicit Intent**. You specify the action to perform (e.g. "open a web link" or "take a photo"), and the Android OS matches it to the appropriate application. This chapter explains implicit intent routing and chooser dialogs.

---

## 1. Implicit Intent Routing Pipeline

When an application launches an implicit intent:
1. The app defines the **Action** (e.g. `ACTION_VIEW`) and the **Data URI** (e.g. `https://google.com`).
2. The Android OS queries the manifest files of all installed applications to find matching **Intent Filters**.
3. If multiple apps match (e.g., Chrome and Firefox), the OS displays a **Chooser Dialog** for the user to pick their preferred app.

---

## 2. Intent System Resolution Flow

### Dynamic Action Routing
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Implicit Intent Matching Flow</text>

  {/* Source App */}
  <g transform="translate(40, 80)">
    <rect width="110" height="60" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">My App</text>
    <text x="55" y="42" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">ACTION_VIEW</text>
  </g>

  {/* Android OS */}
  <g transform="translate(240, 75)">
    <rect width="120" height="70" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Android OS</text>
    <text x="60" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Checks Filters</text>
  </g>

  {/* Matches */}
  <g transform="translate(450, 60)">
    <rect width="110" height="40" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Web Browser</text>
  </g>
  <g transform="translate(450, 120)">
    <rect width="110" height="40" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Map App</text>
  </g>

  {/* Paths */}
  <path d="M 150,110 L 240,110" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 360,100 L 450,80" stroke="#10b981" stroke-width="1.5"/>
  <path d="M 360,120 L 450,140" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2 1"/>
</svg>

---

## 3. Comparison Matrix

| Property | Explicit Intent | Implicit Intent |
| :--- | :--- | :--- |
| **Target Definition** | Target class defined explicitly | Target determined by action filters |
| **Use Case** | Navigation inside your own app | Integrating with system components |
| **Security** | Secure (direct loading) | Less secure (potential interception) |
| **Chooser Dialog** | Never displayed | Displayed if multiple apps match |

---

## 4. Implicit Intent Code Example

Below is a Kotlin implementation launching an implicit intent to view a web page, with checks to verify a matching app is installed:

```kotlin
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class WebActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_web)

        // Define implicit intent to view a URL
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("https://www.wikipedia.org")
        }

        // Verify there is an app capable of handling this action
        if (intent.resolveActivity(packageManager) != null) {
            startActivity(intent)
        } else {
            Toast.makeText(this, "No browser app found", Toast.LENGTH_SHORT).show()
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it critical to check resolveActivity() before launching an implicit intent?**
   *Answer:* If you attempt to launch an implicit intent and no application on the device matches the requested action, the application will crash with an `ActivityNotFoundException`.

2. **How do you force the OS to always display a chooser dialog for an implicit intent?**
   *Answer:* You wrap the original intent inside a chooser intent using the helper method: `Intent.createChooser(intent, "Open with:")`. This prevents the OS from defaulting to a saved preference.
""",
        "content": {
            "introduction": "Implicit intents request system actions without defining target class names, relying on the OS to find matching filters.",
            "whyImportant": "Integrating external components like maps or browsers requires configuring implicit intents correctly.",
            "realWorldApps": ["Launching the device dialer with a phone number payload.", "Requesting photo capture actions from available camera apps."],
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
        "slug": "android-explicit-intents",
        "title": "Explicit Intents & Navigation",
        "tagline": "Launch internal application screens and pass argument payloads using bundles.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-tasks-backstack"],
        "related": ["android-implicit-intents"],
        "practiceProblems": [],
        "markdown": """# Explicit Intents & Navigation

When navigating between screens inside your own application, you use **Explicit Intents**. You define the target component's class name directly in the constructor, guaranteeing the correct screen launches. This chapter covers explicit navigation, passing argument bundles, and handling results.

---

## 1. Target Class Resolution

An explicit intent targets a specific class within your application package. Because the class is compiled into the app, the Android OS bypasses filter checks and instantiates the target activity immediately.

---

## 2. Navigating and Passing Arguments

### Data Passing Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Explicit Navigation Argument Transfer</text>

  {/* Source Activity */}
  <g transform="translate(40, 80)">
    <rect width="130" height="80" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="35" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">MainActivity</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Intent(this, Detail::class)</text>
  </g>

  {/* Intent Extra */}
  <g transform="translate(240, 95)">
    <rect width="120" height="50" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="22" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Intent Extras</text>
    <text x="60" y="38" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">"user_id" = 42</text>
  </g>

  {/* Target Activity */}
  <g transform="translate(430, 80)">
    <rect width="130" height="80" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="35" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">DetailActivity</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">intent.getIntExtra()</text>
  </g>

  {/* Paths */}
  <path d="M 170,120 L 240,120" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M 360,120 L 430,120" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Method | Target | Data Transfer Size | Use Case |
| :--- | :--- | :--- | :--- |
| **`Intent.putExtra`** | Explicit target | small (<50KB) | Passing primitive IDs and flags |
| **`Parcelable`** | Explicit target | medium | Passing structured Kotlin data classes |
| **`Serializable`** | Explicit target | medium (slower reflection) | Java-standard object passing |

---

## 4. Navigation Code Example

Below is a Kotlin implementation navigating from `MainActivity` to `DetailActivity` while passing arguments:

```kotlin
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Define explicit intent targeting DetailActivity
        val intent = Intent(this, DetailActivity::class.java).apply {
            putExtra("EXTRA_USER_ID", 1001)
            putExtra("EXTRA_IS_PREMIUM", true)
        }
        
        startActivity(intent)
    }
}

class DetailActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_detail)

        // Read arguments from intent extras
        val userId = intent.getIntExtra("EXTRA_USER_ID", -1)
        val isPremium = intent.getBooleanExtra("EXTRA_IS_PREMIUM", false)
        
        println("User ID: $userId, Premium: $isPremium")
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is Parcelable preferred over Serializable in Android development?**
   *Answer:* `Serializable` uses reflection to serialize objects, which is slow and consumes system garbage collection cycles. `Parcelable` requires explicit serialization logic (often auto-generated), running significantly faster on Android.

2. **How does startActivityForResult() differ from startActivity()?**
   *Answer:* `startActivity()` simply launches the target activity. `startActivityForResult()` (and the modern Activity Result API) launches the activity and listens for a callback result (like picking a contact or image) when the target activity finishes.
""",
        "content": {
            "introduction": "Explicit intents launch specific app screens by class name, transferring arguments using bundle properties.",
            "whyImportant": "Designing internal app navigation flows requires implementing explicit intents and arguments passing.",
            "realWorldApps": ["Navigating from a listing screen to a detail activity.", "Passing search queries to search result activity screens."],
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
        "slug": "android-intent-filters",
        "title": "Intent Filters",
        "tagline": "Configure intent resolution filters in AndroidManifest.xml for implicit actions.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-implicit-intents"],
        "related": ["android-hello-world"],
        "practiceProblems": [],
        "markdown": """# Intent Filters

To receive implicit intents, an application component (like an activity) must declare one or more **Intent Filters** in `AndroidManifest.xml`. These filters specify the actions, categories, and data formats the component accepts. This chapter explains intent filter matching logic and system integration.

---

## 1. Filter Matching Criteria

When an implicit intent is broadcast, the Android OS checks three criteria to find matching intent filters:

* **Action:** The request action to perform (e.g. `android.intent.action.VIEW` or `android.intent.action.SEND`). The filter must list this action.
* **Category:** Provides context (e.g. `android.intent.category.DEFAULT` or `android.intent.category.BROWSABLE`). Most implicit intents require the `DEFAULT` category.
* **Data:** The data type or schema (e.g., matching only `https` URLs or `image/png` mime-types).

---

## 2. Intent Matching Pipeline

### Matching Algorithm Step Breakdown
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Intent Filter Matching Steps</text>

  {/* Steps Grid */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Step 1: Action</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Does action match?</text>
  </g>

  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Step 2: Category</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Does category match?</text>
  </g>

  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Step 3: Data</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Does URI data match?</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#if-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#if-arrow)"/>

  <defs>
    <marker id="if-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Filter Attribute | Match Condition | Failure Action |
| :--- | :--- | :--- |
| **`<action>`** | Intent action must match one listed in filter | Skip filter |
| **`<category>`** | All categories in Intent must exist in filter | Skip filter |
| **`<data>`** | Schema, host, port, and mime-type must match | Skip filter |

---

## 4. Manifest XML Configuration Example

Below is a Manifest configuration template exposing an activity that handles incoming image share intents:

```xml
<activity android:name=".ShareActivity"
          android:exported="true">
    <intent-filter>
        <!-- Accept share action -->
        <action android:name="android.intent.action.SEND" />
        
        <!-- Must support default category to receive implicit intents -->
        <category android:name="android.intent.category.DEFAULT" />
        
        <!-- Only accept PNG and JPEG image data types -->
        <data android:mimeType="image/png" />
        <data android:mimeType="image/jpeg" />
    </intent-filter>
</activity>
```

---

## 5. Conceptual Check Questions

1. **Why must you include category DEFAULT in almost all intent filters?**
   *Answer:* When you call `startActivity(intent)` using an implicit intent, Android automatically appends the `android.intent.category.DEFAULT` category. If your filter does not declare this category, the OS will skip it, rendering your activity unreachable by implicit requests.

2. **How does an intent filter handle multiple declared actions?**
   *Answer:* It functions as an OR check. If an incoming intent matches any one of the listed actions, it passes the action validation step.
""",
        "content": {
            "introduction": "Intent filters declared in the Manifest allow applications to receive implicit system intents by defining matching rules.",
            "whyImportant": "Exposing app features (like file importing or deep links) requires declaring intent filters.",
            "realWorldApps": ["Configuring deep links to open web URLs inside your app.", "Exposing share destinations for photos or text files."],
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
        "slug": "android-content-provider",
        "title": "Content Providers",
        "tagline": "Configure database layers and query shareable tables using ContentResolvers.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-hello-world"],
        "related": ["android-broadcast-receiver"],
        "practiceProblems": [],
        "markdown": """# Content Providers

A **Content Provider** is a core Android component that manages access to a structured repository of data (such as a local SQLite database). It encapsulates the database details and exposes a public API, allowing other applications to query or modify data securely. This chapter covers the ContentProvider architecture and ContentResolver query syntax.

---

## 1. Accessing External Data

Applications do not query database files of other apps directly due to system sandbox security. Instead, they use a **ContentResolver** to communicate with the target app's ContentProvider:
* **Content URIs:** Act as addresses for queries (e.g. `content://com.example.contacts/people`).
* **Resolver Operations:** Methods mimic standard SQL queries (query, insert, update, delete).

---

## 2. Content Provider Architecture

### System Communication Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Content Provider Query Flow</text>

  {/* Client App */}
  <g transform="translate(40, 80)">
    <rect width="120" height="70" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="60" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Client App</text>
    <text x="60" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">ContentResolver</text>
  </g>

  {/* Provider App */}
  <g transform="translate(240, 80)">
    <rect width="140" height="70" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">ContentProvider</text>
    <text x="70" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Resolves URI</text>
  </g>

  {/* SQLite Database */}
  <g transform="translate(450, 80)">
    <rect width="110" height="70" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="55" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">SQLite DB</text>
    <text x="55" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">SQL Execute</text>
  </g>

  {/* Connections */}
  <path d="M 160,115 L 240,115" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 380,115 L 450,115" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. URI Address Structure

A Content URI is structured into three parts:
* **Scheme:** Always `content://`, indicating it points to a ContentProvider.
* **Authority:** Unique string identifying the provider (e.g. `com.android.contacts`).
* **Path:** Identifies the table or specific row requested (e.g. `people/1`).

---

## 4. Querying a Provider in Kotlin

Below is a Kotlin implementation querying the system contacts database:

```kotlin
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.ContactsContract
import androidx.appcompat.app.AppCompatActivity

class ContactsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_contacts)

        // Query the Contacts ContentProvider
        val contactsUri: Uri = ContactsContract.Contacts.CONTENT_URI
        val projection = arrayOf(
            ContactsContract.Contacts._ID,
            ContactsContract.Contacts.DISPLAY_NAME
        )

        val cursor: Cursor? = contentResolver.query(
            contactsUri,
            projection,
            null,
            null,
            null
        )

        cursor?.use {
            val nameIndex = it.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)
            while (it.moveToNext()) {
                val name = it.getString(nameIndex)
                println("Contact Found: $name")
            }
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why do we use the cursor.use block when reading from a ContentProvider?**
   *Answer:* `Cursor` represents a database query handler holding system references. Failing to close a cursor leaks system memory. The `use` extension function automatically closes the cursor when code block execution finishes.

2. **How does an application authorize access to a secure ContentProvider?**
   *Answer:* The client app must declare the required permission inside its `AndroidManifest.xml` file (e.g. `<uses-permission android:name="android.permission.READ_CONTACTS" />`), and request runtime approval from the user.
""",
        "content": {
            "introduction": "Content Providers expose secure data access APIs to other apps, utilizing ContentResolver interfaces to query databases.",
            "whyImportant": "Accessing system databases (like contacts or media libraries) requires configuring ContentResolvers.",
            "realWorldApps": ["Querying the device image library using the MediaStore provider.", "Sharing app data tables securely with widgets or background services."],
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
        "slug": "android-broadcast-receiver",
        "title": "Broadcast Receivers",
        "tagline": "Configure static and dynamic listeners to process system-wide broadcast intents.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-hello-world"],
        "related": ["android-content-provider"],
        "practiceProblems": [],
        "markdown": """# Broadcast Receivers

A **Broadcast Receiver** is a core component that allows your application to listen for system-wide broadcast messages (Intents). These messages can originate from the Android OS (e.g. "battery low," "device booted," or "network connectivity changed") or from other applications. This chapter covers static vs. dynamic registration and intent processing.

---

## 1. Registration Models

You register a Broadcast Receiver using two methods:

* **Static Registration (Manifest):** Declared inside `AndroidManifest.xml`. The OS registers the receiver when the app is installed. The system can instantiate and wake up the app to handle the broadcast even if the app is not running.
* **Dynamic Registration (Code):** Registered in Kotlin code at runtime. It only listens while the registering context (like an activity or service) remains active.

---

## 2. Broadcast Lifecycle Flow

### System Boot Trigger
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">System Boot Broadcast Flow</text>

  {/* Android OS */}
  <g transform="translate(40, 80)">
    <rect width="110" height="70" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Android OS</text>
    <text x="55" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Emits BOOT_COMPLETED</text>
  </g>

  {/* Manifest Registry */}
  <g transform="translate(240, 80)">
    <rect width="140" height="70" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Static Receiver</text>
    <text x="70" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Wakes App Process</text>
  </g>

  {/* App Logic */}
  <g transform="translate(450, 80)">
    <rect width="110" height="70" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="55" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">App Process</text>
    <text x="55" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onReceive()</text>
  </g>

  {/* Paths */}
  <path d="M 150,115 L 240,115" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M 380,115 L 450,115" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | Static (Manifest) | Dynamic (Code) |
| :--- | :--- | :--- |
| **Declaration** | `AndroidManifest.xml` | `registerReceiver()` in Kotlin |
| **App Status** | Wakes app if process is terminated | Requires app process to be active |
| **Lifetime** | Indefinite (installed lifetime) | Bounded by component lifecycle |
| **Android Version Limitations** | Heavily restricted since Android 8.0 | Allowed for almost all intents |

---

## 4. Kotlin Dynamic Broadcast Example

Below is a Kotlin implementation of a dynamic receiver monitoring battery level inside an activity:

```kotlin
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class BatteryActivity : AppCompatActivity() {

    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_BATTERY_LOW) {
                println("Battery is low! Saving state...")
            }
        }
    }

    override fun onStart() {
        super.onStart()
        // Register receiver for low battery events
        val filter = IntentFilter(Intent.ACTION_BATTERY_LOW)
        registerReceiver(batteryReceiver, filter)
    }

    override fun onStop() {
        super.onStop()
        // Unregister receiver to prevent memory leak
        unregisterReceiver(batteryReceiver)
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why did Google restrict static broadcast registrations in Android 8.0?**
   *Answer:* If dozens of apps register static receivers for the same system event (e.g. `CONNECTIVITY_ACTION`), all app processes would wake up simultaneously, spiking memory usage and draining battery.

2. **What happens if you run a long-running process inside onReceive()?**
   *Answer:* `onReceive()` executes on the Main Thread. The OS gives the receiver a maximum of 10 seconds to execute. If it exceeds this limit, the app crashes with an ANR (Application Not Responding) flag.
""",
        "content": {
            "introduction": "Broadcast Receivers listen to system and custom events, responding to triggers dynamically or through static manifest declarations.",
            "whyImportant": "Monitoring hardware state changes (like charging status or network flags) requires using broadcast receivers.",
            "realWorldApps": ["Starting background synchronization when device charging triggers.", "Clearing offline image cache tables when disk-space is critical."],
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
        "slug": "compose-column-row",
        "title": "Jetpack Compose Column & Row",
        "tagline": "Master horizontal and vertical layouts using alignments, arrangements, and modifiers.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-hello-world"],
        "related": ["compose-lazy-column-row"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Column & Row

**Jetpack Compose** is Android's modern declarative UI toolkit. Instead of writing XML layouts, developers write Kotlin functions annotated with `@Composable`. The fundamental building blocks of Compose layouts are **Column** and **Row**, which stack elements vertically and horizontally. This chapter details alignments, arrangements, and modifiers.

---

## 1. Column and Row Mechanics

Standard stacking is controlled using alignment and arrangement properties:

* **Column:** Stacks items vertically.
  * *Vertical Arrangement:* Controls spacing along the main axis (e.g., `Arrangement.SpaceBetween`).
  * *Horizontal Alignment:* Controls positioning along the cross axis (e.g., `Alignment.CenterHorizontally`).
* **Row:** Stacks items horizontally.
  * *Horizontal Arrangement:* Main axis spacing.
  * *Vertical Alignment:* Cross axis positioning.

---

## 2. Arrangement Visualizer

### Space Between vs. Space Around vs. Space Evenly
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Row Arrangements Comparison</text>

  {/* Space Between */}
  <g transform="translate(40, 50)">
    <rect width="520" height="40" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="15" y="24" fill="#60a5fa" font-size="8" font-family="monospace">SpaceBetween</text>
    
    <rect x="200" y="10" width="40" height="20" fill="#3b82f6" rx="1"/>
    <rect x="340" y="10" width="40" height="20" fill="#3b82f6" rx="1"/>
    <rect x="460" y="10" width="40" height="20" fill="#3b82f6" rx="1"/>
  </g>

  {/* Space Around */}
  <g transform="translate(40, 110)">
    <rect width="520" height="40" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="15" y="24" fill="#10b981" font-size="8" font-family="monospace">SpaceAround</text>
    
    <rect x="180" y="10" width="40" height="20" fill="#10b981" rx="1"/>
    <rect x="310" y="10" width="40" height="20" fill="#10b981" rx="1"/>
    <rect x="440" y="10" width="40" height="20" fill="#10b981" rx="1"/>
  </g>

  {/* Space Evenly */}
  <g transform="translate(40, 170)">
    <rect width="520" height="40" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="15" y="24" fill="#a855f7" font-size="8" font-family="monospace">SpaceEvenly</text>
    
    <rect x="160" y="10" width="40" height="20" fill="#a855f7" rx="1"/>
    <rect x="290" y="10" width="40" height="20" fill="#a855f7" rx="1"/>
    <rect x="420" y="10" width="40" height="20" fill="#a855f7" rx="1"/>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Column Main Axis | Column Cross Axis | Row Main Axis | Row Cross Axis |
| :--- | :--- | :--- | :--- | :--- |
| **Orientation** | Vertical | Horizontal | Horizontal | Vertical |
| **Parameter** | `verticalArrangement` | `horizontalAlignment` | `horizontalArrangement` | `verticalAlignment` |
| **Values** | `Top`, `Bottom`, `Center`, `SpaceBetween`, `SpaceAround`, `SpaceEvenly` | `Start`, `End`, `CenterHorizontally` | `Start`, `End`, `Center`, `SpaceBetween`, `SpaceAround`, `SpaceEvenly` | `Top`, `Bottom`, `CenterVertically` |

---

## 4. Kotlin Compose Code Example

Below is a Composable function declaring a profile card layout using Row and Column elements:

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ProfileCard(name: String, role: String) {
    // Row stacks items horizontally (avatar vs info text)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Vertical stack for texts
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.Start
        ) {
            Text(text = name)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = role)
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **What is the main axis and cross axis of a Row?**
   *Answer:* The main axis of a `Row` is horizontal (the direction items stack). The cross axis is vertical (perpendicular to the direction items stack).

2. **How does the Modifier.weight() parameter work in Column/Row layouts?**
   *Answer:* It tells the layout to allocate remaining space. If a Row has total width 300dp, and one item has `weight(1f)` while other items have fixed sizes, the weighted item expands to consume all remaining space in the Row.
""",
        "content": {
            "introduction": "Columns and Rows serve as the foundational declarative layout components in Jetpack Compose, stacking items vertically and horizontally.",
            "whyImportant": "Designing complex Android user interfaces requires mastering main-axis and cross-axis alignment parameters.",
            "realWorldApps": ["Creating list items with horizontal layouts for pictures and text.", "Designing linear login forms using Column stacking."],
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
        "slug": "compose-lazy-column-row",
        "title": "Jetpack Compose Lazy List",
        "tagline": "Build high-performance lists using LazyColumn and LazyRow layouts.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-column-row"],
        "related": ["android-dsa-basics"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Lazy List

When building screens containing lists of hundreds of items, using a standard `Column` or `Row` is inefficient. The system would instantiate all items at once, causing memory exhaustion and UI lag. To build performant lists, Compose uses **LazyColumn** and **LazyRow**. These layouts recycle memory, rendering only the items visible on the screen. This chapter compares them with legacy lists and details their list DSL.

---

## 1. Recycler List Architecture

`LazyColumn` operates similarly to the legacy XML `RecyclerView`. Instead of instantiating all list items:
1. The system determines how many items fit in the **Viewport**.
2. It instantiates the visible items plus a small buffer at the top and bottom.
3. As the user scrolls, items leaving the screen are recycled, and their memory containers are reused to display newly entering items.

---

## 2. Memory Recycling Pipeline

### Viewport recycling model
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">LazyList Viewport Recycling</text>

  {/* Viewport Boundary */}
  <g transform="translate(180, 50)">
    <rect width="240" height="150" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 2"/>
    <text x="120" y="145" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Active Viewport Boundary</text>
    
    {/* Items */}
    <rect x="20" y="10" width="200" height="30" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="120" y="28" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Active Item 1</text>
    
    <rect x="20" y="50" width="200" height="30" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="120" y="68" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Active Item 2</text>

    <rect x="20" y="90" width="200" height="30" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="120" y="108" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Active Item 3</text>
  </g>

  {/* Recycled/Offscreen */}
  <g transform="translate(180, 10)">
    <rect x="20" y="0" width="200" height="30" fill="#111" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="120" y="18" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Recycled Container (Offscreen)</text>
  </g>

  <g transform="translate(180, 210)">
    <rect x="20" y="0" width="200" height="20" fill="#111" rx="2" stroke="#10b981" stroke-width="1.5"/>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Column / Row | LazyColumn / LazyRow |
| :--- | :--- | :--- |
| **Item Loading** | Immediate (All items compiled) | Lazy (Compiled on scroll visibility) |
| **Memory Cost** | High (grows linearly with items) | Constant (bounded by viewport size) |
| **Scroll Support** | Requires manual Modifier scrolling | Native scrolling built-in |
| **DSL Syntax** | Standard Composable loop calls | DSL scope (`items`, `item`, `itemsIndexed`) |

---

## 4. Kotlin LazyList DSL Code Example

Below is a Composable function declaring a lazy loading list using items collection indexes:

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Product(val id: Int, val name: String, val price: String)

@Composable
fun ProductList(products: List<Product>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 1. Single static item header
        item {
            Text(text = "Available Products")
        }

        // 2. Dynamic list of product cards
        items(products) { product ->
            ProductCard(product = product)
        }
    }
}

@Composable
fun ProductCard(product: Product) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = product.name)
            Text(text = product.price)
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does using a standard forEach loop inside a Scrollable Column perform worse than a LazyColumn?**
   *Answer:* A `forEach` loop inside a column instantiates all list elements in memory, running measurement and placement calculations on every element immediately. `LazyColumn` only measures and lays out the items currently in the viewport, saving CPU cycles and RAM.

2. **How does the key parameter optimize LazyList performance during dataset updates?**
   *Answer:* By default, Compose tracks list items by index. If you insert an item at the beginning of the list, every index changes, forcing Compose to re-render all items. Providing a unique `key` (e.g. `product.id`) allows Compose to track items across dataset changes, only rendering new or modified items.
""",
        "content": {
            "introduction": "LazyColumn and LazyRow compile lists dynamically, recycling offscreen memory buffers to display large datasets.",
            "whyImportant": "Displaying arrays of data without stutters requires implementing lazy lists rather than standard columns.",
            "realWorldApps": ["Rendering feed lists inside social network applications.", "Designing horizontal scrolling filters using LazyRow grids."],
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
