import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { categories } from '@/data/categories';
import { cn } from '@/lib/utils';
import { usePeriodicTableStore } from '@/store';

export function CategorySelector() {
  const { highlightedCategory, setHighlightedCategory } =
    usePeriodicTableStore();

  return (
    <TooltipProvider>
      <ToggleGroup
        type="single"
        value={highlightedCategory ?? ''}
        onValueChange={(value) => setHighlightedCategory(value || null)}
        variant="outline"
      >
        {categories.map((category) => {
          const isActive = highlightedCategory === category.id;
          const Icon = category.icon;

          return (
            <Tooltip key={category.id}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={category.id}
                  aria-label={category.name}
                  className={cn('transition-colors', 'hover:text-neutral-900', {
                    'text-neutral-900': isActive,
                  })}
                  style={{
                    backgroundColor: isActive ? category.color : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = category.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <Icon className="size-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom">{category.name}</TooltipContent>
            </Tooltip>
          );
        })}
      </ToggleGroup>
    </TooltipProvider>
  );
}
