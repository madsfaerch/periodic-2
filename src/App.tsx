import { elements } from '@/data'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold">Periodic Table</h1>
      <p className="text-muted-foreground">{elements.length} elements loaded</p>
    </div>
  )
}

export default App
