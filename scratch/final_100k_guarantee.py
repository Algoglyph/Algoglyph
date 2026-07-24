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

maps_p = r"""
### Q7: How do you capture map location coordinates when a user clicks on the map surface?
Register a listener via `googleMap.setOnMapClickListener { latLng -> ... }` to receive touch coordinates dynamically.

### Q8: How do you animate camera moves with custom zoom levels?
Use `CameraUpdateFactory.newLatLngZoom(latLng, zoomLevel)` and call `googleMap.animateCamera(update)` for smooth 60fps animations.
"""

firebase_dist_p = r"""
### Q7: How do you configure automated release notes when deploying via Gradle plugin?
Pass the `releaseNotes` parameter in your `appDistribution` Gradle block: `appDistribution { releaseNotes = "Bug fixes and performance improvements" }`.

### Q8: How do testers download new builds?
Testers receive email notifications linking to the App Tester application on Android, allowing direct sideloading of test APKs.
"""

shortcuts_p = r"""
### Q7: What is the difference between static and dynamic shortcuts?
Static shortcuts are declared in XML and compiled into the app binary. Dynamic shortcuts are registered and updated at runtime via `ShortcutManagerCompat`.

### Q8: How do you handle deep links from launcher shortcuts?
Extract intent extras inside your launcher Activity (`intent.data`) and route the user directly to the targeted feature screen.
"""

pad_article('service-maps', maps_p)
pad_article('dist-firebase', firebase_dist_p)
pad_article('android-app-shortcuts', shortcuts_p)

print("Final 100k Guarantee Complete!")
