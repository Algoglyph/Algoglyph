with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"File size: {len(content)} chars")
# Let's print the first 100 lines
print("=== Top of file ===")
print('\n'.join(content.splitlines()[:100]))

# Let's search for image or png or cyber or map inside this file
print("\n=== Search for cybersecurity in file ===")
matches = [line for line in content.splitlines() if 'cyber' in line.lower() or 'image' in line.lower() or 'png' in line.lower()]
for m in matches[:30]:
    print(f"  {m}")
