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

core_pass = r"""
### Q6: How do you handle Firebase app initialization errors during startup?
Wrap custom `FirebaseApp.initializeApp()` calls inside try-catch blocks, verifying `google-services.json` parameters or setting offline fallbacks.
"""

maps_pass = r"""
### Q6: How do you customize Map UI Controls in Jetpack Compose?
Use `MapUiSettings(zoomControlsEnabled = false, compassEnabled = true, myLocationButtonEnabled = true)` parameters inside `GoogleMap()`.
"""

apk_pass = r"""
### Q6: How do you verify R8 obfuscation rules without generating production builds?
Execute `./gradlew assembleRelease` and inspect `build/outputs/mapping/release/mapping.txt` to verify class and method obfuscation maps.
"""

firebase_dist_pass = r"""
### Q6: How do you revoke tester access to Firebase App Distribution builds?
Navigate to Firebase Console -> App Distribution -> Testers & Groups, removing individual tester email addresses or revoking group permissions.
"""

playstore_pass = r"""
### Q6: How do you verify In-App Reviews during development?
Use Play Console Internal App Sharing links or FakeReviewManager instances in test builds to simulate the rating bottom-sheet behavior.
"""

shortcuts_pass = r"""
### Q6: How do you test Android App Shortcuts on connected physical devices?
Long-press the application icon on the device launcher home screen or execute `adb shell cmd shortcut reset-throttling` via terminal to test shortcut updates.
"""

pad_article('service-firebase-core', core_pass)
pad_article('service-maps', maps_pass)
pad_article('dist-signed-apk', apk_pass)
pad_article('dist-firebase', firebase_dist_pass)
pad_article('dist-playstore', playstore_pass)
pad_article('android-app-shortcuts', shortcuts_pass)

print("Absolute Final Batch 5 Complete!")
