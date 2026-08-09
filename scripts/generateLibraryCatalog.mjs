import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const librariesDirectory = new URL('../public/libraries/', import.meta.url);
const libraryIndex = JSON.parse(readFileSync(new URL('../src/config/librariesIndex.json', import.meta.url), 'utf8'));
const libraryNames = new Map(libraryIndex.map((entry) => [entry.id, entry.name]));

const elementBounds = (element) => {
  const x = Number.isFinite(element.x) ? element.x : 0;
  const y = Number.isFinite(element.y) ? element.y : 0;
  const points = Array.isArray(element.points)
    ? element.points.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]))
    : [];
  const xs = [x, x + (Number.isFinite(element.width) ? element.width : 0), ...points.map((point) => x + point[0])];
  const ys = [y, y + (Number.isFinite(element.height) ? element.height : 0), ...points.map((point) => y + point[1])];
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

const catalog = [];
for (const filename of readdirSync(librariesDirectory).filter((name) => name.endsWith('.json') && name !== 'catalog.json').sort()) {
  const libraryId = basename(filename, '.json');
  const items = JSON.parse(readFileSync(new URL(filename, librariesDirectory), 'utf8'));
  for (const item of items) {
    const bounds = item.elements.reduce(
      (result, element) => {
        const box = elementBounds(element);
        return {
          minX: Math.min(result.minX, box.minX),
          minY: Math.min(result.minY, box.minY),
          maxX: Math.max(result.maxX, box.maxX),
          maxY: Math.max(result.maxY, box.maxY),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    const width = Number.isFinite(bounds.maxX - bounds.minX) ? Math.max(20, bounds.maxX - bounds.minX) : 160;
    const height = Number.isFinite(bounds.maxY - bounds.minY) ? Math.max(20, bounds.maxY - bounds.minY) : 100;
    catalog.push({
      source: 'static',
      libraryId,
      libraryName: libraryNames.get(libraryId) || libraryId,
      itemId: item.id,
      name: item.name,
      description: item.description || '',
      commands: Array.isArray(item.commands) ? item.commands : [],
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
      hasText: item.elements.some((element) => element.type === 'text' && String(element.text || '').trim()),
      elementCount: item.elements.length,
    });
  }
}

const output = `${JSON.stringify(catalog)}\n`;
writeFileSync(new URL('../public/libraries/catalog.json', import.meta.url), output, 'utf8');
console.log(`Generated public/libraries/catalog.json with ${catalog.length} library items.`);
