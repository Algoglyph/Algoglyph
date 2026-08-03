with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find('"slug": "p-vs-np-class-limits"')
if idx != -1:
    np_idx = text.find("### The Class NP", idx)
    print("RAW SECTION:")
    print(repr(text[np_idx:np_idx+1000]))
