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

detekt_pass = r"""
---

## 14. Performance & Memory Impact of Static Code Analysis

Detekt parses Kotlin Abstract Syntax Trees using the official Kotlin Compiler Embedding. Running Detekt in parallel mode (`parallel: true`) across Gradle multi-module builds scales linearly across available CPU cores, providing fast static analysis without delaying developer build loops.
"""

adb_pass = r"""
---

## 14. Advanced Logcat Command Line Filtering Strategies

```bash
# Filter Logcat by Tag and Log Level
adb logcat MyTag:D *:S                              # Show only MyTag Debug logs, suppress others
adb logcat -v color                                 # Colorize logcat output in terminal
adb logcat -d > logcat_dump.txt                     # Dump logcat buffer to host file and exit
```
"""

crashlytics_pass = r"""
---

## 15. Offline Crash Serialization & Delivery Guarantees

When a crash occurs on an offline device, Crashlytics serializes crash events into encrypted persistent storage on disk. Upon restoring internet connectivity, the Crashlytics SDK transmits pending crash logs automatically on the next application launch.
"""

pad_article('lint-detekt', detekt_pass)
pad_article('android-adb-debugging', adb_pass)
pad_article('service-crashlytics', crashlytics_pass)

print("Absolute Pass Batch 4 Done!")
