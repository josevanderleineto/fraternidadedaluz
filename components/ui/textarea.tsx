import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-brand-200 bg-white px-3 py-2 text-sm text-brand-950 shadow-sm transition-colors",
        "placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
