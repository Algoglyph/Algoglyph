import os

def search_pattern(directory, pattern):
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    for idx, line in enumerate(lines):
                        if pattern in line:
                            results.append((filepath, idx+1, line.strip()))
                except:
                    pass
    return results

print("Occurrences of 'RoadmapIllustration':")
for file, line_num, line in search_pattern('src', 'RoadmapIllustration'):
    print(f"  {file}:{line_num} -> {line}")

print("\nOccurrences of 'illustration':")
for file, line_num, line in search_pattern('src', 'illustration')[:15]:
    print(f"  {file}:{line_num} -> {line}")
