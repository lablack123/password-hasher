/**
 * Inline SVG icons. Built as real DOM nodes so no markup string ever has to be
 * parsed, and every icon inherits its colour from `currentColor`.
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * @param {string} viewBox
 * @param {SVGElement[]} children
 * @param {number} size
 * @returns {SVGSVGElement}
 */
function buildIcon(viewBox, children, size) {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  children.forEach((child) => svg.appendChild(child));
  return svg;
}

/**
 * @param {'circle'|'path'} tag
 * @param {Record<string, string|number>} attributes
 * @returns {SVGElement}
 */
function shape(tag, attributes) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

/** Puffy circles that union into one fluffy cloud. */
const CLOUD_PUFFS = [
  [8.4, 14.2, 4.5],
  [13.6, 12.4, 5.4],
  [17.8, 15.4, 3.5],
  [12.2, 16.8, 3.9],
  [7.6, 17.2, 3.3],
];

/**
 * @param {number} [size]
 * @returns {SVGSVGElement}
 */
export function cloudIcon(size = 22) {
  const puffs = CLOUD_PUFFS.map(([cx, cy, r]) =>
    shape('circle', { cx, cy, r, fill: 'currentColor' })
  );

  return buildIcon('0 0 24 24', puffs, size);
}

/**
 * @param {number} [size]
 * @returns {SVGSVGElement}
 */
export function checkIcon(size = 16) {
  return buildIcon(
    '0 0 24 24',
    [
      shape('path', {
        d: 'M4.8 12.6 10 17.8 19.4 6.6',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ],
    size
  );
}

/**
 * @param {number} [size]
 * @returns {SVGSVGElement}
 */
export function alertIcon(size = 20) {
  return buildIcon(
    '0 0 24 24',
    [
      shape('circle', {
        cx: 12,
        cy: 12,
        r: 9,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
      }),
      shape('path', {
        d: 'M12 7.4v5.4',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2.2,
        'stroke-linecap': 'round',
      }),
      shape('circle', { cx: 12, cy: 16.6, r: 1.2, fill: 'currentColor' }),
    ],
    size
  );
}

/**
 * @param {number} [size]
 * @returns {SVGSVGElement}
 */
export function spinnerIcon(size = 16) {
  return buildIcon(
    '0 0 24 24',
    [
      shape('path', {
        d: 'M12 3.4a8.6 8.6 0 1 0 8.6 8.6',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2.6,
        'stroke-linecap': 'round',
      }),
    ],
    size
  );
}

/**
 * @param {number} [size]
 * @returns {SVGSVGElement}
 */
export function keyIcon(size = 20) {
  return buildIcon(
    '0 0 24 24',
    [
      shape('circle', {
        cx: 8.4,
        cy: 8.4,
        r: 4.6,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
      }),
      shape('path', {
        d: 'M11.7 11.7 20 20M17 17l-2.2 2.2M14.4 14.4l-1.7 1.7',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ],
    size
  );
}
