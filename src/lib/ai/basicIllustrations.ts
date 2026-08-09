export interface BasicIllustrationPlan {
  intent: 'illustration';
  layout: 'auto';
  elements: Array<Record<string, unknown>>;
}

const plan = (elements: Array<Record<string, unknown>>): BasicIllustrationPlan => ({
  intent: 'illustration',
  layout: 'auto',
  elements,
});

const trianglePlan = (request: string): BasicIllustrationPlan => {
  const rightTriangle = /\bright(?:-angled)?\s+triangle\b/.test(request);
  const points = rightTriangle
    ? [[0, 220], [0, 0], [300, 220], [0, 220]]
    : [[150, 0], [300, 240], [0, 240], [150, 0]];
  return plan([{ type: 'path', id: 'triangle', points, closed: true }]);
};

const semicirclePlan = (): BasicIllustrationPlan => plan([
  {
    type: 'arc',
    id: 'semicircle-arc',
    x: 0,
    y: 0,
    width: 320,
    height: 260,
    startAngle: 180,
    endAngle: 360,
  },
  { type: 'path', id: 'semicircle-diameter', points: [[0, 130], [320, 130]] },
]);

const squarePlan = (): BasicIllustrationPlan => plan([
  { type: 'rectangle', id: 'square', x: 0, y: 0, width: 240, height: 240 },
]);

const rectanglePlan = (): BasicIllustrationPlan => plan([
  { type: 'rectangle', id: 'rectangle', x: 0, y: 0, width: 320, height: 190 },
]);

const circlePlan = (): BasicIllustrationPlan => plan([
  { type: 'ellipse', id: 'circle', x: 0, y: 0, width: 240, height: 240 },
]);

const anglePlan = (request: string): BasicIllustrationPlan => {
  const requestedDegrees = Number(request.match(/\b(\d{1,3})\s*(?:°|degrees?)\b/)?.[1]);
  const degrees = Number.isFinite(requestedDegrees) && requestedDegrees > 0 && requestedDegrees < 180
    ? requestedDegrees
    : 60;
  const radians = degrees * Math.PI / 180;
  const origin = [30, 220];
  const length = 280;
  const upperEnd = [origin[0] + Math.cos(radians) * length, origin[1] - Math.sin(radians) * length];
  return plan([
    { type: 'path', id: 'angle-base', points: [origin, [origin[0] + length, origin[1]]], endArrowhead: 'arrow' },
    { type: 'path', id: 'angle-ray', points: [origin, upperEnd], endArrowhead: 'arrow' },
    {
      type: 'arc',
      id: 'angle-marker',
      x: origin[0] - 55,
      y: origin[1] - 55,
      width: 110,
      height: 110,
      startAngle: -degrees,
      endAngle: 0,
    },
    { type: 'text', x: 100, y: 145, text: `${degrees}°`, fontSize: 18 },
  ]);
};

const numberLinePlan = (): BasicIllustrationPlan => {
  const elements: Array<Record<string, unknown>> = [
    {
      type: 'path',
      id: 'number-line',
      points: [[0, 100], [500, 100]],
      startArrowhead: 'arrow',
      endArrowhead: 'arrow',
    },
  ];
  for (let value = -2; value <= 2; value++) {
    const x = 250 + value * 90;
    elements.push({ type: 'path', id: `tick-${value}`, points: [[x, 86], [x, 114]] });
    elements.push({ type: 'text', x: x - 7, y: 126, text: String(value), fontSize: 16 });
  }
  return plan(elements);
};

const coordinateAxesPlan = (): BasicIllustrationPlan => plan([
  {
    type: 'path',
    id: 'x-axis',
    points: [[0, 220], [500, 220]],
    startArrowhead: 'arrow',
    endArrowhead: 'arrow',
  },
  {
    type: 'path',
    id: 'y-axis',
    points: [[250, 440], [250, 0]],
    startArrowhead: 'arrow',
    endArrowhead: 'arrow',
  },
  { type: 'text', x: 470, y: 235, text: 'x', fontSize: 18 },
  { type: 'text', x: 265, y: 5, text: 'y', fontSize: 18 },
  { type: 'text', x: 260, y: 230, text: '0', fontSize: 15 },
]);

const vennPlan = (): BasicIllustrationPlan => plan([
  { type: 'ellipse', id: 'set-a', x: 0, y: 30, width: 240, height: 220, group: 'venn-a' },
  { type: 'ellipse', id: 'set-b', x: 150, y: 30, width: 240, height: 220, group: 'venn-b' },
  { type: 'text', x: 72, y: 110, text: 'A', fontSize: 22 },
  { type: 'text', x: 298, y: 110, text: 'B', fontSize: 22 },
]);

const isBasicDrawingRequest = (request: string): boolean => {
  const words = request.split(/\s+/).filter(Boolean);
  if (words.length > 16) return false;
  if (/\b(?:what|why|explain|define|calculate|solve|proof|theorem)\b|\?/.test(request)) return false;
  return !/\b(?:architecture|system design|network topology|flowchart|workflow|data flow|graph algorithm|chart|plot)\b/.test(request);
};

/**
 * Deterministic, zero-agent fast path for common geometric illustrations.
 * These plans compile into the same Excalidraw primitives as model responses.
 */
export const createBasicIllustrationPlan = (userRequest: string): BasicIllustrationPlan | null => {
  const request = userRequest.toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/\bsemi[- ]circle\b/g, 'semicircle')
    .replace(/\s+/g, ' ')
    .trim();
  if (!request || !isBasicDrawingRequest(request)) return null;

  const concepts = [
    /\b(?:semi[- ]?circle|semicircle)\b/,
    /\btriangle\b/,
    /\bvenn(?: diagram)?\b/,
    /\b(?:coordinate axes|coordinate plane|cartesian axes|cartesian plane|x[- ]?y axes)\b/,
    /\bnumber line\b/,
    /\bangle\b/,
    /\bsquare\b/,
    /\b(?:rectangle|box)\b/,
    /\bcircle\b/,
  ];
  if (concepts.filter((pattern) => pattern.test(request)).length > 1) return null;

  if (concepts[0].test(request)) return semicirclePlan();
  if (/\btriangle\b/.test(request)) return trianglePlan(request);
  if (/\bvenn(?: diagram)?\b/.test(request)) return vennPlan();
  if (/\b(?:coordinate axes|coordinate plane|cartesian axes|cartesian plane|x[- ]?y axes)\b/.test(request)) {
    return coordinateAxesPlan();
  }
  if (/\bnumber line\b/.test(request)) return numberLinePlan();
  if (/\bangle\b/.test(request)) return anglePlan(request);
  if (/\bsquare\b/.test(request)) return squarePlan();
  if (/\b(?:rectangle|box)\b/.test(request)) return rectanglePlan();
  if (/\bcircle\b/.test(request)) return circlePlan();
  return null;
};
