import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Mobile-First: min-h-11 (44px) on mobile for touch targets, h-9 (36px) on desktop
    // Input mode attributes help mobile keyboards show the right layout
    const inputMode = type === 'email' ? 'email' 
      : type === 'tel' ? 'tel' 
      : type === 'number' ? 'numeric'
      : type === 'url' ? 'url'
      : type === 'search' ? 'search'
      : undefined;
    
    return (
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          "flex min-h-11 sm:h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
