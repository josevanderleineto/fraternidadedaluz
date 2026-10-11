"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  deleteMessage,
  setMessageRead,
  setMessageReplied,
} from "@/lib/services/contact";

/** Marca a mensagem como lida ou não lida. */
export async function toggleMessageReadAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const isRead = String(formData.get("isRead") ?? "") === "true";
  if (!id) redirect("/admin/mensagens?erro=invalido");

  await setMessageRead(id, isRead);
  revalidatePath("/admin/mensagens");
  revalidatePath(`/admin/mensagens/${id}`);
  redirect(`/admin/mensagens/${id}`);
}

/** Marca a mensagem como respondida (ou desfaz a marcação). */
export async function toggleMessageRepliedAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const isReplied = String(formData.get("isReplied") ?? "") === "true";
  if (!id) redirect("/admin/mensagens?erro=invalido");

  await setMessageReplied(id, isReplied);
  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "ContactMessage",
    entityId: id,
    metadata: { isReplied },
  });
  revalidatePath("/admin/mensagens");
  revalidatePath(`/admin/mensagens/${id}`);
  redirect(`/admin/mensagens/${id}`);
}

/** Exclui uma mensagem recebida. */
export async function deleteMessageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/mensagens?erro=invalido");

  try {
    await deleteMessage(id);
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "ContactMessage",
      entityId: id,
    });
  } catch {
    redirect("/admin/mensagens?erro=exclusao");
  }

  revalidatePath("/admin/mensagens");
  redirect("/admin/mensagens?ok=excluido");
}
