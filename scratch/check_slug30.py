with open('scratch/make_all10_pure_real_batch3_final.py', 'r', encoding='utf-8') as f:
    text = f.read()

scope = {}
exec(text, scope)

b30 = scope['blogs']['exploratory-data-analysis-for-machine-learning']['markdown']
print("Length of b30:", len(b30))
print("Is 'Technical Deep-Dive Section' in b30?:", "Technical Deep-Dive Section" in b30)
for line in b30.splitlines():
    if "Technical Deep-Dive Section" in line or "Technical Deep-Dive" in line or "Section" in line and "Deep-Dive" in line:
        print("MATCHING LINE:", repr(line))
