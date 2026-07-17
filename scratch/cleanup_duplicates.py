# -*- coding: utf-8 -*-
with open("scratch/system_design_batch6_data.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # If the line is a duplicate declaration we already saw in the same dict, skip it.
    # We can detect opening of content dict or just deduplicate adjacent lines.
    new_lines.append(line)

# Let's do a simple clean replacement of the exact string:
content = "".join(lines)
bad_segment = '"implementationCpp": "",\n            "implementationPython": "",\n            "implementationCpp": "",\n            "implementationPython": "",'
good_segment = '"implementationCpp": "",\n            "implementationPython": "",'

content = content.replace(bad_segment, good_segment)

with open("scratch/system_design_batch6_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Text replacement clean completed.")
