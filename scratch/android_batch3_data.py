# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 3 articles

ANDROID_BATCH3_ARTICLES = [
    {
        "slug": "compose-box",
        "title": "Jetpack Compose Box",
        "tagline": "Configure layered container stacks using alignments, Z-index overlays, and match-parent modifiers.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-column-row"],
        "related": ["compose-scaffold", "compose-constraint-layout"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Box

In Jetpack Compose, the **Box** layout is a container component used to stack elements directly on top of each other, similar to `FrameLayout` in legacy XML layouts. Box is essential for building overlays, background frames, and custom alignment patterns. This chapter explains child alignment parameters, Z-index controls, and sizing behaviors.

---

## 1. Stacking and Child Alignments

By default, all children added to a `Box` are placed in the top-left corner, overlapping each other in order of their declaration. You position children using two methods:

* **Container Alignment:** Set the default alignment for all children via the `contentAlignment` parameter (e.g., `Alignment.Center`).
* **Modifier Alignment:** Override the container alignment for a specific child using `Modifier.align()` (e.g., `Modifier.align(Alignment.BottomEnd)`).

---

## 2. Layer Stacking Model

Below is a model demonstrating three layered children stacked inside a Box using different alignments:

### Layer Stacking Visualization
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Box Child Layering</text>

  {/* Box Container */}
  <g transform="translate(180, 50)">
    <rect width="240" height="150" fill="#1e293b" rx="4" stroke="#475569" stroke-width="2"/>
    <text x="120" y="140" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">Box Container</text>
    
    {/* Child 1: Bottom (Background) */}
    <rect x="10" y="10" width="220" height="110" fill="#111" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="25" y="25" fill="#3b82f6" font-size="6" font-family="monospace">Background (Bottom)</text>

    {/* Child 2: Center */}
    <rect x="70" y="35" width="100" height="60" fill="#312e81" rx="2" stroke="#a855f7" stroke-width="1.5"/>
    <text x="120" y="70" fill="#c084fc" font-size="7" font-family="monospace" text-anchor="middle">Center Element</text>

    {/* Child 3: Top Right */}
    <circle cx="210" cy="30" r="15" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="210" y="33" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Top</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Column / Row | Box |
| :--- | :--- | :--- |
| **Orientation** | Linear (Vertical or Horizontal) | Overlapping Stack (Z-axis) |
| **Sibling Positioning**| Siblings are placed adjacent to each other | Siblings overlap directly by default |
| **Sizing Bounds** | Bounded along the main axis | Matches maximum child bounds or fill size |
| **Typical Use Case** | Linear forms and lists | Image overlays, badging, floating indicators |

---

## 4. Kotlin Compose Box Example

Below is a Composable function rendering a user profile avatar with an active status badge overlay using a Box:

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun AvatarWithStatus(avatarUrl: String) {
    // Box container stacks the badge on top of the avatar
    Box(
        modifier = Modifier.size(80.dp),
        contentAlignment = Alignment.Center
    ) {
        // 1. Base Avatar Image (Simulated as background box)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Gray, shape = CircleShape)
        )

        // 2. Status Indicator Badge (Aligned bottom-end)
        Box(
            modifier = Modifier
                .size(16.dp)
                .background(Color.Green, shape = CircleShape)
                .align(Alignment.BottomEnd)
        )
    }
}
```

---

## 5. Conceptual Check Questions

1. **How do you force a child of a Box to match the exact size of the Box parent wrapper?**
   *Answer:* You apply the `Modifier.matchParentSize()` modifier. Unlike `Modifier.fillMaxSize()`, which expands to fill the parent's constraints directly, `matchParentSize()` forces the child to match the exact width and height of the Box *after* all other children have been measured, preventing sizing recursion loops.

2. **Can you modify the stacking order (Z-index) of children inside a Box?**
   *Answer:* Yes. By default, children stack in declaration order (last declared is on top). You can override this behavior by applying `Modifier.zIndex(value: Float)` to a child, forcing it to render on top of items with lower z-index values.
""",
        "content": {
            "introduction": "The Jetpack Compose Box container stacks children on top of each other, using alignment parameters and z-indexes to layout overlays.",
            "whyImportant": "Creating complex UI layouts like image overlays or notifications badges requires using Box containers.",
            "realWorldApps": ["Placing a progress indicator overlay on top of active loading content.", "Adding notification badges to the corner of app icons."],
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
        "slug": "compose-scaffold",
        "title": "Jetpack Compose Scaffold",
        "tagline": "Coordinate layout layouts with top action bars, bottom navigation, and floating action buttons.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-box"],
        "related": ["compose-tabrow", "compose-bottomsheet"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Scaffold

A **Scaffold** is a layout container that implements the standard visual structure of Material Design screens. It coordinates various screen elements, including the **TopBar** (header), **BottomBar** (navigation), **SnackbarHost** (notifications), and **FloatingActionButton (FAB)**, ensuring they slide and arrange without overlapping. This chapter covers the Scaffold parameters and inner padding bindings.

---

## 1. Scaffold Slot Architecture

Scaffold uses **slot APIs** (Composable lambda parameters) to define different sections of the screen:

* **`topBar`:** Slot for headers (typically `TopAppBar`).
* **`bottomBar`:** Slot for navigation bars (typically `NavigationBar`).
* **`floatingActionButton`:** Slot for floating action buttons.
* **`snackbarHost`:** Coordinates and displays temporary alert banners (Snackbars).
* **`content`:** The primary Composable lambda for the screen contents. It receives a `PaddingValues` parameter representing the boundaries of the headers and footers.

---

## 2. Layout Architecture Grid

### Scaffold Slot Mapping
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Scaffold Screen Layout Structure</text>

  {/* Screen Boundary */}
  <g transform="translate(180, 50)">
    <rect width="240" height="150" fill="#111" rx="4" stroke="#475569" stroke-width="2"/>
    
    {/* TopBar */}
    <rect x="2" y="2" width="236" height="25" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="120" y="17" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle">topBar</text>

    {/* Content */}
    <rect x="2" y="29" width="236" height="92" fill="#1e1b4b" stroke="#a855f7" stroke-width="1"/>
    <text x="120" y="75" fill="#c084fc" font-size="9" font-family="monospace" text-anchor="middle">content (Inner Padding)</text>

    {/* BottomBar */}
    <rect x="2" y="123" width="236" height="25" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
    <text x="120" y="138" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">bottomBar</text>

    {/* FAB */}
    <circle cx="210" cy="110" r="12" fill="#f59e0b" stroke="#fff" stroke-width="1"/>
    <text x="210" y="113" fill="#000" font-size="8" font-family="monospace" text-anchor="middle">+</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Layout | Purpose | Customization | Sizing Constraint |
| :--- | :--- | :--- | :--- |
| **`Box`** | Simple layering | Freeform alignment | Unconstrained stack |
| **`Scaffold`** | Material Design screen layout | Predefined slots (topBar, bottomBar)| Automatically calculates margins |
| **`Column`** | Linear vertical flow | Free spacing, arrangements | Stacks components |

---

## 4. Kotlin Compose Scaffold Example

Below is a Composable function declaring a Scaffold layout with a TopBar and a Floating Action Button:

```kotlin
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Application") }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Action */ }) {
                Text("+")
            }
        }
    ) { innerPadding ->
        // content slot must apply innerPadding to avoid overlapping headers
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Text("Main Screen Contents")
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it critical to apply the innerPadding values to the root Composable inside the content slot?**
   *Answer:* If the content Composable does not apply `innerPadding` (e.g. using `Modifier.padding(innerPadding)`), the content will start at the very top edge of the screen, causing the TopBar header and BottomBar footer to cover portions of your content.

2. **How does Scaffold handle SnackBar message displays?**
   *Answer:* It uses a `SnackbarHostState` bound to the `snackbarHost` parameter. When a coroutine calls `showSnackbar()`, the host animates the banner into view, automatically adjusting placement above the FAB.
""",
        "content": {
            "introduction": "Scaffold implements standard Material Design screens, offering slots for headers, footers, and floating action buttons.",
            "whyImportant": "Standardizing page structures and managing content boundaries requires using Scaffold containers.",
            "realWorldApps": ["Designing primary app screens with persistent bottom navigation bars.", "Displaying temporary action logs using snackbar messaging hosts."],
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
        "slug": "compose-constraint-layout",
        "title": "ConstraintLayout in Compose",
        "tagline": "Configure constraint networks, create anchors, and define guidelines to build responsive screens.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-box"],
        "related": ["compose-column-row"],
        "practiceProblems": [],
        "markdown": """# ConstraintLayout in Compose

While `Column`, `Row`, and `Box` are excellent for nesting layouts, deeply nested structures slow down UI measurement passes. To build complex, responsive screens with a flat hierarchy, Compose offers **ConstraintLayout**. It allows you to align Composables relative to each other using constraint constraints. This chapter covers reference creation, anchoring links, and guidelines.

---

## 1. Constraint references and Anchors

Inside a Compose ConstraintLayout:
* **References:** Created using `createRefs()` or `createRefFor()`. They act as IDs representing individual child Composables.
* **Anchors:** Properties on child components (top, bottom, start, end, baseline) that can be linked to other anchors using `linkTo()`.
* **Parent:** Represents the ConstraintLayout container itself, used to anchor children to screen edges.

---

## 2. Constraint Anchoring Graph

Below is a layout graph showing Composable B anchored below Composable A and aligned horizontally to the parent:

### Constraint Anchors Model
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Constraint Anchoring Map</text>

  {/* Parent Frame */}
  <g transform="translate(150, 45)">
    <rect width="300" height="160" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    
    {/* Composable A */}
    <rect x="90" y="15" width="120" height="35" rx="2" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="150" y="37" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Element A (Ref)</text>

    {/* Composable B */}
    <rect x="90" y="90" width="120" height="35" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="150" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Element B (Ref)</text>

    {/* Anchors */}
    <circle cx="150" cy="50" r="4" fill="#ef4444"/>
    <circle cx="150" cy="90" r="4" fill="#ef4444"/>

    {/* Link line */}
    <path d="M 150,54 L 150,86" stroke="#ef4444" stroke-width="1.5" marker-end="url(#cl-arrow)"/>
    <text x="185" y="73" fill="#ef4444" font-size="6" font-family="monospace">linkTo(A.bottom)</text>
  </g>

  <defs>
    <marker id="cl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Layout Strategy | Flatness | Performance | Syntax Complexity |
| :--- | :--- | :--- | :--- |
| **Nested Column / Row** | Deeply nested (complex screens) | Slower (multiple layout passes) | Simple and readable |
| **ConstraintLayout** | Flat (one level hierarchy) | Faster for complex layouts | More verbose (requires constraint sets) |

---

## 4. Kotlin Compose ConstraintLayout Example

Below is a Composable function rendering two text fields configured using ConstraintLayout:

```kotlin
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.constraintlayout.compose.ConstraintLayout

@Composable
fun SimpleConstraintLayout() {
    ConstraintLayout(modifier = Modifier.fillMaxSize()) {
        // Create references for Composables
        val (titleRef, subtitleRef) = createRefs()

        Text(
            text = "Welcome Screen",
            modifier = Modifier.constrainAs(titleRef) {
                // Link top of title to top of parent
                top.linkTo(parent.top, margin = 20.dp)
                // Center horizontally in parent
                start.linkTo(parent.start)
                end.linkTo(parent.end)
            }
        )

        Text(
            text = "Enter details below",
            modifier = Modifier.constrainAs(subtitleRef) {
                // Link top of subtitle to bottom of title
                top.linkTo(titleRef.bottom, margin = 8.dp)
                // Align left edges
                start.linkTo(titleRef.start)
            }
        )
    }
}
```

---

## 5. Conceptual Check Questions

1. **How do Guidelines help build responsive ConstraintLayout views in Compose?**
   *Answer:* Guidelines are invisible helper lines positioned at a fixed offset (dp) or percentage (fraction) relative to parent edges. Linking components to a guideline (e.g. at 50% screen width) makes the layout scale proportionally across different screen sizes.

2. **What does the createRefs() method return in ConstraintLayout?**
   *Answer:* It returns a destructuring-compatible list of unique Composable reference references, which are assigned to variables to define constraint anchors.
""",
        "content": {
            "introduction": "ConstraintLayout structures interfaces using relative positioning constraints, maintaining flat layout hierarchies to optimize rendering performance.",
            "whyImportant": "Designing complex UI screens with responsive positioning requirements requires using ConstraintLayout.",
            "realWorldApps": ["Designing responsive form screens that scale across phone and tablet sizes.", "Flat-nesting profile headers to avoid layout measurement lags."],
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
        "slug": "compose-text",
        "title": "Text Styling and Spans",
        "tagline": "Configure fonts, overflow properties, and rich inline styles using AnnotatedString.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-textfield"],
        "practiceProblems": [],
        "markdown": """# Text Styling and Spans

Displaying text is fundamental to any mobile application. In Jetpack Compose, the primary text display component is **Text**. It exposes parameters to modify sizing, typography, colors, and overflow rules. For rich text formatting (like styling individual characters within a single string), Compose uses **AnnotatedString**. This chapter explains Text parameters and span styling.

---

## 1. Core Text Attributes

The `Text` Composable exposes several parameters to control styling:
* **`fontSize` & `fontWeight`:** Controls text size (typically in `sp`) and weight (e.g., `FontWeight.Bold`).
* **`overflow`:** Controls how the component behaves when text exceeds bounds (e.g., `TextOverflow.Ellipsis`).
* **`maxLines`:** Limits the text to a specified number of lines.

---

## 2. Rich Text formatting (AnnotatedString)

To display a single paragraph containing mixed styles (such as a clickable hyperlink or a bold word), you use `buildAnnotatedString`. It builds an **AnnotatedString**, appending text blocks alongside style spans:

### Inline Span Application
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">AnnotatedString Style Spans</text>

  {/* String Representation */}
  <g transform="translate(40, 70)">
    <rect width="520" height="110" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    
    {/* Base Text */}
    <text x="260" y="40" fill="#fff" font-size="13" font-family="sans-serif" text-anchor="middle">
      By clicking you accept our Terms and Privacy Policy.
    </text>

    {/* Span Overlay 1: Terms */}
    <rect x="250" y="55" width="60" height="30" fill="#1e3a8a" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="280" y="73" fill="#60a5fa" font-size="8" font-family="monospace" text-anchor="middle">Span 1: Bold</text>

    {/* Span Overlay 2: Privacy */}
    <rect x="360" y="55" width="85" height="30" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="402" y="73" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">Span 2: Color</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Text Parameter | AnnotatedString Span |
| :--- | :--- | :--- |
| **Scope** | Global (applies to entire Composable) | Local (applies to character indices range) |
| **Use Case** | Sizing headers and paragraph defaults | Styling inline links and bold keywords |
| **Syntax** | Basic arguments passed to `Text()` | Builder pattern (`withStyle` block) |

---

## 4. Rich Text Code Example

Below is a Composable function displaying a single text block with bold and colored words using `buildAnnotatedString`:

```kotlin
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

@Composable
fun PolicyAgreementText() {
    val annotatedString = buildAnnotatedString {
        append("By clicking you accept our ")
        
        // Push bold style for Terms
        withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = Color.Blue)) {
            append("Terms")
        }
        
        append(" and ")
        
        // Push colored style for Privacy Policy
        withStyle(style = SpanStyle(fontWeight = FontWeight.Bold, color = Color.Green)) {
            append("Privacy Policy")
        }
        
        append(".")
    }

    Text(text = annotatedString)
}
```

---

## 5. Conceptual Check Questions

1. **How do you truncate long text that exceeds a maximum line count?**
   *Answer:* You pass `maxLines = 1` and `overflow = TextOverflow.Ellipsis` to the `Text` Composable. The OS will automatically cut off any text that doesn't fit on the single line and append "..." at the end.

2. **Can you attach click actions to individual spans in an AnnotatedString?**
   *Answer:* Yes. Using the `ClickableText` Composable (or modern Modifier click bounds), you can query the character index clicked and match it against tag annotations attached to the string.
""",
        "content": {
            "introduction": "The Text Composable renders text strings, utilizing AnnotatedString variables to apply inline style spans.",
            "whyImportant": "Creating rich typographic layouts with inline hyperlinks requires using text annotation builders.",
            "realWorldApps": ["Displaying paragraphs containing bold term references.", "Rendering interactive agreement clauses with clickable hyperlinks."],
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
        "slug": "compose-button",
        "title": "Button Component & Click Events",
        "tagline": "Configure click responses, manage disabled states, and style button layout models.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-text"],
        "practiceProblems": [],
        "markdown": """# Button Component & Click Events

Buttons enable users to interact with your application. In Jetpack Compose, the **Button** component is a container Composable that handles click gestures and implements Material Design interaction states. This chapter covers button types, click handlers, and disabled state styling.

---

## 1. Button Types in Material 3

Material Design 3 defines several button styles for different visual hierarchies:

* **Filled Button (`Button`):** High emphasis button for primary actions (e.g. "Submit").
* **Elevated Button (`ElevatedButton`):** Filled button with drop shadows, adding depth.
* **Outlined Button (`OutlinedButton`):** Medium emphasis button with a border, useful for secondary actions.
* **Text Button (`TextButton`):** Low emphasis button with no background or border, used for utility actions (e.g. "Cancel").

---

## 2. Interaction State Transitions

A button tracks user inputs, transitioning through states that modify its background colors and elevations:

### Button State Workflow
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Button State Transitions</text>

  {/* States */}
  <g transform="translate(40, 80)">
    <rect width="110" height="60" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="55" y="35" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Idle State</text>
  </g>

  <g transform="translate(240, 80)">
    <rect width="110" height="60" rx="3" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="55" y="35" fill="#60a5fa" font-size="8" font-family="monospace" text-anchor="middle">Pressed State</text>
  </g>

  <g transform="translate(440, 80)">
    <rect width="110" height="60" rx="3" fill="#1c1917" stroke="#44403c" stroke-width="1.5"/>
    <text x="55" y="35" fill="#78716c" font-size="8" font-family="monospace" text-anchor="middle">Disabled State</text>
  </g>

  {/* Paths */}
  <path d="M 150,110 L 240,110" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#btn-arrow)"/>
  <path d="M 350,110 L 440,110" stroke="#78716c" stroke-width="1.5" stroke-dasharray="2 2" marker-end="url(#btn-arrow)"/>

  <defs>
    <marker id="btn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Button Type | Background | Border | Elevation Shadow | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`Button` (Filled)** | Solid color | None | None | Primary action (e.g. "Save") |
| **`ElevatedButton`** | Solid color | None | Yes | Primary action on structured cards |
| **`OutlinedButton`** | Transparent | Thin line | None | Secondary action (e.g. "Edit") |
| **`TextButton`** | Transparent | None | None | Tertiary action (e.g. "Learn more") |

---

## 4. Kotlin Compose Button Example

Below is a Composable function declaring a submit button that becomes disabled depending on validation states:

```kotlin
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SubmitActionPanel(isValid: Boolean, onSubmitClick: () -> Unit, onCancelClick: () -> Unit) {
    // Standard Filled Button
    Button(
        onClick = onSubmitClick,
        // Disable button if validation fails
        enabled = isValid,
        modifier = Modifier.padding(8.dp)
    ) {
        // Child lambda holds button layout (Text + Optional Icon)
        Text(text = "Submit Details")
    }

    // Outlined Secondary Button
    OutlinedButton(
        onClick = onCancelClick,
        modifier = Modifier.padding(8.dp)
    ) {
        Text(text = "Cancel")
    }
}
```

---

## 5. Conceptual Check Questions

1. **How does the enabled parameter affect button click events?**
   *Answer:* Setting `enabled = false` stops the button from responding to user touches, preventing the `onClick` lambda from executing. The system also automatically decreases the button's color saturation to indicate it is disabled.

2. **Can you customize the inner layout of a Button Composable?**
   *Answer:* Yes. The content parameter of a Button is a standard Composable Row scope. You can place icons, text, or multiple components inside the button brackets, and they will arrange horizontally.
""",
        "content": {
            "introduction": "Buttons process user clicks, implementing Material Design styles and interaction states to trigger functions.",
            "whyImportant": "Enabling user interactions requires configuring buttons with proper click handlers and state flags.",
            "realWorldApps": ["Disabling form submission buttons until inputs are validated.", "Creating icon-augmented buttons for login pages."],
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
        "slug": "compose-icon",
        "title": "Icon Component",
        "tagline": "Configure vector icons, apply tints, and set content descriptions for accessibility.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-button", "compose-image"],
        "practiceProblems": [],
        "markdown": """# Icon Component

Mobile interfaces use icons to represent actions and options visually. In Jetpack Compose, the **Icon** component is designed to render single-color vector assets (SVGs or XML vector graphics). This chapter covers vector rendering, accessibility content descriptions, and tints.

---

## 1. Vector Assets and Accessibility

Because icons do not display text, you must configure them correctly to remain accessible:
* **Vector Graphics:** Unlike raster images (PNGs), vector assets scale infinitely without blurring, preserving crisp lines on high-density displays.
* **Content Description:** A mandatory string parameter describing the icon's action (e.g. "Close dialog"). Screen readers (TalkBack) read this description aloud to visually impaired users. If the icon is purely decorative, set this parameter to `null`.

---

## 2. Rendering and Tinting

Icons are rendered using a single-color mask. When you apply a **Tint** (using the `tint` parameter), the color applies to all non-transparent pixels, allowing you to match icons to different app themes dynamically.

### Vector Coordinates Path Map
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Vector Drawing Paths</text>

  {/* Vector Grid */}
  <g transform="translate(180, 50)">
    <rect width="240" height="150" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="120" y="140" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Vector ViewBox (24x24)</text>

    {/* Star Icon Path */}
    <path d="M 120,20 L 145,70 L 200,70 L 155,105 L 175,155 L 120,120 L 65,155 L 85,105 L 40,70 L 95,70 Z" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Icon Component | Image Component |
| :--- | :--- | :--- |
| **Source Type** | Vector Assets (`ImageVector`, XML) | Raster (`Bitmap`) or Vector |
| **Color Model** | Single-color tint mask | Multi-color rendering |
| **Best For** | UI buttons, arrows, navigation items | Photos, illustrations, logos |
| **Default Size** | `24.dp` | Wraps source content size |

---

## 4. Kotlin Compose Icon Example

Below is a Composable function displaying a close button using a vector icon, with accessibility parameters:

```kotlin
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

@Composable
fun CloseActionButton(onCloseClick: () -> Unit) {
    IconButton(onClick = onCloseClick) {
        Icon(
            // Use Material 3 standard close vector icon
            imageVector = Icons.Default.Close,
            // Accessibility description for TalkBack screen reader
            contentDescription = "Close dialog screen",
            // Apply red tint color to mask icon pixels
            tint = Color.Red
        )
    }
}
```

---

## 5. Conceptual Check Questions

1. **What happens if you set contentDescription = null on an Icon?**
   *Answer:* Screen readers will skip the component entirely, avoiding redundant announcements for decorative assets (like background circles).

2. **Why do vector icons scale better than PNG files on mobile screens?**
   *Answer:* PNG files are made of static pixel grids; scaling them causes interpolation blur. Vector graphics store drawing commands (lines, curves), allowing the device to draw them sharp at any pixel density.
""",
        "content": {
            "introduction": "The Icon component renders single-color vector assets, using tint parameters and content descriptions to ensure accessibility.",
            "whyImportant": "Creating accessible, sharp user interface buttons requires using vector icons with text descriptions.",
            "realWorldApps": ["Designing action bar headers with search and settings icons.", "Creating back navigation buttons using vector arrow icons."],
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
        "slug": "compose-image",
        "title": "Image Component & Scaling",
        "tagline": "Render raster and vector graphics using ContentScale cropping models.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-icon"],
        "related": ["compose-card"],
        "practiceProblems": [],
        "markdown": """# Image Component & Scaling

While icons are single-color vectors, applications also require displaying full-color graphics, including photos, logos, and illustrations. In Jetpack Compose, this is managed by the **Image** component. This chapter covers image loading, content scaling modes (cropping/fitting), and formatting options.

---

## 1. Content Scaling Modes

When displaying an image inside a box, the image aspect ratio may not match the container aspect ratio. You resolve this using the `contentScale` parameter:

* **`ContentScale.Fit`:** Scales the image to fit inside the container while preserving its aspect ratio. Some areas of the container may remain empty.
* **`ContentScale.Crop`:** Scales the image to fill the container while preserving its aspect ratio. Outer portions of the image are cropped off.
* **`ContentScale.FillBounds`:** Stretches the image to fill the container. This ignores the aspect ratio, distorting the image.

---

## 2. ContentScale Comparison

### Fit vs. Crop vs. FillBounds
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">ContentScale Behaviors</text>

  {/* Fit */}
  <g transform="translate(40, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Scaled circle inside */}
    <circle cx="65" cy="60" r="40" fill="#3b82f6"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Fit (preserves ratio)</text>
  </g>

  {/* Crop */}
  <g transform="translate(235, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Large circle cropped */}
    <circle cx="65" cy="60" r="60" fill="#10b981"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Crop (fills and cuts)</text>
  </g>

  {/* FillBounds */}
  <g transform="translate(430, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    {/* Distorted circle (ellipse) */}
    <ellipse cx="65" cy="60" rx="60" ry="40" fill="#a855f7"/>
    <text x="65" y="112" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">FillBounds (distorts)</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Scaling Option | Preserves Aspect Ratio? | Fills Container? | Visual Distortion? |
| :--- | :--- | :--- | :--- |
| **`ContentScale.Fit`** | Yes | No (letterbox edges) | No |
| **`ContentScale.Crop`** | Yes | Yes | No (but clips content) |
| **`ContentScale.FillBounds`**| No | Yes | Yes (stretches image) |
| **`ContentScale.Inside`**| Yes | No (only scales down if larger) | No |

---

## 4. Kotlin Compose Image Example

Below is a Composable function rendering a header banner image cropped to fill the available width:

```kotlin
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Card
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.Image

@Composable
fun ProductBannerImage() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
    ) {
        Image(
            // Load raster drawable resource
            painter = painterResource(id = R.drawable.product_banner),
            contentDescription = "Promotional product banner image",
            // Crop image to fill card width
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth()
        )
    }
}
```

---

## 5. Conceptual Check Questions

1. **When should you use ContentScale.Crop instead of ContentScale.Fit?**
   *Answer:* Use `Crop` when rendering list item cards, profile avatars, or banner backgrounds where filling the container boundary is visually required and minor edge clipping is acceptable.

2. **Why is it recommended to use image loading libraries (like Coil or Glide) for network images instead of the native Image Composable?**
   *Answer:* Native `Image` components load local resource files synchronously. Loading remote image URLs requires asynchronous fetching, memory caching, request cancelations on scroll, and bitmap scaling, which Coil or Glide manage automatically to prevent main thread blocking.
""",
        "content": {
            "introduction": "The Image component displays local assets and photos, using content scale parameters to crop or fit graphic boundaries.",
            "whyImportant": "Avoiding visual distortions and optimizing memory usage when loading graphics requires configuring scaling modes.",
            "realWorldApps": ["Designing circular avatar graphics cropped to fit boundary masks.", "Rendering screen background banners using scale-crop options."],
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
        "slug": "compose-textfield",
        "title": "TextField & Input States",
        "tagline": "Configure editable inputs, manage state hoisting loops, and customize soft keyboards.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-text"],
        "related": ["compose-button"],
        "practiceProblems": [],
        "markdown": """# TextField & Input States

To capture text from users, Jetpack Compose uses the **TextField** and **OutlinedTextField** components. Because Compose UI is declarative, you cannot read values from text fields imperatively. Instead, you must implement **State Hoisting**, binding the text field's value to a mutable state variable and updating that state on keystrokes. This chapter covers state loops, keyboard actions, and configurations.

---

## 1. The Declarative Input Loop

Editable fields operate using a unidirectional state loop:
1. **State:** The Composable reads the current text state from a variable.
2. **Keystroke:** The user presses a key on the software keyboard.
3. **Callback:** The keystroke triggers the `onValueChange` lambda callback with the new string.
4. **Update:** The callback updates the state variable, triggering a recomposition to display the updated character.

---

## 2. Input State Loop Diagram

### Keystroke Recomposition Loop
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">TextField State Loop</text>

  {/* Keyboard Input */}
  <g transform="translate(40, 85)">
    <rect width="110" height="50" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">User Input</text>
    <text x="55" y="38" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Presses Key</text>
  </g>

  {/* onValueChange */}
  <g transform="translate(230, 80)">
    <rect width="140" height="60" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">onValueChange</text>
    <text x="70" y="42" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Updates state variable</text>
  </g>

  {/* Recompose */}
  <g transform="translate(450, 85)">
    <rect width="110" height="50" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="55" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">TextField</text>
    <text x="55" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Renders new state</text>
  </g>

  {/* Paths */}
  <path d="M 150,110 L 230,110" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 370,110 L 450,110" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | TextField (Standard) | OutlinedTextField |
| :--- | :--- | :--- |
| **Visual Style** | Filled box with underline | Transparent box with border outline |
| **Material Priority**| High emphasis (draws attention) | Medium emphasis |
| **Border Customization**| Underline color changes | Border outline color changes |

---

## 4. Kotlin Compose Input Example

Below is a Composable function declaring an outlined text field for capturing email inputs, with validation and custom keyboard options:

```kotlin
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType

@Composable
fun EmailInputField(onDoneClick: () -> Unit) {
    // Host input text state locally
    var email by remember { mutableStateOf("") }

    OutlinedTextField(
        value = email,
        // Update local state variable on keystrokes
        onValueChange = { email = it },
        label = { Text("Email Address") },
        singleLine = true,
        keyboardOptions = KeyboardOptions(
            // Configure input type for email formatting
            keyboardType = KeyboardType.Email,
            // Show "Done" action button on keyboard
            imeAction = ImeAction.Done
        ),
        keyboardActions = KeyboardActions(
            onDone = { onDoneClick() }
        )
    )
}
```

---

## 5. Conceptual Check Questions

1. **Why does ignoring the string parameter in onValueChange cause a TextField to stop typing?**
   *Answer:* In declarative UI, the text field does not store text state internally. It only renders the string passed to the `value` parameter. If the `onValueChange` callback ignores typing inputs and fails to update the bound state variable, the rendered value never changes.

2. **How does the remember block protect input states?**
   *Answer:* During recomposition passes (UI redraws), variables inside Composable scopes are normally reset. Wrapping a variable in a `remember` block cache preserves its value across recompositions.
""",
        "content": {
            "introduction": "TextFields edit strings, relying on state hoisting loops to update input states across recomposition passes.",
            "whyImportant": "Capturing text inputs without resetting states requires implementing unidirectional variables loop bindings.",
            "realWorldApps": ["Creating text entry fields for user registration forms.", "Designing dynamic search inputs that update results on typing."],
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
        "slug": "compose-card",
        "title": "Jetpack Compose Card",
        "tagline": "Utilize cards, outline borders, rounded shapes, and elevated drop-shadows.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["compose-image", "compose-column-row"],
        "practiceProblems": [],
        "markdown": """# Jetpack Compose Card

In Material Design, **Cards** act as content containers, grouping related information (like a product listing or a user profile) into a clean, distinct layout block. In Jetpack Compose, the **Card** component encapsulates rounded corners, borders, and drop-shadow elevations. This chapter covers card types, shapes, and shadow configurations.

---

## 1. Material 3 Card Variants

Material Design 3 defines three card styles depending on focus priority:

* **Filled Card (`Card`):** Uses a solid background color with no borders or shadows.
* **Elevated Card (`ElevatedButton`):** Elevates the card container using drop shadows, visually separating it from the background.
* **Outlined Card (`OutlinedCard`):** Outlines the container border with a thin outline, maintaining flat elevation.

---

## 2. Card Elevation and Shapes

### Elevated Card Depth Model
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Elevated Card Layout Model</text>

  {/* Simulated Card Stack */}
  <g transform="translate(180, 50)">
    {/* Shadow Overlay */}
    <rect x="15" y="15" width="240" height="120" rx="16" fill="#111" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 1"/>
    <text x="135" y="110" fill="#f59e0b" font-size="6" font-family="monospace" text-anchor="middle">Shadow Elevation Offset</text>

    {/* Front Card */}
    <rect x="0" y="0" width="240" height="120" rx="16" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="120" y="60" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Rounded Card Container</text>
    <text x="120" y="75" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">RoundedCornerShape(16.dp)</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Card Type | Default Background | Border Outline | Shadow Elevation |
| :--- | :--- | :--- | :--- |
| **`Card`** | Secondary Container Color | None | None |
| **`ElevatedCard`** | Surface Color | None | Shadow offset (dp scale) |
| **`OutlinedCard`** | Surface Color | Thin outline border | None |

---

## 4. Kotlin Compose Card Example

Below is a Composable function rendering a product card with custom corners, border, and elevation:

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ProductInfoCard(title: String, price: String) {
    OutlinedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        // Define corner shape rounding to 12dp
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.outlinedCardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(Color.LightGray)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(text = title)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = price)
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **How do you change the background color of a Card Composable?**
   *Answer:* You pass a configured `CardColors` object to the `colors` parameter using the helper builder `CardDefaults.cardColors(containerColor = Color.Blue)`.

2. **Why do we use Card components instead of basic Box containers with backgrounds?**
   *Answer:* Card components enforce Material Design guidelines by default, including standardized corner shapes, accessibility scopes, state-based hover shadows, and color token configurations.
""",
        "content": {
            "introduction": "Cards group content into distinct container shapes, offering elevate, border, and background color variants.",
            "whyImportant": "Creating clean dashboard grids and readable listing items requires using structured Card components.",
            "realWorldApps": ["Designing items inside a vertical list scroll grid.", "Displaying user settings items in distinct bordered panels."],
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
        "slug": "compose-bottomsheet",
        "title": "BottomSheet Modal Sheets",
        "tagline": "Configure modal bottom sheets, manage layout states, and implement drag transitions.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-scaffold"],
        "related": ["compose-tabrow"],
        "practiceProblems": [],
        "markdown": """# BottomSheet Modal Sheets

A **Modal Bottom Sheet** is a Material Design component that slides up from the bottom of the screen to present secondary options or actions. It blocks interaction with the rest of the screen, focusing the user's attention. In Jetpack Compose, this is managed by **ModalBottomSheet**. This chapter covers bottom sheet state controls, drag handles, and transition triggers.

---

## 1. Bottom Sheet State Mechanics

Unlike dialogs that open instantly, bottom sheets slide into view and support drag gestures. Their behavior is controlled by two states:
* **Visibility Flag:** A boolean state tracking whether the Composable is inside the layout tree (e.g. `showBottomSheet`).
* **Sheet State:** A `SheetState` object that monitors and animates bottom sheet movements (e.g., expanded, half-expanded, collapsed).

---

## 2. Sliding State Transitions

### Drag Slide Phases
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">ModalBottomSheet States</text>

  {/* Hidden State */}
  <g transform="translate(40, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="65" y="110" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">Hidden State</text>
  </g>

  {/* Half Expanded */}
  <g transform="translate(235, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <rect x="0" y="60" width="130" height="60" fill="#1e3a8a" rx="2" stroke="#3b82f6" stroke-width="1"/>
    <text x="65" y="110" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Half Expanded</text>
  </g>

  {/* Fully Expanded */}
  <g transform="translate(430, 60)">
    <rect width="130" height="120" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <rect x="0" y="15" width="130" height="105" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="65" y="110" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Fully Expanded</text>
  </g>

  {/* Transition paths */}
  <path d="M 175,120 L 230,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#bs-arrow)"/>
  <path d="M 370,120 L 425,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#bs-arrow)"/>

  <defs>
    <marker id="bs-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Standard AlertDialog | ModalBottomSheet |
| :--- | :--- | :--- |
| **Animation Path** | Pop-up zoom from center | Slide up from bottom |
| **Gestures Support** | None (clicks only) | Drag to dismiss, swipe expand |
| **Content Scope** | Minimal alerts and confirmations | Complex forms, lists, settings panels |
| **Positioning** | Center screen overlay | Bottom screen overlay |

---

## 4. Kotlin Compose BottomSheet Example

Below is a Composable function rendering a Modal Bottom Sheet that expands on click:

```kotlin
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomSheetHost() {
    var showSheet by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()
    val scope = rememberCoroutineScope()

    Button(onClick = { showSheet = true }) {
        Text("Open Options")
    }

    if (showSheet) {
        ModalBottomSheet(
            onDismissRequest = { showSheet = false },
            sheetState = sheetState,
            dragHandle = { BottomSheetDefaults.DragHandle() }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Text(text = "Sheet Title")
                Button(
                    onClick = {
                        // Collapse sheet with animation, then remove it
                        scope.launch { sheetState.hide() }.invokeOnCompletion {
                            showSheet = false
                        }
                    }
                ) {
                    Text("Close")
                }
            }
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why does sheetState.hide() require a coroutine scope to execute?**
   *Answer:* Collapsing a bottom sheet involves running a physics-based slide animation over several frames. Coroutines run this asynchronous calculation without blocking the Main UI thread.

2. **How does the onDismissRequest callback trigger?**
   *Answer:* It triggers when the user clicks the dark background overlay (scrim) or drags the bottom sheet down past the screen edge, indicating they want to close the sheet.
""",
        "content": {
            "introduction": "Modal Bottom Sheets slide up from the bottom of the screen, using Visibility flags and SheetState variables to manage movements.",
            "whyImportant": "Providing secondary menus or forms without cluttering primary page scopes requires deploying bottom sheets.",
            "realWorldApps": ["Designing action menus inside profile pages.", "Creating filter selection sheets for catalog searches."],
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
        "slug": "compose-tabrow",
        "title": "TabRow Selector Headers",
        "tagline": "Configure horizontal tab row selectors, manage active states, and bind slide indicators.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["compose-scaffold"],
        "related": ["compose-bottomsheet"],
        "practiceProblems": [],
        "markdown": """# TabRow Selector Headers

To divide content into distinct categories or panels under a single screen, applications deploy **Tabs**. In Jetpack Compose, this is managed by the **TabRow** and **Tab** components. TabRow coordinates a list of tab elements, displaying an active slider indicator beneath the selected category. This chapter covers tab layout, dynamic state binding, and custom indicators.

---

## 1. TabRow State Coordination

Tab navigation relies on binding the layout to an active index state:
* **Selected Index:** An integer state tracking the active tab (e.g. `0` for Home, `1` for Profile).
* **Tab Selection Event:** When a user clicks a tab, it updates the index state, triggering a recomposition to display the corresponding content panel.

---

## 2. Selection Indicator Alignment

The selected tab draws an indicator line at its bottom edge. When the index transitions, the indicator animates smoothly to the target tab:

### TabRow Active Index Selector
<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="180" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">TabRow Header Layout</text>

  {/* TabRow Bar */}
  <g transform="translate(40, 60)">
    <rect width="520" height="50" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    
    {/* Tab 0 */}
    <text x="86" y="28" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">Tab 0: Inbox</text>
    
    {/* Tab 1 (Selected) */}
    <text x="260" y="28" fill="#3b82f6" font-size="10" font-family="sans-serif" text-anchor="middle" font-weight="bold">Tab 1: Starred</text>
    
    {/* Tab 2 */}
    <text x="434" y="28" fill="#94a3b8" font-size="10" font-family="sans-serif" text-anchor="middle">Tab 2: Sent</text>

    {/* Indicator Line */}
    <rect x="190" y="44" width="140" height="4" fill="#3b82f6" rx="1"/>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | TabRow (Standard) | ScrollableTabRow |
| :--- | :--- | :--- |
| **Sizing Mode** | Stretches tabs to divide available width equally | Wraps content size per tab |
| **Overflow Behavior**| Clips if tabs exceed width | Enables horizontal scrolling |
| **Best For** | Few tabs (2 to 4) | Many tabs (4 or more) |

---

## 4. Kotlin Compose TabRow Example

Below is a Composable function declaring a TabRow bound to a dynamic content switcher:

```kotlin
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CategoryTabHost() {
    var selectedIndex by remember { mutableStateOf(0) }
    val categories = listOf("Trending", "Newest", "Saved")

    Column(modifier = Modifier.fillMaxSize()) {
        // TabRow container
        TabRow(selectedTabIndex = selectedIndex) {
            categories.forEachIndexed { index, title ->
                Tab(
                    selected = selectedIndex == index,
                    onClick = { selectedIndex = index },
                    text = { Text(text = title) }
                )
            }
        }

        // Display panel matching selected tab index
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            when (selectedIndex) {
                0 -> Text("Trending Products List")
                1 -> Text("New Release Products List")
                2 -> Text("Saved Bookmark items")
            }
        }
    }
}
```

---

## 5. Conceptual Check Questions

1. **When should you select ScrollableTabRow instead of TabRow?**
   *Answer:* Use `ScrollableTabRow` when the number of tabs is dynamic or large, or when tab titles are long, to prevent text clipping on smaller screens.

2. **Can you customize the indicator Composable inside a TabRow?**
   *Answer:* Yes. The `TabRow` component exposes an `indicator` Composable slot, allowing you to draw custom shapes (like a pill background indicator) instead of the default bottom line.
""",
        "content": {
            "introduction": "TabRow layouts group content sections, using index tracking and indicator animations to select active tabs.",
            "whyImportant": "Partitioning screens into distinct categories requires coordinating tab index layouts.",
            "realWorldApps": ["Designing product categories headers in shop search interfaces.", "Creating toggle tabs between incoming and outgoing messages dashboards."],
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
