with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('additions = {')
p_end = text.find('configs = [', p)
print(f"additions starts at {p}, configs starts at {p_end}")
print("additions snippet end:")
print(repr(text[p_end-100:p_end]))
