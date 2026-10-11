import "server-only";

import { prisma } from "@/lib/db";
import { sanitizeText } from "@/lib/security/security";
import type { ContactInput } from "@/lib/validation/schemas";

export async function createContactMessage(
  input: ContactInput,
  meta: { ipHash?: string; userAgent?: string } = {},
) {
  return prisma.contactMessage.create({
    data: {
      name: sanitizeText(input.name),
      email: input.email,
      subject: sanitizeText(input.subject),
      message: sanitizeText(input.message),
      ipHash: meta.ipHash ?? null,
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
    },
  });
}

export async function listMessages(
  params: {
    page?: number;
    perPage?: number;
    filter?: "all" | "unread" | "replied";
  } = {},
) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params.perPage ?? 20));
  const filter = params.filter ?? "all";

  const where =
    filter === "unread"
      ? { isRead: false }
      : filter === "replied"
        ? { isReplied: true }
        : {};

  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contactMessage.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getMessage(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } });
}

export async function setMessageRead(id: string, isRead: boolean) {
  return prisma.contactMessage.update({
    where: { id },
    data: { isRead, readAt: isRead ? new Date() : null },
  });
}

export async function setMessageReplied(id: string, isReplied: boolean) {
  return prisma.contactMessage.update({
    where: { id },
    data: { isReplied, repliedAt: isReplied ? new Date() : null },
  });
}

export async function deleteMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } });
}

export async function countUnreadMessages(): Promise<number> {
  try {
    return await prisma.contactMessage.count({ where: { isRead: false } });
  } catch {
    return 0;
  }
}
