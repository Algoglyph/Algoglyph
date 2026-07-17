# -*- coding: utf-8 -*-
with open("scratch/system_design_batch6_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# For each article content, we want to ensure "implementationCpp": "" and "implementationPython": "" are present.
# Let's parse the python code using AST or do a simple text replace.
# Since we know the keys: "complexity": [] is followed by "commonMistakes", we can insert the missing fields after "complexity": [] or before "commonMistakes":

target = '"complexity": []'
replacement = '"complexity": [],\n            "implementationCpp": "",\n            "implementationPython": ""'

# Let's replace instances of target that do not already have implementationCpp.
# We can do this cleanly by checking each article block or simply replacing all target occurrences,
# then if we duplicate them we can clean it up. Let's do it carefully.

content = content.replace(target, replacement)

with open("scratch/system_design_batch6_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Missing fields added successfully.")
