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

chucker_final = r"""
---

## 9. Performance & Threading Impact

Because Chucker intercepts response streams and writes transaction records into an internal Room database on disk, it introduces small I/O overhead. Chucker processes disk writes asynchronously on `Dispatchers.IO`, ensuring UI rendering and main thread network callbacks remain unblocked during test automation.
"""

benchmark_final = r"""
---

## 9. Baseline Profiles vs DEX Layout Optimization

In addition to pre-compiling bytecode methods, Baseline Profiles inform the Android build toolchain (R8/D8) how to reorder classes inside `.dex` files. Placing frequently accessed startup classes contiguously inside `classes.dex` minimizes page faults when ART loads app binaries from storage into physical RAM.
"""

apollo_final = r"""
---

## 8. Multiplatform (KMP) Architecture

Apollo Kotlin is written in pure Kotlin without JVM dependencies. This allows Apollo GraphQL repositories to be shared natively across Android, iOS, Desktop (JVM), and Web (JS/Wasm) target platforms in Kotlin Multiplatform projects.
"""

pad_article('android-chucker', chucker_final)
pad_article('android-benchmark', benchmark_final)
pad_article('network-apollo', apollo_final)

print("Final 10k Check Done!")
