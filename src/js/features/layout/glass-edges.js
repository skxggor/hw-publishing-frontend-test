/**
 * Progressive blur edges (top & bottom of the viewport).
 *
 * Eight stacked layers with increasing backdrop blur and sliding band masks
 * produce a smooth blur gradient over the content that scrolls beneath the
 * header and the page bottom. Purely decorative: pointer-events disabled, no
 * tint. Visual config per layer is exposed via --glass-blur / --glass-mask.
 */

import Utils from '@core/utils.js';

const BAND = 12.5;
const BLURS = [0.09375, 0.1875, 0.375, 0.75, 1.5, 3, 6, 12];

const buildMask = function buildMask(direction, layer) {
  const stops = [
    `rgba(0,0,0,0) ${layer * BAND}%`,
    `rgb(0,0,0) ${Math.min((layer + 1) * BAND, 100)}%`,
  ];

  if ((layer + 2) * BAND <= 100) {
    stops.push(`rgb(0,0,0) ${(layer + 2) * BAND}%`);
  }

  if ((layer + 3) * BAND <= 100) {
    stops.push(`rgba(0,0,0,0) ${(layer + 3) * BAND}%`);
  }

  return `linear-gradient(${direction}, ${stops.join(', ')})`;
};

const createLayer = function createLayer(blur, mask) {
  const layer = document.createElement('div');

  Utils.addClass(layer, 'glass-edge__layer');
  layer.style.setProperty('--glass-blur', `${blur}px`);
  layer.style.setProperty('--glass-mask', mask);

  return layer;
};

const createEdge = function createEdge(edge) {
  const container = document.createElement('div');
  const direction = edge === 'top' ? 'to top' : 'to bottom';

  Utils.addClass(container, 'glass-edge');
  Utils.addClass(container, edge === 'top' ? 'glass-edge--top' : 'glass-edge--bottom');

  BLURS.forEach(function appendLayer(blur, layer) {
    container.appendChild(createLayer(blur, buildMask(direction, layer)));
  });

  return container;
};

const mountGlassEdges = function mountGlassEdges(scope) {
  const root = scope || document.body;
  const topEdge = createEdge('top');
  const bottomEdge = createEdge('bottom');

  root.append(topEdge, bottomEdge);

  return function cleanup() {
    topEdge.remove();
    bottomEdge.remove();
  };
};

export { mountGlassEdges };
export default mountGlassEdges;
