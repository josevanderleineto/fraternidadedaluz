import type { Metadata } from "next";
import Link from "next/link";
import { Search, Tag } from "lucide-react";

import { Pagination } from "@/components/public/pagination";
import { PostCard } from "@/components/public/post-card";
import { SectionHeading } from "@/components/public/section-heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listPublishedPosts } from "@/lib/services/posts";
import { listCategories } from "@/lib/services/categories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notícias e Blog",
  description:
    "Acompanhe as notícias, publicações e comunicados da Loja Fraternidade da Luz nº 181.",
};

type SearchParams = {
  page?: string;
  q?: string;
  categoria?: string;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() || "";
  const categorySlug = params.categoria?.trim() || "";

  const [posts, categories] = await Promise.all([
    listPublishedPosts({ page, perPage: 9, search, categorySlug }).catch(() => ({
      items: [],
      total: 0,
      page,
      perPage: 9,
      totalPages: 1,
    })),
    listCategories().catch(() => []),
  ]);

  const buildHref = (targetPage: number) => {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (categorySlug) sp.set("categoria", categorySlug);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Comunicação"
            title="Notícias e publicações"
            description="Acompanhe as atividades, comunicados e novidades da nossa Loja."
          />
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {/* Busca */}
            <form action="/blog" method="get" className="mb-8 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder="Pesquisar por título ou conteúdo…"
                  className="pl-9"
                  aria-label="Pesquisar publicações"
                />
              </div>
              {categorySlug && (
                <input type="hidden" name="categoria" value={categorySlug} />
              )}
              <Button type="submit">Pesquisar</Button>
            </form>

            {(search || categorySlug) && (
              <p className="mb-6 text-sm text-slate-500">
                {posts.total} resultado(s)
                {search ? ` para “${search}”` : ""}
                {categorySlug ? ` na categoria “${categorySlug}”` : ""}.{" "}
                <Link href="/blog" className="text-brand-700 underline">
                  Limpar filtros
                </Link>
              </p>
            )}

            {posts.items.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.items.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                <Pagination
                  page={posts.page}
                  totalPages={posts.totalPages}
                  buildHref={buildHref}
                />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <p className="font-medium text-brand-950">
                  Nenhuma publicação encontrada.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tente outro termo de busca ou selecione outra categoria.
                </p>
              </div>
            )}
          </div>

          {/* Barra lateral */}
          <aside className="space-y-8">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-950">
                <Tag className="size-4 text-gold-600" />
                Categorias
              </h2>
              <ul className="mt-4 space-y-1">
                <li>
                  <Link
                    href="/blog"
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      !categorySlug
                        ? "bg-brand-50 font-medium text-brand-900"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    Todas as publicações
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog?categoria=${cat.slug}`}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                        categorySlug === cat.slug
                          ? "bg-brand-50 font-medium text-brand-900"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400">
                        {cat.postCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
