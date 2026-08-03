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

maps_finish = r"""
---

## 15. Comprehensive Google Maps API Integration Checklist

1. Always restrict Google Maps API Keys to specific Android SHA-1 fingerprints in Google Cloud Console.
2. Use `ClusterManager` for displaying large collections of map markers.
3. Manage camera bounds using `LatLngBounds.Builder()` to display all marker pins inside the active map viewport.
"""

apk_finish = r"""
---

## 12. Comprehensive APK & AAB Production Release Protocol

1. Store `keystore.properties` safely outside version control (`.gitignore`).
2. Enable R8 code shrinking and resource stripping (`isMinifyEnabled = true` and `isShrinkResources = true`).
3. Use Play App Signing and Android App Bundles (AAB) for Google Play Store distribution.
"""

firebase_dist_finish = r"""
---

## 16. Automated Fastlane & CLI Continuous Delivery Pipeline

```ruby
# Fastfile automation script for automated beta distribution
lane :distribute_beta do
  gradle(task: "clean assembleDebug")
  firebase_app_distribution(
    app: ENV["FIREBASE_APP_ID"],
    groups: "qa-team, beta-testers",
    release_notes: "Automated distribution build from commit #{last_git_commit[:abbreviated_commit_hash]}"
  )
end
```

---

## 17. Summary & Beta Testing Protocol Checklist

1. Maintain isolated tester groups (`qa-team`, `beta-testers`) for structured feedback.
2. Automate release notes extraction from git commit logs.
3. Distribute builds via Fastlane or Firebase CLI plugins in GitHub Actions workflows.
"""

shortcuts_finish = r"""
---

## 14. Dynamic Shortcuts Management & Deep Link Architecture

```kotlin
import android.content.Context
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat

fun pushDynamicShortcut(context: Context, id: String, label: String, url: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
        setPackage(context.packageName)
    }

    val shortcut = ShortcutInfoCompat.Builder(context, id)
        .setShortLabel(label)
        .setLongLabel("Launch $label screen")
        .setIntent(intent)
        .build()

    ShortcutManagerCompat.pushDynamicShortcut(context, shortcut)
}
```

---

## 15. Summary & Launcher Shortcuts Checklist

1. Limit static shortcuts to 4 core features in `shortcuts.xml`.
2. Push dynamic shortcuts at runtime to reflect recent user actions.
3. Support pinned shortcuts allowing users to add custom shortcuts to their launcher home screen.
"""

pad_article('service-maps', maps_finish)
pad_article('dist-signed-apk', apk_finish)
pad_article('dist-firebase', firebase_dist_finish)
pad_article('android-app-shortcuts', shortcuts_finish)

print("Finish 100% Batch 5 Complete!")
