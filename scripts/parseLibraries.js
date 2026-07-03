import fs from 'fs';
import path from 'path';

// Converts the raw *.excalidrawlib downloads in /excalidraw-libraries into
// lightweight per-library JSON files under /public/libraries plus a single
// /src/config/librariesIndex.json the StructuresPanel dropdown reads.
//
// Re-run with: node scripts/parseLibraries.js  (idempotent).

const libDir = path.join(process.cwd(), 'excalidraw-libraries');
const publicLibDir = path.join(process.cwd(), 'public', 'libraries');
const indexOutPath = path.join(process.cwd(), 'src', 'config', 'librariesIndex.json');

if (!fs.existsSync(publicLibDir)) {
  fs.mkdirSync(publicLibDir, { recursive: true });
}

const files = fs
  .readdirSync(libDir)
  .filter((f) => f.endsWith('.excalidrawlib'))
  // Process canonical names before their " (1)" duplicate downloads.
  .sort();

const librariesIndex = [];
const seen = new Set();

for (const file of files) {
  // Normalise the display name: strip extension, "(1)" suffixes and Title-Case.
  let name = file.replace('.excalidrawlib', '').replace(/\(\d+\)/, '').replace(/[-_]/g, ' ').trim();
  name = name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const libraryId = name.toLowerCase().replace(/\s+/g, '-');

  // De-duplicate: the same library downloaded twice ("foo" + "foo (1)")
  // collapses to one id — keep the first, skip the rest.
  if (seen.has(libraryId)) continue;

  let data;
  try {
    data = JSON.parse(fs.readFileSync(path.join(libDir, file), 'utf-8'));
  } catch (e) {
    console.error(`Skipped ${file}: ${e.message}`);
    continue;
  }

  const items = data.libraryItems || data.library || [];
  const parsedItems = items
    .map((item, index) => {
      const isArray = Array.isArray(item);
      const elements = isArray ? item : item.elements || [];
      if (!elements.length) return null;
      const itemName = (!isArray && item.name) || `${name} ${index + 1}`;
      const id = (!isArray && item.id) || `${libraryId}-${index}`;
      
      // Try to extract text elements to form a meaningful description
      const textContents = elements
        .filter(e => e.type === 'text' && e.text)
        .map(e => e.text.trim().replace(/\s+/g, ' '));
        
      let description = textContents.join(', ');
      
      // If no text inside the elements, fall back to a generic description
      if (!description) {
        // Try to generate a generic description based on the name
        description = `${name} element.`;
      } else if (description.length > 80) {
        // Cap the description length
        description = description.substring(0, 77) + '...';
      }

      // Default command tag
      const commands = [libraryId.split('-')[0]];
      
      return { id, name: itemName, description, commands, elements };
    })
    .filter(Boolean);

  if (!parsedItems.length) continue;

  fs.writeFileSync(path.join(publicLibDir, `${libraryId}.json`), JSON.stringify(parsedItems));
  librariesIndex.push({ id: libraryId, name, itemCount: parsedItems.length });
  seen.add(libraryId);
}

// Alphabetical so the dropdown reads predictably.
librariesIndex.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(indexOutPath, JSON.stringify(librariesIndex, null, 2));
console.log(`Generated librariesIndex.json with ${librariesIndex.length} libraries.`);
