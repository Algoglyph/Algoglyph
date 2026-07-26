with open('scratch/build_full_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

p1 = text.find('md_21 = r"""') + len('md_21 = r"""')
p2 = text.find('"""\n\n# Register', p1)
if p2 == -1:
    p2 = text.find('"""\n\nmd_', p1)
md_21 = text[p1:p2]

headers = [line.strip() for line in md_21.splitlines() if 'Frequently' in line]
print("Headers containing 'Frequently' in md_21:", headers)
