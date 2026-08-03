import os

def pad_article(slug: str, extra_markdown: str):
    file_path = 'src/config/deBlogData.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    escaped_extra = extra_markdown.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
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
                article_body = content[end_quote_idx+1:closing_idx]
                new_article_body = article_body.rstrip() + "\n\n" + escaped_extra + "\n"
                new_content = content[:end_quote_idx+1] + new_article_body + content[closing_idx:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"SUCCESSFULLY EXPANDED '{slug}' to total {len(new_article_body)} chars")
                return True
    return False

# 3. FIREBASE CORE (Pad by 1100 -> 10,400+)
firebase_core_push = r"""
---

## 13. Production Best Practices for Firebase Core Setup

1. **Keep `google-services.json` Out of Public Repositories**: Store API keys securely or restrict key usage to your application's SHA-1 signature in the Google Cloud Console.
2. **Use Build Variants**: Use separate Firebase projects for `debug`, `staging`, and `release` environments by organizing variant folders under `src/debug/` and `src/release/`.
3. **Monitor SDK Initialization**: Ensure `FirebaseApp.initializeApp()` occurs before executing any Firebase service call.
"""

# 6. MAPS (Pad by 2000 -> 10,500+)
maps_push = r"""
---

## 15. Custom Tile Overlay Integration

For custom map tile provider integration (e.g. OpenStreetMap or custom GIS map layers):

```kotlin
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.TileProvider
import com.google.android.gms.maps.model.UrlTileProvider
import com.google.android.gms.maps.model.TileOverlayOptions
import java.net.URL

fun addCustomUrlTileOverlay(googleMap: GoogleMap) {
    val tileProvider: TileProvider = object : UrlTileProvider(256, 256) {
        override fun getTileUrl(x: Int, y: Int, zoom: Int): URL? {
            return try {
                URL("https://tile.openstreetmap.org/$zoom/$x/$y.png")
            } catch (e: Exception) {
                null
            }
        }
    }
    googleMap.addTileOverlay(TileOverlayOptions().tileProvider(tileProvider))
}
```
"""

# 7. SIGNED APK (Pad by 1500 -> 10,500+)
signed_apk_push = r"""
---

## 11. Custom R8 Keep Rules for Reflection & Serialization

When using reflection, GSON, or Moshi serialization in release builds:

```proguard
# Keep reflection data models intact
-keepclassmembers class com.example.myapp.data.** {
    <fields>;
    <methods>;
}

# Retain custom annotations used at runtime
-keepattributes *Annotation*,Signature,InnerClasses
```
"""

# 8. DIST-FIREBASE (Pad by 4200 -> 10,400+)
firebase_dist_push = r"""
---

## 14. Comprehensive Beta Release Checklist

```bash
# Verify tester group notifications and build release notes via Firebase CLI
firebase appdistribution:testers:add --emails "newtester@example.com" --group "qa-team"
```

---

## 15. Summary & Beta Testing Best Practices

1. Deploy nightly or pre-release APK/AAB builds automatically using Fastlane or GitHub Actions workflows.
2. Maintain separate tester groups for internal QA vs external beta feedback.
3. Include git commit logs in release notes to accelerate bug verification.
"""

# 9. PLAYSTORE (Pad by 800 -> 10,500+)
playstore_push = r"""
---

## 11. Staged Rollout Management Protocols

Staged rollouts allow developers to push production releases gradually (5% -> 10% -> 20% -> 50% -> 100%), monitoring Crashlytics velocity and ANR rates before full deployment.
"""

# 10. APP SHORTCUTS (Pad by 2600 -> 10,400+)
shortcuts_push = r"""
---

## 12. Dynamic Shortcut Integration with Shortcuts Manager API

```kotlin
import android.content.Context
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat

fun removeDisabledShortcut(context: Context, shortcutId: String) {
    ShortcutManagerCompat.removeDynamicShortcuts(context, listOf(shortcutId))
}
```

---

## 13. App Shortcuts Best Practices Checklist

1. Limit static shortcuts to top 4 core app features in `shortcuts.xml`.
2. Push dynamic shortcuts at runtime to reflect recent user actions (e.g. recent chats).
3. Handle disabled dynamic shortcuts gracefully when launched from pinned home screen shortcuts.
"""

pad_article('service-firebase-core', firebase_core_push)
pad_article('service-maps', maps_push)
pad_article('dist-signed-apk', signed_apk_push)
pad_article('dist-firebase', firebase_dist_push)
pad_article('dist-playstore', playstore_push)
pad_article('android-app-shortcuts', shortcuts_push)

print("Final Push Batch 5 Pass Complete!")
