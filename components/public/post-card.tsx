import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PostListItem } from "@/lib/services/posts";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-brand-50"
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700">
            <span className="font-display text-3xl text-gold-300">FL</span>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.categories.slice(0, 2).map((cat) => (
            <Badge key={cat.id} variant="gold">
              {cat.name}
            </Badge>
          ))}
        </div>

        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-brand-950">
          <Link href={`/blog/${post.slug}`} className="hover:text-brand-700">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-slate-500">
          <CalendarDays className="size-4 text-gold-600" />
          <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>
            {formatDate(post.publishedAt ?? post.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
