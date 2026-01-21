export interface Category {
  id: string;
  name: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'alkali metal', name: 'Alkali Metals', color: '#f87171' },
  {
    id: 'alkaline earth metal',
    name: 'Alkaline Earth Metals',
    color: '#fb923c',
  },
  { id: 'transition metal', name: 'Transition Metals', color: '#fbbf24' },
  {
    id: 'post-transition metal',
    name: 'Post-transition Metals',
    color: '#a3e635',
  },
  { id: 'metalloid', name: 'Metalloids', color: '#4ade80' },
  { id: 'diatomic nonmetal', name: 'Diatomic Nonmetals', color: '#2dd4bf' },
  { id: 'polyatomic nonmetal', name: 'Polyatomic Nonmetals', color: '#22d3ee' },
  { id: 'noble gas', name: 'Noble Gases', color: '#60a5fa' },
  { id: 'lanthanide', name: 'Lanthanides', color: '#a78bfa' },
  { id: 'actinide', name: 'Actinides', color: '#e879f9' },
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
