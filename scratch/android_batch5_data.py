# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 5 articles

ANDROID_BATCH5_ARTICLES = [
    {
        "slug": "xml-cardview",
        "title": "Legacy XML CardView",
        "tagline": "Configure card boundaries, adjust elevations, and control compat paddings inside legacy XML.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["xml-imageview"],
        "related": ["xml-customview", "xml-constraint-layout"],
        "practiceProblems": [],
        "markdown": """# Legacy XML CardView

In XML layout hierarchies, the **CardView** (part of the Android Jetpack library) acts as a frame container. It provides a standardized Material Design card layout, automatically adding rounded corners, background colors, and drop-shadow elevations. This chapter covers card attributes, compatibility shadows, and padding behaviors.

---

## 1. Core CardView Attributes

CardView exposes attributes using the `app:` namespace:
* **`app:cardCornerRadius`:** Adjusts the corner rounding radius (e.g., `8dp`).
* **`app:cardElevation`:** Defines the drop-shadow depth (e.g., `4dp`), simulating card height relative to the screen plane.
* **`app:cardBackgroundColor`:** Sets the card's background color, avoiding default white overlaps.
* **`app:cardUseCompatPadding`:** Ensures identical padding margins on older Android versions by allocating space for compatibility shadows.

---

## 2. Legacy CardView Shadow Layering

### Compatibility Shadow Padding
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">CardView Border Padding</text>

  {/* Card Wrapper */}
  <g transform="translate(180, 50)">
    {/* Shadow bounds */}
    <rect x="-10" y="-10" width="260" height="140" rx="20" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 2"/>
    <text x="120" y="-15" fill="#f59e0b" font-size="6" font-family="monospace" text-anchor="middle">Compat Shadow Bounds</text>

    {/* Primary Card */}
    <rect width="240" height="120" rx="16" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <text x="120" y="60" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">CardView Container</text>
    <text x="120" y="75" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">app:cardCornerRadius="16dp"</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Standard FrameLayout | CardView Container |
| :--- | :--- | :--- |
| **Corner Clipping** | None (sharp 90-degree corners) | Rounded (clips children to corners) |
| **Elevation Shadows**| Requires custom shadow drawables | Native `cardElevation` shadows |
| **Padding Control** | Manual `android:padding` overrides | Automatic `cardPreventCornerOverlap` logic |

---

## 4. CardView XML Layout Example

Below is an XML declaration showing a CardView hosting a product image and label:

```xml
<androidx.cardview.widget.CardView
    xmlns:android="http://schemas.microsoft.com/apk/res/android"
    xmlns:app="http://schemas.microsoft.com/apk/res-auto"
    android:id="@+id/card_product"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="6dp"
    app:cardUseCompatPadding="true"
    app:cardBackgroundColor="@color/cardview_dark_background">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <ImageView
            android:id="@+id/image_product"
            android:layout_width="match_parent"
            android:layout_height="120dp"
            android:scaleType="centerCrop" />

        <TextView
            android:id="@+id/text_title"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="Product Title" />
    </LinearLayout>
</androidx.cardview.widget.CardView>
```

---

## 5. Conceptual Check Questions

1. **Why is cardUseCompatPadding="true" important for consistent designs?**
   *Answer:* On older Android versions (pre-Lollipop), CardView adds extra padding inside the container to prevent children from drawing over the card's rounded corners. Setting `cardUseCompatPadding` to true forces newer OS versions to add the same padding, keeping the layout consistent.

2. **Can you add elevation shadows to CardView dynamically in Java/Kotlin?**
   *Answer:* Yes. Using `setCardElevation(float elevation)` updates the shadow depth programmatically, enabling elevation animations when the card is clicked.
""",
        "content": {
            "introduction": "Legacy CardViews encapsulate elevation shadows and rounded corners inside XML layouts, offering compatibility settings for older Android versions.",
            "whyImportant": "Maintaining consistent shadow layouts on older devices requires utilizing CardView containers.",
            "realWorldApps": ["Designing product items in scrollable legacy lists.", "Creating profile item groups with rounded borders."],
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
        "slug": "xml-customview",
        "title": "XML Custom Views",
        "tagline": "Extend View base components, configure onMeasure sizes, and draw on Canvas contexts.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["xml-cardview"],
        "related": ["xml-constraint-layout"],
        "practiceProblems": [],
        "markdown": """# XML Custom Views

When standard system components (like Buttons or TextViews) cannot implement your design requirements, you must build **Custom Views**. A Custom View subclass overrides Android's rendering loop callbacks, defining its own sizing constraints and custom drawing instructions. This chapter covers view measurements, layout pipelines, and Canvas drawing.

---

## 1. Custom View Lifecycle Pipeline

Every View in Android flows through three primary rendering phases:
1. **Measurement (`onMeasure`):** Determines the view's width and height. You parse **MeasureSpec** constraints (EXACTLY, AT_MOST, UNSPECIFIED) to set the dimensions.
2. **Layout (`onLayout`):** Positions the view and its children inside parent coordinates.
3. **Drawing (`onDraw`):** Renders lines, text, and shapes on the screen using a **Canvas** and **Paint** configuration.

---

## 2. Rendering Lifecycle Loop

### View Phase Sequence
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Custom View Layout Lifecycle</text>

  {/* onMeasure */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Measure</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onMeasure()</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">MeasureSpec parses</text>
  </g>

  {/* onLayout */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#60a5fa" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Layout</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onLayout()</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Position nodes</text>
  </g>

  {/* onDraw */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Draw</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onDraw()</text>
    <text x="65" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Canvas drawing</text>
  </g>

  {/* Paths */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#cv-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#cv-arrow)"/>

  <defs>
    <marker id="cv-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| MeasureSpec Mode | Parent Intent | View Constraints |
| :--- | :--- | :--- |
| **`EXACTLY`** | Parent has defined size | View must match exact size (e.g. `120dp` or `match_parent`) |
| **`AT_MOST`** | Parent defined max limit | View can scale up to target size (e.g. `wrap_content`) |
| **`UNSPECIFIED`** | Parent has no limits | View can choose any size (e.g. nested scrolling) |

---

## 4. Kotlin Custom View Example

Below is a Kotlin implementation of a custom circular progress indicator:

```kotlin
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View

class CircularIndicator @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    // Instantiate paint tool to configure stroke styling
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.BLUE
        style = Paint.Style.STROKE
        strokeWidth = 10f
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        // Resolve size by matching requirements (defaulting to 150px)
        val desiredWidth = 150
        val resolvedWidth = resolveSize(desiredWidth, widthMeasureSpec)
        val resolvedHeight = resolveSize(desiredWidth, heightMeasureSpec)
        setMeasuredDimension(resolvedWidth, resolvedHeight)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f
        val cy = height / 2f
        val radius = (Math.min(width, height) / 2f) - 20f
        
        // Draw primary circle on Canvas context
        canvas.drawCircle(cx, cy, radius, paint)
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why must you avoid instantiating Paint objects inside the onDraw() callback?**
   *Answer:* The `onDraw()` callback executes frequently during UI redraws. Instantiating objects inside `onDraw()` floods the memory heap, triggering the Garbage Collector (GC) repeatedly. This halts rendering threads, causing frame drops (jank).

2. **What does the invalidate() method do?**
   *Answer:* It tells the system the view's content has changed and needs redrawing, forcing Android to schedule a new call to `onDraw()`.
""",
        "content": {
            "introduction": "Custom Views extend the base View class to override measurement and drawing callbacks, customizing shapes and properties.",
            "whyImportant": "Creating complex UI interactions and custom graphic overlays requires building custom views.",
            "realWorldApps": ["Designing custom dial knobs or graph widgets.", "Building animated custom progress indicators."],
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
        "slug": "xml-constraint-layout",
        "title": "ConstraintLayout in XML",
        "tagline": "Configure constraint networks, create view chains, and set biases inside legacy XML layouts.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["xml-textview"],
        "related": ["xml-recyclerview"],
        "practiceProblems": [],
        "markdown": """# ConstraintLayout in XML

In legacy XML layouts, nesting deep view hierarchies (such as placing vertical LinearLayouts inside horizontal RelativeLayouts) slows down the rendering engine. To keep layout hierarchies flat and performant, Android uses **ConstraintLayout**. This container lets you position views relative to each other using constraint links. This chapter covers layout chains, biases, and guidelines.

---

## 1. Constraint Rules and Anchors

Inside a ConstraintLayout XML:
* **Relative Constraints:** Views are positioned by linking their edges to other views or the parent edges (e.g. `app:layout_constraintTop_toBottomOf="@+id/title"`).
* **Bias:** Adjusts positioning when a view is constrained on both sides. A bias of `0.5` centers the view, while `0.2` moves it closer to the start edge.
* **Chains:** Group views horizontally or vertically, sharing space dynamically (using spread, spread_inside, or packed configurations).

---

## 2. Chain Configuration Profiles

### Chain Alignments
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">XML ConstraintLayout Chain Modes</text>

  {/* Spread Chain */}
  <g transform="translate(40, 55)">
    <rect x="15" y="10" width="80" height="30" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <rect x="115" y="10" width="80" height="30" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <rect x="215" y="10" width="80" height="30" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="155" y="55" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">chainStyle="spread"</text>
  </g>

  {/* Spread Inside Chain */}
  <g transform="translate(40, 140)">
    <rect x="0" y="10" width="80" height="30" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <rect x="115" y="10" width="80" height="30" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <rect x="230" y="10" width="80" height="30" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="155" y="55" fill="#c084fc" font-size="7" font-family="monospace" text-anchor="middle">chainStyle="spread_inside"</text>
  </g>

  {/* Packed Chain */}
  <g transform="translate(360, 95)">
    <rect x="10" y="10" width="55" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <rect x="70" y="10" width="55" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <rect x="130" y="10" width="55" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="100" y="55" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">chainStyle="packed"</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Chain Mode | Child Margins | Outer Spacing |
| :--- | :--- | :--- |
| **`spread`** | Divided equally among items | Allocated to outer edges |
| **`spread_inside`** | Divided equally among items | None (first and last items touch screen edges) |
| **`packed`** | Items grouped close together | Placed at outer edges (center aligned) |

---

## 4. ConstraintLayout XML Example

Below is an XML snippet demonstrating two views aligned using ConstraintLayout:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.microsoft.com/apk/res/android"
    xmlns:app="http://schemas.microsoft.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <Button
        android:id="@+id/button_submit"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:text="Submit Details"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintBottom_toBottomSheet="parent"
        android:layout_margin="16dp" />

    <TextView
        android:id="@+id/text_description"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Welcome User"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintBottom_toTopOf="@id/button_submit"
        android:layout_marginBottom="24dp" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

---

## 5. Conceptual Check Questions

1. **How do Guideline widgets help design responsive screens in XML?**
   *Answer:* Guidelines are invisible references inside ConstraintLayout. You define them using a fixed offset or percentage (e.g. `app:layout_constraintGuide_percent="0.5"` to mark 50% screen width), allowing you to align views consistently across varying display resolutions.

2. **What does a width of 0dp signify inside ConstraintLayout?**
   *Answer:* `0dp` represents `MATCH_CONSTRAINT`. Rather than matching the parent width directly, the view calculates its width dynamically to match the exact boundaries defined by its start and end constraint links.
""",
        "content": {
            "introduction": "ConstraintLayout arranges XML views using relative constraint references, offering chains and guides to build responsive interfaces.",
            "whyImportant": "Creating complex layouts with flat XML hierarchies to speed up drawing times requires implementing ConstraintLayout.",
            "realWorldApps": ["Designing complex settings forms that scale on tablets.", "Aligning multiple items horizontally using spread chain structures."],
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
        "slug": "android-coroutines",
        "title": "Kotlin Coroutines",
        "tagline": "Master coroutines foundations, write suspend functions, and coordinate launch vs async builders.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-coroutines-scopes", "android-coroutines-dispatchers"],
        "practiceProblems": [],
        "markdown": """# Kotlin Coroutines

Mobile apps must perform long-running tasks, such as loading database items or sending network requests, without blocking the UI thread. Historically, Android relied on complex callbacks or threading libraries. Today, Android uses **Kotlin Coroutines**. Coroutines are light-weight, cooperatively scheduled threads that simplify asynchronous programming. This chapter covers suspend functions, jobs, and execution builders.

---

## 1. Suspend Functions

The foundation of coroutines is the **suspend function** (declared using the `suspend` keyword):
* **Suspension:** When a coroutine calls a suspend function, it pauses execution without blocking the host thread. The thread remains free to render animations or process user clicks.
* **Resumption:** Once the background work completes, the coroutine resumes execution on its thread from the exact line where it paused.

---

## 2. Launch vs. Async Execution Builders

To start a coroutine, you use **coroutine builders**:

* **`launch`:** Starts a fire-and-forget task. It returns a **Job** object that you can use to cancel the operation, but does not return a result.
* **`async`:** Starts a task that returns a result. It returns a **Deferred<T>** object, and calling `await()` pauses execution until the result is available.

### Builder Execution Models
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Launch vs. Async Coroutine Paths</text>

  {/* Launch Route */}
  <g transform="translate(40, 60)">
    <rect width="240" height="130" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1.5"/>
    <text x="120" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">launch { }</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">1. Fires Background Job</text>
    <text x="15" y="75" fill="#fff" font-size="7" font-family="monospace">2. Does not return result</text>
    <text x="15" y="95" fill="#10b981" font-size="7" font-family="monospace">3. Job active -> Cancelable</text>
  </g>

  {/* Async Route */}
  <g transform="translate(320, 60)">
    <rect width="240" height="130" fill="#1e1b4b" rx="2" stroke="#475569" stroke-width="1.5"/>
    <text x="120" y="25" fill="#c084fc" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">async { }</text>
    <text x="15" y="55" fill="#fff" font-size="7" font-family="monospace">1. Fires Parallel Task</text>
    <text x="15" y="75" fill="#fff" font-size="7" font-family="monospace">2. Returns Deferred&lt;T&gt;</text>
    <text x="15" y="95" fill="#10b981" font-size="7" font-family="monospace">3. await() yields final result</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Coroutine Builder | Return Type | blocking Behavior | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **`launch`** | `Job` | Fire-and-forget (does not block) | Database inserts, analytic pings |
| **`async`** | `Deferred<T>` | Non-blocking (yields on `await()`) | Parallel API fetches |

---

## 4. Kotlin Coroutine Implementation

Below is a Kotlin program demonstrating how to fetch data from two APIs in parallel using coroutines:

```kotlin
import kotlinx.coroutines.*

suspend fun fetchStockPrice(): Double {
    delay(1000) // Non-blocking delay
    return 145.50
}

suspend fun fetchCurrencyRate(): Double {
    delay(1000)
    return 1.12
}

// Coordinate parallel executions
fun performFinancialCalculations() {
    val scope = CoroutineScope(Dispatchers.IO)
    
    scope.launch {
        // Launch both tasks in parallel
        val stockDeferred = async { fetchStockPrice() }
        val currencyDeferred = async { fetchCurrencyRate() }

        // Wait for both results
        val stock = stockDeferred.await()
        val rate = currencyDeferred.await()

        val convertedPrice = stock * rate
        println("Converted price: $convertedPrice")
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does delay() differ from Thread.sleep()?**
   *Answer:* `Thread.sleep()` blocks the active thread, stopping all other work on that thread. `delay()` suspends the current coroutine, freeing the thread to run other tasks in the meantime.

2. **What does calling job.cancel() accomplish?**
   *Answer:* It cancels the coroutine. If the coroutine is cooperative (regularly checks for cancellation or uses suspend functions like `delay`), it will halt execution immediately and clean up resource handles.
""",
        "content": {
            "introduction": "Coroutines facilitate asynchronous task execution without blocking threads, using suspend functions and launch/async builders.",
            "whyImportant": "Keeping apps fast and responsive during long network requests requires using asynchronous coroutines.",
            "realWorldApps": ["Fetching feed items from an API in parallel.", "Saving user profile drafts to local databases in the background."],
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
        "slug": "android-thread-basics",
        "title": "Android Threading Basics",
        "tagline": "Analyze the UI main thread, delegate to background workers, and prevent ANR crashes.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-thread-handlers", "android-thread-executors"],
        "practiceProblems": [],
        "markdown": """# Android Threading Basics

Every Android application operates on a single-threaded execution model by default. When the system launches your app, it creates a Linux process containing a single thread called the **Main Thread** (or **UI Thread**). Understanding how the Main Thread coordinates views, and how to delegate tasks to background worker threads, is essential to build responsive apps. This chapter covers Main Thread duties, background threads, and **ANR** crashes.

---

## 1. The Main Thread and ANR Exceptions

The **Main Thread** is responsible for:
* Dispensation of user input events (screen touches, key clicks).
* Drawing the user interface (drawing views, executing animations).

**The Single Thread Rule:** You must never block the Main Thread. Doing a slow operation (like downloading a file or querying a database) blocks the rendering loop. If the Main Thread remains blocked for more than **5 seconds**, the operating system terminates the process and displays an **Application Not Responding (ANR)** error dialog.

---

## 2. ANR Thread Block Model

### Thread Execution Paths
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">Main Thread Blockage (ANR Trigger)</text>

  {/* Blocked Path */}
  <g transform="translate(40, 60)">
    <rect width="240" height="130" fill="#1c1917" rx="2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="120" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Main Thread (Blocked)</text>
    <text x="20" y="55" fill="#fff" font-size="7" font-family="monospace">Runs heavy database query</text>
    <text x="20" y="75" fill="#fff" font-size="7" font-family="monospace">Cannot draw frames (screen freeze)</text>
    <text x="20" y="95" fill="#fca5a5" font-size="7" font-family="monospace" font-weight="bold">> 5 Seconds: ANR CRASH</text>
  </g>

  {/* Correct Worker Path */}
  <g transform="translate(320, 60)">
    <rect width="240" height="130" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="120" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Worker Thread (Asynchronous)</text>
    <text x="20" y="55" fill="#fff" font-size="7" font-family="monospace">Processes API calls / Queries</text>
    <text x="20" y="75" fill="#fff" font-size="7" font-family="monospace">Main Thread remains free</text>
    <text x="20" y="95" fill="#a7f3d0" font-size="7" font-family="monospace">Result sent back when ready</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Thread Scope | Allowed Operations | Forbidden Operations | Result on Violation |
| :--- | :--- | :--- | :--- |
| **Main (UI) Thread** | UI drawing, click handlers, layouts | Network calls, database queries | ANR Crash or NetworkOnMainThreadException |
| **Worker Thread** | Calculations, files, API calls | Drawing UI, updating View properties | CalledFromWrongThreadException |

---

## 4. Kotlin Thread Delegation Example

Below is a Kotlin program showing how to spawn a background thread to fetch data, returning the result to the main thread:

```kotlin
import android.os.Handler
import android.os.Looper

fun performThreadedNetworkRequest(onComplete: (String) -> Unit) {
    // 1. Spawn background worker thread
    Thread {
        // Execute heavy computation/network call in background
        val responseData = simulateNetworkCall()

        // 2. Route result back to Main Thread using Handler-Looper
        val mainHandler = Handler(Looper.getMainLooper())
        mainHandler.post {
            // Safe to interact with UI here
            onComplete(responseData)
        }
    }.start()
}

fun simulateNetworkCall(): String {
    Thread.sleep(2000) // Block background thread safely
    return "API response packet"
}
```

---

## 5. Conceptual Check Questions

1. **Why does Android throw NetworkOnMainThreadException?**
   *Answer:* Starting with Android 3.0, the OS throws this exception immediately if an app attempts to make a network request on the main thread, proactively preventing ANR crashes.

2. **Can you update a TextView's text from a background worker Thread directly?**
   *Answer:* No. Android views are not thread-safe and can only be updated from the thread that created them (the Main Thread). Attempting to update a View on a background thread throws a `CalledFromWrongThreadException`.
""",
        "content": {
            "introduction": "Android runs UI drawing on a single Main Thread, requiring developers to delegate heavy calculations to worker threads to avoid ANR crashes.",
            "whyImportant": "Keeping layouts responsive and avoiding OS-level crashes requires implementing off-thread tasks.",
            "realWorldApps": ["Running JSON parse operations off-thread.", "Downloading binary update files using background thread scopes."],
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
        "slug": "android-thread-handlers",
        "title": "Handlers & Loopers",
        "tagline": "Analyze message loop architectures, send messages to queues, and dispatch work safely.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-thread-basics"],
        "related": ["android-thread-executors"],
        "practiceProblems": [],
        "markdown": """# Handlers & Loopers

To communicate between background threads and the UI thread, Android uses the **Handler, Looper, and MessageQueue** framework. This system is how Android handles tasks sequentially on a single thread. This chapter covers the message loop architecture, handler message dispatching, and runnables scheduling.

---

## 1. The Looper Architecture Components

The framework consists of three cooperating elements:

* **`Looper`:** Runs an infinite message loop on a specific thread. It monitors the message queue and pulls scheduled tasks to execute them.
* **`MessageQueue`:** A queue that holds scheduled `Message` or `Runnable` tasks waiting to run on the thread.
* **`Handler`:** The bridge. It allows threads to push tasks into a MessageQueue and processes them when they are pulled by the Looper.

---

## 2. Message Loop Diagram

### Handler Communication Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Looper Message Pipeline</text>

  {/* Sender Thread */}
  <g transform="translate(40, 80)">
    <rect width="120" height="80" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="60" y="35" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Worker Thread</text>
    <text x="60" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">handler.post(Runnable)</text>
  </g>

  {/* MessageQueue */}
  <g transform="translate(220, 60)">
    <rect width="160" height="120" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="80" y="20" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">MessageQueue</text>
    <rect x="15" y="35" width="130" height="20" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="80" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Task 1 (Runnable)</text>
    <rect x="15" y="65" width="130" height="20" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="80" y="77" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Task 2 (Message)</text>
  </g>

  {/* Target Thread */}
  <g transform="translate(440, 80)">
    <rect width="120" height="80" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="35" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Main Looper</text>
    <text x="60" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Pulls and executes</text>
  </g>

  {/* Paths */}
  <path d="M 160,120 L 220,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#hl-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#hl-arrow)"/>

  <defs>
    <marker id="hl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Class | Primary Purpose | Thread Count | Execution Lifetime |
| :--- | :--- | :--- | :--- |
| **`Looper`** | Runs the message loop | 1 per target Thread | Active until `quit()` is called |
| **`MessageQueue`** | Holds queued messages | 1 per Looper instance | Bound to Looper lifetime |
| **`Handler`** | Posts and processes messages | Multiple per thread | Instantiated at any point |

---

## 4. Handler Layout Execution Example

Below is a Kotlin program showing how to schedule a delayed task on the main thread using a Handler:

```kotlin
import android.os.Handler
import android.os.Looper

class UIActionManager {

    // 1. Bind Handler to Main Looper
    private val mainHandler = Handler(Looper.getMainLooper())

    fun scheduleBannerFade() {
        val fadeTask = Runnable {
            // This code runs on the Main Thread when executed
            updateBannerVisibility(false)
        }

        // 2. Post Runnable to queue with 3000ms delay
        mainHandler.postDelayed(fadeTask, 3000)
    }

    private fun updateBannerVisibility(show: Boolean) {
        // UI logic
    }
}
```

---

## 5. Conceptual Check Questions

1. **What happens if you call Handler() constructor without passing a Looper object?**
   *Answer:* In older Android versions, it defaults to the Looper of the calling thread, throwing a runtime exception if the thread lacks a Looper. To prevent bugs, modern APIs deprecate the default constructor and require passing an explicit Looper (e.g. `Looper.getMainLooper()`).

2. **How does Looper.prepare() help create background worker loops?**
   *Answer:* Standard worker threads do not have message loops. Calling `Looper.prepare()` allocates a MessageQueue and hooks a Looper instance to the background thread, allowing it to receive Handler messages.
""",
        "content": {
            "introduction": "Handlers, Loopers, and MessageQueues manage thread tasks sequentially, allowing worker threads to route work to the UI thread.",
            "whyImportant": "Scheduling delayed actions and communicating across thread boundaries requires using Handlers.",
            "realWorldApps": ["Scheduling auto-scroll banner slide transitions.", "Routing finished network results to main UI threads."],
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
        "slug": "android-thread-async-task",
        "title": "AsyncTask & Deprecation",
        "tagline": "Analyze legacy background thread pipelines and study memory leak deprecation risks.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-thread-basics"],
        "related": ["android-thread-executors"],
        "practiceProblems": [],
        "markdown": """# AsyncTask & Deprecation

In the early days of Android development, the standard tool for executing background work and returning results to the UI thread was **AsyncTask**. While designed to simplify thread synchronization, it introduced significant memory leak risks and configuration bugs. As a result, Android officially deprecated AsyncTask in API level 30. This chapter covers the AsyncTask lifecycle and why it was deprecated.

---

## 1. AsyncTask Lifecycle Callbacks

AsyncTask divided operations into four callback steps across threads:

1. **`onPreExecute():`** Runs on the UI Thread. Sets up tasks (like showing a progress bar).
2. **`doInBackground(Params...):`** Runs on a Background Thread. Performs long-running work (e.g., downloading data).
3. **`onProgressUpdate(Progress...):`** Runs on the UI Thread. Updates progress bars dynamically.
4. **`onPostExecute(Result):`** Runs on the UI Thread. Delivers the result to update view properties.

---

## 2. Thread Dispatching Pipeline

### Cross-Thread Task Dispatching
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">AsyncTask Lifecycle Thread-Hopping</text>

  {/* UI Thread Column */}
  <g transform="translate(60, 60)">
    <rect width="180" height="140" fill="#1e293b" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="90" y="20" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle">UI Thread</text>
    
    <rect x="15" y="35" width="150" height="20" fill="#111" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onPreExecute()</text>

    <rect x="15" y="105" width="150" height="20" fill="#111" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="90" y="117" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">onPostExecute(Result)</text>
  </g>

  {/* Background Column */}
  <g transform="translate(360, 60)">
    <rect width="180" height="140" fill="#1c1917" rx="2" stroke="#ef4444" stroke-width="1"/>
    <text x="90" y="20" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle">Background Thread</text>
    
    <rect x="15" y="65" width="150" height="30" fill="#111" rx="2" stroke="#b91c1c" stroke-width="1"/>
    <text x="90" y="83" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">doInBackground()</text>
  </g>

  {/* Transitions */}
  <path d="M 215,105 L 375,130" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 1" marker-end="url(#as-arrow)"/>
  <path d="M 375,150 L 215,175" stroke="#10b981" stroke-width="1.5" marker-end="url(#as-arrow)"/>

  <defs>
    <marker id="as-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Why AsyncTask Was Deprecated

AsyncTask is deprecated due to structural flaws:
* **Memory Leaks:** AsyncTasks declared as inner classes of an Activity hold an implicit reference to that Activity. If the activity rotates or is destroyed while `doInBackground()` is running, the Garbage Collector cannot reclaim it, causing a memory leak.
* **Context Crashes:** If `doInBackground()` finishes after the host activity is destroyed, `onPostExecute()` will attempt to update view components that no longer exist, crashing the application.
* **Execution Queuing:** By default, all AsyncTasks in an app run sequentially on a single background thread. A slow task can block other AsyncTasks from executing.

---

## 4. Legacy AsyncTask Code Example

Below is a legacy AsyncTask declaration:

```kotlin
import android.os.AsyncTask
import android.widget.TextView

// Params: String, Progress: Void, Result: String
class LegacyDownloadTask(
    // Keeping a direct reference to TextView causes memory leaks!
    private val textView: TextView
) : AsyncTask<String, Void, String>() {

    override fun onPreExecute() {
        textView.text = "Loading..."
    }

    override fun doInBackground(vararg params: String?): String {
        val url = params[0] ?: return ""
        // Simulated network download
        Thread.sleep(2000)
        return "Content downloaded from $url"
    }

    override fun onPostExecute(result: String) {
        // Throws NullPointerException if TextView's host Activity was destroyed!
        textView.text = result
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does declaring AsyncTask as a static class help reduce memory leaks?**
   *Answer:* Static inner classes do not hold an implicit reference to their outer Activity. To update UI views safely, you must pass references using `WeakReference` containers, allowing the activity to be garbage collected on rotation.

2. **What modern alternatives replace AsyncTask?**
   *Answer:* For simple asynchronous actions, Android uses Kotlin Coroutines. For persistent, deferrable background tasks, WorkManager is the recommended solution.
""",
        "content": {
            "introduction": "AsyncTask managed background threads and UI callbacks before its deprecation due to memory leaks and activity crash risks.",
            "whyImportant": "Refactoring old codebases requires understanding legacy AsyncTask patterns and migration strategies.",
            "realWorldApps": ["Refactoring legacy database sync queries to coroutines.", "Removing memory leak issues from old UI adapters."],
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
        "slug": "android-thread-executors",
        "title": "Java ThreadPool Executors",
        "tagline": "Configure ThreadPoolExecutors, queue worker tasks, and allocate execution limits.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-thread-basics"],
        "related": ["android-thread-rxjava"],
        "practiceProblems": [],
        "markdown": """# Java ThreadPool Executors

Spawning new threads for every task (e.g. `Thread { ... }.start()`) is expensive. Creating threads consumes CPU cycles, and running too many threads simultaneously leads to thread starvation. To manage threads efficiently, Android uses Java's **Executor Framework** and **ThreadPoolExecutors**. This chapter covers thread pooling, execution queues, and pool configurations.

---

## 1. Thread Pool Mechanics

A **ThreadPoolExecutor** manages a pool of worker threads and a task queue:
* **Task Submission:** Instead of starting a thread directly, you submit a `Runnable` task to the executor.
* **Task Queuing:** If all threads in the pool are busy, the executor buffers the task inside a thread-safe Queue (e.g. `LinkedBlockingQueue`) until a thread becomes available.
* **Thread Reuse:** When a thread finishes its task, it queries the queue for the next task instead of terminating, avoiding thread instantiation overhead.

---

## 2. Executor Pool Queue Model

### Submission Queue Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">ThreadPool Queue System</text>

  {/* Tasks Submit */}
  <g transform="translate(40, 75)">
    <rect width="100" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="50" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Submissions</text>
    <text x="50" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Runnable Tasks</text>
  </g>

  {/* Queue */}
  <g transform="translate(200, 75)">
    <rect width="180" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">LinkedBlockingQueue</text>
    
    <rect x="15" y="45" width="40" height="25" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="35" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Task 3</text>

    <rect x="70" y="45" width="40" height="25" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="90" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Task 2</text>

    <rect x="125" y="45" width="40" height="25" fill="#1e1b4b" rx="2" stroke="#a855f7" stroke-width="1"/>
    <text x="145" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Task 1</text>
  </g>

  {/* Thread Pool */}
  <g transform="translate(440, 60)">
    <rect width="120" height="120" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Thread Pool</text>
    
    <circle cx="60" cy="55" r="12" fill="#1e293b" stroke="#fff" stroke-width="1"/>
    <text x="60" y="58" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">T1</text>

    <circle cx="60" cy="95" r="12" fill="#1e293b" stroke="#fff" stroke-width="1"/>
    <text x="60" y="98" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">T2</text>
  </g>

  {/* Connections */}
  <path d="M 140,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ex-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#ex-arrow)"/>

  <defs>
    <marker id="ex-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Executor Configurations

The `Executors` factory class creates pre-configured thread pools:
* **`newFixedThreadPool(n):`** Keeps a fixed number of active threads (e.g. 4). Ideal for resource-constrained tasks.
* **`newCachedThreadPool():`** Creates new threads as needed, reusing idle threads when available. Shuts down idle threads after 60 seconds.
* **`newSingleThreadExecutor():`** Employs exactly one thread, ensuring all submitted tasks execute sequentially in order of submission.

---

## 4. Kotlin Executor Implementation

Below is a Kotlin program demonstrating how to configure and execute tasks using a fixed thread pool:

```kotlin
import java.util.concurrent.Executors
import java.util.concurrent.ThreadPoolExecutor

class NetworkExecutorManager {

    // 1. Initialize thread pool matching CPU core count
    private val coresCount = Runtime.getRuntime().availableProcessors()
    private val threadPool = Executors.newFixedThreadPool(coresCount) as ThreadPoolExecutor

    fun runParallelDownloads(urls: List<String>) {
        for (url in urls) {
            // 2. Submit task into the thread pool queue
            threadPool.execute {
                downloadFile(url)
            }
        }
    }

    private fun downloadFile(url: String) {
        println("Downloading $url on thread: ${Thread.currentThread().name}")
        Thread.sleep(1500) // Block thread safely (worker scope)
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does ThreadPoolExecutor handle tasks when the queue exceeds capacity?**
   *Answer:* It triggers its `RejectedExecutionHandler`. Depending on configuration, it will either throw a `RejectedExecutionException`, drop the task, or execute the task on the caller thread.

2. **Why is newCachedThreadPool risky for memory-heavy operations?**
   *Answer:* A cached thread pool allows an unlimited number of threads to run simultaneously. If you submit thousands of long-running tasks, it can spawn thousands of threads, consuming all available system memory and triggering an OutOfMemoryError (OOM) crash.
""",
        "content": {
            "introduction": "ThreadPoolExecutors manage reusable thread pools and task queues, preventing thread creation overhead.",
            "whyImportant": "Preventing thread starvation and managing parallel execution limits requires using Executors.",
            "realWorldApps": ["Managing concurrent image download queues inside layouts.", "Scheduling thread-safe database logs operations using single-thread executors."],
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
        "slug": "android-thread-rxjava",
        "title": "RxJava Thread Switching",
        "tagline": "Configure reactive streams, coordinate subscribeOn vs observeOn, and schedule streams.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-thread-basics"],
        "related": ["android-thread-executors"],
        "practiceProblems": [],
        "markdown": """# RxJava Thread Switching

In large applications, managing complex async operations (like chaining three API calls sequentially) using standard threads or callbacks quickly leads to "callback hell." To model async tasks as observable data streams, Android developers use **RxJava**. A key feature of RxJava is its simple thread-switching API. This chapter covers Observables, Schedulers, and thread switching.

---

## 1. Reactive Streams: Observables and Observers

RxJava operates on a publisher-subscriber model:
* **Observable:** Emits a stream of data elements (e.g. network response events).
* **Observer:** Listens to the Observable and processes events (onNext, onError, onComplete).
* **Schedulers:** Define the execution threads for your streams (e.g. `Schedulers.io()` for disk/network work, `AndroidSchedulers.mainThread()` for UI updates).

---

## 2. subscribeOn vs. observeOn

* **`subscribeOn:`** Sets the thread where the *upstream data source* executes (e.g., performing a network request on an IO thread). It only takes effect once per stream.
* **`observeOn:`** Sets the thread where all *downstream operators* and the final subscriber consume events. You can call `observeOn` multiple times to switch threads mid-stream.

### Thread Hopping Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">RxJava Thread Hopping Flow</text>

  {/* Network Fetch */}
  <g transform="translate(40, 65)">
    <rect width="130" height="110" rx="2" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="65" y="25" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">subscribeOn(io)</text>
    <text x="10" y="55" fill="#fff" font-size="7" font-family="monospace">Upstream Network</text>
    <text x="10" y="75" fill="#fff" font-size="7" font-family="monospace">Thread: RxCachedThread</text>
  </g>

  {/* Map operator */}
  <g transform="translate(235, 65)">
    <rect width="130" height="110" rx="2" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="65" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">observeOn(main)</text>
    <text x="10" y="55" fill="#fff" font-size="7" font-family="monospace">Parses Data packet</text>
    <text x="10" y="75" fill="#fff" font-size="7" font-family="monospace">Thread: Main Thread</text>
  </g>

  {/* Observer */}
  <g transform="translate(430, 65)">
    <rect width="130" height="110" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Observer</text>
    <text x="10" y="55" fill="#fff" font-size="7" font-family="monospace">Updates TextView</text>
    <text x="10" y="75" fill="#fff" font-size="7" font-family="monospace">Thread: Main Thread</text>
  </g>

  {/* Paths */}
  <path d="M 170,120 L 235,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#rx-arrow)"/>
  <path d="M 375,120 L 430,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#rx-arrow)"/>

  <defs>
    <marker id="rx-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Threading Method | subscribeOn Scope | observeOn Scope | Thread Swapping Limits |
| :--- | :--- | :--- | :--- |
| **`subscribeOn(Scheduler)`** | Upstream source | Upstream until overridden by observeOn | Only first declaration affects source |
| **`observeOn(Scheduler)`** | None | All downstream operations | Can be called multiple times |

---

## 4. RxJava Integration Example

Below is a Kotlin program demonstrating how to fetch data on a background thread and switch to the main thread to display results:

```kotlin
import io.reactivex.rxjava3.android.schedulers.AndroidSchedulers
import io.reactivex.rxjava3.core.Observable
import io.reactivex.rxjava3.schedulers.Schedulers

class RxDataManager {

    fun loadUserData(userId: String) {
        // 1. Create Observable upstream source
        Observable.fromCallable {
            executeSlowNetworkQuery(userId)
        }
        // 2. Run upstream query on IO thread pool
        .subscribeOn(Schedulers.io())
        // 3. Switch threads so downstream operates on Main Thread
        .observeOn(AndroidSchedulers.mainThread())
        // 4. Subscribe to print results or update UI views
        .subscribe(
            { result -> updateUI(result) },
            { error -> printError(error) }
        )
    }

    private fun executeSlowNetworkQuery(id: String): String = "UserDataFromNetwork($id)"
    private fun updateUI(data: String) {}
    private fun printError(e: Throwable) {}
}
```

---

## 5. Conceptual Check Questions

1. **What happens if you omit subscribeOn() but declare observeOn(AndroidSchedulers.mainThread())?**
   *Answer:* The upstream query runs on the thread that called `subscribe()`. If called from the UI thread, the network query executes on the main thread, throwing a `NetworkOnMainThreadException` crash.

2. **Can you declare multiple subscribeOn() operators in a single stream?**
   *Answer:* You can write them, but only the first `subscribeOn()` declaration closest to the source determines the upstream execution thread. Subsequence `subscribeOn()` calls are ignored.
""",
        "content": {
            "introduction": "RxJava streams reactive datasets, using subscribeOn and observeOn schedulers to coordinate threads.",
            "whyImportant": "Chaining multiple async calls and processing streams across threads requires using RxJava.",
            "realWorldApps": ["Combining user data and purchase history from separate APIs in parallel.", "Debouncing typing inputs inside searches before firing queries."],
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
        "slug": "android-coroutines-scopes",
        "title": "Coroutine Scopes & Structured Concurrency",
        "tagline": "Configure CoroutineScopes, utilize viewModelScope helpers, and cancel active jobs.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-coroutines"],
        "related": ["android-coroutines-dispatchers"],
        "practiceProblems": [],
        "markdown": """# Coroutine Scopes & Structured Concurrency

Asynchronous operations must be bound to application lifecycles. Running a coroutine that downloads a large file after the user exits the screen can leak memory. To prevent these leaks, Kotlin uses **Structured Concurrency** managed by **CoroutineScopes**. This chapter covers scopes, structured cancellation propagation, and lifecycle-aware scopes (like `viewModelScope`).

---

## 1. Structured Concurrency and Scopes

**Structured Concurrency** ensures that:
* Every coroutine runs inside a defined **CoroutineScope** that tracks its lifetime.
* Cancelling a scope immediately cancels all child coroutines launched inside it.
* A parent coroutine blocks and waits for all its children to complete before finishing itself.

---

## 2. Cancellation Propagation Hierarchy

When a parent scope is cancelled, the cancellation signal propagates down the execution tree:

### Scope Cancellation Tree
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">Structured Concurrency Cancellation</text>

  {/* Parent Scope */}
  <g transform="translate(225, 45)">
    <rect width="150" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="75" y="22" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Parent: Cancelled</text>
    <text x="75" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Scope.cancel()</text>
  </g>

  {/* Child 1 */}
  <g transform="translate(60, 140)">
    <rect width="180" height="60" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1"/>
    <text x="90" y="25" fill="#fca5a5" font-size="8" font-family="monospace" text-anchor="middle">Child Job 1 (Cancelled)</text>
    <text x="90" y="42" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Download task terminated</text>
  </g>

  {/* Child 2 */}
  <g transform="translate(360, 140)">
    <rect width="180" height="60" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1"/>
    <text x="90" y="25" fill="#fca5a5" font-size="8" font-family="monospace" text-anchor="middle">Child Job 2 (Cancelled)</text>
    <text x="90" y="42" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Cache task terminated</text>
  </g>

  {/* Paths */}
  <path d="M 300,95 L 150,140" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 1" marker-end="url(#sc-arrow)"/>
  <path d="M 300,95 L 450,140" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 1" marker-end="url(#sc-arrow)"/>

  <defs>
    <marker id="sc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Lifecycle-Aware Android Scopes

To avoid managing cancel actions manually inside UI activities, Android provides preconfigured lifecycle-aware scopes:
* **`viewModelScope`:** Bound to the lifecycle of the ViewModel. If the ViewModel is cleared (e.g. when exiting the screen), it automatically cancels all active coroutines.
* **`lifecycleScope`:** Bound to the lifecycle of an Activity or Fragment. Coroutines cancel automatically when the host View reaches the `DESTROYED` state.

---

## 4. ViewModelScope Implementation

Below is a Kotlin program showing how `viewModelScope` automatically manages background tasks:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class UserProfileViewModel : ViewModel() {

    fun loadPremiumFeatures() {
        // Launches coroutine inside the ViewModel scope
        viewModelScope.launch {
            // Asynchronous suspend operation
            fetchPremiumAccess()
            updateProfileState()
        }
        // No manual cancel needed! If the ViewModel is cleared,
        // viewModelScope cancels this coroutine automatically.
    }

    private suspend fun fetchPremiumAccess() {
        delay(3000)
    }
    private fun updateProfileState() {}
}
```

---

## 5. Conceptual Check Questions

1. **What happens to child coroutines if a parent scope throws an unhandled exception?**
   *Answer:* By default, unless configured with a `SupervisorJob`, an unhandled exception in a child coroutine cancels the parent scope, which propagates the cancellation signal to cancel all other sibling coroutines.

2. **When should you select SupervisorJob instead of Job inside a CoroutineScope?**
   *Answer:* Use `SupervisorJob` when sibling coroutines are independent. If one child fails (e.g., a single API request crashes), a `SupervisorJob` prevents the failure from canceling the parent scope, allowing other child tasks to continue.
""",
        "content": {
            "introduction": "Coroutine Scopes manage the execution lifetimes of coroutines, cancel tasks structured down hierarchies, and prevent memory leaks.",
            "whyImportant": "Preventing background leaks when activities are destroyed requires binding coroutines to lifecycle-aware scopes.",
            "realWorldApps": ["Running background api queries that cancel when viewmodels clear.", "Binding location listeners to activity lifecycle scopes."],
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
        "slug": "android-coroutines-dispatchers",
        "title": "Coroutine Dispatchers & switching",
        "tagline": "Configure execution contexts, delegate to Main/IO threads, and switch contexts using withContext.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-coroutines"],
        "related": ["android-coroutines-scopes"],
        "practiceProblems": [],
        "markdown": """# Coroutine Dispatchers & switching

To coordinate which threads execute a coroutine, Kotlin uses **CoroutineDispatchers**. A Dispatcher allocates tasks to thread pools optimized for specific workloads (like UI drawing, disk read/write, or calculations). This chapter covers Main, IO, and Default dispatchers, and how to switch thread contexts using `withContext`.

---

## 1. Standard Coroutine Dispatchers

Kotlin provides four standard dispatchers:

* **`Dispatchers.Main`:** Executes tasks on the Android Main Thread. Used for UI updates, layout changes, and simple event interactions.
* **`Dispatchers.IO`:** Optimized for disk or network I/O operations (e.g., querying databases, calling APIs, reading files). It shares threads across a large pool.
* **`Dispatchers.Default`:** Optimized for CPU-intensive tasks (e.g. parsing massive JSON structures, sorting large datasets, processing images).
* **`Dispatchers.Unconfined`:** Runs the coroutine on the caller thread until its first suspension point.

---

## 2. Dispatcher Schedulers Routing

### Task Allocation Logic
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Dispatcher Allocation Map</text>

  {/* Dispatchers.Main */}
  <g transform="translate(40, 60)">
    <rect width="150" height="130" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="22" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Dispatchers.Main</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">UI Thread Only</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Layout renders</text>
  </g>

  {/* Dispatchers.IO */}
  <g transform="translate(225, 60)">
    <rect width="150" height="130" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="75" y="22" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Dispatchers.IO</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Large Thread Pool</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Network / DB</text>
  </g>

  {/* Dispatchers.Default */}
  <g transform="translate(410, 60)">
    <rect width="150" height="130" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="22" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Dispatchers.Default</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">CPU Core Pool</text>
    <text x="75" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Math / Sorting</text>
  </g>
</svg>

---

## 3. Context Switching with withContext

Instead of nesting callbacks or switching entire streams, you switch contexts mid-execution using **`withContext`**:
* **Suspended Hop:** `withContext` is a suspend function. It pauses the coroutine, switches to the target dispatcher's thread pool, runs the code block, and returns the result back to the original thread.

---

## 4. Kotlin Dispatchers Code Example

Below is a Kotlin program showing how to fetch and parse data, switching threads using `withContext`:

```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ItemRepository {

    suspend fun getItems(): List<String> {
        // 1. Run network call on IO Dispatcher thread
        val rawJson = withContext(Dispatchers.IO) {
            downloadRawJson()
        }

        // 2. Parse heavy JSON on CPU-optimized Default Dispatcher
        val parsedList = withContext(Dispatchers.Default) {
            parseJsonArray(rawJson)
        }

        return parsedList
    }

    private fun downloadRawJson(): String = "['apple','banana']"
    private fun parseJsonArray(json: String): List<String> = listOf("apple", "banana")
}
```

---

## 5. Conceptual Check Questions

1. **How does Dispatchers.Default optimize core usage?**
   *Answer:* It bounds the maximum number of threads in its pool to match the physical CPU core count of the device, preventing CPU scheduling bottlenecks on mathematical or intensive parsing operations.

2. **Why is it safe to call withContext(Dispatchers.IO) from the Main Thread?**
   *Answer:* `withContext` is a suspend function. The main thread is not blocked during its execution. Instead, the calling coroutine suspends, freeing the main thread to render the UI, and resumes once the IO thread returns the result.
""",
        "content": {
            "introduction": "Dispatchers determine which thread pools execute coroutines, using withContext to switch contexts dynamically.",
            "whyImportant": "Avoiding NetworkOnMainThread exceptions while preserving smooth UI animations requires using dispatchers.",
            "realWorldApps": ["Running image filter operations inside Dispatchers.Default.", "Downloading data packets using Dispatchers.IO and rendering them on Dispatchers.Main."],
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
