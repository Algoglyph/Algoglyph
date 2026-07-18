# -*- coding: utf-8 -*-
with open(".agents/plans/dsa-image-checklist.md", "r", encoding="utf-8") as f:
    content = f.read()

# We want to change the status to: 21 / 145 completed (since we reverted 10 images, and it was 31)
content = content.replace("Status counts**: 31 / 145 completed", "Status counts**: 21 / 145 completed")

# Slugs we need to uncheck:
slugs_to_uncheck = [
    "heap",
    "binary-search-trees",
    "avl-trees",
    "b-trees",
    "avl-red-black-tree",
    "bellman-ford-floyd-warshall",
    "bfs-traversal",
    "bellman-ford",
    "a-star",
    "aho-corasick"
]

reverted = 0
for slug in slugs_to_uncheck:
    target = f"- [x] `{slug}`"
    replacement = f"- [ ] `{slug}`"
    if target in content:
        content = content.replace(target, replacement)
        reverted += 1
        print(f"Reverted checkbox for {slug}")

with open(".agents/plans/dsa-image-checklist.md", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully reverted {reverted} checkboxes.")
