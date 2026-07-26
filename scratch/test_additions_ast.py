import ast

with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

p1 = text.find('additions = {')
p2 = text.find('configs = [', p1)
additions_code = text[p1:p2]

try:
    ast.parse(additions_code)
    print("additions_code parses successfully!")
except SyntaxError as e:
    print(f"Syntax error in additions_code at line {e.lineno}: {e}")
    lines = additions_code.splitlines()
    if e.lineno and e.lineno <= len(lines):
        print(f"Line content: {repr(lines[e.lineno-1])}")
