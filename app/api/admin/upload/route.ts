import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/dal";
import { isStorageConfigured } from "@/lib/env";
import { uploadImage, validateImageFile } from "@/lib/storage/cloudinary";
import { createMediaRecord } from "@/lib/services/media";
import { recordAudit } from "@/lib/audit";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upload de imagens para o armazenamento externo (Cloudinary).
 * Somente usuários autenticados; valida tipo e tamanho; limita requisições.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 },
    );
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "O armazenamento de imagens não está configurado. Defina as variáveis CLOUDINARY_* no ambiente.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`upload:${user.id}:${ip}`, {
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Muitos uploads em pouco tempo. Aguarde e tente novamente." },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 },
    );
  }

  const alt = formData.get("alt");

  // Validação de formato/tamanho: mensagens amigáveis e controladas.
  try {
    validateImageFile(file);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message
            ? error.message
            : "Arquivo inválido.",
      },
      { status: 400 },
    );
  }

  try {
    const image = await uploadImage(file);
    const media = await createMediaRecord(
      image,
      user.id,
      typeof alt === "string" && alt.trim() ? alt.trim() : undefined,
    );

    await recordAudit({
      userId: user.id,
      action: "UPLOAD",
      entity: "Media",
      entityId: media.id,
      metadata: { format: image.format, bytes: image.bytes },
    });

    return NextResponse.json({
      id: media.id,
      url: image.secureUrl,
      alt: media.alt ?? "",
    });
  } catch (error) {
    // Registra no servidor, mas NÃO expõe detalhes internos ao cliente.
    console.error("Falha no upload de mídia:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem. Tente novamente." },
      { status: 502 },
    );
  }
}
