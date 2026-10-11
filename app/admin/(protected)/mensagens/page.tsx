import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { listMessages } from "@/lib/services/contact";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mensagens",
  robots: { index: false, follow: false },
};

const filters = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Não lidas" },
  { value: "replied", label: "Respondidas" },
] as const;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string; ok?: string; erro?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const filter = (
    ["all", "unread", "replied"].includes(params.filter ?? "")
      ? params.filter
      : "all"
  ) as "all" | "unread" | "replied";

  const result = await listMessages({ page, perPage: 20, filter });

  const buildHref = (target: number, targetFilter = filter) => {
    const sp = new URLSearchParams();
    if (targetFilter !== "all") sp.set("filter", targetFilter);
    if (target > 1) sp.set("page", String(target));
    const qs = sp.toString();
    return qs ? `/admin/mensagens?${qs}` : "/admin/mensagens";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-950">
          Mensagens
        </h1>
        <p className="text-sm text-slate-500">
          {result.total} mensagem(ns) recebida(s) pelo formulário de contato.
        </p>
      </div>

      {params.ok && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Operação realizada com sucesso.
        </div>
      )}
      {params.erro && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível concluir a operação.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link
            key={item.value}
            href={buildHref(1, item.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              filter === item.value
                ? "border-brand-900 bg-brand-900 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
        {result.items.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Nenhuma mensagem encontrada.
          </p>
        ) : (
          result.items.map((message) => (
            <Link
              key={message.id}
              href={`/admin/mensagens/${message.id}`}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-brand-950",
                      !message.isRead && "font-semibold",
                    )}
                  >
                    {message.subject}
                  </p>
                  {!message.isRead && <Badge variant="gold">Nova</Badge>}
                  {message.isReplied && (
                    <Badge variant="success">Respondida</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-slate-500">
                  {message.name} · {message.email}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {formatDateTime(message.createdAt)}
              </span>
            </Link>
          ))
        )}
      </div>

      {result.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Button
                key={p}
                asChild
                variant={p === result.page ? "default" : "outline"}
                size="sm"
              >
                <Link href={buildHref(p)}>{p}</Link>
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
