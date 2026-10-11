import "server-only";

import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

import { getEnv } from "@/lib/env";
import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Dados mínimos guardados na sessão. O cookie é assinado e criptografado pelo
 * iron-session, portanto não fica legível nem adulterável pelo cliente.
 */
export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: Role;
};

export const SESSION_COOKIE_NAME = "fdl_session";

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

function sessionOptions() {
  const env = getEnv();
  return {
    password: env.SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    ttl: SEVEN_DAYS_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SEVEN_DAYS_SECONDS,
    },
  };
}

/** Recupera a sessão (criptografada) dos cookies. */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

/** Grava os dados do usuário na sessão e persiste o cookie. */
export async function createSession(data: Required<SessionData>): Promise<void> {
  const session = await getSession();
  session.userId = data.userId;
  session.email = data.email;
  session.name = data.name;
  session.role = data.role;
  await session.save();
}

/** Remove a sessão (logout). */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
