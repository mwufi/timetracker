'use client'

import { cn } from "@/lib/utils"

interface EndButtonProps {
  onEnd: () => void
  size?: 'sm' | 'lg'
}

export function EndButton({ onEnd, size = 'sm' }: EndButtonProps) {
  return (
    <button
      onClick={onEnd}
      className={cn(
        "rounded-md transition-colors bg-primary-foreground/10 hover:bg-primary-foreground/20",
        size === 'sm' ? "px-4 py-2 text-sm" : "px-6 py-3 text-lg"
      )}
    >
      End Session
    </button>
  )
}
