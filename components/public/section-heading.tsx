import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
        {title}
      </h2>
      <div
        className={cn("mt-4 h-0.5 w-16 bg-gold-500", align === "center" && "mx-auto")}
      />
      {description && (
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}
