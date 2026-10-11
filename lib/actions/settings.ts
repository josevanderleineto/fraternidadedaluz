"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/audit";
import {
  settingsSchema,
  toFieldErrors,
  type ActionState,
} from "@/lib/validation/schemas";
import { updateSiteSettings } from "@/lib/services/settings";

function parseSettingsForm(formData: FormData) {
  return {
    siteName: String(formData.get("siteName") ?? ""),
    lodgeName: String(formData.get("lodgeName") ?? ""),
    lodgeNumber: String(formData.get("lodgeNumber") ?? ""),
    jurisdictionName: String(formData.get("jurisdictionName") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    logoPublicId: String(formData.get("logoPublicId") ?? ""),
    description: String(formData.get("description") ?? ""),
    shortAbout: String(formData.get("shortAbout") ?? ""),
    address: String(formData.get("address") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    youtubeUrl: String(formData.get("youtubeUrl") ?? ""),
    footerText: String(formData.get("footerText") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
  };
}

/**
 * Atualiza as configurações institucionais. Somente ADMIN.
 * As alterações refletem no site imediatamente (sem novo deploy).
 */
export async function updateSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ADMIN");

  const parsed = settingsSchema.safeParse(parseSettingsForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    await updateSiteSettings(parsed.data);
    await recordAudit({
      userId: user.id,
      action: "SETTINGS_UPDATE",
      entity: "SiteSettings",
      entityId: "singleton",
    });
  } catch {
    return {
      success: false,
      message: "Não foi possível salvar as configurações.",
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/configuracoes");
  return { success: true, message: "Configurações salvas com sucesso." };
}
