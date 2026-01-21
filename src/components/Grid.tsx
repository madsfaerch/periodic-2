import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
}

export function Grid({ children, className }: GridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-18 gap-0.5',
        className
      )}
    >
      {children}
    </div>
  )
}
