import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-greige bg-greige/30 px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors",
        className
      )}
      {...props}
    />
  )
}
export { Badge }
