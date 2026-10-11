import "server-only";

import { prisma } from "@/lib/db";

/**
 * Registro de auditoria das ações administrativas relevantes.
 * Nunca lança erro para não interromper a operação principal.
 */
export async function recordAudit(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        metadata: params.metadata
          ? (JSON.parse(JSON.stringify(params.metadata)) as object)
          : undefined,
      },
    });
  } catch {
    // Auditoria não deve quebrar a operação do usuário.
  }
}
