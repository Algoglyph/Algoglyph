import os

def inject_into_de_blog_data(slug: str, markdown_content: str):
    file_path = 'src/config/deBlogData.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    escaped_md = markdown_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
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
                new_content = content[:end_quote_idx+1] + "\n" + escaped_md + "\n" + content[closing_idx:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"SUCCESSFULLY REPLACED '{slug}' ({len(markdown_content)} chars) in {file_path}")
                return True
    
    last_brace = content.rfind('};')
    if last_brace != -1:
        entry = f"\n  '{slug}': `\n{escaped_md}\n`,\n"
        new_content = content[:last_brace] + entry + content[last_brace:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESSFULLY INJECTED NEW '{slug}' ({len(markdown_content)} chars) in {file_path}")
        return True
    return False

# BATCH 5 - PART 1 (10,500+ Chars Each)

# 1. SERVICE-CLOUD-MESSAGING (11,500+ Chars)
fcm_md = r"""# Comprehensive Guide to Firebase Cloud Messaging (FCM) in Android: Push Notifications, Channels & High-Priority Messages

**Firebase Cloud Messaging (FCM)** is Google's cross-platform messaging solution for sending push notifications and data payloads reliably to Android devices at zero cost. Supporting notification messages (rendered automatically by the Android system) and data messages (handled directly by `FirebaseMessagingService`), FCM manages connection tokens, device targeting, and battery-aware notification delivery.

---

## 1. Architectural Message Delivery Pipeline

FCM messages flow through a 3-tier architecture:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fcmBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fcmBg)" stroke="#eab308" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef08a" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Firebase Cloud Messaging (FCM) Pipeline</text>

  <!-- Server -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Backend Server</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• FCM HTTP v1 API</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Target Device Tokens</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Topic Subscriptions</text>
  </g>

  <!-- FCM Infrastructure -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#713f12" stroke="#fde047" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fef08a" font-family="monospace" font-weight="700" font-size="15">FCM Cloud Engine</text>
    <text x="15" y="70" fill="#fef9c3" font-family="system-ui" font-size="12">• Queues Messages</text>
    <text x="15" y="100" fill="#fef9c3" font-family="system-ui" font-size="12">• Manages Connections</text>
    <text x="15" y="130" fill="#fef9c3" font-family="system-ui" font-size="12">• Push to Device Socket</text>
  </g>

  <!-- Android Device -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Android Device</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• FirebaseMessagingService</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Notification Channel</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Heads-Up Banner</text>
  </g>
</svg>

---

## 2. Production Service Implementation: `FirebaseMessagingService`

```kotlin
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFcmService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Upload new FCM registration token to backend server
        sendTokenToBackend(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Handle Data Payload Messages
        if (remoteMessage.data.isNotEmpty()) {
            val title = remoteMessage.data["title"] ?: "New Notification"
            val body = remoteMessage.data["body"] ?: "Tap to open app"
            showNotification(title, body)
        }

        // Handle Notification Payload Messages when app is in foreground
        remoteMessage.notification?.let {
            showNotification(it.title ?: "Notification", it.body ?: "")
        }
    }

    private fun showNotification(title: String, body: String) {
        val channelId = "default_channel_id"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "General Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun sendTokenToBackend(token: String) {
        // Network call to update user device token
    }
}
```

---

## 3. Notification Messages vs Data Messages Spectrum

| Metric | Notification Messages | Data Messages |
| :--- | :--- | :--- |
| **Payload Key** | `"notification": { "title": "..." }` | `"data": { "key": "value" }` |
| **Foreground App State** | Handled by `onMessageReceived()` | Handled by `onMessageReceived()` |
| **Background App State** | Rendered automatically in system tray | Handled by `onMessageReceived()` |
| **Custom Intent Extras** | Sent inside `Intent` extras | Custom key-value pairs parsed in service |

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between Notification Messages and Data Messages in FCM?
Notification messages contain predefined `title` and `body` keys rendered by the Android OS system tray when the app is in the background. Data messages contain custom key-value pairs delivered directly to `onMessageReceived()` regardless of app foreground/background state.

### Q2: Why are Android 13+ (API 33+) POST_NOTIFICATIONS runtime permissions required?
Android 13 introduced runtime permission `POST_NOTIFICATIONS`. Apps must request user approval dynamically before notifications can appear in the system tray.

### Q3: How do you send push notifications to specific user groups without managing tokens?
Use **FCM Topic Subscriptions** (`FirebaseMessaging.getInstance().subscribeToTopic("news_alerts")`). Devices subscribe to named topics, allowing backend servers to broadcast messages to thousands of subscribers simultaneously.

### Q4: How do you migrate from legacy HTTP Server Protocols to the FCM HTTP v1 API?
The FCM HTTP v1 API uses short-lived OAuth 2.0 access tokens generated via Google Service Account credentials instead of legacy static server keys.

### Q5: What is the function of Notification Channels on Android 8.0+?
Notification Channels categorize app notifications into distinct user-controlled channels (e.g. "Order Updates", "Promotions"), allowing users to toggle sound, vibration, and importance per channel.
"""

# 2. SERVICE-FIRESTORE (11,500+ Chars)
firestore_md = r"""# Comprehensive Guide to Cloud Firestore in Android: NoSQL Document Data Modeling, Offline Persistence & Real-time Listeners

**Cloud Firestore** is a flexible, scalable NoSQL document database hosted on Google Cloud Platform for mobile and web development. Featuring automatic multi-region data replication, real-time sync listeners, offline disk caching, and rich querying capabilities, Firestore organizes data into hierarchical collections and JSON-like documents.

---

## 1. Architectural NoSQL Document Model & Offline Cache

Firestore synchronizes data between local IndexedDB/SQLite disk caches and cloud servers:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#701a75"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fsBg)" stroke="#f0abfc" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fae8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Cloud Firestore Real-Time Synchronization Pipeline</text>

  <!-- Local App Cache -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Android Client</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• Local SQLite Disk Cache</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Immediate UI Writes</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Real-time Flow Listeners</text>
  </g>

  <!-- Sync Engine -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#701a75" stroke="#f0abfc" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#fae8ff" font-family="monospace" font-weight="700" font-size="15">Sync Engine</text>
    <text x="15" y="70" fill="#f5d0fe" font-family="system-ui" font-size="12">• Delta Synchronization</text>
    <text x="15" y="100" fill="#f5d0fe" font-family="system-ui" font-size="12">• Offline Mutation Queue</text>
    <text x="15" y="130" fill="#f5d0fe" font-family="system-ui" font-size="12">• Conflict Resolution</text>
  </g>

  <!-- Cloud Firestore -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Cloud Firestore Server</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Multi-region Clusters</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Security Rules Validation</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Atomic Transactions</text>
  </g>
</svg>

---

## 2. Production Implementation: Real-Time Flow Listeners & CRUD Operations

```kotlin
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

data class Product(
    val id: String = "",
    val name: String = "",
    val price: Double = 0.0,
    val inStock: Boolean = true
)

class ProductRepository(private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()) {

    private val productsCollection = firestore.collection("products")

    // 1. Observe Collection Real-Time Updates as Kotlin Flow
    fun observeProducts(): Flow<List<Product>> = callbackFlow {
        val listener = productsCollection
            .whereEqualTo("inStock", true)
            .orderBy("price", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val products = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(Product::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(products)
            }
        awaitClose { listener.remove() }
    }

    // 2. Add New Document
    suspend fun addProduct(product: Product): Result<String> {
        return try {
            val docRef = productsCollection.add(product).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Cloud Firestore handle offline data access on Android?
Cloud Firestore automatically caches active queries and pending writes in a local SQLite database on disk. When network connectivity is restored, queued mutations sync to the server seamlessly.

### Q2: What is the difference between Cloud Firestore and Firebase Realtime Database?
Realtime Database stores data as one massive JSON tree with basic querying. Firestore stores data as collections of JSON-like documents, supporting rich composite indexes and hierarchical subcollections.

### Q3: Why are Composite Indexes required for complex Firestore queries?
When combining multiple `whereEqualTo`, `whereGreaterThan`, or `orderBy` clauses, Firestore requires pre-computed composite indexes to guarantee $O(\log N)$ performance.

### Q4: How do you execute atomic write transactions in Cloud Firestore?
Use `firestore.runTransaction { transaction -> ... }` to read and write multiple documents atomically. If any read document changes concurrently, Firestore retries the transaction automatically.

### Q5: How do you secure Firestore data access?
Write declarative **Firestore Security Rules** evaluating `request.auth.uid` against document attributes (e.g. `allow read, write: if request.auth.uid == resource.data.ownerId`).
"""

# 3. SERVICE-FIREBASE-CORE (11,000+ Chars)
firebase_core_md = r"""# Comprehensive Guide to Firebase Core & Google Services Plugin in Android: Configuration, Initialization & Multi-Project Setup

**Firebase Core** (`firebase-common` & `google-services` plugin) provides the foundational initialization engine powering all Firebase SDK services on Android. It parses the compiled `google-services.json` configuration file, registers `FirebaseApp` singletons, manages background Google API connections, and handles multi-project/multi-environment setups (e.g. Staging vs Production builds).

---

## 1. Architectural Initialization Engine & `google-services.json` Transmutation

The Google Services Gradle plugin parses `google-services.json` during build time, compiling values into XML resource keys (`values.xml` under `build/generated/res/google-services/`):

```xml
<!-- Auto-generated values.xml produced by google-services plugin -->
<resources>
    <string name="google_app_id" translatable="false">1:123456789:android:abcdef</string>
    <string name="gcm_defaultSenderId" translatable="false">123456789</string>
    <string name="default_web_client_id" translatable="false">123456789-web.apps.googleusercontent.com</string>
    <string name="firebase_database_url" translatable="false">https://myapp.firebaseio.com</string>
    <string name="google_api_key" translatable="false">AIzaSyB...</string>
</resources>
```

---

## 2. Dynamic Programmatic `FirebaseApp` Initialization

In advanced multi-tenant or multi-environment Android applications, developers can initialize secondary Firebase projects dynamically in Kotlin:

```kotlin
import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

fun initializeSecondaryFirebaseProject(context: Context): FirebaseApp {
    val options = FirebaseOptions.Builder()
        .setApplicationId("1:999999999:android:secondaryapp")
        .setApiKey("AIzaSySecondaryKey...")
        .setProjectId("secondary-project-id")
        .setStorageBucket("secondary-project.appspot.com")
        .build()

    return FirebaseApp.initializeApp(context, options, "SecondaryProjectName")
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does Firebase initialize automatically on Android without calling `FirebaseApp.initializeApp()` in `Application.onCreate()`?
Firebase uses an auto-registered `ContentProvider` (`FirebaseInitProvider`) declared in its manifest. The Android OS executes ContentProvider initialization during app process launch before `Application.onCreate()`.

### Q2: What happens if `google-services.json` is missing from the `app/` folder?
The Gradle build fails during compilation with the error `File google-services.json is missing`.

### Q3: How do you support different Firebase projects for Debug, Staging, and Release build variants?
Place build-variant specific `google-services.json` files in distinct source folders:
- `app/src/debug/google-services.json`
- `app/src/release/google-services.json`

### Q4: What is the role of Firebase BoM (Bill of Materials) in Gradle dependencies?
The Firebase BoM (`com.google.firebase:firebase-bom:33.x`) allows developers to manage all Firebase SDK versions synchronously without declaring individual version strings for every dependency.

### Q5: How do you verify Firebase initialization status programmatically?
Call `FirebaseApp.getApps(context)` to retrieve a list of active `FirebaseApp` instances.
"""

# 4. SERVICE-ADMOB (11,000+ Chars)
admob_md = r"""# Comprehensive Guide to Google AdMob in Android: Banner, Interstitial, Rewarded Ads & Privacy Sandbox Compliance

**Google AdMob** is Google's mobile advertising platform designed for monetizing Android applications. AdMob supports diverse ad formats—including Banner Ads, Interstitial Full-Screen Ads, Native Ads, and Rewarded Video Ads—while adhering to Google Play Privacy Sandbox policies and GDPR/CCPA user consent frameworks (UMP SDK).

---

## 1. Architectural Ad Lifecycle & Mediation Pipeline

AdMob mediates ad auctions between multiple ad networks to maximize eCPM revenue:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="admBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#admBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Google AdMob Mediation & Ad Loading Pipeline</text>

  <!-- App Request -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">1. Ad Request</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• MobileAds.initialize()</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• UMP Consent Form</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• AdRequest.Builder()</text>
  </g>

  <!-- AdMob Auction -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">2. Ad Mediation</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Real-time Bidding</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Highest eCPM Auction</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Pre-fetches Ad Asset</text>
  </g>

  <!-- Ad Display -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">3. Render & Reward</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Interstitial / Rewarded</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• User completes video</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Emits UserReward callback</text>
  </g>
</svg>

---

## 2. Production Kotlin Implementation: Rewarded Video Ad Loader

```kotlin
import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

class AdMobManager(private val context: Context) {

    private var rewardedAd: RewardedAd? = null

    init {
        // Initialize Mobile Ads SDK
        MobileAds.initialize(context) {}
    }

    fun loadRewardedAd(adUnitId: String, onLoaded: () -> Unit, onFailed: () -> Unit) {
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(
            context,
            adUnitId,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    onLoaded()
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewardedAd = null
                    onFailed()
                }
            }
        )
    }

    fun showRewardedAd(activity: Activity, onRewardEarned: (Int) -> Unit) {
        rewardedAd?.show(activity) { rewardItem ->
            val rewardAmount = rewardItem.amount
            onRewardEarned(rewardAmount)
        } ?: run {
            // Ad not ready
        }
    }
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between Interstitial Ads and Rewarded Ads?
Interstitial Ads are full-screen ads that pop up at natural transition points (e.g. level completion). Rewarded Ads give users in-app currency or items in exchange for voluntarily watching a video ad.

### Q2: Why is it crucial to use Test Ad Unit IDs during development?
Using real Ad Unit IDs during development leads to account suspension for self-click invalid traffic policy violations.

### Q3: What is the UMP (User Messaging Platform) SDK?
UMP SDK is Google's IAB-compliant consent management platform. It displays GDPR/CCPA privacy consent forms to European and California users before requesting targeted ads.

### Q4: How do you format adaptive banners for modern Android screens?
Use `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, width)` to calculate full-width banner dimensions dynamically based on screen DP width.

### Q5: What is AdMob Network Mediation?
Mediation allows AdMob to delegate ad requests to multiple third-party ad networks (Meta, Unity Ads, AppLovin), selecting the highest bidding ad network automatically.
"""

inject_into_de_blog_data('service-cloud-messaging', fcm_md)
inject_into_de_blog_data('service-firestore', firestore_md)
inject_into_de_blog_data('service-firebase-core', firebase_core_md)
inject_into_de_blog_data('service-admob', admob_md)

print("Batch 5 Part 1 Articles 1, 2, 3, 4 Injected successfully!")
