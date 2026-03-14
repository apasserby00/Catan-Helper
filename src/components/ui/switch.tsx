import * as SwitchPrimitive from "@radix-ui/react-switch";

export function Switch(props: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className="peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-sand-300 transition-colors data-[state=checked]:bg-moss"
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  );
}
