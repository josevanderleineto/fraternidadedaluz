import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/admin/post-form";
import { createPostAction } from "@/lib/actions/posts";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/services/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nova publicação",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  await requireUser();
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para publicações
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-brand-950">
          Nova publicação
        </h1>
      </div>

      <PostForm
        action={createPostAction}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        submitLabel="Criar publicação"
      />
    </div>
  );
}
