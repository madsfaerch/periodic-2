import type { LucideIcon } from 'lucide-react';
import {
  Atom,
  Flame,
  Gem,
  Hexagon,
  Layers,
  Orbit,
  Shield,
  Sparkles,
  Triangle,
  Wind,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: 'alkali metal', name: 'Alkali Metals', color: '#f87171', icon: Flame },
  {
    id: 'alkaline earth metal',
    name: 'Alkaline Earth Metals',
    color: '#fb923c',
    icon: Shield,
  },
  {
    id: 'transition metal',
    name: 'Transition Metals',
    color: '#fbbf24',
    icon: Gem,
  },
  {
    id: 'post-transition metal',
    name: 'Post-transition Metals',
    color: '#a3e635',
    icon: Layers,
  },
  { id: 'metalloid', name: 'Metalloids', color: '#4ade80', icon: Hexagon },
  {
    id: 'diatomic nonmetal',
    name: 'Diatomic Nonmetals',
    color: '#2dd4bf',
    icon: Wind,
  },
  {
    id: 'polyatomic nonmetal',
    name: 'Polyatomic Nonmetals',
    color: '#22d3ee',
    icon: Triangle,
  },
  { id: 'noble gas', name: 'Noble Gases', color: '#60a5fa', icon: Sparkles },
  { id: 'lanthanide', name: 'Lanthanides', color: '#a78bfa', icon: Orbit },
  { id: 'actinide', name: 'Actinides', color: '#e879f9', icon: Atom },
];

export const categoryMap = new Map(categories.map((c) => [c.id, c]));

export function getCategoryForElement(
  elementCategory: string,
): Category | null {
  // Direct match
  const directMatch = categoryMap.get(elementCategory);
  if (directMatch) {
    return directMatch;
  }

  // Handle "unknown, predicted to be..." variants
  for (const category of categories) {
    if (elementCategory.includes(category.id)) {
      return category;
    }
  }

  return null;
}
