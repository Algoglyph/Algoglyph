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

detekt_p = r"""
### Q6: What is the rule execution order in Detekt?
Detekt executes rules grouped by rule set in parallel across AST nodes, aggregating reported code smells before generating final HTML/SARIF summary reports.
"""

adb_p = r"""
### Q6: How do you clear app storage and permissions remotely using ADB?
Execute `adb shell pm clear <package_name>` to instantly purge app cache, database files, shared preferences, and reset granted permissions.
"""

crashlytics_p = r"""
### Q7: How does Crashlytics handle unhandled background thread exceptions?
Crashlytics registers a global default JVM UncaughtExceptionHandler, serializing thread stack traces into offline disk files before the app process terminates.
"""

pad_article('lint-detekt', detekt_p)
pad_article('android-adb-debugging', adb_p)
pad_article('service-crashlytics', crashlytics_p)

print("Batch 4 Finished Over 10k!")
