# -*- coding: utf-8 -*-
with open("scratch/system_design_batch6_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's clean up any duplicated implementationCpp or implementationPython fields
double_cpp = '"implementationCpp": "",\n            "implementationCpp": "",'
single_cpp = '"implementationCpp": "",'

double_py = '"implementationPython": "",\n            "implementationPython": "",'
single_py = '"implementationPython": "",'

content = content.replace(double_cpp, single_cpp).replace(double_py, single_py)

with open("scratch/system_design_batch6_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Deduped successfully.")
