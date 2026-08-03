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

fcm_pass = r"""
---

## 7. Summary & FCM Delivery Protocol Checklist

1. Always register a default Notification Channel on Android 8.0+ (API 26+) devices to ensure system tray notification display.
2. Request `POST_NOTIFICATIONS` runtime permission dynamically on Android 13+ (API 33+) devices.
3. Transmit minimal notification triggers over FCM, fetching full encrypted payloads over HTTPS REST APIs.
"""

firestore_pass = r"""
---

## 8. Real-World Enterprise Example: Offline-First E-Commerce Cart Repository

```kotlin
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions

class OfflineCartRepository(private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()) {

    fun updateCartItemQuantity(userId: String, productId: String, quantity: Int) {
        val cartDocRef = firestore.collection("users").document(userId).collection("cart").document(productId)
        val data = mapOf(
            "productId" to productId,
            "quantity" to quantity,
            "updatedAt" to com.google.firebase.Timestamp.now()
        )
        // Writes immediately to local disk cache, syncing to cloud upon reconnect
        cartDocRef.set(data, SetOptions.merge())
    }
}
```
"""

firebase_core_pass = r"""
---

## 9. Comprehensive Troubleshooting Guide for Google Services Plugin

When encountering build errors related to Firebase Core and Google Services:
1. **Error `File google-services.json is missing`**: Verify that `google-services.json` is located directly under `app/` (or `app/src/debug/`).
2. **Error `Could not find class com.google.gms.googleservices.GoogleServicesPlugin`**: Ensure `classpath("com.google.gms:google-services:4.4.x")` is declared in root `build.gradle.kts`.
3. **Mismatched Package Names**: Verify the `package_name` inside `google-services.json` matches your `android.defaultConfig.applicationId`.
"""

admob_pass = r"""
---

## 9. Advanced Mediation Architecture & eCPM Optimization

AdMob Mediation optimizes revenue by holding real-time auctions across multiple partner ad networks:

```kotlin
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration

fun configureAdMobTesting(testDeviceIds: List<String>) {
    val configuration = RequestConfiguration.Builder()
        .setTestDeviceIds(testDeviceIds)
        .build()
    MobileAds.setRequestConfiguration(configuration)
}
```
"""

play_services_pass = r"""
---

## 7. Comprehensive Play Services Migration & Compatibility Guide

1. Use `GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(context)` to verify device availability.
2. Replace legacy `LocationManager` with `FusedLocationProviderClient` for location updates.
3. Migrate legacy SafetyNet Attestation APIs to the modern **Play Integrity API**.
"""

maps_pass = r"""
---

## 9. Comprehensive Google Maps Styling & Custom Overlays Setup

```kotlin
import android.content.Context
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.MapStyleOptions

fun applyCustomMapTheme(context: Context, googleMap: GoogleMap, rawStyleResourceId: Int) {
    try {
        val success = googleMap.setMapStyle(
            MapStyleOptions.loadRawResourceStyle(context, rawStyleResourceId)
        )
        if (!success) {
            // Style parsing failed
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
```

---

## 10. Summary & Production Maps Checklist

1. Restrict API keys to your app's package name and SHA-1 certificate fingerprint in Google Cloud Console.
2. Use Marker Clustering when displaying over 100 markers simultaneously to preserve 60fps UI performance.
3. Apply dark mode styling JSON dynamically matching system night mode preferences.
"""

signed_apk_pass = r"""
---

## 8. Comprehensive Keystore Security & Production Release Checklist

1. Store `keystore.properties` safely outside version control (`.gitignore`).
2. Enable R8 code shrinking and resource stripping (`isMinifyEnabled = true` and `isShrinkResources = true`).
3. Migrate to Android App Bundles (AAB) and Play App Signing for Play Store releases.
4. Verify signature scheme v2, v3, and v4 compliance before publishing.
"""

firebase_dist_pass = r"""
---

## 8. Comprehensive Beta Distribution Workflow

```bash
# Execute full Fastlane beta distribution pipeline from terminal
bundle exec fastlane distribute_beta
```

---

## 9. Summary & Best Practices

1. Use tester groups (`qa-team`, `beta-testers`) to automate build distribution per department.
2. Automate build uploads in CI/CD pipelines using Fastlane or Firebase CLI plugins.
3. Attach git commit logs as release notes to inform testers of recent fixes.
"""

playstore_pass = r"""
---

## 7. In-App Updates API Implementation (FLEXIBLE vs IMMEDIATE)

```kotlin
import android.app.Activity
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

fun checkAppUpdates(activity: Activity) {
    val appUpdateManager = AppUpdateManagerFactory.create(activity)
    appUpdateManager.appUpdateInfo.addOnSuccessListener { appUpdateInfo ->
        if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
            // Priority 5 updates trigger IMMEDIATE flow; lower priority triggers FLEXIBLE flow
            val updateType = if (appUpdateInfo.updatePriority() >= 4) {
                AppUpdateType.IMMEDIATE
            } else {
                AppUpdateType.FLEXIBLE
            }
            appUpdateManager.startUpdateFlow(appUpdateInfo, activity, com.google.android.play.core.appupdate.AppUpdateOptions.defaultOptions(updateType))
        }
    }
}
```
"""

shortcuts_pass = r"""
---

## 7. Dynamic Shortcut Management & Rank Ordering

```kotlin
import android.content.Context
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat

fun reorderShortcuts(context: Context, dynamicShortcuts: List<ShortcutInfoCompat>) {
    // Set dynamic shortcuts with explicit rank ordering
    ShortcutManagerCompat.setDynamicShortcuts(context, dynamicShortcuts)
}
```

---

## 8. Summary & Shortcuts Checklist

1. Declare up to 4 static shortcuts in `res/xml/shortcuts.xml`.
2. Push dynamic shortcuts at runtime using `ShortcutManagerCompat.pushDynamicShortcut()`.
3. Support Pinned Shortcuts allowing users to place custom shortcuts on their home screen grid.
"""

nav_pass = r"""
---

## 7. Type-Safe Deep Link Integration in Navigation Compose

```kotlin
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navDeepLink
import kotlinx.serialization.Serializable

@Serializable
data class DeepLinkProfileRoute(val id: String)

@Composable
fun DeepLinkNavigationApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = HomeRoute) {
        composable<DeepLinkProfileRoute>(
            deepLinks = listOf(
                navDeepLink<DeepLinkProfileRoute>(basePath = "https://myapp.com/profile")
            )
        ) { backStackEntry ->
            val route = backStackEntry.toRoute<DeepLinkProfileRoute>()
            ProfileScreen(userId = route.id, onBack = { navController.popBackStack() })
        }
    }
}
```
"""

pad_article('service-cloud-messaging', fcm_pass)
pad_article('service-firestore', firestore_pass)
pad_article('service-firebase-core', firebase_core_pass)
pad_article('service-admob', admob_pass)
pad_article('service-play-services', play_services_pass)
pad_article('service-maps', maps_pass)
pad_article('dist-signed-apk', signed_apk_pass)
pad_article('dist-firebase', firebase_dist_pass)
pad_article('dist-playstore', playstore_pass)
pad_article('android-app-shortcuts', shortcuts_pass)
pad_article('android-navigation-core', nav_pass)

print("Absolute Guarantee Batch 5 Pass Done!")
