import ast

with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

p1 = text.find('additions = {')
p2 = text.find('configs = [', p1)
add_lines = text[p1:p2].splitlines()

d_test = "additions = {\n"
for i, line in enumerate(add_lines[1:], 2):
    d_test += line + "\n"
    if line.strip().startswith('""",') or line.strip() == '""":':
        try:
            ast.parse(d_test + "}\n")
            print(f"Key at line {i} closed successfully!")
        except Exception as e:
            print(f"Error closing key at line {i}: {e}")
