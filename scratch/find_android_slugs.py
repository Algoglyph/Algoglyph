# -*- coding: utf-8 -*-
import re
import os

ROADMAP_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/roadmapData.ts'))
BLOG_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/blogData.ts'))

def main():
    with open(ROADMAP_DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find boundaries
    start_idx = content.find("id: 'android-development',")
    if start_idx == -1:
        print("Error: Could not find android-development section start.")
        return

    # Find the next top level array item, which starts at line 1661: id: 'system-design'
    end_idx = content.find("id: 'system-design',", start_idx)
    if end_idx == -1:
        print("Error: Could not find system-design section.")
        return

    android_section = content[start_idx:end_idx]

    # Find all blogSlugs
    slug_pattern = re.compile(r"blogSlug:\s*['\"]([^'\"]+)['\"]")
    slugs = slug_pattern.findall(android_section)

    # Get unique slugs and names
    unique_slugs = []
    slug_to_name = {}
    for match in re.finditer(r"name:\s*['\"]([^'\"]+)['\"].*?blogSlug:\s*['\"]([^'\"]+)['\"]", android_section, re.DOTALL):
        name, slug = match.group(1), match.group(2)
        if slug not in slug_to_name:
            unique_slugs.append(slug)
            slug_to_name[slug] = name

    print(f"Total Unique Android Slugs: {len(unique_slugs)}")

    with open(BLOG_DATA_PATH, 'r', encoding='utf-8') as f:
        blog_content = f.read()

    real_articles = []
    thin_articles = []
    missing_articles = []

    for slug in unique_slugs:
        slug_match = f'"slug": "{slug}"'
        slug_match_alt = f"'slug': '{slug}'"
        if slug_match in blog_content or slug_match_alt in blog_content:
            idx = blog_content.find(slug_match)
            if idx == -1:
                idx = blog_content.find(slug_match_alt)
            # Find markdown content
            md_start = blog_content.find('"markdown":', idx)
            if md_start != -1:
                snippet = blog_content[md_start:md_start+300]
                if "coming soon" in snippet.lower() or len(snippet) < 150:
                    thin_articles.append(slug)
                else:
                    real_articles.append(slug)
            else:
                thin_articles.append(slug)
        else:
            missing_articles.append(slug)

    print(f"\nReal Articles ({len(real_articles)}):")
    for s in real_articles:
        print(f"  - {s} ({slug_to_name[s]})")

    print(f"\nThin Articles ({len(thin_articles)}):")
    for s in thin_articles:
        print(f"  - {s} ({slug_to_name[s]})")

    print(f"\nMissing Articles ({len(missing_articles)}):")
    for s in missing_articles:
        print(f"  - {s} ({slug_to_name[s]})")

if __name__ == '__main__':
    main()
