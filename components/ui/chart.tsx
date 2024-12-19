"use client"

import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<string, { label: string; color: string }>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <style>
        {Object.entries(config).map(
          ([key, value]) => `
            :root {
              --color-${key}: ${value.color};
            }
          `
        )}
      </style>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4">
        {Object.entries(config).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
