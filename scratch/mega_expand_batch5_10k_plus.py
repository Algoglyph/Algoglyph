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

# 1. FCM
fcm_extra = r"""
---

## 4. High-Priority Push Messages & Battery Doze Mode Interoperability

Android OS features battery preservation states (**Doze Mode** and **App Standby Buckets**). To ensure critical notifications (such as incoming VOIP calls, security alerts, or instant messages) bypass Doze restrictions:
1. Set message priority to `high` in FCM payload JSON.
2. Use FCM `android.priority = HIGH`.
3. Handle high-priority data payloads within 10 seconds in `FirebaseMessagingService`.

```json
{
  "message": {
    "token": "bk3RNwTe3H0:CI2k_HH85oi...",
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "high_importance_channel",
        "sound": "default"
      }
    },
    "data": {
      "order_id": "99214",
      "status": "DELIVERED"
    }
  }
}
```
"""

# 2. FIRESTORE
firestore_extra = r"""
---

## 4. Advanced Firestore Data Modeling: Subcollections vs Arrays

When designing enterprise NoSQL data schemas in Cloud Firestore:
1. **Document Size Limit**: Individual documents cannot exceed 1 MB in total size. Storing growing arrays of user interactions inside a single document risks hitting the 1 MB limit.
2. **Subcollections**: Nest dynamic collections under documents (`users/{userId}/orders/{orderId}`). Subcollections scale to millions of documents without increasing parent document size.
3. **Collection Group Queries**: Execute queries across all subcollections sharing the same name (`firestore.collectionGroup("orders").whereEqualTo("status", "SHIPPED")`).
"""

# 3. FIREBASE CORE
firebase_core_extra = r"""
---

## 4. Multi-Tenant Architecture & Dynamic Options Parsing

In white-label Android apps dynamically loading client configuration at runtime:

```kotlin
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class DynamicFirebaseManager {

    fun switchClientTenant(context: Context, tenantId: String, apiKey: String, appId: String) {
        val existingApp = FirebaseApp.getApps(context).firstOrNull { it.name == tenantId }
        val targetApp = existingApp ?: run {
            val options = FirebaseOptions.Builder()
                .setApiKey(apiKey)
                .setApplicationId(appId)
                .setProjectId(tenantId)
                .build()
            FirebaseApp.initializeApp(context, options, tenantId)
        }
        
        // Retrieve tenant-specific Firestore or Auth instance
        val tenantAuth = com.google.firebase.auth.FirebaseAuth.getInstance(targetApp)
    }
}
```
"""

# 4. ADMOB
admob_extra = r"""
---

## 4. Native Ads Implementation & Custom Layout Integration

Native Ads match the look and feel of your app's user interface, embedding ad components directly inside RecyclerView lists:

```kotlin
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.nativead.NativeAd

fun loadNativeAd(context: Context, adUnitId: String, onAdLoaded: (NativeAd) -> Unit) {
    val adLoader = AdLoader.Builder(context, adUnitId)
        .forNativeAd { nativeAd ->
            onAdLoaded(nativeAd)
        }
        .build()

    adLoader.loadAd(AdRequest.Builder().build())
}
```
"""

# 5. PLAY SERVICES
play_services_extra = r"""
---

## 4. Battery-Efficient Geofencing Architecture

Geofencing requires registering a `PendingIntent` that targets a `BroadcastReceiver`:

```kotlin
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices

fun addStoreGeofence(context: Context, storeId: String, lat: Double, lng: Double, radiusMeters: Float) {
    val geofence = Geofence.Builder()
        .setRequestId(storeId)
        .setCircularRegion(lat, lng, radiusMeters)
        .setExpirationDuration(Geofence.NEVER_EXPIRE)
        .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
        .build()

    val request = GeofencingRequest.Builder()
        .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
        .addGeofence(geofence)
        .build()

    val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
    val pendingIntent = PendingIntent.getBroadcast(
        context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
    )

    LocationServices.getGeofencingClient(context).addGeofences(request, pendingIntent)
}
```
"""

