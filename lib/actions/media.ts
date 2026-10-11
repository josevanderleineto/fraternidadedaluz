"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import { deleteMediaRecord } from "@/lib/services/media";

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/midia?erro=invalido");

  try {
    await deleteMediaRecord(id);
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "Media",
      entityId: id,
    });
  } catch {
    redirect("/admin/midia?erro=exclusao");
  }

  revalidatePath("/admin/midia");
  revalidatePath("/");
  redirect("/admin/midia?ok=excluido");
}
