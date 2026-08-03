import ast

with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(50, len(lines)):
    code_sub = "".join(lines[:i]) + "\n}"
    try:
        ast.parse(code_sub)
    except SyntaxError as e:
        if "never closed" not in str(e) and "was never closed" not in str(e):
            print(f"First syntax failure at line {i}: {e}")
            print(f"Line content: {repr(lines[i-1])}")
            break
