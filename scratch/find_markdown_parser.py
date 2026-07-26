import os

def search_files(directory, pattern):
    results = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if pattern in content:
                        results.append(filepath)
                except Exception as e:
                    pass
    return results

print("Files containing 'articleMarkdownToHtml':")
for r in search_files('src', 'articleMarkdownToHtml'):
    print(f"  {r}")

print("\nFiles containing 'markdownToHtml':")
for r in search_files('src', 'markdownToHtml'):
    print(f"  {r}")
