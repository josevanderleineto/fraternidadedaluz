import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { DeleteForm } from "@/components/admin/delete-form";
import { Pagination } from "@/components/public/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePostAction } from "@/lib/actions/posts";
import { requireUser } from "@/lib/auth/dal";
import { listAllPosts } from "@/lib/services/posts";
import { formatDateTime } from "@/lib/utils";
import type { PostStatus } from "@/lib/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publicações",
  robots: { index: false, follow: false },
};

const statusVariants: Record<
  string,
  "success" | "warning" | "secondary"
> = {
  PUBLISHED: "success",
  SCHEDULED: "warning",
  DRAFT: "secondary",
};

const statusLabels: Record<string, string> = {
  PUBLISHED: "Publicado",
  SCHEDULED: "Agendado",
  DRAFT: "Rascunho",
};

type SearchParams = { page?: string; q?: string; status?: string; ok?: string; erro?: string };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUser();
  const params = await searchParams;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() || "";
  const status = (params.status as PostStatus | "ALL") || "ALL";

  const result = await listAllPosts({ page, perPage: 15, search, status });

  const buildHref = (target: number) => {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (params.status) sp.set("status", params.status);
    if (target > 1) sp.set("page", String(target));
    const qs = sp.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            Publicações
          </h1>
          <p className="text-sm text-slate-500">
            {result.total} publicação(ões) no total.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/novo">
            <Plus className="size-4" />
            Nova publicação
          </Link>
        </Button>
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

      <form className="flex flex-wrap gap-2" action="/admin/posts" method="get">
        <Input
          name="q"
          defaultValue={search}
          placeholder="Buscar por título ou slug…"
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={params.status ?? "ALL"}
          className="h-10 rounded-md border border-brand-200 bg-white px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">Todos os status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="SCHEDULED">Agendado</option>
          <option value="DRAFT">Rascunho</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Categorias</TableHead>
              <TableHead className="hidden lg:table-cell">Atualizada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                  Nenhuma publicação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-brand-950 hover:text-brand-700"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-slate-400">/blog/{post.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[post.status]}>
                      {statusLabels[post.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.categories.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        post.categories.map((c) => (
                          <Badge key={c.id} variant="outline">
                            {c.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                    {formatDateTime(post.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="Editar">
                        <Link href={`/admin/posts/${post.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteForm
                        action={deletePostAction}
                        id={post.id}
                        iconOnly
                        confirmMessage={`Excluir a publicação “${post.title}”?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        buildHref={buildHref}
      />
    </div>
  );
}
