with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(315, 330):
    if idx < len(lines):
        print(f"Line {idx+1}: {repr(lines[idx])}")
