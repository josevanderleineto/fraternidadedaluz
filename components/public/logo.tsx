import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Marca da Loja. Não reproduz brasões nem logotipos oficiais da GLEB.
 * Enquanto o administrador não enviar o logotipo oficial, exibimos um símbolo
 * genérico e discreto (luz / fraternidade).
 */
export function Logo({
  logoUrl,
  siteName,
  className,
}: {
  logoUrl?: string | null;
  siteName: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`Logotipo — ${siteName}`}
        width={56}
        height={56}
        className={cn("h-12 w-12 object-contain", className)}
        priority
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 ring-2 ring-gold-500/70",
        className,
      )}
    >
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="6" className="fill-gold-400" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI) / 4;
          const x1 = 24 + Math.cos(angle) * 10;
          const y1 = 24 + Math.sin(angle) * 10;
          const x2 = 24 + Math.cos(angle) * 15;
          const y2 = 24 + Math.sin(angle) * 15;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-gold-400"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </span>
  );
}
