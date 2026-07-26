import json
import itertools
from difflib import SequenceMatcher

def load_articles():
    all_articles = {}
    try:
        with open('extracted_articles.json', 'r') as f:
            all_articles.update(json.load(f))
    except Exception as e:
        print(f"Error loading extracted_articles.json: {e}")
        
    try:
        with open('articles.json', 'r') as f:
            all_articles.update(json.load(f))
    except Exception as e:
        print(f"Error loading articles.json: {e}")
        
    return all_articles

def check_duplicates():
    articles = load_articles()
    print(f"Total articles found: {len(articles)}")
    
    # Check for exact duplicates
    content_map = {}
    exact_duplicates = []
    
    for key, content in articles.items():
        if content in content_map:
            exact_duplicates.append((key, content_map[content]))
        else:
            content_map[content] = key
            
    if exact_duplicates:
        print("\n--- EXACT DUPLICATES FOUND ---")
        for k1, k2 in exact_duplicates:
            print(f"'{k1}' is an exact duplicate of '{k2}'")
    else:
        print("\nNo exact duplicates found.")

    # Fuzzy check (simplistic)
    print("\n--- CHECKING NEAR DUPLICATES (Similarity > 0.9) ---")
    keys = list(articles.keys())
    near_dups = []
    
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            k1, k2 = keys[i], keys[j]
            c1, c2 = articles[k1], articles[k2]
            
            # fast length check
            if abs(len(c1) - len(c2)) > max(len(c1), len(c2)) * 0.2:
                continue
            
            sim = SequenceMatcher(None, c1, c2).ratio()
            if sim > 0.9:
                near_dups.append((k1, k2, sim))
                
    if near_dups:
        for k1, k2, sim in near_dups:
            print(f"'{k1}' and '{k2}' are {sim*100:.2f}% similar.")
    else:
        print("No near duplicates found.")

if __name__ == "__main__":
    check_duplicates()
