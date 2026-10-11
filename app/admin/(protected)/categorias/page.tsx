import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/category-manager";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/services/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorias",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requireUser();
  const categories = await listCategories();

  return <CategoryManager categories={categories} />;
}
