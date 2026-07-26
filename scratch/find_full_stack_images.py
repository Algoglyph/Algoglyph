import os

print("=== SEARCHING FOR FULL STACK IMAGES FOLDERS ===")

# Walk the project directory and search for directories containing "full" or "stack" or "image"
for root, dirs, files in os.walk('.'):
    # Exclude node_modules, .git, dist, etc.
    if 'node_modules' in root or '.git' in root or 'dist' in root or '.gemini' in root or 'AppData' in root:
        continue
    
    for d in dirs:
        if 'full' in d.lower() or 'stack' in d.lower():
            full_path = os.path.join(root, d)
            print(f"Found folder: {full_path}")
            # List files inside this folder
            try:
                sub_files = os.listdir(full_path)
                print(f"  Files count: {len(sub_files)}")
                for f_name in sub_files[:10]:
                    print(f"    - {f_name}")
                if len(sub_files) > 10:
                    print(f"    - ... and {len(sub_files) - 10} more files")
            except Exception as e:
                print(f"  Error listing directory: {e}")
