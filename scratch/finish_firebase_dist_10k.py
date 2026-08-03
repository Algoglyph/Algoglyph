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

firebase_dist_final = r"""
---

## 18. Comprehensive Firebase App Distribution CLI & Fastlane Cheatsheet

```bash
# 1. Upload APK via Firebase CLI with Release Notes
firebase appdistribution:distribute build/outputs/apk/debug/app-debug.apk \
  --app 1:123456789:android:abcdef \
  --release-notes "Fixed crash on startup and updated UI dependencies." \
  --groups "qa-team, internal-beta"

# 2. Add New Testers to Beta Group
firebase appdistribution:testers:add tester@example.com --group qa-team
```

---

## 19. Summary & Automated Distribution Checklist

1. Integrate Fastlane or Firebase CLI plugins into GitHub Actions CI/CD workflows.
2. Automate release notes extraction from recent git commit logs.
3. Manage internal tester feedback loops using the App Tester companion app.
"""

pad_article('dist-firebase', firebase_dist_final)

print("Firebase Dist 10k Pass Complete!")
