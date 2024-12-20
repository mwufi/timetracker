'use client'

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Check, X, Globe } from "lucide-react"

interface EditableTitleProps {
  title: string
  onUpdate?: (newTitle: string) => void
  isUniverseVariant?: boolean
}

export function EditableTitle({ 
  title, 
  onUpdate,
  isUniverseVariant 
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (onUpdate) {
      setIsEditing(true)
      setEditValue(title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleSave = () => {
    if (editValue.trim() !== title && onUpdate) {
      onUpdate(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(title)
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-10 text-2xl font-semibold",
            isUniverseVariant
              ? "bg-secondary-foreground/10 border-secondary-foreground/20"
              : "bg-primary-foreground/10 border-primary-foreground/20"
          )}
        />
        <button 
          onClick={handleSave}
          className={cn(
            "p-2 rounded-full transition-colors",
            isUniverseVariant
              ? "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
              : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          )}
        >
          <Check size={20} />
        </button>
        <button 
          onClick={handleCancel}
          className={cn(
            "p-2 rounded-full transition-colors",
            isUniverseVariant
              ? "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
              : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          )}
        >
          <X size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {isUniverseVariant && <Globe size={20} className={cn(
        isUniverseVariant ? "text-secondary-foreground/70" : "text-primary-foreground/70"
      )} />}
      <h2 
        className={cn(
          "text-2xl font-semibold cursor-pointer transition-colors",
          isUniverseVariant
            ? "hover:text-secondary-foreground/90"
            : "hover:text-primary-foreground/90"
        )}
        onDoubleClick={handleDoubleClick}
      >
        {title}
      </h2>
    </div>
  )
}
