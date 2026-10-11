import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Data Access Layer (DAL) de autenticação/autorização.
 *
 * Toda leitura/escrita protegida passa por aqui. Seguindo as recomendações do
 * Next.js, a verificação de sessão acontece próxima à fonte de dados — não
 * apenas escondendo botões na interface.
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Retorna o usuário autenticado (ou null). A sessão é validada contra o banco,
 * garantindo que usuários desativados/excluídos percam acesso imediatamente.
 * `cache` evita consultas repetidas durante um mesmo render.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  if (!session.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    // Falha de conexão: trata como não autenticado, sem vazar detalhes.
    return null;
  }
});

/** Exige um usuário autenticado; redireciona para o login caso contrário. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

/** Exige uma função específica (ex.: ADMIN). */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (role === "ADMIN" && user.role !== "ADMIN") {
    redirect("/admin?erro=sem-permissao");
  }
  return user;
}

/** Verifica, sem redirecionar, se o usuário tem determinada função. */
export function hasRole(user: SessionUser | null, role: Role): boolean {
  if (!user) return false;
  return role === "ADMIN" ? user.role === "ADMIN" : true;
}
