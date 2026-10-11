"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  categorySchema,
  toFieldErrors,
  type ActionState,
} from "@/lib/validation/schemas";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/services/categories";

function parseCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
  };
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categorias");
  revalidatePath("/blog");
  revalidatePath("/");
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const category = await createCategory(parsed.data);
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      metadata: { slug: category.slug },
    });
    revalidateCategoryPaths();
    return { success: true, message: "Categoria criada com sucesso." };
  } catch {
    return {
      success: false,
      message: "Não foi possível criar a categoria.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const category = await updateCategory(id, parsed.data);
    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      entity: "Category",
      entityId: id,
      metadata: { slug: category.slug },
    });
    revalidateCategoryPaths();
    return { success: true, message: "Categoria atualizada com sucesso." };
  } catch {
    return {
      success: false,
      message: "Não foi possível atualizar a categoria.",
    };
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/categorias?erro=invalido");

  try {
    await deleteCategory(id);
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "Category",
      entityId: id,
    });
  } catch {
    redirect("/admin/categorias?erro=exclusao");
  }

  revalidateCategoryPaths();
  redirect("/admin/categorias?ok=excluido");
}
