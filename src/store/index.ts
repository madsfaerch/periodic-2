import { create } from 'zustand';
import type { Element } from '@/data';

interface PeriodicTableState {
  selectedElement: Element | null;
  hoveredElement: Element | null;
  hoveredGroup: number | null;
  hoveredPeriod: number | null;
  activeProperty: string | null;
  highlightedCategory: string | null;
  viewMode: 'grid' | 'list';
  sortDirection: 'asc' | 'desc';
  selectElement: (element: Element | null) => void;
  setHoveredElement: (element: Element | null) => void;
  setHoveredGroup: (group: number | null) => void;
  setHoveredPeriod: (period: number | null) => void;
  setActiveProperty: (property: string | null) => void;
  setHighlightedCategory: (category: string | null) => void;
  setHoveredCategory: (category: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleSortDirection: () => void;
}

export const usePeriodicTableStore = create<PeriodicTableState>((set) => ({
  selectedElement: null,
  hoveredElement: null,
  hoveredGroup: null,
  hoveredPeriod: null,
  activeProperty: null,
  highlightedCategory: null,
  viewMode: 'grid',
  sortDirection: 'asc',
  selectElement: (element) => {
    set({ selectedElement: element });
    const url = new URL(window.location.href);
    if (element) {
      url.searchParams.set('element', element.symbol);
    } else {
      url.searchParams.delete('element');
    }
    window.history.replaceState(null, '', url.toString());
  },
  setHoveredElement: (element) => set({ hoveredElement: element }),
  setHoveredGroup: (group) => set({ hoveredGroup: group }),
  setHoveredPeriod: (period) => set({ hoveredPeriod: period }),
  setActiveProperty: (property) => set({ activeProperty: property }),
  setHighlightedCategory: (category) => set({ highlightedCategory: category }),
  setHoveredCategory: (_category) => {},
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSortDirection: () =>
    set((s) => ({ sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' })),
}));
