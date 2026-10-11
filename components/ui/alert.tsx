import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-y-0.5 flex gap-3 items-start",
  {
    variants: {
      variant: {
        default: "bg-brand-50 border-brand-200 text-brand-900",
        info: "bg-sky-50 border-sky-200 text-sky-900",
        success: "bg-emerald-50 border-emerald-200 text-emerald-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        destructive: "bg-red-50 border-red-200 text-red-900",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Alert, alertVariants };
