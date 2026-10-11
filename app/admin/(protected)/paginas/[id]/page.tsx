import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageForm } from "@/components/admin/page-form";
import { updatePageAction } from "@/lib/actions/pages";
import { requireUser } from "@/lib/auth/dal";
import { getPageById } from "@/lib/services/pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar página",
  robots: { index: false, follow: false },
};

export default async function EditPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const page = await getPageById(id);

  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/paginas"
          className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para páginas
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-brand-950">
          Editar página
        </h1>
      </div>

      <PageForm
        action={updatePageAction.bind(null, page.id)}
        initial={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          published: page.published,
          showInMenu: page.showInMenu,
          menuOrder: page.menuOrder,
        }}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
