import { elements } from '@/data'
import { Grid } from '@/components/Grid'
import { Element } from '@/components/Element'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-2xl font-serif font-bold mb-4">Periodic Table</h1>
      <Grid>
        {elements.map((element) => (
          <Element key={element.number} element={element} />
        ))}
      </Grid>
    </div>
  )
}

export default App
