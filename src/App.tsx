import { CategorySelector } from '@/components/CategorySelector';
import { Element } from '@/components/Element';
import { ElementDetails } from '@/components/ElementDetails';
import { Grid } from '@/components/Grid';
import { elements } from '@/data';
import { useGridNavigation } from '@/hooks/useGridNavigation';
import { usePeriodicTableStore } from '@/store';
import { useEffect } from 'react';

function App() {
  useGridNavigation();
  const selectElement = usePeriodicTableStore((s) => s.selectElement);

  useEffect(() => {
    const hydrogen = elements.find((e) => e.number === 1);
    if (hydrogen) selectElement(hydrogen);
  }, [selectElement]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <CategorySelector />
      <div className="mt-4 flex items-start gap-6">
        <ElementDetails />
        <Grid>
          {elements.map((element) => (
            <Element key={element.number} element={element} />
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default App;
