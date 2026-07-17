# -*- coding: utf-8 -*-
import sys

# Read the file
with open("scratch/system_design_batch6_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's replace the complexity values with empty array []
# We can do this programmatically by finding "complexity": [ ... ] and replacing it with "complexity": []
# Since the python file has "complexity": [ ... ], we can use a small regex or parser.

import re
# Regex to find "complexity": [ ... ] where content inside is strings
# We'll replace it with "complexity": []
pattern = r'"complexity":\s*\[[^\]]*\]'
fixed_content = re.sub(pattern, '"complexity": []', content)

with open("scratch/system_design_batch6_data.py", "w", encoding="utf-8") as f:
    f.write(fixed_content)

print("Complexity fix completed successfully.")
