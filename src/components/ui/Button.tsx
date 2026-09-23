import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      whatsapp: "bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90",
    }
    const sizes = {
      default: "h-11 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-full px-8 text-lg",
      icon: "h-10 w-10",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
