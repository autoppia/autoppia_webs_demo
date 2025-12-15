import * as React from "react"

import { cn } from "@/library/utils"
import { useDynamic } from "@/dynamic/shared"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, id, placeholder, ...props }, ref) => {
    const dyn = useDynamic();
    const dynamicId = id || dyn.v3.id("input");
    const dynamicPlaceholder = placeholder ? dyn.v3.text("search_placeholder", placeholder as string) : undefined;
    const dynamicClass = dyn.v3.class("input", "");
    
    return (
      <>
        {dyn.v1.wrap("input", (
          <input
            id={dynamicId}
            type={type}
            placeholder={dynamicPlaceholder}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className,
              dynamicClass
            )}
            ref={ref}
            {...props}
          />
        ))}
      </>
    )
  }
)
Input.displayName = "Input"

export { Input }
