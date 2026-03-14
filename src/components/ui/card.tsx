import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[2rem] border border-white/60 bg-white/78 p-5 shadow-float backdrop-blur", className)}
      {...props}
    />
  );
}
