import { Element } from '@/components/Element';
import { ElementDetails } from '@/components/ElementDetails';
import { ElementList } from '@/components/ElementList';
import { Grid } from '@/components/Grid';
import { elements } from '@/data';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { usePeriodicTableStore } from '@/store';
import { useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

function App() {
  useGridNavigation();
  const selectElement = usePeriodicTableStore((s) => s.selectElement);
  const viewMode = usePeriodicTableStore((s) => s.viewMode);
  const setViewMode = usePeriodicTableStore((s) => s.setViewMode);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const symbol = params.get('element');
    const fromUrl = symbol ? elements.find((e) => e.symbol === symbol) : null;
    selectElement(fromUrl ?? elements.find((e) => e.number === 1) ?? null);
  }, [selectElement]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-start gap-6">
        <ElementDetails />
        <Grid>
          {elements.map((element) => (
            <Element key={element.number} element={element} />
          ))}
        </Grid>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden space-y-4">
        <ElementDetails condensed />

        {/* View mode toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="size-3.5" />
              Grid
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="size-3.5" />
              List
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <Grid>
                {elements.map((element) => (
                  <Element key={element.number} element={element} />
                ))}
              </Grid>
            </div>
          </div>
        ) : (
          <ElementList />
        )}
      </div>
    </div>
  );
}

export default App;
