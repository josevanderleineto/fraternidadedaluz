import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageForm } from "@/components/admin/page-form";
import { createPageAction } from "@/lib/actions/pages";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nova página",
  robots: { index: false, follow: false },
};

export default async function NewPageRoute() {
  await requireUser();

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
          Nova página
        </h1>
      </div>

      <PageForm action={createPageAction} submitLabel="Criar página" />
    </div>
  );
}
