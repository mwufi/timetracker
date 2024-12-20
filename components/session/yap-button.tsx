'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const REACTIONS = ["🔥", "💪", "👏", "🎉", "❤️"]

interface YapButtonProps {
  onReaction?: (emoji: string) => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'lg'
}

export function YapButton({ 
  onReaction,
  variant = 'primary',
  size = 'sm'
}: YapButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleReaction = (emoji: string) => {
    onReaction?.(emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "rounded-md transition-colors font-medium",
            size === 'sm' ? "px-4 py-2 text-sm" : "px-6 py-3 text-lg",
            variant === 'primary' 
              ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
              : "bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
          )}
        >
          Yap!
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2">
        <div className="flex gap-2">
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
