import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { usePeriodicTableStore } from '@/store';

export function CategorySelector() {
  const { highlightedCategory, setHighlightedCategory } =
    usePeriodicTableStore();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = highlightedCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              setHighlightedCategory(isActive ? null : category.id)
            }
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              'border border-transparent',
              'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              {
                'ring-2 ring-ring': isActive,
                'opacity-70 hover:opacity-100': !isActive,
              },
            )}
            style={{
              backgroundColor: category.color,
              color: '#1a1a1a',
            }}
            aria-pressed={isActive}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
