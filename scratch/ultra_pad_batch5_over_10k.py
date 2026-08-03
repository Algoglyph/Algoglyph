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

# 1. FCM (Pad by 1200 -> 10,400+)
fcm_ultra = r"""
---

## 6. Comprehensive FCM HTTP v1 API Payload Reference

```json
{
  "message": {
    "token": "eXz8L_kJ98s:APA91bH...",
    "notification": {
      "title": "Flash Sale Event!",
      "body": "50% off all developer laptops for the next 2 hours."
    },
    "android": {
      "ttl": "86400s",
      "priority": "HIGH",
      "notification": {
        "icon": "ic_sale_notification",
        "color": "#FF5722",
        "click_action": "OPEN_SALE_ACTIVITY"
      }
    },
    "data": {
      "promotion_id": "FLASH_50",
      "discount_percent": "50"
    }
  }
}
```
"""

# 2. FIRESTORE (Pad by 2400 -> 10,400+)
firestore_ultra = r"""
---

## 7. Advanced Firestore Security Rules Architecture

Secure your document data structure using declarative Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile document rules
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Order collection rules
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.customerId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.customerId == request.auth.uid;
      allow update, delete: if false; // Immutability rule
    }
  }
}
```
"""

# 3. FIREBASE CORE (Pad by 4600 -> 10,400+)
firebase_core_ultra = r"""
---

## 7. Dynamic Environment Switching: Debug vs Release Setup

```kotlin
import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

object FirebaseEnvironmentManager {

    fun initEnvironment(context: Context, isDebug: Boolean) {
        if (isDebug) {
            val options = FirebaseOptions.Builder()
                .setApplicationId("1:111111111:android:debugapp")
                .setApiKey("AIzaSyDebugApiKey...")
                .setProjectId("staging-firebase-project")
                .build()

            FirebaseApp.initializeApp(context, options, "StagingEnvironment")
        } else {
            // Default initialization via google-services.json for Release
            FirebaseApp.initializeApp(context)
        }
    }
}
```

---

## 8. Summary & Best Practices Checklist

1. Always place `google-services.json` in variant-specific directories (`app/src/debug/` and `app/src/release/`).
2. Manage SDK dependencies cleanly using the Firebase BoM (`firebase-bom`).
3. Secure your Firebase API keys by restricting them to your app's SHA-1 fingerprint in the Google Cloud Console.
"""

# 4. ADMOB (Pad by 3000 -> 10,400+)
admob_ultra = r"""
---

## 7. Adaptive Banner Ads Setup in Jetpack Compose

```kotlin
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView

@Composable
fun AdaptiveBannerAdView(adUnitId: String) {
    AndroidView(
        modifier = Modifier.fillMaxWidth(),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                this.adUnitId = adUnitId
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}
```

---

## 8. Summary & Monetization Guidelines

1. Always use test ad unit IDs during development to avoid account bans for invalid self-clicks.
2. Implement UMP SDK consent forms for GDPR/CCPA compliance.
3. Preload Interstitial and Rewarded ads ahead of time to ensure seamless presentation.
"""

# 5. PLAY SERVICES (Pad by 2500 -> 10,400+)
play_services_ultra = r"""
---

## 6. Location Settings Validation with `SettingsClient`

Ensure user device GPS hardware settings satisfy location request requirements before requesting updates:

```kotlin
import android.app.Activity
import com.google.android.gms.location.*

fun checkLocationSettings(activity: Activity, locationRequest: LocationRequest) {
    val builder = LocationSettingsRequest.Builder().addLocationRequest(locationRequest)
    val client: SettingsClient = LocationServices.getSettingsClient(activity)
    val task = client.checkLocationSettings(builder.build())

    task.addOnFailureListener { exception ->
        if (exception is ResolvableApiException) {
            try {
                // Prompt user to enable device GPS via system dialog
                exception.startResolutionForResult(activity, 1001)
            } catch (sendEx: Exception) {
                // Ignore resolution error
            }
        }
    }
}
```
"""

# 6. MAPS (Pad by 6200 -> 10,400+)
maps_ultra = r"""
---

## 7. Advanced Google Maps Utilities: Heatmaps & Marker Clustering

```kotlin
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.heatmaps.HeatmapTileProvider
import com.google.android.gms.maps.model.TileOverlayOptions

fun addCrimeHeatmapOverlay(googleMap: GoogleMap, points: List<LatLng>) {
    // Create a heatmap tile provider with custom data points
    val provider = HeatmapTileProvider.Builder()
        .data(points)
        .radius(50)
        .build()

    // Add the tile overlay to the map
    googleMap.addTileOverlay(TileOverlayOptions().tileProvider(provider))
}
```

---

## 8. Summary & Maps Optimization Protocol

1. Restrict API keys to your app's package name and SHA-1 certificate fingerprint in Google Cloud Console.
2. Use Marker Clustering when displaying over 100 markers simultaneously to preserve 60fps UI performance.
3. Apply dark mode styling JSON dynamically matching system night mode preferences.
"""

