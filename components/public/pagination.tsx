import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Paginação acessível com URLs amigáveis (preserva parâmetros de busca/filtro).
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let i = from; i <= to; i += 1) pages.push(i);

  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium transition-colors";

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className={cn(linkClass, "text-brand-900 hover:bg-brand-50")}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, "cursor-not-allowed text-slate-300")}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {from > 1 && (
        <>
          <Link href={buildHref(1)} className={cn(linkClass, "text-brand-900 hover:bg-brand-50")}>
            1
          </Link>
          {from > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            linkClass,
            p === page
              ? "border-brand-900 bg-brand-900 text-white"
              : "text-brand-900 hover:bg-brand-50",
          )}
        >
          {p}
        </Link>
      ))}

      {to < totalPages && (
        <>
          {to < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <Link
            href={buildHref(totalPages)}
            className={cn(linkClass, "text-brand-900 hover:bg-brand-50")}
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className={cn(linkClass, "text-brand-900 hover:bg-brand-50")}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, "cursor-not-allowed text-slate-300")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
