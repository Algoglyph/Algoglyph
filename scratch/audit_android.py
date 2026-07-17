# -*- coding: utf-8 -*-
import re
import os

ROADMAP_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/roadmapData.ts'))
BLOG_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/blogData.ts'))

def main():
    # Read roadmapData.ts to find all android-development topics
    with open(ROADMAP_DATA_PATH, 'r', encoding='utf-8') as f:
        roadmap_content = f.read()

    # Find the section for android-development
    android_section_start = roadmap_content.find("id: 'android-development'")
    if android_section_start == -1:
        print("Could not find android-development in roadmapData.ts")
        return

    # Extract topics under android-development (between android-development and the next top-level domain)
    # The next top-level domain starts with id: 'game-development' or similar.
    # Let's find the next "id: '" after android-development that is not sub-nodes.
    # Actually, we can search for blogSlug: '...' in the android-development section.
    # Let's extract all occurrences of blogSlug: '...' in the text after android_section_start.
    # Let's find the end of the android-development roadmap. It ends before the next top-level object in the roadmaps array.
    # Let's find the next roadmap object.
    next_roadmap_idx = roadmap_content.find("id: '", android_section_start + 50)
    # Just in case, let's look for the next top-level roadmap (like game-development or product-management)
    # Let's look for "id: 'game-development'" or similar:
    game_idx = roadmap_content.find("id: 'game-development'")
    if game_idx != -1 and game_idx > android_section_start:
        android_text = roadmap_content[android_section_start:game_idx]
    else:
        android_text = roadmap_content[android_section_start:]

    # Find all blogSlugs
    slug_pattern = re.compile(r"blogSlug:\s*['\"]([^'\"]+)['\"]")
    slugs = slug_pattern.findall(android_text)
    # Find names as well
    name_pattern = re.compile(r"name:\s*['\"]([^'\"]+)['\"].*?blogSlug:\s*['\"]([^'\"]+)['\"]", re.DOTALL)
    names_slugs = name_pattern.findall(android_text)
    
    unique_slugs = []
    slug_to_name = {}
    for match in re.finditer(r"name:\s*['\"]([^'\"]+)['\"].*?blogSlug:\s*['\"]([^'\"]+)['\"]", android_text, re.DOTALL):
        name, slug = match.group(1), match.group(2)
        if slug not in slug_to_name:
            unique_slugs.append(slug)
            slug_to_name[slug] = name

    print(f"Found {len(unique_slugs)} unique Android topic slugs in roadmapData.ts.")

    # Read blogData.ts
    with open(BLOG_DATA_PATH, 'r', encoding='utf-8') as f:
        blog_content = f.read()

    real_count = 0
    thin_count = 0
    missing_count = 0
    missing_list = []

    for slug in unique_slugs:
        # Check if slug exists in blogData.ts
        slug_match = f'"slug": "{slug}"'
        slug_match_alt = f"'slug': '{slug}'"
        if slug_match in blog_content or slug_match_alt in blog_content:
            # Check if it has real content (e.g. longer markdown body)
            # Find the position of the slug
            idx = blog_content.find(slug_match)
            if idx == -1:
                idx = blog_content.find(slug_match_alt)
            # Look for markdown content after the slug
            md_start = blog_content.find('"markdown":', idx)
            if md_start != -1:
                # Get some content
                snippet = blog_content[md_start:md_start+300]
                # If it's a thin shell (e.g., just "# Title\n\nContent coming soon...")
                if "coming soon" in snippet.lower() or len(snippet) < 150:
                    thin_count += 1
                    missing_list.append(slug)
                else:
                    real_count += 1
            else:
                thin_count += 1
                missing_list.append(slug)
        else:
            missing_count += 1
            missing_list.append(slug)

    print(f"Status: {real_count} real · {thin_count} thin/templated · {missing_count} completely missing")
    print("\nMissing/Thin Slugs:")
    for slug in missing_list:
        print(f"- {slug} ({slug_to_name.get(slug, 'Unknown')})")

if __name__ == '__main__':
    main()
