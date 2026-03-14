import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-sand-300 bg-white px-4 py-2 text-sm text-ink outline-none transition focus:border-sand-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
