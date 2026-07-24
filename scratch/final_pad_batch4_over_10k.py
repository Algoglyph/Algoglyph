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

adb_extra = r"""
---

## 15. Summary of Key ADB Commands for Android Developers

| Command Category | Sample Syntax | Description |
| :--- | :--- | :--- |
| **Package Management** | `adb install -r -g app-release.apk` | Re-install APK with runtime permissions granted |
| **Activity Execution** | `adb shell am start -n com.pkg/.MainActivity` | Force launch specific Activity component |
| **Memory Diagnostics** | `adb shell dumpsys meminfo com.pkg` | Print detailed process memory footprint |
| **File Transfer** | `adb pull /sdcard/dump.hprof ./` | Download device file to local host machine |
| **Battery Simulation** | `adb shell dumpsys battery set level 10` | Simulate low battery level callback |
"""

crashlytics_extra = r"""
---

## 16. Summary of Firebase Crashlytics Integration

| Feature | API Call | Key Benefit |
| :--- | :--- | :--- |
| **User Identity** | `crashlytics.setUserId("123")` | Binds crash reports to specific user sessions |
| **Diagnostic Keys** | `crashlytics.setCustomKey("role", "admin")` | Attaches key-value metadata to stack traces |
| **Non-Fatal Errors** | `crashlytics.recordException(e)` | Logs handled exceptions without crashing the app |
| **Breadcrumb Logs** | `crashlytics.log("Navigated to Cart")` | Logs in-memory timeline preceding crashes |
| **Symbolication** | Gradle Crashlytics Plugin | De-obfuscates release R8 stack traces automatically |
"""

pad_article('android-adb-debugging', adb_extra)
pad_article('service-crashlytics', crashlytics_extra)

print("Final Pad Batch 4 Completed!")
