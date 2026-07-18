# -*- coding: utf-8 -*-
with open(".agents/plans/dsa-image-checklist.md", "r", encoding="utf-8") as f:
    lines = f.readlines()

left_blogs = []
for line in lines:
    if "- [ ]" in line:
        parts = line.strip().split("`")
        if len(parts) >= 3:
            slug = parts[1]
            desc = parts[2].replace("—", "").strip()
            # Remove any trailing comments like (Pending Images)
            desc = desc.split("(Pending")[0].strip()
            left_blogs.append((slug, desc))

print(f"Total DSA blogs left without images: {len(left_blogs)}")
print("\nHere is the copy-pastable list:")
for slug, desc in left_blogs:
    print(f"- {slug} ({desc})")
