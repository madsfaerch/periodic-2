import { useCallback, useEffect } from 'react';
import { type Element, elements } from '@/data';
import { usePeriodicTableStore } from '@/store';

const elementsByPosition = new Map<string, Element>();
elements.forEach((el) => {
  elementsByPosition.set(`${el.xpos},${el.ypos}`, el);
});

function findNearestElement(
  fromX: number,
  fromY: number,
  dx: number,
  dy: number,
): Element | null {
  // Try direct movement first
  for (let distance = 1; distance <= 18; distance++) {
    const newX = fromX + dx * distance;
    const newY = fromY + dy * distance;
    const element = elementsByPosition.get(`${newX},${newY}`);
    if (element) return element;
  }

  // If moving horizontally and no direct hit, try wrapping to next/prev row
  if (dx !== 0 && dy === 0) {
    const newY = fromY + (dx > 0 ? 1 : -1);
    const startX = dx > 0 ? 1 : 18;
    for (let x = startX; dx > 0 ? x <= 18 : x >= 1; x += dx) {
      const element = elementsByPosition.get(`${x},${newY}`);
      if (element) return element;
    }
  }

  return null;
}

export function useGridNavigation() {
  const { hoveredElement, setHoveredElement, selectElement } =
    usePeriodicTableStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!hoveredElement) return;

      const { xpos, ypos } = hoveredElement;
      let nextElement: Element | null = null;

      switch (event.key) {
        case 'ArrowUp':
          nextElement = findNearestElement(xpos, ypos, 0, -1);
          break;
        case 'ArrowDown':
          nextElement = findNearestElement(xpos, ypos, 0, 1);
          break;
        case 'ArrowLeft':
          nextElement = findNearestElement(xpos, ypos, -1, 0);
          break;
        case 'ArrowRight':
          nextElement = findNearestElement(xpos, ypos, 1, 0);
          break;
        case 'Enter':
        case ' ':
          selectElement(hoveredElement);
          event.preventDefault();
          return;
        default:
          return;
      }

      if (nextElement) {
        event.preventDefault();
        setHoveredElement(nextElement);
        // Focus the element button
        const button = document.querySelector(
          `[data-element="${nextElement.number}"]`,
        ) as HTMLButtonElement | null;
        button?.focus();
      }
    },
    [hoveredElement, setHoveredElement, selectElement],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
