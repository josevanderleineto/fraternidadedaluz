"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  postSchema,
  toFieldErrors,
  type ActionState,
} from "@/lib/validation/schemas";
import {
  createPost,
  deletePost,
  updatePost,
} from "@/lib/services/posts";

function parsePostForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    coverImageAlt: String(formData.get("coverImageAlt") ?? ""),
    keywords: String(formData.get("keywords") ?? ""),
    status: String(formData.get("status") ?? "DRAFT"),
    publishedAt: String(formData.get("publishedAt") ?? ""),
    categoryIds: formData
      .getAll("categoryIds")
      .map((v) => String(v))
      .filter(Boolean),
  };
}

function revalidatePostPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = postSchema.safeParse(parsePostForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  let result: { id: string; slug: string };
  try {
    result = await createPost(parsed.data, user.id);
  } catch {
    return {
      success: false,
      message:
        "Não foi possível salvar a publicação. Verifique os dados e tente novamente.",
    };
  }

  await recordAudit({
    userId: user.id,
    action: "CREATE",
    entity: "Post",
    entityId: result.id,
    metadata: { slug: result.slug, status: parsed.data.status },
  });

  revalidatePostPaths(result.slug);
  redirect("/admin/posts?ok=criado");
}

export async function updatePostAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = postSchema.safeParse(parsePostForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  let result: { id: string; slug: string };
  try {
    result = await updatePost(id, parsed.data);
  } catch {
    return {
      success: false,
      message: "Não foi possível atualizar a publicação.",
    };
  }

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Post",
    entityId: id,
    metadata: { slug: result.slug, status: parsed.data.status },
  });

  revalidatePostPaths(result.slug);
  redirect("/admin/posts?ok=atualizado");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/posts?erro=invalido");

  try {
    await deletePost(id);
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "Post",
      entityId: id,
    });
  } catch {
    redirect("/admin/posts?erro=exclusao");
  }

  revalidatePostPaths();
  redirect("/admin/posts?ok=excluido");
}
