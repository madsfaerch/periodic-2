import { create } from 'zustand';
import type { Element } from '@/data';

interface PeriodicTableState {
  selectedElement: Element | null;
  hoveredElement: Element | null;
  hoveredGroup: number | null;
  hoveredPeriod: number | null;
  activeProperty: string | null;
  viewMode: 'grid' | 'list';
  sortDirection: 'asc' | 'desc';
  selectElement: (element: Element | null) => void;
  setHoveredElement: (element: Element | null) => void;
  setHoveredGroup: (group: number | null) => void;
  setHoveredPeriod: (period: number | null) => void;
  setActiveProperty: (property: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleSortDirection: () => void;
}

export const usePeriodicTableStore = create<PeriodicTableState>((set) => ({
  selectedElement: null,
  hoveredElement: null,
  hoveredGroup: null,
  hoveredPeriod: null,
  activeProperty: null,
  viewMode: 'grid',
  sortDirection: 'asc',
  selectElement: (element) => set({ selectedElement: element }),
  setHoveredElement: (element) => set({ hoveredElement: element }),
  setHoveredGroup: (group) => set({ hoveredGroup: group }),
  setHoveredPeriod: (period) => set({ hoveredPeriod: period }),
  setActiveProperty: (property) => set({ activeProperty: property }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSortDirection: () =>
    set((s) => ({ sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' })),
}));
