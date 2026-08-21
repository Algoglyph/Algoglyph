const removeStructuralTrailingCommas = (source: string): string => {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      result += character;
      continue;
    }
    if (character === ',') {
      let nextIndex = index + 1;
      while (/\s/.test(source[nextIndex] || '')) nextIndex += 1;
      if (source[nextIndex] === '}' || source[nextIndex] === ']') continue;
    }
    result += character;
  }

  return result;
};

/** Pull the first JSON object out of a model response. */
export const extractJsonObject = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('The model did not return a JSON object.');
  }
  const json = source.slice(start, end + 1);
  try {
    return JSON.parse(json);
  } catch (strictError) {
    const repaired = removeStructuralTrailingCommas(json);
    if (repaired === json) throw strictError;
    return JSON.parse(repaired);
  }
};
