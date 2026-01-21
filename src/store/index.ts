import { create } from 'zustand';
import type { Element } from '@/data';

interface PeriodicTableState {
  selectedElement: Element | null;
  hoveredElement: Element | null;
  highlightedCategory: string | null;
  hoveredCategory: string | null;
  hoveredGroup: number | null;
  hoveredPeriod: number | null;
  selectElement: (element: Element | null) => void;
  setHoveredElement: (element: Element | null) => void;
  setHighlightedCategory: (category: string | null) => void;
  setHoveredCategory: (category: string | null) => void;
  setHoveredGroup: (group: number | null) => void;
  setHoveredPeriod: (period: number | null) => void;
}

export const usePeriodicTableStore = create<PeriodicTableState>((set) => ({
  selectedElement: null,
  hoveredElement: null,
  highlightedCategory: null,
  hoveredCategory: null,
  hoveredGroup: null,
  hoveredPeriod: null,
  selectElement: (element) => set({ selectedElement: element }),
  setHoveredElement: (element) => set({ hoveredElement: element }),
  setHighlightedCategory: (category) => set({ highlightedCategory: category }),
  setHoveredCategory: (category) => set({ hoveredCategory: category }),
  setHoveredGroup: (group) => set({ hoveredGroup: group }),
  setHoveredPeriod: (period) => set({ hoveredPeriod: period }),
}));
