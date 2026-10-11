"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  pageSchema,
  toFieldErrors,
  type ActionState,
} from "@/lib/validation/schemas";
import {
  createPage,
  deletePage,
  updatePage,
} from "@/lib/services/pages";

function parsePageForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    content: String(formData.get("content") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    showInMenu: formData.get("showInMenu") === "on" || formData.get("showInMenu") === "true",
    menuOrder: Number(formData.get("menuOrder") ?? 0),
  };
}

function revalidatePagePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/paginas");
  if (slug) revalidatePath(`/${slug}`);
}

export async function createPageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = pageSchema.safeParse(parsePageForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  let result: { id: string; slug: string };
  try {
    result = await createPage(parsed.data, user.id);
  } catch {
    return { success: false, message: "Não foi possível criar a página." };
  }

  await recordAudit({
    userId: user.id,
    action: "CREATE",
    entity: "Page",
    entityId: result.id,
    metadata: { slug: result.slug },
  });

  revalidatePagePaths(result.slug);
  redirect("/admin/paginas?ok=criado");
}

export async function updatePageAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = pageSchema.safeParse(parsePageForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  let result: { id: string; slug: string };
  try {
    result = await updatePage(id, parsed.data, user.id);
  } catch {
    return { success: false, message: "Não foi possível atualizar a página." };
  }

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Page",
    entityId: id,
    metadata: { slug: result.slug },
  });

  revalidatePagePaths(result.slug);
  redirect("/admin/paginas?ok=atualizado");
}

export async function deletePageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/paginas?erro=invalido");

  try {
    await deletePage(id);
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "Page",
      entityId: id,
    });
  } catch {
    redirect("/admin/paginas?erro=exclusao");
  }

  revalidatePagePaths();
  redirect("/admin/paginas?ok=excluido");
}
