'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

const messages = [
  "Did the cat eat your sessions? 🐱",
  "As empty as my coffee cup at 3 AM ☕",
  "Houston, we have no sessions 🚀",
  "Looks like your sessions took a vacation 🏖️",
  "Nothing to see here... literally 👀",
  "This space is emptier than my wallet 💸",
  "Sessions playing hide and seek? 🙈",
  "Time to make some memories! ⏰",
  "404: Sessions not found 🔍",
  "Even my pet rock has more activity 🪨"
]

interface EmptyStateProps {
  className?: string
  message?: string
  showImage?: boolean
}

export function EmptyState({ 
  className,
  message = messages[Math.floor(Math.random() * messages.length)],
  showImage = true
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      {showImage && (
        <div className="relative w-48 h-48 mb-4">
          <Image
            src="/empty.png"
            alt="Empty state illustration"
            fill
            className="object-contain"
          />
        </div>
      )}
      <p className="text-lg font-medium text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
