import re

with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find('"slug": "p-vs-np-class-limits"')
end_idx = content.find('},\n  {', idx)
if end_idx == -1:
    end_idx = content.find('}\n]', idx)

snippet = content[idx:end_idx]
# Find all $ expressions
print("All dollar occurrences in p-vs-np-class-limits:")
dollars = [m.start() for m in re.finditer(r'\$', snippet)]
print("Total $ count:", len(dollars))
for d in dollars:
    print(repr(snippet[max(0, d-20):min(len(snippet), d+30)]))
