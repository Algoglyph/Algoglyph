with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    roadmap_content = f.read()

import re
# Let's extract all cybersecurity slugs from roadmapData.ts
cyber_zone_match = re.search(r'id:\s*[\'"]cybersecurity[\'"][\s\S]*?zones:', roadmap_content)
# Let's write a python script to search inside src/components/RoadmapIllustration.tsx for 'cyber'
with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    ill_content = f.read()

print("Is 'cybersecurity' in RoadmapIllustration.tsx?")
print('cybersecurity' in ill_content.lower())
print("Is 'cyber' in RoadmapIllustration.tsx?")
print('cyber' in ill_content.lower())
print("Is 'security' in RoadmapIllustration.tsx?")
print('security' in ill_content.lower())