# 6. MAPS
maps_extra = r"""
---

## 4. Custom Marker Rendering & Polyline Animations

```kotlin
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions

fun addCustomMarker(googleMap: GoogleMap, position: LatLng, title: String) {
    val markerOptions = MarkerOptions()
        .position(position)
        .title(title)
        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE))
        .anchor(0.5f, 0.5f)

    googleMap.addMarker(markerOptions)
}
```
"""

# 7. SIGNED APK
signed_apk_extra = r"""
---

## 4. R8 Code Shrinking & Resource Stripping Optimization

R8 is Android's default bytecode optimizer. Enabling `isMinifyEnabled = true` and `isShrinkResources = true` performs 4 key optimization passes:
1. **Shrinking**: Removes unused classes, fields, and methods.
2. **Optimization**: Inspects AST structures, inlining short methods and removing dead code paths.
3. **Obfuscation**: Shortens class and member names to single characters (`a.b.c()`).
4. **Resource Shrinking**: Removes unused drawable and XML layout assets from the final compiled binary.
"""

# 8. FIREBASE DIST
firebase_dist_extra = r"""
---

## 4. Fastlane CLI Automated Deployment Setup

Automate Firebase App Distribution uploads using Fastlane:

```ruby
# Fastfile
lane :distribute_beta do
  gradle(task: "clean assembleDebug")
  firebase_app_distribution(
    app: "1:123456789:android:abcdef",
    groups: "qa-team, beta-testers",
    release_notes: "Automated nightly build distribution."
  )
end
```
"""

# 9. PLAYSTORE
playstore_extra = r"""
---

## 4. Play Console Production Deployment Checklist

1. **Verify Package Name**: Ensure application ID matches production naming conventions permanently.
2. **Validate SHA Fingerprints**: Upload release SHA-256 fingerprints to Google Cloud Console for Maps & Auth SDKs.
3. **Complete Content Rating**: Submit the IARC questionnaire for regional age rating classifications.
4. **Configure Staged Rollout**: Release production builds incrementally (5% -> 10% -> 100%) to safeguard user experience.
"""

# 10. APP SHORTCUTS
shortcuts_extra = r"""
---

## 4. XML Static Shortcut Configuration (`res/xml/shortcuts.xml`)

```xml
<shortcuts xmlns:android="http://schemas.android.com/apk/res/android">
    <shortcut
        android:shortcutId="new_post"
        android:enabled="true"
        android:icon="@drawable/ic_shortcut_post"
        android:shortcutShortLabel="@string/shortcut_post_short"
        android:shortcutLongLabel="@string/shortcut_post_long">
        <intent
            android:action="android.intent.action.VIEW"
            android:targetPackage="com.example.myapp"
            android:targetClass="com.example.myapp.CreatePostActivity" />
    </shortcut>
</shortcuts>
```
"""

# 11. NAVIGATION CORE
nav_extra = r"""
---

## 4. Multi-Stack Bottom Navigation Integration in Jetpack Compose

```kotlin
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    val items = listOf(HomeRoute, ProfileRoute("user_1"))
    val navBackStackEntry = navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry.value?.destination

    NavigationBar {
        items.forEach { route ->
            NavigationBarItem(
                icon = { Icon(R.drawable.ic_nav, contentDescription = null) },
                label = { Text("Navigation") },
                selected = currentDestination?.route == route::class.qualifiedName,
                onClick = {
                    navController.navigate(route) {
                        popUpTo(navController.graph.startDestinationId) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}
```
"""

pad_article('service-cloud-messaging', fcm_extra)
pad_article('service-firestore', firestore_extra)
pad_article('service-firebase-core', firebase_core_extra)
pad_article('service-admob', admob_extra)
pad_article('service-play-services', play_services_extra)
pad_article('service-maps', maps_extra)
pad_article('dist-signed-apk', signed_apk_extra)
pad_article('dist-firebase', firebase_dist_extra)
pad_article('dist-playstore', playstore_extra)
pad_article('android-app-shortcuts', shortcuts_extra)
pad_article('android-navigation-core', nav_extra)

print("Mega Expand Batch 5 Completed!")
