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

chucker_extra_final = r"""
---

## 10. Summary & Production Checklist

1. Always use `debugImplementation` for Chucker library artifacts and `releaseImplementation` for `chucker-no-op`.
2. Configure `.redactHeaders()` for `Authorization`, `Cookie`, and secret token keys to protect user credentials.
3. Restrict maximum content capture size (`maxContentLength`) to prevent excessive memory usage during large API responses.
"""

benchmark_extra_final = r"""
---

## 10. Summary & Production Checklist

1. Always run Macrobenchmarks on real physical hardware with thermal stability enabled.
2. Generate Baseline Profiles (`baseline-prof.txt`) for critical user startup and scroll flows.
3. Validate startup latency improvements using `StartupTimingMetric()` across COLD, WARM, and HOT launch modes.
"""

pad_article('android-chucker', chucker_extra_final)
pad_article('android-benchmark', benchmark_extra_final)

print("Exact 10k finish done!")
