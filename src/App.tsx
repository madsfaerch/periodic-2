import { CategorySelector } from '@/components/CategorySelector';
import { Element } from '@/components/Element';
import { ElementDetails } from '@/components/ElementDetails';
import { Grid } from '@/components/Grid';
import { elements } from '@/data';
import { useGridNavigation } from '@/hooks/useGridNavigation';

function App() {
  useGridNavigation();

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-2xl font-serif font-bold mb-4">Periodic Table</h1>
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
