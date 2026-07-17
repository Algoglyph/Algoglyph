# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 4 articles

ANDROID_BATCH4_ARTICLES = [
    {
        "slug": "compose-dialog",
        "title": "Jetpack Compose Dialog",
        "tagline": "Configure modal alert dialogs, manage dismiss callbacks, and build custom layouts.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-box"],
        "related": ["compose-bottomsheet"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Dialog

A **Dialog** is a small window that prompts the user to make a decision or enter additional information. It does not fill the screen and is used for blocking confirmations or settings. In Jetpack Compose, this is managed by the **AlertDialog** component. This chapter covers state triggers, confirmation buttons, and styling.

---

## 1. Dialog Visibility States

Dialogs are declared inline inside Composable functions. They are displayed conditionally based on boolean state variables:
1. **Show Dialog:** If the state `showDialog` is true, the compiler enters the `if (showDialog)` block and compiles the Dialog.
2. **Dismiss Dialog:** When the user clicks outside or confirms, the state updates to false. The compiler skips the block, removing the dialog from the UI tree.

---

## 2. Dialog Visibility Flow

### Boolean Toggle Lifecycle
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Dialog Compile/Remove States</text>

  {/* State: False */}
  <g transform="translate(40, 80)">
    <rect width="130" height="70" rx="3" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#fca5a5" font-size="8" font-family="monospace" text-anchor="middle">State: False</text>
    <text x="65" y="48" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Dialog omitted</text>
  </g>

  {/* Action Toggle */}
  <path d="M 180,115 L 240,115" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#dlg-arrow)"/>
  <text x="210" y="105" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Toggle</text>

  {/* State: True */}
  <g transform="translate(250, 70)">
    <rect width="310" height="90" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="155" y="22" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">State: True (Compiled)</text>
    
    <rect x="20" y="35" width="270" height="40" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="155" y="58" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle">AlertDialog(onDismissRequest)</text>
  </g>

  <defs>
    <marker id="dlg-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Attribute | AlertDialog | Custom Dialog |
| :--- | :--- | :--- |
| **Styling** | Standard Material layout | Freeform Box wrapper |
| **Slots** | `title`, `text`, `confirmButton`, `dismissButton` | Single `content` slot |
| **Typical Use** | Warnings, simple confirmations | Large inputs, customized layout designs |

---

## 4. Material 3 AlertDialog Example

Below is a Composable function rendering an alert dialog that asks users to confirm an exit action:

```kotlin
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*

@Composable
fun ExitConfirmationDialog(onExitConfirmed: () -> Unit) {
    var showDialog by remember { mutableStateOf(false) }

    Button(onClick = { showDialog = true }) {
        Text("Exit Application")
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(text = "Exit Confirmation") },
            text = { Text(text = "Are you sure you want to close this application?") },
            confirmButton = {
                Button(
                    onClick = {
                        showDialog = false
                        onExitConfirmed()
                    }
                ) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
```

---

## 5. Conceptual Check Questions

1. **What is the purpose of the onDismissRequest parameter in AlertDialog?**
   *Answer:* It defines the callback executed when the user clicks outside the dialog bounds or presses the system back button. Typically, you update the visibility state to false inside this lambda to close the dialog.

2. **Can you customize the background dimming (scrim) color of a Dialog?**
   *Answer:* Yes. Dialogs accept a `DialogProperties` parameter where you can configure the dismiss behavior, secure windows flags, and custom background properties.
""",
        "content": {
            "introduction": "AlertDialogs display modular warning and confirmation boxes, using conditional compiling to show and hide overlay windows.",
            "whyImportant": "Blocking screen navigation to confirm critical actions requires configuring alert dialogs.",
            "realWorldApps": ["Asking user confirmation before deleting database records.", "Displaying application updates alerts on boot startup."],
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
        "slug": "compose-animations",
        "title": "Compose Animations",
        "tagline": "Configure transitions, implement animated visibilities, and apply physics-based animation specs.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-box"],
        "practiceProblems": [],
        "markdown": """# Compose Animations

Animations make application transitions smooth and indicate connection behaviors. Jetpack Compose provides declarative animation APIs that range from simple visibility transitions to complex physics-based multi-state keyframes. This chapter covers visibility animations, value transitions, and animation specifications.

---

## 1. Primary Animation APIs

Compose categorizes animations by scope and control depth:

* **`AnimatedVisibility:`** Animates entering and exiting transitions (fade, expand, slide) of its children:
  ```kotlin
  AnimatedVisibility(visible = isVisible) { Text("Hello") }
  ```
* **`animate*AsState`:** Animates individual properties (color, dp, float) dynamically when target values change.
* **`Transition (updateTransition):`** Coordinates animations of multiple properties simultaneously based on state changes.

---

## 2. Animation Physics Specs

You configure transition curves using animation specifications:
* **`tween`:** Animates values over a fixed duration using easing curves (like EaseInOut).
* **`spring`:** Animates values using physics-based spring models (damping ratio and stiffness), yielding natural, bouncy transitions.

### Animation Curve Comparison
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Animation Target Interpolations</text>

  {/* Tween Curve (Linear-like) */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M 10,120 L 170,10" stroke="#3b82f6" stroke-width="2"/>
    <text x="90" y="145" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle">tween (Fixed Duration)</text>
  </g>

  {/* Spring Curve (Bouncy) */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    {/* Oscillating path */}
    <path d="M 10,120 Q 30,20 60,80 T 110,35 T 140,10 L 170,10" fill="none" stroke="#10b981" stroke-width="2"/>
    <text x="90" y="145" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">spring (Physics Bouncy)</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| API | Control Depth | Type | Best For |
| :--- | :--- | :--- | :--- |
| **`AnimatedVisibility`** | Simple | Visibility transitions | Showing/hiding panels |
| **`animate*AsState`** | Simple | Value property transitions | Hover scales, color shifts |
| **`Animatable`** | Advanced | Low-level direct control | Gesture tracking, manual inputs |
| **`updateTransition`** | Advanced | Multi-property coordinator | Complex multi-stage states |

---

## 4. Kotlin Compose Animation Example

Below is a Composable function animating a card's color and height when clicked:

```kotlin
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ExpandingBox() {
    var isExpanded by remember { mutableStateOf(false) }

    // 1. Color transition
    val backgroundColor by animateColorAsState(
        targetValue = if (isExpanded) Color.Blue else Color.Gray,
        animationSpec = spring()
    )

    // 2. Layout box containing transitions
    Box(
        modifier = Modifier
            .size(if (isExpanded) 150.dp else 100.dp)
            .background(backgroundColor)
            .clickable { isExpanded = !isExpanded }
    )
}
```

---

## 5. Conceptual Check Questions

1. **Why does spring animation not accept a duration parameter?**
   *Answer:* Spring animations calculate durations dynamically based on physics properties (mass, stiffness, damping ratio, velocity). Forcing a fixed duration would violate the physics model, leading to unnatural animations.

2. **How does AnimatedVisibility handle layouts when items enter/exit?**
   *Answer:* It calculates the target height/width of entering/exiting items, dynamically adjusting parent layout sizes in sync with the transition to prevent layout snaps.
""",
        "content": {
            "introduction": "Compose Animations transitions UI properties declaratively, providing AnimatedVisibility and physics-based spring specs.",
            "whyImportant": "Creating engaging user experiences requires implementing fluid animations that run smoothly without stuttering.",
            "realWorldApps": ["Animating card size transitions when user expands item reviews.", "Fading warning labels in/out based on validation status changes."],
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
        "slug": "compose-drawer",
        "title": "Navigation Drawer",
        "tagline": "Configure ModalNavigationDrawers, manage active drawer states, and build navigation items.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-scaffold"],
        "related": ["compose-navhost"],
        "practiceProblems": [],
        "markdown": """# Navigation Drawer

A **Navigation Drawer** is an expandable vertical panel that slides in from the side (usually the left) to display the application's primary navigation options. It is essential for organizing screens in large applications with flat hierarchies. In Jetpack Compose, this is managed by the **ModalNavigationDrawer** component. This chapter covers drawer parameters, open/close states, and list layouts.

---

## 1. Modal Navigation Drawer Structure

The `ModalNavigationDrawer` wrap-around container has two primary slots:
* **`drawerContent`:** The Composable content displayed inside the sliding side panel (typically containing `ModalDrawerSheet` and navigation buttons).
* **`content`:** The primary screen content (like your Scaffold and page layouts) which remains visible when the drawer is closed.

---

## 2. Sliding State Animations

The drawer slides open dynamically when the user swipes from the screen edge or clicks a hamburger button. This updates the `DrawerState` from `Closed` to `Open`:

### Drawer Overlay Slide
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">ModalNavigationDrawer System</text>

  {/* Main Screen Base */}
  <g transform="translate(180, 50)">
    <rect width="240" height="150" fill="#1e293b" rx="4" stroke="#475569" stroke-width="2"/>
    <text x="120" y="80" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">Main Scaffold Content</text>
  </g>

  {/* Drawer Overlay (Slide in) */}
  <g transform="translate(180, 50)">
    <rect width="140" height="150" fill="#111" rx="4" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="30" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">drawerContent</text>
    
    <rect x="15" y="55" width="110" height="20" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="70" y="67" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Home</text>

    <rect x="15" y="85" width="110" height="20" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="70" y="97" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Profile</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | ModalNavigationDrawer | DismissibleNavigationDrawer |
| :--- | :--- | :--- |
| **Layout Interaction**| Overlays screen content with dimming | Pushes screen content aside |
| **Screen Sizes** | Mobile phones (default portrait layout) | Tablets and desktop layouts |
| **State Controls** | Controlled via `DrawerState` | Controlled via `DrawerState` |

---

## 4. Kotlin Compose Drawer Example

Below is a Composable function declaring a Modal Navigation Drawer with Home and Settings selection items:

```kotlin
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun DrawerScreenHost() {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Text("Navigation", modifier = Modifier.padding(16.dp))
                NavigationDrawerItem(
                    label = { Text("Home Screen") },
                    selected = true,
                    onClick = { scope.launch { drawerState.close() } }
                )
                NavigationDrawerItem(
                    label = { Text("Settings") },
                    selected = false,
                    onClick = { scope.launch { drawerState.close() } }
                )
            }
        }
    ) {
        // Main Screen Content
        Scaffold(
            topBar = {
                TextButton(onClick = { scope.launch { drawerState.open() } }) {
                    Text("Menu")
                }
            }
        ) { innerPadding ->
            Text("Content screen area", modifier = Modifier.padding(innerPadding))
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does opening or closing a ModalNavigationDrawer require a coroutine scope?**
   *Answer:* The drawer slides open over several frames. Coroutines run these asynchronous layout translations without blocking main UI thread cycles, ensuring smooth animations.

2. **How does the system handle back clicks when the navigation drawer is open?**
   *Answer:* By default, you register a back handler inside your activity. If the drawer is open (`drawerState.isOpen`), intercept the back gesture to close the drawer rather than exiting the application.
""",
        "content": {
            "introduction": "Navigation drawers provide collapsible menus overlaying screen content, managed using ModalNavigationDrawers and DrawerStates.",
            "whyImportant": "Organizing major application navigation pathways requires deploying side drawers.",
            "realWorldApps": ["Designing primary settings panel entries in large apps.", "Implementing hamburger menu drawers in multi-page catalogs."],
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
        "slug": "compose-navhost",
        "title": "Compose Navigation & NavHost",
        "tagline": "Configure routing controllers, instantiate NavHosts, and pass arguments between screens.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-scaffold"],
        "related": ["compose-drawer"],
        "practiceProblems": [],
        "markdown": """# Compose Navigation & NavHost

In legacy Android apps, navigation involves replacing fragments or launching new activities. In Jetpack Compose, navigation is managed programmatically inside a single activity using the **Navigation Component**. This system relies on a **NavController** to track the backstack and a **NavHost** to define the route routing graph. This chapter covers routing setup, argument passing, and backstack management.

---

## 1. Navigation Core Components

The Compose Navigation system uses three primary components:

* **`NavController`:** The central coordinator. It tracks the navigation backstack and coordinates page transactions (e.g. `navController.navigate("home")`).
* **`NavHost`:** The layout placeholder. It links the NavController to a navigation graph, rendering the screen Composable matching the active route.
* **Routes:** String identifiers defining screen destinations (e.g. `"login"`, `"details/{id}"`).

---

## 2. Destination Graph Model

### Routing Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">NavController Route Graph</text>

  {/* Screen: Login */}
  <g transform="translate(40, 80)">
    <rect width="110" height="60" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Route: "login"</text>
    <text x="55" y="42" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">Login Screen</text>
  </g>

  {/* Screen: Home */}
  <g transform="translate(240, 80)">
    <rect width="120" height="60" rx="3" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Route: "home"</text>
    <text x="60" y="42" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Dashboard Screen</text>
  </g>

  {/* Screen: Details */}
  <g transform="translate(450, 80)">
    <rect width="110" height="60" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.2"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Route: "details/{id}"</text>
    <text x="55" y="42" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Details Screen</text>
  </g>

  {/* Navigation Lines */}
  <path d="M 150,110 L 240,110" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#nav-arrow)"/>
  <path d="M 360,110 L 450,110" stroke="#10b981" stroke-width="1.5" marker-end="url(#nav-arrow)"/>

  <defs>
    <marker id="nav-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Action | Command | Backstack Change | Common Use Case |
| :--- | :--- | :--- | :--- |
| **Navigate** | `navController.navigate("route")` | Pushes new destination to top | Standard screen forward transitions |
| **Pop** | `navController.popBackStack()` | Pops active destination off | Clicking back buttons |
| **Pop Up To** | `popUpTo("route") { inclusive = true }` | Clears stack up to route destination | Post-login cleanup (clears login screen) |

---

## 4. Kotlin Navigation Implementation

Below is a Kotlin implementation defining a NavHost container with routing and argument passing:

```kotlin
import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    // NavHost coordinates screens mapping
    NavHost(navController = navController, startDestination = "login") {
        // Login Destination
        composable("login") {
            LoginScreen(
                onLoginSuccess = { navController.navigate("home") }
            )
        }
        
        // Home Destination
        composable("home") {
            HomeScreen(
                onItemClick = { id -> navController.navigate("details/$id") }
            )
        }

        // Details Destination with integer argument
        composable(
            route = "details/{itemId}",
            arguments = listOf(navArgument("itemId") { type = NavType.IntType })
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getInt("itemId") ?: -1
            DetailsScreen(itemId = itemId)
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does popUpTo() prevent users from returning to the Login screen by clicking the back button?**
   *Answer:* By adding `popUpTo("login") { inclusive = true }` to the navigate configuration, the NavController pops the login screen off the backstack before pushing the home screen, making the home screen the new root.

2. **Why should you avoid passing complex objects (like data classes) directly inside navigation routes?**
   *Answer:* Routing configurations use URIs. Passing large objects requires serializing them into URL-encoded strings, which is slow, error-prone, and violates the separation of concerns. You should pass simple IDs (like database primary keys) and let the target screen query the database.
""",
        "content": {
            "introduction": "The Compose Navigation system routes screens inside a single activity, using NavControllers and NavHosts to manage backstacks.",
            "whyImportant": "Coordinating complex multi-screen app flows requires implementing clean routing networks.",
            "realWorldApps": ["Directing users to details pages with argument payload IDs.", "Clearing credentials login loops using popUpTo configurations."],
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
        "slug": "compose-remember-state",
        "title": "State Management: remember & State",
        "tagline": "Configure recomposition scopes, implement remember blocks, and persist values across rotations.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-viewmodel-state", "compose-side-effects"],
        "practiceProblems": [],
        "markdown": """# State Management: remember & State

In Jetpack Compose, the user interface is a reflection of **State**. When state values change, Compose executes **Recomposition**, running the Composable functions again with the new data to redraw the screen. Because functions rerun frequently, standard variables are reset. To protect variables, developers must master **remember** and **rememberSaveable**. This chapter covers recomposition scopes and state caching.

---

## 1. Recomposition and remember

When a Composable recomposes:
* **The Challenge:** Local variables are reinstantiated, losing their values (e.g. `var counter = 0` resets to `0` on every click).
* **The Solution (`remember`):** Caches values across recompositions. The first composition allocates the value; subsequent recompositions return the cached value.
* **The Solution (`rememberSaveable`):** Extends `remember` by serializing state into a Bundle, preserving values across configuration changes (like screen rotation or process recreation).

---

## 2. State Preservation Scope Matrix

To understand when variables survive, evaluate their storage mechanisms:

### State Lifetime Boundaries
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">State Survival Matrix</text>

  {/* Normal Variable */}
  <g transform="translate(40, 60)">
    <rect width="150" height="130" rx="3" fill="#1c1917" stroke="#44403c" stroke-width="1"/>
    <text x="75" y="22" fill="#78716c" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Local Variable</text>
    <text x="75" y="60" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">Recomposition: Reset</text>
    <text x="75" y="80" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">Rotation: Reset</text>
  </g>

  {/* remember */}
  <g transform="translate(225, 60)">
    <rect width="150" height="130" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="22" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">remember</text>
    <text x="75" y="60" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Recomposition: Saved</text>
    <text x="75" y="80" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">Rotation: Reset</text>
  </g>

  {/* rememberSaveable */}
  <g transform="translate(410, 60)">
    <rect width="150" height="130" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="22" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">rememberSaveable</text>
    <text x="75" y="60" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Recomposition: Saved</text>
    <text x="75" y="80" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Rotation: Saved</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| State Type | Survives Recomposition? | Survives Device Rotation? | Storage Backend |
| :--- | :--- | :--- | :--- |
| **`var text = ""`** | No | No | Local Stack Memory |
| **`remember { mutableStateOf("") }`** | Yes | No | In-memory Compose Cache |
| **`rememberSaveable { mutableStateOf("") }`**| Yes | Yes | Bundle serialization |

---

## 4. Kotlin State Management Example

Below is a Composable function declaring two states, demonstrating how `remember` behaves compared to `rememberSaveable` during rotations:

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable

@Composable
fun StateComparisonWidget() {
    // 1. remember: Resets to 0 if the device rotates
    var recomposeCount by remember { mutableStateOf(0) }

    // 2. rememberSaveable: Preserves count across rotations using Bundle serialization
    var rotationSafeCount by rememberSaveable { mutableStateOf(0) }

    Column {
        Text(text = "Recompose Count: $recomposeCount")
        Text(text = "Rotation-Safe Count: $rotationSafeCount")

        Button(
            onClick = {
                recomposeCount++
                rotationSafeCount++
            }
        ) {
            Text(text = "Increment Counts")
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does remember fail to preserve state during device rotation?**
   *Answer:* Screen rotation destroys the active activity instance and recreates it. The Compose cache associated with that activity is cleared, resetting `remember` values. `rememberSaveable` serializes values into a system Bundle before destruction, recovering them during recreation.

2. **What does mutableStateOf() accomplish?**
   *Answer:* It creates an observable wrapper. When you read a `MutableState` value, Compose registers the Composable as a listener. When the value updates, it alerts Compose to trigger a recomposition.
""",
        "content": {
            "introduction": "Compose updates views by running recompositions on state updates, using remember and rememberSaveable to protect variables from resetting.",
            "whyImportant": "Creating interactive layouts without resetting states requires caching variables inside remember blocks.",
            "realWorldApps": ["Tracking toggled expanded states of catalog card list items.", "Caching typed search terms across layout rotations using rememberSaveable."],
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
        "slug": "compose-viewmodel-state",
        "title": "ViewModel & Architecture State",
        "tagline": "Implement ViewModel architectures, collect StateFlows, and isolate UI states.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-remember-state"],
        "related": ["compose-side-effects"],
        "practiceProblems": [],
        "markdown": """# ViewModel & Architecture State

Exposing state directly inside Composable screens leads to complex files that are difficult to test. To build robust applications, architecture patterns isolate state management into a **ViewModel**. The ViewModel handles business logic, communicates with repository layers, and exposes observable states (using **StateFlow** or **LiveData**) to the UI. This chapter covers state hoisting, view model lifecycles, and Flow collection.

---

## 1. Unidirectional Data Flow (UDF)

Isolating state requires establishing a clean Unidirectional Data Flow:
* **State Flow Down:** The ViewModel contains the source of truth, exposing read-only UI state structures (e.g. `StateFlow<UiState>`). The Composables listen and render this state.
* **Events Flow Up:** The UI does not modify state directly. When a user clicks a button, the Composable sends an Event (calls a method) up to the ViewModel to process the change.

---

## 2. UDF Communication Architecture

### Unidirectional Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Unidirectional Data Flow Model</text>

  {/* UI Layer */}
  <g transform="translate(40, 80)">
    <rect width="130" height="80" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="35" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">Composables (UI)</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Renders state</text>
  </g>

  {/* ViewModel */}
  <g transform="translate(430, 80)">
    <rect width="130" height="80" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="35" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">ViewModel</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Stores UiState</text>
  </g>

  {/* Paths */}
  {/* State Flow Down */}
  <path d="M 430,105 L 170,105" stroke="#10b981" stroke-width="2" marker-end="url(#udf-arrow)"/>
  <text x="300" y="97" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">State (StateFlow)</text>

  {/* Events Flow Up */}
  <path d="M 170,135 L 430,135" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2 1" marker-end="url(#udf-arrow)"/>
  <text x="300" y="147" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">Events (Method Calls)</text>

  <defs>
    <marker id="udf-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| State Source | Target Scope | survives Rotation? | Testability |
| :--- | :--- | :--- | :--- |
| **`remember`** | Local Composable function | No | Low (coupled to UI) |
| **`rememberSaveable`** | Local Composable function | Yes | Low |
| **`ViewModel`** | Screen-level architecture | Yes (survives lifecycle) | High (isolated unit tests) |

---

## 4. Kotlin ViewModel Implementation

Below is a Kotlin implementation defining a ViewModel and collecting state changes inside a Composable screen:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.material3.Button
import androidx.compose.material3.Text

// 1. Define UI State structure
data class ProfileUiState(val username: String = "", val isPremium: Boolean = false)

// 2. ViewModel holds state source of truth
class ProfileViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun updateUsername(newName: String) {
        _uiState.value = _uiState.value.copy(username = newName)
    }
}

// 3. Composable observes state changes
@Composable
fun ProfileScreen(viewModel: ProfileViewModel) {
    // Collect Flow state dynamically as Compose state
    val state by viewModel.uiState.collectAsState()

    Column {
        Text(text = "User: ${state.username}")
        Button(onClick = { viewModel.updateUsername("Bob") }) {
            Text("Set Name")
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does a ViewModel survive device configuration rotations that destroy activities?**
   *Answer:* The Android architecture lifecycle provider caches ViewModel instances. When an activity is recreated due to rotation, the provider hooks the new activity instance to the existing ViewModel instance, preserving data.

2. **What does collectAsState() accomplish in Compose?**
   *Answer:* It is an extension function that collects values from a Kotlin Coroutines Flow and translates them into observable Compose `State` instances, triggering recompositions when flow updates are emitted.
""",
        "content": {
            "introduction": "ViewModels separate state logic from layouts, exposing read-only StateFlows to UI composables using a unidirectional pipeline.",
            "whyImportant": "Writing testable, robust Android apps requires isolating calculations and database operations inside ViewModels.",
            "realWorldApps": ["Fetching user profile details asynchronously inside a ViewModel and exposing it to Compose screen layers.", "Collecting shopping catalog flow updates dynamically inside lazy lists."],
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
        "slug": "compose-side-effects",
        "title": "Side Effects & Lifecycles",
        "tagline": "Configure coroutine triggers, manage DisposableEffects, and avoid infinite recomposition loops.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-viewmodel-state"],
        "related": ["compose-remember-state"],
        "practiceProblems": [],
        "markdown": """# Side Effects & Lifecycles

In Jetpack Compose, recompositions can run at any time, in any order, and on multiple threads. Therefore, Composable functions must be **pure**—they should only read state parameters and emit UI elements, without performing outside operations (like network calls, logging, or analytical tracking). To execute actions outside the Compose scope safely, developers use **Side-Effect APIs**. This chapter covers LaunchedEffect, DisposableEffect, and coroutine triggers.

---

## 1. Key Side-Effect APIs

Compose provides specialized tools to hook into recomposition lifecycles:

* **`LaunchedEffect(key):`** Launches a coroutine to run suspend functions when the Composable enters the layout tree. If the `key` parameter changes, the active coroutine is cancelled and a new one launches.
* **`DisposableEffect(key):`** Used for setups requiring cleanup (like registering/unregistering broadcast receivers). It exposes an `onDispose` block executed when the Composable leaves the tree.
* **`rememberCoroutineScope():`** Returns a coroutine scope bound to the Composable lifecycle, enabling you to launch coroutines in response to user events (like button clicks) outside of composable execution paths.

---

## 2. LaunchedEffect Key Execution Flow

When a `LaunchedEffect` is processed, its lifetime is bound to key variables:

### Key Change Lifecycle
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">LaunchedEffect Key Shifts</text>

  {/* Initial Entry */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Entry</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Key = "user_1"</text>
    <text x="65" y="70" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Coroutine Active</text>
  </g>

  {/* Key Shift */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Key Changes</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Key = "user_2"</text>
    <text x="65" y="70" fill="#fca5a5" font-size="6" font-family="monospace" text-anchor="middle">Cancels Coroutine</text>
  </g>

  {/* Restart */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Restart</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Key = "user_2"</text>
    <text x="65" y="70" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Launches new task</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#ef4444" stroke-width="1.5" marker-end="url(#se-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#se-arrow)"/>

  <defs>
    <marker id="se-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Effect API | Coroutine Scope? | Triggers When? | Cleanup Callback |
| :--- | :--- | :--- | :--- |
| **`LaunchedEffect`** | Yes | Key changes or enters tree | Automatic cancellation |
| **`DisposableEffect`**| No | Key changes or enters tree | Yes (`onDispose` block required) |
| **`SideEffect`** | No | After every successful recomposition | None |

---

## 4. Side Effects Code Example

Below is a Composable function using `LaunchedEffect` to fetch data from a server and `DisposableEffect` to manage a sensor listener:

```kotlin
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext

@Composable
fun DataMonitorScreen(userId: String) {
    var statusText by remember { mutableStateOf("Initializing...") }

    // 1. LaunchedEffect runs suspend functions, updates when userId changes
    LaunchedEffect(key1 = userId) {
        statusText = "Loading User: $userId"
        // Simulate suspend network call
        val result = fetchUserData(userId)
        statusText = "Loaded: $result"
    }

    // 2. DisposableEffect registers sensor, cleans up on exit
    DisposableEffect(key1 = userId) {
        val manager = SensorManagerHelper()
        manager.startListening()

        // Cleanup callback when leaving UI tree or key updates
        onDispose {
            manager.stopListening()
        }
    }

    Text(text = statusText)
}

suspend fun fetchUserData(id: String): String = "UserData($id)"
class SensorManagerHelper {
    fun startListening() {}
    fun stopListening() {}
}
```

---

## 5. Conceptual Check Questions

1. **Why does performing a network request directly inside a Composable body cause severe bugs?**
   *Answer:* The Composable body runs on every single recomposition. If a network request triggers directly inside the code body, recomposition loops will execute the fetch requests repeatedly, flooding the server and causing UI locks.

2. **When does the onDispose block of a DisposableEffect execute?**
   *Answer:* It executes when the Composable leaves the layout tree (is removed from screen) or immediately before the effect restarts because a key value changed.
""",
        "content": {
            "introduction": "Side Effect APIs manage non-Compose operations safely, coordinating LaunchedEffects and DisposableEffects in sync with recomposition lifecycles.",
            "whyImportant": "Avoiding memory leaks and repeating actions during UI redraws requires implementing side-effect containers.",
            "realWorldApps": ["Fetching data from networks when screen components load.", "Unregistering broadcast receivers dynamically on page teardown."],
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
        "slug": "xml-textview",
        "title": "Legacy XML TextView",
        "tagline": "Configure text styles, handle gravity alignments, and set formatting attributes inside XML layouts.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["xml-imageview", "xml-fragments"],
        "practiceProblems": [],
        "markdown": """# Legacy XML TextView

Before Jetpack Compose, Android interfaces were designed using XML layout files. The fundamental component for displaying text in XML is the **TextView**. While legacy, millions of apps maintain XML layouts. This chapter covers TextView attributes, spacing, gravity alignments, and performance.

---

## 1. Core XML Attributes

In XML, view properties are defined as schema namespaces (`android:`):
* **`android:id`:** Registers a unique identifier in resource mappings (e.g. `@+id/label_title`), used to reference the view in Kotlin.
* **`android:text`:** Sets the string content. Hardcoded strings should be avoided; reference resource values instead (`@string/hello`).
* **`android:textSize`:** Sizing configuration, defined in scale-independent pixels (`sp`).
* **`android:textColor`:** Color reference configuration (e.g. `@color/black`).

---

## 2. Layout Positioning: gravity vs. layout_gravity

Understanding alignments prevents positioning bugs inside parent views:
* **`android:gravity`:** Aligns the content *inside* the view container (e.g., centering text inside a wide text box).
* **`android:layout_gravity`:** Aligns the view container *relative to its parent* layout bounds.

### Alignment Comparisons
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">gravity vs. layout_gravity</text>

  {/* gravity: center */}
  <g transform="translate(60, 60)">
    <rect width="180" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Large text box, text centered */}
    <rect x="15" y="35" width="150" height="50" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="65" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Text Centered</text>
    <text x="90" y="145" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle">android:gravity="center"</text>
  </g>

  {/* layout_gravity: center */}
  <g transform="translate(360, 60)">
    <rect width="180" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Small text box, centered inside parent */}
    <rect x="40" y="45" width="100" height="30" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="63" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Text Box</text>
    <text x="90" y="145" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">layout_gravity="center"</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | gravity | layout_gravity |
| :--- | :--- | :--- |
| **Target** | Inner contents (text, images) | Outer view container |
| **Evaluation** | Calculated by the view itself | Calculated by the parent view container |
| **Typical Use** | Centering text inside headers | Centering buttons inside layouts |

---

## 4. TextView XML Layout Example

Below is an XML layout declaration for a TextView with overflow limits and text formatting:

```xml
<TextView
    android:id="@+id/text_news_title"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/news_headline_placeholder"
    android:textSize="18sp"
    android:textColor="@color/primary_dark"
    android:textStyle="bold"
    android:gravity="start"
    android:maxLines="2"
    android:ellipsize="end"
    android:padding="16dp" />
```

---

## 5. Conceptual Check Questions

1. **Why should you use sp units instead of dp for text sizes?**
   *Answer:* `sp` (scale-independent pixels) are similar to `dp` but automatically scale based on the user's system font preference settings, keeping layouts accessible for visually impaired users.

2. **What does android:ellipsize="end" accomplish?**
   *Answer:* It tells the layout manager to truncate text that exceeds the `maxLines` limit and append an ellipsis (...) at the end of the text.
""",
        "content": {
            "introduction": "Legacy XML TextViews display formatted text inside views hierarchies, using gravity namespace attributes to control alignments.",
            "whyImportant": "Maintaining legacy XML layouts requires knowing how TextView spacing and sizing attributes operate.",
            "realWorldApps": ["Formatting text inside legacy XML headers.", "Setting up accessibility margins inside form views."],
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
        "slug": "xml-imageview",
        "title": "Legacy XML ImageView",
        "tagline": "Configure graphic rendering scale types and manage memory allocations inside legacy XML.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["xml-textview"],
        "related": ["xml-fragments"],
        "practiceProblems": [],
        "markdown": """# Legacy XML ImageView

In XML layouts, the primary component for displaying graphic resources (drawables, vector assets, and downloaded bitmaps) is the **ImageView**. Similar to Compose's Image, managing how an image scales inside an ImageView is critical to prevent layout distortion and memory crashes. This chapter covers XML scale types, source formats, and memory optimizations.

---

## 1. Scale Type Behaviors

You configure image scaling inside the layout container using the `android:scaleType` attribute:

* **`centerCrop`:** Scales the image to fill the view bounds while preserving the aspect ratio, cropping any overflow.
* **`fitCenter`:** Scales the image to fit inside the view bounds, centering the graphic with potential empty margins.
* **`fitXY`:** Stretches the image dimensions to match the view bounds exactly, distorting aspect ratios.

---

## 2. XML scaleType Comparisons

### centerCrop vs. fitCenter vs. fitXY
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">XML scaleType Properties</text>

  {/* centerCrop */}
  <g transform="translate(40, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Large circle cropped */}
    <circle cx="65" cy="60" r="60" fill="#3b82f6"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">centerCrop</text>
  </g>

  {/* fitCenter */}
  <g transform="translate(235, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Circle fits inside */}
    <circle cx="65" cy="60" r="40" fill="#10b981"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">fitCenter</text>
  </g>

  {/* fitXY */}
  <g transform="translate(430, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Ellipse stretching */}
    <ellipse cx="65" cy="60" rx="60" ry="40" fill="#a855f7"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">fitXY (Stretched)</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| scaleType Value | Aspect Ratio Preserved? | Fills View Bounds? | Content Clipped? |
| :--- | :--- | :--- | :--- |
| **`centerCrop`** | Yes | Yes | Yes (edges are cropped) |
| **`fitCenter`** | Yes | No (centered letterbox) | No |
| **`fitXY`** | No | Yes | No |
| **`center`** | Yes | No (original size) | Yes (if image > view) |

---

## 4. ImageView XML Layout Example

Below is an XML layout declaration for an ImageView displaying a scaled drawable resource:

```xml
<ImageView
    android:id="@+id/image_product_logo"
    android:layout_width="match_parent"
    android:layout_height="200dp"
    android:src="@drawable/product_banner_placeholder"
    android:scaleType="centerCrop"
    android:adjustViewBounds="true"
    android:contentDescription="@string/product_image_desc" />
```

---

## 5. Conceptual Check Questions

1. **Why is it critical to configure android:contentDescription on ImageViews?**
   *Answer:* It provides an accessibility description. Screen reader services (like TalkBack) read this description to describe what the image represents to visually impaired users. If purely decorative, configure it to `@null`.

2. **What does the adjustViewBounds attribute accomplish when set to true?**
   *Answer:* It tells the ImageView to adjust its layout boundaries (width/height dimensions) to match the aspect ratio of the loaded graphic, preventing empty padding spaces.
""",
        "content": {
            "introduction": "Legacy XML ImageViews render image drawables, using scaleType parameters to stretch, crop, or fit graphics inside view bounds.",
            "whyImportant": "Preventing image distortion and managing accessibility tags requires understanding ImageView properties.",
            "realWorldApps": ["Rendering vector logos inside legacy login panels.", "Setting up crop configurations inside product catalog listing layouts."],
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
        "slug": "xml-fragments",
        "title": "Legacy XML Fragments",
        "tagline": "Configure modular screen sub-states, manage transactions, and analyze lifecycle callbacks.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-activity-lifecycle"],
        "related": ["xml-recyclerview"],
        "practiceProblems": [],
        "markdown": """# Legacy XML Fragments

In legacy Android layouts, writing all logic inside a single Activity leads to bloated, unmaintainable classes. To modularize layouts, Android uses **Fragments**. A Fragment represents a modular section of a user interface, carrying its own lifecycle and UI hierarchy, hosted inside an Activity. This chapter covers the Fragment lifecycle, FragmentManager, and transactions.

---

## 1. Fragment Lifecycle States

A Fragment has its own lifecycle, which is coordinated by its host Activity. It introduces several distinct lifecycle callbacks:

* **`onAttach():`** Called when the Fragment is first bound to its host Activity.
* **`onCreateView():`** Instantiates and returns the Fragment's XML layout view hierarchy.
* **`onViewCreated():`** Called after the view hierarchy is created, indicating it is safe to set up listeners and adapters.
* **`onDestroyView():`** Called when the layout is removed from the view tree, requiring you to clear view references.
* **`onDetach():`** Called when the Fragment is unbound from the host Activity.

---

## 2. Lifecycle Callback Graph

The Fragment lifecycle mirrors Activity states, with additional attachment and view creation phases:

### Fragment Lifecycle Path
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Fragment Lifecycle Stages</text>

  {/* Attachment Callbacks */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">1. Attachment</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onAttach()</text>
    <text x="65" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onCreate()</text>
  </g>

  {/* View Callbacks */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">2. View Creation</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onCreateView()</text>
    <text x="65" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onViewCreated()</text>
  </g>

  {/* Tear Down */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">3. Teardown</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onDestroyView()</text>
    <text x="65" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onDetach()</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#frag-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#frag-arrow)"/>

  <defs>
    <marker id="frag-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Fragment Transactions

Fragments are managed using **FragmentManager**. To add, replace, or remove a fragment at runtime, you execute a **FragmentTransaction**:
* **`replace`:** Removes the active fragment in the target layout container and inserts a new fragment instance.
* **`addToBackStack`:** Saves the transaction state. Clicking the back button reverses the swap (restoring the previous fragment) rather than exiting the host activity.

---

## 4. Kotlin Fragment Transaction Example

Below is a Kotlin code block showing how to replace a fragment container inside an Activity:

```kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.commit

class HostActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_host)

        if (savedInstanceState == null) {
            // Execute fragment replacement transaction
            supportFragmentManager.commit {
                setReorderingAllowed(true)
                // Swap fragment container content
                replace(R.id.fragment_container_view, DetailsFragment())
                // Push transaction to navigation backstack
                addToBackStack(null)
            }
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why must you clear view binding references inside onDestroyView()?**
   *Answer:* A Fragment's view hierarchy can be destroyed while the Fragment instance itself remains alive in the backstack. Failing to clear view references (like bindings) inside `onDestroyView()` causes memory leaks.

2. **What does setReorderingAllowed(true) accomplish in a FragmentTransaction?**
   *Answer:* It optimizes fragment transitions by grouping overlapping operations. For example, if you add and immediately replace a fragment, it prevents intermediate layout inflation animations.
""",
        "content": {
            "introduction": "Fragments serve as modular sub-screens hosted inside activities, utilizing FragmentManagers to execute replace and backstack transactions.",
            "whyImportant": "Organizing legacy app pages and managing screen navigation requires coordinating fragment transactions.",
            "realWorldApps": ["Replacing details pages inside tablet master-detail layouts.", "Designing bottom navigation bars swapping active sub-screen fragments."],
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
        "slug": "xml-recyclerview",
        "title": "Legacy XML RecyclerView",
        "tagline": "Configure Adapters, cache views inside ViewHolders, and implement DiffUtil update calculations.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["xml-fragments"],
        "related": ["android-dsa-basics"],
        "practiceProblems": [],
        "markdown": """# Legacy XML RecyclerView

In XML layouts, rendering scrollable lists of datasets is handled by the **RecyclerView**. Like Compose's `LazyColumn`, the RecyclerView is designed to display large lists efficiently by recycling layout containers. This chapter covers the RecyclerView architecture, Adapters, ViewHolders, and **DiffUtil** optimizations.

---

## 1. RecyclerView Architecture

The RecyclerView relies on the cooperation of three primary classes:

* **`ViewHolder`:** Caches references to the child views within a list item layout (e.g. TextViews, ImageViews), avoiding slow `findViewById` lookups.
* **`Adapter`:** Manages the dataset. It instantiates new ViewHolders and binds them to specific data indices (e.g., placing text inside the cached view).
* **`LayoutManager`:** Determines how items are arranged on screen (e.g. `LinearLayoutManager` for list scrolling, `GridLayoutManager` for grids).

---

## 2. Memory Recycling Model

When an item scrolls off the screen, the RecyclerView places its ViewHolder inside a recycled view pool. Instead of instantiating a new view for the next item entering the screen, the system pulls a ViewHolder from the pool and re-binds it with new data:

### ViewHolder Recycling Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">RecyclerView View Recycling Pipeline</text>

  {/* Active Viewport */}
  <g transform="translate(40, 60)">
    <rect width="130" height="130" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="65" y="15" fill="#cbd5e1" font-size="8" font-family="monospace" text-anchor="middle">Active Viewport</text>
    
    <rect x="15" y="30" width="100" height="25" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="65" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">ViewHolder A</text>

    <rect x="15" y="65" width="100" height="25" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="65" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">ViewHolder B</text>
  </g>

  {/* Recycled Pool */}
  <g transform="translate(235, 90)">
    <rect width="130" height="70" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Recycled Pool</text>
    <text x="65" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Idle ViewHolders</text>
  </g>

  {/* New Item Entry */}
  <g transform="translate(430, 60)">
    <rect width="130" height="130" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="65" y="15" fill="#cbd5e1" font-size="8" font-family="monospace" text-anchor="middle">Entering Screen</text>
    
    <rect x="15" y="50" width="100" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="68" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">Re-bound Holder</text>
  </g>

  {/* Paths */}
  {/* Scroll off */}
  <path d="M 125,125 Q 180,180 235,145" stroke="#ef4444" stroke-width="1.5" marker-end="url(#rv-arrow)"/>
  <text x="175" y="170" fill="#ef4444" font-size="6" font-family="monospace" text-anchor="middle">1. Scroll Off</text>

  {/* Reuse */}
  <path d="M 365,125 Q 400,90 445,95" stroke="#10b981" stroke-width="1.5" marker-end="url(#rv-arrow)"/>
  <text x="400" y="85" fill="#10b981" font-size="6" font-family="monospace" text-anchor="middle">2. Rebind</text>

  <defs>
    <marker id="rv-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. DiffUtil Optimizations

Historically, updating a list required calling `notifyDataSetChanged()`, which forced the RecyclerView to redraw all rows, causing lag. Modern code uses **DiffUtil**:
* **DiffUtil** calculates the difference between the old list and the new list using Eugene Myers' difference algorithm.
* It outputs targeted updates (e.g. "insert index 3, remove index 8"), allowing the RecyclerView to animate only the modified rows.

---

## 4. Kotlin RecyclerView Adapter Example

Below is a Kotlin implementation of a RecyclerView Adapter using DiffUtil to manage updates:

```kotlin
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView

data class UserItem(val id: Int, val name: String)

// 1. Adapter extends ListAdapter to integrate DiffUtil automatically
class UserAdapter : ListAdapter<UserItem, UserAdapter.UserViewHolder>(UserDiffCallback()) {

    // 2. ViewHolder caches layout view references
    class UserViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val nameText: TextView = itemView.findViewById(R.id.text_user_name)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_user, parent, false)
        return UserViewHolder(view)
    }

    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        val item = getItem(position)
        // Bind data directly to cached view
        holder.nameText.text = item.name
    }
}

// 3. DiffUtil callback defines similarity logic
class UserDiffCallback : DiffUtil.ItemCallback<UserItem>() {
    override fun areItemsTheSame(oldItem: UserItem, newItem: UserItem): Boolean = oldItem.id == newItem.id
    override fun areContentsTheSame(oldItem: UserItem, newItem: UserItem): Boolean = oldItem == newItem
}
```

---

## 5. Conceptual Check Questions

1. **Why does RecyclerView require a ViewHolder pattern?**
   *Answer:* Calling `findViewById()` traverses the view tree to locate components, which is slow. Caching view references inside a `ViewHolder` allows the adapter to update values directly, preserving rendering speeds during fast scrolls.

2. **How does DiffUtil compare to notifyDataSetChanged()?**
   *Answer:* `notifyDataSetChanged()` resets the entire list, preventing animations and consuming significant CPU resources. `DiffUtil` compares the items to issue precise row inserts/removes, enabling smooth animations and high-performance updates.
""",
        "content": {
            "introduction": "RecyclerViews display datasets efficiently inside XML view trees, using Adapters and ViewHolders to recycle row layout objects.",
            "whyImportant": "Optimizing scroll speeds and updating large datasets without lags requires implementing RecyclerViews and DiffUtils.",
            "realWorldApps": ["Rendering user contact records inside lists.", "Updating feeds dynamically using DiffUtil recalculations."],
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
