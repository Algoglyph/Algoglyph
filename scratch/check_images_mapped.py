import os

slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages",
    "react-components", "tailwind-css", "checkpoint-frontend-apps",
    "node-js-runtime", "checkpoint-cli-apps", "postgresql-databases",
    "checkpoint-crud-apps", "restful-api-design", "jwt-authentication",
    "redis-caching", "checkpoint-complete-app", "linux-cli-basics",
    "basic-aws-services", "checkpoint-deployment", "mesh-like-structures",
    "ansible-configuration", "terraform-iac", "checkpoint-automation",
    "checkpoint-infrastructure", "github-actions-cicd", "monit-monitoring",
    "checkpoint-cicd", "checkpoint-monitoring"
]

img_dir = "public/images/full-stack"
existing_files = os.listdir(img_dir)

print(f"=== CHECKING IMAGES MAPPING IN {img_dir} ===")
print(f"Total files in directory: {len(existing_files)}")

mapped = []
missing = []
typos = []

for slug in slugs:
    expected_filename = f"{slug}-dark.png"
    if expected_filename in existing_files:
        mapped.append((slug, expected_filename))
    else:
        similar = [f for f in existing_files if slug in f]
        if similar:
            typos.append((slug, expected_filename, similar[0]))
        else:
            missing.append((slug, expected_filename))

print(f"\n[OK] Perfectly Mapped ({len(mapped)}):")
for slug, filename in mapped:
    print(f"  - {slug} -> {filename}")

if typos:
    print(f"\n[TYPO] Mapped with Typos / Wrong Names ({len(typos)}):")
    for slug, expected, actual in typos:
        print(f"  - {slug} | Expected: {expected} | Actual file: {actual}")

if missing:
    print(f"\n[MISSING] Missing Images ({len(missing)}):")
    for slug, expected in missing:
        print(f"  - {slug} | Expected: {expected}")
