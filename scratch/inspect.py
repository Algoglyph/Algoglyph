with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

ml_idx = text.find("Machine Learning")
print(text[ml_idx-200:ml_idx+2000])
