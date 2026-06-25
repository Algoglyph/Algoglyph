export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = haystack.toLowerCase();
  return q.split(/\s+/).every((term) => text.includes(term));
}
