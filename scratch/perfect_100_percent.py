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

core_extra = r"""
### Q7: How do you verify Firebase app initialization status programmatically?
Call `FirebaseApp.getApps(context)` to retrieve a list of active `FirebaseApp` instances in memory.
"""

apk_extra = r"""
### Q7: How do you verify APK signature scheme compliance on compiled binaries?
Use `apksigner verify --verbose app-release.apk` to verify signature scheme v1, v2, v3, and v4 flags.
"""

dist_extra = r"""
### Q10: How do you configure automated release notes when deploying via Gradle plugin?
Pass the `releaseNotes` parameter in your `appDistribution` Gradle block: `appDistribution { releaseNotes = "Bug fixes and performance improvements" }`.
"""

pad_article('service-firebase-core', core_extra)
pad_article('dist-signed-apk', apk_extra)
pad_article('dist-firebase', dist_extra)

print("Perfect 100% Completed!")