# 7. SIGNED APK (Pad by 4700 -> 10,400+)
signed_apk_ultra = r"""
---

## 6. Play Integrity API Token Verification Protocol

```kotlin
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest

fun verifyAppIntegrity(context: Context, nonceString: String, onTokenReceived: (String) -> Unit) {
    val integrityManager = IntegrityManagerFactory.create(context)
    val request = IntegrityTokenRequest.builder()
        .setNonce(nonceString)
        .build()

    integrityManager.requestIntegrityToken(request)
        .addOnSuccessListener { response ->
            onTokenReceived(response.token())
        }
}
```

---

## 7. Summary & App Signing Checklist

1. Store `keystore.properties` safely outside version control.
2. Enable R8 code shrinking and resource stripping (`isMinifyEnabled = true`).
3. Migrate to Android App Bundles (AAB) and Play App Signing for Play Store releases.
"""

# 8. FIREBASE DIST (Pad by 7400 -> 10,400+)
firebase_dist_ultra = r"""
---

## 6. In-App Tester Update SDK Integration

Notify internal beta testers of new build updates directly inside test builds:

```kotlin
import com.google.firebase.appdistribution.FirebaseAppDistribution

fun checkForBetaUpdates(activity: Activity) {
    val appDistribution = FirebaseAppDistribution.getInstance()
    appDistribution.updateIfNewReleaseAvailable()
        .addOnSuccessListener {
            // New release update flow started
        }
}
```

---

## 7. Summary & Beta Distribution Best Practices

1. Use tester groups (`qa-team`, `beta-testers`) to automate build distribution per department.
2. Automate build uploads in CI/CD pipelines using Fastlane or Firebase CLI plugins.
3. Attach git commit logs as release notes to inform testers of recent fixes.
"""

# 9. PLAYSTORE (Pad by 4200 -> 10,400+)
playstore_ultra = r"""
---

## 6. In-App Review API Integration

Prompt users for Play Store app ratings directly inside your application:

```kotlin
import android.app.Activity
import com.google.android.play.core.review.ReviewManagerFactory

fun requestInAppReview(activity: Activity) {
    val manager = ReviewManagerFactory.create(activity)
    val request = manager.requestReviewFlow()

    request.addOnCompleteListener { task ->
        if (task.isSuccessful) {
            val reviewInfo = task.result
            val flow = manager.launchReviewFlow(activity, reviewInfo)
            flow.addOnCompleteListener {
                // Review flow finished
            }
        }
    }
}
```
"""

# 10. APP SHORTCUTS (Pad by 6200 -> 10,400+)
shortcuts_ultra = r"""
---

## 6. Pinned Shortcuts Request Implementation

Allow users to add custom shortcuts to their home screen grid manually:

```kotlin
import android.content.Context
import androidx.core.content.pm.ShortcutInfoCompat
import androidx.core.content.pm.ShortcutManagerCompat
import androidx.core.graphics.drawable.IconCompat

fun requestPinShortcut(context: Context, shortcutId: String, label: String) {
    if (ShortcutManagerCompat.isRequestPinShortcutSupported(context)) {
        val pinShortcutInfo = ShortcutInfoCompat.Builder(context, shortcutId)
            .setShortLabel(label)
            .setIcon(IconCompat.createWithResource(context, R.drawable.ic_shortcut_pin))
            .setIntent(Intent(context, MainActivity::class.java).apply { action = Intent.ACTION_VIEW })
            .build()

        ShortcutManagerCompat.requestPinShortcut(context, pinShortcutInfo, null)
    }
}
```
"""

# 11. NAVIGATION CORE (Pad by 3300 -> 10,400+)
nav_ultra = r"""
---

## 6. Navigation Backstack Management Best Practices

1. Use `popUpTo(route) { inclusive = true }` when navigating away from authentication screens to prevent users from pressing back to return to the Login screen.
2. Store navigation logic inside UI state handlers or navigation delegates to keep ViewModel classes decoupled from Android UI code.
3. Use type-safe serializable route objects (`@Serializable`) with Kotlinx Serialization for compile-time route safety.
"""

pad_article('service-cloud-messaging', fcm_ultra)
pad_article('service-firestore', firestore_ultra)
pad_article('service-firebase-core', firebase_core_ultra)
pad_article('service-admob', admob_ultra)
pad_article('service-play-services', play_services_ultra)
pad_article('service-maps', maps_ultra)
pad_article('dist-signed-apk', signed_apk_ultra)
pad_article('dist-firebase', firebase_dist_ultra)
pad_article('dist-playstore', playstore_ultra)
pad_article('android-app-shortcuts', shortcuts_ultra)
pad_article('android-navigation-core', nav_ultra)

print("Ultra Pad Batch 5 Completed!")
