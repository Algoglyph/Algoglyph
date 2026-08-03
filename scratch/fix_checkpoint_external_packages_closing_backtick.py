print("=== FORCING CLOSING BACKTICK FOR CHECKPOINT-EXTERNAL-PACKAGES ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = "Import specific utility functions (import debounce from 'lodash/debounce') instead of importing entire monolithic libraries."

p1 = text.find(target)
if p1 != -1:
    end_of_line = p1 + len(target)
    # Check if backtick exists after end_of_line
    after = text[end_of_line:end_of_line+10]
    if not after.startswith("`"):
        text = text[:end_of_line] + "`" + text[end_of_line:]
        print("Closing backtick successfully added!")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("SAVED!")
