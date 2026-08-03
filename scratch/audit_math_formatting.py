import re

def audit_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find raw \mathbf or \text or \mathcal that are NOT preceded by $
    # or find paragraphs with odd number of $ signs
    print(f"Auditing {filepath}...")

    # Let's fix p-vs-np-class-limits specifically in blogData.ts
    if "blogData.ts" in filepath:
        # Check p-vs-np-class-limits
        pattern = r'"slug":\s*"p-vs-np-class-limits"[\s\S]*?"markdown":\s*"([\s\S]*?)"\s*,\s*"title"'
        match = re.search(pattern, content)
        if match:
            md = match.group(1)
            # Check for \mathbf{NP} without $
            print("Found p-vs-np-class-limits markdown.")
            
            # Replace raw \mathbf{NP} with $\mathbf{NP}$
            # Replace raw \mathbf{P} with $\mathbf{P}$
            # Fix any unescaped \mathbf{NP} is the class -> $\mathbf{NP}$ is the class
            new_md = md.replace("\\mathbf{NP} is the class", "$\\mathbf{NP}$ is the class")
            new_md = new_md.replace("\\mathbf{P} is the class", "$\\mathbf{P}$ is the class")
            new_md = new_md.replace("\\mathbf{coNP} = ", "$$\\mathbf{coNP} = ")
            
            if new_md != md:
                content = content.replace(md, new_md)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print("Successfully repaired math formatting in p-vs-np-class-limits in blogData.ts!")

audit_file("src/config/blogData.ts")
