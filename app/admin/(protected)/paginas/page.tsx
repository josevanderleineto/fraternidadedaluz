import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { DeleteForm } from "@/components/admin/delete-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePageAction } from "@/lib/actions/pages";
import { requireUser } from "@/lib/auth/dal";
import { listAllPages } from "@/lib/services/pages";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Páginas",
  robots: { index: false, follow: false },
};

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const pages = await listAllPages();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-950">
            Páginas institucionais
          </h1>
          <p className="text-sm text-slate-500">
            Edite os textos do site sem alterar o código-fonte.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/paginas/novo">
            <Plus className="size-4" />
            Nova página
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

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Menu</TableHead>
              <TableHead className="hidden lg:table-cell">Atualizada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                  Nenhuma página cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Link
                      href={`/admin/paginas/${page.id}`}
                      className="font-medium text-brand-950 hover:text-brand-700"
                    >
                      {page.title}
                    </Link>
                    <p className="text-xs text-slate-400">/{page.slug}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.published ? "success" : "secondary"}>
                      {page.published ? "Publicada" : "Rascunho"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-500">
                    {page.showInMenu ? `Sim (ordem ${page.menuOrder})` : "Não"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                    {formatDateTime(page.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="Editar"
                      >
                        <Link href={`/admin/paginas/${page.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteForm
                        action={deletePageAction}
                        id={page.id}
                        iconOnly
                        confirmMessage={`Excluir a página “${page.title}”?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
