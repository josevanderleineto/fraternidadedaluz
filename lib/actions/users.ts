"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  toFieldErrors,
  userCreateSchema,
  userUpdateSchema,
  type ActionState,
} from "@/lib/validation/schemas";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/lib/services/users";

function parseUserForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "EDITOR"),
    active:
      formData.get("active") === "on" || formData.get("active") === "true",
  };
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const acting = await requireRole("ADMIN");

  const parsed = userCreateSchema.safeParse(parseUserForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    const user = await createUser(parsed.data);
    await recordAudit({
      userId: acting.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      metadata: { role: parsed.data.role },
    });
  } catch {
    return {
      success: false,
      message:
        "Não foi possível criar o usuário. Verifique se o e-mail já está cadastrado.",
    };
  }

  revalidatePath("/admin/usuarios");
  return { success: true, message: "Usuário criado com sucesso." };
}

export async function updateUserAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const acting = await requireRole("ADMIN");

  const parsed = userUpdateSchema.safeParse(parseUserForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  // Evita que o próprio administrador se desative ou perca a função.
  if (id === acting.id && (parsed.data.role !== "ADMIN" || !parsed.data.active)) {
    return {
      success: false,
      message:
        "Você não pode remover a própria função de administrador nem desativar a própria conta.",
    };
  }

  try {
    await updateUser(id, parsed.data);
    await recordAudit({
      userId: acting.id,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      metadata: { role: parsed.data.role, active: parsed.data.active },
    });
  } catch {
    return {
      success: false,
      message:
        "Não foi possível atualizar o usuário. Verifique se o e-mail já está em uso.",
    };
  }

  revalidatePath("/admin/usuarios");
  return { success: true, message: "Usuário atualizado com sucesso." };
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const acting = await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/usuarios?erro=invalido");

  const result = await deleteUser(id, acting.id);
  if (!result.ok) {
    redirect(
      `/admin/usuarios?erro=${encodeURIComponent(result.reason)}`,
    );
  }

  await recordAudit({
    userId: acting.id,
    action: "DELETE",
    entity: "User",
    entityId: id,
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?ok=excluido");
}
