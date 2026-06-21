# Debug Plan — Excalidraw Color Palette Bug

> Based on systematic debugging protocol.

## 🔴 FIX-12: Color Palette Appears When Using Selection Tool

**Severity:** Low — UI annoyance / confusion

### Root Cause

The user reported: *"whenever i use the selection tool the color pallete appears for no reason"*

In Excalidraw, when the Selection tool (pointer) is active and no elements are selected, the Properties menu normally hides. However, because `changeViewBackgroundColor: true` is set in the `UIOptions` passed to Excalidraw, it keeps the Properties menu open to show the "Canvas background" color palette. 

Since the user switches to the Selection tool to get a clean UI (deselecting tools and elements), seeing a color palette remain visible feels like it "appears for no reason". Furthermore, our app handles the background color globally via the strict light/dark theme (`bg-canvas`), so exposing the Excalidraw background color picker is redundant and causes this visual clutter.

### Fix

We need to disable the `changeViewBackgroundColor` action in the Excalidraw UI options. This will cause the properties menu (color palette) to completely disappear when the selection tool is active and no elements are selected.

**File:** `src/components/Canvas.tsx`

Change `changeViewBackgroundColor` to `false` in the `UIOptions` definition (around line 48):

```diff
  const UIOptions = useMemo(() => {
    return {
      canvasActions: {
-       changeViewBackgroundColor: true,
+       changeViewBackgroundColor: false,
        clearCanvas: true,
        export: false,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: false,
      },
      welcomeScreen: false,
    } as const;
  }, []);
```

### Verify
- Open the app.
- Ensure no elements are selected on the canvas.
- Click the Selection tool (the pointer icon, `1`).
- The color palette on the left should completely disappear, leaving a clean canvas view.
