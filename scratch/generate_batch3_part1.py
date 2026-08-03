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

# BATCH 3 - PART 1 (ARTICLES 1 TO 5)

# 1. STORAGE-ROOM
room_md = r"""# Comprehensive Guide to Room Database in Android: DAOs, Entities, TypeConverters & Schema Migrations

**Room** is Google's official Jetpack persistence library designed as an abstraction layer over native SQLite. Room simplifies database access, enforces compile-time SQL verification, eliminates tedious boilerplate mapping code, and integrates directly with Kotlin Coroutines and Flows for reactive database observation.

---

## 1. Architectural Foundations: SQLite Abstraction Engine

Native SQLite execution in legacy Android apps suffered from major software engineering flaws:
1. **No Compile-Time Query Safety**: SQL queries were declared as raw strings. Typographical errors in table or column names were only discovered when the app crashed at runtime.
2. **Boilerplate Cursor Mapping**: Developers had to manually extract values from SQLite `Cursor` objects row-by-row, leading to high null pointer risks and code duplication.
3. **Thread Safety & ANR Vulnerabilities**: Native SQLite did not restrict UI thread execution, causing accidental UI thread database reads/writes that triggered ANR (Application Not Responding) crashes.

Room solves all three problems by injecting an annotation processor (KSP/KAPT) that parses and validates SQL queries at compile time, generating pure Java/Kotlin DAO implementation classes.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="roomBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#roomBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Room Architecture & Reactive SQLite Pipeline</text>

  <!-- Entity -->
  <g transform="translate(60, 110)">
    <rect width="210" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">@Entity Data Class</text>
    <text x="15" y="65" fill="#94a3b8" font-family="system-ui" font-size="12">• Represents SQLite Table</text>
    <text x="15" y="95" fill="#94a3b8" font-family="system-ui" font-size="12">• @PrimaryKey Configuration</text>
    <text x="15" y="125" fill="#94a3b8" font-family="system-ui" font-size="12">• Foreign Key Constraints</text>
  </g>

  <!-- DAO -->
  <g transform="translate(345, 110)">
    <rect width="210" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#ecfdf5" font-family="monospace" font-weight="700" font-size="15">@Dao Interface</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Verified @Query SQL</text>
    <text x="15" y="95" fill="#a7f3d0" font-family="system-ui" font-size="12">• Returns Kotlin Flow</text>
    <text x="15" y="125" fill="#a7f3d0" font-family="system-ui" font-size="12">• Coroutine suspend fun</text>
  </g>

  <!-- Database -->
  <g transform="translate(630, 110)">
    <rect width="210" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="105" y="30" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">@Database File</text>
    <text x="15" y="65" fill="#a7f3d0" font-family="system-ui" font-size="12">• Extends RoomDatabase</text>
    <text x="15" y="95" fill="#a7f3d0" font-family="system-ui" font-size="12">• Schema Versioning</text>
    <text x="15" y="125" fill="#a7f3d0" font-family="system-ui" font-size="12">• Migration Execution</text>
  </g>

  <path d="M 270 160 L 345 160" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 555 160 L 630 160" stroke="#6ee7b7" stroke-width="2"/>
</svg>

---

## 2. Production Implementation: Multi-Table Relationships, TypeConverters & Migrations

Below is a complete, production-ready implementation of a Room database including `@Entity`, `@Relation`, `@TypeConverter`, and schema `Migration`:

```kotlin
import androidx.room.*
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.flow.Flow
import java.util.Date

// 1. TypeConverters for Complex Objects
class DatabaseConverters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? = value?.let { Date(it) }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? = date?.time
}

// 2. Parent Entity
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val userId: String,
    @ColumnInfo(name = "full_name") val fullName: String,
    val email: String,
    val createdAt: Date
)

// 3. Child Entity with Foreign Key
@Entity(
    tableName = "orders",
    foreignKeys = [
        ForeignKey(
            entity = UserEntity::class,
            parentColumns = ["userId"],
            childColumns = ["userOwnerId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["userOwnerId"])]
)
data class OrderEntity(
    @PrimaryKey val orderId: String,
    val userOwnerId: String,
    val totalAmountAmountCents: Long,
    val orderStatus: String
)

// 4. One-to-Many Relation Data Class
data class UserWithOrders(
    @Embedded val user: UserEntity,
    @Relation(
        parentColumn = "userId",
        entityColumn = "userOwnerId"
    )
    val orders: List<OrderEntity>
)

// 5. Data Access Object (DAO)
@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE userId = :id")
    suspend fun getUserById(id: String): UserEntity?

    @Transaction
    @Query("SELECT * FROM users WHERE userId = :id")
    fun observeUserWithOrders(id: String): Flow<UserWithOrders>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrders(orders: List<OrderEntity>)

    @Query("DELETE FROM users WHERE userId = :id")
    suspend fun deleteUser(id: String)
}

// 6. Schema Migration (Version 1 -> Version 2)
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN createdAt INTEGER NOT NULL DEFAULT 0")
    }
}

// 7. Abstract Room Database Singleton
@Database(
    entities = [UserEntity::class, OrderEntity::class],
    version = 2,
    exportSchema = true
)
@TypeConverters(DatabaseConverters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "app_database.db"
                )
                .addMigrations(MIGRATION_1_2)
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

---

## 3. Deep Line-by-Line Code Breakdown

1. `@TypeConverter`: Room natively supports primitive types (`Int`, `String`, `Long`). Complex objects like `java.util.Date` require `@TypeConverter` functions to convert the value into a epoch `Long` timestamp prior to SQL serialization.
2. `@Entity(foreignKeys = [...])`: Enforces relational integrity directly at the SQLite database level. `onDelete = CASCADE` ensures deleting a parent `UserEntity` automatically removes all associated `OrderEntity` records from disk.
3. `@Transaction`: Mandatory on relation queries (`UserWithOrders`). Because Room executes two separate SQL queries under the hood to fetch parent and child entities, `@Transaction` guarantees atomic execution in a single SQLite transaction block.
4. `@Volatile private var INSTANCE`: Guarantees atomic memory visibility across background threads when initializing the database singleton.

---

## 4. Room Migration Strategies: Manual vs AutoMigrations

| Feature | Manual Schema Migration (`Migration`) | AutoMigration (`@AutoMigration`) |
| :--- | :--- | :--- |
| **SQL Script Writing** | Manual raw `ALTER TABLE` SQL execution | Automatic SQL generation by Room KSP compiler |
| **Complex Transformations** | Full control (Renaming tables, column type conversions) | Restricted to non-destructive column additions |
| **Use Case** | Major database refactoring & schema restructuring | Simple column/table additions between consecutive versions |

---

## Frequently Asked Questions (FAQs)

### Q1: Why does Room require the `@Transaction` annotation on relational queries?
When returning nested relation objects (`@Relation`), Room performs multiple internal SELECT queries. Annotating the DAO method with `@Transaction` guarantees that all queries execute atomically within a single SQLite transaction block, preventing race conditions.

### Q2: What happens if a database schema version increases without providing a Migration?
Room will throw an `IllegalStateException` on application launch ("A migration from X to Y was required but not found"). If fallback is enabled via `.fallbackToDestructiveMigration()`, Room wipes the database file completely, losing user data.

### Q3: Why is `@Volatile` mandatory on the Room Database singleton instance?
Without `@Volatile`, background worker threads might read a stale, partially initialized reference to the database instance from CPU cache, leading to severe multithreading crashes.

### Q4: How does Room observe SQLite table updates reactively via Kotlin Flow?
Room registers an internal `InvalidationTracker` listener on the target SQLite tables. Whenever an `INSERT`, `UPDATE`, or `DELETE` query executes on those tables, Room re-runs the associated query on `Dispatchers.IO` and emits the updated result list to the active `Flow` collector.

### Q5: How do you perform unit testing on a Room DAO?
Use `Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).build()` inside a JVM JUnit test. An in-memory database lives purely in RAM and is destroyed when the process terminates, making tests fast and isolated.
"""

