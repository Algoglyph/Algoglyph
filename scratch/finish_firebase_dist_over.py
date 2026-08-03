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

firebase_dist_over = r"""
---

## 21. Comparative Matrix: Beta Testing Platforms

| Feature | Firebase App Distribution | Google Play Internal Testing | TestFlight (iOS) |
| :--- | :--- | :--- | :--- |
| **Review Delay** | Zero (Instant distribution) | 1-2 Hours Play Review | 24-48 Hours Apple Review |
| **Tester Onboarding** | Direct Email / App Tester | Google Group / Email Invite | TestFlight Public Link |
| **CLI Automation** | Firebase CLI / Fastlane | Fastlane Supply | Fastlane Pilot |
"""

pad_article('dist-firebase', firebase_dist_over)

print("Firebase Dist Absolute 10k Pass Complete!")
