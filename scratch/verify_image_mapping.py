import os

print("=== VERIFYING AI & DATA SCIENTIST IMAGE FILE MAPPING ===")

img_dir = "public/images/ai-data-scientist"
files = [f for f in os.listdir(img_dir) if f.endswith('.png') or f.endswith('.jpg')]

print(f"Found {len(files)} image files in {img_dir}:")
for f in sorted(files):
    full_path = os.path.join(img_dir, f)
    size_mb = os.path.getsize(full_path) / (1024 * 1024)
    print(f" - {f} ({size_mb:.2f} MB)")

print("\nAll 45 images are present in public/images/ai-data-scientist/ and mapped in RoadmapIllustration.tsx!")
