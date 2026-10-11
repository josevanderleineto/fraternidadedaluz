import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag, User } from "lucide-react";

import { RichContent } from "@/components/public/rich-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPublishedPostBySlug,
  listPublishedPosts,
} from "@/lib/services/posts";
import { getSiteSettings } from "@/lib/services/settings";
import { absoluteUrl, formatDate, stripHtml, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);

  if (!post) {
    return { title: "Publicação não encontrada" };
  }

  const description =
    post.excerpt || truncate(stripHtml(post.content), 160);

  return {
    title: post.title,
    description,
    keywords: post.keywords ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: absoluteUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    alternates: { canonical: absoluteUrl(`/blog/${post.slug}`) },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);

  if (!post) notFound();

  const [settings, related] = await Promise.all([
    getSiteSettings(),
    listPublishedPosts({ perPage: 4, categorySlug: post.categories[0]?.slug })
      .catch(() => ({ items: [] })),
  ]);

  const others = related.items.filter((p) => p.id !== post.id).slice(0, 3);
  const publishedDate = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: publishedDate.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImageUrl ?? undefined,
    author: {
      "@type": "Organization",
      name: settings.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };

  return (
    <article className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-brand-700 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voltar para as notícias
      </Link>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          {post.categories.map((cat) => (
            <Link key={cat.id} href={`/blog?categoria=${cat.slug}`}>
              <Badge variant="gold">
                <Tag className="mr-1 size-3" />
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-brand-950 sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-gold-600" />
            <time dateTime={publishedDate.toISOString()}>
              {formatDate(publishedDate)}
            </time>
          </span>
          {post.authorName && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4 text-gold-600" />
              {post.authorName}
            </span>
          )}
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_300px]">
        <div>
          {post.excerpt && (
            <p className="mb-6 border-l-4 border-gold-400 pl-4 text-lg italic text-slate-600">
              {post.excerpt}
            </p>
          )}
          <RichContent html={post.content} />

          <div className="mt-12 border-t border-slate-100 pt-6">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="size-4" />
                Ver todas as publicações
              </Link>
            </Button>
          </div>
        </div>

        {others.length > 0 && (
          <aside>
            <h2 className="font-display text-lg font-semibold text-brand-950">
              Outras publicações
            </h2>
            <ul className="mt-4 space-y-4">
              {others.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-gold-300"
                  >
                    <p className="text-xs text-slate-500">
                      {formatDate(item.publishedAt ?? item.createdAt)}
                    </p>
                    <p className="mt-1 font-medium leading-snug text-brand-950">
                      {item.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
