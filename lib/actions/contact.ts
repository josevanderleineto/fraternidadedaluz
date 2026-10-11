"use server";

import { headers } from "next/headers";

import { contactSchema, toFieldErrors, type ActionState } from "@/lib/validation/schemas";
import { createContactMessage } from "@/lib/services/contact";
import { getClientIp, hashIp, rateLimit } from "@/lib/security/rate-limit";

/**
 * Recebe o formulário público de contato.
 * Inclui validação (Zod), campo-armadilha anti-spam e limitação de requisições.
 */
export async function submitContact(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  // Campo-armadilha: se preenchido, é um robô. Finge sucesso e ignora.
  if (raw.website && raw.website.length > 0) {
    return { success: true, message: "Mensagem enviada com sucesso." };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos destacados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const limit = rateLimit(`contact:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.success) {
    return {
      success: false,
      message:
        "Muitas mensagens enviadas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    };
  }

  try {
    await createContactMessage(parsed.data, {
      ipHash: await hashIp(ip),
      userAgent: hdrs.get("user-agent") ?? undefined,
    });

    return {
      success: true,
      message:
        "Mensagem enviada com sucesso! Em breve entraremos em contato.",
    };
  } catch {
    return {
      success: false,
      message:
        "Não foi possível enviar sua mensagem agora. Tente novamente mais tarde.",
    };
  }
}
