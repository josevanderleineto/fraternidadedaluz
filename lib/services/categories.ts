import "server-only";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { sanitizeText } from "@/lib/security/security";
import { buildUniqueSlug } from "@/lib/services/slug";
import type { CategoryInput } from "@/lib/validation/schemas";

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
};

export async function listCategories(): Promise<CategoryWithCount[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    postCount: c._count.posts,
  }));
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

async function resolveSlug(input: CategoryInput, excludeId?: string) {
  const base = slugify(input.slug || input.name);
  return buildUniqueSlug(base, async (candidate) => {
    const found = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(found && found.id !== excludeId);
  });
}

export async function createCategory(input: CategoryInput) {
  const slug = await resolveSlug(input);
  return prisma.category.create({
    data: {
      name: sanitizeText(input.name),
      slug,
      description: input.description ? sanitizeText(input.description) : null,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const slug = await resolveSlug(input, id);
  return prisma.category.update({
    where: { id },
    data: {
      name: sanitizeText(input.name),
      slug,
      description: input.description ? sanitizeText(input.description) : null,
    },
  });
}

/**
 * Exclui uma categoria. O relacionamento PostCategory usa `onDelete: Cascade`,
 * então os vínculos são removidos sem deixar publicações inconsistentes.
 */
export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
