import re

raw_code = "```python\nprint('hello')\n```"
escaped = raw_code.replace('\\', r'\\').replace('`', r'\`').replace('${', r'\${')

print("Raw code:", repr(raw_code))
print("Escaped string to be written into JS template literal:", repr(escaped))

# Write to a test JS file and test node compilation
test_js = f"""
export const test = `{escaped}`;
"""
with open('scratch/test_js_syntax.ts', 'w', encoding='utf-8') as f:
    f.write(test_js)

print("Saved scratch/test_js_syntax.ts!")
