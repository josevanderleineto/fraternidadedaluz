"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginSchema, toFieldErrors, type ActionState } from "@/lib/validation/schemas";
import { getUserByEmail, touchLastLogin } from "@/lib/services/users";
import { verifyPassword } from "@/lib/security/security";
import { createSession, destroySession } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/dal";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { recordAudit } from "@/lib/audit";

/**
 * Autenticação do painel.
 * - Validação de entrada (Zod)
 * - Limitação de tentativas por IP
 * - Mensagem de erro genérica (não revela se o e-mail existe)
 * - Auditoria de tentativas
 */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os dados informados.",
      errors: toFieldErrors(parsed.error),
    };
  }

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const limitKey = `login:${ip}`;

  const limit = rateLimit(limitKey, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.success) {
    const minutes = Math.ceil(limit.retryAfterMs / 60000);
    return {
      success: false,
      message: `Muitas tentativas de login. Tente novamente em aproximadamente ${minutes} minuto(s).`,
    };
  }

  const genericError: ActionState = {
    success: false,
    message: "E-mail ou senha inválidos.",
  };

  let user;
  try {
    user = await getUserByEmail(parsed.data.email);
  } catch {
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
    };
  }

  if (!user || !user.active) {
    await recordAudit({
      userId: user?.id ?? null,
      action: "LOGIN_FALHA",
      entity: "User",
      entityId: user?.id ?? null,
      metadata: { email: parsed.data.email },
    });
    return genericError;
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    await recordAudit({
      userId: user.id,
      action: "LOGIN_FALHA",
      entity: "User",
      entityId: user.id,
    });
    return genericError;
  }

  resetRateLimit(limitKey);

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await touchLastLogin(user.id);
  await recordAudit({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
  });

  redirect("/admin");
}

/** Encerra a sessão atual. */
export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await recordAudit({
      userId: user.id,
      action: "LOGOUT",
      entity: "User",
      entityId: user.id,
    });
  }
  await destroySession();
  redirect("/admin/login");
}
