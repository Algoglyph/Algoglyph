import re

print("=== FIXING CORRUPTED BLOCK IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate the Python script text start around line 45150
p_corrupt_start = text.find("cleaned_md = clean_markdown_headers(raw_md.strip())")
if p_corrupt_start != -1:
    # Back up to the start of the corrupted block or previous object boundary
    p_obj_start = text.rfind("\n  {", 0, p_corrupt_start)
    print(f"Corrupted python block found at index {p_corrupt_start}, object start at {p_obj_start}")

    # Locate where clean TypeScript object starts after the corruption
    # Look for next valid `slug: '...'` or `slug: "..."` entry
    p_clean_resume = text.find("slug: 'time-series-models'", p_corrupt_start)
    if p_clean_resume == -1:
        p_clean_resume = text.find("slug: 'exploratory-data-analysis-with-seaborn'", p_corrupt_start)
    if p_clean_resume == -1:
        p_clean_resume = text.find("slug: 'html-semantics'", p_corrupt_start)
        
    p_resume_obj = text.rfind("\n  {", 0, p_clean_resume)
    print(f"Resuming clean TypeScript at index {p_resume_obj}")

    # Remove corrupted slice
    text = text[:p_obj_start] + text[p_resume_obj:]
    print("Corrupted slice successfully removed!")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("FILE SAVED. RUNNING COMPILATION AUDIT...")
