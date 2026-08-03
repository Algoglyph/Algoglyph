with open('scratch/fix_batch3_headers_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure all string definitions in additions use raw strings r"""..."""
text = text.replace('extra_string_algos = """', 'extra_string_algos = r"""')
text = text.replace('\n30: """', '\n30: r"""')

with open('scratch/fix_batch3_headers_perfect.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Repaired raw string syntax in fix_batch3_headers_perfect.py.")
