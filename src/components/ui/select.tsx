import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ children }: { children: ReactNode }) {
  return (
    <SelectPrimitive.Trigger className="flex h-11 w-full items-center justify-between rounded-2xl border border-sand-300 bg-white px-4 text-sm text-ink outline-none focus:border-sand-500">
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-sand-700" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children }: { children: ReactNode }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="z-50 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-float">
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex cursor-default select-none items-center rounded-xl px-8 py-2 text-sm text-ink outline-none data-[highlighted]:bg-sand-100"
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
