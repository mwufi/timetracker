import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours === 0 && minutes === 0) {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
  }
  
  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export function toLocalISOString(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000 // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16)
  return localISOTime
}

export function fromLocalISOString(localISOString: string): string {
  const date = new Date(localISOString)
  return date.toISOString()
}
