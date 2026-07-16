import re
import json

from fix_backticks import SOURCES_CONTENT, CONSIDERATIONS_CONTENT

with open("src/config/deBlogData.ts", "r") as f:
    content = f.read()

# Since I used r"" and manually added backslashes to backticks in the original string (e.g. \`GET /user\`),
# they are literally `\` followed by `\``. We want to remove the backslash before `json.dumps()` 
# because json.dumps will handle it as a regular string.
safe_sources = json.dumps(SOURCES_CONTENT.replace("\\`", "`").strip())
safe_cons = json.dumps(CONSIDERATIONS_CONTENT.replace("\\`", "`").strip())

# The original file has empty strings like 'de-gen-sources': '',
pattern_sources = re.compile(r"('de-gen-sources':\s*)['\"`].*?['\"`](,)", re.DOTALL)
content = pattern_sources.sub(lambda m: f"{m.group(1)}{safe_sources}{m.group(2)}", content)

pattern_cons = re.compile(r"('de-gen-considerations':\s*)['\"`].*?['\"`](,)", re.DOTALL)
content = pattern_cons.sub(lambda m: f"{m.group(1)}{safe_cons}{m.group(2)}", content)

with open("src/config/deBlogData.ts", "w") as f:
    f.write(content)

print("Fixed with json.dumps!")
