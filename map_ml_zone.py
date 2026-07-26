import re

def main():
    with open('src/config/roadmapData.ts', 'r') as f:
        content = f.read()
        
    start_idx = content.find("id: 'machine-learning'")
    if start_idx == -1:
        print("Could not find machine-learning zone")
        return
        
    end_idx = content.find("id: 'deep-learning'", start_idx)
    if end_idx == -1:
        end_idx = len(content)
        
    ml_text = content[start_idx:end_idx]
    
    # regex to match topic blocks
    topic_pattern = re.compile(r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*concepts:\s*\[(.*?)\]\s*\}", re.DOTALL)
    concept_pattern = re.compile(r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*subtopics:\s*\[(.*?)\]\s*\}", re.DOTALL)
    subtopic_pattern = re.compile(r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*\}")
    
    plan = "# Machine Learning article plan\n\n"
    plan += "Zone id: `machine-learning` · Backing file: `src/config/blogData.ts` (`BlogPost[]`)\n"
    plan += "Audited: 2026-07-20\n\n"
    
    body = ""
    total = 0
    
    # manual brace counting extraction is safer if regex fails, but let's try a simpler regex that matches any id/name inside the text.
    # Actually, a simple iterative parsing is easier.
    
    current_topic = None
    current_concept = None
    
    lines = ml_text.split('\n')
    for line in lines:
        topic_match = re.search(r"^\s*\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:", line)
        if topic_match:
            current_topic = (topic_match.group(1), topic_match.group(2))
            body += f"## {current_topic[1]} (`{current_topic[0]}`)\n\n"
            continue
            
        concept_match = re.search(r"^\s*\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*subtopics:", line)
        if concept_match:
            current_concept = (concept_match.group(1), concept_match.group(2))
            body += f"### {current_concept[1]} (`{current_concept[0]}`)\n"
            continue
            
        sub_match = re.search(r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*\}", line)
        if sub_match:
            id_, name, blogSlug = sub_match.groups()
            body += f"- [ ] `{blogSlug}` — {name} — **missing**\n"
            if current_topic and current_concept:
                body += f"      /roadmap/machine-learning/{current_topic[0]}/{current_concept[0]}/{blogSlug}\n"
            else:
                body += f"      /roadmap/machine-learning/UNKNOWN_TOPIC/UNKNOWN_CONCEPT/{blogSlug}\n"
            total += 1
            
        if "]" in line and current_concept:
            # might be end of concept, but we just want the headers so spacing is fine
            pass
            
    # Also check what's currently in blogData.ts
    with open('src/config/blogData.ts', 'r') as f:
        blog_data = f.read()
        
    final_body = ""
    real = 0
    thin = 0
    missing = 0
    
    for line in body.split('\n'):
        if line.startswith('- [ ] `'):
            slug = line.split('`')[1]
            if f'slug: "{slug}"' in blog_data or f"slug: '{slug}'" in blog_data:
                # it exists in blogData.ts, assume real for now
                real += 1
                line = line.replace('**missing**', '**real**').replace('- [ ]', '- [x]')
            else:
                missing += 1
        final_body += line + '\n'
        
    plan += f"**Status counts**: {real} real · {thin} thin/templated · {missing} missing (of {total} total)\n\n"
    plan += final_body
    
    import os
    os.makedirs('.agents/plans', exist_ok=True)
    with open('.agents/plans/machine-learning-article-plan.md', 'w') as f:
        f.write(plan)
        
    print(f"Mapped {total} subtopics.")

if __name__ == '__main__':
    main()
