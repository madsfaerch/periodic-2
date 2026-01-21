import type { Element as ElementType } from '@/data'
import { cn } from '@/lib/utils'

interface ElementProps {
  element: ElementType
  className?: string
}

export function Element({ element, className }: ElementProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-1 aspect-square rounded-sm',
        'bg-muted hover:bg-accent transition-colors cursor-pointer',
        className
      )}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
      }}
    >
      <span className="text-[0.6rem] text-muted-foreground">{element.number}</span>
      <span className="text-sm font-semibold">{element.symbol}</span>
      <span className="text-[0.5rem] text-muted-foreground truncate max-w-full">{element.name}</span>
    </div>
  )
}
