print("=== TRIMMING ORPHAN TAIL FROM blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate line 169425 context: "width rather than the overall browser viewport width."
p_cut = text.find("rather than the overall browser viewport width.")
if p_cut != -1:
    p_end_quote = text.find("`", p_cut)
    p_closing = text.find("\n  }", p_end_quote)
    if p_closing != -1:
        text = text[:p_closing] + "\n  }\n];\n"
        print("Orphan tail successfully trimmed!")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("SAVED! TESTING BUILD...")