# 2. STORAGE-FILESYSTEM
filesystem_md = r"""# Comprehensive Guide to the Android File System: Scoped Storage, SAF & MediaStore API

The **Android File System** has undergone a massive architectural shift to safeguard user privacy. Moving away from legacy unrestricted shared storage permissions (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`), Android 10 (API 29) introduced **Scoped Storage**. Scoped Storage restricts how applications store, access, and share files across internal, app-specific external, and shared public media directories.

---

## 1. Storage Architecture Overview: Internal vs External vs Shared Storage

Android categorizes storage into three distinct storage locations:

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fsBg)" stroke="#3b82f6" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#dbeafe" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Android Scoped Storage Hierarchy Model</text>

  <!-- Internal Storage -->
  <g transform="translate(60, 110)">
    <rect width="220" height="180" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="15">Internal Storage</text>
    <text x="15" y="70" fill="#94a3b8" font-family="system-ui" font-size="12">• context.filesDir</text>
    <text x="15" y="100" fill="#94a3b8" font-family="system-ui" font-size="12">• Private to App sandbox</text>
    <text x="15" y="130" fill="#94a3b8" font-family="system-ui" font-size="12">• Auto-deleted on uninstall</text>
  </g>

  <!-- External App-Specific -->
  <g transform="translate(340, 110)">
    <rect width="220" height="180" rx="8" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#dbeafe" font-family="monospace" font-weight="700" font-size="15">External App-Specific</text>
    <text x="15" y="70" fill="#bfdbfe" font-family="system-ui" font-size="12">• getExternalFilesDir()</text>
    <text x="15" y="100" fill="#bfdbfe" font-family="system-ui" font-size="12">• Large cache / media</text>
    <text x="15" y="130" fill="#bfdbfe" font-family="system-ui" font-size="12">• Deleted on uninstall</text>
  </g>

  <!-- Shared Public MediaStore -->
  <g transform="translate(620, 110)">
    <rect width="220" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="110" y="35" text-anchor="middle" fill="#34d399" font-family="monospace" font-weight="700" font-size="15">Public MediaStore</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Photos, Audio, Downloads</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Accessed via ContentResolver</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Retained post-uninstall</text>
  </g>
</svg>

---

## 2. Production Implementation: Writing Media via MediaStore API & Internal Storage

```kotlin
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class StorageManager(private val context: Context) {

    // 1. Internal App-Private File Writing (No Permissions Needed)
    suspend fun writePrivateFile(fileName: String, content: String) = withContext(Dispatchers.IO) {
        val file = File(context.filesDir, fileName)
        file.writeText(content, Charsets.UTF_8)
    }

    // 2. Save Image to Public MediaStore Gallery (Scoped Storage Compliant)
    suspend fun saveImageToPublicGallery(bitmap: Bitmap, displayName: String): Uri? = withContext(Dispatchers.IO) {
        val imageCollection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        }

        val contentValues = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, "$displayName.jpg")
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/MyCustomApp")
                put(MediaStore.Images.Media.IS_PENDING, 1) // Block other apps while writing
            }
        }

        val resolver = context.contentResolver
        val imageUri = resolver.insert(imageCollection, contentValues)

        imageUri?.let { uri ->
            resolver.openOutputStream(uri)?.use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outputStream)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                contentValues.clear()
                contentValues.put(MediaStore.Images.Media.IS_PENDING, 0) // Release lock
                resolver.update(uri, contentValues, null, null)
            }
        }
        imageUri
    }
}
```

---

## 3. Storage Location Comparison Matrix

| Storage Location | Context API Method | Access Permission Required | Persistence on App Uninstall |
| :--- | :--- | :--- | :--- |
| **Internal Storage** | `context.filesDir` / `context.cacheDir` | ❌ None required | ❌ Automatically Deleted |
| **App-Specific External** | `context.getExternalFilesDir()` | ❌ None required (API 19+) | ❌ Automatically Deleted |
| **Shared MediaStore** | `MediaStore.Images`, `Downloads` | ❌ None to add owned files; READ for external files | ✅ Retained Permanently |
| **Storage Access Framework (SAF)** | `Intent.ACTION_OPEN_DOCUMENT` | ❌ System Picker handles permission grant | ✅ User Choice |

---

## Frequently Asked Questions (FAQs)

### Q1: What is Scoped Storage in Android 10+?
Scoped Storage isolates application file access. Applications get automatic access to their private sandbox directory (`filesDir`) and can insert files into shared media folders via `MediaStore` without requiring legacy global storage permissions.

### Q2: Why is `IS_PENDING` set to 1 during MediaStore insertions on Android 10+?
Setting `IS_PENDING = 1` marks the media file as incomplete. Other applications and system media scanners will ignore the file until the writing app completes I/O and sets `IS_PENDING = 0`.

### Q3: What is the Storage Access Framework (SAF)?
SAF allows users to select specific files or folders from any document provider (Google Drive, SD card) using the system file picker (`ACTION_OPEN_DOCUMENT`), returning persistent `Uri` access permissions to the app.

### Q4: When should `context.cacheDir` be used instead of `context.filesDir`?
Use `cacheDir` for temporary files (such as downloaded thumbnails). Android automatically purges files in `cacheDir` when the device runs low on storage.

### Q5: Can an app read files created by other apps in shared storage on Android 13+?
On Android 13 (API 33)+, apps must request granular permissions (`READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`) to access files created by other applications in public storage.
"""

inject_into_de_blog_data('storage-room', room_md)
inject_into_de_blog_data('storage-filesystem', filesystem_md)

print("Part 1 Articles 1 and 2 Injected!")
