import re

print("=== FIXING MISSING CLOSING BACKTICK IN CSS-LAYOUTS ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

p_css = content.find("slug: 'css-layouts'")
if p_css != -1:
    p_checkpoint = content.find("slug: 'checkpoint-static'", p_css)
    if p_checkpoint != -1:
        # Inspect between p_css and p_checkpoint
        block = content[p_css:p_checkpoint]
        # Find `markdown: `
        p_md = block.find("markdown: `")
        if p_md != -1:
            # Check if block has closing backtick before `  },`
            p_close = block.rfind("`,")
            if p_close == -1 or p_close < p_md:
                # Add closing backtick before `  },`
                p_entry_end = block.rfind("  },")
                new_block = block[:p_entry_end].rstrip() + "`\n  },\n"
                content = content[:p_css] + new_block + content[p_checkpoint:]
                print("Added missing closing backtick to css-layouts!")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("FIX COMPLETE!")
