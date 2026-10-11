import "server-only";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { sanitizeContent, sanitizeText } from "@/lib/security/security";
import { buildUniqueSlug } from "@/lib/services/slug";
import type { PostInput } from "@/lib/validation/schemas";
import { PostStatus } from "@/lib/generated/prisma/enums";

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  categories: { id: string; name: string; slug: string }[];
};

/**
 * Condição que define uma publicação visível publicamente.
 * Considera PUBLISHED e também SCHEDULED cuja data já passou (agendamento
 * confiável do ponto de vista de leitura: nunca expõe conteúdo futuro).
 */
export function publicPostWhere() {
  const now = new Date();
  return {
    AND: [
      {
        status: { in: [PostStatus.PUBLISHED, PostStatus.SCHEDULED] },
      },
      {
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
    ],
  };
}

function mapPost(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  categories: { category: { id: string; name: string; slug: string } }[];
}): PostListItem {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    status: post.status,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    categories: post.categories.map((pc) => pc.category),
  };
}

/** Listagem pública paginada, com busca por título/conteúdo e filtro de categoria. */
export async function listPublishedPosts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  categorySlug?: string;
}) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(50, Math.max(1, params.perPage ?? 9));
  const search = params.search?.trim();

  const where = {
    ...publicPostWhere(),
    ...(search
      ? {
          AND: [
            ...publicPostWhere().AND,
            {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { excerpt: { contains: search, mode: "insensitive" as const } },
                { content: { contains: search, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : {}),
    ...(params.categorySlug
      ? { categories: { some: { category: { slug: params.categorySlug } } } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        categories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    items: rows.map(mapPost),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Busca uma publicação publicada pelo slug (para a página individual). */
export async function getPublishedPostBySlug(slug: string) {
  const post = await prisma.post.findFirst({
    where: { slug, ...publicPostWhere() },
    include: {
      author: { select: { name: true } },
      categories: {
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    keywords: post.keywords,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorName: post.author?.name ?? null,
    categories: post.categories.map((pc) => pc.category),
  };
}

/** Lista todos os slugs publicados (usado no sitemap e em generateStaticParams). */
export async function listPublishedPostSlugs() {
  try {
    const posts = await prisma.post.findMany({
      where: publicPostWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    });
    return posts;
  } catch {
    return [];
  }
}

/* ============================ Área administrativa ========================= */

export async function listAllPosts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: PostStatus | "ALL";
}) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 15));
  const search = params.search?.trim();

  const where = {
    ...(params.status && params.status !== "ALL"
      ? { status: params.status }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        author: { select: { name: true } },
        categories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      ...mapPost(row),
      authorName: row.author?.name ?? null,
      updatedAt: row.updatedAt,
    })),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { categories: { select: { categoryId: true } } },
  });
  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? "",
    coverImageAlt: post.coverImageAlt ?? "",
    keywords: post.keywords ?? "",
    status: post.status,
    publishedAt: post.publishedAt,
    categoryIds: post.categories.map((c) => c.categoryId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

async function resolveSlug(input: PostInput, excludeId?: string) {
  const base = slugify(input.slug || input.title);
  return buildUniqueSlug(base, async (candidate) => {
    const found = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(found && found.id !== excludeId);
  });
}

function computePublishedAt(input: PostInput): Date | null {
  if (input.status === PostStatus.DRAFT) {
    return input.publishedAt ? new Date(input.publishedAt) : null;
  }
  if (input.publishedAt) return new Date(input.publishedAt);
  // PUBLICADO sem data informada: publica imediatamente.
  return input.status === PostStatus.PUBLISHED ? new Date() : null;
}

export async function createPost(input: PostInput, authorId?: string) {
  const slug = await resolveSlug(input);

  return prisma.post.create({
    data: {
      title: sanitizeText(input.title),
      slug,
      excerpt: input.excerpt ? sanitizeText(input.excerpt) : null,
      content: sanitizeContent(input.content),
      coverImageUrl: input.coverImageUrl || null,
      coverImageAlt: input.coverImageAlt ? sanitizeText(input.coverImageAlt) : null,
      keywords: input.keywords ? sanitizeText(input.keywords) : null,
      status: input.status,
      publishedAt: computePublishedAt(input),
      authorId: authorId ?? null,
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    select: { id: true, slug: true },
  });
}

export async function updatePost(id: string, input: PostInput) {
  const slug = await resolveSlug(input, id);

  // Substitui as categorias de forma transacional (remove as antigas e cria as novas).
  return prisma.$transaction(async (tx) => {
    await tx.postCategory.deleteMany({ where: { postId: id } });

    return tx.post.update({
      where: { id },
      data: {
        title: sanitizeText(input.title),
        slug,
        excerpt: input.excerpt ? sanitizeText(input.excerpt) : null,
        content: sanitizeContent(input.content),
        coverImageUrl: input.coverImageUrl || null,
        coverImageAlt: input.coverImageAlt
          ? sanitizeText(input.coverImageAlt)
          : null,
        keywords: input.keywords ? sanitizeText(input.keywords) : null,
        status: input.status,
        publishedAt: computePublishedAt(input),
        categories: {
          create: input.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      select: { id: true, slug: true },
    });
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
