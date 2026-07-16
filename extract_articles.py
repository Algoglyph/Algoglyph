import json
import re

transcript_path = '/Users/vansh_uni/.gemini/antigravity/brain/9ac0b46d-5632-4fe2-810e-4556bbf70794/.system_generated/logs/transcript_full.jsonl'

extracted_articles = {}

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if not isinstance(content, str):
                continue
                
            # Find all json blocks in the content
            matches = re.finditer(r'```json\n(.*?)\n```', content, re.DOTALL)
            for match in matches:
                try:
                    articles = json.loads(match.group(1))
                    if isinstance(articles, dict):
                        for key, value in articles.items():
                            if key.startswith('de-') and isinstance(value, str) and len(value) > 100:
                                extracted_articles[key] = value
                except json.JSONDecodeError:
                    pass
        except Exception as e:
            pass

print(f"Extracted {len(extracted_articles)} articles: {list(extracted_articles.keys())}")

with open('/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/extracted_articles.json', 'w') as f:
    json.dump(extracted_articles, f)
