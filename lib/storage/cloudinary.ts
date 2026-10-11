import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { getEnv, isStorageConfigured } from "@/lib/env";

/**
 * Integração com armazenamento de objetos (Cloudinary).
 *
 * A Vercel NÃO possui sistema de arquivos persistente, então as imagens são
 * enviadas para um serviço externo. As credenciais vêm de variáveis de ambiente.
 */

/** Tipos de imagem aceitos no upload. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** Tamanho máximo por arquivo: 5 MB. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type UploadedImage = {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string | null;
  resourceType: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  originalName: string;
};

function configure(): void {
  const env = getEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Garante que o armazenamento esteja configurado. */
export function assertStorageConfigured(): void {
  if (!isStorageConfigured()) {
    throw new Error(
      "Armazenamento de imagens não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.",
    );
  }
}

/** Valida tipo e tamanho do arquivo enviado. */
export function validateImageFile(file: File): void {
  if (!file || file.size === 0) {
    throw new Error("Nenhum arquivo enviado.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error(
      "Formato não permitido. Envie JPG, PNG, WEBP, GIF ou AVIF.",
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Arquivo muito grande. O limite é 5 MB.");
  }
}

/** Faz o upload de uma imagem e retorna seus metadados. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  assertStorageConfigured();
  validateImageFile(file);
  configure();

  const env = getEnv();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, response) => {
        if (error || !response) {
          reject(error ?? new Error("Falha no upload da imagem."));
          return;
        }
        resolve(response);
      },
    );
    stream.end(buffer);
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: result.format ?? null,
    resourceType: result.resource_type ?? "image",
    width: result.width ?? null,
    height: result.height ?? null,
    bytes: result.bytes ?? null,
    originalName: file.name,
  };
}

/** Remove uma imagem do armazenamento externo. */
export async function deleteImage(publicId: string): Promise<void> {
  if (!isStorageConfigured()) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // Não falha a operação por causa da exclusão remota.
  }
}
