<<<<<<< HEAD
"use client";

=======
>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
import * as React from "react";

import { cn } from "@/library/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
<<<<<<< HEAD
    className={cn(
      "rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm",
      className
    )}
=======
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
<<<<<<< HEAD
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
=======
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
<<<<<<< HEAD
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
=======
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

<<<<<<< HEAD
=======
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
<<<<<<< HEAD
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardContent };
=======
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

>>>>>>> 31e453b2a7fff6f13b2d82852e125958cc9babd2
