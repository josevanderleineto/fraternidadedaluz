import "server-only";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { sanitizeContent, sanitizeText } from "@/lib/security/security";
import { buildUniqueSlug } from "@/lib/services/slug";
import type { PageInput } from "@/lib/validation/schemas";

// These routes already have links and dedicated pages in the public site.
// Content with one of these slugs can still power its respective route (for
// example, `/sobre`), but must not be added to the dynamic navigation list.
const STATIC_PUBLIC_PAGE_SLUGS = [
  "sobre",
  "blog",
  "contato",
  "privacidade",
  "termos",
  "admin",
];

export type PageListItem = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  showInMenu: boolean;
  menuOrder: number;
  updatedAt: Date;
};

/** Busca uma página publicada pelo slug (site público). */
export async function getPublishedPageBySlug(slug: string) {
  const page = await prisma.page.findFirst({
    where: { slug, published: true },
  });
  if (!page) return null;

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  };
}

/** Páginas publicadas marcadas para aparecer no menu. */
export async function listMenuPages() {
  try {
    return await prisma.page.findMany({
      where: {
        published: true,
        showInMenu: true,
        slug: { notIn: STATIC_PUBLIC_PAGE_SLUGS },
      },
      orderBy: [{ menuOrder: "asc" }, { title: "asc" }],
      select: { title: true, slug: true },
    });
  } catch {
    return [];
  }
}

/** Lista slugs de páginas publicadas (usado no sitemap). */
export async function listPublishedPageSlugs() {
  try {
    return await prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    return [];
  }
}

/** Lista todas as páginas (painel). */
export async function listAllPages(): Promise<PageListItem[]> {
  const pages = await prisma.page.findMany({
    orderBy: [{ menuOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      showInMenu: true,
      menuOrder: true,
      updatedAt: true,
    },
  });
  return pages;
}

export async function getPageById(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return null;

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
    published: page.published,
    showInMenu: page.showInMenu,
    menuOrder: page.menuOrder,
  };
}

async function resolveSlug(input: PageInput, excludeId?: string) {
  const base = slugify(input.slug || input.title);
  return buildUniqueSlug(base, async (candidate) => {
    const found = await prisma.page.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(found && found.id !== excludeId);
  });
}

export async function createPage(input: PageInput, userId?: string) {
  const slug = await resolveSlug(input);
  return prisma.page.create({
    data: {
      title: sanitizeText(input.title),
      slug,
      content: sanitizeContent(input.content),
      metaTitle: input.metaTitle ? sanitizeText(input.metaTitle) : null,
      metaDescription: input.metaDescription
        ? sanitizeText(input.metaDescription)
        : null,
      published: input.published,
      publishedAt: input.published ? new Date() : null,
      showInMenu: input.showInMenu,
      menuOrder: input.menuOrder,
      updatedById: userId ?? null,
    },
    select: { id: true, slug: true },
  });
}

export async function updatePage(id: string, input: PageInput, userId?: string) {
  const slug = await resolveSlug(input, id);
  const existing = await prisma.page.findUnique({
    where: { id },
    select: { published: true, publishedAt: true },
  });

  const publishedAt =
    input.published && !existing?.publishedAt
      ? new Date()
      : input.published
        ? existing?.publishedAt
        : existing?.publishedAt ?? null;

  return prisma.page.update({
    where: { id },
    data: {
      title: sanitizeText(input.title),
      slug,
      content: sanitizeContent(input.content),
      metaTitle: input.metaTitle ? sanitizeText(input.metaTitle) : null,
      metaDescription: input.metaDescription
        ? sanitizeText(input.metaDescription)
        : null,
      published: input.published,
      publishedAt,
      showInMenu: input.showInMenu,
      menuOrder: input.menuOrder,
      updatedById: userId ?? null,
    },
    select: { id: true, slug: true },
  });
}

export async function deletePage(id: string) {
  return prisma.page.delete({ where: { id } });
}
