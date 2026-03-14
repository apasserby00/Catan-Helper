import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border border-white/70 bg-[#fdf8ef] px-5 pb-8 pt-4 shadow-float focus:outline-none",
          className
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-sand-300" />
        {children}
        <DialogPrimitive.Close
          aria-label="Close sheet"
          className="absolute right-4 top-4 rounded-full p-2 text-sand-700 transition hover:bg-sand-100"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;
