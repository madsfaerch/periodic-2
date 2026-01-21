import { create } from 'zustand';
import type { Element } from '@/data';

interface PeriodicTableState {
  selectedElement: Element | null;
  hoveredElement: Element | null;
  highlightedCategory: string | null;
  selectElement: (element: Element | null) => void;
  setHoveredElement: (element: Element | null) => void;
  setHighlightedCategory: (category: string | null) => void;
}

export const usePeriodicTableStore = create<PeriodicTableState>((set) => ({
  selectedElement: null,
  hoveredElement: null,
  highlightedCategory: null,
  selectElement: (element) => set({ selectedElement: element }),
  setHoveredElement: (element) => set({ hoveredElement: element }),
  setHighlightedCategory: (category) => set({ highlightedCategory: category }),
}));
