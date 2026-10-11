import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/admin/post-form";
import { updatePostAction } from "@/lib/actions/posts";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/services/categories";
import { getPostById } from "@/lib/services/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar publicação",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const [post, categories] = await Promise.all([
    getPostById(id),
    listCategories(),
  ]);

  if (!post) notFound();

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
          Editar publicação
        </h1>
      </div>

      <PostForm
        action={updatePostAction.bind(null, post.id)}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          coverImageAlt: post.coverImageAlt,
          keywords: post.keywords,
          status: post.status,
          publishedAt: post.publishedAt ? post.publishedAt.toISOString() : "",
          categoryIds: post.categoryIds,
        }}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
