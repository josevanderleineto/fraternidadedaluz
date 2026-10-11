import "server-only";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security/security";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "@/lib/validation/schemas";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export async function listUsers(): Promise<AdminUser[]> {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function createUser(input: UserCreateInput) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      active: input.active,
    },
    select: { id: true },
  });
}

export async function updateUser(id: string, input: UserUpdateInput) {
  const data: {
    name: string;
    email: string;
    role: "ADMIN" | "EDITOR";
    active: boolean;
    passwordHash?: string;
  } = {
    name: input.name,
    email: input.email,
    role: input.role,
    active: input.active,
  };

  if (input.password && input.password.length > 0) {
    data.passwordHash = await hashPassword(input.password);
  }

  return prisma.user.update({ where: { id }, data, select: { id: true } });
}

export async function touchLastLogin(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  } catch {
    // Ignora falhas ao registrar o último acesso.
  }
}

/**
 * Exclui um usuário, protegendo contra remover a si mesmo ou o último ADMIN
 * ativo (evita ficar sem administradores no sistema).
 */
export async function deleteUser(
  id: string,
  actingUserId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (id === actingUserId) {
    return { ok: false, reason: "Você não pode excluir a própria conta." };
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return { ok: false, reason: "Usuário não encontrado." };
  }

  if (target.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true },
    });
    if (activeAdmins <= 1) {
      return {
        ok: false,
        reason: "É necessário manter ao menos um administrador ativo.",
      };
    }
  }

  await prisma.user.delete({ where: { id } });
  return { ok: true };
}
