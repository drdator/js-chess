import { coordsForIndex } from './engine.js';

export const positionFromIndex = (index) => {
  const pos = coordsForIndex(index);
  return { top: `${pos.y / 8 * 100}%`, left: `${pos.x / 8 * 100}%` };
}
